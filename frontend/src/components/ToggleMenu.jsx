// ToggleMenu.jsx - Updated with Journal, removed Projects dropdown
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Mail, X, ChevronDown, ChevronUp } from 'lucide-react';
import TikTokIcon from './TikTokIcon';
import WhatsAppIcon from './WhatsAppIcon';
import './ToggleMenu.css';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/work' }, // Direct link - NO DROPDOWN
  { label: 'Shop', path: '/products' },
  { 
    label: 'About', 
    path: '/about',
    subItems: [
      { label: 'About Us', path: '/about' },
      { label: 'Awards & Recognitions', path: '/awards' },
      { label: 'Partners', path: '/partners' },
    ]
  },
  { label: 'Journal', path: '/journal' }, // NEW - Journal link
  { label: 'Contact Us', path: '/contact' },
];

export default function ToggleMenu({ settings }) {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [expandedMobileItems, setExpandedMobileItems] = useState({});
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const toggleExpand = (label) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const toggleMobileExpand = (label) => {
    setExpandedMobileItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const showInstagram = settings?.instagramEnabled !== false && !!settings?.instagramUrl;
  const showFacebook = settings?.facebookEnabled !== false && !!settings?.facebookUrl;
  const showTiktok = settings?.tiktokEnabled !== false && !!settings?.tiktokUrl;
  const showWhatsapp = settings?.whatsappEnabled !== false && !!settings?.whatsappNumber;
  const showEmail = settings?.emailEnabled !== false && !!settings?.contactEmail;
  const showLinkedin = settings?.linkedinEnabled !== false && !!settings?.linkedinUrl;

  return (
    <>
      {/* ============================================================
          TOGGLE BUTTON
          ============================================================ */}
      <button
        className={`toggle-btn ${open ? 'toggle-btn--active' : ''}`}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="Open menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* ============================================================
          DESKTOP MENU - Side Panel (visible on desktop)
          ============================================================ */}
      <div className={`toggle-overlay ${open ? 'toggle-overlay--open' : ''}`} onClick={() => setOpen(false)} />
      
      <div className={`toggle-panel ${open ? 'toggle-panel--open' : ''}`}>
        <button
          className="toggle-panel__close"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X size={22} strokeWidth={1.75} />
        </button>

        <Link to="/" className="toggle-panel__brand" onClick={() => setOpen(false)}>
          {settings?.logoUrl ? (
            <div className="toggle-panel__brand-content">
              <img src={settings.logoUrl} alt={settings.brandName || 'AA Designs'} className="toggle-panel__logo" />
            </div>
          ) : (
            settings?.brandName || 'AA Designs'
          )}
        </Link>

        <nav className="toggle-panel__nav">
          {NAV_LINKS.map((link) => {
            const hasSubItems = link.subItems && link.subItems.length > 0;
            const isExpanded = expandedItems[link.label] || false;

            return (
              <div key={link.path || link.label} className="toggle-panel__nav-group">
                <div className="toggle-panel__nav-item-wrapper">
                  {hasSubItems ? (
                    <>
                      <button 
                        className="toggle-panel__nav-item toggle-panel__nav-item--with-sub"
                        onClick={() => toggleExpand(link.label)}
                      >
                        <span>{link.label}</span>
                        {isExpanded ? (
                          <ChevronUp size={16} strokeWidth={1.5} />
                        ) : (
                          <ChevronDown size={16} strokeWidth={1.5} />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="toggle-panel__sub-items">
                          {link.subItems.map((subItem) => (
                            <button
                              key={subItem.path}
                              className="toggle-panel__sub-item"
                              onClick={() => go(subItem.path)}
                            >
                              {subItem.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <button 
                      className="toggle-panel__nav-item"
                      onClick={() => go(link.path)}
                    >
                      {link.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="toggle-panel__social">
          {showInstagram && (
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram size={20} strokeWidth={1.75} />
            </a>
          )}
          {showFacebook && (
            <a href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook">
              <Facebook size={20} strokeWidth={1.75} />
            </a>
          )}
          {showLinkedin && (
            <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin size={20} strokeWidth={1.75} />
            </a>
          )}
          {showTiktok && (
            <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok">
              <TikTokIcon size={20} />
            </a>
          )}
          {showWhatsapp && (
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon size={20} />
            </a>
          )}
          {showEmail && (
            <a href={`mailto:${settings.contactEmail}`} aria-label="Email">
              <Mail size={20} strokeWidth={1.75} />
            </a>
          )}
        </div>
      </div>

      {/* ============================================================
          MOBILE MENU - Top Sliding Full Screen (visible on mobile)
          ============================================================ */}
      <div className={`toggle-mobile-overlay ${open ? 'toggle-mobile-overlay--open' : ''}`} onClick={() => setOpen(false)} />
      
      <div className={`toggle-mobile-panel ${open ? 'toggle-mobile-panel--open' : ''}`}>
        <button
          className="toggle-mobile__close"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X size={28} strokeWidth={1.5} />
        </button>

        <nav className="toggle-mobile__nav">
          {NAV_LINKS.map((link) => {
            const hasSubItems = link.subItems && link.subItems.length > 0;
            const isExpanded = expandedMobileItems[link.label] || false;

            return (
              <div key={link.path || link.label} className="toggle-mobile__nav-group">
                {hasSubItems ? (
                  <>
                    <button 
                      className="toggle-mobile__nav-item toggle-mobile__nav-item--with-sub"
                      onClick={() => toggleMobileExpand(link.label)}
                    >
                      <span>{link.label}</span>
                      {isExpanded ? (
                        <ChevronUp size={18} strokeWidth={1.5} />
                      ) : (
                        <ChevronDown size={18} strokeWidth={1.5} />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="toggle-mobile__sub-items">
                        {link.subItems.map((subItem) => (
                          <button
                            key={subItem.path}
                            className="toggle-mobile__sub-item"
                            onClick={() => go(subItem.path)}
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button 
                    className="toggle-mobile__nav-item"
                    onClick={() => go(link.path)}
                  >
                    {link.label}
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        <div className="toggle-mobile__social">
          {showInstagram && (
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram size={22} strokeWidth={1.5} />
            </a>
          )}
          {showFacebook && (
            <a href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook">
              <Facebook size={22} strokeWidth={1.5} />
            </a>
          )}
          {showLinkedin && (
            <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin size={22} strokeWidth={1.5} />
            </a>
          )}
          {showTiktok && (
            <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok">
              <TikTokIcon size={22} />
            </a>
          )}
          {showWhatsapp && (
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon size={22} />
            </a>
          )}
          {showEmail && (
            <a href={`mailto:${settings.contactEmail}`} aria-label="Email">
              <Mail size={22} strokeWidth={1.5} />
            </a>
          )}
        </div>
      </div>
    </>
  );
}