import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase';
import '../styles/DealsOfDay.css';

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
    'Gaming Consoles', 'PS5 Games', 'PS4 Games',
    'Headphones', 'Earbuds', 'Bluetooth Speakers',
    'Soundbars', 'Smartphones', 'Televisions', 'Laptops',
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
    <>
      <section className="deals-section">
        <div className="deals-header">
          <div>
            <div className="deals-tagline">🔥 Limited Time</div>
            <h2 className="deals-heading">Deals of the Day</h2>
            <div className="deals-line" />
          </div>
          <button className="deals-viewall" onClick={() => navigate('/category/gaming')}>
            View all →
          </button>
        </div>
        <div className="deals-grid">
          {deals.map((p) => (
            <div key={p.sku} className="deal-card" onClick={() => navigate(`/product/${encodeURIComponent(p.sku)}`)}>
              {p.badge && (
                <span className="deal-badge" style={{ background: p.badge === 'SALE' ? '#e63946' : '#0097a7' }}>
                  {p.badge}
                </span>
              )}
              <div className="deal-imgbox">
                {p.img ? <img src={p.img} alt={p.name} /> : <span className="deal-emoji">{p.icon}</span>}
              </div>
              <div className="deal-info">
                <div className="deal-brand">{p.brand}</div>
                <div className="deal-name">{p.name}</div>
                <div className="deal-pricerow">
                  <span className="deal-price">{p.price}</span>
                  {p.oldPrice && <span className="deal-oldprice">{p.oldPrice}</span>}
                </div>
              </div>
              <div className="deal-actions">
                <button className="deal-cart-btn" onClick={(e) => { e.stopPropagation(); addToCart(p, 1); }}>
                  + Cart
                </button>
                <button className="deal-view-btn" onClick={(e) => {e.stopPropagation(); navigate(`/product/${encodeURIComponent(p.sku)}`); }}>
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}