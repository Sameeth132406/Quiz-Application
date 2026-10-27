package com.examly.springapp.controller;

import com.examly.springapp.dto.LeaderboardDTO;
import com.examly.springapp.dto.LeaderboardEntryDTO;
import com.examly.springapp.model.Leaderboard;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboards")
@CrossOrigin(origins = "*")
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        return userRepository.findByUsername(authentication.getName()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<LeaderboardDTO>> getAllLeaderboards(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Long userId = user != null ? user.getId() : null;
        String role = user != null && user.getRole() != null ? user.getRole().name() : "STUDENT";
        return ResponseEntity.ok(leaderboardService.getAllLeaderboards(userId, role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLeaderboardById(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Long userId = user != null ? user.getId() : null;
        String role = user != null && user.getRole() != null ? user.getRole().name() : "STUDENT";

        LeaderboardDTO dto = leaderboardService.getLeaderboardById(id, userId, role);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Leaderboard not found or not accessible.");
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<?> createLeaderboard(@RequestBody Leaderboard leaderboard, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only educators and administrators can create leaderboards.");
        }

        Long userId = user != null ? user.getId() : 1L;
        LeaderboardDTO created = leaderboardService.createLeaderboard(leaderboard, userId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLeaderboard(@PathVariable Long id, @RequestBody Leaderboard leaderboard, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only educators and administrators can update leaderboards.");
        }

        Long userId = user != null ? user.getId() : null;
        String role = user != null && user.getRole() != null ? user.getRole().name() : "EDUCATOR";
        LeaderboardDTO updated = leaderboardService.updateLeaderboard(id, leaderboard, userId, role);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Leaderboard not found with id: " + id);
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeaderboard(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only educators and administrators can delete leaderboards.");
        }

        Long userId = user != null ? user.getId() : null;
        String role = user != null && user.getRole() != null ? user.getRole().name() : "EDUCATOR";
        boolean deleted = leaderboardService.deleteLeaderboard(id, userId, role);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Leaderboard not found with id: " + id);
        }
        return ResponseEntity.ok("Leaderboard deleted successfully");
    }

    @GetMapping("/{id}/entries")
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboardEntries(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(leaderboardService.getLeaderboardEntries(id, userId, page, size));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboardsByCourse(
            @PathVariable Long courseId,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Long userId = user != null ? user.getId() : null;
        String role = user != null && user.getRole() != null ? user.getRole().name() : "STUDENT";
        return ResponseEntity.ok(leaderboardService.getLeaderboardsByCourse(courseId, userId, role));
    }

    @GetMapping("/{id}/my-rank")
    public ResponseEntity<?> getMyRank(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
        }

        LeaderboardEntryDTO rankDTO = leaderboardService.getMyRank(id, user.getId());
        if (rankDTO == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No leaderboard entry found for this user.");
        }
        return ResponseEntity.ok(rankDTO);
    }

    @PostMapping("/{id}/refresh")
    public ResponseEntity<?> refreshLeaderboard(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user != null && user.getRole() == com.examly.springapp.enums.Role.STUDENT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only educators and administrators can refresh leaderboards.");
        }

        List<LeaderboardEntryDTO> entries = leaderboardService.refreshLeaderboard(id);
        return ResponseEntity.ok(entries);
    }
}
