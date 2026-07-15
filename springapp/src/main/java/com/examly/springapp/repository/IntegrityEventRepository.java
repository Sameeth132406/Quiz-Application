package com.examly.springapp.repository;

import com.examly.springapp.model.IntegrityEvent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IntegrityEventRepository extends JpaRepository<IntegrityEvent, Long> {

    List<IntegrityEvent> findByUserId(Long userId);

    List<IntegrityEvent> findByQuizAttemptId(Long quizAttemptId);

    List<IntegrityEvent> findByEventType(String eventType);

}