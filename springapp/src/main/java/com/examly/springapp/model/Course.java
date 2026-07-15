package com.examly.springapp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String courseCode;

    @Column(nullable = false)
    private String courseName;

    private String description;

    private String instructor;

    public Course() {
    }

    public Course(Long id, String courseCode, String courseName,
                  String description, String instructor) {
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