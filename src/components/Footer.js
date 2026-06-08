import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Footer.css';

export default function Footer() {
  const navigate = useNavigate();

  const shopLinks = [
    { label: 'Gaming', slug: 'gaming' },
    { label: 'Phones', slug: 'phones' },
    { label: 'Laptops', slug: 'laptops' },
    { label: 'Audio & Sound', slug: 'audio' },
    { label: 'TV & Streaming', slug: 'tv-streaming' },
  ];

  return (
    <footer className="foot">
      <div className="foot-grid">

        {/* Brand */}
        <div>
          <div className="foot-brand" onClick={() => navigate('/')}>
            <img
              src="/images/logo.png"
              alt="Optimus Sphere Tech"
              className="foot-brand-logo"
            />
            <div className="foot-brand-text">
              <div className="foot-brand-name">OPTIMUS</div>
              <div className="foot-brand-sub">SPHERE TECH</div>
            </div>
          </div>
          <p className="foot-desc">
            Nairobi's premier tech store for gaming, phones, laptops, audio & TVs. Only original products. No fakes.
          </p>
          <a
            href="https://wa.me/254759962068"
            target="_blank"
            rel="noreferrer"
            className="foot-wa-btn"
          >
            💬 Chat on WhatsApp
          </a>
        </div>

        {/* Location */}
        <div>
          <h4 className="foot-col-head">📍 Find Us</h4>
          <p className="foot-col-text">Mithoo Biashara Centre</p>
          <p className="foot-col-text">Opposite Bazaar Shop</p>
          <p className="foot-col-text">Basement B69, Nairobi</p>
          <p className="foot-col-text foot-hours">
            Mon–Sat: 8am – 7pm
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="foot-col-head">📞 Contact Us</h4>
          <a href="tel:0759962068" className="foot-phone">0759 962 068</a>
          <a href="tel:0757255539" className="foot-phone">0757 255 539</a>
          <div className="foot-accept">
            <h4 className="foot-col-head">💳 We Accept</h4>
            <p className="foot-col-text">M-Pesa · Cash · Card</p>
          </div>
        </div>

        {/* Shop links */}
        <div>
          <h4 className="foot-col-head">🛍️ Shop</h4>
          {shopLinks.map(l => (
            <div
              key={l.slug}
              className="foot-link"
              onClick={() => navigate(`/category/${l.slug}`)}
            >
              → {l.label}
            </div>
          ))}
        </div>

      </div>

      <div className="foot-bottom">
        <span>© 2025 Optimus Sphere Tech. All rights reserved.</span>
        <span className="foot-made">Made with ❤️ in Nairobi, Kenya</span>
      </div>
    </footer>
  );
}
