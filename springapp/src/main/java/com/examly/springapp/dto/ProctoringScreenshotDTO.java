package com.examly.springapp.dto;

import java.time.LocalDateTime;

public class ProctoringScreenshotDTO {

    private Long id;
    private Long attemptId;
    private Integer sequenceNumber;
    private LocalDateTime capturedAt;
    private String mimeType;
    private Long fileSize;
    private String viewUrl;
    private LocalDateTime createdAt;

    public ProctoringScreenshotDTO() {
    }

    public ProctoringScreenshotDTO(Long id, Long attemptId, Integer sequenceNumber,
                                   LocalDateTime capturedAt, String mimeType,
                                   Long fileSize, String viewUrl, LocalDateTime createdAt) {
        this.id = id;
        this.attemptId = attemptId;
        this.sequenceNumber = sequenceNumber;
        this.capturedAt = capturedAt;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.viewUrl = viewUrl;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public Integer getSequenceNumber() {
        return sequenceNumber;
    }

    public void setSequenceNumber(Integer sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }

    public LocalDateTime getCapturedAt() {
        return capturedAt;
    }

    public void setCapturedAt(LocalDateTime capturedAt) {
        this.capturedAt = capturedAt;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getViewUrl() {
        return viewUrl;
    }

    public void setViewUrl(String viewUrl) {
        this.viewUrl = viewUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
