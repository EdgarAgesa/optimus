import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    <footer style={s.footer}>
      <div style={s.grid}>

        {/* Brand */}
        <div>
         <div
  style={{ cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}
  onClick={() => navigate('/')}
>
  <img
    src="/images/logo.png"
    alt="Optimus Sphere Tech"
    style={{ height: 52, width: 'auto', objectFit: 'contain' }}
  />
  <div style={{ lineHeight: 1 }}>
    <div style={{
      fontSize: 20, fontWeight: 900, color: '#fff',
      letterSpacing: '-0.5px', textTransform: 'uppercase',
      fontFamily: 'Inter, sans-serif',
    }}>
      OPTIMUS
    </div>
    <div style={{
      fontSize: 9, fontWeight: 700, color: '#0097a7',
      letterSpacing: '2.5px', textTransform: 'uppercase',
      fontFamily: 'Inter, sans-serif', marginTop: 3,
    }}>
      SPHERE TECH
    </div>
  </div>
</div>
          <p style={s.desc}>
            Nairobi's premier tech store for gaming, phones, laptops, audio & TVs. Only original products. No fakes.
          </p>
          <a
            href="https://wa.me/254759962068"
            target="_blank"
            rel="noreferrer"
            style={s.waBtn}
          >
            💬 Chat on WhatsApp
          </a>
        </div>

        {/* Location */}
        <div>
          <h4 style={s.colHead}>📍 Find Us</h4>
          <p style={s.colText}>Mithoo Biashara Centre</p>
          <p style={s.colText}>Opposite Bazaar Shop</p>
          <p style={s.colText}>Basement B69, Nairobi</p>
          <p style={{ ...s.colText, marginTop: 10, color: '#0097a7', fontWeight: 600 }}>
            Mon–Sat: 8am – 7pm
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 style={s.colHead}>📞 Contact Us</h4>
          <a href="tel:0759962068" style={s.phone}>0759 962 068</a>
          <a href="tel:0757255539" style={s.phone}>0757 255 539</a>
          <div style={{ marginTop: 16 }}>
            <h4 style={s.colHead}>💳 We Accept</h4>
            <p style={s.colText}>M-Pesa · Cash · Card</p>
          </div>
        </div>

        {/* Shop links */}
        <div>
          <h4 style={s.colHead}>🛍️ Shop</h4>
          {shopLinks.map(l => (
            <div
              key={l.slug}
              style={s.footLink}
              onClick={() => navigate(`/category/${l.slug}`)}
            >
              → {l.label}
            </div>
          ))}
        </div>

      </div>

      <div style={s.bottom}>
        <span>© 2025 Optimus Sphere Tech. All rights reserved.</span>
        <span style={{ color: '#0097a7' }}>Made with ❤️ in Nairobi, Kenya</span>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    background: 'linear-gradient(180deg, #0d1b2a, #050d14)',
    borderTop: '3px solid #0097a7',
    padding: '56px 32px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 40,
    maxWidth: 1280,
    margin: '0 auto 40px',
  },
  desc: {
    fontSize: 12,
    color: '#7a9eb0',
    lineHeight: 1.8,
    marginBottom: 16,
  },
  waBtn: {
    display: 'inline-block',
    background: '#25D366',
    color: '#fff',
    borderRadius: 8,
    padding: '9px 16px',
    fontSize: 12,
    fontWeight: 700,
    textDecoration: 'none',
  },
  colHead: {
    fontSize: 11,
    fontWeight: 700,
    color: '#0097a7',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  colText: {
    fontSize: 12,
    color: '#7a9eb0',
    marginBottom: 6,
    lineHeight: 1.6,
  },
  phone: {
    display: 'block',
    fontSize: 14,
    color: '#e0f7fa',
    marginBottom: 8,
    fontWeight: 600,
    textDecoration: 'none',
  },
  footLink: {
    fontSize: 12,
    color: '#7a9eb0',
    marginBottom: 8,
    cursor: 'pointer',
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#3d6070',
    borderTop: '1px solid #0d2b33',
    paddingTop: 20,
    paddingBottom: 20,
    maxWidth: 1280,
    margin: '0 auto',
    flexWrap: 'wrap',
    gap: 8,
  },
};