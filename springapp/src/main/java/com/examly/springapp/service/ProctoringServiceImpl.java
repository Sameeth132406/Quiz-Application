package com.examly.springapp.service;

import com.examly.springapp.dto.ProctoringScreenshotDTO;
import com.examly.springapp.dto.ProctoringSummaryDTO;
import com.examly.springapp.enums.AttemptStatus;
import com.examly.springapp.enums.Role;
import com.examly.springapp.model.IntegrityEvent;
import com.examly.springapp.model.ProctoringScreenshot;
import com.examly.springapp.model.Quiz;
import com.examly.springapp.model.QuizAttempt;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.IntegrityEventRepository;
import com.examly.springapp.repository.ProctoringScreenshotRepository;
import com.examly.springapp.repository.QuizAttemptRepository;
import com.examly.springapp.repository.QuizRepository;
import com.examly.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProctoringServiceImpl implements ProctoringService {

    @Autowired
    private ProctoringScreenshotRepository screenshotRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IntegrityEventRepository integrityEventRepository;

    @Autowired
    private ScreenshotStorageService screenshotStorageService;

    @Override
    @Transactional
    public QuizAttempt startProctoredAttempt(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found with id: " + quizId));

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuizId(quizId);
        attempt.setUserId(userId);
        attempt.setScore(0);
        attempt.setStatus(AttemptStatus.IN_PROGRESS);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setTabSwitches(0);

        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        // Record initial integrity event: EXAM_STARTED
        IntegrityEvent event = new IntegrityEvent(
                null,
                userId,
                savedAttempt.getId(),
                "EXAM_STARTED",
                LocalDateTime.now().toString(),
                "Proctored assessment started under active screen sharing and fullscreen monitoring."
        );
        integrityEventRepository.save(event);

        return savedAttempt;
    }

    @Override
    @Transactional
    public ProctoringScreenshotDTO uploadScreenshot(Long attemptId, Integer sequenceNumber,
                                                    String capturedAtStr, MultipartFile file,
                                                    String currentUsername) throws IOException {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz attempt not found: " + attemptId));

        User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        if (currentUser == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        // Verify that student owns this attempt (or is staff)
        boolean isOwner = currentUser.getId().equals(attempt.getUserId());
        boolean isStaff = currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.EDUCATOR;
        if (!isOwner && !isStaff) {
            throw new AccessDeniedException("Unauthorized to upload screenshots to this attempt");
        }

        // Parse capturedAt
        LocalDateTime capturedAt = LocalDateTime.now();
        if (capturedAtStr != null && !capturedAtStr.isBlank()) {
            try {
                capturedAt = LocalDateTime.parse(capturedAtStr, DateTimeFormatter.ISO_DATE_TIME);
            } catch (Exception ignored) {
                try {
                    capturedAt = LocalDateTime.parse(capturedAtStr);
                } catch (Exception ignored2) {
                }
            }
        }

        ProctoringScreenshot screenshot = screenshotStorageService.saveScreenshot(
                attemptId, sequenceNumber, file, capturedAt
        );

        return mapToDTO(screenshot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProctoringScreenshotDTO> getScreenshotsByAttempt(Long attemptId, String currentUsername, boolean isStaff) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz attempt not found: " + attemptId));

        validateAccess(attempt, currentUsername, isStaff);

        return screenshotRepository.findByAttemptIdOrderBySequenceNumberAsc(attemptId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getScreenshotImage(Long screenshotId, String currentUsername, boolean isStaff) throws IOException {
        ProctoringScreenshot screenshot = screenshotRepository.findById(screenshotId)
                .orElseThrow(() -> new IllegalArgumentException("Screenshot not found: " + screenshotId));

        QuizAttempt attempt = quizAttemptRepository.findById(screenshot.getAttemptId())
                .orElseThrow(() -> new IllegalArgumentException("Quiz attempt not found: " + screenshot.getAttemptId()));

        validateAccess(attempt, currentUsername, isStaff);

        return screenshotStorageService.getScreenshotBytes(screenshot);
    }

    @Override
    public String getScreenshotMimeType(Long screenshotId) {
        return screenshotRepository.findById(screenshotId)
                .map(ProctoringScreenshot::getMimeType)
                .orElse("image/jpeg");
    }

    @Override
    @Transactional
    public boolean deleteScreenshot(Long screenshotId, String currentUsername, boolean isStaff) {
        ProctoringScreenshot screenshot = screenshotRepository.findById(screenshotId).orElse(null);
        if (screenshot == null) return false;

        QuizAttempt attempt = quizAttemptRepository.findById(screenshot.getAttemptId()).orElse(null);
        if (attempt != null) {
            validateAccess(attempt, currentUsername, isStaff);
        }

        screenshotStorageService.deleteScreenshot(screenshot);
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public ProctoringSummaryDTO getAttemptProctoringSummary(Long attemptId, String currentUsername, boolean isStaff) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz attempt not found: " + attemptId));

        validateAccess(attempt, currentUsername, isStaff);

        User student = userRepository.findById(attempt.getUserId()).orElse(null);
        Quiz quiz = quizRepository.findById(attempt.getQuizId()).orElse(null);

        ProctoringSummaryDTO summary = new ProctoringSummaryDTO();
        summary.setAttemptId(attempt.getId());
        summary.setQuizId(attempt.getQuizId());
        summary.setQuizTitle(quiz != null ? quiz.getTitle() : "Assessment #" + attempt.getQuizId());
        summary.setUserId(attempt.getUserId());
        summary.setStudentName(student != null ? student.getUsername() : "Student #" + attempt.getUserId());
        summary.setStudentEmail(student != null ? student.getEmail() : "");
        summary.setScore(attempt.getScore());
        summary.setStatus(attempt.getStatus() != null ? attempt.getStatus().name() : "IN_PROGRESS");
        summary.setStartedAt(attempt.getStartedAt());
        summary.setCompletedAt(attempt.getCompletedAt());

        if (attempt.getStartedAt() != null) {
            LocalDateTime end = attempt.getCompletedAt() != null ? attempt.getCompletedAt() : LocalDateTime.now();
            summary.setDurationSeconds(Duration.between(attempt.getStartedAt(), end).getSeconds());
        }

        // Fetch integrity events
        List<IntegrityEvent> events = integrityEventRepository.findByQuizAttemptId(attemptId);
        summary.setIntegrityEvents(events != null ? events : new ArrayList<>());

        int tabSwitches = 0;
        int fullscreenExits = 0;
        int screenShareInterrupts = 0;

        if (events != null) {
            for (IntegrityEvent e : events) {
                String type = e.getEventType() != null ? e.getEventType().toUpperCase() : "";
                if (type.contains("TAB_SWITCH") || type.contains("PAGE_HIDDEN")) {
                    tabSwitches++;
                } else if (type.contains("FULLSCREEN_EXIT")) {
                    fullscreenExits++;
                } else if (type.contains("SCREEN_SHARE_STOP")) {
                    screenShareInterrupts++;
                }
            }
        }

        // Fallback to attempt's tab switches if higher
        if (attempt.getTabSwitches() != null && attempt.getTabSwitches() > tabSwitches) {
            tabSwitches = attempt.getTabSwitches();
        }

        summary.setTabSwitches(tabSwitches);
        summary.setFullscreenExits(fullscreenExits);
        summary.setScreenShareInterrupts(screenShareInterrupts);

        // Transparent Integrity Score: 100 - (tab * 5) - (fullscreen * 10) - (screenshare * 15)
        int deductions = (tabSwitches * 5) + (fullscreenExits * 10) + (screenShareInterrupts * 15);
        int finalScore = Math.max(0, 100 - deductions);
        summary.setIntegrityScore(finalScore);

        // Fetch screenshots metadata
        List<ProctoringScreenshotDTO> screenshots = screenshotRepository
                .findByAttemptIdOrderBySequenceNumberAsc(attemptId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        summary.setScreenshots(screenshots);
        summary.setTotalScreenshots(screenshots.size());

        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProctoringSummaryDTO> getProctoringSummariesByQuiz(Long quizId, String currentUsername, boolean isStaff) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizId(quizId);
        List<ProctoringSummaryDTO> summaries = new ArrayList<>();
        for (QuizAttempt a : attempts) {
            try {
                summaries.add(getAttemptProctoringSummary(a.getId(), currentUsername, isStaff));
            } catch (Exception ignored) {
            }
        }
        return summaries;
    }

    private void validateAccess(QuizAttempt attempt, String currentUsername, boolean isStaff) {
        if (isStaff) return;
        User user = userRepository.findByUsername(currentUsername).orElse(null);
        if (user == null || !user.getId().equals(attempt.getUserId())) {
            throw new AccessDeniedException("Access denied to proctoring records for this attempt");
        }
    }

    private ProctoringScreenshotDTO mapToDTO(ProctoringScreenshot s) {
        return new ProctoringScreenshotDTO(
                s.getId(),
                s.getAttemptId(),
                s.getSequenceNumber(),
                s.getCapturedAt(),
                s.getMimeType(),
                s.getFileSize(),
                "/api/proctoring/screenshots/" + s.getId(),
                s.getCreatedAt()
        );
    }
}
