package com.mediai.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks", indexes = {
    @Index(name = "idx_feedback_rating", columnList = "rating"),
    @Index(name = "idx_feedback_created", columnList = "created_at")
})
public class Feedback {

    @Id
    @Column(length = 64)
    private String id;

    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer rating;

    @Column(length = 1000)
    private String comment;

    @Column(length = 64, nullable = false)
    private String category = "TRIAGE_SYSTEM";

    @Column(name = "submitter_role", length = 32, nullable = false)
    private String submitterRole = "PATIENT";

    @Column(name = "reference_id", length = 64)
    private String referenceId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Feedback() {}

    public Feedback(String id, Integer rating, String comment, String category, String submitterRole, String referenceId) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.category = category;
        this.submitterRole = submitterRole;
        this.referenceId = referenceId;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubmitterRole() { return submitterRole; }
    public void setSubmitterRole(String submitterRole) { this.submitterRole = submitterRole; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
