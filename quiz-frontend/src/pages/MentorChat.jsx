import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import mentorService from '../services/mentorService';
import Loading from '../components/Loading';

const POLL_INTERVAL = 4000; // poll every 4 seconds

const EMOJI_CATEGORIES = [
  {
    name: 'Reactions',
    emojis: ['😊', '👍', '👏', '🙌', '❤️', '🔥', '🎉', '💯', '🤝', '🙏', '🚀', '⭐', '😂', '😎', '🤔']
  },
  {
    name: 'Reports & Work',
    emojis: ['📊', '📈', '📉', '📋', '📄', '📝', '📁', '📂', '📚', '🎓', '💻', '📅', '⏱️', '🧠', '🔍']
  },
  {
    name: 'Status & Alerts',
    emojis: ['✅', '❌', '⚠️', '🚨', '💡', '🎯', '📌', '🔔', '🏆', '🥇', '💬', '📢', '✨', '🏷️', '🛡️']
  }
];

const MentorChat = () => {
  const { withUserId: rawWithUserId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useContext(AuthContext);

  const [activeRecipientId, setActiveRecipientId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [error, setError] = useState('');

  // Media attachment state
  const [stagedFile, setStagedFile] = useState(null); // { fileUrl, fileName, fileType, fileSize }
  const [uploadingFile, setUploadingFile] = useState(false);

  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiTab, setSelectedEmojiTab] = useState(0);

  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(async () => {
    if (!activeRecipientId) return;
    try {
      const msgs = await mentorService.getConversation(activeRecipientId, courseId);
      setMessages(msgs || []);
    } catch (e) {
      console.error('Failed to load messages', e);
    }
  }, [activeRecipientId, courseId]);

  // Close emoji picker when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  // Initial user & conversation resolution
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      try {
        let targetId = rawWithUserId;

        // If target is explicitly 'admin' or missing and user is educator
        if (!targetId || targetId === 'admin') {
          const admins = await mentorService.getAdmins();
          if (admins && admins.length > 0) {
            targetId = String(admins[0].id);
            setOtherUser({
              id: admins[0].id,
              username: admins[0].username,
              email: admins[0].email,
              role: 'ADMIN'
            });
          } else {
            setError('No system administrator account found.');
            setLoading(false);
            return;
          }
        } else {
          // Resolve numeric ID according to roles
          const targetNum = Number(targetId);

          if (role === 'STUDENT') {
            const educators = await mentorService.getEducators();
            const edu = (educators || []).find(e => Number(e.id) === targetNum);
            setOtherUser(edu ? { ...edu, role: 'EDUCATOR' } : { id: targetNum, username: 'Educator', role: 'EDUCATOR' });
          } else if (role === 'ADMIN') {
            // Admin chatting with an Educator
            const educators = await mentorService.getEducators();
            const edu = (educators || []).find(e => Number(e.id) === targetNum);
            setOtherUser(edu ? { ...edu, role: 'EDUCATOR' } : { id: targetNum, username: 'Educator', role: 'EDUCATOR' });
          } else {
            // Role is EDUCATOR
            // 1. Check if target is an Admin
            const admins = await mentorService.getAdmins();
            const adminMatch = (admins || []).find(a => Number(a.id) === targetNum);
            if (adminMatch) {
              setOtherUser({ ...adminMatch, role: 'ADMIN' });
            } else {
              // 2. Check if target is an assigned Student
              const students = await mentorService.getMyStudents();
              const stu = (students || []).find(s => Number(s.studentId) === targetNum);
              if (stu) {
                setOtherUser({ id: stu.studentId, username: stu.studentName, email: stu.studentEmail, role: 'STUDENT' });
                setCourseId(stu.courseId);
              } else {
                setOtherUser({ id: targetNum, username: 'User', role: 'USER' });
              }
            }
          }
        }

        setActiveRecipientId(targetId);
        const msgs = await mentorService.getConversation(targetId, courseId);
        setMessages(msgs || []);
        scrollToBottom();
      } catch (e) {
        setError('Failed to load conversation details.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [rawWithUserId, role, courseId]);

  // Polling for live updates
  useEffect(() => {
    if (!activeRecipientId) return;
    pollRef.current = setInterval(loadMessages, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [loadMessages, activeRecipientId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle File Selection and Upload
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 100MB client guard
    if (file.size > 100 * 1024 * 1024) {
      alert('Selected file is too large. Maximum file size is 100MB.');
      return;
    }

    setUploadingFile(true);
    try {
      const uploadResp = await mentorService.uploadChatFile(file);
      setStagedFile(uploadResp);
    } catch (err) {
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeStagedFile = () => {
    setStagedFile(null);
  };

  // Handle Emoji Selection
  const handleInsertEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
    inputRef.current?.focus();
  };

  // Send Message
  const handleSend = async () => {
    const content = inputText.trim();
    if ((!content && !stagedFile) || sending || uploadingFile || !activeRecipientId) return;

    setSending(true);
    try {
      const msg = await mentorService.sendMessage(
        Number(activeRecipientId),
        content,
        courseId,
        stagedFile || {}
      );
      setMessages(prev => [...prev, msg]);
      setInputText('');
      setStagedFile(null);
      setShowEmojiPicker(false);
      scrollToBottom();
    } catch (e) {
      console.error('Failed to send message', e);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImageFile = (fileType, fileName) => {
    if (fileType && fileType.startsWith('image/')) return true;
    if (fileName && /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName)) return true;
    return false;
  };

  const isPdfOrDoc = (fileType, fileName) => {
    if (fileType && (fileType.includes('pdf') || fileType.includes('word') || fileType.includes('sheet'))) return true;
    if (fileName && /\.(pdf|docx?|xlsx?|pptx?|txt)$/i.test(fileName)) return true;
    return false;
  };

  // Group messages by date
  const groupedMessages = [];
  let lastDate = null;
  messages.forEach(msg => {
    const dateKey = new Date(msg.sentAt).toDateString();
    if (dateKey !== lastDate) {
      groupedMessages.push({ type: 'date', label: formatDate(msg.sentAt), key: dateKey });
      lastDate = dateKey;
    }
    groupedMessages.push({ type: 'message', data: msg });
  });

  if (loading) return <Loading />;

  const myId = user?.id || user?.userId;
  const isChattingWithAdmin = otherUser?.role === 'ADMIN';

  return (
    <div style={{
      height: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8fafc',
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: 'relative'
    }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
      />

      {/* Chat Header */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              color: '#334155',
              fontSize: '1rem',
              fontWeight: '700',
              padding: '0.35rem 0.65rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '8px',
              transition: 'background 0.15s ease'
            }}
            title="Go back"
          >
            ← Back
          </button>

          {/* Avatar */}
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: isChattingWithAdmin
              ? 'linear-gradient(135deg, #059669, #047857)'
              : role === 'EDUCATOR'
                ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '1.05rem',
            flexShrink: 0,
          }}>
            {(otherUser?.username || 'U')[0].toUpperCase()}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.02rem' }}>
                {otherUser?.username || 'Chat'}
              </span>
              <span style={{
                background: isChattingWithAdmin ? '#ecfdf5' : '#eff6ff',
                color: isChattingWithAdmin ? '#047857' : '#1d4ed8',
                border: isChattingWithAdmin ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {otherUser?.role || (role === 'EDUCATOR' ? 'Student' : 'Mentor')}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.1rem' }}>
              {otherUser?.email ? otherUser.email + ' · ' : ''}
              {isChattingWithAdmin ? 'Official Admin Reporting & Support Channel' : courseId ? 'Course Mentorship' : 'Direct Message'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadMessages}
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.4rem 0.75rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
          title="Refresh conversation"
        >
          <span>🔄</span> Refresh
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
      }}>
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        {groupedMessages.length === 0 && !loading && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            gap: '0.75rem',
            padding: '2rem',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
            }}>
              {isChattingWithAdmin ? '📊' : '💬'}
            </div>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1e293b' }}>
              {isChattingWithAdmin ? 'Welcome to the Admin Reporting Channel' : 'Start the conversation'}
            </div>
            <div style={{ fontSize: '0.88rem', textAlign: 'center', maxWidth: '420px', lineHeight: '1.5', color: '#64748b' }}>
              {isChattingWithAdmin
                ? 'Send performance updates, submit monthly/weekly reports, attach spreadsheets or documents, and coordinate with the Administrator.'
                : `Send a message to ${otherUser?.username || 'your mentor'} to get started.`}
            </div>
          </div>
        )}

        {groupedMessages.map((item, idx) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${item.key}`} style={{
                textAlign: 'center',
                margin: '0.75rem 0',
                fontSize: '0.75rem',
                color: '#94a3b8',
                fontWeight: '600',
              }}>
                <span style={{
                  background: '#f8fafc',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  border: '1px solid #e2e8f0',
                }}>
                  {item.label}
                </span>
              </div>
            );
          }

          const msg = item.data;
          const isMe = String(msg.senderId) === String(myId);
          const hasFile = Boolean(msg.fileUrl);
          const isImage = hasFile && isImageFile(msg.fileType, msg.fileName);

          return (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: isMe ? 'flex-end' : 'flex-start',
              marginBottom: '0.45rem',
            }}>
              <div style={{
                maxWidth: '72%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  background: isMe
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    : '#ffffff',
                  color: isMe ? '#ffffff' : '#0f172a',
                  padding: '0.75rem 1rem',
                  borderRadius: isMe
                    ? '18px 18px 4px 18px'
                    : '18px 18px 18px 4px',
                  fontSize: '0.92rem',
                  lineHeight: '1.5',
                  boxShadow: isMe
                    ? '0 2px 8px rgba(37,99,235,0.2)'
                    : '0 1px 4px rgba(0,0,0,0.06)',
                  border: isMe ? 'none' : '1px solid #e2e8f0',
                  wordBreak: 'break-word',
                }}>
                  {/* File Attachment Rendering */}
                  {hasFile && (
                    <div style={{ marginBottom: msg.content ? '0.65rem' : '0' }}>
                      {isImage ? (
                        <div style={{ borderRadius: '8px', overflow: 'hidden', maxWidth: '300px' }}>
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={msg.fileUrl}
                              alt={msg.fileName || 'Attachment'}
                              style={{
                                width: '100%',
                                maxHeight: '220px',
                                objectFit: 'cover',
                                display: 'block',
                                borderRadius: '8px'
                              }}
                            />
                          </a>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '0.35rem',
                            fontSize: '0.75rem',
                            color: isMe ? '#e0e7ff' : '#64748b'
                          }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                              {msg.fileName}
                            </span>
                            <span>{formatFileSize(msg.fileSize)}</span>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          background: isMe ? 'rgba(255,255,255,0.15)' : '#f1f5f9',
                          border: isMe ? '1px solid rgba(255,255,255,0.3)' : '1px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '0.65rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          maxWidth: '340px'
                        }}>
                          <span style={{ fontSize: '1.6rem' }}>
                            {isPdfOrDoc(msg.fileType, msg.fileName) ? '📄' : '📎'}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontWeight: '700',
                              fontSize: '0.85rem',
                              color: isMe ? '#ffffff' : '#0f172a',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {msg.fileName || 'Report File'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: isMe ? '#e0e7ff' : '#64748b' }}>
                              {formatFileSize(msg.fileSize)}
                            </div>
                          </div>
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={msg.fileName}
                            style={{
                              background: isMe ? '#ffffff' : '#2563eb',
                              color: isMe ? '#2563eb' : '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                              display: 'inline-block'
                            }}
                          >
                            Download
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text Content */}
                  {msg.content && (
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </div>
                  )}
                </div>

                <div style={{
                  fontSize: '0.7rem',
                  color: '#94a3b8',
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}>
                  {formatTime(msg.sentAt)}
                  {isMe && (
                    <span style={{ color: msg.read ? '#2563eb' : '#94a3b8', fontWeight: '700' }}>
                      {msg.read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Templates Bar */}
      <div style={{
        background: '#f1f5f9',
        borderTop: '1px solid #e2e8f0',
        padding: '0.5rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
        flexShrink: 0
      }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Quick Templates:
        </span>

        {role === 'EDUCATOR' && isChattingWithAdmin && (
          <>
            <button
              type="button"
              onClick={() => {
                setInputText('📊 WEEKLY PROGRESS REPORT\nPeriod: Current Week\nTotal Enrolled Students: \nAverage Course Progress: \nCompleted Quizzes: \nKey Highlights: All student milestones on track.');
                inputRef.current?.focus();
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#1d4ed8',
                cursor: 'pointer'
              }}
            >
              📊 Weekly Progress Report
            </button>
            <button
              type="button"
              onClick={() => {
                setInputText('⚠️ STUDENT ATTENTION ALERT\nStudent: \nCourse: \nObservation: Student requires follow-up on assessment scores.\nRecommended Action: ');
                inputRef.current?.focus();
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#b91c1c',
                cursor: 'pointer'
              }}
            >
              ⚠️ Student Attention Alert
            </button>
            <button
              type="button"
              onClick={() => {
                setInputText('📝 CURRICULUM UPDATE & FEEDBACK\nCourse: \nCompleted Topics: \nFeedback: Student engagement is strong this term.');
                inputRef.current?.focus();
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              📝 Curriculum Update
            </button>
          </>
        )}

        {role === 'ADMIN' && (
          <>
            <button
              type="button"
              onClick={() => {
                setInputText('📋 REQUEST FOR EDUCATOR REPORT: Please provide the latest student completion metrics and performance report for your active courses.');
                inputRef.current?.focus();
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#1d4ed8',
                cursor: 'pointer'
              }}
            >
              📋 Request Student Report
            </button>
            <button
              type="button"
              onClick={() => {
                setInputText('📢 GUIDELINES & DEADLINES: New assessment evaluation guidelines are in effect. Please review and ensure submissions are validated before the deadline.');
                inputRef.current?.focus();
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #fed7aa',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#c2410c',
                cursor: 'pointer'
              }}
            >
              📢 Pass Guidelines & Deadlines
            </button>
          </>
        )}

        {role === 'STUDENT' && (
          <button
            type="button"
            onClick={() => {
              setInputText('Course & Quiz Completion Response: I have completed all the course modules and submitted the assessment quiz. Please review my submission and progress.');
              inputRef.current?.focus();
            }}
            style={{
              background: '#ffffff',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              padding: '0.3rem 0.65rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#15803d',
              cursor: 'pointer'
            }}
          >
            ✅ Submit Course & Quiz Completion Response
          </button>
        )}
      </div>

      {/* Staged File Preview Pill */}
      {stagedFile && (
        <div style={{
          background: '#eff6ff',
          borderTop: '1px solid #bfdbfe',
          padding: '0.6rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.25rem' }}>
              {isImageFile(stagedFile.fileType, stagedFile.fileName) ? '🖼️' : '📄'}
            </span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1e40af' }}>
                {stagedFile.fileName}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Ready to send · {formatFileSize(stagedFile.fileSize)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={removeStagedFile}
            style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              borderRadius: '6px',
              padding: '0.25rem 0.55rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            ✕ Remove
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          style={{
            position: 'absolute',
            bottom: '75px',
            left: '1.5rem',
            width: '320px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
            zIndex: 50,
            overflow: 'hidden'
          }}
        >
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            {EMOJI_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedEmojiTab(idx)}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: selectedEmojiTab === idx ? '700' : '500',
                  color: selectedEmojiTab === idx ? '#2563eb' : '#64748b',
                  background: selectedEmojiTab === idx ? '#ffffff' : 'transparent',
                  border: 'none',
                  borderBottom: selectedEmojiTab === idx ? '2px solid #2563eb' : 'none',
                  cursor: 'pointer'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Emojis Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.35rem',
            padding: '0.75rem',
            maxHeight: '180px',
            overflowY: 'auto'
          }}>
            {EMOJI_CATEGORIES[selectedEmojiTab].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleInsertEmoji(emoji)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.4rem',
                  padding: '0.35rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Bar */}
      <div style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        gap: '0.65rem',
        alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingFile || sending}
          style={{
            background: stagedFile ? '#dbeafe' : '#f1f5f9',
            border: stagedFile ? '1px solid #93c5fd' : '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '0.65rem 0.85rem',
            fontSize: '1.15rem',
            cursor: uploadingFile ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#334155',
            flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
          title="Attach media or report file (PDF, Image, Doc, Sheet)"
        >
          {uploadingFile ? '⏳' : '📎'}
        </button>

        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(prev => !prev)}
          disabled={sending}
          style={{
            background: showEmojiPicker ? '#fef3c7' : '#f1f5f9',
            border: showEmojiPicker ? '1px solid #fde047' : '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '0.65rem 0.85rem',
            fontSize: '1.15rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#334155',
            flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
          title="Select emojis"
        >
          😊
        </button>

        {/* Textarea */}
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
          onKeyDown={handleKeyDown}
          placeholder={isChattingWithAdmin
            ? 'Type a report, update, or question for the Admin... (Enter to send)'
            : 'Type a message... (Enter to send)'}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.7rem 1rem',
            fontSize: '0.92rem',
            fontFamily: 'inherit',
            outline: 'none',
            background: '#f8fafc',
            color: '#0f172a',
            lineHeight: '1.5',
            maxHeight: '120px',
            overflowY: 'auto',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#2563eb'; }}
          onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={(!inputText.trim() && !stagedFile) || sending || uploadingFile}
          style={{
            background: (inputText.trim() || stagedFile) && !sending && !uploadingFile
              ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
              : '#e2e8f0',
            color: (inputText.trim() || stagedFile) && !sending && !uploadingFile ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: '10px',
            padding: '0.7rem 1.35rem',
            fontSize: '0.92rem',
            fontWeight: '700',
            cursor: (inputText.trim() || stagedFile) && !sending && !uploadingFile ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
            flexShrink: 0,
            minWidth: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem'
          }}
        >
          {sending ? 'Sending...' : 'Send 🚀'}
        </button>
      </div>
    </div>
  );
};

export default MentorChat;
