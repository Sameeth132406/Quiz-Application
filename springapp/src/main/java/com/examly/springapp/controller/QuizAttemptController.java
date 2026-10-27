package com.examly.springapp.controller;

import com.examly.springapp.model.QuizAttempt;
import com.examly.springapp.service.QuizAttemptService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attempts")
@CrossOrigin(origins = "*")
public class QuizAttemptController {

    @Autowired
    private QuizAttemptService quizAttemptService;

    @Autowired
    private com.examly.springapp.repository.UserRepository userRepository;

    @Autowired
    private com.examly.springapp.repository.QuizRepository quizRepository;

    @Autowired
    private com.examly.springapp.repository.QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private com.examly.springapp.repository.QuizAttemptAllowanceRepository quizAttemptAllowanceRepository;

    private boolean isStaff(org.springframework.security.core.Authentication auth) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_EDUCATOR"));
    }

    @GetMapping
    public ResponseEntity<List<QuizAttempt>> getAllAttempts(org.springframework.security.core.Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            com.examly.springapp.model.User user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
                List<QuizAttempt> studentAttempts = quizAttemptService.getAttemptsByUser(user.getId());
                for (QuizAttempt a : studentAttempts) {
                    a.setTabSwitches(0);
                    if (!Boolean.TRUE.equals(a.getResultsPublished())) {
                        a.setScore(null);
                    }
                }
                return ResponseEntity.ok(studentAttempts);
            }
        }
        return ResponseEntity.ok(quizAttemptService.getAllAttempts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAttemptById(@PathVariable Long id, org.springframework.security.core.Authentication authentication) {

        QuizAttempt attempt = quizAttemptService.getAttemptById(id);

        if (attempt == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Attempt not found with id " + id);
        }

        if (authentication != null && authentication.isAuthenticated()) {
            com.examly.springapp.model.User user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
                attempt.setTabSwitches(0);
                if (!Boolean.TRUE.equals(attempt.getResultsPublished())) {
                    attempt.setScore(null);
                }
            }
        }

        return ResponseEntity.ok(attempt);
    }

   
    @PostMapping
    public ResponseEntity<?> startQuiz(@RequestBody QuizAttempt attempt, org.springframework.security.core.Authentication authentication) {
        com.examly.springapp.model.User user = null;
        if (authentication != null && authentication.isAuthenticated()) {
            user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user != null && user.getRole() != com.examly.springapp.enums.Role.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of("message", "Only students are permitted to take quizzes."));
            }
        }

        // Deadline & attempt limits check
        if (attempt.getQuizId() != null) {
            com.examly.springapp.model.Quiz quiz = quizRepository.findById(attempt.getQuizId()).orElse(null);
            if (quiz != null) {
                if (quiz.getEndDate() != null && java.time.LocalDateTime.now().isAfter(quiz.getEndDate())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(java.util.Map.of("message", "The deadline for this assessment has passed. New attempts are closed."));
                }
                if (user != null) {
                    List<QuizAttempt> userAttempts = quizAttemptRepository.findByUserIdAndQuizId(user.getId(), attempt.getQuizId());
                    long completedCount = userAttempts.stream()
                            .filter(a -> a.getStatus() == com.examly.springapp.enums.AttemptStatus.COMPLETED)
                            .count();
                    com.examly.springapp.model.QuizAttemptAllowance allowance = quizAttemptAllowanceRepository
                            .findByQuizIdAndUserId(attempt.getQuizId(), user.getId())
                            .orElse(null);
                    int maxAllowed = allowance != null && allowance.getAllowedAttempts() != null
                            ? allowance.getAllowedAttempts()
                            : (quiz.getMaxAttempts() != null ? quiz.getMaxAttempts() : 1);
                    if (completedCount >= maxAllowed) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(java.util.Map.of("message", "You have reached the maximum allowed attempts (" + maxAllowed + ") for this assessment."));
                    }
                }
            }
        }

        QuizAttempt savedAttempt = quizAttemptService.startQuiz(attempt);
        return new ResponseEntity<>(savedAttempt, HttpStatus.CREATED);
    }

    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAttempt(@PathVariable Long id,
                                           @RequestBody QuizAttempt attempt) {

        QuizAttempt updatedAttempt = quizAttemptService.updateAttempt(id, attempt);

        if (updatedAttempt == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Attempt not found with id " + id);
        }

        return ResponseEntity.ok(updatedAttempt);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizAttempt>> getAttemptsByUser(@PathVariable Long userId, org.springframework.security.core.Authentication authentication) {
        List<QuizAttempt> attempts = quizAttemptService.getAttemptsByUser(userId);
        if (authentication != null && authentication.isAuthenticated()) {
            com.examly.springapp.model.User user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
                for (QuizAttempt a : attempts) {
                    a.setTabSwitches(0);
                    if (!Boolean.TRUE.equals(a.getResultsPublished())) {
                        a.setScore(null);
                    }
                }
            }
        }
        return ResponseEntity.ok(attempts);
    }

    @PostMapping("/submit/{quizId}")
    public ResponseEntity<?> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody com.examly.springapp.dto.QuizSubmissionDTO submission,
            org.springframework.security.core.Authentication authentication) {

        com.examly.springapp.model.User user = null;
        if (authentication != null && authentication.isAuthenticated()) {
            user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user != null && user.getRole() != com.examly.springapp.enums.Role.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of("message", "Only students are permitted to submit quizzes."));
            }
        }

        // Validate deadline
        com.examly.springapp.model.Quiz quiz = quizRepository.findById(quizId).orElse(null);
        if (quiz != null) {
            if (quiz.getEndDate() != null && java.time.LocalDateTime.now().isAfter(quiz.getEndDate())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("message", "The deadline for this assessment has passed (" + quiz.getEndDate() + "). Submissions are closed."));
            }
            if (user != null) {
                List<QuizAttempt> userAttempts = quizAttemptRepository.findByUserIdAndQuizId(user.getId(), quizId);
                long completedCount = userAttempts.stream()
                        .filter(a -> a.getStatus() == com.examly.springapp.enums.AttemptStatus.COMPLETED &&
                                (submission.getAttemptId() == null || !a.getId().equals(submission.getAttemptId())))
                        .count();
                com.examly.springapp.model.QuizAttemptAllowance allowance = quizAttemptAllowanceRepository
                        .findByQuizIdAndUserId(quizId, user.getId())
                        .orElse(null);
                int maxAllowed = allowance != null && allowance.getAllowedAttempts() != null
                        ? allowance.getAllowedAttempts()
                        : (quiz.getMaxAttempts() != null ? quiz.getMaxAttempts() : 1);
                if (completedCount >= maxAllowed) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(java.util.Map.of("message", "You have already completed the maximum allowed attempts (" + maxAllowed + ") for this assessment."));
                }
            }
        }

        com.examly.springapp.dto.SubmissionResultDTO result = quizAttemptService.submitQuiz(quizId, submission);
        if (authentication != null && authentication.isAuthenticated()) {
            if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
                result.setTabSwitches(0);
                if (!Boolean.TRUE.equals(result.getResultsPublished())) {
                    result.setScore(null);
                    result.setPercentage(null);
                    result.setGrade(null);
                    result.setCorrectCount(null);
                }
            }
        }
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    /**
     * Get student's attempt eligibility, remaining attempts, and best score.
     */
    @GetMapping("/quiz/{quizId}/eligibility")
    public ResponseEntity<?> getQuizEligibility(
            @PathVariable Long quizId,
            org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message", "Unauthorized"));
        }
        com.examly.springapp.model.User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("message", "User not found"));
        }
        com.examly.springapp.model.Quiz quiz = quizRepository.findById(quizId).orElse(null);
        if (quiz == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("message", "Quiz not found"));
        }

        boolean isExpired = quiz.getEndDate() != null && java.time.LocalDateTime.now().isAfter(quiz.getEndDate());
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdAndQuizId(user.getId(), quizId);
        long completedAttempts = attempts.stream()
                .filter(a -> a.getStatus() == com.examly.springapp.enums.AttemptStatus.COMPLETED)
                .count();

        com.examly.springapp.model.QuizAttemptAllowance allowance = quizAttemptAllowanceRepository
                .findByQuizIdAndUserId(quizId, user.getId())
                .orElse(null);

        int allowedAttempts = allowance != null && allowance.getAllowedAttempts() != null
                ? allowance.getAllowedAttempts()
                : (quiz.getMaxAttempts() != null ? quiz.getMaxAttempts() : 1);

        int remainingAttempts = Math.max(0, allowedAttempts - (int) completedAttempts);
        boolean canAttempt = !isExpired && remainingAttempts > 0 && user.getRole() == com.examly.springapp.enums.Role.STUDENT;

        // Calculate best score among completed attempts
        Integer bestScore = attempts.stream()
                .filter(a -> a.getStatus() == com.examly.springapp.enums.AttemptStatus.COMPLETED && a.getScore() != null)
                .map(QuizAttempt::getScore)
                .max(Integer::compareTo)
                .orElse(null);

        Integer latestScore = attempts.stream()
                .filter(a -> a.getStatus() == com.examly.springapp.enums.AttemptStatus.COMPLETED && a.getScore() != null)
                .reduce((first, second) -> second)
                .map(QuizAttempt::getScore)
                .orElse(null);

        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("quizId", quizId);
        resp.put("title", quiz.getTitle());
        resp.put("endDate", quiz.getEndDate());
        resp.put("isExpired", isExpired);
        resp.put("maxAttempts", quiz.getMaxAttempts() != null ? quiz.getMaxAttempts() : 1);
        resp.put("allowedAttempts", allowedAttempts);
        resp.put("completedAttempts", completedAttempts);
        resp.put("remainingAttempts", remainingAttempts);
        resp.put("canAttempt", canAttempt);
        resp.put("bestScore", bestScore);
        resp.put("latestScore", latestScore);
        resp.put("resultsPublished", quiz.getResultsPublished());
        resp.put("allowanceReason", allowance != null ? allowance.getReason() : null);

        return ResponseEntity.ok(resp);
    }

    /**
     * Get student list for a quiz with attempts and scores (Educator/Admin).
     */
    @GetMapping("/quiz/{quizId}/students")
    public ResponseEntity<?> getQuizStudentAttempts(
            @PathVariable Long quizId,
            org.springframework.security.core.Authentication authentication) {
        if (!isStaff(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of("message", "Staff access required"));
        }
        com.examly.springapp.model.Quiz quiz = quizRepository.findById(quizId).orElse(null);
        if (quiz == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("message", "Quiz not found"));
        }

        List<com.examly.springapp.model.User> allStudents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.examly.springapp.enums.Role.STUDENT)
                .collect(java.util.stream.Collectors.toList());

        List<QuizAttempt> quizAttempts = quizAttemptRepository.findByQuizId(quizId);
        java.util.Map<Long, List<QuizAttempt>> userAttemptsMap = quizAttempts.stream()
                .collect(java.util.stream.Collectors.groupingBy(QuizAttempt::getUserId));

        List<com.examly.springapp.model.QuizAttemptAllowance> allowances = quizAttemptAllowanceRepository.findByQuizId(quizId);
        java.util.Map<Long, com.examly.springapp.model.QuizAttemptAllowance> allowanceMap = allowances.stream()
                .collect(java.util.stream.Collectors.toMap(com.examly.springapp.model.QuizAttemptAllowance::getUserId, a -> a, (k1, k2) -> k1));

        int defaultMax = quiz.getMaxAttempts() != null ? quiz.getMaxAttempts() : 1;

        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (com.examly.springapp.model.User s : allStudents) {
            List<QuizAttempt> sAttempts = userAttemptsMap.getOrDefault(s.getId(), java.util.Collections.emptyList());
            long completedCount = sAttempts.stream()
                    .filter(a -> a.getStatus() == com.examly.springapp.enums.AttemptStatus.COMPLETED)
                    .count();

            com.examly.springapp.model.QuizAttemptAllowance allowance = allowanceMap.get(s.getId());
            int allowed = allowance != null && allowance.getAllowedAttempts() != null
                    ? allowance.getAllowedAttempts()
                    : defaultMax;

            Integer bestScore = sAttempts.stream()
                    .filter(a -> a.getStatus() == com.examly.springapp.enums.AttemptStatus.COMPLETED && a.getScore() != null)
                    .map(QuizAttempt::getScore)
                    .max(Integer::compareTo)
                    .orElse(null);

            Integer latestScore = sAttempts.stream()
                    .filter(a -> a.getStatus() == com.examly.springapp.enums.AttemptStatus.COMPLETED && a.getScore() != null)
                    .reduce((first, second) -> second)
                    .map(QuizAttempt::getScore)
                    .orElse(null);

            java.util.Map<String, Object> item = new java.util.HashMap<>();
            item.put("userId", s.getId());
            item.put("studentName", s.getUsername());
            item.put("studentEmail", s.getEmail());
            item.put("totalAttempts", completedCount);
            item.put("allowedAttempts", allowed);
            item.put("hasExtraAttempt", allowed > defaultMax);
            item.put("bestScore", bestScore);
            item.put("latestScore", latestScore);
            item.put("reason", allowance != null ? allowance.getReason() : null);
            item.put("grantedBy", allowance != null ? allowance.getGrantedBy() : null);
            item.put("canAttempt", completedCount < allowed);

            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Grant extra attempt(s) to a specific student (Educator/Admin).
     */
    @PostMapping("/quiz/{quizId}/grant-attempt")
    public ResponseEntity<?> grantStudentAttempt(
            @PathVariable Long quizId,
            @RequestBody java.util.Map<String, Object> payload,
            org.springframework.security.core.Authentication authentication) {
        if (!isStaff(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of("message", "Staff access required"));
        }
        com.examly.springapp.model.Quiz quiz = quizRepository.findById(quizId).orElse(null);
        if (quiz == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("message", "Quiz not found"));
        }

        Long targetUserId = payload.get("userId") != null ? Long.valueOf(payload.get("userId").toString()) : null;
        if (targetUserId == null) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "userId is required"));
        }

        com.examly.springapp.model.QuizAttemptAllowance allowance = quizAttemptAllowanceRepository
                .findByQuizIdAndUserId(quizId, targetUserId)
                .orElse(new com.examly.springapp.model.QuizAttemptAllowance(
                        null,
                        quizId,
                        targetUserId,
                        quiz.getMaxAttempts() != null ? quiz.getMaxAttempts() : 1,
                        authentication.getName(),
                        ""
                ));

        int newAllowed;
        if (payload.get("allowedAttempts") != null) {
            newAllowed = Integer.parseInt(payload.get("allowedAttempts").toString());
        } else {
            // Default +1 attempt
            newAllowed = allowance.getAllowedAttempts() + 1;
        }

        String reason = payload.get("reason") != null
                ? payload.get("reason").toString()
                : "Extra attempt granted by educator (" + authentication.getName() + ")";

        allowance.setAllowedAttempts(newAllowed);
        allowance.setGrantedBy(authentication.getName());
        allowance.setReason(reason);
        allowance.setUpdatedAt(java.time.LocalDateTime.now());

        com.examly.springapp.model.QuizAttemptAllowance saved = quizAttemptAllowanceRepository.save(allowance);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAttempt(@PathVariable Long id) {

        boolean deleted = quizAttemptService.deleteAttempt(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Attempt not found with id " + id);
        }

        return ResponseEntity.ok("Attempt deleted successfully");
    }
}