import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminHomeImages.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const HERO_KEYS = ['home-hero-1', 'home-hero-2', 'home-hero-3', 'home-hero-4', 'home-hero-5'];

export default function AdminHomeImages() {
  const { authFetch } = useAuth();
  const [images, setImages] = useState({});
  const [busyKey, setBusyKey] = useState(null);
  const [error, setError] = useState('');

  const loadImages = () => {
    fetch(`${API_BASE}/images`)
      .then((r) => r.json())
      .then((list) => {
        const byKey = {};
        list.forEach((img) => { byKey[img.key] = img; });
        setImages(byKey);
      });
  };

  useEffect(loadImages, []);

  const handleUpload = async (key, file) => {
    if (!file) return;
    setBusyKey(key);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await authFetch(`/images/${key}`, { method: 'PUT', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      loadImages();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyKey(null);
    }
  };

  const handleDelete = async (key) => {
    if (!confirm(`Remove the image for ${key}?`)) return;
    setBusyKey(key);
    setError('');
    try {
      const res = await authFetch(`/images/${key}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      loadImages();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div>
      <h1 className="admin-page__title">Home Page Images</h1>
      <p className="admin-page__subtitle">5 stacked hero slots shown on the home page, top to bottom.</p>
      {error && <p className="admin-page__error">{error}</p>}

      <div className="admin-home-images__grid">
        {HERO_KEYS.map((key, i) => {
          const entry = images[key];
          const busy = busyKey === key;
          return (
            <div className="admin-home-images__card" key={key}>
              <div className="admin-home-images__preview">
                {entry?.imageUrl ? (
                  <img src={entry.imageUrl} alt={`Hero ${i + 1}`} />
                ) : (
                  <span className="admin-home-images__empty">No image set</span>
                )}
              </div>
              <div className="admin-home-images__meta">
                <span>Hero {i + 1}</span>
                <div className="admin-home-images__actions">
                  <label className="admin-home-images__upload-btn">
                    {busy ? 'Working…' : entry?.imageUrl ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={busy}
                      onChange={(e) => handleUpload(key, e.target.files[0])}
                      hidden
                    />
                  </label>
                  {entry?.imageUrl && (
                    <button
                      className="admin-home-images__delete-btn"
                      disabled={busy}
                      onClick={() => handleDelete(key)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}