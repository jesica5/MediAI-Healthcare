package com.mediai.service;

import com.mediai.entity.AuditLog;
import com.mediai.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logEvent(String eventType, String userId, String patientId, String ipAddress, String userAgent, String payload) {
        AuditLog log = new AuditLog(
            eventType,
            userId,
            patientId,
            ipAddress != null ? ipAddress : "127.0.0.1",
            userAgent != null ? userAgent : "Browser",
            payload
        );
        auditLogRepository.save(log);
    }
}
