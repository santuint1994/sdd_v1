# SPEC-004 — User Provisioning, Role Assignment & User Administration

## Feature ID
user-provisioning-administration

## Status
Draft — not yet submitted for Gate 1

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| | | | | |

## Intent & Business Goals
Give the Super Admin one controlled, auditable way to bring people into the Internal Transfer portal and keep them correctly mapped afterwards. In a single database transaction the portal creates the login account and the organisational (employee) profile, generates a role-prefixed unique User ID and a strong temporary password, validates duplicates and required organisation mappings against the SPEC-003 masters, shows the credentials once to the authorised administrator, and queues delivery to the user's official company email `[BRD-004, BRD-005, BRD-009, BRD-OQ-02, BRD-OQ-03]`.

After creation the same module owns the employee/organisation profile (per-field ownership between Super Admin and HR `[BRD-029]`), the reporting hierarchy and HR/IT assignments `[BRD-016]`, role assignment and role change, activation/deactivation, administrator credential reset, unlock, role-scoped user lists, and the user-lifecycle audit trail `[BRD-007, BRD-008, BRD-010]`. It is also the slice that lets HR correct transfer-related employee information within scope when an Employee's profile is incomplete (BRD-029 missing-data path).

Scope boundary (to avoid duplication): authentication, password hashing/policy, lockout counters, session invalidation mechanics, first-login forced change and the RBAC engine are **SPEC-002**; master data and HR/IT/Receiving-Manager scope mappings are **SPEC-003**; the notification dispatcher is **SPEC-012**; audit storage/visibility is **SPEC-013**. SPEC-004 calls those capabilities through their service interfaces and owns the user/employee-profile domain, the admin account actions and their UI.

## User Roles & Actors
- **Super Admin** — creates users, edits all profile fields, assigns roles, maps HR/IT/Reporting Manager, activates/deactivates, resets credentials, unlocks `[BRD-010, BRD-004, BRD-007]`.
- **HR** — views employees in its location/organisation scope; corrects transfer-related profile fields (Department/BU, Designation, Location, Reporting Manager) and Employment Status within scope, coordinating with Super Admin for anything outside its authority `[BRD-029]`.
- **Reporting Manager** — read-only list of assigned employees `[BRD-012]`.
- **IT** — minimum employee information needed for an assigned task only `[BRD-014, BRD-016]`.
- **Employee** — read-only view of own profile `[BRD-011]`.
- **Receiving Manager** — no user-administration capability in this SPEC; creation of the account is a gap (TDD-004.02).
- **New user** — recipient of the credentials e-mail; first login and forced password change are SPEC-002.

---

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-004 |
| Title | User Provisioning, Role Assignment & User Administration |
| Purpose | Provision accounts + organisational profiles; maintain profiles, assignments and account lifecycle |
| Business objective | Every user has an individual, correctly mapped, auditable account from day one so that role/scope-based routing (BRD-016, BRD-026) works |
| Version | 0.1 (Draft) |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer (per roster) | Project Manager / Product Owner |
| Task prefix | `TASK-004.MM` |
| Acceptance prefix | `SPEC-004.ACmm` / `SPEC-004.NACmm`; tests `TC-004.mm` |

## 2. Why This SPEC Exists
1. No transfer can be routed until Employees, Reporting Managers, HR and IT users exist with organisation mappings (BRD-016).
2. BRD-004/005/009 define a precise creation flow (role-prefixed ID, temporary password, duplicate validation, controlled transaction, credentials shown once, e-mail delivery, audit) that must be implemented as one coherent unit.
3. BRD-029 makes the portal the operational source of employee/organisation data with per-field ownership; someone must own the profile entity and enforce who may edit which field.
4. BRD-007/008/010 require administrator account actions (activate/deactivate, reset, unlock, role mapping) with confirmation dialogs (BRD-002) and audit.
5. Several creation-related facts are not defined by the BRD (Receiving Manager and Super Admin creation/prefix, employment-status value set, ID format relationship); these are surfaced as `[TDD-REQUIRED]` rather than silently decided.

## 3. BRD Traceability

### 3.1 BRD IDs

| BRD ID | Coverage | Slice owned by SPEC-004 |
|---|---|---|
| BRD-004 | FULL (Receiving Manager / Super Admin variants = TDD-REQUIRED) | Role-prefixed unique ID, strong temp password, duplicate validation, account + profile in one transaction |
| BRD-005 | FULL | Credentials shown once to authorised admin; delivery to official e-mail; password never in logs/audit (delivery mechanics in SPEC-012) |
| BRD-007 | PARTIAL — admin side | Activate/deactivate, admin credential reset, unlock action/UI, lifecycle status changes made by admin. Complexity, lockout counters, idle timeout, forced change enforcement = SPEC-002 |
| BRD-008 | PARTIAL | Audit events for creation, activation/deactivation, reset, unlock (first-login change event is SPEC-002; storage SPEC-013) |
| BRD-009 | FULL | Creation flow Select role → Profile → Validate → Create → Credentials → Deliver → (First login: SPEC-002) → Audit |
| BRD-010 | PARTIAL — user slice | Create HR/IT/Reporting Manager/Employee users with mappings; credentials at creation; user-role mappings; view all employees (Super Admin) |
| BRD-016 | PARTIAL — assignments | Employee↔department/designation/location/Reporting Manager/assigned HR; Reporting Manager→assigned employees + HR mapping; HR/IT scope capture at creation (storage SPEC-003) |
| BRD-029 | PARTIAL — field-ownership slice | Employee profile entity, per-field edit authority, missing-mandatory-data detection, HR correction path, assigned-HR lookup for the incomplete-profile message |
| BRD-002 | PARTIAL | Data tables, filters, status badges, inline validation, confirmation dialogs (deactivation, credential reset), empty/loading/error/no-access states for Users module |
| BRD-001, BRD-006, BRD-025, BRD-026 | Referenced | Consumed from SPEC-002 (not re-specified) |
| BRD-011, BRD-012, BRD-013, BRD-014 | PARTIAL | Own-profile view; assigned-employee views; HR scope view; IT minimal info |
| BRD-022, BRD-037 | PARTIAL | User lifecycle/assignment/credential events emitted (catalogue/visibility SPEC-013) |
| BRD-036 | PARTIAL | Two Email-only events (account created, credential reset) triggered; delivery SPEC-012 |

### 3.2 NFR IDs

| NFR | Coverage | Note |
|---|---|---|
| NFR-001 | PARTIAL | Temp password change enforcement flagged `must_change_password` (enforced by SPEC-002) |
| NFR-002 | PARTIAL | Every endpoint declares role+scope+action to the SPEC-002 authorisation layer |
| NFR-003 | FULL (this slice) | Hash-only storage; no plaintext in DB/logs/reports/audit; credentials only in the one-time response and the protected e-mail path |
| NFR-005 | PARTIAL | Append-only audit via SPEC-001 kernel |
| NFR-007 | PARTIAL | Employee data visible only to authorised roles/scope |
| NFR-008 | PARTIAL | Accessible forms/tables/dialogs |

### 3.3 BRD-OQ

| OQ | How SPEC-004 implements it |
|---|---|
| BRD-OQ-02 | `EMP/MGR/HR/IT` + 6 digits; complexity, admin reset, forced change (policy values consumed from SPEC-002) |
| BRD-OQ-03 | Credentials delivered to the user's official company e-mail via NotificationService (SPEC-012) |
| BRD-OQ-19 | Per-field ownership; HR updates portal data only; no external HR sync; Department/Designation/Location from masters, not free text |
| BRD-OQ-16 | Missing-mandatory-data detection and HR/Super Admin correction path (slice) |
| BRD-OQ-04, -07 | Referenced only (Receiving Manager configuration SPEC-007; HR changes during a transfer SPEC-008) |

### 3.4 Business rules implemented

| Rule (BRD) | FR |
|---|---|
| Role-prefixed unique User ID (BRD-004) | FR-004.01–.03 |
| Strong temporary password, shown only to authorised admin, never logged/audited (BRD-004/005/006/037) | FR-004.10–.16 |
| Official e-mail delivery (BRD-005, OQ-03) | FR-004.17–.19 |
| Duplicate user/employee validation (BRD-004) | FR-004.05–.07 |
| Required mapping validation (BRD-009) | FR-004.08–.09 |
| Per-field ownership (BRD-029) | FR-004.30–.37 |
| Admin actions with confirmation + audit (BRD-002, BRD-007, BRD-008) | FR-004.50–.58, FR-004.60–.66 |

### 3.5 BRD "Acceptance Criteria" bullets covered

| BRD acceptance bullet | Coverage | SPEC-004 AC |
|---|---|---|
| Super Admin can create Employee, Reporting Manager, HR and IT accounts within authorised scope | FULL | AC01–AC05 |
| Account creation generates a unique User ID and strong temporary password per policy | FULL | AC01, AC06, AC07 |
| User must change temporary password at first login; plaintext never in DB/logs/reports/audit | PARTIAL (no plaintext = FULL; forced change = SPEC-002) | AC08, AC09 |
| Super Admin can reset credentials and activate/deactivate accounts | FULL | AC20–AC26 |
| Account lock/unlock and session invalidation on reset/deactivation | PARTIAL (admin action here; invalidation mechanism SPEC-002) | AC22, AC24 |
| Each user sees assigned employees/requests per role and organisation mapping | PARTIAL (employee lists only) | AC30–AC34 |
| Every material configuration, security and workflow action creates the agreed audit record | PARTIAL (user lifecycle slice) | AC40–AC42 |
| Employee data (BRD-029): per-field ownership, masters not free text, no HR sync, missing data handling | PARTIAL | AC12–AC19 |
| UAT: account creation/login, credential reset | PARTIAL | AC01, AC20 |

### 3.6 Negative scenarios (BRD-039)

| BRD-039 row | Coverage | SPEC-004 NAC |
|---|---|---|
| Security: user cannot access another organisation's data outside scope | PARTIAL (user/profile endpoints) | NAC10–NAC13 |
| Security: Employee cannot access another Employee's data | PARTIAL (profile slice) | NAC11 |
| Security: first-login change cannot be bypassed | PARTIAL (flag set correctly at creation/reset) | NAC20 |
| Security: locked / deactivated user cannot log in | PARTIAL (admin action produces correct state) | NAC21, NAC22 |
| Security: old password unusable after reset | PARTIAL (reset action contract) | NAC23 |
| Security: direct API cannot bypass role/scope/resource/action | PARTIAL | NAC01–NAC05, NAC10–NAC13 |

## 4. Dependencies

| Dependency | What is consumed | Blocking? |
|---|---|---|
| SPEC-001 | `withTransaction`, error classes, request-id, logger with secrets redaction, config loader, response envelope, validation middleware, migration conventions, `AuditService.record`, `NotificationService.enqueue`, UI kit/layout shell | Yes |
| SPEC-002 | `users` table (user_id, password_hash, status, role, failed_attempts, locked_until, must_change_password, token_version); `PasswordService` (hash, policy validate); account/session services (create account, admin credential reset, unlock, deactivate/activate, invalidate sessions); `AuthorizationService.authorize`; `ScopeResolver` interface | Yes |
| SPEC-003 | `locations`, `departments` (Business Units), `designations` masters with active flag; HR location/organisation scope mapping; IT location scope mapping; Receiving Manager scope (TDD in SPEC-003); admin shell and list/form UI patterns | Yes |
| SPEC-012 | Email dispatch, retry, idempotency, delivery status for `USER_ACCOUNT_CREATED` and `CREDENTIAL_RESET` | Yes (creation completes without it, delivery needs it) |
| SPEC-013 | Audit visibility, event catalogue verification | Soft |
| SPEC-009 / SPEC-007 (read-only) | `TaskVisibilityService` (does this IT/manager user have an assigned task for employee X) and pending-task counts for deactivation warnings | Soft — interface stub until delivered |

Assumption (cross-spec): `users.id` (uuid PK, SPEC-002) is the FK target for every relation to a user; `users.user_id` is the business display key only. [RECONCILED] Decision R-2: all FKs to users in every spec target `users(id)` uuid; SPEC-004 columns below are uuid, not varchar(9).

## 5. Enables

| Consumer | Uses |
|---|---|
| SPEC-006 | `EmployeeProfileService.getMandatoryDataStatus(userId)` (BRD-029 rule 6 submit block + HR contact), profile read model for eligibility (Employment Status) |
| SPEC-007 | Reporting Manager of an Employee for stage-1 routing; assignee candidate validation for Reassign (role + scope) |
| SPEC-008 | Assigned HR for an Employee; HR scope users |
| SPEC-009 | Assigned IT / IT candidates by location |
| SPEC-014 | User counts, assigned-employee lists |
| SPEC-015 | Field-ownership enforcement matrix (this SPEC implements the profile slice; 015 verifies) |
| SPEC-016 | Test data (users of every role) and UAT account-creation scenarios |

## 6. Roles & Scope

| Capability | Super Admin | HR | Reporting Manager | Receiving Manager | IT | Employee |
|---|---|---|---|---|---|---|
| Create user (EMP/MGR/HR/IT) | Yes | No | No | No | No | No |
| Create Receiving Manager / Super Admin | Gated — TDD-004.01/.02/.03 | No | No | No | No | No |
| List/search all users | Yes | Scope only (employees in HR location/organisation scope) | Assigned employees only | No | No | No |
| View user detail | All | Scope | Assigned employees (read-only, limited fields) | No | Minimal projection when it has an assigned task | Own only |
| Edit Employee ID / Name / Official Email | Yes | No | No | No | No | No |
| Edit Employment Status | Yes | In scope | No | No | No | No |
| Edit Dept/BU, Designation, Location, Reporting Manager | Yes | In scope (transfer-related correction) | No | No | No | No |
| Edit HR Assignment / IT Assignment | Yes | No | No | No | No | No |
| Role assign / change | Yes | No | No | No | No | No |
| Activate / deactivate | Yes | No | No | No | No | No |
| Reset credentials / unlock | Yes | No | No | No | No | No |
| View user lifecycle audit | Yes | Via SPEC-013 scoped audit view | No | No | No | No |

---

## 7. Functional Requirements

### 7.1 User ID generation
- **FR-004.01** `[BRD]` Every created account receives an automatically generated unique User ID: `EMP######` (Employee), `MGR######` (Reporting Manager), `HR######` (HR), `IT######` (IT) — prefix + exactly six digits `[BRD-004, BRD-OQ-02]`.
- **FR-004.02** `[PROPOSED]` IDs are allocated from a per-prefix counter row (`user_id_sequences`) updated with `UPDATE … SET next_value = next_value + 1 … RETURNING` inside the creation transaction (row lock ⇒ concurrency-safe and gap-free on rollback). Zero-padded to six digits; counter starts at 1 (`EMP000001`); exhaustion (> 999999) fails with `USER_ID_SEQUENCE_EXHAUSTED` (HTTP 500, logged). `users.user_id` unique constraint is the final safeguard.
- **FR-004.03** `[TDD-REQUIRED]` Prefix for **Receiving Manager** and **Super Admin** is not defined by BRD-004. Default `[PROPOSED]`: Receiving Manager shares `MGR`; Super Admin `ADM`. Until resolved at Gate 1, the registry marks both roles `enabled: false` (FR-004.04). See TDD-004.01.
- **FR-004.04** `[PROPOSED]` A `ROLE_PROVISIONING_REGISTRY` maps role → `{ prefix, enabled, requiredProfileFields, requiresScopeMapping }`. `EMPLOYEE, REPORTING_MANAGER, HR, IT` are enabled `[BRD-004]`; `RECEIVING_MANAGER`, `SUPER_ADMIN` are disabled by config until the TDD is decided; a create request for a disabled role returns 422 `ROLE_NOT_PROVISIONABLE`.
- **FR-004.04a** `[DERIVED]` The User ID is the login identifier (BRD-001, BRD-004) and is immutable after creation; it is never reused.

### 7.2 Duplicate validation
- **FR-004.05** `[BRD]` Creation is refused when the Employee ID or the official e-mail already exists (duplicate user/employee validation, BRD-004).
- **FR-004.06** `[PROPOSED]` Comparison is case-insensitive and whitespace-trimmed (unique indexes on `lower(employee_id)` and `lower(official_email)`); error codes `DUPLICATE_EMPLOYEE_ID`, `DUPLICATE_OFFICIAL_EMAIL` (HTTP 409) naming the field in `details[]`, never revealing the existing record's owner.
- **FR-004.07** `[PROPOSED]` The application pre-checks for friendly errors, but the database unique constraints are authoritative; a PostgreSQL `23505` raised by a concurrent create is translated to the same 409 codes and the whole transaction rolls back (no orphan account, no consumed sequence value).

### 7.3 Required mappings (creation flow)
- **FR-004.08** `[BRD]` Required organisation mappings are validated before creation (BRD-009). Department/Business Unit, Designation and Location must reference **active** records in the SPEC-003 masters; free-text values are rejected `[BRD-029]`.
- **FR-004.09** `[PROPOSED]` Required fields per role (default; TDD-004.08 for Gate 1 confirmation):

| Role | Required at creation | Optional |
|---|---|---|
| EMPLOYEE | employeeId, fullName, officialEmail, employmentStatus, departmentId, designationId, locationId, reportingManagerUserId, assigned HR (derived/confirmed) | assignedItUserId |
| REPORTING_MANAGER | employeeId, fullName, officialEmail, employmentStatus, departmentId, designationId, locationId, assigned HR (derived/confirmed) | own reportingManagerUserId |
| HR | employeeId, fullName, officialEmail, employmentStatus, departmentId, designationId, locationId, `scope` (≥ 1 location) | scope departments |
| IT | employeeId, fullName, officialEmail, employmentStatus, departmentId, designationId, locationId, `scope` (≥ 1 location) | — |

- **FR-004.09a** `[BRD]` Reporting Manager must exist and hold role `REPORTING_MANAGER`, be not `INACTIVE`, and not be the user itself (BRD-016, BRD-029 field table). `[PROPOSED]` cycle check via recursive CTE when a Reporting Manager has a manager.
- **FR-004.09b** `[DERIVED]` HR scope (location/organisation) and IT location scope are stored by SPEC-003 mapping services; SPEC-004 passes the `scope` payload through `ScopeMappingService.assign(userId, role, scope, {trx})` in the same transaction so account, profile and scope commit atomically (BRD-004 "controlled transaction", BRD-016).

### 7.4 Reporting hierarchy and HR/IT assignment derivation
- **FR-004.20** `[BRD]` HR Assignment and IT Assignment are portal data maintained by Super Admin **from the configured location/organisation mapping** (BRD-029 field table, BRD-016). Organisation hierarchy: Super Admin → Location → HR → Reporting Manager → Employee.
- **FR-004.21** `[PROPOSED]` `AssignmentDerivationService.candidates({ locationId, departmentId })` returns HR users whose SPEC-003 scope covers the Employee's location (and department if the HR scope is department-bound) and IT users whose location scope covers the location. If exactly one HR candidate exists it is pre-selected; if several, Super Admin must select one (selection validated against candidates); if none, creation of an EMPLOYEE/REPORTING_MANAGER fails `NO_HR_CONFIGURED_FOR_LOCATION` (422) so the BRD-029 missing-data contact path always resolves. IT assignment follows the same candidate rule but is optional (TDD-004.08 and the IT-selection gap, contract §5(g)).
- **FR-004.22** `[PROPOSED]` When Location (or Department) of an existing Employee changes, the system recomputes candidates and requires Super Admin to confirm the HR/IT assignment in the same request if the current assignee is no longer a candidate; HR performing a transfer-related correction (FR-004.34) triggers an automatic re-derivation only when exactly one candidate exists, otherwise the profile is flagged `assignment_review_required` and Super Admin is notified in the UI list filter.
- **FR-004.23** `[BRD]` A Reporting Manager's "assigned employees" are the employees whose ACTIVE `reporting_manager_assignments.reporting_manager_user_id` (SPEC-003) equals that manager (BRD-012, BRD-016). [RECONCILED] Decision R-1: the mapping table is SPEC-003's; SPEC-004 has no copy.

### 7.5 Temporary password and credential handling
- **FR-004.10** `[BRD]` A strong temporary password is generated automatically at creation and at administrator reset (BRD-004, BRD-006, BRD-007).
- **FR-004.11** `[BRD]` The temporary password satisfies the BRD-025 complexity rule: ≥ 8 characters with ≥ 1 uppercase, ≥ 1 lowercase, ≥ 1 number, ≥ 1 special character; it has **no time-based expiry** and stays valid until the first successful login `[BRD-025]`.
- **FR-004.12** `[PROPOSED]` Generator: Node `crypto.randomInt` (CSPRNG) only — never `Math.random`; length 14 (config `TEMP_PASSWORD_LENGTH`, floor 8); guarantees one char from each class then fills from the union and shuffles with a CSPRNG Fisher-Yates; excludes visually ambiguous characters (`0 O o 1 l I`); the result is verified with SPEC-002 `PasswordService.validatePolicy` before use (regenerate on failure, max 5 attempts, then `PASSWORD_GENERATION_FAILED`). Exact length/charset: TDD-004.15.
- **FR-004.13** `[BRD]` Only the **hash** is persisted (`users.password_hash`, via SPEC-002 `PasswordService.hash`, bcryptjs); `must_change_password = true`; account status `PENDING_ACTIVATION` at creation `[BRD-006, BRD-007]`. Hashing happens **before** the DB transaction starts to keep the sequence-row lock short.
- **FR-004.14** `[BRD]` The User ID and temporary password are returned only in the successful creation (or reset) response to the authorised administrator `[BRD-005]`. Response headers `Cache-Control: no-store`, `Pragma: no-cache`. The credentials are never retrievable afterwards (no "show password" endpoint); a lost credential is handled by credential reset.
- **FR-004.15** `[BRD]` The temporary password must never appear in application logs, audit records, error payloads, exception traces, request logs, APM breadcrumbs or reports `[BRD-005, BRD-037, NFR-003]`. `[PROPOSED]` Enforced by (a) SPEC-001 logger redaction paths (`temporaryPassword`, `password`, `passwordHash`, `credentials.*`), (b) a dedicated `Secret` wrapper class whose `toString()/toJSON()/inspect` return `[REDACTED]` and which exposes `reveal()` only to the response serializer and notification payload builder, (c) audit payload allow-lists, (d) a CI scan test (TC-004.60).
- **FR-004.16** `[PROPOSED]` The frontend holds the credential response only in component-local state of the credential dialog; it is not written to Redux, `localStorage`, `sessionStorage`, URL, or browser history, and is discarded when the dialog closes (FR-004.72).

### 7.6 Delivery to official e-mail
- **FR-004.17** `[BRD]` Initial credentials are delivered to the user's **official company e-mail address**, following Create User → Generate User ID → Generate Temporary Password → Send Credentials to Official Email → First Login → Mandatory Password Change `[BRD-005, BRD-OQ-03]`. Channel is **Email only** `[BRD-036]`.
- **FR-004.18** `[BRD]` Delivery uses `NotificationService.enqueue('USER_ACCOUNT_CREATED', payload, {trx})` inside the creation transaction (outbox). A delivery failure never fails, rolls back or corrupts the creation; it is logged for audit/troubleshooting and may be retried without re-running the creation `[BRD-036]`.
- **FR-004.19** `[TDD-REQUIRED]` The outbox row is persisted in PostgreSQL, so carrying the plaintext temporary password in it would conflict with "plaintext must never be persisted in PostgreSQL" (BRD-006). Decision required in TDD-004.07 = TDD-012.04 master [RECONCILED R-12] (recommended default: Option B, in-memory post-commit send with nothing persisted; fallback Option A: encrypted transient secret, AES-256-GCM, key from env `CREDENTIAL_PAYLOAD_KEY`, nulled on delivery success/terminal failure; in both cases after failure the administrator performs credential reset). The administrator-facing creation result shows `deliveryStatus` (`QUEUED|SENT|FAILED`, non-secret) read from SPEC-012 on the user detail page `[PROPOSED]`.
- **FR-004.19a** `[DERIVED]` The creation result masks the destination (`a***@company.com`); the portal cannot verify mailbox ownership, so correctness of the official e-mail rests on the administrator.

### 7.7 Employee profile and per-field ownership
- **FR-004.30** `[BRD]` The employee profile holds: Employee ID, Name, Official Email, Employment Status, Department/Business Unit, Designation, Location, Reporting Manager, HR Assignment, IT Assignment `[BRD-029, BRD-016]`.
- **FR-004.31** `[BRD]` Department/BU, Designation and Location values come only from portal master data (SPEC-003) and cannot be arbitrary text; the Employee cannot edit controlled data `[BRD-029, BRD-OQ-19]`.
- **FR-004.32** `[BRD]` Field ownership (current phase):

| Field | Super Admin | HR (within scope) | Source |
|---|---|---|---|
| Employee ID | Create/edit | No | BRD-029 |
| Employee Name | Create/edit | No | BRD-029 |
| Official Email | Create/edit | No | BRD-029 |
| Employment Status | Create/edit | Edit | BRD-029 "Super Admin / HR" |
| Department / Business Unit | Create/edit | Transfer-related update | BRD-029 |
| Designation | Create/edit | Transfer-related update | BRD-029 |
| Location | Create/edit | Transfer-related update | BRD-029 |
| Reporting Manager | Create/edit | Transfer-related update | BRD-029 |
| HR Assignment | Create/edit (from location/organisation mapping) | No | BRD-029 |
| IT Assignment | Create/edit (from location mapping) | No | BRD-029 |

- **FR-004.33** `[PROPOSED]` Ownership is enforced by a single `FieldOwnershipPolicy` (data-driven map field → roles) applied in the service layer for every update; a request containing any field the caller may not edit is rejected whole with 403 `FIELD_NOT_EDITABLE` (`details[].field`), never partially applied. SPEC-015 verifies the matrix end-to-end.
- **FR-004.34** `[BRD]` HR may correct transfer-related information (Department/BU, Designation, Location, Reporting Manager) and Employment Status of employees **within its authorised scope** and coordinates with Super Admin where Super Admin authority is needed (Employee ID/Name/Email/HR/IT assignment, master data) `[BRD-029 missing-data path]`. After a correction the profile completeness is re-evaluated (FR-004.37) so the Employee may submit subject to eligibility (SPEC-006).
- **FR-004.35** `[DERIVED]` HR edits update portal data only; no external HR system is updated and no synchronisation exists `[BRD-029, BRD-OQ-19]`. Changing the profile of an Employee with an active transfer does **not** alter values stored on that Transfer Request (in-flight snapshot, owned by SPEC-006/015); HR changes *during* transfer processing go through SPEC-008 (BRD-020/BRD-024), not this endpoint. The edit response includes `activeTransferSnapshotUnaffected: true` when an active request exists `[PROPOSED]`.
- **FR-004.36** `[TDD-REQUIRED]` Employment Status value set is not defined by the BRD beyond "Active" being eligible and "inactive, terminated, separated or resigned" being ineligible (BRD-029 rule 1). Default `[PROPOSED]`: `ACTIVE, INACTIVE, TERMINATED, SEPARATED, RESIGNED`; only `ACTIVE` carries behaviour (eligible). TDD-004.05.
- **FR-004.37** `[BRD]` `EmployeeProfileService.getMandatoryDataStatus(userId)` returns `{ complete, missing[], invalid[], assignedHr }` for the BRD-029 rule 6 fields (Employee ID, Department/BU, Designation, Location, Reporting Manager, Employment Status). `[PROPOSED]` "invalid" also covers references to deactivated masters, a Reporting Manager that is inactive or no longer `REPORTING_MANAGER`, and missing HR assignment. The portal never invents or substitutes missing data. `assignedHr` (name + official email of the HR assigned from the Location/HR assignment) is returned so SPEC-006 can show *"Your employee profile is incomplete. Please contact HR…"* `[BRD-029]`.
- **FR-004.38** `[TDD-REQUIRED]` On transfer completion the Employee's profile organisation fields should reflect the new Department/Designation/Location/Reporting Manager; the BRD does not say who applies this or when. Interface reserved `[PROPOSED]`: `EmployeeProfileService.applyTransferOutcome(userId, values, {trx, actor: SYSTEM})`, to be called by SPEC-009 at completion. TDD-004.11. **[DECIDED 2026-10-07: automatic update by the system at Completed — see TDD-004.11 and SPEC-009 FR-009.56a.]**

### 7.8 Role assignment and role change
- **FR-004.40** `[BRD]` Super Admin manages user-role mappings (BRD-010). Role is chosen at creation (flow step "Select role", BRD-009).
- **FR-004.41** `[PROPOSED]` Role change `PUT /users/:userId/role` requires `reason`, is Super Admin only, invalidates all sessions of the target (token version bump via SPEC-002) so the new permissions apply immediately, and is audited as a **security event** `USER_ROLE_CHANGED` `[BRD-037 role/permission changes]`.
- **FR-004.42** `[PROPOSED]` Guards: cannot change own role; cannot change the last active Super Admin `LAST_SUPER_ADMIN_PROTECTED`; role change away from `REPORTING_MANAGER` is refused while employees are assigned to the user (`ROLE_CHANGE_BLOCKED_ACTIVE_ASSIGNMENTS`, with counts); likewise HR/IT with active SPEC-007/009 task assignments (soft check via interface). Super Admin first reassigns employees (profile edit) or tasks (SPEC-010 Reassign).
- **FR-004.43** `[TDD-REQUIRED]` Whether a user may hold more than one role, and whether the User ID prefix changes on a role change (default: **ID is immutable**, so an `EMP` account promoted to `HR` keeps the `EMP` prefix) — TDD-004.04 / TDD-004.09. Default single role per user (`users.role` is a single value `[BRD-001]`).
- **FR-004.44** `[PROPOSED]` After a role change the required-profile-fields matrix (FR-004.09) for the new role is applied: missing mandatory fields are reported and must be supplied in the same request (`profile` object) or the change is refused `PROFILE_INCOMPLETE_FOR_ROLE`; scope mappings for HR/IT must be supplied via `scope`.

### 7.9 Account lifecycle actions
- **FR-004.50** `[BRD]` Account lifecycle statuses are Pending Activation, Active, Locked, Inactive/Deactivated (BRD-007; stored by SPEC-002 as `PENDING_ACTIVATION, ACTIVE, LOCKED, INACTIVE`). Creation yields `PENDING_ACTIVATION`; the transition to `ACTIVE` occurs on first successful password change (SPEC-002).
- **FR-004.51** `[BRD]` **Deactivate**: Super Admin deactivates; the user can no longer log in or call protected APIs and existing sessions are invalidated `[BRD-025]`. Calls SPEC-002 `AccountService.deactivate(userId,{trx})` (status `INACTIVE`, token version bump). Confirmation dialog mandatory `[BRD-002]`.
- **FR-004.52** `[PROPOSED]` **Activate** re-enables an `INACTIVE` account; target status is `ACTIVE` if the first-login change was completed (`must_change_password = false`), otherwise `PENDING_ACTIVATION` with the existing temp password still valid (BRD-025: no expiry). Activating a `PENDING_ACTIVATION` account manually is not offered (activation happens by first login). TDD-004.14.
- **FR-004.53** `[BRD]` **Administrator credential reset**: generates a **new** temporary password, sets `must_change_password = true`, invalidates **all** existing sessions of the user, makes the old password unusable `[BRD-007, BRD-025, BRD-039]`; result shown once to the administrator and e-mailed (`CREDENTIAL_RESET`, Email only, BRD-036). Confirmation dialog mandatory `[BRD-002]`.
- **FR-004.54** `[PROPOSED]` Reset is refused for `INACTIVE` accounts (`ACCOUNT_INACTIVE`; reactivate first) and for the administrator's own account (use self-service change, SPEC-002). Reset does not implicitly unlock; unlock is a separate audited action.
- **FR-004.55** `[BRD]` **Unlock**: Super Admin may unlock a `LOCKED` account before the 30-minute lock expires `[BRD-025]`; clears failed attempts and `locked_until` via SPEC-002 `AccountSecurityService.unlock`. Unlock UI and API are in this SPEC; the 5-attempt/30-minute automatic lock is SPEC-002. Refused if the account is not locked (`ACCOUNT_NOT_LOCKED`, 409).
- **FR-004.56** `[PROPOSED]` Guards: Super Admin cannot deactivate self; the last active Super Admin cannot be deactivated (`LAST_SUPER_ADMIN_PROTECTED`).
- **FR-004.57** `[TDD-REQUIRED]` Deactivating a user who has pending workflow work (Reporting Manager/HR/IT with assigned tasks, or an Employee with an active transfer) is not defined. Default `[PROPOSED]`: allowed with a prominent warning in the confirmation dialog showing counts (via SPEC-007/009 interface) and no automatic reassignment; Super Admin uses SPEC-010 Reassign. TDD-004.10.
- **FR-004.58** `[DERIVED]` Account status (login capability) and Employment Status (HR fact used by eligibility) are independent attributes; changing one does not change the other automatically.

### 7.10 User lists, filters and visibility
- **FR-004.60** `[BRD]` Searchable, sortable, filterable data tables with pagination and status badges (BRD-002) for the Users module (BRD-003).
- **FR-004.61** `[PROPOSED]` Filters: `q` (name / User ID / employee ID / official e-mail contains), `role`, `accountStatus`, `employmentStatus`, `departmentId`, `designationId`, `locationId`, `reportingManagerUserId`, `assignedHrUserId`, `assignedItUserId`, `profileComplete`, `assignmentReviewRequired`. Sort by `userId, fullName, role, accountStatus, employmentStatus, createdAt`. Pagination per contract (default 20, max 100).
- **FR-004.62** `[BRD]` Visibility: Super Admin all users; Reporting Manager only **assigned employees** (BRD-012); HR employees within its **location/organisation scope** (BRD-013) resolved through `ScopeResolver` (SPEC-003 data); IT minimum required employee information only, never a list (BRD-014); Receiving Manager and Employee no list. Scoping is applied in the SQL `WHERE` of the repository (not post-filtering) so out-of-scope rows and counts never leave the database `[BRD-026]`.
- **FR-004.63** `[PROPOSED]` Role-based response projection: Super Admin full profile + account fields; HR profile fields + account status badge (no credential/security counters); Reporting Manager `userId, employeeId, fullName, department, designation, location, employmentStatus` (no e-mail, no account/security fields — e-mail visibility to managers is not stated by the BRD); IT minimal projection (FR-004.64).
- **FR-004.64** `[BRD]` IT sees only the minimum required employee information `[BRD-014]`. `[PROPOSED]` `GET /users/:userId/minimal-profile` returns `userId, employeeId, fullName, department, designation, location` and is authorised only if SPEC-009 `TaskVisibilityService` confirms the IT user has an IT task for that employee (or Employee is in IT's location scope for an active transfer). Whether official e-mail is included: TDD-004.13 (default excluded).
- **FR-004.65** `[BRD]` An Employee views own profile (department, designation, location, Reporting Manager) `[BRD-011]` via `GET /me/profile`, read-only.
- **FR-004.66** `[DERIVED]` Out-of-scope or non-existent target IDs both return 404 for non-Super-Admin callers where revealing existence would leak organisational data; 403 is used when the caller's *role* lacks the capability (BRD-026 "rejections must not expose restricted information").

### 7.11 Audit and notifications (summary)
- **FR-004.70** `[BRD]` Account creation, activation/deactivation, credential reset, unlock, role/permission change, profile/assignment/hierarchy changes are audited with actor, role, action, entity, date/time, previous/new values and reason, never with passwords/tokens `[BRD-008, BRD-022, BRD-037]` — see §18.
- **FR-004.71** `[BRD]` Only the two Email-only events are triggered by this SPEC: user account created, credential/password reset `[BRD-036]` — see §19.

### 7.12 UI behaviour
- **FR-004.72** `[BRD]` Create flow UI follows: Select role → Enter profile → Validate → Create → Credentials shown once → Delivery status; inline validation with required-field indicators; confirmation dialogs for deactivation and credential reset (also role change and unlock `[PROPOSED]`); loading, empty, no-access and error states; responsive desktop/tablet; accessibility `[BRD-002, NFR-008]`.
- **FR-004.73** `[PROPOSED]` The credentials dialog: masked password with reveal toggle and copy button, explicit "this is the only time it is shown" notice, requires an explicit "I have recorded these credentials" acknowledgement before close, clears state on close, `autocomplete="off"`, blocks route navigation prompt while open, no browser-print stylesheet content.

---

## 8. Internal Implementation Plan / Tasks

Legend: layer BE/FE/DB/QA. Ordered; each depends on the listed tasks. Cross-SPEC items are referenced by capability.

| Task | Title | Layer | Description | Inputs → Outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-004.01 | Migration: `employee_profiles` | DB | Create table, FKs to `users`, `locations`, `departments`, `designations`; check constraint on `employment_status`; case-insensitive unique indexes on employee_id and official_email; supporting indexes for filters/scope | SPEC-002/003 tables → migration + Sequelize model | SPEC-001/002/003 | BRD-004, BRD-029, BRD-016 |
| TASK-004.02 | Migration: `user_id_sequences` + seed | DB | Counter table with rows for `EMP`, `MGR`, `HR`, `IT` (and `ADM` disabled) | — → table + seed | TASK-004.01 | BRD-004 |
| TASK-004.03 | Migration: profile concurrency + assignment flags | DB | `version`, `assignment_review_required`, audit columns; trigger-free `updated_at` handled by Sequelize | — → columns | TASK-004.01 | BRD-029 |
| TASK-004.04 | Module scaffolding & registry | BE | `backend/src/modules/users/` layout; `ROLE_PROVISIONING_REGISTRY`; config keys (`TEMP_PASSWORD_LENGTH`, `CREDENTIAL_PAYLOAD_KEY`, `OFFICIAL_EMAIL_DOMAINS` optional, `PROVISION_RECEIVING_MANAGER_ENABLED`, `PROVISION_SUPER_ADMIN_ENABLED`) | SPEC-001 config loader → module skeleton | TASK-004.01 | BRD-004 |
| TASK-004.05 | `UserIdGenerator` | BE | Row-locked counter allocate within caller's trx; prefix per role; overflow error | role, trx → userId | TASK-004.02, .04 | BRD-004 |
| TASK-004.06 | `TemporaryPasswordGenerator` + `Secret` wrapper | BE | CSPRNG generator, policy self-check via SPEC-002, redacting `Secret` class | config → `Secret` | TASK-004.04 | BRD-004, BRD-005, BRD-025 |
| TASK-004.07 | Request DTO validators & sanitisers | BE | Create/update/role-change/reason schemas (zod), normalisation (trim, lower-case e-mail) | HTTP body → validated DTO | TASK-004.04 | BRD-009, INT standards |
| TASK-004.08 | `EmployeeProfileRepository` | BE | CRUD, scoped list queries, unique-violation mapping, optimistic version update | DTO → rows | TASK-004.01, .03 | BRD-029, BRD-016 |
| TASK-004.09 | `OrganisationMappingValidator` | BE | Active-master checks, Reporting Manager checks (+cycle), HR/IT candidate validation | ids → validated mapping or errors | TASK-004.08; SPEC-003 | BRD-009, BRD-016, BRD-029 |
| TASK-004.10 | `AssignmentDerivationService` | BE | Candidate HR/IT by location/department; auto-select rule; review flag | location, dept → candidates | TASK-004.09 | BRD-016, BRD-029 |
| TASK-004.11 | `FieldOwnershipPolicy` | BE | Data-driven field→role map, scope check, whole-request rejection | actor, fields → allow/deny | TASK-004.04 | BRD-029 |
| TASK-004.12 | `UserProvisioningService.createUser` | BE | Single-trx orchestration (IDs, account via SPEC-002, profile, scope, audit, outbox); post-commit result builder | DTO, actor → user + credentials | TASK-004.05–.10; SPEC-002/003/012/013 | BRD-004, BRD-005, BRD-009 |
| TASK-004.13 | Credential e-mail integration | BE | Register `USER_ACCOUNT_CREATED` / `CREDENTIAL_RESET` payload builders; secret-field protection per TDD-004.07; delivery-status read | userId, `Secret` → outbox row | TASK-004.12; SPEC-012 | BRD-005, BRD-036, OQ-03 |
| TASK-004.14 | `UserQueryService` (list/detail/me/minimal) | BE | Scoped, filtered, paginated queries; role projections | filters, ctx → pages | TASK-004.08 | BRD-002, BRD-012, BRD-013, BRD-014, BRD-011 |
| TASK-004.15 | `EmployeeProfileService.update` + completeness | BE | Field-ownership enforced edit, reason, version check, derivation hooks, `getMandatoryDataStatus`, `applyTransferOutcome` stub | patch → profile | TASK-004.08–.11 | BRD-029 |
| TASK-004.16 | `RoleChangeService` | BE | Role change with guards, session invalidation, security audit | userId, role → result | TASK-004.12, .15 | BRD-010, BRD-037 |
| TASK-004.17 | `AccountAdminService` | BE | activate, deactivate, reset credentials, unlock via SPEC-002 services; guards; audit; notification | userId → status | TASK-004.06, .13; SPEC-002 | BRD-007, BRD-008, BRD-025 |
| TASK-004.18 | Controllers, routes, authorisation registration | BE | Register endpoints/permissions with SPEC-002 authorisation; response headers `no-store` | — → routes | TASK-004.12–.17 | BRD-026 |
| TASK-004.19 | Audit event emission & sanitiser allow-lists | BE | Typed event builders, forbidden-key guard | actions → audit rows | TASK-004.12–.17; SPEC-001 | BRD-008, BRD-037 |
| TASK-004.20 | Seed/test fixtures | BE/QA | Fixture factory for users of every role, masters, HR/IT mapping | — → test helpers | TASK-004.12 | BRD-039 |
| TASK-004.21 | FE service layer & types | FE | `user.service.ts` extension (admin client), DTO types, error mapping; secrets never persisted | API → typed client | TASK-004.18 | BRD-002 |
| TASK-004.22 | FE Users list page | FE | `/admin/users` table with filters/sort/pagination/badges/states | list API → UI | TASK-004.21; SPEC-003 shell | BRD-002, BRD-003 |
| TASK-004.23 | FE Create-user wizard | FE | Role → profile → mappings (masters pickers, HR/IT candidates) → review → result | masters API → UI | TASK-004.21 | BRD-009 |
| TASK-004.24 | FE credentials dialog | FE | One-time display, acknowledge, no persistence | creation result → dialog | TASK-004.23 | BRD-005 |
| TASK-004.25 | FE User detail (Profile/Assignments/Account/Activity) | FE | Tabs; field-level editability per role | detail API → UI | TASK-004.21 | BRD-029, BRD-008 |
| TASK-004.26 | FE admin action dialogs | FE | Deactivate, activate, reset, unlock, role change with confirmations and reason | — → dialogs | TASK-004.25, .24 | BRD-002, BRD-007 |
| TASK-004.27 | FE role-scoped employee lists + own profile | FE | `/employees` (Manager/HR), `/profile` (Employee), IT minimal panel | APIs → UI | TASK-004.21 | BRD-011–014 |
| TASK-004.28 | FE states, accessibility, responsive pass | FE | Loading/empty/no-access/error, keyboard, aria, tablet layout | — → UI polish | TASK-004.22–.27 | BRD-002, NFR-008 |
| TASK-004.29 | Unit tests (BE) | QA | Generator, validators, policy, services | — → TC-004.01–.30 | TASK-004.05–.17 | — |
| TASK-004.30 | Integration & API tests | QA | Full creation flow, rollback, scoping, actions against test DB | — → TC-004.31–.55 | TASK-004.18 | — |
| TASK-004.31 | Concurrency & security tests | QA | Parallel creation, ID uniqueness, secret-leak scan, authz matrix | — → TC-004.56–.70 | TASK-004.18, .19 | BRD-039, NFR-003 |
| TASK-004.32 | Frontend tests | QA | Component/page tests incl. credential dialog persistence checks | — → TC-004.71–.80 | TASK-004.22–.28 | BRD-002, BRD-005 |
| TASK-004.33 | API documentation & handoff notes | BE | OpenAPI fragment, interface contracts for SPEC-006/007/009 | — → docs in repo | TASK-004.18 | — |

---

## 9. Business Rules

| # | Rule | Tag |
|---|---|---|
| BR-1 | User ID = prefix + 6 digits, unique, immutable, never reused | `[BRD-004]` |
| BR-2 | Creation = account + organisational profile in one controlled transaction; any failure rolls back both | `[BRD-004]` |
| BR-3 | Duplicate Employee ID or official e-mail refuses creation | `[BRD-004]` |
| BR-4 | Temporary password: system-generated, policy-compliant, no time expiry, must be changed at first login | `[BRD-004, BRD-006, BRD-025]` |
| BR-5 | Credentials shown only to an authorised administrator in the success result; delivered to official e-mail; never in logs/audit | `[BRD-005]` |
| BR-6 | Only password hashes are stored | `[BRD-006]` |
| BR-7 | Only Super Admin creates users and resets credentials | `[BRD-010, BRD-007]` |
| BR-8 | Reset: new temp password, must change on next login, all sessions invalidated | `[BRD-007, BRD-025]` |
| BR-9 | Deactivated users cannot log in or use protected APIs; sessions invalidated | `[BRD-025]` |
| BR-10 | Locked accounts unlock automatically after 30 minutes or by Super Admin | `[BRD-025]` |
| BR-11 | Dept/BU, Designation, Location are master references, never free text | `[BRD-029]` |
| BR-12 | Field edit authority follows §7.7 table; HR edits within scope only | `[BRD-029]` |
| BR-13 | Employee cannot edit controlled data | `[BRD-029]` |
| BR-14 | HR edits change portal data only; no external HR sync | `[BRD-029, OQ-19]` |
| BR-15 | In-flight transfers keep their own stored values; profile edits do not rewrite them | `[BRD-029]` |
| BR-16 | Mandatory org data missing ⇒ Employee cannot submit; portal never invents data | `[BRD-029]` |
| BR-17 | Reporting Manager sees only assigned employees; HR only scope; IT minimum info | `[BRD-012/013/014]` |
| BR-18 | One role per user by default; role change is a security event | `[PROPOSED]` / `[BRD-037]` |
| BR-19 | Super Admin cannot lock itself out (self-deactivate, own role change, last Super Admin) | `[PROPOSED]` |
| BR-20 | Notification failure never affects the committed provisioning | `[BRD-036]` |
| BR-21 | No eligibility, tenure or other HR business rules are introduced by this SPEC | `[BRD-029 rule 2, 8]` |

## 10. Data Model & Database

### 10.1 `employee_profiles` `[PROPOSED]` (migration `backend/src/migrations/<ts>-create-employee-profiles.ts`)

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | N | `gen_random_uuid()` |
| user_id | uuid | N | FK → `users(id)`, **UNIQUE** (1:1) [RECONCILED] was varchar(9) FK users.user_id; the business ID (EMP/MGR/HR/IT######) lives only in `users.user_id` |
| employee_id | varchar(30) | N | Business employee ID (admin-supplied; relation to user_id TDD-004.06); unique `lower()` index |
| full_name | varchar(150) | N | |
| official_email | varchar(254) | N | stored trimmed; unique `lower()` index |
| employment_status | varchar(20) | N | CHECK in value set (TDD-004.05) |
| department_id | uuid | Y/N | FK → `departments.id`; required by app per role |
| designation_id | uuid | Y/N | FK → `designations.id` |
| location_id | uuid | Y/N | FK → `locations.id` |
| ~~reporting_manager_user_id~~ | — | — | [RECONCILED] Decision R-1: NO column here. The employee→Reporting Manager relation is owned solely by SPEC-003 `reporting_manager_assignments` (ACTIVE row). `EmployeeProfileService` exposes `reportingManagerUserId` as a read-only join/projection and writes only via SPEC-003 `ReportingRelationshipService.assign/change({trx})`. No independently editable copy. |
| assigned_hr_user_id | uuid | Y | FK → `users(id)` |
| assigned_it_user_id | uuid | Y | FK → `users(id)` |
| assignment_review_required | boolean | N | default false |
| version | integer | N | default 1, optimistic locking |
| created_by / updated_by | uuid | Y | FK → `users(id)`; NULL = SYSTEM actor (e.g. `applyTransferOutcome`) [RECONCILED] was varchar(9) with SYSTEM sentinel |
| created_at / updated_at | timestamptz | N | |

Indexes: `uq_employee_profiles_user_id`; `uq_employee_profiles_employee_id_ci (lower(employee_id))`; `uq_employee_profiles_official_email_ci (lower(official_email))`; `ix_ep_location (location_id)`, `ix_ep_department`, `ix_ep_designation`, `ix_ep_assigned_hr`, `ix_ep_assigned_it`, `ix_ep_employment_status`; trigram or `lower(full_name)` index for `q` search `[PROPOSED]`.
Rules: no password, token or credential column exists in this table. No cascading deletes (`ON DELETE RESTRICT`); users are never hard-deleted by the application (BRD-037 retention).

### 10.2 `user_id_sequences` `[PROPOSED]`

| Column | Type | Notes |
|---|---|---|
| prefix | varchar(3) PK | `EMP`, `MGR`, `HR`, `IT`, `ADM`(disabled) |
| next_value | bigint N | default 1, CHECK `next_value BETWEEN 1 AND 1000000` |
| updated_at | timestamptz | |

Allocation SQL: `UPDATE user_id_sequences SET next_value = next_value + 1, updated_at = now() WHERE prefix = :p RETURNING next_value - 1 AS allocated;` run on the creation transaction (row lock serialises concurrent creators of the same prefix; rollback returns the number). Alternative (PostgreSQL SEQUENCE per prefix) rejected as default because it leaves gaps on rollback; either is acceptable at Gate 1.

### 10.3 Tables referenced but owned elsewhere
`users` (SPEC-002), `locations/departments/designations`, HR/IT scope mapping tables (SPEC-003), `audit_logs` (SPEC-001/013), `notification_outbox` (SPEC-001/012).

### 10.4 Account status mapping (consumed from SPEC-002)
`PENDING_ACTIVATION → ACTIVE` (first password change, SPEC-002); `ACTIVE|PENDING_ACTIVATION|LOCKED → INACTIVE` (deactivate); `INACTIVE → ACTIVE|PENDING_ACTIVATION` (activate); `LOCKED → ACTIVE|PENDING_ACTIVATION` (unlock / lock expiry; the pre-lock status restored by SPEC-002).

## 11. Backend Implementation

`backend/src/modules/users/`
- `users.routes.ts`, `users.controller.ts` (thin; no business logic), `dto/*.ts`, `validators/*.ts`
- `services/user-provisioning.service.ts`, `services/employee-profile.service.ts`, `services/role-change.service.ts`, `services/account-admin.service.ts`, `services/assignment-derivation.service.ts`, `services/user-query.service.ts`
- `domain/user-id-generator.ts`, `domain/temporary-password-generator.ts`, `domain/secret.ts`, `domain/field-ownership.policy.ts`, `domain/role-provisioning.registry.ts`, `domain/organisation-mapping.validator.ts`
- `repositories/employee-profile.repository.ts`, `repositories/user-id-sequence.repository.ts`
- Models in `backend/src/models/`: `EmployeeProfile`, `UserIdSequence`.

Layering: controller → service → repository; services take `{ trx }`; every async operation in `try/catch` with structured logging (Winston/Pino) and typed errors from SPEC-001; async/await only.

`createUser` algorithm (service):
1. `authorize(ctx, {resource:'USER', action:'CREATE'})` (Super Admin) — outside trx.
2. Validate/normalise DTO; check role enabled in registry.
3. Generate `Secret` temp password and hash it (outside trx).
4. `withTransaction`: pre-check masters/RM/HR/IT candidates → allocate User ID → create account via SPEC-002 (`PENDING_ACTIVATION`, `must_change_password = true`) → insert profile → assign scope (SPEC-003) → `AuditService.record(USER_CREATED …)` → `NotificationService.enqueue('USER_ACCOUNT_CREATED', …)`.
5. Commit; map `23505` to duplicate errors (rollback implied).
6. Build response; credentials revealed only here; `Cache-Control: no-store`.

`resetCredentials`: authorise → guard → generate+hash → trx: `CredentialService.adminReset(userId, hash,{trx})` (sets hash, `must_change_password`, invalidates sessions) → audit `USER_CREDENTIALS_RESET` → enqueue `CREDENTIAL_RESET`.

## 12. API Requirements

Base `/api/v1`; envelope per contract; all endpoints require authentication (401) and are authorised via SPEC-002 (403). `[PROPOSED]` for all paths.

### 12.1 `POST /users` — create user
- **Purpose**: provision account + profile. **AuthZ**: Super Admin.
- **Request**:
```json
{
  "role": "EMPLOYEE",
  "employeeId": "E-10234",
  "fullName": "Asha Verma",
  "officialEmail": "asha.verma@company.com",
  "employmentStatus": "ACTIVE",
  "departmentId": "uuid", "designationId": "uuid", "locationId": "uuid",
  "reportingManagerUserId": "MGR000012",
  "assignedHrUserId": "HR000003",
  "assignedItUserId": null,
  "scope": null
}
```
(`scope`: `{ "locationIds": ["uuid"], "departmentIds": ["uuid"] }` for HR/IT.)
- **Response 201**:
```json
{ "success": true, "data": {
  "user": { "userId": "EMP000145", "role": "EMPLOYEE", "accountStatus": "PENDING_ACTIVATION", "mustChangePassword": true, "profile": { "employeeId": "E-10234", "fullName": "Asha Verma", "...": "..." } },
  "credentials": { "userId": "EMP000145", "temporaryPassword": "<shown once>", "shownOnce": true },
  "delivery": { "channel": "EMAIL", "destination": "a***@company.com", "status": "QUEUED" }
}, "meta": { "requestId": "..." } }
```
- **Validation**: §14. **Errors**: 400 `VALIDATION_ERROR`; 401; 403; 409 `DUPLICATE_EMPLOYEE_ID` / `DUPLICATE_OFFICIAL_EMAIL`; 422 `ROLE_NOT_PROVISIONABLE`, `MASTER_DATA_INVALID` (inactive/unknown master), `REPORTING_MANAGER_INVALID`, `NO_HR_CONFIGURED_FOR_LOCATION`, `ASSIGNEE_NOT_IN_SCOPE`, `SCOPE_REQUIRED`; 500 `USER_ID_SEQUENCE_EXHAUSTED`. Headers: `Cache-Control: no-store`.

### 12.2 `GET /users` — list
- **AuthZ**: Super Admin (all); HR (scope); Reporting Manager (assigned employees). IT, Receiving Manager, Employee → 403.
- **Query**: `page, pageSize, sort, order, q, role, accountStatus, employmentStatus, departmentId, designationId, locationId, reportingManagerUserId, assignedHrUserId, assignedItUserId, profileComplete, assignmentReviewRequired`.
- **Response 200**: `data: [ { userId, employeeId, fullName, role, accountStatus, employmentStatus, department, designation, location, reportingManager:{userId,fullName}, assignedHr:{…}, assignedIt:{…}, profileComplete } ]` (projection by role FR-004.63), `meta: {page,pageSize,total}`.
- **Errors**: 400 invalid filter/sort; 401; 403.

### 12.3 `GET /users/:userId` — detail
- **AuthZ**: Super Admin any; HR in scope; Reporting Manager if assigned; else 404/403 (FR-004.66). Includes for Super Admin `account: { status, mustChangePassword, lockedUntil, lastLoginAt }`, `credentialDelivery: { status, lastAttemptAt }` (non-secret). Errors 401/403/404.

### 12.4 `GET /me/profile`
- **AuthZ**: any authenticated user, own record. Returns profile + `completeness { complete, missing[], assignedHr }`. Never other users.

### 12.5 `GET /users/:userId/minimal-profile`
- **AuthZ**: IT with task relationship; Super Admin. Returns minimal projection (FR-004.64). Errors 403/404.

### 12.6 `PATCH /users/:userId/profile`
- **Purpose**: update profile fields per ownership.
- **AuthZ**: Super Admin (all fields); HR (employmentStatus, departmentId, designationId, locationId, reportingManagerUserId; target in scope).
- **Request**: `{ "expectedVersion": 3, "reason": "Corrected location after master update", "changes": { "locationId": "uuid", "assignedHrUserId": "HR000004" } }`
- **Response 200**: updated profile + `assignmentReviewRequired`, `activeTransferSnapshotUnaffected`.
- **Validation**: ≥ 1 change; each changed field per §14; `reason` required when org fields or employment status change; version check.
- **Errors**: 400; 403 `FIELD_NOT_EDITABLE`; 404; 409 `PROFILE_VERSION_CONFLICT`, `DUPLICATE_EMPLOYEE_ID`, `DUPLICATE_OFFICIAL_EMAIL`; 422 `MASTER_DATA_INVALID`, `REPORTING_MANAGER_INVALID`, `ASSIGNEE_NOT_IN_SCOPE`.

### 12.7 `PUT /users/:userId/role`
- **AuthZ**: Super Admin. **Request**: `{ "role": "HR", "reason": "…", "profile": {…optional missing fields}, "scope": {…} }`. **Response 200**: `{ userId, previousRole, role, sessionsInvalidated: true }`.
- **Errors**: 403; 404; 409 `ROLE_UNCHANGED`; 422 `ROLE_NOT_PROVISIONABLE`, `PROFILE_INCOMPLETE_FOR_ROLE`, `ROLE_CHANGE_BLOCKED_ACTIVE_ASSIGNMENTS` (details: counts), `LAST_SUPER_ADMIN_PROTECTED`, `SELF_ACTION_NOT_ALLOWED`.

### 12.8 `POST /users/:userId/deactivate` and `POST /users/:userId/activate`
- **AuthZ**: Super Admin. **Request**: `{ "reason": "…" }` (required for deactivate; optional for activate `[PROPOSED]`, TDD-004.12). **Response 200**: `{ userId, accountStatus, sessionsInvalidated }` plus `pendingWork { assignedEmployees, activeTransfer, openTasks }` on deactivate. **Errors**: 403; 404; 409 `ACCOUNT_ALREADY_INACTIVE` / `ACCOUNT_NOT_INACTIVE`; 422 `LAST_SUPER_ADMIN_PROTECTED`, `SELF_ACTION_NOT_ALLOWED`.

### 12.9 `POST /users/:userId/reset-credentials`
- **AuthZ**: Super Admin. **Request**: `{ "reason": "User forgot password" }` (optional). **Response 200**: `credentials { userId, temporaryPassword, shownOnce:true }`, `delivery {…}`, `mustChangePassword: true`, `sessionsInvalidated: true`; `Cache-Control: no-store`. **Errors**: 403; 404; 409 `ACCOUNT_INACTIVE`; 422 `SELF_ACTION_NOT_ALLOWED`.

### 12.10 `POST /users/:userId/unlock`
- **AuthZ**: Super Admin. **Request**: `{ "remarks": "…" }` optional. **Response 200**: `{ userId, accountStatus }`. **Errors**: 403; 404; 409 `ACCOUNT_NOT_LOCKED`.

### 12.11 `GET /users/:userId/lifecycle-events`
- **AuthZ**: Super Admin (HR scoped view via SPEC-013). Paginated list of user lifecycle audit records (actor, role, action, previous/new, reason, time). Reads via SPEC-013 query API; no credentials.

### 12.12 Lookups
- `GET /users/lookups/reporting-managers?locationId&q` — Super Admin, HR: active `REPORTING_MANAGER` users (id, name, location).
- `GET /users/lookups/assignment-candidates?locationId&departmentId` — Super Admin: `{ hr: [...], it: [...] }` per FR-004.21.

## 13. Frontend Implementation

Existing foundations (skimmed): `frontend/src/services/http-client.ts`, `services/user.service.ts` (currently only `getCurrentUser`), `redux/slices/userSlice.ts`, `hooks/usePermission.ts`, `data/navigation.ts`, `components/ui/{Button,EmptyState,Loader}`, `components/layout/*`. Note: `navigation.ts` currently uses role labels (`'Super Admin'`, `'Manager'`); SPEC-002/003 normalise to the contract enum — this SPEC consumes the normalised enum.

Routes (App Router) `[PROPOSED]`:

| Path | Role | Content |
|---|---|---|
| `frontend/src/app/(protected)/admin/users/page.tsx` | Super Admin | Users table |
| `…/admin/users/new/page.tsx` | Super Admin | Create wizard |
| `…/admin/users/[userId]/page.tsx` | Super Admin | Detail tabs: Profile, Assignments, Account, Activity |
| `…/employees/page.tsx` | HR, Reporting Manager | Scoped employee list (read-only for manager) |
| `…/employees/[userId]/page.tsx` | HR, Reporting Manager, IT(minimal) | Detail / HR correction form |
| `…/profile/page.tsx` | All | Own profile + completeness banner |

Components under `frontend/src/components/users/`: `UserTable`, `UserFilters`, `StatusBadge`, `CreateUserWizard`, `RoleSelectStep`, `ProfileStep`, `MappingStep` (master pickers, HR/IT candidate selector), `ReviewStep`, `CredentialsDialog`, `ConfirmActionDialog`, `ReasonField`, `ProfileEditForm` (fields disabled by ownership), `AccountActionsPanel`, `LifecycleTimeline`, `DeliveryStatusChip`, `ProfileCompletenessBanner`.

Behaviour: client-side validation mirrors backend (UX only; backend authoritative, BRD-026); master dropdowns load only active records; role-aware navigation shows Users only for Super Admin and Employees list for HR/Reporting Manager; field-level read-only rendering from a server-provided `editableFields[]` array in detail responses (not hard-coded) `[PROPOSED]`; confirmation dialogs name the target user and consequences (e.g. "All active sessions will be signed out"); deactivation dialog shows pending-work counts; optimistic-lock conflict (409) offers reload; loading skeletons, empty states, no-access page, error boundary; debounced search (`useDebounce`); keyboard accessible, focus-trapped dialogs, `aria-live` for validation, desktop/tablet responsive.

## 14. Validation Rules

| Field | Rule `[PROPOSED]` |
|---|---|
| role | One of enum; must be enabled in registry |
| employeeId | trimmed, 3–30 chars, `^[A-Za-z0-9][A-Za-z0-9._/-]*$`; format policy TDD-004.06 |
| fullName | trimmed, 1–150 chars, letters/spaces/`'.-` and Unicode letters; no control chars |
| officialEmail | RFC 5322 practical pattern, ≤ 254, lower-cased; optional domain allow-list `OFFICIAL_EMAIL_DOMAINS` (empty = off) |
| employmentStatus | in value set (TDD-004.05) |
| departmentId/designationId/locationId | uuid, exists and active in SPEC-003 |
| reportingManagerUserId | `^MGR\d{6}$` (or registry prefix for Receiving Manager if enabled), role `REPORTING_MANAGER`, status ≠ `INACTIVE`, ≠ self, no cycle |
| assignedHrUserId / assignedItUserId | existing active HR / IT user in candidate set for the location/department |
| scope (HR/IT) | non-empty `locationIds`, all active; HR optional `departmentIds` |
| reason | trimmed, 1–1000 chars; required matrix TDD-004.12 |
| expectedVersion | integer ≥ 1 |
| pagination/sort | per contract; sort field allow-list; `q` ≤ 100 chars, wildcard-escaped |
| General | strip/reject unknown fields; sanitise strings; parameterised queries only (Sequelize); no `eval` |

## 15. Authorization & Security Rules

- Chain per BRD-026: Authenticated User → Role → Organisation Scope → Resource → Action, implemented by SPEC-002; this SPEC registers: resource `USER` actions `CREATE, VIEW, UPDATE_PROFILE, CHANGE_ROLE, ACTIVATE, DEACTIVATE, RESET_CREDENTIALS, UNLOCK, VIEW_LIFECYCLE`; resource `EMPLOYEE_PROFILE_OWN` action `VIEW`.
- Scope resolution: HR → locations/departments via `ScopeResolver`; Reporting Manager → ACTIVE `reporting_manager_assignments.reporting_manager_user_id = actor` (SPEC-003, via `ScopeResolver`); IT → task relationship; applied in SQL.
- Frontend hiding is UX only; backend enforces everything (BRD-026). Direct API (Postman) calls are rejected for any role/scope/action violation.
- Credentials: shown once, `no-store`, never logged/audited/persisted in clear; `Secret` wrapper; redaction paths; log-scan test.
- Mass-assignment protection: DTO allow-list; `role`, `accountStatus`, `passwordHash`, `mustChangePassword` are never accepted from generic profile PATCH.
- Authorisation denials on these resources are recorded as security events by SPEC-002/013 `[BRD-026, BRD-037]`.
- Rate limiting for admin credential endpoints: config via SPEC-001 `[PROPOSED]`, values not set here.
- Enumeration safety: duplicate-check errors name the field only; non-privileged out-of-scope lookups return 404.
- Official e-mail and employee data are personal information (NFR-004/007): responses minimise fields per role; transport protection per SPEC-001/015 (TLS arrangement is TDD in contract §5(o)).

## 16. Workflow / State Transition Rules

This SPEC has no transfer workflow. Account lifecycle transitions:

| From | Action | Actor | To | Guard |
|---|---|---|---|---|
| (none) | Create | Super Admin | PENDING_ACTIVATION | validations + enabled role |
| PENDING_ACTIVATION | First login + password change | User (SPEC-002) | ACTIVE | — |
| ACTIVE / PENDING_ACTIVATION / LOCKED | Deactivate | Super Admin | INACTIVE | not self, not last SA |
| INACTIVE | Activate | Super Admin | ACTIVE or PENDING_ACTIVATION | by `must_change_password` |
| ACTIVE / PENDING_ACTIVATION | 5 failed logins | System (SPEC-002) | LOCKED | — |
| LOCKED | Unlock / 30-min expiry | Super Admin / System | previous status | status = LOCKED |
| any except INACTIVE | Reset credentials | Super Admin | unchanged; `must_change_password = true` | not self |
| any | Role change | Super Admin | unchanged status; new role | guards FR-004.42 |

Any other combination returns 409 with the specific code; transfer-workflow `INVALID_WORKFLOW_TRANSITION` does not apply here.

## 17. Transaction & Concurrency Rules

- Creation: one `withTransaction` covering sequence increment, account insert, profile insert, scope mapping, audit, outbox. Failure at any step rolls back all; the sequence number is not consumed.
- Same-prefix concurrent creations serialise on the `user_id_sequences` row; unique constraints on `users.user_id`, `employee_id`, `official_email` are the final guard; `23505` → 409.
- Profile edits use optimistic locking (`version`); update is `WHERE user_id = :id AND version = :expected`; zero rows ⇒ `PROFILE_VERSION_CONFLICT`.
- Account actions run in a transaction with the SPEC-002 state change + audit + outbox; the user row is locked (`SELECT … FOR UPDATE`) to prevent a concurrent deactivate/activate/reset interleaving; idempotence: repeating deactivate returns 409 `ACCOUNT_ALREADY_INACTIVE` (no duplicate audit).
- Two simultaneous resets: last committed wins; the earlier temp password is dead; both are audited; only the last response's password works (documented in UI notice).
- Notification delivery is asynchronous after commit; never part of the transaction's success criterion; retry never re-executes provisioning `[BRD-036]`.
- The response (including secret) is returned only after commit; if the client loses the response, recovery is a credential reset.

## 18. Audit Requirements

Written via `AuditService.record(event,{trx})` in the same transaction as the change. Common fields: actor user_id, actor role, action code, entity type `USER`, entity id (target user_id), request id, timestamp, previous/new values (allow-listed), previous/new status where applicable, remarks/reason. Forbidden keys (guard throws in tests/dev, drops in prod): `password`, `temporaryPassword`, `passwordHash`, `token`, `refreshToken`, `secret`, `credentials`.

| Event code `[PROPOSED]` | Trigger | Fields captured | BRD |
|---|---|---|---|
| USER_CREATED | Successful creation | new userId, role, employeeId, official email (as stored), org mappings, assigned HR/IT, created by; account status PENDING_ACTIVATION | BRD-008, 022 |
| USER_CREDENTIALS_GENERATED | Creation / reset | target, generated-by, `mustChangePassword=true`, delivery channel EMAIL; **no secret** | BRD-005, 008 |
| USER_CREDENTIALS_DELIVERY_QUEUED | Outbox row enqueued | target, event code, outbox id | BRD-036 |
| USER_PROFILE_UPDATED | Profile edit | changed fields previous/new, actor role, reason, version | BRD-022, 029 |
| USER_ASSIGNMENT_CHANGED | Reporting Manager / HR / IT assignment changed | previous/new assignee, reason | BRD-016, 022 |
| USER_ROLE_CHANGED (security) | Role change | previous/new role, reason, sessions invalidated | BRD-037 |
| USER_ACTIVATED | Activate | previous/new account status, remarks | BRD-008 |
| USER_DEACTIVATED | Deactivate | previous/new status, reason, sessions invalidated, pending-work counts | BRD-008, 025 |
| USER_CREDENTIALS_RESET (security) | Admin reset | target, reset-by, reason, `mustChangePassword=true`, sessions invalidated; **no secret** | BRD-008, 037 |
| USER_UNLOCKED (security) | Admin unlock | target, unlocked-by, previous lock expiry, remarks | BRD-008, 037 |
| USER_ADMIN_ACTION_DENIED (security) | 403 on these resources | actor, role, action, target, reason (emitted by SPEC-002 hook) | BRD-026 |

Not emitted here: login failures, automatic lock, first-login password change (SPEC-002); audit log reading/export (SPEC-013).

## 19. Notification Requirements

| Event | Recipient | Channel | Trigger task | BRD |
|---|---|---|---|---|
| USER_ACCOUNT_CREATED | New user (official company e-mail) | Email only | TASK-004.12/.13 | BRD-005, BRD-036 |
| CREDENTIAL_RESET | The user (official company e-mail) | Email only | TASK-004.17 | BRD-007, BRD-036 |

Message content: User ID, temporary password, portal login URL (config `PORTAL_BASE_URL`), instruction to change password at first login. Mandatory, Email only, no In-app (BRD-036 channel rule). No other notifications are introduced here (deactivation, role change and assignment-change notices are not BRD-mandated; BRD-023 "activation (where approved)" is not assumed). Failure handling: SPEC-012 retry/logging; provisioning unaffected.

## 20. Error & Edge Cases

| Case | Behaviour |
|---|---|
| Two admins create same employee simultaneously | One succeeds; other gets 409 duplicate; no orphan rows |
| Duplicate differs only by case/whitespace | Treated as duplicate (FR-004.06) |
| E-mail delivery fails | Creation stays committed; delivery status FAILED visible; admin runs credential reset |
| Admin loses the one-time credentials | Credential reset; old password already dead |
| Official e-mail mistyped (valid format, wrong mailbox) | Cannot be detected; admin edits e-mail then resets credentials |
| Location/department deactivated after creation | Profile flagged invalid (FR-004.37); Employee cannot submit until corrected by HR/Super Admin |
| No HR candidate for the location | Creation of Employee/Reporting Manager refused `NO_HR_CONFIGURED_FOR_LOCATION` |
| Reporting Manager later deactivated / role-changed | Employees flagged `invalid` completeness; list filter shows them; Super Admin/HR reassigns manager |
| Reporting Manager cycle (A→B→A) | 422 `REPORTING_MANAGER_INVALID` |
| HR edits an out-of-scope employee | 404 (non-revealing) or 403 per FR-004.66 |
| HR submits a field it does not own | Whole request 403 `FIELD_NOT_EDITABLE` |
| Profile edit while Employee has active transfer | Allowed; snapshot unaffected (FR-004.35); response flags it |
| Employment Status set to non-Active while a transfer is active | No automatic workflow effect is defined by the BRD; recorded in TDD-004.10 context for Gate 1 |
| Sequence exhausted for a prefix | 500 `USER_ID_SEQUENCE_EXHAUSTED`, logged, nothing created |
| Role change to SUPER_ADMIN / RECEIVING_MANAGER while disabled | 422 `ROLE_NOT_PROVISIONABLE` |
| Deactivating last Super Admin / self | 422 |
| Reset on inactive account | 409 `ACCOUNT_INACTIVE` |
| Unlock on non-locked account | 409 `ACCOUNT_NOT_LOCKED` |
| Stale edit form | 409 `PROFILE_VERSION_CONFLICT`, UI reload prompt |
| Credential response cached by proxy/browser | Prevented by `no-store`; dialog state cleared on close |
| Client double-submits create | Second attempt hits duplicate validation (409) |

## 21. Acceptance Criteria

- **SPEC-004.AC01** (BRD-004, 009) Given a Super Admin, when it submits a valid Employee with all mappings, then an account `EMP######` and profile are created in one transaction, status `PENDING_ACTIVATION`, `must_change_password = true`, and a 201 with credentials is returned.
- **SPEC-004.AC02** (BRD-004) Given valid Reporting Manager / HR / IT payloads, when created, then User IDs start `MGR`/`HR`/`IT` with exactly six digits.
- **SPEC-004.AC03** (BRD-004) Given concurrent creations of the same role, when 50 run in parallel, then all User IDs are unique and no sequence value is skipped on rolled-back attempts.
- **SPEC-004.AC04** (BRD-004, 016) Given an HR or IT payload with scope locations, when created, then the scope mapping is stored in the same transaction (rollback removes it).
- **SPEC-004.AC05** (BRD-004) Given the same Employee ID or official e-mail (any case) already exists, when creating, then 409 `DUPLICATE_EMPLOYEE_ID` / `DUPLICATE_OFFICIAL_EMAIL` and no account/profile/sequence change.
- **SPEC-004.AC06** (BRD-004, 025) Given account creation, then the temporary password is ≥ 8 chars with upper, lower, number and special, generated by a CSPRNG, and passes SPEC-002 policy validation.
- **SPEC-004.AC07** (BRD-004, 025) Given a temporary password, then it has no time-based expiry and works until the first successful login.
- **SPEC-004.AC08** (BRD-005, 006) Given creation or reset, when inspecting DB, logs and audit records, then no plaintext temporary password exists (only `password_hash`).
- **SPEC-004.AC09** (BRD-005) Given a successful creation, then the credentials appear only in that response with `Cache-Control: no-store` and are not retrievable by any later API call.
- **SPEC-004.AC10** (BRD-005, OQ-03, 036) Given creation, then a `USER_ACCOUNT_CREATED` Email-only notification to the official e-mail is enqueued in the same transaction.
- **SPEC-004.AC11** (BRD-036) Given the mail service is down, when a user is created, then creation succeeds, delivery status is FAILED/RETRYING, and the failure is logged; retry does not recreate the user.
- **SPEC-004.AC12** (BRD-029) Given Department/Designation/Location input, then only active master IDs are accepted; free text or inactive IDs are rejected `MASTER_DATA_INVALID`.
- **SPEC-004.AC13** (BRD-029) Given Super Admin edits Employee ID, Name, Official E-mail, HR/IT assignment, then the edit succeeds with audit previous/new values.
- **SPEC-004.AC14** (BRD-029) Given HR in scope edits Department/Designation/Location/Reporting Manager/Employment Status with a reason, then it succeeds and audit records previous/new, actor, role, reason.
- **SPEC-004.AC15** (BRD-029) Given HR attempts to edit Employee ID, Name, Email or HR/IT assignment, then 403 `FIELD_NOT_EDITABLE` and nothing changes.
- **SPEC-004.AC16** (BRD-029) Given an Employee with missing/invalid mandatory data, then `getMandatoryDataStatus` returns the missing fields and the assigned HR; after HR/Super Admin correction it returns `complete: true`.
- **SPEC-004.AC17** (BRD-029) Given an Employee requests a profile edit through any user endpoint, then 403 (no write path exists).
- **SPEC-004.AC18** (BRD-029, OQ-19) Given an HR edit, then no external system is called and the response states portal-only change.
- **SPEC-004.AC19** (BRD-029) Given an Employee with an active transfer, when profile org fields change, then the Transfer Request's stored values are unchanged.
- **SPEC-004.AC20** (BRD-007, 025) Given Super Admin resets credentials, then a new temp password is shown once and e-mailed, `must_change_password = true`, all sessions invalidated, old password unusable.
- **SPEC-004.AC21** (BRD-007) Given reset on a `PENDING_ACTIVATION` account, then the status stays `PENDING_ACTIVATION` and the previous temp password stops working.
- **SPEC-004.AC22** (BRD-025) Given a `LOCKED` account, when Super Admin unlocks, then login is possible again, failed attempts cleared, event audited.
- **SPEC-004.AC23** (BRD-007) Given deactivation, then the user cannot log in, protected API calls fail and sessions are invalidated; the audit records reason.
- **SPEC-004.AC24** (BRD-007) Given activation of an `INACTIVE` account, then status returns to `ACTIVE` (or `PENDING_ACTIVATION` if first login never completed).
- **SPEC-004.AC25** (BRD-002) Given deactivation, credential reset, role change or unlock in the UI, then a confirmation dialog naming the user and consequence precedes the call.
- **SPEC-004.AC26** (BRD-007) Given a user lacks Super Admin role, then every account action returns 403.
- **SPEC-004.AC27** (BRD-010, 037) Given a role change with reason, then role updates, sessions invalidate, and `USER_ROLE_CHANGED` is audited as a security event.
- **SPEC-004.AC30** (BRD-012) Given a Reporting Manager, when listing users, then only employees whose ACTIVE `reporting_manager_assignments` (SPEC-003) manager is that user are returned.
- **SPEC-004.AC31** (BRD-013) Given an HR user, when listing, then only employees within HR's location/organisation scope are returned and totals count only them.
- **SPEC-004.AC32** (BRD-014) Given an IT user with an assigned task, when requesting the minimal profile, then only the minimal fields are returned; without a task relationship 403/404.
- **SPEC-004.AC33** (BRD-011) Given an Employee, when calling `GET /me/profile`, then own department, designation, location and Reporting Manager are returned and no other user is accessible.
- **SPEC-004.AC34** (BRD-002) Given Super Admin on Users list, then search, sort, filters, pagination, status badges and empty/loading/error states work.
- **SPEC-004.AC35** (BRD-016) Given an Employee's location with exactly one HR candidate, then HR is auto-assigned; with several, selection is required; with none, creation is refused.
- **SPEC-004.AC40** (BRD-008, 022) Given each action in §18, then exactly one audit record is written in the same transaction with actor, role, action, entity, previous/new values and reason.
- **SPEC-004.AC41** (BRD-037, NFR-003) Given any audit record from this SPEC, then it contains no password, temporary password, hash or token.
- **SPEC-004.AC42** (BRD-037) Given an audit write failure, then the business change rolls back (audit is in the same transaction).

## 22. Negative Acceptance Criteria

- **SPEC-004.NAC01** (BRD-039 Security: direct API) Given a non-Super-Admin token, when `POST /users` is called directly, then 403 and nothing is created.
- **SPEC-004.NAC02** Given no/expired token, when any endpoint is called, then 401.
- **SPEC-004.NAC03** Given a request body with `role: SUPER_ADMIN` while disabled, then 422 `ROLE_NOT_PROVISIONABLE`.
- **SPEC-004.NAC04** Given a PATCH body containing `role`, `accountStatus`, `passwordHash` or `mustChangePassword`, then rejected (unknown/forbidden field) and nothing changes.
- **SPEC-004.NAC05** Given a creation payload with Reporting Manager that is an Employee, inactive, itself, or cyclic, then 422 `REPORTING_MANAGER_INVALID`.
- **SPEC-004.NAC06** Given a free-text department/designation/location, then rejected.
- **SPEC-004.NAC07** Given a failed transaction step (e.g. scope mapping error), then no user, profile, sequence consumption, audit row or outbox row remains.
- **SPEC-004.NAC10** (BRD-039 Security: scope) Given HR of Location A, when requesting an employee of Location B by direct API, then 404/403 without leaking data.
- **SPEC-004.NAC11** (BRD-039 Security: Employee isolation) Given Employee X, when requesting `GET /users/<Employee Y>`, then 403/404; only `/me/profile` is available.
- **SPEC-004.NAC12** Given a Reporting Manager, when requesting an employee not assigned to them, then 404.
- **SPEC-004.NAC13** (BRD-039 Security: IT scope) Given an IT user with no task for the employee, when requesting minimal-profile, then 403 and the list endpoint is 403.
- **SPEC-004.NAC14** Given HR edits an employee outside its scope or a field it does not own, then 403/404 and no change.
- **SPEC-004.NAC20** (BRD-039 first-login bypass) Given a freshly created or reset account, then `must_change_password = true` is persisted (SPEC-002 test uses it to prove protected APIs are refused before change).
- **SPEC-004.NAC21** (BRD-039 locked user) Given an account locked by failed attempts, then `unlock` by non-Super-Admin is 403; account stays locked.
- **SPEC-004.NAC22** (BRD-039 deactivated user) Given a deactivated user, then login and protected calls fail, and the old token is rejected immediately.
- **SPEC-004.NAC23** (BRD-039 old password) Given a credential reset, then the previous password and previous temporary password fail login.
- **SPEC-004.NAC24** Given self-deactivation, self-reset, own role change or last Super Admin, then 422 and no change.
- **SPEC-004.NAC30** Given the temporary password, then it never appears in application logs, error responses, audit rows, outbox plaintext columns or test snapshots (log-scan test).
- **SPEC-004.NAC31** Given stale `expectedVersion`, then 409 `PROFILE_VERSION_CONFLICT`, no overwrite.
- **SPEC-004.NAC32** Given deactivate repeated twice, then second returns 409 without a duplicate audit record.

## 23. Testing Requirements

Test locations: `tests/backend/users/` and `tests/frontend/users/`. Framework: Jest (BE) / Jest + React Testing Library (FE) per INT guidelines `[PROPOSED]`.

| Type | Scope | TC IDs |
|---|---|---|
| Unit | UserIdGenerator formatting/overflow; TemporaryPasswordGenerator (class guarantees, randomness source mocked, charset, policy self-check); Secret redaction; FieldOwnershipPolicy matrix; OrganisationMappingValidator; AssignmentDerivation rules; DTO validators | TC-004.01–TC-004.30 |
| Integration | Create flow for each role; rollback at each step; duplicate handling; scope mapping; account actions with SPEC-002 stubs; completeness service; candidate derivation | TC-004.31–TC-004.45 |
| API | Every endpoint × role × scope matrix (200/401/403/404/409/422); response envelope; `Cache-Control: no-store`; filters/pagination/projection per role | TC-004.46–TC-004.55 |
| Security | Secret never in logs/audit/outbox plaintext (log-scan with sentinel password); mass-assignment; enumeration; role guard; self-lockout guards | TC-004.56–TC-004.62 |
| Concurrency | 50 parallel creates (unique IDs, no gaps after rollbacks); parallel duplicate employee ID/email; parallel profile edits (version); parallel deactivate/reset | TC-004.63–TC-004.67 |
| Workflow | Account status transition table §16 | TC-004.68–TC-004.70 |
| Frontend | Wizard validation; credentials dialog (no Redux/localStorage/URL leak, acknowledge-to-close); confirmation dialogs; field read-only per `editableFields`; list states; a11y checks | TC-004.71–TC-004.80 |
| Negative | The 20 defined NACs (NAC01–NAC07, NAC10–NAC14, NAC20–NAC24, NAC30–NAC32) mapped 1:1 in order: NAC01–NAC07 → TC-004.81–.87; NAC10–NAC14 → TC-004.88–.92; NAC20–NAC24 → TC-004.93–.97; NAC30–NAC32 → TC-004.98–.100 | TC-004.81–TC-004.100 |

Mapping highlights: AC01→TC-004.31; AC03→TC-004.63; AC05→TC-004.34/.64; AC08→TC-004.56; AC09→TC-004.48; AC20→TC-004.40; NAC10→TC-004.88; NAC30→TC-004.57.

## 24. Definition of Done
- All tasks TASK-004.01–.33 complete; migrations run up/down cleanly on PostgreSQL.
- All AC/NAC pass; no skipped tests; coverage of this module's services/domain ≥ project threshold (set by SPEC-001/016; no number mandated here).
- Secret-leak scan test green (logs, audit, DB, responses other than the one-time response).
- Every endpoint authorised through SPEC-002 with documented role/scope/action; verified by direct-API tests.
- Audit events in §18 verified against SPEC-013 catalogue; notification events registered with SPEC-012.
- ESLint/TypeScript clean; INT standards respected (async/await, try/catch, structured logger, env-var secrets, input validation, no AI-generated comments).
- OpenAPI fragment and interface notes for SPEC-006/007/009 published.
- Gate 1 decisions recorded for all TDD items (or explicitly deferred with feature flags off).
- Gate 2 code review passed; dashboard, `status.md`, `prompt_history.md` synchronised.

---

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-004.01 | User ID prefix for Receiving Manager and Super Admin | Receiving Manager `MGR`; Super Admin `ADM`; both disabled by flag until decided | ID format, registry, SPEC-002 login |
| TDD-004.02 | How a Receiving Manager is created (BRD-004 lists four roles only) | Same `POST /users` with role `RECEIVING_MANAGER` once enabled; scope from SPEC-003 mapping | Role registry, SPEC-003/007 |
| TDD-004.03 | Default Super Admin bootstrap and creation of further Super Admins | Seeder from env (`BOOTSTRAP_SUPER_ADMIN_*`, forced password change); further Super Admins by existing Super Admin when flag on; last-SA protection | Deployment, SPEC-001/002 |
| TDD-004.04 | May a user hold more than one role? | No; single `users.role` | Data model, authorization |
| TDD-004.05 | Employment Status value set | `ACTIVE, INACTIVE, TERMINATED, SEPARATED, RESIGNED`; only `ACTIVE` eligible | Check constraint, SPEC-006 eligibility |
| TDD-004.06 | Relationship/format of Employee ID vs User ID | Employee ID admin-supplied business identifier distinct from generated User ID; lenient pattern; unique | Validation, duplicate rule |
| TDD-004.07 | **Same decision as TDD-012.04 (master)**: credential e-mail payload vs "no plaintext in PostgreSQL" (outbox persistence) | [RECONCILED R-12] Recommended default is now Option B (post-commit in-process send, nothing persisted; reset is the recovery path); Option A (encrypted transient secret, AES-256-GCM, nulled on success/terminal failure) is the alternative. Full option list in TDD-012.04 | NFR-003, SPEC-012 design, retry semantics **[DECIDED 2026-10-07 — Option B]** Approved: in-memory handoff, no plaintext persistence (PostgreSQL, logs, audit, files, any storage); only the hash is stored; plaintext held in memory only for delivery via the approved channel, unrecoverable afterwards; valid until first successful login, then forced change, after which the temporary hash no longer authenticates. Option A (`notification_secrets`) is not selected. Source: decision text supplied by the spec author; the formal Gate 1 record is still to be captured in `pr_reviews/GATE1-*`. |
| TDD-004.08 | Required profile fields per role; IT assignment optional?; HR/IT choice among several candidates | Matrix in FR-004.09; IT optional; Super Admin picks among candidates | Creation validation, SPEC-009 routing |
| TDD-004.09 | Role change: ID immutability; guards for active assignments | ID immutable; refuse while assignments exist | Audit, UX, data integrity |
| TDD-004.10 | Deactivation / non-Active employment status with pending work or active transfer | Allow with warning; Super Admin reassigns (SPEC-010); no automatic workflow effect | SPEC-007/010/015 |
| TDD-004.11 | [RECONCILED R-13] ONE merged Gate 1 decision: TDD-004.11 = TDD-015.03 (profile org-value update on transfer completion; also who edits profile data). Recommended default (both): transfer values stay on the Transfer Request; no automatic profile update unless the business decides; if decided, SPEC-009 completion calls SPEC-004 `applyTransferOutcome` inside the completion transaction. Who/when profile org fields update after transfer completion | System call `applyTransferOutcome` from SPEC-009 at completion (only if the merged decision says yes) | SPEC-009, data currency **[DECIDED 2026-10-07]** On Completed (after IT Final Approval) the system automatically updates the employee's current organisation profile (Dept/BU, Designation, Location, Reporting Manager, other approved transfer metadata) from the final approved values on the Transfer Request; no manual profile update afterwards; Employee ID unchanged; applied in the same completion transaction (failure rolls back completion, transfer stays PENDING_IT_FINAL_APPROVAL); audited with previous/new value, transfer reference, system actor, timestamp. Implemented by SPEC-009 FR-009.56a / TASK-009.16. Source: decision text supplied by the spec author; formal Gate 1 record pending. Open sub-points: HR/IT assignment re-derivation from the new Location and profile scope-cache refresh (SPEC-003/004). |
| TDD-004.12 | Which admin actions require a mandatory reason | Required: deactivate, role change, org-field edits, assignment changes; optional: activate, reset, unlock | UX, audit |
| TDD-004.13 | IT minimal field set (include official e-mail?) | name, employee ID, department, designation, location; e-mail excluded | NFR-007, SPEC-009 |
| TDD-004.14 | Activation target status and whether admin may activate a Pending Activation account | Restore by `must_change_password`; no manual activation of Pending | SPEC-002 state model |
| TDD-004.15 | Temp password length/charset; portal URL in e-mail | Length 14, ambiguous chars excluded; `PORTAL_BASE_URL` config | UX, security |
| TDD-004.16 | Official e-mail domain restriction | Optional allow-list config, off by default | Validation |

## Out of Scope (this SPEC)
Per BRD Out of Scope, and nothing here introduces them: SSO/MFA/identity provider (BRD-025: out of current phase); automatic HR-system integration or synchronisation and updates to any external HR master (BRD-OQ-19); Facilities/Admin role; historical data migration and bulk user import/backfill; payroll calculation. Also excluded from SPEC-004 because owned elsewhere: login, lockout counters, session timeout and forced-change enforcement (SPEC-002); master data and scope mapping administration (SPEC-003); transfer-time HR organisation changes and BRD-024 re-approval (SPEC-008); reassignment of workflow tasks (SPEC-010); notification templates/dispatch (SPEC-012); audit viewing/export (SPEC-013); self-service password change/forgot-password (SPEC-002). No eligibility, tenure, probation or other HR restriction is defined here (BRD-029 rules 2 and 8).
