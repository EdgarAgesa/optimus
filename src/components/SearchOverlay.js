import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductDrawer from './ProductDrawer';

export default function SearchOverlay() {
  const { searchQuery, searchResults, searchOpen, clearSearch, addToCart } = useCart();
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  if (!searchOpen) return null;

  return (
    <>
      <style>{`
        .search-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 8000;
          animation: fadeIn .2s;
        }
        .search-panel {
          position: fixed;
          top: 130px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 900px;
          max-height: 70vh;
          background: #fff;
          border-radius: 16px;
          z-index: 8001;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.25);
          display: flex;
          flex-direction: column;
          animation: popIn .25s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn {
          from { transform: translateX(-50%) scale(0.96); opacity: 0; }
          to   { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        .search-panel-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          background: #fff;
        }
        .search-panel-title {
          font-size: 14px;
          font-weight: 700;
          color: #111;
        }
        .search-panel-title span {
          color: #0097a7;
        }
        .search-panel-meta {
          font-size: 12px;
          color: #888;
          margin-top: 2px;
        }
        .search-close {
          background: #f5f5f5;
          border: none;
          width: 36px; height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          color: #555;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background .15s;
        }
        .search-close:hover { background: #e0e0e0; }
        .search-panel-body {
          overflow-y: auto;
          padding: 20px;
          flex: 1;
        }
        .search-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 14px;
        }
        .search-card {
          background: #fff;
          border: 1.5px solid #eee;
          border-radius: 12px;
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all .2s;
        }
        .search-card:hover {
          border-color: #0097a7;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,151,167,0.12);
        }
        .search-card-img {
          width: 100%;
          height: 110px;
          border-radius: 8px;
          background: #f8f8f8;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .search-card-img img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .search-card-brand {
          font-size: 9px; color: #aaa;
          text-transform: uppercase;
          letter-spacing: 0.8px; width: 100%;
        }
        .search-card-name {
          font-size: 12px; font-weight: 700;
          color: #111; width: 100%; line-height: 1.3;
        }
        .search-card-price {
          font-size: 14px; font-weight: 800;
          color: #0097a7; width: 100%;
        }
        .search-card-btn {
          width: 100%;
          background: linear-gradient(135deg, #0097a7, #00bcd4);
          border: none; border-radius: 6px;
          padding: 8px 0; font-size: 11px;
          font-weight: 700; color: #fff;
          cursor: pointer; transition: opacity .2s;
        }
        .search-card-btn:hover { opacity: 0.85; }
        .search-empty {
          text-align: center;
          padding: 48px 20px;
          color: #888;
        }
        .search-empty-icon {
          font-size: 52px;
          margin-bottom: 14px;
          opacity: 0.35;
        }
        .search-browse-btn {
          display: inline-flex;
          align-items: center; gap: 6px;
          margin-top: 16px;
          background: #e0f7fa; color: #0097a7;
          padding: 9px 20px; border-radius: 20px;
          font-size: 13px; font-weight: 700;
          cursor: pointer; border: none;
          font-family: Inter, sans-serif;
        }

        @media (max-width: 768px) {
          .search-panel {
            top: 110px;
            width: 95%;
          }
        }
        @media (max-width: 480px) {
          .search-panel { top: 100px; width: 96%; }
          .search-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
        }
      `}</style>

      {/* Dark overlay — click to close */}
      <div className="search-overlay" onClick={clearSearch} />

      {/* Search results panel */}
      <div className="search-panel">
        {/* Header */}
        <div className="search-panel-header">
          <div>
            <div className="search-panel-title">
              {searchResults.length > 0
                ? <><span>{searchResults.length}</span> results for "{searchQuery}"</>
                : <>Searching for "{searchQuery}"</>
              }
            </div>
            <div className="search-panel-meta">
              {searchResults.length > 0
                ? 'Click a product to view details'
                : 'Try a different keyword'
              }
            </div>
          </div>
          <button className="search-close" onClick={clearSearch}>✕</button>
        </div>

        {/* Body */}
        <div className="search-panel-body">
          {searchResults.length === 0 ? (
            <div className="search-empty">
              <div className="search-empty-icon">🔍</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#444', marginBottom: 6 }}>
                No results for "{searchQuery}"
              </p>
              <p style={{ fontSize: 13, color: '#aaa', marginBottom: 4 }}>
                Try searching by brand, product name, or category
              </p>
              <p style={{ fontSize: 12, color: '#bbb' }}>
                e.g. "Sony", "PS5", "JBL", "iPhone"
              </p>
              <button
                className="search-browse-btn"
                onClick={() => { clearSearch(); navigate('/'); }}
              >
                ← Browse all products
              </button>
            </div>
          ) : (
            <div className="search-grid">
              {searchResults.slice(0, 12).map(p => (
                <div
                  key={p.sku}
                  className="search-card"
                  onClick={() => setSelected(p)}
                >
                  <div className="search-card-img">
                    {p.img
                      ? <img src={p.img} alt={p.name} />
                      : <span style={{ fontSize: 40 }}>{p.icon}</span>
                    }
                  </div>
                  <div className="search-card-brand">{p.brand}</div>
                  <div className="search-card-name">{p.name}</div>
                  <div className="search-card-price">{p.price}</div>
                  <button
                    className="search-card-btn"
                    onClick={e => {
                      e.stopPropagation();
                      addToCart(p, 1);
                      clearSearch();
                    }}
                  >
                    + Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <ProductDrawer
          product={selected}
          onClose={() => { setSelected(null); clearSearch(); }}
        />
      )}
    </>
  );
}