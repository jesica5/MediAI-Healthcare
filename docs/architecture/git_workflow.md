# MediAI Git Branching & Integration Workflow

This document codifies the integration protocol to ensure clean, conflict-free delivery across all MediAI contributors.

---

## 1. Branch Hierarchy

```
main (Production baseline, stable, verified)
  └── develop (Integration branch for staging & multi-module testing)
        ├── feature/m1-app-shell
        ├── feature/m2-patient-intake
        ├── feature/m3-triage-engine
        ├── feature/m4-doctor-dashboard
        ├── feature/m5-audit-compliance
        └── feature/m7-database-migrations
```

## 2. Integration Rules

1. **Feature Branch Isolation:** Developers work on `feature/<module-name>`.
2. **Pre-Merge Validation Checklist:**
   - Run typecheck: `npm run type-check`
   - Run module & doctor tests: `npm run test:all`
   - Zero console errors or warnings.
3. **Merge Direction:**
   - Feature branches merge into `develop` via pull requests.
   - Once `develop` passes integration and E2E simulation suites, it merges into `main`.
4. **Never Force Push:** Force pushing on `main` or `develop` is strictly prohibited.
5. **No Secrets in Git:** Real credentials and `.env` must never be committed. Only `.env.example` is committed with placeholders.
