import api from './api';

export const gradebookService = {
  getAllGrades: async () => {
    const response = await api.get('/gradebook');
    return response.data;
  },

  getGradesByUser: async (userId) => {
    const response = await api.get(`/gradebook/user/${userId}`);
    return response.data;
  },

  getGradesByQuiz: async (quizId) => {
    const response = await api.get(`/gradebook/quiz/${quizId}`);
    return response.data;
  }
};

export default gradebookService;
