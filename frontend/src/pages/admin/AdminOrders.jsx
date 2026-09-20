import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminOrders.css';
import { formatMoney } from '../../utils/formatMoney';

export default function AdminOrders() {
  const { authFetch } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`/orders`).then((r) => r.json()).then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="admin-page__title">Orders</h1>
      <p className="admin-page__subtitle">Orders placed through checkout, newest first.</p>

      {orders.length === 0 ? (
        <p className="admin-page__subtitle">No orders yet.</p>
      ) : (
        <div className="admin-orders__list">
          {orders.map((order) => (
            <div className="admin-orders__card" key={order.id}>
              <div className="admin-orders__header">
                <span className="admin-orders__customer">{order.customerName}</span>
                <span className="admin-orders__method">{order.deliveryMethod}</span>
              </div>
              <div className="admin-orders__contact">
                {order.customerEmail && <span>{order.customerEmail}</span>}
                {order.customerPhone && <span>{order.customerPhone}</span>}
              </div>
              <ul className="admin-orders__items">
  {order.items.map((item, i) => (
    <li key={i}>
      {item.quantity}x {item.name} — {formatMoney(item.price * item.quantity, item.currency)}
    </li>
  ))}
</ul>
<div className="admin-orders__footer">
  <div className="admin-orders__total">
    {Object.entries(order.totals || {}).map(([currency, amount]) => (
      <span key={currency}>{formatMoney(amount, currency)}</span>
    ))}
  </div>
  <span className="admin-orders__date">{new Date(order.createdAt).toLocaleString()}</span>
</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}