package com.examly.springapp.controller;

import com.examly.springapp.model.User;
import com.examly.springapp.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // ==========================
    // GET ALL USERS
    // ==========================
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ==========================
    // GET USER BY ID
    // ==========================
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {

        User user = userService.getUserById(id);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found with id " + id);
        }

        return ResponseEntity.ok(user);
    }

    // ==========================
    // ADD USER
    // ==========================
    @PostMapping
    public ResponseEntity<User> addUser(@RequestBody User user) {

        User savedUser = userService.addUser(user);

        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    // ==========================
    // UPDATE USER
    // ==========================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody User user) {

        User updatedUser = userService.updateUser(id, user);

        if (updatedUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found with id " + id);
        }

        return ResponseEntity.ok(updatedUser);
    }

    // ==========================
    // DELETE USER
    // ==========================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {

        boolean deleted = userService.deleteUser(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found with id " + id);
        }

        return ResponseEntity.ok("User deleted successfully");
    }
}