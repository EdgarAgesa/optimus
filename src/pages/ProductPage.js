import { Helmet } from 'react-helmet';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { ChatIcon, ShareIcon, DocIcon, GearIcon, CartIcon, SearchIcon } from '../components/icons';

function renderDescription(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-3" />;

    if (trimmed.endsWith(':')) {
      return (
        <div key={i} className={`text-card-title text-fg-hi ${i === 0 ? '' : 'mt-4'}`}>
          {trimmed}
        </div>
      );
    }

    if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      return (
        <div key={i} className="flex gap-2 text-body text-fg-mid mt-1">
          <span className="text-teal-500">•</span>
          <span>{trimmed.replace(/^[-•]\s*/, '')}</span>
        </div>
      );
    }

    return (
      <p key={i} className="text-body text-fg-mid mt-2">
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

  const zoomTriggerRef = useRef(null);

  const product = products.find(p => p.sku === sku);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImg(0);
    setQty(1);
    setImgZoomed(false);
  }, [sku]);

  // Keyboard law: Escape closes the zoom overlay; focus returns to the trigger.
  useEffect(() => {
    if (!imgZoomed) return;
    const onKey = (e) => { if (e.key === 'Escape') setImgZoomed(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      zoomTriggerRef.current?.focus();
    };
  }, [imgZoomed]);

  if (!product) {
    return (
      <div className="bg-ink-900 min-h-screen flex flex-col items-center justify-center font-sans py-24">
        <SearchIcon className="w-12 h-12 text-fg-low" />
        <p className="text-card-title text-fg-hi mt-4">Product not found</p>
        <button onClick={() => navigate('/')}
          className="mt-6 bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-6 py-3 cursor-pointer min-h-11">
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
        <div className="fixed inset-0 bg-ink-950/90 z-50 flex items-center justify-center" onClick={() => setImgZoomed(false)}>
          <button onClick={() => setImgZoomed(false)} aria-label="Close zoom"
            className="absolute top-4 right-4 bg-transparent border-0 cursor-pointer text-fg-hi text-heading min-w-11 min-h-11">✕</button>
          {allImages.length > 1 && (
            <button aria-label="Previous image"
              className="absolute left-2 bg-ink-800 border border-edge rounded-full text-fg-hi text-card-title cursor-pointer min-w-11 min-h-11"
              onClick={e => { e.stopPropagation(); setActiveImg(prev => (prev - 1 + allImages.length) % allImages.length); }}>
              ‹
            </button>
          )}
          <img src={allImages[activeImg]} alt={p.name} onClick={e => e.stopPropagation()}
            className="max-w-full max-h-full object-contain" />
          {allImages.length > 1 && (
            <button aria-label="Next image"
              className="absolute right-2 bg-ink-800 border border-edge rounded-full text-fg-hi text-card-title cursor-pointer min-w-11 min-h-11"
              onClick={e => { e.stopPropagation(); setActiveImg(prev => (prev + 1) % allImages.length); }}>
              ›
            </button>
          )}
        </div>
      )}

      <div className="bg-ink-900 min-h-screen font-sans">
        {/* Breadcrumb */}
        <div className="bg-ink-950 border-b border-edge">
          <div className="flex items-center gap-2 max-w-screen-xl mx-auto px-4 py-4 text-body text-fg-low overflow-hidden whitespace-nowrap">
            <span onClick={() => navigate('/')} className="cursor-pointer hover:text-fg-hi">Home</span>
            <span>›</span>
            <span onClick={() => navigate(`/category/${p.category.toLowerCase().replace(/ /g, '-')}`)}
              className="cursor-pointer hover:text-fg-hi">{p.category}</span>
            <span>›</span>
            <span className="text-fg-mid truncate">{p.name}</span>
          </div>
        </div>

        {/* Main */}
        <div className="max-w-screen-xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <button ref={zoomTriggerRef} onClick={() => allImages.length > 0 && setImgZoomed(true)} aria-label="Zoom image"
              className="relative block w-full aspect-square bg-ink-800 border border-edge rounded-xl overflow-hidden cursor-zoom-in p-0">
              {allImages.length > 0 ? (
                <img src={allImages[activeImg]} alt={p.name} fetchPriority="high" decoding="async"
                  className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-display">{p.icon}</div>
              )}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-ink-950/80 text-fg-hi text-micro rounded-full px-2 py-1">
                  {activeImg + 1} / {allImages.length}
                </div>
              )}
            </button>
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} aria-label={`Image ${i + 1}`}
                    className={`relative w-16 h-16 shrink-0 bg-ink-800 rounded-lg overflow-hidden cursor-pointer border ${activeImg === i ? 'border-teal-500' : 'border-edge'}`}>
                    <img src={img} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="inline-block border border-edge rounded-full px-3 py-1 text-label uppercase text-fg-mid">{p.category}</span>
            <div className="text-label uppercase text-fg-low mt-3">{p.brand}</div>
            <h1 className="text-display text-fg-hi mt-1">{p.name}</h1>
            <div className="text-micro text-fg-low mt-1">SKU: {p.sku}</div>

            <div className="bg-ink-800 border border-edge rounded-xl p-4 mt-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-heading text-teal-500">{p.price}</span>
                {p.oldPrice && <span className="text-body text-fg-low line-through">{p.oldPrice}</span>}
                {calcSave() && (
                  <span className="bg-accent text-white text-micro font-medium rounded-full px-2 py-1">Save {calcSave()}%</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-body text-fg-mid mt-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                In Stock — Ready for Delivery
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5">
              <span className="text-body text-fg-mid">Qty:</span>
              <div className="flex items-center border border-edge rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity"
                  className="bg-transparent border-0 cursor-pointer text-fg-hi text-body min-w-11 min-h-11">−</button>
                <span className="text-body text-fg-hi px-1">{qty}</span>
                <button onClick={() => setQty(qty + 1)} aria-label="Increase quantity"
                  className="bg-transparent border-0 cursor-pointer text-fg-hi text-body min-w-11 min-h-11">+</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button onClick={() => addToCart(p, qty)}
                className="flex flex-1 items-center justify-center gap-2 bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-6 py-3 cursor-pointer min-h-11">
                <CartIcon className="w-5 h-5" /> Add to Cart
              </button>
              <a href={`https://wa.me/254759962068?text=${encodeURIComponent(
                  `Hi! I would like to order:\n${p.name}\nPrice: ${p.price}\nQty: ${qty}`
                )}`} target="_blank" rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 bg-whatsapp text-ink-950 text-body font-medium rounded-full px-6 py-3 min-h-11">
                <ChatIcon className="w-5 h-5" /> Buy via WhatsApp
              </a>
            </div>

            {p.tags && p.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {p.tags.map(t => (
                  <span key={t} className="border border-edge rounded-full px-3 py-1 text-micro text-fg-low">#{t}</span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={() => navigate(-1)}
                className="bg-transparent text-fg-mid text-body border border-edge rounded-full px-4 py-2 cursor-pointer min-h-11">
                ← Go Back
              </button>
              <a href={`https://wa.me/254759962068?text=${encodeURIComponent(
                  `Hi! I have a question about ${p.name} (${p.sku})`
                )}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-transparent text-fg-mid text-body border border-edge rounded-full px-4 py-2 min-h-11">
                <ChatIcon className="w-4 h-4" /> Ask a Question
              </a>
              <button
                className="flex items-center gap-2 bg-transparent text-fg-mid text-body border border-edge rounded-full px-4 py-2 cursor-pointer min-h-11"
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
                }}>
                <ShareIcon className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Description + Specs */}
        <div className="max-w-screen-xl mx-auto px-4 pb-8 grid md:grid-cols-2 gap-6">
          <div className="bg-ink-800 border border-edge rounded-xl p-6">
            <div className="flex items-center gap-2 text-card-title text-fg-hi mb-4">
              <DocIcon className="w-5 h-5 text-teal-500" /> Description
            </div>
            {p.description ? (
              <div>{renderDescription(p.description)}</div>
            ) : (
              <p className="text-body text-fg-low">No description available.</p>
            )}
          </div>
          <div className="bg-ink-800 border border-edge rounded-xl p-6">
            <div className="flex items-center gap-2 text-card-title text-fg-hi mb-4">
              <GearIcon className="w-5 h-5 text-teal-500" /> Specifications
            </div>
            {p.specs && p.specs.length > 0 ? (
              <table className="w-full text-body">
                <tbody>
                  {p.specs.map((spec, i) => (
                    <tr key={i} className="border-b border-edge last:border-0">
                      <td className="py-2 pr-4 text-fg-low align-top">{spec.label}</td>
                      <td className="py-2 text-fg-hi">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-body text-fg-low">No specifications listed.</p>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="max-w-screen-xl mx-auto px-4 pb-12">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div className="text-heading text-fg-hi">You may also like</div>
              <button onClick={() => navigate(`/category/${p.category.toLowerCase().replace(/ /g, '-')}`)}
                className="bg-transparent text-fg-hi text-body border border-edge rounded-full px-5 py-2 cursor-pointer min-h-11 shrink-0">
                View all
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {related.map(r => (
                <ProductCard
                  key={r.sku}
                  product={r}
                  onOpen={() => navigate(`/product/${encodeURIComponent(r.sku)}`)}
                  onAddToCart={(prod) => addToCart(prod, 1)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
