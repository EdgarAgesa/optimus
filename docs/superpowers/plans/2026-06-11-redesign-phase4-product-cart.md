# Premium Redesign — Phase 4: Product Page + Cart + Search + Footer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert ProductPage, CartDrawer, SearchOverlay, Toast, Footer, WhatsAppButton to the token system; extract `buildWaMessage()` as a pure tested module (D9); sweep ALL native emoji from these components per the outline-icon law; kill the product page's 0.40 CLS; end with the product page decisively above its 39 floor.

**Architecture:** Same token discipline (no ad-hoc values; arbitrary brackets forbidden). New pure module `src/lib/waMessage.js` (revenue-path logic, unit-tested — the FIRST real unit test of the repo, spec D9). `icons.js` grows the outline set. The cart drawer adopts the SAME a11y contract as the nav drawer (Escape, scroll lock, focus trap, inert-when-closed) — proven pattern from Phase 2, including rendering OUTSIDE any backdrop-filtered ancestor (CartDrawer renders at App level — safe).

**Carry-forwards from Edgar (binding):**
- Product-page exit gate: **decisively above the 39 floor** (the aspect-box conversion kills the 0.40 CLS — that alone should move it).
- ProductDrawer is OUT of the ledger (deleted in Phase 3).
- D8: WhatsApp E2E **on a phone** (cart checkout, Buy via WhatsApp, Ask a Question).
- D9: `buildWaMessage()` unit test.
- **Native-emoji sweep:** cart header 🛒, remove 🗑, WhatsApp 💚/💬, description 📋, specs ⚙️, share 🔗, search 🔍, footer 📍📞💳🛍️❤️, toast ✅ — ALL replaced with outline icons or dropped. The ✕/←/→/›/−/+ text glyphs stay (monochrome, CSS-colored).

**Deletion ledger this phase:** `ProductPage.css`, `CartDrawer.css`, `SearchOverlay.css`, `Toast.css`, `Footer.css`, `WhatsAppButton.css` + the now-dead `.cart-overlay/.cart-drawer/.search-overlay/.search-panel` z-index `!important` patches in `App.css` (die in the same commit as their components).

**Functionality preserved (spec §2.3):** cart logic via `useCart()` (updateQty/removeFromCart/clearCart/formatPrice, localStorage untouched in CartContext); wa.me/254759962068 links and message content; Helmet SEO incl. og: tags; zoom gallery behavior; related-products logic; search results flow; `navigator.share` fallback.

---

### Task 1: waMessage module + D9 unit test (TDD) + icon set additions

**Files:**
- Create: `src/lib/waMessage.js`
- Create: `src/lib/waMessage.test.js`
- Modify: `src/components/icons.js` (append new icons)

- [ ] **Step 1: Write the failing test FIRST** — create `src/lib/waMessage.test.js`:

```js
import { buildWaMessage } from './waMessage';

// Mirrors CartContext's formatPrice exactly (src/context/CartContext.js:102)
const formatPrice = (n) => `KSh ${n.toLocaleString()}`;

test('buildWaMessage produces the exact order message for a known cart', () => {
  const cart = [
    { sku: 'PS5-1', name: 'PS5 Slim 1TB', price: 'KSh 64,999', qty: 2 },
    { sku: 'XM5', name: 'Sony WH-1000XM5', price: 'KSh 38,500', qty: 1 },
  ];
  const cartTotal = 64999 * 2 + 38500; // 168,498

  const encoded = buildWaMessage(cart, cartTotal, formatPrice);
  const decoded = decodeURIComponent(encoded);

  expect(decoded).toBe(
    `Hi! I'd like to order:\n\n` +
    `1. PS5 Slim 1TB\n   Qty: 2 × KSh 64,999 = ${formatPrice(129998)}\n\n` +
    `2. Sony WH-1000XM5\n   Qty: 1 × KSh 38,500 = ${formatPrice(38500)}\n\n` +
    `*Total: ${formatPrice(168498)}*\n\nPlease confirm availability. Thanks!`
  );
});

test('buildWaMessage handles an empty cart without crashing', () => {
  const decoded = decodeURIComponent(buildWaMessage([], 0, formatPrice));
  expect(decoded).toContain(`Hi! I'd like to order:`);
  expect(decoded).toContain(`*Total: ${formatPrice(0)}*`);
});
```

- [ ] **Step 2: Run it — must FAIL** (`Cannot find module './waMessage'`):
`CI=true npx react-scripts test --watchAll=false src/lib/waMessage.test.js`

- [ ] **Step 3: Create `src/lib/waMessage.js`** — the EXACT logic lifted from CartDrawer.js:10-18 (revenue path: byte-identical message text):

```js
// WhatsApp order message — the checkout revenue path (spec D9: unit-tested).
// Logic lifted verbatim from the original CartDrawer.buildWaMessage.
export function buildWaMessage(cart, cartTotal, formatPrice) {
  let msg = `Hi! I'd like to order:\n\n`;
  cart.forEach((item, i) => {
    const price = parseInt(item.price.replace(/\D/g, ''));
    msg += `${i + 1}. ${item.name}\n   Qty: ${item.qty} × ${item.price} = ${formatPrice(price * item.qty)}\n\n`;
  });
  msg += `*Total: ${formatPrice(cartTotal)}*\n\nPlease confirm availability. Thanks!`;
  return encodeURIComponent(msg);
}
```

- [ ] **Step 4: Run tests — must PASS** (both new tests + the OPTIMUS smoke test).

- [ ] **Step 5: Append to `src/components/icons.js`** (same `{...base}` pattern as the existing icons):

```jsx
export const CartIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17" cy="20" r="1.4" />
    <path d="M3 4h2l2.5 11h10L20 7H6" />
  </svg>
);

export const TrashIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
  </svg>
);

export const ChatIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />
    <path d="M9 11h.01M12.5 11h.01M16 11h.01" />
  </svg>
);

export const SearchIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l5 5" />
  </svg>
);

export const ShareIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <circle cx="6" cy="12" r="2.2" /><circle cx="17" cy="6" r="2.2" /><circle cx="17" cy="18" r="2.2" />
    <path d="M8 11l7-4M8 13l7 4" />
  </svg>
);

export const DocIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M7 3h7l4 4v14H7zM14 3v4h4" />
    <path d="M10 12h5M10 16h5" />
  </svg>
);

export const GearIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9L19 19M19 5l-2.1 2.1M7.1 16.9L5 19" />
  </svg>
);

export const PinIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const PhoneCallIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M5 4h4l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);

export const CardIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <rect x="2.5" y="6" width="19" height="13" rx="2" />
    <path d="M2.5 10h19M6 15h4" />
  </svg>
);

export const BagIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M5 8h14l-1 13H6zM8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" />
  </svg>
);

export const HeartIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M12 20s-7.5-4.9-9.3-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.3 11c-1.8 4.1-9.3 9-9.3 9z" />
  </svg>
);
```

- [ ] **Step 6: Build + commit**

```bash
npm run build
git add src/lib/waMessage.js src/lib/waMessage.test.js src/components/icons.js
git commit -m "feat(p4): buildWaMessage as pure tested module (D9, TDD) + outline icon set additions"
```

---

### Task 2: CartDrawer + Toast + WhatsAppButton on tokens, delete 3 CSS + App.css patches

**Files:**
- Modify: `src/components/CartDrawer.js` (full replacement below)
- Modify: `src/components/Toast.js` (full replacement below)
- Modify: `src/components/WhatsAppButton.js` (full replacement below)
- Modify: `src/App.css` (delete dead z-index patches)
- Delete: `src/styles/CartDrawer.css`, `src/styles/Toast.css`, `src/styles/WhatsAppButton.css`

- [ ] **Step 1: Replace src/components/CartDrawer.js with exactly:**

```jsx
import React, { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { buildWaMessage } from '../lib/waMessage';
import { CartIcon, TrashIcon } from './icons';

export default function CartDrawer({ open, onClose }) {
  const { cart, cartCount, cartTotal, updateQty, removeFromCart, clearCart, formatPrice } = useCart();
  const drawerRef = useRef(null);

  // Same drawer a11y contract as the nav drawer (Phase 2): Escape closes,
  // body scroll locks, focus enters and stays inside.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const drawer = drawerRef.current;
    const focusables = () =>
      drawer ? Array.from(drawer.querySelectorAll('button, a, input')) : [];
    focusables()[0]?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !drawer) return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Scrim (spec 4 elevation: scrim + edge border, no shadow) */}
      <div className="fixed inset-0 bg-ink-950/80 z-50" onClick={onClose} />

      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-96 max-w-full bg-ink-950 border-l border-edge z-50 flex flex-col font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-edge">
          <div>
            <div className="flex items-center gap-2 text-card-title text-fg-hi">
              <CartIcon className="w-5 h-5 text-teal-500" />
              Your Cart
              <span className="bg-teal-500 text-ink-950 text-micro font-medium rounded-full min-w-5 h-5 px-1 inline-flex items-center justify-center">{cartCount}</span>
            </div>
            <div className="text-micro text-fg-low mt-1">
              {cartCount} item{cartCount !== 1 ? 's' : ''} · {formatPrice(cartTotal)}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close cart"
            className="bg-transparent border-0 cursor-pointer text-fg-hi text-card-title min-w-11 min-h-11">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <CartIcon className="w-12 h-12 mx-auto text-fg-low" />
              <p className="text-card-title text-fg-hi mt-4">Your cart is empty</p>
              <p className="text-body text-fg-low mt-1">Browse our products and add something!</p>
              <button onClick={onClose}
                className="mt-6 bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-6 py-3 cursor-pointer min-h-11">
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.sku} className="flex gap-3 py-4 border-b border-edge">
                <div className="relative w-20 h-20 shrink-0 bg-ink-800 border border-edge rounded-lg overflow-hidden">
                  {item.img
                    ? <img src={item.img} alt={item.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                    : <span className="absolute inset-0 flex items-center justify-center text-card-title">{item.icon}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-label uppercase text-fg-low">{item.brand}</div>
                  <div className="text-body text-fg-hi line-clamp-2">{item.name}</div>
                  <div className="text-price text-teal-500 mt-1">{item.price}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-edge rounded-full">
                      <button onClick={() => updateQty(item.sku, item.qty - 1)} aria-label="Decrease quantity"
                        className="bg-transparent border-0 cursor-pointer text-fg-hi text-body min-w-11 min-h-11">−</button>
                      <span className="text-body text-fg-hi px-1">{item.qty}</span>
                      <button onClick={() => updateQty(item.sku, item.qty + 1)} aria-label="Increase quantity"
                        className="bg-transparent border-0 cursor-pointer text-fg-hi text-body min-w-11 min-h-11">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.sku)}
                      className="flex items-center gap-1 bg-transparent border-0 cursor-pointer text-accent text-body min-h-11">
                      <TrashIcon className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-edge p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-body text-fg-mid">Total ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
              <span className="text-price text-fg-hi">{formatPrice(cartTotal)}</span>
            </div>
            <a
              href={`https://wa.me/254759962068?text=${buildWaMessage(cart, cartTotal, formatPrice)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-whatsapp text-ink-950 text-body font-medium rounded-full px-6 py-3 min-h-11"
            >
              Checkout via WhatsApp
            </a>
            <button onClick={onClose}
              className="w-full mt-3 bg-transparent text-fg-hi text-body border border-edge rounded-full px-6 py-3 cursor-pointer min-h-11">
              ← Continue Shopping
            </button>
            <button onClick={clearCart}
              className="w-full mt-3 bg-transparent text-accent text-body border-0 cursor-pointer min-h-11">
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
```

(Note: `Remove` and `Clear Cart` use accent red as destructive — the sanctioned use. Red text here is ≥14px `text-body`, satisfying the red-legibility law. WhatsApp pill carries ink-950 text per the contrast law. 💚/🛒/🗑 emoji gone.)

- [ ] **Step 2: Replace src/components/Toast.js with exactly:**

```jsx
import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircleIcon } from './icons';

// Semantic states (spec 4): success = teal. CartContext currently emits only
// success toasts ({ msg }); a future { type } field maps error->accent, warn->warn.
const styles = {
  success: 'border-teal-500 text-teal-500',
  error: 'border-accent text-accent',
  warning: 'border-warn text-warn',
};

export default function Toast() {
  const { toast } = useCart();
  if (!toast) return null;
  const tone = styles[toast.type] || styles.success;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-ink-800 border ${tone} rounded-full px-5 py-3 font-sans text-body`} role="status">
      <CheckCircleIcon className="w-5 h-5" />
      <span className="text-fg-hi">{toast.msg}</span>
    </div>
  );
}
```

- [ ] **Step 3: Replace src/components/WhatsAppButton.js with exactly:**

```jsx
import React from 'react';
import { ChatIcon } from './icons';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/254759962068"
      target="_blank"
      rel="noreferrer"
      title="Chat on WhatsApp"
      className="fixed bottom-6 right-4 z-40 flex items-center gap-2 bg-whatsapp text-ink-950 text-body font-medium rounded-full px-4 py-3 min-h-11 font-sans"
    >
      <ChatIcon className="w-5 h-5" />
      <span className="hidden sm:inline">Need help? Chat with us</span>
    </a>
  );
}
```

- [ ] **Step 4: Delete the dead App.css patches.** In `src/App.css`, remove these now-dead rules (their classnames die with the conversions):

```css
/* Fix WhatsApp button not covering cart */
.cart-overlay, .cart-drawer {
  z-index: 10000 !important;
}

/* Fix search panel z-index */
.search-overlay { z-index: 8000 !important; }
.search-panel { z-index: 8001 !important; }
```

(Stacking is now token z-classes: cart scrim+drawer z-50, WhatsApp float z-40 — the float correctly sits UNDER the open cart.)

- [ ] **Step 5: Delete stylesheets, build, grep, test, commit**

```bash
git rm src/styles/CartDrawer.css src/styles/Toast.css src/styles/WhatsAppButton.css
npm run build
grep -rn "cart-drawer\|cart-overlay\|wa-float\|class=\"toast\"\|'toast'" src/   # no hits (AdminPage's admin-toast is separate and allowed)
CI=true npx react-scripts test --watchAll=false                                  # all pass
git add src/components/CartDrawer.js src/components/Toast.js src/components/WhatsAppButton.js src/App.css
git commit -m "feat(p4): CartDrawer/Toast/WhatsAppButton on tokens — drawer a11y contract, semantic toast, emoji sweep; delete 3 CSS + dead App.css z-index patches"
```

---

### Task 3: ProductPage on tokens, delete ProductPage.css

**Files:**
- Modify: `src/pages/ProductPage.js`
- Delete: `src/styles/ProductPage.css`

PRESERVE EXACTLY: all imports except CSS (add `import ProductCard from '../components/ProductCard';` and `import { ChatIcon, ShareIcon, DocIcon, GearIcon, CartIcon } from '../components/icons';`), `renderDescription` (re-style only, structure below), all state/effects, `product` lookup, `allImages`, `related`, `calcSave`, the ENTIRE Helmet block, both wa.me hrefs with their exact message strings, and the `navigator.share` fallback logic.

- [ ] **Step 1: Re-style `renderDescription`'s returned elements** (logic identical, classes swapped):

```jsx
function renderDescription(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-3" />;

    if (trimmed.endsWith(':')) {
      return (
        <div key={i} className={`text-card-title text-fg-hi ${i === 0 ? '' : 'mt-4'}`}>
          {trimmed}
        </div>
      );
    }

    if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      return (
        <div key={i} className="flex gap-2 text-body text-fg-mid mt-1">
          <span className="text-teal-500">•</span>
          <span>{trimmed.replace(/^[-•]\s*/, '')}</span>
        </div>
      );
    }

    return (
      <p key={i} className="text-body text-fg-mid mt-2">
        {trimmed}
      </p>
    );
  });
}
```

- [ ] **Step 2: Replace the returned JSX** (everything inside the fragment AFTER the Helmet block; not-found branch too):

Not-found branch:
```jsx
    return (
      <div className="bg-ink-900 min-h-screen flex flex-col items-center justify-center font-sans py-24">
        <SearchIcon className="w-12 h-12 text-fg-low" />
        <p className="text-card-title text-fg-hi mt-4">Product not found</p>
        <button onClick={() => navigate('/')}
          className="mt-6 bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-6 py-3 cursor-pointer min-h-11">
          Back to Home
        </button>
      </div>
    );
```
(add `SearchIcon` to the icons import)

Main return, after Helmet:
```jsx
      {/* Zoom overlay */}
      {imgZoomed && allImages.length > 0 && (
        <div className="fixed inset-0 bg-ink-950/90 z-50 flex items-center justify-center" onClick={() => setImgZoomed(false)}>
          <button onClick={() => setImgZoomed(false)} aria-label="Close zoom"
            className="absolute top-4 right-4 bg-transparent border-0 cursor-pointer text-fg-hi text-heading min-w-11 min-h-11">✕</button>
          {allImages.length > 1 && (
            <button aria-label="Previous image"
              className="absolute left-2 bg-ink-800 border border-edge rounded-full text-fg-hi text-card-title cursor-pointer min-w-11 min-h-11"
              onClick={e => { e.stopPropagation(); setActiveImg(prev => (prev - 1 + allImages.length) % allImages.length); }}>
              ‹
            </button>
          )}
          <img src={allImages[activeImg]} alt={p.name} onClick={e => e.stopPropagation()}
            className="max-w-full max-h-full object-contain" />
          {allImages.length > 1 && (
            <button aria-label="Next image"
              className="absolute right-2 bg-ink-800 border border-edge rounded-full text-fg-hi text-card-title cursor-pointer min-w-11 min-h-11"
              onClick={e => { e.stopPropagation(); setActiveImg(prev => (prev + 1) % allImages.length); }}>
              ›
            </button>
          )}
        </div>
      )}

      <div className="bg-ink-900 min-h-screen font-sans">
        {/* Breadcrumb */}
        <div className="bg-ink-950 border-b border-edge">
          <div className="flex items-center gap-2 max-w-screen-xl mx-auto px-4 py-4 text-body text-fg-low overflow-hidden whitespace-nowrap">
            <span onClick={() => navigate('/')} className="cursor-pointer hover:text-fg-hi">Home</span>
            <span>›</span>
            <span onClick={() => navigate(`/category/${p.category.toLowerCase().replace(/ /g, '-')}`)}
              className="cursor-pointer hover:text-fg-hi">{p.category}</span>
            <span>›</span>
            <span className="text-fg-mid truncate">{p.name}</span>
          </div>
        </div>

        {/* Main */}
        <div className="max-w-screen-xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div onClick={() => allImages.length > 0 && setImgZoomed(true)}
              className="relative aspect-square bg-ink-800 border border-edge rounded-xl overflow-hidden cursor-zoom-in">
              {allImages.length > 0 ? (
                <img src={allImages[activeImg]} alt={p.name} fetchPriority="high" decoding="async"
                  className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-display">{p.icon}</div>
              )}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-ink-950/80 text-fg-hi text-micro rounded-full px-2 py-1">
                  {activeImg + 1} / {allImages.length}
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} aria-label={`Image ${i + 1}`}
                    className={`relative w-16 h-16 shrink-0 bg-ink-800 rounded-lg overflow-hidden cursor-pointer border ${activeImg === i ? 'border-teal-500' : 'border-edge'}`}>
                    <img src={img} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="inline-block border border-edge rounded-full px-3 py-1 text-label uppercase text-fg-mid">{p.category}</span>
            <div className="text-label uppercase text-fg-low mt-3">{p.brand}</div>
            <h1 className="text-display text-fg-hi mt-1">{p.name}</h1>
            <div className="text-micro text-fg-low mt-1">SKU: {p.sku}</div>

            <div className="bg-ink-800 border border-edge rounded-xl p-4 mt-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-heading text-teal-500">{p.price}</span>
                {p.oldPrice && <span className="text-body text-fg-low line-through">{p.oldPrice}</span>}
                {calcSave() && (
                  <span className="bg-accent text-white text-micro font-medium rounded-full px-2 py-1">Save {calcSave()}%</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-body text-fg-mid mt-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                In Stock — Ready for Delivery
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5">
              <span className="text-body text-fg-mid">Qty:</span>
              <div className="flex items-center border border-edge rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity"
                  className="bg-transparent border-0 cursor-pointer text-fg-hi text-body min-w-11 min-h-11">−</button>
                <span className="text-body text-fg-hi px-1">{qty}</span>
                <button onClick={() => setQty(qty + 1)} aria-label="Increase quantity"
                  className="bg-transparent border-0 cursor-pointer text-fg-hi text-body min-w-11 min-h-11">+</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button onClick={() => addToCart(p, qty)}
                className="flex flex-1 items-center justify-center gap-2 bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-6 py-3 cursor-pointer min-h-11">
                <CartIcon className="w-5 h-5" /> Add to Cart
              </button>
              <a href={`https://wa.me/254759962068?text=${encodeURIComponent(
                  `Hi! I would like to order:\n${p.name}\nPrice: ${p.price}\nQty: ${qty}`
                )}`} target="_blank" rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 bg-whatsapp text-ink-950 text-body font-medium rounded-full px-6 py-3 min-h-11">
                <ChatIcon className="w-5 h-5" /> Buy via WhatsApp
              </a>
            </div>

            {p.tags && p.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {p.tags.map(t => (
                  <span key={t} className="border border-edge rounded-full px-3 py-1 text-micro text-fg-low">#{t}</span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={() => navigate(-1)}
                className="bg-transparent text-fg-mid text-body border border-edge rounded-full px-4 py-2 cursor-pointer min-h-11">
                ← Go Back
              </button>
              <a href={`https://wa.me/254759962068?text=${encodeURIComponent(
                  `Hi! I have a question about ${p.name} (${p.sku})`
                )}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-transparent text-fg-mid text-body border border-edge rounded-full px-4 py-2 min-h-11">
                <ChatIcon className="w-4 h-4" /> Ask a Question
              </a>
              <button
                className="flex items-center gap-2 bg-transparent text-fg-mid text-body border border-edge rounded-full px-4 py-2 cursor-pointer min-h-11"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: p.name,
                      text: `${p.name} — ${p.price}`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}>
                <ShareIcon className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Description + Specs */}
        <div className="max-w-screen-xl mx-auto px-4 pb-8 grid md:grid-cols-2 gap-6">
          <div className="bg-ink-800 border border-edge rounded-xl p-6">
            <div className="flex items-center gap-2 text-card-title text-fg-hi mb-4">
              <DocIcon className="w-5 h-5 text-teal-500" /> Description
            </div>
            {p.description ? (
              <div>{renderDescription(p.description)}</div>
            ) : (
              <p className="text-body text-fg-low">No description available.</p>
            )}
          </div>
          <div className="bg-ink-800 border border-edge rounded-xl p-6">
            <div className="flex items-center gap-2 text-card-title text-fg-hi mb-4">
              <GearIcon className="w-5 h-5 text-teal-500" /> Specifications
            </div>
            {p.specs && p.specs.length > 0 ? (
              <table className="w-full text-body">
                <tbody>
                  {p.specs.map((spec, i) => (
                    <tr key={i} className="border-b border-edge last:border-0">
                      <td className="py-2 pr-4 text-fg-low align-top">{spec.label}</td>
                      <td className="py-2 text-fg-hi">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-body text-fg-low">No specifications listed.</p>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="max-w-screen-xl mx-auto px-4 pb-12">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div className="text-heading text-fg-hi">You may also like</div>
              <button onClick={() => navigate(`/category/${p.category.toLowerCase().replace(/ /g, '-')}`)}
                className="bg-transparent text-fg-hi text-body border border-edge rounded-full px-5 py-2 cursor-pointer min-h-11 shrink-0">
                View all
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {related.map(r => (
                <ProductCard
                  key={r.sku}
                  product={r}
                  onOpen={() => navigate(`/product/${encodeURIComponent(r.sku)}`)}
                  onAddToCart={(prod) => addToCart(prod, 1)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
```

(The main gallery image is `fetchPriority="high"` and aspect-locked — this is the page's LCP element AND its 0.40-CLS killer. Related cards reuse ProductCard. 🛒💚💬🔗📋⚙️🔍 all replaced.)

- [ ] **Step 3: Delete stylesheet, build, grep, test**

```bash
git rm src/styles/ProductPage.css
npm run build
grep -rn "pp-page\|pp-main\|pp-rcard\|pp-zoom" src/   # no hits
CI=true npx react-scripts test --watchAll=false        # all pass (3 tests now)
```

- [ ] **Step 4: Functional smoke + commit**

Smoke: gallery zoom + thumbs; qty; add-to-cart fires toast; both wa.me links carry correct encoded text (inspect href); share button; related navigation; Helmet title/og in page source.

```bash
git add src/pages/ProductPage.js
git commit -m "feat(p4): ProductPage on tokens — aspect-locked gallery (CLS fix), ProductCard related grid, emoji sweep; delete ProductPage.css"
```

---

### Task 4: SearchOverlay + Footer on tokens, delete 2 CSS

**Files:**
- Modify: `src/components/SearchOverlay.js` (full replacement)
- Modify: `src/components/Footer.js` (full replacement)
- Delete: `src/styles/SearchOverlay.css`, `src/styles/Footer.css`

- [ ] **Step 1: Replace src/components/SearchOverlay.js** — keep ALL useCart wiring and result-flow logic; new JSX:

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { SearchIcon } from './icons';
import ProductCard from './ProductCard';

export default function SearchOverlay() {
  const { searchQuery, searchResults, searchOpen, clearSearch, addToCart } = useCart();
  const navigate = useNavigate();

  if (!searchOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-ink-950/80 z-40" onClick={clearSearch} />

      <div className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-screen-lg max-h-[unset] z-50 px-4">
        <div className="bg-ink-900 border border-edge rounded-xl flex flex-col overflow-hidden font-sans" style={undefined}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-edge">
            <div>
              <div className="text-card-title text-fg-hi">
                {searchResults.length > 0
                  ? <><span className="text-teal-500">{searchResults.length}</span> results for "{searchQuery}"</>
                  : <>Searching for "{searchQuery}"</>
                }
              </div>
              <div className="text-micro text-fg-low mt-1">
                {searchResults.length > 0 ? 'Click a product to view details' : 'Try a different keyword'}
              </div>
            </div>
            <button onClick={clearSearch} aria-label="Close search"
              className="bg-transparent border-0 cursor-pointer text-fg-hi text-card-title min-w-11 min-h-11">✕</button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-4">
            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <SearchIcon className="w-12 h-12 mx-auto text-fg-low" />
                <p className="text-card-title text-fg-hi mt-4">No results for "{searchQuery}"</p>
                <p className="text-body text-fg-low mt-1">Try searching by brand, product name, or category</p>
                <p className="text-micro text-fg-low mt-1">e.g. "Sony", "PS5", "JBL", "iPhone"</p>
                <button onClick={() => { clearSearch(); navigate('/'); }}
                  className="mt-6 bg-transparent text-fg-hi text-body border border-edge rounded-full px-6 py-3 cursor-pointer min-h-11">
                  ← Browse all products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.slice(0, 12).map(p => (
                  <ProductCard
                    key={p.sku}
                    product={p}
                    onOpen={() => { navigate(`/product/${encodeURIComponent(p.sku)}`); clearSearch(); }}
                    onAddToCart={(prod) => { addToCart(prod, 1); clearSearch(); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
```

NOTE for the implementer: the `max-h-[unset]` and `style={undefined}` in the wrapper above are PLAN ERRORS — write it WITHOUT them: the panel div is
`className="bg-ink-900 border border-edge rounded-xl flex flex-col overflow-hidden font-sans max-h-96 md:max-h-screen"` — use `max-h-96` on mobile and remove the inner style entirely. (Kept honest: arbitrary values are forbidden; max-h-96 = 384px and md:max-h-screen are default-scale.)

- [ ] **Step 2: Replace src/components/Footer.js** — keep `shopLinks` data and navigation; new JSX:

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PinIcon, PhoneCallIcon, CardIcon, BagIcon, ChatIcon, HeartIcon } from './icons';

export default function Footer() {
  const navigate = useNavigate();

  const shopLinks = [
    { label: 'Gaming', slug: 'gaming' },
    { label: 'Phones', slug: 'phones' },
    { label: 'Laptops', slug: 'laptops' },
    { label: 'Audio & Sound', slug: 'audio' },
    { label: 'TV & Streaming', slug: 'tv-streaming' },
  ];

  return (
    <footer className="bg-ink-950 border-t border-edge font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-screen-xl mx-auto px-4 py-12">
        {/* Brand */}
        <div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0">
            <img src="/images/logo.png" alt="Optimus Sphere Tech" loading="lazy" decoding="async" className="h-10 w-10 object-contain" />
            <span className="flex flex-col items-start leading-none">
              <span className="text-card-title text-fg-hi">OPTIMUS</span>
              <span className="text-micro text-fg-low uppercase">SPHERE TECH</span>
            </span>
          </button>
          <p className="text-body text-fg-low mt-4">
            Nairobi's premier tech store for gaming, phones, laptops, audio & TVs. Only original products. No fakes.
          </p>
          <a href="https://wa.me/254759962068" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-whatsapp text-ink-950 text-body font-medium rounded-full px-5 py-2 min-h-11 mt-4">
            <ChatIcon className="w-5 h-5" /> Chat on WhatsApp
          </a>
        </div>

        {/* Location */}
        <div>
          <h4 className="flex items-center gap-2 text-label uppercase text-fg-hi mb-3">
            <PinIcon className="w-4 h-4 text-teal-500" /> Find Us
          </h4>
          <p className="text-body text-fg-low">Mithoo Biashara Centre</p>
          <p className="text-body text-fg-low">Opposite Bazaar Shop</p>
          <p className="text-body text-fg-low">Basement B69, Nairobi</p>
          <p className="text-body text-fg-mid mt-2">Mon–Sat: 8am – 7pm</p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="flex items-center gap-2 text-label uppercase text-fg-hi mb-3">
            <PhoneCallIcon className="w-4 h-4 text-teal-500" /> Contact Us
          </h4>
          <a href="tel:0759962068" className="block text-body text-fg-low hover:text-fg-hi min-h-11 leading-loose">0759 962 068</a>
          <a href="tel:0757255539" className="block text-body text-fg-low hover:text-fg-hi min-h-11 leading-loose">0757 255 539</a>
          <h4 className="flex items-center gap-2 text-label uppercase text-fg-hi mb-2 mt-4">
            <CardIcon className="w-4 h-4 text-teal-500" /> We Accept
          </h4>
          <p className="text-body text-fg-low">M-Pesa · Cash · Card</p>
        </div>

        {/* Shop links */}
        <div>
          <h4 className="flex items-center gap-2 text-label uppercase text-fg-hi mb-3">
            <BagIcon className="w-4 h-4 text-teal-500" /> Shop
          </h4>
          {shopLinks.map(l => (
            <button key={l.slug} onClick={() => navigate(`/category/${l.slug}`)}
              className="block bg-transparent border-0 cursor-pointer text-left text-body text-fg-low hover:text-fg-hi min-h-11 p-0">
              → {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-edge">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-screen-xl mx-auto px-4 py-5 text-micro text-fg-low">
          <span>© 2025 Optimus Sphere Tech. All rights reserved.</span>
          <span className="flex items-center gap-1">Made with <HeartIcon className="w-3.5 h-3.5 text-accent" /> in Nairobi, Kenya</span>
        </div>
      </div>
    </footer>
  );
}
```

(The heart is an outline icon in accent red — an identity moment ≥ icon-size, satisfying the red rules. Footer links become real buttons.)

- [ ] **Step 3: Delete stylesheets, build, grep, test, commit**

```bash
git rm src/styles/SearchOverlay.css src/styles/Footer.css
npm run build
grep -rn "search-panel\|search-card\|foot-grid\|foot-brand" src/   # no hits
CI=true npx react-scripts test --watchAll=false
git add src/components/SearchOverlay.js src/components/Footer.js
git commit -m "feat(p4): SearchOverlay + Footer on tokens — ProductCard results grid, outline icons, emoji sweep; delete their CSS"
```

---

### Task 5: Phase gates — emoji audit, Lighthouse, push, STOP

- [ ] **Step 1: Native-emoji audit of converted components** (Edgar's sweep gate):

```bash
grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE0F}]" src/components/CartDrawer.js src/components/Toast.js src/components/WhatsAppButton.js src/components/SearchOverlay.js src/components/Footer.js src/pages/ProductPage.js
# Expected: NO hits. (Hero/cards keep their DATA-driven product icon fallbacks — those are product data, out of this sweep.)
```

- [ ] **Step 2: Full suite + build green.** 3 tests total (smoke + 2 waMessage).

- [ ] **Step 3: Lighthouse vs floors** (Phase 1 method; serve fresh build on :3001): product page is the headline — run 5×, median must be **decisively above 39** (target: ≥45, CLS ≤0.05). Also `/` and `/category/games` 3× each, ≥ floors.

- [ ] **Step 4: Push** `git push origin redesign/premium-dark`.

- [ ] **Step 5: Report to Edgar and STOP — his gates:**
  1. **D8 WhatsApp E2E ON A PHONE:** cart → Checkout via WhatsApp opens the WhatsApp APP with the itemized message; product page → Buy via WhatsApp; Ask a Question. All three carry correct text.
  2. **Cart flow:** add/remove/qty/clear; localStorage persistence across reload; toast appears (teal semantic).
  3. **Keyboard:** cart drawer focus trap + Escape + scroll lock; zoom overlay Escape?? (zoom closes on ✕/backdrop — note: Escape-to-close for zoom is NOT implemented; flag if wanted); search overlay close; footer/product buttons all ringed.
  4. **Visual:** product gallery, price box, dark specs table, related row, emoji-free chrome.
  5. **Helmet check:** product page title/og intact in page source.

**NO Phase 5 work until Edgar's gates pass.**

---

## Self-Review (done at write time)

- **Spec coverage:** §5 ProductPage/CartDrawer/Footer/SearchOverlay/Toast (T2-T4), D8 phone gate + D9 TDD test (T1, T5), CLS kill via aspect-locked gallery (T3), deletion ledger 6 CSS + App.css patches (T2-T4), emoji sweep with audit command (T5), ProductDrawer correctly absent.
- **Plan error caught in self-review and marked inline:** the SearchOverlay wrapper initially included `max-h-[unset]` (arbitrary value — forbidden) and a stray `style={undefined}`; the implementer note specifies the corrected classes (`max-h-96 md:max-h-screen`). Implementer MUST apply the corrected version.
- **Type consistency:** icon names in T2-T4 match T1's additions; ProductCard props match its API; buildWaMessage(cart, cartTotal, formatPrice) signature consistent across module/test/CartDrawer.
- **Zoom-overlay Escape gap:** noted honestly in T5 gate 3 rather than silently scoped in.
```
