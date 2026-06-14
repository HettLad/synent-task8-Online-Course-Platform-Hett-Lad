import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { PlayCircle, CheckCircle, ChevronDown, ChevronUp, FileText, ArrowLeft, CheckSquare, Square } from 'lucide-react';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const { token } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [progressSaving, setProgressSaving] = useState(false);

  useEffect(() => {
    fetchCourseDetailsAndProgress();
  }, [courseId]);

  const fetchCourseDetailsAndProgress = async () => {
    setLoading(true);
    try {
      // 1. Fetch Course details
      const courseRes = await fetch(`http://localhost:5000/api/courses/${courseId}`);
      const courseData = await courseRes.json();
      
      // 2. Fetch User progress details (via enrolled courses)
      const userRes = await fetch('http://localhost:5000/api/users/enrolled', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();

      if (courseData.success && userData.success) {
        setCourse(courseData.course);
        
        // Find progress array for this specific course
        const activeEnrollment = userData.enrolledCourses.find(
          (ec) => {
            const cid = ec.course?._id || ec.course;
            return cid === courseId;
          }
        );

        if (activeEnrollment) {
          // Extract list of lessonIds marked complete
          const completedIds = activeEnrollment.progress.map((p) => p.lessonId);
          setCompletedLessons(completedIds);
        }

        // Set default active lesson to first lesson of first module
        if (courseData.course.modules && courseData.course.modules.length > 0) {
          const firstModule = courseData.course.modules[0];
          if (firstModule.lessons && firstModule.lessons.length > 0) {
            setSelectedLesson(firstModule.lessons[0]);
            setActiveModuleIdx(0);
          }
        }
      }
    } catch (err) {
      console.error('Error loading course player details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProgress = async (lessonId, currentStatus) => {
    if (progressSaving) return;
    setProgressSaving(true);
    
    // Optimistic state update
    const updatedCompleted = currentStatus 
      ? completedLessons.filter(id => id !== lessonId) 
      : [...completedLessons, lessonId];
    
    setCompletedLessons(updatedCompleted);

    try {
      const res = await fetch('http://localhost:5000/api/users/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          lessonId,
          isCompleted: !currentStatus // Toggle to opposite of current status
        })
      });
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setCompletedLessons(completedLessons);
      }
    } catch (err) {
      console.error(err);
      // Revert on error
      setCompletedLessons(completedLessons);
    } finally {
      setProgressSaving(false);
    }
  };

  // Calculations
  const totalLessons = course?.modules?.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0) || 0;
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons.length / totalLessons) * 100);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex-center" style={{ minHeight: 'calc(100vh - 80px)', flexDirection: 'column', gap: '16px' }}>
          <div className="spinner spinner-lg"></div>
          <p style={{ color: 'var(--text-muted)' }}>Preparing lesson workspace...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px' }}>Course Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>We couldn't retrieve details for this course ID.</p>
          <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Subheader Toolbar */}
      <div className="glass" style={{
        padding: '12px 24px',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0, 0, 0, 0.4)'
      }}>
        <Link to="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600
        }} className="back-link">
          <ArrowLeft size={16} /> Back to My Learning
        </Link>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>{course.title}</span>
        <span className="badge badge-primary">{progressPercent}% Completed</span>
      </div>

      {/* Main Player Columns */}
      <div style={{
        flexGrow: 1,
        display: 'flex',
        flexWrap: 'wrap',
        height: 'calc(100vh - 125px)', // Toolbar (45px) + Navbar (80px)
        overflow: 'hidden'
      }}>
        
        {/* Left Side: Video & Text description */}
        <div style={{
          flex: '1 1 60%',
          padding: '24px',
          overflowY: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {selectedLesson ? (
            <>
              {/* Responsive Video Container */}
              <div style={{
                position: 'relative',
                paddingBottom: '56.25%', /* 16:9 Aspect Ratio */
                height: 0,
                overflow: 'hidden',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-glass)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                background: 'black'
              }}>
                <iframe
                  title={selectedLesson.title}
                  src={selectedLesson.videoUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}
                ></iframe>
              </div>

              {/* Lesson Text Header & Info */}
              <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Active Lesson</span>
                    <h2 style={{ fontSize: '22px' }}>{selectedLesson.title}</h2>
                  </div>

                  <button
                    onClick={() => handleToggleProgress(selectedLesson._id, completedLessons.includes(selectedLesson._id))}
                    className={`btn ${completedLessons.includes(selectedLesson._id) ? 'btn-glass' : 'btn-primary'}`}
                    style={{ padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {completedLessons.includes(selectedLesson._id) ? (
                      <>
                        <CheckCircle size={16} color="var(--success)" /> Completed
                      </>
                    ) : (
                      'Mark Completed'
                    )}
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <FileText size={16} /> Lesson Content & Notes
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {selectedLesson.content || 'No text instructions or code snippets added for this lesson.'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-center" style={{ flexGrow: 1, flexDirection: 'column', color: 'var(--text-muted)' }}>
              <PlayCircle size={48} style={{ marginBottom: '12px' }} />
              <p>Select a lesson from the syllabus side panel to begin learning.</p>
            </div>
          )}
        </div>

        {/* Right Side: Modules Syllabus Panel */}
        <div className="glass" style={{
          flex: '1 1 30%',
          minWidth: '320px',
          borderTop: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          borderLeft: '1px solid var(--border-glass)',
          background: 'hsla(224, 71%, 4%, 0.9)',
          height: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Progress Summary header */}
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Course Syllabus</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Completed lessons:</span>
              <span>{completedLessons.length} / {totalLessons}</span>
            </div>

            <div style={{ background: 'var(--bg-darker)', height: '6px', borderRadius: '3px', width: '100%', overflow: 'hidden' }}>
              <div style={{
                background: progressPercent === 100 ? 'var(--success)' : 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                height: '100%',
                width: `${progressPercent}%`,
                borderRadius: '3px',
                transition: 'width 0.4s ease-out'
              }} />
            </div>
          </div>

          {/* Module list Accordion */}
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px' }}>
            {course.modules && course.modules.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {course.modules.map((mod, modIdx) => {
                  const isExpanded = activeModuleIdx === modIdx;
                  return (
                    <div key={mod._id} style={{
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-glass)',
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.01)'
                    }}>
                      {/* Module title header */}
                      <div
                        onClick={() => setActiveModuleIdx(isExpanded ? null : modIdx)}
                        style={{
                          padding: '14px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          background: isExpanded ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'white', maxWidth: '80%' }}>
                          {mod.title}
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>

                      {/* Lessons checklist */}
                      {isExpanded && (
                        <div style={{
                          borderTop: '1px solid var(--border-glass)',
                          padding: '8px 0',
                          background: 'rgba(0, 0, 0, 0.2)'
                        }}>
                          {mod.lessons && mod.lessons.length > 0 ? (
                            mod.lessons.map((lesson) => {
                              const isComplete = completedLessons.includes(lesson._id);
                              const isActive = selectedLesson?._id === lesson._id;
                              
                              return (
                                <div
                                  key={lesson._id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 16px',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    background: isActive ? 'hsla(var(--hue), 85%, 60%, 0.1)' : 'transparent',
                                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                    transition: 'var(--transition-fast)'
                                  }}
                                  onClick={() => setSelectedLesson(lesson)}
                                >
                                  {/* Checkbox Icon */}
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation(); // Don't trigger lesson select on click checkbox
                                      handleToggleProgress(lesson._id, isComplete);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      color: isComplete ? 'var(--success)' : 'var(--text-muted)',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {isComplete ? (
                                      <CheckSquare size={18} fill="rgba(34,197,94,0.1)" />
                                    ) : (
                                      <Square size={18} />
                                    )}
                                  </div>

                                  <span style={{
                                    fontSize: '13px',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    fontWeight: isActive ? 600 : 400,
                                    flexGrow: 1,
                                    textDecoration: isComplete ? 'line-through' : 'none',
                                    opacity: isComplete ? 0.7 : 1
                                  }}>
                                    {lesson.title}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                              No lessons added yet.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>No syllabus modules exist.</p>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .back-link:hover {
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
};

export default CoursePlayer;
