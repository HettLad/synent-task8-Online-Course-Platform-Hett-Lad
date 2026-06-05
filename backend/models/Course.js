const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true
  },
  videoUrl: {
    type: String,
    required: [true, 'Please add a video URL or identifier']
  },
  duration: {
    type: String,
    default: '5:00'
  },
  content: {
    type: String,
    default: ''
  }
});

const ModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a module title'],
    trim: true
  },
  lessons: [LessonSchema]
});

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a course description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a course price'],
    min: 0
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    default: 'Development'
  },
  instructor: {
    type: String,
    required: [true, 'Please add an instructor name'],
    default: 'Admin Instructor'
  },
  modules: [ModuleSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', CourseSchema);
