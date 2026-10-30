# SPEC-010 — Transfer Exception & Administrative Control Workflows

## Feature ID
transfer-exception-controls

## Status
Changes Requested at Gate 1 (2026-10-28) — reviewer Shamik Bhattacharya; see `.ai-context/pr_reviews/SPEC-010-transfer-exception-controls-20261028-153226.md`. Spec must be updated and re-submitted for Gate 1; plan, tasks, tests and code remain blocked

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 1 (Spec Peer Review) | Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) | 2026-10-28 | Changes Requested | `.ai-context/pr_reviews/SPEC-010-transfer-exception-controls-20261028-153226.md` |
| Gate 2 (Code Review) | — | — | Not started | — |

## Intent & Business Goals

Give the Internal Transfer Digital Journey a controlled, fully audited way to stop, pause, resume, re-own or close a transfer request outside the happy path, without ever bypassing a mandatory approval:

- **Withdraw** — the Employee closes their own request up to HR approval `[BRD-027, BRD-OQ-12]`.
- **Block / Resume** — Super Admin, HR and IT temporarily freeze and later continue a request inside their own stages `[BRD-027, BRD-OQ-13, BRD-OQ-18]`.
- **Cancel** — Super Admin (any active request) and in-scope HR (HR-controlled stages only) permanently close an active request `[BRD-027, BRD-OQ-13, BRD-OQ-18]`.
- **Reassign** — Super Admin only changes the responsible assignee of a pending task, status unchanged `[BRD-035]`.
- **Final-state protection and reapplication** — Completed, Rejected, Withdrawn and Cancelled requests are immutable and never reopened; a new application is always a new request with a new reference `[BRD-033, BRD-030]`.
- A **Super Admin transfer-administration UI** exposes these actions with confirmation dialogs `[BRD-002, BRD-010]`.

Outcome: every exception action has exactly one authoritative backend policy (action x status x role x scope), a single-transaction implementation that always writes workflow history + audit + notification outbox rows, correct vacancy-reservation release/retention, and negative tests proving cross-role refusals.

## User Roles & Actors

| Role | Participation in this SPEC |
|---|---|
| Super Admin | Block (any non-final), Resume (any authorised Blocked), Cancel (any active, incl. Blocked), Reassign (sole owner of this action), administration UI |
| Employee | Withdraw own request only (until HR approves); "Apply again" after a final status; cannot Block/Cancel/Resume/Reassign |
| Reporting Manager / Receiving Manager | No exception actions; may be the displaced or new assignee of a Reassign; are notified |
| HR | Block/Resume/Cancel within HR-controlled stages and scope; cannot Reassign; cannot touch IT-controlled blocks |
| IT | Block/Resume within IT-controlled stages and scope; cannot Cancel or Reassign; cannot touch HR-controlled blocks |

---

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-010 |
| Title | Transfer Exception & Administrative Control Workflows |
| Purpose | Specify Withdraw, Block, Resume, Cancel, Super-Admin Reassign, final-state protection, reapplication guard rules and the Super Admin administration UI for transfer exceptions |
| Business objective | Reduce manual follow-up and give clear ownership and exception handling `[BRD Objective]`, while keeping every intervention controlled, reasoned and auditable `[BRD-022, BRD-037]` |
| Version | 0.1 (Draft) |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer per roster | Project Manager / Product Owner |
| Task prefix | TASK-010.MM |
| Acceptance IDs | SPEC-010.ACmm / SPEC-010.NACmm |
| Test IDs | TC-010.mm |

## 2. Why This SPEC Exists

The BRD-027 transition matrix, BRD-OQ-12/13/18 and BRD-035 define a dense set of role-, stage- and scope-dependent rules for the exceptional paths of a transfer. These rules cut across SPEC-007 (state machine), SPEC-005 (vacancy reservation), SPEC-009 (Payroll/IT tasks), SPEC-012 (notifications) and SPEC-013 (audit). Without one owning spec they would be scattered and inconsistent. SPEC-010 registers the exception handlers with the `WorkflowEngine` (SPEC-007), owns the stored pre-block status, owns the full action x status x role authorisation matrix for these actions, and owns the no-reopen / final-state / reapplication guard rules. It also owns the Super Admin intervention UI slice of BRD-010.

## 3. BRD Traceability

### 3.1 BRD IDs

| BRD ID | Slice owned by SPEC-010 | Coverage |
|---|---|---|
| BRD-010 | "Reassign workflow tasks (BRD-035) or administratively intervene in transfer workflows" — intervention slice only (Block/Resume/Cancel/Reassign Super Admin capability + UI) | PARTIAL (intervention slice) |
| BRD-027 | Exception rows: Withdraw rows; Block / Resume / Cancel / Reassign rows (incl. Refused rows); Backend enforcement for these actions; HR-/IT-controlled stage definitions as applied; Draft exclusion | PARTIAL (exception rows; Submit=SPEC-006, HR rows=SPEC-008, Payroll/IT rows=SPEC-009, engine=SPEC-007) |
| BRD-028 | Vacancy release / retention rules triggered by Withdraw, Cancel, Block, Resume (call `VacancyService`); manual release endpoint is **SPEC-005 (reference only)** | PARTIAL (release/retain triggers) |
| BRD-033 | Reapplication-as-new-request guard rules and no-reopen enforcement for Rejected (and Withdrawn/Cancelled/Completed); rejection decision itself is SPEC-007/008 | PARTIAL (guard + no-reopen) |
| BRD-035 | Administrative Reassignment | FULL |
| BRD-030 | Re-application after closed statuses (guard rules only; creation path SPEC-006) | PARTIAL |
| BRD-019 | Blocked and Cancelled statuses behaviour (status model owned by SPEC-007) | PARTIAL |
| BRD-022 / BRD-037 | Audit events emitted by this SPEC (consolidation SPEC-013) | PARTIAL |
| BRD-036 | Notification events for blocked/resumed/cancelled/withdrawn/reassigned (templates SPEC-012) | PARTIAL |
| BRD-026 | Application of Authenticated User -> Role -> Org Scope -> Resource -> Action to exception actions | PARTIAL |
| BRD-002 | Confirmation dialogs for sensitive actions (reassignment) | PARTIAL |

### 3.2 NFR IDs

| NFR | Slice | Coverage |
|---|---|---|
| NFR-002 | Least privilege and API-level authorisation of exception actions | PARTIAL |
| NFR-005 | Append-only audit of interventions; security-event audit of refusals | PARTIAL |
| NFR-006 | Idempotent retry of notification/outbox for exception events; no duplicate transitions | PARTIAL |
| NFR-008 | Accessible confirmation dialogs | PARTIAL |

### 3.3 BRD-OQ

| OQ | Status | Implemented here |
|---|---|---|
| BRD-OQ-12 | Resolved | Withdraw stages, mandatory reason, final, not reopenable, new request to reapply |
| BRD-OQ-13 | Resolved | Block/Resume/Cancel/Reassign actors, results, effects (Reassign superseded by BRD-035) |
| BRD-OQ-18 | Resolved | HR-/IT-controlled stages; HR cancel limit; failed resume keeps Blocked; Draft excluded; cross-role resume; follow-up on HR cancelling Blocked |
| BRD-OQ-15 | Resolved | Consumed: resume revalidation (a) and vacancy-status rules (b) via SPEC-005 `validateForResume` |
| BRD-OQ-14(d) | Resolved | Consumed: `INVALID_WORKFLOW_TRANSITION` response shape |
| BRD-OQ-16(d), BRD-OQ-17 | Resolved | Consumed: same vacancy re-application allowed; one-active-request rule |

### 3.4 Business rules covered

Business Rules bullets: "Block, Resume, Cancel and Reassign (BRD-027)", "Administrative reassignment (BRD-035)", "The employee can withdraw the transfer request only until HR approves it", "Workflow status changes follow the controlled transition model", "Rejection ... cannot be reopened or resubmitted under the same reference" (guard slice), "One Employee = maximum one active transfer request" (reapplication slice). All FULL for the exception slice.

### 3.5 BRD Acceptance Criteria bullets covered

| BRD Acceptance Criteria bullet | Coverage |
|---|---|
| "Rejection requires a reason, ...; withdrawal (until HR approval, reason mandatory, final and not reopenable) releases any exceptional reservation and cancels pending downstream tasks." | PARTIAL (withdrawal clause) |
| "Block/Resume/Cancel (BRD-027): only Super Admin, HR ..., IT ... may Block ..." | FULL |
| "Administrative reassignment (BRD-035): a reassignment by anyone other than the Super Admin ..." | FULL |
| "Resuming a Blocked request revalidates the vacancy and reservation ..." | PARTIAL (orchestration; engine in SPEC-005) |
| "Rejected, withdrawn and cancelled requests release their reservation ...; a Blocked request retains it" | PARTIAL (withdrawn/cancelled/blocked) |
| "Rejection & resubmission (BRD-033): ... Reopening, editing or resubmitting a Rejected request under the same reference is refused" | PARTIAL (no-reopen guard) |
| "One-active-request rule (BRD-030): ... After Completed, Rejected, Withdrawn or Cancelled a new request is accepted ..." | PARTIAL (guard rules) |
| "Every status change follows the BRD-027 transition matrix ... invalid transition returns 403 INVALID_WORKFLOW_TRANSITION" | PARTIAL (exception actions) |
| "Every material configuration, security and workflow action creates the agreed audit record." | PARTIAL |
| UAT: "reassignment" scenario | PARTIAL (data/behaviour; scenarios SPEC-016) |

### 3.6 Negative scenarios (BRD-039 rows)

| BRD-039 row | Coverage |
|---|---|
| Workflow: "Invalid workflow transitions are rejected (BRD-027)" | PARTIAL (exception actions: NAC-01..NAC-24) |
| Workflow: "A Completed transfer cannot be modified through the normal workflow" | FULL for exception actions and edit paths (NAC-18..NAC-21); other edit paths verified by SPEC-006/008 |
| Workflow: "A user cannot approve a transfer request outside their assigned role/scope" | PARTIAL (displaced assignee after Reassign, NAC-27) |
| Vacancy: "Rejected and Withdrawn transfer requests release their reserved vacancy/capacity" | PARTIAL (Withdrawn, plus Cancelled) |
| Security: "Direct API access cannot bypass backend role, organisation-scope, resource or action-level authorization" | PARTIAL (exception endpoints) |
| Security: "An Employee cannot access another Employee's transfer request" | PARTIAL (Withdraw on another's request) |

## 4. Dependencies

| Dependency | Needed for |
|---|---|
| SPEC-001 | `AuditService.record`, `NotificationService.enqueue`, `withTransaction`, error classes, request-id, logger, response envelope, validation middleware, migration conventions, UI kit/dialog primitives |
| SPEC-002 | `AuthorizationService.authorize`, `ScopeResolver`, JWT user context (`userId`, `role`), 401/403 handling |
| SPEC-003 / SPEC-004 | Org scope mappings (HR location/organisation, IT location, Receiving Manager scope), employee profiles, active users list for reassignment candidates |
| SPEC-005 | `VacancyService.release`, `VacancyService.validateForResume`, reservation state; manual-release endpoint (reference only) |
| SPEC-006 | `transfer_requests`, creation path for re-application, eligibility revalidation, one-active partial unique index |
| SPEC-007 | `WorkflowEngine.transition`, transition registry, `transfer_workflow_history`, `transfer_task_assignments`, `INVALID_WORKFLOW_TRANSITION` handling, status enum |
| SPEC-008 / SPEC-009 | Open HR tasks/reservations; `payroll_activities`, `it_tasks` cancel/reassign hooks |
| SPEC-012 / SPEC-013 | Templates/delivery; audit visibility |

## 5. Enables

| Consumer | What it gets |
|---|---|
| SPEC-014 | Blocked/Cancelled/Withdrawn counts, "blocked tasks" dashboard card (`BRD-002`), exception history for worklists |
| SPEC-016 | Cross-role restriction scenarios, BRD-039 workflow rows, UAT "reassignment" scenario |
| SPEC-006 | `ReapplicationPolicy` guard used by the creation path |
| SPEC-015 | Evidence that no external system participates in these controls |

## 6. Roles & Scope

| Role | Scope rule used by this SPEC |
|---|---|
| SUPER_ADMIN | All transfers, all stages, all organisation scope `[BRD-010]` |
| EMPLOYEE | Own requests only (`transfer_requests.employee_id` = actor's employee profile) |
| REPORTING_MANAGER / RECEIVING_MANAGER | No exception actions; read of own historical tasks via history after being displaced |
| HR | `ScopeResolver.hrCoversTransfer(user, transfer)` — HR location/organisation scope (SPEC-003/004) |
| IT | `ScopeResolver.itCoversTransfer(user, transfer)` — IT location scope / assigned IT tasks (SPEC-003/004/009) |

Stage-control sets `[BRD-027, BRD-OQ-18(a)]`:

| Set | Statuses |
|---|---|
| HR_CONTROLLED | `PENDING_HR_REVIEW`, `HR_PROCESSING`, `PAYROLL_PROCESSING` |
| IT_CONTROLLED | `PENDING_IT_ACTION`, `PENDING_IT_FINAL_APPROVAL` |
| NEITHER (Super Admin only for Block/Cancel/Resume) | `PENDING_REPORTING_MANAGER_APPROVAL`, `PENDING_RECEIVING_MANAGER_APPROVAL`, `INFO_REQUIRED`, `PENDING_RECEIVING_MANAGER_REAPPROVAL` `[DERIVED from BRD-027 — HR/IT lists contain only the sets above]` |
| FINAL | `COMPLETED`, `REJECTED`, `WITHDRAWN`, `CANCELLED` |
| ACTIVE | all except `DRAFT` and FINAL (so `BLOCKED` and `INFO_REQUIRED` are active) `[BRD-030]` |

---

## 7. Functional Requirements

### 7.1 Withdraw

- **FR-010.01** `[BRD-027, BRD-OQ-12]` Only the **Employee who owns the request** may Withdraw. No other role (including Super Admin, HR) can withdraw; Super Admin uses Cancel.
- **FR-010.02** `[BRD-027, BRD-OQ-12]` Withdraw is permitted only from `PENDING_REPORTING_MANAGER_APPROVAL`, `PENDING_RECEIVING_MANAGER_APPROVAL` (when that stage exists), `INFO_REQUIRED`, `PENDING_HR_REVIEW`. From every other status it is refused `INVALID_WORKFLOW_TRANSITION`, specifically from `HR_PROCESSING` onward (HR has approved) `[BRD-OQ-12]`.
- **FR-010.03** `[BRD-027]` A withdrawal **reason is mandatory**; blank/whitespace-only is refused with 400 `VALIDATION_ERROR`.
- **FR-010.04** `[BRD-027]` Result: status `WITHDRAWN` (final). The request cannot be reopened; no further approval, Payroll or IT processing continues.
- **FR-010.05** `[BRD-027, BRD-028]` Any reservation existing "through an exceptional workflow condition" is released immediately (`VacancyService.release`, idempotent no-op if none) in the same transaction.
- **FR-010.06** `[BRD-027]` Pending downstream tasks are cancelled where applicable: open `transfer_task_assignments` rows -> `CANCELLED`; open clarification (if `INFO_REQUIRED`) closed; any `payroll_activities` / `it_tasks` rows (should not normally exist pre-HR-approval) -> cancelled via SPEC-009 hook.
- **FR-010.07** `[BRD-027]` The **pending approver is notified** (pending owner of the stage; in `INFO_REQUIRED` the requesting approver; in `PENDING_HR_REVIEW` HR). Employee confirmation notification is `[PROPOSED]` (TDD-010.09).
- **FR-010.08** `[BRD-027]` Audit records: Transfer Request ID, employee, previous status, withdrawal reason, withdrawn by, withdrawal date/time.
- **FR-010.09** `[BRD-027, BRD-030]` To apply again the Employee creates a new request (see 7.6); the withdrawn request stays in history/audit.

### 7.2 Block

- **FR-010.10** `[BRD-027, BRD-OQ-13, BRD-OQ-18]` Who may Block: **Super Admin** at any non-final, non-Draft, non-Blocked status; **HR** in HR_CONTROLLED stages within HR scope; **IT** in IT_CONTROLLED stages within IT scope. Reporting Manager, Receiving Manager and Employee cannot (refused).
- **FR-010.11** `[BRD-027]` Reason mandatory.
- **FR-010.12** `[BRD-027]` Result `Current Active Status -> BLOCKED`; the system stores the status from which the request was blocked (`transfer_requests.blocked_from_status`) plus `blocked_by_user_id`, `blocked_by_role`, `blocked_at`, `block_reason`.
- **FR-010.13** `[BRD-027]` While BLOCKED: no normal approval/processing action is permitted (every registered action except `RESUME`, `CANCEL`, `REASSIGN` and read is refused `INVALID_WORKFLOW_TRANSITION`); the request remains **active** (still counts for the one-active-request rule `[BRD-030]`); the vacancy reservation is **retained** `[BRD-028]`; open tasks stay open but frozen.
- **FR-010.14** `[BRD-027, BRD-036]` Relevant stakeholders notified (event "Task blocked": Employee and relevant assigned users, including the blocking reason) `[BRD-036]`; recipients set is TDD-010.04.
- **FR-010.15** `[BRD-027]` Action and reason are audited.
- **FR-010.16** `[DERIVED from BRD-027 "Any active / non-final status"]` A request that is already BLOCKED cannot be blocked again.
- **FR-010.17** `[DERIVED from BRD-027 + BRD-OQ-18(a)]` HR and IT cannot Block from `INFO_REQUIRED`, `PENDING_REPORTING_MANAGER_APPROVAL`, `PENDING_RECEIVING_MANAGER_APPROVAL`, `PENDING_RECEIVING_MANAGER_REAPPROVAL` (not in their controlled lists); only Super Admin.

### 7.3 Resume

- **FR-010.18** `[BRD-027, BRD-OQ-18(e)]` Who may Resume: **Super Admin** any authorised Blocked request (including HR- or IT-blocked); **HR** only when `blocked_from_status` is HR_CONTROLLED and within HR scope; **IT** only when `blocked_from_status` is IT_CONTROLLED and within IT scope. **No cross-resume**: HR cannot resume an IT-blocked request, IT cannot resume an HR-blocked request. The controlling stage is the stored `blocked_from_status` (see TDD-010.01 for requests blocked by Super Admin).
- **FR-010.19** `[BRD-027]` Resume `remarks` are recorded (BRD says "Remarks recorded"; whether mandatory: `[PROPOSED]` optional field but, when supplied, stored; BRD marks reason not required). The action, user, date/time and remarks are audited.
- **FR-010.20** `[BRD-027, BRD-028, BRD-OQ-15(a), BRD-OQ-18(c)]` Before resuming, the backend revalidates business conditions inside the same transaction: vacancy via `VacancyService.validateForResume` (vacancy exists and not deleted; reservation belongs to the same request and is active/valid; reserved+allocated <= capacity; employee/vacancy match approved details; no conflicting final allocation); plus the additional checks listed in TDD-010.05.
- **FR-010.21** `[BRD-028, BRD-OQ-15(b)]` Vacancy status effects: **Closed** vacancy => resume refused; **On Hold** => stays Blocked (resume refused) until reopened or cancelled/released; **Full** => resume allowed on the existing reservation. Reservation is never auto-released by a status change.
- **FR-010.22** `[BRD-OQ-15(a), BRD-OQ-18(c)]` On revalidation failure the request **remains BLOCKED**, the response lists failing checks (409 `RESUME_REVALIDATION_FAILED` `[PROPOSED]`), nothing else changes, the attempt is audited (`TRANSFER_RESUME_REVALIDATION_FAILED`) in a separate committed audit write. HR/Super Admin resolve the issue (reopen vacancy, change vacancy per SPEC-005/008, Reassign, Cancel).
- **FR-010.23** `[BRD-027]` On success the request returns to the stored `blocked_from_status` (e.g. `PAYROLL_PROCESSING -> BLOCKED -> PAYROLL_PROCESSING`), blocked columns are cleared, reservation continues, relevant stakeholders are notified.
- **FR-010.24** `[BRD-OQ-18(e)]` Resume is refused on any status other than `BLOCKED` (`INVALID_WORKFLOW_TRANSITION`).

### 7.4 Cancel

- **FR-010.25** `[BRD-027, BRD-OQ-13, BRD-OQ-18(b)]` Who may Cancel: **Super Admin** any active request (including Blocked at any stage); **HR** within scope only in `PENDING_HR_REVIEW`, `HR_PROCESSING`, `PAYROLL_PROCESSING`; **HR** may also Cancel a `BLOCKED` request only if `blocked_from_status` is HR_CONTROLLED (including blocks made by HR itself) and within scope; **HR cannot Cancel** a Blocked request originating from an IT-controlled stage (refused and audited as a security event) `[BRD-027 row "Refused"]`. IT, Reporting Manager, Receiving Manager and Employee cannot Cancel.
- **FR-010.26** `[BRD-027]` Reason mandatory. Result `CANCELLED` (final, not reopenable).
- **FR-010.27** `[BRD-027, BRD-028]` Any active reservation is released (audited via SPEC-005 release event); pending Payroll/IT tasks cancelled where applicable; Employee and relevant stakeholders notified; cancellation audited. The same outcome applies when a Blocked request is cancelled.
- **FR-010.28** `[BRD-027]` Completed, Rejected, Withdrawn or already Cancelled requests cannot be cancelled (`INVALID_WORKFLOW_TRANSITION`). `DRAFT` cannot be cancelled `[BRD-OQ-18(d)]` (the Employee edits/discards the Draft under SPEC-006).
- **FR-010.29** `[BRD-027]` Employee-initiated stop is Withdraw, not Cancel; the Cancel endpoint refuses the Employee role.

### 7.5 Reassign (Super Admin only)

- **FR-010.30** `[BRD-035]` Only **Super Admin** may reassign. HR, IT, Reporting Manager, Receiving Manager and Employee are refused 403 and the attempt is audited as a security event. The earlier BRD-027 allowance for HR is withdrawn.
- **FR-010.31** `[BRD-035]` Reassignable tasks: pending tasks of the **Reporting Manager, Receiving Manager (incl. re-approval), HR and IT** (mapping in 11.5). Not for `DRAFT` or FINAL statuses `[BRD-035 summary]`. Applicability to `INFO_REQUIRED` / `BLOCKED` is TDD-010.03.
- **FR-010.32** `[BRD-035]` Reason mandatory; the new assignee must hold the required **role AND organisation/location scope** for the task (`ScopeResolver`), be an Active user, and differ from the current assignee.
- **FR-010.33** `[BRD-035]` Result: workflow status **unchanged**; only the responsible assignee changes; the request continues from the same stage. No re-approval is triggered; completed approvals stay valid; no reservation change.
- **FR-010.34** `[BRD-035]` The previous assignee retains **read visibility through workflow/audit history** but loses permission to act on the task until it is reassigned back; the new assignee is notified.
- **FR-010.35** `[BRD-035]` Audit: previous assignee, new assignee, reassigned by, reason, date/time, affected workflow stage.
- **FR-010.36** `[BRD-035]` Reassignment cannot bypass mandatory approvals, IT Final Approval, role permissions, organisation scope or security controls (e.g. IT Final Approval can only be given by an IT user with scope; Reassign never marks anything complete).

### 7.6 Final-state protection, no reopen, reapplication guards

- **FR-010.37** `[BRD-033, BRD-039, BRD-027]` No transition registered in the engine has a FINAL status as its source. Any attempt to edit, approve, reject, clarify, resubmit, withdraw, block, resume, cancel, reassign, change HR metadata or change the effective date of a FINAL request returns 403 `INVALID_WORKFLOW_TRANSITION`, leaves data unchanged, and is audited as a security event. There is no "reopen" route, action or admin override `[BRD-033, BRD-027]`.
- **FR-010.38** `[PROPOSED]` Defence in depth: DB trigger rejects any UPDATE that moves a `transfer_requests` row out of a FINAL status or modifies business columns of a FINAL row (see 10.4).
- **FR-010.39** `[BRD-030, BRD-033, BRD-OQ-12, BRD-OQ-13]` Reapplication after REJECTED / WITHDRAWN / CANCELLED / COMPLETED is a **new request** (SPEC-006 creation path). `ReapplicationPolicy` (owned here, invoked by SPEC-006) enforces: (1) new Transfer Request ID and reference, never the old ones; (2) eligibility revalidated (BRD-029) and vacancy availability rechecked (BRD-028) — executed by SPEC-006/005, asserted here by tests; (3) full workflow restarts at Draft/Submit; (4) no approvals, clarifications, task assignments, documents or reservations copied from the old request; (5) previous request untouched (history/audit/visibility remain); (6) the **same vacancy may be requested again** subject to normal rules `[BRD-OQ-16(d), BRD-030]`; (7) any request body field that attempts to reuse an old ID (`reopenOf`, `transferId`, `status`, `approvals`) is rejected 400; (8) the source request, if referenced, must be FINAL and owned by the same employee.
- **FR-010.40** `[BRD-030]` No cool-down after COMPLETED; the guard adds none.
- **FR-010.41** `[DERIVED from BRD-030]` The one-active-request rule still governs: if the employee already has an active request the guard defers to SPEC-006's 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`.

### 7.7 Cross-cutting

- **FR-010.42** `[BRD-026]` Every exception endpoint validates Authenticated User -> Role -> Organisation Scope -> Resource -> Action (current stage) in that order; 401 for missing/invalid/expired authentication.
- **FR-010.43** `[BRD-027]` Role/scope/status refusals for an authenticated user return 403 `INVALID_WORKFLOW_TRANSITION` with message "The requested action is not permitted for the current transfer status.", status unchanged, no downstream effect, security audit event with user, role, Transfer Request ID, current status, attempted action, date/time, rejection reason.
- **FR-010.44** `[BRD-026, BRD-039]` A user who cannot see the transfer at all (out of org scope; Employee on another's request) receives 403 `FORBIDDEN` without restricted data `[PROPOSED]` code.
- **FR-010.45** `[BRD-027, BRD-036]` State change, workflow history, audit and notification outbox rows commit in one transaction; notification delivery is asynchronous and its failure never rolls back the action `[BRD-036]`.
- **FR-010.46** `[PROPOSED]` `GET /api/v1/transfers/:transferId/exception-actions/allowed` returns the actions the caller may currently perform, computed by the same `ExceptionActionPolicy`, for UI rendering only (UI is never the authority `[BRD-026]`).
- **FR-010.47** `[BRD-002, BRD-010]` Super Admin Transfers module offers Block, Resume, Cancel, Reassign (and a view of exception history) behind confirmation dialogs with mandatory reason; HR/IT worklists show only their permitted actions; Employee detail shows Withdraw and "Apply again".
- **FR-010.48** `[BRD-022]` Manual vacancy-reservation release is **not** in this SPEC (SPEC-005 endpoint); the Super Admin transfer detail UI may deep-link to it.

---

## 8. Internal Implementation Plan / Tasks

| Task | Title | Layer | Description | Inputs / Outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-010.01 | Migration: exception columns on `transfer_requests` | DB | Add `blocked_from_status`, `blocked_by_user_id`, `blocked_by_role`, `blocked_at`, `block_reason`, `closed_by_user_id`, `closure_reason`, `reapplied_from_transfer_request_id`; CHECK constraints (10.1) | in: SPEC-006 table; out: migration + model fields | SPEC-006, SPEC-007 enum | BRD-027, BRD-033 |
| TASK-010.02 | Migration: `transfer_exception_actions` | DB | Create table, indexes, FKs (10.2) | out: table + model | TASK-010.01 | BRD-022, BRD-027 |
| TASK-010.03 | Migration: `transfer_task_reassignments` | DB | Create table, indexes (10.3) | out: table + model | SPEC-007 `transfer_task_assignments` | BRD-035 |
| TASK-010.04 | Migration: final-state immutability trigger | DB | `trg_transfer_requests_final_guard` (10.4) | out: trigger + test fixture | TASK-010.01 | BRD-033, BRD-039 |
| TASK-010.05 | `ExceptionActionPolicy` | BE | Pure policy evaluating action x status x role x scope x blocked_from (sections 15 matrix); returns `{allowed, httpStatus, code, reasonCode}` | in: actor ctx, transfer snapshot, action; out: decision | SPEC-002 ScopeResolver | BRD-026, BRD-027, BRD-OQ-18 |
| TASK-010.06 | DTOs, constants, validators | BE | Joi schemas for withdraw/block/resume/cancel/reassign; status sets (`HR_CONTROLLED`, `IT_CONTROLLED`, `FINAL`, `ACTIVE`); error codes | out: `validations/`, `constants/` | SPEC-001 validation middleware | BRD-027, BRD-035 |
| TASK-010.07 | `TerminalTransitionEffects` | BE | One service used by Withdraw and Cancel (reusable by Reject): release reservation via `VacancyService.release`, cancel open task assignments/clarifications, call SPEC-009 `PayrollService.cancelOpenActivity` + `ItTaskService.cancelOpenTasks` [RECONCILED names], enqueue notifications | in: transfer, terminal status, reason, actor, trx; out: effect summary | SPEC-005, SPEC-007, SPEC-009 | BRD-027, BRD-028 |
| TASK-010.08 | Withdraw handler + endpoint | BE | Register `WITHDRAW` transition; controller/service/repository; audit + outbox | `POST /transfers/:id/withdraw` | TASK-010.05-07 | BRD-027, BRD-OQ-12 |
| TASK-010.09 | Block handler + endpoint | BE | Register `BLOCK`; store `blocked_from_status`; blocked guard | `POST /transfers/:id/block` | TASK-010.05-07 | BRD-027, BRD-OQ-13 |
| TASK-010.10 | Resume handler, revalidation orchestrator + endpoint | BE | Register `RESUME`; call `validateForResume`; failure path keeps Blocked, separate failure audit | `POST /transfers/:id/resume` | TASK-010.09, SPEC-005 | BRD-027, BRD-028, BRD-OQ-15, BRD-OQ-18 |
| TASK-010.11 | Cancel handler + endpoint | BE | Register `CANCEL` (active + blocked sources); effects; HR/IT-blocked rule | `POST /transfers/:id/cancel` | TASK-010.05-07 | BRD-027, BRD-OQ-18 |
| TASK-010.12 | Reassign service, candidates and tasks endpoints | BE | Register `REASSIGN`; validate role+scope; write `transfer_task_reassignments`; update `transfer_task_assignments` assignee (and SPEC-009 IT task assignee); displaced-assignee deny | `POST .../reassign`, `GET .../reassignable-tasks`, `GET .../reassignment-candidates` | TASK-010.03, 05 | BRD-035 |
| TASK-010.13 | Blocked / final-state guards in engine | BE | Register guard predicates: BLOCKED allows only RESUME/CANCEL/REASSIGN; FINAL allows nothing; test registry completeness | in: SPEC-007 registry; out: guard module | SPEC-007 | BRD-027, BRD-033, BRD-039 |
| TASK-010.14 | Denial security auditing | BE | `ExceptionDenialRecorder` writes security audit events outside the failed transaction | out: `SECURITY_*` audit events | SPEC-001 AuditService | BRD-026, BRD-027, BRD-035 |
| TASK-010.15 | Notification event wiring | BE | Enqueue `TRANSFER_WITHDRAWN`, `TRANSFER_BLOCKED`, `TRANSFER_RESUMED`, `TRANSFER_CANCELLED`, `TASK_REASSIGNED`; recipient resolver | outbox rows | SPEC-001 outbox, SPEC-012 | BRD-036, BRD-027, BRD-035 |
| TASK-010.16 | Allowed-actions and history endpoints | BE | `GET .../exception-actions/allowed`, `GET .../exception-actions` | read APIs | TASK-010.05 | BRD-026, BRD-037 |
| TASK-010.17 | `ReapplicationPolicy` | BE | Guard consumed by SPEC-006 creation path (7.6) | `assertMayReapply(...)` | SPEC-006 | BRD-030, BRD-033 |
| TASK-010.18 | OpenAPI docs and error catalogue | BE | Document 8 endpoints + codes | `docs/paths/transfers-exceptions.yaml` | TASK-010.08-16 | BRD-026 |
| TASK-010.19 | FE API client, types, hooks | FE | Typed client + React hooks per endpoint, error mapping | `frontend/src/lib/api/transferExceptions.ts` | TASK-010.08-16 | BRD-002 |
| TASK-010.20 | FE dialog components | FE | Withdraw/Block/Resume/Cancel/Reassign dialogs, `ReasonField`, `BlockedBanner` | components (13) | TASK-010.19, SPEC-001 UI kit | BRD-002, NFR-008 |
| TASK-010.21 | FE Super Admin Transfers module actions | FE | Action menu on list and detail, exception history panel | admin pages | TASK-010.20, SPEC-014 list | BRD-010, BRD-002 |
| TASK-010.22 | FE Employee Withdraw and Apply again | FE | Withdraw button on own request; final-state read-only; Apply again link | employee pages | TASK-010.20, SPEC-006 | BRD-027, BRD-033 |
| TASK-010.23 | FE HR / IT worklist actions | FE | Block/Resume/Cancel in HR/IT worklists limited to allowed actions | worklist integration | TASK-010.20, SPEC-014 | BRD-027 |
| TASK-010.24 | QA: policy matrix unit tests | QA | Exhaustive 15 statuses x 6 roles x 5 actions (+blocked_from, scope) | `tests/backend/transfer-exceptions/policy.spec.ts` | TASK-010.05 | BRD-027 |
| TASK-010.25 | QA: Withdraw/Cancel effects integration | QA | Reservation release, task cancel, notifications, audit | integration tests | TASK-010.07-08, 11 | BRD-027, BRD-028 |
| TASK-010.26 | QA: Block/Resume integration | QA | Stored status, frozen actions, revalidation outcomes | integration tests | TASK-010.09-10 | BRD-OQ-15, BRD-OQ-18 |
| TASK-010.27 | QA: Reassign integration | QA | Role+scope validation, displaced assignee, audit, notification | integration tests | TASK-010.12 | BRD-035 |
| TASK-010.28 | QA: concurrency tests | QA | Withdraw vs approve, double cancel, resume vs vacancy hold | concurrency tests | TASK-010.08-12 | BRD-038 |
| TASK-010.29 | QA: security / cross-role API tests | QA | Direct API restriction matrix, 401/403 codes, security audit | API tests | all BE | BRD-026, BRD-039 |
| TASK-010.30 | QA: final-state and reapplication tests | QA | Immutability, trigger, no-reopen, new-ID guard | tests | TASK-010.04, 13, 17 | BRD-033, BRD-030 |
| TASK-010.31 | QA: frontend tests | QA | Dialog validation, a11y, role rendering | `tests/frontend/transfer-exceptions/` | TASK-010.19-23 | BRD-002, NFR-008 |

Ordering: 01 -> 02 -> 03 -> 04 -> 06 -> 05 -> 07 -> 13 -> 08 -> 09 -> 10 -> 11 -> 12 -> 14 -> 15 -> 16 -> 17 -> 18 -> 19..23 -> QA tasks (written test-first per TDD alongside their BE tasks).

## 9. Business Rules

| # | Rule | Tag |
|---|---|---|
| BR-010.01 | Exception actions apply only to submitted requests; DRAFT excluded from Block, Resume, Cancel, Reassign (and Withdraw is not in its source list) | `[BRD-OQ-18(d)]` |
| BR-010.02 | None of the four admin actions bypasses a mandatory Reporting Manager, Receiving Manager, HR, Payroll or IT Final Approval requirement | `[BRD-027]` |
| BR-010.03 | Block, Cancel, Reassign and Withdraw require a mandatory reason; Resume records remarks | `[BRD-027, BRD-035, BRD-OQ-12]` |
| BR-010.04 | HR may act only in HR-controlled stages; IT only in IT-controlled stages; each within scope | `[BRD-OQ-18(a)]` |
| BR-010.05 | HR-blocked and IT-blocked requests are not cross-resumable; HR cannot cancel an IT-blocked request | `[BRD-OQ-18(e), BRD-027]` |
| BR-010.06 | Blocked retains reservation; Withdraw/Cancel release it; Rejected release is SPEC-007/008 | `[BRD-028]` |
| BR-010.07 | Failed resume revalidation keeps Blocked | `[BRD-OQ-15(a), BRD-OQ-18(c)]` |
| BR-010.08 | Closed vacancy blocks resume; On Hold keeps Blocked; Full allows resume on existing reservation | `[BRD-028, BRD-OQ-15(b)]` |
| BR-010.09 | Withdrawn, Cancelled (and Rejected, Completed) are final, never reopened | `[BRD-027, BRD-033]` |
| BR-010.10 | Reassignment: status unchanged, no re-approval, completed approvals stay valid, same stage | `[BRD-035]` |
| BR-010.11 | Previous assignee keeps read visibility, loses act permission until reassigned back | `[BRD-035]` |
| BR-010.12 | New request after a closed one: new ID, revalidation, no approvals reused, previous kept; same vacancy allowed | `[BRD-030, BRD-033, BRD-OQ-16(d)]` |
| BR-010.13 | Notification failure never fails/rolls back the action | `[BRD-036]` |
| BR-010.14 | Employee cancellation is only Withdraw; Cancel is administrative | `[BRD-027]` |
| BR-010.15 | Super Admin may Block/Cancel in any non-final stage including stages HR/IT cannot touch | `[BRD-027]` |
| BR-010.16 | A reassigned-away HR/IT user cannot use Block/Resume/Cancel on that task either | `[DERIVED from BRD-035]` TDD-010.13 |

## 10. Data Model & Database

All names `[PROPOSED]`; conventions of SPEC-001 (UUID PKs, `created_at`/`updated_at`, snake_case, migrations in `backend/src/migrations/`).

### 10.1 `transfer_requests` — columns added by this SPEC (table owned by SPEC-006)

| Column | Type | Null | Notes |
|---|---|---|---|
| blocked_from_status | varchar(50) | Y | Status code the request was blocked from; NOT NULL iff `status = 'BLOCKED'` |
| blocked_by_user_id | uuid FK users | Y | Actor of the active block |
| blocked_by_role | varchar(30) | Y | Role enum at time of block |
| blocked_at | timestamptz | Y | |
| block_reason | text | Y | |
| ~~closed_at~~ | — | — | [RECONCILED] column already created by SPEC-006; this SPEC only sets it when entering WITHDRAWN/CANCELLED (SPEC-007/009 for REJECTED/COMPLETED) - not re-added |
| closed_by_user_id | uuid FK users | Y | |
| closure_reason | text | Y | Withdrawal / cancellation reason |
| reapplied_from_transfer_request_id | uuid FK transfer_requests | Y | Optional traceability only; TDD-010.10 |

Constraints:

| Name | Rule |
|---|---|
| `ck_tr_blocked_state` | `(status = 'BLOCKED') = (blocked_from_status IS NOT NULL AND blocked_by_user_id IS NOT NULL AND blocked_at IS NOT NULL AND block_reason IS NOT NULL)` |
| `ck_tr_blocked_from_valid` | `blocked_from_status IS NULL OR blocked_from_status IN ('PENDING_REPORTING_MANAGER_APPROVAL','PENDING_RECEIVING_MANAGER_APPROVAL','INFO_REQUIRED','PENDING_HR_REVIEW','HR_PROCESSING','PENDING_RECEIVING_MANAGER_REAPPROVAL','PAYROLL_PROCESSING','PENDING_IT_ACTION','PENDING_IT_FINAL_APPROVAL')` (never DRAFT, BLOCKED or FINAL) |
| `ck_tr_closed_state` | `status IN ('WITHDRAWN','CANCELLED') -> closed_at, closed_by_user_id, closure_reason NOT NULL` |
| `ck_tr_no_self_reapply` | `reapplied_from_transfer_request_id <> id` |

Index: `ix_tr_status_blocked_from (status, blocked_from_status) WHERE status='BLOCKED'` for the Blocked worklist.

### 10.2 `transfer_exception_actions` (append-only domain record; audit remains authoritative)

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | N | |
| transfer_request_id | uuid FK | N | |
| employee_id | uuid FK | N | Denormalised for audit queries |
| action | varchar(20) | N | `WITHDRAW`,`BLOCK`,`RESUME`,`CANCEL` (REASSIGN has its own table) |
| from_status | varchar(50) | N | |
| to_status | varchar(50) | N | |
| blocked_from_status | varchar(50) | Y | Set for BLOCK, and for RESUME/CANCEL of a Blocked request |
| actor_user_id | uuid FK | N | |
| actor_role | varchar(30) | N | |
| reason | text | Y | NOT NULL for WITHDRAW/BLOCK/CANCEL; remarks for RESUME |
| reservation_outcome | varchar(30) | Y | `RELEASED`,`RETAINED`,`NONE` |
| tasks_cancelled_count | int | Y | |
| created_at | timestamptz | N | |

Indexes: `(transfer_request_id, created_at)`, `(actor_user_id, created_at)`. Privileges: INSERT/SELECT only for the app role (UPDATE/DELETE revoked) following the SPEC-001 append-only strategy.

### 10.3 `transfer_task_reassignments`

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | N | |
| transfer_request_id | uuid FK | N | |
| task_assignment_id | uuid FK transfer_task_assignments | N | |
| task_kind | varchar(40) | N | `REPORTING_MANAGER_APPROVAL`,`RECEIVING_MANAGER_APPROVAL`,`RECEIVING_MANAGER_REAPPROVAL`,`HR_TASK`,`PAYROLL_TASK`,`IT_TASK`,`IT_FINAL_APPROVAL` |
| workflow_stage | varchar(50) | N | Status at reassignment (stored `blocked_from_status` if Blocked) |
| previous_assignee_user_id | uuid FK users | Y | NULL if task was pool-assigned (TDD-010.12) |
| new_assignee_user_id | uuid FK users | N | |
| reassigned_by_user_id | uuid FK users | N | Always Super Admin (CHECK via role join in service; DB `ck` not possible across tables) |
| reason | text | N | |
| created_at | timestamptz | N | |

Constraints: `CHECK (previous_assignee_user_id IS DISTINCT FROM new_assignee_user_id)`. Index `(transfer_request_id, created_at)`, `(previous_assignee_user_id)` for historical visibility lookup.

Reassignment supersedes the current `transfer_task_assignments` row (`state='PENDING'` -> `SUPERSEDED`) and inserts a new PENDING row with the new `assignee_user_id` (SPEC-007 columns) [RECONCILED] R-4 in the same transaction; no row is ever deleted so history stays queryable.

### 10.4 Final-state guard trigger `[PROPOSED]`

`BEFORE UPDATE ON transfer_requests`: if `OLD.status IN ('COMPLETED','REJECTED','WITHDRAWN','CANCELLED')` then `RAISE EXCEPTION 'TRANSFER_FINAL_IMMUTABLE'` unless the update changes only technical columns in an allow-list (`updated_at`) (TDD-010.11). `BEFORE DELETE` on final and active rows raises (soft-delete not used for transfers). Application maps the DB error to 403 `INVALID_WORKFLOW_TRANSITION` and logs it as a critical defect (the engine guard should have refused earlier).

### 10.5 Relationships

`transfer_requests 1-N transfer_exception_actions`; `transfer_requests 1-N transfer_task_reassignments`; `transfer_task_assignments 1-N transfer_task_reassignments`. `transfer_workflow_history` (SPEC-007) also receives one row per transition (withdraw/block/resume/cancel; reassign records a non-transition history entry with `from_status = to_status`).

## 11. Backend Implementation

Module `backend/src/modules/transfer-exceptions/` (follows Backend-Architecture layering Route -> Middleware -> Validation -> Controller -> Service -> Repository):

```
routes/transfer-exceptions.routes.ts
controllers/{withdraw,block,resume,cancel,reassign,allowed,history}.controller.ts
services/{withdraw,block,resume,cancel,reassign,allowed-actions}.service.ts
services/terminal-transition-effects.service.ts
services/reapplication-policy.service.ts
policy/exception-action.policy.ts
repositories/{transfer-exception-action,transfer-task-reassignment}.repository.ts
validations/{action-reason,reassign,params}.validation.ts
constants/{status-sets,error-codes}.ts
types/index.ts
```

### 11.1 Engine registration `[PROPOSED]`

Each handler registers with SPEC-007: `registerTransition({ action, sources, roles, guard, apply, sideEffects })`:

| Action | Sources | Target | Guard (in addition to policy) |
|---|---|---|---|
| WITHDRAW | PRMA, PReMA, INFO, PHR | WITHDRAWN | actor owns request; reason present |
| BLOCK | any ACTIVE non-BLOCKED (SA); HR_CONTROLLED (HR); IT_CONTROLLED (IT) | BLOCKED | reason; scope; not displaced assignee |
| RESUME | BLOCKED | `blocked_from_status` | revalidation passes |
| CANCEL | any ACTIVE incl. BLOCKED (SA); HR_CONTROLLED + BLOCKED-from-HR_CONTROLLED (HR) | CANCELLED | reason; scope |
| REASSIGN | ACTIVE with an open reassignable task | same status | task open; candidate eligible |

### 11.2 Withdraw / Cancel service sequence (single transaction via `withTransaction`)

1. `SELECT ... FROM transfer_requests WHERE id=:id FOR UPDATE`.
2. `ExceptionActionPolicy.evaluate` — on deny: roll back, `ExceptionDenialRecorder.record` (own transaction), throw 403.
3. Validate reason (already via validation middleware; re-asserted).
4. `TerminalTransitionEffects.apply` in canonical lock order [RECONCILED R-5]: cancel `transfer_task_assignments` PENDING/SUSPENDED rows (`state` -> CANCELLED); close open clarification; SPEC-009 `cancelOpenTasks` (payroll_activities, it_tasks); THEN `VacancyService.release(transferId, cause='WITHDRAWN'|'CANCELLED', trx)` (vacancy rows are always locked last).
5. Update `status`, `closed_*`, `blocked_*` cleared; insert `transfer_exception_actions`, `transfer_workflow_history`.
6. `AuditService.record` (action event + any vacancy release event handled by SPEC-005).
7. `NotificationService.enqueue` rows (outbox) in the same trx. Commit.
8. Return 200 with summary.

### 11.3 Block service

Steps 1-3 as above; set `blocked_*` columns from the current status; do **not** touch reservation or tasks (retained, frozen); history/audit/outbox; commit.

### 11.4 Resume service

1. Lock transfer row; policy check (role, stage derived from `blocked_from_status`, scope).
2. Call `VacancyService.validateForResume({ transferRequestId, expectedVacancyId: transfer.proposed_vacancy_id, expectedEmployeeId: transfer.employee_id, expectsReservation }, { trx })` [RECONCILED R-6: SPEC-005 signature, `expectsReservation` is now an optional SPEC-005 parameter]; the call locks the vacancy row (`FOR SHARE` or stricter by SPEC-005) for the rest of the transaction. `expectsReservation = blocked_from_status IN (HR_PROCESSING, PENDING_RECEIVING_MANAGER_REAPPROVAL, PAYROLL_PROCESSING, PENDING_IT_ACTION, PENDING_IT_FINAL_APPROVAL)`; for `PENDING_HR_REVIEW`/`INFO_REQUIRED` only if a reservation exists; for manager stages not applicable `[DERIVED from BRD-028: reservation only after HR approval]`.
3. Run additional checks (TDD-010.05 defaults): current pending assignee still Active user holding role+scope; employee profile still exists.
4. If any check fails: roll back the transition; commit a separate audit-only write `TRANSFER_RESUME_REVALIDATION_FAILED` with failing check codes; respond 409 `RESUME_REVALIDATION_FAILED` `{details:[{check, code, message}]}`; the request stays BLOCKED.
5. On success: `status = blocked_from_status`; clear `blocked_*`; history, audit, outbox, commit.

### 11.5 Reassign service

Task-kind mapping (derived from stage):

| Status | Task kind | Required role of new assignee |
|---|---|---|
| PENDING_REPORTING_MANAGER_APPROVAL | REPORTING_MANAGER_APPROVAL | REPORTING_MANAGER |
| PENDING_RECEIVING_MANAGER_APPROVAL | RECEIVING_MANAGER_APPROVAL | RECEIVING_MANAGER |
| PENDING_RECEIVING_MANAGER_REAPPROVAL | RECEIVING_MANAGER_REAPPROVAL | RECEIVING_MANAGER |
| PENDING_HR_REVIEW / HR_PROCESSING | HR_TASK | HR |
| PAYROLL_PROCESSING | PAYROLL_TASK | HR (authorised for Payroll marking) |
| PENDING_IT_ACTION | IT_TASK | IT |
| PENDING_IT_FINAL_APPROVAL | IT_FINAL_APPROVAL | IT |

Steps: lock transfer; policy (Super Admin only; else deny + security audit `SECURITY_REASSIGN_REFUSED`); status not DRAFT/FINAL; load task (must be OPEN and belong to the transfer); load candidate (Active, role, `ScopeResolver.canActOnTask(candidate, transfer, taskKind)`); candidate != current assignee; reason present; update assignee (and SPEC-009 `it_tasks` assignee through SPEC-009 `ItTaskService.applyReassignment(trx, transferId, newUserId)` [RECONCILED name]); insert `transfer_task_reassignments` + history row (non-transition); audit; outbox `TASK_REASSIGNED` to new assignee; commit. Status and reservation untouched; completed approvals untouched; no engine transition is invoked, so no re-approval can be triggered.

Previous-assignee visibility: `ScopeResolver.canReadTransfer` (SPEC-002) additionally returns true when a `transfer_task_reassignments` row has the user as `previous_assignee_user_id` (read of timeline/history only, not actions or data editing) `[BRD-035]`; act-permission is decided by `transfer_task_assignments.assigned_user_id = actor` (SPEC-007) so displacement takes effect immediately.

### 11.6 Guard registration (TASK-010.13)

- `blockedGuard`: when `status = BLOCKED` only `RESUME`, `CANCEL`, `REASSIGN` pass; others -> `INVALID_WORKFLOW_TRANSITION`.
- `finalGuard`: when status in FINAL nothing passes.
- A startup self-check iterates the registry and asserts no handler lists a FINAL status as source and no handler other than RESUME/CANCEL/REASSIGN accepts BLOCKED unless explicitly annotated.

### 11.7 ReapplicationPolicy (consumed by SPEC-006)

`assertMayReapply({ employeeId, sourceTransferId?, body }, { trx })`: rejects forbidden body keys (400 `VALIDATION_ERROR`), requires the source (if any) to be FINAL and owned by the employee (else 409 `SOURCE_TRANSFER_NOT_CLOSED` `[PROPOSED]` / 403), never copies fields other than the optional traceability id; the one-active check and eligibility remain in SPEC-006.

### 11.8 Logging and standards

Winston structured logging with `requestId`; never log reasons that contain credentials (reasons are free text and are not redacted but are not logged at info level; only IDs and codes are). All async code uses async/await with try/catch; no raw promise chains. Errors via SPEC-001 error classes.

## 12. API Requirements

Base `/api/v1`. Envelope per contract. All endpoints require authentication (401). All mutating endpoints run in one DB transaction and write history + audit + outbox.

### 12.1 `POST /transfers/:transferId/withdraw` `[PROPOSED]`

| Item | Value |
|---|---|
| Purpose | Employee withdraws own request |
| Auth | JWT; role EMPLOYEE |
| Authz | actor owns transfer; status in {PRMA, PReMA, INFO, PHR} |
| Request | `{ "reason": "string" }` |
| Response 200 | `{ "success": true, "data": { "transferId": "uuid", "reference": "string", "previousStatus": "PENDING_HR_REVIEW", "status": "WITHDRAWN", "reservationReleased": false, "cancelledTasks": 1, "closedAt": "ISO" } }` |
| Validation | `transferId` uuid; `reason` required, trimmed, 1..2000 `[PROPOSED]` (TDD-010.06); unknown fields rejected |
| Errors | 400 `VALIDATION_ERROR`; 401; 403 `FORBIDDEN` (not owner / not visible); 403 `INVALID_WORKFLOW_TRANSITION` (wrong role or status incl. after HR approval, BLOCKED, final); 404 not applicable to Employee (see 20) |

### 12.2 `POST /transfers/:transferId/block`

| Item | Value |
|---|---|
| Auth / Authz | SUPER_ADMIN (any ACTIVE non-BLOCKED); HR (HR_CONTROLLED, in scope); IT (IT_CONTROLLED, in scope) |
| Request | `{ "reason": "string" }` |
| Response 200 | `{ "data": { "transferId", "previousStatus", "status": "BLOCKED", "blockedFromStatus", "blockedBy": {"userId","role"}, "blockedAt", "reservationRetained": true } }` |
| Errors | 400; 401; 403 `FORBIDDEN`; 403 `INVALID_WORKFLOW_TRANSITION` (RM, Receiving Manager, Employee, HR/IT outside stages or scope, DRAFT, FINAL, already BLOCKED) |

### 12.3 `POST /transfers/:transferId/resume`

| Item | Value |
|---|---|
| Auth / Authz | SUPER_ADMIN; HR (blocked_from in HR_CONTROLLED, in scope); IT (blocked_from in IT_CONTROLLED, in scope) |
| Request | `{ "remarks": "string (optional)" }` (max 2000) |
| Response 200 | `{ "data": { "transferId", "previousStatus": "BLOCKED", "status": "<blocked_from_status>", "revalidation": { "vacancy": "PASSED\|NOT_APPLICABLE", "checks": [...] }, "resumedAt" } }` |
| Errors | 401; 403 `FORBIDDEN`; 403 `INVALID_WORKFLOW_TRANSITION` (not BLOCKED, cross-role resume, RM/RecM/Employee); **409 `RESUME_REVALIDATION_FAILED`** `{ "details": [{ "check": "VACANCY_CLOSED\|VACANCY_ON_HOLD\|RESERVATION_INVALID\|CAPACITY_EXCEEDED\|DETAILS_MISMATCH\|CONFLICTING_ALLOCATION\|VACANCY_DELETED\|ASSIGNEE_INACTIVE", "message": "..." }] }` — request remains BLOCKED |

Check codes from SPEC-005 are consumed as returned; the list above is the expected minimum.

### 12.4 `POST /transfers/:transferId/cancel`

| Item | Value |
|---|---|
| Auth / Authz | SUPER_ADMIN (any ACTIVE incl. BLOCKED); HR (HR_CONTROLLED, or BLOCKED with blocked_from in HR_CONTROLLED, in scope) |
| Request | `{ "reason": "string" }` |
| Response 200 | `{ "data": { "transferId", "previousStatus", "blockedFromStatus": "string\|null", "status": "CANCELLED", "reservationReleased": true, "cancelledTasks": 2, "closedAt" } }` |
| Errors | 400; 401; 403 `FORBIDDEN`; 403 `INVALID_WORKFLOW_TRANSITION` (IT, RM, RecM, Employee; HR in other stage; HR on IT-blocked; DRAFT; FINAL) |

### 12.5 `POST /transfers/:transferId/reassign`

| Item | Value |
|---|---|
| Auth / Authz | SUPER_ADMIN only |
| Request | `{ "taskId": "uuid", "newAssigneeUserId": "uuid", "reason": "string" }` |
| Response 200 | `{ "data": { "transferId", "status": "<unchanged>", "task": { "taskId","taskKind","workflowStage" }, "previousAssignee": {"userId","userCode"}, "newAssignee": {"userId","userCode"}, "reassignedAt" } }` |
| Validation | uuids; reason required 1..2000; `newAssigneeUserId != current assignee` |
| Errors | 400 `VALIDATION_ERROR`; 401; 403 `INVALID_WORKFLOW_TRANSITION` (non-SA; DRAFT; FINAL) + security audit; 404 `TASK_NOT_FOUND`; 409 `TASK_NOT_REASSIGNABLE` (task not OPEN); 422 `ASSIGNEE_NOT_ELIGIBLE` (role/scope/inactive) ; 422 `ASSIGNEE_UNCHANGED` |

### 12.6 `GET /transfers/:transferId/reassignable-tasks` and `GET /transfers/:transferId/reassignment-candidates?taskId=&q=&page=&pageSize=`

SUPER_ADMIN only. Tasks: `[{ taskId, taskKind, workflowStage, currentAssignee }]`. Candidates: Active users with required role whose scope covers the task; excludes current assignee; paginated (default pageSize 20, max 100). Errors 401/403/404.

### 12.7 `GET /transfers/:transferId/exception-actions/allowed`

Any authenticated user with read access to the transfer. Response `{ "data": { "withdraw": {"allowed":true}, "block": {"allowed":false,"reasonCode":"NOT_PERMITTED_FOR_ROLE"}, "resume": {...}, "cancel": {...}, "reassign": {...}, "reapply": {...} } }`. Advisory only.

### 12.8 `GET /transfers/:transferId/exception-actions`

Read `transfer_exception_actions` and `transfer_task_reassignments` merged chronologically; visibility = users who can read the transfer or are displaced assignees (history); never returns credentials. Paginated.

Reapplication creation endpoint is **SPEC-006**; manual reservation release endpoint is **SPEC-005**.

## 13. Frontend Implementation

Paths (Next.js App Router, Tailwind). Frontend never enforces authority `[BRD-026]`; it renders actions from `GET .../allowed`.

| Surface | Path | Components |
|---|---|---|
| Super Admin Transfers list | `frontend/src/app/(admin)/transfers/page.tsx` | row action menu `TransferActionMenu`; status badges; Blocked filter |
| Super Admin Transfer detail | `frontend/src/app/(admin)/transfers/[transferId]/page.tsx` | `ExceptionActionBar`, `BlockedBanner`, `ExceptionHistoryPanel` |
| Employee own request detail | `frontend/src/app/(employee)/transfers/[transferId]/page.tsx` | `WithdrawDialog`, `ApplyAgainButton`, final-state read-only notice |
| HR / IT worklist | `frontend/src/app/(hr)/worklist/...`, `(it)/worklist/...` | `TransferActionMenu` with allowed subset |
| Shared | `frontend/src/components/transfer-exceptions/` | `WithdrawDialog`, `BlockDialog`, `ResumeDialog`, `CancelDialog`, `ReassignDialog`, `AssigneePicker`, `ReasonField`, `ExceptionHistoryPanel`, `BlockedBanner`, `ExceptionActionBar`, `ApplyAgainButton`, `useExceptionActions` |

### 13.1 Confirmation dialog contract (BRD-002 "confirmation dialogs for sensitive actions")

| Dialog | Content | Submit |
|---|---|---|
| Withdraw | Statement that withdrawal is final and cannot be reopened; reason (required); shows current status | "Withdraw request" (destructive) |
| Block | Explains no processing will continue and reservation is retained; reason required | "Block request" |
| Resume | Shows stored stage the request will return to; remarks optional; displays revalidation failure list inline on 409 and stays open | "Resume request" |
| Cancel | Explains Cancelled is final, reservation released, Payroll/IT tasks cancelled, Employee notified; reason required; extra typed-confirmation of the Transfer reference `[PROPOSED]` | "Cancel request" (destructive) |
| Reassign | Task picker (`reassignable-tasks`), candidate picker with search (role+scope filtered), reason required; states "Status will not change; no re-approval" | "Reassign task" |

Common: `ReasonField` (textarea, required indicator, counter, trimmed validation, inline error), focus trap, Esc to dismiss, `aria-modal`, `aria-describedby` for consequences, disabled submit while pending (prevents double submit; request also carries natural idempotence via status check), error mapping: 400 inline; 403 `INVALID_WORKFLOW_TRANSITION` -> refresh state and show server message; 409 revalidation -> list failures; 422 -> field error; 401 -> login redirect; loading/empty/no-access/error states per BRD-002.

### 13.2 Role rendering

Super Admin: all actions per state. HR: Block/Resume/Cancel only in own stages. IT: Block/Resume only. Employee: Withdraw (when allowed) and Apply again (FINAL). Managers: none. Blocked banner shows stored stage, blocker, reason (visible to roles that can read the transfer).

## 14. Validation Rules

| Field | Rule | Error |
|---|---|---|
| `transferId`, `taskId`, `newAssigneeUserId` | UUID v4 | 400 |
| `reason` (withdraw/block/cancel/reassign) | required; string; trimmed; non-empty; max 2000 `[PROPOSED]` | 400 `VALIDATION_ERROR` details.field=reason |
| `remarks` (resume) | optional string; trimmed; max 2000 | 400 |
| Body | `additionalProperties` rejected | 400 |
| `status` or any workflow field in body | rejected (status is never client-supplied) | 400 |
| Reason content | stored as text, output-encoded in UI, never executed; control characters stripped | n/a |
| Reapplication body (SPEC-006) | forbidden keys `reopenOf`, `transferId`, `status`, `approvals`, `reference` | 400 |

## 15. Authorization & Security Rules

Legend: **Y** = allowed; **Ys** = allowed within org/location scope; **Yo** = allowed only for the owning Employee; **N** = refused 403 `INVALID_WORKFLOW_TRANSITION` (or `FORBIDDEN` if not visible). Roles: SA, EMP, RM, RCV, HR, IT. Status legend: DRAFT; P_RM=`PENDING_REPORTING_MANAGER_APPROVAL`; P_RCV=`PENDING_RECEIVING_MANAGER_APPROVAL`; INFO=`INFO_REQUIRED`; P_HR=`PENDING_HR_REVIEW`; HR_P=`HR_PROCESSING`; P_RCV_R=`PENDING_RECEIVING_MANAGER_REAPPROVAL`; PAY=`PAYROLL_PROCESSING`; P_IT=`PENDING_IT_ACTION`; P_ITF=`PENDING_IT_FINAL_APPROVAL`; COMP; REJ; WDR; BLK=`BLOCKED`; CAN.

### 15.1 Withdraw

| Status | SA | EMP | RM | RCV | HR | IT |
|---|---|---|---|---|---|---|
| DRAFT | N | N | N | N | N | N |
| P_RM | N | Yo | N | N | N | N |
| P_RCV | N | Yo | N | N | N | N |
| INFO | N | Yo | N | N | N | N |
| P_HR | N | Yo | N | N | N | N |
| HR_P | N | N | N | N | N | N |
| P_RCV_R | N | N | N | N | N | N |
| PAY | N | N | N | N | N | N |
| P_IT | N | N | N | N | N | N |
| P_ITF | N | N | N | N | N | N |
| BLK | N | N | N | N | N | N |
| COMP / REJ / WDR / CAN | N | N | N | N | N | N |

(BLK: strict reading of the matrix; TDD-010.02.)

### 15.2 Block

| Status | SA | EMP | RM | RCV | HR | IT |
|---|---|---|---|---|---|---|
| DRAFT | N | N | N | N | N | N |
| P_RM | Y | N | N | N | N | N |
| P_RCV | Y | N | N | N | N | N |
| INFO | Y | N | N | N | N | N |
| P_HR | Y | N | N | N | Ys | N |
| HR_P | Y | N | N | N | Ys | N |
| P_RCV_R | Y | N | N | N | N | N |
| PAY | Y | N | N | N | Ys | N |
| P_IT | Y | N | N | N | N | Ys |
| P_ITF | Y | N | N | N | N | Ys |
| BLK | N | N | N | N | N | N |
| COMP / REJ / WDR / CAN | N | N | N | N | N | N |

### 15.3 Resume (rows by stored `blocked_from_status`)

| Status (blocked_from) | SA | EMP | RM | RCV | HR | IT |
|---|---|---|---|---|---|---|
| BLK (P_RM) | Y | N | N | N | N | N |
| BLK (P_RCV) | Y | N | N | N | N | N |
| BLK (INFO) | Y | N | N | N | N | N |
| BLK (P_HR) | Y | N | N | N | Ys | N |
| BLK (HR_P) | Y | N | N | N | Ys | N |
| BLK (P_RCV_R) | Y | N | N | N | N | N |
| BLK (PAY) | Y | N | N | N | Ys | N |
| BLK (P_IT) | Y | N | N | N | N | Ys |
| BLK (P_ITF) | Y | N | N | N | N | Ys |
| Any non-BLK status (incl. DRAFT, FINAL) | N | N | N | N | N | N |

All Resume "Y/Ys" additionally require successful revalidation (else 409 and request stays BLK).

### 15.4 Cancel

| Status | SA | EMP | RM | RCV | HR | IT |
|---|---|---|---|---|---|---|
| DRAFT | N | N | N | N | N | N |
| P_RM | Y | N | N | N | N | N |
| P_RCV | Y | N | N | N | N | N |
| INFO | Y | N | N | N | N | N |
| P_HR | Y | N | N | N | Ys | N |
| HR_P | Y | N | N | N | Ys | N |
| P_RCV_R | Y | N | N | N | N | N |
| PAY | Y | N | N | N | Ys | N |
| P_IT | Y | N | N | N | N | N |
| P_ITF | Y | N | N | N | N | N |
| BLK (blocked_from HR-controlled) | Y | N | N | N | Ys | N |
| BLK (blocked_from IT-controlled) | Y | N | N | N | **N (security-audited)** | N |
| BLK (blocked_from other) | Y | N | N | N | N | N |
| COMP / REJ / WDR / CAN | N | N | N | N | N | N |

### 15.5 Reassign

| Status | SA | EMP | RM | RCV | HR | IT |
|---|---|---|---|---|---|---|
| DRAFT | N | N | N | N | N | N |
| P_RM | Y | N | N | N | N | N |
| P_RCV | Y | N | N | N | N | N |
| INFO | Y* | N | N | N | N | N |
| P_HR | Y | N | N | N | N | N |
| HR_P | Y | N | N | N | N | N |
| P_RCV_R | Y | N | N | N | N | N |
| PAY | Y | N | N | N | N | N |
| P_IT | Y | N | N | N | N | N |
| P_ITF | Y | N | N | N | N | N |
| BLK | Y* | N | N | N | N | N |
| COMP / REJ / WDR / CAN | N | N | N | N | N | N |

`*` = TDD-010.03 (default allowed). Non-SA refusals are audited as security events `SECURITY_REASSIGN_REFUSED` `[BRD-035]`.

### 15.6 Order of checks and error selection

1. 401 if unauthenticated/expired (SPEC-002).
2. Resolve transfer; if the actor's role has no read scope over it (Employee not owner; HR/IT out of scope; RM/RCV not related) -> 403 `FORBIDDEN` (no data leaked; non-SA nonexistent id also 403).
3. Role/stage/scope/blocked_from policy -> 403 `INVALID_WORKFLOW_TRANSITION` + security audit.
4. Payload validation -> 400. (Validation precedes policy only for malformed ids; reason-missing is evaluated after authorisation so unauthorised users learn nothing.)
5. Business validation (revalidation, candidate eligibility) -> 409/422.

### 15.7 Security notes

- Backend is authoritative; the `allowed` endpoint is advisory.
- Scope checks use the `ScopeResolver` (SPEC-002/003/004), never request-supplied scope.
- Displaced assignees: `assignee_user_id` mismatch -> act actions refused; HR/IT displaced from the current stage task also lose Block/Resume/Cancel on it `[DERIVED from BRD-035; TDD-010.13]`.
- Reasons are never trusted: parameterised queries (Sequelize), output encoding in UI, no eval, no HTML rendering.
- Reassign cannot grant scope: candidate eligibility is recomputed server-side; Super Admin choice cannot override scope `[BRD-035]`.
- Audit never includes credentials; request bodies are not logged wholesale.
- Rate limiting on action endpoints per SPEC-001/002 defaults (no numbers set here).

## 16. Workflow / State Transition Rules

Transitions owned here (full engine matrix is SPEC-007):

| From | Action | Actor | To |
|---|---|---|---|
| P_RM, P_RCV, INFO, P_HR | WITHDRAW | Employee (owner) | WITHDRAWN |
| any ACTIVE non-BLOCKED | BLOCK | SA | BLOCKED (stores from) |
| HR_CONTROLLED | BLOCK | HR (scope) | BLOCKED |
| IT_CONTROLLED | BLOCK | IT (scope) | BLOCKED |
| BLOCKED | RESUME | SA / HR (HR from) / IT (IT from) | stored `blocked_from_status` |
| any ACTIVE incl. BLOCKED | CANCEL | SA | CANCELLED |
| HR_CONTROLLED | CANCEL | HR (scope) | CANCELLED |
| BLOCKED (from HR_CONTROLLED) | CANCEL | HR (scope) | CANCELLED |
| BLOCKED (from IT_CONTROLLED) | CANCEL | HR | **Refused** (no change, security audit) |
| ACTIVE with open task | REASSIGN | SA | same status |
| ACTIVE | REASSIGN | HR/IT/RM/RCV/EMP | **Refused** |
| FINAL | any | any | **Refused** (no reopen) |

Rules: Blocked is reachable only from the nine statuses in `ck_tr_blocked_from_valid`; Resume never goes anywhere else; BLOCKED -> BLOCKED is invalid; BLOCKED -> WITHDRAWN invalid (TDD-010.02); BLOCKED -> terminal only via CANCEL (Rejected is not reachable from BLOCKED because no approver can act while Blocked `[DERIVED]`). Withdrawn/Cancelled are terminal: no outgoing transition exists in the registry.

## 17. Transaction & Concurrency Rules

- Every action runs in one `withTransaction` (read committed) with `SELECT ... FOR UPDATE` on the `transfer_requests` row first. Lock order everywhere: `transfer_requests` -> `transfer_task_assignments` -> downstream Payroll/IT task rows (`payroll_activities`, `it_tasks`) -> `vacancies` (ascending id) -> `vacancy_reservations` (identical to SPEC-005/007/008/009) [RECONCILED R-5: previously vacancies before tasks].
- Second of two concurrent actions sees the new status after the lock and is refused `INVALID_WORKFLOW_TRANSITION` with no side effects (e.g. Employee Withdraw vs HR Approve: exactly one wins; if HR wins, Withdraw is refused; if Withdraw wins, HR approve is refused and no reservation is created).
- Optimistic `version` check (SPEC-007) is a secondary guard.
- Double submission of the same action (double-click, retry): the second hits a status that no longer matches -> refused, no duplicate history, audit or notification. Notification outbox rows carry a unique key `(event_code, transfer_request_id, history_id)` so retry/redelivery is idempotent `[BRD-036, NFR-006]`.
- Resume vs vacancy hold/close: `validateForResume` takes the vacancy row lock in the same transaction; a status change committed first yields a failed revalidation, one committed after cannot invalidate the already-resumed request (existing reservation retained per BRD-028).
- Reassign vs act: reassign locks the transfer row and the task row; an in-flight act by the displaced assignee that commits first stands; one that arrives after sees the new assignee and is refused.
- Failure atomicity: any failure rolls back status, effects (release, task cancellation), history, audit and outbox together; only the denial/revalidation-failure audit entries are committed separately by design.
- No partial results (BRD-038): reservation release and status change are atomic.

## 18. Audit Requirements

All via `AuditService.record(event, {trx})` (SPEC-001). Common fields: actor id, actor role, action, entity (transfer id + reference), employee id, date/time, previous/new status, reason/remarks, request id. Never credentials.

| Event code `[PROPOSED]` | Trigger | Fields captured | BRD |
|---|---|---|---|
| TRANSFER_WITHDRAWN | Withdraw success | transfer id, employee, previous status, withdrawal reason, withdrawn by, date/time, reservation released flag, tasks cancelled | BRD-027, BRD-022 |
| TRANSFER_BLOCKED | Block success | previous status (= blocked_from), reason, blocked by, role, reservation retained | BRD-027 |
| TRANSFER_RESUMED | Resume success | blocked_from status, new status, remarks, resumed by, role, revalidation result | BRD-027 |
| TRANSFER_RESUME_REVALIDATION_FAILED | Resume revalidation failed | failing check codes, actor, role, stored status | BRD-OQ-15, BRD-OQ-18 |
| TRANSFER_CANCELLED | Cancel success | previous status, blocked_from (if any), reason, cancelled by, role, reservation released, tasks cancelled | BRD-027, BRD-028 |
| TASK_REASSIGNED | Reassign success | previous assignee, new assignee, reassigned by, reason, date/time, workflow stage, task kind | BRD-035 |
| VACANCY_RESERVATION_RELEASED | (emitted by SPEC-005 `release`) cause WITHDRAWN/CANCELLED | vacancy, transfer id, employee, capacity released | BRD-028 |
| DOWNSTREAM_TASKS_CANCELLED | Withdraw/Cancel with open tasks | task ids/kinds, count | BRD-027 |
| SECURITY_INVALID_WORKFLOW_TRANSITION | Any refused exception action (role/scope/status; HR cancelling IT-blocked; final-state attempts) | user, role, transfer id, current status, attempted action, date/time, rejection reason code | BRD-027, BRD-026, BRD-037 |
| SECURITY_REASSIGN_REFUSED | Reassign refused (non-SA; no reason; ineligible assignee; Draft/final) | actor, role, transfer id, status, attempted new assignee, refusal code | BRD-035 |

Refusal events are written in an independent transaction so they persist although the action rolled back. Audit records are append-only and are not duplicated by retries.

## 19. Notification Requirements

Events enqueue to the outbox in the same transaction; delivery (Email + In-app) and retry are SPEC-012; failures never roll back `[BRD-036]`. Recipient resolution for "relevant stakeholders" is TDD-010.04 (recommended default shown).

| Event `[PROPOSED]` code | Recipient | Channel | Trigger task | BRD |
|---|---|---|---|---|
| TRANSFER_WITHDRAWN | Pending approver (RM / Receiving Manager / requesting approver / assigned HR); Employee confirmation `[PROPOSED]` | Email + In-app | TASK-010.08, 15 | BRD-027 |
| TRANSFER_BLOCKED ("Task blocked") | Employee and relevant assigned user(s), includes reason | Email + In-app | TASK-010.09, 15 | BRD-036, BRD-027 |
| TRANSFER_RESUMED | Relevant stakeholders (same set as block) | Email + In-app | TASK-010.10, 15 | BRD-027 |
| TRANSFER_CANCELLED | Employee and relevant stakeholders | Email + In-app | TASK-010.11, 15 | BRD-027, BRD-OQ-18 |
| TASK_REASSIGNED | New assignee (mandatory); previous assignee informational `[PROPOSED]` | Email + In-app | TASK-010.12, 15 | BRD-035 |

BRD-036's twelve mandatory events include "Task blocked"; the other events here are required by BRD-027/BRD-035 text and follow the BRD-036 failure rules.

## 20. Error & Edge Cases

| Case | Handling |
|---|---|
| Withdraw by HR/SA/other Employee | 403 (`INVALID_WORKFLOW_TRANSITION` if visible role, `FORBIDDEN` if not visible); audited |
| Withdraw after HR approves (HR_PROCESSING+) | 403 `INVALID_WORKFLOW_TRANSITION`; unchanged |
| Withdraw during PENDING_RECEIVING_MANAGER_APPROVAL when Receiving Manager stage disabled | status never occurs; same as any other invalid status |
| Withdraw of request in INFO_REQUIRED | allowed; clarification closed; requesting approver notified |
| Block with no pending owner | allowed; stakeholder set falls back to Employee + assigned HR |
| Block while INFO_REQUIRED by SA | allowed; Resume returns to INFO_REQUIRED with clarification still open |
| Double Block | second -> `INVALID_WORKFLOW_TRANSITION` |
| Resume when vacancy Closed / On Hold | 409 `RESUME_REVALIDATION_FAILED`, remains BLOCKED; HR/SA must reopen vacancy, change vacancy (SPEC-005/008), or Cancel |
| Resume when vacancy Full | allowed on existing reservation |
| Resume when reservation expected but missing | 409 `RESERVATION_INVALID`, remains BLOCKED |
| Resume by HR on IT-blocked / IT on HR-blocked | 403 `INVALID_WORKFLOW_TRANSITION`; audited |
| Cancel by HR in PENDING_RECEIVING_MANAGER_REAPPROVAL / INFO_REQUIRED / IT stages | 403; SA only |
| Cancel after Block by IT, by HR | 403 + security audit (BRD-027 "Refused" row) |
| Cancel with open vacancy release failure (SPEC-005 error) | whole transaction rolls back; request unchanged; 500/409 per error; retry safe |
| Reassign to user lacking scope / inactive / different role | 422 `ASSIGNEE_NOT_ELIGIBLE`; refusal audited |
| Reassign to current assignee | 422 `ASSIGNEE_UNCHANGED` |
| Reassign when no OPEN task exists (e.g. between transitions) | 409 `TASK_NOT_REASSIGNABLE` |
| Reassign back to previous assignee | allowed; act permission restored; new reassignment row written |
| Previous assignee tries to approve after reassignment | 403 `INVALID_WORKFLOW_TRANSITION` (actor not current assignee) |
| Notification service/mail down | action succeeds; outbox retry later |
| Action on FINAL request (any role) | 403 `INVALID_WORKFLOW_TRANSITION`; trigger is last defence |
| Employee tries "reopen" or resubmit a FINAL request | no route -> 404/405; if posted to a workflow action -> 403 `INVALID_WORKFLOW_TRANSITION` |
| Reapply with active request existing | defers to SPEC-006 409 `ACTIVE_TRANSFER_ALREADY_EXISTS` |
| Reapply same vacancy after Rejected/Withdrawn/Cancelled | allowed subject to eligibility, availability, capacity |
| Block duration vs overdue / escalation | not defined by BRD (TDD-010.07) |
| Document upload / HR edits during BLOCKED | refused as normal processing (TDD-010.08) |

## 21. Acceptance Criteria

| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-010.AC01 | Given an Employee owning a request in `PENDING_REPORTING_MANAGER_APPROVAL`, when they POST withdraw with a reason, then status becomes `WITHDRAWN`, history and audit rows are written (request id, employee, previous status, reason, by, time), the pending Reporting Manager is notified | BRD-027, BRD-OQ-12 |
| SPEC-010.AC02 | Given requests in `PENDING_RECEIVING_MANAGER_APPROVAL`, `INFO_REQUIRED`, `PENDING_HR_REVIEW`, when the owner withdraws, then each succeeds and the pending approver (requesting approver / HR) is notified | BRD-027 |
| SPEC-010.AC03 | Given a Withdraw where an exceptional reservation exists, when it succeeds, then the reservation is released in the same transaction, capacity is recalculated and a release audit entry exists | BRD-027, BRD-028 |
| SPEC-010.AC04 | Given a withdrawn request, when any role tries to reopen/approve/edit it, then 403 `INVALID_WORKFLOW_TRANSITION` and nothing changes | BRD-027, BRD-033 |
| SPEC-010.AC05 | Given Super Admin and a request in any non-final submitted status, when Block with reason, then status `BLOCKED`, `blocked_from_status` stored, reservation retained, stakeholders notified, audited | BRD-027 |
| SPEC-010.AC06 | Given HR in scope and a request in `PENDING_HR_REVIEW`/`HR_PROCESSING`/`PAYROLL_PROCESSING`, when HR blocks with reason, then it succeeds | BRD-027, BRD-OQ-18 |
| SPEC-010.AC07 | Given IT in scope and `PENDING_IT_ACTION`/`PENDING_IT_FINAL_APPROVAL`, when IT blocks with reason, then it succeeds | BRD-027, BRD-OQ-18 |
| SPEC-010.AC08 | Given a BLOCKED request, when any normal action (approve, reject, HR change, mark Payroll complete, IT complete/final approve) is attempted, then 403 `INVALID_WORKFLOW_TRANSITION` and no change | BRD-027 |
| SPEC-010.AC09 | Given a BLOCKED request with a reservation, then the one-active-request rule still treats it as active and the reservation is retained | BRD-030, BRD-028 |
| SPEC-010.AC10 | Given Super Admin, a Blocked request and a passing revalidation, when Resume, then it returns to the stored status, blocked columns cleared, remarks audited | BRD-027 |
| SPEC-010.AC11 | Given HR and a request blocked from an HR-controlled stage within scope, when HR resumes, then success; same for IT with an IT-controlled block | BRD-OQ-18(e) |
| SPEC-010.AC12 | Given a Blocked request whose vacancy is Closed, when Resume, then 409 `RESUME_REVALIDATION_FAILED`, request remains BLOCKED, failure audited | BRD-028, BRD-OQ-15 |
| SPEC-010.AC13 | Given a Blocked request whose vacancy is On Hold, when Resume, then refused and remains BLOCKED; once vacancy reopened Resume succeeds | BRD-OQ-15(b) |
| SPEC-010.AC14 | Given a Blocked request whose vacancy is Full with a valid existing reservation, when Resume, then success | BRD-OQ-15(b) |
| SPEC-010.AC15 | Given Super Admin and any ACTIVE status (including Blocked from any stage), when Cancel with reason, then `CANCELLED`, reservation released, open Payroll/IT tasks cancelled, Employee and stakeholders notified, audited | BRD-027 |
| SPEC-010.AC16 | Given HR in scope in `PENDING_HR_REVIEW`/`HR_PROCESSING`/`PAYROLL_PROCESSING`, when HR cancels with reason, then success | BRD-OQ-18(b) |
| SPEC-010.AC17 | Given a request Blocked from an HR-controlled stage (incl. blocked by HR), when in-scope HR cancels with reason, then success | BRD-027 follow-up |
| SPEC-010.AC18 | Given Super Admin, a request with an open `it_tasks` row and Payroll activity, when Cancel, then those tasks become cancelled and cannot be completed | BRD-027 |
| SPEC-010.AC19 | Given Super Admin and an open Reporting Manager / Receiving Manager / HR / IT task, when Reassign to an Active user with the role and scope and a reason, then status unchanged, assignee changed, new assignee notified, audit shows previous/new/by/reason/time/stage | BRD-035 |
| SPEC-010.AC20 | Given a completed reassignment, then previously completed approvals remain valid and no re-approval is triggered | BRD-035 |
| SPEC-010.AC21 | Given a reassignment, then the previous assignee can read the workflow/audit history of the request but cannot act on the task; after reassigning back they can act again | BRD-035 |
| SPEC-010.AC22 | Given Reassign, then IT Final Approval, mandatory approvals and scope rules are unaffected (new assignee must still perform the task) | BRD-035 |
| SPEC-010.AC23 | Given a Rejected/Withdrawn/Cancelled/Completed request, when the employee applies again via SPEC-006, then a new ID/reference is created, eligibility and vacancy availability are revalidated, workflow restarts, no approvals/tasks/clarifications copied, previous request unchanged and still visible | BRD-030, BRD-033 |
| SPEC-010.AC24 | Given the same vacancy as the closed request is Open with capacity, when the employee reapplies, then the request is accepted | BRD-OQ-16(d), BRD-030 |
| SPEC-010.AC25 | Given Draft requests, then Block, Resume, Cancel, Reassign and Withdraw are refused | BRD-OQ-18(d) |
| SPEC-010.AC26 | Given a FINAL request, when direct SQL attempts to update its status, then the DB trigger rejects it | BRD-033 |
| SPEC-010.AC27 | Given the Super Admin Transfers UI, when an action is chosen, then a confirmation dialog with required reason appears and the call is made only after confirmation; unavailable actions are not rendered | BRD-002, BRD-010 |
| SPEC-010.AC28 | Given a notification failure for any of these actions, then the action stays recorded and retry delivers without repeating the transition | BRD-036 |
| SPEC-010.AC29 | Given the allowed-actions endpoint, then it returns exactly the actions the policy would accept for the caller | BRD-026 |

## 22. Negative Acceptance Criteria

| ID | Given / When / Then | BRD-039 / BRD |
|---|---|---|
| SPEC-010.NAC01 | Employee withdraws without reason -> 400, unchanged | BRD-027 |
| SPEC-010.NAC02 | Employee withdraws from `HR_PROCESSING`, `PAYROLL_PROCESSING`, `PENDING_IT_ACTION`, `PENDING_IT_FINAL_APPROVAL`, `PENDING_RECEIVING_MANAGER_REAPPROVAL` -> 403 `INVALID_WORKFLOW_TRANSITION` | BRD-OQ-12, Workflow: invalid transitions |
| SPEC-010.NAC03 | Employee withdraws another employee's request -> 403 `FORBIDDEN`, no data leaked, audited | Security: Employee cannot access another's request |
| SPEC-010.NAC04 | HR, IT, RM, Receiving Manager, Super Admin POST withdraw -> 403 | BRD-027 |
| SPEC-010.NAC05 | Employee, Reporting Manager, Receiving Manager POST block -> 403 | BRD-027 |
| SPEC-010.NAC06 | HR blocks in `PENDING_IT_ACTION` / `INFO_REQUIRED` / manager stages -> 403 | BRD-OQ-18(a) |
| SPEC-010.NAC07 | IT blocks in any HR-controlled or manager stage -> 403 | BRD-OQ-18(a) |
| SPEC-010.NAC08 | HR/IT blocks outside their organisation scope -> 403 `FORBIDDEN` | Security: out-of-scope data; BRD-026 |
| SPEC-010.NAC09 | Block without reason -> 400 | BRD-027 |
| SPEC-010.NAC10 | Block a Draft, an already Blocked, or a final request -> 403 `INVALID_WORKFLOW_TRANSITION` | BRD-OQ-18(d) |
| SPEC-010.NAC11 | HR resumes an IT-blocked request; IT resumes an HR-blocked request -> 403, audited | BRD-OQ-18(e) |
| SPEC-010.NAC12 | Employee/RM/Receiving Manager resume -> 403 | BRD-027 |
| SPEC-010.NAC13 | Resume of a non-Blocked request -> 403 `INVALID_WORKFLOW_TRANSITION` | Workflow: invalid transitions |
| SPEC-010.NAC14 | Resume with failing revalidation (deleted vacancy, invalid reservation, capacity exceeded, mismatch, conflicting allocation) -> 409, remains BLOCKED | BRD-OQ-15(a) |
| SPEC-010.NAC15 | HR cancels in `PENDING_RECEIVING_MANAGER_REAPPROVAL`, `INFO_REQUIRED`, `PENDING_IT_ACTION`, `PENDING_IT_FINAL_APPROVAL`, manager stages -> 403 | BRD-OQ-18(b) |
| SPEC-010.NAC16 | HR cancels a request Blocked from an IT-controlled stage -> 403 + `SECURITY_INVALID_WORKFLOW_TRANSITION` | BRD-027 refused row |
| SPEC-010.NAC17 | IT, Employee, RM, Receiving Manager cancel -> 403 | BRD-027 |
| SPEC-010.NAC18 | Cancel a Completed / Rejected / Withdrawn / Cancelled request -> 403, unchanged | BRD-027; Workflow: Completed cannot be modified |
| SPEC-010.NAC19 | Any approve/reject/clarify/HR change/date change/IT action on a Completed request -> 403 `INVALID_WORKFLOW_TRANSITION` | Workflow: Completed cannot be modified |
| SPEC-010.NAC20 | Any attempt to edit, approve, resubmit or reopen a Rejected request under the same reference -> 403 `INVALID_WORKFLOW_TRANSITION` | BRD-033 |
| SPEC-010.NAC21 | Attempt to set `status` back from a final status via any API body or direct update -> rejected (400 or trigger) | BRD-033 |
| SPEC-010.NAC22 | Cancel without reason -> 400 | BRD-027 |
| SPEC-010.NAC23 | HR POST reassign -> 403 `INVALID_WORKFLOW_TRANSITION`, audited as security event; same for IT, RM, Receiving Manager, Employee | BRD-035 |
| SPEC-010.NAC24 | Reassign without reason -> 400; to a user lacking role / lacking org/location scope / inactive -> 422; on Draft or final -> 403; all audited as security events where BRD-035 requires | BRD-035 |
| SPEC-010.NAC25 | Reassign cannot be used to mark a task complete, skip IT Final Approval or bypass Receiving Manager approval; response contains no such capability | BRD-035 |
| SPEC-010.NAC26 | Unauthenticated / expired token on any exception endpoint -> 401 | BRD-026 |
| SPEC-010.NAC27 | Previous assignee attempts to approve/complete after reassignment -> 403 `INVALID_WORKFLOW_TRANSITION` | Workflow: user cannot approve outside assigned role/scope |
| SPEC-010.NAC28 | Concurrent Withdraw and HR Approve: exactly one succeeds; no reservation exists after a winning Withdraw | Vacancy: Withdrawn releases; BRD-038 |
| SPEC-010.NAC29 | Direct API call (Postman) with forged `role`/`scope` in body/headers -> ignored; authorization derived from token and DB | Security: Direct API access |
| SPEC-010.NAC30 | New request body referencing `reopenOf` / old id / approvals -> 400; no approvals copied | BRD-033, BRD-030 |
| SPEC-010.NAC31 | Reapply while another active request exists -> 409 `ACTIVE_TRANSFER_ALREADY_EXISTS` | BRD-030 |
| SPEC-010.NAC32 | A failed notification delivery does not roll back or duplicate any exception action | BRD-036 |

## 23. Testing Requirements

Tests live in `tests/backend/transfer-exceptions/` and `tests/frontend/transfer-exceptions/`. Test-first (TDD RED then GREEN) per repository standards.

| Type | TC IDs and coverage |
|---|---|
| Unit | TC-010.01 policy matrix: 15 statuses x 6 roles x 5 actions (+ `blocked_from`, scope, displaced assignee) generated from the 15.x tables; TC-010.02 status-set constants; TC-010.03 reason validators; TC-010.04 task-kind mapping; TC-010.05 ReapplicationPolicy; TC-010.06 stakeholder resolver |
| Integration | TC-010.07 withdraw per allowed status (history, audit, outbox, tasks cancelled); TC-010.08 withdraw releases exceptional reservation; TC-010.09 block stores/blocks/retains; TC-010.10 blocked guard refuses normal actions; TC-010.11 resume success per stage; TC-010.12 resume vacancy Closed/On Hold/Full/deleted/invalid reservation/capacity; TC-010.13 failed resume audit committed while state rolled back; TC-010.14 cancel active, cancel Blocked (each blocked_from); TC-010.15 cancel releases reservation and cancels Payroll/IT tasks; TC-010.16 reassign for each task kind; TC-010.17 reassign scope validation incl. wrong location; TC-010.18 reassign back; TC-010.19 previous assignee read-only visibility; TC-010.20 reapply creates new record with no inherited data |
| API | TC-010.21 endpoint contracts and envelopes; TC-010.22 400 validation (reason, uuid, unknown fields); TC-010.23 401 on all; TC-010.24 403 `FORBIDDEN` vs `INVALID_WORKFLOW_TRANSITION` selection; TC-010.25 allowed-actions parity with policy; TC-010.26 history endpoint scoping |
| Frontend | TC-010.27 dialogs require reason, disable on pending, show server errors; TC-010.28 role-based rendering from `allowed`; TC-010.29 Blocked banner; TC-010.30 Resume failure list; TC-010.31 Employee Withdraw and Apply again; TC-010.32 accessibility (focus trap, labels, keyboard); TC-010.33 Super Admin list actions |
| Security | TC-010.34 cross-role restriction matrix over real HTTP for every non-allowed cell of 15.1-15.5; TC-010.35 HR on IT-blocked cancel/resume refused and security-audited; TC-010.36 non-SA reassign refused and audited; TC-010.37 out-of-scope HR/IT; TC-010.38 Employee on another's request; TC-010.39 forged body role/scope ignored; TC-010.40 audit entries contain no credentials |
| Concurrency | TC-010.41 Withdraw vs HR approve; TC-010.42 double Cancel; TC-010.43 Block vs approve; TC-010.44 Resume vs vacancy status change; TC-010.45 two Reassigns on the same task; TC-010.46 double-click Withdraw (idempotent refusal); TC-010.47 deadlock check with lock order under parallel Cancel + HR approve |
| Workflow | TC-010.48 registry self-check: no FINAL source, BLOCKED allows only RESUME/CANCEL/REASSIGN; TC-010.49 Blocked reachable only from the nine valid statuses; TC-010.50 DB trigger and CHECK constraints; TC-010.51 final-state immutability across all actions |
| Negative | TC-010.52 each NAC01-NAC32 mapped one-to-one (TC-010.52.01 ... TC-010.52.32) |

Coverage expectation: policy and services target full branch coverage of the authorisation tables; numeric coverage thresholds are set by SPEC-016/project test strategy (not defined here).

## 24. Definition of Done

- [ ] Spec Gate 1 approved by the roster Project Manager / Product Owner.
- [ ] Migrations (TASK-010.01-04) run forward and back; constraints and trigger verified.
- [ ] All endpoints implemented behind `ExceptionActionPolicy`; policy table generated tests green for every cell of 15.1-15.5.
- [ ] Every action single-transaction with history + audit + outbox; denial audits persist outside the rollback.
- [ ] Reservation release/retention verified against SPEC-005 for Withdraw, Cancel, Block, Resume.
- [ ] Payroll/IT task cancellation hooks (SPEC-009) and notification templates (SPEC-012) integrated.
- [ ] Reassign displacement and read visibility verified.
- [ ] Final-state protection and no-reopen verified at engine, API and DB levels.
- [ ] UI dialogs, role rendering and a11y tests green.
- [ ] All AC and NAC mapped to passing tests; BRD-039 workflow rows covered.
- [ ] INT standards: async/await + try/catch, structured logger, no secrets, validated input, structured errors, no AI-hint comments or commit messages.
- [ ] OpenAPI updated; `status.md`, dashboard and `prompt_history.md` synchronised by the lifecycle workflow (not by this spec).
- [ ] Gate 2 code review passed.

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-010.01 | May HR resume a request that **Super Admin** blocked during an HR-controlled stage (and IT likewise)? BRD-OQ-18(e) defines Resume by the stage "blocked during", not by the blocker | Stage-based literal reading: HR/IT may resume any block whose `blocked_from_status` is in their controlled set, regardless of blocker | `ExceptionActionPolicy`, tests TC-010.01/11 |
| TDD-010.02 | May the Employee withdraw a request that is Blocked from a pre-HR-approval status (matrix lists no Blocked source for Withdraw)? | Refuse (strict matrix); Super Admin uses Cancel | Policy; Employee UX |
| TDD-010.03 | May Reassign be used in `INFO_REQUIRED` and `BLOCKED` (BRD says "active pending task")? | Allowed for the task owed by the reviewer / stored stage task; status unchanged | Policy; operability of stuck requests |
| TDD-010.04 | "Relevant stakeholders" recipients for Block/Resume/Cancel (gap (i)) | Employee + current pending assignee + assigned HR (+ assigned IT when an IT task is open) + the actor excluded | SPEC-012 templates, tests |
| TDD-010.05 | Which additional "relevant business conditions" apply on Resume beyond vacancy (BRD-027 says "including vacancy validity/capacity where applicable") | Pending assignee still Active with required role and scope; employee profile exists; nothing else (no tenure/probation/eligibility invented) | Resume revalidation list |
| TDD-010.06 | Reason/remarks length limits | trimmed 1..2000 characters | Validation, DB `text` |
| TDD-010.07 | Does Blocked duration count toward overdue/escalation timers? (gap (n)) | Not defined; no timers are changed by this SPEC; SPEC-014 to decide | SPEC-014 |
| TDD-010.08 | Are document upload, HR note/edit, effective-date correction permitted while Blocked? | Refused as "normal processing"; Super Admin must Resume first (or Cancel) | Engine guard, UX |
| TDD-010.09 | Notify the Employee on their own Withdraw (BRD only mandates the pending approver) | Send in-app+email confirmation | Notification volume |
| TDD-010.10 | Store `reapplied_from_transfer_request_id` link between old and new request? | Yes, optional, traceability only, no data inheritance | `transfer_requests` column, history UI |
| TDD-010.11 | Which technical columns may change on a FINAL `transfer_requests` row (trigger allow-list) | Only `updated_at` | Trigger, SPEC-009 completion side effects |
| TDD-010.12 | Reassign when the task is pool-assigned with no individual assignee, and IT task selection among several IT users per location (gap (g)) | Reassign sets an explicit assignee; `previous_assignee_user_id` NULL; scope rule per SPEC-009 routing | Schema nullability, SPEC-009 |
| TDD-010.13 | After Reassign, may the displaced HR/IT user still Block/Resume/Cancel the request via scope alone? | No: displaced assignee loses all act permissions on that stage's task (including these) | Policy rule BR-010.16 |
| TDD-010.14 | Scope definition for the new assignee of Reporting Manager / Receiving Manager tasks (gap (c); BRD-016 gives no RM scope beyond assigned employees) | Active user with the role whose configured org scope (SPEC-003/004) covers the employee's location and department; Receiving Manager per SPEC-003 target-team mapping | `ScopeResolver.canActOnTask`, candidate query |
| TDD-010.15 | Whether `INVALID_WORKFLOW_TRANSITION` or `FORBIDDEN` is returned when the caller's role can see the transfer but the action is not for their role | `INVALID_WORKFLOW_TRANSITION` when visible, `FORBIDDEN` when not visible (avoid information leakage) | Error selection, tests |

## Out of Scope (this SPEC)

Per BRD "Out of Scope": nothing here introduces any item. Specifically excluded:

- Employee-initiated cancellation after HR approval (BRD: only the separate authorised Cancellation process; Employee cannot cancel).
- Reopening or resubmitting a Rejected/Withdrawn/Cancelled/Completed request (BRD-033, BRD-027).
- Manual vacancy-reservation release endpoint and vacancy edge-case engine (SPEC-005).
- Request creation/eligibility/one-active index (SPEC-006) and the core transition engine, clarification, approve/reject (SPEC-007), HR rows (SPEC-008), Payroll/IT completion (SPEC-009).
- Notification templates/delivery (SPEC-012), audit visibility/export (SPEC-013), dashboards and escalation timings (SPEC-014).
- Any external HR, Payroll or IT-system integration, MFA/SSO, automatic escalation timings, eligibility policies beyond BRD-029.
- Facilities/Admin role and tasks (removed from scope).
