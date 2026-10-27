import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import './styles/global.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/quiz.css';
import './styles/question.css';
import './styles/campusPortal.css';
import './styles/responsive.css';
import './styles/course.css';
import './styles/gamification.css';
import './styles/proctoring.css';

import Header from './components/Header';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuizList from './pages/QuizList';
import QuizDetails from './pages/QuizDetails';
import AddQuiz from './pages/AddQuiz';
import EditQuiz from './pages/EditQuiz';
import QuizQuestions from './pages/QuizQuestions';
import AddQuestion from './pages/AddQuestion';
import TakeQuiz from './pages/TakeQuiz';
import Result from './pages/Result';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import AdminUsers from './pages/AdminUsers';
import NotFound from './pages/NotFound';

// Proctoring Module Pages
import ProctoredExamLayout from './pages/ProctoredExamLayout';
import ProctoringDashboard from './pages/ProctoringDashboard';

// Course Management Module Pages
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import CourseManagement from './pages/CourseManagement';
import CourseLearning from './pages/CourseLearning';
import MyCourses from './pages/MyCourses';
import EnrolledStudents from './pages/EnrolledStudents';
import MentorChat from './pages/MentorChat';
import MyMentees from './pages/MyMentees';
import Profile from './pages/Profile';

function AppContent() {
  const location = useLocation();
  const isExamRoute = 
    location.pathname.startsWith('/take-quiz') ||
    location.pathname.startsWith('/take-proctored-quiz') || 
    location.pathname.startsWith('/proctored-exam');

  if (isExamRoute) {
    return (
      <div className="exam-fullscreen-wrapper" style={{ minHeight: '100vh', width: '100%', background: 'var(--bg-main, #f8fafc)', overflowY: 'auto' }}>
        <Routes>
          <Route
            path="/take-quiz/:id"
            element={
              <ProtectedRoute roles={['STUDENT']}>
                <div style={{ minHeight: '100vh', width: '100%', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <TakeQuiz />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/take-proctored-quiz/:quizId"
            element={
              <ProtectedRoute roles={['STUDENT']}>
                <ProctoredExamLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proctored-exam/:attemptId"
            element={
              <ProtectedRoute roles={['STUDENT']}>
                <ProctoredExamLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-container">

      <Header />
      <Navbar />

      <main className="main-content">
        <Routes>

              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Course Module Routes */}
              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <Courses />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/courses/:id"
                element={
                  <ProtectedRoute>
                    <CourseDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-courses"
                element={
                  <ProtectedRoute>
                    <MyCourses />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/courses/:id/learn"
                element={
                  <ProtectedRoute>
                    <CourseLearning />
                  </ProtectedRoute>
                }
              />

              {/* Educator / Admin Course Routes */}
              <Route
                path="/courses/create"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <CreateCourse />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/courses/:id/edit"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <EditCourse />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/courses/:id/manage"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <CourseManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/courses/:id/students"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <EnrolledStudents />
                  </ProtectedRoute>
                }
              />

              {/* Quiz Module Routes */}
              <Route
                path="/quizzes"
                element={
                  <ProtectedRoute>
                    <QuizList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/quiz/:id"
                element={
                  <ProtectedRoute>
                    <QuizDetails />
                  </ProtectedRoute>
                }
              />

              {/* Admin / Educator Quiz Routes */}
              <Route
                path="/add-quiz"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <AddQuiz />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit-quiz/:id"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <EditQuiz />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/quizzes/:quizId/questions"
                element={
                  <ProtectedRoute>
                    <QuizQuestions />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/quizzes/:quizId/add-question"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <AddQuestion />
                  </ProtectedRoute>
                }
              />

              {/* Student Quiz Routes */}
              <Route
                path="/take-quiz/:id"
                element={
                  <ProtectedRoute roles={['STUDENT']}>
                    <TakeQuiz />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/result/:id"
                element={
                  <ProtectedRoute>
                    <Result />
                  </ProtectedRoute>
                }
              />

              {/* Analytics */}
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/students"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/quizzes"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/courses"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/courses/:courseId"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />

              {/* Leaderboards */}
              <Route
                path="/leaderboards"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboards/:id"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/leaderboards"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/leaderboards/create"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />

              {/* Achievements & Badges */}
              <Route
                path="/achievements"
                element={
                  <ProtectedRoute>
                    <Achievements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/achievements"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <Achievements />
                  </ProtectedRoute>
                }
              />

              {/* Admin Route */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />

              {/* Proctoring Dashboard for Educators & Admins */}
              <Route
                path="/teacher/proctoring"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <ProctoringDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/proctoring"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <ProctoringDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Mentor / Chat Routes */}
              <Route
                path="/mentor/chat"
                element={
                  <ProtectedRoute>
                    <MentorChat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor/chat/:withUserId"
                element={
                  <ProtectedRoute>
                    <MentorChat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-mentees"
                element={
                  <ProtectedRoute roles={['ADMIN', 'EDUCATOR']}>
                    <MyMentees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </main>

        </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;