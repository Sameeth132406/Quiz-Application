package com.examly.springapp.service;

import com.examly.springapp.model.Gradebook;
import java.util.List;

public interface GradebookService {

    List<Gradebook> getAllGrades();

    Gradebook getGradeById(Long id);

    Gradebook addGrade(Gradebook gradebook);

    Gradebook updateGrade(Long id, Gradebook gradebook);

    boolean deleteGrade(Long id);

    List<Gradebook> getGradesByUser(Long userId);

    List<Gradebook> getGradesByCourse(Long courseId);

    List<Gradebook> getGradesByQuiz(Long quizId);

    List<Gradebook> getGradesByLetter(String grade);
}