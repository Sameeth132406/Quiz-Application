import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from './Button';

const QuizCard = ({ quiz, onDelete }) => {
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();

  const isStaff = role === 'ADMIN' || role === 'EDUCATOR';

  const getDifficultyBadge = (diff) => {
    const diffUpper = (diff || '').toUpperCase();
    if (diffUpper === 'EASY') return <span className="badge badge-easy">Easy</span>;
    if (diffUpper === 'MEDIUM') return <span className="badge badge-medium">Medium</span>;
    if (diffUpper === 'HARD') return <span className="badge badge-hard">Hard</span>;
    return <span className="badge badge-easy">{diff || 'General'}</span>;
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
        {getDifficultyBadge(quiz.difficulty)}
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
      </div>

      <div className="quiz-card-actions">
        <Link to={`/quiz/${quiz.id}`} style={{ textDecoration: 'none' }}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>

        {role === 'STUDENT' && (
          <Link to={`/take-quiz/${quiz.id}`} style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm">
              Take Quiz
            </Button>
          </Link>
        )}

        {isStaff && (
          <>
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
