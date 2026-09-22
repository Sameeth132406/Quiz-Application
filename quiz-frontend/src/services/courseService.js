import api from './api';

export const courseService = {
  getAllCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  addCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
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
