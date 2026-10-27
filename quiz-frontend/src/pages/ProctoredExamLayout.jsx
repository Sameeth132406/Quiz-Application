import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import questionService from '../services/questionService';
import quizService from '../services/quizService';
import attemptService from '../services/attemptService';
import proctoringService from '../services/proctoringService';
import '../styles/proctoring.css';

const ProctoredExamLayout = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useContext(AuthContext);

  // Exam Data State
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Proctoring Lifecycle State
  const [hasStarted, setHasStarted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const attemptIdRef = useRef(null);

  // Screen Sharing State
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareError, setScreenShareError] = useState('');
  const [screenShareStoppedModal, setScreenShareStoppedModal] = useState(false);
  const mediaStreamRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenWarning, setFullscreenWarning] = useState(false);

  // Snapshots State
  const [snapshotCount, setSnapshotCount] = useState(0);
  const sequenceNumberRef = useRef(1);
  const screenshotTimerRef = useRef(null);
  const lastBlurTimestampRef = useRef(0);

  // Review & Saved State
  const [reviewQuestions, setReviewQuestions] = useState({});
  const [savedQuestions, setSavedQuestions] = useState({});

  // Integrity & Timer State
  const [tabSwitches, setTabSwitches] = useState(0);
  const [tabSwitchModal, setTabSwitchModal] = useState({
    visible: false,
    count: 0,
    title: '',
    message: '',
    isFinal: false,
    isTerminated: false
  });
  const [timeLeft, setTimeLeft] = useState(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(new Date().toISOString());

  // Submit Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitConfirmText, setSubmitConfirmText] = useState('');

  // 1. Fetch Quiz & Questions on Mount
  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      setError('');
      try {
        const qData = await quizService.getQuizById(quizId);
        setQuiz(qData);

        const durationMinutes = qData?.duration || 20;
        setTimeLeft(durationMinutes * 60);

        const qList = await questionService.getStudentQuestions(quizId, true);
        if (!qList || qList.length === 0) {
          setError('This assessment currently has no questions available.');
        } else {
          setQuestions(qList);
        }
      } catch (err) {
        console.error('Failed to load assessment data', err);
        setError('Failed to load assessment. Please verify your connection.');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  // Capture & Upload Single Screenshot (Triggered ONLY on tab switch or agent open attempt)
  const captureAndUploadScreenshot = useCallback(async (reason = 'SUSPICIOUS_ACTIVITY') => {
    if (!videoRef.current || !canvasRef.current || !attemptIdRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.srcObject && mediaStreamRef.current) {
      video.srcObject = mediaStreamRef.current;
      await video.play().catch(() => {});
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
      console.warn('Proctoring snapshot upload warning:', err);
    }
  }, []);

  // 2. Fullscreen Change Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(active);

      if (hasStarted && !active) {
        captureAndUploadScreenshot('FULLSCREEN_EXIT');
        setFullscreenWarning(true);
        if (attemptIdRef.current && user) {
          proctoringService.recordIntegrityEvent(
            attemptIdRef.current,
            user.id,
            'FULLSCREEN_EXITED',
            'Student exited full-screen mode during proctored exam.'
          );
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [hasStarted, user, captureAndUploadScreenshot]);

  // 3. Tab Visibility & Blur Change Listener (Only 2 tab switches allowed, 3rd auto-submits)
  useEffect(() => {
    if (!hasStarted) return;

    const handleSwitch = (source) => {
      const now = Date.now();
      if (now - lastBlurTimestampRef.current < 1200) return;
      lastBlurTimestampRef.current = now;

      // Evidence snapshot ONLY upon tab switch or external agent attempt!
      captureAndUploadScreenshot(`SUSPICIOUS_AGENT_OR_TAB_SWITCH: ${source}`);

      setTabSwitches(prev => {
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
          setTabSwitchModal({
            visible: true,
            count: 1,
            title: '⚠️ TAB SWITCH WARNING (1 of 2 Allowed)',
            message: 'You switched browser tabs or minimized the examination window. Academic integrity regulations permit a maximum of 2 tab switches. If you switch tabs a 3rd time, your test will be AUTOMATICALLY SUBMITTED immediately.',
            isFinal: false,
            isTerminated: false
          });
        } else if (nextCount === 2) {
          setTabSwitchModal({
            visible: true,
            count: 2,
            title: '🚨 FINAL WARNING: TAB SWITCH DETECTED (2 of 2 Allowed)',
            message: 'CRITICAL ALERT: This is your 2nd and FINAL warning! You have used both of your 2 permitted tab switches. If you leave this window or switch tabs ONE MORE TIME (3rd switch), your test will be INSTANTLY TERMINATED and AUTO-SUBMITTED with zero further warnings.',
            isFinal: true,
            isTerminated: false
          });
        } else if (nextCount >= 3) {
          setTabSwitchModal({
            visible: true,
            count: nextCount,
            title: '⛔ EXAM TERMINATED: TAB SWITCH LIMIT EXCEEDED',
            message: 'You have performed 3 tab switches. The maximum permitted limit of 2 tab switches has been exceeded. Per academic integrity rules, your test has been automatically submitted.',
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
            submitExamInternal(true);
          }, 1000);
        }

        return nextCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleSwitch('visibilitychange');
      }
    };

    const handleBlur = () => {
      handleSwitch('window_blur');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [hasStarted, user, captureAndUploadScreenshot]);

  // 4. Start Screen Sharing & Initialize Exam
  const handleStartExam = async () => {
    setScreenShareError('');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        },
        audio: false
      });

      mediaStreamRef.current = stream;
      setIsScreenSharing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(e => console.log('Video play caught:', e));
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
              'Screen sharing stream terminated unexpectedly by student.'
            );
          }
        };
      }

      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } catch (fsErr) {
        console.warn('Fullscreen request bypassed or denied:', fsErr);
      }

      const attempt = await proctoringService.startProctoredExam(quizId);
      setAttemptId(attempt.id);
      attemptIdRef.current = attempt.id;
      startTimeRef.current = new Date().toISOString();

      setHasStarted(true);

      // Note: Periodic 5s screenshots disabled per requirement.
      // Evidence snapshots captured ONLY on tab switch or external agent attempt!

      // Start Countdown Timer
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Screen sharing initiation failed:', err);
      setScreenShareError(
        'Screen sharing permission is strictly required to take this proctored exam. Please click Start Screen Sharing and choose your screen.'
      );
    }
  };

  // Re-acquire screen share if ended
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
        await videoRef.current.play().catch(() => {});
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
          'Student resumed screen sharing.'
        );
      }
    } catch (err) {
      console.error('Failed to resume screen share', err);
    }
  };

  // Return to Fullscreen
  const handleReturnToFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setFullscreenWarning(false);
      setIsFullscreen(true);
      if (attemptIdRef.current && user) {
        proctoringService.recordIntegrityEvent(
          attemptIdRef.current,
          user.id,
          'FULLSCREEN_ENTERED',
          'Student returned to full-screen mode.'
        );
      }
    } catch (err) {
      console.error('Could not re-enter fullscreen:', err);
      setFullscreenWarning(false);
    }
  };

  // 6. Stop all hardware & timers on cleanup
  const cleanupProctoringHardware = useCallback(() => {
    if (screenshotTimerRef.current) {
      clearInterval(screenshotTimerRef.current);
      screenshotTimerRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
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
    if (document.fullscreenElement) {
      try {
        document.exitFullscreen().catch(() => {});
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupProctoringHardware();
    };
  }, [cleanupProctoringHardware]);

  // Prevent accidental page refresh / back
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasStarted && !submitting) {
        e.preventDefault();
        e.returnValue = 'Your proctored exam is in progress. Leaving will submit your assessment.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasStarted, submitting]);

  // 7. Answer Selection Handler
  const handleSelectOption = (questionId, optionValue) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionValue
    }));
  };

  // 1. Save Answer Button Handler
  const handleSaveAnswer = () => {
    const curQ = questions[currentIndex];
    if (!curQ) return;
    const ans = userAnswers[curQ.id];
    if (ans) {
      setSavedQuestions(prev => ({ ...prev, [curQ.id]: true }));
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 2. Mark for Review Button Handler
  const handleMarkForReview = () => {
    const curQ = questions[currentIndex];
    if (!curQ) return;
    setReviewQuestions(prev => ({
      ...prev,
      [curQ.id]: !prev[curQ.id]
    }));
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 3. Skip Answer Button Handler
  const handleSkipAnswer = () => {
    const curQ = questions[currentIndex];
    if (!curQ) return;
    setUserAnswers(prev => {
      const next = { ...prev };
      delete next[curQ.id];
      return next;
    });
    setSavedQuestions(prev => {
      const next = { ...prev };
      delete next[curQ.id];
      return next;
    });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 8. Exam Submission
  const submitExamInternal = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);

    // Stop proctoring captures
    cleanupProctoringHardware();

    try {
      const payload = {
        userId: user?.id,
        attemptId: attemptIdRef.current,
        answers: userAnswers,
        startedAt: startTimeRef.current,
        completedAt: new Date().toISOString(),
        tabSwitches: tabSwitches
      };

      if (auto && attemptIdRef.current && user) {
        proctoringService.recordIntegrityEvent(
          attemptIdRef.current,
          user.id,
          'EXAM_AUTO_SUBMITTED',
          'Assessment auto-submitted on timer expiration.'
        );
      } else if (attemptIdRef.current && user) {
        proctoringService.recordIntegrityEvent(
          attemptIdRef.current,
          user.id,
          'EXAM_SUBMITTED',
          'Student manually confirmed and submitted assessment.'
        );
      }

      const result = await attemptService.submitQuiz(quizId, payload);
      navigate(`/result/${result?.attemptId || attemptIdRef.current || quizId}`);
    } catch (err) {
      console.error('Failed to submit exam:', err);
      alert('Error submitting assessment. Your progress has been saved.');
      navigate('/quizzes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    submitExamInternal(true);
  };

  const handleConfirmSubmit = () => {
    if (submitConfirmText.trim().toLowerCase() !== 'submit') return;
    setShowSubmitModal(false);
    submitExamInternal(false);
  };

  // Timer formatting (mm:ss)
  const formatTime = (seconds) => {
    if (seconds == null || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (role && role !== 'STUDENT') {
    return (
      <div className="proctored-exam-root" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="proctored-instruction-card" style={{ maxWidth: '560px' }}>
          <h2>Student Access Only</h2>
          <p style={{ color: '#94a3b8', margin: '1rem 0 2rem 0', lineHeight: '1.6' }}>
            Proctored assessments can only be taken by registered students. As an <strong style={{ color: '#38bdf8' }}>{role.toLowerCase()}</strong>, you are authorized to manage quizzes, evaluate submissions, and inspect student proctoring timelines.
          </p>
          <button onClick={() => navigate('/quizzes')} className="btn-proctored btn-proctored-primary">
            Return to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="proctored-exam-root" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Initializing Secure Proctoring Environment...</h2>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="proctored-exam-root" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="proctored-instruction-card">
          <h2>Unable to Load Assessment</h2>
          <p style={{ color: '#94a3b8', margin: '1rem 0 2rem 0' }}>{error || 'Quiz not found.'}</p>
          <button onClick={() => navigate('/quizzes')} className="btn-proctored btn-proctored-secondary">
            Return to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Pre-Exam Instruction Screen
  if (!hasStarted) {
    return (
      <div className="proctored-exam-root">
        {/* Hidden video and canvas elements for snapshot capture */}
        <video ref={videoRef} autoPlay muted playsInline style={{ display: 'none' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="proctored-instruction-card">
          <h2>PROCTORED ASSESSMENT</h2>
          <p style={{ color: '#38bdf8', fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>
            {quiz.title}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Duration: {quiz.duration || 20} Minutes • Questions: {questions.length}
          </p>

          <div className="proctored-req-list">
            <div className="proctored-req-item">
              <span className="proctored-req-icon">✓</span>
              <div>
                <strong>Active Screen Sharing:</strong> Share your entire screen during the assessment.
              </div>
            </div>
            <div className="proctored-req-item">
              <span className="proctored-req-icon">✓</span>
              <div>
                <strong>Full-Screen Mode:</strong> Assessment operates in full-screen mode.
              </div>
            </div>
            <div className="proctored-req-item">
              <span className="proctored-req-icon">✓</span>
              <div>
                <strong>Snapshots on Violations:</strong> Snapshots are taken only when tab switching or external AI access is attempted.
              </div>
            </div>
            <div className="proctored-req-item">
              <span className="proctored-req-icon">✓</span>
              <div>
                <strong>Integrity Monitoring:</strong> Tab switches and unfocus events are recorded.
              </div>
            </div>
          </div>

          {screenShareError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#f87171',
              padding: '0.85rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              {screenShareError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/quizzes')}
              className="btn-proctored btn-proctored-secondary"
            >
              Cancel & Exit
            </button>
            <button
              onClick={handleStartExam}
              className="btn-proctored btn-proctored-primary"
              style={{ fontSize: '1.05rem', padding: '0.85rem 2rem' }}
            >
              Start Screen Sharing & Begin Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="proctored-exam-root">
      {/* Off-screen video and canvas elements */}
      <video ref={videoRef} autoPlay muted playsInline style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 1. Dedicated Header */}
      <header className="proctored-header">
        <div className="proctored-brand-group">
          <div className="badge-proctoring-live">
            <span className="proctoring-pulse-dot"></span>
            PROCTORING ACTIVE
          </div>
          <h2 className="proctored-quiz-title">{quiz.title}</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className={`proctored-timer-badge ${timeLeft < 120 ? 'danger' : timeLeft < 300 ? 'warning' : ''}`}>
            <span>Time Remaining:</span>
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn-proctored btn-proctored-success"
            style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}
          >
            Submit Assessment
          </button>
        </div>
      </header>

      {/* 2. Integrity Status Bar (No snapshot count, no warning text) */}
      <div className="proctored-status-bar">
        <div className="status-indicators">
          <div className={`status-pill ${isScreenSharing ? 'active' : 'inactive'}`}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: isScreenSharing ? '#22c55e' : '#ef4444' }}></span>
            <span>Screen Sharing {isScreenSharing ? 'Active' : 'Disconnected'}</span>
          </div>
          <div className={`status-pill ${isFullscreen ? 'active' : 'inactive'}`}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: isFullscreen ? '#22c55e' : '#f59e0b' }}></span>
            <span>Fullscreen {isFullscreen ? 'Active' : 'Exited'}</span>
          </div>
        </div>

        <div style={{ color: '#94a3b8' }}>
          Question <strong>{currentIndex + 1}</strong> of <strong>{questions.length}</strong>
        </div>
      </div>

      {/* 3. Main Question Area */}
      <main className="proctored-main-content">
        {/* Question Navigator Pills */}
        <div className="proctored-pills-bar" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {questions.map((q, idx) => {
            const isAns = Boolean(userAnswers[q.id]);
            const isRev = Boolean(reviewQuestions[q.id]);
            const isCurrent = idx === currentIndex;

            let pillStyle = {
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#475569',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.85rem'
            };

            if (isAns && isRev) {
              pillStyle = { ...pillStyle, background: '#fef3c7', color: '#b45309', border: '1px solid #f59e0b' };
            } else if (isRev) {
              pillStyle = { ...pillStyle, background: '#f3e8ff', color: '#7c3aed', border: '1px solid #a855f7' };
            } else if (isAns) {
              pillStyle = { ...pillStyle, background: '#dcfce7', color: '#15803d', border: '1px solid #22c55e' };
            }

            if (isCurrent) {
              pillStyle = { ...pillStyle, outline: '2px solid #2563eb', fontWeight: '800' };
            }

            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                style={pillStyle}
                title={`Question ${idx + 1} ${isRev ? '(Review)' : ''} ${isAns ? '(Answered)' : ''}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Current Question */}
        {currentQ && (
          <div className="proctored-question-box">
            <div className="question-meta-row">
              <span className="q-badge">Question {currentIndex + 1}</span>
              <span className="q-marks">{currentQ.marks || 1} Mark{(currentQ.marks || 1) > 1 ? 's' : ''}</span>
            </div>

            <div className="q-text">{currentQ.questionText}</div>

            <div className="proctored-options-grid">
              {[
                { label: 'A', text: currentQ.optionA },
                { label: 'B', text: currentQ.optionB },
                { label: 'C', text: currentQ.optionC },
                { label: 'D', text: currentQ.optionD }
              ]
                .filter(opt => opt.text !== undefined && opt.text !== null && opt.text !== '')
                .map((opt) => {
                  const isSelected = userAnswers[currentQ.id] === opt.label || userAnswers[currentQ.id] === opt.text;
                  return (
                    <div
                      key={opt.label}
                      onClick={() => handleSelectOption(currentQ.id, opt.label)}
                      className={`proctored-option-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="opt-prefix">{opt.label}</div>
                      <div className="opt-text">{opt.text}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="proctored-actions-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="btn-proctored btn-proctored-secondary"
              style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="btn-proctored btn-proctored-secondary"
              style={{ opacity: currentIndex === questions.length - 1 ? 0.4 : 1 }}
            >
              Next
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Skip Ans Button */}
            <button
              type="button"
              onClick={handleSkipAnswer}
              className="btn-proctored"
              style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', fontWeight: 700 }}
              title="Clear answer and advance to next question"
            >
              Skip Answer
            </button>

            {/* Mark for Review Button */}
            <button
              type="button"
              onClick={handleMarkForReview}
              className="btn-proctored"
              style={{
                background: reviewQuestions[currentQ?.id] ? '#7c3aed' : '#f5f3ff',
                color: reviewQuestions[currentQ?.id] ? '#ffffff' : '#6d28d9',
                border: `1px solid ${reviewQuestions[currentQ?.id] ? '#6d28d9' : '#ddd6fe'}`,
                fontWeight: 700
              }}
              title="Flag question for review"
            >
              {reviewQuestions[currentQ?.id] ? 'Marked for Review' : 'Mark for Review'}
            </button>

            {/* Save Answer Button */}
            <button
              type="button"
              onClick={handleSaveAnswer}
              className="btn-proctored"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#ffffff', border: 'none', fontWeight: 800 }}
              title="Save answer and advance"
            >
              Save Answer
            </button>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="btn-proctored btn-proctored-success"
              style={{ fontWeight: 800 }}
            >
              Submit Assessment
            </button>
          </div>
        </div>
      </main>

      {/* Tab Switch Warning Modal Popup */}
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
                {tabSwitchModal.isFinal ? 'Return to Assessment' : 'Resume Assessment'}
              </button>
            ) : (
              <div style={{ color: '#93c5fd', fontSize: '0.9rem', fontWeight: 600 }}>
                Submitting assessment results...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Fullscreen Exit Warning Modal */}
      {fullscreenWarning && (
        <div className="proctoring-modal-backdrop">
          <div className="proctoring-warning-card">
            <h3 className="proctoring-warning-title">FULLSCREEN MODE EXITED</h3>
            <p className="proctoring-warning-msg">
              This examination requires active full-screen mode for exam integrity compliance.
              Leaving full-screen has been recorded in your audit logs.
            </p>
            <button
              onClick={handleReturnToFullscreen}
              className="btn-proctored btn-proctored-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              Return to Fullscreen & Resume Exam
            </button>
          </div>
        </div>
      )}

      {/* 5. Screen Share Stopped Modal */}
      {screenShareStoppedModal && (
        <div className="proctoring-modal-backdrop">
          <div className="proctoring-warning-card">
            <h3 className="proctoring-warning-title">SCREEN SHARING DISCONNECTED</h3>
            <p className="proctoring-warning-msg">
              Screen sharing was disconnected. Active screen sharing is required during the examination.
            </p>
            <button
              onClick={handleResumeScreenShare}
              className="btn-proctored btn-proctored-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              Re-enable Screen Sharing
            </button>
          </div>
        </div>
      )}

      {/* 6. Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="proctoring-modal-backdrop" style={{ zIndex: 9999999 }}>
          <div className="proctoring-warning-card" style={{ borderColor: '#3b82f6', boxShadow: '0 25px 50px rgba(59, 130, 246, 0.25)', maxWidth: '520px' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Confirm Assessment Submission
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.
              Once submitted, screen sharing and monitoring will conclude and your responses will be evaluated.
            </p>

            {/* Typo Input Verification */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: '#93c5fd',
                  marginBottom: '0.45rem'
                }}
              >
                To confirm submission, please type <span style={{ background: 'rgba(59, 130, 246, 0.3)', padding: '0.1rem 0.45rem', borderRadius: '4px', color: '#60a5fa', fontWeight: 800 }}>submit</span> below:
              </label>
              <input
                type="text"
                autoFocus
                value={submitConfirmText}
                onChange={(e) => setSubmitConfirmText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && submitConfirmText.trim().toLowerCase() === 'submit' && !submitting) {
                    handleConfirmSubmit();
                  }
                }}
                placeholder='Type "submit" here...'
                style={{
                  width: '100%',
                  fontSize: '0.95rem',
                  padding: '0.65rem 0.85rem',
                  border: submitConfirmText.trim().toLowerCase() === 'submit' ? '2px solid #22c55e' : '1px solid #475569',
                  borderRadius: '6px',
                  outline: 'none',
                  background: '#0f172a',
                  color: '#ffffff',
                  boxSizing: 'border-box'
                }}
              />
              {submitConfirmText && submitConfirmText.trim().toLowerCase() !== 'submit' && (
                <div style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 600 }}>
                  Please type the word "submit" exactly to enable submission.
                </div>
              )}
              {submitConfirmText.trim().toLowerCase() === 'submit' && (
                <div style={{ color: '#4ade80', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 700 }}>
                  Confirmation verified. You can now submit.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setSubmitConfirmText('');
                }}
                className="btn-proctored btn-proctored-secondary"
                disabled={submitting}
              >
                Keep Answering
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="btn-proctored btn-proctored-success"
                disabled={submitConfirmText.trim().toLowerCase() !== 'submit' || submitting}
                style={{
                  opacity: submitConfirmText.trim().toLowerCase() === 'submit' ? 1 : 0.5,
                  cursor: submitConfirmText.trim().toLowerCase() === 'submit' ? 'pointer' : 'not-allowed'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctoredExamLayout ;
