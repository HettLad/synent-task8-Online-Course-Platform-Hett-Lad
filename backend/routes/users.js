const express = require('express');
const {
  getEnrolledCourses,
  toggleLessonProgress,
  getAdminStats,
  getAllUsers,
  getAllEnrollments,
  updateUserProfile,
  unenrollUserCourse
} = require('../controllers/userController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Student routes
router.get('/enrolled', protect, getEnrolledCourses);
router.post('/progress', protect, toggleLessonProgress);
router.put('/profile', protect, updateUserProfile);

// Admin-only metrics and management routes
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);
router.get('/admin/users', protect, authorize('admin'), getAllUsers);
router.get('/admin/enrollments', protect, authorize('admin'), getAllEnrollments);
router.delete('/admin/users/:userId/courses/:courseId', protect, authorize('admin'), unenrollUserCourse);

module.exports = router;
