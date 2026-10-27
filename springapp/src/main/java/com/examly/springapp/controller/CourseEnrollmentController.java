package com.examly.springapp.controller;

import com.examly.springapp.dto.CourseEnrollmentDTO;
import com.examly.springapp.model.CourseEnrollment;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.CourseEnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class CourseEnrollmentController {

    @Autowired
    private CourseEnrollmentService courseEnrollmentService;

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

    // Student enrolls in a course
    @PostMapping("/api/courses/{courseId}/enroll")
    public ResponseEntity<?> enrollInCourse(@PathVariable Long courseId, Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }

        try {
            CourseEnrollment enrollment = courseEnrollmentService.enrollStudent(courseId, user.getId());
            CourseEnrollmentDTO dto = courseEnrollmentService.getEnrollment(courseId, user.getId());
            return new ResponseEntity<>(dto != null ? dto : enrollment, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // Get current student's enrolled courses
    @GetMapping("/api/courses/enrolled")
    public ResponseEntity<?> getEnrolledCourses(Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }

        List<CourseEnrollmentDTO> enrolled = courseEnrollmentService.getEnrolledCourses(user.getId());
        return ResponseEntity.ok(enrolled);
    }

    // Get students enrolled in a specific course (educator / admin)
    @GetMapping("/api/courses/{courseId}/students")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> getCourseStudents(@PathVariable Long courseId, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            List<CourseEnrollmentDTO> students = courseEnrollmentService.getStudentsByCourse(courseId, userId, admin);
            return ResponseEntity.ok(students);
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        }
    }

    // Unenroll from course
    @DeleteMapping("/api/courses/{courseId}/unenroll")
    public ResponseEntity<?> unenrollFromCourse(@PathVariable Long courseId, Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }

        boolean removed = courseEnrollmentService.unenrollStudent(courseId, user.getId());
        if (!removed) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Enrollment not found"));
        }

        return ResponseEntity.ok(Map.of("message", "Successfully unenrolled from course"));
    }

    // Check enrollment status
    @GetMapping("/api/courses/{courseId}/enrollment-status")
    public ResponseEntity<?> checkEnrollmentStatus(@PathVariable Long courseId, Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.ok(Map.of("isEnrolled", false));
        }

        boolean isEnrolled = courseEnrollmentService.isStudentEnrolled(courseId, user.getId());
        CourseEnrollmentDTO enrollment = isEnrolled ? courseEnrollmentService.getEnrollment(courseId, user.getId()) : null;

        return ResponseEntity.ok(Map.of(
                "isEnrolled", isEnrolled,
                "enrollment", enrollment != null ? enrollment : Map.of()
        ));
    }
}
