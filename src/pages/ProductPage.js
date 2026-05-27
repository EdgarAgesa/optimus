import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';

export default function ProductPage() {
  const { sku } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [imgZoomed, setImgZoomed] = useState(false);

  const product = products.find(p => p.sku === sku);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImg(0);
    setQty(1);
    setImgZoomed(false);
  }, [sku]);

  if (!product) {
    return (
      <div style={{
        textAlign: 'center', padding: 80,
        fontFamily: 'Inter, sans-serif',
      }}>
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
          Back to Home
        </button>
      </div>
    );
  }

  const p = product;

  const allImages = p.images && p.images.length > 0
    ? p.images
    : p.img ? [p.img] : [];

  const related = products
    .filter(r => r.category === p.category && r.sku !== p.sku)
    .slice(0, 6);

  const calcSave = () => {
    if (!p.oldPrice) return null;
    const current = parseInt(p.price.replace(/\D/g, ''));
    const old = parseInt(p.oldPrice.replace(/\D/g, ''));
    return Math.round((1 - current / old) * 100);
  };

  return (
    <>
      <style>{`
        .pp-page {
          background: #f5f6fa;
          min-height: 100vh;
          font-family: Inter, sans-serif;
        }
        .pp-breadcrumb {
          background: #fff;
          border-bottom: 1px solid #eee;
          padding: 12px 32px;
        }
        .pp-breadcrumb-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center;
          gap: 8px; font-size: 12px;
          color: #999; flex-wrap: wrap;
        }
        .pp-bc-link {
          color: #0097a7; font-weight: 600;
          cursor: pointer;
        }
        .pp-bc-link:hover { text-decoration: underline; }
        .pp-main {
          max-width: 1280px; margin: 0 auto;
          padding: 28px 32px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }
        .pp-images { position: sticky; top: 20px; }
        .pp-main-img-wrap {
          width: 100%; aspect-ratio: 1;
          border-radius: 16px; overflow: hidden;
          background: #fff; border: 1px solid #eee;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          cursor: zoom-in; position: relative;
        }
        .pp-main-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .3s ease;
        }
        .pp-main-img-wrap:hover img { transform: scale(1.04); }
        .pp-no-img {
          width: 100%; height: 100%;
          display: flex; align-items: center;
          justify-content: center; font-size: 120px; opacity: 0.3;
        }
        .pp-img-count {
          position: absolute; bottom: 12px; right: 12px;
          background: rgba(0,0,0,0.5); color: #fff;
          font-size: 11px; font-weight: 700;
          padding: 4px 10px; border-radius: 20px;
        }
        .pp-thumbs { display: flex; gap: 10px; flex-wrap: wrap; }
        .pp-thumb {
          width: 72px; height: 72px;
          border-radius: 10px; border: 2px solid #eee;
          overflow: hidden; cursor: pointer;
          transition: border-color .2s, transform .15s;
          background: #fff; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .pp-thumb:hover { transform: scale(1.05); }
        .pp-thumb.active { border-color: #0097a7; }
        .pp-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .pp-zoom-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.92);
          z-index: 99999;
          display: flex; align-items: center;
          justify-content: center; padding: 20px;
          cursor: zoom-out;
        }
        .pp-zoom-img {
          max-width: 90vw; max-height: 90vh;
          object-fit: contain; border-radius: 12px;
        }
        .pp-zoom-close {
          position: fixed; top: 20px; right: 20px;
          background: rgba(255,255,255,0.15); border: none;
          color: #fff; width: 44px; height: 44px;
          border-radius: 50%; font-size: 18px;
          cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          z-index: 100000; font-weight: 700;
        }
        .pp-zoom-prev, .pp-zoom-next {
          position: fixed; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.15); border: none;
          color: #fff; width: 48px; height: 48px;
          border-radius: 50%; font-size: 22px;
          cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          z-index: 100000; transition: background .2s;
          font-weight: 700;
        }
        .pp-zoom-prev:hover,
        .pp-zoom-next:hover { background: rgba(255,255,255,0.3); }
        .pp-zoom-prev { left: 16px; }
        .pp-zoom-next { right: 16px; }
        .pp-info {
          background: #fff; border-radius: 16px;
          padding: 28px; border: 1px solid #eee;
        }
        .pp-cat-tag {
          display: inline-block;
          background: #e0f7fa; color: #0097a7;
          font-size: 11px; font-weight: 700;
          padding: 4px 12px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 10px;
        }
        .pp-brand { font-size: 13px; color: #999; margin-bottom: 6px; font-weight: 600; }
        .pp-title {
          font-size: 26px; font-weight: 900; color: #111;
          line-height: 1.2; margin-bottom: 8px; letter-spacing: -0.5px;
        }
        .pp-sku { font-size: 11px; color: #bbb; margin-bottom: 16px; }
        .pp-price-box {
          background: #f8fffe; border: 1px solid #e0f7fa;
          border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;
        }
        .pp-price-row {
          display: flex; align-items: baseline;
          gap: 12px; flex-wrap: wrap;
        }
        .pp-price { font-size: 30px; font-weight: 900; color: #0097a7; }
        .pp-oldprice { font-size: 16px; color: #bbb; text-decoration: line-through; }
        .pp-save {
          background: #fff0f0; color: #e63946;
          font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 4px;
        }
        .pp-stock {
          font-size: 12px; color: #22c55e; font-weight: 600;
          margin-top: 8px; display: flex; align-items: center; gap: 5px;
        }
        .pp-stock-dot {
          width: 7px; height: 7px;
          border-radius: 50%; background: #22c55e;
        }
        .pp-qty-row {
          display: flex; gap: 12px;
          margin-bottom: 14px; align-items: center;
        }
        .pp-qty-label { font-size: 13px; color: #666; font-weight: 600; }
        .pp-qtybox {
          display: flex; align-items: center;
          border: 1.5px solid #e0f7fa;
          border-radius: 8px; overflow: hidden;
        }
        .pp-qtybtn {
          width: 40px; height: 44px; border: none;
          background: #f0fafb; font-size: 18px;
          cursor: pointer; color: #0097a7; font-weight: 700;
        }
        .pp-qtybtn:hover { background: #e0f7fa; }
        .pp-qtynum { padding: 0 20px; font-size: 15px; font-weight: 700; color: #111; }
        .pp-btn-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-bottom: 16px;
        }
        .pp-add-btn {
          background: linear-gradient(135deg, #0097a7, #00bcd4);
          color: #fff; border: none; border-radius: 10px;
          padding: 14px; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: Inter, sans-serif;
          transition: transform .2s, opacity .2s;
          display: flex; align-items: center;
          justify-content: center; gap: 8px;
        }
        .pp-add-btn:hover { transform: translateY(-2px); opacity: 0.92; }
        .pp-wa-btn {
          background: #25D366; color: #fff;
          border: none; border-radius: 10px;
          padding: 14px; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: Inter, sans-serif;
          text-decoration: none;
          display: flex; align-items: center;
          justify-content: center; gap: 8px;
          transition: opacity .2s;
        }
        .pp-wa-btn:hover { opacity: 0.88; }
        .pp-extras {
          display: flex; gap: 16px;
          padding-top: 14px; border-top: 1px solid #f0f0f0;
          flex-wrap: wrap;
        }
        .pp-extra-btn {
          background: none; border: none; cursor: pointer;
          font-size: 12px; color: #888;
          font-family: Inter, sans-serif;
          display: flex; align-items: center;
          gap: 5px; transition: color .2s; padding: 0;
        }
        .pp-extra-btn:hover { color: #0097a7; }
        .pp-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 14px; }
        .pp-tag {
          background: #f5f6fa; color: #666;
          font-size: 11px; padding: 4px 12px;
          border-radius: 20px; font-weight: 500;
        }
        .pp-details {
          max-width: 1280px; margin: 0 auto;
          padding: 0 32px 32px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .pp-section {
          background: #fff; border-radius: 16px;
          padding: 24px; border: 1px solid #eee;
        }
        .pp-section-title {
          font-size: 15px; font-weight: 800; color: #111;
          margin-bottom: 16px; padding-bottom: 12px;
          border-bottom: 2px solid #e0f7fa;
        }
        .pp-desc { font-size: 14px; color: #555; line-height: 1.9; }
        .pp-specs-table { width: 100%; border-collapse: collapse; }
        .pp-specs-table tr { border-bottom: 1px solid #f5f5f5; }
        .pp-specs-table tr:last-child { border-bottom: none; }
        .pp-specs-table td { padding: 10px 8px; font-size: 13px; }
        .pp-specs-table td:first-child { color: #888; width: 42%; }
        .pp-specs-table td:last-child { color: #111; font-weight: 600; }
        .pp-no-data { font-size: 13px; color: #aaa; }
        .pp-related {
          max-width: 1280px; margin: 0 auto;
          padding: 0 32px 48px;
        }
        .pp-related-header {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 20px;
        }
        .pp-related-title { font-size: 20px; font-weight: 800; color: #111; }
        .pp-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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
          width: 100%; height: 140px; border-radius: 10px;
          background: #f8f9fa; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .pp-rcard-img img { width: 100%; height: 100%; object-fit: cover; }
        .pp-rcard-info { width: 100%; }
        .pp-rcard-brand {
          font-size: 9px; color: #aaa;
          text-transform: uppercase; letter-spacing: 0.8px;
        }
        .pp-rcard-name {
          font-size: 12px; font-weight: 700; color: #111;
          margin: 3px 0 6px; line-height: 1.3;
        }
        .pp-rcard-price { font-size: 14px; font-weight: 800; color: #0097a7; }
        .pp-rcard-btn {
          width: 100%;
          background: linear-gradient(135deg, #0097a7, #00bcd4);
          border: none; border-radius: 8px;
          padding: 9px 0; font-size: 12px;
          font-weight: 700; color: #fff; cursor: pointer;
          font-family: Inter, sans-serif; transition: opacity .2s;
        }
        .pp-rcard-btn:hover { opacity: 0.88; }

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
          .pp-thumb { width: 60px; height: 60px; }
          .pp-main { padding: 14px; }
          .pp-zoom-prev { left: 8px; }
          .pp-zoom-next { right: 8px; }
        }
      `}</style>

      {/* Zoom overlay */}
      {imgZoomed && allImages.length > 0 && (
        <div className="pp-zoom-overlay" onClick={() => setImgZoomed(false)}>
          <button className="pp-zoom-close" onClick={() => setImgZoomed(false)}>
            ✕
          </button>
          {allImages.length > 1 && (
            <button
              className="pp-zoom-prev"
              onClick={e => {
                e.stopPropagation();
                setActiveImg(prev => (prev - 1 + allImages.length) % allImages.length);
              }}
            >
              {'<'}
            </button>
          )}
          <img
            src={allImages[activeImg]}
            alt={p.name}
            className="pp-zoom-img"
            onClick={e => e.stopPropagation()}
          />
          {allImages.length > 1 && (
            <button
              className="pp-zoom-next"
              onClick={e => {
                e.stopPropagation();
                setActiveImg(prev => (prev + 1) % allImages.length);
              }}
            >
              {'>'}
            </button>
          )}
        </div>
      )}

      <div className="pp-page">
        {/* Breadcrumb */}
        <div className="pp-breadcrumb">
          <div className="pp-breadcrumb-inner">
            <span className="pp-bc-link" onClick={() => navigate('/')}>Home</span>
            <span>›</span>
            <span
              className="pp-bc-link"
              onClick={() => navigate(`/category/${p.category.toLowerCase().replace(/ /g, '-')}`)}
            >
              {p.category}
            </span>
            <span>›</span>
            <span style={{ color: '#333', fontWeight: 600 }}>{p.name}</span>
          </div>
        </div>

        {/* Main */}
        <div className="pp-main">
          {/* Images */}
          <div className="pp-images">
            <div
              className="pp-main-img-wrap"
              onClick={() => allImages.length > 0 && setImgZoomed(true)}
            >
              {allImages.length > 0 ? (
                <img src={allImages[activeImg]} alt={p.name} />
              ) : (
                <div className="pp-no-img">{p.icon}</div>
              )}
              {allImages.length > 1 && (
                <div className="pp-img-count">
                  {activeImg + 1} / {allImages.length}
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="pp-thumbs">
                {allImages.map((img, i) => (
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

          {/* Info */}
          <div className="pp-info">
            <span className="pp-cat-tag">{p.category}</span>
            <div className="pp-brand">{p.brand}</div>
            <h1 className="pp-title">{p.name}</h1>
            <div className="pp-sku">SKU: {p.sku}</div>

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

            <div className="pp-qty-row">
              <span className="pp-qty-label">Qty:</span>
              <div className="pp-qtybox">
                <button className="pp-qtybtn" onClick={() => setQty(Math.max(1, qty - 1))}>
                  −
                </button>
                <span className="pp-qtynum">{qty}</span>
                <button className="pp-qtybtn" onClick={() => setQty(qty + 1)}>
                  +
                </button>
              </div>
            </div>

            <div className="pp-btn-row">
              <button
                className="pp-add-btn"
                onClick={() => addToCart(p, qty)}
              >
                🛒 Add to Cart
              </button>

              <a
                href={`https://wa.me/254759962068?text=${encodeURIComponent(
                  `Hi! I would like to order:\n${p.name}\nPrice: ${p.price}\nQty: ${qty}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="pp-wa-btn"
              >
                💚 Buy via WhatsApp
              </a>
            </div>

            {p.tags && p.tags.length > 0 && (
              <div className="pp-tags">
                {p.tags.map(t => (
                  <span key={t} className="pp-tag">#{t}</span>
                ))}
              </div>
            )}

            <div className="pp-extras">
              <button className="pp-extra-btn">♡ Wishlist</button>
              <button className="pp-extra-btn">⇄ Compare</button>
              <button className="pp-extra-btn" onClick={() => navigate(-1)}>
                ← Go Back
              </button>
            </div>
          </div>
        </div>

        {/* Description + Specs */}
        <div className="pp-details">
          <div className="pp-section">
            <div className="pp-section-title">📋 Description</div>
            {p.description ? (
              <p className="pp-desc">{p.description}</p>
            ) : (
              <p className="pp-no-data">No description available.</p>
            )}
          </div>
          <div className="pp-section">
            <div className="pp-section-title">⚙️ Specifications</div>
            {p.specs && p.specs.length > 0 ? (
              <table className="pp-specs-table">
                <tbody>
                  {p.specs.map((spec, i) => (
                    <tr key={i}>
                      <td>{spec.label}</td>
                      <td>{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="pp-no-data">No specifications listed.</p>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="pp-related">
            <div className="pp-related-header">
              <div className="pp-related-title">You may also like</div>
              <button
                onClick={() => navigate(
                  `/category/${p.category.toLowerCase().replace(/ /g, '-')}`
                )}
                style={{
                  background: 'none', border: '1.5px solid #0097a7',
                  color: '#0097a7', borderRadius: 8, padding: '8px 16px',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                View all
              </button>
            </div>
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