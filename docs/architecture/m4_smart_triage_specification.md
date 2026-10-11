# MediAI Module M4: Smart Triage, Safety Rules & Alerts Specification

## 1. Clinical Safety Boundary & Invariant
MediAI is an AI-assisted clinical decision-support prototype. It does not independently diagnose, prescribe, calculate drug dosages, or replace licensed medical judgment.

### Master Safety Invariants:
1. **Deterministic Rule Supremacy:** Deterministic physiological red-flag rules **always** override machine learning or heuristic scoring. If a Tier-1 red flag matches, ML is completely bypassed, acuity category is forced to `CRITICAL` (Priority 1), numeric risk score is set to `100`, and maximum physician evaluation time is `0 min` (immediate resuscitation bay allocation).
2. **Never Loosen a Rule:** Safety thresholds are strictly one-way fail-safe. Missing or null inputs never suppress other independent rules.
3. **Pure Function Safety Engine:** The red-flag engine (`evaluateClinicalRedFlags`) is a pure function: zero I/O, zero database access, zero network calls, zero ML imports, and zero Gemini calls.
4. **Alert Failure Isolation:** Downstream notification or pager gateway failures never block assessment persistence, database transactions, or triage queue entry.
5. **Fail-Closed Error Protocol:** If an unexpected internal error occurs during safety evaluation, the system returns a safe failure error response and never emits an unearned LOW or MODERATE acuity score.

---

## 2. Deterministic 12-Domain Red-Flag Rules

Each domain evaluates independently on whatever data is present.

| Domain # | Domain Name | Trigger Conditions & Exact Operators | Stable Rule Code |
|:---|:---|:---|:---|
| **1** | General Infections & Sepsis | qSOFA $\ge 2$ of {$\text{RR} \ge 22\text{ bpm}$, $\text{SBP} \le 100\text{ mmHg}$, altered mentation}; OR core temp $< 35.0^\circ\text{C}$; OR core temp $> 40.0^\circ\text{C}$ | `SEPSIS_QSOFA_GE_2`<br>`SEPSIS_TEMP_LT_35`<br>`SEPSIS_TEMP_GT_40` |
| **2** | Respiratory Warning Signs | $\text{SpO}_2 < 90\%$ room air; OR clinical cyanosis; OR audible stridor; OR $\text{RR} > 32$ or $< 8\text{ bpm}$ | `RESP_SPO2_LT_90`<br>`RESP_CYANOSIS`<br>`RESP_STRIDOR`<br>`RESP_RR_EXTREME_HIGH`<br>`RESP_RR_EXTREME_LOW` |
| **3** | Cardiac Warning Signs | Crushing retrosternal pain radiating to jaw/left arm/both arms; OR syncope WITH chest pressure; OR $\text{HR} > 150$ or $< 40\text{ bpm}$ | `CARD_ACS_RADIATING`<br>`CARD_SYNCOPE_CHEST_PRESSURE`<br>`CARD_HR_EXTREME_HIGH`<br>`CARD_HR_EXTREME_LOW` |
| **4** | Neurological Warning Signs | Acute focal deficit (FAST: facial droop, arm drift, slurred speech); OR $\text{GCS} < 12$; OR active/recurrent seizures (status epilepticus) | `NEURO_FAST_DEFICIT`<br>`NEURO_GCS_LT_12`<br>`NEURO_STATUS_EPILEPTICUS` |
| **5** | Blood Pressure Abnormalities | ($\text{SBP} > 180$ OR $\text{DBP} > 120\text{ mmHg}$) WITH headache or chest pain; OR $\text{SBP} < 85\text{ mmHg}$ (profound shock) | `BP_CRISIS_WITH_SYMPTOMS`<br>`BP_SHOCK_SBP_LT_85` |
| **6** | Diabetes-Related Risks | $\text{CBG} < 60\text{ mg/dL}$ WITH altered consciousness; OR $\text{CBG} > 400\text{ mg/dL}$ WITH ketotic/Kussmaul breathing | `DIAB_HYPO_ALTERED`<br>`DIAB_HYPER_KETOTIC` |
| **7** | Gastrointestinal Issues | Massive hematemesis; OR involuntary guarding / peritoneal rigidity; OR melena with hemodynamic instability ($\text{SBP} < 90$ or $\text{HR} > 110$) | `GI_HEMATEMESIS`<br>`GI_PERITONISM`<br>`GI_MELENA_INSTABILITY` |
| **8** | Injury & Trauma | Pulsatile arterial hemorrhage; flail chest; suspected acute spinal cord injury; traumatic amputation; acute airway obstruction | `TRAUMA_PULSATILE_BLEED`<br>`TRAUMA_FLAIL_CHEST`<br>`TRAUMA_SPINAL_CORD`<br>`TRAUMA_AMPUTATION`<br>`TRAUMA_AIRWAY_OBSTRUCTED` |
| **9** | Pregnancy-Related Risks | Late pregnancy ($> 20\text{ wks}$) WITH vaginal hemorrhage; severe epigastric pain/headache WITH visual aura (pre-eclampsia); eclamptic convulsions | `PREG_HEMORRHAGE_THIRD_TRIMESTER`<br>`PREG_PREECLAMPSIA_AURA`<br>`PREG_ECLAMPSIA_SEIZURE` |
| **10** | Allergic Reactions | Angioedema of tongue/pharynx WITH voice change or stridor; acute stridor with allergy signs; wheezing WITH systemic hypotension ($\text{SBP} < 90$) | `ALLERGY_ANGIOEDEMA_AIRWAY`<br>`ALLERGY_STRIDOR`<br>`ALLERGY_WHEEZE_HYPOTENSION` |
| **11** | Dehydration & Fluid Balance | Anuria $> 12\text{ h}$; severe skin tenting; cold extremities WITH capillary refill $> 4\text{ s}$ | `DEHYD_ANURIA_12H`<br>`DEHYD_TENTING_SEVERE`<br>`DEHYD_COLD_EXTREMITIES_CAP_REFILL` |
| **12** | Multi-System / Toxic Exposure | Organophosphate (SLUDGE) signs (excessive salivation + pinpoint pupils); venomous puncture bite WITH ptosis or descending paralysis | `TOXIC_SLUDGE`<br>`TOXIC_BITE_PTOSIS` |

---

## 3. Standalone Cross-Category Vital Emergency Baselines

| Vital Sign | Critical Trigger (Tier-1 P1) | Warning Band (UI Alert Only) | Normal Adult Range | Stable Rule Code |
|:---|:---|:---|:---|:---|
| **Heart Rate (HR)** | $< 40$ or $> 150\text{ bpm}$ | $40\text{--}49$ or $110\text{--}149\text{ bpm}$ | $50\text{--}100\text{ bpm}$ | `VITAL_HR_CRITICAL_LOW`<br>`VITAL_HR_CRITICAL_HIGH` |
| **Respiratory Rate (RR)** | $< 8$ or $> 32\text{ bpm}$ | $22\text{--}32\text{ bpm}$ | $12\text{--}20\text{ bpm}$ | `VITAL_RR_CRITICAL_LOW`<br>`VITAL_RR_CRITICAL_HIGH` |
| **Systolic BP (SBP)** | $< 85$ or $> 180\text{ mmHg}$ | $85\text{--}89$ or $140\text{--}179\text{ mmHg}$ | $90\text{--}120\text{ mmHg}$ | `VITAL_SBP_CRITICAL_LOW`<br>`VITAL_SBP_CRITICAL_HIGH` |
| **Diastolic BP (DBP)** | $> 120\text{ mmHg}$ | $90\text{--}119\text{ mmHg}$ | $60\text{--}80\text{ mmHg}$ | `VITAL_DBP_CRITICAL_HIGH` |
| **Oxygen Saturation ($\text{SpO}_2$)** | $< 90\%$ room air | $90\text{--}93\%$ | $95\text{--}100\%$ | `VITAL_SPO2_CRITICAL_LOW` |
| **Core Temperature** | $< 35.0$ or $> 40.0^\circ\text{C}$ | $35.0\text{--}35.9$ or $38.3\text{--}39.9^\circ\text{C}$ | $36.5\text{--}37.5^\circ\text{C}$ | `VITAL_TEMP_CRITICAL_LOW`<br>`VITAL_TEMP_CRITICAL_HIGH` |
| **Capillary Glucose (CBG)** | $< 60$ or $> 400\text{ mg/dL}$ | $60\text{--}69$ or $200\text{--}399\text{ mg/dL}$ | $70\text{--}140\text{ mg/dL}$ | `VITAL_CBG_CRITICAL_LOW`<br>`VITAL_CBG_CRITICAL_HIGH` |

---

## 4. Priority Stratification & Clinical Response Window

| Priority | Acuity Category | Score Band | Max Response Time | Clinical Disposition |
|:---|:---|:---|:---|:---|
| **P1** | `CRITICAL` | $85\text{--}100$ | **$0\text{ min}$** (Immediate) | Resuscitation bay, immediate attending physician evaluation |
| **P2** | `HIGH` | $60\text{--}84$ | **$15\text{--}30\text{ min}$** | Emergent bed, continuous vital sign monitoring |
| **P3** | `MODERATE` | $30\text{--}59$ | **$\le 60\text{ min}$** | Acute evaluation area, diagnostic workup |
| **P4** | `LOW` | $0\text{--}29$ | **$\le 120\text{ min}$** | Ambulatory sub-acute waiting zone, routine queue |

---

## 5. Master API Routes

### 1. `POST /api/v1/triage/assess`
- **RBAC:** Authenticated clinical staff or valid intake session token.
- **Workflow:**
  1. Input validation matching DB check constraints.
  2. Deterministic red-flag safety pre-check runs **first**.
  3. Red flag triggered $\to$ forced `CRITICAL` / score `100`, ML bypassed, persistent into queue, audit event recorded, emergency alert dispatched.
  4. No red flag $\to$ calls M3 prediction service (or mock). Missing essential vitals ($\text{SpO}_2$, SBP, HR) flags confidence as `LOW`.

### 2. `GET /api/v1/doctor/queue?status=PENDING_REVIEW`
- **RBAC:** Emergency Doctor, Triage Nurse, or Administrator.
- **Sorting:** P1 Critical / Red Flags first $\to$ Acuity tier ($\text{P1} > \text{P2} > \text{P3} > \text{P4}$) $\to$ Risk score DESC $\to$ Timestamp DESC.
- **Zero-PHI Mandate:** Administrators receive masked patient identifiers.

### 3. `POST /api/v1/doctor/override`
- **RBAC:** Attending Doctor **only** (Nurses and non-physicians rejected with HTTP 403).
- **Validation:** Downgrading a Tier-1 Critical case requires mandatory clinical justification of at least 15 characters.
- **Audit:** Records immutable audit block with original and final acuity categories.
