import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const menuData = [
  {
    label: 'Gaming', slug: 'gaming',
    sub: [
      { label: 'Games', slug: 'gaming', brands: ['PS4', 'PS5', 'Nintendo', 'Xbox'] },
      { label: 'Consoles', slug: 'gaming-consoles', brands: ['PS3', 'PS4', 'PS5', 'Xbox', 'Nintendo', 'Portable'] },
      { label: 'Accessories', slug: 'gaming-accessories', brands: ['PS4', 'PS5', 'Nintendo', 'Xbox', 'VR', 'Driving Wheel', 'Handheld', 'Game Pad'] },
    ],
  },
  {
    label: 'Phones', slug: 'phones',
    sub: [
      { label: 'Smartphones', slug: 'smartphones', brands: ['iPhone', 'Samsung', 'Google Pixel', 'Nothing Phone', 'Redmi'] },
      { label: 'Tablets', slug: 'tablets', brands: ['Apple', 'Samsung'] },
      { label: 'Kids Tablets', slug: 'tablets', brands: ['Modio'] },
    ],
  },
  {
    label: 'Laptops', slug: 'laptops',
    sub: [
      { label: 'All Laptops', slug: 'laptops', brands: ['HP', 'Lenovo', 'Dell', 'MacBook'] },
    ],
  },
  {
    label: 'Audio & Sound', slug: 'audio',
    sub: [
      { label: 'Headphones', slug: 'headphones', brands: ['JBL', 'Sony', 'Beats', 'Soundcore'] },
      { label: 'Earbuds', slug: 'earbuds', brands: ['Oraimo', 'Samsung', 'Apple', 'Soundcore', 'OnePlus'] },
      { label: 'Bluetooth Speakers', slug: 'bluetooth-speakers', brands: ['Oraimo', 'JBL', 'Soundcore', 'Sony', 'Beats', 'Harman Kardon'] },
      { label: 'Soundbars', slug: 'soundbars', brands: ['JBL', 'Sony', 'TCL', 'Hisense', 'Samsung'] },
    ],
  },
  {
    label: 'TV & Streaming', slug: 'tv-streaming',
    sub: [
      { label: 'Televisions', slug: 'televisions', brands: ['TCL', 'LG', 'Samsung', 'Vitron', 'Hisense'] },
      { label: 'Streaming Devices', slug: 'streaming-devices', brands: ['Fire Stick', 'Google', 'Xiaomi', 'Apple'] },
    ],
},
];

export default function Navbar({ onCartClick }) {
  const [open, setOpen] = useState(null);
  const [subOpen, setSubOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [mobileSubExpanded, setMobileSubExpanded] = useState(null);
  const navigate = useNavigate();
  const { cartCount, handleSearch, searchQuery, clearSearch } = useCart();

  const handleNav = (slug, brand = null) => {
    setOpen(null);
    setSubOpen(null);
    setMobileOpen(false);
    setMobileExpanded(null);
    setMobileSubExpanded(null);
    const url = brand
      ? `/category/${slug}?brand=${encodeURIComponent(brand)}`
      : `/category/${slug}`;
    navigate(url);
  };

  const goHome = () => {
    setMobileOpen(false);
    setMobileExpanded(null);
    setMobileSubExpanded(null);
    navigate('/');
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .nav-header {
          position: relative;
          z-index: 100;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .announce-bar {
          background: #1a1a1a; color: #ccc;
          font-size: 12px; text-align: center;
          padding: 8px 20px; letter-spacing: 0.2px;
        }
        .announce-bar strong { color: #fff; }
        .main-bar {
          background: #fff; border-bottom: 1px solid #f0f0f0;
        }
        .main-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; flex-direction: row;
          align-items: center; gap: 20px; padding: 12px 24px;
        }
        .nav-logo {
          flex-shrink: 0; cursor: pointer;
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .nav-logo img {
          height: 50px; width: auto;
          object-fit: contain; display: block;
        }
        .nav-logo-text { line-height: 1; }
        .nav-logo-main {
          font-size: 18px; font-weight: 900;
          color: #0d2b33; letter-spacing: -0.5px;
          text-transform: uppercase;
          font-family: Inter, sans-serif;
          display: block;
        }
        .nav-logo-sub {
          font-size: 9px; font-weight: 700;
          color: #0097a7; letter-spacing: 2.5px;
          text-transform: uppercase;
          font-family: Inter, sans-serif;
          display: block; margin-top: 2px;
        }
        .search-wrap {
          flex: 1; display: flex; flex-direction: row;
          align-items: center; border: 1.5px solid #e0e0e0;
          border-radius: 6px; overflow: hidden;
          max-width: 580px; transition: border-color .2s;
        }
        .search-wrap:focus-within { border-color: #0097a7; }
        .search-wrap input {
          flex: 1; border: none; outline: none;
          padding: 11px 16px; font-size: 13px;
          font-family: Inter, sans-serif; min-width: 0; color: #111;
        }
        .search-wrap input::placeholder { color: #aaa; }
        .search-btn {
          background: #0097a7; border: none;
          padding: 0 20px; height: 44px; cursor: pointer;
          font-size: 16px; flex-shrink: 0;
          display: flex; align-items: center;
          justify-content: center;
          transition: background .2s; color: #fff;
        }
        .search-btn:hover { background: #007b8a; }
        .right-icons {
          display: flex; flex-direction: row;
          align-items: center; gap: 6px;
          flex-shrink: 0; margin-left: auto;
        }
        .nav-icon-btn {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 2px; width: 44px; height: 44px;
          border-radius: 8px; cursor: pointer;
          position: relative; color: #333;
          text-decoration: none; transition: background .15s;
          font-size: 20px;
        }
        .nav-icon-btn:hover { background: #f5f5f5; }
        .nav-icon-label {
          font-size: 9px; font-weight: 600;
          color: #666; letter-spacing: 0.3px;
        }
        .icon-badge {
          position: absolute; top: 4px; right: 4px;
          background: #e63946; color: #fff;
          border-radius: 50%; font-size: 9px;
          min-width: 16px; height: 16px; padding: 0 3px;
          display: flex; align-items: center;
          justify-content: center; font-weight: 700; line-height: 1;
        }
        .icon-divider {
          width: 1px; height: 28px;
          background: #e8e8e8; margin: 0 4px;
        }
        .hamburger-btn {
          display: none; background: none;
          border: 1.5px solid #e0e0e0; border-radius: 6px;
          padding: 7px 10px; font-size: 18px;
          cursor: pointer; color: #333;
        }
        .mobile-search-bar {
          display: none; flex-direction: row;
          padding: 8px 16px; background: #fff;
          border-bottom: 1px solid #eee;
        }
        .mobile-search-bar input {
          flex: 1; border: 1.5px solid #e0e0e0;
          border-right: none; border-radius: 6px 0 0 6px;
          outline: none; padding: 9px 12px;
          font-size: 13px; font-family: Inter, sans-serif;
        }
        .mobile-search-bar button {
          background: #0097a7; border: none;
          border-radius: 0 6px 6px 0;
          padding: 9px 16px; font-size: 15px;
          cursor: pointer; color: #fff; flex-shrink: 0;
        }
        .desktop-cat-nav {
          background: #fff; border-bottom: 2px solid #f0f0f0;
          width: 100%; position: relative; z-index: 99;
        }
        .cat-nav-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; flex-direction: row;
          align-items: stretch; justify-content: center;
          padding: 0 24px;
        }
        .nav-item { position: relative; flex-shrink: 0; }
        .nav-link {
          display: flex; flex-direction: row;
          align-items: center; gap: 5px;
          padding: 13px 18px; font-size: 13px;
          font-weight: 700; cursor: pointer;
          white-space: nowrap; color: #111;
          border-bottom: 3px solid transparent;
          transition: color .15s, border-color .15s;
          text-transform: uppercase; letter-spacing: 0.5px;
          user-select: none;
        }
        .nav-link:hover, .nav-link.active {
          color: #0097a7; border-bottom-color: #0097a7;
        }
        .nav-chevron { font-size: 8px; opacity: 0.5; }
        .nav-dropdown {
          position: absolute; top: calc(100% + 2px); left: 0;
          background: #fff; border: 1px solid #e8e8e8;
          border-top: 3px solid #0097a7; min-width: 220px;
          z-index: 99999;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          border-radius: 0 0 10px 10px;
        }
        .drop-item {
          padding: 11px 18px; font-size: 13px; color: #333;
          cursor: pointer; border-bottom: 1px solid #f5f5f5;
          font-weight: 500; display: flex; flex-direction: row;
          justify-content: space-between; align-items: center;
          transition: all .12s; user-select: none;
        }
        .drop-item:last-child { border-bottom: none; }
        .drop-item:hover {
          background: #f0fafb; color: #0097a7; padding-left: 22px;
        }
        .drop-arrow { font-size: 9px; color: #bbb; flex-shrink: 0; }
        .drop-item:hover .drop-arrow { color: #0097a7; }
        .brand-menu {
          position: absolute; left: 100%; top: 0;
          background: #fff; border: 1px solid #e8e8e8;
          border-left: 3px solid #0097a7; min-width: 170px;
          z-index: 99999;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          border-radius: 0 10px 10px 0;
        }
        .brand-link {
          padding: 10px 16px; font-size: 12px; color: #555;
          cursor: pointer; border-bottom: 1px solid #f5f5f5;
          font-weight: 500; transition: all .12s; white-space: nowrap;
        }
        .brand-link:last-child { border-bottom: none; }
        .brand-link:hover {
          background: #e0f7fa; color: #0097a7; padding-left: 22px;
        }
        .mobile-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.5); z-index: 9997;
        }
        .mobile-overlay.show { display: block; }
        .mobile-menu {
          position: fixed; top: 0; left: 0;
          width: 300px; height: 100vh; height: 100dvh;
          background: #fff; z-index: 9998;
          overflow: hidden;
          box-shadow: 4px 0 24px rgba(0,0,0,0.15);
          transform: translateX(-110%);
          transition: transform .3s ease;
          display: flex; flex-direction: column;
        }
        .mobile-menu.open { transform: translateX(0); }
        .mobile-menu-header {
          display: flex; justify-content: space-between;
          align-items: center; padding: 16px 20px;
          background: linear-gradient(135deg, #0d2b33, #0097a7);
          flex-shrink: 0;
        }
        .mobile-menu-close {
          background: rgba(255,255,255,0.2); border: none;
          color: #fff; width: 34px; height: 34px;
          border-radius: 50%; cursor: pointer; font-size: 15px;
          display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
        }
        .mobile-menu-body {
          flex: 1; overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .mobile-home-link {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 20px; border-bottom: 1px solid #f0f0f0;
          cursor: pointer; font-weight: 700;
          font-size: 14px; color: #0097a7; transition: background .15s;
        }
        .mobile-home-link:hover { background: #f0fafb; }
        .mobile-group { border-bottom: 1px solid #f0f0f0; }
        .mobile-parent {
          display: flex; justify-content: space-between;
          align-items: center; padding: 14px 20px;
          cursor: pointer; transition: background .15s;
        }
        .mobile-parent:hover { background: #f8fffe; }
        .mobile-parent-label {
          font-size: 14px; font-weight: 700; color: #111;
          text-transform: uppercase; letter-spacing: 0.4px;
        }
        .mobile-chevron { font-size: 10px; color: #0097a7; }
        .mobile-subs { background: #fafafa; }
        .mobile-sub-group { border-bottom: 1px solid #f0f0f0; }
        .mobile-sub {
          padding: 11px 32px; display: flex;
          justify-content: space-between; align-items: center;
          font-size: 13px; color: #0097a7;
          cursor: pointer; font-weight: 600; transition: background .15s;
        }
        .mobile-sub:hover { background: #e0f7fa; }
        .mobile-view-all {
          padding: 9px 20px; font-size: 12px; color: #888;
          cursor: pointer; border-bottom: 1px solid #f0f0f0;
          font-weight: 600; transition: background .15s;
        }
        .mobile-view-all:hover { background: #f5f5f5; color: #0097a7; }
        .mobile-brand {
          padding: 9px 52px; font-size: 12px; color: #555;
          cursor: pointer; background: #fff;
          border-top: 1px solid #f5f5f5; transition: background .15s;
        }
        .mobile-brand:hover { background: #f0fafb; color: #0097a7; }
        .mobile-menu-footer {
          padding: 16px 20px 32px;
          border-top: 1px solid #f0f0f0; flex-shrink: 0;
        }
        .mobile-wa-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px; background: #25D366;
          color: #fff; border-radius: 8px; font-size: 13px;
          font-weight: 700; text-decoration: none; margin-bottom: 12px;
        }
        .mobile-contact-info {
          font-size: 12px; color: #888; line-height: 2;
        }
        @media (max-width: 768px) {
          .hamburger-btn { display: block !important; }
          .search-wrap { display: none !important; }
          .mobile-search-bar { display: flex !important; }
          .desktop-cat-nav { display: none !important; }
        }
        @media (max-width: 480px) {
          .main-inner { padding: 10px 14px; gap: 12px; }
          .announce-bar { font-size: 11px; padding: 7px 14px; }
        }
      `}</style>

      <header className="nav-header">
        <div className="announce-bar">
          Call us on <strong>0759 962 068</strong> or <strong>0757 255 539</strong> to place your order.
        </div>

        <div className="main-bar">
          <div className="main-inner">

            {/* Logo — icon + text */}
            <div className="nav-logo" onClick={goHome}>
              <img src="/images/logo.png" alt="Optimus Sphere Tech" />
              <div className="nav-logo-text">
                <span className="nav-logo-main">OPTIMUS</span>
                <span className="nav-logo-sub">SPHERE TECH</span>
              </div>
            </div>

            {/* Search */}
            <div className="search-wrap">
              <input
                type="text"
                placeholder="What are you looking for..."
                value={searchQuery || ''}
                onChange={e => handleSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') clearSearch(); }}
              />
              <button className="search-btn" onClick={() => handleSearch(searchQuery)}>
                🔍
              </button>
            </div>

            {/* Right icons */}
            <div className="right-icons">
              <a
                href="https://wa.me/254759962068"
                className="nav-icon-btn"
                title="WhatsApp"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#25D366' }}
              >
                <span>💬</span>
                <span className="nav-icon-label">Chat</span>
              </a>

              <div className="icon-divider" />

              <div
                className="nav-icon-btn"
                onClick={onCartClick}
                title="Cart"
                style={{ color: '#0097a7' }}
              >
                <span>🛒</span>
                <span className="nav-icon-label">Cart</span>
                {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
              </div>

              <button
                className="hamburger-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mobile-search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery || ''}
            onChange={e => handleSearch(e.target.value)}
          />
          <button onClick={() => handleSearch(searchQuery)}>🔍</button>
        </div>

        {/* Desktop category nav */}
        <nav className="desktop-cat-nav">
          <div className="cat-nav-inner">
            {menuData.map((item, i) => (
              <div
                key={i}
                className="nav-item"
                onMouseEnter={() => { setOpen(i); setSubOpen(null); }}
                onMouseLeave={() => { setOpen(null); setSubOpen(null); }}
              >
                <span
                  className={`nav-link ${open === i ? 'active' : ''}`}
                  onClick={() => handleNav(item.slug)}
                >
                  {item.label}
                  <span className="nav-chevron">▼</span>
                </span>

                {open === i && (
                  <div className="nav-dropdown">
                    {item.sub.map((sub, j) => (
                      <div
                        key={j}
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setSubOpen(j)}
                        onMouseLeave={() => setSubOpen(null)}
                      >
                        <div className="drop-item" onClick={() => handleNav(sub.slug)}>
                          <span>{sub.label}</span>
                          {sub.brands && sub.brands.length > 0 && (
                            <span className="drop-arrow">▶</span>
                          )}
                        </div>
                        {subOpen === j && sub.brands && sub.brands.length > 0 && (
                          <div className="brand-menu">
                            {sub.brands.map((brand, k) => (
                              <div
                                key={k}
                                className="brand-link"
                                onClick={() => handleNav(sub.slug, brand)}
                              >
                                {brand}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Mobile overlay */}
        <div
          className={`mobile-overlay ${mobileOpen ? 'show' : ''}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Mobile menu */}
        <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src="/images/logo.png"
                alt="Optimus Sphere Tech"
                style={{ height: 36, width: 'auto', objectFit: 'contain' }}
              />
              <div style={{ lineHeight: 1 }}>
                <div style={{
                  fontSize: 15, fontWeight: 900, color: '#fff',
                  textTransform: 'uppercase', letterSpacing: '-0.5px',
                }}>
                  OPTIMUS
                </div>
                <div style={{
                  fontSize: 8, fontWeight: 700,
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  marginTop: 2,
                }}>
                  SPHERE TECH
                </div>
              </div>
            </div>
            <button
              className="mobile-menu-close"
              onClick={() => setMobileOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="mobile-menu-body">
            <div className="mobile-home-link" onClick={goHome}>
              🏠 <span>Home</span>
            </div>

            {menuData.map((item, i) => (
              <div key={i} className="mobile-group">
                <div
                  className="mobile-parent"
                  onClick={() => setMobileExpanded(mobileExpanded === i ? null : i)}
                >
                  <span className="mobile-parent-label">{item.label}</span>
                  <span className="mobile-chevron">
                    {mobileExpanded === i ? '▲' : '▼'}
                  </span>
                </div>

                {mobileExpanded === i && (
                  <div className="mobile-subs">
                    <div
                      className="mobile-view-all"
                      onClick={() => handleNav(item.slug)}
                    >
                      → View all {item.label}
                    </div>
                    {item.sub.map((sub, j) => (
                      <div key={j} className="mobile-sub-group">
                        <div
                          className="mobile-sub"
                          onClick={() => {
                            if (sub.brands && sub.brands.length > 0) {
                              setMobileSubExpanded(
                                mobileSubExpanded === `${i}-${j}` ? null : `${i}-${j}`
                              );
                            } else {
                              handleNav(sub.slug);
                            }
                          }}
                        >
                          <span>→ {sub.label}</span>
                          {sub.brands && sub.brands.length > 0 && (
                            <span style={{ fontSize: 9 }}>
                              {mobileSubExpanded === `${i}-${j}` ? '▲' : '▼'}
                            </span>
                          )}
                        </div>
                        {mobileSubExpanded === `${i}-${j}` &&
                          sub.brands &&
                          sub.brands.map((brand, k) => (
                            <div
                              key={k}
                              className="mobile-brand"
                              onClick={() => handleNav(sub.slug, brand)}
                            >
                              • {brand}
                            </div>
                          ))
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mobile-menu-footer">
            <a
              href="https://wa.me/254759962068"
              className="mobile-wa-btn"
              target="_blank"
              rel="noreferrer"
            >
              💬 Chat on WhatsApp
            </a>
            <div className="mobile-contact-info">
              <div>📞 0759 962 068</div>
              <div>📞 0757 255 539</div>
              <div>📍 Mithoo Biashara Centre, Basement B69</div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}