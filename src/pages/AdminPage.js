import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const CATEGORY_DATA = {
  'Gaming Consoles': { parent: 'Gaming', brands: ['Sony', 'Microsoft', 'Nintendo'] },
  'PS5 Games': { parent: 'Gaming', brands: ['Sony', 'Pearl Abyss', 'Sucker Punch', 'Ubisoft', 'EA', 'Activision'] },
  'PS4 Games': { parent: 'Gaming', brands: ['Sony', 'Pearl Abyss', 'Sucker Punch', 'Ubisoft', 'EA', 'Activision'] },
  'Smartphones': { parent: 'Phones', brands: ['Apple', 'Samsung', 'Google', 'Nothing', 'Redmi', 'Xiaomi'] },
  'Tablets': { parent: 'Phones', brands: ['Apple', 'Samsung', 'Modio'] },
  'Laptops': { parent: 'Laptops', brands: ['HP', 'Lenovo', 'Dell', 'Apple', 'Asus', 'Acer'] },
  'Headphones': { parent: 'Audio & Sound', brands: ['Sony', 'JBL', 'Beats', 'Soundcore', 'Bose'] },
  'Earbuds': { parent: 'Audio & Sound', brands: ['Samsung', 'Apple', 'Oraimo', 'Soundcore', 'OnePlus', 'JBL'] },
  'Bluetooth Speakers': { parent: 'Audio & Sound', brands: ['JBL', 'Sony', 'Oraimo', 'Soundcore', 'Harman Kardon', 'Beats'] },
  'Soundbars': { parent: 'Audio & Sound', brands: ['JBL', 'Sony', 'Samsung', 'TCL', 'Hisense'] },
  'Televisions': { parent: 'TV & Streaming', brands: ['TCL', 'Samsung', 'LG', 'Hisense', 'Vitron'] },
};

const BADGES = ['', 'SALE', 'NEW', 'HOT'];
const HERO_CATEGORIES = [
  { value: 'gaming', label: 'Gaming' },
  { value: 'gaming-consoles', label: 'Gaming Consoles' },
  { value: 'ps5-games', label: 'PS5 Games' },
  { value: 'ps4-games', label: 'PS4 Games' },
  { value: 'phones', label: 'Phones' },
  { value: 'smartphones', label: 'Smartphones' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'audio', label: 'Audio & Sound' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'tv-streaming', label: 'TV & Streaming' },
];

const emptySpec = () => ({ label: '', value: '' });

// ── Custom Select ──
function CustomSelect({ value, onChange, options, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          border: `1.5px solid ${open ? '#0097a7' : '#e0e0e0'}`,
          borderRadius: 8,
          padding: '11px 14px',
          fontSize: 16,
          fontFamily: 'Inter, sans-serif',
          color: selected ? '#111' : '#aaa',
          background: '#fff',
          boxSizing: 'border-box',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
          minHeight: 46,
        }}
      >
        <span style={{
          overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', flex: 1,
        }}>
          {selected ? selected.label : placeholder}
        </span>
        <span style={{
          fontSize: 10, color: '#0097a7', marginLeft: 8, flexShrink: 0,
          display: 'inline-block',
          transition: 'transform .2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
        }}>▼</span>
      </div>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              zIndex: 9990, background: 'transparent',
            }}
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0, right: 0,
            background: '#fff',
            border: '1.5px solid #e0f7fa',
            borderTop: '3px solid #0097a7',
            borderRadius: '0 0 12px 12px',
            boxShadow: '0 16px 48px rgba(0,151,167,0.18)',
            zIndex: 9999,
            maxHeight: 280,
            overflowY: 'auto',
          }}>
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  padding: '13px 16px',
                  fontSize: 15,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  color: opt.value === value ? '#0097a7' : '#333',
                  fontWeight: opt.value === value ? 700 : 400,
                  background: opt.value === value ? '#e0f7fa' : '#fff',
                  borderBottom: '1px solid #f5f5f5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{opt.label}</span>
                {opt.value === value && (
                  <span style={{ color: '#0097a7', fontSize: 16 }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  // Products
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    sku: '', name: '', brand: '', category: '',
    price: '', old_price: '', badge: '',
    description: '', icon: '📦', tags: '',
  });
  const [specs, setSpecs] = useState([emptySpec()]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Hero
  const [heroSlides, setHeroSlides] = useState([]);
  const [showHeroForm, setShowHeroForm] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [heroForm, setHeroForm] = useState({
    title: '', subtitle: '', tag: '',
    price: '', features: '', category_slug: '', sort_order: '1',
  });
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [savingHero, setSavingHero] = useState(false);

  // Deals
  const [deals, setDeals] = useState([]);
  const [dealSku, setDealSku] = useState('');
  const [savingDeal, setSavingDeal] = useState(false);

  // ── Auth ──
  const handleLogin = async () => {
    setLoginError('');
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
    if (error || !data) {
      setLoginError('Invalid username or password');
      return;
    }
    setAuthed(true);
    loadProducts();
    loadHeroSlides();
    loadDeals();
  };

  // ── Load ──
  const loadProducts = async () => {
    setLoadingProducts(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoadingProducts(false);
  };

  const loadHeroSlides = async () => {
    const { data } = await supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order');
    setHeroSlides(data || []);
  };

  const loadDeals = async () => {
    const { data } = await supabase
      .from('deals')
      .select(`
        id, sort_order, product_sku,
        products (
          id, sku, name, brand, category,
          price, old_price, badge, images, icon
        )
      `)
      .order('sort_order');
    setDeals(data || []);
  };

  // ── Upload image ──
  const uploadImage = async (file, bucket) => {
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
    return data.publicUrl;
  };

  // ── Spec helpers ──
  const addSpec = () => setSpecs([...specs, emptySpec()]);
  const removeSpec = (i) => setSpecs(specs.filter((_, idx) => idx !== i));
  const updateSpec = (i, field, val) => {
    const updated = [...specs];
    updated[i] = { ...updated[i], [field]: val };
    setSpecs(updated);
  };

  // ── Save product ──
  const handleSaveProduct = async () => {
    if (!productForm.sku || !productForm.name || !productForm.category || !productForm.price) {
      alert('SKU, name, category and price are required');
      return;
    }
    setSavingProduct(true);
    try {
      let imageUrls = [...existingImages];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        const uploads = await Promise.all(
          imageFiles.map(f => uploadImage(f, 'product-images'))
        );
        imageUrls = [...imageUrls, ...uploads];
        setUploadingImages(false);
      }
      const validSpecs = specs.filter(s => s.label.trim() && s.value.trim());
      const tagsArr = productForm.tags
        ? productForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
      const payload = {
        sku: productForm.sku,
        name: productForm.name,
        brand: productForm.brand,
        category: productForm.category,
        price: productForm.price,
        old_price: productForm.old_price || null,
        badge: productForm.badge || null,
        description: productForm.description,
        icon: productForm.icon || '📦',
        tags: tagsArr,
        specs: validSpecs,
        images: imageUrls,
      };
      if (editingProduct) {
        await supabase.from('products').update(payload).eq('id', editingProduct.id);
      } else {
        await supabase.from('products').insert(payload);
      }
      resetProductForm();
      loadProducts();
    } catch (err) {
      alert('Error saving product: ' + err.message);
    }
    setSavingProduct(false);
  };

  const resetProductForm = () => {
    setProductForm({
      sku: '', name: '', brand: '', category: '',
      price: '', old_price: '', badge: '',
      description: '', icon: '📦', tags: '',
    });
    setSpecs([emptySpec()]);
    setImageFiles([]);
    setExistingImages([]);
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleEditProduct = (p) => {
    setEditingProduct(p);
    setProductForm({
      sku: p.sku, name: p.name, brand: p.brand,
      category: p.category, price: p.price,
      old_price: p.old_price || '',
      badge: p.badge || '',
      description: p.description || '',
      icon: p.icon || '📦',
      tags: (p.tags || []).join(', '),
    });
    setSpecs(p.specs && p.specs.length > 0 ? p.specs : [emptySpec()]);
    setExistingImages(p.images || []);
    setShowProductForm(true);
    window.scrollTo(0, 0);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadProducts();
  };

  const removeExistingImage = (idx) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };

  // ── Save hero ──
  const handleSaveHero = async () => {
    if (!heroForm.title) { alert('Title is required'); return; }
    setSavingHero(true);
    try {
      let imageUrl = editingHero?.image || '';
      if (heroImageFile) {
        imageUrl = await uploadImage(heroImageFile, 'hero-images');
      }
      const payload = {
        title: heroForm.title,
        subtitle: heroForm.subtitle,
        tag: heroForm.tag,
        price: heroForm.price,
        features: heroForm.features
          ? heroForm.features.split(',').map(f => f.trim()).filter(Boolean)
          : [],
        category_slug: heroForm.category_slug,
        sort_order: parseInt(heroForm.sort_order) || 1,
        image: imageUrl,
      };
      if (editingHero) {
        await supabase.from('hero_slides').update(payload).eq('id', editingHero.id);
      } else {
        await supabase.from('hero_slides').insert(payload);
      }
      setHeroForm({ title: '', subtitle: '', tag: '', price: '', features: '', category_slug: '', sort_order: '1' });
      setHeroImageFile(null);
      setEditingHero(null);
      setShowHeroForm(false);
      loadHeroSlides();
    } catch (err) {
      alert('Error saving hero: ' + err.message);
    }
    setSavingHero(false);
  };

  const handleEditHero = (slide) => {
    setEditingHero(slide);
    setHeroForm({
      title: slide.title,
      subtitle: slide.subtitle || '',
      tag: slide.tag || '',
      price: slide.price || '',
      features: (slide.features || []).join(', '),
      category_slug: slide.category_slug || '',
      sort_order: String(slide.sort_order || 1),
    });
    setShowHeroForm(true);
    window.scrollTo(0, 0);
  };

  const handleDeleteHero = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    await supabase.from('hero_slides').delete().eq('id', id);
    loadHeroSlides();
  };

  // ── Deals ──
  const handleAddDeal = async () => {
    if (!dealSku) return;
    setSavingDeal(true);
    const prod = products.find(p => p.sku === dealSku);
    if (!prod) { alert('Product not found'); setSavingDeal(false); return; }
    await supabase.from('deals').insert({ product_sku: dealSku, sort_order: deals.length });
    setDealSku('');
    loadDeals();
    setSavingDeal(false);
  };

  const handleDeleteDeal = async (id) => {
    await supabase.from('deals').delete().eq('id', id);
    loadDeals();
  };

  const currentBrands = productForm.category
    ? (CATEGORY_DATA[productForm.category]?.brands || [])
    : [];

  // ── Login ──
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: '#f5f6fa',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 20,
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          background: '#fff', borderRadius: 16,
          padding: 32, width: '100%', maxWidth: 380,
          boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <img src="/images/logo.png" alt="logo"
              style={{ height: 56, marginBottom: 12, objectFit: 'contain' }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0d2b33' }}>Admin Panel</h2>
            <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Optimus Sphere Tech</p>
          </div>
          <label style={labelStyle}>Username</label>
          <input style={inputStyle} placeholder="admin"
            value={username} onChange={e => setUsername(e.target.value)} />
          <label style={{ ...labelStyle, marginTop: 14 }}>Password</label>
          <input type="password" style={inputStyle} placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} />
          {loginError && (
            <p style={{ color: '#e63946', fontSize: 12, marginTop: 8 }}>{loginError}</p>
          )}
          <button onClick={handleLogin}
            style={{ ...primaryBtn, width: '100%', marginTop: 20, padding: '14px 0', fontSize: 15 }}>
            Login
          </button>
          <button onClick={() => navigate('/')}
            style={{ ...cancelBtn, width: '100%', marginTop: 10, padding: '12px 0' }}>
            ← Back to Store
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        .admin-tabs-bar {
          background: #fff; border-bottom: 1px solid #eee;
          overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .admin-tabs-bar::-webkit-scrollbar { display: none; }
        .admin-tabs-inner { display: flex; padding: 0 14px; min-width: max-content; }
        .admin-tab-btn {
          padding: 14px 16px; border: none; background: none;
          font-size: 13px; font-weight: 700; cursor: pointer;
          white-space: nowrap; font-family: Inter, sans-serif;
          border-bottom: 3px solid transparent;
          transition: color .15s, border-color .15s;
        }
        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px; margin-bottom: 16px;
        }
        .field-group { display: flex; flex-direction: column; }
        .field-group label {
          font-size: 10px; font-weight: 700; color: #888;
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
        }
        .spec-row {
          display: grid; grid-template-columns: 1fr 1fr 40px;
          gap: 8px; margin-bottom: 8px; align-items: center;
        }
        .img-preview { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .img-thumb { position: relative; width: 64px; height: 64px; flex-shrink: 0; }
        .img-thumb img {
          width: 100%; height: 100%; object-fit: cover;
          border-radius: 8px; border: 1px solid #eee;
        }
        .img-thumb-del {
          position: absolute; top: -6px; right: -6px;
          background: #e63946; color: #fff; border: none;
          width: 20px; height: 20px; border-radius: 50%;
          font-size: 11px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; font-weight: 700;
        }
        .p-row {
          background: #fff; border: 1px solid #eee; border-radius: 12px;
          padding: 14px 16px; display: flex; align-items: center;
          justify-content: space-between; gap: 12px; margin-bottom: 10px;
        }
        .p-row-info { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
        .p-row-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .d-row {
          background: #fff; border: 1px solid #eee; border-radius: 12px;
          padding: 12px 16px; display: flex; align-items: center;
          justify-content: space-between; gap: 12px; margin-bottom: 8px;
        }
        .form-card {
          background: #fff; border-radius: 14px; padding: 20px;
          margin-bottom: 20px; border: 1px solid #eee;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }
        .form-title {
          font-size: 15px; font-weight: 800; color: #111;
          margin-bottom: 18px; padding-bottom: 12px;
          border-bottom: 2px solid #e0f7fa;
        }
        .btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .section-header {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;
        }
        .deals-add-row { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .deals-add-row > div { flex: 1; min-width: 0; }

        @media (max-width: 600px) {
          .admin-grid { grid-template-columns: 1fr !important; }
          .spec-row { grid-template-columns: 1fr 1fr 40px; }
          .p-row { flex-wrap: wrap; }
          .p-row-actions { width: 100%; }
          .p-row-actions button { flex: 1; }
          .d-row { flex-wrap: wrap; }
          .d-row > button { width: 100%; margin-top: 8px; }
          .btn-row button { flex: 1; }
          .deals-add-row { flex-direction: column; }
          .deals-add-row button { width: 100%; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{
        background: 'linear-gradient(135deg, #0d2b33, #0097a7)',
        padding: '14px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/images/logo.png" alt="logo" style={{ height: 32, objectFit: 'contain' }} />
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>Admin Panel</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>Optimus Sphere Tech</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/')} style={topBarBtn}>Store</button>
          <button onClick={() => setAuthed(false)} style={topBarBtn}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs-bar">
        <div className="admin-tabs-inner">
          {[
            { key: 'products', label: '📦 Products' },
            { key: 'hero', label: '🎯 Hero Slides' },
            { key: 'deals', label: '🔥 Deals' },
          ].map(tab => (
            <button key={tab.key} className="admin-tab-btn"
              onClick={() => setActiveTab(tab.key)}
              style={{
                color: activeTab === tab.key ? '#0097a7' : '#666',
                borderBottomColor: activeTab === tab.key ? '#0097a7' : 'transparent',
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 14px', overflowX: 'hidden' }}>

        {/* ══ PRODUCTS ══ */}
        {activeTab === 'products' && (
          <div>
            <div className="section-header">
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>
                Products ({products.length})
              </h2>
              <button onClick={() => { resetProductForm(); setShowProductForm(true); }}
                style={primaryBtn}>
                + Add Product
              </button>
            </div>

            {showProductForm && (
              <div className="form-card">
                <div className="form-title">
                  {editingProduct ? '✏️ Edit Product' : '📦 New Product'}
                </div>

                <div className="admin-grid">
                  <div className="field-group">
                    <label>SKU *</label>
                    <input style={inputStyle} placeholder="e.g. WA0091"
                      value={productForm.sku}
                      onChange={e => setProductForm({ ...productForm, sku: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Product Name *</label>
                    <input style={inputStyle} placeholder="e.g. Sony WH-1000XM5"
                      value={productForm.name}
                      onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Category *</label>
                    <CustomSelect
                      value={productForm.category}
                      placeholder="Select category..."
                      options={Object.keys(CATEGORY_DATA).map(c => ({ value: c, label: c }))}
                      onChange={val => setProductForm({ ...productForm, category: val, brand: '' })}
                    />
                  </div>
                  <div className="field-group">
                    <label>Brand *</label>
                    {currentBrands.length > 0 ? (
                      <>
                        <CustomSelect
                          value={productForm.brand}
                          placeholder="Select brand..."
                          options={[
                            ...currentBrands.map(b => ({ value: b, label: b })),
                            { value: '__other__', label: '✏️ Other (type below)' },
                          ]}
                          onChange={val => setProductForm({ ...productForm, brand: val })}
                        />
                        {productForm.brand === '__other__' && (
                          <input style={{ ...inputStyle, marginTop: 8 }}
                            placeholder="Type brand name"
                            onChange={e => setProductForm({ ...productForm, brand: e.target.value })} />
                        )}
                      </>
                    ) : (
                      <input style={inputStyle} placeholder="e.g. Sony"
                        value={productForm.brand}
                        onChange={e => setProductForm({ ...productForm, brand: e.target.value })} />
                    )}
                  </div>
                  <div className="field-group">
                    <label>Price * (e.g. KSh 15,000)</label>
                    <input style={inputStyle} placeholder="KSh 15,000"
                      value={productForm.price}
                      onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Old Price (optional)</label>
                    <input style={inputStyle} placeholder="KSh 20,000"
                      value={productForm.old_price}
                      onChange={e => setProductForm({ ...productForm, old_price: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Badge</label>
                    <CustomSelect
                      value={productForm.badge}
                      placeholder="No badge"
                      options={BADGES.map(b => ({ value: b, label: b || 'No badge' }))}
                      onChange={val => setProductForm({ ...productForm, badge: val })}
                    />
                  </div>
                  <div className="field-group">
                    <label>Icon emoji</label>
                    <input style={inputStyle} placeholder="📦"
                      value={productForm.icon}
                      onChange={e => setProductForm({ ...productForm, icon: e.target.value })} />
                  </div>
                </div>

                <div className="field-group" style={{ marginBottom: 14 }}>
                  <label>Tags (comma separated)</label>
                  <input style={inputStyle} placeholder="gaming, ps4, controller"
                    value={productForm.tags}
                    onChange={e => setProductForm({ ...productForm, tags: e.target.value })} />
                </div>

                <div className="field-group" style={{ marginBottom: 14 }}>
                  <label>Description</label>
                  <textarea style={{ ...inputStyle, height: 90, resize: 'vertical' }}
                    placeholder="Describe the product..."
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
                </div>

                {/* Specs */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={labelStyle}>Specifications</label>
                    <button onClick={addSpec} style={{
                      background: '#e0f7fa', color: '#0097a7', border: 'none',
                      borderRadius: 6, padding: '6px 14px', fontSize: 12,
                      fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}>
                      + Add Row
                    </button>
                  </div>
                  {specs.map((spec, i) => (
                    <div key={i} className="spec-row">
                      <input style={{ ...inputStyle, fontSize: 14 }}
                        placeholder="Label (e.g. Platform)"
                        value={spec.label}
                        onChange={e => updateSpec(i, 'label', e.target.value)} />
                      <input style={{ ...inputStyle, fontSize: 14 }}
                        placeholder="Value (e.g. PS4)"
                        value={spec.value}
                        onChange={e => updateSpec(i, 'value', e.target.value)} />
                      <button onClick={() => removeSpec(i)}
                        disabled={specs.length === 1}
                        style={{
                          background: specs.length === 1 ? '#f5f5f5' : '#fff0f0',
                          color: specs.length === 1 ? '#ccc' : '#e63946',
                          border: 'none', borderRadius: 6,
                          width: 40, height: 46,
                          cursor: specs.length === 1 ? 'not-allowed' : 'pointer',
                          fontSize: 15, fontWeight: 700,
                          fontFamily: 'Inter, sans-serif',
                        }}>
                        ✕
                      </button>
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                    Example — Platform: PlayStation 4 · Storage: 500GB · Color: Black
                  </p>
                </div>

                {/* Images */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Product Images</label>
                  <div style={{
                    border: '2px dashed #e0f7fa', borderRadius: 10,
                    padding: '20px 16px', textAlign: 'center',
                    background: '#fafffe', marginBottom: 10,
                  }}>
                    <input type="file" accept="image/*" multiple
                      id="product-img-input" style={{ display: 'none' }}
                      onChange={e => setImageFiles(Array.from(e.target.files))} />
                    <label htmlFor="product-img-input" style={{
                      cursor: 'pointer', color: '#0097a7',
                      fontWeight: 700, fontSize: 15,
                    }}>
                      📷 Tap to select images
                    </label>
                    <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                      Select multiple photos at once
                    </p>
                    {imageFiles.length > 0 && (
                      <p style={{ fontSize: 13, color: '#0097a7', marginTop: 8, fontWeight: 600 }}>
                        ✓ {imageFiles.length} image(s) selected
                      </p>
                    )}
                  </div>
                  {existingImages.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
                        Current images (tap ✕ to remove):
                      </p>
                      <div className="img-preview">
                        {existingImages.map((img, i) => (
                          <div key={i} className="img-thumb">
                            <img src={img} alt="" />
                            <button className="img-thumb-del" onClick={() => removeExistingImage(i)}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="btn-row">
                  <button onClick={handleSaveProduct} disabled={savingProduct}
                    style={{ ...primaryBtn, opacity: savingProduct ? 0.7 : 1, padding: '12px 24px' }}>
                    {savingProduct
                      ? (uploadingImages ? '📤 Uploading...' : '💾 Saving...')
                      : (editingProduct ? '✅ Update Product' : '✅ Save Product')
                    }
                  </button>
                  <button onClick={resetProductForm} style={cancelBtn}>Cancel</button>
                </div>
              </div>
            )}

            {loadingProducts ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                <p>No products yet. Add your first product!</p>
              </div>
            ) : (
              products.map(p => (
                <div key={p.id} className="p-row">
                  <div className="p-row-info">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} style={{
                        width: 52, height: 52, objectFit: 'cover',
                        borderRadius: 8, flexShrink: 0,
                      }} />
                    ) : (
                      <div style={{
                        width: 52, height: 52, background: '#f5f5f5',
                        borderRadius: 8, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 22, flexShrink: 0,
                      }}>
                        {p.icon}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700, fontSize: 13, color: '#111',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                        {p.brand} · {p.category} · {p.sku}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0097a7', marginTop: 2 }}>
                        {p.price}
                        {p.old_price && (
                          <span style={{ fontSize: 11, color: '#ccc', textDecoration: 'line-through', marginLeft: 8 }}>
                            {p.old_price}
                          </span>
                        )}
                        {p.badge && (
                          <span style={{
                            marginLeft: 8, background: '#e63946', color: '#fff',
                            fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 800,
                          }}>
                            {p.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-row-actions">
                    <button onClick={() => handleEditProduct(p)} style={editBtn}>✏️ Edit</button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={deleteBtn}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══ HERO ══ */}
        {activeTab === 'hero' && (
          <div>
            <div className="section-header">
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>
                Hero Slides ({heroSlides.length}/3)
              </h2>
              <button onClick={() => setShowHeroForm(true)} style={primaryBtn}
                disabled={heroSlides.length >= 3}>
                + Add Slide
              </button>
            </div>

            {showHeroForm && (
              <div className="form-card">
                <div className="form-title">
                  {editingHero ? '✏️ Edit Slide' : '🎯 New Hero Slide'}
                </div>
                <div className="admin-grid">
                  <div className="field-group">
                    <label>Title *</label>
                    <input style={inputStyle} placeholder="e.g. PlayStation 4 & 5"
                      value={heroForm.title}
                      onChange={e => setHeroForm({ ...heroForm, title: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Subtitle</label>
                    <input style={inputStyle} placeholder="e.g. Ex-UK consoles with controllers"
                      value={heroForm.subtitle}
                      onChange={e => setHeroForm({ ...heroForm, subtitle: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Tag label</label>
                    <input style={inputStyle} placeholder="e.g. NOW IN STOCK"
                      value={heroForm.tag}
                      onChange={e => setHeroForm({ ...heroForm, tag: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Price text</label>
                    <input style={inputStyle} placeholder="e.g. From KSh 25,000"
                      value={heroForm.price}
                      onChange={e => setHeroForm({ ...heroForm, price: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Category link</label>
                    <CustomSelect
                      value={heroForm.category_slug}
                      placeholder="Select category..."
                      options={HERO_CATEGORIES}
                      onChange={val => setHeroForm({ ...heroForm, category_slug: val })}
                    />
                  </div>
                  <div className="field-group">
                    <label>Slide position</label>
                    <CustomSelect
                      value={heroForm.sort_order}
                      placeholder="Select position..."
                      options={[
                        { value: '1', label: '1st Slide' },
                        { value: '2', label: '2nd Slide' },
                        { value: '3', label: '3rd Slide' },
                      ]}
                      onChange={val => setHeroForm({ ...heroForm, sort_order: val })}
                    />
                  </div>
                </div>

                <div className="field-group" style={{ marginBottom: 14 }}>
                  <label>Features (comma separated)</label>
                  <input style={inputStyle}
                    placeholder="Ex-UK Quality, 1 Year Warranty, Free Delivery"
                    value={heroForm.features}
                    onChange={e => setHeroForm({ ...heroForm, features: e.target.value })} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Slide Image</label>
                  <div style={{
                    border: '2px dashed #e0f7fa', borderRadius: 10,
                    padding: '20px 16px', textAlign: 'center', background: '#fafffe',
                  }}>
                    <input type="file" accept="image/*"
                      id="hero-img-input" style={{ display: 'none' }}
                      onChange={e => setHeroImageFile(e.target.files[0])} />
                    <label htmlFor="hero-img-input" style={{
                      cursor: 'pointer', color: '#0097a7', fontWeight: 700, fontSize: 15,
                    }}>
                      📷 Tap to select image
                    </label>
                    {heroImageFile && (
                      <p style={{ fontSize: 13, color: '#0097a7', marginTop: 8, fontWeight: 600 }}>
                        ✓ {heroImageFile.name}
                      </p>
                    )}
                  </div>
                  {editingHero?.image && !heroImageFile && (
                    <img src={editingHero.image} alt="" style={{
                      height: 80, marginTop: 10, borderRadius: 8,
                      border: '1px solid #eee', objectFit: 'cover',
                    }} />
                  )}
                </div>

                <div className="btn-row">
                  <button onClick={handleSaveHero} disabled={savingHero}
                    style={{ ...primaryBtn, opacity: savingHero ? 0.7 : 1, padding: '12px 24px' }}>
                    {savingHero ? '💾 Saving...' : (editingHero ? '✅ Update Slide' : '✅ Save Slide')}
                  </button>
                  <button onClick={() => {
                    setShowHeroForm(false); setEditingHero(null); setHeroImageFile(null);
                    setHeroForm({ title: '', subtitle: '', tag: '', price: '', features: '', category_slug: '', sort_order: '1' });
                  }} style={cancelBtn}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {heroSlides.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
                <p>No slides yet. Add up to 3 slides.</p>
                <p style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>
                  Default slides show when empty.
                </p>
              </div>
            ) : (
              heroSlides.map(slide => (
                <div key={slide.id} className="p-row">
                  <div className="p-row-info">
                    {slide.image && (
                      <img src={slide.image} alt="" style={{
                        width: 72, height: 50, objectFit: 'cover',
                        borderRadius: 8, flexShrink: 0,
                      }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{slide.title}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{slide.subtitle}</div>
                      <div style={{ fontSize: 12, color: '#0097a7', marginTop: 2 }}>
                        {slide.price} · Position #{slide.sort_order}
                      </div>
                    </div>
                  </div>
                  <div className="p-row-actions">
                    <button onClick={() => handleEditHero(slide)} style={editBtn}>✏️ Edit</button>
                    <button onClick={() => handleDeleteHero(slide.id)} style={deleteBtn}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══ DEALS ══ */}
        {activeTab === 'deals' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 6 }}>
              🔥 Deals of the Day
            </h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              Pick up to 8 products to feature on the homepage.
            </p>

            <div className="deals-add-row">
              <div>
                <CustomSelect
                  value={dealSku}
                  placeholder="Select a product to feature..."
                  options={products.map(p => ({
                    value: p.sku,
                    label: `${p.name} — ${p.price}`,
                  }))}
                  onChange={val => setDealSku(val)}
                />
              </div>
              <button onClick={handleAddDeal}
                disabled={savingDeal || deals.length >= 8 || !dealSku}
                style={{
                  ...primaryBtn,
                  opacity: (savingDeal || deals.length >= 8 || !dealSku) ? 0.6 : 1,
                  padding: '12px 20px', whiteSpace: 'nowrap',
                }}>
                {savingDeal ? 'Adding...' : '+ Add to Deals'}
              </button>
            </div>

            {deals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div>
                <p>No deals yet. Select products above.</p>
              </div>
            ) : (
              deals.map((deal, i) => (
                <div key={deal.id} className="d-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <span style={{
                      width: 28, height: 28, background: '#0097a7', color: '#fff',
                      borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    {deal.products?.images?.[0] && (
                      <img src={deal.products.images[0]} alt="" style={{
                        width: 44, height: 44, objectFit: 'cover',
                        borderRadius: 6, flexShrink: 0,
                      }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{deal.products?.name}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>
                        {deal.products?.category} · {deal.products?.price}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteDeal(deal.id)}
                    style={{ ...deleteBtn, whiteSpace: 'nowrap' }}>
                    🗑️ Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared styles ──
const inputStyle = {
  width: '100%', border: '1.5px solid #e0e0e0',
  borderRadius: 8, padding: '11px 12px',
  fontSize: 16, fontFamily: 'Inter, sans-serif',
  outline: 'none', color: '#111', background: '#fff',
  boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: '#888', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: 0.5,
};
const primaryBtn = {
  background: 'linear-gradient(135deg, #0097a7, #00bcd4)',
  color: '#fff', border: 'none', borderRadius: 8,
  padding: '11px 20px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
};
const cancelBtn = {
  background: '#fff', color: '#888',
  border: '1.5px solid #eee', borderRadius: 8,
  padding: '11px 20px', fontSize: 14,
  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
};
const editBtn = {
  background: '#f0fafb', color: '#0097a7',
  border: '1.5px solid #e0f7fa', borderRadius: 8,
  padding: '8px 14px', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
};
const deleteBtn = {
  background: '#fff0f0', color: '#e63946',
  border: '1.5px solid #ffd0d0', borderRadius: 8,
  padding: '8px 14px', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
};
const topBarBtn = {
  background: 'rgba(255,255,255,0.15)', border: 'none',
  color: '#fff', padding: '8px 14px', borderRadius: 8,
  fontSize: 12, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
};