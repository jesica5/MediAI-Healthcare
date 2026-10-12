package com.mediai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vital_signs", indexes = {
    @Index(name = "idx_vitals_patient", columnList = "patient_id")
})
public class VitalSigns {

    @Id
    @Column(length = 64)
    private String id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @com.fasterxml.jackson.annotation.JsonProperty("patient_id")
    public String getPatientId() {
        return patient != null ? patient.getId() : null;
    }

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    @Column(name = "systolic_bp")
    private Integer systolicBp;

    @Column(name = "diastolic_bp")
    private Integer diastolicBp;

    @Column(name = "oxygen_saturation")
    private Double oxygenSaturation;

    @Column(name = "temperature_celsius")
    private Double temperatureCelsius;

    @Column(name = "capillary_blood_glucose")
    private Double capillaryBloodGlucose;

    @Column(name = "recorded_by", length = 64)
    private String recordedBy = "SYSTEM_INTAKE";

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt = LocalDateTime.now();

    public VitalSigns() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Integer getHeartRate() { return heartRate; }
    public void setHeartRate(Integer heartRate) { this.heartRate = heartRate; }

    public Integer getRespiratoryRate() { return respiratoryRate; }
    public void setRespiratoryRate(Integer respiratoryRate) { this.respiratoryRate = respiratoryRate; }

    public Integer getSystolicBp() { return systolicBp; }
    public void setSystolicBp(Integer systolicBp) { this.systolicBp = systolicBp; }

    public Integer getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(Integer diastolicBp) { this.diastolicBp = diastolicBp; }

    public Double getOxygenSaturation() { return oxygenSaturation; }
    public void setOxygenSaturation(Double oxygenSaturation) { this.oxygenSaturation = oxygenSaturation; }

    public Double getTemperatureCelsius() { return temperatureCelsius; }
    public void setTemperatureCelsius(Double temperatureCelsius) { this.temperatureCelsius = temperatureCelsius; }

    public Double getCapillaryBloodGlucose() { return capillaryBloodGlucose; }
    public void setCapillaryBloodGlucose(Double capillaryBloodGlucose) { this.capillaryBloodGlucose = capillaryBloodGlucose; }

    public String getRecordedBy() { return recordedBy; }
    public void setRecordedBy(String recordedBy) { this.recordedBy = recordedBy; }

    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
}
