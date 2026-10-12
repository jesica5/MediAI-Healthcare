package com.mediai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class ChatRequest {

    @NotBlank(message = "Message text cannot be empty")
    private String message;

    private String language = "en"; // "en" or "ta"

    @JsonProperty("conversation_id")
    private String conversationId;

    @JsonProperty("user_role")
    private String userRole = "PATIENT";

    public ChatRequest() {}

    public ChatRequest(String message, String language, String conversationId, String userRole) {
        this.message = message;
        this.language = language;
        this.conversationId = conversationId;
        this.userRole = userRole;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
}
