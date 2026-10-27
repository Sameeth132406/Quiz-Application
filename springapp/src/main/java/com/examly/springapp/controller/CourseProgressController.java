package com.examly.springapp.controller;

import com.examly.springapp.dto.CourseProgressDTO;
import com.examly.springapp.model.CourseProgress;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.CourseProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class CourseProgressController {

    @Autowired
    private CourseProgressService courseProgressService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return userRepository.findByUsername(authentication.getName()).orElse(null);
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    // Get current student's progress for a course
    @GetMapping("/api/courses/{courseId}/progress")
    public ResponseEntity<?> getCourseProgress(@PathVariable Long courseId, Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }

        CourseProgressDTO progress = courseProgressService.getCourseProgress(courseId, user.getId());
        return ResponseEntity.ok(progress);
    }

    // Mark content as complete
    @PostMapping("/api/content/{contentId}/complete")
    public ResponseEntity<?> markContentComplete(@PathVariable Long contentId, Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }

        try {
            CourseProgress progress = courseProgressService.markContentComplete(contentId, user.getId());
            return ResponseEntity.ok(Map.of(
                    "message", "Content marked as completed",
                    "contentId", progress.getContentId(),
                    "completed", progress.getCompleted(),
                    "completedAt", progress.getCompletedAt() != null ? progress.getCompletedAt().toString() : ""
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // Toggle content complete / incomplete
    @PostMapping("/api/content/{contentId}/toggle")
    public ResponseEntity<?> toggleContentComplete(@PathVariable Long contentId, Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }

        try {
            CourseProgress progress = courseProgressService.toggleContentComplete(contentId, user.getId());
            return ResponseEntity.ok(Map.of(
                    "message", "Content status updated",
                    "contentId", progress.getContentId(),
                    "completed", progress.getCompleted()
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // Get student progress by ID (for educators/admins or self)
    @GetMapping("/api/courses/{courseId}/progress/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> getStudentProgress(@PathVariable Long courseId,
                                                @PathVariable Long studentId,
                                                Authentication authentication) {
        CourseProgressDTO progress = courseProgressService.getCourseProgress(courseId, studentId);
        return ResponseEntity.ok(progress);
    }
}
