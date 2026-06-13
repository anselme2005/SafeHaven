// ============================================================
// src/layouts/AdminLayout.jsx
// Wrapper for all admin pages — sidebar + topbar + content
// ============================================================

import { useState }           from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }            from '../context/AuthContext';
import {
  FiGrid, FiFileText, FiLogOut, FiMenu, FiX, FiShield
} from '../utils/icons';
import useInactivityTimeout from '../hooks/useInactivityTimeout';

const AdminLayout = ({ children }) => {
  // Auto-logout after 30 minutes of inactivity
  useInactivityTimeout();
  const { admin, logout }  = useAuth();
  const navigate           = useNavigate();
  const location           = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard',  icon: <FiGrid size={18} /> },
    { to: '/admin/reports',   label: 'All Reports', icon: <FiFileText size={18} /> }
  ];

  const isActive = (path) => location.pathname === path;

  const SidebarContent = () => (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      height:         '100%',
      padding:        '24px 0'
    }}>
      {/* Logo */}
      <div style={{ padding: '0 24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiShield size={22} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)' }}>
            SafeHaven
          </span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', paddingLeft: '32px' }}>
          Admin Panel
        </p>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            style={{
              display:         'flex',
              alignItems:      'center',
              gap:             '12px',
              padding:         '12px 16px',
              borderRadius:    '10px',
              marginBottom:    '4px',
              textDecoration:  'none',
              backgroundColor: isActive(item.to) ? '#EEF2FF' : 'transparent',
              color:           isActive(item.to) ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight:      isActive(item.to) ? '600' : '500',
              fontSize:        '14px',
              transition:      'all 0.15s ease'
            }}
            onMouseEnter={e => {
              if (!isActive(item.to)) {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-soft)';
                e.currentTarget.style.color           = 'var(--color-text-main)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive(item.to)) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color           = 'var(--color-text-muted)';
              }
            }}>
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Admin info + logout */}
      <div style={{
        padding:   '16px 24px',
        borderTop: '1px solid var(--color-border)'
      }}>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
          Logged in as
        </p>
        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-main)', marginBottom: '12px', wordBreak: 'break-all' }}>
          {admin?.adminEmail}
        </p>
        <button
          onClick={handleLogout}
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             '8px',
            backgroundColor: 'transparent',
            color:           'var(--color-danger)',
            border:          '1px solid var(--color-danger)',
            borderRadius:    '8px',
            padding:         '8px 14px',
            fontSize:        '13px',
            fontWeight:      '600',
            cursor:          'pointer',
            width:           '100%',
            justifyContent:  'center'
          }}>
          <FiLogOut size={15} /> Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-main)' }}>

      {/* ── Desktop Sidebar ── */}
      <aside style={{
        width:           '240px',
        flexShrink:      0,
        backgroundColor: 'var(--color-white)',
        borderRight:     '1px solid var(--color-border)',
        position:        'sticky',
        top:             0,
        height:          '100vh',
        overflowY:       'auto'
      }} className="admin-sidebar-desktop">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position:        'fixed',
            inset:           0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex:          200
          }}
        />
      )}

      {/* ── Mobile Sidebar Drawer ── */}
      <aside style={{
        position:        'fixed',
        top:             0,
        left:            0,
        height:          '100vh',
        width:           '240px',
        backgroundColor: 'var(--color-white)',
        borderRight:     '1px solid var(--color-border)',
        zIndex:          201,
        transform:       sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition:      'transform 0.28s ease',
        overflowY:       'auto'
      }} className="admin-sidebar-mobile">
        <SidebarContent />
      </aside>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          backgroundColor: 'var(--color-white)',
          borderBottom:    '1px solid var(--color-border)',
          padding:         '0 24px',
          height:          '64px',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          position:        'sticky',
          top:             0,
          zIndex:          100
        }}>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="admin-hamburger"
            style={{
              background:   'none',
              border:       'none',
              cursor:       'pointer',
              padding:      '6px',
              color:        'var(--color-text-main)',
              display:      'none'
            }}>
            {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <h1 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-main)' }}>
            Admin Dashboard
          </h1>

          <div style={{
            display:         'inline-flex',
            alignItems:      'center',
            gap:             '8px',
            backgroundColor: '#EEF2FF',
            borderRadius:    '999px',
            padding:         '6px 14px'
          }}>
            <FiShield size={14} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-primary)' }}>
              Secure Session
            </span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '32px 24px' }}>
          {children}
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;