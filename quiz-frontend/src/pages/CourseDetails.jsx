import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';
import analyticsService from '../services/analyticsService';
import leaderboardService from '../services/leaderboardService';
import badgeService from '../services/badgeService';
import mentorService from '../services/mentorService';
import { LineChartComponent } from '../components/PerformanceCharts';
import Loading from '../components/Loading';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' or 'analytics'

  // Course Analytics State
  const [courseAnalytics, setCourseAnalytics] = useState(null);
  const [courseLeaderboard, setCourseLeaderboard] = useState(null);
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);
  const [courseBadges, setCourseBadges] = useState([]);

  // Mentor state
  const [mentorInfo, setMentorInfo] = useState(null);
  const [educators, setEducators] = useState([]);
  const [showMentorPanel, setShowMentorPanel] = useState(false);
  const [selectedEducatorId, setSelectedEducatorId] = useState('');
  const [assigningMentor, setAssigningMentor] = useState(false);
  const [mentorMsg, setMentorMsg] = useState('');

  const loadEducators = async () => {
    try {
      const data = await mentorService.getEducators();
      setEducators(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load educators', err);
    }
  };

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const data = await courseService.getCourseById(id);
      setCourse(data);
      if (role === 'STUDENT' && data.isEnrolled) {
        fetchCourseAnalyticsData();
      }
      if (data.isEnrolled && role === 'STUDENT') {
        mentorService.getMyMentor(id).then(m => setMentorInfo(m)).catch(() => {});
      }
      // Always pre-load educators
      loadEducators();
    } catch (err) {
      console.error('Failed to load course details', err);
      setError('Course not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseAnalyticsData = async () => {
    try {
      // 1. Fetch course analytics
      let analyticsData = null;
      if (role === 'STUDENT') {
        analyticsData = await analyticsService.getMyCourseAnalytics(id).catch(() => null);
      } else {
        analyticsData = await analyticsService.getCourseAnalytics(id).catch(() => null);
      }
      setCourseAnalytics(analyticsData);

      // 2. Fetch course leaderboards
      const lbs = await leaderboardService.getCourseLeaderboards(id).catch(() => []);
      if (lbs && lbs.length > 0) {
        const activeLb = lbs[0];
        setCourseLeaderboard(activeLb);
        const entries = await leaderboardService.getLeaderboardEntries(activeLb.id).catch(() => []);
        setLeaderboardEntries(entries || []);
      }

      // 3. Fetch badges for this course
      if (role === 'STUDENT') {
        const myBadges = await badgeService.getMyBadges().catch(() => []);
        const related = (myBadges || []).filter(b => !b.courseId || String(b.courseId) === String(id));
        setCourseBadges(related);
      }
    } catch (err) {
      console.error('Failed to fetch course analytics data', err);
    }
  };

  useEffect(() => {
    fetchCourse();
    if (role !== 'STUDENT') {
      setActiveTab('curriculum');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, role]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await enrollmentService.enrollCourse(id);
      await fetchCourse();
    } catch (err) {
      console.error('Enrollment failed', err);
      alert(err.response?.data?.message || 'Failed to enroll in this course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleAssignMentor = async () => {
    if (!selectedEducatorId) return;
    setAssigningMentor(true);
    setMentorMsg('');
    try {
      await mentorService.assignMentor(Number(selectedEducatorId), Number(id));
      const updated = await mentorService.getMyMentor(id);
      setMentorInfo(updated);
      setShowMentorPanel(false);
      setMentorMsg('Mentor assigned successfully.');
    } catch (err) {
      setMentorMsg('Failed to assign mentor. Please try again.');
    } finally {
      setAssigningMentor(false);
    }
  };

  const handleUnassignMentor = async () => {
    setAssigningMentor(true);
    try {
      await mentorService.unassignMentor(Number(id));
      setMentorInfo({ assigned: false });
      setMentorMsg('Mentor removed.');
    } catch (err) {
      setMentorMsg('Failed to remove mentor.');
    } finally {
      setAssigningMentor(false);
    }
  };

  if (loading) return <Loading />;
  if (error || !course) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h3>{error || 'Course not found'}</h3>
        <Link to="/courses" className="btn-secondary-course" style={{ marginTop: '1rem' }}>
          Back to Courses
        </Link>
      </div>
    );
  }

  const isOwner = role === 'ADMIN' || (role === 'EDUCATOR' && course.educatorId === user?.id);
  const showAnalyticsTab = role === 'STUDENT' && Boolean(course.isEnrolled);

  // Format trend data for LineChartComponent
  const trendData = (courseAnalytics?.studentPerformances || []).map((p, idx) => ({
    label: p.studentName || `Quiz ${idx + 1}`,
    score: p.highestScore || p.averageScore || 0
  }));

  return (
    <div className="course-page-container">
      <div className="course-details-layout">
        {/* Main Column */}
        <div className="details-main-column">
          {/* Hero Card */}
          <div className="course-hero-card">
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {course.category && (
                <span className="badge-category" style={{ background: '#f1f5f9', color: '#475569' }}>
                  {course.category}
                </span>
              )}
              {course.difficulty && (
                <span className={`badge-difficulty diff-${course.difficulty.toLowerCase()}`}>
                  {course.difficulty}
                </span>
              )}
              {course.status && (
                <span className={`badge-status status-${course.status.toLowerCase()}`}>
                  {course.status}
                </span>
              )}
            </div>

            <h1>{course.title || course.courseName}</h1>

            <div className="course-hero-meta">
              <span>Instructor: <strong>{course.createdBy || course.instructor || 'Educator'}</strong></span>
              {course.duration && <span>Duration: <strong>{course.duration}</strong></span>}
              <span>Modules: <strong>{course.modules ? course.modules.length : 0}</strong></span>
              {course.studentsCount !== undefined && <span>Students: <strong>{course.studentsCount}</strong></span>}
            </div>

            <div style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {course.description}
            </div>
          </div>

          {/* Enrolled Student Overview & Quick Actions */}
          {role === 'STUDENT' && course.isEnrolled && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                {/* Mentor Overview */}
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
                    Assigned Mentor
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                    {mentorInfo?.assigned ? mentorInfo.educatorName : 'Not Assigned Yet'}
                  </div>
                  {mentorInfo?.assigned && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {mentorInfo.educatorEmail}
                    </div>
                  )}
                </div>

                <div style={{ width: '1px', height: '36px', background: '#e2e8f0' }} />

                {/* Progress Overview */}
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
                    Course Progress
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563eb', marginTop: '0.2rem' }}>
                    {course.progressPercentage !== undefined ? course.progressPercentage : 0}% Complete
                  </div>
                </div>

                {courseAnalytics && (
                  <>
                    <div style={{ width: '1px', height: '36px', background: '#e2e8f0' }} />
                    <div>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
                        Assessment Average
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginTop: '0.2rem' }}>
                        {courseAnalytics.averageScore || 0}%
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {mentorInfo?.assigned && (
                  <button
                    onClick={() => navigate(`/mentor/chat/${mentorInfo.educatorId}`)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#1e293b',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Chat with Mentor
                  </button>
                )}
                <button
                  onClick={() => setActiveTab(activeTab === 'analytics' ? 'curriculum' : 'analytics')}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#1e293b',
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {activeTab === 'analytics' ? 'View Curriculum' : 'View Performance'}
                </button>
                <Link
                  to={`/courses/${course.id}/learn`}
                  className="btn-primary-course"
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Continue Learning ➔
                </Link>
              </div>
            </div>
          )}

          {/* Section Navigation Tabs */}
          {showAnalyticsTab && (
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setActiveTab('curriculum')}
                style={{
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === 'curriculum' ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === 'curriculum' ? '#2563eb' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                Course Curriculum
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                style={{
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === 'analytics' ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === 'analytics' ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                My Performance & Analytics
              </button>
            </div>
          )}

          {/* Tab 1: Curriculum & Syllabus */}
          {activeTab === 'curriculum' && (
            <div className="syllabus-section">
              <h2 className="syllabus-title">Course Curriculum & Syllabus</h2>

              {course.modules && course.modules.length > 0 ? (
                course.modules.map((mod, index) => (
                  <div key={mod.id} className="module-accordion-item">
                    <div className="module-header">
                      <span className="module-header-title">
                        <span>Module {index + 1}: {mod.title}</span>
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {mod.contents ? mod.contents.length : 0} Items {mod.quizId ? '+ Quiz' : ''}
                      </span>
                    </div>

                    <div className="module-content-list">
                      {mod.description && (
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          {mod.description}
                        </p>
                      )}

                      {mod.contents && mod.contents.map((item) => (
                        <div key={item.id} className="content-row-item">
                          <div className="content-item-left">
                            <span className="content-type-icon">
                              {item.contentType === 'VIDEO' ? '🎥' :
                               item.contentType === 'PDF' ? '📄' :
                               item.contentType === 'AUDIO' ? '🎵' :
                               item.contentType === 'TEXT' ? '📝' :
                               item.contentType === 'LINK' ? '🔗' : '📁'}
                            </span>
                            <div>
                              <span style={{ fontWeight: 600 }}>{item.title}</span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                {item.duration || item.contentType}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {mod.quizId && (
                        <div className="content-row-item" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                          <div className="content-item-left">
                            <span className="content-type-icon">🧠</span>
                            <div>
                              <span style={{ fontWeight: 700, color: '#9a3412' }}>
                                Assessment: {mod.quizTitle || 'Module Assessment Quiz'}
                              </span>
                              {mod.quizDuration && (
                                <span style={{ fontSize: '0.78rem', color: '#c2410c', marginLeft: '0.5rem' }}>
                                  ({mod.quizDuration} mins)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Curriculum details are currently being organized for this course.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Individual Course Analytics (Student Only) */}
          {showAnalyticsTab && activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Course Progress Section */}
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Course Progress
                  </h3>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563eb' }}>
                    {Math.round(courseAnalytics?.courseProgressPercentage || 0)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.85rem' }}>
                  <div
                    style={{
                      width: `${Math.round(courseAnalytics?.courseProgressPercentage || 0)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                      borderRadius: '5px',
                      transition: 'width 0.4s ease'
                    }}
                  ></div>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  Modules Completed: <strong>{courseAnalytics?.completedModules || 0} / {courseAnalytics?.totalModules || course?.modules?.length || 0}</strong>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Quizzes Attempted
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                    {courseAnalytics?.totalAttempts || 0}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Avg Quiz Score
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: '0.25rem' }}>
                    {Math.round(courseAnalytics?.averageQuizScore || 0)}%
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Highest Score
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>
                    {courseAnalytics?.highestScore || 0}%
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Lowest Score
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>
                    {courseAnalytics?.lowestScore || 0}%
                  </div>
                </div>
              </div>

              {/* Quiz Performance Table */}
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>
                  Quiz Performance
                </h3>
                {courseAnalytics?.studentPerformances && courseAnalytics.studentPerformances.length > 0 ? (
                  <table className="gamification-table">
                    <thead>
                      <tr>
                        <th>Quiz</th>
                        <th>Score</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseAnalytics.studentPerformances.map((perf, index) => (
                        <tr key={index}>
                          <td style={{ fontWeight: 600 }}>{perf.studentName || `Assessment ${index + 1}`}</td>
                          <td>
                            <span className="score-badge">
                              {perf.highestScore || perf.averageScore || 0}%
                            </span>
                          </td>
                          <td>
                            <span className="badge-status status-published">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#64748b', margin: 0 }}>No quiz attempts recorded in this course yet.</p>
                )}
              </div>

              {/* Performance Trend Chart */}
              {trendData.length > 0 && (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>
                    Performance Trend
                  </h3>
                  <LineChartComponent data={trendData} height={180} />
                </div>
              )}

              {/* Course Achievements */}
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Course Achievements
                  </h3>
                  <Link to="/achievements" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                    View All Badges →
                  </Link>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                  {courseBadges.length > 0 ? (
                    courseBadges.map(b => (
                      <div
                        key={b.badgeId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          background: b.achieved ? '#fef3c7' : '#f8fafc',
                          border: b.achieved ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
                          padding: '0.5rem 0.85rem',
                          borderRadius: '8px'
                        }}
                      >
                        <span style={{ fontSize: '1.25rem' }}>{b.iconUrl || '🏆'}</span>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: b.achieved ? '#92400e' : '#64748b' }}>
                            {b.badgeName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: b.achieved ? '#b45309' : '#94a3b8' }}>
                            {b.achieved ? '✓ Earned' : `${b.progress || 0} / ${b.requirementValue || 1}`}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '0.88rem' }}>
                      Complete quizzes and course milestones to earn prestige badges!
                    </div>
                  )}
                </div>
              </div>

              {/* Course Leaderboard */}
              {courseLeaderboard && (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Course Leaderboard: {courseLeaderboard.title}
                    </h3>
                    <Link to="/leaderboards" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                      Full Leaderboard →
                    </Link>
                  </div>

                  {leaderboardEntries.length > 0 ? (
                    <table className="gamification-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Student</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboardEntries.slice(0, 5).map(entry => {
                          const isYou = entry.isCurrentUser || (user && entry.studentId === user.id);
                          return (
                            <tr key={entry.id || entry.studentId} className={isYou ? 'current-user-row' : ''}>
                              <td className="rank-cell">
                                {entry.rank === 1 ? '🥇 1' :
                                 entry.rank === 2 ? '🥈 2' :
                                 entry.rank === 3 ? '🥉 3' :
                                 entry.rank}
                              </td>
                              <td>
                                <span style={{ fontWeight: isYou ? 700 : 500 }}>
                                  {isYou ? 'You' : (entry.displayName || 'Student')}
                                </span>
                                {isYou && <span className="you-tag">You</span>}
                              </td>
                              <td className="score-cell">
                                {entry.score} pts ({Math.round(entry.percentage || 0)}%)
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: '#64748b', margin: 0 }}>No rankings recorded yet for this course.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="details-sidebar-column">
          <div className="details-sidebar-card">
            {course.thumbnailUrl ? (
              <div className="details-thumb-wrap">
                <img src={course.thumbnailUrl} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div className="details-thumb-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '3rem' }}>
                🎓
              </div>
            )}

            {/* Student Action: Enroll or Learn */}
            {role === 'STUDENT' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {course.isEnrolled ? (
                  <>
                    <div style={{ padding: '0.75rem', background: '#dcfce7', color: '#15803d', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontWeight: 700 }}>
                      You are enrolled in this course
                    </div>
                    <Link to={`/courses/${course.id}/learn`} className="btn-primary-course" style={{ textAlign: 'center', padding: '0.8rem' }}>
                      Continue Learning
                    </Link>

                    {/* Mentor Section */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '1rem',
                      marginTop: '0.25rem',
                    }}>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#374151', marginBottom: '0.65rem' }}>Your Mentor</div>

                      {mentorMsg && (
                        <div style={{ fontSize: '0.8rem', color: '#15803d', background: '#dcfce7', padding: '0.4rem 0.65rem', borderRadius: '6px', marginBottom: '0.65rem' }}>
                          {mentorMsg}
                        </div>
                      )}

                      {mentorInfo?.assigned ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontWeight: '800', fontSize: '0.9rem',
                            }}>
                              {(mentorInfo.educatorName || 'E')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{mentorInfo.educatorName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{mentorInfo.educatorEmail}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => navigate(`/mentor/chat/${mentorInfo.educatorId}`)}
                              style={{
                                flex: 1, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                color: '#fff', border: 'none', borderRadius: '7px',
                                padding: '0.55rem 0.85rem', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer',
                              }}
                            >
                              Chat
                            </button>
                            <button
                              onClick={handleUnassignMentor}
                              disabled={assigningMentor}
                              style={{
                                background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0',
                                borderRadius: '7px', padding: '0.55rem 0.85rem', fontSize: '0.82rem',
                                fontWeight: '600', cursor: 'pointer',
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {!showMentorPanel ? (
                            <button
                              onClick={() => {
                                loadEducators();
                                setShowMentorPanel(true);
                              }}
                              style={{
                                width: '100%', background: '#eff6ff', color: '#2563eb',
                                border: '1px solid #bfdbfe', borderRadius: '7px',
                                padding: '0.55rem', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer',
                              }}
                            >
                              Choose a Mentor
                            </button>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <select
                                value={selectedEducatorId}
                                onChange={(e) => setSelectedEducatorId(e.target.value)}
                                style={{
                                  width: '100%', padding: '0.55rem 0.75rem',
                                  border: '1px solid #e2e8f0', borderRadius: '7px',
                                  fontSize: '0.85rem', background: '#fff', color: '#0f172a',
                                }}
                              >
                                <option value="">Select an educator...</option>
                                {educators.map(edu => (
                                  <option key={edu.id} value={edu.id}>{edu.username}</option>
                                ))}
                              </select>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={handleAssignMentor}
                                  disabled={!selectedEducatorId || assigningMentor}
                                  style={{
                                    flex: 1, background: selectedEducatorId ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#94a3b8',
                                    color: '#fff', border: 'none', borderRadius: '7px',
                                    padding: '0.5rem', fontSize: '0.82rem', fontWeight: '700',
                                    cursor: selectedEducatorId ? 'pointer' : 'not-allowed',
                                  }}
                                >
                                  {assigningMentor ? 'Assigning...' : 'Assign'}
                                </button>
                                <button
                                  onClick={() => setShowMentorPanel(false)}
                                  style={{
                                    background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0',
                                    borderRadius: '7px', padding: '0.5rem 0.75rem', fontSize: '0.82rem', cursor: 'pointer',
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="btn-primary-course"
                    style={{ padding: '0.85rem', fontSize: '1rem', width: '100%' }}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll in Course (Free)'}
                  </button>
                )}
              </div>
            )}

            {/* Educator / Admin Controls */}
            {isOwner && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Instructor Management
                </div>
                <Link to={`/courses/${course.id}/manage`} className="btn-primary-course" style={{ textAlign: 'center' }}>
                  Manage Modules & Content
                </Link>
                <Link to={`/courses/${course.id}/edit`} className="btn-secondary-course" style={{ textAlign: 'center' }}>
                  Edit Course Info
                </Link>
                <Link to={`/courses/${course.id}/students`} className="btn-secondary-course" style={{ textAlign: 'center' }}>
                  View Enrolled Students ({course.studentsCount || 0})
                </Link>
              </div>
            )}

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div>• Access on mobile and desktop</div>
              <div>• Interactive media and quizzes</div>
              <div>• Trackable progress and certificate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
