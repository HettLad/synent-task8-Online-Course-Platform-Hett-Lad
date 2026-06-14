const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get all courses enrolled by the logged-in user
// @route   GET /api/users/enrolled
// @access  Private
exports.getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('enrolledCourses.course');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      count: user.enrolledCourses.length,
      enrolledCourses: user.enrolledCourses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Mark a lesson as complete or incomplete (toggle)
// @route   POST /api/users/progress
// @access  Private
exports.toggleLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId, isCompleted } = req.body;
    const userId = req.user.id;

    if (!courseId || !lessonId) {
      return res.status(400).json({ success: false, error: 'Course ID and Lesson ID are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Find the enrolled course
    const enrollmentIndex = user.enrolledCourses.findIndex((c) => {
      const cid = c.course?._id || c.course;
      return cid && cid.toString() === courseId;
    });

    if (enrollmentIndex === -1) {
      return res.status(400).json({ success: false, error: 'User is not enrolled in this course' });
    }

    const enrollment = user.enrolledCourses[enrollmentIndex];
    const progressIndex = enrollment.progress.findIndex(
      (p) => p.lessonId === lessonId
    );

    if (isCompleted) {
      // Add if not already complete
      if (progressIndex === -1) {
        enrollment.progress.push({ lessonId, completedAt: Date.now() });
      }
    } else {
      // Remove if it exists
      if (progressIndex !== -1) {
        enrollment.progress.splice(progressIndex, 1);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isCompleted ? 'Lesson marked complete' : 'Lesson marked incomplete',
      progress: enrollment.progress
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get dashboard metrics / stats
// @route   GET /api/users/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Enrollments
    const totalEnrollments = await Enrollment.countDocuments({ status: 'completed' });
    
    // Revenue sum
    const enrollments = await Enrollment.find({ status: 'completed' });
    const totalRevenue = enrollments.reduce((sum, en) => sum + (en.amount || 0), 0);

    // Recent enrollments (last 5)
    const recentEnrollments = await Enrollment.find({ status: 'completed' })
      .populate('user', 'name email')
      .populate('course', 'title price')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalCourses,
        totalUsers,
        totalEnrollments,
        totalRevenue
      },
      recentEnrollments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all users (for Admin dashboard)
// @route   GET /api/users/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .populate('enrolledCourses.course')
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all transactions/enrollments (for Admin dashboard)
// @route   GET /api/users/admin/enrollments
// @access  Private/Admin
exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({})
      .populate('user', 'name email')
      .populate('course', 'title price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update name if provided
    if (req.body.name) {
      user.name = req.body.name;
    }

    // Update password if provided
    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ success: false, error: 'Please provide current password to update password' });
      }

      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect' });
      }

      user.password = req.body.newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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

// @desc    Admin unenroll student from a course (take back course)
// @route   DELETE /api/users/admin/users/:userId/courses/:courseId
// @access  Private/Admin
exports.unenrollUserCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if enrolled
    const enrolledIndex = user.enrolledCourses.findIndex((ec) => {
      const cid = ec.course?._id || ec.course;
      return cid && cid.toString() === courseId;
    });

    if (enrolledIndex === -1) {
      return res.status(400).json({ success: false, error: 'User is not enrolled in this course' });
    }

    // Remove course from user enrolled list
    user.enrolledCourses.splice(enrolledIndex, 1);
    await user.save();

    // Update Enrollment log
    await Enrollment.findOneAndUpdate(
      { user: userId, course: courseId, status: 'completed' },
      { status: 'failed' }
    );

    res.status(200).json({
      success: true,
      message: 'Course access revoked successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


