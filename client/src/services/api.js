// ============================================================
// src/services/api.js
// Axios instance — all API calls go through this
// ============================================================
// Centralizing the base URL here means if the backend URL ever
// changes, you update it in one place only.
// The JWT token is automatically attached to every request
// that needs it via the request interceptor below.
// ============================================================

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// --- Request Interceptor ---
// Automatically attach the JWT token to every outgoing request
// The token is stored in localStorage after admin login
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
// If the server returns 401 (expired or invalid token),
// clear the stored token and redirect to the admin login page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      // Redirect to login — session has expired
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;