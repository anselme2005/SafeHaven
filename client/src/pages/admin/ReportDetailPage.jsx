// ============================================================
// src/pages/admin/ReportDetailPage.jsx
// Full report view — status management, responses, audit trail
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiAlertTriangle, FiCheckCircle,
  FiClock, FiRefreshCw, FiSend
} from 'react-icons/fi';
import AdminLayout           from '../../layouts/AdminLayout';
import api                   from '../../services/api';
import { ABUSE_TYPE_LABELS } from '../../utils/constants';

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
      padding:      '5px 14px',
      fontSize:     '13px',
      fontWeight:   '600'
    }}>
      {s.label}
    </span>
  );
};

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
      borderRadius:  '999px',
      padding:       '5px 14px',
      fontSize:      '13px',
      fontWeight:    '600',
      textTransform: 'capitalize'
    }}>
      {level}
    </span>
  );
};

const formatDate = (d) => new Date(d).toLocaleString('en-GB', {
  day: '2-digit', month: 'long', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
});

const ReportDetailPage = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [report,       setReport]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  // Response form
  const [responseText, setResponseText] = useState('');
  const [respError,    setRespError]    = useState('');

  // Status update
  const [newStatus,    setNewStatus]    = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError,  setStatusError]  = useState('');

  // Reopen
  const [reopening,    setReopening]    = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/reports/${id}`);
      setReport(res.data);
      setNewStatus(res.data.reportStatus);
    } catch (err) {
      setError('Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

 // --- Unified case update ---
  // Updates status always, sends response only if text is provided
  const handleUpdateCase = async () => {
    setUpdatingStatus(true);
    setStatusError('');
    setRespError('');

    try {
      // Step 1 — Update status if it has changed
      if (newStatus !== report.reportStatus) {
        await api.patch(`/admin/reports/${id}/status`, { reportStatus: newStatus });
      }

      // Step 2 — Send response only if the admin wrote something
      if (responseText.trim()) {
        await api.patch(`/admin/reports/${id}/respond`, { responseText });
        setResponseText('');
      }

      // Refresh the report to show latest state
      await fetchReport();

    } catch (err) {
      const message = err.response?.data?.message || 'Update failed. Please try again.';
      // Assign error to the right field based on which call likely failed
      if (err.config?.url?.includes('respond')) {
        setRespError(message);
      } else {
        setStatusError(message);
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  // --- Reopen case ---
  const handleReopen = async () => {
    setReopening(true);
    try {
      await api.patch(`/admin/reports/${id}/reopen`);
      await fetchReport();
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to reopen case.');
    } finally {
      setReopening(false);
    }
  };

  const sectionCard = {
    backgroundColor: 'var(--color-white)',
    borderRadius:    '14px',
    padding:         '28px',
    boxShadow:       'var(--shadow-soft)',
    marginBottom:    '20px'
  };

  const sectionTitle = {
    fontSize:     '15px',
    fontWeight:   '700',
    color:        'var(--color-text-main)',
    marginBottom: '20px',
    display:      'flex',
    alignItems:   'center',
    gap:          '8px'
  };

  if (loading) return (
    <AdminLayout>
      <div style={{ textAlign: 'center', padding: '64px', color: 'var(--color-text-muted)' }}>
        Loading report...
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div style={{ textAlign: 'center', padding: '64px', color: 'var(--color-danger)' }}>
        {error}
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>

      {/* Back button */}
      <button
        onClick={() => navigate('/admin/dashboard')}
        style={{
          display:         'inline-flex',
          alignItems:      'center',
          gap:             '8px',
          backgroundColor: 'transparent',
          border:          'none',
          color:           'var(--color-text-muted)',
          fontSize:        '14px',
          fontWeight:      '500',
          cursor:          'pointer',
          padding:         '0',
          marginBottom:    '24px'
        }}>
        <FiArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Header */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'flex-start',
        flexWrap:       'wrap',
        gap:            '16px',
        marginBottom:   '24px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '6px' }}>
            Report Detail
          </h2>
          <span style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary)' }}>
            {report.trackingToken}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <UrgencyBadge level={report.urgencyLevel} />
          <StatusBadge  status={report.reportStatus} />
        </div>
      </div>

      {/* Report Info */}
      <div style={sectionCard}>
        <h3 style={sectionTitle}>
          <FiAlertTriangle size={16} style={{ color: 'var(--color-primary)' }} />
          Report Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Abuse Type',     value: ABUSE_TYPE_LABELS[report.abuseType] || report.abuseType },
            { label: 'Urgency',        value: report.urgencyLevel,  capitalize: true },
            { label: 'Status',         value: report.reportStatus.replace('_', ' '), capitalize: true },
            { label: 'Location',       value: report.location || 'Not provided' },
            { label: 'Contact Method', value: report.contactMethod, capitalize: true },
            { label: 'Submitted',      value: formatDate(report.createdAt) }
          ].map(row => (
            <div key={row.label}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                {row.label}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--color-text-main)', fontWeight: '500', textTransform: row.capitalize ? 'capitalize' : 'none' }}>
                {row.value}
              </p>
            </div>
          ))}
        </div>

        {/* Contact value — decrypted */}
        {report.contactMethod !== 'anonymous' && report.contactValue && (
          <div style={{
            backgroundColor: '#FEF9C3',
            border:          '1px solid #FDE047',
            borderRadius:    '10px',
            padding:         '14px 18px',
            marginBottom:    '20px'
          }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#854D0E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Contact Detail (Decrypted)
            </p>
            <p style={{ fontSize: '14px', color: '#713F12', fontWeight: '600' }}>
              {report.contactValue}
            </p>
          </div>
        )}

        {/* Incident description */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Incident Description
          </p>
          <div style={{
            backgroundColor: 'var(--color-bg-soft)',
            borderRadius:    '10px',
            padding:         '16px 20px',
            fontSize:        '14px',
            color:           'var(--color-text-main)',
            lineHeight:      '1.7',
            whiteSpace:      'pre-wrap'
          }}>
            {report.incidentDescription}
          </div>
        </div>
      </div>

     {/* Status Management + Response — unified action */}
      <div style={sectionCard}>
        <h3 style={sectionTitle}>
          <FiCheckCircle size={16} style={{ color: 'var(--color-primary)' }} />
          Update Case
        </h3>

        {/* Existing responses */}
        {report.adminResponses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
              Previous Responses
            </p>
            {report.adminResponses.map((r, i) => (
              <div key={i} style={{
                backgroundColor: 'var(--color-bg-soft)',
                borderRadius:    '10px',
                borderLeft:      '3px solid var(--color-primary)',
                padding:         '16px 20px'
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

        {/* Resolved state — only reopen available */}
        {report.reportStatus === 'resolved' ? (
          <div>
            <div style={{
              backgroundColor: 'var(--color-bg-soft)',
              borderRadius:    '10px',
              padding:         '14px 18px',
              fontSize:        '13px',
              color:           'var(--color-text-muted)',
              textAlign:       'center',
              marginBottom:    '16px'
            }}>
              This case is resolved. Reopen it to make further changes or add responses.
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleReopen}
                disabled={reopening}
                style={{
                  display:         'inline-flex',
                  alignItems:      'center',
                  gap:             '8px',
                  backgroundColor: '#FEF2F2',
                  color:           'var(--color-danger)',
                  border:          '1px solid var(--color-danger)',
                  borderRadius:    '8px',
                  padding:         '10px 20px',
                  fontSize:        '13px',
                  fontWeight:      '600',
                  cursor:          reopening ? 'not-allowed' : 'pointer'
                }}>
                <FiRefreshCw size={14} />
                {reopening ? 'Reopening...' : 'Reopen Case'}
              </button>
            </div>
            {statusError && (
              <p style={{ fontSize: '13px', color: 'var(--color-danger)', marginTop: '10px', textAlign: 'center' }}>
                {statusError}
              </p>
            )}
          </div>
        ) : (
          // Active case — status dropdown + optional response + single button
          <div>

            {/* Status dropdown */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display:      'block',
                fontSize:     '13px',
                fontWeight:   '600',
                color:        'var(--color-text-main)',
                marginBottom: '8px'
              }}>
                Case Status
              </label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                style={{
                  width:           '100%',
                  padding:         '11px 14px',
                  borderRadius:    '8px',
                  border:          '2px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-soft)',
                  color:           'var(--color-text-main)',
                  fontSize:        '14px',
                  outline:         'none',
                  fontFamily:      'var(--font-family-sans)'
                }}>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Optional response textarea */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display:      'block',
                fontSize:     '13px',
                fontWeight:   '600',
                color:        'var(--color-text-main)',
                marginBottom: '8px'
              }}>
                Response{' '}
                <span style={{ color: 'var(--color-text-muted)', fontWeight: '400' }}>
                  (optional)
                </span>
              </label>
              <textarea
                value={responseText}
                onChange={e => { setResponseText(e.target.value); setRespError(''); }}
                rows={4}
                placeholder="Write a response to this report... (leave empty to just update the status)"
                style={{
                  width:           '100%',
                  padding:         '12px 16px',
                  borderRadius:    '10px',
                  border:          respError
                    ? '2px solid var(--color-danger)'
                    : '2px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-soft)',
                  color:           'var(--color-text-main)',
                  fontSize:        '14px',
                  lineHeight:      '1.6',
                  resize:          'vertical',
                  outline:         'none',
                  fontFamily:      'var(--font-family-sans)',
                  boxSizing:       'border-box'
                }}
              />
              {respError && (
                <p style={{ fontSize: '13px', color: 'var(--color-danger)', marginTop: '6px' }}>
                  {respError}
                </p>
              )}
            </div>

            {statusError && (
              <p style={{ fontSize: '13px', color: 'var(--color-danger)', marginBottom: '12px' }}>
                {statusError}
              </p>
            )}

            {/* Single unified action button */}
            <button
              onClick={handleUpdateCase}
              disabled={updatingStatus}
              style={{
                width:           '100%',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                gap:             '8px',
                backgroundColor: updatingStatus ? 'var(--color-text-muted)' : 'var(--color-primary)',
                color:           'var(--color-white)',
                border:          'none',
                borderRadius:    '10px',
                padding:         '13px',
                fontSize:        '14px',
                fontWeight:      '600',
                cursor:          updatingStatus ? 'not-allowed' : 'pointer'
              }}>
              <FiSend size={15} />
              {updatingStatus ? 'Updating...' : 'Update Case'}
            </button>

          </div>
        )}
      </div>

      {/* Admin Responses */}
      <div style={sectionCard}>
        
        {/* Existing responses */}
        {report.adminResponses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            No responses added yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {report.adminResponses.map((r, i) => (
              <div key={i} style={{
                backgroundColor: 'var(--color-bg-soft)',
                borderRadius:    '10px',
                borderLeft:      '3px solid var(--color-primary)',
                padding:         '16px 20px'
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

        {/* Add new response — blocked if resolved */}
        {report.reportStatus === 'resolved' ? (
          <div style={{
            backgroundColor: 'var(--color-bg-soft)',
            borderRadius:    '10px',
            padding:         '14px 18px',
            fontSize:        '13px',
            color:           'var(--color-text-muted)',
            textAlign:       'center'
          }}>
            Reopen this case to add new responses.
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-main)', marginBottom: '8px' }}>
              Add a Response
            </label>
            <textarea
              value={responseText}
              onChange={e => { setResponseText(e.target.value); setRespError(''); }}
              rows={4}
              placeholder="Write your response to this report..."
              style={{
                width:           '100%',
                padding:         '12px 16px',
                borderRadius:    '10px',
                border:          respError
                  ? '2px solid var(--color-danger)'
                  : '2px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-soft)',
                color:           'var(--color-text-main)',
                fontSize:        '14px',
                lineHeight:      '1.6',
                resize:          'vertical',
                outline:         'none',
                fontFamily:      'var(--font-family-sans)',
                marginBottom:    '8px',
                boxSizing:       'border-box'
              }}
            />
            {respError && (
              <p style={{ fontSize: '13px', color: 'var(--color-danger)', marginBottom: '8px' }}>
                {respError}
              </p>
            )}
          </div>
        )}
      </div>

    </AdminLayout>
  );
};

export default ReportDetailPage;