// ============================================================
// src/pages/AboutPage.jsx
// Explains anonymity, how reports are handled, and privacy
// ============================================================

import PublicLayout from '../layouts/PublicLayout';
import { FiShield, FiLock, FiEye, FiAlertTriangle, FiMessageCircle } from '../utils/icons';

const Section = ({ icon, title, children }) => (
  <div style={{
    backgroundColor: 'var(--color-white)',
    borderRadius:    '14px',
    padding:         '28px 32px',
    boxShadow:       'var(--shadow-soft)',
    marginBottom:    '20px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
      <div style={{
        backgroundColor: '#EEF2FF',
        borderRadius:    '8px',
        padding:         '8px',
        color:           'var(--color-primary)',
        display:         'inline-flex'
      }}>
        {icon}
      </div>
      <h2 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-text-main)' }}>
        {title}
      </h2>
    </div>
    <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.8' }}>
      {children}
    </div>
  </div>
);

const AboutPage = () => {
  return (
    <PublicLayout>
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '56px 24px 64px' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display:         'inline-flex',
            padding:         '14px',
            borderRadius:    '50%',
            backgroundColor: '#EEF2FF',
            marginBottom:    '16px'
          }}>
            <FiShield size={36} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '10px' }}>
            About SafeHaven
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.7' }}>
            How this platform works, how your privacy is protected,
            and what to expect after submitting a report.
          </p>
        </div>

        <Section icon={<FiLock size={18} />} title="How anonymity works">
          <p style={{ marginBottom: '12px' }}>
            SafeHaven is designed so that you never have to reveal who you are.
            No account is required. No name is collected. No login exists for victims.
          </p>
          <p style={{ marginBottom: '12px' }}>
            When you submit a report, the system generates a unique tracking token
            (e.g. <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary)' }}>SH-A3F9BC12</span>).
            This token is the only link between you and your report.
            We do not know who generated it.
          </p>
          <p>
            If you choose to provide contact information (email or phone),
            it is encrypted using AES-256-GCM encryption before being stored.
            Only authorized administrators can read it, and only when viewing
            your specific report. It is never stored in plain text.
          </p>
        </Section>

        <Section icon={<FiEye size={18} />} title="How reports are handled">
          <p style={{ marginBottom: '12px' }}>
            Every submitted report is reviewed by our admin team. Reports are
            prioritized by urgency level — high urgency cases are reviewed first.
          </p>
          <p style={{ marginBottom: '12px' }}>
            Your report goes through the following stages:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
            {[
              { status: 'Pending',      desc: 'Your report has been received and is awaiting review.' },
              { status: 'Under Review', desc: 'Our team is actively reviewing your report.' },
              { status: 'Resolved',     desc: 'Action has been taken and the case has been closed.' }
            ].map(s => (
              <div key={s.status} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{
                  backgroundColor: '#EEF2FF',
                  color:           'var(--color-primary)',
                  borderRadius:    '999px',
                  padding:         '3px 12px',
                  fontSize:        '12px',
                  fontWeight:      '700',
                  whiteSpace:      'nowrap',
                  flexShrink:      0
                }}>
                  {s.status}
                </span>
                <span>{s.desc}</span>
              </div>
            ))}
          </div>
          <p>
            Use your tracking token on the{' '}
            <a href="/track" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
              Track Report
            </a>{' '}
            page to check your report's current status and read any responses
            from our team at any time.
          </p>
        </Section>

        <Section icon={<FiAlertTriangle size={18} />} title="Limitations">
          <p style={{ marginBottom: '12px' }}>
            SafeHaven is a reporting and coordination platform. We are not a law
            enforcement agency and cannot guarantee legal action will be taken on
            every report. Our role is to receive, review, and escalate reports
            appropriately.
          </p>
          <p style={{ marginBottom: '12px' }}>
            If you are in immediate danger, please contact emergency services
            directly at <strong>117</strong> or <strong>113</strong>.
          </p>
          <p>
            We also cannot recover a lost tracking token. Because we do not store
            your identity, there is no way to link a token to a person if it is lost.
            Please keep your token safe.
          </p>
        </Section>

        <Section icon={<FiMessageCircle size={18} />} title="Live Chat — Privacy Notice">
          <p style={{ marginBottom: '12px' }}>
            This platform includes a live chat feature powered by{' '}
            <strong>Tawk.io</strong>, a third-party service. The live chat allows
            you to communicate directly with our admin team — for example, to
            discuss your report or request that a resolved case be reopened.
          </p>
          <div style={{
            backgroundColor: '#FEF9C3',
            border:          '1px solid #FDE047',
            borderRadius:    '10px',
            padding:         '16px 20px',
            fontSize:        '13px',
            color:           '#713F12',
            lineHeight:      '1.7'
          }}>
            <strong style={{ color: '#854D0E' }}>Transparency Notice:</strong>{' '}
            While reports submitted through this platform remain anonymous,
            the live chat provider (Tawk.io) may collect limited technical metadata
            such as IP addresses according to their privacy policy. If you are
            concerned about this, you may choose not to use the live chat and
            instead rely solely on your tracking token to follow up on your report.
          </div>
        </Section>

      </div>
    </PublicLayout>
  );
};

export default AboutPage;