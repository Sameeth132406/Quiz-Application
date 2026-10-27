import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('STUDENT');
    setShowModal(true);
  };

  const handleOpenEdit = (u) => {
    setEditingId(u.id);
    setUsername(u.username);
    setEmail(u.email);
    setPassword('');
    setRole(u.role || 'STUDENT');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { username, email, password: password || '123456', role };
    try {
      if (editingId) {
        await userService.updateUser(editingId, payload);
      } else {
        await userService.addUser(payload);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Admin control panel for user accounts and permission roles</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          + Create User Account
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading users table...</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u.id}>
                  <td><strong>{index + 1}</strong></td>
                  <td style={{ fontWeight: '600' }}>{u.username}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td>
                    <span className={`badge badge-${(u.role || 'STUDENT').toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(u)} style={{ marginRight: '0.5rem' }}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit User' : 'Create User Account'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password {editingId && '(Leave empty to keep existing)'}</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingId}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="STUDENT">STUDENT</option>
                  <option value="EDUCATOR">EDUCATOR</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="PROCTOR">PROCTOR</option>
                  <option value="ANALYST">ANALYST</option>
                  <option value="ACADEMIC_ADMIN">ACADEMIC_ADMIN</option>
                  <option value="TEACHING_ASSISTANT">TEACHING_ASSISTANT</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
