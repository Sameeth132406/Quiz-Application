import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import analyticsService from '../services/analyticsService';
import courseService from '../services/courseService';
import quizService from '../services/quizService';
import userService from '../services/userService';
import { ScoreTrendChart, ScoreDistributionDonut, BarChartComponent, ProgressComparisonBar } from '../components/PerformanceCharts';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const StudentFullAnalyticsView = ({ studentData, isEducatorView = false }) => {
  if (!studentData) return null;

  return (
    <div style={{ marginTop: isEducatorView ? '1rem' : '0' }}>
      {/* 1. Student Profile Header (in Educator drill-down mode) */}
      {isEducatorView && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderRadius: '12px',
          border: '1px solid #bfdbfe',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: '800'
          }}>
            {(studentData.studentName || 'S')[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
              {studentData.studentName}
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#3b82f6', fontWeight: '600' }}>
              Student ID: {studentData.studentId} • Enrolled in {studentData.coursesEnrolledCount || 0} Courses • {studentData.badgesEarnedCount || 0} Badges Earned
            </div>
          </div>
        </div>
      )}

      {/* 6 KPI Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ borderLeft: '4px solid #ef4444', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
            TOTAL ATTEMPTS
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444', margin: '0.25rem 0' }}>
            {studentData.totalAttempts || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Submitted assessments</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #3b82f6', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
            AVERAGE SCORE
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#3b82f6', margin: '0.25rem 0' }}>
            {studentData.averagePercentage != null ? `${studentData.averagePercentage}%` : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Mean: {studentData.averageScore} pts</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
            HIGHEST SCORE
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981', margin: '0.25rem 0' }}>
            {studentData.highestScore != null ? studentData.highestScore : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Personal best points</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #f59e0b', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
            LOWEST SCORE
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b', margin: '0.25rem 0' }}>
            {studentData.lowestScore != null ? studentData.lowestScore : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Minimum score record</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #8b5cf6', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
            PASSED ASSESSMENTS
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#8b5cf6', margin: '0.25rem 0' }}>
            {studentData.passedAssessments || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{studentData.passRate || 0}% overall pass rate</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #06b6d4', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
            COURSE PROGRESS
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#06b6d4', margin: '0.25rem 0' }}>
            {studentData.coursesCompletedCount || 0} / {studentData.coursesEnrolledCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Courses completed</div>
        </div>
      </div>

      {/* 2. Visual Graphs & Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Progression Line */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem', color: '#0f172a' }}>
            📈 Score Progression Trendline
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Score percentage trajectory over assessment submissions
          </p>
          <ScoreTrendChart attempts={studentData.assessmentHistory || []} />
        </div>

        {/* Mastery Breakdown */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem', color: '#0f172a' }}>
            🎯 Assessment Mastery Tier Distribution
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Attempts categorized by performance mastery level
          </p>
          <ScoreDistributionDonut attempts={studentData.assessmentHistory || []} />
        </div>
      </div>

      {/* 3. Quiz-wise Performance Breakdown */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem', color: '#0f172a' }}>
          📊 Quiz-wise Performance & Mastery
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Performance metrics across all quizzes attempted by this student
        </p>

        {studentData.quizBreakdowns && studentData.quizBreakdowns.length > 0 ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <BarChartComponent
                items={studentData.quizBreakdowns.map(q => ({
                  label: q.quizTitle,
                  value: q.bestPercentage,
                  secondaryText: `${q.bestScore} pts • ${q.attemptsCount} tests`,
                  color: q.passed ? '#10b981' : '#f59e0b'
                }))}
                unit="%"
                title="Quiz Mastery Score Comparison"
              />
            </div>

            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Quiz Title</th>
                    <th>Category</th>
                    <th>Attempts</th>
                    <th>Best Score</th>
                    <th>Average Score</th>
                    <th>Percentage</th>
                    <th>Mastery Status</th>
                    <th>Last Attempt</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.quizBreakdowns.map(q => (
                    <tr key={q.quizId}>
                      <td><strong>{q.quizTitle}</strong></td>
                      <td><span className="badge badge-easy">{q.category}</span></td>
                      <td><span className="badge badge-role">{q.attemptsCount}</span></td>
                      <td><strong style={{ color: '#0f172a' }}>{q.bestScore} pts</strong></td>
                      <td style={{ color: '#64748b' }}>{q.averageScore} pts</td>
                      <td>
                        <span style={{
                          fontWeight: '800',
                          color: q.bestPercentage >= 85 ? '#15803d' : q.bestPercentage >= 70 ? '#2563eb' : q.bestPercentage >= 50 ? '#d97706' : '#dc2626'
                        }}>
                          {q.bestPercentage}%
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          background: q.passed ? '#dcfce7' : '#fee2e2',
                          color: q.passed ? '#15803d' : '#b91c1c'
                        }}>
                          {q.passed ? '✓ Mastered' : 'Needs Review'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{q.lastAttemptedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            No quizzes completed by this student yet.
          </div>
        )}
      </div>

      {/* 4. Course Enrollment & Completion Progress */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem', color: '#0f172a' }}>
          🎓 Course Enrollment & Curriculum Completion
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Syllabus progress, module milestones, and course quiz performance
        </p>

        {studentData.enrolledCourses && studentData.enrolledCourses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {studentData.enrolledCourses.map((c) => (
              <div key={c.courseId} style={{
                padding: '1.25rem',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>{c.courseTitle}</span>
                    <span style={{
                      marginLeft: '0.6rem',
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      background: c.progressPercentage >= 100 ? '#dcfce7' : '#eff6ff',
                      color: c.progressPercentage >= 100 ? '#15803d' : '#1d4ed8',
                      fontWeight: '700'
                    }}>
                      {c.progressPercentage >= 100 ? '✅ Completed' : 'In Progress'}
                    </span>
                  </div>
                  <Link to={`/courses/${c.courseId}`} style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: '#2563eb',
                    textDecoration: 'none'
                  }}>
                    Course Details &rarr;
                  </Link>
                </div>

                <ProgressComparisonBar
                  label="Curriculum Modules Completed"
                  current={c.modulesCompleted}
                  total={c.totalModules || 1}
                  color="#2563eb"
                />

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#475569', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span>📝 Quizzes Taken: <strong>{c.quizzesAttempted}</strong></span>
                  <span>📈 Course Avg Quiz Score: <strong>{c.averageQuizScore} pts</strong></span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            Student is not currently enrolled in any academic courses.
          </div>
        )}
      </div>

      {/* 5. Comprehensive Assessment History */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem', color: '#0f172a' }}>
          📝 Individual Assessment History
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Full audit trail of all quiz submissions, evaluation marks, and release status
        </p>

        <div className="table-container" style={{ margin: 0 }}>
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Quiz Assessment</th>
                <th>Completed At</th>
                <th>Result Status</th>
                <th>Score Obtained</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th style={{ textAlign: 'right' }}>Review</th>
              </tr>
            </thead>
            <tbody>
              {!studentData.assessmentHistory || studentData.assessmentHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No assessment attempts recorded yet.
                  </td>
                </tr>
              ) : (
                studentData.assessmentHistory.map((att) => (
                  <tr key={att.attemptId}>
                    <td><strong>{att.quizTitle}</strong></td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {att.completedAt ? new Date(att.completedAt).toLocaleString() : 'Recent'}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        background: att.resultsPublished ? '#f0fdf4' : '#fffbeb',
                        color: att.resultsPublished ? '#15803d' : '#b45309',
                        border: `1px solid ${att.resultsPublished ? '#bbf7d0' : '#fde68a'}`
                      }}>
                        {att.resultsPublished ? '✅ Published' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>
                      <span><strong>{att.score}</strong> / {att.totalMarks}</span>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: '700',
                        color: att.percentage >= 50 ? '#15803d' : '#dc2626'
                      }}>
                        {att.percentage}%
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: '800',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: att.percentage >= 50 ? '#dcfce7' : '#fee2e2',
                        color: att.percentage >= 50 ? '#15803d' : '#b91c1c',
                        fontSize: '0.75rem'
                      }}>
                        {att.grade}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/result/${att.attemptId}`}
                        style={{
                          color: '#2563eb',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          textDecoration: 'none',
                          padding: '0.3rem 0.6rem',
                          background: '#eff6ff',
                          borderRadius: '6px',
                          border: '1px solid #bfdbfe'
                        }}
                      >
                        Review &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Earned Badges & Achievements */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem', color: '#0f172a' }}>
          🏆 Earned Badges & Achievements ({studentData.badgesEarnedCount || 0})
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Prestige milestones and skill achievements earned by this student
        </p>

        {studentData.earnedBadges && studentData.earnedBadges.filter(b => b.achieved).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {studentData.earnedBadges.filter(b => b.achieved).map(b => (
              <div key={b.badgeId || b.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderRadius: '10px'
              }}>
                <span style={{ fontSize: '1.8rem' }}>{b.badgeIconUrl || '🏆'}</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: '#92400e' }}>{b.badgeName}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#b45309' }}>{b.badgeDescription}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
            No achievement badges unlocked yet.
          </div>
        )}
      </div>
    </div>
  );
};

const Analytics = () => {
  const { role } = useContext(AuthContext);

  const isStaff = role === 'ADMIN' || role === 'EDUCATOR';

  // Navigation tab for Educator: 'OVERVIEW' | 'BY_STUDENT' | 'BY_QUIZ' | 'BY_COURSE' | 'LEADERBOARDS'
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  // Filters
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Data states
  const [educatorData, setEducatorData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [coursesList, setCoursesList] = useState([]);
  const [quizzesList, setQuizzesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);

  // Selected drill-down states
  const [selectedStudentData, setSelectedStudentData] = useState(null);
  const [loadingStudentData, setLoadingStudentData] = useState(false);
  const [selectedQuizData, setSelectedQuizData] = useState(null);
  const [selectedCourseData, setSelectedCourseData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch initial dropdown metadata (courses, quizzes, students)
  useEffect(() => {
    if (isStaff) {
      Promise.all([
        courseService.getAllCourses().catch(() => []),
        quizService.getQuizzes().catch(() => []),
        userService.getAllUsers().catch(() => [])
      ]).then(([cList, qList, uList]) => {
        setCoursesList(Array.isArray(cList) ? cList : []);
        setQuizzesList(Array.isArray(qList) ? qList : []);
        setStudentsList(Array.isArray(uList) ? uList.filter(u => u.role === 'STUDENT') : []);
      });
    }
  }, [isStaff]);

  // Main fetch data function
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (isStaff) {
        // Educator Analytics
        const params = {};
        if (selectedCourseId) params.courseId = selectedCourseId;
        if (selectedQuizId) params.quizId = selectedQuizId;
        if (selectedStudentId) params.studentId = selectedStudentId;

        const data = await analyticsService.getEducatorAnalytics(params);
        setEducatorData(data);

        // If a specific student is selected, fetch their detailed individual analytics
        if (selectedStudentId) {
          setLoadingStudentData(true);
          try {
            const sAnalytics = await analyticsService.getStudentAnalytics(selectedStudentId);
            setSelectedStudentData(sAnalytics);
          } catch (e) {
            console.error('Failed to load student analytics', e);
            setSelectedStudentData(null);
          } finally {
            setLoadingStudentData(false);
          }
        } else {
          setSelectedStudentData(null);
        }

        // If a specific quiz is selected, fetch its detailed breakdown
        if (selectedQuizId) {
          const qAnalytics = await analyticsService.getQuizAnalytics(selectedQuizId).catch(() => null);
          setSelectedQuizData(qAnalytics);
        } else {
          setSelectedQuizData(null);
        }

        // If a specific course is selected, fetch its detailed breakdown
        if (selectedCourseId) {
          const cAnalytics = await analyticsService.getCourseAnalytics(selectedCourseId).catch(() => null);
          setSelectedCourseData(cAnalytics);
        } else {
          setSelectedCourseData(null);
        }

      } else {
        // Student Analytics
        const myData = await analyticsService.getMyAnalytics();
        setStudentData(myData);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
      setError('Failed to load performance metrics from the server.');
    } finally {
      setLoading(false);
    }
  }, [isStaff, selectedCourseId, selectedQuizId, selectedStudentId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const resetFilters = () => {
    setSelectedStudentId('');
    setSelectedQuizId('');
    setSelectedCourseId('');
  };

  if (loading && !educatorData && !studentData) {
    return <Loading message="Loading advanced analytics & performance intelligence..." />;
  }

  // ==========================================
  // RENDER: STUDENT VIEW
  // ==========================================
  if (!isStaff) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Student Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>
              My Performance Analytics
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Personal score progression, course completions, and assessment milestones
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/achievements" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 8px rgba(217,119,6,0.25)'
              }}>
                🏆 My Achievements ({studentData?.badgesEarnedCount || 0})
              </button>
            </Link>
            <Link to="/leaderboards" style={{ textDecoration: 'none' }}>
              <button style={{
                background: '#ffffff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                🥇 View Leaderboard
              </button>
            </Link>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchAnalytics} />}

        {/* Complete Interactive Student Performance & Analytics */}
        <StudentFullAnalyticsView studentData={studentData} isEducatorView={false} />
      </div>
    );
  }

  // ==========================================
  // RENDER: EDUCATOR / ADMIN VIEW
  // ==========================================
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Title & Leaderboard CTA */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>
            Educator Analytics & Intelligence
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Comprehensive performance metrics, student evaluation insights, and cross-course analytics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/leaderboards" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
            }}>
              🏆 Course Leaderboards
            </button>
          </Link>
          <Link to="/achievements" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}>
              🎖️ Achievement Rules
            </button>
          </Link>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🔍 Filter Analytics By:
          </span>
          {(selectedStudentId || selectedQuizId || selectedCourseId) && (
            <button
              onClick={resetFilters}
              style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#dc2626',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ✕ Clear All Filters
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          {/* Select Student */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.35rem' }}>
              Student:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                background: '#ffffff',
                color: '#0f172a'
              }}
            >
              <option value="">All Students ({studentsList.length})</option>
              {studentsList.map(s => (
                <option key={s.id} value={s.id}>{s.username} ({s.email})</option>
              ))}
            </select>
          </div>

          {/* Select Quiz */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.35rem' }}>
              Quiz Assessment:
            </label>
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                background: '#ffffff',
                color: '#0f172a'
              }}
            >
              <option value="">All Quizzes ({quizzesList.length})</option>
              {quizzesList.map(q => (
                <option key={q.id} value={q.id}>{q.title} ({q.category || 'General'})</option>
              ))}
            </select>
          </div>

          {/* Select Course */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.35rem' }}>
              Course:
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                background: '#ffffff',
                color: '#0f172a'
              }}
            >
              <option value="">All Courses ({coursesList.length})</option>
              {coursesList.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'OVERVIEW', label: '📊 Overview' },
          { key: 'BY_STUDENT', label: '👤 By Student' },
          { key: 'BY_QUIZ', label: '📝 By Quiz' },
          { key: 'BY_COURSE', label: '🎓 By Course' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.65rem 1.25rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === tab.key ? '#2563eb' : '#64748b',
              borderBottom: activeTab === tab.key ? '3px solid #2563eb' : '3px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================== */}
      {activeTab === 'OVERVIEW' && (
        <>
          {/* 6 OVERALL STATISTICS KPI CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>TOTAL STUDENTS</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '0.3rem 0' }}>
                {educatorData?.totalStudents || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Unique learners active</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>TOTAL ATTEMPTS</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#3b82f6', margin: '0.3rem 0' }}>
                {educatorData?.totalAttempts || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Assessment submissions</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>AVERAGE SCORE</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981', margin: '0.3rem 0' }}>
                {educatorData?.averagePercentage || 0}%
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Mean student score</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>HIGHEST SCORE</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b', margin: '0.3rem 0' }}>
                {educatorData?.highestScore || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Peak points achieved</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>LOWEST SCORE</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444', margin: '0.3rem 0' }}>
                {educatorData?.lowestScore || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Minimum score record</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>COMPLETION RATE</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#8b5cf6', margin: '0.3rem 0' }}>
                {educatorData?.completionRate || 0}%
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Assessment completion</div>
            </div>
          </div>

          {/* Performance Overview Chart */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>
                📈 Student Performance Ranking
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem' }}>
                Average score percentage comparison across learners
              </p>
              <BarChartComponent
                items={(educatorData?.studentPerformance || []).slice(0, 7).map(s => ({
                  label: s.studentName,
                  value: s.averagePercentage,
                  secondaryText: `${s.attempts} attempts`,
                  color: s.averagePercentage >= 70 ? '#10b981' : s.averagePercentage >= 50 ? '#3b82f6' : '#ef4444'
                }))}
                unit="%"
              />
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>
                📊 Quiz Pass Rate Comparison
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem' }}>
                Pass rates across active quiz assessments
              </p>
              <BarChartComponent
                items={(educatorData?.quizPerformance || []).map(q => ({
                  label: q.quizTitle,
                  value: q.passRate,
                  secondaryText: `${q.attempts} tests`,
                  color: '#2563eb'
                }))}
                unit="%"
              />
            </div>
          </div>

          {/* STUDENT PERFORMANCE TABLE */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                  Student Performance Breakdown
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Learners sorted by average assessment score
                </p>
              </div>
            </div>

            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Attempts</th>
                    <th>Avg Score</th>
                    <th>Highest Score</th>
                    <th>Last Active</th>
                    <th style={{ textAlign: 'right' }}>Drill Down</th>
                  </tr>
                </thead>
                <tbody>
                  {educatorData?.studentPerformance?.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        No student performance records found for this filter.
                      </td>
                    </tr>
                  ) : (
                    educatorData?.studentPerformance?.map(s => (
                      <tr key={s.studentId}>
                        <td><strong>{s.studentName}</strong></td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.studentEmail || '—'}</td>
                        <td><span className="badge badge-role">{s.attempts}</span></td>
                        <td>
                          <span style={{
                            fontWeight: '700',
                            color: s.averagePercentage >= 70 ? '#15803d' : s.averagePercentage >= 50 ? '#2563eb' : '#dc2626'
                          }}>
                            {s.averagePercentage}% ({s.averageScore})
                          </span>
                        </td>
                        <td><strong style={{ color: '#0f172a' }}>{s.highestScore}</strong></td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.lastActive}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setSelectedStudentId(String(s.studentId));
                              setActiveTab('BY_STUDENT');
                            }}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: '#2563eb',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              padding: '0.28rem 0.6rem',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            View Student &rarr;
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* QUIZ PERFORMANCE TABLE */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                  Quiz Performance Metrics
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Metrics aggregated per assessment title
                </p>
              </div>
            </div>

            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Quiz Title</th>
                    <th>Category</th>
                    <th>Attempts</th>
                    <th>Avg Score</th>
                    <th>Pass Rate</th>
                    <th style={{ textAlign: 'right' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {educatorData?.quizPerformance?.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        No quizzes found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    educatorData?.quizPerformance?.map(q => (
                      <tr key={q.quizId}>
                        <td><strong>{q.quizTitle}</strong></td>
                        <td><span className="badge badge-easy">{q.category}</span></td>
                        <td>{q.attempts}</td>
                        <td><strong>{q.averageScore}</strong> ({q.averagePercentage}%)</td>
                        <td>
                          <span style={{
                            fontWeight: '700',
                            color: q.passRate >= 70 ? '#15803d' : '#d97706'
                          }}>
                            {q.passRate}%
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setSelectedQuizId(String(q.quizId));
                              setActiveTab('BY_QUIZ');
                            }}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: '#2563eb',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              padding: '0.28rem 0.6rem',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Drill Down &rarr;
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* COURSE PERFORMANCE TABLE */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>
              Course Performance Overview
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
              Enrolled students and completion milestones across courses
            </p>

            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Enrolled Students</th>
                    <th>Completed Students</th>
                    <th>Completion Rate</th>
                    <th>Avg Progress</th>
                    <th>Quizzes</th>
                    <th style={{ textAlign: 'right' }}>View Course</th>
                  </tr>
                </thead>
                <tbody>
                  {educatorData?.coursePerformance?.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        No courses recorded yet.
                      </td>
                    </tr>
                  ) : (
                    educatorData?.coursePerformance?.map(c => (
                      <tr key={c.courseId}>
                        <td><strong>{c.courseTitle}</strong></td>
                        <td>{c.enrolledStudents}</td>
                        <td>{c.completedStudents}</td>
                        <td>
                          <span style={{ fontWeight: '700', color: c.completionRate >= 50 ? '#15803d' : '#64748b' }}>
                            {c.completionRate}%
                          </span>
                        </td>
                        <td>{c.averageScore}%</td>
                        <td>{c.quizzesCount}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setSelectedCourseId(String(c.courseId));
                              setActiveTab('BY_COURSE');
                            }}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: '#2563eb',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              padding: '0.28rem 0.6rem',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Explore &rarr;
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================== */}
      {/* TAB 2: BY STUDENT */}
      {/* ========================================== */}
      {activeTab === 'BY_STUDENT' && (
        <div>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
              👤 Individual Student Analytics Drill-Down
            </h3>
            <div style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.35rem' }}>
                Select Student to Inspect:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              >
                <option value="">-- Choose a Student --</option>
                {studentsList.map(s => (
                  <option key={s.id} value={s.id}>{s.username} ({s.email})</option>
                ))}
              </select>
            </div>

            {!selectedStudentId ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                <div style={{ fontWeight: '700', color: '#475569' }}>Please choose a student from the dropdown above</div>
                <div style={{ fontSize: '0.82rem' }}>You will see their complete assessment history, score trend, quiz-wise breakdown, curriculum milestones, and earned badges.</div>
              </div>
            ) : loadingStudentData ? (
              <Loading message="Loading comprehensive student analytics & performance intelligence..." />
            ) : selectedStudentData ? (
              <StudentFullAnalyticsView studentData={selectedStudentData} isEducatorView={true} />
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                No performance data found for the selected student.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: BY QUIZ */}
      {/* ========================================== */}
      {activeTab === 'BY_QUIZ' && (
        <div>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
              📝 Quiz Assessment Analytics
            </h3>
            <div style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.35rem' }}>
                Select Quiz Assessment:
              </label>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              >
                <option value="">-- Choose a Quiz --</option>
                {quizzesList.map(q => (
                  <option key={q.id} value={q.id}>{q.title} ({q.category || 'General'})</option>
                ))}
              </select>
            </div>

            {!selectedQuizId ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
                <div style={{ fontWeight: '700', color: '#475569' }}>Please choose a quiz assessment from the dropdown above</div>
                <div style={{ fontSize: '0.82rem' }}>You will see pass rates, student attempts breakdown, and question stats.</div>
              </div>
            ) : selectedQuizData ? (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>TOTAL ATTEMPTS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2563eb' }}>{selectedQuizData.totalAttempts}</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>UNIQUE STUDENTS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{selectedQuizData.uniqueStudents}</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>AVERAGE SCORE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>{selectedQuizData.averageScore}</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>PASS RATE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#8b5cf6' }}>{selectedQuizData.passRate}%</div>
                  </div>
                </div>

                {/* Attempt Details Table */}
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
                  Student Submissions for {selectedQuizData.quizTitle}
                </h4>
                <div className="table-container" style={{ margin: 0 }}>
                  <table className="custom-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Completed At</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Integrity</th>
                        <th style={{ textAlign: 'right' }}>Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuizData.attemptDetails?.map(att => (
                        <tr key={att.attemptId}>
                          <td><strong>{att.studentName}</strong></td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(att.completedAt).toLocaleString()}</td>
                          <td><strong>{att.score}</strong> / {att.totalMarks}</td>
                          <td>
                            <span style={{ fontWeight: '700', color: att.percentage >= 50 ? '#15803d' : '#dc2626' }}>
                              {att.percentage}%
                            </span>
                          </td>
                          <td>
                            <span className={`integrity-badge-indicator ${att.tabSwitches === 0 ? 'clean' : 'warning'}`}>
                              {att.tabSwitches === 0 ? '🛡️ Clean (0)' : `⚠️ ${att.tabSwitches} Switches`}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Link to={`/result/${att.attemptId}`} style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none', fontSize: '0.78rem' }}>
                              Review &rarr;
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>Loading quiz details...</div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: BY COURSE */}
      {/* ========================================== */}
      {activeTab === 'BY_COURSE' && (
        <div>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
              🎓 Course Analytics & Completion Metrics
            </h3>
            <div style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.35rem' }}>
                Select Course to Inspect:
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              >
                <option value="">-- Choose a Course --</option>
                {coursesList.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {!selectedCourseId ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
                <div style={{ fontWeight: '700', color: '#475569' }}>Please choose a course from the dropdown above</div>
                <div style={{ fontSize: '0.82rem' }}>You will see student enrollments, curriculum completion rates, and course leaderboard.</div>
              </div>
            ) : selectedCourseData ? (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ENROLLED STUDENTS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2563eb' }}>{selectedCourseData.totalEnrolledStudents}</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>COMPLETION RATE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>{selectedCourseData.courseCompletionPercentage}%</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>COURSE QUIZZES</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b' }}>{selectedCourseData.totalQuizzes}</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>AVERAGE QUIZ SCORE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#8b5cf6' }}>{selectedCourseData.averageQuizScore}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <Link to={`/courses/${selectedCourseId}`} style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: '#2563eb',
                    textDecoration: 'none'
                  }}>
                    Open Full Course Page &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div>Loading course details...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
