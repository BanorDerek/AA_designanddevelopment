import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ImageCarousel.css';

export default function ImageCarousel({ images }) {
  const [index, setIndex] = useState(0);
  const dragState = useRef({ startX: 0, dragging: false });

  const goTo = (i) => {
    if (!images.length) return;
    setIndex(((i % images.length) + images.length) % images.length);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Manual-only navigation: arrows, dots, or a drag/swipe gesture.
  // No timers anywhere, so it never advances on its own.
  const onPointerDown = (e) => {
    dragState.current = { startX: e.clientX, dragging: true };
  };

  const onPointerUp = (e) => {
    if (!dragState.current.dragging) return;
    const delta = e.clientX - dragState.current.startX;
    const threshold = 50;
    if (delta > threshold) prev();
    else if (delta < -threshold) next();
    dragState.current.dragging = false;
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="carousel">
      <div
        className="carousel__track"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {images.map((img, i) => {
          const offset = i - index;
          // Only render slides within 2 positions of center — keeps the
          // DOM light and matches the fade-out-at-the-edges reference look.
          if (Math.abs(offset) > 2) return null;

          const scale = offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.8 : 0.65;
          const translateX = offset * 62; // percent of slide width
          const opacity = offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.55 : 0.25;
          const zIndex = 10 - Math.abs(offset);

          return (
            <button
              key={img.id}
              className="carousel__slide"
              style={{
                transform: `translate(-50%, -50%) translateX(${translateX}%) scale(${scale})`,
                opacity,
                zIndex,
              }}
              onClick={() => goTo(i)}
              aria-label={img.caption || `Image ${i + 1}`}
            >
              <img src={img.imageUrl} alt={img.caption || ''} draggable={false} />
            </button>
          );
        })}
      </div>

      <div className="carousel__controls">
        <button className="carousel__arrow" onClick={prev} aria-label="Previous image">
          <ChevronLeft size={20} />
        </button>
        <button className="carousel__arrow" onClick={next} aria-label="Next image">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="carousel__dots">
        {images.map((img, i) => (
          <button
            key={img.id}
            className={`carousel__dot ${i === index ? 'carousel__dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}