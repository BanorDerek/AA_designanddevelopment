// pages/admin/AdminAbout.jsx - Partners section updated (name and description removed)
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminAbout.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const uid = () => Math.random().toString(36).slice(2, 9);

export default function AdminAbout() {
  const { authFetch } = useAuth();
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroBusy, setHeroBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState({});
  const [partnerUploading, setPartnerUploading] = useState({});

  const load = () => {
    setLoading(true);
    fetch(`${API_BASE}/about`)
      .then((r) => r.json())
      .then((data) => {
        console.log('📋 About data loaded:', data);
        setAbout(data);
        return fetch(`${API_BASE}/images`);
      })
      .then((r) => r.json())
      .then((images) => {
        const urlMap = {};
        images.forEach(img => {
          urlMap[img.key] = img.imageUrl;
        });
        console.log('📸 Image URLs loaded:', Object.keys(urlMap).length, 'images');
        console.log('📸 Image keys:', Object.keys(urlMap));
        setImageUrls(urlMap);
      })
      .catch((err) => {
        console.error('Error loading:', err);
        setError('Failed to load data');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const update = (field, value) => setAbout((a) => ({ ...a, [field]: value }));

  const updateListItem = (listField, index, key, value) => {
    setAbout((a) => {
      const list = [...(a[listField] || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...a, [listField]: list };
    });
  };

  const addListItem = (listField, defaults) => {
    setAbout((a) => ({
      ...a,
      [listField]: [...(a[listField] || []), { id: uid(), ...defaults }],
    }));
  };

  const removeListItem = (listField, index) => {
    setAbout((a) => {
      const list = [...(a[listField] || [])];
      list.splice(index, 1);
      return { ...a, [listField]: list };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await authFetch(`/about`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(about),
      });
      if (!res.ok) throw new Error('Failed to save');
      const saved = await res.json();
      setAbout(saved);
      setMessage('Saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleHeroUpload = async (file) => {
    if (!file) return;
    setHeroBusy(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await authFetch(`/about/hero-image`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Hero upload failed');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setHeroBusy(false);
    }
  };

  const handlePartnerLogoUpload = async (partnerId, file) => {
    if (!file) return;
    setPartnerUploading(prev => ({ ...prev, [partnerId]: true }));
    setError('');
    setMessage('');
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('📤 Uploading logo for partner:', partnerId);
      console.log('📤 File:', file.name, file.size, file.type);
      
      const res = await authFetch(`/about/partner-logo/${partnerId}`, { 
        method: 'POST', 
        body: formData 
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Logo upload failed');
      }
      
      console.log('✅ Upload successful:', data);
      console.log('✅ New logoKey:', data.imageKey);
      
      if (data.about) {
        setAbout(data.about);
      }
      
      if (data.imageKey && data.imageUrl) {
        setImageUrls(prev => ({
          ...prev,
          [data.imageKey]: data.imageUrl
        }));
      }
      
      setMessage('Logo uploaded successfully!');
      
      setTimeout(() => {
        load();
      }, 1000);
      
    } catch (err) {
      console.error('❌ Upload error:', err);
      setError(err.message || 'Failed to upload logo');
    } finally {
      setPartnerUploading(prev => ({ ...prev, [partnerId]: false }));
    }
  };

  const getImageUrl = (key) => {
    if (!key) return null;
    return imageUrls[key] || null;
  };

  if (loading) return <p>Loading…</p>;
  if (!about) return <p>Could not load About content.</p>;

  return (
    <div className="admin-about">
      <div className="admin-about__header">
        <div>
          <h1 className="admin-page__title">About Page</h1>
          <p className="admin-page__subtitle">
            Manage all about page content, including Awards & Partners.
          </p>
        </div>
        <button className="admin-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {message && <p className="admin-about__message">{message}</p>}
      {error && <p className="admin-page__error">{error}</p>}

      {/* Basic Content */}
      <section className="admin-about__section">
        <h2>Page Content</h2>
        <label>
          Page Title
          <input value={about.title || ''} onChange={(e) => update('title', e.target.value)} />
        </label>
        <label>
          Main Content
          <textarea
            rows={5}
            value={about.content || ''}
            onChange={(e) => update('content', e.target.value)}
          />
        </label>
        <label>
          Featured Works Section Title
          <input 
            value={about.featuredWorksTitle || 'Featured Projects'} 
            onChange={(e) => update('featuredWorksTitle', e.target.value)}
            placeholder="e.g. Featured Projects"
          />
        </label>
        <label>
          Meta Description (SEO)
          <input
            value={about.metaDescription || ''}
            onChange={(e) => update('metaDescription', e.target.value)}
          />
        </label>
      </section>

      {/* Hero Image */}
      <section className="admin-about__section">
        <h2>Hero Image</h2>
        <div className="admin-about__hero-row">
          <div className="admin-about__preview">
            {about.heroImageKey && getImageUrl(about.heroImageKey) ? (
              <div className="admin-about__image-preview">
                <img src={getImageUrl(about.heroImageKey)} alt="Hero" />
                <span className="admin-about__preview-label">Hero Image</span>
              </div>
            ) : (
              <span className="admin-about__preview-label">No hero image set</span>
            )}
          </div>
          <label className="admin-btn">
            {heroBusy ? 'Uploading…' : about.heroImageKey ? 'Replace Hero' : 'Upload Hero'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={heroBusy}
              onChange={(e) => handleHeroUpload(e.target.files[0])}
              hidden
            />
          </label>
        </div>
      </section>

      {/* Sections */}
      <section className="admin-about__section">
        <div className="admin-about__section-header">
          <h2>Content Sections (Approach & Philosophy)</h2>
          <button
            className="admin-btn admin-btn--small"
            onClick={() => addListItem('sections', { title: '', text: '', subText: '' })}
          >
            + Add Section
          </button>
        </div>

        {(about.sections || []).map((section, i) => (
          <div className="admin-about__item" key={section.id || i}>
            <div className="admin-about__item-fields">
              <label>
                Title
                <input
                  value={section.title || ''}
                  onChange={(e) => updateListItem('sections', i, 'title', e.target.value)}
                />
              </label>
              <label>
                Text
                <textarea
                  rows={3}
                  value={section.text || ''}
                  onChange={(e) => updateListItem('sections', i, 'text', e.target.value)}
                />
              </label>
              <label>
                Sub-text (optional)
                <input
                  value={section.subText || ''}
                  onChange={(e) => updateListItem('sections', i, 'subText', e.target.value)}
                />
              </label>
            </div>
            <div className="admin-about__item-actions">
              <button
                className="admin-btn admin-btn--small admin-btn--danger"
                onClick={() => removeListItem('sections', i)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Stats */}
      <section className="admin-about__section">
        <div className="admin-about__section-header">
          <h2>Stats</h2>
          <button
            className="admin-btn admin-btn--small"
            onClick={() => addListItem('stats', { number: '', label: '' })}
          >
            + Add Stat
          </button>
        </div>

        {(about.stats || []).map((stat, i) => (
          <div className="admin-about__item admin-about__item--inline" key={stat.id || i}>
            <input
              placeholder="Number, e.g. 120+"
              value={stat.number || ''}
              onChange={(e) => updateListItem('stats', i, 'number', e.target.value)}
            />
            <input
              placeholder="Label, e.g. Projects Completed"
              value={stat.label || ''}
              onChange={(e) => updateListItem('stats', i, 'label', e.target.value)}
            />
            <button
              className="admin-btn admin-btn--small admin-btn--danger"
              onClick={() => removeListItem('stats', i)}
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* Values */}
      <section className="admin-about__section">
        <div className="admin-about__section-header">
          <h2>Values</h2>
          <button
            className="admin-btn admin-btn--small"
            onClick={() => addListItem('coreValues', { icon: '', title: '', description: '' })}
          >
            + Add Value
          </button>
        </div>
        <label>
          Section Title
          <input value={about.valuesTitle || ''} onChange={(e) => update('valuesTitle', e.target.value)} />
        </label>

        {(about.coreValues || []).map((value, i) => (
          <div className="admin-about__item" key={value.id || i}>
            <div className="admin-about__item-fields">
              <label>
                Icon (emoji or short label)
                <input
                  value={value.icon || ''}
                  onChange={(e) => updateListItem('coreValues', i, 'icon', e.target.value)}
                />
              </label>
              <label>
                Title
                <input
                  value={value.title || ''}
                  onChange={(e) => updateListItem('coreValues', i, 'title', e.target.value)}
                />
              </label>
              <label>
                Description
                <textarea
                  rows={2}
                  value={value.description || ''}
                  onChange={(e) => updateListItem('coreValues', i, 'description', e.target.value)}
                />
              </label>
            </div>
            <div className="admin-about__item-actions">
              <button
                className="admin-btn admin-btn--small admin-btn--danger"
                onClick={() => removeListItem('coreValues', i)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Awards */}
      <section className="admin-about__section">
        <div className="admin-about__section-header">
          <h2>🏆 Awards & Recognitions</h2>
          <button
            className="admin-btn admin-btn--small"
            onClick={() => addListItem('awards', { title: '', year: '', organization: '', description: '' })}
          >
            + Add Award
          </button>
        </div>
        <label>
          Section Title
          <input 
            value={about.awardsTitle || 'Awards & Recognitions'} 
            onChange={(e) => update('awardsTitle', e.target.value)}
            placeholder="e.g. Awards & Recognitions"
          />
        </label>

        {(about.awards || []).map((award, i) => (
          <div className="admin-about__item" key={award.id || i}>
            <div className="admin-about__item-fields">
              <label>
                Award Title
                <input
                  value={award.title || ''}
                  onChange={(e) => updateListItem('awards', i, 'title', e.target.value)}
                  placeholder="e.g. Best Architecture Firm 2023"
                />
              </label>
              <label>
                Year
                <input
                  value={award.year || ''}
                  onChange={(e) => updateListItem('awards', i, 'year', e.target.value)}
                  placeholder="e.g. 2023"
                />
              </label>
              <label>
                Organization
                <input
                  value={award.organization || ''}
                  onChange={(e) => updateListItem('awards', i, 'organization', e.target.value)}
                  placeholder="e.g. Nigerian Institute of Architects"
                />
              </label>
              <label>
                Description (optional)
                <input
                  value={award.description || ''}
                  onChange={(e) => updateListItem('awards', i, 'description', e.target.value)}
                  placeholder="Brief description of the award"
                />
              </label>
            </div>
            <div className="admin-about__item-actions">
              <button
                className="admin-btn admin-btn--small admin-btn--danger"
                onClick={() => removeListItem('awards', i)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* ============================================================
          PARTNERS SECTION - UPDATED (no name, no description)
          ============================================================ */}
      <section className="admin-about__section">
        <div className="admin-about__section-header">
          <h2>🤝 Partners</h2>
          <button
            className="admin-btn admin-btn--small"
            onClick={() => addListItem('partners', { logoKey: '', url: '' })} // Only logoKey and url
          >
            + Add Partner
          </button>
        </div>
        <label>
          Section Title
          <input 
            value={about.partnersTitle || 'Our Partners'} 
            onChange={(e) => update('partnersTitle', e.target.value)}
            placeholder="e.g. Our Partners"
          />
        </label>

        {(about.partners || []).map((partner, i) => (
          <div className="admin-about__item" key={partner.id || i}>
            <div className="admin-about__item-fields">
              {/* Partner Logo Upload - ONLY THIS */}
              <div className="admin-about__logo-upload">
                <label>Logo</label>
                <div className="admin-about__logo-row">
                  {partner.logoKey ? (
                    <div className="admin-about__logo-preview">
                      <img 
                        src={`${API_BASE}/images/${partner.logoKey}`}
                        alt="Partner logo"
                        onError={(e) => {
                          console.log('❌ Image failed to load:', partner.logoKey);
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          parent.innerHTML = `<span style="font-size:0.6rem;color:#999;">⚠️ ${partner.logoKey}</span>`;
                        }}
                        onLoad={() => console.log('✅ Image loaded:', partner.logoKey)}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  ) : (
                    <span className="admin-about__logo-placeholder">No logo</span>
                  )}
                  <label className="admin-btn admin-btn--small">
                    {partnerUploading[partner.id] ? 'Uploading…' : partner.logoKey ? 'Replace Logo' : 'Upload Logo'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={partnerUploading[partner.id]}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handlePartnerLogoUpload(partner.id, e.target.files[0]);
                        }
                        e.target.value = '';
                      }}
                      hidden
                    />
                  </label>
                </div>
                <small style={{ display: 'block', marginTop: '4px' }}>
                  Logo Key: <strong>{partner.logoKey || 'None'}</strong>
                </small>
                {partner.logoKey && (
                  <small style={{ display: 'block', color: '#666', marginTop: '2px', wordBreak: 'break-all' }}>
                    URL: {`${API_BASE}/images/${partner.logoKey}`}
                  </small>
                )}
              </div>

              {/* REMOVED: Partner Name and Description fields */}
              {/* Only keep URL field for linking */}
              <label>
                Website URL
                <input
                  value={partner.url || ''}
                  onChange={(e) => updateListItem('partners', i, 'url', e.target.value)}
                  placeholder="https://example.com"
                />
              </label>
            </div>
            <div className="admin-about__item-actions">
              <button
                className="admin-btn admin-btn--small admin-btn--danger"
                onClick={() => removeListItem('partners', i)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </section>

      <button className="admin-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
}