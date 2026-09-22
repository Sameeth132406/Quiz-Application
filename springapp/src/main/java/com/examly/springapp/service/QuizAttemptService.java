package com.examly.springapp.service;

import com.examly.springapp.model.QuizAttempt;
import java.util.List;

public interface QuizAttemptService {

    List<QuizAttempt> getAllAttempts();

    QuizAttempt getAttemptById(Long id);

    QuizAttempt startQuiz(QuizAttempt attempt);

    QuizAttempt updateAttempt(Long id, QuizAttempt attempt);

    boolean deleteAttempt(Long id);

    List<QuizAttempt> getAttemptsByUser(Long userId);

    com.examly.springapp.dto.SubmissionResultDTO submitQuiz(Long quizId, com.examly.springapp.dto.QuizSubmissionDTO submission);
}