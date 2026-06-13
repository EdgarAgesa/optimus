import { readCachedPromo, writeCachedPromo } from './promoCache';

beforeEach(() => localStorage.clear());

test('write then read round-trips', () => {
  writeCachedPromo({ id: '1', title: 'X' });
  expect(readCachedPromo()).toEqual({ id: '1', title: 'X' });
});
test('read returns null when empty', () => {
  expect(readCachedPromo()).toBeNull();
});
test('writeCachedPromo(null) clears the cache', () => {
  writeCachedPromo({ id: '1' });
  writeCachedPromo(null);
  expect(readCachedPromo()).toBeNull();
});
test('read tolerates corrupt JSON', () => {
  localStorage.setItem('optimus-promo', '{not json');
  expect(readCachedPromo()).toBeNull();
});
