import React from 'react';
import { useCart } from '../context/CartContext';
import '../styles/Toast.css';

export default function Toast() {
  const { toast } = useCart();
  if (!toast) return null;

  return <div className="toast">✅ {toast.msg}</div>;
}
