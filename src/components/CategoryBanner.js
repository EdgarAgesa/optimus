import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeadphonesIcon, TvIcon, GamepadIcon, PhoneIcon, LaptopIcon } from './icons';

// Gradient identity cards (spec 5): zero-bandwidth CSS replaces the previous
// remote stock photos. Mobile: scroll-snap row with next-card peek (D7) —
// w-72 cards on 360-414px viewports leave ~15-25% of the next card visible.
// Cards are nav chips (h-24 mobile / h-44 desktop) with a large low-opacity
// outline glyph filling the gradient field. No native emoji.
const cats = [
  { label: 'Music lovers on the go', sub: 'Wired & wireless', slug: 'audio', grad: 'bg-grad-audio', Icon: HeadphonesIcon },
  { label: 'TVs & accessories', sub: 'Wide variety', slug: 'tv-streaming', grad: 'bg-grad-tv', Icon: TvIcon },
  { label: 'Games and consoles', sub: 'PS4 · PS5 · Xbox · Nintendo', slug: 'gaming', grad: 'bg-grad-gaming', Icon: GamepadIcon },
  { label: 'Smartphones & tablets', sub: 'All top brands', slug: 'phones', grad: 'bg-grad-phones', Icon: PhoneIcon },
  { label: 'Laptops', sub: 'HP · Dell · Lenovo · Mac', slug: 'laptops', grad: 'bg-grad-laptops', Icon: LaptopIcon },
];

export default function CategoryBanner() {
  const navigate = useNavigate();

  return (
    <section className="bg-ink-900 font-sans">
      <div className="max-w-screen-xl mx-auto py-12">
        <h2 className="text-heading text-fg-hi px-4 mb-6">Shop by category</h2>
        <div className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-pl-4 px-4 pb-2 scrollbar-hide">
          {cats.map((c) => (
            <button
              key={c.slug}
              onClick={() => navigate(`/category/${c.slug}`)}
              className={`relative snap-start shrink-0 w-72 md:w-auto h-24 md:h-44 ${c.grad} rounded-feat border-0 p-4 md:p-6 flex flex-col justify-end items-start text-left cursor-pointer overflow-hidden`}
            >
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
              <c.Icon className="absolute -right-2 -top-1 w-20 h-20 md:w-32 md:h-32 text-white opacity-10" />
              <span className="relative text-label uppercase text-fg-mid">{c.sub}</span>
              <span className="relative text-card-title text-white mt-1">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
