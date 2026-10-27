package com.examly.springapp.service;

import com.examly.springapp.model.ProctoringScreenshot;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

public interface ScreenshotStorageService {

    ProctoringScreenshot saveScreenshot(Long attemptId, Integer sequenceNumber,
                                        MultipartFile file, LocalDateTime capturedAt) throws IOException;

    byte[] getScreenshotBytes(ProctoringScreenshot screenshot) throws IOException;

    void deleteScreenshot(ProctoringScreenshot screenshot);

    int cleanupOldScreenshots(int retentionDays);
}
