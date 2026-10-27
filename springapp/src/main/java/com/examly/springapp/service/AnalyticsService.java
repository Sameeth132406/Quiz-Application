package com.examly.springapp.service;

import com.examly.springapp.dto.CourseAnalyticsDTO;
import com.examly.springapp.dto.EducatorAnalyticsDTO;
import com.examly.springapp.dto.QuizAnalyticsDTO;
import com.examly.springapp.dto.StudentAnalyticsDTO;
import com.examly.springapp.model.Analytics;

import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsService {

    List<Analytics> getAllAnalytics();

    Analytics getAnalyticsById(Long id);

    Analytics addAnalytics(Analytics analytics);

    Analytics updateAnalytics(Long id, Analytics analytics);

    boolean deleteAnalytics(Long id);

    List<Analytics> getAnalyticsByQuiz(Long quizId);

    List<Analytics> getAnalyticsByUser(Long userId);

    EducatorAnalyticsDTO getEducatorAnalytics(Long courseId, Long quizId, Long studentId, LocalDateTime startDate, LocalDateTime endDate);

    StudentAnalyticsDTO getStudentAnalytics(Long studentId);

    CourseAnalyticsDTO getCourseAnalytics(Long courseId);

    CourseAnalyticsDTO getStudentCourseAnalytics(Long studentId, Long courseId);

    QuizAnalyticsDTO getQuizAnalytics(Long quizId);
}