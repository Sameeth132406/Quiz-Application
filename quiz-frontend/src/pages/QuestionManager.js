import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionService } from '../services/questionService';
import { quizService } from '../services/quizService';

const QuestionManager = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [marks, setMarks] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const [qInfo, qList] = await Promise.all([
        quizService.getQuizById(quizId),
        questionService.getQuestionsByQuiz(quizId),
      ]);
      setQuiz(qInfo);
      setQuestions(qList || []);
    } catch (err) {
      console.error('Failed to load quiz questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('');
    setQuestionType('MULTIPLE_CHOICE');
    setMarks(1);
    setShowModal(true);
  };

  const handleOpenEdit = (q) => {
    setEditingId(q.id);
    setQuestionText(q.questionText);
    setOptionA(q.optionA);
    setOptionB(q.optionB);
    setOptionC(q.optionC);
    setOptionD(q.optionD);
    setCorrectAnswer(q.correctAnswer);
    setQuestionType(q.questionType || 'MULTIPLE_CHOICE');
    setMarks(q.marks || 1);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      quizId: parseInt(quizId, 10),
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      questionType,
      marks: parseInt(marks, 10),
    };

    try {
      if (editingId) {
        await questionService.updateQuestion(editingId, payload);
      } else {
        await questionService.addQuestion(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save question');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this question?')) {
      try {
        await questionService.deleteQuestion(id);
        loadData();
      } catch (err) {
        alert('Failed to delete question');
      }
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading quiz questions...</div>;
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/quizzes')} style={{ marginBottom: '0.75rem' }}>
            ← Back to Quizzes
          </button>
          <h1 className="page-title">Manage Questions</h1>
          <p className="page-subtitle">
            Quiz: <strong style={{ color: '#fff' }}>{quiz?.title}</strong> ({questions.length} Questions)
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          + Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-icon">❓</div>
          <h3>No Questions Added</h3>
          <p>Click "+ Add Question" to populate this quiz with questions.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questions.map((q, idx) => (
            <div key={q.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  {idx + 1}. {q.questionText}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="badge badge-student" style={{ fontSize: '0.75rem' }}>{q.marks} Marks</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(q)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id)}>Delete</button>
                </div>
              </div>

              {/* Options Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', margin: '0.75rem 0' }}>
                <div style={{ padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', background: q.correctAnswer === q.optionA ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)', border: q.correctAnswer === q.optionA ? '1px solid #10b981' : '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                  <strong>A:</strong> {q.optionA}
                </div>
                <div style={{ padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', background: q.correctAnswer === q.optionB ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)', border: q.correctAnswer === q.optionB ? '1px solid #10b981' : '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                  <strong>B:</strong> {q.optionB}
                </div>
                <div style={{ padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', background: q.correctAnswer === q.optionC ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)', border: q.correctAnswer === q.optionC ? '1px solid #10b981' : '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                  <strong>C:</strong> {q.optionC}
                </div>
                <div style={{ padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', background: q.correctAnswer === q.optionD ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)', border: q.correctAnswer === q.optionD ? '1px solid #10b981' : '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                  <strong>D:</strong> {q.optionD}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600' }}>
                ✓ Correct Answer: {q.correctAnswer}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Add/Edit Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Question' : 'Add Question'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Question Text</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter problem statement or question..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Option A</label>
                  <input type="text" className="form-control" value={optionA} onChange={(e) => setOptionA(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Option B</label>
                  <input type="text" className="form-control" value={optionB} onChange={(e) => setOptionB(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Option C</label>
                  <input type="text" className="form-control" value={optionC} onChange={(e) => setOptionC(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Option D</label>
                  <input type="text" className="form-control" value={optionD} onChange={(e) => setOptionD(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Correct Option</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Exact option text or A/B/C/D"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Question Type</label>
                  <select className="form-control" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                    <option value="MULTIPLE_CHOICE">MULTIPLE_CHOICE</option>
                    <option value="TRUE_FALSE">TRUE_FALSE</option>
                    <option value="SHORT_ANSWER">SHORT_ANSWER</option>
                    <option value="DESCRIPTIVE">DESCRIPTIVE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Marks</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;
