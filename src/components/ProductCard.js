import React from 'react';

// Shared product card (spec 5): ink-800 surface, edge border, radius-16 standard /
// radius-32 + glow when featured. Used by DealsOfDay, PopularGames, CategoryPage.
export default function ProductCard({
  product: p,
  featured = false,
  onOpen,
  onAddToCart,
  secondaryLabel = null,
  onSecondary = null,
}) {
  return (
    <div
      onClick={onOpen}
      className={`relative flex flex-col bg-ink-800 border border-edge overflow-hidden cursor-pointer transition-colors duration-200 hover:bg-ink-700 font-sans ${featured ? 'rounded-feat shadow-glow-featured' : 'rounded-xl'}`}
    >
      {p.badge && (
        <span
          className={`absolute top-3 left-3 z-10 text-micro font-medium rounded-full px-2 py-1 ${p.badge === 'SALE' ? 'bg-accent text-white' : 'bg-teal-500 text-ink-950'}`}
        >
          {p.badge}
        </span>
      )}

      <div className="relative aspect-square bg-ink-900">
        {p.img ? (
          <img
            src={p.img}
            alt={p.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-display">{p.icon}</span>
        )}
      </div>

      <div className="flex-1 p-4">
        <div className="text-label uppercase text-fg-low">{p.brand}</div>
        <div className="text-card-title text-fg-hi mt-1 line-clamp-2">{p.name}</div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-price text-teal-500">{p.price}</span>
          {p.oldPrice && <span className="text-body text-fg-low line-through">{p.oldPrice}</span>}
        </div>
      </div>

      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
          className="flex-1 bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-4 py-2 cursor-pointer min-h-11"
        >
          + Cart
        </button>
        {secondaryLabel && (
          <button
            onClick={(e) => { e.stopPropagation(); onSecondary(p); }}
            className="flex-1 bg-transparent text-fg-hi text-body border border-edge rounded-full px-4 py-2 cursor-pointer min-h-11"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
