import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import localProducts from '../data/products';

export function useProducts() {
  const [products, setProducts] = useState(localProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map(p => ({
          sku: p.sku,
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: p.price,
          oldPrice: p.old_price || null,
          badge: p.badge || null,
          description: p.description || '',
          icon: p.icon || '📦',
          tags: p.tags || [],
          specs: p.specs || [],
          img: p.images && p.images.length > 0 ? p.images[0] : null,
          images: p.images || [],
        }));
        const supabaseSkus = mapped.map(p => p.sku);
        const filteredLocal = localProducts.filter(p => !supabaseSkus.includes(p.sku));
        setProducts([...mapped, ...filteredLocal]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return { products, loading };
}