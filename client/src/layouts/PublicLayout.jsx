// ============================================================
// src/layouts/PublicLayout.jsx
// Wrapper for all public-facing pages
// ============================================================

import { useEffect, useState } from 'react';
import { Link }                from 'react-router-dom';

const PublicLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleQuickExit = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('https://www.google.com');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleQuickExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Load Tawk.to only on public pages ---
  // This runs once when the public layout mounts and cleans up
  // when navigating to the admin side (which uses AdminLayout)
  useEffect(() => {
    // Inject the Tawk.to script dynamically
    const script = document.createElement('script');
    script.async = true;
    script.src   = 'https://embed.tawk.to/6a1e23fe406ae81c377bf08c/1jq2rp6ui';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);

    // Cleanup — hide the widget when leaving public pages
    return () => {
      // Remove the script
      document.body.removeChild(script);

      // Hide the widget iframe if it's already loaded
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    };
  }, []);

  const navLinkStyle = {
    color:          'var(--color-text-muted)',
    textDecoration: 'none',
    fontSize:       '14px',
    fontWeight:     '500',
    padding:        '6px 0',
    display:        'block'
  };

  return (
    <div style={{
      minHeight:       '100vh',
      display:         'flex',
      flexDirection:   'column',
      backgroundColor: 'var(--color-bg-main)'
    }}>

      {/* ── Navbar ── */}
      <nav style={{
        backgroundColor: 'var(--color-white)',
        borderBottom:    '1px solid var(--color-border)',
        boxShadow:       'var(--shadow-soft)',
        position:        'sticky',
        top:             0,
        zIndex:          100
      }}>
        <div style={{
          maxWidth:      '1100px',
          margin:        '0 auto',
          padding:       '0 24px',
          height:        '64px',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'space-between'
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize:   '20px',
              fontWeight: '700',
              color:      'var(--color-primary)'
            }}>
              SafeHaven
            </span>
          </Link>

          {/* Desktop nav links */}
          <div style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '32px'
          }} className="desktop-nav">

            {[
            { to: '/report',    label: 'Report' },
            { to: '/track',     label: 'Track Report' },
            { to: '/resources', label: 'Resources' }
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
              style={{
                color:          'var(--color-text-muted)',
                textDecoration: 'none',
                fontSize:       '14px',
                fontWeight:     '500',
                whiteSpace:     'nowrap',
                transition:     'color 0.15s ease'
              }}>
              {link.label}
            </Link>
          ))}

            {/* Quick Exit */}
            <button onClick={handleQuickExit} style={{
              backgroundColor: 'var(--color-danger)',
              color:           'var(--color-white)',
              border:          'none',
              borderRadius:    '8px',
              padding:         '8px 18px',
              fontSize:        '14px',
              fontWeight:      '600',
              cursor:          'pointer',
              whiteSpace:      'nowrap',
              display:         'flex',
              alignItems:      'center',
              gap:             '6px'
            }}>
              ✕ Quick Exit
            </button>
          </div>

          {/* Mobile — Quick Exit always visible + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
               className="mobile-nav">

            <button onClick={handleQuickExit} style={{
              backgroundColor: 'var(--color-danger)',
              color:           'var(--color-white)',
              border:          'none',
              borderRadius:    '8px',
              padding:         '7px 14px',
              fontSize:        '13px',
              fontWeight:      '600',
              cursor:          'pointer',
              whiteSpace:      'nowrap'
            }}>
              ✕ Exit
            </button>

            <button onClick={() => setMenuOpen(o => !o)} style={{
              background:   'none',
              border:       'none',
              cursor:       'pointer',
              padding:      '6px',
              display:      'flex',
              flexDirection:'column',
              gap:          '5px'
            }}>
              <span style={{ display:'block', width:'22px', height:'2px', backgroundColor:'var(--color-text-main)', borderRadius:'2px' }} />
              <span style={{ display:'block', width:'22px', height:'2px', backgroundColor:'var(--color-text-main)', borderRadius:'2px' }} />
              <span style={{ display:'block', width:'22px', height:'2px', backgroundColor:'var(--color-text-main)', borderRadius:'2px' }} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div style={{
          borderTop:       menuOpen ? '1px solid var(--color-border)' : 'none',
          backgroundColor: 'var(--color-white)',
          padding:         menuOpen ? '16px 24px 20px' : '0 24px',
          maxHeight:       menuOpen ? '300px' : '0px',
          overflow:        'hidden',
          transition:      'max-height 0.3s ease, padding 0.3s ease',
        }} className="mobile-menu">
         {[
            { to: '/report',    label: 'Report Abuse' },
            { to: '/track',     label: 'Track Report' },
            { to: '/resources', label: 'Resources' }
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
              style={{
                ...navLinkStyle,
                transition: 'color 0.15s ease'
              }}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Page Content ── */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop:  '1px solid var(--color-border)',
        padding:    '24px',
        textAlign:  'center'
      }}>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          SafeHaven — Your report is anonymous and secure.{' '}
          <Link to="/about" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            Learn how it works
          </Link>
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
          Press <kbd style={{
            backgroundColor: 'var(--color-bg-soft)',
            border:          '1px solid var(--color-border)',
            borderRadius:    '4px',
            padding:         '1px 6px',
            fontSize:        '11px'
          }}>Esc</kbd> at any time to exit this site immediately.
        </p>
      </footer>

    </div>
  );
};

export default PublicLayout;