package com.examly.springapp.repository;

import com.examly.springapp.model.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResponseRepository extends JpaRepository<Response, Long> {

    List<Response> findByAttemptId(Long attemptId);

    List<Response> findByQuestionId(Long questionId);

    List<Response> findByCorrect(boolean correct);

    long countByAttemptId(Long attemptId);

    long countByCorrect(boolean correct);

}