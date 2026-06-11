import React from 'react';
import { useNavigate } from 'react-router-dom';

// Gradient identity cards (spec 5): zero-bandwidth CSS replaces the previous
// remote stock photos. Mobile: scroll-snap row with next-card peek (D7) —
// w-72 cards on 360-414px viewports leave ~15-25% of the next card visible.
const cats = [
  { label: 'Music lovers on the go', sub: 'Wired & wireless', slug: 'audio', grad: 'bg-grad-audio' },
  { label: 'TVs & accessories', sub: 'Wide variety', slug: 'tv-streaming', grad: 'bg-grad-tv' },
  { label: 'Games and consoles', sub: 'PS4 · PS5 · Xbox · Nintendo', slug: 'gaming', grad: 'bg-grad-gaming' },
  { label: 'Smartphones & tablets', sub: 'All top brands', slug: 'phones', grad: 'bg-grad-phones' },
  { label: 'Laptops', sub: 'HP · Dell · Lenovo · Mac', slug: 'laptops', grad: 'bg-grad-laptops' },
];

export default function CategoryBanner() {
  const navigate = useNavigate();

  return (
    <section className="bg-ink-900 font-sans">
      <div className="max-w-screen-xl mx-auto py-12">
        <h2 className="text-heading text-fg-hi px-4 mb-6">Shop by category</h2>
        <div className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-pl-4 px-4 pb-2">
          {cats.map((c) => (
            <button
              key={c.slug}
              onClick={() => navigate(`/category/${c.slug}`)}
              className={`relative snap-start shrink-0 w-72 md:w-auto h-44 ${c.grad} rounded-feat border-0 p-6 flex flex-col justify-end items-start text-left cursor-pointer overflow-hidden`}
            >
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
              <span aria-hidden="true" className="absolute top-4 right-5 text-card-title text-white">→</span>
              <span className="relative text-label uppercase text-fg-mid">{c.sub}</span>
              <span className="relative text-card-title text-white mt-1">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
