package com.examly.springapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "proctoring_screenshots", indexes = {
        @Index(name = "idx_screenshot_attempt", columnList = "attempt_id"),
        @Index(name = "idx_screenshot_seq", columnList = "attempt_id, sequence_number")
})
public class ProctoringScreenshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "attempt_id", nullable = false)
    private Long attemptId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", insertable = false, updatable = false)
    @JsonIgnore
    private QuizAttempt quizAttempt;

    @Column(name = "captured_at")
    private LocalDateTime capturedAt;

    @Lob
    @Column(name = "image_data", columnDefinition = "LONGBLOB")
    @JsonIgnore
    private byte[] imageData;

    @Column(name = "storage_path", length = 512)
    private String storagePath;

    @Column(name = "mime_type", length = 64)
    private String mimeType = "image/jpeg";

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "sequence_number")
    private Integer sequenceNumber = 1;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public ProctoringScreenshot() {
    }

    public ProctoringScreenshot(Long attemptId, Integer sequenceNumber, LocalDateTime capturedAt,
                                byte[] imageData, String storagePath, String mimeType, Long fileSize) {
        this.attemptId = attemptId;
        this.sequenceNumber = sequenceNumber;
        this.capturedAt = capturedAt;
        this.imageData = imageData;
        this.storagePath = storagePath;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.createdAt = LocalDateTime.now();
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

    public QuizAttempt getQuizAttempt() {
        return quizAttempt;
    }

    public void setQuizAttempt(QuizAttempt quizAttempt) {
        this.quizAttempt = quizAttempt;
    }

    public LocalDateTime getCapturedAt() {
        return capturedAt;
    }

    public void setCapturedAt(LocalDateTime capturedAt) {
        this.capturedAt = capturedAt;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
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

    public Integer getSequenceNumber() {
        return sequenceNumber;
    }

    public void setSequenceNumber(Integer sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
