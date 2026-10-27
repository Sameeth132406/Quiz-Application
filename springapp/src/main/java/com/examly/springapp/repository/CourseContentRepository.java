package com.examly.springapp.repository;

import com.examly.springapp.model.CourseContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseContentRepository extends JpaRepository<CourseContent, Long> {

    List<CourseContent> findByModuleIdOrderByContentOrderAsc(Long moduleId);

    List<CourseContent> findByModuleId(Long moduleId);

    long countByModuleId(Long moduleId);

    @Query("SELECT c FROM CourseContent c JOIN CourseModule m ON c.moduleId = m.id WHERE m.courseId = :courseId ORDER BY m.moduleOrder ASC, c.contentOrder ASC")
    List<CourseContent> findByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT COUNT(c) FROM CourseContent c JOIN CourseModule m ON c.moduleId = m.id WHERE m.courseId = :courseId")
    long countByCourseId(@Param("courseId") Long courseId);
}
