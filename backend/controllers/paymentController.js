const Razorpay = require('razorpay');
const crypto = require('crypto');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const sendEmail = require('../utils/sendEmail');

let razorpay = null;

// Initialize Razorpay if valid keys are provided
try {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keyId !== 'rzp_test_placeholder_key' && keySecret && keySecret !== 'placeholder_secret_key') {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    console.log('Razorpay initialized successfully in Test/Live Mode');
  } else {
    console.log('Razorpay credentials missing or placeholder. Running in Mock Payment Mode.');
  }
} catch (err) {
  console.error('Razorpay initialization failed, running in Mock Payment Mode.', err.message);
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Check if user is already enrolled
    const user = await User.findById(userId);
    const isAlreadyEnrolled = user.enrolledCourses.some((enrollment) => {
      const cid = enrollment.course?._id || enrollment.course;
      return cid && cid.toString() === courseId;
    });

    if (isAlreadyEnrolled) {
      return res.status(400).json({ success: false, error: 'You are already enrolled in this course' });
    }

    const amount = course.price * 100; // Razorpay expects amount in paise
    const currency = 'INR';
    const receipt = `receipt_rc_${Date.now()}`;

    // Free courses enrollment bypass
    if (course.price === 0) {
      // Direct enrollment
      user.enrolledCourses.push({
        course: courseId,
        progress: []
      });
      await user.save();

      // Create a completed enrollment record
      await Enrollment.create({
        user: userId,
        course: courseId,
        amount: 0,
        razorpayOrderId: 'free_course_bypass',
        razorpayPaymentId: 'free_course_bypass',
        razorpaySignature: 'free_course_bypass',
        status: 'completed'
      });

      // Send email
      await sendEnrollmentEmail(user, course);

      return res.status(200).json({
        success: true,
        isFree: true,
        message: 'Enrolled in free course successfully!'
      });
    }

    // Check if we should use Mock Mode
    if (!razorpay) {
      // Mock order generation
      const mockOrderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
      
      // Save pending enrollment in DB
      await Enrollment.create({
        user: userId,
        course: courseId,
        amount: course.price,
        razorpayOrderId: mockOrderId,
        status: 'pending'
      });

      return res.status(200).json({
        success: true,
        isMock: true,
        keyId: 'mock_key',
        order: {
          id: mockOrderId,
          amount: amount,
          currency: currency
        }
      });
    }

    // Real Razorpay integration
    const options = {
      amount,
      currency,
      receipt
    };

    const order = await razorpay.orders.create(options);

    // Save pending enrollment in DB
    await Enrollment.create({
      user: userId,
      course: courseId,
      amount: course.price,
      razorpayOrderId: order.id,
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      isMock: false,
      keyId: process.env.RAZORPAY_KEY_ID,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Verify Razorpay Payment / Complete Enrollment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, isMock } = req.body;
    const userId = req.user.id;

    // Find pending enrollment
    const enrollment = await Enrollment.findOne({ razorpayOrderId, user: userId, status: 'pending' });
    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Pending enrollment not found for this order' });
    }

    const courseId = enrollment.course;
    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course || !user) {
      return res.status(404).json({ success: false, error: 'User or course not found' });
    }

    if (isMock) {
      // Mock verification success
      enrollment.status = 'completed';
      enrollment.razorpayPaymentId = razorpayPaymentId || `pay_mock_${crypto.randomBytes(8).toString('hex')}`;
      enrollment.razorpaySignature = razorpaySignature || 'mock_sig';
      await enrollment.save();

      // Add course to user
      user.enrolledCourses.push({
        course: courseId,
        progress: []
      });
      await user.save();

      // Send confirmation email
      let emailPreviewUrl = '';
      try {
        emailPreviewUrl = await sendEnrollmentEmail(user, course);
      } catch (err) {
        console.error('Enrollment email failed', err);
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified and enrolled successfully (Mock Mode)!',
        emailPreviewUrl
      });
    }

    // Real Razorpay signature validation
    if (!razorpay) {
      return res.status(400).json({ success: false, error: 'Razorpay is not configured for signature verification' });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpaySignature) {
      // Success
      enrollment.status = 'completed';
      enrollment.razorpayPaymentId = razorpayPaymentId;
      enrollment.razorpaySignature = razorpaySignature;
      await enrollment.save();

      // Add course to user
      user.enrolledCourses.push({
        course: courseId,
        progress: []
      });
      await user.save();

      // Send confirmation email
      let emailPreviewUrl = '';
      try {
        emailPreviewUrl = await sendEnrollmentEmail(user, course);
      } catch (err) {
        console.error('Enrollment email failed', err);
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified and enrolled successfully!',
        emailPreviewUrl
      });
    } else {
      enrollment.status = 'failed';
      await enrollment.save();
      res.status(400).json({ success: false, error: 'Invalid payment signature. Verification failed.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to send enrollment email
async function sendEnrollmentEmail(user, course) {
  const message = `Congratulations, ${user.name}! You have successfully enrolled in "${course.title}". You can now access all learning modules and track your progress in your dashboard.\n\nStart Learning: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Course Enrollment Confirmed!</h2>
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Congratulations! Your payment/enrollment for <strong>"${course.title}"</strong> was successful.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h4 style="margin-top: 0;">Course details:</h4>
        <ul style="list-style-type: none; padding-left: 0;">
          <li><strong>Course Name:</strong> ${course.title}</li>
          <li><strong>Instructor:</strong> ${course.instructor}</li>
          <li><strong>Price:</strong> ₹${course.price}</li>
        </ul>
      </div>

      <p>You can start watching lessons, complete modules, and track your progress right now.</p>
      <p style="margin: 30px 0; text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to My Dashboard</a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">EduStream Platform - Happy Learning!</p>
    </div>
  `;

  return await sendEmail({
    email: user.email,
    subject: `EduStream - Enrollment Confirmation for ${course.title}`,
    message,
    html
  });
}
