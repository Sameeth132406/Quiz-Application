package com.examly.springapp.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.AccessDeniedException;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {


    // ==============================
    // RESOURCE NOT FOUND - 404
    // ==============================
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFound(
            ResourceNotFoundException ex) {

        Map<String, Object> body = new LinkedHashMap<>();

        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());

        return new ResponseEntity<>(
                body,
                HttpStatus.NOT_FOUND
        );
    }



    // ==============================
    // DUPLICATE RESOURCE - 409
    // ==============================
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Object> handleDuplicateResource(
            DuplicateResourceException ex) {

        Map<String, Object> body = new LinkedHashMap<>();

        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "Conflict");
        body.put("message", ex.getMessage());

        return new ResponseEntity<>(
                body,
                HttpStatus.CONFLICT
        );
    }



    // ==============================
    // UNAUTHORIZED - 401
    // ==============================
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Object> handleUnauthorized(
            UnauthorizedException ex) {

        Map<String, Object> body = new LinkedHashMap<>();

        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.UNAUTHORIZED.value());
        body.put("error", "Unauthorized");
        body.put("message", ex.getMessage());

        return new ResponseEntity<>(
                body,
                HttpStatus.UNAUTHORIZED
        );
    }



    // ==============================
    // ACCESS DENIED - 403
    // ==============================
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDenied(
            AccessDeniedException ex) {

        Map<String, Object> body = new LinkedHashMap<>();

        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("error", "Forbidden");
        body.put("message",
                "You do not have permission to access this resource");

        return new ResponseEntity<>(
                body,
                HttpStatus.FORBIDDEN
        );
    }



    // ==============================
    // ALL OTHER EXCEPTIONS - 500
    // ==============================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleException(
            Exception ex) {

        Map<String, Object> body = new LinkedHashMap<>();

        body.put("timestamp", LocalDateTime.now());
        body.put("status",
                HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error",
                "Internal Server Error");
        body.put("message",
                ex.getMessage());

        return new ResponseEntity<>(
                body,
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}