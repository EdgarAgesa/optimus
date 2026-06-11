import React from 'react';

const items = [
  { icon: '⭐', title: '4.9 / 5 Trustscore', sub: 'Trusted by hundreds' },
  { icon: '🚚', title: 'Nairobi Delivery', sub: 'Fast & reliable' },
  { icon: '📲', title: 'We accept M-Pesa', sub: 'All cards too' },
  { icon: '✅', title: 'No fakes!', sub: 'Only original products' },
];

export default function TrustBar() {
  return (
    <div className="bg-ink-900 border-y border-edge font-sans">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-screen-xl mx-auto px-4 py-6">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <span className="text-card-title" aria-hidden="true">{item.icon}</span>
            <div>
              <div className="text-label uppercase text-fg-hi">{item.title}</div>
              <div className="text-micro text-fg-low">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
