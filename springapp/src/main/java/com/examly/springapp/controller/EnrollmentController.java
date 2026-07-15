package com.examly.springapp.controller;

import com.examly.springapp.model.Enrollment;
import com.examly.springapp.service.EnrollmentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @GetMapping
    public ResponseEntity<List<Enrollment>> getAllEnrollments() {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEnrollmentById(@PathVariable Long id) {

        Enrollment enrollment = enrollmentService.getEnrollmentById(id);

        if (enrollment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Enrollment not found");
        }

        return ResponseEntity.ok(enrollment);
    }

    @PostMapping
    public ResponseEntity<Enrollment> enrollStudent(
            @RequestBody Enrollment enrollment) {

        return new ResponseEntity<>(
                enrollmentService.enrollStudent(enrollment),
                HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEnrollment(@PathVariable Long id) {

        if (!enrollmentService.deleteEnrollment(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Enrollment not found");
        }

        return ResponseEntity.ok("Enrollment deleted successfully");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Enrollment>> getByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                enrollmentService.getByUser(userId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Enrollment>> getByCourse(
            @PathVariable Long courseId) {

        return ResponseEntity.ok(
                enrollmentService.getByCourse(courseId));
    }

    @GetMapping("/status")
    public ResponseEntity<List<Enrollment>> getByStatus(
            @RequestParam String status) {

        return ResponseEntity.ok(
                enrollmentService.getByStatus(status));
    }
}