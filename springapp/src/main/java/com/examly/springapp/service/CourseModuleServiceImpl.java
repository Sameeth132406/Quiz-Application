package com.examly.springapp.service;

import com.examly.springapp.dto.CourseContentDTO;
import com.examly.springapp.dto.CourseModuleDTO;
import com.examly.springapp.model.Course;
import com.examly.springapp.model.CourseContent;
import com.examly.springapp.model.CourseModule;
import com.examly.springapp.model.CourseProgress;
import com.examly.springapp.model.Quiz;
import com.examly.springapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseModuleServiceImpl implements CourseModuleService {

    @Autowired
    private CourseModuleRepository courseModuleRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseContentRepository courseContentRepository;

    @Autowired
    private CourseProgressRepository courseProgressRepository;

    @Autowired
    private QuizRepository quizRepository;

    private void checkCourseOwnership(Long courseId, Long currentUserId, boolean isAdmin) {
        if (isAdmin) return;
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course != null && course.getEducatorId() != null && !course.getEducatorId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to modify modules for this course");
        }
    }

    @Override
    public CourseModule addModule(Long courseId, CourseModule module, Long currentUserId, boolean isAdmin) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));
        checkCourseOwnership(courseId, currentUserId, isAdmin);

        if (module.getTitle() == null || module.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Module title cannot be empty");
        }

        module.setCourseId(courseId);
        module.setCourse(course);

        if (module.getModuleOrder() == null || module.getModuleOrder() <= 0) {
            long count = courseModuleRepository.countByCourseId(courseId);
            module.setModuleOrder((int) count + 1);
        }

        return courseModuleRepository.save(module);
    }

    @Override
    public List<CourseModuleDTO> getModulesByCourseId(Long courseId, Long currentUserId) {
        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByModuleOrderAsc(courseId);
        Set<Long> completedContentIds = (currentUserId != null)
                ? courseProgressRepository.findByStudentIdAndCourseId(currentUserId, courseId).stream()
                    .filter(p -> Boolean.TRUE.equals(p.getCompleted()))
                    .map(CourseProgress::getContentId)
                    .collect(Collectors.toSet())
                : Set.of();

        List<CourseModuleDTO> result = new ArrayList<>();
        for (CourseModule mod : modules) {
            result.add(convertToDTO(mod, completedContentIds));
        }
        return result;
    }

    @Override
    public CourseModuleDTO getModuleById(Long moduleId, Long currentUserId) {
        CourseModule module = courseModuleRepository.findById(moduleId).orElse(null);
        if (module == null) return null;

        Set<Long> completedContentIds = (currentUserId != null && module.getCourseId() != null)
                ? courseProgressRepository.findByStudentIdAndCourseId(currentUserId, module.getCourseId()).stream()
                    .filter(p -> Boolean.TRUE.equals(p.getCompleted()))
                    .map(CourseProgress::getContentId)
                    .collect(Collectors.toSet())
                : Set.of();

        return convertToDTO(module, completedContentIds);
    }

    @Override
    public CourseModule updateModule(Long moduleId, CourseModule module, Long currentUserId, boolean isAdmin) {
        CourseModule existing = courseModuleRepository.findById(moduleId).orElse(null);
        if (existing == null) return null;

        checkCourseOwnership(existing.getCourseId(), currentUserId, isAdmin);

        if (module.getTitle() != null && !module.getTitle().trim().isEmpty()) {
            existing.setTitle(module.getTitle());
        }
        if (module.getDescription() != null) {
            existing.setDescription(module.getDescription());
        }
        if (module.getModuleOrder() != null) {
            existing.setModuleOrder(module.getModuleOrder());
        }
        if (module.getQuizId() != null) {
            existing.setQuizId(module.getQuizId());
            Quiz quiz = quizRepository.findById(module.getQuizId()).orElse(null);
            existing.setQuiz(quiz);
        }
        existing.setUpdatedAt(LocalDateTime.now());

        return courseModuleRepository.save(existing);
    }

    @Override
    public boolean deleteModule(Long moduleId, Long currentUserId, boolean isAdmin) {
        CourseModule existing = courseModuleRepository.findById(moduleId).orElse(null);
        if (existing == null) return false;

        checkCourseOwnership(existing.getCourseId(), currentUserId, isAdmin);
        courseModuleRepository.delete(existing);
        return true;
    }

    @Override
    public CourseModule attachQuiz(Long moduleId, Long quizId, Long currentUserId, boolean isAdmin) {
        CourseModule module = courseModuleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + moduleId));

        checkCourseOwnership(module.getCourseId(), currentUserId, isAdmin);

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found with id: " + quizId));

        module.setQuizId(quiz.getId());
        module.setQuiz(quiz);
        module.setUpdatedAt(LocalDateTime.now());
        return courseModuleRepository.save(module);
    }

    @Override
    public CourseModule removeQuiz(Long moduleId, Long currentUserId, boolean isAdmin) {
        CourseModule module = courseModuleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + moduleId));

        checkCourseOwnership(module.getCourseId(), currentUserId, isAdmin);

        courseModuleRepository.detachQuiz(moduleId);
        module.setQuizId(null);
        module.setQuiz(null);
        module.setUpdatedAt(LocalDateTime.now());
        return courseModuleRepository.save(module);
    }

    @Override
    public List<CourseModule> reorderModules(Long courseId, List<Long> moduleIds, Long currentUserId, boolean isAdmin) {
        checkCourseOwnership(courseId, currentUserId, isAdmin);
        List<CourseModule> updated = new ArrayList<>();
        for (int i = 0; i < moduleIds.size(); i++) {
            Long modId = moduleIds.get(i);
            CourseModule mod = courseModuleRepository.findById(modId).orElse(null);
            if (mod != null && mod.getCourseId().equals(courseId)) {
                mod.setModuleOrder(i + 1);
                mod.setUpdatedAt(LocalDateTime.now());
                updated.add(courseModuleRepository.save(mod));
            }
        }
        return updated;
    }

    private CourseModuleDTO convertToDTO(CourseModule mod, Set<Long> completedContentIds) {
        CourseModuleDTO dto = new CourseModuleDTO();
        dto.setId(mod.getId());
        dto.setTitle(mod.getTitle());
        dto.setDescription(mod.getDescription());
        dto.setModuleOrder(mod.getModuleOrder());
        dto.setCourseId(mod.getCourseId());
        dto.setCreatedAt(mod.getCreatedAt());
        dto.setUpdatedAt(mod.getUpdatedAt());

        if (mod.getQuiz() != null) {
            dto.setQuizId(mod.getQuiz().getId());
            dto.setQuizTitle(mod.getQuiz().getTitle());
            dto.setQuizDuration(mod.getQuiz().getDuration());
        } else if (mod.getQuizId() != null) {
            dto.setQuizId(mod.getQuizId());
            quizRepository.findById(mod.getQuizId()).ifPresent(q -> {
                dto.setQuizTitle(q.getTitle());
                dto.setQuizDuration(q.getDuration());
            });
        }

        List<CourseContent> contents = courseContentRepository.findByModuleIdOrderByContentOrderAsc(mod.getId());
        List<CourseContentDTO> contentDTOs = contents.stream().map(c -> {
            CourseContentDTO cd = new CourseContentDTO();
            cd.setId(c.getId());
            cd.setTitle(c.getTitle());
            cd.setDescription(c.getDescription());
            cd.setContentType(c.getContentType());
            cd.setContentUrl(c.getContentUrl());
            cd.setFileName(c.getFileName());
            cd.setFileSize(c.getFileSize());
            cd.setMimeType(c.getMimeType());
            cd.setContentOrder(c.getContentOrder());
            cd.setModuleId(c.getModuleId());
            cd.setDuration(c.getDuration());
            cd.setIsDownloadable(c.getIsDownloadable());
            cd.setQuizId(c.getQuizId());
            cd.setTextContent(c.getTextContent());
            cd.setIsCompleted(completedContentIds.contains(c.getId()));
            cd.setCreatedAt(c.getCreatedAt());
            cd.setUpdatedAt(c.getUpdatedAt());
            return cd;
        }).collect(Collectors.toList());

        dto.setContents(contentDTOs);

        if (!contentDTOs.isEmpty()) {
            long completed = contentDTOs.stream().filter(c -> Boolean.TRUE.equals(c.getIsCompleted())).count();
            double progress = (double) completed / contentDTOs.size() * 100.0;
            dto.setProgressPercentage(Math.round(progress * 10.0) / 10.0);
            dto.setIsCompleted(completed == contentDTOs.size());
        } else {
            dto.setProgressPercentage(0.0);
            dto.setIsCompleted(false);
        }

        return dto;
    }
}
