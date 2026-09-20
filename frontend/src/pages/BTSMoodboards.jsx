// pages/BTSMoodboards.jsx
import { useEffect, useState } from 'react';
import './BTSMoodboards.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function BTSMoodboards() {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Categories - Only BTS and Moodboard
  const categories = [
    { value: 'all', label: 'All' },
    { value: 'bts', label: 'Behind the Scenes' },
    { value: 'moodboard', label: 'Moodboards' },
  ];

  useEffect(() => {
    fetch(`${API_BASE}/bts`)
      .then(r => r.json())
      .then(data => {
        setImages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setImages([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setIsVisible(true), 400);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(img => img.category === activeCategory));
    }
  }, [activeCategory, images]);

  const formatNumber = (num) => {
    return String(num).padStart(2, '0');
  };

  if (loading) {
    return (
      <main className="bts-page">
        <div className="bts-container">
          <p className="bts-loading">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bts-page">
      <div className="bts-container">
        {/* Top Navigation */}
        <header className={`bts-topbar ${isVisible ? 'bts-topbar--visible' : ''}`}>
          <div className="bts-brand">BTS &amp; Moodboards</div>
          <nav className="bts-category-nav" aria-label="BTS categories">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.value}
                className={`bts-category-nav__item ${
                  activeCategory === cat.value ? 'bts-category-nav__item--active' : ''
                }`}
                onClick={() => setActiveCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </header>

        {/* Image Grid */}
        {filteredImages.length > 0 ? (
          <section className={`bts-grid-section ${isVisible ? 'bts-grid-section--visible' : ''}`}>
            <div className="bts-grid">
              {filteredImages.map((image, index) => {
                const imageNumber = formatNumber(index + 1);
                
                return (
                  <div
                    className={`bts-card ${isVisible ? 'bts-card--visible' : ''}`}
                    key={image.id}
                    style={{ '--card-delay': `${index * 80}ms` }}
                  >
                    <div className="bts-card__frame">
                      <img
                        src={`${API_BASE}/images/${image.imageKey}`}
                        alt={image.title || image.caption || 'BTS image'}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="bts-card__number-badge">
                        <span className="bts-card__number">{imageNumber}</span>
                      </div>
                      <div className="bts-card__overlay">
                        {image.title && (
                          <span className="bts-card__title">{image.title}</span>
                        )}
                        {image.caption && (
                          <span className="bts-card__caption">{image.caption}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="bts-empty-state">
            <p>No {activeCategory !== 'all' ? activeCategory === 'bts' ? 'Behind the Scenes' : 'Moodboard' : ''} images available yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}