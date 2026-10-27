package com.examly.springapp.controller;

import com.examly.springapp.model.CourseContent;
import com.examly.springapp.repository.CourseContentRepository;
import com.examly.springapp.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@CrossOrigin(origins = "*")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private CourseContentRepository courseContentRepository;

    private String detectContentType(String pathStr) {
        if (pathStr == null) return "application/octet-stream";
        String lower = pathStr.toLowerCase();
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".mp4")) return "video/mp4";
        if (lower.endsWith(".mp3")) return "audio/mpeg";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lower.endsWith(".doc")) return "application/msword";
        if (lower.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        if (lower.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
        if (lower.endsWith(".txt")) return "text/plain";
        return "application/octet-stream";
    }

    @GetMapping("/api/files/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        String fullPath = request.getRequestURI();
        String relativePath = fullPath.substring(fullPath.indexOf("/api/files/") + "/api/files/".length());

        Resource resource = fileStorageService.loadFileAsResource(relativePath);
        if (resource == null || !resource.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String contentType = null;
        try {
            Path path = resource.getFile().toPath();
            contentType = Files.probeContentType(path);
        } catch (Exception ex) {
            // fallback
        }

        if (contentType == null) {
            contentType = detectContentType(relativePath);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/api/content/{contentId}/file")
    public ResponseEntity<Resource> serveContentFile(@PathVariable Long contentId) {
        CourseContent content = courseContentRepository.findById(contentId).orElse(null);
        if (content == null || content.getContentUrl() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Resource resource = fileStorageService.loadFileAsResource(content.getContentUrl());
        if (resource == null || !resource.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String mimeType = content.getMimeType();
        if (mimeType == null || mimeType.isEmpty() || "application/octet-stream".equals(mimeType)) {
            mimeType = detectContentType(content.getFileName() != null ? content.getFileName() : content.getContentUrl());
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + (content.getFileName() != null ? content.getFileName() : resource.getFilename()) + "\"")
                .body(resource);
    }

    @GetMapping("/api/content/{contentId}/download")
    public ResponseEntity<Resource> downloadContentFile(@PathVariable Long contentId) {
        CourseContent content = courseContentRepository.findById(contentId).orElse(null);
        if (content == null || content.getContentUrl() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (Boolean.FALSE.equals(content.getIsDownloadable())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Resource resource = fileStorageService.loadFileAsResource(content.getContentUrl());
        if (resource == null || !resource.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String fileName = content.getFileName() != null ? content.getFileName() : resource.getFilename();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }
}
