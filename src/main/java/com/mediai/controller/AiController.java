package com.mediai.controller;

import com.mediai.dto.AiRiskPredictionRequest;
import com.mediai.dto.AiRiskPredictionResponse;
import com.mediai.dto.ApiResponse;
import com.mediai.service.AuditService;
import com.mediai.service.GeminiAiService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final GeminiAiService geminiAiService;
    private final AuditService auditService;

    public AiController(GeminiAiService geminiAiService, AuditService auditService) {
        this.geminiAiService = geminiAiService;
        this.auditService = auditService;
    }

    @PostMapping("/risk-prediction")
    public ResponseEntity<ApiResponse<Map<String, Object>>> predictRisk(
            @RequestBody AiRiskPredictionRequest request,
            HttpServletRequest httpServletRequest
    ) {
        if ((request.getChiefComplaint() == null || request.getChiefComplaint().isBlank()) &&
            (request.getSymptoms() == null || request.getSymptoms().isEmpty())) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("MISSING_INPUT", "Please provide symptoms or chief complaint for AI risk assessment.")
            );
        }

        AiRiskPredictionResponse prediction = geminiAiService.predictPatientRisk(request);

        auditService.logEvent(
            "AI_RISK_PREDICTION_GENERATED",
            null,
            request.getPatientId(),
            httpServletRequest.getRemoteAddr(),
            httpServletRequest.getHeader("User-Agent"),
            "{\"acuityLevel\":\"" + prediction.getAcuityLevel() + "\",\"riskScore\":" + prediction.getRiskScore() + "}"
        );

        Map<String, Object> data = new HashMap<>();
        data.put("prediction", prediction);

        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
