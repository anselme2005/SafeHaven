// ============================================================
// src/routes/AppRoutes.jsx
// Central routing with lazy loading for better performance
// ============================================================
// Lazy loading splits the bundle so each page only loads
// when the user navigates to it — improves initial load time

import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Lazy loaded public pages ---
const HomePage       = lazy(() => import('../pages/HomePage'));
const ReportPage     = lazy(() => import('../pages/ReportPage'));
const TrackPage      = lazy(() => import('../pages/TrackPage'));
const ResourcesPage  = lazy(() => import('../pages/ResourcesPage'));
const AboutPage      = lazy(() => import('../pages/AboutPage'));
const NotFoundPage   = lazy(() => import('../pages/NotFoundPage'));

// --- Lazy loaded admin pages ---
const AdminLoginPage   = lazy(() => import('../pages/admin/AdminLoginPage'));
const DashboardPage    = lazy(() => import('../pages/admin/DashboardPage'));
const ReportDetailPage = lazy(() => import('../pages/admin/ReportDetailPage'));

// --- Loading fallback ---
// Shown while a page chunk is being loaded
const PageLoader = () => (
  <div style={{
    minHeight:      '100vh',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    backgroundColor:'var(--color-bg-main)'
  }}>
    <div style={{
      width:        '36px',
      height:       '36px',
      borderRadius: '50%',
      border:       '3px solid var(--color-bg-soft)',
      borderTop:    '3px solid var(--color-primary)',
      animation:    'spin 0.8s linear infinite'
    }} />
  </div>
);

// --- ProtectedRoute ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* --- Public Routes --- */}
        <Route path="/"          element={<HomePage />}      />
        <Route path="/report"    element={<ReportPage />}    />
        <Route path="/track"     element={<TrackPage />}     />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/about"     element={<AboutPage />}     />

        {/* --- Admin Routes --- */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports/:id"
          element={
            <ProtectedRoute>
              <ReportDetailPage />
            </ProtectedRoute>
          }
        />

        {/* --- 404 Fallback --- */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;