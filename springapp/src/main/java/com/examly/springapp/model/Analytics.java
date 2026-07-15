package com.examly.springapp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "analytics")
public class Analytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long quizId;

    private Long userId;

    private Integer totalAttempts;

    private Double averageScore;

    private Double highestScore;

    private Double lowestScore;

    public Analytics() {
    }

    public Analytics(Long id, Long quizId, Long userId,
                     Integer totalAttempts,
                     Double averageScore,
                     Double highestScore,
                     Double lowestScore) {
        this.id = id;
        this.quizId = quizId;
        this.userId = userId;
        this.totalAttempts = totalAttempts;
        this.averageScore = averageScore;
        this.highestScore = highestScore;
        this.lowestScore = lowestScore;
    }

    public Long getId() {
        return id;
    }

    public Long getQuizId() {
        return quizId;
    }

    public Long getUserId() {
        return userId;
    }

    public Integer getTotalAttempts() {
        return totalAttempts;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public Double getHighestScore() {
        return highestScore;
    }

    public Double getLowestScore() {
        return lowestScore;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setTotalAttempts(Integer totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public void setHighestScore(Double highestScore) {
        this.highestScore = highestScore;
    }

    public void setLowestScore(Double lowestScore) {
        this.lowestScore = lowestScore;
    }
}