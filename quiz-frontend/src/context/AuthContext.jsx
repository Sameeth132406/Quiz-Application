import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(false);

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

  // Sync profile details on mount if logged in
  useEffect(() => {
    if (token) {
      import('../services/userService').then(({ default: userService }) => {
        userService.getMyProfile().then(profile => {
          if (profile) {
            setUser(prev => {
              const updated = {
                ...prev,
                fullName: profile.fullName || prev?.fullName,
                profilePictureUrl: profile.profilePictureUrl || prev?.profilePictureUrl
              };
              localStorage.setItem('user', JSON.stringify(updated));
              return updated;
            });
          }
        }).catch(() => {});
      }).catch(() => {});
    }
  }, [token]);

  const login = (authToken, userObj, userRole) => {
    setToken(authToken);
    setUser(userObj || { username: 'User', role: userRole });
    setRole(userRole || 'STUDENT');
  };

  const updateUserContext = (updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
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
      value={{
        token,
        user,
        role,
        isAuthenticated,
        loading,
        login,
        updateUserContext,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
