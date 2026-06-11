/* eslint-disable react-hooks/exhaustive-deps */
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

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

      <div className="bg-ink-900 min-h-screen font-sans">
        {/* Header */}
        <div className="bg-ink-950 border-b border-edge">
          <div className="max-w-screen-xl mx-auto px-4 py-8">
            <div className="flex items-center gap-2 text-body text-fg-low">
              <span onClick={() => navigate('/')} className="cursor-pointer hover:text-fg-hi">Home</span>
              <span>›</span>
              <span className="text-fg-mid">{title}</span>
              {brandFilter && (
                <>
                  <span>›</span>
                  <span className="text-teal-500">{brandFilter}</span>
                </>
              )}
            </div>
            <h1 className="text-display text-fg-hi mt-2">{title}</h1>
            <p className="text-body text-fg-low mt-1">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
              {brandFilter && ` for "${brandFilter}"`}
            </p>
            {brandFilter && (
              <button
                onClick={() => handleBrandFilter(null)}
                className="inline-flex items-center gap-1 mt-3 bg-teal-500 text-ink-950 text-label uppercase rounded-full px-3 py-1 border-0 cursor-pointer min-h-11"
              >
                {brandFilter} ✕
              </button>
            )}
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {filtersOpen && (
          <div className="fixed inset-0 bg-ink-950/80 z-40 md:hidden" onClick={() => setFiltersOpen(false)} />
        )}

        <div className="max-w-screen-xl mx-auto px-4 py-6 md:flex md:gap-6">
          {/* Sidebar: mobile drawer / desktop static rail */}
          <aside
            className={`fixed top-0 left-0 h-full w-72 bg-ink-950 border-r border-edge z-50 flex flex-col transition-transform duration-300 md:static md:h-auto md:w-56 md:shrink-0 md:bg-transparent md:border-0 md:translate-x-0 ${filtersOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex md:hidden items-center justify-between px-4 py-4 border-b border-edge">
              <div>
                <div className="text-card-title text-fg-hi">Browse</div>
                <div className="text-micro text-fg-low">Categories &amp; Filters</div>
              </div>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters"
                className="bg-transparent border-0 cursor-pointer text-fg-hi text-card-title min-w-11 min-h-11">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto md:overflow-visible p-4 md:p-0">
              <div>
                <div className="text-label uppercase text-fg-low mb-2">Categories</div>
                {allSidebarCategories.map((cat) => (
                  <div key={cat.slug}>
                    <div
                      onClick={() => handleCategoryNav(cat.slug)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-body cursor-pointer min-h-11 ${slug === cat.slug ? 'bg-ink-800 text-teal-500' : 'text-fg-mid hover:text-fg-hi'}`}
                    >
                      <span aria-hidden="true">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                    {cat.children.map((child) => (
                      <div
                        key={child.slug}
                        onClick={() => handleCategoryNav(child.slug)}
                        className={`flex items-center gap-2 pl-8 pr-3 py-2 rounded-lg text-body cursor-pointer min-h-11 ${slug === child.slug ? 'bg-ink-800 text-teal-500' : 'text-fg-low hover:text-fg-hi'}`}
                      >
                        <span className="w-1 h-1 rounded-full bg-fg-low" aria-hidden="true" />
                        {child.label}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {allInCategory.length > 0 && (
                <div className="mt-6">
                  <div className="text-label uppercase text-fg-low mb-2">Filter by Brand</div>
                  <div
                    onClick={() => handleBrandFilter(null)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-body cursor-pointer min-h-11 ${!brandFilter ? 'bg-ink-800 text-teal-500' : 'text-fg-mid hover:text-fg-hi'}`}
                  >
                    <span>All Brands</span>
                    <span className="text-micro text-fg-low">{allInCategory.length}</span>
                  </div>
                  {brands.map(b => {
                    const count = allInCategory.filter(p => p.brand === b).length;
                    return (
                      <div
                        key={b}
                        onClick={() => handleBrandFilter(b)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-body cursor-pointer min-h-11 ${brandFilter === b ? 'bg-ink-800 text-teal-500' : 'text-fg-mid hover:text-fg-hi'}`}
                      >
                        <span>{b}</span>
                        <span className="text-micro text-fg-low">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {/* Mobile brand pills (spec 5: pill-tab filter row) */}
            {allInCategory.length > 0 && (
              <div className="flex md:hidden gap-2 overflow-x-auto snap-x scroll-pl-4 pb-3 -mx-4 px-4">
                <button
                  onClick={() => handleBrandFilter(null)}
                  className={`snap-start shrink-0 rounded-full px-4 py-2 text-body min-h-11 cursor-pointer ${!brandFilter ? 'bg-teal-500 text-ink-950 font-medium border-0' : 'bg-transparent text-fg-mid border border-edge'}`}
                >
                  All Brands
                </button>
                {brands.map(b => (
                  <button
                    key={b}
                    onClick={() => handleBrandFilter(b)}
                    className={`snap-start shrink-0 rounded-full px-4 py-2 text-body min-h-11 cursor-pointer ${brandFilter === b ? 'bg-teal-500 text-ink-950 font-medium border-0' : 'bg-transparent text-fg-mid border border-edge'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="md:hidden bg-transparent text-fg-hi text-body border border-edge rounded-full px-4 py-2 cursor-pointer min-h-11"
                >
                  ☰ Browse
                </button>
                <span className="text-body text-fg-mid">
                  <strong className="text-fg-hi">{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''}
                  {brandFilter && <span className="text-fg-low"> · {brandFilter}</span>}
                </span>
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-ink-800 border border-edge rounded-full text-body text-fg-hi px-4 h-11 outline-none cursor-pointer"
              >
                <option value="default">Sort: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-display" aria-hidden="true">🔍</div>
                <p className="text-card-title text-fg-hi mt-4">No products found</p>
                <p className="text-body text-fg-low mt-1">
                  {brandFilter
                    ? `No ${brandFilter} products here yet.`
                    : 'No products in this category yet.'}
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  {brandFilter && (
                    <button
                      onClick={() => handleBrandFilter(null)}
                      className="bg-teal-500 active:bg-teal-600 text-ink-950 text-body font-medium border-0 rounded-full px-6 py-3 cursor-pointer min-h-11"
                    >
                      Clear Filter
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/')}
                    className="bg-transparent text-fg-hi text-body border border-edge rounded-full px-6 py-3 cursor-pointer min-h-11"
                  >
                    ← Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map((p) => (
                    <ProductCard
                      key={p.sku}
                      product={p}
                      onOpen={() => navigate(`/product/${encodeURIComponent(p.sku)}`)}
                      onAddToCart={(prod) => addToCart(prod, 1)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <>
                    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="bg-transparent text-fg-mid text-body border border-edge rounded-full px-4 min-h-11 cursor-pointer disabled:opacity-50"
                      >
                        ← Prev
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                          const showPage =
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                          const showDots =
                            (pageNum === currentPage - 2 && currentPage > 3) ||
                            (pageNum === currentPage + 2 && currentPage < totalPages - 2);

                          if (showDots) {
                            return <span key={pageNum} className="text-fg-low px-2">···</span>;
                          }
                          if (!showPage) return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`min-w-11 min-h-11 rounded-full text-body cursor-pointer ${currentPage === pageNum ? 'bg-teal-500 text-ink-950 font-medium border-0' : 'bg-transparent text-fg-mid border border-edge'}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="bg-transparent text-fg-mid text-body border border-edge rounded-full px-4 min-h-11 cursor-pointer disabled:opacity-50"
                      >
                        Next →
                      </button>
                    </div>

                    <div className="text-body text-fg-low text-center mt-4">
                      Page <strong className="text-teal-500">{currentPage}</strong> of{' '}
                      <strong className="text-fg-hi">{totalPages}</strong> · Showing{' '}
                      <strong className="text-fg-hi">{startIdx + 1}-{Math.min(endIdx, filtered.length)}</strong> of{' '}
                      <strong className="text-fg-hi">{filtered.length}</strong> products
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
