import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import DealsOfDay from './components/DealsOfDay';
import PopularGames from './components/PopularGames';
import CategoryBanner from './components/CategoryBanner';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import CategoryPage from './pages/CategoryPage';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import SearchOverlay from './components/SearchOverlay';
import ProductPage from './pages/ProductPage';
import AdminPage from './pages/AdminPage';



function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <CategoryBanner />
      <DealsOfDay />
      <PopularGames />
    </>
  );
}

function AppContent() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <>
      <Navbar onCartClick={() => setCartOpen(true)} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Old game category URLs now live under the unified Games page */}
        <Route path="/category/ps5-games" element={<Navigate to="/category/games" replace />} />
        <Route path="/category/ps4-games" element={<Navigate to="/category/games" replace />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:sku" element={<ProductPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Toast />
      <SearchOverlay />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;