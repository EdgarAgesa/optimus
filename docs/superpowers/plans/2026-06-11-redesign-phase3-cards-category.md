# Premium Redesign — Phase 3: Cards + Category Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the homepage commerce sections (CategoryBanner, DealsOfDay, PopularGames) and CategoryPage to the token system via a shared ProductCard; replace the banner's remote stock photos with zero-bandwidth gradient identity cards (D7 snap-peek); remove three verified-dead components; end ≥ Lighthouse floor on a preview deploy.

**Architecture:** One new shared `ProductCard` component (DRY — the identical card markup currently repeats in DealsOfDay, PopularGames, and CategoryPage). Tokens only; two NEW named gradients (`grad-tv`, `grad-laptops`) are added to `tailwind.config.js` in Task 1 and flagged in the phase summary per the no-ad-hoc rule. Spec: `docs/superpowers/specs/2026-06-11-premium-redesign-design.md` (§5 category cards/product cards, D7 peek).

**Scope discoveries (verified 2026-06-11, binding on this plan):**
- `src/components/Categories.js` and `src/components/FeaturedProducts.js` are imported by NOTHING (HomePage mounts CategoryBanner/DealsOfDay/PopularGames only). `FeaturedProducts` additionally maps over the EMPTY `src/data/products.js`.
- `src/components/ProductDrawer.js` is imported ONLY by dead FeaturedProducts → also dead.
- Task 5 DELETES all three components + their CSS. **DEVIATION from spec §6:** ProductDrawer was listed in Phase 4 scope; it leaves the codebase here instead. Flag in the phase summary.
- `CategoryBanner` currently hot-links istockphoto/pexels stock images on the homepage — replaced by CSS gradients (spec §5), which also helps the homepage Lighthouse floor.

**Functionality that must survive (spec §2.3):** Supabase `deals` join + auto-deals fallback logic; `useProducts()`/`useCart()` wiring; `categoryMap`/`slugToTitle`/`allSidebarCategories` data; brand filter via `?brand=` URL param; sort; pagination logic; `window.scrollTo` behaviors; Helmet SEO block; legacy slug redirects (in App.js, untouched).

---

### Task 1: New gradient tokens + shared ProductCard component

**Files:**
- Modify: `tailwind.config.js` (backgroundImage — two additions)
- Create: `src/components/ProductCard.js`

- [ ] **Step 1: Add the two named gradients** to `theme.extend.backgroundImage` in `tailwind.config.js` (after `'grad-phones'`):

```js
        'grad-tv': 'linear-gradient(160deg, #0097a7 0%, #06161b 100%)',
        'grad-laptops': 'linear-gradient(200deg, #00bcd4 0%, #123a45 70%, #06161b 100%)',
```

- [ ] **Step 2: Create `src/components/ProductCard.js`** with exactly:

```jsx
import React from 'react';

// Shared product card (spec 5): ink-800 surface, edge border, radius-16 standard /
// radius-32 + glow when featured. Used by DealsOfDay, PopularGames, CategoryPage.
export default function ProductCard({
  product: p,
  featured = false,
  onOpen,
  onAddToCart,
  secondaryLabel = null,
  onSecondary = null,
}) {
  return (
    <div
      onClick={onOpen}
      className={`relative flex flex-col bg-ink-800 border border-edge overflow-hidden cursor-pointer transition-colors duration-200 hover:bg-ink-700 font-sans ${featured ? 'rounded-feat shadow-glow-featured' : 'rounded-xl'}`}
    >
      {p.badge && (
        <span
          className={`absolute top-3 left-3 z-10 text-micro font-medium rounded-full px-2 py-1 ${p.badge === 'SALE' ? 'bg-accent text-white' : 'bg-teal-500 text-ink-950'}`}
        >
          {p.badge}
        </span>
      )}

      <div className="relative aspect-square bg-ink-900">
        {p.img ? (
          <img
            src={p.img}
            alt={p.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-display">{p.icon}</span>
        )}
      </div>

      <div className="flex-1 p-4">
        <div className="text-label uppercase text-fg-low">{p.brand}</div>
        <div className="text-card-title text-fg-hi mt-1 line-clamp-2">{p.name}</div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-price text-teal-500">{p.price}</span>
          {p.oldPrice && <span className="text-body text-fg-low line-through">{p.oldPrice}</span>}
        </div>
      </div>

      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
          className="flex-1 bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-4 py-2 cursor-pointer min-h-11"
        >
          + Cart
        </button>
        {secondaryLabel && (
          <button
            onClick={(e) => { e.stopPropagation(); onSecondary(p); }}
            className="flex-1 bg-transparent text-fg-hi text-body border border-edge rounded-full px-4 py-2 cursor-pointer min-h-11"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build, commit**

`npm run build` → Compiled successfully (component not yet used; verifies syntax).

```bash
git add tailwind.config.js src/components/ProductCard.js
git commit -m "feat(p3): grad-tv + grad-laptops tokens; shared ProductCard component"
```

---

### Task 2: DealsOfDay + PopularGames on ProductCard, delete their CSS

**Files:**
- Modify: `src/components/DealsOfDay.js`
- Modify: `src/components/PopularGames.js`
- Delete: `src/styles/DealsOfDay.css`, `src/styles/PopularGames.css`

- [ ] **Step 1: In DealsOfDay.js** — keep ALL imports except the CSS import (delete `import '../styles/DealsOfDay.css';`, add `import ProductCard from './ProductCard';`), keep the Supabase fetch + mapping + `categoryOrder` + `autoDeals` + `deals` logic EXACTLY as-is, and replace ONLY the returned JSX with:

```jsx
  return (
    <section className="bg-ink-900 font-sans">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="inline-block bg-accent text-white text-label uppercase rounded-full px-3 py-1">
              Limited Time
            </span>
            <h2 className="text-heading text-fg-hi mt-3">Deals of the Day</h2>
          </div>
          <button
            onClick={() => navigate('/category/gaming')}
            className="bg-transparent text-fg-hi text-body border border-edge rounded-full px-5 py-2 cursor-pointer min-h-11 shrink-0"
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {deals.map((p, i) => (
            <ProductCard
              key={p.sku}
              product={p}
              featured={i === 0}
              onOpen={() => navigate(`/product/${encodeURIComponent(p.sku)}`)}
              onAddToCart={(prod) => addToCart(prod, 1)}
              secondaryLabel="Details"
              onSecondary={(prod) => navigate(`/product/${encodeURIComponent(prod.sku)}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
```

(The red "Limited Time" pill is the deals red-identity moment — spec §4 red rules. The 🔥 emoji is dropped; first card is the featured radius-32 + glow moment.)

- [ ] **Step 2: In PopularGames.js** — same surgery: delete the CSS import, add `import ProductCard from './ProductCard';`, keep the `items` filter logic exactly, replace the returned JSX with:

```jsx
  return (
    <section className="bg-ink-900 font-sans">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-label uppercase text-teal-500">Most Wanted</span>
            <h2 className="text-heading text-fg-hi mt-2">Popular Games &amp; Consoles</h2>
          </div>
          <button
            onClick={() => navigate('/category/gaming')}
            className="bg-transparent text-fg-hi text-body border border-edge rounded-full px-5 py-2 cursor-pointer min-h-11 shrink-0"
          >
            View all gaming →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard
              key={p.sku}
              product={p}
              onOpen={() => navigate(`/product/${encodeURIComponent(p.sku)}`)}
              onAddToCart={(prod) => addToCart(prod, 1)}
            />
          ))}
        </div>
      </div>
    </section>
  );
```

- [ ] **Step 3: Delete stylesheets, build, grep, test**

```bash
git rm src/styles/DealsOfDay.css src/styles/PopularGames.css
npm run build
grep -rn "deal-card\|deals-grid\|pop-card\|popular-grid" src/   # expect: no hits
CI=true npx react-scripts test --watchAll=false                  # expect: pass
```

- [ ] **Step 4: Commit**

```bash
git add src/components/DealsOfDay.js src/components/PopularGames.js
git commit -m "feat(p3): DealsOfDay + PopularGames on shared ProductCard; red deals identity, featured first card; delete their CSS"
```

---

### Task 3: CategoryBanner → gradient identity snap-row (D7), delete CSS

**Files:**
- Modify: `src/components/CategoryBanner.js` (full replacement below)
- Delete: `src/styles/CategoryBanner.css`

- [ ] **Step 1: Replace src/components/CategoryBanner.js with exactly:**

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Gradient identity cards (spec 5): zero-bandwidth CSS replaces the previous
// remote stock photos. Mobile: scroll-snap row with next-card peek (D7) —
// w-72 cards on 360-414px viewports leave ~15-25% of the next card visible.
const cats = [
  { label: 'Music lovers on the go', sub: 'Wired & wireless', slug: 'audio', grad: 'bg-grad-audio' },
  { label: 'TVs & accessories', sub: 'Wide variety', slug: 'tv-streaming', grad: 'bg-grad-tv' },
  { label: 'Games and consoles', sub: 'PS4 · PS5 · Xbox · Nintendo', slug: 'gaming', grad: 'bg-grad-gaming' },
  { label: 'Smartphones & tablets', sub: 'All top brands', slug: 'phones', grad: 'bg-grad-phones' },
  { label: 'Laptops', sub: 'HP · Dell · Lenovo · Mac', slug: 'laptops', grad: 'bg-grad-laptops' },
];

export default function CategoryBanner() {
  const navigate = useNavigate();

  return (
    <section className="bg-ink-900 font-sans">
      <div className="max-w-screen-xl mx-auto py-12">
        <h2 className="text-heading text-fg-hi px-4 mb-6">Shop by category</h2>
        <div className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-pl-4 px-4 pb-2">
          {cats.map((c) => (
            <button
              key={c.slug}
              onClick={() => navigate(`/category/${c.slug}`)}
              className={`relative snap-start shrink-0 w-72 md:w-auto h-44 ${c.grad} rounded-feat border-0 p-6 flex flex-col justify-end items-start text-left cursor-pointer overflow-hidden`}
            >
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
              <span aria-hidden="true" className="absolute top-4 right-5 text-card-title text-white">→</span>
              <span className="relative text-label uppercase text-fg-mid">{c.sub}</span>
              <span className="relative text-card-title text-white mt-1">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
```

(Cards are now real `<button>`s — keyboard reachable with the global focus ring, an a11y upgrade over the old clickable divs. The `from-ink-950/70` scrim is a token color + opacity step, same approved pattern as the drawer scrim.)

- [ ] **Step 2: Delete stylesheet, build, grep, test**

```bash
git rm src/styles/CategoryBanner.css
npm run build
grep -rn "cat-banner\|cat-card\|cat-overlay" src/   # expect: no hits
CI=true npx react-scripts test --watchAll=false      # expect: pass
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CategoryBanner.js
git commit -m "feat(p3): CategoryBanner as gradient identity snap-row (D7 peek) — stock photos out, zero-bandwidth gradients in; delete CategoryBanner.css"
```

---

### Task 4: CategoryPage on tokens + ProductCard + mobile brand pills, delete CSS

**Files:**
- Modify: `src/pages/CategoryPage.js`
- Delete: `src/styles/CategoryPage.css`

- [ ] **Step 1: Apply this surgery to src/pages/CategoryPage.js.** PRESERVE EXACTLY: all imports except the CSS line, `categoryMap`, `slugToTitle`, `allSidebarCategories`, `PRODUCTS_PER_PAGE`, all state/hooks/effects, all handler functions, all filter/sort/pagination logic, and the entire `<Helmet>` block. Add `import ProductCard from '../components/ProductCard';`. Replace ONLY the returned JSX below the Helmet block with:

```jsx
      <div className="bg-ink-900 min-h-screen font-sans">
        {/* Header */}
        <div className="bg-ink-950 border-b border-edge">
          <div className="max-w-screen-xl mx-auto px-4 py-8">
            <div className="flex items-center gap-2 text-body text-fg-low">
              <span onClick={() => navigate('/')} className="cursor-pointer hover:text-fg-hi">Home</span>
              <span>›</span>
              <span className="text-fg-mid">{title}</span>
              {brandFilter && (
                <>
                  <span>›</span>
                  <span className="text-teal-500">{brandFilter}</span>
                </>
              )}
            </div>
            <h1 className="text-display text-fg-hi mt-2">{title}</h1>
            <p className="text-body text-fg-low mt-1">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
              {brandFilter && ` for "${brandFilter}"`}
            </p>
            {brandFilter && (
              <button
                onClick={() => handleBrandFilter(null)}
                className="inline-flex items-center gap-1 mt-3 bg-teal-500 text-ink-950 text-label uppercase rounded-full px-3 py-1 border-0 cursor-pointer min-h-11"
              >
                {brandFilter} ✕
              </button>
            )}
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {filtersOpen && (
          <div className="fixed inset-0 bg-ink-950/80 z-40 md:hidden" onClick={() => setFiltersOpen(false)} />
        )}

        <div className="max-w-screen-xl mx-auto px-4 py-6 md:flex md:gap-6">
          {/* Sidebar: mobile drawer / desktop static rail */}
          <aside
            className={`fixed top-0 left-0 h-full w-72 bg-ink-950 border-r border-edge z-50 flex flex-col transition-transform duration-300 md:static md:h-auto md:w-56 md:shrink-0 md:bg-transparent md:border-0 md:translate-x-0 ${filtersOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex md:hidden items-center justify-between px-4 py-4 border-b border-edge">
              <div>
                <div className="text-card-title text-fg-hi">Browse</div>
                <div className="text-micro text-fg-low">Categories &amp; Filters</div>
              </div>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters"
                className="bg-transparent border-0 cursor-pointer text-fg-hi text-card-title min-w-11 min-h-11">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto md:overflow-visible p-4 md:p-0">
              <div>
                <div className="text-label uppercase text-fg-low mb-2">Categories</div>
                {allSidebarCategories.map((cat) => (
                  <div key={cat.slug}>
                    <div
                      onClick={() => handleCategoryNav(cat.slug)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-body cursor-pointer min-h-11 ${slug === cat.slug ? 'bg-ink-800 text-teal-500' : 'text-fg-mid hover:text-fg-hi'}`}
                    >
                      <span aria-hidden="true">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                    {cat.children.map((child) => (
                      <div
                        key={child.slug}
                        onClick={() => handleCategoryNav(child.slug)}
                        className={`flex items-center gap-2 pl-8 pr-3 py-2 rounded-lg text-body cursor-pointer min-h-11 ${slug === child.slug ? 'bg-ink-800 text-teal-500' : 'text-fg-low hover:text-fg-hi'}`}
                      >
                        <span className="w-1 h-1 rounded-full bg-fg-low" aria-hidden="true" />
                        {child.label}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {allInCategory.length > 0 && (
                <div className="mt-6">
                  <div className="text-label uppercase text-fg-low mb-2">Filter by Brand</div>
                  <div
                    onClick={() => handleBrandFilter(null)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-body cursor-pointer min-h-11 ${!brandFilter ? 'bg-ink-800 text-teal-500' : 'text-fg-mid hover:text-fg-hi'}`}
                  >
                    <span>All Brands</span>
                    <span className="text-micro text-fg-low">{allInCategory.length}</span>
                  </div>
                  {brands.map(b => {
                    const count = allInCategory.filter(p => p.brand === b).length;
                    return (
                      <div
                        key={b}
                        onClick={() => handleBrandFilter(b)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-body cursor-pointer min-h-11 ${brandFilter === b ? 'bg-ink-800 text-teal-500' : 'text-fg-mid hover:text-fg-hi'}`}
                      >
                        <span>{b}</span>
                        <span className="text-micro text-fg-low">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {/* Mobile brand pills (spec 5: pill-tab filter row) */}
            {allInCategory.length > 0 && (
              <div className="flex md:hidden gap-2 overflow-x-auto snap-x scroll-pl-4 pb-3 -mx-4 px-4">
                <button
                  onClick={() => handleBrandFilter(null)}
                  className={`snap-start shrink-0 rounded-full px-4 py-2 text-body min-h-11 cursor-pointer ${!brandFilter ? 'bg-teal-500 text-ink-950 font-medium border-0' : 'bg-transparent text-fg-mid border border-edge'}`}
                >
                  All Brands
                </button>
                {brands.map(b => (
                  <button
                    key={b}
                    onClick={() => handleBrandFilter(b)}
                    className={`snap-start shrink-0 rounded-full px-4 py-2 text-body min-h-11 cursor-pointer ${brandFilter === b ? 'bg-teal-500 text-ink-950 font-medium border-0' : 'bg-transparent text-fg-mid border border-edge'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="md:hidden bg-transparent text-fg-hi text-body border border-edge rounded-full px-4 py-2 cursor-pointer min-h-11"
                >
                  ☰ Browse
                </button>
                <span className="text-body text-fg-mid">
                  <strong className="text-fg-hi">{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''}
                  {brandFilter && <span className="text-fg-low"> · {brandFilter}</span>}
                </span>
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-ink-800 border border-edge rounded-full text-body text-fg-hi px-4 h-11 outline-none cursor-pointer"
              >
                <option value="default">Sort: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-display" aria-hidden="true">🔍</div>
                <p className="text-card-title text-fg-hi mt-4">No products found</p>
                <p className="text-body text-fg-low mt-1">
                  {brandFilter
                    ? `No ${brandFilter} products here yet.`
                    : 'No products in this category yet.'}
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  {brandFilter && (
                    <button
                      onClick={() => handleBrandFilter(null)}
                      className="bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-6 py-3 cursor-pointer min-h-11"
                    >
                      Clear Filter
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/')}
                    className="bg-transparent text-fg-hi text-body border border-edge rounded-full px-6 py-3 cursor-pointer min-h-11"
                  >
                    ← Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map((p) => (
                    <ProductCard
                      key={p.sku}
                      product={p}
                      onOpen={() => navigate(`/product/${encodeURIComponent(p.sku)}`)}
                      onAddToCart={(prod) => addToCart(prod, 1)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <>
                    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="bg-transparent text-fg-mid text-body border border-edge rounded-full px-4 min-h-11 cursor-pointer disabled:opacity-50"
                      >
                        ← Prev
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                          const showPage =
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                          const showDots =
                            (pageNum === currentPage - 2 && currentPage > 3) ||
                            (pageNum === currentPage + 2 && currentPage < totalPages - 2);

                          if (showDots) {
                            return <span key={pageNum} className="text-fg-low px-2">···</span>;
                          }
                          if (!showPage) return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`min-w-11 min-h-11 rounded-full text-body cursor-pointer ${currentPage === pageNum ? 'bg-teal-500 text-ink-950 font-medium border-0' : 'bg-transparent text-fg-mid border border-edge'}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="bg-transparent text-fg-mid text-body border border-edge rounded-full px-4 min-h-11 cursor-pointer disabled:opacity-50"
                      >
                        Next →
                      </button>
                    </div>

                    <div className="text-body text-fg-low text-center mt-4">
                      Page <strong className="text-teal-500">{currentPage}</strong> of{' '}
                      <strong className="text-fg-hi">{totalPages}</strong> · Showing{' '}
                      <strong className="text-fg-hi">{startIdx + 1}-{Math.min(endIdx, filtered.length)}</strong> of{' '}
                      <strong className="text-fg-hi">{filtered.length}</strong> products
                    </div>
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>
```

Notes: the 📂/🏷️ sidebar section emojis are dropped (plain labels); category icons (🎮 etc.) stay — they're data, not styling. The mobile brand-pill row is NEW per spec §5 (pill-tab filter row); the sidebar drawer remains for category navigation.

- [ ] **Step 2: Delete stylesheet, build, grep, test**

```bash
git rm src/styles/CategoryPage.css
npm run build
grep -rn "cat-page\|pcard\|filter-item\|page-btn\|cat-sidebar" src/   # expect: no hits
CI=true npx react-scripts test --watchAll=false                        # expect: pass
```

- [ ] **Step 3: Functional smoke (npm start)**

`/category/games` renders; brand pill + sidebar filter both set `?brand=`; sort works; pagination pages and scrolls to top; `/category/ps5-games` redirects to `/category/games`; `/category/tablets` and `/category/soundbars` render; Helmet title in tab.

- [ ] **Step 4: Commit**

```bash
git add src/pages/CategoryPage.js
git commit -m "feat(p3): CategoryPage on tokens + ProductCard — mobile brand pills, tokenized sidebar/pagination; delete CategoryPage.css"
```

---

### Task 5: Remove dead components (flagged scope decision)

**Files:**
- Delete: `src/components/Categories.js`, `src/styles/Categories.css`
- Delete: `src/components/FeaturedProducts.js`, `src/styles/FeaturedProducts.css`
- Delete: `src/components/ProductDrawer.js`, `src/styles/ProductDrawer.css`

- [ ] **Step 1: Re-verify deadness, then delete**

```bash
grep -rn "FeaturedProducts\|ProductDrawer\|components/Categories" src/ --include="*.js" | grep -v "^src/components/\(Categories\|FeaturedProducts\|ProductDrawer\)\.js"
# expect: NO hits outside the three files themselves. If ANY hit appears, STOP — report BLOCKED.
git rm src/components/Categories.js src/styles/Categories.css \
       src/components/FeaturedProducts.js src/styles/FeaturedProducts.css \
       src/components/ProductDrawer.js src/styles/ProductDrawer.css
```

- [ ] **Step 2: Build + test + commit**

```bash
npm run build   # must compile — proves nothing imported them
CI=true npx react-scripts test --watchAll=false
git commit -m "chore(p3): remove dead components — Categories, FeaturedProducts (empty data source), ProductDrawer (only consumer was dead); spec deviation: ProductDrawer leaves here instead of Phase 4"
```

---

### Task 6: Phase gates — tests, Lighthouse, push, STOP

- [ ] **Step 1:** Full suite + build green.
- [ ] **Step 2:** Lighthouse vs floors (Phase 1 method; serve build on :3001): `/` (expect IMPROVEMENT — stock photos gone), `/category/games` (most-changed page), product page (untouched; 5-run median if noisy). All scores ≥ `docs/perf-baseline.md` floors or STOP and fix.
- [ ] **Step 3:** `git push origin redesign/premium-dark`.
- [ ] **Step 4:** Report to Edgar with: Lighthouse table, tokens added (`grad-tv`, `grad-laptops` — expected; flag any others), styling deleted (6 CSS files + 3 dead components), deviations (ProductDrawer early removal), and his manual gates:
  1. **Visual:** deals red identity + featured first card reads premium; category gradient row has the 15–25% next-card peek on his phone (D7); banner feels intentional without photos.
  2. **Function:** legacy slugs (`/category/ps5-games` → games), brand filter (pills AND sidebar), sort, pagination.
  3. **Keyboard:** banner cards (now real buttons), brand pills, pagination — all Tab-reachable with the teal ring.

**NO Phase 4 work until Edgar's gates pass.**

---

## Self-Review (done at write time)

- **Spec coverage:** §5 category cards (T3, D7 peek via w-72 + scroll-pl-4), §5 product/deal cards incl. 32/16 featured signature (T1/T2), §5 CategoryPage pill tabs (T4), deletion ledger (6 CSS files, T2-T4) + dead components (T5, flagged deviation), Lighthouse gate (T6).
- **Token discipline:** two new NAMED gradients in T1 (flagged); scrim `from-ink-950/70` + approved opacity-step pattern; no arbitrary brackets anywhere; `line-clamp-2`, `snap-*`, `scroll-pl-4`, `min-h-11`, `disabled:opacity-50` are default structural utilities.
- **Placeholder scan:** none. All component code complete.
- **Type consistency:** ProductCard props (product/featured/onOpen/onAddToCart/secondaryLabel/onSecondary) match all three call sites; gradient class names match config keys.
- **Functionality preservation:** explicitly enumerated per task; CategoryPage logic block untouched by instruction.
```
