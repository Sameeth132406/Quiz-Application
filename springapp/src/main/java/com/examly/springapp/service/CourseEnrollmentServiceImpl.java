package com.examly.springapp.service;

import com.examly.springapp.dto.CourseDTO;
import com.examly.springapp.dto.CourseEnrollmentDTO;
import com.examly.springapp.enums.CourseStatus;
import com.examly.springapp.enums.EnrollmentStatus;
import com.examly.springapp.model.Course;
import com.examly.springapp.model.CourseEnrollment;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.CourseContentRepository;
import com.examly.springapp.repository.CourseEnrollmentRepository;
import com.examly.springapp.repository.CourseProgressRepository;
import com.examly.springapp.repository.CourseRepository;
import com.examly.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseEnrollmentServiceImpl implements CourseEnrollmentService {

    @Autowired
    private CourseEnrollmentRepository courseEnrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseContentRepository courseContentRepository;

    @Autowired
    private CourseProgressRepository courseProgressRepository;

    @Autowired
    private CourseService courseService;

    @Override
    public CourseEnrollment enrollStudent(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));

        Optional<CourseEnrollment> existingOpt = courseEnrollmentRepository.findByCourseIdAndStudentId(courseId, studentId);
        if (existingOpt.isPresent()) {
            CourseEnrollment existing = existingOpt.get();
            if (existing.getStatus() == EnrollmentStatus.ACTIVE || existing.getStatus() == EnrollmentStatus.COMPLETED) {
                return existing;
            }
            // Re-activate cancelled enrollment
            existing.setStatus(EnrollmentStatus.ACTIVE);
            existing.setEnrolledAt(LocalDateTime.now());
            return courseEnrollmentRepository.save(existing);
        }

        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setCourseId(courseId);
        enrollment.setCourse(course);
        enrollment.setStudentId(studentId);
        enrollment.setStudent(student);
        enrollment.setEnrolledAt(LocalDateTime.now());
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        enrollment.setProgressPercentage(0.0);

        return courseEnrollmentRepository.save(enrollment);
    }

    @Override
    public List<CourseEnrollmentDTO> getEnrolledCourses(Long studentId) {
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByStudentIdAndStatus(studentId, EnrollmentStatus.ACTIVE);
        // Also fetch COMPLETED
        List<CourseEnrollment> completedEnrollments = courseEnrollmentRepository.findByStudentIdAndStatus(studentId, EnrollmentStatus.COMPLETED);
        List<CourseEnrollment> all = new ArrayList<>(enrollments);
        all.addAll(completedEnrollments);

        List<CourseEnrollmentDTO> result = new ArrayList<>();
        for (CourseEnrollment e : all) {
            CourseEnrollmentDTO dto = new CourseEnrollmentDTO();
            dto.setId(e.getId());
            dto.setCourseId(e.getCourseId());
            dto.setStudentId(e.getStudentId());
            dto.setEnrolledAt(e.getEnrolledAt());
            dto.setStatus(e.getStatus());
            dto.setCompletedAt(e.getCompletedAt());

            // Compute fresh progress percentage
            long totalContents = courseContentRepository.countByCourseId(e.getCourseId());
            if (totalContents > 0) {
                long completedContents = courseProgressRepository.countByStudentIdAndCourseIdAndCompletedTrue(studentId, e.getCourseId());
                double progress = Math.min(100.0, (double) completedContents / totalContents * 100.0);
                double rounded = Math.round(progress * 10.0) / 10.0;
                dto.setProgressPercentage(rounded);
                if (rounded != e.getProgressPercentage()) {
                    e.setProgressPercentage(rounded);
                    if (rounded >= 100.0 && e.getStatus() != EnrollmentStatus.COMPLETED) {
                        e.setStatus(EnrollmentStatus.COMPLETED);
                        e.setCompletedAt(LocalDateTime.now());
                    }
                    courseEnrollmentRepository.save(e);
                }
            } else {
                dto.setProgressPercentage(e.getProgressPercentage() != null ? e.getProgressPercentage() : 0.0);
            }

            Course course = courseRepository.findById(e.getCourseId()).orElse(null);
            if (course != null) {
                dto.setCourseTitle(course.getTitle());
                dto.setCourseThumbnailUrl(course.getThumbnailUrl());
                CourseDTO courseDTO = courseService.convertToDTO(course, studentId);
                dto.setCourse(courseDTO);
            }

            result.add(dto);
        }
        return result;
    }

    @Override
    public List<CourseEnrollmentDTO> getStudentsByCourse(Long courseId, Long currentUserId, boolean isAdmin) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));

        if (!isAdmin && course.getEducatorId() != null && !course.getEducatorId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to view students for this course");
        }

        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByCourseId(courseId);
        List<CourseEnrollmentDTO> result = new ArrayList<>();
        for (CourseEnrollment e : enrollments) {
            CourseEnrollmentDTO dto = new CourseEnrollmentDTO();
            dto.setId(e.getId());
            dto.setCourseId(e.getCourseId());
            dto.setCourseTitle(course.getTitle());
            dto.setStudentId(e.getStudentId());
            dto.setEnrolledAt(e.getEnrolledAt());
            dto.setStatus(e.getStatus());
            dto.setProgressPercentage(e.getProgressPercentage());
            dto.setCompletedAt(e.getCompletedAt());

            User student = userRepository.findById(e.getStudentId()).orElse(null);
            if (student != null) {
                dto.setStudentUsername(student.getUsername());
                dto.setStudentEmail(student.getEmail());
            }

            result.add(dto);
        }
        return result;
    }

    @Override
    public boolean unenrollStudent(Long courseId, Long studentId) {
        Optional<CourseEnrollment> enrollment = courseEnrollmentRepository.findByCourseIdAndStudentId(courseId, studentId);
        if (enrollment.isPresent()) {
            courseEnrollmentRepository.delete(enrollment.get());
            return true;
        }
        return false;
    }

    @Override
    public boolean isStudentEnrolled(Long courseId, Long studentId) {
        return courseEnrollmentRepository.findByCourseIdAndStudentId(courseId, studentId)
                .map(e -> e.getStatus() == EnrollmentStatus.ACTIVE || e.getStatus() == EnrollmentStatus.COMPLETED)
                .orElse(false);
    }

    @Override
    public CourseEnrollmentDTO getEnrollment(Long courseId, Long studentId) {
        return courseEnrollmentRepository.findByCourseIdAndStudentId(courseId, studentId)
                .map(e -> {
                    CourseEnrollmentDTO dto = new CourseEnrollmentDTO();
                    dto.setId(e.getId());
                    dto.setCourseId(e.getCourseId());
                    dto.setStudentId(e.getStudentId());
                    dto.setEnrolledAt(e.getEnrolledAt());
                    dto.setStatus(e.getStatus());
                    dto.setProgressPercentage(e.getProgressPercentage());
                    dto.setCompletedAt(e.getCompletedAt());
                    return dto;
                }).orElse(null);
    }
}
