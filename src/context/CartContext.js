import React, { createContext, useContext, useState, useEffect } from 'react';
import products from '../data/products';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('optimus-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  // ── Search state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('optimus-cart', JSON.stringify(cart));
  }, [cart]);

  const showToast = (msg) => {
    setToast({ msg });
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.sku === product.sku);
      if (existing) {
        showToast('Updated quantity in cart');
        return prev.map(item =>
          item.sku === product.sku
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      showToast(`✓ ${product.name} added to cart`);
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (sku) => {
    setCart(prev => prev.filter(item => item.sku !== sku));
    showToast('Item removed from cart');
  };

  const updateQty = (sku, qty) => {
    if (qty < 1) return removeFromCart(sku);
    setCart(prev =>
      prev.map(item => item.sku === sku ? { ...item, qty } : item)
    );
  };

  const clearCart = () => {
    setCart([]);
    showToast('Cart cleared');
  };

  // ── Search handler ──
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    const q = query.toLowerCase();
    const results = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
    setSearchResults(results);
    setSearchOpen(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const cartTotal = cart.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/\D/g, ''));
    return sum + price * item.qty;
  }, 0);

  const formatPrice = (n) => `KSh ${n.toLocaleString()}`;

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart,
      updateQty, clearCart,
      cartCount, cartTotal, formatPrice, toast,
      searchQuery, searchResults, searchOpen,
      handleSearch, clearSearch, setSearchOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}