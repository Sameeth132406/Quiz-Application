import api from './api';

export const leaderboardService = {
  getLeaderboards: async () => {
    const response = await api.get('/leaderboards');
    return response.data;
  },

  getAllLeaderboards: async () => {
    const response = await api.get('/leaderboards');
    return response.data;
  },

  getLeaderboardById: async (id) => {
    const response = await api.get(`/leaderboards/${id}`);
    return response.data;
  },

  createLeaderboard: async (data) => {
    const response = await api.post('/leaderboards', data);
    return response.data;
  },

  updateLeaderboard: async (id, data) => {
    const response = await api.put(`/leaderboards/${id}`, data);
    return response.data;
  },

  deleteLeaderboard: async (id) => {
    const response = await api.delete(`/leaderboards/${id}`);
    return response.data;
  },

  getLeaderboardEntries: async (id, page = 0, size = 50) => {
    const response = await api.get(`/leaderboards/${id}/entries?page=${page}&size=${size}`);
    return response.data;
  },

  getLeaderboardsByCourse: async (courseId) => {
    const response = await api.get(`/leaderboards/course/${courseId}`);
    return response.data;
  },

  getCourseLeaderboards: async (courseId) => {
    const response = await api.get(`/leaderboards/course/${courseId}`);
    return response.data;
  },

  getMyRank: async (id) => {
    const response = await api.get(`/leaderboards/${id}/my-rank`);
    return response.data;
  },

  refreshLeaderboard: async (id) => {
    const response = await api.post(`/leaderboards/${id}/refresh`);
    return response.data;
  }
};

export default leaderboardService;
