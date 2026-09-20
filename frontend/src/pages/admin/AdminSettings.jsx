import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminSettings.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminSettings() {
  const { authFetch } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [logoBusy, setLogoBusy] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then((r) => r.json())
      .then(setForm)
      .finally(() => setLoading(false));
  }, []);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await authFetch(`/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      const saved = await res.json();
      setForm(saved);
      setMessage('Saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

 const handleLogoUpload = async (file) => {
  if (!file) return;
  setLogoBusy(true);
  setError('');
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    // Use the new endpoint
    const res = await authFetch(`/settings/logo`, {
      method: 'POST',  // Changed from PUT to POST
      body: formData,
    });
    
    if (!res.ok) throw new Error('Logo upload failed');
    
    const data = await res.json();
    setForm((f) => ({ ...f, logoUrl: data.imageUrl }));
    setMessage('Logo uploaded successfully!');
  } catch (err) {
    setError(err.message);
  } finally {
    setLogoBusy(false);
  }
};

  if (loading || !form) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="admin-page__title">Site Settings</h1>
      <p className="admin-page__subtitle">
        Brand name, logo, contact info, and social links used across the site (footer, toggle menu).
      </p>

      {message && <p className="admin-settings__message">{message}</p>}
      {error && <p className="admin-page__error">{error}</p>}

      <form className="admin-settings__form" onSubmit={handleSave}>
        {/* Brand Name */}
        <label>
          Brand Name
          <input value={form.brandName || ''} onChange={(e) => update('brandName', e.target.value)} />
        </label>

        {/* Logo Upload */}
        <div className="admin-settings__logo-section">
          <label>Brand Logo</label>
          <div className="admin-settings__logo-row">
            <div className="admin-settings__logo-preview">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Brand Logo" className="admin-settings__logo-img" />
              ) : (
                <span className="admin-settings__logo-placeholder">No logo uploaded</span>
              )}
            </div>
            <label className="admin-btn">
              {logoBusy ? 'Uploading…' : form.logoUrl ? 'Replace Logo' : 'Upload Logo'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                disabled={logoBusy}
                onChange={(e) => handleLogoUpload(e.target.files[0])}
                hidden
              />
            </label>
            {form.logoUrl && (
              <button
                type="button"
                className="admin-btn admin-btn--danger admin-btn--small"
                onClick={() => update('logoUrl', null)}
              >
                Remove Logo
              </button>
            )}
          </div>
          <p className="admin-settings__hint">Recommended: SVG or PNG with transparent background. Max 2MB.</p>
        </div>

        <label>
          Tagline
          <input value={form.tagline || ''} onChange={(e) => update('tagline', e.target.value)} />
        </label>

        <label>
          Contact Email
          <input
            type="email"
            value={form.contactEmail || ''}
            onChange={(e) => update('contactEmail', e.target.value)}
          />
        </label>
        <label className="admin-settings__checkbox">
          <input
            type="checkbox"
            checked={form.emailEnabled !== false}
            onChange={(e) => update('emailEnabled', e.target.checked)}
          />
          Show email icon in menu
        </label>

        <label>
          Instagram URL
          <input value={form.instagramUrl || ''} onChange={(e) => update('instagramUrl', e.target.value)} />
        </label>
        <label className="admin-settings__checkbox">
          <input
            type="checkbox"
            checked={form.instagramEnabled !== false}
            onChange={(e) => update('instagramEnabled', e.target.checked)}
          />
          Show Instagram icon in menu
        </label>

        <label>
          Facebook URL
          <input value={form.facebookUrl || ''} onChange={(e) => update('facebookUrl', e.target.value)} />
        </label>
        <label className="admin-settings__checkbox">
          <input
            type="checkbox"
            checked={form.facebookEnabled !== false}
            onChange={(e) => update('facebookEnabled', e.target.checked)}
          />
          Show Facebook icon in menu
        </label>

        <label>
          TikTok URL
          <input value={form.tiktokUrl || ''} onChange={(e) => update('tiktokUrl', e.target.value)} />
        </label>
        <label className="admin-settings__checkbox">
          <input
            type="checkbox"
            checked={form.tiktokEnabled !== false}
            onChange={(e) => update('tiktokEnabled', e.target.checked)}
          />
          Show TikTok icon in menu
        </label>

        <label>
          WhatsApp Number (digits only, with country code, e.g. 2348012345678)
          <input value={form.whatsappNumber || ''} onChange={(e) => update('whatsappNumber', e.target.value)} />
        </label>
        <label className="admin-settings__checkbox">
          <input
            type="checkbox"
            checked={form.whatsappEnabled !== false}
            onChange={(e) => update('whatsappEnabled', e.target.checked)}
          />
          Show WhatsApp icon in menu
        </label>

        <label>
          LinkedIn URL
          <input value={form.linkedinUrl || ''} onChange={(e) => update('linkedinUrl', e.target.value)} />
        </label>
        <label className="admin-settings__checkbox">
          <input
            type="checkbox"
            checked={form.linkedinEnabled !== false}
            onChange={(e) => update('linkedinEnabled', e.target.checked)}
          />
          Show LinkedIn icon in menu
        </label>

        <label>
          Footer Text
          <textarea
            rows={3}
            value={form.footerText || ''}
            onChange={(e) => update('footerText', e.target.value)}
          />
        </label>

        <button className="admin-btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}