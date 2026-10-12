package com.mediai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notif_role", columnList = "recipient_role"),
    @Index(name = "idx_notif_read", columnList = "is_read")
})
public class Notification {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "recipient_role", length = 32, nullable = false)
    private String recipientRole = "ALL"; // DOCTOR, NURSE, ALL, ADMIN

    @Column(nullable = false, length = 128)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(length = 16, nullable = false)
    private String priority = "INFO"; // CRITICAL, HIGH, INFO

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "reference_id", length = 64)
    private String referenceId; // e.g. assessmentId, patientId

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}

    public Notification(String id, String recipientRole, String title, String message, String priority, String referenceId) {
        this.id = id;
        this.recipientRole = recipientRole;
        this.title = title;
        this.message = message;
        this.priority = priority;
        this.referenceId = referenceId;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientRole() { return recipientRole; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
