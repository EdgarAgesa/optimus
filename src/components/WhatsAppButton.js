import React from 'react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/254759962068"
      target="_blank"
      rel="noreferrer"
      style={s.btn}
      title="Chat on WhatsApp"
    >
      <><span style={{ fontSize: 22 }}>💬</span><span style={s.label}>Need help? Chat with us</span></>
    </a>
  );
}

const s = {
  btn: {
    position: 'fixed', bottom: 24, left: 24, zIndex: 9999,
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#25D366', color: '#fff',
    borderRadius: 50, padding: '12px 20px',
    boxShadow: '0 4px 16px rgba(37,211,102,0.4)',
    fontWeight: 600, fontSize: 13,
    textDecoration: 'none',
  },
  label: { whiteSpace: 'nowrap' },
};