const User = require('../models/User');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Send OTP to email for registration
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/update OTP in database
    await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // Send email with OTP
    const message = `Your email verification OTP code is: ${otp}. This code will expire in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #6366f1;">Email Verification Code</h2>
        <p>Your one-time registration code is:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #4f46e5; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #777;">EduStream Platform Team</p>
      </div>
    `;

    let emailPreviewUrl = '';
    try {
      emailPreviewUrl = await sendEmail({
        email,
        subject: 'EduStream - Registration Verification Code',
        message,
        html
      });
    } catch (err) {
      console.error('OTP email failed to send', err);
      return res.status(500).json({ success: false, error: 'Failed to send OTP email' });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email!',
      emailPreviewUrl,
      otpDev: otp // Returned for easy local dev testing
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Register a new user (with verified OTP)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, otp, role } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, error: 'OTP code is required to complete registration' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Find if there is a matching OTP
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification OTP code' });
    }

    // Delete OTP record
    await otpRecord.deleteOne();

    // Create user (role can be specified, defaults to 'user')
    // Set isVerified to true immediately since they entered correct OTP sent to email!
    user = new User({
      name,
      email,
      password,
      role: role || 'user',
      isVerified: true // Set verified directly on valid OTP matching!
    });

    await user.save();

    // Send a welcome email (email confirmation of registration)
    const message = `Welcome to EduStream, ${name}! Your account has been successfully verified and created. You can now access your learning console.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #6366f1;">Welcome to EduStream!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your account is successfully created and verified. You can now sign in to purchase programs, manage lessons, and track your syllabus progress.</p>
        <p style="margin: 30px 0; text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Login</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #777;">EduStream Platform Team</p>
      </div>
    `;

    let emailPreviewUrl = '';
    try {
      emailPreviewUrl = await sendEmail({
        email: user.email,
        subject: 'Welcome to EduStream!',
        message,
        html
      });
    } catch (err) {
      console.error('Welcome email failed', err);
    }

    res.status(201).json({
      success: true,
      message: 'Account created and verified successfully!',
      emailPreviewUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Verify email address
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    // Hash token to match saved version
    const verificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      // In development, if they don't want to check emails, they can verify easily.
      return res.status(401).json({
        success: false,
        isNotVerified: true,
        error: 'Please verify your email to log in.'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('enrolledCourses.course');
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrolledCourses: user.enrolledCourses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Forgot password request
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'There is no user with that email' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Please click the button below to set a new password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request this reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">EduStream Support</p>
      </div>
    `;

    let emailPreviewUrl = '';
    try {
      emailPreviewUrl = await sendEmail({
        email: user.email,
        subject: 'EduStream - Password Reset Request',
        message,
        html
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.',
      emailPreviewUrl,
      resetTokenDev: resetToken // Returned for easy dev testing
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token and password are required' });
    }

    // Hash token to match database
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.isVerified = true; // Auto-verify on reset password just in case
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
