import api from './api';

const mentorService = {
  // Get all educators
  getEducators: async () => {
    const res = await api.get('/mentor/educators');
    return res.data;
  },

  // Student: assign mentor for a course
  assignMentor: async (educatorId, courseId) => {
    const res = await api.post('/mentor/assign', { educatorId, courseId });
    return res.data;
  },

  // Student: get their mentor for a course
  getMyMentor: async (courseId) => {
    const res = await api.get(`/mentor/my-mentor?courseId=${courseId}`);
    return res.data;
  },

  // Student: unassign mentor
  unassignMentor: async (courseId) => {
    const res = await api.delete(`/mentor/unassign?courseId=${courseId}`);
    return res.data;
  },

  // Educator: get all assigned students
  getMyStudents: async () => {
    const res = await api.get('/mentor/my-students');
    return res.data;
  },

  // Admin/Educator: get assigned students for a specific educator
  getStudentsByEducator: async (educatorId) => {
    const res = await api.get(`/mentor/educators/${educatorId}/students`);
    return res.data;
  },

  // Chat: get conversation with a user
  getConversation: async (withUserId, courseId) => {
    const params = courseId
      ? `withUserId=${withUserId}&courseId=${courseId}`
      : `withUserId=${withUserId}`;
    const res = await api.get(`/mentor/chat?${params}`);
    return res.data;
  },

  // Get all administrators
  getAdmins: async () => {
    const res = await api.get('/mentor/admins');
    return res.data;
  },

  // Upload media/report file for chat
  uploadChatFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/mentor/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Chat: send a message (supports media/report attachments)
  sendMessage: async (recipientId, content, courseId, fileMeta = {}) => {
    const res = await api.post('/mentor/chat/send', {
      recipientId,
      content,
      courseId,
      fileUrl: fileMeta.fileUrl,
      fileName: fileMeta.fileName,
      fileType: fileMeta.fileType,
      fileSize: fileMeta.fileSize,
    });
    return res.data;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const res = await api.get('/mentor/chat/unread-count');
    return res.data.unread || 0;
  },
};

export default mentorService;
