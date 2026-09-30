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
progress: 7 of 22 addressed** — comment 1 (Authentication & Session Management)
incorporated as BRD-025, comment 2 (Role & API-Level Authorization) as BRD-026,
comment 3 (Workflow State Management) as BRD-027, comment 4 (Vacancy
Reservation & Capacity) as BRD-028, comment 5 (Employee Eligibility) as
BRD-029 and comment 6 (Multiple Active Transfer Requests) as BRD-030 on
2026-09-30, and comment 15 (Withdrawal, BRD-OQ-12 resolved) within BRD-027;
comments 8–14 and 16–22 outstanding (9–11, 16–17 partly covered by BRD-027;
16 partly covered by BRD-030). BRD-OQ-13 (Block/Resume/Cancel/Reassign) resolved within BRD-027 and comment 18 partly covered; BRD-OQ-14 (HR/Payroll routing, invalid-transition response) resolved within BRD-027; BRD-OQ-15 (vacancy edge cases) resolved within BRD-028; BRD-OQ-16 (missing-data block, HR reject vs clarification) and BRD-OQ-19 (portal as operational employee-data source with per-field ownership, no HR-system synchronisation this phase; comment 7 addressed) resolved within BRD-029; BRD-OQ-17 (Draft not active, mandatory backend + database enforcement, HTTP 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`, no cool-down) resolved within BRD-030; BRD-OQ-18 (HR/IT controlled stages, HR Cancel limited to three HR stages, Draft excluded, cross-role Resume rules) resolved within BRD-027 and comment 18 further covered;
no open questions remain pending the Gate 0 reviewer beyond comments 8–14 and 16–22. Built from `docs/Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.0.pdf`
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
