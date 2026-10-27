import api from './api';

export const moduleService = {
  createModule: async (courseId, moduleData) => {
    const response = await api.post(`/courses/${courseId}/modules`, moduleData);
    return response.data;
  },

  getModules: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/modules`);
    return response.data;
  },

  getModuleById: async (moduleId) => {
    const response = await api.get(`/modules/${moduleId}`);
    return response.data;
  },

  updateModule: async (moduleId, moduleData) => {
    const response = await api.put(`/modules/${moduleId}`, moduleData);
    return response.data;
  },

  deleteModule: async (moduleId) => {
    const response = await api.delete(`/modules/${moduleId}`);
    return response.data;
  },

  attachQuiz: async (moduleId, quizId) => {
    const response = await api.post(`/modules/${moduleId}/quiz/${quizId}`);
    return response.data;
  },

  removeQuiz: async (moduleId) => {
    const response = await api.delete(`/modules/${moduleId}/quiz`);
    return response.data;
  },

  reorderModules: async (courseId, moduleIds) => {
    const response = await api.put(`/courses/${courseId}/modules/reorder`, moduleIds);
    return response.data;
  },
};

export default moduleService;
