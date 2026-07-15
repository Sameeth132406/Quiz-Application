package com.examly.springapp.dto;

public class IntegrityEventDTO {

    private Long id;
    private Long userId;
    private Long quizAttemptId;
    private String eventType;
    private String eventTime;
    private String remarks;

    public IntegrityEventDTO() {
    }

    public IntegrityEventDTO(Long id,
                             Long userId,
                             Long quizAttemptId,
                             String eventType,
                             String eventTime,
                             String remarks) {

        this.id = id;
        this.userId = userId;
        this.quizAttemptId = quizAttemptId;
        this.eventType = eventType;
        this.eventTime = eventTime;
        this.remarks = remarks;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getQuizAttemptId() {
        return quizAttemptId;
    }

    public String getEventType() {
        return eventType;
    }

    public String getEventTime() {
        return eventTime;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setQuizAttemptId(Long quizAttemptId) {
        this.quizAttemptId = quizAttemptId;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public void setEventTime(String eventTime) {
        this.eventTime = eventTime;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}