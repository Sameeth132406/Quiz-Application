package com.examly.springapp.dto;

import com.examly.springapp.enums.CourseStatus;
import com.examly.springapp.enums.Difficulty;
import java.time.LocalDateTime;
import java.util.List;

public class CourseDTO {

    private Long id;
    private String title;
    private String description;
    private String category;
    private Difficulty difficulty;
    private String thumbnailUrl;
    private String duration;
    private CourseStatus status;
    private Long educatorId;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Legacy fields
    private String courseCode;
    private String courseName;
    private String instructor;

    // Computed / metadata fields
    private Integer modulesCount;
    private Long studentsCount;
    private Double progressPercentage;
    private Boolean isEnrolled;
    private List<CourseModuleDTO> modules;

    public CourseDTO() {
    }

    public CourseDTO(Long id, String courseCode, String courseName, String description, String instructor) {
        this.id = id;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.title = courseName;
        this.description = description;
        this.instructor = instructor;
        this.createdBy = instructor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title != null ? title : courseName;
    }

    public void setTitle(String title) {
        this.title = title;
        if (this.courseName == null) this.courseName = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public CourseStatus getStatus() {
        return status;
    }

    public void setStatus(CourseStatus status) {
        this.status = status;
    }

    public Long getEducatorId() {
        return educatorId;
    }

    public void setEducatorId(Long educatorId) {
        this.educatorId = educatorId;
    }

    public String getCreatedBy() {
        return createdBy != null ? createdBy : instructor;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
        if (this.instructor == null) this.instructor = createdBy;
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

    public String getCourseCode() {
        return courseCode != null ? courseCode : (title != null ? "CRS-" + title.replaceAll("\\s+", "-").toUpperCase() : null);
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName != null ? courseName : title;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
        if (this.title == null) this.title = courseName;
    }

    public String getInstructor() {
        return instructor != null ? instructor : createdBy;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
        if (this.createdBy == null) this.createdBy = instructor;
    }

    public Integer getModulesCount() {
        return modulesCount;
    }

    public void setModulesCount(Integer modulesCount) {
        this.modulesCount = modulesCount;
    }

    public Long getStudentsCount() {
        return studentsCount;
    }

    public void setStudentsCount(Long studentsCount) {
        this.studentsCount = studentsCount;
    }

    public Double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public Boolean getIsEnrolled() {
        return isEnrolled;
    }

    public void setIsEnrolled(Boolean isEnrolled) {
        this.isEnrolled = isEnrolled;
    }

    public List<CourseModuleDTO> getModules() {
        return modules;
    }

    public void setModules(List<CourseModuleDTO> modules) {
        this.modules = modules;
    }
}