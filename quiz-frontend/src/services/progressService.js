import api from './api';

export const progressService = {
  getCourseProgress: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/progress`);
    return response.data;
  },

  markContentComplete: async (contentId) => {
    const response = await api.post(`/content/${contentId}/complete`);
    return response.data;
  },

  toggleContentComplete: async (contentId) => {
    const response = await api.post(`/content/${contentId}/toggle`);
    return response.data;
  },

  getStudentProgress: async (courseId, studentId) => {
    const response = await api.get(`/courses/${courseId}/progress/${studentId}`);
    return response.data;
  },
};

export default progressService;
