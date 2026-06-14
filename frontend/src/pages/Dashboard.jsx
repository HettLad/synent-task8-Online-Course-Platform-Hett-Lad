import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { BookOpen, GraduationCap, Trophy, Play, CheckCircle, Search, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/enrolled', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEnrolledCourses(data.enrolledCourses);
      }
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const getStats = () => {
    const validCourses = enrolledCourses.filter(ec => ec.course);
    const total = validCourses.length;
    let completed = 0;
    let inProgress = 0;

    validCourses.forEach(ec => {
      const totalLessons = ec.course?.modules?.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0) || 0;
      const completedCount = ec.progress?.length || 0;
      
      if (totalLessons > 0 && completedCount === totalLessons) {
        completed++;
      } else {
        inProgress++;
      }
    });

    return { total, completed, inProgress };
  };

  const calculateProgress = (ec) => {
    if (!ec.course) return 0;
    const totalLessons = ec.course?.modules?.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0) || 0;
    if (totalLessons === 0) return 0;
    const completedCount = ec.progress?.length || 0;
    return Math.round((completedCount / totalLessons) * 100);
  };

  const filteredCourses = enrolledCourses
    .filter(ec => ec.course)
    .filter(ec => 
      ec.course.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = getStats();

  return (
    <div>
      <Navbar />

      <main className="container" style={{ padding: '40px 24px 80px 24px', animation: 'fadeIn 0.5s ease-out' }}>
        {/* Welcome Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
              My <span className="text-gradient">Learning Space</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Welcome back, {user?.name}! Trace your progression, resume courses, and expand your skills.
            </p>
          </div>
          
          <div className="glass" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            width: '300px'
          }}>
            <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search my courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                outline: 'none',
                width: '100%',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="flex-center" style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Enrolled Courses</span>
              <span style={{ fontSize: '28px', fontWeight: 800 }}>{stats.total}</span>
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="flex-center" style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--secondary)' }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>In Progress</span>
              <span style={{ fontSize: '28px', fontWeight: 800 }}>{stats.inProgress}</span>
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="flex-center" style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
              <Trophy size={24} />
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Completed</span>
              <span style={{ fontSize: '28px', fontWeight: 800 }}>{stats.completed}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {loading ? (
          <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
            <div className="spinner spinner-lg"></div>
            <p style={{ color: 'var(--text-muted)' }}>Retrieving your workspace...</p>
          </div>
        ) : enrolledCourses.filter(ec => ec.course).length === 0 ? (
          <div className="glass flex-center" style={{
            minHeight: '300px',
            borderRadius: 'var(--radius-md)',
            flexDirection: 'column',
            padding: '50px',
            textAlign: 'center',
            border: '1px dashed var(--border-glass-active)'
          }}>
            <Sparkles size={48} color="var(--primary-hover)" style={{ marginBottom: '16px', animation: 'spin 6s linear infinite' }} />
            <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>Your dashboard is empty</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '24px', fontSize: '14px' }}>
              You haven't enrolled in any courses yet. Check out our catalog of expert programs to start learning!
            </p>
            <Link to="/" className="btn btn-primary">Browse Course Catalog</Link>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="glass flex-center" style={{ minHeight: '200px', borderRadius: 'var(--radius-md)', padding: '40px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No enrolled courses match your search term.</p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '22px', marginBottom: '24px', fontFamily: 'var(--font-heading)' }}>My Course Enrollment</h2>
            
            <div className="grid-2">
              {filteredCourses.map(ec => {
                const prog = calculateProgress(ec);
                const isFinished = prog === 100;
                
                return (
                  <div key={ec._id} className="glass" style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: isFinished ? '1px solid var(--success)' : '1px solid var(--border-glass)',
                    transition: 'var(--transition-smooth)'
                  }}>
                    
                    {/* Upper half card */}
                    <div style={{ display: 'flex', padding: '24px', gap: '20px' }}>
                      <img
                        src={ec.course?.thumbnail}
                        alt={ec.course?.title}
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      />
                      
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '10px' }}>{ec.course?.category}</span>
                          {isFinished && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>
                              <CheckCircle size={14} /> Completed
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '16px', marginBottom: '4px', lineHeight: 1.4 }}>
                          {ec.course?.title}
                        </h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          By {ec.course?.instructor}
                        </span>
                      </div>
                    </div>

                    {/* Progress tracking & play section */}
                    <div style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '20px 24px',
                      borderTop: '1px solid var(--border-glass)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '30px'
                    }}>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          <span>Course Progress</span>
                          <span style={{ fontWeight: 600 }}>{prog}% ({ec.progress?.length || 0} / {ec.course?.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0} lessons)</span>
                        </div>
                        
                        {/* Progress Bar Container */}
                        <div style={{ background: 'var(--bg-dark)', height: '6px', borderRadius: '3px', width: '100%', overflow: 'hidden' }}>
                          <div style={{
                            background: isFinished ? 'var(--success)' : 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                            height: '100%',
                            width: `${prog}%`,
                            borderRadius: '3px',
                            transition: 'width 0.5s ease-out'
                          }} />
                        </div>
                      </div>

                      <Link to={`/course-player/${ec.course?._id}`} className={`btn ${isFinished ? 'btn-glass' : 'btn-primary'}`} style={{
                        padding: '10px 20px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Play size={12} fill={isFinished ? 'none' : 'currentColor'} />
                        {prog === 0 ? 'Start' : 'Resume'}
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
