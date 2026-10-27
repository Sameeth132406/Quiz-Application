package com.examly.springapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageServiceImpl(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the upload directory at " + this.fileStorageLocation, ex);
        }
    }

    @Override
    public String uploadFile(MultipartFile file, Long courseId, Long moduleId) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFilename.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid path sequence " + originalFilename);
        }

        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
            originalFilename = originalFilename.substring(0, dotIndex);
        }

        String sanitizedBase = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String uniqueFileName = sanitizedBase + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;

        Path targetDir = this.fileStorageLocation
                .resolve("courses")
                .resolve("course-" + courseId)
                .resolve("module-" + moduleId)
                .resolve("files");

        try {
            Files.createDirectories(targetDir);
            Path targetLocation = targetDir.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return generateFileUrl(courseId, moduleId, uniqueFileName);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + uniqueFileName, ex);
        }
    }

    @Override
    public Resource loadFileAsResource(String relativePath) {
        try {
            if (relativePath == null || relativePath.trim().isEmpty()) {
                return null;
            }
            // Strip any leading /api/files/ if present
            String cleanPath = relativePath.trim();
            if (cleanPath.startsWith("/api/files/")) {
                cleanPath = cleanPath.substring("/api/files/".length());
            } else if (cleanPath.startsWith("api/files/")) {
                cleanPath = cleanPath.substring("api/files/".length());
            }

            Path filePath = this.fileStorageLocation.resolve(cleanPath).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                return null;
            }
        } catch (MalformedURLException ex) {
            return null;
        }
    }

    @Override
    public boolean deleteFile(String filePath) {
        try {
            String cleanPath = filePath;
            if (cleanPath.startsWith("/api/files/")) {
                cleanPath = cleanPath.substring("/api/files/".length());
            }
            Path path = this.fileStorageLocation.resolve(cleanPath).normalize();
            return Files.deleteIfExists(path);
        } catch (IOException ex) {
            return false;
        }
    }

    @Override
    public String generateFileUrl(Long courseId, Long moduleId, String fileName) {
        return "/api/files/courses/course-" + courseId + "/module-" + moduleId + "/files/" + fileName;
    }
}
