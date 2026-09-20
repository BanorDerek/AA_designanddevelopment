// components/BottomBar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ToggleMenu from './ToggleMenu';
import CartButton from './CartButton';
import './BottomBar.css';

export default function BottomBar({ settings }) {
  const [visible, setVisible] = useState(false);
  const [showIndicator, setShowIndicator] = useState(true);
  const hideTimeoutRef = useRef(null);
  const bottomBarRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    let indicatorTimeout;

    const handleMouseMove = (e) => {
      const isNearTop = e.clientY <= 40; // Changed from window.innerHeight - e.clientY <= 40
      
      const barElement = bottomBarRef.current;
      const isOverBar = barElement ? barElement.contains(e.target) : false;
      
      const triggerElement = document.querySelector('.bottom-bar-trigger');
      const isOverTrigger = triggerElement ? triggerElement.contains(e.target) : false;
      
      const shouldShow = isNearTop || isOverBar || isOverTrigger;
      
      if (shouldShow) {
        setVisible(true);
        setShowIndicator(false);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        if (indicatorTimeout) {
          clearTimeout(indicatorTimeout);
          indicatorTimeout = null;
        }
      } else {
        if (visible && !hideTimeoutRef.current) {
          hideTimeoutRef.current = setTimeout(() => {
            setVisible(false);
            setTimeout(() => {
              if (!visible) {
                setShowIndicator(true);
              }
            }, 500);
            hideTimeoutRef.current = null;
          }, 400);
        }
      }
    };

    // Handle scroll - show bar when scrolling up
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Show bar when scrolling up to top
      if (scrollY < 100) { // Changed from scrollY > 50
        setVisible(true);
        setShowIndicator(false);
        
        // Clear any pending hide timeouts
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
      }
      
      // Hide bar when scrolling stops (after 2 seconds of no scroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        // Only hide if not near top and not hovering
        const isNearTop = window.scrollY <= 40; // Changed from bottom detection
        if (!isNearTop && !visible) {
          // Don't hide if it should be visible
        } else if (!isNearTop) {
          setVisible(false);
          setTimeout(() => {
            if (!visible) {
              setShowIndicator(true);
            }
          }, 500);
        }
        scrollTimeoutRef.current = null;
      }, 2000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // Show indicator after 3 seconds
    indicatorTimeout = setTimeout(() => {
      if (!visible) {
        setShowIndicator(true);
      }
    }, 3000);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (indicatorTimeout) {
        clearTimeout(indicatorTimeout);
        indicatorTimeout = null;
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, [visible]);

  return (
    <>
      <div className="bottom-bar-trigger" />
      
      <div 
        className={`bottom-bar ${visible ? 'bottom-bar--visible' : ''}`}
        ref={bottomBarRef}
      >
        <ToggleMenu settings={settings} />
        
        <Link to="/" className="bottom-bar__logo-link">
          {settings?.logoUrl ? (
            <img 
              src={settings.logoUrl} 
              alt={settings.brandName || 'AA Designs'} 
              className="bottom-bar__logo"
            />
          ) : (
            <span className="bottom-bar__brand-name">
              {settings?.brandName || 'AA Designs'}
            </span>
          )}
        </Link>
        
        <CartButton />
      </div>

      {/* Indicator */}
      <div className={`bottom-bar-indicator ${showIndicator && !visible ? 'bottom-bar-indicator--visible bottom-bar-indicator--pulse' : ''}`}>
        <div className="bottom-bar-indicator-line"></div>
        <span className="bottom-bar-hint-text">hover or scroll up to reveal</span> {/* Changed text */}
      </div>
    </>
  );
}