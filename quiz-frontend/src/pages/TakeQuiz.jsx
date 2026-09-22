import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import questionService from '../services/questionService';
import quizService from '../services/quizService';
import attemptService from '../services/attemptService';
import authService from '../services/authService';
import integrityService from '../services/integrityService';
import QuestionCard from '../components/QuestionCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [randomizedOptionsMap, setRandomizedOptionsMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Quiz Timer State
  const [timeLeft, setTimeLeft] = useState(null);
  const [totalTime, setTotalTime] = useState(null);
  const isAutoSubmittingRef = useRef(false);
  const timerRef = useRef(null);

  // Tab-Switch Monitoring State
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const tabWarningTimerRef = useRef(null);
  const lastBlurTimestampRef = useRef(0);

  // Attempt Start Timestamp
  const startTimeRef = useRef(new Date().toISOString());

  // Fisher-Yates Shuffle
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const fetchQuizAndQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const quizRes = await quizService.getQuizById(id).catch(() => null);
      setQuiz(quizRes);

      // Duration calculation
      const durationMins = quizRes?.duration && quizRes.duration > 0 ? quizRes.duration : 15;
      const durationSeconds = durationMins * 60;
      setTimeLeft(durationSeconds);
      setTotalTime(durationSeconds);

      // Fetch student questions
      const studentQuestions = await questionService.getStudentQuestions(id, true);

      if (!studentQuestions || studentQuestions.length === 0) {
        setError('This assessment has no questions available at the moment.');
      } else {
        // Smart Randomization 1: Shuffle questions for each attempt
        const shuffledQuestions = shuffleArray(studentQuestions);
        setQuestions(shuffledQuestions);

        // Smart Randomization 2: Shuffle options within each question
        const optionsMap = {};
        const labels = ['A', 'B', 'C', 'D'];

        shuffledQuestions.forEach((q) => {
          const rawOptions = [
            { text: q.optionA, value: 'A' },
            { text: q.optionB, value: 'B' },
            { text: q.optionC, value: 'C' },
            { text: q.optionD, value: 'D' }
          ].filter(o => o.text !== undefined && o.text !== null && o.text !== '');

          const shuffledOpts = shuffleArray(rawOptions).map((opt, idx) => ({
            label: labels[idx] || `${idx + 1}`,
            text: opt.text,
            value: opt.value // preserves original answer key
          }));

          optionsMap[q.id] = shuffledOpts;
        });

        setRandomizedOptionsMap(optionsMap);
      }
    } catch (err) {
      setError('Unable to load quiz assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuizAndQuestions();
  }, [fetchQuizAndQuestions]);

  // Tab-Switch Monitoring Event Listeners
  useEffect(() => {
    const handleSwitch = (source) => {
      // Debounce events firing simultaneously
      const now = Date.now();
      if (now - lastBlurTimestampRef.current < 800) return;
      lastBlurTimestampRef.current = now;

      setTabSwitchCount((prev) => {
        const next = prev + 1;

        // Display on-screen warning toast
        setShowTabWarning(true);
        if (tabWarningTimerRef.current) clearTimeout(tabWarningTimerRef.current);
        tabWarningTimerRef.current = setTimeout(() => setShowTabWarning(false), 5000);

        // Log Academic Integrity Event to Backend
        integrityService.addEvent({
          userId: user?.id || 1,
          quizAttemptId: null,
          eventType: 'TAB_SWITCH',
          eventTime: new Date().toISOString(),
          remarks: `Tab switch detected via ${source}. Violation #${next} during quiz #${id}`
        }).catch(() => {});

        return next;
      });
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleSwitch('visibilitychange');
      }
    };

    const onBlur = () => {
      handleSwitch('window_blur');
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      if (tabWarningTimerRef.current) clearTimeout(tabWarningTimerRef.current);
    };
  }, [id, user]);

  // Submit Handler
  const handleSubmitQuiz = useCallback(async (isAutoSubmit = false) => {
    if (isAutoSubmittingRef.current || submitting) return;

    if (!isAutoSubmit) {
      const answeredCount = Object.keys(userAnswers).length;
      const confirmMsg = answeredCount < questions.length
        ? `You answered ${answeredCount} of ${questions.length} questions. Submit anyway?`
        : 'Are you sure you want to submit your assessment?';

      if (!window.confirm(confirmMsg)) return;
    }

    isAutoSubmittingRef.current = true;
    setSubmitting(true);

    let currentUserId = user?.id;
    if (!currentUserId) {
      try {
        const me = await authService.getCurrentUser();
        if (me?.id) currentUserId = me.id;
      } catch (e) {}
    }

    const submissionPayload = {
      userId: currentUserId || 1,
      answers: userAnswers,
      startedAt: startTimeRef.current,
      completedAt: new Date().toISOString(),
      tabSwitches: tabSwitchCount
    };

    try {
      const response = await attemptService.submitQuiz(id, submissionPayload);

      const attemptId = response?.attemptId || response?.id || id;
      navigate(`/result/${attemptId}`, {
        state: {
          resultData: response,
          quizTitle: quiz?.title || 'Quiz Assessment',
          totalQuestions: questions.length,
          userAnswers: userAnswers,
          tabSwitches: tabSwitchCount,
          autoSubmitted: isAutoSubmit
        }
      });
    } catch (err) {
      // Fallback navigation with local state
      navigate(`/result/${id}`, {
        state: {
          quizTitle: quiz?.title || 'Quiz Assessment',
          totalQuestions: questions.length,
          userAnswers: userAnswers,
          tabSwitches: tabSwitchCount,
          autoSubmitted: isAutoSubmit
        }
      });
    } finally {
      setSubmitting(false);
    }
  }, [id, questions.length, quiz?.title, submitting, tabSwitchCount, user?.id, userAnswers, navigate]);

  // Countdown Timer Interval
  useEffect(() => {
    if (timeLeft === null || loading || submitting) return;

    if (timeLeft <= 0) {
      if (!isAutoSubmittingRef.current) {
        handleSubmitQuiz(true);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, loading, submitting, handleSubmitQuiz]);

  const handleSelectOption = (questionId, optionSelected) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionSelected
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) return <Loading message="Preparing randomized quiz assessment..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchQuizAndQuestions} />;
  if (questions.length === 0) return <div className="empty-state">No questions found for this quiz.</div>;

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = userAnswers[currentQuestion.id] || '';
  const currentShuffledOptions = randomizedOptionsMap[currentQuestion.id] || null;

  // Format Timer Display (MM:SS)
  const formatTimer = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Timer urgency style
  const timerClass =
    timeLeft <= 60
      ? 'timer-urgent'
      : totalTime && timeLeft <= totalTime * 0.25
      ? 'timer-warning'
      : 'timer-normal';

  return (
    <div className="take-quiz-container">
      {/* Tab Switch Warning Toast */}
      {showTabWarning && (
        <div className="tab-switch-alert-banner">
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>
              Academic Integrity Alert: Tab Switch Detected! (Count: {tabSwitchCount})
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              Switching tabs or minimizing the browser is logged as a violation. Please stay on this tab until completion.
            </div>
          </div>
          <button
            onClick={() => setShowTabWarning(false)}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Meta Bar */}
      <div className="take-quiz-progress">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
              {quiz ? quiz.title : `Quiz #${id}`}
            </h2>
            <span className="randomization-badge" title="Questions and options are randomized for each attempt">
              🔀 Smart Randomization
            </span>
          </div>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Right side: Timer & Integrity Badge */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Live Countdown Timer */}
          <div className={`quiz-timer-pill ${timerClass}`} title="Time Remaining">
            <span>⏱️</span>
            <span>{formatTimer(timeLeft)}</span>
            {timeLeft <= 60 && <span style={{ fontSize: '0.7rem' }}>URGENT</span>}
          </div>

          {/* Tab Switch Monitor Pill */}
          <div
            className={`integrity-badge-indicator ${tabSwitchCount === 0 ? 'clean' : 'warning'}`}
            title="Tab switches during attempt"
          >
            <span>{tabSwitchCount === 0 ? '🛡️' : '⚠️'}</span>
            <span>Switches: {tabSwitchCount}</span>
          </div>

          {/* Progress pill */}
          <span className="badge badge-role">
            Answered {Object.keys(userAnswers).length} / {questions.length}
          </span>
        </div>
      </div>

      {/* Active Question Card */}
      <QuestionCard
        question={currentQuestion}
        index={currentIndex}
        selectedAnswer={selectedAnswer}
        onSelectOption={handleSelectOption}
        shuffledOptions={currentShuffledOptions}
        isInteractive={true}
      />

      {/* Navigation Controls */}
      <div className="quiz-action-bar">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0 || submitting}
        >
          &larr; Previous
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={submitting}
          >
            Next Question &rarr;
          </Button>
        ) : (
          <Button
            variant="danger"
            onClick={() => handleSubmitQuiz(false)}
            isLoading={submitting}
          >
            Submit Assessment &check;
          </Button>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;
