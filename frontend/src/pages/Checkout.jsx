import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/formatMoney';
import { Send, Mail, Phone, User, ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';
import './Checkout.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, getTotalItems } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrderDetails, setCompletedOrderDetails] = useState(null);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(null);
  
  // Form state
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryMethod: 'whatsapp',
  });

  // Fetch settings
  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch((err) => {
        console.error('Failed to load settings:', err);
        setSettings({});
      });
  }, []);

  // Redirect if cart is empty only when not completing an order
  useEffect(() => {
    if (!orderComplete && (!cart.items || cart.items.length === 0)) {
      navigate('/products');
    }
  }, [cart.items, orderComplete, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openWhatsApp = (phoneNumber, message) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (!cleanNumber) return false;

    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

    try {
      const newWindow = window.open(whatsappUrl, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.location.href = whatsappUrl;
      }
      return true;
    } catch (err) {
      try {
        window.location.href = whatsappUrl;
        return true;
      } catch (e) {
        return false;
      }
    }
  };

  const getCurrencySymbol = (currency) => {
    return currency === 'NGN' ? '₦' : '$';
  };

  const createAdminWhatsAppMessage = (order) => {
    const itemsList = order.items.map((item, index) => {
      const total = item.price * item.quantity;
      const symbol = getCurrencySymbol(item.currency || 'USD');
      return `${index + 1}. ${item.name}\n   Quantity: ${item.quantity}\n   Price: ${symbol}${Number(item.price).toFixed(2)}\n   Subtotal: ${symbol}${Number(total).toFixed(2)}`;
    }).join('\n\n');

    let totalDisplay = '';
    if (order.totals) {
      const totalEntries = Object.entries(order.totals);
      totalDisplay = totalEntries.map(([currency, amount]) => {
        const symbol = getCurrencySymbol(currency);
        return `${symbol}${Number(amount).toFixed(2)}`;
      }).join(' + ');
    }

    const orderDate = new Date().toLocaleString();

    return `NEW ORDER RECEIVED

Order #: ${order.id?.substring(0, 8)}
Date: ${orderDate}

Customer Details:
Name: ${order.customerName}
Phone: ${order.customerPhone || 'Not provided'}
Email: ${order.customerEmail || 'Not provided'}
Delivery Method: ${order.deliveryMethod}

Order Items:
${itemsList}

Total: ${totalDisplay}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.customerName.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    if (form.deliveryMethod === 'email' && !form.customerEmail.trim()) {
      setError('Please enter your email for delivery');
      setLoading(false);
      return;
    }

    if (form.deliveryMethod === 'whatsapp' && !form.customerPhone.trim()) {
      setError('Please enter your phone number for WhatsApp delivery');
      setLoading(false);
      return;
    }

    try {
      const adminEmail = settings?.contactEmail || 'orders@aadesigndev.com';
      const adminWhatsApp = settings?.whatsappNumber || '';

      const orderData = {
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim() || null,
        customerPhone: form.customerPhone.trim() || null,
        items: cart.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          currency: item.currency || 'USD',
          quantity: item.quantity,
          coverImageUrl: item.coverImageUrl || null,
        })),
        totals: cart.total,
        deliveryMethod: form.deliveryMethod,
        adminEmail: adminEmail,
      };

      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to place order');
      }

      const order = await response.json();

      setCompletedOrderDetails({
        id: order.id,
        deliveryMethod: form.deliveryMethod,
        email: form.customerEmail
      });

      // Mark complete first so useEffect does not kick to /products
      setOrderComplete(true);
      clearCart();

      if (form.deliveryMethod === 'whatsapp' && adminWhatsApp) {
        const message = createAdminWhatsAppMessage(order);
        openWhatsApp(adminWhatsApp, message);
      }

      setShowSuccessModal(true);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = getTotalItems();
  const totalPrice = cart.total || 0;

  return (
    <div className="checkout-page">
      <div className="checkout-page__wrapper">
        <h1 className="checkout-page__title">Checkout</h1>

        <div className="checkout-page__grid">
          {/* Order Summary */}
          <div className="checkout-page__summary">
            <h2 className="checkout-page__subtitle">Order Summary</h2>
            
            <div className="checkout-page__items">
              {cart.items.map((item) => {
                const symbol = getCurrencySymbol(item.currency || 'USD');
                return (
                  <div key={item.id} className="checkout-page__item">
                    <div className="checkout-page__item-image">
                      {item.coverImageUrl ? (
                        <img src={item.coverImageUrl} alt={item.name} />
                      ) : (
                        <div className="checkout-page__item-placeholder">
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </div>
                    <div className="checkout-page__item-info">
                      <span className="checkout-page__item-name">{item.name}</span>
                      <span className="checkout-page__item-quantity">× {item.quantity}</span>
                    </div>
                    <span className="checkout-page__item-price">
                      {symbol}{Number(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="checkout-page__totals">
              <div className="checkout-page__total-row">
                <span>Subtotal ({totalItems} items)</span>
                <span>${Number(totalPrice).toFixed(2)}</span>
              </div>
              <div className="checkout-page__total-row">
                <span>Delivery</span>
                <span>Free</span>
              </div>
              <div className="checkout-page__total-row checkout-page__total-row--grand">
                <span>Total</span>
                <span>${Number(totalPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="checkout-page__form">
            <h2 className="checkout-page__subtitle">Your Details</h2>

            {error && (
              <div className="checkout-page__error">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="checkout-page__field">
                <label htmlFor="customerName">
                  <User size={16} />
                  Full Name *
                </label>
                <input
                  id="customerName"
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="checkout-page__field">
                <label htmlFor="customerPhone">
                  <Phone size={16} />
                  Phone Number *
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleChange}
                  placeholder="e.g., 234 801 234 5678"
                  required={form.deliveryMethod === 'whatsapp'}
                />
                <small className="checkout-page__field-hint">
                  Required for WhatsApp delivery
                </small>
              </div>

              <div className="checkout-page__field">
                <label htmlFor="customerEmail">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  name="customerEmail"
                  value={form.customerEmail}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required={form.deliveryMethod === 'email'}
                />
                <small className="checkout-page__field-hint">
                  Required for email delivery
                </small>
              </div>

              <div className="checkout-page__delivery">
                <label className="checkout-page__delivery-label">
                  Delivery Method *
                </label>
                <div className="checkout-page__delivery-options">
                  <label className={`checkout-page__delivery-option ${form.deliveryMethod === 'whatsapp' ? 'checkout-page__delivery-option--active' : ''}`}>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="whatsapp"
                      checked={form.deliveryMethod === 'whatsapp'}
                      onChange={handleChange}
                    />
                    <Phone size={18} />
                    <span>WhatsApp</span>
                    <small>We will send order via WhatsApp</small>
                  </label>
                  <label className={`checkout-page__delivery-option ${form.deliveryMethod === 'email' ? 'checkout-page__delivery-option--active' : ''}`}>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="email"
                      checked={form.deliveryMethod === 'email'}
                      onChange={handleChange}
                    />
                    <Mail size={18} />
                    <span>Email</span>
                    <small>We will send invoice via email</small>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                className="checkout-page__submit"
                disabled={loading}
              >
                {loading ? (
                  'Placing Order...'
                ) : (
                  <>
                    <Send size={18} />
                    Place Order
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal">
            <div className="checkout-modal__icon">
              <CheckCircle size={56} />
            </div>
            
            <h2 className="checkout-modal__title">Order Placed Successfully!</h2>

            {completedOrderDetails?.deliveryMethod === 'whatsapp' ? (
              <>
                <p className="checkout-modal__text">
                  Thank you for your order. Your order details have been sent via WhatsApp.
                </p>
                <p className="checkout-modal__detail">
                  You will receive your order confirmation on WhatsApp shortly.
                </p>
              </>
            ) : (
              <>
                <p className="checkout-modal__text">
                  Thank you for your order. Your invoice has been sent to your email.
                </p>
                <p className="checkout-modal__detail">
                  Please check <strong>{completedOrderDetails?.email}</strong> for your invoice.
                </p>
              </>
            )}

            <button 
              type="button"
              className="checkout-modal__btn"
              onClick={() => navigate('/products')}
            >
              <span>Go to Product Page</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}