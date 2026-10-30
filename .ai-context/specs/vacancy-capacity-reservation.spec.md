# SPEC-005 — Vacancy Management, Capacity & Reservation Engine

## Feature ID
vacancy-capacity-reservation

## Status
Changes Requested at Gate 1 (2026-10-29) — reviewer Shamik Bhattacharya; see `.ai-context/pr_reviews/SPEC-005-vacancy-capacity-reservation-20261029-175816.md`. Spec must be updated and re-submitted for Gate 1; plan, tasks, tests and code remain blocked

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 1 (Spec Peer Review) | Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) | 2026-10-29 | Changes Requested | `.ai-context/pr_reviews/SPEC-005-vacancy-capacity-reservation-20261029-175816.md` |
| Gate 2 (Code Review) | — | — | Not started | — |

## Intent & Business Goals

Give the Super Admin a controlled way to define vacancies with capacity, give Employees a way to discover selectable vacancies, and give the transfer workflow a **concurrency-safe reservation engine** so that a position is consumed only when HR validates and approves a transfer, is released automatically when the transfer ends without completing, is retained while a transfer is Blocked, and becomes a final allocation when the transfer is Completed. Over-allocation and negative capacity must be impossible even under simultaneous HR approvals `[BRD-017, BRD-028]`.

Goals:
1. Vacancy master (create/edit/status) with the capacity math `Available = Capacity − Active Reserved/Allocated` `[BRD-017, BRD-028]`.
2. `vacancy_reservations` ledger tied to a transfer request, with a unique live reservation per transfer (idempotent reserve).
3. `VacancyService` — the only code path allowed to mutate vacancy counters: `reserve`, `release`, `changeVacancy` (atomic), `finalizeAllocation`, `validateForResume`, `manualRelease`.
4. Database-level guarantees (row locks plus CHECK constraints) so `reserved + allocated <= capacity` and no counter is ever negative `[BRD-028, BRD-038]`.
5. Super Admin vacancy administration UI; HR read within scope; Employee discovery list.

## User Roles & Actors

| Actor | Interaction with this SPEC |
|---|---|
| Super Admin | Creates/edits vacancies, changes status, may manually release any in-flight reservation (reason mandatory) `[BRD-010, BRD-OQ-15(c)]` |
| HR | Reads vacancies within scope; triggers reserve / change-vacancy through the HR Review/Processing handlers (SPEC-008); may manually release for requests in scope (reason mandatory); resumes/cancels via SPEC-010 which call this engine `[BRD-013, BRD-OQ-15(c)]` |
| Employee | Browses selectable vacancies (discovery); no reservation rights `[BRD-011, BRD-029]` |
| Reporting Manager, Receiving Manager, IT | No vacancy mutation or release rights `[BRD-OQ-15(c)]`; they see vacancy data only as part of a transfer detail owned by other specs |
| WorkflowEngine (SPEC-007), handlers of SPEC-008/009/010 | Internal callers of `VacancyService` inside the workflow transaction |

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-005 |
| Title | Vacancy Management, Capacity & Reservation Engine |
| Purpose | Define the `vacancies` and `vacancy_reservations` data model, capacity rules, `VacancyService` contract, concurrency/locking pattern, vacancy admin/discovery APIs and UI |
| Business objective | Prevent vacancy over-allocation, keep capacity consistent with the transfer lifecycle, and give Super Admin control over vacancy supply `[BRD-017, BRD-028]` |
| Version | 0.1 (Draft) |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer per roster | Project Manager / Product Owner |
| Task prefix | TASK-005.MM |
| Acceptance / negative IDs | SPEC-005.ACmm / SPEC-005.NACmm |
| Test IDs | TC-005.mm |
| Technical Design Decision prefix | TDD-005.NN |

## 2. Why This SPEC Exists

- BRD-017 and BRD-028 define a non-trivial reservation lifecycle (reserve at HR approval, release on Rejected/Withdrawn/Cancelled, retain while Blocked, finalise on Completed, atomic change of vacancy, resume revalidation, manual release). The rules must live in one engine, not be scattered across workflow handlers.
- BRD-039 makes four vacancy negative scenarios mandatory for UAT (Full vacancy, concurrent approvals, never negative, release on Rejected/Withdrawn) and BRD-038 requires critical operations "maintain data consistency and prevent partial or duplicate processing". These need DB-level enforcement and concurrency tests.
- Earlier specs (001 transaction helper, 002 authorisation, 003 master data) provide kernels; this SPEC is the single owner of vacancy tables and capacity math. Later specs (006 submission check, 007 engine, 008 HR approve/change, 009 completion, 010 cancel/resume/block, 014 dashboards) **call** the contract defined here.

## 3. BRD Traceability

### 3.1 BRD IDs

| BRD ID | Coverage | Notes |
|---|---|---|
| BRD-017 | FULL | Vacancy fields, Available formula, reserve at HR approval only, DB concurrency control, Full at available=0, no allocation against Full/On Hold/Closed, in-flight continue |
| BRD-028 | FULL | Capacity formula, reservation rule table (all 13 rows), release rules, HR change of vacancy (steps 1–7), concurrency/over-allocation, status rules, OQ-15 (a)–(d) |
| BRD-010 | PARTIAL (vacancy slice) | "create Vacancies with department, designation, location, capacity/headcount and status"; Super Admin views all vacancies. User/location/department admin owned by SPEC-003/004 |
| BRD-016 | PARTIAL (vacancy slice) | Vacancy attributes (department, designation, location, capacity, allocated/filled count, status) |
| BRD-011 | PARTIAL (vacancy discovery slice) | "browse eligible internal vacancies (subject to visibility rules)" — rules are TDD-REQUIRED (TDD-005.02) |
| BRD-013 | PARTIAL (vacancy slice) | "validate vacancy/capacity per agreed business rules" — the engine call; HR Review UI/handler in SPEC-008 |
| BRD-027 | PARTIAL (vacancy/downstream impact column) | Which transition triggers which engine call (Section 16.3). Transition registry owned by SPEC-007 |
| BRD-029 | PARTIAL (rule 5) | "Available" vacancy selectable; Full/On Hold/Closed not selectable; reservation only at HR approval. Eligibility engine owned by SPEC-006 |
| BRD-038 | PARTIAL (transaction slice) | "Critical operations (vacancy reservation, capacity updates, workflow state changes…) maintain data consistency and prevent partial or duplicate processing" |
| BRD-022 / BRD-037 | PARTIAL (vacancy audit events) | Vacancy and reservation audit events (Section 18). Audit kernel SPEC-001, catalogue SPEC-013 |
| BRD-026 | PARTIAL (vacancy resource/actions) | Role → scope → resource → action checks for vacancy endpoints |
| BRD-039 | PARTIAL (vacancy rows only) | Four vacancy rows, referenced below as V1–V4; security/workflow/integration rows owned by SPEC-016 and others |
| BRD-002 | PARTIAL | "open vacancies" dashboard card data source is `VacancyQueryService.getUtilisationSummary` (Section 11); card UI SPEC-014 |
| BRD-023 | PARTIAL | "vacancy utilisation" reporting input; reports in SPEC-014 |
| BRD-030 | PARTIAL | Same-vacancy-twice is prevented by the one-active-request rule (SPEC-006); this SPEC adds nothing to it |
| BRD-024 | PARTIAL | When HR change of vacancy also alters Department/BU, Designation, Location or Reporting Manager, re-approval applies (SPEC-008); this SPEC only moves the reservation |
| BRD-015 | n/a | There is no BRD-015 (numbering skips 014 to 016); noted in overview/QA specs only |

### 3.2 NFR IDs

| NFR | Coverage |
|---|---|
| NFR-006 | PARTIAL — idempotent reserve/release/finalize (safe replay, no duplicate reservation). External integration retry not applicable (none this phase) |
| NFR-008 | PARTIAL — admin UI accessibility/responsive states (UI kit SPEC-003) |
| NFR-005 | PARTIAL — capacity changes audited append-only via audit kernel |
| NFR-002 | PARTIAL — API-level authorisation of vacancy endpoints |

### 3.3 BRD-OQ

| BRD-OQ | Implemented as |
|---|---|
| BRD-OQ-05 | Reserve only at HR validation/approval (FR-005.30) |
| BRD-OQ-06 | `Available = Capacity − Allocated/Reserved`, DB transaction/locking, no new allocation once Full/On Hold/Closed, in-flight reservations unaffected, release only by authorised audited action (FR-005.20–FR-005.26, FR-005.40–FR-005.47) |
| BRD-OQ-15(a) | `validateForResume` (FR-005.36) |
| BRD-OQ-15(b) | Status change never auto-releases (FR-005.27, FR-005.28) |
| BRD-OQ-15(c) | `manualRelease` roles and mandatory reason (FR-005.37, FR-005.38) |
| BRD-OQ-15(d) | `Available Vacancy = status OPEN AND available > 0` is a derived flag, not a stored status (FR-005.12) |
| BRD-OQ-10, BRD-OQ-13, BRD-OQ-18 | Referenced only: Block/Resume/Cancel semantics owned by SPEC-010; this SPEC supplies the vacancy effects |

### 3.4 Business rules covered

1. Vacancy capacity reserved only at HR validation/approval; not at submission or manager approval `[BRD-028, Business Rules]`.
2. Reserved plus filled never exceeds total capacity; capacity never negative `[BRD-028]`.
3. Released on Rejected/Withdrawn/Cancelled; retained while Blocked; final allocation on Completed `[BRD-028]`.
4. Full/On Hold/Closed accept no new reservation; existing reservation not removed by status change alone `[BRD-028]`.
5. HR vacancy change: release old + reserve new in one transaction; failure leaves original unchanged `[BRD-028]`.
6. Manual release: HR (in scope) or Super Admin only; mandatory reason; audited `[BRD-OQ-15(c)]`.
7. Resume revalidation (five checks) and Closed vacancy blocks resume `[BRD-OQ-15(a),(b)]`.

### 3.5 Acceptance criteria (BRD "Acceptance Criteria" bullets) covered

| BRD acceptance bullet | Mapped to |
|---|---|
| "Super Admin can configure locations, departments, designations and vacancies with capacity." (vacancy part) | SPEC-005.AC01–AC06 |
| "An eligible employee can view permitted vacancies…" (vacancy view part) | SPEC-005.AC07–AC08 |
| "Vacancy capacity is only reserved at HR validation/approval, and the system prevents allocation beyond configured capacity under concurrent HR actions." | SPEC-005.AC10, AC17 |
| "Available capacity is calculated as Total Capacity − Active Reserved/Allocated Capacity…one succeeds and the other receives a capacity-unavailable response" | SPEC-005.AC09, AC17 |
| "Resuming a Blocked request revalidates the vacancy and reservation…" | SPEC-005.AC20–AC22 |
| "Rejected, withdrawn and cancelled requests release their reservation (audited); a Blocked request retains it; a Completed transfer converts it…" | SPEC-005.AC12–AC15, AC19 |
| "When HR changes the selected vacancy…single transaction; if the new reservation fails, the original is unchanged" | SPEC-005.AC16, AC18 |
| BRD-038 acceptance: "a failed or interrupted vacancy reservation, capacity update or workflow state change leaves no partial or duplicate result" | SPEC-005.AC18, NAC20 |

### 3.6 Negative scenarios (BRD-039 vacancy rows)

| Ref | BRD-039 scenario | Mapped to |
|---|---|---|
| V1 | A Full vacancy cannot receive a new allocation/reservation (BRD-028) | SPEC-005.NAC01, NAC02 |
| V2 | Concurrent HR approvals do not cause vacancy capacity to be exceeded | SPEC-005.NAC05, NAC06 |
| V3 | Vacancy capacity never becomes negative | SPEC-005.NAC07, NAC08, NAC09 |
| V4 | Rejected and Withdrawn transfer requests release their reserved vacancy/capacity | SPEC-005.AC12, AC13 (positive release proofs) and NAC12 |

## 4. Dependencies

| Depends on | Needed capability |
|---|---|
| SPEC-001 | `withTransaction` helper (READ COMMITTED default), error classes, request-id, logger, config loader, response envelope, validation middleware, migration conventions, `AuditService.record(event,{trx})`, UI kit/layout shell |
| SPEC-002 | `AuthorizationService.authorize(ctx,{resource,action,target})`, `ScopeResolver` interface, JWT context (`userId`, `role`) |
| SPEC-003 | Master tables for departments/business units, designations, locations (and `is_active`); admin shell and list/form UI patterns; HR location/organisation scope mapping data |
| SPEC-004 | Employee profile records (employee IDs referenced by reservations) |
| SPEC-006 | `transfer_requests` table (FK target `vacancy_reservations.transfer_request_id`), selected-vacancy column `proposed_vacancy_id` [RECONCILED name], a read port `TransferReadPort.getForUpdate(transferId,{trx})` returning `{id,status,employeeId,selectedVacancyId}` (`selectedVacancyId` = `proposed_vacancy_id`) |
| SPEC-007 | `WorkflowEngine.transition` owns the transaction and invokes this SPEC's engine calls through the effect registry (Section 16.3) |

## 5. Enables

| Consumer | Uses |
|---|---|
| SPEC-006 | `VacancyService.checkSelectable(vacancyId)` for submission eligibility (BRD-029 rule 5); `VacancyPicker` component |
| SPEC-007 | Effect registry hooks (`onReject`, `onWithdraw`, `onCancel`, `onComplete`) |
| SPEC-008 | `reserve` on HR Validate & Approve; `changeVacancy` on HR vacancy change; `VacancyReservationPanel` |
| SPEC-009 | `finalizeAllocation` inside the completion transaction |
| SPEC-010 | `validateForResume` on Resume; automatic release on Cancel; retained on Block |
| SPEC-013 | Vacancy audit events for catalogue verification |
| SPEC-014 | `VacancyQueryService.getUtilisationSummary` for open-vacancy card and vacancy utilisation report |
| SPEC-015/016 | Concurrency/consistency NFR hardening and BRD-039 vacancy scenarios (this SPEC provides the tests TC-005.*) |

## 6. Roles & Scope

| Role | Vacancy list/detail | Create/Edit/Status | Discovery | Reservation ledger read | Manual release | Internal reserve/change/finalize/validate |
|---|---|---|---|---|---|---|
| SUPER_ADMIN | All | Yes | No (uses admin list) | All | Yes (any in-flight) | n/a (not a direct API) |
| HR | Within scope (see TDD-005.03) read-only | No | No | Within scope read-only | Yes, requests within HR scope (TDD-005.15) | Via SPEC-008/010 handlers only |
| EMPLOYEE | No | No | Yes (Open + available) | No | No | No |
| REPORTING_MANAGER | No | No | No | No | No | No |
| RECEIVING_MANAGER | No | No | No | No | No | No |
| IT | No | No | No | No | No | No |

`[BRD-OQ-15(c)]` for release rights; `[DERIVED]` from BRD-010 / Actors table for the remaining rows (Super Admin manages vacancies; no other role is granted vacancy administration).

## 7. Functional Requirements

### 7.1 Vacancy master

| ID | Requirement | Tag |
|---|---|---|
| FR-005.01 | Super Admin can create a vacancy with: Department/Business Unit, Designation, Location (all selected from active master data, never free text), Capacity, opening Filled count (default 0) and initial Status (default OPEN). | `[BRD-010, BRD-017, BRD-029 master-data rule]`; opening filled input is `[DERIVED]` from BRD-028 example "Already Filled 3" |
| FR-005.02 | Every vacancy has a unique, system-generated, immutable `reference`. Format `VAC-` + 6 digits from a sequence. | `[BRD-017]` field; format `[PROPOSED]` → TDD-005.01 |
| FR-005.03 | Vacancy stores: reference, Department/BU, Designation, Location, Capacity, Allocated/Filled, Reserved, Available, Status. Available is never entered by users. | `[BRD-017]` |
| FR-005.04 | Super Admin can edit Capacity, opening Filled count, and organisation fields (Department/BU, Designation, Location). Organisation-field edits are refused while the vacancy has any live (ACTIVE/ALLOCATED) reservation. | Edit `[BRD-010]`; lock rule `[PROPOSED]` → TDD-005.04 (rationale: BRD-OQ-15(a) requires "employee and selected vacancy still match the approved transfer details") |
| FR-005.05 | Capacity may not be reduced below `Reserved + Allocated`. The request is refused with `VACANCY_CAPACITY_BELOW_COMMITMENT`. | `[DERIVED]` from BRD-028 "Reserved + Filled/Allocated must never exceed Total Vacancy Capacity" |
| FR-005.06 | Capacity must be an integer ≥ 1 (API validation). | `[TDD-REQUIRED]` min/max → TDD-005.04; default `[PROPOSED]` min 1, max 100000 |
| FR-005.07 | Opening Filled count: integer ≥ 0. `Allocated/Filled = opening_filled_count + number of ALLOCATED reservations`. Lowering opening Filled count below zero is refused; it can never push Allocated below the opening value. | `[DERIVED]` from BRD-017 "Allocated/Filled" + BRD-028; semantic `[PROPOSED]` → TDD-005.05 |
| FR-005.08 | Vacancy references to inactive master data (department, designation, location) are refused at create/edit. | `[DERIVED]` from BRD-010 (locations activate/deactivate), BRD-029 "must come from configured portal master data" |
| FR-005.09 | There is no hard delete of vacancies. A soft-delete column exists (`deleted_at`) because BRD-OQ-15(a) refers to "has not been deleted"; whether Super Admin can soft-delete is TDD. Default: no delete endpoint in this phase; the column is read by every check. | `[DERIVED]` + `[TDD-REQUIRED]` TDD-005.07 |
| FR-005.10 | Vacancy list supports search (reference), filters (status, department, designation, location, "available only"), sort, pagination. | `[BRD-002]` tables pattern; params `[PROPOSED]` |
| FR-005.11 | Vacancy detail shows capacity breakdown (Capacity, Filled, Reserved, Available) and the reservation ledger (transfer reference, employee, state, reserved/released/allocated timestamps and reasons). | `[DERIVED]` from BRD-017/BRD-028 |
| FR-005.12 | `isAvailable = (status = OPEN AND availableCapacity > 0)` is computed, never stored as a status. | `[BRD-028 OQ-15(d)]` |

### 7.2 Capacity math and automatic Full

| ID | Requirement | Tag |
|---|---|---|
| FR-005.20 | `Available Capacity = Capacity − (Reserved + Allocated)` where Reserved = count of ACTIVE reservations and Allocated = opening filled + count of ALLOCATED reservations. Worked example: Capacity 5, Filled 3, Active reservation 1 → Available 1. | `[BRD-028]` |
| FR-005.21 | When any operation leaves `Available = 0` and status is OPEN, status becomes FULL in the same transaction (automatic Full). | `[BRD-017]` |
| FR-005.22 | FULL ⇔ available = 0. A manual change to FULL while available > 0 is refused (`VACANCY_STATUS_NOT_ALLOWED`). | `[DERIVED]` from BRD-OQ-15(d) "Full = available capacity zero" |
| FR-005.23 | If a vacancy is FULL and available becomes > 0 (release, or capacity increase), status automatically returns to OPEN in the same transaction. ON_HOLD and CLOSED never change automatically. | `[DERIVED]` (FULL defined as available zero); TDD-005.06 records the confirmation request |
| FR-005.24 | A manual request to set OPEN while available = 0 stores FULL (reopen result is derived by FR-005.21). Reopening ON_HOLD/CLOSED with available > 0 stores OPEN. | `[DERIVED]` |
| FR-005.25 | Super Admin can change status among OPEN, ON_HOLD, CLOSED (and to FULL only when FR-005.22 allows). The change is audited with previous/new status and optional remark. | `[BRD-017]`; remark mandatory-ness `[TDD-REQUIRED]` TDD-005.06 |
| FR-005.26 | Capacity edits, status edits and reservation operations on the same vacancy are serialised by the vacancy row lock (Section 17). | `[BRD-028, BRD-038]` |
| FR-005.27 | Changing a vacancy to FULL, ON_HOLD or CLOSED **never** releases any existing reservation. | `[BRD-028 OQ-15(b)]` |
| FR-005.28 | Changing status does not move any transfer's workflow status. Transfers continue per their own status; only new reservations and resume are affected (FR-005.35, FR-005.36). | `[BRD-017]` "existing in-flight requests and reservations continue per their workflow status" |

### 7.3 Discovery

| ID | Requirement | Tag |
|---|---|---|
| FR-005.29 | Employees can list vacancies selectable for a transfer: status OPEN, available > 0, not deleted. Employee never sees FULL/ON_HOLD/CLOSED vacancies. Response is minimal (reference, Department/BU, Designation, Location, availableCapacity). Additional visibility restrictions beyond "Available" are not defined by the BRD; default is no further restriction. | Core `[BRD-011, BRD-029 rule 5]`; extra rules `[TDD-REQUIRED]` TDD-005.02 |
| FR-005.29a | `VacancyService.checkSelectable(vacancyId)` returns `{selectable, reason}` (non-locking, advisory) for SPEC-006 submission validation. A later change (vacancy becomes Full before HR approval) is caught by the locked check in `reserve`. | `[BRD-029 rule 5, BRD-017]` |

### 7.4 Reservation engine

| ID | Requirement | Tag |
|---|---|---|
| FR-005.30 | `reserve` is called only from the HR "Validate & Approve" transition (Pending HR Review → HR Processing). No reservation at submit, Reporting Manager approve or Receiving Manager approve. | `[BRD-028, BRD-OQ-05, BRD-027]` |
| FR-005.31 | `reserve` locks the vacancy row, re-checks status = OPEN and available > 0, inserts an ACTIVE reservation and increments `reserved_count` in the same transaction ("the system re-checks availability immediately before HR confirms the allocation"). | `[BRD-017, BRD-028]` |
| FR-005.32 | If capacity or status does not permit, `reserve` raises HTTP 409 `VACANCY_CAPACITY_UNAVAILABLE`; the enclosing workflow transition rolls back, so the transfer stays Pending HR Review. | `[BRD-028]` response required; code `[PROPOSED]` → TDD-005.11 |
| FR-005.33 | A transfer has at most one live (ACTIVE or ALLOCATED) reservation (partial unique index). Reserving again for the same transfer and same vacancy is an idempotent replay (returns existing reservation, no counter change, no new audit event). Reserving for a different vacancy while a live reservation exists is refused (`RESERVATION_ALREADY_EXISTS`); use `changeVacancy`. | `[DERIVED]` from BRD-028 duplicate/concurrency prevention + NFR-006; mechanism `[PROPOSED]` |
| FR-005.34 | `release` (automatic) is invoked on Rejected, Withdrawn and Cancelled transitions. It marks the ACTIVE reservation RELEASED with a reason code, decrements `reserved_count`, applies FR-005.23, audits. If no ACTIVE reservation exists it is a no-op (BRD: "No vacancy reservation normally exists before HR approval"). | `[BRD-028, BRD-027, BRD-033]` |
| FR-005.35 | No new reservation against ON_HOLD, CLOSED or FULL vacancies, including `changeVacancy` targets. | `[BRD-028, BRD-017]` |
| FR-005.36 | `validateForResume` runs the five BRD-OQ-15(a) checks plus the vacancy-status rule of OQ-15(b) (CLOSED and ON_HOLD vacancies do not allow resume; FULL does). It returns all failures; the caller (SPEC-010) keeps the request Blocked on any failure. | `[BRD-OQ-15(a),(b), BRD-027]` |
| FR-005.37 | `manualRelease` is permitted to SUPER_ADMIN and to HR for requests in HR's authorised scope. REPORTING_MANAGER, RECEIVING_MANAGER, EMPLOYEE and IT receive HTTP 403. | `[BRD-OQ-15(c)]` |
| FR-005.38 | `manualRelease` requires a non-blank reason; audit records vacancy, Transfer Request ID, employee, capacity released, released by, role, reason, date/time. | `[BRD-OQ-15(c)]` |
| FR-005.39 | While a transfer is BLOCKED the reservation stays ACTIVE (no engine call on Block). It is released only by Rejected/Withdrawn/Cancelled transitions or `manualRelease`. | `[BRD-028, BRD-027]` |
| FR-005.40 | `changeVacancy` validates the target (exists, not deleted, OPEN, available > 0, different from current), releases the old reservation and reserves the new one in one transaction; on any failure the original reservation and both vacancies' counters are unchanged. | `[BRD-028 steps 1–6]` |
| FR-005.41 | `changeVacancy` audit records old vacancy, new vacancy, changed by, date/time and reason (reason mandatory). | `[BRD-028 step 7]` |
| FR-005.42 | `finalizeAllocation` is called inside the Completed transition: ACTIVE → ALLOCATED, `reserved_count − 1`, `allocated_count + 1`; available is unchanged. It is permitted whatever the vacancy status (in-flight reservations continue). Replay on an already ALLOCATED reservation is a no-op. | `[BRD-028 "Completion", BRD-017]` |
| FR-005.43 | `finalizeAllocation` with no live reservation raises `RESERVATION_NOT_FOUND`, which blocks completion (SPEC-009 must propagate the error and roll back). | `[DERIVED]` from BRD-027 "Completed → Vacancy allocation finalised" |
| FR-005.44 | Reservation rows are a durable ledger: never deleted, terminal states (RELEASED, ALLOCATED) are immutable. | `[DERIVED]` from audit/traceability needs (BRD-037) + `[PROPOSED]` trigger |
| FR-005.45 | All engine calls require a caller-supplied transaction handle and never open or commit their own; callers hold the transaction. | `[BRD-038]` "workflow state changes and vacancy reservation consistent" |
| FR-005.46 | An HR change of vacancy that also triggers BRD-024 re-approval keeps the NEW reservation ACTIVE while the transfer is Pending Receiving Manager Re-Approval; re-approval Approve retains it, Reject releases it (Rejected → release). | `[BRD-027 matrix rows "HR Processing/Change…", "Pending Receiving Manager Re-Approval"]` |
| FR-005.47 | Capacity-unavailable and resume-validation failures are audited in a separate transaction so the record survives the rolled-back workflow transaction. | `[PROPOSED]` (audit requirement for material actions `[BRD-037]`) |

### 7.5 UI

| ID | Requirement | Tag |
|---|---|---|
| FR-005.50 | Super Admin vacancy list with status badges, filters, search, sort, pagination; loading, empty, no-access and error states. | `[BRD-002, BRD-003]` |
| FR-005.51 | Create/edit form with inline validation, required-field indicators; org fields locked with explanatory text when live reservations exist. | `[BRD-002]`, lock `[PROPOSED]` |
| FR-005.52 | Status change uses a confirmation dialog (sensitive action). | `[BRD-002]` |
| FR-005.53 | Vacancy detail with capacity breakdown and reservation ledger. | `[DERIVED]` |
| FR-005.54 | HR sees the same list/detail read-only (no create/edit/status controls rendered; API still enforces). | `[BRD-026]` |
| FR-005.55 | `VacancyReservationPanel` (reusable, embedded in transfer detail by SPEC-008/010) shows current reservation and a Manual Release action with mandatory reason, shown only to SUPER_ADMIN and HR. | `[BRD-OQ-15(c)]` |
| FR-005.56 | Employee discovery page and reusable `VacancyPicker` for the transfer form (SPEC-006). | `[BRD-011]` |

## 8. Internal Implementation Plan / Tasks

| Task | Title | Layer | Description | Inputs / Outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-005.01 | Migration: `vacancies` | DB | Create sequence `vacancy_reference_seq`, table, indexes and CHECK constraints (Section 10.1) | In: SPEC-003 master tables. Out: migration file `backend/src/migrations/<ts>-create-vacancies.ts` | SPEC-003 tables | BRD-017, BRD-028 |
| TASK-005.02 | Migration: `vacancy_reservations` | DB | Table, state CHECKs, partial unique index, guard triggers (Section 10.2) without the transfer FK | In: TASK-005.01. Out: migration | TASK-005.01 | BRD-028 |
| TASK-005.03 | Migration: FK to `transfer_requests` | DB | `ALTER TABLE vacancy_reservations ADD CONSTRAINT fk_vres_transfer …`; timestamp must be later than SPEC-006's transfer table migration | In: SPEC-006 migration. Out: migration | TASK-005.02, SPEC-006 | BRD-028 |
| TASK-005.04 | Sequelize models | BE | `Vacancy`, `VacancyReservation` models with generated/virtual `availableCapacity`, associations to master data | Out: `modules/vacancy/models/*.ts` | 005.01–005.03 | BRD-017 |
| TASK-005.05 | Constants, DTOs, error codes | BE | `VACANCY_STATUS`, `RESERVATION_STATUS`, `RELEASE_REASON`, error classes extending SPEC-001 `AppError` (Section 20 table) | Out: `constants/`, `dto/`, `errors` | SPEC-001 | BRD-028 |
| TASK-005.06 | Capacity & status domain functions | BE | Pure functions: `computeAvailable`, `normaliseStatus`, `assertStatusChangeAllowed`, `assertCapacityEdit` | Out: `domain/capacity.ts` (unit tested, no I/O) | 005.05 | BRD-017, BRD-028 |
| TASK-005.07 | Repository with locking primitives | BE | `lockVacancyForUpdate`, `lockVacanciesOrdered`, `findLiveReservationByTransfer`, `insertReservationIfAbsent`, counter UPDATEs, list/query with scope filters (Section 11.4) | Out: `repositories/*.ts` | 005.04 | BRD-028, BRD-038 |
| TASK-005.08 | `VacancyAdminService` | BE | create/update/changeStatus using repository + domain functions + audit | Out: `services/vacancy-admin.service.ts` | 005.06, 005.07 | BRD-010, BRD-017 |
| TASK-005.09 | Validators | BE | Joi schemas for create/update/status/list/discovery/manual-release | Out: `validations/*.ts` | 005.05 | BRD-026, INT std |
| TASK-005.10 | Admin controllers & routes | BE | `POST/GET/PATCH /vacancies…` with authorise middleware | Out: `controllers/`, `routes/` | 005.08, 005.09, SPEC-002 | BRD-010, BRD-026 |
| TASK-005.11 | `VacancyQueryService` & HR scope filter | BE | List/detail/ledger with HR scope, `getUtilisationSummary` | Out: `services/vacancy-query.service.ts` | 005.07, SPEC-003 scope data | BRD-013, BRD-023 |
| TASK-005.12 | Discovery endpoint & `checkSelectable` | BE | `GET /vacancy-discovery`, advisory selectable check | Out: service + controller | 005.07 | BRD-011, BRD-029 |
| TASK-005.13 | `VacancyService.reserve` | BE | Locking pattern (Section 17.2), idempotency, FULL transition, errors, audit | Out: `services/vacancy-reservation.service.ts` | 005.07, SPEC-001 audit | BRD-017, BRD-028 |
| TASK-005.14 | `VacancyService.release` | BE | Automatic release with reason code | same | 005.13 | BRD-028 |
| TASK-005.15 | `VacancyService.changeVacancy` | BE | Ordered locks + savepoint + atomic swap | same | 005.13, 005.14 | BRD-028 |
| TASK-005.16 | `VacancyService.finalizeAllocation` | BE | ACTIVE → ALLOCATED | same | 005.13 | BRD-028 |
| TASK-005.17 | `VacancyService.validateForResume` | BE | Five BRD-OQ-15(a) checks + status rule, returns failure list | same | 005.13 | BRD-OQ-15 |
| TASK-005.18 | `manualRelease` + REST endpoints | BE | Authz (SUPER_ADMIN / HR in scope), transfer-row lock via `TransferReadPort`, mandatory reason, endpoints 8–9 (Section 12) | Out: service + controller | 005.14, SPEC-006 port | BRD-OQ-15(c) |
| TASK-005.19 | Effect registry registration | BE | Export `vacancyTransitionEffects` map (Section 16.3) for SPEC-007/008/009/010 handlers | Out: `effects/vacancy-effects.ts` | 005.13–005.17 | BRD-027, BRD-028 |
| TASK-005.20 | Audit & failure-audit wiring | BE | Emit events (Section 18); capacity-unavailable/resume-failure audit in separate transaction | Out: audit calls | SPEC-001 audit | BRD-037 |
| TASK-005.21 | Authorisation policy registration | BE | Register resources `vacancy`, `vacancy_reservation` and actions with SPEC-002 | Out: policy entries | SPEC-002 | BRD-026 |
| TASK-005.22 | Counter reconciliation script | BE | `backend/scripts/reconcile-vacancy-counters.ts` read-only report comparing counters to ledger | Out: script; used by tests | 005.07 | BRD-038 |
| TASK-005.23 | Frontend API client & types | FE | Typed client, query hooks, error-code mapping | Out: `frontend/src/lib/api/vacancies.ts` | 005.10 | BRD-002 |
| TASK-005.24 | Admin list page | FE | `/admin/vacancies` | Out: page + components | 005.23, SPEC-003 shell | BRD-002, BRD-003 |
| TASK-005.25 | Create/Edit form | FE | `/admin/vacancies/new`, `/admin/vacancies/[id]/edit` | Out: pages | 005.24 | BRD-010 |
| TASK-005.26 | Detail, ledger, status dialog | FE | `/admin/vacancies/[id]` | Out: page | 005.24 | BRD-017, BRD-028 |
| TASK-005.27 | HR read-only views & reservation panel | FE | `/hr/vacancies…`, `VacancyReservationPanel`, manual-release dialog | Out: components | 005.18, 005.23 | BRD-OQ-15(c) |
| TASK-005.28 | Employee discovery & `VacancyPicker` | FE | `/employee/vacancies`, reusable picker | Out: components | 005.12 | BRD-011 |
| TASK-005.29 | Unit tests | QA | TC-005.01–TC-005.20 | `tests/backend/vacancy/unit/` | 005.06 | all |
| TASK-005.30 | Integration & API tests | QA | TC-005.21–TC-005.45 | `tests/backend/vacancy/integration/` | 005.10–005.18 | all |
| TASK-005.31 | Concurrency tests on real PostgreSQL | QA | TC-005.46–TC-005.58 | `tests/backend/vacancy/concurrency/` | 005.13–005.16 | BRD-039 V2/V3 |
| TASK-005.32 | Security/authorisation tests | QA | TC-005.59–TC-005.66 | `tests/backend/vacancy/security/` | 005.10, 005.18, 005.21 | BRD-026 |
| TASK-005.33 | Workflow-contract tests with engine stub | QA | TC-005.67–TC-005.74 (effects per transition) | `tests/backend/vacancy/workflow/` | 005.19 | BRD-027 |
| TASK-005.34 | Frontend tests | QA | TC-005.75–TC-005.82 | `tests/frontend/vacancy/` | 005.24–005.28 | BRD-002 |
| TASK-005.35 | OpenAPI documentation | BE | Document all endpoints in Section 12 | `src/docs/paths/vacancies.yaml` | 005.10, 005.18 | Backend-Architecture §20 |

Task order: 01 → 02 → 03 → 04 → 05/06 → 07 → 08/09/11/12 → 10 → 13 → 14 → 15 → 16 → 17 → 18 → 19/20/21 → 22 → frontend 23–28 → QA 29–34 → 35. Tests are written first (TDD RED) per task before implementation.

## 9. Business Rules

1. `Available Capacity = Capacity − (Reserved + Allocated)`; Allocated/Filled includes the opening filled count `[BRD-028, BRD-017]`.
2. `Available Vacancy = status OPEN AND Available Capacity > 0`; "Available" is a description, not a stored status `[BRD-OQ-15(d)]`.
3. FULL ⇔ available 0; FULL auto-set at 0 `[BRD-017]`; FULL auto-returns to OPEN when available > 0 `[DERIVED]`.
4. No reservation unless the vacancy is OPEN with available > 0 at the moment of locking `[BRD-028]`.
5. Reserve only at HR Validate & Approve `[BRD-028]`.
6. Release automatically on Rejected/Withdrawn/Cancelled; retain while Blocked and during Info Required; retain across BRD-024 re-approval; finalise on Completed `[BRD-028, BRD-027]`.
7. A vacancy status change never releases a reservation `[BRD-OQ-15(b)]`.
8. Closed vacancy: no resume; reservation retained; resolution paths are reopen, change vacancy, or cancel+release `[BRD-OQ-15(b)]`. On Hold: transfer stays Blocked until reopen or authorised cancel/release `[BRD-OQ-15(b)]`. Full: reservation continues; transfer may resume `[BRD-OQ-15(b)]`.
9. Manual release by SUPER_ADMIN or in-scope HR only, with mandatory reason; audited `[BRD-OQ-15(c)]`.
10. Change of vacancy: new vacancy validated Open + capacity, old released, new reserved in one transaction; failure leaves original unchanged `[BRD-028]`.
11. One live reservation per transfer; reservation operations idempotent `[DERIVED]`.
12. Capacity can never be reduced below committed (Reserved + Allocated) `[DERIVED]`.
13. Counters never negative; `reserved + allocated <= capacity` is enforced by the database `[BRD-028]`.
14. Vacancy data comes from master data, never free text `[BRD-029]`.
15. No tenure/probation/other eligibility rule is applied in vacancy discovery `[BRD-029 rule 8]`.

## 10. Data Model & Database

Conventions: migrations under `backend/src/migrations/`; no auto-sync in production `[Backend-Architecture §8]`. Primary keys are `uuid` (`gen_random_uuid()`); foreign-key column types must match the referenced PK types decided by SPEC-001/002/003/006. Status columns are `varchar` + CHECK (avoids ENUM migration friction) `[PROPOSED]`. All timestamps `timestamptz`.

### 10.1 `vacancies` `[PROPOSED]`

| Column | Type | Constraints / notes |
|---|---|---|
| id | uuid | PK |
| reference | varchar(20) | NOT NULL, UNIQUE, default `'VAC-' \|\| lpad(nextval('vacancy_reference_seq')::text, 6, '0')`; immutable (guard trigger) |
| department_id | uuid | NOT NULL FK `departments(id)` (SPEC-003) |
| designation_id | uuid | NOT NULL FK `designations(id)` |
| location_id | uuid | NOT NULL FK `locations(id)` |
| capacity | integer | NOT NULL |
| opening_filled_count | integer | NOT NULL default 0 |
| allocated_count | integer | NOT NULL default 0 — Allocated/Filled; invariant `= opening_filled_count + count(ALLOCATED reservations)` |
| reserved_count | integer | NOT NULL default 0 — invariant `= count(ACTIVE reservations)` |
| available_count | integer | `GENERATED ALWAYS AS (capacity - allocated_count - reserved_count) STORED` |
| status | varchar(10) | NOT NULL default 'OPEN' |
| status_remark | varchar(500) | NULL (last manual status remark) |
| version | integer | NOT NULL default 1; incremented on every UPDATE (optimistic concurrency for admin edits) |
| created_by, updated_by | uuid | NOT NULL FK users |
| created_at, updated_at | timestamptz | NOT NULL default now() |
| deleted_at, deleted_by | timestamptz, uuid | NULL (soft delete, TDD-005.07) |

Constraints:

| Name | Definition |
|---|---|
| chk_vacancies_capacity_min | `capacity >= 1` (TDD-005.04) |
| chk_vacancies_counts_nonneg | `opening_filled_count >= 0 AND allocated_count >= 0 AND reserved_count >= 0` |
| chk_vacancies_allocated_ge_opening | `allocated_count >= opening_filled_count` |
| chk_vacancies_commitment | `reserved_count + allocated_count <= capacity` (**the over-allocation guard** `[BRD-028]`) |
| chk_vacancies_status_values | `status IN ('OPEN','FULL','ON_HOLD','CLOSED')` |
| chk_vacancies_open_full_consistency | `(status <> 'OPEN' OR capacity - reserved_count - allocated_count > 0) AND (status <> 'FULL' OR capacity - reserved_count - allocated_count = 0)` (automatic Full at DB level) |

Indexes: `uq_vacancies_reference` (unique), `ix_vacancies_status`, `ix_vacancies_location_status (location_id, status)`, `ix_vacancies_department (department_id)`, `ix_vacancies_designation (designation_id)`, partial discovery index `ix_vacancies_open_discovery (location_id, department_id, designation_id) WHERE status = 'OPEN' AND deleted_at IS NULL`.

Triggers: `trg_vacancies_no_delete` BEFORE DELETE raises exception (soft delete only); `trg_vacancies_guard_update` BEFORE UPDATE rejects change to `id`, `reference`, `created_by`, `created_at`.

### 10.2 `vacancy_reservations` (ledger) `[PROPOSED]`

| Column | Type | Constraints / notes |
|---|---|---|
| id | uuid | PK |
| vacancy_id | uuid | NOT NULL FK `vacancies(id)` ON DELETE RESTRICT |
| transfer_request_id | uuid | NOT NULL FK `transfer_requests(id)` (added by TASK-005.03) |
| employee_id | uuid | NOT NULL FK `employee_profiles(id)` — the transferring employee [RECONCILED] Decision R-2: `employee_id` columns (transfer_requests, vacancy_reservations, documents) = `employee_profiles(id)`; every user reference (`*_user_id`, `*_by`) = `users(id)` uuid; `employee_profiles.user_id` links the two |
| status | varchar(10) | NOT NULL default 'ACTIVE' CHECK IN ('ACTIVE','RELEASED','ALLOCATED') |
| reserved_at | timestamptz | NOT NULL default now() |
| reserved_by | uuid | NOT NULL (HR user approving) |
| reserved_by_role | varchar(20) | NOT NULL |
| released_at | timestamptz | NULL |
| released_by | uuid | NULL |
| released_by_role | varchar(20) | NULL |
| release_reason_code | varchar(20) | NULL CHECK IN ('REJECTED','WITHDRAWN','CANCELLED','MANUAL','VACANCY_CHANGED') |
| release_reason_text | varchar(1000) | NULL |
| allocated_at | timestamptz | NULL |
| allocated_by | uuid | NULL (actor of the completing transition: IT Final Approval user) |
| replaces_reservation_id | uuid | NULL self-FK (set on the new row of a vacancy change) |
| created_at, updated_at | timestamptz | NOT NULL |

Quantity is always 1 (one employee per transfer); audit "capacity released" = 1.

Constraints:

| Name | Definition |
|---|---|
| chk_vres_state_columns | `(status='ACTIVE' AND released_at IS NULL AND allocated_at IS NULL) OR (status='RELEASED' AND released_at IS NOT NULL AND released_by IS NOT NULL AND release_reason_code IS NOT NULL AND allocated_at IS NULL) OR (status='ALLOCATED' AND allocated_at IS NOT NULL AND released_at IS NULL)` |
| chk_vres_manual_reason | `release_reason_code IS DISTINCT FROM 'MANUAL' OR length(btrim(release_reason_text)) > 0` |
| uq_vres_one_live_per_transfer | UNIQUE INDEX `(transfer_request_id) WHERE status IN ('ACTIVE','ALLOCATED')` (**idempotency / one live reservation per transfer**) |

Indexes: `ix_vres_vacancy_status (vacancy_id, status)`, `ix_vres_employee (employee_id)`, `ix_vres_transfer (transfer_request_id)`.

Triggers: `trg_vres_guard` BEFORE UPDATE: raises if `OLD.status <> 'ACTIVE'` (terminal rows immutable) or if `vacancy_id`, `transfer_request_id`, `employee_id`, `reserved_*` change; BEFORE DELETE raises. The application DB role is granted no DELETE on this table `[PROPOSED]`.

### 10.3 Invariants (verified by TASK-005.22 and by every concurrency test)

For every vacancy `v`: `v.reserved_count = count(vres WHERE vacancy_id=v.id AND status='ACTIVE')`; `v.allocated_count = v.opening_filled_count + count(... status='ALLOCATED')`; `reserved + allocated <= capacity`; status per `chk_vacancies_open_full_consistency`.

### 10.4 Reservation state machine (see Section 16.2)

### 10.5 Seed data

None. No vacancies are seeded in production; test fixtures only (no business data invented).

## 11. Backend Implementation

### 11.1 Module layout `[PROPOSED]` (per Backend-Architecture §4)

```
backend/src/modules/vacancy/
  index.ts                       // exports VacancyService, VacancyQueryService, vacancyTransitionEffects
  constants/index.ts
  dto/                            // vacancy.dto.ts, reservation.dto.ts, discovery.dto.ts
  domain/capacity.ts              // pure functions
  models/vacancy.model.ts, vacancy-reservation.model.ts
  repositories/vacancy.repository.ts, vacancy-reservation.repository.ts
  services/vacancy-admin.service.ts
  services/vacancy-query.service.ts
  services/vacancy-discovery.service.ts
  services/vacancy-reservation.service.ts   // implements VacancyService
  effects/vacancy-effects.ts
  validations/*.ts
  controllers/*.ts
  routes/index.ts, vacancy.routes.ts
  types/vacancy.types.ts
```

### 11.2 `VacancyService` public contract (TypeScript)

```ts
type VacancyActor = { userId: string; role: Role };          // role per SPEC-002 enum
type Tx = { trx: Transaction };                               // MANDATORY; service never opens/commits

interface ReservationSnapshot { vacancyId: string; reservedCount: number; allocatedCount: number;
  availableCapacity: number; status: VacancyStatus }

interface VacancyService {
  reserve(i: { transferRequestId: string; vacancyId: string; employeeId: string; actor: VacancyActor }, o: Tx)
    : Promise<{ reservationId: string; replayed: boolean; vacancy: ReservationSnapshot }>;
  release(i: { transferRequestId: string; reasonCode: 'REJECTED'|'WITHDRAWN'|'CANCELLED'; reasonText?: string; actor: VacancyActor }, o: Tx)
    : Promise<{ released: boolean; reservationId?: string; vacancy?: ReservationSnapshot }>;       // released=false => no-op
  changeVacancy(i: { transferRequestId: string; newVacancyId: string; reason: string; actor: VacancyActor }, o: Tx)
    : Promise<{ oldReservationId: string; newReservationId: string; oldVacancy: ReservationSnapshot; newVacancy: ReservationSnapshot }>;
  finalizeAllocation(i: { transferRequestId: string; actor: VacancyActor }, o: Tx)
    : Promise<{ reservationId: string; replayed: boolean; vacancy: ReservationSnapshot }>;
  validateForResume(i: { transferRequestId: string; expectedVacancyId: string; expectedEmployeeId: string; expectsReservation?: boolean /* default true; false when blocked from PENDING_HR_REVIEW/INFO_REQUIRED with no reservation yet: checks 2,4,5 are skipped, checks 1 + vacancy-status rule still run */ }, o: Tx)
    : Promise<{ valid: boolean; failures: Array<{ code: ResumeFailureCode; message: string }> }>;
  manualRelease(i: { transferRequestId: string; reason: string; actor: VacancyActor }, o: Tx)
    : Promise<{ reservationId: string; vacancy: ReservationSnapshot }>;
  checkSelectable(vacancyId: string): Promise<{ selectable: boolean; reason?: 'NOT_FOUND'|'NOT_OPEN'|'NO_CAPACITY' }>; // advisory, no lock
}
type ResumeFailureCode = 'VACANCY_NOT_FOUND'|'RESERVATION_INVALID'|'CAPACITY_EXCEEDED'|'ASSIGNMENT_MISMATCH'|'CONFLICTING_ALLOCATION'|'VACANCY_CLOSED'|'VACANCY_ON_HOLD';
```

Error behaviour: business refusals throw typed `AppError` subclasses (Section 20); `validateForResume` returns failures instead of throwing so SPEC-010 can keep the request Blocked and report all issues at once.

### 11.3 Method algorithms

**reserve** (all steps inside the caller's transaction; lock order in Section 17.3):
1. Assert `trx` present (programming error otherwise).
2. `SELECT … FROM vacancies WHERE id=$vacancyId AND deleted_at IS NULL FOR UPDATE` → missing: `VACANCY_NOT_FOUND`.
3. Look up live reservation for the transfer. If present on the same vacancy: return `{replayed:true}` (no writes, no audit). If on another vacancy: `RESERVATION_ALREADY_EXISTS`. If ALLOCATED: `RESERVATION_ALREADY_ALLOCATED`.
4. If `status <> 'OPEN'` → `VACANCY_CAPACITY_UNAVAILABLE` with `details.reason='VACANCY_NOT_OPEN'`; if `capacity − reserved − allocated <= 0` → same code with `details.reason='NO_AVAILABLE_CAPACITY'`.
5. `INSERT … ON CONFLICT (transfer_request_id) WHERE status IN ('ACTIVE','ALLOCATED') DO NOTHING RETURNING id`; zero rows → re-read live reservation and treat as step 3.
6. `UPDATE vacancies SET reserved_count = reserved_count + 1, status = CASE WHEN status='OPEN' AND capacity - allocated_count - (reserved_count + 1) = 0 THEN 'FULL' ELSE status END, version = version + 1, updated_by = $actor, updated_at = now() WHERE id = $vacancyId`.
7. Audit `VACANCY_RESERVED` (+ `VACANCY_STATUS_AUTO_CHANGED` when OPEN→FULL), same transaction.
8. Return snapshot.

**release**: lock live reservation's vacancy; if no ACTIVE reservation return `{released:false}`; if ALLOCATED → `RESERVATION_ALREADY_ALLOCATED` (a completed transfer's allocation cannot be released automatically); UPDATE reservation to RELEASED (reason code, actor, role, text); `UPDATE vacancies SET reserved_count = reserved_count − 1, status = CASE WHEN status='FULL' THEN 'OPEN' ELSE status END …` (post-decrement available > 0 is guaranteed because capacity ≥ 1 and reserved decreased); audit `VACANCY_RESERVATION_RELEASED` (+ auto status event).

**changeVacancy**:
1. Read transfer's live ACTIVE reservation (none → `RESERVATION_NOT_FOUND`; the caller uses `reserve` when HR changes vacancy before any reservation exists).
2. Lock both vacancies `FOR UPDATE` in ascending `id` order (single statement `WHERE id IN ($old,$new) ORDER BY id FOR UPDATE`).
3. Validate (no writes yet): new ≠ old (`VACANCY_CHANGE_SAME_VACANCY`, 422), new exists/not deleted, `status='OPEN'` and `available>0` else `VACANCY_CAPACITY_UNAVAILABLE` (details.reason as above, `details.vacancyId=new`).
4. Open a **savepoint** (`sequelize.transaction({ transaction: trx })`), then: UPDATE old reservation → RELEASED (`VACANCY_CHANGED`, reason text = HR reason); decrement old vacancy `reserved_count` and apply FR-005.23; INSERT new reservation with `replaces_reservation_id`; increment new vacancy `reserved_count` and apply automatic Full. On any error roll back to the savepoint and rethrow, so even if the caller swallows the error the original reservation and counters are untouched `[BRD-028 step 6]`.
5. Audit `VACANCY_CHANGED` (old, new, changed by, ts, reason) plus auto-status events.

**finalizeAllocation**: lock vacancy; find live reservation; ALLOCATED → replay no-op; ACTIVE → UPDATE reservation `status='ALLOCATED', allocated_at, allocated_by`; `UPDATE vacancies SET reserved_count = reserved_count − 1, allocated_count = allocated_count + 1` (available unchanged, `chk_vacancies_commitment` still holds; status unchanged); audit `VACANCY_ALLOCATION_FINALIZED`; none → `RESERVATION_NOT_FOUND`.

**validateForResume**: lock vacancy `FOR SHARE`; evaluate all checks, collect failures:

| # | Check | Failure code | BRD |
|---|---|---|---|
| 1 | Vacancy exists and `deleted_at IS NULL` | VACANCY_NOT_FOUND | OQ-15(a) |
| 2 | A reservation exists for this transfer, `status='ACTIVE'`, `transfer_request_id` equals the transfer, `vacancy_id` equals expected | RESERVATION_INVALID | OQ-15(a) |
| 3 | `capacity >= count(ACTIVE) + count(ALLOCATED) + opening_filled` computed from the ledger (not only the counters) and counters equal ledger | CAPACITY_EXCEEDED | OQ-15(a) |
| 4 | `reservation.employee_id = expectedEmployeeId` and `reservation.vacancy_id = expectedVacancyId` (both read by SPEC-010 from the transfer's approved details) | ASSIGNMENT_MISMATCH | OQ-15(a) |
| 5 | No conflicting final allocation (definition TDD-005.09; default: no ALLOCATED row for this transfer, and no ALLOCATED row for the same employee created after this reservation's `reserved_at` on another transfer) | CONFLICTING_ALLOCATION | OQ-15(a) |
| 6 | `status <> 'CLOSED'` | VACANCY_CLOSED | OQ-15(b) |
| 7 | `status <> 'ON_HOLD'` | VACANCY_ON_HOLD | OQ-15(b) "stays Blocked until the vacancy is reopened…" |

FULL passes (reservation continues). The method writes nothing; SPEC-010 audits the outcome (`VACANCY_RESUME_VALIDATION_FAILED` is emitted here in a separate transaction on failure, FR-005.47).

**manualRelease** (REST-backed): `AuthorizationService.authorize` → role must be SUPER_ADMIN or HR; for HR `ScopeResolver` must confirm the transfer is within HR scope (TDD-005.15) else 403; read the transfer through `TransferReadPort.getForUpdate` (locks the transfer row so concurrent workflow transitions serialise); require live ACTIVE reservation (`RESERVATION_NOT_FOUND` / `RESERVATION_ALREADY_ALLOCATED`); validate reason; run the `release` core with `reasonCode='MANUAL'`; audit `VACANCY_RESERVATION_MANUALLY_RELEASED`. Effect on the transfer's workflow status: none by default (TDD-005.08).

### 11.4 Query layer

- List query (Super Admin): all non-deleted vacancies; filters as Section 12.2.
- HR scope filter (default, TDD-005.03): `v.location_id = ANY($hrLocationIds) OR EXISTS (SELECT 1 FROM transfer_requests t WHERE t.proposed_vacancy_id = v.id AND t.id IN (<transfers in HR scope per SPEC-008/002 ScopeResolver>))`. Implemented through `ScopeResolver` so the SQL is not duplicated.
- Discovery query: `WHERE v.status='OPEN' AND v.deleted_at IS NULL AND v.available_count > 0` (uses `ix_vacancies_open_discovery`).
- `getUtilisationSummary(scope)` returns `{ openVacancies, totalCapacity, reserved, allocated, available }` for SPEC-014.
- `listCapacitySnapshot(scopeFilter, filters)` returns per-vacancy `{ vacancyId, status, total, allocated, reserved, available }` rows (read-only, same HR scope filter, paginated) for the SPEC-014 vacancy utilisation report [RECONCILED] added to satisfy SPEC-014 cross-spec request (c).

### 11.5 Logging

Structured logger (SPEC-001) at `info` for reserve/release/change/finalize outcomes with `requestId`, `vacancyId`, `transferRequestId`, `actorId`, `role`, counter snapshot; `warn` for capacity-unavailable; `error` for unexpected DB errors. No secrets or credentials are in any vacancy payload.

## 12. API Requirements

Base path `/api/v1` `[PROPOSED]`. All responses use the SPEC-001 envelope. Common errors: 401 (no/invalid/expired auth), 403 (role/scope/action), 404 `VACANCY_NOT_FOUND`, 422 `VALIDATION_ERROR` (details per field), 500 `INTERNAL_ERROR`.

Vacancy DTO:
```json
{ "id": "uuid", "reference": "VAC-000123",
  "department": { "id": "uuid", "name": "..." }, "designation": { "id": "uuid", "name": "..." },
  "location": { "id": "uuid", "name": "..." },
  "capacity": 5, "openingFilledCount": 3, "allocatedCount": 3, "reservedCount": 1,
  "availableCapacity": 1, "status": "OPEN", "isAvailable": true,
  "statusRemark": null, "version": 4, "createdAt": "...", "updatedAt": "..." }
```

### 12.1 `POST /api/v1/vacancies` — create
- Purpose: create vacancy. Auth: JWT. Authz: SUPER_ADMIN only (HR/others 403).
- Request: `{ "departmentId": "uuid", "designationId": "uuid", "locationId": "uuid", "capacity": 5, "openingFilledCount": 3, "status": "OPEN" }` (`openingFilledCount` default 0; `status` default `OPEN`, allowed `OPEN|ON_HOLD|CLOSED`).
- Validation: ids are UUIDs of active master records; `capacity` int 1–100000; `openingFilledCount` int 0 ≤ capacity; unknown fields rejected. If `openingFilledCount = capacity` and status OPEN, stored as FULL (FR-005.21).
- Response 201: `{ success:true, data:{ vacancy } }`.
- Errors: 422 `VALIDATION_ERROR`; 422 `MASTER_DATA_INACTIVE` (details.field); 404 `MASTER_DATA_NOT_FOUND`.

### 12.2 `GET /api/v1/vacancies` — list
- Auth: SUPER_ADMIN (all); HR (scoped, TDD-005.03). Others 403.
- Query: `page, pageSize(≤100), sort(reference|capacity|availableCapacity|status|createdAt), order, q (reference prefix), status, departmentId, designationId, locationId, availableOnly(boolean: status OPEN AND available>0)`.
- Response 200: `{ success, data:[vacancy], meta:{page,pageSize,total,totalPages} }`.
- Errors: 422 on invalid filters.

### 12.3 `GET /api/v1/vacancies/{id}` — detail
- Auth: SUPER_ADMIN, HR (in scope; out-of-scope returns 403 without revealing data, resource existence is not leaked: 403 for out of scope, 404 only if non-existent for Super Admin).
- Response 200: `{ data:{ vacancy, capacityBreakdown:{capacity,filled,reserved,available} } }`.

### 12.4 `PATCH /api/v1/vacancies/{id}` — edit
- Auth: SUPER_ADMIN only.
- Request: any of `{ "capacity", "openingFilledCount", "departmentId", "designationId", "locationId", "version": 4, "remark" }`; `version` required (optimistic concurrency).
- Processing: transaction; lock row FOR UPDATE; compare `version`; apply rules FR-005.04–FR-005.08, FR-005.23; recalc status via domain function; audit `VACANCY_UPDATED` / `VACANCY_CAPACITY_CHANGED`.
- Response 200: updated vacancy.
- Errors: 409 `VACANCY_VERSION_CONFLICT`; 409 `VACANCY_CAPACITY_BELOW_COMMITMENT` (`details:{reserved,allocated,requestedCapacity}`); 409 `VACANCY_ORG_FIELDS_LOCKED` (live reservations exist); 422 `MASTER_DATA_INACTIVE`; 422 `VALIDATION_ERROR`; 404.

### 12.5 `POST /api/v1/vacancies/{id}/status` — change status
- Auth: SUPER_ADMIN only.
- Request: `{ "status": "ON_HOLD", "remark": "optional text ≤500", "version": 4 }`.
- Rules: FR-005.22–FR-005.25. Same status requested: 200 no-op (no audit). Resulting stored status may differ from requested only for OPEN→FULL when available = 0 (response `data.requestedStatus`, `data.status`).
- Response 200: vacancy.
- Errors: 409 `VACANCY_STATUS_NOT_ALLOWED` (FULL while available>0); 409 `VACANCY_VERSION_CONFLICT`; 422; 404.
- Effect: reservations untouched (FR-005.27).

### 12.6 `GET /api/v1/vacancies/{id}/reservations` — ledger
- Auth: SUPER_ADMIN; HR in scope.
- Query: `status` (ACTIVE|RELEASED|ALLOCATED), pagination.
- Response 200: `data:[{ id, transferRequestId, transferReference, employeeId, status, reservedAt, reservedBy, releasedAt, releasedBy, releaseReasonCode, releaseReasonText, allocatedAt }]`. Release reason text is visible to SUPER_ADMIN and HR (in scope) only.

### 12.7 `GET /api/v1/vacancy-discovery` — employee discovery
- Auth: JWT; authz EMPLOYEE only (admin roles use list). 
- Query: `page, pageSize, q, departmentId, designationId, locationId, sort(reference|department|designation|location), order`.
- Response 200: `data:[{ id, reference, department, designation, location, isAvailable: true }]` [RECONCILED R-6/R-11: was `availableCapacity`; aligned with SPEC-006 FR-006.07 / TDD-006.04 - no capacity numbers to Employees by default; TDD-005.02 and TDD-006.04 are ONE Gate 1 decision]. Implemented by `VacancyDiscoveryService.listAvailableForEmployee(filters)` (the method SPEC-006 FR-006.04 calls; SPEC-006 `/my/transfer-vacancies` is a thin facade over it, `GET /vacancy-discovery` stays the underlying route). Excludes reserved/allocated counts, status internals, and anything not OPEN with available > 0 (default visibility, TDD-005.02).
- Errors: 403 for non-Employee roles.

### 12.8 `GET /api/v1/transfers/{transferId}/vacancy-reservation` — current reservation
- Auth: SUPER_ADMIN; HR in scope of the transfer. Others 403.
- Response 200: `data:{ reservation | null, vacancy:{…summary}, history:[…all reservation rows for the transfer…] }`.
- Note: transfer-level read access for Reporting/Receiving Manager is not granted here.

### 12.9 `POST /api/v1/transfers/{transferId}/vacancy-reservation/release` — manual release
- Auth: SUPER_ADMIN or HR in scope (`[BRD-OQ-15(c)]`).
- Request: `{ "reason": "text 1–1000 chars, not blank" }`.
- Processing: Section 11.3 `manualRelease` (transaction owned by the controller via `withTransaction`).
- Response 200: `{ data:{ reservationId, status:'RELEASED', vacancy:{ reservedCount, availableCapacity, status } } }`.
- Errors: 403 (role or out of HR scope); 404 `TRANSFER_NOT_FOUND` (only after authorisation succeeds in role; out-of-scope returns 403 to avoid leaking); 409 `RESERVATION_NOT_FOUND`; 409 `RESERVATION_ALREADY_ALLOCATED`; 422 `VALIDATION_ERROR` (reason missing/blank); 503 `VACANCY_LOCK_TIMEOUT`.

### 12.10 Internal-only operations (no REST)
`reserve`, `release`, `changeVacancy`, `finalizeAllocation`, `validateForResume` are invoked inside workflow transitions of SPEC-007/008/009/010 within the engine transaction. Their business-error responses surface through the transition endpoints of those specs (e.g. HR approve → 409 `VACANCY_CAPACITY_UNAVAILABLE`):

```json
{ "success": false, "error": { "code": "VACANCY_CAPACITY_UNAVAILABLE",
  "message": "The selected vacancy no longer has available capacity.",
  "details": [{ "vacancyId": "uuid", "reason": "NO_AVAILABLE_CAPACITY" }], "requestId": "…" } }
```
(message wording `[PROPOSED]`; HTTP 409 and the capacity-unavailable semantic are `[BRD-028]`.)

## 13. Frontend Implementation

Paths `[PROPOSED]` (Next.js App Router; shell, layout, tables/forms primitives from SPEC-001/003):

| Route | Role | Content |
|---|---|---|
| `frontend/src/app/admin/vacancies/page.tsx` | SUPER_ADMIN | List (reference, Dept/BU, Designation, Location, Capacity, Filled, Reserved, Available, Status badge), filters (status, department, designation, location, "Available only"), search, sort, pagination, "Create vacancy" |
| `frontend/src/app/admin/vacancies/new/page.tsx` | SUPER_ADMIN | Create form |
| `frontend/src/app/admin/vacancies/[id]/page.tsx` | SUPER_ADMIN | Detail, capacity breakdown, reservation ledger tab, Change status |
| `frontend/src/app/admin/vacancies/[id]/edit/page.tsx` | SUPER_ADMIN | Edit form |
| `frontend/src/app/hr/vacancies/page.tsx`, `[id]/page.tsx` | HR | Read-only list/detail within scope |
| `frontend/src/app/employee/vacancies/page.tsx` | EMPLOYEE | Discovery list |

Components under `frontend/src/components/vacancy/`: `VacancyTable`, `VacancyFilters`, `VacancyForm`, `VacancyStatusBadge`, `VacancyStatusDialog` (confirmation, optional remark), `CapacityBreakdown`, `ReservationLedgerTable`, `VacancyReservationPanel` (consumed by transfer detail in SPEC-008/010), `ManualReleaseDialog` (mandatory reason, confirm), `VacancyPicker` (consumed by SPEC-006).

Behaviour:
- Status badges: OPEN, FULL, ON_HOLD, CLOSED with text labels (not colour alone) `[NFR-008]`.
- Form: required indicators, inline validation mirroring Section 14, org fields disabled with helper text when live reservations exist; capacity field shows minimum allowed (`reserved + allocated`) from detail response.
- Optimistic concurrency: on 409 `VACANCY_VERSION_CONFLICT` show "This vacancy was changed by someone else" and reload.
- Error mapping: `VACANCY_CAPACITY_UNAVAILABLE`, `VACANCY_CAPACITY_BELOW_COMMITMENT`, `VACANCY_STATUS_NOT_ALLOWED`, `VACANCY_ORG_FIELDS_LOCKED` mapped to user messages; unknown codes show a generic message with `requestId`.
- States: loading skeleton, empty ("No vacancies match"), no-access (403), error with retry `[BRD-002]`.
- Responsive desktop/tablet; keyboard operable dialogs, focus trap, ARIA labels `[NFR-008]`.
- Role-aware navigation shows "Vacancies" to SUPER_ADMIN and HR; EMPLOYEE sees "Browse Vacancies". UI hiding is UX only; API enforces `[BRD-026]`.
- Manual release dialog only rendered for SUPER_ADMIN/HR; reason field required, max 1000, submit disabled until non-blank.

## 14. Validation Rules

| Field | Rule |
|---|---|
| departmentId, designationId, locationId | UUID; must exist and be active in master data; no free text |
| capacity | integer, 1 ≤ n ≤ 100000 (TDD-005.04); on edit also `>= reserved + allocated` |
| openingFilledCount | integer, 0 ≤ n ≤ capacity; on edit: `new opening >= 0` and resulting `allocated_count >= new opening` and `reserved + allocated <= capacity` |
| status | one of OPEN, ON_HOLD, CLOSED, FULL (FULL only if available = 0) |
| remark | string ≤ 500, trimmed, optional (mandatory-ness TDD-005.06) |
| version | integer ≥ 1, required on PATCH and status change |
| reason (manual release, changeVacancy) | trimmed length 1–1000; not whitespace-only |
| list `pageSize` | 1–100 (default 20) |
| list `sort/order` | whitelisted values only; `q` max 50 chars; `%`/`_` escaped for LIKE |
| path ids | UUID; malformed → 422 |
| Unknown body fields | rejected (Joi `stripUnknown:false`, `allowUnknown:false`) |
| Sanitisation | strings trimmed, control characters rejected, output encoded by frontend (no HTML rendering of remarks/reasons) |

## 15. Authorization & Security Rules

Check order `[BRD-026]`: Authenticated user → Role → Organisation scope → Resource → Action.

| Endpoint | SUPER_ADMIN | HR | EMPLOYEE | REPORTING_MANAGER | RECEIVING_MANAGER | IT |
|---|---|---|---|---|---|---|
| POST /vacancies | Allow | 403 | 403 | 403 | 403 | 403 |
| GET /vacancies, /vacancies/{id}, /{id}/reservations | Allow all | Allow in scope | 403 | 403 | 403 | 403 |
| PATCH /vacancies/{id}, POST /{id}/status | Allow | 403 | 403 | 403 | 403 | 403 |
| GET /vacancy-discovery | 403 | 403 | Allow | 403 | 403 | 403 |
| GET /transfers/{id}/vacancy-reservation | Allow | Allow in scope | 403 | 403 | 403 | 403 |
| POST /transfers/{id}/vacancy-reservation/release | Allow | Allow in scope | 403 | 403 | 403 | 403 |

- Out-of-scope HR requests are rejected 403 without exposing vacancy or transfer data; the denial is audited as a security event by SPEC-002/013 `[BRD-026, BRD-037]`.
- Internal `VacancyService` methods require the transaction handle and an `actor`; they must only be reachable from the registered workflow handlers (module export boundary; controllers of other modules cannot import repositories directly).
- Frontend hiding is not relied on (direct API calls with Postman return 403) `[BRD-026]`.
- Reservation ledger carries employee IDs; endpoints returning them are limited to Super Admin and in-scope HR (NFR-007 privacy). Discovery never exposes reservation or employee data.
- SQL uses parameterised queries only; no dynamic SQL from user input except whitelisted sort columns.
- Audit payloads never contain credentials or tokens `[BRD-037]`.

## 16. Workflow / State Transition Rules

### 16.1 Vacancy status machine

| From | To | Who / trigger | Condition |
|---|---|---|---|
| OPEN | FULL | System (automatic) | available becomes 0 after reserve / capacity decrease / opening-filled increase |
| FULL | OPEN | System (automatic) | available becomes > 0 after release or capacity increase |
| OPEN | ON_HOLD | Super Admin | none; reservations retained |
| OPEN | CLOSED | Super Admin | none; reservations retained |
| FULL | ON_HOLD / CLOSED | Super Admin | reservations retained |
| ON_HOLD | OPEN | Super Admin | stored OPEN if available>0 else FULL |
| ON_HOLD | CLOSED | Super Admin | — |
| CLOSED | OPEN | Super Admin ("reopen") | stored OPEN if available>0 else FULL |
| CLOSED | ON_HOLD | Super Admin | — |
| any | FULL (manual) | Super Admin | refused unless available = 0 |

ON_HOLD and CLOSED are never changed by the system. `[BRD-017, BRD-028, BRD-OQ-15]` (system transitions `[DERIVED]`).

### 16.2 Reservation state machine

| From | Event | To | Notes |
|---|---|---|---|
| (none) | `reserve` | ACTIVE | HR Validate & Approve |
| ACTIVE | `release` (Rejected / Withdrawn / Cancelled) | RELEASED | automatic |
| ACTIVE | `manualRelease` | RELEASED | HR in scope / Super Admin, reason |
| ACTIVE | `changeVacancy` | RELEASED (code VACANCY_CHANGED) + new ACTIVE row | atomic |
| ACTIVE | `finalizeAllocation` (Completed) | ALLOCATED | terminal |
| RELEASED, ALLOCATED | any | — | immutable |

### 16.3 Transfer-transition → vacancy effect registry (source: BRD-027 matrix "Vacancy / Downstream Impact", BRD-028 table)

Exported as `vacancyTransitionEffects`; SPEC-007 owns the transition registry and calls these effects inside its transaction, in the same transaction as history, audit and outbox rows. [RECONCILED] Wiring (R-6): SPEC-007 exposes `HandlerRegistry.registerHandler`, `registerOnEnter(status, hook)` and `registerOnTerminate(hook)`; `release(*)` effects are registered as `onTerminate` hooks (REJECTED/WITHDRAWN/CANCELLED); `reserve`/`changeVacancy` are called by SPEC-008 handlers, `validateForResume` by the SPEC-010 RESUME handler, `finalizeAllocation` by the SPEC-009 IT_FINAL_APPROVE handler - each inside the engine transaction. `release` is idempotent (no-op when no live reservation); `reserve` is idempotent per transfer (replayed:true).

| Transition (SPEC owner) | Vacancy effect | Engine call |
|---|---|---|
| Submit (006/007) | none | — |
| Reporting Manager Approve / Receiving Manager Approve (007) | none | — |
| Request Clarification / Respond Clarification (007/008) | existing reservation retained (none exists before HR approval) | — |
| HR Validate & Approve (008) | validate + reserve | `reserve` |
| HR Request Clarification at Pending HR Review (008) | retained if already created | — |
| HR change vacancy (008) | old released, new reserved atomically | `changeVacancy` |
| HR change of Dept/BU/Designation/Location/Reporting Manager (008, BRD-024) | vacancy revalidated; old/new reservation adjusted where applicable | `changeVacancy` if vacancy changed, else none |
| Receiving Manager Re-Approval Approve (008) | existing reservation retained | — |
| Reject by any approver / HR / Re-Approval Reject (007/008) | release | `release(REJECTED)` |
| Withdraw (010) | release if any exists | `release(WITHDRAWN)` |
| Cancel by Super Admin / HR, including a Blocked request (010) | release | `release(CANCELLED)` |
| Block (010) | retained | — |
| Resume (010) | revalidate; failure keeps Blocked | `validateForResume` |
| Complete Payroll / IT tasks / IT Final Approve → Completed (009) | reservation becomes final allocation | `finalizeAllocation` |
| Reassign (010) | none | — |
| Manual release (005) | release without workflow status change | `manualRelease` |

Invalid transitions never reach these effects (`INVALID_WORKFLOW_TRANSITION`, SPEC-007).

## 17. Transaction & Concurrency Rules

### 17.1 Principles `[BRD-028, BRD-038]`
- Defence in depth: (1) pessimistic row lock `SELECT … FOR UPDATE` on the vacancy row serialises every capacity-changing operation; (2) DB CHECK `chk_vacancies_commitment` and `chk_vacancies_counts_nonneg` make over-allocation/negative counters impossible even if application logic is wrong; (3) partial unique index `uq_vres_one_live_per_transfer` makes reservation idempotent per transfer; (4) the caller's single transaction makes vacancy change + workflow transition + history + audit + outbox atomic.
- Isolation level: **READ COMMITTED** (PostgreSQL default). Rationale: after `SELECT … FOR UPDATE` blocks, PostgreSQL re-reads the latest committed row version once the lock is granted, so the capacity check always uses current counters; REPEATABLE READ/SERIALIZABLE are not required and would add serialization failures (SQLSTATE 40001). If SPEC-001/007 mandate a higher isolation level for the engine, the callers must retry on 40001/40P01 (see 17.5) — `[PROPOSED]`.
- Engine calls never commit or open an independent top-level transaction (FR-005.45).

### 17.2 Reserve locking pattern (SQL, parameters `$n`)
```sql
-- inside caller's transaction (READ COMMITTED)
SET LOCAL lock_timeout = '<VACANCY_LOCK_TIMEOUT_MS>ms';           -- TDD-005.10

SELECT id, status, capacity, reserved_count, allocated_count, version
  FROM vacancies WHERE id = $1 AND deleted_at IS NULL FOR UPDATE;   -- blocks competing reservers

SELECT id, vacancy_id, status FROM vacancy_reservations
 WHERE transfer_request_id = $2 AND status IN ('ACTIVE','ALLOCATED');   -- idempotency

-- application check: status = 'OPEN' AND capacity - reserved_count - allocated_count > 0

INSERT INTO vacancy_reservations (id, vacancy_id, transfer_request_id, employee_id, status, reserved_by, reserved_by_role)
VALUES (gen_random_uuid(), $1, $2, $3, 'ACTIVE', $4, $5)
ON CONFLICT (transfer_request_id) WHERE status IN ('ACTIVE','ALLOCATED') DO NOTHING
RETURNING id;

UPDATE vacancies
   SET reserved_count = reserved_count + 1,
       status = CASE WHEN status = 'OPEN' AND capacity - allocated_count - (reserved_count + 1) = 0
                     THEN 'FULL' ELSE status END,
       version = version + 1, updated_by = $4, updated_at = now()
 WHERE id = $1;
```
Sequelize equivalent: `Vacancy.findOne({ where: { id, deletedAt: null }, transaction: trx, lock: trx.LOCK.UPDATE })` followed by the raw/`increment` statements above in the same `transaction: trx`. All writes use `transaction: trx`.

DB error mapping: `23514` on `chk_vacancies_commitment` → `VACANCY_CAPACITY_UNAVAILABLE`; `23514` on `chk_vacancies_counts_nonneg` → logged as defect, 500; `55P03` (lock timeout) → 503 `VACANCY_LOCK_TIMEOUT` with `Retry-After`.

### 17.3 Lock acquisition order (deadlock avoidance)
1. `transfer_requests` row (locked by `WorkflowEngine.transition` / `TransferReadPort.getForUpdate` first).
2. Payroll/IT task rows (`payroll_activities`, `it_tasks`) and assignment rows when the caller holds them (SPEC-007/009/010 take them before calling `VacancyService`).
3. `vacancies` rows in **ascending `id`** (a single `ORDER BY id FOR UPDATE` statement for two vacancies).
4. `vacancy_reservations` rows (reached through the transfer, no extra contention).

[RECONCILED] Decision R-5 canonical lock order for every spec: (1) `transfer_requests` row FOR UPDATE; (2) `workflow_configuration` FOR SHARE (read); (3) `transfer_task_assignments` / `transfer_clarifications`; (4) `payroll_activities` / `it_tasks` (and other task rows); (5) `vacancies` rows in ascending id; (6) `vacancy_reservations`; (7) append-only history/audit/outbox inserts (no contention). Never reversed.

All paths (reserve, release, changeVacancy, finalize, validateForResume with `FOR SHARE`, admin PATCH/status, manualRelease) follow this order. Admin PATCH/status lock only the vacancy row.

### 17.4 Scenario: last slot, two HR approvals
Capacity 5, Allocated 4, Reserved 0 (Available 1). HR-A approves transfer T1 and HR-B approves T2, both targeting vacancy V at the same instant.
1. Both enter the engine transaction; each locks its own transfer row (different rows, no conflict).
2. T-A obtains `FOR UPDATE` on V; T-B waits (up to the lock timeout).
3. T-A reserves (`reserved_count=1`, available 0 → status FULL) and commits (transfer T1 → HR Processing).
4. T-B's lock is granted; under READ COMMITTED it sees the committed row (status FULL, available 0) and raises `VACANCY_CAPACITY_UNAVAILABLE` (409). T2's workflow transition rolls back: T2 remains Pending HR Review, no history/notification rows, no reservation.
5. Failure audit `VACANCY_RESERVATION_FAILED` is written in a separate transaction (FR-005.47).
Exactly one succeeds `[BRD-028, BRD-039 V2]`. If application logic were bypassed, the CHECK constraint is the final guard (`23514` → same 409).

### 17.5 Retries, timeouts, idempotency
- `withTransaction` retries the **whole** engine transaction (max `VACANCY_TX_RETRY_MAX`, default 3 `[PROPOSED]`, TDD-005.10) on SQLSTATE `40001` and `40P01` only; never retries business errors.
- Lock timeout default `5000 ms` `[PROPOSED]` — final numeric values come from performance planning (BRD-038 "to be confirmed"); configurable via env `VACANCY_LOCK_TIMEOUT_MS`.
- Idempotent replays: `reserve` same transfer+vacancy, `release` with no ACTIVE row, `finalizeAllocation` on ALLOCATED return success without counter change and without a second audit event.
- A client retry of the HR approve endpoint after a timeout therefore cannot create a second reservation (partial unique index).

### 17.6 Admin edit vs reservation race
PATCH/status lock the vacancy row `FOR UPDATE`, re-read counters, then validate capacity/status against the **current** committed values; the `version` column additionally rejects stale form submissions (`VACANCY_VERSION_CONFLICT`). A capacity reduction racing with a reserve is serialised: either the reserve wins and the reduction below committed is refused, or the reduction wins and the reserve sees the lower available.

### 17.7 Atomic change-of-vacancy
Savepoint inside the caller's transaction (Section 11.3). The validation phase precedes any write so the failure path performs no writes; the savepoint additionally protects against mid-way errors (e.g. new-vacancy CHECK failure). Order of writes: release old row first, then insert new row, so the partial unique index never sees two live rows for the transfer.

### 17.8 Notification independence
Vacancy operations never call external notification delivery; notification rows are written to the outbox (SPEC-001/012) by workflow handlers in the same transaction and delivered asynchronously `[BRD-036]`.

## 18. Audit Requirements

Written with `AuditService.record(event,{trx})` in the same transaction as the change (append-only, no credentials) `[BRD-037, BRD-022]`. Each event captures actor, role, action code, entity (vacancy and, where applicable, transfer request/employee), timestamp, previous/new values, previous/new status, remarks/reason.

| Event code `[PROPOSED]` | Trigger | Fields captured | BRD |
|---|---|---|---|
| VACANCY_CREATED | Create | vacancy id/reference, dept, designation, location, capacity, opening filled, status | BRD-022 |
| VACANCY_UPDATED | PATCH changing org fields/opening filled | changed fields previous/new, actor, role | BRD-022 |
| VACANCY_CAPACITY_CHANGED | Capacity edit | previous/new capacity, reserved, allocated, previous/new available, remark | BRD-022, BRD-028 |
| VACANCY_STATUS_CHANGED | Manual status change | previous/new status, remark, actor, role | BRD-022, BRD-017 |
| VACANCY_STATUS_AUTO_CHANGED | Automatic OPEN↔FULL | previous/new status, trigger operation (reserve/release/capacity edit/finalize), counters | BRD-017 |
| VACANCY_RESERVED | reserve success (not replay) | vacancy, transfer request ID, employee, capacity reserved (1), reserved by, role, counters after | BRD-028 |
| VACANCY_RESERVATION_FAILED | capacity unavailable / not open | vacancy, transfer request ID, reason (NOT_OPEN, NO_AVAILABLE_CAPACITY), actor, role, status/counters | BRD-028, BRD-039 |
| VACANCY_RESERVATION_RELEASED | automatic release | vacancy, transfer request ID, employee, capacity released (1), reason code (REJECTED/WITHDRAWN/CANCELLED), released by, role, date/time | BRD-028 |
| VACANCY_RESERVATION_MANUALLY_RELEASED | manualRelease | vacancy, transfer request ID, employee, capacity released, released by, role, **reason**, date/time | BRD-OQ-15(c) |
| VACANCY_CHANGED | changeVacancy | old vacancy, new vacancy, transfer request ID, employee, changed by, role, reason, date/time | BRD-028 step 7 |
| VACANCY_CHANGE_FAILED | changeVacancy refused | old, attempted new, reason code, actor | BRD-028 step 6 |
| VACANCY_ALLOCATION_FINALIZED | finalizeAllocation | vacancy, transfer request ID, employee, counters after, actor | BRD-028 |
| VACANCY_RESUME_VALIDATION_FAILED | validateForResume failure | vacancy, transfer request ID, failure codes | BRD-OQ-15(a) |
| VACANCY_ACCESS_DENIED | out-of-scope/role-denied vacancy API call (emitted via SPEC-002 denial hook) | actor, role, resource, action, reason | BRD-026, BRD-037 |

Replays emit no duplicate events. SPEC-013 verifies visibility (Super Admin all; others in scope) and export.

## 19. Notification Requirements

| Event | Recipient | Channel | Trigger task | BRD |
|---|---|---|---|---|
| (none mandated by BRD-036 for vacancy administration, reservation or release) | — | — | — | BRD-036 |
| Rejected / Withdrawn / Cancelled / Task blocked / Completed notifications that accompany the same transitions | Per BRD-036 | Email + In-app | Owned by SPEC-007/009/010/012 | BRD-036 |
| Manual release / vacancy status change to a stakeholder | `[TDD-REQUIRED]` TDD-005.13 — default: none | — | — | `[BRD-036]` silent |

Vacancy operations only enqueue nothing by default; failure of any notification never rolls back a reservation change `[BRD-036]`.

## 20. Error & Edge Cases

### 20.1 Error code table `[PROPOSED]` (except where noted)

| HTTP | Code | When |
|---|---|---|
| 401 | (auth framework) | missing/invalid/expired token `[BRD-026]` |
| 403 | FORBIDDEN | role/scope/action not permitted `[BRD-026]` |
| 404 | VACANCY_NOT_FOUND | unknown/deleted vacancy |
| 404 | MASTER_DATA_NOT_FOUND | unknown department/designation/location id |
| 409 | VACANCY_CAPACITY_UNAVAILABLE | reserve/change target not OPEN or no available capacity; code `[PROPOSED]`, response `[BRD-028]` |
| 409 | VACANCY_CAPACITY_BELOW_COMMITMENT | capacity < reserved + allocated |
| 409 | VACANCY_STATUS_NOT_ALLOWED | manual FULL while available > 0 |
| 409 | VACANCY_ORG_FIELDS_LOCKED | org-field edit with live reservations |
| 409 | VACANCY_VERSION_CONFLICT | stale `version` |
| 409 | RESERVATION_NOT_FOUND | finalize/manualRelease/changeVacancy without live reservation |
| 409 | RESERVATION_ALREADY_EXISTS | reserve for another vacancy while live reservation exists |
| 409 | RESERVATION_ALREADY_ALLOCATED | release attempt on ALLOCATED |
| 409 | RESUME_REVALIDATION_FAILED | [RECONCILED] code name aligned to SPEC-010; owned by SPEC-010, carries `failures[]` from `validateForResume` |
| 422 | VALIDATION_ERROR | schema/field violations incl. blank reason |
| 422 | MASTER_DATA_INACTIVE | inactive department/designation/location |
| 422 | VACANCY_CHANGE_SAME_VACANCY | changeVacancy target equals current |
| 503 | VACANCY_LOCK_TIMEOUT | lock wait exceeded |
| 503 | TRANSIENT_DB_CONFLICT | 40001/40P01 after retries |
| 500 | INTERNAL_ERROR | unexpected (CHECK `counts_nonneg` violation is a defect) |

### 20.2 Edge cases

| # | Case | Behaviour |
|---|---|---|
| E1 | Capacity 5, filled 3, reserved 1 → available 1; reserve succeeds → available 0, status FULL | per FR-005.20/21 |
| E2 | Reservation released from a FULL vacancy | status returns to OPEN automatically |
| E3 | Vacancy set ON_HOLD while an ACTIVE reservation exists and transfer is Blocked | reservation retained, transfer stays Blocked on resume attempt (VACANCY_ON_HOLD) until reopened or cancelled/released |
| E4 | Vacancy CLOSED while transfer Blocked | resume fails (VACANCY_CLOSED); HR/Super Admin reopen, `changeVacancy`, or cancel (release) |
| E5 | Vacancy FULL while transfer Blocked | resume succeeds on existing reservation |
| E6 | Vacancy CLOSED/ON_HOLD/FULL while a non-blocked transfer is in HR Processing/Payroll/IT | continues; completion still finalises allocation (FR-005.42) |
| E7 | Capacity reduced below committed | refused (FR-005.05) |
| E8 | Capacity increased on FULL vacancy | status returns to OPEN |
| E9 | Employee's draft references a vacancy that later becomes Full | submission re-check refuses (SPEC-006 via `checkSelectable`); HR approve refuses via locked check |
| E10 | HR approves; reservation succeeds but later workflow step in same transaction fails | whole transaction rolls back including the reservation |
| E11 | HR approval request replayed after network timeout | idempotent replay, no double reservation |
| E12 | `changeVacancy` target FULL/ON_HOLD/CLOSED or same as current | refused; original unchanged |
| E13 | `changeVacancy` where old and new are locked by concurrent changes A→B and B→A | ordered locking avoids deadlock; if 40P01 still occurs, whole transaction retried |
| E14 | `manualRelease` on an already released/never reserved transfer | 409 `RESERVATION_NOT_FOUND` |
| E15 | `manualRelease` then workflow continues without a reservation | completion refused (`RESERVATION_NOT_FOUND` at finalize) until a reservation is re-created (TDD-005.08) |
| E16 | Transfer rejected after Completed attempt etc. | final-state protection in SPEC-007/010; engine never called |
| E17 | Master-data location deactivated after vacancy creation | existing vacancy remains; discovery still lists it unless TDD-005.02 decides otherwise (default: unchanged) |
| E18 | Opening filled count edited upward to equal capacity with live reservation | refused: commitment would exceed capacity (CHECK) |
| E19 | Employee calls an admin endpoint directly | 403 |
| E20 | HR requests vacancy outside scope | 403, no data |
| E21 | Counter drift detected by reconciliation script | reported only; no automatic correction (manual defect handling) |
| E22 | Reserve called without transaction handle | programming error thrown in non-production and rejected in production |

## 21. Acceptance Criteria

| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-005.AC01 | Given Super Admin, When creating a vacancy with active Dept/BU, Designation, Location, capacity 5, opening filled 3, Then it is stored with unique reference, Allocated/Filled 3, Reserved 0, Available 2, status OPEN | BRD-010, BRD-017 |
| SPEC-005.AC02 | Given a vacancy of capacity 5 with filled 3 and 1 active reservation, When viewed, Then Available = 5 − (3 + 1) = 1 | BRD-028 |
| SPEC-005.AC03 | Given Super Admin edits capacity from 5 to 8, When saved, Then Available increases by 3, the change is audited with previous/new capacity | BRD-010, BRD-037 |
| SPEC-005.AC04 | Given a FULL vacancy, When Super Admin increases capacity so available > 0, Then status becomes OPEN automatically | BRD-017 (derived) |
| SPEC-005.AC05 | Given Super Admin sets status ON_HOLD or CLOSED with an ACTIVE reservation, When saved, Then the reservation stays ACTIVE and the transfer's workflow status is unchanged | BRD-028 OQ-15(b) |
| SPEC-005.AC06 | Given vacancy list, When filtering by status, department, designation, location, availableOnly, Then results match and "Available" equals OPEN with available > 0 | BRD-002, BRD-OQ-15(d) |
| SPEC-005.AC07 | Given an Employee, When calling vacancy discovery, Then only OPEN vacancies with available > 0 are returned with minimal fields | BRD-011, BRD-029 |
| SPEC-005.AC08 | Given vacancies FULL/ON_HOLD/CLOSED, When Employee lists, Then none appear | BRD-029 rule 5 |
| SPEC-005.AC09 | Given available = 1 and one HR approval, When `reserve` runs, Then reservation ACTIVE, reserved +1, available 0, status FULL | BRD-017, BRD-028 |
| SPEC-005.AC10 | Given a transfer at submission, Reporting Manager approval or Receiving Manager approval, When these transitions occur, Then no reservation row exists and counters unchanged | BRD-028, BRD-OQ-05 |
| SPEC-005.AC11 | Given a transfer already reserved on V, When `reserve` is replayed for the same transfer and V, Then no new row, counters unchanged, no duplicate audit event | NFR-006, BRD-038 |
| SPEC-005.AC12 | Given an ACTIVE reservation, When the transfer is Rejected, Then reservation is RELEASED (code REJECTED), reserved −1, available recalculated, audited | BRD-028, BRD-033, BRD-039 V4 |
| SPEC-005.AC13 | Given an ACTIVE reservation, When the transfer is Withdrawn, Then it is RELEASED (WITHDRAWN) and capacity is available to another eligible transfer | BRD-028, BRD-039 V4 |
| SPEC-005.AC14 | Given an ACTIVE reservation, When the transfer is Cancelled (including Blocked request cancelled), Then it is RELEASED (CANCELLED) and audited | BRD-028, BRD-027 |
| SPEC-005.AC15 | Given a Blocked transfer, When time passes or Block is applied, Then the reservation stays ACTIVE | BRD-028 |
| SPEC-005.AC16 | Given a reserved transfer on V1, When HR changes to Open V2 with capacity, Then V1 reservation is RELEASED (VACANCY_CHANGED), V2 reservation ACTIVE, both counters correct, audit holds old/new/changed by/date/reason | BRD-028 |
| SPEC-005.AC17 | Given available = 1 and two HR users approving two different transfers simultaneously, Then exactly one gets the reservation and the other receives HTTP 409 `VACANCY_CAPACITY_UNAVAILABLE` and its transfer stays Pending HR Review | BRD-028, BRD-017 |
| SPEC-005.AC18 | Given `changeVacancy` where the new reserve fails (new vacancy FULL), Then HTTP 409, original reservation ACTIVE on V1, V1 and V2 counters unchanged | BRD-028, BRD-038 |
| SPEC-005.AC19 | Given IT Final Approval completes the transfer, When `finalizeAllocation` runs, Then reservation becomes ALLOCATED, reserved −1, allocated +1, available unchanged | BRD-028 |
| SPEC-005.AC20 | Given a Blocked transfer with valid reservation on an OPEN or FULL vacancy, When `validateForResume` runs, Then `valid=true` | BRD-OQ-15(a),(b) |
| SPEC-005.AC21 | Given a Blocked transfer whose vacancy is CLOSED or ON_HOLD, When validated, Then failure code VACANCY_CLOSED / VACANCY_ON_HOLD is returned and the reservation is untouched | BRD-OQ-15(b) |
| SPEC-005.AC22 | Given a deleted vacancy, mismatched reservation, mismatched employee/vacancy, capacity exceeded or conflicting allocation, When validated, Then each is reported as its own failure code | BRD-OQ-15(a) |
| SPEC-005.AC23 | Given Super Admin or in-scope HR, When manually releasing an ACTIVE reservation with a reason, Then it is RELEASED (MANUAL), audited with vacancy, transfer, employee, capacity, released by, role, reason, date/time | BRD-OQ-15(c) |
| SPEC-005.AC24 | Given an ALLOCATED reservation, Then ledger row is immutable | DERIVED |
| SPEC-005.AC25 | Given Super Admin changes status manually to FULL while available > 0, Then 409 `VACANCY_STATUS_NOT_ALLOWED` | BRD-OQ-15(d) (derived) |
| SPEC-005.AC26 | Given stale `version` on PATCH, Then 409 `VACANCY_VERSION_CONFLICT` and no change | BRD-038 (derived) |
| SPEC-005.AC27 | Given HR in scope, When opening the vacancy list/detail, Then read-only data within scope is shown and no edit controls rendered | BRD-013, BRD-026 |
| SPEC-005.AC28 | Given counters after any sequence of operations, When the reconciliation script runs, Then counters equal ledger-derived values | BRD-038 |
| SPEC-005.AC29 | Given the HR change of vacancy also triggers re-approval, When Receiving Manager approves, Then the new reservation is retained; when Receiving Manager rejects, Then it is released | BRD-027, BRD-028 |
| SPEC-005.AC30 | Given the frontend of Super Admin vacancy pages, Then loading, empty, no-access and error states render and dialogs are keyboard accessible | BRD-002, NFR-008 |

## 22. Negative Acceptance Criteria

| ID | Given / When / Then | BRD-039 / BRD |
|---|---|---|
| SPEC-005.NAC01 | Given a FULL vacancy, When `reserve` is called, Then 409 `VACANCY_CAPACITY_UNAVAILABLE`, no reservation row, counters unchanged | V1 |
| SPEC-005.NAC02 | Given ON_HOLD or CLOSED vacancy, When `reserve` or `changeVacancy` target, Then refused with the same code (`details.reason=VACANCY_NOT_OPEN`) | V1, BRD-028 |
| SPEC-005.NAC03 | Given an Employee, When selecting a Full/On Hold/Closed vacancy through discovery or submission check, Then not listed / `checkSelectable` false | BRD-029 |
| SPEC-005.NAC04 | Given a vacancy status change to FULL/ON_HOLD/CLOSED, Then no reservation is auto-released | BRD-OQ-15(b) |
| SPEC-005.NAC05 | Given available = 1 and N concurrent reserves for N different transfers, Then exactly one succeeds | V2 |
| SPEC-005.NAC06 | Given two concurrent `changeVacancy` calls targeting the last slot of V2, Then exactly one succeeds; the other leaves its original reservation intact | V2 |
| SPEC-005.NAC07 | Given an attempted capacity reduction below Reserved + Allocated, Then 409 `VACANCY_CAPACITY_BELOW_COMMITMENT` and no change | V3 |
| SPEC-005.NAC08 | Given any direct SQL attempt to set `reserved_count + allocated_count > capacity`, Then DB rejects (23514) | V3 |
| SPEC-005.NAC09 | Given any attempt to make `reserved_count` or `allocated_count` negative (release with no ACTIVE row, double finalize), Then no counter changes (no-op/refusal) and DB CHECK rejects direct SQL | V3 |
| SPEC-005.NAC10 | Given a second `reserve` for the same transfer on a different vacancy, Then 409 `RESERVATION_ALREADY_EXISTS`, no counter change | NFR-006 |
| SPEC-005.NAC11 | Given a concurrent duplicate `reserve` for the same transfer and vacancy, Then one reservation row exists | NFR-006 |
| SPEC-005.NAC12 | Given release replay after Rejected, Then reserved is not decremented twice | V4, V3 |
| SPEC-005.NAC13 | Given REPORTING_MANAGER, RECEIVING_MANAGER, EMPLOYEE or IT calls manual release, Then 403 and the denial is audited | BRD-OQ-15(c), BRD-026 |
| SPEC-005.NAC14 | Given HR out of scope calls manual release or vacancy read, Then 403 with no data leaked | BRD-026, BRD-OQ-15(c) |
| SPEC-005.NAC15 | Given manual release without reason or whitespace-only, Then 422 and nothing released | BRD-OQ-15(c) |
| SPEC-005.NAC16 | Given manual release on an ALLOCATED reservation, Then 409 and allocation unchanged | BRD-028 (derived) |
| SPEC-005.NAC17 | Given `validateForResume` on a CLOSED vacancy, Then failure and the request cannot resume | BRD-OQ-15(b) |
| SPEC-005.NAC18 | Given HR/non-Super-Admin calls POST/PATCH/status on vacancies, Then 403 | BRD-010, BRD-026 |
| SPEC-005.NAC19 | Given Employee calls `GET /vacancies` or discovery as another role, Then 403 | BRD-026 |
| SPEC-005.NAC20 | Given an exception inside the workflow transaction after `reserve`, Then reservation and counters are rolled back with it | BRD-038 |
| SPEC-005.NAC21 | Given `changeVacancy` where the savepoint section fails midway, Then original reservation and both vacancies remain unchanged even if the caller swallows the error | BRD-028 step 6 |
| SPEC-005.NAC22 | Given org-field edit while live reservations exist, Then 409 `VACANCY_ORG_FIELDS_LOCKED` | BRD-OQ-15(a) (derived) |
| SPEC-005.NAC23 | Given an inactive master (location etc.) or free-text value on create/edit, Then 422 | BRD-029 |
| SPEC-005.NAC24 | Given a DELETE on `vacancy_reservations` or UPDATE of a terminal row (direct SQL), Then trigger rejects | DERIVED |
| SPEC-005.NAC25 | Given unauthenticated or expired token on any endpoint, Then 401 | BRD-026 |

## 23. Testing Requirements

Framework per project standard (Jest; Backend-Architecture §21); backend tests under `tests/backend/vacancy/`, frontend under `tests/frontend/vacancy/`. Concurrency and integration tests run against a real PostgreSQL test database with migrations applied (no mocks for locking/CHECK behaviour).

### 23.1 Unit (TASK-005.29)
| TC | Scenario |
|---|---|
| TC-005.01 | computeAvailable: 5 − (3+1) = 1 |
| TC-005.02 | computeAvailable with zero reserved/allocated |
| TC-005.03 | normaliseStatus: OPEN with available 0 → FULL |
| TC-005.04 | normaliseStatus: FULL with available >0 → OPEN |
| TC-005.05 | normaliseStatus: ON_HOLD/CLOSED never auto-change |
| TC-005.06 | assertStatusChangeAllowed: manual FULL with available>0 refused |
| TC-005.07 | Reopen with available 0 → FULL; with >0 → OPEN |
| TC-005.08 | assertCapacityEdit below reserved+allocated refused |
| TC-005.09 | assertCapacityEdit equals committed → FULL |
| TC-005.10 | Opening filled edit rules |
| TC-005.11 | isAvailable derived flag truth table (4 statuses × available 0/>0) |
| TC-005.12 | Validators: capacity bounds, uuid, unknown fields, blank reason |
| TC-005.13 | Reason trimming/whitespace-only rejection |
| TC-005.14 | resume-failure aggregation returns all failures |
| TC-005.15 | validateForResume: FULL passes |
| TC-005.16 | error-class mapping of PG 23514/55P03/40001 |
| TC-005.17 | Idempotency decision table for reserve (none/same/different/allocated) |
| TC-005.18 | Release reason-code validation |
| TC-005.19 | Effect registry maps each transition to the expected call |
| TC-005.20 | List query builder whitelists sort/filters |

### 23.2 Integration / API (TASK-005.30)
| TC | Scenario |
|---|---|
| TC-005.21 | POST create happy path, defaults, reference uniqueness |
| TC-005.22 | Create against inactive/missing master → 422/404 |
| TC-005.23 | PATCH capacity up/down, audit event written |
| TC-005.24 | PATCH capacity below committed → 409 |
| TC-005.25 | PATCH org fields blocked with live reservation |
| TC-005.26 | PATCH stale version → 409 |
| TC-005.27 | Status change matrix (all allowed/disallowed transitions of 16.1) |
| TC-005.28 | Status change leaves reservations untouched |
| TC-005.29 | List filters/sort/pagination, availableOnly |
| TC-005.30 | HR scoped list/detail/ledger |
| TC-005.31 | Discovery returns only Open+available, minimal fields |
| TC-005.32 | reserve happy path + automatic FULL |
| TC-005.33 | reserve on FULL/ON_HOLD/CLOSED → 409 |
| TC-005.34 | reserve idempotent replay |
| TC-005.35 | reserve different vacancy for same transfer → 409 |
| TC-005.36 | release on Rejected/Withdrawn/Cancelled |
| TC-005.37 | release no-op when no reservation |
| TC-005.38 | release from FULL reopens |
| TC-005.39 | changeVacancy success |
| TC-005.40 | changeVacancy failure leaves original unchanged (target FULL) |
| TC-005.41 | changeVacancy savepoint rollback when caller swallows error |
| TC-005.42 | finalizeAllocation + replay |
| TC-005.43 | finalize without reservation → 409 |
| TC-005.44 | validateForResume each failure code and success |
| TC-005.45 | manualRelease success + audit fields; ledger immutability triggers |

### 23.3 Concurrency (TASK-005.31, real PostgreSQL)
| TC | Scenario |
|---|---|
| TC-005.46 | Capacity 1, 2 parallel reserves → one success, one 409 |
| TC-005.47 | Capacity 1, 20 parallel reserves → exactly one success |
| TC-005.48 | Capacity 5 (filled 3), 10 parallel → exactly two succeed |
| TC-005.49 | Parallel duplicate reserve for same transfer → one row |
| TC-005.50 | Parallel reserve vs capacity reduction → invariants hold, never negative |
| TC-005.51 | Parallel reserve vs status → ON_HOLD/CLOSED: no reservation after status commit |
| TC-005.52 | Parallel changeVacancy A→B and B→A: no deadlock, both consistent or retried |
| TC-005.53 | Parallel two transfers changing to the same last slot: one succeeds, other's original intact |
| TC-005.54 | Random mixed operations (reserve/release/change/finalize) property test: invariants of 10.3 always hold, reconciliation clean |
| TC-005.55 | CHECK constraint bypass test: direct UPDATE exceeding capacity rejected |
| TC-005.56 | Lock timeout produces `VACANCY_LOCK_TIMEOUT` |
| TC-005.57 | 40001/40P01 triggers whole-transaction retry (simulated) |
| TC-005.58 | Transaction rollback after reserve leaves no row/counter change |

### 23.4 Security (TASK-005.32)
| TC | Scenario |
|---|---|
| TC-005.59 | Role × endpoint matrix of Section 15 (all cells) |
| TC-005.60 | HR out-of-scope read/release → 403 no leak |
| TC-005.61 | Direct API calls without UI (401/403) |
| TC-005.62 | Manual release forbidden roles audited as security events |
| TC-005.63 | SQL injection attempts in `q`/sort/filters |
| TC-005.64 | Discovery never exposes reservation/employee data |
| TC-005.65 | Audit payloads contain no credentials |
| TC-005.66 | Unknown/extra body fields rejected |

### 23.5 Workflow-contract (TASK-005.33, with SPEC-007 engine stub)
| TC | Scenario |
|---|---|
| TC-005.67 | Submit / RM approve / RcvM approve: no reservation |
| TC-005.68 | HR Validate & Approve reserves; capacity failure rolls back transition |
| TC-005.69 | Info Required retains reservation |
| TC-005.70 | Block retains; Resume with CLOSED fails and stays Blocked |
| TC-005.71 | Reject/Withdraw/Cancel release |
| TC-005.72 | Re-approval Approve retains; Reject releases |
| TC-005.73 | Completion finalises allocation in same transaction |
| TC-005.74 | Invalid transition triggers no vacancy effect |

### 23.6 Frontend (TASK-005.34)
| TC | Scenario |
|---|---|
| TC-005.75 | List renders badges, filters, pagination, states |
| TC-005.76 | Create/edit form validation and locked org fields |
| TC-005.77 | Status dialog confirmation and 409 messages |
| TC-005.78 | Version conflict message and reload |
| TC-005.79 | HR view has no edit controls |
| TC-005.80 | Manual release dialog requires reason; hidden for other roles |
| TC-005.81 | Employee discovery + VacancyPicker |
| TC-005.82 | Keyboard/ARIA accessibility checks |

### 23.7 Traceability to BRD-039
V1 → TC-005.33, 46; V2 → TC-005.46–53; V3 → TC-005.08, 50, 55, 58; V4 → TC-005.36, 71.

## 24. Definition of Done

- [ ] Gate 1 approved; no open Technical Design Decision blocks implementation (or each has a recorded decision).
- [ ] Migrations applied up/down on a clean database; no auto-sync; constraints/indexes/triggers of Section 10 present.
- [ ] `VacancyService` contract implemented exactly as Section 11.2; no code path mutates vacancy counters outside it.
- [ ] All endpoints of Section 12 implemented, documented in OpenAPI, validated, authorised and returning the standard envelope.
- [ ] All SPEC-005.AC and NAC scenarios covered by tests TC-005.01–82; all tests green; concurrency suite stable across repeated runs on real PostgreSQL.
- [ ] Reconciliation script shows zero drift after the concurrency/property test run.
- [ ] Audit events of Section 18 emitted and verified; failure events persist after rollback.
- [ ] INT standards: ES6+, async/await, try/catch, structured logger, env-based configuration (`VACANCY_LOCK_TIMEOUT_MS`, `VACANCY_TX_RETRY_MAX`), input validated/sanitised, no secrets, no AI-generated comments.
- [ ] Frontend states, accessibility and role-aware navigation verified.
- [ ] Status board, dashboard and PR review record updated by the owning workflow (not by this spec).
- [ ] Gate 2 code review passed.

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-005.01 | Vacancy reference format (BRD-017 requires a reference, no format) | `VAC-` + 6 digits from a sequence, immutable, unique | UI display, search, reports |
| TDD-005.02 | Employee vacancy visibility rules ("subject to visibility rules", BRD-011); gap (j) | Employee sees all vacancies that are OPEN with available > 0, no organisation-based restriction, no capacity numbers (only `isAvailable`) [RECONCILED]; no tenure/probation or similar rule applied (BRD-029 rule 8) | Discovery query, privacy, UAT |
| TDD-005.03 | HR vacancy read scope (HR scope defined by location/organisation, BRD-013/016) | Vacancy visible if its location is in HR's location scope OR it is the selected vacancy of a transfer within HR's scope | HR list/detail, ledger |
| TDD-005.04 | Capacity min/max; mutability of Dept/BU, Designation, Location after creation | min 1, max 100000; org fields editable only while no live (ACTIVE/ALLOCATED) reservation exists | Edit form, referential consistency with approved transfer details |
| TDD-005.05 | Meaning of "Allocated/Filled" for historical headcount | `opening_filled_count` entered by Super Admin plus count of ALLOCATED reservations | Capacity accuracy, reporting |
| TDD-005.06 | Is a remark mandatory for manual status change / capacity edit; confirm FULL→OPEN auto-return | Remark optional; automatic return of FULL to OPEN confirmed | Audit completeness, UX |
| TDD-005.07 | Can Super Admin delete (soft-delete) a vacancy; BRD-OQ-15(a) mentions "deleted" | No delete endpoint this phase; `deleted_at` column and checks kept; if later added, refused while any reservation exists | Resume validation, data retention |
| TDD-005.08 | Effect on the transfer after manual release of an in-flight reservation (BRD says only release + audit) | Workflow status unchanged; completion is blocked until a reservation is re-created (HR re-reserves through SPEC-008 handler) or the transfer is cancelled | UX, SPEC-008/009/010 handlers |
| TDD-005.09 | Exact meaning of "no conflicting final allocation" in BRD-OQ-15(a) | No ALLOCATED row for this transfer, and none for the same employee created after this reservation on another transfer | Resume validation completeness |
| TDD-005.10 | Numeric lock timeout, retry count, expected concurrency/volume (BRD-038 "to be confirmed") | Lock timeout 5000 ms, 3 transaction retries, env-configurable | Performance planning, 503 behaviour |
| TDD-005.11 | Confirm proposed code/message `VACANCY_CAPACITY_UNAVAILABLE` (BRD requires a capacity-unavailable response, no code) | HTTP 409 `VACANCY_CAPACITY_UNAVAILABLE`, message "The selected vacancy no longer has available capacity." | API contract, frontend messages |
| TDD-005.12 | Duplicate vacancies with identical Dept/BU + Designation + Location | Allowed (capacity expresses multiple positions); no uniqueness beyond `reference` | Create validation |
| TDD-005.13 | Notifications for manual release or vacancy status changes ("relevant stakeholders", gap (i)) | None; BRD-036 lists no vacancy event | SPEC-012 catalogue |
| TDD-005.14 | Whether the Employee should see the exact available count or only "available" | Show `availableCapacity` only | Information exposure |
| TDD-005.15 | HR "authorised organisational/location scope" for manual release (employee's scope, vacancy's scope, or both) | Transfer is within HR's scope per SPEC-002/003 `ScopeResolver` (employee location/HR assignment), independent of the vacancy's location | Authorisation, 403 cases |
| TDD-005.16 | Whether the engine transaction isolation may be raised above READ COMMITTED by SPEC-001/007 | Keep READ COMMITTED; if raised, retry on 40001 | Locking behaviour, retry policy |

## Out of Scope (this SPEC)

Per BRD Out of Scope, nothing in this SPEC introduces: advanced workforce planning or predictive vacancy forecasting; automatic HR-system integration/synchronisation (vacancy master is portal-maintained, BRD-029); bulk vacancy import/historical backfill; replacement of HR/payroll/IT platforms; recruitment of external candidates. Also not in this SPEC (owned elsewhere): transfer request table, eligibility engine and employee transfer form (SPEC-006); workflow state machine and transition registry (SPEC-007); HR review UI/handlers and BRD-024 re-approval (SPEC-008); completion gate (SPEC-009); Block/Resume/Cancel/Reassign/Withdraw actions (SPEC-010); notification delivery (SPEC-012); audit log visibility/export (SPEC-013); dashboards/reports (SPEC-014); numeric performance targets (SPEC-015/BRD-038 planning). No vacancy deletion, no waiting lists and no priority/queueing of competing applicants are introduced.
