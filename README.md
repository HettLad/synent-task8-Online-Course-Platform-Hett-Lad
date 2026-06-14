# EduStream - Premium Full-Stack Online Course Platform

A full-stack, responsive learning platform where users can explore, purchase (simulated/real Test Mode), and study course material. Instructors (admins) can create programs, organize curriculums, check user profiles, and review purchase audit lists.

---

## 🚀 Key Features

1. **Authentication Flow**
   - User Registration, login validation, and security tokenization via **JWT**.
   - **Email Verification** and **Password Recovery** with link tracking.
   - Development bypasses to test verification and reset passwords instantly.

2. **Course Catalog**
   - Grid layout featuring courses sorted by categories (Development, Design).
   - Dynamic search bar filtering courses.
   - Course detail panels outlining syllabus (modules & lessons) before enrollment.

3. **Enrollment Flow (Razorpay integration)**
   - Single-click checkout utilizing **Razorpay SDK** in Test Mode.
   - **Mock Payment Mode Fallback**: If Razorpay keys are not configured, the platform runs in a gorgeous simulated checkout screen so you can inspect checkout results instantly.
   - Confirmation receipt emails generated upon enrollment success.

4. **Learning System**
   - Split-screen course workspace.
   - Live video playback via embedded frame players.
   - Responsive lesson syllabus checklists.
   - Live progress bars indicating completion percentage.

5. **Instructor Dashboard (Admin Panel)**
   - Key Metrics: Total Courses, Registered Students, Transactions, and Gross Revenue.
   - Course Creator: Publish, modify, and delete courses.
   - Syllabus Builder: Select courses, append modules, and create lessons with durations and descriptions.
   - User Directory: Trace account lists and verification states.
   - Transaction Audit: Access payment receipt logs.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router, Lucide Icons, Glassmorphism design system.
- **Backend**: Node.js (Express), JWT Authentication.
- **Database**: MongoDB (Mongoose).
- **Services**: Razorpay (Payment Gateways), Nodemailer (Transactional email notifications).

---

## ⚙️ Environment Configuration

### Backend Setup (`/backend/.env`)
The environment configuration has been pre-configured with defaults. If your local MongoDB instance runs on a different port, modify `/backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/online-course-platform
JWT_SECRET=supersecretjwttokenkeyforonlinecourseplatform123!
JWT_EXPIRE=30d

# Razorpay Configuration (Get these from Razorpay Dashboard in Test Mode)
# If left as placeholders, the application runs in simulated MOCK PAYMENT mode.
RAZORPAY_KEY_ID=rzp_test_placeholder_key
RAZORPAY_KEY_SECRET=placeholder_secret_key

# Nodemailer SMTP Configuration
# Uses ethereal test SMTP out-of-the-box. Logs link to preview email in console.
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=mock_user
SMTP_PASS=mock_pass
FROM_EMAIL=noreply@courseplatform.com
FROM_NAME="EduStream Admin"
```

---

## 🔐 Credentials for Testing (Pre-Seeded)

The database automatically seeds mock accounts and courses on first start if empty. You can use these to test instantly:

### Student Credentials
- **Email**: `student@edustream.com`
- **Password**: `studentpassword123`
- *Pre-verified student account*

### Administrator (Instructor) Credentials
- **Email**: `admin@edustream.com`
- **Password**: `adminpassword123`
- *Access to the "Admin Panel" inside navigation menu*

---

## 💻 How to Start the Project

Follow these steps to start the application (do this in two separate terminals):

### Step 1: Start the Backend Server
1. Navigate into the backend folder:
   ```bash
   cd backend
   ```
2. Start the server in hot-reload development mode:
   ```bash
   npm run dev
   ```
   *The console will print database connection status and confirm if it auto-seeded courses. It will also display Ethereal email log URLs when emails are sent.*

### Step 2: Start the Frontend React Client
1. Open a new terminal in the project root directory.
2. Navigate into the frontend folder:
   ```bash
   cd frontend
   ```
3. Install development dependencies:
   ```bash
   npm install
   ```
4. Start the Vite React development server:
   ```bash
   npm run dev
   ```
5. Click the link shown in your terminal (usually `http://localhost:5173`) to view the application in your browser.

---

## 🔧 Maintenance & Bug Fixes

- **Graceful Course Reference Handling**: Resolved blank page crashes in `Dashboard.jsx`, `LandingPage.jsx`, `CoursePlayer.jsx`, and `AdminDashboard.jsx`. If a course is deleted or has missing catalog mappings, the application safely handles it without crashing the UI.
- **Backend Hardening**: Added fallback checks in `paymentController.js` and `userController.js` to prevent server errors on legacy or deleted course ObjectIds.
- **Enrolled Course Restoration**: Synced pre-existing test student enrollments (such as `student@edustream.com` and `ladhett@gmail.com`) with the active seeded course IDs, restoring course visibility in their dashboard instantly.
