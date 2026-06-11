// Fetches one real product SKU so the baseline can include a product page.
// Uses the same public anon credentials as src/supabase.js.
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bnpyphkohtlmmspwxbkb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucHlwaGtvaHRsbW1zcHd4YmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDczMDAsImV4cCI6MjA5NTQyMzMwMH0.FhhlVZEjdwyu2jEc3mGzicGDxAroi0F7h-pVYk-p0iU'
);

(async () => {
  const { data, error } = await supabase.from('products').select('sku').limit(1);
  if (error || !data?.length) { console.error('no sku', error); process.exit(1); }
  console.log(encodeURIComponent(data[0].sku));
})();
