package com.examly.springapp.repository;

import com.examly.springapp.model.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {

    List<Leaderboard> findByCourseId(Long courseId);

    List<Leaderboard> findByQuizId(Long quizId);

    List<Leaderboard> findByCreatedBy(Long createdBy);

    List<Leaderboard> findByIsActiveTrue();

    List<Leaderboard> findByCourseIdAndIsActiveTrue(Long courseId);
}
