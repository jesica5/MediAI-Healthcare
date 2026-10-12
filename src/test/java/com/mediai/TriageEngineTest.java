package com.mediai;

import com.mediai.dto.TriageAssessRequest;
import com.mediai.dto.VitalsDto;
import com.mediai.service.TriageEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Triage Engine Clinical Scoring & Red Flag Tests")
class TriageEngineTest {

    private TriageEngineService triageEngineService;

    @BeforeEach
    void setUp() {
        triageEngineService = new TriageEngineService();
    }

    @Test
    @DisplayName("Phase 9 & Clinical Safety: Hard Red Flag escalates immediately to CRITICAL P1 with score 100")
    void testHardRedFlagCardiacEscalation() {
        TriageAssessRequest request = new TriageAssessRequest();
        request.setChiefComplaint("Crushing retrosternal chest pain radiating to left jaw");

        VitalsDto vitals = new VitalsDto();
        vitals.setHeartRate(130);
        vitals.setSystolicBp(80); // Profound shock
        vitals.setDiastolicBp(50);
        vitals.setOxygenSaturation(88.0); // Severe hypoxemia
        vitals.setRespiratoryRate(28);
        vitals.setTemperatureCelsius(37.5);
        request.setVitals(vitals);

        Map<String, Object> symptoms = new HashMap<>();
        Map<String, Object> cardiac = new HashMap<>();
        cardiac.put("chest_pain_character", "crushing");
        cardiac.put("radiation", "left_arm_jaw");
        cardiac.put("diaphoresis", true);
        symptoms.put("cardiac", cardiac);
        request.setSymptomVector(symptoms);

        TriageEngineService.AssessmentCalculationResult result = triageEngineService.evaluateTriage(request);

        assertTrue(result.hardRedFlagTriggered, "Tier-1 Cardiac red flag must be triggered");
        assertEquals("CRITICAL", result.calculatedCategory, "Category must be CRITICAL");
        assertEquals(100, result.calculatedRiskScore, "Score must be forced to 100 for Hard Red Flag");
        assertEquals(1.00, result.confidenceScore, "Confidence score must be 1.00 for hard red flag");
        assertFalse(result.redFlagDetails.isEmpty());
    }

    @Test
    @DisplayName("Phase 11: Fever is prioritized as first symptom and contributes to score without false diagnosis")
    void testFeverPrioritization() {
        TriageAssessRequest request = new TriageAssessRequest();
        request.setChiefComplaint("Persistent high fever and chills");

        VitalsDto vitals = new VitalsDto();
        vitals.setHeartRate(88);
        vitals.setSystolicBp(120);
        vitals.setDiastolicBp(80);
        vitals.setOxygenSaturation(98.0);
        vitals.setRespiratoryRate(16);
        vitals.setTemperatureCelsius(38.8);
        request.setVitals(vitals);

        Map<String, Object> symptoms = new HashMap<>();
        Map<String, Object> fever = new HashMap<>();
        fever.put("present", true);
        fever.put("pattern", "continuous");
        fever.put("duration_days", 3);
        symptoms.put("fever", fever);
        request.setSymptomVector(symptoms);

        TriageEngineService.AssessmentCalculationResult result = triageEngineService.evaluateTriage(request);

        assertFalse(result.hardRedFlagTriggered, "Isolated fever without organ failure should not trigger Tier-1 emergency red flag");
        assertTrue(result.calculatedRiskScore > 10, "Fever must appropriately contribute to triage risk score");
        assertTrue((Double) result.scoreBreakdown.get("s_symptoms") >= 25, "Fever must contribute at least 25 to symptom score");
    }

    @Test
    @DisplayName("Phase 11: Body Pain is prioritized as second symptom with area and severity")
    void testBodyPainPrioritization() {
        TriageAssessRequest request = new TriageAssessRequest();
        request.setChiefComplaint("Generalized severe body pain");

        VitalsDto vitals = new VitalsDto();
        vitals.setHeartRate(78);
        vitals.setSystolicBp(122);
        vitals.setDiastolicBp(78);
        vitals.setOxygenSaturation(99.0);
        vitals.setRespiratoryRate(16);
        vitals.setTemperatureCelsius(37.0);
        request.setVitals(vitals);

        Map<String, Object> symptoms = new HashMap<>();
        Map<String, Object> bodyPain = new HashMap<>();
        bodyPain.put("present", true);
        bodyPain.put("affected_area", "Lower back and joints");
        bodyPain.put("severity", "severe");
        symptoms.put("body_pain", bodyPain);
        request.setSymptomVector(symptoms);

        TriageEngineService.AssessmentCalculationResult result = triageEngineService.evaluateTriage(request);

        assertNotNull(result.calculatedCategory);
        assertTrue(result.calculatedRiskScore > 10, "Severe body pain must contribute to triage risk score");
        assertTrue((Double) result.scoreBreakdown.get("s_symptoms") >= 25, "Body pain must contribute at least 25 to symptom score");
    }

    @Test
    @DisplayName("Missing essential vitals decreases confidence score to 0.60 (LOW)")
    void testMissingEssentialVitalsConfidence() {
        TriageAssessRequest request = new TriageAssessRequest();
        request.setChiefComplaint("Mild headache");

        // Vitals without SpO2 and SBP
        VitalsDto vitals = new VitalsDto();
        vitals.setHeartRate(75);
        request.setVitals(vitals);

        TriageEngineService.AssessmentCalculationResult result = triageEngineService.evaluateTriage(request);

        assertTrue(result.missingEssentialVitals.contains("oxygen_saturation"));
        assertTrue(result.missingEssentialVitals.contains("systolic_bp"));
        assertEquals("LOW", result.confidenceLevel);
        assertEquals(0.60, result.confidenceScore, 0.01);
    }
}
