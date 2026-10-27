package com.examly.springapp.repository;

import com.examly.springapp.model.ProctoringScreenshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProctoringScreenshotRepository extends JpaRepository<ProctoringScreenshot, Long> {

    List<ProctoringScreenshot> findByAttemptIdOrderBySequenceNumberAsc(Long attemptId);

    List<ProctoringScreenshot> findByAttemptIdOrderByCapturedAtAsc(Long attemptId);

    long countByAttemptId(Long attemptId);

    @Modifying
    @Query("DELETE FROM ProctoringScreenshot s WHERE s.attemptId = :attemptId")
    void deleteByAttemptId(@Param("attemptId") Long attemptId);

    @Query("SELECT s FROM ProctoringScreenshot s WHERE s.createdAt < :cutoff")
    List<ProctoringScreenshot> findOlderThan(@Param("cutoff") LocalDateTime cutoff);
}
