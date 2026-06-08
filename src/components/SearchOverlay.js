import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/SearchOverlay.css';

export default function SearchOverlay() {
  const { searchQuery, searchResults, searchOpen, clearSearch, addToCart } = useCart();
  const navigate = useNavigate();

  if (!searchOpen) return null;

  return (
    <>
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
              <p className="search-empty-title">No results for "{searchQuery}"</p>
              <p className="search-empty-sub">Try searching by brand, product name, or category</p>
              <p className="search-empty-hint">e.g. "Sony", "PS5", "JBL", "iPhone"</p>
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
                  onClick={() => {
                  navigate(`/product/${encodeURIComponent(p.sku)}`);
                  clearSearch();
                }}
                >
                  <div className="search-card-img">
                    {p.img
                      ? <img src={p.img} alt={p.name} />
                      : <span className="search-card-emoji">{p.icon}</span>
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
    </>
  );
}