import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

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

export default function Hero() {
  const [active, setActive] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);
  // D6 lazy discipline: an image mounts only once its slide index is "warmed".
  // Initially the active slide (0) and its successor (1). Slide 3 stays unfetched
  // until slide 2 is active.
  const [warmed, setWarmed] = useState(() => new Set([0, 1]));
  const navigate = useNavigate();

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
        setWarmed(new Set([0, 1]));
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Warm the next slide whenever the active one changes (D6).
  useEffect(() => {
    setWarmed(prev => {
      const next = new Set(prev);
      next.add(active);
      next.add((active + 1) % slides.length);
      return next;
    });
  }, [active, slides.length]);

  const slide = slides[active];

  return (
    <section className="hero-section relative overflow-hidden bg-ink-950 font-sans">
      {/* Atmosphere — two glow layers (anti-flat mandate) */}
      <div aria-hidden="true" className="absolute -top-24 -right-16 w-96 h-96 bg-glow-teal" />
      <div aria-hidden="true" className="absolute -bottom-32 -left-24 w-96 h-96 bg-glow-teal opacity-60" />

      <div className="relative max-w-screen-xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Counter */}
        <div className="text-label uppercase text-fg-low mb-6">
          <strong className="text-fg-hi font-medium">0{active + 1}</strong> / 0{slides.length}
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-10">
          {/* Statement content */}
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-2 border border-edge rounded-full px-4 py-1 text-label uppercase text-fg-mid">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              {slide.tag}
            </span>

            <h1 className="text-display-xl text-fg-hi mt-6 max-w-2xl">{slide.title}</h1>
            <p className="text-body text-fg-mid mt-4 max-w-md">{slide.sub}</p>

            <div className="flex items-baseline gap-3 mt-6">
              <span className="text-price text-teal-500">{slide.price}</span>
              {slide.oldPrice && (
                <span className="text-body text-fg-low line-through">{slide.oldPrice}</span>
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
              {slides.map((s, i) =>
                warmed.has(i) && s.img ? (
                  <img
                    key={s.id}
                    src={s.img}
                    alt={s.title}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-0'}`}
                  />
                ) : null
              )}
              {!slide.img && (
                <div className="absolute inset-0 flex items-center justify-center text-display">{slide.icon}</div>
              )}
            </div>
            {slide.price && (
              <div className="absolute -bottom-3 left-3 bg-ink-800 border border-edge rounded-lg px-3 py-1">
                <div className="text-micro text-fg-low uppercase">Starting at</div>
                <div className="text-body font-medium text-teal-500">{slide.price}</div>
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
              className={`h-1 rounded-full border-0 cursor-pointer transition-opacity duration-300 ${i === active ? 'w-8 bg-teal-500' : 'w-4 bg-ink-700'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
