package com.mediai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "medications", indexes = {
    @Index(name = "idx_med_patient", columnList = "patient_id")
})
public class MedicationRecord {

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

    @Column(name = "medication_name", nullable = false, length = 128)
    private String medicationName;

    @Column(length = 64)
    private String dosage;

    @Column(length = 64)
    private String route;

    @Column(length = 64)
    private String frequency;

    @Column(length = 32)
    private String status = "ACTIVE"; // ACTIVE, RECONCILED, DISCONTINUED

    @Column(name = "last_reconciled_at")
    private LocalDateTime lastReconciledAt = LocalDateTime.now();

    public MedicationRecord() {}

    public MedicationRecord(String id, Patient patient, String medicationName, String dosage, String route, String frequency, String status) {
        this.id = id;
        this.patient = patient;
        this.medicationName = medicationName;
        this.dosage = dosage;
        this.route = route;
        this.frequency = frequency;
        this.status = status;
        this.lastReconciledAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getLastReconciledAt() { return lastReconciledAt; }
    public void setLastReconciledAt(LocalDateTime lastReconciledAt) { this.lastReconciledAt = lastReconciledAt; }
}
