import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import badgeService from '../services/badgeService';
import courseService from '../services/courseService';
import Loading from '../components/Loading';

const Achievements = () => {
  const { role } = useContext(AuthContext);
  const isEducatorOrAdmin = role === 'ADMIN' || role === 'EDUCATOR';

  const [studentBadges, setStudentBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'UNLOCKED', 'IN_PROGRESS'
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'manage'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconUrl: '🏆',
    badgeType: 'SCORE_THRESHOLD',
    requirementValue: 90,
    courseId: '',
    active: true
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (role === 'STUDENT') {
        const myBadges = await badgeService.getMyBadges();
        setStudentBadges(myBadges || []);
      } else {
        const [badgesData, coursesData] = await Promise.all([
          badgeService.getAllBadges(),
          courseService.getAllCourses().catch(() => [])
        ]);
        setAllBadges(badgesData || []);
        setCourses(coursesData || []);
        setActiveTab('manage');
      }
    } catch (err) {
      console.error('Failed to load badges data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a badge name');
      return;
    }
    setCreating(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        iconUrl: formData.iconUrl || '🏆',
        badgeType: formData.badgeType,
        requirementValue: Number(formData.requirementValue) || 1,
        courseId: formData.courseId ? Number(formData.courseId) : null,
        active: formData.active
      };
      await badgeService.createBadge(payload);
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        iconUrl: '🏆',
        badgeType: 'SCORE_THRESHOLD',
        requirementValue: 90,
        courseId: '',
        active: true
      });
      const updated = await badgeService.getAllBadges();
      setAllBadges(updated || []);
    } catch (err) {
      console.error('Failed to create badge', err);
      alert(err.response?.data?.message || 'Error creating badge');
    } finally {
      setCreating(false);
    }
  };

  const getFilteredStudentBadges = () => {
    if (filter === 'UNLOCKED') {
      return studentBadges.filter(b => b.achieved);
    }
    if (filter === 'IN_PROGRESS') {
      return studentBadges.filter(b => !b.achieved);
    }
    return studentBadges;
  };

  const unlockedCount = studentBadges.filter(b => b.achieved).length;
  const totalCount = studentBadges.length;

  if (loading) return <Loading />;

  return (
    <div className="gamification-container">
      {/* Header */}
      <div className="gamification-header">
        <div className="gamification-title-group">
          <h1>⭐ Badges & Achievements</h1>
          <p className="gamification-subtitle">
            Earn prestige badges as you complete quizzes, conquer courses, and master academic concepts
          </p>
        </div>

        <div className="gamification-actions">
          {isEducatorOrAdmin && (
            <>
              <button
                className={`filter-pill ${activeTab === 'manage' ? 'active' : ''}`}
                onClick={() => setActiveTab('manage')}
              >
                Badge Management
              </button>
              <button
                className="btn-primary-course"
                style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}
                onClick={() => setShowCreateModal(true)}
              >
                + Create Custom Badge
              </button>
            </>
          )}

          {role === 'STUDENT' && (
            <Link to="/leaderboards" className="filter-pill" style={{ textDecoration: 'none' }}>
              🏆 View Leaderboard
            </Link>
          )}
        </div>
      </div>

      {/* Educator Badge Management */}
      {isEducatorOrAdmin && activeTab === 'manage' ? (
        <div className="leaderboard-table-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>System & Course Badge Rules</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                Badges are automatically evaluated and awarded when students submit quizzes or reach course milestones.
              </p>
            </div>
            <button className="btn-primary-course" onClick={() => setShowCreateModal(true)}>
              + Add Badge
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="gamification-table">
              <thead>
                <tr>
                  <th>Badge</th>
                  <th>Description</th>
                  <th>Rule Type</th>
                  <th>Requirement</th>
                  <th>Scope</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allBadges.map(badge => (
                  <tr key={badge.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{badge.iconUrl || '🏆'}</span>
                        <strong style={{ color: '#0f172a' }}>{badge.name}</strong>
                      </div>
                    </td>
                    <td style={{ color: '#475569', fontSize: '0.88rem' }}>{badge.description}</td>
                    <td>
                      <span className="score-badge" style={{ fontSize: '0.78rem' }}>
                        {badge.badgeType}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {badge.requirementValue} {badge.badgeType.includes('SCORE') ? '%' : ''}
                    </td>
                    <td>{badge.courseId ? 'Course-specific' : 'Global'}</td>
                    <td>
                      <span className={`badge-status ${badge.active ? 'status-published' : 'status-draft'}`}>
                        {badge.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Student Achievements View */
        <>
          {/* Summary Banner */}
          <div className="user-rank-banner" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderColor: '#fcd34d' }}>
            <div className="user-rank-info">
              <div className="user-rank-badge" style={{ background: '#d97706' }}>
                🏆 {unlockedCount} / {totalCount}
              </div>
              <div className="user-rank-text">
                <span className="title" style={{ color: '#78350f' }}>Your Academic Achievements</span>
                <span className="sub" style={{ color: '#92400e' }}>
                  {unlockedCount === totalCount && totalCount > 0
                    ? 'Incredible! You have unlocked all available badges!'
                    : `You have completed ${Math.round((unlockedCount / (totalCount || 1)) * 100)}% of your achievement goals.`}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="gamification-filter-bar">
            <div className="filter-pills">
              <button
                className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilter('ALL')}
              >
                All Badges ({studentBadges.length})
              </button>
              <button
                className={`filter-pill ${filter === 'UNLOCKED' ? 'active' : ''}`}
                onClick={() => setFilter('UNLOCKED')}
              >
                🏆 Unlocked ({unlockedCount})
              </button>
              <button
                className={`filter-pill ${filter === 'IN_PROGRESS' ? 'active' : ''}`}
                onClick={() => setFilter('IN_PROGRESS')}
              >
                ⏳ In Progress ({studentBadges.length - unlockedCount})
              </button>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="badges-grid">
            {getFilteredStudentBadges().map(sb => {
              const req = sb.requirementValue || 1;
              const prog = sb.progress || 0;
              const percent = sb.achieved ? 100 : Math.min(100, Math.round((prog / req) * 100));

              return (
                <div key={sb.badgeId} className={`badge-card ${sb.achieved ? 'achieved' : ''}`}>
                  <div className="badge-top-row">
                    <div className="badge-icon-box">
                      {sb.iconUrl || '🏆'}
                    </div>
                    <span className={`badge-status-pill ${sb.achieved ? 'status-unlocked' : 'status-locked'}`}>
                      {sb.achieved ? '✓ Achieved' : 'In Progress'}
                    </span>
                  </div>

                  <h3 className="badge-card-name">{sb.badgeName}</h3>
                  <p className="badge-card-desc">{sb.badgeDescription}</p>

                  <div className="badge-progress-wrap">
                    <div className="badge-progress-label">
                      <span>Progress</span>
                      <span>
                        {sb.achieved ? 'Completed' : `${prog} / ${req}`}
                      </span>
                    </div>
                    <div className="badge-progress-bar">
                      <div
                        className="badge-progress-fill"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    {sb.achieved && sb.awardedAt && (
                      <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '0.4rem', fontWeight: 600 }}>
                        Unlocked on {new Date(sb.awardedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal: Create Custom Badge */}
      {showCreateModal && (
        <div className="gamification-modal-overlay">
          <div className="gamification-modal">
            <div className="modal-header">
              <h2>Create Custom Achievement Badge</h2>
              <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>Badge Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Coder, Quick Thinker"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Complete 5 quizzes with score >= 85%"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Icon Emoji</label>
                  <select
                    value={formData.iconUrl}
                    onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                  >
                    <option value="🏆">🏆 Trophy</option>
                    <option value="⭐">⭐ Star</option>
                    <option value="🎯">🎯 Bullseye</option>
                    <option value="📚">📚 Books</option>
                    <option value="🥇">🥇 Gold Medal</option>
                    <option value="🏅">🏅 Medal</option>
                    <option value="🚀">🚀 Rocket</option>
                    <option value="🔥">🔥 Streak</option>
                    <option value="💎">💎 Diamond</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Achievement Type *</label>
                  <select
                    value={formData.badgeType}
                    onChange={(e) => setFormData({ ...formData, badgeType: e.target.value })}
                  >
                    <option value="SCORE_THRESHOLD">Score Threshold (%)</option>
                    <option value="QUIZ_COUNT">Quizzes Completed Count</option>
                    <option value="FIRST_QUIZ">First Quiz Completed</option>
                    <option value="PERFECT_SCORE">Perfect 100% Score</option>
                    <option value="COURSE_COMPLETION">Full Course Completed</option>
                    <option value="LEADERBOARD_RANK">Top Leaderboard Rank</option>
                    <option value="COURSE_SCORE">Course Average Score (%)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Requirement Value *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.requirementValue}
                    onChange={(e) => setFormData({ ...formData, requirementValue: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Course Scope</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  >
                    <option value="">Global (All Courses)</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title || c.courseName}
                      </option>
                    ))}
                  </select>
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
                  {creating ? 'Saving...' : 'Create Badge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
