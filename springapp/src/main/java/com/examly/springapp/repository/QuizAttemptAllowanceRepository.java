package com.examly.springapp.repository;

import com.examly.springapp.model.QuizAttemptAllowance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptAllowanceRepository extends JpaRepository<QuizAttemptAllowance, Long> {
    Optional<QuizAttemptAllowance> findByQuizIdAndUserId(Long quizId, Long userId);
    List<QuizAttemptAllowance> findByQuizId(Long quizId);
    List<QuizAttemptAllowance> findByUserId(Long userId);
}
