import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import quizService from '../services/quizService';
import QuizCard from '../components/QuizCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';

const QuizList = () => {
  const { role } = useContext(AuthContext);

  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await quizService.getQuizzes();
      const list = Array.isArray(data) ? data : [];
      setQuizzes(list);
      setFilteredQuizzes(list);
    } catch (err) {
      setError('Unable to load quizzes. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Re-filter whenever search/difficulty/quizzes change
  useEffect(() => {
    let result = [...quizzes];

    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(
        (q) =>
          (q.title && q.title.toLowerCase().includes(kw)) ||
          (q.description && q.description.toLowerCase().includes(kw)) ||
          (q.category && q.category.toLowerCase().includes(kw))
      );
    }

    if (selectedDifficulty !== 'ALL') {
      result = result.filter(
        (q) => (q.difficulty || '').toUpperCase() === selectedDifficulty.toUpperCase()
      );
    }

    setFilteredQuizzes(result);
  }, [searchKeyword, selectedDifficulty, quizzes]);

  const handleDeleteQuiz = async (quizId) => {
    try {
      await quizService.deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      alert('Quiz deleted successfully.');
    } catch (err) {
      alert('Failed to delete quiz.');
    }
  };

  return (
    <div>
      <div className="page-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.875rem', fontWeight: '800', color: 'var(--text-main, #0f172a)' }}>
            Available Quizzes
          </h1>
          <p className="page-subtitle" style={{ margin: '0.35rem 0 0 0', color: 'var(--text-muted, #64748b)', fontSize: '0.95rem' }}>
            Test your skills across various topics and difficulty levels
          </p>
        </div>
        {(role === 'ADMIN' || role === 'EDUCATOR') && (
          <Link to="/add-quiz" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', padding: '0.65rem 1.25rem' }}>
              + Create Quiz
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="quiz-filters">
        <input
          type="text"
          className="form-input quiz-search-input"
          placeholder="🔍 Search quizzes by title or category..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '160px' }}
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {loading ? (
        <Loading message="Loading quizzes..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchQuizzes} />
      ) : filteredQuizzes.length === 0 ? (
        <div className="empty-state">
          <h3>No quizzes available.</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            Try adjusting your search query or difficulty filter.
          </p>
        </div>
      ) : (
        <div className="quiz-grid">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onDelete={handleDeleteQuiz}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;
