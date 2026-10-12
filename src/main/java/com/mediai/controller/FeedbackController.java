package com.mediai.controller;

import com.mediai.dto.ApiResponse;
import com.mediai.dto.FeedbackRequest;
import com.mediai.entity.Feedback;
import com.mediai.service.AuditService;
import com.mediai.service.FeedbackService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final AuditService auditService;

    public FeedbackController(FeedbackService feedbackService, AuditService auditService) {
        this.feedbackService = feedbackService;
        this.auditService = auditService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Feedback>> submitFeedback(
            @Valid @RequestBody FeedbackRequest request,
            HttpServletRequest httpServletRequest
    ) {
        Feedback saved = feedbackService.submitFeedback(
            request.getRating(),
            request.getComment(),
            request.getCategory(),
            request.getSubmitterRole(),
            request.getReferenceId()
        );

        auditService.logEvent(
            "USER_FEEDBACK_SUBMITTED",
            null,
            request.getReferenceId(),
            httpServletRequest.getRemoteAddr(),
            httpServletRequest.getHeader("User-Agent"),
            "{\"rating\":" + request.getRating() + ",\"category\":\"" + request.getCategory() + "\"}"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(saved));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFeedbackSummary() {
        Map<String, Object> summary = feedbackService.getFeedbackSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
