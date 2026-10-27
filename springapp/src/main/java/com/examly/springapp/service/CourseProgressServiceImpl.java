package com.examly.springapp.service;

import com.examly.springapp.dto.CourseProgressDTO;
import com.examly.springapp.enums.EnrollmentStatus;
import com.examly.springapp.model.Course;
import com.examly.springapp.model.CourseContent;
import com.examly.springapp.model.CourseEnrollment;
import com.examly.springapp.model.CourseModule;
import com.examly.springapp.model.CourseProgress;
import com.examly.springapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseProgressServiceImpl implements CourseProgressService {

    @Autowired
    private CourseProgressRepository courseProgressRepository;

    @Autowired
    private CourseContentRepository courseContentRepository;

    @Autowired
    private CourseModuleRepository courseModuleRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseEnrollmentRepository courseEnrollmentRepository;

    @Autowired
    private BadgeService badgeService;

    @Override
    public CourseProgress markContentComplete(Long contentId, Long studentId) {
        CourseContent content = courseContentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("Content not found with id: " + contentId));

        CourseModule module = courseModuleRepository.findById(content.getModuleId())
                .orElseThrow(() -> new IllegalArgumentException("Module not found with id: " + content.getModuleId()));

        Long courseId = module.getCourseId();

        CourseProgress progress = courseProgressRepository.findByStudentIdAndContentId(studentId, contentId)
                .orElse(new CourseProgress(null, studentId, courseId, content.getModuleId(), contentId, false));

        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        CourseProgress saved = courseProgressRepository.save(progress);

        // Update enrollment progress
        updateEnrollmentProgress(courseId, studentId);

        try {
            badgeService.evaluateAndAwardBadges(studentId, courseId);
        } catch (Exception ignored) {
        }

        return saved;
    }

    @Override
    public CourseProgress toggleContentComplete(Long contentId, Long studentId) {
        CourseContent content = courseContentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("Content not found with id: " + contentId));

        CourseModule module = courseModuleRepository.findById(content.getModuleId())
                .orElseThrow(() -> new IllegalArgumentException("Module not found with id: " + content.getModuleId()));

        Long courseId = module.getCourseId();

        CourseProgress progress = courseProgressRepository.findByStudentIdAndContentId(studentId, contentId)
                .orElse(new CourseProgress(null, studentId, courseId, content.getModuleId(), contentId, false));

        boolean newStatus = !Boolean.TRUE.equals(progress.getCompleted());
        progress.setCompleted(newStatus);
        progress.setCompletedAt(newStatus ? LocalDateTime.now() : null);
        CourseProgress saved = courseProgressRepository.save(progress);

        // Update enrollment progress
        updateEnrollmentProgress(courseId, studentId);

        try {
            badgeService.evaluateAndAwardBadges(studentId, courseId);
        } catch (Exception ignored) {
        }

        return saved;
    }

    @Override
    public CourseProgressDTO getCourseProgress(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId).orElse(null);
        String courseTitle = course != null ? course.getTitle() : "Course";

        List<CourseContent> allContents = courseContentRepository.findByCourseId(courseId);
        int totalContents = allContents.size();

        List<CourseProgress> progressList = courseProgressRepository.findByStudentIdAndCourseId(studentId, courseId);
        Set<Long> completedIds = progressList.stream()
                .filter(p -> Boolean.TRUE.equals(p.getCompleted()))
                .map(CourseProgress::getContentId)
                .collect(Collectors.toSet());

        int completedCount = completedIds.size();
        double percentage = totalContents > 0 ? ((double) completedCount / totalContents * 100.0) : 0.0;
        percentage = Math.round(percentage * 10.0) / 10.0;

        CourseProgressDTO dto = new CourseProgressDTO();
        dto.setCourseId(courseId);
        dto.setCourseTitle(courseTitle);
        dto.setStudentId(studentId);
        dto.setProgressPercentage(percentage);
        dto.setTotalContentsCount(totalContents);
        dto.setCompletedContentsCount(completedCount);
        dto.setCompletedContentIds(completedIds);
        dto.setIsCompleted(totalContents > 0 && completedCount >= totalContents);

        // Find last completed content & next content to resume
        Long lastCompletedId = null;
        Long nextContentId = null;

        for (CourseContent c : allContents) {
            if (completedIds.contains(c.getId())) {
                lastCompletedId = c.getId();
            } else if (nextContentId == null) {
                nextContentId = c.getId();
            }
        }

        // If no incomplete items found, next is first item
        if (nextContentId == null && !allContents.isEmpty()) {
            nextContentId = allContents.get(0).getId();
        }

        dto.setLastCompletedContentId(lastCompletedId);
        dto.setNextContentId(nextContentId);

        Optional<CourseEnrollment> enrollment = courseEnrollmentRepository.findByCourseIdAndStudentId(courseId, studentId);
        if (enrollment.isPresent()) {
            dto.setCompletedAt(enrollment.get().getCompletedAt());
        }

        return dto;
    }

    private void updateEnrollmentProgress(Long courseId, Long studentId) {
        long totalContents = courseContentRepository.countByCourseId(courseId);
        if (totalContents == 0) return;

        long completedContents = courseProgressRepository.countByStudentIdAndCourseIdAndCompletedTrue(studentId, courseId);
        double progress = Math.min(100.0, (double) completedContents / totalContents * 100.0);
        double rounded = Math.round(progress * 10.0) / 10.0;

        Optional<CourseEnrollment> enrollmentOpt = courseEnrollmentRepository.findByCourseIdAndStudentId(courseId, studentId);
        if (enrollmentOpt.isPresent()) {
            CourseEnrollment enrollment = enrollmentOpt.get();
            enrollment.setProgressPercentage(rounded);
            if (rounded >= 100.0 && enrollment.getStatus() != EnrollmentStatus.COMPLETED) {
                enrollment.setStatus(EnrollmentStatus.COMPLETED);
                enrollment.setCompletedAt(LocalDateTime.now());
            }
            courseEnrollmentRepository.save(enrollment);
        }
    }
}
