/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import ProductDrawer from './ProductDrawer';
import products from '../data/products';
import '../styles/FeaturedProducts.css';


export default function FeaturedProducts() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <section className="feat-section">
        <div className="feat-header">
          <h2 className="feat-heading">Featured products</h2>
          <a href="#" className="feat-seeall">See all →</a>
        </div>
        <div className="feat-grid">
          {products.map((p) => (
            <div key={p.sku} className="feat-card" onClick={() => setSelected(p)}>
              {p.badge && <span className="feat-badge">{p.badge}</span>}

              {/* Image box — shows img if provided, falls back to emoji */}
              <div className="feat-imgbox">
                {p.img ? (
                  <img src={p.img} alt={p.name} className="feat-img" />
                ) : (
                  <span className="feat-emoji">{p.icon}</span>
                )}
              </div>

              <div className="feat-info">
                <div className="feat-brand">{p.brand}</div>
                <div className="feat-name">{p.name}</div>
                <div className="feat-pricerow">
                  <span className="feat-price">{p.price}</span>
                  {p.oldPrice && <span className="feat-oldprice">{p.oldPrice}</span>}
                </div>
              </div>
              <button
                className="feat-viewbtn"
                onClick={(e) => { e.stopPropagation(); setSelected(p); }}
              >
                View details
              </button>
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <ProductDrawer product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
