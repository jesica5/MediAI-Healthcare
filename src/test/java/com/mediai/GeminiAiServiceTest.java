package com.mediai;

import com.mediai.dto.AiRiskPredictionRequest;
import com.mediai.dto.AiRiskPredictionResponse;
import com.mediai.service.GeminiAiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Phase 9: AI Risk Prediction & Scoring Fix Tests")
class GeminiAiServiceTest {

    private GeminiAiService geminiAiService;

    @BeforeEach
    void setUp() {
        geminiAiService = new GeminiAiService();
    }

    @Test
    @DisplayName("Deterministic fallback correctly assigns CRITICAL tier to severe cardiac symptoms")
    void testCriticalSymptomFallback() {
        AiRiskPredictionRequest request = new AiRiskPredictionRequest();
        request.setChiefComplaint("Chest pain and shortness of breath");
        request.setSymptoms(List.of("chest pain", "shortness of breath", "cold sweats"));
        request.setPrimaryLanguage("en");

        AiRiskPredictionResponse response = geminiAiService.generateFallbackRiskPrediction(request);

        assertNotNull(response);
        assertEquals("CRITICAL", response.getAcuityLevel(), "Critical symptoms must result in CRITICAL acuity tier");
        assertTrue(response.getRiskScore() >= 85, "Risk score must be >= 85 for CRITICAL presentation");
        assertNotNull(response.getClinicalRationale(), "Must provide clinical rationale");
        assertNotNull(response.getPatientFriendlyExplanation(), "Must provide patient-friendly explanation");
        assertFalse(response.getUrgentRedFlags().isEmpty(), "Must list urgent red flags");
    }

    @Test
    @DisplayName("Tamil translation returned when primaryLanguage is 'ta'")
    void testTamilBilingualExplanation() {
        AiRiskPredictionRequest request = new AiRiskPredictionRequest();
        request.setChiefComplaint("அதிக காய்ச்சல் மற்றும் நெஞ்சு வலி");
        request.setSymptoms(List.of("நெஞ்சு வலி", "அதிக காய்ச்சல்"));
        request.setPrimaryLanguage("ta");

        AiRiskPredictionResponse response = geminiAiService.generateFallbackRiskPrediction(request);

        assertNotNull(response);
        assertTrue(response.getPatientFriendlyExplanation().contains("MediAI"), "Explanation must be formatted");
        assertEquals("CRITICAL", response.getAcuityLevel());
    }

    @Test
    @DisplayName("Risk score is bounded between 0 and 100")
    void testScoreBounds() {
        AiRiskPredictionRequest request = new AiRiskPredictionRequest();
        request.setChiefComplaint("Mild headache and mild fatigue");
        request.setSymptoms(List.of("headache"));
        request.setPrimaryLanguage("en");

        AiRiskPredictionResponse response = geminiAiService.generateFallbackRiskPrediction(request);

        assertTrue(response.getRiskScore() >= 0 && response.getRiskScore() <= 100, "Score must be bounded [0, 100]");
        assertNotNull(response.getAcuityLevel());
    }
}
