import React from 'react';
import { ChatIcon } from './icons';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/254759962068"
      target="_blank"
      rel="noreferrer"
      title="Chat on WhatsApp"
      className="fixed bottom-6 right-4 z-40 flex items-center gap-2 bg-whatsapp text-ink-950 text-body font-medium rounded-full px-4 py-3 min-h-11 font-sans"
    >
      <ChatIcon className="w-5 h-5" />
      <span className="hidden sm:inline">Need help? Chat with us</span>
    </a>
  );
}
