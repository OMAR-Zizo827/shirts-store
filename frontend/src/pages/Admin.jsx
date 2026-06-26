import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const EMPTY_PRODUCT = { name: '', team: '', league: '', type: 'Regular Fit', price: '', description: '', image_url: '', stock: 100, featured: false };
const CATEGORIES = ['Casual', 'Formal', 'Polo', 'Flannel', 'T-Shirt', 'Linen', 'Other'];
const STATUS_LIST = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders/admin/all'),
      ]);
      setProducts(pRes.data.products || []);
      setOrders(oRes.data.orders || []);
    } catch {}
    setLoading(false);
  };

  const openAddForm = () => { setEditProduct(null); setForm(EMPTY_PRODUCT); setShowForm(true); };
  const openEditForm = (p) => {
    setEditProduct(p);
    setForm({ ...p, featured: p.featured === 1 });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.team || !form.league || !form.price) { alert('Please fill required fields'); return; }
    setSaving(true);
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, { ...form, price: parseFloat(form.price) });
      } else {
        await api.post('/products', { ...form, price: parseFloat(form.price) });
      }
      await fetchAll();
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    setProducts(p => p.filter(x => x.id !== id));
  };

  const handleStatusChange = async (orderId, status) => {
    await api.put(`/orders/${orderId}/status`, { status });
    setOrders(o => o.map(x => x.id === orderId ? { ...x, status } : x));
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    products: products.length,
    orders: orders.length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + parseFloat(o.total || 0), 0),
    pending: orders.filter(o => o.status === 'pending').length,
  };

  if (!isAdmin) return null;

  return (
    <div className="admin-page page">
      <div className="container">
        <div className="admin-header">
          <h1>⚙️ Admin <span className="gradient-text">Dashboard</span></h1>
          <p>Manage your store products and orders</p>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          {[
            { label: 'Total Products', value: stats.products, icon: '👕', color: 'var(--accent)' },
            { label: 'Total Orders', value: stats.orders, icon: '📦', color: 'var(--info)' },
            { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: '💰', color: 'var(--gold)' },
            { label: 'Pending Orders', value: stats.pending, icon: '⏳', color: 'var(--danger)' },
          ].map(s => (
            <div key={s.label} className="admin-stat card">
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-val" style={{ color: s.color }}>{s.value}</span>
              <span className="stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>👕 Products</button>
          <button className={`admin-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>📦 Orders</button>
        </div>

        {loading ? <div className="spinner" /> : (
          <>
            {/* Products Tab */}
            {tab === 'products' && (
              <div className="admin-section animate-fadeIn">
                <div className="admin-toolbar">
                  <input type="text" placeholder="Search products..." className="form-input" style={{ maxWidth: 300 }}
                    value={search} onChange={e => setSearch(e.target.value)} />
                  <button className="btn btn-primary" onClick={openAddForm} id="add-product-btn">+ Add Product</button>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div className="table-product">
                              <img src={p.image_url} alt={p.name} className="table-img" onError={e => e.target.style.display = 'none'} />
                              <span className="table-product-name">{p.name}</span>
                            </div>
                          </td>
                          <td>{p.team}</td>
                          <td><span className="badge badge-info">{p.league}</span></td>
                          <td><strong>${parseFloat(p.price).toFixed(2)}</strong></td>
                          <td>{p.stock}</td>
                          <td>{p.featured ? '⭐' : '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => openEditForm(p)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {tab === 'orders' && (
              <div className="admin-section animate-fadeIn">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Order #</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td><strong>#{o.id}</strong></td>
                          <td>
                            <div className="table-customer">
                              <span>{o.user_name || o.shipping_name}</span>
                              <span className="table-email">{o.shipping_email}</span>
                            </div>
                          </td>
                          <td>{new Date(o.created_at).toLocaleDateString()}</td>
                          <td>{o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}</td>
                          <td><strong>${parseFloat(o.total).toFixed(2)}</strong></td>
                          <td>
                            <select className="status-select" value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}>
                              {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content card animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="drawer-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-grid">
                {[
                  { name: 'name', label: 'Product Name *', placeholder: 'e.g. Casual Linen Summer Shirt' },
                  { name: 'team', label: 'Brand *', placeholder: 'e.g. Zara' },
                  { name: 'image_url', label: 'Image URL', placeholder: 'https://...' },
                  { name: 'description', label: 'Description', placeholder: 'Product description...' },
                ].map(f => (
                  <div key={f.name} className="form-group" style={f.name === 'description' ? { gridColumn: '1/-1' } : {}}>
                    <label className="form-label">{f.label}</label>
                    {f.name === 'description' ? (
                      <textarea className="form-input" placeholder={f.placeholder} value={form[f.name] || ''} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} rows={2} />
                    ) : (
                      <input type="text" className="form-input" placeholder={f.placeholder} value={form[f.name] || ''} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} />
                    )}
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.league} onChange={e => setForm(p => ({ ...p, league: e.target.value }))}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fit Style</label>
                  <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    <option value="Regular Fit">Regular Fit</option>
                    <option value="Slim Fit">Slim Fit</option>
                    <option value="Relaxed Fit">Relaxed Fit</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input type="number" step="0.01" className="form-input" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input type="number" className="form-input" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: +e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="radio-label" style={{ gap: 12, fontSize: '0.95rem' }}>
                    <input type="checkbox" checked={!!form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} />
                    <span>⭐ Mark as Featured</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editProduct ? 'Save Changes' : 'Add Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
