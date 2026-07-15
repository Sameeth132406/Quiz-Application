package com.examly.springapp.dto;

public class EnrollmentDTO {

    private Long id;
    private Long userId;
    private Long courseId;
    private String enrollmentDate;
    private String status;

    public EnrollmentDTO() {
    }

    public EnrollmentDTO(Long id,
                         Long userId,
                         Long courseId,
                         String enrollmentDate,
                         String status) {
        this.id = id;
        this.userId = userId;
        this.courseId = courseId;
        this.enrollmentDate = enrollmentDate;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getEnrollmentDate() {
        return enrollmentDate;
    }

    public String getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public void setEnrollmentDate(String enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}