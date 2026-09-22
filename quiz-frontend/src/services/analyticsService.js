import api from './api';

export const analyticsService = {
  getAllAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },

  getAnalyticsByQuiz: async (quizId) => {
    const response = await api.get(`/analytics/quiz/${quizId}`);
    return response.data;
  },

  getAnalyticsByUser: async (userId) => {
    const response = await api.get(`/analytics/user/${userId}`);
    return response.data;
  }
};

export default analyticsService;
