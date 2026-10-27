package com.examly.springapp.service;

import com.examly.springapp.dto.CourseContentDTO;
import com.examly.springapp.dto.CourseDTO;
import com.examly.springapp.dto.CourseModuleDTO;
import com.examly.springapp.enums.CourseStatus;
import com.examly.springapp.model.Course;
import com.examly.springapp.model.CourseContent;
import com.examly.springapp.model.CourseModule;
import com.examly.springapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseModuleRepository courseModuleRepository;

    @Autowired
    private CourseContentRepository courseContentRepository;

    @Autowired
    private CourseEnrollmentRepository courseEnrollmentRepository;

    @Autowired
    private CourseProgressRepository courseProgressRepository;

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public Course getCourseById(Long id) {
        return courseRepository.findById(id).orElse(null);
    }

    @Override
    public Course addCourse(Course course) {
        if (course.getCourseCode() != null && courseRepository.existsByCourseCode(course.getCourseCode())) {
            throw new RuntimeException("Course already exists with code: " + course.getCourseCode());
        }
        if (course.getTitle() == null && course.getCourseName() != null) {
            course.setTitle(course.getCourseName());
        }
        if (course.getStatus() == null) {
            course.setStatus(CourseStatus.DRAFT);
        }
        return courseRepository.save(course);
    }

    @Override
    public Course updateCourse(Long id, Course course) {
        Course existing = courseRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }

        if (course.getTitle() != null) existing.setTitle(course.getTitle());
        if (course.getCourseName() != null) existing.setCourseName(course.getCourseName());
        if (course.getCourseCode() != null) existing.setCourseCode(course.getCourseCode());
        if (course.getDescription() != null) existing.setDescription(course.getDescription());
        if (course.getCategory() != null) existing.setCategory(course.getCategory());
        if (course.getDifficulty() != null) existing.setDifficulty(course.getDifficulty());
        if (course.getThumbnailUrl() != null) existing.setThumbnailUrl(course.getThumbnailUrl());
        if (course.getDuration() != null) existing.setDuration(course.getDuration());
        if (course.getStatus() != null) existing.setStatus(course.getStatus());
        if (course.getInstructor() != null) existing.setInstructor(course.getInstructor());
        existing.setUpdatedAt(LocalDateTime.now());

        return courseRepository.save(existing);
    }

    @Override
    public boolean deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            return false;
        }
        courseRepository.deleteById(id);
        return true;
    }

    @Override
    public List<Course> searchCourse(String keyword) {
        return courseRepository.searchByKeyword(keyword);
    }

    @Override
    public List<Course> getByInstructor(String instructor) {
        return courseRepository.findByInstructorContainingIgnoreCase(instructor);
    }

    @Override
    public List<CourseDTO> getAllCoursesDTO() {
        return getAllCoursesDTO(null);
    }

    @Override
    public List<CourseDTO> getAllCoursesDTO(Long currentUserId) {
        return courseRepository.findAll().stream()
                .map(c -> convertToDTO(c, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public List<CourseDTO> getPublishedCourses() {
        return getPublishedCourses(null);
    }

    @Override
    public List<CourseDTO> getPublishedCourses(Long currentUserId) {
        return courseRepository.findByStatus(CourseStatus.PUBLISHED).stream()
                .map(c -> convertToDTO(c, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public List<CourseDTO> getCoursesByEducator(Long educatorId) {
        return courseRepository.findByEducatorId(educatorId).stream()
                .map(c -> convertToDTO(c, null))
                .collect(Collectors.toList());
    }

    @Override
    public CourseDTO getCourseDetails(Long id, Long currentUserId) {
        Course course = courseRepository.findById(id).orElse(null);
        if (course == null) {
            return null;
        }
        return convertToDTO(course, currentUserId);
    }

    @Override
    public Course createCourse(Course course, Long currentUserId, String currentUsername) {
        if (course.getTitle() == null || course.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Course title cannot be empty");
        }
        course.setEducatorId(currentUserId);
        course.setCreatedBy(currentUsername != null ? currentUsername : "Educator");
        if (course.getStatus() == null) {
            course.setStatus(CourseStatus.DRAFT);
        }
        return courseRepository.save(course);
    }

    @Override
    public Course updateCourseDetails(Long id, Course course, Long currentUserId, boolean isAdmin) {
        Course existing = courseRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        if (!isAdmin && existing.getEducatorId() != null && !existing.getEducatorId().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to edit this course");
        }

        if (course.getTitle() != null && !course.getTitle().trim().isEmpty()) {
            existing.setTitle(course.getTitle());
        }
        if (course.getDescription() != null) existing.setDescription(course.getDescription());
        if (course.getCategory() != null) existing.setCategory(course.getCategory());
        if (course.getDifficulty() != null) existing.setDifficulty(course.getDifficulty());
        if (course.getThumbnailUrl() != null) existing.setThumbnailUrl(course.getThumbnailUrl());
        if (course.getDuration() != null) existing.setDuration(course.getDuration());
        if (course.getStatus() != null) existing.setStatus(course.getStatus());
        existing.setUpdatedAt(LocalDateTime.now());

        return courseRepository.save(existing);
    }

    @Override
    public boolean deleteCourse(Long id, Long currentUserId, boolean isAdmin) {
        Course existing = courseRepository.findById(id).orElse(null);
        if (existing == null) {
            return false;
        }
        if (!isAdmin && existing.getEducatorId() != null && !existing.getEducatorId().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to delete this course");
        }
        courseRepository.delete(existing);
        return true;
    }

    @Override
    public Course updateCourseStatus(Long id, CourseStatus status, Long currentUserId, boolean isAdmin) {
        Course existing = courseRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        if (!isAdmin && existing.getEducatorId() != null && !existing.getEducatorId().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to change status of this course");
        }
        existing.setStatus(status);
        existing.setUpdatedAt(LocalDateTime.now());
        return courseRepository.save(existing);
    }

    @Override
    public CourseDTO convertToDTO(Course course, Long currentUserId) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setCategory(course.getCategory());
        dto.setDifficulty(course.getDifficulty());
        dto.setThumbnailUrl(course.getThumbnailUrl());
        dto.setDuration(course.getDuration());
        dto.setStatus(course.getStatus());
        dto.setEducatorId(course.getEducatorId());
        dto.setCreatedBy(course.getCreatedBy());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setUpdatedAt(course.getUpdatedAt());
        dto.setCourseCode(course.getCourseCode());
        dto.setCourseName(course.getCourseName());
        dto.setInstructor(course.getInstructor());

        // Students count
        long studentsCount = courseEnrollmentRepository.countByCourseId(course.getId());
        dto.setStudentsCount(studentsCount);

        // Modules count
        long modulesCount = courseModuleRepository.countByCourseId(course.getId());
        dto.setModulesCount((int) modulesCount);

        // If user is provided, check enrollment and progress
        if (currentUserId != null) {
            boolean isEnrolled = courseEnrollmentRepository.existsByCourseIdAndStudentId(course.getId(), currentUserId);
            dto.setIsEnrolled(isEnrolled);

            long totalContents = courseContentRepository.countByCourseId(course.getId());
            if (totalContents > 0) {
                long completedContents = courseProgressRepository.countByStudentIdAndCourseIdAndCompletedTrue(currentUserId, course.getId());
                double progress = Math.min(100.0, (double) completedContents / totalContents * 100.0);
                dto.setProgressPercentage(Math.round(progress * 10.0) / 10.0);
            } else {
                dto.setProgressPercentage(0.0);
            }
        }

        // Load modules & content structure
        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByModuleOrderAsc(course.getId());
        Set<Long> completedContentIds = (currentUserId != null)
                ? courseProgressRepository.findByStudentIdAndCourseId(currentUserId, course.getId()).stream()
                    .filter(p -> Boolean.TRUE.equals(p.getCompleted()))
                    .map(com.examly.springapp.model.CourseProgress::getContentId)
                    .collect(Collectors.toSet())
                : Set.of();

        List<CourseModuleDTO> moduleDTOs = new ArrayList<>();
        for (CourseModule mod : modules) {
            CourseModuleDTO mDto = new CourseModuleDTO();
            mDto.setId(mod.getId());
            mDto.setTitle(mod.getTitle());
            mDto.setDescription(mod.getDescription());
            mDto.setModuleOrder(mod.getModuleOrder());
            mDto.setCourseId(mod.getCourseId());
            mDto.setCreatedAt(mod.getCreatedAt());
            mDto.setUpdatedAt(mod.getUpdatedAt());

            if (mod.getQuiz() != null) {
                mDto.setQuizId(mod.getQuiz().getId());
                mDto.setQuizTitle(mod.getQuiz().getTitle());
                mDto.setQuizDuration(mod.getQuiz().getDuration());
            } else if (mod.getQuizId() != null) {
                mDto.setQuizId(mod.getQuizId());
            }

            List<CourseContent> contents = courseContentRepository.findByModuleIdOrderByContentOrderAsc(mod.getId());
            List<CourseContentDTO> cDtos = contents.stream().map(c -> {
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

            mDto.setContents(cDtos);

            if (!cDtos.isEmpty()) {
                long completedInMod = cDtos.stream().filter(c -> Boolean.TRUE.equals(c.getIsCompleted())).count();
                double modProgress = (double) completedInMod / cDtos.size() * 100.0;
                mDto.setProgressPercentage(Math.round(modProgress * 10.0) / 10.0);
                mDto.setIsCompleted(completedInMod == cDtos.size());
            } else {
                mDto.setProgressPercentage(0.0);
                mDto.setIsCompleted(false);
            }

            moduleDTOs.add(mDto);
        }
        dto.setModules(moduleDTOs);

        return dto;
    }
}