import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import PromoHero from './PromoHero';

const defaultSlides = [
  {
    id: 1, tag: 'Now in Stock', icon: '🎮', title: 'PlayStation 4 & 5',
    sub: 'Ex-UK consoles with controllers. Ready to play today.',
    price: 'From KSh 25,000', oldPrice: 'KSh 35,000', cta: 'Shop Gaming',
    slug: 'gaming', img: '/images/IMG-20260524-WA0071.jpg',
  },
  {
    id: 2, tag: 'Latest Arrivals', icon: '📱', title: 'iPhone 13 Series',
    sub: 'Premium smartphones with A15 Bionic power.',
    price: 'From KSh 45,000', oldPrice: null, cta: 'Shop Phones',
    slug: 'phones', img: '/images/IMG-20260524-WA0090.jpg',
  },
  {
    id: 3, tag: 'Audio Deals', icon: '🎧', title: 'Sony WH-1000XM5',
    sub: 'Industry-leading noise cancellation flagship headphones.',
    price: 'KSh 49,000', oldPrice: null, cta: 'Shop Audio',
    slug: 'audio', img: '/images/IMG-20260524-WA0077.jpg',
  },
];

const icons = ['🎮', '📱', '🎧'];

// Display-only price normalization (admin data untouched): ensures the KSh
// prefix and tames raw casing — "FROM 90,000KSH" -> "From KSh 90,000".
function displayPrice(raw) {
  if (!raw) return raw;
  let p = raw.trim();
  const hasFrom = /^from\s*/i.test(p);
  p = p.replace(/^from\s*/i, '').replace(/ksh\s*/gi, '').trim();
  return `${hasFrom ? 'From ' : ''}KSh ${p}`;
} // used only in the Supabase slide mapper below

export default function Hero() {
  const [active, setActive] = useState(0);
  const [promo, setPromo] = useState(null);
  const [promoChecked, setPromoChecked] = useState(false);
  const [slides, setSlides] = useState(defaultSlides);
  // D6 lazy discipline: an image mounts only once its slide index is "warmed".
  // Initially the active slide (0) and its successor (1). Slide 3 stays unfetched
  // until slide 2 is active.
  const [warmed, setWarmed] = useState(() => new Set([0, 1]));
  // Images crossfade in only after they finish loading; until then the emoji
  // placeholder shows (prevents the alt-text-over-dark-card flash on slow data).
  const [loadedImgs, setLoadedImgs] = useState(() => new Set());
  const [failedImgs, setFailedImgs] = useState(() => new Set());
  // "Headline as mobile LCP" (perf-baseline.md Phase 2 addendum): on small
  // screens the card images mount after idle, so the display-xl headline is
  // the first large paint. Desktop is unaffected.
  const [imgsReady, setImgsReady] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (imgsReady) return;
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => setImgsReady(true), { timeout: 1500 })
      : setTimeout(() => setImgsReady(true), 800);
    return () => {
      if (window.requestIdleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, [imgsReady]);

  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from('hero_slides').select('*').order('sort_order');
      if (!error && data && data.length > 0) {
        setSlides(data.map((s, i) => ({
          id: s.id,
          tag: s.tag || 'FEATURED',
          icon: icons[i % icons.length],
          title: s.title,
          sub: s.subtitle || '',
          price: s.price || '',
          oldPrice: null,
          cta: 'Shop Now',
          slug: s.category_slug || 'gaming',
          img: s.image || null,
        })));
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    const fetchPromo = async () => {
      const { data } = await supabase
        .from('promo_video')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      setPromo(data || null);
      setPromoChecked(true);
    };
    fetchPromo();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Clamp active if Supabase returns fewer slides than the current index.
  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [slides.length, active]);

  // Warm the next slide whenever the active one changes (D6).
  useEffect(() => {
    setWarmed(prev => {
      const next = new Set(prev);
      next.add(active);
      next.add((active + 1) % slides.length);
      return next;
    });
  }, [active, slides.length]);

  const activeIdx = active < slides.length ? active : 0;
  const slide = slides[activeIdx];

  // Active promo replaces the hero entirely; otherwise fall through to the carousel.
  if (promoChecked && promo) {
    return <PromoHero promo={promo} />;
  }

  return (
    <section className="relative overflow-hidden bg-ink-950 font-sans">
      {/* Atmosphere — two glow layers (anti-flat mandate) */}
      <div aria-hidden="true" className="absolute -top-24 -right-16 w-96 h-96 bg-glow-teal" />
      <div aria-hidden="true" className="absolute -bottom-32 -left-24 w-96 h-96 bg-glow-teal opacity-60" />

      <div className="relative max-w-screen-xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Counter */}
        <div className="text-label uppercase text-fg-low mb-6">
          <strong className="text-fg-hi font-medium">{String(activeIdx + 1).padStart(2, '0')}</strong> / {String(slides.length).padStart(2, '0')}
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-10">
          {/* Statement content */}
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-2 border border-edge rounded-full px-4 py-1 text-label uppercase text-fg-mid">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              {slide.tag}
            </span>

            {/* Sentence-case is display-only (admin data untouched); trade-off:
                proper nouns/model codes render lowercased after the first letter. */}
            <h1 className="text-display-xl text-fg-hi mt-6 max-w-2xl lowercase first-letter:uppercase">{slide.title}</h1>
            <p className="text-body text-fg-mid mt-4 max-w-md lowercase first-letter:uppercase">{slide.sub}</p>

            <div className="flex items-baseline gap-3 mt-6">
              <span className="text-price text-teal-500">{displayPrice(slide.price)}</span>
              {slide.oldPrice && (
                <span className="text-body text-fg-low line-through">{displayPrice(slide.oldPrice)}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <button onClick={() => navigate(`/category/${slide.slug}`)}
                className="bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-6 py-3 cursor-pointer min-h-11">
                {slide.cta} →
              </button>
              <button onClick={() => navigate('/')}
                className="bg-transparent text-fg-hi text-body border border-edge rounded-full px-6 py-3 cursor-pointer min-h-11">
                View All Deals
              </button>
            </div>
          </div>

          {/* Floating product card (small, lazy, aspect-locked — zero CLS) */}
          <div className="relative w-48 md:w-64 shrink-0 self-center md:self-end">
            <div className="relative aspect-square bg-ink-800 border border-edge rounded-xl shadow-glow-featured overflow-hidden">
              {/* Emoji placeholder shows until the active image has actually
                  loaded — no alt-text flash on slow connections. */}
              {(!slide.img || failedImgs.has(slide.id) || !loadedImgs.has(slide.id)) && (
                <div className="absolute inset-0 flex items-center justify-center text-display">{slide.icon}</div>
              )}
              {slides.map((s, i) =>
                imgsReady && warmed.has(i) && s.img && !failedImgs.has(s.id) ? (
                  <img
                    key={s.id}
                    src={s.img}
                    alt=""
                    aria-hidden="true"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    decoding="async"
                    onLoad={() => setLoadedImgs(prev => new Set(prev).add(s.id))}
                    onError={() => setFailedImgs(prev => new Set(prev).add(s.id))}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${i === activeIdx && loadedImgs.has(s.id) ? 'opacity-100' : 'opacity-0'}`}
                  />
                ) : null
              )}
            </div>
            {slide.price && (
              <div className="absolute -bottom-3 left-3 bg-ink-800 border border-edge rounded-lg px-3 py-1">
                <div className="text-micro text-fg-low uppercase">Starting at</div>
                <div className="text-body font-medium text-teal-500">{displayPrice(slide.price)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-12">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Slide ${i + 1}`}
              className={`flex items-center bg-transparent border-0 cursor-pointer p-2 min-h-11 group`}
            >
              <span className={`h-1 rounded-full transition-opacity duration-300 motion-reduce:transition-none ${i === activeIdx ? 'w-8 bg-teal-500' : 'w-4 bg-ink-700'}`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
