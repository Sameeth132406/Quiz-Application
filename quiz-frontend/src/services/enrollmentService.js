import api from './api';

export const enrollmentService = {
  enrollCourse: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  },

  getEnrolledCourses: async () => {
    const response = await api.get('/courses/enrolled');
    return response.data;
  },

  getCourseStudents: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/students`);
    return response.data;
  },

  unenrollCourse: async (courseId) => {
    const response = await api.delete(`/courses/${courseId}/unenroll`);
    return response.data;
  },

  checkEnrollmentStatus: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/enrollment-status`);
    return response.data;
  },
};

export default enrollmentService;
