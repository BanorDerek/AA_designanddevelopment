// pages/admin/AdminJournalDetails.jsx - Complete with Gallery Images
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminJournalDetails.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminJournalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const [journal, setJournal] = useState(null);
  const [details, setDetails] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ header: '', description: '' });
  const [editingDetailId, setEditingDetailId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      authFetch(`/journal/admin/all`).then(r => r.json()),
      authFetch(`/journal/${id}/details`).then(r => r.json())
    ])
      .then(([entries, detailsData]) => {
        const entry = entries.find(e => e.id === id);
        setJournal(entry);
        setImages(entry?.images || []);
        setDetails(Array.isArray(detailsData) ? detailsData : []);
        setError('');
      })
      .catch((err) => {
        console.error('Error loading:', err);
        setError('Failed to load data');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const resetForm = () => {
    setForm({ header: '', description: '' });
    setEditingDetailId(null);
  };

  // ============================================================
  // DETAILS CRUD
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const isEditing = editingDetailId !== null;
      const url = isEditing ? `/journal/details/${editingDetailId}` : `/journal/${id}/details`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          header: form.header,
          description: form.description,
        }),
      });
      if (!res.ok) throw new Error(isEditing ? 'Failed to update' : 'Failed to create');

      setMessage(isEditing ? 'Detail updated successfully!' : 'Detail added successfully!');
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (detail) => {
    setForm({ header: detail.header, description: detail.description });
    setEditingDetailId(detail.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDetail = async (detailId, header) => {
    if (!confirm(`Delete "${header}"?`)) return;
    try {
      const res = await authFetch(`/journal/details/${detailId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      load();
      setMessage('Detail deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    resetForm();
    setMessage('');
    setError('');
  };

  // ============================================================
  // GALLERY IMAGES CRUD
  // ============================================================
  const handleUploadGalleryImages = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    setError('');
    setMessage('');

    try {
      let uploadedCount = 0;
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        
        const res = await authFetch(`/journal/${id}/images`, { 
          method: 'POST', 
          body: formData 
        });
        
        if (res.ok) {
          uploadedCount++;
        }
      }

      load();
      setMessage(`${uploadedCount} image${uploadedCount > 1 ? 's' : ''} uploaded successfully!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Delete this image?')) return;
    try {
      const res = await authFetch(`/journal/${id}/images/${imageId}`, { 
        method: 'DELETE' 
      });
      if (!res.ok) throw new Error('Failed to delete');
      load();
      setMessage('Image deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (!journal) return <p>Journal entry not found. <Link to="/admin/journal">Back to Journal</Link></p>;

  return (
    <div className="admin-journal-details">
      <div className="admin-journal-details__header">
        <div>
          <Link to="/admin/journal" className="admin-journal-details__back">← Back to Journal</Link>
          <h1 className="admin-page__title">Manage Journal: {journal.title}</h1>
          <p className="admin-page__subtitle">
            Manage gallery images and details for this journal entry.
          </p>
        </div>
      </div>

      {message && <p className="admin-journal-details__message">{message}</p>}
      {error && <p className="admin-page__error">{error}</p>}

      {/* ============================================================
          GALLERY IMAGES SECTION
          ============================================================ */}
      <div className="admin-journal-details__section">
        <h2 className="admin-journal-details__section-title">
          Gallery Images
          <span className="admin-journal-details__section-count">{images.length} images</span>
        </h2>
        
        <div className="admin-journal-details__upload-area">
          <label className="admin-journal-details__upload-btn admin-btn admin-btn--primary">
            {uploadingImages ? 'Uploading...' : '📷 Upload Images (Select Multiple)'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              disabled={uploadingImages}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleUploadGalleryImages(e.target.files);
                }
                e.target.value = '';
              }}
              hidden
            />
          </label>
          <span className="admin-journal-details__upload-hint">Select multiple images at once (Ctrl+Click or Shift+Click)</span>
        </div>

        {images.length > 0 ? (
          <div className="admin-journal-details__image-grid">
            {images.map((img) => (
              <div className="admin-journal-details__image-item" key={img.id}>
                <img 
                  src={`${API_BASE}/images/${img.imageKey}`} 
                  alt={img.caption || 'Gallery image'} 
                />
                <button
                  className="admin-journal-details__image-remove"
                  onClick={() => handleDeleteImage(img.id)}
                  title="Delete image"
                >
                  ×
                </button>
                {img.caption && (
                  <span className="admin-journal-details__image-caption">{img.caption}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-journal-details__empty">No gallery images yet. Upload some above.</p>
        )}
      </div>

      {/* ============================================================
          DETAILS SECTION (Header | Description)
          ============================================================ */}
      <div className="admin-journal-details__section">
        <h2 className="admin-journal-details__section-title">
          Project Details
          <span className="admin-journal-details__section-count">{details.length} details</span>
        </h2>

        {/* Add/Edit Detail Form */}
        <form className="admin-journal-details__form" onSubmit={handleSubmit}>
          <h3 className="admin-journal-details__form-title">
            {editingDetailId ? 'Edit Detail' : 'Add New Detail'}
          </h3>
          <div className="admin-journal-details__form-row">
            <div className="admin-journal-details__form-group">
              <label>Header <span className="admin-journal__required">*</span>
                <input
                  value={form.header}
                  onChange={(e) => setForm({ ...form, header: e.target.value })}
                  required
                  placeholder="e.g. Architecture, Interior Design, Location"
                />
              </label>
            </div>
            <div className="admin-journal-details__form-group">
              <label>Description <span className="admin-journal__required">*</span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  placeholder="Detailed description for this section..."
                />
              </label>
            </div>
          </div>
          <div className="admin-journal-details__form-actions">
            {editingDetailId && (
              <button type="button" className="admin-btn admin-btn--ghost" onClick={handleCancel}>
                Cancel Edit
              </button>
            )}
            <button className="admin-btn admin-btn--primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingDetailId ? 'Update Detail' : 'Add Detail'}
            </button>
          </div>
        </form>

        {/* Details List */}
        {details.length === 0 ? (
          <p className="admin-journal-details__empty">No details yet. Add one above.</p>
        ) : (
          <div className="admin-journal-details__list">
            {details.map((detail, index) => (
              <div className="admin-journal-details__item" key={detail.id}>
                <div className="admin-journal-details__item-number">{String(index + 1).padStart(2, '0')}</div>
                <div className="admin-journal-details__item-content">
                  <h3 className="admin-journal-details__item-header">{detail.header}</h3>
                  <p className="admin-journal-details__item-description">{detail.description}</p>
                </div>
                <div className="admin-journal-details__item-actions">
                  <button
                    className="admin-btn admin-btn--small admin-btn--ghost"
                    onClick={() => handleEdit(detail)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-btn admin-btn--small admin-btn--danger"
                    onClick={() => handleDeleteDetail(detail.id, detail.header)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}