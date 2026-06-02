// ============================================================
// src/context/AuthContext.jsx
// Global admin authentication state
// ============================================================
// Wraps the entire app so any component can read auth state
// or call login/logout without prop drilling.
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  // Initialize state from localStorage so the admin stays
  // logged in across page refreshes (until the 8hr JWT expires)
  const [admin, setAdmin]       = useState(() => {
    const stored = localStorage.getItem('adminData');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken]       = useState(() => localStorage.getItem('adminToken') || null);
  const [isLoading, setIsLoading] = useState(false);

  // --- login ---
  // Called after a successful POST /api/admin/login response
  const login = (adminData, jwtToken) => {
    setAdmin(adminData);
    setToken(jwtToken);
    localStorage.setItem('adminData',  JSON.stringify(adminData));
    localStorage.setItem('adminToken', jwtToken);
  };

  // --- logout ---
  // Clears all auth state and storage
  // The Axios interceptor also calls this automatically on 401
  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminToken');
  };

  const value = {
    admin,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — use this in any component instead of useContext(AuthContext)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};