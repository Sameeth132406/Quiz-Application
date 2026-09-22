import React from 'react';
import { NavLink } from 'react-router-dom';

const CampusSidebar = ({ activePage = 'quizzes' }) => {
  const navItems = [
    { id: 'coursework', label: 'Course Work', icon: '📚', to: '/quizzes' },
    { id: 'resources', label: 'Resources', icon: '📑', to: '/quizzes' },
    { id: 'quizzes', label: 'Quizzes', icon: '📝', to: '/quizzes' },
    { id: 'timed', label: 'Timed Tests', icon: '⏱️', to: '/quizzes?filter=timed' },
    { id: 'activity', label: 'Activity', icon: '📈', to: '/analytics' },
    { id: 'history', label: 'Attempt History', icon: '📋', to: '/analytics' },
    { id: 'badges', label: 'Badges', icon: '🏆', to: '/dashboard' },
    { id: 'results', label: 'Assessment Results', icon: '📊', to: '/analytics' },
  ];

  return (
    <aside className="campus-sidebar">
      {navItems.map((item) => {
        const isActive = activePage === item.id || (item.id === 'quizzes' && activePage === 'quizzes');

        return (
          <NavLink
            key={item.id}
            to={item.to}
            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={item.label}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};

export default CampusSidebar;
