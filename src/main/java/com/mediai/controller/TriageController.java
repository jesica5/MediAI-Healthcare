package com.mediai.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediai.dto.AiRiskPredictionRequest;
import com.mediai.dto.AiRiskPredictionResponse;
import com.mediai.dto.ApiResponse;
import com.mediai.dto.TriageAssessRequest;
import com.mediai.dto.TriageAssessResponse;
import com.mediai.dto.VitalsDto;
import com.mediai.entity.Patient;
import com.mediai.entity.TriageAssessment;
import com.mediai.entity.VitalSigns;
import com.mediai.repository.PatientRepository;
import com.mediai.repository.TriageAssessmentRepository;
import com.mediai.service.AuditService;
import com.mediai.service.GeminiAiService;
import com.mediai.service.PatientService;
import com.mediai.service.TriageEngineService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/triage")
public class TriageController {

    private final TriageEngineService triageEngineService;
    private final GeminiAiService geminiAiService;
    private final PatientRepository patientRepository;
    private final TriageAssessmentRepository assessmentRepository;
    private final PatientService patientService;
    private final AuditService auditService;
    private final com.mediai.service.NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TriageController(
            TriageEngineService triageEngineService,
            GeminiAiService geminiAiService,
            PatientRepository patientRepository,
            TriageAssessmentRepository assessmentRepository,
            PatientService patientService,
            AuditService auditService,
            com.mediai.service.NotificationService notificationService
    ) {
        this.triageEngineService = triageEngineService;
        this.geminiAiService = geminiAiService;
        this.patientRepository = patientRepository;
        this.assessmentRepository = assessmentRepository;
        this.patientService = patientService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @PostMapping("/assess")
    public ResponseEntity<ApiResponse<TriageAssessResponse>> assessPatient(
            @Valid @RequestBody TriageAssessRequest request,
            HttpServletRequest httpServletRequest
    ) throws JsonProcessingException {

        // 1. Validate vitals logical constraint (diastolic < systolic)
        VitalsDto vitals = request.getVitals();
        if (vitals != null && !vitals.isBloodPressureLogicallyValid()) {
            throw new IllegalArgumentException("Diastolic blood pressure must be lower than systolic blood pressure");
        }

        // 2. Validate Demographics / DOB (Phase 7)
        if (request.getDemographics() != null && request.getDemographics().getDateOfBirth() != null) {
            LocalDate dob = request.getDemographics().getDateOfBirth();
            if (dob.isAfter(LocalDate.now())) {
                throw new IllegalArgumentException("Date of Birth cannot be in the future");
            }
            int calculatedAge = patientService.calculateCurrentAge(dob);
            request.getDemographics().setAge(calculatedAge);
        }

        // 3. Evaluate deterministic clinical rules & safety red flags
        TriageEngineService.AssessmentCalculationResult triageResult = triageEngineService.evaluateTriage(request);

        // 4. Generate AI Decision-Support Explanation (Prompt-Guarded with Graceful Fallback)
        AiRiskPredictionRequest aiInput = new AiRiskPredictionRequest();
        aiInput.setChiefComplaint(request.getChiefComplaint());
        aiInput.setPrimaryLanguage(request.getLanguage());
        if (request.getDemographics() != null) {
            aiInput.setAge(request.getDemographics().getAge());
            aiInput.setGender(request.getDemographics().getGender());
        }
        if (vitals != null) {
            Map<String, Object> vitalsMap = new HashMap<>();
            vitalsMap.put("heartRate", vitals.getHeartRate());
            vitalsMap.put("systolicBp", vitals.getSystolicBp());
            vitalsMap.put("diastolicBp", vitals.getDiastolicBp());
            vitalsMap.put("respiratoryRate", vitals.getRespiratoryRate());
            vitalsMap.put("oxygenSaturation", vitals.getOxygenSaturation());
            vitalsMap.put("temperatureCelsius", vitals.getTemperatureCelsius());
            vitalsMap.put("capillaryBloodGlucose", vitals.getCapillaryBloodGlucose());
            aiInput.setVitals(vitalsMap);
        }
        List<String> activeSymptoms = new ArrayList<>();
        if (request.getSymptomVector() != null) {
            for (Map.Entry<String, Object> entry : request.getSymptomVector().entrySet()) {
                String sympName = entry.getKey();
                Object val = entry.getValue();
                if (val instanceof Boolean && (Boolean) val) {
                    activeSymptoms.add(sympName);
                } else if (val instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> map = (Map<String, Object>) val;
                    Object present = map.get("present");
                    if (present == null || Boolean.TRUE.equals(present) || "true".equalsIgnoreCase(String.valueOf(present))) {
                        StringBuilder sb = new StringBuilder(sympName);
                        List<String> parts = new ArrayList<>();
                        if (map.containsKey("pattern")) parts.add("pattern: " + map.get("pattern"));
                        if (map.containsKey("duration")) parts.add("duration: " + map.get("duration"));
                        if (map.containsKey("severity")) parts.add("severity: " + map.get("severity"));
                        if (map.containsKey("area")) parts.add("area: " + map.get("area"));
                        if (map.containsKey("affected_area")) parts.add("area: " + map.get("affected_area"));
                        if (!parts.isEmpty()) {
                            sb.append(" (").append(String.join(", ", parts)).append(")");
                        }
                        activeSymptoms.add(sb.toString());
                    }
                }
            }
        }
        aiInput.setSymptoms(activeSymptoms);
        AiRiskPredictionResponse aiResp = geminiAiService.predictPatientRisk(aiInput);

        // 5. Persist Patient, Vitals & Assessment to MySQL
        String patientId = (request.getPatientId() != null && !request.getPatientId().isBlank())
                ? request.getPatientId() : UUID.randomUUID().toString();

        Patient patient = patientRepository.findById(patientId).orElseGet(() -> {
            LocalDate dob = (request.getDemographics() != null && request.getDemographics().getDateOfBirth() != null)
                    ? request.getDemographics().getDateOfBirth() : LocalDate.of(1990, 1, 1);
            String gender = (request.getDemographics() != null && request.getDemographics().getGender() != null)
                    ? request.getDemographics().getGender() : "OTHER";
            String lang = request.getLanguage() != null ? request.getLanguage() : "en";
            String mrn = "MRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Patient p = new Patient(patientId, mrn, "ENC_NAME", "Patient (Intake Terminal)", dob, gender, lang);
            return patientRepository.save(p);
        });

        VitalSigns vitalRecord = null;
        if (vitals != null) {
            vitalRecord = new VitalSigns();
            vitalRecord.setId(UUID.randomUUID().toString());
            vitalRecord.setPatient(patient);
            vitalRecord.setHeartRate(vitals.getHeartRate());
            vitalRecord.setRespiratoryRate(vitals.getRespiratoryRate());
            vitalRecord.setSystolicBp(vitals.getSystolicBp());
            vitalRecord.setDiastolicBp(vitals.getDiastolicBp());
            vitalRecord.setOxygenSaturation(vitals.getOxygenSaturation());
            vitalRecord.setTemperatureCelsius(vitals.getTemperatureCelsius());
            vitalRecord.setCapillaryBloodGlucose(vitals.getCapillaryBloodGlucose());
            vitalRecord.setRecordedBy("patient_self_intake");
            vitalRecord.setRecordedAt(LocalDateTime.now());
        }

        String assessmentId = UUID.randomUUID().toString();
        TriageAssessment assessment = new TriageAssessment();
        assessment.setId(assessmentId);
        assessment.setPatient(patient);
        assessment.setVitals(vitalRecord);
        assessment.setChiefComplaint(request.getChiefComplaint());
        assessment.setSymptomVector(objectMapper.writeValueAsString(request.getSymptomVector() != null ? request.getSymptomVector() : Map.of()));
        assessment.setCalculatedRiskScore(triageResult.calculatedRiskScore);
        assessment.setCalculatedCategory(triageResult.calculatedCategory);
        assessment.setHardRedFlagTriggered(triageResult.hardRedFlagTriggered);
        assessment.setRedFlagDetails(objectMapper.writeValueAsString(triageResult.redFlagDetails));
        assessment.setConfidenceScore(triageResult.confidenceScore);
        assessment.setConfidenceLevel(triageResult.confidenceLevel);
        assessment.setExplainabilityPayload(objectMapper.writeValueAsString(triageResult.explainabilityPayload));

        Map<String, Object> aiMap = new HashMap<>();
        aiMap.put("acuityLevel", aiResp.getAcuityLevel());
        aiMap.put("riskScore", aiResp.getRiskScore());
        aiMap.put("clinicalRationale", aiResp.getClinicalRationale());
        aiMap.put("patientFriendlyExplanation", aiResp.getPatientFriendlyExplanation());
        aiMap.put("urgentRedFlags", aiResp.getUrgentRedFlags());
        assessment.setAiExplanationPayload(objectMapper.writeValueAsString(aiMap));
        assessment.setStatus("PENDING_REVIEW");
        assessment.setCreatedAt(LocalDateTime.now());

        assessmentRepository.save(assessment);

        // Dispatch clinical notification alerts
        if (triageResult.hardRedFlagTriggered || "CRITICAL".equalsIgnoreCase(triageResult.calculatedCategory)) {
            notificationService.createNotification(
                "DOCTOR",
                "🚨 CRITICAL Triage Alert",
                "Critical acuity patient (" + (request.getChiefComplaint() != null ? request.getChiefComplaint() : "Emergency presentation") + "). Immediate physician attention required.",
                "CRITICAL",
                assessmentId
            );
            notificationService.createNotification(
                "NURSE",
                "🚨 Critical Bay Alert",
                "Immediate resuscitation / monitoring required for new P1 critical patient.",
                "CRITICAL",
                assessmentId
            );
        } else if ("HIGH".equalsIgnoreCase(triageResult.calculatedCategory)) {
            notificationService.createNotification(
                "DOCTOR",
                "⚠️ High Acuity Evaluation Notice",
                "Patient evaluated at HIGH priority: " + (request.getChiefComplaint() != null ? request.getChiefComplaint() : "Urgent evaluation required"),
                "HIGH",
                assessmentId
            );
        } else {
            notificationService.createNotification(
                "ALL",
                "New Triage Assessment Recorded",
                "Assessment completed with " + triageResult.calculatedCategory + " priority (" + (request.getChiefComplaint() != null ? request.getChiefComplaint() : "Routine") + ").",
                "INFO",
                assessmentId
            );
        }

        // 6. Record Audit Journal Entry
        auditService.logEvent(
            triageResult.hardRedFlagTriggered ? "TIER_1_RED_FLAG_TRIGGERED" : "TRIAGE_ASSESSMENT_COMPLETED",
            null,
            patientId,
            httpServletRequest.getRemoteAddr(),
            httpServletRequest.getHeader("User-Agent"),
            "{\"assessmentId\":\"" + assessmentId + "\",\"acuity\":\"" + triageResult.calculatedCategory + "\",\"score\":" + triageResult.calculatedRiskScore + "}"
        );

        // 7. Build Response
        TriageAssessResponse response = new TriageAssessResponse();
        response.setAssessmentId(assessmentId);
        response.setPatientId(patientId);
        response.setStatus("PENDING_REVIEW");
        response.setCalculatedRiskScore(triageResult.calculatedRiskScore);
        response.setCalculatedCategory(triageResult.calculatedCategory);
        response.setHardRedFlagTriggered(triageResult.hardRedFlagTriggered);
        response.setRedFlagDetails(triageResult.redFlagDetails);
        response.setConfidenceScore(triageResult.confidenceScore);
        response.setConfidenceLevel(triageResult.confidenceLevel);
        response.setMissingEssentialVitals(triageResult.missingEssentialVitals);
        response.setScoreBreakdown(triageResult.scoreBreakdown);
        response.setExplainabilityPayload(triageResult.explainabilityPayload);
        response.setRiskExplanation(aiMap);

        String disclaimer = "ta".equalsIgnoreCase(request.getLanguage())
            ? "கல்வி மருத்துவ முடிவு-ஆதரவு முன்மாதிரி மட்டுமே. இது நோய்களைக் கண்டறியவோ, மருந்து பரிந்துரைக்கவோ அல்லது தகுதி வாய்ந்த மருத்துவர்களுக்கு மாற்றாகவோ அமையாது."
            : "Academic clinical decision-support prototype. It must never independently diagnose patients, prescribe medications, calculate dosages, or replace qualified medical professionals.";
        response.setClinicalDisclaimer(disclaimer);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
