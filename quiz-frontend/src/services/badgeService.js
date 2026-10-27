import api from './api';

export const badgeService = {
  getBadges: async () => {
    const response = await api.get('/badges');
    return response.data;
  },

  getAllBadges: async () => {
    const response = await api.get('/badges');
    return response.data;
  },

  getBadgeById: async (id) => {
    const response = await api.get(`/badges/${id}`);
    return response.data;
  },

  createBadge: async (data) => {
    const response = await api.post('/badges', data);
    return response.data;
  },

  updateBadge: async (id, data) => {
    const response = await api.put(`/badges/${id}`, data);
    return response.data;
  },

  deleteBadge: async (id) => {
    const response = await api.delete(`/badges/${id}`);
    return response.data;
  },

  getStudentBadges: async (studentId) => {
    const response = await api.get(`/badges/student/${studentId}`);
    return response.data;
  },

  getMyBadges: async () => {
    const response = await api.get('/badges/my');
    return response.data;
  },

  evaluateBadges: async (studentId) => {
    const response = await api.post(`/badges/evaluate/${studentId}`);
    return response.data;
  }
};

export default badgeService;
