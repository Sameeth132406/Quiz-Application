package com.examly.springapp.service;

import com.examly.springapp.dto.CourseContentDTO;
import com.examly.springapp.enums.ContentType;
import com.examly.springapp.model.Course;
import com.examly.springapp.model.CourseContent;
import com.examly.springapp.model.CourseModule;
import com.examly.springapp.model.CourseProgress;
import com.examly.springapp.repository.CourseContentRepository;
import com.examly.springapp.repository.CourseModuleRepository;
import com.examly.springapp.repository.CourseProgressRepository;
import com.examly.springapp.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseContentServiceImpl implements CourseContentService {

    @Autowired
    private CourseContentRepository courseContentRepository;

    @Autowired
    private CourseModuleRepository courseModuleRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseProgressRepository courseProgressRepository;

    @Autowired
    private FileStorageService fileStorageService;

    private void checkModuleOwnership(Long moduleId, Long currentUserId, boolean isAdmin) {
        if (isAdmin) return;
        CourseModule module = courseModuleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + moduleId));
        Course course = courseRepository.findById(module.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + module.getCourseId()));
        if (course.getEducatorId() != null && !course.getEducatorId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to modify content in this course");
        }
    }

    @Override
    public CourseContent addContent(Long moduleId, CourseContent content, Long currentUserId, boolean isAdmin) {
        CourseModule module = courseModuleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + moduleId));

        checkModuleOwnership(moduleId, currentUserId, isAdmin);

        if (content.getTitle() == null || content.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Content title cannot be empty");
        }
        if (content.getContentType() == null) {
            throw new IllegalArgumentException("Content type cannot be empty");
        }

        content.setModuleId(moduleId);
        content.setModule(module);

        if (content.getContentOrder() == null || content.getContentOrder() <= 0) {
            long count = courseContentRepository.countByModuleId(moduleId);
            content.setContentOrder((int) count + 1);
        }

        return courseContentRepository.save(content);
    }

    @Override
    public CourseContent uploadAndAddContent(Long moduleId, String title, String description,
                                            ContentType contentType, MultipartFile file, String contentUrl,
                                            Integer contentOrder, String duration, Boolean isDownloadable,
                                            Long quizId, String textContent,
                                            Long currentUserId, boolean isAdmin) {
        CourseModule module = courseModuleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + moduleId));

        checkModuleOwnership(moduleId, currentUserId, isAdmin);

        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Content title cannot be empty");
        }
        if (contentType == null) {
            throw new IllegalArgumentException("Content type cannot be empty");
        }

        CourseContent content = new CourseContent();
        content.setTitle(title);
        content.setDescription(description);
        content.setContentType(contentType);
        content.setModuleId(moduleId);
        content.setModule(module);
        content.setDuration(duration);
        content.setIsDownloadable(isDownloadable != null ? isDownloadable : true);
        content.setQuizId(quizId);
        content.setTextContent(textContent);

        if (contentOrder == null || contentOrder <= 0) {
            long count = courseContentRepository.countByModuleId(moduleId);
            content.setContentOrder((int) count + 1);
        } else {
            content.setContentOrder(contentOrder);
        }

        if (file != null && !file.isEmpty()) {
            String uploadedUrl = fileStorageService.uploadFile(file, module.getCourseId(), moduleId);
            content.setContentUrl(uploadedUrl);
            content.setFileName(file.getOriginalFilename());
            content.setFileSize(file.getSize());
            content.setMimeType(file.getContentType());
        } else if (contentUrl != null && !contentUrl.trim().isEmpty()) {
            content.setContentUrl(contentUrl.trim());
        }

        return courseContentRepository.save(content);
    }

    @Override
    public List<CourseContentDTO> getContentsByModuleId(Long moduleId, Long currentUserId) {
        List<CourseContent> contents = courseContentRepository.findByModuleIdOrderByContentOrderAsc(moduleId);

        List<Long> completedIds = (currentUserId != null)
                ? courseProgressRepository.findByStudentIdAndModuleId(currentUserId, moduleId).stream()
                    .filter(p -> Boolean.TRUE.equals(p.getCompleted()))
                    .map(CourseProgress::getContentId)
                    .collect(Collectors.toList())
                : List.of();

        return contents.stream().map(c -> convertToDTO(c, completedIds.contains(c.getId()))).collect(Collectors.toList());
    }

    @Override
    public CourseContentDTO getContentById(Long contentId, Long currentUserId) {
        CourseContent content = courseContentRepository.findById(contentId).orElse(null);
        if (content == null) return null;

        boolean isCompleted = false;
        if (currentUserId != null) {
            isCompleted = courseProgressRepository.findByStudentIdAndContentId(currentUserId, contentId)
                    .map(p -> Boolean.TRUE.equals(p.getCompleted()))
                    .orElse(false);
        }

        return convertToDTO(content, isCompleted);
    }

    @Override
    public CourseContent updateContent(Long contentId, CourseContent content, Long currentUserId, boolean isAdmin) {
        CourseContent existing = courseContentRepository.findById(contentId).orElse(null);
        if (existing == null) return null;

        checkModuleOwnership(existing.getModuleId(), currentUserId, isAdmin);

        if (content.getTitle() != null && !content.getTitle().trim().isEmpty()) {
            existing.setTitle(content.getTitle());
        }
        if (content.getDescription() != null) {
            existing.setDescription(content.getDescription());
        }
        if (content.getContentType() != null) {
            existing.setContentType(content.getContentType());
        }
        if (content.getContentUrl() != null) {
            existing.setContentUrl(content.getContentUrl());
        }
        if (content.getContentOrder() != null) {
            existing.setContentOrder(content.getContentOrder());
        }
        if (content.getDuration() != null) {
            existing.setDuration(content.getDuration());
        }
        if (content.getIsDownloadable() != null) {
            existing.setIsDownloadable(content.getIsDownloadable());
        }
        if (content.getQuizId() != null) {
            existing.setQuizId(content.getQuizId());
        }
        if (content.getTextContent() != null) {
            existing.setTextContent(content.getTextContent());
        }
        existing.setUpdatedAt(LocalDateTime.now());

        return courseContentRepository.save(existing);
    }

    @Override
    public boolean deleteContent(Long contentId, Long currentUserId, boolean isAdmin) {
        CourseContent existing = courseContentRepository.findById(contentId).orElse(null);
        if (existing == null) return false;

        checkModuleOwnership(existing.getModuleId(), currentUserId, isAdmin);

        if (existing.getContentUrl() != null && existing.getContentUrl().startsWith("/api/files/")) {
            fileStorageService.deleteFile(existing.getContentUrl());
        }

        courseContentRepository.delete(existing);
        return true;
    }

    @Override
    public CourseContent uploadFileToContent(Long contentId, MultipartFile file, Long currentUserId, boolean isAdmin) {
        CourseContent existing = courseContentRepository.findById(contentId).orElse(null);
        if (existing == null) {
            throw new IllegalArgumentException("Content not found: " + contentId);
        }

        checkModuleOwnership(existing.getModuleId(), currentUserId, isAdmin);

        CourseModule module = courseModuleRepository.findById(existing.getModuleId())
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + existing.getModuleId()));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        // Delete old file if present
        if (existing.getContentUrl() != null && existing.getContentUrl().startsWith("/api/files/")) {
            fileStorageService.deleteFile(existing.getContentUrl());
        }

        String uploadedUrl = fileStorageService.uploadFile(file, module.getCourseId(), existing.getModuleId());
        existing.setContentUrl(uploadedUrl);
        existing.setFileName(file.getOriginalFilename());
        existing.setFileSize(file.getSize());
        existing.setMimeType(file.getContentType());
        existing.setUpdatedAt(LocalDateTime.now());

        return courseContentRepository.save(existing);
    }

    private CourseContentDTO convertToDTO(CourseContent c, boolean isCompleted) {
        CourseContentDTO dto = new CourseContentDTO();
        dto.setId(c.getId());
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setContentType(c.getContentType());
        dto.setContentUrl(c.getContentUrl());
        dto.setFileName(c.getFileName());
        dto.setFileSize(c.getFileSize());
        dto.setMimeType(c.getMimeType());
        dto.setContentOrder(c.getContentOrder());
        dto.setModuleId(c.getModuleId());
        dto.setDuration(c.getDuration());
        dto.setIsDownloadable(c.getIsDownloadable());
        dto.setQuizId(c.getQuizId());
        dto.setTextContent(c.getTextContent());
        dto.setIsCompleted(isCompleted);
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }
}
