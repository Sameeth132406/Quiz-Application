import React, { useContext } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Left sidebar is only for authenticated in-app pages (hidden on landing, login, and register)
  if (!isAuthenticated || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="site-sidebar">
      {/* Top Header / Brand */}
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand">
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-dark">quiz</span><span className="brand-accent">portal</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation Links */}
      <nav className="sidebar-nav">
        {!isAuthenticated ? (
          <>
            <div className="sidebar-section-title">Navigation</div>
            <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Home</span>
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span>Sign In</span>
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <span>Get Started</span>
            </NavLink>
          </>
        ) : (
          <>
            <div className="sidebar-section-title">Main Menu</div>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="7" height="9" rx="1"></rect>
                <rect x="14" y="3" width="7" height="5" rx="1"></rect>
                <rect x="14" y="12" width="7" height="9" rx="1"></rect>
                <rect x="3" y="16" width="7" height="5" rx="1"></rect>
              </svg>
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>My Profile</span>
            </NavLink>

            <NavLink to="/courses" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Courses</span>
            </NavLink>

            {role === 'STUDENT' && (
              <NavLink to="/my-courses" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  <polyline points="9 13 12 16 17 11"></polyline>
                </svg>
                <span>My Courses</span>
              </NavLink>
            )}

            <NavLink to="/quizzes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <span>Quizzes</span>
            </NavLink>

            <NavLink to="/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <span>Analytics</span>
            </NavLink>

            <NavLink to="/leaderboards" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
              </svg>
              <span>Leaderboards</span>
            </NavLink>

            <NavLink to="/achievements" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
              <span>Achievements</span>
            </NavLink>

            {(role === 'ADMIN' || role === 'EDUCATOR') && (
              <>
                <div className="sidebar-section-title" style={{ marginTop: '0.75rem' }}>Management</div>
                <NavLink to="/courses/create" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <span>Create Course</span>
                </NavLink>

                <NavLink to="/teacher/proctoring" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <span>Proctoring</span>
                </NavLink>

                <NavLink to="/add-quiz" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <span>Create Quiz</span>
                </NavLink>

                <NavLink to="/my-mentees" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>{role === 'ADMIN' ? 'Educator Reports' : 'My Students'}</span>
                </NavLink>

                {role === 'EDUCATOR' && (
                  <NavLink to="/mentor/chat/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      <line x1="9" y1="10" x2="15" y2="10"></line>
                    </svg>
                    <span>Report to Admin</span>
                  </NavLink>
                )}
              </>
            )}

            {role === 'ADMIN' && (
              <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Users</span>
              </NavLink>
            )}
          </>
        )}
      </nav>

      {/* Bottom Profile / Auth Actions */}
      <div className="sidebar-footer">
        {!isAuthenticated ? (
          <div className="sidebar-auth-group">
            <Link to="/login" className="btn-sidebar-primary">
              Sign In
            </Link>
            <Link to="/register" className="btn-sidebar-ghost">
              Create Account
            </Link>
          </div>
        ) : (
          <div className="sidebar-user-block">
            <Link to="/profile" className="sidebar-user-card" style={{ textDecoration: 'none', color: 'inherit' }} title="View and edit your personal details">
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user?.fullName || user?.username || 'User'}
                  className="sidebar-avatar"
                  style={{ objectFit: 'cover', border: '1.5px solid #bfdbfe' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className="sidebar-avatar"
                style={{ display: user?.profilePictureUrl ? 'none' : 'flex' }}
              >
                {(user?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name" title={user?.username || user?.email}>
                  {user?.fullName || user?.username || user?.email?.split('@')[0] || 'User'}
                </span>
                <span className={`sidebar-role-badge badge-${(role || 'STUDENT').toLowerCase()}`}>
                  {role || 'STUDENT'}
                </span>
              </div>
            </Link>

            <button onClick={handleLogout} className="sidebar-btn-logout" title="Sign Out">
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
    </aside>
  );
};

export default Navbar;
