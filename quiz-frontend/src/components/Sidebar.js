import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? '#fff' : 'var(--text-muted)',
    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'var(--transition-fast)',
    marginBottom: '0.4rem',
  });

  return (
    <aside style={{
      width: '250px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: '700',
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '1rem',
        paddingLeft: '0.5rem',
      }}>
        Navigation
      </div>

      <NavLink to="/dashboard" style={linkStyle}>
        <span>📊</span> Dashboard
      </NavLink>

      <NavLink to="/courses" style={linkStyle}>
        <span>📚</span> Courses
      </NavLink>

      <NavLink to="/quizzes" style={linkStyle}>
        <span>📝</span> Quizzes
      </NavLink>

      <NavLink to="/gradebook" style={linkStyle}>
        <span>📈</span> Gradebook
      </NavLink>

      {/* Admin specific */}
      {role === 'ADMIN' && (
        <>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: '1.5rem',
            marginBottom: '0.75rem',
            paddingLeft: '0.5rem',
          }}>
            Administration
          </div>
          <NavLink to="/users" style={linkStyle}>
            <span>👥</span> User Management
          </NavLink>
        </>
      )}

      {/* Proctor & Analyst & Admin integrity monitor */}
      {['ADMIN', 'PROCTOR', 'ANALYST', 'EDUCATOR'].includes(role) && (
        <>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: '1.5rem',
            marginBottom: '0.75rem',
            paddingLeft: '0.5rem',
          }}>
            Monitoring & Analytics
          </div>
          <NavLink to="/integrity-monitor" style={linkStyle}>
            <span>🛡️</span> Integrity & Analytics
          </NavLink>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
