import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const STEPS = ['Shipping', 'Review', 'Confirmation'];

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '',
    address: '', city: '', phone: '', notes: ''
  });
  const [errors, setErrors] = useState({});

  const shippingCost = total >= 100 ? 0 : 9.99;
  const grandTotal = total + shippingCost;

  if (items.length === 0 && step < 2) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: 120 }}>
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>Shop Now</Link>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderItems = items.map(i => ({ product_id: i.product_id, size: i.size, quantity: i.quantity }));
      const res = await api.post('/orders', {
        items: orderItems,
        shipping: { name: form.name, email: form.email, address: form.address, city: form.city, phone: form.phone, notes: form.notes },
        total: grandTotal
      });
      setOrderId(res.data.order.id);
      await clearCart();
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to place order. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="checkout-page page">
      <div className="container">
        <div className="checkout-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="step-num">{i < step ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="checkout-form card animate-fadeIn">
              <h2>Shipping Information</h2>
              <div className="checkout-fields">
                {[
                  { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                  { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com' },
                  { name: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+1 234 567 890' },
                  { name: 'address', label: 'Street Address', type: 'text', placeholder: '123 Main Street' },
                  { name: 'city', label: 'City / Country', type: 'text', placeholder: 'Cairo, Egypt' },
                  { name: 'notes', label: 'Order Notes (optional)', type: 'textarea', placeholder: 'Any special instructions...' },
                ].map(f => (
                  <div key={f.name} className="form-group">
                    <label className="form-label">{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea name={f.name} value={form[f.name]} onChange={handleChange}
                        placeholder={f.placeholder} className="form-input" rows={3} />
                    ) : (
                      <input name={f.name} type={f.type} value={form[f.name]} onChange={handleChange}
                        placeholder={f.placeholder} className={`form-input ${errors[f.name] ? 'input-error' : ''}`} />
                    )}
                    {errors[f.name] && <span className="error-msg">{errors[f.name]}</span>}
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => { if (validate()) setStep(1); }}>
                Review Order →
              </button>
            </div>
          )}

          {/* Step 1: Review */}
          {step === 1 && (
            <div className="checkout-review card animate-fadeIn">
              <h2>Review Your Order</h2>
              <div className="review-section">
                <h4>📦 Shipping To</h4>
                <div className="review-address glass">
                  <p><strong>{form.name}</strong></p>
                  <p>{form.email}</p>
                  <p>{form.address}, {form.city}</p>
                  {form.phone && <p>{form.phone}</p>}
                </div>
              </div>
              <div className="review-section">
                <h4>🛒 Items ({items.length})</h4>
                {items.map(i => (
                  <div key={i.id} className="review-item">
                    <img src={i.image_url} alt={i.name} className="review-item-img" onError={e => e.target.style.display = 'none'} />
                    <div>
                      <p className="review-item-name">{i.name}</p>
                      <p className="review-item-meta">Size: {i.size} × {i.quantity}</p>
                    </div>
                    <span className="review-item-price">${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="review-section">
                <div className="summary-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="summary-row"><span>Shipping</span><span className={shippingCost === 0 ? 'free-text' : ''}>{shippingCost === 0 ? 'Free ✓' : `$${shippingCost.toFixed(2)}`}</span></div>
                <div className="summary-row summary-total"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
              </div>
              <div className="review-payment glass">
                💳 Demo Payment — No real charges will be made
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? 'Placing Order...' : '✓ Place Order'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <div className="checkout-confirm animate-scaleIn">
              <div className="confirm-icon">🎉</div>
              <h2>Order Placed!</h2>
              <p className="confirm-sub">Your order #{orderId} has been confirmed.</p>
              <p className="confirm-desc">
                We'll send a confirmation to <strong>{form.email}</strong>.<br />
                Your shirts will be on their way soon!
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {user && <Link to="/orders" className="btn btn-primary btn-lg">View My Orders</Link>}
                <Link to="/shop" className="btn btn-secondary btn-lg">Continue Shopping</Link>
              </div>
            </div>
          )}

          {/* Order Summary sidebar */}
          {step < 2 && (
            <div className="checkout-sidebar">
              <div className="card" style={{ padding: 24 }}>
                <h3>Order Summary</h3>
                <div className="divider" />
                {items.map(i => (
                  <div key={i.id} className="sidebar-item">
                    <span className="sidebar-item-name">{i.name} ({i.size})</span>
                    <span className="sidebar-item-price">${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="divider" />
                <div className="summary-row"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span></div>
                <div className="summary-row summary-total"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
