import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { questionService } from '../services/questionService';
import { attemptService } from '../services/attemptService';
import { integrityService } from '../services/integrityService';

const QuizRunner = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: selectedOptionText }
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');

  const attemptRef = useRef(null);
  attemptRef.current = attempt;

  // Initialize Quiz Attempt
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const qData = await quizService.getQuizById(quizId);
        setQuiz(qData);

        // Fetch student questions
        const questionsData = await questionService.getQuestionsForStudent(quizId);
        setQuestions(questionsData || []);

        // Start Quiz Attempt
        const newAttempt = await attemptService.startQuiz({
          userId: 1, // Fallback if user ID numerical isn't provided
          quizId: parseInt(quizId, 10),
          score: 0,
          status: 'IN_PROGRESS',
          startedAt: new Date().toISOString(),
        });
        setAttempt(newAttempt);

        // Initialize Timer
        const durationMins = qData.duration || 30;
        setTimeLeft(durationMins * 60);
      } catch (err) {
        console.error('Error starting quiz runner', err);
        alert(err.response?.data?.message || 'Unable to start quiz');
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  // Integrity Event Tracking (Tab Switch / Window Blur)
  useEffect(() => {
    const handleBlur = async () => {
      if (attemptRef.current?.id) {
        setWarningMsg('⚠️ Warning: Window blur/tab switch detected! This event has been logged for proctoring.');
        try {
          await integrityService.addEvent({
            userId: 1,
            attemptId: attemptRef.current.id,
            eventType: 'TAB_SWITCH',
            timestamp: new Date().toISOString(),
            details: 'User navigated away from examination window',
          });
        } catch (e) {
          console.error('Failed to log integrity event', e);
        }
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  // Timer Countdown
  useEffect(() => {
    if (loading || submitting || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz(); // Auto submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, submitting, timeLeft]);

  const handleSelectOption = (questionId, optionValue) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionValue,
    }));
  };

  const handleFinishQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      let calculatedScore = 0;
      
      // Submit individual responses
      for (const q of questions) {
        const selected = userAnswers[q.id] || '';
        // Check correctness if available or backend evaluates
        const isCorrect = false; 
        
        await attemptService.submitResponse({
          attemptId: attempt.id,
          questionId: q.id,
          selectedAnswer: selected,
          correct: isCorrect,
        });

        if (selected) {
          calculatedScore += q.marks || 1;
        }
      }

      // Update attempt to COMPLETED
      await attemptService.updateAttempt(attempt.id, {
        ...attempt,
        score: calculatedScore,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      });

      navigate(`/quiz-result/${attempt.id}`);
    } catch (err) {
      console.error('Error submitting quiz attempt', err);
      alert('Failed to submit quiz attempt.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="loading-spinner">Preparing examination session...</div>;
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="page-wrapper quiz-runner-container">
      {/* Header bar with timer */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>{quiz?.title}</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="timer-box">
          ⏱️ <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {warningMsg && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(245, 158, 11, 0.2)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          color: '#fbbf24',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
        }}>
          {warningMsg}
        </div>
      )}

      {/* Current Question View */}
      {currentQ ? (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span className="badge badge-student">Marks: {currentQ.marks || 1}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Type: {currentQ.questionType || 'MCQ'}</span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            {currentQ.questionText}
          </h3>

          {/* Options */}
          <div style={{ marginBottom: '2rem' }}>
            {[
              { label: 'A', text: currentQ.optionA },
              { label: 'B', text: currentQ.optionB },
              { label: 'C', text: currentQ.optionC },
              { label: 'D', text: currentQ.optionD },
            ].map((opt) => (
              <div
                key={opt.label}
                className={`option-card ${userAnswers[currentQ.id] === opt.text ? 'selected' : ''}`}
                onClick={() => handleSelectOption(currentQ.id, opt.text)}
              >
                <div className="option-letter">{opt.label}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{opt.text}</div>
              </div>
            ))}
          </div>

          {/* Pagination Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
            >
              ← Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
              >
                Next Question →
              </button>
            ) : (
              <button
                className="btn btn-success btn-lg"
                disabled={submitting}
                onClick={handleFinishQuiz}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz ✓'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card empty-state">
          <h3>No questions available for this quiz.</h3>
        </div>
      )}
    </div>
  );
};

export default QuizRunner;
