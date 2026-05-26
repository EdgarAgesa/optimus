import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import Categories from './components/Categories';
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
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:sku" element={<ProductPage />} />
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