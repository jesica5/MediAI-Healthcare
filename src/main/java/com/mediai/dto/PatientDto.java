package com.mediai.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PatientDto {
    private String id;
    private String mrnHash;
    private String displayName;
    private LocalDate dateOfBirth;
    private Integer age;
    private String gender;
    private String primaryLanguage;
    private LocalDateTime createdAt;
    private String sessionToken;

    public PatientDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMrnHash() { return mrnHash; }
    public void setMrnHash(String mrnHash) { this.mrnHash = mrnHash; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPrimaryLanguage() { return primaryLanguage; }
    public void setPrimaryLanguage(String primaryLanguage) { this.primaryLanguage = primaryLanguage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }
}
