# SPEC-009 — Payroll, IT Processing & Final Transfer Completion

## Feature ID
payroll-it-completion

## Status
Draft — not yet submitted for Gate 1

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 1 (Spec Peer Review) | — | — | Not submitted | — |
| Gate 2 (Code Review) | — | — | Not started | — |

## Intent & Business Goals

Deliver the last third of the transfer lifecycle: **Payroll Processing** (manual, recorded by an authorised HR user, no payroll calculation, no Payroll API/callback in the current phase), **IT Processing** (location-routed IT task, least-privilege IT work queue, IT task types, comments, completion evidence, In Progress / Completed / Blocked), the two IT outcomes (**Complete IT Tasks** or **No IT Action Required**), the mandatory **IT Final Approval** for every transfer, and the **Completion Gate** that is the only path to `COMPLETED`. Completion is a single atomic transaction that also finalises the vacancy allocation (SPEC-005), emits the final audit and the employee/stakeholder notification, and renders the transfer immutable through the normal workflow. [BRD-014] [BRD-018] [BRD-019] [BRD-027]

Business goals:
- Payroll Processing starts only after HR Processing is complete (sequential, never parallel) and must be complete before IT work begins. [BRD-027(b)]
- No transfer reaches `COMPLETED` on manager, HR or Payroll approval alone; IT Final Approval is the mandatory last gate for every transfer, with or without IT work. [BRD-027 completion rule] [BRD-OQ-11]
- IT sees only the minimum employee/transfer information required for its task. [BRD-014] [NFR-007]
- A failure of any completion step rolls back the whole completion; nothing is partially completed. [BRD-038]

## User Roles & Actors

| Actor | Role in this SPEC |
|---|---|
| HR (authorised HR user) | Records Payroll reference/remarks and marks the Payroll activity Completed. Receives "Payroll task assigned". |
| IT (assigned IT user) | Works the IT task(s): classify, start, block with reason, comment, attach evidence, complete; records Complete IT Tasks or No IT Action Required; gives IT Final Approval. |
| Super Admin | Corrects an expired Effective Transfer Date in IT-controlled stages; manages IT task-type catalogue `[PROPOSED]`; sees all IT/Payroll records; reassigns IT tasks (SPEC-010 action, hook implemented here). |
| Employee | Notified of IT-stage outcomes and completion; sees stage only (SPEC-006 timeline); no access to Payroll/IT records. |
| Reporting Manager / Receiving Manager | No action in this SPEC. Their approvals are conditions of the completion gate. |
| System (WorkflowEngine, ItAssignmentService, CompletionGateService) | Opens Payroll/IT work on stage entry; evaluates the gate; runs the completion transaction. |

---

## 1. Specification Information

| Field | Value |
|---|---|
| SPEC ID | SPEC-009 |
| Title | Payroll, IT Processing & Final Transfer Completion |
| Purpose | Define Payroll activity tracking, IT task execution, IT Final Approval, the 5-condition completion gate and the atomic Completed transition. |
| Business objective | Controlled, auditable, least-privilege downstream processing that ends in a correctly gated, immutable Completed transfer and a finalised vacancy allocation. |
| Version | 0.1 (Draft) |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer (per roster) | Project Manager / Product Owner |
| Task prefix | TASK-009.MM |
| Date | 2026-10-06 |

## 2. Why This SPEC Exists

The BRD transition matrix ends with Payroll Processing → Pending IT Action → Pending IT Final Approval → Completed, but three things are spread across many BRD items and need one coherent, testable owner: (1) the manual Payroll activity and its recorded data (BRD-027(c)); (2) the IT task domain, its least-privilege view, evidence and blocked-with-reason handling (BRD-014); (3) the completion rule and gate, including the effective-date-expired block (BRD-031), the final vacancy allocation (BRD-028) and the atomicity/immutability guarantees (BRD-027, BRD-038, BRD-039). SPEC-007 supplies the engine and SPEC-008 the HR stages; this SPEC registers the Payroll/IT/Final-Approval handlers with that engine and owns the data they use. Without it, a transfer could be completed prematurely, IT could see more employee data than needed, or a failed step could leave a half-completed transfer with an allocated vacancy.

## 3. BRD Traceability

### 3.1 BRD requirement IDs

| BRD ID | Coverage | Slice owned by this SPEC |
|---|---|---|
| BRD-014 | **FULL** | IT view of assigned tasks (location/workflow routed), minimum-necessary information, access provisioning/removal/modification and device/asset activities, comments and completion evidence, In Progress/Completed/Blocked with reason, mandatory IT Final Approval, No IT Action Required with reason. |
| BRD-018 | PARTIAL | Payroll Processing → IT review/activities → IT Final Approval → Close (notify employee). Earlier steps: SPEC-006/007/008. |
| BRD-019 | PARTIAL | Rule that a request is never Completed on manager/HR approval alone; Completed only after IT Final Approval. Status model itself: SPEC-007. |
| BRD-027 | PARTIAL | Matrix rows: Payroll Processing/Mark Payroll Activity Completed; Pending IT Action/Complete IT Tasks; Pending IT Action/No IT Action Required; Pending IT Final Approval/Final Approve; Completed/no further transition. BRD-027(b)(c) payroll sequencing/source; completion rule (5 conditions); backend enforcement for these rows. Engine, other rows: SPEC-007/006/008/010. |
| BRD-028 | PARTIAL | "Transfer Completed → reservation becomes final allocation / filled capacity" (call to `VacancyService.finalizeAllocation`, atomic with completion). Capacity engine: SPEC-005. |
| BRD-031 | PARTIAL | Expired Effective Transfer Date blocks completion; Super Admin correction in IT-controlled stages (API/UI here). HR correction in HR-controlled stages: SPEC-008. Date rule validation: shared validator from SPEC-006. |
| BRD-013 | PARTIAL | HR "assign payroll configuration tasks / initiate payroll tasks / monitor downstream completion": the Payroll activity record and HR read view. |
| BRD-020 | PARTIAL | "applicable payroll assignment/reference" stored on the Payroll activity (HR metadata fields: SPEC-008). |
| BRD-021 | PARTIAL | Completion-evidence documents attach through SPEC-011; IT can only reach evidence for tasks it owns (BRD-039 "IT cannot access Employee documents outside its authorised scope"). |
| BRD-022 / BRD-037 | PARTIAL | Audit events for payroll/IT task events and IT Final Approval (§18). |
| BRD-026 | PARTIAL | Role → scope → resource → action → stage checks for every endpoint here. |
| BRD-035 | PARTIAL | IT task reassignment hook (`ItTaskService.applyReassignment`); the Reassign action and UI: SPEC-010. |
| BRD-036 | PARTIAL | Events: Payroll task assigned, IT task assigned, task blocked, approval required (IT Final Approval), transfer completed. Delivery framework: SPEC-012. |
| BRD-016 | PARTIAL | Consumes IT location scope for routing; mapping data: SPEC-003/004. |
| BRD-029 | PARTIAL | Field ownership "Payroll Reference/Assignment — authorised HR" realised in `payroll_activities`. |
| BRD-024 | PARTIAL | Gate condition: no outstanding re-approval; trigger itself: SPEC-008. |
| BRD-039 | PARTIAL | Workflow/security scenarios rows listed in 3.5. |

### 3.2 NFR IDs

| NFR | Coverage | Slice |
|---|---|---|
| NFR-002 | PARTIAL | Least privilege and role/scope/stage checks on every IT/Payroll API (backend authoritative). |
| NFR-005 | PARTIAL | Audit events append-only through `AuditService` kernel (SPEC-001); events listed in §18. |
| NFR-006 | PARTIAL | Notification retry never repeats transitions (completion transaction is independent of delivery). No integration exists this phase; nothing here calls an external system. |
| NFR-007 | PARTIAL | Field-level projection for IT, scoped evidence access. |
| NFR-008 | PARTIAL | HR/IT screens follow base UI kit accessibility (SPEC-001/003). |

### 3.3 BRD-OQ

| ID | Status | Implemented here |
|---|---|---|
| BRD-OQ-11 | Resolved | No IT Action Required + reason/remark + IT Final Approval for every transfer (FR-009.40–FR-009.46). |
| BRD-OQ-14 (b)(c) | Resolved | Sequential Payroll after HR Processing; manual completion; no API/callback (FR-009.01–FR-009.14). (a) and (d): SPEC-008 / SPEC-007. |
| BRD-OQ-18 (a) | Resolved | Stage classification used for Super Admin date correction and IT scope (IT-controlled = PENDING_IT_ACTION, PENDING_IT_FINAL_APPROVAL). |
| BRD-OQ-20 (d) | Resolved | Expired date blocks completion; Super Admin corrects in IT stages (FR-009.60–FR-009.64). |
| BRD-OQ-15 | Resolved | Completion allocation only (SPEC-005 owns the rest). |
| BRD-OQ-19 (d) | Resolved | Payroll reference is portal data only; no external payroll write. |

### 3.4 Business rules and acceptance-criteria bullets covered

| BRD Business Rule / Acceptance Criteria bullet | Covered by |
|---|---|
| "A transfer request must not become Completed after manager or HR approval alone … IT remains the final gate" | FR-009.50–FR-009.58; SPEC-009.AC20–AC24 |
| "IT users see only the minimum employee/transfer information required" | FR-009.24–FR-009.26; AC14, NAC09–NAC11 |
| "Payroll calculations … remain with the authoritative payroll system; the portal only coordinates handoff/status" | FR-009.03, FR-009.14; NAC01, NAC02 |
| AC: "IT users can view and complete only assigned tasks within authorised scope" | FR-009.20–FR-009.26, FR-009.30–FR-009.37; AC12–AC17 |
| AC: "A request reaches Completed only once IT gives Final Approval (with or without an applicable IT task, via No IT Action Required)" | FR-009.40–FR-009.46, FR-009.50–FR-009.58; AC18–AC24 |
| AC: "IT Final Approval is refused while a mandatory Payroll activity is incomplete" | FR-009.52, FR-009.54; NAC06, NAC07 |
| AC: "HR Processing always precedes Payroll Processing; only an authorised HR user can mark Payroll completed (status, completed by, date/time, reference, remarks)" | FR-009.01–FR-009.12; AC01–AC08 |
| AC: "A request whose date has expired cannot be completed until HR (HR stage) or Super Admin (later stages) updates it" | FR-009.60–FR-009.64; AC25–AC27 |
| AC: "Reserved plus filled positions never exceed total capacity"; Completed converts reservation to final allocation | FR-009.56; AC22; NAC20 |
| AC: "UAT: IT No Action Required completion, final completion" | AC19, AC20 |

### 3.5 BRD-039 negative scenarios (rows touched by this SPEC)

| BRD-039 area | Scenario | Coverage | Mapped NAC |
|---|---|---|---|
| Workflow | IT Final Approval cannot be provided while a mandatory Payroll activity remains incomplete | FULL | NAC06, NAC07 |
| Workflow | A transfer cannot move to Completed without mandatory IT Final Approval | FULL | NAC12–NAC14 |
| Workflow | A Completed transfer cannot be modified through the normal workflow | FULL (payroll/IT/final records and transitions) | NAC17–NAC19 |
| Workflow | Invalid workflow transitions are rejected | PARTIAL (Payroll/IT/Final Approval rows) | NAC03–NAC05, NAC15 |
| Workflow | A user cannot approve outside assigned role/scope | PARTIAL (IT Final Approval, Payroll completion) | NAC08, NAC16 |
| Security | IT cannot access Employee documents outside its authorised scope | PARTIAL (completion-evidence slice) | NAC11 |
| Security | Direct API access cannot bypass authorization | PARTIAL (all endpoints here) | NAC08, NAC09, NAC16 |
| Security | An Employee cannot access another Employee's transfer request | PARTIAL (no Employee access to payroll/IT records) | NAC10 |
| Security | A user cannot access another organisation's data outside scope | PARTIAL | NAC09 |
| Integration | A failed integration does not mark a task Completed; integration failure does not mark transfer Completed; no duplicate downstream transactions | PARTIAL — no integration exists this phase; proven by absence of any payroll callback/API route and manual-only completion | NAC01, NAC02 (approach per QA spec SPEC-016) |
| Vacancy | Concurrent/negative capacity | PARTIAL (final allocation step cannot overflow; whole completion rolls back) | NAC20, NAC21 |

---

## 4. Dependencies

| Depends on | What is used |
|---|---|
| SPEC-001 | `withTransaction`, `AuditService.record(event,{trx})`, `NotificationService.enqueue(code,payload,{trx})`, error classes, response envelope, validation middleware, logger, config loader (`BUSINESS_TIME_ZONE`), migration conventions, UI kit. |
| SPEC-002 | `authenticate`, `AuthorizationService.authorize`, `ScopeResolver` (HR/IT scope), 401/403 handling, token versioning. |
| SPEC-003 | Location master, HR/IT location scope mappings, admin shell (for the IT task-type admin page). |
| SPEC-004 | `employee_profiles` (name, official email, department/BU, designation, location, assigned HR, assigned IT), `users`. |
| SPEC-005 | `VacancyService.finalizeAllocation({ transferRequestId, actor }, { trx })` (reservation → final allocation, idempotent) [RECONCILED R-6 signature per SPEC-005]. |
| SPEC-006 | `transfer_requests` (status, `effective_transfer_date`, proposed values; "active" is derived from status, there is no `is_active` column [RECONCILED]), shared effective-date validator, reference. |
| SPEC-007 | `WorkflowEngine.transition`, transition registry, `transfer_workflow_history`, `transfer_task_assignments`, `workflow_configuration` (Receiving Manager toggle, date-change re-approval), `INVALID_WORKFLOW_TRANSITION` handling. |
| SPEC-008 | `COMPLETE_HR_PROCESSING` handler (produces `PAYROLL_PROCESSING`), HR-processing completeness query, re-approval state, HR date correction in HR-controlled stages. |
| SPEC-011 | Document upload/validation/storage/scoped download for completion evidence. |
| SPEC-012 | Template/dispatch for the events emitted here. |
| SPEC-013 | Visibility of the audit events emitted here. |

Cross-spec contracts this SPEC needs (each stated as `[PROPOSED]` interface; to be confirmed at Gate 1 with SPEC-005/007/008/010/011 authors):
1. **Entry hooks** `[PROPOSED]` [RECONCILED R-6: SPEC-007 FR-007.30 now provides this API]: `WorkflowEngine.registerOnEnter(status, hook(trx, transfer, ctx))`, executed inside the transition transaction after the status row is updated. If SPEC-007 does not provide entry hooks, SPEC-008's `COMPLETE_HR_PROCESSING` handler instead calls `PayrollService.openActivity(...)` and this SPEC's `MARK_PAYROLL_COMPLETED` handler calls `ItTaskService.createOnEntry(...)` directly (same transaction either way).
2. `TaskAssignmentService` (SPEC-007) exposing `setPendingOwner(trx, transferId, stageGroup, userId)` and `isCurrentAssignee(trx, transferId, userId)`.
3. `ApprovalHistoryQuery.requiredApprovalsComplete(trx, transferId)` (SPEC-007) and `HrProcessingQuery.isComplete(trx, transferId)` (SPEC-008) used by the gate.
4. SPEC-010 calls `PayrollService.cancelOpenActivity` and `ItTaskService.cancelOpenTasks` on Cancel/Withdraw/Reject and `ItTaskService.applyReassignment` on Reassign. [RECONCILED R-7] SPEC-010 uses exactly these names: `PayrollService.cancelOpenActivity(trx, transferId)`, `ItTaskService.cancelOpenTasks(trx, transferId)`, `ItTaskService.applyReassignment(trx, transferId, newUserId)`; they are registered as `onTerminate` hooks (cancel) / called by the SPEC-010 REASSIGN service. HR-staged payroll reference interface: SPEC-008 HR activity `payload.payrollReference` (staged during HR_PROCESSING) is copied by `PayrollService.openActivity` on entry to PAYROLL_PROCESSING (TDD-008.11).
5. [RECONCILED, confirmed in SPEC-008 FR-008.80 and its date-correction endpoint] SPEC-008's effective-date correction endpoint accepts `PAYROLL_PROCESSING` (HR-controlled) so HR can fix an expired date there; this SPEC only adds the Super Admin path for IT-controlled stages.

## 5. Enables

| Enables | How |
|---|---|
| SPEC-010 | Block/Resume/Cancel/Reassign operate on stages and records defined here. |
| SPEC-012 / SPEC-013 | Event codes in §18/§19. |
| SPEC-014 | HR payroll worklist, IT work queue, overdue visibility data sources. |
| SPEC-015 | Source-of-truth ownership for Payroll reference; in-flight snapshot use at completion. |
| SPEC-016 | End-to-end UAT: IT "No Action Required" completion, final completion; negative scenarios. |

## 6. Roles & Scope

| Role | Payroll | IT work | IT Final Approval | Effective-date correction (this SPEC) |
|---|---|---|---|---|
| HR | View/save/complete for transfers in own scope, stage `PAYROLL_PROCESSING`, as current HR assignee `[DERIVED from BRD-035]` | No access | No | No (HR corrects in HR stages via SPEC-008) |
| IT | No access (can see only a boolean "payroll complete" in readiness) | View/act on tasks assigned to it, in its location scope, stage `PENDING_IT_ACTION` | Yes, as current IT assignee, in scope, stage `PENDING_IT_FINAL_APPROVAL` | No |
| Super Admin | View all | View all (read-only here; acts through reassign/block/cancel SPEC-010) | **No** — IT Final Approval is an IT action `[DERIVED BRD-027 matrix: Action By = IT]` | Yes, in `PENDING_IT_ACTION`, `PENDING_IT_FINAL_APPROVAL` (and `BLOCKED` whose stored pre-block status is one of these) |
| Employee | None | None | None | None |
| Reporting Manager / Receiving Manager | None | None | None | None |

Stage groups `[BRD-027]`: HR-controlled = PENDING_HR_REVIEW, HR_PROCESSING, PAYROLL_PROCESSING; IT-controlled = PENDING_IT_ACTION, PENDING_IT_FINAL_APPROVAL.

---

## 7. Functional Requirements

### 7.1 Payroll Processing

| ID | Requirement | Tag |
|---|---|---|
| FR-009.01 | Payroll Processing is entered only from `HR_PROCESSING` via `COMPLETE_HR_PROCESSING` (SPEC-008). HR Processing and Payroll Processing are sequential; no Payroll action is accepted while the transfer is in `PENDING_HR_REVIEW`, `HR_PROCESSING` or `PENDING_RECEIVING_MANAGER_REAPPROVAL`. | [BRD-027(b)] [BRD-OQ-14] |
| FR-009.02 | On entering `PAYROLL_PROCESSING`, exactly one `payroll_activities` row exists for the transfer (created, or opened if one was staged earlier), status `PENDING`, `opened_at` set, in the same transaction as the status change. | [DERIVED from BRD-027(c)] / row design [PROPOSED] |
| FR-009.03 | The portal does **not** calculate payroll, compensation or statutory amounts and exposes **no** Payroll API, webhook, callback or import endpoint. The only way to complete the Payroll activity is the manual HR action in FR-009.10. | [BRD-027(c)] [BRD-OQ-14(c)] |
| FR-009.04 | The Payroll activity records: status, completed by, completion date/time, Payroll reference (where applicable), remarks/comments (where applicable). | [BRD-027(c)] |
| FR-009.05 | On opening, the system notifies the authorised HR user (event `PAYROLL_TASK_ASSIGNED`, Email + In-app). | [BRD-036] |
| FR-009.06 | "Authorised HR user" = user with role `HR`, whose organisation/location scope covers the transfer (via `ScopeResolver`), who is the current HR assignee in `transfer_task_assignments`. Super Admin reassignment (SPEC-010) changes the assignee; the previous assignee can no longer act. Whether any in-scope HR (not only the assignee) may complete is TDD-009.01. | [DERIVED BRD-035/BRD-026] / [TDD-REQUIRED] |
| FR-009.07 | While `PAYROLL_PROCESSING`, the authorised HR user may save/update the Payroll reference and remarks without completing (`PATCH`). Each save is audited with previous/new value. | [PROPOSED] (BRD-020 "assign applicable payroll reference") |
| FR-009.08 | Payroll reference **format** (length, character set, mandatory/optional, uniqueness) is not defined by the BRD. Default: optional, 1–50 chars, `^[A-Za-z0-9][A-Za-z0-9._/\-]{0,49}$`, no uniqueness constraint. | [TDD-REQUIRED] TDD-009.02 |
| FR-009.09 | Remarks are free text, max 1000 chars `[PROPOSED]`, sanitised (strip control characters, HTML escaped on output). | [PROPOSED] |
| FR-009.10 | **Mark Payroll Activity Completed** (`MARK_PAYROLL_COMPLETED`): `PAYROLL_PROCESSING → PENDING_IT_ACTION`. Records `status=COMPLETED`, `completed_by`, `completed_at` (server time, UTC), reference, remarks. Reason not required; remarks recorded where applicable. | [BRD-027 matrix] |
| FR-009.11 | The completion action, the status change, the history row, the audit event `PAYROLL_COMPLETED`, the creation of the IT task and assignment (FR-009.20–FR-009.23) and the notification outbox rows commit in **one** transaction; any failure rolls back all of them and the transfer stays in `PAYROLL_PROCESSING`. | [BRD-027] [BRD-038] |
| FR-009.12 | Repeating the action on a transfer already past `PAYROLL_PROCESSING` returns 403 `INVALID_WORKFLOW_TRANSITION` (BRD message), status unchanged, attempt audited as a security event by the engine. | [BRD-OQ-14(d)] |
| FR-009.13 | If the transfer is `BLOCKED` (SPEC-010), Payroll save/complete are refused with 403 `INVALID_WORKFLOW_TRANSITION`; resume restores `PAYROLL_PROCESSING` with the open Payroll activity unchanged. | [BRD-027 Block] |
| FR-009.14 | Payroll data (reference/remarks) are portal data only; nothing is sent to an external payroll or HR system. Employee, Reporting/Receiving Manager and IT cannot read the Payroll reference/remarks. | [BRD-OQ-19(d)] [BRD-029] [NFR-007] |
| FR-009.15 | If the transfer is cancelled/withdrawn/rejected, `PayrollService.cancelOpenActivity` sets the activity `CANCELLED` (not deleted), same transaction as the engine transition (called by SPEC-010/007). | [BRD-027 Cancel "pending Payroll/IT tasks cancelled"] |
| FR-009.16 | HR read endpoints: per-transfer Payroll view, and a scoped Payroll worklist (pending items, filter by status/location/date). | [BRD-013] [PROPOSED] |

### 7.2 IT task creation and assignment

| ID | Requirement | Tag |
|---|---|---|
| FR-009.20 | On entering `PENDING_IT_ACTION` the system creates one initial `it_tasks` row (status `NOT_STARTED`, task type unset) as the assignment anchor, in the same transaction as the Payroll completion. | [BRD-014] / granularity [TDD-REQUIRED] TDD-009.04 |
| FR-009.21 | **Location-routed assignment:** the IT user is chosen among active IT users whose location scope (SPEC-003) includes the routing location. | [BRD-014] [BRD-016] |
| FR-009.22 | Routing location: the employee's **target (post-transfer) location** from the Transfer Request values (equal to current location when unchanged). BRD says only "location/workflow routed". | [TDD-REQUIRED] TDD-009.03 |
| FR-009.23 | Selection among multiple eligible IT users: default = (1) employee's configured assigned IT user (`employee_profiles.assigned_it_user_id`) if active and in scope; else (2) the eligible user with the fewest open IT tasks (`NOT_STARTED/IN_PROGRESS/BLOCKED`), ties by lowest user id. The BRD defines no selection rule. | [TDD-REQUIRED] TDD-009.05 |
| FR-009.23a | If no eligible active IT user exists, the task is created with `assigned_to_user_id = NULL`, the transfer still enters `PENDING_IT_ACTION` (the workflow is not failed), the condition is logged and audited (`IT_TASK_ASSIGNMENT_UNRESOLVED`) and surfaced to Super Admin via dashboards (SPEC-014); only a Super Admin reassignment (SPEC-010) resolves it. No IT user may act on an unassigned task. | [PROPOSED] TDD-009.06 |
| FR-009.24 | The assignee is written to SPEC-007's `transfer_task_assignments` (authoritative pending owner for the IT stage group) and mirrored in `it_tasks.assigned_to_user_id` in the same transaction; authorisation reads the assignments table. | [PROPOSED] |
| FR-009.25 | On assignment the assignee gets `IT_TASK_ASSIGNED` (Email + In-app). | [BRD-036] |
| FR-009.26 | After Super Admin reassignment (SPEC-010), `ItTaskService.applyReassignment(trx, transferId, newUserId)` updates all non-final `it_tasks` of that transfer and sends `IT_TASK_ASSIGNED` to the new assignee; old assignee keeps read access to history only. Workflow status unchanged. | [BRD-035] |

### 7.3 IT work queue and least-privilege projection

| ID | Requirement | Tag |
|---|---|---|
| FR-009.30 | IT work queue lists only tasks whose assignee is the caller and whose transfer is within the caller's IT location scope; Super Admin may list all. | [BRD-014] [BRD-026] |
| FR-009.31 | **Field-level projection (least privilege):** the IT DTO is built from an explicit allowlist and never from a full transfer/employee object. Default allowlist: task id/status/type/description, transfer reference, employee ID, employee name, official email, current department/BU, designation, location, proposed department/BU, designation, location, effective transfer date (+ `effectiveDateExpired` boolean), reporting manager name (target), task comments/evidence for the task. **Excluded**: transfer reason, rejection/clarification text, approver comments, HR remarks, Payroll reference/remarks, vacancy details, documents other than this task's evidence, audit history, other employees' data. The exact allowlist is not defined by the BRD. | [BRD-014] [NFR-007] / exact fields [TDD-REQUIRED] TDD-009.07 |
| FR-009.32 | Projection is enforced in the backend DTO mapper (`it-task.projection.ts`) with a unit test that fails if a non-allowlisted field appears; the frontend is never relied on to hide fields. | [BRD-026] |
| FR-009.33 | Out-of-scope, unassigned-to-caller or non-existent task requests return 403 (no existence leakage). | [BRD-026] [PROPOSED] |

### 7.4 IT task execution

| ID | Requirement | Tag |
|---|---|---|
| FR-009.34 | IT task types catalogue `it_task_types`: categories `ACCESS_PROVISIONING`, `ACCESS_REMOVAL`, `ACCESS_MODIFICATION`, `DEVICE_ASSET` seeded (the four activities named in BRD-014). A finer catalogue (e.g. specific systems/device kinds) is not defined by the BRD. | [BRD-014] seeds [DERIVED]; finer catalogue [TDD-REQUIRED] TDD-009.08 |
| FR-009.35 | The assigned IT user classifies the initial task (sets type) and may add further tasks for the same transfer (`POST`), each with type + description (max 500). | [PROPOSED] |
| FR-009.36 | Task statuses: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED`, `CANCELLED`. IT-markable: In Progress, Completed, Blocked(with reason). `CANCELLED` is system-set only (No IT Action Required, or SPEC-010 cancel). | [BRD-014] / codes [PROPOSED] |
| FR-009.37 | Allowed task transitions: `NOT_STARTED→IN_PROGRESS`; `NOT_STARTED/IN_PROGRESS→BLOCKED`; `BLOCKED→IN_PROGRESS` (unblock, remarks recorded); `IN_PROGRESS→COMPLETED`; `NOT_STARTED→COMPLETED` is refused (must start first). `COMPLETED` is terminal. | [PROPOSED] |
| FR-009.38 | **Blocked with reason:** reason mandatory (1–500 chars); stores `blocked_reason`, `blocked_by`, `blocked_at`; emits `TASK_BLOCKED` to the Employee and relevant assigned users; audited. A task-level block does **not** change the transfer status. The transfer-level IT **Block** action (status `BLOCKED`, previous status stored) is registered in SPEC-010. Whether a task-level block should automatically trigger the transfer-level Block is TDD-009.09 (default: no, manual). | [BRD-014] [BRD-036] / [TDD-REQUIRED] |
| FR-009.39 | **Comments:** append-only `it_task_comments`; assignee (and Super Admin read-only) in stages `PENDING_IT_ACTION` and `PENDING_IT_FINAL_APPROVAL`; text 1–2000, sanitised; never edited or deleted. | [BRD-014] / append-only [PROPOSED] |
| FR-009.39a | **Completion evidence:** attached to a task via `it_task_evidence` referencing a SPEC-011 `documents` row (category `IT_COMPLETION_EVIDENCE`), subject to BRD-021 rules (PDF/image, 5 MB, MIME+extension, sanitised name, authenticated scoped download, audited). An optional text note accompanies it. Whether evidence is mandatory to complete a task, and whether text-only evidence is acceptable, is not defined. Default: optional; at least a completion note **or** evidence file recommended but not enforced. | [BRD-014] [BRD-021] / mechanism [TDD-REQUIRED] TDD-009.10 |
| FR-009.39b | Marking a task `COMPLETED` records `completed_by`, `completed_at`, optional completion note; requires task type set. | [BRD-014] |

### 7.5 IT outcomes

| ID | Requirement | Tag |
|---|---|---|
| FR-009.40 | **Complete IT Tasks** (`COMPLETE_IT_TASKS`): `PENDING_IT_ACTION → PENDING_IT_FINAL_APPROVAL`. Preconditions: at least one non-cancelled task; every non-cancelled task `COMPLETED`; none `BLOCKED`/`IN_PROGRESS`/`NOT_STARTED`. Writes `it_stage_outcomes(outcome='TASKS_COMPLETED')`. | [BRD-027 matrix] |
| FR-009.41 | **No IT Action Required** (`NO_IT_ACTION_REQUIRED`): `PENDING_IT_ACTION → PENDING_IT_FINAL_APPROVAL`. A reason/remark is mandatory (1–500). Allowed only if no task is `IN_PROGRESS`, `COMPLETED` or `BLOCKED`; remaining `NOT_STARTED` tasks (e.g. the initial anchor) are set `CANCELLED` with cancel reason `NO_IT_ACTION_REQUIRED`. Writes `it_stage_outcomes(outcome='NO_IT_ACTION_REQUIRED', reason)`. | [BRD-027 matrix] [BRD-014] [BRD-OQ-11] |
| FR-009.42 | Both outcomes are IT-assignee actions in scope. Neither approves the transfer; IT Final Approval remains a separate, mandatory action. | [BRD-OQ-11] |
| FR-009.43 | On either outcome the pending owner for `PENDING_IT_FINAL_APPROVAL` is the same IT assignee; the assignee receives `APPROVAL_REQUIRED` (Email + In-app); Employee/relevant users notified per matrix (`IT_TASKS_COMPLETED` / `NO_IT_ACTION_REQUIRED_RECORDED`). | [BRD-027] [BRD-036] |
| FR-009.44 | Outcome, status change, history, audit, assignment update, notification outbox rows: one transaction. | [BRD-038] |
| FR-009.45 | There is no "return to IT Action" transition after an outcome; no row exists in BRD-027. IT's recourse in `PENDING_IT_FINAL_APPROVAL` is the SPEC-010 Block. This SPEC introduces no backward transition. | [DERIVED from BRD-027 matrix] |
| FR-009.46 | Whether the IT Final Approval must be given by a different IT user than the task executor (maker-checker) is not stated. Default: not required. | [TDD-REQUIRED] TDD-009.11 |

### 7.6 IT Final Approval and completion gate

| ID | Requirement | Tag |
|---|---|---|
| FR-009.50 | **IT Final Approval is mandatory for every transfer.** `IT_FINAL_APPROVE`: `PENDING_IT_FINAL_APPROVAL → COMPLETED`, by the IT assignee, in scope. No other action, role or configuration can set `COMPLETED`. | [BRD-014] [BRD-019] [BRD-027] |
| FR-009.51 | `CompletionGateService.evaluate(trx, transferId)` checks the five BRD-027 conditions plus the effective-date rule (below). It is executed inside the completion transaction after the transfer row is locked. | [BRD-027 completion rule] |
| FR-009.52 | **Condition 1** — all mandatory manager/HR approvals complete: the set of required approvals is derived from the stages the transfer was actually routed through (Reporting Manager; Receiving Manager if that stage applied; HR validate/approve; and, if a BRD-024 re-approval was triggered, its latest decision is Approved with none pending). Provided by `ApprovalHistoryQuery` (SPEC-007). | [BRD-027(1)] [BRD-024] |
| FR-009.53 | **Condition 2** — required HR organisation activities complete: `HrProcessingQuery.isComplete` (HR Processing completed incl. HR confirmation; no unresolved org change). | [BRD-027(2)] |
| FR-009.54 | **Condition 3** — mandatory Payroll complete: `payroll_activities.status = 'COMPLETED'` with `completed_by`/`completed_at` non-null. Failure → `PAYROLL_INCOMPLETE`. A transfer whose Payroll could be non-mandatory is not defined by BRD (TDD-009.12; default: always mandatory). | [BRD-027(3)] [BRD-014] / [TDD-REQUIRED] |
| FR-009.55 | **Condition 4** — IT complete or No IT Action Required: an `it_stage_outcomes` row exists and, for `TASKS_COMPLETED`, no non-cancelled task is non-completed. | [BRD-027(4)] |
| FR-009.55a | **Condition 5** — IT Final Approval: satisfied by recording `it_final_approvals` inside the same transaction, only when conditions 1–4 and the date rule pass. | [BRD-027(5)] |
| FR-009.55b | **Premature approval prevention (defence in depth):** (a) the state machine only offers `IT_FINAL_APPROVE` from `PENDING_IT_FINAL_APPROVAL`, which is only reachable via IT outcomes, which are only reachable after Payroll completion → calls from any earlier stage get 403 `INVALID_WORKFLOW_TRANSITION`; (b) even in `PENDING_IT_FINAL_APPROVAL`, the gate re-verifies Payroll/HR/approval data, so data anomalies cannot yield Completed → 409 `COMPLETION_GATE_NOT_SATISFIED` with `details[]` naming each failed condition. | [BRD-027] [BRD-039] |
| FR-009.56 | **Completion transaction** (one DB transaction, see §17): lock transfer → authorise → gate → insert `it_final_approvals` → `VacancyService.finalizeAllocation` → `WorkflowEngine.transition(IT_FINAL_APPROVE→COMPLETED)` (history, `completed_at`, active flag cleared) → audit `IT_FINAL_APPROVED` + `TRANSFER_COMPLETED` → outbox `TRANSFER_COMPLETED` (employee + relevant stakeholders). Any exception rolls back everything: no approval row, vacancy still reserved, status still `PENDING_IT_FINAL_APPROVAL`. | [BRD-027] [BRD-028] [BRD-038] |
| FR-009.56a | **Employee profile update at completion** `[DECIDED 2026-10-07; TDD-004.11 = TDD-015.03]`: inside the FR-009.56 completion transaction, after `finalizeAllocation` and before the status change, the system updates the Employee's `employee_profiles` organisation fields (Dept/BU, Designation, Location, Reporting Manager and other approved transfer metadata) from the final approved values on the Transfer Request. Employee ID is unchanged. Failure of this step aborts the whole completion (transfer stays `PENDING_IT_FINAL_APPROVAL`). Audit event `EMPLOYEE_PROFILE_UPDATED_ON_TRANSFER` records previous/new value per field, transfer reference, system actor and timestamp. No manual profile update is required afterwards. | `[DECIDED]` TDD-004.11 |
| FR-009.57 | After a successful commit the transfer is **immutable through the normal workflow**: every transition endpoint returns 403 `INVALID_WORKFLOW_TRANSITION`; Payroll/IT/comment/evidence/date-correction endpoints are refused; DB triggers reject UPDATE/DELETE on this SPEC's tables for a completed transfer (§10.6). No reopen action exists. | [BRD-027 "Completed: no further normal transition"] [BRD-039] |
| FR-009.58 | The completion notification is asynchronous; delivery failure never rolls back or alters completion; retry never repeats the transition. | [BRD-036] [NFR-006] |
| FR-009.59 | A refused gate evaluation is itself audited (`IT_FINAL_APPROVAL_REFUSED`, in a separate transaction after rollback) with failed conditions. | [BRD-026] [PROPOSED] |

### 7.7 Effective-date expiry at completion

| ID | Requirement | Tag |
|---|---|---|
| FR-009.60 | The gate fails with `EFFECTIVE_DATE_EXPIRED` when `transfer_requests.effective_transfer_date < today` [RECONCILED name] evaluated in the application business time zone (`BUSINESS_TIME_ZONE`, SPEC-001 config). A date equal to today passes. | [BRD-031] [BRD-OQ-20(d)] |
| FR-009.61 | Corrections: HR in HR-controlled stages (SPEC-008). **Super Admin in `PENDING_IT_ACTION` and `PENDING_IT_FINAL_APPROVAL`** (and `BLOCKED` whose stored pre-block status is one of these) through this SPEC's endpoint. No other role. | [BRD-031] [BRD-OQ-20(d)] |
| FR-009.62 | The corrected date must satisfy `today ≤ date ≤ today + 30 calendar days` (inclusive), via the shared SPEC-006 validator; reason is mandatory; weekends/holidays allowed. | [BRD-031] |
| FR-009.63 | Audit `EFFECTIVE_DATE_CORRECTED_BY_ADMIN`: previous value, new value, changed by, role, date/time, reason. | [BRD-031] |
| FR-009.64 | If Super Admin has enabled date-change re-approval (SPEC-007 `workflow_configuration`), a correction is passed to SPEC-007's re-approval evaluator, which returns the configured stage/approver; this SPEC applies the returned transition atomically. How an IT-stage request routes back to an earlier configured stage and how IT tasks behave then is not defined. Default behaviour while the toggle is off: no status change. | [BRD-031] / interaction [TDD-REQUIRED] TDD-009.13 |
| FR-009.65 | The IT work queue and detail show `effectiveDateExpired` as an informational warning; no IT action other than Final Approval is blocked by it. | [PROPOSED] |

### 7.8 Completion readiness view

| ID | Requirement | Tag |
|---|---|---|
| FR-009.66 | `GET completion-readiness` returns the five conditions and the date check as booleans with a short reason code. IT receives booleans only (no payroll reference/remarks, no approver comments); HR/Super Admin may see the same booleans. | [BRD-014] [NFR-007] [PROPOSED] |

---

## 8. Internal Implementation Plan / Tasks

| Task | Title | Layer | Description | Inputs / outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-009.01 | Migration `payroll_activities` | DB | Create table, constraints, indexes (§10.1). | In: schema. Out: migration `…_create_payroll_activities`. | SPEC-001, SPEC-006 | BRD-027(c) |
| TASK-009.02 | Migration `it_task_types` + seed | DB | Table + seed four categories. | Out: migration + seeder. | TASK-009.01 | BRD-014 |
| TASK-009.03 | Migration `it_tasks`, `it_task_comments`, `it_task_evidence` | DB | Tables, checks, indexes (§10.3–10.5). | Out: migrations. | TASK-009.02, SPEC-011 | BRD-014 |
| TASK-009.04 | Migration `it_stage_outcomes`, `it_final_approvals` + immutability triggers | DB | Unique per transfer; completed-transfer guard triggers (§10.6). | Out: migrations. | TASK-009.03 | BRD-027, BRD-039 |
| TASK-009.05 | Sequelize models + repositories | BE | Models for all tables; repositories with `trx` params, `FOR UPDATE` helpers, no business logic. | Out: `backend/src/modules/payroll`, `…/it-processing` models/repos. | TASK-009.01–04 | — |
| TASK-009.06 | `PayrollService` | BE | `openActivity`, `stageReference`, `saveDraft`, `complete`, `cancelOpenActivity`, `getForTransfer`. | In: transfer, actor. Out: activity DTO. | TASK-009.05 | BRD-027(c) |
| TASK-009.07 | Payroll controllers/routes/validators/DTO | BE | APIs 12.1–12.4 with Joi validation, authz middleware. | Out: routes. | TASK-009.06, SPEC-002 | BRD-026, BRD-027 |
| TASK-009.08 | Register engine handlers + entry hooks | BE | Register `MARK_PAYROLL_COMPLETED`, `COMPLETE_IT_TASKS`, `NO_IT_ACTION_REQUIRED`, `IT_FINAL_APPROVE` with the transition registry; on-enter hooks for `PAYROLL_PROCESSING`, `PENDING_IT_ACTION`, `PENDING_IT_FINAL_APPROVAL`. | In: SPEC-007 registry API. | TASK-009.06, SPEC-007 | BRD-027 |
| TASK-009.09 | `ItAssignmentService` | BE | Location routing, selection among multiple IT users, unassigned handling, assignment write + mirror. | Out: assignee id/null. | TASK-009.05, SPEC-003/004 | BRD-014, BRD-016 |
| TASK-009.10 | `ItTaskService` | BE | `createOnEntry`, `addTask`, `classify`, `start`, `complete`, `block`, `unblock`, `cancelOpenTasks`, `applyReassignment`; optimistic version. | Out: task DTOs. | TASK-009.09 | BRD-014, BRD-035 |
| TASK-009.11 | IT projection + queue/detail APIs | BE | Allowlist DTO mapper, list/detail endpoints (12.5–12.7). | Out: routes. | TASK-009.10 | BRD-014, NFR-007 |
| TASK-009.12 | Comments + evidence | BE | Comment API; evidence attach via SPEC-011 `DocumentService`; scope checks. | Out: routes. | TASK-009.10, SPEC-011 | BRD-014, BRD-021 |
| TASK-009.13 | `COMPLETE_IT_TASKS` handler | BE | Preconditions + outcome row + notifications. | — | TASK-009.10, TASK-009.08 | BRD-027 |
| TASK-009.14 | `NO_IT_ACTION_REQUIRED` handler | BE | Reason, cancel unstarted tasks, outcome row. | — | TASK-009.10, TASK-009.08 | BRD-OQ-11 |
| TASK-009.15 | `CompletionGateService` | BE | Five conditions + date rule; pure evaluate + failure detail codes. | Out: `{ok, failures[]}`. | TASK-009.06, TASK-009.10 | BRD-027 |
| TASK-009.16 | `IT_FINAL_APPROVE` handler (completion transaction) | BE | Atomic completion incl. `finalizeAllocation`, audit, outbox; refused-attempt audit. | — | TASK-009.15, SPEC-005 | BRD-027, BRD-028 |
| TASK-009.17 | Super Admin effective-date correction | BE | API 12.17, validator reuse, re-approval hand-off. | — | TASK-009.15, SPEC-006/007 | BRD-031 |
| TASK-009.18 | Completion-readiness endpoint | BE | API 12.16 with boolean projection. | — | TASK-009.15 | BRD-014 |
| TASK-009.19 | Audit + notification wiring | BE | Emit all codes in §18/§19 through kernels, with payload field allowlists (no secrets). | — | TASK-009.06–16 | BRD-022, BRD-036 |
| TASK-009.20 | Immutability guard | BE/DB | Service-layer guard `assertNotFinal` + trigger verification harness. | — | TASK-009.04 | BRD-027, BRD-039 |
| TASK-009.21 | IT task-type catalogue admin API | BE | Super Admin list/create/activate-deactivate (12.18). | — | TASK-009.02 | BRD-014 |
| TASK-009.22 | FE: HR Payroll worklist + detail | FE | Pages, form, confirmation dialog. | — | TASK-009.07 | BRD-027(c), BRD-002 |
| TASK-009.23 | FE: IT work queue + task detail | FE | Queue table, detail panel (projected fields only). | — | TASK-009.11 | BRD-014 |
| TASK-009.24 | FE: task controls, comments, evidence | FE | Start/Block (reason dialog)/Unblock/Complete, thread, uploader. | — | TASK-009.12, TASK-009.23 | BRD-014 |
| TASK-009.25 | FE: outcome + final approval panel | FE | Readiness checklist, Complete IT Tasks / No IT Action Required / Final Approve dialogs. | — | TASK-009.13/14/16/18 | BRD-027 |
| TASK-009.26 | FE: Super Admin date correction + task-type admin page | FE | Dialog, admin page in admin shell. | — | TASK-009.17, TASK-009.21 | BRD-031 |
| TASK-009.27 | QA: unit tests | QA | Gate, projection, assignment, task state machine, validators. | — | TASK-009.06–21 | all |
| TASK-009.28 | QA: API/integration tests (payroll) | QA | AC01–AC08, NAC01–NAC05. | — | TASK-009.07 | BRD-027(c) |
| TASK-009.29 | QA: API/integration tests (IT) | QA | AC09–AC17, NAC09–NAC11. | — | TASK-009.11–14 | BRD-014 |
| TASK-009.30 | QA: completion + rollback tests | QA | Fault injection at each step; AC18–AC24, NAC12–NAC14. | — | TASK-009.16 | BRD-027 |
| TASK-009.31 | QA: concurrency tests | QA | §17 scenarios. | — | TASK-009.16 | BRD-038 |
| TASK-009.32 | QA: security/authorization matrix tests | QA | Role × scope × stage × assignee grids for every endpoint. | — | all BE | BRD-026, BRD-039 |
| TASK-009.33 | QA: frontend tests | QA | Component + route tests (§23). | — | TASK-009.22–26 | NFR-008 |
| TASK-009.34 | OpenAPI + developer docs | BE | Document all APIs/errors in `docs/openapi`. | — | TASK-009.07–18 | — |

Ordering: DB (01–04) → models (05) → services (06, 09, 10, 15) → handlers/registration (08, 13, 14, 16) → APIs (07, 11, 12, 17, 18, 21) → cross-cutting (19, 20) → FE (22–26) → QA (27–33) → docs (34). TDD: tests per TASK-009.27–32 are written RED before the corresponding BE tasks reach GREEN.

---

## 9. Business Rules

| # | Rule | Source |
|---|---|---|
| BR-1 | Status path is exactly `HR_PROCESSING → PAYROLL_PROCESSING → PENDING_IT_ACTION → PENDING_IT_FINAL_APPROVAL → COMPLETED`; no parallel Payroll. | BRD-027(a)(b) |
| BR-2 | Payroll completion is manual, by authorised HR; no calculation; no API/callback. | BRD-027(c) |
| BR-3 | No Completed on manager/HR/Payroll approval alone. | BRD-019, Business Rules |
| BR-4 | IT Final Approval mandatory for every transfer (with IT work: Complete IT Tasks → Final Approval; without: No IT Action Required → Final Approval). | BRD-014, BRD-OQ-11 |
| BR-5 | IT Final Approval is refused while a mandatory Payroll activity is incomplete. | BRD-027 |
| BR-6 | Completion requires the 5 conditions + non-expired effective date. | BRD-027, BRD-031 |
| BR-7 | IT sees only minimum employee/transfer information. | BRD-014 |
| BR-8 | Task-level Blocked requires a reason. | BRD-014 |
| BR-9 | Completion finalises the vacancy allocation atomically; any failure rolls back all. | BRD-028, BRD-038 |
| BR-10 | Completed transfers are immutable through the normal workflow; no reopen. | BRD-027, BRD-039 |
| BR-11 | Reassignment changes the assignee only; never bypasses IT Final Approval. | BRD-035 |
| BR-12 | Super Admin corrects expired date in IT stages; HR in HR stages; corrected date follows the 0..30-day rule. | BRD-031 |
| BR-13 | The previous assignee cannot act after reassignment. | BRD-035 |
| BR-14 | Notification failure never affects the transaction. | BRD-036 |

## 10. Data Model & Database

Conventions: UUID PKs (`gen_random_uuid()`), `created_at/updated_at timestamptz`, FKs `ON DELETE RESTRICT`, all timestamps stored UTC `[PROPOSED]`. Users referenced by `users.id` (SPEC-002/004). Table/column names `[PROPOSED]`.

### 10.1 `payroll_activities`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| transfer_id | uuid | NOT NULL, FK `transfer_requests(id)`, **UNIQUE** |
| status | varchar(16) | NOT NULL, CHECK IN (`PENDING`,`COMPLETED`,`CANCELLED`), default `PENDING` |
| is_mandatory | boolean | NOT NULL default true (see TDD-009.12) |
| opened_at | timestamptz | NULL until `PAYROLL_PROCESSING` entered |
| payroll_reference | varchar(50) | NULL; format TDD-009.02 |
| remarks | varchar(1000) | NULL |
| completed_by | uuid | FK `users(id)`, NULL |
| completed_at | timestamptz | NULL |
| cancelled_at / cancel_reason | timestamptz / varchar(200) | NULL |
| version | integer | NOT NULL default 0 (optimistic) |
| created_at / updated_at | timestamptz | NOT NULL |

Check: `status='COMPLETED' ⇒ completed_by IS NOT NULL AND completed_at IS NOT NULL`. Index: `(status, opened_at)`.

### 10.2 `it_task_types`

`id uuid PK`, `code varchar(40) UNIQUE NOT NULL`, `name varchar(100) NOT NULL`, `category varchar(24) NOT NULL CHECK IN ('ACCESS_PROVISIONING','ACCESS_REMOVAL','ACCESS_MODIFICATION','DEVICE_ASSET')`, `is_active boolean default true`, timestamps. Seed: one row per category, code = category.

### 10.3 `it_tasks`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| transfer_id | uuid | NOT NULL FK, index |
| task_type_id | uuid | NULL FK `it_task_types` (required before COMPLETED, enforced by CHECK `status<>'COMPLETED' OR task_type_id IS NOT NULL`) |
| description | varchar(500) | NULL |
| status | varchar(16) | NOT NULL CHECK IN (`NOT_STARTED`,`IN_PROGRESS`,`COMPLETED`,`BLOCKED`,`CANCELLED`) default `NOT_STARTED` |
| routing_location_id | uuid | NOT NULL FK locations (snapshot used for routing) |
| assigned_to_user_id | uuid | NULL FK users (mirror of assignments table) |
| started_at | timestamptz | NULL |
| blocked_reason / blocked_by / blocked_at | varchar(500) / uuid / timestamptz | CHECK `status<>'BLOCKED' OR (blocked_reason IS NOT NULL AND length(trim(blocked_reason))>0)` |
| completed_by / completed_at / completion_note | uuid / timestamptz / varchar(1000) | CHECK completed ⇒ by, at not null |
| cancel_reason | varchar(200) | NULL |
| version | integer | NOT NULL default 0 |
| created_at / updated_at | timestamptz | |

Indexes: `(assigned_to_user_id, status)`, `(transfer_id, status)`, `(routing_location_id, status)`.

### 10.4 `it_task_comments` (append-only)

`id`, `it_task_id FK`, `transfer_id FK`, `author_user_id FK`, `author_role varchar(20)`, `comment_text varchar(2000) NOT NULL`, `created_at`. Index `(it_task_id, created_at)`. No UPDATE/DELETE privilege granted to the app role (same strategy as the audit kernel `[PROPOSED]`).

### 10.5 `it_task_evidence`

`id`, `it_task_id FK`, `transfer_id FK`, `document_id uuid FK documents(id)` (SPEC-011) NULL, `note varchar(500) NULL`, `added_by FK users`, `created_at`. CHECK `document_id IS NOT NULL OR note IS NOT NULL`. Index `(it_task_id)`.

### 10.6 `it_stage_outcomes`, `it_final_approvals`, immutability

`it_stage_outcomes`: `id`, `transfer_id UNIQUE FK`, `outcome varchar(24) CHECK IN ('TASKS_COMPLETED','NO_IT_ACTION_REQUIRED')`, `reason varchar(500)` (CHECK required when NO_IT_ACTION_REQUIRED), `recorded_by FK`, `recorded_at`.
`it_final_approvals`: `id`, `transfer_id UNIQUE FK`, `approved_by FK`, `approved_at timestamptz`, `remarks varchar(500) NULL`, `gate_snapshot jsonb NOT NULL` (the five conditions + date check as evaluated, no personal data).
**Immutability trigger** `[PROPOSED]`: `BEFORE UPDATE OR DELETE` on `payroll_activities`, `it_tasks`, `it_task_comments`, `it_task_evidence`, `it_stage_outcomes`, `it_final_approvals` raises an exception when the parent `transfer_requests.status = 'COMPLETED'` (and for `it_final_approvals`, `it_stage_outcomes`, comments, evidence: always on UPDATE/DELETE). Complements, never replaces, the service-layer guard.

### 10.7 Cross-spec data touched (not owned)

`transfer_requests.status/effective_transfer_date/completed_at` (SPEC-006/007), `transfer_workflow_history` (SPEC-007), `transfer_task_assignments` (SPEC-007), `vacancy_reservations`/`vacancies` (SPEC-005, via `finalizeAllocation` only), `documents` (SPEC-011), `audit_logs`, notification outbox (SPEC-001).

## 11. Backend Implementation

Modules (layering per Backend-Architecture §2: route → middleware → validation → controller → service → repository):

```
backend/src/modules/payroll/        routes/, controllers/, services/payroll.service.ts, repositories/, validations/, dto/
backend/src/modules/it-processing/  routes/, controllers/, services/{it-task,it-assignment,completion-gate,it-outcome,it-final-approval,date-correction}.service.ts,
                                    repositories/, validations/, dto/it-task.projection.ts
backend/src/modules/it-processing/handlers/  mark-payroll-completed.handler.ts, complete-it-tasks.handler.ts, no-it-action-required.handler.ts, it-final-approve.handler.ts
backend/src/migrations/             2026…_009_*.ts
```

- Handlers implement SPEC-007's `TransitionHandler` contract `{action, from[], allowedRoles, authorize(ctx), validate(ctx), apply(trx, ctx)}` `[PROPOSED]`; the engine owns locking, status write, history, security-audit of invalid attempts.
- Controllers never touch models; services accept `{trx}` and never read `req`.
- `PayrollService.complete` and the four handlers are the only code that may change payroll/IT stage data and call the engine.
- Errors via SPEC-001 classes: `ForbiddenError` (403, incl. `INVALID_WORKFLOW_TRANSITION`), `ConflictError` (409), `ValidationError` (400), `NotFoundError`.
- Logging: structured logger, include `requestId`, `transferId`, `taskId`, `actorId`; never log payroll remarks content or evidence file names at info level `[PROPOSED]`.
- Configuration: `BUSINESS_TIME_ZONE` (IANA string, required, SPEC-001 loader). No hardcoded secrets.
- Date arithmetic uses a single `businessToday()` helper (SPEC-006) so the expiry check and the 0..30-day rule agree.

## 12. API Requirements

Base path `/api/v1`. Auth: bearer JWT on every endpoint (401 on missing/invalid/expired). Authorisation chain per BRD-026: Authenticated → Role → Scope → Resource → Action (+ stage, + assignee). Standard envelope (§Canonical). Unless stated, validation errors: 400 `VALIDATION_ERROR` with `details[{field,message}]`; wrong stage/action: 403 `INVALID_WORKFLOW_TRANSITION` ("The requested action is not permitted for the current transfer status."); out-of-scope/not permitted/non-existent: 403 `FORBIDDEN`.

### 12.1 `GET /transfers/:transferId/payroll` `[PROPOSED]`
Purpose: view Payroll activity. Auth: HR (in scope), Super Admin. Response 200: `{id, transferId, status, isMandatory, openedAt, payrollReference, remarks, completedBy:{id,name}, completedAt}`. Errors: 401, 403. IT/Employee/managers: 403.

### 12.2 `PATCH /transfers/:transferId/payroll`
Purpose: save reference/remarks without completing. Auth: HR, in scope, current assignee, stage `PAYROLL_PROCESSING`. Request: `{ "payrollReference": "string|null", "remarks": "string|null", "expectedVersion": 3 }`. Validation: reference per TDD-009.02 default regex; remarks ≤1000; at least one field; unknown fields rejected. Response 200: activity DTO. Errors: 400, 403 (`INVALID_WORKFLOW_TRANSITION` if stage differs), 409 `VERSION_CONFLICT`.

### 12.3 `POST /transfers/:transferId/payroll/complete`
Purpose: `MARK_PAYROLL_COMPLETED`. Auth: as 12.2. Request: `{ "payrollReference": "optional", "remarks": "optional", "expectedVersion": 3 }` (values merged into the activity before completion). Response 200: `{ "success": true, "data": { "transferId", "previousStatus":"PAYROLL_PROCESSING", "status":"PENDING_IT_ACTION", "payroll":{…}, "itTask":{"id","assignedTo":{"id","name"}|null} } }`. Errors: 400 validation; 403 not HR/scope/assignee or wrong stage; 409 `VERSION_CONFLICT`; 500 rolled back (status unchanged). Idempotency: second identical call → 403 `INVALID_WORKFLOW_TRANSITION`. No `/payroll/callback`, `/payroll/webhook`, `/payroll/import` routes exist.

### 12.4 `GET /payroll-activities`
Purpose: HR worklist. Auth: HR (own scope/assignee), Super Admin (all). Query: `status` (PENDING|COMPLETED|CANCELLED), `locationId`, `page,pageSize,sort,order,q`. Response: paginated list of `{transferId, transferReference, employeeId, employeeName, status, openedAt, locationId}`. No Payroll remarks in list.

### 12.5 `GET /it/task-types`
Auth: IT, Super Admin. Response: active catalogue `[{id,code,name,category}]` (Super Admin may add `?includeInactive=true`).

### 12.6 `GET /it/tasks`
Purpose: IT work queue. Auth: IT (own assigned tasks in own scope), Super Admin (all). Query: `status`, `transferReference`, `page,pageSize,sort,order,q`. Response items (projected, FR-009.31): `{taskId, status, taskType, transferReference, employee:{employeeId,name,officialEmail}, current:{department,designation,location}, proposed:{department,designation,location}, effectiveDate, effectiveDateExpired, createdAt}`. Errors 401/403. Unassigned tasks only for Super Admin.

### 12.7 `GET /it/tasks/:taskId`
Auth: assignee IT in scope (also previously assigned IT: history read only → `readOnly:true`), Super Admin. Response: projected detail + `comments[]`, `evidence[]` (`{id, documentId, note, addedBy, createdAt}`), `allowedActions[]` computed by backend (UI hint only). Errors 403.

### 12.8 `POST /it/transfers/:transferId/tasks`
Purpose: add an IT task. Auth: assignee IT, stage `PENDING_IT_ACTION`. Request `{ "taskTypeCode": "ACCESS_PROVISIONING", "description": "string ≤500" }`. Validation: type active; description required for added tasks. Response 201 task DTO. Errors 400, 403. No per-transfer task limit is defined `[PROPOSED]`.

### 12.9 `PATCH /it/tasks/:taskId`
Classify/update `{taskTypeCode?, description?, expectedVersion}` while status `NOT_STARTED|IN_PROGRESS|BLOCKED`. Auth as 12.8. 409 `VERSION_CONFLICT`.

### 12.10 `POST /it/tasks/:taskId/start`
`NOT_STARTED|… → IN_PROGRESS` per FR-009.37. Auth as 12.8. Request `{expectedVersion}`. 200 task DTO. Illegal task transition: 409 `INVALID_TASK_STATE`.

### 12.11 `POST /it/tasks/:taskId/block`
Request `{ "reason": "1..500", "expectedVersion" }`. Emits `TASK_BLOCKED`. Errors 400 (missing reason), 403, 409.

### 12.12 `POST /it/tasks/:taskId/unblock`
Request `{ "remarks": "1..500", "expectedVersion" }` → `IN_PROGRESS`.

### 12.13 `POST /it/tasks/:taskId/complete`
Request `{ "completionNote": "≤1000 optional", "expectedVersion" }`. Requires status `IN_PROGRESS` and type set (`400 IT_TASK_TYPE_REQUIRED`). Records completed_by/at.

### 12.14 `GET|POST /it/tasks/:taskId/comments`
POST `{ "text": "1..2000" }` → 201. GET paginated, oldest first. Auth: assignee/former assignee (read), Super Admin (read). No PUT/DELETE routes.

### 12.15 `POST|GET /it/tasks/:taskId/evidence`
POST multipart `{file?, note?}` → delegates validation/storage to SPEC-011 (errors verbatim: 413 `FILE_SIZE_EXCEEDED`, 415 `UNSUPPORTED_FILE_TYPE`, 415 `INVALID_FILE_TYPE`; invalid file not stored; no evidence row created). Download only through the SPEC-011 scoped endpoint; no public URLs. At least `file` or `note`.

### 12.16 `GET /transfers/:transferId/completion-readiness`
Auth: IT (assignee, scope), HR (scope), Super Admin. Response: `{ "conditions": { "approvalsComplete": true, "hrActivitiesComplete": true, "payrollComplete": true, "itOutcomeRecorded": false, "itFinalApprovalGiven": false }, "effectiveDate": {"expired": false}, "ready": false }` booleans only.

### 12.17 `POST /transfers/:transferId/it/complete-tasks` and `POST /transfers/:transferId/it/no-action-required`
Auth: assignee IT in scope, stage `PENDING_IT_ACTION`. Complete: request `{ "remarks": "optional ≤500" }`; refusal when tasks incomplete: 409 `IT_TASKS_INCOMPLETE` with `details[{taskId,status}]`. No-action: `{ "reason": "1..500", "remarks"? }`; 400 `VALIDATION_ERROR` if reason absent; 409 `IT_WORK_ALREADY_RECORDED`. Response 200: `{transferId, previousStatus:"PENDING_IT_ACTION", status:"PENDING_IT_FINAL_APPROVAL", outcome}`.

### 12.18 `POST /transfers/:transferId/it/final-approve`
Purpose: `IT_FINAL_APPROVE`. Auth: IT, in scope, current assignee, stage `PENDING_IT_FINAL_APPROVAL`. Request `{ "remarks": "optional ≤500" }`. Response 200: `{transferId, previousStatus:"PENDING_IT_FINAL_APPROVAL", status:"COMPLETED", completedAt, approvedBy}`. Errors: 401; 403 wrong role/scope/not assignee/Super Admin/stage (`INVALID_WORKFLOW_TRANSITION`); 409 `COMPLETION_GATE_NOT_SATISFIED` with `details:[{condition:"PAYROLL_INCOMPLETE|APPROVALS_INCOMPLETE|HR_ACTIVITIES_INCOMPLETE|IT_OUTCOME_MISSING|EFFECTIVE_DATE_EXPIRED", message}]`; 409 `VACANCY_FINALISATION_FAILED` (propagated from SPEC-005) — all with full rollback; 500 on unexpected failure with rollback.

### 12.19 `PATCH /transfers/:transferId/effective-date/admin-correction`
Purpose: Super Admin corrects an expired/incorrect date in IT stages and (as the single Super Admin date route for the whole workflow) in any other non-final stage; executes the engine action `CHANGE_EFFECTIVE_DATE` through SPEC-008 `TransferDateService` (one implementation; HR uses SPEC-008 `PATCH /hr/transfers/:id/effective-date` for HR-controlled stages) [RECONCILED R-9/R-11]. Auth: Super Admin; stage per FR-009.61. Request `{ "effectiveDate": "YYYY-MM-DD", "reason": "1..500", "expectedVersion" }`. Validation: shared date rule (today..today+30 inclusive in business TZ), reason mandatory. Response 200 `{transferId, previousEffectiveDate, effectiveDate, reapprovalTriggered:boolean}` (true only when SPEC-007 date-change re-approval is enabled, FR-009.64) [RECONCILED was fixed false]. Errors 400 `EFFECTIVE_DATE_OUT_OF_RANGE`, 403, 409 `VERSION_CONFLICT`.

### 12.20 `GET|POST|PATCH /admin/it-task-types`
Super Admin only `[PROPOSED]`: list; create `{code,name,category}`; `PATCH {name?, isActive?}`. Deactivation never alters existing tasks. Unique `code` → 409 `IT_TASK_TYPE_EXISTS`. Audit `IT_TASK_TYPE_CHANGED`.

## 13. Frontend Implementation

Next.js App Router + Tailwind; role-aware nav (SPEC-003); frontend restrictions are UX only, backend authoritative (BRD-026). All screens: loading, empty, no-access, error states; responsive desktop/tablet; keyboard-accessible dialogs (BRD-002, NFR-008).

| Route | Role | Content |
|---|---|---|
| `frontend/src/app/(portal)/hr/payroll/page.tsx` | HR | Payroll worklist (12.4), status badge, search/filter, pagination. |
| `frontend/src/app/(portal)/hr/payroll/[transferId]/page.tsx` | HR | Payroll detail form: reference, remarks, "Mark Payroll Completed" (confirmation dialog stating the portal does not process payroll and the action is audited and moves the transfer to IT). Read-only once completed or when not the assignee. |
| `frontend/src/app/(portal)/it/tasks/page.tsx` | IT | Work queue (12.6). |
| `frontend/src/app/(portal)/it/tasks/[taskId]/page.tsx` | IT | Projected employee/transfer panel, task controls, comments, evidence, outcome and final-approval panels. |
| `frontend/src/app/(portal)/admin/it-task-types/page.tsx` | Super Admin | Catalogue management. |
| Super Admin transfer detail (SPEC-003/014 page) | Super Admin | "Correct effective date" dialog shown only for IT stages. |

Components under `frontend/src/components/payroll/` (`PayrollForm`, `PayrollCompleteDialog`, `PayrollWorklistTable`) and `frontend/src/components/it-processing/` (`ItTaskQueueTable`, `ItTaskDetailPanel`, `ItTaskStatusControls`, `BlockReasonDialog`, `ItCommentThread`, `EvidenceUploader` (wraps SPEC-011 uploader; shows 413/415 messages), `ItOutcomePanel`, `ItFinalApprovalPanel`, `CompletionReadinessChecklist`, `EffectiveDateCorrectionDialog`).

Behaviour: buttons are shown from `allowedActions[]` returned by the backend; mandatory reason fields show inline validation; Final Approve is disabled with explanatory checklist when `ready=false`, but the backend remains authoritative; expired-date warning banner with message "The effective transfer date has passed. A Super Admin must correct it before final approval."; the UI never displays fields outside the IT allowlist; Payroll reference is not rendered in any non-HR/Super Admin view. State handled with server data (no client-side persistence of employee data).

## 14. Validation Rules

| Field | Rule |
|---|---|
| `transferId`, `taskId` | UUID |
| `payrollReference` | default `^[A-Za-z0-9][A-Za-z0-9._/\-]{0,49}$` or null (TDD-009.02) |
| `remarks` (payroll) | ≤1000, control chars stripped |
| `reason` (block / no-action / date correction) | required, trimmed length 1–500 |
| `comment.text` | trimmed 1–2000 |
| `taskTypeCode` | exists, `is_active` |
| `description` | ≤500 |
| `completionNote` | ≤1000 |
| `effectiveDate` | ISO `YYYY-MM-DD`; `today ≤ d ≤ today+30d` inclusive, business TZ; no weekend/holiday check |
| `expectedVersion` | integer ≥0 where applicable |
| evidence file | SPEC-011 rules: PDF/image, ≤5 MB, MIME+extension match, sanitised name |
| Any body | unknown fields rejected; strings sanitised; parameterised queries only (no string-built SQL) |

## 15. Authorization & Security Rules

Authorization matrix (backend; each row also requires authenticated, active account):

| Endpoint group | Role | Scope | Stage | Extra |
|---|---|---|---|---|
| Payroll save/complete | HR | transfer within HR scope | `PAYROLL_PROCESSING` | current HR assignee |
| Payroll read | HR, Super Admin | HR scope | any | — |
| IT task actions | IT | transfer within IT location scope | `PENDING_IT_ACTION` (comments also `PENDING_IT_FINAL_APPROVAL`) | assignee |
| IT outcomes | IT | same | `PENDING_IT_ACTION` | assignee |
| IT Final Approve | IT | same | `PENDING_IT_FINAL_APPROVAL` | assignee |
| IT queue/detail | IT / Super Admin | own assigned / all | n/a | projection |
| Date correction | Super Admin | all | IT stages (+ blocked-from-IT) | reason |
| Catalogue | Super Admin | — | — | — |

Security rules: (1) 401 vs 403 per BRD-026; (2) invalid transition → 403 `INVALID_WORKFLOW_TRANSITION` and security audit by engine; (3) denials never reveal employee data or existence; (4) Super Admin cannot IT-Final-Approve or mark Payroll complete (those actions are role-bound in the matrix; Super Admin interventions are Block/Cancel/Reassign/date correction); (5) projection allowlist enforced server-side; (6) evidence only through SPEC-011 authenticated endpoint; (7) payroll remarks and comments are stored and returned as text, output-encoded by the frontend, no HTML rendering; (8) audit payloads and logs exclude credentials/tokens; payroll remarks and comment text are not copied into audit payloads (only length and id) `[PROPOSED]`; (9) rate limiting from SPEC-001/002 on mutating endpoints.

## 16. Workflow / State Transition Rules

| Current | Actor | Action code | Next | Reason | Notifications (this SPEC) | Downstream |
|---|---|---|---|---|---|---|
| `PAYROLL_PROCESSING` | authorised HR | `MARK_PAYROLL_COMPLETED` | `PENDING_IT_ACTION` | No (remarks where applicable) | `IT_TASK_ASSIGNED` (assignee) | Payroll activity COMPLETED; IT task created + assigned |
| `PENDING_IT_ACTION` | IT | `COMPLETE_IT_TASKS` | `PENDING_IT_FINAL_APPROVAL` | No | `IT_TASKS_COMPLETED` (Employee/relevant), `APPROVAL_REQUIRED` (IT assignee) | outcome `TASKS_COMPLETED` |
| `PENDING_IT_ACTION` | IT | `NO_IT_ACTION_REQUIRED` | `PENDING_IT_FINAL_APPROVAL` | **Reason/remark recorded** | `NO_IT_ACTION_REQUIRED_RECORDED` (relevant), `APPROVAL_REQUIRED` | outcome `NO_IT_ACTION_REQUIRED`; unstarted tasks cancelled |
| `PENDING_IT_FINAL_APPROVAL` | IT | `IT_FINAL_APPROVE` | `COMPLETED` | No | `TRANSFER_COMPLETED` (Employee + relevant stakeholders) | gate passed; vacancy allocation finalised |
| `COMPLETED` | — | — | none | — | already sent | immutable |

Any other (status, role, action) combination → 403 `INVALID_WORKFLOW_TRANSITION`, status unchanged, no side effects, security audit. Registered with SPEC-007's registry; the registry's complete-matrix test (SPEC-007) must include these rows. Entry hooks run inside the transition transaction. `BLOCKED` ↔ resume: owned by SPEC-010; while `BLOCKED` none of the actions above is accepted. Completed: no transition of any kind.

## 17. Transaction & Concurrency Rules

1. Each action in §16 is one `withTransaction` (READ COMMITTED + explicit row locks) that also writes history, audit and outbox rows.
2. **Lock order** (deadlock avoidance): `transfer_requests` (`FOR UPDATE`) → `transfer_task_assignments` → `payroll_activities` / `it_tasks` (`FOR UPDATE`) → `vacancies` (ascending id) → `vacancy_reservations` [RECONCILED R-5 canonical, identical in 005/007/008/010] (locked inside SPEC-005 `finalizeAllocation`). All writers in SPEC-005/007/008/010 must follow the same order `[PROPOSED]`.
3. Task-level actions (start/block/comment/evidence) take `transfer_requests FOR SHARE` plus `it_tasks FOR UPDATE`, re-checking `status='PENDING_IT_ACTION'` after acquiring locks; a concurrent transition therefore either completes first (task action then gets 403) or waits.
4. Optimistic `version` on `payroll_activities` and `it_tasks`; mismatch → 409 `VERSION_CONFLICT`.
5. Uniqueness backstops: `payroll_activities.transfer_id`, `it_stage_outcomes.transfer_id`, `it_final_approvals.transfer_id` UNIQUE → a double click or two IT users completing simultaneously yields exactly one success; the loser re-reads status and returns 403 `INVALID_WORKFLOW_TRANSITION`.
6. **Completion atomicity:** the order in FR-009.56 is the contract; exceptions at any step (gate, insert, `finalizeAllocation`, engine, audit, outbox) abort the transaction. The refused-attempt audit and logging occur after rollback in a separate short transaction.
7. Notification delivery occurs after commit from the outbox; failure never touches the transfer (BRD-036). Retry is idempotent by outbox key `transferId:eventCode:recipientId` `[PROPOSED]`.
8. Concurrent Payroll-complete vs SPEC-010 Block/Cancel: serialised by the transfer lock; loser gets 403 `INVALID_WORKFLOW_TRANSITION`.
9. Concurrent final approval vs Super Admin date correction: both lock the transfer; the gate reads the date after the lock, so a correction committed first is honoured and a pending expiry is never bypassed.
10. Concurrent Reassign vs IT action: after the assignment row is changed the old assignee's next call fails the assignee check (BRD-035).

## 18. Audit Requirements

All through `AuditService.record(event,{trx})` (SPEC-001); fields always include actor id, role, entity (transfer id/reference, employee id), timestamp, previous/new status where applicable, remarks/reason. No passwords/tokens. Event codes `[PROPOSED]`.

| Event code | Trigger | Fields captured | BRD |
|---|---|---|---|
| `PAYROLL_ACTIVITY_OPENED` | enter PAYROLL_PROCESSING | transfer, assignee | BRD-022 |
| `PAYROLL_REFERENCE_SAVED` | PATCH payroll | previous/new reference, remarks length changed flag | BRD-022 |
| `PAYROLL_COMPLETED` | MARK_PAYROLL_COMPLETED | status prev/new, completed by, date/time, reference, remarks present | BRD-026, BRD-OQ-14(c) |
| `PAYROLL_ACTIVITY_CANCELLED` | cancel/withdraw/reject | reason, prior status | BRD-027 |
| `IT_TASK_CREATED` / `IT_TASK_ASSIGNED` | on entry / reassignment | task id, routing location, assignee, selection rule used | BRD-022 |
| `IT_TASK_ASSIGNMENT_UNRESOLVED` | no eligible IT user | location, reason | BRD-022 |
| `IT_TASK_ADDED`, `IT_TASK_UPDATED` | add/classify | type, description length | BRD-014 |
| `IT_TASK_STARTED`, `IT_TASK_COMPLETED` | task transitions | prev/new task status, completed by | BRD-014 |
| `IT_TASK_BLOCKED`, `IT_TASK_UNBLOCKED` | block/unblock | reason / remarks, by | BRD-014 |
| `IT_TASK_CANCELLED` | NO_IT_ACTION or cancel | reason | BRD-027 |
| `IT_TASK_COMMENT_ADDED` | comment | comment id, length | BRD-014 |
| `IT_TASK_EVIDENCE_ATTACHED` | evidence | document id, note present | BRD-014, BRD-021 |
| `IT_TASKS_COMPLETED` | COMPLETE_IT_TASKS | prev/new transfer status, task ids | BRD-027 |
| `NO_IT_ACTION_REQUIRED_RECORDED` | NO_IT_ACTION_REQUIRED | reason, prev/new status | BRD-027, BRD-OQ-11 |
| `IT_FINAL_APPROVED` | IT_FINAL_APPROVE | approver, gate snapshot, prev/new status | BRD-026, BRD-027 |
| `TRANSFER_COMPLETED` | same transaction | completed_at, vacancy id, allocation finalised flag | BRD-027, BRD-028 |
| `IT_FINAL_APPROVAL_REFUSED` | gate failed | failed conditions, attempted by | BRD-026 |
| `EFFECTIVE_DATE_CORRECTED_BY_ADMIN` | date correction | previous, new, changed by, role, reason, reapproval triggered | BRD-031, BRD-032 |
| `IT_TASK_TYPE_CHANGED` | catalogue change | code, before/after | BRD-022 |
| (engine) `INVALID_WORKFLOW_TRANSITION_ATTEMPT` | invalid attempt | user, role, transfer, current status, attempted action, reason | BRD-OQ-14(d) (SPEC-007 emits) |

## 19. Notification Requirements

Emitted via `NotificationService.enqueue(...,{trx})`; delivery/templates/retry by SPEC-012. Channels per BRD-036: Email + In-app.

| Event | Recipient | Channel | Trigger task | BRD |
|---|---|---|---|---|
| `PAYROLL_TASK_ASSIGNED` | Authorised HR (assignee) | Email + In-app | TASK-009.06/08 | BRD-036 |
| `IT_TASK_ASSIGNED` | Assigned IT user (on Payroll completion; on reassignment) | Email + In-app | TASK-009.10 | BRD-036, BRD-027 ("IT/relevant users notified") |
| `TASK_BLOCKED` (task-level) | Employee and relevant assigned user(s) with the reason | Email + In-app | TASK-009.10 | BRD-036 |
| `IT_TASKS_COMPLETED` | Employee / relevant users | Email + In-app | TASK-009.13 | BRD-027 matrix |
| `NO_IT_ACTION_REQUIRED_RECORDED` | Relevant users | Email + In-app | TASK-009.14 | BRD-027 matrix |
| `APPROVAL_REQUIRED` (IT Final Approval) | Assigned IT approver | Email + In-app | TASK-009.13/14 | BRD-036 `[DERIVED]` |
| `TRANSFER_COMPLETED` | Employee and relevant stakeholders | Email + In-app | TASK-009.16 | BRD-036, BRD-027 |

"Relevant users/stakeholders" recipients are not enumerated by the BRD: default proposal = Employee, Reporting Manager, assigned HR (TDD-009.14, relates to contract gap (i)). Notification failure never changes transfer state (BRD-036). IT Final Approval does not send a separate "Approval completed" notification because `TRANSFER_COMPLETED` supersedes it (to be confirmed, TDD-009.14).

## 20. Error & Edge Cases

| Case | Behaviour |
|---|---|
| HR completes Payroll twice / double click | One success; second 403 `INVALID_WORKFLOW_TRANSITION`. |
| Payroll completion succeeds but no IT user in location | Transfer enters `PENDING_IT_ACTION`, task unassigned, audited, Super Admin visibility; no IT can act until reassigned. |
| Routing location has IT users but all inactive/locked | Same as above. |
| Employee has assigned IT user who is now inactive | Fall back to rule (2) of TDD-009.05. |
| IT chooses No IT Action Required after starting a task | 409 `IT_WORK_ALREADY_RECORDED`. |
| Complete IT Tasks with one `BLOCKED` task | 409 `IT_TASKS_INCOMPLETE`. |
| Task completed without a type | 400 `IT_TASK_TYPE_REQUIRED`. |
| Evidence upload invalid | SPEC-011 errors (413/415); file not stored; no evidence row. |
| Final Approval with expired effective date | 409 `COMPLETION_GATE_NOT_SATISFIED` (`EFFECTIVE_DATE_EXPIRED`); Super Admin corrects; retry succeeds. |
| Super Admin corrects date outside 0..30 days | 400 `EFFECTIVE_DATE_OUT_OF_RANGE`; stored date unchanged. |
| `finalizeAllocation` fails (e.g. reservation missing/vacancy deleted) | Whole completion rolled back; 409 `VACANCY_FINALISATION_FAILED`; transfer stays `PENDING_IT_FINAL_APPROVAL`; audited refusal; HR/Super Admin resolve via SPEC-005/010 paths. |
| Audit write or outbox insert fails in completion | Entire transaction rolls back (audit is part of the transaction; BRD-037 forbids a state change without audit). |
| Notification dispatch fails after commit | Transfer remains Completed; failure logged; retry by SPEC-012. |
| Receiving Manager config toggled mid-flight | Gate uses stages the transfer actually traversed (SPEC-007 snapshot), not the current toggle. |
| Transfer `BLOCKED` while an IT task is `IN_PROGRESS` | Task retained unchanged; no IT action while blocked; resume restores. |
| Reassign IT task mid-way | Task keeps its status/comments; new assignee continues; old assignee read-only. |
| Cancel/Withdraw/Reject after tasks exist | Open Payroll activity and non-final IT tasks set `CANCELLED` (not deleted), audited. |
| Attempt to edit/delete comment, evidence, outcome | No route; DB privileges and triggers refuse. |
| Completed transfer targeted by any endpoint here | 403 `INVALID_WORKFLOW_TRANSITION` (writes) / read allowed per scope. |
| Clock/time-zone boundary near midnight | Expiry uses `businessToday()` evaluated after the lock; date equal to today passes. |

## 21. Acceptance Criteria

| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-009.AC01 | Given a transfer in `HR_PROCESSING` with HR Processing completed by SPEC-008 / When the engine moves it to `PAYROLL_PROCESSING` / Then one `payroll_activities` row (`PENDING`) exists and the authorised HR user receives `PAYROLL_TASK_ASSIGNED`. | BRD-027(b), BRD-036 |
| SPEC-009.AC02 | Given `PAYROLL_PROCESSING` and the assigned in-scope HR user / When they save reference and remarks / Then values are stored, an audit record shows previous/new, status stays `PENDING`. | BRD-027(c), BRD-020 |
| SPEC-009.AC03 | Given the same state / When the HR user marks Payroll completed / Then status becomes `PENDING_IT_ACTION`, payroll `COMPLETED` with completed by, completed at, reference, remarks recorded, and `PAYROLL_COMPLETED` is audited. | BRD-027(c) |
| SPEC-009.AC04 | Given completion above / Then an IT task exists, assigned by location routing, and the IT assignee receives `IT_TASK_ASSIGNED`, all committed together with the status change. | BRD-014, BRD-036 |
| SPEC-009.AC05 | Given a Payroll activity / When inspecting the API surface / Then no payroll calculation, callback, webhook or import route exists and Payroll can only be completed by the manual HR action. | BRD-027(c), BRD-OQ-14(c) |
| SPEC-009.AC06 | Given `PAYROLL_PROCESSING` / When Super Admin reassigns the HR task (SPEC-010) / Then the new HR can complete and the previous HR is refused 403. | BRD-035 |
| SPEC-009.AC07 | Given a Payroll reference not provided and not mandatory per default / When completed / Then completion succeeds with reference NULL and remarks as supplied. | BRD-027(c) "where applicable" |
| SPEC-009.AC08 | Given the Payroll step completes / When the sequence of statuses is read from history / Then it is `HR_PROCESSING → PAYROLL_PROCESSING → PENDING_IT_ACTION`, never parallel. | BRD-OQ-14(b) |
| SPEC-009.AC09 | Given Employee location A, target location B with two IT users in B / When the task is created / Then it is assigned per the selection rule (TDD-009.05 default) and the choice is recorded in the audit event. | BRD-014, BRD-016 |
| SPEC-009.AC10 | Given no eligible IT user / When the task is created / Then the transfer still enters `PENDING_IT_ACTION`, the task is unassigned, an unresolved-assignment event is audited and Super Admin can reassign. | BRD-035 |
| SPEC-009.AC11 | Given an IT user with assigned tasks / When opening the work queue / Then only own in-scope tasks appear with only allowlisted fields. | BRD-014 |
| SPEC-009.AC12 | Given a `NOT_STARTED` task / When IT starts it / Then it is `IN_PROGRESS` and audited. | BRD-014 |
| SPEC-009.AC13 | Given an `IN_PROGRESS` task / When IT blocks it with a reason / Then the task is `BLOCKED` with reason, `TASK_BLOCKED` sent to Employee and relevant users, and audited; the transfer status is unchanged. | BRD-014, BRD-036 |
| SPEC-009.AC14 | Given a task / When IT adds a comment and attaches a valid PDF/image evidence ≤5 MB / Then both are stored append-only and the evidence is downloadable only via the scoped SPEC-011 endpoint. | BRD-014, BRD-021 |
| SPEC-009.AC15 | Given a task with a type set and `IN_PROGRESS` / When IT completes it / Then `COMPLETED`, completed by/at recorded. | BRD-014 |
| SPEC-009.AC16 | Given all tasks completed / When IT performs Complete IT Tasks / Then status `PENDING_IT_FINAL_APPROVAL`, outcome `TASKS_COMPLETED`, employee/relevant notified, IT assignee gets `APPROVAL_REQUIRED`. | BRD-027 |
| SPEC-009.AC17 | Given no IT work is needed and tasks are only `NOT_STARTED` / When IT records No IT Action Required with a reason / Then status `PENDING_IT_FINAL_APPROVAL`, the tasks are `CANCELLED`, reason recorded and audited. | BRD-027, BRD-OQ-11 |
| SPEC-009.AC18 | Given `PENDING_IT_FINAL_APPROVAL` with conditions 1–4 satisfied and a valid date / When the IT assignee gives Final Approval / Then status `COMPLETED`, `completed_at` set, history row added. | BRD-014, BRD-027 |
| SPEC-009.AC19 | Given a transfer with no IT work / When No IT Action Required then Final Approval / Then it reaches `COMPLETED` (IT Final Approval mandatory in every case). | BRD-OQ-11 |
| SPEC-009.AC20 | Given the completion / Then the vacancy reservation became final allocation (filled+1, reserved−1, available unchanged) in the same transaction. | BRD-028 |
| SPEC-009.AC21 | Given the completion / Then `TRANSFER_COMPLETED` is enqueued for Employee and relevant stakeholders and, if the dispatch later fails, the transfer stays Completed. | BRD-036 |
| SPEC-009.AC22 | Given any step fails during completion (fault injected at gate, approval insert, allocation, engine, audit, outbox) / Then nothing persists: status still `PENDING_IT_FINAL_APPROVAL`, no approval row, vacancy still reserved. | BRD-038, BRD-028 |
| SPEC-009.AC23 | Given `COMPLETED` / When any normal workflow action is attempted / Then 403 `INVALID_WORKFLOW_TRANSITION`. | BRD-027 |
| SPEC-009.AC24 | Given the readiness endpoint / Then it returns the five conditions and date state as booleans; IT sees no payroll reference or approver comments. | BRD-014, NFR-007 |
| SPEC-009.AC25 | Given `PENDING_IT_FINAL_APPROVAL` with an effective date in the past / When IT gives Final Approval / Then 409 `COMPLETION_GATE_NOT_SATISFIED` (`EFFECTIVE_DATE_EXPIRED`), no state change, refusal audited. | BRD-031 |
| SPEC-009.AC26 | Given the expired date in an IT stage / When Super Admin corrects it to a date within today..today+30 with a reason / Then the date changes, `EFFECTIVE_DATE_CORRECTED_BY_ADMIN` audited with previous/new, and Final Approval then succeeds. | BRD-031, BRD-OQ-20(d) |
| SPEC-009.AC27 | Given the expired date in `PAYROLL_PROCESSING` / When HR corrects it via SPEC-008 / Then the gate later passes (cross-spec check). | BRD-031 |
| SPEC-009.AC28 | Given re-approval on date change is disabled / When Super Admin corrects the date / Then status is unchanged and no approver is notified. | BRD-031 |
| SPEC-009.AC29 | Given a transfer cancelled after Payroll opened / Then the Payroll activity and non-final IT tasks are `CANCELLED`, not deleted. | BRD-027 Cancel |
| SPEC-009.AC30 | Given IT task reassignment by Super Admin / Then the new IT user can act, receives `IT_TASK_ASSIGNED`, the old user is read-only, status unchanged. | BRD-035 |

## 22. Negative Acceptance Criteria

| ID | Given / When / Then | BRD-039 / BRD |
|---|---|---|
| SPEC-009.NAC01 | When any client calls a payroll callback/webhook/import path (e.g. `POST /api/v1/payroll/callback`) / Then 404 and no state changes (no such route). | BRD-027(c), BRD-039 Integration |
| SPEC-009.NAC02 | Given an external-system failure scenario / Then no task or transfer is marked Completed because completion is only by the authenticated manual actions. | BRD-039 Integration |
| SPEC-009.NAC03 | Given status `PENDING_HR_REVIEW` / When HR calls payroll complete / Then 403 `INVALID_WORKFLOW_TRANSITION`, status unchanged. | BRD-027, BRD-039 |
| SPEC-009.NAC04 | Given `HR_PROCESSING` (HR processing not completed) / When payroll complete is called / Then 403 `INVALID_WORKFLOW_TRANSITION`. | BRD-OQ-14(b) |
| SPEC-009.NAC05 | Given `PAYROLL_PROCESSING` / When IT, Employee, Reporting Manager, Receiving Manager or Super Admin calls payroll complete / Then 403. | BRD-027, BRD-026 |
| SPEC-009.NAC06 | Given `PAYROLL_PROCESSING` or `PENDING_IT_ACTION` / When IT calls IT Final Approval / Then 403 `INVALID_WORKFLOW_TRANSITION`; no approval row. | BRD-039 Workflow (Payroll incomplete) |
| SPEC-009.NAC07 | Given `PENDING_IT_FINAL_APPROVAL` with `payroll_activities.status='PENDING'` (data anomaly) / When IT approves / Then 409 `COMPLETION_GATE_NOT_SATISFIED` (`PAYROLL_INCOMPLETE`); status unchanged. | BRD-039 Workflow |
| SPEC-009.NAC08 | Given HR from another location / When completing Payroll, or IT outside the routing location / When acting on a task / Then 403 and no data in the response. | BRD-026, BRD-039 Security |
| SPEC-009.NAC09 | Given an IT user / When requesting a task assigned to someone else or out of scope / Then 403 (same response as non-existent). | BRD-039 Security |
| SPEC-009.NAC10 | Given an Employee, Reporting Manager or Receiving Manager / When calling any payroll/IT endpoint / Then 403. | BRD-039 Security |
| SPEC-009.NAC11 | Given an IT user / When requesting the document of an employee/transfer not tied to its task evidence / Then denied; IT API responses never include fields outside the allowlist (incl. payroll reference, reason, vacancy). | BRD-039 Security, BRD-014 |
| SPEC-009.NAC12 | When anyone calls an endpoint to set status `COMPLETED` other than Final Approve (e.g. HR, Super Admin, Payroll complete, Complete IT Tasks) / Then no such transition exists; 403. | BRD-039 Workflow |
| SPEC-009.NAC13 | Given `PENDING_IT_ACTION` / When IT calls final-approve directly / Then 403 `INVALID_WORKFLOW_TRANSITION`. | BRD-027 |
| SPEC-009.NAC14 | Given Reporting/Receiving Manager and HR approvals and Payroll complete / When no IT outcome is recorded / Then the transfer is not Completed. | BRD-019 |
| SPEC-009.NAC15 | Given status `PENDING_IT_FINAL_APPROVAL` / When IT calls Complete IT Tasks or No IT Action Required again / Then 403 `INVALID_WORKFLOW_TRANSITION`. | BRD-027 |
| SPEC-009.NAC16 | Given a former assignee after Super Admin reassignment / When acting on the task / Then 403; Super Admin attempting Final Approval → 403. | BRD-035 |
| SPEC-009.NAC17 | Given a Completed transfer / When any Payroll/IT/comment/evidence write or date correction is attempted / Then 403, no change. | BRD-039 Workflow |
| SPEC-009.NAC18 | Given a Completed transfer / When a SQL UPDATE/DELETE is attempted on this SPEC's tables / Then the trigger rejects it. | BRD-027 |
| SPEC-009.NAC19 | Given Completed / When Block, Cancel, Reassign, Withdraw are attempted / Then refused (final state). | BRD-027 |
| SPEC-009.NAC20 | Given a missing/invalid reservation at completion / Then rollback, vacancy counts unchanged, no negative capacity. | BRD-039 Vacancy, BRD-028 |
| SPEC-009.NAC21 | Given two transfers contending for one vacancy at completion / Then allocation never exceeds capacity; failure rolls back that completion only. | BRD-039 Vacancy |
| SPEC-009.NAC22 | When Block-with-reason is submitted without a reason / Then 400; no task state change. | BRD-014 |
| SPEC-009.NAC23 | When No IT Action Required is submitted without reason / Then 400. | BRD-027 |
| SPEC-009.NAC24 | When Complete IT Tasks is submitted while a task is `BLOCKED/IN_PROGRESS/NOT_STARTED` / Then 409 `IT_TASKS_INCOMPLETE`. | BRD-014 |
| SPEC-009.NAC25 | When Super Admin corrects the date to yesterday or today+31 / Then 400 `EFFECTIVE_DATE_OUT_OF_RANGE`; stored date unchanged. | BRD-031 |
| SPEC-009.NAC26 | When date correction is attempted by HR/IT/Employee through this endpoint, or in a non-IT stage / Then 403. | BRD-031 |
| SPEC-009.NAC27 | When evidence > 5 MB or wrong type or mismatched MIME/extension / Then 413 / 415 / 415 and nothing stored. | BRD-021 |
| SPEC-009.NAC28 | When an unauthenticated or expired-token call is made / Then 401. | BRD-026 |
| SPEC-009.NAC29 | When a notification dispatcher is down at completion / Then completion still commits and no duplicate transition occurs on retry. | BRD-036, NFR-006 |
| SPEC-009.NAC30 | When two IT users submit Final Approval simultaneously / Then exactly one succeeds. | BRD-038 |

## 23. Testing Requirements

Tests under `tests/backend/payroll/`, `tests/backend/it-processing/`, `tests/frontend/payroll/`, `tests/frontend/it-processing/`. RED before GREEN.

| Type | Scope | TC IDs |
|---|---|---|
| Unit | Payroll service (open/stage/complete/cancel); IT assignment (routing, selection, unassigned); task state machine; projection allowlist; gate evaluator (each condition independently); date expiry in business TZ; validators | TC-009.01 – TC-009.14 |
| Integration | Handlers with real DB: Payroll → IT → outcomes → Final Approval; entry hooks; cancel propagation; reassignment hook; vacancy finalisation integration with SPEC-005 | TC-009.15 – TC-009.24 |
| API | Every endpoint in §12: success, 400, 401, 403, 409; response envelope; no extra fields | TC-009.25 – TC-009.36 |
| Frontend | Worklist/detail rendering, confirmation dialogs, reason validation, readiness checklist, disabled state, expired-date banner, error states, a11y checks | TC-009.37 – TC-009.42 |
| Security | Role×scope×stage×assignee grid per endpoint; projection leak scan (no payroll/reason/vacancy keys in IT payloads); no payroll integration routes; evidence scope; log/audit credential scan | TC-009.43 – TC-009.48 |
| Concurrency | Double Payroll complete; concurrent final approvals; Final Approval vs Block/Cancel/Reassign/date correction; two completions competing for one vacancy; lock-order deadlock soak | TC-009.49 – TC-009.54 |
| Workflow | All SPEC-009 transition rows allowed; all other (status, role, action) combinations 403; Completed immutability; rollback fault injection at every completion step | TC-009.55 – TC-009.62 |
| Negative | NAC01–NAC30 each mapped 1:1 | TC-009.63 – TC-009.92 |

Key mappings: TC-009.55 ↔ AC03/AC18; TC-009.58 ↔ AC22 (fault injection); TC-009.63 ↔ NAC01; TC-009.68 ↔ NAC06; TC-009.69 ↔ NAC07; TC-009.80 ↔ NAC18; TC-009.92 ↔ NAC30. (Per-NAC mapping: TC-009.(62+n) ↔ NACn.) Final TC list is generated into `.ai-context/test_cases/payroll-it-completion.test_cases.md` after Gate 1.

## 24. Definition of Done

- All TASK-009.01–34 complete; RED→GREEN evidenced; unit/API/integration/concurrency/security/frontend tests pass in CI.
- All AC and NAC pass; BRD-039 rows in 3.5 demonstrably covered; SPEC-016 traceability updated by its owner.
- Migrations apply and roll back cleanly; triggers verified; no auto-sync in production.
- Projection leak scan green; no payroll-integration route present; no credentials in logs/audit.
- Completion fault-injection tests prove atomic rollback; lock order documented and honoured by SPEC-005/007/008/010 handlers.
- Every TDD-009.NN has a recorded decision (or the recommended default accepted at Gate 1).
- OpenAPI documents all endpoints; INT standards respected (ES6+, async/await, try/catch, structured logger, no `eval`, no AI-hint comments/commit messages).
- Gate 1 approval recorded, then Gate 2 code review passed.

---

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default [PROPOSED] | Impact |
|---|---|---|---|
| TDD-009.01 | Which HR users are "authorised" to mark Payroll completed: only the current HR assignee, or any HR in scope? | Current assignee in scope (aligns with BRD-035 "cannot act after reassignment"). | Authz rule, FR-009.06, tests NAC05/NAC08 |
| TDD-009.02 | Payroll reference format, mandatory vs optional, uniqueness | Optional; `^[A-Za-z0-9][A-Za-z0-9._/\-]{0,49}$`; no uniqueness | Validation, DB column, UI |
| TDD-009.03 | IT routing location: employee's current or target location | Target location (equal to current when unchanged) | Assignment, scope checks |
| TDD-009.04 | IT task granularity: one task per transfer or several typed tasks | One auto-created anchor task + IT-added typed tasks | Data model, completion rule |
| TDD-009.05 | Selection among multiple IT users in a location | Employee's assigned IT user if eligible; else fewest open tasks, tie by user id | Fairness, reassign volume |
| TDD-009.06 | What happens when no IT user is eligible | Create unassigned task, do not fail workflow, audit, Super Admin visibility | Operational risk, dashboards |
| TDD-009.07 | Exact IT field allowlist (employee/transfer data visible to IT) | FR-009.31 list (ID, name, email, current/proposed org values, effective date) | Privacy (NFR-007), DTO |
| TDD-009.08 | IT task types catalogue beyond the four BRD activities; who maintains it | Four seeded categories; Super Admin may add types | Admin UI, reporting |
| TDD-009.09 | Does a task-level Blocked also move the transfer to `BLOCKED`? | No; separate manual SPEC-010 Block | Workflow, notifications |
| TDD-009.10 | Completion evidence storage and obligation (document row vs text; mandatory?) | SPEC-011 document row (category `IT_COMPLETION_EVIDENCE`) and/or text note; optional | Storage, validation, UAT |
| TDD-009.11 | Must IT Final Approval be by a different IT user than the executor? | Not required | Segregation of duties |
| TDD-009.12 | Can a Payroll activity ever be non-mandatory? | No; always mandatory | Gate condition 3 |
| TDD-009.13 | Interaction of Super Admin date correction with the optional date-change re-approval toggle in IT stages | Toggle off by default → no routing; if on, SPEC-007 evaluator decides and the transfer returns to the configured stage, open IT tasks retained | Workflow complexity |
| TDD-009.14 | "Relevant stakeholders/users" recipients for IT outcome and completion notifications; separate "Approval completed" on final approval | Employee, Reporting Manager, assigned HR; no separate approval-completed message | Notification catalogue (SPEC-012) |
| TDD-009.15 | Whether Super Admin may complete Payroll or give IT Final Approval as administrative intervention | No (BRD matrix assigns these to HR and IT) | Authz |

## Out of Scope (this SPEC)

Per BRD Out of Scope, nothing here introduces: a payroll calculation engine or any Payroll/HR system integration, API or callback (BRD-027(c), BRD-OQ-19); an IT service-management integration (task data is portal-recorded); Facilities/Admin tasks (workplace, seating, access-card, asset-movement); a bulk data migration; MFA/SSO. Also not in this SPEC: HR Processing and organisation change handling (SPEC-008), the state-machine engine and Reporting/Receiving Manager decisions (SPEC-007), vacancy capacity engine (SPEC-005), Block/Resume/Cancel/Reassign and Withdraw actions themselves (SPEC-010), document storage internals (SPEC-011), notification templates/dispatch (SPEC-012), audit visibility/export (SPEC-013), dashboards/overdue/escalation (SPEC-014).
