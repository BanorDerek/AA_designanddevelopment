import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { useAuth } from '../../context/AuthContext';
import './AdminProducts.css';

export default function AdminProducts() {
  const navigate = useNavigate(); // Add this hook
  const { authFetch } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', price: '', currency: 'USD', categoryId: '', description: '' });
  const [categories, setCategories] = useState([]);

  const load = () => {
    setLoading(true);
    authFetch(`/products/admin/all`).then((r) => r.json()).then(setProducts).finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    authFetch(`/categories/admin/all`).then((r) => r.json()).then(setCategories);
  }, []);

  const slugify = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const formatMoney = (amount, currency = 'USD') => {
    return new Intl.NumberFormat(
      currency === 'NGN' ? 'en-NG' : 'en-US',
      {
        style: 'currency',
        currency,
      }
    ).format(amount || 0);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await authFetch(`/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          categoryId: form.categoryId || null,
          orderIndex: products.length,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create product');
      }
      setForm({ name: '', slug: '', price: '', currency: 'USD', categoryId: '', description: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCoverUpload = async (id, file) => {
    if (!file) return;
    setBusyId(id);
    try {
      const formData = new FormData();
      formData.append('image', file);
      await authFetch(`/products/${id}/cover-image`, { method: 'POST', body: formData });
      load();
    } finally {
      setBusyId(null);
    }
  };

  const handleTogglePublish = async (product) => {
    await authFetch(`/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !product.isPublished }),
    });
    load();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await authFetch(`/products/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="admin-projects__header">
        <div>
          <h1 className="admin-page__title">Products</h1>
          <p className="admin-page__subtitle">Shown on the shop page for customers to purchase.</p>
        </div>
        <button className="admin-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Product'}
        </button>
      </div>

      {showForm && (
        <form className="admin-projects__form" onSubmit={handleCreate}>
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
              required
            />
          </label>
          <label>
            Slug
            <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required />
          </label>
          <label>
            Price
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
            />
          </label>
          <label>
            Currency
            <select
              value={form.currency || 'USD'}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            >
              <option value="USD">USD ($)</option>
              <option value="NGN">NGN (₦)</option>
            </select>
          </label>
          <label>
            Category
            <select
              value={form.categoryId || ''}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="">Uncategorized</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </label>
          <label>
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          {error && <p className="admin-page__error">{error}</p>}
          <button className="admin-btn" type="submit" disabled={creating}>
            {creating ? 'Creating…' : 'Create Product'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="admin-projects__grid">
          {products.map((product) => (
            <div className="admin-projects__card" key={product.id}>
              <div className="admin-projects__thumb">
                {product.coverImageUrl ? <img src={product.coverImageUrl} alt={product.name} /> : <span>No image</span>}
                {!product.isPublished && <span className="admin-projects__badge">Draft</span>}
              </div>
              <div className="admin-projects__meta">
                <span className="admin-projects__title">{product.name}</span>
                <span className="admin-projects__count">{formatMoney(product.price, product.currency)}</span>
                {product.category && (
                  <span className="admin-products__category-tag">{product.category.name}</span>
                )}
                <div className="admin-projects__actions">
                  {/* Edit button - navigates to product detail admin page */}
                  <button 
                    className="admin-btn admin-btn--small admin-btn--ghost"
                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                  >
                    Edit
                  </button>
                  
                  <label className="admin-btn admin-btn--small">
                    {busyId === product.id ? 'Working…' : product.coverImageUrl ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={busyId === product.id}
                      onChange={(e) => handleCoverUpload(product.id, e.target.files[0])}
                      hidden
                    />
                  </label>
                  <button 
                    className="admin-btn admin-btn--small admin-btn--ghost" 
                    onClick={() => handleTogglePublish(product)}
                  >
                    {product.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button 
                    className="admin-btn admin-btn--small admin-btn--danger" 
                    onClick={() => handleDelete(product.id, product.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}