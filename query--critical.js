const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('docs/medi_ai_database_50.sqlite');

const critical = db.prepare(`
  SELECT p.name, p.mrn_hash,
         a.calculated_risk_score,
         a.calculated_category,
         a.chief_complaint
  FROM patients p
  JOIN triage_assessments a ON p.id = a.patient_id
  WHERE a.calculated_category = 'CRITICAL'
`).all();

console.log(critical);
db.close();