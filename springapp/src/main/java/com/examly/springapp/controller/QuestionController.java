package com.examly.springapp.controller;

import com.examly.springapp.model.Question;
import com.examly.springapp.service.QuestionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    // ==========================
    // GET ALL QUESTIONS
    // ==========================
    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    // ==========================
    // GET QUESTION BY ID
    // ==========================
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionById(@PathVariable Long id) {

        Question question = questionService.getQuestionById(id);

        if (question == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Question not found with id " + id);
        }

        return ResponseEntity.ok(question);
    }

    // ==========================
    // ADD QUESTION
    // ==========================
    @PostMapping
    public ResponseEntity<Question> addQuestion(@RequestBody Question question) {

        Question savedQuestion = questionService.addQuestion(question);

        return new ResponseEntity<>(savedQuestion, HttpStatus.CREATED);
    }

    // ==========================
    // UPDATE QUESTION
    // ==========================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long id,
                                            @RequestBody Question question) {

        Question updatedQuestion = questionService.updateQuestion(id, question);

        if (updatedQuestion == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Question not found with id " + id);
        }

        return ResponseEntity.ok(updatedQuestion);
    }

    // ==========================
    // DELETE QUESTION
    // ==========================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {

        boolean deleted = questionService.deleteQuestion(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Question not found with id " + id);
        }

        return ResponseEntity.ok("Question deleted successfully");
    }
}