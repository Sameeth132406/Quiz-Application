import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import enrollmentService from '../services/enrollmentService';
import Loading from '../components/Loading';

const MyCourses = () => {
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEnrolledCourses = async () => {
    setLoading(true);
    try {
      const data = await enrollmentService.getEnrolledCourses();
      setEnrolled(data || []);
    } catch (err) {
      console.error('Failed to load enrolled courses', err);
      setError('Failed to load your enrolled courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course? Your progress will be reset.')) {
      return;
    }
    try {
      await enrollmentService.unenrollCourse(courseId);
      setEnrolled(enrolled.filter((e) => e.courseId !== courseId));
    } catch (err) {
      console.error('Failed to unenroll', err);
      alert('Failed to unenroll from course');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="course-page-container">
      <div className="course-header-row">
        <div className="course-title-block">
          <h1>My Enrolled Courses</h1>
          <p>Resume your learning journey, track your completion progress, and take quizzes.</p>
        </div>

        <Link to="/courses" className="btn-primary-course">
          + Explore More Courses
        </Link>
      </div>

      {error && <div style={{ color: '#dc2626', textAlign: 'center', padding: '2rem' }}>{error}</div>}

      {enrolled.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>📚</span>
          <h3>You haven't enrolled in any courses yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Browse through our published course catalog and start expanding your skillset today!
          </p>
          <Link to="/courses" className="btn-primary-course">
            Browse Course Catalog
          </Link>
        </div>
      ) : (
        <div className="course-grid">
          {enrolled.map((item) => {
            const progress = item.progressPercentage !== undefined ? item.progressPercentage : 0;
            const course = item.course || {};

            return (
              <div key={item.id} className="course-card">
                <Link to={`/courses/${item.courseId}`} className="course-card-thumb-wrap" style={{ display: 'block', textDecoration: 'none' }}>
                  {item.courseThumbnailUrl || course.thumbnailUrl ? (
                    <img
                      src={item.courseThumbnailUrl || course.thumbnailUrl}
                      alt={item.courseTitle || course.title}
                      className="course-card-img"
                    />
                  ) : (
                    <div className="course-card-placeholder">
                      <span style={{ fontSize: '2.5rem' }}>🎓</span>
                    </div>
                  )}

                  <div className="course-card-badges">
                    <span className={`badge-status ${progress >= 100 ? 'status-published' : 'status-draft'}`}>
                      {progress >= 100 ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </Link>

                <div className="course-card-body">
                  <h3 className="course-card-title">
                    <Link to={`/courses/${item.courseId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {item.courseTitle || course.title}
                    </Link>
                  </h3>
                  <p className="course-card-desc">{course.description || 'No description available.'}</p>

                  <div className="course-card-meta">
                    <div className="course-card-meta-item">
                      <span>👤</span>
                      <span>{course.createdBy || course.instructor || 'Instructor'}</span>
                    </div>
                    {course.duration && (
                      <div className="course-card-meta-item">
                        <span>⏱️</span>
                        <span>{course.duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="course-card-progress">
                    <div className="progress-info-row">
                      <span>Completion</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className={`progress-fill ${progress >= 100 ? 'completed' : ''}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="course-card-footer">
                    <div className="card-btn-group">
                      <Link
                        to={`/courses/${item.courseId}`}
                        className="btn-primary-course"
                        style={{ flex: 2, textAlign: 'center' }}
                      >
                        {progress > 0 ? 'Continue Learning' : 'Start Learning'} ➔
                      </Link>
                      <button
                        onClick={() => handleUnenroll(item.courseId)}
                        className="btn-secondary-course"
                        title="Unenroll from Course"
                        style={{ color: '#b91c1c' }}
                      >
                        Unenroll
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
