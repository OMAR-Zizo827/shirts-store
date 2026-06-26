import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const STATUS_LABELS = {
  pending: '⏳ Pending', processing: '⚙️ Processing',
  shipped: '🚚 Shipped', delivered: '✅ Delivered', cancelled: '❌ Cancelled'
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get('/orders')
      .then(res => setOrders(res.data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: 120 }}>
            <div className="empty-icon">🔒</div>
            <h3>Sign in to view your orders</h3>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: 20 }}>Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading-page page"><div className="spinner" /></div>;

  return (
    <div className="orders-page page">
      <div className="container">
        <div className="page-header">
          <h1>My <span className="gradient-text">Orders</span></h1>
          <p>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>When you place an order, it will appear here</p>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card card">
                <div className="order-header" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                  <div className="order-id">
                    <span className="order-label">Order</span>
                    <span className="order-num">#{order.id}</span>
                  </div>
                  <div className="order-date">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  <span className={`status status-${order.status}`}>{STATUS_LABELS[order.status] || order.status}</span>
                  <span className="order-total">${parseFloat(order.total).toFixed(2)}</span>
                  <span className="order-expand">{expandedOrder === order.id ? '▲' : '▼'}</span>
                </div>

                {expandedOrder === order.id && (
                  <div className="order-detail animate-fadeIn">
                    <div className="order-items-list">
                      {order.items.map(item => (
                        <div key={item.id} className="order-item">
                          <div className="order-item-info">
                            <span className="order-item-name">{item.product_name}</span>
                            <span className="order-item-meta">{item.product_team} • Size: {item.size} × {item.quantity}</span>
                          </div>
                          <span className="order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-shipping glass">
                      <strong>📦 Shipping to:</strong> {order.shipping_name}, {order.shipping_address}, {order.shipping_city}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
