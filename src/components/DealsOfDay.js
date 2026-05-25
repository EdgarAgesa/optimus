/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';

const deals = [
  { img: 'https://vividgold.co.ke/cdn/shop/files/Edge-Controller.png?v=1722421405', icon: '🎮', name: 'PS5 DualSense Controller', brand: 'Sony', price: 'KSh 8,500', old: 'KSh 10,000', badge: 'HOT' },
  { img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHJp0iWXSrvFjq8xkCwTwOOqT9zdFKaMt9rQ&s', icon: '🎧', name: 'JBL Tune 780NC', brand: 'JBL', price: 'KSh 10,999', old: 'KSh 14,000', badge: 'DEAL' },
  { img: 'https://phonehubkenya.co.ke/wp-content/uploads/2024/03/Samsung-Galaxy-A55.jpg', icon: '📱', name: 'Samsung Galaxy A55', brand: 'Samsung', price: 'KSh 52,000', old: 'KSh 58,000', badge: 'NEW' },
  { img: 'https://zuricart.co.ke/_next/image?url=https%3A%2F%2Fcdn.zuricart.co.ke%2Fproduct%2Flenovo-ideapad-3-14-core-i5.jpeg&w=640&q=75', icon: '💻', name: 'Lenovo IdeaPad 3', brand: 'Lenovo', price: 'KSh 58,000', old: 'KSh 65,000', badge: null },
  { img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUP1Z82MGQxVtx-2NRtUfpd8cJDcQR65iqlA&s', icon: '🔊', name: 'Harman Kardon Aura 5', brand: 'Harman', price: 'KSh 37,999', old: null, badge: 'NEW' },
];

export default function DealsOfDay() {
  return (
    <section style={s.section}>
      <div style={s.header}>
        <div>
          <h2 style={s.heading}>Deals of the Day 😎✨</h2>
          <p style={s.sub}>New promos every day</p>
          <div style={s.line} />
        </div>
        <a href="#" style={s.viewAll}>View all deals →</a>
      </div>

      <div style={s.grid}>
        {deals.map((p) => (
          <div key={p.name} style={s.card}>
            {p.badge && <span style={s.badge}>{p.badge}</span>}
            <div style={s.imgBox}>
              {p.img ? (
                <img src={p.img} alt={p.name} style={s.productImg} />
              ) : (
                <span style={s.emoji}>{p.icon}</span>
              )}
            </div>
            <div style={s.info}>
              <div style={s.brand}>{p.brand}</div>
              <div style={s.name}>{p.name}</div>
              <div style={s.priceRow}>
                <span style={s.price}>{p.price}</span>
                {p.old && <span style={s.oldPrice}>{p.old}</span>}
              </div>
            </div>
            <button style={s.btn}>Add to cart</button>
          </div>
        ))}
      </div>
    </section>
  );
}

const s = {
  section: { padding: '40px 32px', background: '#fff' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24,
  },
  heading: { fontSize: 22, fontWeight: 800, color: '#111' },
  sub: { fontSize: 13, color: '#888', marginTop: 4 },
  line: { width: 60, height: 3, background: '#e63946', marginTop: 8, borderRadius: 2 },
  viewAll: { fontSize: 13, color: '#e63946', fontWeight: 600, marginTop: 8 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    gap: 16,
  },
  card: {
    border: '1px solid #eee', borderRadius: 10,
    padding: '18px 14px', background: '#fff',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 10,
    position: 'relative',
    transition: 'box-shadow .2s',
  },
  badge: {
    position: 'absolute', top: 10, left: 10,
    background: '#e63946', color: '#fff',
    fontSize: 9, fontWeight: 800,
    padding: '3px 8px', borderRadius: 4,
    letterSpacing: 0.5,
  },
  imgBox: {
    width: 90, height: 90, borderRadius: 10,
    background: '#f8f8f8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',

  },
  productImg: { width: '100%', height: '100%', objectFit: 'cover' },
  emoji: { fontSize: 42 },
  info: { width: '100%' },
  brand: { fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 13, fontWeight: 600, color: '#111', margin: '4px 0' },
  priceRow: { display: 'flex', alignItems: 'center', gap: 8 },
  price: { fontSize: 15, fontWeight: 700, color: '#e63946' },
  oldPrice: { fontSize: 11, color: '#bbb', textDecoration: 'line-through' },
  btn: {
    width: '100%', background: '#fff',
    border: '1.5px solid #eee', borderRadius: 6,
    padding: '8px 0', fontSize: 12,
    fontWeight: 600, color: '#333',
    transition: 'border-color .2s',
  },
};