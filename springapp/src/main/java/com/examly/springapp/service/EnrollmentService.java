package com.examly.springapp.service;

import com.examly.springapp.model.Enrollment;
import com.examly.springapp.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    public Enrollment getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id).orElse(null);
    }

    public Enrollment enrollStudent(Enrollment enrollment) {

        if (enrollmentRepository.existsByUserIdAndCourseId(
                enrollment.getUserId(),
                enrollment.getCourseId())) {

            throw new RuntimeException("Student already enrolled");
        }

        return enrollmentRepository.save(enrollment);
    }

    public boolean deleteEnrollment(Long id) {

        if (!enrollmentRepository.existsById(id))
            return false;

        enrollmentRepository.deleteById(id);
        return true;
    }

    public List<Enrollment> getByUser(Long userId) {
        return enrollmentRepository.findByUserId(userId);
    }

    public List<Enrollment> getByCourse(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    public List<Enrollment> getByStatus(String status) {
        return enrollmentRepository.findByStatus(status);
    }
}