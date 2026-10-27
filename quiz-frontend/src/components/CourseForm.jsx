import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CourseForm = ({ initialData = null, onSubmit, isSubmitting = false }) => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [difficulty, setDifficulty] = useState('BEGINNER');
  const [duration, setDuration] = useState('4 Weeks');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || initialData.courseName || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'Computer Science');
      setDifficulty(initialData.difficulty || 'BEGINNER');
      setDuration(initialData.duration || '4 Weeks');
      setThumbnailUrl(initialData.thumbnailUrl || '');
      setStatus(initialData.status || 'DRAFT');
    }
  }, [initialData]);

  const handleSubmit = (chosenStatus) => {
    if (!title.trim()) {
      setError('Course title is required');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      difficulty,
      duration: duration.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      status: chosenStatus || status,
    };

    onSubmit(payload);
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(status); }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
              Course Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Master Modern Web Development"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.95rem' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
              Course Description *
            </label>
            <textarea
              rows="4"
              placeholder="Provide a comprehensive summary of what students will learn in this course..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
            ></textarea>
          </div>

          {/* Category & Difficulty */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: '#fff' }}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science & AI">Data Science & AI</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: '#fff' }}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          {/* Duration & Thumbnail URL */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                Duration
              </label>
              <input
                type="text"
                placeholder="e.g. 6 Weeks or 24 Hours"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                Thumbnail Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary-course"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('DRAFT')}
              className="btn-secondary-course"
              disabled={isSubmitting}
              style={{ fontWeight: 700 }}
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('PUBLISHED')}
              className="btn-primary-course"
              disabled={isSubmitting}
              style={{ fontWeight: 700 }}
            >
              Publish Course ➔
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
