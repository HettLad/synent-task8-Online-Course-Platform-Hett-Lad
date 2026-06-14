import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { 
  BarChart3, BookOpen, Users, CreditCard, Plus, Trash2, Edit2, 
  ChevronRight, Calendar, Mail, FileVideo, Clock, Layers, Award 
} from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);

  // States
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalCourses: 0, totalUsers: 0, totalEnrollments: 0, totalRevenue: 0 });
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [enrollmentsList, setEnrollmentsList] = useState([]);
  
  // Loading States
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

  // Forms / Modals States
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ id: null, title: '', description: '', price: 0, category: 'Development', thumbnail: '', instructor: '' });
  const [submittingCourse, setSubmittingCourse] = useState(false);

  // Syllabus States
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [lessonForm, setLessonForm] = useState({ title: '', videoUrl: '', duration: '10:00', content: '' });

  // Unenrollment States
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [selectedUserForUnenroll, setSelectedUserForUnenroll] = useState(null);
  const [revokingCourseId, setRevokingCourseId] = useState('');

  // Load Admin Data on startup
  useEffect(() => {
    fetchStats();
    fetchCourses();
    fetchUsers();
    fetchEnrollments();
  }, []);

  // Sync selected course details in Syllabus Builder
  useEffect(() => {
    if (selectedCourseId) {
      const found = courses.find(c => c._id === selectedCourseId);
      setSelectedCourse(found || null);
    } else {
      setSelectedCourse(null);
    }
  }, [selectedCourseId, courses]);

  // Fetch Requests
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentEnrollments(data.recentEnrollments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch('http://localhost:5000/api/courses');
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
        if (data.courses.length > 0 && !selectedCourseId) {
          setSelectedCourseId(data.courses[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/admin/enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEnrollmentsList(data.enrollments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Unenroll/Revoke course logic
  const handleRevokeCourseAccess = async (userId, courseId) => {
    if (!window.confirm('Are you sure you want to revoke this user\'s access to this course? They will lose all progress.')) return;
    setRevokingCourseId(courseId);
    try {
      const res = await fetch(`http://localhost:5000/api/users/admin/users/${userId}/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Refresh local lists
        fetchUsers();
        fetchEnrollments();
        fetchStats();

        // Update selectedUserForUnenroll list to update local modal state dynamically
        const updatedEnrollments = selectedUserForUnenroll.enrolledCourses.filter(ec => {
          const cid = ec.course?._id || ec.course;
          return cid !== courseId;
        });

        setSelectedUserForUnenroll({
          ...selectedUserForUnenroll,
          enrolledCourses: updatedEnrollments
        });
      } else {
        alert(data.error || 'Failed to revoke course access');
      }
    } catch (err) {
      console.error(err);
      alert('Error revoking course access');
    } finally {
      setRevokingCourseId('');
    }
  };

  // Course Management Logic
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setSubmittingCourse(true);

    const isEdit = !!courseForm.id;
    const url = isEdit 
      ? `http://localhost:5000/api/courses/${courseForm.id}` 
      : 'http://localhost:5000/api/courses';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(courseForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowCourseModal(false);
        setCourseForm({ id: null, title: '', description: '', price: 0, category: 'Development', thumbnail: '', instructor: '' });
        fetchCourses();
        fetchStats();
      } else {
        alert(data.error || 'Failed to submit course');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting course data');
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action is permanent.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchCourses();
        fetchStats();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditCourse = (course) => {
    setCourseForm({
      id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      category: course.category,
      thumbnail: course.thumbnail,
      instructor: course.instructor
    });
    setShowCourseModal(true);
  };

  // Module / Lesson Syllabus Management Logic
  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${selectedCourseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: moduleTitle })
      });
      const data = await res.json();
      if (data.success) {
        setModuleTitle('');
        setShowModuleModal(false);
        fetchCourses(); // refresh local cache
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim() || !lessonForm.videoUrl.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${selectedCourseId}/modules/${selectedModuleId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(lessonForm)
      });
      const data = await res.json();
      if (data.success) {
        setLessonForm({ title: '', videoUrl: '', duration: '10:00', content: '' });
        setShowLessonModal(false);
        fetchCourses(); // refresh local cache
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ padding: '40px 24px 80px 24px', flexGrow: 1, animation: 'fadeIn 0.5s ease-out' }}>
        
        {/* Header Title */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
            Instructor <span className="text-gradient">Console</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Configure curriculums, organize course pages, trace transaction audits, and check user directory analytics.
          </p>
        </div>

        {/* Console Navigation Tabs */}
        <div className="glass" style={{
          display: 'flex',
          gap: '8px',
          padding: '8px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '40px',
          background: 'rgba(0,0,0,0.3)',
          overflowX: 'auto'
        }}>
          {[
            { id: 'overview', label: 'Stats & Overview', icon: BarChart3 },
            { id: 'courses', label: 'Manage Courses', icon: BookOpen },
            { id: 'syllabus', label: 'Syllabus Builder', icon: Layers },
            { id: 'users', label: 'Registered Users', icon: Users },
            { id: 'enrollments', label: 'Enrollments Log', icon: CreditCard }
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-glass'}`}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <IconComp size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* -------------------- TAB CONTENT 1: STATS & OVERVIEW -------------------- */}
        {activeTab === 'overview' && (
          <div>
            {loadingStats ? (
              <div className="flex-center" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
            ) : (
              <>
                {/* Stats cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                  <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="flex-center" style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Total Programs</span>
                      <span style={{ fontSize: '28px', fontWeight: 800 }}>{stats.totalCourses}</span>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="flex-center" style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--secondary)' }}>
                      <Users size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Active Students</span>
                      <span style={{ fontSize: '28px', fontWeight: 800 }}>{stats.totalUsers}</span>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="flex-center" style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Paid Enrollments</span>
                      <span style={{ fontSize: '28px', fontWeight: 800 }}>{stats.totalEnrollments}</span>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="flex-center" style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.1)', color: 'var(--warning)' }}>
                      <span style={{ fontSize: '20px', fontWeight: 'bold' }}>₹</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Gross Revenue</span>
                      <span style={{ fontSize: '28px', fontWeight: 800 }}>₹{stats.totalRevenue}</span>
                    </div>
                  </div>
                </div>

                {/* Recent enrollments */}
                <h3 style={{ fontSize: '20px', marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>Recent Enrollments</h3>
                {recentEnrollments.length === 0 ? (
                  <div className="glass flex-center" style={{ minHeight: '150px', color: 'var(--text-muted)' }}>
                    No recent enrollment logs found.
                  </div>
                ) : (
                  <div className="glass" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-glass)' }}>
                          <th style={{ padding: '16px' }}>Student</th>
                          <th style={{ padding: '16px' }}>Course</th>
                          <th style={{ padding: '16px' }}>Amount</th>
                          <th style={{ padding: '16px' }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentEnrollments.map((en, idx) => (
                          <tr key={en._id} style={{ borderBottom: idx !== recentEnrollments.length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
                            <td style={{ padding: '16px' }}>
                              <div>
                                <span style={{ fontWeight: 600, display: 'block' }}>{en.user?.name}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{en.user?.email}</span>
                              </div>
                            </td>
                            <td style={{ padding: '16px', fontWeight: 500 }}>{en.course?.title}</td>
                            <td style={{ padding: '16px', fontWeight: 600 }}>₹{en.course?.price || 0}</td>
                            <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                              {new Date(en.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* -------------------- TAB CONTENT 2: MANAGE COURSES -------------------- */}
        {activeTab === 'courses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)' }}>Course Catalog Settings</h3>
              <button 
                onClick={() => {
                  setCourseForm({ id: null, title: '', description: '', price: 0, category: 'Development', thumbnail: '', instructor: '' });
                  setShowCourseModal(true);
                }} 
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Add Course
              </button>
            </div>

            {loadingCourses ? (
              <div className="flex-center" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
            ) : courses.length === 0 ? (
              <div className="glass flex-center" style={{ minHeight: '200px', flexDirection: 'column', padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Your course library is empty.</p>
                <button className="btn btn-primary" onClick={() => setShowCourseModal(true)}>Create First Course</button>
              </div>
            ) : (
              <div className="glass" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-glass)' }}>
                      <th style={{ padding: '16px' }}>Thumbnail & Course Info</th>
                      <th style={{ padding: '16px' }}>Category</th>
                      <th style={{ padding: '16px' }}>Price</th>
                      <th style={{ padding: '16px' }}>Instructor</th>
                      <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course, idx) => (
                      <tr key={course._id} style={{ borderBottom: idx !== courses.length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                            <div>
                              <span style={{ fontWeight: 600, display: 'block', fontSize: '15px' }}>{course.title}</span>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{course.modules?.length || 0} Modules</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}><span className="badge badge-primary">{course.category}</span></td>
                        <td style={{ padding: '16px', fontWeight: 600 }}>₹{course.price}</td>
                        <td style={{ padding: '16px' }}>{course.instructor}</td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => openEditCourse(course)} className="btn btn-glass" style={{ padding: '8px 12px' }}>
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteCourse(course._id)} className="btn btn-danger" style={{ padding: '8px 12px' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* -------------------- TAB CONTENT 3: SYLLABUS BUILDER -------------------- */}
        {activeTab === 'syllabus' && (
          <div>
            {/* Course Selector Dropdown */}
            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-sm)', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
              <div style={{ flexGrow: 1, minWidth: '250px' }}>
                <label className="form-label">Select Course to Modify</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="form-control"
                  style={{ background: 'var(--bg-dark)' }}
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {selectedCourse && (
                <button
                  onClick={() => setShowModuleModal(true)}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-end', height: '48px' }}
                >
                  <Plus size={16} /> Add Module
                </button>
              )}
            </div>

            {selectedCourse ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)' }}>
                    Curriculum ({selectedCourse.modules?.length || 0} Modules)
                  </h3>
                </div>

                {selectedCourse.modules && selectedCourse.modules.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {selectedCourse.modules.map((mod) => (
                      <div key={mod._id} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-sm)' }}>
                        
                        {/* Module Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                          <h4 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={18} color="var(--primary)" /> {mod.title}
                          </h4>
                          <button
                            onClick={() => {
                              setSelectedModuleId(mod._id);
                              setShowLessonModal(true);
                            }}
                            className="btn btn-glass"
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Plus size={14} /> Add Lesson
                          </button>
                        </div>

                        {/* Lesson List */}
                        {mod.lessons && mod.lessons.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {mod.lessons.map((lesson) => (
                              <div key={lesson._id} className="flex-center" style={{
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.03)',
                                borderRadius: '6px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <FileVideo size={16} color="var(--text-muted)" />
                                  <div>
                                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{lesson.title}</span>
                                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                                      URL: {lesson.videoUrl}
                                    </span>
                                  </div>
                                </div>
                                
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={12} /> {lesson.duration}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No lessons in this module. Click "Add Lesson" to expand this module.</p>
                        )}

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass flex-center" style={{ minHeight: '150px', flexDirection: 'column', padding: '30px' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Syllabus is empty for this course.</p>
                    <button className="btn btn-primary" onClick={() => setShowModuleModal(true)}>Add Your First Module</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass flex-center" style={{ minHeight: '200px', color: 'var(--text-muted)' }}>
                Please select a course above to manage its modules and lessons.
              </div>
            )}
          </div>
        )}

        {/* -------------------- TAB CONTENT 4: REGISTERED USERS -------------------- */}
        {activeTab === 'users' && (
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>Users Directory ({usersList.filter(u => u.role !== 'admin').length})</h3>
            {loadingUsers ? (
              <div className="flex-center" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
            ) : usersList.filter(u => u.role !== 'admin').length === 0 ? (
              <div className="glass flex-center" style={{ minHeight: '150px' }}>No student accounts found.</div>
            ) : (
              <div className="glass" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-glass)' }}>
                      <th style={{ padding: '16px' }}>Name</th>
                      <th style={{ padding: '16px' }}>Email</th>
                      <th style={{ padding: '16px' }}>System Role</th>
                      <th style={{ padding: '16px' }}>Verification status</th>
                      <th style={{ padding: '16px' }}>Registered At</th>
                      <th style={{ padding: '16px', textAlign: 'center' }}>Revoke Courses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.filter(u => u.role !== 'admin').map((user, idx) => (
                      <tr key={user._id} style={{ borderBottom: idx !== usersList.filter(u => u.role !== 'admin').length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
                        <td style={{ padding: '16px', fontWeight: 600 }}>{user.name}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} color="var(--text-muted)" /> {user.email}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span className={user.isVerified ? 'badge badge-success' : 'badge badge-warning'}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {new Date(user.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setSelectedUserForUnenroll(user);
                              setShowUnenrollModal(true);
                            }}
                            className="btn btn-glass"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Courses ({user.enrolledCourses?.length || 0})
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* -------------------- TAB CONTENT 5: ENROLLMENTS LOG -------------------- */}
        {activeTab === 'enrollments' && (
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>Audit Logs ({enrollmentsList.length} Entries)</h3>
            {loadingEnrollments ? (
              <div className="flex-center" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
            ) : enrollmentsList.length === 0 ? (
              <div className="glass flex-center" style={{ minHeight: '150px' }}>No payment histories found.</div>
            ) : (
              <div className="glass" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-glass)' }}>
                      <th style={{ padding: '16px' }}>Student</th>
                      <th style={{ padding: '16px' }}>Course Title</th>
                      <th style={{ padding: '16px' }}>Price paid</th>
                      <th style={{ padding: '16px' }}>Razorpay Order ID</th>
                      <th style={{ padding: '16px' }}>Transaction status</th>
                      <th style={{ padding: '16px' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollmentsList.map((en, idx) => (
                      <tr key={en._id} style={{ borderBottom: idx !== enrollmentsList.length - 1 ? '1px solid var(--border-glass)' : 'none', height: '54px' }}>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          <span style={{ fontWeight: 600 }} title={en.user?.email || 'N/A'}>{en.user?.name || 'Deleted User'}</span>
                        </td>
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                          <div style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }} title={en.course?.title || 'Deleted Course'}>
                            {en.course?.title || 'Deleted Course'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>₹{en.amount}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          {en.razorpayOrderId}
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          <span className={
                            en.status === 'completed' ? 'badge badge-success' : 
                            en.status === 'pending' ? 'badge badge-warning' : 'badge badge-danger'
                          }>
                            {en.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          {new Date(en.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ==================== CREATE / EDIT COURSE MODAL ==================== */}
      {showCourseModal && (
        <div className="modal-overlay" onClick={() => setShowCourseModal(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCourseModal(false)}>&times;</button>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
              {courseForm.id ? 'Modify Course Profile' : 'Publish New Course'}
            </h2>
            
            <form onSubmit={handleCourseSubmit}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Master Advanced Python"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  rows="4"
                  placeholder="Summarize course goals and outcomes..."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Price (INR)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    style={{ background: 'var(--bg-dark)' }}
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Thumbnail Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={courseForm.thumbnail}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Instructor Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={courseForm.instructor}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  placeholder="Admin Instructor"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }} disabled={submittingCourse}>
                  {submittingCourse ? <div className="spinner"></div> : (courseForm.id ? 'Save Changes' : 'Create Course')}
                </button>
                <button type="button" onClick={() => setShowCourseModal(false)} className="btn btn-glass">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADD MODULE MODAL ==================== */}
      {showModuleModal && (
        <div className="modal-overlay" onClick={() => setShowModuleModal(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <button className="modal-close" onClick={() => setShowModuleModal(false)}>&times;</button>
            <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Create Syllabus Module</h2>
            
            <form onSubmit={handleAddModule}>
              <div className="form-group">
                <label className="form-label">Module Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g. Module 1: Getting Started"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                  Add Module
                </button>
                <button type="button" onClick={() => setShowModuleModal(false)} className="btn btn-glass">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADD LESSON MODAL ==================== */}
      {showLessonModal && (
        <div className="modal-overlay" onClick={() => setShowLessonModal(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLessonModal(false)}>&times;</button>
            <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Append Lesson to Module</h2>
            
            <form onSubmit={handleAddLesson}>
              <div className="form-group">
                <label className="form-label">Lesson Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="e.g. 1.1 Intro to Variables"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Video Embed URL (YouTube or MP4)</label>
                  <input
                    type="url"
                    className="form-control"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (MM:SS)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    placeholder="12:30"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Lesson Content / Notes (Markdown or Text)</label>
                <textarea
                  className="form-control"
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  rows="5"
                  placeholder="Provide reference notes, sample code, or lesson tasks here..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                  Create Lesson
                </button>
                <button type="button" onClick={() => setShowLessonModal(false)} className="btn btn-glass">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MANAGE STUDENT ENROLLMENTS (REVOKE) MODAL ==================== */}
      {showUnenrollModal && selectedUserForUnenroll && (
        <div className="modal-overlay" onClick={() => { setShowUnenrollModal(false); setSelectedUserForUnenroll(null); }}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button className="modal-close" onClick={() => { setShowUnenrollModal(false); setSelectedUserForUnenroll(null); }}>&times;</button>
            <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Manage Course Access</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
              Student: <strong>{selectedUserForUnenroll.name}</strong> ({selectedUserForUnenroll.email})
            </p>

            <h4 style={{ fontSize: '15px', marginBottom: '12px', color: 'white' }}>Enrolled Courses</h4>
            {selectedUserForUnenroll.enrolledCourses && selectedUserForUnenroll.enrolledCourses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedUserForUnenroll.enrolledCourses.map((ec) => {
                  const courseObj = ec.course;
                  const courseId = courseObj?._id || courseObj;
                  const courseTitle = courseObj?.title || 'Unknown Course';
                  
                  return (
                    <div key={courseId} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={courseTitle}>
                        {courseTitle}
                      </span>
                      
                      <button
                        onClick={() => handleRevokeCourseAccess(selectedUserForUnenroll._id, courseId)}
                        disabled={revokingCourseId === courseId}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '4px' }}
                      >
                        {revokingCourseId === courseId ? (
                          <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></div>
                        ) : (
                          'Revoke Access'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No active course enrollments found for this student.
              </div>
            )}

            <button
              onClick={() => { setShowUnenrollModal(false); setSelectedUserForUnenroll(null); }}
              className="btn btn-glass"
              style={{ width: '100%', marginTop: '24px' }}
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
