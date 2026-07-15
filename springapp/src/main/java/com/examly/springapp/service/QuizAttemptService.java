package com.examly.springapp.service;

import com.examly.springapp.model.QuizAttempt;
import com.examly.springapp.repository.QuizAttemptRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizAttemptService {

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    public List<QuizAttempt> getAllAttempts() {
        return quizAttemptRepository.findAll();
    }

    public QuizAttempt getAttemptById(Long id) {
        return quizAttemptRepository.findById(id).orElse(null);
    }

    public QuizAttempt startQuiz(QuizAttempt attempt) {
        return quizAttemptRepository.save(attempt);
    }

    public QuizAttempt updateAttempt(Long id, QuizAttempt attempt) {

        QuizAttempt existing =
                quizAttemptRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setUserId(attempt.getUserId());
        existing.setQuizId(attempt.getQuizId());
        existing.setScore(attempt.getScore());
        existing.setStatus(attempt.getStatus());
        existing.setStartedAt(attempt.getStartedAt());
        existing.setCompletedAt(attempt.getCompletedAt());

        return quizAttemptRepository.save(existing);
    }

    public boolean deleteAttempt(Long id) {

        if (!quizAttemptRepository.existsById(id)) {
            return false;
        }

        quizAttemptRepository.deleteById(id);
        return true;
    }

    public List<QuizAttempt> getAttemptsByUser(Long userId) {
        return quizAttemptRepository.findByUserId(userId);
    }
}