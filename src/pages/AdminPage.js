import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { validateVideoFile, validatePosterFile } from '../lib/videoUpload';
import { deleteFromBucket } from '../lib/storage';
import { handleFileDrop } from '../lib/fileDrop';
import '../styles/AdminPage.css';

const CATEGORY_DATA = {
  'Gaming Consoles': { parent: 'Gaming', brands: ['PS3', 'PS4', 'PS5', 'Xbox', 'Nintendo', 'Portable'] },
  'Games': { parent: 'Gaming', brands: ['PS4', 'PS5', 'Xbox', 'Nintendo'] },
  'Gaming Accessories': { parent: 'Gaming', brands: ['PS4', 'PS5', 'Nintendo', 'Xbox', 'VR', 'Driving Wheel', 'Handheld'] },
  'Smartphones': { parent: 'Phones', brands: ['Apple', 'Samsung', 'Google', 'Nothing', 'Redmi', 'Xiaomi'] },
  'Laptops': { parent: 'Laptops', brands: ['HP', 'Lenovo', 'Dell', 'Apple', 'Asus', 'Acer'] },
  'Headphones': { parent: 'Audio & Sound', brands: ['Sony', 'JBL', 'Beats', 'Soundcore', 'Bose'] },
  'Earbuds': { parent: 'Audio & Sound', brands: ['Samsung', 'Apple', 'Oraimo', 'Soundcore', 'OnePlus', 'JBL'] },
  'Bluetooth Speakers': { parent: 'Audio & Sound', brands: ['JBL', 'Sony', 'Oraimo', 'Soundcore', 'Harman Kardon', 'Beats'] },
  'Televisions': { parent: 'TV & Streaming', brands: ['TCL', 'Samsung', 'LG', 'Hisense', 'Vitron'] },
  'Streaming Devices': { parent: 'TV & Streaming', brands: ['Fire Stick', 'Google', 'Xiaomi', 'Apple'] },
  'Soundbars': { parent: 'Audio & Sound', brands: ['JBL', 'Sony', 'Samsung', 'TCL', 'Hisense'] },
  'Tablets': { parent: 'Phones', brands: ['Apple', 'Samsung', 'Modio'] },
};

const BADGES = ['', 'SALE', 'NEW', 'HOT'];
const HERO_CATEGORIES = [
  { value: 'gaming', label: 'Gaming' },
  { value: 'gaming-consoles', label: 'Gaming Consoles' },
  { value: 'gaming-accessories', label: 'Gaming Accessories' },
  { value: 'games', label: 'Games' },
  { value: 'phones', label: 'Phones' },
  { value: 'smartphones', label: 'Smartphones' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'audio', label: 'Audio & Sound' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'tv-streaming', label: 'TV & Streaming' },
  { value: 'streaming-devices', label: 'Streaming Devices' },
  { value: 'soundbars', label: 'Soundbars' },
  { value: 'tablets', label: 'Tablets' },
];

const PRODUCTS_PER_ADMIN_PAGE = 10;
const emptySpec = () => ({ label: '', value: '' });

// ── Custom Select ──
function CustomSelect({ value, onChange, options, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className="cs-wrap">
      <div
        onClick={() => setOpen(!open)}
        className={`cs-trigger ${open ? 'open' : ''} ${selected ? '' : 'placeholder'}`}
      >
        <span className="cs-label">
          {selected ? selected.label : placeholder}
        </span>
        <span className={`cs-chevron ${open ? 'open' : ''}`}>▼</span>
      </div>

      {open && (
        <>
          <div onClick={() => setOpen(false)} className="cs-backdrop" />
          <div className="cs-dropdown">
            {options.map((opt) => (
              <div key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`cs-option ${opt.value === value ? 'selected' : ''}`}>
                <span>{opt.label}</span>
                {opt.value === value && <span className="cs-check">✓</span>}
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
  const [customBrand, setCustomBrand] = useState(false);
  const [specs, setSpecs] = useState([emptySpec()]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState('');

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

  // Promo Video
  const [promos, setPromos] = useState([]);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState({ title: '', caption: '', cta_label: '', product_sku: '' });
  const [promoVideoFile, setPromoVideoFile] = useState(null);
  const [promoPosterFile, setPromoPosterFile] = useState(null);
  const [promoVideoMsg, setPromoVideoMsg] = useState(null);   // { level, message } | null
  const [promoPosterMsg, setPromoPosterMsg] = useState(null);
  const [savingPromo, setSavingPromo] = useState(false);
  const promoVidInputRef = useRef(null);
  const promoPosterInputRef = useRef(null);
  const [videoDragOver, setVideoDragOver] = useState(false);
  const [posterDragOver, setPosterDragOver] = useState(false);

  // Auto-refresh on tab switch
  useEffect(() => {
    if (!authed) return;
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'hero') loadHeroSlides();
    if (activeTab === 'deals') loadDeals();
    if (activeTab === 'promo') loadPromos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, authed]);

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
    loadPromos();
  };

  // ── Load ──
  const loadProducts = async () => {
    setLoadingProducts(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setProductPage(1);
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

  const loadPromos = async () => {
    const { data } = await supabase
      .from('promo_video')
      .select('*')
      .order('created_at', { ascending: false });
    setPromos(data || []);
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
    setCustomBrand(false);
  };

  const handleEditProduct = (p) => {
    setEditingProduct(p);
    const categoryBrands = CATEGORY_DATA[p.category]?.brands || [];
    setCustomBrand(p.brand && !categoryBrands.includes(p.brand));
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

  // ── Promo Video ──
  const resetPromoForm = () => {
    setPromoForm({ title: '', caption: '', cta_label: '', product_sku: '' });
    setPromoVideoFile(null); setPromoPosterFile(null);
    setPromoVideoMsg(null); setPromoPosterMsg(null);
    setEditingPromo(null); setShowPromoForm(false);
  };

  const onSelectPromoVideo = (file) => {
    const res = validateVideoFile(file);
    if (!res.ok) { setPromoVideoFile(null); setPromoVideoMsg(res); if (promoVidInputRef.current) promoVidInputRef.current.value = ''; return; }
    setPromoVideoFile(file);
    setPromoVideoMsg(res.level === 'warn' ? res : null);
  };

  const onSelectPromoPoster = (file) => {
    const res = validatePosterFile(file);
    if (!res.ok) { setPromoPosterFile(null); setPromoPosterMsg(res); if (promoPosterInputRef.current) promoPosterInputRef.current.value = ''; return; }
    setPromoPosterFile(file);
    setPromoPosterMsg(res.level === 'warn' ? res : null);
  };

  const handleSavePromo = async () => {
    if (!promoForm.title) { alert('Title is required'); return; }
    if (!promoForm.product_sku) { alert('Please link a product'); return; }
    if (!promoVideoFile && !editingPromo?.video_url) { alert('A video is required'); return; }
    if (!promoPosterFile && !editingPromo?.poster_url) { alert('A poster image is required'); return; }
    setSavingPromo(true);
    let video_url = editingPromo?.video_url || '';
    let poster_url = editingPromo?.poster_url || '';
    try {
      if (promoVideoFile) {
        if (editingPromo?.video_url) await deleteFromBucket(editingPromo.video_url, 'promo-videos'); // best-effort replace cleanup
        video_url = await uploadImage(promoVideoFile, 'promo-videos');
      }
      if (promoPosterFile) {
        if (editingPromo?.poster_url) await deleteFromBucket(editingPromo.poster_url, 'promo-videos');
        poster_url = await uploadImage(promoPosterFile, 'promo-videos');
      }
      const payload = {
        title: promoForm.title,
        caption: promoForm.caption,
        cta_label: promoForm.cta_label,
        product_sku: promoForm.product_sku,
        video_url, poster_url,
      };
      if (editingPromo) {
        await supabase.from('promo_video').update(payload).eq('id', editingPromo.id);
      } else {
        await supabase.from('promo_video').insert({ ...payload, is_active: false });
      }
      resetPromoForm();
      loadPromos();
    } catch (err) {
      // A later step failed after an upload — delete any freshly-uploaded files so they don't orphan.
      if (promoVideoFile && video_url && video_url !== editingPromo?.video_url) await deleteFromBucket(video_url, 'promo-videos');
      if (promoPosterFile && poster_url && poster_url !== editingPromo?.poster_url) await deleteFromBucket(poster_url, 'promo-videos');
      alert('Error saving promo: ' + err.message);
    }
    setSavingPromo(false);
  };

  const handleEditPromo = (promo) => {
    setEditingPromo(promo);
    setPromoForm({
      title: promo.title || '', caption: promo.caption || '',
      cta_label: promo.cta_label || '', product_sku: promo.product_sku || '',
    });
    setPromoVideoFile(null); setPromoPosterFile(null);
    setPromoVideoMsg(null); setPromoPosterMsg(null);
    setShowPromoForm(true);
    window.scrollTo(0, 0);
  };

  // Single active at a time: directional logic, error handling, double-fire guard.
  const handleToggleActive = async (promo) => {
    setSavingPromo(true);
    try {
      if (promo.is_active) {
        // Deactivate just this one (single atomic write).
        const { error } = await supabase.from('promo_video').update({ is_active: false }).eq('id', promo.id);
        if (error) throw error;
      } else {
        // Activate this one; deactivate all others first (single-active invariant).
        const { error: e1 } = await supabase.from('promo_video').update({ is_active: false }).neq('id', promo.id);
        if (e1) throw e1;
        const { error: e2 } = await supabase.from('promo_video').update({ is_active: true }).eq('id', promo.id);
        if (e2) throw e2;
      }
      loadPromos();
    } catch (err) {
      alert('Could not update active state — please refresh and try again.');
      loadPromos(); // re-sync UI to the actual DB state
    } finally {
      setSavingPromo(false);
    }
  };

  // Delete the row AND both files from the bucket; warn (don't block) on cleanup failure.
  const handleDeletePromo = async (promo) => {
    if (!window.confirm('Delete this promo? This also removes its video and poster.')) return;
    const failed = [];
    if (promo.video_url) { const { error } = await deleteFromBucket(promo.video_url, 'promo-videos'); if (error) failed.push('video'); }
    if (promo.poster_url) { const { error } = await deleteFromBucket(promo.poster_url, 'promo-videos'); if (error) failed.push('poster'); }
    await supabase.from('promo_video').delete().eq('id', promo.id);
    loadPromos();
    if (failed.length) alert(`Promo deleted, but cleanup of the ${failed.join(' and ')} file failed — remove it from the promo-videos bucket manually.`);
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
      <div className="adm-login-page">
        <div className="adm-login-card">
          <div className="adm-login-header">
            <img src="/images/logo.png" alt="logo" className="adm-login-logo" />
            <h2 className="adm-login-title">Admin Panel</h2>
            <p className="adm-login-sub">Optimus Sphere Tech</p>
          </div>
          <label className="adm-label">Username</label>
          <input className="adm-input" placeholder="admin"
            value={username} onChange={e => setUsername(e.target.value)} />
          <label className="adm-label adm-label-mt">Password</label>
          <input type="password" className="adm-input" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} />
          {loginError && (
            <p className="adm-login-error">{loginError}</p>
          )}
          <button onClick={handleLogin} className="adm-primary-btn adm-login-submit">
            Login
          </button>
          <button onClick={() => navigate('/')} className="adm-cancel-btn adm-login-back">
            ← Back to Store
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="adm-page">
      {/* Top bar */}
      <div className="adm-topbar">
        <div className="adm-topbar-left">
          <img src="/images/logo.png" alt="logo" className="adm-topbar-logo" />
          <div>
            <div className="adm-topbar-title">Admin Panel</div>
            <div className="adm-topbar-sub">Optimus Sphere Tech</div>
          </div>
        </div>
        <div className="adm-topbar-right">
          <button onClick={() => navigate('/')} className="adm-topbar-btn">Store</button>
          <button onClick={() => setAuthed(false)} className="adm-topbar-btn">Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs-bar">
        <div className="admin-tabs-inner">
          {[
            { key: 'products', label: '📦 Products' },
            { key: 'hero', label: '🎯 Hero Slides' },
            { key: 'deals', label: '🔥 Deals' },
            { key: 'promo', label: '🎬 Promo Video' },
          ].map(tab => (
            <button key={tab.key}
              className={`admin-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-main">

        {/* ══ PRODUCTS ══ */}
        {activeTab === 'products' && (
          <div>
            <div className="section-header">
              <h2 className="adm-section-title">
                Products ({products.length})
              </h2>
              <div className="adm-header-actions">
                <button onClick={loadProducts} className="adm-refresh-btn">🔄 Refresh</button>
                <button onClick={() => { resetProductForm(); setShowProductForm(true); }}
                  className="adm-primary-btn">
                  + Add Product
                </button>
              </div>
            </div>

            {showProductForm && (
              <div className="form-card">
                <div className="form-title">
                  {editingProduct ? '✏️ Edit Product' : '📦 New Product'}
                </div>

                <div className="admin-grid">
                  <div className="field-group">
                    <label>SKU *</label>
                    <input className="adm-input" placeholder="e.g. WA0091"
                      value={productForm.sku}
                      onChange={e => setProductForm({ ...productForm, sku: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Product Name *</label>
                    <input className="adm-input" placeholder="e.g. Sony WH-1000XM5"
                      value={productForm.name}
                      onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Category *</label>
                    <CustomSelect
                      value={productForm.category}
                      placeholder="Select category..."
                      options={Object.keys(CATEGORY_DATA).map(c => ({ value: c, label: c }))}
                      onChange={val => {
                        setProductForm({ ...productForm, category: val, brand: '' });
                        setCustomBrand(false);
                      }}
                    />
                  </div>
                  <div className="field-group">
                    <label>Brand *</label>
                    {currentBrands.length > 0 ? (
                      <>
                        <CustomSelect
                          value={customBrand ? '__other__' : productForm.brand}
                          placeholder="Select brand..."
                          options={[
                            ...currentBrands.map(b => ({ value: b, label: b })),
                            { value: '__other__', label: '✏️ Other (type below)' },
                          ]}
                          onChange={val => {
                            if (val === '__other__') {
                              setCustomBrand(true);
                              setProductForm({ ...productForm, brand: '' });
                            } else {
                              setCustomBrand(false);
                              setProductForm({ ...productForm, brand: val });
                            }
                          }}
                        />
                        {customBrand && (
                          <input
                            className="adm-input adm-mt8"
                            placeholder="Type brand name"
                            value={productForm.brand}
                            onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                          />
                        )}
                      </>
                    ) : (
                      <input className="adm-input" placeholder="e.g. Sony"
                        value={productForm.brand}
                        onChange={e => setProductForm({ ...productForm, brand: e.target.value })} />
                    )}
                  </div>
                  <div className="field-group">
                    <label>Price * (e.g. KSh 15,000)</label>
                    <input className="adm-input" placeholder="KSh 15,000"
                      value={productForm.price}
                      onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Old Price (optional)</label>
                    <input className="adm-input" placeholder="KSh 20,000"
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
                    <input className="adm-input" placeholder="📦"
                      value={productForm.icon}
                      onChange={e => setProductForm({ ...productForm, icon: e.target.value })} />
                  </div>
                </div>

                <div className="field-group adm-mb14">
                  <label>Tags (comma separated)</label>
                  <input className="adm-input" placeholder="gaming, ps4, controller"
                    value={productForm.tags}
                    onChange={e => setProductForm({ ...productForm, tags: e.target.value })} />
                </div>

                <div className="field-group adm-mb14">
                  <label>Description</label>
                  <textarea
                    className="adm-input adm-textarea"
                    placeholder={`Write the product description here.\n\nUse this format for better display:\n\nMain Features:\n- Feature one\n- Feature two\n\nWhat's in the Box:\n- Item one\n- Item two`}
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  />
                  <div className="adm-tips">
                    <p className="adm-tips-title">
                      💡 Formatting Tips:
                    </p>
                    <p className="adm-tips-text">
                      • Lines ending with <strong>:</strong> → Bold heading<br />
                      • Lines starting with <strong>-</strong> → Bullet point<br />
                      • Press Enter between sections for spacing
                    </p>
                  </div>
                </div>

                {/* Specs */}
                <div className="adm-specs">
                  <div className="adm-specs-head">
                    <label className="adm-label">Specifications</label>
                    <button onClick={addSpec} className="adm-addrow-btn">
                      + Add Row
                    </button>
                  </div>
                  {specs.map((spec, i) => (
                    <div key={i} className="spec-row">
                      <input className="adm-input adm-input-sm"
                        placeholder="Label (e.g. Platform)"
                        value={spec.label}
                        onChange={e => updateSpec(i, 'label', e.target.value)} />
                      <input className="adm-input adm-input-sm"
                        placeholder="Value (e.g. PS4)"
                        value={spec.value}
                        onChange={e => updateSpec(i, 'value', e.target.value)} />
                      <button onClick={() => removeSpec(i)}
                        disabled={specs.length === 1}
                        className="adm-spec-remove">
                        ✕
                      </button>
                    </div>
                  ))}
                  <p className="adm-specs-eg">
                    Example — Platform: PlayStation 4 · Storage: 500GB · Color: Black
                  </p>
                </div>

                {/* Images */}
                <div className="adm-images">
                  <label className="adm-label">Product Images</label>
                  <div className="adm-dropzone adm-dropzone--mb">
                    <input type="file" accept="image/*" multiple
                      id="product-img-input" className="adm-hidden"
                      onChange={e => setImageFiles(prev => [...prev, ...Array.from(e.target.files)])} />
                    <label htmlFor="product-img-input" className="adm-dropzone-label">
                      📷 {imageFiles.length > 0 ? '+ Add more images' : 'Tap to select images'}
                    </label>
                    <p className="adm-dropzone-hint">
                      {imageFiles.length > 0
                        ? 'Tap again to add more images'
                        : 'You can select multiple photos at once or tap multiple times'}
                    </p>
                    {imageFiles.length > 0 && (
                      <p className="adm-dropzone-ready">
                        ✓ {imageFiles.length} new image(s) ready to upload
                      </p>
                    )}
                  </div>

                  {imageFiles.length > 0 && (
                    <div className="adm-newimgs">
                      <p className="adm-newimgs-label">
                        New images to be added:
                      </p>
                      <div className="img-preview">
                        {imageFiles.map((file, i) => (
                          <div key={i} className="img-thumb img-thumb--static">
                            <img src={URL.createObjectURL(file)} alt="" />
                            <button className="img-thumb-del"
                              onClick={() => setImageFiles(imageFiles.filter((_, idx) => idx !== i))}>
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {existingImages.length > 0 && (
                    <div>
                      <div className="adm-existimgs-head">
                        <p className="adm-existimgs-label">
                          Current images — tap ✕ to remove, drag to reorder:
                        </p>
                        <button onClick={() => setExistingImages([])} className="adm-removeall-btn">
                          Remove all
                        </button>
                      </div>
                      <div className="img-preview">
                        {existingImages.map((img, i) => (
                          <div key={i} className="img-thumb"
                            draggable
                            onDragStart={e => e.dataTransfer.setData('text/plain', i)}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => {
                              e.preventDefault();
                              const from = parseInt(e.dataTransfer.getData('text/plain'));
                              const to = i;
                              if (from === to) return;
                              const updated = [...existingImages];
                              const [moved] = updated.splice(from, 1);
                              updated.splice(to, 0, moved);
                              setExistingImages(updated);
                            }}>
                            <img src={img} alt="" />
                            <button className="img-thumb-del" onClick={() => removeExistingImage(i)}>✕</button>
                            {i === 0 && (
                              <div className="adm-main-badge">
                                MAIN
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="adm-mainimg-note">
                        First image is the main display image shown on product cards.
                      </p>
                    </div>
                  )}
                </div>

                <div className="btn-row">
                  <button onClick={handleSaveProduct} disabled={savingProduct}
                    className="adm-primary-btn adm-save-btn"
                    style={{ opacity: savingProduct ? 0.7 : 1 }}>
                    {savingProduct
                      ? (uploadingImages ? '📤 Uploading...' : '💾 Saving...')
                      : (editingProduct ? '✅ Update Product' : '✅ Save Product')
                    }
                  </button>
                  <button onClick={resetProductForm} className="adm-cancel-btn">Cancel</button>
                </div>
              </div>
            )}

            {/* Search bar */}
            {!loadingProducts && products.length > 0 && (
              <div className="adm-search">
                <input
                  type="text"
                  placeholder="🔍 Search by name, SKU, brand, or category..."
                  value={productSearch}
                  onChange={e => {
                    setProductSearch(e.target.value);
                    setProductPage(1);
                  }}
                  className="adm-input"
                  style={{ paddingRight: productSearch ? 40 : 12 }}
                />
                {productSearch && (
                  <button
                    onClick={() => { setProductSearch(''); setProductPage(1); }}
                    className="adm-search-clear"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {loadingProducts ? (
              <div className="adm-loading">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="adm-empty">
                <div className="adm-empty-icon">📦</div>
                <p>No products yet. Add your first product!</p>
              </div>
            ) : (
              <>
                {(() => {
                  const searchLower = productSearch.toLowerCase();
                  const searchedProducts = productSearch
                    ? products.filter(p =>
                        p.name?.toLowerCase().includes(searchLower) ||
                        p.sku?.toLowerCase().includes(searchLower) ||
                        p.brand?.toLowerCase().includes(searchLower) ||
                        p.category?.toLowerCase().includes(searchLower)
                      )
                    : products;

                  const totalAdminPages = Math.ceil(searchedProducts.length / PRODUCTS_PER_ADMIN_PAGE);
                  const startIdx = (productPage - 1) * PRODUCTS_PER_ADMIN_PAGE;
                  const paginated = searchedProducts.slice(startIdx, startIdx + PRODUCTS_PER_ADMIN_PAGE);

                  if (searchedProducts.length === 0) {
                    return (
                      <div className="adm-nomatch">
                        <div className="adm-nomatch-icon">🔍</div>
                        <p className="adm-nomatch-text">No products match "{productSearch}"</p>
                        <button onClick={() => setProductSearch('')}
                          className="adm-clearsearch-btn">
                          Clear search
                        </button>
                      </div>
                    );
                  }

                  return (
                    <>
                      {productSearch && (
                        <p className="adm-found">
                          Found <strong className="adm-teal">{searchedProducts.length}</strong> result(s)
                        </p>
                      )}

                      {paginated.map(p => (
                        <div key={p.id} className="p-row">
                          <div className="p-row-info">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt={p.name} className="adm-prow-img" />
                            ) : (
                              <div className="adm-prow-icon">
                                {p.icon}
                              </div>
                            )}
                            <div className="adm-prow-textwrap">
                              <div className="adm-prow-name">
                                {p.name}
                              </div>
                              <div className="adm-prow-meta">
                                {p.brand} · {p.category} · {p.sku}
                              </div>
                              <div className="adm-prow-price">
                                {p.price}
                                {p.old_price && (
                                  <span className="adm-prow-old">
                                    {p.old_price}
                                  </span>
                                )}
                                {p.badge && (
                                  <span className="adm-prow-badge">
                                    {p.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="p-row-actions">
                            <button onClick={() => handleEditProduct(p)} className="adm-edit-btn">✏️ Edit</button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="adm-delete-btn">🗑️</button>
                          </div>
                        </div>
                      ))}

                      {totalAdminPages > 1 && (
                        <div className="admin-pagination">
                          <button
                            className="admin-page-btn"
                            onClick={() => setProductPage(productPage - 1)}
                            disabled={productPage === 1}>
                            ← Prev
                          </button>
                          <span className="adm-page-info">
                            Page <strong className="adm-teal">{productPage}</strong> of{' '}
                            <strong>{totalAdminPages}</strong>
                          </span>
                          <button
                            className="admin-page-btn"
                            onClick={() => setProductPage(productPage + 1)}
                            disabled={productPage >= totalAdminPages}>
                            Next →
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* ══ HERO ══ */}
        {activeTab === 'hero' && (
          <div>
            <div className="section-header">
              <h2 className="adm-section-title">
                Hero Slides ({heroSlides.length}/5)
              </h2>
              <div className="adm-header-actions">
                <button onClick={loadHeroSlides} className="adm-refresh-btn">🔄 Refresh</button>
                <button onClick={() => setShowHeroForm(true)} className="adm-primary-btn"
                  disabled={heroSlides.length >= 5}>
                  + Add Slide
                </button>
              </div>
            </div>

            {showHeroForm && (
              <div className="form-card">
                <div className="form-title">
                  {editingHero ? '✏️ Edit Slide' : '🎯 New Hero Slide'}
                </div>
                <div className="admin-grid">
                  <div className="field-group">
                    <label>Title *</label>
                    <input className="adm-input" placeholder="e.g. PlayStation 4 & 5"
                      value={heroForm.title}
                      onChange={e => setHeroForm({ ...heroForm, title: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Subtitle</label>
                    <input className="adm-input" placeholder="e.g. Ex-UK consoles with controllers"
                      value={heroForm.subtitle}
                      onChange={e => setHeroForm({ ...heroForm, subtitle: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Tag label</label>
                    <input className="adm-input" placeholder="e.g. NOW IN STOCK"
                      value={heroForm.tag}
                      onChange={e => setHeroForm({ ...heroForm, tag: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Price text</label>
                    <input className="adm-input" placeholder="e.g. From KSh 25,000"
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
                        { value: '4', label: '4th Slide' },
                        { value: '5', label: '5th Slide' },
                      ]}
                      onChange={val => setHeroForm({ ...heroForm, sort_order: val })}
                    />
                  </div>
                </div>

                <div className="field-group adm-mb14">
                  <label>Features (comma separated)</label>
                  <input className="adm-input"
                    placeholder="Ex-UK Quality, 1 Year Warranty, Free Delivery"
                    value={heroForm.features}
                    onChange={e => setHeroForm({ ...heroForm, features: e.target.value })} />
                </div>

                <div className="adm-images">
                  <label className="adm-label">Slide Image</label>
                  <div className="adm-dropzone">
                    <input type="file" accept="image/*"
                      id="hero-img-input" className="adm-hidden"
                      onChange={e => setHeroImageFile(e.target.files[0])} />
                    <label htmlFor="hero-img-input" className="adm-dropzone-label">
                      📷 Tap to select image
                    </label>
                    {heroImageFile && (
                      <p className="adm-dropzone-ready">
                        ✓ {heroImageFile.name}
                      </p>
                    )}
                  </div>
                  {editingHero?.image && !heroImageFile && (
                    <img src={editingHero.image} alt="" className="adm-hero-preview" />
                  )}
                </div>

                <div className="btn-row">
                  <button onClick={handleSaveHero} disabled={savingHero}
                    className="adm-primary-btn adm-save-btn"
                    style={{ opacity: savingHero ? 0.7 : 1 }}>
                    {savingHero ? '💾 Saving...' : (editingHero ? '✅ Update Slide' : '✅ Save Slide')}
                  </button>
                  <button onClick={() => {
                    setShowHeroForm(false); setEditingHero(null); setHeroImageFile(null);
                    setHeroForm({ title: '', subtitle: '', tag: '', price: '', features: '', category_slug: '', sort_order: '1' });
                  }} className="adm-cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {heroSlides.length === 0 ? (
              <div className="adm-empty">
                <div className="adm-empty-icon">🎯</div>
                <p>No slides yet. Add up to 5 slides.</p>
                <p className="adm-empty-sub">
                  Default slides show when empty.
                </p>
              </div>
            ) : (
              heroSlides.map(slide => (
                <div key={slide.id} className="p-row">
                  <div className="p-row-info">
                    {slide.image && (
                      <img src={slide.image} alt="" className="adm-hero-thumb" />
                    )}
                    <div>
                      <div className="adm-hero-title">{slide.title}</div>
                      <div className="adm-hero-sub">{slide.subtitle}</div>
                      <div className="adm-hero-price">
                        {slide.price} · Position #{slide.sort_order}
                      </div>
                    </div>
                  </div>
                  <div className="p-row-actions">
                    <button onClick={() => handleEditHero(slide)} className="adm-edit-btn">✏️ Edit</button>
                    <button onClick={() => handleDeleteHero(slide.id)} className="adm-delete-btn">🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══ DEALS ══ */}
        {activeTab === 'deals' && (
          <div>
            <div className="section-header section-header--tight">
              <h2 className="adm-section-title">
                🔥 Deals of the Day
              </h2>
              <button onClick={loadDeals} className="adm-refresh-btn">🔄 Refresh</button>
            </div>
            <p className="adm-deals-desc">
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
                className="adm-primary-btn adm-adddeal-btn"
                style={{ opacity: (savingDeal || deals.length >= 8 || !dealSku) ? 0.6 : 1 }}>
                {savingDeal ? 'Adding...' : '+ Add to Deals'}
              </button>
            </div>

            {deals.length === 0 ? (
              <div className="adm-empty">
                <div className="adm-empty-icon">🔥</div>
                <p>No deals yet. Select products above.</p>
              </div>
            ) : (
              deals.map((deal, i) => (
                <div key={deal.id} className="d-row">
                  <div className="adm-drow-info">
                    <span className="adm-drow-num">
                      {i + 1}
                    </span>
                    {deal.products?.images?.[0] && (
                      <img src={deal.products.images[0]} alt="" className="adm-drow-img" />
                    )}
                    <div>
                      <div className="adm-drow-name">{deal.products?.name}</div>
                      <div className="adm-drow-meta">
                        {deal.products?.category} · {deal.products?.price}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteDeal(deal.id)}
                    className="adm-delete-btn adm-drow-remove">
                    🗑️ Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══ PROMO VIDEO ══ */}
        {activeTab === 'promo' && (
          <div>
            <div className="section-header">
              <h2 className="adm-section-title">🎬 Promo Video ({promos.length})</h2>
              <div className="adm-header-actions">
                <button onClick={loadPromos} className="adm-refresh-btn">🔄 Refresh</button>
                <button onClick={() => { resetPromoForm(); setShowPromoForm(true); }} className="adm-primary-btn">
                  + Add Promo
                </button>
              </div>
            </div>

            {showPromoForm && (
              <div className="form-card">
                <div className="form-title">{editingPromo ? '✏️ Edit Promo' : '🎬 New Promo Video'}</div>
                <div className="admin-grid">
                  <div className="field-group">
                    <label>Title *</label>
                    <input className="adm-input" placeholder="e.g. Elden Ring"
                      value={promoForm.title}
                      onChange={e => setPromoForm({ ...promoForm, title: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Caption</label>
                    <input className="adm-input" placeholder="e.g. This week's best seller"
                      value={promoForm.caption}
                      onChange={e => setPromoForm({ ...promoForm, caption: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>CTA label</label>
                    <input className="adm-input" placeholder="e.g. Shop This Game"
                      value={promoForm.cta_label}
                      onChange={e => setPromoForm({ ...promoForm, cta_label: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Linked product *</label>
                    <CustomSelect
                      value={promoForm.product_sku}
                      placeholder="Select a product..."
                      options={products.map(p => ({ value: p.sku, label: `${p.name} — ${p.price}` }))}
                      onChange={val => setPromoForm({ ...promoForm, product_sku: val })}
                    />
                  </div>
                </div>

                <div className="adm-images">
                  <label className="adm-label">Promo Video * (max 25 MB)</label>
                  <div className="adm-dropzone"
                    onDragOver={e => { e.preventDefault(); setVideoDragOver(true); }}
                    onDragLeave={() => setVideoDragOver(false)}
                    onDrop={e => { setVideoDragOver(false); handleFileDrop(e, onSelectPromoVideo); }}
                    style={videoDragOver ? { borderColor: '#00bcd4', background: 'rgba(0,188,212,0.08)' } : undefined}>
                    <input type="file" accept="video/*" id="promo-vid-input" className="adm-hidden"
                      ref={promoVidInputRef}
                      onChange={e => onSelectPromoVideo(e.target.files[0])} />
                    <label htmlFor="promo-vid-input" className="adm-dropzone-label">🎬 Tap to select or drop a video</label>
                    {promoVideoFile && <p className="adm-dropzone-ready">✓ {promoVideoFile.name}</p>}
                    {editingPromo?.video_url && !promoVideoFile && <p className="adm-dropzone-ready">✓ current video kept</p>}
                  </div>
                  {promoVideoMsg && (
                    <p style={{ color: promoVideoMsg.level === 'block' ? '#e63946' : '#d9a400', marginTop: 6 }}>
                      {promoVideoMsg.message}
                    </p>
                  )}
                </div>

                <div className="adm-images">
                  <label className="adm-label">Poster image * (shown on mobile data — max 1 MB)</label>
                  <div className="adm-dropzone"
                    onDragOver={e => { e.preventDefault(); setPosterDragOver(true); }}
                    onDragLeave={() => setPosterDragOver(false)}
                    onDrop={e => { setPosterDragOver(false); handleFileDrop(e, onSelectPromoPoster); }}
                    style={posterDragOver ? { borderColor: '#00bcd4', background: 'rgba(0,188,212,0.08)' } : undefined}>
                    <input type="file" accept="image/*" id="promo-poster-input" className="adm-hidden"
                      ref={promoPosterInputRef}
                      onChange={e => onSelectPromoPoster(e.target.files[0])} />
                    <label htmlFor="promo-poster-input" className="adm-dropzone-label">📷 Tap to select or drop a poster</label>
                    {promoPosterFile && <p className="adm-dropzone-ready">✓ {promoPosterFile.name}</p>}
                  </div>
                  {promoPosterMsg && (
                    <p style={{ color: promoPosterMsg.level === 'block' ? '#e63946' : '#d9a400', marginTop: 6 }}>
                      {promoPosterMsg.message}
                    </p>
                  )}
                  {editingPromo?.poster_url && !promoPosterFile && (
                    <img src={editingPromo.poster_url} alt="" className="adm-hero-preview" />
                  )}
                </div>

                <div className="btn-row">
                  <button onClick={handleSavePromo} disabled={savingPromo}
                    className="adm-primary-btn adm-save-btn" style={{ opacity: savingPromo ? 0.7 : 1 }}>
                    {savingPromo ? '💾 Saving...' : (editingPromo ? '✅ Update Promo' : '✅ Save Promo')}
                  </button>
                  <button onClick={resetPromoForm} className="adm-cancel-btn">Cancel</button>
                </div>
              </div>
            )}

            {promos.length === 0 ? (
              <div className="adm-empty">
                <div className="adm-empty-icon">🎬</div>
                <p>No promos yet. Add one and activate it to replace the hero.</p>
                <p className="adm-empty-sub">When none is active, the hero shows the slide carousel.</p>
              </div>
            ) : (
              promos.map(promo => (
                <div key={promo.id} className="p-row">
                  <div className="p-row-info">
                    {promo.poster_url && <img src={promo.poster_url} alt="" className="adm-hero-thumb" />}
                    <div>
                      <div className="adm-hero-title">
                        {promo.title} {promo.is_active && <span className="adm-teal">● ACTIVE</span>}
                      </div>
                      <div className="adm-hero-sub">{promo.caption}</div>
                      <div className="adm-hero-price">Linked: {promo.product_sku || '—'}</div>
                    </div>
                  </div>
                  <div className="p-row-actions">
                    <button onClick={() => handleToggleActive(promo)} disabled={savingPromo} className="adm-edit-btn">
                      {promo.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                    <button onClick={() => handleEditPromo(promo)} className="adm-edit-btn">✏️ Edit</button>
                    <button onClick={() => handleDeletePromo(promo)} className="adm-delete-btn">🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
