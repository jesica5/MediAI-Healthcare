package com.mediai.controller;

import com.mediai.dto.ApiResponse;
import com.mediai.dto.ChatRequest;
import com.mediai.dto.ChatResponse;
import com.mediai.entity.ChatMessage;
import com.mediai.service.AuditService;
import com.mediai.service.ChatbotService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final AuditService auditService;

    public ChatbotController(ChatbotService chatbotService, AuditService auditService) {
        this.chatbotService = chatbotService;
        this.auditService = auditService;
    }

    @PostMapping("/message")
    public ResponseEntity<ApiResponse<ChatResponse>> sendMessage(
            @Valid @RequestBody ChatRequest request,
            HttpServletRequest httpServletRequest
    ) {
        ChatResponse response = chatbotService.processUserMessage(request);

        if (response.isEmergency()) {
            auditService.logEvent(
                "CHATBOT_EMERGENCY_RED_FLAG_DETECTED",
                null,
                null,
                httpServletRequest.getRemoteAddr(),
                httpServletRequest.getHeader("User-Agent"),
                "{\"conversationId\":\"" + response.getConversationId() + "\",\"query\":\"" + request.getMessage().replaceAll("\"", "'") + "\"}"
            );
        }

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/history/{conversationId}")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getHistory(@PathVariable String conversationId) {
        List<ChatMessage> history = chatbotService.getConversationHistory(conversationId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @DeleteMapping("/history/{conversationId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> clearHistory(@PathVariable String conversationId) {
        chatbotService.clearConversation(conversationId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Conversation history cleared successfully.")));
    }
}
