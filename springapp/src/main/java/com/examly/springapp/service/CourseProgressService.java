package com.examly.springapp.service;

import com.examly.springapp.dto.CourseProgressDTO;
import com.examly.springapp.model.CourseProgress;

public interface CourseProgressService {

    CourseProgress markContentComplete(Long contentId, Long studentId);

    CourseProgress toggleContentComplete(Long contentId, Long studentId);

    CourseProgressDTO getCourseProgress(Long courseId, Long studentId);
}
