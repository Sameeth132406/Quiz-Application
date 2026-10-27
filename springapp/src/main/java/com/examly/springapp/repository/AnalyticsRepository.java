package com.examly.springapp.repository;

import com.examly.springapp.model.Analytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyticsRepository
        extends JpaRepository<Analytics, Long> {

    List<Analytics> findByQuizId(Long quizId);

    List<Analytics> findByUserId(Long userId);

    List<Analytics> findByCourseId(Long courseId);

    List<Analytics> findByUserIdAndQuizId(
            Long userId,
            Long quizId
    );

    List<Analytics> findByUserIdAndCourseId(
            Long userId,
            Long courseId
    );
}