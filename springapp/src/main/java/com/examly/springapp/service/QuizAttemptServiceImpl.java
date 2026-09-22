package com.examly.springapp.service;

import com.examly.springapp.dto.QuizSubmissionDTO;
import com.examly.springapp.dto.SubmissionResultDTO;
import com.examly.springapp.enums.AttemptStatus;
import com.examly.springapp.model.Analytics;
import com.examly.springapp.model.Gradebook;
import com.examly.springapp.model.IntegrityEvent;
import com.examly.springapp.model.Question;
import com.examly.springapp.model.QuizAttempt;
import com.examly.springapp.model.Response;
import com.examly.springapp.repository.AnalyticsRepository;
import com.examly.springapp.repository.GradebookRepository;
import com.examly.springapp.repository.IntegrityEventRepository;
import com.examly.springapp.repository.QuestionRepository;
import com.examly.springapp.repository.QuizAttemptRepository;
import com.examly.springapp.repository.ResponseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class QuizAttemptServiceImpl implements QuizAttemptService {

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ResponseRepository responseRepository;

    @Autowired
    private IntegrityEventRepository integrityEventRepository;

    @Autowired
    private AnalyticsRepository analyticsRepository;

    @Autowired
    private GradebookRepository gradebookRepository;

    @Autowired
    private com.examly.springapp.repository.UserRepository userRepository;

    @Override
    public List<QuizAttempt> getAllAttempts() {
        return quizAttemptRepository.findAll();
    }

    @Override
    public QuizAttempt getAttemptById(Long id) {
        return quizAttemptRepository.findById(id).orElse(null);
    }

    @Override
    public QuizAttempt startQuiz(QuizAttempt attempt) {
        return quizAttemptRepository.save(attempt);
    }

    @Override
    public QuizAttempt updateAttempt(Long id, QuizAttempt attempt) {

        QuizAttempt existing =
                quizAttemptRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setUserId(attempt.getUserId());
        existing.setQuizId(attempt.getQuizId());
        existing.setScore(attempt.getScore());
        existing.setStatus(attempt.getStatus());
        existing.setStartedAt(attempt.getStartedAt());
        existing.setCompletedAt(attempt.getCompletedAt());

        return quizAttemptRepository.save(existing);
    }

    @Override
    public boolean deleteAttempt(Long id) {

        if (!quizAttemptRepository.existsById(id)) {
            return false;
        }

        quizAttemptRepository.deleteById(id);
        return true;
    }

    @Override
    public List<QuizAttempt> getAttemptsByUser(Long userId) {
        return quizAttemptRepository.findByUserId(userId);
    }

    @Override
    public SubmissionResultDTO submitQuiz(Long quizId, QuizSubmissionDTO submission) {
        Long resolvedUserId = submission.getUserId();
        try {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                com.examly.springapp.model.User authUser = userRepository.findByUsername(auth.getName()).orElse(null);
                if (authUser != null) {
                    resolvedUserId = authUser.getId();
                }
            }
        } catch (Exception ignored) {}
        if (resolvedUserId == null) {
            resolvedUserId = 1L;
        }
        final Long userId = resolvedUserId;
        List<Question> questions = questionRepository.findByQuizId(quizId);
        Map<Long, String> answers = submission.getAnswers() != null ? submission.getAnswers() : Map.of();

        int score = 0;
        int totalMarks = 0;
        int correctCount = 0;

        // Calculate score
        for (Question q : questions) {
            int qMarks = q.getMarks() != null && q.getMarks() > 0 ? q.getMarks() : 1;
            totalMarks += qMarks;

            String selected = answers.get(q.getId());
            boolean isCorrect = false;

            if (selected != null && q.getCorrectAnswer() != null) {
                String sel = selected.trim();
                String corr = q.getCorrectAnswer().trim();

                if (sel.equalsIgnoreCase(corr)) {
                    isCorrect = true;
                } else if (corr.equalsIgnoreCase("A") && sel.equalsIgnoreCase(q.getOptionA())) {
                    isCorrect = true;
                } else if (corr.equalsIgnoreCase("B") && sel.equalsIgnoreCase(q.getOptionB())) {
                    isCorrect = true;
                } else if (corr.equalsIgnoreCase("C") && sel.equalsIgnoreCase(q.getOptionC())) {
                    isCorrect = true;
                } else if (corr.equalsIgnoreCase("D") && sel.equalsIgnoreCase(q.getOptionD())) {
                    isCorrect = true;
                }
            }

            if (isCorrect) {
                score += qMarks;
                correctCount++;
            }
        }

        // Save Attempt
        LocalDateTime start = submission.getStartedAt() != null ? submission.getStartedAt() : LocalDateTime.now().minusMinutes(10);
        LocalDateTime complete = submission.getCompletedAt() != null ? submission.getCompletedAt() : LocalDateTime.now();
        int tabSwitches = submission.getTabSwitches() != null ? submission.getTabSwitches() : 0;

        QuizAttempt attempt = new QuizAttempt(
                null,
                userId,
                quizId,
                score,
                AttemptStatus.COMPLETED,
                start,
                complete,
                tabSwitches
        );
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        // Save individual responses
        for (Question q : questions) {
            String selected = answers.get(q.getId());
            boolean isCorrect = false;

            if (selected != null && q.getCorrectAnswer() != null) {
                String sel = selected.trim();
                String corr = q.getCorrectAnswer().trim();
                if (sel.equalsIgnoreCase(corr)
                        || (corr.equalsIgnoreCase("A") && sel.equalsIgnoreCase(q.getOptionA()))
                        || (corr.equalsIgnoreCase("B") && sel.equalsIgnoreCase(q.getOptionB()))
                        || (corr.equalsIgnoreCase("C") && sel.equalsIgnoreCase(q.getOptionC()))
                        || (corr.equalsIgnoreCase("D") && sel.equalsIgnoreCase(q.getOptionD()))) {
                    isCorrect = true;
                }
            }

            Response resp = new Response(
                    null,
                    savedAttempt.getId(),
                    q.getId(),
                    selected != null ? selected : "UNANSWERED",
                    isCorrect
            );
            responseRepository.save(resp);
        }

        // Record integrity events if tab switches detected
        if (tabSwitches > 0) {
            IntegrityEvent event = new IntegrityEvent(
                    null,
                    userId,
                    savedAttempt.getId(),
                    "TAB_SWITCH",
                    LocalDateTime.now().toString(),
                    "Student switched browser tabs " + tabSwitches + " times during assessment."
            );
            integrityEventRepository.save(event);
        }

        // Percentage & Grade
        int percentage = totalMarks > 0 ? (int) Math.round(((double) score / totalMarks) * 100) : 100;
        String grade = percentage >= 85 ? "A" : percentage >= 70 ? "B" : percentage >= 55 ? "C" : percentage >= 40 ? "D" : "F";

        // Update Gradebook
        try {
            List<Gradebook> existingGrades = gradebookRepository.findByQuizId(quizId);
            Gradebook gb = existingGrades.stream()
                    .filter(g -> userId.equals(g.getUserId()))
                    .findFirst()
                    .orElse(null);

            if (gb == null) {
                gb = new Gradebook(null, userId, 1L, quizId, score, totalMarks, grade);
            } else {
                gb.setMarksObtained(Math.max(gb.getMarksObtained() != null ? gb.getMarksObtained() : 0, score));
                gb.setTotalMarks(totalMarks);
                gb.setGrade(grade);
            }
            gradebookRepository.save(gb);
        } catch (Exception ignored) {
        }

        // Update Analytics
        try {
            List<Analytics> existingAnalytics = analyticsRepository.findByUserIdAndQuizId(userId, quizId);
            if (existingAnalytics == null || existingAnalytics.isEmpty()) {
                Analytics an = new Analytics(
                        null,
                        quizId,
                        userId,
                        1,
                        (double) score,
                        (double) score,
                        (double) score
                );
                analyticsRepository.save(an);
            } else {
                Analytics an = existingAnalytics.get(0);
                int attempts = (an.getTotalAttempts() != null ? an.getTotalAttempts() : 0) + 1;
                double currentAvg = an.getAverageScore() != null ? an.getAverageScore() : 0.0;
                double newAvg = Math.round((((currentAvg * (attempts - 1)) + score) / attempts) * 100.0) / 100.0;
                double highest = Math.max(an.getHighestScore() != null ? an.getHighestScore() : score, (double) score);
                double lowest = Math.min(an.getLowestScore() != null ? an.getLowestScore() : score, (double) score);

                an.setTotalAttempts(attempts);
                an.setAverageScore(newAvg);
                an.setHighestScore(highest);
                an.setLowestScore(lowest);
                analyticsRepository.save(an);
            }
        } catch (Exception ignored) {
        }

        return new SubmissionResultDTO(
                savedAttempt.getId(),
                quizId,
                userId,
                score,
                totalMarks,
                percentage,
                grade,
                correctCount,
                questions.size(),
                AttemptStatus.COMPLETED.toString(),
                tabSwitches,
                complete
        );
    }
}