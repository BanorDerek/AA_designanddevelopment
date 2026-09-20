import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import './MediaCarousel.css';

export default function MediaCarousel({ items }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const dragState = useRef({ startX: 0, dragging: false });
  const videoRef = useRef(null);

  const goTo = (i) => {
    if (!items.length) return;
    if (videoRef.current) videoRef.current.pause();
    setPlaying(false);
    setLoaded(false);
    setIndex(((i % items.length) + items.length) % items.length);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

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

  if (!items || items.length === 0) return null;

  const item = items[index];

  return (
    <div className="carousel" role="region" aria-label="Media carousel">
      <div
        className="carousel__track"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="carousel__slide" key={item.id || index}>
          {item.type === 'video' ? (
            <div className="carousel__video-wrapper">
              <video
                ref={videoRef}
                className="carousel__video"
                src={item.url}
                muted={false}
                playsInline
                preload="metadata"
                aria-label={item.caption || 'Project video'}
                onClick={(e) => e.stopPropagation()}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                onLoadedMetadata={() => setLoaded(true)}
              >
                Your browser does not support the video tag.
                <a href={item.url} download>Download video</a>
              </video>

              <button
                className="carousel__video-play-btn"
                onClick={togglePlay}
                aria-label={playing ? 'Pause video' : 'Play video'}
                type="button"
              >
                {playing ? <Pause size={48} strokeWidth={1.5} /> : <Play size={48} strokeWidth={1.5} />}
              </button>

              {!loaded && (
                <div className="carousel__video-loading">
                  <span className="carousel__video-loading-spinner"></span>
                </div>
              )}
            </div>
          ) : (
            <img src={item.url} alt={item.caption || ''} draggable={false} />
          )}

          {item.caption && (
            <span className="carousel__slide-caption">{item.caption}</span>
          )}
        </div>

        {/* Arrows overlaid on the image, edge-to-edge style */}
        <button
          className="carousel__arrow carousel__arrow--left"
          onClick={prev}
          aria-label="Previous"
          type="button"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <button
          className="carousel__arrow carousel__arrow--right"
          onClick={next}
          aria-label="Next"
          type="button"
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>

        <span className="carousel__counter" aria-live="polite">
          {index + 1} / {items.length}
          {item?.type === 'video' && ' 🎬'}
        </span>
      </div>

      <div className="carousel__dots" role="tablist" aria-label="Slide indicators">
        {items.map((it, i) => (
          <button
            key={it.id || i}
            className={`carousel__dot ${i === index ? 'carousel__dot--active' : ''}`}
            onClick={() => goTo(i)}
            role="tab"
            aria-selected={i === index}
            aria-label={`${it.type === 'video' ? 'Video' : 'Image'} ${i + 1}`}
            type="button"
          >
            {it.type === 'video' && <span className="carousel__dot-icon" aria-hidden="true">▶</span>}
          </button>
        ))}
      </div>
    </div>
  );
}