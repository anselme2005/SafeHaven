// ============================================================
// src/pages/HomePage.jsx
// Landing page
// ============================================================

import { Link }     from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { FiShield, FiFileText, FiSearch, FiHeart } from '../utils/icons';

const btnPrimary = {
  backgroundColor: 'var(--color-primary)',
  color:           'var(--color-white)',
  border:          'none',
  borderRadius:    '10px',
  padding:         '14px 32px',
  fontSize:        '15px',
  fontWeight:      '600',
  cursor:          'pointer',
  width:           '100%',
  display:         'block'
};

const btnOutline = {
  backgroundColor: 'var(--color-white)',
  color:           'var(--color-primary)',
  border:          '2px solid var(--color-primary)',
  borderRadius:    '10px',
  padding:         '14px 32px',
  fontSize:        '15px',
  fontWeight:      '600',
  cursor:          'pointer',
  width:           '100%',
  display:         'block'
};

const btnSecondary = {
 backgroundColor: '#0891B2',  // darker cyan — passes contrast ratio
  color:           'var(--color-white)',
  border:          'none',
  borderRadius:    '10px',
  padding:         '13px 28px',
  fontSize:        '14px',
  fontWeight:      '600',
  cursor:          'pointer'
};

const HomePage = () => {
  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section style={{
        backgroundColor: 'var(--color-bg-main)',
        padding:         '72px 24px 60px',
        textAlign:       'center'
      }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{
              backgroundColor: '#EEF2FF',
              borderRadius:    '50%',
              padding:         '18px',
              display:         'inline-flex'
            }}>
              <FiShield size={44} style={{ color: 'var(--color-primary)' }} />
            </div>
          </div>

          <h1 style={{
            fontSize:   'clamp(32px, 5vw, 48px)',
            fontWeight: '800',
            color:      'var(--color-text-main)',
            lineHeight: '1.2',
            marginBottom:'16px'
          }}>
            You are safe here.
          </h1>

          <p style={{
            fontSize:    '16px',
            color:       'var(--color-text-muted)',
            lineHeight:  '1.7',
            marginBottom:'24px'
          }}>
            SafeHaven is a secure, anonymous platform for reporting abuse.
            Your identity is protected. Your report matters.
          </p>

          {/* Anonymity badge */}
          <div style={{
            display:         'inline-flex',
            alignItems:      'center',
            gap:             '8px',
            backgroundColor: '#EEF2FF',
            color:           'var(--color-primary)',
            borderRadius:    '999px',
            padding:         '8px 18px',
            fontSize:        '13px',
            fontWeight:      '500',
            marginBottom:    '36px'
          }}>
            <FiShield size={14} />
            Reports are 100% anonymous by default
          </div>

          {/* CTA buttons */}
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           '12px',
            maxWidth:      '340px',
            margin:        '0 auto'
          }}>
            <Link to="/report" style={{ textDecoration: 'none' }}>
              <button style={btnPrimary}>Report Abuse</button>
            </Link>
            <Link to="/track" style={{ textDecoration: 'none' }}>
              <button style={btnOutline}>Track My Report</button>
            </Link>
          </div>

        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{
        backgroundColor: 'var(--color-bg-soft)',
        padding:         '64px 24px'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <h2 style={{
            fontSize:    '24px',
            fontWeight:  '700',
            textAlign:   'center',
            marginBottom:'48px',
            color:       'var(--color-text-main)'
          }}>
            How it works
          </h2>

          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap:                 '24px'
          }}>
            {[
              {
                icon:  <FiFileText size={28} style={{ color: 'var(--color-primary)' }} />,
                step:  '1',
                title: 'Submit a Report',
                desc:  'Fill out the secure form. You can remain completely anonymous — no account needed.'
              },
              {
                icon:  <FiShield size={28} style={{ color: 'var(--color-primary)' }} />,
                step:  '2',
                title: 'We Review It',
                desc:  'Our team reviews your report privately and takes appropriate action.'
              },
              {
                icon:  <FiSearch size={28} style={{ color: 'var(--color-primary)' }} />,
                step:  '3',
                title: 'Track Progress',
                desc:  'Use your unique tracking token to check the status of your report at any time.'
              }
            ].map(item => (
              <div key={item.step} className="hover-card" style={{
                backgroundColor: 'var(--color-white)',
                borderRadius:    '16px',
                padding:         '32px 24px',
                textAlign:       'center',
                boxShadow:       'var(--shadow-card)'
              }}>
                <div style={{
                  display:         'inline-flex',
                  padding:         '14px',
                  borderRadius:    '50%',
                  backgroundColor: '#EEF2FF',
                  marginBottom:    '16px'
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize:    '11px',
                  fontWeight:  '700',
                  color:       'var(--color-primary)',
                  letterSpacing:'0.08em',
                  marginBottom:'8px'
                }}>
                  STEP {item.step}
                </div>
                <h3 style={{
                  fontSize:    '16px',
                  fontWeight:  '700',
                  color:       'var(--color-text-main)',
                  marginBottom:'10px'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize:   '14px',
                  color:      'var(--color-text-muted)',
                  lineHeight: '1.6'
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── You are not alone ── */}
      <section style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <FiHeart size={36} style={{ color: 'var(--color-secondary)' }} />
          </div>
          <h2 style={{
            fontSize:    '22px',
            fontWeight:  '700',
            color:       'var(--color-text-main)',
            marginBottom:'12px'
          }}>
            You are not alone
          </h2>
          <p style={{
            fontSize:    '14px',
            color:       'var(--color-text-muted)',
            lineHeight:  '1.7',
            marginBottom:'28px'
          }}>
            Find emergency hotlines, shelters, legal aid, and digital safety resources.
          </p>
          <Link to="/resources" style={{ textDecoration: 'none' }}>
            <button style={btnSecondary}>View Support Resources</button>
          </Link>
        </div>
      </section>

    </PublicLayout>
  );
};

export default HomePage;