import api from './api';

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  addUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateMyProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  uploadProfilePhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;

