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

    @GetMapping
    public ResponseEntity<List<QuizAttempt>> getAllAttempts(org.springframework.security.core.Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            com.examly.springapp.model.User user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
                return ResponseEntity.ok(quizAttemptService.getAttemptsByUser(user.getId()));
            }
        }
        return ResponseEntity.ok(quizAttemptService.getAllAttempts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAttemptById(@PathVariable Long id) {

        QuizAttempt attempt = quizAttemptService.getAttemptById(id);

        if (attempt == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Attempt not found with id " + id);
        }

        return ResponseEntity.ok(attempt);
    }

   
    @PostMapping
    public ResponseEntity<QuizAttempt> startQuiz(@RequestBody QuizAttempt attempt) {

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
    public ResponseEntity<List<QuizAttempt>> getAttemptsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(quizAttemptService.getAttemptsByUser(userId));
    }

    @PostMapping("/submit/{quizId}")
    public ResponseEntity<com.examly.springapp.dto.SubmissionResultDTO> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody com.examly.springapp.dto.QuizSubmissionDTO submission) {

        com.examly.springapp.dto.SubmissionResultDTO result = quizAttemptService.submitQuiz(quizId, submission);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
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