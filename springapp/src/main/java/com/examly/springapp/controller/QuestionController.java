package com.examly.springapp.controller;

import java.util.List;
import java.util.stream.Collectors;

import com.examly.springapp.dto.StudentQuestionDTO;
import com.examly.springapp.model.Question;
import com.examly.springapp.service.QuestionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    // =========================================================
    // ADMIN / EDUCATOR
    // Get all questions of a quiz INCLUDING correct answer
    // =========================================================

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<Question>> getQuestionsByQuiz(
            @PathVariable Long quizId) {

        return ResponseEntity.ok(
                questionService.getQuestionsByQuiz(quizId)
        );
    }

    // =========================================================
    // STUDENT
    // Get questions WITHOUT correct answer
    // =========================================================

    @GetMapping("/quiz/{quizId}/student")
    public ResponseEntity<List<StudentQuestionDTO>> getQuestionsForStudent(
            @PathVariable Long quizId,
            @RequestParam(required = false, defaultValue = "false") boolean randomize) {

        List<Question> questions =
                questionService.getQuestionsByQuiz(quizId);

        if (randomize && questions != null && !questions.isEmpty()) {
            questions = new java.util.ArrayList<>(questions);
            java.util.Collections.shuffle(questions);
        }

        List<StudentQuestionDTO> studentQuestions =
                questions.stream()
                        .map(question -> new StudentQuestionDTO(
                                question.getId(),
                                question.getQuizId(),
                                question.getQuestionText(),
                                question.getOptionA(),
                                question.getOptionB(),
                                question.getOptionC(),
                                question.getOptionD(),
                                String.valueOf(question.getQuestionType()),
                                question.getMarks()
                        ))
                        .collect(Collectors.toList());

        return ResponseEntity.ok(studentQuestions);
    }

    // =========================================================
    // GET ALL QUESTIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {

        return ResponseEntity.ok(
                questionService.getAllQuestions()
        );
    }

    // =========================================================
    // GET QUESTION BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionById(
            @PathVariable Long id) {

        Question question =
                questionService.getQuestionById(id);

        if (question == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Question not found with id " + id);
        }

        return ResponseEntity.ok(question);
    }

    // =========================================================
    // ADD QUESTION
    // =========================================================

    @PostMapping
    public ResponseEntity<Question> addQuestion(
            @RequestBody Question question) {

        Question savedQuestion =
                questionService.addQuestion(question);

        return new ResponseEntity<>(
                savedQuestion,
                HttpStatus.CREATED
        );
    }

    // =========================================================
    // UPDATE QUESTION
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(
            @PathVariable Long id,
            @RequestBody Question question) {

        Question updatedQuestion =
                questionService.updateQuestion(id, question);

        if (updatedQuestion == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Question not found with id " + id);
        }

        return ResponseEntity.ok(updatedQuestion);
    }

    // =========================================================
    // DELETE QUESTION
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(
            @PathVariable Long id) {

        boolean deleted =
                questionService.deleteQuestion(id);

        if (!deleted) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Question not found with id " + id);
        }

        return ResponseEntity.ok(
                "Question deleted successfully"
        );
    }
}