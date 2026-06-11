# Premium Redesign — Phase 1: Tailwind Setup + Design Tokens — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Measure the Lighthouse mobile baseline, install Tailwind 3.4 with the complete approved token system, add the global focus ring, ship a static style-guide page to the Vercel preview, and change nothing else visually.

**Architecture:** Tailwind v3.4 on CRA (react-scripts 5) with preflight OFF so existing CSS-file-styled components are untouched. The token config is the single source of design truth; default Tailwind color/shadow palettes are REMOVED (not extended) so any non-token value fails to compile — the no-ad-hoc-values law enforced at build level. Spec: `docs/superpowers/specs/2026-06-11-premium-redesign-design.md`.

**Tech Stack:** CRA (react-scripts 5.0.1), Tailwind 3.4, PostCSS 8 (CRA-native), Lighthouse CLI, `serve` for local static builds. Branch: `redesign/premium-dark`. All work commits there; push = Vercel preview. NO merge to main.

**Reality note (verified 2026-06-11):** every component styles via an imported `src/styles/<Name>.css` file. There are NO inline `const s = {}` objects and NO injected `<style>` strings anywhere in `src/`. Deletion ledgers in later phases = delete the CSS import + file. `WhatsAppButton` (missed by the spec's component list) is added to Phase 4 scope.

---

### Task 1: Lighthouse mobile baseline (BEFORE any Tailwind work)

**Files:**
- Create: `docs/perf-baseline.md`
- Create: `scripts/get-first-sku.js` (throwaway helper, committed for reproducibility)

- [ ] **Step 1: Verify clean branch state**

Run: `git -C "C:\Users\Hp\OneDrive\Desktop\optimus-main" status --short`
Expected: empty (or only untracked noise; nothing modified). Current HEAD is the pre-Tailwind state we baseline.

- [ ] **Step 2: Production build of CURRENT code**

Run (in `C:\Users\Hp\OneDrive\Desktop\optimus-main`): `npm run build`
Expected: `Compiled successfully` and a `build/` folder. Note the printed gzip sizes in a scratch note (they go in perf-baseline.md).

- [ ] **Step 3: Create the SKU helper script**

Create `scripts/get-first-sku.js`:

```js
// Fetches one real product SKU so the baseline can include a product page.
// Uses the same public anon credentials as src/supabase.js.
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bnpyphkohtlmmspwxbkb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucHlwaGtvaHRsbW1zcHd4YmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDczMDAsImV4cCI6MjA5NTQyMzMwMH0.FhhlVZEjdwyu2jEc3mGzicGDxAroi0F7h-pVYk-p0iU'
);

(async () => {
  const { data, error } = await supabase.from('products').select('sku').limit(1);
  if (error || !data?.length) { console.error('no sku', error); process.exit(1); }
  console.log(encodeURIComponent(data[0].sku));
})();
```

- [ ] **Step 4: Get the product URL for the baseline**

Run: `node scripts/get-first-sku.js`
Expected: one URL-encoded SKU string (call it `<SKU>`). The three baseline pages are:
`/`, `/category/games`, `/product/<SKU>`.

- [ ] **Step 5: Serve the build**

Run in background: `npx serve -s build -l 3001`
Expected: `Accepting connections at http://localhost:3001`.

- [ ] **Step 6: Run Lighthouse 3× per page (mobile preset is the default)**

For each page, run three times:

```bash
npx lighthouse http://localhost:3001/ --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless=new" --output=json --output-path=stdout | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const r=JSON.parse(s);console.log(Object.entries(r.categories).map(([k,v])=>k+': '+Math.round(v.score*100)).join(' | '),'| LCP:',r.audits['largest-contentful-paint'].displayValue,'| CLS:',r.audits['cumulative-layout-shift'].displayValue,'| TBT:',r.audits['total-blocking-time'].displayValue)})"
```

Repeat with `http://localhost:3001/category/games` and `http://localhost:3001/product/<SKU>`.
Expected: 9 result lines total (3 pages × 3 runs).

- [ ] **Step 7: Record medians in docs/perf-baseline.md**

Create `docs/perf-baseline.md` (fill the table cells from Step 6 medians — median = middle value of the 3 runs per metric):

```markdown
# Performance Baseline — pre-redesign (Phase 1, 2026-06-11)

Method: production build at commit <HEAD short sha>, served via `npx serve -s build -l 3001`,
Lighthouse CLI (mobile emulation, headless Chrome), 3 runs per page, MEDIAN recorded.
This is the floor: NO phase may end below these scores (spec §2.2).

| Page | Perf | A11y | Best-Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | | | | | | | |
| `/category/games` | | | | | | | |
| `/product/<SKU>` (sku: <SKU>) | | | | | | | |

Build sizes (gzip, from `npm run build` output):
- main.js: <fill>
- main.css: <fill>
- chunk(s): <fill>
```

- [ ] **Step 8: Stop the serve process, commit**

```bash
git add docs/perf-baseline.md scripts/get-first-sku.js
git commit -m "perf: record Lighthouse mobile baseline before redesign (spec 2.2)"
```

---

### Task 2: Install Tailwind 3.4 (preflight OFF), wire directives

**Files:**
- Modify: `package.json` (devDependencies — via npm)
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Install dev dependencies**

Run: `npm install -D tailwindcss@^3.4.0 postcss@^8 autoprefixer@^10`
Expected: added to devDependencies, no runtime deps touched.

- [ ] **Step 2: Create the FULL token config**

Create `tailwind.config.js` (complete file — this IS the design system; spec §4):

```js
/** @type {import('tailwindcss').Config} */
// SINGLE SOURCE OF DESIGN TRUTH — spec docs/superpowers/specs/2026-06-11-premium-redesign-design.md §4
// Default Tailwind color & shadow palettes are intentionally REMOVED:
// any value not defined here fails to exist => the no-ad-hoc-values law is build-enforced.
// Token additions after Phase 1 MUST be added here (named) and flagged in phase summaries.
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  corePlugins: {
    preflight: false, // coexistence with legacy CSS-file styling (spec §2.4); revisit Phase 5
  },
  theme: {
    // FULL OVERRIDE (not extend): only tokens exist.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      ink: {
        950: '#06161b', // deepest canvas — hero, footer
        900: '#0d2b33', // page canvas (brand dark)
        800: '#123a45', // card surface / elevation 1
        700: '#1a4a57', // hover surface / elevation 2
      },
      teal: {
        500: '#00bcd4', // primary accent, CTAs, active
        600: '#0097a7', // pressed / deep accent
      },
      accent: '#e63946',   // SALE / deals / destructive / error ONLY (spec red rules)
      warn: '#e8b339',     // warnings — badges/form hints only, never large surfaces
      whatsapp: '#25D366', // WhatsApp affordance ONLY — always with ink-950 text
      edge: 'rgba(0,188,212,0.14)', // the single border color
      fg: {
        hi: '#ffffff',   // primary text       → text-fg-hi
        mid: '#9fb6bc',  // secondary text     → text-fg-mid
        low: '#7d99a1',  // tertiary/metadata  → text-fg-low
      },
    },
    // Zero-shadow law (spec §4 Elevation): the ONLY shadows that exist.
    boxShadow: {
      none: 'none',
      'glow-featured': '0 0 24px rgba(0,188,212,0.25)',
    },
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
    fontSize: {
      // [size, { lineHeight, letterSpacing, fontWeight }] — Runway tightness, Minimax scale
      'display-xl': ['clamp(2.5rem, 8vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-2px', fontWeight: '600' }],
      display: ['2.5rem', { lineHeight: '1.05', letterSpacing: '-1.2px', fontWeight: '600' }],
      heading: ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.5px', fontWeight: '600' }],
      'card-title': ['1.125rem', { lineHeight: '1.3', fontWeight: '600' }],
      body: ['0.9375rem', { lineHeight: '1.5' }],
      label: ['0.75rem', { lineHeight: '1.3', letterSpacing: '0.35px', fontWeight: '500' }], // pair with `uppercase`
      micro: ['0.6875rem', { lineHeight: '1.3' }],
      price: ['1.125rem', { lineHeight: '1.3', fontWeight: '700' }], // the only 700 in the system
    },
    borderRadius: {
      none: '0',
      xs: '4px',
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',   // standard card
      '2xl': '24px',
      feat: '32px', // featured card — the 32/16 pairing is the "moment" signal
      full: '9999px', // every button/pill/badge
    },
    extend: {
      backgroundImage: {
        'glow-teal': 'radial-gradient(circle, rgba(0,188,212,0.35) 0%, rgba(0,188,212,0) 70%)',
        'grad-gaming': 'linear-gradient(160deg, #00bcd4 0%, #0097a7 55%, #0d2b33 100%)',
        'grad-audio': 'linear-gradient(160deg, #007a8a 0%, #06161b 100%)',
        'grad-deals': 'linear-gradient(160deg, #e63946 0%, #8f1d27 100%)',
        'grad-phones': 'linear-gradient(160deg, #3ddbe8 0%, #0097a7 100%)',
      },
      // spacing: default Tailwind scale already covers the approved 4..96 ladder
      // (p-1=4px ... p-24=96px). No override needed; do NOT use arbitrary values.
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Create postcss.config.js**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 4: Add directives + the focus-ring law to src/index.css**

Replace the full contents of `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* FOCUS RING LAW (spec §4): every interactive element, no exceptions.
   Global on purpose — unconverted legacy components benefit too. */
@layer base {
  :focus-visible {
    outline: 2px solid #00bcd4; /* teal-500 */
    outline-offset: 2px;
  }
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

(Existing body/code rules preserved verbatim below the directives. `App.css` — Inter
@import, global reset, scrollbar, `.product-card:hover` — is NOT touched in this phase;
its hover box-shadow violates the zero-shadow law but belongs to the card conversion in
Phase 3, where `.product-card:hover` dies with the card styling.)

- [ ] **Step 5: Build and verify NOTHING changed visually**

Run: `npm run build`
Expected: `Compiled successfully`. Compare gzip sizes to Task 1 Step 2 — main.css may grow by a small amount (base layer vars only; preflight off, nothing used yet). Must be ≲ 1 KB growth.

Run: `npm start`, open http://localhost:3000 — homepage, a category page, a product page, cart drawer. Everything looks IDENTICAL to before, except: Tab-key navigation now shows a teal focus ring (the one sanctioned change).

- [ ] **Step 6: Run the existing test suite**

Run: `npm test -- --watchAll=false`
Expected: PASS (the one existing App.test.js).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tailwind.config.js postcss.config.js src/index.css
git commit -m "feat: Tailwind 3.4 + complete design token system, preflight off, global focus ring (spec 4)"
```

---

### Task 3: Static style-guide page (Edgar's Phase 1 approval gate)

**Files:**
- Create: `public/style-guide.html`

This page renders the token system for remote review on the Vercel preview URL. It lives
in `public/` so it ships as a static file WITHOUT entering the React bundle. Values are
deliberately hand-mirrored from `tailwind.config.js` (it documents the tokens; the
config stays the single source for components). DELETED in Phase 5 before merge.

- [ ] **Step 1: Create public/style-guide.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>Optimus — Design Tokens (Phase 1 review)</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  /* Mirrors tailwind.config.js — review artifact only, deleted before merge */
  body{margin:0;background:#0d2b33;color:#fff;font-family:Inter,sans-serif;padding:24px;max-width:760px;margin:0 auto}
  h1{font-size:clamp(2.5rem,8vw,4.5rem);line-height:1.05;letter-spacing:-2px;font-weight:600;margin:16px 0}
  h2{font-size:1.75rem;line-height:1.2;letter-spacing:-.5px;font-weight:600;margin:48px 0 16px;border-bottom:1px solid rgba(0,188,212,.14);padding-bottom:8px}
  .label{font-size:.75rem;letter-spacing:.35px;font-weight:500;text-transform:uppercase;color:#7d99a1}
  .sw{display:flex;align-items:center;gap:12px;margin:8px 0}
  .chip{width:56px;height:36px;border-radius:8px;border:1px solid rgba(0,188,212,.14);flex:none}
  .sw code{color:#9fb6bc;font-size:13px}
  .row{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:12px 0}
  .btn{font-size:14px;font-weight:600;border-radius:9999px;padding:11px 24px;border:0;cursor:pointer}
  .btn:focus-visible{outline:2px solid #00bcd4;outline-offset:2px}
  .badge{font-size:13px;font-weight:600;border-radius:9999px;padding:4px 10px;display:inline-block}
  .card{border:1px solid rgba(0,188,212,.14);background:#123a45;padding:24px;margin:12px 0}
  .grad{height:88px;border-radius:32px;display:flex;align-items:flex-end;padding:14px;font-weight:600;font-size:14px;margin:10px 0}
  table{border-collapse:collapse;width:100%;font-size:14px}
  td{padding:8px 10px;border-bottom:1px solid rgba(0,188,212,.14);color:#9fb6bc}
  td:first-child{color:#fff}
</style>
</head>
<body>
<p class="label">Optimus Sphere Tech · premium redesign · Phase 1 token review</p>
<h1>Design tokens.</h1>
<p style="color:#9fb6bc;font-size:15px;line-height:1.5">Approve this system and every component in Phases 2–5 is built from ONLY these values.</p>

<h2>Palette</h2>
<div class="sw"><span class="chip" style="background:#06161b"></span><code>ink-950 #06161b — deepest canvas (hero, footer)</code></div>
<div class="sw"><span class="chip" style="background:#0d2b33"></span><code>ink-900 #0d2b33 — page canvas (brand dark)</code></div>
<div class="sw"><span class="chip" style="background:#123a45"></span><code>ink-800 #123a45 — card surface</code></div>
<div class="sw"><span class="chip" style="background:#1a4a57"></span><code>ink-700 #1a4a57 — hover surface</code></div>
<div class="sw"><span class="chip" style="background:#00bcd4"></span><code>teal-500 #00bcd4 — primary accent / CTA</code></div>
<div class="sw"><span class="chip" style="background:#0097a7"></span><code>teal-600 #0097a7 — pressed</code></div>
<div class="sw"><span class="chip" style="background:#e63946"></span><code>accent #e63946 — SALE / error ONLY</code></div>
<div class="sw"><span class="chip" style="background:#e8b339"></span><code>warn #e8b339 — badges/hints only</code></div>
<div class="sw"><span class="chip" style="background:#25D366"></span><code>whatsapp #25D366 — checkout only, dark text</code></div>
<div class="sw"><span class="chip" style="background:#ffffff"></span><code>fg-hi #ffffff · fg-mid #9fb6bc · fg-low #7d99a1 — text tiers</code></div>

<h2>Type scale (all Inter)</h2>
<div style="font-size:clamp(2.5rem,8vw,4.5rem);line-height:1.05;letter-spacing:-2px;font-weight:600">display-xl</div>
<div style="font-size:2.5rem;line-height:1.05;letter-spacing:-1.2px;font-weight:600">display 40</div>
<div style="font-size:1.75rem;line-height:1.2;letter-spacing:-.5px;font-weight:600">heading 28</div>
<div style="font-size:1.125rem;line-height:1.3;font-weight:600">card-title 18</div>
<div style="font-size:.9375rem;line-height:1.5">body 15 — Gaming, phones &amp; audio delivered across Nairobi.</div>
<div class="label">label 12 uppercase +0.35px</div>
<div style="font-size:1.125rem;font-weight:700">price 18 w700 — KSh 64,999 <span style="color:#7d99a1;font-weight:400;text-decoration:line-through;font-size:.9375rem">KSh 72,000</span></div>

<h2>Buttons (all pill, focus ring = Tab key)</h2>
<div class="row">
  <button class="btn" style="background:#00bcd4;color:#06161b">Primary</button>
  <button class="btn" style="background:transparent;color:#fff;border:1px solid rgba(0,188,212,.4)">Secondary</button>
  <button class="btn" style="background:#e63946;color:#fff">Sale / Remove</button>
  <button class="btn" style="background:#25D366;color:#06161b">WhatsApp Checkout</button>
  <button class="btn" style="background:#1a4a57;color:#7d99a1" disabled>Disabled</button>
</div>

<h2>Badges</h2>
<div class="row">
  <span class="badge" style="background:#e63946;color:#fff">SALE −20%</span>
  <span class="badge" style="background:#00bcd4;color:#06161b">NEW</span>
  <span class="badge" style="background:#e8b339;color:#06161b">LOW STOCK</span>
  <span class="badge" style="background:#1a4a57;color:#9fb6bc">OUT OF STOCK</span>
</div>

<h2>Cards — the 32/16 radius signature</h2>
<div class="card" style="border-radius:32px;box-shadow:0 0 24px rgba(0,188,212,.25)">
  <span class="label">featured · radius 32 · glow-featured (the only shadow)</span>
  <div style="font-size:1.125rem;font-weight:600;margin-top:8px">PS5 Slim 1TB</div>
  <div style="font-size:1.125rem;font-weight:700;color:#00bcd4">KSh 64,999</div>
</div>
<div class="card" style="border-radius:16px">
  <span class="label">standard · radius 16 · zero shadow, edge border</span>
  <div style="font-size:1.125rem;font-weight:600;margin-top:8px">Sony WH-1000XM5</div>
  <div style="font-size:1.125rem;font-weight:700;color:#00bcd4">KSh 38,500</div>
</div>

<h2>Category identity gradients (zero-bandwidth color)</h2>
<div class="grad" style="background:linear-gradient(160deg,#00bcd4 0%,#0097a7 55%,#0d2b33 100%);color:#06161b">Gaming</div>
<div class="grad" style="background:linear-gradient(160deg,#007a8a 0%,#06161b 100%)">Audio</div>
<div class="grad" style="background:linear-gradient(160deg,#e63946 0%,#8f1d27 100%)">Deals (red = deals only)</div>
<div class="grad" style="background:linear-gradient(160deg,#3ddbe8 0%,#0097a7 100%);color:#06161b">Phones</div>

<h2>Hero atmosphere (glow-teal radial)</h2>
<div style="position:relative;overflow:hidden;background:#06161b;border-radius:16px;padding:40px 24px">
  <div style="position:absolute;top:-60px;right:-40px;width:260px;height:260px;background:radial-gradient(circle,rgba(0,188,212,.35) 0%,rgba(0,188,212,0) 70%)"></div>
  <div style="font-size:clamp(2rem,6vw,3rem);line-height:1.05;letter-spacing:-1.2px;font-weight:600">Deals that<br/>hit different.</div>
</div>

<h2>Laws</h2>
<table>
  <tr><td>Focus ring</td><td>2px teal-500, offset 2 — every interactive element</td></tr>
  <tr><td>Zero shadow</td><td>depth = surface steps + edge borders + glow; glow-featured is the only shadow</td></tr>
  <tr><td>Red legibility</td><td>accent red never as text &lt;14px on dark; small sale info uses red pill + white text</td></tr>
  <tr><td>WhatsApp contrast</td><td>green button always carries ink-950 text</td></tr>
  <tr><td>No ad-hoc values</td><td>need a value? add a named token to tailwind.config.js first</td></tr>
  <tr><td>Buttons</td><td>always pill (radius full)</td></tr>
</table>
<p style="color:#7d99a1;font-size:13px;margin-top:32px">Review artifact — deleted in Phase 5 before merge. Not linked from the app.</p>
</body>
</html>
```

- [ ] **Step 2: Verify it serves locally**

Run: `npm run build` then `npx serve -s build -l 3001` and open `http://localhost:3001/style-guide.html`
Expected: the token page renders; the app itself still renders identically at `/`.

- [ ] **Step 3: Commit**

```bash
git add public/style-guide.html
git commit -m "docs: static style-guide page for Phase 1 token review (spec D4, 7)"
```

---

### Task 4: Correct CLAUDE.md styling note (reality fix)

**Files:**
- Modify: `CLAUDE.md` (the "Styling today is mixed" bullet under Conventions)

- [ ] **Step 1: Replace the outdated convention bullet**

In `CLAUDE.md`, replace the bullet beginning `**Styling today is mixed, not a framework.**` with:

```markdown
- **Styling (verified 2026-06-11): every component imports a dedicated stylesheet from
  `src/styles/<Name>.css`** (17 files; plus global `App.css`/`index.css`). There are NO
  inline `const s = {...}` style objects and NO injected `<style>` blocks in `src/`.
  During the premium redesign (branch `redesign/premium-dark`), converted components use
  Tailwind tokens from `tailwind.config.js` ONLY, and their `src/styles/*.css` file is
  deleted in the same commit. Unconverted components keep their CSS files until touched.
  Brand palette: teal `#0097a7`/`#00bcd4`, dark `#0d2b33`, accent red `#e63946`; font Inter.
```

(The following "Styling decision (premium redesign)" bullet stays as is.)

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: correct CLAUDE.md styling convention to verified reality (CSS files, no inline objects)"
```

---

### Task 5: Push, verify preview, STOP at the gate

- [ ] **Step 1: Push the branch**

Run: `git push origin redesign/premium-dark`
Expected: Vercel builds a preview deployment for the branch.

- [ ] **Step 2: Confirm the preview**

Get the preview URL (Vercel dashboard, or the deployment link on the GitHub branch commit status). Verify on the preview:
1. `/` renders identical to production (compare with optimus-sphere-tech.vercel.app)
2. `/style-guide.html` renders the token page
3. Tab key on `/` shows teal focus rings

- [ ] **Step 3: Report and STOP**

Phase 1 summary for Edgar must include: baseline table from `docs/perf-baseline.md`, bundle-size delta, preview URL + `/style-guide.html` link, tokens added since spec (expected: none — flag if any), styling deleted (none in this phase).

**HARD GATE (spec D4): No Phase 2 work until Edgar approves the style guide on the preview URL.**

---

## Self-Review (done at write time)

- **Spec coverage:** §2.2 baseline → Task 1 · §4 tokens incl. focus ring/semantics/laws → Task 2 (semantic colors present: accent doubles as error, warn, teal success — toast/form application is Phase 4/5 component work) · D4/§7 style guide → Task 3 · reality correction → Task 4 · preview-deployable + gate → Task 5.
- **Placeholders:** `<SKU>` and `<fill>` in Task 1 are runtime-measured values produced by earlier steps of the same task, not deferred work. None elsewhere.
- **Type consistency:** token names in Task 3's HTML mirror Task 2's config exactly (ink-950/900/800/700, teal-500/600, accent, warn, whatsapp, edge, fg-hi/mid/low, radius feat=32/xl=16, glow-featured).
- **Phases 2–5:** separate plans, written after this phase's gate passes, per the scope decision recorded in the conversation (token approval invalidates pre-written component code).
```
