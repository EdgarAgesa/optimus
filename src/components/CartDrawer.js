import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer({ open, onClose }) {
  const { cart, cartCount, cartTotal, updateQty, removeFromCart, clearCart, formatPrice } = useCart();
  const navigate = useNavigate();

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
      <style>{`
        .cart-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 10000;
          animation: fadeIn 0.2s;
        }
        .cart-drawer {
          position: fixed; top: 0; right: 0;
          width: 420px; max-width: 100%;
          height: 100vh; height: 100dvh;
          background: #fff; z-index: 10001;
          display: flex; flex-direction: column;
          box-shadow: -8px 0 40px rgba(0,0,0,0.2);
          animation: slideIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .cart-header {
          padding: 18px 20px;
          display: flex; justify-content: space-between; align-items: center;
          background: linear-gradient(135deg, #0d2b33, #0097a7);
          color: #fff; flex-shrink: 0;
        }
        .cart-header-left {
          display: flex; flex-direction: column; gap: 2px;
        }
        .cart-title {
          font-size: 16px; font-weight: 700;
          display: flex; align-items: center; gap: 10px;
        }
        .cart-count-badge {
          background: rgba(255,255,255,0.25);
          padding: 2px 10px; border-radius: 20px; font-size: 12px;
        }
        .cart-subtitle {
          font-size: 11px; color: rgba(255,255,255,0.7);
        }
        .cart-close {
          background: rgba(255,255,255,0.2); border: none;
          color: #fff; width: 36px; height: 36px;
          border-radius: 50%; cursor: pointer; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: background .2s; flex-shrink: 0;
        }
        .cart-close:hover { background: rgba(255,255,255,0.35); }
        .cart-body {
          flex: 1; overflow-y: auto; padding: 16px;
          -webkit-overflow-scrolling: touch;
        }
        .cart-empty {
          text-align: center; padding: 60px 24px; color: #888;
        }
        .cart-empty-icon { font-size: 60px; margin-bottom: 16px; opacity: 0.3; }
        .cart-item {
          display: flex; gap: 12px;
          padding: 14px; border: 1px solid #eee;
          border-radius: 12px; margin-bottom: 10px;
          background: #fff;
        }
        .cart-item-img {
          width: 68px; height: 68px; border-radius: 8px;
          background: #f5f5f5; overflow: hidden; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .cart-item-info { flex: 1; min-width: 0; }
        .cart-item-brand {
          font-size: 10px; color: #999;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .cart-item-name {
          font-size: 13px; font-weight: 600; color: #111;
          margin: 3px 0 4px; line-height: 1.3;
        }
        .cart-item-price { font-size: 14px; font-weight: 700; color: #0097a7; }
        .cart-item-actions {
          display: flex; align-items: center;
          justify-content: space-between; margin-top: 8px;
        }
        .qty-box {
          display: flex; align-items: center;
          border: 1.5px solid #e0f7fa; border-radius: 6px; overflow: hidden;
        }
        .qty-btn {
          background: #f0fafb; border: none;
          width: 28px; height: 28px; cursor: pointer;
          font-size: 14px; color: #0097a7; font-weight: 700;
        }
        .qty-btn:hover { background: #e0f7fa; }
        .qty-num {
          padding: 0 10px; font-size: 13px; font-weight: 700; color: #111;
        }
        .remove-btn {
          background: none; border: none; color: #e63946;
          font-size: 11px; cursor: pointer; font-weight: 600;
          font-family: Inter, sans-serif;
        }
        .cart-footer {
          padding: 16px 18px 20px;
          border-top: 1px solid #eee;
          background: #fff; flex-shrink: 0;
        }
        .total-row {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 14px;
          padding: 12px 14px;
          background: #f8fffe;
          border-radius: 10px; border: 1px solid #e0f7fa;
        }
        .total-label { font-size: 14px; color: #555; font-weight: 500; }
        .total-val { font-size: 22px; font-weight: 900; color: #0097a7; }
        .cart-wa {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; width: 100%;
          background: #25D366; color: #fff;
          padding: 14px 0; border-radius: 10px;
          font-size: 14px; font-weight: 700;
          text-decoration: none; margin-bottom: 10px;
          transition: opacity .2s;
        }
        .cart-wa:hover { opacity: 0.9; }
        .continue-btn {
          width: 100%; background: none;
          border: 1.5px solid #e0f7fa; color: #0097a7;
          padding: 10px 0; border-radius: 8px;
          font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: Inter, sans-serif;
          margin-bottom: 8px; transition: background .2s;
        }
        .continue-btn:hover { background: #f0fafb; }
        .clear-btn {
          width: 100%; background: none;
          border: 1px solid #eee; color: #aaa;
          padding: 8px 0; border-radius: 8px;
          font-size: 11px; cursor: pointer;
          font-family: Inter, sans-serif;
        }

        @media (max-width: 480px) {
          .cart-drawer { width: 100%; }
        }
      `}</style>

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
              <p style={{ fontSize: 15, fontWeight: 600, color: '#555', marginBottom: 8 }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>
                Browse our products and add something!
              </p>
              <button
                style={{
                  background: '#0097a7', color: '#fff',
                  padding: '11px 28px', borderRadius: 8,
                  border: 'none', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
                onClick={onClose}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.sku} className="cart-item">
                <div className="cart-item-img">
                  {item.img
                    ? <img src={item.img} alt={item.name} />
                    : <span style={{ fontSize: 28 }}>{item.icon}</span>
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