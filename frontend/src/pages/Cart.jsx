import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/formatMoney';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotalItems } = useCart();
  
  // Debug: log cart data
  useEffect(() => {
    console.log('Cart items:', cart.items);
    console.log('Total items:', getTotalItems());
  }, [cart]);

  if (cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <p>Browse our products and add items you love.</p>
        <Link to="/products" className="cart-empty__btn">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-page__wrapper">
        <h1 className="cart-page__title">Your Cart</h1>
        
        <div className="cart-page__items">
          {cart.items.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item__image">
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt={item.name} />
                ) : (
                  <div className="cart-item__placeholder">No image</div>
                )}
              </div>
              
              <div className="cart-item__info">
                <h3 className="cart-item__name">{item.name}</h3>
                <span className="cart-item__price">
                  {formatMoney(item.price, item.currency)}
                </span>
              </div>
              
              <div className="cart-item__quantity">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  +
                </button>
              </div>
              
              <div className="cart-item__subtotal">
                {formatMoney(item.price * item.quantity, item.currency)}
              </div>
              
              <button 
                className="cart-item__remove"
                onClick={() => removeFromCart(item.id)}
                aria-label="Remove item"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="cart-page__summary">
          <div className="cart-page__total">
            <span>Subtotal</span>
            <span>{formatMoney(cart.total, 'USD')}</span>
          </div>
          <div className="cart-page__total">
            <span>Total Items</span>
            <span>{getTotalItems()}</span>
          </div>
          <Link to="/checkout" className="cart-page__checkout">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}