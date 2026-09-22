package com.examly.springapp.service;

import com.examly.springapp.model.IntegrityEvent;
import com.examly.springapp.repository.IntegrityEventRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IntegrityEventServiceImpl implements IntegrityEventService {

    @Autowired
    private IntegrityEventRepository integrityEventRepository;

    @Override
    public List<IntegrityEvent> getAllEvents() {
        return integrityEventRepository.findAll();
    }

    @Override
    public IntegrityEvent getEventById(Long id) {
        return integrityEventRepository.findById(id).orElse(null);
    }

    @Override
    public IntegrityEvent addEvent(IntegrityEvent event) {
        return integrityEventRepository.save(event);
    }

    @Override
    public IntegrityEvent updateEvent(Long id, IntegrityEvent event) {

        IntegrityEvent existing =
                integrityEventRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setUserId(event.getUserId());
        existing.setQuizAttemptId(event.getQuizAttemptId());
        existing.setEventType(event.getEventType());
        existing.setEventTime(event.getEventTime());
        existing.setRemarks(event.getRemarks());

        return integrityEventRepository.save(existing);
    }

    @Override
    public boolean deleteEvent(Long id) {

        if (!integrityEventRepository.existsById(id)) {
            return false;
        }

        integrityEventRepository.deleteById(id);
        return true;
    }

    @Override
    public List<IntegrityEvent> getEventsByUser(Long userId) {
        return integrityEventRepository.findByUserId(userId);
    }

    @Override
    public List<IntegrityEvent> getEventsByAttempt(Long attemptId) {
        return integrityEventRepository.findByQuizAttemptId(attemptId);
    }

    @Override
    public List<IntegrityEvent> getEventsByType(String type) {
        return integrityEventRepository.findByEventType(type);
    }
}