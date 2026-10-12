package com.mediai.dto;

import java.util.List;
import java.util.Map;

public class AiRiskPredictionRequest {

    private String patientId = "pt_demo_1002";
    private List<String> symptoms;
    private String chiefComplaint;
    private Map<String, Object> vitals;
    private Map<String, Object> medicalHistory;
    private String primaryLanguage = "en";
    private Integer age;
    private String gender;

    public AiRiskPredictionRequest() {}

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public List<String> getSymptoms() { return symptoms; }
    public void setSymptoms(List<String> symptoms) { this.symptoms = symptoms; }

    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }

    public Map<String, Object> getVitals() { return vitals; }
    public void setVitals(Map<String, Object> vitals) { this.vitals = vitals; }

    public Map<String, Object> getMedicalHistory() { return medicalHistory; }
    public void setMedicalHistory(Map<String, Object> medicalHistory) { this.medicalHistory = medicalHistory; }

    public String getPrimaryLanguage() { return primaryLanguage; }
    public void setPrimaryLanguage(String primaryLanguage) { this.primaryLanguage = primaryLanguage; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
}
