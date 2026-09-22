package com.examly.springapp.service;

import com.examly.springapp.model.Gradebook;
import com.examly.springapp.repository.GradebookRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GradebookServiceImpl implements GradebookService {

    @Autowired
    private GradebookRepository gradebookRepository;

    @Override
    public List<Gradebook> getAllGrades() {
        return gradebookRepository.findAll();
    }

    @Override
    public Gradebook getGradeById(Long id) {
        return gradebookRepository.findById(id).orElse(null);
    }

    @Override
    public Gradebook addGrade(Gradebook gradebook) {
        return gradebookRepository.save(gradebook);
    }

    @Override
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

    @Override
    public boolean deleteGrade(Long id) {

        if (!gradebookRepository.existsById(id)) {
            return false;
        }

        gradebookRepository.deleteById(id);
        return true;
    }

    @Override
    public List<Gradebook> getGradesByUser(Long userId) {
        return gradebookRepository.findByUserId(userId);
    }

    @Override
    public List<Gradebook> getGradesByCourse(Long courseId) {
        return gradebookRepository.findByCourseId(courseId);
    }

    @Override
    public List<Gradebook> getGradesByQuiz(Long quizId) {
        return gradebookRepository.findByQuizId(quizId);
    }

    @Override
    public List<Gradebook> getGradesByLetter(String grade) {
        return gradebookRepository.findByGrade(grade);
    }
}