package com.examly.springapp.service;

import com.examly.springapp.model.Course;
import com.examly.springapp.repository.CourseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public Course getCourseById(Long id) {
        return courseRepository.findById(id).orElse(null);
    }

    @Override
    public Course addCourse(Course course) {

        if (courseRepository.existsByCourseCode(course.getCourseCode())) {
            throw new RuntimeException("Course already exists");
        }

        return courseRepository.save(course);
    }

    @Override
    public Course updateCourse(Long id, Course course) {

        Course existing = courseRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setCourseCode(course.getCourseCode());
        existing.setCourseName(course.getCourseName());
        existing.setDescription(course.getDescription());
        existing.setInstructor(course.getInstructor());

        return courseRepository.save(existing);
    }

    @Override
    public boolean deleteCourse(Long id) {

        if (!courseRepository.existsById(id)) {
            return false;
        }

        courseRepository.deleteById(id);
        return true;
    }

    @Override
    public List<Course> searchCourse(String keyword) {
        return courseRepository.findByCourseNameContainingIgnoreCase(keyword);
    }

    @Override
    public List<Course> getByInstructor(String instructor) {
        return courseRepository.findByInstructorContainingIgnoreCase(instructor);
    }
}