import React from 'react';
import '../styles/TrustBar.css';

const items = [
  { icon: '⭐', title: '4.9 / 5 Trustscore', sub: 'Trusted by hundreds' },
  { icon: '🚚', title: 'Nairobi Delivery', sub: 'Fast & reliable' },
  { icon: '📲', title: 'We accept M-Pesa', sub: 'All cards too' },
  { icon: '✅', title: 'No fakes!', sub: 'Only original products' },
];

export default function TrustBar() {
  return (
    <div className="trust-bar">
      {items.map((item) => (
        <div key={item.title} className="trust-item">
          <span className="trust-icon">{item.icon}</span>
          <div>
            <div className="trust-title">{item.title}</div>
            <div className="trust-sub">{item.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
