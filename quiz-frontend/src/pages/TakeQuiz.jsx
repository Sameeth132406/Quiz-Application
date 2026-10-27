import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import questionService from '../services/questionService';
import quizService from '../services/quizService';
import attemptService from '../services/attemptService';
import authService from '../services/authService';
import integrityService from '../services/integrityService';
import proctoringService from '../services/proctoringService';
import QuestionCard from '../components/QuestionCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import '../styles/proctoring.css';

const isDocumentFullscreen = () => {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
};

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useContext(AuthContext);

  // Exam Data State
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [randomizedOptionsMap, setRandomizedOptionsMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Proctoring Attempt & Stream State
  const [attemptId, setAttemptId] = useState(null);
  const attemptIdRef = useRef(null);
  const [eligibility, setEligibility] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareError, setScreenShareError] = useState('');
  const [screenShareStoppedModal, setScreenShareStoppedModal] = useState(false);
  const mediaStreamRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const screenshotTimerRef = useRef(null);
  const sequenceNumberRef = useRef(1);
  const [snapshotCount, setSnapshotCount] = useState(0);

  // Fullscreen Proctoring Enforcement State
  const [isFullscreenActive, setIsFullscreenActive] = useState(isDocumentFullscreen);
  const [quizStarted, setQuizStarted] = useState(false);
  const quizStartedRef = useRef(false);
  const [fullscreenExitWarning, setFullscreenExitWarning] = useState(false);

  // Quiz Timer State
  const [timeLeft, setTimeLeft] = useState(null);
  const [totalTime, setTotalTime] = useState(null);
  const isAutoSubmittingRef = useRef(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(new Date().toISOString());

  // Tab-Switch Monitoring State (Only 2 allowed, 3rd auto-submits)
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const lastBlurTimestampRef = useRef(0);
  // Submit Confirmation Dialog State (Requires typing "submit")
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitConfirmText, setSubmitConfirmText] = useState('');

  // Question Navigation & Review States
  const [reviewQuestions, setReviewQuestions] = useState({});
  const [savedQuestions, setSavedQuestions] = useState({});

  const [tabSwitchModal, setTabSwitchModal] = useState({
    visible: false,
    count: 0,
    title: '',
    message: '',
    isFinal: false,
    isTerminated: false
  });

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
      const [quizRes, studentQuestions, elig] = await Promise.all([
        quizService.getQuizById(id).catch(() => null),
        questionService.getStudentQuestions(id, true).catch(() => []),
        attemptService.getQuizEligibility(id).catch(() => null)
      ]);

      setQuiz(quizRes);
      setEligibility(elig);

      // Duration calculation
      const durationMins = quizRes?.duration && quizRes.duration > 0 ? quizRes.duration : 15;
      const durationSeconds = durationMins * 60;
      setTimeLeft(durationSeconds);
      setTotalTime(durationSeconds);

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
            value: opt.value
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

  // Clean up all media tracks and timers
  const cleanupProctoringHardware = useCallback(() => {
    if (screenshotTimerRef.current) {
      clearInterval(screenshotTimerRef.current);
      screenshotTimerRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      mediaStreamRef.current = null;
    }
    if (isDocumentFullscreen()) {
      try {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Periodic ~5s screenshot capture & upload
  const captureAndUploadScreenshot = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !attemptIdRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.srcObject && mediaStreamRef.current) {
      video.srcObject = mediaStreamRef.current;
      await video.play().catch(() => { });
    }

    if (video.readyState < 2 || video.videoWidth === 0) return;

    try {
      const maxW = 1280;
      const scale = video.videoWidth > maxW ? maxW / video.videoWidth : 1;
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await proctoringService.canvasToBlob(canvas, 'image/jpeg', 0.6);
      const seq = sequenceNumberRef.current++;
      const now = new Date().toISOString();

      await proctoringService.uploadScreenshot(attemptIdRef.current, blob, seq, now);
      setSnapshotCount(prev => prev + 1);
    } catch (err) {
      console.warn('Proctoring snapshot capture warning:', err);
    }
  }, []);

  // Ensure stream stays bound to videoRef across re-renders
  useEffect(() => {
    if (mediaStreamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }
      videoRef.current.play().catch(e => console.warn('Video auto-play caught:', e));
    }
  }, [quizStarted, isScreenSharing]);

  // Request Screen Sharing, Fullscreen, and officially start assessment
  const handleEnterFullscreenAndStart = async () => {
    setScreenShareError('');

    if (eligibility && !eligibility.canAttempt) {
      if (eligibility.isExpired) {
        setScreenShareError('The deadline for this assessment has passed. New attempts are closed.');
        return;
      }
      setScreenShareError(`Maximum allowed attempts (${eligibility.allowedAttempts}) reached for this assessment.`);
      return;
    }

    try {
      // 1. Mandatory Screen Capture Permission Request
      let stream;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always'
          },
          audio: false
        });
      } catch (mediaErr) {
        console.error('Screen sharing denied or failed:', mediaErr);
        setScreenShareError(
          'Screen sharing permission is strictly required to proceed with this proctored examination. Please click "Grant Screen Sharing & Start Test" and select your screen.'
        );
        return;
      }

      mediaStreamRef.current = stream;
      setIsScreenSharing(true);

      // Connect stream to offscreen video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(e => console.warn('Video play caught:', e));
      }

      // Listen for unexpected screen share termination
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setIsScreenSharing(false);
          setScreenShareStoppedModal(true);
          if (attemptIdRef.current && user) {
            proctoringService.recordIntegrityEvent(
              attemptIdRef.current,
              user.id,
              'SCREEN_SHARE_STOPPED',
              'Screen sharing stream terminated unexpectedly by student.'
            );
          }
        };
      }

      // 2. Request Fullscreen Mode
      try {
        const el = document.documentElement;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        }
        setIsFullscreenActive(true);
      } catch (err) {
        console.warn('Browser fullscreen error (fallback granted):', err);
        setIsFullscreenActive(true);
      }

      // 3. Initialize Proctored Quiz Attempt in Backend
      let activeAttemptId = null;
      try {
        const proctoredAttempt = await proctoringService.startProctoredExam(id);
        if (proctoredAttempt?.id) {
          activeAttemptId = proctoredAttempt.id;
          setAttemptId(proctoredAttempt.id);
          attemptIdRef.current = proctoredAttempt.id;
        }
      } catch (attErr) {
        console.warn('Proctored attempt initialization fallback:', attErr);
      }

      setQuizStarted(true);
      quizStartedRef.current = true;
      startTimeRef.current = new Date().toISOString();

      // Note: Periodic 5s screenshots disabled per requirement.
      // Evidence snapshots are captured ONLY upon tab switch or external agent (e.g. Gemini) attempts!

    } catch (generalErr) {
      console.error('Failed to initiate proctored exam:', generalErr);
      setScreenShareError('Failed to initiate secure proctored environment. Please verify browser permissions.');
    }
  };

  // Re-enable screen sharing if disconnected
  const handleResumeScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      mediaStreamRef.current = stream;
      setIsScreenSharing(true);
      setScreenShareStoppedModal(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => { });
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setIsScreenSharing(false);
          setScreenShareStoppedModal(true);
          if (attemptIdRef.current && user) {
            proctoringService.recordIntegrityEvent(
              attemptIdRef.current,
              user.id,
              'SCREEN_SHARE_STOPPED',
              'Screen sharing stream terminated unexpectedly.'
            );
          }
        };
      }

      if (attemptIdRef.current && user) {
        proctoringService.recordIntegrityEvent(
          attemptIdRef.current,
          user.id,
          'SCREEN_SHARE_STARTED',
          'Student resumed screen sharing stream.'
        );
      }
    } catch (err) {
      console.error('Failed to resume screen sharing:', err);
    }
  };

  // Submit Modal Controls
  const handleOpenSubmitModal = () => {
    setSubmitConfirmText('');
    setShowSubmitModal(true);
  };

  const handleCloseSubmitModal = () => {
    setShowSubmitModal(false);
    setSubmitConfirmText('');
  };

  const handleConfirmModalSubmit = () => {
    if (submitConfirmText.trim().toLowerCase() !== 'submit') return;
    setShowSubmitModal(false);
    handleSubmitQuiz(true, 'USER_SUBMIT');
  };

  // Submit Handler
  const handleSubmitQuiz = useCallback(async (isAutoSubmit = false, reason = '') => {
    if (isAutoSubmittingRef.current || submitting) return;

    isAutoSubmittingRef.current = true;
    setSubmitting(true);

    if (reason === 'FULLSCREEN_EXIT') {
      setFullscreenExitWarning(true);
    }

    // Cleanly stop hardware and exit fullscreen
    cleanupProctoringHardware();

    let currentUserId = user?.id;
    if (!currentUserId) {
      try {
        const me = await authService.getCurrentUser();
        if (me?.id) currentUserId = me.id;
      } catch (e) { }
    }

    const submissionPayload = {
      userId: currentUserId || 1,
      attemptId: attemptIdRef.current,
      answers: userAnswers,
      startedAt: startTimeRef.current,
      completedAt: new Date().toISOString(),
      tabSwitches: reason === 'FULLSCREEN_EXIT' ? tabSwitchCount + 1 : tabSwitchCount
    };

    if (isAutoSubmit && attemptIdRef.current && user && reason !== 'USER_SUBMIT') {
      proctoringService.recordIntegrityEvent(
        attemptIdRef.current,
        user.id,
        'EXAM_AUTO_SUBMITTED',
        `Exam auto-submitted due to: ${reason}`
      );
    } else if (attemptIdRef.current && user) {
      proctoringService.recordIntegrityEvent(
        attemptIdRef.current,
        user.id,
        'EXAM_SUBMITTED',
        'Student confirmed and submitted final assessment.'
      );
    }

    try {
      const response = await attemptService.submitQuiz(id, submissionPayload);
      const resAttemptId = response?.attemptId || response?.id || attemptIdRef.current || id;
      navigate(`/result/${resAttemptId}`, {
        state: {
          resultData: response,
          quizTitle: quiz?.title || 'Quiz Assessment',
          totalQuestions: questions.length,
          userAnswers: userAnswers,
          tabSwitches: reason === 'FULLSCREEN_EXIT' ? tabSwitchCount + 1 : tabSwitchCount,
          autoSubmitted: isAutoSubmit && reason !== 'USER_SUBMIT',
          autoSubmitReason: reason || (timeLeft <= 0 ? 'TIMER_EXPIRED' : 'USER_SUBMIT')
        }
      });
    } catch (err) {
      navigate(`/result/${id}`, {
        state: {
          quizTitle: quiz?.title || 'Quiz Assessment',
          totalQuestions: questions.length,
          userAnswers: userAnswers,
          tabSwitches: reason === 'FULLSCREEN_EXIT' ? tabSwitchCount + 1 : tabSwitchCount,
          autoSubmitted: isAutoSubmit && reason !== 'USER_SUBMIT',
          autoSubmitReason: reason || (timeLeft <= 0 ? 'TIMER_EXPIRED' : 'USER_SUBMIT')
        }
      });
    } finally {
      setSubmitting(false);
    }
  }, [id, questions.length, quiz?.title, submitting, tabSwitchCount, user, userAnswers, navigate, timeLeft, cleanupProctoringHardware]);

  // Fullscreen Exit Detection (ESC key or browser restore) -> AUTO SUBMIT!
  useEffect(() => {
    const handleFullscreenChange = () => {
      const inFs = isDocumentFullscreen();
      setIsFullscreenActive(inFs);

      if (quizStartedRef.current && !inFs && !isAutoSubmittingRef.current) {
        captureAndUploadScreenshot('FULLSCREEN_EXIT_OR_AGENT_ATTEMPT');
        integrityService.addEvent({
          userId: user?.id || 1,
          quizAttemptId: attemptIdRef.current,
          eventType: 'FULLSCREEN_EXIT',
          eventTime: new Date().toISOString(),
          remarks: `Assessment auto-submitted: Student exited fullscreen mode during quiz #${id}`
        }).catch(() => { });

        handleSubmitQuiz(true, 'FULLSCREEN_EXIT');
      }
    };

    const handleKeyDown = (e) => {
      if (quizStartedRef.current && !isAutoSubmittingRef.current) {
        if (e.key === 'Escape' || e.keyCode === 27) {
          captureAndUploadScreenshot('ESCAPE_KEY_AGENT_OR_EXIT_ATTEMPT');
          integrityService.addEvent({
            userId: user?.id || 1,
            quizAttemptId: attemptIdRef.current,
            eventType: 'FULLSCREEN_EXIT',
            eventTime: new Date().toISOString(),
            remarks: `Assessment auto-submitted: Student pressed ESC key during quiz #${id}`
          }).catch(() => { });

          handleSubmitQuiz(true, 'FULLSCREEN_EXIT');
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [id, user, handleSubmitQuiz]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      cleanupProctoringHardware();
    };
  }, [cleanupProctoringHardware]);

  // Tab-Switch Monitoring: 2 Allowed, 3rd Auto-Submits with Modal Popups
  useEffect(() => {
    if (!quizStarted) return;

    const handleSwitch = (source) => {
      const now = Date.now();
      if (now - lastBlurTimestampRef.current < 1200) return;
      lastBlurTimestampRef.current = now;

      // Capture evidence snapshot ONLY when student attempts to open agents (e.g. Gemini) or switch tabs!
      captureAndUploadScreenshot(`SUSPICIOUS_AGENT_OR_TAB_SWITCH: ${source}`);

      setTabSwitchCount((prev) => {
        const nextCount = prev + 1;

        if (attemptIdRef.current && user) {
          proctoringService.recordIntegrityEvent(
            attemptIdRef.current,
            user.id,
            'TAB_SWITCH',
            `Tab switch #${nextCount} detected via ${source}. Violation recorded during assessment.`
          );
        }

        if (nextCount === 1) {
          // Warning 1 of 2
          setTabSwitchModal({
            visible: true,
            count: 1,
            title: '⚠️ TAB SWITCH WARNING (1 of 2 Allowed)',
            message: 'You switched browser tabs or minimized the examination window. Academic integrity regulations permit a maximum of 2 tab switches. If you switch tabs a 3rd time, your test will be AUTOMATICALLY SUBMITTED immediately.',
            isFinal: false,
            isTerminated: false
          });
        } else if (nextCount === 2) {
          // Final Warning 2 of 2
          setTabSwitchModal({
            visible: true,
            count: 2,
            title: '🚨 FINAL WARNING: TAB SWITCH DETECTED (2 of 2 Allowed)',
            message: 'CRITICAL ALERT: This is your 2nd and FINAL warning! You have used both of your 2 permitted tab switches. If you leave this window or switch tabs ONE MORE TIME (3rd switch), your test will be INSTANTLY TERMINATED and AUTO-SUBMITTED with zero further warnings.',
            isFinal: true,
            isTerminated: false
          });
        } else if (nextCount >= 3) {
          // 3rd Tab Switch: Auto-submit!
          setTabSwitchModal({
            visible: true,
            count: nextCount,
            title: '⛔ EXAM TERMINATED: TAB SWITCH LIMIT EXCEEDED',
            message: 'You have switched tabs 3 times. The maximum permitted limit of 2 tab switches has been exceeded. Per academic integrity rules, your test has been automatically submitted.',
            isFinal: true,
            isTerminated: true
          });

          if (attemptIdRef.current && user) {
            proctoringService.recordIntegrityEvent(
              attemptIdRef.current,
              user.id,
              'EXAM_AUTO_SUBMITTED',
              'Assessment automatically submitted due to exceeding maximum allowed tab switches (3).'
            );
          }

          setTimeout(() => {
            handleSubmitQuiz(true, 'TAB_SWITCH_LIMIT_EXCEEDED');
          }, 1000);
        }

        return nextCount;
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
    };
  }, [id, user, quizStarted, handleSubmitQuiz]);

  // Countdown Timer Interval
  useEffect(() => {
    if (!quizStarted || timeLeft === null || loading || submitting) return;

    if (timeLeft <= 0) {
      if (!isAutoSubmittingRef.current) {
        handleSubmitQuiz(true, 'TIMER_EXPIRED');
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
  }, [quizStarted, timeLeft, loading, submitting, handleSubmitQuiz]);

  const handleSelectOption = (questionId, optionSelected) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionSelected
    }));
  };

  // 1. Save Answer Button Handler
  const handleSaveAnswer = () => {
    if (!currentQuestion) return;
    const ans = userAnswers[currentQuestion.id];
    if (ans) {
      setSavedQuestions(prev => ({ ...prev, [currentQuestion.id]: true }));
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 2. Mark for Review Button Handler
  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    setReviewQuestions(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 3. Skip Answer Button Handler
  const handleSkipAnswer = () => {
    if (!currentQuestion) return;
    setUserAnswers(prev => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    setSavedQuestions(prev => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
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

  // Role Restriction: Students only
  if (role && role !== 'STUDENT') {
    return (
      <div style={{
        maxWidth: '560px',
        margin: '4rem auto',
        textAlign: 'center',
        background: '#ffffff',
        padding: '2.5rem 2rem',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
        <h2 style={{ color: '#0f172a', fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
          Student Access Only
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
          Assessments can only be taken by registered students. As an <strong>{role.toLowerCase()}</strong>, you are authorized to manage quizzes, questions, and inspect student analytics.
        </p>
        <button
          onClick={() => navigate('/quizzes')}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.75rem',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  if (loading) return <Loading message="Preparing randomized quiz assessment..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchQuizAndQuestions} />;
  if (questions.length === 0) return <div className="empty-state">No questions found for this quiz.</div>;

  // DEADLINE EXPIRED GUARD
  if (eligibility && eligibility.isExpired) {
    return (
      <div style={{
        maxWidth: '560px',
        margin: '4rem auto',
        textAlign: 'center',
        background: '#ffffff',
        padding: '2.5rem 2rem',
        borderRadius: '16px',
        border: '1px solid #fed7aa',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⌛</div>
        <h2 style={{ color: '#9a3412', fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
          Assessment Deadline Expired
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          The deadline for this assessment was <strong>{quiz?.endDate ? new Date(quiz.endDate).toLocaleString() : 'passed'}</strong>. Submissions and new attempts are no longer accepted.
        </p>
        <button
          onClick={() => navigate('/quizzes')}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  // ATTEMPT LIMIT REACHED GUARD
  if (eligibility && !eligibility.canAttempt) {
    return (
      <div style={{
        maxWidth: '580px',
        margin: '4rem auto',
        textAlign: 'center',
        background: '#ffffff',
        padding: '2.5rem 2rem',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
        <h2 style={{ color: '#0f172a', fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
          Maximum Attempts Reached
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
          You have completed all <strong>{eligibility.allowedAttempts}</strong> permitted attempt(s) for this assessment.
        </p>
        <div style={{
          background: '#f8fafc',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-around',
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Attempts Completed</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{eligibility.completedAttempts} / {eligibility.allowedAttempts}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Official Best Score</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a' }}>
              {eligibility.bestScore !== null ? `${eligibility.bestScore} pts` : 'Pending'}
            </div>
          </div>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Note: If you scored below the eligibility criteria, your educator can grant you an additional attempt. The highest score from all your attempts is recorded as your official score.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/quizzes')}
            style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.75rem 1.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Format Timer Display (MM:SS)
  const formatTimer = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerClass =
    timeLeft <= 60
      ? 'timer-urgent'
      : totalTime && timeLeft <= totalTime * 0.25
        ? 'timer-warning'
        : 'timer-normal';

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = currentQuestion ? (userAnswers[currentQuestion.id] || '') : '';
  const currentShuffledOptions = currentQuestion ? (randomizedOptionsMap[currentQuestion.id] || null) : null;

  return (
    <div className="take-quiz-container" style={{ position: 'relative', width: '100%' }}>
      {/* Permanent offscreen video and canvas elements */}
      <video ref={videoRef} autoPlay muted playsInline style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!quizStarted || !isFullscreenActive ? (
        <div style={{
          maxWidth: '740px',
          margin: '2rem auto',
          padding: '0 1rem',
          animation: 'fadeIn 0.25s ease-in-out',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '2.5rem 2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}>


            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.3rem 0' }}>
                {quiz?.title || 'Quiz Assessment'}
              </h1>
              {quiz?.description && (
                <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0, maxWidth: '520px' }}>
                  {quiz.description}
                </p>
              )}
            </div>

            {/* Assessment Parameters Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem',
              width: '100%',
              maxWidth: '600px',
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Duration</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                  {quiz?.duration || 15} min
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Questions</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                  {questions.length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Attempts</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                  {eligibility ? `${eligibility.completedAttempts}/${eligibility.allowedAttempts}` : '1 Max'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Deadline</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: quiz?.endDate ? '#b45309' : '#0f172a', marginTop: '0.2rem' }}>
                  {quiz?.endDate ? new Date(quiz.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Open'}
                </div>
              </div>
            </div>

            {eligibility?.bestScore !== null && eligibility?.bestScore !== undefined && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                width: '100%',
                maxWidth: '600px',
                textAlign: 'center'
              }}>
                Previous Best Score: {eligibility.bestScore} pts
              </div>
            )}

            {eligibility?.allowanceReason && (
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                width: '100%',
                maxWidth: '600px',
                textAlign: 'center'
              }}>
                Extra Attempt Granted: {eligibility.allowanceReason}
              </div>
            )}

            {/* Exam Rules */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1.1rem 1.25rem',
              width: '100%',
              maxWidth: '600px',
              textAlign: 'left',
            }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem' }}>Exam Rules</div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#4b5563', fontSize: '0.82rem', lineHeight: '1.75' }}>
                <li>Screen sharing is required throughout the exam.</li>
                <li>The exam runs in fullscreen. Exiting fullscreen will auto-submit your test.</li>
                <li>You may switch tabs up to 2 times. A 3rd switch will auto-submit your test.</li>
              </ul>
            </div>

            {/* Screen Share Error Message */}
            {screenShareError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                maxWidth: '600px',
                textAlign: 'left',
                lineHeight: '1.5'
              }}>
                {screenShareError}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/quizzes')}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.95rem 1.75rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              >
                Cancel & Exit
              </button>
              <button
                type="button"
                onClick={handleEnterFullscreenAndStart}
                style={{
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.95rem 2.25rem',
                  fontSize: '1.05rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)'; }}
              >
                Grant Screen Sharing & Start Test
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>

          {/* Fullscreen Exit Auto-Submit Overlay */}
          {fullscreenExitWarning && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15, 23, 42, 0.96)',
              zIndex: 999999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              textAlign: 'center',
              padding: '2rem',
            }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: '#f87171' }}>
                Fullscreen Exited
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', maxWidth: '480px', lineHeight: '1.6' }}>
                Exiting fullscreen has automatically submitted your assessment.
              </p>
              <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#93c5fd' }}>
                Submitting...
              </div>
            </div>
          )}

          {/* Screen Sharing Stopped Modal */}
          {screenShareStoppedModal && (
            <div className="proctoring-modal-backdrop" style={{ zIndex: 999999 }}>
              <div className="proctoring-warning-card" style={{ maxWidth: '520px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', padding: '2rem', border: '2px solid #ef4444', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626', marginBottom: '0.5rem' }}>
                  Screen Sharing Disconnected
                </h3>
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Screen sharing was stopped. You cannot proceed until it is reconnected.
                </p>
                <button
                  type="button"
                  onClick={handleResumeScreenShare}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.85rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Re-enable Screen Sharing
                </button>
              </div>
            </div>
          )}

          {/* Tab Switch Warning Modal Popup (1st warning, 2nd warning, or 3rd auto-submit) */}
          {tabSwitchModal.visible && (
            <div className="proctoring-modal-backdrop" style={{ zIndex: 999999 }}>
              <div className="proctoring-warning-card" style={{
                maxWidth: '540px',
                background: tabSwitchModal.isTerminated ? '#0f172a' : '#ffffff',
                color: tabSwitchModal.isTerminated ? '#ffffff' : '#0f172a',
                borderRadius: '16px',
                padding: '2.25rem 2rem',
                textAlign: 'center',
                border: `2px solid ${tabSwitchModal.isTerminated ? '#ef4444' : tabSwitchModal.isFinal ? '#ef4444' : '#f59e0b'}`,
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
              }}>

                <h3 style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: tabSwitchModal.isTerminated ? '#f87171' : tabSwitchModal.isFinal ? '#dc2626' : '#b45309',
                  marginBottom: '0.75rem'
                }}>
                  {tabSwitchModal.title}
                </h3>
                <p style={{
                  color: tabSwitchModal.isTerminated ? '#cbd5e1' : '#475569',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  marginBottom: '1.75rem'
                }}>
                  {tabSwitchModal.message}
                </p>

                {!tabSwitchModal.isTerminated ? (
                  <button
                    type="button"
                    onClick={() => setTabSwitchModal(prev => ({ ...prev, visible: false }))}
                    style={{
                      background: tabSwitchModal.isFinal
                        ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                        : 'linear-gradient(135deg, #d97706, #b45309)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.85rem 2.25rem',
                      fontSize: '1rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    {tabSwitchModal.isFinal ? 'I Understand (Final Warning) - Return to Test' : 'I Understand & Resume Test'}
                  </button>
                ) : (
                  <div style={{ color: '#93c5fd', fontSize: '0.9rem', fontWeight: 600 }}>
                    Submitting...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Confirmation Modal (Requires typing "submit" to confirm) */}
          {showSubmitModal && (
            <div className="proctoring-modal-backdrop" style={{ zIndex: 9999999 }}>
              <div
                className="proctoring-warning-card"
                style={{
                  maxWidth: '540px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '2.25rem 2rem',
                  border: '2px solid #2563eb',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.35)',
                  textAlign: 'center',
                  color: '#0f172a',
                  animation: 'fadeIn 0.2s ease-in-out'
                }}
              >
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                  Submit Quiz
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  Are you sure you want to submit?
                </p>

                {/* Questions Stats Counter Box */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-around',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Questions</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
                      {questions.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Answered</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', marginTop: '0.15rem' }}>
                      {Object.keys(userAnswers).length}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Unanswered</div>
                    <div style={{
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      color: questions.length - Object.keys(userAnswers).length > 0 ? '#dc2626' : '#64748b',
                      marginTop: '0.15rem'
                    }}>
                      {questions.length - Object.keys(userAnswers).length}
                    </div>
                  </div>
                </div>

                {/* Warning if unanswered questions exist */}
                {questions.length - Object.keys(userAnswers).length > 0 && (
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#b45309',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    marginBottom: '1.25rem',
                    textAlign: 'left'
                  }}>
                    You have <strong>{questions.length - Object.keys(userAnswers).length}</strong> unanswered question(s). They will receive 0 marks.
                  </div>
                )}

                {/* Typo Input Verification */}
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '1.1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left'
                }}>
                  <label
                    htmlFor="submit-confirm-input"
                    style={{
                      display: 'block',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#1e40af',
                      marginBottom: '0.45rem'
                    }}
                  >
                    To confirm submission, please type <span style={{ background: '#dbeafe', padding: '0.1rem 0.45rem', borderRadius: '4px', color: '#1d4ed8', fontWeight: 800 }}>submit</span> below:
                  </label>
                  <input
                    id="submit-confirm-input"
                    type="text"
                    autoFocus
                    value={submitConfirmText}
                    onChange={(e) => setSubmitConfirmText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && submitConfirmText.trim().toLowerCase() === 'submit' && !submitting) {
                        handleConfirmModalSubmit();
                      }
                    }}
                    placeholder='Type "submit" here...'
                    style={{
                      width: '100%',
                      fontSize: '0.95rem',
                      padding: '0.65rem 0.85rem',
                      border: submitConfirmText.trim().toLowerCase() === 'submit' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  />
                  {submitConfirmText && submitConfirmText.trim().toLowerCase() !== 'submit' && (
                    <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 600 }}>
                      Please type the word "submit" exactly to enable submission.
                    </div>
                  )}
                  {submitConfirmText.trim().toLowerCase() === 'submit' && (
                    <div style={{ color: '#16a34a', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 700 }}>
                      Confirmed. Click Submit Quiz to proceed.
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={handleCloseSubmitModal}
                    disabled={submitting}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel / Back to Test
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmModalSubmit}
                    disabled={submitConfirmText.trim().toLowerCase() !== 'submit' || submitting}
                    style={{
                      background: submitConfirmText.trim().toLowerCase() === 'submit'
                        ? 'linear-gradient(135deg, #16a34a, #15803d)'
                        : '#94a3b8',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1.75rem',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: submitConfirmText.trim().toLowerCase() === 'submit' ? 'pointer' : 'not-allowed',
                      boxShadow: submitConfirmText.trim().toLowerCase() === 'submit' ? '0 4px 14px rgba(22,163,74,0.35)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Quiz ✓'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Proctoring Status Bar */}
          <div style={{
            background: '#1e293b',
            color: '#ffffff',
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            marginBottom: '0.9rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            fontWeight: '600',
          }}>
            <span style={{
              background: isScreenSharing ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${isScreenSharing ? '#4ade80' : '#f87171'}`,
              color: isScreenSharing ? '#86efac' : '#fca5a5',
              padding: '0.12rem 0.5rem',
              borderRadius: '4px',
            }}>
              {isScreenSharing ? 'Screen Monitored' : 'Screen Disconnected'}
            </span>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {quiz?.title || 'Assessment'}
            </div>
          </div>

          {/* Header & Meta Bar */}
          <div className="take-quiz-progress">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                  {quiz ? quiz.title : 'Assessment'}
                </h2>

                {reviewQuestions[currentQuestion?.id] && (
                  <span style={{
                    fontSize: '0.74rem',
                    background: '#f3e8ff',
                    color: '#7c3aed',
                    border: '1px solid #ddd6fe',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontWeight: 700
                  }}>
                    Marked for Review
                  </span>
                )}
                {userAnswers[currentQuestion?.id] && (
                  <span style={{
                    fontSize: '0.74rem',
                    background: '#dcfce7',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontWeight: 700
                  }}>
                    Saved
                  </span>
                )}
              </div>

              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            {/* Right side: Timer & Progress */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Live Countdown Timer */}
              <div className={`quiz-timer-pill ${timerClass}`} title="Time Remaining">
                <span>{formatTimer(timeLeft)}</span>
                {timeLeft <= 60 && <span style={{ fontSize: '0.7rem' }}>URGENT</span>}
              </div>

              {/* Progress pill */}
              <span className="badge badge-role">
                Answered {Object.keys(userAnswers).length} / {questions.length}
              </span>
            </div>
          </div>

          {/* Question Navigator Palette */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '0.75rem 1.15rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginRight: '0.25rem' }}>Questions:</span>
              {questions.map((q, idx) => {
                const isAns = Boolean(userAnswers[q.id]);
                const isRev = Boolean(reviewQuestions[q.id]);
                const isCur = idx === currentIndex;

                let bg = '#f8fafc';
                let color = '#475569';
                let border = '1px solid #cbd5e1';

                if (isAns && isRev) {
                  bg = '#fef3c7'; color = '#b45309'; border = '1px solid #f59e0b';
                } else if (isRev) {
                  bg = '#f3e8ff'; color = '#7c3aed'; border = '1px solid #a855f7';
                } else if (isAns) {
                  bg = '#dcfce7'; color = '#15803d'; border = '1px solid #22c55e';
                }

                return (
                  <button
                    key={q.id || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: bg,
                      color: color,
                      border: isCur ? '2px solid #2563eb' : border,
                      fontWeight: isCur ? '800' : '700',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: isCur ? '0 0 0 2px rgba(37,99,235,0.2)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Question ${idx + 1}: ${isRev ? (isAns ? 'Answered & Review' : 'Marked for Review') : (isAns ? 'Answered' : 'Not Answered')}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Palette Legend */}
            <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.74rem', color: '#64748b', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></span>
                Saved ({Object.keys(userAnswers).length})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7c3aed' }}></span>
                Review ({Object.keys(reviewQuestions).filter(id => reviewQuestions[id]).length})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                Unanswered ({questions.length - Object.keys(userAnswers).length})
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

          {/* Navigation & Action Controls with Save Answer, Mark for Review, and Skip Ans */}
          <div className="quiz-action-bar" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0 || submitting}
                style={{ padding: '0.65rem 1.15rem' }}
              >
                &larr; Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1 || submitting}
                style={{ padding: '0.65rem 1.15rem' }}
              >
                Next &rarr;
              </Button>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Skip Ans Button */}
              <button
                type="button"
                onClick={handleSkipAnswer}
                disabled={submitting}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Clear answer"
              >
                Skip
              </button>

              {/* Mark for Review Button */}
              <button
                type="button"
                onClick={handleMarkForReview}
                disabled={submitting}
                style={{
                  background: reviewQuestions[currentQuestion?.id] ? '#7c3aed' : '#f5f3ff',
                  color: reviewQuestions[currentQuestion?.id] ? '#ffffff' : '#6d28d9',
                  border: `1px solid ${reviewQuestions[currentQuestion?.id] ? '#6d28d9' : '#ddd6fe'}`,
                  borderRadius: '8px',
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                title="Flag this question for review"
              >
                {reviewQuestions[currentQuestion?.id] ? 'Marked for Review' : 'Mark for Review'}
              </button>

              {/* Save Answer Button */}
              <button
                type="button"
                onClick={handleSaveAnswer}
                disabled={submitting}
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.35rem',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                title="Save selected answer and proceed to next question"
              >
                Save Answer
              </button>

              {/* Submit Assessment Button */}
              <Button
                variant="danger"
                onClick={handleOpenSubmitModal}
                isLoading={submitting}
                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', fontWeight: 800, padding: '0.65rem 1.25rem' }}
              >
                Submit
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TakeQuiz;
