package com.examly.springapp.repository;

import com.examly.springapp.enums.CourseStatus;
import com.examly.springapp.enums.Difficulty;
import com.examly.springapp.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findByCourseCode(String courseCode);

    boolean existsByCourseCode(String courseCode);

    boolean existsByTitle(String title);

    List<Course> findByCourseNameContainingIgnoreCase(String keyword);

    List<Course> findByInstructorContainingIgnoreCase(String instructor);

    List<Course> findByStatus(CourseStatus status);

    List<Course> findByEducatorId(Long educatorId);

    List<Course> findByCategory(String category);

    List<Course> findByDifficulty(Difficulty difficulty);

    @Query("SELECT c FROM Course c WHERE LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Course> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT c FROM Course c WHERE c.status = :status AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Course> searchPublishedByKeyword(@Param("status") CourseStatus status, @Param("keyword") String keyword);
}