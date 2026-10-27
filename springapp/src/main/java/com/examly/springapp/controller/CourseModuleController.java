package com.examly.springapp.controller;

import com.examly.springapp.dto.CourseModuleDTO;
import com.examly.springapp.model.CourseModule;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.CourseModuleService;
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
public class CourseModuleController {

    @Autowired
    private CourseModuleService courseModuleService;

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

    // Add module to course
    @PostMapping("/api/courses/{courseId}/modules")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> addModule(@PathVariable Long courseId,
                                       @RequestBody CourseModule module,
                                       Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            CourseModule saved = courseModuleService.addModule(courseId, module, userId, admin);
            CourseModuleDTO dto = courseModuleService.getModuleById(saved.getId(), userId);
            return new ResponseEntity<>(dto, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }

    // Get all modules for a course
    @GetMapping("/api/courses/{courseId}/modules")
    public ResponseEntity<List<CourseModuleDTO>> getModulesForCourse(@PathVariable Long courseId,
                                                                    Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(courseModuleService.getModulesByCourseId(courseId, userId));
    }

    // Get module by ID
    @GetMapping("/api/modules/{moduleId}")
    public ResponseEntity<?> getModuleById(@PathVariable Long moduleId,
                                           Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        CourseModuleDTO dto = courseModuleService.getModuleById(moduleId, userId);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Module not found"));
        }
        return ResponseEntity.ok(dto);
    }

    // Update module
    @PutMapping("/api/modules/{moduleId}")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> updateModule(@PathVariable Long moduleId,
                                          @RequestBody CourseModule module,
                                          Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            CourseModule updated = courseModuleService.updateModule(moduleId, module, userId, admin);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Module not found"));
            }
            CourseModuleDTO dto = courseModuleService.getModuleById(updated.getId(), userId);
            return ResponseEntity.ok(dto);
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }

    // Delete module
    @DeleteMapping("/api/modules/{moduleId}")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> deleteModule(@PathVariable Long moduleId,
                                          Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            boolean deleted = courseModuleService.deleteModule(moduleId, userId, admin);
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Module not found"));
            }
            return ResponseEntity.ok(Map.of("message", "Module deleted successfully"));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }

    // Attach quiz to module
    @PostMapping("/api/modules/{moduleId}/quiz/{quizId}")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> attachQuiz(@PathVariable Long moduleId,
                                        @PathVariable Long quizId,
                                        Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            CourseModule updated = courseModuleService.attachQuiz(moduleId, quizId, userId, admin);
            CourseModuleDTO dto = courseModuleService.getModuleById(updated.getId(), userId);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }

    // Remove quiz from module
    @DeleteMapping("/api/modules/{moduleId}/quiz")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> removeQuiz(@PathVariable Long moduleId,
                                        Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            CourseModule updated = courseModuleService.removeQuiz(moduleId, userId, admin);
            CourseModuleDTO dto = courseModuleService.getModuleById(updated.getId(), userId);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "Failed to detach quiz"));
        }
    }

    // Reorder modules
    @PutMapping("/api/courses/{courseId}/modules/reorder")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> reorderModules(@PathVariable Long courseId,
                                            @RequestBody List<Long> moduleIds,
                                            Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            courseModuleService.reorderModules(courseId, moduleIds, userId, admin);
            return ResponseEntity.ok(courseModuleService.getModulesByCourseId(courseId, userId));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }
}
