package com.mediai.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

@Entity
@Table(name = "patients", indexes = {
    @Index(name = "idx_patient_mrn", columnList = "mrn_hash")
})
public class Patient {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "mrn_hash", nullable = false, unique = true, length = 64)
    private String mrnHash;

    @Column(name = "encrypted_name", nullable = false, length = 256)
    private String encryptedName;

    @Column(name = "display_name", length = 128)
    private String displayName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false, length = 16)
    private String gender;

    @Column(name = "primary_language", length = 8)
    private String primaryLanguage = "en";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Patient() {}

    public Patient(String id, String mrnHash, String encryptedName, String displayName, LocalDate dateOfBirth, String gender, String primaryLanguage) {
        this.id = id;
        this.mrnHash = mrnHash;
        this.encryptedName = encryptedName;
        this.displayName = displayName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.primaryLanguage = (primaryLanguage != null && !primaryLanguage.isBlank()) ? primaryLanguage : "en";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Automatic age calculation based on completed years using month and day
     */
    public int calculateAge() {
        return calculateAgeAt(LocalDate.now());
    }

    public int calculateAgeAt(LocalDate referenceDate) {
        if (dateOfBirth == null || referenceDate == null) {
            return 0;
        }
        return Period.between(dateOfBirth, referenceDate).getYears();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMrnHash() { return mrnHash; }
    public void setMrnHash(String mrnHash) { this.mrnHash = mrnHash; }

    public String getEncryptedName() { return encryptedName; }
    public void setEncryptedName(String encryptedName) { this.encryptedName = encryptedName; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPrimaryLanguage() { return primaryLanguage; }
    public void setPrimaryLanguage(String primaryLanguage) { this.primaryLanguage = primaryLanguage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
