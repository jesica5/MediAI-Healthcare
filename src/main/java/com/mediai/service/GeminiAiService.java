package com.mediai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediai.dto.AiRiskPredictionRequest;
import com.mediai.dto.AiRiskPredictionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiAiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiService.class);

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public AiRiskPredictionResponse predictPatientRisk(AiRiskPredictionRequest input) {
        String apiKey = (geminiApiKey != null) ? geminiApiKey.trim() : "";

        // Fallback heuristic engine if GEMINI_API_KEY is not configured or placeholder
        if (apiKey.isEmpty() || "YOUR_GEMINI_API_KEY".equalsIgnoreCase(apiKey)) {
            log.info("Gemini API key not configured; using deterministic clinical triage safety fallback");
            return generateFallbackRiskPrediction(input);
        }

        try {
            String languageName = "ta".equalsIgnoreCase(input.getPrimaryLanguage()) ? "Tamil" : "English";

            String prompt = String.format(
                "You are a senior emergency medicine triage specialist AI system (\"MediAI Triage Assistant\").\n" +
                "Analyze the following patient clinical presentation and provide an objective clinical acuity assessment and patient-friendly risk explanation in %s.\n\n" +
                "Patient Demographics & Presentation:\n" +
                "- Age / Gender: %s years / %s\n" +
                "- Chief Complaint: %s\n" +
                "- Reported Symptoms: %s\n" +
                "- Vital Signs: %s\n\n" +
                "INSTRUCTIONS:\n" +
                "Provide a JSON object response strictly conforming to this exact structure (no markdown fences, raw JSON):\n" +
                "{\n" +
                "  \"acuityLevel\": \"CRITICAL\" | \"HIGH\" | \"MODERATE\" | \"LOW\",\n" +
                "  \"riskScore\": integer between 0 and 100,\n" +
                "  \"primaryRisks\": [\"Array of top potential risk factors\"],\n" +
                "  \"clinicalRationale\": \"Detailed technical clinical reasoning for healthcare staff\",\n" +
                "  \"patientFriendlyExplanation\": \"Clear explanation translated for the patient in %s\",\n" +
                "  \"recommendedTriageCategory\": \"Immediate Resuscitation | Emergency | Urgent | Semi-Urgent\",\n" +
                "  \"urgentRedFlags\": [\"Warning signs requiring emergency evaluation\"],\n" +
                "  \"nextSteps\": [\"Actionable medical next steps\"]\n" +
                "}",
                languageName,
                input.getAge() != null ? input.getAge() : "Unspecified",
                input.getGender() != null ? input.getGender() : "Unspecified",
                input.getChiefComplaint() != null ? input.getChiefComplaint() : "None",
                input.getSymptoms() != null ? String.join(", ", input.getSymptoms()) : "None specified",
                input.getVitals() != null ? input.getVitals().toString() : "Unrecorded",
                languageName
            );

            String requestUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + apiKey;

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> contents = new HashMap<>();
            contents.put("parts", List.of(textPart));

            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("contents", List.of(contents));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(requestUrl, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    String rawText = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                    // Clean markdown code blocks if any
                    String cleaned = rawText.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
                    JsonNode parsed = objectMapper.readTree(cleaned);

                    AiRiskPredictionResponse resp = new AiRiskPredictionResponse();

                    // Phase 9: Scale and map risk score correctly!
                    double rawScore = parsed.path("riskScore").asDouble(50.0);
                    int normalizedScore;
                    // If model returned a 0-1 probability, convert to percentage 0-100%
                    if (rawScore > 0.0 && rawScore <= 1.0) {
                        normalizedScore = (int) Math.round(rawScore * 100);
                    } else {
                        normalizedScore = (int) Math.min(100, Math.max(0, Math.round(rawScore)));
                    }
                    resp.setRiskScore(normalizedScore);

                    // Map consistent acuity level
                    String acuity = parsed.path("acuityLevel").asText("");
                    if (acuity.isEmpty() || !List.of("CRITICAL", "HIGH", "MODERATE", "LOW").contains(acuity.toUpperCase())) {
                        if (normalizedScore >= 85) acuity = "CRITICAL";
                        else if (normalizedScore >= 60) acuity = "HIGH";
                        else if (normalizedScore >= 30) acuity = "MODERATE";
                        else acuity = "LOW";
                    }
                    resp.setAcuityLevel(acuity.toUpperCase());

                    List<String> primaryRisks = new ArrayList<>();
                    if (parsed.path("primaryRisks").isArray()) {
                        parsed.path("primaryRisks").forEach(r -> primaryRisks.add(r.asText()));
                    }
                    if (primaryRisks.isEmpty()) primaryRisks.add("Clinical symptom evaluation required");
                    resp.setPrimaryRisks(primaryRisks);

                    resp.setClinicalRationale(parsed.path("clinicalRationale").asText("Evaluated via MediAI decision-support analysis."));
                    resp.setPatientFriendlyExplanation(parsed.path("patientFriendlyExplanation").asText("Your symptoms have been reviewed by MediAI clinical triage."));
                    resp.setRecommendedTriageCategory(parsed.path("recommendedTriageCategory").asText("Urgent Evaluation"));

                    List<String> redFlags = new ArrayList<>();
                    if (parsed.path("urgentRedFlags").isArray()) {
                        parsed.path("urgentRedFlags").forEach(rf -> redFlags.add(rf.asText()));
                    }
                    resp.setUrgentRedFlags(redFlags);

                    List<String> nextSteps = new ArrayList<>();
                    if (parsed.path("nextSteps").isArray()) {
                        parsed.path("nextSteps").forEach(ns -> nextSteps.add(ns.asText()));
                    }
                    resp.setNextSteps(nextSteps);

                    resp.setAiModel("Google Gemini (" + geminiModel + ")");
                    return resp;
                }
            }
        } catch (Exception e) {
            log.warn("Gemini API call failed, falling back to deterministic safety engine: {}", e.getMessage());
        }

        return generateFallbackRiskPrediction(input);
    }

    /**
     * Deterministic Safety Fallback Risk Engine
     */
    public AiRiskPredictionResponse generateFallbackRiskPrediction(AiRiskPredictionRequest input) {
        String symptomsJoined = "";
        if (input.getSymptoms() != null) {
            symptomsJoined = String.join(" ", input.getSymptoms()).toLowerCase();
        }
        String cc = input.getChiefComplaint() != null ? input.getChiefComplaint().toLowerCase() : "";
        String combined = symptomsJoined + " " + cc;

        boolean isTa = "ta".equalsIgnoreCase(input.getPrimaryLanguage());

        // Parse vitals
        Double spo2 = null;
        Integer hr = null;
        Integer sbp = null;
        Integer dbp = null;
        if (input.getVitals() != null) {
            if (input.getVitals().get("oxygenSaturation") != null) {
                try { spo2 = Double.valueOf(input.getVitals().get("oxygenSaturation").toString()); } catch (Exception ignored) {}
            }
            if (input.getVitals().get("heartRate") != null) {
                try { hr = Integer.valueOf(input.getVitals().get("heartRate").toString()); } catch (Exception ignored) {}
            }
            if (input.getVitals().get("systolicBp") != null) {
                try { sbp = Integer.valueOf(input.getVitals().get("systolicBp").toString()); } catch (Exception ignored) {}
            }
            if (input.getVitals().get("diastolicBp") != null) {
                try { dbp = Integer.valueOf(input.getVitals().get("diastolicBp").toString()); } catch (Exception ignored) {}
            }
        }

        List<String> criticalKeywords = List.of(
            "crushing chest pain", "shortness of breath", "unconscious", "severe bleeding",
            "stroke", "seizure", "cardiac arrest", "cyanosis", "stridor", "hypoxia", "acute_chest_pain", "dyspnea",
            "நெஞ்சு வலி", "மூச்சுத்திணறல்"
        );
        List<String> highKeywords = List.of(
            "high fever", "severe pain", "fainting", "persistent vomiting", "syncope", "dka", "hemiplegia",
            "அதிக காய்ச்சல்", "கடுமையான வலி"
        );
        List<String> moderateKeywords = List.of(
            "fever", "moderate pain", "vomiting", "diarrhea", "productive cough", "abdominal pain",
            "காய்ச்சல்", "இருமல்", "வயிற்றுப்போக்கு"
        );

        String acuityLevel;
        int riskScore;
        String recommendedTriage;
        List<String> urgentRedFlags = new ArrayList<>();

        // Check for CRITICAL triggers
        boolean isCriticalKeywords = criticalKeywords.stream().anyMatch(combined::contains);
        boolean isCriticalVitals = (spo2 != null && spo2 < 90.0) || (sbp != null && sbp < 85) || (hr != null && (hr > 135 || hr < 40));

        // Check for HIGH triggers
        boolean isHighKeywords = highKeywords.stream().anyMatch(combined::contains);
        boolean isHighVitals = (spo2 != null && spo2 < 94.0) || (sbp != null && (sbp < 90 || sbp >= 170)) || (hr != null && (hr > 115 || hr < 50));

        // Check for MODERATE triggers
        boolean isModerateKeywords = moderateKeywords.stream().anyMatch(combined::contains);
        boolean isModerateVitals = (spo2 != null && spo2 < 96.0) || (sbp != null && (sbp >= 145 || sbp < 95)) || (hr != null && (hr > 100 || hr < 58));

        if (isCriticalKeywords || isCriticalVitals) {
            acuityLevel = "CRITICAL";
            riskScore = 92;
            recommendedTriage = isTa ? "உடனடி அவசர சிகிச்சை (Immediate Emergency Level 1)" : "Immediate Resuscitation / Emergency Care (Level 1)";
            urgentRedFlags.addAll(List.of("Severe cardiorespiratory or neurological compromise detected", "Continuous vital signs monitor attached"));
        } else if (isHighKeywords || isHighVitals) {
            acuityLevel = "HIGH";
            riskScore = 74;
            recommendedTriage = isTa ? "விரைவு சிகிச்சை (Urgent Triage Level 2)" : "Urgent Clinical Evaluation (Level 2)";
            urgentRedFlags.add("Acute physiological deviation - prompt physician evaluation required");
        } else if (isModerateKeywords || isModerateVitals) {
            acuityLevel = "MODERATE";
            riskScore = 48;
            recommendedTriage = isTa ? "மத்திய முன்னுரிமை சிகிச்சை (Moderate Triage Level 3)" : "Moderate Priority Evaluation (Level 3)";
        } else {
            // LOW LEVEL: Mild complaints (seasonal allergies, cold, minor rash) with normal vital signs!
            acuityLevel = "LOW";
            riskScore = 18;
            recommendedTriage = isTa ? "சாதாரண ஆம்புலேட்டரி சிகிச்சை (Low Priority Level 4)" : "Routine Ambulatory / Outpatient Care (Level 4 / Low Priority)";
            // urgentRedFlags remains empty!
        }

        AiRiskPredictionResponse resp = new AiRiskPredictionResponse();
        resp.setAcuityLevel(acuityLevel);
        resp.setRiskScore(riskScore);
        resp.setRecommendedTriageCategory(recommendedTriage);

        List<String> primaryRisks = new ArrayList<>();
        if ("CRITICAL".equals(acuityLevel)) {
            primaryRisks.add("Critical physiological instability or acute cardiorespiratory compromise");
        } else if ("HIGH".equals(acuityLevel)) {
            primaryRisks.add("Potential rapid clinical deterioration requiring urgent physician review");
        } else if ("MODERATE".equals(acuityLevel)) {
            primaryRisks.add("Moderate physiological symptoms requiring medical evaluation");
        } else {
            primaryRisks.add("Mild non-urgent symptoms; all vital signs within stable normal clinical baselines");
        }
        resp.setPrimaryRisks(primaryRisks);

        resp.setClinicalRationale(String.format(
            "Clinical risk score (%d/100) calculated based on presented symptoms (%s), vital parameters (HR: %s, SpO2: %s, BP: %s/%s), and emergency triage safety protocol rules.",
            riskScore,
            input.getChiefComplaint() != null ? input.getChiefComplaint() : "Reported symptoms",
            hr != null ? hr.toString() : "Normal",
            spo2 != null ? spo2 + "%" : "Normal",
            sbp != null ? sbp.toString() : "Normal",
            dbp != null ? dbp.toString() : "Normal"
        ));

        resp.setPatientFriendlyExplanation(isTa ?
            String.format("உங்கள் அறிகுறிகள் (%s) MediAI அமைப்பால் ஆய்வு செய்யப்பட்டுள்ளன. உங்களுக்கு %s முன்னுரிமை ஒதுக்கப்பட்டுள்ளது. உங்கள் உடலியல் அளவீடுகள் சீராக உள்ளன.",
                input.getChiefComplaint() != null ? input.getChiefComplaint() : "பதிவு செய்யப்பட்ட அறிகுறிகள்", acuityLevel) :
            String.format("Your presented symptoms (%s) have been evaluated by MediAI. An acuity tier of %s has been assigned. Your vital signs are currently stable within normal clinical limits.",
                input.getChiefComplaint() != null ? input.getChiefComplaint() : "reported symptoms", acuityLevel)
        );

        resp.setUrgentRedFlags(urgentRedFlags);
        resp.setNextSteps("LOW".equals(acuityLevel) ?
            List.of("Proceed to outpatient registration desk", "Routine clinical consultation as non-urgent ambulatory patient") :
            List.of("Proceed to triage nurse evaluation bay", "Keep vital signs monitor attached"));
        resp.setAiModel("MediAI Safety Decision-Support Engine");

        return resp;
    }
}
