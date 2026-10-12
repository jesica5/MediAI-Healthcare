-- ==============================================================================
-- MediAI: Smart Patient Triage & Emergency Risk Prediction System
-- Primary Relational Database Schema: MySQL 8.0+
-- Technology Stack: Spring Boot JPA / Hibernate / MySQL
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS mediai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mediai;

-- Table 1: users (Clinical Staff Authentication & RBAC)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: patients (Demographic profile with encrypted PHI & dynamic age)
CREATE TABLE IF NOT EXISTS patients (
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

-- Table 3: vital_signs (Snapshot of clinical observations & physiological parameters)
CREATE TABLE IF NOT EXISTS vital_signs (
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

-- Table 4: triage_assessments (Decision-support risk assessment & acuity categorization)
CREATE TABLE IF NOT EXISTS triage_assessments (
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

-- Table 5: triage_reviews (Doctor Review & Clinical Override Audit Ledger)
CREATE TABLE IF NOT EXISTS triage_reviews (
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

-- Table 6: medications (Current medications and medication reconciliation)
CREATE TABLE IF NOT EXISTS medications (
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

-- Table 7: triage_audit_log (Immutable append-only system audit journal with zero PHI)
CREATE TABLE IF NOT EXISTS triage_audit_log (
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
