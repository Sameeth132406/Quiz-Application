import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import mentorService from '../services/mentorService';
import Loading from '../components/Loading';

const MyMentees = () => {
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);

  const [educators, setEducators] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (role !== 'EDUCATOR' && role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const init = async () => {
      setLoading(true);
      setError('');
      try {
        if (role === 'ADMIN') {
          // Admin view: list all educators
          const eduList = await mentorService.getEducators();
          setEducators(Array.isArray(eduList) ? eduList : []);
        } else {
          // Educator role: load own assigned students directly
          const data = await mentorService.getMyStudents();
          setStudents(data || []);
        }
      } catch (e) {
        setError('Failed to load mentorship directory.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [role, navigate]);

  const filteredStudents = students.filter(s =>
    s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    s.studentEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEducators = educators.filter(e =>
    e.username?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getProgressColor = (pct) => {
    if (pct >= 80) return '#16a34a';
    if (pct >= 40) return '#d97706';
    return '#dc2626';
  };

  if (loading) return <Loading />;

  return (
    <div style={{
      maxWidth: '960px',
      margin: '2rem auto',
      padding: '0 1.5rem',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.4rem 0' }}>
          {role === 'ADMIN' ? 'Educator Mentorship Directory' : 'My Students'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          {role === 'ADMIN'
            ? 'Select an educator to open their official reporting channel, receive student progress reports, and pass course instructions.'
            : 'Students who have chosen you as their mentor'}
        </p>
      </div>

      {/* Admin Notice */}
      {role === 'ADMIN' && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#166534',
          fontWeight: '600',
          lineHeight: '1.5',
        }}>
          Admin Mentorship Hub: Select any educator to communicate directly, pass course details, guidelines, and receive their student progress reports. (No students are assigned to the admin directly).
        </div>
      )}

      {/* Educator Notice / Admin Reporting Quick Link */}
      {role === 'EDUCATOR' && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(37,99,235,0.05)'
        }}>
          <div>
            <div style={{ fontWeight: '700', color: '#1e40af', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📢</span> Admin Reporting & Communication
            </div>
            <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.2rem' }}>
              Need to pass details, submit student progress reports, or share media files with the Administrator?
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/mentor/chat/admin')}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <span>💬</span> Message Admin & Send Reports
          </button>
        </div>
      )}

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          fontSize: '0.88rem',
        }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder={role === 'ADMIN' ? 'Search educators by name or email...' : 'Search students by name or email...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '0.92rem',
            outline: 'none',
            background: '#ffffff',
            color: '#0f172a',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#2563eb'; }}
          onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
        />
      </div>

      {/* ADMIN VIEW: List of Educators */}
      {role === 'ADMIN' ? (
        filteredEducators.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            color: '#64748b',
          }}>
            <div style={{ fontWeight: '600', fontSize: '1rem' }}>
              {search ? 'No educators match your search' : 'No educators registered yet'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filteredEducators.map((edu, index) => (
              <div
                key={edu.id}
                onClick={() => navigate(`/mentor/chat/${edu.id}`)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '1.05rem',
                    }}>
                      {(edu.username || 'E')[0].toUpperCase()}
                    </div>
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      left: '-4px',
                      background: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #ffffff'
                    }}>
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.98rem' }}>
                      {edu.username}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {edu.email}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.85rem',
                  marginTop: '0.5rem',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Mentees: <strong style={{ color: '#0f172a' }}>{edu.assignedStudentsCount || 0}</strong>
                    {edu.coursesCount !== undefined && (
                      <span style={{ marginLeft: '0.65rem' }}>Courses: <strong style={{ color: '#0f172a' }}>{edu.coursesCount}</strong></span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/mentor/chat/${edu.id}`);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 2px 6px rgba(37,99,235,0.2)'
                    }}
                  >
                    <span>💬</span> Chat & Reports →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* EDUCATOR VIEW: Assigned Students List */
        filteredStudents.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            color: '#64748b',
          }}>
            <div style={{ fontWeight: '600', fontSize: '1rem' }}>
              {search ? 'No students match your search' : 'No students assigned yet'}
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
              Students will appear here once they choose you as their mentor for a course.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredStudents.map((student, index) => (
              <div
                key={student.assignmentId}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
              >
                {/* Avatar with sequential order badge */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '1.1rem',
                  }}>
                    {(student.studentName || 'S')[0].toUpperCase()}
                  </div>
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '-4px',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}>
                    {index + 1}
                  </span>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>
                      {student.studentName}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                      {student.studentEmail}
                    </span>
                    {student.courseTitle && (
                      <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                        · <strong style={{ color: '#334155' }}>{student.courseTitle}</strong>
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginTop: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#64748b' }}>Course Progress</span>
                      <span style={{ fontWeight: '700', color: getProgressColor(student.progress) }}>
                        {Math.round(student.progress)}%
                      </span>
                    </div>
                    <div style={{
                      height: '6px',
                      borderRadius: '999px',
                      background: '#f1f5f9',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        borderRadius: '999px',
                        background: getProgressColor(student.progress),
                        width: `${Math.min(Math.max(student.progress, 0), 100)}%`,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                </div>

                {/* Chat Button for Educator */}
                <button
                  onClick={() => navigate(`/mentor/chat/${student.studentId}`)}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.55rem 1.1rem',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  Chat
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default MyMentees;
