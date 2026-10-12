package com.mediai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.Map;

public class TriageAssessRequest {

    @JsonProperty("patient_id")
    private String patientId;

    @NotBlank(message = "Chief complaint is required")
    @JsonProperty("chief_complaint")
    private String chiefComplaint;

    private DemographicsDto demographics;

    private VitalsDto vitals;

    @JsonProperty("symptom_vector")
    private Map<String, Object> symptomVector;

    @JsonProperty("medical_history")
    private Map<String, Object> medicalHistory;

    private String language = "en";

    public TriageAssessRequest() {}

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }

    public DemographicsDto getDemographics() { return demographics; }
    public void setDemographics(DemographicsDto demographics) { this.demographics = demographics; }

    public VitalsDto getVitals() { return vitals; }
    public void setVitals(VitalsDto vitals) { this.vitals = vitals; }

    public Map<String, Object> getSymptomVector() { return symptomVector; }
    public void setSymptomVector(Map<String, Object> symptomVector) { this.symptomVector = symptomVector; }

    public Map<String, Object> getMedicalHistory() { return medicalHistory; }
    public void setMedicalHistory(Map<String, Object> medicalHistory) { this.medicalHistory = medicalHistory; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public static class DemographicsDto {
        @JsonProperty("date_of_birth")
        private LocalDate dateOfBirth;

        private Integer age;
        private String gender;

        @JsonProperty("primary_language")
        private String primaryLanguage;

        public LocalDate getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

        public Integer getAge() { return age; }
        public void setAge(Integer age) { this.age = age; }

        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }

        public String getPrimaryLanguage() { return primaryLanguage; }
        public void setPrimaryLanguage(String primaryLanguage) { this.primaryLanguage = primaryLanguage; }
    }
}
