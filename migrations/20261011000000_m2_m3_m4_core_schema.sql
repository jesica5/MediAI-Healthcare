-- ==============================================================================
-- Migration: 20261011000000_m2_m3_m4_core_schema.sql
-- Description: Core Schema for Vital Signs, Triage Assessments & Physician Reviews
-- Baseline: MediAI Master Project Specification (v2.0, Section 11)
-- ==============================================================================

-- Table: vital_signs (Snapshot of clinical observations)
CREATE TABLE IF NOT EXISTS vital_signs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    heart_rate INT CHECK (heart_rate BETWEEN 20 AND 300),
    respiratory_rate INT CHECK (respiratory_rate BETWEEN 4 AND 80),
    systolic_bp INT CHECK (systolic_bp BETWEEN 40 AND 300),
    diastolic_bp INT CHECK (diastolic_bp BETWEEN 20 AND 200),
    oxygen_saturation NUMERIC(4,1) CHECK (oxygen_saturation BETWEEN 40.0 AND 100.0),
    temperature_celsius NUMERIC(4,2) CHECK (temperature_celsius BETWEEN 30.00 AND 45.00),
    capillary_blood_glucose NUMERIC(5,1) CHECK (capillary_blood_glucose IS NULL OR (capillary_blood_glucose BETWEEN 10.0 AND 1000.0)),
    recorded_by VARCHAR(64) NOT NULL DEFAULT 'SYSTEM_INTAKE',
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_bp_logical CHECK (diastolic_bp IS NULL OR systolic_bp IS NULL OR diastolic_bp < systolic_bp)
);

-- Table: triage_assessments (Core Decision-Support Output)
CREATE TABLE IF NOT EXISTS triage_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    vital_id UUID REFERENCES vital_signs(id),
    chief_complaint TEXT NOT NULL,
    symptom_vector JSONB NOT NULL,
    calculated_risk_score INT NOT NULL CHECK (calculated_risk_score BETWEEN 0 AND 100),
    calculated_category VARCHAR(16) NOT NULL CHECK (calculated_category IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    hard_red_flag_triggered BOOLEAN NOT NULL DEFAULT FALSE,
    red_flag_details TEXT[],
    confidence_score NUMERIC(3,2) NOT NULL,
    explainability_payload JSONB NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW', 'CONFIRMED', 'OVERRIDDEN', 'DISCHARGED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table: triage_reviews (Doctor Review & Clinical Override Audit Ledger)
CREATE TABLE IF NOT EXISTS triage_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES triage_assessments(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL,
    original_category VARCHAR(16) NOT NULL,
    final_category VARCHAR(16) NOT NULL,
    is_overridden BOOLEAN GENERATED ALWAYS AS (original_category != final_category) STORED,
    override_reason TEXT,
    clinical_notes TEXT,
    reviewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance & query optimization
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient_id ON vital_signs(patient_id);
CREATE INDEX IF NOT EXISTS idx_triage_assessments_patient_id ON triage_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_triage_assessments_status ON triage_assessments(status);
CREATE INDEX IF NOT EXISTS idx_triage_assessments_acuity ON triage_assessments(calculated_category);
CREATE INDEX IF NOT EXISTS idx_triage_assessments_red_flag ON triage_assessments(hard_red_flag_triggered);
CREATE INDEX IF NOT EXISTS idx_triage_reviews_assessment_id ON triage_reviews(assessment_id);

-- Enable Row Level Security (RLS)
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff full access on vital_signs"
    ON vital_signs FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Staff full access on triage_assessments"
    ON triage_assessments FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Doctor write on triage_reviews"
    ON triage_reviews FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
