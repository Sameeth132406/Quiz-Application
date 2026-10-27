package com.examly.springapp.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class StudentAnalyticsDTO {

    private Long studentId;
    private String studentName;
    private Integer totalAttempts = 0;
    private Double averageScore = 0.0;
    private Double averagePercentage = 0.0;
    private Double highestScore = 0.0;
    private Double lowestScore = 0.0;
    private Integer passedAssessments = 0;
    private Double passRate = 0.0;
    private Integer coursesEnrolledCount = 0;
    private Integer coursesCompletedCount = 0;
    private Integer badgesEarnedCount = 0;

    private Map<String, Integer> scoreDistribution = new HashMap<>();
    private List<ScoreProgressionPoint> scoreProgression = new ArrayList<>();
    private List<StudentCourseItem> enrolledCourses = new ArrayList<>();
    private List<StudentAttemptItem> assessmentHistory = new ArrayList<>();
    private List<QuizPerformanceBreakdown> quizBreakdowns = new ArrayList<>();
    private List<StudentBadgeDTO> earnedBadges = new ArrayList<>();

    public StudentAnalyticsDTO() {
        scoreDistribution.put("mastery", 0);
        scoreDistribution.put("proficient", 0);
        scoreDistribution.put("passing", 0);
        scoreDistribution.put("needsReview", 0);
    }

    public static class ScoreProgressionPoint {
        private String date;
        private String quizTitle;
        private Double score;
        private Double percentage;
        private Boolean passed;

        public ScoreProgressionPoint() {}

        public ScoreProgressionPoint(String date, String quizTitle, Double score, Double percentage, Boolean passed) {
            this.date = date;
            this.quizTitle = quizTitle;
            this.score = score;
            this.percentage = percentage;
            this.passed = passed;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getQuizTitle() { return quizTitle; }
        public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }
        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
        public Boolean getPassed() { return passed; }
        public void setPassed(Boolean passed) { this.passed = passed; }
    }

    public static class StudentCourseItem {
        private Long courseId;
        private String courseTitle;
        private Double progressPercentage = 0.0;
        private Integer modulesCompleted = 0;
        private Integer totalModules = 0;
        private Integer quizzesAttempted = 0;
        private Double averageQuizScore = 0.0;
        private String status;

        public StudentCourseItem() {}

        public StudentCourseItem(Long courseId, String courseTitle, Double progressPercentage,
                                 Integer modulesCompleted, Integer totalModules, Integer quizzesAttempted,
                                 Double averageQuizScore, String status) {
            this.courseId = courseId;
            this.courseTitle = courseTitle;
            this.progressPercentage = progressPercentage;
            this.modulesCompleted = modulesCompleted;
            this.totalModules = totalModules;
            this.quizzesAttempted = quizzesAttempted;
            this.averageQuizScore = averageQuizScore;
            this.status = status;
        }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }
        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
        public Double getProgressPercentage() { return progressPercentage; }
        public void setProgressPercentage(Double progressPercentage) { this.progressPercentage = progressPercentage; }
        public Integer getModulesCompleted() { return modulesCompleted; }
        public void setModulesCompleted(Integer modulesCompleted) { this.modulesCompleted = modulesCompleted; }
        public Integer getTotalModules() { return totalModules; }
        public void setTotalModules(Integer totalModules) { this.totalModules = totalModules; }
        public Integer getQuizzesAttempted() { return quizzesAttempted; }
        public void setQuizzesAttempted(Integer quizzesAttempted) { this.quizzesAttempted = quizzesAttempted; }
        public Double getAverageQuizScore() { return averageQuizScore; }
        public void setAverageQuizScore(Double averageQuizScore) { this.averageQuizScore = averageQuizScore; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class StudentAttemptItem {
        private Long attemptId;
        private Long quizId;
        private String quizTitle;
        private Double score;
        private Integer totalMarks;
        private Double percentage;
        private String grade;
        private String status;
        private String completedAt;
        private Boolean resultsPublished;

        public StudentAttemptItem() {}

        public StudentAttemptItem(Long attemptId, Long quizId, String quizTitle, Double score,
                                  Integer totalMarks, Double percentage, String grade, String status,
                                  String completedAt, Boolean resultsPublished) {
            this.attemptId = attemptId;
            this.quizId = quizId;
            this.quizTitle = quizTitle;
            this.score = score;
            this.totalMarks = totalMarks;
            this.percentage = percentage;
            this.grade = grade;
            this.status = status;
            this.completedAt = completedAt;
            this.resultsPublished = resultsPublished;
        }

        public Long getAttemptId() { return attemptId; }
        public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }
        public Long getQuizId() { return quizId; }
        public void setQuizId(Long quizId) { this.quizId = quizId; }
        public String getQuizTitle() { return quizTitle; }
        public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }
        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        public Integer getTotalMarks() { return totalMarks; }
        public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
        public String getGrade() { return grade; }
        public void setGrade(String grade) { this.grade = grade; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCompletedAt() { return completedAt; }
        public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
        public Boolean getResultsPublished() { return resultsPublished; }
        public void setResultsPublished(Boolean resultsPublished) { this.resultsPublished = resultsPublished; }
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
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
    public Integer getPassedAssessments() { return passedAssessments; }
    public void setPassedAssessments(Integer passedAssessments) { this.passedAssessments = passedAssessments; }
    public Double getPassRate() { return passRate; }
    public void setPassRate(Double passRate) { this.passRate = passRate; }
    public Integer getCoursesEnrolledCount() { return coursesEnrolledCount; }
    public void setCoursesEnrolledCount(Integer coursesEnrolledCount) { this.coursesEnrolledCount = coursesEnrolledCount; }
    public Integer getCoursesCompletedCount() { return coursesCompletedCount; }
    public void setCoursesCompletedCount(Integer coursesCompletedCount) { this.coursesCompletedCount = coursesCompletedCount; }
    public Integer getBadgesEarnedCount() { return badgesEarnedCount; }
    public void setBadgesEarnedCount(Integer badgesEarnedCount) { this.badgesEarnedCount = badgesEarnedCount; }
    public Map<String, Integer> getScoreDistribution() { return scoreDistribution; }
    public void setScoreDistribution(Map<String, Integer> scoreDistribution) { this.scoreDistribution = scoreDistribution; }
    public List<ScoreProgressionPoint> getScoreProgression() { return scoreProgression; }
    public void setScoreProgression(List<ScoreProgressionPoint> scoreProgression) { this.scoreProgression = scoreProgression; }
    public List<StudentCourseItem> getEnrolledCourses() { return enrolledCourses; }
    public void setEnrolledCourses(List<StudentCourseItem> enrolledCourses) { this.enrolledCourses = enrolledCourses; }
    public List<StudentAttemptItem> getAssessmentHistory() { return assessmentHistory; }
    public void setAssessmentHistory(List<StudentAttemptItem> assessmentHistory) { this.assessmentHistory = assessmentHistory; }

    public List<QuizPerformanceBreakdown> getQuizBreakdowns() { return quizBreakdowns; }
    public void setQuizBreakdowns(List<QuizPerformanceBreakdown> quizBreakdowns) { this.quizBreakdowns = quizBreakdowns; }

    public List<StudentBadgeDTO> getEarnedBadges() { return earnedBadges; }
    public void setEarnedBadges(List<StudentBadgeDTO> earnedBadges) { this.earnedBadges = earnedBadges; }

    public static class QuizPerformanceBreakdown {
        private Long quizId;
        private String quizTitle;
        private String category;
        private Integer attemptsCount = 0;
        private Double bestScore = 0.0;
        private Double averageScore = 0.0;
        private Double bestPercentage = 0.0;
        private Boolean passed = false;
        private String lastAttemptedAt;

        public QuizPerformanceBreakdown() {}

        public QuizPerformanceBreakdown(Long quizId, String quizTitle, String category, Integer attemptsCount,
                                      Double bestScore, Double averageScore, Double bestPercentage, Boolean passed, String lastAttemptedAt) {
            this.quizId = quizId;
            this.quizTitle = quizTitle;
            this.category = category;
            this.attemptsCount = attemptsCount;
            this.bestScore = bestScore;
            this.averageScore = averageScore;
            this.bestPercentage = bestPercentage;
            this.passed = passed;
            this.lastAttemptedAt = lastAttemptedAt;
        }

        public Long getQuizId() { return quizId; }
        public void setQuizId(Long quizId) { this.quizId = quizId; }
        public String getQuizTitle() { return quizTitle; }
        public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Integer getAttemptsCount() { return attemptsCount; }
        public void setAttemptsCount(Integer attemptsCount) { this.attemptsCount = attemptsCount; }
        public Double getBestScore() { return bestScore; }
        public void setBestScore(Double bestScore) { this.bestScore = bestScore; }
        public Double getAverageScore() { return averageScore; }
        public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
        public Double getBestPercentage() { return bestPercentage; }
        public void setBestPercentage(Double bestPercentage) { this.bestPercentage = bestPercentage; }
        public Boolean getPassed() { return passed; }
        public void setPassed(Boolean passed) { this.passed = passed; }
        public String getLastAttemptedAt() { return lastAttemptedAt; }
        public void setLastAttemptedAt(String lastAttemptedAt) { this.lastAttemptedAt = lastAttemptedAt; }
    }
}
