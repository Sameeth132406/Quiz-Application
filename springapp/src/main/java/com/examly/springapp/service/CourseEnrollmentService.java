package com.examly.springapp.service;

import com.examly.springapp.dto.CourseEnrollmentDTO;
import com.examly.springapp.model.CourseEnrollment;

import java.util.List;

public interface CourseEnrollmentService {

    CourseEnrollment enrollStudent(Long courseId, Long studentId);

    List<CourseEnrollmentDTO> getEnrolledCourses(Long studentId);

    List<CourseEnrollmentDTO> getStudentsByCourse(Long courseId, Long currentUserId, boolean isAdmin);

    boolean unenrollStudent(Long courseId, Long studentId);

    boolean isStudentEnrolled(Long courseId, Long studentId);

    CourseEnrollmentDTO getEnrollment(Long courseId, Long studentId);
}
