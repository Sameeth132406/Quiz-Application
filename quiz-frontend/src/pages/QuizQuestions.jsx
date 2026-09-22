import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import questionService from '../services/questionService';
import quizService from '../services/quizService';
import QuestionCard from '../components/QuestionCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';

const QuizQuestions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isStaff = role === 'ADMIN' || role === 'EDUCATOR';

  const fetchQuestionsAndQuiz = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const quizRes = await quizService.getQuizById(quizId).catch(() => null);
      setQuiz(quizRes);

      let questionList = [];
      if (isStaff) {
        questionList = await questionService.getQuestionsByQuiz(quizId);
      } else {
        questionList = await questionService.getStudentQuestions(quizId);
      }

      setQuestions(Array.isArray(questionList) ? questionList : []);
    } catch (err) {
      setError('Unable to load questions for this quiz.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, isStaff]);

  useEffect(() => {
    fetchQuestionsAndQuiz();
  }, [fetchQuestionsAndQuiz]);

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionService.deleteQuestion(questionId);
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        alert('Question deleted successfully.');
      } catch (err) {
        alert('Failed to delete question.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={() => navigate(`/quiz/${quizId}`)}
        style={{ marginBottom: '1.5rem' }}
      >
        ← Back to Quiz Details
      </button>

      <div className="page-header">
        <div>
          <h1 className="page-title">
            Questions — {quiz ? quiz.title : `Quiz #${quizId}`}
          </h1>
          <p className="page-subtitle">
            {isStaff ? 'Manage and review assessment question bank' : 'Review quiz questions overview'}
          </p>
        </div>

        {isStaff && (
          <Link to={`/quizzes/${quizId}/add-question`}>
            <Button variant="primary">+ Add New MCQ Question</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <Loading message="Loading quiz questions..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchQuestionsAndQuiz} />
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <h3>No questions available for this quiz.</h3>
          {isStaff ? (
            <p style={{ marginTop: '0.5rem' }}>
              Click <strong>+ Add New MCQ Question</strong> to create questions.
            </p>
          ) : (
            <p style={{ marginTop: '0.5rem' }}>Please check back later once questions are published.</p>
          )}
        </div>
      ) : (
        <div className="questions-list">
          {questions.map((question, idx) => (
            <QuestionCard
              key={question.id || idx}
              question={question}
              index={idx}
              onDeleteQuestion={isStaff ? handleDeleteQuestion : null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizQuestions;
