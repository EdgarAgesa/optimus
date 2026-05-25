/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const menuData = [
  {
    label: 'Gaming', slug: 'gaming',
    sub: [
      { label: 'Games PS5', slug: 'ps5-games' },
      { label: 'Games PS4', slug: 'ps4-games' },
      { label: 'Consoles', slug: 'gaming-consoles' },
    ],
  },
  {
    label: 'Phones', slug: 'phones',
    sub: [
      { label: 'Smartphones', slug: 'smartphones' },
      { label: 'Tablets', slug: 'tablets' },
    ],
  },
  {
    label: 'Laptops', slug: 'laptops',
    sub: [
      { label: 'All Laptops', slug: 'laptops' },
    ],
  },
  {
    label: 'Audio', slug: 'audio',
    sub: [
      { label: 'Headphones', slug: 'headphones' },
      { label: 'Earbuds', slug: 'earbuds' },
      { label: 'BT Speakers', slug: 'bluetooth-speakers' },
      { label: 'Soundbars', slug: 'soundbars' },
    ],
  },
  {
    label: 'TV & Streaming', slug: 'tv-streaming',
    sub: [
      { label: 'Televisions', slug: 'televisions' },
    ],
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();

  const handleNav = (slug) => {
    setOpen(null);
    navigate(`/category/${slug}`);
  };

  return (
    <header>
      {/* Announcement bar */}
      <div style={s.announce}>
        Call us on <strong>0759 962 068</strong> or <strong>0757 255 539</strong> to place your order.
      </div>

      {/* Main bar */}
      <div style={s.main}>
        {/* Logo */}
        <div style={s.logo} onClick={() => navigate('/')}>
          <img
            src="/images/WhatsApp_Image_2026-05-24_at_12_34_43.jpeg"
            alt="Optimus Sphere Tech"
            style={{ height: 44, objectFit: 'contain', cursor: 'pointer' }}
          />
        </div>

        {/* Search */}
        <div style={s.searchWrap}>
          <select style={s.catSelect}>
            <option>All categories</option>
            <option>Gaming</option>
            <option>Phones</option>
            <option>Laptops</option>
            <option>Audio</option>
            <option>TV & Streaming</option>
          </select>
          <div style={s.divider} />
          <input style={s.searchInput} type="text" placeholder="What are you looking for..." />
          <button style={s.searchBtn}>🔍</button>
        </div>

        {/* Icons */}
        <div style={s.icons}>
          <a href="https://wa.me/254759962068" style={s.iconBtn} title="WhatsApp">💬</a>
          <div style={s.iconBtn}>🛒 <span style={s.badge}>0</span></div>
        </div>
      </div>

      {/* Category nav */}
      <nav style={s.catNav}>
        {menuData.map((item, i) => (
          <div
            key={i}
            style={s.navItem}
            onMouseEnter={() => setOpen(i)}
            onMouseLeave={() => setOpen(null)}
          >
            {/* Main label — click goes to parent category */}
            <span
              style={s.navLink}
              onClick={() => handleNav(item.slug)}
            >
              {item.label} ▾
            </span>

            {/* Dropdown */}
            {open === i && (
              <div style={s.dropdown}>
                {item.sub.map((sub, j) => (
                  <div
                    key={j}
                    style={s.dropItem}
                    onClick={() => handleNav(sub.slug)}
                  >
                    {sub.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </header>
  );
}

const s = {
  announce: {
    background: '#222', color: '#ddd',
    textAlign: 'center', fontSize: 12,
    padding: '8px 16px',
  },
  main: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '14px 32px', background: '#fff',
    borderBottom: '1px solid #eee',
  },
  logo: {
    minWidth: 140, cursor: 'pointer',
  },
  searchWrap: {
    flex: 1, display: 'flex', alignItems: 'center',
    border: '1.5px solid #ddd', borderRadius: 8,
    overflow: 'hidden', maxWidth: 680,
  },
  catSelect: {
    border: 'none', outline: 'none',
    padding: '10px 12px', fontSize: 12,
    color: '#444', background: '#f5f5f5',
    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  },
  divider: { width: 1, height: 22, background: '#ddd' },
  searchInput: {
    flex: 1, border: 'none', outline: 'none',
    padding: '10px 14px', fontSize: 13,
    fontFamily: 'Inter, sans-serif',
  },
  searchBtn: {
    background: '#0097a7', border: 'none',
    padding: '0 18px', fontSize: 15,
    height: 44, cursor: 'pointer',
  },
  icons: {
    display: 'flex', alignItems: 'center',
    gap: 16, marginLeft: 'auto',
  },
  iconBtn: {
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 4,
    color: '#111', fontSize: 13, fontWeight: 600,
    textDecoration: 'none',
  },
  badge: {
    background: '#0097a7', color: '#fff',
    borderRadius: '50%', fontSize: 10,
    padding: '1px 5px', fontWeight: 700,
  },
  catNav: {
    display: 'flex',
    padding: '0 24px',
    background: '#fff',
    borderBottom: '2px solid #f0f0f0',
    position: 'relative',
    zIndex: 100,
  },
  navItem: {
    position: 'relative',
  },
  navLink: {
    display: 'block', padding: '13px 16px',
    fontSize: 13, fontWeight: 600,
    color: '#222', cursor: 'pointer',
    whiteSpace: 'nowrap', letterSpacing: 0.3,
  },
  dropdown: {
    position: 'absolute',
    top: '100%', left: 0,
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderTop: '3px solid #0097a7',
    minWidth: 200, zIndex: 999,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    borderRadius: '0 0 8px 8px',
  },
  dropItem: {
    padding: '11px 18px',
    fontSize: 13, color: '#333',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
    fontWeight: 500,
    transition: 'background .15s',
  },
};