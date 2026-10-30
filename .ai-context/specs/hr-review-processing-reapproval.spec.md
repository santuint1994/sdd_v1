# SPEC-008 — HR Review, Organisation Processing & Receiving Manager Re-Approval

## Feature ID
hr-review-processing-reapproval

## Status
Changes Requested at Gate 1 (2026-10-13) — reviewer Shamik Bhattacharya; see `.ai-context/pr_reviews/SPEC-008-hr-review-processing-reapproval-20261013-173451.md`. Spec must be updated and re-submitted for Gate 1; plan, tasks, tests and code remain blocked

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 1 (Spec Peer Review) | Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) | 2026-10-13 | Changes Requested | `.ai-context/pr_reviews/SPEC-008-hr-review-processing-reapproval-20261013-173451.md` |
| Gate 2 (Code Review) | — | — | Not started | — |

## Intent & Business Goals

Give the HR role a controlled, scope-limited, fully audited workspace to (1) revalidate employee eligibility at **Pending HR Review**, (2) approve (reserving vacancy capacity atomically), reject, or send a correctable request back for clarification, (3) perform the sequential **HR Processing** activities (confirm organisation data, update organisation metadata, assign payroll reference, upload documents, HR Confirmation) and (4) hand over to Payroll Processing only when every mandatory HR activity is complete. It also implements the **Receiving Manager Re-Approval** loop (BRD-024) triggered when HR changes Department/BU, Designation, Location or Reporting Manager, plus HR-controlled post-submission edits (BRD-032), HR vacancy change (BRD-028) and HR Effective Transfer Date changes/expired-date correction (BRD-031).

Business goals: no vacancy over-allocation (capacity validated and reserved in the same DB transaction as the status change); no silent overwrite of approved data (previous/new values retained, reason mandatory); no bypass of Receiving Manager re-approval; HR changes affect portal / Transfer Request data only (never an external HR master); every HR decision traceable.

## User Roles & Actors

| Role | Participation in this SPEC |
|---|---|
| HR | Primary actor: reviews, approves, rejects, requests clarification, runs HR Processing, changes org data, vacancy, effective date, completes HR Processing. Always limited to assigned location/organisation scope. |
| Receiving Manager | Decides re-approval (approve / reject with reason / request clarification / comment) when BRD-024 is triggered. |
| Employee | Notified; sees HR rejection reason (per policy); responds to HR clarification (via SPEC-007 respond action). Cannot edit anything after submission. |
| Super Admin | Configures Receiving Manager enabled/disabled and optional date-change re-approval (SPEC-007 config); acts on dates beyond HR-controlled stages (SPEC-010/009). Not an actor of the HR actions in this SPEC. |
| Reporting Manager / IT | No action in this SPEC; must be refused (403) on every HR endpoint. |

---

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-008 |
| Title | HR Review, Organisation Processing & Receiving Manager Re-Approval |
| Purpose | Implement the HR-controlled part of the transfer workflow from `PENDING_HR_REVIEW` to the hand-off into `PAYROLL_PROCESSING`, including the BRD-024 re-approval loop. |
| Business objective | Controlled HR validation with concurrency-safe vacancy reservation, traceable organisation changes, mandatory re-approval where required. |
| Version | 0.1 (Draft) |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer per roster | Project Manager / Product Owner |
| Task prefix | `TASK-008.MM` |
| Tag legend | `[BRD]` stated by BRD; `[DERIVED]` follows necessarily from BRD text; `[PROPOSED]` technical design; `[TDD-REQUIRED]` Technical Design Decision Required — Not Defined by BRD (closing section, IDs `TDD-008.NN`). |

## 2. Why This SPEC Exists

1. SPEC-007 owns the state machine and the Reporting/Receiving Manager stages; it does not know what HR may do inside `PENDING_HR_REVIEW` / `HR_PROCESSING`. This SPEC supplies the HR handlers, guards and side effects registered with `WorkflowEngine` (SPEC-007).
2. BRD-029 rule 7 requires **HR final eligibility revalidation** before vacancy reservation; BRD-013 defines approve / reject / return; BRD-029 defines the *not eligible vs correctable* outcome table.
3. BRD-020/BRD-024/BRD-032 require HR organisation metadata changes to be reasoned, audited, and — for four fields — re-approved by the Receiving Manager when that stage is enabled.
4. BRD-028 requires capacity to be validated **and** reserved atomically at HR approval, and an atomic release+reserve when HR changes the vacancy; both rely on `VacancyService` (SPEC-005).
5. BRD-OQ-14 requires HR Confirmation to be an *activity* inside `HR_PROCESSING`, sequential before Payroll; a checklist data model and gate are therefore needed (mandatory set is `[TDD-REQUIRED]`, TDD-008.01).

## 3. BRD Traceability

### 3.1 BRD requirement IDs

| BRD ID | Coverage | Slice owned here |
|---|---|---|
| BRD-013 | FULL | HR worklist/view by location/scope; eligibility validation; vacancy/capacity validation; approve / reject (mandatory reason) / return (= Request Clarification); assign/update org metadata; payroll configuration assignment; document upload (via SPEC-011); monitor hand-off (downstream monitoring views are SPEC-014). |
| BRD-020 | FULL | HR updates Dept/BU, Designation, Location, Reporting Manager, Effective Transfer Date, payroll assignment/reference, other approved org info; portal/Transfer Request data only. |
| BRD-024 | FULL | Re-approval trigger, Receiving Manager decision (approve/reject/clarify/comment), no-bypass, not-enabled path, audit fields. Routing of status is registered with SPEC-007. |
| BRD-027 | PARTIAL (HR rows) | Pending HR Review → HR Processing / Rejected / Info Required; HR Processing → Pending RM Re-Approval; Pending RM Re-Approval → HR Processing / Rejected; HR Processing → Payroll Processing; BRD-OQ-14(a)(b). Engine and other rows: SPEC-007/009/010. |
| BRD-028 | PARTIAL (HR parts) | Reserve at HR approval; release on HR reject / RM re-approval reject; HR vacancy change atomic; capacity-unavailable response. Engine: SPEC-005. |
| BRD-029 | PARTIAL (HR parts) | Rule 7 HR validation; rule 8 "no other restrictions assumed"; HR-ineligible outcome table; missing/correctable data handling at HR stage; HR updates never touch external HR master. Eligibility at submission: SPEC-006. Source-of-truth matrix enforcement: SPEC-015. |
| BRD-031 | PARTIAL (HR changes) | HR may modify date; same range rule; expired-date correction in HR-controlled stages; optional date-change re-approval. Validator: SPEC-006; Super Admin beyond HR stages: SPEC-010/009. |
| BRD-032 | PARTIAL (post-submission) | HR-controlled post-submission edits; mandatory reason; previous/new values; originals retained; re-approval flag. Draft editing: SPEC-006. |
| BRD-033 | PARTIAL | HR / RM re-approval rejection mechanics (reason, release, notify). Generic rule: SPEC-007. |
| BRD-034 | PARTIAL | HR Request Clarification & RM clarification during re-approval; return-to-stage. Entity `transfer_clarifications`: SPEC-007. |
| BRD-036 | PARTIAL | Events triggered by this SPEC (section 19). |
| BRD-037 / BRD-022 | PARTIAL | Audit events emitted by this SPEC (section 18). |
| BRD-018 / BRD-019 | PARTIAL | HR Processing positioned sequentially before Payroll; statuses used as defined. |
| BRD-012 | PARTIAL | Receiving Manager actions during re-approval (approve/reject with reason/clarify/comment); config toggle read from SPEC-007. |
| BRD-021 | PARTIAL | HR upload of authorised documents is invoked from HR Processing; storage/validation owned by SPEC-011. |
| BRD-026 | PARTIAL | HR authorisation chain on every endpoint here (role → scope → resource → action → stage). |
| BRD-035 | PARTIAL | Respects reassigned HR / RM assignee (previous assignee cannot act). Reassign action: SPEC-010. |

### 3.2 NFR IDs

| NFR | Coverage |
|---|---|
| NFR-002 | PARTIAL — backend-authoritative HR/RM authorisation. |
| NFR-005 | PARTIAL — audit emission for HR actions. |
| NFR-006 | PARTIAL — idempotent notification enqueue; no external HR/Payroll integration exists. |
| NFR-007 | PARTIAL — HR sees only in-scope employee/transfer/document data. |

### 3.3 BRD open questions implemented

| OQ | Status | Implemented as |
|---|---|---|
| BRD-OQ-07 | Resolved | HR-editable org metadata set; BRD-024 trigger (sections 7, 9). |
| BRD-OQ-14 | Resolved | HR Confirmation is an activity; sequential HR → Payroll; after re-approval return to `HR_PROCESSING` (sections 7, 16). |
| BRD-OQ-16 (c) | Resolved | HR ineligible outcome table (FR-008.12/13). |
| BRD-OQ-19 | Resolved | HR updates affect portal / Transfer Request data only (FR-008.40). |
| BRD-OQ-15 (c) | Resolved | Manual in-flight reservation release is owned by SPEC-005/010; HR change of vacancy uses `changeVacancy`. |
| BRD-OQ-20 | Resolved | HR date change / expired-date correction (FR-008.44–47). |

### 3.4 Business rules implemented (BRD "Business Rules" bullets)

Vacancy reserve-at-HR-approval; eligibility incl. HR revalidation and "no other restrictions assumed"; source-of-truth/HR-updates-portal-only; effective date rules (HR slice); post-submission editing; BRD-024 re-approval; rejection reason mandatory; clarification rules; "Receiving Manager review enabled/disabled by configuration"; sequential HR then Payroll (FULL for HR parts).

### 3.5 Acceptance criteria (BRD "Acceptance Criteria" bullets) addressed

HR can validate eligibility, target organisation, vacancy/capacity and effective date, upload documents, update/assign org metadata, initiate downstream (hand-off) tasks; HR-ineligible outcome; rejection/clarification bullets (HR rows); Receiving Manager re-approval bullet; vacancy reserved only at HR approval, concurrent-approval bullet (HR part); HR changes selected vacancy bullet; effective-date bullet (HR parts); HR Processing precedes Payroll bullet; BRD-024 audit bullet; employee-data bullet (HR parts).

### 3.6 Negative scenarios (BRD-039 rows)

| BRD-039 area | Scenario | Coverage | NAC |
|---|---|---|---|
| Workflow | User cannot approve outside assigned role/scope | PARTIAL (HR + RM re-approval) | NAC01, NAC02 |
| Workflow | Invalid workflow transitions rejected | PARTIAL (HR stages) | NAC03–NAC06 |
| Workflow | Receiving Manager approval cannot be bypassed when enabled | FULL for re-approval | NAC10, NAC11 |
| Workflow | HR changes to Dept/BU/Designation/Location/Reporting Manager trigger BRD-024 | FULL | NAC10 |
| Vacancy | Full vacancy cannot receive a new allocation | PARTIAL (HR approval/change) | NAC13 |
| Vacancy | Concurrent HR approvals do not exceed capacity | PARTIAL (HR approval path) | NAC14 |
| Vacancy | Capacity never negative | PARTIAL | NAC14, NAC15 |
| Vacancy | Rejected requests release reservation | PARTIAL (HR / RM reject) | AC17, NAC17 |
| Security | Cross-scope access | PARTIAL | NAC01 |
| Security | Employee cannot access another's request | PARTIAL (n/a to HR endpoints; Employee gets 403) | NAC02 |
| Security | Direct API cannot bypass authorisation | PARTIAL | NAC01–NAC03 |

---

## 4. Dependencies

| Depends on | What is consumed |
|---|---|
| SPEC-001 | `withTransaction`, `AuditService.record(event,{trx})`, `NotificationService.enqueue(code,payload,{trx})`, error classes, envelope, validation middleware, migration conventions, logger, config loader (`BUSINESS_TIME_ZONE`). |
| SPEC-002 | `AuthorizationService.authorize(ctx,{resource,action,target})`, `ScopeResolver`, JWT/session middleware. |
| SPEC-003 | Master data (departments/BUs, designations, locations), HR location/organisation scope mapping, Receiving Manager scope mapping `[TDD-REQUIRED]`. |
| SPEC-004 | `employee_profiles` (employment status, org data, assigned HR, reporting manager), user records for Reporting Manager picker. |
| SPEC-005 | `VacancyService.reserve / release / changeVacancy`; vacancy row locking; capacity math. |
| SPEC-006 | `transfer_requests` (proposed org values, `proposed_vacancy_id`, `effective_transfer_date` [RECONCILED] canonical SPEC-006 names), `EffectiveDateValidator`, eligibility engine pieces reused for revalidation. |
| SPEC-007 | `WorkflowEngine.transition`, transition registry, `transfer_workflow_history`, `transfer_task_assignments`, `workflow_configuration`, `transfer_clarifications`, INVALID_WORKFLOW_TRANSITION handling. |
| SPEC-011 | Document upload/metadata/scoped download; HR_UPLOAD_DOCUMENTS activity links documents. |
| SPEC-012 | Notification dispatch (this SPEC only enqueues). |
| SPEC-013 | Audit visibility (this SPEC only emits). |

## 5. Enables

| Enabled SPEC | What |
|---|---|
| SPEC-009 | Payroll Processing entry only after `COMPLETE_HR_PROCESSING`; reads payroll reference captured in the HR activity; completion gate relies on "required HR organisation metadata activities complete" and a valid effective date. |
| SPEC-010 | Block/Resume revalidation uses the reservation created here; Cancel after this stage releases it. |
| SPEC-014 | HR / Receiving Manager worklists, overdue visibility. |
| SPEC-015 | Field-ownership and snapshot rules; `transfer_org_changes` provides the in-flight change evidence. |
| SPEC-016 | BRD-039 workflow/vacancy scenarios. |

## 6. Roles & Scope

| Role | Allowed in this SPEC | Scope rule | Stage rule |
|---|---|---|---|
| HR | worklist, view, revalidate, validate & approve, reject, request clarification, activity updates, payroll-reference assignment, document link, org-data change, vacancy change, effective-date change, complete HR processing | Transfer's employee must be within HR's assigned location/organisation scope (SPEC-003) `[BRD-013, BRD-026]`; if a task assignee is set (SPEC-007 `transfer_task_assignments`) only that assignee may act `[BRD-035]` | Only in the stages listed per endpoint (section 12/16) |
| Receiving Manager | re-approval list, view diff, approve / reject (reason) / request clarification / comment | Must be the assigned owner of the open re-approval cycle and within RM scope `[TDD-REQUIRED]` (SPEC-003 mapping) | Only `PENDING_RECEIVING_MANAGER_REAPPROVAL` |
| Employee | none of the HR/RM actions (403); sees reason/clarification via SPEC-006/007 views | Own request only | — |
| Reporting Manager, IT | none (403) | — | — |
| Super Admin | no HR workflow action here (403 on HR action endpoints); config + date intervention handled elsewhere | — | — |

---

## 7. Functional Requirements

### 7.1 HR worklist and review workspace

| ID | Requirement | Tag |
|---|---|---|
| FR-008.01 | HR can list transfer requests in HR-controlled and HR-related stages (`PENDING_HR_REVIEW`, `HR_PROCESSING`, `PENDING_RECEIVING_MANAGER_REAPPROVAL`, `INFO_REQUIRED` raised by HR, `PAYROLL_PROCESSING` read-only here) filtered strictly to the HR user's assigned location/organisation scope; pagination/sort/search per envelope convention. | `[BRD-013]` + `[PROPOSED]` endpoint |
| FR-008.02 | HR can open a request detail: employee profile summary (minimum necessary), proposed vs current organisation values, vacancy detail incl. live availability, effective date, workflow history, approvals by previous stages, clarifications, org-change history, HR activity checklist, linked documents (metadata; file access via SPEC-011). | `[BRD-013]` |
| FR-008.03 | The worklist and detail endpoints never return data outside HR scope; out-of-scope direct access returns 403 without leaking existence details. | `[BRD-026]` |
| FR-008.04 | An HR user who is not the current task assignee (after SPEC-010 reassignment) can still view the request through history/audit but cannot act. | `[BRD-035]` |

### 7.2 HR Review: eligibility revalidation (Pending HR Review)

| ID | Requirement | Tag |
|---|---|---|
| FR-008.10 | `Revalidate` re-evaluates, at the moment of the call, the portal-available eligibility conditions: (C1) Employment Status is Active (BRD-029 rule 1); (C2) mandatory organisation data present: Employee ID, Current Dept/BU, Current Designation, Current Location, Reporting Manager, Employment Status (rule 6); (C3) vacancy availability: selected vacancy exists, status OPEN, available capacity > 0 (rule 5; informational at review, binding at reserve); (C4) no other active transfer for the employee and this request is the employee's sole active request (rules 3–4); (C5) selected vacancy's Dept/BU, Designation, Location match the request's target values. | `[BRD-029]` rule 7, `[DERIVED]` C4/C5 |
| FR-008.11 | No other eligibility restriction (tenure, probation, disciplinary, notice period, performance) is evaluated or assumed. HR records a free-text `hrRemarks` and an explicit `eligibilityConfirmed=true` attestation covering "any applicable company transfer restrictions" that HR verifies outside the system. | `[BRD-029]` rules 2, 7, 8 |
| FR-008.12 | **Outcome A — not eligible by policy**: HR must use **Reject** with mandatory reason (`Pending HR Review → Rejected`, final). Validate & Approve is refused (422 `ELIGIBILITY_VALIDATION_FAILED`) while C1, C2 or C4 fails. | `[BRD-029]` outcome table |
| FR-008.13 | **Outcome B — correctable data missing/incorrect**: HR uses **Request Clarification** (`Pending HR Review → Info Required → Pending HR Review`). HR may not use Reject for correctable data by system constraint only in the sense that both actions remain available; the UI guides HR with the BRD outcome table. | `[BRD-029]`, `[BRD-013]` "return" |
| FR-008.14 | Revalidation results are stored as an immutable evaluation record (`transfer_hr_validation_checks`) with evaluator and timestamp; the evaluation performed inside `Validate & Approve` is recorded in the same transaction. | `[PROPOSED]` |

### 7.3 Validate & Approve

| ID | Requirement | Tag |
|---|---|---|
| FR-008.20 | Action `HR_VALIDATE_APPROVE`: `PENDING_HR_REVIEW → HR_PROCESSING` by HR within scope. | `[BRD-027]` |
| FR-008.21 | In **one DB transaction**: lock transfer row, re-run C1–C5, call `VacancyService.reserve({ transferRequestId, vacancyId, employeeId, actor }, {trx})` [RECONCILED signature per SPEC-005] (capacity validated **and** reserved), seed the HR activity checklist, call `WorkflowEngine.transition`, write history + audit + outbox rows. | `[BRD-028]`, `[PROPOSED]` design |
| FR-008.22 | If capacity is not available (vacancy FULL / ON_HOLD / CLOSED / insufficient capacity / deleted) the whole transaction rolls back; response is HTTP 409 `VACANCY_CAPACITY_UNAVAILABLE`; request status remains `PENDING_HR_REVIEW`; a separate non-transactional audit event records the refused attempt. Response code is `[PROPOSED]`; the capacity-unavailable response itself is `[BRD-028]`. | `[BRD-028]`, `[PROPOSED]` code |
| FR-008.23 | Concurrency: two HR users approving different requests when one position remains → exactly one reserves, the other gets 409 `VACANCY_CAPACITY_UNAVAILABLE`. Two HR users approving the **same** request → one succeeds, the other gets 403 `INVALID_WORKFLOW_TRANSITION` (status no longer `PENDING_HR_REVIEW`). | `[BRD-028]`, `[DERIVED]` |
| FR-008.24 | `VacancyService.reserve` must be idempotent per transfer (re-approval after a clarification cycle does not double-reserve; an existing active reservation for the same transfer+vacancy is reused). | `[DERIVED]` BRD-028 "reservation retained if already created", `[PROPOSED]` contract with SPEC-005 |
| FR-008.25 | Notifications: Employee (approval completed at stage) and HR / relevant team (HR processing started). | `[BRD-027]`, `[BRD-036]` |

### 7.4 HR Reject and HR Request Clarification

| ID | Requirement | Tag |
|---|---|---|
| FR-008.30 | Action `REJECT` by HR from `PENDING_HR_REVIEW → REJECTED`; `reason` mandatory (non-blank after trim, min length `[PROPOSED]` 3, max 2000). | `[BRD-027]`, `[BRD-033]` |
| FR-008.31 | Reject effects in one transaction: status Rejected (final), `VacancyService.release({ transferRequestId, reasonCode:'REJECTED', actor }, {trx})` [RECONCILED] for any existing reservation, history row (rejected by, reason, date/time), audit, outbox. No Payroll or IT task is created. | `[BRD-029]`, `[BRD-028]`, `[BRD-033]` |
| FR-008.32 | Employee is notified of rejection; the HR rejection reason is visible to the Employee **as permitted by policy**; default `[PROPOSED]` is visible. The policy itself is `[TDD-REQUIRED]` (TDD-008.07). | `[BRD-029]`, `[BRD-036]` |
| FR-008.33 | Rejected is final; the same request cannot be reopened/resubmitted; a new application is a new request (SPEC-006/007). | `[BRD-033]` |
| FR-008.34 | Action `REQUEST_CLARIFICATION` by HR from `PENDING_HR_REVIEW → INFO_REQUIRED`; `reason/question` mandatory; creates a `transfer_clarifications` row (SPEC-007) with `raised_stage=PENDING_HR_REVIEW`, `return_status=PENDING_HR_REVIEW`, `requested_by`; reservation retained if it exists; no approval is reset; multiple cycles allowed. | `[BRD-027]`, `[BRD-034]` |
| FR-008.35 | Who responds to an HR-raised clarification is `[TDD-REQUIRED]` (TDD-008.02); default `[PROPOSED]`: the Employee (SPEC-007 `RESPOND_CLARIFICATION`). On response the request returns to `PENDING_HR_REVIEW` with the same HR owner. | `[BRD-034]`, gap 5(k)(r) |
| FR-008.36 | Neither Reject nor Request Clarification may be performed outside `PENDING_HR_REVIEW` by HR in this SPEC (HR cancel/block live in SPEC-010). | `[BRD-027]` |

### 7.5 HR Processing activities

| ID | Requirement | Tag |
|---|---|---|
| FR-008.40 | HR changes made in this SPEC update **portal / Transfer Request data only**; no outbound call to any external HR master or Payroll system exists; no sync job is created. | `[BRD-029]`, `[BRD-OQ-19]` |
| FR-008.41 | On entry to `HR_PROCESSING` the system seeds an **activity checklist** from `hr_activity_definitions`. Activity codes `[PROPOSED]`: `CONFIRM_DEPARTMENT_BU`, `CONFIRM_DESIGNATION`, `CONFIRM_LOCATION`, `CONFIRM_REPORTING_MANAGER`, `CONFIRM_EFFECTIVE_DATE`, `UPDATE_ORG_METADATA`, `ASSIGN_PAYROLL_REFERENCE`, `UPLOAD_DOCUMENTS`, `HR_CONFIRMATION`. The activity *kinds* come from BRD-027(b)/BRD-020/BRD-OQ-14; `HR_CONFIRMATION` is an **activity, not a status**. | `[BRD-027(b)]`, `[BRD-OQ-14(a)]` |
| FR-008.42 | Which activities are **mandatory** is `[TDD-REQUIRED]` (TDD-008.01). Default `[PROPOSED]`: the five `CONFIRM_*` activities and `HR_CONFIRMATION` mandatory; `UPDATE_ORG_METADATA`, `ASSIGN_PAYROLL_REFERENCE`, `UPLOAD_DOCUMENTS` are "where applicable" (BRD wording) → optional, completable or `NOT_APPLICABLE` with remark. Mandatory flag is snapshotted per transfer row. | `[TDD-REQUIRED]` |
| FR-008.43 | Activity update records status (`PENDING / COMPLETED / NOT_APPLICABLE`), completed_by, completed_at, remarks and, for `CONFIRM_*`, the confirmed value reference. `CONFIRM_*` completion is rejected if the confirmed value differs from the current Transfer Request value (HR must record a change first via FR-008.50). | `[DERIVED]` BRD-020/BRD-032 |
| FR-008.44 | `ASSIGN_PAYROLL_REFERENCE`: HR records payroll information/reference (free text, max 100 `[PROPOSED]`; format `[TDD-REQUIRED]` TDD-008.11) stored in the activity payload; SPEC-009 consumes it. HR does not mark Payroll complete here. | `[BRD-020]`, `[BRD-027(b)]` |
| FR-008.45 | `UPLOAD_DOCUMENTS`: documents are uploaded through SPEC-011 endpoints (validation: PDF/image, 5 MB, MIME/extension) and linked to the activity (`payload.documentIds`) for display; this SPEC adds no upload logic. | `[BRD-021]`, `[BRD-013]` |
| FR-008.46 | Activities are updatable only while status is `HR_PROCESSING` and actor is in-scope HR (assignee rules). A pending or open re-approval cycle freezes activity edits (status is not `HR_PROCESSING`). | `[DERIVED]` |
| FR-008.47 | After Receiving Manager approval of a re-approval cycle (back to `HR_PROCESSING`) the `CONFIRM_*` activities for changed fields and `HR_CONFIRMATION` are reset to `PENDING` (reset reason recorded, `reset_count` incremented) so HR confirms the updated organisation information before proceeding. | `[BRD-OQ-14(a)]`, `[BRD-024]` |

### 7.6 Complete HR Processing

| ID | Requirement | Tag |
|---|---|---|
| FR-008.48 | Action `COMPLETE_HR_PROCESSING`: `HR_PROCESSING → PAYROLL_PROCESSING` allowed only when (a) all mandatory activities are `COMPLETED` (a mandatory activity may be `NOT_APPLICABLE` only if its definition has `allows_not_applicable=true`), (b) no re-approval cycle is open, (c) the vacancy reservation for this transfer is still active, (d) actor is in-scope HR. Otherwise 422 `HR_ACTIVITIES_INCOMPLETE` (details list pending activity codes) or 403 `INVALID_WORKFLOW_TRANSITION` for wrong status. | `[BRD-027]`, `[BRD-OQ-14(b)]` |
| FR-008.49 | Effects: history + audit + outbox; Payroll task-assigned notification to authorised HR users; HR activities become read-only. HR Processing and Payroll Processing are strictly sequential; Payroll cannot start before this action. | `[BRD-027]`, `[BRD-036]` |

### 7.7 HR-controlled organisation changes (post-submission)

| ID | Requirement | Tag |
|---|---|---|
| FR-008.50 | Action `HR_CHANGE_ORG_DATA` (`POST /hr/transfers/:id/org-changes`): HR submits one or more field changes in a single **change batch** with one mandatory `changeReason`. Changeable fields: `DEPARTMENT_BU`, `DESIGNATION`, `LOCATION`, `REPORTING_MANAGER` (the four BRD-024 fields), `VACANCY`, `EFFECTIVE_DATE`, and `ORG_METADATA_OTHER` (approved other organisation information; catalogue `[TDD-REQUIRED]`, TDD-008.12). | `[BRD-020]`, `[BRD-024]`, `[BRD-032]` |
| FR-008.51 | A change without a reason is rejected (400). A batch where no field actually differs is rejected (422 `NO_CHANGE_DETECTED`). Unchanged fields in a batch are ignored. | `[BRD-032]` "change by HR without a reason is rejected" |
| FR-008.52 | Department/BU, Designation, Location, Vacancy values must reference **active master data / vacancy records**; free text refused (422 `MASTER_DATA_INVALID`). Reporting Manager must be an active user with Reporting Manager role (and scope per SPEC-003/004). | `[BRD-029]` |
| FR-008.53 | Org-data/vacancy changes are allowed only in `HR_PROCESSING` (default `[PROPOSED]`); effective-date changes are additionally allowed in `PENDING_HR_REVIEW` and `PAYROLL_PROCESSING` (HR-controlled stages). The stage list for org-field changes is `[TDD-REQUIRED]` (TDD-008.03) because the BRD matrix has the change row only from `HR_PROCESSING`. | `[BRD-027]`, `[TDD-REQUIRED]` |
| FR-008.54 | Approved data is never silently overwritten: before applying, the previous value is written to `transfer_org_changes` (`previous_value`), the new value to `new_value`; the original submitted/approved value of any field is always recoverable as the `previous_value` of the earliest change row for that field, plus the audit log. | `[BRD-032]`, `[BRD-024]` |
| FR-008.55 | Consistency between target Dept/BU/Designation/Location and the selected vacancy is `[TDD-REQUIRED]` (TDD-008.04); default `[PROPOSED]`: if the post-change target Dept/BU, Designation or Location differs from the post-change vacancy's, the batch is refused (422 `ORG_VACANCY_MISMATCH`), so HR changes them together with a matching vacancy in one batch. Reporting Manager is independent of vacancy. | `[TDD-REQUIRED]` |
| FR-008.56 | Updated values are applied to the Transfer Request immediately (the workflow uses updated values); in-flight snapshot semantics are enforced per SPEC-015. Whether employee profile current-org values are updated at completion is `[TDD-REQUIRED]` (TDD-008.09; SPEC-009/015). | `[BRD-029]` "values stored against the Transfer Request are the values the workflow uses" |

### 7.8 BRD-024 Receiving Manager re-approval

| ID | Requirement | Tag |
|---|---|---|
| FR-008.60 | Trigger evaluation (inside the change transaction): if the batch changes any of `DEPARTMENT_BU`, `DESIGNATION`, `LOCATION`, `REPORTING_MANAGER` (previous value ≠ new value; the previous value having been approved) **and** Receiving Manager approval is enabled in `workflow_configuration` at that moment, the request moves `HR_PROCESSING → PENDING_RECEIVING_MANAGER_REAPPROVAL` and a `transfer_reapproval_cycles` row is created with trigger type `ORG_CHANGE`. | `[BRD-024]`, `[BRD-027]` |
| FR-008.61 | If Receiving Manager approval is **not** enabled, the change is applied, the status stays `HR_PROCESSING`, `reapproval_triggered=false` is recorded and the transfer continues with updated data. | `[BRD-024]` |
| FR-008.62 | HR **cannot bypass** re-approval: there is no flag, parameter or alternative endpoint to skip it; direct API calls changing the four fields outside this service are impossible (single write path; `transfer_requests` update guarded by service + DB check). | `[BRD-024]`, `[BRD-039]` |
| FR-008.63 | The Receiving Manager sees **previous and updated values** for every changed field of the batch, the HR change reason, who/when, and the previous approval history. | `[BRD-024]` |
| FR-008.64 | RM **Approve**: `PENDING_RECEIVING_MANAGER_REAPPROVAL → HR_PROCESSING`; existing valid reservation retained; `transfer_org_changes.rm_decision=APPROVED`; HR + Employee notified; HR confirmation activities reset (FR-008.47). | `[BRD-027]`, `[BRD-024]` |
| FR-008.65 | RM **Reject** (reason mandatory): `→ REJECTED` (final); reservation released; no Payroll/IT; HR + Employee notified; decision recorded on the change rows and cycle. | `[BRD-027]`, `[BRD-033]` |
| FR-008.66 | RM **Request Clarification** (reason mandatory): allowed by BRD-024/BRD-034 but the BRD-027 matrix has no row. `[DERIVED]` row: `PENDING_RECEIVING_MANAGER_REAPPROVAL → INFO_REQUIRED → PENDING_RECEIVING_MANAGER_REAPPROVAL` (same reviewer). Responder `[TDD-REQUIRED]` (TDD-008.02); default `[PROPOSED]`: HR (author of the change). | `[BRD-024]`, `[BRD-034]`, gap 5(l) `[DERIVED]` |
| FR-008.67 | RM **Comments**: Receiving Manager (and HR) can add comments to the cycle (`transfer_reapproval_comments`); comments do not change status. | `[BRD-024]`, `[BRD-012]` |
| FR-008.68 | Which Receiving Manager is "applicable" after a Dept/BU/Location change, and behaviour if the Receiving Manager toggle changes while a cycle is open, are `[TDD-REQUIRED]` (TDD-008.06). Default `[PROPOSED]`: re-resolve from the updated target scope via SPEC-003 mapping; a cycle already open continues regardless of later toggle changes. | gap 5(c) |
| FR-008.69 | While `PENDING_RECEIVING_MANAGER_REAPPROVAL`, HR cannot continue processing or complete HR Processing (INVALID_WORKFLOW_TRANSITION). Multiple cycles are allowed over the life of a request (each new HR change from `HR_PROCESSING` may open a new cycle); at most one open cycle at a time. | `[BRD-024]`, `[DERIVED]` |

### 7.9 HR vacancy change

| ID | Requirement | Tag |
|---|---|---|
| FR-008.70 | HR may change the selected vacancy in `HR_PROCESSING` (field `VACANCY` in a batch). The service calls `VacancyService.changeVacancy({ transferRequestId, newVacancyId, reason, actor }, {trx})` [RECONCILED signature per SPEC-005] which validates the new vacancy (status OPEN, available > 0), releases the old reservation and reserves the new in one transaction. | `[BRD-028]` |
| FR-008.71 | If the new vacancy cannot be reserved: 409 `VACANCY_CAPACITY_UNAVAILABLE`, nothing changes (old reservation, transfer values, status unchanged). | `[BRD-028]` step 6 |
| FR-008.72 | Audit records old vacancy, new vacancy, changed by, date/time, reason (event `VACANCY_CHANGED_BY_HR`) in addition to the `transfer_org_changes` row. | `[BRD-028]` step 7 |
| FR-008.73 | A vacancy change that does not alter the four BRD-024 fields does not by itself trigger re-approval; if it also alters them, FR-008.60 applies in the same transaction. | `[BRD-028]` |

### 7.10 Effective Transfer Date (HR slice)

| ID | Requirement | Tag |
|---|---|---|
| FR-008.80 | HR may change the date with `EFFECTIVE_DATE` in a batch (own reason mandatory) in HR-controlled stages `PENDING_HR_REVIEW`, `HR_PROCESSING`, `PAYROLL_PROCESSING`; the new date is validated by `EffectiveDateValidator` (SPEC-006): `today ≤ date ≤ today + 30 calendar days` inclusive, business time zone from config, weekends/holidays allowed, no past date. | `[BRD-031]` |
| FR-008.81 | **Expired-date correction**: if the stored date is now earlier than today, HR corrects it with the same rule while in an HR-controlled stage; the change is flagged `expired_correction=true` in audit. Beyond HR-controlled stages only Super Admin may correct (SPEC-010/009); this SPEC returns 403 `INVALID_WORKFLOW_TRANSITION` to HR in those stages. | `[BRD-031]`, `[BRD-OQ-20(d)]` |
| FR-008.82 | A date-only change does **not** trigger re-approval by default and does not alter status. If Super Admin has enabled date-change re-approval (`workflow_configuration`, SPEC-007), the request returns to the configured approval stage/approver (cycle trigger type `DATE_CHANGE`). Status/approver mapping is `[TDD-REQUIRED]` (TDD-008.05 = TDD-007.04, one merged Gate 1 decision). [RECONCILED R-8] SPEC-008 only calls SPEC-007 `routeAfterDateChange` (it does not pick the status): the request moves to `workflow_configuration.date_change_reapproval_stage`, the stage it was in is stored in `transfer_workflow_state.reapproval_return_status` (trigger `DATE_CHANGE`) and the request returns there when the configured approver approves. | `[BRD-031]` |
| FR-008.83 | Rejected date (out of range) → 422 `EFFECTIVE_DATE_OUT_OF_RANGE` (code owned by SPEC-006), stored date unchanged. | `[BRD-031]` |
| FR-008.84 | Every date change is audited with previous, new, changed by, role, date/time, reason. | `[BRD-031]` |
| FR-008.85 | The date-change function is exposed as reusable `TransferDateService.changeEffectiveDate` so Super Admin interventions in later stages (SPEC-010/009) use the same validator; no role other than HR (here) and Super Admin (elsewhere) may call it; Employee after submission is refused. | `[BRD-031]` `[PROPOSED]` |

### 7.11 Audit and HR transaction rules

| ID | Requirement | Tag |
|---|---|---|
| FR-008.90 | Every state-changing HR/RM action goes through `WorkflowEngine.transition` (or, for non-status-changing org edits, through the same transaction wrapper) and writes history + audit + notification outbox in the same transaction; notification delivery is asynchronous and never rolls back the transaction. | `[BRD-036]`, `[BRD-038]` |
| FR-008.91 | All attempts refused on role/scope/stage grounds are audited as security events (via SPEC-002/007 mechanisms) with user, role, transfer ID, current status, attempted action, time, reason. | `[BRD-027]`, `[BRD-026]` |

---

## 8. Internal Implementation Plan / Tasks

Order is dependency-ordered. Layers: DB, BE, FE, QA.

| Task | Title | Layer | Description | Inputs / Outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-008.01 | Migration: `hr_activity_definitions` + seed | DB | Create table and seed the nine activity codes with mandatory flags per TDD-008.01 default; add `down` migration. | Out: table + seed | SPEC-001 migrations | BRD-027(b), BRD-OQ-14 |
| TASK-008.02 | Migration: `transfer_hr_activities` | DB | Per-transfer checklist rows, unique `(transfer_id, activity_code)`, checks, FKs, indexes. | Out: table | .01, SPEC-006 | BRD-027(b) |
| TASK-008.03 | Migration: `transfer_org_changes` | DB | Change/decision table; enforce `change_reason` NOT NULL/non-blank; trigger allowing only one-time update of decision columns; no delete. | Out: table + trigger | SPEC-006 | BRD-024, BRD-032 |
| TASK-008.04 | Migration: `transfer_reapproval_cycles`, `transfer_reapproval_comments` | DB | Cycle table with partial unique index for one open cycle; comments table. | Out: tables | .03, SPEC-007 | BRD-024 |
| TASK-008.05 | Migration: `transfer_hr_validation_checks` | DB | Immutable evaluation records. | Out: table | SPEC-006 | BRD-029 r7 |
| TASK-008.06 | Models + repositories | BE | Sequelize models, repository classes (persistence only), typed DTOs. | .01–.05 | .01–.05 | — |
| TASK-008.07 | HR/RM authorisation policies | BE | Register `AuthorizationService` policies: resource `hr_transfer`, `reapproval`; actions; scope resolver for HR (location/org + assigned HR) and RM; assignee check. | Out: policies | SPEC-002, SPEC-003, SPEC-007 | BRD-026, BRD-035 |
| TASK-008.08 | `EligibilityRevalidationService` | BE | Evaluate C1–C5, persist results, return structured outcome. | Out: service | .05, .06, SPEC-006 | BRD-029 |
| TASK-008.09 | HR worklist and detail queries | BE | Scoped list/detail read models, activity/org-change/history aggregation. | Out: GET endpoints | .06, .07 | BRD-013 |
| TASK-008.10 | `HR_VALIDATE_APPROVE` handler | BE | Guard, revalidate, `VacancyService.reserve`, seed checklist, transition; refused-attempt audit. | Out: POST endpoint | .08, SPEC-005, SPEC-007 | BRD-027, BRD-028 |
| TASK-008.11 | HR reject handler | BE | Mandatory reason, release reservation, final status. | Out: POST endpoint | .10 | BRD-029, BRD-033 |
| TASK-008.12 | HR clarification handler + return routing | BE | Create clarification via SPEC-007 entity, return to `PENDING_HR_REVIEW`. | Out: POST endpoint | SPEC-007 | BRD-034 |
| TASK-008.13 | `HrActivityService` | BE | Seed, update, N/A with remark, reset after re-approval, mandatory-completeness evaluation. | Out: service + PATCH | .02, .06 | BRD-027(b) |
| TASK-008.14 | Payroll-reference & document linking | BE | Payload storage for `ASSIGN_PAYROLL_REFERENCE`; link document ids from SPEC-011 to `UPLOAD_DOCUMENTS`. | Out: service | .13, SPEC-011 | BRD-020, BRD-021 |
| TASK-008.15 | `OrgChangeService` | BE | Diff, validation (reason, master data, consistency), apply to Transfer Request, write change rows. | Out: service | .03, .06 | BRD-020, BRD-032 |
| TASK-008.16 | Vacancy change integration | BE | Call `changeVacancy`, map failures, audit. | Out: service method | .15, SPEC-005 | BRD-028 |
| TASK-008.17 | `ReapprovalService` (trigger + routing) | BE | Evaluate trigger, create cycle, transition to re-approval status, resolve Receiving Manager, notify. | Out: service | .04, .15, SPEC-007 | BRD-024 |
| TASK-008.18 | RM re-approval decision handlers | BE | Approve / reject / clarify / comment endpoints; reset activities; release reservation on reject. | Out: endpoints | .17, .13 | BRD-024, BRD-033 |
| TASK-008.19 | `TransferDateService` (HR slice) | BE | Reusable date change + expired correction + optional date-change re-approval. | Out: service | .15, .17, SPEC-006 | BRD-031 |
| TASK-008.20 | `COMPLETE_HR_PROCESSING` handler | BE | Completeness guard, reservation check, transition, payroll task notification. | Out: POST endpoint | .13, .17 | BRD-027 |
| TASK-008.21 | Joi validators, DTOs, error mapping | BE | All request validations, codes, messages. | Out: validators | .09–.20 | BRD-026 |
| TASK-008.22 | Routes, controllers, OpenAPI | BE | Thin controllers, route registration under `/api/v1`, Swagger docs. | Out: routes | .21 | — |
| TASK-008.23 | Audit & notification event wiring | BE | Emit events of sections 18/19 inside transactions. | Out: wiring | .10–.20, SPEC-001 | BRD-037, BRD-036 |
| TASK-008.24 | FE: HR worklist page | FE | `frontend/src/app/hr/transfers/page.tsx`, filters, status badges, empty/error states. | Out: page | .09 | BRD-013 |
| TASK-008.25 | FE: HR review workspace | FE | `frontend/src/app/hr/transfers/[id]/page.tsx`: summary, revalidation panel, vacancy card, action bar, dialogs. | Out: page | .24 | BRD-013, BRD-029 |
| TASK-008.26 | FE: activity checklist & org-change form | FE | Checklist component, org-change form with mandatory reason, re-approval warning dialog, vacancy change, date editor. | Out: components | .25 | BRD-020, BRD-024 |
| TASK-008.27 | FE: RM re-approval screens | FE | `frontend/src/app/receiving-manager/reapprovals/...` list + detail diff + decision/comment. | Out: pages | .18 | BRD-024 |
| TASK-008.28 | FE: employee-facing reason/clarification display hooks | FE | Provide shared components used by SPEC-006/007 tracking view to show HR rejection reason and clarification request. | Out: components | .11, .12 | BRD-029, BRD-034 |
| TASK-008.29 | Unit tests | QA | Services, validators, guards. | TC list §23 | .08–.20 | all |
| TASK-008.30 | Integration/API tests | QA | Endpoints with real DB (transactions, constraints). | TC list §23 | .22 | all |
| TASK-008.31 | Concurrency & atomicity tests | QA | Parallel approvals, vacancy change failure, re-approval races. | TC list §23 | .10, .16 | BRD-028, BRD-039 |
| TASK-008.32 | Security/negative tests | QA | Scope, role, stage, assignee, bypass attempts. | TC list §23 | .22 | BRD-026, BRD-039 |
| TASK-008.33 | Frontend tests | QA | Component and page tests. | TC list §23 | .24–.28 | — |
| TASK-008.34 | Docs & DoD verification | QA | OpenAPI completeness, migration up/down, audit/notification catalogue handover to SPEC-013/012. | — | all | — |

---

## 9. Business Rules

| # | Rule | Tag |
|---|---|---|
| BR-1 | Capacity is validated **and reserved** only at HR Validate & Approve, in the same transaction as the status change; never at submission or manager approval. | `[BRD-028]` |
| BR-2 | HR approves only after final eligibility revalidation; no tenure/probation/disciplinary/notice/performance rule is assumed. | `[BRD-029]` |
| BR-3 | Not eligible by business/HR policy → Reject (mandatory reason, final, reservation released, no Payroll/IT). Correctable → Request Clarification, not Reject. | `[BRD-029]` |
| BR-4 | Reject / clarification / change-by-HR always need a reason; blank refused. | `[BRD-033, BRD-034, BRD-032]` |
| BR-5 | HR Confirmation is an activity inside `HR_PROCESSING`, never a status. | `[BRD-OQ-14]` |
| BR-6 | HR Processing completes before Payroll Processing; no parallel execution. | `[BRD-OQ-14(b)]` |
| BR-7 | Changing Dept/BU, Designation, Location or Reporting Manager (when RM enabled) mandatorily routes to Receiving Manager re-approval; HR cannot bypass. | `[BRD-024]` |
| BR-8 | When RM is not enabled, the transfer continues with updated data; change still audited. | `[BRD-024]` |
| BR-9 | After RM re-approval the request returns to `HR_PROCESSING` and HR reconfirms updated org information. | `[BRD-OQ-14(a)]` |
| BR-10 | Approved data is never silently overwritten; originals remain retrievable. | `[BRD-032]` |
| BR-11 | HR updates change portal / Transfer Request data only. | `[BRD-029]` |
| BR-12 | HR vacancy change = atomic release + reserve; failure leaves everything unchanged. | `[BRD-028]` |
| BR-13 | Effective date: today ≤ date ≤ today + 30 (inclusive, business time zone); HR may change; expired dates corrected by HR in HR-controlled stages; date-only change triggers re-approval only if Super Admin enabled it. | `[BRD-031]` |
| BR-14 | HR, RM re-approval, and reject paths release any reservation; clarification retains it. | `[BRD-027, BRD-028]` |
| BR-15 | Department/Designation/Location/Vacancy come from master data, never free text. | `[BRD-029]` |
| BR-16 | HR may act only within assigned scope; reassigned previous assignee cannot act. | `[BRD-026, BRD-035]` |

---

## 10. Data Model & Database

All tables `[PROPOSED]`. PKs are UUID (`gen_random_uuid()`); timestamps `timestamptz` UTC; migrations under `backend/src/migrations/` with `up`/`down`; models in `backend/src/modules/hr-processing/models/`. FK targets: `transfer_requests` (SPEC-006), `users` (SPEC-002), `vacancies` (SPEC-005), master tables (SPEC-003).

### 10.1 `hr_activity_definitions`

| Column | Type | Constraints |
|---|---|---|
| code | varchar(50) | PK |
| label | varchar(120) | NOT NULL |
| is_mandatory | boolean | NOT NULL (default per TDD-008.01) |
| allows_not_applicable | boolean | NOT NULL default false |
| resets_on_reapproval | boolean | NOT NULL default false |
| display_order | smallint | NOT NULL |
| is_active | boolean | NOT NULL default true |

Seed (default, subject to TDD-008.01): `CONFIRM_DEPARTMENT_BU`, `CONFIRM_DESIGNATION`, `CONFIRM_LOCATION`, `CONFIRM_REPORTING_MANAGER`, `CONFIRM_EFFECTIVE_DATE` (mandatory, reset on re-approval where the field changed; EFFECTIVE_DATE resets only if date changed), `UPDATE_ORG_METADATA` (optional, allows N/A), `ASSIGN_PAYROLL_REFERENCE` (optional, allows N/A), `UPLOAD_DOCUMENTS` (optional, allows N/A), `HR_CONFIRMATION` (mandatory, resets on re-approval).

### 10.2 `transfer_hr_activities`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| transfer_id | uuid | FK `transfer_requests` NOT NULL |
| activity_code | varchar(50) | FK `hr_activity_definitions.code` NOT NULL |
| is_mandatory | boolean | NOT NULL (snapshot at seeding) |
| allows_not_applicable | boolean | NOT NULL (snapshot) |
| status | varchar(20) | CHECK IN (`PENDING`,`COMPLETED`,`NOT_APPLICABLE`) default `PENDING` |
| confirmed_value | jsonb | NULL (for CONFIRM_*: `{id,label}` or date) |
| payload | jsonb | NULL (payroll reference, documentIds) |
| remarks | text | NULL; required when status `NOT_APPLICABLE` |
| completed_by | uuid | FK users NULL |
| completed_at | timestamptz | NULL |
| reset_count | int | NOT NULL default 0 |
| last_reset_reason | text | NULL |
| created_at / updated_at | timestamptz | NOT NULL |

Constraints/indexes: `UNIQUE (transfer_id, activity_code)`; `CHECK (status<>'COMPLETED' OR (completed_by IS NOT NULL AND completed_at IS NOT NULL))`; `CHECK (status<>'NOT_APPLICABLE' OR (remarks IS NOT NULL AND length(btrim(remarks))>0))`; index `(transfer_id, status)`.

### 10.3 `transfer_org_changes`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| transfer_id | uuid | FK NOT NULL |
| change_batch_id | uuid | NOT NULL (groups one HR submission) |
| field_name | varchar(30) | CHECK IN (`DEPARTMENT_BU`,`DESIGNATION`,`LOCATION`,`REPORTING_MANAGER`,`VACANCY`,`EFFECTIVE_DATE`,`ORG_METADATA_OTHER`) |
| previous_value | jsonb | NOT NULL (`{id,label}` or `{date}`) |
| new_value | jsonb | NOT NULL |
| changed_by | uuid | FK users NOT NULL |
| changed_by_role | varchar(30) | NOT NULL |
| changed_at | timestamptz | NOT NULL default now() |
| change_reason | text | NOT NULL, `CHECK (length(btrim(change_reason))>0)` |
| status_at_change | varchar(50) | NOT NULL |
| reapproval_required | boolean | NOT NULL (field is one of the four AND RM enabled, or date re-approval enabled for EFFECTIVE_DATE) |
| reapproval_triggered | boolean | NOT NULL |
| reapproval_cycle_id | uuid | FK `transfer_reapproval_cycles` NULL |
| rm_decision | varchar(30) | NULL; CHECK IN (`APPROVED`,`REJECTED`,`CLARIFICATION_REQUESTED`) |
| rm_decision_by | uuid | FK users NULL |
| decision_at | timestamptz | NULL |
| decision_remarks | text | NULL |
| expired_correction | boolean | NOT NULL default false |

Indexes: `(transfer_id, changed_at)`, `(change_batch_id)`, `(reapproval_cycle_id)`. Immutability: BEFORE UPDATE trigger permits only `rm_decision`, `rm_decision_by`, `decision_at`, `decision_remarks` and only when previously NULL (`CLARIFICATION_REQUESTED` may be superseded by a final decision — `[PROPOSED]`: store clarification decisions in the cycle table and set the change-row decision only for APPROVED/REJECTED; see 10.4). BEFORE DELETE trigger raises. Application DB role has no `DELETE` on this table.

### 10.4 `transfer_reapproval_cycles`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| transfer_id | uuid | FK NOT NULL |
| cycle_no | int | NOT NULL, `UNIQUE (transfer_id, cycle_no)` |
| change_batch_id | uuid | NOT NULL |
| trigger_type | varchar(20) | CHECK IN (`ORG_CHANGE`,`DATE_CHANGE`) |
| return_status | varchar(50) | NOT NULL (`HR_PROCESSING` for ORG_CHANGE; stage HR was in for DATE_CHANGE) |
| pending_owner_user_id | uuid | FK users NULL (Receiving Manager; see TDD-008.06) |
| triggered_by | uuid | FK users NOT NULL |
| triggered_at | timestamptz | NOT NULL |
| status | varchar(30) | CHECK IN (`PENDING`,`CLARIFICATION_REQUESTED`,`APPROVED`,`REJECTED`) |
| decided_by | uuid | NULL |
| decided_at | timestamptz | NULL |
| decision_remarks | text | NULL; required when REJECTED / CLARIFICATION_REQUESTED |

Partial unique index: `UNIQUE (transfer_id) WHERE status IN ('PENDING','CLARIFICATION_REQUESTED')` (one open cycle per transfer).

### 10.5 `transfer_reapproval_comments`

`id uuid PK`, `cycle_id uuid FK NOT NULL`, `transfer_id uuid FK NOT NULL`, `author_user_id uuid FK`, `author_role varchar(30)`, `comment text NOT NULL (≤2000)`, `created_at timestamptz`. Append-only (no UPDATE/DELETE privileges). Index `(cycle_id, created_at)`.

### 10.6 `transfer_hr_validation_checks`

`id uuid PK`, `transfer_id uuid FK`, `evaluation_context varchar(20)` (`PREVIEW`,`APPROVE_ATTEMPT`), `check_code varchar(30)` (`EMPLOYMENT_STATUS_ACTIVE`,`ORG_DATA_COMPLETE`,`VACANCY_AVAILABLE`,`NO_OTHER_ACTIVE_TRANSFER`,`VACANCY_TARGET_MATCH`), `outcome varchar(10)` (`PASS`,`FAIL`), `detail jsonb`, `evaluated_by uuid FK`, `evaluated_at timestamptz`. Append-only. Index `(transfer_id, evaluated_at)`.

### 10.7 Existing tables touched (owned elsewhere)

| Table | Operation by this SPEC |
|---|---|
| `transfer_requests` (006) | UPDATE of `proposed_department_id`, `proposed_designation_id`, `proposed_location_id`, `proposed_reporting_manager_id`, `proposed_vacancy_id`, `effective_transfer_date` **only** through `OrgChangeService`; status through `WorkflowEngine`. |
| `vacancy_reservations` (005) | Through `VacancyService` only. |
| `transfer_workflow_history`, `transfer_task_assignments`, `transfer_clarifications` (007) | Via `WorkflowEngine`/clarification service. |
| `audit_logs`, notification outbox (001) | Insert via kernel services. |

---

## 11. Backend Implementation

Module `backend/src/modules/hr-processing/` (layered: route → middleware → validation → controller → service → repository; controllers never touch models).

```
hr-processing/
  routes/ (hr.routes.ts, reapproval.routes.ts, index.ts)
  controllers/ (hr-worklist, hr-review, hr-activity, hr-org-change, reapproval)
  services/ (eligibility-revalidation, hr-review, hr-activity, org-change, reapproval, transfer-date)
  repositories/ (activity, org-change, reapproval-cycle, validation-check)
  models/ validations/ types/ constants/ index.ts
```

Key services `[PROPOSED]`:

| Service | Method | Notes |
|---|---|---|
| `EligibilityRevalidationService` | `evaluate(transferId, {trx, context})` | Returns `{checks[], blocking: boolean}`; C1/C2/C4/C5 blocking; C3 informational at preview. |
| `HrReviewService` | `validateAndApprove`, `reject`, `requestClarification` | Registers handlers with `WorkflowEngine.registerHandler`. |
| `HrActivityService` | `seed`, `update`, `resetAfterReapproval`, `assertMandatoryComplete` | Pure rule logic + repository calls. |
| `OrgChangeService` | `applyBatch(actor, transferId, dto, {trx})` | Diff, validate, write change rows, update Transfer Request, delegate to `VacancyService.changeVacancy` and `ReapprovalService.evaluateTrigger`. |
| `ReapprovalService` | `evaluateTrigger`, `approve`, `reject`, `requestClarification`, `addComment` | Transitions via `WorkflowEngine`. |
| `TransferDateService` | `changeEffectiveDate(actor, transferId, newDate, reason, {trx})` | Used by HR here, Super Admin in SPEC-010/009. |

Engine handler registration (guards/effects; transition rows themselves are SPEC-007's matrix):

| (from, role, action) | to | Guard | Effect |
|---|---|---|---|
| (PENDING_HR_REVIEW, HR, HR_VALIDATE_APPROVE) | HR_PROCESSING | scope, assignee, revalidation OK, `eligibilityConfirmed` | reserve vacancy, seed checklist |
| (PENDING_HR_REVIEW, HR, REJECT) | REJECTED | reason | release reservation |
| (PENDING_HR_REVIEW, HR, REQUEST_CLARIFICATION) | INFO_REQUIRED | reason | clarification row, retain reservation |
| (INFO_REQUIRED, responder, RESPOND_CLARIFICATION) | return_status | per TDD-008.02 | clarification closed |
| (HR_PROCESSING, HR, HR_CHANGE_ORG_DATA) | PENDING_RECEIVING_MANAGER_REAPPROVAL *or* unchanged | reason, stage, diff | trigger evaluation |
| (PENDING_RECEIVING_MANAGER_REAPPROVAL, RECEIVING_MANAGER, APPROVE) | HR_PROCESSING | cycle owner | reset activities |
| (PENDING_RECEIVING_MANAGER_REAPPROVAL, RECEIVING_MANAGER, REJECT) | REJECTED | reason | release reservation |
| (PENDING_RECEIVING_MANAGER_REAPPROVAL, RECEIVING_MANAGER, REQUEST_CLARIFICATION) | INFO_REQUIRED | reason | `[DERIVED]` row |
| (HR_PROCESSING, HR, COMPLETE_HR_PROCESSING) | PAYROLL_PROCESSING | mandatory activities, no open cycle, reservation active | notify payroll |

Logging via the structured logger (no `console.log`); all async with `async/await` inside `try/catch`; errors mapped to the envelope; no secrets, no free-text PII in log lines.

---

## 12. API Requirements

Base `/api/v1`. All endpoints require JWT (401 otherwise), validate with Joi (unknown fields rejected), return the SPEC-001 envelope. `[PROPOSED]` paths. Role/scope check order: authenticated → role → organisation scope → resource → action/stage (BRD-026). Wrong status → 403 `INVALID_WORKFLOW_TRANSITION` "The requested action is not permitted for the current transfer status."

### 12.1 `GET /hr/transfers`
Purpose: HR worklist. Auth: HR. Authz: result filtered to HR scope. Query: `status` (csv of allowed statuses), `page,pageSize,sort,order,q`. Response `data.items[]`: `{transferId, reference, employee:{employeeId,name}, currentOrg, targetOrg, vacancyReference, effectiveDate, status, pendingOwner, submittedAt, hasOpenReapproval}`. Errors: 401, 403 (non-HR), 400 (invalid status filter). 200.

### 12.2 `GET /hr/transfers/:transferId`
Purpose: review workspace. Auth: HR in scope. Response: `{transfer, employeeSummary, vacancy:{reference,status,total,reserved,filled,available,isAvailable}, approvals[], clarifications[], orgChanges[], reapprovalCycles[], activities[], documents[], lastValidation, allowedActions[]}`. Errors 401/403/404 (unknown id for in-scope check only after scope pass) /200. `allowedActions` is UX hint only.

### 12.3 `POST /hr/transfers/:transferId/revalidate`
Purpose: run revalidation (no state change). Authz: HR in scope, status `PENDING_HR_REVIEW`. Response: `{checks:[{code,outcome,detail}], blocking:boolean}`. Errors 403 `INVALID_WORKFLOW_TRANSITION`, 403, 404. 200.

### 12.4 `POST /hr/transfers/:transferId/validate-approve`
Authz: HR in scope, assignee, status `PENDING_HR_REVIEW`.
Request: `{ "eligibilityConfirmed": true, "hrRemarks": "optional ≤2000" }`
Response 200: `{ "transferId","status":"HR_PROCESSING","reservation":{"vacancyId","reservedQty":1,"availableAfter":n},"activities":[...] }`.
Validation: `eligibilityConfirmed` must be `true` (400 otherwise).
Errors: 422 `ELIGIBILITY_VALIDATION_FAILED` (details: failed checks); **409 `VACANCY_CAPACITY_UNAVAILABLE`** (details.reason: `VACANCY_FULL|VACANCY_ON_HOLD|VACANCY_CLOSED|INSUFFICIENT_CAPACITY|VACANCY_NOT_FOUND`; status unchanged); 403 `INVALID_WORKFLOW_TRANSITION`; 403 role/scope; 401; 409 `CONCURRENT_MODIFICATION` (lock timeout) `[PROPOSED]`.

### 12.5 `POST /hr/transfers/:transferId/reject`
Request `{ "reason": "string 3–2000, mandatory" }`. Authz: HR in scope, status `PENDING_HR_REVIEW`. Response 200 `{status:"REJECTED", reservationReleased:boolean}`. Errors 400 (blank reason), 403, 403 `INVALID_WORKFLOW_TRANSITION`, 404.

### 12.6 `POST /hr/transfers/:transferId/request-clarification`
Request `{ "question": "string 3–2000, mandatory" }`. Authz as above. Response 200 `{status:"INFO_REQUIRED", clarificationId, returnStatus:"PENDING_HR_REVIEW"}`. Errors 400, 403, 403 `INVALID_WORKFLOW_TRANSITION`.

### 12.7 `GET /hr/transfers/:transferId/activities`
Auth HR in scope; any stage after `HR_PROCESSING` entry (read-only after completion). Response `{activities:[{code,label,isMandatory,status,confirmedValue,payload,remarks,completedBy,completedAt,resetCount}], mandatoryPending:[codes]}`.

### 12.8 `PATCH /hr/transfers/:transferId/activities/:activityCode`
Authz: HR in scope, assignee, status `HR_PROCESSING`.
Request `{ "status":"COMPLETED|NOT_APPLICABLE|PENDING", "confirmedValue": {...}?, "payload": {"payrollReference":"≤50, SPEC-009 FR-009.08 format","documentIds":["uuid"]}?, "remarks":"≤1000?" }`.
Validation: `NOT_APPLICABLE` requires remarks and definition `allows_not_applicable`; `CONFIRM_*` completion requires `confirmedValue` equal to current Transfer Request value; `documentIds` must be documents of this transfer in scope (SPEC-011); `payrollReference` trimmed, no control chars.
Errors: 400, 404 (unknown activity code), 422 `ACTIVITY_NOT_ALLOWED` (e.g. N/A on mandatory), 422 `CONFIRMED_VALUE_MISMATCH`, 403 `INVALID_WORKFLOW_TRANSITION`.

### 12.9 `POST /hr/transfers/:transferId/org-changes`
Authz: HR in scope, assignee; status per FR-008.53.
Request:
```json
{
  "changeReason": "mandatory 3–2000",
  "changes": {
    "departmentBuId": "uuid?", "designationId": "uuid?", "locationId": "uuid?",
    "reportingManagerUserId": "uuid?", "vacancyId": "uuid?", "effectiveDate": "YYYY-MM-DD?",
    "otherMetadata": { "key": "value" }
  }
}
```
Response 200: `{ "changeBatchId","changes":[{field,previous,new,reapprovalRequired,reapprovalTriggered}],"status":"HR_PROCESSING|PENDING_RECEIVING_MANAGER_REAPPROVAL","reapprovalCycleId":null|uuid }`.
Validation: at least one change; `changeReason` mandatory; ids must reference active master data; date per BRD-031; `otherMetadata` keys from the TDD-008.12 catalogue.
Errors: 400, 422 `NO_CHANGE_DETECTED`, 422 `MASTER_DATA_INVALID`, 422 `ORG_VACANCY_MISMATCH`, 422 `EFFECTIVE_DATE_OUT_OF_RANGE`, 409 `VACANCY_CAPACITY_UNAVAILABLE` (nothing changed), 403 `INVALID_WORKFLOW_TRANSITION` (e.g. open re-approval cycle or wrong stage), 403 scope, 404.

[RECONCILED R-11] Route-family rule: SPEC-008 `/hr/transfers/:id/{reject,request-clarification,validate-approve,...}` and `/receiving-manager/reapprovals/:cycleId/{approve,reject,request-clarification}` plus `/reapprovals/:cycleId/comments` are thin role-specific facades; they resolve the transfer/cycle and call `WorkflowEngine.transition` with the SAME action codes as SPEC-007's generic `/transfers/:id/{approve,reject,clarifications,comments}`. No second implementation or different validation; both route families must return identical results (test TC-008 + TC-007 parity).

### 12.10 `PATCH /hr/transfers/:transferId/effective-date`
Convenience for date-only change/expired correction; engine action code `CHANGE_EFFECTIVE_DATE` (a batch containing `EFFECTIVE_DATE` alongside other fields uses `HR_CHANGE_ORG_DATA`). Super Admin uses SPEC-009 12.19 `PATCH /transfers/:id/effective-date/admin-correction`, same `TransferDateService` [RECONCILED R-9/R-11]. Request `{ "effectiveDate":"YYYY-MM-DD","reason":"mandatory" }`. Authz: HR in scope, status in `PENDING_HR_REVIEW|HR_PROCESSING|PAYROLL_PROCESSING`. Response `{effectiveDate, status, reapprovalTriggered, expiredCorrection}`. Errors 400, 422 `EFFECTIVE_DATE_OUT_OF_RANGE`, 403 `INVALID_WORKFLOW_TRANSITION` (later stages → Super Admin only), 403.

### 12.11 `GET /hr/transfers/:transferId/org-changes`
HR in scope; Receiving Manager only for own open cycle (see 12.14). Response: batches with change rows incl. decision fields.

### 12.12 `POST /hr/transfers/:transferId/complete-hr-processing`
Request `{ "remarks": "optional ≤1000" }`. Authz: HR in scope, assignee, status `HR_PROCESSING`. Response 200 `{status:"PAYROLL_PROCESSING"}`. Errors: 422 `HR_ACTIVITIES_INCOMPLETE` (details: pending mandatory codes), 409 `VACANCY_RESERVATION_INACTIVE` `[PROPOSED]`, 403 `INVALID_WORKFLOW_TRANSITION` (incl. open re-approval).

### 12.13 `GET /receiving-manager/reapprovals`
Receiving Manager worklist of cycles where `pending_owner_user_id = actor` (and in scope). Pagination per convention.

### 12.14 `GET /receiving-manager/reapprovals/:cycleId`
Response: `{cycle, transferSummary, changes:[{field,previous,new,reason,changedBy,changedAt}], approvalHistory, comments, clarifications}`. Authz: cycle owner.

### 12.15 `POST /receiving-manager/reapprovals/:cycleId/approve`
Request `{ "remarks": "optional" }`. Response `{status:"HR_PROCESSING"}`. Errors 403 not owner, 403 `INVALID_WORKFLOW_TRANSITION`, 404.

### 12.16 `POST /receiving-manager/reapprovals/:cycleId/reject`
Request `{ "reason": "mandatory 3–2000" }`. Response `{status:"REJECTED", reservationReleased:true}`. Errors 400, 403.

### 12.17 `POST /receiving-manager/reapprovals/:cycleId/request-clarification`
Request `{ "question": "mandatory" }`. Response `{status:"INFO_REQUIRED", returnStatus:"PENDING_RECEIVING_MANAGER_REAPPROVAL"}`. `[DERIVED]`.

### 12.18 `POST /reapprovals/:cycleId/comments`
Request `{ "comment": "1–2000" }`. Authz: cycle's Receiving Manager or in-scope HR. Response 201. No status change.

Clarification **responses** use the SPEC-007 respond endpoint; this SPEC only supplies the responder rule and return routing.

---

## 13. Frontend Implementation

Next.js App Router + Tailwind; frontend restrictions are UX only (backend authoritative).

| Path | Purpose |
|---|---|
| `frontend/src/app/hr/transfers/page.tsx` | HR worklist: status tabs (Pending HR Review, HR Processing, Awaiting Re-Approval, Info Required), search, pagination, status badges, empty/no-access/error states. |
| `frontend/src/app/hr/transfers/[transferId]/page.tsx` | Review & processing workspace with tabs: Summary, Eligibility Revalidation, Vacancy, Activities, Organisation Changes, Documents, History. |
| `frontend/src/app/receiving-manager/reapprovals/page.tsx` | Re-approval list. |
| `frontend/src/app/receiving-manager/reapprovals/[cycleId]/page.tsx` | Previous vs updated diff, HR reason, decision panel, comments. |

Components under `frontend/src/components/hr-processing/`: `HrActionBar` (shows only actions valid for the current status; hints from `allowedActions`), `EligibilityChecksPanel` (C1–C5 pass/fail, "no other restrictions are evaluated" notice), `VacancyAvailabilityCard`, `RejectDialog` / `ClarificationDialog` (mandatory reason, character counter, confirmation), `HrActivityChecklist` (mandatory badge, progress, N/A with remark), `OrgChangeForm` (master-data dropdowns, no free text, mandatory reason, effective-date picker bounded to today..+30 in business time zone, warning "This change will send the request to the Receiving Manager for re-approval" when applicable and RM enabled, confirmation dialog), `OrgChangeDiffTable` (previous/new, shared with RM), `ReapprovalDecisionPanel`, `ReapprovalComments`, `CompleteHrProcessingButton` (disabled with list of pending mandatory activities).

Behaviours: handle 409 `VACANCY_CAPACITY_UNAVAILABLE` with a clear message and no state change; handle 403 `INVALID_WORKFLOW_TRANSITION` by refreshing the request; optimistic UI not used for state-changing actions; loading/disabled states prevent double submit; keyboard-accessible dialogs, labelled inputs, error text associated with fields (NFR-008).

---

## 14. Validation Rules

| Field | Rule |
|---|---|
| `reason`, `question`, `changeReason` | required, trimmed, 3–2000 chars `[PROPOSED]` bounds, no control chars |
| `eligibilityConfirmed` | boolean literal `true` for approve |
| ids | UUID v4 format; must exist, be active, and belong to master data/vacancy scope |
| `effectiveDate` | ISO `YYYY-MM-DD`; BRD-031 range in business time zone; not past |
| `activityCode` | must exist in `hr_activity_definitions` and be seeded for the transfer |
| `payrollReference` | same format as SPEC-009 FR-009.08 / TDD-009.02: 1–50 chars `^[A-Za-z0-9][A-Za-z0-9._/\-]{0,49}$` [RECONCILED] was 1–100; format decision is one Gate 1 item (TDD-008.11 = TDD-009.02) |
| `documentIds` | max 20 `[PROPOSED]`, each belongs to the transfer and is in scope |
| `comment` | 1–2000 chars, sanitised for storage (output-escaped in UI) |
| Unknown body fields | rejected (400) |
| Pagination | `page≥1`, `1≤pageSize≤100` |

## 15. Authorization & Security Rules

1. Chain (BRD-026): authenticated user → role (HR or RECEIVING_MANAGER) → scope → resource → action at current stage; failures: 401 / 403.
2. HR scope = employee's location/organisation in HR's mapped scope (SPEC-003) or employee's assigned HR; definition detail TDD-008.08.
3. Assignee rule: if `transfer_task_assignments` names an assignee, only that user acts; previous assignee keeps read access via history `[BRD-035]`.
4. Receiving Manager may act only as pending owner of an open cycle.
5. Reporting Manager, IT, Employee, and Super Admin get 403 on every HR/RM action here; denials are audited as security events (SPEC-002/013).
6. Responses never expose out-of-scope data; employee summary limited to minimum necessary (NFR-007).
7. All mutations validate server-side; frontend hiding is UX only.
8. No secrets/credentials in logs or audit payloads; remarks are stored as text, output-encoded in UI (XSS), parameterised queries only.
9. No external call is made by this module (no HR master / Payroll integration) `[BRD-029]`.
10. Single write path to Transfer Request organisation columns (service-level + DB trigger denying direct changes to those columns after submission unless the `app.current_action` marker set by `OrgChangeService` transaction `[PROPOSED]`).

## 16. Workflow / State Transition Rules

Allowed transitions implemented/registered here (full machine: SPEC-007):

```
PENDING_HR_REVIEW --HR_VALIDATE_APPROVE--> HR_PROCESSING          (reserve capacity; 409 leaves status unchanged)
PENDING_HR_REVIEW --REJECT(HR, reason)---> REJECTED               (release reservation; no Payroll/IT)
PENDING_HR_REVIEW --REQUEST_CLARIFICATION-> INFO_REQUIRED --RESPOND_CLARIFICATION--> PENDING_HR_REVIEW
HR_PROCESSING --HR_CHANGE_ORG_DATA (4 fields, RM enabled)--> PENDING_RECEIVING_MANAGER_REAPPROVAL
HR_PROCESSING --HR_CHANGE_ORG_DATA (RM disabled / other fields)--> HR_PROCESSING (no status change)
PENDING_RECEIVING_MANAGER_REAPPROVAL --APPROVE--> HR_PROCESSING   (reservation retained; activities reset)
PENDING_RECEIVING_MANAGER_REAPPROVAL --REJECT (reason)--> REJECTED (release)
PENDING_RECEIVING_MANAGER_REAPPROVAL --REQUEST_CLARIFICATION--> INFO_REQUIRED --RESPOND--> PENDING_RECEIVING_MANAGER_REAPPROVAL   [DERIVED]
HR_PROCESSING --COMPLETE_HR_PROCESSING (mandatory activities complete)--> PAYROLL_PROCESSING
```
Date-only change: no status change unless Super Admin-enabled date re-approval (TDD-008.05).
Every other (status, role, action) combination → 403 `INVALID_WORKFLOW_TRANSITION`, status unchanged, no side effects, audited as a security event. `HR_PROCESSING → Payroll` is the only way into `PAYROLL_PROCESSING`; there is no `HR_CONFIRMATION` status.

Reservation matrix for this SPEC: approve = reserve; clarification = retain; HR reject / RM reject = release; HR vacancy change = atomic release+reserve; RM approve = retain.

## 17. Transaction & Concurrency Rules

1. Each state-changing action runs in one `withTransaction` unit; order: `SELECT … FOR UPDATE` on `transfer_requests` row → (assignment rows, then payroll/IT task rows if touched, then vacancy lock by `VacancyService` - canonical order transfer → config → assignments → payroll/IT tasks → vacancies → reservations [RECONCILED R-5], always transfer before vacancy; for vacancy change lock old and new vacancy rows in ascending id order to avoid deadlock `[PROPOSED]`) → validations → vacancy call → data writes → `WorkflowEngine.transition` → history/audit/outbox inserts.
2. Failure at any step (including 409 capacity) rolls back everything; the refused-attempt audit is written after rollback in a separate short transaction.
3. Over-allocation prevented by `VacancyService` DB-level control (SPEC-005); this SPEC never computes capacity itself.
4. Duplicate submissions of the same action: the second sees changed status → 403 `INVALID_WORKFLOW_TRANSITION`; `Idempotency-Key` header optional `[PROPOSED]` for approve/complete (stores key → response for 24h).
5. Open re-approval cycle uniqueness is enforced by the partial unique index; a concurrent second change batch fails with 409 `CONCURRENT_MODIFICATION` or 403 status mismatch.
6. Notifications are enqueued in the same transaction (outbox) and dispatched asynchronously; delivery failure never affects the transaction `[BRD-036]`.
7. Lock timeout (`[PROPOSED]` 5 s) → 409 `CONCURRENT_MODIFICATION`; client may retry.
8. Optional optimistic check: request header `If-Match: <transfer row version>` `[PROPOSED]`; absence is tolerated.

---

## 18. Audit Requirements

All events `[PROPOSED]` codes via `AuditService.record` (fields always include actor id, role, entity, transferId, timestamp, previous/new status where applicable, remarks/reason; never credentials). Catalogue consolidated by SPEC-013.

| Event code | Trigger | Fields captured | BRD |
|---|---|---|---|
| HR_REVALIDATION_RUN | Revalidate / approve attempt | checks and outcomes, evaluator | BRD-029 r7, BRD-022 |
| HR_VALIDATE_APPROVE | Successful approve | previous/new status, vacancy id, reserved qty, hrRemarks | BRD-027, BRD-028 |
| HR_VALIDATE_APPROVE_REFUSED | 409 capacity or 422 eligibility | vacancy id, reason code, failed checks | BRD-028, BRD-037 |
| HR_REJECT | HR reject | reason, rejected by, status change, reservation released flag | BRD-033, BRD-029 |
| HR_CLARIFICATION_REQUESTED | HR request clarification | question, requested by, return status | BRD-034 |
| HR_ACTIVITY_UPDATED | Activity status/payload change | activity code, previous/new status, remarks, payroll reference (value), document ids | BRD-027(b), BRD-020 |
| HR_ACTIVITY_RESET | After re-approval | codes, reset reason, cycle id | BRD-024 |
| ORG_DATA_CHANGED | Each changed field | field, previous, new, changed by, role, time, reason, status at change, re-approval required/triggered, batch id | BRD-032, BRD-024 |
| VACANCY_CHANGED_BY_HR | Vacancy change | old vacancy, new vacancy, changed by, time, reason | BRD-028 |
| REAPPROVAL_TRIGGERED | Cycle created | cycle id, fields, pending owner | BRD-024 |
| REAPPROVAL_APPROVED / _REJECTED / _CLARIFICATION_REQUESTED | RM decisions | cycle, decision, decided by, time, remarks, field list | BRD-024, BRD-033, BRD-034 |
| REAPPROVAL_COMMENT_ADDED | Comment | cycle id, author, comment id (text stored in table) | BRD-024 |
| EFFECTIVE_DATE_CHANGED | Date change | previous, new, by, role, time, reason, expired correction, re-approval triggered | BRD-031 |
| HR_PROCESSING_COMPLETED | Complete HR processing | previous/new status, activity summary | BRD-027 |
| SECURITY_AUTHZ_DENIED / INVALID_WORKFLOW_TRANSITION_ATTEMPT | refused attempts | user, role, transferId, current status, attempted action, reason | BRD-026, BRD-027 |

Reservation release events (`VACANCY_RESERVATION_RELEASED`) are emitted by SPEC-005 inside the same transaction.

## 19. Notification Requirements

Enqueued through `NotificationService.enqueue(eventCode, payload, {trx})`; templates/delivery owned by SPEC-012. "Email + In-app" per BRD-036 channel rule. Specific "relevant stakeholders/relevant team" recipients are `[TDD-REQUIRED]` (gap 5(i)); defaults noted.

| Event | Recipient | Channel | Trigger task | BRD |
|---|---|---|---|---|
| APPROVAL_COMPLETED (HR approved) | Employee | Email + In-app | TASK-008.10 | BRD-036, BRD-027 |
| HR_ACTION_REQUIRED (HR processing started) | Assigned HR / relevant team (default: in-scope HR assignee) | Email + In-app | TASK-008.10 | BRD-036 |
| TRANSFER_REJECTED (HR) incl. reason per policy | Employee | Email + In-app | TASK-008.11 | BRD-036, BRD-033, BRD-029 |
| CLARIFICATION_REQUESTED (HR) | Employee (or responsible user per TDD-008.02) | Email + In-app | TASK-008.12 | BRD-036, BRD-034 |
| APPROVAL_REQUIRED (re-approval) | Receiving Manager | Email + In-app | TASK-008.17 | BRD-036, BRD-024 |
| REAPPROVAL_REQUESTED_INFO | Employee | Email + In-app | TASK-008.17 | BRD-027 matrix (RM + Employee notified) |
| APPROVAL_COMPLETED (re-approval approved) | HR + Employee | Email + In-app | TASK-008.18 | BRD-027 |
| HR_ACTION_REQUIRED (back to HR Processing) | Assigned HR | Email + In-app | TASK-008.18 | BRD-036 |
| TRANSFER_REJECTED (RM re-approval reject) incl. reason | HR + Employee | Email + In-app | TASK-008.18 | BRD-027, BRD-033 |
| CLARIFICATION_REQUESTED (RM re-approval) | Responder per TDD-008.02 (default HR) | Email + In-app | TASK-008.18 | BRD-034 |
| PAYROLL_TASK_ASSIGNED | Authorised HR user(s) | Email + In-app | TASK-008.20 | BRD-036, BRD-027 |

Notification failures are logged, retried by SPEC-012, and never roll back these transactions.

---

## 20. Error & Edge Cases

| Case | Behaviour |
|---|---|
| Vacancy became Full/On Hold/Closed/deleted between review and approve | 409 `VACANCY_CAPACITY_UNAVAILABLE`; status unchanged; HR may change vacancy only after approval (see TDD-008.03) or reject/clarify. |
| Employment status no longer Active at HR review | Approve refused (422); HR rejects (not eligible) per outcome table. |
| Mandatory org data missing at HR review | Approve refused (422); HR requests clarification or data is corrected by HR/Super Admin (SPEC-004) then re-evaluate; portal never invents data. |
| Clarification requested, later answered; vacancy meanwhile full | Approve → 409; HR decides reject/clarify. |
| HR submits change with only `effectiveDate` | No re-approval unless enabled; status unchanged. |
| Change batch mixes four-field change and date change | One batch, one cycle; reapproval flag per field recorded. |
| Same value submitted (no-op) | Ignored; if nothing remains, 422 `NO_CHANGE_DETECTED`. |
| HR changes field back to the originally approved value later | Treated as a new change (previous = current value); re-approval again if RM enabled. |
| RM toggle disabled after cycle opened | Cycle continues to completion (default TDD-008.06). |
| Receiving Manager rejects re-approval | Rejected final; reservation released; employee must reapply as a new request. |
| Receiving Manager unavailable | Super Admin reassigns (SPEC-010); HR cannot bypass. |
| Block/Cancel by HR/SA while a cycle is open | Governed by SPEC-010; open cycle marked cancelled `[DERIVED]`; reservation rules per SPEC-010. |
| Vacancy change fails mid-way | Rollback; old reservation intact. |
| Direct API call by wrong role/scope/stage | 403 / 403 `INVALID_WORKFLOW_TRANSITION`; audited. |
| Expired date and request in IT stage | HR gets 403; Super Admin intervenes (SPEC-010/009). |
| Duplicate/double-click approve | Second call: 403 `INVALID_WORKFLOW_TRANSITION`; no second reservation (also reserve idempotent). |
| Concurrent HR changes to the same transfer | Serialised by row lock; second sees new status/state. |
| Document upload errors | Surface SPEC-011 codes (413 `FILE_SIZE_EXCEEDED`, 415 `UNSUPPORTED_FILE_TYPE`, 415 `INVALID_FILE_TYPE`). |
| Notification outage | Transaction unaffected; failure logged. |

---

## 21. Acceptance Criteria

| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-008.AC01 | Given an in-scope HR user, When opening the worklist, Then only requests of the HR's location/organisation scope in HR-related statuses are listed. | BRD-013, BRD-026 |
| SPEC-008.AC02 | Given a request in `PENDING_HR_REVIEW`, When HR runs revalidation, Then C1–C5 results are shown and stored, and no other eligibility rule (tenure, probation, etc.) is evaluated. | BRD-029 r7/r8 |
| SPEC-008.AC03 | Given all checks pass and capacity is available, When HR Validate & Approve with `eligibilityConfirmed=true`, Then status becomes `HR_PROCESSING`, capacity is reserved in the same transaction, the activity checklist is created, history/audit/outbox rows exist. | BRD-027, BRD-028 |
| SPEC-008.AC04 | Given the vacancy is Full/On Hold/Closed or capacity exhausted, When HR approves, Then HTTP 409 `VACANCY_CAPACITY_UNAVAILABLE`, status stays `PENDING_HR_REVIEW`, no reservation exists, attempt audited. | BRD-028 |
| SPEC-008.AC05 | Given one position left and two HR users approve different requests simultaneously, Then exactly one succeeds and the other receives 409. | BRD-028, BRD-039 |
| SPEC-008.AC06 | Given the employee is not Active, When HR attempts approve, Then 422 `ELIGIBILITY_VALIDATION_FAILED`; HR can Reject with reason. | BRD-029 |
| SPEC-008.AC07 | Given HR finds the employee not eligible by policy, When HR rejects with a reason, Then status `REJECTED`, reservation released if any, employee notified with reason (per policy), no Payroll/IT task created, audit written. | BRD-029, BRD-033, BRD-028 |
| SPEC-008.AC08 | Given correctable data is missing, When HR requests clarification with a question, Then status `INFO_REQUIRED`, clarification stored, employee notified, reservation unchanged. | BRD-034, BRD-029 |
| SPEC-008.AC09 | Given the clarification is answered, Then status returns to `PENDING_HR_REVIEW` with the same HR owner and prior approvals/history intact; repeated cycles work. | BRD-034 |
| SPEC-008.AC10 | Given `HR_PROCESSING`, When HR completes `CONFIRM_*` activities for current values, Then each is recorded with user and time. | BRD-027(b) |
| SPEC-008.AC11 | Given `HR_PROCESSING`, When HR records a payroll reference and links uploaded documents, Then they are stored in the activity; no Payroll completion occurs. | BRD-020, BRD-021 |
| SPEC-008.AC12 | Given all mandatory activities complete and no open cycle, When HR completes HR Processing, Then status `PAYROLL_PROCESSING` and Payroll task notification is queued. | BRD-027, BRD-OQ-14 |
| SPEC-008.AC13 | Given a mandatory activity pending, When HR completes HR Processing, Then 422 `HR_ACTIVITIES_INCOMPLETE` lists pending codes; status unchanged. | BRD-OQ-14(b) |
| SPEC-008.AC14 | Given RM is enabled and HR changes Dept/BU (or Designation/Location/Reporting Manager) with a reason, Then status `PENDING_RECEIVING_MANAGER_REAPPROVAL`, a cycle and change rows (previous, new, reason, who, when, `reapproval_triggered=true`) exist, RM and employee notified. | BRD-024, BRD-032 |
| SPEC-008.AC15 | Given RM is disabled, When HR changes one of the four fields, Then values update, status remains `HR_PROCESSING`, `reapproval_triggered=false`, audited. | BRD-024 |
| SPEC-008.AC16 | Given a pending re-approval, When the RM opens it, Then previous and updated values and the HR reason are displayed. | BRD-024 |
| SPEC-008.AC17 | Given RM rejects with a reason, Then `REJECTED`, reservation released, HR and Employee notified, decision recorded with decider/date/remarks. | BRD-024, BRD-033, BRD-028 |
| SPEC-008.AC18 | Given RM approves, Then status `HR_PROCESSING`, reservation retained, `rm_decision=APPROVED` stored, HR confirmation activities reset to Pending, HR + Employee notified. | BRD-027, BRD-OQ-14(a) |
| SPEC-008.AC19 | Given RM requests clarification (reason), Then `INFO_REQUIRED` with return to the re-approval stage; after response the same RM reviews again. | BRD-024, BRD-034 `[DERIVED]` |
| SPEC-008.AC20 | Given a re-approval comment is added, Then it is stored with author/time and status is unchanged. | BRD-024 |
| SPEC-008.AC21 | Given HR changes the vacancy to an Open vacancy with capacity, Then old reservation released and new reserved in one transaction; audit lists old/new vacancy, changed by, time, reason. | BRD-028 |
| SPEC-008.AC22 | Given the new vacancy is unavailable, Then 409 and old reservation, values and status are unchanged. | BRD-028 |
| SPEC-008.AC23 | Given HR submits an org change without reason, Then 400 and nothing changes. | BRD-032 |
| SPEC-008.AC24 | Given any org change, Then previous value remains retrievable; the first row for a field holds the originally approved value. | BRD-032 |
| SPEC-008.AC25 | Given HR sets effective date within today..today+30 (inclusive, business time zone, weekend allowed), Then accepted, audited, no re-approval by default. | BRD-031 |
| SPEC-008.AC26 | Given the stored date is expired and the request is in an HR-controlled stage, When HR corrects it with a valid date, Then accepted with expired-correction flag. | BRD-031, BRD-OQ-20(d) |
| SPEC-008.AC27 | Given Super Admin enabled date-change re-approval, When HR changes the date, Then the request returns to the configured approval stage/approver per TDD-008.05. | BRD-031 |
| SPEC-008.AC28 | Given any HR change, Then no outbound call is made to an external HR/Payroll system and the Transfer Request data (not an external master) is what changes. | BRD-029, BRD-OQ-19 |
| SPEC-008.AC29 | Given a task reassigned away from an HR user, Then that HR user can still view history but receives 403 on actions. | BRD-035 |
| SPEC-008.AC30 | Given a notification outage, When HR approves, Then the transaction commits and the failure is logged. | BRD-036 |

## 22. Negative Acceptance Criteria

| ID | Given / When / Then | BRD-039 / BRD |
|---|---|---|
| SPEC-008.NAC01 | HR user outside the employee's scope calls any HR endpoint → 403, no data disclosed. | Security: scope |
| SPEC-008.NAC02 | Employee, Reporting Manager, IT or Super Admin calls an HR action endpoint → 403; Employee cannot read another's request via HR endpoints. | Security / Workflow: role |
| SPEC-008.NAC03 | HR approves from a status other than `PENDING_HR_REVIEW` (e.g. `HR_PROCESSING`, `COMPLETED`) → 403 `INVALID_WORKFLOW_TRANSITION`, unchanged, audited. | Workflow |
| SPEC-008.NAC04 | HR calls Complete HR Processing from `PENDING_HR_REVIEW` or `PAYROLL_PROCESSING` → 403 `INVALID_WORKFLOW_TRANSITION`. | Workflow |
| SPEC-008.NAC05 | HR tries to move a request directly to `PAYROLL_PROCESSING`/`COMPLETED` via any other API → refused; no generic status-update endpoint exists. | Workflow |
| SPEC-008.NAC06 | Employee edits a submitted request or its date → 403 (BRD-032/031). | BRD-032 |
| SPEC-008.NAC07 | Reject / clarification / org-change / date-change with blank or whitespace reason → 400. | BRD-033/034/032 |
| SPEC-008.NAC08 | `NOT_APPLICABLE` on a mandatory activity that disallows it, or without remarks → 422. | BRD-OQ-14 |
| SPEC-008.NAC09 | Activity update when status is not `HR_PROCESSING` (e.g. pending re-approval) → 403 `INVALID_WORKFLOW_TRANSITION`. | Workflow |
| SPEC-008.NAC10 | RM enabled; HR changes Dept/BU/Designation/Location/Reporting Manager; no request parameter or endpoint lets HR skip re-approval; request always enters re-approval. | Workflow: BRD-024 / RM not bypassed |
| SPEC-008.NAC11 | HR calls Complete HR Processing while a re-approval cycle is open → 403 `INVALID_WORKFLOW_TRANSITION`; HR cannot approve the cycle in the RM's place. | Workflow: RM not bypassed |
| SPEC-008.NAC12 | Receiving Manager not the cycle owner / out of scope decides → 403. | Workflow |
| SPEC-008.NAC13 | Approving against a Full vacancy → 409 `VACANCY_CAPACITY_UNAVAILABLE`; changing to a Full/On Hold/Closed vacancy → 409. | Vacancy: Full |
| SPEC-008.NAC14 | Concurrent approvals for the last position → one 409; reserved + filled never exceeds total. | Vacancy: concurrency |
| SPEC-008.NAC15 | Capacity never negative after approve/reject/vacancy-change races. | Vacancy: non-negative |
| SPEC-008.NAC16 | Free-text Department/Designation/Location/Vacancy or an inactive master → 422 `MASTER_DATA_INVALID`. | BRD-029 |
| SPEC-008.NAC17 | After HR reject or RM reject, reservation is released and no Payroll/IT record exists. | Vacancy: released |
| SPEC-008.NAC18 | Effective date in the past, or >30 days ahead → 422; stored date unchanged. | BRD-031 |
| SPEC-008.NAC19 | HR changes the date in `PENDING_IT_ACTION`/`PENDING_IT_FINAL_APPROVAL` → 403 (Super Admin only elsewhere). | BRD-031 |
| SPEC-008.NAC20 | Org change that results in no difference → 422 `NO_CHANGE_DETECTED`. | BRD-032 |
| SPEC-008.NAC21 | Direct DB-style update of `transfer_requests` org columns outside `OrgChangeService` is blocked by the guard trigger; previous values cannot be deleted from `transfer_org_changes`. | BRD-032 |
| SPEC-008.NAC22 | `eligibilityConfirmed` missing/false on approve → 400. | BRD-029 r7 |
| SPEC-008.NAC23 | No tenure/probation/disciplinary/notice/performance check exists in the revalidation (negative/absence test). | BRD-029 r8 |
| SPEC-008.NAC24 | No outbound HTTP call to any HR master/Payroll system is made during any action here. | BRD-OQ-19 |
| SPEC-008.NAC25 | Unauthenticated/expired token on any endpoint → 401. | BRD-026 |
| SPEC-008.NAC26 | Previous (reassigned-away) assignee tries to act → 403. | BRD-035 |
| SPEC-008.NAC27 | A second change batch while a cycle is open → refused (409/403), single open cycle remains. | BRD-024 |

---

## 23. Testing Requirements

| Type | Cases (TC IDs) |
|---|---|
| Unit | TC-008.01 revalidation C1–C5 matrix; TC-008.02 no extra eligibility rules; TC-008.03 reason validators; TC-008.04 diff/no-change; TC-008.05 trigger evaluation (four fields × RM enabled/disabled, vacancy-only, date-only); TC-008.06 activity completeness (mandatory/N/A rules); TC-008.07 activity reset after re-approval; TC-008.08 effective-date boundaries (today, +30, +31, past, weekend); TC-008.09 ORG_VACANCY_MISMATCH default; TC-008.10 guard: assignee/scope. |
| Integration (real PostgreSQL) | TC-008.11 approve happy path with reservation and checklist seeding; TC-008.12 capacity unavailable rollback; TC-008.13 reject releases reservation; TC-008.14 clarification cycle round trip (multiple cycles); TC-008.15 org change with re-approval (rows, cycle, status); TC-008.16 org change RM disabled; TC-008.17 RM approve/reject/clarify; TC-008.18 vacancy change atomic success/fail; TC-008.19 complete HR processing gating; TC-008.20 immutability triggers on `transfer_org_changes`; TC-008.21 partial unique open-cycle index; TC-008.22 date change with/without date re-approval config; TC-008.23 audit rows and outbox rows created in the same transaction; TC-008.24 notification failure does not roll back. |
| API | TC-008.25–TC-008.40: each endpoint in section 12 for 200/400/401/403/404/409/422 and error codes/envelope, incl. exact 403 `INVALID_WORKFLOW_TRANSITION` message. |
| Frontend | TC-008.41 worklist states; TC-008.42 reason dialogs mandatory; TC-008.43 org-change form re-approval warning and master-data-only inputs; TC-008.44 RM diff display; TC-008.45 complete button disabled with pending list; TC-008.46 409/403 handling UI; TC-008.47 date picker bounds; TC-008.48 accessibility (labels, focus trap, keyboard). |
| Security | TC-008.49 scope isolation across locations; TC-008.50 role matrix; TC-008.51 direct API without UI; TC-008.52 injection/XSS in remarks/comments; TC-008.53 no credentials in audit/log; TC-008.54 reassigned assignee. |
| Concurrency | TC-008.55 two HR users, last position, different requests; TC-008.56 same request double approve; TC-008.57 vacancy change vs another reservation race; TC-008.58 simultaneous change batches; TC-008.59 RM decision vs HR action race; TC-008.60 deadlock-free vacancy lock ordering. |
| Workflow | TC-008.61 full path HR → Payroll entry; TC-008.62 re-approval loop returns to `HR_PROCESSING` and requires reconfirmation; TC-008.63 INVALID_WORKFLOW_TRANSITION matrix for HR/RM stages (all non-allowed combos). |
| Negative | TC-008.64–TC-008.70: SPEC-008.NAC01–NAC27 mapped (NAC → TC mapping table kept in `.ai-context/test_cases/` at TDD stage). |

TDD sequence: RED tests per task before implementation; GREEN after; coverage target not numerically mandated by BRD (no numeric targets invented).

## 24. Definition of Done

- All TASK-008.01…34 complete; migrations apply/rollback cleanly; models/indexes/constraints as in section 10.
- All AC (SPEC-008.AC01–AC30) and NAC (NAC01–NAC27) pass; TC-008.01–TC-008.70 green; no failing mandatory BRD-039 workflow/vacancy scenario for this slice.
- Every endpoint documented in OpenAPI with auth, scope, request/response, errors.
- Audit events (section 18) and notification events (section 19) handed to SPEC-013 / SPEC-012 catalogues and verified emitted in-transaction.
- Concurrency tests demonstrate no over-allocation and no double reservation.
- Frontend states (loading/empty/error/no-access) implemented; accessibility checks pass.
- All `[TDD-REQUIRED]` items are answered at Gate 1 or have an explicit recorded default.
- INT standards: ES6+, async/await only, try/catch, structured logging, env config, validated input, structured JSON errors, no eval, no AI-generated comments/commit messages.
- Gate 1 approved before planning; Gate 2 code review passed before release.

---

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-008.01 | Which HR Processing activities are **mandatory** (BRD-027(b) lists activities "may include"; BRD-OQ-14 says HR must complete "mandatory organisation activities")? | Five `CONFIRM_*` + `HR_CONFIRMATION` mandatory; `UPDATE_ORG_METADATA`, `ASSIGN_PAYROLL_REFERENCE`, `UPLOAD_DOCUMENTS` optional (N/A with remark). Definitions table makes it configuration-by-seed. | Gate for `COMPLETE_HR_PROCESSING`, SPEC-009 completion gate. |
| TDD-008.02 | Who responds to an Info Required raised by HR (BRD-034 "Employee or appropriate responsible user"), and by the Receiving Manager during re-approval (matrix has no row)? Can the Employee respond to org-data issues she cannot edit? | HR clarification → Employee responds (information only, cannot edit controlled data); RM re-approval clarification → HR responds. | Responder authz, notifications, SPEC-007 `RESPOND_CLARIFICATION` rules. |
| TDD-008.03 | Stages in which HR may change the four org fields/vacancy (BRD matrix only lists `HR_PROCESSING`; BRD-020 says "during HR validation"). | Org-field and vacancy changes only in `HR_PROCESSING`; effective date also in `PENDING_HR_REVIEW`/`PAYROLL_PROCESSING`. Alternative: allow in `PENDING_HR_REVIEW` before reserving. | Scope of handlers and tests; employee/HR UX. |
| TDD-008.04 | Must target Dept/BU, Designation, Location agree with the selected vacancy's own Dept/BU, Designation, Location? | Yes; mismatch → 422 `ORG_VACANCY_MISMATCH`; HR changes both together. | Data integrity; whether HR can change org fields without changing vacancy. |
| TDD-008.05 | For an enabled date-change re-approval: which status and approver represent the "configured approval stage/approver", and where does the request return afterwards? | [RECONCILED R-8] Same as TDD-007.04 (merged): configured stage in {PENDING_REPORTING_MANAGER_APPROVAL, PENDING_RECEIVING_MANAGER_APPROVAL (if RM enabled), PENDING_RECEIVING_MANAGER_REAPPROVAL}; approver derived from the stage; return to the stored return status (the stage the request was in); remains TDD-REQUIRED because BRD-031 names no stage. | SPEC-007 config schema `date_change_reapproval_stage`, `transfer_workflow_state`. |
| TDD-008.06 | Which Receiving Manager is "applicable" after a Dept/BU/Location change; what if the RM toggle changes while a cycle is open or after the request originally skipped RM? | Re-resolve via SPEC-003 mapping from updated target; open cycle unaffected by later toggle; toggle evaluated at change time. | Pending owner assignment; gap 5(c). |
| TDD-008.07 | Policy for showing the HR rejection reason to the Employee ("as permitted by policy"). | Visible in full to the Employee in tracking/notification. | Notification content, SPEC-006 view. |
| TDD-008.08 | HR task assignment model and exact HR scope definition (pool by location/organisation mapping vs named assignee; relation to `assigned HR` on employee profile). | Request visible to all in-scope HR (pool); a named assignee (SPEC-007/010) restricts acting to that user. | Authz rules, worklists, SPEC-010 reassign. |
| TDD-008.09 | Are `employee_profiles` current Dept/BU/Designation/Location/Reporting Manager updated when a transfer completes (BRD-029 matrix says "transfer-related update by HR")? | Update at completion by SPEC-009 `finalizeAllocation` step, not here; this SPEC changes Transfer Request values only. | SPEC-009, SPEC-015 snapshot rules. |
| TDD-008.10 | Employment-status value set and exact "Active" value (gap 5(p)). | Enum from SPEC-004; Active = `ACTIVE`. | C1 check. |
| TDD-008.11 | Payroll reference format and where HR-assigned reference is stored relative to SPEC-009 `payroll_activities` (gap 5(f)). | Staged in the HR activity payload (same format as TDD-009.02, ≤50); SPEC-009 `PayrollService.openActivity` copies it into `payroll_activities.payroll_reference` at Payroll Processing entry (on-enter hook) and HR may then update it via SPEC-009 PATCH [RECONCILED]. | SPEC-009 model. |
| TDD-008.12 | Catalogue of "other approved organisational information" (BRD-020) that HR may update as `ORG_METADATA_OTHER`. | Disabled (empty catalogue) until HR/business provides the list; only the named fields are editable. | Scope of org-change DTO. |

## Out of Scope (this SPEC)

Per BRD "Out of Scope" and gate boundaries; nothing in this SPEC introduces any of the following:
- Automatic HR-system integration/synchronisation or automatic update of an external HR master (BRD-029, BRD-OQ-19); Payroll API/callback; payroll calculation (BRD-027(c)).
- Eligibility rules beyond BRD-029 (tenure, probation, disciplinary, notice period, performance) — not assumed.
- Facilities/Admin role and tasks; MFA/SSO.
- Payroll completion, IT tasks, IT Final Approval, completion gate (SPEC-009); Withdraw/Block/Resume/Cancel/Reassign (SPEC-010); Super Admin date correction in IT stages (SPEC-010/009).
- Vacancy engine internals (SPEC-005), document storage/validation (SPEC-011), notification delivery (SPEC-012), audit visibility/export (SPEC-013), dashboards (SPEC-014).
- Employee editing after submission (not permitted, BRD-032); Draft editing (SPEC-006).
