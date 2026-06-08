import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import '../styles/PopularGames.css';

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
    <section className="popular-section">
      <div className="popular-header">
        <div>
          <div className="popular-eyebrow">🎮 Most Wanted</div>
          <h2 className="popular-title">Popular Games & Consoles</h2>
          <div className="popular-underline" />
        </div>
        <button
          className="popular-viewall"
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
                : <span className="pop-emoji">{p.icon}</span>
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
  );
}
