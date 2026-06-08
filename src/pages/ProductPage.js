import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import '../styles/ProductPage.css';

function renderDescription(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="pp-desc-spacer" />;

    if (trimmed.endsWith(':')) {
      return (
        <div key={i} className="pp-desc-heading" style={{ marginTop: i === 0 ? 0 : 14 }}>
          {trimmed}
        </div>
      );
    }

    if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      return (
        <div key={i} className="pp-desc-bullet">
          <span className="pp-desc-dot">•</span>
          <span className="pp-desc-bullet-text">
            {trimmed.replace(/^[-•]\s*/, '')}
          </span>
        </div>
      );
    }

    return (
      <p key={i} className="pp-desc-p">
        {trimmed}
      </p>
    );
  });
}

export default function ProductPage() {
  const { sku: rawSku } = useParams();
  const sku = decodeURIComponent(rawSku || '');  const navigate = useNavigate();
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
      <div className="pp-notfound">
        <div className="pp-notfound-icon">🔍</div>
        <p className="pp-notfound-text">Product not found</p>
        <button onClick={() => navigate('/')} className="pp-notfound-btn">
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
      <Helmet>
        <title>{p.name} — {p.price} — Optimus Sphere Tech</title>
        <meta name="description" content={p.description ? p.description.substring(0, 160) : `${p.name} by ${p.brand}. ${p.price}. Available at Optimus Sphere Tech Nairobi.`} />
        <meta property="og:title" content={`${p.name} — ${p.price}`} />
        <meta property="og:description" content={`${p.brand} · ${p.category} · ${p.price}`} />
        {p.images?.[0] && <meta property="og:image" content={p.images[0]} />}
      </Helmet>

      {/* Zoom overlay */}
      {imgZoomed && allImages.length > 0 && (
        <div className="pp-zoom-overlay" onClick={() => setImgZoomed(false)}>
          <button className="pp-zoom-close" onClick={() => setImgZoomed(false)}>✕</button>
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
            <span className="pp-bc-current">{p.name}</span>
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
                <button className="pp-qtybtn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span className="pp-qtynum">{qty}</span>
                <button className="pp-qtybtn" onClick={() => setQty(qty + 1)}>+</button>
              </div>
            </div>

            <div className="pp-btn-row">
              <button className="pp-add-btn" onClick={() => addToCart(p, qty)}>
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
                {p.tags.map(t => <span key={t} className="pp-tag">#{t}</span>)}
              </div>
            )}

            <div className="pp-extras">
              <button className="pp-extra-btn" onClick={() => navigate(-1)}>
                ← Go Back
              </button>   
              <a
                href={`https://wa.me/254759962068?text=${encodeURIComponent(
                  `Hi! I have a question about ${p.name} (${p.sku})`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="pp-extra-btn"
              >
                💬 Ask a Question
              </a>
              <button
                className="pp-extra-btn"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: p.name,
                      text: `${p.name} — ${p.price}`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
              >
                🔗 Share
              </button>
                </div>
              </div>
            </div>

        {/* Description + Specs */}
        <div className="pp-details">
          <div className="pp-section">
            <div className="pp-section-title">📋 Description</div>
            {p.description ? (
              <div className="pp-desc">
                {renderDescription(p.description)}
              </div>
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

        {/* Related */}
        {related.length > 0 && (
          <div className="pp-related">
            <div className="pp-related-header">
              <div className="pp-related-title">You may also like</div>
              <button
                onClick={() => navigate(`/category/${p.category.toLowerCase().replace(/ /g, '-')}`)}
                className="pp-related-viewall"
              >
                View all
              </button>
            </div>
            <div className="pp-related-grid">
              {related.map(r => (
                <div
                  key={r.sku}
                  className="pp-rcard"
                  onClick={() => navigate(`/product/${encodeURIComponent(r.sku)}`)}
                >
                  <div className="pp-rcard-img">
                    {r.img
                      ? <img src={r.img} alt={r.name} />
                      : <span className="pp-rcard-emoji">{r.icon}</span>
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