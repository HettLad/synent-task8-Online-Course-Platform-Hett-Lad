import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { User, Mail, Lock, Shield, Calendar, CheckCircle, AlertCircle, Save, KeyRound } from 'lucide-react';

const Profile = () => {
  const { user, token, loadUser } = useContext(AuthContext);

  // States
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    // If password update is attempted, perform basic checks
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setErrorMsg('Please enter your current password to verify identity.');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirm password fields must match.');
        setLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters.');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMsg('Profile updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Refresh AuthContext user state
        await loadUser();
      } else {
        setErrorMsg(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred during profile submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      
      <main className="container" style={{ padding: '40px 24px 80px 24px', animation: 'fadeIn 0.5s ease-out' }}>
        
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
              Account <span className="text-gradient">Profile</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage your personal settings, display name, and password credentials.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '32px', alignItems: 'start' }}>
            
            {/* Left Column: Summary Info Card */}
            <div className="glass" style={{ padding: '30px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div className="flex-center" style={{
                background: user?.role === 'admin' ? 'var(--secondary-glow)' : 'var(--primary-glow)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                margin: '0 auto 20px auto',
                border: `1px solid ${user?.role === 'admin' ? 'var(--secondary)' : 'var(--primary)'}`,
                color: user?.role === 'admin' ? 'var(--secondary)' : 'var(--primary-hover)'
              }}>
                <User size={40} />
              </div>

              <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>{user?.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', wordBreak: 'break-all' }}>{user?.email}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px', textAlign: 'left', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Shield size={16} color="var(--primary-hover)" />
                  <span style={{ fontWeight: 600 }}>Role:</span>
                  <span style={{ textTransform: 'capitalize' }}>{user?.role} Student</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Calendar size={16} color="var(--primary-hover)" />
                  <span style={{ fontWeight: 600 }}>Joined:</span>
                  <span>June 2026</span>
                </div>
              </div>
            </div>

            {/* Right Column: Edit Settings Card */}
            <div className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '22px', marginBottom: '24px', fontFamily: 'var(--font-heading)' }}>Account Details</h3>

              {successMsg && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid var(--success)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: 'var(--success)'
                }}>
                  <CheckCircle size={18} />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--danger)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: 'var(--danger)'
                }}>
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                {/* Name */}
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ paddingLeft: '48px' }}
                      required
                    />
                  </div>
                </div>

                {/* Email (Read Only) */}
                <div className="form-group" style={{ opacity: 0.7 }}>
                  <label className="form-label">Email Address (Cannot be changed)</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email || ''}
                      style={{ paddingLeft: '48px', cursor: 'not-allowed' }}
                      disabled
                    />
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '30px 0' }} />
                
                <h4 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Change Password (Optional)</h4>

                {/* Current Password */}
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <input
                      type="password"
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Required only to update password"
                      style={{ paddingLeft: '48px' }}
                    />
                  </div>
                </div>

                {/* New Password & Confirm Password */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                      <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 chars"
                        style={{ paddingLeft: '48px' }}
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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        style={{ paddingLeft: '48px' }}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>

              </form>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default Profile;
