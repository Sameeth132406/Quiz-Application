package com.examly.springapp.service;

import com.examly.springapp.model.Enrollment;
import com.examly.springapp.repository.EnrollmentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Override
    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    @Override
    public Enrollment getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id).orElse(null);
    }

    @Override
    public Enrollment enrollStudent(Enrollment enrollment) {

        if (enrollmentRepository.existsByUserIdAndCourseId(
                enrollment.getUserId(),
                enrollment.getCourseId())) {

            throw new RuntimeException("Student already enrolled");
        }

        return enrollmentRepository.save(enrollment);
    }

    @Override
    public boolean deleteEnrollment(Long id) {

        if (!enrollmentRepository.existsById(id)) {
            return false;
        }

        enrollmentRepository.deleteById(id);
        return true;
    }

    @Override
    public List<Enrollment> getByUser(Long userId) {
        return enrollmentRepository.findByUserId(userId);
    }

    @Override
    public List<Enrollment> getByCourse(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    @Override
    public List<Enrollment> getByStatus(String status) {
        return enrollmentRepository.findByStatus(status);
    }
}