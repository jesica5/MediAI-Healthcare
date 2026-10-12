package com.mediai.dto;

import java.util.List;

public class AiRiskPredictionResponse {

    private String acuityLevel; // CRITICAL, HIGH, MODERATE, LOW
    private Integer riskScore; // 0 - 100
    private List<String> primaryRisks;
    private String clinicalRationale;
    private String patientFriendlyExplanation;
    private String recommendedTriageCategory;
    private List<String> urgentRedFlags;
    private List<String> nextSteps;
    private String aiModel;

    public AiRiskPredictionResponse() {}

    public String getAcuityLevel() { return acuityLevel; }
    public void setAcuityLevel(String acuityLevel) { this.acuityLevel = acuityLevel; }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }

    public List<String> getPrimaryRisks() { return primaryRisks; }
    public void setPrimaryRisks(List<String> primaryRisks) { this.primaryRisks = primaryRisks; }

    public String getClinicalRationale() { return clinicalRationale; }
    public void setClinicalRationale(String clinicalRationale) { this.clinicalRationale = clinicalRationale; }

    public String getPatientFriendlyExplanation() { return patientFriendlyExplanation; }
    public void setPatientFriendlyExplanation(String patientFriendlyExplanation) { this.patientFriendlyExplanation = patientFriendlyExplanation; }

    public String getRecommendedTriageCategory() { return recommendedTriageCategory; }
    public void setRecommendedTriageCategory(String recommendedTriageCategory) { this.recommendedTriageCategory = recommendedTriageCategory; }

    public List<String> getUrgentRedFlags() { return urgentRedFlags; }
    public void setUrgentRedFlags(List<String> urgentRedFlags) { this.urgentRedFlags = urgentRedFlags; }

    public List<String> getNextSteps() { return nextSteps; }
    public void setNextSteps(List<String> nextSteps) { this.nextSteps = nextSteps; }

    public String getAiModel() { return aiModel; }
    public void setAiModel(String aiModel) { this.aiModel = aiModel; }
}
