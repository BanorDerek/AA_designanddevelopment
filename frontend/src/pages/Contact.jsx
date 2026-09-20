// Contact.jsx - Updated with your exact layout
import { useEffect, useState } from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';
import './Contact.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus({ submitting: false, success: true, error: null });
      setFormData({ name: '', email: '', message: '' });
      
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 5000);
    } catch (err) {
      setStatus({ submitting: false, success: false, error: err.message });
    }
  };

  return (
    <main className="contact-page">
      <div className="contact-container">
        {/* Main Contact Grid - Left: Header + Details | Right: Form */}
        <div className={`contact-grid ${isVisible ? 'contact-grid--visible' : ''}`}>
          {/* LEFT COLUMN */}
          <div className="contact-left">
            {/* Contact Header */}
            <div className="contact-header">
              <h1 className="contact-title">Contact</h1>
              <div className="contact-line"></div>
              <p className="contact-text">
                Have a project in mind or want to collaborate? Reach out — we'd love to hear from you.
              </p>
            </div>

            {/* Contact Details */}
            <div className="contact-details">
              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  <MapPin size={20} strokeWidth={1.5} />
                </div>
                <div className="contact-detail-content">
                  <span className="contact-detail-label">Address</span>
                  <p className="contact-detail-value">45 Niyi Okunubi St, Lekki Phase 1, Lagos 106104</p>
                  <a 
                    href="https://www.google.com/maps/place/45+Niyi+Okunubi+St,+Lekki+Phase+1,+Lagos+106104,+Lagos/@6.4404505,3.4577196,17z/data=!4m6!3m5!1s0x103bf4ffb3d8b99b:0xb94f0219f0ddd851!8m2!3d6.4404505!4d3.4577196!16s%2Fg%2F11snt522w_?source=lnms&g_ep=Eg1tbF8yMDI2MDcyOF8wIJvbDyoASAJQAQ%3D%3D" 
                    target="_blank" 
                    rel="noreferrer"
                    className="contact-detail-map-link"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  <Mail size={20} strokeWidth={1.5} />
                </div>
                <div className="contact-detail-content">
                  <span className="contact-detail-label">Email</span>
                  <a href="mailto:info@aadesigndevelopment.com" className="contact-detail-value contact-detail-link">
                    info@aadesigndevelopment.com
                  </a>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  <Phone size={20} strokeWidth={1.5} />
                </div>
                <div className="contact-detail-content">
                  <span className="contact-detail-label">Phone</span>
                  <a href="tel:+2347036076876" className="contact-detail-value contact-detail-link">
                    +234 703 607 6876
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Form */}
          <div className="contact-right">
            <div className="contact-form-card">
              <h2 className="contact-form-title">Send a Message</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-group">
                  <label htmlFor="name" className="contact-form-label">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="contact-form-input" 
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={status.submitting}
                  />
                </div>
                <div className="contact-form-group">
                  <label htmlFor="email" className="contact-form-label">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="contact-form-input" 
                    placeholder="Your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={status.submitting}
                  />
                </div>
                <div className="contact-form-group">
                  <label htmlFor="message" className="contact-form-label">Message</label>
                  <textarea 
                    id="message" 
                    className="contact-form-textarea" 
                    placeholder="Your message" 
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={status.submitting}
                  />
                </div>
                
                {status.error && (
                  <div className="contact-form-error">
                    {status.error}
                  </div>
                )}
                {status.success && (
                  <div className="contact-form-success">
                    ✓ Message sent successfully! We'll get back to you soon.
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="contact-form-button"
                  disabled={status.submitting}
                >
                  {status.submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* MAP SECTION - Below both columns */}
        <div className={`contact-map-section ${isVisible ? 'contact-map-section--visible' : ''}`}>
          <div className="contact-map-header">
            <h2 className="contact-map-title">Find Us</h2>
            <div className="contact-map-line"></div>
          </div>
          <div className="contact-map-wrapper">
            <div className="contact-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.620309926348!2d3.455146!3d6.4404505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf4ffb3d8b99b%3A0xb94f0219f0ddd851!2s45%20Niyi%20Okunubi%20St%2C%20Lekki%20Phase%201%2C%20Lagos%20106104%2C%20Lagos!5e0!3m2!1sen!2sng!4v1700000000000"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="A.A Design & Development Location"
                className="contact-map-iframe"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}