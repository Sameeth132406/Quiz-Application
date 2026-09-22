package com.examly.springapp.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class QuizSubmissionDTO {

    private Long userId;
    private Map<Long, String> answers;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer tabSwitches;

    public QuizSubmissionDTO() {
    }

    public QuizSubmissionDTO(Long userId,
                             Map<Long, String> answers,
                             LocalDateTime startedAt,
                             LocalDateTime completedAt,
                             Integer tabSwitches) {
        this.userId = userId;
        this.answers = answers;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.tabSwitches = tabSwitches;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Map<Long, String> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<Long, String> answers) {
        this.answers = answers;
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

    public Integer getTabSwitches() {
        return tabSwitches;
    }

    public void setTabSwitches(Integer tabSwitches) {
        this.tabSwitches = tabSwitches;
    }
}
