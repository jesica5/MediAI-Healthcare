package com.mediai.config;

import com.mediai.entity.Patient;
import com.mediai.entity.TriageAssessment;
import com.mediai.entity.VitalSigns;
import com.mediai.repository.PatientRepository;
import com.mediai.repository.TriageAssessmentRepository;
import com.mediai.repository.VitalSignsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final PatientRepository patientRepository;
    private final VitalSignsRepository vitalSignsRepository;
    private final TriageAssessmentRepository assessmentRepository;

    public DataInitializer(
            PatientRepository patientRepository,
            VitalSignsRepository vitalSignsRepository,
            TriageAssessmentRepository assessmentRepository
    ) {
        this.patientRepository = patientRepository;
        this.vitalSignsRepository = vitalSignsRepository;
        this.assessmentRepository = assessmentRepository;
    }

    @Override
    public void run(String... args) {
        if (patientRepository.count() > 0) {
            log.info("Database already contains patient fixtures ({} records). Skipping seed.", patientRepository.count());
            return;
        }

        log.info("Seeding initial MediAI clinical patient fixtures...");

        // Patient 1: Severe ACS / STEMI (CRITICAL P1 - Hard Red Flag Domain 3)
        seedPatient(
            "a1000001-0000-4000-8000-000000000001",
            "MRN-849201",
            "Ramasamy K.",
            LocalDate.of(1958, 4, 12),
            "MALE",
            "en",
            "Crushing retrosternal chest pain radiating to left jaw, diaphoresis, dyspnea",
            135, 26, 82, 52, 88.0, 39.4, 245.0,
            96, "CRITICAL", true,
            "[\"Domain 3 Cardiac: Crushing retrosternal pain radiating to jaw/left arm\", \"Domain 5 BP: Profound shock (SBP 82 mmHg < 85)\"]",
            0.98
        );

        // Patient 2: Sepsis / Septic Shock (CRITICAL P1 - Hard Red Flag Domain 1)
        seedPatient(
            "a1000002-0000-4000-8000-000000000002",
            "MRN-739104",
            "Lakshmi Narayanan",
            LocalDate.of(1952, 11, 3),
            "FEMALE",
            "ta",
            "High fever, rigors, altered mental status, productive purulent cough",
            128, 28, 84, 50, 91.0, 39.8, 180.0,
            94, "CRITICAL", true,
            "[\"Domain 1 Sepsis: qSOFA >= 2 (RR 28 >= 22, SBP 84 <= 100, altered mentation)\"]",
            0.96
        );

        // Patient 3: Acute Severe Hypoxemia / Respiratory Distress (CRITICAL P1 - Domain 2)
        seedPatient(
            "a1000003-0000-4000-8000-000000000003",
            "MRN-610283",
            "Murugan P.",
            LocalDate.of(1965, 2, 18),
            "MALE",
            "en",
            "Acute severe dyspnea, central cyanosis, audible expiratory wheeze, unable to speak full sentences",
            142, 36, 168, 98, 84.0, 37.4, 130.0,
            98, "CRITICAL", true,
            "[\"Domain 2 Respiratory: SpO2 84% < 90% on room air\", \"Domain 2 Respiratory: Respiratory rate 36 bpm > 32\"]",
            0.99
        );

        // Patient 4: Acute Ischemic Stroke / FAST Deficit (CRITICAL P1 - Domain 4)
        seedPatient(
            "a1000004-0000-4000-8000-000000000004",
            "MRN-529184",
            "Dr. K. Annamalai",
            LocalDate.of(1950, 8, 24),
            "MALE",
            "en",
            "Acute right hemiplegia, facial droop, global aphasia, onset 45 minutes prior",
            92, 18, 195, 110, 96.0, 37.1, 142.0,
            95, "CRITICAL", true,
            "[\"Domain 4 Neurological: Acute focal deficit / FAST positive facial droop and right arm hemiplegia\"]",
            0.97
        );

        // Patient 5: Hypertensive Urgency / Severe Headache (HIGH P2)
        seedPatient(
            "a1000005-0000-4000-8000-000000000005",
            "MRN-419205",
            "Priya Ramanathan",
            LocalDate.of(1985, 5, 15),
            "FEMALE",
            "en",
            "Severe throbbing occipital headache, blurred vision, nausea",
            98, 20, 192, 114, 98.0, 36.9, 115.0,
            76, "HIGH", false,
            "[]",
            0.92
        );

        // Patient 6: Diabetic Ketoacidosis (HIGH P2)
        seedPatient(
            "a1000006-0000-4000-8000-000000000006",
            "MRN-318492",
            "Karthik V.",
            LocalDate.of(1996, 9, 29),
            "MALE",
            "ta",
            "Kussmaul deep respirations, abdominal pain, polydipsia, fruity breath odor",
            122, 28, 102, 68, 97.0, 37.2, 485.0,
            82, "HIGH", false,
            "[]",
            0.94
        );

        // Patient 7: Acute Appendicitis Suspicion (MODERATE P3)
        seedPatient(
            "a1000007-0000-4000-8000-000000000007",
            "MRN-209381",
            "Deepa S.",
            LocalDate.of(2001, 12, 14),
            "FEMALE",
            "en",
            "Right lower quadrant sharp pain with localized tenderness, low-grade fever, nausea",
            94, 18, 118, 76, 99.0, 38.1, 98.0,
            54, "MODERATE", false,
            "[]",
            0.90
        );

        // Patient 8: Uncomplicated Gastroenteritis (LOW P4)
        seedPatient(
            "a1000008-0000-4000-8000-000000000008",
            "MRN-102948",
            "Suresh Kumar",
            LocalDate.of(1992, 7, 8),
            "MALE",
            "en",
            "Watery diarrhea x 2 days, mild abdominal cramping, no hematochezia, tolerating oral fluids",
            78, 16, 120, 80, 99.0, 36.8, 92.0,
            22, "LOW", false,
            "[]",
            0.95
        );

        log.info("MediAI clinical patient fixtures seeded successfully.");
    }

    private void seedPatient(
            String patientId,
            String mrnHash,
            String name,
            LocalDate dob,
            String gender,
            String lang,
            String chiefComplaint,
            int hr, int rr, int sbp, int dbp, double spo2, double temp, double cbg,
            int riskScore, String category, boolean redFlag, String redFlagDetails, double confidence
    ) {
        Patient p = new Patient(patientId, mrnHash, "ENC_" + mrnHash, name, dob, gender, lang);
        patientRepository.save(p);

        VitalSigns v = new VitalSigns();
        v.setId(UUID.randomUUID().toString());
        v.setPatient(p);
        v.setHeartRate(hr);
        v.setRespiratoryRate(rr);
        v.setSystolicBp(sbp);
        v.setDiastolicBp(dbp);
        v.setOxygenSaturation(spo2);
        v.setTemperatureCelsius(temp);
        v.setCapillaryBloodGlucose(cbg);
        v.setRecordedBy("nurse_triage_intake");
        v.setRecordedAt(LocalDateTime.now().minusMinutes(25));
        vitalSignsRepository.save(v);

        TriageAssessment a = new TriageAssessment();
        a.setId(UUID.randomUUID().toString());
        a.setPatient(p);
        a.setVitals(v);
        a.setChiefComplaint(chiefComplaint);
        a.setSymptomVector("{\"chiefComplaint\":\"" + chiefComplaint + "\"}");
        a.setCalculatedRiskScore(riskScore);
        a.setCalculatedCategory(category);
        a.setHardRedFlagTriggered(redFlag);
        a.setRedFlagDetails(redFlagDetails);
        a.setConfidenceScore(confidence);
        a.setConfidenceLevel("HIGH");
        a.setExplainabilityPayload("{\"model_version\":\"v2.1\",\"latency_ms\":38}");
        a.setStatus("PENDING_REVIEW");
        a.setCreatedAt(LocalDateTime.now().minusMinutes(24));
        assessmentRepository.save(a);
    }
}
