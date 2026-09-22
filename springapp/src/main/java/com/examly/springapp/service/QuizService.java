package com.examly.springapp.service;

import com.examly.springapp.enums.Difficulty;
import com.examly.springapp.model.Quiz;

import java.util.List;

public interface QuizService {

    List<Quiz> getAllQuizzes();

    Quiz getQuizById(Long id);

    Quiz addQuiz(Quiz quiz);

    Quiz updateQuiz(Long id, Quiz quiz);

    boolean deleteQuiz(Long id);

    List<Quiz> searchByTitle(String keyword);

    List<Quiz> searchByDescription(String keyword);

    List<Quiz> searchByCategory(String category);

    List<Quiz> getByDifficulty(Difficulty difficulty);

    List<Quiz> getByDuration(Integer duration);
}