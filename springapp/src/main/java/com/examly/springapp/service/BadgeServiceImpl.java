package com.examly.springapp.service;

import com.examly.springapp.dto.BadgeDTO;
import com.examly.springapp.dto.StudentBadgeDTO;
import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BadgeServiceImpl implements BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private StudentBadgeRepository studentBadgeRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private CourseEnrollmentRepository courseEnrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void initDefaultBadges() {
        try {
            if (badgeRepository.count() == 0) {
                List<Badge> defaults = List.of(
                        new Badge(null, "First Step", "Completed your very first quiz assessment.", "🎯", "FIRST_QUIZ", 1.0, null),
                        new Badge(null, "Consistent Learner", "Completed 5 quiz assessments.", "⚡", "QUIZ_COUNT", 5.0, null),
                        new Badge(null, "Quiz Master", "Mastered 10 quiz assessments.", "🏆", "QUIZ_COUNT", 10.0, null),
                        new Badge(null, "High Scorer", "Scored 90% or higher in any assessment.", "⭐", "SCORE_THRESHOLD", 90.0, null),
                        new Badge(null, "Perfect Score", "Achieved a flawless 100% in a quiz assessment.", "💯", "PERFECT_SCORE", 100.0, null),
                        new Badge(null, "Course Graduate", "Completed 100% of all required modules in a course.", "📚", "COURSE_COMPLETION", 100.0, null),
                        new Badge(null, "Top Performer", "Achieved a Top 3 rank on an active leaderboard.", "🥇", "LEADERBOARD_RANK", 3.0, null)
                );
                badgeRepository.saveAll(defaults);
            }
        } catch (Exception e) {
            System.err.println("Could not initialize default badges: " + e.getMessage());
        }
    }

    @Override
    public List<BadgeDTO> getAllBadges() {
        Map<Long, String> courseNames = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle, (a, b) -> a));

        return badgeRepository.findAll().stream().map(b -> {
            BadgeDTO dto = new BadgeDTO();
            dto.setId(b.getId());
            dto.setName(b.getName());
            dto.setDescription(b.getDescription());
            dto.setIconUrl(b.getIconUrl());
            dto.setBadgeType(b.getBadgeType());
            dto.setRequirementValue(b.getRequirementValue());
            dto.setCourseId(b.getCourseId());
            dto.setCourseTitle(b.getCourseId() != null ? courseNames.get(b.getCourseId()) : "Global Platform");
            dto.setActive(b.getActive());
            dto.setCreatedAt(b.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public BadgeDTO getBadgeById(Long id) {
        Badge b = badgeRepository.findById(id).orElse(null);
        if (b == null) return null;
        BadgeDTO dto = new BadgeDTO();
        dto.setId(b.getId());
        dto.setName(b.getName());
        dto.setDescription(b.getDescription());
        dto.setIconUrl(b.getIconUrl());
        dto.setBadgeType(b.getBadgeType());
        dto.setRequirementValue(b.getRequirementValue());
        dto.setCourseId(b.getCourseId());
        dto.setActive(b.getActive());
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }

    @Override
    public BadgeDTO createBadge(Badge badge) {
        Badge saved = badgeRepository.save(badge);
        return getBadgeById(saved.getId());
    }

    @Override
    public BadgeDTO updateBadge(Long id, Badge badge) {
        Badge existing = badgeRepository.findById(id).orElse(null);
        if (existing == null) return null;
        existing.setName(badge.getName());
        existing.setDescription(badge.getDescription());
        existing.setIconUrl(badge.getIconUrl());
        existing.setBadgeType(badge.getBadgeType());
        existing.setRequirementValue(badge.getRequirementValue());
        existing.setCourseId(badge.getCourseId());
        existing.setActive(badge.getActive());
        Badge saved = badgeRepository.save(existing);
        return getBadgeById(saved.getId());
    }

    @Override
    public boolean deleteBadge(Long id) {
        if (!badgeRepository.existsById(id)) return false;
        badgeRepository.deleteById(id);
        return true;
    }

    @Override
    public List<StudentBadgeDTO> getStudentBadges(Long studentId) {
        return evaluateAndAwardBadges(studentId, null);
    }

    @Override
    public List<StudentBadgeDTO> getMyBadges(Long currentUserId) {
        return evaluateAndAwardBadges(currentUserId, null);
    }

    @Override
    @Transactional
    public List<StudentBadgeDTO> evaluateAndAwardBadges(Long studentId, Long courseId) {
        if (studentId == null) return Collections.emptyList();

        User student = userRepository.findById(studentId).orElse(null);
        String studentName = student != null ? student.getUsername() : "Student #" + studentId;

        List<QuizAttempt> attempts = quizAttemptRepository.findByUserId(studentId);
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByStudentId(studentId);
        List<Badge> allBadges = badgeRepository.findByActiveTrue();

        Map<Long, StudentBadge> existingMap = studentBadgeRepository.findByStudentId(studentId).stream()
                .collect(Collectors.toMap(StudentBadge::getBadgeId, sb -> sb, (a, b) -> a));

        Map<Long, String> courseTitles = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle, (a, b) -> a));

        int completedAttemptsCount = 0;
        double maxPercentage = 0.0;
        int perfectCount = 0;
        int highScorerCount = 0;

        for (QuizAttempt att : attempts) {
            completedAttemptsCount++;
            int score = att.getScore() != null ? att.getScore() : 0;
            // Best estimate percentage: if score >= 1
            double pct = score >= 1 ? (score >= 3 ? 100.0 : score == 2 ? 80.0 : 50.0) : 0.0;
            if (pct >= 100.0) perfectCount++;
            if (pct >= 90.0) highScorerCount++;
            if (pct > maxPercentage) maxPercentage = pct;
        }

        List<StudentBadgeDTO> dtoList = new ArrayList<>();

        for (Badge b : allBadges) {
            StudentBadge sb = existingMap.get(b.getId());
            boolean wasAchieved = sb != null && Boolean.TRUE.equals(sb.getAchieved());
            double currentProgress = 0.0;
            boolean newlyAchieved = false;

            double target = b.getRequirementValue() != null && b.getRequirementValue() > 0 ? b.getRequirementValue() : 1.0;

            switch (b.getBadgeType()) {
                case "FIRST_QUIZ":
                    currentProgress = Math.min(1.0, completedAttemptsCount);
                    if (completedAttemptsCount >= 1) newlyAchieved = true;
                    break;
                case "QUIZ_COUNT":
                    currentProgress = Math.min(target, completedAttemptsCount);
                    if (completedAttemptsCount >= target) newlyAchieved = true;
                    break;
                case "SCORE_THRESHOLD":
                    currentProgress = Math.min(target, maxPercentage);
                    if (maxPercentage >= target || highScorerCount > 0) newlyAchieved = true;
                    break;
                case "PERFECT_SCORE":
                    currentProgress = perfectCount > 0 ? 1.0 : 0.0;
                    if (perfectCount > 0) newlyAchieved = true;
                    break;
                case "COURSE_COMPLETION":
                    double maxCourseProgress = enrollments.stream()
                            .mapToDouble(e -> e.getProgressPercentage() != null ? e.getProgressPercentage() : 0.0)
                            .max().orElse(0.0);
                    currentProgress = Math.min(100.0, maxCourseProgress);
                    if (maxCourseProgress >= 100.0) newlyAchieved = true;
                    break;
                default:
                    currentProgress = wasAchieved ? target : 0.0;
                    break;
            }

            boolean finalAchieved = wasAchieved || newlyAchieved;

            if (sb == null) {
                sb = new StudentBadge();
                sb.setStudentId(studentId);
                sb.setBadgeId(b.getId());
                sb.setCourseId(b.getCourseId());
                sb.setProgress(currentProgress);
                sb.setAchieved(finalAchieved);
                if (finalAchieved) {
                    sb.setAwardedAt(LocalDateTime.now());
                }
                sb = studentBadgeRepository.save(sb);
            } else {
                sb.setProgress(currentProgress);
                if (newlyAchieved && !wasAchieved) {
                    sb.setAchieved(true);
                    sb.setAwardedAt(LocalDateTime.now());
                }
                sb = studentBadgeRepository.save(sb);
            }

            StudentBadgeDTO dto = new StudentBadgeDTO();
            dto.setId(sb.getId());
            dto.setStudentId(studentId);
            dto.setStudentName(studentName);
            dto.setBadgeId(b.getId());
            dto.setBadgeName(b.getName());
            dto.setBadgeDescription(b.getDescription());
            dto.setBadgeIconUrl(b.getIconUrl());
            dto.setBadgeType(b.getBadgeType());
            dto.setRequirementValue(target);
            dto.setCourseId(b.getCourseId());
            dto.setCourseTitle(b.getCourseId() != null ? courseTitles.get(b.getCourseId()) : "Global Platform");
            dto.setAwardedAt(sb.getAwardedAt());
            dto.setProgress(sb.getProgress());
            dto.setAchieved(sb.getAchieved());
            dtoList.add(dto);
        }

        return dtoList;
    }
}
