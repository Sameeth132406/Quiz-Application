import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';
import { useAuth } from '../context/AuthContext';

const CoursesPage = () => {
  const { user } = useAuth();
  const isEducatorOrAdmin = ['ADMIN', 'EDUCATOR', 'ACADEMIC_ADMIN'].includes(user?.role);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState(user?.username || '');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      if (searchKey.trim()) {
        const data = await courseService.searchCourses(searchKey);
        setCourses(data);
      } else {
        const data = await courseService.getAllCourses();
        setCourses(data);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setCourseCode('');
    setCourseName('');
    setDescription('');
    setInstructor(user?.username || '');
    setShowModal(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingId(course.id);
    setCourseCode(course.courseCode);
    setCourseName(course.courseName);
    setDescription(course.description || '');
    setInstructor(course.instructor || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { courseCode, courseName, description, instructor };
    try {
      if (editingId) {
        await courseService.updateCourse(editingId, payload);
      } else {
        await courseService.addCourse(payload);
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save course');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(id);
        fetchCourses();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Course Catalog</h1>
          <p className="page-subtitle">Explore enrolled courses, syllabi, and instructor modules</p>
        </div>
        {isEducatorOrAdmin && (
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            + Create New Course
          </button>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', maxWidth: '500px' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by title, code or topic..."
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-secondary">Search</button>
      </form>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="loading-spinner">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-icon">📚</div>
          <h3>No Courses Found</h3>
          <p>Try searching for a different keyword or create a new course.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {courses.map((c) => (
            <div key={c.id} className="glass-card interactive" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-educator" style={{ fontSize: '0.8rem' }}>{c.courseCode}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instructor: {c.instructor}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{c.courseName}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', flex: 1, marginBottom: '1.25rem' }}>
                {c.description || 'No detailed description provided.'}
              </p>

              {isEducatorOrAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(c)} style={{ flex: 1 }}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Course' : 'Create New Course'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Course Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. CS101"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Introduction to Computer Science"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Instructor</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Instructor Name"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Course summary and objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
