package com.examly.springapp.service;

import com.examly.springapp.model.Question;
import java.util.List;

public interface QuestionService {

    List<Question> getAllQuestions();

    Question getQuestionById(Long id);

    Question addQuestion(Question question);

    Question updateQuestion(Long id, Question question);

    boolean deleteQuestion(Long id);

    List<Question> getQuestionsByQuiz(Long quizId);
}