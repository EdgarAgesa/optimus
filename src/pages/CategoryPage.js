/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';

const categoryMap = {
  'ps5-games':          ['PS5 Games'],
  'ps4-games':          ['PS4 Games'],
  'gaming-consoles':    ['Gaming Consoles'],
  'gaming-accessories': ['Gaming Accessories'],
  'gaming':             ['PS5 Games', 'PS4 Games', 'Gaming Consoles', 'Gaming Accessories'],
  'smartphones':        ['Smartphones'],
  'tablets':            ['Tablets'],
  'phones':             ['Smartphones', 'Tablets'],
  'laptops':            ['Laptops'],
  'headphones':         ['Headphones'],
  'earbuds':            ['Earbuds'],
  'bluetooth-speakers': ['Bluetooth Speakers'],
  'soundbars':          ['Soundbars'],
  'audio':              ['Headphones', 'Earbuds', 'Bluetooth Speakers', 'Soundbars'],
  'televisions':        ['Televisions'],
  'streaming-devices':  ['Streaming Devices'],
  'tv-streaming':       ['Televisions', 'Streaming Devices'],
};

const slugToTitle = {
  'ps5-games':          'PS5 Games',
  'ps4-games':          'PS4 Games',
  'gaming-consoles':    'Gaming Consoles',
  'gaming-accessories': 'Gaming Accessories',
  'gaming':             'Gaming',
  'smartphones':        'Smartphones',
  'tablets':            'Tablets',
  'phones':             'Phones',
  'laptops':            'Laptops',
  'headphones':         'Headphones',
  'earbuds':            'Earbuds',
  'bluetooth-speakers': 'Bluetooth Speakers',
  'soundbars':          'Soundbars',
  'audio':              'Audio & Sound',
  'televisions':        'Televisions',
  'streaming-devices':  'Streaming Devices',
};

const allSidebarCategories = [
  {
    label: 'Gaming', slug: 'gaming', icon: '🎮',
    children: [
      { label: 'PS5 Games', slug: 'ps5-games' },
      { label: 'PS4 Games', slug: 'ps4-games' },
      { label: 'Consoles', slug: 'gaming-consoles' },
      { label: 'Accessories', slug: 'gaming-accessories' },
    ],
  },
  {
    label: 'Phones', slug: 'phones', icon: '📱',
    children: [
      { label: 'Smartphones', slug: 'smartphones' },
      { label: 'Tablets', slug: 'tablets' },
    ],
  },
  {
    label: 'Laptops', slug: 'laptops', icon: '💻',
    children: [],
  },
  {
    label: 'Audio & Sound', slug: 'audio', icon: '🎧',
    children: [
      { label: 'Headphones', slug: 'headphones' },
      { label: 'Earbuds', slug: 'earbuds' },
      { label: 'BT Speakers', slug: 'bluetooth-speakers' },
      { label: 'Soundbars', slug: 'soundbars' },
    ],
  },
  {
    label: 'TV & Streaming', slug: 'tv-streaming', icon: '📺',
    children: [
      { label: 'Televisions', slug: 'televisions' },
      { label: 'Streaming Devices', slug: 'streaming-devices' },
    ],
  },
];

const PRODUCTS_PER_PAGE = 12;

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [brandFilter, setBrandFilter] = useState(searchParams.get('brand'));
  const [sortBy, setSortBy] = useState('default');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { products } = useProducts();

  useEffect(() => {
    setBrandFilter(searchParams.get('brand'));
  }, [searchParams]);

  useEffect(() => {
    setFiltersOpen(false);
    setBrandFilter(searchParams.get('brand'));
    setCurrentPage(1);
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    setCurrentPage(1);
  }, [brandFilter, sortBy]);

  const categories = categoryMap[slug] || [];
  const title = slugToTitle[slug] || slug;

  const allInCategory = categories.length > 0
    ? products.filter(p => categories.includes(p.category))
    : [];

  const brands = [...new Set(allInCategory.map(p => p.brand))].sort();

  let filtered = brandFilter
    ? allInCategory.filter(p => p.brand === brandFilter)
    : allInCategory;

  if (sortBy === 'price-low') {
    filtered = [...filtered].sort((a, b) =>
      parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, ''))
    );
  } else if (sortBy === 'price-high') {
    filtered = [...filtered].sort((a, b) =>
      parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, ''))
    );
  } else if (sortBy === 'name') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Pagination
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIdx = startIdx + PRODUCTS_PER_PAGE;
  const paginatedProducts = filtered.slice(startIdx, endIdx);

  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBrandFilter = (brand) => {
    setBrandFilter(brand);
    setFiltersOpen(false);
    if (brand) {
      setSearchParams({ brand });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryNav = (newSlug) => {
    setBrandFilter(null);
    setSearchParams({});
    navigate(`/category/${newSlug}`);
  };

  return (
    <>
      <style>{`
        .cat-page {
          background: #f5f6fa;
          min-height: 80vh;
          font-family: Inter, sans-serif;
        }
        .cat-header {
          background: #fff;
          padding: 20px 32px 16px;
          border-bottom: 1px solid #eee;
        }
        .cat-header-inner { max-width: 1280px; margin: 0 auto; }
        .cat-breadcrumb {
          font-size: 12px; color: #999;
          margin-bottom: 8px;
          display: flex; align-items: center; gap: 6px;
        }
        .cat-title {
          font-size: 26px; font-weight: 800;
          color: #111; margin-bottom: 4px;
        }
        .cat-count { font-size: 13px; color: #888; }
        .cat-active-filter {
          display: inline-flex; align-items: center; gap: 6px;
          background: #e0f7fa; color: #0097a7;
          padding: 4px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
          margin-top: 8px; cursor: pointer; border: none;
          font-family: Inter, sans-serif;
        }
        .cat-body {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 20px;
          max-width: 1280px;
          margin: 0 auto;
          padding: 20px 32px;
          align-items: start;
        }
        .cat-sidebar {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 12px;
          overflow: hidden;
          height: fit-content;
          position: sticky;
          top: 20px;
        }
        .sidebar-section { padding: 16px; border-bottom: 1px solid #f0f0f0; }
        .sidebar-section:last-child { border-bottom: none; }
        .sidebar-title {
          font-size: 10px; font-weight: 800; color: #aaa;
          text-transform: uppercase; letter-spacing: 1.5px;
          margin-bottom: 10px;
        }
        .cat-parent-link {
          padding: 9px 10px; font-size: 13px;
          font-weight: 700; color: #111;
          cursor: pointer; border-radius: 8px;
          margin-bottom: 2px; transition: all .2s;
          display: flex; align-items: center; gap: 8px;
        }
        .cat-parent-link:hover { background: #f0fafb; color: #0097a7; }
        .cat-parent-link.active {
          background: #e0f7fa; color: #0097a7;
          border-left: 3px solid #0097a7;
        }
        .cat-child-link {
          padding: 7px 10px 7px 30px;
          font-size: 12px; color: #666;
          cursor: pointer; border-radius: 6px;
          margin-bottom: 2px; transition: all .2s;
          display: flex; align-items: center; gap: 6px;
        }
        .cat-child-link:hover { background: #f0fafb; color: #0097a7; }
        .cat-child-link.active {
          background: #e0f7fa; color: #0097a7;
          font-weight: 700; border-left: 3px solid #0097a7;
        }
        .cat-dot { width: 5px; height: 5px; border-radius: 50%; background: #ccc; flex-shrink: 0; }
        .cat-child-link.active .cat-dot { background: #0097a7; }
        .filter-item {
          padding: 8px 10px; font-size: 13px; color: #444;
          cursor: pointer; border-radius: 8px;
          margin-bottom: 2px; transition: all .2s;
          display: flex; justify-content: space-between; align-items: center;
        }
        .filter-item.active {
          background: #e0f7fa; color: #0097a7;
          font-weight: 700; border-left: 3px solid #0097a7;
        }
        .filter-item:hover:not(.active) { background: #f5f6fa; }
        .filter-count {
          font-size: 10px; background: #f0f0f0; color: #888;
          padding: 2px 6px; border-radius: 10px; font-weight: 600;
        }
        .filter-item.active .filter-count { background: #0097a7; color: #fff; }
        .cat-main { min-width: 0; }
        .cat-toolbar {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 16px;
          flex-wrap: wrap; gap: 12px;
          background: #fff; padding: 12px 16px;
          border-radius: 10px; border: 1px solid #eee;
        }
        .toolbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .filter-toggle {
          display: none;
          background: #0097a7; color: #fff;
          border: none; border-radius: 8px;
          padding: 9px 16px; font-size: 13px;
          font-weight: 700; cursor: pointer;
          align-items: center; gap: 6px;
          font-family: Inter, sans-serif;
        }
        .result-count { font-size: 13px; color: #666; }
        .sort-select {
          padding: 8px 14px; border: 1.5px solid #e0f7fa;
          border-radius: 8px; font-size: 13px; color: #333;
          background: #fff; cursor: pointer;
          font-family: Inter, sans-serif; outline: none;
        }
        .sort-select:focus { border-color: #0097a7; }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .pcard {
          background: #fff; border: 1.5px solid #eee;
          border-radius: 14px; padding: 16px 14px;
          display: flex; flex-direction: column;
          align-items: center; gap: 10px;
          position: relative; cursor: pointer;
          transition: all .25s;
        }
        .pcard:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,151,167,0.15);
          border-color: #0097a7;
        }
        .pcard-badge {
          position: absolute; top: 10px; left: 10px;
          color: #fff; font-size: 9px; font-weight: 800;
          padding: 3px 10px; border-radius: 6px; letter-spacing: 0.5px;
        }
        .pcard-imgbox {
          width: 100%; height: 160px; border-radius: 10px;
          background: #f8f9fa; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .pcard-imgbox img { width: 100%; height: 100%; object-fit: cover; }
        .pcard-info { width: 100%; }
        .pcard-brand { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 0.8px; }
        .pcard-name {
          font-size: 13px; font-weight: 700; color: #111;
          margin: 4px 0 8px; line-height: 1.4;
        }
        .pcard-pricerow { display: flex; align-items: center; gap: 8px; }
        .pcard-price { font-size: 16px; font-weight: 800; color: #0097a7; }
        .pcard-old { font-size: 11px; color: #ccc; text-decoration: line-through; }
        .pcard-btn {
          width: 100%;
          background: linear-gradient(135deg, #0097a7, #00bcd4);
          border: none; border-radius: 8px;
          padding: 10px 0; font-size: 12px;
          font-weight: 700; color: #fff; cursor: pointer;
          font-family: Inter, sans-serif; transition: opacity .2s;
        }
        .pcard-btn:hover { opacity: 0.9; }
        .empty-state {
          text-align: center; padding: 60px 24px;
          background: #fff; border-radius: 12px;
        }
        .back-btn {
          display: inline-block; background: #0097a7; color: #fff;
          padding: 10px 24px; border-radius: 8px; font-size: 13px;
          font-weight: 700; cursor: pointer; border: none;
          margin-top: 16px; font-family: Inter, sans-serif;
        }
        .sidebar-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.6); z-index: 999998;
        }
        .sidebar-overlay.show { display: block; }

        /* Pagination */
        .pagination {
          display: flex; justify-content: center;
          align-items: center; gap: 8px;
          margin: 32px 0 8px; flex-wrap: wrap;
        }
        .page-numbers { display: flex; align-items: center; gap: 6px; }
        .page-btn {
          background: #fff; border: 1.5px solid #e0f7fa;
          color: #0097a7; padding: 9px 16px;
          font-size: 13px; font-weight: 700;
          border-radius: 8px; cursor: pointer;
          font-family: Inter, sans-serif; transition: all .2s;
        }
        .page-btn:hover:not(:disabled) {
          background: #0097a7; color: #fff; border-color: #0097a7;
        }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .page-num {
          background: #fff; border: 1.5px solid #e0f7fa;
          color: #0097a7; min-width: 38px; height: 38px;
          font-size: 13px; font-weight: 700;
          border-radius: 8px; cursor: pointer;
          font-family: Inter, sans-serif; transition: all .2s;
        }
        .page-num:hover { background: #e0f7fa; }
        .page-num.active {
          background: linear-gradient(135deg, #0097a7, #00bcd4);
          color: #fff; border-color: #0097a7;
          box-shadow: 0 4px 12px rgba(0,151,167,0.3);
        }
        .page-dots {
          color: #aaa; font-size: 14px; font-weight: 700; padding: 0 4px;
        }
        .page-info {
          text-align: center; font-size: 12px;
          color: #888; margin-top: 12px;
        }

        @media (max-width: 1024px) {
          .cat-body { grid-template-columns: 210px 1fr; padding: 16px 20px; }
        }
        @media (max-width: 768px) {
          .cat-body { grid-template-columns: 1fr; padding: 12px 16px; }
          .cat-header { padding: 16px 20px; }
          .cat-title { font-size: 22px; }
          .cat-sidebar {
            position: fixed;
            top: 0; left: 0;
            width: 85%; max-width: 300px;
            height: 100vh; height: 100dvh;
            z-index: 999999;
            border-radius: 0;
            transform: translateX(-110%);
            transition: transform .3s ease;
            overflow: hidden;
            display: flex; flex-direction: column;
            box-shadow: 4px 0 32px rgba(0,0,0,0.25);
            border: none;
          }
          .cat-sidebar.open { transform: translateX(0); }
          .filter-toggle { display: flex !important; }
        }
        @media (max-width: 600px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .pcard { padding: 12px 8px; }
          .pcard-imgbox { height: 130px; }
          .pcard-name { font-size: 12px; }
          .pcard-price { font-size: 14px; }
          .pagination { gap: 4px; }
          .page-btn { padding: 8px 12px; font-size: 12px; }
          .page-num { min-width: 32px; height: 32px; font-size: 12px; }
        }
      `}</style>

      <div className="cat-page">
        <div className="cat-header">
          <div className="cat-header-inner">
            <div className="cat-breadcrumb">
              <span onClick={() => navigate('/')}
                style={{ color: '#0097a7', fontWeight: 600, cursor: 'pointer' }}>
                Home
              </span>
              <span>›</span>
              <span style={{ color: '#333', fontWeight: 600 }}>{title}</span>
              {brandFilter && (
                <>
                  <span>›</span>
                  <span style={{ color: '#0097a7', fontWeight: 600 }}>{brandFilter}</span>
                </>
              )}
            </div>
            <h1 className="cat-title">{title}</h1>
            <p className="cat-count">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
              {brandFilter && ` for "${brandFilter}"`}
            </p>
            {brandFilter && (
              <button className="cat-active-filter" onClick={() => handleBrandFilter(null)}>
                {brandFilter} ✕
              </button>
            )}
          </div>
        </div>

        <div className={`sidebar-overlay ${filtersOpen ? 'show' : ''}`}
          onClick={() => setFiltersOpen(false)} />

        <div className="cat-body">
          <aside className={`cat-sidebar ${filtersOpen ? 'open' : ''}`}>
            <div style={{
              padding: '18px 20px',
              background: 'linear-gradient(135deg, #0d2b33, #0097a7)',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexShrink: 0,
            }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>Browse</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                  Categories & Filters
                </div>
              </div>
              <button onClick={() => setFiltersOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  width: 36, height: 36, borderRadius: '50%',
                  cursor: 'pointer', fontSize: 16, color: '#fff',
                  fontWeight: 700, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              <div className="sidebar-section">
                <div className="sidebar-title">📂 Categories</div>
                {allSidebarCategories.map((cat) => (
                  <div key={cat.slug}>
                    <div className={`cat-parent-link ${slug === cat.slug ? 'active' : ''}`}
                      onClick={() => handleCategoryNav(cat.slug)}>
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                    {cat.children.map((child) => (
                      <div key={child.slug}
                        className={`cat-child-link ${slug === child.slug ? 'active' : ''}`}
                        onClick={() => handleCategoryNav(child.slug)}>
                        <span className="cat-dot" />
                        {child.label}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {allInCategory.length > 0 && (
                <div className="sidebar-section">
                  <div className="sidebar-title">🏷️ Filter by Brand</div>
                  <div className={`filter-item ${!brandFilter ? 'active' : ''}`}
                    onClick={() => handleBrandFilter(null)}>
                    <span>All Brands</span>
                    <span className="filter-count">{allInCategory.length}</span>
                  </div>
                  {brands.map(b => {
                    const count = allInCategory.filter(p => p.brand === b).length;
                    return (
                      <div key={b}
                        className={`filter-item ${brandFilter === b ? 'active' : ''}`}
                        onClick={() => handleBrandFilter(b)}>
                        <span>{b}</span>
                        <span className="filter-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <main className="cat-main">
            <div className="cat-toolbar">
              <div className="toolbar-left">
                <button className="filter-toggle" onClick={() => setFiltersOpen(true)}>
                  ☰ Browse
                </button>
                <span className="result-count">
                  <strong>{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''}
                  {brandFilter && <span style={{ color: '#0097a7' }}> · {brandFilter}</span>}
                </span>
              </div>
              <select className="sort-select" value={sortBy}
                onChange={e => setSortBy(e.target.value)}>
                <option value="default">Sort: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 52, marginBottom: 12 }}>🔍</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#555', marginBottom: 6 }}>
                  No products found
                </p>
                <p style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>
                  {brandFilter
                    ? `No ${brandFilter} products here yet.`
                    : 'No products in this category yet.'}
                </p>
                {brandFilter && (
                  <button className="back-btn"
                    onClick={() => handleBrandFilter(null)}
                    style={{ marginRight: 10 }}>
                    Clear Filter
                  </button>
                )}
                <button className="back-btn" style={{ background: '#555' }}
                  onClick={() => navigate('/')}>
                  ← Back to Home
                </button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {paginatedProducts.map((p) => (
                    <div key={p.sku} className="pcard"
                      onClick={() => navigate(`/product/${p.sku}`)}>
                      {p.badge && (
                        <span className="pcard-badge"
                          style={{ background: p.badge === 'SALE' ? '#e63946' : '#0097a7' }}>
                          {p.badge}
                        </span>
                      )}
                      <div className="pcard-imgbox">
                        {p.img ? <img src={p.img} alt={p.name} />
                          : <span style={{ fontSize: 52 }}>{p.icon}</span>}
                      </div>
                      <div className="pcard-info">
                        <div className="pcard-brand">{p.brand}</div>
                        <div className="pcard-name">{p.name}</div>
                        <div className="pcard-pricerow">
                          <span className="pcard-price">{p.price}</span>
                          {p.oldPrice && <span className="pcard-old">{p.oldPrice}</span>}
                        </div>
                      </div>
                      <button className="pcard-btn"
                        onClick={(e) => { e.stopPropagation(); addToCart(p, 1); }}>
                        + Add to Cart
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <>
                    <div className="pagination">
                      <button className="page-btn"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}>
                        ← Prev
                      </button>

                      <div className="page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                          const showPage =
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                          const showDots =
                            (pageNum === currentPage - 2 && currentPage > 3) ||
                            (pageNum === currentPage + 2 && currentPage < totalPages - 2);

                          if (showDots) {
                            return <span key={pageNum} className="page-dots">···</span>;
                          }
                          if (!showPage) return null;

                          return (
                            <button key={pageNum}
                              className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                              onClick={() => goToPage(pageNum)}>
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button className="page-btn"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}>
                        Next →
                      </button>
                    </div>

                    <div className="page-info">
                      Page <strong style={{ color: '#0097a7' }}>{currentPage}</strong> of{' '}
                      <strong>{totalPages}</strong> · Showing{' '}
                      <strong>{startIdx + 1}-{Math.min(endIdx, filtered.length)}</strong> of{' '}
                      <strong>{filtered.length}</strong> products
                    </div>
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}