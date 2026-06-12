import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { SearchIcon } from './icons';
import ProductCard from './ProductCard';

export default function SearchOverlay() {
  const { searchQuery, searchResults, searchOpen, clearSearch, addToCart } = useCart();
  const navigate = useNavigate();

  if (!searchOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-ink-950/80 z-40" onClick={clearSearch} />

      <div className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-screen-lg z-50 px-4">
        <div className="bg-ink-900 border border-edge rounded-xl flex flex-col overflow-hidden font-sans max-h-96 md:max-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-edge">
            <div>
              <div className="text-card-title text-fg-hi">
                {searchResults.length > 0
                  ? <><span className="text-teal-500">{searchResults.length}</span> results for "{searchQuery}"</>
                  : <>Searching for "{searchQuery}"</>
                }
              </div>
              <div className="text-micro text-fg-low mt-1">
                {searchResults.length > 0 ? 'Click a product to view details' : 'Try a different keyword'}
              </div>
            </div>
            <button onClick={clearSearch} aria-label="Close search"
              className="bg-transparent border-0 cursor-pointer text-fg-hi text-card-title min-w-11 min-h-11">✕</button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-4">
            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <SearchIcon className="w-12 h-12 mx-auto text-fg-low" />
                <p className="text-card-title text-fg-hi mt-4">No results for "{searchQuery}"</p>
                <p className="text-body text-fg-low mt-1">Try searching by brand, product name, or category</p>
                <p className="text-micro text-fg-low mt-1">e.g. "Sony", "PS5", "JBL", "iPhone"</p>
                <button onClick={() => { clearSearch(); navigate('/'); }}
                  className="mt-6 bg-transparent text-fg-hi text-body border border-edge rounded-full px-6 py-3 cursor-pointer min-h-11">
                  ← Browse all products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.slice(0, 12).map(p => (
                  <ProductCard
                    key={p.sku}
                    product={p}
                    onOpen={() => { navigate(`/product/${encodeURIComponent(p.sku)}`); clearSearch(); }}
                    onAddToCart={(prod) => { addToCart(prod, 1); clearSearch(); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
