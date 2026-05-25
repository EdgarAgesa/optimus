import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import products from '../data/products';
import ProductDrawer from '../components/ProductDrawer';

// Maps URL slug → category name(s) in products.js
const categoryMap = {
  'ps5-games':         ['PS5 Games'],
  'ps4-games':         ['PS4 Games'],
  'gaming-consoles':   ['Gaming Consoles'],
  'gaming':            ['PS5 Games', 'PS4 Games', 'Gaming Consoles'],
  'smartphones':       ['Smartphones'],
  'tablets':           ['Tablets'],
  'phones':            ['Smartphones', 'Tablets'],
  'laptops':           ['Laptops'],
  'headphones':        ['Headphones'],
  'earbuds':           ['Earbuds'],
  'bluetooth-speakers':['Bluetooth Speakers'],
  'soundbars':         ['Soundbars'],
  'audio':             ['Headphones', 'Earbuds', 'Bluetooth Speakers', 'Soundbars'],
  'televisions':       ['Televisions'],
  'tv-streaming':      ['Televisions'],
};

const slugToTitle = {
  'ps5-games':          'PS5 Games',
  'ps4-games':          'PS4 Games',
  'gaming-consoles':    'Gaming Consoles',
  'gaming':             'Gaming',
  'smartphones':        'Smartphones',
  'tablets':            'Tablets',
  'phones':             'Phones',
  'laptops':            'Laptops',
  'headphones':         'Headphones',
  'earbuds':            'Earbuds',
  'bluetooth-speakers': 'Bluetooth Speakers',
  'soundbars':          'Soundbars',
  'audio':              'Audio & Sound',
  'televisions':        'Televisions',
  'tv-streaming':       'TV & Streaming',
};

export default function CategoryPage() {
  const { slug } = useParams();
  const [selected, setSelected] = useState(null);

  const categories = categoryMap[slug] || [];
  const title = slugToTitle[slug] || slug;

  const filtered = categories.length > 0
    ? products.filter(p => categories.includes(p.category))
    : [];

  return (
    <>
      <div style={s.header}>
        <div style={s.breadcrumb}>
          <a href="/" style={s.breadLink}>Home</a>
          <span style={s.sep}>›</span>
          <span style={s.breadCurrent}>{title}</span>
        </div>
        <h1 style={s.title}>{title}</h1>
        <p style={s.count}>{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      {filtered.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: 48 }}>🔍</span>
          <p>No products found in this category yet.</p>
          <a href="/" style={s.backBtn}>← Back to home</a>
        </div>
      ) : (
        <div style={s.section}>
          <div style={s.grid}>
            {filtered.map((p) => (
              <div key={p.sku} style={s.card} onClick={() => setSelected(p)}>
                {p.badge && <span style={s.badge}>{p.badge}</span>}
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
                <button style={s.viewBtn} onClick={(e) => { e.stopPropagation(); setSelected(p); }}>
                  View details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <ProductDrawer product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

const s = {
  header: {
    background: '#fff',
    padding: '24px 32px 16px',
    borderBottom: '1px solid #eee',
  },
  breadcrumb: {
    display: 'flex', alignItems: 'center',
    gap: 6, fontSize: 12,
    color: '#999', marginBottom: 8,
  },
  breadLink: { color: '#0097a7', fontWeight: 500 },
  sep: { color: '#ccc' },
  breadCurrent: { color: '#555' },
  title: {
    fontSize: 24, fontWeight: 800,
    color: '#111', marginBottom: 4,
  },
  count: { fontSize: 13, color: '#999' },
  empty: {
    textAlign: 'center', padding: '80px 24px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 16,
    color: '#888', fontSize: 15,
  },
  backBtn: {
    background: '#0097a7', color: '#fff',
    padding: '10px 24px', borderRadius: 8,
    fontSize: 13, fontWeight: 600,
  },
  section: {
    background: '#f8f8f8',
    padding: '32px',
    minHeight: '60vh',
  },
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
  },
  badge: {
    position: 'absolute', top: 10, left: 10,
    background: '#0097a7', color: '#fff',
    fontSize: 9, fontWeight: 800,
    padding: '3px 8px', borderRadius: 4, letterSpacing: 0.5,
  },
  imgBox: {
    width: '100%', height: 140, borderRadius: 8,
    background: '#f5f5f5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  productImg: { width: '100%', height: '100%', objectFit: 'cover' },
  emoji: { fontSize: 42 },
  info: { width: '100%' },
  brandLabel: { fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 13, fontWeight: 600, color: '#111', margin: '3px 0 6px' },
  priceRow: { display: 'flex', alignItems: 'center', gap: 8 },
  price: { fontSize: 15, fontWeight: 700, color: '#0097a7' },
  oldPrice: { fontSize: 11, color: '#bbb', textDecoration: 'line-through' },
  viewBtn: {
    width: '100%', background: '#fff',
    border: '1.5px solid #eee', borderRadius: 6,
    padding: '8px 0', fontSize: 12,
    fontWeight: 600, color: '#333', cursor: 'pointer',
  },
};