import React from 'react';
import { useCart } from '../context/CartContext';
import '../styles/CartDrawer.css';

export default function CartDrawer({ open, onClose }) {
  const { cart, cartCount, cartTotal, updateQty, removeFromCart, clearCart, formatPrice } = useCart();

  if (!open) return null;

  const buildWaMessage = () => {
    let msg = `Hi! I'd like to order:\n\n`;
    cart.forEach((item, i) => {
      const price = parseInt(item.price.replace(/\D/g, ''));
      msg += `${i + 1}. ${item.name}\n   Qty: ${item.qty} × ${item.price} = ${formatPrice(price * item.qty)}\n\n`;
    });
    msg += `*Total: ${formatPrice(cartTotal)}*\n\nPlease confirm availability. Thanks!`;
    return encodeURIComponent(msg);
  };

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />

      <div className="cart-drawer">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-left">
            <div className="cart-title">
              🛒 Your Cart
              <span className="cart-count-badge">{cartCount}</span>
            </div>
            <div className="cart-subtitle">
              {cartCount} item{cartCount !== 1 ? 's' : ''} · {formatPrice(cartTotal)}
            </div>
          </div>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p className="cart-empty-title">Your cart is empty</p>
              <p className="cart-empty-sub">Browse our products and add something!</p>
              <button className="cart-empty-btn" onClick={onClose}>
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.sku} className="cart-item">
                <div className="cart-item-img">
                  {item.img
                    ? <img src={item.img} alt={item.name} />
                    : <span className="cart-item-emoji">{item.icon}</span>
                  }
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-brand">{item.brand}</div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{item.price}</div>
                  <div className="cart-item-actions">
                    <div className="qty-box">
                      <button className="qty-btn" onClick={() => updateQty(item.sku, item.qty - 1)}>−</button>
                      <span className="qty-num">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.sku, item.qty + 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.sku)}>
                      🗑 Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="total-row">
              <span className="total-label">Total ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
              <span className="total-val">{formatPrice(cartTotal)}</span>
            </div>
            
            <a
              href={`https://wa.me/254759962068?text=${buildWaMessage()}`}
              target="_blank"
              rel="noreferrer"
              className="cart-wa"
            >
              💚 Checkout via WhatsApp
            </a>
            <button
              className="continue-btn"
              onClick={onClose}
            >
              ← Continue Shopping
            </button>
            <button className="clear-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}