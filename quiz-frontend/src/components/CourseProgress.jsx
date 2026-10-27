import React from 'react';

const CourseProgress = ({ progress = 0, totalItems = 0, completedItems = 0, isCompleted = false }) => {
  const percentage = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="course-progress-component" style={{ width: '100%' }}>
      <div className="progress-info-row" style={{ marginBottom: '0.4rem' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
          Course Progress: {percentage}%
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          {completedItems} / {totalItems} completed
        </span>
      </div>

      <div className="progress-track" style={{ height: '8px' }}>
        <div
          className={`progress-fill ${isCompleted || percentage >= 100 ? 'completed' : ''}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {isCompleted && (
        <div style={{ marginTop: '0.5rem', color: '#16a34a', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span>🎉</span>
          <span>Congratulations! You have completed all content in this course.</span>
        </div>
      )}
    </div>
  );
};

export default CourseProgress;
