import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const sizes = JSON.parse(product.sizes || '["S","M","L","XL","XXL"]');
  const [imgError, setImgError] = useState(false);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!user) { window.location.href = '/login'; return; }
    setAdding(true);
    await addToCart(product.id, sizes[0], 1);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card card animate-fadeIn">
      <div className="product-img-wrap">
        {!imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="product-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="product-img-fallback">👕</div>
        )}
        {product.featured === 1 && <span className="featured-badge">⭐ Featured</span>}
        <div className="product-overlay">
          <button
            className={`btn btn-primary btn-sm quick-add ${added ? 'added' : ''}`}
            onClick={handleQuickAdd}
            disabled={adding}
          >
            {adding ? '...' : added ? '✓ Added!' : '+ Quick Add'}
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="product-meta">
          <span className="badge badge-accent">{product.league}</span>
          <span className="badge badge-info">
            {product.type}
          </span>
        </div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-team">{product.team}</p>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <div className="sizes-preview">
            {sizes.slice(0, 4).map(s => (
              <span key={s} className="size-chip">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
