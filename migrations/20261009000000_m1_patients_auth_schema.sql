-- Migration: 20261009000000_m1_patients_auth_schema.sql
-- Description: Schema for M1 Patient Management & Authentication

-- Enable required cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: patients (Encrypted PHI at rest)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mrn_hash VARCHAR(64) UNIQUE NOT NULL,
    encrypted_name BYTEA NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(16) NOT NULL,
    primary_language VARCHAR(8) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table: triage_audit_log (Immutable, Append-Only System Audit Journal)
CREATE TABLE IF NOT EXISTS triage_audit_log (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    user_id UUID,
    patient_id UUID,
    ip_address INET NOT NULL DEFAULT '127.0.0.1'::inet,
    user_agent TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
-- Policy 1: Service role has full access
CREATE POLICY "Service role full access on patients" 
    ON patients FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Policy 2: Authenticated staff (Nurse, Doctor, Admin) can select patients
CREATE POLICY "Authenticated staff can view patients" 
    ON patients FOR SELECT 
    TO authenticated 
    USING (true);

-- RLS Policies for triage_audit_log
-- Audit log is append-only for application server; system admin can view non-PHI events
CREATE POLICY "Append-only audit log insert" 
    ON triage_audit_log FOR INSERT 
    TO authenticated, anon 
    WITH CHECK (true);

CREATE POLICY "Admin audit log view" 
    ON triage_audit_log FOR SELECT 
    TO authenticated 
    USING (auth.jwt() ->> 'role' = 'System Administrator' OR auth.jwt() ->> 'role' = 'admin');

-- Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
