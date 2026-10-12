package com.mediai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class DoctorOverrideRequest {

    @NotBlank(message = "Assessment ID is required")
    @JsonProperty("assessment_id")
    private String assessmentId;

    @NotBlank(message = "Doctor ID is required")
    @JsonProperty("doctor_id")
    private String doctorId;

    @NotBlank(message = "Final category is required (CRITICAL, HIGH, MODERATE, LOW)")
    @JsonProperty("final_category")
    private String finalCategory;

    @JsonProperty("override_reason")
    private String overrideReason;

    @JsonProperty("clinical_notes")
    private String clinicalNotes;

    public DoctorOverrideRequest() {}

    public String getAssessmentId() { return assessmentId; }
    public void setAssessmentId(String assessmentId) { this.assessmentId = assessmentId; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getFinalCategory() { return finalCategory; }
    public void setFinalCategory(String finalCategory) { this.finalCategory = finalCategory; }

    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }

    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }
}
