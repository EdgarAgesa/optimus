# Premium Redesign — Phase 5: Polish + Admin Recolor + Final Gates — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Headline-as-mobile-LCP, motion/a11y polish, the tokens-only admin recolor, dead-style audit, style-guide removal, final Lighthouse + regression gates — ending with a client-reviewable preview via Vercel Shareable Link. **NO merge to main in this phase** (spec §2.1: merge only after client approves the final preview).

**Edgar's reminders (binding):** tokens-only admin recolor (skip-if-structural, auth untouched) · style-guide.html removed before merge · "headline as mobile LCP" parked candidate ships here · dead-style audit App.css/index.css · final a11y pass · full regression checklist · Vercel Shareable Link for client review.

**Decision recorded:** Tailwind preflight stays OFF permanently for this branch — AdminPage still depends on legacy CSS; enabling preflight now would restyle it structurally, violating D2. Documented here, revisit only post-merge if ever.

---

### Task 1: Headline as mobile LCP + dead-style audit (App.css/index.css)

**Files:**
- Modify: `src/components/Hero.js`
- Modify: `src/App.css`

- [ ] **Step 1: Defer hero card images on small screens.** In Hero.js add after the existing state declarations:

```jsx
  // "Headline as mobile LCP" (perf-baseline.md Phase 2 addendum): on small
  // screens the card images mount after idle, so the display-xl headline is
  // the first large paint. Desktop is unaffected.
  const [imgsReady, setImgsReady] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );
  useEffect(() => {
    if (imgsReady) return;
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => setImgsReady(true), { timeout: 1500 })
      : setTimeout(() => setImgsReady(true), 800);
    return () => {
      if (window.requestIdleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, [imgsReady]);
```

and change the slide-image render condition from `warmed.has(i) && s.img && !failedImgs.has(s.id)` to `imgsReady && warmed.has(i) && s.img && !failedImgs.has(s.id)`. (The emoji placeholder already covers the not-yet-loaded state — no visual gap.)

- [ ] **Step 2: Remove the dead `hero-section` class** from the Hero `<section>` (the App.css rule that targeted it dies this step; keep all other classes).

- [ ] **Step 3: App.css dead-style audit.** Apply exactly:
  - DELETE the `.product-card:hover` block (classname exists nowhere in src JS — verified 2026-06-12; also violated the zero-shadow law).
  - DELETE the `.hero-section` media-query block (Hero uses padding; with Step 2 the class is gone entirely).
  - RE-VALUE the body block to the dark canvas (the light `#f5f6fa` body flashes before sections paint): `background: #0d2b33;` (ink-900) and `color: #fff;`.
  - KEEP: the Inter `@import`, the global reset, html/body overflow guards, the dark scrollbar block.
  - `src/index.css`: no changes (directives + focus ring + scrollbar-hide all live).

- [ ] **Step 4: Build (CI=true), test, commit**

```bash
CI=true npm run build && CI=true npx react-scripts test --watchAll=false
git add src/components/Hero.js src/App.css
git commit -m "perf(p5): headline as mobile LCP (idle-deferred hero card imgs); App.css dead-style audit + dark body canvas"
```

---

### Task 2: Motion + a11y polish sweep

**Files:**
- Modify: `src/components/Navbar.js`, `src/pages/CategoryPage.js` (one class each)

- [ ] **Step 1:** Add `motion-reduce:transition-none` to the two transform-based drawer transitions that lack it:
  - Navbar mobile drawer: the div with `transition-transform duration-300` → append `motion-reduce:transition-none`
  - CategoryPage aside: same change on its `transition-transform duration-300`

(The hero crossfade and dots already carry it; ProductCard's `transition-colors` is a non-movement fade — allowed.)

- [ ] **Step 2:** Build, test, commit:

```bash
git add src/components/Navbar.js src/pages/CategoryPage.js
git commit -m "a11y(p5): respect prefers-reduced-motion on drawer transforms"
```

---

### Task 3: Admin tokens-only recolor (D2 — values only, skip-if-structural, auth untouched)

**Files:**
- Modify: `src/styles/AdminPage.css` (re-valued IN PLACE — this file survives by design)
- Modify: `src/pages/AdminPage.js` (ONLY the 4 inline `style={{}}` color values, if they contain colors; zero logic/markup changes)

**The value map (apply per CSS property context — NOT blind find-replace):**

| Old value | Where it appears as | New value |
|---|---|---|
| `#fff` | background / background-color | `#123a45` (ink-800 surface) |
| `#fff` | color (text on teal/red buttons) | keep `#fff` |
| `#f5f6fa`, `#f5f5f5`, `#eee`, `#f0fafb` | backgrounds | `#0d2b33` (ink-900) |
| `#e0f7fa` | teal-wash backgrounds (active states) | `rgba(0,188,212,0.14)` (edge) |
| `#111` | text color | `#ffffff` |
| `#666`, `#888` | secondary text | `#9fb6bc` (fg-mid) |
| `#aaa`, `#ccc` | muted text / placeholder | `#7d99a1` (fg-low) |
| `#e0e0e0`, `#eee` | border colors | `rgba(0,188,212,0.14)` (edge) |
| `#0097a7` | anywhere | keep (it IS teal-600) |
| `#0d2b33` | anywhere | keep (ink-900) |
| `#e63946` | anywhere | keep (accent — admin destructive/error) |
| `#fff0f0`, `#ffd0d0` | error washes | `rgba(230,57,70,0.15)` |
| box-shadow declarations | any | DELETE the declaration (zero-shadow law) — UNLESS removing it requires restructuring (it never should; a deleted shadow is a value change) |
| `border-radius` on BUTTON selectors only | `4px`–`16px` | `9999px` (pill — D2 "button styles mapped") |
| `border-radius` elsewhere (cards, inputs, modals, images) | any | keep as-is (radius rework beyond buttons risks layout) |
| font-family declarations | any | keep (already Inter via global) |

**Skip-if-structural rule (binding):** if any recolor requires touching markup, class names, layout properties (display/position/margin/padding/width), or AdminPage.js logic — SKIP that element and list it in the report. Auth flow untouched entirely.

- [ ] **Step 1:** Apply the map across `src/styles/AdminPage.css`.
- [ ] **Step 2:** Check the 4 inline `style={{}}` objects in AdminPage.js — re-value colors per the same map; if any inline style is structural (positioning/size), leave it.
- [ ] **Step 3:** `CI=true npm run build` + tests green.
- [ ] **Step 4: Admin smoke (npm start, /admin):** login works; all three tabs render legibly (no dark-on-dark or light-on-light text); product create/edit form readable; image upload control visible; hero slides + deals tabs usable. Fix any contrast misses by adjusting the mapped VALUE (never structure).
- [ ] **Step 5:** Commit: `git add src/styles/AdminPage.css src/pages/AdminPage.js && git commit -m "feat(p5): admin tokens-only dark recolor (D2) — value map only, buttons pilled, shadows dropped, auth untouched"`

---

### Task 4: Remove the style guide + record the phase in perf-baseline.md

- [ ] **Step 1:** `git rm public/style-guide.html` (review artifact — spec §7: never ships to production).
- [ ] **Step 2:** Append a Phase 5 addendum to `docs/perf-baseline.md`: final medians (from Task 5), the headline-as-LCP change, admin recolor note.
- [ ] **Step 3:** Commit both with: `chore(p5): remove style-guide review artifact; perf record addendum`

(Order note: Step 2's numbers come from Task 5 — in practice commit the removal now, append the addendum after Task 5's runs, one commit each. The plan keeps them as one task for the ledger.)

---

### Task 5: Final gates — Lighthouse, regression checklist, push, client handoff

- [ ] **Step 1: Final Lighthouse** (fresh build, serve :3001): `/`, `/category/games`, product page — 3 runs each (5 if noisy). ALL ≥ floors; product page must hold its Phase 4 level (decisively above 39). Mobile LCP element on `/` should now be the headline — verify via the lcp insight audit and report it.

- [ ] **Step 2: Full regression checklist** (run every line, report pass/fail):
  1. Home renders: hero (slides cycle, CTA navigates), trust bar, category row (snap+peek), deals (featured first card), popular games
  2. Admin → Supabase flows: hero slide edit appears on `/`; product create appears in its category; deal assignment appears in deals row (then revert all)
  3. `/category/ps5-games` + `/category/ps4-games` → redirect to `/category/games`
  4. Brand filter via pill row AND sidebar; `?brand=` URL param round-trips; sort all 4 options; pagination incl. scroll-to-top
  5. Product page: gallery zoom (incl. Escape + focus return), qty, add to cart, Buy via WhatsApp href correct, Ask a Question href correct, share, related navigation
  6. Cart: add/remove/qty/clear, localStorage across reload, checkout wa.me message itemized correctly, toast
  7. Search: query → results grid → product nav; empty state; close (✕ + backdrop)
  8. Keyboard: nav drawer trap/Escape/scroll-lock, dropdowns, cart drawer, zoom overlay, all focus rings
  9. Helmet: home/category/product titles + product og: tags in page source
  10. 404-ish: unknown product sku → not-found state with working Back to Home
  11. Admin auth: login still works (logic untouched), all tabs functional post-recolor

- [ ] **Step 3:** Push branch. Verify Vercel preview builds green.

- [ ] **Step 4: Report to Edgar and STOP.** The report includes the final Lighthouse table (vs original baseline — the full before/after story), regression results, admin recolor skip-list (if any), and the handoff instruction:
  **Vercel Shareable Link (Edgar action):** Vercel dashboard → the preview deployment → Share → create Shareable Link (keeps Deployment Protection ON for everyone else) → send to the client. Client approves → Edgar gives the merge go → merge to main happens OUTSIDE this plan, with Edgar.

---

## Self-Review (done at write time)

- **Edgar's reminders coverage:** admin recolor T3 (value map + skip rule + auth untouched) · style-guide removal T4 · headline-as-mobile-LCP T1 · dead-style audit T1 (with the verified-dead evidence inline) · a11y T2 + T5.2.8 · regression checklist T5.2 · Shareable Link T5.4. NO merge anywhere in this plan.
- **D6 interaction check:** the imgsReady gate composes with the warmed-set (AND condition) — desktop initializes true (no behavior change); mobile defers all card images including slide 0, which is exactly the intent (headline first).
- **Admin map honesty:** `#fff` is context-dependent (surface vs button text) — the map says so explicitly; blind find-replace is forbidden.
- **Placeholder scan:** none. Type consistency: imgsReady/setImgsReady consistent; map values are real token hexes from tailwind.config.js.
```
