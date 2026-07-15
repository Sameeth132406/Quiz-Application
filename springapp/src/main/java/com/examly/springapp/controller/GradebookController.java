package com.examly.springapp.controller;

import com.examly.springapp.model.Gradebook;
import com.examly.springapp.service.GradebookService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gradebook")
@CrossOrigin(origins = "*")
public class GradebookController {

    @Autowired
    private GradebookService gradebookService;

    @GetMapping
    public ResponseEntity<List<Gradebook>> getAllGrades() {
        return ResponseEntity.ok(gradebookService.getAllGrades());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGrade(@PathVariable Long id) {

        Gradebook grade = gradebookService.getGradeById(id);

        if (grade == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Grade not found");
        }

        return ResponseEntity.ok(grade);
    }

    @PostMapping
    public ResponseEntity<Gradebook> addGrade(
            @RequestBody Gradebook gradebook) {

        return new ResponseEntity<>(
                gradebookService.addGrade(gradebook),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGrade(
            @PathVariable Long id,
            @RequestBody Gradebook gradebook) {

        Gradebook updated =
                gradebookService.updateGrade(id, gradebook);

        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Grade not found");
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGrade(@PathVariable Long id) {

        if (!gradebookService.deleteGrade(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Grade not found");
        }

        return ResponseEntity.ok("Grade deleted successfully");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Gradebook>> getByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                gradebookService.getGradesByUser(userId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Gradebook>> getByCourse(
            @PathVariable Long courseId) {

        return ResponseEntity.ok(
                gradebookService.getGradesByCourse(courseId));
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<Gradebook>> getByQuiz(
            @PathVariable Long quizId) {

        return ResponseEntity.ok(
                gradebookService.getGradesByQuiz(quizId));
    }
}