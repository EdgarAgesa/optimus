import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';

export default function PopularGames() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { products } = useProducts();

    const items = products.filter(p =>
    p.category === 'Games' ||
    p.category === 'PS5 Games' ||
    p.category === 'PS4 Games' ||
    p.category === 'Gaming Consoles'
  ).slice(0, 8);
  return (
    <section className="bg-ink-900 font-sans">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-label uppercase text-teal-500">Most Wanted</span>
            <h2 className="text-heading text-fg-hi mt-2">Popular Games &amp; Consoles</h2>
          </div>
          <button
            onClick={() => navigate('/category/gaming')}
            className="bg-transparent text-fg-hi text-body border border-edge rounded-full px-5 py-2 cursor-pointer min-h-11 shrink-0"
          >
            View all gaming →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard
              key={p.sku}
              product={p}
              onOpen={() => navigate(`/product/${encodeURIComponent(p.sku)}`)}
              onAddToCart={(prod) => addToCart(prod, 1)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
