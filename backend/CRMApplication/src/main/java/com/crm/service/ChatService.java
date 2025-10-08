package com.crm.service;

import com.crm.dto.ChatMessageDTO;
import com.crm.exception.ResourceNotFoundException;
import com.crm.model.ChatMessage;
import com.crm.model.User;
import com.crm.repository.ChatMessageRepository;
import com.crm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void saveAndSendMessage(ChatMessageDTO dto) {
        User sender = userRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        User recipient = userRepository.findById(dto.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSender(sender);
        chatMessage.setRecipient(recipient);
        chatMessage.setEncryptedMessage(dto.getContent()); // In a real app, you would encrypt this
        chatMessage.setTimestamp(LocalDateTime.now());

        ChatMessage savedMsg = chatMessageRepository.save(chatMessage);
        
        ChatMessageDTO responseDto = convertToDto(savedMsg);

        // Send message to the recipient's private queue
        messagingTemplate.convertAndSendToUser(
            String.valueOf(recipient.getId()), "/queue/messages",
            responseDto
        );
        // Also send back to the sender for UI consistency
         messagingTemplate.convertAndSendToUser(
            String.valueOf(sender.getId()), "/queue/messages",
            responseDto
        );
    }

    public List<ChatMessageDTO> getChatHistory(String currentUsername, Long otherUserId) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
        
        List<ChatMessage> messages = chatMessageRepository.findChatHistory(currentUser.getId(), otherUserId);

        return messages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ChatMessageDTO convertToDto(ChatMessage message) {
        return new ChatMessageDTO(
                message.getId(),
                message.getSender().getId(),
                message.getRecipient().getId(),
                message.getSender().getUsername(),
                message.getEncryptedMessage(), // In a real app, you would decrypt this
                message.getTimestamp()
        );
    }
}