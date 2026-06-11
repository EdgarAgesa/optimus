import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase';
import ProductCard from './ProductCard';

export default function DealsOfDay() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { products } = useProducts();
  const [supabaseDeals, setSupabaseDeals] = useState([]);

  useEffect(() => {
    const fetchDeals = async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          product_sku, sort_order,
          products (
            sku, name, brand, category,
            price, old_price, badge, images, icon, tags, specs, description
          )
        `)
        .order('sort_order');

      if (!error && data && data.length > 0) {
        const mapped = data
          .filter(d => d.products)
          .map(d => ({
            sku: d.products.sku,
            name: d.products.name,
            brand: d.products.brand,
            category: d.products.category,
            price: d.products.price,
            oldPrice: d.products.old_price || null,
            badge: d.products.badge || null,
            img: d.products.images?.[0] || null,
            images: d.products.images || [],
            icon: d.products.icon || '📦',
            tags: d.products.tags || [],
            specs: d.products.specs || [],
            description: d.products.description || '',
          }));
        setSupabaseDeals(mapped);
      }
    };
    fetchDeals();
  }, []);

    const categoryOrder = [
    'Gaming Consoles', 'Games', 'PS5 Games', 'PS4 Games',
    'Headphones', 'Earbuds', 'Bluetooth Speakers',
    'Smartphones', 'Televisions', 'Laptops', 'Soundbars', 'Tablets'
  ];

  const autoDeals = categoryOrder.reduce((acc, cat) => {
    const catProducts = products.filter(p =>
      p.category === cat && (p.badge || p.oldPrice)
    );
    const fallback = products.filter(p => p.category === cat);
    const pool = catProducts.length > 0 ? catProducts : fallback;
    const pick = pool.find(p => !acc.find(d => d.sku === p.sku));
    if (pick) acc.push(pick);
    return acc;
  }, []).slice(0, 8);

  const deals = supabaseDeals.length > 0 ? supabaseDeals : autoDeals;

  return (
    <section className="bg-ink-900 font-sans">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="inline-block bg-accent text-white text-label uppercase rounded-full px-3 py-1">
              Limited Time
            </span>
            <h2 className="text-heading text-fg-hi mt-3">Deals of the Day</h2>
          </div>
          <button
            onClick={() => navigate('/category/gaming')}
            className="bg-transparent text-fg-hi text-body border border-edge rounded-full px-5 py-2 cursor-pointer min-h-11 shrink-0"
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {deals.map((p, i) => (
            <ProductCard
              key={p.sku}
              product={p}
              featured={i === 0}
              onOpen={() => navigate(`/product/${encodeURIComponent(p.sku)}`)}
              onAddToCart={(prod) => addToCart(prod, 1)}
              secondaryLabel="Details"
              onSecondary={(prod) => navigate(`/product/${encodeURIComponent(prod.sku)}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}