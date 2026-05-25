import React from 'react';

const cats = [
  { img: 'https://media.istockphoto.com/id/1412240771/photo/headphones-on-white-background.jpg?b=1&s=612x612&w=0&k=20&c=nh6m1Og0JhZgMvz5IY73WKgC9nCt8ZVvgY1Uk2PPL4M=', label: 'Music lovers on the go', sub: 'Wired & wireless', bg: '#1c1c1c' },
  { img: 'https://media.istockphoto.com/id/1563409200/photo/man-watching-tv-with-remote-control-in-hand.jpg?b=1&s=612x612&w=0&k=20&c=pDP-xS_LBLYmicDCd6N8BMy9n4EewiFi4cfd_r8kvfQ=', label: 'TVs & accessories', sub: 'Wide variety', bg: '#2c2c2c' },
  { img: 'https://images.pexels.com/photos/14740033/pexels-photo-14740033.jpeg', label: 'Games and consoles', sub: 'PS4 · PS5 · Xbox · Nintendo', bg: '#1a1a2e' },
  { img: 'https://images.pexels.com/photos/16442035/pexels-photo-16442035.jpeg', label: 'Smartphones & tablets', sub: 'All top brands', bg: '#0f3460' },
  { img: 'https://images.pexels.com/photos/20432893/pexels-photo-20432893.jpeg', label: 'Laptops', sub: 'HP · Dell · Lenovo · Mac', bg: '#1b2838' },
];

export default function CategoryBanner() {
  return (
    <section style={s.section}>
      {cats.map((c) => (
        <div key={c.label} style={{ ...s.card, background: c.bg }}>
          <img src={c.img} alt={c.label} style={s.img} />
          <div style={s.overlay}>
            <div style={s.sub}>{c.sub}</div>
            <div style={s.label}>{c.label}</div>
          </div>
        </div>
      ))}
    </section>
  );
}

const s = {
  section: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 0,
    height: 340,
  },
  card: {
    position: 'relative', cursor: 'pointer',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden',
  },
            img: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
            },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: '20px 16px',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  },
  sub: { fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  label: { fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.3, textTransform: 'uppercase' },
};