import { useEffect, useState } from 'react';
import './BrandName.css';

export default function BrandName({ name = '' }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`brand-name ${scrolled ? 'brand-name--scrolled' : ''}`}>
      {name}
    </div>
  );
}
