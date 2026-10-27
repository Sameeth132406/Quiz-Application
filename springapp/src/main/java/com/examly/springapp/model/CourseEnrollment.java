package com.examly.springapp.model;

import com.examly.springapp.enums.EnrollmentStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_enrollments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"course_id", "student_id"})
})
@JsonIgnoreProperties(ignoreUnknown = true)
public class CourseEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", insertable = false, updatable = false)
    private Course course;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private User student;

    private LocalDateTime enrolledAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    private Double progressPercentage = 0.0;

    private LocalDateTime completedAt;

    public CourseEnrollment() {
    }

    public CourseEnrollment(Long id, Long courseId, Long studentId, LocalDateTime enrolledAt,
                            EnrollmentStatus status, Double progressPercentage) {
        this.id = id;
        this.courseId = courseId;
        this.studentId = studentId;
        this.enrolledAt = enrolledAt;
        this.status = status != null ? status : EnrollmentStatus.ACTIVE;
        this.progressPercentage = progressPercentage != null ? progressPercentage : 0.0;
    }

    @PrePersist
    protected void onCreate() {
        if (this.enrolledAt == null) {
            this.enrolledAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = EnrollmentStatus.ACTIVE;
        }
        if (this.progressPercentage == null) {
            this.progressPercentage = 0.0;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
        if (course != null) {
            this.courseId = course.getId();
        }
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
        if (student != null) {
            this.studentId = student.getId();
        }
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(LocalDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public EnrollmentStatus getStatus() {
        return status;
    }

    public void setStatus(EnrollmentStatus status) {
        this.status = status;
    }

    public Double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
