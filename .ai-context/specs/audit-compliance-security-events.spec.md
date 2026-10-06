# SPEC-013 — Audit, Compliance & Security Event Management

## Feature ID
audit-compliance-security-events

## Status
Draft — not yet submitted for Gate 1

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| | | | | |

## Intent & Business Goals

Complete the audit capability of the Internal Transfer Digital Journey on top of the append-only kernel delivered by SPEC-001 (`AuditService.record(event, {trx})` + `audit_logs` table). SPEC-013 owns: the consolidated **audit event catalogue**, the **audit record content contract**, **central credential redaction**, **tamper-resistance** (NFR-005), **scoped visibility**, **search/filter**, **Super-Admin-only audited export**, the **Audit Logs admin screen** (BRD-003), the **audit-write failure policy**, and the **high-volume indexing/partitioning proposal**.

Business goals:
- Every material business, workflow, administrative and security action across SPEC-002…SPEC-012 leaves exactly one immutable, attributable, credential-free record (BRD-022, BRD-037).
- Auditors and Super Admin can reconstruct "who did what, in which role, to which entity, when, from what to what, and why" (BRD-037).
- Other users see only audit information within their role and organisation scope; the backend decides, never the frontend (BRD-026, BRD-037).
- Evidence is protected: no UPDATE/DELETE path, DB-level enforcement, tamper detection, lifetime retention (NFR-005).

## User Roles & Actors

| Actor | Interaction with this SPEC |
|---|---|
| Super Admin | Views all audit logs; sole role allowed to export; runs integrity verification |
| HR | Views audit rows for employees/transfers/vacancies within its assigned location/organisation scope (TDD-013.03) |
| IT | Views audit rows for IT tasks/transfers within its assigned scope, minimum-information projection (TDD-013.03) |
| Reporting Manager / Receiving Manager | Views audit rows for assigned employees' / routed transfers within scope (TDD-013.03) |
| Employee | No Audit Logs module; own-transfer history only through the timeline endpoint (TDD-013.04) |
| System (scheduler, notification worker, sealer) | Writes system-actor audit rows; sealer and reconciler jobs |
| Every other SPEC's service layer | Calls `AuditService.record` per this SPEC's catalogue |

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-013 |
| Title | Audit, Compliance & Security Event Management |
| Purpose | Define, implement and verify the complete audit trail: content, catalogue, immutability, tamper-evidence, redaction, visibility, search, export, UI, failure policy and scale |
| Business objective | Auditability and security-event traceability for all roles and workflows (BRD-022, BRD-037, NFR-005, NFR-003 audit side) |
| Version | 0.1 (Draft) |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer per roster | Project Manager / Product Owner |
| Task prefix | TASK-013.MM |

## 2. Why This SPEC Exists

- BRD-022 and BRD-037 make audit a cross-cutting, mandatory, testable requirement. SPEC-001 provides the kernel (service + append-only table); nothing yet defines *what* every other SPEC must emit, *who* may see it, *how* it is protected, searched and exported.
- Without one owner the catalogue would fragment across 12 specs, redaction would be inconsistent (risk to BRD-005/006/025 and NFR-003) and visibility rules would be re-implemented per module.
- NFR-005 requires "protected, tamper-resistant" records; the BRD says nothing about the mechanism, so this SPEC proposes one (privileges + triggers + hash seals) as `[PROPOSED]` / `[TDD-REQUIRED]`.
- BRD-037 leaves failure behaviour of audit writes undefined; this SPEC proposes a fail-closed policy for material actions (TDD-013.02).

## 3. BRD Traceability

### 3.1 BRD IDs

| BRD ID | Topic | Coverage | Where in this SPEC |
|---|---|---|---|
| BRD-022 | All material actions auditable, content, plaintext password never | FULL | §7 FR-013.01–.09, §18 catalogue |
| BRD-037 | Audit content, access, append-only, export, retention, security | FULL | §7, §12, §15 |
| BRD-003 | Admin module "Audit Logs" | FULL for the Audit Logs module (screen + API); shell owned by SPEC-003 | §13 |
| BRD-008 | Account creation/activation/deactivation/reset/lock/unlock/first-login change audited without plaintext passwords | PARTIAL (audit side; events emitted by SPEC-002/004; catalogue + redaction verified here) | §18 USER_*/AUTH_* |
| BRD-026 | Authorization denials = security events; audit of approvals, rejections, reassignment, HR metadata, document access, Payroll completion, IT Final Approval | PARTIAL (audit slice) | §18 AUTHZ_ACCESS_DENIED + catalogue |
| BRD-027 | Rejected invalid/unauthorised transition attempts audited as security events (user, role, Transfer Request ID, current status, attempted action, date/time, reason); Block/Resume/Cancel/Reassign audited | PARTIAL (audit slice) | §18 WORKFLOW_INVALID_TRANSITION_ATTEMPT, TRANSFER_* |
| BRD-005/BRD-006/BRD-025 | Temporary password / credentials never in logs or audit | PARTIAL (audit side: redaction + denylist test) | FR-013.05 |
| BRD-010 | Super Admin can view audit history | PARTIAL (view side) | §12 |
| BRD-021, BRD-024, BRD-028, BRD-029, BRD-031, BRD-032, BRD-033, BRD-034, BRD-035, BRD-036 | Specific audit field lists in each rule | PARTIAL (field lists consolidated into the catalogue; emission by owner specs) | §18 |
| BRD-035 | Previous assignee keeps visibility through workflow/audit history | PARTIAL (visibility rule) | FR-013.22 |
| BRD-036 | Notification failures logged for audit/troubleshooting | PARTIAL (audit rows for failures; delivery by SPEC-012) | §18 NOTIFICATION_* |
| BRD-039 | Negative scenarios touching audit | PARTIAL (see 3.5) | §22 |

### 3.2 NFR IDs

| NFR | Coverage |
|---|---|
| NFR-005 Auditability (protected, tamper-resistant, append-only, lifetime, scoped view, SA-only export, no credentials) | FULL |
| NFR-003 Credential security (no plaintext/temporary/reset password, tokens in audit) | PARTIAL — audit side only (hashing/reset: SPEC-002/004) |
| NFR-002 / NFR-007 | PARTIAL — scope enforcement applied to audit reads |
| NFR-006 | PARTIAL — notification-failure audit rows; idempotent audit writes |
| NFR-009 | PARTIAL — monitoring of audit write failures/integrity (targets deferred) |

### 3.3 BRD-OQ

BRD-OQ-13/18 (Block/Resume/Cancel/Reassign audited), BRD-OQ-14(d) (invalid transition audited as security event), BRD-OQ-15(c) (manual release audit fields), BRD-OQ-12 (withdraw audit fields). BRD-OQ-09 deferred: volume/performance numbers come from SPEC-015; this SPEC proposes structure only.

### 3.4 Business rules and acceptance criteria covered

| Source | Item | Coverage |
|---|---|---|
| Business Rules | "Audit logging (BRD-037)" bullet | FULL |
| BRD "Acceptance Criteria" | "Every material configuration, security and workflow action creates the agreed audit record." | FULL (via catalogue conformance) |
| BRD "Acceptance Criteria" | "Audit logging (BRD-037): …" paragraph | FULL |
| BRD "Acceptance Criteria" | credentials never in audit logs (account-security bullets) | FULL (audit side) |

### 3.5 Negative scenarios (BRD-039 rows)

| BRD-039 row | Coverage here |
|---|---|
| Security: user cannot access another organisation's data outside scope | PARTIAL — audit reads (SPEC-013.NAC04–NAC08) |
| Security: Employee cannot access another Employee's transfer request | PARTIAL — audit timeline (SPEC-013.NAC07) |
| Security: direct API access cannot bypass authorization | PARTIAL — Postman-style calls to audit/export APIs (SPEC-013.NAC03, NAC09) |
| Workflow: invalid workflow transitions are rejected | PARTIAL — the rejection is audited (SPEC-013.AC17, SPEC-013.NAC15) |
| Security: IT cannot access documents outside scope | PARTIAL — denied document access is audited |

## 4. Dependencies

| Depends on | Needed capability |
|---|---|
| SPEC-001 | `AuditService.record`, `audit_logs` kernel (append-only trigger/privilege strategy), `withTransaction`, logger with secret redaction, request-id, error classes, response envelope, migrations convention |
| SPEC-002 | Authenticated context (userId, role, tokenVersion), `AuthorizationService`, `ScopeResolver` interface, login/lock/password flows emitting AUTH_* events, 401/403 middleware (calls the denial writer defined here) |
| SPEC-003 | Location/department/designation masters and organisation scope mappings (HR location, IT location, Receiving Manager scope) used to build visibility predicates; Admin shell + list/form UI patterns |
| SPEC-004 | `employee_profiles` (reporting manager, assigned HR/IT), user lifecycle events |
| SPEC-005…SPEC-012 | Emit catalogue events from their transactions |
| SPEC-007 | `WorkflowEngine.transition` (single transaction that also writes audit), `transfer_task_assignments` (responsibility history for BRD-035 visibility) |

## 5. Enables

- SPEC-006/007/014: `GET /transfers/:id/audit-logs` timeline component and previous/new value diffs.
- SPEC-014: Super Admin audit widgets may link to the Audit Logs screen.
- SPEC-015: audit write-failure and integrity monitoring inputs; scale numbers feed partitioning.
- SPEC-016: catalogue conformance matrix and BRD-037 acceptance tests.

## 6. Roles & Scope

Roles enum `SUPER_ADMIN, EMPLOYEE, REPORTING_MANAGER, RECEIVING_MANAGER, HR, IT` `[BRD-001]`.

| Capability | SUPER_ADMIN | HR | IT | REPORTING_MANAGER | RECEIVING_MANAGER | EMPLOYEE |
|---|---|---|---|---|---|---|
| View all audit logs | Yes `[BRD-037]` | No | No | No | No | No |
| View audit rows within role + organisation scope | n/a | Yes, scope = assigned location/organisation `[BRD-037, BRD-013]` | Yes, assigned IT tasks/location, minimum info `[BRD-014, Business Rules]` | Yes, assigned employees `[BRD-012]` | Yes, routed incoming transfers `[BRD-012]` `[TDD-REQUIRED]` mapping | Not via Audit Logs module `[TDD-REQUIRED]` TDD-013.04 |
| View own-transfer event timeline | Yes | In scope | In scope | In scope | In scope | Own transfer only, employee-visible events `[PROPOSED]` |
| Export audit logs | **Yes** `[BRD-037]` | No (403) | No (403) | No (403) | No (403) | No (403) |
| Run integrity verification | Yes `[PROPOSED]` | No | No | No | No | No |
| Edit/delete/truncate audit rows | No role, no API `[BRD-037]` | | | | | |

## 7. Functional Requirements

### 7.1 Record content (BRD-037)

- **FR-013.01** `[BRD-037]` Each audit record captures, where applicable: actor (user), role of the actor **at the time of the action**, action, entity (related employee/entity/transfer request), date/time, previous value, new value, previous status, new status, remarks/reason. Column mapping in §10.1.
- **FR-013.02** `[DERIVED from BRD-037 "role of the actor at the time"]` The actor role is **snapshotted** from the authenticated context at write time (never joined later from `users.role`), so later role changes do not rewrite history. The actor display name and User ID are snapshotted too `[PROPOSED]`.
- **FR-013.03** `[DERIVED]` Date/time is the database clock (`clock_timestamp()`, UTC `timestamptz`), not a client-supplied value. UI renders in the application business time zone (the same configured zone as BRD-031) `[PROPOSED]`.
- **FR-013.04** `[BRD-037]` A change to data creates a **new** audit entry; existing entries are never overwritten. Correction of a business value is a new business action with its own entry; `related_audit_id` links it to the entry it supersedes `[PROPOSED]`.

### 7.2 Credentials never stored

- **FR-013.05** `[BRD-037, BRD-025, BRD-005, BRD-006, NFR-003]` No audit record, audit export or audit-related log line may contain a plaintext, temporary, reset or old/new password, password hash, access/refresh token, JWT, session identifier, authorization header, cookie or other credential. Enforced by three layers `[PROPOSED]`: (1) per-event payload **allowlist schema** in the catalogue (unknown keys rejected), (2) central `AuditRedactor` with key **denylist** (case/separator-insensitive, recursive) and value-pattern detection (JWT `eyJ…`, bcrypt `$2[aby]$`), (3) DB `CHECK`/trigger scan on `previous_value/new_value/details/remarks` for the same value patterns (defence in depth, cheap regex). Redaction replaces the value with `"[REDACTED]"` and increments `redaction_count`; in test/CI environments any redaction **throws** so developers fix the emitter.
- **FR-013.06** `[PROPOSED]` For failed logins the attempted User ID is stored only if it matches the `^(EMP|MGR|HR|IT)\d{6}$` format `[BRD-004]` (plus the RM/SA prefix once TDD in SPEC-004 is resolved); otherwise `"[INVALID_FORMAT]"` is stored with the input length, because a user who mistypes a password into the User ID field would otherwise leak it.
- **FR-013.07** `[BRD-005]` Credential-related events (USER_CREATED, USER_CREDENTIALS_RESET, credential email) record *that* credentials were generated/delivered (channel, recipient user id, outbox id), never the credential content nor the email body.

### 7.3 Append-only, tamper-resistance, retention

- **FR-013.08** `[BRD-037, NFR-005]` Audit tables are append-only at four layers `[PROPOSED]`: (a) no UPDATE/DELETE/TRUNCATE code path (repository exposes `insert` and `select` only; Sequelize model hooks throw; no PUT/PATCH/DELETE routes), (b) DB role privileges: the application role has `INSERT, SELECT` only, (c) `BEFORE UPDATE OR DELETE` row trigger and `BEFORE TRUNCATE` statement trigger raising `AUDIT_IMMUTABLE`, (d) migrations run under a separate owner role never used at runtime.
- **FR-013.09** `[NFR-005 "tamper-resistant" — mechanism TDD-REQUIRED]` Tamper **evidence**: each row carries `row_hash` (SHA-256 of a canonical serialisation, computed by DB trigger); a sealing job batches committed rows into `audit_seals` linked by `prev_seal_hash` (hash chain over batches); `verify` recomputes and reports any modified, deleted or reordered range. See TDD-013.01.
- **FR-013.10** `[BRD-037]` Retention is the lifetime of the system. No application feature, scheduled job, admin API or UI deletes, archives-and-drops or purges audit rows. Partitions are never dropped by application code. (Operational cold-storage of old partitions by DBAs is outside the application; TDD-013.09.)
- **FR-013.11** `[BRD-037]` Manual deletion through the application is impossible: static check (lint rule + architecture test) forbids `destroy`, `truncate`, `DELETE FROM audit_`, `UPDATE audit_` in application code.

### 7.4 Catalogue and write path

- **FR-013.12** `[BRD-022]` The consolidated **Audit Event Catalogue** (§18) is the single authoritative list. It is implemented as `backend/src/modules/audit/catalogue/` (one typed definition per event code: category, entity type, required/optional payload schema, scope derivation, employee-visibility flag, IT-visibility flag). `AuditService.record` rejects an unregistered `event_code`.
- **FR-013.13** `[BRD-022, DERIVED]` Material business/workflow/administrative actions write their audit row **in the same database transaction** as the business change (obtained via `AuditService.record(event, {trx})`). A rolled-back business change therefore leaves no audit row and a committed one always has it.
- **FR-013.14** `[TDD-REQUIRED]` Audit-write failure policy (BRD silent): recommended **fail-closed** for material actions — failure to insert the audit row aborts and rolls back the business transaction and returns HTTP 500 `AUDIT_WRITE_FAILED` `[PROPOSED]`. Security-denial events that occur outside a business transaction (401/403/invalid transition/login failure) use `recordIndependent` (own short transaction; on failure: error log + local spool for reconciliation; the denial itself is still returned). See TDD-013.02 and §17.
- **FR-013.15** `[DERIVED from BRD-036]` Notification failures never roll back the core transaction; their audit rows are written by the notification worker in its own transaction. Audit-write failure in that path is logged and retried; it never affects the workflow.
- **FR-013.16** `[PROPOSED]` Audit writes are idempotent: every event carries a client-generated `event_uuid` (UNIQUE); a retry/replay with the same uuid is a no-op (`ON CONFLICT DO NOTHING`), preventing duplicate rows on retried handlers (NFR-006 spirit).
- **FR-013.17** `[BRD-022]` Each material event also stores actor identity context `request_id`, `client_ip`, `source` (API/JOB/SYSTEM) `[PROPOSED]` for traceability. IP/User-Agent are personal data: stored only on SECURITY events and logins `[PROPOSED]`.

### 7.5 Visibility, search, export

- **FR-013.18** `[BRD-037]` Super Admin sees all audit rows. Every other role sees only rows within its role + organisation scope; enforced in the backend query (predicate injected by `AuditVisibilityPolicy`), never post-filtered in the frontend. Out-of-scope direct API calls return 403 without disclosing the record (BRD-026).
- **FR-013.19** `[PROPOSED]` Per-role scope rules are defined in §15.2 and implemented through `ScopeResolver` (SPEC-002 interface; data SPEC-003/004). Denormalised scope columns (`scope_location_ids`, `scope_department_ids`) and `audit_log_participants` carry the scope snapshot as at event time.
- **FR-013.20** `[PROPOSED]` Search/filter: actor (id/user code), role, action/event code, category, outcome, entity type + id, Transfer Request id/reference, employee, status (previous/new/either), date range (from/to), administrative-intervention flag, free-text on remarks. Pagination `?page&pageSize` (default 20, max 100), sorting by `occurredAt` (default desc) with tiebreak `id`; optional keyset cursor for deep paging (TDD-013.18 / TDD-013.09).
- **FR-013.21** `[BRD-037, BRD-026]` Explicit entity filters (`transferId`, `employeeId`) referencing an entity outside the caller's scope are refused with 403 (not an empty list), so the endpoint is not an existence oracle.
- **FR-013.22** `[BRD-035]` A previous assignee of a reassigned task keeps **read** visibility of that transfer's audit/workflow history (`audit_log_participants.participant_type = PREVIOUS_ASSIGNEE`) while losing action rights (SPEC-007/010). Extent of visibility after the reassignment: TDD-013.05.
- **FR-013.23** `[BRD-037]` Export: Super Admin only; every other role gets 403 `FORBIDDEN` (and an `AUTHZ_ACCESS_DENIED` row). Format `[TDD-REQUIRED]`, recommended CSV (UTF-8, RFC 4180, formula-injection-safe).
- **FR-013.24** `[BRD-037]` The export is itself audited: `AUDIT_EXPORT_REQUESTED` (before any data leaves; fail-closed), `AUDIT_EXPORT_COMPLETED` or `AUDIT_EXPORT_FAILED` (who, role, filters applied, row count, format, started/finished time, SHA-256 of the produced file `[PROPOSED]`).
- **FR-013.25** `[BRD-003]` The Audit Logs admin module (list, filters, detail drawer with previous/new diff, export for Super Admin, integrity status for Super Admin) is delivered; role-aware navigation shows it only to roles allowed to view audit rows.
- **FR-013.26** `[DERIVED from BRD-022 "all material actions" + BRD-026/BRD-027]` Authorization denials (403) on protected resources and invalid workflow transition attempts are recorded as SECURITY events by shared writers `AuditService.recordAuthorizationDenied` and `recordInvalidTransition` that SPEC-002 / SPEC-007 middleware call; this SPEC owns their payload contract.
- **FR-013.27** `[PROPOSED]` Integrity verification (Super Admin): on-demand + scheduled; a failure writes `AUDIT_INTEGRITY_FAILURE` (SECURITY), logs at error level and shows a banner on the Audit Logs screen.
- **FR-013.28** `[PROPOSED]` Conformance harness: a test-only registry compares the catalogue with (a) every `AuditService.record*(` call site found by static scan and (b) integration tests of each owner SPEC, so a new action without a catalogue entry (or a catalogue entry never emitted) fails CI.

## 8. Internal Implementation Plan / Tasks

| Task | Title | Layer | Description | Inputs → Outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-013.01 | Extend `audit_logs` (additive migration) | DB | Add columns/constraints/indexes of §10.1 over the SPEC-001 kernel (ALTER, never recreate); partitioned-by-month parent if kernel not yet partitioned (see TDD-013.09) | SPEC-001 table → extended table | SPEC-001 | BRD-037 |
| TASK-013.02 | `audit_log_participants`, `audit_seals`, `audit_spool_imports` tables | DB | Create per §10.2–10.4 with indexes and immutability | – → tables | .01 | BRD-035, BRD-037, NFR-005 |
| TASK-013.03 | DB hardening: roles, REVOKE, triggers | DB | `portal_owner`/`portal_app`/`portal_audit_sealer` roles, REVOKE UPDATE/DELETE/TRUNCATE, `BEFORE UPDATE OR DELETE` + `BEFORE TRUNCATE` triggers, `ALTER DEFAULT PRIVILEGES` for new partitions, credential value-pattern CHECK, `row_hash` trigger | – → SQL migration | .01, .02 | BRD-037, NFR-005 |
| TASK-013.04 | Event catalogue registry & payload schemas | BE | Typed catalogue of §18 (≈100 codes) with allowlist payload schemas, category, entity type, scope derivation, visibility flags | §18 → `catalogue/*.ts` | SPEC-001 | BRD-022 |
| TASK-013.05 | `AuditRedactor` | BE | Recursive denylist + value patterns + allowlist enforcement; throws in test, redacts+counts in prod | event payload → sanitised payload | .04 | BRD-037, NFR-003 |
| TASK-013.06 | Harden `AuditService.record` | BE | Validate code, schema, redact, snapshot actor/role/scope, derive participants, idempotent insert, fail-closed | event + trx → row id | .04, .05 | BRD-022, BRD-037 |
| TASK-013.07 | `recordIndependent`, denial writers, spool & reconciler | BE | `recordAuthorizationDenied`, `recordInvalidTransition`, `recordLoginFailure` (independent short tx), JSONL spool and idempotent importer | denial context → rows/spool | .06 | BRD-026, BRD-027, BRD-037 |
| TASK-013.08 | Actor/request context binding | BE | `AuditContext` from request (userId, role, requestId, ip, source) incl. SYSTEM actor for jobs | req → context | SPEC-002 | BRD-037 |
| TASK-013.09 | Seal worker + verifier | BE | Seal committed rows in batches (`xact_id < snapshot xmin`), chain seals, `verifyRange`, `verifyAll` | rows → `audit_seals` | .03 | NFR-005 |
| TASK-013.10 | `AuditVisibilityPolicy` | BE | Per-role predicate + field projection (IT/RM minimum info), explicit-entity guard | ctx → SQL predicate | SPEC-002/003/004 | BRD-037, BRD-026 |
| TASK-013.11 | `AuditQueryService` + repository | BE | Filters, pagination, keyset, sort, count strategy, projection | query → page | .10 | BRD-037 |
| TASK-013.12 | List/detail/event-codes/timeline endpoints | BE | Controllers, routes, validators, DTOs, error codes (§12) | HTTP → JSON | .11 | BRD-037, BRD-003 |
| TASK-013.13 | Audit export service + endpoint | BE | Super-Admin-only CSV stream in snapshot read tx, injection-safe, audited start/finish | filters → CSV | .06, .11 | BRD-037 |
| TASK-013.14 | Integrity endpoints + alert | BE | `GET /audit-logs/integrity`, `POST /audit-logs/integrity/verify`, `AUDIT_INTEGRITY_FAILURE` | – → report | .09 | NFR-005 |
| TASK-013.15 | App-layer immutability guards | BE | Model hooks, repository without update/delete, 405 guard on `/audit-logs*` mutating verbs, ESLint rule | – | .03 | BRD-037 |
| TASK-013.16 | Notification-failure audit adapter | BE | `NOTIFICATION_*` events from SPEC-012 worker, no body/credential copy | SPEC-012 → rows | .06 | BRD-036 |
| TASK-013.17 | Catalogue conformance harness | QA/BE | Static scanner + per-owner-spec emit contract tests | repo → CI report | .04 | BRD-022 |
| TASK-013.18 | FE Audit Logs list page | FE | Table, status/outcome badges, pagination, states | API → page | .12 | BRD-003, BRD-002 |
| TASK-013.19 | FE filter panel + URL state | FE | All filters of FR-013.20, date range, reset | – | .18 | BRD-037 |
| TASK-013.20 | FE detail drawer + diff | FE | Previous/new value, status, remarks, request id | – | .18 | BRD-037 |
| TASK-013.21 | FE export dialog (Super Admin) | FE | Confirmation dialog (BRD-002 sensitive action), filters echo, download, error/no-access | – | .13, .18 | BRD-037 |
| TASK-013.22 | FE `TransferAuditTimeline` component | FE | Reusable by SPEC-006/007/014 | – | .12 | BRD-035 |
| TASK-013.23 | FE nav gating + a11y | FE | Menu visibility (UX only), 403 no-access page, keyboard/ARIA | – | .18 | NFR-008 |
| TASK-013.24 | Unit tests: catalogue, redactor, policy | QA | See §23 | – | .04–.10 | |
| TASK-013.25 | DB immutability & privilege tests | QA | UPDATE/DELETE/TRUNCATE as app role, owner role bypass check, partition privilege inheritance | – | .03 | NFR-005 |
| TASK-013.26 | Visibility matrix tests | QA | Role × entity × scope, previous assignee, 403 no leak | – | .10–.12 | BRD-037 |
| TASK-013.27 | Export tests | QA | SA-only, audited, CSV safe, snapshot consistency | – | .13 | BRD-037 |
| TASK-013.28 | Fail-closed / fault-injection tests | QA | Audit insert fault → rollback, independent-write failure → spool | – | .06, .07 | FR-013.14 |
| TASK-013.29 | Credential leak scan | QA | End-to-end flows then grep DB rows, exports, logs for planted secrets | – | .05 | BRD-037, NFR-003 |
| TASK-013.30 | Index/volume test | QA | Seed volume, `EXPLAIN` assertions, partition pruning | – | .01 | NFR-009 |
| TASK-013.31 | Tamper detection tests | QA | Superuser-style modification then `verify` fails | – | .09 | NFR-005 |

Order: .01→.03 (DB) → .04–.08 → .09/.10 → .11–.16 → .17 → FE .18–.23 → QA .24–.31 (QA tasks are written test-first alongside their BE tasks per TDD RED→GREEN).

## 9. Business Rules

| # | Rule | Source |
|---|---|---|
| BR-013.01 | Every material business, workflow, administrative and security action is audited | BRD-037 |
| BR-013.02 | Audit records are append-only; changes create new entries | BRD-037 |
| BR-013.03 | Super Admin sees all; others only within role + organisation scope | BRD-037 |
| BR-013.04 | Only Super Admin exports; export is audited | BRD-037 |
| BR-013.05 | Lifetime retention; no manual deletion through the application | BRD-037 |
| BR-013.06 | No passwords/tokens/credentials ever in audit | BRD-037, BRD-025 |
| BR-013.07 | Security events (login failure, lock/unlock, password reset, role/permission change, admin intervention, authz denial, invalid transition) are audited | BRD-037, BRD-026, BRD-027 |
| BR-013.08 | Previous assignee keeps history visibility, loses action rights | BRD-035 |
| BR-013.09 | A rolled-back business action leaves no audit row; a committed one always has one | DERIVED (BRD-022 + transactional rule) |
| BR-013.10 | No role may alter audit data, including Super Admin | DERIVED (BRD-037 "never edited") |
| BR-013.11 | Viewing audit data never changes it; audit reads do not generate business events | DERIVED |

## 10. Data Model & Database

All DDL `[PROPOSED]`; migrations under `backend/src/migrations/` named `YYYYMMDDHHMMSS-013-*.js`. Table `audit_logs` already exists from SPEC-001; 013 migrations are **additive**. Where SPEC-001 already defined a column with the same meaning, SPEC-001's name wins and TASK-013.01 reconciles (TDD-013.19).

### 10.1 `audit_logs`

| Column | Type | Null | Notes |
|---|---|---|---|
| id | UUID `gen_random_uuid()` | no | PK (with `occurred_at` if partitioned) [RECONCILED R-10] SPEC-001 kernel: uuid `id` + `seq BIGINT GENERATED ALWAYS AS IDENTITY` (monotonic ordering; use `seq` wherever this SPEC used a numeric audit id: seals, cursors, `related_audit_id`) |
| occurred_at | TIMESTAMPTZ DEFAULT clock_timestamp() | no | DB clock `[BRD-037 date/time]` |
| event_uuid | UUID | no | UNIQUE (event_uuid, occurred_at) — idempotency; see TDD-013.09 on cross-partition uniqueness |
| event_code | VARCHAR(64) | no | catalogue code §18 |
| category | VARCHAR(16) | no | CHECK IN ('BUSINESS','WORKFLOW','ADMIN','SECURITY') |
| outcome | VARCHAR(8) | no | CHECK IN ('SUCCESS','DENIED','FAILED') |
| action | VARCHAR(64) | no | workflow action code (SUBMIT, APPROVE, …) or verb (CREATE, UPDATE, VIEW, EXPORT, LOGIN) `[BRD-037 Action]` |
| actor_type | VARCHAR(10) | no | USER / SYSTEM / ANONYMOUS |
| actor_user_id | UUID, **no FK** [RECONCILED R-10: where this table's VARCHAR lengths differ from SPEC-001 §10.2 (event_code 100, action 100, entity_type 60, actor_role 30, status 60), the SPEC-001 kernel lengths win; column names are identical] | yes | null for SYSTEM/ANONYMOUS; no FK so the log survives account changes (SPEC-001 wins over the earlier FK RESTRICT) [RECONCILED R-10] |
| actor_login_id | VARCHAR(32) | yes | User ID snapshot (EMP000123); SPEC-001 column name [RECONCILED] |
| actor_display_name | VARCHAR(128) | yes | snapshot |
| actor_role | VARCHAR(24) | yes | role at time `[BRD-037 Role]`; CHECK in role enum |
| entity_type | VARCHAR(32) | no | USER, EMPLOYEE, TRANSFER, VACANCY, VACANCY_RESERVATION, DOCUMENT, LOCATION, DEPARTMENT, DESIGNATION, SCOPE_MAPPING, WORKFLOW_CONFIG, PAYROLL_ACTIVITY, IT_TASK, NOTIFICATION, SESSION, AUDIT_LOG, SYSTEM |
| entity_id | VARCHAR(64) | yes | polymorphic id (no FK) |
| entity_ref | VARCHAR(64) | yes | business reference (transfer reference, vacancy reference, user code) |
| subject_user_id | UUID, no FK | yes | the employee/user the action concerns (additive to SPEC-001 `related_employee_id` = employee_profiles id) [RECONCILED] |
| related_transfer_id | UUID, no FK | yes | [RECONCILED R-10] SPEC-001 column name `related_transfer_id` (was `transfer_request_id`); for transfer-related events `[BRD-037 Entity]` |
| previous_value | JSONB | yes | `[BRD-037]` allowlist-sanitised |
| new_value | JSONB | yes | |
| changed_fields | TEXT[] | yes | field names that changed |
| previous_status | VARCHAR(48) | yes | workflow/vacancy/account status code |
| new_status | VARCHAR(48) | yes | |
| remarks | TEXT | yes | reason/remarks; length cap `[PROPOSED]` 2000 chars (validated by owner specs) |
| metadata | JSONB | yes | [RECONCILED R-10] column name `metadata` per SPEC-001 (API/DTO field may remain `details`); event-specific extras (filters, endpoint, denial reason code, counts) — schema per event |
| is_administrative_intervention | BOOLEAN DEFAULT false | no | Super Admin intervention flag (block, cancel, reassign, date correction, manual release, reset, unlock) `[BRD-037]` |
| scope_location_ids | UUID[] | yes | location(s) of subject at event time (current and, where relevant, target) |
| scope_department_ids | UUID[] | yes | |
| related_audit_id | UUID | yes | correction/supersession link to `audit_logs.id` (no FK; partition-safe) |
| request_id | VARCHAR(64) | yes | SPEC-001 request id |
| client_ip | INET | yes | SECURITY/login events only |
| source | VARCHAR(8) | no | API / JOB / SYSTEM |
| redaction_count | SMALLINT DEFAULT 0 | no | |
| schema_version | SMALLINT DEFAULT 1 | no | catalogue payload version |
| xact_id | XID8 DEFAULT pg_current_xact_id() | no | seal ordering (PG ≥ 13, TDD-013.10) |
| row_hash | CHAR(64) | no | set by trigger; never null |

CHECKs: `outcome='SUCCESS' OR category='SECURITY' OR outcome IN ('FAILED')`; `actor_type='USER' → actor_user_id IS NOT NULL OR actor_role IS NULL` (login failure with unknown user is ANONYMOUS). No `created_at/updated_at` columns beyond `occurred_at` (no `updated_at` exists by design).

### 10.2 `audit_log_participants`

`(audit_log_id UUID, audit_occurred_at TIMESTAMPTZ, user_id UUID FK users(id), participant_type VARCHAR(24))` [RECONCILED uuid types], PK `(audit_log_id, audit_occurred_at, user_id, participant_type)`. Types: `ACTOR, SUBJECT, REPORTING_MANAGER, RECEIVING_MANAGER, HR_ASSIGNED, IT_ASSIGNED, PREVIOUS_ASSIGNEE, NEW_ASSIGNEE`. Written in the same transaction as the audit row by `AuditService`. Index `(user_id, audit_occurred_at DESC, audit_log_id DESC)`. Same privileges and triggers as `audit_logs`.

### 10.3 `audit_seals`

`seal_id BIGINT identity PK`, `first_audit_seq`, `last_audit_seq` (BIGINT, from `audit_logs.seq`) [RECONCILED], `first_xact_id XID8`, `last_xact_id XID8`, `row_count INT`, `batch_hash CHAR(64)` (SHA-256 over concatenated `row_hash` ordered by `(xact_id,id)`), `prev_seal_hash CHAR(64)` (genesis = 64 zeros), `seal_hash CHAR(64)` = SHA-256(`prev_seal_hash ‖ batch_hash ‖ row_count ‖ first/last ids`), `sealed_at TIMESTAMPTZ DEFAULT now()`. Append-only (same hardening). UNIQUE `(prev_seal_hash)`.

### 10.4 `audit_spool_imports`

`(event_uuid UUID PK, imported_at, source_file VARCHAR(255))` — idempotency ledger for the JSONL spool importer (TASK-013.07).

### 10.5 Indexes (proposal, validated by TASK-013.30)

| Index | Purpose |
|---|---|
| PK `(id, occurred_at)` | identity + partition key |
| `(occurred_at DESC, id DESC)` | default list, date range, keyset |
| `(related_transfer_id, occurred_at DESC)` | transfer timeline, transfer-id filter |
| `(actor_user_id, occurred_at DESC)` | actor filter |
| `(event_code, occurred_at DESC)` | action filter |
| `(entity_type, entity_id, occurred_at DESC)` | entity filter |
| `(subject_user_id, occurred_at DESC)` | employee filter, RM/HR scope |
| GIN `(scope_location_ids)` | HR/IT location visibility |
| `(category, outcome, occurred_at DESC)` partial `WHERE category='SECURITY'` | security review |
| BRIN `(occurred_at)` | cheap range scans on large partitions |
| UNIQUE `(event_uuid, occurred_at)` | idempotency (cross-partition note TDD-013.09) |
| Optional GIN `to_tsvector('simple', remarks)` | remarks free-text, only if TDD-013.18 accepts |

### 10.6 Partitioning and scale `[PROPOSED]` (TDD-013.09)

Range-partition `audit_logs` and `audit_log_participants` by `occurred_at` monthly (declarative). A job (run with the owner role) pre-creates partitions N months ahead; a default partition catches stragglers and raises an alert. Partitions are never dropped (FR-013.10). Row/volume numbers are not invented: BRD-038 "expected transaction volume" is TBC; SPEC-015 supplies the figure that confirms or removes partitioning. Migration test must prove new partitions inherit privileges and triggers.

## 11. Backend Implementation

Module `backend/src/modules/audit/`:

| Path | Responsibility |
|---|---|
| `catalogue/` | `eventCodes.ts`, per-domain definitions (auth, user, master, vacancy, transfer, hr, payroll-it, exception, document, notification, audit) |
| `audit.service.ts` | `record(event,{trx})`, `recordIndependent(event)`, `recordAuthorizationDenied(ctx,…)`, `recordInvalidTransition(ctx,…)`, `recordLoginFailure(…)` |
| `audit.redactor.ts` | denylist/value patterns/allowlist |
| `audit.context.ts` | `AuditContext` from request or job |
| `audit.visibility.ts` | `AuditVisibilityPolicy` (§15.2) |
| `audit.repository.ts` | insert + select only; keyset helpers |
| `audit.query.service.ts` | filter parsing → SQL, pagination |
| `audit.export.service.ts` | CSV streaming, snapshot tx |
| `audit.seal.service.ts`, `audit.seal.job.ts` | sealing + verification |
| `audit.spool.ts` | JSONL spool + importer |
| `audit.controller.ts`, `audit.routes.ts`, `audit.validators.ts`, `dto/` | HTTP layer |

Rules:
- Single write funnel: only `AuditService` touches the audit repository; feature modules import `AuditService` (SPEC-001 interface), never the model.
- `AuditService.record` steps: validate code → validate payload against allowlist schema → redact → snapshot actor/role/scope → compute participants → insert row + participants → return id; any exception propagates (fail-closed) when called with a `trx`.
- Standard logger only (Winston/Pino), no `console.log`; logger shares the redaction denylist with `AuditRedactor` (single source `securityDenylist.ts`) `[PROPOSED]`.
- Async/await with try/catch around every DB operation; errors mapped to the SPEC-001 error classes.
- Config (env): `AUDIT_EXPORT_MAX_ROWS` (TDD-013.07), `AUDIT_SEAL_INTERVAL_MS`, `AUDIT_SEAL_LAG_MS`, `AUDIT_SPOOL_DIR`, `AUDIT_PARTITION_MONTHS_AHEAD`, `AUDIT_HASH_ALGO=sha256`. No secret is hard-coded.
- Sealer job: leader-safe with `pg_try_advisory_lock`; runs as `portal_audit_sealer`; seals only rows with `xact_id < pg_snapshot_xmin(pg_current_snapshot())` so late-committing transactions are never skipped.
- Spool reconciler: reads `AUDIT_SPOOL_DIR/*.jsonl`, inserts each line idempotently by `event_uuid`, records into `audit_spool_imports`, then renames the file; raises an error log if any spool file is older than a threshold (threshold value TBC, SPEC-015).

## 12. API Requirements

Base `/api/v1`. All endpoints require authentication (401 otherwise). Error envelope per contract. Audit endpoints themselves are not audited per read (TDD-013.08), denials are.

### 12.1 `GET /audit-logs` `[PROPOSED]`

| Item | Value |
|---|---|
| Purpose | Paginated, filtered audit list |
| Auth / authz | Roles SUPER_ADMIN, HR, IT, REPORTING_MANAGER, RECEIVING_MANAGER (EMPLOYEE → 403 `FORBIDDEN`, TDD-013.04). Scope predicate injected server-side |
| Query | `page`, `pageSize` (≤100), `sort=occurredAt`, `order=asc\|desc`, `actorUserCode`, `actorUserId`, `actorRole`, `eventCode` (repeatable), `category`, `outcome`, `entityType`, `entityId`, `transferId`, `transferReference`, `employeeId`, `status` (matches previous or new), `previousStatus`, `newStatus`, `dateFrom`, `dateTo` (ISO-8601), `isAdministrativeIntervention`, `q` (remarks), `cursor` |
| Response 200 | `{ "success": true, "data": [ { "id": "7c1e5a2e-0000-4000-8000-000000001201", "occurredAt": "2026-10-06T09:41:12.123Z", "eventCode": "TRANSFER_REJECTED", "category": "WORKFLOW", "outcome": "SUCCESS", "action": "REJECT", "actor": { "userCode": "HR000012", "displayName": "…", "role": "HR" }, "entity": { "type": "TRANSFER", "id": "88", "ref": "<reference>" }, "subject": { "userCode": "EMP000045", "displayName": "…" }, "transferRequestId": 88, "previousStatus": "PENDING_HR_REVIEW", "newStatus": "REJECTED", "previousValue": null, "newValue": null, "changedFields": [], "remarks": "…", "isAdministrativeIntervention": false, "requestId": "…" } ], "meta": { "page": 1, "pageSize": 20, "hasNext": true, "total": 1234, "nextCursor": "…" } }` (`total` per TDD-013.18) |
| Validation | `pageSize` 1–100; `dateFrom ≤ dateTo`; ISO dates; enums validated against catalogue/role/status enums; unknown filter keys → 400; `q` max 100 chars, parameterised (no raw SQL) |
| Errors | 400 `VALIDATION_ERROR`; 401; 403 `FORBIDDEN` (role not allowed, or explicit entity filter out of scope) |
| Status | 200, 400, 401, 403, 500 |

### 12.2 `GET /audit-logs/:id`

Purpose: one record (detail drawer). Authz: same roles; row must satisfy the caller's predicate; otherwise **403 `FORBIDDEN`** regardless of whether the id exists (no existence oracle) for non-Super-Admin; Super Admin gets 404 `NOT_FOUND` for unknown id. Response: same item shape plus `details`, `redactionCount`, `ipAddress` (SECURITY rows, Super Admin only), `rowHash` (Super Admin only). Field projection applies for IT / managers (§15.2).

### 12.3 `GET /audit-logs/event-codes`

Purpose: catalogue for filter dropdown. Authz: any role allowed to view audit; returns only codes the role can see. Response `data: [{ code, category, entityType, label }]`.

### 12.4 `GET /transfers/:transferId/audit-logs`

Purpose: timeline of a transfer (SPEC-006/007/014 component). Authz: caller must be authorised for the transfer per SPEC-002 (Employee: own transfer; RM/RcvM/HR/IT: scope; previous assignee per FR-013.22; SA all) **and** each row is filtered by role visibility (Employee: `employeeVisible` events only). Out-of-scope transfer → 403 `FORBIDDEN`. Pagination as 12.1; default order ascending by `occurredAt` for timelines.

### 12.5 `POST /audit-logs/exports` (Super Admin only)

| Item | Value |
|---|---|
| Purpose | Export filtered audit logs |
| Authz | SUPER_ADMIN only. Any other role → 403 `FORBIDDEN` + `AUTHZ_ACCESS_DENIED` row. GET alias intentionally not provided (no shareable links) |
| Request | `{ "format": "CSV", "filters": { …same keys as 12.1, no paging }, "reason": "<optional remarks, ≤ 500 chars>" }` |
| Behaviour | 1) validate, 2) write `AUDIT_EXPORT_REQUESTED` in a committed transaction (fail-closed: no row → no export), 3) open `REPEATABLE READ READ ONLY` transaction with watermark `id ≤ max(id)` at start, 4) stream CSV with `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="audit-export-<UTC timestamp>.csv"`, `Cache-Control: no-store`, 5) on end write `AUDIT_EXPORT_COMPLETED` (row_count, sha256 of stream, duration) or `AUDIT_EXPORT_FAILED` |
| Validation | `format` ∈ allowed set (TDD-013.06); row cap (TDD-013.07) → 422 `EXPORT_TOO_LARGE` `[PROPOSED]` with a message to narrow filters |
| CSV safety | Cells beginning `=`, `+`, `-`, `@`, TAB or CR are prefixed with `'`; JSON columns serialised as compact JSON strings; header row fixed; UTF-8 BOM optional (TDD-013.06) |
| Status | 200, 400, 401, 403, 422, 500 |

### 12.6 Integrity (Super Admin only)

- `GET /audit-logs/integrity` → `{ lastSealId, lastSealedAt, unsealedRowCount, lastVerification: { at, result } }`.
- `POST /audit-logs/integrity/verify` body `{ "fromSealId"?, "toSealId"? }` → 202/200 with `{ result: "OK"\|"FAILED", checkedSeals, firstBadSealId?, details[] }`; writes `AUDIT_INTEGRITY_VERIFIED` or `AUDIT_INTEGRITY_FAILURE`.
- Other roles → 403.

### 12.7 Forbidden verbs

Routes for `PUT/PATCH/DELETE/POST` (except 12.5/12.6) on `/audit-logs*` and `/transfers/:id/audit-logs` do not exist; the router answers 405 `METHOD_NOT_ALLOWED` with `Allow: GET` and logs at warn level. No internal service exposes update/delete.

## 13. Frontend Implementation

Paths (Next.js App Router, `frontend/src/app/...`, shell and list patterns from SPEC-003):

| Path | Content |
|---|---|
| `frontend/src/app/(admin)/audit-logs/page.tsx` | Audit Logs screen |
| `frontend/src/app/(admin)/audit-logs/[id]/page.tsx` | Optional deep-link to a detail (renders the drawer content) |
| `frontend/src/components/audit/AuditLogTable.tsx` | Table with status/outcome badges, pagination, sortable `occurredAt` |
| `frontend/src/components/audit/AuditFilterPanel.tsx` | Filters (actor, role, action, entity, transfer id/reference, date range, status, outcome, category, admin-intervention) with URL query sync |
| `frontend/src/components/audit/AuditDetailDrawer.tsx` | Full record, previous/new diff, remarks, request id |
| `frontend/src/components/audit/AuditExportDialog.tsx` | Super Admin only: confirmation dialog `[BRD-002 sensitive action]`, shows applied filters, download, progress, error |
| `frontend/src/components/audit/IntegrityBanner.tsx` | Super Admin only: last seal, verify button, failure banner |
| `frontend/src/components/audit/TransferAuditTimeline.tsx` | Vertical timeline for transfer detail pages |

Behaviour:
- Role-aware navigation shows "Audit Logs" only to roles permitted by §6 (UX only; backend is authoritative `[BRD-026]`).
- Export button rendered only for Super Admin; if forced via URL/API for others the backend returns 403 (shown as no-access state).
- States: loading skeleton, empty ("No audit records match the filters"), error with `requestId`, no-access (403), expired session (401 → login).
- Previous/new value diff rendered from `changedFields`; large JSON collapsed; no raw token-like strings can arrive (backend guarantee).
- Timestamps shown in business time zone with UTC tooltip `[PROPOSED]`.
- Accessibility `[NFR-008]`: table headers with scope, keyboard-operable filters/drawer (focus trap, Esc), labelled inputs, status conveyed by text not colour alone.
- Responsive desktop/tablet; filter panel collapses.

## 14. Validation Rules

| Field | Rule |
|---|---|
| `page` | integer ≥ 1; `pageSize` 1–100 (default 20) |
| `dateFrom/dateTo` | valid ISO-8601; `dateFrom ≤ dateTo`; stored UTC; business-zone day boundaries when date-only |
| `eventCode`, `category`, `outcome`, `entityType`, `actorRole` | must be members of the catalogue/enum; else 400 |
| `transferId`, `employeeId`, `actorUserId` | positive integers; `transferReference`, `actorUserCode` pattern-checked |
| `q` | ≤ 100 chars, trimmed, parameterised |
| `format` | ∈ allowed export formats |
| `reason` (export) | optional ≤ 500 chars |
| Emitted event | `event_code` registered; payload passes allowlist schema; mandatory-reason events (reject, clarification, withdraw, block, cancel, reassign, manual release, HR change) require non-empty `remarks` — the owner spec validates, `AuditService` re-asserts for catalogue entries flagged `remarksRequired` |
| Unknown keys | rejected (400 for queries; `AUDIT_PAYLOAD_INVALID` programming error for emitters) |

## 15. Authorization & Security Rules

### 15.1 Order of checks `[BRD-026]`
Authenticated user → role → organisation scope → resource → action, every audit request. 401 missing/invalid/expired; 403 not permitted. The frontend is never relied on.

### 15.2 Per-role visibility `[PROPOSED]`, role scope data via `ScopeResolver` `[TDD-REQUIRED]` (TDD-013.03)

| Role | Row visible when | Entity/event classes | Field projection |
|---|---|---|---|
| SUPER_ADMIN | always | all incl. SECURITY, AUTH, ADMIN, AUDIT_* | full (plus `rowHash`, `ipAddress`) |
| HR | row's `scope_location_ids` ∩ HR location scope ≠ ∅ (assigned location/organisation, SPEC-003), OR HR is a participant (ACTOR, HR_ASSIGNED, PREVIOUS_ASSIGNEE) | TRANSFER, EMPLOYEE (profile/org fields), VACANCY, VACANCY_RESERVATION, DOCUMENT, PAYROLL_ACTIVITY, own actions. Excluded: USER credential/lock events of others, AUTH_*, MASTER_*, CONFIG_*, AUDIT_* | full for visible rows |
| IT | participant IT_ASSIGNED/PREVIOUS_ASSIGNEE, or `scope_location_ids` ∩ IT location scope for IT-visible codes | IT_TASK, IT_FINAL_APPROVED, TRANSFER_BLOCKED/RESUMED/REASSIGNED for IT stages, TRANSFER_COMPLETED | IT-visible allowlist of fields only (minimum employee information `[Business Rules]`); salary/payroll/clarification text removed |
| REPORTING_MANAGER | `subject_user_id` ∈ assigned employees (reporting hierarchy, SPEC-004) or participant | TRANSFER/clarification/approval/rejection events of those employees; no USER/AUTH/MASTER | transfer-decision fields; no IP, no credential/lock |
| RECEIVING_MANAGER | transfer routed to its target team scope (mapping `[TDD-REQUIRED]`, SPEC-003) or participant (incl. re-approval decisions) | TRANSFER events incl. HR org changes with previous/new values `[BRD-024]` | as above |
| EMPLOYEE | no `/audit-logs`; timeline only for own transfer | events flagged `employeeVisible` in catalogue (submission, approvals, clarification, rejection reason as policy permits, completion) `[TDD-REQUIRED]` | employee-safe fields; no other users' credentials/IP |

Rules:
- The predicate is built server-side and ANDed with the user's filters; `LIMIT/OFFSET` applies after the predicate.
- Explicit entity filters/`:id` access go through `AuthorizationService.authorize(ctx,{resource:'AUDIT_LOG'|'TRANSFER', action:'VIEW', target})`; failure = 403 without leaking content (BRD-026).
- Previous assignee: participant rows for the reassigned task keep visibility; action rights are removed by SPEC-007/010 (FR-013.22).
- A user may always see rows where they are the actor (own actions) within their role's entity classes `[PROPOSED]`.

### 15.3 Export security
Super Admin only (BRD-037); re-authentication prompt not required (not in BRD; TDD-013.07 lists as optional hardening). No export is persisted on the server; no URL is created.

### 15.4 Tamper and credential protection
See FR-013.05, FR-013.08, FR-013.09. Seal hashes may be mirrored outside the DB (TDD-013.11).

### 15.5 Logging
Application logs follow SPEC-001 redaction; audit-related log lines contain ids and codes only.

## 16. Workflow / State Transition Rules

Not applicable as a state machine — SPEC-013 introduces no workflow status or transition and never changes a transfer status. It **records** `previous_status` and `new_status` for every transition made by `WorkflowEngine.transition` (SPEC-007), including statuses `DRAFT … CANCELLED` of the canonical set, Block/Resume pre-block stored status (`details.blockedFromStatus`), and rejected attempts (`outcome=DENIED`, status unchanged: `previous_status = new_status = current`). Vacancy status, account status and Receiving Manager configuration changes use the same fields with their own code sets.

## 17. Transaction & Concurrency Rules

| # | Rule |
|---|---|
| TR-013.01 | Material events: `AuditService.record(event,{trx})` inside the business transaction; the same `COMMIT` persists both. Audit insert error → exception → rollback of the whole business action → HTTP 500 `AUDIT_WRITE_FAILED` `[PROPOSED]` (TDD-013.02) |
| TR-013.02 | Denials/login failures: `recordIndependent` in its own short transaction; failure → error log + spool; the 401/403 response is unaffected. Login failure counter increment, lock and `AUTH_LOGIN_FAILED`/`AUTH_ACCOUNT_LOCKED` rows share one transaction so a lock can never be unaudited |
| TR-013.03 | Document view/download: `DOCUMENT_VIEWED/DOWNLOADED` committed before the file stream starts (fail-closed) `[PROPOSED]` |
| TR-013.04 | Notification-failure events: notification worker's own transaction; failures logged, never affect workflow `[BRD-036]` |
| TR-013.05 | Idempotency: `event_uuid` UNIQUE with `ON CONFLICT DO NOTHING`; retried handlers don't duplicate rows |
| TR-013.06 | Ordering: `id` identity + DB `clock_timestamp()`; commit order may differ from id order, so consumers sort by `(occurred_at, id)`; the sealer uses `xact_id` (not id) to avoid skipping late commits |
| TR-013.07 | Export reads inside a `REPEATABLE READ READ ONLY` transaction with a fixed `id` watermark: consistent snapshot, no locks on writers |
| TR-013.08 | Sealer holds an advisory lock; seals are inserted atomically per batch; never blocks audit writers (writers do not touch seals) |
| TR-013.09 | No audit write takes a global lock (no single-row hash-chain contention) — chaining happens asynchronously at batch level |
| TR-013.10 | Audit writes add one INSERT (+ participants) per action; participants inserted via single multi-row statement to bound overhead |

## 18. Audit Requirements

### 18.1 Common envelope (every event)

`event_uuid, occurred_at, event_code, category, outcome, action, actor_type, actor_user_id, actor_login_id, actor_display_name, actor_role (at time), entity_type, entity_id, entity_ref, request_id, source, scope_location_ids/scope_department_ids (where derivable), schema_version`. The tables below list only the **additional** required fields (`prev`/`new` = previous/new value; `pS`/`nS` = previous/new status; `rem` = remarks mandatory; `subj` = subject user; `tr` = transfer_request_id + reference).

Category legend: B = BUSINESS, W = WORKFLOW, A = ADMIN, S = SECURITY. "Adm" = sets `is_administrative_intervention` when performed by Super Admin on someone else's workload.

### 18.2 Authentication & security (SPEC-002 emits; denial writers owned here)

| Event code | Cat | Trigger | Extra fields | BRD |
|---|---|---|---|---|
| AUTH_LOGIN_SUCCESS | S | successful login `[PROPOSED]`, TDD-013.08 | ip, firstLogin(bool) | BRD-022 |
| AUTH_LOGIN_FAILED | S | failed login (bad password, unknown user, locked, deactivated) | attemptedUserId (format-checked, FR-013.06), reasonCode, failedAttemptCount, ip | BRD-037 |
| AUTH_ACCOUNT_LOCKED | S | 5th consecutive failure | subj, lockedUntil, failedAttempts=5 | BRD-025, BRD-037 |
| AUTH_ACCOUNT_LOCK_EXPIRED | S | lock expired at next attempt (30 min) | subj, lockedUntil | BRD-025 |
| AUTH_ACCOUNT_UNLOCKED | A | Super Admin unlock | subj, rem optional, Adm | BRD-008, BRD-037 |
| AUTH_PASSWORD_CHANGED_FIRST_LOGIN | S | forced first-login change | subj (no passwords) | BRD-008 |
| AUTH_PASSWORD_CHANGED | S | self-service change | subj | BRD-022 |
| AUTH_FIRST_LOGIN_CHANGE_BYPASS_BLOCKED | S | protected API called before mandatory change | endpoint, method | BRD-006, BRD-039 |
| AUTH_PASSWORD_RESET_BY_ADMIN | S/A | admin credential reset (see also USER_CREDENTIALS_RESET) | subj, sessionsInvalidatedCount, Adm | BRD-007, BRD-037 |
| AUTH_SESSION_EXPIRED | S | 30-min idle timeout | sessionRefId (not the token) | BRD-025 |
| AUTH_LOGOUT | S | logout | – | BRD-022 `[PROPOSED]` |
| AUTH_SESSIONS_INVALIDATED | S | reset/deactivation invalidates sessions | subj, reason(RESET/DEACTIVATION), count | BRD-025 |
| AUTH_ACCESS_DENIED_ACCOUNT_STATE | S | locked/deactivated user rejected on protected API | subj, accountStatus, endpoint | BRD-025, BRD-039 |
| AUTHZ_ACCESS_DENIED | S | any 403 on protected resource/endpoint | outcome=DENIED, resourceType, resourceId, requestedAction, denyReasonCode (ROLE/SCOPE/RESOURCE/ACTION/STAGE), endpoint, method — **no restricted data of the target** | BRD-026, BRD-037 |
| WORKFLOW_INVALID_TRANSITION_ATTEMPT | S | 403 `INVALID_WORKFLOW_TRANSITION` | outcome=DENIED, tr, pS=nS=current status, attemptedAction, rejectionReason | BRD-027, BRD-OQ-14(d) |

### 18.3 User lifecycle & credentials (SPEC-004 / SPEC-002)

| Event code | Cat | Trigger | Extra fields | BRD |
|---|---|---|---|---|
| USER_CREATED | A | Super Admin creates user | subj, userCode, role, profile summary (name, email, dept, designation, location, reporting manager, HR, IT); `credentialsGenerated=true`; **no passwords** | BRD-004, BRD-008, BRD-022 |
| USER_CREDENTIALS_DELIVERY_QUEUED | A | credential email enqueued | subj, outboxId, channel=EMAIL | BRD-005 |
| USER_PROFILE_UPDATED | A | profile/mapping edit | subj, prev/new, changedFields | BRD-022 |
| USER_MAPPING_CHANGED | A | reporting manager, assigned HR/IT change | subj, prev/new | BRD-016, BRD-022 |
| USER_EMPLOYMENT_STATUS_CHANGED | A | employment status edit | subj, pS/nS | BRD-029 |
| USER_ROLE_CHANGED | A/S | role/user-role mapping change `[BRD-037 role changes]` | subj, prev/new role, rem, Adm | BRD-037, BRD-010 |
| USER_PERMISSION_CHANGED | A/S | permission/scope change | subj, prev/new scope, rem | BRD-037 |
| USER_ACTIVATED / USER_DEACTIVATED | A | account activate/deactivate | subj, pS/nS (account status), rem, Adm | BRD-007, BRD-008 |
| USER_CREDENTIALS_RESET | A/S | admin reset (new temp password generated) | subj, mustChangePassword=true; **no password** | BRD-007, BRD-008, BRD-037 |

### 18.4 Master data & configuration (SPEC-003 / SPEC-007 / SPEC-014)

| Event code | Cat | Trigger | Extra fields | BRD |
|---|---|---|---|---|
| MASTER_LOCATION_CREATED / _UPDATED / _ACTIVATED / _DEACTIVATED | A | location master change | entity, prev/new | BRD-010, BRD-022 |
| MASTER_DEPARTMENT_CREATED / _UPDATED / _ACTIVATED / _DEACTIVATED | A | department/BU master | same | BRD-010 |
| MASTER_DESIGNATION_CREATED / _UPDATED / _ACTIVATED / _DEACTIVATED | A | designation master | same | BRD-010 |
| SCOPE_MAPPING_CHANGED | A/S | HR/IT location scope, Receiving Manager scope mapping | subj, prev/new, Adm | BRD-016, BRD-037 |
| CONFIG_RECEIVING_MANAGER_STAGE_CHANGED | A | enable/disable Receiving Manager stage | prev/new, rem optional | BRD-012 |
| CONFIG_DATE_CHANGE_REAPPROVAL_CHANGED | A | toggle + configured approver/stage | prev/new | BRD-031 |
| CONFIG_ESCALATION_CHANGED | A | escalation settings (SPEC-014) | prev/new | BRD-023 |

### 18.5 Vacancy (SPEC-005, driven by SPEC-008/009/010)

| Event code | Cat | Trigger | Extra fields | BRD |
|---|---|---|---|---|
| VACANCY_CREATED / VACANCY_UPDATED | B | vacancy master | entity_ref, prev/new | BRD-017 |
| VACANCY_STATUS_CHANGED | B | Open/Full/On Hold/Closed | pS/nS, rem | BRD-017, BRD-028 |
| VACANCY_CAPACITY_CHANGED | B | total capacity edit | prev/new, rem | BRD-028 |
| VACANCY_RESERVED | B/W | HR validate & approve | vacancy, tr, subj, capacityReserved, availableAfter | BRD-028 |
| VACANCY_RESERVATION_RELEASED | B/W | auto-release on Rejected/Withdrawn/Cancelled | vacancy, tr, subj, capacityReleased, releaseReason(REJECTED/WITHDRAWN/CANCELLED) | BRD-028 |
| VACANCY_RESERVATION_MANUALLY_RELEASED | B/A | HR(in scope)/SA manual release | vacancy, tr, subj, capacityReleased, releasedBy role, rem, Adm if SA | BRD-028, BRD-OQ-15(c) |
| VACANCY_CHANGED_FOR_TRANSFER | B/W | HR changes vacancy (atomic) | oldVacancy, newVacancy, tr, rem | BRD-028 step 7 |
| VACANCY_ALLOCATION_FINALISED | B | Completed → filled | vacancy, tr, filledAfter | BRD-028 |
| VACANCY_RESERVATION_FAILED | B | capacity unavailable (409) | outcome=FAILED, vacancy, tr, reasonCode | BRD-028, BRD-039 |
| VACANCY_RESUME_VALIDATION_FAILED | B/W | resume revalidation failure (stays Blocked) | tr, failedChecks[] | BRD-OQ-15(a) |

### 18.6 Transfer lifecycle (SPEC-006/007/008/009/010)

| Event code | Cat | Trigger | Extra fields | BRD |
|---|---|---|---|---|
| TRANSFER_SUBMITTED | W | Employee submit | tr, pS=DRAFT, nS, proposed org values (new), effectiveDate | BRD-027, BRD-022 |
| TRANSFER_SUBMISSION_REFUSED | W | 409 `ACTIVE_TRANSFER_ALREADY_EXISTS` or ineligible (`outcome=DENIED`) | subj, reasonCode, existingTransferId | BRD-030, BRD-029 |
| TRANSFER_DRAFT_SAVED | B | Draft create/save `[PROPOSED]`, TDD-013.13 | tr | BRD-032 |
| TRANSFER_APPROVED | W | Reporting/Receiving Manager approve | tr, pS/nS, stage, remarks | BRD-027 |
| TRANSFER_REJECTED | W | any reject (RM, RcvM, HR, Re-approval) | tr, pS/nS=REJECTED, **rem**, rejectedBy, reservationReleased | BRD-033, BRD-027 |
| TRANSFER_CLARIFICATION_REQUESTED | W | request clarification | tr, pS/nS=INFO_REQUIRED, **rem** (question), requestedBy, returnStage | BRD-034 |
| TRANSFER_CLARIFICATION_RESPONDED | W | response | tr, pS=INFO_REQUIRED/nS=return stage, response summary, respondedBy | BRD-034 |
| TRANSFER_WITHDRAWN | W | Employee withdraw | tr, pS, nS=WITHDRAWN, **rem**, withdrawnBy, exceptionalReservationReleased | BRD-027, BRD-OQ-12 |
| TRANSFER_STATUS_CHANGED | W | any transition without a dedicated code (e.g. COMPLETE_HR_PROCESSING) | tr, pS/nS, action | BRD-027 |
| TRANSFER_EDITED_POST_SUBMISSION | W | HR/SA field change after submission | tr, fieldNames, prev/new, **rem**, reapprovalTriggered | BRD-032 |
| TRANSFER_REAPPROVAL_TRIGGERED | W | BRD-024 loop started | tr, changedFields, pS=HR_PROCESSING, nS=PENDING_RECEIVING_MANAGER_REAPPROVAL | BRD-024 |
| TRANSFER_REAPPROVAL_DECISION | W | Receiving Manager decision on re-approval | tr, decision, decision remarks | BRD-024 |

### 18.7 HR, Payroll, IT (SPEC-008/009)

| Event code | Cat | Trigger | Extra fields | BRD |
|---|---|---|---|---|
| HR_VALIDATED_APPROVED | W | HR validate & approve | tr, pS=PENDING_HR_REVIEW, nS=HR_PROCESSING, eligibilityChecks | BRD-013, BRD-029 |
| HR_ORG_FIELD_CHANGED | W | HR change of Dept/BU, Designation, Location, Reporting Manager | tr, changedField, prev, new, **rem**, reapprovalTriggered, changedBy | BRD-020, BRD-024 |
| HR_ORG_METADATA_UPDATED | W | other org metadata/payroll reference assignment | tr, prev/new, rem | BRD-020 |
| TRANSFER_EFFECTIVE_DATE_CHANGED | W | HR/SA date change or expired-date correction | tr, prev/new, **rem**, reapprovalTriggered, Adm if SA | BRD-031 |
| HR_PROCESSING_COMPLETED | W | Complete HR Processing | tr, pS/nS=PAYROLL_PROCESSING, hrConfirmation | BRD-027 |
| PAYROLL_ACTIVITY_ASSIGNED | W | payroll activity created/assigned | tr, assignee | BRD-020 |
| PAYROLL_ACTIVITY_COMPLETED | W | Mark payroll completed | tr, payrollStatus, completedBy, reference, remarks, pS/nS=PENDING_IT_ACTION | BRD-027(c), BRD-026 |
| IT_TASK_ASSIGNED | W | IT task assigned | tr, assignee | BRD-014 |
| IT_TASK_STATUS_CHANGED | W | In Progress / Completed / Blocked | tr, taskId, pS/nS (task), rem if blocked | BRD-014 |
| IT_NO_ACTION_REQUIRED | W | IT selects No IT Action Required | tr, **rem**, pS/nS=PENDING_IT_FINAL_APPROVAL | BRD-014, BRD-027 |
| IT_FINAL_APPROVED | W | IT Final Approval | tr, pS=PENDING_IT_FINAL_APPROVAL, nS=COMPLETED, gateChecks (5 conditions) | BRD-027, BRD-026 |
| TRANSFER_COMPLETED | W | Completed (same transaction as IT_FINAL_APPROVED) | tr, effectiveDate | BRD-019 |

### 18.8 Exception controls (SPEC-010)

| Event code | Cat | Trigger | Extra fields | BRD |
|---|---|---|---|---|
| TRANSFER_BLOCKED | W/A | Block (SA / HR / IT) | tr, pS, nS=BLOCKED, `details.blockedFromStatus`, **rem**, Adm if SA | BRD-027 |
| TRANSFER_RESUMED | W/A | Resume | tr, pS=BLOCKED, nS=blockedFromStatus, remarks, revalidation result | BRD-027, BRD-OQ-15 |
| TRANSFER_CANCELLED | W/A | Cancel (SA / HR in scope) | tr, pS, nS=CANCELLED, **rem**, reservationReleased, tasksCancelled | BRD-027, BRD-028 |
| TRANSFER_REASSIGNED | W/A | Super Admin reassign | tr, stage, previousAssignee, newAssignee, **rem**, Adm (status unchanged) | BRD-035 |
| TRANSFER_ACTION_REFUSED_FINAL_STATE | S | edit/approve/cancel of Rejected/Completed/Withdrawn/Cancelled | covered by WORKFLOW_INVALID_TRANSITION_ATTEMPT (no separate code) | BRD-033, BRD-039 |

### 18.9 Documents (SPEC-011)

| Event code | Cat | Trigger | Extra fields | BRD |
|---|---|---|---|---|
| DOCUMENT_UPLOADED | B | upload success | documentId, category/type, uploadedBy, upload time, subj, tr, size, mime (no file path secrets) | BRD-021 |
| DOCUMENT_UPLOAD_REJECTED | S | 413/415 validation failure | outcome=FAILED, errorCode (FILE_SIZE_EXCEEDED / UNSUPPORTED_FILE_TYPE / INVALID_FILE_TYPE), tr | BRD-021 `[PROPOSED]` |
| DOCUMENT_VIEWED / DOCUMENT_DOWNLOADED | B | authorised access | documentId, category, subj, tr | BRD-021, BRD-026 |
| (document access denied) | S | covered by AUTHZ_ACCESS_DENIED with resourceType=DOCUMENT | | BRD-021, BRD-039 |

### 18.10 Notifications & audit-system events

| Event code | Cat | Trigger | Extra fields | BRD |
|---|---|---|---|---|
| NOTIFICATION_DELIVERY_FAILED | B | delivery attempt failed (SPEC-012 worker) | notificationId, eventCode, channel, attempt, errorClass (no body, no credentials) | BRD-036 |
| NOTIFICATION_RETRIED | B | retry executed | notificationId, attempt, result | BRD-036 |
| NOTIFICATION_PERMANENTLY_FAILED | B | retries exhausted | notificationId, attempts | BRD-036 |
| AUDIT_EXPORT_REQUESTED | S/A | export started | filters, format, requestedBy (Super Admin) | BRD-037 |
| AUDIT_EXPORT_COMPLETED | S/A | export finished | filters, format, rowCount, startedAt, finishedAt, fileSha256 | BRD-037 |
| AUDIT_EXPORT_FAILED | S/A | export failed/aborted | filters, format, rowsStreamed, errorClass | BRD-037 |
| AUDIT_INTEGRITY_VERIFIED / AUDIT_INTEGRITY_FAILURE | S | integrity check | range, result, firstBadSealId | NFR-005 |
| AUDIT_SPOOL_IMPORTED | S | spool reconciliation | count, files | FR-013.14 |

Totals: ≈ 100 distinct codes (family wildcards expand to the listed variants). The catalogue code file is the master; this table is the review artefact; TASK-013.17 fails CI on drift.

### 18.11 Fields never captured (all events)
Password, temporary password, reset password, password hash, access/refresh token, JWT, session id, `Authorization`/`Cookie` headers, OTP, secrets/API keys, full email body, document content, document storage path, other users' personal data not needed for the event.

## 19. Notification Requirements

| Event | Recipient | Channel | Trigger task | BRD |
|---|---|---|---|---|
| None mandated by this SPEC | – | – | – | BRD-036 lists twelve events; none concerns audit |

Notes: (1) Notification failure rows (§18.10) are audit records written by the SPEC-012 worker. (2) `AUDIT_INTEGRITY_FAILURE` is surfaced in the Super Admin UI banner and error logs; whether it should also notify Super Admin is `[TDD-REQUIRED]` TDD-013.11. (3) Audit rows never copy notification bodies (credential emails contain a temporary password).

## 20. Error & Edge Cases

| Case | Handling |
|---|---|
| Audit insert fails inside business transaction | Rollback business change, 500 `AUDIT_WRITE_FAILED`, error log with requestId (TR-013.01) |
| Audit insert fails for a denial/login failure | Denial still returned; error log + spool; reconciler imports later (TR-013.02) |
| Unknown `event_code` or invalid payload | Programming error `AUDIT_EVENT_UNKNOWN` / `AUDIT_PAYLOAD_INVALID`: in prod fail-closed for material actions; blocked by CI conformance harness |
| Secret detected in payload | Value redacted, `redaction_count` > 0; test env throws; a redaction in prod triggers a warn-level log naming the event code (not the value) |
| Non-Super-Admin export | 403 + `AUTHZ_ACCESS_DENIED` |
| Out-of-scope record by id | 403 (no existence leak) |
| Filter combination returns >export cap | 422 `EXPORT_TOO_LARGE` |
| Export client disconnects mid-stream | `AUDIT_EXPORT_FAILED` with rowsStreamed |
| Same event replayed | `ON CONFLICT DO NOTHING`, no duplicate |
| Late-committing transaction relative to sealer | Not sealed until `xact_id < xmin`; never skipped |
| Seal verification mismatch | `AUDIT_INTEGRITY_FAILURE`, banner, error log |
| Actor deactivated/role changed later | History unchanged (snapshots) |
| Clock skew / DST | UTC storage, business-zone display |
| Partition missing for a future month | Default partition + alert; job creates partitions ahead |
| Employee tries `/audit-logs` | 403 |
| Empty result | 200 with `data: []` |
| Mutating verb on `/audit-logs` | 405 |

## 21. Acceptance Criteria

| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-013.AC01 | Given any catalogue action by any role, when it succeeds, then one audit row exists with actor, role at time, action, entity, date/time and, where applicable, previous/new value, previous/new status and remarks | BRD-037, BRD-022 |
| SPEC-013.AC02 | Given a user whose role is later changed, when old audit rows are read, then `actor_role` still shows the role at the time | BRD-037 |
| SPEC-013.AC03 | Given a business transaction that rolls back, when it ends, then no audit row for it exists; given one that commits, then its audit row exists | BRD-022 |
| SPEC-013.AC04 | Given the audit table, when the application role attempts UPDATE, DELETE or TRUNCATE, then the DB rejects it and the row is unchanged | BRD-037, NFR-005 |
| SPEC-013.AC05 | Given a data change, when the same entity is changed again, then a new audit row is appended and the earlier row is byte-identical | BRD-037 |
| SPEC-013.AC06 | Given sealed audit rows, when `verify` runs on an untouched DB, then result OK; after an out-of-band row modification or deletion, then result FAILED and `AUDIT_INTEGRITY_FAILURE` is audited | NFR-005 |
| SPEC-013.AC07 | Given account creation and credential reset flows, when audit rows, exports and logs are scanned, then no plaintext/temporary/reset password, hash or token appears | BRD-037, BRD-005, NFR-003 |
| SPEC-013.AC08 | Given an event payload with a key such as `password`/`token`, when recorded, then it is rejected (test) or redacted (prod) with `redaction_count` > 0 | BRD-037 |
| SPEC-013.AC09 | Given Super Admin, when listing audit logs, then all rows are visible incl. SECURITY and AUTH events | BRD-037 |
| SPEC-013.AC10 | Given HR assigned to Location L, when listing, then only rows within L's scope (and own actions) are returned | BRD-037 |
| SPEC-013.AC11 | Given a Reporting Manager, when listing, then only rows of assigned employees' transfers are returned | BRD-037, BRD-012 |
| SPEC-013.AC12 | Given IT assigned to an IT task, when viewing its audit rows, then fields are limited to the IT-visible allowlist | BRD-014, BRD-037 |
| SPEC-013.AC13 | Given a Receiving Manager, when listing, then only transfers routed to its scope appear, including re-approval decisions | BRD-012, BRD-024 |
| SPEC-013.AC14 | Given a task reassigned away from user A, when A views the transfer's audit/history, then prior rows remain visible and A cannot act | BRD-035 |
| SPEC-013.AC15 | Given filters actor, role, action, entity, transfer id, date range and status, when applied (alone or combined), then results match and are paginated | BRD-037 |
| SPEC-013.AC16 | Given Super Admin and valid filters, when exporting, then a CSV is produced and `AUDIT_EXPORT_REQUESTED` and `AUDIT_EXPORT_COMPLETED` rows record who, filters, row count and time | BRD-037 |
| SPEC-013.AC17 | Given an invalid workflow transition (HTTP 403 `INVALID_WORKFLOW_TRANSITION`), when processed, then a `WORKFLOW_INVALID_TRANSITION_ATTEMPT` row records user, role, transfer id, current status, attempted action, time and reason, and the status is unchanged | BRD-027 |
| SPEC-013.AC18 | Given an authorization denial (403), when it occurs, then an `AUTHZ_ACCESS_DENIED` row exists without restricted target data | BRD-026 |
| SPEC-013.AC19 | Given 5 failed logins, when the 5th fails, then `AUTH_LOGIN_FAILED` ×5 and `AUTH_ACCOUNT_LOCKED` exist; admin unlock yields `AUTH_ACCOUNT_UNLOCKED` | BRD-025, BRD-037 |
| SPEC-013.AC20 | Given user creation, activation/deactivation, credential reset and first-login password change, when done, then each has its audit row without passwords | BRD-008 |
| SPEC-013.AC21 | Given block, resume, cancel, reassign, manual vacancy release, HR org change, effective-date change, IT final approval, Payroll completion, when done, then each audit row has the fields listed in §18 | BRD-027, BRD-028, BRD-035, BRD-024, BRD-031 |
| SPEC-013.AC22 | Given a document upload, view and download, when done, then audit rows carry document, category, user, time, employee and transfer reference | BRD-021 |
| SPEC-013.AC23 | Given a notification delivery failure, when it occurs, then the transfer action remains committed and a `NOTIFICATION_DELIVERY_FAILED` row exists | BRD-036 |
| SPEC-013.AC24 | Given the Audit Logs screen, when opened by each allowed role, then list, filters, detail drawer render with loading/empty/error/no-access states | BRD-003, BRD-002 |
| SPEC-013.AC25 | Given the catalogue, when CI runs the conformance harness, then every emitted code is registered and every registered code is covered by an emitting test | BRD-022 |
| SPEC-013.AC26 | Given the audit insert fault is injected, when a material action executes, then the action is rolled back (fail-closed) and `AUDIT_WRITE_FAILED` is returned | FR-013.14 |
| SPEC-013.AC27 | Given large seeded volume, when filtering by date range, transfer id, actor or event code, then the planned index is used (`EXPLAIN`) | NFR-009 (inputs) |
| SPEC-013.AC28 | Given a retry of the same event uuid, when replayed, then no duplicate row | NFR-006 |

## 22. Negative Acceptance Criteria

| ID | Given / When / Then | BRD-039 / BRD |
|---|---|---|
| SPEC-013.NAC01 | Non-Super-Admin (HR, IT, RM, RcvM, Employee) calls `POST /audit-logs/exports` → 403, no data, `AUTHZ_ACCESS_DENIED` written | BRD-037 |
| SPEC-013.NAC02 | Any caller sends PUT/PATCH/DELETE to `/audit-logs` or `/audit-logs/:id` → 405 (route does not exist); rows unchanged — including for Super Admin | BRD-037 |
| SPEC-013.NAC03 | Direct API (Postman) call to `GET /audit-logs/:id` for an out-of-scope row → 403 without row content | BRD-026, BRD-039 |
| SPEC-013.NAC04 | HR requests `transferId` of another location's transfer → 403 (not an empty list) | BRD-039 (other organisation's data) |
| SPEC-013.NAC05 | Reporting Manager requests audit rows of an employee not assigned → 403 | BRD-039 |
| SPEC-013.NAC06 | IT requests audit rows of a transfer outside its tasks/location → 403; in-scope rows hide non-IT fields | BRD-039, BRD-014 |
| SPEC-013.NAC07 | Employee requests another Employee's transfer timeline → 403 | BRD-039 |
| SPEC-013.NAC08 | Employee calls `GET /audit-logs` → 403 | BRD-026 |
| SPEC-013.NAC09 | Unauthenticated/expired token on any audit endpoint → 401 | BRD-026 |
| SPEC-013.NAC10 | Application role executes `UPDATE audit_logs` / `DELETE` / `TRUNCATE` → DB error `AUDIT_IMMUTABLE` | NFR-005 |
| SPEC-013.NAC11 | Planted secret (`password`, `tempPassword`, JWT string, bcrypt hash) in an event payload/remarks → never persisted verbatim | BRD-037 |
| SPEC-013.NAC12 | Failed login with a password pasted into the User ID field → stored as `[INVALID_FORMAT]` | FR-013.06 |
| SPEC-013.NAC13 | Application code containing `AuditLog.destroy/update/truncate` or `UPDATE audit_` → lint/architecture test fails | BRD-037 |
| SPEC-013.NAC14 | Unregistered `event_code` passed to `AuditService.record` → rejected | BRD-022 |
| SPEC-013.NAC15 | Invalid transition attempt (e.g. IT Pending HR Review → Completed) → 403 `INVALID_WORKFLOW_TRANSITION`, status unchanged, audited with `outcome=DENIED` | BRD-027, BRD-039 |
| SPEC-013.NAC16 | HR attempts reassignment / HR cancels IT-blocked request → refused and audited as security event | BRD-027, BRD-035 |
| SPEC-013.NAC17 | Export CSV contains cell starting `=cmd` → neutralised with `'` | BRD-037 (safe export) |
| SPEC-013.NAC18 | Export when `AUDIT_EXPORT_REQUESTED` cannot be written → no data streamed | FR-013.24 |
| SPEC-013.NAC19 | `pageSize=1000`, `dateFrom>dateTo`, unknown filter key → 400 | validation |
| SPEC-013.NAC20 | Previous assignee attempts the task action after reassignment → refused by SPEC-007; their audit view still works | BRD-035 |
| SPEC-013.NAC21 | Audit row inserted by a non-owner role with `row_hash` supplied → trigger overwrites; mismatch verified | NFR-005 |
| SPEC-013.NAC22 | Tampered seal (edited `batch_hash` or deleted row inside sealed range) → `verify` FAILED | NFR-005 |
| SPEC-013.NAC23 | Notification failure does not roll back the transfer and writes no credential/body in audit | BRD-036 |
| SPEC-013.NAC24 | Deactivated or locked user calls audit API → 401/403 per SPEC-002 and `AUTH_ACCESS_DENIED_ACCOUNT_STATE` | BRD-039 |

## 23. Testing Requirements

| Type | Coverage | TC IDs |
|---|---|---|
| Unit | Catalogue schema/allowlist per code; redactor key variants (`Password`, `new_password`, `x-auth-token`, nested/array), value patterns; role-at-time snapshot; participants derivation; CSV escaping; visibility predicate builder per role; keyset cursor | TC-013.01–.12 |
| Integration | AuditService in trx (commit/rollback); independent write + spool; idempotent `event_uuid`; sealer/verifier; partitions inherit privileges/triggers; role privileges as `portal_app`; end-to-end event emission per owner SPEC (conformance) | TC-013.13–.26 |
| API | List/detail/event-codes/timeline/export/integrity: auth matrix 6 roles × endpoint, filters, pagination, 400/401/403/405/422 | TC-013.27–.40 |
| Frontend | Table, filters (URL sync), drawer, export dialog (SA only), timeline, states, a11y (axe), nav gating | TC-013.41–.48 |
| Security | Credential leak scan (DB, export, logs) after flows: create user, reset, first-login, failed logins, notification failure; denylist test; tamper detection; export authz | TC-013.49–.56 |
| Concurrency | Parallel audited transactions (no lost/duplicated rows); export during heavy writes (snapshot consistency); sealer with late commits; two HR approvals both audited | TC-013.57–.60 |
| Workflow | Every transition of the SPEC-007 matrix emits the expected row with correct pS/nS; invalid transitions emit `DENIED` rows; Block/Resume/Cancel/Reassign fields | TC-013.61–.66 |
| Negative | SPEC-013.NAC01–NAC24 each mapped to a TC | TC-013.67–.90 |
| Performance (inputs only) | `EXPLAIN` for each index; seeded volume; no numeric targets asserted (BRD-038 TBC) | TC-013.91–.93 |

Mapping rule: TC-013.NN for each AC/NAC is listed in SPEC-016 traceability; TC IDs above are allocated in blocks and detailed in `.ai-context/test_cases/audit-compliance-security-events.test_cases.md` at test-case drafting.

## 24. Definition of Done

- [ ] Gate 1 approved; TDD-013.01–.20 decided or accepted as defaults
- [ ] Migrations applied (additive) with roles, REVOKEs, triggers, partitions, seals; rollback script exists (but never drops data in prod)
- [ ] Every event code of §18 implemented in the catalogue with allowlist schema; conformance harness green
- [ ] No UPDATE/DELETE/TRUNCATE path; privilege and trigger tests green; tamper test green
- [ ] Credential leak scan and denylist tests green (DB, export, logs)
- [ ] Visibility matrix tests (6 roles × scope) green; 403 without leakage
- [ ] Export Super-Admin-only, audited, CSV-safe; non-SA 403
- [ ] Fail-closed and fault-injection tests green
- [ ] Audit Logs UI complete with all states and accessibility checks
- [ ] Index/EXPLAIN evidence attached; partition plan reviewed
- [ ] ESLint/TypeScript clean; no `console.log`; no hard-coded secrets; no AI-generated comments
- [ ] Gate 2 code review approved; status/dashboard/prompt_history synchronised

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-013.01 | Tamper-resistance mechanism (NFR-005 states the goal only) | Privilege + trigger immutability, per-row SHA-256 `row_hash` (DB trigger), asynchronous chained `audit_seals` verified on demand and nightly; no per-row global chain lock | DB design, sealer job, verification UI |
| TDD-013.02 | Failure policy when the audit write fails | Fail-closed for material actions (rollback + `AUDIT_WRITE_FAILED`); denials/login failures independent write + spool, denial still returned; document view audited before serving | Availability vs completeness trade-off; all feature specs |
| TDD-013.03 | Exact per-role visibility (entity classes, scope derivation, field projection) for HR/IT/RM/RcvM | Table in §15.2 | Privacy (NFR-007), `ScopeResolver` data from SPEC-003/004 |
| TDD-013.04 | Does the Employee see any audit information (Audit Logs module vs own timeline)? Which events are employee-visible? | No Audit Logs module; own-transfer timeline of `employeeVisible` events only | UI, API 12.4, privacy |
| TDD-013.05 | Extent of the previous assignee's visibility after reassignment (until reassignment, or for the transfer's whole life) | Whole transfer history within scope, read-only | Participants rows, privacy |
| TDD-013.06 | Export format(s) | CSV (RFC 4180, UTF-8, formula-safe); JSON/XLSX deferred | Export service, UI |
| TDD-013.07 | Export row cap, sync streaming vs async job, re-authentication before export | Synchronous streaming with configurable `AUDIT_EXPORT_MAX_ROWS`; no re-auth in the BRD baseline; recommended optional password re-entry | Performance, security |
| TDD-013.08 | Are successful logins, 401 rejections and Audit Logs *views* audited? | Successful login audited; 401 only in application logs; Audit Logs reads not audited (denials are) | Volume, privacy |
| TDD-013.09 | Partitioning strategy, cross-partition uniqueness of `event_uuid`, cold-storage of old partitions (no deletion) | Monthly range partitions, uniqueness `(event_uuid, occurred_at)`, never drop; numbers from BRD-038/SPEC-015 | Scale, migrations |
| TDD-013.10 | PostgreSQL version and extensions (`pgcrypto` for `digest`, `xid8`/`pg_current_xact_id` need PG ≥ 13) | Require PG ≥ 13 with `pgcrypto`; else compute `row_hash` in app and seal by `occurred_at` lag | DB baseline (SPEC-001) |
| TDD-013.11 | External anchoring of seal hashes (file on another host, print, WORM) and alert recipients on `AUDIT_INTEGRITY_FAILURE` | Daily seal hash written to a read-only file outside DB; Super Admin in-app alert | Operational procedure |
| TDD-013.12 | Feasibility of separate DB roles (owner/app/sealer) in the local deployment | Three roles; if impossible, triggers + app-layer guards remain and risk is recorded | Deployment (SPEC-015) |
| TDD-013.13 | Are Draft saves audited? | Audit only create-draft and discard; edits in Draft are not material (post-submission edits are, BRD-032) | Volume |
| TDD-013.14 | Display time zone for audit timestamps | Business time zone configured for BRD-031, UTC tooltip | UI |
| TDD-013.15 | 403 vs 404 for out-of-scope or unknown audit id | 403 for non-Super-Admin in both cases; 404 for Super Admin unknown id | Info-leak protection |
| TDD-013.16 | Spool location/format and reconciler cadence | Local JSONL under `AUDIT_SPOOL_DIR`, importer every minute and on start | Resilience |
| TDD-013.17 | Retention of IP/User-Agent (personal data) | Store IP only on SECURITY/login events; no User-Agent | Privacy |
| TDD-013.18 | Remarks free-text search and exact `total` count at large volume | `q` uses `ILIKE` limited to filtered windows; GIN `tsvector` only if needed; `total` optional (`includeTotal=true`), `hasNext` default | Query cost |
| TDD-013.19 | Column-name reconciliation with the SPEC-001 kernel | SPEC-001 names win, 013 adds missing columns additively | Migration conflicts |
| TDD-013.20 | Who may create a "correction" link (`related_audit_id`) | Only system code at business-correction time; no user-facing correction API | Scope of FR-013.04 |

## Out of Scope (this SPEC)

Per BRD Out of Scope: no external HR/Payroll/IT-service-management integration and no automatic HR-system synchronisation (so no integration audit events exist in this phase; the catalogue reserves the extension point, none is introduced); no historical data migration/back-fill of audit data; no new identity provider, MFA or SSO; no payroll calculation engine. Additionally out of this SPEC (not in the BRD): audit log deletion, archival-and-purge or retention policies (the BRD mandates lifetime retention), audit-based analytics/BI dashboards (SPEC-014 only links to the screen), SIEM/log-shipping integration, e-discovery/legal hold, infrastructure backup/monitoring targets (NFR-009, SPEC-015), and notification delivery implementation (SPEC-012). Nothing here introduces any of the BRD Out of Scope items.
