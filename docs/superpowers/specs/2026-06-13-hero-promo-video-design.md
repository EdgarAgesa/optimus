# Hero Promo Video — Design Spec

- **Date:** 2026-06-13
- **Branch:** `feature/hero-promo-video` (off `main`)
- **Status:** Approved design → ready for implementation plan

## 1. Summary

An admin-controlled weekly promo video that **replaces the hero** on the
homepage. The client picks a game he is pushing that week, uploads gameplay
footage + a poster still + a caption/title/CTA, and links it to an existing
product. When a promo is **active**, the homepage hero renders the promo
(video on capable connections, poster-only on constrained ones). When **no**
promo is active, the hero falls back to the existing slide carousel, unchanged.

This is a Kenyan mobile-data audience. The binding constraint: **video bytes
never move on a constrained/save-data/reduced-motion connection until the user
explicitly taps play.**

## 2. Scope

### In scope
- New `promo_video` Supabase table + `promo-videos` storage bucket.
- New "Promo Video" tab in `/admin` (self-serve CRUD, activate toggle, upload
  validation).
- New `PromoHero` render component + a bandwidth-aware autoplay gate.
- `Hero.js` gains a render switch: active promo → `PromoHero`, else existing
  carousel (untouched).

### Out of scope (scope guard)
- **Admin auth stays untouched** — still the known parked plaintext/anon-key
  issue. We do not extend, copy, or "improve" it here.
- No changes to cart, checkout (WhatsApp deep link), SEO/`react-helmet`
  behavior, or the existing slide carousel logic.
- No payment/backend work.

## 3. Architecture & boundaries

Each unit has one purpose, a defined interface, and is testable in isolation.

| Unit | Type | Responsibility | Depends on |
|------|------|----------------|------------|
| `src/hooks/useAutoplayAllowed.js` | hook (pure logic) | Decide `'autoplay'` vs `'poster'` from connection + motion + viewport signals | `navigator.connection`, `window.matchMedia` |
| `src/lib/videoUpload.js` | pure helper | `validateVideoFile(file)` and `validatePosterFile(file)` → `{ ok, level, message }`; size gates | none |
| `src/components/PromoHero.js` | component (Tailwind) | Render video-or-poster + title/caption + product CTA, honoring the gate | `useAutoplayAllowed`, `react-router` `useNavigate` |
| `Hero.js` (edited) | component | Fetch active promo; branch to `PromoHero` or existing carousel | `supabase`, `PromoHero` |
| `AdminPage.js` (edited) | component | New "Promo Video" tab: CRUD + activate + upload validation | `supabase`, `uploadImage`, `deleteFromBucket`, `CustomSelect` |

**Render switch (no carousel regression).** `Hero.js` adds one fetch effect for
the active promo and an **early return** of `<PromoHero promo={...} />` when one
exists. The existing carousel JSX, lazy-warming (`warmed`), crossfade-on-load,
and dots run **completely unchanged** when there is no active promo.

**Render-switch timing (decided 2026-06-13) — never block first paint.** The
homepage must never block on the promo fetch; fast first paint for the slow-data
audience is the priority, and most weeks there is no active promo (no swap at
all). So the default is **carousel-first**: the carousel paints immediately and,
if the async promo fetch later returns an active promo, the hero swaps to
`PromoHero`. Two refinements soften the swap during an active-promo week WITHOUT
blocking paint or reserving height:
1. **Crossfade the swap.** When `PromoHero` is swapped in after the carousel was
   shown, it fades in (`transition-opacity duration-500 motion-reduce:transition-none`,
   reusing the carousel's crossfade idiom) so it reads as intentional, not a pop.
   On a direct (cached) first-paint render there is no fade.
2. **Render directly from cache when the promo is already known.** A network
   fetch cannot resolve before first paint, so a small `localStorage`
   stale-while-revalidate cache (`src/lib/promoCache.js`, key `optimus-promo`)
   records the last-known active promo. On a return visit during a promo week,
   `Hero` initializes from the cache and renders `PromoHero` **directly on first
   paint (no carousel, no swap)**, then revalidates via the fetch and updates if
   it changed. Best case: no swap. Worst case (cold cache): carousel-first with
   the graceful crossfade. Rejected: blocking paint until the check resolves —
   that taxes 100% of loads (regressing the documented headline-as-LCP work) to
   fix a flash that only affects promo-active weeks.

**Known limitation (accepted).** The crossfade covers the *forward* swap only.
If a returning visitor has a cached promo that has since been **deactivated**,
`Hero` renders `PromoHero` on first paint (from cache) and then, when the fetch
returns null, reverts to the carousel **without** a fade-out (a brief reverse
flash). This is narrow (only when a campaign ends between a cached visitor's
visits), self-heals on the next load (the cache is cleared on revalidation), and
building a fade-out machine for it isn't worth the complexity. Accepted, not
fixed.

**Styling split (per CLAUDE.md):** `PromoHero` is **Tailwind** (matches the
redesign-converted `Hero.js` — brand tokens `teal-500`, `ink-950`, `fg-hi`,
`bg-glow-teal`, Inter, `motion-reduce:`). The admin tab is **CSS** — reuses
existing `adm-*` classes and the `CustomSelect` component (admin was Phase 5
recolor-only, not Tailwind-migrated). No new CSS framework.

## 4. Data model

### Table `promo_video`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid / int PK | default gen |
| `video_url` | text | public URL from `promo-videos` bucket |
| `poster_url` | text | public URL from `promo-videos` bucket (required on save) |
| `title` | text | shown as the promo `<h1>` |
| `caption` | text | e.g. "This week's best seller" |
| `cta_label` | text | e.g. "Shop This Game"; defaults if blank |
| `product_sku` | text | FK → `products.sku`; drives the CTA route |
| `is_active` | boolean | exactly one row true at a time |
| `created_at` | timestamptz | default now() |

- **Storage bucket:** `promo-videos` (public, mirrors `hero-images`). Holds both
  the video and the poster image.
- **Single-active enforcement (client-side, anon-key, matches existing
  patterns):** activating a promo first sets `is_active = false` on all rows,
  then `true` on the chosen one. Hero reads
  `.from('promo_video').eq('is_active', true).limit(1).maybeSingle()`.
- **Library, not single row:** multiple promos may be saved; only one active.
  Mirrors how `hero_slides` keeps a small set — avoids weekly re-upload.

## 5. The bandwidth gate — `useAutoplayAllowed()` (BINDING)

Returns `'poster'` unless there is **positive evidence** autoplay is safe.
Evaluation order:

1. `matchMedia('(prefers-reduced-motion: reduce)')` matches → **`poster`**.
2. `navigator.connection.saveData === true` → **`poster`**.
3. `navigator.connection.effectiveType` ∈ {`slow-2g`,`2g`,`3g`} → **`poster`**.
4. `navigator.connection.effectiveType === '4g'` (and not saveData) →
   **`autoplay`**.
5. **API unavailable** (Safari / Firefox / desktop without Network Information
   API): fall back to viewport+pointer — `matchMedia('(min-width: 1024px) and
   (pointer: fine)')` matches → **`autoplay`**, else → **`poster`**.
   *(Confirmed default: unknown desktop autoplays; unknown narrow/touch shows
   poster.)*

The hook also re-evaluates if `navigator.connection` fires a `change` event
(cleaned up on unmount). SSR-safe: returns `'poster'` when `window`/`navigator`
are undefined.

### Video element discipline (in `PromoHero`)

- Attributes always: `muted`, `loop`, `playsInline`, **`preload="none"`**, and
  **no `autoplay` attribute** (prevents the browser from prefetching bytes).
  `preload` is **never** set to `"auto"` on any path.
- **Autoplay path** (`gate === 'autoplay'`):
  - Set the `poster` attribute to `poster_url` so there is **no black flash**
    before the first frame paints.
  - Attach `src` (with `preload="none"`) and call `videoRef.current.play()` in
    an effect. With `preload="none"`, `.play()` **streams progressively** — it
    does not front-load the whole file. This is what closes the
    25 MB-on-unknown-desktop case: a long clip streams in rather than being
    fully downloaded before it can start.
  - **If `.play()` rejects** (browser blocks autoplay): catch it and fall back
    to the poster + play-button state — **never leave a frozen/blank frame.**
- **Poster path** (`gate === 'poster'`):
  - Render the poster `<img>` + a clear play button:
    **"▶ Watch — this week's featured game"**.
  - The video `src`/`preload` is attached **only after the user taps**
    (`userStarted` state). Until then **zero video bytes are fetched.**

### Poster source (resolved at render)

`poster_url` (admin-uploaded, required) → fall back to linked
`product.img` → fall back to emoji placeholder (consistent with the
carousel's placeholder treatment). The linked product is resolved via the
existing `useProducts()` hook (named export, returns `{ products }`; each item
has `.sku` and `.img`) by `product_sku`.

**The poster is the mobile-data payload** — it is the one asset constrained
users actually download on the "safe" path. So it gets its own size guard, just
like the video: `validatePosterFile(file)` **warns above ~500 KB** and
**blocks above 1 MB**. A required-but-uncapped poster would recreate the
bandwidth problem on the gated path.

## 6. CTA & SEO

- CTA navigates to the **product page**: `/product/${encodeURIComponent(sku)}`.
- `PromoHero` renders a single `<h1>` (the promo `title`) so heading structure
  and SEO do not regress. Static meta from `public/index.html` still applies; no
  `react-helmet` changes.

## 7. Admin tab — "Promo Video" (self-serve)

A 4th tab alongside Products / Hero Slides / Deals.

**List view:** saved promos, each with title/caption, a thumbnail (poster),
linked-product label, an **Active** toggle (activating one deactivates the
rest), Edit, and Delete.

**Form (reuses `adm-*` classes + `CustomSelect`):**
- Video dropzone (`accept="video/*"`) → runs `validateVideoFile`:
  - **> 25 MB → block** (clear message, cannot save).
  - **> 10 MB → warn** inline (allowed, but flagged).
  - else ok.
- Poster dropzone (`accept="image/*"`) — **required** to save; runs
  `validatePosterFile`: **> 1 MB → block**, **> 500 KB → warn**, else ok.
- Title, Caption, CTA label (text inputs).
- Product link: `CustomSelect` over products (`label: "name — price"`,
  value `sku`) — same pattern as the Deals tab.
- Save mirrors `handleSaveHero`: upload video + poster via
  `uploadImage(file, 'promo-videos')`, then insert/update the row.

**Delete (new storage-cleanup pattern):** existing `handleDeleteHero` /
`handleDeleteProduct` delete only the DB row, leaving orphaned files. The promo
delete **must remove the video AND poster from the `promo-videos` bucket** in
addition to the row. A small helper `deleteFromBucket(publicUrl, bucket)` parses
the storage path back out of the public URL and calls
`supabase.storage.from(bucket).remove([path])`. (Edit/replace should also clean
up the superseded file when a new video/poster is uploaded over an old one.)

**Untouched:** auth, and the Products / Hero Slides / Deals tabs.

## 8. `uploadImage` extension

The existing `uploadImage(file, bucket)` already takes an arbitrary bucket and
derives the extension from the filename — it works for video as-is. The only
change is allowing it to be called with `'promo-videos'` and a video file; no
signature change.

## 9. Testing & phased gates

- **Phase 0 — Supabase setup (RLS-gated, matching the existing tables).** The
  site is RLS-gated by design (CLAUDE.md), so this is specified explicitly, not
  "just create a table":
  - **Table `promo_video`:** create with the columns in §4. Enable RLS.
    - **Read:** `SELECT` policy `USING (true)` for `anon` (public read — the
      homepage reads the active promo with the anon key, exactly like
      `hero_slides`/`products`).
    - **Write:** `INSERT`/`UPDATE`/`DELETE` policies that match how the existing
      admin tables (`hero_slides`, `products`) are gated — i.e. **do not** grant
      blanket write to `anon` beyond what those tables already allow. Mirror the
      project's current admin-write policy on `hero_slides` so this table is no
      more permissive than what already ships.
  - **Bucket `promo-videos`:** create as **public-read** (so `getPublicUrl`
    works for the `<video>`/`poster`, like `hero-images`). Add a Storage
    **write/`INSERT`** policy scoped to this bucket so it is **not an open
    upload target** — mirror the existing write policy on the `hero-images`
    bucket. Public read does not imply public write; the write policy is set
    deliberately to match `hero-images`.
  - **Verify:** an anon `SELECT` on `promo_video` returns an empty set (read
    works); confirm the bucket exists and its policies match `hero-images`.
  - *Note:* the existing admin auth (plaintext/anon-key) is the known parked
    issue and is **out of scope** — we match the current gating, we do not try
    to fix or tighten auth here.
- **Phase 1 — pure logic + tests.** `validateVideoFile` and `useAutoplayAllowed`
  with Jest tests mocking `navigator.connection` (saveData, each effectiveType,
  absent) and `matchMedia` (reduced-motion, viewport/pointer). **GATE: the
  bandwidth decision is proven in tests before any video can render.**
- **Phase 2 — `PromoHero` + Hero switch.** **GATE (regression): with no active
  promo, the carousel renders exactly as before** (no behavioral diff to slides,
  lazy-warming, dots). Verify poster path fetches no video bytes until tap, and
  autoplay path sets the `poster` attribute and recovers from a rejected
  `.play()`.
- **Phase 3 — Admin tab.** CRUD, single-active toggle, upload validation
  (block/warn), delete removes both files from the bucket.
- **Phase 4 — MANDATORY round-trip gate.** Admin uploads video + poster →
  activates → homepage shows: autoplay (muted, looped) on desktop; **poster-only
  with no video bytes on a throttled / save-data / mobile profile** (verify via
  DevTools network + Save-Data emulation); reduced-motion shows poster.
  Deactivate → carousel returns. Delete → no orphaned bucket files.

## 10. Risks / notes

- `navigator.connection` is Chromium-only; the Phase-1 tests must cover the
  absent-API branch explicitly since that path governs Safari/Firefox behavior.
- A 25 MB autoplay video is still heavy on desktop; mobile-data users are
  protected by the poster gate regardless, and the >10 MB warning nudges the
  client toward shorter clips.
- Storage cleanup on delete/replace is new for this codebase — get it right so
  the `promo-videos` bucket doesn't accumulate orphans.
