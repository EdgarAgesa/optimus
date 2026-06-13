import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAutoplayAllowed from '../hooks/useAutoplayAllowed';
import { useProducts } from '../hooks/useProducts';

export default function PromoHero({ promo, fadeIn = false }) {
  const navigate = useNavigate();
  const { products } = useProducts();
  const mode = useAutoplayAllowed();          // 'autoplay' | 'poster'
  const videoRef = useRef(null);
  const [userStarted, setUserStarted] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const [shown, setShown] = useState(!fadeIn);
  useEffect(() => {
    if (!fadeIn) return;
    // Two frames: guarantees the opacity-0 frame is composited before flipping
    // to opacity-100, so the transition actually runs (matters on slow devices).
    let id2;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setShown(true));
    });
    return () => { cancelAnimationFrame(id1); if (id2) cancelAnimationFrame(id2); };
  }, [fadeIn]);

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

  // Reset transient state when the promo changes so a swapped promo doesn't inherit a prior failure/tap.
  useEffect(() => {
    setAutoplayFailed(false);
    setUserStarted(false);
  }, [promo.id]);

  const handleManualPlay = () => setUserStarted(true);

  // After a manual tap, the <video> mounts; play it synchronously post-commit
  // (ref guaranteed populated — more robust than rAF under concurrent React).
  useLayoutEffect(() => {
    if (!userStarted) return;
    const el = videoRef.current;
    if (el) { const p = el.play(); if (p && p.catch) p.catch(() => {}); }
  }, [userStarted]);

  const goToProduct = () => {
    if (promo.product_sku) navigate(`/product/${encodeURIComponent(promo.product_sku)}`);
  };

  return (
    <section className={`relative overflow-hidden bg-ink-950 font-sans${fadeIn ? ` transition-opacity duration-500 motion-reduce:transition-none ${shown ? 'opacity-100' : 'opacity-0'}` : ''}`}>
      {/* Atmosphere — glow layers (brand anti-flat treatment) */}
      <div aria-hidden="true" className="absolute -top-24 -right-16 w-96 h-96 bg-glow-teal" />
      <div aria-hidden="true" className="absolute -bottom-32 -left-24 w-96 h-96 bg-glow-teal opacity-60" />

      <div className="relative max-w-screen-xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
          {/* Statement — beside the panel, on the dark section (no scrim needed for contrast).
              Mobile: text below the panel (order-2); desktop: text on the left (order-1). */}
          <div className="order-2 md:order-1 flex-1 min-w-0">
            <span className="inline-flex items-center gap-2 border border-edge rounded-full px-4 py-1 text-label uppercase text-fg-mid">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              {caption}
            </span>
            <h1 className="text-display-xl text-fg-hi mt-6">{promo.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <button type="button" onClick={goToProduct}
                className="bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-6 py-3 cursor-pointer min-h-11">
                {ctaLabel} →
              </button>
            </div>
          </div>

          {/* Featured media panel — large, contained 16:9. object-contain so the WHOLE frame
              shows (centered 16:9 gameplay is never cropped); letterboxes odd ratios instead.
              Mobile: panel on top (order-1) to lead with the promo; desktop: panel on the right. */}
          <div className="order-1 md:order-2 w-full md:w-7/12 shrink-0">
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
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <>
                  {poster ? (
                    <img src={poster} alt="" aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-contain" />
                  ) : (
                    <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-display">🎮</div>
                  )}
                  <button
                    type="button"
                    onClick={handleManualPlay}
                    aria-label={`Watch the featured video for ${promo.title}`}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-950/40 text-fg-hi cursor-pointer border-0">
                    <span className="text-display" aria-hidden="true">▶</span>
                    <span className="text-label uppercase">Watch the featured video</span>
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
