import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import leaderboardService from '../services/leaderboardService';
import courseService from '../services/courseService';
import quizService from '../services/quizService';
import Loading from '../components/Loading';

const Leaderboard = () => {
  const { id } = useParams();
  const { user, role } = useContext(AuthContext);
  const isEducatorOrAdmin = role === 'ADMIN' || role === 'EDUCATOR';

  const [leaderboards, setLeaderboards] = useState([]);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState(null);
  const [entries, setEntries] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Educator Management State
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'manage'
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    quizId: '',
    rankingMetric: 'HIGHEST_SCORE',
    visibility: 'COURSE_STUDENTS',
    maxEntries: 50,
    isVisibleToStudents: true,
    startDate: '',
    endDate: ''
  });

  // Fetch initial list of leaderboards
  useEffect(() => {
    loadLeaderboards();
    if (isEducatorOrAdmin) {
      loadCoursesAndQuizzes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, role]);

  const loadCoursesAndQuizzes = async () => {
    try {
      const [coursesData, quizzesData] = await Promise.all([
        courseService.getAllCourses(),
        quizService.getAllQuizzes()
      ]);
      setCourses(coursesData || []);
      setQuizzes(quizzesData || []);
    } catch (err) {
      console.error('Failed to load courses/quizzes for dropdown', err);
    }
  };

  const loadLeaderboards = async () => {
    setLoading(true);
    try {
      const lbs = await leaderboardService.getLeaderboards();
      setLeaderboards(lbs || []);

      let targetLb = null;
      if (id) {
        targetLb = lbs.find(l => String(l.id) === String(id));
      }
      if (!targetLb && lbs.length > 0) {
        targetLb = lbs[0];
      }

      if (targetLb) {
        setSelectedLeaderboard(targetLb);
        await loadLeaderboardDetails(targetLb.id);
      } else {
        setSelectedLeaderboard(null);
        setEntries([]);
        setMyRank(null);
      }
    } catch (err) {
      console.error('Failed to load leaderboards', err);
      setError('Unable to load leaderboards. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboardDetails = async (lbId) => {
    try {
      const [entriesData, rankData] = await Promise.all([
        leaderboardService.getLeaderboardEntries(lbId),
        role === 'STUDENT' ? leaderboardService.getMyRank(lbId).catch(() => null) : Promise.resolve(null)
      ]);
      setEntries(entriesData || []);
      setMyRank(rankData);
    } catch (err) {
      console.error('Failed to load leaderboard details', err);
    }
  };

  const handleSelectLeaderboard = async (lbId) => {
    const lb = leaderboards.find(l => String(l.id) === String(lbId));
    if (lb) {
      setSelectedLeaderboard(lb);
      await loadLeaderboardDetails(lb.id);
    }
  };

  const handleRefresh = async () => {
    if (!selectedLeaderboard) return;
    setRefreshing(true);
    try {
      const updated = await leaderboardService.refreshLeaderboard(selectedLeaderboard.id);
      setSelectedLeaderboard(updated);
      await loadLeaderboardDetails(updated.id);
    } catch (err) {
      console.error('Failed to refresh leaderboard', err);
      alert('Failed to refresh ranking');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async (lbId) => {
    if (!window.confirm('Are you sure you want to delete this leaderboard?')) return;
    try {
      await leaderboardService.deleteLeaderboard(lbId);
      await loadLeaderboards();
    } catch (err) {
      console.error('Failed to delete leaderboard', err);
      alert('Failed to delete leaderboard');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a leaderboard title');
      return;
    }
    setCreating(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        courseId: formData.courseId ? Number(formData.courseId) : null,
        quizId: formData.quizId ? Number(formData.quizId) : null,
        rankingMetric: formData.rankingMetric,
        visibility: formData.visibility,
        maxEntries: Number(formData.maxEntries) || 50,
        isVisibleToStudents: formData.isVisibleToStudents,
        startDate: formData.startDate ? formData.startDate + 'T00:00:00' : null,
        endDate: formData.endDate ? formData.endDate + 'T23:59:59' : null
      };

      const created = await leaderboardService.createLeaderboard(payload);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        courseId: '',
        quizId: '',
        rankingMetric: 'HIGHEST_SCORE',
        visibility: 'COURSE_STUDENTS',
        maxEntries: 50,
        isVisibleToStudents: true,
        startDate: '',
        endDate: ''
      });
      await loadLeaderboards();
      setSelectedLeaderboard(created);
      await loadLeaderboardDetails(created.id);
      setActiveTab('view');
    } catch (err) {
      console.error('Failed to create leaderboard', err);
      alert(err.response?.data?.message || 'Error creating leaderboard');
    } finally {
      setCreating(false);
    }
  };

  // Helper for Top 3 Podium
  const rank1 = entries.find(e => e.rank === 1);
  const rank2 = entries.find(e => e.rank === 2);
  const rank3 = entries.find(e => e.rank === 3);

  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'HIGHEST_SCORE': return 'Highest Score';
      case 'AVERAGE_SCORE': return 'Average Score';
      case 'TOTAL_SCORE': return 'Total Points';
      case 'QUIZ_COMPLETION': return 'Quiz Completion Rate';
      case 'COURSE_PROGRESS': return 'Course Progress';
      default: return metric || 'Score';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="gamification-container">
      {/* Header */}
      <div className="gamification-header">
        <div className="gamification-title-group">
          <h1>🏆 Academic Leaderboards</h1>
          <p className="gamification-subtitle">
            Celebrate top student performances, course champions, and skill mastery
          </p>
        </div>

        <div className="gamification-actions">
          {isEducatorOrAdmin && (
            <>
              <button
                className={`filter-pill ${activeTab === 'view' ? 'active' : ''}`}
                onClick={() => setActiveTab('view')}
              >
                Leaderboard View
              </button>
              <button
                className={`filter-pill ${activeTab === 'manage' ? 'active' : ''}`}
                onClick={() => setActiveTab('manage')}
              >
                Manage Leaderboards
              </button>
              <button
                className="btn-primary-course"
                style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}
                onClick={() => setShowCreateModal(true)}
              >
                + Create Leaderboard
              </button>
            </>
          )}

          {role === 'STUDENT' && (
            <Link to="/analytics" className="filter-pill" style={{ textDecoration: 'none' }}>
              📊 My Performance
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Educator Management Tab */}
      {isEducatorOrAdmin && activeTab === 'manage' ? (
        <div className="leaderboard-table-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>All Configured Leaderboards</h2>
            <button className="btn-primary-course" onClick={() => setShowCreateModal(true)}>
              + New Leaderboard
            </button>
          </div>

          {leaderboards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              No leaderboards have been created yet. Click "+ Create Leaderboard" above.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="gamification-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Course Scope</th>
                    <th>Ranking Metric</th>
                    <th>Visibility</th>
                    <th>Students Visible</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboards.map(lb => (
                    <tr key={lb.id}>
                      <td style={{ fontWeight: 700 }}>{lb.title}</td>
                      <td>{lb.courseTitle || 'System-wide'}</td>
                      <td>
                        <span className="score-badge">{getMetricLabel(lb.rankingMetric)}</span>
                      </td>
                      <td>
                        <span className="badge-status" style={{ fontSize: '0.78rem' }}>
                          {lb.visibility}
                        </span>
                      </td>
                      <td>{lb.isVisibleToStudents ? '✓ Yes' : '✗ Hidden'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="filter-pill"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                            onClick={() => {
                              setSelectedLeaderboard(lb);
                              loadLeaderboardDetails(lb.id);
                              setActiveTab('view');
                            }}
                          >
                            View
                          </button>
                          <button
                            className="filter-pill"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', background: '#fee2e2', color: '#b91c1c' }}
                            onClick={() => handleDelete(lb.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Leaderboard View Tab */
        <>
          {/* Filter / Selector Bar */}
          <div className="gamification-filter-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569' }}>
                Select Leaderboard:
              </span>
              {leaderboards.length > 0 ? (
                <select
                  className="custom-select"
                  value={selectedLeaderboard?.id || ''}
                  onChange={(e) => handleSelectLeaderboard(e.target.value)}
                  style={{ minWidth: '240px' }}
                >
                  {leaderboards.map(lb => (
                    <option key={lb.id} value={lb.id}>
                      {lb.title} {lb.courseTitle ? `(${lb.courseTitle})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>No active leaderboards available</span>
              )}
            </div>

            {selectedLeaderboard && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Ranked by: <strong>{getMetricLabel(selectedLeaderboard.rankingMetric)}</strong>
                </span>
                {isEducatorOrAdmin && (
                  <button
                    className="filter-pill"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    title="Recalculate leaderboard scores from quiz attempts"
                  >
                    {refreshing ? 'Recalculating...' : '🔄 Refresh Ranks'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Student Own Rank Banner */}
          {role === 'STUDENT' && myRank && (
            <div className="user-rank-banner">
              <div className="user-rank-info">
                <div className="user-rank-badge">
                  Rank {myRank.rank}
                </div>
                <div className="user-rank-text">
                  <span className="title">Your Standing in {selectedLeaderboard?.title}</span>
                  <span className="sub">
                    Score: <strong>{myRank.score} pts</strong> ({Math.round(myRank.percentage || 0)}%) • Attempts: {myRank.attempts}
                  </span>
                </div>
              </div>
              <Link to="/analytics" className="btn-primary-course" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                View My Performance →
              </Link>
            </div>
          )}

          {/* Podium (Top 3) */}
          {entries.length > 0 && (
            <div className="podium-container">
              {/* Rank 2 (Silver) */}
              <div className="podium-step rank-2">
                {rank2 ? (
                  <>
                    <div className="podium-avatar">
                      {((rank2.studentName || rank2.displayName || 'S')[0] || 'S').toUpperCase()}
                      <span className="podium-badge-icon">🥈</span>
                    </div>
                    <div className="podium-name" title={rank2.studentName || rank2.displayName} style={{ fontWeight: 800 }}>
                      {rank2.studentName || rank2.displayName || 'Student'}
                    </div>
                    {rank2.studentEmail && (
                      <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '1px', marginBottom: '4px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rank2.studentEmail}>
                        {rank2.studentEmail}
                      </div>
                    )}
                    <div className="podium-score">
                      {rank2.score} pts ({Math.round(rank2.percentage || 0)}%)
                    </div>
                  </>
                ) : (
                  <div style={{ height: '120px' }}></div>
                )}
                <div className="podium-block">2</div>
              </div>

              {/* Rank 1 (Gold) */}
              <div className="podium-step rank-1">
                {rank1 ? (
                  <>
                    <div className="podium-avatar">
                      {((rank1.studentName || rank1.displayName || 'S')[0] || 'S').toUpperCase()}
                      <span className="podium-badge-icon">👑</span>
                    </div>
                    <div className="podium-name" title={rank1.studentName || rank1.displayName} style={{ fontWeight: 800 }}>
                      {rank1.studentName || rank1.displayName || 'Student'}
                    </div>
                    {rank1.studentEmail && (
                      <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '1px', marginBottom: '4px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rank1.studentEmail}>
                        {rank1.studentEmail}
                      </div>
                    )}
                    <div className="podium-score">
                      {rank1.score} pts ({Math.round(rank1.percentage || 0)}%)
                    </div>
                  </>
                ) : (
                  <div style={{ height: '120px' }}></div>
                )}
                <div className="podium-block">1</div>
              </div>

              {/* Rank 3 (Bronze) */}
              <div className="podium-step rank-3">
                {rank3 ? (
                  <>
                    <div className="podium-avatar">
                      {((rank3.studentName || rank3.displayName || 'S')[0] || 'S').toUpperCase()}
                      <span className="podium-badge-icon">🥉</span>
                    </div>
                    <div className="podium-name" title={rank3.studentName || rank3.displayName} style={{ fontWeight: 800 }}>
                      {rank3.studentName || rank3.displayName || 'Student'}
                    </div>
                    {rank3.studentEmail && (
                      <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '1px', marginBottom: '4px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rank3.studentEmail}>
                        {rank3.studentEmail}
                      </div>
                    )}
                    <div className="podium-score">
                      {rank3.score} pts ({Math.round(rank3.percentage || 0)}%)
                    </div>
                  </>
                ) : (
                  <div style={{ height: '120px' }}></div>
                )}
                <div className="podium-block">3</div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="leaderboard-table-card">
            {entries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No rankings recorded yet for this leaderboard.</p>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
                  Students who complete eligible quizzes will automatically appear on the leaderboard.
                </p>
                {isEducatorOrAdmin && (
                  <button className="filter-pill active" onClick={handleRefresh} style={{ marginTop: '0.75rem' }}>
                    Recalculate Current Scores
                  </button>
                )}
              </div>
            ) : (
              <table className="gamification-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student</th>
                    <th>Score / Points</th>
                    <th>Percentage</th>
                    <th>Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => {
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
                          <div className="student-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="student-avatar-sm" style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              flexShrink: 0
                            }}>
                              {((entry.studentName || entry.displayName || 'S')[0] || 'S').toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontWeight: isYou ? 800 : 700, color: '#0f172a', fontSize: '0.9rem' }}>
                                  {entry.studentName || entry.displayName || 'Student'}
                                </span>
                                {isYou && <span className="you-tag">You</span>}
                              </div>
                              {entry.studentEmail && (
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                  {entry.studentEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="score-cell">
                          {entry.score} pts
                        </td>
                        <td>
                          <span className="score-badge">
                            {Math.round(entry.percentage || 0)}%
                          </span>
                        </td>
                        <td style={{ color: '#64748b' }}>
                          {entry.attempts}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Modal: Create Leaderboard */}
      {showCreateModal && (
        <div className="gamification-modal-overlay">
          <div className="gamification-modal">
            <div className="modal-header">
              <h2>Create New Leaderboard</h2>
              <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>Leaderboard Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java Champions, Spring Boot Spring 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="2"
                  placeholder="Brief description or rules for this leaderboard"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Course Scope</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  >
                    <option value="">All Courses (System-wide)</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title || c.courseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quiz Scope (Optional)</label>
                  <select
                    value={formData.quizId}
                    onChange={(e) => setFormData({ ...formData, quizId: e.target.value })}
                  >
                    <option value="">All Quizzes in Scope</option>
                    {quizzes.map(q => (
                      <option key={q.id} value={q.id}>
                        {q.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Ranking Metric *</label>
                  <select
                    value={formData.rankingMetric}
                    onChange={(e) => setFormData({ ...formData, rankingMetric: e.target.value })}
                  >
                    <option value="HIGHEST_SCORE">Highest Score</option>
                    <option value="AVERAGE_SCORE">Average Score</option>
                    <option value="TOTAL_SCORE">Total Score</option>
                    <option value="QUIZ_COMPLETION">Quiz Completion</option>
                    <option value="COURSE_PROGRESS">Course Progress</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Visibility *</label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  >
                    <option value="COURSE_STUDENTS">Students in Course</option>
                    <option value="PUBLIC">Public to All Enrolled</option>
                    <option value="PRIVATE">Private (Educator Only)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Max Displayed Students</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={formData.maxEntries}
                    onChange={(e) => setFormData({ ...formData, maxEntries: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.85rem' }}>
                    <input
                      type="checkbox"
                      style={{ width: 'auto' }}
                      checked={formData.isVisibleToStudents}
                      onChange={(e) => setFormData({ ...formData, isVisibleToStudents: e.target.checked })}
                    />
                    Visible to Students
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="filter-pill"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary-course"
                >
                  {creating ? 'Saving...' : 'Create Leaderboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
