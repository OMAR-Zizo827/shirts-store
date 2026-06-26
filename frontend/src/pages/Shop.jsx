import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const CATEGORIES = ['Casual', 'Formal', 'Polo', 'Flannel', 'T-Shirt', 'Streetwear'];
const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [league, setLeague] = useState(searchParams.get('league') || 'all');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [sort, setSort] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [league, type, sort]);

  const fetchProducts = async (searchVal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const s = searchVal !== undefined ? searchVal : search;
      if (s) params.set('search', s);
      if (league !== 'all') params.set('league', league);
      if (type !== 'all') params.set('type', type);
      if (sort) params.set('sort', sort);
      params.set('minPrice', priceRange[0]);
      params.set('maxPrice', priceRange[1] || 999);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products || []);
    } catch {}
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const clearFilters = () => {
    setSearch(''); setLeague('all'); setType('all'); setSort(''); setPriceRange([0, 200]);
    setTimeout(() => fetchProducts(''), 50);
  };

  const activeFilters = [league !== 'all' && league, type !== 'all' && type, search && `"${search}"`].filter(Boolean);

  return (
    <div className="shop-page page">
      <div className="shop-hero">
        <div className="container">
          <h1>👕 <span className="gradient-text">Shop</span> All Shirts</h1>
          <p>{products.length} shirts available</p>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              id="shop-search"
              type="text" placeholder="Search by name, brand, or category..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="container shop-layout">
        {/* Sidebar */}
        <aside className={`shop-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            {activeFilters.length > 0 && (
              <button className="clear-filters-btn" onClick={clearFilters}>Clear All</button>
            )}
          </div>

          <div className="filter-group">
            <label className="filter-label">Fit Style</label>
            {[['all', '👕 All Fits'], ['Regular Fit', '👕 Regular Fit'], ['Slim Fit', '👕 Slim Fit'], ['Relaxed Fit', '👕 Relaxed Fit']].map(([v, l]) => (
              <label key={v} className="radio-label">
                <input type="radio" name="type" value={v} checked={type === v} onChange={() => setType(v)} />
                <span>{l}</span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <label className="filter-label">Category</label>
            <label className="radio-label">
              <input type="radio" name="league" value="all" checked={league === 'all'} onChange={() => setLeague('all')} />
              <span>All Categories</span>
            </label>
            {CATEGORIES.map(l => (
              <label key={l} className="radio-label">
                <input type="radio" name="league" value={l} checked={league === l} onChange={() => setLeague(l)} />
                <span>{l}</span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <label className="filter-label">Max Price: <strong>${priceRange[1]}</strong></label>
            <input type="range" min="30" max="200" value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], +e.target.value])}
              className="price-slider"
            />
            <div className="price-range-labels"><span>$30</span><span>$200</span></div>
          </div>

          <button className="btn btn-primary btn-full" onClick={() => { fetchProducts(); setSidebarOpen(false); }}>
            Apply Filters
          </button>
        </aside>

        {/* Main content */}
        <main className="shop-main">
          <div className="shop-toolbar">
            <button className="filter-toggle btn btn-secondary" onClick={() => setSidebarOpen(!sidebarOpen)}>
              🔽 Filters {activeFilters.length > 0 && <span className="filter-count">{activeFilters.length}</span>}
            </button>
            <div className="active-filters">
              {activeFilters.map(f => (
                <span key={f} className="badge badge-accent">{f}</span>
              ))}
            </div>
            <select className="form-select sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term</p>
              <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
