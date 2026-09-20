// pages/About.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ManagedImage from '../components/ManagedImage';
import './About.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function About() {
  const [aboutData, setAboutData] = useState(null);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/about`).then(r => r.json()),
      fetch(`${API_BASE}/projects`).then(r => r.json())
    ])
      .then(([about, projects]) => {
        setAboutData(about);
        const shuffled = [...projects].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2);
        setFeaturedProjects(selected);
        setLoading(false);
      })
      .catch(() => {
        setAboutData(null);
        setFeaturedProjects([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && aboutData) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading, aboutData]);

  if (loading) {
    return (
      <main className="about-page">
        <div className="about-container">
          <div className="about-loading">Loading...</div>
        </div>
      </main>
    );
  }

  if (!aboutData) {
    return (
      <main className="about-page">
        <div className="about-container">
          <p>About content not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="about-page">
      <div className="about-container">
        {/* Hero Section */}
        <div className={`about-hero-section ${isVisible ? 'about-hero-section--visible' : ''}`}>
          <div className="about-hero-content">
            <h1 className="about-title">{aboutData.title || 'About'}</h1>
            <div className="about-hero-line"></div>
            {aboutData.content && (
              <p className="about-hero-text">{aboutData.content}</p>
            )}
          </div>
          {aboutData.heroImageKey && (
            <div className="about-hero-image-wrapper">
              <div className="about-hero-image">
                <ManagedImage 
                  imageKey={aboutData.heroImageKey} 
                  fallbackAlt={aboutData.title || 'About'} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Section */}
        {aboutData.stats && aboutData.stats.length > 0 && (
          <div className={`about-stats-modern ${isVisible ? 'about-stats-modern--visible' : ''}`}>
            {aboutData.stats.map((stat, index) => (
              <div className="about-stat-card" key={stat.id || index}>
                <span className="about-stat-number">{stat.number}</span>
                <span className="about-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Content Sections (Approach & Philosophy) */}
        {aboutData.sections && aboutData.sections.length > 0 && (
          <div className={`about-sections-modern ${isVisible ? 'about-sections-modern--visible' : ''}`}>
            {aboutData.sections.map((section, index) => (
              <div 
                key={section.id || index} 
                className="about-section-modern"
              >
                <div className="about-section-modern__content">
                  <div className="about-section-modern__number">0{index + 1}</div>
                  {section.title && <h2 className="about-section-modern__title">{section.title}</h2>}
                  {section.text && <p className="about-section-modern__text">{section.text}</p>}
                  {section.subText && <p className="about-section-modern__subtext">{section.subText}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Values Section */}
        {aboutData.coreValues && aboutData.coreValues.length > 0 && (
          <div className={`about-values-modern ${isVisible ? 'about-values-modern--visible' : ''}`}>
            <div className="about-values-header">
              <h2 className="about-values__title">{aboutData.valuesTitle || 'Our Values'}</h2>
              <div className="about-values-line"></div>
            </div>
            <div className="about-values__grid-modern">
              {aboutData.coreValues.map((value, index) => (
                <div className="about-values__card" key={value.id || index}>
                  <div className="about-values__card-icon">
                    {value.icon || '✦'}
                  </div>
                  <h3 className="about-values__item-title">{value.title}</h3>
                  <p className="about-values__item-text">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}