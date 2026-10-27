package com.examly.springapp.model;

import com.examly.springapp.enums.CourseStatus;
import com.examly.springapp.enums.Difficulty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    private String thumbnailUrl;

    private String duration;

    @Enumerated(EnumType.STRING)
    private CourseStatus status = CourseStatus.DRAFT;

    private Long educatorId;

    private String createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Backwards-compatible legacy fields
    private String courseCode;
    private String courseName;
    private String instructor;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("moduleOrder ASC")
    private List<CourseModule> modules = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<CourseEnrollment> enrollments = new ArrayList<>();

    public Course() {
    }

    public Course(Long id, String courseCode, String courseName, String description, String instructor) {
        this.id = id;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.title = courseName;
        this.description = description;
        this.instructor = instructor;
        this.createdBy = instructor;
        this.status = CourseStatus.PUBLISHED;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.title == null && this.courseName != null) {
            this.title = this.courseName;
        }
        if (this.courseName == null && this.title != null) {
            this.courseName = this.title;
        }
        if (this.courseCode == null && this.title != null) {
            this.courseCode = "CRS-" + (this.title.length() > 3 ? this.title.substring(0, 3).toUpperCase() : "GEN") + "-" + System.currentTimeMillis() % 10000;
        }
        if (this.createdBy == null && this.instructor != null) {
            this.createdBy = this.instructor;
        }
        if (this.instructor == null && this.createdBy != null) {
            this.instructor = this.createdBy;
        }
        if (this.status == null) {
            this.status = CourseStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.title != null) {
            this.courseName = this.title;
        }
        if (this.createdBy != null) {
            this.instructor = this.createdBy;
        }
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
        if (this.courseName == null) {
            this.courseName = title;
        }
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
        if (this.instructor == null) {
            this.instructor = createdBy;
        }
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
        if (this.title == null) {
            this.title = courseName;
        }
    }

    public String getInstructor() {
        return instructor != null ? instructor : createdBy;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
        if (this.createdBy == null) {
            this.createdBy = instructor;
        }
    }

    public List<CourseModule> getModules() {
        return modules;
    }

    public void setModules(List<CourseModule> modules) {
        this.modules = modules;
    }

    public List<CourseEnrollment> getEnrollments() {
        return enrollments;
    }

    public void setEnrollments(List<CourseEnrollment> enrollments) {
        this.enrollments = enrollments;
    }
}