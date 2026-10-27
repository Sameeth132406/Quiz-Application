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
  },

  getEducatorAnalytics: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.courseId) query.append('courseId', params.courseId);
    if (params.quizId) query.append('quizId', params.quizId);
    if (params.studentId) query.append('studentId', params.studentId);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get(`/analytics/educator${queryString}`);
    return response.data;
  },

  getStudentAnalytics: async (studentId) => {
    const response = await api.get(`/analytics/student/${studentId}`);
    return response.data;
  },

  getMyAnalytics: async () => {
    const response = await api.get('/analytics/my');
    return response.data;
  },

  getCourseAnalytics: async (courseId) => {
    const response = await api.get(`/analytics/course/${courseId}`);
    return response.data;
  },

  getStudentCourseAnalytics: async (studentId, courseId) => {
    const response = await api.get(`/analytics/student/${studentId}/course/${courseId}`);
    return response.data;
  },

  getMyCourseAnalytics: async (courseId) => {
    const response = await api.get(`/analytics/course/${courseId}/my`);
    return response.data;
  },

  getQuizAnalytics: async (quizId) => {
    const response = await api.get(`/analytics/quiz/${quizId}`);
    return response.data;
  }
};

export default analyticsService;
