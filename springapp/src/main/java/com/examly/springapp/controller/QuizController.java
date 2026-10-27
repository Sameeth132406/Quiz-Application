package com.examly.springapp.controller;

import com.examly.springapp.enums.Difficulty;
import com.examly.springapp.model.Quiz;
import com.examly.springapp.service.QuizService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired
    private QuizService quizService;


    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR','STUDENT')")
    public ResponseEntity<List<Quiz>> getAllQuizzes() {

        return ResponseEntity.ok(
                quizService.getAllQuizzes()
        );
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR','STUDENT')")
    public ResponseEntity<?> getQuizById(
            @PathVariable Long id) {


        Quiz quiz = quizService.getQuizById(id);


        if (quiz == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Quiz not found with id " + id);
        }


        return ResponseEntity.ok(quiz);
    }



    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<Quiz> addQuiz(
            @RequestBody Quiz quiz) {


        Quiz savedQuiz =
                quizService.addQuiz(quiz);


        return new ResponseEntity<>(
                savedQuiz,
                HttpStatus.CREATED
        );
    }



   
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> updateQuiz(
            @PathVariable Long id,
            @RequestBody Quiz quiz) {


        Quiz updatedQuiz =
                quizService.updateQuiz(id, quiz);


        if (updatedQuiz == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Quiz not found with id " + id);
        }


        return ResponseEntity.ok(updatedQuiz);
    }

    @PutMapping("/{id}/publish-results")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR')")
    public ResponseEntity<?> setPublishResults(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "true") boolean published) {

        Quiz updatedQuiz = quizService.setResultsPublished(id, published);
        if (updatedQuiz == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Quiz not found with id " + id);
        }
        return ResponseEntity.ok(updatedQuiz);
    }



    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteQuiz(
            @PathVariable Long id) {


        boolean deleted =
                quizService.deleteQuiz(id);


        if (!deleted) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Quiz not found with id " + id);
        }


        return ResponseEntity.ok(
                "Quiz deleted successfully"
        );
    }


    @GetMapping("/search/title")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR','STUDENT')")
    public ResponseEntity<List<Quiz>> searchByTitle(
            @RequestParam String keyword) {


        return ResponseEntity.ok(
                quizService.searchByTitle(keyword)
        );
    }


    @GetMapping("/search/description")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR','STUDENT')")
    public ResponseEntity<List<Quiz>> searchByDescription(
            @RequestParam String keyword) {


        return ResponseEntity.ok(
                quizService.searchByDescription(keyword)
        );
    }


    @GetMapping("/category")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR','STUDENT')")
    public ResponseEntity<List<Quiz>> getByCategory(
            @RequestParam String category) {


        return ResponseEntity.ok(
                quizService.searchByCategory(category)
        );
    }


    @GetMapping("/difficulty")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR','STUDENT')")
    public ResponseEntity<List<Quiz>> getByDifficulty(
            @RequestParam Difficulty difficulty) {


        return ResponseEntity.ok(
                quizService.getByDifficulty(difficulty)
        );
    }


    @GetMapping("/duration")
    @PreAuthorize("hasAnyRole('ADMIN','EDUCATOR','STUDENT')")
    public ResponseEntity<List<Quiz>> getByDuration(
            @RequestParam Integer duration) {


        return ResponseEntity.ok(
                quizService.getByDuration(duration)
        );
    }
}