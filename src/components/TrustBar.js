import React from 'react';
import { StarIcon, TruckIcon, MobilePayIcon, CheckCircleIcon } from './icons';

// Outline icons (monochrome Runway treatment) — native emoji removed.
const items = [
  { Icon: StarIcon, title: '4.9 / 5 Trustscore', sub: 'Trusted by hundreds' },
  { Icon: TruckIcon, title: 'Nairobi Delivery', sub: 'Fast & reliable' },
  { Icon: MobilePayIcon, title: 'We accept M-Pesa', sub: 'All cards too' },
  { Icon: CheckCircleIcon, title: 'No fakes!', sub: 'Only original products' },
];

export default function TrustBar() {
  return (
    <div className="bg-ink-900 border-y border-edge font-sans">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-screen-xl mx-auto px-4 py-6">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <item.Icon className="w-6 h-6 shrink-0 text-teal-500" />
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
