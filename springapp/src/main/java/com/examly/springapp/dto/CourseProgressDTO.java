package com.examly.springapp.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public class CourseProgressDTO {

    private Long courseId;
    private String courseTitle;
    private Long studentId;
    private Double progressPercentage;
    private Integer completedContentsCount;
    private Integer totalContentsCount;
    private Set<Long> completedContentIds;
    private Long lastCompletedContentId;
    private Long nextContentId;
    private Boolean isCompleted;
    private LocalDateTime completedAt;

    public CourseProgressDTO() {
    }

    public CourseProgressDTO(Long courseId, Long studentId, Double progressPercentage,
                             Integer completedContentsCount, Integer totalContentsCount,
                             Set<Long> completedContentIds) {
        this.courseId = courseId;
        this.studentId = studentId;
        this.progressPercentage = progressPercentage;
        this.completedContentsCount = completedContentsCount;
        this.totalContentsCount = totalContentsCount;
        this.completedContentIds = completedContentIds;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public Integer getCompletedContentsCount() {
        return completedContentsCount;
    }

    public void setCompletedContentsCount(Integer completedContentsCount) {
        this.completedContentsCount = completedContentsCount;
    }

    public Integer getTotalContentsCount() {
        return totalContentsCount;
    }

    public void setTotalContentsCount(Integer totalContentsCount) {
        this.totalContentsCount = totalContentsCount;
    }

    public Set<Long> getCompletedContentIds() {
        return completedContentIds;
    }

    public void setCompletedContentIds(Set<Long> completedContentIds) {
        this.completedContentIds = completedContentIds;
    }

    public Long getLastCompletedContentId() {
        return lastCompletedContentId;
    }

    public void setLastCompletedContentId(Long lastCompletedContentId) {
        this.lastCompletedContentId = lastCompletedContentId;
    }

    public Long getNextContentId() {
        return nextContentId;
    }

    public void setNextContentId(Long nextContentId) {
        this.nextContentId = nextContentId;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
