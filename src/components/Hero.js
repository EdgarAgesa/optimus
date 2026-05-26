import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
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

export default function Hero() {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[active];

  return (
    <>
      <style>{`
        .hero-section {
          position: relative;
          overflow: hidden;
          padding: 60px 64px;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 40px;
          align-items: center;
          min-height: 540px;
          transition: background 0.8s ease;
        }
        .hero-section::before {
          content: '';
          position: absolute;
          top: -50%; right: -10%;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(0,151,167,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-section::after {
          content: '';
          position: absolute;
          bottom: -30%; left: -10%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(38,198,218,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          animation: slideUp 0.8s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 7px 16px;
          border-radius: 20px;
          letter-spacing: 1.2px;
          margin-bottom: 24px;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .hero-h1 {
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 900;
          color: #fff;
          line-height: 1.05;
          margin-bottom: 18px;
          letter-spacing: -2px;
        }
        .hero-sub {
          font-size: 17px;
          color: rgba(255,255,255,0.75);
          line-height: 1.6;
          margin-bottom: 24px;
          max-width: 480px;
        }
        .hero-features {
          display: flex;
          gap: 18px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .hero-feature {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.85);
          font-size: 13px;
          font-weight: 500;
        }
        .hero-check {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: rgba(0,188,212,0.25);
          color: #00e5ff;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px;
          flex-shrink: 0;
        }
        .hero-price-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 28px;
        }
        .hero-price {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -1px;
        }
        .hero-oldprice {
          font-size: 18px;
          color: rgba(255,255,255,0.4);
          text-decoration: line-through;
        }
        .hero-btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .hero-cta {
          border: none;
          color: #fff;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          transition: transform .2s, box-shadow .2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hero-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }
        .hero-outline {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(255,255,255,0.25);
          color: #fff;
          padding: 16px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s;
        }
        .hero-outline:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.4);
        }
        .hero-imgwrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .hero-imgglow {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
        }
        .hero-imgbox {
          position: relative;
          width: 100%;
          max-width: 460px;
          aspect-ratio: 1;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
          animation: float 6s ease-in-out infinite;
        }
        .hero-imgbox img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .hero-pricebadge {
          position: absolute;
          top: 24px;
          right: 24px;
          background: #fff;
          padding: 14px 18px;
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.25);
          z-index: 3;
        }
        .hero-pricebadge-label {
          font-size: 9px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }
        .hero-pricebadge-val {
          font-size: 16px;
          font-weight: 800;
          color: #0097a7;
        }
        .hero-iconbadge {
          position: absolute;
          bottom: 24px;
          left: 24px;
          background: rgba(255,255,255,0.95);
          width: 56px; height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.25);
          z-index: 3;
        }
        .hero-dots {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          align-items: center;
          z-index: 10;
        }
        .hero-dot {
          height: 4px;
          border-radius: 2px;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all .4s;
        }
        .hero-counter {
          position: absolute;
          top: 24px;
          left: 64px;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1px;
          z-index: 5;
        }
        .hero-counter strong {
          color: #fff;
          font-size: 16px;
        }

        @media (max-width: 900px) {
          .hero-section {
            grid-template-columns: 1fr;
            padding: 40px 24px 60px;
            text-align: center;
            min-height: auto;
            gap: 32px;
          }
          .hero-content { order: 2; }
          .hero-imgwrap { order: 1; }
          .hero-features { justify-content: center; }
          .hero-btns { justify-content: center; }
          .hero-price-row { justify-content: center; }
          .hero-imgbox { max-width: 320px; }
          .hero-counter { display: none; }
        }
        @media (max-width: 480px) {
          .hero-section { padding: 32px 16px 50px; }
          .hero-imgbox { max-width: 260px; }
          .hero-pricebadge { top: 12px; right: 12px; padding: 10px 14px; }
          .hero-iconbadge { bottom: 12px; left: 12px; width: 44px; height: 44px; font-size: 22px; }
          .hero-features { gap: 10px; }
          .hero-feature { font-size: 12px; }
        }
      `}</style>

      <section className="hero-section" style={{ background: slide.bg }}>
        {/* Counter */}
        <div className="hero-counter">
          <strong>0{active + 1}</strong> / 0{slides.length}
        </div>

        {/* Left content */}
        <div className="hero-content">
          <span className="hero-tag" style={{ background: `${slide.accent}25` }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: slide.accent }} />
            {slide.tag}
          </span>

          <h1 className="hero-h1">{slide.title}</h1>
          <p className="hero-sub">{slide.sub}</p>

          <div className="hero-features">
            {slide.features.map((f, i) => (
              <div key={i} className="hero-feature">
                <span className="hero-check">✓</span>
                {f}
              </div>
            ))}
          </div>

          <div className="hero-price-row">
            <span className="hero-price" style={{ color: slide.accent }}>{slide.price}</span>
            {slide.oldPrice && <span className="hero-oldprice">{slide.oldPrice}</span>}
          </div>

          <div className="hero-btns">
            <button
              className="hero-cta"
              style={{ background: slide.accent }}
              onClick={() => navigate(`/category/${slide.slug}`)}
            >
              {slide.cta}
              <span>→</span>
            </button>
            <button className="hero-outline" onClick={() => navigate('/')}>
              View All Deals
            </button>
          </div>
        </div>

        {/* Right image */}
        <div className="hero-imgwrap">
          <div
            className="hero-imgglow"
            style={{ background: slide.accent }}
          />
          <div className="hero-imgbox">
            <img src={slide.img} alt={slide.title} />
            <div className="hero-pricebadge">
              <div className="hero-pricebadge-label">Starting at</div>
              <div className="hero-pricebadge-val">{slide.price}</div>
            </div>
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