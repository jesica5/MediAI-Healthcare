package com.mediai.service;

import com.mediai.entity.Notification;
import com.mediai.repository.NotificationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @PostConstruct
    public void seedInitialNotifications() {
        if (notificationRepository.count() == 0) {
            createNotification(
                "ALL",
                "Hospital Triage Console Online",
                "MediAI Emergency Decision-Support workstation initialized and active for clinical operations.",
                "INFO",
                null
            );
            createNotification(
                "DOCTOR",
                "Clinical Decision Protocol v2.1 Active",
                "Multi-parameter vital signs safety baseline and TreeSHAP explainability algorithms calibrated.",
                "INFO",
                null
            );
            createNotification(
                "NURSE",
                "Patient Intake Protocol Verification",
                "Ensure SpO2, blood pressure, and core temperature are entered during health assessments.",
                "INFO",
                null
            );
        }
    }

    @Transactional
    public Notification createNotification(String role, String title, String message, String priority, String referenceId) {
        Notification notification = new Notification(
            UUID.randomUUID().toString(),
            (role != null && !role.isBlank()) ? role : "ALL",
            title,
            message,
            (priority != null && !priority.isBlank()) ? priority : "INFO",
            referenceId
        );
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForRole(String role) {
        if (role == null || role.isBlank() || "ALL".equalsIgnoreCase(role)) {
            return notificationRepository.findAllByOrderByCreatedAtDesc();
        }
        return notificationRepository.findForRole(role);
    }

    public long getUnreadCount(String role) {
        if (role == null || role.isBlank() || "ALL".equalsIgnoreCase(role)) {
            return notificationRepository.countByIsReadFalse();
        }
        return notificationRepository.countUnreadForRole(role);
    }

    @Transactional
    public Notification markAsRead(String id) {
        Notification n = notificationRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Notification not found: " + id));
        n.setIsRead(true);
        return notificationRepository.save(n);
    }

    @Transactional
    public int markAllAsRead() {
        return notificationRepository.markAllAsRead();
    }
}
