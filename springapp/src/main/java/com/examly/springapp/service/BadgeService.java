package com.examly.springapp.service;

import com.examly.springapp.dto.BadgeDTO;
import com.examly.springapp.dto.StudentBadgeDTO;
import com.examly.springapp.model.Badge;

import java.util.List;

public interface BadgeService {

    List<BadgeDTO> getAllBadges();

    BadgeDTO getBadgeById(Long id);

    BadgeDTO createBadge(Badge badge);

    BadgeDTO updateBadge(Long id, Badge badge);

    boolean deleteBadge(Long id);

    List<StudentBadgeDTO> getStudentBadges(Long studentId);

    List<StudentBadgeDTO> getMyBadges(Long currentUserId);

    List<StudentBadgeDTO> evaluateAndAwardBadges(Long studentId, Long courseId);
}
