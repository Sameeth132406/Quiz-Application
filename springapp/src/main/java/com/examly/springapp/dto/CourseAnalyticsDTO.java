package com.examly.springapp.dto;

import java.util.ArrayList;
import java.util.List;

public class CourseAnalyticsDTO {

    private Long courseId;
    private String courseTitle;
    private String category;
    private String difficulty;
    private Long educatorId;
    private String educatorName;

    // Course Overall Stats
    private Integer totalEnrolledStudents = 0;
    private Integer activeStudents = 0;
    private Integer completedStudents = 0;
    private Double courseCompletionPercentage = 0.0;
    private Double averageCourseScore = 0.0;
    private Double highestCourseScore = 0.0;
    private Double lowestCourseScore = 0.0;
    private Integer totalQuizzes = 0;
    private Integer totalQuizAttempts = 0;
    private Double averageQuizScore = 0.0;
    private Double quizCompletionRate = 0.0;

    // Student-specific Course Stats (when requested for a student)
    private Long studentId;
    private String studentName;
    private Double studentProgress = 0.0;
    private Integer studentCompletedModules = 0;
    private Integer studentTotalModules = 0;
    private Integer studentCompletedContent = 0;
    private Integer studentTotalContent = 0;
    private Integer studentQuizzesAttempted = 0;
    private Double studentAverageScore = 0.0;
    private Double studentHighestScore = 0.0;
    private Double studentLowestScore = 0.0;
    private Integer studentRankInCourse = null;

    private List<CourseQuizPerformanceItem> quizPerformance = new ArrayList<>();
    private List<CourseLeaderboardEntryItem> courseLeaderboard = new ArrayList<>();
    private List<String> courseAchievements = new ArrayList<>();

    public CourseAnalyticsDTO() {
    }

    public static class CourseQuizPerformanceItem {
        private Long quizId;
        private String quizTitle;
        private Double score;
        private Integer totalMarks;
        private Double percentage;
        private String status; // Completed, Pending
        private String completedAt;

        public CourseQuizPerformanceItem() {}

        public CourseQuizPerformanceItem(Long quizId, String quizTitle, Double score,
                                         Integer totalMarks, Double percentage, String status, String completedAt) {
            this.quizId = quizId;
            this.quizTitle = quizTitle;
            this.score = score;
            this.totalMarks = totalMarks;
            this.percentage = percentage;
            this.status = status;
            this.completedAt = completedAt;
        }

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
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCompletedAt() { return completedAt; }
        public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
    }

    public static class CourseLeaderboardEntryItem {
        private Integer rank;
        private Long studentId;
        private String studentName;
        private Double score;
        private Double percentage;
        private Boolean isCurrentStudent;

        public CourseLeaderboardEntryItem() {}

        public CourseLeaderboardEntryItem(Integer rank, Long studentId, String studentName,
                                          Double score, Double percentage, Boolean isCurrentStudent) {
            this.rank = rank;
            this.studentId = studentId;
            this.studentName = studentName;
            this.score = score;
            this.percentage = percentage;
            this.isCurrentStudent = isCurrentStudent;
        }

        public Integer getRank() { return rank; }
        public void setRank(Integer rank) { this.rank = rank; }
        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
        public Boolean getIsCurrentStudent() { return isCurrentStudent; }
        public void setIsCurrentStudent(Boolean isCurrentStudent) { this.isCurrentStudent = isCurrentStudent; }
    }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public Long getEducatorId() { return educatorId; }
    public void setEducatorId(Long educatorId) { this.educatorId = educatorId; }
    public String getEducatorName() { return educatorName; }
    public void setEducatorName(String educatorName) { this.educatorName = educatorName; }
    public Integer getTotalEnrolledStudents() { return totalEnrolledStudents; }
    public void setTotalEnrolledStudents(Integer totalEnrolledStudents) { this.totalEnrolledStudents = totalEnrolledStudents; }
    public Integer getActiveStudents() { return activeStudents; }
    public void setActiveStudents(Integer activeStudents) { this.activeStudents = activeStudents; }
    public Integer getCompletedStudents() { return completedStudents; }
    public void setCompletedStudents(Integer completedStudents) { this.completedStudents = completedStudents; }
    public Double getCourseCompletionPercentage() { return courseCompletionPercentage; }
    public void setCourseCompletionPercentage(Double courseCompletionPercentage) { this.courseCompletionPercentage = courseCompletionPercentage; }
    public Double getAverageCourseScore() { return averageCourseScore; }
    public void setAverageCourseScore(Double averageCourseScore) { this.averageCourseScore = averageCourseScore; }
    public Double getHighestCourseScore() { return highestCourseScore; }
    public void setHighestCourseScore(Double highestCourseScore) { this.highestCourseScore = highestCourseScore; }
    public Double getLowestCourseScore() { return lowestCourseScore; }
    public void setLowestCourseScore(Double lowestCourseScore) { this.lowestCourseScore = lowestCourseScore; }
    public Integer getTotalQuizzes() { return totalQuizzes; }
    public void setTotalQuizzes(Integer totalQuizzes) { this.totalQuizzes = totalQuizzes; }
    public Integer getTotalQuizAttempts() { return totalQuizAttempts; }
    public void setTotalQuizAttempts(Integer totalQuizAttempts) { this.totalQuizAttempts = totalQuizAttempts; }
    public Double getAverageQuizScore() { return averageQuizScore; }
    public void setAverageQuizScore(Double averageQuizScore) { this.averageQuizScore = averageQuizScore; }
    public Double getQuizCompletionRate() { return quizCompletionRate; }
    public void setQuizCompletionRate(Double quizCompletionRate) { this.quizCompletionRate = quizCompletionRate; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Double getStudentProgress() { return studentProgress; }
    public void setStudentProgress(Double studentProgress) { this.studentProgress = studentProgress; }
    public Integer getStudentCompletedModules() { return studentCompletedModules; }
    public void setStudentCompletedModules(Integer studentCompletedModules) { this.studentCompletedModules = studentCompletedModules; }
    public Integer getStudentTotalModules() { return studentTotalModules; }
    public void setStudentTotalModules(Integer studentTotalModules) { this.studentTotalModules = studentTotalModules; }
    public Integer getStudentCompletedContent() { return studentCompletedContent; }
    public void setStudentCompletedContent(Integer studentCompletedContent) { this.studentCompletedContent = studentCompletedContent; }
    public Integer getStudentTotalContent() { return studentTotalContent; }
    public void setStudentTotalContent(Integer studentTotalContent) { this.studentTotalContent = studentTotalContent; }
    public Integer getStudentQuizzesAttempted() { return studentQuizzesAttempted; }
    public void setStudentQuizzesAttempted(Integer studentQuizzesAttempted) { this.studentQuizzesAttempted = studentQuizzesAttempted; }
    public Double getStudentAverageScore() { return studentAverageScore; }
    public void setStudentAverageScore(Double studentAverageScore) { this.studentAverageScore = studentAverageScore; }
    public Double getStudentHighestScore() { return studentHighestScore; }
    public void setStudentHighestScore(Double studentHighestScore) { this.studentHighestScore = studentHighestScore; }
    public Double getStudentLowestScore() { return studentLowestScore; }
    public void setStudentLowestScore(Double studentLowestScore) { this.studentLowestScore = studentLowestScore; }
    public Integer getStudentRankInCourse() { return studentRankInCourse; }
    public void setStudentRankInCourse(Integer studentRankInCourse) { this.studentRankInCourse = studentRankInCourse; }
    public List<CourseQuizPerformanceItem> getQuizPerformance() { return quizPerformance; }
    public void setQuizPerformance(List<CourseQuizPerformanceItem> quizPerformance) { this.quizPerformance = quizPerformance; }
    public List<CourseLeaderboardEntryItem> getCourseLeaderboard() { return courseLeaderboard; }
    public void setCourseLeaderboard(List<CourseLeaderboardEntryItem> courseLeaderboard) { this.courseLeaderboard = courseLeaderboard; }
    public List<String> getCourseAchievements() { return courseAchievements; }
    public void setCourseAchievements(List<String> courseAchievements) { this.courseAchievements = courseAchievements; }
}
