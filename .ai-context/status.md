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
`assumptions.md` to resolve them and re-submit for Gate 0). Built from `docs/Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.0.pdf`
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
