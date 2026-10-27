import React, { useState, useEffect } from 'react';

const ModuleForm = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleOrder, setModuleOrder] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setModuleOrder(initialData.moduleOrder || 1);
    } else {
      setTitle('');
      setDescription('');
      setModuleOrder(1);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Module title is required');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      moduleOrder: Number(moduleOrder),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-card">
        <div className="modal-header">
          <h3>{initialData ? 'Edit Module' : 'Add New Module'}</h3>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message" style={{ color: '#dc2626', fontSize: '0.85rem' }}>{error}</div>}

            <div className="form-group">
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                Module Title *
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Module 1: Introduction to Java"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                Description
              </label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Overview of this module's objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
              ></textarea>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                Display Order
              </label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={moduleOrder}
                onChange={(e) => setModuleOrder(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary-course">
              Cancel
            </button>
            <button type="submit" className="btn-primary-course">
              {initialData ? 'Update Module' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleForm;
