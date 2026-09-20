// pages/admin/AdminBTS.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminBTS.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminBTS() {
  const { authFetch } = useAuth();
  const [images, setImages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    title: '', 
    caption: '', 
    category: 'bts',
    projectId: '',
    isPublished: true 
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      authFetch(`/bts/admin/all`),
      authFetch(`/projects/admin/all`)
    ])
      .then(([btsRes, projectsRes]) => Promise.all([btsRes.json(), projectsRes.json()]))
      .then(([btsData, projectsData]) => {
        setImages(Array.isArray(btsData) ? btsData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      })
      .catch((err) => {
        console.error('Error loading:', err);
        setError('Failed to load data');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await authFetch(`/bts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to create');
      const data = await res.json();
      setImages([...images, data]);
      resetForm();
      setShowForm(false);
      setMessage('BTS image created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await authFetch(`/bts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          caption: form.caption,
          category: form.category,
          projectId: form.projectId || null,
          isPublished: form.isPublished,
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      setImages(images.map(img => img.id === editingId ? data : img));
      resetForm();
      setEditingId(null);
      setShowForm(false);
      setMessage('BTS image updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (image) => {
    setForm({
      title: image.title || '',
      caption: image.caption || '',
      category: image.category || 'bts',
      projectId: image.projectId || '',
      isPublished: image.isPublished !== undefined ? image.isPublished : true,
    });
    setEditingId(image.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ 
      title: '', 
      caption: '', 
      category: 'bts',
      projectId: '',
      isPublished: true 
    });
    setEditingId(null);
  };

  const handleUpload = async (id, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [id]: true }));
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await authFetch(`/bts/${id}/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      load();
      setMessage('Image uploaded successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const res = await authFetch(`/bts/${id}`, {
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
      const res = await authFetch(`/bts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      load();
      setMessage('Deleted successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReorder = async (id, direction) => {
    const currentIndex = images.findIndex(img => img.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === images.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedImages = [...images];
    const [moved] = updatedImages.splice(currentIndex, 1);
    updatedImages.splice(newIndex, 0, moved);

    setImages(updatedImages);

    try {
      await authFetch(`/bts/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: updatedImages.map(img => img.id) }),
      });
    } catch (err) {
      console.error('Reorder error:', err);
      load();
    }
  };

  const getCategoryLabel = (category) => {
    if (category === 'bts') return '🎬 BTS';
    if (category === 'moodboard') return '🎨 Moodboard';
    return '🎬 BTS';
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="admin-bts">
      <div className="admin-bts__header">
        <div>
          <h1 className="admin-page__title">BTS & Moodboards</h1>
          <p className="admin-page__subtitle">
            Manage behind-the-scenes photos and moodboards linked to projects.
          </p>
        </div>
        <button className="admin-btn" onClick={() => {
          resetForm();
          setShowForm(!showForm);
        }}>
          {showForm ? 'Cancel' : '+ Add New'}
        </button>
      </div>

      {message && <p className="admin-bts__message">{message}</p>}
      {error && <p className="admin-page__error">{error}</p>}

      {/* Create/Edit Form - FIXED MODAL */}
      {showForm && (
        <div className="admin-bts__modal-overlay">
          <div className="admin-bts__modal">
            <div className="admin-bts__modal-header">
              <h2>{editingId ? 'Edit BTS Image' : 'Add New BTS Image'}</h2>
              <button 
                className="admin-bts__modal-close"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={editingId ? handleUpdate : handleCreate}>
              <label>
                Title
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. Behind the Scenes: Project XYZ"
                />
              </label>
              <label>
                Caption (optional)
                <input
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="Brief description"
                />
              </label>
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="bts">🎬 Behind the Scenes</option>
                  <option value="moodboard">🎨 Moodboard</option>
                </select>
              </label>
              <label>
                Linked Project (optional)
                <select
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                >
                  <option value="">None</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                />
                Publish immediately
              </label>
              <div className="admin-bts__modal-actions">
                <button 
                  type="button" 
                  className="admin-btn admin-btn--ghost"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button className="admin-btn" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {images.length === 0 ? (
        <p className="admin-bts__empty">No BTS images yet. Create one above.</p>
      ) : (
        <div className="admin-bts__grid">
          {images.map((image, index) => (
            <div className="admin-bts__card" key={image.id}>
              <div className="admin-bts__card-image">
                {image.imageKey ? (
                  <img 
                    src={`${API_BASE}/images/${image.imageKey}`} 
                    alt={image.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span class="admin-bts__no-image">No image</span>`;
                    }}
                  />
                ) : (
                  <span className="admin-bts__no-image">No image uploaded</span>
                )}
                {!image.isPublished && (
                  <span className="admin-bts__badge">Draft</span>
                )}
                <span className={`admin-bts__category-badge ${image.category === 'moodboard' ? 'admin-bts__category-badge--moodboard' : ''}`}>
                  {getCategoryLabel(image.category)}
                </span>
                {image.project && (
                  <span className="admin-bts__project-badge">
                    📁 {image.project.title}
                  </span>
                )}
              </div>
              <div className="admin-bts__card-info">
                <h3 className="admin-bts__card-title">{image.title}</h3>
                {image.caption && (
                  <p className="admin-bts__card-caption">{image.caption}</p>
                )}
                <div className="admin-bts__card-actions">
                  <label className="admin-btn admin-btn--small">
                    {uploading[image.id] ? 'Uploading…' : image.imageKey ? 'Replace Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={uploading[image.id]}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleUpload(image.id, e.target.files[0]);
                        }
                        e.target.value = '';
                      }}
                      hidden
                    />
                  </label>
                  <button
                    className="admin-btn admin-btn--small admin-btn--ghost"
                    onClick={() => handleEdit(image)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-btn admin-btn--small admin-btn--ghost"
                    onClick={() => handleTogglePublish(image.id, image.isPublished)}
                  >
                    {image.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    className="admin-btn admin-btn--small admin-btn--danger"
                    onClick={() => handleDelete(image.id, image.title)}
                  >
                    Delete
                  </button>
                </div>
                <div className="admin-bts__card-reorder">
                  <button
                    className="admin-btn admin-btn--small admin-btn--ghost"
                    onClick={() => handleReorder(image.id, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    className="admin-btn admin-btn--small admin-btn--ghost"
                    onClick={() => handleReorder(image.id, 'down')}
                    disabled={index === images.length - 1}
                  >
                    ↓
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