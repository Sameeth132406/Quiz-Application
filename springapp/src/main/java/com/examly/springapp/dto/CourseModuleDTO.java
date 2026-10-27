package com.examly.springapp.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CourseModuleDTO {

    private Long id;
    private String title;
    private String description;
    private Integer moduleOrder;
    private Long courseId;
    private Long quizId;
    private String quizTitle;
    private Integer quizDuration;
    private List<CourseContentDTO> contents;
    private Boolean isCompleted;
    private Double progressPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CourseModuleDTO() {
    }

    public CourseModuleDTO(Long id, String title, String description, Integer moduleOrder, Long courseId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.moduleOrder = moduleOrder;
        this.courseId = courseId;
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

    public Integer getModuleOrder() {
        return moduleOrder;
    }

    public void setModuleOrder(Integer moduleOrder) {
        this.moduleOrder = moduleOrder;
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

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public Integer getQuizDuration() {
        return quizDuration;
    }

    public void setQuizDuration(Integer quizDuration) {
        this.quizDuration = quizDuration;
    }

    public List<CourseContentDTO> getContents() {
        return contents;
    }

    public void setContents(List<CourseContentDTO> contents) {
        this.contents = contents;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public Double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
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
