# Hero Promo Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-controlled weekly promo video that replaces the homepage hero when active, falling back to the existing slide carousel when not — without ever auto-downloading video on constrained/save-data/reduced-motion connections.

**Architecture:** A bandwidth-aware gate (`useAutoplayAllowed`) and pure upload validators (`videoUpload.js`) are built and unit-tested first. `PromoHero` (Tailwind) renders video-or-poster per the gate. `Hero.js` gains a render switch (active promo → `PromoHero`, else unchanged carousel). A new "Promo Video" admin tab does CRUD + single-active toggle + upload validation + bucket-cleaning delete.

**Tech Stack:** React 19, react-router-dom v7, Supabase (anon-key client), CRA + Jest + @testing-library (jsdom), Tailwind tokens (admin stays CSS with `adm-*` classes + `CustomSelect`).

**Spec:** `docs/superpowers/specs/2026-06-13-hero-promo-video-design.md`

**Test command (non-interactive, single file):**
`npm test -- --watchAll=false <path>`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `docs/superpowers/promo-video-supabase.sql` | Create | Reproducible SQL for table + RLS + bucket policies (Phase 0) |
| `src/lib/videoUpload.js` | Create | `validateVideoFile` / `validatePosterFile` pure size guards |
| `src/lib/videoUpload.test.js` | Create | Unit tests for both validators |
| `src/lib/storage.js` | Create | `bucketPathFromUrl` (pure) + `deleteFromBucket` (Supabase) |
| `src/lib/storage.test.js` | Create | Unit tests for `bucketPathFromUrl` |
| `src/hooks/useAutoplayAllowed.js` | Create | `decideAutoplay` (pure) + `useAutoplayAllowed` hook — the bandwidth gate |
| `src/hooks/useAutoplayAllowed.test.js` | Create | Unit tests for `decideAutoplay` (all gate branches) |
| `src/components/PromoHero.js` | Create | Tailwind render of video-or-poster + caption/title + product CTA |
| `src/components/PromoHero.test.js` | Create | Render-state + `.play()`-rejection tests |
| `src/components/Hero.js` | Modify | Fetch active promo; early-return `PromoHero` or unchanged carousel |
| `src/components/Hero.test.js` | Create | Switch test (promo present vs absent), mocking `PromoHero` + supabase |
| `src/pages/AdminPage.js` | Modify | New "Promo Video" tab: state, load, form+validation, save, activate, delete |

---

## Phase 0 — Supabase setup (RLS-gated)

### Task 0: Create table, policies, and bucket

This phase is done in the Supabase dashboard (SQL editor + Storage UI). The SQL
is committed for reproducibility. The site is RLS-gated by design (CLAUDE.md), so
policies are explicit. **Admin auth is out of scope** — match the existing
gating on `hero_slides`/`hero-images`, do not change auth.

- [ ] **Step 1: Write the SQL file**

Create `docs/superpowers/promo-video-supabase.sql`:

```sql
-- Promo Video feature — table + RLS, matching existing hero_slides gating.
create table if not exists public.promo_video (
  id          uuid primary key default gen_random_uuid(),
  video_url   text not null,
  poster_url  text not null,
  title       text not null,
  caption     text,
  cta_label   text,
  product_sku text references public.products(sku),
  is_active   boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.promo_video enable row level security;

-- Public read (homepage reads the active promo with the anon key, like hero_slides).
create policy "promo_video public read"
  on public.promo_video for select
  to anon, authenticated
  using (true);

-- Writes: mirror the existing hero_slides admin-write policy EXACTLY.
-- IMPORTANT: before running, inspect the current hero_slides policies:
--   select * from pg_policies where tablename = 'hero_slides';
-- Re-create the same insert/update/delete policies here (same roles, same
-- using/with check). Do NOT make promo_video more permissive than hero_slides.
-- (Placeholder below assumes hero_slides allows anon writes; if it is stricter,
--  copy whatever hero_slides actually uses.)
create policy "promo_video admin insert" on public.promo_video for insert to anon, authenticated with check (true);
create policy "promo_video admin update" on public.promo_video for update to anon, authenticated using (true);
create policy "promo_video admin delete" on public.promo_video for delete to anon, authenticated using (true);
```

- [ ] **Step 2: Run the SQL in the Supabase SQL editor**

First run `select * from pg_policies where tablename = 'hero_slides';` and adjust
the write policies in the file to match before executing the rest.

- [ ] **Step 3: Create the `promo-videos` Storage bucket**

In Storage → New bucket: name `promo-videos`, **Public** = on (public read, so
`getPublicUrl` works for `<video>`/poster like `hero-images`). Then compare its
policies against the `hero-images` bucket (Storage → Policies) and add the same
**INSERT/write** policy scoped to `promo-videos` so it is not an open upload
target. Public read does NOT imply public write — set the write policy
deliberately to match `hero-images`.

- [ ] **Step 4: Verify**

Run `select * from public.promo_video;` → expect 0 rows (read works). Confirm the
bucket exists and its policies match `hero-images`.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/promo-video-supabase.sql
git commit -m "chore(promo): supabase table + RLS + bucket SQL (phase 0)"
```

---

## Phase 1 — Pure logic + tests (the bandwidth gate)

### Task 1: Upload size validators

**Files:**
- Create: `src/lib/videoUpload.js`
- Test: `src/lib/videoUpload.test.js`

- [ ] **Step 1: Write the failing test**

`src/lib/videoUpload.test.js`:

```js
import { validateVideoFile, validatePosterFile } from './videoUpload';

const MB = 1024 * 1024;
const fileOf = (bytes) => ({ name: 'x', size: bytes });

describe('validateVideoFile', () => {
  test('blocks above 25 MB', () => {
    const r = validateVideoFile(fileOf(26 * MB));
    expect(r.ok).toBe(false);
    expect(r.level).toBe('block');
    expect(r.message).toMatch(/25 MB/);
  });
  test('warns between 10 and 25 MB', () => {
    const r = validateVideoFile(fileOf(12 * MB));
    expect(r.ok).toBe(true);
    expect(r.level).toBe('warn');
  });
  test('ok below 10 MB', () => {
    expect(validateVideoFile(fileOf(5 * MB))).toEqual({ ok: true, level: 'ok', message: '' });
  });
  test('blocks when no file', () => {
    expect(validateVideoFile(null).ok).toBe(false);
  });
});

describe('validatePosterFile', () => {
  test('blocks above 1 MB', () => {
    const r = validatePosterFile(fileOf(1.5 * MB));
    expect(r.ok).toBe(false);
    expect(r.level).toBe('block');
    expect(r.message).toMatch(/1 MB/);
  });
  test('warns between 500 KB and 1 MB', () => {
    const r = validatePosterFile(fileOf(0.7 * MB));
    expect(r.ok).toBe(true);
    expect(r.level).toBe('warn');
  });
  test('ok below 500 KB', () => {
    expect(validatePosterFile(fileOf(0.3 * MB))).toEqual({ ok: true, level: 'ok', message: '' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false src/lib/videoUpload.test.js`
Expected: FAIL — "Cannot find module './videoUpload'".

- [ ] **Step 3: Write minimal implementation**

`src/lib/videoUpload.js`:

```js
// Pure upload size guards. Bandwidth-first: the poster is the asset constrained
// (mobile-data) users actually download, so it is capped too — not just the video.
const MB = 1024 * 1024;

const LIMITS = {
  video:  { warn: 10 * MB, block: 25 * MB, noun: 'Video',  max: '25 MB', warnAt: '10 MB' },
  poster: { warn: 0.5 * MB, block: 1 * MB, noun: 'Poster', max: '1 MB',  warnAt: '500 KB' },
};

const fmt = (bytes) => `${(bytes / MB).toFixed(1)} MB`;

function validate(file, kind) {
  const L = LIMITS[kind];
  if (!file) return { ok: false, level: 'block', message: 'No file selected.' };
  if (file.size > L.block) {
    return { ok: false, level: 'block',
      message: `${L.noun} is ${fmt(file.size)}. Max is ${L.max} — please compress it before uploading.` };
  }
  if (file.size > L.warn) {
    return { ok: true, level: 'warn',
      message: `${L.noun} is ${fmt(file.size)}. Over ${L.warnAt} is heavy on mobile data — consider a smaller file.` };
  }
  return { ok: true, level: 'ok', message: '' };
}

export const validateVideoFile = (file) => validate(file, 'video');
export const validatePosterFile = (file) => validate(file, 'poster');
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watchAll=false src/lib/videoUpload.test.js`
Expected: PASS (all 7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/videoUpload.js src/lib/videoUpload.test.js
git commit -m "feat(promo): video + poster upload size validators"
```

---

### Task 2: The bandwidth gate — `decideAutoplay` / `useAutoplayAllowed`

**Files:**
- Create: `src/hooks/useAutoplayAllowed.js`
- Test: `src/hooks/useAutoplayAllowed.test.js`

- [ ] **Step 1: Write the failing test**

`src/hooks/useAutoplayAllowed.test.js`:

```js
import { decideAutoplay } from './useAutoplayAllowed';

// matchMedia is not implemented in jsdom — install a controllable mock.
function mockMatchMedia(matchFor = {}) {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: !!matchFor[query],
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}
function setConnection(conn) {
  Object.defineProperty(navigator, 'connection', { value: conn, configurable: true });
}

const RM = '(prefers-reduced-motion: reduce)';
const DESKTOP = '(min-width: 1024px) and (pointer: fine)';

afterEach(() => {
  setConnection(undefined);
  delete window.matchMedia;
});

describe('decideAutoplay', () => {
  test('reduced motion -> poster', () => {
    mockMatchMedia({ [RM]: true, [DESKTOP]: true });
    setConnection({ effectiveType: '4g', saveData: false });
    expect(decideAutoplay()).toBe('poster');
  });
  test('saveData -> poster', () => {
    mockMatchMedia({ [DESKTOP]: true });
    setConnection({ effectiveType: '4g', saveData: true });
    expect(decideAutoplay()).toBe('poster');
  });
  test('3g -> poster', () => {
    mockMatchMedia({ [DESKTOP]: true });
    setConnection({ effectiveType: '3g', saveData: false });
    expect(decideAutoplay()).toBe('poster');
  });
  test('4g -> autoplay', () => {
    mockMatchMedia({});
    setConnection({ effectiveType: '4g', saveData: false });
    expect(decideAutoplay()).toBe('autoplay');
  });
  test('no connection API + desktop -> autoplay', () => {
    mockMatchMedia({ [DESKTOP]: true });
    setConnection(undefined);
    expect(decideAutoplay()).toBe('autoplay');
  });
  test('no connection API + narrow/touch -> poster', () => {
    mockMatchMedia({ [DESKTOP]: false });
    setConnection(undefined);
    expect(decideAutoplay()).toBe('poster');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false src/hooks/useAutoplayAllowed.test.js`
Expected: FAIL — "Cannot find module './useAutoplayAllowed'".

- [ ] **Step 3: Write minimal implementation**

`src/hooks/useAutoplayAllowed.js`:

```js
import { useState, useEffect } from 'react';

// Pure decision: returns 'autoplay' only with POSITIVE evidence it is safe;
// otherwise 'poster' (which never auto-downloads video). Exported for testing.
export function decideAutoplay() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'poster';
  const mm = window.matchMedia;

  if (mm && mm('(prefers-reduced-motion: reduce)').matches) return 'poster';

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    if (conn.saveData) return 'poster';
    if (['slow-2g', '2g', '3g'].includes(conn.effectiveType)) return 'poster';
    if (conn.effectiveType === '4g') return 'autoplay';
    // Unknown effectiveType with a connection present: fall through to viewport heuristic.
  }

  // API unavailable (Safari/Firefox/desktop): autoplay only on a wide, fine-pointer device.
  if (mm && mm('(min-width: 1024px) and (pointer: fine)').matches) return 'autoplay';
  return 'poster';
}

export default function useAutoplayAllowed() {
  const [mode, setMode] = useState('poster'); // SSR-safe default
  useEffect(() => {
    const update = () => setMode(decideAutoplay());
    update(); // re-decide after mount/hydration
    const conn = navigator.connection;
    if (conn && conn.addEventListener) {
      conn.addEventListener('change', update);
      return () => conn.removeEventListener('change', update);
    }
  }, []);
  return mode;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watchAll=false src/hooks/useAutoplayAllowed.test.js`
Expected: PASS (all 6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAutoplayAllowed.js src/hooks/useAutoplayAllowed.test.js
git commit -m "feat(promo): bandwidth-aware autoplay gate (useAutoplayAllowed)"
```

---

## Phase 2 — PromoHero + Hero switch

### Task 3: `PromoHero` component

**Files:**
- Create: `src/components/PromoHero.js`
- Test: `src/components/PromoHero.test.js`

**GATE (poster path):** in `poster` mode, no `<video>` with a `src` is rendered
until the user taps play. **GATE (autoplay path):** `<video>` has `preload="none"`,
the `poster` attribute set, and a rejected `.play()` falls back to poster + button.

- [ ] **Step 1: Write the failing test**

`src/components/PromoHero.test.js`:

```js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PromoHero from './PromoHero';

// Control the gate.
jest.mock('../hooks/useAutoplayAllowed');
import useAutoplayAllowed from '../hooks/useAutoplayAllowed';

// Stub useProducts so the linked product resolves.
jest.mock('../hooks/useProducts', () => ({
  useProducts: () => ({ products: [{ sku: 'WA0091', img: '/p.jpg' }], loading: false }),
}));

const navigateMock = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

const promo = {
  id: '1', video_url: '/v.mp4', poster_url: '/poster.jpg',
  title: 'Elden Ring', caption: "This week's best seller",
  cta_label: 'Shop This Game', product_sku: 'WA0091',
};

const renderHero = () => render(<MemoryRouter><PromoHero promo={promo} /></MemoryRouter>);

beforeEach(() => {
  navigateMock.mockReset();
  // jsdom has no real media engine.
  window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue();
});

test('poster mode: shows poster + play button, no video src until tap', () => {
  useAutoplayAllowed.mockReturnValue('poster');
  const { container } = renderHero();
  expect(screen.getByRole('button', { name: /watch/i })).toBeInTheDocument();
  expect(container.querySelector('video')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /watch/i }));
  expect(container.querySelector('video')).not.toBeNull();
});

test('autoplay mode: video has preload=none, poster attr, and plays', () => {
  useAutoplayAllowed.mockReturnValue('autoplay');
  const { container } = renderHero();
  const video = container.querySelector('video');
  expect(video).not.toBeNull();
  expect(video.getAttribute('preload')).toBe('none');
  expect(video.getAttribute('poster')).toBe('/poster.jpg');
  expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
});

test('autoplay rejection falls back to poster + play button', async () => {
  useAutoplayAllowed.mockReturnValue('autoplay');
  window.HTMLMediaElement.prototype.play = jest.fn().mockRejectedValue(new Error('blocked'));
  renderHero();
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /watch/i })).toBeInTheDocument()
  );
});

test('CTA navigates to the linked product page', () => {
  useAutoplayAllowed.mockReturnValue('poster');
  renderHero();
  fireEvent.click(screen.getByRole('button', { name: /shop this game/i }));
  expect(navigateMock).toHaveBeenCalledWith('/product/WA0091');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false src/components/PromoHero.test.js`
Expected: FAIL — "Cannot find module './PromoHero'".

- [ ] **Step 3: Write minimal implementation**

`src/components/PromoHero.js`:

```jsx
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAutoplayAllowed from '../hooks/useAutoplayAllowed';
import { useProducts } from '../hooks/useProducts';

export default function PromoHero({ promo }) {
  const navigate = useNavigate();
  const { products } = useProducts();
  const mode = useAutoplayAllowed();          // 'autoplay' | 'poster'
  const videoRef = useRef(null);
  const [userStarted, setUserStarted] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  const linkedProduct = products.find((p) => p.sku === promo.product_sku);
  const poster = promo.poster_url || linkedProduct?.img || null;
  const ctaLabel = promo.cta_label || 'Shop This Game';
  const caption = promo.caption || "This week's featured game";

  // Render the video element when autoplay is allowed (and not rejected), or after a tap.
  const showVideo = (mode === 'autoplay' && !autoplayFailed) || userStarted;

  // Autoplay path: preload="none" means .play() STREAMS progressively (never front-loads).
  useEffect(() => {
    if (mode !== 'autoplay' || autoplayFailed || userStarted) return;
    const el = videoRef.current;
    if (!el) return;
    const p = el.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => setAutoplayFailed(true)); // never leave a frozen frame
    }
  }, [mode, autoplayFailed, userStarted]);

  const handleManualPlay = () => {
    setUserStarted(true);
    requestAnimationFrame(() => {
      const el = videoRef.current;
      if (el) { const p = el.play(); if (p && p.catch) p.catch(() => {}); }
    });
  };

  const goToProduct = () => {
    if (promo.product_sku) navigate(`/product/${encodeURIComponent(promo.product_sku)}`);
  };

  return (
    <section className="relative overflow-hidden bg-ink-950 font-sans">
      <div aria-hidden="true" className="absolute -top-24 -right-16 w-96 h-96 bg-glow-teal" />
      <div aria-hidden="true" className="absolute -bottom-32 -left-24 w-96 h-96 bg-glow-teal opacity-60" />

      <div className="relative max-w-screen-xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="flex flex-col md:flex-row md:items-center gap-10">
          {/* Statement */}
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-2 border border-edge rounded-full px-4 py-1 text-label uppercase text-fg-mid">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              {caption}
            </span>
            <h1 className="text-display-xl text-fg-hi mt-6 max-w-2xl">{promo.title}</h1>
            <div className="flex flex-wrap gap-3 mt-8">
              <button onClick={goToProduct}
                className="bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-6 py-3 cursor-pointer min-h-11">
                {ctaLabel} →
              </button>
            </div>
          </div>

          {/* Media */}
          <div className="relative w-full md:w-[28rem] shrink-0">
            <div className="relative aspect-video bg-ink-800 border border-edge rounded-xl shadow-glow-featured overflow-hidden">
              {showVideo ? (
                <video
                  ref={videoRef}
                  src={promo.video_url}
                  poster={poster || undefined}
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
                  {poster ? (
                    <img src={poster} alt="" aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-display">🎮</div>
                  )}
                  <button
                    onClick={handleManualPlay}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-950/40 text-fg-hi cursor-pointer border-0 motion-reduce:transition-none">
                    <span className="text-display" aria-hidden="true">▶</span>
                    <span className="text-label uppercase">Watch — this week's featured game</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watchAll=false src/components/PromoHero.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/PromoHero.js src/components/PromoHero.test.js
git commit -m "feat(promo): PromoHero render with bandwidth-gated video/poster"
```

---

### Task 4: `Hero.js` render switch (no carousel regression)

**Files:**
- Modify: `src/components/Hero.js`
- Test: `src/components/Hero.test.js`

**GATE (regression):** with no active promo, the carousel renders exactly as
before. The only changes to `Hero.js` are: a new state + fetch effect for the
active promo, and one early-return branch ABOVE the existing return.

- [ ] **Step 1: Write the failing test**

`src/components/Hero.test.js`:

```js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock PromoHero so we only assert which branch renders.
jest.mock('./PromoHero', () => () => <div data-testid="promo-hero" />);

// Chainable supabase mock dispatched by table name.
const results = { promo_video: { data: null }, hero_slides: { data: [] }, products: { data: [] } };
jest.mock('../supabase', () => {
  const makeChain = (table) => {
    const chain = {
      select: () => chain,
      eq: () => chain,
      neq: () => chain,
      limit: () => chain,
      order: () => Promise.resolve(results[table] || { data: [] }),
      maybeSingle: () => Promise.resolve(results[table] || { data: null }),
    };
    return chain;
  };
  return { supabase: { from: (t) => makeChain(t) } };
});

import Hero from './Hero';

const renderHero = () => render(<MemoryRouter><Hero /></MemoryRouter>);

beforeEach(() => {
  results.promo_video = { data: null };
  results.hero_slides = { data: [] };
});

test('no active promo -> renders the carousel, not PromoHero', async () => {
  renderHero();
  await waitFor(() => expect(screen.queryByTestId('promo-hero')).toBeNull());
  // Carousel hallmark: the NN / NN slide counter exists.
  expect(screen.getByText('/', { exact: false })).toBeInTheDocument();
});

test('active promo -> renders PromoHero', async () => {
  results.promo_video = { data: { id: '1', title: 'X', video_url: '/v.mp4', poster_url: '/p.jpg', product_sku: 'S1' } };
  renderHero();
  await waitFor(() => expect(screen.getByTestId('promo-hero')).toBeInTheDocument());
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false src/components/Hero.test.js`
Expected: FAIL — `active promo` case still renders the carousel (PromoHero branch not added yet).

- [ ] **Step 3: Add the import, state, fetch, and branch to `Hero.js`**

At the top of `src/components/Hero.js`, add the import after the existing imports:

```js
import PromoHero from './PromoHero';
```

Inside `export default function Hero()`, add state next to the other `useState`
calls (e.g. right after the `const [active, setActive] = useState(0);` line):

```js
  const [promo, setPromo] = useState(null);
  const [promoChecked, setPromoChecked] = useState(false);
```

Add this effect alongside the other effects (e.g. directly after the
`fetchSlides` effect):

```js
  useEffect(() => {
    const fetchPromo = async () => {
      const { data } = await supabase
        .from('promo_video')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      setPromo(data || null);
      setPromoChecked(true);
    };
    fetchPromo();
  }, []);
```

Add the early-return branch immediately BEFORE the existing
`return (` of the carousel (i.e. right before the `<section ...>` JSX),
after the `const slide = slides[activeIdx];` line:

```js
  // Active promo replaces the hero entirely; otherwise fall through to the carousel.
  if (promoChecked && promo) {
    return <PromoHero promo={promo} />;
  }
```

Leave the entire carousel `return (...)` block below this UNCHANGED.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watchAll=false src/components/Hero.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the full suite to confirm no regressions**

Run: `npm test -- --watchAll=false`
Expected: PASS (existing `App.test.js`, `waMessage.test.js`, and the new suites).

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero.js src/components/Hero.test.js
git commit -m "feat(promo): hero render switch — active promo replaces carousel"
```

---

## Phase 3 — Admin "Promo Video" tab

### Task 5: `deleteFromBucket` storage helper

**Files:**
- Create: `src/lib/storage.js`
- Test: `src/lib/storage.test.js`

The existing admin delete handlers leave orphaned storage files. This helper
parses a Supabase public URL back to its object path so deletes can remove the
file too. The pure parser is unit-tested; `deleteFromBucket` is a thin wrapper.

- [ ] **Step 1: Write the failing test**

`src/lib/storage.test.js`:

```js
import { bucketPathFromUrl } from './storage';

test('extracts the object path from a public URL', () => {
  const url = 'https://abc.supabase.co/storage/v1/object/public/promo-videos/123-xyz.mp4';
  expect(bucketPathFromUrl(url, 'promo-videos')).toBe('123-xyz.mp4');
});

test('decodes percent-encoded paths', () => {
  const url = 'https://abc.supabase.co/storage/v1/object/public/promo-videos/my%20clip.mp4';
  expect(bucketPathFromUrl(url, 'promo-videos')).toBe('my clip.mp4');
});

test('returns null when bucket marker is absent', () => {
  expect(bucketPathFromUrl('https://example.com/x.mp4', 'promo-videos')).toBeNull();
  expect(bucketPathFromUrl('', 'promo-videos')).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false src/lib/storage.test.js`
Expected: FAIL — "Cannot find module './storage'".

- [ ] **Step 3: Write minimal implementation**

`src/lib/storage.js`:

```js
import { supabase } from '../supabase';

// Parse the storage object path out of a Supabase public URL.
// e.g. ".../object/public/promo-videos/123.mp4" -> "123.mp4". Pure + testable.
export function bucketPathFromUrl(url, bucket) {
  if (!url) return null;
  const marker = `/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length));
}

// Remove a file from a bucket given its public URL. No-op if the URL is unparseable.
export async function deleteFromBucket(url, bucket) {
  const path = bucketPathFromUrl(url, bucket);
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watchAll=false src/lib/storage.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.js src/lib/storage.test.js
git commit -m "feat(promo): deleteFromBucket storage cleanup helper"
```

---

### Task 6: Admin tab — imports, state, load, tab button, panel scaffold

**Files:**
- Modify: `src/pages/AdminPage.js`

No new test here (admin CRUD is verified by the Phase 4 round-trip gate; the
underlying pure logic — validators, `bucketPathFromUrl` — is already tested).

- [ ] **Step 1: Add imports**

At the top of `src/pages/AdminPage.js`, after `import { supabase } from '../supabase';`:

```js
import { validateVideoFile, validatePosterFile } from '../lib/videoUpload';
import { deleteFromBucket } from '../lib/storage';
```

- [ ] **Step 2: Add promo state**

After the Deals state block (`const [savingDeal, setSavingDeal] = useState(false);`):

```js
  // Promo Video
  const [promos, setPromos] = useState([]);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState({ title: '', caption: '', cta_label: '', product_sku: '' });
  const [promoVideoFile, setPromoVideoFile] = useState(null);
  const [promoPosterFile, setPromoPosterFile] = useState(null);
  const [promoVideoMsg, setPromoVideoMsg] = useState(null);   // { level, message } | null
  const [promoPosterMsg, setPromoPosterMsg] = useState(null);
  const [savingPromo, setSavingPromo] = useState(false);
```

- [ ] **Step 3: Wire the load into tab-switch + login**

In the auto-refresh `useEffect` (the one with `if (activeTab === 'deals') loadDeals();`), add:

```js
    if (activeTab === 'promo') loadPromos();
```

In `handleLogin`, after `loadDeals();`, add:

```js
    loadPromos();
```

- [ ] **Step 4: Add `loadPromos`**

After `loadDeals` definition:

```js
  const loadPromos = async () => {
    const { data } = await supabase
      .from('promo_video')
      .select('*')
      .order('created_at', { ascending: false });
    setPromos(data || []);
  };
```

- [ ] **Step 5: Add the tab button**

In the tabs array (currently `products`/`hero`/`deals`), add a 4th entry:

```js
            { key: 'promo', label: '🎬 Promo Video' },
```

- [ ] **Step 6: Add an empty panel placeholder**

Immediately AFTER the closing `)}` of the `{activeTab === 'deals' && ( ... )}`
block (and before the `</div>` that closes `adm-main`), add:

```jsx
        {/* ══ PROMO VIDEO ══ */}
        {activeTab === 'promo' && (
          <div>
            <div className="section-header">
              <h2 className="adm-section-title">🎬 Promo Video ({promos.length})</h2>
              <div className="adm-header-actions">
                <button onClick={loadPromos} className="adm-refresh-btn">🔄 Refresh</button>
                <button onClick={() => { resetPromoForm(); setShowPromoForm(true); }} className="adm-primary-btn">
                  + Add Promo
                </button>
              </div>
            </div>
            {/* form + list added in Tasks 7-8 */}
          </div>
        )}
```

- [ ] **Step 7: Verify it compiles**

Run: `npm test -- --watchAll=false src/App.test.js`
Expected: PASS (app renders; `resetPromoForm` is referenced — define it as a
no-op stub for now OR proceed directly to Task 7 which defines it. To keep this
step green, temporarily add `const resetPromoForm = () => {};` and replace it in
Task 7.)

- [ ] **Step 8: Commit**

```bash
git add src/pages/AdminPage.js
git commit -m "feat(promo): admin promo tab scaffold — state, load, tab, panel"
```

---

### Task 7: Admin form — file validation, save, reset

**Files:**
- Modify: `src/pages/AdminPage.js`

- [ ] **Step 1: Add handlers** (replace the temporary `resetPromoForm` stub from Task 6)

Place near the other hero/deal handlers:

```js
  const resetPromoForm = () => {
    setPromoForm({ title: '', caption: '', cta_label: '', product_sku: '' });
    setPromoVideoFile(null); setPromoPosterFile(null);
    setPromoVideoMsg(null); setPromoPosterMsg(null);
    setEditingPromo(null); setShowPromoForm(false);
  };

  const onSelectPromoVideo = (file) => {
    const res = validateVideoFile(file);
    if (!res.ok) { setPromoVideoFile(null); setPromoVideoMsg(res); return; }
    setPromoVideoFile(file);
    setPromoVideoMsg(res.level === 'warn' ? res : null);
  };

  const onSelectPromoPoster = (file) => {
    const res = validatePosterFile(file);
    if (!res.ok) { setPromoPosterFile(null); setPromoPosterMsg(res); return; }
    setPromoPosterFile(file);
    setPromoPosterMsg(res.level === 'warn' ? res : null);
  };

  const handleSavePromo = async () => {
    if (!promoForm.title) { alert('Title is required'); return; }
    if (!promoForm.product_sku) { alert('Please link a product'); return; }
    if (!promoVideoFile && !editingPromo?.video_url) { alert('A video is required'); return; }
    if (!promoPosterFile && !editingPromo?.poster_url) { alert('A poster image is required'); return; }
    setSavingPromo(true);
    try {
      let video_url = editingPromo?.video_url || '';
      let poster_url = editingPromo?.poster_url || '';
      if (promoVideoFile) {
        if (editingPromo?.video_url) await deleteFromBucket(editingPromo.video_url, 'promo-videos');
        video_url = await uploadImage(promoVideoFile, 'promo-videos');
      }
      if (promoPosterFile) {
        if (editingPromo?.poster_url) await deleteFromBucket(editingPromo.poster_url, 'promo-videos');
        poster_url = await uploadImage(promoPosterFile, 'promo-videos');
      }
      const payload = {
        title: promoForm.title,
        caption: promoForm.caption,
        cta_label: promoForm.cta_label,
        product_sku: promoForm.product_sku,
        video_url, poster_url,
      };
      if (editingPromo) {
        await supabase.from('promo_video').update(payload).eq('id', editingPromo.id);
      } else {
        await supabase.from('promo_video').insert({ ...payload, is_active: false });
      }
      resetPromoForm();
      loadPromos();
    } catch (err) {
      alert('Error saving promo: ' + err.message);
    }
    setSavingPromo(false);
  };
```

- [ ] **Step 2: Add the form JSX**

Inside the promo panel, replace the `{/* form + list added in Tasks 7-8 */}`
comment with the form (list comes in Task 8):

```jsx
            {showPromoForm && (
              <div className="form-card">
                <div className="form-title">{editingPromo ? '✏️ Edit Promo' : '🎬 New Promo Video'}</div>
                <div className="admin-grid">
                  <div className="field-group">
                    <label>Title *</label>
                    <input className="adm-input" placeholder="e.g. Elden Ring"
                      value={promoForm.title}
                      onChange={e => setPromoForm({ ...promoForm, title: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Caption</label>
                    <input className="adm-input" placeholder="e.g. This week's best seller"
                      value={promoForm.caption}
                      onChange={e => setPromoForm({ ...promoForm, caption: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>CTA label</label>
                    <input className="adm-input" placeholder="e.g. Shop This Game"
                      value={promoForm.cta_label}
                      onChange={e => setPromoForm({ ...promoForm, cta_label: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Linked product *</label>
                    <CustomSelect
                      value={promoForm.product_sku}
                      placeholder="Select a product..."
                      options={products.map(p => ({ value: p.sku, label: `${p.name} — ${p.price}` }))}
                      onChange={val => setPromoForm({ ...promoForm, product_sku: val })}
                    />
                  </div>
                </div>

                <div className="adm-images">
                  <label className="adm-label">Promo Video * (max 25 MB)</label>
                  <div className="adm-dropzone">
                    <input type="file" accept="video/*" id="promo-vid-input" className="adm-hidden"
                      onChange={e => onSelectPromoVideo(e.target.files[0])} />
                    <label htmlFor="promo-vid-input" className="adm-dropzone-label">🎬 Tap to select video</label>
                    {promoVideoFile && <p className="adm-dropzone-ready">✓ {promoVideoFile.name}</p>}
                    {editingPromo?.video_url && !promoVideoFile && <p className="adm-dropzone-ready">✓ current video kept</p>}
                  </div>
                  {promoVideoMsg && (
                    <p style={{ color: promoVideoMsg.level === 'block' ? '#e63946' : '#d9a400', marginTop: 6 }}>
                      {promoVideoMsg.message}
                    </p>
                  )}
                </div>

                <div className="adm-images">
                  <label className="adm-label">Poster image * (shown on mobile data — max 1 MB)</label>
                  <div className="adm-dropzone">
                    <input type="file" accept="image/*" id="promo-poster-input" className="adm-hidden"
                      onChange={e => onSelectPromoPoster(e.target.files[0])} />
                    <label htmlFor="promo-poster-input" className="adm-dropzone-label">📷 Tap to select poster</label>
                    {promoPosterFile && <p className="adm-dropzone-ready">✓ {promoPosterFile.name}</p>}
                  </div>
                  {promoPosterMsg && (
                    <p style={{ color: promoPosterMsg.level === 'block' ? '#e63946' : '#d9a400', marginTop: 6 }}>
                      {promoPosterMsg.message}
                    </p>
                  )}
                  {editingPromo?.poster_url && !promoPosterFile && (
                    <img src={editingPromo.poster_url} alt="" className="adm-hero-preview" />
                  )}
                </div>

                <div className="btn-row">
                  <button onClick={handleSavePromo} disabled={savingPromo}
                    className="adm-primary-btn adm-save-btn" style={{ opacity: savingPromo ? 0.7 : 1 }}>
                    {savingPromo ? '💾 Saving...' : (editingPromo ? '✅ Update Promo' : '✅ Save Promo')}
                  </button>
                  <button onClick={resetPromoForm} className="adm-cancel-btn">Cancel</button>
                </div>
              </div>
            )}
```

- [ ] **Step 3: Verify the app still renders**

Run: `npm test -- --watchAll=false src/App.test.js`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/pages/AdminPage.js
git commit -m "feat(promo): admin promo form — validation, upload, save"
```

---

### Task 8: Admin list — activate toggle, edit, delete with bucket cleanup

**Files:**
- Modify: `src/pages/AdminPage.js`

- [ ] **Step 1: Add the handlers**

```js
  const handleEditPromo = (promo) => {
    setEditingPromo(promo);
    setPromoForm({
      title: promo.title || '', caption: promo.caption || '',
      cta_label: promo.cta_label || '', product_sku: promo.product_sku || '',
    });
    setPromoVideoFile(null); setPromoPosterFile(null);
    setPromoVideoMsg(null); setPromoPosterMsg(null);
    setShowPromoForm(true);
    window.scrollTo(0, 0);
  };

  // Single active at a time: deactivate all others, then toggle this one.
  const handleToggleActive = async (promo) => {
    await supabase.from('promo_video').update({ is_active: false }).neq('id', promo.id);
    await supabase.from('promo_video').update({ is_active: !promo.is_active }).eq('id', promo.id);
    loadPromos();
  };

  // Delete removes the row AND both files from the bucket (no orphans).
  const handleDeletePromo = async (promo) => {
    if (!window.confirm('Delete this promo? This also removes its video and poster.')) return;
    if (promo.video_url) await deleteFromBucket(promo.video_url, 'promo-videos');
    if (promo.poster_url) await deleteFromBucket(promo.poster_url, 'promo-videos');
    await supabase.from('promo_video').delete().eq('id', promo.id);
    loadPromos();
  };
```

- [ ] **Step 2: Add the list JSX**

Inside the promo panel, after the `{showPromoForm && (...)}` block:

```jsx
            {promos.length === 0 ? (
              <div className="adm-empty">
                <div className="adm-empty-icon">🎬</div>
                <p>No promos yet. Add one and activate it to replace the hero.</p>
                <p className="adm-empty-sub">When none is active, the hero shows the slide carousel.</p>
              </div>
            ) : (
              promos.map(promo => (
                <div key={promo.id} className="p-row">
                  <div className="p-row-info">
                    {promo.poster_url && <img src={promo.poster_url} alt="" className="adm-hero-thumb" />}
                    <div>
                      <div className="adm-hero-title">
                        {promo.title} {promo.is_active && <span className="adm-teal">● ACTIVE</span>}
                      </div>
                      <div className="adm-hero-sub">{promo.caption}</div>
                      <div className="adm-hero-price">Linked: {promo.product_sku || '—'}</div>
                    </div>
                  </div>
                  <div className="p-row-actions">
                    <button onClick={() => handleToggleActive(promo)} className="adm-edit-btn">
                      {promo.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                    <button onClick={() => handleEditPromo(promo)} className="adm-edit-btn">✏️ Edit</button>
                    <button onClick={() => handleDeletePromo(promo)} className="adm-delete-btn">🗑️</button>
                  </div>
                </div>
              ))
            )}
```

Note: `handleDeletePromo` takes the whole `promo` object (it needs the URLs),
so the delete button passes `promo` — written as `() => handleDeletePromo(promo)`.

- [ ] **Step 3: Verify the app still renders**

Run: `npm test -- --watchAll=false src/App.test.js`
Expected: PASS.

- [ ] **Step 4: Run the full suite**

Run: `npm test -- --watchAll=false`
Expected: PASS (all suites).

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminPage.js
git commit -m "feat(promo): admin promo list — activate toggle, edit, delete with cleanup"
```

---

## Phase 4 — MANDATORY round-trip verification gate

### Task 9: Manual end-to-end verification

No code. Run the dev server (`npm start`) against the live Supabase project
(Phase 0 must be complete). Record results in the PR description.

- [ ] **Step 1: Admin round-trip**
  - Log into `/admin` → Promo Video tab → Add Promo.
  - Try a video > 25 MB → **blocked** with message; a 10–25 MB video → **warn**
    but allowed; a poster > 1 MB → **blocked**; 500 KB–1 MB poster → **warn**.
  - Save a valid promo (video + poster + title + linked product). Confirm it
    appears in the list, inactive.
  - Click **Activate** → confirm `● ACTIVE`. Activate a second promo → confirm
    the first flips to inactive (single-active).

- [ ] **Step 2: Desktop / wifi render** (Chrome, wide window)
  - Load `/` → promo replaces the hero; video **autoplays muted, looped**; the
    `poster` attribute is set (no black flash on first paint).
  - In DevTools → Network, throttle to a fast profile; confirm the video streams
    progressively (it is not fully downloaded before playing — `preload="none"`).
  - CTA → navigates to `/product/<sku>`.

- [ ] **Step 3: Mobile-data / Save-Data render** (BANDWIDTH GATE)
  - DevTools → Network conditions → enable **Save-Data** (or emulate 3g), reload.
  - Confirm the **poster shows with a play button** and **NO video bytes are
    requested** in the Network panel until you tap play. On tap → video streams.
  - Emulate `prefers-reduced-motion: reduce` → confirm poster (no autoplay).

- [ ] **Step 4: Autoplay-blocked fallback**
  - In a context where the browser blocks autoplay, confirm the UI falls back to
    poster + play button (no frozen/blank frame).

- [ ] **Step 5: Fallback + cleanup**
  - Deactivate all promos → reload `/` → the **slide carousel returns** unchanged.
  - Delete a promo → confirm the row is gone AND its video + poster are removed
    from the `promo-videos` bucket (check Storage; no orphans).

- [ ] **Step 6: Record results & open PR**

```bash
git push -u origin feature/hero-promo-video
```

Open a PR to `main` with the Phase 4 results in the description. (Vercel deploys
on merge to `main` — do not merge until every Phase 4 check passes.)

---

## Self-Review (against the spec)

- **§2 storage / §4 data model** → Task 0 (table, RLS, bucket).
- **§5 bandwidth gate** → Task 2 (`decideAutoplay`, all branches tested).
- **§5 video discipline (preload=none, poster attr, play() rejection)** → Task 3.
- **§5 poster source + poster size guard** → Task 1 (`validatePosterFile`) + Task 3 (resolution order).
- **§6 CTA → product page, single h1** → Task 3.
- **§7 admin tab (CRUD, single-active, validation)** → Tasks 6–8.
- **§7 delete removes both files; edit cleans superseded files** → Task 5 + Tasks 7–8.
- **§8 uploadImage reuse** → Task 7 (called with `'promo-videos'`).
- **§9 phased gates** → regression gate Task 4 Step 5; round-trip gate Task 9.
- **Scope guard (auth untouched)** → no auth code in any task; Task 0 matches existing gating only.
