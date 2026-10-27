package com.examly.springapp.dto;

import java.time.LocalDateTime;

public class LeaderboardEntryDTO {

    private Long id;
    private Long leaderboardId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String displayName;
    private Integer rank;
    private Double score;
    private Double percentage;
    private Integer attempts;
    private Double courseProgress;
    private Boolean isCurrentStudent = false;
    private LocalDateTime updatedAt;

    public LeaderboardEntryDTO() {
    }

    public LeaderboardEntryDTO(Long id, Long leaderboardId, Long studentId, String studentName,
                               Integer rank, Double score, Double percentage, Integer attempts,
                               Double courseProgress, Boolean isCurrentStudent) {
        this.id = id;
        this.leaderboardId = leaderboardId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.displayName = studentName;
        this.rank = rank;
        this.score = score;
        this.percentage = percentage;
        this.attempts = attempts;
        this.courseProgress = courseProgress;
        this.isCurrentStudent = isCurrentStudent != null ? isCurrentStudent : false;
        this.updatedAt = LocalDateTime.now();
    }

    public LeaderboardEntryDTO(Long id, Long leaderboardId, Long studentId, String studentName, String studentEmail,
                               Integer rank, Double score, Double percentage, Integer attempts,
                               Double courseProgress, Boolean isCurrentStudent) {
        this.id = id;
        this.leaderboardId = leaderboardId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.displayName = studentName;
        this.rank = rank;
        this.score = score;
        this.percentage = percentage;
        this.attempts = attempts;
        this.courseProgress = courseProgress;
        this.isCurrentStudent = isCurrentStudent != null ? isCurrentStudent : false;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLeaderboardId() { return leaderboardId; }
    public void setLeaderboardId(Long leaderboardId) { this.leaderboardId = leaderboardId; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) {
        this.studentName = studentName;
        if (this.displayName == null) this.displayName = studentName;
    }
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    public String getDisplayName() {
        return displayName != null ? displayName : studentName;
    }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public Integer getAttempts() { return attempts; }
    public void setAttempts(Integer attempts) { this.attempts = attempts; }
    public Double getCourseProgress() { return courseProgress; }
    public void setCourseProgress(Double courseProgress) { this.courseProgress = courseProgress; }
    public Boolean getIsCurrentStudent() { return isCurrentStudent; }
    public void setIsCurrentStudent(Boolean isCurrentStudent) { this.isCurrentStudent = isCurrentStudent; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
