import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartButton.css';

export default function CartButton() {
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();

  return (
    <Link to="/cart" className="cart-button" aria-label="Open cart">
      <ShoppingBag size={20} strokeWidth={1.75} />
      {itemCount > 0 && (
        <span className="cart-button__badge">{itemCount}</span>
      )}
    </Link>
  );
}