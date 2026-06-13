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
      {/* Full-bleed media — video on capable connections, still poster otherwise. Edge to edge, cover. */}
      <div className="absolute inset-0 bg-ink-800">
        {showVideo ? (
          <video
            ref={videoRef}
            src={promo.video_url}
            poster={poster || undefined}
            muted
            loop
            playsInline
            preload="none"
            className="w-full h-full object-cover"
          />
        ) : poster ? (
          <img src={poster} alt="" aria-hidden="true" className="w-full h-full object-cover" />
        ) : (
          <div aria-hidden="true" className="w-full h-full flex items-center justify-center text-display">🎮</div>
        )}
      </div>

      {/* Content overlay — left-aligned, vertically centered. Same single <h1>, type scale, teal pill. */}
      <div className="relative max-w-screen-xl mx-auto px-4 flex items-center min-h-[28rem] md:min-h-[34rem] py-16 md:py-24">
        <div className="relative isolate max-w-xl">
          {/* Local contrast scrim — a soft feathered backing sized to the text only (not a
              full-width band), so the media shows through around it. Contrast comes from this
              local backing, so it holds over bright AND dark uploads. */}
          <div aria-hidden="true" className="absolute -inset-x-10 -inset-y-8 -z-10 bg-scrim-text" />
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
            {!showVideo && (
              <button
                type="button"
                onClick={handleManualPlay}
                aria-label={`Watch the featured video for ${promo.title}`}
                className="inline-flex items-center gap-2 bg-ink-900/80 active:bg-ink-700 text-fg-hi text-body border border-edge rounded-full px-6 py-3 cursor-pointer min-h-11">
                <span aria-hidden="true">▶</span>
                <span className="text-label uppercase">Watch the featured video</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
