# MediAI Module Ownership & Conflict Prevention Guide

This document defines the strict boundaries, maintainers, and modification rules to prevent GitHub merge conflicts across MediAI modules.

---

## 1. Module Ownership Matrix

| Module ID | Module Name | Primary Path | Assigned Owner | Scope & Responsibilities |
|---|---|---|---|---|
| **M1** | Application Shell & Authentication | `app/`, `shared/context/AuthContext.tsx` | Lead Architect / Core Team | Root routing, global shell layout, session resolution, global guards |
| **M2** | Patient Intake & Localization | `modules/patient_intake/`, `app/intake/` | Intake Team | Demographics, symptoms, vitals capture, speech recognition, EN/TA i18n |
| **M3** | Triage Engine & AI Risk Assessment | `modules/triage_engine/` | Clinical AI / Safety Team | Deterministic 12-domain red-flag engine, scoring formula, TreeSHAP XAI, acuity classification |
| **M4** | Doctor Emergency Dashboard | `modules/doctor_dashboard/`, `app/doctor/` | Clinical UX Team | Real-time queue, clinical review workspace, physician override console, analytics |
| **M5** | Audit & Compliance | `modules/audit_compliance/` | Security & Compliance Team | Immutable append-only audit logging, SHA-256 hashing, zero-PHI admin views |
| **M6** | Shared Design System | `shared/components/`, `shared/styles/` | Design System Lead | Generic UI primitives (Button, Modal, Card, Input, etc.). No clinical business logic allowed. |
| **M7** | API Contracts & Persistence | `shared/contracts/`, `migrations/` | API & DB Architect | Canonical DTO schemas, REST contracts, PostgreSQL migrations |

---

## 2. Shared File Edit Protocol

To eliminate repetitive merge conflicts in shared files (`package.json`, `app/layout.tsx`, `shared/components/`, `migrations/`):

1. **Zero Direct Feature Edits to Shared Core:**
   Feature developers must NOT directly modify `shared/components/` or root configuration files without prior interface approval.
2. **Contract First Integration:**
   All cross-module interactions must use TypeScript interfaces defined in `shared/contracts/`.
3. **Module Local Encapsulation:**
   Clinical business logic, custom sub-components, and feature hooks must stay inside the owning `modules/<name>/` directory.
4. **Controlled Migration Sequences:**
   Only the Database Architect creates timestamped migration scripts under `migrations/`.
