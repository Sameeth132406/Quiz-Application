package com.examly.springapp.service;

import com.examly.springapp.dto.ProctoringScreenshotDTO;
import com.examly.springapp.dto.ProctoringSummaryDTO;
import com.examly.springapp.model.QuizAttempt;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ProctoringService {

    QuizAttempt startProctoredAttempt(Long quizId, Long userId);

    ProctoringScreenshotDTO uploadScreenshot(Long attemptId, Integer sequenceNumber,
                                            String capturedAt, MultipartFile file,
                                            String currentUsername) throws IOException;

    List<ProctoringScreenshotDTO> getScreenshotsByAttempt(Long attemptId,
                                                         String currentUsername,
                                                         boolean isStaff);

    byte[] getScreenshotImage(Long screenshotId,
                              String currentUsername,
                              boolean isStaff) throws IOException;

    String getScreenshotMimeType(Long screenshotId);

    boolean deleteScreenshot(Long screenshotId,
                             String currentUsername,
                             boolean isStaff);

    ProctoringSummaryDTO getAttemptProctoringSummary(Long attemptId,
                                                   String currentUsername,
                                                   boolean isStaff);

    List<ProctoringSummaryDTO> getProctoringSummariesByQuiz(Long quizId,
                                                           String currentUsername,
                                                           boolean isStaff);
}
