// pages/Journal.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Journal.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/journal`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <main className="journal-page">
        <div className="journal-container">
          <p className="journal-loading">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="journal-page">
      <div className="journal-container">
        {/* Header */}
        <div className={`journal-header ${isVisible ? 'journal-header--visible' : ''}`}>
          <h1 className="journal-title">Journal</h1>
          <div className="journal-line"></div>
        </div>

        {/* Entries List - Zigzag layout */}
        {entries.length > 0 ? (
          <div className={`journal-list ${isVisible ? 'journal-list--visible' : ''}`}>
            {entries.map((entry, index) => (
              <div 
                key={entry.id} 
                className="journal-entry"
                style={{ '--entry-delay': `${index * 100}ms` }}
              >
                <Link to={`/journal/${entry.slug}`} className="journal-entry__link">
                  <div className="journal-entry__image">
                    <img 
                      src={`${API_BASE}/images/${entry.coverImageKey}`} 
                      alt={entry.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="journal-entry__content">
                    <span className="journal-entry__date">{formatDate(entry.date)}</span>
                    <h2 className="journal-entry__title">{entry.title}</h2>
                    {entry.excerpt && (
                      <p className="journal-entry__excerpt">{entry.excerpt}</p>
                    )}
                    <span className="journal-entry__read-more">Read More</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="journal-empty">No journal entries yet.</p>
        )}
      </div>
    </main>
  );
}