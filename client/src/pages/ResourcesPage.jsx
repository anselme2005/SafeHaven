// ============================================================
// src/pages/ResourcesPage.jsx
// Support resources — hotlines, NGOs, shelters, safety guides
// ============================================================

import { useState }  from 'react';
import PublicLayout  from '../layouts/PublicLayout';
import {
  FiPhone, FiGlobe, FiShield, FiHeart,
  FiAlertTriangle, FiChevronDown, FiChevronUp
} from '../utils/icons';

// ── Data ──────────────────────────────────────────────────────
const EMERGENCY_HOTLINES = [
  {
    name:        'National Emergency Services',
    number:      '117 / 113',
    description: 'Police and emergency response. Available 24/7.',
    available:   '24/7'
  },
  {
    name:        'Cameroon Red Cross',
    number:      '+237 222 22 57 69',
    description: 'Humanitarian assistance, emergency response, and psychosocial support.',
    available:   'Office hours'
  },
  {
    name:        'Ministry of Social Affairs',
    number:      '+237 222 23 40 23',
    description: 'Government social protection services including child and family welfare.',
    available:   'Office hours'
  },
  {
    name:        'African Network for Prevention Against Child Abuse (ANPPCAN)',
    number:      '+237 222 21 01 76',
    description: 'Dedicated to the prevention of child abuse and neglect across Africa.',
    available:   'Office hours'
  }
];

const NGOS = [
  {
    name:        'FIDA Cameroon (International Federation of Women Lawyers)',
    description: 'Free legal aid and support for women and children facing abuse, discrimination, and violence.',
    website:     'https://fidacameroon.org',
    services:    ['Legal Aid', 'Counselling', 'Advocacy']
  },
  {
    name:        'Association for the Fight Against Violence Against Women (ALVF)',
    description: 'Provides shelter, psychological support, and legal assistance to survivors of gender-based violence.',
    website:     null,
    services:    ['Shelter', 'Psychological Support', 'Legal Assistance']
  },
  {
    name:        'Reach Out Cameroon',
    description: 'Community-based organization supporting vulnerable groups including abuse survivors and LGBTQ+ individuals.',
    website:     'https://reachoutcameroon.org',
    services:    ['Counselling', 'Safe Space', 'Medical Referrals']
  },
  {
    name:        'Network of Aunties (Réseau des Tantes)',
    description: 'Supports survivors of sexual and gender-based violence through direct assistance and awareness.',
    website:     null,
    services:    ['Support Groups', 'Awareness', 'Referrals']
  }
];

const DIGITAL_SAFETY_TIPS = [
  {
    title: 'Clear your browser history',
    body:  'After visiting this site, clear your browser history. In most browsers: Settings → History → Clear browsing data. Or use the keyboard shortcut Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac).'
  },
  {
    title: 'Use private/incognito mode',
    body:  'Open a private window before visiting sensitive websites. This prevents pages from appearing in your history. Press Ctrl+Shift+N (Chrome/Edge) or Ctrl+Shift+P (Firefox).'
  },
  {
    title: 'Use the Quick Exit button',
    body:  'This website has a Quick Exit button in the top-right corner. Clicking it — or pressing Escape — instantly redirects you to Google and clears session data.'
  },
  {
    title: 'Protect your tracking token',
    body:  'Write your token on paper rather than saving it digitally if you are concerned about someone accessing your phone or computer. Do not store it in your notes app or email.'
  },
  {
    title: 'Use a trusted device if possible',
    body:  'If you are concerned about device monitoring, try to use a trusted friend\'s device, a library computer, or a new private browser session on a public computer.'
  },
  {
    title: 'Be careful with screenshots',
    body:  'If you screenshot your tracking token, make sure the screenshot is stored somewhere private, or delete it after writing down the token manually.'
  }
];

const LEGAL_INFO = [
  {
    title: 'Law No. 2016/007 — Cameroonian Penal Code',
    body:  'Cameroon\'s Penal Code criminalizes physical assault, sexual violence, and domestic abuse. Penalties range from fines to imprisonment depending on severity.'
  },
  {
    title: 'Law No. 2005/015 — Child Protection',
    body:  'Provides for the protection of children from abuse, exploitation, and neglect. Any person aware of child abuse is legally obligated to report it to authorities.'
  },
  {
    title: 'Your right to anonymity',
    body:  'You have the right to report abuse without revealing your identity. SafeHaven is built around this right — no account, no name, no identity required to submit a report.'
  },
  {
    title: 'Legal aid availability',
    body:  'Organizations like FIDA Cameroon offer free legal consultations for survivors. You do not need money to access basic legal guidance.'
  }
];


// ── Components ────────────────────────────────────────────────

const SectionHeading = ({ icon, title, subtitle }) => (
  <div style={{ marginBottom: '28px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
      <div style={{
        backgroundColor: '#EEF2FF',
        borderRadius:    '8px',
        padding:         '8px',
        color:           'var(--color-primary)',
        display:         'inline-flex'
      }}>
        {icon}
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-main)' }}>
        {title}
      </h2>
    </div>
    {subtitle && (
      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginLeft: '46px' }}>
        {subtitle}
      </p>
    )}
  </div>
);

// Expandable accordion item for safety tips and legal info
const AccordionItem = ({ title, body }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border:       '1px solid var(--color-border)',
      borderRadius: '10px',
      overflow:     'hidden',
      marginBottom: '8px'
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width:           '100%',
          display:         'flex',
          justifyContent:  'space-between',
          alignItems:      'center',
          padding:         '16px 20px',
          backgroundColor: open ? '#EEF2FF' : 'var(--color-white)',
          border:          'none',
          cursor:          'pointer',
          textAlign:       'left',
          gap:             '12px'
        }}>
        <span style={{
          fontSize:   '14px',
          fontWeight: '600',
          color:      open ? 'var(--color-primary)' : 'var(--color-text-main)'
        }}>
          {title}
        </span>
        {open
          ? <FiChevronUp  size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          : <FiChevronDown size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{
          padding:    '0 20px 16px',
          fontSize:   '14px',
          color:      'var(--color-text-muted)',
          lineHeight: '1.7',
          borderTop:  '1px solid var(--color-border)',
          paddingTop: '14px'
        }}>
          {body}
        </div>
      )}
    </div>
  );
};


// ── Page ──────────────────────────────────────────────────────

const ResourcesPage = () => {
  return (
    <PublicLayout>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '56px 24px 64px' }}>

        {/* Page heading */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            display:         'inline-flex',
            padding:         '14px',
            borderRadius:    '50%',
            backgroundColor: '#EEF2FF',
            marginBottom:    '16px'
          }}>
            <FiHeart size={36} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '10px' }}>
            Support Resources
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' }}>
            You are not alone. Below are emergency contacts, organizations,
            digital safety tips, and legal information to help you.
          </p>
        </div>

        {/* ── Emergency Hotlines ── */}
        <section style={{ marginBottom: '56px' }}>
          <SectionHeading
            icon={<FiPhone size={18} />}
            title="Emergency Hotlines"
            subtitle="Call these numbers if you or someone else is in immediate danger."
          />
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap:                 '16px'
          }}>
            {EMERGENCY_HOTLINES.map(h => (
              <div key={h.name} style={{
                backgroundColor: 'var(--color-white)',
                borderRadius:    '14px',
                padding:         '24px',
                boxShadow:       'var(--shadow-soft)',
                borderLeft:      '4px solid var(--color-danger)'
              }}>
                <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                  {h.name}
                </p>
                <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-danger)', marginBottom: '8px', fontFamily: 'monospace' }}>
                  {h.number}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '8px' }}>
                  {h.description}
                </p>
                <span style={{
                  backgroundColor: '#FEF2F2',
                  color:           'var(--color-danger)',
                  borderRadius:    '999px',
                  padding:         '3px 10px',
                  fontSize:        '11px',
                  fontWeight:      '600'
                }}>
                  {h.available}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── NGOs & Organizations ── */}
        <section style={{ marginBottom: '56px' }}>
          <SectionHeading
            icon={<FiHeart size={18} />}
            title="NGOs & Support Organizations"
            subtitle="These organizations offer direct help to survivors of abuse."
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {NGOS.map(org => (
              <div key={org.name} style={{
                backgroundColor: 'var(--color-white)',
                borderRadius:    '14px',
                padding:         '24px',
                boxShadow:       'var(--shadow-soft)'
              }}>
                <div style={{
                  display:        'flex',
                  justifyContent: 'space-between',
                  alignItems:     'flex-start',
                  flexWrap:       'wrap',
                  gap:            '12px',
                  marginBottom:   '10px'
                }}>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                    {org.name}
                  </p>
                  {org.website && (
                    <a href={org.website} target="_blank" rel="noopener noreferrer"
                       style={{
                         display:    'inline-flex',
                         alignItems: 'center',
                         gap:        '6px',
                         fontSize:   '13px',
                         fontWeight: '600',
                         color:      'var(--color-primary)',
                         textDecoration: 'none'
                       }}>
                      <FiGlobe size={13} /> Visit Website
                    </a>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '12px' }}>
                  {org.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {org.services.map(s => (
                    <span key={s} style={{
                      backgroundColor: '#EEF2FF',
                      color:           'var(--color-primary)',
                      borderRadius:    '999px',
                      padding:         '4px 12px',
                      fontSize:        '12px',
                      fontWeight:      '600'
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Digital Safety Tips ── */}
        <section style={{ marginBottom: '56px' }}>
          <SectionHeading
            icon={<FiShield size={18} />}
            title="Digital Safety Tips"
            subtitle="Protect your privacy while using this platform and other online services."
          />
          <div>
            {DIGITAL_SAFETY_TIPS.map(tip => (
              <AccordionItem key={tip.title} title={tip.title} body={tip.body} />
            ))}
          </div>
        </section>

        {/* ── Legal Information ── */}
        <section style={{ marginBottom: '56px' }}>
          <SectionHeading
            icon={<FiAlertTriangle size={18} />}
            title="Legal Information"
            subtitle="Know your rights. These are not substitutes for professional legal advice."
          />
          <div>
            {LEGAL_INFO.map(item => (
              <AccordionItem key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <div style={{
          backgroundColor: '#EEF2FF',
          borderRadius:    '16px',
          padding:         '32px',
          textAlign:       'center'
        }}>
          <FiShield size={28} style={{ color: 'var(--color-primary)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '8px' }}>
            Ready to report?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '20px', lineHeight: '1.7' }}>
            Your report is anonymous and secure. No account needed.
            Our team reviews every submission.
          </p>
          <a href="/report" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: 'var(--color-primary)',
              color:           'var(--color-white)',
              border:          'none',
              borderRadius:    '10px',
              padding:         '13px 32px',
              fontSize:        '14px',
              fontWeight:      '600',
              cursor:          'pointer'
            }}>
              Submit a Report
            </button>
          </a>
        </div>

      </div>
    </PublicLayout>
  );
};

export default ResourcesPage;