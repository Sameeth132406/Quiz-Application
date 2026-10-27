package com.examly.springapp.service;

import com.examly.springapp.model.ProctoringScreenshot;
import com.examly.springapp.repository.ProctoringScreenshotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScreenshotStorageServiceImpl implements ScreenshotStorageService {

    private static final Logger logger = LoggerFactory.getLogger(ScreenshotStorageServiceImpl.class);

    @Value("${proctoring.screenshot.storage-type:database}")
    private String storageType;

    @Value("${proctoring.screenshot.dir:uploads/proctoring}")
    private String storageDir;

    @Autowired
    private ProctoringScreenshotRepository screenshotRepository;

    @Override
    @Transactional
    public ProctoringScreenshot saveScreenshot(Long attemptId, Integer sequenceNumber,
                                               MultipartFile file, LocalDateTime capturedAt) throws IOException {
        String mimeType = file.getContentType();
        if (mimeType == null || mimeType.isBlank()) {
            mimeType = "image/jpeg";
        }
        long fileSize = file.getSize();
        LocalDateTime captureTime = capturedAt != null ? capturedAt : LocalDateTime.now();
        int seq = sequenceNumber != null ? sequenceNumber : 1;

        if ("filesystem".equalsIgnoreCase(storageType)) {
            // Option B: Store on disk
            Path attemptFolder = Paths.get(storageDir, "attempt_" + attemptId);
            if (!Files.exists(attemptFolder)) {
                Files.createDirectories(attemptFolder);
            }

            String ext = mimeType.contains("png") ? ".png" : mimeType.contains("webp") ? ".webp" : ".jpg";
            String filename = "seq_" + seq + "_" + System.currentTimeMillis() + ext;
            Path filePath = attemptFolder.resolve(filename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            ProctoringScreenshot screenshot = new ProctoringScreenshot(
                    attemptId, seq, captureTime, null, filePath.toString().replace("\\", "/"), mimeType, fileSize
            );
            return screenshotRepository.save(screenshot);
        } else {
            // Option A (Default): Store directly in MySQL as BLOB
            byte[] bytes = file.getBytes();
            ProctoringScreenshot screenshot = new ProctoringScreenshot(
                    attemptId, seq, captureTime, bytes, null, mimeType, fileSize
            );
            return screenshotRepository.save(screenshot);
        }
    }

    @Override
    public byte[] getScreenshotBytes(ProctoringScreenshot screenshot) throws IOException {
        if (screenshot == null) {
            return null;
        }

        // Check if stored in database BLOB
        if (screenshot.getImageData() != null && screenshot.getImageData().length > 0) {
            return screenshot.getImageData();
        }

        // Check if stored on filesystem
        if (screenshot.getStoragePath() != null) {
            Path path = Paths.get(screenshot.getStoragePath());
            if (Files.exists(path)) {
                return Files.readAllBytes(path);
            }
        }

        return null;
    }

    @Override
    @Transactional
    public void deleteScreenshot(ProctoringScreenshot screenshot) {
        if (screenshot == null) return;

        if (screenshot.getStoragePath() != null) {
            try {
                Path path = Paths.get(screenshot.getStoragePath());
                Files.deleteIfExists(path);
            } catch (Exception e) {
                logger.warn("Could not delete screenshot file: " + screenshot.getStoragePath(), e);
            }
        }

        screenshotRepository.delete(screenshot);
    }

    @Override
    @Transactional
    public int cleanupOldScreenshots(int retentionDays) {
        if (retentionDays <= 0) return 0;
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
        List<ProctoringScreenshot> oldScreenshots = screenshotRepository.findOlderThan(cutoff);
        int count = 0;
        for (ProctoringScreenshot s : oldScreenshots) {
            deleteScreenshot(s);
            count++;
        }
        logger.info("Cleaned up {} expired proctoring screenshots older than {} days", count, retentionDays);
        return count;
    }
}
