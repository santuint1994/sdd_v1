# SPEC-007 — Transfer Workflow Engine & Approval Lifecycle

## Feature ID
transfer-workflow-approval-lifecycle

## Status
Changes Requested at Gate 1 (2026-10-29) — reviewer Shamik Bhattacharya; see `.ai-context/pr_reviews/SPEC-007-transfer-workflow-approval-lifecycle-20261029-164221.md`. Spec must be updated and re-submitted for Gate 1; plan, tasks, tests and code remain blocked

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 0 (BRD) | Shamik Bhattacharya (BRD baseline, Approved 2026-10-05) | 2026-10-05 | Approved | `.ai-context/pr_reviews/BRD-20261005-171137.md` |
| Gate 1 (Spec Peer Review) | Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) | 2026-10-29 | Changes Requested | `.ai-context/pr_reviews/SPEC-007-transfer-workflow-approval-lifecycle-20261029-164221.md` |
| Gate 2 (Code Review) | — | — | Not started | — |

## Intent & Business Goals

Provide the single, backend-enforced state machine through which every internal transfer moves. Nothing changes a transfer's status except `WorkflowEngine.transition`, which validates the chain `Authenticated User -> Role -> Org Scope -> Transfer Request -> Current Status -> Requested Action -> Allowed Next Status` [BRD-027], executes the change in ONE database transaction (row lock, status compare-and-set, history + audit + outbox rows) and rejects everything else with HTTP 403 `INVALID_WORKFLOW_TRANSITION`. This SPEC also delivers the Reporting Manager / Receiving Manager approval stages, approve / reject / request-clarification mechanics, the Info Required temporary state, rejection handling, pending-owner task assignments, the Super Admin workflow configuration (Receiving Manager enabled flag and optional date-change re-approval) and the approver review UI. Feature SPECs 006, 008, 009 and 010 plug their stage-specific behaviour into the engine through a handler registration contract; they never write `transfer_requests.status` directly.

Goals: (1) no transfer can reach an arbitrary status [BRD-027]; (2) IT Final Approval is the only path to Completed [BRD-018, BRD-019, BRD-014]; (3) Receiving Manager stage is configuration, never hard-coded [BRD-012, BRD-OQ-04]; (4) every decision, reason and clarification is traceable [BRD-033, BRD-034, BRD-037]; (5) the BRD-027 matrix is data that a test enumerates cell by cell.

## User Roles & Actors

| Actor | Role in this SPEC |
|---|---|
| Reporting Manager | Reviews, approves, rejects (reason), requests clarification, comments on assigned employees' requests |
| Receiving Manager (optional stage) | Same actions for incoming transfers (Pending Receiving Manager Approval) and Re-Approval decisions |
| Employee | Responds to clarification on own request (default responsible user); sees own history |
| HR | Rows in the matrix owned by SPEC-008/009 are declared here; HR sees in-scope history |
| IT | Rows owned by SPEC-009 declared here; sees minimal history |
| Super Admin | Configures the workflow (Receiving Manager flag, date-change re-approval); views all history; Block/Cancel/Resume/Reassign rows declared here, behaviour in SPEC-010 |
| System (WorkflowEngine) | Executes and records transitions; resolves pending owner |

---

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-007 |
| Title | Transfer Workflow Engine & Approval Lifecycle |
| Purpose | State machine, transition registry, transactional engine, handler contract, pending-owner assignments, workflow configuration, manager approval / rejection / clarification, history views and approver UI |
| Business objective | Controlled, auditable approval lifecycle with no status bypass (BRD-018, BRD-019, BRD-027) |
| Version | 0.1 (Draft) |
| Date | 2026-10-06 |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer per roster | Project Manager / Product Owner |
| Task prefix | TASK-007.MM |

## 2. Why This SPEC Exists

The BRD fixes a single transition matrix (BRD-027), the status set (BRD-019), the end-to-end sequence (BRD-018), manager review rules (BRD-012), rejection (BRD-033) and clarification (BRD-034) behaviour, and a mandatory backend response for invalid transitions (BRD-OQ-14(d)). Without one authoritative engine, SPEC-006/008/009/010 would each mutate status in their own code and the matrix could not be proven. This SPEC:

- owns the engine, the registry (ALL matrix rows as data, including rows whose business logic lives in other SPECs), the generic reject / clarify / approve behaviour and the assignment model;
- defines how other SPECs register handlers and what they may and may not do;
- owns the enumerating matrix test (BRD-039 workflow scenarios, owned for execution by SPEC-016).

## 3. BRD Traceability

### 3.1 BRD requirement IDs

| BRD ID | Coverage | Slice owned here |
|---|---|---|
| BRD-012 | FULL | Reporting/Receiving Manager review, approve, reject with reason, clarify, comments, previous decisions, Super Admin Receiving Manager flag |
| BRD-018 | FULL | End-to-end sequence encoded in registry; documented in section 16 |
| BRD-019 | FULL | 15-status model, status-change only via BRD-027 |
| BRD-027 | FULL for engine, state model, manager rows, matrix integrity, invalid-transition response, completion single-path invariant; PARTIAL for rows whose behaviour is owned by SPEC-006 (Submit), 008 (HR rows), 009 (Payroll/IT rows), 010 (Withdraw/Block/Resume/Cancel/Reassign): declared in registry here, handler logic elsewhere |
| BRD-033 | FULL for engine-side rejection (reason, history, audit, final, release hook, notification, no reopen); PARTIAL: new-request rules in SPEC-006, Withdraw/Cancel release in SPEC-010 |
| BRD-034 | FULL | Clarification request / response / return / cycles / history |
| BRD-024 | PARTIAL | Routing (Re-Approval status, return to HR Processing, enabled-flag check) only; trigger detection and change records in SPEC-008 |
| BRD-031 | PARTIAL | Optional date-change re-approval configuration + routing mechanism only; validation and date edits in SPEC-006/008 |
| BRD-035 | PARTIAL | Assignment table and `replaceAssignee` primitive; Reassign endpoint and rules in SPEC-010 |
| BRD-026 | PARTIAL | Workflow-stage step of the authorization chain; RBAC kernel in SPEC-002 |
| BRD-016, BRD-029, BRD-030 | PARTIAL | Consumes organisation mapping / active-status set; owned elsewhere |
| BRD-022, BRD-037 | PARTIAL | Emits audit events via `AuditService.record` (kernel SPEC-001) |
| BRD-036 | PARTIAL | Enqueues workflow notification events via `NotificationService.enqueue` (kernel SPEC-001; delivery SPEC-012) |
| BRD-039 | PARTIAL | Workflow rows (see 3.5) |

### 3.2 NFR IDs

| NFR | Coverage |
|---|---|
| NFR-002 | PARTIAL (workflow-stage authorization, backend authoritative) |
| NFR-005 | PARTIAL (history + audit append-only, security-event for invalid attempts) |
| NFR-006 | PARTIAL (idempotent notification enqueue; no duplicate transitions) |
| BRD-038 (transactional consistency) | PARTIAL (workflow state changes never partial or duplicate) |

### 3.3 BRD-OQ coverage

| OQ | Status | Where implemented |
|---|---|---|
| BRD-OQ-04 | Resolved | `workflow_configuration.receiving_manager_enabled`, routing (FR-007.40..45) |
| BRD-OQ-10 | Resolved | Reviewer sequence, rejection reason, clarification return, section 16 |
| BRD-OQ-14 (a)(b)(c) | Resolved | Registry encodes HR Processing -> Payroll Processing sequential, no HR Confirmation status |
| BRD-OQ-14(d) | Resolved | Invalid-transition response (FR-007.20..24) |
| BRD-OQ-12, 13, 18 | Resolved | Rows declared; behaviour in SPEC-010 |
| BRD-OQ-20(c) | Resolved | Configurable date-change re-approval (FR-007.46..48) |

### 3.4 Business rules and BRD acceptance bullets covered

| BRD acceptance bullet / business rule | Covered by |
|---|---|
| "Every status change follows the BRD-027 transition matrix ... invalid transition returns 403 INVALID_WORKFLOW_TRANSITION, status unchanged, no downstream effect, audited as security event" | SPEC-007.AC01..AC07, NAC01..NAC06 |
| "Reporting Manager and configured Receiving Manager can take permitted actions with decisions and reasons recorded" | AC10..AC20 |
| "Rejection requires a reason, releases reservation, notifies employee; clarification returns to requesting stage with history and reservation retained" | AC21..AC30 |
| "Rejection & resubmission (BRD-033)" and "Clarification (BRD-034)" bullets | AC21..AC34 |
| "A request reaches Completed only once IT gives Final Approval" | AC06, NAC07 (single-path invariant; completion gate conditions in SPEC-009) |
| Business rule: Receiving Manager review stage enabled/disabled by configuration, not hard-coded | AC08, AC09, AC18, NAC08, NAC15–NAC17 |
| Business rule: status changes follow BRD-027; invalid/unauthorised rejected | AC01..AC07 |

### 3.5 BRD-039 workflow-scenario mapping (this SPEC's slice)

| BRD-039 scenario | Slice here | NAC ID |
|---|---|---|
| User cannot approve outside their assigned role/scope | Role + scope + pending-owner guards | NAC01, NAC02 |
| Invalid workflow transitions are rejected | Whole engine | NAC03, NAC04, NAC05 |
| Completed transfer cannot be modified through normal workflow | Final-status protection (no rows out of finals) | NAC06 |
| IT Final Approval blocked while Payroll incomplete | Registry exposes the guard slot; guard logic SPEC-009 | PARTIAL: NAC07 asserts single path to Completed |
| Transfer cannot move to Completed without IT Final Approval | Graph invariant | NAC07 |
| Receiving Manager approval cannot be bypassed when enabled | Routing + matrix | NAC08 |
| HR change triggers re-approval (BRD-024) | Routing mechanism; trigger in SPEC-008 | NAC09 (PARTIAL) |
| Rejected/Withdrawn release capacity | Rejection release hook (Withdrawn in SPEC-010) | NAC10 (PARTIAL) |
| Employee cannot access another Employee's request | History/clarification/read APIs | NAC11 |
| Direct API access cannot bypass authorization | All endpoints | NAC12 |

## 4. Dependencies

| Depends on | What is consumed |
|---|---|
| SPEC-001 | `withTransaction`, error classes, response envelope, validation middleware, request-id, logger, config loader, migration conventions, `AuditService.record(event,{trx})`, append-only audit strategy, `NotificationService.enqueue(eventCode,payload,{trx})` + outbox, base UI kit |
| SPEC-002 | Authentication (401), `AuthorizationService.authorize`, `ScopeResolver`, role enum, session/token context (`user_id`, `role`) |
| SPEC-003 | Location / department / designation master data; HR location scope, IT location scope, Receiving Manager scope mapping `[TDD-REQUIRED]` |
| SPEC-004 | `employee_profiles` (reporting manager, assigned HR, assigned IT, location, department); user lookups for assignee validation |
| SPEC-005 | `VacancyService.release({ transferRequestId, reasonCode:'REJECTED', actor }, {trx})` (idempotent when no reservation exists) called by rejection handling via an `onTerminate` hook [RECONCILED R-6 signature per SPEC-005] |
| SPEC-006 | `transfer_requests` table (columns required below), reference number, Submit handler, Draft edit rules |
| SPEC-011 | Optional clarification-response attachments `[TDD-REQUIRED]` |
| SPEC-012 | Notification templates / dispatch for the event codes enqueued here |
| SPEC-013 | Audit visibility / filters for event codes emitted here |

Required columns on `transfer_requests` (owned by SPEC-006, listed here as a cross-spec requirement `[DERIVED]`): `id uuid PK`, `transfer_reference`, `employee_id` (= `employee_profiles(id)`), `status varchar(48) NOT NULL` with CHECK in the 15 codes, `version integer NOT NULL DEFAULT 1`, `stage_entered_at timestamptz NOT NULL` (written by the engine on every status change; read by SPEC-014), `closed_at timestamptz NULL` (set when a final status is entered). SPEC-010 owns `blocked_from_status` (and block/closure columns). [RECONCILED] R-4: names aligned to SPEC-006 (`transfer_reference`, `stage_entered_at`) and SPEC-010 (`blocked_from_status`); `is_active` is not a column - active = status in ACTIVE_STATUSES.

## 5. Enables

| Enabled SPEC | What it gets |
|---|---|
| SPEC-006 | `WorkflowEngine.transition` for SUBMIT; `WorkflowGuard.assertStatusIn` for Draft-only edits (Rejected/Submitted edits raise the same 403) |
| SPEC-008 | HR rows, Re-Approval status, routing facts hook, assignee resolution for HR/Receiving Manager |
| SPEC-009 | Payroll / IT rows, completion guard slot, IT assignee resolver slot |
| SPEC-010 | Withdraw / Block / Resume / Cancel / Reassign rows, `TaskAssignmentService.replaceAssignee`, terminate hooks |
| SPEC-012/013/014 | Event codes, audit codes, `transfer_task_assignments` (pending owner) and history for worklists / reporting |
| SPEC-016 | Matrix golden fixture, scenario tests |

## 6. Roles & Scope

| Role | Allowed in this SPEC | Scope check |
|---|---|---|
| Reporting Manager | APPROVE, REJECT, REQUEST_CLARIFICATION, ADD_COMMENT in `PENDING_REPORTING_MANAGER_APPROVAL` | Pending owner of the stage AND employee within the manager's reporting hierarchy |
| Receiving Manager | Same in `PENDING_RECEIVING_MANAGER_APPROVAL`; APPROVE, REJECT, REQUEST_CLARIFICATION(DERIVED), ADD_COMMENT in `PENDING_RECEIVING_MANAGER_REAPPROVAL` | Pending owner AND target team scope `[TDD-REQUIRED]` |
| Employee | RESPOND_CLARIFICATION on own request in `INFO_REQUIRED` (default responsible user); read own history | Own request only (BRD-039 employee isolation) |
| HR / IT | Actions in rows declared here, owned by SPEC-008/009/010; read history in scope | HR location/organisation scope; IT assigned scope |
| Super Admin | GET/PUT workflow configuration; matrix rows Block/Cancel/Resume/Reassign/date change (SPEC-010/008); read all history. NOT granted manager/HR/IT decisions `[TDD-REQUIRED]` TDD-007.08 | Global |

---

## 7. Functional Requirements

### 7.1 Status model

| ID | Requirement | Tag |
|---|---|---|
| FR-007.01 | The workflow has exactly 15 statuses: `DRAFT`, `PENDING_REPORTING_MANAGER_APPROVAL`, `PENDING_RECEIVING_MANAGER_APPROVAL`, `INFO_REQUIRED`, `PENDING_HR_REVIEW`, `HR_PROCESSING`, `PENDING_RECEIVING_MANAGER_REAPPROVAL`, `PAYROLL_PROCESSING`, `PENDING_IT_ACTION`, `PENDING_IT_FINAL_APPROVAL`, `COMPLETED`, `REJECTED`, `WITHDRAWN`, `BLOCKED`, `CANCELLED`. Labels per section 10.1. | [BRD-019, BRD-027] codes [PROPOSED] |
| FR-007.02 | Final statuses: `COMPLETED`, `REJECTED`, `WITHDRAWN`, `CANCELLED`. No registry row may have a final status as its `from`. A final request cannot be reopened, edited or resubmitted under the same reference. | [BRD-027, BRD-033] |
| FR-007.03 | Active statuses = all statuses except `DRAFT` and the four final ones (so `BLOCKED` and `INFO_REQUIRED` are active). The set is exported as `ACTIVE_STATUSES` (SPEC-001 constants module; SPEC-007 re-exports) and is the single source used by the one-active-request index (SPEC-006). [RECONCILED R-3] | [BRD-030] |
| FR-007.04 | HR-controlled set: `PENDING_HR_REVIEW`, `HR_PROCESSING`, `PAYROLL_PROCESSING`. IT-controlled set: `PENDING_IT_ACTION`, `PENDING_IT_FINAL_APPROVAL`. `PENDING_RECEIVING_MANAGER_REAPPROVAL`, `INFO_REQUIRED` and the manager approval stages belong to neither set: HR and IT cannot Block/Cancel there; only Super Admin can. | [BRD-027, BRD-OQ-18] ; "neither set" consequence [DERIVED] |
| FR-007.05 | HR Confirmation is NOT a status; it is an activity inside `HR_PROCESSING`. | [BRD-OQ-14(a)] |
| FR-007.06 | `INFO_REQUIRED` is a temporary state; it stores the stage and reviewer to return to. | [BRD-034] |
| FR-007.07 | Status can change only via `WorkflowEngine.transition`. Repositories expose no generic `updateStatus`; the Sequelize model for `transfer_requests.status` is written only by the engine's repository method (lint rule + test `no-direct-status-write`). | [BRD-027, BRD-019] ; enforcement mechanism [PROPOSED] |

### 7.2 Transition registry

| ID | Requirement | Tag |
|---|---|---|
| FR-007.10 | The registry is a code-defined, declarative, typed, frozen-at-startup constant (`transition-registry.ts`) holding every BRD-027 row plus DERIVED rows (section 16.3). Each rule: `id`, `from`, `role`, `action`, `to` (static status or named routing function), `reasonRequired`, `guards[]`, `handlerKey`, `ownerSpec`, `nextOwnerRole`, `notify[]`, `auditCode`, `vacancyEffect` (descriptive), `source` (`BRD-027` / `DERIVED` / `TDD-REQUIRED`). Code-defined chosen over DB-defined because the matrix is fixed by BRD and only the two toggles are configurable. | [BRD-027] ; code-defined choice [PROPOSED] TDD-007.14 |
| FR-007.11 | Wildcard rows (`ANY_ACTIVE_NON_FINAL`) are expanded at load into concrete (status, role, action) rules; the expanded set is what the engine and the test see. | [PROPOSED] |
| FR-007.12 | Lookup is by exact `(currentStatus, role, action)`; absence = deny (default deny). | [BRD-027] |
| FR-007.13 | Boot-time `assertRegistryIntegrity()` fails the process start when: duplicate `(from,role,action)`; unknown status/role/action; a rule leaves a final status; any non-DRAFT status unreachable from DRAFT; `COMPLETED` reachable by any rule other than `PENDING_IT_FINAL_APPROVAL / IT / IT_FINAL_APPROVE`; `PAYROLL_PROCESSING` or `PENDING_IT_ACTION` bypassable (graph path DRAFT to COMPLETED must pass PAYROLL_PROCESSING, PENDING_IT_ACTION and PENDING_IT_FINAL_APPROVAL in that order); a rule with `reasonRequired=true` lacks a reason validator; a `handlerRequired` rule has no registered handler (waived only when `NODE_ENV=test` and stubs are installed). | [BRD-027, BRD-019, BRD-014] ; mechanism [PROPOSED] |
| FR-007.14 | The registry is readable by Super Admin as data (`GET /api/v1/admin/workflow/transition-matrix`) for review and QA; read-only. | [PROPOSED] |

### 7.3 Engine

| ID | Requirement | Tag |
|---|---|---|
| FR-007.15 | `WorkflowEngine.transition(actorCtx, { transferId, action, payload })` executes this pipeline: (1) authenticated user present (else 401 by SPEC-002 middleware, never reaching engine); (2) begin transaction; (3) `SELECT ... FOR UPDATE` on the `transfer_requests` row; (4) organisation-scope check via `ScopeResolver`; (5) registry lookup `(status, role, action)`; (6) guard chain (pending-owner, origin-stage, scope specifics); (7) payload validation (reason etc.); (8) handler `prepare` -> routing function -> `validate`; (9) status compare-and-set; (10) handler `apply`; (11) assignment close/open; (12) history + audit + outbox rows; (13) commit; (14) after-commit hooks. | [BRD-027] extended chain; steps [PROPOSED] |
| FR-007.16 | Check order is authorization before validation: a caller who is not permitted never learns whether their payload was valid (403 precedes 400). | [DERIVED] from BRD-026 (no information exposure) |
| FR-007.17 | Everything in steps 3..12 happens in ONE transaction. Any exception rolls back status, assignments, history, audit and outbox rows together; the HTTP error is returned after rollback. | [BRD-027, BRD-038, BRD-036] |
| FR-007.18 | Status update uses compare-and-set: `UPDATE transfer_requests SET status=:to, version=version+1, stage_entered_at=now() WHERE id=:id AND status=:from AND version=:v`. Zero rows updated -> abort with 409 `WORKFLOW_STATE_CONFLICT` [PROPOSED] (defence in depth; the row lock makes this unreachable in normal operation). | [PROPOSED] |
| FR-007.19 | Notification delivery is never inside the transaction: only outbox rows are inserted. Failure of dispatch never affects the transition. After-commit hook failures are logged and never change the response. | [BRD-036] |

### 7.4 Invalid transition handling

| ID | Requirement | Tag |
|---|---|---|
| FR-007.20 | If an authenticated user attempts an action not permitted for their role, scope, pending-owner status or the request's current status, respond HTTP 403 with `error.code = "INVALID_WORKFLOW_TRANSITION"` and `error.message = "The requested action is not permitted for the current transfer status."` (exact text). `details` is empty; no restricted employee or organisation data is returned. | [BRD-OQ-14(d), BRD-026] |
| FR-007.21 | On such a rejection: the transfer status is unchanged; no downstream task, approval, vacancy update, assignment change or notification tied to the attempt is executed. | [BRD-OQ-14(d)] |
| FR-007.22 | The rejected attempt is audited as a security event `WORKFLOW_INVALID_TRANSITION_ATTEMPT` recording user, role, transfer id, current status, attempted action, date/time and rejection reason (internal `denialReason` code, section 15.3). The audit write runs in its own short transaction AFTER the engine transaction rolled back, so it persists even though the transition did not. If the audit write itself fails the error is logged at `error` level and the 403 is still returned. | [BRD-OQ-14(d), BRD-026, BRD-037] ; separate-transaction mechanism [PROPOSED] |
| FR-007.23 | The internal `denialReason` is never included in the HTTP response. | [DERIVED] (no exposure) |
| FR-007.24 | Missing/invalid/expired authentication stays 401 (SPEC-002), not 403. A syntactically invalid request (bad UUID, unknown action) is 400 `VALIDATION_ERROR`. A non-existent transfer id: see TDD-007.10 (recommended default: same 403 for non-Super-Admin roles to prevent enumeration). | [BRD-026] ; 404/403 [TDD-REQUIRED] |

### 7.5 Handler registration contract (for SPEC-006 / 008 / 009 / 010)

| ID | Requirement | Tag |
|---|---|---|
| FR-007.25 | Each feature module exports `registerWorkflowHandlers(registry: HandlerRegistry)` invoked at app boot after the registry is built. A handler is registered per `handlerKey`. | [PROPOSED] |
| FR-007.26 | Handler interface (all methods optional except where a rule has `handlerRequired`): `prepare(ctx, tx): Promise<Facts>`; `validate(ctx, tx, facts): Promise<void>`; `apply(ctx, tx, facts): Promise<void>`; `afterCommit(ctx, result): Promise<void>`. `ctx` carries actor, transfer snapshot (locked row), rule, payload, config snapshot. `tx` carries the Sequelize `Transaction` (`trx`). | [PROPOSED] |
| FR-007.27 | Handlers MUST use the supplied `trx` for every DB write, MUST NOT open their own transaction, MUST NOT write `transfer_requests.status`, MUST NOT call a notification transport, and MUST NOT swallow errors. Throwing `AppError` (own code) in `validate`/`apply` aborts and rolls back the entire transition (e.g. `VACANCY_CAPACITY_UNAVAILABLE` from SPEC-005 during HR approval). | [BRD-038, BRD-036] |
| FR-007.28 | Handlers cannot choose the next status. Next status is decided only by the registry (static `to` or a named pure routing function over `status`, `facts`, `config`). Routing functions defined here: `routeAfterReportingManagerApproval`, `routeAfterOrgChange` (uses `facts.changedFields`, config), `routeAfterDateChange` (config), `returnAfterReapproval` (stored return status), `returnAfterClarification`. | [BRD-027] |
| FR-007.29 | Lock ordering rule: transfer row first, then config (FOR SHARE), assignment rows, payroll/IT task rows, then vacancy rows (SPEC-005); history/audit/outbox are inserts only. Handlers that lock other rows must follow it. [RECONCILED R-5] was transfer -> vacancy -> assignments | [PROPOSED] |
| FR-007.30 | Terminate hook: when a transition enters a final status (`REJECTED`, `WITHDRAWN`, `CANCELLED`) the engine invokes all registered `onTerminate(ctx, tx)` hooks (SPEC-005 release, SPEC-009 cancel Payroll/IT tasks) inside the transaction. Rejection registers the release hook as mandatory. [RECONCILED R-6] The engine also exposes `registerOnEnter(status, hook(trx, transfer, ctx))` (executed in the transition transaction after the status update; used by SPEC-009 for PAYROLL_PROCESSING, PENDING_IT_ACTION, PENDING_IT_FINAL_APPROVAL and by SPEC-008 for HR_PROCESSING) and `registerOnTerminate(hook)`; SPEC-005's `vacancyTransitionEffects` and SPEC-009 `cancelOpenTasks` are registered through these. | [BRD-033, BRD-028, BRD-027] |
| FR-007.31 | [RECONCILED R-9] Canonical action codes: the 17 contract codes (SUBMIT, APPROVE, REJECT, REQUEST_CLARIFICATION, RESPOND_CLARIFICATION, WITHDRAW, HR_VALIDATE_APPROVE, HR_CHANGE_ORG_DATA, COMPLETE_HR_PROCESSING, MARK_PAYROLL_COMPLETED, COMPLETE_IT_TASKS, NO_IT_ACTION_REQUIRED, IT_FINAL_APPROVE, BLOCK, RESUME, CANCEL, REASSIGN) plus two registry-only additions accepted into the shared vocabulary: `ADD_COMMENT` (self-loop, no status change; 007) and `CHANGE_EFFECTIVE_DATE` (008 handler; HR and Super Admin; same status or configured re-approval stage). No other spec may invent action codes. Responsibility split (who registers what): SPEC-006 `SUBMIT` (eligibility, one-active, snapshot); SPEC-008 `HR_VALIDATE_APPROVE` (revalidate eligibility, reserve capacity via SPEC-005), `HR_CHANGE_ORG_DATA` (prepare `changedFields`, org change records, reason), `COMPLETE_HR_PROCESSING`, `CHANGE_EFFECTIVE_DATE`, HR reject/clarify extra rules; SPEC-009 `MARK_PAYROLL_COMPLETED`, `COMPLETE_IT_TASKS`, `NO_IT_ACTION_REQUIRED`, `IT_FINAL_APPROVE` (completion guard: five BRD-027 conditions, expired-date check, finalizeAllocation), IT assignee resolver; SPEC-010 `WITHDRAW`, `BLOCK`, `RESUME` (revalidation, stored pre-block status), `CANCEL`, `REASSIGN`. SPEC-007 owns the generic `APPROVE`, `REJECT`, `REQUEST_CLARIFICATION`, `RESPOND_CLARIFICATION`, `ADD_COMMENT`. | [DERIVED] from BRD ownership |

### 7.6 Task assignments (pending owner)

| ID | Requirement | Tag |
|---|---|---|
| FR-007.32 | `transfer_task_assignments` records who owns the pending task for each stage. On every transition the engine completes the current PENDING assignment and opens the one for the new status per the rule's `nextOwnerRole` (section 10.3). At most one PENDING assignment per transfer (partial unique index). | [BRD-035, BRD-023 pending owner] ; table [PROPOSED] |
| FR-007.33 | Assignee resolution (`AssigneeResolver` per role): Reporting Manager = reporting manager mapped on the employee / transfer (SPEC-004/006); Receiving Manager = manager responsible for the target department/team `[TDD-REQUIRED]` TDD-007.02; HR = the employee's assigned HR (SPEC-004) and, if none, an HR pool defined by the employee's location/organisation scope; IT = resolver registered by SPEC-009 `[TDD-REQUIRED]` (BRD gap g). | [BRD-016, BRD-029 HR assignment, BRD-OQ-19]; resolution detail per TDD |
| FR-007.34 | If an assignee cannot be resolved the transition aborts (rollback) with 409 `ASSIGNEE_NOT_RESOLVABLE` [PROPOSED]; the stage is never skipped silently. | [BRD-039 no bypass] ; code [PROPOSED] |
| FR-007.35 | Only the pending assignee (or, for a pool assignment, an in-scope user of that role) may act on a manager / HR / IT stage. A previous assignee after reassignment cannot act (BRD-035); `TaskAssignmentService.replaceAssignee(transferId, stageStatus, newUserId, {trx})` is the primitive SPEC-010 calls. | [BRD-035, BRD-026] |
| FR-007.36 | While `INFO_REQUIRED`: the reviewer's assignment becomes `SUSPENDED`; a PENDING assignment for the responsible user is opened; on response the responder's assignment is `COMPLETED` and the same reviewer's assignment returns to `PENDING` (same reviewer). | [BRD-034] |
| FR-007.37 | An approver user cannot act on a transfer where `actor.user_id` equals the requesting employee's user id (self-approval). | [PROPOSED] separation of duties; TDD-007.17 |

### 7.7 Workflow configuration

| ID | Requirement | Tag |
|---|---|---|
| FR-007.40 | `workflow_configuration` is a singleton row holding `receiving_manager_enabled`. Super Admin only may change it. | [BRD-012, BRD-OQ-04] |
| FR-007.41 | When enabled: after Reporting Manager approval the request goes to `PENDING_RECEIVING_MANAGER_APPROVAL` then `PENDING_HR_REVIEW`. When disabled: Reporting Manager approval routes directly to `PENDING_HR_REVIEW` and the Receiving Manager stage is skipped. | [BRD-012, BRD-027 footnote] |
| FR-007.42 | The flag is evaluated at routing time (when the Reporting Manager approves, and when HR changes organisation data under BRD-024), inside the transaction with the config row read under `FOR SHARE`. Requests already sitting in the Receiving Manager stage when the flag is switched off keep their pending decision (no silent skip). | [BRD-024, BRD-039] ; in-flight rule [PROPOSED] TDD-007.03 |
| FR-007.43 | No default is assumed. Until Super Admin has saved the configuration at least once, transitions that need a routing decision fail closed with 409 `WORKFLOW_CONFIGURATION_MISSING` [PROPOSED]. | [BRD-012 "no assumed default"] ; TDD-007.01 |
| FR-007.44 | Configuration change is audited (`WORKFLOW_CONFIG_UPDATED`: previous, new, changed by, time) and versioned in `workflow_configuration_history`; optimistic `version` prevents lost updates. | [BRD-037] ; versioning [PROPOSED] |
| FR-007.45 | The GET response includes `inFlightInReceivingManagerStage` count so Super Admin sees the effect before disabling. | [PROPOSED] |
| FR-007.46 | Optional date-change re-approval toggle `date_change_reapproval_enabled` with `date_change_reapproval_stage` (the configured approval stage/approver). When disabled (not configured) a date change never changes status. | [BRD-031, BRD-OQ-20(c)] |
| FR-007.47 | Allowed `date_change_reapproval_stage` values (recommended): `PENDING_REPORTING_MANAGER_APPROVAL`, `PENDING_RECEIVING_MANAGER_APPROVAL` (only when Receiving Manager is enabled), `PENDING_RECEIVING_MANAGER_REAPPROVAL`. Approver role is derived from the stage. No stage or approver is assumed. | [BRD-031 "whatever Super Admin configures"] ; allowed set [TDD-REQUIRED] TDD-007.04 |
| FR-007.48 | When a date change by HR/Super Admin occurs (action `CHANGE_EFFECTIVE_DATE`, handler SPEC-008) and the toggle is enabled, the engine routes via `routeAfterDateChange` to the configured stage, records `workflow_state.reapproval_return_status` and `reapproval_trigger=DATE_CHANGE`; on approval it returns to the stored return status. BRD-024 behaviour is unaffected. | [BRD-031] ; return path [DERIVED/TDD-REQUIRED] |

### 7.8 Reporting Manager and Receiving Manager review

| ID | Requirement | Tag |
|---|---|---|
| FR-007.50 | Managers can view transfer requests requiring their action, assigned employees within authorised scope, requested details (employee, current and proposed department / designation / location, vacancy, effective date, reason), previous decisions and comments. | [BRD-012] |
| FR-007.51 | APPROVE: Reporting Manager -> `PENDING_RECEIVING_MANAGER_APPROVAL` (enabled) or `PENDING_HR_REVIEW` (disabled). Receiving Manager -> `PENDING_HR_REVIEW`. Re-Approval approve -> stored return status (default `HR_PROCESSING`). No vacancy reservation. Employee and next approver notified. | [BRD-027, BRD-012] |
| FR-007.52 | REJECT: mandatory reason; -> `REJECTED`. Applies to Reporting Manager, Receiving Manager, Re-Approval and (declared here, rules in SPEC-008) HR. | [BRD-033, BRD-012] |
| FR-007.53 | REQUEST_CLARIFICATION: mandatory reason/question; -> `INFO_REQUIRED`. | [BRD-034, BRD-012] |
| FR-007.54 | ADD_COMMENT: managers can add comments to the request without changing status; stored as history entry with `status_changed=false`. | [BRD-012, BRD-024 "add comments"] ; mechanism [PROPOSED] |
| FR-007.55 | The Receiving Manager sees previous and updated organisation values on Re-Approval (data from SPEC-008 `transfer_org_changes`, rendered by this SPEC's review screen through the `reapproval` slot). | [BRD-024] |
| FR-007.56 | Manager stage decisions are accepted only while the transfer is in the matching pending status and the actor is the pending owner (section 7.6). | [BRD-026, BRD-027] |

### 7.9 Rejection handling (BRD-033)

| ID | Requirement | Tag |
|---|---|---|
| FR-007.60 | Rejection without a non-blank reason is refused (400 `VALIDATION_ERROR`, details field `reason`); status unchanged. | [BRD-033] |
| FR-007.61 | Successful rejection, in one transaction: status -> `REJECTED`; `closed_at` set; history row (rejected by, role, reason, time); audit `TRANSFER_REJECTED`; outbox `TRANSFER_REJECTED` to the Employee including the reason (also to HR when rejected at Re-Approval, per matrix); open assignments -> `CANCELLED`; open clarification -> `CLOSED_BY_TERMINATION`; `VacancyService.release` called (idempotent, no-op if no reservation); `onTerminate` hooks run (Payroll/IT tasks never continue). | [BRD-033, BRD-027, BRD-028] |
| FR-007.62 | Rejected is final: no registry row leaves it; edit/resubmit/approve/move attempts return 403 `INVALID_WORKFLOW_TRANSITION` and are audited (BRD-033 summary). | [BRD-033] |
| FR-007.63 | A new application is a new transfer request (new reference, eligibility and vacancy revalidated, whole workflow restarts, no approvals reused) created by SPEC-006; the engine never copies approval history across references. The rejected request remains in history and audit. | [BRD-033, BRD-030] |
| FR-007.64 | The rejection reason is visible to the Employee (as policy permits, BRD-029). | [BRD-029, BRD-033] |

### 7.10 Clarification (BRD-034)

| ID | Requirement | Tag |
|---|---|---|
| FR-007.65 | A clarification request requires a non-blank question/reason; creates a `transfer_clarifications` row (cycle number, requested by, role, question, `return_status`, reviewer assignment id, responsible user) and moves the request to `INFO_REQUIRED`. | [BRD-034] |
| FR-007.66 | The responsible user (default: the Employee who owns the request) is notified and responds under the same transfer reference; no new request is created. | [BRD-034] ; default responder [PROPOSED] TDD-007.05 (gaps k, r) |
| FR-007.67 | A response is accepted only from the responsible user, only while the clarification is `OPEN` and the status is `INFO_REQUIRED`; non-blank response required. | [BRD-034] |
| FR-007.68 | On response the request returns to the same stage (`return_status`) and the same reviewer; the requesting approver is notified; previous approvals, history and reservation are untouched. | [BRD-027 matrix, BRD-034] |
| FR-007.69 | Multiple cycles are allowed: each request/response pair is a new `cycle_no` for the transfer. | [BRD-034] |
| FR-007.70 | Clarification never restarts the approval workflow, never releases or creates a reservation, never changes completed approvals. A BRD-024 change resulting from the information is a separate HR action. | [BRD-034, BRD-027] |
| FR-007.71 | Every request and response is in workflow history and audit with requested by, question/reason, response, responded by, date/time. | [BRD-034, BRD-037] |
| FR-007.72 | Clarification may be requested from: `PENDING_REPORTING_MANAGER_APPROVAL`, `PENDING_RECEIVING_MANAGER_APPROVAL`, `PENDING_HR_REVIEW` (BRD-027 rows) and `PENDING_RECEIVING_MANAGER_REAPPROVAL` (DERIVED, BRD-024 "request clarification"). No other status. | [BRD-027]; REAPPROVAL row [DERIVED], TDD-007.06 |
| FR-007.73 | Return path after an HR clarification: back to `PENDING_HR_REVIEW`, same HR reviewer (BRD-029 table). HR clarification in `HR_PROCESSING` is not in the matrix and is not allowed. | [BRD-029 / BRD-027]; extension TDD-007.05 |

### 7.11 History and review views

| ID | Requirement | Tag |
|---|---|---|
| FR-007.75 | `transfer_workflow_history` is append-only and holds one entry per transition and per non-status action (comment, clarification response, reassignment, org change reference). | [BRD-027, BRD-033, BRD-034, BRD-037] |
| FR-007.76 | Approval history is visible per scope (section 15.2): Employee own; managers where they are or were an assignee or in hierarchy; HR in location scope; IT minimal; Super Admin all. Previous assignees keep visibility. | [BRD-026, BRD-037, BRD-035] ; IT minimal [TDD-REQUIRED] |
| FR-007.77 | Reviewer UI shows requested details, previous decisions, comments and clarification thread; decision buttons come from backend-provided `allowedActions` (UX only; backend still enforces). | [BRD-012, BRD-026] |

### 7.12 Administration UI

| ID | Requirement | Tag |
|---|---|---|
| FR-007.80 | Super Admin page to view and edit workflow configuration with confirmation dialog, in-flight impact warning, version conflict handling and change history. | [BRD-012, BRD-031, BRD-002 confirmation dialogs] |

---

## 8. Internal Implementation Plan / Tasks

| Task | Title | Layer | Description | Inputs / Outputs | Depends on | BRD |
|---|---|---|---|---|---|---|
| TASK-007.01 | Migration: `workflow_configuration` + history | DB | Singleton config table, CHECK constraints, history table, no default row | Input: SPEC-001 migration conventions. Output: tables | SPEC-001 | BRD-012, BRD-031 |
| TASK-007.02 | Migration: `transfer_workflow_history` | DB | Append-only table, sequence unique, indexes, update/delete-blocking trigger + grants | Output: table, trigger | TASK-007.01 convention, SPEC-006 table | BRD-027, BRD-037 |
| TASK-007.03 | Migration: `transfer_task_assignments` + `transfer_workflow_state` | DB | Assignment table, partial unique index (one PENDING), pool scope CHECK; 1:1 state table | Output: tables | SPEC-006 table | BRD-035, BRD-034 |
| TASK-007.04 | Migration: `transfer_clarifications` | DB | Clarification table, one OPEN per transfer partial unique, FK to history | Output: table | TASK-007.02/03 | BRD-034 |
| TASK-007.05 | Workflow constants & types | BE | Enums (statuses, actions, roles, assignment states, denial reasons), `ACTIVE_STATUSES`, `FINAL_STATUSES`, `HR_CONTROLLED_STAGES`, `IT_CONTROLLED_STAGES` (re-exported from SPEC-001 `common/constants/transfer-status.ts`; not redefined) [RECONCILED R-3] | Output: `workflow.constants.ts` | SPEC-002 role enum | BRD-019, BRD-027 |
| TASK-007.06 | Transition registry data | BE | Encode all rows of 16.2 and 16.3, wildcard expansion, routing function names | Output: `transition-registry.ts` | TASK-007.05 | BRD-027, BRD-012 |
| TASK-007.07 | Registry integrity validator | BE | `assertRegistryIntegrity()` (FR-007.13) + graph invariants | Output: boot check | TASK-007.06 | BRD-027, BRD-019 |
| TASK-007.08 | WorkflowEngine core | BE | Pipeline FR-007.15..19: lock, CAS, history/audit/outbox, error mapping | Input: actor ctx, transfer id, action, payload. Output: new status + history id | TASK-007.02..07, SPEC-001 | BRD-027 |
| TASK-007.09 | Guard chain & invalid-transition handling | BE | Scope, pending-owner, origin-stage, self-approval guards; `denialReason`; separate-tx security audit; exact 403 payload | Output: `InvalidWorkflowTransitionError` + audit | TASK-007.08, SPEC-002 | BRD-OQ-14(d), BRD-026 |
| TASK-007.10 | Handler registry & boot assertion | BE | `HandlerRegistry`, lifecycle, terminate hooks, stub installer for tests | Output: contract used by SPEC-006/008/009/010 | TASK-007.08 | BRD-027 |
| TASK-007.11 | Assignee resolvers & TaskAssignmentService | BE | RM / Receiving Manager / HR resolvers, IT resolver slot, open/close/suspend, `replaceAssignee` | Output: service | TASK-007.03, SPEC-003/004 | BRD-016, BRD-035 |
| TASK-007.12 | WorkflowConfigurationService + routing functions | BE | Read (FOR SHARE) / update (optimistic), validation, history, routing functions | Output: service | TASK-007.01 | BRD-012, BRD-031 |
| TASK-007.13 | Generic APPROVE handler | BE | Routing, notifications, assignment hand-over | Output: handler | TASK-007.08..12 | BRD-012, BRD-018 |
| TASK-007.14 | REJECT handler + rejection side effects | BE | Reason validation, release hook, final-status close, notify | Output: handler | TASK-007.08, SPEC-005 | BRD-033 |
| TASK-007.15 | Clarification service + handlers | BE | Request / respond / cycles / return stage and reviewer | Output: service + handlers | TASK-007.04, 11 | BRD-034 |
| TASK-007.16 | ADD_COMMENT + history read service | BE | Comment action, scoped history queries | Output: service | TASK-007.02 | BRD-012, BRD-037 |
| TASK-007.17 | Workflow API controllers/routes/validators | BE | Section 12 endpoints, Joi/Celebrate schemas, OpenAPI | Output: routes | TASK-007.13..16 | BRD-026 |
| TASK-007.18 | Review DTO + my-tasks endpoint | BE | Aggregate review payload, `allowedActions`, worklist primitive | Output: endpoints | TASK-007.11, 16 | BRD-012 |
| TASK-007.19 | `WorkflowGuard` helper for other SPECs | BE | `assertStatusIn(transfer, statuses, attempted)` raising the same 403 and audit | Output: helper | TASK-007.09 | BRD-032, BRD-033 |
| TASK-007.20 | Audit & notification event wiring | BE | Event codes of sections 18/19 emitted via kernels | Output: wiring | TASK-007.08 | BRD-022, BRD-036 |
| TASK-007.21 | Approvals list page + review screen | FE | `/approvals`, `/approvals/[transferId]` | Output: pages | TASK-007.17, 18, SPEC-001 UI kit | BRD-012 |
| TASK-007.22 | Decision action bar + reason dialogs | FE | Approve / Reject / Clarify with mandatory reason + confirmation | Output: components | TASK-007.21 | BRD-012, BRD-033, BRD-034 |
| TASK-007.23 | Clarification thread + employee response form | FE | Thread display; response form embeddable in SPEC-006 tracking page | Output: components | TASK-007.17 | BRD-034, BRD-011 |
| TASK-007.24 | Workflow history timeline component | FE | Shared timeline (reused by SPEC-006/014) | Output: component | TASK-007.17 | BRD-027, BRD-037 |
| TASK-007.25 | Admin workflow configuration page | FE | `/admin/workflow-configuration` | Output: page | TASK-007.17, SPEC-003 shell | BRD-012, BRD-031 |
| TASK-007.26 | Golden matrix fixture + exhaustive matrix test | QA | `brd027-matrix.golden.json` + test over every (status x role x action) cell | Output: tests | TASK-007.06 | BRD-027, BRD-039 |
| TASK-007.27 | Registry integrity + graph tests | QA | Section 23.1 unit tests | Output: tests | TASK-007.07 | BRD-027 |
| TASK-007.28 | Engine integration tests (atomicity/rollback) | QA | Real PostgreSQL, forced failures at each pipeline step | Output: tests | TASK-007.08..10 | BRD-038 |
| TASK-007.29 | Concurrency tests | QA | Parallel approve/approve, approve/withdraw, config change | Output: tests | TASK-007.08 | BRD-038 |
| TASK-007.30 | API + authorization negative tests | QA | Role/scope/direct-API/IDOR | Output: tests | TASK-007.17 | BRD-026, BRD-039 |
| TASK-007.31 | Frontend tests | QA | Component + page tests | Output: tests | TASK-007.21..25 | BRD-012, NFR-008 |
| TASK-007.32 | End-to-end approved-path test with handler stubs | QA | Full path 16.1 with RM enabled/disabled, clarification loop, re-approval loop | Output: test | all BE | BRD-018 |

---

## 9. Business Rules

| ID | Rule | Source |
|---|---|---|
| BR-007.01 | A request cannot move directly to an arbitrary status; every transition is validated as Current Status -> User Role -> Allowed Action -> Next Status. | BRD-027 |
| BR-007.02 | The extended backend chain Authenticated User -> Role -> Org Scope -> Transfer Request -> Current Status -> Requested Action -> Allowed Next Status is enforced; direct API calls cannot bypass it. | BRD-027, BRD-026 |
| BR-007.03 | Completed is reachable only through IT Final Approval; Reporting Manager, Receiving Manager, HR approval and Payroll completion cannot, individually or together, complete a transfer. | BRD-019, BRD-014, BRD-027 |
| BR-007.04 | HR Processing precedes Payroll Processing (sequential); HR Confirmation is not a status; after BRD-024 re-approval the request returns to HR Processing. | BRD-OQ-14 |
| BR-007.05 | Receiving Manager review is enabled or disabled by Super Admin configuration; disabled = Reporting Manager approval routes straight to Pending HR Review. | BRD-012 |
| BR-007.06 | Reject and Request Clarification require a mandatory reason/question. Approve requires none. | BRD-033, BRD-034, BRD-027 |
| BR-007.07 | Rejected is final; same reference cannot be reopened/resubmitted; new application = new request. | BRD-033 |
| BR-007.08 | Clarification is temporary, returns to the same stage and reviewer, retains approvals, history and reservation, allows multiple cycles, does not restart the workflow. | BRD-034 |
| BR-007.09 | No vacancy reservation is created or released by manager approval or by clarification; rejection releases any reservation. | BRD-027, BRD-028 |
| BR-007.10 | Invalid transitions return 403 `INVALID_WORKFLOW_TRANSITION`, change nothing, trigger nothing and are audited as security events. | BRD-OQ-14(d) |
| BR-007.11 | Notification failure never fails or rolls back a transition; retry never repeats the transition. | BRD-036 |
| BR-007.12 | Audit and history are append-only; each change creates a new entry. | BRD-037 |
| BR-007.13 | Only the pending assignee may act on a stage; reassignment changes the assignee only and never the status or completed approvals. | BRD-035 |
| BR-007.14 | No role, timing, escalation or default configuration beyond the BRD is invented (no tenure rules, no auto-escalation). | BRD-029, BRD-023 |

---

## 10. Data Model & Database

Conventions: SPEC-001 migration conventions; UUID PKs; `created_at`/`updated_at` timestamptz; no auto-sync in production; models in `backend/src/models/`, migrations in `backend/src/migrations/` `[PROPOSED]` names below.

### 10.1 Status reference (code, label, category)

| Code | Label | Category | Controlled by | Pending owner role | Employee editing |
|---|---|---|---|---|---|
| DRAFT | Draft | initial (not active) | Employee | none | Yes (SPEC-006) |
| PENDING_REPORTING_MANAGER_APPROVAL | Pending Reporting Manager Approval | active | Manager | REPORTING_MANAGER | No |
| PENDING_RECEIVING_MANAGER_APPROVAL | Pending Receiving Manager Approval | active | Manager | RECEIVING_MANAGER | No |
| INFO_REQUIRED | Info Required | active (temporary) | Responsible user | EMPLOYEE (default responder) | Clarification response only |
| PENDING_HR_REVIEW | Pending HR Review | active, HR-controlled | HR | HR | No |
| HR_PROCESSING | HR Processing | active, HR-controlled | HR | HR | No |
| PENDING_RECEIVING_MANAGER_REAPPROVAL | Pending Receiving Manager Re-Approval | active | Manager | RECEIVING_MANAGER | No |
| PAYROLL_PROCESSING | Payroll Processing | active, HR-controlled | HR | HR | No |
| PENDING_IT_ACTION | Pending IT Action | active, IT-controlled | IT | IT | No |
| PENDING_IT_FINAL_APPROVAL | Pending IT Final Approval | active, IT-controlled | IT | IT | No |
| COMPLETED | Completed | final | none | none | No |
| REJECTED | Rejected | final | none | none | No |
| WITHDRAWN | Withdrawn | final | none | none | No |
| BLOCKED | Blocked (previous status stored by SPEC-010) | active | Super Admin / HR / IT by origin | pending owner of blocked-from stage (unchanged) | No |
| CANCELLED | Cancelled | final | none | none | No |

### 10.2 `workflow_configuration` (singleton) `[PROPOSED]`

| Column | Type | Constraint |
|---|---|---|
| id | smallint PK | CHECK (id = 1) |
| receiving_manager_enabled | boolean | NOT NULL, no DEFAULT (TDD-007.01) |
| date_change_reapproval_enabled | boolean | NOT NULL, no DEFAULT |
| date_change_reapproval_stage | varchar(48) NULL | CHECK stage IN allowed set; CHECK (enabled = false OR stage IS NOT NULL) |
| version | integer | NOT NULL DEFAULT 1 |
| updated_by_user_id | uuid FK users | NOT NULL |
| updated_at | timestamptz | NOT NULL |

`workflow_configuration_history`: `id uuid PK`, `config_version integer`, `previous jsonb NULL`, `new jsonb NOT NULL`, `changed_by_user_id uuid`, `remarks varchar(500) NULL`, `changed_at timestamptz`. Append-only (same trigger pattern as 10.4). Absence of the singleton row = unconfigured (fail closed, FR-007.43).

### 10.3 `transfer_task_assignments` `[PROPOSED]`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| transfer_id | uuid FK transfer_requests | NOT NULL |
| stage_status | varchar(48) | status the task belongs to |
| task_role | varchar(24) | REPORTING_MANAGER, RECEIVING_MANAGER, HR, IT, EMPLOYEE |
| assignee_user_id | uuid FK users NULL | |
| assignee_pool_scope | jsonb NULL | e.g. `{locationId, departmentId}` for HR pool |
| state | varchar(16) | PENDING, SUSPENDED, COMPLETED, SUPERSEDED, CANCELLED |
| source | varchar(32) | AUTO_MAPPING, AUTO_SCOPE, REASSIGNED (SPEC-010), RETURNED_AFTER_CLARIFICATION |
| assigned_by_user_id | uuid NULL | NULL = system |
| assigned_at | timestamptz | |
| completed_by_user_id | uuid NULL | pool actor recorded here |
| completed_at | timestamptz NULL | |
| completed_action | varchar(40) NULL | |
| history_id | uuid NULL | transition history entry that closed it |
| previous_assignment_id | uuid NULL | chain for reassignment |
| created_at, updated_at | timestamptz | |

Constraints / indexes: `CHECK (assignee_user_id IS NOT NULL OR assignee_pool_scope IS NOT NULL)`; partial UNIQUE `(transfer_id) WHERE state = 'PENDING'` (one pending owner); INDEX `(assignee_user_id, state)`; INDEX `(transfer_id, created_at)`; INDEX `(task_role, state)`.

`transfer_workflow_state` (1:1): `transfer_id uuid PK FK`, `reapproval_return_status varchar(48) NULL`, `reapproval_trigger varchar(16) NULL` (ORG_CHANGE, DATE_CHANGE), `updated_at`. Cleared when Re-Approval is approved or the transfer enters a final status.

### 10.4 `transfer_workflow_history` `[PROPOSED]`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| transfer_id | uuid FK | NOT NULL |
| sequence_no | integer | per transfer, UNIQUE (transfer_id, sequence_no), assigned under the row lock |
| action | varchar(40) | workflow action code |
| from_status | varchar(48) | NOT NULL |
| to_status | varchar(48) | NOT NULL (equal to from_status for non-status actions) |
| status_changed | boolean | |
| actor_user_id | uuid | NOT NULL |
| actor_role | varchar(24) | role at time of action |
| reason | text NULL | rejection / clarification / block reason etc. |
| comments | text NULL | |
| visibility | varchar(16) | EMPLOYEE_VISIBLE or INTERNAL (TDD-007.09) |
| metadata | jsonb NULL | clarification id, cycle, return status, rule id, routing decision, re-approval trigger |
| request_id | varchar(64) | correlation |
| created_at | timestamptz | NOT NULL |

Append-only: `BEFORE UPDATE OR DELETE` trigger raises exception; application DB role has INSERT/SELECT only (SPEC-001 audit strategy). Index `(transfer_id, sequence_no)`, `(actor_user_id, created_at)`.

### 10.5 `transfer_clarifications` `[PROPOSED]`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| transfer_id | uuid FK | |
| cycle_no | integer | UNIQUE (transfer_id, cycle_no) |
| requested_by_user_id / requested_by_role | uuid / varchar(24) | |
| requested_at | timestamptz | |
| question | text NOT NULL | CHECK (length(btrim(question)) > 0) |
| return_status | varchar(48) | stage to return to |
| reviewer_assignment_id | uuid FK assignments | suspended reviewer task |
| responsible_user_id | uuid FK users | responder |
| state | varchar(24) | OPEN, RESPONDED, CLOSED_BY_TERMINATION |
| response | text NULL | CHECK (state <> 'RESPONDED' OR length(btrim(response)) > 0) |
| responded_by_user_id / responded_at | uuid / timestamptz NULL | |
| request_history_id / response_history_id | uuid FK history | |

Partial UNIQUE `(transfer_id) WHERE state = 'OPEN'`.

### 10.6 Migration order

1. `workflow_configuration` + history; 2. `transfer_workflow_history`; 3. `transfer_task_assignments` + `transfer_workflow_state`; 4. `transfer_clarifications`. Requires SPEC-006 `transfer_requests` first. Reversible `down` for each; no data seed (TDD-007.01).

---

## 11. Backend Implementation

Module `backend/src/modules/workflow/` (layered: route -> middleware -> validation -> controller -> service -> repository -> model).

| Path | Responsibility |
|---|---|
| `constants/workflow.constants.ts` | Enums, sets (ACTIVE, FINAL, HR_CONTROLLED, IT_CONTROLLED), denial reasons |
| `registry/transition-registry.ts` | Frozen rules (section 16) |
| `registry/registry-integrity.ts` | `assertRegistryIntegrity()` |
| `engine/workflow-engine.service.ts` | `transition()` pipeline |
| `engine/guards/*.ts` | `scope.guard`, `pending-owner.guard`, `origin-stage.guard`, `self-approval.guard` |
| `engine/handler-registry.ts` | `HandlerRegistry`, lifecycle, terminate hooks |
| `engine/workflow-guard.ts` | `WorkflowGuard.assertStatusIn` for other modules |
| `engine/routing.ts` | Named routing functions |
| `services/assignment.service.ts` + `resolvers/*.ts` | Pending owner |
| `services/configuration.service.ts` | Config read/update |
| `services/clarification.service.ts` | Clarification cycle |
| `services/history.service.ts` | Scoped history read |
| `services/review.service.ts` | Review DTO |
| `handlers/approve.handler.ts`, `reject.handler.ts`, `clarify.handler.ts`, `respond.handler.ts`, `comment.handler.ts` | Generic handlers |
| `repositories/*.ts` | Only layer touching Sequelize models; only `transfer-status.repository.ts` writes `status` |
| `validations/*.ts` | Joi / Celebrate schemas |
| `controllers/*.ts`, `routes/*.ts` | HTTP |

Engine skeleton (informative; ES6+, async/await, try/catch per INT standards):

```ts
async transition(actor: ActorContext, cmd: TransitionCommand): Promise<TransitionResult> {
  let denial: DenialRecord | null = null;
  try {
    return await withTransaction(async (trx) => {
      const transfer = await this.repo.lockById(cmd.transferId, trx);          // FOR UPDATE
      const rule = this.authorizeAndResolve(actor, transfer, cmd);              // scope, registry, guards -> throws Denied
      this.validatePayload(rule, cmd.payload);                                  // 400 after authorization
      const config = await this.config.readForRouting(trx);                     // FOR SHARE
      const facts = await this.handlers.prepare(rule, ctx);
      const toStatus = this.routing.resolve(rule, transfer, facts, config);
      await this.handlers.validate(rule, ctx, facts);
      await this.repo.compareAndSetStatus(transfer, toStatus, trx);
      await this.handlers.apply(rule, ctx, facts);
      await this.assignments.handOver(transfer, rule, toStatus, actor, trx);
      const history = await this.history.append(transfer, rule, toStatus, actor, cmd, trx);
      await this.audit.record(this.buildAuditEvents(rule, history), { trx });
      await this.notifications.enqueue(rule.notify, this.buildPayload(history), { trx });
      return { transferId: transfer.id, from: transfer.status, to: toStatus, historyId: history.id };
    });
  } catch (error) {
    if (error instanceof DeniedError) { denial = error.record; }
    else { throw error; }
  }
  await this.auditSecurityEvent(denial);                                       // separate transaction, after rollback
  throw new InvalidWorkflowTransitionError();                                  // 403, fixed message
}
```

Logging: Winston/Pino via SPEC-001 logger with `requestId`, `transferId`, `ruleId`; never log tokens or credentials; reasons/comments are business text and are not logged at info level.

---

## 12. API Requirements

Base `/api/v1`; envelope per SPEC-001 `{success, data, meta}` / `{success:false, error:{code,message,details,requestId}}`. All endpoints require authentication (401 otherwise). `:transferId` is a UUID validated in params.

### 12.1 Action endpoints (all call `WorkflowEngine.transition`)

| Method + path | Purpose | Authz | Request body | Success |
|---|---|---|---|---|
| POST `/transfers/:transferId/approve` | APPROVE at the caller's pending manager stage | Reporting Manager / Receiving Manager, pending owner, in scope, status in (PRM, PRcvM, REAPPROVAL) | `{ "comments": "optional string <=2000" }` | 200 `{ transferId, status, nextStatus, historyId }` |
| POST `/transfers/:transferId/reject` | REJECT | Same plus HR in PENDING_HR_REVIEW (rules SPEC-008) | `{ "reason": "required", "comments": "optional" }` | 200 `{ transferId, status:"REJECTED" }` |
| POST `/transfers/:transferId/clarifications` | REQUEST_CLARIFICATION | Pending owner in PRM, PRcvM, PENDING_HR_REVIEW, REAPPROVAL | `{ "question": "required" }` | 201 `{ clarificationId, cycleNo, status:"INFO_REQUIRED", returnStatus, responsibleUserId }` |
| POST `/transfers/:transferId/clarifications/:clarificationId/response` | RESPOND_CLARIFICATION | Responsible user only, status INFO_REQUIRED, clarification OPEN | `{ "response": "required" }` (attachments TDD-007.16) | 200 `{ status: <returnStatus>, clarificationId, cycleNo }` |
| POST `/transfers/:transferId/comments` | ADD_COMMENT (no status change) | Pending manager owner in PRM, PRcvM, REAPPROVAL | `{ "comment": "required <=2000" }` | 201 `{ historyId }` |

Other SPECs expose their own action endpoints (submit, HR validate, payroll, IT, withdraw, block, resume, cancel, reassign) that call the same engine with their action code.

Validation (all): bodies Joi-validated, unknown fields rejected, strings trimmed, control characters removed, length limits `[PROPOSED]` (TDD-007.15), HTML not interpreted (output-encoded in UI). `reason`, `question`, `response` must contain a non-whitespace character.

Errors for 12.1:

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing/blank `reason`/`question`/`response`, malformed UUID, unknown field (`details:[{field,message}]`). Only after authorization passed |
| 401 | (SPEC-002 code) | Missing / invalid / expired token |
| 403 | `INVALID_WORKFLOW_TRANSITION` | Role, scope, pending-owner, current status or action not permitted (message exactly "The requested action is not permitted for the current transfer status.") |
| 409 | `WORKFLOW_CONFIGURATION_MISSING` / `ASSIGNEE_NOT_RESOLVABLE` / `WORKFLOW_STATE_CONFLICT` | See FR-007.34, 43, 18 |
| 409 | `VACANCY_CAPACITY_UNAVAILABLE` | Passed through from SPEC-005 on SPEC-008 rows |
| 500 | `INTERNAL_ERROR` | Unexpected; transaction rolled back; no stack trace exposed |

### 12.2 Read endpoints

| Method + path | Purpose | Authz | Response |
|---|---|---|---|
| GET `/transfers/:transferId/workflow-history?page&pageSize` | Approval / workflow history | Per scope table 15.2; out-of-scope 403 | `data: [{ sequenceNo, action, fromStatus, toStatus, actor:{userId,name,role}, reason, comments, at, metadata }]` (fields filtered by role, 15.2) |
| GET `/transfers/:transferId/clarifications` | Clarification cycles | Employee own, assignee/in-scope managers and HR, Super Admin | list of cycles `{cycleNo, question, requestedBy, requestedAt, response, respondedBy, respondedAt, state}` |
| GET `/transfers/:transferId/review` | Reviewer aggregate | Pending assignee (current or previous), HR in scope, Super Admin | `{ transfer:{reference, employee:{...minimal}, current:{dept,designation,location,reportingManager}, proposed:{dept,designation,location,vacancyRef}, effectiveDate, reason}, status, pendingOwner, previousDecisions:[...], comments:[...], clarifications:[...], reapproval:{changes:[{field,previous,new}], changeReason}\|null, allowedActions:[...] }` (`allowedActions` is UX only) |
| GET `/workflow/tasks?state=PENDING&role=&page&pageSize&sort&order` | Caller's own assignments (worklist primitive; dashboards in SPEC-014) | Any authenticated role, own assignments only | paginated `{ assignmentId, transferId, reference, stageStatus, taskRole, assignedAt, employeeName }` |
| GET `/admin/workflow/transition-matrix` | Registry as data | Super Admin | `{ statuses:[...], rules:[{id,from,role,action,to,reasonRequired,source,ownerSpec}] }` |

### 12.3 Configuration endpoints (Super Admin only; others 403 `FORBIDDEN` per SPEC-002)

| Method + path | Request | Response |
|---|---|---|
| GET `/admin/workflow-configuration` | - | `{ receivingManagerEnabled, dateChangeReapproval:{enabled, stage}, version, updatedBy, updatedAt, configured:boolean, inFlightInReceivingManagerStage:int }` (configured=false and nulls if never saved) |
| PUT `/admin/workflow-configuration` | `{ receivingManagerEnabled: boolean, dateChangeReapproval:{enabled:boolean, stage:string\|null}, expectedVersion:int\|null, remarks?:string<=500 }` | 200 updated config. 400 `VALIDATION_ERROR` (enabled without stage; stage `PENDING_RECEIVING_MANAGER_APPROVAL` while RM disabled; stage not in allowed set). 409 `CONFIGURATION_VERSION_CONFLICT` |
| GET `/admin/workflow-configuration/history?page&pageSize` | - | paginated history rows |

Direct API bypass: every endpoint repeats the full authorization chain server-side; the frontend never filters.

---

## 13. Frontend Implementation

Next.js App Router, TypeScript, Tailwind; built on the SPEC-001 UI kit and SPEC-003 shell. Role-aware navigation shows "Approvals" for Reporting Manager / Receiving Manager (and Employee sees clarification prompts on SPEC-006 tracking page).

| Path / component | Description |
|---|---|
| `frontend/src/app/approvals/page.tsx` | "My approvals" table from `GET /workflow/tasks` (pagination, search, sort, status badges, empty state "No pending approvals", loading skeleton, error state) |
| `frontend/src/app/approvals/[transferId]/page.tsx` | Review screen: summary card (reference, status badge, pending owner), requested details, current vs proposed values, effective date, employee reason, previous decisions timeline, comments, clarification thread, re-approval changes panel (previous vs new values, change reason), decision bar |
| `frontend/src/components/workflow/DecisionActionBar.tsx` | Buttons rendered from `allowedActions`: Approve, Reject, Request Clarification; disabled while submitting; on 403 `INVALID_WORKFLOW_TRANSITION` shows non-technical message "This action is no longer available for this request" and refetches |
| `frontend/src/components/workflow/ReasonDialog.tsx` | Confirmation dialog; reason/question required (inline validation, required indicator, trimmed non-empty, character counter); Approve uses confirm dialog with optional comment |
| `frontend/src/components/workflow/ClarificationThread.tsx`, `ClarificationResponseForm.tsx` | Cycle list; response form exported for embedding in the SPEC-006 Employee tracking page; shown only to the responsible user while OPEN |
| `frontend/src/components/workflow/WorkflowHistoryTimeline.tsx` | Shared timeline (status badge, actor, role, time, reason, comments); consumed by SPEC-006 / SPEC-014 |
| `frontend/src/app/admin/workflow-configuration/page.tsx` + `WorkflowConfigForm.tsx` | Toggles: Receiving Manager enabled; date-change re-approval enabled + stage select; shows version, last updated, in-flight count warning; confirmation dialog before save; history table below; "not configured" banner when no row |

UX states: loading, empty, no-access (403), error, version-conflict ("Configuration was changed by another administrator; reload"). Accessibility: labelled controls, focus trap in dialogs, keyboard operable, status badges with text not colour alone, ARIA live region for result toasts (NFR-008). The UI never displays `denialReason`. Frontend hiding is UX only; backend enforces (BRD-026).

---

## 14. Validation Rules

| Field | Rule |
|---|---|
| transferId, clarificationId | UUID v4 format |
| action (internal) | Must be in the 19-action enum |
| reason / question / response | string, trimmed, 1..2000 chars `[PROPOSED]`, at least one non-whitespace character, control characters stripped |
| comments / comment | string, trimmed, 0..2000 (comment endpoint 1..2000) |
| config booleans | strict boolean |
| date_change_reapproval_stage | One of allowed set (FR-007.47) or null; required when enabled |
| expectedVersion | integer or null (null only allowed for first save) |
| unknown body fields | rejected |
| Reason requirement per rule | From registry `reasonRequired`: REJECT, REQUEST_CLARIFICATION, WITHDRAW, BLOCK, CANCEL, REASSIGN, HR_CHANGE_ORG_DATA = true (BRD-027/033/034/035); others false |

---

## 15. Authorization & Security Rules

### 15.1 Chain implemented per request

1. Authenticated user (401).
2. Role (registry rule exists for role).
3. Org scope (`ScopeResolver.canAccessTransfer(actor, transfer)`).
4. Transfer request (exists, locked).
5. Current status (rule `from`).
6. Requested action + pending-owner / origin-stage / self-approval guards.
7. Allowed next status (static or routed).

Any failure in 2..6 -> 403 `INVALID_WORKFLOW_TRANSITION` for transition endpoints; for read endpoints a scope failure -> 403 `FORBIDDEN` (SPEC-002 generic, audited as `AUTHORIZATION_DENIED`).

### 15.2 History / clarification visibility

| Role | Sees | Fields |
|---|---|---|
| Employee | Own transfers | Entries with `visibility=EMPLOYEE_VISIBLE`: status changes, decision reasons (rejection, clarification), responses; manager comments per TDD-007.09 |
| Reporting / Receiving Manager | Transfers where they hold or held an assignment, or employee in hierarchy / target scope | Full entries |
| HR | Transfers in HR location/organisation scope | Full entries |
| IT | Transfers where an IT assignment exists | Minimal: status, timestamps, actor role; no reasons/comments of earlier stages `[TDD-REQUIRED]` TDD-007.09 |
| Super Admin | All | Full entries |
| Previous assignee after reassignment | Retains read | Per role above (BRD-035) |

### 15.3 Denial reason codes (internal, audited, never returned)

`ROLE_NOT_ALLOWED`, `STATUS_NOT_ALLOWED`, `FINAL_STATUS`, `OUT_OF_SCOPE`, `NOT_PENDING_OWNER`, `PREVIOUS_ASSIGNEE`, `ORIGIN_STAGE_MISMATCH` (e.g. HR cancel of IT-blocked), `SELF_APPROVAL`, `DRAFT_EXCLUDED`, `UNKNOWN_ACTION`, `TRANSFER_NOT_VISIBLE`.

### 15.4 Security controls

- Backend authoritative; no trust of client-supplied role, status or next status (request bodies never contain `status`/`toStatus`).
- Reasons, comments and responses are stored as text, output-encoded in UI, never executed; no `eval`.
- Audit and history never contain credentials or tokens.
- Rate limiting and body-size limits from SPEC-001/002 apply.
- Error responses never leak stack, SQL or the denial reason.
- IDOR: transfer ids from other employees yield the same 403 (and Employee role never learns existence).
- Configuration endpoints Super Admin only; every change audited.

---

## 16. Workflow / State Transition Rules

### 16.1 Complete end-to-end approved path

| Step | From status | Actor / action | To status | Notifications | Vacancy | Owner SPEC |
|---|---|---|---|---|---|---|
| S1 | DRAFT | Employee SUBMIT | PENDING_REPORTING_MANAGER_APPROVAL | Employee (submitted), Reporting Manager (approval required) | None | 006 |
| S2 | PENDING_REPORTING_MANAGER_APPROVAL | Reporting Manager APPROVE | PENDING_RECEIVING_MANAGER_APPROVAL if Receiving Manager enabled, else PENDING_HR_REVIEW | Employee (approval completed), next approver | None | 007 |
| S3 | PENDING_RECEIVING_MANAGER_APPROVAL | Receiving Manager APPROVE | PENDING_HR_REVIEW | Employee, HR (HR action required) | None | 007 |
| S4 | PENDING_HR_REVIEW | HR HR_VALIDATE_APPROVE | HR_PROCESSING | Employee / relevant team | Validate and RESERVE | 008 (+005) |
| S4a (loop) | HR_PROCESSING | HR HR_CHANGE_ORG_DATA (Department/BU, Designation, Location or Reporting Manager changed, reason required) | PENDING_RECEIVING_MANAGER_REAPPROVAL when Receiving Manager enabled (else stays HR_PROCESSING, no status change) | Receiving Manager + Employee | Revalidated, old/new adjusted | 008 (routing 007) |
| S4b (loop) | PENDING_RECEIVING_MANAGER_REAPPROVAL | Receiving Manager APPROVE | HR_PROCESSING (HR re-confirms updated organisation info) | HR + Employee | Reservation retained | 007 |
| S5 | HR_PROCESSING | HR COMPLETE_HR_PROCESSING | PAYROLL_PROCESSING | HR / Payroll users | None | 008/009 |
| S6 | PAYROLL_PROCESSING | Authorised HR MARK_PAYROLL_COMPLETED | PENDING_IT_ACTION | IT / relevant users | None | 009 |
| S7 | PENDING_IT_ACTION | IT COMPLETE_IT_TASKS or NO_IT_ACTION_REQUIRED (remark) | PENDING_IT_FINAL_APPROVAL | Employee / relevant users | None | 009 |
| S8 | PENDING_IT_FINAL_APPROVAL | IT IT_FINAL_APPROVE (five completion conditions) | COMPLETED | Employee + stakeholders | Reservation becomes final allocation | 009 |

Clarification loop (any of S2, S3, S4, S4b origin): reviewer REQUEST_CLARIFICATION -> INFO_REQUIRED -> responsible user RESPOND_CLARIFICATION -> back to the same status and same reviewer; repeatable; no restart; reservation retained.

Rejection (S2, S3, S4, S4b): -> REJECTED (final). Early exit rows (Withdraw, Block, Resume, Cancel, Reassign) are SPEC-010.

State diagram (informative):

```
DRAFT -> PRM -> [PRcvM if enabled] -> PHR -> HRP -> PAY -> PITA -> PITFA -> COMPLETED
          |  \________ INFO_REQUIRED <-> (return to origin) ________/
          |                         HRP -> REAPP -> HRP   (BRD-024)
          +--> REJECTED   (PRM, PRcvM, PHR, REAPP)
Withdraw: PRM, PRcvM, INFO_REQUIRED, PHR -> WITHDRAWN
Block: active non-final -> BLOCKED -> (resume) -> stored status;  Cancel: active -> CANCELLED
```

### 16.2 BRD-027 matrix as data

Legend: Role codes RM=REPORTING_MANAGER, RCV=RECEIVING_MANAGER, EMP=EMPLOYEE, HR, IT, SA=SUPER_ADMIN. Status abbreviations: PRM, PRcvM, INFO, PHR, HRP, REAPP, PAY, PITA, PITFA, BLK. Handler owner is the SPEC registering behaviour; "007" = generic handler here. Reason? = mandatory reason/question/remark in payload. Source: B = stated by BRD-027 table / rules; D = DERIVED; T = TDD-REQUIRED.

| Rule ID | From | Role | Action | To | Reason? | Guards | Handler | Notify event codes | Src |
|---|---|---|---|---|---|---|---|---|---|
| TR-001 | DRAFT | EMP | SUBMIT | PRM | No | own request | 006 | TRANSFER_SUBMITTED, APPROVAL_REQUIRED | B |
| TR-002 | PRM | RM | APPROVE | PRcvM if RM-enabled else PHR (`routeAfterReportingManagerApproval`) | No | scope, pending owner | 007 | APPROVAL_COMPLETED, APPROVAL_REQUIRED (next) or HR_ACTION_REQUIRED | B |
| TR-003 | PRM | RM | REJECT | REJECTED | Yes | scope, pending owner | 007 | TRANSFER_REJECTED | B |
| TR-004 | PRM | RM | REQUEST_CLARIFICATION | INFO | Yes | scope, pending owner | 007 | CLARIFICATION_REQUESTED | B |
| TR-005 | PRcvM | RCV | APPROVE | PHR | No | scope, pending owner | 007 | APPROVAL_COMPLETED, HR_ACTION_REQUIRED | B |
| TR-006 | PRcvM | RCV | REJECT | REJECTED | Yes | same | 007 | TRANSFER_REJECTED | B |
| TR-007 | PRcvM | RCV | REQUEST_CLARIFICATION | INFO | Yes | same | 007 | CLARIFICATION_REQUESTED | B |
| TR-008 | INFO | EMP (responsible user) | RESPOND_CLARIFICATION | previous stage (`returnAfterClarification`) | No (response required) | responsible user, OPEN clarification | 007 | CLARIFICATION_RESPONDED | B |
| TR-009 | PHR | HR | HR_VALIDATE_APPROVE | HRP | No | scope, pending owner | 008 | APPROVAL_COMPLETED | B |
| TR-010 | PHR | HR | REJECT | REJECTED | Yes | scope, pending owner | 007 (+008 ineligible rules) | TRANSFER_REJECTED | B |
| TR-011 | PHR | HR | REQUEST_CLARIFICATION | INFO | Yes | scope, pending owner | 007 (+008) | CLARIFICATION_REQUESTED | B |
| TR-012 | HRP | HR | HR_CHANGE_ORG_DATA | REAPP if changedFields in {dept/BU, designation, location, reporting manager} and RM-enabled; else HRP (no status change) (`routeAfterOrgChange`) | Yes (change reason) | scope, pending owner | 008 | REAPPROVAL_REQUIRED | B (no-reapproval self-loop D) |
| TR-013 | REAPP | RCV | APPROVE | HRP (`returnAfterReapproval`, default HRP) | No | scope, pending owner | 007 | APPROVAL_COMPLETED | B |
| TR-014 | REAPP | RCV | REJECT | REJECTED | Yes | same | 007 | TRANSFER_REJECTED | B |
| TR-015 | REAPP | RCV | REQUEST_CLARIFICATION | INFO | Yes | same | 007 | CLARIFICATION_REQUESTED | D, TDD-007.06 |
| TR-016 | HRP | HR | COMPLETE_HR_PROCESSING | PAY | No | scope, pending owner | 008/009 | PAYROLL_TASK_ASSIGNED | B |
| TR-017 | PAY | HR (authorised) | MARK_PAYROLL_COMPLETED | PITA | No (remarks if applicable) | scope | 009 | IT_TASK_ASSIGNED | B |
| TR-018 | PITA | IT | COMPLETE_IT_TASKS | PITFA | No | scope, assignee | 009 | APPROVAL_COMPLETED | B |
| TR-019 | PITA | IT | NO_IT_ACTION_REQUIRED | PITFA | Yes (remark) | scope, assignee | 009 | APPROVAL_COMPLETED | B |
| TR-020 | PITFA | IT | IT_FINAL_APPROVE | COMPLETED | No | scope, assignee, completion gate (009) | 009 | TRANSFER_COMPLETED | B |
| TR-021 | PRM | EMP | WITHDRAW | WITHDRAWN | Yes | own request | 010 | TRANSFER_WITHDRAWN | B |
| TR-022 | PRcvM | EMP | WITHDRAW | WITHDRAWN | Yes | own request | 010 | TRANSFER_WITHDRAWN | B |
| TR-023 | INFO | EMP | WITHDRAW | WITHDRAWN | Yes | own request | 010 | TRANSFER_WITHDRAWN | B |
| TR-024 | PHR | EMP | WITHDRAW | WITHDRAWN | Yes | own request | 010 | TRANSFER_WITHDRAWN | B |
| TR-025 | any of PRM, PRcvM, INFO, PHR, HRP, REAPP, PAY, PITA, PITFA | SA | BLOCK | BLK (previous status stored) | Yes | none | 010 | TASK_BLOCKED | B (BLK itself excluded D) |
| TR-026 | PHR, HRP, PAY | HR | BLOCK | BLK | Yes | HR scope | 010 | TASK_BLOCKED | B |
| TR-027 | PITA, PITFA | IT | BLOCK | BLK | Yes | IT scope | 010 | TASK_BLOCKED | B |
| TR-028 | BLK | SA | RESUME | stored pre-block status | Remarks | revalidation (010) | 010 | TRANSFER_RESUMED | B |
| TR-029 | BLK | HR | RESUME | stored status (HR-controlled) | Remarks | origin in HR set, HR scope | 010 | TRANSFER_RESUMED | B |
| TR-030 | BLK | IT | RESUME | stored status (IT-controlled) | Remarks | origin in IT set, IT scope | 010 | TRANSFER_RESUMED | B |
| TR-031 | any active incl. BLK (10 statuses) | SA | CANCEL | CANCELLED | Yes | none | 010 | TRANSFER_CANCELLED | B |
| TR-032 | PHR, HRP, PAY | HR | CANCEL | CANCELLED | Yes | HR scope | 010 | TRANSFER_CANCELLED | B |
| TR-033 | BLK | HR | CANCEL | CANCELLED | Yes | blocked-from stage in HR set, HR scope; IT-origin = refused + security audit | 010 | TRANSFER_CANCELLED | B |
| TR-034 | PRM, PRcvM, PHR, HRP, REAPP, PAY, PITA, PITFA | SA | REASSIGN | same status | Yes | target user has role + scope | 010 | TASK_REASSIGNED | B |
| TR-035 | PRM, PRcvM, REAPP | RM / RCV (matching) | ADD_COMMENT | same status | No (comment required) | scope, pending owner | 007 | none | D (BRD-012, BRD-024) |
| TR-036 | PHR, HRP, PAY | HR | CHANGE_EFFECTIVE_DATE | same status, or configured re-approval stage (`routeAfterDateChange`) | Yes (reason) | HR scope, pending owner (PAY: authorised HR) | 008 | REAPPROVAL_REQUIRED (if routed) | D (BRD-031), TDD-007.04 |
| TR-037 | PRM, PRcvM, INFO, PHR, HRP, REAPP, PAY, PITA, PITFA | SA | CHANGE_EFFECTIVE_DATE | same status, or configured stage | Yes (reason) | none | 008 | REAPPROVAL_REQUIRED (if routed) | D (BRD-031) |

Explicit refusals in the BRD matrix (HR cancel IT-blocked request; any non-Super-Admin reassign) are expressed as ABSENCE of an allowed cell plus origin-stage guard on TR-033; the attempt is denied with 403 and audited as a security event.

Vacancy / downstream column of BRD-027 is descriptive (not enforced by 007 except rejection release): reservation at TR-009 (SPEC-005), release on TR-003/006/010/014 (here), 021..024, 031..033 (SPEC-010), final allocation on TR-020.

### 16.3 Derived / TDD-REQUIRED rows (not in BRD matrix)

| Row | Why it exists | Default in this SPEC | Decision |
|---|---|---|---|
| TR-015 Receiving Manager clarification during Re-Approval | BRD-024 says the Receiving Manager "can ... request clarification"; matrix has no row | Allowed, returns to REAPP, responder = Employee | TDD-007.06 |
| HR clarification return path / who responds | BRD-034 "Employee or appropriate responsible user"; gaps k, r | Employee responds; returns to PENDING_HR_REVIEW same HR | TDD-007.05 |
| HR_CHANGE_ORG_DATA when Receiving Manager disabled (no re-approval) | BRD-024 "continues without returning" | Self-loop in HR_PROCESSING, history entry, no status change | D |
| ADD_COMMENT rows (TR-035) | BRD-012 / BRD-024 "add comments" | Self-loop history entry | D |
| CHANGE_EFFECTIVE_DATE rows (TR-036/037) | BRD-031 who/where; optional re-approval | HR in HR-controlled stages, Super Admin in non-final non-blocked stages | TDD-007.04, 007.08 |
| Reassign / Block origin semantics for INFO and BLK | BRD-035 "active pending task" | Reassign denied in INFO/BLK; Block denied in BLK | TDD-007.11 |
| Super Admin approve/reject on behalf | BRD silent | Not allowed | TDD-007.08 |
| Employee as responder only | BRD-034 | Employee is the only role cell for RESPOND_CLARIFICATION | TDD-007.05 |

### 16.4 Data-driven vs code-defined choice and matrix test

Choice (recommended): code-defined typed registry (single reviewed file, versioned with the code, immutable at runtime). A DB-editable matrix is rejected because it would let configuration bypass BRD-027 and BRD-039. Test strategy: the independent golden fixture `tests/backend/workflow/fixtures/brd027-matrix.golden.json` is authored from this section by QA (not generated from the registry) and lists the allowed cells; `matrix.spec.ts` enumerates every (status x role x action) cell: 15 statuses x 6 roles x 19 actions = 1,710 cells; allowed set must equal the golden set exactly (expected 78 allowed cells: 62 BRD-027-stated + 16 DERIVED; the remaining 1,632 denied). Each denied cell is also asserted to produce 403 `INVALID_WORKFLOW_TRANSITION`, no row changes and one security audit row (run against the real engine with stub handlers for a sampled subset plus all non-final rows; full 1,710 run against the registry resolver). Guard-variant cells (HR cancel on IT-blocked vs HR-blocked, HR/IT resume origin, out-of-scope, previous assignee, self-approval) are additional table-driven cases.

Allowed-cell tally for the golden count: SUBMIT 1; PRM 3; PRcvM 3; RESPOND 1; PHR 3; HRP change 1; REAPP 2 (+1 D); COMPLETE_HR 1; PAY 1; PITA 2; PITFA 1; WITHDRAW 4; BLOCK SA 9 + HR 3 + IT 2; RESUME 3; CANCEL SA 10 + HR 4; REASSIGN 8 = 62; D: REAPP clarify 1, ADD_COMMENT 3, CHANGE_EFFECTIVE_DATE 3 + 9 = 16.

### 16.5 Allowed and forbidden outcomes summary

- No transition into DRAFT; no transition out of final statuses.
- COMPLETED only from PITFA by IT_FINAL_APPROVE.
- PRM to PHR directly only when Receiving Manager disabled; PRM to PRcvM only when enabled.
- INFO_REQUIRED returns only to its stored `return_status`.

---

## 17. Transaction & Concurrency Rules

| Rule | Detail |
|---|---|
| Single transaction | Lock, CAS, handlers, assignments, history, audit, outbox in one `withTransaction` (FR-007.17) |
| Isolation | READ COMMITTED + explicit `SELECT ... FOR UPDATE` on `transfer_requests` row `[PROPOSED]` |
| Lock order | transfer -> config (FOR SHARE) -> assignments -> payroll/IT task rows -> vacancy (SPEC-005) -> history inserts. Never reverse [RECONCILED R-5] |
| Concurrent decisions | Two managers approve simultaneously: the first commits, the second acquires the lock, sees the new status and is denied (403 `INVALID_WORKFLOW_TRANSITION`, audited). Same for approve vs withdraw, approve vs reject, double-click |
| Config vs transition | Transition holds `FOR SHARE` on config; PUT takes `FOR UPDATE` and increments version; routing is never evaluated against a half-updated config |
| Lock timeout | Env-configurable `WORKFLOW_LOCK_TIMEOUT_MS`; timeout -> 409 `WORKFLOW_BUSY` `[PROPOSED]`; numeric value TBC with BRD-038 inputs (TDD-007.13) |
| Deadlock | Consistent lock order; on PostgreSQL 40P01 the engine retries the whole transaction once with the same command `[PROPOSED]` (idempotent because nothing committed) |
| Rollback atomicity | Any handler error -> no history, no audit (except the separate security audit), no outbox, status unchanged |
| Sequence numbers | `sequence_no = max+1` computed under the transfer row lock; unique index is the backstop |
| Notification | Outbox rows only; relay is SPEC-012; failure never touches the transition (BRD-036) |
| Security audit | Invalid-attempt audit commits in its own transaction after rollback |
| Idempotency | Replaying the same command after success yields a 403 (status already moved) — callers refetch; no duplicate transition possible |

---

## 18. Audit Requirements

Events are written through `AuditService.record(event,{trx})`; fields always include actor user id, role, action, entity (transfer id + reference + employee id), timestamp, previous/new status, reason/remarks where applicable, request id. No credentials or tokens.

| Event code `[PROPOSED]` | Trigger | Fields captured | BRD |
|---|---|---|---|
| TRANSFER_STATUS_CHANGED | Every successful transition (emitted for all SPECs' rows) | transfer id, from/to status, action, rule id, actor, role, reason, history id | BRD-027, BRD-037 |
| TRANSFER_STAGE_APPROVED | APPROVE by RM / RCV / Re-Approval | approver, role, stage, next status, routing decision (Receiving Manager enabled?), comments | BRD-012, BRD-026 |
| TRANSFER_REJECTED | REJECT | rejected by, role, reason, date/time, stage, reservation released flag | BRD-033, BRD-022 |
| CLARIFICATION_REQUESTED | REQUEST_CLARIFICATION | requested by, role, question/reason, cycle no, return status, responsible user | BRD-034 |
| CLARIFICATION_RESPONDED | RESPOND_CLARIFICATION | responded by, response, cycle no, requested by, return status | BRD-034 |
| WORKFLOW_COMMENT_ADDED | ADD_COMMENT | comment author, role, stage | BRD-012 |
| WORKFLOW_TASK_ASSIGNED | Assignment opened | assignee or pool scope, stage, source | BRD-035 |
| WORKFLOW_INVALID_TRANSITION_ATTEMPT (security) | Denied transition | user, role, transfer id, current status, attempted action, date/time, rejection reason (denialReason) | BRD-OQ-14(d), BRD-026 |
| WORKFLOW_CONFIG_UPDATED | Config PUT | previous, new, changed by, remarks, version | BRD-037, BRD-012, BRD-031 |
| WORKFLOW_ASSIGNEE_UNRESOLVED | Assignee resolution failed (transition aborted) | transfer id, stage, role, actor | BRD-016 (warn-level security-neutral event) |
| WORKFLOW_HISTORY_ACCESS_DENIED | Out-of-scope history/clarification read | user, role, transfer id | BRD-026 (via SPEC-002 `AUTHORIZATION_DENIED`) |

---

## 19. Notification Requirements

Enqueued with `NotificationService.enqueue(eventCode, payload, {trx})`; Email + In-app for workflow events (BRD-036 channel rule); templates and dispatch in SPEC-012; "relevant stakeholders" recipient sets `[TDD-REQUIRED]` (gap i) are resolved in SPEC-012.

| Event code | Recipient | Channel | Trigger task | BRD |
|---|---|---|---|---|
| TRANSFER_SUBMITTED | Employee | Email + In-app | SPEC-006 via TR-001 | BRD-036 |
| APPROVAL_REQUIRED | Assigned approver (RM / RCV on entering their stage) | Email + In-app | TASK-007.13 (TR-001, TR-002) | BRD-036, BRD-027 |
| APPROVAL_COMPLETED | Employee (+ next approver) | Email + In-app | TASK-007.13 | BRD-036 |
| HR_ACTION_REQUIRED | Assigned HR when entering PENDING_HR_REVIEW | Email + In-app | TASK-007.13 | BRD-036 |
| TRANSFER_REJECTED | Employee (reason included); HR also on Re-Approval rejection | Email + In-app | TASK-007.14 | BRD-033, BRD-036 |
| CLARIFICATION_REQUESTED | Employee / responsible user | Email + In-app | TASK-007.15 | BRD-034, BRD-036 |
| CLARIFICATION_RESPONDED | Requesting approver | Email + In-app | TASK-007.15 | BRD-027 matrix row (Info Required) |
| REAPPROVAL_REQUIRED | Receiving Manager + Employee | Email + In-app | declared here, raised by SPEC-008 | BRD-027 matrix, BRD-024 |

Events for later stages (PAYROLL_TASK_ASSIGNED, IT_TASK_ASSIGNED, TASK_BLOCKED, TRANSFER_COMPLETED, TRANSFER_WITHDRAWN, TRANSFER_CANCELLED, TRANSFER_RESUMED, TASK_REASSIGNED) are declared in registry rows and owned by SPEC-008/009/010 / SPEC-012. Failure rules (no rollback, logged, retriable, idempotent) per BRD-036 are implemented by SPEC-001/012 kernels; this SPEC adds a test that a failing dispatcher leaves the transition committed.

---

## 20. Error & Edge Cases

| # | Case | Behaviour |
|---|---|---|
| E1 | Approve on a request already moved by another approver | 403 `INVALID_WORKFLOW_TRANSITION`, audited, nothing changes |
| E2 | Approve / reject on Draft, final, or Blocked request | 403 same code |
| E3 | Reject / clarify with blank reason by an authorised pending owner | 400 `VALIDATION_ERROR`; status unchanged |
| E4 | Unauthorised user sends blank reason | 403 (authorization first), no validation detail leaked |
| E5 | Receiving Manager enabled but no Receiving Manager resolvable for target team | 409 `ASSIGNEE_NOT_RESOLVABLE`; Reporting Manager approval is rolled back (request stays in PRM); stage never skipped; Super Admin must fix mapping |
| E6 | Receiving Manager disabled while requests sit in PRcvM | They keep waiting for the decision (no silent skip); Super Admin warned by in-flight count (TDD-007.03) |
| E7 | Config not saved yet | 409 `WORKFLOW_CONFIGURATION_MISSING` on routing transitions |
| E8 | Clarification response from a user other than the responsible user | 403 |
| E9 | Second clarification while one is OPEN | Impossible: status is INFO_REQUIRED, registry has no clarify row there (403) |
| E10 | Clarification response to a CLOSED/RESPONDED clarification | 403 |
| E11 | Request rejected while a clarification is OPEN? Not possible (status INFO_REQUIRED has no reject row for managers); Super Admin Cancel closes it (`CLOSED_BY_TERMINATION`) | - |
| E12 | Reviewer reassigned during INFO_REQUIRED | Not allowed by default (TDD-007.11) |
| E13 | Handler throws (e.g. capacity unavailable) | Full rollback, handler's error code returned, status unchanged, no history |
| E14 | Notification dispatch down | Transition committed; outbox pending; retried by SPEC-012 |
| E15 | Security-audit write fails on invalid attempt | 403 still returned; error logged for operations |
| E16 | Approver is also the requesting employee | 403 (`SELF_APPROVAL`) |
| E17 | Reporting Manager of the transfer is deactivated before decision | Pending assignment remains; Super Admin reassigns (SPEC-010); deactivated user's token invalid (SPEC-002) |
| E18 | Two Super Admins save config simultaneously | Second gets 409 `CONFIGURATION_VERSION_CONFLICT` |
| E19 | Deadlock / lock timeout | One automatic retry; then 409 `WORKFLOW_BUSY` |
| E20 | Unknown action string in an endpoint body or route | 400 `VALIDATION_ERROR` (never reaches registry) |

---

## 21. Acceptance Criteria

| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-007.AC01 | Given a transfer in PRM and the assigned Reporting Manager, when they APPROVE, then status changes only to a status allowed by the registry and history, audit and outbox rows are written in the same transaction | BRD-027 |
| SPEC-007.AC02 | Given any registered rule, when the registry loads, then `assertRegistryIntegrity` passes; and a deliberately broken registry (duplicate cell, COMPLETED from another row) fails boot | BRD-027, BRD-019 |
| SPEC-007.AC03 | Given the golden matrix fixture, when the matrix test enumerates all 1,710 cells, then exactly the 78 listed cells are allowed | BRD-027 |
| SPEC-007.AC04 | Given an authenticated user whose role is not permitted for the current status, when they call the action, then HTTP 403 `INVALID_WORKFLOW_TRANSITION` with message "The requested action is not permitted for the current transfer status." is returned and the status is unchanged | BRD-OQ-14(d) |
| SPEC-007.AC05 | Given the 403 above, then no assignment, vacancy, history, outbox or approval change exists and one `WORKFLOW_INVALID_TRANSITION_ATTEMPT` audit row records user, role, transfer id, current status, attempted action, time and reason | BRD-OQ-14(d), BRD-037 |
| SPEC-007.AC06 | Given the full registry graph, then COMPLETED is reachable only via PITFA / IT / IT_FINAL_APPROVE and every path to it passes HR_PROCESSING, PAYROLL_PROCESSING, PENDING_IT_ACTION, PENDING_IT_FINAL_APPROVAL | BRD-018, BRD-019 |
| SPEC-007.AC07 | Given a missing/expired token, when any workflow endpoint is called, then 401 (not 403) is returned | BRD-026 |
| SPEC-007.AC08 | Given Receiving Manager enabled, when the Reporting Manager approves, then status = PENDING_RECEIVING_MANAGER_APPROVAL and the Receiving Manager is the pending assignee | BRD-012 |
| SPEC-007.AC09 | Given Receiving Manager disabled, when the Reporting Manager approves, then status = PENDING_HR_REVIEW, the Receiving Manager stage is skipped and HR is notified | BRD-012, BRD-027 |
| SPEC-007.AC10 | Given PRcvM and the Receiving Manager, when they APPROVE, then status = PENDING_HR_REVIEW and Employee + HR are notified, no vacancy reservation exists | BRD-027, BRD-028 |
| SPEC-007.AC11 | Given a manager on the review screen, then they see requested details, current vs proposed values, previous decisions, comments and clarification thread | BRD-012 |
| SPEC-007.AC12 | Given the manager adds a comment, then a history entry is stored, status is unchanged, visible per scope | BRD-012 |
| SPEC-007.AC13 | Given Re-Approval with BRD-024 changes, when the Receiving Manager opens it, then previous and updated values and the HR change reason are shown | BRD-024 |
| SPEC-007.AC14 | Given Re-Approval and the Receiving Manager APPROVE, then status = HR_PROCESSING and existing reservation is untouched | BRD-027, BRD-OQ-14(a) |
| SPEC-007.AC15 | Given Re-Approval and Receiving Manager REJECT with a reason, then status = REJECTED, reservation released, HR + Employee notified | BRD-027, BRD-033 |
| SPEC-007.AC16 | Given a Reporting Manager other than the pending assignee (or a previous assignee after reassignment), when they act, then 403 `INVALID_WORKFLOW_TRANSITION` | BRD-035, BRD-026 |
| SPEC-007.AC17 | Given the complete approved path with stubs, then each step of 16.1 yields the stated status, notification and owner | BRD-018 |
| SPEC-007.AC18 | Given the config page, when Super Admin toggles Receiving Manager and confirms, then config is saved, version incremented, `WORKFLOW_CONFIG_UPDATED` audited with previous and new values | BRD-012 |
| SPEC-007.AC19 | Given date-change re-approval disabled, when HR changes only the effective date, then status is unchanged and nobody is asked to re-approve | BRD-031 |
| SPEC-007.AC20 | Given date-change re-approval enabled with a configured stage, when the date changes, then the request routes to that stage/approver and returns to the stored status on approval | BRD-031 |
| SPEC-007.AC21 | Given a Reporting Manager REJECT with a reason, then status = REJECTED, `closed_at` set, history + audit record rejected by, reason, date/time, Employee notified with reason | BRD-033 |
| SPEC-007.AC22 | Given a rejection after a reservation exists, then `VacancyService.release` is called in the same transaction and capacity is available again | BRD-033, BRD-028 |
| SPEC-007.AC23 | Given a Rejected request, when anyone attempts edit, resubmit, approve or any move, then 403 `INVALID_WORKFLOW_TRANSITION` and audited | BRD-033 |
| SPEC-007.AC24 | Given Employee views a rejected request, then reason and history remain visible and the Employee can create a new request with a new reference (SPEC-006) with no approvals carried over | BRD-033, BRD-030 |
| SPEC-007.AC25 | Given a clarification request with a question, then status = INFO_REQUIRED, a cycle row is OPEN, Employee notified, reviewer task SUSPENDED | BRD-034 |
| SPEC-007.AC26 | Given the Employee responds, then status returns to the same stage, same reviewer PENDING again, requesting approver notified, same transfer reference | BRD-034, BRD-027 |
| SPEC-007.AC27 | Given three consecutive clarification cycles, then each is recorded with cycle number and all succeed | BRD-034 |
| SPEC-007.AC28 | Given clarification and response, then previous approvals, history and reservation are unchanged and the workflow is not restarted | BRD-034 |
| SPEC-007.AC29 | Given the audit and history, then requested by, question, response, responded by, date/time are present for each cycle | BRD-034, BRD-037 |
| SPEC-007.AC30 | Given an HR clarification from PENDING_HR_REVIEW, then the request returns to PENDING_HR_REVIEW with the same HR reviewer and reservation retained if it exists | BRD-029, BRD-027 |
| SPEC-007.AC31 | Given a failing notification dispatcher, then the transition remains committed and outbox row stays for retry | BRD-036 |
| SPEC-007.AC32 | Given a handler failure (e.g. capacity unavailable on HR approval), then no status, history, audit (except security events), outbox or assignment change persists | BRD-038, BRD-028 |
| SPEC-007.AC33 | Given two simultaneous approvals by the same assignee, then exactly one succeeds and the other receives 403 | BRD-038, BRD-027 |
| SPEC-007.AC34 | Given an HR user, then they see workflow history of in-scope transfers only; an Employee sees only their own; IT sees the minimal view | BRD-026, BRD-037 |
| SPEC-007.AC35 | Given PRcvM and the assigned Receiving Manager, when they REJECT with a non-blank reason, then status = REJECTED, `closed_at` set, any reservation released in the same transaction, history + audit record rejected by, reason, date/time, and Employee, Reporting Manager and HR are notified with the reason (BRD-027 row: Pending Receiving Manager Approval → Receiving Manager Reject) | BRD-027, BRD-033 |
| SPEC-007.AC36 | Given PRcvM and the assigned Receiving Manager, when they REQUEST CLARIFICATION with a non-blank question, then status = INFO_REQUIRED, a cycle row is OPEN, the Employee is notified, the Receiving Manager task is SUSPENDED and on the Employee response the request returns to PENDING_RECEIVING_MANAGER_APPROVAL with the same Receiving Manager (BRD-027 row: Pending Receiving Manager Approval → Request Clarification) | BRD-027, BRD-034 |

## 22. Negative Acceptance Criteria

| ID | Given / When / Then | BRD-039 / BRD |
|---|---|---|
| SPEC-007.NAC01 | Given a Reporting Manager of another employee's request, when they approve, then 403 `INVALID_WORKFLOW_TRANSITION`, status unchanged, security audit row | BRD-039 Workflow: cannot approve outside role/scope |
| SPEC-007.NAC02 | Given an HR user outside the transfer's location scope, when they act or read history, then 403 and no data exposed | BRD-039 Workflow; BRD-026 |
| SPEC-007.NAC03 | Given IT user, when they call APPROVE on a request in PHR (e.g. attempting to reach Completed), then 403 and status unchanged | BRD-039 Workflow: invalid transitions; BRD-027 example |
| SPEC-007.NAC04 | Given any user, when a request body includes `status`/`toStatus`, then the field is rejected (400) and never used | BRD-027 |
| SPEC-007.NAC05 | Given a direct API call via Postman with a valid token of the wrong role, then identical 403 response as UI | BRD-039 Security: direct API |
| SPEC-007.NAC06 | Given a Completed request, when any normal workflow action (approve, reject, comment, clarify, withdraw) is attempted, then 403 and status unchanged | BRD-039 Workflow: Completed cannot be modified |
| SPEC-007.NAC07 | Given the registry, then no rule other than IT_FINAL_APPROVE reaches COMPLETED; a request in HR_PROCESSING or PAYROLL_PROCESSING cannot be moved to COMPLETED by any role | BRD-039 Workflow: no Completed without IT Final Approval; IT Final Approval vs Payroll (guard SPEC-009) PARTIAL |
| SPEC-007.NAC08 | Given Receiving Manager enabled, when the Reporting Manager has approved, then no actor can move PRM -> PHR or PRcvM -> HR_PROCESSING; HR_VALIDATE_APPROVE in PRcvM is denied | BRD-039 Workflow: Receiving Manager cannot be bypassed |
| SPEC-007.NAC09 | Given HR changes an organisation field with Receiving Manager enabled, then routing = PENDING_RECEIVING_MANAGER_REAPPROVAL and HR cannot proceed with COMPLETE_HR_PROCESSING until re-approved (trigger SPEC-008) | BRD-039 Workflow: BRD-024 PARTIAL |
| SPEC-007.NAC10 | Given a rejected request with a reservation, then capacity is released and capacity never goes negative | BRD-039 Vacancy PARTIAL |
| SPEC-007.NAC11 | Given Employee A requests history/clarifications/review of Employee B's transfer, then 403 and no existence leak | BRD-039 Security: Employee cannot access another's request |
| SPEC-007.NAC12 | Given reject / clarification with empty or whitespace reason by the authorised owner, then 400 and status unchanged | BRD-033, BRD-034 |
| SPEC-007.NAC13 | Given a clarification response from someone other than the responsible user, or to a non-OPEN clarification, then 403 | BRD-034 |
| SPEC-007.NAC14 | Given Rejected request, when Employee tries to re-edit or resubmit under the same reference, then 403 and a new reference is required | BRD-033 |
| SPEC-007.NAC15 | Given a non-Super-Admin calling config PUT/GET, then 403 and config unchanged | BRD-012 |
| SPEC-007.NAC16 | Given config PUT with enabled date-change re-approval but no stage, or stage PENDING_RECEIVING_MANAGER_APPROVAL while RM disabled, then 400 and nothing saved | BRD-031 |
| SPEC-007.NAC17 | Given stale `expectedVersion`, then 409 `CONFIGURATION_VERSION_CONFLICT` | PROPOSED |
| SPEC-007.NAC18 | Given an approver who is also the requesting employee, then 403 `SELF_APPROVAL` internally, same public response | PROPOSED, TDD-007.17 |
| SPEC-007.NAC19 | Given a previous assignee after reassignment, when they act, then 403 but history remains readable | BRD-035 |
| SPEC-007.NAC20 | Given a transition denied by guard, then no outbox/notification row exists for it | BRD-OQ-14(d) |
| SPEC-007.NAC21 | Given the audit table, when any UPDATE/DELETE is attempted on `transfer_workflow_history` by the application role, then it fails | BRD-037, NFR-005 |
| SPEC-007.NAC22 | Given the response body of any 403 from the engine, then it contains no `denialReason`, employee data or stack trace | BRD-026 |

---

## 23. Testing Requirements

Locations: `tests/backend/workflow/` and `tests/frontend/workflow/`. Jest; real PostgreSQL for integration/concurrency. TDD: tests precede implementation (RED -> GREEN).

### 23.1 Unit

| TC | Test |
|---|---|
| TC-007.01 | Constants: 15 statuses, final set, active set equals all minus DRAFT and finals, HR/IT controlled sets exact |
| TC-007.02 | Registry integrity validator accepts the real registry and rejects each broken fixture (duplicate cell, unknown status, rule out of final, extra COMPLETED path, missing reason validator, missing handler) |
| TC-007.03 | Wildcard expansion yields the exact concrete cell list |
| TC-007.04 | Routing functions: Receiving Manager enabled/disabled, org-change facts, date-change toggle, return statuses |
| TC-007.05 | Reason validators (blank, whitespace, over-length) |
| TC-007.06 | Guards: pending-owner, previous assignee, self-approval, origin-stage, scope |
| TC-007.07 | Assignee resolvers (RM, Receiving Manager, HR assigned vs pool, unresolved) |
| TC-007.08 | Error mapping: exact 403 body, no denialReason |

### 23.2 Matrix / Workflow

| TC | Test |
|---|---|
| TC-007.10 | Exhaustive 1,710-cell enumeration vs golden fixture (78 allowed) |
| TC-007.11 | Every denied cell returns 403 with exact code/message (sampled by status via engine, all via resolver) |
| TC-007.12 | Graph invariant: COMPLETED single path; DRAFT never re-entered; finals terminal |
| TC-007.13 | Guard-variant table (HR cancel HR-blocked allowed / IT-blocked denied, HR/IT resume origin, out-of-scope) |
| TC-007.14 | End-to-end approved path with stubs, Receiving Manager enabled and disabled |
| TC-007.15 | Re-approval loop routing and return to HR_PROCESSING; no re-approval when disabled |
| TC-007.16 | Clarification loop x3 from each allowed origin, return stage and reviewer |
| TC-007.17 | Rejection from each allowed origin: final, release hook, notification, history/audit |
| TC-007.18 | Date-change re-approval toggle on/off |

### 23.3 Integration (DB)

| TC | Test |
|---|---|
| TC-007.20 | Single-transaction atomicity: forced failure at each pipeline step leaves zero rows changed |
| TC-007.21 | History append-only trigger and grants |
| TC-007.22 | Partial unique indexes (one PENDING assignment, one OPEN clarification, unique sequence_no/cycle_no) |
| TC-007.23 | CAS failure path (simulated stale version) returns 409 and leaves state |
| TC-007.24 | Security audit persisted in separate transaction after rollback; audit failure still returns 403 |
| TC-007.25 | Notification dispatcher failure does not affect committed transition |
| TC-007.26 | Handler contract: handler using own transaction or writing status is detected by test harness / lint |

### 23.4 API

| TC | Test |
|---|---|
| TC-007.30 | Each endpoint: success, 400, 401, 403, 409 cases per section 12 |
| TC-007.31 | Config GET/PUT: validation matrix, version conflict, audit row, history |
| TC-007.32 | History/clarification/review scope per role (Employee, RM, RCV, HR, IT, SA, previous assignee) |
| TC-007.33 | Review DTO content and `allowedActions` matches registry |

### 23.5 Concurrency

| TC | Test |
|---|---|
| TC-007.40 | N parallel approves by the same assignee: exactly one success |
| TC-007.41 | Approve vs Employee withdraw race (stub): single winner, consistent final state |
| TC-007.42 | Config PUT concurrent with Reporting Manager approve: routing consistent with a committed config version |
| TC-007.43 | Lock-order/deadlock simulation with vacancy handler stub: no deadlock or single retry |

### 23.6 Security

| TC | Test |
|---|---|
| TC-007.50 | IDOR on all read/action endpoints across Employees and organisation scopes |
| TC-007.51 | Direct API with wrong-role tokens equals UI-denied responses |
| TC-007.52 | Mass-assignment: body `status`/`toStatus`/`actor` ignored/rejected |
| TC-007.53 | No credentials/tokens in audit, history, logs |
| TC-007.54 | Injection/XSS strings in reason/comment stored inert and encoded on output |

### 23.7 Frontend

| TC | Test |
|---|---|
| TC-007.60 | Approvals list: loading, empty, error, pagination |
| TC-007.61 | Review screen content, `allowedActions` rendering, re-approval panel |
| TC-007.62 | ReasonDialog: required reason, inline validation, focus trap, keyboard |
| TC-007.63 | 403 `INVALID_WORKFLOW_TRANSITION` handling and refetch |
| TC-007.64 | Clarification response form visibility and submission |
| TC-007.65 | Admin config page: confirm dialog, in-flight warning, version conflict, not-configured banner, SA-only |
| TC-007.66 | Accessibility checks (labels, contrast-independent badges, ARIA) |

### 23.8 Negative

All NAC01..NAC22 map to TC-007.10..TC-007.54 above and are tracked by SPEC-016.

AC35 (Receiving Manager Reject at PRcvM) → TC-007.17, TC-007.11; AC36 (Receiving Manager Request Clarification at PRcvM) → TC-007.16, TC-007.11.

---

## 24. Definition of Done

- [ ] All TASK-007.01..32 complete; migrations reversible and applied on a clean PostgreSQL.
- [ ] Registry integrity test and golden matrix test pass (1,710 cells, 78 allowed).
- [ ] No code path outside the engine's repository writes `transfer_requests.status` (lint/test).
- [ ] All AC and NAC have passing tests; coverage on engine, registry, guards, clarification and configuration services is reviewed at Gate 2.
- [ ] Invalid-transition response is byte-exact: HTTP 403, `INVALID_WORKFLOW_TRANSITION`, "The requested action is not permitted for the current transfer status."
- [ ] Atomicity and concurrency tests pass on real PostgreSQL.
- [ ] Handler contract documented in OpenAPI/README and consumed by stubs for SPEC-006/008/009/010.
- [ ] Audit and notification event codes registered with SPEC-013/012 catalogues.
- [ ] Frontend states and accessibility verified; UI never relies on hiding for security.
- [ ] No AI-generated comments or commit hints; INT standards respected (async/await, try/catch, structured logging, env secrets, validated input).
- [ ] All TDD-007.xx decisions answered or accepted with the recommended defaults at Gate 1.
- [ ] Gate 1 approval recorded; `status.md`, dashboard and `prompt_history.md` synchronised by the owner process.

---

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-007.01 | Initial value of the workflow configuration (Receiving Manager enabled? date-change re-approval?). BRD: "no default assumed". | Fail closed (409 `WORKFLOW_CONFIGURATION_MISSING`) until Super Admin saves the configuration; no seed value. Alternative: installer-provided explicit value | Go-live runbook; SPEC-006 submit blocked until configured |
| TDD-007.02 | How is the Receiving Manager resolved for a request (target department/team scope mapping, multiple managers, none)? (Gap c) | Resolve via SPEC-003 scope mapping on target department + location; one user = direct assignee, many = pool, none = 409 `ASSIGNEE_NOT_RESOLVABLE` | Blocks Receiving Manager stage; SPEC-003/004 data |
| TDD-007.03 | Effect of switching Receiving Manager off/on on requests already in flight | Evaluated at routing time; requests already in PRcvM keep waiting; Super Admin sees count | Prevents bypass (BRD-039) |
| TDD-007.04 | Date-change re-approval: allowed stages/approvers and return path; HR date change in manager stages | Stage in {PRM, PRcvM (if enabled), REAPP}; approver derived from stage; return to stored status (`transfer_workflow_state.reapproval_return_status`); HR changes date in HR-controlled stages only (PENDING_HR_REVIEW, HR_PROCESSING, PAYROLL_PROCESSING), Super Admin elsewhere. [RECONCILED R-8] Merged with TDD-008.05 and TDD-009.13; BRD-031 is silent on the stage so this stays TDD-REQUIRED; SPEC-006 only validates the date and has no re-approval logic | BRD-031, SPEC-008 |
| TDD-007.05 | Who responds to Info Required raised by Receiving Manager (Re-Approval) or HR; return path (gaps k, r) | Employee is responder in all cases; return to origin stage/reviewer; HR may add data via SPEC-008 meanwhile | BRD-034 wording "Employee or appropriate responsible user" |
| TDD-007.06 | Receiving Manager clarification during Re-Approval (BRD-024 allows, matrix lacks a row; gap l) | Allow TR-015 as DERIVED row | Matrix golden count 78 vs 77 |
| TDD-007.07 | HR assignee when employee has no assigned HR / HR pool semantics | Pool by location scope, any in-scope HR can act and is recorded as `completed_by` | SPEC-004 data quality |
| TDD-007.08 | May Super Admin perform manager/HR/IT decisions on behalf ("administrative intervention where policy permits")? | No; Super Admin limited to Block/Resume/Cancel/Reassign/date change/config | Role matrix |
| TDD-007.09 | Visibility of manager comments and clarification text to Employee; IT's view of history | Decisions, reasons, clarifications visible to Employee; manager comments INTERNAL unless flagged; IT minimal view | Privacy (NFR-007) |
| TDD-007.10 | Non-existent transfer id: 404 or 403 | Same 403 for non-Super-Admin; 404 for Super Admin | Enumeration safety |
| TDD-007.11 | Reassign / Block semantics in INFO_REQUIRED and BLOCKED states | Reassign denied in INFO/BLK; Block denied from BLK; Block from INFO allowed (clarification stays OPEN) | SPEC-010 alignment |
| TDD-007.12 | Reporting Manager resolution timing: snapshot at submission vs current mapping at stage entry; manager inactive | Resolve at stage entry from the Transfer Request snapshot (BRD-029 in-flight values); inactive => Super Admin reassignment | SPEC-004/006 data |
| TDD-007.13 | Lock timeout, retry counts, performance targets for transitions | Env-configurable; numbers set after BRD-038 inputs | NFR / BRD-038 |
| TDD-007.14 | Confirm registry is code-defined (not DB-defined) | Code-defined, tested by golden fixture | Change process: matrix change = code + spec change |
| TDD-007.15 | Max length for reason / comment / response | 2000 chars | UI + DB column types |
| TDD-007.16 | Clarification response attachments | Optional document ids via SPEC-011, same rules (PDF/image, 5 MB) | SPEC-011 |
| TDD-007.17 | Separation of duties when an approver is the requesting employee (users holding multiple roles; contract gap) | Deny (internal `SELF_APPROVAL`) | SPEC-002/004 role model |
| TDD-007.18 | Recipient sets for "relevant stakeholders" on workflow events (gap i) | Resolved in SPEC-012 | SPEC-012 |

## Out of Scope (this SPEC)

Nothing in this SPEC introduces any item outside the BRD Out of Scope list. In particular (BRD Out of Scope / assumptions): no Facilities/Admin role or task; no automatic HR-system or Payroll integration or callback (Payroll is completed manually by an authorised HR user, SPEC-009); no payroll calculation engine; no identity provider / SSO / MFA; no auto-escalation, overdue timers or SLA values (BRD-023 escalation is configurable and owned by SPEC-014; none invented here); no tenure, probation, disciplinary or other eligibility rules; no workflow-engine product or BPM tool (a small in-process engine only, per Modular Monolith); no editable matrix UI; no historical data migration. Also outside this SPEC: submit and eligibility (SPEC-006), HR validation / org changes / reservation (SPEC-008, SPEC-005), Payroll / IT / completion gate (SPEC-009), Withdraw / Block / Resume / Cancel / Reassign behaviour (SPEC-010), document handling (SPEC-011), notification delivery (SPEC-012), audit visibility / export (SPEC-013), dashboards and reporting (SPEC-014).
