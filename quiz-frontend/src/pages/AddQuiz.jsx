import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import quizService from '../services/quizService';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

const AddQuiz = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General Knowledge',
    difficulty: 'EASY',
    duration: 15
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    if (!formData.duration || Number(formData.duration) <= 0) {
      setError('Duration must be a positive number of minutes.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const createdQuiz = await quizService.createQuiz({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        duration: Number(formData.duration)
      });
      alert('Quiz created successfully!');
      if (createdQuiz && createdQuiz.id) {
        navigate(`/quizzes/${createdQuiz.id}/add-question`);
      } else {
        navigate('/quizzes');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to create quiz. Please check backend.';
      setError(typeof msg === 'string' ? msg : 'Error creating quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate('/quizzes')} style={{ marginBottom: '1.5rem' }}>
        ← Cancel & Back
      </button>

      <div className="card">
        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Create New Quiz</h1>
        <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>Fill in details to set up a new assessment</p>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Quiz Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              placeholder="e.g. Java Fundamentals Assessment"
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
              placeholder="Brief description of quiz topics and syllabus"
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
                placeholder="e.g. Computer Science"
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
              <label className="form-label" htmlFor="duration">Duration (Minutes) *</label>
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
              Save Quiz & Add Questions →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuiz;
