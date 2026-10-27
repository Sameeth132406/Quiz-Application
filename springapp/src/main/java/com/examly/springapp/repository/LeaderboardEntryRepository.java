package com.examly.springapp.repository;

import com.examly.springapp.model.LeaderboardEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaderboardEntryRepository extends JpaRepository<LeaderboardEntry, Long> {

    List<LeaderboardEntry> findByLeaderboardIdOrderByRankPositionAsc(Long leaderboardId);

    Page<LeaderboardEntry> findByLeaderboardIdOrderByRankPositionAsc(Long leaderboardId, Pageable pageable);

    Optional<LeaderboardEntry> findByLeaderboardIdAndStudentId(Long leaderboardId, Long studentId);

    void deleteByLeaderboardId(Long leaderboardId);
}
