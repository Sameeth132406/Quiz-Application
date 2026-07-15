package com.examly.springapp.repository;

import com.examly.springapp.enums.Difficulty;
import com.examly.springapp.model.Quiz;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Optional<Quiz> findByTitle(String title);

    boolean existsByTitle(String title);

    List<Quiz> findByTitleContainingIgnoreCase(String keyword);

    List<Quiz> findByDescriptionContainingIgnoreCase(String keyword);

    List<Quiz> findByCategoryContainingIgnoreCase(String category);

    // Difficulty is now an Enum
    List<Quiz> findByDifficulty(Difficulty difficulty);

    List<Quiz> findByDurationLessThanEqual(Integer duration);

    void deleteByTitle(String title);
}