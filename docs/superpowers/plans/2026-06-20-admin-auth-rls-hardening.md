# Admin Auth + RLS Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock the live Supabase database so only the authenticated admin can write, while the public storefront keeps reading everything with no session — by moving `/admin` to Supabase Auth, locking RLS writes, and dropping the plaintext `admin_users` table.

**Architecture:** One shared `supabase` client already serves both storefront and admin. After `signInWithPassword`, that same client carries the admin JWT (`role: authenticated`) on every request; the storefront never logs in, so it stays `role: anon`. This lets write policies require `authenticated` without touching any storefront read. Real auth is extracted into a small `useAdminAuth()` hook (matching the existing `useProducts`/`useAutoplayAllowed` hook pattern) so the session logic is testable in isolation. DB changes are sequenced so writes are never locked before the new auth is proven, with a fast SQL rollback at every step.

**Tech Stack:** React 19, `@supabase/supabase-js` ^2.106, Jest + React Testing Library ^16 (`renderHook`), Supabase Auth + Postgres RLS.

**Spec:** `docs/superpowers/specs/2026-06-20-admin-auth-rls-hardening-design.md`

---

## ⚠️ Client handoff (do not skip — surfaced per Edgar's instruction)

**Login becomes email-keyed, not username.** Before the Phase 1 code reaches the
client's live admin, Edgar must send the client the **new email + password** for
the Supabase Auth admin account created in Phase 0. The old `username` login keeps
working as a fallback only through Phase 1–2; once Phase 3 drops `admin_users`,
**the email login is the only way in.** This handoff is a hard prerequisite for
the Phase 3 cutover and is repeated in the Phase 3 gate.

---

## Phase 0 — Supabase dashboard prep (MANUAL — Edgar, against production)

No app code ships in this phase; nothing in the live app changes. RLS stays open.

- [ ] **Step 1: Create the one admin account**
  Dashboard → Authentication → Users → **Add user** → real email + a strong
  password. (This email is what the client will type to log in.)

- [ ] **Step 2: Verify the account can sign in**
  Dashboard → Authentication → Users shows the user. Optionally confirm via the
  dashboard that the credentials work. Note the user's UID (for reference only;
  policies use the role, not the UID).

- [ ] **Step 3: Disable public signups**
  Authentication → Sign In / Providers → turn **off** "Allow new users to sign
  up". This guarantees the `authenticated` role can only ever be this one admin.

- [ ] **Step 4: Choose a strong admin password; note leaked-password skip**
  Leaked-password protection (HaveIBeenPwned) is **Pro-plan only** on Supabase and
  this project is on the **free tier**, so it is **deliberately skipped** —
  mitigated by manually setting a **strong, unique admin password** in Step 1.
  (Recorded as an intentional tier constraint, like the Vercel/Edge/CAPTCHA calls,
  not an oversight.) Confirm the default Supabase Auth login rate limits are active.

- [ ] **Step 5: Hand the new email credentials to the client** (see callout above).

**Verify:** the live storefront and the current admin login both still work
(nothing shipped yet). **Rollback:** delete the test user; production unchanged.

---

## Phase 1 — Real auth in code (RLS stays OPEN → lockout impossible)

In this phase RLS is unchanged, so even a broken login cannot lock anyone out of
data, and the `admin_users` fallback still opens the UI.

### Task 1: `useAdminAuth()` hook

**Files:**
- Create: `src/hooks/useAdminAuth.js`
- Test: `src/hooks/useAdminAuth.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/hooks/useAdminAuth.test.js
import { renderHook, act } from '@testing-library/react';

jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithPassword: jest.fn(() => Promise.resolve({ data: { session: { user: {} } }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

import { supabase } from '../supabase';
import { useAdminAuth } from './useAdminAuth';

let authCb;
beforeEach(() => {
  jest.clearAllMocks();
  supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
  supabase.auth.onAuthStateChange.mockImplementation((cb) => {
    authCb = cb;
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  });
});

test('starts unauthenticated when there is no session', async () => {
  const { result } = renderHook(() => useAdminAuth());
  await act(async () => {}); // flush getSession
  expect(result.current.authed).toBe(false);
});

test('rehydrates an existing session on mount', async () => {
  supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } });
  const { result } = renderHook(() => useAdminAuth());
  await act(async () => {});
  expect(result.current.authed).toBe(true);
});

test('flips authed true when a session arrives via onAuthStateChange', async () => {
  const { result } = renderHook(() => useAdminAuth());
  await act(async () => {});
  expect(result.current.authed).toBe(false);
  await act(async () => { authCb('SIGNED_IN', { user: { id: 'u1' } }); });
  expect(result.current.authed).toBe(true);
});

test('login calls signInWithPassword with email + password', async () => {
  const { result } = renderHook(() => useAdminAuth());
  await act(async () => {});
  await act(async () => { await result.current.login('a@b.com', 'pw'); });
  expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pw' });
});

test('logout calls signOut and clears authed', async () => {
  supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } });
  const { result } = renderHook(() => useAdminAuth());
  await act(async () => {});
  expect(result.current.authed).toBe(true);
  await act(async () => { await result.current.logout(); authCb('SIGNED_OUT', null); });
  expect(supabase.auth.signOut).toHaveBeenCalled();
  expect(result.current.authed).toBe(false);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --watchAll=false src/hooks/useAdminAuth.test.js`
Expected: FAIL — "Cannot find module './useAdminAuth'".

- [ ] **Step 3: Write the minimal hook**

```js
// src/hooks/useAdminAuth.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

// Owns the real Supabase Auth session for /admin. authed derives from a JWT,
// not a boolean. Mirrors the project's hook pattern (useProducts, useAutoplayAllowed).
export function useAdminAuth() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    (email, password) => supabase.auth.signInWithPassword({ email, password }),
    []
  );
  const logout = useCallback(() => supabase.auth.signOut(), []);

  return { authed: !!session, login, logout };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --watchAll=false src/hooks/useAdminAuth.test.js`
Expected: PASS (5 passing).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAdminAuth.js src/hooks/useAdminAuth.test.js
git commit -m "feat(auth): add useAdminAuth hook (session-derived admin auth)"
```

### Task 2: Wire the hook into AdminPage (with temporary `admin_users` fallback)

**Files:**
- Modify: `src/pages/AdminPage.js` (state block ~82-86; `handleLogin` ~149-166; login form ~520-526; logout button ~555)

- [ ] **Step 1: Replace the auth state declarations**

In `AdminPage.js`, replace:
```js
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
```
with:
```js
  const { authed: sessionAuthed, login, logout } = useAdminAuth();
  // TEMP fallback (Phase 1–2 only; removed in Phase 3) so a bug in the new
  // login can never block UI access while RLS is still open.
  const [fallbackAuthed, setFallbackAuthed] = useState(false);
  const authed = sessionAuthed || fallbackAuthed;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
```
Add the import near the other hook imports at the top of the file:
```js
import { useAdminAuth } from '../hooks/useAdminAuth';
```

- [ ] **Step 2: Replace `handleLogin`**

Replace the existing `handleLogin` (the `admin_users` lookup) with:
```js
  // ── Auth ──
  const handleLogin = async () => {
    setLoginError('');
    const { error } = await login(email, password);
    if (!error) return; // real session established; onAuthStateChange flips authed

    // ── TEMPORARY fallback — REMOVE IN PHASE 3 (admin_users legacy login) ──
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', email)
      .eq('password', password)
      .single();
    if (data) {
      setFallbackAuthed(true);
      return;
    }
    // ── end temporary fallback ──

    setLoginError('Invalid email or password');
  };

  const handleLogout = async () => {
    await logout();
    setFallbackAuthed(false);
  };
```
(The existing `useEffect` on `[activeTab, authed]` at ~line 139 loads the active
tab's data when `authed` flips true, so the old eager `loadProducts()/…` calls in
`handleLogin` are no longer needed.)

- [ ] **Step 3: Update the login form (username → email)**

In the `if (!authed)` block (~520-526), replace the username label/input:
```js
          <label className="adm-label">Email</label>
          <input className="adm-input" type="email" placeholder="admin@optimus.co.ke"
            value={email} onChange={e => setEmail(e.target.value)} />
```
Keep the password input, but its `onKeyDown` already calls `handleLogin()` — leave that.

- [ ] **Step 4: Update the logout button**

Replace `onClick={() => setAuthed(false)}` (~line 555) with `onClick={handleLogout}`.

- [ ] **Step 5: Build + lint to confirm no broken references**

Run: `npm run build`
Expected: build succeeds with no `username`/`setAuthed`/`setUsername` undefined errors.

- [ ] **Step 6: Manual verification (against production data, RLS still open)**

Start the dev server (`npm start`) pointed at the live Supabase project and verify:
  1. **Storefront unaffected** — `/`, a category page, a product page, deals, and
     any active promo all render (no code on those paths changed).
  2. **New login works** — at `/admin`, log in with the **Phase 0 email + password**.
     In DevTools console, `await supabase.auth.getSession()` returns a non-null
     session with an `access_token` (a real JWT).
  3. **CRUD still works** (RLS open) — create/edit/delete a throwaway item in each
     tab (Products, Hero Slides, Deals, Promo Video); upload + delete one image.
  4. **Refresh persists** — reload `/admin`; you stay logged in (session rehydrated).
  5. **Logout** — the Logout button returns you to the login screen.

- [ ] **Step 7: Commit**

```bash
git add src/pages/AdminPage.js
git commit -m "feat(auth): wire AdminPage to Supabase Auth, keep admin_users fallback"
```

**Phase 1 GATE:** the new email login produces a real JWT session AND all four
tabs still CRUD. Do **not** start Phase 2 until this is verified. **Rollback:**
`git revert` the two commits; the `admin_users` login is still present.

---

## Phase 2 — Lock RLS writes (MANUAL SQL — Edgar, against production)

The high-risk, fully-reversible step. Capture known-good policies FIRST so the
rollback restores them exactly — not an improvised guess (per Edgar's instruction).

- [ ] **Step 1: Capture the current (open) policies FIRST — save the output**

Run in the Supabase SQL editor and **save the full result somewhere durable**
(this is the rollback source of truth):
```sql
-- Tables
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where tablename in ('products','hero_slides','deals','promo_video')
order by tablename, cmd;

-- Storage
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by cmd;
```
The `qual`/`with_check` columns give the exact `USING`/`WITH CHECK` of every
existing open policy, and `policyname` gives the names to drop below. **If you do
not capture this, you cannot cleanly roll back.**

- [ ] **Step 2: Lock the four tables**

For each of `products`, `hero_slides`, `deals`, `promo_video`, run (template shows
`products`; substitute the real open-write policy names from Step 1):
```sql
-- Remove the open anon write policies (names from Step 1).
drop policy if exists "<open insert policy name>" on public.products;
drop policy if exists "<open update policy name>" on public.products;
drop policy if exists "<open delete policy name>" on public.products;

-- Public read stays open (recreate explicitly to record intent).
drop policy if exists "public_read_products" on public.products;
create policy "public_read_products" on public.products
  for select to public using (true);

-- Writes require the authenticated admin.
create policy "admin_insert_products" on public.products
  for insert to authenticated with check (true);
create policy "admin_update_products" on public.products
  for update to authenticated using (true) with check (true);
create policy "admin_delete_products" on public.products
  for delete to authenticated using (true);
```
Repeat verbatim for `hero_slides`, `deals`, `promo_video` (swap the table name and
policy-name suffixes). RLS is already enabled on these tables.

- [ ] **Step 3: Lock the three storage buckets**

```sql
-- Public read for the three buckets.
drop policy if exists "public_read_buckets" on storage.objects;
create policy "public_read_buckets" on storage.objects
  for select to public
  using (bucket_id in ('product-images','hero-images','promo-videos'));

-- Drop the open anon write policies on storage.objects (names from Step 1), then:
create policy "admin_write_buckets" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('product-images','hero-images','promo-videos'));
create policy "admin_update_buckets" on storage.objects
  for update to authenticated
  using (bucket_id in ('product-images','hero-images','promo-videos'));
create policy "admin_delete_buckets" on storage.objects
  for delete to authenticated
  using (bucket_id in ('product-images','hero-images','promo-videos'));
```
Leave the existing `promo-videos` bucket `file_size_limit` / `allowed_mime_types`
guards in place — they are orthogonal.

- [ ] **Step 4: STOREFRONT-SAFETY TEST — every read surface, no session**

In a **logged-out / incognito** browser (anon role, no session), load the live
site and confirm **each** read surface still works — not just products:
  - [ ] **products** render with prices (homepage + a category page + a product page) — `useProducts.js`
  - [ ] **hero_slides** carousel displays — `Hero.js`
  - [ ] **deals** section displays — `DealsOfDay.js`
  - [ ] **active promo** displays if one is active (toggle one active in admin first if needed) — `Hero.js`
  - [ ] **product-images** load (product/category cards show images) — bucket SELECT
  - [ ] **hero-images** load (hero slide backgrounds) — bucket SELECT
  - [ ] **promo-videos** poster/video loads for the active promo — bucket SELECT

If ANY surface is blank/broken, **stop and roll back** (Step 7) — a SELECT policy
is wrong.

- [ ] **Step 5: ADMIN-WRITE TEST — with a real session**

Logged in via the Phase 1 **email** login (real JWT), create/edit/delete a
throwaway item in **each** tab and upload+delete one image. All succeed.

- [ ] **Step 6: ANON-WRITE-BLOCKED TEST — confirm the lock bites**

On the public site console (anon key, no session), attempt a write and confirm it
is rejected by RLS:
```js
await supabase.from('products').insert({ sku: 'rls-test', name: 'x' });
// expect: error (row-level security / 403), data null
```

- [ ] **Step 7: Rollback (only if a test fails)**

Re-create the open policies captured in Step 1, e.g.:
```sql
create policy "<original name>" on public.products
  for insert to anon with check (true);
-- …repeat update/delete and the other tables/storage from the saved Step-1 output.
```
Independently, the Supabase dashboard / service role bypasses RLS entirely, so
data is always editable there even mid-rollback — there is no true lockout.

**Phase 2 GATE:** all of Step 4 (every read surface), Step 5 (admin writes), and
Step 6 (anon write blocked) pass.

---

## Phase 3 — Drop `admin_users` + remove the fallback

### "Phase 2 proven" — concrete precondition (per Edgar's instruction)

Do **NOT** start Phase 3 until ALL of the following have been done **in a real
Supabase Auth session** (the temporary `admin_users` fallback must NOT be what
carried you through):

- [ ] Edgar has **logged OUT** of `/admin`.
- [ ] Edgar has **logged back IN via the new email login** (Supabase Auth).
- [ ] In that session, a **full create + edit + delete** succeeded in **each** tab:
      Products, Hero Slides, Deals, Promo Video.
- [ ] The client has been **sent the new email credentials** (handoff callout).

Only once the new path is proven end-to-end in a real session is the fallback
removed and the table dropped.

### Task 3: Remove the temporary fallback from AdminPage

**Files:**
- Modify: `src/pages/AdminPage.js`

- [ ] **Step 1: Delete the fallback state and simplify `authed`**

Replace:
```js
  const { authed: sessionAuthed, login, logout } = useAdminAuth();
  const [fallbackAuthed, setFallbackAuthed] = useState(false);
  const authed = sessionAuthed || fallbackAuthed;
```
with:
```js
  const { authed, login, logout } = useAdminAuth();
```

- [ ] **Step 2: Remove the fallback block from `handleLogin`**

`handleLogin` becomes:
```js
  const handleLogin = async () => {
    setLoginError('');
    const { error } = await login(email, password);
    if (error) setLoginError('Invalid email or password');
    // success: onAuthStateChange flips authed
  };
```
And in `handleLogout`, drop the now-undefined `setFallbackAuthed(false);` line so
it is just `await logout();`.

- [ ] **Step 3: Build to confirm no dead references**

Run: `npm run build`
Expected: success; no references to `fallbackAuthed`, `setFallbackAuthed`, or
`admin_users` remain. Confirm:

Run: `grep -rn "admin_users\|fallbackAuthed" src`
Expected: no matches.

- [ ] **Step 4: Manual verify the email login still works** (it never touched
  `admin_users`): log out, log in via email, confirm a write in one tab succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminPage.js
git commit -m "refactor(auth): remove temporary admin_users fallback login"
```

### Task 4: Drop the table (MANUAL SQL — Edgar)

- [ ] **Step 1:** (optional) export `admin_users` rows if any audit value is wanted
      — the credentials are dead, so this is usually skipped.
- [ ] **Step 2:** run:
```sql
drop table if exists public.admin_users;
```
- [ ] **Step 3: Verify** — the storefront and the email login both still work;
      `select * from pg_tables where tablename = 'admin_users';` returns no rows.

**Rollback:** the code change is `git revert`-able; the table drop is final (only
run it after Phase 1–2 are confirmed and the email login is proven).

---

## Phase 4 — Confirm rate-limiting posture + close out the debt

### Task 5: Update the security-debt record

**Files:**
- Modify: `docs/superpowers/security-debt.md`

- [ ] **Step 1: Confirm Supabase built-ins** (Phase 0): login attempt rate limits
      active, signups disabled, strong admin password set. (Leaked-password
      protection is Pro-only → deliberately skipped on free tier; record the reason.)

- [ ] **Step 2: Mark the debt resolved** — append a "Resolved 2026-06-… by
      `feature/security-hardening`" note recording: admin moved to Supabase Auth;
      RLS writes locked to `authenticated` (reads public); `admin_users` dropped;
      and that **Vercel/Edge-level rate limiting was assessed and intentionally
      skipped** because storefront/admin traffic hits Supabase directly (bypassing
      Vercel) and all writes now require the authenticated admin, so the realistic
      lever is Supabase Auth's built-in protections (per spec §6).

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/security-debt.md
git commit -m "docs: mark admin-auth/RLS security debt resolved"
```

- [ ] **Step 4: Finish the branch** — use superpowers:finishing-a-development-branch
      to open the PR for `feature/security-hardening`.

---

## Self-Review

**Spec coverage:**
- Real admin auth (spec §4) → Phase 1 Tasks 1–2 ✓
- Session-derived state, not boolean (§4) → `useAdminAuth` + `authed = !!session` ✓
- RLS writes locked, reads public, 4 tables + 3 buckets (§5) → Phase 2 Steps 2–3 ✓
- Every-read-surface storefront test + discovery-first rollback (Edgar item 1) → Phase 2 Steps 1, 4, 7 ✓
- Concrete "Phase 2 proven" before dropping admin_users (Edgar item 2) → Phase 3 precondition ✓
- Drop admin_users (§5, decision) → Phase 3 Task 4 ✓
- Rate limiting = built-ins only, document skip (§6, decision) → Phase 4 Task 5 ✓
- Email-login client handoff (Edgar item 3) → top callout + Phase 0 Step 5 + Phase 3 gate ✓
- Lockout safety via ordering + fallback (§7) → RLS open through Phase 1; fallback removed only in Phase 3 ✓

**Placeholder scan:** the only `<…>` tokens are intentional (existing policy names
must come from the Phase 2 Step 1 discovery query — deliberately not guessed).

**Type/name consistency:** `useAdminAuth` returns `{ authed, login, logout }` used
identically in Tasks 2 and 3; `login(email, password)` → `signInWithPassword`
matches the hook and its test; `handleLogin`/`handleLogout` names consistent.
