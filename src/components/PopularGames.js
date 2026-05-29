import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';

export default function PopularGames() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { products } = useProducts();

  const items = products.filter(p =>
    p.category === 'PS5 Games' ||
    p.category === 'PS4 Games' ||
    p.category === 'Gaming Consoles'
  ).slice(0, 8);

  return (
    <>
      <style>{`
        .popular-section {
          background: linear-gradient(180deg, #fff, #f5f6fa);
          padding: 48px 32px;
        }
        .popular-header {
          display: flex; justify-content: space-between;
          align-items: flex-end; max-width: 1200px;
          margin: 0 auto 28px; flex-wrap: wrap; gap: 16px;
        }
        .popular-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 18px; max-width: 1200px; margin: 0 auto;
        }
        .pop-card {
          background: #fff; border: 1.5px solid #eee;
          border-radius: 14px; padding: 18px 14px;
          display: flex; flex-direction: column;
          align-items: center; gap: 10px;
          position: relative; cursor: pointer;
          transition: all .25s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .pop-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,151,167,0.15);
          border-color: #0097a7;
        }
        .pop-badge {
          position: absolute; top: 12px; left: 12px;
          color: #fff; font-size: 9px; font-weight: 800;
          padding: 3px 10px; border-radius: 6px;
          letter-spacing: 0.5px;
        }
        .pop-imgbox {
          width: 100%; height: 160px; border-radius: 10px;
          background: #f8f9fa; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .pop-imgbox img { width: 100%; height: 100%; object-fit: cover; }
        .pop-info { width: 100%; }
        .pop-brand {
          font-size: 10px; color: #aaa;
          text-transform: uppercase; letter-spacing: 0.8px;
        }
        .pop-name {
          font-size: 13px; font-weight: 700; color: #111;
          margin: 4px 0 8px; line-height: 1.4;
        }
        .pop-pricerow { display: flex; align-items: center; gap: 8px; }
        .pop-price { font-size: 16px; font-weight: 800; color: #0097a7; }
        .pop-old { font-size: 11px; color: #ccc; text-decoration: line-through; }
        .pop-btn {
          width: 100%;
          background: linear-gradient(135deg, #0097a7, #00bcd4);
          border: none; border-radius: 8px;
          padding: 9px 0; font-size: 12px;
          font-weight: 700; color: #fff; cursor: pointer;
          font-family: Inter, sans-serif;
          transition: opacity .2s;
        }
        .pop-btn:hover { opacity: 0.88; }

        @media (max-width: 600px) {
          .popular-section { padding: 32px 16px; }
          .popular-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .pop-card { padding: 12px 8px; }
          .pop-imgbox { height: 120px; }
          .pop-name { font-size: 12px; }
          .pop-price { font-size: 14px; }
        }
      `}</style>

      <section className="popular-section">
        <div className="popular-header">
          <div>
            <div style={{
              fontSize: 12, color: '#0097a7', fontWeight: 700,
              letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4,
            }}>
              🎮 Most Wanted
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>
              Popular Games & Consoles
            </h2>
            <div style={{
              width: 48, height: 3,
              background: 'linear-gradient(90deg, #0097a7, #00bcd4)',
              borderRadius: 2, marginTop: 8,
            }} />
          </div>
          <button
            style={{
              fontSize: 13, color: '#0097a7', fontWeight: 700,
              background: 'none', border: '1.5px solid #0097a7',
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
            onClick={() => navigate('/category/gaming')}
          >
            View all gaming →
          </button>
        </div>

        <div className="popular-grid">
          {items.map((p) => (
            <div
              key={p.sku}
              className="pop-card"
              onClick={() => navigate(`/product/${encodeURIComponent(p.sku)}`)}
            >
              {p.badge && (
                <span
                  className="pop-badge"
                  style={{ background: p.badge === 'SALE' ? '#e63946' : '#0097a7' }}
                >
                  {p.badge}
                </span>
              )}
              <div className="pop-imgbox">
                {p.img
                  ? <img src={p.img} alt={p.name} />
                  : <span style={{ fontSize: 52 }}>{p.icon}</span>
                }
              </div>
              <div className="pop-info">
                <div className="pop-brand">{p.brand}</div>
                <div className="pop-name">{p.name}</div>
                <div className="pop-pricerow">
                  <span className="pop-price">{p.price}</span>
                  {p.oldPrice && <span className="pop-old">{p.oldPrice}</span>}
                </div>
              </div>
              <button
                className="pop-btn"
                onClick={(e) => { e.stopPropagation(); addToCart(p, 1); }}
              >
                + Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}