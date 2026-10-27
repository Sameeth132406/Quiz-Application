import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed. Username/Email may already be taken.';
      setError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.');
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
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join quizportal today to get started</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">
              User Role
            </label>
            <select
              id="role"
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="STUDENT">Student</option>
              <option value="EDUCATOR">Educator</option>
              <option value="ADMIN">Admin</option>
            </select>
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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
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
            Register Account
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
