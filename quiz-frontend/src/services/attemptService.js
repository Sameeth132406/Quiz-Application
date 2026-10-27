import api from './api';

export const attemptService = {
  getAllAttempts: async () => {
    const response = await api.get('/attempts');
    return response.data;
  },

  getAttemptById: async (id) => {
    const response = await api.get(`/attempts/${id}`);
    return response.data;
  },

  submitQuiz: async (quizId, attemptData) => {
    try {
      const response = await api.post(`/attempts/submit/${quizId}`, attemptData);
      return response.data;
    } catch (err) {
      const fallbackResponse = await api.post('/attempts', {
        quizId: quizId,
        ...attemptData
      });
      return fallbackResponse.data;
    }
  },

  startQuiz: async (attemptData) => {
    const response = await api.post('/attempts', attemptData);
    return response.data;
  },

  getAttemptsByUser: async (userId) => {
    try {
      const response = await api.get(`/attempts/user/${userId}`);
      return response.data;
    } catch (err) {
      const all = await api.get('/attempts');
      return Array.isArray(all.data) ? all.data.filter(a => a.userId === userId) : [];
    }
  },

  // Get student's eligibility (deadline check, attempt limits, best score)
  getQuizEligibility: async (quizId) => {
    const response = await api.get(`/attempts/quiz/${quizId}/eligibility`);
    return response.data;
  },

  // Get students list with attempts and scores for a quiz (Educator/Admin)
  getQuizStudents: async (quizId) => {
    const response = await api.get(`/attempts/quiz/${quizId}/students`);
    return response.data;
  },

  // Grant extra attempt(s) to a student (Educator/Admin)
  grantAttempt: async (quizId, userId, allowedAttempts, reason) => {
    const response = await api.post(`/attempts/quiz/${quizId}/grant-attempt`, {
      userId,
      allowedAttempts,
      reason
    });
    return response.data;
  }
};

export default attemptService;
