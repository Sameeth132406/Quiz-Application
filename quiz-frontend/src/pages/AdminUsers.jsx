import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected user for viewing & editing user log
  const [logUser, setLogUser] = useState(null);
  const [editingLog, setEditingLog] = useState(false);
  const [logForm, setLogForm] = useState({});
  const [savingLog, setSavingLog] = useState(false);
  const [logSuccess, setLogSuccess] = useState('');
  const [logError, setLogError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${username}"?`)) {
      return;
    }
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      if (logUser?.id === userId) {
        setLogUser(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleOpenLog = (u) => {
    setLogUser(u);
    setEditingLog(false);
    setLogSuccess('');
    setLogError('');
    setLogForm({
      fullName: u.fullName || '',
      email: u.email || '',
      phoneNumber: u.phoneNumber || '',
      dob: u.dob || '',
      gender: u.gender || '',
      address: u.address || '',
      aadhaarNumber: u.aadhaarNumber || '',
      panNumber: u.panNumber || '',
      qualification: u.qualification || '',
      institution: u.institution || '',
      rollNumber: u.rollNumber || '',
      passingYear: u.passingYear || '',
      specialization: u.specialization || '',
      designation: u.designation || '',
      department: u.department || '',
      experienceYears: u.experienceYears || '',
      employeeId: u.employeeId || '',
      bio: u.bio || '',
      role: u.role
    });
  };

  const handleLogFormChange = (e) => {
    const { name, value } = e.target;
    setLogForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveLog = async (e) => {
    e.preventDefault();
    if (!logUser) return;
    setSavingLog(true);
    setLogSuccess('');
    setLogError('');

    try {
      const updated = await userService.updateUser(logUser.id, logForm);
      setLogSuccess('User details log updated successfully!');
      setLogUser(updated);
      // update local table list
      setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
      setEditingLog(false);
    } catch (err) {
      setLogError(err.response?.data?.message || 'Failed to update user log.');
    } finally {
      setSavingLog(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.fullName?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            User Management & Administrative Log
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Central administrative registry of all students, educators, and administrators with full personal and KYC details log.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ width: '250px', padding: '0.5rem 0.85rem', fontSize: '0.88rem' }}
          />
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading user directory & logs..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchUsers} />
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">No users found matching your search.</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>User / Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Qualification / Details</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, index) => (
                <tr key={u.id}>
                  <td><strong>{index + 1}</strong></td>
                  <td>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{u.username}</strong>
                      {u.fullName && (
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {u.fullName}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-hard' : u.role === 'EDUCATOR' ? 'badge-medium' : 'badge-easy'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.84rem', color: '#475569' }}>
                      {u.qualification || u.designation || 'Not updated yet'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {/* View / Edit User Details Log */}
                      <button
                        type="button"
                        onClick={() => handleOpenLog(u)}
                        style={{
                          background: '#f8fafc',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                        title="View and edit full personal and KYC log"
                      >
                        <span>📋</span> User Log
                      </button>

                      {u.role === 'EDUCATOR' && (
                        <button
                          type="button"
                          onClick={() => navigate(`/mentor/chat/${u.id}`)}
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Chat & Reports
                        </button>
                      )}

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(u.id, u.username)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* USER LOG MODAL (VISIBLE ONLY TO ADMIN) */}
      {logUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}>
                  {(logUser.fullName || logUser.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{logUser.fullName || logUser.username}</span>
                    <span className={`badge ${logUser.role === 'ADMIN' ? 'badge-hard' : logUser.role === 'EDUCATOR' ? 'badge-medium' : 'badge-easy'}`}>
                      {logUser.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Username: {logUser.username} · Confidential Administrative Log
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {!editingLog ? (
                  <button
                    type="button"
                    onClick={() => setEditingLog(true)}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Edit Log
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingLog(false)}
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setLogUser(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.4rem',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
              {logSuccess && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.65rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✓ {logSuccess}
                </div>
              )}
              {logError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.65rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  ⚠ {logError}
                </div>
              )}

              {/* Notice */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#475569' }}>
                🔒 <strong>Admin Confidential Access:</strong> This user log contains all personal, identity (Aadhaar & PAN), and role credentials. These details are visible only to the system administrator.
              </div>

              {editingLog ? (
                <form onSubmit={handleSaveLog}>
                  {/* EDIT MODE */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem' }}>
                      👤 Basic Details
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Full Name</label>
                        <input type="text" name="fullName" value={logForm.fullName} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Email</label>
                        <input type="email" name="email" value={logForm.email} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Phone Number</label>
                        <input type="text" name="phoneNumber" value={logForm.phoneNumber} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Date of Birth</label>
                        <input type="date" name="dob" value={logForm.dob} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Gender</label>
                        <select name="gender" value={logForm.gender} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box', background: '#fff' }}>
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Address</label>
                        <input type="text" name="address" value={logForm.address} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  </div>

                  {/* KYC Log */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem' }}>
                      🪪 Identity & KYC Log
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Aadhaar Number</label>
                        <input type="text" name="aadhaarNumber" value={logForm.aadhaarNumber} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>PAN Card Number</label>
                        <input type="text" name="panNumber" value={logForm.panNumber} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box', textTransform: 'uppercase' }} />
                      </div>
                    </div>
                  </div>

                  {/* Academic / Professional Log */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem' }}>
                      🎓 {logUser.role === 'STUDENT' ? 'Student & Academic Details' : 'Faculty & Professional Details'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Qualification</label>
                        <input type="text" name="qualification" value={logForm.qualification} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                      </div>
                      {logUser.role === 'STUDENT' ? (
                        <>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Institution / College</label>
                            <input type="text" name="institution" value={logForm.institution} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Roll Number</label>
                            <input type="text" name="rollNumber" value={logForm.rollNumber} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Passing Year</label>
                            <input type="text" name="passingYear" value={logForm.passingYear} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Specialization</label>
                            <input type="text" name="specialization" value={logForm.specialization} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Designation</label>
                            <input type="text" name="designation" value={logForm.designation} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Department</label>
                            <input type="text" name="department" value={logForm.department} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Experience (Years)</label>
                            <input type="text" name="experienceYears" value={logForm.experienceYears} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Employee ID</label>
                            <input type="text" name="employeeId" value={logForm.employeeId} onChange={handleLogFormChange} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setEditingLog(false)}
                      style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingLog}
                      style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.55rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, cursor: savingLog ? 'wait' : 'pointer' }}
                    >
                      {savingLog ? 'Saving...' : '💾 Save Log Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                /* READ-ONLY VIEW */
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', marginBottom: '0.65rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem' }}>
                      👤 Basic Details Log
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.86rem' }}>
                      <div><span style={{ color: '#64748b' }}>Full Name:</span> <strong style={{ color: '#0f172a' }}>{logUser.fullName || '—'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Email:</span> <strong style={{ color: '#0f172a' }}>{logUser.email}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Phone:</span> <strong style={{ color: '#0f172a' }}>{logUser.phoneNumber || '—'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Date of Birth:</span> <strong style={{ color: '#0f172a' }}>{logUser.dob || '—'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Gender:</span> <strong style={{ color: '#0f172a' }}>{logUser.gender || '—'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Address:</span> <strong style={{ color: '#0f172a' }}>{logUser.address || '—'}</strong></div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', marginBottom: '0.65rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem' }}>
                      🪪 Identity & KYC Log
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.86rem' }}>
                      <div><span style={{ color: '#64748b' }}>Aadhaar Number:</span> <strong style={{ color: '#0f172a' }}>{logUser.aadhaarNumber || '—'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>PAN Number:</span> <strong style={{ color: '#0f172a' }}>{logUser.panNumber || '—'}</strong></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', marginBottom: '0.65rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem' }}>
                      🎓 {logUser.role === 'STUDENT' ? 'Student & Academic Details' : 'Faculty & Qualification Details'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.86rem' }}>
                      <div><span style={{ color: '#64748b' }}>Qualification:</span> <strong style={{ color: '#0f172a' }}>{logUser.qualification || '—'}</strong></div>
                      {logUser.role === 'STUDENT' ? (
                        <>
                          <div><span style={{ color: '#64748b' }}>Institution:</span> <strong style={{ color: '#0f172a' }}>{logUser.institution || '—'}</strong></div>
                          <div><span style={{ color: '#64748b' }}>Roll Number:</span> <strong style={{ color: '#0f172a' }}>{logUser.rollNumber || '—'}</strong></div>
                          <div><span style={{ color: '#64748b' }}>Passing Year:</span> <strong style={{ color: '#0f172a' }}>{logUser.passingYear || '—'}</strong></div>
                          <div><span style={{ color: '#64748b' }}>Specialization:</span> <strong style={{ color: '#0f172a' }}>{logUser.specialization || '—'}</strong></div>
                        </>
                      ) : (
                        <>
                          <div><span style={{ color: '#64748b' }}>Designation:</span> <strong style={{ color: '#0f172a' }}>{logUser.designation || '—'}</strong></div>
                          <div><span style={{ color: '#64748b' }}>Department:</span> <strong style={{ color: '#0f172a' }}>{logUser.department || '—'}</strong></div>
                          <div><span style={{ color: '#64748b' }}>Experience:</span> <strong style={{ color: '#0f172a' }}>{logUser.experienceYears || '—'}</strong></div>
                          <div><span style={{ color: '#64748b' }}>Employee ID:</span> <strong style={{ color: '#0f172a' }}>{logUser.employeeId || '—'}</strong></div>
                        </>
                      )}
                    </div>
                    {logUser.bio && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.86rem' }}>
                        <span style={{ color: '#64748b' }}>Bio:</span>
                        <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', marginTop: '0.25rem', color: '#334155' }}>
                          {logUser.bio}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
