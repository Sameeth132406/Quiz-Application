package com.examly.springapp.service;

import com.examly.springapp.model.Gradebook;
import com.examly.springapp.repository.GradebookRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GradebookService {

    @Autowired
    private GradebookRepository gradebookRepository;

    public List<Gradebook> getAllGrades() {
        return gradebookRepository.findAll();
    }

    public Gradebook getGradeById(Long id) {
        return gradebookRepository.findById(id).orElse(null);
    }

    public Gradebook addGrade(Gradebook gradebook) {
        return gradebookRepository.save(gradebook);
    }

    public Gradebook updateGrade(Long id, Gradebook gradebook) {

        Gradebook existing = gradebookRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setUserId(gradebook.getUserId());
        existing.setCourseId(gradebook.getCourseId());
        existing.setQuizId(gradebook.getQuizId());
        existing.setMarksObtained(gradebook.getMarksObtained());
        existing.setTotalMarks(gradebook.getTotalMarks());
        existing.setGrade(gradebook.getGrade());

        return gradebookRepository.save(existing);
    }

    public boolean deleteGrade(Long id) {

        if (!gradebookRepository.existsById(id)) {
            return false;
        }

        gradebookRepository.deleteById(id);
        return true;
    }

    public List<Gradebook> getGradesByUser(Long userId) {
        return gradebookRepository.findByUserId(userId);
    }

    public List<Gradebook> getGradesByCourse(Long courseId) {
        return gradebookRepository.findByCourseId(courseId);
    }

    public List<Gradebook> getGradesByQuiz(Long quizId) {
        return gradebookRepository.findByQuizId(quizId);
    }

    public List<Gradebook> getGradesByLetter(String grade) {
        return gradebookRepository.findByGrade(grade);
    }
}