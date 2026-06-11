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
