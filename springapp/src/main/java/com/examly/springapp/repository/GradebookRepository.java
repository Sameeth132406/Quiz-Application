package com.examly.springapp.repository;

import com.examly.springapp.model.Gradebook;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GradebookRepository extends JpaRepository<Gradebook, Long> {

    List<Gradebook> findByUserId(Long userId);

    List<Gradebook> findByCourseId(Long courseId);

    List<Gradebook> findByQuizId(Long quizId);

    List<Gradebook> findByGrade(String grade);

}