package com.examly.springapp.model;

import com.examly.springapp.enums.AttemptStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long quizId;

    @NotNull
    private Integer score;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttemptStatus status;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private Integer tabSwitches = 0;

    public QuizAttempt() {
    }

    public QuizAttempt(Long id,
                       Long userId,
                       Long quizId,
                       Integer score,
                       AttemptStatus status,
                       LocalDateTime startedAt,
                       LocalDateTime completedAt) {

        this.id = id;
        this.userId = userId;
        this.quizId = quizId;
        this.score = score;
        this.status = status;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.tabSwitches = 0;
    }

    public QuizAttempt(Long id,
                       Long userId,
                       Long quizId,
                       Integer score,
                       AttemptStatus status,
                       LocalDateTime startedAt,
                       LocalDateTime completedAt,
                       Integer tabSwitches) {

        this.id = id;
        this.userId = userId;
        this.quizId = quizId;
        this.score = score;
        this.status = status;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.tabSwitches = tabSwitches != null ? tabSwitches : 0;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public Integer getScore() {
        return score;
    }

    public AttemptStatus getStatus() {
        return status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public void setStatus(AttemptStatus status) {
        this.status = status;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public Integer getTabSwitches() {
        return tabSwitches != null ? tabSwitches : 0;
    }

    public void setTabSwitches(Integer tabSwitches) {
        this.tabSwitches = tabSwitches != null ? tabSwitches : 0;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}