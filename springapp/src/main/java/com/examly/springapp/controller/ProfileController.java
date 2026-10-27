package com.examly.springapp.controller;

import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    private static final Pattern GMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@gmail\\.com$", Pattern.CASE_INSENSITIVE);
    private static final Pattern PAN_PATTERN = Pattern.compile("^[A-Z]{5}[0-9]{4}[A-Z]$", Pattern.CASE_INSENSITIVE);

    /**
     * GET /api/profile - current user gets their own profile details
     */
    @GetMapping
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User profile not found");
        }
        user.setPassword(null); // never expose password hash
        return ResponseEntity.ok(user);
    }

    /**
     * POST /api/profile/photo - upload user avatar / profile picture
     */
    @PostMapping("/photo")
    public ResponseEntity<?> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please select a photo to upload."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only image files (PNG, JPEG, WEBP) are allowed for profile photo."));
        }

        try {
            String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String extension = ".png";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = originalFilename.substring(dotIndex);
            }

            String uniqueFileName = "avatar_" + user.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            Path avatarDir = Paths.get(uploadDir, "avatars").toAbsolutePath().normalize();
            Files.createDirectories(avatarDir);
            Path targetLocation = avatarDir.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String photoUrl = "/api/files/avatars/" + uniqueFileName;
            user.setProfilePictureUrl(photoUrl);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "profilePictureUrl", photoUrl,
                    "message", "Profile photo uploaded successfully!"
            ));
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload photo: " + ex.getMessage()));
        }
    }

    /**
     * PUT /api/profile - current user updates their basic details, KYC, and role-specific details
     * Enforces strict validation:
     * - Email ending with @gmail.com
     * - Phone number exactly 10 digits
     * - Aadhaar number exactly 12 digits
     * - PAN number valid 10-character code
     * - Character lengths (name, etc.)
     */
    @PutMapping
    public ResponseEntity<?> updateMyProfile(@RequestBody User profileData, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User profile not found");
        }

        // --- VALIDATION RULES ---

        // 1. Full Name: Required, between 2 and 100 characters
        if (profileData.getFullName() == null || profileData.getFullName().trim().length() < 2) {
            return ResponseEntity.badRequest().body(Map.of("message", "Full Name is required and must be at least 2 characters long."));
        }
        if (profileData.getFullName().trim().length() > 100) {
            return ResponseEntity.badRequest().body(Map.of("message", "Full Name must not exceed 100 characters."));
        }

        // 2. Email: Must end with @gmail.com
        if (profileData.getEmail() == null || !GMAIL_PATTERN.matcher(profileData.getEmail().trim()).matches()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email ID must be a valid address ending with @gmail.com (e.g. yourname@gmail.com)."));
        }

        // 3. Phone Number: Must be strictly 10 digits
        if (profileData.getPhoneNumber() != null && !profileData.getPhoneNumber().trim().isEmpty()) {
            String cleanPhone = profileData.getPhoneNumber().replaceAll("[^0-9]", "");
            if (cleanPhone.length() != 10) {
                return ResponseEntity.badRequest().body(Map.of("message", "Phone number must be exactly 10 digits (digits only)."));
            }
            profileData.setPhoneNumber(cleanPhone);
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is required and must be exactly 10 digits."));
        }

        // 4. Aadhaar Number: Must be strictly 12 digits
        if (profileData.getAadhaarNumber() != null && !profileData.getAadhaarNumber().trim().isEmpty()) {
            String cleanAadhaar = profileData.getAadhaarNumber().replaceAll("[^0-9]", "");
            if (cleanAadhaar.length() != 12) {
                return ResponseEntity.badRequest().body(Map.of("message", "Aadhaar number must contain exactly 12 digits."));
            }
            // Format neatly as XXXX-XXXX-XXXX
            profileData.setAadhaarNumber(cleanAadhaar.substring(0, 4) + "-" + cleanAadhaar.substring(4, 8) + "-" + cleanAadhaar.substring(8, 12));
        }

        // 5. PAN Number: Standard 10 alphanumeric characters (e.g. ABCDE1234F)
        if (profileData.getPanNumber() != null && !profileData.getPanNumber().trim().isEmpty()) {
            String cleanPan = profileData.getPanNumber().trim().toUpperCase();
            if (!PAN_PATTERN.matcher(cleanPan).matches()) {
                return ResponseEntity.badRequest().body(Map.of("message", "PAN number must be a valid 10-character code (5 letters, 4 numbers, 1 letter, e.g. ABCDE1234F)."));
            }
            profileData.setPanNumber(cleanPan);
        }

        // Preserve security properties
        profileData.setRole(user.getRole());
        profileData.setUsername(user.getUsername());
        if (profileData.getPassword() == null || profileData.getPassword().isBlank()) {
            profileData.setPassword(user.getPassword());
        }
        if (profileData.getProfilePictureUrl() == null && user.getProfilePictureUrl() != null) {
            profileData.setProfilePictureUrl(user.getProfilePictureUrl());
        }

        User updated = userService.updateUser(user.getId(), profileData);
        if (updated != null) {
            updated.setPassword(null);
        }
        return ResponseEntity.ok(updated);
    }
}
