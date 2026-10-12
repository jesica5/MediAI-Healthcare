package com.mediai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class FeedbackRequest {

    @NotNull(message = "Rating is required (1 to 5)")
    @Min(value = 1, message = "Rating must be at least 1 star")
    @Max(value = 5, message = "Rating cannot exceed 5 stars")
    private Integer rating;

    private String comment;

    private String category = "TRIAGE_SYSTEM";

    @JsonProperty("submitter_role")
    private String submitterRole = "PATIENT";

    @JsonProperty("reference_id")
    private String referenceId;

    public FeedbackRequest() {}

    public FeedbackRequest(Integer rating, String comment, String category, String submitterRole, String referenceId) {
        this.rating = rating;
        this.comment = comment;
        this.category = category;
        this.submitterRole = submitterRole;
        this.referenceId = referenceId;
    }

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
}
