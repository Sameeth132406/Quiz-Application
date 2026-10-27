package com.examly.springapp.controller;

import com.examly.springapp.dto.CourseContentDTO;
import com.examly.springapp.enums.ContentType;
import com.examly.springapp.model.CourseContent;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.CourseContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class CourseContentController {

    @Autowired
    private CourseContentService courseContentService;

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

    // Add content (JSON request)
    @PostMapping("/api/modules/{moduleId}/content")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> addContent(@PathVariable Long moduleId,
                                        @RequestBody CourseContent content,
                                        Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            CourseContent saved = courseContentService.addContent(moduleId, content, userId, admin);
            CourseContentDTO dto = courseContentService.getContentById(saved.getId(), userId);
            return new ResponseEntity<>(dto, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }

    // Add content with multipart file upload (Section 7 API)
    @PostMapping(value = {
            "/api/courses/{courseId}/modules/{moduleId}/content",
            "/api/modules/{moduleId}/content/upload"
    }, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> uploadAndAddContent(
            @PathVariable(required = false) Long courseId,
            @PathVariable Long moduleId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("contentType") String contentTypeStr,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "contentUrl", required = false) String contentUrl,
            @RequestParam(value = "contentOrder", required = false) Integer contentOrder,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(value = "downloadable", required = false) Boolean downloadable,
            @RequestParam(value = "quizId", required = false) Long quizId,
            @RequestParam(value = "textContent", required = false) String textContent,
            Authentication authentication) {

        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            ContentType contentType = ContentType.valueOf(contentTypeStr.toUpperCase());
            CourseContent saved = courseContentService.uploadAndAddContent(
                    moduleId, title, description, contentType, file, contentUrl,
                    contentOrder, duration, downloadable, quizId, textContent,
                    userId, admin
            );
            CourseContentDTO dto = courseContentService.getContentById(saved.getId(), userId);
            return new ResponseEntity<>(dto, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }

    // Get all contents for module
    @GetMapping("/api/modules/{moduleId}/content")
    public ResponseEntity<List<CourseContentDTO>> getContentsByModuleId(@PathVariable Long moduleId,
                                                                        Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(courseContentService.getContentsByModuleId(moduleId, userId));
    }

    // Get content by ID
    @GetMapping("/api/content/{contentId}")
    public ResponseEntity<?> getContentById(@PathVariable Long contentId,
                                            Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        CourseContentDTO dto = courseContentService.getContentById(contentId, userId);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Content not found"));
        }
        return ResponseEntity.ok(dto);
    }

    // Update content
    @PutMapping("/api/content/{contentId}")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> updateContent(@PathVariable Long contentId,
                                           @RequestBody CourseContent content,
                                           Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            CourseContent updated = courseContentService.updateContent(contentId, content, userId, admin);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Content not found"));
            }
            CourseContentDTO dto = courseContentService.getContentById(updated.getId(), userId);
            return ResponseEntity.ok(dto);
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }

    // Delete content
    @DeleteMapping("/api/content/{contentId}")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> deleteContent(@PathVariable Long contentId,
                                           Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            boolean deleted = courseContentService.deleteContent(contentId, userId, admin);
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Content not found"));
            }
            return ResponseEntity.ok(Map.of("message", "Content deleted successfully"));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }

    // Upload file for existing content
    @PostMapping(value = "/api/content/{contentId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> uploadFileToContent(@PathVariable Long contentId,
                                                 @RequestParam("file") MultipartFile file,
                                                 Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long userId = user != null ? user.getId() : null;
        boolean admin = isAdmin(authentication);

        try {
            CourseContent updated = courseContentService.uploadFileToContent(contentId, file, userId, admin);
            CourseContentDTO dto = courseContentService.getContentById(updated.getId(), userId);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }
}
