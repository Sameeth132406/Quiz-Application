package com.examly.springapp.controller;

import com.examly.springapp.model.ChatMessage;
import com.examly.springapp.model.CourseEnrollment;
import com.examly.springapp.model.MentorAssignment;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.ChatMessageRepository;
import com.examly.springapp.repository.CourseEnrollmentRepository;
import com.examly.springapp.repository.CourseRepository;
import com.examly.springapp.repository.MentorAssignmentRepository;
import com.examly.springapp.repository.UserRepository;
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
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/mentor")
public class MentorController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    private MentorAssignmentRepository mentorRepo;

    @Autowired
    private ChatMessageRepository chatRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepo;

    @Autowired
    private CourseRepository courseRepo;

    private User getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepo.findByUsername(auth.getName()).orElse(null);
    }

    // ----- MENTOR ASSIGNMENT & DIRECTORY ENDPOINTS -----

    /**
     * GET /api/mentor/admins - list all administrators (for educators to communicate and send reports to)
     */
    @GetMapping("/admins")
    public ResponseEntity<?> listAdmins() {
        List<User> allUsers = userRepo.findAll();
        List<Map<String, Object>> admins = new ArrayList<>();
        for (User u : allUsers) {
            if (u.getRole() != null && u.getRole().name().equals("ADMIN")) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", u.getId());
                m.put("username", u.getUsername());
                m.put("email", u.getEmail());
                m.put("role", u.getRole().name());
                admins.add(m);
            }
        }
        return ResponseEntity.ok(admins);
    }

    /**
     * GET /api/mentor/educators - list all educators (for students to choose from, or admin to view)
     */
    @GetMapping("/educators")
    public ResponseEntity<?> listEducators() {
        List<User> allUsers = userRepo.findAll();
        List<Map<String, Object>> educators = new ArrayList<>();
        for (User u : allUsers) {
            if (u.getRole() != null && u.getRole().name().equals("EDUCATOR")) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", u.getId());
                m.put("username", u.getUsername());
                m.put("email", u.getEmail());
                m.put("role", u.getRole().name());
                long assignedCount = mentorRepo.findByEducatorId(u.getId()).size();
                m.put("assignedStudentsCount", assignedCount);
                long coursesCount = courseRepo.findAll().stream()
                    .filter(c -> u.getId().equals(c.getEducatorId()))
                    .count();
                m.put("coursesCount", coursesCount);
                educators.add(m);
            }
        }
        return ResponseEntity.ok(educators);
    }

    /**
     * GET /api/mentor/educators/{educatorId}/students - admin or educator views assigned students for a specific educator
     */
    @GetMapping("/educators/{educatorId}/students")
    public ResponseEntity<?> getStudentsByEducator(@PathVariable Long educatorId, Authentication auth) {
        User current = getCurrentUser(auth);
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        boolean isAdmin = current.getRole() != null && current.getRole().name().equals("ADMIN");
        if (!isAdmin && !current.getId().equals(educatorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
        }

        List<MentorAssignment> assignments = mentorRepo.findByEducatorId(educatorId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (MentorAssignment ma : assignments) {
            User student = userRepo.findById(ma.getStudentId()).orElse(null);
            if (student == null) continue;

            Double progress = 0.0;
            Optional<CourseEnrollment> enrollment = enrollmentRepo
                .findByCourseIdAndStudentId(ma.getCourseId(), ma.getStudentId());
            if (enrollment.isPresent() && enrollment.get().getProgressPercentage() != null) {
                progress = enrollment.get().getProgressPercentage();
            }

            String courseTitle = courseRepo.findById(ma.getCourseId())
                .map(c -> c.getTitle() != null && !c.getTitle().isBlank() ? c.getTitle() : c.getCourseName())
                .orElse("Course");

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("assignmentId", ma.getId());
            entry.put("studentId", student.getId());
            entry.put("studentName", student.getUsername());
            entry.put("studentEmail", student.getEmail());
            entry.put("courseId", ma.getCourseId());
            entry.put("courseTitle", courseTitle);
            entry.put("progress", progress);
            entry.put("assignedAt", ma.getAssignedAt().toString());
            result.add(entry);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/mentor/assign - student assigns a mentor for a course
     * Body: { educatorId, courseId }
     */
    @PostMapping("/assign")
    public ResponseEntity<?> assignMentor(@RequestBody Map<String, Long> body, Authentication auth) {
        User student = getCurrentUser(auth);
        if (student == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Long educatorId = body.get("educatorId");
        Long courseId = body.get("courseId");
        if (educatorId == null || courseId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "educatorId and courseId required"));
        }

        User educator = userRepo.findById(educatorId).orElse(null);
        if (educator == null || educator.getRole() == null || !educator.getRole().name().equals("EDUCATOR")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only educators can be assigned as mentors. Students cannot be assigned to an admin."));
        }

        // Remove existing assignment for this course if any
        mentorRepo.findByStudentIdAndCourseId(student.getId(), courseId)
            .ifPresent(existing -> mentorRepo.delete(existing));

        MentorAssignment assignment = new MentorAssignment();
        assignment.setStudentId(student.getId());
        assignment.setEducatorId(educatorId);
        assignment.setCourseId(courseId);
        MentorAssignment saved = mentorRepo.save(assignment);

        return ResponseEntity.ok(Map.of(
            "id", saved.getId(),
            "educatorId", saved.getEducatorId(),
            "courseId", saved.getCourseId(),
            "assignedAt", saved.getAssignedAt().toString()
        ));
    }

    /**
     * GET /api/mentor/my-mentor?courseId=X - student gets their mentor for a course
     */
    @GetMapping("/my-mentor")
    public ResponseEntity<?> getMyMentor(@RequestParam Long courseId, Authentication auth) {
        User student = getCurrentUser(auth);
        if (student == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<MentorAssignment> assignment = mentorRepo.findByStudentIdAndCourseId(student.getId(), courseId);
        if (assignment.isEmpty()) {
            return ResponseEntity.ok(Map.of("assigned", false));
        }
        MentorAssignment ma = assignment.get();
        User educator = userRepo.findById(ma.getEducatorId()).orElse(null);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("assigned", true);
        result.put("educatorId", ma.getEducatorId());
        result.put("educatorName", educator != null ? educator.getUsername() : "Unknown");
        result.put("educatorEmail", educator != null ? educator.getEmail() : "");
        result.put("assignedAt", ma.getAssignedAt().toString());
        return ResponseEntity.ok(result);
    }

    /**
     * DELETE /api/mentor/unassign?courseId=X - student removes their mentor
     */
    @DeleteMapping("/unassign")
    public ResponseEntity<?> unassignMentor(@RequestParam Long courseId, Authentication auth) {
        User student = getCurrentUser(auth);
        if (student == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        mentorRepo.findByStudentIdAndCourseId(student.getId(), courseId)
            .ifPresent(ma -> mentorRepo.delete(ma));
        return ResponseEntity.ok(Map.of("message", "Mentor unassigned"));
    }

    /**
     * GET /api/mentor/my-students - educator gets all their assigned students with progress
     */
    @GetMapping("/my-students")
    public ResponseEntity<?> getMyStudents(Authentication auth) {
        User educator = getCurrentUser(auth);
        if (educator == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<MentorAssignment> assignments = mentorRepo.findByEducatorId(educator.getId());
        List<Map<String, Object>> result = new ArrayList<>();
        for (MentorAssignment ma : assignments) {
            User student = userRepo.findById(ma.getStudentId()).orElse(null);
            if (student == null) continue;

            // Get course enrollment progress
            Double progress = null;
            Optional<CourseEnrollment> enrollment = enrollmentRepo
                .findByCourseIdAndStudentId(ma.getCourseId(), ma.getStudentId());
            if (enrollment.isPresent()) {
                progress = enrollment.get().getProgressPercentage();
            }

            // Unread messages from student
            long unread = chatRepo.countByRecipientIdAndReadFalse(educator.getId());

            String courseTitle = courseRepo.findById(ma.getCourseId())
                .map(c -> c.getTitle() != null && !c.getTitle().isBlank() ? c.getTitle() : c.getCourseName())
                .orElse("Course");

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("assignmentId", ma.getId());
            entry.put("studentId", student.getId());
            entry.put("studentName", student.getUsername());
            entry.put("studentEmail", student.getEmail());
            entry.put("courseId", ma.getCourseId());
            entry.put("courseTitle", courseTitle);
            entry.put("progress", progress != null ? progress : 0.0);
            entry.put("assignedAt", ma.getAssignedAt().toString());
            result.add(entry);
        }
        return ResponseEntity.ok(result);
    }

    // ----- CHAT & REPORT COMMUNICATION ENDPOINTS -----

    /**
     * GET /api/mentor/chat?withUserId=X&courseId=Y - get conversation messages including media attachments
     */
    @GetMapping("/chat")
    public ResponseEntity<?> getConversation(
            @RequestParam Long withUserId,
            @RequestParam(required = false) Long courseId,
            Authentication auth) {
        User me = getCurrentUser(auth);
        if (me == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<ChatMessage> messages = chatRepo.findConversation(me.getId(), withUserId, courseId);

        // Mark messages sent to me as read
        messages.forEach(msg -> {
            if (msg.getRecipientId().equals(me.getId()) && !msg.isRead()) {
                msg.setRead(true);
                chatRepo.save(msg);
            }
        });

        List<Map<String, Object>> result = messages.stream().map(msg -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", msg.getId());
            m.put("senderId", msg.getSenderId());
            m.put("senderName", msg.getSender() != null ? msg.getSender().getUsername() : "");
            m.put("recipientId", msg.getRecipientId());
            m.put("content", msg.getContent());
            m.put("fileUrl", msg.getFileUrl());
            m.put("fileName", msg.getFileName());
            m.put("fileType", msg.getFileType());
            m.put("fileSize", msg.getFileSize());
            m.put("sentAt", msg.getSentAt().toString());
            m.put("read", msg.isRead());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/mentor/chat/upload - upload report or media attachment
     */
    @PostMapping("/chat/upload")
    public ResponseEntity<?> uploadChatFile(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        User sender = getCurrentUser(auth);
        if (sender == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File cannot be empty"));
        }

        try {
            String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            if (originalFilename.contains("..")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid filename sequence"));
            }

            String extension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = originalFilename.substring(dotIndex);
                originalFilename = originalFilename.substring(0, dotIndex);
            }

            String sanitizedBase = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
            String uniqueFileName = sanitizedBase + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;

            Path chatDir = Paths.get(uploadDir, "chat").toAbsolutePath().normalize();
            Files.createDirectories(chatDir);
            Path targetLocation = chatDir.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/api/files/chat/" + uniqueFileName;
            String originalFullName = originalFilename + extension;

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("fileUrl", fileUrl);
            resp.put("fileName", originalFullName);
            resp.put("fileType", file.getContentType() != null ? file.getContentType() : "application/octet-stream");
            resp.put("fileSize", file.getSize());

            return ResponseEntity.ok(resp);
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload file: " + ex.getMessage()));
        }
    }

    /**
     * POST /api/mentor/chat/send - send a message or report with optional media attachment
     * Body: { recipientId, content, courseId, fileUrl, fileName, fileType, fileSize }
     */
    @PostMapping("/chat/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> body, Authentication auth) {
        User sender = getCurrentUser(auth);
        if (sender == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Long recipientId = body.get("recipientId") != null ? Long.parseLong(body.get("recipientId").toString()) : null;
        String content = (String) body.get("content");
        Long courseId = body.get("courseId") != null ? Long.parseLong(body.get("courseId").toString()) : null;
        String fileUrl = (String) body.get("fileUrl");
        String fileName = (String) body.get("fileName");
        String fileType = (String) body.get("fileType");
        Long fileSize = body.get("fileSize") != null ? Long.parseLong(body.get("fileSize").toString()) : null;

        boolean hasContent = content != null && !content.trim().isEmpty();
        boolean hasFile = fileUrl != null && !fileUrl.trim().isEmpty();

        if (recipientId == null || (!hasContent && !hasFile)) {
            return ResponseEntity.badRequest().body(Map.of("message", "recipientId and either content or a file required"));
        }

        ChatMessage msg = new ChatMessage();
        msg.setSenderId(sender.getId());
        msg.setRecipientId(recipientId);
        msg.setCourseId(courseId);
        msg.setContent(hasContent ? content.trim() : (fileName != null ? fileName : "Shared a file"));
        msg.setFileUrl(fileUrl);
        msg.setFileName(fileName);
        msg.setFileType(fileType);
        msg.setFileSize(fileSize);

        ChatMessage saved = chatRepo.save(msg);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", saved.getId());
        result.put("senderId", saved.getSenderId());
        result.put("senderName", sender.getUsername());
        result.put("recipientId", saved.getRecipientId());
        result.put("content", saved.getContent());
        result.put("fileUrl", saved.getFileUrl());
        result.put("fileName", saved.getFileName());
        result.put("fileType", saved.getFileType());
        result.put("fileSize", saved.getFileSize());
        result.put("sentAt", saved.getSentAt().toString());
        result.put("read", saved.isRead());

        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/mentor/chat/unread-count - get unread message count for current user
     */
    @GetMapping("/chat/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication auth) {
        User me = getCurrentUser(auth);
        if (me == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        long count = chatRepo.countByRecipientIdAndReadFalse(me.getId());
        return ResponseEntity.ok(Map.of("unread", count));
    }
}
