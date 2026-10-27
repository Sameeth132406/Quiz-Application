package com.examly.springapp.dto;

import java.util.ArrayList;
import java.util.List;

public class QuizAnalyticsDTO {

    private Long quizId;
    private String quizTitle;
    private String category;
    private String difficulty;
    private Integer duration;
    private Integer totalQuestions = 0;
    private Integer totalAttempts = 0;
    private Integer uniqueStudents = 0;
    private Double averageScore = 0.0;
    private Double averagePercentage = 0.0;
    private Double highestScore = 0.0;
    private Double lowestScore = 0.0;
    private Double passRate = 0.0;
    private Boolean resultsPublished;

    private List<QuizAttemptItem> attemptDetails = new ArrayList<>();

    public QuizAnalyticsDTO() {
    }

    public static class QuizAttemptItem {
        private Long attemptId;
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private Double score;
        private Integer totalMarks;
        private Double percentage;
        private String status;
        private Integer tabSwitches;
        private String completedAt;

        public QuizAttemptItem() {}

        public QuizAttemptItem(Long attemptId, Long studentId, String studentName, String studentEmail,
                               Double score, Integer totalMarks, Double percentage, String status,
                               Integer tabSwitches, String completedAt) {
            this.attemptId = attemptId;
            this.studentId = studentId;
            this.studentName = studentName;
            this.studentEmail = studentEmail;
            this.score = score;
            this.totalMarks = totalMarks;
            this.percentage = percentage;
            this.status = status;
            this.tabSwitches = tabSwitches;
            this.completedAt = completedAt;
        }

        public Long getAttemptId() { return attemptId; }
        public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }
        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public String getStudentEmail() { return studentEmail; }
        public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        public Integer getTotalMarks() { return totalMarks; }
        public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Integer getTabSwitches() { return tabSwitches; }
        public void setTabSwitches(Integer tabSwitches) { this.tabSwitches = tabSwitches; }
        public String getCompletedAt() { return completedAt; }
        public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
    }

    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }
    public String getQuizTitle() { return quizTitle; }
    public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
    public Integer getTotalAttempts() { return totalAttempts; }
    public void setTotalAttempts(Integer totalAttempts) { this.totalAttempts = totalAttempts; }
    public Integer getUniqueStudents() { return uniqueStudents; }
    public void setUniqueStudents(Integer uniqueStudents) { this.uniqueStudents = uniqueStudents; }
    public Double getAverageScore() { return averageScore; }
    public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
    public Double getAveragePercentage() { return averagePercentage; }
    public void setAveragePercentage(Double averagePercentage) { this.averagePercentage = averagePercentage; }
    public Double getHighestScore() { return highestScore; }
    public void setHighestScore(Double highestScore) { this.highestScore = highestScore; }
    public Double getLowestScore() { return lowestScore; }
    public void setLowestScore(Double lowestScore) { this.lowestScore = lowestScore; }
    public Double getPassRate() { return passRate; }
    public void setPassRate(Double passRate) { this.passRate = passRate; }
    public Boolean getResultsPublished() { return resultsPublished; }
    public void setResultsPublished(Boolean resultsPublished) { this.resultsPublished = resultsPublished; }
    public List<QuizAttemptItem> getAttemptDetails() { return attemptDetails; }
    public void setAttemptDetails(List<QuizAttemptItem> attemptDetails) { this.attemptDetails = attemptDetails; }
}
