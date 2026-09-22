import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Named export of AuthContext so consumers can import { AuthContext }
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [role, setRole] = useState(localStorage.getItem('role') || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (role) {
      localStorage.setItem('role', role);
    } else {
      localStorage.removeItem('role');
    }
  }, [role]);

  useEffect(() => {
    if (token && (!user || !user.id)) {
      authService.getCurrentUser()
        .then((userData) => {
          if (userData && userData.id) {
            setUser((prev) => ({ ...(prev || {}), id: userData.id, username: userData.username || prev?.username }));
            if (userData.role) setRole(userData.role);
          }
        })
        .catch(() => {});
    }
  }, [token, user]);

  const login = (authToken, userObj, userRole) => {
    setToken(authToken);
    setUser(userObj || { username: 'User', role: userRole });
    setRole(userRole || 'STUDENT');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{ token, user, role, isAuthenticated, loading: false, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

// Convenience hook for components that prefer useAuth() pattern
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
