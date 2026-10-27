package com.examly.springapp.repository;

import com.examly.springapp.model.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {

    Optional<CourseProgress> findByStudentIdAndContentId(Long studentId, Long contentId);

    List<CourseProgress> findByStudentIdAndCourseId(Long studentId, Long courseId);

    List<CourseProgress> findByStudentIdAndModuleId(Long studentId, Long moduleId);

    long countByStudentIdAndCourseIdAndCompletedTrue(Long studentId, Long courseId);

    long countByStudentIdAndModuleIdAndCompletedTrue(Long studentId, Long moduleId);

    void deleteByCourseId(Long courseId);
}
