package com.examly.springapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaderboards")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Leaderboard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Long courseId;

    private Long quizId;

    private Long createdBy;

    // HIGHEST_SCORE, AVERAGE_SCORE, TOTAL_SCORE, QUIZ_COMPLETION, COURSE_PROGRESS
    @Column(nullable = false)
    private String rankingMetric = "HIGHEST_SCORE";

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Boolean isActive = true;

    private Boolean isVisibleToStudents = true;

    // PRIVATE, ENROLLED_STUDENTS, PUBLIC
    private String visibility = "ENROLLED_STUDENTS";

    private Integer maxEntries = 20;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Leaderboard() {
    }

    public Leaderboard(Long id, String title, String description, Long courseId, Long quizId,
                       Long createdBy, String rankingMetric, Boolean isVisibleToStudents) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.courseId = courseId;
        this.quizId = quizId;
        this.createdBy = createdBy;
        this.rankingMetric = rankingMetric != null ? rankingMetric : "HIGHEST_SCORE";
        this.isVisibleToStudents = isVisibleToStudents != null ? isVisibleToStudents : true;
        this.isActive = true;
        this.visibility = "ENROLLED_STUDENTS";
        this.maxEntries = 20;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
        if (this.isVisibleToStudents == null) {
            this.isVisibleToStudents = true;
        }
        if (this.rankingMetric == null) {
            this.rankingMetric = "HIGHEST_SCORE";
        }
        if (this.visibility == null) {
            this.visibility = "ENROLLED_STUDENTS";
        }
        if (this.maxEntries == null) {
            this.maxEntries = 20;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public String getRankingMetric() {
        return rankingMetric;
    }

    public void setRankingMetric(String rankingMetric) {
        this.rankingMetric = rankingMetric;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public Boolean getIsActive() {
        return isActive != null ? isActive : true;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsVisibleToStudents() {
        return isVisibleToStudents != null ? isVisibleToStudents : true;
    }

    public void setIsVisibleToStudents(Boolean isVisibleToStudents) {
        this.isVisibleToStudents = isVisibleToStudents;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public Integer getMaxEntries() {
        return maxEntries != null ? maxEntries : 20;
    }

    public void setMaxEntries(Integer maxEntries) {
        this.maxEntries = maxEntries;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
