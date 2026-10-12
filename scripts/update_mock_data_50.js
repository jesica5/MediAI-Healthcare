const fs = require('fs');
const path = require('path');

const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'seed_data_50.json'), 'utf8'));

// We already have p-101 to p-105 and ast-101 to ast-105.
// Let's inspect them to keep them 100% identical for tests, and add the remaining 45 clinical records.

const existingMockData = fs.readFileSync(path.join(__dirname, '..', 'shared', 'services', 'mockData.ts'), 'utf8');

// Let's create the 45 additional patients, vitals, and assessments from seedData
const additionalPatients = [];
const additionalVitals = [];
const additionalAssessments = [];

// Patients 6 to 50 in seedData:
const remainingPatients = seedData.patients.slice(5);

remainingPatients.forEach((p, idx) => {
  const pId = `p-${106 + idx}`;
  const vId = `v-${106 + idx}`;
  const aId = `ast-${106 + idx}`;

  additionalPatients.push(`  '${pId}': {
    id: '${pId}',
    mrn_hash: '${p.mrn_hash}',
    display_name: 'Patient #${p.mrn_hash.replace('MRN-', '')} (Anonymized)',
    date_of_birth: '${p.date_of_birth}',
    gender: '${p.gender}',
    primary_language: '${p.primary_language}',
    medical_history: ['Clinical observation logged at emergency reception'],
    allergies: ['None documented'],
    created_at: '2026-10-09T22:${String(idx).padStart(2, '0')}:00Z',
    updated_at: '2026-10-09T22:${String(idx).padStart(2, '0')}:00Z',
  },`);

  const v = p.vitals;
  additionalVitals.push(`  '${vId}': {
    id: '${vId}',
    patient_id: '${pId}',
    heart_rate: ${v.heart_rate},
    respiratory_rate: ${v.respiratory_rate},
    systolic_bp: ${v.systolic_bp},
    diastolic_bp: ${v.diastolic_bp},
    oxygen_saturation: ${v.oxygen_saturation},
    temperature_celsius: ${v.temperature_celsius},
    capillary_blood_glucose: ${v.capillary_blood_glucose},
    recorded_by: 'nurse-triage-uuid',
    recorded_at: '2026-10-09T22:${String(idx).padStart(2, '0')}:00Z',
  },`);

  const redFlagsStr = JSON.stringify(p.red_flag_details || []);
  const expStr = JSON.stringify(p.explainability_payload, null, 6);

  additionalAssessments.push(`  {
    id: '${aId}',
    patient_id: '${pId}',
    vital_id: '${vId}',
    chief_complaint: ${JSON.stringify(p.chief_complaint)},
    symptom_vector: ${JSON.stringify(p.symptom_vector || {})},
    calculated_risk_score: ${p.calculated_risk_score},
    calculated_category: '${p.calculated_category}',
    hard_red_flag_triggered: ${p.hard_red_flag_triggered},
    red_flag_details: ${redFlagsStr},
    confidence_score: ${p.confidence_score},
    explainability_payload: ${expStr},
    status: '${p.status}',
    created_at: '2026-10-09T22:${String(idx).padStart(2, '0')}:00Z',
    patient: MOCK_PATIENTS['${pId}'],
    vitals: MOCK_VITALS_CURRENT['${vId}'],
  },`);
});

// Let's replace the closing of MOCK_PATIENTS, MOCK_VITALS_CURRENT, and MOCK_ASSESSMENTS
let updated = existingMockData;

// Replace MOCK_PATIENTS
const patientsCloseRegex = /('p-105':[\s\S]*?\},)(\n\};)/;
updated = updated.replace(patientsCloseRegex, `$1\n${additionalPatients.join('\n')}$2`);

// Replace MOCK_VITALS_CURRENT
const vitalsCloseRegex = /('v-105':[\s\S]*?\},)(\n\};)/;
updated = updated.replace(vitalsCloseRegex, `$1\n${additionalVitals.join('\n')}$2`);

// Replace MOCK_ASSESSMENTS
const assessmentsCloseRegex = /(\{\s*id: 'ast-105'[\s\S]*?\},\s*)(\n\];)/;
updated = updated.replace(assessmentsCloseRegex, `$1\n${additionalAssessments.join('\n')}$2`);

// Update MOCK_METRICS
updated = updated.replace(/pending_review_count: 5,/, 'pending_review_count: 31,');
updated = updated.replace(/critical_count: 2,/, 'critical_count: 10,');
updated = updated.replace(/high_priority_count: 1,/, 'high_priority_count: 15,');
updated = updated.replace(/completed_today_count: 14,/, 'completed_today_count: 19,');

// Update MOCK_ANALYTICS distribution
updated = updated.replace(/category_distribution: \[\s*\{ category: 'CRITICAL', count: \d+[\s\S]*?\],/, 
`category_distribution: [
    { category: 'CRITICAL', count: 10, percentage: 20.0 },
    { category: 'HIGH', count: 15, percentage: 30.0 },
    { category: 'MODERATE', count: 13, percentage: 26.0 },
    { category: 'LOW', count: 12, percentage: 24.0 },
  ],`);

fs.writeFileSync(path.join(__dirname, '..', 'shared', 'services', 'mockData.ts'), updated, 'utf8');
console.log('Successfully updated shared/services/mockData.ts with all 50 patients!');
