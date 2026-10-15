-- ==============================================================================
-- MediAI: Complete MySQL Workbench Database Setup & Schema
-- Database: mediai
-- User: jesicajasmine562005@gmail.com / Jesica@5
-- ==============================================================================

-- 1. DROP EXISTING DATABASE AND RECREATE FRESH
DROP DATABASE IF EXISTS mediai;
CREATE DATABASE mediai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mediai;

-- 2. CREATE MYSQL USER WITH FULL PRIVILEGES FOR WORKBENCH ACCESS
CREATE USER IF NOT EXISTS 'jesicajasmine562005@gmail.com'@'localhost' IDENTIFIED BY 'Jesica@5';
GRANT ALL PRIVILEGES ON mediai.* TO 'jesicajasmine562005@gmail.com'@'localhost';

CREATE USER IF NOT EXISTS 'jesicajasmine562005@gmail.com'@'%' IDENTIFIED BY 'Jesica@5';
GRANT ALL PRIVILEGES ON mediai.* TO 'jesicajasmine562005@gmail.com'@'%';

FLUSH PRIVILEGES;

-- ==============================================================================
-- 3. CREATE ALL APPLICATION TABLES
-- ==============================================================================

-- Table 1: users (Staff Authentication & Role-Based Access Control)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: patients (Demographic Profile & Encrypted PHI)
CREATE TABLE patients (
    id VARCHAR(64) PRIMARY KEY,
    mrn_hash VARCHAR(64) NOT NULL UNIQUE,
    encrypted_name VARCHAR(256) NOT NULL,
    display_name VARCHAR(128),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(16) NOT NULL,
    primary_language VARCHAR(8) DEFAULT 'en',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_mrn (mrn_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: vital_signs (Patient Vitals Snapshot)
CREATE TABLE vital_signs (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL,
    heart_rate INT,
    respiratory_rate INT,
    systolic_bp INT,
    diastolic_bp INT,
    oxygen_saturation DECIMAL(4,1),
    temperature_celsius DECIMAL(4,2),
    capillary_blood_glucose DECIMAL(5,1),
    recorded_by VARCHAR(64) DEFAULT 'SYSTEM_INTAKE',
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_vitals_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 4: triage_assessments (Risk Engine Output & Emergency Triage Queue)
CREATE TABLE triage_assessments (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL,
    vital_id VARCHAR(64),
    chief_complaint TEXT NOT NULL,
    symptom_vector TEXT NOT NULL,
    calculated_risk_score INT NOT NULL,
    calculated_category VARCHAR(16) NOT NULL,
    hard_red_flag_triggered BOOLEAN NOT NULL DEFAULT FALSE,
    red_flag_details TEXT,
    confidence_score DECIMAL(3,2) NOT NULL,
    confidence_level VARCHAR(16) DEFAULT 'HIGH',
    explainability_payload TEXT,
    ai_explanation_payload TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_REVIEW',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (vital_id) REFERENCES vital_signs(id) ON DELETE SET NULL,
    INDEX idx_assessment_patient (patient_id),
    INDEX idx_assessment_status (status),
    INDEX idx_assessment_acuity (calculated_category),
    INDEX idx_assessment_red_flag (hard_red_flag_triggered)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 5: triage_reviews (Physician Review, Override & Clinical Notes)
CREATE TABLE triage_reviews (
    id VARCHAR(64) PRIMARY KEY,
    assessment_id VARCHAR(64) NOT NULL,
    doctor_id VARCHAR(64) NOT NULL,
    original_category VARCHAR(16) NOT NULL,
    final_category VARCHAR(16) NOT NULL,
    is_overridden BOOLEAN NOT NULL DEFAULT FALSE,
    override_reason TEXT,
    clinical_notes TEXT,
    reviewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES triage_assessments(id) ON DELETE RESTRICT,
    INDEX idx_review_assessment (assessment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 6: medications (Medication Reconciliation Ledger)
CREATE TABLE medications (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL,
    medication_name VARCHAR(128) NOT NULL,
    dosage VARCHAR(64),
    route VARCHAR(64),
    frequency VARCHAR(64),
    status VARCHAR(32) DEFAULT 'ACTIVE',
    last_reconciled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_med_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 7: triage_audit_log (Immutable Append-Only Audit Trail)
CREATE TABLE triage_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    user_id VARCHAR(64),
    patient_id VARCHAR(64),
    ip_address VARCHAR(64) DEFAULT '127.0.0.1',
    user_agent TEXT,
    payload TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_event (event_type),
    INDEX idx_audit_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 8: chat_messages (AI Multilingual Medical Assistant Conversations)
CREATE TABLE chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL,
    sender VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    is_emergency BOOLEAN DEFAULT FALSE,
    suggested_actions VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat_conversation (conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 9: feedbacks (Patient & Clinical Feedback)
CREATE TABLE feedbacks (
    id VARCHAR(64) PRIMARY KEY,
    rating INT NOT NULL,
    comment VARCHAR(1000),
    category VARCHAR(64) NOT NULL DEFAULT 'TRIAGE_SYSTEM',
    submitter_role VARCHAR(32) NOT NULL DEFAULT 'PATIENT',
    reference_id VARCHAR(64),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_feedback_rating (rating),
    INDEX idx_feedback_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 10: notifications (Real-Time Clinical Staff Alert Broadcasts)
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    recipient_role VARCHAR(32) NOT NULL DEFAULT 'ALL',
    title VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(16) NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    reference_id VARCHAR(64),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_role (recipient_role),
    INDEX idx_notif_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 11: user_otps (Stateless Cryptographic 2FA Verification)
CREATE TABLE user_otps (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(128) NOT NULL,
    temp_token VARCHAR(64) NOT NULL UNIQUE,
    otp_hash VARCHAR(128) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_temp_token (temp_token),
    INDEX idx_otp_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 4. INSERT CLINICAL STAFF SEED USERS & SAMPLE DATA
-- ==============================================================================

-- Staff Users (BCrypt Hashes)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('jesicajasmine562005@gmail.com', '$2a$10$eE61H5hXN98bI8nB7K/Y9OzMvWvDqGz21VpXpC6Fw7Bf9X9k8sFym', 'DR. JESICA JASMINE', 'Doctor'),
('doctor@mediai.org', '$2a$10$7rXW6F/12h9V3qI5jD7W/.yUv6Z6k9c5X1d6c8b9a0z2y4x6w8v0u', 'DR. BHUVANA S.', 'Doctor'),
('nurse@mediai.org', '$2a$10$1r2X3Y4Z5A6B7C8D9E0F1.uV6w7X8y9Z0a1B2C3d4E5f6G7h8I9j0', 'PRIYA R. (RN)', 'Triage Nurse'),
('admin@mediai.org', '$2a$10$9a8B7c6D5e4F3g2H1i0J1.zY9x8W7v6U5t4S3r2Q1p0O9n8M7l6K5', 'SYSTEM ADMINISTRATOR', 'System Administrator');

-- Sample Patients
INSERT INTO patients (id, mrn_hash, encrypted_name, display_name, date_of_birth, gender, primary_language) VALUES
('p-101', '8f4b23c91d4e2f8a1b3c5e7d9a0f2b4c6e8a0b2d4e6f8a0b2c4e6f8a0b2c4e6f', 'U2FsdGVkX1+vYZ4abc123encData==', 'J. D****', '1982-05-14', 'Male', 'en'),
('p-102', '3a9c7b1e5f8d2a4c6e0b2d4f6a8c0e2b4d6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e', 'U2FsdGVkX1+xZA8def456encData==', 'R. K****', '1959-11-20', 'Female', 'en'),
('p-103', '7e1d5a9b3c5f8a0b2d4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a', 'U2FsdGVkX1+wBC1ghi789encData==', 'S. M****', '1995-02-08', 'Female', 'ta'),
('p-104', '9c2e4f6a8b0d2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c', 'U2FsdGVkX1+mNO9jkl012encData==', 'A. P****', '1948-08-30', 'Male', 'en');

-- Sample Vitals
INSERT INTO vital_signs (id, patient_id, heart_rate, respiratory_rate, systolic_bp, diastolic_bp, oxygen_saturation, temperature_celsius, capillary_blood_glucose, recorded_by) VALUES
('vit-101', 'p-101', 118, 28, 185, 110, 89.0, 38.6, 142.0, 'TRIAGE_NURSE_PRIYA'),
('vit-102', 'p-102', 88, 18, 138, 86, 96.5, 37.1, 110.0, 'SYSTEM_INTAKE'),
('vit-103', 'p-103', 76, 16, 118, 76, 99.0, 36.8, 95.0, 'SYSTEM_INTAKE'),
('vit-104', 'p-104', 132, 34, 75, 45, 84.0, 39.4, 210.0, 'TRIAGE_NURSE_PRIYA');

-- Sample Triage Assessments
INSERT INTO triage_assessments (id, patient_id, vital_id, chief_complaint, symptom_vector, calculated_risk_score, calculated_category, hard_red_flag_triggered, red_flag_details, confidence_score, confidence_level, explainability_payload, ai_explanation_payload, status) VALUES
('ast-101', 'p-101', 'vit-101', 'Crushing substernal chest pain radiating to left shoulder and jaw with diaphoresis', 'Chest Pain, Diaphoresis, Shortness of Breath', 92, 'CRITICAL', TRUE, 'Acute Coronary Syndrome: Severe crushing chest pain with profound diaphoresis and hypoxemia (SpO2 89%).', 0.96, 'HIGH', '{"top_features": ["SpO2 89%", "Systolic BP 185", "Heart Rate 118", "Crushing Chest Pain"]}', 'Patient presents classic ischemic cardiac symptoms requiring immediate ECG and catheterization lab standby.', 'PENDING_REVIEW'),
('ast-102', 'p-102', 'vit-102', 'Acute onset unilateral abdominal pain in right lower quadrant with low-grade fever', 'Abdominal Pain, Low Fever, Nausea', 68, 'HIGH', FALSE, NULL, 0.89, 'HIGH', '{"top_features": ["RLQ Pain", "Nausea", "Fever"]}', 'Suspected acute appendicitis. Urgent surgical consultation and abdominal ultrasound indicated.', 'PENDING_REVIEW'),
('ast-103', 'p-103', 'vit-103', 'Mild persistent tension headache and nasal congestion for 3 days', 'Headache, Congestion', 24, 'LOW', FALSE, NULL, 0.94, 'HIGH', '{"top_features": ["Stable Vitals", "Mild Headache"]}', 'Non-emergent viral upper respiratory infection symptoms. Outpatient symptomatic treatment appropriate.', 'PENDING_REVIEW'),
('ast-104', 'p-104', 'vit-104', 'Profound lethargy, altered mental status, severe hypotension and high fever', 'Altered Mental Status, High Fever, Severe Hypotension', 98, 'CRITICAL', TRUE, 'Septic Shock: Refractory hypotension (BP 75/45), tachypnea (RR 34), and tachycardia (HR 132) with altered mentation.', 0.99, 'HIGH', '{"top_features": ["Systolic BP 75", "Heart Rate 132", "Respiratory Rate 34", "SpO2 84%"]}', 'Immediate resuscitation protocol required: IV crystalloid bolus, blood cultures, broad-spectrum antibiotics within 1 hour.', 'PENDING_REVIEW');

-- Sample Medications
INSERT INTO medications (id, patient_id, medication_name, dosage, route, frequency, status) VALUES
('med-101', 'p-101', 'Aspirin', '81 mg', 'Oral', 'Once daily', 'ACTIVE'),
('med-102', 'p-101', 'Atorvastatin', '40 mg', 'Oral', 'Once nightly', 'ACTIVE'),
('med-103', 'p-102', 'Metformin', '500 mg', 'Oral', 'Twice daily with meals', 'ACTIVE'),
('med-104', 'p-104', 'Lisinopril', '10 mg', 'Oral', 'Once daily', 'ACTIVE');

-- Sample Notifications
INSERT INTO notifications (id, recipient_role, title, message, priority, reference_id) VALUES
('notif-1', 'DOCTOR', 'Critical Patient Arrival', 'Patient AST-101 assigned CRITICAL acuity: Acute Coronary Syndrome.', 'CRITICAL', 'ast-101'),
('notif-2', 'DOCTOR', 'Septic Shock Protocol Triggered', 'Patient AST-104 in Red Flag Septic Shock status (BP 75/45).', 'CRITICAL', 'ast-104'),
('notif-3', 'ALL', 'Shift Handover Complete', 'Emergency department triage queue synchronized successfully.', 'INFO', NULL);

-- Sample Feedbacks
INSERT INTO feedbacks (id, rating, comment, category, submitter_role, reference_id) VALUES
('fb-1', 5, 'Rapid assessment helped us prioritize ECG immediately.', 'CLINICAL_TRIAGE', 'DOCTOR', 'ast-101'),
('fb-2', 5, 'Very clear risk explanations and smooth intake flow.', 'PATIENT_EXPERIENCE', 'PATIENT', 'p-103');

-- Sample Audit Log
INSERT INTO triage_audit_log (event_type, user_id, patient_id, ip_address, payload) VALUES
('DATABASE_INITIALIZED', 'SYSTEM', NULL, '127.0.0.1', '{"status": "SUCCESS", "source": "MySQL Workbench Migration"}'),
('PATIENT_INTAKE_RECORDED', 'PRIYA_RN', 'p-101', '127.0.0.1', '{"assessment_id": "ast-101", "acuity": "CRITICAL"}');
