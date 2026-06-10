import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Navbar.css';

const menuData = [
  {
    label: 'Gaming', slug: 'gaming',
    sub: [
      { label: 'Games', slug: 'games', brands: ['PS4', 'PS5', 'Xbox', 'Nintendo'] },
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
]

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
                className="nav-icon-btn nav-icon-wa"
                title="WhatsApp"
                target="_blank"
                rel="noreferrer"
              >
                <span>💬</span>
                <span className="nav-icon-label">Chat</span>
              </a>

              <div className="icon-divider" />

              <div
                className="nav-icon-btn nav-icon-cart"
                onClick={onCartClick}
                title="Cart"
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
                        className="drop-sub-wrap"
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
            <div className="mobile-header-brand">
              <img
                src="/images/logo.png"
                alt="Optimus Sphere Tech"
                className="mobile-header-logo"
              />
              <div className="mobile-header-text">
                <div className="mobile-header-name">OPTIMUS</div>
                <div className="mobile-header-sub">SPHERE TECH</div>
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
                            <span className="mobile-sub-chevron">
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