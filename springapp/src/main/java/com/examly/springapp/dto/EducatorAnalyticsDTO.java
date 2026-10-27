package com.examly.springapp.dto;

import java.util.ArrayList;
import java.util.List;

public class EducatorAnalyticsDTO {

    private Integer totalStudents = 0;
    private Integer totalAttempts = 0;
    private Double averageScore = 0.0;
    private Double averagePercentage = 0.0;
    private Double highestScore = 0.0;
    private Double lowestScore = 0.0;
    private Double completionRate = 0.0;
    private Double courseCompletionRate = 0.0;

    private List<StudentPerformanceItem> studentPerformance = new ArrayList<>();
    private List<QuizPerformanceItem> quizPerformance = new ArrayList<>();
    private List<CoursePerformanceItem> coursePerformance = new ArrayList<>();
    private List<TrendPointItem> performanceTrends = new ArrayList<>();

    public EducatorAnalyticsDTO() {
    }

    public static class StudentPerformanceItem {
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private Integer attempts = 0;
        private Double averageScore = 0.0;
        private Double averagePercentage = 0.0;
        private Double highestScore = 0.0;
        private String lastActive;

        public StudentPerformanceItem() {}

        public StudentPerformanceItem(Long studentId, String studentName, String studentEmail,
                                     Integer attempts, Double averageScore, Double averagePercentage,
                                     Double highestScore, String lastActive) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.studentEmail = studentEmail;
            this.attempts = attempts;
            this.averageScore = averageScore;
            this.averagePercentage = averagePercentage;
            this.highestScore = highestScore;
            this.lastActive = lastActive;
        }

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public String getStudentEmail() { return studentEmail; }
        public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
        public Integer getAttempts() { return attempts; }
        public void setAttempts(Integer attempts) { this.attempts = attempts; }
        public Double getAverageScore() { return averageScore; }
        public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
        public Double getAveragePercentage() { return averagePercentage; }
        public void setAveragePercentage(Double averagePercentage) { this.averagePercentage = averagePercentage; }
        public Double getHighestScore() { return highestScore; }
        public void setHighestScore(Double highestScore) { this.highestScore = highestScore; }
        public String getLastActive() { return lastActive; }
        public void setLastActive(String lastActive) { this.lastActive = lastActive; }
    }

    public static class QuizPerformanceItem {
        private Long quizId;
        private String quizTitle;
        private String category;
        private Integer attempts = 0;
        private Double averageScore = 0.0;
        private Double averagePercentage = 0.0;
        private Double passRate = 0.0;

        public QuizPerformanceItem() {}

        public QuizPerformanceItem(Long quizId, String quizTitle, String category,
                                   Integer attempts, Double averageScore, Double averagePercentage, Double passRate) {
            this.quizId = quizId;
            this.quizTitle = quizTitle;
            this.category = category;
            this.attempts = attempts;
            this.averageScore = averageScore;
            this.averagePercentage = averagePercentage;
            this.passRate = passRate;
        }

        public Long getQuizId() { return quizId; }
        public void setQuizId(Long quizId) { this.quizId = quizId; }
        public String getQuizTitle() { return quizTitle; }
        public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Integer getAttempts() { return attempts; }
        public void setAttempts(Integer attempts) { this.attempts = attempts; }
        public Double getAverageScore() { return averageScore; }
        public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
        public Double getAveragePercentage() { return averagePercentage; }
        public void setAveragePercentage(Double averagePercentage) { this.averagePercentage = averagePercentage; }
        public Double getPassRate() { return passRate; }
        public void setPassRate(Double passRate) { this.passRate = passRate; }
    }

    public static class CoursePerformanceItem {
        private Long courseId;
        private String courseTitle;
        private Integer enrolledStudents = 0;
        private Integer completedStudents = 0;
        private Double completionRate = 0.0;
        private Double averageScore = 0.0;
        private Integer quizzesCount = 0;

        public CoursePerformanceItem() {}

        public CoursePerformanceItem(Long courseId, String courseTitle, Integer enrolledStudents,
                                     Integer completedStudents, Double completionRate, Double averageScore, Integer quizzesCount) {
            this.courseId = courseId;
            this.courseTitle = courseTitle;
            this.enrolledStudents = enrolledStudents;
            this.completedStudents = completedStudents;
            this.completionRate = completionRate;
            this.averageScore = averageScore;
            this.quizzesCount = quizzesCount;
        }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }
        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
        public Integer getEnrolledStudents() { return enrolledStudents; }
        public void setEnrolledStudents(Integer enrolledStudents) { this.enrolledStudents = enrolledStudents; }
        public Integer getCompletedStudents() { return completedStudents; }
        public void setCompletedStudents(Integer completedStudents) { this.completedStudents = completedStudents; }
        public Double getCompletionRate() { return completionRate; }
        public void setCompletionRate(Double completionRate) { this.completionRate = completionRate; }
        public Double getAverageScore() { return averageScore; }
        public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
        public Integer getQuizzesCount() { return quizzesCount; }
        public void setQuizzesCount(Integer quizzesCount) { this.quizzesCount = quizzesCount; }
    }

    public static class TrendPointItem {
        private String label;
        private String date;
        private Double averageScore = 0.0;
        private Integer attemptsCount = 0;

        public TrendPointItem() {}

        public TrendPointItem(String label, String date, Double averageScore, Integer attemptsCount) {
            this.label = label;
            this.date = date;
            this.averageScore = averageScore;
            this.attemptsCount = attemptsCount;
        }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public Double getAverageScore() { return averageScore; }
        public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
        public Integer getAttemptsCount() { return attemptsCount; }
        public void setAttemptsCount(Integer attemptsCount) { this.attemptsCount = attemptsCount; }
    }

    public Integer getTotalStudents() { return totalStudents; }
    public void setTotalStudents(Integer totalStudents) { this.totalStudents = totalStudents; }
    public Integer getTotalAttempts() { return totalAttempts; }
    public void setTotalAttempts(Integer totalAttempts) { this.totalAttempts = totalAttempts; }
    public Double getAverageScore() { return averageScore; }
    public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
    public Double getAveragePercentage() { return averagePercentage; }
    public void setAveragePercentage(Double averagePercentage) { this.averagePercentage = averagePercentage; }
    public Double getHighestScore() { return highestScore; }
    public void setHighestScore(Double highestScore) { this.highestScore = highestScore; }
    public Double getLowestScore() { return lowestScore; }
    public void setLowestScore(Double lowestScore) { this.lowestScore = lowestScore; }
    public Double getCompletionRate() { return completionRate; }
    public void setCompletionRate(Double completionRate) { this.completionRate = completionRate; }
    public Double getCourseCompletionRate() { return courseCompletionRate; }
    public void setCourseCompletionRate(Double courseCompletionRate) { this.courseCompletionRate = courseCompletionRate; }
    public List<StudentPerformanceItem> getStudentPerformance() { return studentPerformance; }
    public void setStudentPerformance(List<StudentPerformanceItem> studentPerformance) { this.studentPerformance = studentPerformance; }
    public List<QuizPerformanceItem> getQuizPerformance() { return quizPerformance; }
    public void setQuizPerformance(List<QuizPerformanceItem> quizPerformance) { this.quizPerformance = quizPerformance; }
    public List<CoursePerformanceItem> getCoursePerformance() { return coursePerformance; }
    public void setCoursePerformance(List<CoursePerformanceItem> coursePerformance) { this.coursePerformance = coursePerformance; }
    public List<TrendPointItem> getPerformanceTrends() { return performanceTrends; }
    public void setPerformanceTrends(List<TrendPointItem> performanceTrends) { this.performanceTrends = performanceTrends; }
}
