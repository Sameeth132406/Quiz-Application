import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import quizService from '../services/quizService';
import questionService from '../services/questionService';
import attemptService from '../services/attemptService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';

const QuizDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);

  const [quiz, setQuiz] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Student eligibility state
  const [eligibility, setEligibility] = useState(null);

  // Educator Student Management state
  const [studentAttempts, setStudentAttempts] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [grantReason, setGrantReason] = useState('Scored below eligibility criteria, granted 1 retake');
  const [granting, setGranting] = useState(false);
  const [grantSuccessMsg, setGrantSuccessMsg] = useState('');

  const isStaff = role === 'ADMIN' || role === 'EDUCATOR';

  const fetchQuizDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [quizData, eligData] = await Promise.all([
        quizService.getQuizById(id),
        role === 'STUDENT' ? attemptService.getQuizEligibility(id).catch(() => null) : null
      ]);
      setQuiz(quizData);
      setEligibility(eligData);

      try {
        const questions = isStaff
          ? await questionService.getQuestionsByQuiz(id)
          : await questionService.getStudentQuestions(id, false);
        setQuestionCount(Array.isArray(questions) ? questions.length : 0);
      } catch (err) {
        setQuestionCount(0);
      }

      if (isStaff) {
        fetchStudentList();
      }
    } catch (err) {
      setError('Quiz not found or failed to load quiz details.');
    } finally {
      setLoading(false);
    }
  }, [id, isStaff, role]);

  const fetchStudentList = async () => {
    setLoadingStudents(true);
    try {
      const data = await attemptService.getQuizStudents(id);
      setStudentAttempts(data || []);
    } catch (e) {
      console.warn('Could not fetch student attempts list:', e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleGrantAttempt = async (targetUserId, count = null, customReason = null) => {
    setGranting(true);
    setGrantSuccessMsg('');
    try {
      await attemptService.grantAttempt(
        id,
        targetUserId,
        count,
        customReason || grantReason || 'Granted extra attempt by educator'
      );
      setGrantSuccessMsg('Successfully granted extra attempt! The student can now retake the quiz.');
      setTimeout(() => setGrantSuccessMsg(''), 4500);
      fetchStudentList();
    } catch (err) {
      alert('Failed to grant extra attempt. Please verify network/permissions.');
    } finally {
      setGranting(false);
    }
  };

  useEffect(() => {
    fetchQuizDetails();
  }, [fetchQuizDetails]);

  const handleTogglePublish = async () => {
    if (!quiz) return;
    setPublishing(true);
    try {
      const nextState = !quiz.resultsPublished;
      await quizService.publishResults(quiz.id, nextState);
      setQuiz((prev) => ({ ...prev, resultsPublished: nextState }));
    } catch (err) {
      alert('Failed to update result publication status.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <Loading message="Loading quiz details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchQuizDetails} />;
  if (!quiz) return <div className="empty-state">Quiz not found.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={() => navigate('/quizzes')}
        style={{ marginBottom: '1.5rem' }}
      >
        &larr; Back to Quizzes
      </button>

      <div className="quiz-detail-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-role">{quiz.category || 'General'}</span>
            <span className={`badge badge-${(quiz.difficulty || 'easy').toLowerCase()}`}>{quiz.difficulty}</span>
          </div>

          <span style={{
            fontSize: '0.8rem',
            fontWeight: '700',
            padding: '0.3rem 0.75rem',
            borderRadius: '999px',
            background: quiz.resultsPublished ? '#dcfce7' : '#fffbeb',
            color: quiz.resultsPublished ? '#15803d' : '#b45309',
            border: `1px solid ${quiz.resultsPublished ? '#bbf7d0' : '#fde68a'}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            {quiz.resultsPublished ? '📢 Results Published to Students' : '⏳ Results Pending Release'}
          </span>
        </div>

        <h1 className="quiz-detail-title">{quiz.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          {quiz.description || 'No description available for this quiz.'}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1.25rem',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-main)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Duration</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '700' }}>⏱️ {quiz.duration || 15} Mins</div>
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Questions</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '700' }}>❓ {questionCount} Items</div>
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Difficulty</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '700' }}>📊 {quiz.difficulty}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Deadline</div>
            <div style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: quiz.endDate && new Date() > new Date(quiz.endDate) ? '#dc2626' : quiz.endDate ? '#b45309' : '#0f172a'
            }}>
              ⏳ {quiz.endDate ? new Date(quiz.endDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No Deadline'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Default Attempts</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '700' }}>🎯 {quiz.maxAttempts || 1} per Student</div>
          </div>
        </div>

        {/* Student Status & Attempt Alerts */}
        {role === 'STUDENT' && eligibility && (
          <div style={{ marginBottom: '2rem' }}>
            {eligibility.isExpired ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem 1.25rem', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' }}>⛔ Assessment Deadline Passed</div>
                <div style={{ fontSize: '0.88rem' }}>The submission deadline for this assessment was {new Date(quiz.endDate).toLocaleString()}. Submissions are now closed.</div>
              </div>
            ) : !eligibility.canAttempt ? (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>🎯 All Permitted Attempts Completed ({eligibility.completedAttempts}/{eligibility.allowedAttempts})</div>
                    <div style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Official Best Score Recorded: <strong style={{ color: '#16a34a' }}>{eligibility.bestScore !== null ? `${eligibility.bestScore} pts` : 'Pending'}</strong>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', background: '#fef3c7', color: '#b45309', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>
                    Attempt Limit Reached
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                  If your score was below the eligibility criteria, your educator may grant you an additional attempt. The highest score from all attempts is recorded.
                </div>
              </div>
            ) : (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem 1.25rem', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.98rem' }}>
                      ✓ Eligible to Take Assessment (Attempt {eligibility.completedAttempts + 1} of {eligibility.allowedAttempts})
                    </div>
                    {eligibility.bestScore !== null && (
                      <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '0.2rem' }}>
                        Previous Best Score: <strong>{eligibility.bestScore} pts</strong> (The system records your highest score from all attempts)
                      </div>
                    )}
                    {eligibility.allowanceReason && (
                      <div style={{ fontSize: '0.82rem', color: '#1e40af', marginTop: '0.25rem' }}>
                        🎁 Retake Note: {eligibility.allowanceReason}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>
                    {eligibility.remainingAttempts} Attempt(s) Remaining
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {role === 'STUDENT' && (
            <>
              {eligibility?.isExpired ? (
                <Button size="lg" variant="outline" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                  ⛔ Assessment Closed (Deadline Passed)
                </Button>
              ) : eligibility && !eligibility.canAttempt ? (
                <Button size="lg" variant="outline" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                  🎯 Max Attempts Used ({eligibility.allowedAttempts})
                </Button>
              ) : (
                <Link to={`/take-quiz/${quiz.id}`} style={{ textDecoration: 'none' }}>
                  <Button size="lg" variant="primary" style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)', boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>
                    🛡️ {eligibility && eligibility.completedAttempts > 0 ? `Retake Assessment (Attempt ${eligibility.completedAttempts + 1})` : 'Start Proctored Exam'} &rarr;
                  </Button>
                </Link>
              )}
            </>
          )}

          {isStaff && (
            <>
              <Link to="/teacher/proctoring" style={{ textDecoration: 'none' }}>
                <Button size="lg" variant="outline" style={{ borderColor: '#0284c7', color: '#0284c7' }}>
                  🛡️ Proctoring Reviews
                </Button>
              </Link>
              <Button
                size="lg"
                variant={quiz.resultsPublished ? 'outline' : 'primary'}
                onClick={handleTogglePublish}
                disabled={publishing}
              >
                {publishing
                  ? 'Updating...'
                  : quiz.resultsPublished
                  ? '🔒 Unpublish Results'
                  : '🚀 Publish Results to Students'}
              </Button>

              <Link to={`/quizzes/${quiz.id}/questions`} style={{ textDecoration: 'none' }}>
                <Button size="lg" variant="primary">
                  Manage Questions ({questionCount})
                </Button>
              </Link>
              <Link to={`/edit-quiz/${quiz.id}`} style={{ textDecoration: 'none' }}>
                <Button size="lg" variant="outline">
                  Edit Quiz Info & Deadline
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Staff Attempt & Retake Management Panel */}
      {isStaff && (
        <div style={{ marginTop: '2.5rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                👥 Student Attempt & Retake Management
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Students are permitted <strong>{quiz.maxAttempts || 1} attempt</strong> by default. If a student scored below eligibility criteria, you can select their name and grant an additional attempt. The highest score from all attempts is taken as their official grade.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchStudentList}
              className="btn btn-outline btn-sm"
              disabled={loadingStudents}
            >
              🔄 Refresh List
            </button>
          </div>

          {grantSuccessMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              ✓ {grantSuccessMsg}
            </div>
          )}

          {/* Quick Grant Form */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
              ⚡ Grant Additional Attempt to a Student
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1.5fr) minmax(240px, 2fr) auto', gap: '0.75rem', alignItems: 'center' }}>
              <div>
                <select
                  className="form-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={{ fontSize: '0.88rem', width: '100%' }}
                >
                  <option value="">-- Choose student by name --</option>
                  {studentAttempts.map(s => (
                    <option key={s.userId} value={s.userId}>
                      {s.studentName} ({s.studentEmail || 'Student'}) - Best: {s.bestScore !== null ? `${s.bestScore} pts` : 'No Attempts'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Reason (e.g. Scored below eligibility criteria, granted retake)"
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  style={{ fontSize: '0.88rem', width: '100%' }}
                />
              </div>

              <div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleGrantAttempt(selectedStudentId)}
                  disabled={!selectedStudentId || granting}
                  isLoading={granting}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  +1 Extra Attempt
                </Button>
              </div>
            </div>
          </div>

          {/* Student Attempts Table */}
          {loadingStudents ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading student attempts...</div>
          ) : studentAttempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No students registered in the system yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Attempts (Taken / Allowed)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Official Best Score</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Latest Score</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status & Notes</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAttempts.map(s => {
                    const isBelowCriteria = s.bestScore !== null && s.bestScore < 50;
                    return (
                      <tr key={s.userId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.studentName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.studentEmail || 'No email'}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            background: s.totalAttempts >= s.allowedAttempts ? '#fef3c7' : '#dcfce7',
                            color: s.totalAttempts >= s.allowedAttempts ? '#b45309' : '#15803d'
                          }}>
                            {s.totalAttempts} / {s.allowedAttempts}
                          </span>
                          {s.hasExtraAttempt && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                              +Extra Granted
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {s.bestScore !== null ? (
                            <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.95rem' }}>
                              ⭐ {s.bestScore} pts
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Not Attempted</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                          {s.latestScore !== null ? `${s.latestScore} pts` : '--'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {isBelowCriteria ? (
                            <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                              ⚠️ Below Criteria (&lt;50%)
                            </span>
                          ) : s.bestScore !== null ? (
                            <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                              ✓ Eligible/Passing
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pending</span>
                          )}
                          {s.reason && (
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem', maxWidth: '200px' }} title={s.reason}>
                              Note: {s.reason}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleGrantAttempt(s.userId, s.allowedAttempts + 1, 'Scored below eligibility criteria, educator granted 1 more attempt')}
                            disabled={granting}
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Grant +1 retake attempt and take the best score"
                          >
                            +1 Attempt
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizDetails;
