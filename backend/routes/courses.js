const express = require('express');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addModule,
  addLesson
} = require('../controllers/courseController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Admin-only routes
router.post('/', protect, authorize('admin'), createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);
router.post('/:id/modules', protect, authorize('admin'), addModule);
router.post('/:id/modules/:moduleId/lessons', protect, authorize('admin'), addLesson);

module.exports = router;
