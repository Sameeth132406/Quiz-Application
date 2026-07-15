package com.examly.springapp.controller;

import com.examly.springapp.model.Response;
import com.examly.springapp.service.ResponseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/responses")
@CrossOrigin(origins = "*")
public class ResponseController {

    @Autowired
    private ResponseService responseService;

    @GetMapping
    public ResponseEntity<List<Response>> getAllResponses() {
        return ResponseEntity.ok(responseService.getAllResponses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResponseById(@PathVariable Long id) {

        Response response = responseService.getResponseById(id);

        if (response == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Response not found");
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Response> addResponse(@RequestBody Response response) {

        return new ResponseEntity<>(
                responseService.addResponse(response),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateResponse(
            @PathVariable Long id,
            @RequestBody Response response) {

        Response updated = responseService.updateResponse(id, response);

        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Response not found");
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResponse(@PathVariable Long id) {

        if (!responseService.deleteResponse(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Response not found");
        }

        return ResponseEntity.ok("Response deleted successfully");
    }

    @GetMapping("/attempt/{attemptId}")
    public ResponseEntity<List<Response>> getByAttempt(
            @PathVariable Long attemptId) {

        return ResponseEntity.ok(
                responseService.getByAttempt(attemptId));
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<Response>> getByQuestion(
            @PathVariable Long questionId) {

        return ResponseEntity.ok(
                responseService.getByQuestion(questionId));
    }

    @GetMapping("/correct")
    public ResponseEntity<List<Response>> getCorrectResponses() {

        return ResponseEntity.ok(
                responseService.getCorrectResponses());
    }

    @GetMapping("/incorrect")
    public ResponseEntity<List<Response>> getIncorrectResponses() {

        return ResponseEntity.ok(
                responseService.getIncorrectResponses());
    }
}