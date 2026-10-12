package com.mediai;

import com.mediai.dto.DoctorOverrideRequest;
import com.mediai.entity.Patient;
import com.mediai.entity.TriageAssessment;
import com.mediai.entity.TriageReview;
import com.mediai.repository.PatientRepository;
import com.mediai.repository.TriageAssessmentRepository;
import com.mediai.repository.TriageReviewRepository;
import com.mediai.service.DoctorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@DisplayName("Doctor Service & Override Safety Tests")
class DoctorServiceTest {

    private TriageAssessmentRepository assessmentRepository;
    private TriageReviewRepository reviewRepository;
    private PatientRepository patientRepository;
    private com.mediai.service.NotificationService notificationService;
    private DoctorService doctorService;

    @BeforeEach
    void setUp() {
        assessmentRepository = Mockito.mock(TriageAssessmentRepository.class);
        reviewRepository = Mockito.mock(TriageReviewRepository.class);
        patientRepository = Mockito.mock(PatientRepository.class);
        notificationService = new com.mediai.service.NotificationService(null) {
            @Override
            public com.mediai.entity.Notification createNotification(String targetRole, String title, String message, String priority, String refId) {
                return null;
            }
        };
        doctorService = new DoctorService(assessmentRepository, reviewRepository, patientRepository, notificationService);
    }

    @Test
    @DisplayName("Safety rule violation: Downgrading Critical Red Flag requires at least 15 characters rationale")
    void testDowngradeCriticalRedFlagRequires15CharRationale() {
        String assessmentId = "assess-101";
        TriageAssessment assessment = new TriageAssessment();
        assessment.setId(assessmentId);
        assessment.setCalculatedCategory("CRITICAL");
        assessment.setHardRedFlagTriggered(true);
        assessment.setStatus("PENDING_REVIEW");

        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));

        DoctorOverrideRequest request = new DoctorOverrideRequest();
        request.setAssessmentId(assessmentId);
        request.setDoctorId("doc-501");
        request.setFinalCategory("HIGH"); // Downgrade attempt
        request.setOverrideReason("Too short"); // Only 9 characters!

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            doctorService.submitPhysicianOverride(request);
        });

        assertTrue(ex.getMessage().contains("SAFETY RULE ENFORCEMENT"), "Must throw safety rule enforcement exception");
    }

    @Test
    @DisplayName("Valid clinical rationale allows downgrade with audit trail")
    void testValidClinicalRationaleAllowed() {
        String assessmentId = "assess-102";
        TriageAssessment assessment = new TriageAssessment();
        assessment.setId(assessmentId);
        assessment.setCalculatedCategory("CRITICAL");
        assessment.setHardRedFlagTriggered(true);
        assessment.setStatus("PENDING_REVIEW");

        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));
        when(reviewRepository.save(any(TriageReview.class))).thenAnswer(i -> i.getArgument(0));

        DoctorOverrideRequest request = new DoctorOverrideRequest();
        request.setAssessmentId(assessmentId);
        request.setDoctorId("doc-501");
        request.setFinalCategory("HIGH");
        request.setOverrideReason("Repeat ECG showed normal sinus rhythm and troponin negative x 2."); // > 15 characters!

        TriageReview review = doctorService.submitPhysicianOverride(request);

        assertNotNull(review);
        assertTrue(review.getIsOverridden());
        assertEquals("HIGH", review.getFinalCategory());
        assertEquals("OVERRIDDEN", assessment.getStatus());
    }
}
