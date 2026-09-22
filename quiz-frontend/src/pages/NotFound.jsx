import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍 404</div>
      <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
};

export default NotFound;
