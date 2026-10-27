package com.examly.springapp.repository;

import com.examly.springapp.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "((m.senderId = :userA AND m.recipientId = :userB) OR " +
           "(m.senderId = :userB AND m.recipientId = :userA)) " +
           "AND (:courseId IS NULL OR m.courseId = :courseId) " +
           "ORDER BY m.sentAt ASC")
    List<ChatMessage> findConversation(
        @Param("userA") Long userA,
        @Param("userB") Long userB,
        @Param("courseId") Long courseId
    );

    List<ChatMessage> findByRecipientIdAndReadFalseOrderBySentAtDesc(Long recipientId);

    long countByRecipientIdAndReadFalse(Long recipientId);
}
