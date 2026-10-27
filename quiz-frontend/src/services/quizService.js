import api from './api';

export const quizService = {
  getQuizzes: async () => {
    const response = await api.get('/quizzes');
    return response.data;
  },

  getAllQuizzes: async () => {
    const response = await api.get('/quizzes');
    return response.data;
  },

  getQuizById: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  createQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },

  addQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },

  updateQuiz: async (id, quizData) => {
    const response = await api.put(`/quizzes/${id}`, quizData);
    return response.data;
  },

  deleteQuiz: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },

  searchByTitle: async (keyword) => {
    const response = await api.get(`/quizzes/search/title?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },

  getByCategory: async (category) => {
    const response = await api.get(`/quizzes/category?category=${encodeURIComponent(category)}`);
    return response.data;
  },

  getByDifficulty: async (difficulty) => {
    const response = await api.get(`/quizzes/difficulty?difficulty=${difficulty}`);
    return response.data;
  },

  publishResults: async (id, published = true) => {
    try {
      const response = await api.put(`/quizzes/${id}/publish-results?published=${published}`);
      return response.data;
    } catch (err) {
      // Fallback to updateQuiz with resultsPublished
      const current = await api.get(`/quizzes/${id}`);
      const updated = { ...current.data, resultsPublished: published };
      const response = await api.put(`/quizzes/${id}`, updated);
      return response.data;
    }
  }
};

export default quizService;
