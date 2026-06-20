# Admin Auth + RLS Hardening — Design Spec

- **Date:** 2026-06-20
- **Branch:** `feature/security-hardening` (off `main`) — separate PR
- **Status:** Draft design → awaiting approval before implementation plan
- **Resolves:** `docs/superpowers/security-debt.md` (the parked auth pass, next item
  after the hero-promo-video feature)

## 1. Summary

Lock the live database so only the admin can write, while the public storefront
keeps reading everything with no session. Three coupled changes plus an honest
rate-limiting assessment:

1. **Real admin auth** — move `/admin` from the plaintext `admin_users`-table
   check to **Supabase Auth** (`signInWithPassword`). React auth state derives
   from a real session/JWT, not a boolean.
2. **RLS write lockdown** — `SELECT` stays public on `products`, `hero_slides`,
   `deals`, `promo_video` and the three storage buckets; `INSERT`/`UPDATE`/
   `DELETE` require the authenticated admin.
3. **Drop `admin_users`** — once Supabase Auth is the source of truth, remove the
   plaintext credentials table entirely.
4. **Rate limiting** — rely on Supabase Auth's built-in protections; document why
   Vercel/Edge-level rate limiting is low-value on this stack and skip it.

**The binding constraint:** this is a LIVE revenue site. Public READ must never
break (products/prices/slides/deals/promo must keep displaying with no session),
and the admin must never be locked out. The execution order below is sequenced so
that **writes are never locked until the new auth is proven working**, and a
fast rollback exists for every DB change.

## 2. Scope

### In scope
- Supabase Auth login in `AdminPage.js` (`signInWithPassword` + session-derived
  auth state), with the old `admin_users` login kept as a labeled fallback until
  the new path is verified.
- RLS policy changes (manual SQL, run by Edgar against production — like the
  promo feature's Phase 0) on `products`, `hero_slides`, `deals`, `promo_video`,
  and `storage.objects` for `product-images` / `hero-images` / `promo-videos`.
- `DROP TABLE admin_users` + removal of the dead login query/state.
- Supabase Auth dashboard config: one admin account, signups disabled, login
  rate limits tuned (leaked-password protection is Pro-only → skipped, see §6).

### Out of scope (scope guard)
- **Storefront read paths are untouched.** `useProducts.js`, `Hero.js`,
  `DealsOfDay.js` keep reading with the anon key — no code change.
- No change to cart, checkout (WhatsApp deep link), SEO/`react-helmet`, the promo
  bandwidth gate, or the existing carousel.
- **No CAPTCHA** on the login form (decided 2026-06-20 — zero friction for the
  mobile-data audience; Supabase built-ins are sufficient).
- No payment/backend server work. No secrets rotation of the committed anon key
  (the anon key is *designed* to be public; the fix is RLS, not hiding the key).

## 3. Current system (verified 2026-06-20)

| Surface | File / line | Role today |
|---------|-------------|------------|
| Single Supabase client (anon key, committed) | `src/supabase.js:6` | Shared by storefront **and** admin |
| Login | `AdminPage.js:149` `handleLogin` | Reads `admin_users` plaintext, sets `authed` boolean (`AdminPage.js:82`) |
| Logout | `AdminPage.js:555` | `setAuthed(false)` |
| Product reads | `src/hooks/useProducts.js:13` | anon `SELECT products` |
| Hero reads | `src/components/Hero.js:76,98` | anon `SELECT hero_slides`, `promo_video` |
| Deals reads | `src/components/DealsOfDay.js:17` | anon `SELECT deals` |
| All writes | `AdminPage.js` (`products`/`hero_slides`/`deals`/`promo_video` insert/update/delete) | anon, **no session** |
| Uploads / deletes | `AdminPage.js:214` upload, `src/lib/storage.js:19` remove | anon storage writes to 3 buckets |
| `admin_users` reads | **only** `AdminPage.js:152` | nowhere else |

**Key enabling fact:** there is one shared `supabase` client. After
`signInWithPassword`, that same client holds the admin JWT (supabase-js persists
the session in `localStorage` and attaches it to every request). So admin writes
automatically carry `role: authenticated`, while the storefront — which never
logs in — keeps sending `role: anon`. This is what lets write policies require
`authenticated` without touching a single storefront read. **No second client is
needed.**

## 4. Auth design

### Login
`handleLogin` becomes:
```js
const { data, error } = await supabase.auth.signInWithPassword({
  email, password,
});
```
- The login form's first field changes from `username` → `email` (Supabase Auth
  is email-keyed). Label updates accordingly; password field unchanged.
- On success, `onAuthStateChange` fires and the session drives `authed` (below).
- On failure, show the existing "Invalid email or password" error. Supabase Auth
  returns a generic error and applies its own attempt rate limiting.

### Auth state derives from the session (not a boolean)
Replace the bare `useState(false)`:
```js
const [session, setSession] = useState(null);
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => setSession(data.session));
  const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
  return () => sub.subscription.unsubscribe();
}, []);
const authed = !!session;   // gate the UI on a real JWT
```
- `getSession()` rehydrates the persisted session on page refresh, so the admin
  stays logged in across reloads (current behavior is preserved/improved).
- Logout becomes `await supabase.auth.signOut()` (clears the session; the
  listener flips `authed` to false).
- The existing `useEffect` that loads each tab `[activeTab, authed]`
  (`AdminPage.js:139`) keeps working unchanged — `authed` is still a boolean.

### Fallback during cutover (lockout protection for UI access)
Per the brief ("keep the old path working until the new one is verified, then
remove it"), **Phase 1 keeps the `admin_users` login as a secondary path** behind
the new Supabase Auth login. It only gates the React UI (it cannot produce a real
session). Its purpose is purely to guarantee UI access if the new login has a bug
*while RLS is still open*. It is removed in Phase 3. Note: once Phase 2 locks
writes, the fallback can still open the UI but its writes will 403 — by then the
real Supabase Auth session is mandatory, which is the intended end state.

## 5. RLS design

### Predicate: `TO authenticated`
Write policies are scoped to the `authenticated` role via `TO authenticated`.
Because **public signups are disabled** (Phase 0), the only way to reach the
`authenticated` role is the one admin account — so `authenticated` == admin. This
is simpler and more robust than pinning to a specific `auth.uid()` (survives an
admin email/password change, and there is exactly one account). Pinning to a UID
is available as a future tightening but is not used now.

### Reads stay public
`SELECT` policies are `TO public USING (true)` on all four tables and on
`storage.objects` for the three buckets. `public` includes both `anon` (the
storefront) and `authenticated` (the admin's own browser), so nothing regresses.

### Tables: `products`, `hero_slides`, `deals`, `promo_video`
Identical policy shape on each. **Run a discovery query first** to get the exact
existing policy names (they were created ad hoc and names may differ):
```sql
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where tablename in ('products','hero_slides','deals','promo_video')
order by tablename, cmd;
```
Then, per table (template — `products` shown; repeat for the other three):
```sql
-- 1. Remove the open write policies (use the names from the discovery query).
drop policy if exists "<existing anon insert policy>" on public.products;
drop policy if exists "<existing anon update policy>" on public.products;
drop policy if exists "<existing anon delete policy>" on public.products;

-- 2. Public read stays open (recreate explicitly so intent is recorded).
drop policy if exists "public_read_products" on public.products;
create policy "public_read_products" on public.products
  for select to public using (true);

-- 3. Writes require the authenticated admin.
create policy "admin_insert_products" on public.products
  for insert to authenticated with check (true);
create policy "admin_update_products" on public.products
  for update to authenticated using (true) with check (true);
create policy "admin_delete_products" on public.products
  for delete to authenticated using (true);

-- RLS is already enabled on these tables; confirm:
-- alter table public.products enable row level security;
```

### Storage buckets: `product-images`, `hero-images`, `promo-videos`
Policies live on `storage.objects`, filtered by `bucket_id`. Buckets stay
**public-read** (so `getPublicUrl` keeps working in `<img>`/`<video>`); only
writes are locked.
```sql
-- Public read for the three buckets (recreate explicitly).
drop policy if exists "public_read_buckets" on storage.objects;
create policy "public_read_buckets" on storage.objects
  for select to public
  using (bucket_id in ('product-images','hero-images','promo-videos'));

-- Drop the open anon write policies (get exact names from pg_policies on
-- storage.objects), then require authenticated for writes:
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
Keep the existing `promo-videos` bucket guards (`file_size_limit`,
`allowed_mime_types`) from the promo feature — they are orthogonal and stay.

### `admin_users`
After the new auth is verified (Phase 3):
```sql
drop table if exists public.admin_users;
```
Dropping it removes the plaintext-credential liability entirely and makes the
"anon can read credentials" problem impossible. (If a paper-trail is ever wanted,
export the rows first — but the credentials are being replaced, so they are dead.)

## 6. Rate limiting / credential protection — honest assessment

Decided 2026-06-20: **built-ins only, no CAPTCHA.** Rationale recorded so it
isn't re-litigated:

- **Vercel-level rate limiting is low-value here.** The storefront and admin both
  call Supabase **directly** (`*.supabase.co`); those requests never pass through
  Vercel, so a Vercel WAF/rate-limit rule cannot see or throttle them. It would
  only rate-limit requests to the static Vercel domain, which aren't the attack
  surface. Skipped deliberately.
- **Edge Functions are not warranted.** They'd only help if we needed a
  server-mediated *anon* write path. After this work, all writes require the
  authenticated admin via RLS, so there is no anon write path to mediate. Adding
  an Edge Function would be infrastructure for infrastructure's sake.
- **What actually protects credentials (and is free):**
  - Supabase Auth's **built-in login rate limiting** (per-IP attempt throttling
    on `/auth/v1/token`) — already on; confirm/tune in the dashboard.
  - **Leaked-password protection** (HaveIBeenPwned check) — **Pro-plan only on
    Supabase; this project is on the free tier, so it is deliberately SKIPPED**
    (decided 2026-06-20). Mitigated by manually choosing a **strong, unique admin
    password** at account creation. Recorded as an intentional tier constraint,
    not an oversight — same as the Vercel/Edge and CAPTCHA decisions above.
  - **Signups disabled** — closes account creation as an attack vector.
  - **RLS itself** — once writes require auth, an attacker with the anon key can
    only do public reads (which are public by design). The blast radius of the
    committed key drops from "read+write everything" to "read the storefront,"
    which is the whole point of the hardening.

Net: app-level rate limiting adds little on a static + Supabase stack once RLS is
locked and Supabase Auth's built-ins are on. We use the built-ins and stop there.

## 7. Phased execution (sequenced so writes are never locked before auth works)

> Manual DB/dashboard steps are Edgar's to run against production (like the promo
> Phase 0). Each phase is independently shippable, has a storefront-safety test,
> and has a rollback.

### Phase 0 — Supabase dashboard prep (manual; changes nothing in the app)
- **Create one admin account** (Authentication → Users → Add user, email +
  password). Confirm it can sign in from the dashboard.
- **Disable public signups** (Authentication → Providers / Sign-in settings →
  turn off "Allow new users to sign up"). This makes `authenticated` == admin.
- **Choose a strong, unique admin password** (leaked-password protection is
  Pro-only → skipped on free tier, see §6); confirm login rate limits.
- **Test:** none of this affects the live app yet (no code shipped, RLS still
  open). Storefront and current admin keep working.
- **Rollback:** delete the test user; nothing in production changed.

### Phase 1 — Real auth in code (RLS still OPEN → no lockout possible)
- **Changes:** `AdminPage.js` — `signInWithPassword`, session-derived `authed`,
  `signOut`, email field; keep `admin_users` login as a labeled fallback. Add
  unit tests for the session→`authed` derivation and logout (mock
  `supabase.auth`).
- **Why safe:** RLS is unchanged/open, so even if the new login had a bug, writes
  still work and the fallback still opens the UI. **Lockout is impossible in this
  phase.**
- **Test (no storefront break):**
  - Storefront: unchanged code path; smoke-check products/slides/deals/promo
    still render.
  - Admin: log in with the **new** Supabase Auth account → confirm
    `supabase.auth.getSession()` returns a session (JWT) → exercise CRUD on all
    four tabs (still succeeds, RLS open) → refresh page stays logged in → logout
    clears session.
- **Gate:** the new login produces a real session AND all four tabs still CRUD.
  Only proceed to Phase 2 once this is verified.
- **Rollback:** revert the commit; the `admin_users` login is still present.

### Phase 2 — Lock RLS writes (manual SQL; the high-risk, fully-reversible step)
- **Changes:** run the §5 table + storage SQL. `SELECT` public; writes
  `TO authenticated`.
- **Test BEFORE declaring done (this is the storefront-safety gate):**
  1. **Public read intact** — in a **logged-out / incognito** browser (anon,
     no session), load the live storefront: products, prices, hero slides, deals,
     and any active promo all display; product/hero/promo images load
     (`getPublicUrl` still resolves). This is the "don't break the shop" check.
  2. **Admin write intact** — logged in via the Phase 1 Supabase Auth session,
     create/edit/delete a throwaway product, hero slide, deal, and promo, and
     upload+delete an image. All succeed (JWT = authenticated).
  3. **Anon write blocked** — from the browser console on the public site (anon
     key, no session) attempt an `insert`/`update`; it returns a policy error
     (403/RLS). Confirms the lock actually bites.
- **Rollback (fast):** keep the *old* open write policies saved verbatim before
  dropping them; re-creating them (`for insert/update/delete to anon ... using
  (true) with check (true)`) restores the prior behavior in seconds. Independently,
  the **Supabase dashboard / service role bypasses RLS entirely**, so Edgar can
  always edit data even if a policy misbehaves — there is no true lockout.

### Phase 3 — Drop `admin_users` + remove dead code
- **Changes:** remove the `admin_users` fallback login query and its state from
  `AdminPage.js`; then `DROP TABLE admin_users` (manual SQL).
- **Test:** confirm the new Supabase Auth login still works (it never read
  `admin_users`); confirm storefront unaffected; confirm `admin_users` no longer
  exists / is not client-readable.
- **Gate:** do this **only after** Phase 2 is verified, so the real auth path is
  the proven, sole login before the fallback is removed.
- **Rollback:** revert the code commit (table drop is final — only drop once
  Phase 1–2 are confirmed; export rows first if any audit value is wanted).

### Phase 4 — Confirm rate-limiting posture (mostly dashboard verification)
- Verify login rate limits are on and a strong admin password is set (Phase 0);
  leaked-password protection is Pro-only and intentionally skipped (§6).
- Record in `security-debt.md` that the debt is resolved and that Vercel/Edge
  rate limiting was assessed and intentionally skipped (§6).
- No code; nothing to roll back.

## 8. Files touched

| File | Change |
|------|--------|
| `src/pages/AdminPage.js` | `signInWithPassword`, session-derived `authed`, `signOut`, email field; remove `admin_users` query (Phase 3) |
| `src/pages/AdminPage.test.js` (new) or existing test file | Unit tests for session→`authed`, logout |
| `docs/superpowers/security-debt.md` | Mark resolved; record skipped-rate-limit rationale |
| **No change** | `src/supabase.js`, `useProducts.js`, `Hero.js`, `DealsOfDay.js`, `src/lib/storage.js` (storefront + upload mechanics unchanged) |
| **Manual (Supabase)** | Auth account + settings (Phase 0); RLS SQL (Phase 2); `DROP TABLE admin_users` (Phase 3) |

## 9. Risks / notes
- **Lockout** — mitigated by ordering (auth proven in Phase 1 before writes lock
  in Phase 2), the fallback login during cutover, fast SQL rollback, and the
  dashboard/service-role backdoor that ignores RLS.
- **Storefront regression** — mitigated by keeping all reads `TO public` and
  verifying the incognito storefront in Phase 2 before sign-off.
- **Email-vs-username** — admins log in with an **email** now, not a username.
  One-time change for the client to learn; document the new credentials.
- **Session in `localStorage`** — supabase-js default; acceptable for a single
  admin. Not exposing anything the committed anon key didn't already.
- **Policy-name drift** — existing policies were created ad hoc; the §5 discovery
  query must be run first so the right policies are dropped (don't assume names).
