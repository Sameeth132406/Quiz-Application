package com.examly.springapp.repository;

import com.examly.springapp.model.MentorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorAssignmentRepository extends JpaRepository<MentorAssignment, Long> {
    Optional<MentorAssignment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<MentorAssignment> findByEducatorId(Long educatorId);
    List<MentorAssignment> findByStudentId(Long studentId);
    List<MentorAssignment> findByEducatorIdAndCourseId(Long educatorId, Long courseId);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
    void deleteByStudentIdAndCourseId(Long studentId, Long courseId);
}
