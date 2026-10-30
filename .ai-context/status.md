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
| Gate 0 | `BRD.md` | Project Manager / Business Analyst | Approved | Shamik Bhattacharya | 2026-10-05 |
| Gate 1 | Specs | Project Manager / Product Owner | In review — 1 Approved, 15 Changes Requested | Shamik Bhattacharya | 2026-10-07 → 2026-10-29 |
| Gate 2 | Code | Technical Lead / Architect | Not started | — | — |
- [x] BRD ingested (`docs/` → `/int-brd-ingestion`)

## BRD
`.ai-context/BRD.md` — Internal Transfer Digital Journey — **Status: Approved**
(Gate 0 re-review 2026-10-05, Shamik Bhattacharya — all 22 comments confirmed in
`.ai-context/pr_reviews/BRD-20261005-171137.md`). History: Changes Requested on
2026-09-30 (22 comments in `.ai-context/pr_reviews/BRD-20260930-144648.md`). **Resolution
progress: 22 of 22 addressed** — comment 1 (Authentication & Session Management)
incorporated as BRD-025, comment 2 (Role & API-Level Authorization) as BRD-026,
comment 3 (Workflow State Management) as BRD-027, comment 4 (Vacancy
Reservation & Capacity) as BRD-028, comment 5 (Employee Eligibility) as
BRD-029, comment 6 (Multiple Active Transfer Requests) as BRD-030 and comment 8
(Effective Transfer Date) as BRD-031 (BRD-OQ-20 resolved) on
2026-09-30, comment 9 (HR Organisation Metadata Changes) by confirming BRD-024, comment 10 (Payroll Task Completion) by confirming BRD-027(c), comment 11 (IT Final Approval) by confirming the BRD-027 completion rule, comment 12 (Integration Requirements) by confirming no external Payroll/HR integration this phase and the future-contract requirements (Business Rules, NFR-006), comment 13 (Document Upload & Access) by confirming the BRD-021 API/server-level rules (5 MB, PDF/image, MIME/extension validation, authenticated scoped access, HTTP 413/415 validation errors), comment 14 (Transfer Request Editing) as BRD-032 (Employee edits in Draft only; post-submission changes by authorised HR/Super Admin with BRD-024 re-approval and full audit), comment 15 (Withdrawal, BRD-OQ-12 resolved) within BRD-027, and comment 16 (Rejection & Resubmission) as BRD-033 (mandatory reason and audit, Employee notified, Rejected final with capacity released, no same-reference resubmission, a new application is a new request with a new ID and restarted workflow), comment 17 (Clarification) as BRD-034 (mandatory reason, Information Required as a temporary state, same transfer reference, audited requests/responses, return to the same stage/reviewer, multiple cycles, no workflow restart), and comment 18 (Administrative Reassignment) as BRD-035 (Super Admin only — HR can no longer reassign — mandatory reason, new assignee notified, previous assignee keeps history visibility but cannot act, no re-approval, same workflow stage, audited, no bypass of mandatory approvals or IT Final Approval), and comment 19 (Notifications) as BRD-036 (twelve mandatory events with recipient/channel/message, notification failure never fails or rolls back the core transaction, failures logged, retry without repeating the workflow transaction, no duplicate actions or transitions), and comment 20 (Audit Logging) as BRD-037 (audit record content, Super Admin system-wide view with other users limited to role/organisation scope, append-only records never overwritten, Super Admin-only export that is itself audited, lifetime retention with no manual deletion, no credentials in audit logs, security events audited), and comment 21 (Performance & Availability) as BRD-038 (application-level performance requirements validated before production; concurrent users, volume, API/page response-time targets and API timeout to be confirmed in capacity planning, testing and technical planning; integration timeout per integration, none this phase; 5 MB upload limit; controlled retry without duplicate downstream transactions; consistent, non-partial critical transactions; pre-production validation; infrastructure targets stay in NFR-009), and comment 22 (Mandatory Negative Acceptance Scenarios) as BRD-039 (security, workflow, vacancy and integration negative scenarios are mandatory QA/UAT acceptance criteria validated before production deployment; any failed mandatory scenario must be resolved before production);
all 22 comments addressed by the author, confirmed by the Gate 0 reviewer on 2026-10-05. BRD-OQ-13 (Block/Resume/Cancel/Reassign) resolved within BRD-027 and comment 18 addressed in BRD-035; BRD-OQ-14 (HR/Payroll routing, invalid-transition response) resolved within BRD-027; BRD-OQ-15 (vacancy edge cases) resolved within BRD-028; BRD-OQ-16 (missing-data block, HR reject vs clarification) and BRD-OQ-19 (portal as operational employee-data source with per-field ownership, no HR-system synchronisation this phase; comment 7 addressed) resolved within BRD-029; BRD-OQ-17 (Draft not active, mandatory backend + database enforcement, HTTP 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`, no cool-down) resolved within BRD-030; BRD-OQ-18 (HR/IT controlled stages, HR Cancel limited to three HR stages, Draft excluded, cross-role Resume rules) resolved within BRD-027 and comment 18 addressed (HR may also cancel a Blocked request blocked in an HR-controlled stage; HR cannot cancel an IT-blocked one; Super Admin any Blocked request);
no open questions remain pending the Gate 0 reviewer; Gate 0 approved on 2026-10-05 (all 22 comments confirmed). Built from `docs/Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.0.pdf`
(SOW v1.4). All 11 open questions (BRD-OQ-01 … BRD-OQ-11) answered by the
user and incorporated into the requirements, including a new re-approval
requirement (BRD-024) not in the source SOW. Formal Gate 0 BRD PR Review
(identity-verified Project Manager / Business Analyst reviewer, recorded in
`.ai-context/pr_reviews/BRD-<timestamp>.md` with reviewer, date, status, and
comments) was completed on 2026-10-05; spec generation and Gate 1 may begin.

## Specs
16 consolidated specs drafted 2026-10-07 from the Gate 0-approved BRD (Spec Author: Santu Pradhan). Gate 1 reviewer: Shamik Bhattacharya (shamik.bhattacharya@intglobal.com, roster-verified in each record). **Gate 1 outcome so far: 1 Approved, 15 Changes Requested.** Records in `.ai-context/pr_reviews/`.

| Spec | Slug | Gate 1 Status | Review Date | Record |
|---|---|---|---|---|
| SPEC-001 | project-foundation-architecture | Changes Requested (spec updated 2026-10-30, awaiting Gate 1 re-review) | 2026-10-28 | `SPEC-001-project-foundation-architecture-20261028-143345.md` |
| SPEC-002 | identity-access-security | Changes Requested | 2026-10-27 | `SPEC-002-identity-access-security-20261027-162007.md` |
| SPEC-003 | admin-portal-master-data | Changes Requested | 2026-10-07 | `SPEC-003-admin-portal-master-data-20261007-151037.md` |
| SPEC-004 | user-provisioning-administration | Changes Requested | 2026-10-29 | `SPEC-004-user-provisioning-administration-20261029-175302.md` |
| SPEC-005 | vacancy-capacity-reservation | Changes Requested | 2026-10-29 | `SPEC-005-vacancy-capacity-reservation-20261029-175816.md` |
| SPEC-006 | transfer-initiation-eligibility | Changes Requested | 2026-10-28 | `SPEC-006-transfer-initiation-eligibility-20261028-174721.md` |
| SPEC-007 | transfer-workflow-approval-lifecycle | Changes Requested | 2026-10-29 | `SPEC-007-transfer-workflow-approval-lifecycle-20261029-164221.md` |
| SPEC-008 | hr-review-processing-reapproval | Changes Requested (Not Ready for Approval) | 2026-10-13 | `SPEC-008-hr-review-processing-reapproval-20261013-173451.md` |
| SPEC-009 | payroll-it-completion | Changes Requested (round 2 on 2026-10-29) | 2026-10-29 | `SPEC-009-payroll-it-completion-20261027-164407.md` |
| SPEC-010 | transfer-exception-controls | Changes Requested | 2026-10-28 | `SPEC-010-transfer-exception-controls-20261028-153226.md` |
| SPEC-011 | secure-document-management | Changes Requested | 2026-10-28 | `SPEC-011-secure-document-management-20261028-145216.md` |
| SPEC-012 | notification-framework | Changes Requested | 2026-10-27 | `SPEC-012-notification-framework-20261027-163348.md` |
| SPEC-013 | audit-compliance-security-events | Changes Requested | 2026-10-07 | `SPEC-013-audit-compliance-security-events-20261007-151808.md` |
| SPEC-014 | dashboards-worklists-reporting | Changes Requested | 2026-10-07 | `SPEC-014-dashboards-worklists-reporting-20261007-164840.md` |
| SPEC-015 | data-ownership-integration-nfr-hardening | Changes Requested | 2026-10-27 | `SPEC-015-data-ownership-integration-nfr-hardening-20261027-125458.md` |
| SPEC-016 | qa-uat-traceability | **Approved** | 2026-10-28 | `SPEC-016-qa-uat-traceability-20261028-144719.md` |

**Enforcement:** the 15 Changes Requested specs must be updated by the spec author and re-submitted for Gate 1. Planning (`.plan.md`), tasks, test cases, TDD and `src/` work are blocked for them. SPEC-016 is Gate 1 Approved and may proceed to plan, tasks and test cases (note its dependencies on the other specs' pending decisions). 252 Technical Design Decisions await freezing. Supporting: `spec-set-overview.md`, `spec-traceability-matrix.md`, `spec-reconciliation-notes.md`.

## Releases
No releases yet.

## Open Incidents
None.
