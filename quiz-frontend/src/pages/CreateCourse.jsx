import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import CourseForm from '../components/CourseForm';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (courseData) => {
    setIsSubmitting(true);
    setError('');
    try {
      const created = await courseService.createCourse(courseData);
      // Redirect to course management page to add modules & content
      navigate(`/courses/${created.id}/manage`);
    } catch (err) {
      console.error('Failed to create course', err);
      setError(err.response?.data?.message || 'Failed to create course. Please verify required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="course-page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="course-title-block">
        <h1>Create New Course</h1>
        <p>Set up your course details. After saving, you will be directed to organize modules, upload files, and attach quizzes.</p>
      </div>

      {error && (
        <div style={{ padding: '0.8rem 1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </div>
      )}

      <CourseForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
    </div>
  );
};

export default CreateCourse;
