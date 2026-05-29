import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase';

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
      <style>{`
        .deals-section { padding: 48px 32px; background: #fff; }
        .deals-header {
          display: flex; justify-content: space-between;
          align-items: flex-end; max-width: 1200px;
          margin: 0 auto 28px; flex-wrap: wrap; gap: 16px;
        }
        .deals-tagline {
          font-size: 12px; color: #e63946; font-weight: 700;
          letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px;
        }
        .deals-heading { font-size: 24px; font-weight: 800; color: #111; }
        .deals-line {
          width: 48px; height: 3px;
          background: linear-gradient(90deg, #e63946, #ff6b6b);
          border-radius: 2px; margin-top: 8px;
        }
        .deals-viewall {
          font-size: 13px; color: #0097a7; font-weight: 700;
          background: none; border: 1.5px solid #0097a7;
          padding: 9px 20px; border-radius: 8px;
          cursor: pointer; font-family: Inter, sans-serif; transition: all .2s;
        }
        .deals-viewall:hover { background: #0097a7; color: #fff; }
        .deals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 18px; max-width: 1200px; margin: 0 auto;
        }
        .deal-card {
          background: #fff; border: 1.5px solid #eee;
          border-radius: 14px; padding: 16px 14px;
          display: flex; flex-direction: column;
          align-items: center; gap: 10px;
          position: relative; cursor: pointer; transition: all .25s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .deal-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,151,167,0.15);
          border-color: #0097a7;
        }
        .deal-badge {
          position: absolute; top: 12px; left: 12px;
          color: #fff; font-size: 9px; font-weight: 800;
          padding: 3px 10px; border-radius: 6px; letter-spacing: 0.5px;
        }
        .deal-imgbox {
          width: 100%; height: 160px; border-radius: 10px;
          background: #f8f9fa; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .deal-imgbox img { width: 100%; height: 100%; object-fit: cover; }
        .deal-info { width: 100%; }
        .deal-brand {
          font-size: 10px; color: #aaa;
          text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 3px;
        }
        .deal-name { font-size: 13px; font-weight: 700; color: #111; margin-bottom: 6px; line-height: 1.4; }
        .deal-pricerow { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
        .deal-price { font-size: 16px; font-weight: 800; color: #0097a7; }
        .deal-oldprice { font-size: 11px; color: #ccc; text-decoration: line-through; }
        .deal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
        .deal-cart-btn {
          background: linear-gradient(135deg, #0097a7, #00bcd4);
          border: none; border-radius: 8px; padding: 9px 0;
          font-size: 12px; font-weight: 700; color: #fff;
          cursor: pointer; font-family: Inter, sans-serif;
          transition: opacity .2s; width: 100%;
        }
        .deal-cart-btn:hover { opacity: 0.88; }
        .deal-view-btn {
          background: #fff; border: 1.5px solid #0097a7;
          border-radius: 8px; padding: 9px 0; font-size: 12px;
          font-weight: 700; color: #0097a7; cursor: pointer;
          font-family: Inter, sans-serif; transition: all .2s; width: 100%;
        }
        .deal-view-btn:hover { background: #e0f7fa; }
        @media (max-width: 600px) {
          .deals-section { padding: 32px 16px; }
          .deals-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .deal-card { padding: 12px 8px; }
          .deal-imgbox { height: 120px; }
          .deal-name { font-size: 12px; }
          .deal-price { font-size: 14px; }
          .deal-actions { grid-template-columns: 1fr; gap: 6px; }
        }
      `}</style>

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
                {p.img ? <img src={p.img} alt={p.name} /> : <span style={{ fontSize: 52 }}>{p.icon}</span>}
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