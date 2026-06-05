const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const seedData = async () => {
  try {
    // Check if courses already exist
    const courseCount = await Course.countDocuments();
    if (courseCount > 0) {
      console.log('Database already seeded. Skipping auto-seed.');
      return;
    }

    console.log('Seeding Database...');

    // 1. Create Admin and Student users
    const adminExist = await User.findOne({ email: 'admin@edustream.com' });
    if (!adminExist) {
      await User.create({
        name: 'Admin Instructor',
        email: 'admin@edustream.com',
        password: 'adminpassword123',
        role: 'admin',
        isVerified: true
      });
      console.log('Admin user created (admin@edustream.com / adminpassword123)');
    }

    const studentExist = await User.findOne({ email: 'student@edustream.com' });
    if (!studentExist) {
      await User.create({
        name: 'John Doe',
        email: 'student@edustream.com',
        password: 'studentpassword123',
        role: 'user',
        isVerified: true
      });
      console.log('Student user created (student@edustream.com / studentpassword123)');
    }

    // 2. Create Courses
    const courses = [
      {
        title: 'React.js - Complete Frontend Development Guide',
        description: 'Master React.js from scratch. Learn components, hooks, routing, state management (Redux/Context), and build real-world responsive web applications with stunning CSS styling.',
        price: 999,
        category: 'Development',
        instructor: 'Admin Instructor',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        modules: [
          {
            title: 'Module 1: Introduction to React',
            lessons: [
              {
                title: '1.1 Course Overview & Setup',
                videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk', // React Intro
                duration: '12:45',
                content: 'Welcome to the course! In this lesson, we will walk through the structure of the course, setting up your local environment, Node.js, and installing Visual Studio Code.'
              },
              {
                title: '1.2 What is React and Why Use It?',
                videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0',
                duration: '15:20',
                content: 'Understand the core concepts of React: component-based architecture, virtual DOM, and uni-directional data flow. We will compare React with traditional JS frameworks.'
              }
            ]
          },
          {
            title: 'Module 2: Core Concepts (JSX, Props, and State)',
            lessons: [
              {
                title: '2.1 Understanding JSX Syntax',
                videoUrl: 'https://www.youtube.com/embed/7fPXI_MnOP0',
                duration: '18:10',
                content: 'JSX is a syntax extension to JavaScript. Learn how it converts to React elements, how to write JS expressions inside JSX, and styling rules.'
              },
              {
                title: '2.2 Dynamic Components with Props',
                videoUrl: 'https://www.youtube.com/embed/m7OWXtbiXX8',
                duration: '22:15',
                content: 'Props allow you to pass data into components. Learn how to configure functional components to receive props, default props, and type checking.'
              },
              {
                title: '2.3 Managing State with useState Hook',
                videoUrl: 'https://www.youtube.com/embed/O6P86uwfdMs',
                duration: '25:40',
                content: 'State represents mutable component data. Learn how to declare state, update state, and re-render components using the useState Hook.'
              }
            ]
          }
        ]
      },
      {
        title: 'Full Stack Node.js & Express Fundamentals',
        description: 'Build fast, secure backend APIs using Node.js and Express. Learn routing, middleware, JWT authentication, MongoDB integration, and deploy complete applications.',
        price: 1499,
        category: 'Development',
        instructor: 'Admin Instructor',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        modules: [
          {
            title: 'Module 1: Getting Started with Node.js',
            lessons: [
              {
                title: '1.1 Introduction to Node.js & Event Loop',
                videoUrl: 'https://www.youtube.com/embed/TlB_eWDSMt4',
                duration: '14:30',
                content: 'Learn what Node.js is, how V8 engine compiles JavaScript, and the single-threaded asynchronous nature of the Node event loop.'
              },
              {
                title: '1.2 Core Modules: File System and HTTP',
                videoUrl: 'https://www.youtube.com/embed/yEHCfGQsEsY',
                duration: '20:10',
                content: 'Use Node\'s built-in fs module to read/write files and the http module to instantiate a simple web server.'
              }
            ]
          },
          {
            title: 'Module 2: Express Framework & Routing',
            lessons: [
              {
                title: '2.1 Building RESTful APIs with Express',
                videoUrl: 'https://www.youtube.com/embed/SccSCuHh3K4',
                duration: '28:15',
                content: 'Install Express, setup routing structure, handle parameters, request bodies, and parse JSON requests.'
              },
              {
                title: '2.2 Middleware Pattern in Express',
                videoUrl: 'https://www.youtube.com/embed/lY6icfhap2o',
                duration: '18:50',
                content: 'Master the concept of middlewares. Learn how request-response pipelines work and build custom authentication and logging middlewares.'
              }
            ]
          }
        ]
      },
      {
        title: 'Modern UI/UX Design System & Masterclass',
        description: 'Master typography, layouts, color theory, dark themes, and glassmorphism. Learn how to convert static designs into highly interactive web user interfaces.',
        price: 499,
        category: 'Design',
        instructor: 'Sarah Jenkins',
        thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800',
        modules: [
          {
            title: 'Module 1: Layout & Color Principles',
            lessons: [
              {
                title: '1.1 Grid Systems & Visual Hierarchy',
                videoUrl: 'https://www.youtube.com/embed/N-P6z_kR9Sg',
                duration: '11:20',
                content: 'Understand visual grids, spacing values, alignment, and formatting content in a layout to maximize readability and premium user feel.'
              },
              {
                title: '1.2 Color Harmonies & Tailwind Color Theory',
                videoUrl: 'https://www.youtube.com/embed/GyVM4bQ-VTY',
                duration: '15:45',
                content: 'Learn the psychological and aesthetic power of color palettes. We will design custom HSL palettes, semantic values, and proper contrast ratios.'
              }
            ]
          }
        ]
      }
    ];

    await Course.create(courses);
    console.log('Successfully seeded 3 courses!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

module.exports = seedData;
