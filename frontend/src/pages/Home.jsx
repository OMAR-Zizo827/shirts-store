import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const CATEGORIES = [
  { id: 'all', label: 'All Shirts', emoji: '👕' },
  { id: 'Casual', label: 'Casual', emoji: '🌿' },
  { id: 'Formal', label: 'Formal', emoji: '👔' },
  { id: 'Polo', label: 'Polo', emoji: '🎾' },
  { id: 'Flannel', label: 'Flannel', emoji: '🪓' },
  { id: 'T-Shirt', label: 'T-Shirt', emoji: '👕' },
  { id: 'Streetwear', label: 'Streetwear', emoji: '🔥' },
];

const STATS = [
  { value: '500+', label: 'Premium Designs' },
  { value: '10+', label: 'Top Brands' },
  { value: '3+', label: 'Fit Options' },
  { value: '24/7', label: 'Customer Support' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    api.get('/products?featured=true')
      .then(res => setFeatured(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredFeatured = activeCategory === 'all'
    ? featured
    : featured.filter(p => p.league === activeCategory);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge animate-fadeIn">
            <span>🔥</span> New Summer Collection Is Live
          </div>
          <h1 className="hero-title animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            Wear Your
            <span className="gradient-text"> Confidence</span>
            <br />Every Day
          </h1>
          <p className="hero-desc animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Premium casual, formal, and designer shirts tailored to perfection.
            High-quality fabrics, modern fit styles.
          </p>
          <div className="hero-ctas animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <Link to="/shop" className="btn btn-primary btn-lg">Shop Now →</Link>
            <Link to="/shop?league=Casual" className="btn btn-secondary btn-lg">Casual Shirts</Link>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="scroll-mouse"><div className="scroll-wheel" /></div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map(s => (
              <div key={s.label} className="stat-card glass">
                <span className="stat-value gradient-text">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section container">
        <div className="section-header">
          <h2>Featured <span className="gradient-text">Shirts</span></h2>
          <p>Hand-picked bestsellers for your daily style rotation</p>
        </div>

        <div className="league-tabs">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`league-tab ${activeCategory === c.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.id)}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner" />
        ) : filteredFeatured.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No featured shirts in this category yet</h3>
          </div>
        ) : (
          <div className="products-grid">
            {filteredFeatured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link to="/shop" className="btn btn-secondary btn-lg">View All Products →</Link>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop By <span className="gradient-text">Category</span></h2>
            <p>Find the perfect shirt for any occasion</p>
          </div>
          <div className="categories-grid">
            {[
              { label: 'Casual Shirts', emoji: '🌿', desc: 'Relaxed linen & everyday cottons', league: 'Casual', color: '#3f51b5' },
              { label: 'Formal Shirts', emoji: '👔', desc: 'Sharp Oxfords & silk blends for success', league: 'Formal', color: '#f44336' },
              { label: 'Polo Shirts', emoji: '🎾', desc: 'Timeless piqué sport-luxe classics', league: 'Polo', color: '#009688' },
              { label: 'Flannel Shirts', emoji: '🪓', desc: 'Cozy brushed plaids & corduroys', league: 'Flannel', color: '#ff9800' },
              { label: 'T-Shirts', emoji: '👕', desc: 'Essential organic cotton basics', league: 'T-Shirt', color: '#9c27b0' },
              { label: 'All Shirts', emoji: '✨', desc: 'Browse our entire collections', league: 'all', color: '#00b894' },
            ].map(cat => (
              <Link
                key={cat.label}
                to={cat.league === 'all' ? '/shop' : `/shop?league=${encodeURIComponent(cat.league)}`}
                className="category-card"
                style={{ '--cat-color': cat.color }}
              >
                <span className="category-emoji">{cat.emoji}</span>
                <h3>{cat.label}</h3>
                <p>{cat.desc}</p>
                <span className="category-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner container">
        <div className="cta-inner glass">
          <div className="cta-orb" />
          <h2>Ready to Upgrade Your <span className="gradient-text">Style?</span></h2>
          <p>Free shipping on orders over $100. Premium materials guaranteed.</p>
          <Link to="/shop" className="btn btn-primary btn-lg">Shop All Shirts</Link>
        </div>
      </section>
    </div>
  );
}
