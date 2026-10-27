package com.examly.springapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaderboard_entries", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"leaderboard_id", "student_id"})
})
@JsonIgnoreProperties(ignoreUnknown = true)
public class LeaderboardEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "leaderboard_id", nullable = false)
    private Long leaderboardId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Transient
    private String studentName;

    private Integer rankPosition;

    private Double score = 0.0;

    private Double percentage = 0.0;

    private Integer attempts = 0;

    private Double courseProgress = 0.0;

    private LocalDateTime updatedAt;

    public LeaderboardEntry() {
    }

    public LeaderboardEntry(Long id, Long leaderboardId, Long studentId, Integer rankPosition,
                            Double score, Double percentage, Integer attempts) {
        this.id = id;
        this.leaderboardId = leaderboardId;
        this.studentId = studentId;
        this.rankPosition = rankPosition;
        this.score = score != null ? score : 0.0;
        this.percentage = percentage != null ? percentage : 0.0;
        this.attempts = attempts != null ? attempts : 0;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLeaderboardId() {
        return leaderboardId;
    }

    public void setLeaderboardId(Long leaderboardId) {
        this.leaderboardId = leaderboardId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public Integer getRankPosition() {
        return rankPosition;
    }

    public void setRankPosition(Integer rankPosition) {
        this.rankPosition = rankPosition;
    }

    public Double getScore() {
        return score != null ? score : 0.0;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public Double getPercentage() {
        return percentage != null ? percentage : 0.0;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Integer getAttempts() {
        return attempts != null ? attempts : 0;
    }

    public void setAttempts(Integer attempts) {
        this.attempts = attempts;
    }

    public Double getCourseProgress() {
        return courseProgress != null ? courseProgress : 0.0;
    }

    public void setCourseProgress(Double courseProgress) {
        this.courseProgress = courseProgress;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
