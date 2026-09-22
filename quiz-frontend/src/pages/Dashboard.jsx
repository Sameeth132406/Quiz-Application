import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import quizService from '../services/quizService';
import questionService from '../services/questionService';
import attemptService from '../services/attemptService';
import authService from '../services/authService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Dashboard = () => {
  const { user, role } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesMap, setQuizzesMap] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isStudent = role === 'STUDENT' || (!role && role !== 'ADMIN' && role !== 'EDUCATOR');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Resolve student's user ID reliably
      let currentUserId = user?.id;
      if (!currentUserId) {
        try {
          const me = await authService.getCurrentUser();
          if (me?.id) currentUserId = me.id;
        } catch (e) {}
      }

      // Fetch Quizzes and their actual question count
      const qList = await quizService.getQuizzes().catch(() => []);
      const qMap = {};
      if (Array.isArray(qList)) {
        await Promise.all(
          qList.map(async (q) => {
            let count = 0;
            try {
              const questions = await questionService.getStudentQuestions(q.id, false).catch(() => []);
              count = Array.isArray(questions) && questions.length > 0 ? questions.length : 0;
              if (count === 0) {
                const adminQ = await questionService.getQuestionsByQuiz(q.id).catch(() => []);
                count = Array.isArray(adminQ) ? adminQ.length : 0;
              }
            } catch (e) {}
            qMap[q.id] = {
              ...q,
              totalQuestions: count > 0 ? count : 1
            };
          })
        );
      }
      setQuizzes(Array.isArray(qList) ? qList : []);
      setQuizzesMap(qMap);
      
      // For students: ONLY fetch and show this particular student's attempts
      // For staff (ADMIN/EDUCATOR): show all attempts
      const attemptsPromise = isStudent
        ? (currentUserId
            ? attemptService.getAttemptsByUser(currentUserId).catch(() => [])
            : Promise.resolve([]))
        : attemptService.getAllAttempts().catch(() => []);

      const a = await attemptsPromise;

      // If student, guarantee strict filter so no other student's data is ever shown
      const studentAttempts = isStudent && currentUserId
        ? (Array.isArray(a) ? a.filter(att => att.userId === currentUserId) : [])
        : (Array.isArray(a) ? a : []);

      setAttempts(studentAttempts);
    } catch {
      setError('Unable to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, isStudent]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const avgScore = attempts.length > 0
    ? (attempts.reduce((acc, c) => acc + (c.score || 0), 0) / attempts.length).toFixed(1)
    : '—';

  const cleanAttemptsCount = attempts.filter(a => !a.tabSwitches || a.tabSwitches === 0).length;
  const integrityPct = attempts.length > 0 ? Math.round((cleanAttemptsCount / attempts.length) * 100) : 100;

  const actions = [
    { icon: '📚', title: 'Browse Quizzes', desc: 'Explore available assessments', to: '/quizzes', color: '#dc2626' },
    {
      icon: '📊',
      title: (role === 'ADMIN' || role === 'EDUCATOR') ? 'View Analytics' : 'My Analytics',
      desc: (role === 'ADMIN' || role === 'EDUCATOR') ? 'View platform performance & history' : 'View your performance & history',
      to: '/analytics',
      color: '#d97706'
    },
    ...(role === 'ADMIN' || role === 'EDUCATOR'
      ? [{ icon: '➕', title: 'Create Quiz', desc: 'Build a new assessment', to: '/add-quiz', color: '#16a34a' }]
      : []),
    ...(role === 'ADMIN'
      ? [{ icon: '👥', title: 'User Management', desc: 'Manage user accounts', to: '/admin/users', color: '#7c3aed' }]
      : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        borderRadius: '10px',
        padding: '1.2rem 1.6rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#ffffff',
        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)',
      }}>
        <div>
          <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>
            Welcome back, {user?.username || 'Learner'} 👋
          </div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Logged in as <strong style={{ color: '#ffffff' }}>{role || 'STUDENT'}</strong>
            {isStudent && <span style={{ marginLeft: '0.5rem', opacity: 0.9 }}>• Viewing Individual Student Workspace</span>}
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '46px', height: '46px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
        }}>
          {role === 'ADMIN' ? '🛡️' : role === 'EDUCATOR' ? '🎓' : '👤'}
        </div>
      </div>

      {loading ? <Loading message="Loading your dashboard..." /> : error ? (
        <ErrorMessage message={error} onRetry={fetchData} />
      ) : (
        <>
          {/* Stat Cards - Displays ONLY the individual student's stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem' }}>
            {[
              { icon: '📚', value: quizzes.length, label: 'Available Quizzes', color: '#dc2626' },
              { icon: '🎯', value: attempts.length, label: isStudent ? 'My Attempts' : 'Total Attempts', color: '#d97706' },
              { icon: '⭐', value: avgScore, label: isStudent ? 'My Avg Score' : 'Avg Score', color: '#16a34a' },
              { icon: '🛡️', value: `${integrityPct}%`, label: isStudent ? 'My Integrity Rate' : 'Integrity Rating', color: '#0284c7' }
            ].map(s => (
              <div key={s.label} style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
                borderLeft: `4px solid ${s.color}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  width: '42px', height: '42px',
                  background: `${s.color}15`,
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: s.color, lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
              Quick Actions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${actions.length}, 1fr)`, gap: '0.75rem' }}>
              {actions.map(a => (
                <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '1rem 1.2rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{
                      width: '38px', height: '38px',
                      background: `${a.color}15`,
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.15rem', flexShrink: 0,
                    }}>
                      {a.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#111827' }}>{a.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.1rem' }}>{a.desc}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '0.95rem' }}>&rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Attempt History Table - Displays ONLY the individual student's attempts */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                🕒 {isStudent ? 'My Recent Attempts' : 'Recent Attempts'}
              </h3>
              <Link to="/analytics" style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: '700', textDecoration: 'none' }}>
                View Full History &rarr;
              </Link>
            </div>

            {attempts.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                You haven't completed any quiz attempts yet. Start a quiz to see your individual performance here!
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Completed At</th>
                      <th>Score</th>
                      <th>Integrity Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.slice(0, 5).map((att, idx) => {
                      const switches = att.tabSwitches || 0;
                      return (
                        <tr key={att.id || idx}>
                          <td><strong>{quizzesMap[att.quizId]?.title || `Quiz #${att.quizId}`}</strong></td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {att.completedAt ? new Date(att.completedAt).toLocaleDateString() : 'Recent'}
                          </td>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{att.score || 0}</strong> / {quizzesMap[att.quizId]?.totalQuestions || 1} marks
                          </td>
                          <td>
                            <span className={`integrity-badge-indicator ${switches === 0 ? 'clean' : 'warning'}`}>
                              {switches === 0 ? '🛡️ Clean (0)' : `⚠️ ${switches} Switches`}
                            </span>
                          </td>
                          <td>
                            <Link to={`/quiz/${att.quizId}`} style={{ color: '#dc2626', fontWeight: '700', fontSize: '0.78rem', textDecoration: 'none' }}>
                              Review &rarr;
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
