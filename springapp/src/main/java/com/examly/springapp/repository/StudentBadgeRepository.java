package com.examly.springapp.repository;

import com.examly.springapp.model.StudentBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentBadgeRepository extends JpaRepository<StudentBadge, Long> {

    List<StudentBadge> findByStudentId(Long studentId);

    List<StudentBadge> findByStudentIdAndAchievedTrue(Long studentId);

    List<StudentBadge> findByStudentIdAndCourseId(Long studentId, Long courseId);

    Optional<StudentBadge> findByStudentIdAndBadgeId(Long studentId, Long badgeId);

    Optional<StudentBadge> findByStudentIdAndBadgeIdAndCourseId(Long studentId, Long badgeId, Long courseId);
}
