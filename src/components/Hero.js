import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import '../styles/Hero.css';

const defaultSlides = [
  {
    id: 1,
    bg: 'linear-gradient(135deg, #0d1b2a 0%, #0d2b33 50%, #00838f 100%)',
    tag: 'Now in Stock',
    icon: '🎮',
    title: 'PlayStation 4 & 5',
    sub: 'Ex-UK consoles with controllers. Ready to play today.',
    price: 'From KSh 25,000',
    oldPrice: 'KSh 35,000',
    cta: 'Shop Gaming',
    slug: 'gaming',
    img: '/images/IMG-20260524-WA0071.jpg',
    accent: '#0097a7',
    features: ['Ex-UK Quality', '1 Year Warranty', 'Free Delivery'],
  },
  {
    id: 2,
    bg: 'linear-gradient(135deg, #1a0533 0%, #0d2b33 50%, #00838f 100%)',
    tag: 'Latest Arrivals',
    icon: '📱',
    title: 'iPhone 13 Series',
    sub: 'Premium smartphones with A15 Bionic power.',
    price: 'From KSh 45,000',
    oldPrice: null,
    cta: 'Shop Phones',
    slug: 'phones',
    img: '/images/IMG-20260524-WA0090.jpg',
    accent: '#00bcd4',
    features: ['Original Apple', 'Sealed Box', '128GB Storage'],
  },
  {
    id: 3,
    bg: 'linear-gradient(135deg, #0a1628 0%, #0d2b33 50%, #006064 100%)',
    tag: 'Audio Deals',
    icon: '🎧',
    title: 'Sony WH-1000XM5',
    sub: 'Industry-leading noise cancellation flagship headphones.',
    price: 'KSh 49,000',
    oldPrice: null,
    cta: 'Shop Audio',
    slug: 'audio',
    img: '/images/IMG-20260524-WA0077.jpg',
    accent: '#26c6da',
    features: ['Active ANC', '30hr Battery', 'Hi-Res Audio'],
  },
];

// Fixed accent colors for Supabase slides
const accentColors = ['#0097a7', '#00bcd4', '#26c6da'];
const bgGradients = [
  'linear-gradient(135deg, #0d1b2a 0%, #0d2b33 50%, #00838f 100%)',
  'linear-gradient(135deg, #1a0533 0%, #0d2b33 50%, #00838f 100%)',
  'linear-gradient(135deg, #0a1628 0%, #0d2b33 50%, #006064 100%)',
];
const icons = ['🎮', '📱', '🎧'];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);
  const navigate = useNavigate();

  // Fetch slides from Supabase
  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('sort_order');

      if (!error && data && data.length > 0) {
        const mapped = data.map((s, i) => ({
          id: s.id,
          bg: bgGradients[i % bgGradients.length],
          tag: s.tag || 'FEATURED',
          icon: icons[i % icons.length],
          title: s.title,
          sub: s.subtitle || '',
          price: s.price || '',
          oldPrice: null,
          cta: `Shop Now`,
          slug: s.category_slug || 'gaming',
          img: s.image || null,
          accent: accentColors[i % accentColors.length],
          features: s.features || [],
        }));
        setSlides(mapped);
      }
    };
    fetchSlides();
  }, []);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[active];

  return (
    <>
      <section className="hero-section" style={{ background: slide.bg }}>
        <div className="hero-counter">
          <strong>0{active + 1}</strong> / 0{slides.length}
        </div>

        {/* Left content */}
        <div className="hero-content">
          <span className="hero-tag" style={{ background: `${slide.accent}25` }}>
            <span className="hero-tag-dot" style={{ background: slide.accent }} />
            {slide.tag}
          </span>

          <h1 className="hero-h1">{slide.title}</h1>
          <p className="hero-sub">{slide.sub}</p>

          <div className="hero-features">
            {(slide.features || []).map((f, i) => (
              <div key={i} className="hero-feature">
                <span className="hero-check">✓</span>
                {f}
              </div>
            ))}
          </div>

          <div className="hero-price-row">
            <span className="hero-price" style={{ color: slide.accent }}>
              {slide.price}
            </span>
            {slide.oldPrice && (
              <span className="hero-oldprice">{slide.oldPrice}</span>
            )}
          </div>

          <div className="hero-btns">
            <button
              className="hero-cta"
              style={{ background: slide.accent }}
              onClick={() => navigate(`/category/${slide.slug}`)}
            >
              {slide.cta} <span>→</span>
            </button>
            <button className="hero-outline" onClick={() => navigate('/')}>
              View All Deals
            </button>
          </div>
        </div>

        {/* Right image */}
        <div className="hero-imgwrap">
          <div className="hero-imgglow" style={{ background: slide.accent }} />
          <div className="hero-imgbox">
            {slide.img ? (
              <img src={slide.img} alt={slide.title} />
            ) : (
              <div className="hero-no-img">{slide.icon}</div>
            )}
            {slide.price && (
              <div className="hero-pricebadge">
                <div className="hero-pricebadge-label">Starting at</div>
                <div className="hero-pricebadge-val">{slide.price}</div>
              </div>
            )}
            <div className="hero-iconbadge">{slide.icon}</div>
          </div>
        </div>

        {/* Dots */}
        <div className="hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="hero-dot"
              style={{
                background: i === active ? slide.accent : 'rgba(255,255,255,0.25)',
                width: i === active ? 32 : 14,
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}