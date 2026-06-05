import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, LogOut, User as UserIcon, Layout, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <header className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottom: '1px solid var(--border-glass)',
      borderRadius: 0
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          color: 'var(--text-primary)',
          fontSize: '24px',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)'
        }}>
          <div className="flex-center" style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            boxShadow: '0 0 15px var(--primary-glow)'
          }}>
            <BookOpen size={20} color="white" />
          </div>
          <span className="text-gradient">EduStream</span>
        </Link>

        {/* Navigation links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '15px',
            transition: 'var(--transition-fast)'
          }} className="nav-link-hover">
            Explore Courses
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-fast)'
              }} className="nav-link-hover">
                <Layout size={16} />
                My Learning
              </Link>

              {user.role === 'admin' && (
                <Link to="/admin" style={{
                  color: 'var(--secondary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'var(--transition-fast)'
                }} className="nav-link-hover">
                  <ShieldAlert size={16} />
                  Admin Panel
                </Link>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                borderLeft: '1px solid var(--border-glass)',
                paddingLeft: '16px',
                marginLeft: '8px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {user.role}
                  </span>
                </div>

                <div className="flex-center" style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--border-glass)',
                  color: 'var(--text-secondary)'
                }}>
                  <UserIcon size={18} />
                </div>

                <button 
                  onClick={handleLogout}
                  className="btn btn-glass" 
                  style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/login" className="btn btn-glass" style={{ padding: '10px 20px', fontSize: '14px' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>

      <style>{`
        .nav-link-hover:hover {
          color: var(--text-primary) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </header>
  );
};

export default Navbar;
