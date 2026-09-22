import api from './api';

export const integrityService = {
  getAllEvents: async () => {
    const response = await api.get('/integrity-events');
    return response.data;
  },

  getEventById: async (id) => {
    const response = await api.get(`/integrity-events/${id}`);
    return response.data;
  },

  addEvent: async (eventData) => {
    const response = await api.post('/integrity-events', eventData);
    return response.data;
  },

  getEventsByUser: async (userId) => {
    const response = await api.get(`/integrity-events/user/${userId}`);
    return response.data;
  },

  getEventsByAttempt: async (attemptId) => {
    const response = await api.get(`/integrity-events/attempt/${attemptId}`);
    return response.data;
  },

  getEventsByType: async (eventType) => {
    const response = await api.get(`/integrity-events/type?eventType=${encodeURIComponent(eventType)}`);
    return response.data;
  },
};

export default integrityService;
