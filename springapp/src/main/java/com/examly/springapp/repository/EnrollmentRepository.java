package com.examly.springapp.repository;

import com.examly.springapp.model.Enrollment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByUserId(Long userId);

    List<Enrollment> findByCourseId(Long courseId);

    List<Enrollment> findByStatus(String status);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

}