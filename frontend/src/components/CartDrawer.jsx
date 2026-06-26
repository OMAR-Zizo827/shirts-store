import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

export default function CartDrawer() {
  const { items, total, cartOpen, setCartOpen, updateQuantity, removeItem, itemCount } = useCart();

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  if (!cartOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={() => setCartOpen(false)} />
      <div className="cart-drawer animate-fadeInRight">
        <div className="drawer-header">
          <h3>🛒 Cart <span className="drawer-count">({itemCount})</span></h3>
          <button className="drawer-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add some shirts to get started!</p>
              <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setCartOpen(false)}>
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="drawer-items">
              {items.map(item => (
                <div key={item.id} className="drawer-item">
                  <div className="drawer-item-img-wrap">
                    <img src={item.image_url} alt={item.name} className="drawer-item-img"
                      onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                  <div className="drawer-item-info">
                    <p className="drawer-item-name">{item.name}</p>
                    <p className="drawer-item-meta">{item.team} • Size: <strong>{item.size}</strong></p>
                    <div className="drawer-item-row">
                      <span className="drawer-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}>−</button>
                        <span className="qty-val">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="remove-btn" onClick={() => removeItem(item.id)} title="Remove">🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-total">
              <span>Total</span>
              <span className="total-amount">${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-full btn-lg" onClick={() => setCartOpen(false)}>
              Checkout →
            </Link>
            <Link to="/cart" className="btn btn-secondary btn-full" style={{ marginTop: 8 }} onClick={() => setCartOpen(false)}>
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
