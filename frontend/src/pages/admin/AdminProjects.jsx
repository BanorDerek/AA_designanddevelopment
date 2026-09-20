import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminProjects.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminProjects() {
  const { authFetch } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', description: '', sectionId: '' });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [sections, setSections] = useState([]);
  const [isReordering, setIsReordering] = useState(false);

  const loadProjects = () => {
    setLoading(true);
    authFetch(`/projects/admin/all`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.error('Expected array but got:', data);
          setProjects([]);
          setError('Failed to load projects: Invalid data format');
        }
      })
      .catch((err) => {
        console.error('Error loading projects:', err);
        setProjects([]);
        setError('Failed to load projects');
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadProjects, []);

  useEffect(() => {
    authFetch(`/project-sections/admin/all`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSections(data);
        } else {
          console.error('Expected sections array but got:', data);
          setSections([]);
        }
      })
      .catch((err) => {
        console.error('Error loading sections:', err);
        setSections([]);
      });
  }, []);

  const slugify = (str) =>
    str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (title) => {
    setForm((f) => ({ ...f, title, slug: slugify(title) }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await authFetch(`/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sectionId: form.sectionId || null, orderIndex: projects.length }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create project');
      }
      setForm({ title: '', slug: '', description: '', sectionId: '' });
      setShowForm(false);
      loadProjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This also removes all its gallery images. This can't be undone.`)) return;
    const res = await authFetch(`/projects/${id}`, { method: 'DELETE' });
    if (res.ok) loadProjects();
  };

  const handleTogglePublish = async (project) => {
    await authFetch(`/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !project.isPublished }),
    });
    loadProjects();
  };

  // Update project section
  const handleUpdateSection = async (projectId, sectionId) => {
    try {
      await authFetch(`/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: sectionId || null }),
      });
      loadProjects();
    } catch (err) {
      console.error('Error updating section:', err);
      setError('Failed to update section');
    }
  };

  // Reorder projects
  const handleReorder = async (projectId, direction) => {
    const currentIndex = projects.findIndex(p => p.id === projectId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === projects.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedProjects = [...projects];
    const [movedProject] = updatedProjects.splice(currentIndex, 1);
    updatedProjects.splice(newIndex, 0, movedProject);

    // Update order indices
    const reorderedProjects = updatedProjects.map((p, index) => ({
      ...p,
      orderIndex: index,
    }));

    setIsReordering(true);
    setProjects(reorderedProjects);

    try {
      // Update each project's orderIndex
      await Promise.all(
        reorderedProjects.map((p) =>
          authFetch(`/projects/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderIndex: p.orderIndex }),
          })
        )
      );
    } catch (err) {
      console.error('Error reordering projects:', err);
      setError('Failed to reorder projects');
      loadProjects(); // Reload to revert
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div>
      <div className="admin-projects__header">
        <div>
          <h1 className="admin-page__title">Projects</h1>
          <p className="admin-page__subtitle">Shown on the Select Work page.</p>
        </div>
        <button className="admin-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {showForm && (
        <form className="admin-projects__form" onSubmit={handleCreate}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </label>
          <label>
            Slug (URL)
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              required
            />
          </label>
          <label>
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label>
            Section
            <select
              value={form.sectionId || ''}
              onChange={(e) => setForm((f) => ({ ...f, sectionId: e.target.value || null }))}
            >
              <option value="">Unsectioned</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          {error && <p className="admin-page__error">{error}</p>}
          <button className="admin-btn" type="submit" disabled={creating}>
            {creating ? 'Creating…' : 'Create Project'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : projects.length === 0 ? (
        <p className="admin-page__subtitle">No projects yet — create your first one above.</p>
      ) : (
        <div className="admin-projects__grid">
          {projects.map((project, index) => (
            <div className="admin-projects__card" key={project.id}>
              <div className="admin-projects__thumb">
                {project.coverImageUrl ? (
                  <img src={project.coverImageUrl} alt={project.title} />
                ) : (
                  <span>No cover image</span>
                )}
                {!project.isPublished && <span className="admin-projects__badge">Draft</span>}
                
                {/* Reorder buttons */}
                <div className="admin-projects__reorder">
                  <button
                    className="admin-btn admin-btn--small admin-btn--reorder"
                    onClick={() => handleReorder(project.id, 'up')}
                    disabled={index === 0 || isReordering}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="admin-btn admin-btn--small admin-btn--reorder"
                    onClick={() => handleReorder(project.id, 'down')}
                    disabled={index === projects.length - 1 || isReordering}
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>
              <div className="admin-projects__meta">
                <span className="admin-projects__title">{project.title}</span>
                
                {/* Section tag */}
                {project.section && (
                  <span className="admin-products__category-tag">{project.section.name}</span>
                )}
                
                <span className="admin-projects__count">
                  {(project.images || []).length} gallery image{(project.images || []).length === 1 ? '' : 's'}
                </span>

                {/* Section update dropdown */}
                <div className="admin-projects__section-select">
                  <select
                    value={project.sectionId || ''}
                    onChange={(e) => handleUpdateSection(project.id, e.target.value)}
                    className="admin-select"
                  >
                    <option value="">Change section...</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-projects__actions">
                  <Link to={`/admin/projects/${project.id}`} className="admin-btn admin-btn--small">
                    Edit
                  </Link>
                  <button
                    className="admin-btn admin-btn--small admin-btn--ghost"
                    onClick={() => handleTogglePublish(project)}
                  >
                    {project.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    className="admin-btn admin-btn--small admin-btn--danger"
                    onClick={() => handleDelete(project.id, project.title)}
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