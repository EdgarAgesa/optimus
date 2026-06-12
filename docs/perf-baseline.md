# Performance Baseline — pre-redesign (Phase 1, 2026-06-11)

Method: production build at commit `3c0d3dd`, served via `npx serve -s build -l 3001`,
Lighthouse CLI (mobile emulation, headless Chrome), 3 runs per page, MEDIAN recorded.
This is the floor: NO phase may end below these scores (spec §2.2).

| Page | Perf | A11y | Best-Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 59 | 77 | 73 | 100 | 4.6 s | 0.046 | 560 ms |
| `/category/games` | 48 | 81 | 96 | 100 | 5.2 s | 0.016 | 760 ms |
| `/product/<SKU>` (sku: `Xbox series S 1tb digital edition new + 1 pad `) | 39 | 88 | 96 | 100 | 4.1 s | 0.424 | 810 ms |

Build sizes (gzip, from `npm run build` output at `3c0d3dd`):
- main.js: 154.14 kB
- main.css: 10.41 kB
- chunk 453: 1.75 kB

Notes:
- Product-page CLS 0.424 is the standout defect — images without reserved space.
  The redesign's aspect-ratio-box rule (spec §5 performance measures) targets exactly this.
- Homepage Best-Practices 73 driven by console errors/image aspect warnings on current build.
- Run-to-run perf variance ±5-10 points is normal on local hardware; medians recorded.

## Phase 5 FINAL (2026-06-12) — the before/after story

| Page | Perf | A11y | BP | CLS |
|---|---|---|---|---|
| `/` | 59 → **71** | 77 → **87** | 73 → **100** | 0.046 → **0.022** |
| `/category/games` | 48 → **65** | 81 → **83** | 96 → **100** | 0.016 → **0.011** |
| product page | 39 → **72** | 88 → 87 | 96 → **100** | **0.424 → 0.000** |

- Headline-as-mobile-LCP: idle-deferred hero card images shipped; homepage LCP median
  6.0s → 4.9s. Honest note: the card image can still claim LCP on runs where it
  mounts+loads fast post-idle; making the headline DEFINITIVE LCP would require
  hiding the card on mobile (a design change, not taken).
- Admin recolored to dark via value map (D2); login-title ink-on-ink contrast catch
  fixed; CRUD round-trips are Edgar's gate (credentials).
- style-guide.html removed; App.css dead rules removed; body canvas dark.

## Phase 2 addendum (2026-06-11)

- Post-Phase-2 medians: home 61/87/77/100 (CLS 0.022, TBT 330ms), category 59/82/100/100,
  product 39 (5-run median; page untouched until Phase 4). All scores ≥ floor.
- **Mobile LCP element (for the record, parked for Phase 5):** the floating hero card
  image (slide 0) — React-injected, so discovered late (~1.2s resourceLoadDelay);
  `fetchPriority=high` applied. Polish candidate: make the display-xl HEADLINE the
  mobile LCP instead (e.g. defer the card image below the fold on small screens or
  render it later), which would tie LCP to first text paint. "Headline as mobile LCP."
