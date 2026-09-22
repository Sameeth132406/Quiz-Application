import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import quizService from '../services/quizService';
import questionService from '../services/questionService';
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

  const isStaff = role === 'ADMIN' || role === 'EDUCATOR';

  const fetchQuizDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const quizData = await quizService.getQuizById(id);
      setQuiz(quizData);

      try {
        const questions = isStaff
          ? await questionService.getQuestionsByQuiz(id)
          : await questionService.getStudentQuestions(id, false);
        setQuestionCount(Array.isArray(questions) ? questions.length : 0);
      } catch (err) {
        setQuestionCount(0);
      }
    } catch (err) {
      setError('Quiz not found or failed to load quiz details.');
    } finally {
      setLoading(false);
    }
  }, [id, isStaff]);

  useEffect(() => {
    fetchQuizDetails();
  }, [fetchQuizDetails]);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="badge badge-role">{quiz.category || 'General'}</span>
          <span className={`badge badge-${(quiz.difficulty || 'easy').toLowerCase()}`}>{quiz.difficulty}</span>
        </div>

        <h1 className="quiz-detail-title">{quiz.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          {quiz.description || 'No description available for this quiz.'}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-main)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Duration</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>⏱️ {quiz.duration || 15} Mins</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Questions</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>❓ {questionCount} Items</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Difficulty</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>📊 {quiz.difficulty}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {role === 'STUDENT' && (
            <Link to={`/take-quiz/${quiz.id}`} style={{ textDecoration: 'none' }}>
              <Button size="lg" variant="primary">
                Start Quiz Now &rarr;
              </Button>
            </Link>
          )}

          {isStaff && (
            <>
              <Link to={`/quizzes/${quiz.id}/questions`} style={{ textDecoration: 'none' }}>
                <Button size="lg" variant="primary">
                  Manage Questions ({questionCount})
                </Button>
              </Link>
              <Link to={`/edit-quiz/${quiz.id}`} style={{ textDecoration: 'none' }}>
                <Button size="lg" variant="outline">
                  Edit Quiz Info
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDetails;
