import React, { useEffect, useState } from 'react';
import { gradebookService } from '../services/gradebookService';
import { attemptService } from '../services/attemptService';
import { userService } from '../services/userService';

const GradebookPage = () => {
  const [grades, setGrades] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGradesData = async () => {
      try {
        setLoading(true);
        const [gData, aData, uData] = await Promise.allSettled([
          gradebookService.getAllGrades(),
          attemptService.getAllAttempts(),
          userService.getAllUsers(),
        ]);

        if (gData.status === 'fulfilled') setGrades(gData.value || []);
        if (aData.status === 'fulfilled') setAttempts(aData.value || []);
        if (uData.status === 'fulfilled' && Array.isArray(uData.value)) {
          const map = {};
          uData.value.forEach((u) => {
            if (u.id) map[u.id] = u.username || u.name || `User #${u.id}`;
          });
          setUsersMap(map);
        }
      } catch (err) {
        console.error('Failed to load gradebook records', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGradesData();
  }, []);

  const getUserName = (userId) => {
    if (!userId) return 'Unknown User';
    return usersMap[userId] || `User #${userId}`;
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gradebook & Results</h1>
          <p className="page-subtitle">Historical performance records and grade calculations</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading grade records...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Gradebook Entries */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem' }}>Grade Records</h3>
            {grades.length === 0 ? (
              <div className="glass-card empty-state">
                <div className="empty-icon">📈</div>
                <h4>No gradebook records found</h4>
                <p>Grades will appear here once assignments/quizzes are evaluated.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>User</th>
                      <th>Course ID</th>
                      <th>Quiz ID</th>
                      <th>Score</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((g) => (
                      <tr key={g.id}>
                        <td>#{g.id}</td>
                        <td style={{ fontWeight: '600' }}>{getUserName(g.userId)}</td>
                        <td>Course #{g.courseId}</td>
                        <td>Quiz #{g.quizId}</td>
                        <td style={{ fontWeight: '700', color: 'var(--accent-emerald)' }}>{g.score}</td>
                        <td><span className="badge badge-student">{g.grade || 'A'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Attempt Log Entries */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem' }}>Quiz Attempt Logs</h3>
            {attempts.length === 0 ? (
              <div className="glass-card empty-state">
                <h4>No recent quiz attempts found</h4>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Attempt ID</th>
                      <th>Quiz ID</th>
                      <th>User</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Started At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((a) => (
                      <tr key={a.id}>
                        <td>#{a.id}</td>
                        <td>Quiz #{a.quizId}</td>
                        <td style={{ fontWeight: '600' }}>{getUserName(a.userId)}</td>
                        <td style={{ fontWeight: '700' }}>{a.score} pts</td>
                        <td>
                          <span className="badge badge-student">
                            {a.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {a.startedAt ? new Date(a.startedAt).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GradebookPage;
