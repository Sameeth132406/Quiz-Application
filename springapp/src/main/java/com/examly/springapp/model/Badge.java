package com.examly.springapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String iconUrl;

    // FIRST_QUIZ, QUIZ_COUNT, SCORE_THRESHOLD, PERFECT_SCORE, COURSE_COMPLETION, LEADERBOARD_RANK, COURSE_SCORE
    @Column(nullable = false)
    private String badgeType;

    private Double requirementValue = 1.0;

    private Long courseId; // Optional for course-specific badges

    private Boolean active = true;

    private LocalDateTime createdAt;

    public Badge() {
    }

    public Badge(Long id, String name, String description, String iconUrl,
                 String badgeType, Double requirementValue, Long courseId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.iconUrl = iconUrl;
        this.badgeType = badgeType;
        this.requirementValue = requirementValue != null ? requirementValue : 1.0;
        this.courseId = courseId;
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.active == null) {
            this.active = true;
        }
        if (this.requirementValue == null) {
            this.requirementValue = 1.0;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIconUrl() {
        return iconUrl;
    }

    public void setIconUrl(String iconUrl) {
        this.iconUrl = iconUrl;
    }

    public String getBadgeType() {
        return badgeType;
    }

    public void setBadgeType(String badgeType) {
        this.badgeType = badgeType;
    }

    public Double getRequirementValue() {
        return requirementValue != null ? requirementValue : 1.0;
    }

    public void setRequirementValue(Double requirementValue) {
        this.requirementValue = requirementValue;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Boolean getActive() {
        return active != null ? active : true;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
