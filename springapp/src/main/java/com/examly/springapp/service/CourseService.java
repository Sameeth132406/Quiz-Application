package com.examly.springapp.service;

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
}