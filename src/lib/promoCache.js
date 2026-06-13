// Stale-while-revalidate cache for the active promo so a return visit during a
// promo week can render PromoHero on first paint (no carousel-first swap).
const KEY = 'optimus-promo';

export function readCachedPromo() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCachedPromo(promo) {
  try {
    if (typeof localStorage === 'undefined') return;
    if (promo) localStorage.setItem(KEY, JSON.stringify(promo));
    else localStorage.removeItem(KEY);
  } catch {
    /* private mode / quota — cache is best-effort */
  }
}
