import React, { useState, useEffect } from 'react';
import { quizService } from '../services/quizService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const QuizzesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEducatorOrAdmin = ['ADMIN', 'EDUCATOR', 'ACADEMIC_ADMIN'].includes(user?.role);

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [duration, setDuration] = useState(30);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      let data = [];
      if (searchTitle.trim()) {
        data = await quizService.searchByTitle(searchTitle);
      } else if (selectedDifficulty !== 'ALL') {
        data = await quizService.getByDifficulty(selectedDifficulty);
      } else {
        data = await quizService.getAllQuizzes();
      }
      setQuizzes(data || []);
    } catch (err) {
      console.error('Error fetching quizzes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDifficulty]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuizzes();
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('General');
    setDifficulty('EASY');
    setDuration(30);
    setShowModal(true);
  };

  const handleOpenEditModal = (quiz) => {
    setEditingId(quiz.id);
    setTitle(quiz.title);
    setDescription(quiz.description);
    setCategory(quiz.category);
    setDifficulty(quiz.difficulty);
    setDuration(quiz.duration);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, description, category, difficulty, duration: parseInt(duration, 10) };
    try {
      if (editingId) {
        await quizService.updateQuiz(editingId, payload);
      } else {
        await quizService.addQuiz(payload);
      }
      setShowModal(false);
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save quiz');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizService.deleteQuiz(id);
        fetchQuizzes();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete quiz');
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quizzes & Assessments</h1>
          <p className="page-subtitle">Test your knowledge or create new structured exams</p>
        </div>
        {isEducatorOrAdmin && (
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            + Create New Quiz
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search quiz title..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Difficulty:</span>
          <select
            className="form-control"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{ padding: '0.5rem 0.85rem' }}
          >
            <option value="ALL">All Levels</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Quiz Cards */}
      {loading ? (
        <div className="loading-spinner">Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Quizzes Available</h3>
          <p>No matching quizzes found. Try adjusting filters or search term.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="glass-card interactive" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className={`badge badge-${quiz.difficulty?.toLowerCase()}`}>{quiz.difficulty}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏱️ {quiz.duration} Mins</span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.4rem' }}>{quiz.title}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Category: {quiz.category}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', flex: 1, marginBottom: '1.25rem' }}>
                {quiz.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/quiz-runner/${quiz.id}`)}
                >
                  🚀 Take Quiz
                </button>

                {isEducatorOrAdmin && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => navigate(`/questions/${quiz.id}`)}
                    >
                      ❓ Manage Questions
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEditModal(quiz)}
                    >
                      Edit
                    </button>
                    {user?.role === 'ADMIN' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(quiz.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit Quiz */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Quiz' : 'Create New Quiz'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Quiz Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Midterm Java Programming"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Computer Science / Math"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-control"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Brief description of topics covered..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Quiz</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;
