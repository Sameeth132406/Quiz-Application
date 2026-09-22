import api from './api';

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  addUser: async (userData) => {
    const response = await api.post('/api/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
};
