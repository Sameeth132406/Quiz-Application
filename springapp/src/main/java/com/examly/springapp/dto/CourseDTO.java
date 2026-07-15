package com.examly.springapp.dto;

public class CourseDTO {

    private Long id;
    private String courseCode;
    private String courseName;
    private String description;
    private String instructor;

    public CourseDTO() {
    }

    public CourseDTO(Long id,
                     String courseCode,
                     String courseName,
                     String description,
                     String instructor) {
        this.id = id;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.description = description;
        this.instructor = instructor;
    }

    public Long getId() {
        return id;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public String getDescription() {
        return description;
    }

    public String getInstructor() {
        return instructor;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }
}