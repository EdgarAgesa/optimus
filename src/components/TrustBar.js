import React from 'react';

const items = [
  { icon: '⭐', title: '4.9 / 5 Trustscore', sub: 'Trusted by hundreds' },
  { icon: '🚚', title: 'Nairobi Delivery', sub: 'Fast & reliable' },
  { icon: '📲', title: 'We accept M-Pesa', sub: 'All cards too' },
  { icon: '✅', title: 'No fakes!', sub: 'Only original products' },
];

export default function TrustBar() {
  return (
    <div style={s.bar}>
      {items.map((item) => (
        <div key={item.title} style={s.item}>
          <span style={s.icon}>{item.icon}</span>
          <div>
            <div style={s.title}>{item.title}</div>
            <div style={s.sub}>{item.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const s = {
  bar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    borderBottom: '1px solid #eee',
    borderTop: '3px solid #0097a7',
    background: '#fff',
  },
  item: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '18px 24px',
    borderRight: '1px solid #eee',
  },
  icon: { fontSize: 26 },
  title: { fontSize: 13, fontWeight: 700, color: '#111' },
  sub: { fontSize: 11, color: '#888', marginTop: 2 },
};