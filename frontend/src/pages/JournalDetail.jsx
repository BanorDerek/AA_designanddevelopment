// pages/JournalDetail.jsx - Complete with correct layout
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MediaCarousel from '../components/MediaCarousel';
import './JournalDetail.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function JournalDetail() {
  const { slug } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/journal/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setEntry(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!loading && entry) {
      const timer = setTimeout(() => setIsVisible(true), 400);
      return () => clearTimeout(timer);
    }
  }, [loading, entry]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Build gallery items for the carousel
  const carouselItems = (entry?.images || []).map((img) => ({
    id: img.id,
    type: 'image',
    url: `${API_BASE}/images/${img.imageKey}`,
    caption: img.caption || '',
  }));

  if (loading) return <main className="journal-detail-page" />;
  if (!entry) {
    return (
      <main className="journal-detail-page">
        <div className="journal-detail-container">
          <p>Journal entry not found. <Link to="/journal">Back to Journal</Link></p>
        </div>
      </main>
    );
  }

  const details = entry.details || [];

  return (
    <main className="journal-detail-page">
      {/* Hero Section -  */}
      <section className={`journal-detail__hero ${isVisible ? 'journal-detail__hero--visible' : ''}`}>
        <img src={`${API_BASE}/images/${entry.coverImageKey}`} alt={entry.title} />
        <div className="journal-detail__hero-overlay">
          <Link to="/journal" className="journal-detail__back">
            ← Back to Journal
          </Link>
          <h1 className="journal-detail__hero-title">{entry.title}</h1>
          <div className="journal-detail__hero-meta">
            <span>{entry.author}</span>
            <span className="journal-detail__hero-dot">•</span>
            <span>{formatDate(entry.date)}</span>
          </div>
        </div>
      </section>
          {/* PROJECT DETAILS SECTION - After article */}
       {details.length > 0 && (
        <section className={`journal-detail__details ${isVisible ? 'journal-detail__details--visible' : ''}`}>
          <div className="journal-detail__details-container">

            <div className="journal-detail__details-grid">
              {details.map((detail, index) => (
                <div className="journal-detail__details-item" key={detail.id || index}>
                  <span className="journal-detail__details-label">{detail.header}</span>
                  <span className="journal-detail__details-value">{detail.description}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
       {/* ARTICLE CONTENT SECTION - After slider, left aligned */}
      {entry.content && (
        <section className={`journal-detail__article-section ${isVisible ? 'journal-detail__article-section--visible' : ''}`}>
          <div className="journal-detail__article-wrapper">
            <article className="journal-detail__article">
              {entry.content.split('\n').map((paragraph, index) => {
                if (!paragraph.trim()) return null;
                return <p key={index}>{paragraph.trim()}</p>;
              })}
            </article>
          </div>
        </section>
      )}

      {/* GALLERY CAROUSEL SECTION - After hero */}
      {carouselItems.length > 0 && (
        <section className={`journal-detail__carousel ${isVisible ? 'journal-detail__carousel--visible' : ''}`}>
          <div className="journal-detail__carousel-container">
            <MediaCarousel items={carouselItems} />
          </div>
        </section>
      )}

     

  
     
    </main>
  );
}