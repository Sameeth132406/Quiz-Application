import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import courseService from '../services/courseService';
import progressService from '../services/progressService';
import ContentViewer from '../components/ContentViewer';
import CourseProgress from '../components/CourseProgress';
import Loading from '../components/Loading';

const CourseLearning = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMarking, setIsMarking] = useState(false);

  const loadLearningData = async () => {
    try {
      const [courseData, progress] = await Promise.all([
        courseService.getCourseById(id),
        progressService.getCourseProgress(id).catch(() => null),
      ]);

      setCourse(courseData);
      setProgressData(progress);

      // Select initial topic (resume location or first content item)
      if (courseData.modules && courseData.modules.length > 0) {
        let targetContent = null;
        let targetModuleId = null;

        const allItems = [];
        courseData.modules.forEach((mod) => {
          if (mod.contents) {
            mod.contents.forEach((c) => allItems.push({ content: c, moduleId: mod.id }));
          }
        });

        if (progress?.nextContentId) {
          const found = allItems.find((item) => item.content.id === progress.nextContentId);
          if (found) {
            targetContent = found.content;
            targetModuleId = found.moduleId;
          }
        }

        if (!targetContent && allItems.length > 0) {
          targetContent = allItems[0].content;
          targetModuleId = allItems[0].moduleId;
        }

        setSelectedContent((prev) => prev || targetContent);
        setSelectedModuleId((prev) => prev || targetModuleId);
      }
    } catch (err) {
      console.error('Failed to load learning data', err);
      setError('Failed to load course learning workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLearningData();
  }, [id]);

  // Flatten all items for Next / Previous navigation
  const getAllContentItems = () => {
    if (!course || !course.modules) return [];
    const items = [];
    course.modules.forEach((mod) => {
      if (mod.contents) {
        mod.contents.forEach((c) => {
          items.push({ ...c, parentModuleId: mod.id });
        });
      }
    });
    return items;
  };

  const allItems = getAllContentItems();
  const currentIndex = selectedContent ? allItems.findIndex((c) => c.id === selectedContent.id) : -1;
  const prevContent = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextContent = currentIndex >= 0 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  const isCurrentCompleted = selectedContent && progressData?.completedContentIds?.has
    ? progressData.completedContentIds.has(selectedContent.id)
    : selectedContent && progressData?.completedContentIds?.includes
    ? progressData.completedContentIds.includes(selectedContent.id)
    : false;

  const handleToggleComplete = async () => {
    if (!selectedContent) return;
    setIsMarking(true);
    try {
      await progressService.toggleContentComplete(selectedContent.id);
      const updatedProgress = await progressService.getCourseProgress(id);
      setProgressData(updatedProgress);

      // If just marked complete and next content exists, optionally advance or let user click
    } catch (err) {
      console.error('Failed to update progress', err);
    } finally {
      setIsMarking(false);
    }
  };

  const handleSelectContent = (content, moduleId) => {
    setSelectedContent(content);
    setSelectedModuleId(moduleId);
  };

  if (loading) return <Loading />;
  if (error || !course) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>{error}</div>;
  }

  return (
    <div className="learning-layout">
      {/* Sidebar: Course Modules & Content Checklist */}
      <aside className="learning-sidebar">
        <div className="learning-sidebar-header">
          <Link to={`/courses/${id}`} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-block', marginBottom: '0.4rem' }}>
            ‹ Back to Course Details
          </Link>
          <div className="learning-course-title">
            {course.title || course.courseName}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Instructor: {course.createdBy || course.instructor}
          </div>

          <CourseProgress
            progress={progressData?.progressPercentage || 0}
            totalItems={progressData?.totalContentsCount || 0}
            completedItems={progressData?.completedContentsCount || 0}
            isCompleted={progressData?.isCompleted}
          />
        </div>

        <div className="learning-modules-list">
          {course.modules && course.modules.map((mod, modIdx) => (
            <div key={mod.id} className="learn-module-box">
              <div className="learn-module-header">
                <span>Module {modIdx + 1}: {mod.title}</span>
              </div>

              <div>
                {mod.contents && mod.contents.map((item) => {
                  const completed = progressData?.completedContentIds?.has
                    ? progressData.completedContentIds.has(item.id)
                    : progressData?.completedContentIds?.includes
                    ? progressData.completedContentIds.includes(item.id)
                    : false;

                  const isActive = selectedContent?.id === item.id;

                  return (
                    <button
                      key={item.id}
                      className={`learn-item-button ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectContent(item, mod.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.7rem', background: '#e2e8f0', color: '#475569', padding: '0.15rem 0.35rem', borderRadius: '3px', fontWeight: 700, flexShrink: 0 }}>
                          {item.contentType}
                        </span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </span>
                      </div>
                      {completed && <span className="check-icon-completed">✓</span>}
                    </button>
                  );
                })}

                {/* Attached Quiz in module */}
                {mod.quizId && (
                  <Link
                    to={`/take-quiz/${mod.quizId}`}
                    className="learn-item-button"
                    style={{ background: '#fff7ed', color: '#9a3412', fontWeight: 600 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', background: '#fed7aa', color: '#9a3412', padding: '0.15rem 0.35rem', borderRadius: '3px', fontWeight: 800 }}>QUIZ</span>
                      <span>{mod.quizTitle || 'Assessment'}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', background: '#fed7aa', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      Start
                    </span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Stage */}
      <section className="learning-stage">
        <div className="learning-content-header">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              {selectedContent ? selectedContent.contentType : 'Learning Space'}
            </span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {selectedContent ? selectedContent.title : 'Select a topic'}
            </h1>
          </div>

          {selectedContent && (
            <button
              onClick={handleToggleComplete}
              disabled={isMarking}
              className={isCurrentCompleted ? 'btn-secondary-course' : 'btn-primary-course'}
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
            >
              {isCurrentCompleted ? '✓ Completed (Click to Undo)' : 'Mark as Complete ✓'}
            </button>
          )}
        </div>

        <div className="learning-content-body">
          <ContentViewer
            content={selectedContent}
            courseId={id}
            moduleId={selectedModuleId}
            onComplete={handleToggleComplete}
            isCompleted={isCurrentCompleted}
          />
        </div>

        {/* Footer Navigation Bar */}
        <div className="learning-footer-bar">
          <button
            onClick={() => prevContent && handleSelectContent(prevContent, prevContent.parentModuleId)}
            disabled={!prevContent}
            className="btn-secondary-course"
            style={{ opacity: prevContent ? 1 : 0.5, cursor: prevContent ? 'pointer' : 'not-allowed' }}
          >
            ← Previous
          </button>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Topic {currentIndex + 1} of {allItems.length}
          </span>

          <button
            onClick={() => nextContent && handleSelectContent(nextContent, nextContent.parentModuleId)}
            disabled={!nextContent}
            className="btn-primary-course"
            style={{ opacity: nextContent ? 1 : 0.5, cursor: nextContent ? 'pointer' : 'not-allowed' }}
          >
            Next →
          </button>
        </div>
      </section>
    </div>
  );
};

export default CourseLearning;
