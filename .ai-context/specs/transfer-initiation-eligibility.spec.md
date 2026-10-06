# SPEC-006 — Employee Transfer Initiation, Eligibility & Submission

## Feature ID
transfer-initiation-eligibility

## Status
Draft — not yet submitted for Gate 1

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 1 (Spec Peer Review) | — | — | Not submitted | — |
| Gate 2 (Code Review) | — | — | Not started | — |

## Intent & Business Goals
Give an Employee a self-service, role-scoped portal journey to (1) see their own profile (department, designation, location, Reporting Manager), (2) browse available internal vacancies, (3) be told up-front whether they are eligible, (4) prepare a transfer request as an editable Draft, (5) submit it exactly once with a unique transfer reference so the approval workflow starts, and (6) track current and historical requests (stage timeline, pending action/owner, decision reasons, completion date) `[BRD-011]`.

The spec owns the `transfer_requests` entity, the eligibility engine for the rules the portal can evaluate (BRD-029 rules 1, 3, 4, 5, 6), Effective Transfer Date validation at submission (BRD-031), the one-active-request guarantee enforced in both the backend and the database (BRD-030), Draft editing (BRD-032), and the employee-side tracking screens. It deliberately builds **no** other eligibility rule (tenure, probation, disciplinary, notice-period, performance) `[BRD-029 rules 2, 8]`.

## User Roles & Actors
- **Employee** (`EMPLOYEE`): the only actor of every endpoint in this spec; acts on own data only.
- **Reporting Manager** (`REPORTING_MANAGER`): passive actor — notified at submission and becomes the first pending owner (approval logic is SPEC-007).
- **HR** (`HR`): passive actor — the "assigned HR team" the Employee is directed to when profile data is missing; HR corrections themselves happen in SPEC-004/SPEC-008.
- **Super Admin** (`SUPER_ADMIN`): passive — owns master/profile data the Employee cannot edit (SPEC-003/004).
- **System** (`WorkflowEngine`, `NotificationService`, `AuditService`, `VacancyService`): collaborators.

---

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-006 |
| Title | Employee Transfer Initiation, Eligibility & Submission |
| Slug / file | `transfer-initiation-eligibility` / `.ai-context/specs/transfer-initiation-eligibility.spec.md` |
| Task prefix | `TASK-006.MM` |
| Purpose | Employee-side initiation: profile view, vacancy discovery, eligibility, Draft, submission, tracking; owns `transfer_requests`. |
| Business objective | Let employees submit valid transfer requests against configured departments, locations, designations and vacancies without manual follow-up (BRD Objectives; BRD-011). |
| Version | 0.1 (2026-10-06) |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer (per roster) | Project Manager / Product Owner |
| Classification tags | `[BRD]` stated by BRD · `[DERIVED]` follows from BRD text · `[PROPOSED]` proposed technical design · `[TDD-REQUIRED]` Technical Design Decision Required — Not Defined by BRD (listed at the end as `TDD-006.NN`) |

## 2. Why This SPEC Exists
The transfer request is the central business record. Every later spec (approvals, HR review, payroll, IT, exceptions, dashboards) reads or transitions a row that this spec creates. Four BRD rules must be correct at the moment of creation and cannot be retrofitted: the single-active-request guarantee (BRD-030, mandatory DB enforcement), eligibility/mandatory-data gating before submission (BRD-029), the effective-date window (BRD-031), and the "no capacity reserved at submission / browse" rule (BRD-028). It also provides the Employee's only window into the workflow (BRD-011 tracking) while leaving all state-machine logic to SPEC-007.

## 3. BRD Traceability

### 3.1 BRD requirements

| BRD ID | Slice implemented here | Coverage |
|---|---|---|
| BRD-011 | Employee: view own profile (dept, designation, location, Reporting Manager); browse eligible internal vacancies; submit request (proposed department, location, designation, vacancy, effective date, optional reason); unique reference; track status/stage timeline/pending actions/decision reasons/completion dates; current and historical requests; respond-to-clarification **entry point** only. (Login and first-login password change → SPEC-002.) | FULL for portal screens/APIs listed; PARTIAL for clarification response logic (SPEC-007) and login (SPEC-002) |
| BRD-027 | Matrix row `Draft → Employee → Submit → Pending Reporting Manager Approval` (Employee editing: Yes; Reporting Manager notified; **no vacancy reservation**); registration of the SUBMIT handler with the engine. All other rows owned by 007/008/009/010. | PARTIAL (Submit row only) |
| BRD-029 | Employee-side evaluation of rules 1, 3, 4, 5, 6; rules 2 and 8 explicitly **not built**; rule 7 (HR validation) is SPEC-008; system behaviour (not submitted, validation message, no capacity reserved); missing-mandatory-data handling incl. example message, HR direction, no employee edit, no invention of data; "new request revalidates eligibility". Source-of-truth field ownership enforcement matrix → SPEC-015. | PARTIAL (employee-side) |
| BRD-030 | Active/final status sets; one active request per employee; Draft not active; backend + DB enforcement; HTTP 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`; existing request unchanged; no cool-down; new request after closed one (new ID, revalidation, no approvals reused, earlier request kept as history). | FULL |
| BRD-031 | Submission side: rule `Current Date ≤ Effective Transfer Date ≤ Current Date + 30 Days`, business time zone, inclusive, fixed, no past dates, weekends/holidays allowed, Employee sets/modifies only in Draft, backend authoritative. HR/Super Admin changes, expired-date correction, optional re-approval → SPEC-008/009/007 (they reuse this spec's validator). | PARTIAL (submission side) |
| BRD-032 | Draft slice: Employee edits **all** fields in Draft only; no Employee edit after submission (backend rejection). Post-submission changes by HR/Super Admin → SPEC-008. | PARTIAL (Draft) |
| BRD-033 | "Apply again" slice only: a new application is a new request with new reference, eligibility and vacancy revalidated, no approvals carried forward, rejected request stays in history. Rejection itself → SPEC-007/008. | PARTIAL |
| BRD-028 | Slice only: Available vacancy definition used for selection; submission and browsing reserve nothing. | PARTIAL |
| BRD-017 | Consumer only (reads vacancy status/availability through SPEC-005). | PARTIAL |
| BRD-016 | Consumer of Employee → department/designation/location/Reporting Manager/assigned HR relationships (data owned by SPEC-003/004). | PARTIAL |
| BRD-036 | Events "Transfer submitted" (Employee) and "Approval required" (assigned approver = Reporting Manager) triggered at submission via outbox; delivery owned by SPEC-012. | PARTIAL |
| BRD-037 / BRD-022 | Audit events emitted by this spec (section 18); log content/visibility → SPEC-013. | PARTIAL |
| BRD-026 | Employee-scope authorisation on every endpoint (own records only); 401/403 semantics. | PARTIAL |
| BRD-034 | Employee-side display of an open clarification and the entry point; response processing → SPEC-007. | PARTIAL |
| BRD-039 | Rows listed in 3.5. | PARTIAL |

### 3.2 NFR IDs

| NFR | Slice | Coverage |
|---|---|---|
| NFR-002 | Role + own-scope checks in the backend for every endpoint | PARTIAL |
| NFR-007 | Employee sees only own profile/requests; HR contact exposes only minimum fields | PARTIAL |
| NFR-005 | Audit events emitted (verification in SPEC-013) | PARTIAL |
| NFR-006 | Idempotent submission outcome (no duplicate request on retry/double-click); notification retry is SPEC-012 | PARTIAL |
| NFR-008 | Accessible, responsive employee screens with loading/empty/no-access/error states | PARTIAL |

### 3.3 BRD-OQ implemented

| OQ | Resolution implemented here |
|---|---|
| BRD-OQ-16 | (a) Blocked/Info Required count as active; (b) missing-data handling; (c) HR-ineligible path is SPEC-008 (not here); (d) same vacancy may be re-requested after a closed request, no extra restriction. |
| BRD-OQ-17 | (a) Draft not active; (b) backend + DB enforcement; (c) 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`; (d) no cool-down. |
| BRD-OQ-19 | Portal is operational source; employee cannot edit controlled data; masters only (no free text); no HR-system sync; employee directed to assigned HR team. (Enforcement matrix: SPEC-015.) |
| BRD-OQ-20 | (a) Employee sets/modifies date in Draft only; (b) business time zone, inclusive, fixed 30 days. (c)(d) are SPEC-007/008/009. |
| BRD-OQ-15(d) | "Available" = status OPEN AND available capacity > 0, used for vacancy selection. |
| BRD-OQ-12 / 18(d) | Draft excluded from Block/Resume/Cancel/Reassign; Employee may edit or discard Draft (Withdraw logic is SPEC-010; this spec only shows the entry point). |

### 3.4 Business rules and Acceptance Criteria (BRD "Acceptance Criteria" bullets)

| BRD Acceptance Criteria bullet | Coverage | Spec AC |
|---|---|---|
| "An eligible employee can view permitted vacancies, submit a valid transfer request and receive a unique reference number." | FULL | SPEC-006.AC03, AC10, AC12 |
| Eligibility (BRD-029) — active/valid/no other active/available vacancy; inactive/terminated/separated/resigned, active-or-approved-not-Completed, missing data, Full/On Hold/Closed → not submitted + message + no capacity; new request after Completed/Rejected/Withdrawn/Cancelled; HR revalidation at HR Review | PARTIAL (employee side; HR revalidation SPEC-008) | AC04–AC09, AC20 |
| Employee data (BRD-029) — portal is source, field ownership, masters only, missing data handling and HR direction, employee cannot edit controlled data, never invent data | PARTIAL | AC06, AC07, NAC09, NAC10 |
| One-active-request rule (BRD-030) — all active statuses, 409 + message, Draft not active, backend + DB enforcement, simultaneous submissions, new request after closed one with new ID/revalidation/no approvals reused/history unchanged | FULL | AC13–AC17, AC20 |
| Effective Transfer Date (BRD-031) — accept today..+30 inclusive, reject past/beyond, weekends/holidays accepted, Employee cannot change after submission | PARTIAL (HR/Super Admin/expired/re-approval parts in 007/008/009) | AC11, AC12, AC21–AC23 |
| Rejection & resubmission (BRD-033) — new application = new reference, revalidated, full workflow restarted | PARTIAL | AC20 |
| Clarification (BRD-034) — reply under same reference | PARTIAL (entry point) | AC25 |
| Transition matrix Submit row (BRD-027) | PARTIAL | AC12, AC14 |

Business rules (BRD "Business Rules"): eligibility paragraph, source-of-truth paragraph, one-active paragraph, effective-date paragraph, editing paragraph (Draft slice) — implemented as section 9.

### 3.5 Negative scenarios (BRD-039 rows)

| BRD-039 row | Slice | Spec NAC |
|---|---|---|
| Security — An Employee cannot access another Employee's transfer request | FULL | NAC01, NAC02 |
| Security — Direct API access cannot bypass backend role/scope/resource/action authorisation | PARTIAL (this spec's endpoints) | NAC03, NAC04, NAC05 |
| Workflow — Invalid workflow transitions are rejected | PARTIAL (Employee edit/submit/discard on non-Draft) | NAC06, NAC07 |
| Workflow — A Completed transfer cannot be modified through the normal workflow | PARTIAL (Employee-side edit refused) | NAC06 |
| Vacancy — A Full vacancy cannot receive a new allocation/reservation | PARTIAL (not selectable; nothing reserved at submission) | NAC11, NAC12 |

---

## 4. Dependencies

| Depends on | What this spec needs | Gating |
|---|---|---|
| SPEC-001 | `withTransaction`, error classes, response envelope, validation middleware, config loader (incl. `BUSINESS_TIME_ZONE`), logger, migration conventions, `AuditService.record`, `NotificationService.enqueue` (outbox), UI kit | Hard |
| SPEC-002 | JWT auth, RBAC, `AuthorizationService.authorize`, `ScopeResolver` (resolves current user → `employee_profiles.id`), 401/403 behaviour, first-login-password-change gate | Hard |
| SPEC-003 | Master tables (locations, departments/business units, designations) and their active flags; HR location/organisation-scope mapping for HR-team resolution | Hard |
| SPEC-004 | `employee_profiles` (employee ID, name, official email, employment status, dept/BU, designation, location, reporting manager, assigned HR) and the employment-status value set | Hard |
| SPEC-005 | `vacancies` + `VacancyDiscoveryService.listAvailableForEmployee` and `VacancyService.checkSelectable` / selection read [RECONCILED names per SPEC-005 11.x] and status/capacity math. This spec only **reads**; never reserves | Hard for vacancy tasks |
| SPEC-007 | `WorkflowEngine.transition`, `transfer_workflow_history`, `transfer_task_assignments`, `transfer_clarifications`, `getAllowedActions`, status registry | **Gates the submit-to-workflow tasks and the timeline (marked "GATED on SPEC-007 core")**; draft, eligibility, date, browse tasks are not gated |
| SPEC-012 | Template/dispatch of the two notifications (this spec only enqueues) | Soft (outbox rows still written) |
| SPEC-013 | Audit visibility (this spec only emits) | Soft |

## 5. Enables
SPEC-007 (receives the SUBMITted request in `PENDING_REPORTING_MANAGER_APPROVAL`), SPEC-008 (HR revalidates eligibility using this spec's `EligibilityService` and edits post-submission data on `transfer_requests`), SPEC-009/010 (read/update `transfer_requests`; 010 relies on the active-status set and the one-active index), SPEC-014 (worklists/reports read `transfer_requests`), SPEC-015 (field-ownership matrix, snapshot behaviour), SPEC-016 (traceability and negative scenarios).

## 6. Roles & Scope

| Role | Allowed in this spec | Scope |
|---|---|---|
| EMPLOYEE | All endpoints in section 12 | Own `employee_profiles` record and own `transfer_requests` only `[BRD-026]` |
| REPORTING_MANAGER, RECEIVING_MANAGER, HR, IT | None (their views of transfers are SPEC-007/008/009/014) | — |
| SUPER_ADMIN | None of the employee-self-service endpoints (administrative views: SPEC-003/010/014) `[DERIVED]` BRD-011 describes Employee actions; Super Admin has no stated right to act as an Employee | — |

To avoid colliding with the multi-role transfer endpoints of SPEC-007, every endpoint here lives under the `/api/v1/my/...` prefix `[PROPOSED]`.

---

## 7. Functional Requirements

### 7.1 Employee profile view
- **FR-006.01** `[BRD-011]` The Employee can view own profile: employee ID, name, department/business unit, designation, location, Reporting Manager (name and user ID), employment status. Read-only; no edit control is offered for any field `[BRD-029 — controlled data]`.
- **FR-006.02** `[DERIVED BRD-029 rule 6 + missing-data handling]` The profile response includes `missingMandatoryFields[]` (computed by the eligibility engine) and, when data is missing, the `hrContact` of the assigned HR team.
- **FR-006.03** `[BRD-011, NFR-007]` The profile endpoint returns only the authenticated Employee's data; the Employee ID is never taken from a request parameter.

### 7.2 Vacancy discovery
- **FR-006.04** `[BRD-011]` The Employee can browse internal vacancies through `GET /api/v1/my/transfer-vacancies`, which calls SPEC-005 `VacancyDiscoveryService.listAvailableForEmployee` (facade over `GET /api/v1/vacancy-discovery`) [RECONCILED].
- **FR-006.05** `[BRD-029 rule 5, BRD-028(d)]` Only vacancies with status `OPEN` and available capacity > 0 are selectable. Full, On Hold and Closed vacancies are never returned as selectable; if a vacancy id for such a vacancy is submitted it is refused (`VACANCY_NOT_AVAILABLE`).
- **FR-006.06** `[BRD-028]` Browsing, filtering, selecting a vacancy in a Draft and submitting **never** reserve, lock or decrement capacity. No write to `vacancies` / `vacancy_reservations` is performed by any code path of this spec (enforced by a test, TC-006.57).
- **FR-006.07** `[TDD-REQUIRED TDD-006.04]` "Subject to visibility rules" (BRD-011) is undefined. Recommended default `[PROPOSED]`: all vacancies that are available are visible to every Active Employee; capacity numbers are not exposed, only `isAvailable`.
- **FR-006.08** `[PROPOSED]` Filters: `departmentId`, `locationId`, `designationId`, free-text `q` (vacancy reference), pagination per the shared convention.

### 7.3 Eligibility engine
- **FR-006.09** `[BRD-029]` `EligibilityService.evaluate(employeeId, { vacancyId? })` returns `{ eligible: boolean, failures: [{ ruleCode, field?, message }] }`. It evaluates, and only evaluates, these rules:

| Rule # (BRD-029) | `ruleCode` `[PROPOSED]` | Check |
|---|---|---|
| 1 Employment Status | `EMPLOYMENT_STATUS_NOT_ACTIVE` | `employee_profiles.employment_status` equals the "Active" value (value set `[TDD-REQUIRED TDD-006.03]`). Inactive, terminated, separated and resigned fail. |
| 3 Existing Active Transfer | `ACTIVE_TRANSFER_EXISTS` | No `transfer_requests` row for the employee with a status in `ACTIVE_STATUSES` (section 9.2). |
| 4 Pending Transfer Restriction | `ACTIVE_TRANSFER_EXISTS` (same code) | `[DERIVED]` An approved transfer that has not reached Completed is by definition in an active status (HR Processing, Payroll Processing, Pending IT Action, Pending IT Final Approval, Pending Receiving Manager Re-Approval, Blocked), so the rule-3 query covers it. One query, reported once; the audit/test mapping keeps both rule numbers. |
| 5 Vacancy Availability | `VACANCY_NOT_AVAILABLE` | Selected vacancy exists, status `OPEN`, available capacity > 0 (read through SPEC-005). Only evaluated when `vacancyId` is supplied. |
| 6 Employee & Organisation Data | `PROFILE_INCOMPLETE` | Employee ID, current Department/BU, Designation, Location, Reporting Manager and Employment Status are all present and reference existing records. |

- **FR-006.10** `[BRD-029 rules 2, 8]` No tenure, probation, disciplinary, notice-period, performance or other company-specific rule is implemented or assumed. The service contains no extension hook that could silently enable one; adding a rule requires an approved BRD change. A unit test asserts the rule list is exactly the four codes above (TC-006.07).
- **FR-006.11** `[BRD-029 "System behaviour"]` When not eligible: the request is **not submitted** (no `transfer_requests` state change), the Employee receives a validation message per failure, and no capacity is reserved.
- **FR-006.12** `[BRD-029 rule 7]` Eligibility is **revalidated** by HR at Pending HR Review (SPEC-008). `EligibilityService` is exported for SPEC-008 reuse; SPEC-008 owns the HR rules.
- **FR-006.13** `[BRD-029]` `GET /api/v1/my/transfer-eligibility` exposes the evaluation for UX (banner, disabling Submit). It is advisory: the submit endpoint always re-evaluates in its own transaction.

### 7.4 Missing mandatory data handling
- **FR-006.14** `[BRD-029]` If any mandatory field of rule 6 is missing/incorrect: submission is refused (HTTP 422 `EMPLOYEE_PROFILE_INCOMPLETE` `[PROPOSED]` code), no capacity is reserved, the response names the missing fields, and the Employee sees exactly: *"Your employee profile is incomplete. Please contact HR to update the required organisation information before submitting an Internal Transfer Request."* `[BRD-029 example message]`.
- **FR-006.15** `[BRD-029]` The Employee is directed to the **assigned HR team determined from the Employee's configured Location / HR assignment**: `hrContact = { teamLabel, users: [{ name, officialEmail }] }` resolved from `employee_profiles.assigned_hr_user_id`, else from SPEC-003 location → HR scope mapping. If no HR can be resolved, `hrContact` is `null` and the generic message is shown; nothing is invented `[TDD-REQUIRED TDD-006.10]`.
- **FR-006.16** `[BRD-029]` The Employee cannot modify controlled organisation/master data through any endpoint of this spec. The Draft accepts only the transfer-form fields (7.5); a request body containing profile fields (e.g. `currentDepartmentId`, `employmentStatus`, `reportingManagerId`) is rejected as unknown (`VALIDATION_ERROR`) `[DERIVED]`.
- **FR-006.17** `[BRD-029]` The portal never invents, defaults or substitutes missing organisation data (no fallback department, no guessed manager, no "Unassigned" placeholder written to `transfer_requests`).
- **FR-006.18** `[BRD-029]` After HR/Super Admin corrects the data (SPEC-004/008), eligibility and required data are revalidated at the next evaluation/submit; no cached eligibility result is persisted `[DERIVED]`.

### 7.5 Draft creation, editing, discard
- **FR-006.19** `[BRD-032, BRD-027]` An Employee can create a Draft (`status = DRAFT`) holding the transfer-form fields: `proposedDepartmentId`, `proposedLocationId`, `proposedDesignationId`, `vacancyId`, `effectiveTransferDate`, optional `reason`. All are optional while in Draft (partial save); mandatory ones are enforced at submit.
- **FR-006.20** `[BRD-032]` The Employee can edit **all** of those fields, any number of times, only while `status = DRAFT`. Any Employee attempt to edit a submitted request is refused by the backend with HTTP 403 `INVALID_WORKFLOW_TRANSITION` ("The requested action is not permitted for the current transfer status.") and nothing changes `[BRD-027, BRD-026]`. Front-end read-only display is UX only.
- **FR-006.21** `[BRD-030]` A Draft is **not** an active request: it does not count toward the one-active rule, is not returned as active in eligibility, and is not covered by the active partial unique index.
- **FR-006.22** `[BRD-030, DERIVED]` Because "an employee cannot create or submit another transfer request while an existing one is active", creating a Draft while an active request exists is refused with HTTP 409 `ACTIVE_TRANSFER_ALREADY_EXISTS` (same message). Full eligibility (employment status, profile data, vacancy) is **not** required to hold a Draft; it is enforced at submit `[TDD-REQUIRED TDD-006.07]`.
- **FR-006.23** `[BRD-018(d) OQ-18(d)]` The Employee can discard a Draft. Block/Resume/Cancel/Reassign do not apply to a Draft (SPEC-010 refuses them). Discard is not a workflow status `[DERIVED]`: it sets `discarded_at` `[PROPOSED]` (retention `[TDD-REQUIRED TDD-006.13]`) and is audited.
- **FR-006.24** `[PROPOSED TDD-006.06]` At most one non-discarded Draft per Employee (partial unique index). A second create returns the existing Draft's id in `409 DRAFT_ALREADY_EXISTS`.
- **FR-006.25** `[PROPOSED]` Draft updates use optimistic concurrency (`version` integer) so two browser tabs do not silently overwrite each other (`409 VERSION_CONFLICT`).
- **FR-006.26** `[BRD-031]` Every Draft create/update that carries `effectiveTransferDate` is validated by the date rule (7.6); invalid → HTTP 422 `INVALID_EFFECTIVE_DATE`, stored value unchanged.

### 7.6 Transfer form and validation
- **FR-006.27** `[BRD-011, BRD-029]` Department/BU, Designation, Location and Vacancy must be chosen from configured master data (never free text). The backend verifies each id exists and is active in the corresponding master (SPEC-003/005) → else 422 `INVALID_MASTER_REFERENCE`.
- **FR-006.28** `[TDD-REQUIRED TDD-006.08]` When a vacancy is selected, its department, designation and location are the proposed target. Recommended default `[PROPOSED]`: the form pre-fills the three proposed fields from the vacancy (read-only after selection) and the backend refuses a mismatch (422 `VACANCY_ORG_MISMATCH`).
- **FR-006.29** `[BRD-011]` `reason` is optional; stored trimmed; max length `[TDD-REQUIRED TDD-006.14]` (recommended 1000 characters).
- **FR-006.30** `[BRD-031]` Effective Transfer Date rule `Current Date ≤ Effective Transfer Date ≤ Current Date + 30 Days`:
  - "Current date" = the calendar date now in the application/server-configured **business time zone** (`BUSINESS_TIME_ZONE` env, IANA name) — not the browser's and not UTC unless that is the configured zone.
  - Past date → rejected (`PAST_DATE`); today → allowed; today+30 calendar days → allowed (inclusive); today+31 → rejected (`BEYOND_MAX_DATE`); limit fixed in code, not user- or admin-configurable.
  - A future date is not mandatory (no minimum notice) but the field itself is required to submit `[DERIVED BRD-011 lists effective date among submitted fields]`.
  - Weekends and holidays are allowed; no holiday/weekend calendar is consulted.
  - Applied to every role: the validator is a shared `EffectiveDateService.validate(date, {now?})` exported for HR/Super Admin changes in SPEC-008/009/007.
  - Validated server-side on Draft save **and again at submit** (a Draft saved last week may now hold a past date).
  - Format is strict `YYYY-MM-DD` (a calendar date, no time component) `[PROPOSED]`.
- **FR-006.31** `[PROPOSED]` `GET /api/v1/my/transfer-date-rules` returns server-computed `today`, `minDate`, `maxDate`, `timeZone` so the date picker uses the business date; UX only, never authoritative `[BRD-026, BRD-031]`.

### 7.7 Submission
- **FR-006.32** `[BRD-027]` Submit moves `DRAFT → PENDING_REPORTING_MANAGER_APPROVAL` via `WorkflowEngine.transition(SUBMIT)` (SPEC-007), always to the Reporting Manager first. No vacancy reservation occurs.
- **FR-006.33** `[BRD-029, BRD-030, BRD-031, BRD-011]` Submit pre-conditions are checked in this order inside one DB transaction: (1) authenticated EMPLOYEE owning the Draft; (2) row is `DRAFT` and not discarded; (3) no active request exists (else 409); (4) eligibility rules 1, 5, 6 (rule 3/4 already done in step 3); (5) required form fields present; (6) master references valid; (7) vacancy still available and consistent; (8) effective date valid now. Failures in steps 4–8 are collected and returned together where independent.
- **FR-006.34** `[BRD-011, TDD-REQUIRED TDD-006.01/02]` On success a unique **transfer reference** is generated and stored (format and assignment moment are TDD; recommended `TRF-` + 6-digit PG-sequence value, assigned at submission) and returned to the Employee.
- **FR-006.35** `[BRD-029 / BRD-OQ-19(c)]` At submission the organisation values in force are **snapshotted** onto the request (current department/BU, designation, location, Reporting Manager, assigned HR, employment status, employee ID) together with `snapshot_taken_at`. These stored values are what the workflow uses afterwards; later profile edits do not alter an in-flight request (HR changes during processing update the request via SPEC-008).
- **FR-006.36** `[BRD-027, BRD-036]` In the same transaction: transfer workflow history row (SUBMIT), a pending-task assignment for the Reporting Manager (both via the engine/SPEC-007), audit rows, and outbox rows for `TRANSFER_SUBMITTED` (Employee) and `APPROVAL_REQUIRED` (Reporting Manager). Notification delivery is asynchronous; a delivery failure never fails or rolls back the submission `[BRD-036]`.
- **FR-006.37** `[BRD-030]` If an active request exists (checked in code **and** caught by the DB unique index), the submission is rejected with HTTP 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`, message exactly *"You already have an active internal transfer request. Please wait until the existing request is completed or closed before submitting a new request."*; the existing request is left unchanged (no write to it).
- **FR-006.38** `[NFR-006, PROPOSED]` Repeating the submit call for a Draft that has just been submitted (double-click/retry) never creates a second request: it returns 409 `ACTIVE_TRANSFER_ALREADY_EXISTS` while that request is active, or 403 `INVALID_WORKFLOW_TRANSITION` if it is already closed.

### 7.8 One-active-request enforcement
- **FR-006.39** `[BRD-030]` Active statuses: all except `DRAFT`, `COMPLETED`, `REJECTED`, `WITHDRAWN`, `CANCELLED` (Blocked/On Hold and Info Required are active). Final statuses: Completed, Rejected, Withdrawn, Cancelled.
- **FR-006.40** `[BRD-030 "mandatory backend + database"]` Three layers: (a) per-employee serialisation lock, (b) service pre-check, (c) **partial unique index** `uq_transfer_requests_one_active_per_employee` on `transfer_requests(employee_id)` `WHERE status` not in the non-active set. The index is the last line of defence; SQLSTATE 23505 on that index is mapped to the 409 response.
- **FR-006.41** `[BRD-030]` Same-vacancy duplicates are prevented by the same rule (one active request regardless of vacancy). No cool-down after Completed: a new request may be submitted immediately.
- **FR-006.42** `[BRD-030, BRD-033]` A new request after a closed one: new row, new id and new reference; eligibility and vacancy availability revalidated; workflow restarts via the engine from `DRAFT → SUBMIT`; no approvals, clarifications or history copied; the earlier row is untouched.

### 7.9 Employee tracking
- **FR-006.43** `[BRD-011]` `GET /api/v1/my/transfer-requests` lists the Employee's own requests (Drafts, active, closed), filterable by `view=current|history|all`, newest first.
- **FR-006.44** `[BRD-011]` `GET /api/v1/my/transfer-requests/{id}` returns: reference, status, proposed values, snapshot values, effective date, reason, submitted/closed/completion dates, **stage timeline** (from `transfer_workflow_history`), **pending action and owner** (from `transfer_task_assignments`), **decision reasons** (rejection/withdrawal/cancellation/clarification reasons recorded in history), open clarification (if any), and `allowedActions` (from `WorkflowEngine.getAllowedActions`) — the UI never decides permitted actions itself.
- **FR-006.45** `[BRD-011, BRD-034]` When `allowedActions` contains `RESPOND_CLARIFICATION`, the detail screen renders a "Respond to clarification" entry point that calls SPEC-007's endpoint; when it contains `WITHDRAW`, a Withdraw entry point that calls SPEC-010's endpoint. This spec implements neither action.
- **FR-006.46** `[TDD-REQUIRED TDD-006.12]` Which timeline entries and which reasons the Employee may see ("as permitted by policy", BRD-029) is undefined. Recommended default: all status transitions and all decision/clarification reasons for the Employee's own request are visible; internal remarks flagged `internal` by SPEC-007/008 are not.
- **FR-006.47** `[BRD-011]` Completed requests show the completion date (`completed_at`, set by SPEC-009).

### 7.10 Audit and notifications
- **FR-006.48** `[BRD-037]` Material actions emit audit events in the same transaction (section 18).
- **FR-006.49** `[BRD-036]` Submission enqueues the two notification events (section 19).

---

## 8. Internal Implementation Plan / Tasks

Order is dependency order. "GATED on SPEC-007 core" = cannot be completed/merged until SPEC-007's `WorkflowEngine.transition`, `transfer_workflow_history` and `transfer_task_assignments` exist (engine contract can be stubbed behind an interface for earlier unit testing).

| Task | Title | Layer | Description | Inputs → Outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-006.01 | Migration: `transfer_requests`, reference sequence, constraints, indexes | DB | Create table, `transfer_reference_seq`, CHECK constraints (status set, submitted-row completeness), partial unique indexes (one active per employee; one draft per employee; unique reference), supporting indexes, FKs to `employee_profiles`, masters, `vacancies`. Down migration. | SPEC-001/003/004/005 migrations → schema | SPEC-001, 003, 004, 005 migrations | BRD-030, BRD-029, BRD-011 |
| TASK-006.02 | Status constants and Sequelize model/repository | BE | `transfer-status.ts` (`TRANSFER_STATUS`, `ACTIVE_STATUSES`, `FINAL_STATUSES`), `TransferRequest` model, `TransferRequestRepository` (all queries take optional `trx`). A unit test asserts the migration index predicate equals the constant. | schema → typed access | TASK-006.01 | BRD-030, BRD-019 |
| TASK-006.03 | `EffectiveDateService` + business-time-zone config | BE | Pure functions: `getBusinessToday(now, tz)`, `validate(dateStr)`, `getWindow()`; env `BUSINESS_TIME_ZONE` required at boot (no hard-coded zone); exported for SPEC-007/008/009. | date string, clock → `{valid, code}` | SPEC-001 config | BRD-031, OQ-20 |
| TASK-006.04 | Employee profile view service + endpoint | BE | `EmployeeProfileViewService.getOwnProfile(ctx)`; `GET /my/transfer-profile`; computes `missingMandatoryFields`, `hrContact` (via TASK-006.05 helper). | ctx → profile DTO | SPEC-002, 004, TASK-006.05 | BRD-011, BRD-029 |
| TASK-006.05 | `EligibilityService` (rules 1,3,4,5,6) + HR-contact resolver | BE | Implements 7.3/7.4; `evaluate`, `resolveHrContact`; rule list frozen; shared with SPEC-008. | employeeId, vacancyId? → result | TASK-006.02, SPEC-004, 003, 005 | BRD-029, BRD-030 |
| TASK-006.06 | Form-options and vacancy-browse facades + endpoints | BE | `GET /my/transfer-form-options` (active masters, read-only), `GET /my/transfer-vacancies` (via SPEC-005 read API; no writes), `GET /my/transfer-date-rules`. | filters → lists | SPEC-003, 005, TASK-006.03 | BRD-011, BRD-028, BRD-029 |
| TASK-006.07 | Draft field validator | BE | Shared validator used by Draft save and submit: master refs, vacancy availability and org match, reason length, date rule; returns structured `details[]`. | draft fields → validation result | TASK-006.03, 06 | BRD-029, BRD-031, BRD-032 |
| TASK-006.08 | Draft service + endpoints (create / update / discard / read) | BE | `POST/PATCH/DELETE /my/transfer-requests`, optimistic `version`, one-draft rule, active-exists check on create, ownership scope, audit. | DTOs → Draft | TASK-006.02, 05, 07, SPEC-002 | BRD-032, BRD-030, BRD-018(d) |
| TASK-006.09 | Transfer reference generator | BE | `ReferenceGenerator.next(trx)` using `transfer_reference_seq`; format per TDD-006.01 default. | trx → string | TASK-006.01 | BRD-011, BRD-030 |
| TASK-006.10 | Submission service: lock, pre-checks, snapshot, 23505 mapping | BE | Implements 7.7/7.8 steps (1)–(8) except engine call; per-employee advisory lock; snapshot; maps unique violation to 409; returns structured failures. Runs against an `IWorkflowEngine` interface. | draftId, ctx → prepared submission | TASK-006.02, 05, 07, 09, SPEC-001 trx helper | BRD-030, BRD-029, BRD-031 |
| TASK-006.11 | Register SUBMIT handler with `WorkflowEngine` (GATED on SPEC-007 core) | BE | Register transition `DRAFT --EMPLOYEE:SUBMIT--> PENDING_REPORTING_MANAGER_APPROVAL`; guard = TASK-006.10 pre-checks; effects: set status/reference/`submitted_at`, history row, Reporting Manager task assignment, audit, outbox (`TRANSFER_SUBMITTED`, `APPROVAL_REQUIRED`). | engine API → handler | TASK-006.10, SPEC-007 core, SPEC-001 outbox | BRD-027, BRD-036 |
| TASK-006.12 | `POST /my/transfer-requests/{id}/submit` endpoint (GATED on SPEC-007 core) | BE | Controller/route/validators; response shape 12.8; error mapping. | request → 200/409/422 | TASK-006.11 | BRD-011, BRD-030 |
| TASK-006.13 | Tracking query service + list/detail endpoints | BE | List (not gated). Detail incl. timeline, pending owner, decision reasons, open clarification, `allowedActions` (GATED on SPEC-007 core for these parts; returns empty arrays until then behind a feature guard). | ctx, id → DTO | TASK-006.02, SPEC-007 core | BRD-011, BRD-034 |
| TASK-006.14 | Authorisation policies | BE | Register resource `transfer_request` / actions (`create_draft`, `update_draft`, `discard_draft`, `submit`, `view_own`) for EMPLOYEE with own-record scope; unknown role/foreign record → 403 without data. | policy config | SPEC-002 | BRD-026 |
| TASK-006.15 | Audit & error-code wiring | BE | Emit events (sec. 18) with `AuditService.record({trx})`; error classes for codes in sec. 12.12; request-id propagation. | events | SPEC-001 | BRD-037, BRD-022 |
| TASK-006.16 | FE service layer, types, Redux slice | FE | `frontend/src/services/transfer-requests.service.ts`, `types/transfer.ts`, slice for list/draft state; error-code → UI-message map. | API contract → typed client | TASK-006.04–13 contracts | BRD-011 |
| TASK-006.17 | FE: My Profile page | FE | `employee/profile` page, read-only, incomplete-profile banner with HR contact. | profile API → UI | TASK-006.16 | BRD-011, BRD-029 |
| TASK-006.18 | FE: Vacancy browse page | FE | `employee/vacancies`: filters, table/cards, "Start transfer" action, empty/no-vacancy state, no capacity numbers. | vacancies API → UI | TASK-006.16 | BRD-011, BRD-028 |
| TASK-006.19 | FE: Eligibility panel component | FE | Reusable `EligibilityPanel` showing failures with the exact missing-data message and HR contact. | eligibility API → UI | TASK-006.16 | BRD-029 |
| TASK-006.20 | FE: Transfer form (create/edit Draft) | FE | `employee/transfers/new`, `employee/transfers/[id]/edit`; master selects, vacancy picker, date picker bounded by server date rules, reason, autosave-on-demand "Save draft", discard confirm. | APIs → UI | TASK-006.16, 18, 19 | BRD-032, BRD-031 |
| TASK-006.21 | FE: Submit flow and error handling | FE | Review/confirm dialog; handle 201/200, 409 `ACTIVE_TRANSFER_ALREADY_EXISTS` (exact message + link to existing request), 422 families, VERSION_CONFLICT; show reference on success. (GATED on SPEC-007 core for end-to-end.) | submit API → UI | TASK-006.12, 20 | BRD-011, BRD-030 |
| TASK-006.22 | FE: My Transfers list | FE | `employee/transfers`: Current and History tabs, status badges, pagination, empty/error states. | list API → UI | TASK-006.16 | BRD-011 |
| TASK-006.23 | FE: Transfer detail / tracking page | FE | `employee/transfers/[id]`: summary, stage timeline, pending action + owner, decision reasons, completion date, clarification entry point and withdraw entry point from `allowedActions`. | detail API → UI | TASK-006.13, 16 | BRD-011, BRD-034 |
| TASK-006.24 | FE: Accessibility, responsive, shared states | FE | Loading/empty/no-access/error states, keyboard/ARIA, responsive desktop/tablet. | — | TASK-006.17–23 | NFR-008, BRD-002 |
| TASK-006.25 | QA: Unit tests | QA | Date service, eligibility rules, validators, reference format, status-set parity, draft rules. | — | TASK-006.02–10 | all |
| TASK-006.26 | QA: Integration and API tests | QA | Endpoint contracts, authorisation, error codes, snapshot, no-reservation proof. | — | TASK-006.04–13 | all |
| TASK-006.27 | QA: Concurrency tests | QA | Simultaneous submissions (same draft, raw-SQL double insert), index parity. | — | TASK-006.10–12 | BRD-030 |
| TASK-006.28 | QA: Frontend tests | QA | Component and page tests incl. 409/422 handling and accessible states. | — | TASK-006.17–23 | BRD-011 |
| TASK-006.29 | QA: Security and negative tests | QA | NAC01–NAC22 execution incl. direct API calls. | — | TASK-006.12–14 | BRD-026, BRD-039 |
| TASK-006.30 | QA: Workflow integration check with SPEC-007 (GATED on SPEC-007 core) | QA | Submit → history/assignment/outbox rows exist; second submit refused; new request after Rejected/Withdrawn/Cancelled/Completed. | — | TASK-006.11, 12 | BRD-027, BRD-030 |

---

## 9. Business Rules

### 9.1 Rules list

| ID | Rule | Source |
|---|---|---|
| BR-006.01 | An Employee may submit only when: Active + valid organisation data + no active request + Available vacancy; HR validation follows later (SPEC-008). | BRD-029 |
| BR-006.02 | No minimum-tenure rule; no disciplinary/probation/notice-period/performance rule is implemented. | BRD-029 rules 2, 8 |
| BR-006.03 | Not eligible → not submitted, validation message, no capacity reserved. | BRD-029 |
| BR-006.04 | Missing mandatory data → cannot submit, cannot self-edit, directed to assigned HR (from Location / HR assignment), data never invented. | BRD-029, OQ-16, OQ-19 |
| BR-006.05 | One Employee = max one submitted active request; Draft is not active; enforcement in backend **and** database. | BRD-030, OQ-17 |
| BR-006.06 | Duplicate-active submission → 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`; existing request unchanged. | BRD-030 |
| BR-006.07 | No cool-down after Completed. | BRD-030, OQ-17(d) |
| BR-006.08 | Every new request after a closed one: new id/reference, eligibility + vacancy revalidated, workflow restarts, no approvals reused, earlier record kept. | BRD-030, BRD-033 |
| BR-006.09 | Effective date: today ≤ date ≤ today+30 (calendar days, inclusive, fixed), business time zone, no past dates, weekends/holidays allowed. | BRD-031 |
| BR-006.10 | Employee sets/changes the date and every other field only in Draft; nothing after submission. | BRD-031, BRD-032 |
| BR-006.11 | Department, Designation, Location, Vacancy only from portal masters; never free text. | BRD-029 |
| BR-006.12 | No vacancy capacity is reserved at browse, Draft or submission. | BRD-028, BRD-027 |
| BR-006.13 | Submit always routes first to the Reporting Manager. | BRD-027 |
| BR-006.14 | A Draft is not subject to Block/Resume/Cancel/Reassign. | OQ-18(d) |
| BR-006.15 | In-flight requests use the snapshot values stored on the request, not live profile values. | BRD-029 / OQ-19(c) |
| BR-006.16 | Rule 4 ("approved not Completed blocks") is implemented by the active-status set `[DERIVED]`. | BRD-029 |

### 9.2 Status sets (values consumed from SPEC-001 `common/constants/transfer-status.ts`; used by the SPEC-006 migration/index, SPEC-007/010)

[RECONCILED] Decision R-3: ONE constants module owned by SPEC-001 (FR-001.24): `TRANSFER_STATUS`, `ACTIVE_STATUSES`, `FINAL_STATUSES`, `HR_CONTROLLED_STAGES`, `IT_CONTROLLED_STAGES`. SPEC-006 (index/CHECK predicate generation), SPEC-007 (`workflow.constants.ts` re-exports, never redefines), SPEC-010 and SPEC-014 import it; former names `ACTIVE_TRANSFER_STATUSES`/`FINAL_TRANSFER_STATUSES`/`HR_CONTROLLED`/`IT_CONTROLLED` are retired.

| Set | Members (`[PROPOSED]` codes, labels `[BRD-019/027]`) |
|---|---|
| `ACTIVE_STATUSES` | `PENDING_REPORTING_MANAGER_APPROVAL`, `PENDING_RECEIVING_MANAGER_APPROVAL`, `INFO_REQUIRED`, `PENDING_HR_REVIEW`, `HR_PROCESSING`, `PENDING_RECEIVING_MANAGER_REAPPROVAL`, `PAYROLL_PROCESSING`, `PENDING_IT_ACTION`, `PENDING_IT_FINAL_APPROVAL`, `BLOCKED` |
| `FINAL_STATUSES` | `COMPLETED`, `REJECTED`, `WITHDRAWN`, `CANCELLED` |
| Non-active | `DRAFT` ∪ final set |

SPEC-006 owns the constants file because the DB index predicate depends on it; SPEC-007 consumes it and must not redefine it. Any new status requires a migration that updates both the CHECK constraint and the index predicate (TC-006.08 enforces parity).

### 9.3 Eligibility decision table (employee side)

| Employment status | Mandatory org data | Active request | Vacancy available | Outcome |
|---|---|---|---|---|
| Active | complete | none | yes | Eligible → may submit (then HR validates) |
| not Active | any | any | any | `EMPLOYMENT_STATUS_NOT_ACTIVE` |
| Active | missing | any | any | `PROFILE_INCOMPLETE` + HR guidance |
| Active | complete | exists | any | `ACTIVE_TRANSFER_EXISTS` → 409 on submit |
| Active | complete | none | Full/On Hold/Closed/absent | `VACANCY_NOT_AVAILABLE` |

---

## 10. Data Model & Database

### 10.1 Table `transfer_requests` (owned by SPEC-006) `[PROPOSED]`

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | UUID PK | no | `gen_random_uuid()` |
| `transfer_reference` | VARCHAR(32) | yes | Unique when not null; set at submission (TDD-006.01/02); never changed |
| `employee_id` | UUID FK → `employee_profiles(id)` | no | The requesting Employee [RECONCILED] Decision R-2: employee_id = employee_profiles(id); user refs = users(id) uuid |
| `status` | VARCHAR(48) | no | CHECK in the 15 canonical codes; default `DRAFT` |
| `proposed_department_id` | UUID FK → departments/business units | yes in Draft | Target Department/BU |
| `proposed_designation_id` | UUID FK → designations | yes in Draft | Target designation |
| `proposed_location_id` | UUID FK → locations | yes in Draft | Target location |
| `proposed_vacancy_id` | UUID FK → `vacancies(id)` | yes in Draft | Selected vacancy; changed post-submission only via SPEC-005/008 |
| `proposed_reporting_manager_id` | UUID FK → `users(id)` [RECONCILED] | yes | Not on the Employee form; set only by HR (SPEC-008) |
| `effective_transfer_date` | DATE | yes in Draft | Calendar date in business time zone |
| `reason` | TEXT | yes | Optional Employee reason |
| `current_employee_code` | VARCHAR(16) | yes in Draft | Snapshot (`EMP######`) at submission |
| `current_department_id` | UUID | yes in Draft | Snapshot at submission |
| `current_designation_id` | UUID | yes in Draft | Snapshot |
| `current_location_id` | UUID | yes in Draft | Snapshot |
| `current_reporting_manager_id` | UUID FK → `users(id)` | yes in Draft | Snapshot (read from SPEC-003 `reporting_manager_assignments` ACTIVE row at submit; the only copy is this per-transfer snapshot, BRD-029 in-flight rule); becomes first pending owner [RECONCILED] |
| `current_employment_status` | VARCHAR(32) | yes in Draft | Snapshot |
| `assigned_hr_user_id` | UUID FK → `users(id)` | yes | Snapshot of HR assignment (routing) |
| `snapshot_taken_at` | TIMESTAMPTZ | yes | Set at submit |
| `submitted_at` | TIMESTAMPTZ | yes | Set at submit |
| `stage_entered_at` | TIMESTAMPTZ | no | Default `now()`; set by `WorkflowEngine.transition` (SPEC-007) in the same transaction on every status change; read by SPEC-014 (overdue clock) [RECONCILED] R-4 |
| `closed_at` | TIMESTAMPTZ | yes | Set by whichever spec moves to a final status (column owned here; SPEC-010 does not re-add it) |
| `completed_at` | TIMESTAMPTZ | yes | Set by SPEC-009 |
| `discarded_at` | TIMESTAMPTZ | yes | Draft discard (TDD-006.13) |
| `version` | INTEGER | no | Default 1; optimistic concurrency for Draft edits |
| `created_by`, `created_at`, `updated_at` | UUID / TIMESTAMPTZ | no | |

SPEC-010 adds `blocked_from_status` and the other block/closure columns by its own migration (not here) [RECONCILED] canonical name `blocked_from_status` (SPEC-007 text `pre_block_status` is the same column). SPEC-008 updates the `proposed_*`/`effective_transfer_date` columns after submission through `WorkflowEngine` (with audit); this spec defines no writer for them after submission except the engine SUBMIT handler.

### 10.2 Constraints and indexes

| Name | Definition | Purpose |
|---|---|---|
| `ck_transfer_requests_status` | `status IN ('DRAFT','PENDING_REPORTING_MANAGER_APPROVAL','PENDING_RECEIVING_MANAGER_APPROVAL','INFO_REQUIRED','PENDING_HR_REVIEW','HR_PROCESSING','PENDING_RECEIVING_MANAGER_REAPPROVAL','PAYROLL_PROCESSING','PENDING_IT_ACTION','PENDING_IT_FINAL_APPROVAL','COMPLETED','REJECTED','WITHDRAWN','BLOCKED','CANCELLED')` | Closed status vocabulary |
| `ck_transfer_requests_submitted_complete` | `status = 'DRAFT' OR (transfer_reference IS NOT NULL AND submitted_at IS NOT NULL AND proposed_department_id IS NOT NULL AND proposed_designation_id IS NOT NULL AND proposed_location_id IS NOT NULL AND proposed_vacancy_id IS NOT NULL AND effective_transfer_date IS NOT NULL AND current_employee_code IS NOT NULL AND current_department_id IS NOT NULL AND current_designation_id IS NOT NULL AND current_location_id IS NOT NULL AND current_reporting_manager_id IS NOT NULL AND current_employment_status IS NOT NULL)` | A submitted request can never lack mandatory data |
| `uq_transfer_requests_one_active_per_employee` | `CREATE UNIQUE INDEX ... ON transfer_requests (employee_id) WHERE status NOT IN ('DRAFT','COMPLETED','REJECTED','WITHDRAWN','CANCELLED')` | **BRD-030 DB enforcement** — at most one active request per employee |
| `uq_transfer_requests_one_open_draft_per_employee` | `UNIQUE (employee_id) WHERE status = 'DRAFT' AND discarded_at IS NULL` | One Draft (TDD-006.06) |
| `uq_transfer_requests_reference` | `UNIQUE (transfer_reference) WHERE transfer_reference IS NOT NULL` | Unique reference |
| `ix_transfer_requests_employee_created` | `(employee_id, created_at DESC)` | My Transfers list |
| `ix_transfer_requests_status` | `(status)` | Worklists (SPEC-014) |
| `ix_transfer_requests_vacancy` | `(proposed_vacancy_id)` | Vacancy joins (SPEC-005/008) |
| `ix_transfer_requests_current_reporting_manager` | `(current_reporting_manager_id, status)` | Manager worklist support (SPEC-007/014) |
| Sequence `transfer_reference_seq` | `START 1 INCREMENT 1`, no CYCLE | Reference generation |

The CHECK constraint intentionally does not validate the effective date window (depends on "today" and is changed by other roles) — that is service-level `[DERIVED]`.

### 10.3 Migration notes
File `backend/src/migrations/<timestamp>-create-transfer-requests.ts` (Sequelize migration); runs after the SPEC-003/004/005 migrations; reversible (`down` drops indexes, table, sequence). Model `backend/src/models/transfer-request.model.ts`. Status literals in the index predicate are generated from `ACTIVE_STATUSES` complement in the migration helper, and a unit test compares them `[PROPOSED]`.

### 10.4 Data owned elsewhere (referenced, not created)
`employee_profiles` (004), master tables (003), `vacancies` (005), `transfer_workflow_history`, `transfer_task_assignments`, `transfer_clarifications` (007), `audit_logs`, notification outbox (001).

---

## 11. Backend Implementation

Module `backend/src/modules/transfers/` `[PROPOSED]`:

| Path | Responsibility |
|---|---|
| `domain/transfer-status.ts` | Status constants/sets (9.2) |
| `routes/my-transfer.routes.ts` | Route table of section 12, auth + role middleware |
| `controllers/my-transfer.controller.ts` | HTTP mapping only |
| `services/employee-profile-view.service.ts` | Profile DTO |
| `services/eligibility.service.ts` | Rules 1,3,4,5,6; `resolveHrContact` |
| `services/effective-date.service.ts` | Date rule; exported |
| `services/transfer-draft.service.ts` | Draft CRUD |
| `services/transfer-submission.service.ts` | Submission orchestration |
| `services/transfer-tracking.service.ts` | List/detail |
| `services/reference-generator.service.ts` | Reference |
| `repositories/transfer-request.repository.ts` | Persistence |
| `validators/*.ts` | Request schemas; unknown-field rejection |
| `dto/*.ts` | Response DTOs |
| `workflow/submit.handler.ts` | Registered with `WorkflowEngine` (SPEC-007) |

Layering: controller → service → repository; services take/propagate a `trx` from SPEC-001 `withTransaction`; no business logic in controllers; async/await with try/catch and structured logger only; secrets/time-zone from env.

### 11.1 Submission algorithm `[PROPOSED]`

```
submit(ctx, draftId):
  authorize(ctx, transfer_request:submit, own)                       // 401/403
  withTransaction(trx):
    advisoryLock(trx, 'transfer-submit', employeeId)                 // serialise per employee
    draft = repo.findByIdForUpdate(draftId, trx)                     // SELECT ... FOR UPDATE
    if !draft or draft.employee_id != ctx.employeeId -> 403/404
    if draft.status != DRAFT: -> active? 409 ACTIVE_TRANSFER_ALREADY_EXISTS : 403 INVALID_WORKFLOW_TRANSITION
    if repo.existsActive(employeeId, trx) -> 409 ACTIVE_TRANSFER_ALREADY_EXISTS
    elig = eligibility.evaluate(employeeId, {vacancyId: draft.vacancy}, trx)   // rules 1,5,6
    fieldErrors = validator.validateForSubmit(draft, now)            // required, masters, vacancy match, date
    if elig.failures or fieldErrors -> 422 (aggregated)
    snapshot = copy org values from employee_profiles (locked read)
    reference = referenceGenerator.next(trx)
    engine.transition(SUBMIT, draft, {trx, snapshot, reference})     // status, history, assignment, audit, outbox
  catch pg 23505 on uq_transfer_requests_one_active_per_employee -> 409 ACTIVE_TRANSFER_ALREADY_EXISTS
```

The same code path runs for a brand-new request after a closed one (new Draft → new row).

### 11.1a `TransferReadPort` (provided to SPEC-005) [RECONCILED R-6]
`TransferReadPort.getForUpdate(transferId, {trx}): Promise<{ id, status, employeeId, selectedVacancyId /* = proposed_vacancy_id */ }>` - `SELECT ... FOR UPDATE` on `transfer_requests`; exported from `backend/src/modules/transfers/ports/transfer-read.port.ts`; first lock in the canonical order (SPEC-005 17.3). Implemented by `TransferRequestRepository` (TASK-006.02).

### 11.2 Eligibility service notes
Reads only; takes optional `trx`; never writes; vacancy availability via SPEC-005 read method that performs no locking and no reservation (`FOR SHARE` not required because binding capacity validation happens at HR approval `[BRD-028]`). A vacancy that becomes Full between submission and HR approval is handled by SPEC-005/008, not here.

### 11.3 Logging
Structured logger entries include `requestId`, `employeeId`, `transferId`, `ruleCode`; never log reason text beyond length, tokens or credentials `[BRD-025]`.

---

## 12. API Requirements

Conventions: base `/api/v1`; envelope `{success, data, meta}` / `{success:false, error:{code,message,details,requestId}}`; all endpoints require authentication (401 on missing/invalid/expired token), role `EMPLOYEE` (403 otherwise), own-record scope `[BRD-026]`. Paths and codes `[PROPOSED]` unless a `[BRD]` tag is shown.

### 12.1 `GET /api/v1/my/transfer-profile`
- **Purpose:** own profile + data completeness (FR-006.01–03).
- **Authz:** EMPLOYEE; the employee is resolved from the token, no id parameter.
- **Response 200:**
```json
{ "success": true, "data": {
  "employeeId": "EMP000123", "name": "…", "officialEmail": "…",
  "employmentStatus": "ACTIVE",
  "department": {"id":"…","name":"…"}, "designation": {"id":"…","name":"…"},
  "location": {"id":"…","name":"…"},
  "reportingManager": {"userId":"MGR000045","name":"…"},
  "missingMandatoryFields": [],
  "hrContact": null } }
```
- **Errors:** 401, 403, 404 `EMPLOYEE_PROFILE_NOT_FOUND` (user has no employee profile).

### 12.2 `GET /api/v1/my/transfer-vacancies`
- **Purpose:** discovery (FR-006.04–08); **read-only**, no reservation.
- **Query:** `departmentId, locationId, designationId, q, page, pageSize, sort, order`.
- **Response 200:** `data[]` items `{ id, reference, department, designation, location, isAvailable: true }` (capacity numbers not exposed, TDD-006.04); `meta.pagination`.
- **Validation:** UUID filters; `pageSize` ≤ 100. **Errors:** 400 `VALIDATION_ERROR`, 401, 403.

### 12.3 `GET /api/v1/my/transfer-form-options`
- Active departments/BUs, designations, locations (id, name) for select controls. **Errors:** 401, 403.

### 12.4 `GET /api/v1/my/transfer-date-rules`
- **Response 200:** `{ "timeZone":"<IANA>", "today":"2026-10-06", "minDate":"2026-10-06", "maxDate":"2026-11-05" }`. UX only.

### 12.5 `GET /api/v1/my/transfer-eligibility?vacancyId=<uuid>`
- **Purpose:** advisory evaluation (FR-006.13). **Response 200:**
```json
{ "success": true, "data": { "eligible": false, "failures": [
  {"ruleCode":"PROFILE_INCOMPLETE","field":"reportingManager","message":"Your employee profile is incomplete. Please contact HR to update the required organisation information before submitting an Internal Transfer Request."} ],
  "missingMandatoryFields": ["reportingManager"],
  "hrContact": {"teamLabel":"…","users":[{"name":"…","officialEmail":"…"}]} } }
```
- **Errors:** 400 (bad `vacancyId`), 401, 403. Status is 200 even when not eligible (the endpoint reports, it does not block).

### 12.6 `POST /api/v1/my/transfer-requests` (create Draft)
- **Authz:** EMPLOYEE. **Request:**
```json
{ "proposedDepartmentId":"…", "proposedLocationId":"…", "proposedDesignationId":"…",
  "vacancyId":"…", "effectiveTransferDate":"2026-10-20", "reason":"…" }
```
All optional. Unknown fields rejected.
- **Validation:** 7.5/7.6 (only provided fields).
- **Response 201:** Draft `{ id, status:"DRAFT", version:1, … }` (`transferReference` is `null`).
- **Errors:** 400 `VALIDATION_ERROR`; 401; 403; 409 `ACTIVE_TRANSFER_ALREADY_EXISTS` `[BRD-030]`; 409 `DRAFT_ALREADY_EXISTS` (details.draftId); 422 `INVALID_MASTER_REFERENCE`, `VACANCY_NOT_AVAILABLE`, `VACANCY_ORG_MISMATCH`, `INVALID_EFFECTIVE_DATE`.

### 12.7 `PATCH /api/v1/my/transfer-requests/{id}` (edit Draft) and `DELETE …/{id}` (discard Draft)
- **PATCH request:** any subset of the create fields plus required `version`. All fields editable `[BRD-032]`. **Response 200:** updated Draft with `version+1`.
- **DELETE:** no body; **Response 200** `{ "id":"…", "discarded": true }`.
- **Authz:** owner only; status must be `DRAFT` and not discarded.
- **Errors:** 401; 403 (not owner); 403 `INVALID_WORKFLOW_TRANSITION` `[BRD-027]` message "The requested action is not permitted for the current transfer status." (not a Draft); 404 `TRANSFER_REQUEST_NOT_FOUND`; 409 `VERSION_CONFLICT`; 422 as in 12.6.

### 12.8 `POST /api/v1/my/transfer-requests/{id}/submit`
- **Purpose:** the Draft → Pending Reporting Manager Approval transition (FR-006.32–38). Body empty (optional `{ "version": n }`).
- **Authz:** EMPLOYEE, owner, status `DRAFT`.
- **Response 200:**
```json
{ "success": true, "data": {
  "id":"…", "transferReference":"TRF-000123", "status":"PENDING_REPORTING_MANAGER_APPROVAL",
  "submittedAt":"2026-10-06T10:15:00Z", "effectiveTransferDate":"2026-10-20",
  "pendingAction":{"stage":"PENDING_REPORTING_MANAGER_APPROVAL","ownerRole":"REPORTING_MANAGER"} } }
```
- **Errors:**

| HTTP | Code | When | Body |
|---|---|---|---|
| 401 | — | missing/invalid/expired token | `[BRD-026]` |
| 403 | `FORBIDDEN` | not EMPLOYEE / not owner | no data leak |
| 403 | `INVALID_WORKFLOW_TRANSITION` | request already closed/not Draft | `[BRD-027]` exact message |
| 404 | `TRANSFER_REQUEST_NOT_FOUND` | unknown id | |
| 409 | `ACTIVE_TRANSFER_ALREADY_EXISTS` | active request exists / unique index violated / double submit | `[BRD-030]` exact message; existing request unchanged |
| 422 | `EMPLOYEE_PROFILE_INCOMPLETE` | rule 6 | exact example message + `missingFields` + `hrContact` `[BRD-029]` |
| 422 | `EMPLOYEE_NOT_ELIGIBLE` | rule 1 (and aggregated failures) | `details[]` of `ruleCode` |
| 422 | `VACANCY_NOT_AVAILABLE` | rule 5 | |
| 422 | `INVALID_EFFECTIVE_DATE` | `PAST_DATE`, `BEYOND_MAX_DATE`, `INVALID_FORMAT`, `MISSING` | `[BRD-031]` stored date unchanged |
| 422 | `INVALID_MASTER_REFERENCE`, `VACANCY_ORG_MISMATCH`, `SUBMISSION_INCOMPLETE` (missing required form fields) | | |
| 500 | `INTERNAL_ERROR` | unexpected; transaction rolled back, Draft unchanged | |

When several independent 422 failures exist they are returned together in one response whose `code` is the highest-precedence one: `EMPLOYEE_PROFILE_INCOMPLETE` > `EMPLOYEE_NOT_ELIGIBLE` > `VACANCY_NOT_AVAILABLE` > `INVALID_EFFECTIVE_DATE` > the rest, with all failures in `details[]`.

### 12.9 `GET /api/v1/my/transfer-requests`
- **Query:** `view=current|history|all` (default `all`), `page`, `pageSize`, `sort`, `order`. `current` = Draft + active; `history` = final statuses.
- **Response 200:** `data[]` `{ id, transferReference, status, proposedDepartment, proposedLocation, proposedDesignation, effectiveTransferDate, submittedAt, closedAt, completedAt, pendingAction? }`.

### 12.10 `GET /api/v1/my/transfer-requests/{id}`
- **Response 200:** all fields of 12.9 plus `reason`, `snapshot{…}`, `timeline[]`, `pendingAction{stage, ownerRole, ownerDisplayName?, since}`, `decisions[]` `{type: REJECTION|WITHDRAWAL|CANCELLATION|CLARIFICATION_REQUEST|CLARIFICATION_RESPONSE, by(role), reason, at}`, `openClarification?{id, question, requestedByRole, requestedAt}`, `allowedActions[]`.
- **Authz:** owner only; another Employee's id → 403 (no restricted data).
- **Errors:** 401, 403, 404.

### 12.11 Rate/size limits
Request body ≤ 10 KB `[PROPOSED]`; no file upload in this spec (documents → SPEC-011).

### 12.12 Error code catalogue (this spec)
`VALIDATION_ERROR`(400) · `FORBIDDEN`(403) · `INVALID_WORKFLOW_TRANSITION`(403, `[BRD]`) · `TRANSFER_REQUEST_NOT_FOUND`(404) · `EMPLOYEE_PROFILE_NOT_FOUND`(404) · `ACTIVE_TRANSFER_ALREADY_EXISTS`(409, `[BRD]`) · `DRAFT_ALREADY_EXISTS`(409) · `VERSION_CONFLICT`(409) · `EMPLOYEE_PROFILE_INCOMPLETE`(422) · `EMPLOYEE_NOT_ELIGIBLE`(422) · `VACANCY_NOT_AVAILABLE`(422) · `VACANCY_ORG_MISMATCH`(422) · `INVALID_MASTER_REFERENCE`(422) · `INVALID_EFFECTIVE_DATE`(422) · `SUBMISSION_INCOMPLETE`(422) · `INTERNAL_ERROR`(500). Only the `[BRD]` ones are BRD-defined codes; the others are `[PROPOSED]`. (Capacity-unavailable `VACANCY_CAPACITY_UNAVAILABLE` is raised only at HR reservation in SPEC-005/008, never here.)

---

## 13. Frontend Implementation

Next.js App Router under `frontend/src/app/(protected)/employee/...` (role-aware guard from SPEC-002; hiding is UX only `[BRD-026]`). Components under `frontend/src/components/transfers/`. HTTP via `frontend/src/services/transfer-requests.service.ts` (Axios client of SPEC-001); Redux Toolkit slice for list/draft; React Context auth from SPEC-002; Tailwind.

| Route | Component(s) | Behaviour |
|---|---|---|
| `employee/profile` | `ProfileCard`, `IncompleteProfileBanner` | Read-only fields; no edit affordance; banner with exact BRD message and HR contact (name/email) when `missingMandatoryFields` non-empty |
| `employee/vacancies` | `VacancyFilters`, `VacancyTable`/cards | Lists available vacancies; "Start transfer" creates/opens the Draft with `vacancyId`; empty state "No vacancies are currently available"; no capacity numbers |
| `employee/transfers` | `MyTransfersTabs`, `TransferStatusBadge` | Tabs Current / History; Draft shown with "Continue" and "Discard"; New request button disabled with tooltip (and message from 409) when an active request exists |
| `employee/transfers/new`, `employee/transfers/[id]/edit` | `TransferForm`, `EligibilityPanel`, `DateField`, `ConfirmSubmitDialog` | Master-data selects; vacancy picker pre-fills dept/designation/location (TDD-006.08); date picker bounded by `/my/transfer-date-rules` (UX only); reason textarea with counter; Save draft; Discard confirm; Submit disabled when eligibility panel shows failures; server errors mapped per 12.8 |
| `employee/transfers/[id]` | `TransferSummary`, `StageTimeline`, `PendingActionCard`, `DecisionList`, `ActionEntryButtons` | Timeline of stages with actor role/time; pending action and owner; decision reasons; completion date; "Respond to clarification" and "Withdraw" entry buttons rendered only when present in `allowedActions` and linking to SPEC-007/010 flows |

UI rules:
- Required-field indicators and inline validation (BRD-002/NFR-008); loading skeletons, empty, no-access (403) and error (retry) states on every page.
- On submit success show the **transfer reference** prominently and a link to the tracking page.
- On 409 `ACTIVE_TRANSFER_ALREADY_EXISTS` show the exact BRD message in an alert with a link to the active request (`details.activeTransferId` `[PROPOSED]`).
- On 422 `EMPLOYEE_PROFILE_INCOMPLETE` show the exact BRD example message and HR contact; the form never offers edit controls for profile data.
- Confirmation dialog before Submit and Discard (BRD-002 sensitive actions).
- Responsive desktop/tablet; keyboard operable; ARIA labels on timeline and form errors; status never conveyed by colour alone.
- Dates displayed in the business time zone returned by the API.

---

## 14. Validation Rules

| Field / check | Rule | Error |
|---|---|---|
| Body | JSON object; unknown keys rejected | `VALIDATION_ERROR` |
| `proposedDepartmentId`, `proposedDesignationId`, `proposedLocationId`, `vacancyId` | UUID; exists and active in master / vacancy | `INVALID_MASTER_REFERENCE` / `VACANCY_NOT_AVAILABLE` |
| Vacancy ↔ proposed values | equal to vacancy's dept/designation/location (TDD-006.08 default) | `VACANCY_ORG_MISMATCH` |
| `effectiveTransferDate` | `^\d{4}-\d{2}-\d{2}$`, real calendar date, `today ≤ d ≤ today+30` in business time zone | `INVALID_EFFECTIVE_DATE` (`INVALID_FORMAT`, `PAST_DATE`, `BEYOND_MAX_DATE`) |
| `reason` | optional string, trimmed, control characters stripped, ≤ max length (TDD-006.14); output-encoded in UI | `VALIDATION_ERROR` |
| `version` | integer ≥ 1, required on PATCH | `VALIDATION_ERROR` / `VERSION_CONFLICT` |
| Path `{id}` | UUID | `VALIDATION_ERROR` |
| Required for submit | department, designation, location, vacancy, effective date | `SUBMISSION_INCOMPLETE` (`details[].field`) |
| Profile data | rule 6 fields present | `EMPLOYEE_PROFILE_INCOMPLETE` |
| Employment status | equals Active value (TDD-006.03) | `EMPLOYEE_NOT_ELIGIBLE` |
| Sanitisation | All inputs validated and sanitised before processing `[INT standards]`; parameterised queries only | — |

Boundary examples (today = 2026-10-06, zone fixed): 2026-10-05 reject; 2026-10-06 accept; 2026-11-05 accept; 2026-11-06 reject; 2026-10-10 (Saturday) accept; 2026-02-30 reject (`INVALID_FORMAT`).

---

## 15. Authorization & Security Rules

Order of checks on every endpoint `[BRD-026]`: Authenticated User → Role (EMPLOYEE) → Organisation scope (own `employee_profiles.id`) → Resource (`transfer_request` owned by caller) → Action (permitted at the request's current status).

| Resource / action | Allowed when |
|---|---|
| View own profile | EMPLOYEE (self) |
| Browse vacancies, options, date rules, eligibility | EMPLOYEE |
| Create Draft | EMPLOYEE; no active request |
| Update / discard Draft | EMPLOYEE; owner; `status = DRAFT` |
| Submit | EMPLOYEE; owner; `status = DRAFT` |
| View own request list/detail | EMPLOYEE; owner |

- The Employee id is always derived from the token (`ScopeResolver`), never from body/query — a body field such as `employeeId` is rejected as unknown (prevents submitting for someone else).
- Unauthenticated → 401; authenticated but not permitted → 403 without restricted data; a foreign request id returns 403 with a generic message (no existence, status or reference leakage).
- Deactivated/locked users are blocked by SPEC-002 on every request.
- HR contact exposes only name and official email of the assigned HR user(s) `[NFR-007]`.
- IT/other roles have no access to these endpoints; direct API calls (Postman) are subject to identical checks.
- No credentials/tokens logged; audit payloads contain no secrets `[BRD-025, BRD-037]`.
- Input validation, parameterised queries and output encoding prevent injection/XSS; no `eval`.

---

## 16. Workflow / State Transition Rules

Only one workflow transition is registered by this spec; the full matrix belongs to SPEC-007.

| Current status | Role | Action | Next status | Reason required | Employee editing | Notification | Vacancy impact | BRD |
|---|---|---|---|---|---|---|---|---|
| `DRAFT` | EMPLOYEE | `SUBMIT` | `PENDING_REPORTING_MANAGER_APPROVAL` | No | Yes (Draft only; none afterwards) | Reporting Manager notified (+ Employee "Transfer submitted") | None — no reservation | BRD-027 |

Non-transition Draft operations (create, edit, discard) change `transfer_requests` fields but are not workflow transitions and do not pass through `INVALID_WORKFLOW_TRANSITION` unless attempted on a non-Draft row. Any action by an Employee on a non-Draft request that this spec exposes (edit/discard/submit) returns 403 `INVALID_WORKFLOW_TRANSITION`; the rejected attempt is recorded as a security/audit event per BRD-027 (via SPEC-007's handler). Routing is always to the Reporting Manager first, independent of the Receiving Manager configuration `[BRD-012]`.

---

## 17. Transaction & Concurrency Rules

1. **Single transaction for submit** (SPEC-001 `withTransaction`): status change, reference, snapshot, history, task assignment, audit rows and outbox rows commit or roll back together. Notification delivery occurs after commit by SPEC-012 and cannot roll it back `[BRD-036]`.
2. **Per-employee serialisation:** `pg_advisory_xact_lock(hashtextextended('transfer-submit:' || employee_id, 0))` at transaction start; then `SELECT … FOR UPDATE` on the Draft row `[PROPOSED]`.
3. **Pre-check** `existsActive` runs after the lock so a concurrent winner is visible.
4. **DB guard:** the partial unique index makes a second active row impossible even if code or the lock is bypassed (e.g. direct SQL, another module, bug). SQLSTATE 23505 on that index → 409; any other 23505 (e.g. reference collision) → retried once with a new reference, then 500.
5. **Simultaneous submissions** (same employee, two sessions/tabs): exactly one succeeds; others get 409; exactly one request, one reference, one pair of notifications exists afterwards.
6. **Draft edits:** optimistic `version` check (`UPDATE … WHERE id=? AND version=? AND status='DRAFT'`); zero rows → 409 `VERSION_CONFLICT` or 403 if the Draft was just submitted.
7. **Submit vs edit race:** submit locks the Draft row; an edit arriving after sees `status != DRAFT` → 403 `INVALID_WORKFLOW_TRANSITION`; an edit committed before submit is included.
8. **No vacancy locks** are taken by this spec; capacity is neither read-for-update nor modified `[BRD-028]`. A vacancy turning Full after submit is resolved at HR approval.
9. **Reference sequence** is non-transactional (gaps allowed, uniqueness guaranteed).
10. **Deadlock avoidance:** lock order is advisory lock → transfer row; no other table is locked.
11. Reads (tracking, browse) are non-locking `READ COMMITTED`.

---

## 18. Audit Requirements

Audit records via `AuditService.record(event, {trx})` capture actor, role, action, entity (employee/transfer id + reference), timestamp, previous/new value, previous/new status, remarks `[BRD-037]`. Never include credentials.

| Event code `[PROPOSED]` | Trigger | Fields captured | BRD |
|---|---|---|---|
| `TRANSFER_DRAFT_CREATED` | Draft created | actor, role, transfer id, initial field values | BRD-022 |
| `TRANSFER_DRAFT_UPDATED` | Draft edited (incl. date change) | actor, role, transfer id, previous/new value per changed field, version | BRD-032, BRD-031 |
| `TRANSFER_DRAFT_DISCARDED` | Draft discarded | actor, role, transfer id, field snapshot | BRD-022 |
| `TRANSFER_SUBMITTED` | Successful submit | actor, role, transfer id, reference, previous status `DRAFT`, new status, snapshot values, effective date, vacancy id | BRD-022, BRD-027 |
| `TRANSFER_SUBMISSION_REFUSED_ACTIVE_EXISTS` | 409 duplicate-active attempt (code or index) | actor, role, attempted draft id, existing active request id/status, remarks | BRD-030, BRD-037 |
| `TRANSFER_SUBMISSION_REFUSED_INELIGIBLE` | 422 eligibility/profile/vacancy/date refusal | actor, role, draft id, `ruleCode[]`, missing fields | BRD-029 |
| `TRANSFER_EDIT_REFUSED_NOT_DRAFT` | Edit/discard/submit on non-Draft (invalid transition attempt) | actor, role, transfer id, current status, attempted action — recorded as a security event | BRD-027, BRD-032 |
| `TRANSFER_ACCESS_DENIED` | Cross-employee access attempt | actor, role, target id | BRD-026 (event emitted via SPEC-002/013 policy) |

Read-only views (profile, browse, tracking) are not audited `[PROPOSED]` (not "material" under BRD-037). Eligibility GET evaluations are not audited.

---

## 19. Notification Requirements

| Event code `[PROPOSED]` | Recipient | Channel | Trigger task | BRD |
|---|---|---|---|---|
| `TRANSFER_SUBMITTED` ("Transfer submitted") | Employee (the submitter) | Email + In-app | TASK-006.11 | BRD-036 (Mandatory) |
| `APPROVAL_REQUIRED` ("Approval required") | Reporting Manager (`current_reporting_manager_id`, first assigned approver) | Email + In-app | TASK-006.11 | BRD-036 (Mandatory), BRD-027 Submit row "Reporting Manager notified" |

Both are enqueued with `NotificationService.enqueue(eventCode, payload, {trx})` (payload: transfer id, reference, employee display name, target department/location/designation, effective date; no credentials). Failure to send never fails, rolls back or corrupts the submission; failures are logged and retriable without repeating the transaction (SPEC-012) `[BRD-036]`. No notification is sent for Draft actions or refused submissions.

---

## 20. Error & Edge Cases

| # | Case | Behaviour |
|---|---|---|
| 1 | Employee double-clicks Submit / retries after timeout | One request; later call → 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`; UI loads the existing request on 409 |
| 2 | Two tabs submit two different Drafts (only possible if TDD-006.06 allows multiple Drafts) | Advisory lock + unique index → one wins, other 409 |
| 3 | Draft saved with a valid date, submitted days later when date is now past | Re-validated at submit → 422 `INVALID_EFFECTIVE_DATE` `PAST_DATE`; Employee edits the Draft |
| 4 | Date at midnight boundary (browser vs server zone differ) | Server business date is authoritative; `/my/transfer-date-rules` supplies it |
| 5 | Vacancy becomes Full/On Hold/Closed between Draft and submit | 422 `VACANCY_NOT_AVAILABLE`; Draft keeps data; Employee picks another vacancy |
| 6 | Vacancy deleted/closed after submit | Not this spec: SPEC-005/008 handle; in-flight request keeps snapshot |
| 7 | Employee's profile changes after Draft but before submit | Snapshot taken at submit from current profile; eligibility re-evaluated |
| 8 | Employee's profile changes after submit | No effect on in-flight request (BR-006.15) |
| 9 | Employment status becomes non-Active while a request is in flight | Not blocked here (rule 1 gates initiation); HR revalidation is SPEC-008 |
| 10 | Reporting Manager deactivated/unassigned at submission | Missing Reporting Manager → `PROFILE_INCOMPLETE`; deactivated manager → `[TDD-REQUIRED TDD-006.11]` recommended: accepted, Super Admin can reassign (BRD-035) |
| 11 | No HR resolvable for the Employee's location | `hrContact: null`, generic message; no invented contact (TDD-006.10) |
| 12 | Master (department/location/designation) deactivated after being chosen in a Draft | Submit → 422 `INVALID_MASTER_REFERENCE` |
| 13 | Active request exists, user opens "new transfer" | Create-Draft 409 with exact message; UI disables the button |
| 14 | Employee tries to PATCH a submitted request | 403 `INVALID_WORKFLOW_TRANSITION`, no change, audited |
| 15 | Employee tries to submit/modify someone else's Draft | 403 `FORBIDDEN`, no data leaked |
| 16 | Request after Completed (no cool-down) | Allowed immediately; new id/reference |
| 17 | Same vacancy as a Rejected/Withdrawn/Cancelled request | Allowed; no extra restriction `[BRD-OQ-16(d)]` |
| 18 | Notification outbox/e-mail down | Submission succeeds; failure logged; retried by SPEC-012 |
| 19 | Reference-sequence collision | Retried once, then 500 with rollback |
| 20 | WorkflowEngine unavailable/exception | Whole transaction rolls back; Draft intact; 500 `INTERNAL_ERROR` |
| 21 | Employee ID resolution fails (user without profile) | 404 `EMPLOYEE_PROFILE_NOT_FOUND` |
| 22 | Proposed values equal current values | Not blocked here (no BRD rule); HR validates `[TDD-REQUIRED TDD-006.09]` |
| 23 | Large `reason`, control characters, HTML | Length enforced, sanitised, escaped on render |
| 24 | Draft discarded then recreated | New Draft row, new id |

---

## 21. Acceptance Criteria

| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-006.AC01 | **Given** an authenticated Employee **When** they open the profile **Then** they see own employee ID, department, designation, location and Reporting Manager, read-only. | BRD-011 |
| SPEC-006.AC02 | **Given** the profile page **When** the Employee inspects controls or calls the API with profile fields **Then** no edit is possible and extra fields are rejected. | BRD-029 |
| SPEC-006.AC03 | **Given** vacancies in all four statuses **When** the Employee browses **Then** only `OPEN` vacancies with available capacity > 0 are returned and no capacity is reserved. | BRD-011, BRD-028, BRD-029 rule 5 |
| SPEC-006.AC04 | **Given** an Active Employee with complete data, no active request and an Available vacancy **When** eligibility is evaluated **Then** `eligible = true`. | BRD-029 |
| SPEC-006.AC05 | **Given** an Employee whose employment status is inactive/terminated/separated/resigned **When** they submit **Then** it is refused (422), nothing is created and no capacity is reserved. | BRD-029 rule 1 |
| SPEC-006.AC06 | **Given** an Employee missing any of Employee ID, Department/BU, Designation, Location, Reporting Manager or Employment Status **When** they submit **Then** 422 `EMPLOYEE_PROFILE_INCOMPLETE` with the exact BRD message, the missing fields named, and the assigned HR team contact; no reservation. | BRD-029 |
| SPEC-006.AC07 | **Given** the data was corrected by HR **When** the Employee evaluates/submits again **Then** eligibility is revalidated from current data and normal rules apply; the portal never substituted data. | BRD-029 |
| SPEC-006.AC08 | **Given** a Full, On Hold or Closed vacancy **When** the Employee selects or submits it **Then** it is refused with `VACANCY_NOT_AVAILABLE`, nothing reserved. | BRD-029 rule 5 |
| SPEC-006.AC09 | **Given** no minimum-tenure rule **When** an Employee with 1 day of service meets all other rules **Then** eligibility passes (no tenure/probation/disciplinary check exists). | BRD-029 rules 2, 8 |
| SPEC-006.AC10 | **Given** a valid Draft **When** the Employee submits **Then** a unique transfer reference is returned and shown. | BRD-011 |
| SPEC-006.AC11 | **Given** today = D in the business time zone **When** the date is D, D+30, or a weekend/holiday within range **Then** it is accepted. | BRD-031 |
| SPEC-006.AC12 | **Given** a valid submission **When** it commits **Then** status = `PENDING_REPORTING_MANAGER_APPROVAL`, history/assignment rows exist, Reporting Manager and Employee notifications are enqueued, and no vacancy reservation exists. | BRD-027, BRD-036 |
| SPEC-006.AC13 | **Given** an active request in any of the ten active statuses (incl. Info Required and Blocked) **When** the Employee submits another **Then** 409 `ACTIVE_TRANSFER_ALREADY_EXISTS` with the exact BRD message and the existing request unchanged. | BRD-030 |
| SPEC-006.AC14 | **Given** two simultaneous submissions for the same Employee **When** both run **Then** exactly one request becomes active and the other receives 409. | BRD-030 |
| SPEC-006.AC15 | **Given** the service check is bypassed (direct SQL inserting a second active row) **When** inserted **Then** the DB rejects it via `uq_transfer_requests_one_active_per_employee`. | BRD-030 |
| SPEC-006.AC16 | **Given** an unsubmitted Draft **When** eligibility/active checks run **Then** the Draft is not counted as active. | BRD-030, OQ-17(a) |
| SPEC-006.AC17 | **Given** the previous request is Completed **When** the Employee submits a new one immediately **Then** it is accepted (no cool-down). | BRD-030, OQ-17(d) |
| SPEC-006.AC18 | **Given** a Draft **When** the Employee edits any of department, location, designation, vacancy, date or reason **Then** the change is saved and audited with previous/new values. | BRD-032 |
| SPEC-006.AC19 | **Given** a Draft **When** the Employee discards it **Then** it disappears from lists, no active-request effect occurs, and the discard is audited. | BRD-018(d) |
| SPEC-006.AC20 | **Given** the earlier request is Rejected, Withdrawn, Cancelled or Completed **When** the Employee applies again **Then** a new request with a new id/reference starts the workflow from `SUBMIT`, eligibility and vacancy are revalidated, no approvals are reused, and the earlier request is unchanged and visible in history. | BRD-030, BRD-033 |
| SPEC-006.AC21 | **Given** a past date **When** saved or submitted **Then** 422 `PAST_DATE`, stored value unchanged. | BRD-031 |
| SPEC-006.AC22 | **Given** a date later than today+30 **When** saved or submitted **Then** 422 `BEYOND_MAX_DATE`. | BRD-031 |
| SPEC-006.AC23 | **Given** a Draft with a once-valid date that is now past **When** submitted **Then** it is refused. | BRD-031 |
| SPEC-006.AC24 | **Given** the Employee's requests **When** they open My Transfers **Then** current and historical requests are shown with status. | BRD-011 |
| SPEC-006.AC25 | **Given** a request **When** the Employee opens its detail **Then** they see stage timeline, pending action and owner, decision reasons, completion date (when Completed), and — when allowed — the respond-to-clarification entry point. | BRD-011, BRD-034 |
| SPEC-006.AC26 | **Given** a submitted request **When** the Employee attempts to edit it **Then** 403 `INVALID_WORKFLOW_TRANSITION`, nothing changes. | BRD-032, BRD-027 |
| SPEC-006.AC27 | **Given** the snapshot was taken at submission **When** the profile later changes **Then** the in-flight request still shows/uses the snapshot values. | BRD-029 / OQ-19(c) |
| SPEC-006.AC28 | **Given** the notification service is down **When** the Employee submits **Then** the submission succeeds and is recorded. | BRD-036 |

---

## 22. Negative Acceptance Criteria

| ID | Given / When / Then | BRD-039 row / BRD |
|---|---|---|
| SPEC-006.NAC01 | **Given** Employee A **When** A requests Employee B's request detail (`GET`) **Then** 403, no B data in the body. | Security: Employee cannot access another Employee's request |
| SPEC-006.NAC02 | **Given** Employee A **When** A PATCHes/DELETEs/submits B's Draft **Then** 403 and B's Draft unchanged. | Security |
| SPEC-006.NAC03 | **Given** no token or an expired token **When** any endpoint is called **Then** 401. | BRD-026 |
| SPEC-006.NAC04 | **Given** a user with role HR/IT/Reporting Manager/Receiving Manager/Super Admin **When** calling a `/my/...` endpoint via Postman **Then** 403. | Security: direct API access |
| SPEC-006.NAC05 | **Given** a body with `employeeId`, `status`, `transferReference`, `currentDepartmentId` or `employmentStatus` **When** sent **Then** 400 `VALIDATION_ERROR`; nothing persisted; status can never be set by the client. | BRD-026, BRD-029 |
| SPEC-006.NAC06 | **Given** a request in any non-Draft status (incl. Completed) **When** the Employee edits or discards it **Then** 403 `INVALID_WORKFLOW_TRANSITION` with the exact BRD message; unchanged; audited. | Workflow: invalid transitions rejected; Completed cannot be modified |
| SPEC-006.NAC07 | **Given** a request already submitted **When** submit is called again **Then** 409 (active) or 403 (closed); no second request/reference/notification. | Workflow |
| SPEC-006.NAC08 | **Given** an active request **When** a new Draft is created **Then** 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`. | BRD-030 |
| SPEC-006.NAC09 | **Given** missing mandatory data **When** the Employee tries to supply the data via the transfer API **Then** refused; the portal does not default or invent it. | BRD-029 |
| SPEC-006.NAC10 | **Given** missing mandatory data **When** submit is called **Then** no `transfer_requests` row changes status, no reference is consumed by a committed row, no vacancy reservation row exists. | BRD-029, BRD-028 |
| SPEC-006.NAC11 | **Given** a Full vacancy **When** an Employee submits against it **Then** refused; no reservation/allocation created. | Vacancy: Full vacancy cannot receive allocation |
| SPEC-006.NAC12 | **Given** any browse/draft/submit sequence **When** completed **Then** `vacancy_reservations` and vacancy capacity are unchanged. | BRD-028 |
| SPEC-006.NAC13 | **Given** `effectiveTransferDate` of yesterday, today+31, `2026-02-30`, `10/20/2026`, `2026-10-20T10:00:00Z`, empty or non-string **When** saved/submitted **Then** 422/400; stored date unchanged. | BRD-031 |
| SPEC-006.NAC14 | **Given** free-text department/location/designation/vacancy values **When** sent **Then** rejected (`VALIDATION_ERROR`/`INVALID_MASTER_REFERENCE`). | BRD-029 |
| SPEC-006.NAC15 | **Given** a deactivated master or a non-existent id **When** submitted **Then** 422 `INVALID_MASTER_REFERENCE`. | BRD-029 |
| SPEC-006.NAC16 | **Given** 20 concurrent submit calls for one Employee **When** executed **Then** exactly one 200, nineteen 409, one DB active row. | BRD-030 |
| SPEC-006.NAC17 | **Given** an eligibility failure **When** refused **Then** no workflow history, task assignment, or outbox row is created. | BRD-029 |
| SPEC-006.NAC18 | **Given** a stale `version` on PATCH **When** sent **Then** 409 `VERSION_CONFLICT`, Draft unchanged. | NFR-006 |
| SPEC-006.NAC19 | **Given** a locked or deactivated Employee account **When** any endpoint is called **Then** rejected by SPEC-002 controls (no data). | BRD-025, BRD-026 |
| SPEC-006.NAC20 | **Given** an Employee with no profile **When** requesting the profile **Then** 404 `EMPLOYEE_PROFILE_NOT_FOUND`, no fabricated profile. | BRD-029 |
| SPEC-006.NAC21 | **Given** SQL/HTML in `reason` **When** submitted **Then** stored safely (parameterised) and rendered escaped. | INT security rule |
| SPEC-006.NAC22 | **Given** a status outside the 15 codes inserted by SQL **When** executed **Then** the CHECK constraint rejects it; a non-Draft row without a reference/mandatory data is rejected by `ck_transfer_requests_submitted_complete`. | BRD-027, BRD-030 |

---

## 23. Testing Requirements

Locations: `tests/backend/transfers/` and `tests/frontend/transfers/`. Jest/Vitest per project standard; PostgreSQL test database with real migrations (index/constraint tests require the real DB, not mocks).

### 23.1 Unit

| TC | Scope |
|---|---|
| TC-006.01 | `EffectiveDateService`: today/yesterday/+30/+31; month/year/leap-day boundaries |
| TC-006.02 | Business time zone: same instant yields different "today" in two zones; DST transition days |
| TC-006.03 | Weekend and holiday dates accepted; no calendar lookup |
| TC-006.04 | Format validation (`YYYY-MM-DD` only; invalid calendar dates) |
| TC-006.05 | Eligibility rule 1 per status value (Active vs inactive/terminated/separated/resigned) |
| TC-006.06 | Eligibility rules 3+4 with each of the 10 active statuses and the 4 final statuses and DRAFT |
| TC-006.07 | Rule list is exactly {EMPLOYMENT_STATUS_NOT_ACTIVE, ACTIVE_TRANSFER_EXISTS, VACANCY_NOT_AVAILABLE, PROFILE_INCOMPLETE}; no tenure/probation rule |
| TC-006.08 | `ACTIVE_STATUSES` equals the migration index predicate complement and the CHECK list |
| TC-006.09 | Eligibility rule 5 for OPEN/FULL/ON_HOLD/CLOSED, capacity 0 and >0 |
| TC-006.10 | Eligibility rule 6: each mandatory field missing individually and combined |
| TC-006.11 | HR contact resolution: assigned HR, location mapping, none |
| TC-006.12 | Reference generator format/uniqueness |
| TC-006.13 | Draft validator (master refs, vacancy match, reason length, sanitisation) |
| TC-006.14 | Error aggregation/precedence for submit failures |

### 23.2 Integration (service + DB)

| TC | Scope |
|---|---|
| TC-006.15 | Migration up/down; table, CHECKs, indexes, sequence exist |
| TC-006.16 | Draft create/update/discard persistence, `version` increments, audit rows |
| TC-006.17 | Submit success: status, reference, snapshot columns, `submitted_at`, history/assignment/outbox/audit rows in one transaction |
| TC-006.18 | Submit rollback: engine failure leaves Draft unchanged, no outbox/audit committed |
| TC-006.19 | Snapshot independence after profile change |
| TC-006.20 | New request after each closed status (Completed, Rejected, Withdrawn, Cancelled): new id/reference, no copied approvals, old row intact |
| TC-006.21 | Draft not counted as active; DRAFT + discard behaviour |
| TC-006.22 | Date re-validation at submit for a stale Draft |
| TC-006.23 | No vacancy writes (assert `vacancies` and `vacancy_reservations` unchanged) across browse/draft/submit |
| TC-006.24 | Eligibility reads see live profile data after HR correction |

### 23.3 API

| TC | Scope |
|---|---|
| TC-006.25 | `GET /my/transfer-profile` shape, 404 no profile |
| TC-006.26 | `GET /my/transfer-vacancies` filters, only Available, no capacity fields |
| TC-006.27 | `GET /my/transfer-form-options`, `/my/transfer-date-rules` |
| TC-006.28 | `GET /my/transfer-eligibility` shapes for each failure |
| TC-006.29 | Create/patch/delete Draft happy paths and 400/403/404/409/422 matrix |
| TC-006.30 | Submit 200 shape; every error row of 12.8 |
| TC-006.31 | Exact BRD message strings (409 duplicate; 422 profile incomplete; 403 invalid transition) |
| TC-006.32 | List `view=current|history|all`, pagination/sort |
| TC-006.33 | Detail: timeline, pending owner, decisions, open clarification, allowedActions (with SPEC-007 stub then real) |
| TC-006.34 | Unknown-field rejection on every body |
| TC-006.35 | Response envelope and `requestId` on errors |

### 23.4 Frontend

| TC | Scope |
|---|---|
| TC-006.36 | Profile page read-only + incomplete banner with HR contact |
| TC-006.37 | Vacancy page filters, empty state, no capacity numbers, Start transfer |
| TC-006.38 | Form: master selects only, vacancy pre-fill, date picker bounds, reason counter |
| TC-006.39 | Submit success shows reference; confirm dialog |
| TC-006.40 | 409 handling shows exact message and link; 422 messaging; VERSION_CONFLICT |
| TC-006.41 | My Transfers tabs, Draft Continue/Discard, disabled New button when active |
| TC-006.42 | Detail: timeline, pending owner, decisions, completion date, entry buttons only when in `allowedActions` |
| TC-006.43 | Loading/empty/no-access/error states, keyboard and ARIA, responsive breakpoints |

### 23.5 Security

| TC | Scope |
|---|---|
| TC-006.44 | Cross-employee read/write for each endpoint (403, no leakage) |
| TC-006.45 | Role matrix: all non-EMPLOYEE roles denied |
| TC-006.46 | 401 on missing/expired/invalid token for each endpoint |
| TC-006.47 | Mass-assignment (`employeeId`, `status`, reference, snapshot fields) rejected |
| TC-006.48 | Injection/XSS payloads in `reason`, filters, `q` |
| TC-006.49 | Logs/audit contain no credentials/tokens |

### 23.6 Concurrency

| TC | Scope |
|---|---|
| TC-006.50 | 20 parallel submits of one Draft → one success, rest 409 |
| TC-006.51 | Parallel submits of two Drafts of one Employee (if allowed) / parallel create-Draft + submit |
| TC-006.52 | Raw-SQL second active insert rejected by partial unique index; Draft/final statuses may coexist |
| TC-006.53 | Edit vs submit race outcomes |
| TC-006.54 | Reference uniqueness under parallel submissions by different employees |
| TC-006.55 | Optimistic-lock conflict on parallel PATCH |

### 23.7 Workflow (GATED on SPEC-007 core)

| TC | Scope |
|---|---|
| TC-006.56 | SUBMIT registered: `DRAFT → PENDING_REPORTING_MANAGER_APPROVAL` for EMPLOYEE only; other roles/statuses → `INVALID_WORKFLOW_TRANSITION` |
| TC-006.57 | Static/DB assertion: no write path to vacancy tables from this module |
| TC-006.58 | Reporting Manager task assignment and notification created |

### 23.8 Negative
TC-006.59 – TC-006.80 execute SPEC-006.NAC01 – NAC22 one-to-one (TC-006.59 = NAC01 … TC-006.80 = NAC22).

---

## 24. Definition of Done
- All tasks TASK-006.01 – 30 complete; tasks marked "GATED on SPEC-007 core" verified against the real engine, not only the stub.
- Migration applied and reversible; index/constraint tests green against PostgreSQL; status-set parity test green.
- All Acceptance (AC01–AC28) and Negative (NAC01–NAC22) criteria pass; test cases TC-006.01–80 implemented and green; concurrency suite stable (no flaky runs over 20 repetitions).
- Exact BRD strings verified for the 409 duplicate-active message, the incomplete-profile message and the 403 invalid-transition message.
- No endpoint trusts the front end for role, scope, status, date or eligibility; direct-API tests pass.
- No code path writes to vacancy/reservation tables; no eligibility rule other than the four exists.
- Audit events (18) and outbox rows (19) emitted in the submit transaction; notification outage test passes.
- INT standards: async/await only, try/catch around async operations, structured logger, env-based config (`BUSINESS_TIME_ZONE`), validated/sanitised input, structured JSON errors, no `eval`, no AI-generated code comments.
- Open `TDD-006.*` items resolved or explicitly accepted at Gate 1; Gate 2 code review passed; status board, dashboard and prompt history synchronised by the lifecycle workflow.

---

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-006.01 | Transfer reference format (BRD requires "unique reference number", no format) | `TRF-` + zero-padded 6-digit number from `transfer_reference_seq` (e.g. `TRF-000123`) | Reference column length, display, search in SPEC-014 |
| TDD-006.02 | When is the reference assigned: Draft creation or submission? | At successful submission; Draft identified by internal id only | Draft screens show no reference; sequence gaps avoided for abandoned Drafts |
| TDD-006.03 | Employment-status value set and which value means "Active" (BRD lists only Active vs inactive/terminated/separated/resigned) (gap p) | Enum `ACTIVE, INACTIVE, TERMINATED, SEPARATED, RESIGNED`, owned by SPEC-004; only `ACTIVE` passes | Rule 1 implementation, profile data entry |
| TDD-006.04 | Vacancy visibility rules for Employees ("subject to visibility rules") (gap j) and whether capacity numbers are shown | All Available vacancies visible to every Active Employee; expose `isAvailable`, not counts | Browse query, data exposure |
| TDD-006.05 | Value/source of the business time zone | Env `BUSINESS_TIME_ZONE` (IANA), mandatory at boot, no hard-coded default | Date validation, deployment config |
| TDD-006.06 | May an Employee hold more than one Draft? | One non-discarded Draft per Employee | Partial unique index, UX |
| TDD-006.07 | May an ineligible Employee (inactive, profile incomplete, no vacancy) create a Draft? | Yes (only the active-request check applies); eligibility enforced at submit and shown by the panel | Draft creation gating |
| TDD-006.08 | Must the proposed department/designation/location equal the selected vacancy's values? | Yes: pre-filled from vacancy and enforced (`VACANCY_ORG_MISMATCH`) | Form, validation, HR change flow |
| TDD-006.09 | Is a request whose proposed values equal the current values allowed? | Allowed (no BRD rule); HR validates | Eligibility scope creep avoided |
| TDD-006.10 | HR team resolution when several HR users/none exist for a location | List all HR users assigned to the Employee's location/assignment (name + official email); if none, show generic message only | Missing-data UX |
| TDD-006.11 | Behaviour when the Reporting Manager account is inactive at submission | Accept; request visible to Super Admin for reassignment (BRD-035) | Stuck-request risk |
| TDD-006.12 | Which timeline entries/reasons/owner names are visible to the Employee ("as permitted by policy") | All status transitions and decision/clarification reasons visible; items flagged `internal` hidden; owner shown as role + display name | Tracking DTO, SPEC-007/008 flags |
| TDD-006.13 | Draft discard retention: soft (`discarded_at`) or hard delete | Soft discard with audit snapshot | Table growth, privacy |
| TDD-006.14 | Maximum `reason` length | 1000 characters | Validation, column type |
| TDD-006.15 | Idempotency-Key header for submit | Not required; unique index + 409 provide idempotent outcome | API surface |
| TDD-006.16 | Who may respond to a clarification raised by HR / during Receiving Manager re-approval (gap k) — surfaced here only as the `allowedActions` entry point | Decided in SPEC-007; this spec shows the entry point only if the engine returns `RESPOND_CLARIFICATION` for the caller | Tracking UI |

## Out of Scope (this SPEC)
Cited from BRD "Out of Scope" and rule exclusions; nothing in this spec introduces them:
- Tenure, probation, disciplinary, notice-period, performance or any other company-specific eligibility restriction (BRD-029 rules 2, 8) — **not built**.
- Automatic HR-system integration/synchronisation or external HR master updates (BRD-OQ-19; BRD Out of Scope).
- Approval, rejection, clarification-response, withdrawal, block, resume, cancel, reassign logic (SPEC-007, 010); HR review/revalidation, post-submission edits, expired-date correction, vacancy reservation (SPEC-005, 008); Payroll/IT/completion (SPEC-009).
- Employee editing of any controlled profile or master data (SPEC-003/004 Super Admin/HR).
- Weekend/holiday calendars, minimum-notice periods, configurable date window, cool-down periods.
- Document upload (SPEC-011), notification templates/dispatch (SPEC-012), audit visibility/export (SPEC-013), dashboards/reports (SPEC-014).
- Facilities/Admin role and tasks, payroll calculation, identity provider, MFA/SSO, historical data migration, workforce planning (BRD Out of Scope).
