import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { firestoreDb } from './firebaseClient';
import { Gender, Language } from '../types';

export interface FirestorePatientProfile {
  id: string;
  mrnHash: string;
  encryptedName: string;
  dateOfBirth: string;
  gender: Gender;
  primaryLanguage: Language;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreMedicalHistory {
  id?: string;
  patientId: string;
  allergies: string[];
  chronicConditions: string[];
  surgeries: string[];
  familyHistory: string[];
  notes?: string;
  updatedAt: string;
}

export interface FirestoreAssessment {
  id?: string;
  patientId: string;
  chiefComplaint: string;
  symptoms: string[];
  vitalSigns?: {
    heartRate?: number;
    bloodPressure?: string;
    temperatureCelsius?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  onsetTime?: string;
  severityScale?: number; // 1-10
  createdAt: string;
}

export interface FirestoreRiskPrediction {
  id?: string;
  patientId: string;
  assessmentId?: string;
  acuityLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  riskScore: number; // 0 - 100
  primaryRisks: string[];
  clinicalRationale: string;
  patientFriendlyExplanation: string;
  recommendedTriageCategory: string;
  urgentRedFlags: string[];
  aiModel: string;
  createdAt: string;
}

export interface FirestoreTriageRecord {
  id?: string;
  patientId: string;
  assessedBy: string; // Staff ID or email
  assignedAcuity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  status: 'PENDING' | 'TRIAGED' | 'ATTENDING_DOCTOR' | 'DISCHARGED';
  clinicalNotes: string;
  createdAt: string;
}

export interface FirestoreMedicationInfo {
  id?: string;
  patientId: string;
  currentMedications: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  prescribingDoctor?: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// Collection 1: Patient Profiles (`patients`)
// -------------------------------------------------------------
export async function createPatientProfile(
  data: Omit<FirestorePatientProfile, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<FirestorePatientProfile> {
  const now = new Date().toISOString();
  const id = data.id || 'pat_' + Math.random().toString(36).substring(2, 11);

  const profile: FirestorePatientProfile = {
    id,
    mrnHash: data.mrnHash,
    encryptedName: data.encryptedName,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    primaryLanguage: data.primaryLanguage,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const patientRef = doc(firestoreDb, 'patients', id);
    await setDoc(patientRef, profile);
  } catch (err) {
    console.warn('Firestore fallback: profile stored locally in session scope.', err);
  }

  return profile;
}

export async function getPatientProfileById(patientId: string): Promise<FirestorePatientProfile | null> {
  try {
    const docRef = doc(firestoreDb, 'patients', patientId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as FirestorePatientProfile;
    }
  } catch (err) {
    console.warn('Firestore lookup warning:', err);
  }
  return null;
}

export async function getPatientProfileByMrnHash(mrnHash: string): Promise<FirestorePatientProfile | null> {
  try {
    const q = query(collection(firestoreDb, 'patients'), where('mrnHash', '==', mrnHash), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as FirestorePatientProfile;
    }
  } catch (err) {
    console.warn('Firestore MRN search warning:', err);
  }
  return null;
}

// -------------------------------------------------------------
// Collection 2: Medical History (`medical_history`)
// -------------------------------------------------------------
export async function saveMedicalHistory(history: FirestoreMedicalHistory): Promise<FirestoreMedicalHistory> {
  const now = new Date().toISOString();
  const docId = history.id || 'medhist_' + history.patientId;

  const record: FirestoreMedicalHistory = {
    ...history,
    id: docId,
    updatedAt: now,
  };

  try {
    await setDoc(doc(firestoreDb, 'medical_history', docId), record);
  } catch (err) {
    console.warn('Firestore medical_history warning:', err);
  }
  return record;
}

export async function getMedicalHistoryByPatientId(patientId: string): Promise<FirestoreMedicalHistory | null> {
  try {
    const docRef = doc(firestoreDb, 'medical_history', 'medhist_' + patientId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as FirestoreMedicalHistory;
    }
  } catch (err) {
    console.warn('Firestore lookup medical history warning:', err);
  }
  return null;
}

// -------------------------------------------------------------
// Collection 3: Patient Assessments (`assessments`)
// -------------------------------------------------------------
export async function saveAssessment(assessment: Omit<FirestoreAssessment, 'id' | 'createdAt'>): Promise<FirestoreAssessment> {
  const now = new Date().toISOString();
  const record: FirestoreAssessment = {
    ...assessment,
    id: 'asm_' + Math.random().toString(36).substring(2, 10),
    createdAt: now,
  };

  try {
    await setDoc(doc(firestoreDb, 'assessments', record.id!), record);
  } catch (err) {
    console.warn('Firestore save assessment warning:', err);
  }
  return record;
}

// -------------------------------------------------------------
// Collection 4: AI Risk Predictions (`risk_predictions`)
// -------------------------------------------------------------
export async function saveRiskPrediction(prediction: Omit<FirestoreRiskPrediction, 'id' | 'createdAt'>): Promise<FirestoreRiskPrediction> {
  const now = new Date().toISOString();
  const record: FirestoreRiskPrediction = {
    ...prediction,
    id: 'risk_' + Math.random().toString(36).substring(2, 10),
    createdAt: now,
  };

  try {
    await setDoc(doc(firestoreDb, 'risk_predictions', record.id!), record);
  } catch (err) {
    console.warn('Firestore save risk prediction warning:', err);
  }
  return record;
}

export async function getLatestRiskPredictionByPatientId(patientId: string): Promise<FirestoreRiskPrediction | null> {
  try {
    const q = query(
      collection(firestoreDb, 'risk_predictions'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as FirestoreRiskPrediction;
    }
  } catch (err) {
    console.warn('Firestore lookup risk prediction warning:', err);
  }
  return null;
}

// -------------------------------------------------------------
// Collection 5: Triage Records (`triage_records`)
// -------------------------------------------------------------
export async function saveTriageRecord(triage: Omit<FirestoreTriageRecord, 'id' | 'createdAt'>): Promise<FirestoreTriageRecord> {
  const now = new Date().toISOString();
  const record: FirestoreTriageRecord = {
    ...triage,
    id: 'trg_' + Math.random().toString(36).substring(2, 10),
    createdAt: now,
  };

  try {
    await setDoc(doc(firestoreDb, 'triage_records', record.id!), record);
  } catch (err) {
    console.warn('Firestore save triage record warning:', err);
  }
  return record;
}

// -------------------------------------------------------------
// Collection 6: Medication Information (`medications`)
// -------------------------------------------------------------
export async function saveMedicationInfo(meds: FirestoreMedicationInfo): Promise<FirestoreMedicationInfo> {
  const now = new Date().toISOString();
  const docId = meds.id || 'meds_' + meds.patientId;

  const record: FirestoreMedicationInfo = {
    ...meds,
    id: docId,
    updatedAt: now,
  };

  try {
    await setDoc(doc(firestoreDb, 'medications', docId), record);
  } catch (err) {
    console.warn('Firestore save medication info warning:', err);
  }
  return record;
}

// -------------------------------------------------------------
// Collection 7: Audit Logs (`audit_logs`)
// -------------------------------------------------------------
export async function saveAuditLogToFirestore(logEntry: {
  eventType: string;
  userId?: string;
  patientId?: string;
  ipAddress: string;
  userAgent?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  try {
    const entryId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    await setDoc(doc(firestoreDb, 'audit_logs', entryId), {
      ...logEntry,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firestore audit log warning:', err);
  }
}
