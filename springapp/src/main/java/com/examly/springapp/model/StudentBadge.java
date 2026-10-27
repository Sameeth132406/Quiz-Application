package com.examly.springapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_badges", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "badge_id"})
})
@JsonIgnoreProperties(ignoreUnknown = true)
public class StudentBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "badge_id", nullable = false)
    private Long badgeId;

    private Long courseId; // Optional for course-specific achievements

    private LocalDateTime awardedAt;

    private Double progress = 0.0; // Current progress toward requirement (e.g. 8/10)

    private Boolean achieved = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "badge_id", insertable = false, updatable = false)
    private Badge badge;

    public StudentBadge() {
    }

    public StudentBadge(Long id, Long studentId, Long badgeId, Long courseId,
                        Double progress, Boolean achieved) {
        this.id = id;
        this.studentId = studentId;
        this.badgeId = badgeId;
        this.courseId = courseId;
        this.progress = progress != null ? progress : 0.0;
        this.achieved = achieved != null ? achieved : false;
        if (Boolean.TRUE.equals(achieved)) {
            this.awardedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getBadgeId() {
        return badgeId;
    }

    public void setBadgeId(Long badgeId) {
        this.badgeId = badgeId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public LocalDateTime getAwardedAt() {
        return awardedAt;
    }

    public void setAwardedAt(LocalDateTime awardedAt) {
        this.awardedAt = awardedAt;
    }

    public Double getProgress() {
        return progress != null ? progress : 0.0;
    }

    public void setProgress(Double progress) {
        this.progress = progress;
    }

    public Boolean getAchieved() {
        return achieved != null ? achieved : false;
    }

    public void setAchieved(Boolean achieved) {
        this.achieved = achieved;
        if (Boolean.TRUE.equals(achieved) && this.awardedAt == null) {
            this.awardedAt = LocalDateTime.now();
        }
    }

    public Badge getBadge() {
        return badge;
    }

    public void setBadge(Badge badge) {
        this.badge = badge;
    }
}
