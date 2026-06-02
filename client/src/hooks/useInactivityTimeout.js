// ============================================================
// src/hooks/useInactivityTimeout.js
// Auto-logout admin after a period of inactivity
// ============================================================
// Listens for mouse movement, clicks, keypresses, and scrolling.
// If none of these happen within TIMEOUT_MS, the admin is
// logged out automatically and redirected to the login page.
//
// This is separate from the 8hr JWT expiry — that handles
// token lifetime. This handles an admin walking away from
// an open browser tab.
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { useNavigate }                    from 'react-router-dom';
import { useAuth }                        from '../context/AuthContext';

// 30 minutes of inactivity triggers auto-logout
const TIMEOUT_MS = 30 * 60 * 1000;

const useInactivityTimeout = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate                    = useNavigate();
  const timerRef                    = useRef(null);

  const resetTimer = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Start a fresh timer
    timerRef.current = setTimeout(() => {
      logout();
      navigate('/admin/login', { replace: true });
      console.info('Admin session ended due to inactivity.');
    }, TIMEOUT_MS);
  }, [logout, navigate]);

  useEffect(() => {
    // Only run this hook when the admin is logged in
    if (!isAuthenticated) return;

    // Events that count as activity
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

    // Attach listeners
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));

    // Start the initial timer
    resetTimer();

    // Cleanup on unmount or when auth state changes
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [isAuthenticated, resetTimer]);
};

export default useInactivityTimeout;