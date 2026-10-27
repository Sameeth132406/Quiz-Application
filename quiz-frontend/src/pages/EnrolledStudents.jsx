import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import enrollmentService from '../services/enrollmentService';
import courseService from '../services/courseService';
import Loading from '../components/Loading';

const EnrolledStudents = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, studentsData] = await Promise.all([
          courseService.getCourseById(id),
          enrollmentService.getCourseStudents(id),
        ]);
        setCourse(courseData);
        setStudents(studentsData || []);
      } catch (err) {
        console.error('Failed to load students', err);
        setError('Failed to load enrolled students list.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Loading />;

  return (
    <div className="course-page-container">
      <div className="course-header-row">
        <div className="course-title-block">
          <Link to={`/courses/${id}/manage`} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ‹ Back to Course Management
          </Link>
          <h1 style={{ marginTop: '0.35rem' }}>
            Enrolled Students: {course?.title || course?.courseName}
          </h1>
          <p>Monitor student enrollment dates, progress percentages, and course completion status.</p>
        </div>

        <div className="course-actions-bar">
          <Link to={`/courses/${id}/manage`} className="btn-secondary-course">
            Manage Course
          </Link>
        </div>
      </div>

      {error && <div style={{ color: '#dc2626', textAlign: 'center', padding: '2rem' }}>{error}</div>}

      {students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>👥</span>
          <h3>No students enrolled yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Ensure your course is published so students can discover and enroll in it.
          </p>
        </div>
      ) : (
        <div className="students-table-wrap">
          <table className="students-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Student</th>
                <th>Email</th>
                <th>Enrolled Date</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st, index) => {
                const progress = st.progressPercentage !== undefined ? st.progressPercentage : 0;
                return (
                  <tr key={st.id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                          {(st.studentUsername?.[0] || 'S').toUpperCase()}
                        </div>
                        <strong>{st.studentUsername || 'Student'}</strong>
                      </div>
                    </td>
                    <td>{st.studentEmail || '-'}</td>
                    <td>
                      {st.enrolledAt ? new Date(st.enrolledAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ minWidth: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div className="progress-track" style={{ flex: 1 }}>
                          <div
                            className={`progress-fill ${progress >= 100 ? 'completed' : ''}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{progress}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-status ${progress >= 100 ? 'status-published' : 'status-draft'}`}>
                        {st.status || (progress >= 100 ? 'COMPLETED' : 'ACTIVE')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EnrolledStudents;
