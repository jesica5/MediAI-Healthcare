-- ==============================================================================
-- MediAI: Smart Patient Triage & Emergency Risk Prediction System
-- Seed Script: 50 Comprehensive Clinical Emergency Patient Records
-- Target Database: PostgreSQL 14+ / Supabase
-- Covers: patients, vital_signs, triage_assessments, triage_reviews, triage_audit_log
-- ==============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing seed data if needed (optional)
-- TRUNCATE TABLE triage_reviews, triage_assessments, vital_signs, triage_audit_log, patients CASCADE;

DO $$
DECLARE
    -- Deterministic UUIDs for 50 patients, vitals, and assessments
    p_id UUID;
    v_id UUID;
    a_id UUID;
    doc_id UUID := '00000000-0000-0000-0000-000000000501'::uuid; -- Dr. Bhuvana M.V.
    nurse_id UUID := '00000000-0000-0000-0000-000000000502'::uuid; -- Staff Triage Nurse
BEGIN

    -- ==========================================================================
    -- PATIENT 1: Severe ACS / STEMI (CRITICAL P1 - Hard Red Flag Domain 3)
    -- ==========================================================================
    p_id := 'a1000001-0000-4000-8000-000000000001'::uuid;
    v_id := 'b1000001-0000-4000-8000-000000000001'::uuid;
    a_id := 'c1000001-0000-4000-8000-000000000001'::uuid;

    INSERT INTO patients (id, mrn_hash, encrypted_name, date_of_birth, gender, primary_language, created_at)
    VALUES (p_id, 'MRN-849201', pgp_sym_encrypt('Ramasamy K.', 'medi_ai_secret_key'), '1958-04-12', 'MALE', 'en', NOW() - INTERVAL '25 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO vital_signs (id, patient_id, heart_rate, respiratory_rate, systolic_bp, diastolic_bp, oxygen_saturation, temperature_celsius, capillary_blood_glucose, recorded_by, recorded_at)
    VALUES (v_id, p_id, 135, 26, 82, 52, 88.0, 39.4, 245.0, 'nurse_sarah', NOW() - INTERVAL '24 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO triage_assessments (id, patient_id, vital_id, chief_complaint, symptom_vector, calculated_risk_score, calculated_category, hard_red_flag_triggered, red_flag_details, confidence_score, explainability_payload, status, created_at)
    VALUES (a_id, p_id, v_id, 'Crushing retrosternal chest pain radiating to left jaw, diaphoresis, dyspnea',
        '{"cardiac": {"chest_pain_character": "crushing", "radiation": "left_arm_jaw", "diaphoresis": true}, "duration_hours": 2}',
        96, 'CRITICAL', true, ARRAY['Domain 3 Cardiac: Crushing retrosternal pain radiating to jaw/left arm', 'Domain 5 BP: Profound shock (SBP 82 mmHg < 85)'],
        0.98, '{"model_version": "v2.1", "latency_ms": 38, "top_risk_drivers": [{"feature": "Chest Pain Radiation", "contribution_percent": 42, "direction": "positive"}, {"feature": "Hypotensive Shock", "contribution_percent": 35, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '24 minutes')
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================================================
    -- PATIENT 2: Sepsis / Septic Shock (CRITICAL P1 - Hard Red Flag Domain 1)
    -- ==========================================================================
    p_id := 'a1000002-0000-4000-8000-000000000002'::uuid;
    v_id := 'b1000002-0000-4000-8000-000000000002'::uuid;
    a_id := 'c1000002-0000-4000-8000-000000000002'::uuid;

    INSERT INTO patients (id, mrn_hash, encrypted_name, date_of_birth, gender, primary_language, created_at)
    VALUES (p_id, 'MRN-739104', pgp_sym_encrypt('Lakshmi Narayanan', 'medi_ai_secret_key'), '1952-11-03', 'FEMALE', 'ta', NOW() - INTERVAL '40 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO vital_signs (id, patient_id, heart_rate, respiratory_rate, systolic_bp, diastolic_bp, oxygen_saturation, temperature_celsius, capillary_blood_glucose, recorded_by, recorded_at)
    VALUES (v_id, p_id, 128, 28, 84, 50, 91.0, 39.8, 180.0, 'nurse_kavitha', NOW() - INTERVAL '38 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO triage_assessments (id, patient_id, vital_id, chief_complaint, symptom_vector, calculated_risk_score, calculated_category, hard_red_flag_triggered, red_flag_details, confidence_score, explainability_payload, status, created_at)
    VALUES (a_id, p_id, v_id, 'High fever, rigors, altered mental status, productive purulent cough',
        '{"sepsis": {"altered_mentation": true, "rigors": true}, "qsofa_score": 3}',
        94, 'CRITICAL', true, ARRAY['Domain 1 Sepsis: qSOFA >= 2 (RR 28 >= 22, SBP 84 <= 100, altered mentation)'],
        0.96, '{"model_version": "v2.1", "latency_ms": 42, "top_risk_drivers": [{"feature": "qSOFA Sepsis Triad", "contribution_percent": 48, "direction": "positive"}, {"feature": "Core Temperature", "contribution_percent": 28, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '38 minutes')
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================================================
    -- PATIENT 3: Acute Severe Hypoxemia / Respiratory Distress (CRITICAL P1 - Domain 2)
    -- ==========================================================================
    p_id := 'a1000003-0000-4000-8000-000000000003'::uuid;
    v_id := 'b1000003-0000-4000-8000-000000000003'::uuid;
    a_id := 'c1000003-0000-4000-8000-000000000003'::uuid;

    INSERT INTO patients (id, mrn_hash, encrypted_name, date_of_birth, gender, primary_language, created_at)
    VALUES (p_id, 'MRN-610283', pgp_sym_encrypt('Murugan P.', 'medi_ai_secret_key'), '1965-02-18', 'MALE', 'en', NOW() - INTERVAL '50 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO vital_signs (id, patient_id, heart_rate, respiratory_rate, systolic_bp, diastolic_bp, oxygen_saturation, temperature_celsius, capillary_blood_glucose, recorded_by, recorded_at)
    VALUES (v_id, p_id, 142, 36, 168, 98, 84.0, 37.4, 130.0, 'nurse_sarah', NOW() - INTERVAL '48 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO triage_assessments (id, patient_id, vital_id, chief_complaint, symptom_vector, calculated_risk_score, calculated_category, hard_red_flag_triggered, red_flag_details, confidence_score, explainability_payload, status, created_at)
    VALUES (a_id, p_id, v_id, 'Acute severe dyspnea, central cyanosis, audible expiratory wheeze, unable to speak full sentences',
        '{"respiratory": {"accessory_muscle_use": true, "cyanosis": true, "stridor": false}}',
        98, 'CRITICAL', true, ARRAY['Domain 2 Respiratory: SpO2 84% < 90% on room air', 'Domain 2 Respiratory: Respiratory rate 36 bpm > 32'],
        0.99, '{"model_version": "v2.1", "latency_ms": 36, "top_risk_drivers": [{"feature": "Severe Hypoxemia SpO2 84%", "contribution_percent": 55, "direction": "positive"}, {"feature": "Extreme Tachypnea", "contribution_percent": 30, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '48 minutes')
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================================================
    -- PATIENT 4: Acute Ischemic Stroke / FAST Deficit (CRITICAL P1 - Domain 4)
    -- ==========================================================================
    p_id := 'a1000004-0000-4000-8000-000000000004'::uuid;
    v_id := 'b1000004-0000-4000-8000-000000000004'::uuid;
    a_id := 'c1000004-0000-4000-8000-000000000004'::uuid;

    INSERT INTO patients (id, mrn_hash, encrypted_name, date_of_birth, gender, primary_language, created_at)
    VALUES (p_id, 'MRN-920415', pgp_sym_encrypt('Anitha Sundaram', 'medi_ai_secret_key'), '1961-08-14', 'FEMALE', 'ta', NOW() - INTERVAL '65 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO vital_signs (id, patient_id, heart_rate, respiratory_rate, systolic_bp, diastolic_bp, oxygen_saturation, temperature_celsius, capillary_blood_glucose, recorded_by, recorded_at)
    VALUES (v_id, p_id, 96, 18, 194, 112, 96.0, 36.9, 115.0, 'nurse_kavitha', NOW() - INTERVAL '62 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO triage_assessments (id, patient_id, vital_id, chief_complaint, symptom_vector, calculated_risk_score, calculated_category, hard_red_flag_triggered, red_flag_details, confidence_score, explainability_payload, status, created_at)
    VALUES (a_id, p_id, v_id, 'Sudden onset right-sided hemiplegia, facial droop, slurred speech, onset 45 min ago',
        '{"neurological": {"facial_droop": true, "arm_drift": true, "slurred_speech": true, "gcs": 11}}',
        92, 'CRITICAL', true, ARRAY['Domain 4 Neurological: Acute focal deficit (FAST positive, GCS 11 < 12)'],
        0.97, '{"model_version": "v2.1", "latency_ms": 40, "top_risk_drivers": [{"feature": "Acute Focal Deficit FAST", "contribution_percent": 50, "direction": "positive"}, {"feature": "Severe Hypertension", "contribution_percent": 25, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '62 minutes')
    ON CONFLICT (id) DO NOTHING;

    -- Review record for Patient 4 (Confirmed by Dr. Bhuvana)
    INSERT INTO triage_reviews (id, assessment_id, doctor_id, original_category, final_category, override_reason, clinical_notes, reviewed_at)
    VALUES ('d1000004-0000-4000-8000-000000000004'::uuid, a_id, doc_id, 'CRITICAL', 'CRITICAL', NULL,
        'Code Stroke activated. Non-contrast head CT ordered immediately. Bedside thrombolysis evaluation in progress.', NOW() - INTERVAL '55 minutes')
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================================================
    -- PATIENT 5: Diabetic Ketoacidosis (DKA) with Kussmaul (CRITICAL P1 - Domain 6)
    -- ==========================================================================
    p_id := 'a1000005-0000-4000-8000-000000000005'::uuid;
    v_id := 'b1000005-0000-4000-8000-000000000005'::uuid;
    a_id := 'c1000005-0000-4000-8000-000000000005'::uuid;

    INSERT INTO patients (id, mrn_hash, encrypted_name, date_of_birth, gender, primary_language, created_at)
    VALUES (p_id, 'MRN-551982', pgp_sym_encrypt('Vijay Kumar', 'medi_ai_secret_key'), '1998-09-22', 'MALE', 'en', NOW() - INTERVAL '80 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO vital_signs (id, patient_id, heart_rate, respiratory_rate, systolic_bp, diastolic_bp, oxygen_saturation, temperature_celsius, capillary_blood_glucose, recorded_by, recorded_at)
    VALUES (v_id, p_id, 126, 30, 96, 62, 97.0, 37.2, 485.0, 'nurse_sarah', NOW() - INTERVAL '78 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO triage_assessments (id, patient_id, vital_id, chief_complaint, symptom_vector, calculated_risk_score, calculated_category, hard_red_flag_triggered, red_flag_details, confidence_score, explainability_payload, status, created_at)
    VALUES (a_id, p_id, v_id, 'Persistent vomiting, deep rapid Kussmaul breathing, fruity breath odor, lethargy',
        '{"diabetes": {"cbg": 485, "kussmaul": true, "fruity_breath": true}}',
        90, 'CRITICAL', true, ARRAY['Domain 6 Diabetes: Capillary Blood Glucose 485 mg/dL > 400 with ketotic Kussmaul breathing'],
        0.98, '{"model_version": "v2.1", "latency_ms": 35, "top_risk_drivers": [{"feature": "Severe Hyperglycemia CBG 485", "contribution_percent": 52, "direction": "positive"}, {"feature": "Tachypnea Acidosis", "contribution_percent": 30, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '78 minutes')
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================================================
    -- PATIENT 6: Severe Upper GI Hemorrhage (CRITICAL P1 - Domain 7)
    -- ==========================================================================
    p_id := 'a1000006-0000-4000-8000-000000000006'::uuid;
    v_id := 'b1000006-0000-4000-8000-000000000006'::uuid;
    a_id := 'c1000006-0000-4000-8000-000000000006'::uuid;

    INSERT INTO patients (id, mrn_hash, encrypted_name, date_of_birth, gender, primary_language, created_at)
    VALUES (p_id, 'MRN-782190', pgp_sym_encrypt('Karpagam V.', 'medi_ai_secret_key'), '1955-03-30', 'FEMALE', 'ta', NOW() - INTERVAL '95 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO vital_signs (id, patient_id, heart_rate, respiratory_rate, systolic_bp, diastolic_bp, oxygen_saturation, temperature_celsius, capillary_blood_glucose, recorded_by, recorded_at)
    VALUES (v_id, p_id, 138, 24, 78, 48, 93.0, 36.4, 108.0, 'nurse_kavitha', NOW() - INTERVAL '92 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO triage_assessments (id, patient_id, vital_id, chief_complaint, symptom_vector, calculated_risk_score, calculated_category, hard_red_flag_triggered, red_flag_details, confidence_score, explainability_payload, status, created_at)
    VALUES (a_id, p_id, v_id, 'Massive coffee-ground hematemesis, black tarry melena, dizziness and presyncope',
        '{"gi": {"hematemesis": true, "melena": true, "guarding": false}}',
        95, 'CRITICAL', true, ARRAY['Domain 7 GI: Massive hematemesis with hemodynamic collapse (SBP 78 mmHg < 85)'],
        0.99, '{"model_version": "v2.1", "latency_ms": 37, "top_risk_drivers": [{"feature": "Active Hemorrhagic Shock", "contribution_percent": 55, "direction": "positive"}, {"feature": "Tachycardia Response", "contribution_percent": 25, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '92 minutes')
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================================================
    -- PATIENT 7: Major Road Trauma & Flail Chest (CRITICAL P1 - Domain 8)
    -- ==========================================================================
    p_id := 'a1000007-0000-4000-8000-000000000007'::uuid;
    v_id := 'b1000007-0000-4000-8000-000000000007'::uuid;
    a_id := 'c1000007-0000-4000-8000-000000000007'::uuid;

    INSERT INTO patients (id, mrn_hash, encrypted_name, date_of_birth, gender, primary_language, created_at)
    VALUES (p_id, 'MRN-330914', pgp_sym_encrypt('Senthil Nathan', 'medi_ai_secret_key'), '1989-12-11', 'MALE', 'en', NOW() - INTERVAL '110 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO vital_signs (id, patient_id, heart_rate, respiratory_rate, systolic_bp, diastolic_bp, oxygen_saturation, temperature_celsius, capillary_blood_glucose, recorded_by, recorded_at)
    VALUES (v_id, p_id, 146, 34, 86, 54, 87.0, 36.1, 140.0, 'nurse_sarah', NOW() - INTERVAL '108 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO triage_assessments (id, patient_id, vital_id, chief_complaint, symptom_vector, calculated_risk_score, calculated_category, hard_red_flag_triggered, red_flag_details, confidence_score, explainability_payload, status, created_at)
    VALUES (a_id, p_id, v_id, 'High-velocity motorcycle collision, paradoxical chest wall movement, flail chest',
        '{"trauma": {"flail_chest": true, "pulsatile_bleed": false, "spinal_injury": true}}',
        99, 'CRITICAL', true, ARRAY['Domain 8 Trauma: Flail chest, suspected acute spinal injury, SpO2 87% < 90%'],
        0.99, '{"model_version": "v2.1", "latency_ms": 34, "top_risk_drivers": [{"feature": "Flail Chest Respiratory Failure", "contribution_percent": 50, "direction": "positive"}, {"feature": "Polytrauma Hemorrhagic Shock", "contribution_percent": 40, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '108 minutes')
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================================================
    -- PATIENT 8: Severe Anaphylaxis with Stridor (CRITICAL P1 - Domain 10)
    -- ==========================================================================
    p_id := 'a1000008-0000-4000-8000-000000000008'::uuid;
    v_id := 'b1000008-0000-4000-8000-000000000008'::uuid;
    a_id := 'c1000008-0000-4000-8000-000000000008'::uuid;

    INSERT INTO patients (id, mrn_hash, encrypted_name, date_of_birth, gender, primary_language, created_at)
    VALUES (p_id, 'MRN-448291', pgp_sym_encrypt('Priya Dharshini', 'medi_ai_secret_key'), '2001-09-30', 'FEMALE', 'ta', NOW() - INTERVAL '125 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO vital_signs (id, patient_id, heart_rate, respiratory_rate, systolic_bp, diastolic_bp, oxygen_saturation, temperature_celsius, capillary_blood_glucose, recorded_by, recorded_at)
    VALUES (v_id, p_id, 134, 30, 80, 48, 89.0, 37.0, 102.0, 'nurse_kavitha', NOW() - INTERVAL '122 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO triage_assessments (id, patient_id, vital_id, chief_complaint, symptom_vector, calculated_risk_score, calculated_category, hard_red_flag_triggered, red_flag_details, confidence_score, explainability_payload, status, created_at)
    VALUES (a_id, p_id, v_id, 'Bee sting with rapid facial angioedema, tongue swelling, audible stridor, dizziness',
        '{"allergic": {"angioedema": true, "stridor": true, "wheezing": true}}',
        97, 'CRITICAL', true, ARRAY['Domain 10 Allergy: Angioedema of tongue/pharynx with acute audible stridor & hypotension'],
        0.98, '{"model_version": "v2.1", "latency_ms": 36, "top_risk_drivers": [{"feature": "Fatal Airway Compromise", "contribution_percent": 55, "direction": "positive"}, {"feature": "Anaphylactic Shock", "contribution_percent": 35, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '122 minutes')
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================================================
    -- PATIENT 9: Hypertensive Crisis with Papilledema (CRITICAL P1 - Domain 5)
    -- ==========================================================================
    p_id := 'a1000009-0000-4000-8000-000000000009'::uuid;
    v_id := 'b1000009-0000-4000-8000-000000000009'::uuid;
    a_id := 'c1000009-0000-4000-8000-000000000009'::uuid;

    INSERT INTO patients (id, mrn_hash, encrypted_name, date_of_birth, gender, primary_language, created_at)
    VALUES (p_id, 'MRN-192837', pgp_sym_encrypt('Govindaraj M.', 'medi_ai_secret_key'), '1950-06-19', 'MALE', 'en', NOW() - INTERVAL '140 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO vital_signs (id, patient_id, heart_rate, respiratory_rate, systolic_bp, diastolic_bp, oxygen_saturation, temperature_celsius, capillary_blood_glucose, recorded_by, recorded_at)
    VALUES (v_id, p_id, 108, 20, 225, 134, 95.0, 37.1, 135.0, 'nurse_sarah', NOW() - INTERVAL '136 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO triage_assessments (id, patient_id, vital_id, chief_complaint, symptom_vector, calculated_risk_score, calculated_category, hard_red_flag_triggered, red_flag_details, confidence_score, explainability_payload, status, created_at)
    VALUES (a_id, p_id, v_id, 'Severe explosive occipital headache, blurred vision, projectile vomiting, BP 225/134',
        '{"blood_pressure": {"headache": true, "chest_pain": false, "end_organ_damage": true}}',
        88, 'CRITICAL', true, ARRAY['Domain 5 BP: Hypertensive emergency (SBP 225 > 180, DBP 134 > 120 with encephalopathy)'],
        0.96, '{"model_version": "v2.1", "latency_ms": 39, "top_risk_drivers": [{"feature": "Extreme SBP/DBP Deviation", "contribution_percent": 60, "direction": "positive"}, {"feature": "Neurological Encephalopathy", "contribution_percent": 25, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '136 minutes')
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================================================
    -- PATIENT 10: Organophosphate SLUDGE Poisoning (CRITICAL P1 - Domain 12)
    -- ==========================================================================
    p_id := 'a1000010-0000-4000-8000-000000000010'::uuid;
    v_id := 'b1000010-0000-4000-8000-000000000010'::uuid;
    a_id := 'c1000010-0000-4000-8000-000000000010'::uuid;

    INSERT INTO patients (id, mrn_hash, encrypted_name, date_of_birth, gender, primary_language, created_at)
    VALUES (p_id, 'MRN-609182', pgp_sym_encrypt('Chitra Selvam', 'medi_ai_secret_key'), '1976-01-08', 'FEMALE', 'ta', NOW() - INTERVAL '155 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO vital_signs (id, patient_id, heart_rate, respiratory_rate, systolic_bp, diastolic_bp, oxygen_saturation, temperature_celsius, capillary_blood_glucose, recorded_by, recorded_at)
    VALUES (v_id, p_id, 36, 10, 82, 50, 89.0, 35.8, 98.0, 'nurse_kavitha', NOW() - INTERVAL '150 minutes')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO triage_assessments (id, patient_id, vital_id, chief_complaint, symptom_vector, calculated_risk_score, calculated_category, hard_red_flag_triggered, red_flag_details, confidence_score, explainability_payload, status, created_at)
    VALUES (a_id, p_id, v_id, 'Agricultural insecticide exposure, profuse salivation, pinpoint pupils, severe bradycardia',
        '{"toxicology": {"sludge": true, "pinpoint_pupils": true, "bradycardia": true}}',
        98, 'CRITICAL', true, ARRAY['Domain 12 Toxic: Organophosphate cholinergic toxidrome (SLUDGE), extreme bradycardia HR 36 < 40'],
        0.98, '{"model_version": "v2.1", "latency_ms": 33, "top_risk_drivers": [{"feature": "SLUDGE Cholinergic Toxidrome", "contribution_percent": 50, "direction": "positive"}, {"feature": "Severe Bradycardia HR 36", "contribution_percent": 35, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '150 minutes')
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================================================
    -- PATIENTS 11–25: HIGH PRIORITY (P2 - Score 60-84, Emergent 15-30 min)
    -- ==========================================================================

    -- Patient 11: Acute Appendicitis with peritoneal signs (Score 78)
    p_id := 'a1000011-0000-4000-8000-000000000011'::uuid;
    v_id := 'b1000011-0000-4000-8000-000000000011'::uuid;
    a_id := 'c1000011-0000-4000-8000-000000000011'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-771829', pgp_sym_encrypt('Dinesh Babu', 'medi_ai_secret_key'), '1995-07-14', 'MALE', 'en', NOW() - INTERVAL '2 hours');
    INSERT INTO vital_signs VALUES (v_id, p_id, 108, 22, 130, 84, 98.0, 38.6, 110.0, 'nurse_sarah', NOW() - INTERVAL '2 hours');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Right lower quadrant abdominal pain, rebound tenderness, high fever, anorexia',
        '{"gi": {"quadrant": "RLQ", "rebound": true, "fever": true}}', 78, 'HIGH', false, NULL, 0.94,
        '{"model_version": "v2.1", "latency_ms": 32, "top_risk_drivers": [{"feature": "RLQ Rebound Tenderness", "contribution_percent": 45, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '2 hours');

    -- Patient 12: Moderate Asthma Flare with wheeze (Score 74)
    p_id := 'a1000012-0000-4000-8000-000000000012'::uuid;
    v_id := 'b1000012-0000-4000-8000-000000000012'::uuid;
    a_id := 'c1000012-0000-4000-8000-000000000012'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-882910', pgp_sym_encrypt('Meenakshi S.', 'medi_ai_secret_key'), '1984-11-28', 'FEMALE', 'ta', NOW() - INTERVAL '2 hours 15 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 112, 26, 138, 86, 92.0, 37.0, 95.0, 'nurse_kavitha', NOW() - INTERVAL '2 hours 15 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Moderate asthma exacerbation, persistent bilateral wheeze, SpO2 92%',
        '{"respiratory": {"wheeze": true, "cough": true}}', 74, 'HIGH', false, NULL, 0.92,
        '{"model_version": "v2.1", "latency_ms": 31, "top_risk_drivers": [{"feature": "Moderate Hypoxemia SpO2 92%", "contribution_percent": 40, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '2 hours 15 min');

    -- Patient 13: Atrial Fibrillation with Rapid Ventricular Response (Score 80)
    p_id := 'a1000013-0000-4000-8000-000000000013'::uuid;
    v_id := 'b1000013-0000-4000-8000-000000000013'::uuid;
    a_id := 'c1000013-0000-4000-8000-000000000013'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-991028', pgp_sym_encrypt('Krishnamurthy N.', 'medi_ai_secret_key'), '1948-05-02', 'MALE', 'en', NOW() - INTERVAL '2 hours 30 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 148, 22, 144, 90, 95.0, 36.8, 118.0, 'nurse_sarah', NOW() - INTERVAL '2 hours 30 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Irregular palpitations, lightheadedness, fatigue, HR 148 bpm',
        '{"cardiac": {"palpitations": true, "syncope": false}}', 80, 'HIGH', false, NULL, 0.95,
        '{"model_version": "v2.1", "latency_ms": 35, "top_risk_drivers": [{"feature": "Tachycardia HR 148", "contribution_percent": 48, "direction": "positive"}]}',
        'OVERRIDDEN', NOW() - INTERVAL '2 hours 30 min');

    -- Overridden record for Patient 13
    INSERT INTO triage_reviews (id, assessment_id, doctor_id, original_category, final_category, override_reason, clinical_notes, reviewed_at)
    VALUES ('d1000013-0000-4000-8000-000000000013'::uuid, a_id, doc_id, 'HIGH', 'HIGH',
        'Bedside rate control achieved with IV Diltiazem. Rhythm monitored on telemetry.', 'Attending sign-off completed.', NOW() - INTERVAL '2 hours');

    -- Patient 14: Acute Cholecystitis (Score 72)
    p_id := 'a1000014-0000-4000-8000-000000000014'::uuid;
    v_id := 'b1000014-0000-4000-8000-000000000014'::uuid;
    a_id := 'c1000014-0000-4000-8000-000000000014'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-102938', pgp_sym_encrypt('Bavani Shankar', 'medi_ai_secret_key'), '1970-10-18', 'FEMALE', 'ta', NOW() - INTERVAL '2 hours 45 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 98, 20, 136, 82, 97.0, 38.3, 105.0, 'nurse_kavitha', NOW() - INTERVAL '2 hours 45 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Severe RUQ pain radiating to right scapula post fatty meal, positive Murphy sign',
        '{"gi": {"quadrant": "RUQ", "murphy_sign": true}}', 72, 'HIGH', false, NULL, 0.91,
        '{"model_version": "v2.1", "latency_ms": 30, "top_risk_drivers": [{"feature": "Positive Murphy Sign", "contribution_percent": 38, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '2 hours 45 min');

    -- Patient 15: Acute Pyelonephritis (Score 76)
    p_id := 'a1000015-0000-4000-8000-000000000015'::uuid;
    v_id := 'b1000015-0000-4000-8000-000000000015'::uuid;
    a_id := 'c1000015-0000-4000-8000-000000000015'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-219384', pgp_sym_encrypt('Devi Prasad', 'medi_ai_secret_key'), '1982-04-25', 'FEMALE', 'en', NOW() - INTERVAL '3 hours');
    INSERT INTO vital_signs VALUES (v_id, p_id, 106, 20, 118, 76, 98.0, 39.2, 112.0, 'nurse_sarah', NOW() - INTERVAL '3 hours');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Left flank costovertebral angle tenderness, high fever, dysuria, chills',
        '{"urinary": {"cva_tenderness": true, "dysuria": true, "fever": true}}', 76, 'HIGH', false, NULL, 0.93,
        '{"model_version": "v2.1", "latency_ms": 33, "top_risk_drivers": [{"feature": "CVA Tenderness with Pyrexia", "contribution_percent": 42, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '3 hours');

    -- Patient 16: Severe Dehydration / Prerenal Azotemia (Score 79)
    p_id := 'a1000016-0000-4000-8000-000000000016'::uuid;
    v_id := 'b1000016-0000-4000-8000-000000000016'::uuid;
    a_id := 'c1000016-0000-4000-8000-000000000016'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-329485', pgp_sym_encrypt('Kannan T.', 'medi_ai_secret_key'), '1945-08-12', 'MALE', 'ta', NOW() - INTERVAL '3 hours 15 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 118, 22, 94, 60, 96.0, 37.6, 120.0, 'nurse_kavitha', NOW() - INTERVAL '3 hours 15 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Profuse watery diarrhea x 3 days, dry mucous membranes, oliguria < 400ml/24h',
        '{"dehydration": {"skin_turgor": "poor", "anuria_hours": 8}}', 79, 'HIGH', false, NULL, 0.90,
        '{"model_version": "v2.1", "latency_ms": 32, "top_risk_drivers": [{"feature": "Oliguria Dehydration Index", "contribution_percent": 46, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '3 hours 15 min');

    -- Patient 17: Deep Vein Thrombosis with leg swelling (Score 68)
    p_id := 'a1000017-0000-4000-8000-000000000017'::uuid;
    v_id := 'b1000017-0000-4000-8000-000000000017'::uuid;
    a_id := 'c1000017-0000-4000-8000-000000000017'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-439586', pgp_sym_encrypt('Shanthi Raman', 'medi_ai_secret_key'), '1968-12-04', 'FEMALE', 'en', NOW() - INTERVAL '3 hours 30 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 92, 18, 134, 82, 97.0, 37.1, 98.0, 'nurse_sarah', NOW() - INTERVAL '3 hours 30 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Unilateral left calf swelling, warmth, tenderness post-long international flight',
        '{"vascular": {"unilateral_edema": true, "warmth": true}}', 68, 'HIGH', false, NULL, 0.89,
        '{"model_version": "v2.1", "latency_ms": 29, "top_risk_drivers": [{"feature": "Unilateral Calf Swelling", "contribution_percent": 36, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '3 hours 30 min');

    -- Patient 18: Acute Diverticulitis (Score 65)
    p_id := 'a1000018-0000-4000-8000-000000000018'::uuid;
    v_id := 'b1000018-0000-4000-8000-000000000018'::uuid;
    a_id := 'c1000018-0000-4000-8000-000000000018'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-540697', pgp_sym_encrypt('Rajendran G.', 'medi_ai_secret_key'), '1959-02-20', 'MALE', 'ta', NOW() - INTERVAL '3 hours 45 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 96, 18, 142, 88, 98.0, 38.1, 130.0, 'nurse_kavitha', NOW() - INTERVAL '3 hours 45 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Constant sharp left lower quadrant abdominal pain, low grade fever, constipation',
        '{"gi": {"quadrant": "LLQ", "tenderness": true}}', 65, 'HIGH', false, NULL, 0.88,
        '{"model_version": "v2.1", "latency_ms": 30, "top_risk_drivers": [{"feature": "LLQ Localized Tenderness", "contribution_percent": 34, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '3 hours 45 min');

    -- Patient 19: Second Degree Burn over 15% TBSA (Score 82)
    p_id := 'a1000019-0000-4000-8000-000000000019'::uuid;
    v_id := 'b1000019-0000-4000-8000-000000000019'::uuid;
    a_id := 'c1000019-0000-4000-8000-000000000019'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-651708', pgp_sym_encrypt('Suriya Prakash', 'medi_ai_secret_key'), '2000-05-15', 'MALE', 'en', NOW() - INTERVAL '4 hours');
    INSERT INTO vital_signs VALUES (v_id, p_id, 122, 22, 112, 70, 99.0, 37.3, 115.0, 'nurse_sarah', NOW() - INTERVAL '4 hours');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Hot boiling oil scald burns over both forearms and anterior chest, blistering, severe pain',
        '{"trauma": {"burn_tbsa": 15, "burn_degree": 2}}', 82, 'HIGH', false, NULL, 0.94,
        '{"model_version": "v2.1", "latency_ms": 35, "top_risk_drivers": [{"feature": "TBSA Scald Burn", "contribution_percent": 45, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '4 hours');

    -- Patient 20: Missing Essential Vital Warning (SpO2 Unrecorded, Score 62)
    p_id := 'a1000020-0000-4000-8000-000000000020'::uuid;
    v_id := 'b1000020-0000-4000-8000-000000000020'::uuid;
    a_id := 'c1000020-0000-4000-8000-000000000020'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-762819', pgp_sym_encrypt('Revathi Nair', 'medi_ai_secret_key'), '1975-09-08', 'FEMALE', 'ta', NOW() - INTERVAL '4 hours 15 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 94, 20, 128, 80, NULL, 37.2, 105.0, 'nurse_kavitha', NOW() - INTERVAL '4 hours 15 min'); -- NULL SpO2
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Chest heaviness and general weakness, pulse oximeter probe failed to read',
        '{"cardiac": {"chest_tightness": true}}', 62, 'HIGH', false, NULL, 0.65,
        '{"model_version": "v2.1", "latency_ms": 32, "missing_vitals_warning": true, "missing_vitals_list": ["oxygen_saturation"], "top_risk_drivers": [{"feature": "Chest Tightness", "contribution_percent": 30, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '4 hours 15 min');

    -- Patient 21: Acute Renal Colic / Nephrolithiasis (Score 70)
    p_id := 'a1000021-0000-4000-8000-000000000021'::uuid;
    v_id := 'b1000021-0000-4000-8000-000000000021'::uuid;
    a_id := 'c1000021-0000-4000-8000-000000000021'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-873920', pgp_sym_encrypt('Manikandan S.', 'medi_ai_secret_key'), '1988-03-12', 'MALE', 'en', NOW() - INTERVAL '4 hours 30 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 110, 20, 150, 92, 98.0, 36.9, 100.0, 'nurse_sarah', NOW() - INTERVAL '4 hours 30 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Excruciating episodic flank pain radiating to groin, macroscopic hematuria, writhing in bed',
        '{"urinary": {"renal_colic": true, "hematuria": true}}', 70, 'HIGH', false, NULL, 0.90,
        '{"model_version": "v2.1", "latency_ms": 28, "top_risk_drivers": [{"feature": "Severe Renal Colic Pain", "contribution_percent": 38, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '4 hours 30 min');

    -- Patient 22: Unstable Angina without ST elevation (Score 81)
    p_id := 'a1000022-0000-4000-8000-000000000022'::uuid;
    v_id := 'b1000022-0000-4000-8000-000000000022'::uuid;
    a_id := 'c1000022-0000-4000-8000-000000000022'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-984031', pgp_sym_encrypt('Geetha Balan', 'medi_ai_secret_key'), '1963-08-29', 'FEMALE', 'ta', NOW() - INTERVAL '4 hours 45 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 92, 18, 140, 88, 96.0, 37.0, 145.0, 'nurse_kavitha', NOW() - INTERVAL '4 hours 45 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Substernal chest tightness occurring at rest, relieved after 20 minutes',
        '{"cardiac": {"angina_at_rest": true}}', 81, 'HIGH', false, NULL, 0.93,
        '{"model_version": "v2.1", "latency_ms": 31, "top_risk_drivers": [{"feature": "Rest Angina Symptoms", "contribution_percent": 44, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '4 hours 45 min');

    -- Patient 23: Acute Pancreatitis (Score 77)
    p_id := 'a1000023-0000-4000-8000-000000000023'::uuid;
    v_id := 'b1000023-0000-4000-8000-000000000023'::uuid;
    a_id := 'c1000023-0000-4000-8000-000000000023'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-195142', pgp_sym_encrypt('Palanisamy V.', 'medi_ai_secret_key'), '1971-11-09', 'MALE', 'en', NOW() - INTERVAL '5 hours');
    INSERT INTO vital_signs VALUES (v_id, p_id, 105, 22, 126, 78, 97.0, 38.2, 185.0, 'nurse_sarah', NOW() - INTERVAL '5 hours');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Boring epigastric pain radiating through to back, relieved by leaning forward, persistent emesis',
        '{"gi": {"epigastric_pain": true, "radiates_back": true}}', 77, 'HIGH', false, NULL, 0.92,
        '{"model_version": "v2.1", "latency_ms": 30, "top_risk_drivers": [{"feature": "Epigastric Back Radiation", "contribution_percent": 41, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '5 hours');

    -- Patient 24: Severe Epistaxis with Anticoagulant use (Score 66)
    p_id := 'a1000024-0000-4000-8000-000000000024'::uuid;
    v_id := 'b1000024-0000-4000-8000-000000000024'::uuid;
    a_id := 'c1000024-0000-4000-8000-000000000024'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-206253', pgp_sym_encrypt('Sarojini Ammal', 'medi_ai_secret_key'), '1947-01-21', 'FEMALE', 'ta', NOW() - INTERVAL '5 hours 15 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 88, 16, 172, 96, 98.0, 36.7, 104.0, 'nurse_kavitha', NOW() - INTERVAL '5 hours 15 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Continuous posterior nasal bleeding > 45 minutes on Warfarin, swallowing blood',
        '{"ent": {"epistaxis": true, "anticoagulant": true}}', 66, 'HIGH', false, NULL, 0.91,
        '{"model_version": "v2.1", "latency_ms": 28, "top_risk_drivers": [{"feature": "Anticoagulated Active Bleed", "contribution_percent": 36, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '5 hours 15 min');

    -- Patient 25: Moderate Head Injury with amnesia (Score 73)
    p_id := 'a1000025-0000-4000-8000-000000000025'::uuid;
    v_id := 'b1000025-0000-4000-8000-000000000025'::uuid;
    a_id := 'c1000025-0000-4000-8000-000000000025'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-317364', pgp_sym_encrypt('Arun Mozhi', 'medi_ai_secret_key'), '1993-06-18', 'MALE', 'en', NOW() - INTERVAL '5 hours 30 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 76, 16, 130, 82, 99.0, 36.9, 96.0, 'nurse_sarah', NOW() - INTERVAL '5 hours 30 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Blunt head trauma after fall, loss of consciousness for 3 minutes, retrograde amnesia',
        '{"trauma": {"loc_minutes": 3, "amnesia": true, "gcs": 14}}', 73, 'HIGH', false, NULL, 0.90,
        '{"model_version": "v2.1", "latency_ms": 32, "top_risk_drivers": [{"feature": "Loss of Consciousness", "contribution_percent": 39, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '5 hours 30 min');

    -- ==========================================================================
    -- PATIENTS 26–38: MODERATE PRIORITY (P3 - Score 30-59, Urgent 60 min)
    -- ==========================================================================

    -- Patient 26: Closed Colles Wrist Fracture (Score 48)
    p_id := 'a1000026-0000-4000-8000-000000000026'::uuid;
    v_id := 'b1000026-0000-4000-8000-000000000026'::uuid;
    a_id := 'c1000026-0000-4000-8000-000000000026'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-428475', pgp_sym_encrypt('Mallika Devi', 'medi_ai_secret_key'), '1962-07-22', 'FEMALE', 'ta', NOW() - INTERVAL '6 hours');
    INSERT INTO vital_signs VALUES (v_id, p_id, 86, 16, 138, 84, 98.0, 36.8, 102.0, 'nurse_kavitha', NOW() - INTERVAL '6 hours');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Fall on outstretched hand, dinner fork deformity of right wrist, neurovascular intact',
        '{"ortho": {"fracture_suspected": true, "distal_pulse": true}}', 48, 'MODERATE', false, NULL, 0.95,
        '{"model_version": "v2.1", "latency_ms": 25, "top_risk_drivers": [{"feature": "Localized Skeletal Deformity", "contribution_percent": 28, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '6 hours');

    -- Patient 27: Acute Gastroenteritis without severe dehydration (Score 42)
    p_id := 'a1000027-0000-4000-8000-000000000027'::uuid;
    v_id := 'b1000027-0000-4000-8000-000000000027'::uuid;
    a_id := 'c1000027-0000-4000-8000-000000000027'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-539586', pgp_sym_encrypt('Karthikeyan P.', 'medi_ai_secret_key'), '1999-03-14', 'MALE', 'en', NOW() - INTERVAL '6 hours 15 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 88, 16, 116, 74, 99.0, 37.8, 90.0, 'nurse_sarah', NOW() - INTERVAL '6 hours 15 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Crampy abdominal pain, nausea, loose stools x 4 episodes today, able to tolerate oral sips',
        '{"gi": {"diarrhea": true, "emesis": true}}', 42, 'MODERATE', false, NULL, 0.92,
        '{"model_version": "v2.1", "latency_ms": 26, "top_risk_drivers": [{"feature": "Acute Enteritis Symptoms", "contribution_percent": 24, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '6 hours 15 min');

    -- Patient 28: Lower Extremity Cellulitis (Score 52)
    p_id := 'a1000028-0000-4000-8000-000000000028'::uuid;
    v_id := 'b1000028-0000-4000-8000-000000000028'::uuid;
    a_id := 'c1000028-0000-4000-8000-000000000028'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-640697', pgp_sym_encrypt('Janaki Ammal', 'medi_ai_secret_key'), '1956-10-05', 'FEMALE', 'ta', NOW() - INTERVAL '6 hours 30 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 92, 18, 134, 82, 97.0, 38.4, 150.0, 'nurse_kavitha', NOW() - INTERVAL '6 hours 30 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Spreading erythema and warmth over right lower leg, distinct border, mild edema',
        '{"skin": {"cellulitis": true, "fever": true}}', 52, 'MODERATE', false, NULL, 0.91,
        '{"model_version": "v2.1", "latency_ms": 27, "top_risk_drivers": [{"feature": "Local Soft Tissue Infection", "contribution_percent": 30, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '6 hours 30 min');

    -- Patient 29: Uncomplicated Migraine Headache (Score 38)
    p_id := 'a1000029-0000-4000-8000-000000000029'::uuid;
    v_id := 'b1000029-0000-4000-8000-000000000029'::uuid;
    a_id := 'c1000029-0000-4000-8000-000000000029'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-751708', pgp_sym_encrypt('Deepa Chandran', 'medi_ai_secret_key'), '1991-08-30', 'FEMALE', 'en', NOW() - INTERVAL '6 hours 45 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 78, 14, 120, 78, 99.0, 36.6, 94.0, 'nurse_sarah', NOW() - INTERVAL '6 hours 45 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Throbbing unilateral left temple headache, photophobia, phonophobia, typical history of migraine',
        '{"neuro": {"headache_type": "throbbing", "photophobia": true}}', 38, 'MODERATE', false, NULL, 0.96,
        '{"model_version": "v2.1", "latency_ms": 24, "top_risk_drivers": [{"feature": "Migraine Symptom Complex", "contribution_percent": 22, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '6 hours 45 min');

    -- Patient 30: Corneal Abrasion with foreign body sensation (Score 35)
    p_id := 'a1000030-0000-4000-8000-000000000030'::uuid;
    v_id := 'b1000030-0000-4000-8000-000000000030'::uuid;
    a_id := 'c1000030-0000-4000-8000-000000000030'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-862819', pgp_sym_encrypt('Rajesh Kumar M.', 'medi_ai_secret_key'), '1987-11-17', 'MALE', 'ta', NOW() - INTERVAL '7 hours');
    INSERT INTO vital_signs VALUES (v_id, p_id, 80, 16, 124, 80, 98.0, 36.7, 102.0, 'nurse_kavitha', NOW() - INTERVAL '7 hours');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Foreign body sensation in right eye after metal grinding, lacrimation, blepharospasm',
        '{"eye": {"foreign_body": true, "pain": true}}', 35, 'MODERATE', false, NULL, 0.94,
        '{"model_version": "v2.1", "latency_ms": 23, "top_risk_drivers": [{"feature": "Ocular Foreign Body", "contribution_percent": 20, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '7 hours');

    -- Patient 31: Acute Otitis Media with severe earache (Score 34)
    p_id := 'a1000031-0000-4000-8000-000000000031'::uuid;
    v_id := 'b1000031-0000-4000-8000-000000000031'::uuid;
    a_id := 'c1000031-0000-4000-8000-000000000031'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-973920', pgp_sym_encrypt('Naveen Raj', 'medi_ai_secret_key'), '2004-02-10', 'MALE', 'en', NOW() - INTERVAL '7 hours 15 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 82, 16, 118, 74, 99.0, 38.0, 92.0, 'nurse_sarah', NOW() - INTERVAL '7 hours 15 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Throbbing right ear pain, hearing muffled, low fever x 2 days',
        '{"ent": {"ear_pain": true, "tympanic_bulge": true}}', 34, 'MODERATE', false, NULL, 0.93,
        '{"model_version": "v2.1", "latency_ms": 22, "top_risk_drivers": [{"feature": "Acute Otic Inflammation", "contribution_percent": 18, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '7 hours 15 min');

    -- Patient 32: Moderate Allergic Urticaria without airway signs (Score 46)
    p_id := 'a1000032-0000-4000-8000-000000000032'::uuid;
    v_id := 'b1000032-0000-4000-8000-000000000032'::uuid;
    a_id := 'c1000032-0000-4000-8000-000000000032'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-184031', pgp_sym_encrypt('Kavitha Manoharan', 'medi_ai_secret_key'), '1986-09-14', 'FEMALE', 'ta', NOW() - INTERVAL '7 hours 30 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 88, 16, 122, 78, 98.0, 36.9, 98.0, 'nurse_kavitha', NOW() - INTERVAL '7 hours 30 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Generalized itchy hives across trunk and limbs, normal breathing, no tongue or lip swelling',
        '{"allergic": {"urticaria": true, "stridor": false, "angioedema": false}}', 46, 'MODERATE', false, NULL, 0.95,
        '{"model_version": "v2.1", "latency_ms": 25, "top_risk_drivers": [{"feature": "Generalized Urticaria", "contribution_percent": 26, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '7 hours 30 min');

    -- Patient 33: Simple Rib Contusion post blunt trauma (Score 45)
    p_id := 'a1000033-0000-4000-8000-000000000033'::uuid;
    v_id := 'b1000033-0000-4000-8000-000000000033'::uuid;
    a_id := 'c1000033-0000-4000-8000-000000000033'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-295142', pgp_sym_encrypt('Subramaniyan C.', 'medi_ai_secret_key'), '1967-04-03', 'MALE', 'en', NOW() - INTERVAL '7 hours 45 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 84, 18, 132, 80, 97.0, 36.7, 110.0, 'nurse_sarah', NOW() - INTERVAL '7 hours 45 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Lateral chest wall pain exacerbated by deep inspiration, no crepitus, clear air entry bilaterally',
        '{"trauma": {"chest_pain_pleuritic": true, "sp02": 97}}', 45, 'MODERATE', false, NULL, 0.91,
        '{"model_version": "v2.1", "latency_ms": 26, "top_risk_drivers": [{"feature": "Traumatic Chest Wall Contusion", "contribution_percent": 24, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '7 hours 45 min');

    -- Patient 34: Uncomplicated Perianal Abscess (Score 55)
    p_id := 'a1000034-0000-4000-8000-000000000034'::uuid;
    v_id := 'b1000034-0000-4000-8000-000000000034'::uuid;
    a_id := 'c1000034-0000-4000-8000-000000000034'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-306253', pgp_sym_encrypt('Ganesan K.', 'medi_ai_secret_key'), '1979-12-25', 'MALE', 'ta', NOW() - INTERVAL '8 hours');
    INSERT INTO vital_signs VALUES (v_id, p_id, 96, 18, 136, 84, 98.0, 38.2, 116.0, 'nurse_kavitha', NOW() - INTERVAL '8 hours');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Painful tender fluctuant perianal swelling, unable to sit comfortably, fever x 2 days',
        '{"surgery": {"abscess": true, "fluctuant": true}}', 55, 'MODERATE', false, NULL, 0.92,
        '{"model_version": "v2.1", "latency_ms": 27, "top_risk_drivers": [{"feature": "Perianal Abscess Induration", "contribution_percent": 32, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '8 hours');

    -- Patient 35: Acute Gout Flare in 1st MTP Joint (Score 40)
    p_id := 'a1000035-0000-4000-8000-000000000035'::uuid;
    v_id := 'b1000035-0000-4000-8000-000000000035'::uuid;
    a_id := 'c1000035-0000-4000-8000-000000000035'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-417364', pgp_sym_encrypt('Chandrasekaran V.', 'medi_ai_secret_key'), '1960-03-18', 'MALE', 'en', NOW() - INTERVAL '8 hours 15 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 86, 16, 144, 90, 98.0, 37.3, 128.0, 'nurse_sarah', NOW() - INTERVAL '8 hours 15 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Excruciating pain and redness in right big toe, cannot bear weight or tolerate bedsheet',
        '{"rheum": {"monoarthritis": true, "joint": "1st_mtp"}}', 40, 'MODERATE', false, NULL, 0.94,
        '{"model_version": "v2.1", "latency_ms": 23, "top_risk_drivers": [{"feature": "Podagra Gout Monoarthritis", "contribution_percent": 25, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '8 hours 15 min');

    -- Patient 36: Moderate Asthma Overridden to Low after nebulization (Score 58)
    p_id := 'a1000036-0000-4000-8000-000000000036'::uuid;
    v_id := 'b1000036-0000-4000-8000-000000000036'::uuid;
    a_id := 'c1000036-0000-4000-8000-000000000036'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-528475', pgp_sym_encrypt('Anandhi Natarajan', 'medi_ai_secret_key'), '1996-01-27', 'FEMALE', 'ta', NOW() - INTERVAL '8 hours 30 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 102, 22, 126, 80, 95.0, 36.8, 98.0, 'nurse_kavitha', NOW() - INTERVAL '8 hours 30 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Mild to moderate wheezing after dust exposure, speaking in phrases',
        '{"respiratory": {"wheeze": true}}', 58, 'MODERATE', false, NULL, 0.91,
        '{"model_version": "v2.1", "latency_ms": 28, "top_risk_drivers": [{"feature": "Moderate Wheeze", "contribution_percent": 30, "direction": "positive"}]}',
        'OVERRIDDEN', NOW() - INTERVAL '8 hours 30 min');

    -- Overridden record for Patient 36
    INSERT INTO triage_reviews (id, assessment_id, doctor_id, original_category, final_category, override_reason, clinical_notes, reviewed_at)
    VALUES ('d1000036-0000-4000-8000-000000000036'::uuid, a_id, doc_id, 'MODERATE', 'LOW',
        'Patient showed rapid symptomatic resolution after single dose of Salbutamol nebulizer. SpO2 improved to 99%.',
        'Cleared for outpatient clinic review with inhaler technique education.', NOW() - INTERVAL '8 hours');

    -- Patient 37: Acute Uncomplicated Pharyngotonsillitis (Score 36)
    p_id := 'a1000037-0000-4000-8000-000000000037'::uuid;
    v_id := 'b1000037-0000-4000-8000-000000000037'::uuid;
    a_id := 'c1000037-0000-4000-8000-000000000037'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-639586', pgp_sym_encrypt('Sathish Kumar R.', 'medi_ai_secret_key'), '2002-10-11', 'MALE', 'en', NOW() - INTERVAL '8 hours 45 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 86, 16, 118, 76, 99.0, 38.3, 90.0, 'nurse_sarah', NOW() - INTERVAL '8 hours 45 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Severe sore throat, painful swallowing, tonsillar exudates, anterior cervical adenopathy',
        '{"ent": {"tonsillar_exudate": true, "adenopathy": true}}', 36, 'MODERATE', false, NULL, 0.95,
        '{"model_version": "v2.1", "latency_ms": 22, "top_risk_drivers": [{"feature": "Centor Sore Throat Criteria", "contribution_percent": 22, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '8 hours 45 min');

    -- Patient 38: Acute Ankle Sprain Grade II with swelling (Score 32)
    p_id := 'a1000038-0000-4000-8000-000000000038'::uuid;
    v_id := 'b1000038-0000-4000-8000-000000000038'::uuid;
    a_id := 'c1000038-0000-4000-8000-000000000038'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-740697', pgp_sym_encrypt('Uma Maheswari', 'medi_ai_secret_key'), '1994-04-19', 'FEMALE', 'ta', NOW() - INTERVAL '9 hours');
    INSERT INTO vital_signs VALUES (v_id, p_id, 76, 14, 114, 72, 99.0, 36.8, 88.0, 'nurse_kavitha', NOW() - INTERVAL '9 hours');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Twisted left ankle during badminton, moderate lateral malleolar swelling, Ottawa ankle negative',
        '{"ortho": {"joint_sprain": true, "weight_bearing": true}}', 32, 'MODERATE', false, NULL, 0.97,
        '{"model_version": "v2.1", "latency_ms": 21, "top_risk_drivers": [{"feature": "Lateral Ligament Sprain", "contribution_percent": 18, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '9 hours');

    -- ==========================================================================
    -- PATIENTS 39–50: LOW PRIORITY (P4 - Score 0-29, Routine 120 min)
    -- ==========================================================================

    -- Patient 39: Minor Superficial Finger Laceration (Score 18)
    p_id := 'a1000039-0000-4000-8000-000000000039'::uuid;
    v_id := 'b1000039-0000-4000-8000-000000000039'::uuid;
    a_id := 'c1000039-0000-4000-8000-000000000039'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-851708', pgp_sym_encrypt('Hariharan V.', 'medi_ai_secret_key'), '1997-08-04', 'MALE', 'en', NOW() - INTERVAL '9 hours 15 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 72, 14, 118, 76, 99.0, 36.6, 95.0, 'nurse_sarah', NOW() - INTERVAL '9 hours 15 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, '1.5 cm superficial kitchen knife cut on left index finger, bleeding controlled with pressure',
        '{"trauma": {"laceration_cm": 1.5, "arterial_bleed": false}}', 18, 'LOW', false, NULL, 0.98,
        '{"model_version": "v2.1", "latency_ms": 20, "top_risk_drivers": [{"feature": "Minor Superficial Laceration", "contribution_percent": 12, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '9 hours 15 min');

    -- Patient 40: Common Cold / Upper Respiratory Tract Infection (Score 14)
    p_id := 'a1000040-0000-4000-8000-000000000040'::uuid;
    v_id := 'b1000040-0000-4000-8000-000000000040'::uuid;
    a_id := 'c1000040-0000-4000-8000-000000000040'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-962819', pgp_sym_encrypt('Nalini Krishnan', 'medi_ai_secret_key'), '1985-05-23', 'FEMALE', 'ta', NOW() - INTERVAL '9 hours 30 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 74, 14, 112, 70, 99.0, 37.1, 92.0, 'nurse_kavitha', NOW() - INTERVAL '9 hours 30 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Clear rhinorrhea, nasal congestion, mild dry tickly cough x 3 days, no breathing difficulty',
        '{"ent": {"rhinorrhea": true, "congestion": true}}', 14, 'LOW', false, NULL, 0.99,
        '{"model_version": "v2.1", "latency_ms": 19, "top_risk_drivers": [{"feature": "Mild Viral Coryza", "contribution_percent": 10, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '9 hours 30 min');

    -- Patient 41: Chronic Mechanical Low Back Pain (Score 22)
    p_id := 'a1000041-0000-4000-8000-000000000041'::uuid;
    v_id := 'b1000041-0000-4000-8000-000000000041'::uuid;
    a_id := 'c1000041-0000-4000-8000-000000000041'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-173920', pgp_sym_encrypt('Shanmugam P.', 'medi_ai_secret_key'), '1966-02-14', 'MALE', 'en', NOW() - INTERVAL '9 hours 45 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 76, 14, 126, 80, 98.0, 36.7, 108.0, 'nurse_sarah', NOW() - INTERVAL '9 hours 45 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Dull lumbar ache after lifting furniture, no radicular symptoms, no bowel/bladder changes',
        '{"msk": {"back_pain": true, "red_flags": false}}', 22, 'LOW', false, NULL, 0.97,
        '{"model_version": "v2.1", "latency_ms": 21, "top_risk_drivers": [{"feature": "Mechanical Muscular Strain", "contribution_percent": 14, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '9 hours 45 min');

    -- Patient 42: Suture Removal Request (Score 5)
    p_id := 'a1000042-0000-4000-8000-000000000042'::uuid;
    v_id := 'b1000042-0000-4000-8000-000000000042'::uuid;
    a_id := 'c1000042-0000-4000-8000-000000000042'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-284031', pgp_sym_encrypt('Preethi Varadhan', 'medi_ai_secret_key'), '2001-11-03', 'FEMALE', 'ta', NOW() - INTERVAL '10 hours');
    INSERT INTO vital_signs VALUES (v_id, p_id, 68, 14, 110, 70, 100.0, 36.5, 88.0, 'nurse_kavitha', NOW() - INTERVAL '10 hours');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Routine removal of 4 non-absorbable scalp sutures placed 10 days ago, wound clean and dry',
        '{"procedure": {"suture_removal": true}}', 5, 'LOW', false, NULL, 0.99,
        '{"model_version": "v2.1", "latency_ms": 18, "top_risk_drivers": [{"feature": "Elective Minor Procedure", "contribution_percent": 4, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '10 hours');

    -- Patient 43: Minor Contact Dermatitis (Score 16)
    p_id := 'a1000043-0000-4000-8000-000000000043'::uuid;
    v_id := 'b1000043-0000-4000-8000-000000000043'::uuid;
    a_id := 'c1000043-0000-4000-8000-000000000043'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-395142', pgp_sym_encrypt('Venkatesan R.', 'medi_ai_secret_key'), '1980-07-29', 'MALE', 'en', NOW() - INTERVAL '10 hours 15 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 74, 14, 122, 76, 98.0, 36.6, 94.0, 'nurse_sarah', NOW() - INTERVAL '10 hours 15 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Itchy rash under metal wrist watch strap, mild localized redness, no blistering',
        '{"dermatology": {"contact_dermatitis": true}}', 16, 'LOW', false, NULL, 0.98,
        '{"model_version": "v2.1", "latency_ms": 19, "top_risk_drivers": [{"feature": "Localized Nickel Dermatitis", "contribution_percent": 11, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '10 hours 15 min');

    -- Patient 44: Routine Antihypertensive Prescription Refill Inquiry (Score 8)
    p_id := 'a1000044-0000-4000-8000-000000000044'::uuid;
    v_id := 'b1000044-0000-4000-8000-000000000044'::uuid;
    a_id := 'c1000044-0000-4000-8000-000000000044'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-406253', pgp_sym_encrypt('Kamala Kannan', 'medi_ai_secret_key'), '1954-12-16', 'FEMALE', 'ta', NOW() - INTERVAL '10 hours 30 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 72, 14, 128, 80, 98.0, 36.7, 114.0, 'nurse_kavitha', NOW() - INTERVAL '10 hours 30 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Ran out of regular Amlodipine pills over weekend, requesting medication reconciliation check',
        '{"administrative": {"rx_refill": true}}', 8, 'LOW', false, NULL, 0.99,
        '{"model_version": "v2.1", "latency_ms": 17, "top_risk_drivers": [{"feature": "Asymptomatic Medication Reconciliation", "contribution_percent": 5, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '10 hours 30 min');

    -- Patient 45: Minor Toe Stub Contusion (Score 12)
    p_id := 'a1000045-0000-4000-8000-000000000045'::uuid;
    v_id := 'b1000045-0000-4000-8000-000000000045'::uuid;
    a_id := 'c1000045-0000-4000-8000-000000000045'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-517364', pgp_sym_encrypt('Ashwin Raj', 'medi_ai_secret_key'), '2005-09-01', 'MALE', 'en', NOW() - INTERVAL '10 hours 45 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 70, 12, 114, 72, 100.0, 36.6, 86.0, 'nurse_sarah', NOW() - INTERVAL '10 hours 45 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Stubbed right 3rd toe against chair leg, minor bruising, can wiggle toe and walk normally',
        '{"ortho": {"toe_contusion": true, "no_deformity": true}}', 12, 'LOW', false, NULL, 0.98,
        '{"model_version": "v2.1", "latency_ms": 18, "top_risk_drivers": [{"feature": "Minor Digit Contusion", "contribution_percent": 8, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '10 hours 45 min');

    -- Patient 46: Mild Aphthous Mouth Ulcer (Score 10)
    p_id := 'a1000046-0000-4000-8000-000000000046'::uuid;
    v_id := 'b1000046-0000-4000-8000-000000000046'::uuid;
    a_id := 'c1000046-0000-4000-8000-000000000046'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-628475', pgp_sym_encrypt('Swathi Ramesh', 'medi_ai_secret_key'), '1998-06-12', 'FEMALE', 'ta', NOW() - INTERVAL '11 hours');
    INSERT INTO vital_signs VALUES (v_id, p_id, 68, 12, 108, 68, 99.0, 36.5, 90.0, 'nurse_kavitha', NOW() - INTERVAL '11 hours');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Painful small canker sore on inside of lower lip, stinging when eating spicy food',
        '{"oral": {"aphthous_ulcer": true}}', 10, 'LOW', false, NULL, 0.99,
        '{"model_version": "v2.1", "latency_ms": 17, "top_risk_drivers": [{"feature": "Benign Aphthous Ulcer", "contribution_percent": 6, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '11 hours');

    -- Patient 47: Mild Sunburn on shoulders (Score 15)
    p_id := 'a1000047-0000-4000-8000-000000000047'::uuid;
    v_id := 'b1000047-0000-4000-8000-000000000047'::uuid;
    a_id := 'c1000047-0000-4000-8000-000000000047'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-739586', pgp_sym_encrypt('Madan Lal', 'medi_ai_secret_key'), '2003-01-25', 'MALE', 'en', NOW() - INTERVAL '11 hours 15 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 74, 14, 116, 74, 99.0, 37.0, 96.0, 'nurse_sarah', NOW() - INTERVAL '11 hours 15 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Sunburn redness over shoulders after beach outing, mild peeling, no systemic chills or blisters',
        '{"dermatology": {"first_degree_sunburn": true}}', 15, 'LOW', false, NULL, 0.98,
        '{"model_version": "v2.1", "latency_ms": 19, "top_risk_drivers": [{"feature": "Superficial Sunburn Erythema", "contribution_percent": 9, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '11 hours 15 min');

    -- Patient 48: Subungual Splinter Removal (Score 7)
    p_id := 'a1000048-0000-4000-8000-000000000048'::uuid;
    v_id := 'b1000048-0000-4000-8000-000000000048'::uuid;
    a_id := 'c1000048-0000-4000-8000-000000000048'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-840697', pgp_sym_encrypt('Selvi Marimuthu', 'medi_ai_secret_key'), '1973-04-14', 'FEMALE', 'ta', NOW() - INTERVAL '11 hours 30 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 70, 14, 120, 76, 99.0, 36.6, 92.0, 'nurse_kavitha', NOW() - INTERVAL '11 hours 30 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Small wooden splinter under distal right thumb nail, localized tenderness, request removal',
        '{"foreign_body": {"subungual_splinter": true}}', 7, 'LOW', false, NULL, 0.99,
        '{"model_version": "v2.1", "latency_ms": 18, "top_risk_drivers": [{"feature": "Subungual Foreign Body", "contribution_percent": 5, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '11 hours 30 min');

    -- Patient 49: Asymptomatic Ring Stuck on Finger (Score 11)
    p_id := 'a1000049-0000-4000-8000-000000000049'::uuid;
    v_id := 'b1000049-0000-4000-8000-000000000049'::uuid;
    a_id := 'c1000049-0000-4000-8000-000000000049'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-951708', pgp_sym_encrypt('Vigneshwaran K.', 'medi_ai_secret_key'), '1992-10-30', 'MALE', 'en', NOW() - INTERVAL '11 hours 45 min');
    INSERT INTO vital_signs VALUES (v_id, p_id, 72, 14, 118, 74, 99.0, 36.6, 98.0, 'nurse_sarah', NOW() - INTERVAL '11 hours 45 min');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Wedding ring stuck on left ring finger due to warm weather swelling, good distal capillary refill',
        '{"device": {"ring_incarceration": true, "perfusion_intact": true}}', 11, 'LOW', false, NULL, 0.98,
        '{"model_version": "v2.1", "latency_ms": 18, "top_risk_drivers": [{"feature": "Intact Capillary Perfusion", "contribution_percent": 7, "direction": "positive"}]}',
        'PENDING_REVIEW', NOW() - INTERVAL '11 hours 45 min');

    -- Patient 50: Post-Viral Asthenia / Fatigue checkup (Score 20)
    p_id := 'a1000050-0000-4000-8000-000000000050'::uuid;
    v_id := 'b1000050-0000-4000-8000-000000000050'::uuid;
    a_id := 'c1000050-0000-4000-8000-000000000050'::uuid;
    INSERT INTO patients VALUES (p_id, 'MRN-062819', pgp_sym_encrypt('Vijayalakshmi S.', 'medi_ai_secret_key'), '1981-08-08', 'FEMALE', 'ta', NOW() - INTERVAL '12 hours');
    INSERT INTO vital_signs VALUES (v_id, p_id, 76, 14, 112, 70, 99.0, 36.7, 94.0, 'nurse_kavitha', NOW() - INTERVAL '12 hours');
    INSERT INTO triage_assessments VALUES (a_id, p_id, v_id, 'Lingering fatigue and tiredness 1 week after mild viral fever, vitals stable, normal hydration',
        '{"general": {"post_viral_fatigue": true}}', 20, 'LOW', false, NULL, 0.96,
        '{"model_version": "v2.1", "latency_ms": 20, "top_risk_drivers": [{"feature": "Post-Viral Convalescence", "contribution_percent": 12, "direction": "positive"}]}',
        'CONFIRMED', NOW() - INTERVAL '12 hours');

    -- ==========================================================================
    -- POPULATE IMMUTABLE AUDIT LOG (Zero PHI Mandate)
    -- ==========================================================================
    INSERT INTO triage_audit_log (event_type, user_id, patient_id, ip_address, user_agent, payload, created_at)
    VALUES
        ('TRIAGE_SYSTEM_INIT', NULL, NULL, '127.0.0.1'::inet, 'MediAI-Server-Seed', '{"action": "database_seed_50_cases", "batch_size": 50}', NOW() - INTERVAL '12 hours'),
        ('PATIENT_INTAKE_SUBMITTED', nurse_id, 'a1000001-0000-4000-8000-000000000001'::uuid, '127.0.0.1'::inet, 'MediAI-Nurse-Client', '{"mrn_hash": "MRN-849201", "risk_score": 96, "category": "CRITICAL", "red_flag": true}', NOW() - INTERVAL '24 minutes'),
        ('TRIAGE_CATEGORY_OVERRIDDEN', doc_id, 'a1000036-0000-4000-8000-000000000036'::uuid, '127.0.0.1'::inet, 'MediAI-Doctor-Client', '{"original_category": "MODERATE", "final_category": "LOW", "is_overridden": true, "reason": "Nebulization response"}', NOW() - INTERVAL '8 hours'),
        ('TRIAGE_ASSESSMENT_CONFIRMED', doc_id, 'a1000004-0000-4000-8000-000000000004'::uuid, '127.0.0.1'::inet, 'MediAI-Doctor-Client', '{"original_category": "CRITICAL", "final_category": "CRITICAL", "is_overridden": false}', NOW() - INTERVAL '55 minutes');

END $$;

-- Verify Record Counts
SELECT 'patients' AS table_name, COUNT(*) AS total_rows FROM patients
UNION ALL
SELECT 'vital_signs', COUNT(*) FROM vital_signs
UNION ALL
SELECT 'triage_assessments', COUNT(*) FROM triage_assessments
UNION ALL
SELECT 'triage_reviews', COUNT(*) FROM triage_reviews
UNION ALL
SELECT 'triage_audit_log', COUNT(*) FROM triage_audit_log;
