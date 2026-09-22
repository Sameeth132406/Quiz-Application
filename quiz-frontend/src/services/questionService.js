import api from './api';

export const questionService = {
  // Full questions for ADMIN / EDUCATOR (includes correctAnswer)
  getQuestionsByQuiz: async (quizId) => {
    const response = await api.get(`/questions/quiz/${quizId}`);
    return response.data;
  },

  // Student-safe questions DTO (excludes correctAnswer)
  getStudentQuestions: async (quizId, randomize = true) => {
    const response = await api.get(`/questions/quiz/${quizId}/student?randomize=${randomize}`);
    return response.data;
  },

  getQuestionById: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  createQuestion: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },

  updateQuestion: async (id, questionData) => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
  },

  deleteQuestion: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  }
};

export default questionService;
