// ============================================================
// src/pages/admin/DashboardPage.jsx
// Admin dashboard — summary stats + recent reports table
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { FiFileText, FiClock, FiAlertTriangle, FiCheckCircle, FiEye } from '../../utils/icons';
import AdminLayout             from '../../layouts/AdminLayout';
import api                     from '../../services/api';
import { ABUSE_TYPE_LABELS }   from '../../utils/constants';

// --- Status badge ---
const StatusBadge = ({ status }) => {
  const styles = {
    pending:      { backgroundColor: '#FEF9C3', color: '#854D0E',             label: 'Pending'      },
    under_review: { backgroundColor: '#EEF2FF', color: 'var(--color-primary)', label: 'Under Review' },
    resolved:     { backgroundColor: '#DCFCE7', color: '#16A34A',             label: 'Resolved'     }
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{
      ...s,
      borderRadius: '999px',
      padding:      '4px 12px',
      fontSize:     '12px',
      fontWeight:   '600',
      whiteSpace:   'nowrap'
    }}>
      {s.label}
    </span>
  );
};

// --- Urgency badge ---
const UrgencyBadge = ({ level }) => {
  const styles = {
    low:    { backgroundColor: '#F0FDF4', color: '#16A34A' },
    medium: { backgroundColor: '#FFFBEB', color: '#D97706' },
    high:   { backgroundColor: '#FEF2F2', color: '#DC2626' }
  };
  const s = styles[level] || styles.low;
  return (
    <span style={{
      ...s,
      borderRadius: '999px',
      padding:      '4px 12px',
      fontSize:     '12px',
      fontWeight:   '600',
      whiteSpace:   'nowrap',
      textTransform:'capitalize'
    }}>
      {level}
    </span>
  );
};

const DashboardPage = () => {
  const navigate            = useNavigate();
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      setReports(res.data.reports);
    } catch (err) {
      setError('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  // --- Compute summary stats from reports array ---
  const stats = {
    total:       reports.length,
    pending:     reports.filter(r => r.reportStatus === 'pending').length,
    underReview: reports.filter(r => r.reportStatus === 'under_review').length,
    high:        reports.filter(r => r.urgencyLevel  === 'high' && r.reportStatus !== 'resolved').length,
    resolved:    reports.filter(r => r.reportStatus === 'resolved').length
  };

  const statCards = [
    { label: 'Total Reports',    value: stats.total,       icon: <FiFileText size={22} />,      color: 'var(--color-primary)' },
    { label: 'Pending',          value: stats.pending,     icon: <FiClock size={22} />,          color: '#D97706'              },
    { label: 'High Urgency',     value: stats.high,        icon: <FiAlertTriangle size={22} />,  color: 'var(--color-danger)'  },
    { label: 'Resolved',         value: stats.resolved,    icon: <FiCheckCircle size={22} />,    color: '#16A34A'              }
  ];

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <AdminLayout>

      {/* Page heading */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '4px' }}>
          Overview
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          All incoming reports and their current status.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap:                 '16px',
        marginBottom:        '32px'
      }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            backgroundColor: 'var(--color-white)',
            borderRadius:    '14px',
            padding:         '20px 24px',
            boxShadow:       'var(--shadow-soft)',
            display:         'flex',
            alignItems:      'center',
            gap:             '16px'
          }}>
            <div style={{
              backgroundColor: `${card.color}18`,
              borderRadius:    '10px',
              padding:         '10px',
              color:           card.color,
              flexShrink:      0
            }}>
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-text-main)', lineHeight: '1' }}>
                {card.value}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Reports table */}
      <div style={{
        backgroundColor: 'var(--color-white)',
        borderRadius:    '14px',
        boxShadow:       'var(--shadow-soft)',
        overflow:        'hidden'
      }}>
        <div style={{
          padding:        '20px 24px',
          borderBottom:   '1px solid var(--color-border)',
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)' }}>
            All Reports
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {reports.length} total
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Loading reports...
          </div>
        ) : error ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-danger)', fontSize: '14px' }}>
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            No reports submitted yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-soft)' }}>
                  {['Token', 'Abuse Type', 'Urgency', 'Status', 'Date', 'Action'].map(col => (
                    <th key={col} style={{
                      padding:   '12px 16px',
                      textAlign: 'left',
                      fontSize:  '12px',
                      fontWeight:'700',
                      color:     'var(--color-text-muted)',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      whiteSpace:'nowrap'
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={report._id} style={{
                    borderTop:       '1px solid var(--color-border)',
                    backgroundColor: index % 2 === 0 ? 'var(--color-white)' : 'var(--color-bg-main)'
                  }}>
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'monospace', fontWeight: '600', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                      {report.trackingToken}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-text-main)', whiteSpace: 'nowrap' }}>
                      {ABUSE_TYPE_LABELS[report.abuseType] || report.abuseType}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <UrgencyBadge level={report.urgencyLevel} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={report.reportStatus} />
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(report.createdAt)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => navigate(`/admin/reports/${report._id}`)}
                        style={{
                          display:         'inline-flex',
                          alignItems:      'center',
                          gap:             '6px',
                          backgroundColor: '#EEF2FF',
                          color:           'var(--color-primary)',
                          border:          'none',
                          borderRadius:    '8px',
                          padding:         '7px 14px',
                          fontSize:        '13px',
                          fontWeight:      '600',
                          cursor:          'pointer',
                          whiteSpace:      'nowrap'
                        }}>
                        <FiEye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </AdminLayout>
  );
};

export default DashboardPage;