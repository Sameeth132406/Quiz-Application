package com.examly.springapp.repository;

import com.examly.springapp.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {

    Optional<Badge> findByName(String name);

    List<Badge> findByActiveTrue();

    List<Badge> findByBadgeType(String badgeType);

    List<Badge> findByCourseId(Long courseId);

    List<Badge> findByCourseIdIsNull();
}
