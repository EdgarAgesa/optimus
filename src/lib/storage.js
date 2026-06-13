import { supabase } from '../supabase';

// Parse the storage object path out of a Supabase public URL.
// e.g. ".../object/public/promo-videos/123.mp4" -> "123.mp4". Pure + testable.
export function bucketPathFromUrl(url, bucket) {
  if (!url) return null;
  const marker = `/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
}

// Remove a file from a bucket given its public URL. Returns the Supabase
// result ({ data, error }) so the caller can warn on failure. No-op (error:null)
// if the URL is unparseable. Does not throw — callers proceed with row deletion.
export async function deleteFromBucket(url, bucket) {
  const path = bucketPathFromUrl(url, bucket);
  if (!path) return { error: null };
  return supabase.storage.from(bucket).remove([path]);
}
