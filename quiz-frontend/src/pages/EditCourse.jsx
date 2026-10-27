import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import CourseForm from '../components/CourseForm';
import Loading from '../components/Loading';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await courseService.getCourseById(id);
        setCourse(data);
      } catch (err) {
        console.error('Failed to load course for edit', err);
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleUpdate = async (courseData) => {
    setIsSubmitting(true);
    setError('');
    try {
      await courseService.updateCourse(id, courseData);
      navigate(`/courses/${id}/manage`);
    } catch (err) {
      console.error('Failed to update course', err);
      setError(err.response?.data?.message || 'Failed to update course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error && !course) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>
        {error}
      </div>
    );
  }

  return (
    <div className="course-page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="course-title-block">
        <h1>Edit Course: {course?.title}</h1>
        <p>Modify basic course parameters, status, and description.</p>
      </div>

      {error && (
        <div style={{ padding: '0.8rem 1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </div>
      )}

      <CourseForm initialData={course} onSubmit={handleUpdate} isSubmitting={isSubmitting} />
    </div>
  );
};

export default EditCourse;
