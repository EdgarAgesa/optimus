# Premium Design Overhaul — Design Spec

Date: 2026-06-11 · Branch: `redesign/premium-dark` · Status: awaiting Edgar's spec review

## 1. Context & Goal

Optimus Sphere Tech (live production e-commerce storefront for a paying client, Nairobi)
gets a premium dark redesign: RunwayML's cinematic STRUCTURE (layout, depth, typography
discipline, spacing) + Minimax's COMPONENT MECHANICS (cards, pill CTAs, oversized hero
type), with ALL colors mapped to the existing brand palette (teal `#0097a7`/`#00bcd4`
on dark `#0d2b33`, accent red `#e63946`, Inter). Design inputs: `design-refs/runwayml-DESIGN.md`
and `design-refs/minimax-DESIGN.md` (binding); `ui-ux-pro-max` / `frontend-design` skills
fill gaps. The result must read as a premium evolution of the existing brand.

## 2. Binding Constraints

1. **Production safety:** feature branch only; `main` untouched until ALL five phases are
   complete AND the client approves the final Vercel preview URL. Per-phase "deployable"
   means preview-deployable. The client sees one coherent before/after, never partial states.
2. **Kenyan mobile data:** mobile-first; Lighthouse mobile baseline measured BEFORE any
   work; no phase may end below baseline. Heavy assets lazy-loaded with poster/aspect
   fallbacks; gradients over imagery wherever the refs used photography.
3. **All functionality intact:** Supabase data flow, cart/localStorage, WhatsApp checkout,
   admin panel, category slug redirects, react-helmet SEO.
4. **Incremental Tailwind:** redesigned components use Tailwind tokens; untouched
   components keep inline styles until touched. Tailwind v3.4 (CRA/PostCSS-8 compatible).
   Preflight OFF for coexistence (revisit only in Phase 5).
5. **No ad-hoc values — ALL phases:** if a needed value isn't a token, the token is added
   to `tailwind.config.js` first (named), never inlined. Token additions after Phase 1
   are flagged in each phase summary.
6. **Old styling dies with conversion:** converting a component includes deleting its
   `const s = {...}` blocks, injected `<style>` strings, and its `src/styles/*.css` file
   in the SAME commit. No end-of-project cleanup phase. Exception: `AdminPage.css`
   survives (admin is re-valued, not converted — see Decision D2).
7. **Remote review:** Edgar reviews everything via Vercel preview URLs on his phone.
   Anything that would have been shown in a local visual tool is committed to the branch
   instead (see §7).

## 3. Decisions Log (user rulings, all binding)

- **D1 — Hero strategy: Option A** (statement hero). Oversized type + radial teal glow
  leads; the admin's slide image becomes a small floating product card, lazy-loaded.
  Lightest on data. Admin → Supabase `hero_slides` flow intact.
- **D2 — Admin panel: light touch.** Tokens-only recolor in Phase 5: colors, fonts,
  button styles re-valued to the new palette. Zero layout change, zero markup
  restructuring, zero changes to forms/uploads/auth logic. If a recolor would require
  touching structure, skip that element and leave it old-style. The admin plaintext-auth
  issue (CLAUDE.md Known issues) is explicitly OUT of this branch.
- **D3 — Approach: token-first incremental.** Full token layer in Phase 1; later phases
  convert components using only tokens.
- **D4 — Phase 1 exit gate:** full token set rendered as a static style-guide page,
  reviewed and approved by Edgar on the Vercel preview URL BEFORE any component work.
- **D5 — Nav blur is enhancement, not design:** base style solid `ink-950` full opacity;
  blur only via `@supports (backdrop-filter: blur())`. Phase 2 includes a manual
  mid-range-Android scroll test; jank → drop blur entirely. Lighthouse can't catch
  scroll feel; this gate is on-device.
- **D6 — Hero crossfade lazy discipline:** only the active slide's image is loaded;
  slide N+1 starts loading when slide N becomes active; slide 3 stays unfetched until
  needed. Never mount all slide images up front.
- **D7 — Category snap-row peek:** next card peeks 15–20% into the mobile viewport,
  with `scroll-padding` set so snap positions respect the peek.
- **D8 — WhatsApp checkout gate is mobile-only:** Phase 4's wa.me end-to-end test happens
  ON A PHONE (app handoff), not desktop. Desktop pass ≠ pass.
- **D9 — One unit test, Phase 4:** `buildWaMessage()` with a known cart produces the
  expected message string. Revenue path, pure logic. Everything else stays manual.

## 4. Token System (Phase 1, complete set)

### Colors
| Token | Value | Role |
|---|---|---|
| `ink-950` | `#06161b` | Deepest canvas — hero, footer |
| `ink-900` | `#0d2b33` | Page canvas (brand dark) |
| `ink-800` | `#123a45` | Card surface / elevation 1 |
| `ink-700` | `#1a4a57` | Hover surface / elevation 2 |
| `edge` | `rgba(0,188,212,0.14)` | The single border color |
| `teal-500` | `#00bcd4` | Primary accent, CTAs, active |
| `teal-600` | `#0097a7` | Pressed/deep accent |
| `accent` | `#e63946` | SALE/deals/destructive/error ONLY |
| `text-hi` | `#ffffff` | Primary text |
| `text-mid` | `#9fb6bc` | Secondary text |
| `text-low` | `#7d99a1` | Tertiary/metadata |
| `warn` | `#e8b339` | Warnings — badges/form hints only, never large surfaces |
| `whatsapp` | `#25D366` | WhatsApp affordance only (the one non-palette color) |

### Semantic states
`success` = `teal-500` · `error` = `accent` (second sanctioned red use — both mean
"stop and look") · `warning` = `warn`. Applies to toasts (CartContext) and form
validation (incl. Phase 5 admin recolor).

### Laws
- **Focus ring:** `:focus-visible { outline: 2px solid teal-500; outline-offset: 2px }`
  — every interactive element, no exceptions. Installed globally in Phase 1 (benefits
  unconverted components too; the only visible Phase 1 change).
- **WhatsApp contrast:** WhatsApp green buttons use `ink-950` text. White-on-`#25D366`
  (~1.9:1) is forbidden — this is the checkout button.
- **Red legibility:** accent red never appears as text below 14px on dark surfaces;
  small sale indicators use the red pill/badge form with white text instead.

### Gradients (CSS-only "free color", replacing ref photography)
`glow-teal` radial `rgba(0,188,212,0.35)→transparent` (hero/featured atmosphere) ·
category identities: gaming `teal-500→teal-600→ink-900` · audio `#007a8a→ink-950` ·
deals `#e63946→#8f1d27` (red = deals only) · phones `#3ddbe8→teal-600`.

### Typography (Inter only; Runway tightness, Minimax scale; clamp for mobile-first)
`display-xl` clamp(40px→72px) w600 lh1.05 ls-2px · `display` 40px ls-1.2px ·
`heading` 28px lh1.2 · `card-title` 18px w600 lh1.3 · `body` 15px lh1.5 ·
`label` 12px w500 UPPERCASE ls+0.35px · `micro` 11px · `price` 18px w700 (the only 700).
Inter loads with `font-display: swap` + system fallback stack.

### Spacing
4px base: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96.

### Radius (Minimax signature)
4 · 6 · 8 · 12 · 16 · 24 · 32 (featured) · full (pill). The 32/16 featured/standard
pairing is the "moment" signal. All buttons pill, always.

### Elevation (Runway zero-shadow law, adapted)
No `box-shadow` on canvas. Depth = surface steps (ink-900→800→700) + edge borders +
glow. Sanctioned exceptions: `glow-featured` (`0 0 24px rgba(0,188,212,0.25)`) for
featured cards/CTA emphasis; cart drawer lifts via scrim `rgba(3,15,19,0.72)` + edge
border, not shadow.

### Buttons
`btn-primary` teal-500 pill, `ink-950` text, pressed teal-600, disabled ink-700/text-low ·
`btn-secondary` transparent pill, edge border, white text · `btn-sale` accent pill,
white text · `btn-icon` 36px circle (44px touch on mobile) · WhatsApp CTA green pill,
`ink-950` text.

### Motion (Phase 5)
150–200ms ease transitions; `prefers-reduced-motion` respected throughout.

## 5. Component Application

- **Nav (P2):** sticky solid `ink-950`; blur per D5. `label`-type uppercase links, teal
  cart-count badge. Mobile: full-screen `ink-950` drawer, 44px targets. Edge hairline
  separation, zero shadow.
- **Hero (P2, D1):** `display-xl` over `glow-teal` on `ink-950`; floating product card
  (`ink-800`, edge, r16, lazy img in fixed aspect-ratio box — zero CLS). Crossfade per
  D6. `hero_slides` title/subtitle/CTA/image map 1:1; `defaultSlides` fallback restyled
  identically.
- **TrustBar (P2):** monochrome, `label` type in `text-low`, generous spacing.
- **Category cards (P3):** r32 gradient identity cards, horizontal scroll-snap with D7
  peek. Pure CSS gradients.
- **Product/deal cards (P3):** standard = `ink-800`/edge/r16, lazy aspect-locked image,
  `card-title`, `price`, pill add-to-cart. Deals = red identity: first card featured
  r32 + `glow-featured`, red SALE pills, struck old price in `text-low`.
- **CategoryPage (P3):** desktop sidebar → mobile pill-tab filter row (inactive
  edge-bordered / active teal-500 fill + ink-950 text); sort/pagination tokenized;
  `categoryMap` + slug redirects untouched.
- **ProductPage (P4):** aspect-locked lazy gallery, price block, specs as dark data
  table (`ink-800` header, edge dividers), WhatsApp CTA dominant. Helmet untouched.
- **CartDrawer (P4):** `ink-950` panel over scrim, 36px steppers (44 mobile), `price`
  total, WhatsApp checkout dominant pill. `buildWaMessage()`/localStorage/toast logic
  untouched; toasts adopt semantic tokens.
- **Footer + SearchOverlay (P4):** footer-region mapped dark (`ink-950`, `text-low`
  links); search = full overlay, pill input.
- **Admin (P5, D2):** tokens-only re-valuing inside `AdminPage.css` + component;
  skip-if-structural.

**Performance, every phase:** images `loading=lazy decoding=async` in aspect-ratio
boxes; `preconnect` to Supabase; no new runtime JS deps (Tailwind is build-time).

## 6. Phase Map

| Phase | Scope | Old styling DELETED (same commits) | Exit gates |
|---|---|---|---|
| **1 Tokens** | Lighthouse mobile baseline FIRST (`/`, one category, one product page; 3-run median → `docs/perf-baseline.md`); Tailwind 3.4 + full §4 config; global focus ring; style-guide page (§7) | none | Build green; site visually unchanged (except focus rings); **Edgar approves style guide on preview URL (D4)** |
| **2 Hero+Nav** | Navbar, Hero, TrustBar | `Hero.css`, `Navbar.css`, `TrustBar.css` + inline blocks | Lighthouse ≥ baseline; **on-device Android scroll gate (D5)**; admin hero-slide CRUD smoke; keyboard nav |
| **3 Cards+Category** | Categories, CategoryBanner, DealsOfDay, PopularGames, FeaturedProducts, CategoryPage | their 6 CSS files + inline blocks | Lighthouse ≥ baseline; legacy slug URLs tested; filters/sort/pagination intact |
| **4 Product+Cart** | ProductPage, ProductDrawer, CartDrawer, SearchOverlay, Toast, Footer | their 6 CSS files + inline blocks | **WhatsApp E2E ON A PHONE (D8)**; `buildWaMessage()` unit test green (D9); cart localStorage round-trip; helmet verified in page source |
| **5 Polish+Admin** | Motion tokens, micro-interactions, admin re-valuing (D2), dead-style audit (`App.css`, residual `index.css` globals), remove style-guide page before merge | residual dead globals (`AdminPage.css` survives) | Final Lighthouse ≥ baseline; a11y pass (focus, contrast, red rule, reduced motion); full regression checklist; **client approves final preview; Edgar's merge go** |

Every phase summary reports: tokens added (named), styling deleted, Lighthouse delta.

## 7. Remote Review Workflow

Edgar is remote (no localhost). All visual review happens on Vercel preview URLs
(auto-built per branch push), on his phone.

- **Style guide (D4):** `public/style-guide.html` — a static page rendering palette
  swatches, type scale, spacing, radii, button/badge/card specimens from the token set.
  Lives in `public/` so it ships on the preview URL without entering the React bundle.
  DELETED in Phase 5 before merge (never ships to production).
- Any future "show me" artifact follows the same pattern: commit to branch → preview URL.

## 8. Risks

1. **Client-uploaded image sizes** (Supabase): lazy + aspect boxes contain layout/UX
   damage; truly huge uploads still cost data. Admin-side image guidance/resizing is
   OUT of scope; noted for a future fix.
2. **Preflight OFF:** occasional manual resets in new components; accepted for safe
   coexistence with inline-styled components.
3. **Near-zero test suite** (one trivial `App.test.js`): functional safety rests on the
   per-phase manual gates + the D9 unit test. Stated honestly.
4. **Hero "premium" depends on type quality:** Option A leans on typography; if the
   client's slide copy is weak (long titles), clamp + line-limits in the hero component
   guard the layout. Content guidance to client is out of scope.

## 9. Out of Scope

Admin auth fix (separate branch per CLAUDE.md Known issues) · admin structural redesign ·
Supabase image pipeline/resizing · new features · payment processor · copy rewrites ·
`optimus` and `optimus-pos` sibling projects.
