import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">👕 <span className="gradient-text">ShirtStudio</span></div>
          <p>Premium casual, formal, and designer shirts designed for modern comfort. Elevate your wardrobe with style.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/shop">All Shirts</Link>
            <Link to="/shop?league=Casual">Casual Shirts</Link>
            <Link to="/shop?league=Formal">Formal Shirts</Link>
            <Link to="/shop?league=Polo">Polo Shirts</Link>
            <Link to="/shop?league=Streetwear">Streetwear</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div className="footer-col">
            <h4>Info</h4>
            <span>Free shipping over $100</span>
            <span>30-day returns</span>
            <span>Premium fabrics</span>
            <span>Secure checkout</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>© 2026 ShirtStudio — All rights reserved</span>
          <div className="footer-badges">
            <span>🔒 Secure</span>
            <span>✅ Premium Quality</span>
            <span>🚚 Fast Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
