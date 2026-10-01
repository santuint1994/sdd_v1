# Project Status Board

## Setup
- [x] INT Control Plane (`.agent/`) initialized
- [x] AI Context knowledge base (`.ai-context/`) initialized
- [x] Execution layer scaffolded (`frontend/` — Next.js, `backend/` — Express +
      Sequelize)
- [x] Reviewer roster (Gate 1 / Gate 2 / Spec Author) confirmed with real names and
      emails
- [x] Gate 0 reviewer (Project Manager and/or Business Analyst) assigned in
      `.ai-context/project_context.md` — Shamik Bhattacharya
      (shamik.bhattacharya@intglobal.com)

## Governance Flow
BRD Preparation → **Gate 0: BRD Review (PM / BA)** → Gate 1 (Spec Peer Review) →
Gate 2 (Code Review) → Development / Implementation. Gate 0 must be approved before
Gate 1 can begin.

| Gate | Artifact | Reviewer Role | Status | Reviewer | Review Date |
|---|---|---|---|---|---|
| Gate 0 | `BRD.md` | Project Manager / Business Analyst | Changes Requested | Shamik Bhattacharya | 2026-09-30 |
| Gate 1 | Specs | Project Manager / Product Owner | Blocked (awaiting Gate 0) | — | — |
| Gate 2 | Code | Technical Lead / Architect | Not started | — | — |
- [x] BRD ingested (`docs/` → `/int-brd-ingestion`)

## BRD
`.ai-context/BRD.md` — Internal Transfer Digital Journey — **Status: Changes
Requested** (Gate 0 review 2026-09-30, Shamik Bhattacharya — 22 comments in
`.ai-context/pr_reviews/BRD-20260930-144648.md`; author must update `BRD.md` and
`assumptions.md` to resolve them and re-submit for Gate 0). **Resolution
progress: 22 of 22 addressed** — comment 1 (Authentication & Session Management)
incorporated as BRD-025, comment 2 (Role & API-Level Authorization) as BRD-026,
comment 3 (Workflow State Management) as BRD-027, comment 4 (Vacancy
Reservation & Capacity) as BRD-028, comment 5 (Employee Eligibility) as
BRD-029, comment 6 (Multiple Active Transfer Requests) as BRD-030 and comment 8
(Effective Transfer Date) as BRD-031 (BRD-OQ-20 resolved) on
2026-09-30, comment 9 (HR Organisation Metadata Changes) by confirming BRD-024, comment 10 (Payroll Task Completion) by confirming BRD-027(c), comment 11 (IT Final Approval) by confirming the BRD-027 completion rule, comment 12 (Integration Requirements) by confirming no external Payroll/HR integration this phase and the future-contract requirements (Business Rules, NFR-006), comment 13 (Document Upload & Access) by confirming the BRD-021 API/server-level rules (5 MB, PDF/image, MIME/extension validation, authenticated scoped access, HTTP 413/415 validation errors), comment 14 (Transfer Request Editing) as BRD-032 (Employee edits in Draft only; post-submission changes by authorised HR/Super Admin with BRD-024 re-approval and full audit), comment 15 (Withdrawal, BRD-OQ-12 resolved) within BRD-027, and comment 16 (Rejection & Resubmission) as BRD-033 (mandatory reason and audit, Employee notified, Rejected final with capacity released, no same-reference resubmission, a new application is a new request with a new ID and restarted workflow), comment 17 (Clarification) as BRD-034 (mandatory reason, Information Required as a temporary state, same transfer reference, audited requests/responses, return to the same stage/reviewer, multiple cycles, no workflow restart), and comment 18 (Administrative Reassignment) as BRD-035 (Super Admin only — HR can no longer reassign — mandatory reason, new assignee notified, previous assignee keeps history visibility but cannot act, no re-approval, same workflow stage, audited, no bypass of mandatory approvals or IT Final Approval), and comment 19 (Notifications) as BRD-036 (twelve mandatory events with recipient/channel/message, notification failure never fails or rolls back the core transaction, failures logged, retry without repeating the workflow transaction, no duplicate actions or transitions), and comment 20 (Audit Logging) as BRD-037 (audit record content, Super Admin system-wide view with other users limited to role/organisation scope, append-only records never overwritten, Super Admin-only export that is itself audited, lifetime retention with no manual deletion, no credentials in audit logs, security events audited), and comment 21 (Performance & Availability) as BRD-038 (application-level performance requirements validated before production; concurrent users, volume, API/page response-time targets and API timeout to be confirmed in capacity planning, testing and technical planning; integration timeout per integration, none this phase; 5 MB upload limit; controlled retry without duplicate downstream transactions; consistent, non-partial critical transactions; pre-production validation; infrastructure targets stay in NFR-009), and comment 22 (Mandatory Negative Acceptance Scenarios) as BRD-039 (security, workflow, vacancy and integration negative scenarios are mandatory QA/UAT acceptance criteria validated before production deployment; any failed mandatory scenario must be resolved before production);
all 22 comments addressed by the author, awaiting Gate 0 reviewer re-review. BRD-OQ-13 (Block/Resume/Cancel/Reassign) resolved within BRD-027 and comment 18 addressed in BRD-035; BRD-OQ-14 (HR/Payroll routing, invalid-transition response) resolved within BRD-027; BRD-OQ-15 (vacancy edge cases) resolved within BRD-028; BRD-OQ-16 (missing-data block, HR reject vs clarification) and BRD-OQ-19 (portal as operational employee-data source with per-field ownership, no HR-system synchronisation this phase; comment 7 addressed) resolved within BRD-029; BRD-OQ-17 (Draft not active, mandatory backend + database enforcement, HTTP 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`, no cool-down) resolved within BRD-030; BRD-OQ-18 (HR/IT controlled stages, HR Cancel limited to three HR stages, Draft excluded, cross-role Resume rules) resolved within BRD-027 and comment 18 addressed (HR may also cancel a Blocked request blocked in an HR-controlled stage; HR cannot cancel an IT-blocked one; Super Admin any Blocked request);
no open questions remain pending the Gate 0 reviewer; Gate 0 stays Changes Requested until re-approval. Built from `docs/Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.0.pdf`
(SOW v1.4). All 11 open questions (BRD-OQ-01 … BRD-OQ-11) answered by the
user and incorporated into the requirements, including a new re-approval
requirement (BRD-024) not in the source SOW. Formal Gate 0 BRD PR Review
(identity-verified Project Manager / Business Analyst reviewer, recorded in
`.ai-context/pr_reviews/BRD-<timestamp>.md` with reviewer, date, status, and
comments) is still required before spec generation or Gate 1 may begin.

## Specs
No specs created yet — blocked pending Gate 0 BRD approval.

## Releases
No releases yet.

## Open Incidents
None.
