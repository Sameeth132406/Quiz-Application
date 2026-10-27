import api from './api';

export const courseService = {
  getAllCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  getPublishedCourses: async () => {
    const response = await api.get('/courses/published');
    return response.data;
  },

  getEducatorCourses: async (educatorId) => {
    const response = await api.get(`/courses/educator/${educatorId}`);
    return response.data;
  },

  getMyCreatedCourses: async () => {
    const response = await api.get('/courses/my-created');
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  // Alias for backward compatibility
  addCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  updateCourseStatus: async (id, status) => {
    const response = await api.patch(`/courses/${id}/status`, { status });
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  searchCourses: async (keyword) => {
    const response = await api.get(`/courses/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },

  getByInstructor: async (instructor) => {
    const response = await api.get(`/courses/instructor?instructor=${encodeURIComponent(instructor)}`);
    return response.data;
  },
};

export default courseService;
