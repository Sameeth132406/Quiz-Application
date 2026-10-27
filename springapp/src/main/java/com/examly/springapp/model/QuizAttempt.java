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

    @Transient
    private String studentName;

    @Transient
    private String studentEmail;

    @Transient
    private String username;

    @Transient
    private String userEmail;

    @Transient
    private Boolean resultsPublished = false;

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

    public String getStudentName() {
        return studentName != null ? studentName : username;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
        if (this.username == null) {
            this.username = studentName;
        }
    }

    public String getStudentEmail() {
        return studentEmail != null ? studentEmail : userEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
        if (this.userEmail == null) {
            this.userEmail = studentEmail;
        }
    }

    public String getUsername() {
        return username != null ? username : studentName;
    }

    public void setUsername(String username) {
        this.username = username;
        if (this.studentName == null) {
            this.studentName = username;
        }
    }

    public String getUserEmail() {
        return userEmail != null ? userEmail : studentEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
        if (this.studentEmail == null) {
            this.studentEmail = userEmail;
        }
    }

    public Boolean getResultsPublished() {
        return resultsPublished != null ? resultsPublished : false;
    }

    public void setResultsPublished(Boolean resultsPublished) {
        this.resultsPublished = resultsPublished != null ? resultsPublished : false;
    }
}