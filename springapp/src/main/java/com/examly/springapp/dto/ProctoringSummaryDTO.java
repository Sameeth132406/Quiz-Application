package com.examly.springapp.dto;

import com.examly.springapp.model.IntegrityEvent;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ProctoringSummaryDTO {

    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Long userId;
    private String studentName;
    private String studentEmail;
    private Integer score;
    private Integer totalMarks;
    private Integer percentage;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Long durationSeconds;

    // Integrity Breakdown
    private Integer integrityScore = 100;
    private Integer tabSwitches = 0;
    private Integer fullscreenExits = 0;
    private Integer screenShareInterrupts = 0;
    private Integer totalScreenshots = 0;

    private List<IntegrityEvent> integrityEvents = new ArrayList<>();
    private List<ProctoringScreenshotDTO> screenshots = new ArrayList<>();

    public ProctoringSummaryDTO() {
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public Integer getPercentage() {
        return percentage;
    }

    public void setPercentage(Integer percentage) {
        this.percentage = percentage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Long getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Long durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public Integer getIntegrityScore() {
        return integrityScore;
    }

    public void setIntegrityScore(Integer integrityScore) {
        this.integrityScore = integrityScore;
    }

    public Integer getTabSwitches() {
        return tabSwitches;
    }

    public void setTabSwitches(Integer tabSwitches) {
        this.tabSwitches = tabSwitches;
    }

    public Integer getFullscreenExits() {
        return fullscreenExits;
    }

    public void setFullscreenExits(Integer fullscreenExits) {
        this.fullscreenExits = fullscreenExits;
    }

    public Integer getScreenShareInterrupts() {
        return screenShareInterrupts;
    }

    public void setScreenShareInterrupts(Integer screenShareInterrupts) {
        this.screenShareInterrupts = screenShareInterrupts;
    }

    public Integer getTotalScreenshots() {
        return totalScreenshots;
    }

    public void setTotalScreenshots(Integer totalScreenshots) {
        this.totalScreenshots = totalScreenshots;
    }

    public List<IntegrityEvent> getIntegrityEvents() {
        return integrityEvents;
    }

    public void setIntegrityEvents(List<IntegrityEvent> integrityEvents) {
        this.integrityEvents = integrityEvents;
    }

    public List<ProctoringScreenshotDTO> getScreenshots() {
        return screenshots;
    }

    public void setScreenshots(List<ProctoringScreenshotDTO> screenshots) {
        this.screenshots = screenshots;
    }
}
