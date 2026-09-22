import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="site-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          QuizApplication<span className="brand-accent">System</span>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="navbar-nav">
          {!isAuthenticated ? (
            <>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
              
              <a href="#how-it-works" className="nav-link">
                How It Works
              </a>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/quizzes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Quizzes
              </NavLink>
              <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Analytics
              </NavLink>
              {(role === 'ADMIN' || role === 'EDUCATOR') && (
                <NavLink to="/add-quiz" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  + Create Quiz
                </NavLink>
              )}
              {role === 'ADMIN' && (
                <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Users
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* Right / Auth Actions */}
        <div className="navbar-actions">
          {!isAuthenticated ? (
            <div className="auth-buttons">
              <Link to="/login" className="btn-nav-ghost">
                Sign In
              </Link>
              <Link to="/register" className="btn-nav-primary">
                Get Started Free
              </Link>
            </div>
          ) : (
            <div className="user-profile-bar">
              <div className="user-badge-pill">
                <div className="user-avatar-initial">
                  {(user?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.username || user?.email?.split('@')[0] || 'User'}</span>
                  <span className={`user-role-badge badge-${(role || 'STUDENT').toLowerCase()}`}>
                    {role || 'STUDENT'}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Sign Out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
