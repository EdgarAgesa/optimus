import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

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

  const drawerRef = useRef(null);
  const triggerRefs = useRef([]);

  // Drawer a11y: Escape closes, body scroll locks, focus enters and stays in the drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = 'hidden';
    const drawer = drawerRef.current;
    const focusables = () =>
      drawer ? Array.from(drawer.querySelectorAll('button, a, input')) : [];
    focusables()[0]?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { setMobileOpen(false); return; }
      if (e.key !== 'Tab' || !drawer) return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const handleNav = (slug, brand = null) => {
    setOpen(null); setSubOpen(null); setMobileOpen(false);
    setMobileExpanded(null); setMobileSubExpanded(null);
    const url = brand
      ? `/category/${slug}?brand=${encodeURIComponent(brand)}`
      : `/category/${slug}`;
    navigate(url);
  };

  const goHome = () => {
    setMobileOpen(false); setMobileExpanded(null); setMobileSubExpanded(null);
    navigate('/');
  };

  return (
    <>
    <header className="sticky top-0 z-50 font-sans bg-ink-950 supports-[backdrop-filter]:bg-ink-950/90 supports-[backdrop-filter]:backdrop-blur-nav border-b border-edge">
      {/* Announce bar */}
      <div className="bg-ink-950 text-fg-mid text-label uppercase text-center py-2 px-4 border-b border-edge">
        Call us on <strong className="text-fg-hi font-medium">0759 962 068</strong> or{' '}
        <strong className="text-fg-hi font-medium">0757 255 539</strong> to place your order.
      </div>

      {/* Main bar */}
      <div className="flex items-center gap-4 px-4 py-3 max-w-screen-xl mx-auto">
        <button onClick={goHome} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0 shrink-0">
          {/* Transparent icon sits directly on the ink-950 nav — no background box. */}
          <img src="/images/optimus-icon.png" alt="Optimus Sphere Tech home" width="56" height="56" className="h-14 w-14 md:h-11 md:w-11 object-contain" loading="lazy" decoding="async" />
          {/* Mobile: icon only — text hidden to keep the phone bar clean next to the hamburger. */}
          <span className="hidden md:flex flex-col items-start leading-none">
            <span className="text-card-title text-fg-hi tracking-tight">OPTIMUS</span>
            <span className="text-micro text-fg-low uppercase">SPHERE TECH</span>
          </span>
        </button>

        <div className="hidden md:flex flex-1 items-center bg-ink-800 border border-edge rounded-full px-4 h-10 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="What are you looking for..."
            value={searchQuery || ''}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') clearSearch(); }}
            className="flex-1 bg-transparent border-0 outline-none text-body text-fg-hi placeholder:text-fg-low"
          />
          <button onClick={() => handleSearch(searchQuery)} aria-label="Search"
            className="bg-transparent border-0 cursor-pointer text-fg-mid">🔍</button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <a href="https://wa.me/254759962068" target="_blank" rel="noreferrer" title="WhatsApp"
            className="hidden sm:flex items-center gap-1 text-fg-mid hover:text-fg-hi text-body px-3 py-2 rounded-full min-h-11">
            <span>💬</span><span className="text-label uppercase">Chat</span>
          </a>
          <button onClick={onCartClick} title="Cart"
            className="relative flex items-center gap-1 bg-transparent border border-edge cursor-pointer text-fg-mid hover:text-fg-hi text-body px-3 py-2 rounded-full min-h-11">
            <span>🛒</span><span className="text-label uppercase hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-teal-500 text-ink-950 text-micro font-medium rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}
            className="md:hidden bg-transparent border-0 cursor-pointer text-fg-hi text-card-title min-w-11 min-h-11">
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="flex md:hidden items-center gap-2 px-4 pb-3">
        <div className="flex flex-1 items-center bg-ink-800 border border-edge rounded-full px-4 h-11">
          <input
            type="text" placeholder="Search products..."
            value={searchQuery || ''}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') clearSearch(); }}
            className="flex-1 bg-transparent border-0 outline-none text-body text-fg-hi placeholder:text-fg-low"
          />
          <button onClick={() => handleSearch(searchQuery)} aria-label="Search"
            className="bg-transparent border-0 cursor-pointer text-fg-mid">🔍</button>
        </div>
      </div>

      {/* Desktop category nav */}
      <nav className="hidden md:block border-t border-edge">
        <div className="flex items-center justify-center gap-1 max-w-screen-xl mx-auto">
          {menuData.map((item, i) => (
            <div key={i} className="relative"
              onMouseEnter={() => { setOpen(i); setSubOpen(null); }}
              onMouseLeave={() => { setOpen(null); setSubOpen(null); }}
              onFocus={() => { setOpen(i); }}
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setOpen(null); setSubOpen(null); } }}
              onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(null); setSubOpen(null); triggerRefs.current[i]?.focus(); } }}>
              <button
                ref={el => (triggerRefs.current[i] = el)}
                onClick={() => handleNav(item.slug)}
                aria-expanded={open === i}
                className={`flex items-center gap-1 bg-transparent border-0 cursor-pointer text-label uppercase px-4 py-3 ${open === i ? 'text-teal-500' : 'text-fg-mid hover:text-fg-hi'}`}>
                {item.label}<span className="text-micro">▾</span>
              </button>
              {open === i && (
                <div className="absolute left-0 top-full bg-ink-800 border border-edge rounded-lg min-w-56 py-2 z-50">
                  {item.sub.map((sub, j) => (
                    <div key={j} className="relative"
                      onMouseEnter={() => setSubOpen(j)}
                      onMouseLeave={(e) => { if (!e.currentTarget.contains(document.activeElement)) setSubOpen(null); }}
                      onFocus={() => setSubOpen(j)}>
                      <button onClick={() => handleNav(sub.slug)}
                        className="flex w-full items-center justify-between bg-transparent border-0 cursor-pointer text-body text-fg-mid hover:text-fg-hi hover:bg-ink-700 px-4 py-2 text-left">
                        <span>{sub.label}</span>
                        {sub.brands?.length > 0 && <span className="text-micro text-fg-low">▸</span>}
                      </button>
                      {subOpen === j && sub.brands?.length > 0 && (
                        <div className="absolute left-full top-0 bg-ink-800 border border-edge rounded-lg min-w-44 py-2">
                          {sub.brands.map((brand, k) => (
                            <button key={k} onClick={() => handleNav(sub.slug, brand)}
                              className="block w-full bg-transparent border-0 cursor-pointer text-body text-fg-mid hover:text-fg-hi hover:bg-ink-700 px-4 py-2 text-left">
                              {brand}
                            </button>
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

    </header>

    {/* Mobile overlay + drawer live OUTSIDE the blurred header: backdrop-filter
        makes an ancestor the containing block for position:fixed descendants,
        which previously clipped the drawer to the header's box on mobile. */}
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-ink-950/80 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile menu */}
      <div ref={drawerRef} inert={!mobileOpen} className={`fixed top-0 right-0 h-full w-80 max-w-full bg-ink-950 border-l border-edge z-50 flex flex-col transition-transform duration-300 motion-reduce:transition-none md:hidden ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-edge">
          <div className="flex items-center gap-3">
            <img src="/images/optimus-icon.png" alt="Optimus Sphere Tech" width="36" height="36" className="h-9 w-9 object-contain" loading="lazy" decoding="async" />
            <span className="flex flex-col leading-none">
              <span className="text-card-title text-fg-hi">OPTIMUS</span>
              <span className="text-micro text-fg-low uppercase">SPHERE TECH</span>
            </span>
          </div>
          <button onClick={() => setMobileOpen(false)} aria-label="Close menu"
            className="bg-transparent border-0 cursor-pointer text-fg-hi text-card-title min-w-11 min-h-11">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <button onClick={goHome}
            className="flex w-full items-center gap-2 bg-transparent border-0 cursor-pointer text-body text-fg-hi px-4 py-3 min-h-11 text-left">
            🏠 <span>Home</span>
          </button>
          {menuData.map((item, i) => (
            <div key={i} className="border-t border-edge">
              <button onClick={() => setMobileExpanded(mobileExpanded === i ? null : i)}
                aria-expanded={mobileExpanded === i}
                className="flex w-full items-center justify-between bg-transparent border-0 cursor-pointer text-body text-fg-hi px-4 py-3 min-h-11 text-left">
                <span>{item.label}</span>
                <span className="text-micro text-fg-low">{mobileExpanded === i ? '▴' : '▾'}</span>
              </button>
              {mobileExpanded === i && (
                <div className="pb-2">
                  <button onClick={() => handleNav(item.slug)}
                    className="block w-full bg-transparent border-0 cursor-pointer text-body text-teal-500 px-6 py-2 min-h-11 text-left">
                    → View all {item.label}
                  </button>
                  {item.sub.map((sub, j) => (
                    <div key={j}>
                      <button
                        onClick={() => {
                          if (sub.brands?.length > 0) {
                            setMobileSubExpanded(mobileSubExpanded === `${i}-${j}` ? null : `${i}-${j}`);
                          } else { handleNav(sub.slug); }
                        }}
                        className="flex w-full items-center justify-between bg-transparent border-0 cursor-pointer text-body text-fg-mid px-6 py-2 min-h-11 text-left">
                        <span>→ {sub.label}</span>
                        {sub.brands?.length > 0 && (
                          <span className="text-micro text-fg-low">{mobileSubExpanded === `${i}-${j}` ? '▴' : '▾'}</span>
                        )}
                      </button>
                      {mobileSubExpanded === `${i}-${j}` && sub.brands?.map((brand, k) => (
                        <button key={k} onClick={() => handleNav(sub.slug, brand)}
                          className="block w-full bg-transparent border-0 cursor-pointer text-body text-fg-low px-8 py-2 min-h-11 text-left">
                          • {brand}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-edge p-4">
          <a href="https://wa.me/254759962068" target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-whatsapp text-ink-950 text-body font-medium rounded-full px-6 py-3 min-h-11">
            💬 Chat on WhatsApp
          </a>
          <div className="text-body text-fg-low mt-4 space-y-1">
            <div><span className="text-label uppercase text-teal-500">Call</span> 0759 962 068 · 0757 255 539</div>
            <div><span className="text-label uppercase text-teal-500">Visit</span> Mithoo Biashara Centre, Basement B69</div>
          </div>
        </div>
      </div>
    </>
  );
}
