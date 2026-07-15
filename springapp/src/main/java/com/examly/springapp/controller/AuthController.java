package com.examly.springapp.controller;

import com.examly.springapp.dto.LoginRequestDTO;
import com.examly.springapp.dto.LoginResponseDTO;
import com.examly.springapp.model.User;
import com.examly.springapp.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        User savedUser = authService.register(user);

        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody LoginRequestDTO request) {

        LoginResponseDTO response = authService.login(request);

        return ResponseEntity.ok(response);
    }
}