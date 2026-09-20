// components/ManagedImage.jsx - FORCE ALL IMAGES TO SHOW ON MOBILE
import { useState, useEffect, useRef } from 'react';
import './ManagedImage.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function ManagedImage({ imageKey, fallbackAlt, className = '', forceVisible = false }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);

  const imageUrl = imageKey ? `${API_BASE}/images/${imageKey}` : null;

  useEffect(() => {
    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    
    // On mobile OR if forceVisible is true, show immediately
    if (isMobile || forceVisible) {
      setIsVisible(true);
      return;
    }

    // Desktop: use Intersection Observer
    if (!imgRef.current || !imageUrl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [imageUrl, forceVisible]);

  if (!imageKey) {
    return (
      <div className={`managed-image ${className}`}>
        <div className="managed-image__fallback">
          <span>{fallbackAlt?.charAt(0) || '?'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`managed-image ${className}`}>
      <img
        ref={imgRef}
        src={imageUrl}
        alt={fallbackAlt || 'Image'}
        className={`managed-image__img ${isLoaded ? 'loaded' : ''} ${isVisible ? 'visible' : ''}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading={window.innerWidth <= 768 ? 'eager' : 'lazy'}
        decoding="async"
      />
      {!isLoaded && !error && !isVisible && (
        <div className="managed-image__placeholder">
          <div className="managed-image__skeleton" />
        </div>
      )}
      {error && (
        <div className="managed-image__fallback">
          <span>{fallbackAlt?.charAt(0) || '?'}</span>
        </div>
      )}
    </div>
  );
}