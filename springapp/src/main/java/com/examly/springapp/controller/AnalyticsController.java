package com.examly.springapp.controller;

import com.examly.springapp.model.Analytics;
import com.examly.springapp.service.AnalyticsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<List<Analytics>> getAllAnalytics() {
        return ResponseEntity.ok(analyticsService.getAllAnalytics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAnalyticsById(@PathVariable Long id) {

        Analytics analytics = analyticsService.getAnalyticsById(id);

        if (analytics == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Analytics not found");
        }

        return ResponseEntity.ok(analytics);
    }

    @PostMapping
    public ResponseEntity<Analytics> addAnalytics(
            @RequestBody Analytics analytics) {

        Analytics saved = analyticsService.addAnalytics(analytics);

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAnalytics(
            @PathVariable Long id,
            @RequestBody Analytics analytics) {

        Analytics updated =
                analyticsService.updateAnalytics(id, analytics);

        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Analytics not found");
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnalytics(@PathVariable Long id) {

        if (!analyticsService.deleteAnalytics(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Analytics not found");
        }

        return ResponseEntity.ok("Analytics deleted successfully");
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<Analytics>> getByQuiz(
            @PathVariable Long quizId) {

        return ResponseEntity.ok(
                analyticsService.getAnalyticsByQuiz(quizId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Analytics>> getByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                analyticsService.getAnalyticsByUser(userId));
    }
}