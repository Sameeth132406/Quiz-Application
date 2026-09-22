import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../services/quizService';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'EASY',
    duration: 15
  });
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchQuiz = useCallback(async () => {
    setFetching(true);
    setError('');
    try {
      const data = await quizService.getQuizById(id);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || 'General',
        difficulty: data.difficulty || 'EASY',
        duration: data.duration || 15
      });
    } catch (err) {
      setError('Unable to load quiz details for editing.');
    } finally {
      setFetching(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Quiz title is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await quizService.updateQuiz(id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        duration: Number(formData.duration)
      });
      alert('Quiz updated successfully!');
      navigate(`/quiz/${id}`);
    } catch (err) {
      setError('Failed to update quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loading message="Loading quiz details..." />;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/quiz/${id}`)} style={{ marginBottom: '1.5rem' }}>
        ← Cancel
      </button>

      <div className="card">
        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Edit Quiz</h1>
        <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>Update details for Quiz #{id}</p>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Quiz Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="difficulty">Difficulty Level</label>
              <select
                id="difficulty"
                name="difficulty"
                className="form-select"
                value={formData.difficulty}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="duration">Duration (Minutes)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                min="1"
                className="form-input"
                value={formData.duration}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <Button type="submit" variant="primary" isLoading={loading} style={{ flex: 1 }}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuiz;
