# Spec Set Master Overview (SPEC-001 .. SPEC-016)

## Document control

| Item | Value |
|---|---|
| Purpose | Single entry point to the 16-spec set: coverage, optimisation, serial list, workflow transition matrix, role/scope matrix, master-data and spec dependencies, negative coverage pointer, out-of-scope validation, development journey, zero-omission statement and consolidated Gate 1 decisions |
| Source of truth | `.ai-context/BRD.md` (Gate 0 APPROVED 2026-10-05, record `.ai-context/pr_reviews/BRD-20261005-171137.md`) |
| Specs covered | 16 files `.ai-context/specs/*.spec.md` (all `Draft - not yet submitted for Gate 1`) |
| Companion artefacts | `spec-traceability-matrix.md` (BRD to SPEC to TASK to AC/NAC/TC, owned by SPEC-016), `spec-reconciliation-notes.md` (cross-spec reconciliation R-1 to R-15) |
| Generated | 2026-10-07 |
| Status | Draft - navigational overview. It introduces **no requirement**. Where it disagrees with a spec file or the BRD, the BRD wins, then the spec file; regenerate after any spec change |
| Method | Content below was read from the actual spec files (section 3/4/5/16/18/19/TDD of each spec, SPEC-002 section 15.4, SPEC-003 section 10.5, SPEC-007 section 16, SPEC-016 section 3.6 and 9.8), cross-checked against the BRD (BRD-027 matrix lines 232-253, 347-352, 494-508) and the traceability matrix. Counts are the matrix "volumes parsed from the specs" (2026-10-07) |
| BRD numbering | **There is no BRD-015.** The BRD skips from BRD-014 to BRD-016. There is no requirement text and no row for it; this is a numbering fact, not a coverage gap |
| Parts | A, B, C, E, F, G, H, J, K, L, M, N are provided. Parts D and I are not part of this document |

Classification tags used throughout (as in every spec): `[BRD]` stated by the BRD; `[DERIVED]` necessarily follows from BRD text; `[PROPOSED]` proposed technical design (reviewable, not mandated); `[TDD-REQUIRED]` = Technical Design Decision Required - Not Defined by BRD (listed in Part N).

---

## Part A - BRD coverage summary

### A.1 Headline

| Measure | Result |
|---|---|
| BRD requirement IDs | 38 (BRD-001 to BRD-014 and BRD-016 to BRD-039; **no BRD-015**) |
| NFR IDs | 9 (NFR-001 to NFR-009) |
| Requirement rows with a primary SPEC, at least one task and at least one AC/NAC | 47 of 47 |
| Open questions BRD-OQ-01 to BRD-OQ-20 | 20 of 20 Resolved in the BRD and each implemented or evidenced by at least one SPEC (OQ-09 resolved as deferred, owned by SPEC-015) |
| BRD "Acceptance Criteria" bullets | 40 of 40 mapped to SPEC acceptance ids (SPEC-016 section 3.5, `AB-01` to `AB-40`) |
| BRD-039 mandatory negative scenarios | 24 of 24 mapped to NAC and TC ids (SPEC-016 section 3.6, `S1`-`S8`, `W1`-`W7`, `V1`-`V4`, `I1`-`I5`) |
| BRD-027 matrix rows | 37 of 37 (20 original + 4 Withdraw + 13 Block/Resume/Cancel/Reassign) registered as `TR-001` to `TR-037` plus derived rows (Part E) |
| Tasks / Acceptance criteria / Negative acceptance criteria / TDD decisions | 508 / 479 / 363 / 252 |
| Primary-owner check performed for this overview | For each of the 47 rows the id string was verified to be present in the primary SPEC's own file (47 of 47) |

### A.2 Requirement-by-requirement coverage (all 47 ids)

"Primary" is the owning SPEC from the ownership map; "Secondary" lists every other SPEC (excluding SPEC-016, which verifies all of them) that evidences the id through its section 3 table, a task `BRD refs` cell or an AC/NAC tag. Task, AC, NAC and TC id lists per row are in `spec-traceability-matrix.md` section 1.

| ID | Requirement (summary) | Primary SPEC | Secondary SPECs | Primary-owner text check |
|---|---|---|---|---|
| BRD-001 | Individual authenticated accounts for all six roles; local credentials; role- and scope-aware views | SPEC-002 | 001, 003, 004 | present in primary SPEC text |
| BRD-002 | Modern responsive Admin Panel: role-aware nav, dashboard cards, tables, forms, confirm dialogs, loading/empty/no-access/error states, accessibility | SPEC-003 | 001, 002, 004, 005, 006, 009, 010, 012, 013, 014, 015 | present in primary SPEC text |
| BRD-003 | Admin modules Dashboard, Users, Locations, Departments, Designations, Vacancies, Transfers, Documents, Audit Logs | SPEC-003 | 001, 004, 005, 011, 013 | present in primary SPEC text |
| BRD-004 | Role-prefixed unique User ID (EMP/MGR/HR/IT######), strong temp password, duplicate validation, user+profile in one transaction | SPEC-004 | 001, 002 | present in primary SPEC text |
| BRD-005 | Credentials shown once to authorised admin; delivered by official email; temp password never in logs/audit | SPEC-004 | 001, 002, 012, 013 | present in primary SPEC text |
| BRD-006 | Temp password; forced change at first login (no bypass incl. direct API); hashes only | SPEC-002 | 001, 004, 013 | present in primary SPEC text |
| BRD-007 | Account lifecycle (Pending Activation/Active/Locked/Inactive); admin reset; complexity, lockout, session timeout, forced change | SPEC-002 | 004, 012 | present in primary SPEC text |
| BRD-008 | Account create/activate/deactivate/reset/lock/unlock/first-login change audited without plaintext passwords | SPEC-002, SPEC-004 | 013 | present in primary SPEC text |
| BRD-009 | Account creation flow: role > profile > validate > create > credentials > deliver > first login > audit | SPEC-004 | 002 | present in primary SPEC text |
| BRD-010 | Super Admin scope: masters, vacancies, users and mappings, view all, reassign/intervene | SPEC-003 | 002, 004, 005, 010, 011, 013, 014 | present in primary SPEC text |
| BRD-011 | Employee scope: profile, browse vacancies, submit with reference, track timeline, respond to clarification, history | SPEC-006 | 004, 005, 007, 014 | present in primary SPEC text |
| BRD-012 | Reporting/Receiving Manager scope; Receiving Manager stage Super-Admin configurable (on/off) | SPEC-007 | 003, 004, 008, 012, 013, 014, 015 | present in primary SPEC text |
| BRD-013 | HR scope: eligibility/vacancy validation, approve/reject/clarify, metadata, payroll/IT initiation, documents, monitoring | SPEC-008 | 004, 005, 009, 011, 014 | present in primary SPEC text |
| BRD-014 | IT scope: assigned tasks, minimum data, evidence, statuses; IT Final Approval mandatory (No IT Action Required path) | SPEC-009 | 004, 011, 013, 014, 015 | present in primary SPEC text |
| BRD-016 | Organisational relationships for routing (employee, RM, HR, IT, vacancy) | SPEC-003 | 004, 005, 006, 007, 009, 014 | present in primary SPEC text |
| BRD-017 | Vacancy fields and statuses; reservation only at HR approval; DB concurrency control | SPEC-005 | 001, 006, 015 | present in primary SPEC text |
| BRD-018 | End-to-end workflow sequence ending in IT Final Approval > Completed | SPEC-007 | 006, 008, 009 | present in primary SPEC text |
| BRD-019 | Status model per BRD-027; Blocked/Cancelled retained; not Completed without IT Final Approval | SPEC-007 | 001, 006, 008, 009, 010 | present in primary SPEC text |
| BRD-020 | HR org-metadata update/assign during validation; portal-data-only; payroll assignment | SPEC-008 | 009, 015 | present in primary SPEC text |
| BRD-021 | HR documents; PDF/image, 5 MB, MIME+extension, sanitised names, local storage, scoped authenticated access, 413/415 codes | SPEC-011 | 001, 008, 009, 013, 015 | present in primary SPEC text |
| BRD-022 | All material actions across every role are auditable (no plaintext passwords) | SPEC-013 | 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 014, 015 | present in primary SPEC text |
| BRD-023 | Notifications, role dashboards/worklists, operational reporting, overdue visibility, configurable escalation | SPEC-012, SPEC-014 | 005 | present in primary SPEC text |
| BRD-024 | HR change of Dept/BU, Designation, Location or Reporting Manager returns to Receiving Manager re-approval when enabled | SPEC-008 | 005, 007, 009, 012, 013, 015 | present in primary SPEC text |
| BRD-025 | Auth and session policy: 5 failures/30 min lock, 30 min idle, complexity, reset/deactivate invalidates sessions, MFA/SSO out | SPEC-002 | 001, 003, 004, 006, 012, 013, 014, 015 | present in primary SPEC text |
| BRD-026 | API-level authorisation chain User>Role>Scope>Resource>Action; 401/403; direct API never bypasses | SPEC-002 | 001, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015 | present in primary SPEC text |
| BRD-027 | Controlled workflow state-transition matrix; HR/Payroll/IT sequencing; completion rule; Withdraw/Block/Resume/Cancel/Reassign; invalid transition 403 | SPEC-007 | 001, 002, 005, 006, 008, 009, 010, 011, 012, 013, 014, 015 | present in primary SPEC text |
| BRD-028 | Vacancy reservation and capacity rules, release/retain/finalise, HR vacancy change, concurrency, resume revalidation, manual release | SPEC-005 | 001, 003, 006, 007, 008, 009, 010, 012, 013, 014, 015 | present in primary SPEC text |
| BRD-029 | Eligibility rules 1-8, system behaviour, employee-data source of truth and field ownership, missing data, HR-ineligible outcome | SPEC-006 | 003, 004, 005, 007, 008, 009, 012, 013, 015 | present in primary SPEC text |
| BRD-030 | One active transfer per employee; 409 ACTIVE_TRANSFER_ALREADY_EXISTS; Draft not active; DB enforcement; no cool-down | SPEC-006 | 001, 005, 007, 010, 012, 014, 015 | present in primary SPEC text |
| BRD-031 | Effective Transfer Date: today to +30 days inclusive, who may change, expired-date correction, optional re-approval | SPEC-006 | 001, 007, 008, 009, 013 | present in primary SPEC text |
| BRD-032 | Transfer request editing: Draft only for Employee; post-submission HR/Super Admin controlled, audited, BRD-024 applies | SPEC-006, SPEC-008 | 007, 013, 015 | present in primary SPEC text |
| BRD-033 | Rejection and resubmission: mandatory reason, Rejected final, new request = new reference | SPEC-007 | 005, 006, 008, 010, 012, 013 | present in primary SPEC text |
| BRD-034 | Clarification: mandatory question, Info Required, same reference, return to same stage, multiple cycles | SPEC-007 | 006, 008, 012, 013, 014 | present in primary SPEC text |
| BRD-035 | Administrative reassignment: Super Admin only, reason, role+scope of new assignee, no re-approval, audited | SPEC-010 | 003, 007, 008, 009, 011, 012, 013, 014 | present in primary SPEC text |
| BRD-036 | Twelve mandatory notifications, channels, failure isolation, retry idempotency | SPEC-012 | 001, 004, 006, 007, 008, 009, 010, 013, 014, 015 | present in primary SPEC text |
| BRD-037 | Audit logging: content, scoped access, append-only, Super Admin export, retention, no credentials, security events | SPEC-013 | 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 012, 014, 015 | present in primary SPEC text |
| BRD-038 | Performance and availability: application-level requirements, 5 MB, TBC numeric inputs, retry, transaction consistency | SPEC-015 | 001, 005, 007, 009, 010, 011, 014 | present in primary SPEC text |
| BRD-039 | Mandatory negative acceptance scenarios (24): security, workflow, vacancy, integration | SPEC-016 | 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015 | present in primary SPEC text |
| NFR-001 | Authentication: local credentials, first-login change, lock, idle timeout, complexity, session invalidation | SPEC-002 | 001, 004, 015 | present in primary SPEC text |
| NFR-002 | Authorisation: role + scope, least privilege, backend authoritative, 401/403 | SPEC-002 | 001, 003, 004, 005, 006, 007, 008, 009, 010, 011, 013, 014, 015 | present in primary SPEC text |
| NFR-003 | Credential security: strong hashing, no plaintext/tokens in DB, logs, reports, audit | SPEC-002 | 001, 004, 012, 013, 015 | present in primary SPEC text |
| NFR-004 | Transport and personal-data protection (encrypted transport) | SPEC-015 | 001, 011 | present in primary SPEC text |
| NFR-005 | Auditability: protected tamper-resistant append-only records, scoped view, SA export | SPEC-013 | 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 015 | present in primary SPEC text |
| NFR-006 | Reliability: recoverable integration failures, no duplicate downstream execution, visible failures, authorised retry | SPEC-012, SPEC-015 | 001, 005, 006, 007, 008, 009, 010, 013 | present in primary SPEC text |
| NFR-007 | Privacy: employee and document access restricted to authorised role and scope | SPEC-011, SPEC-002, SPEC-015 | 001, 003, 004, 006, 008, 009, 012, 013, 014 | present in primary SPEC text |
| NFR-008 | Accessibility and usability aligned to organisational portal standards | SPEC-003 | 001, 004, 005, 006, 007, 009, 010, 012, 013, 014, 015 | present in primary SPEC text |
| NFR-009 | Performance/availability/backup/retention/monitoring targets deferred to infrastructure/deployment planning | SPEC-015 | 001, 011, 012, 013, 014 | present in primary SPEC text |

### A.3 Open-question coverage (BRD-OQ-01 to BRD-OQ-20)

| BRD-OQ | Topic | Implemented by (primary) |
|---|---|---|
| OQ-01 | Local credentials, no SSO | SPEC-002 |
| OQ-02 | User ID convention; password, lockout, session standards (5 failures / 30-minute lock / 30-minute idle / 8+ characters with upper, lower, number, special) | SPEC-002, SPEC-004 |
| OQ-03 | Credentials delivered by official company email | SPEC-004, SPEC-012 |
| OQ-04 | Receiving Manager stage configurable by Super Admin | SPEC-007, SPEC-003 |
| OQ-05 | Reserve capacity only at HR validation/approval | SPEC-005 |
| OQ-06 | Concurrency and hold/closure rules | SPEC-005 |
| OQ-07 | HR organisation metadata and source | SPEC-008, SPEC-003 |
| OQ-08 | Documents: PDF/image, 5 MB, local storage, no scan/retention/delete policy | SPEC-011 |
| OQ-09 | Performance/availability/backup/monitoring targets (deferred) | SPEC-015 |
| OQ-10 | Reviewer sequence, rejection, clarification, withdrawal, escalation | SPEC-007, SPEC-014, SPEC-003 |
| OQ-11 | No-IT-task transfers still need IT Final Approval | SPEC-009 |
| OQ-12 | Withdrawal rules | SPEC-010 |
| OQ-13 | Block/Resume/Cancel/Reassign roles and statuses | SPEC-010 |
| OQ-14 | HR Confirmation is an activity; HR then Payroll sequential; manual Payroll; 403 `INVALID_WORKFLOW_TRANSITION` | SPEC-007, SPEC-008, SPEC-009 |
| OQ-15 | Vacancy edge cases (resume revalidation, status change, manual release, Available = Open and capacity > 0) | SPEC-005 |
| OQ-16 | Eligibility gaps, HR-ineligible outcome | SPEC-006, SPEC-008 |
| OQ-17 | One active transfer: Draft not active, DB enforcement, 409, no cool-down | SPEC-006 |
| OQ-18 | HR-/IT-controlled stages, HR cancel limits, Draft exclusion, no cross-resume | SPEC-010 |
| OQ-19 | Per-field source of truth, no HR sync | SPEC-015, SPEC-004, SPEC-003 |
| OQ-20 | Effective Transfer Date roles, time zone, optional re-approval, expired date | SPEC-006 |

### A.4 Inventory coverage beyond requirement ids

Verified in `spec-traceability-matrix.md` section 3: 6 business objectives, 10 scope items plus proposed architecture, 8 actors/hierarchy items, the 24 Business Rules bullets, every BRD-027 matrix row, the 40 acceptance bullets, the 24 BRD-039 scenarios, source-of-truth field table (14 field-ownership rows, SPEC-015), integration boundaries (no integration in the current phase; eleven required contract elements recorded as a checklist only), dependencies, assumptions and the out-of-scope list (Part K). Each has at least one owning SPEC.

---

## Part B - Optimisation summary

### B.1 From initial logical areas to the final 16 specs

The authoring brief decomposed the work into 17 logical areas (SPEC-001 to SPEC-017). The final set has 16. Two areas were merged; nothing was dropped. (Source: contract section 1 "Merge rationale"; the brief text itself is not stored in the repository.)

| Initial logical area (brief) | Final SPEC | Change |
|---|---|---|
| 001 Project foundation / architecture / DB | SPEC-001 | Unchanged in scope; **now also hosts the audit and notification kernels** (B.3) |
| 002 Identity, authentication, authorization | SPEC-002 | Unchanged |
| 003 Admin portal, master data, organisation structure | SPEC-003 | Unchanged; also owns Reporting Manager source `reporting_manager_assignments` |
| 004 User provisioning / user administration | SPEC-004 | Unchanged |
| 005 Vacancy and reservation | SPEC-005 | Unchanged |
| 006 Transfer initiation and eligibility | SPEC-006 | Unchanged |
| 007 Workflow engine and approvals | SPEC-007 | Unchanged; owns the full BRD-027 registry |
| 008 HR review and re-approval | SPEC-008 | Unchanged |
| 009 Payroll, IT, completion | SPEC-009 | Unchanged |
| 010 Exception controls (withdraw/block/resume/cancel/reassign) | SPEC-010 | Unchanged |
| 011 Documents | SPEC-011 | Unchanged |
| 012 Notifications | SPEC-012 | Unchanged; enqueue kernel in SPEC-001, delivery here |
| 013 Audit and security events | SPEC-013 | Unchanged; record kernel in SPEC-001, visibility/export/catalogue here |
| 014 Dashboards, worklists, reporting | SPEC-014 | Unchanged |
| 015 Source of truth and integration boundary | **SPEC-015** | **Merged** with the brief's SPEC-016 |
| 016 NFR and security hardening | **SPEC-015** | **Merged** into SPEC-015 (both are cross-cutting constraint specs with no standalone UI/domain, same architecture owner) |
| 017 QA / UAT / traceability | **SPEC-016** | Renumbered (brief's SPEC-017 becomes SPEC-016) |

### B.2 Resulting set

16 specs, **508 tasks** (`TASK-NNN.MM`), 479 acceptance criteria, 363 negative acceptance criteria, 252 Technical Design Decisions. SPEC-002 has the most tasks (38); SPEC-012 and SPEC-011 have the fewest (26, 27).

### B.3 Optimisations applied

| # | Optimisation | Effect |
|---|---|---|
| 1 | **Audit kernel in SPEC-001**: `AuditService.record(event,{trx})` and the append-only `audit_logs` table/trigger/privilege strategy | SPEC-002 to SPEC-012 can emit audit events in their own transaction before SPEC-013 delivers visibility, filters, export, catalogue verification, seals |
| 2 | **Notification kernel in SPEC-001**: `NotificationService.enqueue(eventCode,payload,{trx})` and transactional outbox table | Producers (006 to 010) enqueue without waiting for SPEC-012 (templates, Email + In-app dispatch, retry, idempotency, inbox) |
| 3 | Shared plumbing once, in SPEC-001: `withTransaction`, error classes, request-id, logger with redaction, config loader, response envelope, validation middleware, migration conventions, UI kit/layout shell, lock-order helpers | No duplicated infrastructure across specs |
| 4 | Auth kernel in SPEC-002: `users` identity columns, sessions, RBAC, `AuthorizationService.authorize`, `ScopeResolver` interface (data from SPEC-003/004), the Role x Resource x Action matrix (Part F) | One authorization pipeline, backend authoritative |
| 5 | **One workflow engine** (SPEC-007) with all 37 BRD-027 rows registered as data; feature SPECs 006/008/009/010 only register handlers and never write `transfer_requests.status` | The matrix is one reviewable, enumerable object (1,710-cell golden test) |
| 6 | **One source of truth per relationship**: `reporting_manager_assignments` (SPEC-003) is the single Reporting Manager source; `users.id` uuid is the only FK target (reconciliation R-1, R-2) | No duplicated, driftable data |
| 7 | One canonical lock order everywhere: transfer, config, assignments, payroll/IT tasks, vacancies (ascending id), reservations (R-5) | Deadlock-free concurrency across 005/007/008/009/010 |
| 8 | Cross-spec decisions merged: credential hand-off `TDD-012.04 = TDD-001.04 = TDD-004.07`; profile update on completion `TDD-004.11 = TDD-015.03`; optional date-change re-approval `TDD-007.04 = TDD-008.05 = TDD-009.13`; single employee vacancy route (`TDD-006.04`); Reporting Manager source `TDD-003.08` | One Gate 1 answer closes several specs |
| 9 | SPEC-015 + SPEC-016 (brief) merged; SPEC-016 owns every traceability/coverage matrix and BRD-039 execution | Verification concentrated in one place, specs stay feature-focused |
| 10 | Reconciliation pass R-1 to R-15 (`spec-reconciliation-notes.md`): 15 items; edits minimal, in place, no TASK/AC/TC/TDD id renumbered or deleted | Consistent names, columns, signatures, status set (15 codes, 10 active) |

---

## Part C - Serial spec list

Spec files are in `D:\Project\Demo\sdd_v1\.ai-context\specs\`. "Depends on" lists hard dependencies; soft dependencies are in Part H. BRD refs show primary ownership (see A.2 for the full map). Task counts sum to 508.

| # | SPEC and title | Purpose | Major modules | Depends on | BRD refs (primary) | Tasks | AC / NAC / TDD | File |
|---|---|---|---|---|---|---|---|---|
| 1 | **SPEC-001** Project Foundation, Architecture & Database Foundation | Repository, backend/frontend and DB foundations plus shared kernels so later specs are buildable and consistent | Config, logger with redaction, request-id, error catalogue and constraint mapper, envelope, validation, health, migrations and `id_sequences`, `audit_logs` + immutability, DB roles, `withTransaction` and lock helpers, `SequenceService`, `AuditService`, `notification_outbox`, `NotificationService.enqueue`, business-date/Clock, pagination, Next.js shell, API client, UI kit, DataTable, state components, test harness | None (root) | Kernels for BRD-036, BRD-037, BRD-038, BRD-002, NFR-004, NFR-008 (no primary id) | 31 | 27 / 15 / 12 | `project-foundation-architecture.spec.md` |
| 2 | **SPEC-002** Identity, Authentication, Account Security & Authorization | Local-credential login, account lifecycle security, sessions, RBAC and the API authorization pipeline | `users`, `user_sessions`, PasswordService/Policy, TokenService/SessionService, login/change-password/logout/me, `authenticate`, password-change guard, `AuthorizationService`, `ScopeResolver` framework, `StagePolicy`, permission registry (Part F), Super Admin seeder, unlock API, FE login/change-password/session expiry/no-access | 001 (soft 003, 004 for scope data) | BRD-001, 006, 007, 008*, 025, 026; NFR-001, 002, 003 | 38 | 35 / 25 / 22 | `identity-access-security.spec.md` |
| 3 | **SPEC-003** Administration Portal, Master Data & Organisation Structure | Admin shell, master data and organisation-relationship/scope data | `locations`, `departments` (Business Units), `designations`, dependency registry and `MasterReferenceGuard`, `hr_scope_mappings`, `it_location_scopes`, `receiving_manager_scopes` [TDD-REQUIRED], `reporting_manager_assignments`, `OrgScopeProvider`, navigation registry, admin pages, dashboard shell | 001, 002 (soft 004, 014) | BRD-002, 003, 010, 016; NFR-008 | 30 | 34 / 20 / 10 | `admin-portal-master-data.spec.md` |
| 4 | **SPEC-004** User Provisioning, Role Assignment & User Administration | Provision accounts with organisational profiles; maintain profiles, assignments and account lifecycle | `employee_profiles`, `user_id_sequences`, `UserIdGenerator`, `TemporaryPasswordGenerator`, `UserProvisioningService.createUser` (user + profile in one transaction), credential e-mail trigger, role change, admin account actions (reset, unlock, activate, deactivate), FE create-user wizard and user lists | 001, 002, 003 (soft 007, 009, 012, 013) | BRD-004, 005, 008*, 009 | 33 | 36 / 20 / 16 | `user-provisioning-administration.spec.md` |
| 5 | **SPEC-005** Vacancy Management, Capacity & Reservation Engine | Vacancy data, capacity math and the reservation engine preventing over-allocation | `vacancies`, `vacancy_reservations`, capacity and status domain functions, `VacancyAdminService`, discovery/`checkSelectable`, `VacancyService` (`reserve`, `release`, `changeVacancy`, `finalizeAllocation`, `validateForResume`, `manualRelease`), effect registry, reconciliation script, admin/HR/employee UI | 001, 002, 003, 004, 006 (FK), 007 (effects) | BRD-017, 028 | 35 | 30 / 25 / 16 | `vacancy-capacity-reservation.spec.md` |
| 6 | **SPEC-006** Employee Transfer Initiation, Eligibility & Submission | Employee-side initiation, eligibility, Draft, submission and tracking; owns `transfer_requests` | `transfer_requests` + reference sequence + one-active partial unique index, `EffectiveDateService`, `EligibilityService` (BRD-029 rules), Draft service, submission service, SUBMIT handler, tracking queries, FE profile / vacancy browse / transfer form / my transfers / detail | 001, 002, 003, 004, 005 (read), 007 (gates submit and timeline) | BRD-011, 029, 030, 031, 032 (Draft slice) | 30 | 28 / 22 / 16 | `transfer-initiation-eligibility.spec.md` |
| 7 | **SPEC-007** Transfer Workflow Engine & Approval Lifecycle | The single backend-enforced state machine and the manager approval, rejection and clarification stages | `workflow_configuration`, `transfer_workflow_history`, `transfer_task_assignments`, `transfer_clarifications`, transition registry (37 + derived rows), `WorkflowEngine.transition`, guard chain and 403 `INVALID_WORKFLOW_TRANSITION`, handler registry, generic APPROVE/REJECT/clarification handlers, `TaskAssignmentService`, `WorkflowGuard`, approver UI, workflow configuration page | 001, 002, 003, 004, 005 (release hook), 006 (table) | BRD-012, 018, 019, 027, 033, 034 | 32 | 34 / 22 / 18 | `transfer-workflow-approval-lifecycle.spec.md` |
| 8 | **SPEC-008** HR Review, Organisation Processing & Receiving Manager Re-Approval | HR-controlled stage from Pending HR Review to hand-off into Payroll Processing, incl. BRD-024 re-approval loop | HR activity definitions and activities, `transfer_org_changes`, `transfer_reapproval_cycles`, validation checks, `EligibilityRevalidationService`, `HR_VALIDATE_APPROVE` (reserve), HR reject/clarify, `OrgChangeService`, vacancy change, `ReapprovalService`, Receiving Manager re-approval handlers, `TransferDateService`, `COMPLETE_HR_PROCESSING`, HR worklist/workspace UI | 001-007, 011 (soft), 012 (soft) | BRD-013, 020, 024, 032 (post-submission slice) | 34 | 30 / 27 / 12 | `hr-review-processing-reapproval.spec.md` |
| 9 | **SPEC-009** Payroll, IT Processing & Final Transfer Completion | Manual Payroll tracking, IT task execution, IT Final Approval, five-condition completion gate and atomic Completed transition | `payroll_activities`, `it_task_types`, `it_tasks` (+ comments, evidence), `it_stage_outcomes`, `it_final_approvals`, `PayrollService`, `ItAssignmentService`, `ItTaskService`, `CompletionGateService`, `IT_FINAL_APPROVE` completion transaction (`finalizeAllocation`), Super Admin date correction, IT task-type admin, FE Payroll worklist and IT queue | 001-008, 011 | BRD-014 | 34 | 30 / 30 / 15 | `payroll-it-completion.spec.md` |
| 10 | **SPEC-010** Transfer Exception & Administrative Control Workflows | Withdraw, Block, Resume, Cancel, Super Admin Reassign, final-state protection, reapplication rules | `blocked_from_status` and exception columns, `transfer_exception_actions`, `transfer_task_reassignments`, final-state immutability trigger, `ExceptionActionPolicy`, handlers for Withdraw/Block/Resume (revalidation)/Cancel/Reassign, `ReapplicationPolicy`, FE dialogs and Super Admin Transfers actions | 001-007 (hooks into 008, 009, 005) | BRD-035 (+ Withdraw/Block/Resume/Cancel/Reassign rows of BRD-027, OQ-12, 13, 18) | 31 | 29 / 32 / 15 | `transfer-exception-controls.spec.md` |
| 11 | **SPEC-011** Secure Document Management | Secure upload, storage, metadata, scoped retrieval and audit of documents | `document_categories`, `documents`, storage bootstrap, `FileTypePolicy`, `FileNameSanitiser`, upload stream middleware, 413/415 error mapping, `DocumentAccessPolicy`, upload/list/download endpoints, no-delete guard (405), IT evidence hook, FE `DocumentUploader`/`DocumentList`, Documents admin module | 001, 002, 003, 004, 006, 007 (hosts in 008, 009) | BRD-021; NFR-007 (co) | 27 | 22 / 22 / 15 | `secure-document-management.spec.md` |
| 12 | **SPEC-012** Notification & Communication Framework | Reliable, idempotent, auditable Email + In-app delivery decoupled from the transfer transaction | Outbox extension, deliveries/attempts/inbox tables, event catalogue and `PayloadGuard`, templates, `RecipientResolver`, `SecretHandoffService`, full `enqueue`, `EmailTransport`, in-app channel, `DeliveryProcessor`/worker, retry, inbox and admin APIs, FE bell/inbox/failed-notification pages | 001, 002, 003, 004, 006, 007 (callers 008-010) | BRD-036; BRD-023 (co); NFR-006 (co) | 26 | 24 / 15 / 16 | `notification-framework.spec.md` |
| 13 | **SPEC-013** Audit, Compliance & Security Event Management | Complete audit trail: catalogue, immutability, tamper evidence, redaction, visibility, search, export, UI, failure policy | Additive `audit_logs` extension, participants/seals/spool tables, DB hardening, event catalogue and payload schemas, `AuditRedactor`, hardened `record` and `recordIndependent`, seal worker/verifier, `AuditVisibilityPolicy`, query/list/detail/timeline/export/integrity endpoints, FE Audit Logs and `TransferAuditTimeline` | 001, 002, 003, 004, 007 (emitters 005-012) | BRD-022, 037; NFR-005 | 31 | 28 / 24 / 20 | `audit-compliance-security-events.spec.md` |
| 14 | **SPEC-014** Dashboards, Worklists, Reporting & Operational Visibility | Role-aware dashboards, worklists, operational reports, overdue identification, escalation configuration (no invented timings) | `escalation_settings`, `overdue_flags`, read-model indexes, `ReportScopeBuilder`, dashboard/worklist/IT worklist/report services and registry (`REPORT_POLICY`), overdue evaluator and `TRANSFER_TASK_OVERDUE` enqueue, FE dashboards, worklists, reports, escalation page | 001-007 (reads 008, 009, 010), 012, 013 | BRD-023 (co) | 32 | 24 / 16 / 14 | `dashboards-worklists-reporting.spec.md` |
| 15 | **SPEC-015** Source of Truth, Integration Boundary, NFR & Security Hardening | Field-ownership enforcement, in-flight snapshot rules, no-integration boundary, NFR-001..009 and BRD-038 verification, production-readiness gate | Field-ownership registry and write guard, snapshot tests, integration port interfaces and outbound-call guard, contract template and harness, headers/CORS/rate limits, SQL-safety and leakage scans, TLS arrangement, performance input register and plan, timeout config, health/readiness, infrastructure checklist, NFR control matrix, readiness gate | 001-013 (executed with 016) | BRD-038; NFR-004, NFR-009; NFR-006 and NFR-007 (co) | 34 | 38 / 32 / 22 | `data-ownership-integration-nfr-hardening.spec.md` |
| 16 | **SPEC-016** End-to-End QA, UAT, Negative Testing & BRD Traceability | Master test strategy, BRD-039 execution and exit rule, journeys, concurrency, UAT, traceability and release gates | QA support library and seed, environment guard, traceability tooling, scenario packs S/W/V/I, journeys P01-P25, concurrency C-01..C-12, UI E2E smoke, UAT pack, performance prerequisites guard, CI gates, pre-production gate, release checklist, evidence pack | 001 (harness) then 002-015 | BRD-039 | 30 | 30 / 16 / 13 | `qa-uat-traceability.spec.md` |

\* BRD-008 is co-owned by SPEC-002 and SPEC-004.

---

## Part E - Complete workflow transition matrix

Source of the rows: BRD-027 (matrix lines 234-253, Withdraw rows 349-352, Block/Resume/Cancel/Reassign rows 496-508) as registered in SPEC-007 section 16.2 (`TR-001` to `TR-037`, handler owner in brackets), with the stage behaviour read from SPEC-006 (Submit), SPEC-008 (HR rows), SPEC-009 (Payroll/IT rows), SPEC-010 (Withdraw/Block/Resume/Cancel/Reassign) and SPEC-005 (reservation). The backend validates `Authenticated User -> Role -> Organisation Scope -> Transfer Request -> Current Status -> Requested Action -> Allowed Next Status` for every row `[BRD-027]`. All transitions run through `WorkflowEngine.transition` in one DB transaction that also writes `transfer_workflow_history`, the audit row and the notification outbox row; notification delivery is asynchronous and never rolls the transaction back `[BRD-036]`.

### E.0 Legend

| Item | Meaning |
|---|---|
| Status codes `[PROPOSED]` (labels `[BRD-019/027]`) | `DRAFT`, `PRM` = `PENDING_REPORTING_MANAGER_APPROVAL`, `PRcvM` = `PENDING_RECEIVING_MANAGER_APPROVAL`, `INFO` = `INFO_REQUIRED`, `PHR` = `PENDING_HR_REVIEW`, `HRP` = `HR_PROCESSING`, `REAPP` = `PENDING_RECEIVING_MANAGER_REAPPROVAL`, `PAY` = `PAYROLL_PROCESSING`, `PITA` = `PENDING_IT_ACTION`, `PITFA` = `PENDING_IT_FINAL_APPROVAL`, `BLK` = `BLOCKED`; final: `COMPLETED`, `REJECTED`, `WITHDRAWN`, `CANCELLED`. Active (BRD-030) = every status except `DRAFT` and the four final statuses (so `BLK` and `INFO` are active). HR-controlled: `PHR`, `HRP`, `PAY`. IT-controlled: `PITA`, `PITFA` |
| Source column | `B` = stated by the BRD-027 matrix (`B01` to `B37` numbered in BRD order: B01 Draft Submit; B02-B04 Reporting Manager; B05-B07 Receiving Manager; B08 Info Required response; B09-B11 HR review; B12 HR change; B13-B14 re-approval; B15 Complete HR Processing; B16 Payroll; B17-B18 IT; B19 IT Final Approval; B20 Completed; B21-B24 Withdraw; B25-B27 Block; B28-B30 Resume; B31-B35 Cancel; B36-B37 Reassign). `BT` = stated in BRD-027 text/Open Question resolution but not a matrix row. **`DERIVED`** = follows necessarily from BRD text, not a matrix row |
| Scope abbreviations | `S-EMP` own request. `S-RM` caller is the pending owner of the stage AND the employee is in the caller's reporting hierarchy (`reporting_manager_assignments`, SPEC-003). `S-RCV` caller is the pending owner AND the request is in the Receiving Manager's target-team scope **[TDD-REQUIRED]** (TDD-003.01, TDD-007.02). `S-HR` HR location/organisation scope (`hr_scope_mappings`) AND pending owner. `S-IT` IT location scope (`it_location_scopes`) AND current assignee. `S-SA` global. Super Admin does not bypass stage rules |
| **SIR** (standard invalid-action result) | HTTP **403** `INVALID_WORKFLOW_TRANSITION`, message "The requested action is not permitted for the current transfer status." `[BRD-027, BRD-OQ-14(d)]`. Transfer status unchanged; no approval, task, vacancy update or notification tied to the attempt is executed; the refused attempt is recorded as a security audit event (user, role, transfer id, current status, attempted action, date/time, rejection reason code) written in a separate short transaction so it persists after rollback. Missing or invalid authentication is 401; an unreadable (out-of-scope) transfer on a read endpoint is 403 `FORBIDDEN` |
| Audit column | Every successful row also writes `TRANSFER_STATUS_CHANGED` (SPEC-007) with from/to status, action, rule id, actor, role, reason, history id. The codes shown are the additional row-specific events `[PROPOSED]` |
| Reason column | "Reason" = mandatory reason/question/remark in the payload; a missing reason is a 400/422 validation error (status unchanged), not a transition |

### E.1 BRD-027 matrix rows and derived rows

| # | Current Status | Action | Actor | Required Scope | Validation | Next Status | Reservation Effect | Notification | Audit | Invalid Action Result |
|---|---|---|---|---|---|---|---|---|---|---|
| E01 `TR-001` B01 [006] | `DRAFT` | `SUBMIT` | EMPLOYEE | S-EMP | Draft only; eligibility rules BRD-029 (Active employment status, mandatory profile data, Available vacancy, no other active request); effective date today to +30 days inclusive in business time zone; selected vacancy OPEN with capacity > 0 (read only); one-active rule enforced by backend and DB partial unique index; workflow configuration present (TDD-007.01); reference assigned (TDD-006.02) | `PRM` | None (no reservation at submission) | `TRANSFER_SUBMITTED` (Employee), `APPROVAL_REQUIRED` (Reporting Manager) | `TRANSFER_SUBMITTED`; refusals `TRANSFER_SUBMISSION_REFUSED_ACTIVE_EXISTS`, `TRANSFER_SUBMISSION_REFUSED_INELIGIBLE` | Active request exists: 409 `ACTIVE_TRANSFER_ALREADY_EXISTS` with the BRD message, existing request unchanged. Eligibility/data/date/vacancy failures: 422 `EMPLOYEE_PROFILE_INCOMPLETE`, `EMPLOYEE_NOT_ELIGIBLE`, `VACANCY_NOT_AVAILABLE`, `INVALID_EFFECTIVE_DATE` `[PROPOSED]` codes. Not Draft / not owner: SIR |
| E02 `TR-002` B02 [007] | `PRM` | `APPROVE` | REPORTING_MANAGER | S-RM | Pending owner; not the requester (no self-approval); status compare-and-set under row lock | `PRcvM` if Receiving Manager stage enabled, else `PHR` (`routeAfterReportingManagerApproval`, BRD-012) | None | `APPROVAL_COMPLETED` (Employee + next approver), `APPROVAL_REQUIRED` (Receiving Manager) or `HR_ACTION_REQUIRED` (HR) | `TRANSFER_STAGE_APPROVED` (with routing decision) | SIR |
| E03 `TR-003` B03 [007] | `PRM` | `REJECT` | REPORTING_MANAGER | S-RM | Reason; pending owner | `REJECTED` (final) | Any applicable reservation released (idempotent when none) | `TRANSFER_REJECTED` (Employee, reason) | `TRANSFER_REJECTED` (rejected by, reason, date/time) | SIR |
| E04 `TR-004` B04 [007] | `PRM` | `REQUEST_CLARIFICATION` | REPORTING_MANAGER | S-RM | Reason/question; pending owner; opens a `transfer_clarifications` cycle, stores return status | `INFO` | No change | `CLARIFICATION_REQUESTED` (Employee) | `CLARIFICATION_REQUESTED` (cycle no, return status, responsible user) | SIR |
| E05 `TR-005` B05 [007] | `PRcvM` (only exists when enabled) | `APPROVE` | RECEIVING_MANAGER | S-RCV | Pending owner; stage enabled | `PHR` | None | `APPROVAL_COMPLETED` (Employee), `HR_ACTION_REQUIRED` (HR) | `TRANSFER_STAGE_APPROVED` | SIR |
| E06 `TR-006` B06 [007] | `PRcvM` | `REJECT` | RECEIVING_MANAGER | S-RCV | Reason | `REJECTED` | Any applicable reservation released | `TRANSFER_REJECTED` | `TRANSFER_REJECTED` | SIR |
| E07 `TR-007` B07 [007] | `PRcvM` | `REQUEST_CLARIFICATION` | RECEIVING_MANAGER | S-RCV | Reason/question | `INFO` | No change | `CLARIFICATION_REQUESTED` | `CLARIFICATION_REQUESTED` | SIR |
| E08 `TR-008` B08 [007] | `INFO` | `RESPOND_CLARIFICATION` | EMPLOYEE (default responsible user; who responds when HR or the Receiving Manager at re-approval asked is **[TDD-REQUIRED]** TDD-007.05) | S-EMP; open clarification | Response text required; an OPEN clarification must exist | Previous approval/review stage (`returnAfterClarification`: `PRM`, `PRcvM`, `PHR` or `REAPP`), same reviewer, multiple cycles allowed, no restart | Existing reservation/state retained | `CLARIFICATION_RESPONDED` (requesting approver) | `CLARIFICATION_RESPONDED` (cycle no, responded by, requested by) | SIR (also for a non-responsible user) |
| E09 `TR-009` B09 [008] | `PHR` | `HR_VALIDATE_APPROVE` | HR | S-HR | Eligibility revalidated (BRD-029, mandatory data, vacancy still selectable); vacancy capacity validated and reserved atomically in the same transaction; pending owner | `HRP` | **Vacancy capacity validated and reserved** (`VacancyService.reserve`, idempotent per transfer; vacancy must be OPEN and available > 0) | `APPROVAL_COMPLETED` (Employee), `HR_ACTION_REQUIRED` (assigned HR / relevant team) | `HR_VALIDATE_APPROVE`, `HR_REVALIDATION_RUN`, `VACANCY_RESERVED` | Capacity unavailable / vacancy not OPEN: 409 `VACANCY_CAPACITY_UNAVAILABLE` `[PROPOSED]` code, status unchanged, `VACANCY_RESERVATION_FAILED` + `HR_VALIDATE_APPROVE_REFUSED` audited. Ineligible: 422. Wrong status/role/scope: SIR |
| E10 `TR-010` B10 [007 + 008] | `PHR` | `REJECT` | HR | S-HR | Reason (BRD-OQ-16(c) HR-ineligible outcome); pending owner | `REJECTED` | Reservation released if one exists | `TRANSFER_REJECTED` (Employee; reason visibility TDD-008.07) | `HR_REJECT`, `TRANSFER_REJECTED` | SIR |
| E11 `TR-011` B11 [007 + 008] | `PHR` | `REQUEST_CLARIFICATION` | HR | S-HR | Reason/question | `INFO` (returns to `PHR`, same HR) | Reservation retained if already created | `CLARIFICATION_REQUESTED` (Employee or responsible user, TDD-008.02) | `HR_CLARIFICATION_REQUESTED` | SIR |
| E12 `TR-012` B12 [008] | `HRP` | `HR_CHANGE_ORG_DATA` (Department/BU, Designation, Location, Reporting Manager) | HR | S-HR | Change reason; target values from active masters; vacancy revalidated; changed fields recorded (previous/new/by/time/reason) | `REAPP` when one of the four fields changed and Receiving Manager approval is enabled (`routeAfterOrgChange`, BRD-024) | Revalidated; old/new reservation adjusted atomically when the vacancy changes (`changeVacancy`) | `REAPPROVAL_REQUIRED` / `APPROVAL_REQUIRED` (Receiving Manager + Employee) | `ORG_DATA_CHANGED`, `REAPPROVAL_TRIGGERED`, `VACANCY_CHANGED_BY_HR`, `VACANCY_CHANGED` | New vacancy unavailable: 409, nothing changed. Wrong status/role/scope: SIR |
| E13 `TR-013` B13 [007] | `REAPP` | `APPROVE` | RECEIVING_MANAGER | S-RCV | Pending owner; open re-approval cycle | `HRP` (HR confirms updated organisation information; HR activities reset) | Existing valid reservation retained | `APPROVAL_COMPLETED` (HR + Employee), `HR_ACTION_REQUIRED` | `REAPPROVAL_APPROVED`, `HR_ACTIVITY_RESET` | SIR |
| E14 `TR-014` B14 [007] | `REAPP` | `REJECT` | RECEIVING_MANAGER | S-RCV | Reason | `REJECTED` | Vacancy reservation released | `TRANSFER_REJECTED` (HR + Employee) | `REAPPROVAL_REJECTED`, `TRANSFER_REJECTED` | SIR |
| E15 `TR-016` B15 [008/009] | `HRP` | `COMPLETE_HR_PROCESSING` | HR | S-HR | All mandatory HR activities complete incl. HR confirmation (catalogue **[TDD-REQUIRED]** TDD-008.01); pending owner | `PAY` | None (HR activities must be complete before Payroll begins) | `PAYROLL_TASK_ASSIGNED` (HR/Payroll users) | `HR_PROCESSING_COMPLETED`, `PAYROLL_ACTIVITY_OPENED` | Mandatory activity open: 409/422 (status unchanged). Wrong status/role: SIR |
| E16 `TR-017` B16 [009] | `PAY` | `MARK_PAYROLL_COMPLETED` | HR (authorised; which HR users **[TDD-REQUIRED]** TDD-009.01) | S-HR | Manual completion (no Payroll API/callback); remarks where applicable; reference (format **[TDD-REQUIRED]** TDD-009.02) | `PITA` | None | `IT_TASK_ASSIGNED` (assigned IT user / relevant users) | `PAYROLL_COMPLETED` (status, completed by, date/time, reference, remarks), `IT_TASK_CREATED` | Double click: second request SIR. Wrong status/role: SIR |
| E17 `TR-018` B17 [009] | `PITA` | `COMPLETE_IT_TASKS` | IT | S-IT | No task BLOCKED/open (else 409 `IT_TASKS_INCOMPLETE`); task type set | `PITFA` | None (IT tasks marked complete) | `IT_TASKS_COMPLETED` (Employee/relevant users), `APPROVAL_REQUIRED` (IT approver) | `IT_TASKS_COMPLETED`, `IT_TASK_COMPLETED` | 409 `IT_TASKS_INCOMPLETE`; otherwise SIR |
| E18 `TR-019` B18 [009] | `PITA` | `NO_IT_ACTION_REQUIRED` | IT | S-IT | Reason/remark mandatory; no IT work already recorded (else 409 `IT_WORK_ALREADY_RECORDED`) | `PITFA` | None (no IT provisioning required) | `NO_IT_ACTION_REQUIRED_RECORDED` (relevant users), `APPROVAL_REQUIRED` | `NO_IT_ACTION_REQUIRED_RECORDED`, `IT_TASK_CANCELLED` | SIR |
| E19 `TR-020` B19 [009] | `PITFA` | `IT_FINAL_APPROVE` | IT | S-IT | Completion gate, five conditions `[BRD-027]`: (1) all mandatory manager/HR approvals complete, (2) required HR organisation-metadata activities complete, (3) mandatory Payroll complete, (4) IT tasks complete or No IT Action Required, (5) IT Final Approval; effective date not expired (BRD-031); atomic with `finalizeAllocation` | `COMPLETED` (final) | **Reservation becomes final allocation / filled capacity** (`finalizeAllocation`, same transaction) | `TRANSFER_COMPLETED` (Employee + relevant stakeholders) | `IT_FINAL_APPROVED`, `TRANSFER_COMPLETED`, `VACANCY_ALLOCATION_FINALIZED`; refusal `IT_FINAL_APPROVAL_REFUSED` | Gate fails (e.g. Payroll incomplete, expired date): refused, status unchanged, audited. Any other role or status: SIR |
| E20 B20 | `COMPLETED` | none | none | none | No transition out of a final status; Employee editing not allowed | none | Allocation already final | Completion notification already sent | none | Any action: SIR (no row out of any final status; DB trigger is the last defence, SPEC-010) |
| E21 `TR-021` B21 [010] | `PRM` | `WITHDRAW` | EMPLOYEE | S-EMP | Owner; reason mandatory | `WITHDRAWN` (final, never reopened) | Any exceptional reservation released immediately; downstream tasks cancelled where applicable | `TRANSFER_WITHDRAWN` (pending approver; Employee confirmation `[PROPOSED]`) | `TRANSFER_WITHDRAWN` (request id, employee, previous status, reason, withdrawn by, date/time), `DOWNSTREAM_TASKS_CANCELLED` | SIR |
| E22 `TR-022` B22 [010] | `PRcvM` | `WITHDRAW` | EMPLOYEE | S-EMP | As E21 | `WITHDRAWN` | As E21 | `TRANSFER_WITHDRAWN` (pending approver) | As E21 | SIR |
| E23 `TR-023` B23 [010] | `INFO` | `WITHDRAW` | EMPLOYEE | S-EMP | As E21; open clarification closed | `WITHDRAWN` | As E21 | `TRANSFER_WITHDRAWN` (requesting approver) | As E21 | SIR |
| E24 `TR-024` B24 [010] | `PHR` | `WITHDRAW` | EMPLOYEE | S-EMP | As E21; last permitted stage ("until HR approves"). Race with HR approve: exactly one wins under the transfer row lock | `WITHDRAWN` | As E21 (no reservation normally exists before HR approval) | `TRANSFER_WITHDRAWN` (HR) | As E21 | After HR approves (`HRP` or later): SIR; the separate Cancel process applies |
| E25 `TR-025` B25 [010] | any active non-final status (`PRM`, `PRcvM`, `INFO`, `PHR`, `HRP`, `REAPP`, `PAY`, `PITA`, `PITFA`); `BLK` itself excluded (DERIVED) | `BLOCK` | SUPER_ADMIN | S-SA | Reason mandatory; Draft excluded; stores `blocked_from_status` | `BLK` (previous status stored) | Reservation retained; no normal processing while Blocked | `TASK_BLOCKED` (catalogue code in SPEC-007/012; SPEC-010 writes it as `TRANSFER_BLOCKED`, see M.3; relevant stakeholders, TDD-010.04) | `TRANSFER_BLOCKED` (previous status, reason, blocked by) | Block on `BLK`, `DRAFT` or final status: SIR |
| E26 `TR-026` B26 [010] | `PHR`, `HRP`, `PAY` | `BLOCK` | HR | S-HR (HR-controlled stages only) | Reason; stage in HR-controlled set | `BLK` | Retained | As E25 | As E25 | Any other stage: SIR (`ORIGIN_STAGE_MISMATCH` / `STATUS_NOT_ALLOWED` internal code) |
| E27 `TR-027` B27 [010] | `PITA`, `PITFA` | `BLOCK` | IT | S-IT (IT-controlled stages only) | Reason | `BLK` | Retained | As E25 | As E25 | Any other stage: SIR |
| E28 `TR-028` B28 [010] | `BLK` | `RESUME` | SUPER_ADMIN | S-SA | Remarks recorded; revalidation of relevant business conditions incl. vacancy validity/capacity (`validateForResume`, BRD-OQ-15(a)) | Stored `blocked_from_status` | Existing reservation continues; vacancy FULL is allowed on an existing reservation; ON_HOLD/CLOSED vacancy fails revalidation | `TRANSFER_RESUMED` (relevant stakeholders) | `TRANSFER_RESUMED` (blocked-from, new status, remarks, revalidation result) | Not `BLK`: SIR |
| E28b `BT` | `BLK` | `RESUME` (revalidation fails) | SUPER_ADMIN / HR / IT as E28-E30 | as E28-E30 | Failed check: vacancy deleted/closed/on hold, reservation missing or invalid, capacity exceeded, employee/vacancy mismatch, conflicting final allocation | Remains `BLK` until HR/Super Admin resolve | Unchanged (never auto-released by a vacancy status change) | none | `TRANSFER_RESUME_REVALIDATION_FAILED`, `VACANCY_RESUME_VALIDATION_FAILED` | 409 `RESUME_REVALIDATION_FAILED` / `RESERVATION_INVALID` `[PROPOSED]` codes; status unchanged |
| E29 `TR-029` B29 [010] | `BLK` blocked during an HR-controlled stage | `RESUME` | HR | S-HR | Stored pre-block status in `PHR`/`HRP`/`PAY`; revalidation as E28 | Previous HR-controlled status | As E28 | As E28 | As E28 | HR resuming an IT-origin block: SIR + security audit (no cross-resume). Whether HR may resume a Super-Admin-placed block: **[TDD-REQUIRED]** TDD-010.01 |
| E30 `TR-030` B30 [010] | `BLK` blocked during an IT-controlled stage | `RESUME` | IT | S-IT | Stored pre-block status in `PITA`/`PITFA`; revalidation as E28 | Previous IT-controlled status | As E28 | As E28 | As E28 | IT resuming an HR-origin block: SIR + security audit |
| E31 `TR-031` B31, B35 [010] | any active status including `BLK` (10 statuses) | `CANCEL` | SUPER_ADMIN | S-SA | Reason mandatory; Draft and final statuses excluded | `CANCELLED` (final, not reopenable) | Reservation released; pending Payroll/IT tasks cancelled where applicable | `TRANSFER_CANCELLED` (Employee + relevant stakeholders) | `TRANSFER_CANCELLED`, `VACANCY_RESERVATION_RELEASED`, `DOWNSTREAM_TASKS_CANCELLED` | Completed/Rejected/Withdrawn/Cancelled: SIR |
| E32 `TR-032` B32 [010] | `PHR`, `HRP`, `PAY` | `CANCEL` | HR | S-HR | Reason | `CANCELLED` | As E31 | As E31 | As E31 | Other active stages (`PRM`, `PRcvM`, `INFO`, `REAPP`, `PITA`, `PITFA`): SIR (Super Admin only) |
| E33 `TR-033` B33 [010] | `BLK` blocked during an HR-controlled stage (including blocked by HR itself) | `CANCEL` | HR | S-HR; stored pre-block status in HR set | Reason | `CANCELLED` | As E31 | Employee + relevant stakeholders | As E31 | See E34 |
| E34 `TR-033` B34 [010] | `BLK` blocked during an IT-controlled stage | `CANCEL` | HR | S-HR | HR is **refused** (BRD "Refused - HR cannot cancel an IT-blocked request") | No change (stays `BLK`) | No change | none | Security audit `SECURITY_INVALID_WORKFLOW_TRANSITION` (denial reason `ORIGIN_STAGE_MISMATCH`) | SIR |
| E35 `TR-034` B36 [010] | `PRM`, `PRcvM`, `PHR`, `HRP`, `REAPP`, `PAY`, `PITA`, `PITFA` (active pending task; `INFO` and `BLK` denied by default, **[TDD-REQUIRED]** TDD-007.11, TDD-010.03) | `REASSIGN` | SUPER_ADMIN | S-SA; new assignee must hold the required role AND organisation/location scope | Reason mandatory; assignee active, different from current (422 `ASSIGNEE_UNCHANGED`), eligible (422 `ASSIGNEE_NOT_ELIGIBLE`); an OPEN task must exist (409 `TASK_NOT_REASSIGNABLE`) | Same status (only the responsible assignee changes) | No change; no re-approval; completed approvals stay valid | `TASK_REASSIGNED` (new assignee; previous assignee informational `[PROPOSED]`) | `TASK_REASSIGNED` (previous assignee, new assignee, reassigned by, reason, date/time, stage), `WORKFLOW_TASK_ASSIGNED` | Previous assignee acting afterwards: SIR |
| E36 `TR-034` B37 [010] | any active task | `REASSIGN` | HR, IT, REPORTING_MANAGER, RECEIVING_MANAGER, EMPLOYEE | none | **Refused** - only Super Admin may reassign (BRD-035) | No change | No change | none | `SECURITY_REASSIGN_REFUSED` | SIR |
| E37 `[DERIVED]` `TR-015` [007/008] | `REAPP` | `REQUEST_CLARIFICATION` | RECEIVING_MANAGER | S-RCV | BRD-024 lets the Receiving Manager "request clarification" but the BRD matrix has no row; reason/question; responder **[TDD-REQUIRED]** TDD-007.06, TDD-007.05 | `INFO` (returns to `REAPP`) | Retained | `CLARIFICATION_REQUESTED` (responder; default HR per SPEC-008, Employee per SPEC-007 - to be aligned at Gate 1) | `REAPPROVAL_CLARIFICATION_REQUESTED`, `CLARIFICATION_REQUESTED` | SIR |
| E38 `[DERIVED]` (no-re-approval path) [008] | `HRP` | `HR_CHANGE_ORG_DATA` when Receiving Manager approval is disabled, or when only non-triggering fields change | HR | S-HR | BRD-024 "continues without returning"; same validation as E12 | Stays `HRP` (self-loop, history entry, no status change) | As E12 | none (history only) | `ORG_DATA_CHANGED` | SIR for other statuses |
| E39 `[DERIVED]` `TR-035` [007] | `PRM`, `PRcvM`, `REAPP` | `ADD_COMMENT` | REPORTING_MANAGER / RECEIVING_MANAGER (matching stage) | S-RM / S-RCV | BRD-012 and BRD-024 "add comments"; comment text required | Same status (history entry) | None | none | `WORKFLOW_COMMENT_ADDED`, `REAPPROVAL_COMMENT_ADDED` | SIR |
| E40 `[DERIVED]` `TR-036` [008] | `PHR`, `HRP`, `PAY` | `CHANGE_EFFECTIVE_DATE` | HR | S-HR (`PAY`: authorised HR) | BRD-031: today to +30 days inclusive; reason; HR may change during approval; expired date must be corrected before completion | Same status, or the configured re-approval stage when Super Admin enabled it (off by default; `routeAfterDateChange`, **[TDD-REQUIRED]** TDD-007.04 = TDD-008.05 = TDD-009.13) | None | `REAPPROVAL_REQUIRED` if routed | `EFFECTIVE_DATE_CHANGED` | SIR |
| E41 `[DERIVED]` `TR-037` [008/009] | `PRM`, `PRcvM`, `INFO`, `PHR`, `HRP`, `REAPP`, `PAY`, `PITA`, `PITFA` | `CHANGE_EFFECTIVE_DATE` | SUPER_ADMIN | S-SA | Administrative intervention beyond HR-controlled stages; same date rule; reason | Same status, or configured stage as E40 | None | `REAPPROVAL_REQUIRED` if routed | `EFFECTIVE_DATE_CORRECTED_BY_ADMIN` / `EFFECTIVE_DATE_CHANGED` | SIR |
| E42 `BT` | `REJECTED`, `WITHDRAWN`, `CANCELLED`, `COMPLETED` | any (including "reopen" or "resubmit") | any role | any | Final statuses are terminal; a new application is a new transfer request with a new reference, workflow restarted, eligibility and vacancy revalidated, no approvals carried forward (BRD-033, BRD-030) | none | none | none | `SECURITY_INVALID_WORKFLOW_TRANSITION` | SIR; no route exists to reopen |
| E43 `BT` | `BLK` | any normal action (approve, reject, HR change, Payroll complete, IT complete, IT final approve) | any role | any | While Blocked no normal approval/processing action is permitted; transfer remains active | none | Retained | none | `SECURITY_INVALID_WORKFLOW_TRANSITION` | SIR |

### E.2 Counts and test anchor

| Measure | Value | Source |
|---|---|---|
| BRD-027 matrix rows | 37 (20 original incl. the non-transition Completed row, 4 Withdraw, 13 Block/Resume/Cancel/Reassign incl. 2 explicit refusals) | BRD-027 |
| Registry rules | `TR-001` to `TR-037` (the two refusals are expressed as absence of an allowed cell plus the origin-stage guard on `TR-033`; Completed is "no row") | SPEC-007 16.2 |
| Derived rows | 4 registered (`TR-015`, `TR-035`, `TR-036`, `TR-037`) + the no-re-approval self-loop (E38), all tagged DERIVED | SPEC-007 16.3, SPEC-008 16 |
| Golden matrix test | 15 statuses x 6 roles x 19 actions = 1,710 cells; expected **78 allowed** (62 BRD-027-stated + 16 DERIVED), 1,632 denied, each denied cell asserted as SIR with no side effects and one security audit row | SPEC-007 16.4 |
| Allowed-set note | 78 vs 77 depends on accepting `TR-015` (TDD-007.06) | SPEC-007 TDD-007.06 |

### E.3 Responsibility split for the rows

| Rows | Registered by | Handler logic |
|---|---|---|
| E01 | SPEC-007 (registry) | SPEC-006 |
| E02-E08, E13-E14, E37, E39 | SPEC-007 | SPEC-007 (generic approve/reject/clarify handlers); trigger and cycle for E13/E14/E37 in SPEC-008 |
| E09-E12, E15, E38, E40 | SPEC-007 | SPEC-008 (E15 hand-off to SPEC-009 `PayrollService.openActivity` via entry hook) |
| E16-E20, E41 | SPEC-007 | SPEC-009 (E41 date correction beyond HR stages), SPEC-008 (E40) |
| E21-E36, E42-E43 | SPEC-007 | SPEC-010 |

---

## Part F - Role / permission / scope matrix (six roles)

Roles `[BRD-001]`: `SUPER_ADMIN`, `EMPLOYEE`, `REPORTING_MANAGER`, `RECEIVING_MANAGER`, `HR`, `IT`. This part is the expansion of the draft Role x Resource x Action matrix in SPEC-002 section 15.4 (`TASK-002.18` permission registry; "defined at spec level, not assumed", BRD-026), one row per resource, action and role. Backend/API is authoritative; frontend gating is UX only `[BRD-026]`. Chain per request: Authenticated User, Role, Organisation Scope, Resource, Action (401 for missing/invalid/expired authentication; 403 for authenticated but not permitted; 403 `INVALID_WORKFLOW_TRANSITION` for workflow actions in the wrong status).

### F.1 Reading the matrix

| Item | Meaning |
|---|---|
| Org scope | `All` = unrestricted organisational data (Super Admin). `Own` = caller is the owner/subject. `Assigned employees / reporting hierarchy` = ACTIVE `reporting_manager_assignments` row naming the caller (SPEC-003). `Assigned task / pending owner` = current pending owner in `transfer_task_assignments` (SPEC-007) or IT assignee. `Location / organisation scope` = HR location/organisation mapping (`hr_scope_mappings`) or IT location mapping (`it_location_scopes`) (SPEC-003). `Receiving Manager target-team scope` = `[TDD-REQUIRED]` (TDD-002.15, TDD-003.01) |
| Allowed / Denied | `Allowed` = permitted within the stated scope (a stage condition shown after "Stage condition" additionally requires the transfer to be in that status through `StagePolicy`). `Denied` = not permitted. Where the BRD does not define the answer the cell reads **Technical Design Decision Required - Not Defined by BRD**; the registry encodes it as deny until Gate 1 decides (each decision flips one registry row and its test) |
| Super Admin | `All` is a scope, not a stage bypass: Super Admin still cannot skip IT Final Approval or perform manager/HR/IT decisions on behalf (TDD-007.08 default: not allowed) `[BRD-027]` |
| SPEC | Spec that owns the behaviour; SPEC-002 owns the enforcement kernel for every row |
| BRD ref | Basis text from SPEC-002 15.4 (BRD ids; `DERIVED` = follows from the cited text) |

### F.2 Role summary (one line each, `[BRD]` actors table)

| Role | Primary responsibility | Visibility / scope |
|---|---|---|
| SUPER_ADMIN | Organisation setup, user administration, vacancy/capacity management, transfer administration, workflow configuration, audit export, Block/Cancel/Reassign | All configured organisational data and workflows |
| EMPLOYEE | Initiate and track own transfer requests, respond to clarification, withdraw before HR approval | Own profile, permitted vacancies, own transfer history |
| REPORTING_MANAGER | Review transfers of assigned employees (approve, reject, clarify, comment) | Assigned employees and related requests |
| RECEIVING_MANAGER (optional stage) | Review incoming transfers and re-approvals | Requests routed to the target team/organisation scope `[TDD-REQUIRED]` |
| HR | Eligibility validation, org confirmation, HR processing, manual Payroll completion, documents, Block/Resume/Cancel in HR-controlled stages | Assigned location/organisation employees and requests |
| IT | IT tasks, No IT Action Required, IT Final Approval, Block/Resume in IT-controlled stages | Assigned IT tasks and minimum required employee information (field list `[TDD-REQUIRED]` TDD-002.16) |

### F.3 Matrix (33 resource/action groups x 6 roles = 198 rows)

| Resource | Action | Role | Org scope | Allowed / Denied | SPEC | BRD ref |
|---|---|---|---|---|---|---|
| SESSION | CHANGE_PASSWORD / logout / me | SUPER_ADMIN | Own records only | Allowed | SPEC-002 | BRD-006, DERIVED |
| SESSION | CHANGE_PASSWORD / logout / me | EMPLOYEE | Own records only | Allowed | SPEC-002 | BRD-006, DERIVED |
| SESSION | CHANGE_PASSWORD / logout / me | REPORTING_MANAGER | Own records only | Allowed | SPEC-002 | BRD-006, DERIVED |
| SESSION | CHANGE_PASSWORD / logout / me | RECEIVING_MANAGER | Own records only | Allowed | SPEC-002 | BRD-006, DERIVED |
| SESSION | CHANGE_PASSWORD / logout / me | HR | Own records only | Allowed | SPEC-002 | BRD-006, DERIVED |
| SESSION | CHANGE_PASSWORD / logout / me | IT | Own records only | Allowed | SPEC-002 | BRD-006, DERIVED |
| USER_ACCOUNT | CREATE, UPDATE, ACTIVATE, DEACTIVATE, RESET_CREDENTIAL, UNLOCK, ASSIGN_ROLE | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-002 / SPEC-004 | BRD-004, 007, 010, 025 |
| USER_ACCOUNT | CREATE, UPDATE, ACTIVATE, DEACTIVATE, RESET_CREDENTIAL, UNLOCK, ASSIGN_ROLE | EMPLOYEE | — | Denied | SPEC-002 / SPEC-004 | BRD-004, 007, 010, 025 |
| USER_ACCOUNT | CREATE, UPDATE, ACTIVATE, DEACTIVATE, RESET_CREDENTIAL, UNLOCK, ASSIGN_ROLE | REPORTING_MANAGER | — | Denied | SPEC-002 / SPEC-004 | BRD-004, 007, 010, 025 |
| USER_ACCOUNT | CREATE, UPDATE, ACTIVATE, DEACTIVATE, RESET_CREDENTIAL, UNLOCK, ASSIGN_ROLE | RECEIVING_MANAGER | — | Denied | SPEC-002 / SPEC-004 | BRD-004, 007, 010, 025 |
| USER_ACCOUNT | CREATE, UPDATE, ACTIVATE, DEACTIVATE, RESET_CREDENTIAL, UNLOCK, ASSIGN_ROLE | HR | — | Denied | SPEC-002 / SPEC-004 | BRD-004, 007, 010, 025 |
| USER_ACCOUNT | CREATE, UPDATE, ACTIVATE, DEACTIVATE, RESET_CREDENTIAL, UNLOCK, ASSIGN_ROLE | IT | — | Denied | SPEC-002 / SPEC-004 | BRD-004, 007, 010, 025 |
| USER_ACCOUNT | VIEW / LIST (account status) | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-002 / SPEC-004 | BRD-010; HR visibility of account status for locations `?` |
| USER_ACCOUNT | VIEW / LIST (account status) | EMPLOYEE | Own records only | Allowed. Note: (self via /me) | SPEC-002 / SPEC-004 | BRD-010; HR visibility of account status for locations `?` |
| USER_ACCOUNT | VIEW / LIST (account status) | REPORTING_MANAGER | — | Denied | SPEC-002 / SPEC-004 | BRD-010; HR visibility of account status for locations `?` |
| USER_ACCOUNT | VIEW / LIST (account status) | RECEIVING_MANAGER | — | Denied | SPEC-002 / SPEC-004 | BRD-010; HR visibility of account status for locations `?` |
| USER_ACCOUNT | VIEW / LIST (account status) | HR | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-002 / SPEC-004 | BRD-010; HR visibility of account status for locations `?` |
| USER_ACCOUNT | VIEW / LIST (account status) | IT | — | Denied | SPEC-002 / SPEC-004 | BRD-010; HR visibility of account status for locations `?` |
| EMPLOYEE_PROFILE | VIEW | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-004 | BRD-011, 012, 013, 014 |
| EMPLOYEE_PROFILE | VIEW | EMPLOYEE | Own records only | Allowed | SPEC-004 | BRD-011, 012, 013, 014 |
| EMPLOYEE_PROFILE | VIEW | REPORTING_MANAGER | Assigned employees / reporting hierarchy | Allowed | SPEC-004 | BRD-011, 012, 013, 014 |
| EMPLOYEE_PROFILE | VIEW | RECEIVING_MANAGER | Not defined (candidate scope: Receiving Manager target-team scope [TDD-REQUIRED]) | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-004 | BRD-011, 012, 013, 014 |
| EMPLOYEE_PROFILE | VIEW | HR | Location / organisation scope (HR/IT mapping) | Allowed | SPEC-004 | BRD-011, 012, 013, 014 |
| EMPLOYEE_PROFILE | VIEW | IT | Not defined (candidate scope: Assigned task / pending owner) | Technical Design Decision Required — Not Defined by BRD (denied until decided) [minimum fields TDD-002.16] | SPEC-004 | BRD-011, 012, 013, 014 |
| EMPLOYEE_PROFILE | CREATE / UPDATE (master) | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-004 | BRD-010, 029 field ownership |
| EMPLOYEE_PROFILE | CREATE / UPDATE (master) | EMPLOYEE | — | Denied | SPEC-004 | BRD-010, 029 field ownership |
| EMPLOYEE_PROFILE | CREATE / UPDATE (master) | REPORTING_MANAGER | — | Denied | SPEC-004 | BRD-010, 029 field ownership |
| EMPLOYEE_PROFILE | CREATE / UPDATE (master) | RECEIVING_MANAGER | — | Denied | SPEC-004 | BRD-010, 029 field ownership |
| EMPLOYEE_PROFILE | CREATE / UPDATE (master) | HR | — | Denied | SPEC-004 | BRD-010, 029 field ownership |
| EMPLOYEE_PROFILE | CREATE / UPDATE (master) | IT | — | Denied | SPEC-004 | BRD-010, 029 field ownership |
| EMPLOYEE_PROFILE | UPDATE employment status | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-004 | BRD-029 "Super Admin / HR"; scope detail `?` |
| EMPLOYEE_PROFILE | UPDATE employment status | EMPLOYEE | — | Denied | SPEC-004 | BRD-029 "Super Admin / HR"; scope detail `?` |
| EMPLOYEE_PROFILE | UPDATE employment status | REPORTING_MANAGER | — | Denied | SPEC-004 | BRD-029 "Super Admin / HR"; scope detail `?` |
| EMPLOYEE_PROFILE | UPDATE employment status | RECEIVING_MANAGER | — | Denied | SPEC-004 | BRD-029 "Super Admin / HR"; scope detail `?` |
| EMPLOYEE_PROFILE | UPDATE employment status | HR | Not defined (candidate scope: Location / organisation scope) | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-004 | BRD-029 "Super Admin / HR"; scope detail `?` |
| EMPLOYEE_PROFILE | UPDATE employment status | IT | — | Denied | SPEC-004 | BRD-029 "Super Admin / HR"; scope detail `?` |
| MASTER_DATA | CREATE / UPDATE / ACTIVATE / DEACTIVATE | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-003 | BRD-010 |
| MASTER_DATA | CREATE / UPDATE / ACTIVATE / DEACTIVATE | EMPLOYEE | — | Denied | SPEC-003 | BRD-010 |
| MASTER_DATA | CREATE / UPDATE / ACTIVATE / DEACTIVATE | REPORTING_MANAGER | — | Denied | SPEC-003 | BRD-010 |
| MASTER_DATA | CREATE / UPDATE / ACTIVATE / DEACTIVATE | RECEIVING_MANAGER | — | Denied | SPEC-003 | BRD-010 |
| MASTER_DATA | CREATE / UPDATE / ACTIVATE / DEACTIVATE | HR | — | Denied | SPEC-003 | BRD-010 |
| MASTER_DATA | CREATE / UPDATE / ACTIVATE / DEACTIVATE | IT | — | Denied | SPEC-003 | BRD-010 |
| MASTER_DATA | LIST active (lookups for forms) | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-003 | DERIVED BRD-029 "from portal master data" |
| MASTER_DATA | LIST active (lookups for forms) | EMPLOYEE | All (unrestricted organisational data) | Allowed | SPEC-003 | DERIVED BRD-029 "from portal master data" |
| MASTER_DATA | LIST active (lookups for forms) | REPORTING_MANAGER | All (unrestricted organisational data) | Allowed | SPEC-003 | DERIVED BRD-029 "from portal master data" |
| MASTER_DATA | LIST active (lookups for forms) | RECEIVING_MANAGER | All (unrestricted organisational data) | Allowed | SPEC-003 | DERIVED BRD-029 "from portal master data" |
| MASTER_DATA | LIST active (lookups for forms) | HR | All (unrestricted organisational data) | Allowed | SPEC-003 | DERIVED BRD-029 "from portal master data" |
| MASTER_DATA | LIST active (lookups for forms) | IT | All (unrestricted organisational data) | Allowed | SPEC-003 | DERIVED BRD-029 "from portal master data" |
| VACANCY | CREATE / UPDATE / close / hold | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-005 | BRD-010 |
| VACANCY | CREATE / UPDATE / close / hold | EMPLOYEE | — | Denied | SPEC-005 | BRD-010 |
| VACANCY | CREATE / UPDATE / close / hold | REPORTING_MANAGER | — | Denied | SPEC-005 | BRD-010 |
| VACANCY | CREATE / UPDATE / close / hold | RECEIVING_MANAGER | — | Denied | SPEC-005 | BRD-010 |
| VACANCY | CREATE / UPDATE / close / hold | HR | — | Denied | SPEC-005 | BRD-010 |
| VACANCY | CREATE / UPDATE / close / hold | IT | — | Denied | SPEC-005 | BRD-010 |
| VACANCY | LIST / VIEW | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-005 | BRD-011 "subject to visibility rules", BRD-013 |
| VACANCY | LIST / VIEW | EMPLOYEE | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) [visibility rules TDD-j] | SPEC-005 | BRD-011 "subject to visibility rules", BRD-013 |
| VACANCY | LIST / VIEW | REPORTING_MANAGER | — | Denied | SPEC-005 | BRD-011 "subject to visibility rules", BRD-013 |
| VACANCY | LIST / VIEW | RECEIVING_MANAGER | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-005 | BRD-011 "subject to visibility rules", BRD-013 |
| VACANCY | LIST / VIEW | HR | Location / organisation scope (HR/IT mapping) | Allowed | SPEC-005 | BRD-011 "subject to visibility rules", BRD-013 |
| VACANCY | LIST / VIEW | IT | — | Denied | SPEC-005 | BRD-011 "subject to visibility rules", BRD-013 |
| VACANCY | RELEASE_RESERVATION | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-005 | BRD-028(c) (OQ-15) |
| VACANCY | RELEASE_RESERVATION | EMPLOYEE | — | Denied | SPEC-005 | BRD-028(c) (OQ-15) |
| VACANCY | RELEASE_RESERVATION | REPORTING_MANAGER | — | Denied | SPEC-005 | BRD-028(c) (OQ-15) |
| VACANCY | RELEASE_RESERVATION | RECEIVING_MANAGER | — | Denied | SPEC-005 | BRD-028(c) (OQ-15) |
| VACANCY | RELEASE_RESERVATION | HR | Location / organisation scope (HR/IT mapping) | Allowed | SPEC-005 | BRD-028(c) (OQ-15) |
| VACANCY | RELEASE_RESERVATION | IT | — | Denied | SPEC-005 | BRD-028(c) (OQ-15) |
| TRANSFER_REQUEST | CREATE / UPDATE (Draft) / SUBMIT | SUPER_ADMIN | — | Denied | SPEC-006 | BRD-011, 027, 032 |
| TRANSFER_REQUEST | CREATE / UPDATE (Draft) / SUBMIT | EMPLOYEE | Own records only | Allowed. Stage condition: @Draft | SPEC-006 | BRD-011, 027, 032 |
| TRANSFER_REQUEST | CREATE / UPDATE (Draft) / SUBMIT | REPORTING_MANAGER | — | Denied | SPEC-006 | BRD-011, 027, 032 |
| TRANSFER_REQUEST | CREATE / UPDATE (Draft) / SUBMIT | RECEIVING_MANAGER | — | Denied | SPEC-006 | BRD-011, 027, 032 |
| TRANSFER_REQUEST | CREATE / UPDATE (Draft) / SUBMIT | HR | — | Denied | SPEC-006 | BRD-011, 027, 032 |
| TRANSFER_REQUEST | CREATE / UPDATE (Draft) / SUBMIT | IT | — | Denied | SPEC-006 | BRD-011, 027, 032 |
| TRANSFER_REQUEST | WITHDRAW | SUPER_ADMIN | — | Denied | SPEC-010 | BRD-027 withdraw rows |
| TRANSFER_REQUEST | WITHDRAW | EMPLOYEE | Own records only | Allowed. Stage condition: @PENDING_REPORTING_MANAGER_APPROVAL, PENDING_RECEIVING_MANAGER_APPROVAL, INFO_REQUIRED, PENDING_HR_REVIEW | SPEC-010 | BRD-027 withdraw rows |
| TRANSFER_REQUEST | WITHDRAW | REPORTING_MANAGER | — | Denied | SPEC-010 | BRD-027 withdraw rows |
| TRANSFER_REQUEST | WITHDRAW | RECEIVING_MANAGER | — | Denied | SPEC-010 | BRD-027 withdraw rows |
| TRANSFER_REQUEST | WITHDRAW | HR | — | Denied | SPEC-010 | BRD-027 withdraw rows |
| TRANSFER_REQUEST | WITHDRAW | IT | — | Denied | SPEC-010 | BRD-027 withdraw rows |
| TRANSFER_REQUEST | VIEW / LIST | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-006 / SPEC-014 | BRD-001 actors table; BRD-011–014 |
| TRANSFER_REQUEST | VIEW / LIST | EMPLOYEE | Own records only | Allowed | SPEC-006 / SPEC-014 | BRD-001 actors table; BRD-011–014 |
| TRANSFER_REQUEST | VIEW / LIST | REPORTING_MANAGER | Assigned employees / reporting hierarchy | Allowed | SPEC-006 / SPEC-014 | BRD-001 actors table; BRD-011–014 |
| TRANSFER_REQUEST | VIEW / LIST | RECEIVING_MANAGER | Not defined (candidate scope: Receiving Manager target-team scope [TDD-REQUIRED]) | Technical Design Decision Required — Not Defined by BRD (denied until decided) [routed] | SPEC-006 / SPEC-014 | BRD-001 actors table; BRD-011–014 |
| TRANSFER_REQUEST | VIEW / LIST | HR | Location / organisation scope (HR/IT mapping) | Allowed | SPEC-006 / SPEC-014 | BRD-001 actors table; BRD-011–014 |
| TRANSFER_REQUEST | VIEW / LIST | IT | Assigned task / pending owner | Allowed. Note: (minimum fields) | SPEC-006 / SPEC-014 | BRD-001 actors table; BRD-011–014 |
| TRANSFER_REQUEST | APPROVE / REJECT / REQUEST_CLARIFICATION | SUPER_ADMIN | — | Denied | SPEC-007 / SPEC-008 | BRD-027 matrix, BRD-012, 013 |
| TRANSFER_REQUEST | APPROVE / REJECT / REQUEST_CLARIFICATION | EMPLOYEE | — | Denied | SPEC-007 / SPEC-008 | BRD-027 matrix, BRD-012, 013 |
| TRANSFER_REQUEST | APPROVE / REJECT / REQUEST_CLARIFICATION | REPORTING_MANAGER | Assigned task / pending owner | Allowed. Stage condition: @PENDING_REPORTING_MANAGER_APPROVAL | SPEC-007 / SPEC-008 | BRD-027 matrix, BRD-012, 013 |
| TRANSFER_REQUEST | APPROVE / REJECT / REQUEST_CLARIFICATION | RECEIVING_MANAGER | Assigned task / pending owner | Allowed. Stage condition: @PENDING_RECEIVING_MANAGER_APPROVAL, PENDING_RECEIVING_MANAGER_REAPPROVAL (clarify at re-approval: DERIVED BRD-024) | SPEC-007 / SPEC-008 | BRD-027 matrix, BRD-012, 013 |
| TRANSFER_REQUEST | APPROVE / REJECT / REQUEST_CLARIFICATION | HR | Location / organisation scope (HR/IT mapping) + Assigned task / pending owner | Allowed. Stage condition: @PENDING_HR_REVIEW (HR_VALIDATE_APPROVE) | SPEC-007 / SPEC-008 | BRD-027 matrix, BRD-012, 013 |
| TRANSFER_REQUEST | APPROVE / REJECT / REQUEST_CLARIFICATION | IT | — | Denied | SPEC-007 / SPEC-008 | BRD-027 matrix, BRD-012, 013 |
| TRANSFER_REQUEST | RESPOND_CLARIFICATION | SUPER_ADMIN | — | Denied | SPEC-007 | BRD-027, 034 |
| TRANSFER_REQUEST | RESPOND_CLARIFICATION | EMPLOYEE | Own records only | Allowed. Stage condition: @INFO_REQUIRED (responsible-user rule TDD-k) | SPEC-007 | BRD-027, 034 |
| TRANSFER_REQUEST | RESPOND_CLARIFICATION | REPORTING_MANAGER | — | Denied | SPEC-007 | BRD-027, 034 |
| TRANSFER_REQUEST | RESPOND_CLARIFICATION | RECEIVING_MANAGER | — | Denied | SPEC-007 | BRD-027, 034 |
| TRANSFER_REQUEST | RESPOND_CLARIFICATION | HR | — | Denied | SPEC-007 | BRD-027, 034 |
| TRANSFER_REQUEST | RESPOND_CLARIFICATION | IT | — | Denied | SPEC-007 | BRD-027, 034 |
| TRANSFER_REQUEST | HR_CHANGE_ORG_DATA, change Effective Date | SUPER_ADMIN | All (unrestricted organisational data) | Allowed. Note: (intervention) | SPEC-008 | BRD-020, 024, 031, 032 |
| TRANSFER_REQUEST | HR_CHANGE_ORG_DATA, change Effective Date | EMPLOYEE | Own records only | Allowed. Stage condition: @Draft (date only) | SPEC-008 | BRD-020, 024, 031, 032 |
| TRANSFER_REQUEST | HR_CHANGE_ORG_DATA, change Effective Date | REPORTING_MANAGER | — | Denied | SPEC-008 | BRD-020, 024, 031, 032 |
| TRANSFER_REQUEST | HR_CHANGE_ORG_DATA, change Effective Date | RECEIVING_MANAGER | — | Denied | SPEC-008 | BRD-020, 024, 031, 032 |
| TRANSFER_REQUEST | HR_CHANGE_ORG_DATA, change Effective Date | HR | Location / organisation scope (HR/IT mapping) | Allowed. Stage condition: @HR stages | SPEC-008 | BRD-020, 024, 031, 032 |
| TRANSFER_REQUEST | HR_CHANGE_ORG_DATA, change Effective Date | IT | — | Denied | SPEC-008 | BRD-020, 024, 031, 032 |
| TRANSFER_REQUEST | COMPLETE_HR_PROCESSING | SUPER_ADMIN | — | Denied | SPEC-008 | BRD-027 |
| TRANSFER_REQUEST | COMPLETE_HR_PROCESSING | EMPLOYEE | — | Denied | SPEC-008 | BRD-027 |
| TRANSFER_REQUEST | COMPLETE_HR_PROCESSING | REPORTING_MANAGER | — | Denied | SPEC-008 | BRD-027 |
| TRANSFER_REQUEST | COMPLETE_HR_PROCESSING | RECEIVING_MANAGER | — | Denied | SPEC-008 | BRD-027 |
| TRANSFER_REQUEST | COMPLETE_HR_PROCESSING | HR | Location / organisation scope (HR/IT mapping) | Allowed. Stage condition: @HR_PROCESSING | SPEC-008 | BRD-027 |
| TRANSFER_REQUEST | COMPLETE_HR_PROCESSING | IT | — | Denied | SPEC-008 | BRD-027 |
| PAYROLL_TASK | MARK_PAYROLL_COMPLETED | SUPER_ADMIN | — | Denied | SPEC-009 | BRD-027(c) |
| PAYROLL_TASK | MARK_PAYROLL_COMPLETED | EMPLOYEE | — | Denied | SPEC-009 | BRD-027(c) |
| PAYROLL_TASK | MARK_PAYROLL_COMPLETED | REPORTING_MANAGER | — | Denied | SPEC-009 | BRD-027(c) |
| PAYROLL_TASK | MARK_PAYROLL_COMPLETED | RECEIVING_MANAGER | — | Denied | SPEC-009 | BRD-027(c) |
| PAYROLL_TASK | MARK_PAYROLL_COMPLETED | HR | Location / organisation scope (HR/IT mapping) | Allowed. Stage condition: @PAYROLL_PROCESSING | SPEC-009 | BRD-027(c) |
| PAYROLL_TASK | MARK_PAYROLL_COMPLETED | IT | — | Denied | SPEC-009 | BRD-027(c) |
| PAYROLL_TASK | VIEW | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-009 | BRD-013 "monitor downstream" |
| PAYROLL_TASK | VIEW | EMPLOYEE | — | Denied | SPEC-009 | BRD-013 "monitor downstream" |
| PAYROLL_TASK | VIEW | REPORTING_MANAGER | — | Denied | SPEC-009 | BRD-013 "monitor downstream" |
| PAYROLL_TASK | VIEW | RECEIVING_MANAGER | — | Denied | SPEC-009 | BRD-013 "monitor downstream" |
| PAYROLL_TASK | VIEW | HR | Location / organisation scope (HR/IT mapping) | Allowed | SPEC-009 | BRD-013 "monitor downstream" |
| PAYROLL_TASK | VIEW | IT | — | Denied | SPEC-009 | BRD-013 "monitor downstream" |
| IT_TASK | COMPLETE_TASK / NO_IT_ACTION_REQUIRED / IT_FINAL_APPROVE | SUPER_ADMIN | — | Denied | SPEC-009 | BRD-014, 027 |
| IT_TASK | COMPLETE_TASK / NO_IT_ACTION_REQUIRED / IT_FINAL_APPROVE | EMPLOYEE | — | Denied | SPEC-009 | BRD-014, 027 |
| IT_TASK | COMPLETE_TASK / NO_IT_ACTION_REQUIRED / IT_FINAL_APPROVE | REPORTING_MANAGER | — | Denied | SPEC-009 | BRD-014, 027 |
| IT_TASK | COMPLETE_TASK / NO_IT_ACTION_REQUIRED / IT_FINAL_APPROVE | RECEIVING_MANAGER | — | Denied | SPEC-009 | BRD-014, 027 |
| IT_TASK | COMPLETE_TASK / NO_IT_ACTION_REQUIRED / IT_FINAL_APPROVE | HR | — | Denied | SPEC-009 | BRD-014, 027 |
| IT_TASK | COMPLETE_TASK / NO_IT_ACTION_REQUIRED / IT_FINAL_APPROVE | IT | Assigned task / pending owner + Location / organisation scope (HR/IT mapping) | Allowed. Stage condition: @PENDING_IT_ACTION, PENDING_IT_FINAL_APPROVAL | SPEC-009 | BRD-014, 027 |
| IT_TASK | VIEW | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-009 | BRD-013, 014 |
| IT_TASK | VIEW | EMPLOYEE | — | Denied | SPEC-009 | BRD-013, 014 |
| IT_TASK | VIEW | REPORTING_MANAGER | — | Denied | SPEC-009 | BRD-013, 014 |
| IT_TASK | VIEW | RECEIVING_MANAGER | — | Denied | SPEC-009 | BRD-013, 014 |
| IT_TASK | VIEW | HR | Location / organisation scope (HR/IT mapping) | Allowed. Note: (monitor) | SPEC-009 | BRD-013, 014 |
| IT_TASK | VIEW | IT | Assigned task / pending owner + Location / organisation scope (HR/IT mapping) | Allowed | SPEC-009 | BRD-013, 014 |
| TRANSFER_REQUEST | BLOCK / RESUME | SUPER_ADMIN | All (unrestricted organisational data) | Allowed. Note: (any non-final) | SPEC-010 | BRD-027, OQ-18 |
| TRANSFER_REQUEST | BLOCK / RESUME | EMPLOYEE | — | Denied | SPEC-010 | BRD-027, OQ-18 |
| TRANSFER_REQUEST | BLOCK / RESUME | REPORTING_MANAGER | — | Denied | SPEC-010 | BRD-027, OQ-18 |
| TRANSFER_REQUEST | BLOCK / RESUME | RECEIVING_MANAGER | — | Denied | SPEC-010 | BRD-027, OQ-18 |
| TRANSFER_REQUEST | BLOCK / RESUME | HR | Location / organisation scope (HR/IT mapping) | Allowed. Stage condition: @PENDING_HR_REVIEW, HR_PROCESSING, PAYROLL_PROCESSING (resume only HR-origin blocks) | SPEC-010 | BRD-027, OQ-18 |
| TRANSFER_REQUEST | BLOCK / RESUME | IT | Location / organisation scope (HR/IT mapping) | Allowed. Stage condition: @PENDING_IT_ACTION, PENDING_IT_FINAL_APPROVAL (resume only IT-origin blocks) | SPEC-010 | BRD-027, OQ-18 |
| TRANSFER_REQUEST | CANCEL | SUPER_ADMIN | All (unrestricted organisational data) | Allowed. Note: (any active, any Blocked) | SPEC-010 | BRD-027, OQ-18 |
| TRANSFER_REQUEST | CANCEL | EMPLOYEE | — | Denied | SPEC-010 | BRD-027, OQ-18 |
| TRANSFER_REQUEST | CANCEL | REPORTING_MANAGER | — | Denied | SPEC-010 | BRD-027, OQ-18 |
| TRANSFER_REQUEST | CANCEL | RECEIVING_MANAGER | — | Denied | SPEC-010 | BRD-027, OQ-18 |
| TRANSFER_REQUEST | CANCEL | HR | Location / organisation scope (HR/IT mapping) | Allowed. Stage condition: @HR stages and HR-origin Blocked | SPEC-010 | BRD-027, OQ-18 |
| TRANSFER_REQUEST | CANCEL | IT | — | Denied | SPEC-010 | BRD-027, OQ-18 |
| TRANSFER_REQUEST / APPROVAL_TASK / IT_TASK | REASSIGN | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-010 (engine SPEC-007) | BRD-035 |
| TRANSFER_REQUEST / APPROVAL_TASK / IT_TASK | REASSIGN | EMPLOYEE | — | Denied | SPEC-010 (engine SPEC-007) | BRD-035 |
| TRANSFER_REQUEST / APPROVAL_TASK / IT_TASK | REASSIGN | REPORTING_MANAGER | — | Denied | SPEC-010 (engine SPEC-007) | BRD-035 |
| TRANSFER_REQUEST / APPROVAL_TASK / IT_TASK | REASSIGN | RECEIVING_MANAGER | — | Denied | SPEC-010 (engine SPEC-007) | BRD-035 |
| TRANSFER_REQUEST / APPROVAL_TASK / IT_TASK | REASSIGN | HR | — | Denied | SPEC-010 (engine SPEC-007) | BRD-035 |
| TRANSFER_REQUEST / APPROVAL_TASK / IT_TASK | REASSIGN | IT | — | Denied | SPEC-010 (engine SPEC-007) | BRD-035 |
| DOCUMENT | UPLOAD | SUPER_ADMIN | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-011 | BRD-021 (HR); others `?` |
| DOCUMENT | UPLOAD | EMPLOYEE | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) [TDD] | SPEC-011 | BRD-021 (HR); others `?` |
| DOCUMENT | UPLOAD | REPORTING_MANAGER | — | Denied | SPEC-011 | BRD-021 (HR); others `?` |
| DOCUMENT | UPLOAD | RECEIVING_MANAGER | — | Denied | SPEC-011 | BRD-021 (HR); others `?` |
| DOCUMENT | UPLOAD | HR | Location / organisation scope (HR/IT mapping) | Allowed | SPEC-011 | BRD-021 (HR); others `?` |
| DOCUMENT | UPLOAD | IT | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) [completion evidence TDD-h] | SPEC-011 | BRD-021 (HR); others `?` |
| DOCUMENT | VIEW / DOWNLOAD | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-011 | BRD-021 "role and org scope"; NFR-007 |
| DOCUMENT | VIEW / DOWNLOAD | EMPLOYEE | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) [own transfer docs] | SPEC-011 | BRD-021 "role and org scope"; NFR-007 |
| DOCUMENT | VIEW / DOWNLOAD | REPORTING_MANAGER | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-011 | BRD-021 "role and org scope"; NFR-007 |
| DOCUMENT | VIEW / DOWNLOAD | RECEIVING_MANAGER | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-011 | BRD-021 "role and org scope"; NFR-007 |
| DOCUMENT | VIEW / DOWNLOAD | HR | Location / organisation scope (HR/IT mapping) | Allowed | SPEC-011 | BRD-021 "role and org scope"; NFR-007 |
| DOCUMENT | VIEW / DOWNLOAD | IT | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-011 | BRD-021 "role and org scope"; NFR-007 |
| AUDIT_LOG | VIEW / LIST | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-013 | BRD-037 (non-SA roles "within scope"; per-role detail in SPEC-013) |
| AUDIT_LOG | VIEW / LIST | EMPLOYEE | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-013 | BRD-037 (non-SA roles "within scope"; per-role detail in SPEC-013) |
| AUDIT_LOG | VIEW / LIST | REPORTING_MANAGER | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-013 | BRD-037 (non-SA roles "within scope"; per-role detail in SPEC-013) |
| AUDIT_LOG | VIEW / LIST | RECEIVING_MANAGER | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-013 | BRD-037 (non-SA roles "within scope"; per-role detail in SPEC-013) |
| AUDIT_LOG | VIEW / LIST | HR | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) [within role & scope] | SPEC-013 | BRD-037 (non-SA roles "within scope"; per-role detail in SPEC-013) |
| AUDIT_LOG | VIEW / LIST | IT | Not defined | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-013 | BRD-037 (non-SA roles "within scope"; per-role detail in SPEC-013) |
| AUDIT_LOG | EXPORT | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-013 | BRD-037 |
| AUDIT_LOG | EXPORT | EMPLOYEE | — | Denied | SPEC-013 | BRD-037 |
| AUDIT_LOG | EXPORT | REPORTING_MANAGER | — | Denied | SPEC-013 | BRD-037 |
| AUDIT_LOG | EXPORT | RECEIVING_MANAGER | — | Denied | SPEC-013 | BRD-037 |
| AUDIT_LOG | EXPORT | HR | — | Denied | SPEC-013 | BRD-037 |
| AUDIT_LOG | EXPORT | IT | — | Denied | SPEC-013 | BRD-037 |
| NOTIFICATION | LIST / mark read | SUPER_ADMIN | Own records only | Allowed | SPEC-012 | DERIVED BRD-036 in-app |
| NOTIFICATION | LIST / mark read | EMPLOYEE | Own records only | Allowed | SPEC-012 | DERIVED BRD-036 in-app |
| NOTIFICATION | LIST / mark read | REPORTING_MANAGER | Own records only | Allowed | SPEC-012 | DERIVED BRD-036 in-app |
| NOTIFICATION | LIST / mark read | RECEIVING_MANAGER | Own records only | Allowed | SPEC-012 | DERIVED BRD-036 in-app |
| NOTIFICATION | LIST / mark read | HR | Own records only | Allowed | SPEC-012 | DERIVED BRD-036 in-app |
| NOTIFICATION | LIST / mark read | IT | Own records only | Allowed | SPEC-012 | DERIVED BRD-036 in-app |
| WORKFLOW_CONFIGURATION | VIEW / CONFIGURE | SUPER_ADMIN | All (unrestricted organisational data) | Allowed | SPEC-007 | BRD-012, 031 |
| WORKFLOW_CONFIGURATION | VIEW / CONFIGURE | EMPLOYEE | — | Denied | SPEC-007 | BRD-012, 031 |
| WORKFLOW_CONFIGURATION | VIEW / CONFIGURE | REPORTING_MANAGER | — | Denied | SPEC-007 | BRD-012, 031 |
| WORKFLOW_CONFIGURATION | VIEW / CONFIGURE | RECEIVING_MANAGER | — | Denied | SPEC-007 | BRD-012, 031 |
| WORKFLOW_CONFIGURATION | VIEW / CONFIGURE | HR | — | Denied | SPEC-007 | BRD-012, 031 |
| WORKFLOW_CONFIGURATION | VIEW / CONFIGURE | IT | — | Denied | SPEC-007 | BRD-012, 031 |
| ESCALATION_SETTINGS | CONFIGURE | SUPER_ADMIN | All (unrestricted organisational data) | Allowed. Note: (role  per BRD-023 "company policy") | SPEC-014 | BRD-023 |
| ESCALATION_SETTINGS | CONFIGURE | EMPLOYEE | — | Denied | SPEC-014 | BRD-023 |
| ESCALATION_SETTINGS | CONFIGURE | REPORTING_MANAGER | — | Denied | SPEC-014 | BRD-023 |
| ESCALATION_SETTINGS | CONFIGURE | RECEIVING_MANAGER | — | Denied | SPEC-014 | BRD-023 |
| ESCALATION_SETTINGS | CONFIGURE | HR | — | Denied | SPEC-014 | BRD-023 |
| ESCALATION_SETTINGS | CONFIGURE | IT | — | Denied | SPEC-014 | BRD-023 |
| DASHBOARD / REPORT | VIEW | SUPER_ADMIN | All (unrestricted organisational data) | Allowed. Note: (org-wide) | SPEC-014 | BRD-023 "restricted per policy" — exact content `?` (SPEC-014) |
| DASHBOARD / REPORT | VIEW | EMPLOYEE | Own records only | Allowed | SPEC-014 | BRD-023 "restricted per policy" — exact content `?` (SPEC-014) |
| DASHBOARD / REPORT | VIEW | REPORTING_MANAGER | Assigned employees / reporting hierarchy | Allowed | SPEC-014 | BRD-023 "restricted per policy" — exact content `?` (SPEC-014) |
| DASHBOARD / REPORT | VIEW | RECEIVING_MANAGER | Not defined (candidate scope: Receiving Manager target-team scope [TDD-REQUIRED]) | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-014 | BRD-023 "restricted per policy" — exact content `?` (SPEC-014) |
| DASHBOARD / REPORT | VIEW | HR | Location / organisation scope (HR/IT mapping) | Allowed | SPEC-014 | BRD-023 "restricted per policy" — exact content `?` (SPEC-014) |
| DASHBOARD / REPORT | VIEW | IT | Not defined (candidate scope: Assigned task / pending owner) | Technical Design Decision Required — Not Defined by BRD (denied until decided) | SPEC-014 | BRD-023 "restricted per policy" — exact content `?` (SPEC-014) |

### F.4 Outcome of the matrix

| Measure | Count |
|---|---|
| Rows (resource x action x role) | 198 |
| Allowed (with scope and any stage condition) | 72 |
| Denied | 105 |
| Technical Design Decision Required - Not Defined by BRD (denied until decided) | 21 |

The 21 undefined cells sit in: HR visibility of account status (USER_ACCOUNT view), Receiving Manager and IT profile view (IT minimum fields TDD-002.16), HR employment-status update scope, Employee and Receiving Manager vacancy visibility (gap j, TDD-005.02, TDD-006.04), Receiving Manager transfer view (TDD-003.01), Document upload by Super Admin/Employee/IT and document view/download by Employee/Reporting Manager/Receiving Manager/IT (TDD-011.04 to TDD-011.07), Audit Log view for every role except Super Admin (TDD-013.03, TDD-013.04) and Dashboard/Report view for Receiving Manager and IT (TDD-014.08 to TDD-014.10). They are collected in SPEC-002 `TDD-002.22` and distributed to the owning specs (Part N, theme 3).

Additional role rules recorded in feature specs that refine, but do not change, the matrix:

| Rule | SPEC | BRD |
|---|---|---|
| Only Super Admin may Reassign; HR, IT, Reporting Manager, Receiving Manager and Employee cannot | SPEC-010 | BRD-035, BRD-027 |
| HR may Block/Resume only in `PENDING_HR_REVIEW`, `HR_PROCESSING`, `PAYROLL_PROCESSING`; IT only in `PENDING_IT_ACTION`, `PENDING_IT_FINAL_APPROVAL`; no cross-resume; HR may Cancel only in the three HR stages or a Blocked request blocked from an HR stage, never an IT-blocked one | SPEC-010 | BRD-027, BRD-OQ-18 |
| Reporting Manager, Receiving Manager and Employee cannot Block | SPEC-010 | BRD-027 |
| HR (in scope) and Super Admin may manually release an in-flight reservation with a mandatory reason; Reporting Manager, Receiving Manager, Employee and IT cannot | SPEC-005 | BRD-OQ-15(c), BRD-028 |
| Employee edits all fields in Draft only; post-submission changes by authorised HR / Super Admin with BRD-024 re-approval | SPEC-006, SPEC-008 | BRD-032 |
| Only Super Admin may export audit logs; other roles see audit information only within role and organisation scope | SPEC-013 | BRD-037 |
| Only authorised HR may mark Payroll complete (which HR users: TDD-009.01); IT Final Approval is by IT only | SPEC-009 | BRD-027 |
| Audit/Notification kernels are callable by every module; end users have no API to them except Audit view/export and the in-app inbox | SPEC-001, SPEC-012, SPEC-013 | BRD-036, BRD-037 |

---

## Part G - Master-data dependency matrix

Source: SPEC-003 section 10.5 (verified against the dependent specs' schemas), extended with consumers. Masters are `locations`, `departments` (Department / Business Unit, one table with `unit_type`, TDD-003.02) and `designations`; relationship/scope data are `reporting_manager_assignments`, `hr_scope_mappings`, `it_location_scopes` and `receiving_manager_scopes` `[TDD-REQUIRED]`. Masters are never physically deleted (FK `ON DELETE RESTRICT`); they are activated/deactivated. Department, Designation, Location and Vacancy values come only from portal master data, never free text `[BRD-029]`.

### G.1 Master x dependent entity (deactivation behaviour)

Legend: **B** = blocks deactivation (default, TDD-003.03 `[TDD-REQUIRED]`), **W** = warn only (listed in the confirmation), **-** = no reference.

| Dependent entity (table) | Owner | Department/BU | Designation | Location | Notes / blocking condition |
|---|---|---|---|---|---|
| `employee_profiles` (current org data) | SPEC-004 | FK, B when profile employment status is Active | FK, B (Active profiles) | FK, B (Active profiles) | Mandatory org data for eligibility (BRD-029 rule 6); HR/IT assigned users must be mapped to the profile's location |
| `vacancies` | SPEC-005 | FK, B when vacancy status OPEN/FULL/ON_HOLD | FK, B | FK, B | CLOSED vacancies do not block (BRD-017) |
| `transfer_requests` (current and proposed values, selected vacancy) | SPEC-006 | FK current + proposed, B for non-final non-Draft; W for Draft | same | same | Active status list per BRD-030; Draft is not active |
| `transfer_org_changes` (HR changes) | SPEC-008 | FK old/new, B via parent request; historic rows never block | same | same | Historic rows retained for BRD-024 audit |
| `hr_scope_mappings` | SPEC-003 | FK (nullable), W | - | FK, W | Super Admin must end/replace the mapping or accept the warning |
| `it_location_scopes` | SPEC-003 | - | - | FK, W | Location only |
| `receiving_manager_scopes` | SPEC-003 | FK, W | - | FK (nullable), W | `[TDD-REQUIRED]` TDD-003.01 (shape is a recommended default) |
| `reporting_manager_assignments` | SPEC-003 | - | - | - | Users, not masters; single source of the employee to Reporting Manager relationship (TDD-003.08, R-1) |
| `documents` | SPEC-011 | - | - | - | Linked to employee/transfer; no direct master FK |
| `audit_logs` | SPEC-001 | - | - | - | Stores master code + name at event time (immutable snapshot, not an enforced FK) so audit survives renames |
| `notifications` / `notification_outbox` | SPEC-001 / SPEC-012 | - | - | - | No master references |
| Dashboards / reports | SPEC-014 | group-by only | group-by only | group-by only | Read-only joins; no blocking |

Transitive rule `[PROPOSED]`: a deactivated/INACTIVE employee does not block master deactivation. An INACTIVE master already referenced stays intact and shows an Inactive badge; a new write that uses it fails with 422 `MASTER_INACTIVE`; a missing id fails with 422 `MASTER_NOT_FOUND`. Deactivation uses `FOR UPDATE` on the master; dependent writes use `MasterReferenceGuard.assertActive` with `FOR SHARE`, so a concurrent deactivation cannot race past a dependent insert (SPEC-003 FR-003.31).

### G.2 Master / mapping consumption by SPEC

| SPEC | Locations | Departments / BU | Designations | Scope mappings and relationships |
|---|---|---|---|---|
| SPEC-002 | Org-scope step 3 via `OrgScopeProvider` | same | - | Resolves `ScopeResolver` data (HR, IT, Receiving Manager scope; reporting hierarchy) |
| SPEC-003 | Owns CRUD, activate/deactivate | Owns | Owns | Owns `hr_scope_mappings`, `it_location_scopes`, `receiving_manager_scopes`, `reporting_manager_assignments`, `my-hr-team` |
| SPEC-004 | Profile FK; HR/IT assignment must match location | Profile FK | Profile FK | Validates HR/IT assignment and Reporting Manager through SPEC-003 services (`OrgRelationshipService`) |
| SPEC-005 | Vacancy FK | Vacancy FK | Vacancy FK | HR vacancy read scope (TDD-005.03, TDD-005.15) |
| SPEC-006 | Current and proposed values; HR team resolution | same | same | HR team for missing-data contact (TDD-006.10); Reporting Manager snapshot |
| SPEC-007 | - | - | - | Assignee resolution: Reporting Manager (assignment), Receiving Manager (scope, TDD-007.02), HR (scope), IT (scope) |
| SPEC-008 | HR-changed values (active masters only) | same | same | Receiving Manager "applicable" after change (TDD-008.06); HR scope |
| SPEC-009 | IT routing location (TDD-009.03) | - | - | IT assignee selection (TDD-009.05) |
| SPEC-010 | - | - | - | New assignee eligibility on Reassign (role + scope, TDD-010.14); HR/IT scope on Block/Resume/Cancel |
| SPEC-011 | - | - | - | HR/IT/Receiving Manager scope for document access |
| SPEC-013 | Visibility predicates (location/org) | same | - | HR/IT/Receiving Manager audit visibility (TDD-013.03) |
| SPEC-014 | Filters, group-by, worklist scope | same | same | Worklist and report scope per role |
| SPEC-015 | Master-data-only enforcement review (`TASK-015.04`), field-ownership registry | same | same | Field-ownership registry rows for Department/BU, Designation, Location, Reporting Manager, HR/IT assignment |
| SPEC-016 | Fixtures, scope scenarios | same | same | Scope scenarios S1, S2, W1 |

---

## Part H - SPEC dependency matrix

Hard = the consuming SPEC cannot complete without the item. Gated = specific tasks wait for a named task of another SPEC. All specs depend on SPEC-001 (shared kernels) and, except SPEC-001 and SPEC-002, on SPEC-002 (authentication and authorization).

| SPEC | Depends On | Enables | Can Develop in Parallel? |
|---|---|---|---|
| SPEC-001 | None (root) | Every SPEC (kernels: transaction, audit, outbox, errors, UI kit, test harness) | No, first. Only SPEC-016 harness/strategy tasks (`TASK-016.01` to `.05`) may start once the SPEC-001 test harness (`TASK-001.30`) exists |
| SPEC-002 | 001. Soft: 003 and 004 supply `ScopeResolver` data; 004 calls services defined here | 003 to 016 (`authenticate`, `AuthorizationService`, `ScopeResolver`, permission registry, security audit shapes) | Yes, with SPEC-003 once `users` migration/models (`TASK-002.01` to `.03`) exist; frontend tasks in parallel with backend |
| SPEC-003 | 001, 002 (`users` FK, context). Soft: 004 (`EmployeeOrgReader`), 014 (dashboard data) | 002 (`OrgScopeProvider`), 004 to 016 (masters, scope mappings, admin shell, shared UI patterns) | Yes, with SPEC-002 (master tables `TASK-003.01` to `.07` need only the `users` FK) and with SPEC-012/013 core work |
| SPEC-004 | 001, 002, 003. Soft: 012 (credential email delivery), 007/009 read-only stubs, 013 | 005 (employee ids), 006 (profile, eligibility data), 007 to 010 (managers, assigned HR/IT), 011, 012, 013, 014, 015, 016 | Yes, with SPEC-011 core, SPEC-012 core, SPEC-013 core; SPEC-005 vacancy admin part can start once 003 masters exist |
| SPEC-005 | 001, 002, 003, 004. Gated: `TASK-005.03` FK needs `transfer_requests` (`TASK-006.01`); effect hooks need SPEC-007 engine | 006 (checkSelectable, discovery), 007 (release hook), 008 (`reserve`, `changeVacancy`), 009 (`finalizeAllocation`), 010 (`validateForResume`), 014, 015, 016 | Yes, with SPEC-006 (agree `proposed_vacancy_id` and `TransferReadPort` first) and SPEC-011/012/013 |
| SPEC-006 | 001 to 005 (005 read only). Gated: submit, tracking timeline and SUBMIT handler (`TASK-006.11`, `.12`, `.13`, `.30`) on SPEC-007 core | 007 (receives submitted requests), 008, 009, 010 (table, active-status set, one-active index), 014, 015, 016 | Yes, with SPEC-005 and SPEC-007 core once `TASK-006.01`/`.02` (table, model) land; Draft, eligibility, date and browse tasks are not gated |
| SPEC-007 | 001 to 004; 005 (release hook); 006 (`transfer_requests` columns) | 006 (submit, `WorkflowGuard`), 008, 009, 010 (rows, hooks, assignments), 012, 013, 014, 016 (golden matrix) | Yes, with SPEC-006 and SPEC-005 after `transfer_requests` exists; engine core before handlers; FE approver UI parallel to BE |
| SPEC-008 | 001 to 007 (hard); 011 (HR document upload) and 012/013 soft | 009 (Payroll entry, HR completeness), 010 (reservation for Resume/Cancel), 014, 015, 016 | Yes, with SPEC-010 and SPEC-011 after SPEC-007; SPEC-009 migrations/services may start against the hand-off contract |
| SPEC-009 | 001 to 008 (008 hand-off `COMPLETE_HR_PROCESSING`), 011 (evidence); SPEC-005 `finalizeAllocation` | 010 (cancel/reassign hooks), 014, 015, 016 (E2E completion) | Partly: data model, IT catalogue, services in parallel with 008; entry hooks and completion gate after 008 and 007 hook API |
| SPEC-010 | 001 to 007; hooks into 005 (`release`, `validateForResume`), 008, 009 (`cancelOpenActivity`, `cancelOpenTasks`, `applyReassignment`) | 006 (`ReapplicationPolicy`), 014 (blocked/cancelled counts), 015, 016 | Yes, with SPEC-008 and SPEC-009; Resume/Cancel integration tests wait for 005/008/009 hooks |
| SPEC-011 | 001, 002, 003, 004, 006, 007; hosts: 008 (HR screen), 009 (`it_tasks` evidence) | 008, 009, 004 (`DocumentList`), 013, 015, 016 | Yes, core (storage, validation, errors, scope policy) early with 004; embedding after 008/009 |
| SPEC-012 | 001 (outbox kernel), 002, 003, 004, 006, 007; callers 008 to 010; 013, 014 | 004 (credential email), 007 to 010 (delivery), 013 (failure audit), 014 (overdue), 015, 016 (fake SMTP harness) | Yes, from SPEC-001 onward; templates grow as producers land |
| SPEC-013 | 001 (audit kernel), 002, 003, 004, 007; emitters 005 to 012 | 006/007/014 (timeline), 015, 016 (catalogue conformance) | Yes, from SPEC-001/002 onward; catalogue verification last |
| SPEC-014 | 001 to 007; read-only 008, 009, 010; 012, 013 | 012 (overdue producer), 015 (query/index design, seed), 016 | Partly: constants, scope builder, dashboards on 003/005/006 data early; worklists/overdue/reports after 007 to 010 |
| SPEC-015 | 001 to 013, 016 (executes scenarios) | Production readiness gate; future-integration ports; Gate 2 review aids | Registry, guards, headers/CORS/rate-limit baseline in parallel early; verification suites, performance plan and readiness gate last |
| SPEC-016 | 001 (harness); 002 to 015 (behaviour under test) | Release readiness, UAT sign-off, Gate 2 evidence | Yes, test infrastructure from Wave 0/1; each scenario pack executes as its owning spec lands; UAT and release gate last |

---

## Part J - Negative coverage pointer (SPEC-016)

All negative-scenario coverage is consolidated in **SPEC-016** (`qa-uat-traceability.spec.md`); this overview does not duplicate it.

| Where in SPEC-016 | What it contains |
|---|---|
| Section 3.6 | The 24 BRD-039 mandatory negative scenarios: **S1-S8** Security, **W1-W7** Workflow, **V1-V4** Vacancy, **I1-I5** Integration, each mapped to owning-spec NAC ids, owning-spec TC ids and the SPEC-016 end-to-end case `TC-016.01` to `TC-016.24` (S1-S8 = `TC-016.01`-`.08`, W1-W7 = `.09`-`.15`, V1-V4 = `.16`-`.19`, I1-I5 = `.20`-`.24`) |
| Section 3.5 | The 40 BRD "Acceptance Criteria" bullets mapped to acceptance ids (`AB-01` to `AB-40`) |
| Sections 7.2 and 9.4 | BRD-039 execution rules and the exit rule: the scenarios are mandatory QA/UAT criteria validated before production deployment and any failed mandatory scenario must be resolved before production deployment |
| Section 9.5 | Integration scenarios I1-I5 with no integration in the current phase: validated through the manual-Payroll path, the SMTP dependency and a contract-level harness **[TDD-REQUIRED]** (`TDD-016.01` = `TDD-015.01`, Gate 1 reviewer to confirm) |
| Section 9.8 | Out-of-scope validation matrix (Part K) |
| Sections 22 and 23.2 | SPEC-016 negative acceptance criteria and the end-to-end negative cases (RED first, real stack, assert response and no side effects) |
| Tasks | `TASK-016.06` (BRD-039 report and release gate), `TASK-016.07` to `.10` (scenario packs S, W, V, I), `TASK-016.14` (matrix replay), `TASK-016.15` (concurrency C-01..C-12) |

Each feature SPEC also carries its own section 22 (negative acceptance criteria, 363 in total) tagged to the BRD-039 row it serves; the workflow scenarios W1/W2 are backed by the exhaustive SPEC-007 golden-matrix test (Part E.2).

---

## Part K - Out-of-scope validation

BRD "Out of Scope" (BRD lines 1643-1663) and the other "not in this phase" statements are validated by SPEC-016 section 9.8 (`OS-01` to `OS-14`), each with a verification method and evidence. Every feature SPEC also closes with its own "Out of Scope" section citing the BRD list.

| # | BRD exclusion | Verification (SPEC-016 9.8) | Evidence |
|---|---|---|---|
| OS-01 | Redesign/replacement of HR, payroll or ITSM platforms | No adapter, port implementation or integration table in `backend/src`; outbound-call guard | SPEC-015 `TC-015.35`-`.46`, `check:boundaries` |
| OS-02 | Facilities/Admin role and task execution, facilities integration (removed at user request) | Role enum is exactly six values; no facilities module/route/table | SPEC-002 `TC-002.17`, `TC-016.52` |
| OS-03 | New payroll calculation engine, identity provider, enterprise master-data platform | Schema/route scan: no salary columns, no OIDC/SAML dependency, no payroll-calculation route | `TC-016.52`, SPEC-001.AC26 |
| OS-04 | Automatic HR-system integration/synchronisation (real-time, scheduled, callback) and updates to an external HR master | No sync scheduler; HR change makes no outbound call; no webhook route | SPEC-015 AC06, AC07, NAC04-05; SPEC-008 NAC24 |
| OS-05 | External recruitment, cross-company transfer, immigration/relocation benefits | Transfer schema has only internal master references; route inventory has none | `TC-016.52`, SPEC-006 master validation |
| OS-06 | Historical data migration, bulk backfill, unapproved custom integrations | Migrations contain schema and test-guarded seeders only; no import route | `TC-016.53` |
| OS-07 | Advanced workforce planning / predictive vacancy forecasting | Report catalogue lists only BRD-023 reports; no forecasting endpoint | SPEC-014 `TC-014.09`, `TC-016.53` |
| OS-08 | MFA / SSO (BRD-025) | No MFA/SSO dependency; login only by User ID + password | SPEC-001.AC26 |
| OS-09 | Malware scanning, retention, archive, deletion policy for documents (BRD-021, OQ-08) | No delete route (405), no scanner, no retention job | SPEC-011 NAC19-20, AC20 |
| OS-10 | Other HR eligibility restrictions (tenure, probation, disciplinary, notice, performance) (BRD-029) | Eligibility rule list asserted exact; no such field or rule | SPEC-006 `TC-006.07`, SPEC-008 NAC23 |
| OS-11 | Cool-down after Completed (BRD-030) | New request accepted immediately after Completed | SPEC-006.AC17, `TC-016.35` |
| OS-12 | Payroll API/callback; payroll calculation (BRD-027(c)) | No payroll callback route (404); manual completion only | SPEC-009 NAC01, AC05 |
| OS-13 | Invented escalation timings (BRD-023) | No numeric escalation default; unset means "not configured" | SPEC-014 `TC-014.27`, NAC11 |
| OS-14 | Numeric infrastructure targets (availability, backup, monitoring) (NFR-009) | Register shows no invented value; CI grep guard | SPEC-015 AC34, `TC-016.54` |

Overview-level check: the reconciliation scan (`spec-reconciliation-notes.md`, last row "Scan") found no invented eligibility rules, performance numbers, escalation timings or Out-of-Scope contradictions; the remaining numbers in the specs are test-harness counts or `[PROPOSED]` technical defaults. The only in-phase external dependencies are the enterprise/official company email service, PostgreSQL and local file storage.

---

## Part L - Serial development journey

The waves below are earliest-start groupings derived from Part H. A spec may finish after its wave opens when it waits on a later spec for a named task (gated tasks listed in L.3). Task totals per wave sum to 508.

### L.1 Waves

| Wave | SPECs (tasks) | Build focus | Runs in parallel |
|---|---|---|---|
| W0 Foundation | SPEC-001 (31) | Repository, config, logger, errors, envelope, migrations, `id_sequences`, `audit_logs` + immutability, `withTransaction`, audit kernel, outbox + enqueue kernel, business-date utility, UI kit and shell, test harness | SPEC-016 test strategy and harness tasks may start at the end of W0 |
| W1 Identity and organisation | SPEC-002 (38), SPEC-003 (30) | Authentication, sessions, RBAC pipeline, permission registry; master data, organisation scope mappings, admin shell | 002 and 003 in parallel after the `users` migration (`TASK-002.01` to `.03`); FE and BE in parallel |
| W2 Users and platform services | SPEC-004 (33), SPEC-011 (27), SPEC-012 (26), SPEC-013 (31) | User provisioning and profiles; document storage/validation core; notification delivery core; audit visibility, hardening, export | All four in parallel (each needs only 001 to 004 for its core); embedding, producers and emitters complete later |
| W3 Vacancy and initiation | SPEC-005 (35), SPEC-006 (30) | Vacancy tables and reservation engine; `transfer_requests`, eligibility, Draft, date rule, browse | In parallel; agree `proposed_vacancy_id` and `TransferReadPort` first; `TASK-006.01`/`.02` unblock SPEC-007 |
| W4 Workflow engine | SPEC-007 (32) | Registry (all BRD-027 rows as data), `WorkflowEngine.transition`, guard chain, history, assignments, configuration, approve/reject/clarify, golden matrix test | Starts when `transfer_requests` exists; unlocks the gated SPEC-006 tasks and every handler registration |
| W5 Stage handlers | SPEC-008 (34), SPEC-010 (31) | HR review, org changes, re-approval, HR completion; Withdraw/Block/Resume/Cancel/Reassign | In parallel; SPEC-010 hook calls into 008/009 stubbed until W6; SPEC-011 embedding in the HR screen |
| W6 Completion | SPEC-009 (34) | Payroll activity, IT tasks, IT Final Approval, five-condition gate, atomic Completed, `finalizeAllocation` | Data model and IT catalogue overlap W5; gate and entry hooks after 008 hand-off and the 007 hook API |
| W7 Read models, hardening, verification | SPEC-014 (32), SPEC-015 (34), SPEC-016 (30) | Dashboards, worklists, reports, overdue/escalation; field-ownership, NFR and security verification; BRD-039 execution, journeys, UAT, release gates | 014 starts earlier on 003/005/006 data and finishes after 010; 015 registry/guards start early, verification last; 016 scenario packs run as each spec lands, UAT last |

Totals: W0 31 + W1 68 + W2 117 + W3 65 + W4 32 + W5 65 + W6 34 + W7 96 = **508**.

### L.2 Critical path

`SPEC-001 -> SPEC-002 -> SPEC-003 -> SPEC-004 -> SPEC-006 (table, `TASK-006.01`/`.02`) -> SPEC-007 (engine core) -> SPEC-008 (reserve at HR approval, HR completion hand-off) -> SPEC-009 (Payroll, IT, completion gate) -> SPEC-015 verification + SPEC-016 BRD-039 / UAT / release gate -> production readiness`.

SPEC-005 must be ready before SPEC-008 (`VacancyService.reserve` at HR validate/approve) and before SPEC-009 (`finalizeAllocation`), so it sits just off the critical path in W3. SPEC-010 sits off the critical path but must finish before UAT because the exception journeys (P04-P25) depend on it. Items that can delay the path: Gate 1 decisions on the Receiving Manager scope (TDD-003.01), the session mechanism (TDD-002.03), the temporary-password hand-off (TDD-012.04) and the Super Admin bootstrap (TDD-002.02 / TDD-001.07), plus the BRD-038 numeric inputs that block performance validation `PPV-08` (Part N).

### L.3 Gated tasks and integration contracts

| Gate | Waits on | Mitigation |
|---|---|---|
| SPEC-006 `TASK-006.11`, `.12`, `.13`, `.30` (SUBMIT handler, submit endpoint, tracking timeline, workflow check) | SPEC-007 engine core | Draft, eligibility, date and browse tasks are not gated; develop against `WorkflowGuard`/`TransferReadPort` contracts first |
| SPEC-005 `TASK-005.03` (FK to `transfer_requests`) and effect registration | SPEC-006 `TASK-006.01`, SPEC-007 effect registry | Land the migration after 006.01; use the engine stub (`TASK-005.33`) until 007 |
| SPEC-009 entry hooks (`registerOnEnter`) and `TaskAssignmentService` | SPEC-007 FR-007.30 hook API | Fallback documented in SPEC-009: direct `PayrollService.openActivity` / `ItTaskService.createOnEntry` calls in the same transaction |
| SPEC-010 hook calls (`cancelOpenActivity`, `cancelOpenTasks`, `applyReassignment`) | SPEC-009 | Agreed names (R-7); stub until W6 |
| SPEC-004 credential email delivery, deactivation warnings | SPEC-012, SPEC-007/009 read-only services | Interface stubs; creation completes without delivery |
| SPEC-012 temporary-password hand-off | Gate 1 decision TDD-012.04 | Recommended default Option B (in-memory post-commit send; admin credential reset as recovery) |
| SPEC-016 performance execution | BRD-038 numeric inputs (concurrent users, volume, response targets, API timeout) | Registered as empty blocking inputs (SPEC-015); no number invented |

### L.4 Per-spec development gate (applies to every spec, from AGENTS.md)

Gate 1 spec peer review (Project Manager / Product Owner roster) -> plan -> tasks -> test cases -> TDD RED (`tests/`) -> TDD GREEN (`src/`) -> test verification -> Gate 2 code review (Technical Lead / Architect roster). Specs progress independently once the BRD is Gate 0 approved (non-blocking parallel spec execution). A spec that is Rejected or "Changes Requested" at Gate 1 blocks its own planning, tasks, tests and code until it is updated and re-approved. No spec has yet been submitted to Gate 1.

---

## Part M - Zero-omission statement

**Result of the matrix run (`spec-traceability-matrix.md` section 4, generated 2026-10-07): no BRD requirement, NFR, open question, business rule, BRD-027 matrix row, acceptance bullet, source-of-truth field, integration boundary, dependency, assumption or out-of-scope item is left without an owning SPEC.** In figures: 47 of 47 requirement rows (BRD-001 to BRD-014, BRD-016 to BRD-039, NFR-001 to NFR-009) have a primary SPEC, at least one task and at least one AC/NAC; 20 of 20 open questions are evidenced; 40 of 40 BRD acceptance bullets and 24 of 24 BRD-039 scenarios resolve to existing ids; 37 of 37 BRD-027 rows map to registry rules (M-06 and M-07 only through the golden matrix and shared handler ACs, gap G-09); 130 key-fact probes (for example 5 failed logins / 30-minute lock, 30-minute idle, 5 MB, 413/415 codes, `ACTIVE_TRANSFER_ALREADY_EXISTS`, the 403 `INVALID_WORKFLOW_TRANSITION` message, 12 notification events, eleven integration-contract elements, 14 field-ownership rows) all found in the owning spec text. BRD numbering has no BRD-015; nothing is missing.

### M.1 The 15 gaps found (G-01 to G-15)

The matrix found **15 gaps (G-01 to G-15)**: 4 must-fix id defects (G-01 to G-04), 6 traceability-quality defects (G-05 to G-10) and 5 informational items (G-11 to G-15). None removes BRD coverage; they are spec-internal defects, and one open product decision. The must-fix ones are being resolved concurrently by a separate agent.

| Gap | Severity | Finding (short) | Fix owner | Status at generation |
|---|---|---|---|---|
| G-01 | Must fix | SPEC-004 section 23 said NAC01-NAC32 mapped 1:1 to `TC-004.81`-`.100` but only 20 NACs exist | SPEC-004 | Spot check: section 23 now lists the 20 defined NACs mapped explicitly; matrix not yet regenerated |
| G-02 | Must fix | SPEC-007 section 3 cited AC40..AC42 which do not exist | SPEC-007 | Spot check: citation no longer present |
| G-03 | Must fix | SPEC-014 `TASK-014.28/.29` cited undefined TC ranges | SPEC-014 | Spot check: old range text no longer present |
| G-04 | Must fix | SPEC-015 used legacy `AC-015.xx` / `NAC-015.xx` labels and ranges | SPEC-015 | Spot check: legacy labels no longer present |
| G-05 | Fix | Non-standard id label forms (`NAC-013.nn`, `AC-016.26`, `AC09a`, `FR-009.23a`) | SPEC-013, SPEC-016 `TASK-016.05` | Spot check: SPEC-013 labels normalised |
| G-06 | Fix | AC/NAC to TC link missing or block-level in most specs (SPEC-005 and SPEC-015 give no mapping) | Each listed SPEC | Open |
| G-07 | Fix | Tasks without a BRD/NFR id in `BRD refs` (for example `TASK-013.24`, `TASK-014.18`, `TASK-015.07`-`.09`) | SPEC-013/014/001/005/015/016 | Open |
| G-08 | Fix | Tag-thin primary coverage (BRD-023 in SPEC-012; NFR-001/002/007 tags in SPEC-002/011) | SPEC-012, SPEC-002, SPEC-011 | Open |
| G-09 | Fix | BRD-027 rows M-06, M-07 (Receiving Manager Reject / Request Clarification at the approval stage) have no dedicated AC | SPEC-007 | Open |
| G-10 | Fix | Undefined ids cited (`TDD-014.15`, `FR-015.28`, `FR-004.59`, ranges over undefined FR numbers) | SPEC-014/015/004/009 | Open |
| G-11 | Info | Product decision left open: BRD-023 activation notification and account lock/unlock notices not implemented in SPEC-012 | Gate 1 | Open (decision) |
| G-12 | Info | 252 `TDD-NNN.NN` decisions are BRD ambiguities, not coverage gaps | Gate 1 reviewers | Open (Part N) |
| G-13 | Info | BRD-038 numeric inputs and NFR-009 targets are "to be confirmed" in the BRD; registered as empty blocking inputs, no number invented | Business | Open (input) |
| G-14 | Info | Project-plan assumption (dates, effort, team, commercials excluded) has no technical task, by design | none | Closed |
| G-15 | Info | BRD numbering has no BRD-015 | none | Closed |

The "status" column is a spot check of the spec text at generation time, not a regeneration of the matrix; rerun `TASK-016.05` after the concurrent fixes land.

### M.2 What would change this statement

Any new requirement id, any renumbering of a TASK/AC/NAC/TC id, or any edit that removes a primary-owner entry invalidates the matrix; regenerate `spec-traceability-matrix.md`, then this overview, after every spec change (`RR-04`).

### M.3 Consistency observations made while assembling this overview

These are not coverage gaps and are not in the 15 above. They are recorded for the Gate 1 reviewer and for the SPEC-012/013 catalogue owners; no spec was edited by this overview.

| # | Observation | Specs | Suggested resolution |
|---|---|---|---|
| 1 | Block notification code differs: SPEC-007 registry and SPEC-012 catalogue use `TASK_BLOCKED`; SPEC-010 section 19 names it `TRANSFER_BLOCKED` (SPEC-009 task-level also `TASK_BLOCKED`) | 007, 009, 010, 012 | Use the SPEC-012 catalogue code `TASK_BLOCKED` for the notification and keep `TRANSFER_BLOCKED` as the audit event |
| 2 | The audit event for a refused workflow transition has four names: `WORKFLOW_INVALID_TRANSITION_ATTEMPT` (007, 013), `SECURITY_INVALID_WORKFLOW_TRANSITION` (010), `INVALID_WORKFLOW_TRANSITION_ATTEMPT` (008, 009) | 007, 008, 009, 010, 013 | One code in the SPEC-013 catalogue; the other specs reference it |
| 3 | Receiving Manager clarification at re-approval (`TR-015`): SPEC-007 default responder is the Employee, SPEC-008 notification default is HR | 007, 008 | Single answer at Gate 1 (TDD-007.05 / TDD-007.06 / TDD-008.02) |
| 4 | Golden matrix allowed-cell count (78) depends on accepting `TR-015` (77 otherwise) | 007, 016 | Settled by TDD-007.06 |

---

## Part N - Consolidated Gate 1 Technical Design Decisions

Every decision below is **Technical Design Decision Required - Not Defined by BRD**. Each spec closes with its own table (`TDD-<SPEC#>.<NN>`, question, recommended default `[PROPOSED]`, impact); this part groups the **252 decisions** (SPEC-001 12, 002 22, 003 10, 004 16, 005 16, 006 16, 007 18, 008 12, 009 15, 010 15, 011 15, 012 16, 013 20, 014 14, 015 22, 016 13) by theme so that one Gate 1 answer closes every linked spec. Cross-spec decisions already merged (`spec-reconciliation-notes.md`): `TDD-012.04 = TDD-001.04 = TDD-004.07`; `TDD-004.11 = TDD-015.03`; `TDD-007.04 = TDD-008.05` (also `TDD-009.13`). Recommended defaults are proposals only; none is a requirement until Gate 1 accepts it. No decision invents a role, eligibility rule, escalation timing or performance number.

### N.1 Top 10 highest-impact decisions

Ranked by how many specs, BRD requirements or release gates they block, and by security/data-integrity exposure.

| Rank | Decision (master id and linked ids) | Why it is high impact | Recommended default `[PROPOSED]` |
|---|---|---|---|
| 1 | **Temporary-password hand-off vs "never persisted in PostgreSQL"** - `TDD-012.04` (= `TDD-001.04` = `TDD-004.07`) | BRD-006/NFR-003 forbid persisting the temporary password, but a retryable outbox email must carry it; shapes SPEC-001 outbox, SPEC-004 provisioning and SPEC-012 retry semantics | Option B: in-memory, post-commit send; admin credential reset as recovery. Option A (encrypted short-lived `notification_secrets`) only if Gate 1 accepts ciphertext persistence |
| 2 | **Receiving Manager scope mapping and "incoming transfer" routing** - `TDD-003.01` (+ `TDD-002.15`, `TDD-007.02`, `TDD-008.06`, `TDD-010.14`, `TDD-014.08`) | BRD defines no mapping from a Receiving Manager to a target department/team; blocks the Receiving Manager stage, re-approval, scope-based visibility and Reassign eligibility (BRD-012, BRD-024, BRD-016) | `receiving_manager_scopes` by Department/BU (optional Location); resolver strategy swappable |
| 3 | **Session mechanism**: JWT access/refresh vs server-side session store; how the 30-minute idle timeout and server-side invalidation are realised - `TDD-002.03` (+ `TDD-002.05`, `.06`, `.09`, `.17`, `.19`) | Defines the whole auth module, FE interceptors and DB cost per request; required for BRD-025 session invalidation on reset/deactivate | Per SPEC-002 recommendation (`token_version` plus `user_sessions`); to be confirmed |
| 4 | **Receiving Manager and Super Admin identity**: User ID prefix, how a Receiving Manager is created, Super Admin bootstrap, multiple roles per user - `TDD-002.01`, `TDD-002.02` (= `TDD-001.07` = `TDD-004.03`), `TDD-004.01`, `TDD-004.02`, `TDD-002.04` (= `TDD-004.04`, `TDD-003.10`, `TDD-007.17`) | BRD-004 lists only EMP/MGR/HR/IT creation; first deployment cannot start without a Super Admin and the Receiving Manager role cannot be provisioned | Seeder from env variables with no committed default credentials; prefixes and creation path as proposed in SPEC-002/004 |
| 5 | **Optional date-change re-approval**: stage, approver and return path - `TDD-007.04` (= `TDD-008.05`, `TDD-009.13`) | BRD-031 leaves the "configured approval stage/approver" undefined; affects the registry, SPEC-008 date handling and SPEC-009 completion block | Configured stage from {Reporting Manager approval, Receiving Manager approval if enabled, Receiving Manager re-approval}; off by default |
| 6 | **Who answers an Info Required raised by HR or at re-approval; Receiving Manager clarification row** - `TDD-007.05`, `TDD-007.06`, `TDD-008.02`, `TDD-006.16`, `TDD-014.11` | BRD-034 says "Employee or appropriate responsible user"; the BRD matrix has no row for clarification at re-approval; changes the golden matrix count (78 or 77) and worklist/UI routing | Employee responds; return to the requesting stage and reviewer; derived row `TR-015` allowed |
| 7 | **Profile organisation update on transfer completion; who edits profile data** - `TDD-004.11` (= `TDD-015.03`, `TDD-008.09`) | Decides whether the portal profile stays current after Completed (BRD-029 source of truth, BRD-OQ-19) and whether SPEC-009 calls `EmployeeProfileService.applyTransferOutcome` | Transfer values stay on the Transfer Request; no automatic profile update unless the business decides |
| 8 | **Validation of BRD-039 Integration scenarios I1-I5 with no integration** - `TDD-015.01` (= `TDD-016.01`) | BRD-039 scenarios are mandatory and any failure blocks production; no external system exists to test | Manual-Payroll path, SMTP dependency and a contract-level harness; Gate 1 reviewer confirms |
| 9 | **Role visibility cells left undefined by the BRD (21 permission cells)** - `TDD-002.22`, with `TDD-005.02`, `TDD-006.04`, `TDD-005.14`, `TDD-011.05` to `.07`, `TDD-013.03`, `.04`, `.05`, `TDD-014.09`, `.10`, `TDD-002.16` (= `TDD-004.13`, `TDD-009.07`) | Employee/manager/IT access to vacancies, documents, audit and minimum IT data is "subject to policy" in the BRD; enforcement is deny-by-default until answered, affecting UAT and NFR-007 privacy | Deny until decided; per-spec defaults listed in each spec |
| 10 | **BRD-038 numeric inputs and infrastructure targets** - `TDD-001.09`, `TDD-005.10`, `TDD-007.13`, `TDD-011.15`, `TDD-015.20`, `TDD-015.21`, `TDD-012.03`, `TDD-015.19` | Concurrent users, volume, response-time and API timeout values are "to be confirmed" in the BRD; performance validation `PPV-08` stays BLOCKED and the production readiness gate cannot pass without them | No number invented; owners and a pre-production environment definition proposed; inputs registered as empty blocking inputs |

Also high impact but not in the top 10: `TDD-007.01` (initial workflow configuration: Receiving Manager enabled? date re-approval?; submit blocked until configured), `TDD-001.01` / `TDD-015.02` (TLS and at-rest arrangement for local deployment, NFR-004), `TDD-009.05`, `.06`, `.08`, `.10` (IT assignee selection, no eligible IT user, task catalogue, completion evidence), `TDD-010.01` (may HR resume a block placed by Super Admin), `TDD-013.01`, `TDD-013.02`, `TDD-001.08`, `TDD-015.13` (tamper-evidence beyond append-only; audit-write failure policy).

### N.2 All decisions by theme

#### Theme 1 - Identity, accounts, roles and sessions

| Ids | Decision |
|---|---|
| `TDD-002.01`, `TDD-004.01`, `TDD-004.02`, `TDD-001.12` | User ID prefix for Receiving Manager and Super Admin; creation of a Receiving Manager; other business id formats |
| `TDD-002.02`, `TDD-001.07`, `TDD-004.03` | Super Admin bootstrap and creating further Super Admins |
| `TDD-002.03`, `TDD-002.05`, `TDD-002.06`, `TDD-002.09`, `TDD-002.19`, `TDD-002.17` | Session store vs JWT, definition of inactivity, absolute lifetime, lock vs existing sessions, concurrent sessions, client token storage |
| `TDD-002.04`, `TDD-004.04`, `TDD-003.10`, `TDD-007.17` | One user holding more than one role; separation of duties when an approver is the requester |
| `TDD-002.07`, `TDD-002.08`, `TDD-002.10`, `TDD-002.12`, `TDD-002.13`, `TDD-002.14`, `TDD-002.18`, `TDD-002.20`, `TDD-002.21` | Password special-character definition, lock edge rules, account-state disclosure, voluntary change, self-service reset, last-Super-Admin protection and reactivation, IP throttling, audit of logins and denial throttling |
| `TDD-004.05`, `TDD-004.06`, `TDD-004.08`, `TDD-004.09`, `TDD-004.10`, `TDD-004.12`, `TDD-004.14`, `TDD-004.15`, `TDD-004.16` | Employment-status value set, Employee ID vs User ID, required profile fields per role, role change, deactivation with pending work, mandatory admin reasons, activation target status, temporary password length/charset, e-mail domain restriction |
| `TDD-004.11` (= `TDD-015.03`), `TDD-008.09` | Profile update on completion and who edits profile data (merged) |

#### Theme 2 - Organisation structure, scope and routing

| Ids | Decision |
|---|---|
| `TDD-003.01`, `TDD-002.15`, `TDD-007.02`, `TDD-008.06`, `TDD-010.14`, `TDD-014.08` | Receiving Manager scope mapping and incoming-transfer definition |
| `TDD-003.02`, `TDD-003.03`, `TDD-003.05`, `TDD-003.09` | Department/BU hierarchy, deactivating a master in use, master field sets, behaviour when a mapped master becomes inactive |
| `TDD-003.04`, `TDD-008.08`, `TDD-009.01`, `TDD-009.03`, `TDD-009.05`, `TDD-009.06`, `TDD-010.12`, `TDD-006.10`, `TDD-007.07`, `TDD-014.07` | HR and IT scope granularity, assigned HR/IT selection among several users, HR task model, IT routing location, no eligible IT user, pool vs named assignee, HR visibility basis |
| `TDD-003.06`, `TDD-003.08` | Users-module visibility per role; single owner of the Reporting Manager relationship |
| `TDD-006.11`, `TDD-007.12` | Inactive Reporting Manager at submission; manager resolution timing |
| `TDD-007.03` | Switching the Receiving Manager stage on/off with requests in flight |

#### Theme 3 - Visibility, privacy and information exposure

| Ids | Decision |
|---|---|
| `TDD-002.22`, `TDD-002.16`, `TDD-004.13`, `TDD-009.07`, `TDD-014.09` | Role cells marked "?"; the minimum employee information visible to IT |
| `TDD-005.02`, `TDD-005.14`, `TDD-005.03`, `TDD-005.15`, `TDD-006.04` | Employee vacancy visibility and capacity count exposure; HR vacancy read scope; HR scope for manual release |
| `TDD-006.12`, `TDD-007.09`, `TDD-008.07` | What the Employee sees of timeline entries, reasons, comments and HR rejection reason; IT view of history |
| `TDD-011.05`, `TDD-011.06`, `TDD-011.07` | Document visibility for Employee, Reporting/Receiving Manager and IT |
| `TDD-013.03`, `TDD-013.04`, `TDD-013.05`, `TDD-013.17` | Per-role audit visibility, Employee audit visibility, previous assignee visibility, IP/User-Agent retention |
| `TDD-002.11`, `TDD-007.10`, `TDD-010.15`, `TDD-013.15`, `TDD-015.11`, `TDD-012.15` | 403 vs 404 policy for out-of-scope and unknown ids |
| `TDD-014.10`, `TDD-015.16` | Per-role report policy and hidden fields; personal-data classification |

#### Theme 4 - Workflow rules and stage semantics

| Ids | Decision |
|---|---|
| `TDD-007.01`, `TDD-007.14`, `TDD-007.15` | Initial workflow configuration; code-defined registry; reason/comment length |
| `TDD-007.04` (= `TDD-008.05`, `TDD-009.13`) | Date-change re-approval stage and approver |
| `TDD-007.05`, `TDD-007.06`, `TDD-008.02`, `TDD-006.16`, `TDD-014.11`, `TDD-007.16` | Clarification responder, clarification at re-approval, response attachments |
| `TDD-007.08`, `TDD-009.15`, `TDD-009.11`, `TDD-009.12`, `TDD-009.04`, `TDD-009.09` | Super Admin acting on behalf; separation of IT executor and approver; non-mandatory Payroll; IT task granularity; task-level Block vs transfer Block |
| `TDD-007.11`, `TDD-010.03`, `TDD-010.01`, `TDD-010.02`, `TDD-010.05`, `TDD-010.08`, `TDD-010.13`, `TDD-010.09`, `TDD-010.10`, `TDD-010.11`, `TDD-010.06` | Reassign/Block in Info Required and Blocked; cross-resume; Withdraw from Blocked; extra Resume revalidation conditions; uploads/edits while Blocked; displaced assignee scope; Employee notification on own Withdraw; reapplication link; final-row columns; reason length |
| `TDD-008.01`, `TDD-008.03`, `TDD-008.04`, `TDD-008.10`, `TDD-008.12` | Mandatory HR activities, stages for HR org changes, proposed values vs vacancy values, employment-status value set, other org metadata catalogue |
| `TDD-006.02`, `TDD-006.03`, `TDD-006.06`, `TDD-006.07`, `TDD-006.08`, `TDD-006.09`, `TDD-006.13`, `TDD-006.14` | Reference assignment point, "Active" employment value, multiple Drafts, ineligible Draft creation, proposed vs vacancy values, no-change transfer, Draft retention, reason length |
| `TDD-005.04` to `TDD-005.09`, `TDD-005.11`, `TDD-005.12`, `TDD-005.16` | Capacity limits and mutability, Allocated/Filled meaning, remarks on manual change, soft delete, effect of manual release, "no conflicting final allocation", error code confirmation, duplicate vacancies, isolation level |

#### Theme 5 - Reference data, formats and cross-cutting data

| Ids | Decision |
|---|---|
| `TDD-005.01`, `TDD-006.01`, `TDD-008.11`, `TDD-009.02`, `TDD-015.22` | Vacancy, transfer and Payroll reference formats |
| `TDD-001.02`, `TDD-006.05` | Business time zone value and source |
| `TDD-004.05`, `TDD-006.03`, `TDD-008.10`, `TDD-015.04`, `TDD-014.01` | Employment-status value set (appears in five specs) |
| `TDD-015.01` (= `TDD-016.01`) | Validation approach for BRD-039 integration scenarios |
| `TDD-015.14`, `TDD-015.15` | Role that retries a failed future integration; optional field-ownership API/page |
| `TDD-015.09`, `TDD-006.15` | `Idempotency-Key` header (submit and mutating APIs) |

#### Theme 6 - Notifications and credential delivery

| Ids | Decision |
|---|---|
| `TDD-012.04` (= `TDD-001.04`, `TDD-004.07`), `TDD-012.05`, `TDD-012.06` | Credential hand-off master decision, secret TTL/purge, residual duplicate-email risk |
| `TDD-012.01`, `TDD-007.18`, `TDD-009.14`, `TDD-010.04`, `TDD-005.13`, `TDD-011.14` | Recipient sets for "relevant stakeholders/users"; notifications for vacancy release and new documents |
| `TDD-012.02`, `TDD-012.03`, `TDD-012.07`, `TDD-012.08`, `TDD-012.09`, `TDD-012.10`, `TDD-012.11`, `TDD-012.12`, `TDD-012.13`, `TDD-012.14`, `TDD-012.16` | SMTP service, retry numbers, inactive recipients, template engine, worker deployment, who may retry, confirmations, audit granularity, retention, unread transport, preferences |

#### Theme 7 - Audit and compliance

| Ids | Decision |
|---|---|
| `TDD-013.01`, `TDD-001.08`, `TDD-015.13`, `TDD-013.11`, `TDD-013.12` | Tamper-resistance level beyond append-only, external anchoring, separate DB roles |
| `TDD-013.02`, `TDD-001.11`, `TDD-013.16` | Behaviour when an audit write fails; spool and reconciler |
| `TDD-013.06`, `TDD-013.07` | Audit export format, row cap, sync vs async, re-authentication |
| `TDD-013.08`, `TDD-013.13`, `TDD-013.14`, `TDD-013.18`, `TDD-013.20` | Audited reads/logins/Draft saves, display time zone, remarks search/count, correction links |
| `TDD-013.09`, `TDD-013.10`, `TDD-013.19` | Partitioning, PostgreSQL version/extensions, kernel column reconciliation |

#### Theme 8 - Documents

| Ids | Decision |
|---|---|
| `TDD-011.01`, `TDD-011.02`, `TDD-011.11`, `TDD-011.13` | Category catalogue, allowed image formats and MIME rules, 5 MB byte definition, duplicate handling |
| `TDD-011.03`, `TDD-011.04`, `TDD-011.08` | Upload stages and uploaders (Super Admin), replacement without delete |
| `TDD-009.10`, `TDD-011.07` | IT completion evidence mechanism |
| `TDD-011.09`, `TDD-011.10`, `TDD-011.12`, `TDD-011.15` | Orphan files, storage host/permissions, audit scope and fail-closed, upload timeout/concurrency |

#### Theme 9 - Platform, NFR and performance

| Ids | Decision |
|---|---|
| `TDD-001.01`, `TDD-015.02`, `TDD-015.07` | TLS arrangement and at-rest encryption |
| `TDD-001.05`, `TDD-013.12`, `TDD-015.17` | Separate DB runtime and migration roles |
| `TDD-001.06`, `TDD-013.10` | Supported Node.js and PostgreSQL versions |
| `TDD-001.09`, `TDD-005.10`, `TDD-007.13`, `TDD-011.15`, `TDD-015.10`, `TDD-015.19`, `TDD-015.20`, `TDD-015.21`, `TDD-016.05` | BRD-038 numeric inputs, timeouts, lock timeouts, retries, owners, pre-production environment, load tool |
| `TDD-001.10`, `TDD-015.05`, `TDD-015.06`, `TDD-015.12`, `TDD-015.18` | Rate limits, CORS origins, dependency-audit threshold, integrity-check schedule |
| `TDD-001.03`, `TDD-003.07`, `TDD-014.14`, `TDD-015.08` | Accessibility standard and level, design standard |

#### Theme 10 - Dashboards, overdue and escalation

| Ids | Decision |
|---|---|
| `TDD-014.02`, `TDD-014.03`, `TDD-014.04`, `TDD-014.13` | Definitions of pending approvals, HR reviews, blocked tasks, completion time |
| `TDD-014.05`, `TDD-014.06`, `TDD-010.07` | Overdue clock rules, escalation recipients and cadence (no timings invented), Blocked duration |
| `TDD-014.12` | Report export need, format and roles |

#### Theme 11 - QA, UAT and release

| Ids | Decision |
|---|---|
| `TDD-016.02`, `TDD-016.03`, `TDD-016.04`, `TDD-016.13` | UI E2E tool, coverage thresholds, CI platform, browser/device matrix |
| `TDD-016.06`, `TDD-016.07`, `TDD-016.12` | Defect severity and exit rule, UAT participants and sign-off authority, waiver governance for mandatory scenarios |
| `TDD-016.08`, `TDD-016.09`, `TDD-016.10`, `TDD-016.11` | Test data policy, concurrency repetition counts, e-mail sandbox, evidence retention |

### N.3 How these are closed

Each decision is closed or accepted by the Gate 1 reviewer of the owning spec (Project Manager / Product Owner roster, `RR-05`); the cross-spec masters above need one answer recorded in all linked specs. The accepted answer flips the matching row of the SPEC-002 permission registry, workflow registry or configuration, and its test. Until then the recommended default stays `[PROPOSED]` and the BRD-silent behaviour is implemented as deny or "not configured", never invented.
