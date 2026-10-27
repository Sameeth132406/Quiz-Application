package com.examly.springapp.service;

import com.examly.springapp.dto.CourseModuleDTO;
import com.examly.springapp.model.CourseModule;

import java.util.List;

public interface CourseModuleService {

    CourseModule addModule(Long courseId, CourseModule module, Long currentUserId, boolean isAdmin);

    List<CourseModuleDTO> getModulesByCourseId(Long courseId, Long currentUserId);

    CourseModuleDTO getModuleById(Long moduleId, Long currentUserId);

    CourseModule updateModule(Long moduleId, CourseModule module, Long currentUserId, boolean isAdmin);

    boolean deleteModule(Long moduleId, Long currentUserId, boolean isAdmin);

    CourseModule attachQuiz(Long moduleId, Long quizId, Long currentUserId, boolean isAdmin);

    CourseModule removeQuiz(Long moduleId, Long currentUserId, boolean isAdmin);

    List<CourseModule> reorderModules(Long courseId, List<Long> moduleIds, Long currentUserId, boolean isAdmin);
}
