package com.examly.springapp.service;

import com.examly.springapp.dto.LeaderboardDTO;
import com.examly.springapp.dto.LeaderboardEntryDTO;
import com.examly.springapp.model.Leaderboard;

import java.util.List;

public interface LeaderboardService {

    List<LeaderboardDTO> getAllLeaderboards(Long currentUserId, String role);

    LeaderboardDTO getLeaderboardById(Long id, Long currentUserId, String role);

    LeaderboardDTO createLeaderboard(Leaderboard leaderboard, Long currentUserId);

    LeaderboardDTO updateLeaderboard(Long id, Leaderboard leaderboard, Long currentUserId, String role);

    boolean deleteLeaderboard(Long id, Long currentUserId, String role);

    List<LeaderboardEntryDTO> getLeaderboardEntries(Long leaderboardId, Long currentUserId, int page, int size);

    List<LeaderboardDTO> getLeaderboardsByCourse(Long courseId, Long currentUserId, String role);

    LeaderboardEntryDTO getMyRank(Long leaderboardId, Long currentUserId);

    List<LeaderboardEntryDTO> refreshLeaderboard(Long leaderboardId);
}
