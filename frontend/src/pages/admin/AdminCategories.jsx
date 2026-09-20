import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminCategories.css';

export default function AdminCategories() {
  const { authFetch } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '' });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    authFetch(`/categories/admin/all`).then((r) => r.json()).then(setCategories).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const slugify = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await authFetch(`/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, orderIndex: categories.length }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create category');
      }
      setForm({ name: '', slug: '' });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (category) => {
    await authFetch(`/categories/${category.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !category.isActive }),
    });
    load();
  };

  const handleDelete = async (category) => {
    if (!confirm(`Delete "${category.name}"? Products in it will become uncategorized, not deleted.`)) return;
    await authFetch(`/categories/${category.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <h1 className="admin-page__title">Categories</h1>
      <p className="admin-page__subtitle">Used to filter products on the shop page.</p>

      <form className="admin-categories__form" onSubmit={handleCreate}>
        <input
          placeholder="Category name"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value, slug: slugify(e.target.value) })}
          required
        />
        <button className="admin-btn" type="submit" disabled={creating}>
          {creating ? 'Adding…' : '+ Add Category'}
        </button>
      </form>
      {error && <p className="admin-page__error">{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="admin-categories__list">
          {categories.map((cat) => (
            <div className="admin-categories__row" key={cat.id}>
              <span className="admin-categories__name">{cat.name}</span>
              {!cat.isActive && <span className="admin-categories__badge">Suspended</span>}
              <div className="admin-categories__actions">
                <button className="admin-btn admin-btn--small admin-btn--ghost" onClick={() => handleToggleActive(cat)}>
                  {cat.isActive ? 'Suspend' : 'Activate'}
                </button>
                <button className="admin-btn admin-btn--small admin-btn--danger" onClick={() => handleDelete(cat)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}