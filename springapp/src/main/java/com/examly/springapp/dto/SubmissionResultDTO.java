package com.examly.springapp.dto;

import java.time.LocalDateTime;

public class SubmissionResultDTO {

    private Long attemptId;
    private Long quizId;
    private Long userId;
    private Integer score;
    private Integer totalMarks;
    private Integer percentage;
    private String grade;
    private Integer correctCount;
    private Integer totalQuestions;
    private String status;
    private Integer tabSwitches;
    private LocalDateTime completedAt;
    private Boolean resultsPublished = false;

    public SubmissionResultDTO() {
    }

    public SubmissionResultDTO(Long attemptId,
                               Long quizId,
                               Long userId,
                               Integer score,
                               Integer totalMarks,
                               Integer percentage,
                               String grade,
                               Integer correctCount,
                               Integer totalQuestions,
                               String status,
                               Integer tabSwitches,
                               LocalDateTime completedAt) {
        this.attemptId = attemptId;
        this.quizId = quizId;
        this.userId = userId;
        this.score = score;
        this.totalMarks = totalMarks;
        this.percentage = percentage;
        this.grade = grade;
        this.correctCount = correctCount;
        this.totalQuestions = totalQuestions;
        this.status = status;
        this.tabSwitches = tabSwitches;
        this.completedAt = completedAt;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public Integer getPercentage() {
        return percentage;
    }

    public void setPercentage(Integer percentage) {
        this.percentage = percentage;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public Integer getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(Integer correctCount) {
        this.correctCount = correctCount;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getTabSwitches() {
        return tabSwitches;
    }

    public void setTabSwitches(Integer tabSwitches) {
        this.tabSwitches = tabSwitches;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Boolean getResultsPublished() {
        return resultsPublished != null ? resultsPublished : false;
    }

    public void setResultsPublished(Boolean resultsPublished) {
        this.resultsPublished = resultsPublished != null ? resultsPublished : false;
    }
}
