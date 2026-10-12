package com.mediai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "triage_assessments", indexes = {
    @Index(name = "idx_assessment_patient", columnList = "patient_id"),
    @Index(name = "idx_assessment_status", columnList = "status"),
    @Index(name = "idx_assessment_acuity", columnList = "calculated_category"),
    @Index(name = "idx_assessment_red_flag", columnList = "hard_red_flag_triggered")
})
public class TriageAssessment {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "vital_id")
    private VitalSigns vitals;

    @Column(name = "chief_complaint", nullable = false, columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "symptom_vector", nullable = false, columnDefinition = "TEXT")
    private String symptomVector;

    @Column(name = "calculated_risk_score", nullable = false)
    private Integer calculatedRiskScore;

    @Column(name = "calculated_category", nullable = false, length = 16)
    private String calculatedCategory; // CRITICAL, HIGH, MODERATE, LOW

    @Column(name = "hard_red_flag_triggered", nullable = false)
    private Boolean hardRedFlagTriggered = false;

    @Column(name = "red_flag_details", columnDefinition = "TEXT")
    private String redFlagDetails;

    @Column(name = "confidence_score", nullable = false)
    private Double confidenceScore;

    @Column(name = "confidence_level", length = 16)
    private String confidenceLevel = "HIGH";

    @Column(name = "explainability_payload", columnDefinition = "TEXT")
    private String explainabilityPayload;

    @Column(name = "ai_explanation_payload", columnDefinition = "TEXT")
    private String aiExplanationPayload;

    @Column(nullable = false, length = 32)
    private String status = "PENDING_REVIEW"; // PENDING_REVIEW, CONFIRMED, OVERRIDDEN, DISCHARGED

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public TriageAssessment() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public VitalSigns getVitals() { return vitals; }
    public void setVitals(VitalSigns vitals) { this.vitals = vitals; }

    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }

    public String getSymptomVector() { return symptomVector; }
    public void setSymptomVector(String symptomVector) { this.symptomVector = symptomVector; }

    public Integer getCalculatedRiskScore() { return calculatedRiskScore; }
    public void setCalculatedRiskScore(Integer calculatedRiskScore) { this.calculatedRiskScore = calculatedRiskScore; }

    public String getCalculatedCategory() { return calculatedCategory; }
    public void setCalculatedCategory(String calculatedCategory) { this.calculatedCategory = calculatedCategory; }

    public Boolean getHardRedFlagTriggered() { return hardRedFlagTriggered; }
    public void setHardRedFlagTriggered(Boolean hardRedFlagTriggered) { this.hardRedFlagTriggered = hardRedFlagTriggered; }

    public String getRedFlagDetails() { return redFlagDetails; }
    public void setRedFlagDetails(String redFlagDetails) { this.redFlagDetails = redFlagDetails; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(String confidenceLevel) { this.confidenceLevel = confidenceLevel; }

    public String getExplainabilityPayload() { return explainabilityPayload; }
    public void setExplainabilityPayload(String explainabilityPayload) { this.explainabilityPayload = explainabilityPayload; }

    public String getAiExplanationPayload() { return aiExplanationPayload; }
    public void setAiExplanationPayload(String aiExplanationPayload) { this.aiExplanationPayload = aiExplanationPayload; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
