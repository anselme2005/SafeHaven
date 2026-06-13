// ============================================================
// src/pages/admin/AdminLoginPage.jsx
// Admin login — connects to POST /api/admin/login
// ============================================================

import { useState }      from 'react';
import { useNavigate }   from 'react-router-dom';
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff } from '../../utils/icons';
import { useAuth }       from '../../context/AuthContext';
import api               from '../../services/api';

const AdminLoginPage = () => {
  const { login }    = useAuth();
  const navigate     = useNavigate();

  const [formData, setFormData] = useState({ adminEmail: '', adminPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!formData.adminEmail || !formData.adminPassword) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/admin/login', {
        adminEmail:    formData.adminEmail,
        adminPassword: formData.adminPassword
      });

      // Store JWT and admin data via AuthContext
      login(res.data.admin, res.data.token);
      navigate('/admin/dashboard');

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width:           '100%',
    padding:         '12px 16px 12px 44px',
    borderRadius:    '10px',
    border:          hasError
      ? '2px solid var(--color-danger)'
      : '2px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-soft)',
    color:           'var(--color-text-main)',
    fontSize:        '14px',
    outline:         'none',
    fontFamily:      'var(--font-family-sans)',
    boxSizing:       'border-box'
  });

  return (
    <div style={{
      minHeight:       '100vh',
      backgroundColor: 'var(--color-bg-main)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display:         'inline-flex',
            padding:         '16px',
            borderRadius:    '50%',
            backgroundColor: '#EEF2FF',
            marginBottom:    '16px'
          }}>
            <FiShield size={36} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '6px' }}>
            Admin Login
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            SafeHaven secure admin access
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius:    '16px',
          padding:         '36px 32px',
          boxShadow:       'var(--shadow-card)'
        }}>

          {/* Error message */}
          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border:          '1px solid #FECACA',
              borderRadius:    '8px',
              padding:         '12px 16px',
              marginBottom:    '20px',
              fontSize:        '13px',
              color:           'var(--color-danger)'
            }}>
              {error}
            </div>
          )}

          {/* Email field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display:      'block',
              fontSize:     '13px',
              fontWeight:   '600',
              color:        'var(--color-text-main)',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <FiMail size={16} style={{
                position:  'absolute',
                left:      '14px',
                top:       '50%',
                transform: 'translateY(-50%)',
                color:     'var(--color-text-muted)'
              }} />
              <input
                type="email"
                value={formData.adminEmail}
                onChange={e => handleChange('adminEmail', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="admin@safehaven.com"
                style={inputStyle(!!error)}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display:      'block',
              fontSize:     '13px',
              fontWeight:   '600',
              color:        'var(--color-text-main)',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{
                position:  'absolute',
                left:      '14px',
                top:       '50%',
                transform: 'translateY(-50%)',
                color:     'var(--color-text-muted)'
              }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={formData.adminPassword}
                onChange={e => handleChange('adminPassword', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
                style={{ ...inputStyle(!!error), paddingRight: '44px' }}
              />
              <button
                onClick={() => setShowPass(p => !p)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                style={{
                  position:   'absolute',
                  right:      '14px',
                  top:        '50%',
                  transform:  'translateY(-50%)',
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  color:      'var(--color-text-muted)',
                  padding:    '0',
                  display:    'flex'
                }}>
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width:           '100%',
              padding:         '13px',
              backgroundColor: loading ? 'var(--color-text-muted)' : 'var(--color-primary)',
              color:           'var(--color-white)',
              border:          'none',
              borderRadius:    '10px',
              fontSize:        '15px',
              fontWeight:      '600',
              cursor:          loading ? 'not-allowed' : 'pointer'
            }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </div>

        {/* Security notice */}
        <p style={{
          textAlign:  'center',
          fontSize:   '12px',
          color:      'var(--color-text-muted)',
          marginTop:  '20px',
          lineHeight: '1.6'
        }}>
          This area is restricted to authorized personnel only.
          Unauthorized access attempts are logged.
        </p>

      </div>
    </div>
  );
};

export default AdminLoginPage;