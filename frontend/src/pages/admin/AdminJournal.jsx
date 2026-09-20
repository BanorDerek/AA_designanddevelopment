// pages/admin/AdminJournal.jsx - Clean version (no excerpt)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminJournal.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminJournal() {
  const { authFetch } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState({});
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    author: 'AA Design & Development',
    date: new Date().toISOString().split('T')[0],
    isPublished: true,
  });

  const load = () => {
    setLoading(true);
    authFetch(`/journal/admin/all`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load journal entries');
        return r.json();
      })
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((err) => {
        console.error('Error loading journal:', err);
        setError('Failed to load journal entries');
        setEntries([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const slugify = (str) =>
    str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (title) => {
    setForm((f) => ({ ...f, title, slug: slugify(title) }));
  };

  const resetForm = () => {
    setForm({
      title: '',
      slug: '',
      content: '',
      author: 'AA Design & Development',
      date: new Date().toISOString().split('T')[0],
      isPublished: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const isEditing = editingId !== null;
    const url = isEditing ? `/journal/${editingId}` : `/journal`;
    const method = isEditing ? 'PUT' : 'POST';
    
    try {
      const res = await authFetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          content: form.content || '',
          author: form.author,
          date: form.date,
          isPublished: form.isPublished,
        }),
      });
      if (!res.ok) throw new Error(isEditing ? 'Failed to update' : 'Failed to create');
      
      load();
      resetForm();
      setShowForm(false);
      setMessage(isEditing ? 'Journal entry updated successfully!' : 'Journal entry created successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUploadCover = async (id, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [id]: true }));
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await authFetch(`/journal/${id}/cover-image`, { 
        method: 'POST', 
        body: formData 
      });
      if (!res.ok) throw new Error('Upload failed');
      load();
      setMessage('Cover image uploaded successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const res = await authFetch(`/journal/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await authFetch(`/journal/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      load();
      setMessage('Deleted successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="admin-journal">
      <div className="admin-journal__header">
        <div>
          <h1 className="admin-page__title">Journal</h1>
          <p className="admin-page__subtitle">
            Create and manage journal entries.
          </p>
        </div>
        <button 
          className="admin-btn admin-btn--primary" 
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : '+ New Entry'}
        </button>
      </div>

      {message && <p className="admin-journal__message">{message}</p>}
      {error && <p className="admin-page__error">{error}</p>}

      {showForm && (
        <form className="admin-journal__form" onSubmit={handleSubmit}>
          <h2 className="admin-journal__form-title">
            {editingId ? 'Edit Journal Entry' : 'Create New Journal Entry'}
          </h2>

          <div className="admin-journal__form-row">
            <div className="admin-journal__form-group">
              <label>Title <span className="admin-journal__required">*</span>
                <input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="Enter the journal title"
                />
              </label>
            </div>
            <div className="admin-journal__form-group">
              <label>Slug (URL) <span className="admin-journal__required">*</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="auto-generated from title"
                />
              </label>
            </div>
          </div>

          <div className="admin-journal__form-group">
            <label>Content (full article)
              <span className="admin-journal__hint">(main body text)</span>
              <textarea
                rows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Full article content..."
              />
            </label>
          </div>

          <div className="admin-journal__form-row">
            <div className="admin-journal__form-group">
              <label>Author
                <input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Author name"
                />
              </label>
            </div>
            <div className="admin-journal__form-group">
              <label>Date
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
            </div>
          </div>

          <div className="admin-journal__form-group admin-journal__form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              />
              Publish immediately
            </label>
          </div>

          <div className="admin-journal__form-actions">
            <button 
              type="button" 
              className="admin-btn admin-btn--ghost"
              onClick={() => { setShowForm(false); resetForm(); }}
            >
              Cancel
            </button>
            <button className="admin-btn admin-btn--primary" type="submit">
              {editingId ? 'Update Entry' : 'Create Entry'}
            </button>
          </div>
        </form>
      )}

      {/* Entries Grid */}
      {entries.length === 0 ? (
        <p className="admin-journal__empty">No journal entries yet. Create one above.</p>
      ) : (
        <div className="admin-journal__grid">
          {entries.map((entry) => (
            <div className="admin-journal__card" key={entry.id}>
              <div className="admin-journal__card-image">
                {entry.coverImageKey ? (
                  <img 
                    src={`${API_BASE}/images/${entry.coverImageKey}`} 
                    alt={entry.title}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="admin-journal__no-image"><span>No cover image</span></div>
                )}
                {!entry.isPublished && <span className="admin-journal__badge">Draft</span>}
              </div>
              <div className="admin-journal__card-info">
                <div className="admin-journal__card-meta">
                  <span className="admin-journal__card-date">{formatDate(entry.date)}</span>
                  <span className="admin-journal__card-author">{entry.author}</span>
                </div>
                <h3 className="admin-journal__card-title">{entry.title}</h3>
                <div className="admin-journal__card-stats">
                  <span>📷 {(entry.images || []).length} images</span>
                  <span>📋 {(entry.details || []).length} details</span>
                </div>
            
<div className="admin-journal__card-actions">
  <Link to={`/admin/journal/${entry.id}/details`} className="admin-btn admin-btn--small admin-btn--primary">
    Manage Details & Images
  </Link>
  <button
    className="admin-btn admin-btn--small admin-btn--ghost"
    onClick={() => { 
      setEditingId(entry.id); 
      setForm({ 
        title: entry.title || '',
        slug: entry.slug || '',
        content: entry.content || '',
        author: entry.author || 'AA Design & Development',
        date: entry.date || new Date().toISOString().split('T')[0],
        isPublished: entry.isPublished !== undefined ? entry.isPublished : true,
      }); 
      setShowForm(true); 
    }}
  >
    Edit
  </button>
  {/* Updated Upload Button with guidance on new line */}
  <label className="admin-btn admin-btn--small admin-btn--ghost admin-journal__upload-label">
    {uploading[entry.id] ? 'Uploading…' : entry.coverImageKey ? 'Replace Cover' : 'Upload Cover'}
    <span className="admin-journal__image-guidance">
      <strong>1920×864</strong> landscape
    </span>
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp,image/avif"
      disabled={uploading[entry.id]}
      onChange={(e) => {
        if (e.target.files[0]) {
          handleUploadCover(entry.id, e.target.files[0]);
        }
        e.target.value = '';
      }}
      hidden
    />
  </label>
  <button
    className="admin-btn admin-btn--small admin-btn--ghost"
    onClick={() => handleTogglePublish(entry.id, entry.isPublished)}
  >
    {entry.isPublished ? 'Unpublish' : 'Publish'}
  </button>
  <button
    className="admin-btn admin-btn--small admin-btn--danger"
    onClick={() => handleDelete(entry.id, entry.title)}
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