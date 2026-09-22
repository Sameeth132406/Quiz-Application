package com.examly.springapp.service;

import com.examly.springapp.model.Question;
import com.examly.springapp.repository.QuestionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionServiceImpl implements QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Override
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    @Override
    public Question getQuestionById(Long id) {
        return questionRepository.findById(id).orElse(null);
    }

    @Override
    public Question addQuestion(Question question) {
        return questionRepository.save(question);
    }

    @Override
    public Question updateQuestion(Long id, Question question) {

        Question existing =
                questionRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setQuizId(question.getQuizId());
        existing.setQuestionText(question.getQuestionText());
        existing.setOptionA(question.getOptionA());
        existing.setOptionB(question.getOptionB());
        existing.setOptionC(question.getOptionC());
        existing.setOptionD(question.getOptionD());
        existing.setCorrectAnswer(question.getCorrectAnswer());
        existing.setQuestionType(question.getQuestionType());
        existing.setMarks(question.getMarks());

        return questionRepository.save(existing);
    }

    @Override
    public boolean deleteQuestion(Long id) {

        if (!questionRepository.existsById(id)) {
            return false;
        }

        questionRepository.deleteById(id);
        return true;
    }

    @Override
    public List<Question> getQuestionsByQuiz(Long quizId) {
        return questionRepository.findByQuizId(quizId);
    }
}