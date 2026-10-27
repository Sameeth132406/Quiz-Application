package com.examly.springapp.service;

import com.examly.springapp.dto.CourseDTO;
import com.examly.springapp.enums.CourseStatus;
import com.examly.springapp.model.Course;

import java.util.List;

public interface CourseService {

    List<Course> getAllCourses();

    Course getCourseById(Long id);

    Course addCourse(Course course);

    Course updateCourse(Long id, Course course);

    boolean deleteCourse(Long id);

    List<Course> searchCourse(String keyword);

    List<Course> getByInstructor(String instructor);

    // Enhanced Course Management Methods
    List<CourseDTO> getAllCoursesDTO();

    List<CourseDTO> getAllCoursesDTO(Long currentUserId);

    List<CourseDTO> getPublishedCourses();

    List<CourseDTO> getPublishedCourses(Long currentUserId);

    List<CourseDTO> getCoursesByEducator(Long educatorId);

    CourseDTO getCourseDetails(Long id, Long currentUserId);

    Course createCourse(Course course, Long currentUserId, String currentUsername);

    Course updateCourseDetails(Long id, Course course, Long currentUserId, boolean isAdmin);

    boolean deleteCourse(Long id, Long currentUserId, boolean isAdmin);

    Course updateCourseStatus(Long id, CourseStatus status, Long currentUserId, boolean isAdmin);

    CourseDTO convertToDTO(Course course, Long currentUserId);
}