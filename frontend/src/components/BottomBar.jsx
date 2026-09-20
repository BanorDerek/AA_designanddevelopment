// components/BottomBar.jsx
import { Link } from 'react-router-dom';
import ToggleMenu from './ToggleMenu';
import CartButton from './CartButton';
import './BottomBar.css';

export default function BottomBar({ settings }) {
  return (
    <div className="bottom-bar">
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
  );
}