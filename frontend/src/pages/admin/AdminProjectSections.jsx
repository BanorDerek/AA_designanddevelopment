import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminCategories.css';

export default function AdminProjectSections() {
  const { authFetch } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '' });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    authFetch(`/project-sections/admin/all`).then((r) => r.json()).then(setSections).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const slugify = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await authFetch(`/project-sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, orderIndex: sections.length }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create section');
      }
      setForm({ name: '', slug: '' });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (section) => {
    await authFetch(`/project-sections/${section.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !section.isActive }),
    });
    load();
  };

  const handleDelete = async (section) => {
    if (!confirm(`Delete "${section.name}"? Projects in it will become unsectioned, not deleted.`)) return;
    await authFetch(`/project-sections/${section.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <h1 className="admin-page__title">Project Sections</h1>
      <p className="admin-page__subtitle">Groups projects on the Select Work page (e.g. Healthcare, Residential, Commercial).</p>

      <form className="admin-categories__form" onSubmit={handleCreate}>
        <input
          placeholder="Section name"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value, slug: slugify(e.target.value) })}
          required
        />
        <button className="admin-btn" type="submit" disabled={creating}>
          {creating ? 'Adding…' : '+ Add Section'}
        </button>
      </form>
      {error && <p className="admin-page__error">{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="admin-categories__list">
          {sections.map((section) => (
            <div className="admin-categories__row" key={section.id}>
              <span className="admin-categories__name">{section.name}</span>
              {!section.isActive && <span className="admin-categories__badge">Suspended</span>}
              <div className="admin-categories__actions">
                <button className="admin-btn admin-btn--small admin-btn--ghost" onClick={() => handleToggleActive(section)}>
                  {section.isActive ? 'Suspend' : 'Activate'}
                </button>
                <button className="admin-btn admin-btn--small admin-btn--danger" onClick={() => handleDelete(section)}>
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