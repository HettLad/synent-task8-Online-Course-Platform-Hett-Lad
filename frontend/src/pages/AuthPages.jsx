import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Mail, Lock, User, CheckCircle, AlertCircle, KeyRound, ExternalLink } from 'lucide-react';

/* ==========================================================================
   1. LOGIN PAGE
   ========================================================================== */
export const Login = () => {
  const { loginUser, authError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [notVerified, setNotVerified] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setNotVerified(false);
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.message === 'NOT_VERIFIED') {
        setNotVerified(true);
        setErrorMsg('Please verify your email address to log in.');
      } else {
        setErrorMsg(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex-center" style={{ minHeight: 'calc(100vh - 80px)', padding: '40px 20px' }}>
        <div className="glass" style={{ width: '100%', maxWidth: '440px', padding: '40px', borderRadius: 'var(--radius-md)' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }} className="text-gradient">Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '14px', marginBottom: '32px' }}>
            Sign in to continue your learning journey.
          </p>

          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px'
            }}>
              <AlertCircle size={18} color="var(--danger)" />
              <div style={{ flexGrow: 1 }}>
                <span>{errorMsg}</span>
                {notVerified && (
                  <p style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                    Check your spam folder for a verification email or request support.
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '48px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--primary-hover)', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '48px' }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }} disabled={loading}>
              {loading ? <div className="spinner"></div> : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--secondary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   2. REGISTER PAGE
   ========================================================================== */
export const Register = () => {
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await registerUser(name, email, password);
      setSuccessData(data);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex-center" style={{ minHeight: 'calc(100vh - 80px)', padding: '40px 20px' }}>
        <div className="glass" style={{ width: '100%', maxWidth: '460px', padding: '40px', borderRadius: 'var(--radius-md)' }}>
          {successData ? (
            <div style={{ textAlign: 'center' }}>
              <div className="flex-center" style={{
                background: 'rgba(34, 197, 94, 0.1)',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                margin: '0 auto 24px auto',
                border: '1px solid var(--success)'
              }}>
                <CheckCircle size={36} color="var(--success)" />
              </div>
              <h2 style={{ fontSize: '28px', marginBottom: '12px' }} className="text-gradient">Check Your Email</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                A verification link has been sent to <strong>{email}</strong>. Please click the link to verify your account and activate your profile.
              </p>

              {successData.emailPreviewUrl && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '24px',
                  border: '1px solid var(--border-glass)',
                  textAlign: 'left'
                }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Development Email Inbox (Ethereal)</span>
                  <a
                    href={successData.emailPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary-hover)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Click to Open Sent Verification Email <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {/* Dev bypass shortcut */}
              <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '12px', border: '1px dashed var(--border-glass-active)', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Developer Shortcut: Or verify instantly click bypass link below:
                </p>
                <Link to={`/verify-email?token=${successData.verificationTokenDev}`} style={{ fontSize: '12px', color: 'var(--primary-hover)', fontWeight: 600 }}>
                  Verify Email Address Instantly &rarr;
                </Link>
              </div>

              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }} className="text-gradient">Create Account</h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '14px', marginBottom: '32px' }}>
                Sign up to start accessing courses instantly.
              </p>

              {errorMsg && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--danger)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px'
                }}>
                  <AlertCircle size={18} color="var(--danger)" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ paddingLeft: '48px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <input
                      type="email"
                      className="form-control"
                      placeholder="john@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: '48px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: '48px' }}
                      minLength="6"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }} disabled={loading}>
                  {loading ? <div className="spinner"></div> : 'Create Account'}
                </button>
              </form>

              <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 600, textDecoration: 'none' }}>
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. VERIFY EMAIL PAGE
   ========================================================================== */
export const VerifyEmail = () => {
  const { verifyEmailToken } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      triggerVerification();
    } else {
      setLoading(false);
      setErrorMsg('No token provided in the URL.');
    }
  }, [token]);

  const triggerVerification = async () => {
    try {
      await verifyEmailToken(token);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Token verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex-center" style={{ minHeight: 'calc(100vh - 80px)', padding: '40px 20px' }}>
        <div className="glass" style={{ width: '100%', maxWidth: '440px', padding: '40px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          {loading ? (
            <>
              <div className="spinner spinner-lg" style={{ margin: '0 auto 24px auto' }}></div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Verifying Email Address</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Communicating with verification servers...</p>
            </>
          ) : success ? (
            <>
              <div className="flex-center" style={{
                background: 'rgba(34, 197, 94, 0.1)',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                margin: '0 auto 24px auto',
                border: '1px solid var(--success)'
              }}>
                <CheckCircle size={36} color="var(--success)" />
              </div>
              <h2 style={{ fontSize: '28px', marginBottom: '12px' }} className="text-gradient">Email Verified</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px' }}>
                Your email address was successfully verified! You can now access all features.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Proceed to Login
              </Link>
            </>
          ) : (
            <>
              <div className="flex-center" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                margin: '0 auto 24px auto',
                border: '1px solid var(--danger)'
              }}>
                <AlertCircle size={36} color="var(--danger)" />
              </div>
              <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>Verification Failed</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
                {errorMsg || 'The verification link is invalid, broken, or has expired.'}
              </p>
              <Link to="/login" className="btn btn-glass" style={{ width: '100%' }}>
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   4. FORGOT PASSWORD PAGE
   ========================================================================== */
export const ForgotPassword = () => {
  const { requestForgotPassword } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await requestForgotPassword(email);
      setSuccessData(data);
    } catch (err) {
      setErrorMsg(err.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex-center" style={{ minHeight: 'calc(100vh - 80px)', padding: '40px 20px' }}>
        <div className="glass" style={{ width: '100%', maxWidth: '440px', padding: '40px', borderRadius: 'var(--radius-md)' }}>
          {successData ? (
            <div style={{ textAlign: 'center' }}>
              <div className="flex-center" style={{
                background: 'rgba(34, 197, 94, 0.1)',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                margin: '0 auto 24px auto',
                border: '1px solid var(--success)'
              }}>
                <CheckCircle size={36} color="var(--success)" />
              </div>
              <h2 style={{ fontSize: '28px', marginBottom: '12px' }} className="text-gradient">Reset Link Sent</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                A password reset link has been dispatched to <strong>{email}</strong>. This link is active for 10 minutes.
              </p>

              {successData.emailPreviewUrl && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '24px',
                  border: '1px solid var(--border-glass)',
                  textAlign: 'left'
                }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Development Email Inbox (Ethereal)</span>
                  <a
                    href={successData.emailPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary-hover)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Open Sent Password Reset Email <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {/* Dev bypass shortcut */}
              <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '12px', border: '1px dashed var(--border-glass-active)', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Developer Shortcut: Reset password instantly click bypass link:
                </p>
                <Link to={`/reset-password?token=${successData.resetTokenDev}`} style={{ fontSize: '12px', color: 'var(--primary-hover)', fontWeight: 600 }}>
                  Reset Password Page &rarr;
                </Link>
              </div>

              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '30px', marginBottom: '8px', textAlign: 'center' }} className="text-gradient">Reset Password</h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '14px', marginBottom: '32px' }}>
                Enter your registered email address to receive recovery instructions.
              </p>

              {errorMsg && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--danger)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px'
                }}>
                  <AlertCircle size={18} color="var(--danger)" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: '48px' }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }} disabled={loading}>
                  {loading ? <div className="spinner"></div> : 'Send Reset Link'}
                </button>
              </form>

              <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
                <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  &larr; Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   5. RESET PASSWORD ACTION PAGE
   ========================================================================== */
export const ResetPassword = () => {
  const { submitResetPassword } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!token) {
      setErrorMsg('No token found in parameters.');
      return;
    }

    setLoading(true);

    try {
      await submitResetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex-center" style={{ minHeight: 'calc(100vh - 80px)', padding: '40px 20px' }}>
        <div className="glass" style={{ width: '100%', maxWidth: '440px', padding: '40px', borderRadius: 'var(--radius-md)' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div className="flex-center" style={{
                background: 'rgba(34, 197, 94, 0.1)',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                margin: '0 auto 24px auto',
                border: '1px solid var(--success)'
              }}>
                <CheckCircle size={36} color="var(--success)" />
              </div>
              <h2 style={{ fontSize: '28px', marginBottom: '12px' }} className="text-gradient">Password Updated</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px' }}>
                Your password has been successfully reset. You can now use your new credentials to log in.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '30px', marginBottom: '8px', textAlign: 'center' }} className="text-gradient">Set New Password</h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '14px', marginBottom: '32px' }}>
                Create a strong password of at least 6 characters.
              </p>

              {errorMsg && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--danger)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px'
                }}>
                  <AlertCircle size={18} color="var(--danger)" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: '48px' }}
                      minLength="6"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ paddingLeft: '48px' }}
                      minLength="6"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }} disabled={loading}>
                  {loading ? <div className="spinner"></div> : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
