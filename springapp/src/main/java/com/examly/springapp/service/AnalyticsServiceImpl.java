package com.examly.springapp.service;

import com.examly.springapp.model.Analytics;
import com.examly.springapp.repository.AnalyticsRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    @Autowired
    private AnalyticsRepository analyticsRepository;

    @Override
    public List<Analytics> getAllAnalytics() {
        return analyticsRepository.findAll();
    }

    @Override
    public Analytics getAnalyticsById(Long id) {
        return analyticsRepository.findById(id).orElse(null);
    }

    @Override
    public Analytics addAnalytics(Analytics analytics) {
        return analyticsRepository.save(analytics);
    }

    @Override
    public Analytics updateAnalytics(
            Long id,
            Analytics analytics) {

        Analytics existing =
                analyticsRepository
                        .findById(id)
                        .orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setQuizId(analytics.getQuizId());
        existing.setUserId(analytics.getUserId());
        existing.setTotalAttempts(
                analytics.getTotalAttempts()
        );
        existing.setAverageScore(
                analytics.getAverageScore()
        );
        existing.setHighestScore(
                analytics.getHighestScore()
        );
        existing.setLowestScore(
                analytics.getLowestScore()
        );

        return analyticsRepository.save(existing);
    }

    @Override
    public boolean deleteAnalytics(Long id) {

        if (!analyticsRepository.existsById(id)) {
            return false;
        }

        analyticsRepository.deleteById(id);
        return true;
    }

    @Override
    public List<Analytics> getAnalyticsByQuiz(
            Long quizId) {

        return analyticsRepository.findByQuizId(quizId);
    }

    @Override
    public List<Analytics> getAnalyticsByUser(
            Long userId) {

        return analyticsRepository.findByUserId(userId);
    }
}