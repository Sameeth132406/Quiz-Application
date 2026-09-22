import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch system user directory from backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        await authService.deleteUser(userId);
        setUsers(users.filter((u) => u.id !== userId));
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.4rem' }}>User Management</h1>
          <p className="page-subtitle" style={{ fontSize: '0.825rem' }}>View, search, and manage registered system accounts</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ width: '220px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
          />
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading user directory..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchUsers} />
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">No users found matching your search.</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email Address</th>
                <th>Role</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td><code>#{u.id}</code></td>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-hard' : u.role === 'EDUCATOR' ? 'badge-medium' : 'badge-easy'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteUser(u.id, u.username)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
