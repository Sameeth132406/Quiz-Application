package com.examly.springapp.service;

import com.examly.springapp.model.Analytics;
import java.util.List;

public interface AnalyticsService {

    List<Analytics> getAllAnalytics();

    Analytics getAnalyticsById(Long id);

    Analytics addAnalytics(Analytics analytics);

    Analytics updateAnalytics(Long id, Analytics analytics);

    boolean deleteAnalytics(Long id);

    List<Analytics> getAnalyticsByQuiz(Long quizId);

    List<Analytics> getAnalyticsByUser(Long userId);
}