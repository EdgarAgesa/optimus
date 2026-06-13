import { bucketPathFromUrl } from './storage';

test('extracts the object path from a public URL', () => {
  const url = 'https://abc.supabase.co/storage/v1/object/public/promo-videos/123-xyz.mp4';
  expect(bucketPathFromUrl(url, 'promo-videos')).toBe('123-xyz.mp4');
});

test('decodes percent-encoded paths', () => {
  const url = 'https://abc.supabase.co/storage/v1/object/public/promo-videos/my%20clip.mp4';
  expect(bucketPathFromUrl(url, 'promo-videos')).toBe('my clip.mp4');
});

test('returns null when bucket marker is absent', () => {
  expect(bucketPathFromUrl('https://example.com/x.mp4', 'promo-videos')).toBeNull();
  expect(bucketPathFromUrl('', 'promo-videos')).toBeNull();
});
