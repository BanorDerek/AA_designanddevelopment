// pages/Partners.jsx - ONLY LOGOS (no text)
import { useEffect, useRef, useState } from 'react';
import './Partners.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Partners() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [imageUrls, setImageUrls] = useState({});
  const [failedLogos, setFailedLogos] = useState({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const trackRef = useRef(null);
  const autoScrollTimer = useRef(null);
  const isAutoScrolling = useRef(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/about`),
      fetch(`${API_BASE}/images`)
    ])
      .then(([aboutRes, imagesRes]) => Promise.all([aboutRes.json(), imagesRes.json()]))
      .then(([about, images]) => {
        setAboutData(about);
        const urlMap = {};
        images.forEach(img => {
          urlMap[img.key] = img.imageUrl;
        });
        setImageUrls(urlMap);
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

  const updateScrollState = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    
    startAutoScroll();
    
    return () => {
      window.removeEventListener('resize', updateScrollState);
      stopAutoScroll();
    };
  }, [aboutData]);

  const startAutoScroll = () => {
    stopAutoScroll();
    if (!trackRef.current || trackRef.current.scrollWidth <= trackRef.current.clientWidth) {
      return;
    }
    isAutoScrolling.current = true;
    autoScrollTimer.current = setInterval(() => {
      if (!isAutoScrolling.current || !trackRef.current) return;
      const el = trackRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }, 4000);
  };

  const stopAutoScroll = () => {
    isAutoScrolling.current = false;
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  };

  const scrollByAmount = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    stopAutoScroll();
    el.scrollBy({ left: dir * (el.clientWidth * 0.7), behavior: 'smooth' });
    setTimeout(startAutoScroll, 5000);
  };

  const handleMouseEnter = () => {
    stopAutoScroll();
  };

  const handleMouseLeave = () => {
    startAutoScroll();
  };

  const getImageUrl = (key) => {
    if (!key) return null;
    if (imageUrls[key]) return imageUrls[key];
    return `${API_BASE}/images/${key}`;
  };

  if (loading) {
    return (
      <main className="partners-page">
        <div className="partners-container">
          <p className="partners-empty">Loading...</p>
        </div>
      </main>
    );
  }

  const partners = aboutData?.partners || [];
  const partnersTitle = aboutData?.partnersTitle || 'Our Partners';

  return (
    <main className="partners-page">
      <div className="partners-container">
        <div className={`partners-hero-section ${isVisible ? 'partners-hero-section--visible' : ''}`}>
          <span className="partners-hero-badge">Collaborations</span>
          <h1 className="partners-title">{partnersTitle}</h1>
          <div className="partners-hero-line"></div>
        </div>

        {partners.length > 0 ? (
          <div 
            className={`partners-row-wrap ${isVisible ? 'partners-row-wrap--visible' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {canScrollLeft && (
              <button
                type="button"
                className="partners-arrow partners-arrow--left"
                onClick={() => scrollByAmount(-1)}
                aria-label="Scroll partners left"
              >
                ‹
              </button>
            )}

            <div
              className="partners-row"
              ref={trackRef}
              onScroll={updateScrollState}
            >
              {partners.map((partner, index) => {
                const rowKey = partner.id || index;
                const imageUrl = getImageUrl(partner.logoKey);
                const logoFailed = failedLogos[rowKey];
                const initial = partner.name?.charAt(0) || '?';

                return (
                  <a
                    href={partner.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="partners-item"
                    key={rowKey}
                  >
                    <span className="partners-circle">
                      {partner.logoKey && !logoFailed ? (
                        <img
                          src={imageUrl}
                          alt={partner.name || 'Partner logo'}
                          onError={() => setFailedLogos(prev => ({ ...prev, [rowKey]: true }))}
                        />
                      ) : (
                        <span className="partners-circle__placeholder">{initial}</span>
                      )}
                    </span>
                    {/* REMOVED: partner name and description */}
                  </a>
                );
              })}
            </div>

            {canScrollRight && (
              <button
                type="button"
                className="partners-arrow partners-arrow--right"
                onClick={() => scrollByAmount(1)}
                aria-label="Scroll partners right"
              >
                ›
              </button>
            )}
          </div>
        ) : (
          <p className="partners-empty">No partners have been added yet.</p>
        )}
      </div>
    </main>
  );
}