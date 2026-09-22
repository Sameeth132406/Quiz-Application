package com.examly.springapp.service;

import com.examly.springapp.model.IntegrityEvent;
import java.util.List;

public interface IntegrityEventService {

    List<IntegrityEvent> getAllEvents();

    IntegrityEvent getEventById(Long id);

    IntegrityEvent addEvent(IntegrityEvent event);

    IntegrityEvent updateEvent(Long id, IntegrityEvent event);

    boolean deleteEvent(Long id);

    List<IntegrityEvent> getEventsByUser(Long userId);

    List<IntegrityEvent> getEventsByAttempt(Long attemptId);

    List<IntegrityEvent> getEventsByType(String type);
}