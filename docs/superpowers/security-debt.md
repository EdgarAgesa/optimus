# Known Security Debt

> Recorded 2026-06-13, during the hero-promo-video feature. `CLAUDE.md` carries a
> short version of this note locally (it is gitignored); this file is the
> version-controlled record.
>
> **STATUS: RESOLVED 2026-06-24** by `feature/security-hardening` (admin auth +
> RLS hardening). The original debt described below is closed; see the
> **[Resolution](#resolution-2026-06-24)** section at the end for what shipped.
> The section below is retained as the historical record of the debt.

## Anon key permits public read/write to ALL tables and buckets

The Supabase URL and **anon key are committed and shipped in the public bundle**
(`src/supabase.js`). Combined with the current RLS policies — `SELECT` /
`INSERT` / `UPDATE` / `DELETE` open to the `anon` role with `USING (true)` /
`WITH CHECK (true)` on `products`, `hero_slides`, `promo_video`, etc., and
equivalently open write policies on the `product-images`, `hero-images`, and
`promo-videos` storage buckets — **anyone with the public bundle can read and
write all data and upload to all buckets.**

The `/admin` login is **UI-only**: it reads plaintext credentials from the
`admin_users` table and gates the admin *interface* in React state. It grants no
extra database privilege and stops nobody from calling Supabase directly with
the anon key.

## Why new surfaces match the open gating (rather than tightening one)

New surfaces (e.g. the hero-promo-video feature) deliberately **match this
existing open gating** rather than tightening a single table/bucket in
isolation, because:

1. **Partial tightening is false security** — locking `promo_video` /
   `promo-videos` while `products`, `hero_slides`, and the other buckets stay
   open just sends an attacker to the still-open surfaces.
2. **Requiring the `authenticated` role would break the feature** — the admin
   panel is not a real Supabase Auth session; uploads run with the **anon** role
   via the committed key. An `authenticated`-only write policy would block the
   admin's own uploads.

### Bucket-level guards that do NOT need auth (used where they help)

These shrink the open-upload surface without expanding scope into the auth fix:

- `promo-videos`: `file_size_limit` ≥ 25 MB (matches the app-level cap), and
  `allowed_mime_types` restricted to video/image types only.

## Next work item

**A dedicated auth pass is the next work item after the hero-promo-video feature
ships.** Scope:

- Move admin auth to **Supabase Auth** (or a server-side **RPC / Edge Function**
  that verifies credentials without exposing `admin_users` to the anon role).
- Lock down RLS so the DB is not publicly writable: restrict `INSERT` / `UPDATE`
  / `DELETE` (and sensitive `SELECT`s) to an authenticated admin role across all
  tables and storage buckets.
- Lock `admin_users` so it is not client-readable.

Until that lands, **do not build new protected surfaces assuming the database is
private.**

## Resolution (2026-06-24)

The dedicated auth pass shipped via `feature/security-hardening`. The debt above
is resolved:

- **Admin moved to Supabase Auth.** `/admin` authenticates with email + password
  through `supabase.auth.signInWithPassword` (the `useAdminAuth()` hook), which
  carries a real JWT (`role: authenticated`) on every request. The old plaintext
  `admin_users` username/password lookup is gone — UI access is now derived from
  a real session, not React state.
- **RLS writes locked to `authenticated`.** `INSERT` / `UPDATE` / `DELETE` on
  `products`, `hero_slides`, `deals`, and `promo_video`, plus writes to the
  `product-images`, `hero-images`, and `promo-videos` storage buckets, now require
  the authenticated admin. **Public reads stay open** (`SELECT` to `public`) so
  the anon-key storefront is unchanged — verified across all read surfaces with no
  session. Anon writes are rejected at the database.
- **`admin_users` dropped.** The temporary fallback login was removed in code
  (commit `2ea40b1`); the table itself is dropped with
  `DROP TABLE IF EXISTS public.admin_users;` as the final manual cutover step,
  run in Supabase after the deployed build is verified. No application code
  references it.
- **Rate limiting — intentionally left to Supabase Auth built-ins.** Vercel/Edge
  -level rate limiting was assessed and deliberately skipped: storefront and admin
  traffic hits Supabase directly (bypassing Vercel), and all writes now require
  the authenticated admin, so the realistic lever is Supabase Auth's built-in
  login-attempt rate limits + disabled public signups. Leaked-password protection
  (HaveIBeenPwned) is Pro-tier only and skipped on the free tier, mitigated by a
  strong, unique admin password. (Consistent with the existing Vercel/Edge/CAPTCHA
  tier-constraint decisions.)

Plan: `docs/superpowers/plans/2026-06-20-admin-auth-rls-hardening.md`.
