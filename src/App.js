import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import DealsOfDay from './components/DealsOfDay';
import CategoryBanner from './components/CategoryBanner';
import FeaturedProducts from './components/FeaturedProducts';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import CategoryPage from './components/CategoryPage';

function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <DealsOfDay />
      <CategoryBanner />
      <FeaturedProducts />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
    </BrowserRouter>
  );
}

export default App;