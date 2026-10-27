package com.examly.springapp.dto;

import java.time.LocalDateTime;

public class LeaderboardDTO {

    private Long id;
    private String title;
    private String description;
    private Long courseId;
    private String courseTitle;
    private Long quizId;
    private String quizTitle;
    private Long createdBy;
    private String creatorName;
    private String rankingMetric;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;
    private Boolean isVisibleToStudents;
    private String visibility;
    private Integer maxEntries;
    private Integer totalParticipants;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LeaderboardDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }
    public String getQuizTitle() { return quizTitle; }
    public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
    public String getRankingMetric() { return rankingMetric; }
    public void setRankingMetric(String rankingMetric) { this.rankingMetric = rankingMetric; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Boolean getIsVisibleToStudents() { return isVisibleToStudents; }
    public void setIsVisibleToStudents(Boolean isVisibleToStudents) { this.isVisibleToStudents = isVisibleToStudents; }
    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
    public Integer getMaxEntries() { return maxEntries; }
    public void setMaxEntries(Integer maxEntries) { this.maxEntries = maxEntries; }
    public Integer getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(Integer totalParticipants) { this.totalParticipants = totalParticipants; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
