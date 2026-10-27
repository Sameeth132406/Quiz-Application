package com.examly.springapp.service;

import com.examly.springapp.dto.LeaderboardDTO;
import com.examly.springapp.dto.LeaderboardEntryDTO;
import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaderboardServiceImpl implements LeaderboardService {

    @Autowired
    private LeaderboardRepository leaderboardRepository;

    @Autowired
    private LeaderboardEntryRepository leaderboardEntryRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private CourseEnrollmentRepository courseEnrollmentRepository;

    @Autowired
    private BadgeService badgeService;

    @Override
    public List<LeaderboardDTO> getAllLeaderboards(Long currentUserId, String role) {
        boolean isStaff = "ADMIN".equalsIgnoreCase(role) || "EDUCATOR".equalsIgnoreCase(role);

        List<Leaderboard> list = leaderboardRepository.findAll();
        Map<Long, String> courseTitles = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle, (a, b) -> a));
        Map<Long, String> quizTitles = quizRepository.findAll().stream()
                .collect(Collectors.toMap(Quiz::getId, Quiz::getTitle, (a, b) -> a));
        Map<Long, String> userNames = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, User::getUsername, (a, b) -> a));

        return list.stream()
                .filter(lb -> isStaff || (Boolean.TRUE.equals(lb.getIsActive()) && Boolean.TRUE.equals(lb.getIsVisibleToStudents())))
                .map(lb -> mapToDTO(lb, courseTitles, quizTitles, userNames))
                .collect(Collectors.toList());
    }

    @Override
    public LeaderboardDTO getLeaderboardById(Long id, Long currentUserId, String role) {
        Leaderboard lb = leaderboardRepository.findById(id).orElse(null);
        if (lb == null) return null;

        boolean isStaff = "ADMIN".equalsIgnoreCase(role) || "EDUCATOR".equalsIgnoreCase(role);
        if (!isStaff && (!Boolean.TRUE.equals(lb.getIsActive()) || !Boolean.TRUE.equals(lb.getIsVisibleToStudents()))) {
            return null;
        }

        Map<Long, String> courseTitles = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle, (a, b) -> a));
        Map<Long, String> quizTitles = quizRepository.findAll().stream()
                .collect(Collectors.toMap(Quiz::getId, Quiz::getTitle, (a, b) -> a));
        Map<Long, String> userNames = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, User::getUsername, (a, b) -> a));

        return mapToDTO(lb, courseTitles, quizTitles, userNames);
    }

    @Override
    public LeaderboardDTO createLeaderboard(Leaderboard leaderboard, Long currentUserId) {
        if (currentUserId != null) {
            leaderboard.setCreatedBy(currentUserId);
        }
        if (leaderboard.getRankingMetric() == null) {
            leaderboard.setRankingMetric("HIGHEST_SCORE");
        }
        Leaderboard saved = leaderboardRepository.save(leaderboard);
        refreshLeaderboard(saved.getId());
        return getLeaderboardById(saved.getId(), currentUserId, "ADMIN");
    }

    @Override
    public LeaderboardDTO updateLeaderboard(Long id, Leaderboard leaderboard, Long currentUserId, String role) {
        Leaderboard existing = leaderboardRepository.findById(id).orElse(null);
        if (existing == null) return null;

        existing.setTitle(leaderboard.getTitle());
        existing.setDescription(leaderboard.getDescription());
        existing.setCourseId(leaderboard.getCourseId());
        existing.setQuizId(leaderboard.getQuizId());
        if (leaderboard.getRankingMetric() != null) {
            existing.setRankingMetric(leaderboard.getRankingMetric());
        }
        existing.setStartDate(leaderboard.getStartDate());
        existing.setEndDate(leaderboard.getEndDate());
        existing.setIsActive(leaderboard.getIsActive());
        existing.setIsVisibleToStudents(leaderboard.getIsVisibleToStudents());
        existing.setVisibility(leaderboard.getVisibility());
        existing.setMaxEntries(leaderboard.getMaxEntries());

        Leaderboard saved = leaderboardRepository.save(existing);
        refreshLeaderboard(saved.getId());
        return getLeaderboardById(saved.getId(), currentUserId, role);
    }

    @Override
    @Transactional
    public boolean deleteLeaderboard(Long id, Long currentUserId, String role) {
        if (!leaderboardRepository.existsById(id)) return false;
        leaderboardEntryRepository.deleteByLeaderboardId(id);
        leaderboardRepository.deleteById(id);
        return true;
    }

    @Override
    public List<LeaderboardDTO> getLeaderboardsByCourse(Long courseId, Long currentUserId, String role) {
        boolean isStaff = "ADMIN".equalsIgnoreCase(role) || "EDUCATOR".equalsIgnoreCase(role);
        List<Leaderboard> list = leaderboardRepository.findByCourseId(courseId);

        Map<Long, String> courseTitles = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle, (a, b) -> a));
        Map<Long, String> quizTitles = quizRepository.findAll().stream()
                .collect(Collectors.toMap(Quiz::getId, Quiz::getTitle, (a, b) -> a));
        Map<Long, String> userNames = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, User::getUsername, (a, b) -> a));

        return list.stream()
                .filter(lb -> isStaff || (Boolean.TRUE.equals(lb.getIsActive()) && Boolean.TRUE.equals(lb.getIsVisibleToStudents())))
                .map(lb -> mapToDTO(lb, courseTitles, quizTitles, userNames))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<LeaderboardEntryDTO> refreshLeaderboard(Long leaderboardId) {
        Leaderboard lb = leaderboardRepository.findById(leaderboardId).orElse(null);
        if (lb == null) return Collections.emptyList();

        List<QuizAttempt> allAttempts = quizAttemptRepository.findAll();
        List<CourseEnrollment> allEnrollments = courseEnrollmentRepository.findAll();
        Map<Long, User> userMap = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));

        // Group attempts by student
        Map<Long, List<QuizAttempt>> studentAttemptsMap = new HashMap<>();
        for (QuizAttempt att : allAttempts) {
            if (att.getUserId() == null) continue;
            User u = userMap.get(att.getUserId());
            if (u != null && u.getRole() != null && !"STUDENT".equalsIgnoreCase(u.getRole().name())) {
                continue; // Exclude teachers/admins
            }
            if (lb.getQuizId() != null && !lb.getQuizId().equals(att.getQuizId())) {
                continue;
            }
            studentAttemptsMap.computeIfAbsent(att.getUserId(), k -> new ArrayList<>()).add(att);
        }

        // Student scores/metrics accumulator
        class StudentScoreAccumulator {
            Long studentId;
            Double score = 0.0;
            Double percentage = 0.0;
            Integer attempts = 0;
            Double courseProgress = 0.0;
            LocalDateTime lastActivity;
        }

        Map<Long, StudentScoreAccumulator> accumMap = new HashMap<>();

        // If course-specific: populate with enrolled students
        if (lb.getCourseId() != null) {
            List<CourseEnrollment> courseEnrollments = allEnrollments.stream()
                    .filter(e -> lb.getCourseId().equals(e.getCourseId()))
                    .collect(Collectors.toList());

            for (CourseEnrollment ce : courseEnrollments) {
                StudentScoreAccumulator acc = new StudentScoreAccumulator();
                acc.studentId = ce.getStudentId();
                acc.courseProgress = ce.getProgressPercentage() != null ? ce.getProgressPercentage() : 0.0;
                accumMap.put(ce.getStudentId(), acc);
            }
        }

        // Add students from attempts
        for (Map.Entry<Long, List<QuizAttempt>> entry : studentAttemptsMap.entrySet()) {
            Long studentId = entry.getKey();
            List<QuizAttempt> atts = entry.getValue();

            StudentScoreAccumulator acc = accumMap.computeIfAbsent(studentId, k -> {
                StudentScoreAccumulator a = new StudentScoreAccumulator();
                a.studentId = studentId;
                return a;
            });

            acc.attempts = atts.size();
            double highest = 0.0;
            double sum = 0.0;
            for (QuizAttempt att : atts) {
                double s = att.getScore() != null ? att.getScore().doubleValue() : 0.0;
                sum += s;
                if (s > highest) highest = s;
                if (att.getCompletedAt() != null && (acc.lastActivity == null || att.getCompletedAt().isAfter(acc.lastActivity))) {
                    acc.lastActivity = att.getCompletedAt();
                }
            }

            double avg = atts.size() > 0 ? sum / atts.size() : 0.0;
            // Best estimate percentage: if score >= 1
            double pct = highest >= 3 ? 100.0 : highest == 2 ? 80.0 : highest == 1 ? 50.0 : 0.0;

            String metric = lb.getRankingMetric() != null ? lb.getRankingMetric().toUpperCase() : "HIGHEST_SCORE";
            if ("AVERAGE_SCORE".equals(metric)) {
                acc.score = Math.round(avg * 10.0) / 10.0;
                acc.percentage = Math.round(avg * 33.3 * 10.0) / 10.0;
            } else if ("TOTAL_SCORE".equals(metric)) {
                acc.score = sum;
                acc.percentage = Math.min(100.0, sum * 20.0);
            } else if ("QUIZ_COMPLETION".equals(metric)) {
                acc.score = (double) atts.size();
                acc.percentage = Math.min(100.0, atts.size() * 20.0);
            } else if ("COURSE_PROGRESS".equals(metric)) {
                acc.score = acc.courseProgress;
                acc.percentage = acc.courseProgress;
            } else { // HIGHEST_SCORE
                acc.score = highest;
                acc.percentage = pct;
            }
        }

        // Sort: Primary = Metric score descending, Secondary = attempts descending, Tertiary = earliest
        List<StudentScoreAccumulator> sorted = new ArrayList<>(accumMap.values());
        sorted.sort((a, b) -> {
            int cmp = Double.compare(b.score, a.score);
            if (cmp != 0) return cmp;
            return Integer.compare(b.attempts, a.attempts);
        });

        leaderboardEntryRepository.deleteByLeaderboardId(leaderboardId);

        List<LeaderboardEntry> savedEntries = new ArrayList<>();
        int rank = 1;
        for (StudentScoreAccumulator acc : sorted) {
            LeaderboardEntry entry = new LeaderboardEntry();
            entry.setLeaderboardId(leaderboardId);
            entry.setStudentId(acc.studentId);
            entry.setRankPosition(rank);
            entry.setScore(acc.score);
            entry.setPercentage(acc.percentage);
            entry.setAttempts(acc.attempts);
            entry.setCourseProgress(acc.courseProgress);
            savedEntries.add(entry);
            rank++;
        }

        leaderboardEntryRepository.saveAll(savedEntries);

        return savedEntries.stream().map(e -> {
            User u = userMap.get(e.getStudentId());
            String name = u != null && u.getUsername() != null ? u.getUsername() : "Student #" + e.getStudentId();
            String email = u != null ? u.getEmail() : null;
            return new LeaderboardEntryDTO(e.getId(), e.getLeaderboardId(), e.getStudentId(), name, email,
                    e.getRankPosition(), e.getScore(), e.getPercentage(), e.getAttempts(), e.getCourseProgress(), false);
        }).collect(Collectors.toList());
    }

    @Override
    public List<LeaderboardEntryDTO> getLeaderboardEntries(Long leaderboardId, Long currentUserId, int page, int size) {
        Leaderboard lb = leaderboardRepository.findById(leaderboardId).orElse(null);
        if (lb == null) return Collections.emptyList();

        List<LeaderboardEntry> entries = leaderboardEntryRepository.findByLeaderboardIdOrderByRankPositionAsc(leaderboardId);
        if (entries.isEmpty()) {
            entries = refreshLeaderboard(leaderboardId).stream().map(dto -> {
                LeaderboardEntry e = new LeaderboardEntry();
                e.setId(dto.getId());
                e.setLeaderboardId(dto.getLeaderboardId());
                e.setStudentId(dto.getStudentId());
                e.setRankPosition(dto.getRank());
                e.setScore(dto.getScore());
                e.setPercentage(dto.getPercentage());
                e.setAttempts(dto.getAttempts());
                e.setCourseProgress(dto.getCourseProgress());
                return e;
            }).collect(Collectors.toList());
        }

        Map<Long, User> userMap = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));

        int max = lb.getMaxEntries() != null && lb.getMaxEntries() > 0 ? lb.getMaxEntries() : 50;

        return entries.stream()
                .limit(max)
                .map(e -> {
                    User u = userMap.get(e.getStudentId());
                    String name = u != null && u.getUsername() != null ? u.getUsername() : "Student #" + e.getStudentId();
                    String email = u != null ? u.getEmail() : null;
                    boolean isMe = currentUserId != null && currentUserId.equals(e.getStudentId());
                    return new LeaderboardEntryDTO(
                            e.getId(),
                            e.getLeaderboardId(),
                            e.getStudentId(),
                            name,
                            email,
                            e.getRankPosition(),
                            e.getScore(),
                            e.getPercentage(),
                            e.getAttempts(),
                            e.getCourseProgress(),
                            isMe
                    );
                }).collect(Collectors.toList());
    }

    @Override
    public LeaderboardEntryDTO getMyRank(Long leaderboardId, Long currentUserId) {
        if (currentUserId == null) return null;
        Optional<LeaderboardEntry> opt = leaderboardEntryRepository.findByLeaderboardIdAndStudentId(leaderboardId, currentUserId);
        if (opt.isEmpty()) {
            // Attempt refresh if empty
            refreshLeaderboard(leaderboardId);
            opt = leaderboardEntryRepository.findByLeaderboardIdAndStudentId(leaderboardId, currentUserId);
        }

        if (opt.isEmpty()) return null;
        LeaderboardEntry e = opt.get();
        User u = userRepository.findById(currentUserId).orElse(null);
        String name = u != null && u.getUsername() != null ? u.getUsername() : "You";
        String email = u != null ? u.getEmail() : null;
        return new LeaderboardEntryDTO(
                e.getId(),
                e.getLeaderboardId(),
                e.getStudentId(),
                name,
                email,
                e.getRankPosition(),
                e.getScore(),
                e.getPercentage(),
                e.getAttempts(),
                e.getCourseProgress(),
                true
        );
    }

    private LeaderboardDTO mapToDTO(Leaderboard lb, Map<Long, String> courses, Map<Long, String> quizzes, Map<Long, String> users) {
        LeaderboardDTO dto = new LeaderboardDTO();
        dto.setId(lb.getId());
        dto.setTitle(lb.getTitle());
        dto.setDescription(lb.getDescription());
        dto.setCourseId(lb.getCourseId());
        dto.setCourseTitle(lb.getCourseId() != null ? courses.get(lb.getCourseId()) : "All Courses");
        dto.setQuizId(lb.getQuizId());
        dto.setQuizTitle(lb.getQuizId() != null ? quizzes.get(lb.getQuizId()) : "All Quizzes");
        dto.setCreatedBy(lb.getCreatedBy());
        dto.setCreatorName(lb.getCreatedBy() != null ? users.get(lb.getCreatedBy()) : "Educator");
        dto.setRankingMetric(lb.getRankingMetric());
        dto.setStartDate(lb.getStartDate());
        dto.setEndDate(lb.getEndDate());
        dto.setIsActive(lb.getIsActive());
        dto.setIsVisibleToStudents(lb.getIsVisibleToStudents());
        dto.setVisibility(lb.getVisibility());
        dto.setMaxEntries(lb.getMaxEntries());
        dto.setCreatedAt(lb.getCreatedAt());
        dto.setUpdatedAt(lb.getUpdatedAt());
        return dto;
    }
}
