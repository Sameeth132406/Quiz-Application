package com.examly.springapp.controller;

import com.examly.springapp.dto.ProctoringScreenshotDTO;
import com.examly.springapp.dto.ProctoringSummaryDTO;
import com.examly.springapp.model.QuizAttempt;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.ProctoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proctoring")
@CrossOrigin(origins = "*")
public class ProctoringController {

    @Autowired
    private ProctoringService proctoringService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.examly.springapp.repository.QuizRepository quizRepository;

    @Autowired
    private com.examly.springapp.repository.QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private com.examly.springapp.repository.QuizAttemptAllowanceRepository quizAttemptAllowanceRepository;

    private boolean isStaff(Authentication auth) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_EDUCATOR"));
    }

    /**
     * Start a proctored exam attempt.
     */
    @PostMapping("/quizzes/{quizId}/start")
    public ResponseEntity<?> startProctoredExam(@PathVariable Long quizId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not found"));
        }
        if (user.getRole() != com.examly.springapp.enums.Role.STUDENT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Only students are permitted to take proctored examinations."));
        }

        // Validate quiz existence & deadline
        com.examly.springapp.model.Quiz quiz = quizRepository.findById(quizId).orElse(null);
        if (quiz != null) {
            if (quiz.getEndDate() != null && java.time.LocalDateTime.now().isAfter(quiz.getEndDate())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "The deadline for this assessment has passed. New attempts are closed."));
            }
            List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdAndQuizId(user.getId(), quizId);
            long completedCount = attempts.stream()
                    .filter(a -> a.getStatus() == com.examly.springapp.enums.AttemptStatus.COMPLETED)
                    .count();
            com.examly.springapp.model.QuizAttemptAllowance allowance = quizAttemptAllowanceRepository
                    .findByQuizIdAndUserId(quizId, user.getId())
                    .orElse(null);
            int maxAllowed = allowance != null && allowance.getAllowedAttempts() != null
                    ? allowance.getAllowedAttempts()
                    : (quiz.getMaxAttempts() != null ? quiz.getMaxAttempts() : 1);
            if (completedCount >= maxAllowed) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "You have reached the maximum allowed attempts (" + maxAllowed + ") for this assessment."));
            }
        }

        QuizAttempt attempt = proctoringService.startProctoredAttempt(quizId, user.getId());
        return new ResponseEntity<>(attempt, HttpStatus.CREATED);
    }

    /**
     * Upload an automated proctoring screenshot (every ~5 seconds).
     */
    @PostMapping(value = "/attempts/{attemptId}/screenshots", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadScreenshot(
            @PathVariable Long attemptId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "sequenceNumber", required = false) Integer sequenceNumber,
            @RequestParam(value = "capturedAt", required = false) String capturedAt,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Screenshot image file is required"));
        }

        try {
            ProctoringScreenshotDTO dto = proctoringService.uploadScreenshot(
                    attemptId, sequenceNumber, capturedAt, file, auth.getName()
            );
            return new ResponseEntity<>(dto, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to store screenshot: " + e.getMessage()));
        }
    }

    /**
     * Get all screenshot metadata for a given attempt.
     */
    @GetMapping("/attempts/{attemptId}/screenshots")
    public ResponseEntity<?> getAttemptScreenshots(@PathVariable Long attemptId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        try {
            List<ProctoringScreenshotDTO> screenshots = proctoringService.getScreenshotsByAttempt(
                    attemptId, auth.getName(), isStaff(auth)
            );
            return ResponseEntity.ok(screenshots);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Stream screenshot raw image binary.
     */
    @GetMapping("/screenshots/{screenshotId}")
    public ResponseEntity<?> getScreenshotImage(@PathVariable Long screenshotId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        try {
            byte[] imageBytes = proctoringService.getScreenshotImage(screenshotId, auth.getName(), isStaff(auth));
            if (imageBytes == null || imageBytes.length == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Screenshot image not found"));
            }

            String mimeType = proctoringService.getScreenshotMimeType(screenshotId);
            MediaType mediaType;
            try {
                mediaType = MediaType.parseMediaType(mimeType);
            } catch (Exception e) {
                mediaType = MediaType.IMAGE_JPEG;
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CACHE_CONTROL, "private, max-age=86400")
                    .contentType(mediaType)
                    .body(imageBytes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error reading screenshot: " + e.getMessage()));
        }
    }

    /**
     * Delete screenshot.
     */
    @DeleteMapping("/screenshots/{screenshotId}")
    public ResponseEntity<?> deleteScreenshot(@PathVariable Long screenshotId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        boolean deleted = proctoringService.deleteScreenshot(screenshotId, auth.getName(), isStaff(auth));
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Screenshot not found"));
        }
        return ResponseEntity.ok(Map.of("message", "Screenshot deleted successfully"));
    }

    /**
     * Get attempt proctoring summary with integrity score and full timeline.
     */
    @GetMapping("/attempts/{attemptId}/summary")
    public ResponseEntity<?> getAttemptSummary(@PathVariable Long attemptId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        try {
            ProctoringSummaryDTO summary = proctoringService.getAttemptProctoringSummary(
                    attemptId, auth.getName(), isStaff(auth)
            );
            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Get all proctoring summaries for a quiz (educator / admin).
     */
    @GetMapping("/quizzes/{quizId}/summaries")
    public ResponseEntity<?> getQuizSummaries(@PathVariable Long quizId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        if (!isStaff(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Staff access required"));
        }

        List<ProctoringSummaryDTO> summaries = proctoringService.getProctoringSummariesByQuiz(
                quizId, auth.getName(), isStaff(auth)
        );
        return ResponseEntity.ok(summaries);
    }
}
