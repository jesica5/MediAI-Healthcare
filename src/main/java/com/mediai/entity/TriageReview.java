package com.mediai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "triage_reviews", indexes = {
    @Index(name = "idx_review_assessment", columnList = "assessment_id")
})
public class TriageReview {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assessment_id", nullable = false)
    private TriageAssessment assessment;

    @Column(name = "doctor_id", nullable = false, length = 64)
    private String doctorId;

    @Column(name = "original_category", nullable = false, length = 16)
    private String originalCategory;

    @Column(name = "final_category", nullable = false, length = 16)
    private String finalCategory;

    @Column(name = "is_overridden", nullable = false)
    private Boolean isOverridden = false;

    @Column(name = "override_reason", columnDefinition = "TEXT")
    private String overrideReason;

    @Column(name = "clinical_notes", columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(name = "reviewed_at", nullable = false)
    private LocalDateTime reviewedAt = LocalDateTime.now();

    public TriageReview() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public TriageAssessment getAssessment() { return assessment; }
    public void setAssessment(TriageAssessment assessment) { this.assessment = assessment; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getOriginalCategory() { return originalCategory; }
    public void setOriginalCategory(String originalCategory) { this.originalCategory = originalCategory; }

    public String getFinalCategory() { return finalCategory; }
    public void setFinalCategory(String finalCategory) { this.finalCategory = finalCategory; }

    public Boolean getIsOverridden() { return isOverridden; }
    public void setIsOverridden(Boolean isOverridden) { this.isOverridden = isOverridden; }

    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }

    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
