# MediAI Synthetic Demo Database (Next.js + Supabase)

This package provides a PostgreSQL schema and 50 fictional patient fixtures for an academic clinical decision-support prototype. It does not diagnose, prescribe, calculate doses, or replace clinicians. **Do not use for real clinical decisions.**

## Why Supabase first?
Supabase gives this Next.js demo a hosted PostgreSQL database and authentication. The schema uses Postgres features, UUIDs, enums, JSONB, and Row Level Security (RLS). It is not directly compatible with Firebase/Firestore without redesigning the data model. If your team chooses Firebase, see `docs/firebase-notes.md`.

## Setup
1. Create a project at https://supabase.com.
2. Open **SQL Editor** in the Supabase dashboard.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. In **Project Settings → API**, copy the project URL and the publishable/anon key for client-side auth.
6. Add environment variables to your Next.js app's `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```
7. Install the SDK:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```
8. Create browser and server clients using Supabase's current Next.js SSR guide: https://supabase.com/docs/guides/auth/server-side/nextjs
9. For server-only service tasks, if truly required, store `SUPABASE_SERVICE_ROLE_KEY` only in server environment secrets (never prefix it with `NEXT_PUBLIC_`; never expose it to browser code). Prefer user-scoped server clients and least privilege.
10. Confirm seeded counts:
   ```sql
   select count(*) from public.patients;             -- 50
   select count(*) from public.vital_signs;          -- 50
   select count(*) from public.triage_assessments;   -- 50
   select count(*) from public.medications;          -- 10
   select count(*) from public.alerts;               -- red-flag fixtures only
   ```
11. Check queue sorting:
   ```sql
   select demo_mrn, acuity_level, risk_score, red_flag, review_status
   from public.doctor_queue_sorted_demo;
   ```

## Important security notes
- RLS is enabled on all tables. Direct patient/clinical table access is deliberately denied by default, except a user can read their own profile. This prevents a demo from accidentally becoming world-readable.
- Implement doctor APIs in Next.js route handlers and verify the authenticated user's role on the server before querying patient data.
- Never trust a role sent in request JSON or a client-side “authenticate as doctor” button. Demo bypasses must be development-only, clearly labeled, and disabled in production.
- A user should not be able to set their own role by inserting/updating `profiles`. Provision doctor profiles via a trusted server/admin process.
- Supabase `service_role` keys bypass RLS; server-only use is required.
- For production or real patient data, perform institutional/privacy/security review and follow applicable laws and policies. This package is synthetic-only.

## Suggested Next.js API routes
- `GET /api/v1/doctor/queue?status=PENDING_REVIEW`
- `GET /api/v1/doctor/patient/[id]`
- `POST /api/v1/doctor/override`
- `GET /api/v1/doctor/medications?patientId=[id]`
- `GET /api/v1/doctor/analytics`

Every route should validate session and doctor role on the server, validate inputs, use structured response envelopes, and write audit records for review/override actions. Keep mock alert dispatch disabled.

## Seed behavior
The seed SQL is designed for a fresh empty project and is not idempotent: running it twice will conflict on unique demo MRNs. To reset, delete only synthetic demo rows in a disposable project or recreate the project. Do not run reset scripts against real data.

## Clinical-safety framing
The included scores, confidence values, acuity bands, and red flags are hand-authored for UI/workflow testing only. They are not model predictions, validated clinical rules, or care recommendations. Any future ML model must be evaluated on suitable authorized data and independently reviewed by qualified clinical stakeholders.
