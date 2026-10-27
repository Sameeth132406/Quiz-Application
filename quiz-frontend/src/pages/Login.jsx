import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      // Response includes token, message, role
      const token = response.token || 'demo-jwt-token';
      const role = response.role || 'STUDENT';
      const user = {
        id: response.userId || response.id,
        username: response.username || formData.username,
        role,
        profilePictureUrl: response.profilePictureUrl || null
      };

      login(token, user, role);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Invalid credentials or server connection error.';
      setError(typeof msg === 'string' ? msg : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', marginBottom: '1.75rem' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%',
          background: '#eff6ff', border: '1.5px solid #bfdbfe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          quizportal
        </span>
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to access your account</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username or Email
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
