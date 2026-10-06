# SPEC-014 — Dashboards, Worklists, Reporting & Operational Visibility

## Feature ID
dashboards-worklists-reporting

## Status
Draft — not yet submitted for Gate 1

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 1 (Spec Peer Review) | — | — | Not submitted | — |
| Gate 2 (Code Review) | — | — | Not started | — |

## Intent & Business Goals

Give every role a role-aware, scope-filtered operational view of internal transfers: Super Admin dashboard cards and organisation-wide reporting `[BRD-002, BRD-023]`; an Employee dashboard of own current/historical requests and pending actions `[BRD-011]`; Reporting Manager, Receiving Manager, HR and IT worklists `[BRD-012, BRD-013, BRD-014]`; operational reports (request volume, current stage, pending owner, overdue tasks, vacancy utilisation, completion time, pending approvals, HR reviews, blocked tasks, open vacancies) `[BRD-023]`; identification of overdue approvals/tasks through dashboards and notifications using a Super-Admin-configurable `escalation_settings` model that ships **with no numeric defaults** `[BRD-023, BRD-OQ-10]`.

Goals:
1. All visibility is **enforced in backend queries** (`Authenticated User -> Role -> Organisation Scope -> Resource -> Action`, `[BRD-026]`); the frontend never filters data.
2. No overdue threshold, escalation timing, recipient default or export format is invented; everything not defined by the BRD is `[TDD-REQUIRED]` and ships inert (overdue indicators inactive until Super Admin configures them).
3. Dashboards and reports reuse the single source of truth for status, pending owner and vacancy capacity owned by SPEC-005/006/007/009 — this spec is **read-only over those tables** and owns only configuration (`escalation_settings`, `escalation_recipients`) and overdue-notification bookkeeping (`overdue_flags`).

## User Roles & Actors

| Actor | Role in this SPEC |
|---|---|
| Super Admin | Org-wide dashboard cards and reports; configures escalation settings `[BRD-002, BRD-023]` |
| Employee | Own dashboard: current/historical own requests, pending actions `[BRD-011]` |
| Reporting Manager | Worklist of requests for assigned employees; previous decisions `[BRD-012]` |
| Receiving Manager | Worklist of incoming requests routed to them (scope mapping `[TDD-REQUIRED]`) `[BRD-012]` |
| HR | Worklist and restricted reporting within location/organisation scope `[BRD-013]` |
| IT | Worklist of assigned IT tasks with minimum employee information `[BRD-014]` |
| System (scheduler) | Evaluates overdue conditions and enqueues overdue notifications through SPEC-012 |

---

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-014 |
| Title | Dashboards, Worklists, Reporting & Operational Visibility |
| Purpose | Role-aware dashboards, worklists, operational reporting, overdue identification and escalation configuration, all scope-enforced server-side |
| Business objective | Reduce manual follow-up through clear ownership and visibility `[BRD Objective]`; make delays identifiable `[BRD-023]` |
| Version | 0.1 (2026-10-06) |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer per roster | Project Manager / Product Owner |
| Task prefix | `TASK-014.MM` |

## 2. Why This SPEC Exists

The BRD requires dashboard cards (BRD-002), role-specific worklists (BRD-010 – BRD-014), role-based reporting with organisation-wide reporting for Super Admin only (BRD-023) and overdue identification (BRD-023, BRD-OQ-10). These cross-cut every workflow spec but own no workflow state; concentrating them here avoids each feature spec re-implementing list/scope logic. The BRD does **not** define: overdue thresholds, escalation recipients, per-role report content, export of reports, the Receiving Manager scope mapping, or the "total employees" semantics — each is raised as a Technical Design Decision (TDD) rather than assumed.

## 3. BRD Traceability

### 3.1 BRD requirement IDs

| BRD ID | Slice covered | Coverage |
|---|---|---|
| BRD-002 | Dashboard cards (total employees, active transfers, pending approvals, HR reviews, blocked tasks, open vacancies); searchable/sortable/filterable tables with pagination and status badges; responsive desktop/tablet layouts with accessibility; loading, empty, no-access, error states; role-aware navigation entries for this spec's modules | PARTIAL (primary owner SPEC-003; this SPEC owns the card data and dashboard/worklist/report pages) |
| BRD-010 | Super Admin "view all ... transfer requests, workflow tasks" (read visibility) | PARTIAL (visibility slice) |
| BRD-011 | Employee view of current and historical own requests, pending actions, status/stage timeline summary, decision reasons link-through | PARTIAL (dashboard/list slice; tracking timeline detail owned by SPEC-006) |
| BRD-012 | Reporting/Receiving Manager view of assigned employees' requests requiring action and previous decisions | PARTIAL (worklist slice; actions owned by SPEC-007/008) |
| BRD-013 | HR view of assigned employees/requests by location/scope; monitor downstream completion | PARTIAL (worklist slice) |
| BRD-014 | IT view of assigned tasks and only the employee/transfer information required | PARTIAL (worklist slice; task execution owned by SPEC-009) |
| BRD-016 | Consumes the organisational relationships for scope resolution (does not define them) | PARTIAL (consumer) |
| BRD-023 | Role-specific dashboards/worklists; operational reporting (request volume, current stage, pending owner, overdue tasks, vacancy utilisation, completion time); Super Admin org-wide, others restricted; overdue identifiable via dashboards and notifications; configurable escalation timeline/recipients | FULL for dashboards/reporting/overdue/escalation configuration (notification delivery owned by SPEC-012) |
| BRD-027 | Status model/active-final definitions consumed read-only | PARTIAL (consumer) |
| BRD-028 | Vacancy utilisation formula consumed from SPEC-005 | PARTIAL (consumer) |
| BRD-030 | "Active" status set used for the Active Transfers card | PARTIAL (consumer) |
| BRD-035 | Previous assignee keeps visibility but cannot act (worklist read semantics) | PARTIAL (visibility slice) |

### 3.2 NFR IDs

| NFR | Slice | Coverage |
|---|---|---|
| NFR-007 (Privacy) | Employee/transfer visibility restricted to authorised roles and scope in every list/report/aggregate; IT minimum-information DTO | PARTIAL (this SPEC's endpoints; document access owned by SPEC-011) |
| NFR-002 (Authorisation) | Backend authoritative scope on every endpoint | PARTIAL (consumer of SPEC-002) |
| NFR-008 (Accessibility/Usability) | Dashboards/worklists/reports UI accessible | PARTIAL (this SPEC's pages) |
| NFR-009 / BRD-038 | Performance targets are TBC; this SPEC supplies query design and a seed dataset only; no numeric targets asserted | PARTIAL (inputs to SPEC-015) |

### 3.3 BRD-OQ items

| BRD-OQ | Implemented as |
|---|---|
| BRD-OQ-10 (escalation configurable via dashboards/notifications) | Section 10 `escalation_settings`, FR-014.30 – FR-014.38; no numeric defaults |
| BRD-OQ-04 (Receiving Manager configurable) | Worklists/reports tolerate the stage being disabled (no Receiving Manager rows/tasks) |
| BRD-OQ-09 (performance deferred) | No numeric performance target in this SPEC (FR-014.62) |
| BRD-OQ-12/13/14/15/18 | Status vocabulary only (consumed) |

### 3.4 Business rules covered

| Business rule (BRD "Business Rules") | Slice |
|---|---|
| IT users see only the minimum employee/transfer information required (least privilege) | FR-014.18, FR-014.19 |
| Super Admin org-wide; other roles restricted reporting per policy | FR-014.40 – FR-014.45 |
| Overdue approvals/tasks identifiable; escalation configurable per company policy | FR-014.30 – FR-014.38 |
| Notification failure never fails/rolls back core transaction | FR-014.36 (overdue notifications are outbox-enqueued) |
| Mandatory-status transparency (Completed only after IT Final Approval) | Consumed: dashboards show Completed only from `transfer_requests.status` |

### 3.5 Acceptance criteria (BRD "Acceptance Criteria" bullets)

| BRD acceptance bullet | Realised by |
|---|---|
| "Super Admin can access a modern role-aware Admin Panel ..." | SPEC-014.AC01, AC02 (dashboard slice) |
| "Each user can see assigned employees, requests and tasks according to role and organisation mapping." | SPEC-014.AC03 – AC10 |
| "IT users can view and complete only assigned tasks within authorised scope." | SPEC-014.AC09, NAC05 (view slice; completion in SPEC-009) |
| "Every protected API validates Authenticated User -> Role -> Organisation Scope -> Resource -> Action ..." | SPEC-014.NAC01 – NAC08 |
| "Approved requests generate only applicable downstream actions; failures are visible and recoverable." | Blocked/overdue visibility, SPEC-014.AC07, AC15 |

### 3.6 Negative scenarios (BRD-039 rows)

| BRD-039 row | Mapped to | Coverage |
|---|---|---|
| Security: user cannot access another organisation's data outside assigned scope | NAC01, NAC02, NAC03 | FULL for this SPEC's endpoints |
| Security: Employee cannot access another Employee's transfer request | NAC04 | FULL for lists/aggregates |
| Security: Direct API access cannot bypass authorization | NAC01 – NAC08 | FULL for this SPEC's endpoints |
| Security: IT cannot access Employee documents outside scope | NAC05 (IT DTO excludes document data) | PARTIAL (documents owned by SPEC-011) |
| Vacancy: capacity never negative / concurrent HR approvals | NAC12 (report shows consistent capacity; never negative utilisation inputs) | PARTIAL (rules owned by SPEC-005) |
| Workflow: invalid transitions rejected | Not applicable — this SPEC has no state-changing transfer action | n/a |

---

## 4. Dependencies

| Dependency | Needed for | Contract used |
|---|---|---|
| SPEC-001 | Logger, config loader (business time zone), envelope, validation middleware, error classes, base UI kit/shell, `NotificationService.enqueue`, `AuditService.record`, `withTransaction` | Kernels |
| SPEC-002 | Authentication, `AuthorizationService.authorize`, `ScopeResolver` interface, role enum | Scope descriptors per role |
| SPEC-003 | Locations/departments/designations master data for filters; HR/IT/Receiving Manager scope mappings; admin shell and shared list/table patterns | Master data + scope mappings |
| SPEC-004 | `employee_profiles` (current location, department, designation, reporting manager, assigned HR/IT, employment status) | Read-only |
| SPEC-005 | `vacancies`, `vacancy_reservations`, **`VacancyQueryService` capacity snapshot (single formula source)** | Read-only via service |
| SPEC-006 | `transfer_requests` (status, reference, submitted_at, proposed org values, effective date), Employee portal pages/tracking detail | Read-only; detail links |
| SPEC-007 | `transfer_task_assignments` (pending owner), `transfer_workflow_history`, status constants/labels, `workflow_configuration` | Read-only |
| SPEC-008/009/010 | Payroll (`payroll_activities`), IT (`it_tasks`), HR change data, block/cancel data | Read-only |
| SPEC-012 | Overdue notification delivery (`TRANSFER_TASK_OVERDUE`), in-app inbox | `NotificationService.enqueue` |
| SPEC-013 | Audit log viewing of this SPEC's audit events | Event catalogue |
| SPEC-015 | Performance inputs (concurrent users, volume, response targets), TBC values | Inputs only |

Cross-spec requests `[PROPOSED]` (to reconcile at Gate 1, not assumed by other authors): (a) `transfer_requests.stage_entered_at TIMESTAMPTZ NOT NULL` set by `WorkflowEngine.transition` in the same transaction (overdue clock source; fallback in FR-014.31); (b) `transfer_task_assignments` (SPEC-007) exposes `assignee_user_id`, `task_role`, `stage_status`, `state` (active pending owner = `state = 'PENDING'`), `assigned_at`, `completed_at`, `source` (REASSIGNED); reassign reason/previous assignee come from SPEC-010 `transfer_task_reassignments` [RECONCILED] 014 column names aligned to SPEC-007 (R-4); `stage_entered_at` is created by SPEC-006 and written by `WorkflowEngine.transition` (SPEC-007), no longer a mere request; (c) `VacancyQueryService.listCapacitySnapshot(scopeFilter, filters)` returning total/filled/reserved/available/status.

## 5. Enables

| Consumer | What it gets |
|---|---|
| SPEC-012 | `TRANSFER_TASK_OVERDUE` event producer; deep links to worklists |
| SPEC-015 | Query/index design and seed dataset for performance validation |
| SPEC-016 | Scope, dashboard-count and overdue test scenarios, UAT script inputs |
| Operations | Super Admin visibility of backlog, blocked work and capacity |

## 6. Roles & Scope

Scope is resolved server-side by `ScopeResolver` (SPEC-002; data from SPEC-003/004). Scope descriptor kinds used here `[PROPOSED]`:

| Role | Visibility rule (default) | `ScopeDescriptor` | Basis |
|---|---|---|---|
| SUPER_ADMIN | All employees, transfers, tasks, vacancies | `ALL` | `[BRD-010, BRD-002]` |
| EMPLOYEE | Own transfer requests only (current + historical); never others | `SELF(employee_id)` | `[BRD-011]` |
| REPORTING_MANAGER | Transfers whose employee has an ACTIVE `reporting_manager_assignments` row (SPEC-003) with `reporting_manager_user_id = me` [RECONCILED] was employee_profiles.reporting_manager_id, plus transfers where I hold or held an assignment (read-only once reassigned/handled) | `ASSIGNED_EMPLOYEES(ids via profile) ∪ ASSIGNED_TASKS(me)` | `[BRD-012, BRD-035]` |
| RECEIVING_MANAGER | Transfers where I hold or held an assignment; team-scope view only after the mapping is decided | `ASSIGNED_TASKS(me)` (+ `TARGET_SCOPE` after TDD-014.08) | `[BRD-012]`, `[TDD-REQUIRED]` |
| HR | Transfers whose employee current location is within HR's configured location/organisation scope, plus transfers where I hold or held an assignment | `LOCATION_SET ∪ ASSIGNED_TASKS(me)` | `[BRD-013, BRD-016]`, basis `[TDD-REQUIRED]` TDD-014.07 |
| IT | IT tasks assigned to me (within IT location scope); minimum-information projection only | `ASSIGNED_TASKS(me) ∩ LOCATION_SET` | `[BRD-014, BRD-016]` |

Capability matrix:

| Capability | SA | EMP | RM | RcvM | HR | IT |
|---|---|---|---|---|---|---|
| Dashboard summary | org-wide | own | scoped | scoped | scoped | scoped |
| Worklist "assigned to me" | yes (any assignment view) | pending actions | yes | yes | yes | yes (IT tasks) |
| Worklist "in scope" | all | own history | assigned employees | per TDD-014.08 | location scope | no |
| Reports | all 10 | none | per TDD-014.10 | per TDD-014.10 | per TDD-014.10 | none |
| Escalation settings read/write | yes | no | no | no | no | no |
| Export reports | per TDD-014.12 | no | no | no | no | no |

---

## 7. Functional Requirements

Tag legend: `[BRD]`, `[DERIVED]`, `[PROPOSED]`, `[TDD-REQUIRED]`.

### 7.1 Scope enforcement (cross-cutting)

| ID | Requirement | Tag / BRD |
|---|---|---|
| FR-014.01 | Every dashboard, worklist and report endpoint resolves the caller's `ScopeDescriptor` from the authenticated context via `ScopeResolver` and applies it in the SQL `WHERE` clause. Result rows, counts, aggregates, totals, pagination meta and filter option lists are all computed **after** scope filtering. | `[BRD-026, NFR-007]` |
| FR-014.02 | The frontend never filters data for security; frontend role checks are UX only. A request made with a REST client returns the same scoped result. | `[BRD-026]` |
| FR-014.03 | Repository methods in `backend/src/modules/dashboard/` and `.../reporting/` **require** a `ScopeFilter` argument (TypeScript type has no default, no optional). A unit-level "scope contract test" runs every repository method with a restrictive scope against fixture data and asserts no foreign row/count leaks. | `[PROPOSED]` |
| FR-014.04 | Query parameters identifying data (`employeeId`, `locationId`, `departmentId`, `assignedUserId`) that fall outside the caller's scope are rejected with HTTP 403 `FORBIDDEN` (same generic message whether or not the id exists, so no restricted information is revealed). Omitted filters return the scope-limited full set. | `[DERIVED]` from BRD-026 ("out-of-scope direct API access is rejected; rejections must not expose restricted information") |
| FR-014.05 | Unknown query parameters are rejected with HTTP 400 `UNKNOWN_QUERY_PARAMETER`; the Employee role cannot supply any employee-selecting parameter (it is ignored by design: `employeeId` for EMPLOYEE is always the caller). | `[PROPOSED]` |
| FR-014.06 | Missing/invalid/expired authentication returns 401; authenticated but role not permitted for the endpoint returns 403. Authorization denials are emitted as security events through SPEC-002/013 (`AUTHORIZATION_DENIED`). | `[BRD-026, BRD-037]` |
| FR-014.07 | Deactivated or locked users are rejected by SPEC-002 middleware on every request; no cached dashboard payload is served without re-authentication. | `[BRD-025]` consumed |

### 7.2 Super Admin dashboard

| ID | Requirement | Tag / BRD |
|---|---|---|
| FR-014.10 | `GET /dashboard/summary` for SUPER_ADMIN returns six cards: `totalEmployees`, `activeTransfers`, `pendingApprovals`, `hrReviews`, `blockedTasks`, `openVacancies`, each with `value`, `label`, optional `breakdown[]`, and `drillDown` (report key + prefilled filters). | `[BRD-002]` |
| FR-014.11 | `activeTransfers` = count of `transfer_requests` whose status is any of: PENDING_REPORTING_MANAGER_APPROVAL, PENDING_RECEIVING_MANAGER_APPROVAL, INFO_REQUIRED, PENDING_HR_REVIEW, HR_PROCESSING, PENDING_RECEIVING_MANAGER_REAPPROVAL, PAYROLL_PROCESSING, PENDING_IT_ACTION, PENDING_IT_FINAL_APPROVAL, BLOCKED. DRAFT and the four final statuses are excluded. Breakdown by status. | `[BRD-030]`; DRAFT exclusion `[DERIVED]` |
| FR-014.12 | `pendingApprovals` = count of requests currently awaiting an approval decision. Proposed default composition: PENDING_REPORTING_MANAGER_APPROVAL + PENDING_RECEIVING_MANAGER_APPROVAL + PENDING_RECEIVING_MANAGER_REAPPROVAL + PENDING_IT_FINAL_APPROVAL, with the per-status breakdown always returned so any alternative definition can be displayed. | `[TDD-REQUIRED]` TDD-014.02; default `[PROPOSED]` |
| FR-014.13 | `hrReviews` = count in PENDING_HR_REVIEW (primary value); `breakdown` also lists HR_PROCESSING and PAYROLL_PROCESSING (HR-controlled stages per BRD-027). | `[BRD-002]`; composition `[TDD-REQUIRED]` TDD-014.03 |
| FR-014.14 | `blockedTasks` = count of requests in status BLOCKED (value) with `breakdown` split by stored pre-block status and by controller (HR-controlled / IT-controlled / other) and a secondary count of `it_tasks` in status BLOCKED. | `[BRD-002, BRD-014]`; semantics `[TDD-REQUIRED]` TDD-014.04 |
| FR-014.15 | `openVacancies` = count of vacancies where status = OPEN AND available capacity > 0 (computed through `VacancyQueryService`; never re-derived locally); `breakdown` returns total available positions across them. | `[BRD-028(d)]` `[DERIVED]` |
| FR-014.16 | `totalEmployees` = count of `employee_profiles` with employment status Active; breakdown also returns the all-rows total. The employment-status value set is undefined by the BRD. | `[BRD-002]`; semantics `[TDD-REQUIRED]` TDD-014.01 |
| FR-014.17 | All six cards are computed within one read-only transaction at `REPEATABLE READ` so one response is an internally consistent snapshot. Each card is computed independently; a failing card returns `{ "error": { "code": ... } }` for that card only (HTTP 200 with `partial: true`), never failing the whole dashboard. | `[PROPOSED]` |

### 7.3 Worklists

| ID | Requirement | Tag / BRD |
|---|---|---|
| FR-014.18 | `GET /worklists/transfers` returns rows with the **list DTO** (reference, employee id/name, from -> to organisation values, effective date, status, stage label, pending owner, stage age, overdue flag, last updated, `actionable` boolean, `detailLink`). It never returns documents, clarification text, HR comments or payroll references; detail comes from owning specs' endpoints under their own authorization. | `[BRD-012/013]`; minimisation `[DERIVED]` NFR-007 |
| FR-014.19 | `view` parameter: `assigned_to_me` (active assignment held by caller; `actionable=true`), `in_scope` (all scope-visible requests), `previously_handled` (requests where caller held an assignment that was released, completed or reassigned; `actionable=false`). Reassigned-away assignees keep visibility but `actionable=false`. | `[BRD-035]` `[DERIVED]`; view names `[PROPOSED]` |
| FR-014.20 | Reporting Manager worklist: `assigned_to_me` = requests at PENDING_REPORTING_MANAGER_APPROVAL assigned to caller; `in_scope` = all requests of employees whose ACTIVE `reporting_manager_assignments` manager (SPEC-003) is the caller [RECONCILED]; `previously_handled` = prior decisions ("view previous decisions"). Draft requests are excluded from every manager/HR/IT view (a Draft is private to the Employee until submitted). | `[BRD-012]`; Draft exclusion `[DERIVED]` from BRD-027 (Draft is Employee-editable, manager notified only on Submit) |
| FR-014.21 | Receiving Manager worklist: `assigned_to_me` (PENDING_RECEIVING_MANAGER_APPROVAL and PENDING_RECEIVING_MANAGER_REAPPROVAL assignments) and `previously_handled`. `in_scope` by target team/department returns 0 rows until the Receiving Manager scope mapping is decided; the endpoint returns `inScopeAvailable: false`. When the Receiving Manager stage is disabled in `workflow_configuration` the worklist is simply empty. | `[BRD-012]`; mapping `[TDD-REQUIRED]` TDD-014.08 |
| FR-014.22 | HR worklist: `assigned_to_me` for HR-controlled assignments (PENDING_HR_REVIEW, HR_PROCESSING, PAYROLL_PROCESSING); `in_scope` by location/organisation scope; filterable by stage, so HR can "monitor downstream completion before closure" (shows PENDING_IT_ACTION / PENDING_IT_FINAL_APPROVAL rows read-only). | `[BRD-013]` |
| FR-014.23 | IT worklist: `GET /worklists/it-tasks` returns IT tasks (`it_tasks`) assigned to the caller within IT location scope: task id, transfer reference, employee ID and name, from/to location, effective date, task status (e.g. NOT_STARTED, IN_PROGRESS, COMPLETED, BLOCKED per SPEC-009), stage age, overdue flag. Nothing else about the employee (no documents, no eligibility, no HR/payroll data, no reasons from other stages). | `[BRD-014]`; field list `[PROPOSED]`, TDD-014.09 |
| FR-014.24 | Unassigned location-pool IT tasks are not shown unless the IT assignee-selection design (SPEC-009/TDD) introduces pooling; the endpoint supports `view=location_pool` returning 404-equivalent empty list until then. | `[TDD-REQUIRED]` (gap g) |
| FR-014.25 | Employee own requests: `GET /worklists/my-requests` with `scope=current|history|all`. `current` = at most one active request (BRD-030) plus an existing Draft; `history` = final-status requests (COMPLETED, REJECTED, WITHDRAWN, CANCELLED) newest first. Rows carry reference, status, stage label, pending owner label (role and name only), effective date, submitted/closed timestamps, decision reason link (reason text itself rendered by SPEC-006 under its policy). | `[BRD-011]` |
| FR-014.26 | Employee pending actions = (a) own request in INFO_REQUIRED where the Employee is the responsible user (`transfer_clarifications` owner per SPEC-007, gap (k) `[TDD-REQUIRED]` TDD-014.11) -> "Respond to clarification"; (b) existing DRAFT -> "Continue draft"; (c) none otherwise. Each action carries a deep link only; actions execute in SPEC-006/007. | `[BRD-011, BRD-034]`; (k) `[TDD-REQUIRED]` |
| FR-014.27 | Sorting, filtering and pagination (section 12) are applied server-side after scope filtering; all sort keys come from a fixed whitelist per endpoint (no raw column names accepted). | `[BRD-002]`, `[PROPOSED]` |
| FR-014.28 | Pending owner shown for a request = the single active row of `transfer_task_assignments` (`state = 'PENDING'`) → `{ role, userId, displayName }` [RECONCILED]; if the stage has no assigned user (e.g., unassigned pool) the role label only is shown; for final statuses pending owner is `null`. | `[BRD-023]` `[DERIVED]` |
| FR-014.29 | The worklist shows the status badge via the shared label map (SPEC-007 labels, `[BRD-019/027]`), never a locally invented status. | `[DERIVED]` |

### 7.4 Overdue identification and escalation configuration

| ID | Requirement | Tag / BRD |
|---|---|---|
| FR-014.30 | The BRD defines **no** overdue thresholds. The system provides `escalation_settings`: one row per overdue-capable stage (see 10.1) with `threshold_value`, `threshold_unit`, `is_active`, recipient rules. All rows are seeded with `threshold_value = NULL`, `is_active = false`. **No numeric default exists in code, migrations, seeds or documentation.** | `[BRD-023, BRD-OQ-10]`; absence of defaults `[DERIVED]` |
| FR-014.31 | A request/task is **overdue** iff its stage's setting is `is_active = true` with non-null threshold AND `now() - stage_entered_at > threshold`. Clock source: `transfer_requests.stage_entered_at` (cross-spec request (a)); fallback: `MAX(created_at)` of `transfer_workflow_history` rows with `to_status = current status`. Calendar-time vs business-hours counting, clock reset on INFO_REQUIRED return, treatment of BLOCKED time and reassignment effect are not defined: proposed default is calendar time, the clock starts at stage entry, is **not** reset by reassignment, and pauses for no state. | `[TDD-REQUIRED]` TDD-014.05; default `[PROPOSED]` |
| FR-014.32 | Until at least one stage setting is active, overdue indicators are **inactive**: the overdue flag is `null` (not `false`), overdue report returns `configured: false`, and the UI shows "Overdue tracking is not configured" (Super Admin sees a link to the settings page; other roles see a neutral note). | `[DERIVED]` from FR-014.30 |
| FR-014.33 | Super Admin configures per-stage threshold (positive integer), unit (`HOURS` or `DAYS` `[PROPOSED]`), activation and escalation recipients via the escalation settings API. Changes are audited (`ESCALATION_SETTING_UPDATED`) with previous/new values. Only Super Admin may read or write them. | `[BRD-023]` ("configurable per company policy"); unit set `[PROPOSED]` |
| FR-014.34 | Escalation recipient rules (per stage): zero or more of `PENDING_OWNER`, a role (`HR`, `SUPER_ADMIN`, `REPORTING_MANAGER` of the employee ...), or a specific active user. No recipient is defaulted. With no recipients configured, overdue is shown on dashboards only and no notification is generated. | `[BRD-023]`; semantics `[TDD-REQUIRED]` TDD-014.06 |
| FR-014.35 | Escalation consists **only** of visibility and notification. It never changes workflow status, never reassigns a task (reassignment is Super Admin only, BRD-035), never bypasses an approval, and never auto-cancels/blocks a request. | `[DERIVED]` BRD-035/BRD-027 (no bypass) |
| FR-014.36 | The overdue evaluator (scheduled job) detects newly overdue requests and enqueues one `TRANSFER_TASK_OVERDUE` notification per overdue **episode** (unique `(transfer_request_id, stage_code, stage_entered_at)` in `overdue_flags`) through `NotificationService.enqueue(..., {trx})` (outbox). Delivery failure never affects the evaluator transaction or any transfer (retry owned by SPEC-012). Repeat reminders and multi-level escalation are not implemented unless TDD-014.06 decides otherwise. | `[BRD-023, BRD-036 failure rules]`; cadence `[TDD-REQUIRED]` |
| FR-014.37 | The evaluator only runs when at least one active setting exists; it is idempotent (re-running creates no duplicate flag/notification) and safe for multiple instances using a PostgreSQL advisory lock. The scheduler cadence is an operational configuration (`OVERDUE_EVALUATION_INTERVAL`, environment variable, no business meaning) — it is **not** an escalation threshold. | `[PROPOSED]` |
| FR-014.38 | When a request leaves the overdue stage (status changes) its open `overdue_flags` row is closed (`cleared_at`) by the evaluator on its next run; read endpoints compute overdue live and never depend on the flag table for display. | `[PROPOSED]` |

### 7.5 Reporting

| ID | Requirement | Tag / BRD |
|---|---|---|
| FR-014.40 | `GET /reports` returns the report catalogue permitted to the caller's role. `GET /reports/:reportKey` returns the report, scope-filtered. Keys: `request-volume`, `current-stage`, `pending-owner`, `overdue-tasks`, `vacancy-utilisation`, `completion-time`, `pending-approvals`, `hr-reviews`, `blocked-tasks`, `open-vacancies`. | `[BRD-023, BRD-002]`; key names `[PROPOSED]` |
| FR-014.41 | Super Admin receives organisation-wide reporting for all keys. | `[BRD-023]` |
| FR-014.42 | Other roles receive **restricted** reporting. Which reports each non-Super-Admin role may see is "per policy" and undefined by the BRD; proposed default (section 9, matrix R-1) is that a permitted report is always the scope-filtered version of the same query; EMPLOYEE and IT have no reports page (dashboard/worklist counts only). Role × report matrix and any hidden fields are TDD-REQUIRED and must be implemented as a data-driven policy table (`REPORT_POLICY`) so the Gate 1 outcome changes data, not code. | `[BRD-023]`; policy `[TDD-REQUIRED]` TDD-014.10 |
| FR-014.43 | Report `request-volume`: count of submitted requests (submitted_at not null) grouped by `groupBy` = `day|week|month` (business time zone), optionally also split by status, location, department; filters: `from`, `to`, status, location, department, designation. | `[BRD-023]`; groupings `[PROPOSED]` |
| FR-014.44 | Report `current-stage`: counts of **active** requests grouped by current status with stage label. Report `pending-owner`: active requests grouped by pending owner (role, user, count, oldest stage age). | `[BRD-023]` |
| FR-014.45 | Report `overdue-tasks`: list of overdue requests/tasks (stage, owner, stage age, threshold, configured escalation recipients label, overdue by) plus `configured` boolean. When no setting is active it returns an empty list with `configured: false`. | `[BRD-023]`; FR-014.32 |
| FR-014.46 | Report `vacancy-utilisation`: per vacancy and aggregate: total capacity, allocated/filled, active reserved, available, status, utilisation percentage = `(filled + reserved) / total capacity × 100` i.e. `(Total − Available) / Total` per BRD-028; `total = 0` yields `null`. All figures come from `VacancyQueryService` so the formula is not duplicated. | `[DERIVED]` from BRD-028 formula |
| FR-014.47 | Report `completion-time`: for requests in COMPLETED, duration = `completed_at − submitted_at` (submission to Completed). Aggregates: count, average, median, minimum, maximum (seconds), grouped by completion month, location or department. Whether Blocked/Info Required time is excluded is not defined; default includes elapsed calendar time. | `[DERIVED]` (BRD-023 "completion time" + BRD-018 workflow); exclusions `[TDD-REQUIRED]` TDD-014.13 |
| FR-014.48 | Reports `pending-approvals`, `hr-reviews`, `blocked-tasks`, `open-vacancies` are the row-level drill-downs of the matching dashboard cards, using the same predicates as FR-014.12 – FR-014.15 (shared query builder, so card value equals drill-down row total). | `[BRD-002]`, `[DERIVED]` |
| FR-014.49 | All reports support pagination (row reports), server-side sorting on whitelisted keys and the filters in section 12. Aggregate reports return all groups. | `[BRD-002]` |
| FR-014.50 | Report export (CSV/XLSX/PDF) is **not** required by the BRD (only audit export is, BRD-037). Export is a TDD decision; if approved, it follows FR-014.51. Until approved, no export endpoint or button exists (feature flag `REPORT_EXPORT_ENABLED=false`). | `[TDD-REQUIRED]` TDD-014.12 |
| FR-014.51 | If export is approved: server-side generation, same scope filtering as the on-screen query, role gating per decision, an audit event `REPORT_EXPORTED` (filters, row count, format, requester), no credential/sensitive field beyond what the screen shows. | `[PROPOSED]` (conditional) |

### 7.6 Frontend

| ID | Requirement | Tag / BRD |
|---|---|---|
| FR-014.55 | `/dashboard` renders the dashboard variant for the authenticated role (Super Admin cards; Employee panels; manager/HR/IT summary tiles + embedded worklist) with loading, empty, error and no-access states. | `[BRD-002]` |
| FR-014.56 | Role-aware navigation shows only permitted entries (Dashboard, Worklist, Reports, Escalation Settings); entries are driven by `data/nav` and `usePermission`, but backend authorization remains authoritative. | `[BRD-002, BRD-026]` |
| FR-014.57 | Tables are searchable, sortable, filterable, paginated, with status badges (text + colour). | `[BRD-002]` |
| FR-014.58 | Responsive desktop/tablet layout; graceful single-column on narrow viewports; accessibility support (keyboard, labels, contrast, focus, ARIA live status). WCAG level is not defined by the BRD (NFR-008: "organisational standards"). | `[BRD-002, NFR-008]`; level `[TDD-REQUIRED]` TDD-014.14 |
| FR-014.59 | Cards and rows deep-link to the owning module's detail page (SPEC-006/007/008/009) rather than duplicating action UI. No approve/reject/complete button exists on dashboards/worklists. | `[PROPOSED]` |
| FR-014.60 | Escalation settings page (Super Admin) edits one stage at a time with confirmation, shows "Not configured" for null thresholds and never pre-fills a number. | `[BRD-023]` |
| FR-014.61 | Manual "Refresh" control plus refetch on window focus; no auto-refresh interval is specified by the BRD, none is built. | `[PROPOSED]` |
| FR-014.62 | No numeric performance target (response time, concurrent users, data volume) is asserted by this SPEC; query design and the seed dataset are inputs to SPEC-015 (BRD-038 "to be confirmed"). | `[BRD-038]` consumed |

---

## 8. Internal Implementation Plan / Tasks

| Task | Title | Layer | Description | Inputs / Outputs | Depends on | BRD |
|---|---|---|---|---|---|---|
| TASK-014.01 | Migration: `escalation_settings`, `escalation_recipients` + seed stage rows (all NULL/inactive) | DB | Create tables per 10.1/10.2, seed one inactive row per overdue-capable stage with NULL threshold | In: stage list. Out: migration + seeder idempotent | SPEC-001 migration conventions, SPEC-007 status codes | BRD-023, OQ-10 |
| TASK-014.02 | Migration: `overdue_flags` | DB | Table + unique `(transfer_request_id, stage_code, stage_entered_at)` | Out: migration | TASK-014.01 | BRD-023 |
| TASK-014.03 | Migration: read-model indexes (`CREATE INDEX IF NOT EXISTS`) | DB | Indexes in 10.4 on transfer_requests, transfer_task_assignments, it_tasks, vacancies, employee_profiles | Out: migration; EXPLAIN notes | Owning specs' tables | BRD-002, BRD-023 |
| TASK-014.04 | Sequelize models + associations | BE | `EscalationSetting`, `EscalationRecipient`, `OverdueFlag`; read-only model wrappers where needed | Out: `backend/src/models/` | TASK-014.01/02 | BRD-023 |
| TASK-014.05 | `ScopeFilter` type and `ReportScopeBuilder` | BE | Convert `ScopeDescriptor` to Sequelize predicates per resource (transfer, task, vacancy, employee); explicit out-of-scope id check (FR-014.04) | In: SPEC-002 scope descriptors. Out: `buildScope(ctx, resource)`, `assertFilterInScope` | SPEC-002/003/004 | BRD-026, NFR-007 |
| TASK-014.06 | Status/stage constants and predicates module | BE | `ACTIVE_STATUSES`, `APPROVAL_STATUSES`, `HR_CONTROLLED_STAGES`, `IT_CONTROLLED_STAGES` (imported from SPEC-001 constants; `APPROVAL_STATUSES` is the only 014-local set) [RECONCILED R-3], shared card/drill-down predicate builder (FR-014.48) | Out: `status-sets.ts`, `card-predicates.ts` | SPEC-007 constants | BRD-027, BRD-030 |
| TASK-014.07 | Dashboard repository + service + `GET /dashboard/summary` | BE | Per-role card computation, REPEATABLE READ read-only trx, per-card error isolation | In: ctx. Out: role payload | TASK-014.05/06, SPEC-005 `VacancyQueryService` | BRD-002, BRD-011–014 |
| TASK-014.08 | Employee my-requests + pending actions | BE | `GET /worklists/my-requests`; pending-action derivation | Out: list DTO | TASK-014.05/06 | BRD-011, BRD-034 |
| TASK-014.09 | Transfer worklists (RM/RcvM/HR/SA) | BE | `GET /worklists/transfers` with `view`, filters, sort, pagination, list DTO, pending owner | Out: paged DTO | TASK-014.05/06 | BRD-012, BRD-013, BRD-035 |
| TASK-014.10 | IT worklist with minimum-information DTO | BE | `GET /worklists/it-tasks`; explicit field allow-list serializer | Out: minimal DTO | TASK-014.05, SPEC-009 `it_tasks` | BRD-014, NFR-007 |
| TASK-014.11 | Report registry, `REPORT_POLICY`, validators, `GET /reports` | BE | Data-driven role × report policy; per-key Joi/Zod validators | Out: catalogue | TASK-014.05 | BRD-023 |
| TASK-014.12 | Reports: request-volume, current-stage, pending-owner, pending-approvals, hr-reviews, blocked-tasks | BE | Query implementations using shared predicates | Out: report payloads | TASK-014.06/11 | BRD-023 |
| TASK-014.13 | Reports: vacancy-utilisation, open-vacancies | BE | Delegate to `VacancyQueryService`; utilisation % derivation | Out: payloads | TASK-014.11, SPEC-005 | BRD-023, BRD-028 |
| TASK-014.14 | Report: completion-time | BE | submitted→completed durations; avg/median/min/max (`percentile_cont`) | Out: payload | TASK-014.11 | BRD-023 |
| TASK-014.15 | Overdue calculation service + `overdue-tasks` report | BE | SQL overdue predicate joined to active settings; `configured` flag; null overdue when inactive | Out: overdue expressions reused by worklists | TASK-014.04/09/11 | BRD-023, OQ-10 |
| TASK-014.16 | Escalation settings service + API + audit | BE | `GET/PUT /escalation-settings`, optimistic versioning, validation, `ESCALATION_SETTING_UPDATED` | Out: endpoints | TASK-014.04, SPEC-013 AuditService | BRD-023 |
| TASK-014.17 | Overdue evaluator job + notification enqueue | BE | Advisory-lock job, `overdue_flags` insert-on-conflict, outbox enqueue `TRANSFER_TASK_OVERDUE` | Out: scheduled job | TASK-014.15/16, SPEC-012 | BRD-023, BRD-036 |
| TASK-014.18 | Export (feature-flagged, blocked on TDD-014.12) | BE | Not started until Gate 1 resolves TDD-014.12 | Out: flag-off stub | TDD-014.12 | TDD |
| TASK-014.19 | FE services, types, hooks | FE | `dashboard.service.ts`, `worklist.service.ts`, `report.service.ts`, `escalation.service.ts`; `useDashboardSummary`, `useWorklist`, `useReport`, `useEscalationSettings` | Out: typed clients | SPEC-001 http-client | BRD-002 |
| TASK-014.20 | FE shared components and states | FE | `StatCard`, `FilterBar`, `WorklistTable`, `OverdueBadge`, `PendingOwnerCell`, `StateBoundary` (loading/empty/error/no-access) | Out: components | TASK-014.19, SPEC-003 table patterns | BRD-002 |
| TASK-014.21 | FE Super Admin dashboard | FE | Six cards, drill-down, partial-error cards | Out: page | TASK-014.20 | BRD-002 |
| TASK-014.22 | FE Employee dashboard | FE | Current request, pending actions, history list | Out: page | TASK-014.20 | BRD-011 |
| TASK-014.23 | FE manager/HR worklist pages | FE | `/worklist` with tabs by view, filters, sort | Out: page | TASK-014.20 | BRD-012, BRD-013 |
| TASK-014.24 | FE IT worklist page | FE | Minimal-info table | Out: page | TASK-014.20 | BRD-014 |
| TASK-014.25 | FE reports pages | FE | `/reports` catalogue and report views (tables + accessible bars), filters | Out: pages | TASK-014.20 | BRD-023 |
| TASK-014.26 | FE escalation settings page | FE | Per-stage editor, recipients, "not configured" state | Out: page | TASK-014.20 | BRD-023 |
| TASK-014.27 | FE navigation/guards/no-access | FE | Nav entries, route guards, 403 -> no-access state | Out: nav data | SPEC-002 FE | BRD-002, BRD-026 |
| TASK-014.28 | Backend unit tests | QA | Scope builder, predicates, overdue maths, utilisation formula, DTO allow-list | TC-014.01 – 014.10 | TASK-014.05–17 | all |
| TASK-014.29 | Backend integration/API/scope tests | QA | Per-role fixtures; cross-scope leakage; direct API | TC-014.21 – 014.40 | TASK-014.07–17 | BRD-026, BRD-039 |
| TASK-014.30 | Consistency/concurrency tests | QA | Snapshot consistency, evaluator idempotency/dual instances | TC-014.51 – 014.56 | TASK-014.07, 014.17 | BRD-038 |
| TASK-014.31 | Frontend tests incl. accessibility | QA | States, role rendering, axe checks, responsive | TC-014.57 – 014.70 | TASK-014.21–27 | BRD-002, NFR-008 |
| TASK-014.32 | Seed dataset generator for performance | QA | Reproducible large dataset for SPEC-015 (size parameterised, no assumed numbers) | Out: script | TASK-014.03 | BRD-038 |

---

## 9. Business Rules

| ID | Rule | Tag |
|---|---|---|
| BR-014.01 | Visibility is derived from role + scope in the backend only; the frontend is never a filter. | `[BRD-026]` |
| BR-014.02 | Super Admin has org-wide reporting; other roles receive restricted reporting per policy. | `[BRD-023]` |
| BR-014.03 | Active = every status except DRAFT, COMPLETED, REJECTED, WITHDRAWN, CANCELLED (BLOCKED and INFO_REQUIRED are active). | `[BRD-030]` |
| BR-014.04 | DRAFT requests appear only to their Employee owner (and are excluded from every aggregate that counts "transfers in progress"). | `[DERIVED]` BRD-030/BRD-027 |
| BR-014.05 | Available vacancy = status OPEN AND available capacity > 0; Available Capacity = Total − Active Reserved/Allocated. | `[BRD-028]` |
| BR-014.06 | Vacancy utilisation % = (Total − Available) / Total; Total = 0 → not computed. | `[DERIVED]` |
| BR-014.07 | Completion time = Completed time − submission time. | `[DERIVED]` |
| BR-014.08 | Overdue is inactive until Super Admin configures an active threshold for a stage; no default exists. | `[BRD-023]`, `[DERIVED]` |
| BR-014.09 | Escalation never changes status, assignment, approvals or reservations. | `[DERIVED]` BRD-035, BRD-027 |
| BR-014.10 | IT sees only the minimum employee/transfer information for assigned tasks. | `[BRD Business Rules]` |
| BR-014.11 | A reassigned-away assignee keeps read visibility and loses the ability to act (worklist `actionable=false`). | `[BRD-035]` |
| BR-014.12 | Dashboard counts and drill-down totals must be equal for the same filter and scope (shared predicates). | `[DERIVED]` |
| BR-014.13 | Dashboard/report reads do not write audit events (no BRD requirement); exports and configuration changes do. | `[PROPOSED]` |

Report policy matrix R-1 (data in `REPORT_POLICY`, proposed default — TDD-014.10):

| Report key | SA | RM | RcvM | HR | EMP | IT |
|---|---|---|---|---|---|---|
| request-volume | all | scoped | scoped | scoped | — | — |
| current-stage | all | scoped | scoped | scoped | — | — |
| pending-owner | all | scoped | scoped | scoped | — | — |
| overdue-tasks | all | scoped | scoped | scoped | — | — |
| pending-approvals | all | scoped | scoped | scoped | — | — |
| hr-reviews | all | — | — | scoped | — | — |
| blocked-tasks | all | scoped | scoped | scoped | — | — |
| completion-time | all | scoped | scoped | scoped | — | — |
| vacancy-utilisation | all | — | — | scoped (visibility `[TDD-REQUIRED]` TDD-014.10) | — | — |
| open-vacancies | all | — | — | scoped (as above) | — | — |

---

## 10. Data Model & Database

All tables follow SPEC-001 migration conventions (`backend/src/migrations/`, models in `backend/src/models/`). Only the tables below are **owned** by this SPEC; all other data is read through SPEC-004/005/006/007/009 tables.

### 10.1 `escalation_settings` `[PROPOSED]`

| Column | Type | Constraints / notes |
|---|---|---|
| id | UUID | PK |
| stage_code | VARCHAR(64) | NOT NULL, UNIQUE; one of: PENDING_REPORTING_MANAGER_APPROVAL, PENDING_RECEIVING_MANAGER_APPROVAL, INFO_REQUIRED, PENDING_HR_REVIEW, HR_PROCESSING, PENDING_RECEIVING_MANAGER_REAPPROVAL, PAYROLL_PROCESSING, PENDING_IT_ACTION, PENDING_IT_FINAL_APPROVAL, BLOCKED (CHECK constraint; whether INFO_REQUIRED/BLOCKED are overdue-capable is TDD-014.05) |
| threshold_value | INTEGER | NULL by default; CHECK `threshold_value IS NULL OR threshold_value > 0` |
| threshold_unit | VARCHAR(8) | NULL by default; CHECK IN ('HOURS','DAYS'); required when threshold_value is set |
| is_active | BOOLEAN | NOT NULL DEFAULT false; CHECK `NOT is_active OR (threshold_value IS NOT NULL AND threshold_unit IS NOT NULL)` |
| version | INTEGER | NOT NULL DEFAULT 1 (optimistic locking) |
| updated_by | UUID | FK users, NULL until first change |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

Seeds: one row per `stage_code` with threshold/unit NULL and `is_active=false`. **No numeric default may appear in any seed, migration or fixture used outside tests.**

### 10.2 `escalation_recipients` `[PROPOSED]`

| Column | Type | Constraints / notes |
|---|---|---|
| id | UUID | PK |
| escalation_setting_id | UUID | NOT NULL FK `escalation_settings(id)` ON DELETE CASCADE |
| recipient_type | VARCHAR(24) | NOT NULL; CHECK IN ('PENDING_OWNER','ROLE','USER') |
| role | VARCHAR(24) | NULL; required iff type = ROLE; one of the six role enum values |
| user_id | UUID | NULL FK users; required iff type = USER; must reference an active user |
| created_at | TIMESTAMPTZ | NOT NULL |

Constraint: UNIQUE `(escalation_setting_id, recipient_type, role, user_id)` with NULLs handled via expression/COALESCE unique index. Recipient resolution rules for ROLE (scope: employee's location HR? employee's Reporting Manager?) are TDD-014.06.

### 10.3 `overdue_flags` `[PROPOSED]`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| transfer_request_id | UUID | NOT NULL FK `transfer_requests` |
| stage_code | VARCHAR(64) | NOT NULL |
| stage_entered_at | TIMESTAMPTZ | NOT NULL (the stage episode identity) |
| first_flagged_at | TIMESTAMPTZ | NOT NULL |
| notified_at | TIMESTAMPTZ | NULL (set when outbox row enqueued) |
| cleared_at | TIMESTAMPTZ | NULL (set when the request left the stage) |
| UNIQUE | `(transfer_request_id, stage_code, stage_entered_at)` | idempotency of detection and notification |

This table is bookkeeping only; displays never read it for the overdue state.

### 10.4 Read-model indexes (created with `CREATE INDEX IF NOT EXISTS`; column names must be reconciled with owning specs' final DDL)

| Index | Table (owner) | Columns | Purpose |
|---|---|---|---|
| idx_tr_status_submitted | transfer_requests (006) | (status, submitted_at DESC) | card counts, current-stage, request volume |
| idx_tr_employee_submitted | transfer_requests | (employee_id, submitted_at DESC) | employee own requests |
| idx_tr_active_stage_entered | transfer_requests | (stage_entered_at) WHERE status IN active set | overdue evaluator |
| idx_tr_current_location | transfer_requests | (current_location_id, status) | HR location scope |
| idx_tta_assignee_active | transfer_task_assignments (007) | (assignee_user_id, stage_status) WHERE state = 'PENDING' [RECONCILED] | assigned-to-me worklists |
| idx_tta_request | transfer_task_assignments | (transfer_id, state) [RECONCILED] | pending owner join |
| idx_ith_assignee_status | it_tasks (009) | (assigned_to_user_id, status) [RECONCILED] | IT worklist |
| idx_vac_status_location | vacancies (005) | (status, location_id) | open vacancies |
| idx_rma_manager_active | reporting_manager_assignments (003) | (reporting_manager_user_id) WHERE status='ACTIVE' | manager scope [RECONCILED] was employee_profiles index; SPEC-004 has no reporting-manager column |
| idx_ep_location | employee_profiles | (location_id) | HR scope, total employees |

### 10.5 Query/read-model design decision

| Option | Decision |
|---|---|
| Live indexed queries over source tables | **Chosen default** `[PROPOSED]`: always correct, scope predicate applied per request, no staleness. |
| Materialised views / summary tables | Not used initially: scope-specific results cannot share one view without re-filtering by employee, and staleness would make "pending approvals" inaccurate. Re-evaluated only if SPEC-015 performance validation shows targets (not yet defined, BRD-038) are not met; any such summary must still be scope-filtered at read time. |
| Application cache | None; avoids serving stale or mis-scoped data. |

Performance inputs (concurrent users, volume, response-time targets) are undefined (BRD-038) and owned by SPEC-015; this SPEC asserts none.

### 10.6 Retention
`overdue_flags` rows are kept (small, append-only per episode); no deletion path in the application. `escalation_settings` history is preserved in the audit log (not in a history table).

---

## 11. Backend Implementation

Module layout `[PROPOSED]`: `backend/src/modules/dashboard/`, `backend/src/modules/reporting/`, `backend/src/modules/escalation/`, each with `controller`, `service`, `repository`, `validators`, `routes`, `dto`.

| Component | Responsibility |
|---|---|
| `ReportScopeBuilder` | Maps `ScopeDescriptor` (SPEC-002) to Sequelize predicates per resource; `assertFilterInScope(ctx, {locationId,...})` -> throws `ForbiddenError` (FR-014.04) |
| `status-sets.ts` | Constant arrays (`ACTIVE_STATUSES`, `APPROVAL_STATUSES`, `HR_CONTROLLED_STAGES`, `IT_CONTROLLED_STAGES`) imported from SPEC-001 `common/constants/transfer-status.ts` (re-exported by SPEC-007) [RECONCILED R-3]; no literal statuses elsewhere |
| `card-predicates.ts` | Single definition of each card's predicate; consumed by card counts and drill-down rows (BR-014.12) |
| `DashboardService` | `getSummary(ctx)` → role-specific payload; opens read-only REPEATABLE READ transaction (`withTransaction({readOnly:true, isolation:'REPEATABLE READ'})`) |
| `WorklistService` | `listTransfers(ctx, query)`, `listMyRequests`, `listItTasks`; list-DTO serializers (allow-list, not deny-list) |
| `ReportService` | Registry `{ key → { validator, query, policy } }`; `REPORT_POLICY` data table |
| `OverdueService` | `overdueExpression(settingsSnapshot)` returns SQL fragment; `isConfigured()` |
| `EscalationSettingsService` | CRUD with optimistic version check, validation, audit |
| `OverdueEvaluationJob` | Scheduler-invoked; advisory lock `pg_try_advisory_lock(hashtext('overdue-evaluator'))`; transaction per batch |

Implementation rules (INT standards): `async/await` only, `try/catch` around every async operation with the structured logger (no `console.log`), env-only configuration (`OVERDUE_EVALUATION_INTERVAL`, `REPORT_EXPORT_ENABLED`, business time zone from SPEC-001 config), input validation through shared validation middleware, structured error envelope with `requestId`, no `eval`/dynamic SQL from user input (sort keys mapped from whitelist; all values bound as replacements/parameters), event-loop protection: aggregation stays in PostgreSQL (`GROUP BY`, `percentile_cont`), report row building streamed/paged; no large in-memory aggregation in Node.

Overdue SQL fragment (illustrative `[PROPOSED]`):
```sql
(es.is_active AND es.threshold_value IS NOT NULL AND
 tr.stage_entered_at < now() - (es.threshold_value * CASE es.threshold_unit WHEN 'HOURS' THEN interval '1 hour' ELSE interval '1 day' END))
```
Joined `LEFT JOIN escalation_settings es ON es.stage_code = tr.status`. Result is `NULL`-able: if no active setting, overdue projected as `NULL` (inactive), not `false`.

Scope SQL examples `[PROPOSED]`:
- EMPLOYEE: `tr.employee_id = :ctxEmployeeId AND tr.status IS NOT NULL` (DRAFT allowed here only).
- REPORTING_MANAGER: `tr.status <> 'DRAFT' AND (EXISTS (SELECT 1 FROM reporting_manager_assignments rma WHERE rma.employee_user_id = ep.user_id AND rma.status = 'ACTIVE' AND rma.reporting_manager_user_id = :me) OR EXISTS (SELECT 1 FROM transfer_task_assignments a WHERE a.transfer_id = tr.id AND a.assignee_user_id = :me))`.
- HR: `tr.status <> 'DRAFT' AND (ep.location_id IN (:hrLocationIds) OR EXISTS (… assigned to me …))`.
- RECEIVING_MANAGER: `tr.status <> 'DRAFT' AND EXISTS (… assigned to me …)`.
- IT: tasks join `it_tasks.assigned_to_user_id = :me AND task location IN (:itLocationIds)`.

---

## 12. API Requirements

[RECONCILED R-11] Endpoint ownership to avoid duplicates: the cross-role read model is owned here (`/dashboard/summary`, `/worklists/*`, `/reports/*`, `/escalation-settings`). Action-workspace lists owned by other specs (SPEC-006 `/my/transfer-requests`, SPEC-007 `/workflow/tasks` primitive, SPEC-008 `/hr/transfers` and `/receiving-manager/reapprovals`, SPEC-009 `/it/tasks` and `/payroll-activities`) must reuse this SPEC's `ScopedTransferQuery`/scope predicates (section 11) rather than re-implement scope SQL; a user must see the same set of requests through both routes. `/worklists/my-requests` is the dashboard view of SPEC-006 `/my/transfer-requests` (same data, same EMPLOYEE-only authz).

Base path `/api/v1` `[PROPOSED]`; envelope per SPEC-001: success `{ "success": true, "data": {...}, "meta": {...} }`, error `{ "success": false, "error": { "code", "message", "details": [], "requestId" } }`. Pagination `page`, `pageSize` (default 20, max 100), `sort`, `order`, `q` `[PROPOSED]`. All endpoints require authentication (401 otherwise) and respond 403 `FORBIDDEN` when authenticated but not permitted. Common 400: `VALIDATION_ERROR`, `UNKNOWN_QUERY_PARAMETER`. 500: `INTERNAL_ERROR` (no stack/SQL in response).

### 12.1 `GET /dashboard/summary`

| Item | Value |
|---|---|
| Purpose | Role-specific dashboard cards/panels |
| Auth | Any authenticated active role |
| Authz | Role ∈ six roles; payload scope-filtered per section 6 |
| Request | no query parameters |
| Response 200 | `data: { role, generatedAt, partial, cards: [ { key, label, value, breakdown?: [{label, value}], drillDown?: { reportKey|view, filters }, error?: { code } } ], overdue: { configured: boolean, count: number|null } }`; for EMPLOYEE additionally `data.currentRequest`, `data.pendingActions[]`, `data.historyCount` |
| Role card sets | SA: totalEmployees, activeTransfers, pendingApprovals, hrReviews, blockedTasks, openVacancies. EMP: current request, pending actions. RM: pendingMyApproval, scopedActive, handled. RcvM: pendingMyApproval, pendingMyReapproval, handled. HR: pendingHrReview, hrProcessing, payrollProcessing, blockedInScope. IT: myOpenTasks, inProgress, blocked, pendingFinalApproval |
| Validation | none (unknown params → 400) |
| Errors | 401, 403, 500; per-card failures reported inside `cards[].error` (HTTP 200, `partial: true`) |

### 12.2 `GET /worklists/transfers`

| Item | Value |
|---|---|
| Purpose | Scoped transfer worklist (RM, RcvM, HR, SA) |
| Authz | REPORTING_MANAGER, RECEIVING_MANAGER, HR, SUPER_ADMIN; EMPLOYEE and IT → 403 |
| Query | `view` (`assigned_to_me`\|`in_scope`\|`previously_handled`, default `assigned_to_me`), `status` (repeatable; must be valid status code), `stage` (alias of status), `locationId`, `departmentId`, `designationId`, `assignedUserId` (SA only), `overdue` (`true` only when configured), `submittedFrom`, `submittedTo` (ISO dates, business TZ), `q` (reference, employee id, employee name; min 2 chars), `page`, `pageSize`, `sort` (`submittedAt`\|`stageAge`\|`status`\|`reference`\|`effectiveDate`), `order` |
| Response 200 | `data: [ { transferRequestId, reference, employee: { employeeId, name }, from: {location, department, designation}, to: {location, department, designation}, effectiveDate, status, statusLabel, pendingOwner: { role, userId, name }|null, stageEnteredAt, overdue: true|false|null, actionable, detailLink } ]`, `meta: { page, pageSize, total, totalPages, inScopeAvailable }` |
| Errors | 400 `VALIDATION_ERROR` (bad status, bad date, `submittedFrom > submittedTo`), 400 `UNKNOWN_QUERY_PARAMETER`, 403 `FORBIDDEN` (out-of-scope id filter or role), 401 |

### 12.3 `GET /worklists/my-requests`

| Item | Value |
|---|---|
| Purpose | Employee current + historical own requests and pending actions |
| Authz | EMPLOYEE only (own `employee_id` from token; never from request) |
| Query | `scope` (`current`\|`history`\|`all`, default `all`), `status`, `page`, `pageSize`, `sort` (`submittedAt`\|`closedAt`), `order` |
| Response 200 | `data: { current: {…row}|null, draft: {…row}|null, pendingActions: [ { type: 'RESPOND_CLARIFICATION'|'CONTINUE_DRAFT', transferRequestId, reference, link } ], history: [ …rows ] }`, `meta` for history |
| Errors | 401, 403 (non-Employee role), 400 |

### 12.4 `GET /worklists/it-tasks`

| Item | Value |
|---|---|
| Purpose | IT assigned tasks with minimum information |
| Authz | IT (and SUPER_ADMIN for oversight, same minimal DTO) |
| Query | `view` (`assigned_to_me`\|`location_pool`), `taskStatus`, `overdue`, `page`, `pageSize`, `sort` (`stageAge`\|`taskStatus`\|`effectiveDate`), `order` |
| Response 200 | `data: [ { itTaskId, transferReference, employee: { employeeId, name }, fromLocation, toLocation, effectiveDate, taskStatus, stageEnteredAt, overdue, detailLink } ]` — allow-listed fields only |
| Errors | 401, 403, 400 |

### 12.5 `GET /reports`

| Item | Value |
|---|---|
| Purpose | Report catalogue for the caller |
| Authz | SA, RM, RcvM, HR (EMP/IT → 403) |
| Response 200 | `data: [ { key, title, description, filters: [..], exportable: boolean } ]` from `REPORT_POLICY` |

### 12.6 `GET /reports/:reportKey`

| Item | Value |
|---|---|
| Purpose | Run a scope-filtered report |
| Authz | Role must be permitted for `reportKey` per `REPORT_POLICY`; otherwise 403; unknown key → 404 `REPORT_NOT_FOUND` |
| Common query | `from`, `to`, `status`, `locationId`, `departmentId`, `designationId`, `page`, `pageSize`, `sort`, `order` |
| Per-key query | request-volume: `groupBy` (`day`\|`week`\|`month`, default `month`), `splitBy` (`status`\|`location`\|`department`); completion-time: `groupBy` (`month`\|`location`\|`department`); pending-owner: `role`, `userId`; vacancy-utilisation/open-vacancies: `vacancyStatus`, `departmentId`, `designationId`, `locationId` |
| Response 200 | `data: { key, generatedAt, configured?: boolean, columns: [...], rows: [...], totals?: {...} }`, `meta` (paging for row reports) |
| Errors | 400, 401, 403, 404, 500 |

### 12.7 `GET /escalation-settings` and `PUT /escalation-settings/:stageCode`

| Item | Value |
|---|---|
| Purpose | Read and update per-stage overdue thresholds and escalation recipients |
| Authz | SUPER_ADMIN only |
| GET response | `data: [ { stageCode, label, thresholdValue|null, thresholdUnit|null, isActive, recipients: [ { type, role?, userId?, displayName? } ], version, updatedBy, updatedAt } ]` |
| PUT request | `{ "thresholdValue": number|null, "thresholdUnit": "HOURS"|"DAYS"|null, "isActive": boolean, "recipients": [ { "type": "PENDING_OWNER"|"ROLE"|"USER", "role"?: string, "userId"?: string } ], "version": number }` |
| PUT validation | `stageCode` must exist; `thresholdValue` positive integer or null; unit required with value; `isActive=true` requires value+unit; recipients valid (ROLE needs role, USER needs active user id; no duplicates); `version` required |
| PUT response | 200 updated setting |
| Errors | 400 `VALIDATION_ERROR`; 403; 404 `ESCALATION_STAGE_NOT_FOUND`; 409 `ESCALATION_SETTING_VERSION_CONFLICT` (stale version); 401 |
| Audit | `ESCALATION_SETTING_UPDATED` in same transaction |

### 12.8 `POST /reports/:reportKey/export` `[TDD-REQUIRED]`
Disabled (404 `EXPORT_NOT_AVAILABLE`) while `REPORT_EXPORT_ENABLED=false`. Shape defined only after TDD-014.12. If enabled: same query as 12.6, role gate per decision, audited (`REPORT_EXPORTED`).

---

## 13. Frontend Implementation

Next.js App Router under `frontend/src/app/(protected)/`; Redux Toolkit/Context per Frontend-Architecture; Axios clients in `src/services/`.

### 13.1 Routes `[PROPOSED]`

| Route | Purpose | Roles | Notes |
|---|---|---|---|
| `/dashboard` (existing `dashboard/page.tsx`) | Role-dispatched dashboard | All | Renders `SuperAdminDashboard`, `EmployeeDashboard`, `ManagerDashboard`, `HrDashboard`, `ItDashboard` |
| `/worklist` | Transfer worklist with view tabs | RM, RcvM, HR, SA | tabs: Assigned to me / In scope / Previously handled |
| `/worklist/it` | IT tasks | IT, SA | minimal columns |
| `/my-requests` | Employee current + history | EMPLOYEE | links to SPEC-006 detail |
| `/reports` | Catalogue | SA, RM, RcvM, HR | cards linking to reports |
| `/reports/[reportKey]` | Report view | per policy | filter bar, table, accessible bar visual |
| `/settings/escalation` | Escalation settings | SA | confirmation dialogs |

### 13.2 Components `frontend/src/components/dashboard/`, `.../worklist/`, `.../reports/`

`StatCard` (value, label, breakdown, drill-down link, per-card error/skeleton), `DashboardGrid`, `WorklistTable`, `WorklistFilterBar`, `StatusBadge` (shared kit; text + colour), `PendingOwnerCell`, `OverdueBadge` (hidden when `overdue === null`), `OverdueNotConfiguredNotice`, `ReportFilterBar`, `ReportTable`, `SimpleBarList` (accessible bar list rendered from data table; no charting library unless TDD-014.14), `EscalationStageForm`, `RecipientEditor`, `StateBoundary`.

### 13.3 Hooks/services/state
Hooks `useDashboardSummary`, `useWorklist(view, filters)`, `useMyRequests`, `useItTasks`, `useReport(key, filters)`, `useEscalationSettings`; filter state in URL query string (shareable, back-button safe); sort/page via URL. Services return typed DTOs; no client-side filtering for security (only presentational).

### 13.4 UI states (all pages)

| State | Behaviour |
|---|---|
| Loading | Skeleton cards/rows, `aria-busy="true"`, `role="status"` text |
| Empty | Contextual message (e.g., "No transfers need your action"), reset-filters action when filters applied |
| Error | Message + `requestId` + Retry; card-level error for partial dashboard |
| No access | 403/forbidden role → "You do not have access to this page" with no restricted data; route guard prevents nav entry |
| Overdue not configured | Neutral notice (SA: link to settings) |
| Stale conflict | Escalation 409 → "Settings changed by someone else, reload" |

### 13.5 Responsiveness & accessibility
Desktop/tablet two-to-three column grid, single column below tablet; tables switch to stacked card rows on narrow widths; semantic `<table>` with `<caption>`, `<th scope>`, `aria-sort`; cards are `<section aria-labelledby>`; status never colour-only; visible focus; keyboard operable filters/pagination/dialogs (focus trap, Esc to close); `aria-live="polite"` for result-count updates; colour contrast per target level (TDD-014.14).

---

## 14. Validation Rules

| Field | Rule | Error |
|---|---|---|
| `page` | integer ≥ 1 | 400 VALIDATION_ERROR |
| `pageSize` | integer 1..100 | 400 |
| `sort`/`order` | whitelisted key; `asc|desc` | 400 |
| `status` | each value ∈ status enum | 400 |
| `view`, `scope`, `groupBy`, `splitBy`, `taskStatus` | enum | 400 |
| `from`/`to`, `submittedFrom`/`submittedTo` | ISO `YYYY-MM-DD`; `from ≤ to`; interpreted in business TZ | 400 |
| `q` | trimmed, 2..100 chars, bound as parameter, LIKE metacharacters escaped | 400 |
| `locationId`, `departmentId`, `designationId`, `employeeId`, `assignedUserId`, `userId` | UUID/ID format, must be in scope (403 otherwise) | 400 / 403 |
| `overdue` | `true|false`; `true` when not configured returns empty set with `configured:false` | 400 |
| `thresholdValue` | positive integer or null (no upper default assumed) | 400 |
| `thresholdUnit` | `HOURS|DAYS` | 400 |
| `isActive` | boolean; true requires value and unit | 400 |
| `recipients[]` | ≤ one entry per (type, role, user); USER active; ROLE valid role | 400 |
| `version` | integer | 400 / 409 |
| Unknown params | rejected | 400 UNKNOWN_QUERY_PARAMETER |

## 15. Authorization & Security Rules

| Check (BRD-026 order) | Application here |
|---|---|
| 1 Authenticated | SPEC-002 middleware; 401 |
| 2 Role | Endpoint/role table in section 12; `REPORT_POLICY` for reports |
| 3 Organisation scope | `ReportScopeBuilder` on every query; explicit out-of-scope ids → 403 |
| 4 Resource | Lists/aggregates (no single-resource ids); detail links re-authorised by owning endpoints |
| 5 Action | View only; no state change; escalation write is Super Admin only |

Additional rules: IT DTO allow-list (BR-014.10); no passwords/tokens/credentials in any payload or log; error responses identical for "does not exist" vs "out of scope"; `Cache-Control: no-store` on all responses of this SPEC `[PROPOSED]`; SQL fully parameterised; frontend never receives out-of-scope rows (so hiding is not a control); aggregated counts for restricted roles are computed from scoped rows only (no org-wide totals leak via `meta.total` or breakdowns); employee names/IDs are minimum necessary (NFR-007); denial attempts audited as security events via SPEC-002/013.

## 16. Workflow / State Transition Rules

Not applicable — this SPEC owns no workflow state and registers no handler with `WorkflowEngine`; it has no state-changing transfer action. It **reads** the statuses of BRD-027 and the pending owner from `transfer_task_assignments`.

Reading rules: Completed is displayed only when `transfer_requests.status = COMPLETED` (BRD-019: not shown as Completed on approval alone). Status sets in `status-sets.ts` are imported from SPEC-007; a status added there is automatically visible only after being added to the relevant set (test enforces every status belongs to exactly one of: active, final, draft).

## 17. Transaction & Concurrency Rules

| Rule | Detail |
|---|---|
| Read-only snapshot | Dashboard summary runs in one read-only `REPEATABLE READ` transaction so card values are mutually consistent `[PROPOSED]` |
| Write operations | Only escalation setting update and overdue flag insertion |
| Settings update | Optimistic `version` check in the same transaction as audit insert; stale version → 409; recipients replaced atomically (delete + insert in one transaction) |
| Evaluator | Single run holds advisory lock; `INSERT ... ON CONFLICT DO NOTHING RETURNING` into `overdue_flags`; outbox enqueue in same transaction; re-run or two instances create no duplicates |
| Read vs workflow writes | Reads never lock transfer rows (no `FOR UPDATE`); worklist may show a request that changes state a moment later — actions are re-authorised by their owning endpoints (`INVALID_WORKFLOW_TRANSITION`) |
| Pagination consistency | Offset pagination with deterministic secondary sort key (`id`) |
| Notification failure | Never rolls back evaluator or any transfer transaction `[BRD-036]` |

## 18. Audit Requirements

| Event code `[PROPOSED]` | Trigger | Fields captured | BRD |
|---|---|---|---|
| ESCALATION_SETTING_UPDATED | Super Admin changes threshold, unit, activation or recipients | actor, role, stage_code, previous/new threshold/unit/is_active, previous/new recipients, timestamp, remarks | BRD-022/037 (configuration change), BRD-023 |
| REPORT_EXPORTED (conditional on TDD-014.12) | Export executed | actor, role, report key, filters, row count, format, timestamp | BRD-037 pattern |
| AUTHORIZATION_DENIED (emitted via SPEC-002) | 403 on any endpoint of this SPEC | actor, role, endpoint, attempted resource, timestamp | BRD-026, BRD-037 |

Dashboard/report/worklist reads are not audited (not material actions per BRD-022/037); this is a `[PROPOSED]` decision, not a BRD prohibition. Overdue detection is logged (structured logger) but not audited. Secrets/credentials never appear in audit fields.

## 19. Notification Requirements

| Event code `[PROPOSED]` | Recipient | Channel | Trigger task | BRD |
|---|---|---|---|---|
| TRANSFER_TASK_OVERDUE | Pending owner and configured escalation recipients (per setting) | Email + In-app proposed to match BRD-036 workflow channel rule; the BRD does not list overdue as one of the twelve mandatory events, so channel and mandatory/optional status are `[TDD-REQUIRED]` TDD-014.06 | TASK-014.17 | BRD-023 ("overdue approvals/tasks identifiable through dashboards and notifications") |

Payload: transfer reference, stage label, stage age, owner, deep link. Created through the SPEC-012 outbox; this SPEC never sends mail directly. No other notification is produced here.

## 20. Error & Edge Cases

| Case | Behaviour |
|---|---|
| No active escalation setting | Overdue `null`; UI notice; evaluator no-op (FR-014.32/37) |
| Setting made active while requests already beyond threshold | Next evaluator run flags all currently overdue requests (one notification each); proposal to avoid a notification flood: first evaluation after activation notifies — whether to suppress is TDD-014.06 |
| Threshold deactivated/changed | Existing `overdue_flags` retained; display recomputed live; cleared_at on stage exit |
| Request leaves stage between evaluator runs | Flag cleared; no notification if cleared before detection |
| Receiving Manager stage disabled | No RcvM rows; reports show zero for RcvM stages, not errors |
| Employee with Draft only | `current: null`, `draft` populated, no active request |
| Employee with no requests | Empty state with link to start a request (SPEC-006) |
| Reassigned task | Old assignee sees `previously_handled`, `actionable=false`; new assignee sees `assigned_to_me` |
| User whose scope mapping is empty (HR with no locations) | Empty results, not org-wide fallback (fail closed) |
| Missing `stage_entered_at` | Fallback to workflow history; if still missing, overdue = `null` for that row and error logged |
| Vacancy total capacity 0 | Utilisation `null`, shown "—" |
| Large result sets | Paginated; aggregates in SQL; no unbounded export |
| Partial dashboard failure | Card-level error; others render |
| Out-of-scope filter id | 403 generic |
| Clock/time zone | All date filters and groupings in the configured business time zone; stored timestamps UTC `TIMESTAMPTZ` |
| Role changes mid-session | SPEC-002 reevaluates per request; next dashboard load reflects new role |

## 21. Acceptance Criteria

| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-014.AC01 | Given a Super Admin, when they open the dashboard, then six cards (total employees, active transfers, pending approvals, HR reviews, blocked tasks, open vacancies) display values computed from current data. | BRD-002 |
| SPEC-014.AC02 | Given the dashboard card values, when the Super Admin follows each drill-down, then the report row total equals the card value for the same filters. | BRD-002, BR-014.12 |
| SPEC-014.AC03 | Given an Employee with one active request and prior closed requests, when they open their dashboard, then they see the one current request with status, stage and pending owner, and their historical requests listed newest first. | BRD-011 |
| SPEC-014.AC04 | Given an Employee whose request is INFO_REQUIRED and who is the responsible user, when they open the dashboard, then a "Respond to clarification" pending action links to the request. | BRD-011, BRD-034 |
| SPEC-014.AC05 | Given a Reporting Manager, when they open the worklist, then "Assigned to me" lists only requests awaiting their approval and "In scope" lists only requests of employees whose Reporting Manager is them. | BRD-012 |
| SPEC-014.AC06 | Given Receiving Manager approval is enabled and a request is at PENDING_RECEIVING_MANAGER_APPROVAL assigned to a Receiving Manager, when they open the worklist, then the request appears under "Assigned to me" with `actionable=true`. | BRD-012 |
| SPEC-014.AC07 | Given an HR user with a location scope, when they open the worklist, then they see only requests whose employee location is in scope (plus requests assigned to them), including downstream-stage requests read-only. | BRD-013 |
| SPEC-014.AC08 | Given a request reassigned from HR user A to HR user B, when A opens the worklist, then it appears only under "Previously handled" with `actionable=false`, and B sees it under "Assigned to me". | BRD-035 |
| SPEC-014.AC09 | Given an IT user with assigned tasks, when they open the IT worklist, then they see only their assigned tasks and only the allow-listed fields (no documents, no other-stage data). | BRD-014, NFR-007 |
| SPEC-014.AC10 | Given a Draft request, when a manager, HR or IT user lists transfers, then the Draft never appears. | BR-014.04 |
| SPEC-014.AC11 | Given no escalation setting is active, when any user opens a dashboard, worklist or the overdue report, then no row is marked overdue and a "not configured" notice is shown. | BRD-023, OQ-10 |
| SPEC-014.AC12 | Given the Super Admin configures an active threshold and recipients for a stage, when a request in that stage exceeds the threshold, then it is shown overdue on dashboards/worklists and exactly one `TRANSFER_TASK_OVERDUE` notification is enqueued per overdue episode. | BRD-023 |
| SPEC-014.AC13 | Given the evaluator runs twice (or on two instances) over the same overdue request, then no duplicate flag or notification is created. | BRD-036 (idempotency) |
| SPEC-014.AC14 | Given a notification delivery failure for an overdue event, when the evaluator has run, then no transfer status or data changes and the failure is retried by SPEC-012. | BRD-036 |
| SPEC-014.AC15 | Given requests in BLOCKED status, when the Super Admin views the Blocked Tasks card/report, then the count/rows match and show the stored pre-block status. | BRD-002, BRD-027 |
| SPEC-014.AC16 | Given a vacancy with Total 5, Filled 3, Active Reservation 1, when the vacancy-utilisation report runs, then Available = 1 and utilisation = 80%. | BRD-028 (example), DERIVED |
| SPEC-014.AC17 | Given Open vacancies with available capacity > 0 and others Full/On Hold/Closed, when the Open Vacancies card is computed, then only Open with capacity > 0 are counted. | BRD-028(d) |
| SPEC-014.AC18 | Given completed requests, when the completion-time report runs, then durations equal Completed time minus submission time with average/median/min/max. | BRD-023, DERIVED |
| SPEC-014.AC19 | Given an HR user, when they request a report they are permitted by `REPORT_POLICY`, then every row, count and total derives only from their scope. | BRD-023 |
| SPEC-014.AC20 | Given the Super Admin sets a threshold with a unit and activates it, then the audit log contains `ESCALATION_SETTING_UPDATED` with previous and new values. | BRD-022/037 |
| SPEC-014.AC21 | Given a list with filters, sort and page parameters, when requested, then results are filtered/sorted/paginated by the server and `meta.total` reflects scoped rows only. | BRD-002 |
| SPEC-014.AC22 | Given loading, empty, error and 403 situations, when each occurs, then the corresponding clear state renders on every page. | BRD-002 |
| SPEC-014.AC23 | Given a keyboard-only user, when they use dashboard, worklist, filters and dialogs, then all controls are reachable and operable with visible focus and announced result updates. | BRD-002, NFR-008 |
| SPEC-014.AC24 | Given Receiving Manager approval is disabled, when worklists and reports load, then Receiving Manager stages show no rows and no errors. | BRD-012 / OQ-04 |

## 22. Negative Acceptance Criteria

| ID | Given / When / Then | BRD-039 / BRD |
|---|---|---|
| SPEC-014.NAC01 | Given an HR user scoped to Location A, when they call the worklist, a report, or a card endpoint with `locationId` for Location B, then 403 `FORBIDDEN` is returned and no Location B data or counts are exposed. | BRD-039 Security 1, 8 |
| SPEC-014.NAC02 | Given an HR user, when they call `GET /reports/…` with no filter via Postman, then totals/aggregates include only in-scope requests (never org-wide numbers). | BRD-039 Security 1, 8 |
| SPEC-014.NAC03 | Given a Reporting Manager, when they request the worklist with `employeeId` of an employee they do not manage, then 403 `FORBIDDEN`. | BRD-039 Security 1 |
| SPEC-014.NAC04 | Given an Employee, when they call any worklist/report endpoint passing another employee's id or the manager worklist, then the request is rejected (403 / 400) and only their own data is ever returned. | BRD-039 Security 2 |
| SPEC-014.NAC05 | Given an IT user, when they call `GET /worklists/it-tasks`, then the response contains no document metadata, no HR/payroll data and no tasks assigned to others; calling `/worklists/transfers` returns 403. | BRD-039 Security 3 (list slice), BRD-014 |
| SPEC-014.NAC06 | Given an Employee or IT user, when they call `GET /reports` or `GET /reports/:key`, then 403 `FORBIDDEN`. | BRD-023 |
| SPEC-014.NAC07 | Given a non-Super-Admin, when they call `GET/PUT /escalation-settings`, then 403 and nothing is read or changed. | BRD-023 |
| SPEC-014.NAC08 | Given a missing, invalid or expired token, when any endpoint is called, then 401 and no data. | BRD-026 |
| SPEC-014.NAC09 | Given a deactivated or locked user's valid-looking token, when an endpoint is called, then it is rejected. | BRD-025 |
| SPEC-014.NAC10 | Given a PUT with `isActive=true` and no threshold, a non-positive or fractional threshold, an unknown unit or a stale `version`, then 400/409 and no change. | BRD-023 |
| SPEC-014.NAC11 | Given no active setting, when the overdue report is filtered `overdue=true`, then an empty set and `configured:false` (no invented default threshold is applied). | BRD-023, OQ-10 |
| SPEC-014.NAC12 | Given a vacancy with Total 0, or inconsistent data producing negative available, when reports compute utilisation, then they show `null` and never a negative or >100% fabricated value. | BRD-039 Vacancy 3 (display slice) |
| SPEC-014.NAC13 | Given an unknown query parameter, an invalid sort key or SQL metacharacters in `q`, then 400 or safely escaped parameter binding with no SQL injection. | INT security standard |
| SPEC-014.NAC14 | Given a reassigned-away user, when they attempt to act via a dashboard link, then the owning endpoint refuses (this SPEC shows `actionable=false`). | BRD-035 |
| SPEC-014.NAC15 | Given export is disabled, when `POST /reports/:key/export` is called, then 404 `EXPORT_NOT_AVAILABLE`. | TDD-014.12 |
| SPEC-014.NAC16 | Given a HR user with no configured location scope, when they open the worklist, then they see an empty list (fail closed), never org-wide data. | BRD-026 |

## 23. Testing Requirements

Tests live in `tests/backend/dashboard/`, `tests/backend/reporting/`, `tests/backend/escalation/`, `tests/frontend/dashboard/`. TDD: RED tests (TC-014.xx) written before implementation.

| Type | Test ID | Description |
|---|---|---|
| Unit | TC-014.01 | `ACTIVE_STATUSES` excludes DRAFT + four finals; every status belongs to exactly one set |
| Unit | TC-014.02 | Card predicate for each of six cards (parameterised by fixtures) |
| Unit | TC-014.03 | Overdue expression: inactive → null; active threshold boundary (just under/over); HOURS vs DAYS |
| Unit | TC-014.04 | Utilisation formula incl. BRD-028 example (5/3/1) and total 0 |
| Unit | TC-014.05 | Completion-time aggregates (avg/median/min/max) |
| Unit | TC-014.06 | `ReportScopeBuilder` per role/resource; empty scope fails closed |
| Unit | TC-014.07 | List DTO and IT DTO allow-list (extra fields stripped; snapshot test) |
| Unit | TC-014.08 | Validators (all rules of section 14) |
| Unit | TC-014.09 | `REPORT_POLICY` lookup: unknown key vs forbidden key |
| Unit | TC-014.10 | Scope contract test: every repository method requires `ScopeFilter` |
| Integration | TC-014.21 | Dashboard summary per role with fixtures, values correct |
| Integration | TC-014.22 | Card value equals drill-down total (all four drill-down reports) |
| Integration | TC-014.23 | Worklist views for RM, RcvM, HR; reassigned-away behaviour |
| Integration | TC-014.24 | IT worklist minimal fields; location scope |
| Integration | TC-014.25 | Employee my-requests current/history/draft/pending actions |
| Integration | TC-014.26 | Reports per key for SA and HR; restricted totals |
| Integration | TC-014.27 | Overdue configured/unconfigured; seeded rows have NULL thresholds (migration test asserts no numeric default) |
| Integration | TC-014.28 | Escalation settings CRUD, validation, audit event, optimistic conflict |
| Integration | TC-014.29 | Evaluator: single notification per episode; clear on stage exit; outbox row created |
| Integration | TC-014.30 | Receiving Manager disabled: empty RcvM views |
| API / Security | TC-014.31 – 014.38 | NAC01–NAC09, NAC13, NAC16 via supertest per role (cross-location, cross-employee, role-forbidden, 401, deactivated) |
| API | TC-014.39 | Pagination/sort/filter determinism; `meta.total` scoped |
| API | TC-014.40 | Error envelope shape, `requestId`, no stack/SQL leakage |
| Concurrency | TC-014.51 | Dashboard snapshot consistency while a transition commits mid-request |
| Concurrency | TC-014.52 | Two evaluator instances: advisory lock, single flag |
| Concurrency | TC-014.53 | Evaluator re-run idempotency |
| Concurrency | TC-014.54 | Concurrent settings PUT: one wins, other 409 |
| Workflow | TC-014.55 | Display consistency across lifecycle (Draft→…→Completed) incl. BLOCKED and INFO_REQUIRED |
| Negative | TC-014.56 | NAC10, NAC11, NAC12, NAC15 |
| Frontend | TC-014.57 – 014.62 | Role-based dashboards render, nav guard, loading/empty/error/no-access states, filter URL state, overdue notice |
| Frontend a11y | TC-014.63 – 014.66 | axe checks, keyboard flow, `aria-sort`, live region |
| Frontend responsive | TC-014.67 – 014.68 | Desktop/tablet/narrow layouts |
| Frontend | TC-014.69 – 014.70 | Escalation form: null shown as "Not configured", no prefilled numbers, 409 handling |
| Performance input | TC-014.71 | Seed dataset generator produces scope-varied data; EXPLAIN uses indexes (no pass/fail time target asserted) |

## 24. Definition of Done

- All TASK-014.01 – 014.32 complete (TASK-014.18 only when TDD-014.12 is approved; otherwise flag-off stub verified).
- Every TC-014.xx green; scope-contract test covers all repository methods; no endpoint returns out-of-scope data.
- Gate 1 decisions recorded for TDD-014.01 – 014.14; any unresolved default listed in the Gate 1 record.
- No numeric escalation/performance default present in code, migrations, seeds or UI (grep check in CI).
- Structured logger only, no `console.log`; no hardcoded secrets; INT standards lint passes.
- Audit event ESCALATION_SETTING_UPDATED verified in SPEC-013 viewer; overdue event verified through SPEC-012 outbox.
- Frontend accessibility checks pass at the level chosen in TDD-014.14; loading/empty/error/no-access states verified on every page.
- Gate 2 code review approved; `status.md`, dashboard HTML, PR review records and `prompt_history.md` synchronised.

---

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-014.01 | What does "total employees" count (employment-status value set undefined; gap p)? | Count of `employee_profiles` with status Active, all-rows total in breakdown | Card/report accuracy |
| TDD-014.02 | Which statuses make up "pending approvals"? | Reporting Manager, Receiving Manager, Receiving Manager re-approval and IT Final Approval stages, with per-status breakdown | Card value |
| TDD-014.03 | Does "HR reviews" mean PENDING_HR_REVIEW only, or all HR-controlled stages? | PENDING_HR_REVIEW as value; HR Processing and Payroll Processing in breakdown | Card value |
| TDD-014.04 | Does "blocked tasks" count blocked transfer requests, blocked IT tasks or both? | Requests in BLOCKED as value, blocked IT tasks as secondary count | Card value |
| TDD-014.05 | Overdue clock rules: which stages are overdue-capable (incl. INFO_REQUIRED, BLOCKED), calendar vs business time, reset on clarification return, reassignment effect; **no thresholds are proposed** (BRD-OQ-10) | Calendar time from stage entry; INFO_REQUIRED/BLOCKED configurable but inactive; reassignment does not reset | Overdue detection |
| TDD-014.06 | Escalation recipients and cadence: who counts as recipient for ROLE rules (employee's HR, Reporting Manager), channel and mandatory/optional status of overdue notification, repeat reminders, multi-level escalation, flood suppression on activation | Single-level, once per episode, recipients configured per stage, Email + In-app, no suppression logic beyond one-notification-per-episode | SPEC-012 events, escalation behaviour |
| TDD-014.07 | HR visibility basis: employee's current location, target location, assigned HR, or union (BRD-013/016 say location/organisation scope) | Employee current location (HR assignment per BRD-029) ∪ own assignments | Data exposure |
| TDD-014.08 | Receiving Manager scope mapping to target department/team (gap c); "incoming transfer" definition | Assigned-task visibility only until mapping decided | RcvM worklist |
| TDD-014.09 | Exact IT minimum-information field list | Employee ID, name, from/to location, effective date, task status, reference | NFR-007, IT usability |
| TDD-014.10 | Per-role report policy and hidden fields; vacancy-capacity visibility for non-SA (gap j) | Matrix R-1 (data-driven `REPORT_POLICY`) | Restricted reporting |
| TDD-014.11 | Who is responsible user for Employee pending-action "respond to clarification" when raised by HR or during re-approval (gap k) | Employee, per BRD-034 default | Pending actions |
| TDD-014.12 | Is report export required, in what format, for which roles (BRD requires only audit export) | Not built; if approved: CSV, Super Admin only, audited | Scope of TASK-014.18 |
| TDD-014.13 | Completion-time: exclude Blocked/Info Required time? | Elapsed calendar time, no exclusions | Report meaning |
| TDD-014.14 | Accessibility target level and charting approach (NFR-008 "organisational standards") | WCAG 2.1 AA; tables + simple accessible bars, no charting library | UI effort |

## Out of Scope (this SPEC)

Per BRD Out of Scope: no advanced workforce planning or predictive vacancy forecasting; no HR-system/Payroll integration or synchronisation; no new payroll or identity engine; no Facilities/Admin role views; no historical data migration/backfill. Also outside this SPEC: performing any workflow action (owned by SPEC-006/007/008/009/010); notification templates and delivery (SPEC-012); audit-log viewing/export (SPEC-013); document access (SPEC-011); vacancy capacity rules (SPEC-005); numeric performance targets (SPEC-015, BRD-038); automatic escalation actions (auto-reassign, auto-cancel, auto-approve) — escalation is visibility and notification only. Nothing in this SPEC introduces any of the above, any invented threshold, or any role/eligibility rule.
