package com.examly.springapp.service;

import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private ResponseRepository responseRepository;

    @Autowired
    private IntegrityEventRepository integrityEventRepository;

    @Autowired
    private GradebookRepository gradebookRepository;

    @Autowired
    private AnalyticsRepository analyticsRepository;

    @Autowired
    private CourseEnrollmentRepository courseEnrollmentRepository;

    @Autowired
    private CourseProgressRepository courseProgressRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User addUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User user) {

        User existing = userRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        if (user.getUsername() != null && !user.getUsername().isBlank()) existing.setUsername(user.getUsername());
        if (user.getEmail() != null && !user.getEmail().isBlank()) existing.setEmail(user.getEmail());
        if (user.getPassword() != null && !user.getPassword().isBlank()) existing.setPassword(user.getPassword());
        if (user.getRole() != null) existing.setRole(user.getRole());

        // Update personal, KYC and role-specific fields
        if (user.getFullName() != null) existing.setFullName(user.getFullName());
        if (user.getPhoneNumber() != null) existing.setPhoneNumber(user.getPhoneNumber());
        if (user.getDob() != null) existing.setDob(user.getDob());
        if (user.getGender() != null) existing.setGender(user.getGender());
        if (user.getAddress() != null) existing.setAddress(user.getAddress());
        if (user.getAadhaarNumber() != null) existing.setAadhaarNumber(user.getAadhaarNumber());
        if (user.getPanNumber() != null) existing.setPanNumber(user.getPanNumber());
        if (user.getQualification() != null) existing.setQualification(user.getQualification());
        if (user.getInstitution() != null) existing.setInstitution(user.getInstitution());
        if (user.getRollNumber() != null) existing.setRollNumber(user.getRollNumber());
        if (user.getPassingYear() != null) existing.setPassingYear(user.getPassingYear());
        if (user.getSpecialization() != null) existing.setSpecialization(user.getSpecialization());
        if (user.getDesignation() != null) existing.setDesignation(user.getDesignation());
        if (user.getDepartment() != null) existing.setDepartment(user.getDepartment());
        if (user.getExperienceYears() != null) existing.setExperienceYears(user.getExperienceYears());
        if (user.getEmployeeId() != null) existing.setEmployeeId(user.getEmployeeId());
        if (user.getBio() != null) existing.setBio(user.getBio());
        if (user.getProfilePictureUrl() != null) existing.setProfilePictureUrl(user.getProfilePictureUrl());

        return userRepository.save(existing);
    }

    @org.springframework.transaction.annotation.Transactional
    @Override
    public boolean deleteUser(Long id) {

        if (!userRepository.existsById(id)) {
            return false;
        }

        try {
            // 1. Delete all responses and integrity events tied to this user's attempts
            List<QuizAttempt> userAttempts = quizAttemptRepository.findByUserId(id);
            if (userAttempts != null && !userAttempts.isEmpty()) {
                for (QuizAttempt attempt : userAttempts) {
                    if (attempt.getId() != null) {
                        List<Response> responses = responseRepository.findByAttemptId(attempt.getId());
                        if (responses != null && !responses.isEmpty()) {
                            responseRepository.deleteAll(responses);
                        }
                        List<IntegrityEvent> attemptEvents = integrityEventRepository.findByQuizAttemptId(attempt.getId());
                        if (attemptEvents != null && !attemptEvents.isEmpty()) {
                            integrityEventRepository.deleteAll(attemptEvents);
                        }
                    }
                }
                quizAttemptRepository.deleteAll(userAttempts);
            }

            // 2. Delete integrity events by user ID
            List<IntegrityEvent> userEvents = integrityEventRepository.findByUserId(id);
            if (userEvents != null && !userEvents.isEmpty()) {
                integrityEventRepository.deleteAll(userEvents);
            }

            // 3. Delete gradebook records
            List<Gradebook> grades = gradebookRepository.findByUserId(id);
            if (grades != null && !grades.isEmpty()) {
                gradebookRepository.deleteAll(grades);
            }

            // 4. Delete analytics records
            List<Analytics> analyticsList = analyticsRepository.findByUserId(id);
            if (analyticsList != null && !analyticsList.isEmpty()) {
                analyticsRepository.deleteAll(analyticsList);
            }

            // 5. Delete course progress
            List<CourseProgress> progressList = courseProgressRepository.findAll().stream()
                    .filter(p -> id.equals(p.getStudentId()))
                    .toList();
            if (!progressList.isEmpty()) {
                courseProgressRepository.deleteAll(progressList);
            }

            // 6. Delete course enrollments
            List<CourseEnrollment> courseEnrollments = courseEnrollmentRepository.findByStudentId(id);
            if (courseEnrollments != null && !courseEnrollments.isEmpty()) {
                courseEnrollmentRepository.deleteAll(courseEnrollments);
            }

            // 7. Delete enrollments
            List<Enrollment> enrollments = enrollmentRepository.findByUserId(id);
            if (enrollments != null && !enrollments.isEmpty()) {
                enrollmentRepository.deleteAll(enrollments);
            }
        } catch (Exception e) {
            // Log or let database trigger handle fallback
        }

        userRepository.deleteById(id);
        return true;
    }

    @Override
    public User login(String email, String password) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null && user.getPassword().equals(password)) {
            return user;
        }

        return null;
    }
}