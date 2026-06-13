import { useState, useEffect } from 'react';

// Pure decision: returns 'autoplay' only with POSITIVE evidence it is safe;
// otherwise 'poster' (which never auto-downloads video). Exported for testing.
export function decideAutoplay() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'poster';
  const mm = window.matchMedia;

  if (mm && mm('(prefers-reduced-motion: reduce)').matches) return 'poster';

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    if (conn.saveData) return 'poster';
    if (['slow-2g', '2g', '3g'].includes(conn.effectiveType)) return 'poster';
    if (conn.effectiveType === '4g') return 'autoplay';
    // Unknown effectiveType with a connection present: fall through to viewport heuristic.
  }

  // API unavailable (Safari/Firefox/desktop): autoplay only on a wide, fine-pointer device.
  if (mm && mm('(min-width: 1024px) and (pointer: fine)').matches) return 'autoplay';
  return 'poster';
}

export default function useAutoplayAllowed() {
  const [mode, setMode] = useState('poster'); // SSR-safe default
  useEffect(() => {
    const update = () => setMode(decideAutoplay());
    update(); // re-decide after mount/hydration
    const conn = navigator.connection;
    if (conn && conn.addEventListener) {
      conn.addEventListener('change', update);
      return () => conn.removeEventListener('change', update);
    }
  }, []);
  return mode;
}
