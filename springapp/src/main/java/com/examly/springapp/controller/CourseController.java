package com.examly.springapp.controller;

import com.examly.springapp.dto.CourseDTO;
import com.examly.springapp.enums.CourseStatus;
import com.examly.springapp.model.Course;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.CourseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseService courseService;

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

    // Get all courses (DTO format for complete view)
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses(Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        
        List<CourseDTO> courses = courseService.getAllCoursesDTO(userId);
        // If student, filter to published courses unless admin/educator
        if (user != null && "STUDENT".equals(user.getRole().name())) {
            courses = courseService.getPublishedCourses(userId);
        }
        return ResponseEntity.ok(courses);
    }

    // Get published courses
    @GetMapping("/published")
    public ResponseEntity<List<CourseDTO>> getPublishedCourses(Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(courseService.getPublishedCourses(userId));
    }

    // Get courses created by specific educator
    @GetMapping("/educator/{educatorId}")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<List<CourseDTO>> getCoursesByEducator(@PathVariable Long educatorId) {
        return ResponseEntity.ok(courseService.getCoursesByEducator(educatorId));
    }

    // Get current educator's own courses
    @GetMapping("/my-created")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<List<CourseDTO>> getMyCreatedCourses(Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(courseService.getCoursesByEducator(user.getId()));
    }

    // Get course by ID with detailed modules and progress
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourse(@PathVariable Long id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;

        CourseDTO course = courseService.getCourseDetails(id, userId);
        if (course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }

        return ResponseEntity.ok(course);
    }

    // Create course
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> addCourse(@RequestBody Course course, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        String username = user != null ? user.getUsername() : "Educator";

        try {
            Course created = courseService.createCourse(course, userId, username);
            CourseDTO dto = courseService.convertToDTO(created, userId);
            return new ResponseEntity<>(dto, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // Update course details
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody Course course,
                                          Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            Course updated = courseService.updateCourseDetails(id, course, userId, admin);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Course not found"));
            }
            CourseDTO dto = courseService.convertToDTO(updated, userId);
            return ResponseEntity.ok(dto);
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }

    // Change course status (DRAFT, PUBLISHED, UNPUBLISHED)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body,
                                          Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        String statusStr = body.get("status");
        if (statusStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
        }

        try {
            CourseStatus status = CourseStatus.valueOf(statusStr.toUpperCase());
            Course updated = courseService.updateCourseStatus(id, status, userId, admin);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Course not found"));
            }
            CourseDTO dto = courseService.convertToDTO(updated, userId);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid course status: " + statusStr));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }

    // Delete course
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            if (!courseService.deleteCourse(id, userId, admin)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Course not found"));
            }
            return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }

    // Search courses by keyword
    @GetMapping("/search")
    public ResponseEntity<List<Course>> searchCourse(@RequestParam String keyword) {
        return ResponseEntity.ok(courseService.searchCourse(keyword));
    }

    // Get courses by instructor (legacy)
    @GetMapping("/instructor")
    public ResponseEntity<List<Course>> getByInstructor(@RequestParam String instructor) {
        return ResponseEntity.ok(courseService.getByInstructor(instructor));
    }
}