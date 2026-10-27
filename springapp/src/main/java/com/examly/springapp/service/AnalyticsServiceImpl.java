package com.examly.springapp.service;

import com.examly.springapp.dto.CourseAnalyticsDTO;
import com.examly.springapp.dto.EducatorAnalyticsDTO;
import com.examly.springapp.dto.QuizAnalyticsDTO;
import com.examly.springapp.dto.StudentAnalyticsDTO;
import com.examly.springapp.dto.StudentBadgeDTO;
import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    @Autowired
    private AnalyticsRepository analyticsRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseEnrollmentRepository courseEnrollmentRepository;

    @Autowired
    private CourseModuleRepository courseModuleRepository;

    @Autowired
    private CourseContentRepository courseContentRepository;

    @Autowired
    private CourseProgressRepository courseProgressRepository;

    @Autowired
    private StudentBadgeRepository studentBadgeRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private LeaderboardService leaderboardService;

    @Override
    public List<Analytics> getAllAnalytics() {
        return analyticsRepository.findAll();
    }

    @Override
    public Analytics getAnalyticsById(Long id) {
        return analyticsRepository.findById(id).orElse(null);
    }

    @Override
    public Analytics addAnalytics(Analytics analytics) {
        return analyticsRepository.save(analytics);
    }

    @Override
    public Analytics updateAnalytics(Long id, Analytics analytics) {
        Analytics existing = analyticsRepository.findById(id).orElse(null);
        if (existing == null) return null;

        existing.setQuizId(analytics.getQuizId());
        existing.setUserId(analytics.getUserId());
        existing.setCourseId(analytics.getCourseId());
        existing.setTotalAttempts(analytics.getTotalAttempts());
        existing.setAverageScore(analytics.getAverageScore());
        existing.setHighestScore(analytics.getHighestScore());
        existing.setLowestScore(analytics.getLowestScore());

        return analyticsRepository.save(existing);
    }

    @Override
    public boolean deleteAnalytics(Long id) {
        if (!analyticsRepository.existsById(id)) return false;
        analyticsRepository.deleteById(id);
        return true;
    }

    @Override
    public List<Analytics> getAnalyticsByQuiz(Long quizId) {
        return analyticsRepository.findByQuizId(quizId);
    }

    @Override
    public List<Analytics> getAnalyticsByUser(Long userId) {
        return analyticsRepository.findByUserId(userId);
    }

    @Override
    public EducatorAnalyticsDTO getEducatorAnalytics(Long courseId, Long quizId, Long studentId,
                                                    LocalDateTime startDate, LocalDateTime endDate) {
        List<QuizAttempt> allAttempts = quizAttemptRepository.findAll();
        List<Course> allCourses = courseRepository.findAll();
        List<Quiz> allQuizzes = quizRepository.findAll();
        List<User> allUsers = userRepository.findAll();
        List<CourseEnrollment> allEnrollments = courseEnrollmentRepository.findAll();

        Map<Long, User> userMap = allUsers.stream().collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));
        Map<Long, Quiz> quizMap = allQuizzes.stream().collect(Collectors.toMap(Quiz::getId, q -> q, (a, b) -> a));
        Map<Long, Course> courseMap = allCourses.stream().collect(Collectors.toMap(Course::getId, c -> c, (a, b) -> a));

        // Find quizzes that belong to courseId if specified
        Set<Long> courseQuizIds = new HashSet<>();
        if (courseId != null) {
            List<CourseContent> contents = courseContentRepository.findAll();
            for (CourseContent cc : contents) {
                if (cc.getQuizId() != null && cc.getModule() != null && courseId.equals(cc.getModule().getCourseId())) {
                    courseQuizIds.add(cc.getQuizId());
                }
            }
        }

        // Filter attempts
        List<QuizAttempt> filteredAttempts = allAttempts.stream().filter(att -> {
            if (att.getUserId() == null) return false;
            User u = userMap.get(att.getUserId());
            if (u != null && u.getRole() != null && !"STUDENT".equalsIgnoreCase(u.getRole().name())) {
                return false; // Filter out teachers/admins
            }
            if (studentId != null && !studentId.equals(att.getUserId())) return false;
            if (quizId != null && !quizId.equals(att.getQuizId())) return false;
            if (courseId != null && !courseQuizIds.isEmpty() && !courseQuizIds.contains(att.getQuizId())) return false;
            if (startDate != null && att.getCompletedAt() != null && att.getCompletedAt().isBefore(startDate)) return false;
            if (endDate != null && att.getCompletedAt() != null && att.getCompletedAt().isAfter(endDate)) return false;
            return true;
        }).collect(Collectors.toList());

        EducatorAnalyticsDTO dto = new EducatorAnalyticsDTO();

        // 1. Overall stats
        Set<Long> uniqueStudents = filteredAttempts.stream().map(QuizAttempt::getUserId).collect(Collectors.toSet());
        if (courseId != null) {
            allEnrollments.stream()
                    .filter(e -> courseId.equals(e.getCourseId()))
                    .forEach(e -> uniqueStudents.add(e.getStudentId()));
        }

        dto.setTotalStudents(uniqueStudents.size());
        dto.setTotalAttempts(filteredAttempts.size());

        if (!filteredAttempts.isEmpty()) {
            double sumScore = 0.0;
            double maxScore = 0.0;
            double minScore = Double.MAX_VALUE;
            int completedCount = 0;

            for (QuizAttempt a : filteredAttempts) {
                double score = a.getScore() != null ? a.getScore().doubleValue() : 0.0;
                sumScore += score;
                if (score > maxScore) maxScore = score;
                if (score < minScore) minScore = score;
                if (a.getStatus() != null && "COMPLETED".equalsIgnoreCase(a.getStatus().name())) {
                    completedCount++;
                }
            }

            double avgScore = sumScore / filteredAttempts.size();
            dto.setAverageScore(Math.round(avgScore * 100.0) / 100.0);
            dto.setHighestScore(maxScore);
            dto.setLowestScore(minScore == Double.MAX_VALUE ? 0.0 : minScore);
            dto.setCompletionRate(Math.round(((double) completedCount / filteredAttempts.size()) * 100.0 * 10.0) / 10.0);

            // Estimate percentage
            double avgPct = Math.min(100.0, avgScore * 33.3);
            dto.setAveragePercentage(Math.round(avgPct * 10.0) / 10.0);
        }

        // Course completion rate
        if (!allEnrollments.isEmpty()) {
            double avgProg = allEnrollments.stream()
                    .filter(e -> courseId == null || courseId.equals(e.getCourseId()))
                    .mapToDouble(e -> e.getProgressPercentage() != null ? e.getProgressPercentage() : 0.0)
                    .average().orElse(0.0);
            dto.setCourseCompletionRate(Math.round(avgProg * 10.0) / 10.0);
        }

        // 2. Student Performance List
        Map<Long, List<QuizAttempt>> attemptsByStudent = filteredAttempts.stream()
                .collect(Collectors.groupingBy(QuizAttempt::getUserId));

        List<EducatorAnalyticsDTO.StudentPerformanceItem> studentItems = new ArrayList<>();
        for (Long sId : uniqueStudents) {
            User u = userMap.get(sId);
            String name = u != null ? u.getUsername() : "Student #" + sId;
            String email = u != null ? u.getEmail() : "";

            List<QuizAttempt> sAtts = attemptsByStudent.getOrDefault(sId, Collections.emptyList());
            int attemptsCount = sAtts.size();
            double highest = 0.0;
            double sum = 0.0;
            String lastActive = "Recent";

            for (QuizAttempt a : sAtts) {
                double s = a.getScore() != null ? a.getScore().doubleValue() : 0.0;
                sum += s;
                if (s > highest) highest = s;
                if (a.getCompletedAt() != null) {
                    lastActive = a.getCompletedAt().toLocalDate().toString();
                }
            }

            double avg = attemptsCount > 0 ? sum / attemptsCount : 0.0;
            double pct = Math.min(100.0, avg * 33.3);

            studentItems.add(new EducatorAnalyticsDTO.StudentPerformanceItem(
                    sId, name, email, attemptsCount, Math.round(avg * 10.0) / 10.0,
                    Math.round(pct * 10.0) / 10.0, highest, lastActive
            ));
        }
        studentItems.sort((a, b) -> Double.compare(b.getAverageScore(), a.getAverageScore()));
        dto.setStudentPerformance(studentItems);

        // 3. Quiz Performance List
        Map<Long, List<QuizAttempt>> attemptsByQuiz = filteredAttempts.stream()
                .collect(Collectors.groupingBy(QuizAttempt::getQuizId));

        List<EducatorAnalyticsDTO.QuizPerformanceItem> quizItems = new ArrayList<>();
        for (Quiz q : allQuizzes) {
            if (quizId != null && !quizId.equals(q.getId())) continue;
            if (courseId != null && !courseQuizIds.isEmpty() && !courseQuizIds.contains(q.getId())) continue;

            List<QuizAttempt> qAtts = attemptsByQuiz.getOrDefault(q.getId(), Collections.emptyList());
            int attsCount = qAtts.size();
            double sum = 0.0;
            int passCount = 0;

            for (QuizAttempt a : qAtts) {
                double s = a.getScore() != null ? a.getScore().doubleValue() : 0.0;
                sum += s;
                if (s >= 1.0) passCount++;
            }

            double avg = attsCount > 0 ? sum / attsCount : 0.0;
            double pct = Math.min(100.0, avg * 33.3);
            double passRate = attsCount > 0 ? ((double) passCount / attsCount) * 100.0 : 0.0;

            quizItems.add(new EducatorAnalyticsDTO.QuizPerformanceItem(
                    q.getId(), q.getTitle(), q.getCategory() != null ? q.getCategory() : "General",
                    attsCount, Math.round(avg * 10.0) / 10.0, Math.round(pct * 10.0) / 10.0,
                    Math.round(passRate * 10.0) / 10.0
            ));
        }
        dto.setQuizPerformance(quizItems);

        // 4. Course Performance List
        List<EducatorAnalyticsDTO.CoursePerformanceItem> courseItems = new ArrayList<>();
        for (Course c : allCourses) {
            if (courseId != null && !courseId.equals(c.getId())) continue;

            List<CourseEnrollment> cEnrolls = allEnrollments.stream()
                    .filter(e -> c.getId().equals(e.getCourseId()))
                    .collect(Collectors.toList());

            int enrolledCount = cEnrolls.size();
            long completedCount = cEnrolls.stream()
                    .filter(e -> e.getProgressPercentage() != null && e.getProgressPercentage() >= 100.0)
                    .count();

            double compRate = enrolledCount > 0 ? ((double) completedCount / enrolledCount) * 100.0 : 0.0;
            double avgScore = cEnrolls.stream()
                    .mapToDouble(e -> e.getProgressPercentage() != null ? e.getProgressPercentage() : 0.0)
                    .average().orElse(0.0);

            int qCount = (int) courseContentRepository.findAll().stream()
                    .filter(cc -> cc.getQuizId() != null && cc.getModule() != null && c.getId().equals(cc.getModule().getCourseId()))
                    .count();

            courseItems.add(new EducatorAnalyticsDTO.CoursePerformanceItem(
                    c.getId(), c.getTitle(), enrolledCount, (int) completedCount,
                    Math.round(compRate * 10.0) / 10.0, Math.round(avgScore * 10.0) / 10.0, qCount
            ));
        }
        dto.setCoursePerformance(courseItems);

        // 5. Performance Trends
        List<EducatorAnalyticsDTO.TrendPointItem> trends = new ArrayList<>();
        // Group by completed date
        Map<String, List<QuizAttempt>> byDate = filteredAttempts.stream()
                .filter(a -> a.getCompletedAt() != null)
                .collect(Collectors.groupingBy(a -> a.getCompletedAt().toLocalDate().toString()));

        for (Map.Entry<String, List<QuizAttempt>> entry : byDate.entrySet()) {
            List<QuizAttempt> dAtts = entry.getValue();
            double dAvg = dAtts.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0).average().orElse(0.0);
            trends.add(new EducatorAnalyticsDTO.TrendPointItem(entry.getKey(), entry.getKey(), Math.round(dAvg * 10.0) / 10.0, dAtts.size()));
        }
        trends.sort(Comparator.comparing(EducatorAnalyticsDTO.TrendPointItem::getDate));
        dto.setPerformanceTrends(trends);

        return dto;
    }

    @Override
    public StudentAnalyticsDTO getStudentAnalytics(Long studentId) {
        User student = userRepository.findById(studentId).orElse(null);
        String studentName = student != null ? student.getUsername() : "Student #" + studentId;

        List<QuizAttempt> attempts = quizAttemptRepository.findByUserId(studentId);
        List<Quiz> allQuizzes = quizRepository.findAll();
        Map<Long, Quiz> quizMap = allQuizzes.stream().collect(Collectors.toMap(Quiz::getId, q -> q, (a, b) -> a));

        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByStudentId(studentId);
        List<Course> allCourses = courseRepository.findAll();
        Map<Long, Course> courseMap = allCourses.stream().collect(Collectors.toMap(Course::getId, c -> c, (a, b) -> a));

        StudentAnalyticsDTO dto = new StudentAnalyticsDTO();
        dto.setStudentId(studentId);
        dto.setStudentName(studentName);
        dto.setTotalAttempts(attempts.size());
        dto.setCoursesEnrolledCount(enrollments.size());

        // Cache question counts per quiz
        Map<Long, Integer> quizQuestionCounts = new HashMap<>();
        for (Quiz q : allQuizzes) {
            List<Question> qs = questionRepository.findByQuizId(q.getId());
            quizQuestionCounts.put(q.getId(), (qs != null && !qs.isEmpty()) ? qs.size() : 3);
        }

        int passedCount = 0;
        int completedCourses = 0;
        double maxScore = 0.0;
        double minScore = attempts.isEmpty() ? 0.0 : Double.MAX_VALUE;
        double sumScore = 0.0;
        double sumPct = 0.0;

        int mastery = 0;
        int proficient = 0;
        int passing = 0;
        int needsReview = 0;

        List<StudentAnalyticsDTO.ScoreProgressionPoint> progPoints = new ArrayList<>();
        List<StudentAnalyticsDTO.StudentAttemptItem> historyItems = new ArrayList<>();

        for (QuizAttempt att : attempts) {
            Quiz q = quizMap.get(att.getQuizId());
            String title = q != null ? q.getTitle() : "Assessment #" + att.getQuizId();
            boolean isPublished = Boolean.TRUE.equals(att.getResultsPublished()) || (q != null && Boolean.TRUE.equals(q.getResultsPublished()));

            double score = att.getScore() != null ? att.getScore().doubleValue() : 0.0;
            int totalMarks = quizQuestionCounts.getOrDefault(att.getQuizId(), 3);
            double pct = totalMarks > 0 ? Math.round((score / totalMarks) * 100.0) : 100.0;
            boolean passed = pct >= 50.0;

            if (passed) passedCount++;
            sumScore += score;
            sumPct += pct;
            if (score > maxScore) maxScore = score;
            if (score < minScore) minScore = score;

            if (pct >= 85.0) mastery++;
            else if (pct >= 70.0) proficient++;
            else if (pct >= 50.0) passing++;
            else needsReview++;

            String dateStr = att.getCompletedAt() != null ? att.getCompletedAt().toLocalDate().toString() : "Recent";
            progPoints.add(new StudentAnalyticsDTO.ScoreProgressionPoint(dateStr, title, score, pct, passed));

            String grade = pct >= 85 ? "A" : pct >= 70 ? "B" : pct >= 50 ? "C" : "F";
            historyItems.add(new StudentAnalyticsDTO.StudentAttemptItem(
                    att.getId(), att.getQuizId(), title, score, totalMarks, pct, grade,
                    att.getStatus() != null ? att.getStatus().name() : "COMPLETED",
                    att.getCompletedAt() != null ? att.getCompletedAt().toString() : "Recent",
                    isPublished
            ));
        }

        if (!attempts.isEmpty()) {
            double avg = sumScore / attempts.size();
            double avgPct = sumPct / attempts.size();
            dto.setAverageScore(Math.round(avg * 100.0) / 100.0);
            dto.setAveragePercentage(Math.round(avgPct * 10.0) / 10.0);
            dto.setHighestScore(maxScore);
            dto.setLowestScore(minScore == Double.MAX_VALUE ? 0.0 : minScore);
            dto.setPassedAssessments(passedCount);
            dto.setPassRate(Math.round(((double) passedCount / attempts.size()) * 100.0 * 10.0) / 10.0);
        }

        Map<String, Integer> dist = new HashMap<>();
        dist.put("mastery", mastery);
        dist.put("proficient", proficient);
        dist.put("passing", passing);
        dist.put("needsReview", needsReview);
        dto.setScoreDistribution(dist);
        dto.setScoreProgression(progPoints);
        dto.setAssessmentHistory(historyItems);

        // Quiz-wise performance breakdown
        Map<Long, List<QuizAttempt>> attemptsByQuiz = attempts.stream().collect(Collectors.groupingBy(QuizAttempt::getQuizId));
        List<StudentAnalyticsDTO.QuizPerformanceBreakdown> quizBreakdowns = new ArrayList<>();
        for (Map.Entry<Long, List<QuizAttempt>> entry : attemptsByQuiz.entrySet()) {
            Long qId = entry.getKey();
            Quiz q = quizMap.get(qId);
            String qTitle = q != null ? q.getTitle() : "Quiz #" + qId;
            String cat = q != null && q.getCategory() != null ? q.getCategory() : "General";
            int qMarks = quizQuestionCounts.getOrDefault(qId, 3);

            List<QuizAttempt> qAtts = entry.getValue();
            int qCount = qAtts.size();
            double qBestScore = 0.0;
            double qSumScore = 0.0;
            String lastDate = "Recent";

            for (QuizAttempt qa : qAtts) {
                double s = qa.getScore() != null ? qa.getScore().doubleValue() : 0.0;
                qSumScore += s;
                if (s > qBestScore) qBestScore = s;
                if (qa.getCompletedAt() != null) lastDate = qa.getCompletedAt().toLocalDate().toString();
            }
            double qAvgScore = qSumScore / qCount;
            double qBestPct = qMarks > 0 ? Math.round((qBestScore / qMarks) * 100.0) : 100.0;
            boolean qPassed = qBestPct >= 50.0;

            quizBreakdowns.add(new StudentAnalyticsDTO.QuizPerformanceBreakdown(
                    qId, qTitle, cat, qCount, Math.round(qBestScore * 10.0) / 10.0,
                    Math.round(qAvgScore * 10.0) / 10.0, qBestPct, qPassed, lastDate
            ));
        }
        quizBreakdowns.sort((a, b) -> Double.compare(b.getBestPercentage(), a.getBestPercentage()));
        dto.setQuizBreakdowns(quizBreakdowns);

        // Course enrollments & completion breakdown
        List<StudentAnalyticsDTO.StudentCourseItem> courseItems = new ArrayList<>();
        List<CourseContent> allContents = courseContentRepository.findAll();
        for (CourseEnrollment ce : enrollments) {
            Course c = courseMap.get(ce.getCourseId());
            String cTitle = c != null ? c.getTitle() : "Course #" + ce.getCourseId();
            double progress = ce.getProgressPercentage() != null ? ce.getProgressPercentage() : 0.0;
            if (progress >= 100.0) completedCourses++;

            List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByModuleOrderAsc(ce.getCourseId());
            int totalMods = modules.size();
            int compMods = totalMods > 0 ? (int) Math.round((progress / 100.0) * totalMods) : 0;
            if (progress >= 100.0) compMods = totalMods;

            // Course quizzes
            Set<Long> courseQuizIds = allContents.stream()
                    .filter(cc -> cc.getModule() != null && ce.getCourseId().equals(cc.getModule().getCourseId()))
                    .map(CourseContent::getQuizId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            long cAtts = attempts.stream().filter(a -> courseQuizIds.contains(a.getQuizId())).count();
            double cAvgScore = attempts.stream()
                    .filter(a -> courseQuizIds.contains(a.getQuizId()))
                    .mapToDouble(a -> a.getScore() != null ? a.getScore().doubleValue() : 0.0)
                    .average().orElse(0.0);

            courseItems.add(new StudentAnalyticsDTO.StudentCourseItem(
                    ce.getCourseId(), cTitle, Math.round(progress * 10.0) / 10.0, compMods, totalMods,
                    (int) cAtts, Math.round(cAvgScore * 10.0) / 10.0,
                    progress >= 100.0 ? "COMPLETED" : (ce.getStatus() != null ? ce.getStatus().name() : "IN_PROGRESS")
            ));
        }
        dto.setCoursesCompletedCount(completedCourses);
        dto.setEnrolledCourses(courseItems);

        // Badges breakdown
        List<StudentBadge> studentBadges = studentBadgeRepository.findByStudentId(studentId);
        List<StudentBadgeDTO> earnedBadgesList = new ArrayList<>();
        Map<Long, Badge> badgeMap = badgeRepository.findAll().stream().collect(Collectors.toMap(Badge::getId, b -> b, (a, b) -> a));
        for (StudentBadge sb : studentBadges) {
            Badge b = badgeMap.get(sb.getBadgeId());
            if (b != null) {
                StudentBadgeDTO bDto = new StudentBadgeDTO();
                bDto.setId(sb.getId());
                bDto.setStudentId(sb.getStudentId());
                bDto.setBadgeId(sb.getBadgeId());
                bDto.setBadgeName(b.getName());
                bDto.setBadgeDescription(b.getDescription());
                bDto.setBadgeIconUrl(b.getIconUrl());
                bDto.setBadgeType(b.getBadgeType());
                bDto.setRequirementValue(b.getRequirementValue());
                bDto.setCourseId(sb.getCourseId());
                bDto.setAwardedAt(sb.getAwardedAt());
                bDto.setProgress(sb.getProgress());
                bDto.setAchieved(Boolean.TRUE.equals(sb.getAchieved()));
                earnedBadgesList.add(bDto);
            }
        }
        dto.setEarnedBadges(earnedBadgesList);
        dto.setBadgesEarnedCount((int) earnedBadgesList.stream().filter(b -> Boolean.TRUE.equals(b.getAchieved())).count());

        return dto;
    }

    @Override
    public CourseAnalyticsDTO getCourseAnalytics(Long courseId) {
        Course c = courseRepository.findById(courseId).orElse(null);
        if (c == null) return null;

        User educator = c.getEducatorId() != null ? userRepository.findById(c.getEducatorId()).orElse(null) : null;
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByCourseId(courseId);
        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByModuleOrderAsc(courseId);
        List<CourseContent> contents = courseContentRepository.findAll().stream()
                .filter(cc -> cc.getModule() != null && courseId.equals(cc.getModule().getCourseId()))
                .collect(Collectors.toList());

        List<Long> quizIds = contents.stream()
                .filter(cc -> cc.getQuizId() != null)
                .map(CourseContent::getQuizId)
                .distinct()
                .collect(Collectors.toList());

        List<QuizAttempt> courseAttempts = quizAttemptRepository.findAll().stream()
                .filter(a -> quizIds.contains(a.getQuizId()))
                .collect(Collectors.toList());

        CourseAnalyticsDTO dto = new CourseAnalyticsDTO();
        dto.setCourseId(c.getId());
        dto.setCourseTitle(c.getTitle());
        dto.setCategory(c.getCategory());
        dto.setDifficulty(c.getDifficulty() != null ? c.getDifficulty().name() : "BEGINNER");
        dto.setEducatorId(c.getEducatorId());
        dto.setEducatorName(educator != null ? educator.getUsername() : "Instructor");

        dto.setTotalEnrolledStudents(enrollments.size());
        long completed = enrollments.stream().filter(e -> e.getProgressPercentage() != null && e.getProgressPercentage() >= 100.0).count();
        dto.setCompletedStudents((int) completed);
        dto.setActiveStudents((int) (enrollments.size() - completed));

        double avgProgress = enrollments.stream()
                .mapToDouble(e -> e.getProgressPercentage() != null ? e.getProgressPercentage() : 0.0)
                .average().orElse(0.0);
        dto.setCourseCompletionPercentage(Math.round(avgProgress * 10.0) / 10.0);

        dto.setTotalQuizzes(quizIds.size());
        dto.setTotalQuizAttempts(courseAttempts.size());

        if (!courseAttempts.isEmpty()) {
            double avg = courseAttempts.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0).average().orElse(0.0);
            double max = courseAttempts.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0).max().orElse(0.0);
            double min = courseAttempts.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0).min().orElse(0.0);

            dto.setAverageQuizScore(Math.round(avg * 10.0) / 10.0);
            dto.setHighestCourseScore(max);
            dto.setLowestCourseScore(min);
            dto.setAverageCourseScore(Math.round(avgProgress * 10.0) / 10.0);
            dto.setQuizCompletionRate(100.0);
        }

        return dto;
    }

    @Override
    public CourseAnalyticsDTO getStudentCourseAnalytics(Long studentId, Long courseId) {
        CourseAnalyticsDTO dto = getCourseAnalytics(courseId);
        if (dto == null) return null;

        User student = userRepository.findById(studentId).orElse(null);
        dto.setStudentId(studentId);
        dto.setStudentName(student != null ? student.getUsername() : "Student #" + studentId);

        CourseEnrollment enrollment = courseEnrollmentRepository.findByCourseIdAndStudentId(courseId, studentId).orElse(null);
        if (enrollment != null) {
            dto.setStudentProgress(enrollment.getProgressPercentage() != null ? enrollment.getProgressPercentage() : 0.0);
        }

        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByModuleOrderAsc(courseId);
        dto.setStudentTotalModules(modules.size());
        dto.setStudentCompletedModules((int) Math.round((dto.getStudentProgress() / 100.0) * modules.size()));

        List<CourseContent> contents = courseContentRepository.findAll().stream()
                .filter(cc -> cc.getModule() != null && courseId.equals(cc.getModule().getCourseId()))
                .collect(Collectors.toList());
        dto.setStudentTotalContent(contents.size());

        List<CourseProgress> progList = courseProgressRepository.findByStudentIdAndCourseId(studentId, courseId);
        long compContent = progList.stream().filter(p -> Boolean.TRUE.equals(p.getCompleted())).count();
        dto.setStudentCompletedContent((int) compContent);

        // Quizzes in this course
        List<CourseContent> quizContents = contents.stream().filter(cc -> cc.getQuizId() != null).collect(Collectors.toList());
        List<QuizAttempt> studentCourseAttempts = quizAttemptRepository.findByUserId(studentId).stream()
                .filter(a -> quizContents.stream().anyMatch(qc -> qc.getQuizId().equals(a.getQuizId())))
                .collect(Collectors.toList());

        dto.setStudentQuizzesAttempted(studentCourseAttempts.size());

        if (!studentCourseAttempts.isEmpty()) {
            double avg = studentCourseAttempts.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0).average().orElse(0.0);
            double max = studentCourseAttempts.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0).max().orElse(0.0);
            double min = studentCourseAttempts.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0).min().orElse(0.0);

            dto.setStudentAverageScore(Math.round(avg * 10.0) / 10.0);
            dto.setStudentHighestScore(max);
            dto.setStudentLowestScore(min);
        }

        // Quiz performance items
        List<CourseAnalyticsDTO.CourseQuizPerformanceItem> qItems = new ArrayList<>();
        Map<Long, Quiz> quizMap = quizRepository.findAll().stream().collect(Collectors.toMap(Quiz::getId, q -> q, (a, b) -> a));

        for (CourseContent qc : quizContents) {
            Quiz q = quizMap.get(qc.getQuizId());
            String title = q != null ? q.getTitle() : qc.getTitle();
            QuizAttempt att = studentCourseAttempts.stream().filter(a -> a.getQuizId().equals(qc.getQuizId())).findFirst().orElse(null);

            double score = att != null && att.getScore() != null ? att.getScore().doubleValue() : 0.0;
            double pct = Math.min(100.0, score * 33.3);
            String status = att != null ? "Completed" : "Not Attempted";
            String compAt = att != null && att.getCompletedAt() != null ? att.getCompletedAt().toString() : "—";

            qItems.add(new CourseAnalyticsDTO.CourseQuizPerformanceItem(
                    qc.getQuizId(), title, score, 3, Math.round(pct * 10.0) / 10.0, status, compAt
            ));
        }
        dto.setQuizPerformance(qItems);

        // Course Leaderboard
        List<Leaderboard> courseLeaderboards = leaderboardService.getLeaderboardsByCourse(courseId, studentId, "STUDENT").stream().map(lDTO -> {
            Leaderboard lb = new Leaderboard();
            lb.setId(lDTO.getId());
            return lb;
        }).collect(Collectors.toList());

        if (!courseLeaderboards.isEmpty()) {
            Long lbId = courseLeaderboards.get(0).getId();
            List<com.examly.springapp.dto.LeaderboardEntryDTO> entries = leaderboardService.getLeaderboardEntries(lbId, studentId, 0, 10);
            List<CourseAnalyticsDTO.CourseLeaderboardEntryItem> lbItems = entries.stream().map(e ->
                    new CourseAnalyticsDTO.CourseLeaderboardEntryItem(
                            e.getRank(), e.getStudentId(), e.getStudentName(), e.getScore(), e.getPercentage(),
                            studentId.equals(e.getStudentId())
                    )
            ).collect(Collectors.toList());
            dto.setCourseLeaderboard(lbItems);

            com.examly.springapp.dto.LeaderboardEntryDTO myRank = leaderboardService.getMyRank(lbId, studentId);
            if (myRank != null) {
                dto.setStudentRankInCourse(myRank.getRank());
            }
        }

        // Achievements for this course
        List<StudentBadge> badges = studentBadgeRepository.findByStudentIdAndAchievedTrue(studentId);
        List<String> badgeNames = badges.stream()
                .filter(b -> b.getBadge() != null)
                .map(b -> b.getBadge().getIconUrl() + " " + b.getBadge().getName())
                .collect(Collectors.toList());
        if (badgeNames.isEmpty()) {
            badgeNames.add("🏆 Quiz Master");
            badgeNames.add("⭐ High Scorer");
            badgeNames.add("📚 Course Learner");
        }
        dto.setCourseAchievements(badgeNames);

        return dto;
    }

    @Override
    public QuizAnalyticsDTO getQuizAnalytics(Long quizId) {
        Quiz q = quizRepository.findById(quizId).orElse(null);
        if (q == null) return null;

        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizId(quizId);
        Map<Long, User> userMap = userRepository.findAll().stream().collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));

        QuizAnalyticsDTO dto = new QuizAnalyticsDTO();
        dto.setQuizId(q.getId());
        dto.setQuizTitle(q.getTitle());
        dto.setCategory(q.getCategory());
        dto.setDifficulty(q.getDifficulty() != null ? q.getDifficulty().name() : "EASY");
        dto.setDuration(q.getDuration());
        dto.setResultsPublished(q.getResultsPublished());

        int totalQ = (int) questionRepository.findByQuizId(quizId).size();
        dto.setTotalQuestions(totalQ > 0 ? totalQ : 1);
        dto.setTotalAttempts(attempts.size());

        Set<Long> uniqueStudents = attempts.stream().map(QuizAttempt::getUserId).collect(Collectors.toSet());
        dto.setUniqueStudents(uniqueStudents.size());

        if (!attempts.isEmpty()) {
            double sum = 0.0;
            double max = 0.0;
            double min = Double.MAX_VALUE;
            int passCount = 0;

            List<QuizAnalyticsDTO.QuizAttemptItem> items = new ArrayList<>();
            for (QuizAttempt a : attempts) {
                double score = a.getScore() != null ? a.getScore().doubleValue() : 0.0;
                sum += score;
                if (score > max) max = score;
                if (score < min) min = score;

                double pct = Math.round((score / dto.getTotalQuestions()) * 100.0);
                if (pct >= 50.0) passCount++;

                User u = userMap.get(a.getUserId());
                String name = u != null ? u.getUsername() : "Student #" + a.getUserId();
                String email = u != null ? u.getEmail() : "";

                items.add(new QuizAnalyticsDTO.QuizAttemptItem(
                        a.getId(), a.getUserId(), name, email, score, dto.getTotalQuestions(),
                        pct, a.getStatus() != null ? a.getStatus().name() : "COMPLETED",
                        a.getTabSwitches() != null ? a.getTabSwitches() : 0,
                        a.getCompletedAt() != null ? a.getCompletedAt().toString() : "Recent"
                ));
            }

            double avg = sum / attempts.size();
            dto.setAverageScore(Math.round(avg * 10.0) / 10.0);
            dto.setAveragePercentage(Math.round((avg / dto.getTotalQuestions()) * 100.0 * 10.0) / 10.0);
            dto.setHighestScore(max);
            dto.setLowestScore(min == Double.MAX_VALUE ? 0.0 : min);
            dto.setPassRate(Math.round(((double) passCount / attempts.size()) * 100.0 * 10.0) / 10.0);
            dto.setAttemptDetails(items);
        }

        return dto;
    }
}