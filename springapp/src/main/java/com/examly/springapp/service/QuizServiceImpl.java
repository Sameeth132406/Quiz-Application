package com.examly.springapp.service;

import com.examly.springapp.enums.Difficulty;
import com.examly.springapp.model.Quiz;
import com.examly.springapp.repository.QuizRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizServiceImpl implements QuizService {

    @Autowired
    private QuizRepository quizRepository;

    // Get all quizzes
    @Override
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    // Get quiz by ID
    @Override
    public Quiz getQuizById(Long id) {
        return quizRepository.findById(id).orElse(null);
    }

    // Add a new quiz
    @Override
    public Quiz addQuiz(Quiz quiz) {

        if (quizRepository.existsByTitle(quiz.getTitle())) {
            throw new RuntimeException(
                    "Quiz with title '" + quiz.getTitle() + "' already exists.");
        }

        return quizRepository.save(quiz);
    }

    // Update quiz
    @Override
    public Quiz updateQuiz(Long id, Quiz quiz) {

        Quiz existingQuiz = quizRepository.findById(id).orElse(null);

        if (existingQuiz == null) {
            return null;
        }

        existingQuiz.setTitle(quiz.getTitle());
        existingQuiz.setDescription(quiz.getDescription());
        existingQuiz.setCategory(quiz.getCategory());
        existingQuiz.setDifficulty(quiz.getDifficulty());
        existingQuiz.setDuration(quiz.getDuration());

        return quizRepository.save(existingQuiz);
    }

    // Delete quiz
    @Override
    public boolean deleteQuiz(Long id) {

        if (!quizRepository.existsById(id)) {
            return false;
        }

        quizRepository.deleteById(id);
        return true;
    }

    // Search by title
    @Override
    public List<Quiz> searchByTitle(String keyword) {
        return quizRepository.findByTitleContainingIgnoreCase(keyword);
    }

    // Search by description
    @Override
    public List<Quiz> searchByDescription(String keyword) {
        return quizRepository.findByDescriptionContainingIgnoreCase(keyword);
    }

    // Search by category
    @Override
    public List<Quiz> searchByCategory(String category) {
        return quizRepository.findByCategoryContainingIgnoreCase(category);
    }

    // Filter by difficulty
    @Override
    public List<Quiz> getByDifficulty(Difficulty difficulty) {
        return quizRepository.findByDifficulty(difficulty);
    }

    // Filter by duration
    @Override
    public List<Quiz> getByDuration(Integer duration) {
        return quizRepository.findByDurationLessThanEqual(duration);
    }
}