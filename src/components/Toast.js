import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircleIcon } from './icons';

// Semantic states (spec 4): success = teal. CartContext currently emits only
// success toasts ({ msg }); a future { type } field maps error->accent, warn->warn.
const styles = {
  success: 'border-teal-500 text-teal-500',
  error: 'border-accent text-accent',
  warning: 'border-warn text-warn',
};

export default function Toast() {
  const { toast } = useCart();
  if (!toast) return null;
  const tone = styles[toast.type] || styles.success;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-ink-800 border ${tone} rounded-full px-5 py-3 font-sans text-body`} role="status">
      <CheckCircleIcon className="w-5 h-5" />
      <span className="text-fg-hi">{toast.msg}</span>
    </div>
  );
}
