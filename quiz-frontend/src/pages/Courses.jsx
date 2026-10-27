import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';
import CourseCard from '../components/CourseCard';
import Loading from '../components/Loading';

const Courses = () => {
  const navigate = useNavigate();
  const { user, role } = useContext(AuthContext);
  const isEducatorOrAdmin = role === 'ADMIN' || role === 'EDUCATOR';

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      let data = [];
      let enrolledData = [];

      if (activeTab === 'my' && isEducatorOrAdmin) {
        data = await courseService.getMyCreatedCourses();
      } else {
        data = await courseService.getAllCourses();
      }

      if (role === 'STUDENT') {
        enrolledData = await enrollmentService.getEnrolledCourses().catch(() => []);
      }

      const enrolledMap = new Map();
      (enrolledData || []).forEach(e => {
        enrolledMap.set(e.courseId, e.progressPercentage != null ? e.progressPercentage : 0);
      });

      const annotated = (data || []).map(c => ({
        ...c,
        isEnrolled: c.isEnrolled || enrolledMap.has(c.id),
        progressPercentage: c.progressPercentage !== undefined ? c.progressPercentage : (enrolledMap.get(c.id) || 0)
      }));

      setCourses(annotated);
    } catch (err) {
      console.error('Failed to load courses', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [activeTab]);

  const handleEnroll = async (courseId) => {
    try {
      await enrollmentService.enrollCourse(courseId);
      navigate(`/courses/${courseId}`);
    } catch (err) {
      console.error('Enrollment error', err);
      alert(err.response?.data?.message || 'Failed to enroll in course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? All associated modules and contents will be removed.')) {
      return;
    }
    try {
      await courseService.deleteCourse(courseId);
      setActionMessage('Course deleted successfully');
      setCourses(courses.filter((c) => c.id !== courseId));
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete course', err);
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  // Filtered list
  const filteredCourses = courses.filter((c) => {
    const titleMatch = (c.title || c.courseName || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
                       (c.description || '').toLowerCase().includes(searchKeyword.toLowerCase());
    const categoryMatch = !selectedCategory || c.category === selectedCategory;
    const diffMatch = !selectedDifficulty || (c.difficulty || '').toUpperCase() === selectedDifficulty.toUpperCase();
    return titleMatch && categoryMatch && diffMatch;
  });

  return (
    <div className="course-page-container">
      {/* Header Row */}
      <div className="course-header-row">
        <div className="course-title-block">
          <h1>Course Directory</h1>
          <p>Explore specialized courses, develop in-demand skills, and complete integrated assessments.</p>
        </div>

        <div className="course-actions-bar">
          {role === 'STUDENT' && (
            <Link to="/my-courses" className="btn-secondary-course">
              📚 My Enrolled Courses
            </Link>
          )}

          {isEducatorOrAdmin && (
            <Link to="/courses/create" className="btn-primary-course">
              + Create New Course
            </Link>
          )}
        </div>
      </div>

      {actionMessage && (
        <div style={{ padding: '0.8rem 1.25rem', background: '#dcfce7', color: '#15803d', borderRadius: 'var(--radius)', fontWeight: 600 }}>
          {actionMessage}
        </div>
      )}

      {/* Educator Tabs */}
      {isEducatorOrAdmin && (
        <div className="course-tab-group">
          <button
            className={`course-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Courses ({courses.length})
          </button>
          <button
            className={`course-tab-btn ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Created Courses
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="course-filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon-inside">🔍</span>
          <input
            type="text"
            placeholder="Search courses by keyword, topic, or instructor..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        <select
          className="course-filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Web Development">Web Development</option>
          <option value="Data Science & AI">Data Science & AI</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Business">Business</option>
        </select>

        <select
          className="course-filter-select"
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      {/* Courses List */}
      {loading ? (
        <Loading />
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>{error}</div>
      ) : filteredCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>🎓</span>
          <h3>No courses found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search filters or check back soon.</p>
          {isEducatorOrAdmin && (
            <Link to="/courses/create" className="btn-primary-course" style={{ marginTop: '1rem' }}>
              Create Your First Course
            </Link>
          )}
        </div>
      ) : (
        <div className="course-grid">
          {filteredCourses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              role={role}
              currentUserId={user?.id}
              onEnroll={handleEnroll}
              onDelete={handleDeleteCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
