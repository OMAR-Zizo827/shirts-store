import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data.product);
        const sizes = JSON.parse(res.data.product.sizes || '[]');
        if (sizes.length) setSelectedSize(sizes[0]);
      })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [id]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedSize) { showToast('Please select a size', 'error'); return; }
    setAdding(true);
    const result = await addToCart(product.id, selectedSize, quantity);
    setAdding(false);
    if (result?.success) showToast(`✓ Added to cart! Size: ${selectedSize}`);
    else if (result?.error) showToast(result.error, 'error');
  };

  if (loading) return <div className="loading-page page"><div className="spinner" /></div>;
  if (!product) return null;

  const sizes = JSON.parse(product.sizes || '[]');

  return (
    <div className="product-detail-page page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> › <Link to="/shop">Shop</Link> › <span>{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          {/* Image */}
          <div className="detail-img-wrap">
            {!imgError ? (
              <img src={product.image_url} alt={product.name} className="detail-img" onError={() => setImgError(true)} />
            ) : (
              <div className="detail-img-fallback">👕</div>
            )}
            <div className="detail-badges">
              {product.featured === 1 && <span className="badge badge-gold">⭐ Featured</span>}
              <span className="badge badge-info">
                {product.type}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="detail-info">
            <div className="detail-meta">
              <span className="badge badge-accent">{product.league}</span>
              <span className="detail-stock">{product.stock > 20 ? '✅ In Stock' : product.stock > 0 ? `⚠️ Only ${product.stock} left` : '❌ Out of Stock'}</span>
            </div>

            <h1 className="detail-title">{product.name}</h1>
            <p className="detail-team">{product.team}</p>

            <div className="detail-price-row">
              <span className="detail-price">${product.price.toFixed(2)}</span>
              <span className="detail-price-note">Free shipping over $100</span>
            </div>

            <p className="detail-desc">{product.description}</p>

            <div className="size-section">
              <div className="size-header">
                <span className="size-label">Select Size</span>
                {selectedSize && <span className="selected-size-tag">{selectedSize}</span>}
              </div>
              <div className="sizes-grid">
                {sizes.map(s => (
                  <button
                    key={s}
                    className={`size-btn ${selectedSize === s ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >{s}</button>
                ))}
              </div>
            </div>

            <div className="qty-section">
              <span className="size-label">Quantity</span>
              <div className="qty-row">
                <button className="qty-btn-lg" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span className="qty-display">{quantity}</span>
                <button className="qty-btn-lg" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>
            </div>

            <div className="detail-actions">
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 2 }}
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                id="add-to-cart-btn"
              >
                {adding ? 'Adding...' : '🛒 Add to Cart'}
              </button>
              <Link to="/checkout" className="btn btn-gold btn-lg" style={{ flex: 1 }} onClick={handleAddToCart}>
                Buy Now
              </Link>
            </div>

            <div className="detail-features">
              {['🚚 Free shipping over $100', '🔄 Easy 30-day returns', '✅ Authentic & Official', '🔒 Secure checkout'].map(f => (
                <div key={f} className="feature-item">{f}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
