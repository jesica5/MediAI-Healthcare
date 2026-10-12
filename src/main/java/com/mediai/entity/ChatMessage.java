package com.mediai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "conversation_id", nullable = false, length = 64)
    private String conversationId;

    @Column(nullable = false, length = 20)
    private String sender; // "USER" or "ASSISTANT"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(length = 10)
    private String language; // "en" or "ta"

    @Column(name = "is_emergency")
    private Boolean isEmergency = false;

    @Column(name = "suggested_actions", length = 500)
    private String suggestedActions;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ChatMessage() {}

    public ChatMessage(String id, String conversationId, String sender, String message, String language, Boolean isEmergency, String suggestedActions) {
        this.id = id;
        this.conversationId = conversationId;
        this.sender = sender;
        this.message = message;
        this.language = language;
        this.isEmergency = isEmergency != null ? isEmergency : false;
        this.suggestedActions = suggestedActions;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Boolean getIsEmergency() { return isEmergency; }
    public void setIsEmergency(Boolean isEmergency) { this.isEmergency = isEmergency; }

    public String getSuggestedActions() { return suggestedActions; }
    public void setSuggestedActions(String suggestedActions) { this.suggestedActions = suggestedActions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
