package com.examly.springapp.controller;

import com.examly.springapp.model.IntegrityEvent;
import com.examly.springapp.service.IntegrityEventService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/integrity-events")
@CrossOrigin(origins = "*")
public class IntegrityEventController {

    @Autowired
    private IntegrityEventService integrityEventService;

    @GetMapping
    public ResponseEntity<List<IntegrityEvent>> getAllEvents() {
        return ResponseEntity.ok(integrityEventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {

        IntegrityEvent event = integrityEventService.getEventById(id);

        if (event == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Integrity event not found");
        }

        return ResponseEntity.ok(event);
    }

    @PostMapping
    public ResponseEntity<IntegrityEvent> addEvent(
            @RequestBody IntegrityEvent event) {

        IntegrityEvent saved =
                integrityEventService.addEvent(event);

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long id,
            @RequestBody IntegrityEvent event) {

        IntegrityEvent updated =
                integrityEventService.updateEvent(id, event);

        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Integrity event not found");
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {

        if (!integrityEventService.deleteEvent(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Integrity event not found");
        }

        return ResponseEntity.ok("Integrity event deleted successfully");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<IntegrityEvent>> getByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                integrityEventService.getEventsByUser(userId));
    }

    @GetMapping("/attempt/{attemptId}")
    public ResponseEntity<List<IntegrityEvent>> getByAttempt(
            @PathVariable Long attemptId) {

        return ResponseEntity.ok(
                integrityEventService.getEventsByAttempt(attemptId));
    }

    @GetMapping("/type")
    public ResponseEntity<List<IntegrityEvent>> getByType(
            @RequestParam String eventType) {

        return ResponseEntity.ok(
                integrityEventService.getEventsByType(eventType));
    }
}