import { Link } from 'react-router-dom';
import './BrandName.css';

export default function BrandName({ name, logoUrl }) {
  return (
    <Link to="/" className="brand-name">
      {logoUrl ? (
        <div className="brand-name__content">
          <img src={logoUrl} alt={name || 'AA Designs'} className="brand-name__logo" />
          <span className="brand-name__text">{name || 'AA Designs'}</span>
        </div>
      ) : (
        <span className="brand-name__text">{name || 'AA Designs'}</span>
      )}
    </Link>
  );
}