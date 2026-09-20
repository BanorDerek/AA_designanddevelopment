import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminProjectEdit.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminProjectEdit() {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [form, setForm] = useState({ 
    title: '', 
    slug: '', 
    description: '',
    details: [] // Array of { label: string, value: string }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [coverBusy, setCoverBusy] = useState(false);
  const [galleryBusyId, setGalleryBusyId] = useState(null);
  const [addingImage, setAddingImage] = useState(false);
  const [videoBusyId, setVideoBusyId] = useState(null);
  const [addingVideo, setAddingVideo] = useState(false);

  const load = () => {
    setLoading(true);
    authFetch(`/projects/admin/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data);
        setForm({ 
          title: data.title, 
          slug: data.slug, 
          description: data.description || '',
          details: data.details || []
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await authFetch(`/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async (file) => {
    if (!file) return;
    setCoverBusy(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      await authFetch(`/projects/${id}/cover-image`, { method: 'POST', body: formData });
      load();
    } finally {
      setCoverBusy(false);
    }
  };

  const handleAddGalleryImage = async (file) => {
    if (!file) return;
    setAddingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('orderIndex', (project.images || []).length);
      await authFetch(`/projects/${id}/images`, { method: 'POST', body: formData });
      load();
    } finally {
      setAddingImage(false);
    }
  };

  const handleReplaceGalleryImage = async (imageId, file) => {
    if (!file) return;
    setGalleryBusyId(imageId);
    try {
      const formData = new FormData();
      formData.append('image', file);
      await authFetch(`/projects/images/${imageId}`, { method: 'PUT', body: formData });
      load();
    } finally {
      setGalleryBusyId(null);
    }
  };

  const handleCaptionBlur = async (imageId, caption) => {
    await authFetch(`/projects/images/${imageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption }),
    });
  };

  const handleDeleteGalleryImage = async (imageId) => {
    if (!confirm('Remove this image from the gallery?')) return;
    setGalleryBusyId(imageId);
    try {
      await authFetch(`/projects/images/${imageId}`, { method: 'DELETE' });
      load();
    } finally {
      setGalleryBusyId(null);
    }
  };

  // Details handlers
  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...form.details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setForm({ ...form, details: updatedDetails });
  };

  const handleAddDetail = () => {
    setForm({
      ...form,
      details: [...form.details, { label: '', value: '' }]
    });
  };

  const handleRemoveDetail = (index) => {
    const updatedDetails = form.details.filter((_, i) => i !== index);
    setForm({ ...form, details: updatedDetails });
  };

  // Video handlers
  const handleAddVideo = async (file) => {
    if (!file) return;
    
    if (file.size > 100 * 1024 * 1024) {
      setError('Video file must be under 100MB');
      return;
    }
    
    setAddingVideo(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('orderIndex', (project.videos || []).length);
      await authFetch(`/projects/${id}/videos`, { method: 'POST', body: formData });
      load();
    } catch (err) {
      setError('Failed to upload video');
      console.error(err);
    } finally {
      setAddingVideo(false);
    }
  };

  const handleReplaceVideo = async (videoId, file) => {
    if (!file) return;
    setVideoBusyId(videoId);
    try {
      const formData = new FormData();
      formData.append('video', file);
      await authFetch(`/projects/videos/${videoId}/replace`, { method: 'PUT', body: formData });
      load();
    } finally {
      setVideoBusyId(null);
    }
  };

  const handleVideoCaptionBlur = async (videoId, caption) => {
    await authFetch(`/projects/videos/${videoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption }),
    });
  };

  const handleDeleteVideo = async (videoId) => {
    if (!confirm('Remove this video from the project?')) return;
    setVideoBusyId(videoId);
    try {
      await authFetch(`/projects/videos/${videoId}`, { method: 'DELETE' });
      load();
    } finally {
      setVideoBusyId(null);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (!project) return <p>Project not found.</p>;

  const videos = project.videos || [];

  return (
    <div>
      <Link to="/admin/projects" className="admin-project-edit__back">← All Projects</Link>
      <h1 className="admin-page__title">{project.title}</h1>

      <section className="admin-project-edit__section">
        <h2>Details</h2>
        <form className="admin-project-edit__form" onSubmit={handleSaveDetails}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </label>
          <label>
            Slug
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              required
            />
          </label>
          
          {/* Project Details - Flexible fields */}
          <div className="admin-project-edit__details-section">
            <h3>Project Details (Left Column)</h3>
            <p className="admin-page__subtitle">
              Add custom details that will appear on the left side of the project page.
            </p>
            
            {form.details.map((detail, index) => (
              <div key={index} className="admin-project-edit__detail-row">
                <input
                  type="text"
                  placeholder="Label (e.g., Photography, Address, Year)"
                  value={detail.label}
                  onChange={(e) => handleDetailChange(index, 'label', e.target.value)}
                  className="admin-project-edit__detail-label"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., John Doe, 123 Main St, 2024)"
                  value={detail.value}
                  onChange={(e) => handleDetailChange(index, 'value', e.target.value)}
                  className="admin-project-edit__detail-value"
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--small admin-btn--danger"
                  onClick={() => handleRemoveDetail(index)}
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button
              type="button"
              className="admin-btn admin-btn--small admin-btn--add"
              onClick={handleAddDetail}
            >
              + Add Detail
            </button>
          </div>

          {/* Description - Right Column */}
          <label>
            Description (Right Column)
            <textarea
              rows={6}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Full project description..."
            />
          </label>

          {error && <p className="admin-page__error">{error}</p>}
          <button className="admin-btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Details'}
          </button>
        </form>
      </section>

      <section className="admin-project-edit__section">
        <h2>Cover Image</h2>
        <div className="admin-project-edit__cover">
          <div className="admin-project-edit__cover-preview">
            {project.coverImageUrl ? (
              <img src={project.coverImageUrl} alt={project.title} />
            ) : (
              <span>No cover image set</span>
            )}
          </div>
          <label className="admin-btn">
            {coverBusy ? 'Uploading…' : project.coverImageUrl ? 'Replace Cover' : 'Upload Cover'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={coverBusy}
              onChange={(e) => handleCoverUpload(e.target.files[0])}
              hidden
            />
          </label>
        </div>
      </section>

      {/* Videos Section */}
      <section className="admin-project-edit__section">
        <h2>Videos</h2>
        <p className="admin-page__subtitle">
          Upload multiple videos for this project. Videos will appear alongside images in the gallery.
          Supported formats: MP4, MOV, WebM (max 100MB each).
        </p>

        <div className="admin-project-edit__videos">
          {videos.map((video) => (
            <div className="admin-project-edit__video-item" key={video.id}>
              <div className="admin-project-edit__video-preview">
                <video controls style={{ maxWidth: '100%', maxHeight: '200px' }}>
                  <source src={video.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <input
                className="admin-project-edit__caption-input"
                placeholder="Video caption (optional)"
                defaultValue={video.caption || ''}
                onBlur={(e) => handleVideoCaptionBlur(video.id, e.target.value)}
              />
              <div className="admin-project-edit__video-actions">
                <label className="admin-btn admin-btn--small">
                  {videoBusyId === video.id ? 'Replacing…' : 'Replace'}
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/mpeg"
                    disabled={videoBusyId === video.id}
                    onChange={(e) => handleReplaceVideo(video.id, e.target.files[0])}
                    hidden
                  />
                </label>
                <button
                  className="admin-btn admin-btn--small admin-btn--danger"
                  disabled={videoBusyId === video.id}
                  onClick={() => handleDeleteVideo(video.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          <label className="admin-project-edit__add-video-tile">
            {addingVideo ? 'Uploading…' : '+ Add Video'}
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/mpeg"
              disabled={addingVideo}
              onChange={(e) => handleAddVideo(e.target.files[0])}
              hidden
            />
          </label>
        </div>
      </section>

      {/* Gallery Images Section */}
      <section className="admin-project-edit__section">
        <h2>Gallery Images</h2>
        <p className="admin-page__subtitle">
          Shown in the image carousel on this project's detail page.
        </p>

        <div className="admin-project-edit__gallery">
          {(project.images || []).map((img) => (
            <div className="admin-project-edit__gallery-item" key={img.id}>
              <img src={img.imageUrl} alt={img.caption || ''} />
              <input
                className="admin-project-edit__caption-input"
                placeholder="Caption (optional)"
                defaultValue={img.caption || ''}
                onBlur={(e) => handleCaptionBlur(img.id, e.target.value)}
              />
              <div className="admin-project-edit__gallery-actions">
                <label className="admin-btn admin-btn--small">
                  {galleryBusyId === img.id ? 'Working…' : 'Replace'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={galleryBusyId === img.id}
                    onChange={(e) => handleReplaceGalleryImage(img.id, e.target.files[0])}
                    hidden
                  />
                </label>
                <button
                  className="admin-btn admin-btn--small admin-btn--danger"
                  disabled={galleryBusyId === img.id}
                  onClick={() => handleDeleteGalleryImage(img.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          <label className="admin-project-edit__add-tile">
            {addingImage ? 'Uploading…' : '+ Add Image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={addingImage}
              onChange={(e) => handleAddGalleryImage(e.target.files[0])}
              hidden
            />
          </label>
        </div>
      </section>
    </div>
  );
}