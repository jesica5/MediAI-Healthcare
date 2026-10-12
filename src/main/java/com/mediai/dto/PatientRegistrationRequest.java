package com.mediai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class PatientRegistrationRequest {

    @NotBlank(message = "Patient name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Date of Birth is required")
    @Past(message = "Date of Birth cannot be in the future")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String primaryLanguage = "en";

    public PatientRegistrationRequest() {}

    public PatientRegistrationRequest(String name, LocalDate dateOfBirth, String gender, String primaryLanguage) {
        this.name = name;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.primaryLanguage = (primaryLanguage != null && !primaryLanguage.isBlank()) ? primaryLanguage : "en";
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPrimaryLanguage() { return primaryLanguage; }
    public void setPrimaryLanguage(String primaryLanguage) { this.primaryLanguage = primaryLanguage; }
}
