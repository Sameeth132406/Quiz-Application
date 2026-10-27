import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, role, currentUserId, onEnroll, onStatusChange, onDelete }) => {

  const isEducatorOrAdmin = role === 'ADMIN' || role === 'EDUCATOR';
  const isOwner = role === 'ADMIN' || (role === 'EDUCATOR' && (course.educatorId === currentUserId || !course.educatorId));
  const isEnrolled = course.isEnrolled;
  const progress = course.progressPercentage !== undefined ? course.progressPercentage : 0;

  const getDifficultyClass = (diff) => {
    switch ((diff || '').toUpperCase()) {
      case 'BEGINNER':
      case 'EASY':
        return 'diff-beginner';
      case 'INTERMEDIATE':
      case 'MEDIUM':
        return 'diff-intermediate';
      case 'ADVANCED':
      case 'HARD':
        return 'diff-advanced';
      default:
        return 'diff-beginner';
    }
  };

  const getStatusClass = (st) => {
    switch ((st || '').toUpperCase()) {
      case 'PUBLISHED':
        return 'status-published';
      case 'DRAFT':
        return 'status-draft';
      case 'UNPUBLISHED':
        return 'status-unpublished';
      default:
        return 'status-draft';
    }
  };

  return (
    <div className="course-card">
      <Link to={`/courses/${course.id}`} className="course-card-thumb-wrap" style={{ display: 'block', textDecoration: 'none' }}>
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="course-card-img" />
        ) : (
          <div className="course-card-placeholder">
            <span style={{ fontSize: '2.5rem' }}>🎓</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{course.category || 'General'}</span>
          </div>
        )}

        <div className="course-card-badges">
          {course.difficulty && (
            <span className={`badge-difficulty ${getDifficultyClass(course.difficulty)}`}>
              {course.difficulty}
            </span>
          )}
          {isEducatorOrAdmin && course.status && (
            <span className={`badge-status ${getStatusClass(course.status)}`}>
              {course.status}
            </span>
          )}
        </div>
      </Link>

      <div className="course-card-body">
        <h3 className="course-card-title">
          <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {course.title || course.courseName}
          </Link>
        </h3>
        <p className="course-card-desc">{course.description || 'No description provided.'}</p>

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
          <div className="course-card-meta-item">
            <span>📦</span>
            <span>{course.modulesCount || (course.modules ? course.modules.length : 0)} Modules</span>
          </div>
          {course.studentsCount !== undefined && (
            <div className="course-card-meta-item">
              <span>👥</span>
              <span>{course.studentsCount} Students</span>
            </div>
          )}
        </div>

        {/* Progress bar if enrolled student */}
        {isEnrolled && (
          <div className="course-card-progress">
            <div className="progress-info-row">
              <span>Course Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${progress >= 100 ? 'completed' : ''}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="course-card-footer">
          {/* Educator / Admin Controls: NEVER show Enroll Now */}
          {isEducatorOrAdmin ? (
            <div className="card-btn-group">
              <Link to={`/courses/${course.id}`} className="btn-secondary-course" style={{ flex: 1 }}>
                View
              </Link>
              {isOwner ? (
                <>
                  <Link to={`/courses/${course.id}/manage`} className="btn-primary-course" style={{ flex: 1.2 }}>
                    Manage Content
                  </Link>
                  <Link to={`/courses/${course.id}/edit`} className="btn-secondary-course" title="Edit Course">
                    ✏️
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(course.id)}
                      className="btn-danger-course"
                      title="Delete Course"
                    >
                      🗑️
                    </button>
                  )}
                </>
              ) : (
                <Link to={`/courses/${course.id}`} className="btn-primary-course" style={{ flex: 1.2 }}>
                  Course Details
                </Link>
              )}
            </div>
          ) : (
            /* Student Controls: Only students can see Enroll Now or Enrolled */
            <div className="card-btn-group">
              {isEnrolled ? (
                <Link
                  to={`/courses/${course.id}`}
                  className="btn-primary-course"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    fontWeight: 700,
                    padding: '0.65rem 1rem'
                  }}
                >
                  <span>{progress > 0 ? 'Continue Learning' : 'Start Learning'}</span>
                  <span>➔</span>
                </Link>
              ) : (
                <>
                  <Link to={`/courses/${course.id}`} className="btn-secondary-course" style={{ flex: 1 }}>
                    Details
                  </Link>
                  <button
                    onClick={() => onEnroll && onEnroll(course.id)}
                    className="btn-primary-course"
                    style={{ flex: 1.4 }}
                  >
                    Enroll Now
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
