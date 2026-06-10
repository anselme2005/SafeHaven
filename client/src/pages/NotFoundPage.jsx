// ============================================================
// src/pages/NotFoundPage.jsx
// 404 — Page not found
// ============================================================

import { useNavigate } from 'react-router-dom';
import PublicLayout    from '../layouts/PublicLayout';
import { FiAlertTriangle, FiHome, FiFileText, FiSearch } from '../utils/icons';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <div style={{
        minHeight:      'calc(100vh - 128px)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '48px 24px'
      }}>
        <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>

          {/* Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{
              backgroundColor: '#FEF9C3',
              borderRadius:    '50%',
              padding:         '24px',
              display:         'inline-flex'
            }}>
              <FiAlertTriangle size={48} style={{ color: '#D97706' }} />
            </div>
          </div>

          {/* 404 number */}
          <p style={{
            fontSize:     '96px',
            fontWeight:   '800',
            color:        'var(--color-bg-soft)',
            lineHeight:   '1',
            marginBottom: '0',
            letterSpacing:'-4px',
            userSelect:   'none'
          }}>
            404
          </p>

          <h1 style={{
            fontSize:    '24px',
            fontWeight:  '700',
            color:       'var(--color-text-main)',
            marginBottom:'12px',
            marginTop:   '-8px'
          }}>
            Page not found
          </h1>

          <p style={{
            fontSize:    '15px',
            color:       'var(--color-text-muted)',
            lineHeight:  '1.7',
            marginBottom:'36px'
          }}>
            The page you are looking for does not exist or may have been moved.
            If you were trying to track a report, use the button below.
          </p>

          {/* Action cards */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap:                 '12px',
            marginBottom:        '32px'
          }}>
            {[
              {
                icon:    <FiHome size={20} style={{ color: 'var(--color-primary)' }} />,
                label:   'Go Home',
                desc:    'Return to the landing page',
                onClick: () => navigate('/')
              },
              {
                icon:    <FiFileText size={20} style={{ color: 'var(--color-primary)' }} />,
                label:   'Submit Report',
                desc:    'Report an incident anonymously',
                onClick: () => navigate('/report')
              },
              {
                icon:    <FiSearch size={20} style={{ color: 'var(--color-primary)' }} />,
                label:   'Track Report',
                desc:    'Check your report status',
                onClick: () => navigate('/track')
              }
            ].map(card => (
              <button
                key={card.label}
                onClick={card.onClick}
                onMouseEnter={e => {
                  e.currentTarget.style.transform  = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow  = '0 8px 24px rgba(0,0,0,0.10)';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform  = 'translateY(0)';
                  e.currentTarget.style.boxShadow  = 'var(--shadow-soft)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }}
                style={{
                  backgroundColor: 'var(--color-white)',
                  border:          '2px solid var(--color-border)',
                  borderRadius:    '14px',
                  padding:         '20px 16px',
                  cursor:          'pointer',
                  textAlign:       'center',
                  transition:      'all 0.2s ease',
                  boxShadow:       'var(--shadow-soft)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <div style={{
                    backgroundColor: '#EEF2FF',
                    borderRadius:    '8px',
                    padding:         '8px',
                    display:         'inline-flex'
                  }}>
                    {card.icon}
                  </div>
                </div>
                <p style={{
                  fontSize:    '14px',
                  fontWeight:  '700',
                  color:       'var(--color-text-main)',
                  marginBottom:'4px'
                }}>
                  {card.label}
                </p>
                <p style={{
                  fontSize:   '12px',
                  color:      'var(--color-text-muted)',
                  lineHeight: '1.4'
                }}>
                  {card.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Safety reminder */}
          <div style={{
            backgroundColor: '#EEF2FF',
            borderRadius:    '12px',
            padding:         '16px 20px',
            display:         'flex',
            alignItems:      'center',
            gap:             '12px',
            textAlign:       'left'
          }}>
            <FiSearch size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: 'var(--color-primary)', lineHeight: '1.6' }}>
              If you have a tracking token, go to the{' '}
              <span
                onClick={() => navigate('/track')}
                style={{ fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
                Track Report
              </span>{' '}
              page to check your report status.
            </p>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
};

export default NotFoundPage;