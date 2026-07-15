package com.examly.springapp.dto;

public class QuizAttemptDTO {

    private Long id;
    private Long userId;
    private Long quizId;
    private Integer score;
    private String status;

    public QuizAttemptDTO() {
    }

    public QuizAttemptDTO(Long id,
                          Long userId,
                          Long quizId,
                          Integer score,
                          String status) {
        this.id = id;
        this.userId = userId;
        this.quizId = quizId;
        this.score = score;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}