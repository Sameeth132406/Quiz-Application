import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import './styles/global.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/quiz.css';
import './styles/question.css';
import './styles/responsive.css';

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
import AdminUsers from './pages/AdminUsers';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
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

              {/* Admin / Educator */}
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

              {/* Student Quiz */}
              <Route
                path="/take-quiz/:id"
                element={
                  <ProtectedRoute>
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

              {/* Admin */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </main>

        </div>
      </Router>
    </AuthProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);