# Premium Redesign — Phase 2: Hero + Nav + TrustBar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Navbar, Hero (statement Option A), and TrustBar to the approved token system; delete their CSS files in the same commits; prove the cinematic anti-flat mandate on the hero; end ≥ Lighthouse baseline on a preview deploy.

**Architecture:** Tokens only — every class must resolve against `tailwind.config.js` (defaults for colors/shadows are stripped, so ad-hoc colors won't compile). No arbitrary `[...]` values: if a value is missing, add a named token to the config FIRST and flag it in the phase summary. Spec: `docs/superpowers/specs/2026-06-11-premium-redesign-design.md` (D1, D5, D6 govern this phase; the "anti-flat" execution mandate from the D4 gate review is an exit gate).

**Tech Stack:** React 19, Tailwind 3.4 (preflight off), CRA. Branch `redesign/premium-dark`. Push = Vercel preview. NO merge to main.

**Functionality that must survive unchanged (spec §2.3):** Supabase `hero_slides` fetch + mapping + `defaultSlides` fallback; nav `menuData` taxonomy and `handleNav` brand-query URLs; cart count from `useCart()`; search wiring (`handleSearch`/`searchQuery`/`clearSearch`); WhatsApp links; mobile drawer behavior.

**Anti-flat mandate (binding, from D4 gate):** the dark theme must not read flat. Hero is the proof point: glow-teal atmosphere layers, display-xl type, and ink-950→800 surface stepping must deliver cinematic depth. If the built hero looks inert on the preview, glow opacity/saturation become named token variants tuned at the Phase 2 gate BEFORE Phase 3.

---

### Task 1: Convert Navbar to tokens, delete Navbar.css

**Files:**
- Modify: `src/components/Navbar.js` (full replacement below; data/handlers preserved verbatim)
- Delete: `src/styles/Navbar.css`

- [ ] **Step 1: Replace src/components/Navbar.js with exactly this**

(Keep the existing `menuData` array lines 6–45 EXACTLY as they are — copy them into the marked slot. Everything else is replaced.)

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// <<< PASTE THE EXISTING menuData ARRAY (current Navbar.js lines 6–45) HERE, UNCHANGED >>>

export default function Navbar({ onCartClick }) {
  const [open, setOpen] = useState(null);
  const [subOpen, setSubOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [mobileSubExpanded, setMobileSubExpanded] = useState(null);
  const navigate = useNavigate();
  const { cartCount, handleSearch, searchQuery, clearSearch } = useCart();

  const handleNav = (slug, brand = null) => {
    setOpen(null); setSubOpen(null); setMobileOpen(false);
    setMobileExpanded(null); setMobileSubExpanded(null);
    const url = brand
      ? `/category/${slug}?brand=${encodeURIComponent(brand)}`
      : `/category/${slug}`;
    navigate(url);
  };

  const goHome = () => {
    setMobileOpen(false); setMobileExpanded(null); setMobileSubExpanded(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 font-sans bg-ink-950 supports-[backdrop-filter]:bg-ink-950/90 supports-[backdrop-filter]:backdrop-blur border-b border-edge">
      {/* Announce bar */}
      <div className="bg-ink-950 text-fg-mid text-label uppercase text-center py-2 px-4 border-b border-edge">
        Call us on <strong className="text-fg-hi font-medium">0759 962 068</strong> or{' '}
        <strong className="text-fg-hi font-medium">0757 255 539</strong> to place your order.
      </div>

      {/* Main bar */}
      <div className="flex items-center gap-4 px-4 py-3 max-w-screen-xl mx-auto">
        {/* Logo */}
        <button onClick={goHome} className="flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0 shrink-0">
          <img src="/images/logo.png" alt="Optimus Sphere Tech" className="h-10 w-10 object-contain" loading="lazy" decoding="async" />
          <span className="flex flex-col items-start leading-none">
            <span className="text-card-title text-fg-hi tracking-tight">OPTIMUS</span>
            <span className="text-micro text-fg-low uppercase">SPHERE TECH</span>
          </span>
        </button>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 items-center bg-ink-800 border border-edge rounded-full px-4 h-10 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="What are you looking for..."
            value={searchQuery || ''}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') clearSearch(); }}
            className="flex-1 bg-transparent border-0 outline-none text-body text-fg-hi placeholder:text-fg-low"
          />
          <button onClick={() => handleSearch(searchQuery)} aria-label="Search"
            className="bg-transparent border-0 cursor-pointer text-fg-mid">🔍</button>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-2 ml-auto">
          <a href="https://wa.me/254759962068" target="_blank" rel="noreferrer" title="WhatsApp"
            className="hidden sm:flex items-center gap-1 text-fg-mid hover:text-fg-hi text-body px-3 py-2 rounded-full">
            <span>💬</span><span className="text-label uppercase">Chat</span>
          </a>
          <button onClick={onCartClick} title="Cart"
            className="relative flex items-center gap-1 bg-transparent border border-edge cursor-pointer text-fg-mid hover:text-fg-hi text-body px-3 py-2 rounded-full min-h-11">
            <span>🛒</span><span className="text-label uppercase hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-teal-500 text-ink-950 text-micro font-medium rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu"
            className="md:hidden bg-transparent border-0 cursor-pointer text-fg-hi text-card-title min-w-11 min-h-11">
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="flex md:hidden items-center gap-2 px-4 pb-3">
        <div className="flex flex-1 items-center bg-ink-800 border border-edge rounded-full px-4 h-11">
          <input
            type="text" placeholder="Search products..."
            value={searchQuery || ''}
            onChange={e => handleSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-body text-fg-hi placeholder:text-fg-low"
          />
          <button onClick={() => handleSearch(searchQuery)} aria-label="Search"
            className="bg-transparent border-0 cursor-pointer text-fg-mid">🔍</button>
        </div>
      </div>

      {/* Desktop category nav */}
      <nav className="hidden md:block border-t border-edge">
        <div className="flex items-center justify-center gap-1 max-w-screen-xl mx-auto">
          {menuData.map((item, i) => (
            <div key={i} className="relative"
              onMouseEnter={() => { setOpen(i); setSubOpen(null); }}
              onMouseLeave={() => { setOpen(null); setSubOpen(null); }}>
              <button
                onClick={() => handleNav(item.slug)}
                className={`flex items-center gap-1 bg-transparent border-0 cursor-pointer text-label uppercase px-4 py-3 ${open === i ? 'text-teal-500' : 'text-fg-mid hover:text-fg-hi'}`}>
                {item.label}<span className="text-micro">▾</span>
              </button>
              {open === i && (
                <div className="absolute left-0 top-full bg-ink-800 border border-edge rounded-lg min-w-56 py-2 z-50">
                  {item.sub.map((sub, j) => (
                    <div key={j} className="relative"
                      onMouseEnter={() => setSubOpen(j)} onMouseLeave={() => setSubOpen(null)}>
                      <button onClick={() => handleNav(sub.slug)}
                        className="flex w-full items-center justify-between bg-transparent border-0 cursor-pointer text-body text-fg-mid hover:text-fg-hi hover:bg-ink-700 px-4 py-2 text-left">
                        <span>{sub.label}</span>
                        {sub.brands?.length > 0 && <span className="text-micro text-fg-low">▸</span>}
                      </button>
                      {subOpen === j && sub.brands?.length > 0 && (
                        <div className="absolute left-full top-0 bg-ink-800 border border-edge rounded-lg min-w-44 py-2">
                          {sub.brands.map((brand, k) => (
                            <button key={k} onClick={() => handleNav(sub.slug, brand)}
                              className="block w-full bg-transparent border-0 cursor-pointer text-body text-fg-mid hover:text-fg-hi hover:bg-ink-700 px-4 py-2 text-left">
                              {brand}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-ink-950/80 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile menu */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-full bg-ink-950 border-l border-edge z-50 flex flex-col transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-edge">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Optimus Sphere Tech" className="h-9 w-9 object-contain" loading="lazy" decoding="async" />
            <span className="flex flex-col leading-none">
              <span className="text-card-title text-fg-hi">OPTIMUS</span>
              <span className="text-micro text-fg-low uppercase">SPHERE TECH</span>
            </span>
          </div>
          <button onClick={() => setMobileOpen(false)} aria-label="Close menu"
            className="bg-transparent border-0 cursor-pointer text-fg-hi text-card-title min-w-11 min-h-11">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <button onClick={goHome}
            className="flex w-full items-center gap-2 bg-transparent border-0 cursor-pointer text-body text-fg-hi px-4 py-3 min-h-11 text-left">
            🏠 <span>Home</span>
          </button>
          {menuData.map((item, i) => (
            <div key={i} className="border-t border-edge">
              <button onClick={() => setMobileExpanded(mobileExpanded === i ? null : i)}
                className="flex w-full items-center justify-between bg-transparent border-0 cursor-pointer text-body text-fg-hi px-4 py-3 min-h-11 text-left">
                <span>{item.label}</span>
                <span className="text-micro text-fg-low">{mobileExpanded === i ? '▴' : '▾'}</span>
              </button>
              {mobileExpanded === i && (
                <div className="pb-2">
                  <button onClick={() => handleNav(item.slug)}
                    className="block w-full bg-transparent border-0 cursor-pointer text-body text-teal-500 px-6 py-2 min-h-11 text-left">
                    → View all {item.label}
                  </button>
                  {item.sub.map((sub, j) => (
                    <div key={j}>
                      <button
                        onClick={() => {
                          if (sub.brands?.length > 0) {
                            setMobileSubExpanded(mobileSubExpanded === `${i}-${j}` ? null : `${i}-${j}`);
                          } else { handleNav(sub.slug); }
                        }}
                        className="flex w-full items-center justify-between bg-transparent border-0 cursor-pointer text-body text-fg-mid px-6 py-2 min-h-11 text-left">
                        <span>→ {sub.label}</span>
                        {sub.brands?.length > 0 && (
                          <span className="text-micro text-fg-low">{mobileSubExpanded === `${i}-${j}` ? '▴' : '▾'}</span>
                        )}
                      </button>
                      {mobileSubExpanded === `${i}-${j}` && sub.brands?.map((brand, k) => (
                        <button key={k} onClick={() => handleNav(sub.slug, brand)}
                          className="block w-full bg-transparent border-0 cursor-pointer text-body text-fg-low px-8 py-2 min-h-11 text-left">
                          • {brand}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-edge p-4">
          <a href="https://wa.me/254759962068" target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-whatsapp text-ink-950 text-body font-medium rounded-full px-6 py-3 min-h-11">
            💬 Chat on WhatsApp
          </a>
          <div className="text-body text-fg-low mt-4 space-y-1">
            <div>📞 0759 962 068</div>
            <div>📞 0757 255 539</div>
            <div>📍 Mithoo Biashara Centre, Basement B69</div>
          </div>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Delete the stylesheet**

Run: `git rm src/styles/Navbar.css`
Also confirm no `import '../styles/Navbar.css'` remains in Navbar.js (the replacement above has none).

- [ ] **Step 3: Build + verify**

Run: `npm run build`
Expected: `Compiled successfully`. Then `grep -rn "nav-header\|main-bar\|hamburger-btn" src/` → no hits (old classnames dead).

- [ ] **Step 4: Functional smoke (npm start)**

Verify: sticky bar on scroll; desktop dropdown → brand submenu → navigates to `/category/<slug>?brand=<brand>`; cart badge shows count after adding an item; mobile drawer opens/closes, rows ≥44px tall; search filters products; Escape clears search.

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.js
git commit -m "feat(p2): Navbar on design tokens — sticky ink-950, supports-gated blur (D5), 44px mobile targets; delete Navbar.css"
```

---

### Task 2: Convert Hero to statement Option A, delete Hero.css

**Files:**
- Modify: `src/components/Hero.js` (full replacement below)
- Delete: `src/styles/Hero.css`

Design intent (anti-flat): layered `glow-teal` radials over `ink-950`, `display-xl` type, floating product card on `ink-800` with edge border + `glow-featured`. D6 lazy discipline via a `warmed` set: slide N+1's image mounts only when N becomes active.

- [ ] **Step 1: Replace src/components/Hero.js with exactly this**

(The `defaultSlides`, `accentColors` rotation, Supabase fetch and field mapping are preserved; `bg`/`accent` fields are no longer used for styling — tokens rule — but mapping stays so admin data flows identically.)

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const defaultSlides = [
  {
    id: 1, tag: 'Now in Stock', icon: '🎮', title: 'PlayStation 4 & 5',
    sub: 'Ex-UK consoles with controllers. Ready to play today.',
    price: 'From KSh 25,000', oldPrice: 'KSh 35,000', cta: 'Shop Gaming',
    slug: 'gaming', img: '/images/IMG-20260524-WA0071.jpg',
  },
  {
    id: 2, tag: 'Latest Arrivals', icon: '📱', title: 'iPhone 13 Series',
    sub: 'Premium smartphones with A15 Bionic power.',
    price: 'From KSh 45,000', oldPrice: null, cta: 'Shop Phones',
    slug: 'phones', img: '/images/IMG-20260524-WA0090.jpg',
  },
  {
    id: 3, tag: 'Audio Deals', icon: '🎧', title: 'Sony WH-1000XM5',
    sub: 'Industry-leading noise cancellation flagship headphones.',
    price: 'KSh 49,000', oldPrice: null, cta: 'Shop Audio',
    slug: 'audio', img: '/images/IMG-20260524-WA0077.jpg',
  },
];

const icons = ['🎮', '📱', '🎧'];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);
  // D6 lazy discipline: an image mounts only once its slide index is "warmed".
  // Initially the active slide (0) and its successor (1). Slide 3 stays unfetched
  // until slide 2 is active.
  const [warmed, setWarmed] = useState(() => new Set([0, 1]));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from('hero_slides').select('*').order('sort_order');
      if (!error && data && data.length > 0) {
        setSlides(data.map((s, i) => ({
          id: s.id,
          tag: s.tag || 'FEATURED',
          icon: icons[i % icons.length],
          title: s.title,
          sub: s.subtitle || '',
          price: s.price || '',
          oldPrice: null,
          cta: 'Shop Now',
          slug: s.category_slug || 'gaming',
          img: s.image || null,
        })));
        setWarmed(new Set([0, 1]));
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Warm the next slide whenever the active one changes (D6).
  useEffect(() => {
    setWarmed(prev => {
      const next = new Set(prev);
      next.add(active);
      next.add((active + 1) % slides.length);
      return next;
    });
  }, [active, slides.length]);

  const slide = slides[active];

  return (
    <section className="hero-section relative overflow-hidden bg-ink-950 font-sans">
      {/* Atmosphere — two glow layers (anti-flat mandate) */}
      <div aria-hidden="true" className="absolute -top-24 -right-16 w-96 h-96 bg-glow-teal" />
      <div aria-hidden="true" className="absolute -bottom-32 -left-24 w-96 h-96 bg-glow-teal opacity-60" />

      <div className="relative max-w-screen-xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Counter */}
        <div className="text-label uppercase text-fg-low mb-6">
          <strong className="text-fg-hi font-medium">0{active + 1}</strong> / 0{slides.length}
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-10">
          {/* Statement content */}
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-2 border border-edge rounded-full px-4 py-1 text-label uppercase text-fg-mid">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              {slide.tag}
            </span>

            <h1 className="text-display-xl text-fg-hi mt-6 max-w-2xl">{slide.title}</h1>
            <p className="text-body text-fg-mid mt-4 max-w-md">{slide.sub}</p>

            <div className="flex items-baseline gap-3 mt-6">
              <span className="text-price text-teal-500">{slide.price}</span>
              {slide.oldPrice && (
                <span className="text-body text-fg-low line-through">{slide.oldPrice}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <button onClick={() => navigate(`/category/${slide.slug}`)}
                className="bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-6 py-3 cursor-pointer min-h-11">
                {slide.cta} →
              </button>
              <button onClick={() => navigate('/')}
                className="bg-transparent text-fg-hi text-body border border-edge rounded-full px-6 py-3 cursor-pointer min-h-11">
                View All Deals
              </button>
            </div>
          </div>

          {/* Floating product card (small, lazy, aspect-locked — zero CLS) */}
          <div className="relative w-48 md:w-64 shrink-0 self-center md:self-end">
            <div className="relative aspect-square bg-ink-800 border border-edge rounded-xl shadow-glow-featured overflow-hidden">
              {slides.map((s, i) =>
                warmed.has(i) && s.img ? (
                  <img
                    key={s.id}
                    src={s.img}
                    alt={s.title}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-0'}`}
                  />
                ) : null
              )}
              {!slide.img && (
                <div className="absolute inset-0 flex items-center justify-center text-display">{slide.icon}</div>
              )}
            </div>
            {slide.price && (
              <div className="absolute -bottom-3 left-3 bg-ink-800 border border-edge rounded-lg px-3 py-1">
                <div className="text-micro text-fg-low uppercase">Starting at</div>
                <div className="text-body font-medium text-teal-500">{slide.price}</div>
              </div>
            )}
          </div>
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-12">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1 rounded-full border-0 cursor-pointer transition-opacity duration-300 ${i === active ? 'w-8 bg-teal-500' : 'w-4 bg-ink-700'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Delete the stylesheet**

Run: `git rm src/styles/Hero.css`

- [ ] **Step 3: Build + verify**

Run: `npm run build` → `Compiled successfully`.
`grep -rn "hero-h1\|hero-imgwrap\|hero-cta" src/` → no hits.
(`.hero-section` class is intentionally KEPT on the section element: `App.css` line 36 has a mobile margin override targeting it; that rule dies with App.css in Phase 5.)

- [ ] **Step 4: Functional + D6 smoke (npm start, DevTools Network tab)**

1. On load: ONLY slide 1's image (+ slide 2 after warm) requested; slide 3's image absent from network until slide 2 becomes active.
2. Crossfade on auto-advance (6s) and dot click; no layout shift (aspect-locked card).
3. CTA navigates to the slide's category; "View All Deals" navigates home.
4. Admin flow: in `/admin` Hero Slides tab, edit a slide title → homepage hero shows it (Supabase mapping intact).

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.js
git commit -m "feat(p2): statement hero on tokens — glow atmosphere, display-xl, D6 lazy crossfade; delete Hero.css"
```

---

### Task 3: Convert TrustBar, delete TrustBar.css

**Files:**
- Modify: `src/components/TrustBar.js` (full replacement below)
- Delete: `src/styles/TrustBar.css`

- [ ] **Step 1: Replace src/components/TrustBar.js with exactly this**

```jsx
import React from 'react';

const items = [
  { icon: '⭐', title: '4.9 / 5 Trustscore', sub: 'Trusted by hundreds' },
  { icon: '🚚', title: 'Nairobi Delivery', sub: 'Fast & reliable' },
  { icon: '📲', title: 'We accept M-Pesa', sub: 'All cards too' },
  { icon: '✅', title: 'No fakes!', sub: 'Only original products' },
];

export default function TrustBar() {
  return (
    <div className="bg-ink-900 border-y border-edge font-sans">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-screen-xl mx-auto px-4 py-6">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <span className="text-card-title" aria-hidden="true">{item.icon}</span>
            <div>
              <div className="text-label uppercase text-fg-hi">{item.title}</div>
              <div className="text-micro text-fg-low">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Delete stylesheet, build, verify**

Run: `git rm src/styles/TrustBar.css && npm run build`
Expected: `Compiled successfully`; `grep -rn "trust-bar\|trust-item" src/` → no hits.

- [ ] **Step 3: Commit**

```bash
git add src/components/TrustBar.js
git commit -m "feat(p2): TrustBar on tokens — Runway label treatment; delete TrustBar.css"
```

---

### Task 4: Phase gates — Lighthouse, push, report, STOP

- [ ] **Step 1: Test suite**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: PASS (OPTIMUS smoke test).

- [ ] **Step 2: Lighthouse vs baseline (same method as Phase 1)**

```bash
npm run build && npx serve -s build -l 3001
# 3 runs each on /, /category/games, /product/<SKU from docs/perf-baseline.md>
# using the exact Phase 1 lighthouse command; record medians
```
Expected: every page ≥ its `docs/perf-baseline.md` floor. Homepage should IMPROVE (hero images now lazy + aspect-locked). If any score regresses: STOP, diagnose, fix before push.

- [ ] **Step 3: Push**

Run: `git push origin redesign/premium-dark`

- [ ] **Step 4: Report to Edgar and STOP — Phase 2 exit gates (manual, his)**

The report must include: Lighthouse table vs baseline, tokens added since Phase 1 (expected: none — flag any), styling deleted (`Navbar.css`, `Hero.css`, `TrustBar.css`), preview URL, and these three gates for Edgar on his phone:
1. **Anti-flat gate (D4 mandate):** does the hero read cinematic — glow atmosphere visible, type carrying the page? If inert → tune glow opacity/saturation as named token variants, re-push, re-check, BEFORE Phase 3.
2. **Android scroll gate (D5):** scroll under the sticky nav on the mid-range Android — jank means we delete the blur classes (solid is the design).
3. **Admin hero CRUD:** edit a slide in `/admin`, confirm it renders.

**NO Phase 3 work until all three gates pass.**

---

## Self-Review (done at write time)

- **Spec coverage:** D1 statement hero ✓ (Task 2), D5 supports-gated blur ✓ (Task 1 header classes), D6 warmed-set lazy crossfade ✓ (Task 2), anti-flat mandate as exit gate ✓ (Task 4), deletion ledger ✓ (3 CSS files), §2.3 functionality preservation enumerated per task ✓, Lighthouse gate ✓.
- **No-ad-hoc check:** every class in the plan resolves to config tokens or default-theme structural utilities (spacing/flex/grid/z/duration/opacity steps). Alpha modifiers used: `bg-ink-950/90` (blur variant), `bg-ink-950/80` (overlay scrim ≈ spec's scrim token), `opacity-60` (second glow layer) — these are Tailwind opacity steps on token colors, not new colors; flagged here for the phase summary.
- **Placeholder scan:** the `<<< PASTE menuData >>>` marker references existing lines 6–45 verbatim (data preservation, not deferred design); `<SKU>` comes from `docs/perf-baseline.md`. No TBDs.
- **Type consistency:** class names match `tailwind.config.js` exactly (`text-display-xl`, `text-card-title`, `text-label`, `text-micro`, `text-price`, `bg-glow-teal`, `shadow-glow-featured`, `rounded-xl/lg/full`, `border-edge`, `fg-hi/mid/low`, `min-h-11` = 44px from default scale).
