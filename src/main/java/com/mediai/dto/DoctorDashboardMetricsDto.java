package com.mediai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DoctorDashboardMetricsDto {

    @JsonProperty("pending_reviews")
    private long pendingReviews;

    @JsonProperty("critical_patients")
    private long criticalPatients;

    @JsonProperty("high_priority_patients")
    private long highPriorityPatients;

    @JsonProperty("completed_today")
    private long completedToday;

    @JsonProperty("avg_review_velocity")
    private String avgReviewVelocity = "3.4 mins";

    @JsonProperty("overridden_count")
    private long overriddenCount;

    public DoctorDashboardMetricsDto() {}

    public DoctorDashboardMetricsDto(long pendingReviews, long criticalPatients, long highPriorityPatients, long completedToday, String avgReviewVelocity, long overriddenCount) {
        this.pendingReviews = pendingReviews;
        this.criticalPatients = criticalPatients;
        this.highPriorityPatients = highPriorityPatients;
        this.completedToday = completedToday;
        this.avgReviewVelocity = avgReviewVelocity;
        this.overriddenCount = overriddenCount;
    }

    public long getPendingReviews() { return pendingReviews; }
    public void setPendingReviews(long pendingReviews) { this.pendingReviews = pendingReviews; }

    public long getCriticalPatients() { return criticalPatients; }
    public void setCriticalPatients(long criticalPatients) { this.criticalPatients = criticalPatients; }

    public long getHighPriorityPatients() { return highPriorityPatients; }
    public void setHighPriorityPatients(long highPriorityPatients) { this.highPriorityPatients = highPriorityPatients; }

    public long getCompletedToday() { return completedToday; }
    public void setCompletedToday(long completedToday) { this.completedToday = completedToday; }

    public String getAvgReviewVelocity() { return avgReviewVelocity; }
    public void setAvgReviewVelocity(String avgReviewVelocity) { this.avgReviewVelocity = avgReviewVelocity; }

    public long getOverriddenCount() { return overriddenCount; }
    public void setOverriddenCount(long overriddenCount) { this.overriddenCount = overriddenCount; }
}
