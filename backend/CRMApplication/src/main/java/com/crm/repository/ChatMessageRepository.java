package com.crm.repository;

import com.crm.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    @Query("SELECT cm FROM ChatMessage cm WHERE (cm.sender.id = :senderId AND cm.recipient.id = :recipientId) OR (cm.sender.id = :recipientId AND cm.recipient.id = :senderId) ORDER BY cm.timestamp ASC")
    List<ChatMessage> findChatHistory(@Param("senderId") Long senderId, @Param("recipientId") Long recipientId);
}
