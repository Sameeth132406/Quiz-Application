package com.examly.springapp.controller;

import com.examly.springapp.dto.BadgeDTO;
import com.examly.springapp.dto.StudentBadgeDTO;
import com.examly.springapp.model.Badge;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.BadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = "*")
public class BadgeController {

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        return userRepository.findByUsername(authentication.getName()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<BadgeDTO>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBadgeById(@PathVariable Long id) {
        BadgeDTO badge = badgeService.getBadgeById(id);
        if (badge == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Badge not found with id: " + id);
        }
        return ResponseEntity.ok(badge);
    }

    @PostMapping
    public ResponseEntity<?> createBadge(@RequestBody Badge badge, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only educators and administrators can create badges.");
        }

        BadgeDTO created = badgeService.createBadge(badge);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBadge(@PathVariable Long id, @RequestBody Badge badge, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only educators and administrators can modify badges.");
        }

        BadgeDTO updated = badgeService.updateBadge(id, badge);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Badge not found with id: " + id);
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBadge(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only educators and administrators can delete badges.");
        }

        boolean deleted = badgeService.deleteBadge(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Badge not found with id: " + id);
        }
        return ResponseEntity.ok("Badge deleted successfully");
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentBadges(@PathVariable Long studentId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
            if (!user.getId().equals(studentId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: You can only view your own achievements.");
            }
        }

        List<StudentBadgeDTO> list = badgeService.getStudentBadges(studentId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyBadges(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
        }

        List<StudentBadgeDTO> list = badgeService.getMyBadges(user.getId());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/evaluate/{studentId}")
    public ResponseEntity<?> evaluateBadges(@PathVariable Long studentId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
            if (!user.getId().equals(studentId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
            }
        }

        List<StudentBadgeDTO> list = badgeService.evaluateAndAwardBadges(studentId, null);
        return ResponseEntity.ok(list);
    }
}
