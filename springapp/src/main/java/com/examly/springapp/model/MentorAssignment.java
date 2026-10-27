package com.examly.springapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mentor_assignments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "course_id"})
})
public class MentorAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private User student;

    @Column(name = "educator_id", nullable = false)
    private Long educatorId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "educator_id", insertable = false, updatable = false)
    private User educator;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", insertable = false, updatable = false)
    private Course course;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @PrePersist
    protected void onCreate() {
        this.assignedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Long getEducatorId() { return educatorId; }
    public void setEducatorId(Long educatorId) { this.educatorId = educatorId; }

    public User getEducator() { return educator; }
    public void setEducator(User educator) { this.educator = educator; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
}
