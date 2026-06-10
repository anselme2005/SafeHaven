// ============================================================
// src/pages/TrackPage.jsx
// Track a report by token — strictly read only
// ============================================================

import { useState, useEffect }  from 'react';
import { useSearchParams }      from 'react-router-dom';
import { FiSearch, FiClock, FiMessageSquare, FiShield } from '../utils/icons';
import PublicLayout             from '../layouts/PublicLayout';
import api                      from '../services/api';
import { ABUSE_TYPE_LABELS }    from '../utils/constants';

const STATUS_STYLES = {
  pending: {
    label:           'Pending Review',
    backgroundColor: '#FEF9C3',
    color:           '#854D0E',
    border:          '1px solid #FDE047'
  },
  under_review: {
    label:           'Under Review',
    backgroundColor: '#EEF2FF',
    color:           'var(--color-primary)',
    border:          '1px solid var(--color-primary)'
  },
  resolved: {
    label:           'Resolved',
    backgroundColor: '#DCFCE7',
    color:           '#16A34A',
    border:          '1px solid #86EFAC'
  }
};

const formatDate = (d) => new Date(d).toLocaleString('en-GB', {
  day: '2-digit', month: 'long', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
});

const TrackPage = () => {
  const [searchParams]              = useSearchParams();
  const [token,      setToken]      = useState(searchParams.get('token') || '');
  const [report,     setReport]     = useState(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    if (searchParams.get('token')) fetchReport(searchParams.get('token'));
  }, []);

  const fetchReport = async (tokenToFetch) => {
    const t = (tokenToFetch || token).trim().toUpperCase();
    if (!t) { setError('Please enter your tracking token.'); return; }

    setIsLoading(true);
    setError('');
    setReport(null);

    try {
      const res = await api.get(`/reports/track/${t}`);
      setReport(res.data);
    } catch (err) {
      setError(err.response?.status === 404
        ? 'No report found with that token. Please check and try again.'
        : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const statusStyle = report ? STATUS_STYLES[report.reportStatus] : null;

  return (
    <PublicLayout>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{
            fontSize:    '28px',
            fontWeight:  '700',
            color:       'var(--color-text-main)',
            marginBottom:'10px'
          }}>
            Track Your Report
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Enter the tracking token you received after submitting your report.
          </p>
        </div>

        {/* Token input card */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius:    '16px',
          padding:         '36px 32px',
          boxShadow:       'var(--shadow-card)',
          marginBottom:    '28px'
        }}>
          <label style={{
            display:      'block',
            fontSize:     '14px',
            fontWeight:   '600',
            color:        'var(--color-text-main)',
            marginBottom: '10px'
          }}>
            Tracking Token
          </label>

          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={token}
              onChange={e => { setToken(e.target.value.toUpperCase()); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && fetchReport()}
              placeholder="SH-XXXXXXXX"
              maxLength={11}
              style={{
                flex:            1,
                padding:         '12px 16px',
                borderRadius:    '10px',
                border:          error
                  ? '2px solid var(--color-danger)'
                  : '2px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-soft)',
                color:           'var(--color-text-main)',
                fontSize:        '16px',
                fontFamily:      'monospace',
                letterSpacing:   '0.05em',
                outline:         'none',
                minWidth:        0
              }}
            />

            <button
              onClick={() => fetchReport()}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? 'var(--color-text-muted)' : 'var(--color-primary)',
                color:           'var(--color-white)',
                border:          'none',
                borderRadius:    '10px',
                padding:         '12px 22px',
                fontSize:        '14px',
                fontWeight:      '600',
                cursor:          isLoading ? 'not-allowed' : 'pointer',
                display:         'flex',
                alignItems:      'center',
                gap:             '8px',
                whiteSpace:      'nowrap',
                flexShrink:      0
              }}>
              <FiSearch size={16} />
              {isLoading ? 'Searching...' : 'Track'}
            </button>
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: 'var(--color-danger)', marginTop: '8px' }}>
              {error}
            </p>
          )}
        </div>

        {/* Report result */}
        {report && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Status card */}
            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius:    '16px',
              padding: '36px 32px',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                marginBottom:   '20px',
                flexWrap:       'wrap',
                gap:            '12px'
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                  Report Status
                </h2>
                <span style={{
                  ...statusStyle,
                  borderRadius: '999px',
                  padding:      '5px 14px',
                  fontSize:     '13px',
                  fontWeight:   '600'
                }}>
                  {statusStyle.label}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { label: 'Token',       value: report.trackingToken,   mono: true },
                  { label: 'Abuse Type',  value: ABUSE_TYPE_LABELS[report.abuseType] || report.abuseType },
                  { label: 'Urgency',     value: report.urgencyLevel.charAt(0).toUpperCase() + report.urgencyLevel.slice(1) },
                  { label: 'Submitted',   value: formatDate(report.submittedAt) },
                  { label: 'Last Update', value: formatDate(report.lastUpdated) },
                  ...(report.location ? [{ label: 'Location', value: report.location }] : [])
                ].map((row, i) => (
                  <div key={row.label} style={{
                    display:         'flex',
                    justifyContent:  'space-between',
                    alignItems:      'center',
                    padding:         '12px 0',
                    borderBottom:    '1px solid var(--color-border)',
                    gap:             '16px',
                    flexWrap:        'wrap'
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '500', flexShrink: 0 }}>
                      {row.label}
                    </span>
                    <span style={{
                      fontSize:   '13px',
                      color:      'var(--color-text-main)',
                      fontWeight: row.mono ? '700' : '500',
                      fontFamily: row.mono ? 'monospace' : 'inherit',
                      wordBreak:  'break-all'
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin responses */}
            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius:    '16px',
              padding: '36px 32px',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FiMessageSquare size={18} style={{ color: 'var(--color-primary)' }} />
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                  Responses from our team
                </h2>
              </div>

              {report.adminResponses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <FiClock size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                    No responses yet. Our team will update this report shortly.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {report.adminResponses.map((r, i) => (
                    <div key={i} style={{
                      backgroundColor: 'var(--color-bg-soft)',
                      borderRadius:    '10px',
                      borderLeft:      '3px solid var(--color-primary)',
                      padding:         '16px'
                    }}>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-main)', lineHeight: '1.6', marginBottom: '8px' }}>
                        {r.responseText}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiClock size={11} /> {formatDate(r.respondedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy notice */}
            <div style={{
              backgroundColor: '#EEF2FF',
              borderRadius:    '10px',
              padding:         '16px',
              display:         'flex',
              alignItems:      'flex-start',
              gap:             '12px'
            }}>
              <FiShield size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '13px', color: 'var(--color-primary)', lineHeight: '1.6' }}>
                This page only shows information that is safe to display publicly.
                Your contact details and personal information are never shown here.
              </p>
            </div>

          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default TrackPage;