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
