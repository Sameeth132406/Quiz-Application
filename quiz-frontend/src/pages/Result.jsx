import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import attemptService from '../services/attemptService';
import quizService from '../services/quizService';
import questionService from '../services/questionService';
import Loading from '../components/Loading';
import Button from '../components/Button';

const Result = () => {
  const { id } = useParams();
  const location = useLocation();
  const { role } = useContext(AuthContext);

  const [attempt, setAttempt] = useState(location.state?.resultData || null);
  const [quizData, setQuizData] = useState(null);
  const [quizTitle, setQuizTitle] = useState(location.state?.quizTitle || 'Quiz Assessment');
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(location.state?.totalQuestions || 0);
  const [loading, setLoading] = useState(!location.state?.resultData);

  const isStaff = role === 'ADMIN' || role === 'EDUCATOR';

  const tabSwitches = location.state?.tabSwitches !== undefined
    ? location.state.tabSwitches
    : attempt?.tabSwitches || 0;

  const wasAutoSubmitted = location.state?.autoSubmitted || false;

  const fetchAttemptResult = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attemptService.getAttemptById(id);
      setAttempt(data);
      if (data && data.quizId) {
        const [qData, qList] = await Promise.all([
          quizService.getQuizById(data.quizId).catch(() => null),
          questionService.getStudentQuestions(data.quizId, false).catch(() => [])
        ]);
        if (qData) {
          setQuizTitle(qData.title);
          setQuizData(qData);
        }
        if (Array.isArray(qList) && qList.length > 0) setTotalQuestionsCount(qList.length);
      }
    } catch (err) {
      console.warn('Could not load attempt from backend, using submitted state.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!attempt) {
      fetchAttemptResult();
    }
  }, [attempt, fetchAttemptResult]);

  if (loading) return <Loading message="Calculating assessment results & integrity record..." />;

  const isResultsPublished = Boolean(
    isStaff ||
    attempt?.resultsPublished ||
    quizData?.resultsPublished ||
    location.state?.resultData?.resultsPublished
  );

  const score = attempt?.score !== undefined ? attempt.score : (location.state?.score || 0);
  const totalMarks = totalQuestionsCount > 0 ? totalQuestionsCount : (attempt?.totalMarks || location.state?.totalQuestions || 1);
  const answeredCount = location.state?.userAnswers ? Object.keys(location.state.userAnswers).length : totalMarks;
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 100;
  const isPassed = percentage >= 50;

  return (
    <div style={{ maxWidth: '680px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
        {/* Celebration or Evaluation Icon */}
        <div style={{ fontSize: '3.8rem', marginBottom: '0.8rem' }}>
          {!isResultsPublished ? '🎯' : isPassed ? '🎉' : '📊'}
        </div>

        {/* Auto-Submit Notice if applicable (Educators or generic timer) */}
        {wasAutoSubmitted && (isStaff || location.state?.autoSubmitReason !== 'FULLSCREEN_EXIT') && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            color: '#b45309',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: '700',
            marginBottom: '1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            maxWidth: '560px',
            lineHeight: '1.4',
            textAlign: 'left',
          }}>
            <span>⚠️</span>
            <span>Assessment was automatically submitted upon timer expiration.</span>
          </div>
        )}

        {/* Status Badge */}
        <div>
          {!isResultsPublished ? (
            <span className="badge badge-medium" style={{ fontSize: '0.9rem', padding: '0.4rem 1.2rem', marginBottom: '0.8rem', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
              ⏳ Result Pending Educator Release
            </span>
          ) : (
            <span className={`badge ${isPassed ? 'badge-easy' : 'badge-hard'}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1.2rem', marginBottom: '0.8rem' }}>
              {isPassed ? 'Assessment Passed' : 'Attempt Completed'}
            </span>
          )}
        </div>

        <h1 className="page-title" style={{ marginTop: '0.75rem', marginBottom: '0.4rem', fontSize: '1.6rem' }}>
          {quizTitle}
        </h1>

        <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
          {!isResultsPublished
            ? 'Your answers have been securely recorded. The educator has not yet published the results to students. Your score, percentage, and detailed evaluation will be available once the educator releases the results.'
            : 'Your answers have been evaluated and recorded into the academic gradebook.'}
        </p>

        {/* Score Summary Box */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          backgroundColor: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.75rem'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Score Obtained</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: isResultsPublished ? 'var(--primary)' : '#94a3b8' }}>
              {isResultsPublished ? score : '🔒 Pending'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Marks</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>{totalMarks}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Questions Answered</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>{answeredCount}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Percentage</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: !isResultsPublished ? '#94a3b8' : isPassed ? 'var(--success)' : 'var(--danger)' }}>
              {isResultsPublished ? `${percentage}%` : 'Pending'}
            </div>
          </div>
        </div>

        {/* Academic Integrity & Proctoring Card - STRICTLY FOR ADMIN & EDUCATOR ONLY */}
        {isStaff && (
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid',
            borderColor: tabSwitches === 0 ? '#bbf7d0' : '#fecaca',
            background: tabSwitches === 0 ? '#f0fdf4' : '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            textAlign: 'left',
            marginBottom: '2rem'
          }}>
            <span style={{ fontSize: '1.6rem' }}>{tabSwitches === 0 ? '🛡️' : '⚠️'}</span>
            <div>
              <div style={{
                fontWeight: '700',
                fontSize: '0.9rem',
                color: tabSwitches === 0 ? '#15803d' : '#b91c1c'
              }}>
                Staff Proctoring Record: {tabSwitches === 0 ? 'Clean Attempt' : `${tabSwitches} Tab Switches Logged`}
              </div>
              <div style={{ fontSize: '0.8rem', color: tabSwitches === 0 ? '#166534' : '#991b1b', marginTop: '0.15rem' }}>
                {tabSwitches === 0
                  ? 'Zero tab switches detected during this attempt. Integrity verified.'
                  : 'Browser focus loss or tab switching was detected during this assessment session.'}
              </div>
            </div>
          </div>
        )}

        {/* Navigation CTAs */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/quizzes">
            <Button variant="primary">Browse More Quizzes</Button>
          </Link>
          {isResultsPublished && (
            <Link to="/analytics">
              <Button variant="outline">View Performance Analytics</Button>
            </Link>
          )}
          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Result;
