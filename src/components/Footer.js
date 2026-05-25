/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.grid}>
        <div>
          <div style={s.logo}>Tech<span style={s.accent}>Zone</span></div>
          <p style={s.desc}>Nairobi's go-to store for gaming, phones, laptops, audio & TVs.</p>
        </div>
        <div>
          <h4 style={s.colHead}>Location</h4>
          <p style={s.colText}>Mithoo Biashara Centre</p>
          <p style={s.colText}>Opposite Bazaar Shop</p>
          <p style={s.colText}>Basement B69</p>
        </div>
        <div>
          <h4 style={s.colHead}>Contact</h4>
          <a href="tel:0759962068" style={s.phone}>0759 962 068</a>
          <a href="tel:0757255539" style={s.phone}>0757 255 539</a>
        </div>
        <div>
          <h4 style={s.colHead}>Shop</h4>
          {['Gaming', 'Phones', 'Laptops', 'Audio', 'TV & Streaming'].map(l => (
            <a key={l} href="#" style={s.footLink}>{l}</a>
          ))}
        </div>
      </div>
      <div style={s.bottom}>
        <span>© 2025 TechZone. All rights reserved.</span>
        <span>Nairobi, Kenya</span>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    background: '#111',
    borderTop: '1px solid #222',
    padding: '48px 24px 20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 32, maxWidth: 1100, margin: '0 auto 32px',
  },
  logo: { fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 10 },
  accent: { color: '#e63946' },
  desc: { fontSize: 12, color: '#888', lineHeight: 1.7 },
  colHead: { fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  colText: { fontSize: 12, color: '#888', marginBottom: 4 },
  phone: { display: 'block', fontSize: 13, color: '#ccc', marginBottom: 6, fontWeight: 500 },
  footLink: { display: 'block', fontSize: 12, color: '#888', marginBottom: 6 },
  bottom: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 11, color: '#555',
     borderTop: '3px solid #0097a7',
    maxWidth: 1100, margin: '0 auto',
    flexWrap: 'wrap', gap: 8,
  },
};