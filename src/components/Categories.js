import React from 'react';
import '../styles/Categories.css';

const cats = [
  { icon: '🎮', label: 'Gaming' },
  { icon: '📱', label: 'Phones' },
  { icon: '💻', label: 'Laptops' },
  { icon: '🎧', label: 'Audio' },
  { icon: '📺', label: 'TV & Streaming' },
];

export default function Categories() {
  return (
    <section className="shopcat-section">
      <h2 className="shopcat-heading">Shop by category</h2>
      <div className="shopcat-grid">
        {cats.map((c) => (
          <div key={c.label} className="shopcat-card">
            <span className="shopcat-icon">{c.icon}</span>
            <span className="shopcat-label">{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
