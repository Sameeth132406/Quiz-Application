import api from './api';

export const contentService = {
  createContent: async (moduleId, contentData) => {
    const response = await api.post(`/modules/${moduleId}/content`, contentData);
    return response.data;
  },

  uploadContent: async (courseId, moduleId, formData, onUploadProgress) => {
    const response = await api.post(`/courses/${courseId}/modules/${moduleId}/content`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return response.data;
  },

  getContentsByModule: async (moduleId) => {
    const response = await api.get(`/modules/${moduleId}/content`);
    return response.data;
  },

  getContent: async (contentId) => {
    const response = await api.get(`/content/${contentId}`);
    return response.data;
  },

  updateContent: async (contentId, contentData) => {
    const response = await api.put(`/content/${contentId}`, contentData);
    return response.data;
  },

  deleteContent: async (contentId) => {
    const response = await api.delete(`/content/${contentId}`);
    return response.data;
  },

  uploadFileToContent: async (contentId, file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/content/${contentId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return response.data;
  },
};

export default contentService;
