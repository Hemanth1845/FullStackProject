package com.crm.controller;

import com.crm.dto.ChatMessageDTO;
import com.crm.model.ChatMessage;
import com.crm.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
public class ChatController {

    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessageDTO chatMessageDTO) {
        chatService.saveAndSendMessage(chatMessageDTO);
    }

    @GetMapping("/api/chat/history/{recipientId}")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(@PathVariable Long recipientId, @AuthenticationPrincipal UserDetails userDetails) {
        List<ChatMessageDTO> history = chatService.getChatHistory(userDetails.getUsername(), recipientId);
        return ResponseEntity.ok(history);
    }
    
    // New Endpoint for Admin
    @GetMapping("/api/admin/chat/history/{customerId}")
    public ResponseEntity<List<ChatMessageDTO>> getAdminChatHistory(@PathVariable Long customerId, @AuthenticationPrincipal UserDetails userDetails) {
        // Assuming admin is the one making the request
        List<ChatMessageDTO> history = chatService.getChatHistory(userDetails.getUsername(), customerId);
        return ResponseEntity.ok(history);
    }
}