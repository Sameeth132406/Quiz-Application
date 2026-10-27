package com.examly.springapp.repository;

import com.examly.springapp.enums.EnrollmentStatus;
import com.examly.springapp.model.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {

    Optional<CourseEnrollment> findByCourseIdAndStudentId(Long courseId, Long studentId);

    boolean existsByCourseIdAndStudentId(Long courseId, Long studentId);

    List<CourseEnrollment> findByStudentId(Long studentId);

    List<CourseEnrollment> findByCourseId(Long courseId);

    List<CourseEnrollment> findByCourseIdAndStatus(Long courseId, EnrollmentStatus status);

    List<CourseEnrollment> findByStudentIdAndStatus(Long studentId, EnrollmentStatus status);

    long countByCourseId(Long courseId);

    void deleteByCourseIdAndStudentId(Long courseId, Long studentId);
}
