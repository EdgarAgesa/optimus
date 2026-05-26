import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import products from '../data/products';
import { useCart } from '../context/CartContext';

export default function ProductPage() {
  const { sku } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const product = products.find(p => p.sku === sku);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImg(0);
    setQty(1);
  }, [sku]);

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
        <p style={{ fontSize: 16, color: '#555', marginBottom: 20 }}>Product not found</p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: '#0097a7', color: '#fff', border: 'none',
            padding: '12px 28px', borderRadius: 8, fontSize: 14,
            fontWeight: 700, cursor: 'pointer',
          }}
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  const p = product;

  // Related products — same category, different sku
  const related = products
    .filter(r => r.category === p.category && r.sku !== p.sku)
    .slice(0, 5);

  // Multiple images — main + fallback extras
  const images = p.img ? [p.img] : [];

  const calcSave = () => {
    if (!p.oldPrice) return null;
    const current = parseInt(p.price.replace(/\D/g, ''));
    const old = parseInt(p.oldPrice.replace(/\D/g, ''));
    return Math.round((1 - current / old) * 100);
  };

  const handleAdd = () => {
    addToCart(p, qty);
  };

  return (
    <>
      <style>{`
        .pp-page {
          background: #f5f6fa;
          min-height: 100vh;
          font-family: Inter, sans-serif;
        }

        /* Breadcrumb */
        .pp-breadcrumb {
          background: #fff;
          border-bottom: 1px solid #eee;
          padding: 12px 32px;
        }
        .pp-breadcrumb-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #999; flex-wrap: wrap;
        }
        .pp-breadcrumb a {
          color: #0097a7; cursor: pointer; font-weight: 600;
          text-decoration: none;
        }
        .pp-breadcrumb a:hover { text-decoration: underline; }
        .pp-breadcrumb span { color: #ddd; }

        /* Main layout */
        .pp-main {
          max-width: 1280px; margin: 0 auto;
          padding: 28px 32px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }

        /* Images */
        .pp-images { position: sticky; top: 100px; }
        .pp-main-img {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 16px;
          overflow: hidden;
          background: #fff;
          border: 1px solid #eee;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .pp-main-img img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .pp-main-img-placeholder {
          font-size: 120px; opacity: 0.4;
        }
        .pp-thumbs {
          display: flex; gap: 10px; flex-wrap: wrap;
        }
        .pp-thumb {
          width: 72px; height: 72px; border-radius: 10px;
          border: 2px solid #eee; overflow: hidden;
          cursor: pointer; transition: border-color .2s;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
        }
        .pp-thumb.active { border-color: #0097a7; }
        .pp-thumb:hover { border-color: #0097a7; }
        .pp-thumb img { width: 100%; height: 100%; object-fit: cover; }

        /* Info */
        .pp-info {
          background: #fff; border-radius: 16px;
          padding: 28px; border: 1px solid #eee;
        }
        .pp-category-tag {
          display: inline-block;
          background: #e0f7fa; color: #0097a7;
          font-size: 11px; font-weight: 700;
          padding: 4px 12px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 12px;
        }
        .pp-brand { font-size: 13px; color: #999; margin-bottom: 6px; font-weight: 600; }
        .pp-title {
          font-size: 28px; font-weight: 900; color: #111;
          line-height: 1.2; margin-bottom: 12px; letter-spacing: -0.5px;
        }
        .pp-meta {
          display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
        }
        .pp-meta-item {
          font-size: 11px; color: #aaa;
          display: flex; align-items: center; gap: 4px;
        }
        .pp-price-box {
          background: #f8fffe; border: 1px solid #e0f7fa;
          border-radius: 12px; padding: 16px 20px;
          margin-bottom: 20px;
        }
        .pp-price-row {
          display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;
        }
        .pp-price {
          font-size: 32px; font-weight: 900; color: #0097a7;
        }
        .pp-oldprice {
          font-size: 18px; color: #bbb; text-decoration: line-through;
        }
        .pp-save {
          background: #fff0f0; color: #e63946;
          font-size: 12px; font-weight: 700;
          padding: 4px 12px; border-radius: 4px;
        }
        .pp-stock {
          font-size: 12px; color: #22c55e;
          font-weight: 600; margin-top: 8px;
          display: flex; align-items: center; gap: 5px;
        }
        .pp-stock-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22c55e; display: inline-block;
        }

        /* Qty + actions */
        .pp-actions { margin-bottom: 16px; }
        .pp-qty-row {
          display: flex; gap: 12px; margin-bottom: 12px; align-items: center;
        }
        .pp-qty-label { font-size: 13px; color: #666; font-weight: 600; width: 60px; }
        .pp-qtybox {
          display: flex; align-items: center;
          border: 1.5px solid #e0f7fa; border-radius: 8px; overflow: hidden;
        }
        .pp-qtybtn {
          width: 40px; height: 44px; border: none;
          background: #f0fafb; font-size: 18px;
          cursor: pointer; color: #0097a7; font-weight: 700;
        }
        .pp-qtybtn:hover { background: #e0f7fa; }
        .pp-qtynum {
          padding: 0 20px; font-size: 15px;
          font-weight: 700; color: #111;
        }
        .pp-btn-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .pp-add-btn {
          background: linear-gradient(135deg, #0097a7, #00bcd4);
          color: #fff; border: none; border-radius: 10px;
          padding: 14px 20px; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: Inter, sans-serif;
          transition: transform .2s, opacity .2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .pp-add-btn:hover { transform: translateY(-2px); opacity: 0.92; }
        .pp-wa-btn {
          background: #25D366; color: #fff;
          border: none; border-radius: 10px;
          padding: 14px 20px; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: Inter, sans-serif;
          text-decoration: none;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity .2s;
        }
        .pp-wa-btn:hover { opacity: 0.88; }

        /* Extras */
        .pp-extras {
          display: flex; gap: 16px; padding-top: 12px;
          border-top: 1px solid #f0f0f0; margin-top: 12px;
        }
        .pp-extra-btn {
          background: none; border: none; cursor: pointer;
          font-size: 12px; color: #888; font-family: Inter, sans-serif;
          display: flex; align-items: center; gap: 5px;
          transition: color .2s;
        }
        .pp-extra-btn:hover { color: #0097a7; }

        /* Tags */
        .pp-tags {
          display: flex; gap: 6px; flex-wrap: wrap; margin-top: 16px;
        }
        .pp-tag {
          background: #f5f6fa; color: #666;
          font-size: 11px; padding: 4px 12px;
          border-radius: 20px; font-weight: 500;
        }

        /* Description + specs section */
        .pp-details {
          max-width: 1280px; margin: 0 auto;
          padding: 0 32px 32px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .pp-section {
          background: #fff; border-radius: 16px;
          padding: 28px; border: 1px solid #eee;
        }
        .pp-section-title {
          font-size: 16px; font-weight: 800; color: #111;
          margin-bottom: 16px; padding-bottom: 12px;
          border-bottom: 2px solid #e0f7fa;
          display: flex; align-items: center; gap: 8px;
        }
        .pp-desc {
          font-size: 14px; color: #555; line-height: 1.9;
        }
        .pp-specs-table {
          width: 100%; border-collapse: collapse;
        }
        .pp-specs-table tr { border-bottom: 1px solid #f5f5f5; }
        .pp-specs-table tr:last-child { border-bottom: none; }
        .pp-specs-table td {
          padding: 10px 8px; font-size: 13px; font-weight: 500;
        }
        .pp-specs-table td:first-child {
          color: #888; width: 42%; font-weight: 500;
        }
        .pp-specs-table td:last-child { color: #111; font-weight: 600; }

        /* Related products */
        .pp-related {
          max-width: 1280px; margin: 0 auto;
          padding: 0 32px 48px;
        }
        .pp-related-title {
          font-size: 22px; font-weight: 800; color: #111;
          margin-bottom: 20px;
          display: flex; align-items: center; gap: 10px;
        }
        .pp-related-title::after {
          content: '';
          flex: 1; height: 1px; background: #eee;
        }
        .pp-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .pp-rcard {
          background: #fff; border: 1.5px solid #eee;
          border-radius: 14px; padding: 16px 14px;
          display: flex; flex-direction: column;
          align-items: center; gap: 10px;
          cursor: pointer; transition: all .25s;
        }
        .pp-rcard:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,151,167,0.15);
          border-color: #0097a7;
        }
        .pp-rcard-img {
          width: 100%; height: 150px; border-radius: 10px;
          background: #f8f9fa; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .pp-rcard-img img { width: 100%; height: 100%; object-fit: cover; }
        .pp-rcard-info { width: 100%; }
        .pp-rcard-brand {
          font-size: 10px; color: #aaa;
          text-transform: uppercase; letter-spacing: 0.8px;
        }
        .pp-rcard-name {
          font-size: 13px; font-weight: 700; color: #111;
          margin: 3px 0 6px; line-height: 1.3;
        }
        .pp-rcard-price { font-size: 15px; font-weight: 800; color: #0097a7; }
        .pp-rcard-btn {
          width: 100%;
          background: linear-gradient(135deg, #0097a7, #00bcd4);
          border: none; border-radius: 8px;
          padding: 9px 0; font-size: 12px;
          font-weight: 700; color: #fff; cursor: pointer;
          font-family: Inter, sans-serif;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .pp-main { grid-template-columns: 1fr; padding: 20px; gap: 20px; }
          .pp-images { position: static; }
          .pp-details { grid-template-columns: 1fr; padding: 0 20px 24px; }
          .pp-related { padding: 0 20px 40px; }
          .pp-breadcrumb { padding: 10px 20px; }
        }
        @media (max-width: 600px) {
          .pp-title { font-size: 22px; }
          .pp-price { font-size: 26px; }
          .pp-btn-row { grid-template-columns: 1fr; }
          .pp-related-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .pp-main { padding: 16px; }
        }
      `}</style>

      <div className="pp-page">
        {/* Breadcrumb */}
        <div className="pp-breadcrumb">
          <div className="pp-breadcrumb-inner">
            <a onClick={() => navigate('/')}>Home</a>
            <span>›</span>
            <a onClick={() => navigate(`/category/${p.category.toLowerCase().replace(/ /g, '-')}`)}>
              {p.category}
            </a>
            <span>›</span>
            <span style={{ color: '#333', fontWeight: 600 }}>{p.name}</span>
          </div>
        </div>

        {/* Main product section */}
        <div className="pp-main">
          {/* Images */}
          <div className="pp-images">
            <div className="pp-main-img">
              {images.length > 0
                ? <img src={images[activeImg]} alt={p.name} />
                : <span className="pp-main-img-placeholder">{p.icon}</span>
              }
            </div>
            {images.length > 1 && (
              <div className="pp-thumbs">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`pp-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`${p.name} ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="pp-info">
            <span className="pp-category-tag">{p.category}</span>
            <div className="pp-brand">{p.brand}</div>
            <h1 className="pp-title">{p.name}</h1>
            <div className="pp-meta">
              <span className="pp-meta-item">🏷 SKU: {p.sku}</span>
            </div>

            {/* Price */}
            <div className="pp-price-box">
              <div className="pp-price-row">
                <span className="pp-price">{p.price}</span>
                {p.oldPrice && <span className="pp-oldprice">{p.oldPrice}</span>}
                {calcSave() && <span className="pp-save">Save {calcSave()}%</span>}
              </div>
              <div className="pp-stock">
                <span className="pp-stock-dot" />
                In Stock — Ready for Delivery
              </div>
            </div>

            {/* Qty */}
            <div className="pp-actions">
              <div className="pp-qty-row">
                <span className="pp-qty-label">Qty:</span>
                <div className="pp-qtybox">
                  <button className="pp-qtybtn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span className="pp-qtynum">{qty}</span>
                  <button className="pp-qtybtn" onClick={() => setQty(qty + 1)}>+</button>
                </div>
              </div>
              <div className="pp-btn-row">
                <button className="pp-add-btn" onClick={handleAdd}>
                  🛒 Add to Cart
                </button>

                <a
                  href={`https://wa.me/254759962068?text=${encodeURIComponent(
                    `Hi! I'd like to order: ${p.name} (${p.price}) × ${qty}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="pp-wa-btn"
                >
                  💚 Buy via WhatsApp
                </a>
              </div>
            </div>

            {/* Tags */}
            {p.tags && p.tags.length > 0 && (
              <div className="pp-tags">
                {p.tags.map(t => (
                  <span key={t} className="pp-tag">#{t}</span>
                ))}
              </div>
            )}

            {/* Extras */}
            <div className="pp-extras">
              <button className="pp-extra-btn">♡ Add to Wishlist</button>
              <button className="pp-extra-btn">⇄ Compare</button>
              <button
                className="pp-extra-btn"
                onClick={() => navigate(-1)}
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>

        {/* Description + Specs */}
        <div className="pp-details">
          <div className="pp-section">
            <div className="pp-section-title">📋 Description</div>
            <p className="pp-desc">{p.description}</p>
          </div>
          <div className="pp-section">
            <div className="pp-section-title">⚙️ Specifications</div>
            <table className="pp-specs-table">
              <tbody>
                {p.specs.map(spec => (
                  <tr key={spec.label}>
                    <td>{spec.label}</td>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="pp-related">
            <div className="pp-related-title">Related Products</div>
            <div className="pp-related-grid">
              {related.map(r => (
                <div
                  key={r.sku}
                  className="pp-rcard"
                  onClick={() => navigate(`/product/${r.sku}`)}
                >
                  <div className="pp-rcard-img">
                    {r.img
                      ? <img src={r.img} alt={r.name} />
                      : <span style={{ fontSize: 44 }}>{r.icon}</span>
                    }
                  </div>
                  <div className="pp-rcard-info">
                    <div className="pp-rcard-brand">{r.brand}</div>
                    <div className="pp-rcard-name">{r.name}</div>
                    <div className="pp-rcard-price">{r.price}</div>
                  </div>
                  <button
                    className="pp-rcard-btn"
                    onClick={e => { e.stopPropagation(); addToCart(r, 1); }}
                  >
                    + Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}