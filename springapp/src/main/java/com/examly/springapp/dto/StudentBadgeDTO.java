package com.examly.springapp.dto;

import java.time.LocalDateTime;

public class StudentBadgeDTO {

    private Long id;
    private Long studentId;
    private String studentName;
    private Long badgeId;
    private String badgeName;
    private String badgeDescription;
    private String badgeIconUrl;
    private String badgeType;
    private Double requirementValue;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime awardedAt;
    private Double progress;
    private Boolean achieved;

    public StudentBadgeDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Long getBadgeId() { return badgeId; }
    public void setBadgeId(Long badgeId) { this.badgeId = badgeId; }
    public String getBadgeName() { return badgeName; }
    public void setBadgeName(String badgeName) { this.badgeName = badgeName; }
    public String getBadgeDescription() { return badgeDescription; }
    public void setBadgeDescription(String badgeDescription) { this.badgeDescription = badgeDescription; }
    public String getBadgeIconUrl() { return badgeIconUrl; }
    public void setBadgeIconUrl(String badgeIconUrl) { this.badgeIconUrl = badgeIconUrl; }
    public String getBadgeType() { return badgeType; }
    public void setBadgeType(String badgeType) { this.badgeType = badgeType; }
    public Double getRequirementValue() { return requirementValue; }
    public void setRequirementValue(Double requirementValue) { this.requirementValue = requirementValue; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    public LocalDateTime getAwardedAt() { return awardedAt; }
    public void setAwardedAt(LocalDateTime awardedAt) { this.awardedAt = awardedAt; }
    public Double getProgress() { return progress; }
    public void setProgress(Double progress) { this.progress = progress; }
    public Boolean getAchieved() { return achieved; }
    public void setAchieved(Boolean achieved) { this.achieved = achieved; }
}
