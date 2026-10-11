-- ==============================================================================
-- READ-ONLY REFERENCE SCHEMA
-- Do not run or alter this file. M2 does not create or alter database tables.
-- Provided as a reference for database constraints and column types.
-- ==============================================================================

-- vital_signs table constraints
CREATE TABLE IF NOT EXISTS vital_signs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    heart_rate INT CHECK (heart_rate >= 20 AND heart_rate <= 300),
    respiratory_rate INT CHECK (respiratory_rate >= 4 AND respiratory_rate <= 80),
    systolic_bp INT CHECK (systolic_bp >= 40 AND systolic_bp <= 300),
    diastolic_bp INT CHECK (diastolic_bp >= 20 AND diastolic_bp <= 200),
    oxygen_saturation NUMERIC(4,1) CHECK (oxygen_saturation >= 40.0 AND oxygen_saturation <= 100.0),
    temperature_celsius NUMERIC(4,2) CHECK (temperature_celsius >= 30.00 AND temperature_celsius <= 45.00),
    capillary_blood_glucose NUMERIC(5,1), -- No DB check constraint in current DB schema. Provisional: 20.0-800.0 TODO(contract)
    recorded_by UUID NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_bp_logical CHECK (diastolic_bp IS NULL OR systolic_bp IS NULL OR diastolic_bp < systolic_bp)
);

-- triage_assessments table
CREATE TABLE IF NOT EXISTS triage_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    vital_id UUID REFERENCES vital_signs(id),
    chief_complaint TEXT NOT NULL,
    symptom_vector JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
