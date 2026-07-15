package com.examly.springapp.dto;

public class GradebookDTO {

    private Long id;
    private Long userId;
    private Long courseId;
    private Long quizId;
    private Integer marksObtained;
    private Integer totalMarks;
    private String grade;

    public GradebookDTO() {
    }

    public GradebookDTO(Long id,
                        Long userId,
                        Long courseId,
                        Long quizId,
                        Integer marksObtained,
                        Integer totalMarks,
                        String grade) {
        this.id = id;
        this.userId = userId;
        this.courseId = courseId;
        this.quizId = quizId;
        this.marksObtained = marksObtained;
        this.totalMarks = totalMarks;
        this.grade = grade;
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

    public Long getQuizId() {
        return quizId;
    }

    public Integer getMarksObtained() {
        return marksObtained;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public String getGrade() {
        return grade;
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

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public void setMarksObtained(Integer marksObtained) {
        this.marksObtained = marksObtained;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }
}