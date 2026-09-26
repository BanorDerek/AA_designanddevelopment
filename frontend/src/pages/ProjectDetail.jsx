import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProjectDetail.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroVisible, setHeroVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [videosVisible, setVideosVisible] = useState(false);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError('');

    fetch(`${API_BASE}/projects/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('Project not found');
        return r.json();
      })
      .then((data) => {
        setProject(data);
        // Staggered reveal to match the CSS transition delays
        setTimeout(() => setHeroVisible(true), 100);
        setTimeout(() => setDetailsVisible(true), 300);
        setTimeout(() => setGalleryVisible(true), 500);
        setTimeout(() => setVideosVisible(true), 700);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="project-detail">
        <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <p>Loading project…</p>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="project-detail">
        <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <p>{error || 'Project not found'}</p>
          <Link to="/work" className="project-detail__back" style={{ position: 'static', color: '#000', display: 'inline-block', marginTop: '1rem' }}>
            ← Back to Work
          </Link>
        </div>
      </main>
    );
  }

  // Split gallery images into rows of 1 or 2 based on the CSS grid classes
  // The original likely paired images. Here's a sensible default:
  // - First image: full width
  // - Then alternate single/double
  const images = project.images || [];
const galleryRows = [];
let i = 0;
while (i < images.length) {
  // Take two images for a "double" row
  const pair = images.slice(i, i + 2);
  if (pair.length > 0) {
    galleryRows.push({
      type: pair.length === 2 ? 'double' : 'single',
      images: pair,
    });
  }
  i += 2;

  // Take one image for a "full" row
  if (i < images.length) {
    galleryRows.push({
      type: 'full',
      images: [images[i]],
    });
    i += 1;
  }
}
  return (
    <main className="project-detail">
      {/* ================= HERO ================= */}
      <div className={`project-detail__hero ${heroVisible ? 'project-detail__hero--visible' : ''}`}>
        <Link to="/work" className="project-detail__back">
          ← Back to Work
        </Link>

        {project.section && (
          <span className="project-detail__hero-section">
            {project.section.name}
          </span>
        )}

        {project.coverImageUrl && (
          <img src={project.coverImageUrl} alt={project.title} />
        )}

        <div className="project-detail__hero-overlay">
          <h1 className="project-detail__hero-title">{project.title}</h1>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="project-detail__content">
        <div className={`project-detail__details ${detailsVisible ? 'project-detail__details--visible' : ''}`}>
          {/* Left: Meta */}
          <div className="project-detail__meta">
            <h3 className="project-detail__meta-heading">Project Details</h3>

            {Array.isArray(project.details) && project.details.length > 0 && (
              <div className="project-detail__meta-rows">
                {project.details.map((row, i) => (
                  <div className="project-detail__meta-row" key={i}>
                    <span className="project-detail__meta-label">{row.label}</span>
                    <span className="project-detail__meta-value">{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {project.description && (
              <p className="project-detail__lead">{project.description}</p>
            )}
          </div>

          {/* Right: Description */}
          <div className="project-detail__description-wrapper">
            {project.description && (
              <p className="project-detail__description">{project.description}</p>
            )}
          </div>
        </div>

        {/* Gallery */}
        {galleryRows.length > 0 && (
          <div className={`project-detail__gallery ${galleryVisible ? 'project-detail__gallery--visible' : ''}`}>
            {galleryRows.map((row, i) => (
              <div
                key={i}
                className={`project-gallery__row project-gallery__row--${row.type}`}
              >
                {row.images.map((img) => (
                  <figure key={img.id} className="project-gallery__item">
                    <img src={img.imageUrl} alt={img.caption || ''} loading="lazy" />
                    {img.caption && (
                      <figcaption className="project-gallery__caption">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= VIDEOS ================= */}
      {project.videos && project.videos.length > 0 && (
        <div className={`project-detail__videos ${videosVisible ? 'project-detail__videos--visible' : ''}`}>
          {project.videos.map((video) => (
            <div key={video.id} style={{ width: '100%' }}>
              <video
                src={video.videoUrl}
                controls
                playsInline
                style={{ width: '100%', display: 'block' }}
              />
              {video.caption && (
                <p className="project-gallery__caption" style={{ textAlign: 'center' }}>
                  {video.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}