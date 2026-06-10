// ============================================================
// src/pages/ReportPage.jsx
// Multi-step abuse report submission form
// ============================================================
// IMPORTANT ARCHITECTURE NOTE:
// All step content is rendered inline as JSX directly inside
// the return statement — NOT as sub-components defined inside
// this component. Defining components inside a parent component
// causes React to treat them as new component types on every
// re-render, which unmounts and remounts them on every keystroke,
// destroying input focus. Inline JSX avoids this entirely.
// ============================================================

import { useState }     from 'react';
import { FiChevronRight, FiChevronLeft, FiCopy, FiCheck, FiShield } from 'react-icons/fi';
import PublicLayout     from '../layouts/PublicLayout';
import api              from '../services/api';
import { ABUSE_TYPE_LABELS, URGENCY_LEVELS } from '../utils/constants';

const TOTAL_STEPS = 5;

// ============================================================
// Sub-components defined OUTSIDE ReportPage
// This is the correct pattern — React sees these as stable
// component types across re-renders, so focus is never lost
// ============================================================

const ProgressBar = ({ currentStep }) => (
  <div style={{ marginBottom: '28px' }}>
    <div style={{
      display:        'flex',
      justifyContent: 'space-between',
      fontSize:       '13px',
      color:          'var(--color-text-muted)',
      marginBottom:   '8px'
    }}>
      <span>Step {currentStep} of {TOTAL_STEPS}</span>
      <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}% complete</span>
    </div>
    <div style={{
      width:           '100%',
      height:          '6px',
      borderRadius:    '999px',
      backgroundColor: 'var(--color-bg-soft)'
    }}>
      <div style={{
        height:          '6px',
        borderRadius:    '999px',
        backgroundColor: 'var(--color-primary)',
        width:           `${(currentStep / TOTAL_STEPS) * 100}%`,
        transition:      'width 0.4s ease'
      }} />
    </div>
  </div>
);

const NavButtons = ({ onNext, onBack, nextLabel = 'Continue', showBack = true, loading = false }) => (
  <div style={{
    display:        'flex',
    justifyContent: showBack ? 'space-between' : 'flex-end',
    marginTop:      '28px'
  }}>
    {showBack && (
      <button onClick={onBack} style={{
        backgroundColor: 'var(--color-bg-soft)',
        color:           'var(--color-text-muted)',
        border:          'none',
        borderRadius:    '10px',
        padding:         '12px 22px',
        fontSize:        '14px',
        fontWeight:      '500',
        cursor:          'pointer',
        display:         'flex',
        alignItems:      'center',
        gap:             '6px'
      }}>
        ← Back
      </button>
    )}

    <button onClick={onNext} disabled={loading} style={{
      backgroundColor: loading ? 'var(--color-text-muted)' : 'var(--color-primary)',
      color:           'var(--color-white)',
      border:          'none',
      borderRadius:    '10px',
      padding:         '12px 26px',
      fontSize:        '14px',
      fontWeight:      '600',
      cursor:          loading ? 'not-allowed' : 'pointer',
      display:         'flex',
      alignItems:      'center',
      gap:             '8px'
    }}>
      {loading ? 'Submitting...' : nextLabel} {!loading && '→'}
    </button>
  </div>
);

const Card = ({ children }) => (
  <div className="p-8 rounded-2xl"
       style={{
         backgroundColor: 'var(--color-white)',
         padding:         '40px 44px 44px',
         boxShadow:       'var(--shadow-card)',
         borderRadius:    'var(--radius-xl)'
       }}>
    {children}
  </div>
);

const FieldError = ({ message }) => message
  ? <p style={{ fontSize: '13px', color: 'var(--color-danger)', marginTop: '6px' }}>{message}</p>
  : null;

const StepHeading = ({ title, subtitle }) => (
  <div style={{ marginBottom: '24px' }}>
    <h2 style={{
      fontSize:    '20px',
      fontWeight:  '700',
      color:       'var(--color-text-main)',
      marginBottom:'6px'
    }}>
      {title}
    </h2>
    {subtitle && (
      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
        {subtitle}
      </p>
    )}
  </div>
);


// ============================================================
// Main Component
// ============================================================

const ReportPage = () => {

  const [currentStep,   setCurrentStep]   = useState(1);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [submitError,   setSubmitError]   = useState('');
  const [trackingToken, setTrackingToken] = useState('');
  const [copied,        setCopied]        = useState(false);

  const [formData, setFormData] = useState({
    abuseType:           '',
    incidentDescription: '',
    urgencyLevel:        '',
    location:            '',
    contactMethod:       'anonymous',
    contactValue:        ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.abuseType)
        newErrors.abuseType = 'Please select the type of abuse.';
    }

    if (currentStep === 2) {
      if (!formData.incidentDescription.trim())
        newErrors.incidentDescription = 'Please describe the incident.';
      else if (formData.incidentDescription.trim().length < 20)
        newErrors.incidentDescription = 'Description must be at least 20 characters.';
      else if (formData.incidentDescription.trim().length > 5000)
        newErrors.incidentDescription = 'Description cannot exceed 5000 characters.';
    }

    if (currentStep === 3) {
      if (!formData.urgencyLevel)
        newErrors.urgencyLevel = 'Please select an urgency level.';
    }

    if (currentStep === 4) {
      if (formData.contactMethod !== 'anonymous' && !formData.contactValue.trim())
        newErrors.contactValue = 'Please provide your contact detail.';
      if (formData.contactMethod === 'email' && formData.contactValue) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.contactValue))
          newErrors.contactValue = 'Please enter a valid email address.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep()) setCurrentStep(prev => prev + 1);
  };

  const goBack = () => {
    setErrors({});
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        abuseType:           formData.abuseType,
        incidentDescription: formData.incidentDescription,
        urgencyLevel:        formData.urgencyLevel,
        contactMethod:       formData.contactMethod,
        contactValue:        formData.contactMethod !== 'anonymous'
                               ? formData.contactValue
                               : undefined,
        location:            formData.location || undefined
      };

      const response = await api.post('/reports', payload);
      setTrackingToken(response.data.trackingToken);
      setCurrentStep(6);

    } catch (error) {
      const message = error.response?.data?.message
        || error.response?.data?.errors?.[0]?.msg
        || 'Submission failed. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <PublicLayout>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>

        {currentStep < 6 && (
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold mb-2"
                style={{ color: 'var(--color-text-main)' }}>
              Submit a Report
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Your report is confidential. Take your time.
            </p>
          </div>
        )}

        {currentStep < 6 && <ProgressBar currentStep={currentStep} />}

        {/* ---- STEP 1 — Abuse Type ---- */}
        {currentStep === 1 && (
          <Card>
            <StepHeading
              title="What type of abuse are you reporting?"
              subtitle="Select the category that best describes the situation."
            />

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ABUSE_TYPE_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleChange('abuseType', value)}
                  style={{
                    padding:         '16px',
                    textAlign:       'left',
                    fontSize:        '14px',
                    borderRadius:    'var(--radius-md)',
                    backgroundColor: formData.abuseType === value ? '#EEF2FF' : 'var(--color-bg-soft)',
                    border:          formData.abuseType === value
                      ? '2px solid var(--color-primary)'
                      : '2px solid transparent',
                    color:      formData.abuseType === value ? 'var(--color-primary)' : 'var(--color-text-main)',
                    fontWeight: formData.abuseType === value ? '600' : '400',
                    cursor:     'pointer',
                    transition: 'all 0.15s'
                  }}>
                  {label}
                </button>
              ))}
            </div>

            <FieldError message={errors.abuseType} />
            <NavButtons onNext={goNext} onBack={goBack} showBack={false} />
          </Card>
        )}

        {/* ---- STEP 2 — Incident Description ---- */}
        {currentStep === 2 && (
          <Card>
            <StepHeading
              title="Describe what happened"
              subtitle="Share as much or as little as you feel comfortable with. Your words are private."
            />

            <textarea
              value={formData.incidentDescription}
              onChange={e => handleChange('incidentDescription', e.target.value)}
              rows={8}
              placeholder="Describe the incident in your own words..."
              style={{
                width:           '100%',
                padding:         '12px 16px',
                borderRadius:    'var(--radius-md)',
                border:          errors.incidentDescription
                  ? '2px solid var(--color-danger)'
                  : '2px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-soft)',
                color:           'var(--color-text-main)',
                fontSize:        '14px',
                lineHeight:      '1.6',
                resize:          'vertical',
                outline:         'none',
                fontFamily:      'var(--font-family-sans)'
              }}
            />

            <div className="flex justify-between mt-1">
              <FieldError message={errors.incidentDescription} />
              <span className="text-xs ml-auto"
                    style={{ color: 'var(--color-text-muted)' }}>
                {formData.incidentDescription.length} / 5000
              </span>
            </div>

            <NavButtons onNext={goNext} onBack={goBack} />
          </Card>
        )}

        {/* ---- STEP 3 — Urgency + Location ---- */}
        {currentStep === 3 && (
          <Card>
            <StepHeading
              title="How urgent is this situation?"
              subtitle="This helps our team prioritize their response."
            />

            <div className="flex flex-col gap-3 mb-6">
              {[
                { value: 'low',    label: 'Low',    desc: 'Not immediately dangerous but needs attention.' },
                { value: 'medium', label: 'Medium', desc: 'Concerning situation that requires prompt review.' },
                { value: 'high',   label: 'High',   desc: 'Immediate danger or ongoing abuse.' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleChange('urgencyLevel', option.value)}
                  style={{
                    padding:         '16px',
                    textAlign:       'left',
                    borderRadius:    'var(--radius-md)',
                    backgroundColor: formData.urgencyLevel === option.value ? '#EEF2FF' : 'var(--color-bg-soft)',
                    border:          formData.urgencyLevel === option.value
                      ? '2px solid var(--color-primary)'
                      : '2px solid transparent',
                    cursor:     'pointer',
                    transition: 'all 0.15s'
                  }}>
                  <div className="font-semibold text-sm"
                       style={{
                         color: formData.urgencyLevel === option.value
                           ? 'var(--color-primary)'
                           : 'var(--color-text-main)'
                       }}>
                    {option.label}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>

            <FieldError message={errors.urgencyLevel} />

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2"
                     style={{ color: 'var(--color-text-main)' }}>
                Location{' '}
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => handleChange('location', e.target.value)}
                placeholder="City, region, or general area..."
                style={{
                  width:           '100%',
                  padding:         '10px 14px',
                  borderRadius:    'var(--radius-md)',
                  border:          '2px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-soft)',
                  color:           'var(--color-text-main)',
                  fontSize:        '14px',
                  outline:         'none',
                  fontFamily:      'var(--font-family-sans)'
                }}
              />
            </div>

            <NavButtons onNext={goNext} onBack={goBack} />
          </Card>
        )}

        {/* ---- STEP 4 — Contact Preferences ---- */}
        {currentStep === 4 && (
          <Card>
            <StepHeading
              title="How would you like to be contacted?"
              subtitle="You can remain completely anonymous. Contact details are encrypted and only visible to our team."
            />

            <div className="flex flex-col gap-3 mb-6">
              {[
                { value: 'anonymous', label: 'Remain Anonymous', desc: 'We will not contact you. Use your token to check updates.' },
                { value: 'email',     label: 'Email',             desc: 'We may follow up via email if needed.' },
                { value: 'phone',     label: 'Phone',             desc: 'We may follow up via phone or SMS if needed.' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleChange('contactMethod', option.value);
                    handleChange('contactValue', '');
                  }}
                  style={{
                    padding:         '16px',
                    textAlign:       'left',
                    borderRadius:    'var(--radius-md)',
                    backgroundColor: formData.contactMethod === option.value ? '#EEF2FF' : 'var(--color-bg-soft)',
                    border:          formData.contactMethod === option.value
                      ? '2px solid var(--color-primary)'
                      : '2px solid transparent',
                    cursor:     'pointer',
                    transition: 'all 0.15s'
                  }}>
                  <div className="font-semibold text-sm"
                       style={{
                         color: formData.contactMethod === option.value
                           ? 'var(--color-primary)'
                           : 'var(--color-text-main)'
                       }}>
                    {option.label}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>

            {formData.contactMethod !== 'anonymous' && (
              <div>
                <label className="block text-sm font-medium mb-2"
                       style={{ color: 'var(--color-text-main)' }}>
                  {formData.contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input
                  type={formData.contactMethod === 'email' ? 'email' : 'tel'}
                  value={formData.contactValue}
                  onChange={e => handleChange('contactValue', e.target.value)}
                  placeholder={formData.contactMethod === 'email'
                    ? 'your@email.com'
                    : '+237 6XX XXX XXX'}
                  style={{
                    width:           '100%',
                    padding:         '10px 14px',
                    borderRadius:    'var(--radius-md)',
                    border:          errors.contactValue
                      ? '2px solid var(--color-danger)'
                      : '2px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-soft)',
                    color:           'var(--color-text-main)',
                    fontSize:        '14px',
                    outline:         'none',
                    fontFamily:      'var(--font-family-sans)'
                  }}
                />
                <FieldError message={errors.contactValue} />
                <p className="text-xs mt-2 flex items-center gap-1"
                   style={{ color: 'var(--color-text-muted)' }}>
                  <FiShield size={12} style={{ color: 'var(--color-primary)' }} />
                  Your contact detail is encrypted before storage. Only our admin team can read it.
                </p>
              </div>
            )}

            <NavButtons onNext={goNext} onBack={goBack} />
          </Card>
        )}

        {/* ---- STEP 5 — Review & Submit ---- */}
        {currentStep === 5 && (
          <Card>
            <StepHeading
              title="Review your report"
              subtitle="Please confirm the details below before submitting."
            />

             {/* Report summary table */}
            <div style={{
              border:       '1px solid var(--color-border)',
              borderRadius: '12px',
              overflow:     'hidden',
              marginBottom: '20px'
            }}>
              {[
                { label: 'Abuse Type',     value: ABUSE_TYPE_LABELS[formData.abuseType] },
                { label: 'Urgency',        value: formData.urgencyLevel.charAt(0).toUpperCase() + formData.urgencyLevel.slice(1) },
                { label: 'Location',       value: formData.location || 'Not provided' },
                { label: 'Contact Method', value: formData.contactMethod === 'anonymous'
                    ? 'Anonymous'
                    : formData.contactMethod.charAt(0).toUpperCase() + formData.contactMethod.slice(1) }
              ].map((row, index) => (
                <div key={row.label} style={{
                  display:         'flex',
                  justifyContent:  'space-between',
                  alignItems:      'center',
                  padding:         '14px 20px',
                  backgroundColor: index % 2 === 0 ? 'var(--color-bg-soft)' : 'var(--color-white)',
                  borderBottom:    '1px solid var(--color-border)',
                  gap:             '16px',
                  flexWrap:        'wrap'
                }}>
                  <span style={{
                    fontSize:  '13px',
                    color:     'var(--color-text-muted)',
                    fontWeight:'500',
                    flexShrink: 0
                  }}>
                    {row.label}
                  </span>
                  <span style={{
                    fontSize:  '13px',
                    color:     'var(--color-text-main)',
                    fontWeight:'600',
                    textAlign: 'right',
                    wordBreak: 'break-word'
                  }}>
                    {row.value}
                  </span>
                </div>
              ))}

                           {/* Description row */}
              <div style={{
                padding:         '14px 20px',
                backgroundColor: 'var(--color-bg-soft)'
              }}>
                <span style={{
                  display:      'block',
                  fontSize:     '13px',
                  color:        'var(--color-text-muted)',
                  fontWeight:   '500',
                  marginBottom: '6px'
                }}>
                  Description
                </span>
                <span style={{
                  display:    'block',
                  fontSize:   '13px',
                  color:      'var(--color-text-main)',
                  lineHeight: '1.6'
                }}>
                  {formData.incidentDescription.length > 200
                    ? formData.incidentDescription.slice(0, 200) + '...'
                    : formData.incidentDescription}
                </span>
              </div>
            </div>

                       {/* Important notice */}
            <div style={{
              backgroundColor: '#EEF2FF',
              borderRadius:    '10px',
              padding:         '16px 20px',
              marginBottom:    '8px'
            }}>
              <p style={{ fontSize: '13px', color: 'var(--color-primary)', lineHeight: '1.6' }}>
                <strong>Important:</strong> Once submitted, your report cannot be modified.
                You will receive a unique tracking token to follow up on your case.
              </p>
            </div>

            {submitError && (
              <p className="text-sm mb-4 text-center"
                 style={{ color: 'var(--color-danger)' }}>
                {submitError}
              </p>
            )}

            <NavButtons
              onNext={handleSubmit}
              onBack={goBack}
              nextLabel="Submit Report"
              loading={isSubmitting}
            />
          </Card>
        )}

        {/* ---- STEP 6 — Success Screen ---- */}
        {currentStep === 6 && (
          <Card>
            <div style={{ textAlign: 'center' }}>

              {/* Success icon */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{
                  backgroundColor: '#DCFCE7',
                  borderRadius:    '50%',
                  padding:         '16px',
                  display:         'inline-flex'
                }}>
                  <FiCheck size={40} style={{ color: '#16A34A' }} />
                </div>
              </div>

              <h2 style={{
                fontSize:    '24px',
                fontWeight:  '700',
                color:       'var(--color-text-main)',
                marginBottom:'8px'
              }}>
                Report submitted successfully.
              </h2>
              <p style={{
                fontSize:    '14px',
                color:       'var(--color-text-muted)',
                marginBottom:'28px'
              }}>
                Your report has been received. Our team will review it shortly.
              </p>

              {/* Token display box */}
              <div style={{
                backgroundColor: '#EEF2FF',
                border:          '2px solid var(--color-primary)',
                borderRadius:    '14px',
                padding:         '28px 24px',
                marginBottom:    '16px'
              }}>
                <p style={{
                  fontSize:      '11px',
                  fontWeight:    '700',
                  color:         'var(--color-primary)',
                  letterSpacing: '0.1em',
                  marginBottom:  '12px',
                  textTransform: 'uppercase'
                }}>
                  Your Tracking Token
                </p>
                <p style={{
                  fontSize:     '28px',
                  fontWeight:   '700',
                  letterSpacing:'0.12em',
                  fontFamily:   'monospace',
                  color:        'var(--color-text-main)',
                  marginBottom: '20px',
                  wordBreak:    'break-all'
                }}>
                  {trackingToken}
                </p>
                <button
                  onClick={handleCopy}
                   aria-label={copied ? 'Token copied' : 'Copy tracking token'}
                  style={{
                    backgroundColor: copied ? '#16A34A' : 'var(--color-primary)',
                    color:           'var(--color-white)',
                    border:          'none',
                    borderRadius:    '10px',
                    padding:         '11px 24px',
                    fontSize:        '14px',
                    fontWeight:      '600',
                    cursor:          'pointer',
                    display:         'inline-flex',
                    alignItems:      'center',
                    gap:             '8px'
                  }}>
                  {copied
                    ? <><FiCheck size={15} /> Copied!</>
                    : <><FiCopy  size={15} /> Copy Token</>}
                </button>
              </div>

              {/* Warning notice */}
              <div style={{
                backgroundColor: '#FEF9C3',
                border:          '1px solid #FDE047',
                borderRadius:    '12px',
                padding:         '20px 24px',
                marginBottom:    '28px',
                textAlign:       'left'
              }}>
                <p style={{
                  fontWeight:   '700',
                  fontSize:     '14px',
                  color:        '#854D0E',
                  marginBottom: '8px'
                }}>
                  ⚠ Save your token now
                </p>
                <p style={{
                  fontSize:   '13px',
                  color:      '#713F12',
                  lineHeight: '1.6'
                }}>
                  This token is the only way to track your report. We do not store your
                  identity, so we cannot recover it for you. Screenshot it or write it
                  down before leaving this page.
                </p>
              </div>

              {/* Action buttons */}
              <div style={{
                display:        'flex',
                flexDirection:  'column',
                gap:            '12px',
                maxWidth:       '320px',
                margin:         '0 auto'
              }}>
                <a href={`/track?token=${trackingToken}`} style={{ textDecoration: 'none' }}>
                  <button style={{
                    backgroundColor: 'var(--color-primary)',
                    color:           'var(--color-white)',
                    border:          'none',
                    borderRadius:    '10px',
                    padding:         '13px 24px',
                    fontSize:        '14px',
                    fontWeight:      '600',
                    cursor:          'pointer',
                    width:           '100%'
                  }}>
                    Track My Report
                  </button>
                </a>
                <a href="/" style={{ textDecoration: 'none' }}>
                  <button style={{
                    backgroundColor: 'var(--color-bg-soft)',
                    color:           'var(--color-text-muted)',
                    border:          'none',
                    borderRadius:    '10px',
                    padding:         '13px 24px',
                    fontSize:        '14px',
                    fontWeight:      '600',
                    cursor:          'pointer',
                    width:           '100%'
                  }}>
                    Return Home
                  </button>
                </a>
              </div>

            </div>
          </Card>
        )}

      </div>
    </PublicLayout>
  );
};

export default ReportPage;