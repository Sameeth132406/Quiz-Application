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

    // ==========================
    // GET ALL ATTEMPTS
    // ==========================
    @GetMapping
    public ResponseEntity<List<QuizAttempt>> getAllAttempts() {
        return ResponseEntity.ok(quizAttemptService.getAllAttempts());
    }

    // ==========================
    // GET ATTEMPT BY ID
    // ==========================
    @GetMapping("/{id}")
    public ResponseEntity<?> getAttemptById(@PathVariable Long id) {

        QuizAttempt attempt = quizAttemptService.getAttemptById(id);

        if (attempt == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Attempt not found with id " + id);
        }

        return ResponseEntity.ok(attempt);
    }

    // ==========================
    // START QUIZ
    // ==========================
    @PostMapping
    public ResponseEntity<QuizAttempt> startQuiz(@RequestBody QuizAttempt attempt) {

        QuizAttempt savedAttempt = quizAttemptService.startQuiz(attempt);

        return new ResponseEntity<>(savedAttempt, HttpStatus.CREATED);
    }

    // ==========================
    // UPDATE ATTEMPT
    // ==========================
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

    // ==========================
    // DELETE ATTEMPT
    // ==========================
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