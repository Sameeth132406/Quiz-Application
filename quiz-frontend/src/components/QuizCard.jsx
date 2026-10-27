import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import quizService from '../services/quizService';
import Button from './Button';

const QuizCard = ({ quiz, onDelete }) => {
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();

  const isStaff = role === 'ADMIN' || role === 'EDUCATOR';
  const [resultsPublished, setResultsPublished] = useState(Boolean(quiz?.resultsPublished));
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    setResultsPublished(Boolean(quiz?.resultsPublished));
  }, [quiz?.resultsPublished]);

  const getDifficultyBadge = (diff) => {
    const diffUpper = (diff || '').toUpperCase();
    if (diffUpper === 'EASY') return <span className="badge badge-easy">Easy</span>;
    if (diffUpper === 'MEDIUM') return <span className="badge badge-medium">Medium</span>;
    if (diffUpper === 'HARD') return <span className="badge badge-hard">Hard</span>;
    return <span className="badge badge-easy">{diff || 'General'}</span>;
  };

  const handleTogglePublish = async () => {
    setPublishing(true);
    try {
      const nextState = !resultsPublished;
      await quizService.publishResults(quiz.id, nextState);
      setResultsPublished(nextState);
    } catch (err) {
      alert('Failed to update result publication status.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete quiz "${quiz.title}"?`)) {
      if (onDelete) onDelete(quiz.id);
    }
  };

  return (
    <div className="quiz-card">
      <div className="quiz-card-header">
        <h3 className="quiz-title">{quiz.title}</h3>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {getDifficultyBadge(quiz.difficulty)}
        </div>
      </div>

      <p className="quiz-description">{quiz.description || 'No description provided.'}</p>

      <div className="quiz-meta">
        <div className="quiz-meta-item">
          <span>🏷️</span>
          <span>{quiz.category || 'General'}</span>
        </div>
        <div className="quiz-meta-item">
          <span>⏱️</span>
          <span>{quiz.duration || 15} mins</span>
        </div>
        {quiz.questionCount !== undefined && (
          <div className="quiz-meta-item">
            <span>❓</span>
            <span>{quiz.questionCount} Questions</span>
          </div>
        )}
        <div className="quiz-meta-item">
          <span>{resultsPublished ? '📢' : '⏳'}</span>
          <span style={{ color: resultsPublished ? '#15803d' : '#b45309', fontWeight: '600' }}>
            {resultsPublished ? 'Results Released' : 'Results Pending'}
          </span>
        </div>
        {quiz.endDate && (
          <div className="quiz-meta-item">
            <span>{new Date() > new Date(quiz.endDate) ? '⛔' : '⏳'}</span>
            <span style={{ color: new Date() > new Date(quiz.endDate) ? '#dc2626' : '#b45309', fontWeight: '600' }}>
              {new Date() > new Date(quiz.endDate)
                ? `Closed (${new Date(quiz.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })})`
                : `Due: ${new Date(quiz.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
            </span>
          </div>
        )}
      </div>

      <div className="quiz-card-actions">
        <Link to={`/quiz/${quiz.id}`} style={{ textDecoration: 'none' }}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>

        {role === 'STUDENT' && (
          quiz.endDate && new Date() > new Date(quiz.endDate) ? (
            <Button variant="outline" size="sm" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} title="Assessment deadline has expired">
              ⛔ Closed
            </Button>
          ) : (
            <Link to={`/take-quiz/${quiz.id}`} style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm">
                Start Quiz
              </Button>
            </Link>
          )
        )}

        {isStaff && (
          <>
            <button
              type="button"
              disabled={publishing}
              onClick={handleTogglePublish}
              style={{
                fontSize: '0.74rem',
                fontWeight: '700',
                padding: '0.28rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: resultsPublished ? '#bbf7d0' : '#fde68a',
                background: resultsPublished ? '#f0fdf4' : '#fffbeb',
                color: resultsPublished ? '#15803d' : '#b45309',
                cursor: publishing ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
              title="Click to toggle releasing results to all enrolled students"
            >
              {publishing ? 'Updating...' : resultsPublished ? '📢 Published' : '🚀 Publish Results'}
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
            >
              Questions
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/edit-quiz/${quiz.id}`)}
            >
              Edit
            </Button>

            {role === 'ADMIN' && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
