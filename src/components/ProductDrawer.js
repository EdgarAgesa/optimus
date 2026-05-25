import React, { useState, useEffect } from 'react';

export default function ProductDrawer({ product: p, onClose }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const calcSave = () => {
    if (!p.oldPrice) return null;
    const current = parseInt(p.price.replace(/\D/g, ''));
    const old = parseInt(p.oldPrice.replace(/\D/g, ''));
    return Math.round((1 - current / old) * 100);
  };

  return (
    <>
      <div style={s.overlay} onClick={onClose} />

      <div style={s.drawer}>

        <button style={s.closeBtn} onClick={onClose}>✕</button>

       {/* Image */}
        <div style={s.imgBox}>
        {p.img ? (
            <img src={p.img} alt={p.name} style={s.drawerImg} />
        ) : (
            <span style={s.emoji}>{p.icon}</span>
        )}
        {p.badge && <span style={s.badge}>{p.badge}</span>}
        </div>

        {/* Brand + Title */}
        <div style={s.brandLabel}>{p.brand}</div>
        <h2 style={s.title}>{p.name}</h2>

        {/* Meta */}
        <div style={s.meta}>
          <span>SKU: {p.sku}</span>
          <span style={s.dot}>•</span>
          <span>Category: {p.category}</span>
        </div>

        {/* Price */}
        <div style={s.priceRow}>
          <span style={s.price}>{p.price}</span>
          {p.oldPrice && <span style={s.oldPrice}>{p.oldPrice}</span>}
          {calcSave() && (
            <span style={s.saveBadge}>Save {calcSave()}%</span>
          )}
        </div>

        <div style={s.divider} />

        {/* Description */}
        <h3 style={s.sectionHead}>Description</h3>
        <p style={s.description}>{p.description}</p>

        <div style={s.divider} />

        {/* Specs */}
        <h3 style={s.sectionHead}>Specifications</h3>
        <table style={s.specsTable}>
          <tbody>
            {p.specs.map((spec) => (
              <tr key={spec.label} style={s.specRow}>
                <td style={s.specLabel}>{spec.label}</td>
                <td style={s.specValue}>{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={s.divider} />

        {/* Tags */}
        <div style={s.tags}>
          {p.tags.map((t) => (
            <span key={t} style={s.tag}>#{t}</span>
          ))}
        </div>

        {/* Qty + Add to cart */}
        <div style={s.actions}>
          <div style={s.qtyBox}>
            <button style={s.qtyBtn} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span style={s.qtyNum}>{qty}</span>
            <button style={s.qtyBtn} onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <button style={s.addBtn} onClick={handleAddToCart}>
            {added ? '✓ Added!' : '🛒 Add to cart'}
          </button>
        </div>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/254759962068?text=Hi, I'd like to order: ${p.name} (${p.price}) x${qty}`}
          target="_blank"
          rel="noreferrer"
          style={s.waBtn}
        >
          💚 Buy now via WhatsApp
        </a>

        {/* Extras */}
        <div style={s.extras}>
          <button style={s.extraBtn}>♡ Add to wishlist</button>
          <button style={s.extraBtn}>⇄ Add to compare</button>
        </div>

      </div>
    </>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 1000,
  },
  drawer: {
    position: 'fixed', top: 0, right: 0,
    width: 420, height: '100vh',
    background: '#fff', zIndex: 1001,
    overflowY: 'auto', padding: '28px 28px 40px',
    boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
    fontFamily: 'Inter, sans-serif',
  },
  closeBtn: {
    position: 'absolute', top: 18, right: 18,
    background: '#f5f5f5', border: 'none',
    borderRadius: '50%', width: 34, height: 34,
    fontSize: 14, cursor: 'pointer', color: '#555',
  },
 imgBox: {
  width: '100%', height: 260,
  background: '#f8f8f8', borderRadius: 12,
  overflow: 'hidden',
  marginBottom: 20, position: 'relative',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
},
  emoji: { fontSize: 90 },
  badge: {
    position: 'absolute', top: 12, left: 12,
    background: '#e63946', color: '#fff',
    fontSize: 10, fontWeight: 800,
    padding: '4px 10px', borderRadius: 4, letterSpacing: 0.5,
  },
  brandLabel: {
    fontSize: 11, color: '#999',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
  },
  title: {
    fontSize: 20, fontWeight: 700,
    color: '#111', marginBottom: 8, lineHeight: 1.3,
  },
  meta: {
    fontSize: 11, color: '#aaa',
    display: 'flex', gap: 6, marginBottom: 14,
  },
  dot: { color: '#ddd' },
  priceRow: {
    display: 'flex', alignItems: 'center',
    gap: 10, marginBottom: 16,
  },
  price: { fontSize: 22, fontWeight: 800, color: '#e63946' },
  oldPrice: { fontSize: 14, color: '#bbb', textDecoration: 'line-through' },
  saveBadge: {
    background: '#fff0f0', color: '#e63946',
    fontSize: 11, fontWeight: 700,
    padding: '3px 8px', borderRadius: 4,
  },
  divider: { borderTop: '1px solid #f0f0f0', margin: '16px 0' },
  sectionHead: {
    fontSize: 13, fontWeight: 700, color: '#111',
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  description: { fontSize: 13, color: '#555', lineHeight: 1.8 },
  specsTable: { width: '100%', borderCollapse: 'collapse' },
  specRow: { borderBottom: '1px solid #f5f5f5' },
  specLabel: {
    fontSize: 12, color: '#888',
    padding: '8px 0', width: '40%', fontWeight: 500,
  },
  specValue: { fontSize: 12, color: '#222', padding: '8px 0', fontWeight: 500 },
  tags: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 },
  tag: {
    background: '#f5f5f5', color: '#888',
    fontSize: 11, padding: '3px 10px', borderRadius: 20,
  },
  actions: { display: 'flex', gap: 10, marginBottom: 12 },
  qtyBox: {
    display: 'flex', alignItems: 'center',
    border: '1.5px solid #eee', borderRadius: 7, overflow: 'hidden',
  },
  qtyBtn: {
    width: 36, height: 44, border: 'none',
    background: '#f5f5f5', fontSize: 18,
    cursor: 'pointer', color: '#333',
  },
  qtyNum: { padding: '0 16px', fontSize: 14, fontWeight: 600, color: '#111' },
  addBtn: {
    flex: 1, background: '#111', color: '#fff',
    border: 'none', borderRadius: 7,
    fontSize: 13, fontWeight: 700,
    cursor: 'pointer', height: 44,
  },
  waBtn: {
    display: 'block', width: '100%',
    background: '#25D366', color: '#fff',
    borderRadius: 7, padding: '12px 0',
    textAlign: 'center', fontSize: 13,
    fontWeight: 700, marginBottom: 14,
    textDecoration: 'none',
  },
  extras: { display: 'flex', gap: 12, justifyContent: 'center' },
  extraBtn: {
    background: 'none', border: 'none',
    fontSize: 12, color: '#888',
    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  },
  drawerImg: {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
},
};