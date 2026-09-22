import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, role, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto' }}>
        <ErrorMessage message="Access Denied. You do not have permission to view this page." />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
