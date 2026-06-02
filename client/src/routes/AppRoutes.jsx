// ============================================================
// src/routes/AppRoutes.jsx
// Central routing — all app routes defined in one place
// ============================================================

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth }                  from '../context/AuthContext';

// Public pages
import HomePage       from '../pages/HomePage';
import ReportPage     from '../pages/ReportPage';
import TrackPage      from '../pages/TrackPage';
import ResourcesPage  from '../pages/ResourcesPage';
import AboutPage      from '../pages/AboutPage';
import NotFoundPage   from '../pages/NotFoundPage';

// Admin pages
import AdminLoginPage   from '../pages/admin/AdminLoginPage';
import DashboardPage    from '../pages/admin/DashboardPage';
import ReportDetailPage from '../pages/admin/ReportDetailPage';


// --- ProtectedRoute ---
// Wraps admin routes — if no valid token exists, redirects to login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};


const AppRoutes = () => {
  return (
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
  );
};

export default AppRoutes;