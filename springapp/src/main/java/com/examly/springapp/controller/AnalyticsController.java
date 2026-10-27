package com.examly.springapp.controller;

import com.examly.springapp.dto.CourseAnalyticsDTO;
import com.examly.springapp.dto.EducatorAnalyticsDTO;
import com.examly.springapp.dto.QuizAnalyticsDTO;
import com.examly.springapp.dto.StudentAnalyticsDTO;
import com.examly.springapp.model.Analytics;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Analytics>> getAllAnalytics() {
        return ResponseEntity.ok(analyticsService.getAllAnalytics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAnalyticsById(@PathVariable Long id) {
        Analytics analytics = analyticsService.getAnalyticsById(id);
        if (analytics == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Analytics not found");
        }
        return ResponseEntity.ok(analytics);
    }

    @PostMapping
    public ResponseEntity<Analytics> addAnalytics(@RequestBody Analytics analytics) {
        Analytics saved = analyticsService.addAnalytics(analytics);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAnalytics(@PathVariable Long id, @RequestBody Analytics analytics) {
        Analytics updated = analyticsService.updateAnalytics(id, analytics);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Analytics not found");
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnalytics(@PathVariable Long id) {
        if (!analyticsService.deleteAnalytics(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Analytics not found");
        }
        return ResponseEntity.ok("Analytics deleted successfully");
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<?> getByQuiz(@PathVariable Long quizId) {
        QuizAnalyticsDTO summary = analyticsService.getQuizAnalytics(quizId);
        if (summary != null) {
            return ResponseEntity.ok(summary);
        }
        return ResponseEntity.ok(analyticsService.getAnalyticsByQuiz(quizId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUser(@PathVariable Long userId, Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            User currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (currentUser != null && currentUser.getRole() == com.examly.springapp.enums.Role.STUDENT) {
                if (!currentUser.getId().equals(userId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: You can only view your own analytics.");
                }
            }
        }
        return ResponseEntity.ok(analyticsService.getAnalyticsByUser(userId));
    }

    // ==========================================
    // ENHANCED ANALYTICS APIS
    // ==========================================

    @GetMapping("/educator")
    public ResponseEntity<?> getEducatorAnalytics(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long quizId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Authentication authentication) {

        if (authentication != null && authentication.isAuthenticated()) {
            User currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (currentUser != null && currentUser.getRole() == com.examly.springapp.enums.Role.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Students cannot access educator analytics.");
            }
        }

        EducatorAnalyticsDTO dto = analyticsService.getEducatorAnalytics(courseId, quizId, studentId, startDate, endDate);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentAnalytics(@PathVariable Long studentId, Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            User currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (currentUser != null && currentUser.getRole() == com.examly.springapp.enums.Role.STUDENT) {
                if (!currentUser.getId().equals(studentId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: You can only view your own student analytics.");
                }
            }
        }

        StudentAnalyticsDTO dto = analyticsService.getStudentAnalytics(studentId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyAnalytics(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
        }

        User currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User record not found.");
        }

        StudentAnalyticsDTO dto = analyticsService.getStudentAnalytics(currentUser.getId());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseAnalytics(@PathVariable Long courseId) {
        CourseAnalyticsDTO dto = analyticsService.getCourseAnalytics(courseId);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found with id: " + courseId);
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<?> getStudentCourseAnalytics(@PathVariable Long studentId, @PathVariable Long courseId,
                                                       Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            User currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (currentUser != null && currentUser.getRole() == com.examly.springapp.enums.Role.STUDENT) {
                if (!currentUser.getId().equals(studentId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: You cannot view another student's course performance.");
                }
            }
        }

        CourseAnalyticsDTO dto = analyticsService.getStudentCourseAnalytics(studentId, courseId);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course analytics not found.");
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/course/{courseId}/my")
    public ResponseEntity<?> getMyCourseAnalytics(@PathVariable Long courseId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
        }

        User currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User record not found.");
        }

        CourseAnalyticsDTO dto = analyticsService.getStudentCourseAnalytics(currentUser.getId(), courseId);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course analytics not found.");
        }
        return ResponseEntity.ok(dto);
    }
}