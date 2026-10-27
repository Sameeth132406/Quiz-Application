import React from 'react';
import ContentCard from './ContentCard';

const ModuleCard = ({
  module,
  isEducator,
  onEditModule,
  onDeleteModule,
  onAddContent,
  onAddQuiz,
  onRemoveQuiz,
  onEditContent,
  onDeleteContent,
}) => {
  return (
    <div className="module-accordion-item" style={{ marginBottom: '1.25rem', background: '#fff' }}>
      <div className="module-header" style={{ padding: '1rem 1.25rem' }}>
        <div>
          <div className="module-header-title">
            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>
              Module {module.moduleOrder}:
            </span>
            <span>{module.title}</span>
          </div>
          {module.description && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {module.description}
            </p>
          )}
        </div>

        {isEducator && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onAddContent(module.id)}
              className="btn-primary-course"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              + Add Content
            </button>
            {!module.quizId ? (
              <button
                onClick={() => onAddQuiz(module.id)}
                className="btn-secondary-course"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                + Attach Quiz
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onEditModule(module)}
              className="btn-secondary-course"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
              title="Edit Module"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDeleteModule(module.id)}
              className="btn-danger-course"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
              title="Delete Module"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="module-content-list" style={{ padding: '1rem 1.25rem' }}>
        {/* Attached Quiz if present */}
        {module.quizId && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.78rem', background: '#fed7aa', color: '#9a3412', padding: '0.2rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>QUIZ</span>
              <div>
                <div style={{ fontWeight: 700, color: '#9a3412', fontSize: '0.9rem' }}>
                  {module.quizTitle || 'Assessment Quiz'}
                </div>
                {module.quizDuration && (
                  <div style={{ fontSize: '0.78rem', color: '#c2410c' }}>
                    Duration: {module.quizDuration} mins
                  </div>
                )}
              </div>
            </div>

            {isEducator && onRemoveQuiz && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveQuiz(module.id);
                }}
                className="btn-danger-course"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Detach Quiz
              </button>
            )}
          </div>
        )}

        {/* Content Items */}
        {module.contents && module.contents.length > 0 ? (
          module.contents.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              isEducator={isEducator}
              onEdit={onEditContent}
              onDelete={onDeleteContent}
            />
          ))
        ) : (
          !module.quizId && (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No content items added yet in this module.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ModuleCard;
