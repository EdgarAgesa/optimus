import React from 'react';

const cats = [
  { icon: '🎮', label: 'Gaming' },
  { icon: '📱', label: 'Phones' },
  { icon: '💻', label: 'Laptops' },
  { icon: '🎧', label: 'Audio' },
  { icon: '📺', label: 'TV & Streaming' },
];

export default function Categories() {
  return (
    <section style={s.section}>
      <h2 style={s.heading}>Shop by category</h2>
      <div style={s.grid}>
        {cats.map((c) => (
          <div key={c.label} style={s.card}>
            <span style={s.icon}>{c.icon}</span>
            <span style={s.label}>{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const s = {
  section: { padding: '48px 24px', background: '#fff' },
  heading: {
    fontSize: 20, fontWeight: 700, color: '#111',
    marginBottom: 24, textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: 14, maxWidth: 900, margin: '0 auto',
  },
  card: {
    border: '1.5px solid #e5e5e5', borderRadius: 12,
    padding: '24px 12px', textAlign: 'center',
    cursor: 'pointer', background: '#fff',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 10,
},
  icon: { fontSize: 32 },
  label: { fontSize: 13, fontWeight: 500, color: '#333' },
};