package com.examly.springapp.repository;

import com.examly.springapp.model.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {

    List<CourseModule> findByCourseIdOrderByModuleOrderAsc(Long courseId);

    List<CourseModule> findByCourseId(Long courseId);

    boolean existsByCourseIdAndTitle(Long courseId, String title);

    long countByCourseId(Long courseId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE CourseModule m SET m.quizId = null WHERE m.id = :moduleId")
    void detachQuiz(@org.springframework.data.repository.query.Param("moduleId") Long moduleId);
}
