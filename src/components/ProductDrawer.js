import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

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
      <style>{`
        .pd-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          animation: fadeIn 0.2s;
        }
        .pd-drawer {
          position: fixed; top: 0; right: 0;
          width: 460px; max-width: 100%;
          height: 100vh;
          background: #fff;
          z-index: 1001;
          overflow-y: auto;
          box-shadow: -8px 0 40px rgba(0,0,0,0.2);
          font-family: Inter, sans-serif;
          animation: slideIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .pd-header {
          position: sticky;
          top: 0;
          background: linear-gradient(135deg, #0d2b33, #0097a7);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }
        .pd-header-title {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          opacity: 0.9;
        }
        .pd-close {
          background: rgba(255,255,255,0.2);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 36px; height: 36px;
          font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          transition: background .2s;
        }
        .pd-close:hover { background: rgba(255,255,255,0.35); }
        .pd-content { padding: 24px 24px 40px; }
        .pd-imgbox {
          width: 100%; height: 260px;
          background: #f8f8f8; border-radius: 12px;
          overflow: hidden; margin-bottom: 20px;
          position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .pd-imgbox img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .pd-badge {
          position: absolute; top: 12px; left: 12px;
          background: #e63946; color: #fff;
          font-size: 10px; font-weight: 800;
          padding: 4px 10px; border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .pd-brand {
          font-size: 11px; color: #999;
          text-transform: uppercase;
          letter-spacing: 1px; margin-bottom: 6px;
        }
        .pd-title {
          font-size: 22px; font-weight: 800;
          color: #111; margin-bottom: 10px;
          line-height: 1.3;
        }
        .pd-meta {
          font-size: 11px; color: #aaa;
          display: flex; gap: 8px;
          margin-bottom: 16px; flex-wrap: wrap;
        }
        .pd-price-row {
          display: flex; align-items: center;
          gap: 12px; margin-bottom: 16px; flex-wrap: wrap;
        }
        .pd-price {
          font-size: 28px; font-weight: 900; color: #0097a7;
        }
        .pd-oldprice {
          font-size: 15px; color: #bbb; text-decoration: line-through;
        }
        .pd-save {
          background: #fff0f0; color: #e63946;
          font-size: 11px; font-weight: 700;
          padding: 4px 10px; border-radius: 4px;
        }
        .pd-divider {
          border: none;
          border-top: 1px solid #f0f0f0;
          margin: 18px 0;
        }
        .pd-section-head {
          font-size: 11px; font-weight: 800;
          color: #888; margin-bottom: 10px;
          text-transform: uppercase; letter-spacing: 1.2px;
        }
        .pd-desc {
          font-size: 13px; color: #555; line-height: 1.8;
        }
        .pd-specs {
          width: 100%; border-collapse: collapse;
        }
        .pd-specs tr { border-bottom: 1px solid #f5f5f5; }
        .pd-specs td {
          font-size: 12px; padding: 9px 0; font-weight: 500;
        }
        .pd-specs td:first-child { color: #888; width: 42%; }
        .pd-specs td:last-child { color: #222; }
        .pd-tags {
          display: flex; gap: 6px;
          flex-wrap: wrap; margin-bottom: 22px;
        }
        .pd-tag {
          background: #f0fafb; color: #0097a7;
          font-size: 11px; padding: 4px 12px;
          border-radius: 20px; font-weight: 600;
        }
        .pd-actions {
          display: flex; gap: 10px; margin-bottom: 12px;
        }
        .pd-qtybox {
          display: flex; align-items: center;
          border: 1.5px solid #e0f7fa; border-radius: 8px; overflow: hidden;
        }
        .pd-qtybtn {
          width: 38px; height: 46px; border: none;
          background: #f0fafb; font-size: 18px;
          cursor: pointer; color: #0097a7; font-weight: 700;
        }
        .pd-qtybtn:hover { background: #e0f7fa; }
        .pd-qtynum {
          padding: 0 18px; font-size: 14px;
          font-weight: 700; color: #111;
        }
        .pd-add {
          flex: 1;
          background: linear-gradient(135deg, #0097a7, #00bcd4);
          color: #fff; border: none; border-radius: 8px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          height: 46px;
          box-shadow: 0 4px 14px rgba(0,151,167,0.3);
          transition: transform .2s, opacity .2s;
        }
        .pd-add:hover { transform: translateY(-2px); }
        .pd-wa {
          display: block; width: 100%;
          background: #25D366; color: #fff;
          border-radius: 8px; padding: 13px 0;
          text-align: center; font-size: 13px;
          font-weight: 700; margin-bottom: 14px;
          text-decoration: none; transition: opacity .2s;
        }
        .pd-wa:hover { opacity: 0.9; }
        .pd-extras {
          display: flex; gap: 12px; justify-content: center;
        }
        .pd-extras button {
          background: none; border: none;
          font-size: 12px; color: #888;
          cursor: pointer; font-family: Inter, sans-serif;
          transition: color .2s;
        }
        .pd-extras button:hover { color: #0097a7; }

        @media (max-width: 600px) {
          .pd-drawer {
            width: 100%;
            border-radius: 20px 20px 0 0;
            top: auto;
            bottom: 0;
            height: 92vh;
          }
        }
      `}</style>

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
              <span style={{ fontSize: 90 }}>{p.icon}</span>
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