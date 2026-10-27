import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import courseService from '../services/courseService';
import quizService from '../services/quizService';
import proctoringService from '../services/proctoringService';
import Loading from '../components/Loading';
import api from '../services/api';
import '../styles/proctoring.css';

const ScreenshotThumbnailTile = ({ s, idx, blobUrl, onSelect, onFetchBlob, formatTimestamp }) => {
  useEffect(() => {
    if (!blobUrl) {
      onFetchBlob(s.id);
    }
  }, [s.id, blobUrl, onFetchBlob]);

  return (
    <div
      onClick={() => onSelect(idx)}
      className="screenshot-tile"
    >
      <div className="tile-thumb-wrap">
        {blobUrl ? (
          <img src={blobUrl} alt={`Snapshot #${s.sequenceNumber}`} />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem' }}>
            Loading...
          </div>
        )}
        <span className="tile-seq-pill">{s.sequenceNumber}</span>
      </div>
      <div className="tile-footer">
        <span>⏱️ {formatTimestamp(s.capturedAt)}</span>
        <span style={{ color: '#0284c7', fontWeight: 600 }}>Inspect 🔍</span>
      </div>
    </div>
  );
};

const ProctoringDashboard = () => {
  const { user } = useContext(AuthContext);

  // Filter States
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');

  // Summaries & Attempts State
  const [summaries, setSummaries] = useState([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [activeSummary, setActiveSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState('');

  // Lightbox Viewer State
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageBlobs, setImageBlobs] = useState({});

  // 1. Initial Load: Courses & Quizzes
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [cList, qList] = await Promise.all([
          courseService.getAllCourses().catch(() => []),
          quizService.getAllQuizzes().catch(() => [])
        ]);

        setCourses(cList || []);
        setQuizzes(qList || []);

        if (qList && qList.length > 0) {
          setSelectedQuizId(qList[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
        setError('Failed to load courses and quizzes.');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // 2. Fetch Summaries when Quiz Changes
  useEffect(() => {
    if (!selectedQuizId) return;

    const fetchSummaries = async () => {
      setLoadingSummary(true);
      setError('');
      try {
        const data = await proctoringService.getQuizSummaries(selectedQuizId);
        setSummaries(data || []);

        // Default select first attempt if available
        if (data && data.length > 0) {
          setSelectedAttemptId(data[0].attemptId);
          setActiveSummary(data[0]);
        } else {
          setSelectedAttemptId(null);
          setActiveSummary(null);
        }
      } catch (err) {
        console.error('Failed to fetch proctoring summaries:', err);
        setSummaries([]);
        setActiveSummary(null);
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummaries();
  }, [selectedQuizId]);

  // 3. When an Attempt is selected from dropdown
  const handleSelectAttempt = async (attId) => {
    if (!attId) {
      setSelectedAttemptId(null);
      setActiveSummary(null);
      return;
    }
    setSelectedAttemptId(attId);
    setLoadingSummary(true);
    try {
      const summary = await proctoringService.getAttemptSummary(attId);
      setActiveSummary(summary);
    } catch (err) {
      console.error('Failed to load attempt summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // 4. Preload authenticated images safely via Axios with token
  const fetchImageBlob = useCallback(async (screenshotId) => {
    if (imageBlobs[screenshotId]) return imageBlobs[screenshotId];
    try {
      const res = await api.get(`/proctoring/screenshots/${screenshotId}`, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(res.data);
      setImageBlobs(prev => ({ ...prev, [screenshotId]: url }));
      return url;
    } catch (e) {
      console.warn('Could not load screenshot blob:', screenshotId, e);
      return null;
    }
  }, [imageBlobs]);

  // Pre-load visible screenshot thumbnails
  useEffect(() => {
    if (activeSummary?.screenshots?.length > 0) {
      activeSummary.screenshots.slice(0, 15).forEach(s => {
        if (!imageBlobs[s.id]) {
          fetchImageBlob(s.id);
        }
      });
    }
  }, [activeSummary, fetchImageBlob, imageBlobs]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeLightboxIndex === null) return;
      const total = activeSummary?.screenshots?.length || 0;
      if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveLightboxIndex(prev => Math.min(total - 1, prev + 1));
      } else if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, activeSummary]);

  // Filter students
  const filteredSummaries = summaries.filter(s => {
    if (!selectedStudentFilter) return true;
    return s.userId?.toString() === selectedStudentFilter ||
           (s.studentName || '').toLowerCase().includes(selectedStudentFilter.toLowerCase()) ||
           (s.studentEmail || '').toLowerCase().includes(selectedStudentFilter.toLowerCase());
  });

  const getIntegrityClass = (score) => {
    if (score >= 90) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
  };

  const formatDuration = (secs) => {
    if (!secs) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const formatTimestamp = (isoStr) => {
    if (!isoStr) return '--';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return isoStr;
    }
  };

  if (loading) return <Loading />;

  const screenshots = activeSummary?.screenshots || [];
  const currentLightboxScreenshot = activeLightboxIndex !== null ? screenshots[activeLightboxIndex] : null;

  return (
    <div className="proctoring-dash-container">
      {/* Header */}
      <div className="proctoring-dash-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '2rem' }}>🛡️</span>
          <h1>Assessment Proctoring & Integrity Review</h1>
        </div>
        <p>
          Inspect automated screen-sharing snapshots, full-screen integrity logs, and tab-switch records for student quiz attempts.
        </p>
      </div>

      {/* Filter Row: Course, Quiz, Student */}
      <div className="proctoring-filters-card">
        {/* Course Filter */}
        <div className="filter-group">
          <label>Course Filter</label>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
            }}
            className="filter-select"
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id.toString()}>{c.title || c.courseName}</option>
            ))}
          </select>
        </div>

        {/* Quiz Filter */}
        <div className="filter-group">
          <label>Select Quiz</label>
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="filter-select"
          >
            <option value="" disabled>Choose a Quiz...</option>
            {quizzes
              .filter(q => !selectedCourseId || (q.category && q.category.toLowerCase().includes(selectedCourseId)))
              .map(q => (
                <option key={q.id} value={q.id.toString()}>{q.title} ({q.category})</option>
              ))}
          </select>
        </div>

        {/* Student / Attempt Filter */}
        <div className="filter-group">
          <label>Select Student Attempt</label>
          <select
            value={selectedAttemptId || ''}
            onChange={(e) => handleSelectAttempt(e.target.value ? Number(e.target.value) : null)}
            className="filter-select"
            disabled={summaries.length === 0}
          >
            {summaries.length === 0 ? (
              <option value="">No Attempts Found</option>
            ) : (
              summaries.map(s => (
                <option key={s.attemptId} value={s.attemptId}>
                  {s.studentName} ({s.studentEmail || `User #${s.userId}`}) - Score: {s.score !== null ? `${s.score} pts` : 'Pending'}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {loadingSummary && <Loading />}

      {/* Attempt Review Panel */}
      {!loadingSummary && activeSummary && (
        <>
          <div className="attempt-summary-card">
            <div className="attempt-top-row">
              <div className="attempt-student-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h3>{activeSummary.studentName}</h3>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    background: activeSummary.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                    color: activeSummary.status === 'COMPLETED' ? '#15803d' : '#b45309'
                  }}>
                    {activeSummary.status}
                  </span>
                </div>
                <p>
                  📧 {activeSummary.studentEmail || 'No email registered'} • Assessment: <strong>{activeSummary.quizTitle}</strong> • Attempt: {activeSummary.attemptId}
                </p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                  Started: {activeSummary.startedAt ? new Date(activeSummary.startedAt).toLocaleString() : '--'} •
                  Duration: <strong>{formatDuration(activeSummary.durationSeconds)}</strong>
                </div>
              </div>

              {/* Integrity Score */}
              <div className={`integrity-score-badge ${getIntegrityClass(activeSummary.integrityScore)}`}>
                <div className="score-number">{activeSummary.integrityScore}%</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>INTEGRITY RATING</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                    {activeSummary.integrityScore >= 90 ? '✓ High Compliance' :
                     activeSummary.integrityScore >= 70 ? '⚠️ Moderate Irregularities' :
                     '🛑 High Irregularities'}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Metric KPI Cards */}
            <div className="proctoring-kpi-grid">
              <div className="proctoring-kpi-item">
                <div className="proctoring-kpi-label">Tab Switches</div>
                <div className="proctoring-kpi-val" style={{ color: activeSummary.tabSwitches > 0 ? '#ef4444' : '#0f172a' }}>
                  {activeSummary.tabSwitches}
                </div>
              </div>

              <div className="proctoring-kpi-item">
                <div className="proctoring-kpi-label">Fullscreen Exits</div>
                <div className="proctoring-kpi-val" style={{ color: activeSummary.fullscreenExits > 0 ? '#f59e0b' : '#0f172a' }}>
                  {activeSummary.fullscreenExits}
                </div>
              </div>

              <div className="proctoring-kpi-item">
                <div className="proctoring-kpi-label">Screen Share Drops</div>
                <div className="proctoring-kpi-val" style={{ color: activeSummary.screenShareInterrupts > 0 ? '#ef4444' : '#0f172a' }}>
                  {activeSummary.screenShareInterrupts}
                </div>
              </div>

              <div className="proctoring-kpi-item">
                <div className="proctoring-kpi-label">Snapshots Captured</div>
                <div className="proctoring-kpi-val" style={{ color: '#0284c7' }}>
                  {activeSummary.totalScreenshots || screenshots.length}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Screenshot Timeline Gallery */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem' }}>
            <div className="timeline-section-title">
              <div>
                <h3>Screen Snapshot Timeline</h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  Captured automatically every ~5 seconds from the student's authorized screen-sharing stream.
                </p>
              </div>
              <span style={{ fontSize: '0.9rem', color: '#0284c7', fontWeight: 700 }}>
                {screenshots.length} Total Snapshots
              </span>
            </div>

            {screenshots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📷</span>
                No screen snapshots recorded for this attempt.
              </div>
            ) : (
              <div className="screenshots-filmstrip">
                {screenshots.map((s, idx) => (
                  <ScreenshotThumbnailTile
                    key={s.id}
                    s={s}
                    idx={idx}
                    blobUrl={imageBlobs[s.id]}
                    onSelect={(i) => {
                      setActiveLightboxIndex(i);
                      if (!imageBlobs[s.id]) fetchImageBlob(s.id);
                    }}
                    onFetchBlob={fetchImageBlob}
                    formatTimestamp={formatTimestamp}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section: Recorded Integrity Events Feed */}
          {activeSummary.integrityEvents && activeSummary.integrityEvents.length > 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                Audit Log: Recorded Integrity Events ({activeSummary.integrityEvents.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {activeSummary.integrityEvents.map((evt, idx) => {
                  const type = (evt.eventType || '').toUpperCase();
                  const isSevere = type.contains?.('SCREEN_SHARE_STOP') || type.contains?.('TAB_SWITCH') || type.contains?.('FULLSCREEN_EXIT');
                  return (
                    <div
                      key={evt.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1.1rem',
                        borderRadius: '10px',
                        background: isSevere ? '#fff1f2' : '#f8fafc',
                        border: isSevere ? '1px solid #fecdd3' : '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {type.includes('SCREEN') ? '📺' :
                           type.includes('FULLSCREEN') ? '🖥️' :
                           type.includes('TAB') ? '🔄' : '📌'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSevere ? '#be123c' : '#0f172a' }}>
                            {evt.eventType}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {evt.remarks || 'Automated system event logged.'}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {formatTimestamp(evt.eventTime)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* No Attempts Empty State */}
      {!loadingSummary && !activeSummary && (
        <div style={{
          textAlign: 'center',
          padding: '4rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          color: '#64748b'
        }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>🛡️</span>
          <h3>No Proctored Exam Attempts Recorded</h3>
          <p>Select a different quiz or wait for students to complete their proctored examinations.</p>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {currentLightboxScreenshot && (
        <div className="lightbox-modal">
          <div className="lightbox-header">
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                Screenshot {activeLightboxIndex + 1} of {screenshots.length}
              </span>
              <span style={{ color: '#94a3b8', marginLeft: '1rem', fontSize: '0.9rem' }}>
                Captured: {new Date(currentLightboxScreenshot.capturedAt).toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="btn-proctored btn-proctored-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
              >
                {isZoomed ? '🔍 Zoom Out' : '🔍 Zoom In'}
              </button>
              <button
                onClick={() => {
                  setActiveLightboxIndex(null);
                  setIsZoomed(false);
                }}
                className="btn-proctored btn-proctored-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
              >
                ✕ Close
              </button>
            </div>
          </div>

          <div className="lightbox-content">
            {activeLightboxIndex > 0 && (
              <button
                onClick={() => {
                  const newIdx = activeLightboxIndex - 1;
                  setActiveLightboxIndex(newIdx);
                  if (!imageBlobs[screenshots[newIdx].id]) fetchImageBlob(screenshots[newIdx].id);
                }}
                className="lightbox-nav-btn lightbox-prev"
              >
                ‹
              </button>
            )}

            {imageBlobs[currentLightboxScreenshot.id] ? (
              <img
                src={imageBlobs[currentLightboxScreenshot.id]}
                alt={`Sequence ${currentLightboxScreenshot.sequenceNumber}`}
                className="lightbox-image"
                style={{
                  transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                  cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                  transition: 'transform 0.25s ease'
                }}
                onClick={() => setIsZoomed(!isZoomed)}
              />
            ) : (
              <div style={{ color: '#ffffff' }}>Loading high-resolution snapshot...</div>
            )}

            {activeLightboxIndex < screenshots.length - 1 && (
              <button
                onClick={() => {
                  const newIdx = activeLightboxIndex + 1;
                  setActiveLightboxIndex(newIdx);
                  if (!imageBlobs[screenshots[newIdx].id]) fetchImageBlob(screenshots[newIdx].id);
                }}
                className="lightbox-nav-btn lightbox-next"
              >
                ›
              </button>
            )}
          </div>

          <div className="lightbox-footer">
            <span>Student: <strong>{activeSummary.studentName}</strong> • Quiz: <strong>{activeSummary.quizTitle}</strong></span>
            <span>Use Left / Right arrow keys to navigate • Esc to exit</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctoringDashboard;
