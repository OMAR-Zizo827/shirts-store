import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>
      <div className="auth-card card animate-scaleIn">
        <div className="auth-logo">👕 <span className="gradient-text">ShirtStudio</span></div>
        <h2>Create Account</h2>
        <p className="auth-sub">Join thousands of premium shirt lovers</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {[
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', id: 'reg-name' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', id: 'reg-email' },
            { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', id: 'reg-password' },
            { name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••', id: 'reg-confirm' },
          ].map(f => (
            <div key={f.name} className="form-group">
              <label className="form-label">{f.label}</label>
              <input id={f.id} type={f.type} className="form-input" placeholder={f.placeholder}
                value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} required />
            </div>
          ))}
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="register-submit">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
