package com.examly.springapp.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    String uploadFile(MultipartFile file, Long courseId, Long moduleId);

    Resource loadFileAsResource(String filePath);

    boolean deleteFile(String filePath);

    String generateFileUrl(Long courseId, Long moduleId, String fileName);
}
