// pages/Home.jsx - Complete
import { useEffect, useState } from 'react';
import './Home.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const HERO_IMAGES = [
  'home-hero-1',
  'home-hero-2',
  'home-hero-3',
  'home-hero-4',
  'home-hero-5',
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible || isMobile) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isVisible, isMobile]);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ============================================================
  // MOBILE: Stacked layout with NO SPACE between images
  // ============================================================
  if (isMobile) {
    return (
      <div className="home-mobile">
        {HERO_IMAGES.map((key, index) => (
          <div key={key} className="home-mobile__slide">
            <img 
              src={`${API_BASE}/images/${key}`} 
              alt="AA Designs"
              className="home-mobile__image"
              loading="lazy"
            />
            {/* Optional number overlay */}
            <div className="home-mobile__overlay">
              <span className="home-mobile__number">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ============================================================
  // DESKTOP: Slider layout
  // ============================================================
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? HERO_IMAGES.length - 1 : prev - 1
    );
  };

  return (
    <main className="home">
      <section className={`home__hero ${isVisible ? 'home__hero--visible' : ''}`}>
        <div className="home__hero-slider">
          {HERO_IMAGES.map((imageKey, index) => {
            const isActive = index === currentIndex;
            const isPrev = index === (currentIndex - 1 + HERO_IMAGES.length) % HERO_IMAGES.length;
            const isNext = index === (currentIndex + 1) % HERO_IMAGES.length;

            let className = 'home__hero-image';
            if (isActive) className += ' home__hero-image--active';
            if (isPrev && !isActive) className += ' home__hero-image--prev';
            if (isNext && !isActive) className += ' home__hero-image--next';

            if (!isActive && !isPrev && !isNext) return null;

            return (
              <div key={imageKey} className={className}>
                <img 
                  src={`${API_BASE}/images/${imageKey}`} 
                  alt="AA Designs and Development"
                />
              </div>
            );
          })}

          <div className={`home-scroll-indicator ${hasScrolled ? 'home-scroll-indicator--hidden' : ''}`}>
            <div className="home-scroll-indicator-line"></div>
            <span className="home-scroll-indicator-text">scroll down</span>
          </div>

          <div className="home__hero-dots">
            {HERO_IMAGES.map((_, index) => (
              <button
                key={index}
                className={`home__hero-dot ${index === currentIndex ? 'home__hero-dot--active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            className="home__hero-arrow home__hero-arrow--prev"
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="home__hero-arrow home__hero-arrow--next"
            onClick={goToNext}
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
      </section>
    </main>
  );
}