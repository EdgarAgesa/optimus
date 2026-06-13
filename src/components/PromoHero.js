import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAutoplayAllowed from '../hooks/useAutoplayAllowed';
import { useProducts } from '../hooks/useProducts';

export default function PromoHero({ promo }) {
  const navigate = useNavigate();
  const { products } = useProducts();
  const mode = useAutoplayAllowed();          // 'autoplay' | 'poster'
  const videoRef = useRef(null);
  const [userStarted, setUserStarted] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  const linkedProduct = products.find((p) => p.sku === promo.product_sku);
  const poster = promo.poster_url || linkedProduct?.img || null;
  const ctaLabel = promo.cta_label || 'Shop This Game';
  const caption = promo.caption || "This week's featured game";

  // Render the video element when autoplay is allowed (and not rejected), or after a tap.
  const showVideo = (mode === 'autoplay' && !autoplayFailed) || userStarted;

  // Autoplay path: preload="none" means .play() STREAMS progressively (never front-loads).
  useEffect(() => {
    if (mode !== 'autoplay' || autoplayFailed || userStarted) return;
    const el = videoRef.current;
    if (!el) return;
    const p = el.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => setAutoplayFailed(true)); // never leave a frozen frame
    }
  }, [mode, autoplayFailed, userStarted]);

  const handleManualPlay = () => {
    setUserStarted(true);
    requestAnimationFrame(() => {
      const el = videoRef.current;
      if (el) { const p = el.play(); if (p && p.catch) p.catch(() => {}); }
    });
  };

  const goToProduct = () => {
    if (promo.product_sku) navigate(`/product/${encodeURIComponent(promo.product_sku)}`);
  };

  return (
    <section className="relative overflow-hidden bg-ink-950 font-sans">
      <div aria-hidden="true" className="absolute -top-24 -right-16 w-96 h-96 bg-glow-teal" />
      <div aria-hidden="true" className="absolute -bottom-32 -left-24 w-96 h-96 bg-glow-teal opacity-60" />

      <div className="relative max-w-screen-xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="flex flex-col md:flex-row md:items-center gap-10">
          {/* Statement */}
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-2 border border-edge rounded-full px-4 py-1 text-label uppercase text-fg-mid">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              {caption}
            </span>
            <h1 className="text-display-xl text-fg-hi mt-6 max-w-2xl">{promo.title}</h1>
            <div className="flex flex-wrap gap-3 mt-8">
              <button onClick={goToProduct}
                className="bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-6 py-3 cursor-pointer min-h-11">
                {ctaLabel} →
              </button>
            </div>
          </div>

          {/* Media */}
          <div className="relative w-full md:w-[28rem] shrink-0">
            <div className="relative aspect-video bg-ink-800 border border-edge rounded-xl shadow-glow-featured overflow-hidden">
              {showVideo ? (
                <video
                  ref={videoRef}
                  src={promo.video_url}
                  poster={poster || undefined}
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
                  {poster ? (
                    <img src={poster} alt="" aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-display">🎮</div>
                  )}
                  <button
                    onClick={handleManualPlay}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-950/40 text-fg-hi cursor-pointer border-0 motion-reduce:transition-none">
                    <span className="text-display" aria-hidden="true">▶</span>
                    <span className="text-label uppercase">Watch — this week's featured game</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
