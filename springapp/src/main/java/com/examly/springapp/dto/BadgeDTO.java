package com.examly.springapp.dto;

import java.time.LocalDateTime;

public class BadgeDTO {

    private Long id;
    private String name;
    private String description;
    private String iconUrl;
    private String badgeType;
    private Double requirementValue;
    private Long courseId;
    private String courseTitle;
    private Boolean active;
    private LocalDateTime createdAt;

    public BadgeDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIconUrl() { return iconUrl; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }
    public String getBadgeType() { return badgeType; }
    public void setBadgeType(String badgeType) { this.badgeType = badgeType; }
    public Double getRequirementValue() { return requirementValue; }
    public void setRequirementValue(Double requirementValue) { this.requirementValue = requirementValue; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
