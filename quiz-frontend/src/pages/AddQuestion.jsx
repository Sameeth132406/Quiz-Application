import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import questionService from '../services/questionService';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

const AddQuestion = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    marks: 1,
    questionType: 'MULTIPLE_CHOICE'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.questionText.trim()) {
      setError('Question text is required.');
      return;
    }

    if (!formData.optionA.trim() || !formData.optionB.trim() || !formData.optionC.trim() || !formData.optionD.trim()) {
      setError('All four options (A, B, C, D) are required.');
      return;
    }

    if (!formData.correctAnswer) {
      setError('Please select the correct answer option.');
      return;
    }

    if (!formData.marks || Number(formData.marks) <= 0) {
      setError('Marks must be a positive integer.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await questionService.createQuestion({
        quizId: Number(quizId),
        questionText: formData.questionText,
        optionA: formData.optionA,
        optionB: formData.optionB,
        optionC: formData.optionC,
        optionD: formData.optionD,
        correctAnswer: formData.correctAnswer,
        questionType: formData.questionType,
        marks: Number(formData.marks)
      });

      alert('Question added successfully!');
      navigate(`/quizzes/${quizId}/questions`);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to add question. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Error adding question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={() => navigate(`/quizzes/${quizId}/questions`)}
        style={{ marginBottom: '1.5rem' }}
      >
        ← Cancel & Back
      </button>

      <div className="card">
        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Add MCQ Question</h1>
        <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>Add a new question for Quiz #{quizId}</p>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="questionText">Question Text *</label>
            <textarea
              id="questionText"
              name="questionText"
              rows="3"
              className="form-textarea"
              placeholder="e.g. Which of the following is NOT a Java primitive type?"
              value={formData.questionText}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="optionA">Option A *</label>
              <input
                type="text"
                id="optionA"
                name="optionA"
                className="form-input"
                placeholder="Option A content"
                value={formData.optionA}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="optionB">Option B *</label>
              <input
                type="text"
                id="optionB"
                name="optionB"
                className="form-input"
                placeholder="Option B content"
                value={formData.optionB}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="optionC">Option C *</label>
              <input
                type="text"
                id="optionC"
                name="optionC"
                className="form-input"
                placeholder="Option C content"
                value={formData.optionC}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="optionD">Option D *</label>
              <input
                type="text"
                id="optionD"
                name="optionD"
                className="form-input"
                placeholder="Option D content"
                value={formData.optionD}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <label className="form-label">Correct Answer Option *</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
              {['A', 'B', 'C', 'D'].map((opt) => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={opt}
                    checked={formData.correctAnswer === opt}
                    onChange={handleChange}
                    style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                  />
                  Option {opt}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="marks">Marks *</label>
              <input
                type="number"
                id="marks"
                name="marks"
                min="1"
                className="form-input"
                value={formData.marks}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="questionType">Question Type *</label>
              <select
                id="questionType"
                name="questionType"
                className="form-select"
                value={formData.questionType}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="SHORT_ANSWER">Short Answer</option>
                <option value="DESCRIPTIVE">Descriptive</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            Save & Publish Question
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddQuestion;
