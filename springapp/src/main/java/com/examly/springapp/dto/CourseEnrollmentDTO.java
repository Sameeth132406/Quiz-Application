package com.examly.springapp.dto;

import com.examly.springapp.enums.EnrollmentStatus;
import java.time.LocalDateTime;

public class CourseEnrollmentDTO {

    private Long id;
    private Long courseId;
    private String courseTitle;
    private String courseThumbnailUrl;
    private Long studentId;
    private String studentUsername;
    private String studentEmail;
    private LocalDateTime enrolledAt;
    private EnrollmentStatus status;
    private Double progressPercentage;
    private LocalDateTime completedAt;
    private CourseDTO course;

    public CourseEnrollmentDTO() {
    }

    public CourseEnrollmentDTO(Long id, Long courseId, Long studentId, LocalDateTime enrolledAt,
                               EnrollmentStatus status, Double progressPercentage) {
        this.id = id;
        this.courseId = courseId;
        this.studentId = studentId;
        this.enrolledAt = enrolledAt;
        this.status = status;
        this.progressPercentage = progressPercentage;
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

    public String getCourseTitle() {
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }

    public String getCourseThumbnailUrl() {
        return courseThumbnailUrl;
    }

    public void setCourseThumbnailUrl(String courseThumbnailUrl) {
        this.courseThumbnailUrl = courseThumbnailUrl;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentUsername() {
        return studentUsername;
    }

    public void setStudentUsername(String studentUsername) {
        this.studentUsername = studentUsername;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
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

    public CourseDTO getCourse() {
        return course;
    }

    public void setCourse(CourseDTO course) {
        this.course = course;
    }
}
