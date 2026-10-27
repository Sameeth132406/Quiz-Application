package com.examly.springapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempt_allowances", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"quiz_id", "user_id"})
})
public class QuizAttemptAllowance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "allowed_attempts", nullable = false)
    private Integer allowedAttempts = 2;

    @Column(name = "granted_by")
    private String grantedBy;

    @Column(name = "reason")
    private String reason;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public QuizAttemptAllowance() {
    }

    public QuizAttemptAllowance(Long id, Long quizId, Long userId, Integer allowedAttempts, String grantedBy, String reason) {
        this.id = id;
        this.quizId = quizId;
        this.userId = userId;
        this.allowedAttempts = allowedAttempts != null ? allowedAttempts : 2;
        this.grantedBy = grantedBy;
        this.reason = reason;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Integer getAllowedAttempts() {
        return allowedAttempts != null ? allowedAttempts : 1;
    }

    public void setAllowedAttempts(Integer allowedAttempts) {
        this.allowedAttempts = allowedAttempts != null ? allowedAttempts : 1;
    }

    public String getGrantedBy() {
        return grantedBy;
    }

    public void setGrantedBy(String grantedBy) {
        this.grantedBy = grantedBy;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
