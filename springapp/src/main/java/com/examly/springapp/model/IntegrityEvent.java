package com.examly.springapp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "integrity_events")
public class IntegrityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long quizAttemptId;

    private String eventType;

    private String eventTime;

    private String remarks;

    public IntegrityEvent() {
    }

    public IntegrityEvent(Long id,
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