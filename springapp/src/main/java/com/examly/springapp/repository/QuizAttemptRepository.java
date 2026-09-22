package com.examly.springapp.repository;

import com.examly.springapp.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository
        extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUserId(Long userId);

    List<QuizAttempt> findByQuizId(Long quizId);

    List<QuizAttempt> findByUserIdAndQuizId(
            Long userId,
            Long quizId
    );
}