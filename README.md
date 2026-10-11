# MediAI — Smart Patient Management, Triage & AI Risk Prediction

Developer: Jesica Jasmine J.  
Git Branch: `feature/m1-patient-auth`  
Module: Patient Management, Authentication & AI Triage Risk Prediction  

## Overview

MediAI is an AI-assisted healthcare triage and emergency risk prediction system. 
It uses **Firebase SDK** for Authentication and **Cloud Firestore** for secure database operations, combined with **Google Gemini API** (`gemini-2.5-flash`) for AI-powered patient risk prediction, symptom analysis, and patient-friendly risk explanations.

## Features Implemented

- **Firebase Authentication & Firestore**: Secure staff and patient authentication, role-based access control (RBAC), and Firestore collections for:
  - `patients` (Demographic profiles and AES-256 encrypted names)
  - `medical_history` (Allergies, chronic conditions, surgeries)
  - `assessments` (Patient chief complaints, symptoms, vital signs)
  - `risk_predictions` (Google Gemini AI risk scores, acuity tiers, clinical rationale)
  - `triage_records` (Triage nurse and attending doctor records)
  - `medications` (Current medications and dosages)
  - `audit_logs` (Immutable append-only audit trail with zero PHI in logs)
- **Google Gemini API Risk Prediction**: AI symptom analysis, acuity level classification (`CRITICAL`, `HIGH`, `MODERATE`, `LOW`), risk score calculation (0-100), clinical rationale, and patient-friendly explanations in English and Tamil.
- **Data Protection & Encryption**: AES-256-GCM encryption for patient names at rest, SHA-256 MRN identifier hashing.
- **Bilingual Engine**: English (`en-US`) and Tamil (`ta-IN`) dynamic language switching.

## Environment Configuration

Environment variables are defined in `.env`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=medi-ai-1bead.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=medi-ai-1bead
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=medi-ai-1bead.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=509645038432
NEXT_PUBLIC_FIREBASE_APP_ID=1:509645038432:web:8591ee6082aeb8e7ecb405
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-J7Y6SD593D

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

> **Security Note**: `GEMINI_API_KEY` is read strictly on the server side in API route `/api/v1/ai/risk-prediction` and is never exposed to client-side code or committed to git (`.env` is ignored in `.gitignore`).

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Run development server:
   ```bash
   npm run dev
   ```
4. Run unit tests:
   ```bash
   npm test
   # Or run doctor workstation tests
   npm run test:doctor
   # Or run M2 health assessment tests
   npm run test:m2
   # Or run all test suites
   npm run test:all
   ```

## Module M5: Doctor Emergency Workstation

- **Emergency Queue (`/doctor/queue`)**: Real-time triage patient queue sorted by clinical acuity priority (Hard Red-Flags first, then CRITICAL > HIGH > MODERATE > LOW).
- **Clinical Review Workspace (`/doctor/review/[id]`)**: Full patient assessment console with vital signs trajectories, explainable AI feature attribution (TreeSHAP), and physician override console with mandatory rationale safeguards.
- **Medication Reconciliation (`/doctor/medications`)**: Clinical history review and reconciliation interface (automated prescribing strictly excluded).
- **Emergency Analytics (`/doctor/analytics`)**: De-identified aggregate throughput, acuity distribution, and clinical concordance metrics.

## Module M2: Health Assessment & Medical History

- **Health Assessment Wizard (`/intake`)**: Multi-step patient intake interface covering chief complaints, symptom details, vital signs capture with validation, medical history, and emergency escalation.
- **Triage Assessment API (`/api/v1/triage/assess`)**: POST endpoint for submitting patient intake assessments, calculating deterministic rule-based triage acuity scores, generating AI clinical rationale and patient explanations, and recording assessments to Firestore.
- **Testing**:
  ```bash
  npm run test:m2
  ```
- **Encapsulated Scope**:
  - `modules/patient_intake/` (components, hooks, services, types, schemas)
  - `app/intake/` (intake page route wrapper)
  - `app/api/v1/triage/assess/` (triage assess route handler)
  - `docs/assumed_schema.sql` (reference DDL)
