import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Search, Filter, BookOpen, Clock, ChevronDown, ChevronUp, User, Award, CheckCircle, CreditCard } from 'lucide-react';

const LandingPage = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);
  
  // Checkout States
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showMockPaymentModal, setShowMockPaymentModal] = useState(false);
  const [activeMockOrder, setActiveMockOrder] = useState(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Fetch courses from Backend
  useEffect(() => {
    fetchCourses();
  }, [search, selectedCategory]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:5000/api/courses?search=${search}&category=${selectedCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Check if user is already enrolled
  const isEnrolled = (courseId) => {
    if (!user || !user.enrolledCourses) return false;
    return user.enrolledCourses.some(ec => {
      // populate could mean object or string ID
      const cid = ec.course?._id || ec.course;
      return cid === courseId;
    });
  };

  // Enroll Now Handler
  const handleEnroll = async (course) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isEnrolled(course._id)) {
      navigate('/dashboard');
      return;
    }

    setCheckoutLoading(true);

    try {
      // 1. Create order in Backend
      const orderRes = await fetch('http://localhost:5000/api/payments/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: course._id })
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // If free course, it is direct auto-enrollment
      if (orderData.isFree) {
        setPaymentSuccessData({
          message: 'Enrolled in free course successfully!',
          emailPreviewUrl: orderData.emailPreviewUrl
        });
        // Refresh User profile in context to get updated enrollments
        await refreshUserProfile();
        setCheckoutLoading(false);
        return;
      }

      // Check if backend runs in Mock Mode
      if (orderData.isMock) {
        setActiveMockOrder({
          orderId: orderData.order.id,
          amount: course.price,
          course: course
        });
        setShowMockPaymentModal(true);
        setCheckoutLoading(false);
        return;
      }

      // 2. Load Razorpay script & checkout (Real mode)
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Razorpay SDK failed to load. Are you offline?');
        setCheckoutLoading(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'EduStream',
        description: `Enroll in ${course.title}`,
        order_id: orderData.order.id,
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#6366f1'
        },
        handler: async function (response) {
          // Verify signature on backend
          try {
            const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                isMock: false
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setPaymentSuccessData(verifyData);
              await refreshUserProfile();
            } else {
              alert('Payment verification failed.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Verification request failed.');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      alert(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Submit Mock Payment
  const submitMockPayment = async () => {
    if (!activeMockOrder) return;
    setCheckoutLoading(true);
    try {
      const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpayOrderId: activeMockOrder.orderId,
          isMock: true
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setShowMockPaymentModal(false);
        setPaymentSuccessData(verifyData);
        await refreshUserProfile();
      } else {
        alert('Payment verification failed');
      }
    } catch (err) {
      console.error(err);
      alert('Mock payment failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Refresh context profile
  const refreshUserProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        // Direct context update simulation
        window.location.reload(); // Quick reset of state/context
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <Navbar />

      {/* Hero Banner */}
      <section className="section-padding flex-center" style={{
        minHeight: '400px',
        textAlign: 'center',
        background: 'radial-gradient(circle, hsla(var(--hue), 85%, 60%, 0.08) 0%, transparent 70%)'
      }}>
        <div className="container" style={{ maxWidth: '800px', animation: 'fadeIn 0.6s ease-out' }}>
          <span className="badge badge-primary" style={{ marginBottom: '16px' }}>Elevate Your Skills</span>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
            Learn From The <span className="text-gradient">Experts</span> Online
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginBottom: '32px' }}>
            Access top-tier video instruction, structured learning modules, and direct project feedback. Enroll and master software development, design, and product engineering today.
          </p>

          {/* Search bar */}
          <div className="glass" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <Search size={20} color="var(--text-muted)" style={{ marginRight: '12px' }} />
            <input
              type="text"
              placeholder="Search course titles or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                outline: 'none',
                width: '100%',
                fontSize: '16px'
              }}
            />
          </div>
        </div>
      </section>

      {/* Categories & Courses list */}
      <main className="container" style={{ paddingBottom: '100px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '40px',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: '20px'
        }}>
          <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>Explore Programs</h2>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Development', 'Design'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-glass'}`}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '13px' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
            <div className="spinner spinner-lg"></div>
            <p style={{ color: 'var(--text-muted)' }}>Fetching courses from catalog...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="glass flex-center" style={{ minHeight: '200px', borderRadius: 'var(--radius-md)', flexDirection: 'column', padding: '40px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No courses match your active search filters.</p>
            <button className="btn btn-primary" onClick={() => { setSearch(''); setSelectedCategory('All'); }}>Reset Filters</button>
          </div>
        ) : (
          <div className="grid-3">
            {courses.map(course => (
              <div
                key={course._id}
                className="glass glass-hover"
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedCourse(course);
                  setExpandedModule(null);
                }}
              >
                {/* Thumbnail */}
                <div style={{ height: '180px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className="badge badge-secondary" style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 10
                  }}>
                    {course.category}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    Instructor: {course.instructor}
                  </span>
                  <h3 style={{ fontSize: '18px', marginBottom: '12px', lineHeight: 1.4 }}>
                    {course.title}
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    marginBottom: '20px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flexGrow: 1
                  }}>
                    {course.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-glass)',
                    paddingTop: '16px'
                  }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>
                      {course.price === 0 ? 'Free' : `₹${course.price}`}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <BookOpen size={14} /> {course.modules?.length || 0} Modules
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div
            className="modal-content glass"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', animation: 'fadeIn 0.3s ease-out' }}
          >
            <button className="modal-close" onClick={() => setSelectedCourse(null)}>&times;</button>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
              
              {/* Header Info */}
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '12px' }}>{selectedCourse.category}</span>
                <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>{selectedCourse.title}</h2>
                <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={16} /> By {selectedCourse.instructor}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} /> Certificate of Completion
                  </span>
                </div>
                
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}
                />

                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>About this Course</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                  {selectedCourse.description}
                </p>

                {/* Modules Accordion */}
                <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Syllabus ({selectedCourse.modules?.length || 0} Modules)</h3>
                
                {selectedCourse.modules && selectedCourse.modules.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                    {selectedCourse.modules.map((mod, idx) => (
                      <div key={mod._id} className="glass" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <div
                          onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
                          style={{
                            padding: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            background: expandedModule === idx ? 'hsla(var(--hue), 85%, 60%, 0.05)' : 'transparent'
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: '15px' }}>{mod.title}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            {mod.lessons?.length || 0} lessons
                            {expandedModule === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        </div>

                        {expandedModule === idx && (
                          <div style={{
                            padding: '0 16px 16px 16px',
                            borderTop: '1px solid var(--border-glass)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            background: 'rgba(0, 0, 0, 0.2)'
                          }}>
                            {mod.lessons.map((lesson) => (
                              <div key={lesson._id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 0',
                                borderBottom: '1px solid rgba(255,255,255,0.03)'
                              }}>
                                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{lesson.title}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={12} /> {lesson.duration}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>No syllabus added yet for this course.</p>
                )}

                {/* Pricing / Enrollment Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-glass)',
                  paddingTop: '20px'
                }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Tuition Fee</span>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'white' }}>
                      {selectedCourse.price === 0 ? 'Free' : `₹${selectedCourse.price}`}
                    </span>
                  </div>

                  {isEnrolled(selectedCourse._id) ? (
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="btn btn-secondary"
                    >
                      Resume Learning
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(selectedCourse)}
                      disabled={checkoutLoading}
                      className="btn btn-primary"
                      style={{ padding: '14px 40px' }}
                    >
                      {checkoutLoading ? (
                        <>
                          <div className="spinner"></div>
                          Processing...
                        </>
                      ) : (
                        user ? 'Enroll Now' : 'Sign in to Enroll'
                      )}
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Simulated/Mock Payment Gateway Modal */}
      {showMockPaymentModal && activeMockOrder && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '450px', border: '1px solid var(--secondary)', animation: 'pulse-glow 3s infinite' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div className="flex-center" style={{
                background: 'rgba(236, 72, 153, 0.1)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                margin: '0 auto 16px auto',
                border: '1px solid var(--secondary)'
              }}>
                <CreditCard size={28} color="var(--secondary)" />
              </div>
              <h2 style={{ fontSize: '24px', marginBottom: '6px' }} className="text-gradient">EduStream Checkout</h2>
              <span className="badge badge-secondary">Simulated Test Mode</span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Course:</span>
                <span style={{ fontWeight: 600 }}>{activeMockOrder.course.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{activeMockOrder.orderId}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total Amount:</span>
                <span style={{ color: 'white', fontSize: '16px' }}>₹{activeMockOrder.amount}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={submitMockPayment}
                disabled={checkoutLoading}
                className="btn btn-primary"
                style={{ width: '100%', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)' }}
              >
                {checkoutLoading ? (
                  <div className="spinner"></div>
                ) : (
                  'Authorize Mock Payment (Success)'
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowMockPaymentModal(false);
                  setActiveMockOrder(null);
                }}
                disabled={checkoutLoading}
                className="btn btn-glass"
                style={{ width: '100%' }}
              >
                Cancel Checkout
              </button>
            </div>
            
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>
              Note: Ethereal enrollment email will generate in the background upon approval.
            </p>
          </div>
        </div>
      )}

      {/* Payment Success Confirmation Modal */}
      {paymentSuccessData && (
        <div className="modal-overlay" onClick={() => { setPaymentSuccessData(null); setSelectedCourse(null); }}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', textAlign: 'center', padding: '40px' }}>
            <div className="flex-center" style={{
              background: 'rgba(34, 197, 94, 0.1)',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              margin: '0 auto 24px auto',
              border: '2px solid var(--success)'
            }}>
              <CheckCircle size={44} color="var(--success)" />
            </div>

            <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>Enrollment Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>
              Thank you for registering. You have been successfully enrolled in this course. An enrollment confirmation email was generated.
            </p>

            {paymentSuccessData.emailPreviewUrl && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '24px',
                border: '1px solid var(--border-glass)'
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Development Email Tool</span>
                <a
                  href={paymentSuccessData.emailPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary-hover)', fontSize: '13px', fontWeight: 600, wordBreak: 'break-all' }}
                >
                  Click here to view Ethereal Test Email Output &rarr;
                </a>
              </div>
            )}

            <button
              onClick={() => {
                setPaymentSuccessData(null);
                setSelectedCourse(null);
                navigate('/dashboard');
              }}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Start Learning Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
