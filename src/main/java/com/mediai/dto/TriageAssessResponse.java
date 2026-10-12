package com.mediai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class TriageAssessResponse {

    @JsonProperty("assessment_id")
    private String assessmentId;

    @JsonProperty("patient_id")
    private String patientId;

    private String status;

    @JsonProperty("calculated_risk_score")
    private Integer calculatedRiskScore;

    @JsonProperty("calculated_category")
    private String calculatedCategory;

    @JsonProperty("hard_red_flag_triggered")
    private Boolean hardRedFlagTriggered;

    @JsonProperty("red_flag_details")
    private List<String> redFlagDetails;

    @JsonProperty("confidence_score")
    private Double confidenceScore;

    @JsonProperty("confidence_level")
    private String confidenceLevel;

    @JsonProperty("missing_essential_vitals")
    private List<String> missingEssentialVitals;

    @JsonProperty("score_breakdown")
    private Map<String, Object> scoreBreakdown;

    @JsonProperty("explainability_payload")
    private Map<String, Object> explainabilityPayload;

    @JsonProperty("risk_explanation")
    private Map<String, Object> riskExplanation;

    @JsonProperty("clinical_disclaimer")
    private String clinicalDisclaimer;

    public TriageAssessResponse() {}

    public String getAssessmentId() { return assessmentId; }
    public void setAssessmentId(String assessmentId) { this.assessmentId = assessmentId; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getCalculatedRiskScore() { return calculatedRiskScore; }
    public void setCalculatedRiskScore(Integer calculatedRiskScore) { this.calculatedRiskScore = calculatedRiskScore; }

    public String getCalculatedCategory() { return calculatedCategory; }
    public void setCalculatedCategory(String calculatedCategory) { this.calculatedCategory = calculatedCategory; }

    public Boolean getHardRedFlagTriggered() { return hardRedFlagTriggered; }
    public void setHardRedFlagTriggered(Boolean hardRedFlagTriggered) { this.hardRedFlagTriggered = hardRedFlagTriggered; }

    public List<String> getRedFlagDetails() { return redFlagDetails; }
    public void setRedFlagDetails(List<String> redFlagDetails) { this.redFlagDetails = redFlagDetails; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(String confidenceLevel) { this.confidenceLevel = confidenceLevel; }

    public List<String> getMissingEssentialVitals() { return missingEssentialVitals; }
    public void setMissingEssentialVitals(List<String> missingEssentialVitals) { this.missingEssentialVitals = missingEssentialVitals; }

    public Map<String, Object> getScoreBreakdown() { return scoreBreakdown; }
    public void setScoreBreakdown(Map<String, Object> scoreBreakdown) { this.scoreBreakdown = scoreBreakdown; }

    public Map<String, Object> getExplainabilityPayload() { return explainabilityPayload; }
    public void setExplainabilityPayload(Map<String, Object> explainabilityPayload) { this.explainabilityPayload = explainabilityPayload; }

    public Map<String, Object> getRiskExplanation() { return riskExplanation; }
    public void setRiskExplanation(Map<String, Object> riskExplanation) { this.riskExplanation = riskExplanation; }

    public String getClinicalDisclaimer() { return clinicalDisclaimer; }
    public void setClinicalDisclaimer(String clinicalDisclaimer) { this.clinicalDisclaimer = clinicalDisclaimer; }
}
