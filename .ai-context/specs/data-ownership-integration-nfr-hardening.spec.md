# SPEC-015 — Source of Truth, Integration Boundary, NFR & Security Hardening

## Feature ID
data-ownership-integration-nfr-hardening

## Status
Changes Requested at Gate 1 (2026-10-27) — reviewer Shamik Bhattacharya; see `.ai-context/pr_reviews/SPEC-015-data-ownership-integration-nfr-hardening-20261027-125458.md`. Spec must be updated and re-submitted for Gate 1; plan, tasks, tests and code remain blocked

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 1 (Spec Peer Review) | Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) | 2026-10-27 | Changes Requested | `.ai-context/pr_reviews/SPEC-015-data-ownership-integration-nfr-hardening-20261027-125458.md` |
| Gate 2 (Code Review) | — | — | Not started | — |

## Intent & Business Goals

SPEC-015 is the **cross-cutting constraint spec** of the Internal Transfer Digital Journey. It owns no standalone domain screen. It (a) turns the BRD-029 "source of truth" decisions into enforceable, testable controls, (b) turns the "no external integration in the current phase" decision (BRD Integration Requirements, BRD-038, NFR-006) into an explicit architectural boundary with a mandatory contract checklist for any future integration, and (c) maps NFR-001 … NFR-009 and the application-level parts of BRD-038 to concrete verification tasks and a **production readiness gate**.

Business goals:
1. The portal is the single operational source of employee and organisation data in the current phase; nobody can write a controlled field outside its owner role and approved write path `[BRD-029, BRD-OQ-19]`.
2. No external HR or Payroll system is called, polled, synchronised with or depended on; Payroll completion is manual by authorised HR `[BRD-027(c), BRD-029]`.
3. Future integration remains possible without rework **but nothing is built now** `[BRD Integration Requirements, Out of Scope]`.
4. Data stays consistent: no partial or duplicate processing in critical operations `[BRD-038]`.
5. Every NFR has a named control, an owning spec and an automated or documented verification; items the BRD defers (performance numbers, backup, monitoring, availability) are tracked as **mandatory inputs with no invented values** `[BRD-038, NFR-009, BRD-OQ-09]`.

## User Roles & Actors

| Actor | Involvement in this SPEC |
|---|---|
| Super Admin | Owner of most controlled employee/organisation fields; only role that may read the field-ownership matrix view (optional API); receives hardening-related admin messages |
| HR | Owner of transfer-related organisation updates, Effective Transfer Date, Payroll reference/assignment; manual Payroll completion (no integration) |
| Employee | **Cannot edit controlled data** `[BRD-029]`; enforcement target of the guard |
| Reporting Manager / Receiving Manager / IT | Read-only consumers of controlled data within scope; IT sees minimum information `[BRD-014, NFR-007]` |
| Engineering roles (not application roles) | Technical Lead / Architect (Gate 2 reviewer) owns security/NFR sign-off tasks; QA owns verification evidence. No new application role is created `[Contract §0]` |

---

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-015 (merger of the originally planned "Source of Truth / Integration Boundary" and "NFR / Security Hardening" specs) |
| Title | Source of Truth, Integration Boundary, NFR & Security Hardening |
| Purpose | Enforce field ownership and in-flight snapshot rules; fix the integration boundary; verify NFR-001..009 and BRD-038 controls; define the production readiness gate |
| Business objective | Prevent data-ownership drift, accidental integrations, security regressions and unvalidated go-live |
| Version | 0.1 (Draft) |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer per roster | Project Manager / Product Owner |
| Task prefix | `TASK-015.MM` |
| Classification tags | `[BRD]` stated; `[DERIVED]` follows from BRD text; `[PROPOSED]` reviewable design; `[TDD-REQUIRED]` Technical Design Decision Required — Not Defined by BRD (closing section, IDs `TDD-015.NN`) |

## 2. Why This SPEC Exists

1. BRD-029 (employee-data source of truth, BRD-OQ-19) is implemented across several specs (004 profile writes, 006 snapshot, 008 HR changes, 009 Payroll reference). Without one place that states the **ownership matrix and verifies enforcement**, each spec can drift.
2. The BRD explicitly bars HR/Payroll integration for this phase yet requires a **future-ready contract discipline** (eleven elements) and NFR-006 reliability rules. Nothing in the other specs owns that boundary.
3. BRD-038 lists performance items as "to be confirmed". Engineering must neither invent numbers nor ignore them: this SPEC records them as mandatory inputs and blocks go-live until supplied.
4. NFR-004 (transport and data protection), NFR-006 (reliability) and NFR-009 (deferred infrastructure) have no single owning feature; NFR-001/002/003/005/007/008 are implemented elsewhere but need an independent cross-cutting verification pass.
5. BRD-039 requires "Integration" negative scenarios although no integration exists; a validation approach must be proposed for Gate 1 decision (`TDD-015.01`).

## 3. BRD Traceability

Coverage legend: **FULL** = this SPEC is primary owner of the slice stated; **PARTIAL(slice)** = other specs own the rest. There is no BRD-015 in the approved BRD (numbering skips 014 to 016); this SPEC number is unrelated.

### 3.1 BRD requirement IDs

| BRD ID | Topic | Coverage | Slice in this SPEC |
|---|---|---|---|
| BRD-029 | Eligibility / **source of truth** | PARTIAL(source-of-truth, field ownership, master-only values, in-flight snapshot, no HR sync, conflict handling) | Eligibility rules themselves: SPEC-006 (+008 HR revalidation) |
| BRD-038 | Performance & Availability | FULL (cross-cutting; input register, test-plan prerequisites, pre-production validation, timeout/retry/transaction expectations) | 5 MB limit enforced by SPEC-011; verified here |
| BRD-020 | HR org metadata updates change portal data only | PARTIAL(no external HR master update; ownership) | Write path: SPEC-008 |
| BRD-024 | Re-approval on org change | PARTIAL(snapshot/audit consistency checks) | Trigger: SPEC-008 |
| BRD-027(c) | Manual Payroll completion, no Payroll API | PARTIAL(integration boundary verification) | Write path: SPEC-009 |
| BRD-022 / BRD-037 | Audit | PARTIAL(tamper-resistance review, secret-leak scan, consistency checks) | Kernel SPEC-001, features SPEC-013 |
| BRD-025 / BRD-026 | Auth/session; API authorisation | PARTIAL(hardening review checklist only) | Implementation SPEC-002 |
| BRD-021 | Document security / 5 MB | PARTIAL(verification of limit end-to-end incl. proxy) | SPEC-011 |
| BRD-036 | Notification failure isolation | PARTIAL(validation of SMTP-dependency scenarios, NFR-006 retry) | SPEC-012 |
| BRD-039 | Mandatory negative scenarios | PARTIAL(Integration rows: validation approach and harness; security/workflow/vacancy rows: hardening evidence feeds SPEC-016) | Execution/UAT: SPEC-016 |
| BRD-002 | UI accessibility | PARTIAL(NFR-008 verification) | UI: SPEC-003/001 |
| BRD-012, BRD-017, BRD-028, BRD-030 | Receiving Manager config / vacancy / one-active | PARTIAL(consistency queries only) | SPEC-005/006/007 |

### 3.2 NFR IDs

| NFR | Coverage | Slice |
|---|---|---|
| NFR-001 Authentication | PARTIAL(cross-cutting verification) | §7 FR-015.60..62, TASK-015.20, TASK-015.33 |
| NFR-002 Authorisation | PARTIAL(verification: route-matrix, IDOR, mass assignment) | TASK-015.20 |
| NFR-003 Credential security | PARTIAL(log/audit secret scan, redaction) | TASK-015.17 |
| NFR-004 Transport & data protection | **FULL** (SPEC-001 kernel) | TASK-015.12, .18, .19 |
| NFR-005 Auditability | PARTIAL(tamper-resistance review) | TASK-015.21 |
| NFR-006 Reliability | **FULL** for integration rules (with SPEC-012 notifications) | TASK-015.07..11, .26, .27 |
| NFR-007 Privacy | PARTIAL(response projection / minimum information verification) | TASK-015.19 |
| NFR-008 Accessibility | PARTIAL(verification; UI by SPEC-003/001) | TASK-015.22 |
| NFR-009 Performance/availability/backup/monitoring | **FULL** (planning checklist; no numbers) | TASK-015.23, .25, .28, .29 |

### 3.3 Open questions

| BRD-OQ | Status in BRD | Treatment |
|---|---|---|
| BRD-OQ-09 | Resolved (deferred) to infrastructure planning | **Deferred checklist** (§11.9, TASK-015.29); no numbers invented |
| BRD-OQ-19 | Resolved | Implemented as ownership matrix, snapshot, no-sync rules (FR-015.01–FR-015.18, FR-015.30) |
| BRD-OQ-16(b)/(c) | Resolved | Missing-data and ineligible outcomes: SPEC-006/008; ownership of correction path in matrix |
| BRD-OQ-14(c) | Resolved | Manual Payroll, no API: integration boundary |
| BRD-OQ-03 | Resolved | SMTP/email service is the only external dependency (see §4) |

### 3.4 Business rules covered

Source-of-truth rule (Business Rules para 4); Integration Requirements rule; Performance & availability rule (BRD-038); Payroll responsibility rule; Mandatory negative scenarios rule (integration slice).

### 3.5 BRD Acceptance Criteria bullets covered

| BRD Acceptance Criteria bullet | Coverage |
|---|---|
| "Employee data (BRD-029): the portal is the operational source…" | FULL (SPEC-015.AC01–AC09) |
| "Performance & availability (BRD-038)…" | FULL (SPEC-015.AC29–AC32, AC35) |
| "Mandatory negative acceptance scenarios (BRD-039)…" | PARTIAL(Integration rows, security evidence) |
| "Approved requests generate only applicable downstream actions; failures are visible and recoverable" | PARTIAL(integration-failure visibility rule for future; notification failure visible via SPEC-012) |
| "Every protected API validates Authenticated User → …" | PARTIAL(verification) |
| "Every material … action creates the agreed audit record" | PARTIAL(consistency check) |

### 3.6 Negative scenarios (BRD-039 rows)

| BRD-039 row | Coverage |
|---|---|
| Integration: timeout does not create duplicate downstream transactions | FULL(approach per TDD-015.01; SPEC-015.NAC08) |
| Integration: failed integrations support controlled retry where applicable | FULL (SPEC-015.NAC09) |
| Integration: failed integration does not mark task Completed | FULL (SPEC-015.NAC10) |
| Integration: external failure does not mark transfer Completed | FULL (SPEC-015.NAC11) |
| Integration: retry follows NFR-006 idempotency | FULL (SPEC-015.NAC12) |
| Security rows (scope, IDOR, IT docs, first-login, locked, deactivated, old password, direct API) | PARTIAL(hardening checklist evidence; execution SPEC-016) |
| Workflow rows / Vacancy rows | PARTIAL(consistency queries SPEC-015.NAC25–NAC30; execution SPEC-016) |

---

## 4. Dependencies

| Depends on | What is needed |
|---|---|
| SPEC-001 | `withTransaction`, error classes, logger with redaction, config loader, response envelope, validation middleware, audit kernel (`audit_logs` append-only), notification outbox kernel, request-id |
| SPEC-002 | `authenticate`, `AuthorizationService.authorize`, `ScopeResolver`, session/token handling, lockout, password hashing |
| SPEC-003 | Master data (locations, departments/BU, designations), organisation scope mappings, UI shell and a11y patterns |
| SPEC-004 | `employee_profiles` write paths (Employee ID, name, email, employment status, org assignment, manager, HR/IT assignment) |
| SPEC-005 | `vacancies`, `vacancy_reservations`, `VacancyService` (invariants verified here) |
| SPEC-006 | `transfer_requests` (snapshot columns, one-active partial unique index) |
| SPEC-007 | `WorkflowEngine.transition`, history, task assignments |
| SPEC-008 | `transfer_org_changes`, HR change/re-approval, effective-date correction |
| SPEC-009 | `payroll_activities` (manual Payroll), IT tasks, completion gate |
| SPEC-011 | Upload validation (5 MB) and scoped document access |
| SPEC-012 | Notification dispatch, retry, idempotency (the only in-phase external dependency: SMTP) |
| SPEC-013 | Audit visibility/export |
| SPEC-016 | Executes BRD-039 scenarios and consumes this SPEC's evidence |

External dependencies (current phase): **only** the enterprise/official company email service `[BRD Dependencies, BRD-OQ-03]` and PostgreSQL, local file storage. No HR, Payroll, SSO/IdP, malware-scan or ITSM endpoint is called `[BRD Dependencies, Out of Scope]`.

## 5. Enables

| Enabled item | How |
|---|---|
| SPEC-016 (QA/UAT) | Integration-scenario approach, consistency queries, security checklists, performance plan |
| Production deployment | Production readiness gate (§8 TASK-015.32) |
| Future integrations | Ports, contract checklist template and registration guard (no adapters) |
| Gate 2 reviews of all specs | Shared hardening checklists reused as review aids |

## 6. Roles & Scope

| Role | Scope |
|---|---|
| Super Admin | Read-only view of field-ownership matrix (optional API, FR-015.02, TDD-015.15). Owns master data and profile fields per matrix |
| HR | Owns transfer-related organisation fields within assigned scope |
| Employee | No write access to controlled data |
| Other app roles | No new capability |
| Engineering | Tasks 015.xx executed by engineering/QA; sign-off by Technical Lead / Architect as Gate 2 reviewer |

In scope: ownership enforcement, snapshot rules, consistency verification, integration boundary, NFR/security hardening and verification, TBC input register, readiness gate. Out of scope: see closing section.

---

## 7. Functional Requirements

### 7.1 Part A — Source of truth & data consistency

| ID | Requirement | Tag / BRD ref |
|---|---|---|
| FR-015.01 | For the current phase the Internal Transfer Portal (PostgreSQL) is the **operational source** of employee and organisation data used by the transfer workflow. No other system is read or written to obtain or publish these values. | `[BRD-029, BRD-OQ-19]` |
| FR-015.02 | A field-ownership registry (code, single file, typed) defines for each controlled field its owner role(s), owning write-path SPEC/endpoint and enforcement checks, exactly per the matrix in §9.1. | `[BRD-029]` registry form `[PROPOSED]` |
| FR-015.03 | Every API or service that writes a controlled field MUST be registered in the registry. A build-time test fails if a model column marked controlled is written by a service not listed. | `[PROPOSED]` (enforces `[BRD-029]`) |
| FR-015.04 | An **Employee** can never create/modify controlled organisation or profile data (Employee ID, name, official email, employment status, department/BU, designation, location, reporting manager, HR/IT assignment, vacancy master, Payroll reference, transfer-specific org metadata). The only permitted Employee writes on a transfer are Draft fields (BRD-032) and clarification responses (BRD-034). | `[BRD-029 missing-data, BRD-OQ-19(e), BRD-032]` |
| FR-015.05 | Write requests carrying fields outside the endpoint allow-list are rejected (HTTP 400 `VALIDATION_ERROR` with unknown field names) — no silent drop and no mass-assignment of controlled columns. | `[PROPOSED]` (secure API practice) |
| FR-015.06 | Department/BU, Designation, Location and Vacancy values are accepted only as **identifiers of existing, active master records** (FK-validated); free-text values are rejected in every transfer-processing endpoint. | `[BRD-029]` |
| FR-015.07 | Database foreign keys enforce FR-015.06: transfer snapshot, HR-change and profile columns reference master tables; no free-text organisation column exists on workflow tables. | `[DERIVED]` from BRD-029 (DB-level backing) |
| FR-015.08 | For an in-flight transfer, the values stored on the Transfer Request (snapshot/proposed/confirmed values) are the values the workflow uses; the workflow does not re-read `employee_profiles` for those attributes mid-flight. | `[BRD-029]` |
| FR-015.09 | When authorised HR changes transfer-related organisation information during processing, the Transfer Request values are updated and used from then on; BRD-024 re-approval applies when Receiving Manager approval is enabled and the change touches Dept/BU, Designation, Location or Reporting Manager. Previous and new values are retained in audit history. | `[BRD-029, BRD-024, BRD-032]` |
| FR-015.10 | HR updates under BRD-020/BRD-024 change **portal / Transfer Request data only**. No code path writes to an external HR master. | `[BRD-029, BRD-020]` |
| FR-015.11 | There is no real-time sync, scheduled sync, callback endpoint or polling job against any HR system; portal operation has no dependency on HR-system availability (no HR health probe in `/ready`). | `[BRD-029, Out of Scope]` |
| FR-015.12 | Source-of-truth conflict rule: if a portal value differs from an external HR master value, the **portal value wins** for all portal workflow decisions; alignment of the external HR master is handled by the organisation's HR process outside the portal. The portal never auto-imports, overwrites or reconciles from the external value. | `[BRD-029, BRD-OQ-19(c)(d)]` |
| FR-015.13 | Missing mandatory employee/organisation data blocks submission (SPEC-006), reserves no capacity, names the missing fields, directs the employee to the assigned HR team (from Location / HR assignment) and never invents or substitutes data. This SPEC verifies the guard keeps the Employee from correcting it directly. | `[BRD-029, BRD-OQ-16(b), BRD-OQ-19(e)]` |
| FR-015.14 | After HR/Super Admin correct data, eligibility and required data are revalidated before the workflow continues (SPEC-006/008). | `[BRD-029]` |
| FR-015.15 | A **data-consistency verification suite** (read-only SQL checks CHK-01..CHK-14, §11.3) runs on demand, in CI integration tests and in the pre-production gate. It reports violations; it never repairs data automatically. | `[PROPOSED]`; each check `[DERIVED]` from a cited BRD rule |
| FR-015.16 | The suite includes an **informational drift report** (in-flight transfer snapshot vs current employee profile) that is NOT a defect: divergence is by design (FR-015.08). It exists so HR can see it; no automatic action. | `[PROPOSED]` `[DERIVED]` from BRD-029 |
| FR-015.17 | No reconciliation job against an external HR source exists. Reconciliation rules are a mandatory item of any future HR-integration contract (§7.2 checklist). | `[BRD-029]` |
| FR-015.18 | All controlled-field denials are returned as HTTP 403 `FORBIDDEN` (not 400) without exposing restricted data, and are audited as security events. | `[BRD-026]` `[PROPOSED]` code |

### 7.2 Part B — Integration boundary

| ID | Requirement | Tag / BRD ref |
|---|---|---|
| FR-015.30 | No external Payroll or HR system integration/API, callback or status feed exists in the current phase. Payroll completion is recorded manually by an authorised HR user (SPEC-009). | `[BRD Integration Requirements, BRD-027(c)]` |
| FR-015.31 | No unapproved integration is introduced. A CI guard (TASK-015.08) fails the build if production code imports an HTTP-client library or opens an outbound socket outside the **allow-list** (PostgreSQL driver, SMTP transport in the notification module). | `[DERIVED]` from "no unspecified external integration is assumed" |
| FR-015.32 | The architecture exposes **integration ports** (TypeScript interfaces/types only) for `PayrollPort` and `EmployeeMasterPort` in `backend/src/shared/integration/ports/`. No adapter, no wiring, no configuration flag, no table is created in the current phase. A portal-internal **manual** implementation of "Payroll activity completion" lives in SPEC-009 services and does not implement the port. | `[PROPOSED]` (keeps future option; builds nothing) |
| FR-015.33 | The domain layer depends only on internal service interfaces (e.g. `PayrollActivityService`), never on external DTOs, so a future adapter can be added behind a port without altering workflow rules. | `[PROPOSED]` |
| FR-015.34 | **Mandatory future-integration contract checklist** — any later integration must have an approved written contract covering all eleven elements before implementation (§9.3). | `[BRD Integration Requirements]` |
| FR-015.35 | A registration guard `IntegrationRegistry.register(descriptor)` (code only, not wired) refuses a descriptor lacking `contractRef`, `timeoutMs`, `retryPolicy`, `idempotencyStrategy`, `statusMapping`, `sourceOfTruth`; this encodes "timeout defined per integration before implementation". | `[BRD-038, BRD Integration Requirements]` guard `[PROPOSED]` |
| FR-015.36 | NFR-006 rules binding every future adapter: (a) retry must not create duplicate downstream transactions (idempotency key per business operation, independent of attempt number); (b) a failed integration remains visible with failure status and error details; (c) an authorised user may retry where applicable; (d) failure never marks the task Completed nor the transfer Completed; (e) failure is auditable and recoverable. | `[NFR-006, BRD-038, BRD-039]` |
| FR-015.37 | Retry-authorised role for a future integration is not defined by the BRD; it is a contract element (TDD-015.14). | `[TDD-REQUIRED]` |
| FR-015.38 | **BRD-039 Integration scenario validation** in the current phase: recommended approach = (1) contract-level test harness with a test-only fake adapter and fault injection, (2) manual-Payroll-path idempotency tests, (3) SMTP dependency fault tests via the notification outbox. Gate 1 reviewer decides (TDD-015.01). Harness lives under `tests/` only; it is not shipped. | `[TDD-REQUIRED]` with `[PROPOSED]` default |
| FR-015.39 | The one real external call in the current phase is email delivery (BRD-OQ-03). Its timeout, retry and idempotency are governed by SPEC-012 and verified here against NFR-006. | `[BRD-036, NFR-006]` |
| FR-015.40 | Any integration timeout value is defined **per integration before implementation**; none is defined now. No default timeout for "integrations" is hard-coded. | `[BRD-038]` |

### 7.3 Part C — NFR & security hardening

| ID | Requirement | Tag / BRD ref |
|---|---|---|
| FR-015.50 | **NFR-004 transport**: all client↔server and server↔DB traffic (where DB is on a separate host) and SMTP use encrypted transport. TLS termination arrangement for local deployment is a technical design decision (TDD-015.02), recommended default reverse proxy with HTTPS-only, HTTP→HTTPS redirect and HSTS. | `[NFR-004]` `[TDD-REQUIRED]` |
| FR-015.51 | Secure HTTP headers via `helmet` (already a dependency): at minimum CSP for API responses, `X-Content-Type-Options`, `Referrer-Policy`, `Cross-Origin-Resource-Policy`, `Strict-Transport-Security` in production, `X-Powered-By` removed. Document downloads send `Content-Disposition` and `X-Content-Type-Options: nosniff` (with SPEC-011). | `[NFR-004]` `[PROPOSED]` |
| FR-015.52 | CORS: explicit origin allow-list from environment (`CORS_ALLOWED_ORIGINS`), no wildcard with credentials. Values are a deployment input (TDD-015.06). | `[PROPOSED]` |
| FR-015.53 | Rate limiting on authentication and other abuse-prone endpoints and a coarse global limiter; limits and window are configuration (env), **values TDD** (TDD-015.05). BRD-025 lockout (5 failures/30 minutes) remains the functional control and is not replaced. | `[PROPOSED]` `[TDD-REQUIRED]` |
| FR-015.54 | Input validation: every endpoint declares a schema (type, length, format, enum, allow-list); JSON body size limit explicitly configured; pagination `pageSize` capped; ID path parameters validated; strings trimmed/normalised; no `eval`/dynamic code. | `[PROPOSED]` (INT standards §3) |
| FR-015.55 | SQL injection: only Sequelize bound parameters/replacements; no string-concatenated SQL; any `sequelize.query` must use `replacements`/`bind`; a lint/test fails on template-string SQL with interpolation. | `[PROPOSED]` |
| FR-015.56 | Error leakage: production error handler returns the structured envelope with generic message for 5xx, never stack traces, SQL text, file paths or internal ids; the `requestId` is returned for support. | `[PROPOSED]` (INT standards §2) |
| FR-015.57 | Personal data protection: only the minimum personal attributes are returned per role (response projections/DTO per role; IT receives minimum information); personal data never logged in clear beyond identifiers; log redaction list covers password fields, tokens, authorization header, cookie. | `[NFR-004, NFR-007, BRD-014, NFR-003]` |
| FR-015.58 | Encryption at rest for database volume and document storage is not stated by the BRD; decision is TDD-015.07. Documents are stored outside any web-served directory with non-guessable stored names (SPEC-011). | `[TDD-REQUIRED]` |
| FR-015.59 | Secrets only from environment; a secret scan (CI) fails on committed credentials; `.env` ignored; production refuses to start if required secrets (JWT secret, DB password, SMTP credentials) are missing or equal documented sample values. | `[BRD-025, INT standards §3]` `[PROPOSED]` |
| FR-015.60 | **NFR-001 verification**: password hashing via `bcryptjs` with configurable cost; lockout 5/30 min; idle timeout 30 min; first-login change cannot be bypassed on direct API; reset/deactivation invalidates sessions — verified by cross-cutting tests (implementation SPEC-002). | `[NFR-001, BRD-025]` |
| FR-015.61 | **NFR-002 verification**: automated route inventory proves every non-public route is wrapped by `authenticate` and an `authorize` check with `{resource, action}` metadata; out-of-scope direct API calls return 403; missing/invalid/expired token returns 401. | `[NFR-002, BRD-026]` |
| FR-015.62 | **NFR-003 verification**: repository-wide and runtime tests assert that passwords, temporary passwords, tokens, refresh tokens never appear in logs, audit rows, API responses (other than the one-time administrator creation result per BRD-005), reports or exports. | `[NFR-003, BRD-025, BRD-037]` |
| FR-015.63 | **NFR-005 review**: `audit_logs` is append-only at the database (trigger and privilege), no update/delete API exists, export is Super-Admin only and audited, retention is lifetime with no purge job. | `[NFR-005, BRD-037]` |
| FR-015.64 | **NFR-007 verification**: employee, document and IT-task endpoints are scope-filtered; negative tests for out-of-scope access (cross-employee, cross-location, IT to documents outside task scope). | `[NFR-007, BRD-021, BRD-039]` |
| FR-015.65 | **NFR-008 accessibility**: automated (axe-core) and manual keyboard/screen-reader checklist on every primary page and shared component (dialogs, tables, forms, status badges, errors); the target standard is TDD-015.08 (recommended WCAG 2.1 AA). | `[NFR-008, BRD-002]` `[TDD-REQUIRED]` |
| FR-015.66 | **Document size 5 MB**: verified at every layer (reverse proxy body limit ≥ file size plus multipart overhead, Express/multer limit, SPEC-011 validation → HTTP 413 `FILE_SIZE_EXCEEDED`). | `[BRD-021, BRD-038]` |
| FR-015.67 | **Performance (BRD-038)**: the "to be confirmed" items (§9.6) are tracked in an input register; **no numeric target is defined by this SPEC**. A performance test plan with prerequisites is produced; execution and pass/fail are blocked until all inputs have values. | `[BRD-038]` |
| FR-015.68 | **API timeout** is a single configuration value (`API_REQUEST_TIMEOUT_MS`) with no committed default; production start-up fails (or logs a blocking readiness warning per TDD-015.10) while it is unset. Value comes from technical/infrastructure planning. | `[BRD-038]` `[PROPOSED]` mechanism |
| FR-015.69 | **Transaction safety**: all critical operations (vacancy reserve/release/change/finalise, capacity updates, workflow transitions with history+audit+outbox) execute in one DB transaction with deterministic lock ordering; failure at any step leaves no partial result; verified by fault-injection tests. | `[BRD-038, BRD-028]` |
| FR-015.70 | **Duplicate-processing prevention**: repeated or concurrent submission of the same state-changing request (double click, client retry) produces at most one effect. Mechanism: row lock + status precondition (second attempt rejected `INVALID_WORKFLOW_TRANSITION` or returns the recorded result); optional `Idempotency-Key` header decision TDD-015.09. | `[BRD-038, NFR-006]` |
| FR-015.71 | **Reliability**: bounded retry of transient DB errors (deadlock/serialisation) inside the transaction helper; graceful shutdown (stop accepting, finish in-flight, close pool, stop outbox worker cleanly); startup configuration validation; health/readiness endpoints. | `[NFR-006, NFR-009]` `[PROPOSED]` |
| FR-015.72 | **Availability/backup/monitoring/alerts** are deferred to infrastructure planning (NFR-009, BRD-OQ-09). The SPEC delivers a planning checklist (§11.9) and application hooks (health, structured logs, request ids) — no targets, schedules or tooling decisions are fixed. | `[NFR-009, BRD-OQ-09]` |
| FR-015.73 | **Dependency/supply-chain hygiene**: lock file committed; `npm audit` (or equivalent) in CI with a documented threshold; no unpinned install scripts in production image. Threshold TDD-015.12. | `[PROPOSED]` |
| FR-015.74 | **Production readiness gate**: a checklist PRG-01..PRG-24 (§11.10) must be fully evidenced and signed before production deployment; any failed BRD-039 scenario blocks go-live. | `[BRD-038, BRD-039]` gate form `[PROPOSED]` |

---

## 8. Internal Implementation Plan / Tasks

Ordered. Layer: BE backend, FE frontend, DB database, QA verification, DOC repository document. All code tasks are test-first (RED→GREEN) per the constitution.

| Task | Title | Layer | Description | Inputs → Outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-015.01 | Field-ownership registry | BE | Create `backend/src/modules/governance/field-ownership.registry.ts` encoding the §9.1 matrix (field, entity.column, owner roles, write-path SPEC, allowed stages, enforcement checks). Export `getOwnership(field)` and `assertRegistered(entityColumn)`. Unit tests assert every matrix row exists. | Matrix §9.1 → registry + `TC-015.01..04` | SPEC-001 | BRD-029, OQ-19 |
| TASK-015.02 | Controlled-field write guard & allow-list DTOs | BE | `FieldGuard.assertWritable(ctx, entity, changes)` used by services in 004/006/008/009 and a validation helper that rejects unknown fields; returns 403 `FORBIDDEN` for owner violations (audit `SECURITY_CONTROLLED_FIELD_WRITE_DENIED`), 400 for unknown fields. Provide Express middleware `rejectUnknownFields(schema)`. | Registry, ctx → guard + middleware | .01, SPEC-002 | BRD-029, 026 |
| TASK-015.03 | Registry-coverage test (static) | QA | Test scans Sequelize models for columns tagged `controlled: true` and fails if a service/repository `update`/`create` call on them is not routed through `FieldGuard` or lacks registry entry. Fails CI. | Models, services → test | .01, .02 | BRD-029 |
| TASK-015.04 | Master-data-only enforcement review | BE/DB | Verify FK constraints and validators in 004/006/008 for Dept/BU, Designation, Location, Vacancy; add missing FK/CHECK migrations via owning spec change request in review notes; test that free-text values and inactive/non-existent ids are rejected. | Schema, DTOs → checklist + tests `TC-015.10..14` | SPEC-003/004/006/008 | BRD-029 |
| TASK-015.05 | In-flight snapshot behaviour tests | QA | Tests: (a) profile edit after submission does not change an in-flight transfer's workflow values; (b) HR org change updates transfer values and audits previous/new; (c) BRD-024 loop triggered when Receiving Manager enabled; (d) no profile write by HR change unless TDD-015.03 decision says so. | Fixtures → tests `TC-015.15..19` | SPEC-006/008 | BRD-029, 024, 032 |
| TASK-015.06 | Data-consistency verification suite | BE/DB | `backend/src/modules/governance/integrity/` with checks CHK-01..CHK-14 (§11.3) as parameterised read-only SQL, CLI `npm run verify:integrity`, integration test running each against seeded violations, JSON report. No scheduler. | Schema → CLI + tests `TC-015.20..34` | SPEC-005/006/007/009/013 | BRD-028, 029, 030, 027, 037 |
| TASK-015.07 | Integration port interfaces and registry guard | BE | `backend/src/shared/integration/ports/{payroll.port.ts, employee-master.port.ts}` (types only), `integration-registry.ts` with `register()` validation (FR-015.35); no export from the app bootstrap; unit tests. | Checklist → types + guard | SPEC-001 | BRD Integration Req, 038 |
| TASK-015.08 | Outbound-call guard | BE/QA | ESLint `no-restricted-imports` (axios, node-fetch, undici, got, request, `http`/`https` client use) except allow-listed modules; dependency-check test scanning `backend/src` imports; CI fail otherwise; runtime test starts app with network stubbed asserting only DB/SMTP sockets. | Repo → lint rule + test | .07 | BRD Integration Req, 029 |
| TASK-015.09 | Future-integration contract template | DOC | `docs/integration/INTEGRATION-CONTRACT-TEMPLATE.md`: the eleven required elements with acceptance guidance (§9.3) plus NFR-006 clauses, reconciliation clause for HR integrations, approval record fields. | §9.3 → template | — | BRD Integration Req |
| TASK-015.10 | Contract-level integration harness | QA | `tests/backend/integration-harness/`: test-only `FakePayrollAdapter` with fault injection (timeout, 5xx, duplicate delivery, late success) and a reference `IdempotentDispatch` used only by tests to prove the NFR-006 pattern: business-key unique, attempt log, status mapping, no Completed on failure, authorised retry, visible failure. Not exported to `src/`. | Template, ports → harness + `TC-015.40..46` | .07, .09 | NFR-006, BRD-039 |
| TASK-015.11 | Manual-Payroll and SMTP-dependency scenario tests | QA | Tests: (a) double `MARK_PAYROLL_COMPLETED` yields one completion record/history/audit; (b) transfer cannot reach IT Final Approval with Payroll incomplete; (c) SMTP timeout/failure does not fail/rolls back transition, no duplicate transition on retry; (d) outbox retry idempotent. | SPEC-009/012 → tests `TC-015.47..52` | SPEC-009, SPEC-012 | BRD-027(c), 036, 039 |
| TASK-015.12 | Security headers & CORS config | BE | Central `backend/src/shared/security/http-security.ts` (helmet policy, CORS allow-list from env, remove `X-Powered-By`, HSTS when production). Tests inspect response headers. | Env → middleware | SPEC-001 | NFR-004 |
| TASK-015.13 | Rate limiting | BE | Configurable limiters (auth endpoints stricter, global coarse) using a maintained library; response 429 `RATE_LIMITED` with envelope and `Retry-After`; values from env with **no committed numeric default** (TDD-015.05). Tests with test-specific small limits. | Env → limiter | .12 | NFR-001 |
| TASK-015.14 | Validation baseline | BE | Shared validators (ids, pagination, enums, strings), JSON body limit configuration, unknown-field rejection used by all route modules; test that every route has a schema. | Route inventory → test | SPEC-001 | NFR-002 |
| TASK-015.15 | SQL-safety checks | QA | Lint/test rejecting `sequelize.query` with interpolated strings and raw `literal()` with request data; SQLi payload tests on search/sort/filter params (`q`, `sort`, `order`) across list endpoints; sort fields mapped via allow-list. | Repo → lint + tests | SPEC-001 | NFR-002 |
| TASK-015.16 | Error-leakage verification | QA | Tests force 500s and validation errors; assert envelope, no stack/SQL/path; 401/403/404 do not reveal existence of out-of-scope records (policy TDD-015.11). | Error handler → tests | SPEC-001, 002 | BRD-026 |
| TASK-015.17 | Secret/credential leakage scan | QA | Runtime tests run create-user, reset, login failure, token refresh flows with log and audit capture; assert no password, temporary password, token or authorization header strings appear; static scan for logging of request bodies. | Flows → tests `TC-015.60..64` | SPEC-002/004/013 | NFR-003, BRD-025, 037 |
| TASK-015.18 | Transport security (TLS) arrangement | BE/DOC | Implement and document the decided TLS approach (TDD-015.02): proxy sample config, `trust proxy` setting, HTTPS redirect, HSTS, PostgreSQL `ssl` option, SMTP TLS enforcement, secure cookie flags if cookies are used. Verification via `openssl s_client`/TLS scan in pre-production. | Decision → config + runbook | .12 | NFR-004 |
| TASK-015.19 | Personal-data protection verification | BE/QA | Define personal-data inventory (§9.7); role-specific response projections for employee/profile/transfer/document metadata; tests that IT and managers receive only permitted attributes; log redaction list unit test. | Inventory → projections + tests | SPEC-002/004/009/011 | NFR-004, 007, BRD-014 |
| TASK-015.20 | Authorisation hardening checklist & route matrix | QA | Automated route inventory (every route: public allow-list or `authenticate`+`authorize` metadata); IDOR matrix test (Employee A→B, HR other location, IT other location, manager unassigned) for transfer, employee, document, task, audit; direct-API (no UI) tests; mass-assignment tests; checklist §9.5 signed. | Router stack → tests `TC-015.65..78` | SPEC-002..013 | NFR-002, BRD-026, 039 |
| TASK-015.21 | Tamper-resistant audit review | DB/QA | Verify triggers blocking UPDATE/DELETE/TRUNCATE on `audit_logs`; app DB role has INSERT/SELECT only; migration role separate; no route mutates audit; export audited; no purge job; attempt to alter via ORM fails. Optional hash-chain decision TDD-015.13. | DB → tests `TC-015.79..84` | SPEC-001, 013 | NFR-005, BRD-037 |
| TASK-015.22 | Accessibility verification | FE/QA | Add `axe-core` automated checks to frontend tests for key pages/components and a manual checklist (keyboard order, focus trap and return in confirmation dialogs, labels/errors association, non-colour status indicators, contrast, responsive desktop/tablet). Evidence stored for gate. | UI → tests + checklist `TC-015.85..90` | SPEC-001, 003 | NFR-008, BRD-002 |
| TASK-015.23 | Performance input register & test plan | DOC/QA | `docs/performance/PERFORMANCE-PLAN.md` containing the BRD-038 input register (§9.6), scenario list, tooling proposal, data volume prerequisites, pre-production environment prerequisites; pass/fail placeholders marked `[TBC-BRD-038]`. | §9.6 → plan | — | BRD-038 |
| TASK-015.24 | 5 MB upload end-to-end verification | QA | Tests at API (413 `FILE_SIZE_EXCEEDED`), proxy limit config, multipart overhead, boundary file (exactly 5 MB accepted per SPEC-011 definition), invalid file not stored. | SPEC-011 → tests `TC-015.91..94` | SPEC-011 | BRD-021, 038 |
| TASK-015.25 | Timeout & request-lifetime configuration | BE | `API_REQUEST_TIMEOUT_MS` (server timeouts: request, headers, keep-alive via env), DB statement timeout env, no committed numeric default; start-up validation per TDD-015.10; test configuration loading. | Env → config | SPEC-001 | BRD-038 |
| TASK-015.26 | Transaction-safety & partial-operation review | QA/DB | Fault-injection suite: inject failure after each step of reserve, release, changeVacancy, finalise, workflow transition (history, audit, outbox) and assert full rollback; lock-ordering review; concurrency tests (parallel HR approvals for last position, parallel submit, parallel transitions). | Services → tests `TC-015.95..105` | SPEC-005/007/008/009 | BRD-038, 028, 030 |
| TASK-015.27 | Idempotency / duplicate-request review | BE/QA | Verify second identical mutation is rejected or returns the recorded result with no extra history/audit/outbox rows; implement `Idempotency-Key` only if TDD-015.09 approves; test notification retry and Payroll double-mark. | Services → tests `TC-015.106..110` | SPEC-007/009/012 | NFR-006, BRD-038 |
| TASK-015.28 | Health/readiness & operability hooks | BE | `GET /health` (liveness, no dependencies) and `GET /api/v1/ready` (DB connectivity only; no HR/Payroll probes); structured logging fields (`requestId`, `userId`, route, status, duration); graceful shutdown handler. | App → endpoints + tests | SPEC-001 | NFR-009 |
| TASK-015.29 | Infrastructure planning checklist | DOC | `docs/operations/INFRASTRUCTURE-PLANNING-CHECKLIST.md` from §11.9: items, owner activity, required decision, evidence; **no numbers**. | §11.9 → doc | — | NFR-009, OQ-09 |
| TASK-015.30 | Dependency, secret & config audit | QA | CI jobs: `npm audit`, secret scanner, lock file check; startup config validation test (missing/sample secrets). | Repo → CI evidence | SPEC-001 | NFR-003/004 |
| TASK-015.31 | Pre-production validation runbook | DOC/QA | Steps to execute BRD-038 validation in the pre-production environment once inputs are confirmed: environment parity, data seeding, load/soak scenarios, result recording format, defect handling. | Plan → runbook | .23 | BRD-038 |
| TASK-015.32 | Production readiness gate assembly | QA | Assemble PRG-01..PRG-24 (§11.10) with evidence links, owner role sign-off table, blocker rules; produce `docs/operations/PRODUCTION-READINESS-GATE.md`. | All evidence → gate doc | .01–.31, SPEC-016 | BRD-038, 039 |
| TASK-015.33 | NFR control-verification matrix | QA/DOC | Matrix NFR-001..009 → control → owning spec → test ids → evidence (§9.4), kept updated; reviewed with Gate 2 reviewer. | §9.4 → matrix | .01–.32 | NFR-001..009 |
| TASK-015.34 | Optional field-ownership read API & Super Admin view | BE/FE | `GET /api/v1/admin/governance/field-ownership` returning registry (Super Admin only); simple read-only table page if Gate 1 accepts (TDD-015.15). | Registry → API/page | .01 | BRD-029 |

---

## 9. Business Rules

### 9.1 Field-by-field ownership matrix `[BRD-029]` (write paths `[PROPOSED]`)

| # | Field | Source of truth / owner (BRD) | Implementing SPEC (write path) | Enforcement checks (this SPEC verifies) |
|---|---|---|---|---|
| 1 | Employee ID | Portal — Super Admin | SPEC-004 (generation `EMP/MGR/HR/IT######`) | Only Super Admin create; generated, not typed; unique; immutable after creation `[PROPOSED]`; no other role/endpoint writes it |
| 2 | Employee Name | Portal — Super Admin | SPEC-004 | Super Admin only; Employee, HR, managers read-only |
| 3 | Official Email | Portal — Super Admin | SPEC-004 | Super Admin only; uniqueness; credential delivery target (BRD-005); format validation |
| 4 | Employment Status | Portal — Super Admin / HR | SPEC-004 (value set `[TDD-REQUIRED]`, TDD-015.04); HR path for status changes `[TDD-REQUIRED]` (TDD-015.03) | Role allow-list {Super Admin, HR within scope}; Employee denied; value from controlled set; change audited with previous/new |
| 5 | Department / Business Unit | Master: Portal org master — Super Admin (SPEC-003). Employee's current value: Super Admin (SPEC-004). Transfer-related update: HR (SPEC-008) | 003 / 004 / 008 | FK to master; free text rejected; HR change only on transfer value, requires reason, BRD-024 trigger; audit previous/new |
| 6 | Designation | Portal designation master — Super Admin; transfer-related update HR | 003 / 004 / 008 | as row 5 |
| 7 | Location | Portal location master — Super Admin; transfer-related update HR | 003 / 004 / 008 | as row 5; HR scope uses location mapping |
| 8 | Reporting Manager | Portal employee/manager mapping — Super Admin; transfer-related update HR | 003 (`reporting_manager_assignments`, single source) / 008 [RECONCILED R-1] | FK to active user with Reporting Manager role; HR change only on transfer, reason, BRD-024 |
| 9 | HR Assignment | Portal — Super Admin, from configured location/organisation mapping | 003 (mapping) / 004 (resolution) | Super Admin only; derived from Location mapping; used for missing-data direction message |
| 10 | IT Assignment | Portal — Super Admin, from configured location mapping | 003 (mapping) / 009 (task assignee selection `[TDD-REQUIRED]` g) | Super Admin only for mapping; reassign Super Admin only (BRD-035) |
| 11 | Effective Transfer Date | Transfer Request — confirmed/updated by HR | 006 (Employee in Draft), 008 (HR correction), Super Admin intervention (same handler) | Role × stage allow-list (Employee Draft only; HR during approval; Super Admin intervention); date range rule BRD-031; reason + audit |
| 12 | Vacancy | Portal vacancy master — Super Admin; selected against Transfer Request | 005 (master, reservation), 006 (selection), 008 (HR change via `changeVacancy`) | Master FK; status Open + capacity; Employee selection only in Draft; HR change atomic |
| 13 | Payroll Reference / Assignment | Transfer Request / Payroll activity — authorised HR | 009 (`payroll_activities`) | Authorised HR in scope only; format `[TDD-REQUIRED]` (contract §5 f); recorded with completed by/date/remarks |
| 14 | Transfer-specific organisation metadata | Transfer Request — authorised HR | 008 (`transfer_org_changes`) | HR only; reason mandatory; previous/new/audit/re-approval flag |

Rules: a field not listed here is **not controlled by this matrix**; adding a field requires updating the registry and this table.

### 9.2 Source-of-truth & snapshot rules

1. Portal data wins; the workflow never consults an external system `[BRD-029]`.
2. Employee cannot edit controlled data; correction goes to the assigned HR team, which coordinates with Super Admin for master-data changes `[BRD-OQ-19(e)]`.
3. In-flight: transfer-stored values are authoritative; HR change updates them; previous/new audited `[BRD-029]`.
4. HR change to Dept/BU, Designation, Location, Reporting Manager + Receiving Manager enabled ⇒ BRD-024 re-approval `[BRD-024]`.
5. HR change does not update an external HR master; external alignment is outside the portal `[BRD-029]`.
6. No sync or reconcile jobs against external HR; future HR integration must define API contract, frequency, ownership, failure handling and reconciliation rules (contract checklist) `[BRD-029]`.

### 9.3 Mandatory future-integration contract checklist `[BRD Integration Requirements]`

A future integration may not start implementation until each element is written, reviewed and approved (Gate 1 equivalent decision) and recorded in the contract document based on `INTEGRATION-CONTRACT-TEMPLATE.md`.

| # | Required element | What the approved contract must state | Verification before implementation |
|---|---|---|---|
| 1 | API / interface details | Endpoint/queue/file interface, version, direction, owner system and contact | Present and versioned |
| 2 | Authentication method | Mechanism, credential storage (env/secret store), rotation, never logged | No secret in repo/log (TASK-015.30) |
| 3 | Request & response formats | Schemas, content types, encoding, size limits | Contract tests against schema |
| 4 | Required fields | Mandatory/optional field list, source of each field in the portal | Mapping reviewed against §9.1 ownership |
| 5 | Success & failure responses | Codes, bodies, business vs technical failures | Both paths tested in harness |
| 6 | Timeout & retry rules | **Per-integration timeout (BRD-038)**, max attempts, back-off, retryable vs non-retryable errors | `register()` guard requires values |
| 7 | Duplicate request handling | How the receiver detects duplicates; portal behaviour on duplicate response | Duplicate delivery test |
| 8 | Idempotency mechanism | Business key / idempotency key scheme stable across retries | Retry creates no duplicate downstream transaction (NFR-006) |
| 9 | Status mapping | External status ↔ portal status, including unknown/unmapped | Failure never maps to Completed |
| 10 | Error handling | Error classification, visible failure status + error details, alerting owner, authorised retry role | Visible failed state, authorised retry test |
| 11 | Source of truth | Which system owns each exchanged field, conflict rule, reconciliation rules (HR integration) | Reviewed against BRD-029 matrix |

NFR-006 clauses that must be written into every contract: retry must not create duplicate downstream transactions; failed integration remains visible with failure status/error details; authorised retry where applicable; failure does not mark the task or transfer Completed `[NFR-006, BRD-039]`.

### 9.4 NFR control-verification matrix (summary; maintained by TASK-015.33)

| NFR | Concrete controls | Owner spec | Verification here |
|---|---|---|---|
| NFR-001 | Local credentials, bcryptjs hash, lockout 5/30, idle 30, first-login force, session invalidation, MFA/SSO out of scope | 002 | TASK-015.20, .17, route/first-login direct-API tests |
| NFR-002 | RBAC+scope on every route, backend authoritative, 401/403 rules, no frontend reliance | 002 (+all) | TASK-015.20 route matrix, IDOR, mass-assignment |
| NFR-003 | Hash-only passwords, redaction, no credentials in logs/audit | 002/001/013 | TASK-015.17 |
| NFR-004 | TLS everywhere, HSTS, helmet, CORS, data minimisation, secrets from env, (at-rest TDD) | 015/001 | TASK-015.12, .18, .19, .30 |
| NFR-005 | Append-only audit (trigger+privileges), scoped view, Super-Admin export audited, lifetime retention | 001/013 | TASK-015.21 |
| NFR-006 | Idempotent retries, visible failures, authorised retry, no duplicate downstream; outbox for notifications | 015/012 | TASK-015.07..11, .26, .27 |
| NFR-007 | Scoped employee/document/task access, minimum IT information | 011/002/009 | TASK-015.19, .20 |
| NFR-008 | Accessible shared components, labels, focus, contrast | 003/001 | TASK-015.22 |
| NFR-009 | Deferred; checklist, hooks, no numbers | 015 | TASK-015.23, .25, .28, .29 |

### 9.5 Authorisation hardening review checklist `[PROPOSED]`

| ID | Check |
|---|---|
| AH-01 | Route inventory: each non-public route has `authenticate` + `authorize({resource, action})` |
| AH-02 | Public route allow-list is explicit (login, health, ready, first-login password change as designed by SPEC-002) |
| AH-03 | Object-level checks: every `:id` access resolves scope (employee, transfer, document, task, audit, vacancy) |
| AH-04 | Stage check present for every transfer action (via `WorkflowEngine`) |
| AH-05 | List endpoints filter by scope in the query, not after fetch |
| AH-06 | Response projection per role (no extra columns, no password_hash, token_version) |
| AH-07 | Mass-assignment: DTO allow-lists; `role`, `status`, `employee_id`, `created_by` never bindable from body by non-owners |
| AH-08 | 401 vs 403 vs not-found behaviour consistent with TDD-015.11 |
| AH-09 | Deactivated/locked/session-invalid users rejected on every request (token_version/session check) |
| AH-10 | Authorization denials emitted as security audit events |
| AH-11 | IT receives minimum information only; IT cannot read documents outside task scope |
| AH-12 | Super Admin-only actions confirmed (reassign, audit export, workflow configuration) and HR cannot reassign |
| AH-13 | No privileged role switching via headers/query/body |
| AH-14 | File download endpoint verifies requester scope each call; no public URL/static serving of storage dir |
| AH-15 | CORS and CSRF posture reviewed for chosen token transport (cookie vs header; SPEC-002 TDD) |

### 9.6 BRD-038 input register — "to be confirmed" items (no values invented)

| Item | BRD status | Confirmation activity (BRD) | Proposed accountable role `[PROPOSED]` | Needed before | Consumed by |
|---|---|---|---|---|---|
| Expected concurrent users | TBC | Performance/capacity planning | Project Manager / Product Owner with business | Performance test execution | TASK-015.23/.31 |
| Expected transaction volume | TBC | Performance/capacity planning | Project Manager / Product Owner with HR operations | Load profile design | TASK-015.23 |
| API response-time target | TBC | Performance testing | Technical Lead / Architect | Pass/fail definition | TASK-015.31 |
| Page response-time target | TBC | Performance testing | Technical Lead / Architect (frontend lead) | Pass/fail definition | TASK-015.31 |
| API timeout | TBC | Technical/infrastructure planning | Technical Lead / Architect with infrastructure owner | Production config | TASK-015.25 |
| Integration timeout | "Defined for each external integration before implementation; none in current phase" | Per integration contract | Integration owner (future) | Each integration implementation | `register()` guard |
| Max document upload size | **5 MB per file** (fixed) | — | — | — | TASK-015.24 |
| Retry behaviour | Controlled retry without duplicate downstream transactions | NFR-006 | Technical Lead | Any integration | TASK-015.10 |
| DB transaction expectations | Consistent, no partial/duplicate | — | Technical Lead | Every release | TASK-015.26/.27 |
| Performance validation | Pre-production before deployment | — | QA with infrastructure | Go-live | TASK-015.31/.32 |

Rule: "to be confirmed" items are **mandatory inputs** and must hold numeric values before production deployment; this SPEC adds none `[BRD-038]`.

### 9.7 Personal-data inventory `[PROPOSED]` (for NFR-004/007)

Employee ID, name, official email, employment status, department/BU, designation, location, reporting manager, HR/IT assignment, effective transfer date, transfer reason, clarification text, Payroll reference, uploaded documents (PDF/images), audit entries about people. Credentials (hash only). Classification beyond this list: TDD-015.16.

## 10. Data Model & Database

**No new business tables are introduced by this SPEC.** The Part A–C controls verify constraints in tables owned by other specs.

### 10.1 Constraint catalogue verified here

| Constraint | Table (owner SPEC) | Purpose | BRD | Check |
|---|---|---|---|---|
| FK `department_id`/`designation_id`/`location_id` → master tables, NOT NULL for submitted transfers | `transfer_requests`, `employee_profiles`, `transfer_org_changes` (006/004/008) | master-only values | BRD-029 | CHK-06, TC-015.10..14 |
| Partial unique index on `employee_id` where status active | `transfer_requests` (006) | one active request | BRD-030 | CHK-02 |
| CHECK `reserved + filled <= capacity`, `reserved >= 0`, `available >= 0` | `vacancies` (005) | over-allocation | BRD-028 | CHK-01 |
| Unique active reservation per transfer | `vacancy_reservations` (005) | no double reserve | BRD-028 | CHK-03/11 |
| Append-only trigger and revoked privileges | `audit_logs` (001) | tamper resistance | BRD-037 | TASK-015.21 |
| Unique business key on Payroll completion per transfer | `payroll_activities` (009) | no duplicate completion | BRD-027, NFR-006 | TC-015.47 |
| Unique (event, entity, channel) idempotency key | notification outbox/log (001/012) | no duplicate notification | BRD-036 | TC-015.51 |
| History continuity / pending-owner uniqueness | `transfer_workflow_history`, `transfer_task_assignments` (007) | workflow integrity | BRD-027, 035 | CHK-05/09 |

### 10.2 Database role separation `[PROPOSED]`

Separate PostgreSQL roles: migration/owner role (DDL) vs application runtime role (DML only, no DDL, INSERT/SELECT only on `audit_logs`). Credentials from env. Reviewed in TASK-015.21; decision TDD-015.17 if deployment constraints prevent it.

## 11. Backend Implementation

### 11.1 Module layout `[PROPOSED]`

```
backend/src/modules/governance/
  field-ownership.registry.ts      # FR-015.02
  field-guard.service.ts           # FR-015.04/05
  reject-unknown-fields.ts         # middleware
  integrity/
    checks/chk-01-capacity.sql.ts … chk-14-drift-report.sql.ts
    integrity.runner.ts            # read-only, parameterised, JSON report
  governance.routes.ts / controller.ts   # optional GET field-ownership
backend/src/shared/integration/
  ports/payroll.port.ts            # types only
  ports/employee-master.port.ts    # types only
  integration-registry.ts          # register() guard, unused at runtime
backend/src/shared/security/
  http-security.ts  rate-limit.ts  request-timeouts.ts  config-validation.ts
backend/scripts/verify-integrity.ts
tests/backend/governance/  tests/backend/security/  tests/backend/integration-harness/
tests/frontend/accessibility/
docs/integration/  docs/performance/  docs/operations/
```

### 11.2 Field guard algorithm `[PROPOSED]`

1. Service calls `FieldGuard.assertWritable(ctx, entityKey, changedFields, {stage, targetScope})`.
2. For each field: lookup registry; unknown controlled column ⇒ programming error (test fails).
3. Check ctx role ∈ owners and stage allow-list and scope (via `ScopeResolver`).
4. On violation: throw `ForbiddenError('FORBIDDEN')`, emit `SECURITY_CONTROLLED_FIELD_WRITE_DENIED` (field names only, never values that are personal data beyond identifiers).
5. Master-bound fields: validate ids exist and `is_active`.

### 11.3 Data-consistency checks `[PROPOSED]` (derived rules; read-only)

| ID | Rule | Derived from |
|---|---|---|
| CHK-01 | For every vacancy: `reserved + filled <= capacity`, no negative values, available = capacity − (reserved+filled) | BRD-028 |
| CHK-02 | No employee has more than one transfer in an active status | BRD-030 |
| CHK-03 | Transfers in Rejected/Withdrawn/Cancelled hold no active reservation | BRD-028, 033 |
| CHK-04 | Completed transfers have Payroll activity completed, IT tasks complete or No-IT-Action record, IT Final Approval record, and a final allocation | BRD-027 completion rule |
| CHK-05 | Every active (non-Blocked, non-Draft) transfer has exactly one current pending owner/assignment consistent with its status | BRD-027, 035 `[PROPOSED]` |
| CHK-06 | Non-draft transfers and HR changes reference existing master ids (Dept/BU, Designation, Location, Vacancy) | BRD-029 |
| CHK-07 | Every org change/date change on a submitted transfer has an audit row with previous/new/changed-by/reason | BRD-029, 031, 032, 037 |
| CHK-08 | No audit/log-export row matches credential patterns (password/token keys, JWT shape, bcrypt hash shape) | BRD-037, NFR-003 |
| CHK-09 | Workflow history continuity (each `from_status` = previous `to_status`; first row from Draft) and a matching audit row per transition | BRD-027, 037 |
| CHK-10 | Blocked transfers store a previous status that is a valid active status | BRD-027 |
| CHK-11 | Active reservation belongs to an existing, active (non-final) transfer and an existing vacancy | BRD-028(a) |
| CHK-12 | Effective Transfer Date on active transfers is within rule at set time; expired dates flagged (informational — completion gate enforces) | BRD-031 |
| CHK-13 | Final allocations equal count of Completed transfers per vacancy | BRD-028 |
| CHK-14 | Informational drift report: in-flight transfer snapshot vs current profile (not a defect) | BRD-029 |

Execution: on demand (`npm run verify:integrity`), in CI integration tests with seeded violations, and in the pre-production gate (PRG-12). A scheduled run is not mandated (TDD-015.18).

### 11.4 Integration boundary design (ports/adapters) `[PROPOSED]`

- Domain services call internal interfaces. A `PayrollPort { requestPayrollAction(cmd): Promise<IntegrationOutcome>; getStatus(ref): Promise<...> }` and `EmployeeMasterPort` are declared as types. **No class implements them in `src/`.**
- Current Payroll path: HR calls SPEC-009 endpoint → `payroll_activities` completed in the same transaction as the workflow transition.
- A future adapter would be registered via `IntegrationRegistry.register()` which enforces §9.3 fields; wiring into the bootstrap, an `integration_requests` table (business key, idempotency key, attempts, status, error details) and a retry endpoint would be created **only** by a new approved spec/change request (CR).
- Failure rule (future): integration failure sets integration-attempt status Failed with error details; task/transfer status unchanged.

### 11.5 Security configuration `[PROPOSED]`

Environment variables (names only): `NODE_ENV`, `CORS_ALLOWED_ORIGINS`, `RATE_LIMIT_*`, `API_REQUEST_TIMEOUT_MS`, `DB_STATEMENT_TIMEOUT_MS`, `JSON_BODY_LIMIT`, `TRUST_PROXY`, `DB_SSL`, `SMTP_SECURE`. Startup validation lists missing required variables without printing values.

### 11.6 Transaction & reliability design `[PROPOSED]`

`withTransaction` (SPEC-001) provides: single transaction scope, bounded retry on deadlock/serialisation failure (attempt count configurable; value TDD-015.19), `afterCommit` hooks only for non-critical side effects (outbox is written inside the transaction; the worker dispatches after commit). Deterministic lock order: `transfer_requests` row → `vacancies` rows ascending id → `vacancy_reservations`. Unique constraints are the final guard; constraint violations are mapped to domain errors (`ACTIVE_TRANSFER_ALREADY_EXISTS`, `VACANCY_CAPACITY_UNAVAILABLE`).

### 11.7 Logging/monitoring hooks `[PROPOSED]`

Structured logger fields: `timestamp, level, requestId, userId, role, method, route, status, durationMs`. Redaction keys: `password, newPassword, temporaryPassword, token, accessToken, refreshToken, authorization, cookie, set-cookie`. Alert routing and tooling remain deferred (NFR-009).

### 11.8 Reliability checklist (application level)

Graceful shutdown; pool configuration externalised; outbox worker idempotent restart; start-up validation; no unhandled rejections (process-level handler logs and exits per policy); health endpoints.

### 11.9 NFR-009 / BRD-OQ-09 infrastructure planning checklist (deferred; no numbers)

| ID | Item | Decision needed from infrastructure/deployment planning | Evidence at gate |
|---|---|---|---|
| INF-01 | Availability requirement | Required availability and maintenance windows | Signed target |
| INF-02 | Capacity and scaling | Sizing from BRD-038 confirmed users/volume | Sizing record |
| INF-03 | Database backup schedule | Frequency, type, retention | Configured and observed |
| INF-04 | Restore / recovery procedure | RPO/RTO targets, restore test | Successful restore rehearsal |
| INF-05 | Document-storage backup | Local storage backup alignment with DB | Backup log |
| INF-06 | Application monitoring | Metrics, dashboards, owner | Dashboard link |
| INF-07 | Infrastructure monitoring | Host/DB/disk health | Monitoring config |
| INF-08 | Error/security logging | Central log destination, access control | Log sample |
| INF-09 | System alerts | Alert conditions, recipients, escalation | Test alert |
| INF-10 | Audit log protection in backup | Backup includes audit, immutability preserved | Verification |
| INF-11 | Application log retention | Retention of operational logs (separate from audit lifetime) | Policy |
| INF-12 | TLS certificates | Issuance, renewal | Certificate record |
| INF-13 | Secrets management | Storage/rotation | Process |
| INF-14 | Pre-production environment | Specification and parity | Environment sheet |
| INF-15 | Deployment/rollback | Procedure aligned to release management | Runbook |
| INF-16 | SMTP service SLA/limits | Email provider constraints | Contact/limits |

### 11.10 Production readiness gate (PRG)

| ID | Gate item | Evidence | Owner role `[PROPOSED]` |
|---|---|---|---|
| PRG-01 | All 16 specs Gate 2 approved; no open Rejected/Changes Requested | Review records | Technical Lead |
| PRG-02 | Every BRD-039 mandatory scenario executed and passed; none failed unresolved | SPEC-016 report | QA |
| PRG-03 | Integration scenarios validated per approved approach (TDD-015.01) | Harness + manual-Payroll/SMTP results | QA |
| PRG-04 | BRD-038 TBC inputs all have numeric values with approver | Input register | Project Manager |
| PRG-05 | Performance tests executed in pre-production against confirmed targets and passed | Report | QA / Technical Lead |
| PRG-06 | API timeout value configured and tested | Config + test | Technical Lead |
| PRG-07 | 5 MB limit verified end-to-end through proxy | TC-015.91..94 | QA |
| PRG-08 | TLS enforced and verified (HTTP redirect, HSTS, DB/SMTP TLS) | Scan output | Technical Lead |
| PRG-09 | Security headers/CORS/rate limits configured with approved values | Config diff + tests | Technical Lead |
| PRG-10 | Authorisation hardening checklist AH-01..15 complete | Signed checklist | Technical Lead |
| PRG-11 | Audit tamper-resistance verified in target DB roles | TC-015.79..84 | Technical Lead |
| PRG-12 | `verify:integrity` returns no violations on pre-production data | JSON report | QA |
| PRG-13 | Secret/credential leakage tests pass; secret scan clean | CI evidence | QA |
| PRG-14 | Dependency audit within agreed threshold | Report | Technical Lead |
| PRG-15 | Accessibility checks pass for primary pages; standard confirmed (TDD-015.08) | Evidence | QA / Frontend |
| PRG-16 | Backup and restore rehearsed; schedule configured (INF-03/04) | Restore log | Infrastructure owner |
| PRG-17 | Monitoring and alerts configured and tested (INF-06..09) | Test alert | Infrastructure owner |
| PRG-18 | Availability/capacity targets approved (INF-01/02) | Signed targets | Project Manager |
| PRG-19 | Seeded/default accounts removed or password-rotated; Super Admin bootstrap per TDD (SPEC-002/004) | Checklist | Technical Lead |
| PRG-20 | No external integration enabled; outbound allow-list unchanged | CI guard output | Technical Lead |
| PRG-21 | All `TDD-NNN.NN` decisions across specs closed | Decision log | Project Manager |
| PRG-22 | Release plan, rollback procedure, version tag prepared | Release record | Release owner |
| PRG-23 | Data-migration/schema state verified in target DB | Migration log | Technical Lead |
| PRG-24 | UAT sign-off recorded | UAT record | Project Manager |

## 12. API Requirements

This SPEC adds no business API. Operational/optional endpoints `[PROPOSED]`:

**API-015.1 `GET /health`** [RECONCILED R-11] hardening review of the SPEC-001 FR-001.23 endpoints (`GET /api/v1/health`, `/live`, `/ready`; bare `GET /health` is only the scaffold alias) - this SPEC defines no separate route — liveness. Auth: none. Response `200 {"success":true,"data":{"status":"ok"}}`. No dependency checks, no version/internal detail. Errors: none beyond 5xx envelope.

**API-015.2 `GET /api/v1/ready`** — readiness. Auth: none (returns no sensitive data) — alternative internal-only decision in TDD-015.10. Checks: PostgreSQL connectivity (and storage path writable). Response `200 {"success":true,"data":{"status":"ready"}}` or `503 {"success":false,"error":{"code":"NOT_READY","message":"Service is not ready.","requestId":"…"}}`. Never probes HR/Payroll/SMTP (FR-015.11).

**API-015.3 `GET /api/v1/admin/governance/field-ownership`** (optional, TDD-015.15) — returns registry rows. Auth: `authenticate` + role SUPER_ADMIN; authz resource `governance`, action `View`. Response `200 {"success":true,"data":[{"field":"Employee ID","owners":["SUPER_ADMIN"],"writePathSpec":"SPEC-004","stages":["any"],"controls":["generated","immutable"]}], "meta":{"total":14}}`. Errors: 401, 403. Validation: none (no params).

**Cross-cutting API behaviours enforced here**

| Behaviour | Response |
|---|---|
| Controlled-field write by non-owner | 403 `FORBIDDEN` |
| Unknown/extra body fields | 400 `VALIDATION_ERROR` details list field names |
| Free-text organisation value | 400 `VALIDATION_ERROR` (must be master id) |
| Rate limit exceeded | 429 `RATE_LIMITED` with `Retry-After` |
| Payload too large (non-upload JSON) | 413 `PAYLOAD_TOO_LARGE` `[PROPOSED]` (distinct from `FILE_SIZE_EXCEEDED`) |
| Upload > 5 MB | 413 `FILE_SIZE_EXCEEDED` `[BRD-021]` |
| Unsupported / mismatched type | 415 `UNSUPPORTED_FILE_TYPE` / `INVALID_FILE_TYPE` `[BRD-021]` |
| Not authenticated | 401 `UNAUTHORIZED` `[BRD-026]` |
| Out-of-scope / not permitted | 403 `FORBIDDEN` `[BRD-026]` |
| Invalid workflow transition | 403 `INVALID_WORKFLOW_TRANSITION` `[BRD-027]` |
| Active transfer exists | 409 `ACTIVE_TRANSFER_ALREADY_EXISTS` `[BRD-030]` |
| Capacity unavailable | 409 `VACANCY_CAPACITY_UNAVAILABLE` `[PROPOSED code]` |

## 13. Frontend Implementation

Slice that applies: (1) accessibility verification of shared components and primary pages (TASK-015.22) under `tests/frontend/accessibility/`; (2) consistent rendering of standard error codes (`429 RATE_LIMITED`, `403 FORBIDDEN`, `FILE_SIZE_EXCEEDED`, controlled-data messages directing the employee to HR) using the shared error component from SPEC-001/003; (3) optional read-only page `frontend/src/app/(admin)/governance/field-ownership/page.tsx` for Super Admin if TDD-015.15 is accepted. UI hiding is never relied on for authorisation `[BRD-026]`. Controlled fields appear read-only/disabled for roles without ownership (UX only; backend authoritative). No other new screens.

Accessibility acceptance elements (NFR-008): labelled inputs; programmatic association of inline errors; visible focus; keyboard-operable tables, menus and dialogs; dialogs trap and restore focus; status badges include text, not only colour; sufficient contrast; responsive desktop/tablet layouts; loading/empty/no-access/error states announced (`aria-live`). Standard level: TDD-015.08.

## 14. Validation Rules

| Rule | Detail |
|---|---|
| Unknown fields | Reject (400) on all write endpoints |
| Master ids | UUID/integer id format valid, record exists and active; text for dept/designation/location/vacancy rejected |
| Ownership | Field writable only by registry owners at allowed stage |
| Effective date | Range rule BRD-031 enforced by owning specs; guard checks role/stage only |
| Pagination | `page>=1`, `1<=pageSize<=100` `[PROPOSED]` |
| Sort/filter | `sort` field from per-endpoint allow-list; `order` ∈ asc/desc |
| JSON body | Size limit configured; content-type `application/json` enforced |
| Upload | PDF/image only, 5 MB, MIME + extension match (SPEC-011) |
| Config | Required env present and not sample values in production |
| Integration descriptor | All six mandatory descriptor fields present (FR-015.35) |

## 15. Authorization & Security Rules

| Area | Rule |
|---|---|
| Backend authoritative | `Authenticated User → Role → Organisation Scope → Resource → Action` on every protected request `[BRD-026]` |
| Controlled data | Only owner roles per §9.1; Employee never |
| Governance API | Super Admin only |
| Health endpoints | Unauthenticated, minimal, no sensitive detail |
| Secrets | Env only; never in repo/log/audit |
| Transport | TLS-only in production (TDD-015.02) |
| Headers/CORS/rate limits | As FR-015.51..53 |
| Error responses | No leakage; consistent envelope |
| Audit | Denials = security events; no credentials in audit |
| Logging | Redaction list; no personal data beyond identifiers |
| Integrations | None; allow-list outbound = PostgreSQL + SMTP |
| Least privilege DB | Runtime role DML only; audit INSERT/SELECT only |

## 16. Workflow / State Transition Rules

This SPEC adds **no status or transition**. Constraints it verifies: transitions only via `WorkflowEngine.transition` per BRD-027; invalid ⇒ 403 `INVALID_WORKFLOW_TRANSITION`, status unchanged, no downstream effects, audited; Completed only after IT Final Approval and Payroll completion; failed integration or failed notification never changes workflow status; HR/Payroll sequencing unchanged; manual Payroll completion only by authorised HR. HR changes to Dept/BU, Designation, Location, Reporting Manager follow BRD-024 (verified in TASK-015.05).

## 17. Transaction & Concurrency Rules

1. Critical operations are single-transaction: vacancy reserve/release/change/finalise; workflow transition + history + audit + outbox; HR org change + audit + re-approval routing; Payroll completion + transition `[BRD-038]`.
2. Lock order (deadlock avoidance): transfer row → assignment/clarification rows → payroll/IT task rows → vacancies ascending id → reservations [RECONCILED R-5, SPEC-001 FR-001.41 canonical].
3. Constraints (partial unique index, CHECKs, unique business keys) are the final guard; app checks give friendly errors.
4. Concurrent HR approvals for the last position: exactly one succeeds, other gets `VACANCY_CAPACITY_UNAVAILABLE`; capacity never negative `[BRD-028]`.
5. Notification after-commit: failure never rolls back, retries idempotent `[BRD-036]`.
6. Duplicate submission (same transition twice) ⇒ one effect (FR-015.70).
7. Integration retries (future): idempotency key = stable business key; attempts logged; downstream duplicates impossible `[NFR-006]`.
8. Read-only integrity checks run at `READ COMMITTED`/snapshot and never lock write paths (use `SET TRANSACTION READ ONLY`).

## 18. Audit Requirements

| Event code `[PROPOSED]` | Trigger | Fields captured | BRD |
|---|---|---|---|
| `SECURITY_CONTROLLED_FIELD_WRITE_DENIED` | Non-owner attempts to write a controlled field | actor, role, entity, field names, route, request id, date/time | BRD-026, 037 |
| `SECURITY_RATE_LIMIT_EXCEEDED` (decision TDD-015.05: audit vs log only) | Rate limiter blocks a request | actor/IP, route, window | BRD-037 |
| `GOVERNANCE_INTEGRITY_CHECK_RUN` (optional) | `verify:integrity` executed with persistence of run record | runner, checks run, result counts | BRD-037 |

No credentials, tokens or personal data values are captured. Existing events consumed by checks (org change, date change, reassignment, etc.) are emitted by their owning specs.

## 19. Notification Requirements

Not applicable — this SPEC introduces no notification event. It verifies that notification failure is isolated from workflow transactions and retried idempotently (BRD-036), and that no notification is sent from integrity checks.

| Event | Recipient | Channel | Trigger task | BRD |
|---|---|---|---|---|
| (none new) | — | — | TASK-015.11 verifies SPEC-012 behaviour | BRD-036 |

## 20. Error & Edge Cases

| Case | Expected behaviour |
|---|---|
| Employee posts `department` free text in a transfer draft | 400 free text rejected / only master id accepted; Draft rules in SPEC-006 |
| Employee sends `reportingManagerUserId` (a SPEC-003-owned relation) on a profile PATCH | 403 `FORBIDDEN`, audited |
| HR changes location during processing with Receiving Manager disabled | Value updated, no re-approval, audited |
| Profile edited by Super Admin after submission | Transfer snapshot unchanged (FR-015.08) |
| Master record deactivated after submission | In-flight snapshot retained; new selection blocked; CHK-06 existence only |
| External HR value differs | No action; portal wins |
| Someone adds an HTTP client library | CI guard fails |
| SMTP down | Transition succeeds; notification failed state; retry later |
| Double click on Mark Payroll Completed | One completion; second rejected/no-op |
| Reverse proxy limits body below 5 MB | Caught by TASK-015.24 |
| `API_REQUEST_TIMEOUT_MS` unset in production | Readiness fails or start blocked per TDD-015.10 |
| Integrity check finds violation | Report only; no auto-repair; incident process |
| Health probe with DB down | `/ready` 503; `/health` still 200 |
| Rate limiting blocks legitimate burst | 429 with Retry-After; values tuned via TDD-015.05 |

## 21. Acceptance Criteria

| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-015.AC01 | Given the ownership matrix, when the registry is loaded, then all 14 BRD-029 field rows exist with owner and write-path SPEC | BRD-029 |
| SPEC-015.AC02 | Given an Employee, when they attempt to modify any controlled field, then the API returns 403 and the value is unchanged and audited | BRD-029 |
| SPEC-015.AC03 | Given a transfer endpoint, when a department/designation/location/vacancy is supplied as free text, then it is rejected; only valid active master ids are accepted | BRD-029 |
| SPEC-015.AC04 | Given an in-flight transfer, when the employee profile later changes, then the workflow continues to use the transfer-stored values | BRD-029 |
| SPEC-015.AC05 | Given HR changes transfer-related org data, when saved, then the transfer values are updated, previous/new audited, and BRD-024 applies if enabled | BRD-029, 024 |
| SPEC-015.AC06 | Given an HR update, when persisted, then no outbound call to any HR system occurs and no external master is changed | BRD-029, 020 |
| SPEC-015.AC07 | Given the running application, when network egress is observed, then only PostgreSQL and SMTP destinations are contacted | BRD Integration Req |
| SPEC-015.AC08 | Given portal data differs from an external master, when the workflow runs, then portal values are used and no reconciliation job exists | BRD-029 |
| SPEC-015.AC09 | Given mandatory data is missing, when the employee attempts to submit, then submission is blocked, no capacity is reserved, HR direction is shown and no data is invented | BRD-029 |
| SPEC-015.AC10 | Given `verify:integrity` runs on clean data, when executed, then CHK-01..CHK-13 report zero violations and CHK-14 is informational | BRD-028, 030 |
| SPEC-015.AC11 | Given seeded violations, when executed, then each check reports the offending rows | BRD-028..037 |
| SPEC-015.AC12 | Given a Payroll step, when HR marks it complete, then it is a manual portal action and no Payroll API call is made | BRD-027(c) |
| SPEC-015.AC13 | Given the contract checklist template, when reviewed, then all eleven required elements and NFR-006 clauses are present | BRD Integration Req |
| SPEC-015.AC14 | Given an integration descriptor missing a timeout/idempotency/contract reference, when registered, then registration is refused | BRD-038 |
| SPEC-015.AC15 | Given the harness fake adapter times out, when retried, then no duplicate downstream transaction is created | NFR-006 |
| SPEC-015.AC16 | Given a harness failure, when displayed, then the failure status and error details are visible and an authorised retry is possible | NFR-006 |
| SPEC-015.AC17 | Given production mode, when responses are inspected, then helmet headers and HSTS are present and `X-Powered-By` absent | NFR-004 |
| SPEC-015.AC18 | Given a non-allow-listed origin, when a CORS request is made, then it is rejected | NFR-004 |
| SPEC-015.AC19 | Given repeated requests above the configured limit, when sent, then 429 is returned with the envelope | NFR-001 |
| SPEC-015.AC20 | Given SQL-injection payloads in `q`, `sort`, `order` and ids, when sent, then no injection occurs and 400/empty result is returned | NFR-002 |
| SPEC-015.AC21 | Given a forced server error, when returned, then no stack trace, SQL or path is exposed | NFR-004 |
| SPEC-015.AC22 | Given any role, when it calls an endpoint, then only permitted personal attributes are returned (IT minimum) | NFR-007, BRD-014 |
| SPEC-015.AC23 | Given the route inventory, when tested, then every non-public route has authenticate+authorize metadata | NFR-002, BRD-026 |
| SPEC-015.AC24 | Given log/audit capture of login, reset, create-user flows, when scanned, then no credential/token appears | NFR-003 |
| SPEC-015.AC25 | Given the DB runtime role, when UPDATE/DELETE on `audit_logs` is attempted, then it fails | NFR-005 |
| SPEC-015.AC26 | Given the audit export, when run by Super Admin, then it is itself audited; other roles are refused | BRD-037 |
| SPEC-015.AC27 | Given primary pages, when axe and keyboard checks run, then no blocking accessibility violations remain per the confirmed standard | NFR-008 |
| SPEC-015.AC28 | Given a 5 MB limit, when a larger file is uploaded through the full stack, then 413 `FILE_SIZE_EXCEEDED` and nothing stored | BRD-021, 038 |
| SPEC-015.AC29 | Given the performance input register, when reviewed, then every TBC item has an owner and no invented value | BRD-038 |
| SPEC-015.AC30 | Given the performance plan, when prerequisites are checked, then execution is blocked until inputs are confirmed | BRD-038 |
| SPEC-015.AC31 | Given a failure injected after each step of reserve/release/change/finalise/transition, when it occurs, then the transaction rolls back with no partial state | BRD-038 |
| SPEC-015.AC32 | Given a double-submitted action, when both reach the server, then exactly one effect is recorded | BRD-038, NFR-006 |
| SPEC-015.AC33 | Given `/health` and `/ready`, when DB is down, then `/health` is 200 and `/ready` is 503 and neither probes HR/Payroll | NFR-009 |
| SPEC-015.AC34 | Given the infrastructure planning checklist, when reviewed, then INF-01..16 exist with no numeric target invented | NFR-009, OQ-09 |
| SPEC-015.AC35 | Given the production readiness gate, when any PRG item lacks evidence or a BRD-039 scenario fails, then deployment is blocked | BRD-038, 039 |
| SPEC-015.AC36 | Given the NFR matrix, when reviewed, then NFR-001..009 each map to a control, owner spec and test | NFR-001..009 |
| SPEC-015.AC37 | Given the SMTP service fails, when a transition occurs, then the transition succeeds and the failure is logged and retriable without repeating the transition | BRD-036 |
| SPEC-015.AC38 | Given Gate 1 approval of TDD-015.01, when the integration scenarios are run, then they are executed through the approved approach and recorded for SPEC-016 | BRD-039 |

## 22. Negative Acceptance Criteria

| ID | Given / When / Then | BRD-039 row / BRD |
|---|---|---|
| SPEC-015.NAC01 | Given an Employee, when they send a request body containing controlled columns (`employee_id`, `role`, `status`, `location_id` on profile), then 403/400 and no change | BRD-029; mass assignment |
| SPEC-015.NAC02 | Given HR outside the employee's scope, when they change transfer org data, then 403 | Security: outside scope (BRD-026) |
| SPEC-015.NAC03 | Given a Reporting Manager, when they change a Payroll reference, then 403 | BRD-029 |
| SPEC-015.NAC04 | Given any code path calling an external HTTP host, when CI runs, then it fails | BRD Integration Req |
| SPEC-015.NAC05 | Given a callback/webhook route for HR/Payroll, when route inventory runs, then none exists | BRD-029 |
| SPEC-015.NAC06 | Given an inactive/non-existent master id, when supplied, then rejected | BRD-029 |
| SPEC-015.NAC07 | Given Payroll incomplete, when IT Final Approval is attempted directly via API, then 403 `INVALID_WORKFLOW_TRANSITION` | Workflow: IT Final Approval vs Payroll |
| SPEC-015.NAC08 | Given a fake integration timeout, when the adapter times out, then no duplicate downstream transaction is created | **Integration row 1** |
| SPEC-015.NAC09 | Given a failed integration, when retried by an authorised actor, then retry is controlled and bounded | **Integration row 2** |
| SPEC-015.NAC10 | Given a failed integration for a Payroll task, when evaluated, then the task is not Completed | **Integration row 3** |
| SPEC-015.NAC11 | Given an external failure, when evaluated, then the transfer is not Completed | **Integration row 4** |
| SPEC-015.NAC12 | Given duplicate delivery/late success after timeout, when retry proceeds, then idempotency prevents duplicate effect | **Integration row 5 (NFR-006)** |
| SPEC-015.NAC13 | Given an integration descriptor without timeout, when registered, then refused | BRD-038 |
| SPEC-015.NAC14 | Given Employee A, when they request Employee B's transfer/document, then 403 without exposing data | Security row 2 |
| SPEC-015.NAC15 | Given IT outside task scope, when they request documents, then 403 | Security row 3 |
| SPEC-015.NAC16 | Given a direct API call (no UI) lacking role/scope/resource/action permission, when sent, then 403 | Security row 8 |
| SPEC-015.NAC17 | Given missing/expired token, when calling a protected API, then 401 | BRD-026 |
| SPEC-015.NAC18 | Given a locked/deactivated user or old password after reset, when they call APIs, then rejected | Security rows 5–7 (evidence from SPEC-002 tests) |
| SPEC-015.NAC19 | Given a request that bypasses first-login password change, when sent, then rejected | Security row 4 |
| SPEC-015.NAC20 | Given an attacker sets `UPDATE audit_logs`, when run by app role, then permission denied | BRD-037 |
| SPEC-015.NAC21 | Given upload of 5 MB + 1 byte, when sent, then 413 and not stored | BRD-021 |
| SPEC-015.NAC22 | Given extension/MIME mismatch, when uploaded, then 415 `INVALID_FILE_TYPE` | BRD-021 |
| SPEC-015.NAC23 | Given an error is forced, when response is returned, then no internal detail leaks | NFR-004 |
| SPEC-015.NAC24 | Given a token in log capture, when scanned, then test fails | NFR-003 |
| SPEC-015.NAC25 | Given a Full vacancy, when HR approves, then no reservation (consistency verified by CHK-01) | Vacancy row 1 |
| SPEC-015.NAC26 | Given concurrent last-position approvals, when parallel, then capacity not exceeded | Vacancy row 2 |
| SPEC-015.NAC27 | Given any state, when capacity is checked, then never negative (CHK-01) | Vacancy row 3 |
| SPEC-015.NAC28 | Given Rejected/Withdrawn requests, when checked, then reservations released (CHK-03) | Vacancy row 4 |
| SPEC-015.NAC29 | Given a Completed transfer, when modified via normal workflow, then rejected | Workflow row 3 |
| SPEC-015.NAC30 | Given the integrity suite, when two active transfers exist for one employee, then CHK-02 reports it | BRD-030 |
| SPEC-015.NAC31 | Given performance TBC inputs unset, when the gate is evaluated, then it fails | BRD-038 |
| SPEC-015.NAC32 | Given rate limit exceeded on login, when repeated, then 429 and account lock rules unaffected | BRD-025 |

## 23. Testing Requirements

Test-first; tests under `tests/backend/governance/`, `tests/backend/security/`, `tests/backend/integration-harness/`, `tests/frontend/accessibility/`.

### 23.1 Test case catalogue

| Type | TC IDs | Content |
|---|---|---|
| Unit | TC-015.01–.09 | Registry completeness (14 rows), `FieldGuard` allow/deny per role×stage, unknown-field middleware, IntegrationRegistry descriptor validation, redaction list |
| Integration (DB) | TC-015.10–.19 | Master FK/validators; snapshot vs profile; HR change audit; BRD-024 trigger |
| Integrity suite | TC-015.20–.34 | One test per CHK-01..CHK-14 (+ clean data pass) |
| Integration boundary | TC-015.35–.46 | Outbound-call guard, no webhook routes, harness fault injection (timeout, 5xx, duplicate, late success), status mapping, visible failure, authorised retry |
| Manual-Payroll/SMTP | TC-015.47–.52 | Double Payroll mark; Payroll gate; SMTP failure; outbox retry idempotency |
| Security (API) | TC-015.53–.64 | Headers, CORS, rate limit, SQLi payloads, error leakage, credential/log scans |
| Authorisation | TC-015.65–.78 | Route matrix, IDOR matrix, direct API, mass assignment, 401/403/not-found policy |
| Audit | TC-015.79–.84 | Trigger/privileges, no mutate route, export audit, no purge |
| Frontend a11y | TC-015.85–.90 | axe automated, keyboard, dialogs, error association, status badges, responsive |
| Upload | TC-015.91–.94 | 5 MB boundary, proxy limit, 413/415 codes, nothing stored |
| Transaction/Concurrency | TC-015.95–.105 | Fault injection per step, lock order, parallel HR approvals, parallel submit, parallel transitions |
| Idempotency | TC-015.106–.110 | Duplicate mutation, payroll double mark, notification retry, Idempotency-Key (if approved) |
| Operability | TC-015.111–.115 | Health/ready, config validation, graceful shutdown, timeout config |
| Performance (deferred) | TC-015.120–.129 | Defined in plan; **blocked** until BRD-038 inputs are confirmed |
| Negative | NAC mapping | SPEC-015.NAC01–32 |

### 23.2 Test principles

- Negative tests assert both HTTP response and absence of side effects (no history/audit/outbox/reservation rows).
- Concurrency tests use real PostgreSQL (not mocks) with parallel connections.
- Harness code is test-only; test failures block CI.
- Evidence artefacts (reports, scans) are stored for the gate (PRG).
- Frontend a11y tests run on every PR that touches UI components.

## 24. Definition of Done

- [ ] Gate 1 approved; all `TDD-015.NN` resolved or explicitly deferred with owner.
- [ ] TASK-015.01..34 complete with tests passing (RED → GREEN).
- [ ] Registry reviewed against §9.1; CI guard for controlled fields active.
- [ ] Outbound-call guard active; no adapters in `src/`.
- [ ] Contract template, performance plan, infrastructure checklist and readiness-gate documents committed.
- [ ] Integrity suite passes on clean data and detects seeded violations.
- [ ] Security, authorisation, audit and a11y checklists signed by Technical Lead.
- [ ] Gate 2 code review approved; status board, dashboard, `status.md` and `prompt_history.md` synchronised.
- [ ] No numeric performance/availability target committed unless confirmed by the BRD-038/NFR-009 process.

---

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-015.01 | How are BRD-039 Integration scenarios validated when no integration exists? | Option A (recommended): contract-level harness + manual-Payroll idempotency tests + SMTP-dependency fault tests; Option B: mark Integration rows "not applicable this phase" with Gate 1 sign-off; Option C (not recommended): build a stub integration | Defines pass criteria for 5 mandatory rows in QA/UAT **[DECIDED 2026-10-07 — Option A accepted; see TDD-016.01.]** |
| TDD-015.02 | TLS arrangement for local deployment (terminator, certificates, DB/SMTP TLS) | Reverse proxy terminating HTTPS with organisation-issued certificate; HTTP→HTTPS redirect; HSTS; `trust proxy`; PostgreSQL `ssl` when remote; SMTP TLS | NFR-004 verification and deployment |
| TDD-015.03 | [RECONCILED R-13] ONE merged Gate 1 decision: TDD-004.11 = TDD-015.03 (profile org-value update on transfer completion; also who edits profile data). Recommended default (both): transfer values stay on the Transfer Request; no automatic profile update unless the business decides; if decided, SPEC-009 completion calls SPEC-004 `applyTransferOutcome` inside the completion transaction. Does completion (or HR change) also update `employee_profiles` org values, and who may edit profile data for missing-data correction (HR directly vs request to Super Admin)? | Transfer values remain on the Transfer Request; propagation to `employee_profiles` on Completed is a business decision needed from HR; HR edits limited to the fields marked "HR" in §9.1 within scope, audited | Source of truth post-completion; CHK-14 meaning **[DECIDED 2026-10-07]** On Completed (after IT Final Approval) the system automatically updates the employee's current organisation profile (Dept/BU, Designation, Location, Reporting Manager, other approved transfer metadata) from the final approved values on the Transfer Request; no manual profile update afterwards; Employee ID unchanged; applied in the same completion transaction (failure rolls back completion, transfer stays PENDING_IT_FINAL_APPROVAL); audited with previous/new value, transfer reference, system actor, timestamp. Implemented by SPEC-009 FR-009.56a / TASK-009.16. Source: decision text supplied by the spec author; formal Gate 1 record pending. Open sub-points: HR/IT assignment re-derivation from the new Location and profile scope-cache refresh (SPEC-003/004). |
| TDD-015.04 | Employment-status value set | Active, Inactive, plus statuses per HR; submission only for Active `[BRD-029]` | Eligibility and ownership checks |
| TDD-015.05 | Rate-limit thresholds, windows, and whether rate-limit events are audited | Configurable; no committed numeric default until decided; log all, audit only repeated violations | Abuse protection vs usability |
| TDD-015.06 | CORS allowed origins per environment | Environment variable list | Frontend/back-end connectivity |
| TDD-015.07 | Encryption at rest for PostgreSQL volume and document storage | Disk/volume encryption at infrastructure level | NFR-004 data protection |
| TDD-015.08 | Accessibility standard and level required by "organisational portal design and accessibility standards" | WCAG 2.1 AA | NFR-008 pass criteria |
| TDD-015.09 | `Idempotency-Key` header for mutating APIs | Not required; row lock + status precondition suffices | Client retry behaviour |
| TDD-015.10 | Behaviour when `API_REQUEST_TIMEOUT_MS` is unset; readiness exposure (public vs internal) | Production start fails; readiness public but minimal | BRD-038 enforcement |
| TDD-015.11 | 403 vs 404 policy for out-of-scope vs non-existent ids | 403 for both to avoid existence disclosure for non-privileged roles | Information disclosure |
| TDD-015.12 | Dependency-audit threshold and tooling | Block on high/critical with no fix path; waivers recorded | Supply-chain risk |
| TDD-015.13 | Is hash-chaining of audit rows needed beyond append-only trigger/privileges? | Not required by BRD-037; consider later | NFR-005 depth |
| TDD-015.14 | Role authorised to retry a failed future integration | Defined in contract; likely HR for Payroll | NFR-006 authorised retry |
| TDD-015.15 | Include optional Super Admin field-ownership API/page? | Include read-only API; page optional | Transparency vs scope |
| TDD-015.16 | Final personal-data classification list | §9.7 | Projection/redaction scope |
| TDD-015.17 | Separate DB runtime vs migration roles feasible in deployment? | Yes | Audit tamper resistance |
| TDD-015.18 | Scheduled integrity checks vs on-demand only | On-demand + pre-production gate | Operations load |
| TDD-015.19 | Bounded retry count/back-off for transient DB errors | Small configurable count; value to decide | Reliability |
| TDD-015.20 | Owners of BRD-038 TBC inputs (roles) | Proposed in §9.6 | Gate readiness |
| TDD-015.21 | Definition and specification of the "appropriate pre-production environment" | Production-like environment per INF-14 | Validity of performance results |
| TDD-015.22 | Payroll reference format (cross-ref SPEC-009) | Owned by SPEC-009 | Ownership row 13 |

Deferred (BRD-OQ-09): availability, backup schedule, restore procedure, monitoring, alerts, application-log retention — tracked in §11.9; not TDD items because the BRD already assigns them to infrastructure/deployment planning.

## Out of Scope (this SPEC)

Cites BRD Out of Scope; nothing in this SPEC introduces any of the following:
- Automatic HR-system integration or synchronisation (real-time, scheduled or callback) and automatic update of an external HR master `[BRD-OQ-19]`.
- Any Payroll API, callback, status feed or payroll calculation/statutory processing; redesign or replacement of HR, payroll or ITSM platforms; building a payroll engine, identity provider or enterprise master-data platform.
- SSO/MFA `[BRD-025]`; malware scanning, retention/archive/deletion policy for documents `[BRD-021]`.
- Numeric performance, availability, backup, monitoring targets or tooling choices (deferred to infrastructure planning `[NFR-009, BRD-OQ-09]`).
- Any adapter implementation, integration table or retry endpoint for external systems.
- Additional eligibility rules (tenure, probation, disciplinary, notice) `[BRD-029]`.
- Historical data migration, workforce planning, facilities/admin role `[BRD Out of Scope]`.
- Execution and UAT sign-off of BRD-039 scenarios (SPEC-016).
