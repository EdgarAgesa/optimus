import React from 'react';

const slides = [
  {
    bg: '#0d2b33',
    tag: '🎮 Now in stock',
    title: 'PlayStation 5',
    sub: 'Disc & Digital editions available',
    price: 'From KSh 78,000',
    cta: 'Shop PS5',
    emoji: '🎮',
    accent: '#0097a7',
  },
  {
    bg: '#0f2a35',
    tag: '📱 Latest arrivals',
    title: 'iPhone 15 Series',
    sub: 'All models. All colors.',
    price: 'From KSh 120,000',
    cta: 'Shop iPhones',
    emoji: '📱',
    accent: '#00bcd4',
  },
  {
    bg: '#0a1f2e',
    tag: '🎧 Audio deals',
    title: 'JBL & Sony',
    sub: 'Headphones, earbuds & speakers',
    price: 'From KSh 2,500',
    cta: 'Shop Audio',
    emoji: '🎧',
    accent: '#26c6da',
  },
];

export default function Hero() {
  const [active, setActive] = React.useState(0);
  const slide = slides[active];

  return (
    <section style={{ ...s.hero, background: slide.bg }}>
      <div style={s.inner}>
        <span style={{ ...s.tag, background: slide.accent }}>{slide.tag}</span>
        <h1 style={s.h1}>{slide.title}</h1>
        <p style={s.sub}>{slide.sub}</p>
        <p style={{ ...s.price, color: slide.accent }}>{slide.price}</p>
        <button style={{ ...s.cta, background: slide.accent }}>{slide.cta} →</button>
      </div>
      <div style={s.emojiBox}>{slide.emoji}</div>

      {/* Dots */}
      <div style={s.dots}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{ ...s.dot, background: i === active ? slide.accent : '#ffffff44' }} />
        ))}
      </div>
    </section>
  );
}

const s = {
  hero: {
    position: 'relative', overflow: 'hidden',
    padding: '60px 48px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 340,
    transition: 'background 0.4s',
  },
  inner: { maxWidth: 480, zIndex: 2 },
  tag: {
    display: 'inline-block', color: '#fff',
    fontSize: 11, fontWeight: 700,
    padding: '4px 12px', borderRadius: 4,
    letterSpacing: 0.5, marginBottom: 16,
    textTransform: 'uppercase',
  },
  h1: {
    fontSize: 'clamp(32px, 5vw, 52px)',
    fontWeight: 800, color: '#fff',
    lineHeight: 1.1, marginBottom: 10,
    letterSpacing: -1,
  },
  sub: { fontSize: 15, color: '#aaa', marginBottom: 10 },
  price: { fontSize: 20, fontWeight: 700, marginBottom: 24 },
  cta: {
    border: 'none', color: '#fff',
    padding: '13px 28px', borderRadius: 8,
    fontSize: 14, fontWeight: 700,
    cursor: 'pointer', letterSpacing: 0.3,
  },
  emojiBox: {
    fontSize: 140, opacity: 0.15,
    position: 'absolute', right: 60, top: '50%',
    transform: 'translateY(-50%)',
    userSelect: 'none',
  },
  dots: {
    position: 'absolute', bottom: 20, left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', gap: 8,
  },
  dot: {
    width: 10, height: 10, borderRadius: '50%',
    border: 'none', cursor: 'pointer',
    padding: 0,
  },
};