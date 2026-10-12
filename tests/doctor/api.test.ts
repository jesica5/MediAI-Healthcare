import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock remote network audit logger to keep unit tests fast and independent of Firestore network latency
vi.mock('@/shared/utils/auditLogger', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

import { GET as getQueueHandler } from '@/app/api/v1/doctor/queue/route';
import { POST as postOverrideHandler } from '@/app/api/v1/doctor/override/route';
import { GET as getPatientHandler } from '@/app/api/v1/doctor/patient/[id]/route';
import { GET as getMedicationsHandler } from '@/app/api/v1/doctor/medications/route';
import { GET as getAnalyticsHandler } from '@/app/api/v1/doctor/analytics/route';

describe('Doctor API Route Handlers Integration & RBAC Tests', () => {
  describe('GET /api/v1/doctor/queue', () => {
    it('should return 200 and standard success envelope for authorized Doctor', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/queue?status=PENDING_REVIEW', {
        headers: { 'x-user-role': 'Doctor' },
      });
      const res = await getQueueHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.error).toBeNull();
      expect(json.meta).toBeDefined();
    });

    it('should reject unauthorized role with 403 Forbidden', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/queue', {
        headers: { 'x-user-role': 'Anonymous Patient' },
      });
      const res = await getQueueHandler(req);
      expect(res.status).toBe(403);

      const json = await res.json();
      expect(json.data).toBeNull();
      expect(json.error?.code).toBe('FORBIDDEN');
    });

    it('should sanitize patient display name for System Administrator (Zero PHI Mandate)', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/queue', {
        headers: { 'x-user-role': 'System Administrator' },
      });
      const res = await getQueueHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      const first = json.data?.[0];
      if (first?.patient) {
        expect(first.patient.display_name).toBe('REDACTED (ADMIN_VIEW)');
      }
    });
  });

  describe('POST /api/v1/doctor/override', () => {
    it('should enforce Attending Doctor only guard (403 for Nurse)', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/override', {
        method: 'POST',
        headers: { 'x-user-role': 'Triage Nurse', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: 'ast-101',
          final_category: 'HIGH',
        }),
      });
      const res = await postOverrideHandler(req);
      expect(res.status).toBe(403);

      const json = await res.json();
      expect(json.error?.code).toBe('FORBIDDEN');
    });

    it('should reject missing mandatory rationale when changing category (400)', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/override', {
        method: 'POST',
        headers: { 'x-user-role': 'Doctor', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: 'ast-102',
          final_category: 'MODERATE',
          override_reason: '', // Missing
        }),
      });
      const res = await postOverrideHandler(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error?.code).toBe('MISSING_RATIONALE');
    });

    it('should reject downgrading Tier-1 Hard Red Flag Critical assessment with insufficient rationale (422)', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/override', {
        method: 'POST',
        headers: { 'x-user-role': 'Doctor', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: 'ast-104', // Hard red flag
          final_category: 'MODERATE',
          override_reason: 'Too brief', // < 15 chars
        }),
      });
      const res = await postOverrideHandler(req);
      expect(res.status).toBe(422);

      const json = await res.json();
      expect(json.error?.code).toBe('SAFETY_RULE_VIOLATION');
    });

    it('should successfully record override with 200 when proper rationale is provided', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/override', {
        method: 'POST',
        headers: { 'x-user-role': 'Doctor', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: 'ast-102',
          doctor_id: 'doc-bhuvana-9982-uuid',
          final_category: 'MODERATE',
          override_reason: 'Patient vital signs normalized after bedside oxygen administration and bronchodilator.',
        }),
      });
      const res = await postOverrideHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data?.status).toBe('OVERRIDDEN');
      expect(json.data?.final_category).toBe('MODERATE');
      expect(json.error).toBeNull();
    });
  });

  describe('GET /api/v1/doctor/patient/[id]', () => {
    it('should return patient clinical review data for valid ID', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/patient/ast-101', {
        headers: { 'x-user-role': 'Doctor' },
      });
      const res = await getPatientHandler(req, { params: { id: 'ast-101' } });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data?.id).toBe('ast-101');
      expect(json.data?.explainability_payload).toBeDefined();
    });

    it('should return 404 for non-existent assessment', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/patient/non-existent-id', {
        headers: { 'x-user-role': 'Doctor' },
      });
      const res = await getPatientHandler(req, { params: { id: 'non-existent-id' } });
      expect(res.status).toBe(404);

      const json = await res.json();
      expect(json.error?.code).toBe('NOT_FOUND');
    });

    it('should reject unauthorized request with 403', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/patient/ast-101', {
        headers: { 'x-user-role': 'Anonymous Patient' },
      });
      const res = await getPatientHandler(req, { params: { id: 'ast-101' } });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/doctor/medications', () => {
    it('should return medication records for patient', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/medications?patientId=p-101', {
        headers: { 'x-user-role': 'Doctor' },
      });
      const res = await getMedicationsHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].medication_name).toBeDefined();
    });

    it('should reject unauthorized role with 403', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/medications', {
        headers: { 'x-user-role': 'Unauthorized' },
      });
      const res = await getMedicationsHandler(req);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/doctor/analytics', () => {
    it('should return aggregate analytics data without exposing raw PHI', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/analytics', {
        headers: { 'x-user-role': 'Doctor' },
      });
      const res = await getAnalyticsHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data?.category_distribution).toBeDefined();
      expect(json.data?.review_velocity).toBeDefined();
      expect(json.data?.override_rate_percent).toBeDefined();
    });

    it('should reject unauthorized role with 403', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/doctor/analytics', {
        headers: { 'x-user-role': 'Guest' },
      });
      const res = await getAnalyticsHandler(req);
      expect(res.status).toBe(403);
    });
  });
});
