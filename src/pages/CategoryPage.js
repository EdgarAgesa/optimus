/* eslint-disable react-hooks/exhaustive-deps */
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import '../styles/CategoryPage.css';

const categoryMap = {
  // 'PS5 Games' / 'PS4 Games' kept until DB rows are migrated to 'Games'
  'games':              ['Games', 'PS5 Games', 'PS4 Games'],
  'gaming-consoles':    ['Gaming Consoles'],
  'gaming-accessories': ['Gaming Accessories'],
  'gaming':             ['Games', 'PS5 Games', 'PS4 Games', 'Gaming Consoles', 'Gaming Accessories'],
  'smartphones':        ['Smartphones'],
  'phones':             ['Smartphones'],
  'laptops':            ['Laptops'],
  'headphones':         ['Headphones'],
  'earbuds':            ['Earbuds'],
  'bluetooth-speakers': ['Bluetooth Speakers'],
  'audio':              ['Headphones', 'Earbuds', 'Bluetooth Speakers'],
  'televisions':        ['Televisions'],
  'streaming-devices':  ['Streaming Devices'],
  'tv-streaming':       ['Televisions', 'Streaming Devices'],
  'soundbars':          ['Soundbars'],
  'tablets':            ['Tablets'],
};

const slugToTitle = {
  'games':              'Games',
  'gaming-consoles':    'Gaming Consoles',
  'gaming-accessories': 'Gaming Accessories',
  'gaming':             'Gaming',
  'smartphones':        'Smartphones',
  'phones':             'Phones',
  'laptops':            'Laptops',
  'headphones':         'Headphones',
  'earbuds':            'Earbuds',
  'bluetooth-speakers': 'Bluetooth Speakers',
  'audio':              'Audio & Sound',
  'televisions':        'Televisions',
  'streaming-devices':  'Streaming Devices',
  'tv-streaming':       'TV & Streaming',
  'soundbars':          'Soundbars',
  'tablets':            'Tablets',
};

const allSidebarCategories = [
  {
    label: 'Gaming', slug: 'gaming', icon: '🎮',
    children: [
      { label: 'Games', slug: 'games' },
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
    <Helmet>
      <title>{title} — Optimus Sphere Tech</title>
      <meta name="description" content={`Shop ${title.toLowerCase()} at Optimus Sphere Tech Nairobi. ${filtered.length} products available with warranty and free delivery.`} />
    </Helmet>

      <div className="cat-page">
        <div className="cat-header">
          <div className="cat-header-inner">
            <div className="cat-breadcrumb">
              <span onClick={() => navigate('/')} className="cat-bc-home">
                Home
              </span>
              <span>›</span>
              <span className="cat-bc-current">{title}</span>
              {brandFilter && (
                <>
                  <span>›</span>
                  <span className="cat-bc-brand">{brandFilter}</span>
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
            <div className="cat-sidebar-header">
              <div>
                <div className="cat-sidebar-header-title">Browse</div>
                <div className="cat-sidebar-header-sub">
                  Categories & Filters
                </div>
              </div>
              <button onClick={() => setFiltersOpen(false)} className="cat-sidebar-close">✕</button>
            </div>

            <div className="cat-sidebar-scroll">
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
                  {brandFilter && <span className="cat-result-brand"> · {brandFilter}</span>}
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
                <div className="cat-empty-icon">🔍</div>
                <p className="cat-empty-title">No products found</p>
                <p className="cat-empty-sub">
                  {brandFilter
                    ? `No ${brandFilter} products here yet.`
                    : 'No products in this category yet.'}
                </p>
                {brandFilter && (
                  <button className="back-btn back-btn--spaced"
                    onClick={() => handleBrandFilter(null)}>
                    Clear Filter
                  </button>
                )}
                <button className="back-btn back-btn--dark"
                  onClick={() => navigate('/')}>
                  ← Back to Home
                </button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {paginatedProducts.map((p) => (
                    <div key={p.sku} className="pcard"
                      onClick={() => navigate(`/product/${encodeURIComponent(p.sku)}`)}>
                      {p.badge && (
                        <span className="pcard-badge"
                          style={{ background: p.badge === 'SALE' ? '#e63946' : '#0097a7' }}>
                          {p.badge}
                        </span>
                      )}
                      <div className="pcard-imgbox">
                        {p.img ? <img src={p.img} alt={p.name} />
                          : <span className="pcard-emoji">{p.icon}</span>}
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
                      Page <strong className="page-info-current">{currentPage}</strong> of{' '}
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
