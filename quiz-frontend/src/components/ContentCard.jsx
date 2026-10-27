import React from 'react';

const ContentCard = ({ content, isEducator, onEdit, onDelete, onClick, isSelected, isCompleted }) => {
  return (
    <div
      className={`content-row-item ${isSelected ? 'selected' : ''}`}
      style={{
        borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <div className="content-item-left">
        <span style={{
          fontSize: '0.7rem',
          background: '#f1f5f9',
          color: '#475569',
          padding: '0.2rem 0.45rem',
          borderRadius: '4px',
          fontWeight: 700,
          border: '1px solid #e2e8f0',
          textTransform: 'uppercase'
        }}>
          {content.contentType || 'CONTENT'}
        </span>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            {content.title}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {content.contentType} {content.duration ? `• ${content.duration}` : ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {isCompleted && (
          <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.9rem' }} title="Completed">
            ✓
          </span>
        )}

        {isEducator && (
          <>
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(content);
                }}
                className="btn-secondary-course"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
                title="Edit Content"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(content.id);
                }}
                className="btn-danger-course"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
                title="Delete Content"
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContentCard;
