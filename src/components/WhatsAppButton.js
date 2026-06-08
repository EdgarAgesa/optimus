import React from 'react';
import '../styles/WhatsAppButton.css';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/254759962068"
      target="_blank"
      rel="noreferrer"
      className="wa-float-btn"
      title="Chat on WhatsApp"
    >
      <span className="wa-float-icon">💬</span>
      <span className="wa-float-label">Need help? Chat with us</span>
    </a>
  );
}
