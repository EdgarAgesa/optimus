/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import ProductDrawer from './ProductDrawer';
import products from '../data/products';


export default function FeaturedProducts() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <section style={s.section}>
        <div style={s.header}>
          <h2 style={s.heading}>Featured products</h2>
          <a href="#" style={s.seeAll}>See all →</a>
        </div>
        <div style={s.grid}>
          {products.map((p) => (
            <div key={p.sku} style={s.card} onClick={() => setSelected(p)}>
              {p.badge && <span style={s.badge}>{p.badge}</span>}

              {/* Image box — shows img if provided, falls back to emoji */}
              <div style={s.imgBox}>
                {p.img ? (
                  <img src={p.img} alt={p.name} style={s.productImg} />
                ) : (
                  <span style={s.emoji}>{p.icon}</span>
                )}
              </div>

              <div style={s.info}>
                <div style={s.brandLabel}>{p.brand}</div>
                <div style={s.name}>{p.name}</div>
                <div style={s.priceRow}>
                  <span style={s.price}>{p.price}</span>
                  {p.oldPrice && <span style={s.oldPrice}>{p.oldPrice}</span>}
                </div>
              </div>
              <button
                style={s.viewBtn}
                onClick={(e) => { e.stopPropagation(); setSelected(p); }}
              >
                View details
              </button>
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <ProductDrawer product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

const s = {
  section: {
    background: '#f8f8f8',
    borderTop: '1px solid #eee',
    padding: '48px 32px',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', maxWidth: 1200,
    margin: '0 auto 24px',
  },
  heading: { fontSize: 20, fontWeight: 700, color: '#111' },
  seeAll: { fontSize: 13, color: '#e63946', fontWeight: 600 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16, maxWidth: 1200, margin: '0 auto',
  },
  card: {
    background: '#fff',
    border: '1px solid #eee', borderRadius: 10,
    padding: '18px 14px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 10,
    position: 'relative', cursor: 'pointer',
    transition: 'box-shadow .2s',
  },
  badge: {
    position: 'absolute', top: 10, left: 10,
    background: '#e63946', color: '#fff',
    fontSize: 9, fontWeight: 800,
    padding: '3px 8px', borderRadius: 4, letterSpacing: 0.5,
  },
  imgBox: {
    width: '100%', height: 140, borderRadius: 8,
    background: '#f5f5f5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  productImg: {
    width: '85%',
    height: '100%',
    objectFit: 'cover',        // use 'cover' if you want it to fill the box
  },
  emoji: { fontSize: 42 },
  info: { width: '100%' },
  brandLabel: { fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 13, fontWeight: 600, color: '#111', margin: '3px 0 6px' },
  priceRow: { display: 'flex', alignItems: 'center', gap: 8 },
  price: { fontSize: 15, fontWeight: 700, color: '#e63946' },
  oldPrice: { fontSize: 11, color: '#bbb', textDecoration: 'line-through' },
  viewBtn: {
    width: '100%', background: '#fff',
    border: '1.5px solid #eee', borderRadius: 6,
    padding: '8px 0', fontSize: 12,
    fontWeight: 600, color: '#333', cursor: 'pointer',
  },
};