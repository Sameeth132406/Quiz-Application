package com.examly.springapp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "responses")
public class Response {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long attemptId;

    private Long questionId;

    private String selectedAnswer;

    private boolean correct;

    public Response() {
    }

    public Response(Long id, Long attemptId, Long questionId,
                    String selectedAnswer, boolean correct) {
        this.id = id;
        this.attemptId = attemptId;
        this.questionId = questionId;
        this.selectedAnswer = selectedAnswer;
        this.correct = correct;
    }

    public Long getId() {
        return id;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public String getSelectedAnswer() {
        return selectedAnswer;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public void setSelectedAnswer(String selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }
}
