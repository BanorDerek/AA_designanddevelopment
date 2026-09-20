// pages/Awards.jsx
import { useEffect, useState } from 'react';
import './Awards.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Awards() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/about`)
      .then(r => r.json())
      .then(data => {
        setAboutData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setIsVisible(true), 400);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Trophy emojis with different styles
  const getTrophy = (index, year) => {
    if (index === 0) return '🏆'; // Gold trophy for first/featured
    if (index === 1) return '🥈'; // Silver medal for second
    if (index === 2) return '🥉'; // Bronze medal for third
    return '✨'; // Star for others
  };

  // Helper to determine award level
  const getAwardLevel = (index) => {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    return null;
  };

  if (loading) {
    return (
      <main className="awards-page">
        <div className="awards-container">
          <p className="awards-empty">Loading...</p>
        </div>
      </main>
    );
  }

  const awards = aboutData?.awards || [];

  return (
    <main className="awards-page">
      <div className="awards-container">
        {/* Hero Section */}
        <div className={`awards-hero-section ${isVisible ? 'awards-hero-section--visible' : ''}`}>
          <div className="awards-hero-content">
            <span className="awards-hero-badge">Accolades</span>
            <h1 className="awards-title">Awards &amp; Recognitions</h1>
            <div className="awards-hero-line"></div>
            <p className="awards-hero-text">
              Celebrating excellence in design and architecture — recognized by industry leaders.
            </p>
          </div>
          <div></div>
        </div>

        {/* Awards Grid */}
        {awards.length > 0 ? (
          <div className={`awards-grid-section ${isVisible ? 'awards-grid-section--visible' : ''}`}>
            <div className="awards-grid">
              {awards.map((award, index) => {
                const level = getAwardLevel(index);
                const isFeatured = index === 0 && awards.length > 2;
                const trophy = getTrophy(index, award.year);
                
                let className = 'award-card';
                if (level === 'gold') className += ' award-card--gold';
                if (level === 'silver') className += ' award-card--silver';
                if (isFeatured) className += ' award-card--featured';
                
                return (
                  <div 
                    key={award.id || index} 
                    className={className}
                    style={{ '--card-delay': index * 0.08 }}
                  >
                    <span className="award-trophy">{trophy}</span>
                    <span className="award-year">{award.year}</span>
                    <h3 className="award-title">{award.title}</h3>
                    {award.organization && (
                      <p className="award-organization">{award.organization}</p>
                    )}
                    {award.description && (
                      <p className="award-description">{award.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="awards-empty">No awards have been added yet.</p>
        )}
      </div>
    </main>
  );
}