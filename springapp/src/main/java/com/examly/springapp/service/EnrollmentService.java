package com.examly.springapp.service;

import com.examly.springapp.model.Enrollment;
import java.util.List;

public interface EnrollmentService {

    List<Enrollment> getAllEnrollments();

    Enrollment getEnrollmentById(Long id);

    Enrollment enrollStudent(Enrollment enrollment);

    boolean deleteEnrollment(Long id);

    List<Enrollment> getByUser(Long userId);

    List<Enrollment> getByCourse(Long courseId);

    List<Enrollment> getByStatus(String status);
}