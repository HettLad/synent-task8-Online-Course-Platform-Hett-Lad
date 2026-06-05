const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const seedData = async () => {
  try {
    // Check if courses already exist
    const courseCount = await Course.countDocuments();
    if (courseCount >= 12) {
      console.log('Database already seeded with all 12 default courses. Skipping auto-seed.');
      return;
    }

    console.log('Seeding Database with 12 mock courses...');

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

    // Deleting only default courses to avoid duplication when upgrading the seed list
    await Course.deleteMany({
      title: {
        $in: [
          'React.js - Complete Frontend Development Guide',
          'Full Stack Node.js & Express Fundamentals',
          'Modern UI/UX Design System & Masterclass',
          'JavaScript Algorithms & Data Structures Masterclass',
          'MongoDB Database Architecture & Advanced Modeling',
          'Advanced CSS Grid, Flexbox & Animations Masterclass',
          'Python for Data Science & Machine Learning Boot Camp',
          'Mastering Git & GitHub: Professional Version Control',
          'Next.js 14 Production-Ready App Router Masterclass',
          'Introduction to Docker & Containerization for Beginners',
          'Tailwind CSS: Rapidly Build Responsive Interfaces',
          'TypeScript Essentials: Write Safe & Clean JavaScript'
        ]
      }
    });

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
      },
      {
        title: 'JavaScript Algorithms & Data Structures Masterclass',
        description: 'Crack coding interviews and level up your problem-solving. Master Big O analysis, arrays, strings, stacks, queues, hash tables, and advanced sorting algorithms.',
        price: 799,
        category: 'Development',
        instructor: 'Admin Instructor',
        thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
        modules: [
          {
            title: 'Module 1: Complexity & Recursion',
            lessons: [
              {
                title: '1.1 Big O Notation Explained',
                videoUrl: 'https://www.youtube.com/embed/V6mKVRU1evU',
                duration: '16:40',
                content: 'Introduction to time and space complexity analysis. Learn how to quantify algorithm efficiency and write scalable code.'
              },
              {
                title: '1.2 Recursion Mechanics',
                videoUrl: 'https://www.youtube.com/embed/l7X9yQbTz78',
                duration: '14:15',
                content: 'Understand call stacks, base cases, helper recursion patterns, and how to debug recursive structures.'
              }
            ]
          },
          {
            title: 'Module 2: Essential Algorithms',
            lessons: [
              {
                title: '2.1 Elementary Sorting Algorithms',
                videoUrl: 'https://www.youtube.com/embed/xli_FI7CuzA',
                duration: '18:30',
                content: 'Examine Bubble Sort, Selection Sort, and Insertion Sort. Compare implementation trade-offs.'
              },
              {
                title: '2.2 Advanced Divide & Conquer Sorting',
                videoUrl: 'https://www.youtube.com/embed/Ns7tGNbtvV4',
                duration: '24:50',
                content: 'Step-by-step trace of Merge Sort and Quick Sort algorithm logic, complexity, and JS implementation.'
              }
            ]
          }
        ]
      },
      {
        title: 'MongoDB Database Architecture & Advanced Modeling',
        description: 'Design robust, scalable database systems. Learn embedding vs referencing, mongoose validations, index strategies, aggregation pipelines, and production configurations.',
        price: 1199,
        category: 'Databases',
        instructor: 'Marcus Vance',
        thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
        modules: [
          {
            title: 'Module 1: Document Modeling Basics',
            lessons: [
              {
                title: '1.1 SQL vs NoSQL Foundations',
                videoUrl: 'https://www.youtube.com/embed/EE8ZT3aLfEQ',
                duration: '15:10',
                content: 'Contrast relational rows and tables against JSON documents. Understand when to select NoSQL.'
              },
              {
                title: '1.2 Mongoose Schema Definitions',
                videoUrl: 'https://www.youtube.com/embed/WDrU305J1yw',
                duration: '19:40',
                content: 'Define mongoose schemas, structure models, add default values, and perform queries in Express.'
              }
            ]
          }
        ]
      },
      {
        title: 'Advanced CSS Grid, Flexbox & Animations Masterclass',
        description: 'Level up your frontend layouts. Master complex Flexbox containers, nested CSS grids, fluid layouts, custom properties, and keyframe-based transition animations.',
        price: 599,
        category: 'Design',
        instructor: 'Clara Dupont',
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
        modules: [
          {
            title: 'Module 1: Layout Systems Mastery',
            lessons: [
              {
                title: '1.1 Flexbox Layout Mechanics',
                videoUrl: 'https://www.youtube.com/embed/fYq5PXgSsbE',
                duration: '13:50',
                content: 'Master flex properties like flex-grow, flex-shrink, and wrap behaviors for custom layout alignments.'
              },
              {
                title: '1.2 CSS Grid Alignment & Templates',
                videoUrl: 'https://www.youtube.com/embed/jV8B24rSN5o',
                duration: '18:25',
                content: 'Construct grid templates using areas, auto-fill, auto-fit, minmax functions, and handle overlapping grid elements.'
              }
            ]
          }
        ]
      },
      {
        title: 'Python for Data Science & Machine Learning Boot Camp',
        description: 'Analyze data, build predictive models, and learn machine learning libraries like NumPy, Pandas, Scikit-Learn, and Seaborn.',
        price: 1299,
        category: 'Data Science',
        instructor: 'Dr. Angela Lin',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
        modules: [
          {
            title: 'Module 1: Python Basics & NumPy Arrays',
            lessons: [
              {
                title: '1.1 Jupyter Setup & Syntax Core',
                videoUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8',
                duration: '18:15',
                content: 'Install Python libraries, launch Jupyter notebooks, write custom functions, and manage loops.'
              },
              {
                title: '1.2 Multi-dimensional Calculations',
                videoUrl: 'https://www.youtube.com/embed/QUT1VHiLgKQ',
                duration: '22:40',
                content: 'Understand numpy array indexing, slicing, reshaping, matrices, and broadcasting rules.'
              }
            ]
          }
        ]
      },
      {
        title: 'Mastering Git & GitHub: Professional Version Control',
        description: 'Never fear merge conflicts again. Learn Git repository basics, interactive rebasing, branch logic, pull requests, and collaborate seamlessly.',
        price: 399,
        category: 'Development',
        instructor: 'Admin Instructor',
        thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800',
        modules: [
          {
            title: 'Module 1: Local & Remote Git Fundamentals',
            lessons: [
              {
                title: '1.1 Git Initialization & Lifecycle',
                videoUrl: 'https://www.youtube.com/embed/8JJ101D3knE',
                duration: '14:20',
                content: 'Initialize your local project workspace, manage staging areas, review changes, and record commits.'
              },
              {
                title: '1.2 Branching, Merging & Conflicts',
                videoUrl: 'https://www.youtube.com/embed/oPpnCh7InLY',
                duration: '19:55',
                content: 'Create branches, merge feature work, understand fast-forwards, and resolve code merge conflicts.'
              }
            ]
          }
        ]
      },
      {
        title: 'Next.js 14 Production-Ready App Router Masterclass',
        description: 'Build fast React applications. Master route layouts, React Server Components (RSC), SEO meta tags, API endpoints, and database integration.',
        price: 1099,
        category: 'Development',
        instructor: 'Dev-Link Academy',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        modules: [
          {
            title: 'Module 1: Server Components & Routing',
            lessons: [
              {
                title: '1.1 Server vs Client Components',
                videoUrl: 'https://www.youtube.com/embed/wm5gMKuwSYk',
                duration: '20:10',
                content: 'Understand RSC architecture, dynamic routing parameters, loading screens, and layout configurations.'
              },
              {
                title: '1.2 Server Data Fetching Patterns',
                videoUrl: 'https://www.youtube.com/embed/gSSsRRYy-zY',
                duration: '25:35',
                content: 'Fetch database records on the server, configure caching headers, and apply static route revalidations.'
              }
            ]
          }
        ]
      },
      {
        title: 'Introduction to Docker & Containerization for Beginners',
        description: 'Package your backend and frontend code to run identically on any platform. Build Dockerfiles, manage network ports, and deploy container clusters.',
        price: 699,
        category: 'DevOps',
        instructor: 'James Mercer',
        thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800',
        modules: [
          {
            title: 'Module 1: Docker Containers 101',
            lessons: [
              {
                title: '1.1 Why Containerization Matters',
                videoUrl: 'https://www.youtube.com/embed/3c-iMh1Y8fc',
                duration: '15:40',
                content: 'Distinguish virtual machines from lightweight container runtimes. Learn basic docker daemon operations.'
              },
              {
                title: '1.2 Creating Docker Images',
                videoUrl: 'https://www.youtube.com/embed/fqMOX6JJhGo',
                duration: '18:50',
                content: 'Write custom multi-stage Dockerfiles, build local images, map ports, and run container instances.'
              }
            ]
          }
        ]
      },
      {
        title: 'Tailwind CSS: Rapidly Build Responsive Interfaces',
        description: 'Design beautiful, responsive landing pages without writing standard CSS files. Learn spacing, grids, dark modes, customization, and animations.',
        price: 499,
        category: 'Design',
        instructor: 'Sarah Jenkins',
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
        modules: [
          {
            title: 'Module 1: Tailwind Grid & Spacing Utility',
            lessons: [
              {
                title: '1.1 Setting Up Tailwind CSS',
                videoUrl: 'https://www.youtube.com/embed/mr15Xzb1Ook',
                duration: '12:30',
                content: 'Initialize tailwind configuration files, import base layers, and write utility class selectors.'
              },
              {
                title: '1.2 Flex layouts & Responsive Prefixing',
                videoUrl: 'https://www.youtube.com/embed/Hq_qVw3J5rw',
                duration: '17:15',
                content: 'Style components for mobile devices and use tailwind responsive break parameters.'
              }
            ]
          }
        ]
      },
      {
        title: 'TypeScript Essentials: Write Safe & Clean JavaScript',
        description: 'Prevent client errors before compilation. Master basic typing, interfaces, custom types, generic parameters, and compile configurations.',
        price: 899,
        category: 'Development',
        instructor: 'Marcus Vance',
        thumbnail: 'https://images.unsplash.com/photo-1516116211223-5c359a36298a?w=800',
        modules: [
          {
            title: 'Module 1: Type Definitions & Compiling',
            lessons: [
              {
                title: '1.1 TypeScript Core Basic Types',
                videoUrl: 'https://www.youtube.com/embed/BwuLxPH8IDs',
                duration: '14:50',
                content: 'Define numbers, strings, arrays, objects, tuples, and configure the tsconfig parameters.'
              },
              {
                title: '1.2 Interfaces & Generics Rules',
                videoUrl: 'https://www.youtube.com/embed/z58R5l1fBFE',
                duration: '22:10',
                content: 'Define user interfaces, extend interface parameters, and write polymorphic typed generic components.'
              }
            ]
          }
        ]
      }
    ];

    await Course.create(courses);
    console.log(`Successfully seeded ${courses.length} courses!`);
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

module.exports = seedData;
