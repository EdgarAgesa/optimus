import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/ProductDrawer.css';

export default function ProductDrawer({ product: p, onClose }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const calcSave = () => {
    if (!p.oldPrice) return null;
    const current = parseInt(p.price.replace(/\D/g, ''));
    const old = parseInt(p.oldPrice.replace(/\D/g, ''));
    return Math.round((1 - current / old) * 100);
  };

  const handleAdd = () => {
    addToCart(p, qty);
    onClose();
  };

  return (
    <>
      <div className="pd-overlay" onClick={onClose} />

      <div className="pd-drawer">
        {/* Sticky header with close button */}
        <div className="pd-header">
          <span className="pd-header-title">Product Details</span>
          <button className="pd-close" onClick={onClose}>✕</button>
        </div>

        <div className="pd-content">
          {/* Image */}
          <div className="pd-imgbox">
            {p.img ? (
              <img src={p.img} alt={p.name} />
            ) : (
              <span className="pd-emoji">{p.icon}</span>
            )}
            {p.badge && <span className="pd-badge">{p.badge}</span>}
          </div>

          {/* Brand + Title */}
          <div className="pd-brand">{p.brand}</div>
          <h2 className="pd-title">{p.name}</h2>

          {/* Meta */}
          <div className="pd-meta">
            <span>SKU: {p.sku}</span>
            <span>•</span>
            <span>Category: {p.category}</span>
          </div>

          {/* Price */}
          <div className="pd-price-row">
            <span className="pd-price">{p.price}</span>
            {p.oldPrice && <span className="pd-oldprice">{p.oldPrice}</span>}
            {calcSave() && <span className="pd-save">Save {calcSave()}%</span>}
          </div>

          <hr className="pd-divider" />

          {/* Description */}
          <div className="pd-section-head">Description</div>
          <p className="pd-desc">{p.description}</p>

          <hr className="pd-divider" />

          {/* Specs */}
          <div className="pd-section-head">Specifications</div>
          <table className="pd-specs">
            <tbody>
              {p.specs.map((spec) => (
                <tr key={spec.label}>
                  <td>{spec.label}</td>
                  <td>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr className="pd-divider" />

          {/* Tags */}
          <div className="pd-tags">
            {p.tags.map((t) => (
              <span key={t} className="pd-tag">#{t}</span>
            ))}
          </div>

          {/* Qty + Add to cart */}
          <div className="pd-actions">
            <div className="pd-qtybox">
              <button className="pd-qtybtn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="pd-qtynum">{qty}</span>
              <button className="pd-qtybtn" onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button className="pd-add" onClick={handleAdd}>
              🛒 Add to Cart
            </button>
          </div>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/254759962068?text=${encodeURIComponent(
              `Hi! I'd like to order: ${p.name} (${p.price}) × ${qty}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="pd-wa"
          >
            💚 Buy Now via WhatsApp
          </a>

          {/* Extras */}
          <div className="pd-extras">
            <button>♡ Add to Wishlist</button>
            <button>⇄ Compare</button>
          </div>
        </div>
      </div>
    </>
  );
}