package com.mediai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

public class ChatResponse {

    private String reply;

    @JsonProperty("is_emergency")
    private boolean emergency;

    @JsonProperty("suggested_actions")
    private List<String> suggestedActions = new ArrayList<>();

    @JsonProperty("conversation_id")
    private String conversationId;

    private String timestamp;

    public ChatResponse() {}

    public ChatResponse(String reply, boolean emergency, List<String> suggestedActions, String conversationId, String timestamp) {
        this.reply = reply;
        this.emergency = emergency;
        this.suggestedActions = suggestedActions != null ? suggestedActions : new ArrayList<>();
        this.conversationId = conversationId;
        this.timestamp = timestamp;
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public boolean isEmergency() { return emergency; }
    public void setEmergency(boolean emergency) { this.emergency = emergency; }

    public List<String> getSuggestedActions() { return suggestedActions; }
    public void setSuggestedActions(List<String> suggestedActions) { this.suggestedActions = suggestedActions; }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
