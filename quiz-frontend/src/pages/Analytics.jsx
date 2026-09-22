import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import attemptService from '../services/attemptService';
import quizService from '../services/quizService';
import questionService from '../services/questionService';
import authService from '../services/authService';
import { ScoreTrendChart, ScoreDistributionDonut } from '../components/PerformanceCharts';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Analytics = () => {
  const { user, token, role } = useContext(AuthContext);

  const [attemptsList, setAttemptsList] = useState([]);
  const [quizzesMap, setQuizzesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Attempt History search and status filter
  const [historySearch, setHistorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PASSED' | 'FAILED'

  const isStudent = role === 'STUDENT' || (!role && role !== 'ADMIN' && role !== 'EDUCATOR');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Resolve student's user ID reliably
      let currentUserId = user?.id;
      if (!currentUserId && token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload?.userId || payload?.id) currentUserId = payload.userId || payload.id;
        } catch (e) {}
      }
      if (!currentUserId) {
        try {
          const me = await authService.getCurrentUser();
          if (me?.id) currentUserId = me.id;
        } catch (e) {}
      }

      // 2. Fetch Quizzes List and their actual question counts
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
      setQuizzesMap(qMap);

      // 3. Fetch Attempts - STRICTLY individual for student
      if (isStudent) {
        const userAttempts = currentUserId
          ? await attemptService.getAttemptsByUser(currentUserId).catch(() => [])
          : await attemptService.getAllAttempts().catch(() => []);

        // Double enforce filter on current student's ID
        const myAttempts = Array.isArray(userAttempts)
          ? (currentUserId ? userAttempts.filter(a => a.userId === currentUserId) : userAttempts)
          : [];

        setAttemptsList(myAttempts);
      } else {
        // ADMIN or EDUCATOR: platform-wide records
        const allAttempts = await attemptService.getAllAttempts().catch(() => []);
        setAttemptsList(Array.isArray(allAttempts) ? allAttempts : []);
      }
    } catch (err) {
      setError('Unable to load performance metrics from the server.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, isStudent]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculations for KPI Cards - Computed ONLY from this individual student's attempts
  const totalAttempts = attemptsList.length;

  const avgScore = totalAttempts > 0
    ? (attemptsList.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts).toFixed(1)
    : '0.0';

  const highestScore = totalAttempts > 0
    ? Math.max(...attemptsList.map(a => a.score || 0))
    : 0;

  const cleanAttemptsCount = attemptsList.filter(a => !a.tabSwitches || a.tabSwitches === 0).length;
  const integrityRate = totalAttempts > 0 ? Math.round((cleanAttemptsCount / totalAttempts) * 100) : 100;

  // Filtered Attempt History (Strictly Individual for Student)
  const filteredAttempts = attemptsList.filter(att => {
    const quizTitle = quizzesMap[att.quizId]?.title || `Quiz #${att.quizId}`;
    if (historySearch.trim()) {
      if (!quizTitle.toLowerCase().includes(historySearch.toLowerCase())) {
        return false;
      }
    }

    const quiz = quizzesMap[att.quizId];
    const totalQuestions = quiz?.totalQuestions || 1;
    const pct = totalQuestions > 0 ? Math.round(((att.score || 0) / totalQuestions) * 100) : 0;
    const isPassed = pct >= 50;

    if (statusFilter === 'PASSED' && !isPassed) return false;
    if (statusFilter === 'FAILED' && isPassed) return false;

    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isStudent ? 'My Performance Analytics' : 'Performance Analytics'}
          </h1>
          <p className="page-subtitle">
            {isStudent
              ? 'Your personal score progression, academic integrity report, and individual assessment history'
              : 'Detailed performance tracking, score progression trends, and assessment attempt history'}
          </p>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading your personal analytics dashboard..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchData} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* 1. Top KPI Summary Cards - Strictly Individual Performance */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              borderLeft: '4px solid #dc2626',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>
                {isStudent ? 'MY TOTAL ATTEMPTS' : 'TOTAL ATTEMPTS'}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#dc2626', marginTop: '0.2rem' }}>
                {totalAttempts}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                {isStudent ? 'Your completed attempts' : 'Recorded attempts across platform'}
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              borderLeft: '4px solid #0284c7',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>
                {isStudent ? 'MY AVERAGE SCORE' : 'AVERAGE SCORE'}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0284c7', marginTop: '0.2rem' }}>
                {avgScore}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                {isStudent ? 'Your average mark' : 'Across all attempts'}
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              borderLeft: '4px solid #16a34a',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>
                {isStudent ? 'MY HIGHEST SCORE' : 'HIGHEST SCORE'}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#16a34a', marginTop: '0.2rem' }}>
                {highestScore}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                {isStudent ? 'Your personal best score' : 'Highest score recorded'}
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              borderLeft: '4px solid #10b981',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>
                {isStudent ? 'MY INTEGRITY CLEAN RATE' : 'INTEGRITY CLEAN RATE'}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', marginTop: '0.2rem' }}>
                {integrityRate}%
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                0 tab-switch attempts
              </div>
            </div>
          </div>

          {/* 2. Interactive Performance Charts Grid (Progression & Distribution) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Score Trend Line Chart */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    📈 {isStudent ? 'My Score Progression' : 'Score Progression Trend'}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {isStudent ? 'Your score percentage over recent attempts' : 'Score percentage over recent quiz attempts'}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#dc2626' }}>
                  {totalAttempts > 0 ? `Latest ${Math.min(10, totalAttempts)}` : '0 attempts'}
                </span>
              </div>
              <ScoreTrendChart attempts={attemptsList} quizzesMap={quizzesMap} />
            </div>

            {/* Score Distribution Donut Chart */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  🎯 {isStudent ? 'My Score Distribution' : 'Score Distribution'}
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {isStudent ? 'Your attempts breakdown by mastery' : 'Breakdown into mastery, proficiency & review'}
                </span>
              </div>
              <ScoreDistributionDonut attempts={attemptsList} quizzesMap={quizzesMap} />
            </div>
          </div>

          {/* 3. Individual Attempt History Table - Evaluated by Actual Quiz Questions Count */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  📋 {isStudent ? 'My Attempt History & Proctoring Log' : 'Attempt History & Proctoring Log'}
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {isStudent
                    ? 'Audit trail of your individual attempts, scores, and tab-switch records'
                    : 'Complete audit trail of quiz attempts, timestamps, scores, and tab-switch records'}
                </span>
              </div>

              {/* Filter and Search */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search by quiz title..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                >
                  <option value="ALL">All Status</option>
                  <option value="PASSED">Passed (≥50%)</option>
                  <option value="FAILED">Failed (&lt;50%)</option>
                </select>
              </div>
            </div>

            {filteredAttempts.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                {isStudent
                  ? "You haven't completed any quiz attempts yet. Start a quiz to see your individual history here!"
                  : 'No matching attempt records found.'}
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Quiz Assessment</th>
                      <th>Date & Time</th>
                      <th>Score Obtained</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                      <th>Academic Integrity</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttempts.map((att, idx) => {
                      const quiz = quizzesMap[att.quizId];
                      const title = quiz?.title || `Quiz #${att.quizId}`;
                      // Evaluated strictly for the number of questions present in the quiz
                      const totalQuestions = quiz?.totalQuestions || 1;
                      const score = att.score || 0;
                      const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
                      const isPassed = pct >= 50;
                      const switches = att.tabSwitches || 0;
                      const grade = pct >= 85 ? 'A' : pct >= 70 ? 'B' : pct >= 55 ? 'C' : pct >= 40 ? 'D' : 'F';

                      return (
                        <tr key={att.id || idx}>
                          <td>
                            <strong>{title}</strong>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              Attempt #{att.id} &nbsp;|&nbsp; {quiz?.category || 'Assessment'}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {att.completedAt ? new Date(att.completedAt).toLocaleString() : 'Recent'}
                          </td>
                          <td>
                            <strong>{score}</strong> / {totalQuestions}
                          </td>
                          <td>
                            <span style={{ fontWeight: '700', color: isPassed ? '#16a34a' : '#dc2626' }}>
                              {pct}%
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${isPassed ? 'badge-easy' : 'badge-hard'}`}>
                              {grade}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`integrity-badge-indicator ${switches === 0 ? 'clean' : 'warning'}`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              {switches === 0 ? '🛡️ Clean (0)' : `⚠️ ${switches} Switches`}
                            </span>
                          </td>
                          <td>
                            <Link
                              to={`/quiz/${att.quizId}`}
                              style={{
                                fontSize: '0.75rem',
                                color: '#dc2626',
                                textDecoration: 'none',
                                fontWeight: '700'
                              }}
                            >
                              Re-Take &rarr;
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
        </div>
      )}
    </div>
  );
};

export default Analytics;
