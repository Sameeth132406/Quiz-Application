package com.examly.springapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "content_id"})
})
@JsonIgnoreProperties(ignoreUnknown = true)
public class CourseProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "module_id", nullable = false)
    private Long moduleId;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    private Boolean completed = false;

    private LocalDateTime completedAt;

    public CourseProgress() {
    }

    public CourseProgress(Long id, Long studentId, Long courseId, Long moduleId, Long contentId, Boolean completed) {
        this.id = id;
        this.studentId = studentId;
        this.courseId = courseId;
        this.moduleId = moduleId;
        this.contentId = contentId;
        this.completed = completed != null ? completed : false;
        if (Boolean.TRUE.equals(completed)) {
            this.completedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Long getModuleId() {
        return moduleId;
    }

    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }

    public Long getContentId() {
        return contentId;
    }

    public void setContentId(Long contentId) {
        this.contentId = contentId;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
        if (Boolean.TRUE.equals(completed)) {
            this.completedAt = LocalDateTime.now();
        } else {
            this.completedAt = null;
        }
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
