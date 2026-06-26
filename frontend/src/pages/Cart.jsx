import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { items, total, updateQuantity, removeItem, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: 120 }}>
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some shirts to your cart to get started</p>
            <Link to="/shop" className="btn btn-primary btn-lg" style={{ marginTop: 24 }}>Browse Shop</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page">
      <div className="container">
        <div className="cart-header">
          <h1>Your <span className="gradient-text">Cart</span></h1>
          <span className="cart-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
        </div>

        <div className="cart-layout">
          <div className="cart-items-list">
            {items.map(item => (
              <div key={item.id} className="cart-item card">
                <div className="cart-item-img-wrap">
                  <img src={item.image_url} alt={item.name} className="cart-item-img"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="cart-item-info">
                  <div>
                    <Link to={`/product/${item.product_id}`} className="cart-item-name">{item.name}</Link>
                    <p className="cart-item-team">{item.team}</p>
                    <div className="cart-item-tags">
                      <span className="badge badge-info">Size: {item.size}</span>
                      <span className="badge badge-accent">${item.price.toFixed(2)} each</span>
                    </div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}>−</button>
                      <span className="qty-val">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <span className="cart-item-subtotal">${(item.price * item.quantity).toFixed(2)}</span>
                    <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary card">
            <h3>Order Summary</h3>
            <div className="divider" />
            <div className="summary-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="summary-row"><span>Shipping</span><span className="free-text">{total >= 100 ? 'Free ✓' : '$9.99'}</span></div>
            {total < 100 && (
              <p className="free-shipping-note">Add ${(100 - total).toFixed(2)} more for free shipping!</p>
            )}
            <div className="divider" />
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${(total + (total >= 100 ? 0 : 9.99)).toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 20 }}>
              Proceed to Checkout →
            </Link>
            <Link to="/shop" className="btn btn-secondary btn-full" style={{ marginTop: 10 }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
