package com.mediai.controller;

import com.mediai.dto.ApiResponse;
import com.mediai.dto.DoctorDashboardMetricsDto;
import com.mediai.dto.DoctorOverrideRequest;
import com.mediai.entity.MedicationRecord;
import com.mediai.entity.TriageAssessment;
import com.mediai.entity.TriageReview;
import com.mediai.repository.MedicationRepository;
import com.mediai.service.AuditService;
import com.mediai.service.DoctorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/doctor")
public class DoctorController {

    private final DoctorService doctorService;
    private final MedicationRepository medicationRepository;
    private final AuditService auditService;

    public DoctorController(
            DoctorService doctorService,
            MedicationRepository medicationRepository,
            AuditService auditService
    ) {
        this.doctorService = doctorService;
        this.medicationRepository = medicationRepository;
        this.auditService = auditService;
    }

    @GetMapping("/queue")
    public ResponseEntity<ApiResponse<List<TriageAssessment>>> getPatientQueue(
            @RequestParam(required = false, defaultValue = "PENDING_REVIEW") String status,
            @RequestParam(required = false, defaultValue = "ALL") String category,
            @RequestParam(required = false) String search
    ) {
        List<TriageAssessment> queue = doctorService.getPatientQueue(status, category, search);
        return ResponseEntity.ok(ApiResponse.success(queue, Map.of("total", queue.size(), "queueLabel", "Patient Queue")));
    }

    @GetMapping("/patient/{id}")
    public ResponseEntity<ApiResponse<TriageAssessment>> getPatientAssessmentById(@PathVariable String id) {
        TriageAssessment assessment = doctorService.getAssessmentById(id)
            .orElseThrow(() -> new NoSuchElementException("Clinical assessment record not found: " + id));
        return ResponseEntity.ok(ApiResponse.success(assessment));
    }

    @PostMapping("/override")
    public ResponseEntity<ApiResponse<TriageReview>> submitPhysicianOverride(
            @Valid @RequestBody DoctorOverrideRequest request,
            HttpServletRequest httpServletRequest
    ) {
        TriageReview review = doctorService.submitPhysicianOverride(request);

        auditService.logEvent(
            "PHYSICIAN_OVERRIDE_RECORDED",
            request.getDoctorId(),
            review.getAssessment().getPatient() != null ? review.getAssessment().getPatient().getId() : null,
            httpServletRequest.getRemoteAddr(),
            httpServletRequest.getHeader("User-Agent"),
            "{\"assessmentId\":\"" + request.getAssessmentId() + "\",\"isOverridden\":" + review.getIsOverridden() + "}"
        );

        return ResponseEntity.ok(ApiResponse.success(review));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<DoctorDashboardMetricsDto>> getDashboardMetrics() {
        DoctorDashboardMetricsDto metrics = doctorService.getDashboardMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalyticsData() {
        Map<String, Object> analytics = doctorService.getAnalyticsData();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/medications")
    public ResponseEntity<ApiResponse<List<MedicationRecord>>> getMedications(
            @RequestParam(required = false) String patientId
    ) {
        List<MedicationRecord> records = (patientId != null && !patientId.isBlank())
            ? medicationRepository.findByPatientId(patientId)
            : medicationRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @DeleteMapping("/assessment/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteAssessment(
            @PathVariable String id,
            HttpServletRequest httpServletRequest
    ) {
        doctorService.deleteAssessment(id);

        auditService.logEvent(
            "ASSESSMENT_DELETED",
            null,
            null,
            httpServletRequest.getRemoteAddr(),
            httpServletRequest.getHeader("User-Agent"),
            "{\"deletedAssessmentId\":\"" + id + "\"}"
        );

        return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Assessment record successfully deleted", "id", id)));
    }
}
