package com.mediai.controller;

import com.mediai.dto.ApiResponse;
import com.mediai.dto.PatientDto;
import com.mediai.dto.PatientRegistrationRequest;
import com.mediai.entity.Patient;
import com.mediai.service.AuditService;
import com.mediai.service.PatientService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {

    private final PatientService patientService;
    private final AuditService auditService;

    public PatientController(PatientService patientService, AuditService auditService) {
        this.patientService = patientService;
        this.auditService = auditService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PatientDto>> registerPatient(
            @Valid @RequestBody PatientRegistrationRequest request,
            HttpServletRequest httpServletRequest
    ) {
        PatientDto created = patientService.registerPatient(request);

        auditService.logEvent(
            "PATIENT_INTAKE_CREATED",
            null,
            created.getId(),
            httpServletRequest.getRemoteAddr(),
            httpServletRequest.getHeader("User-Agent"),
            "{\"mrnHash\":\"" + created.getMrnHash() + "\",\"gender\":\"" + created.getGender() + "\"}"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PatientDto>> getCurrentPatientProfile() {
        // Returns default active demo patient profile with dynamic age calculation
        LocalDate defaultDob = LocalDate.of(1985, 5, 15);
        int age = patientService.calculateCurrentAge(defaultDob);

        PatientDto dto = new PatientDto();
        dto.setId("pt_demo_1002");
        dto.setMrnHash("MRN-749201");
        dto.setDisplayName("Priya Ramanathan");
        dto.setDateOfBirth(defaultDob);
        dto.setAge(age);
        dto.setGender("FEMALE");
        dto.setPrimaryLanguage("en");

        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDto>> getPatientById(@PathVariable String id) {
        Patient patient = patientService.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Patient not found: " + id));

        PatientDto dto = new PatientDto();
        dto.setId(patient.getId());
        dto.setMrnHash(patient.getMrnHash());
        dto.setDisplayName(patient.getDisplayName());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setAge(patientService.calculateCurrentAge(patient.getDateOfBirth()));
        dto.setGender(patient.getGender());
        dto.setPrimaryLanguage(patient.getPrimaryLanguage());
        dto.setCreatedAt(patient.getCreatedAt());

        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientDto>>> listPatients() {
        List<PatientDto> dtoList = patientService.findAll().stream().map(patient -> {
            PatientDto dto = new PatientDto();
            dto.setId(patient.getId());
            dto.setMrnHash(patient.getMrnHash());
            dto.setDisplayName(patient.getDisplayName());
            dto.setDateOfBirth(patient.getDateOfBirth());
            dto.setAge(patientService.calculateCurrentAge(patient.getDateOfBirth()));
            dto.setGender(patient.getGender());
            dto.setPrimaryLanguage(patient.getPrimaryLanguage());
            dto.setCreatedAt(patient.getCreatedAt());
            return dto;
        }).toList();

        return ResponseEntity.ok(ApiResponse.success(dtoList));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDto>> updatePatient(
            @PathVariable String id,
            @RequestBody PatientRegistrationRequest request,
            HttpServletRequest httpServletRequest
    ) {
        PatientDto updated = patientService.updatePatient(id, request);

        auditService.logEvent(
            "PATIENT_UPDATED",
            null,
            id,
            httpServletRequest.getRemoteAddr(),
            httpServletRequest.getHeader("User-Agent"),
            "{\"mrnHash\":\"" + updated.getMrnHash() + "\"}"
        );

        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deletePatient(
            @PathVariable String id,
            HttpServletRequest httpServletRequest
    ) {
        patientService.deleteById(id);

        auditService.logEvent(
            "PATIENT_DELETED",
            null,
            id,
            httpServletRequest.getRemoteAddr(),
            httpServletRequest.getHeader("User-Agent"),
            "{\"deletedId\":\"" + id + "\"}"
        );

        return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Patient record successfully deleted", "id", id)));
    }
}
