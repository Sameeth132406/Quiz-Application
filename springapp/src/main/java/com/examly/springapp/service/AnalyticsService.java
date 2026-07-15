package com.examly.springapp.service;

import com.examly.springapp.model.Analytics;
import com.examly.springapp.repository.AnalyticsRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private AnalyticsRepository analyticsRepository;

    public List<Analytics> getAllAnalytics() {
        return analyticsRepository.findAll();
    }

    public Analytics getAnalyticsById(Long id) {
        return analyticsRepository.findById(id).orElse(null);
    }

    public Analytics addAnalytics(Analytics analytics) {
        return analyticsRepository.save(analytics);
    }

    public Analytics updateAnalytics(Long id, Analytics analytics) {

        Analytics existing = analyticsRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setQuizId(analytics.getQuizId());
        existing.setUserId(analytics.getUserId());
        existing.setTotalAttempts(analytics.getTotalAttempts());
        existing.setAverageScore(analytics.getAverageScore());
        existing.setHighestScore(analytics.getHighestScore());
        existing.setLowestScore(analytics.getLowestScore());

        return analyticsRepository.save(existing);
    }

    public boolean deleteAnalytics(Long id) {

        if (!analyticsRepository.existsById(id)) {
            return false;
        }

        analyticsRepository.deleteById(id);
        return true;
    }

    public List<Analytics> getAnalyticsByQuiz(Long quizId) {
        return analyticsRepository.findByQuizId(quizId);
    }

    public List<Analytics> getAnalyticsByUser(Long userId) {
        return analyticsRepository.findByUserId(userId);
    }
}