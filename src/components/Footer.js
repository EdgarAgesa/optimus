import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PinIcon, PhoneCallIcon, CardIcon, BagIcon, ChatIcon, HeartIcon } from './icons';

export default function Footer() {
  const navigate = useNavigate();

  const shopLinks = [
    { label: 'Gaming', slug: 'gaming' },
    { label: 'Phones', slug: 'phones' },
    { label: 'Laptops', slug: 'laptops' },
    { label: 'Audio & Sound', slug: 'audio' },
    { label: 'TV & Streaming', slug: 'tv-streaming' },
  ];

  return (
    <footer className="bg-ink-950 border-t border-edge font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-screen-xl mx-auto px-4 py-12">
        {/* Brand */}
        <div>
          <button onClick={() => navigate('/')} className="flex items-center bg-transparent border-0 cursor-pointer p-0">
            {/* Full lockup (icon + wordmark) on the dark footer — transparent PNG, no box. */}
            <img src="/images/optimus-logo-transparent.png" alt="Optimus Sphere Tech" width="256" height="165" className="w-64 max-w-full h-auto object-contain" loading="lazy" decoding="async" />
          </button>
          <p className="text-body text-fg-low mt-4">
            Nairobi's premier tech store for gaming, phones, laptops, audio & TVs. Only original products. No fakes.
          </p>
          <a href="https://wa.me/254759962068" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-whatsapp text-ink-950 text-body font-medium rounded-full px-5 py-2 min-h-11 mt-4">
            <ChatIcon className="w-5 h-5" /> Chat on WhatsApp
          </a>
        </div>

        {/* Location */}
        <div>
          <h4 className="flex items-center gap-2 text-label uppercase text-fg-hi mb-3">
            <PinIcon className="w-4 h-4 text-teal-500" /> Find Us
          </h4>
          <p className="text-body text-fg-low">Mithoo Biashara Centre</p>
          <p className="text-body text-fg-low">Opposite Bazaar Shop</p>
          <p className="text-body text-fg-low">Basement B69, Nairobi</p>
          <p className="text-body text-fg-mid mt-2">Mon–Sat: 8am – 7pm</p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="flex items-center gap-2 text-label uppercase text-fg-hi mb-3">
            <PhoneCallIcon className="w-4 h-4 text-teal-500" /> Contact Us
          </h4>
          <a href="tel:0759962068" className="block text-body text-fg-low hover:text-fg-hi min-h-11 leading-loose">0759 962 068</a>
          <a href="tel:0757255539" className="block text-body text-fg-low hover:text-fg-hi min-h-11 leading-loose">0757 255 539</a>
          <h4 className="flex items-center gap-2 text-label uppercase text-fg-hi mb-2 mt-4">
            <CardIcon className="w-4 h-4 text-teal-500" /> We Accept
          </h4>
          <p className="text-body text-fg-low">M-Pesa · Cash · Card</p>
        </div>

        {/* Shop links */}
        <div>
          <h4 className="flex items-center gap-2 text-label uppercase text-fg-hi mb-3">
            <BagIcon className="w-4 h-4 text-teal-500" /> Shop
          </h4>
          {shopLinks.map(l => (
            <button key={l.slug} onClick={() => navigate(`/category/${l.slug}`)}
              className="block bg-transparent border-0 cursor-pointer text-left text-body text-fg-low hover:text-fg-hi min-h-11 p-0">
              → {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-edge">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-screen-xl mx-auto px-4 py-5 text-micro text-fg-low">
          <span>© 2025 Optimus Sphere Tech. All rights reserved.</span>
          <span className="flex items-center gap-1">Made with <HeartIcon className="w-3.5 h-3.5 text-accent" /> in Nairobi, Kenya</span>
        </div>
      </div>
    </footer>
  );
}
