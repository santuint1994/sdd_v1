# SPEC-016 — End-to-End QA, UAT, Negative Testing & BRD Traceability

## Feature ID
qa-uat-traceability

## Status
Draft — not yet submitted for Gate 1

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 1 (Spec Peer Review) | _pending assignment per roster_ | — | Not submitted | — |
| Gate 2 (Code Review) | _pending assignment per roster_ | — | Not started | — |

## Intent & Business Goals

SPEC-016 is the **quality-assurance and acceptance spec** of the Internal Transfer Digital Journey. It owns no product feature, table or endpoint. It defines (a) the master test strategy and test pyramid that every feature spec's section 23 plugs into, (b) the execution and exit rule for the **24 mandatory negative scenarios of BRD-039** (any failed mandatory scenario blocks production `[BRD-039]`), (c) the end-to-end, concurrency and UAT scenario packs, (d) the performance-test plan **prerequisites** (BRD-038 "to be confirmed" inputs are never invented), and (e) the pre-production validation gate and release-readiness checklist.

Business goals:
1. Every one of the 24 BRD-039 scenarios is mapped to concrete owning-spec NAC/TC IDs **and** to one end-to-end case in this spec, and is executed and passed before production `[BRD-039]`.
2. The twelve UAT scenarios named in the BRD Acceptance Criteria are scripted step-by-step with role actors `[BRD Acceptance Criteria: UAT]`.
3. Test-first discipline (RED then GREEN) is applied uniformly, with tests under `tests/backend/` and `tests/frontend/` `[constitution Testing Discipline]`.
4. The five Integration scenarios, which cannot be exercised against a real integration (none exists this phase), have a defined current-phase validation approach, put to Gate 1 as `TDD-016.01` `[BRD Integration Requirements, contract §5(q)]`.
5. Performance validation is blocked, not guessed, until the BRD-038 inputs carry numeric values `[BRD-038]`.
6. Every BRD acceptance bullet and every BRD "Out of Scope" item has a verification route (matrices in sections 3.5, 3.6 and 9.8).

## User Roles & Actors

| Actor | Involvement |
|---|---|
| Super Admin, Employee, Reporting Manager, Receiving Manager, HR, IT | Application roles `[BRD-001]`; exercised as **test personas** (section 9.3) and as UAT actors (section 9.6). No new application role is created |
| QA Engineer (engineering role, not an application role) | Owns execution, evidence and the BRD-039 report |
| Technical Lead / Architect (Gate 2 reviewer) | Reviews test evidence, CI gates, security checklists |
| Project Manager / Product Owner (Gate 1 reviewer) | Confirms scenario packs, integration validation approach, UAT sign-off `[PROPOSED]` (`TDD-016.07`) |
| Business Analyst / HR operations (UAT participants) | Execute UAT scripts as the named role `[PROPOSED]` |

---

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-016 |
| Title | End-to-End QA, UAT, Negative Testing & BRD Traceability |
| Purpose | Master test strategy; BRD-039 mandatory negative scenario execution and exit rule; E2E, concurrency and UAT packs; performance-plan prerequisites; pre-production and release gates; coverage matrices |
| Business objective | No unvalidated behaviour reaches production; every BRD acceptance and mandatory negative criterion is demonstrably covered |
| Version | 0.1 (Draft) |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer per roster | Project Manager / Product Owner |
| Task prefix | `TASK-016.MM` |
| Test-case prefix | `TC-016.NN` (end-to-end, concurrency, performance, gate cases owned here); UAT scripts `UAT-NN` |
| Related artefact | Full BRD → SPEC → TASK traceability matrix: `.ai-context/specs/spec-traceability-matrix.md` (separate artefact; **referenced, not duplicated** here) |
| Classification tags | `[BRD]` stated; `[DERIVED]` follows from BRD text; `[PROPOSED]` reviewable design; `[TDD-REQUIRED]` Technical Design Decision Required — Not Defined by BRD (closing section, IDs `TDD-016.NN`) |

## 2. Why This SPEC Exists

1. BRD-039 makes 24 negative scenarios **mandatory QA/UAT acceptance criteria** whose failure blocks production. Each is satisfied by behaviour that lives in several feature specs; without one owner the scenarios could be partly covered by everyone and fully verified by no one.
2. The BRD UAT bullet lists twelve scenario families (account creation/login through final completion) that span specs 002–013 and need role-by-role scripts.
3. Feature specs 001–015 each define a section 23 but explicitly defer cross-spec execution, BRD-039 reporting, coverage thresholds (`SPEC-010 §23`) and UAT scripts to SPEC-016 `[SPEC-007, 011, 012, 013, 014, 015 hand-offs]`.
4. No external HR/Payroll integration exists in the current phase (BRD Integration Requirements), yet BRD-039 lists five mandatory Integration scenarios; a validation approach must be proposed and decided at Gate 1 (`TDD-016.01`).
5. BRD-038 performance inputs are "to be confirmed"; the BRD requires validation in pre-production before go-live. The plan must be ready but blocked until inputs exist.
6. **BRD numbering note** `[DERIVED]`: the BRD has no `BRD-015` (numbering runs BRD-014 → BRD-016). It is not a missing requirement and no test depends on it. Traceability tooling must treat the gap as intentional.

---

## 3. BRD Traceability

### 3.1 BRD requirement IDs

| BRD ID | Topic | Coverage by this SPEC |
|---|---|---|
| BRD-039 | Mandatory negative acceptance scenarios | **FULL** (execution, mapping, exit rule, end-to-end cases, report) |
| BRD-038 | Performance & availability | **PARTIAL (validation slice)**: plan prerequisites, blocked-until-inputs rule, correctness-under-load invariants, pre-production validation. Inputs register and numeric targets: SPEC-015 §9.6 |
| BRD Acceptance Criteria (UAT bullet) | UAT scenario families | **FULL** (section 9.6, `UAT-01..12`) |
| BRD-001…BRD-037 (all, excluding the non-existent BRD-015) | Functional behaviour | **PARTIAL (verification slice)**: end-to-end journeys, acceptance matrix (3.5); implementation owners are listed in contract §4 |
| BRD Integration Requirements (Business Rules) | No integration this phase; future contract | **PARTIAL (verification slice)**: validation approach for the 5 Integration scenarios (9.5); contract template owned by SPEC-015 |

### 3.2 NFR IDs

| NFR | Verification slice in this SPEC |
|---|---|
| NFR-001/002/003 | S4–S8 end-to-end, credential-leak scan across journeys (`TC-016.62`) |
| NFR-004 | Pre-production TLS/transport verification step (PPV-05) consuming SPEC-015 evidence |
| NFR-005 | Audit completeness after every journey (`TC-016.39`), tamper evidence reuse (SPEC-013) |
| NFR-006 | Integration scenarios I1–I5, notification retry idempotency, double-submit concurrency |
| NFR-007 | S1–S3 end-to-end, IT minimum-data checks |
| NFR-008 | UI end-to-end accessibility and responsive smoke (`TC-016.55`) |
| NFR-009 | Performance-plan prerequisites; infrastructure checklist items INF-01..16 are SPEC-015's, consumed by PPV/RR gates |

### 3.3 BRD open questions

| BRD-OQ | Treatment |
|---|---|
| BRD-OQ-01…OQ-20 | All Resolved; each resolution is exercised by at least one journey or NAC (see 3.5). OQ-09 (deferred infrastructure targets) is a **gate input** here (PPV-09), not a test |
| BRD-OQ-12, 13, 14, 15, 17, 18 | Exercised by exception-path catalogue P14–P25 (section 16.2) |

### 3.4 Business rules covered

Mandatory negative scenarios rule (BRD-039); Performance & availability rule (BRD-038, validation slice); Integration Requirements rule (validation approach); every other Business Rule bullet is verified through the journeys in 16.2 and the acceptance matrix 3.5.

### 3.5 Acceptance coverage matrix — each BRD "Acceptance Criteria" bullet → SPEC acceptance IDs

IDs `AB-nn` are assigned here in BRD order for traceability. Each row is covered **only if** the listed AC IDs have passing TCs (rule `SPEC-016.AC26`). SPEC-016 IDs are defined in section 21.

| AB | BRD Acceptance Criteria bullet (abridged) | SPEC acceptance IDs (owning) | SPEC-016 verification |
|---|---|---|---|
| AB-01 | Super Admin accesses modern role-aware Admin Panel; manages master data and user modules | SPEC-003.AC01–AC09a, AC10–AC14, AC20–AC22; SPEC-001.AC20–AC24 | AC12, AC15 (UI E2E) |
| AB-02 | Super Admin creates Employee/RM/HR/IT accounts within scope | SPEC-004.AC01, AC02, AC04, AC35 | UAT-01 |
| AB-03 | Unique User ID and strong temporary password | SPEC-004.AC01–AC03, AC06; SPEC-002.AC04; SPEC-001.AC10 | UAT-01 |
| AB-04 | Change temp password at first login; plaintext never stored/logged | SPEC-002.AC05, AC06, AC08, AC11, AC30; SPEC-004.AC08; SPEC-013.AC07; SPEC-001.AC03 | AC07 (S4), `TC-016.62` |
| AB-05 | Lock 30 min after 5 failures; no authentication/API until expiry or unlock | SPEC-002.AC12–AC17; SPEC-004.AC22 | AC07 (S5), UAT-01 |
| AB-06 | 30 min idle expiry; reset/deactivation invalidate sessions | SPEC-002.AC19–AC23, AC17, AC22; SPEC-004.AC20, AC23 | AC07 (S6, S7), UAT-02 |
| AB-07 | Password complexity; tokens/credentials never logged; MFA/SSO out of scope | SPEC-002.AC09, AC10, AC30; SPEC-001.AC03, AC26 | `TC-016.62`, 9.8 |
| AB-08 | Every protected API validates the BRD-026 chain; 401 vs 403; direct API (Postman) | SPEC-002.AC25–AC29, AC32; SPEC-007.AC04, AC07; SPEC-001.AC25; SPEC-011.AC10; SPEC-015.AC23 | AC07 (S1, S2, S8) |
| AB-09 | Status changes follow BRD-027 matrix; invalid → 403 `INVALID_WORKFLOW_TRANSITION`; no Completed without IT Final Approval; HR before Payroll | SPEC-007.AC01–AC07, AC17; SPEC-009.AC08, AC16–AC19, AC23; SPEC-008.AC10–AC13; SPEC-002.AC28 | AC08, AC16 |
| AB-10 | Rejection reason/release; clarification return; withdrawal rules | SPEC-007.AC21–AC30; SPEC-010.AC01–AC04; SPEC-005.AC12–AC14; SPEC-008.AC07–AC09 | AC15 (P04–P14), UAT-04/05 |
| AB-11 | Super Admin resets credentials, activates/deactivates | SPEC-004.AC20–AC24, AC26, AC27 | UAT-02 |
| AB-12 | Super Admin configures locations/departments/designations/vacancies with capacity | SPEC-003.AC10–AC17; SPEC-005.AC01–AC06 | AC12, UAT-06 |
| AB-13 | Eligible employee views permitted vacancies, submits, receives unique reference | SPEC-006.AC03, AC10, AC12; SPEC-005.AC07, AC08 | AC12 |
| AB-14 | Eligibility (BRD-029) rules and HR revalidation | SPEC-006.AC04–AC09, AC13; SPEC-008.AC02, AC06 | AC15 (P22) |
| AB-15 | Portal as source of truth; master data not free text; missing data blocks submission | SPEC-015.AC01–AC09; SPEC-004.AC12–AC19; SPEC-006.AC02, AC06, AC07, AC27; SPEC-003.AC18, AC23; SPEC-008.AC28 | AC15 (P22), AC27 |
| AB-16 | HR-ineligible outcome (reject vs clarification) | SPEC-008.AC06–AC09; SPEC-012.AC06; SPEC-007.AC30 | AC15 (P06, P10) |
| AB-17 | One active request; 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`; DB enforcement; new request after closed | SPEC-006.AC13–AC17, AC20; SPEC-010.AC09, AC23 | AC17 (C-02), AC15 (P23) |
| AB-18 | Rejection & resubmission (BRD-033) | SPEC-007.AC21–AC24; SPEC-006.AC20; SPEC-010.AC23, AC24, AC26 | AC15 (P04–P07, P23) |
| AB-19 | Clarification (BRD-034) incl. multiple cycles | SPEC-007.AC25–AC30; SPEC-008.AC08, AC09, AC19 | AC15 (P08–P11), UAT-05 |
| AB-20 | Effective Transfer Date (BRD-031) | SPEC-006.AC11, AC21–AC23; SPEC-008.AC25–AC27; SPEC-009.AC25–AC28; SPEC-007.AC19, AC20; SPEC-001.AC13 | AC15 (P20, P21), UAT-12 |
| AB-21 | Reporting Manager / Receiving Manager permitted actions | SPEC-007.AC01, AC08–AC16, AC18; SPEC-014.AC05, AC06 | AC12, AC13 |
| AB-22 | HR validation, metadata, documents, downstream initiation | SPEC-008.AC01–AC05, AC10–AC13, AC21; SPEC-011.AC01, AC02; SPEC-009.AC02, AC03 | AC12, UAT-03 |
| AB-23 | IT views/completes only assigned tasks in scope | SPEC-009.AC11–AC17, AC30; SPEC-011.AC13; SPEC-014.AC09; SPEC-004.AC32 | AC07 (S3), UAT-10 |
| AB-24 | Each user sees assigned employees/requests/tasks per role/mapping | SPEC-014.AC03–AC09; SPEC-004.AC30–AC33; SPEC-003.AC25–AC32; SPEC-007.AC34 | AC07 (S1, S2) |
| AB-25 | Every material configuration/security/workflow action creates the audit record | SPEC-013.AC01–AC05, AC17–AC22, AC25, AC26; SPEC-001.AC04, AC05; SPEC-003.AC33; SPEC-004.AC40–AC42 | AC28 (audit completeness) |
| AB-26 | Only applicable downstream actions; failures visible and recoverable | SPEC-009.AC01–AC04, AC21, AC22, AC29; SPEC-012.AC17, AC18, AC21; SPEC-015.AC16, AC37; SPEC-013.AC23 | AC10, AC18 |
| AB-27 | Completed only after IT Final Approval (with or without IT task) | SPEC-009.AC16–AC19, AC23; SPEC-007.AC06 | AC12–AC14 |
| AB-28 | Receiving Manager re-approval on HR change of the four fields | SPEC-008.AC14–AC20; SPEC-007.AC13–AC15; SPEC-012.AC15 | AC08 (W7), UAT-07 |
| AB-29 | Reserve only at HR validation; no over-allocation under concurrency | SPEC-005.AC09, AC10, AC17, AC18; SPEC-008.AC03–AC05; SPEC-015.AC31 | AC09 (V2), AC17 |
| AB-30 | Capacity formula; one of two simultaneous HR approvals succeeds | SPEC-005.AC02, AC09, AC17; SPEC-008.AC05; SPEC-014.AC16 | AC09, UAT-06 |
| AB-31 | Resume revalidation; status change never auto-releases; Closed blocks resume; manual release rule; Available = Open and > 0 | SPEC-005.AC20–AC23; SPEC-010.AC10–AC14 | AC15 (P25) |
| AB-32 | Release on Rejected/Withdrawn/Cancelled; Blocked retains; Completed finalises | SPEC-005.AC12–AC15, AC19; SPEC-007.AC22; SPEC-010.AC03, AC15; SPEC-009.AC20 | AC09 (V4) |
| AB-33 | HR vacancy change atomic; failure leaves original | SPEC-005.AC16, AC18, AC29; SPEC-008.AC21, AC22 | AC15 (P22) |
| AB-34 | Block/Resume/Cancel rules and roles | SPEC-010.AC05–AC18, AC25–AC29; SPEC-009.AC29 | AC15 (P15–P18) |
| AB-35 | Administrative reassignment (BRD-035) | SPEC-010.AC19–AC22, AC25, AC29; SPEC-012.AC11; SPEC-009.AC30; SPEC-008.AC29 | AC15 (P19), UAT-08 |
| AB-36 | Twelve mandatory notifications; failure never rolls back; retry idempotent | SPEC-012.AC01–AC24; SPEC-001.AC06, AC07, AC09; SPEC-004.AC10, AC11 | AC18, UAT-11 |
| AB-37 | Audit logging (BRD-037): content, scoping, append-only, export, no credentials | SPEC-013.AC01–AC28; SPEC-001.AC04, AC05 | AC28 |
| AB-38 | Performance & availability validated in pre-production; 5 MB; retry; no partial/duplicate | SPEC-015.AC28–AC32, AC35; SPEC-011.AC07; SPEC-001.AC11, AC12 | AC22–AC24 (blocked until inputs) |
| AB-39 | All BRD-039 scenarios executed and passed; none unresolved at deployment | SPEC-016.AC05–AC11 | AC05, AC06 |
| AB-40 | UAT scenarios cover the twelve families | SPEC-016.AC20, AC21 | `UAT-01..12` |

### 3.6 Negative-test coverage matrix — the 24 BRD-039 scenarios

Scenario IDs follow BRD order: **S1–S8** Security, **W1–W7** Workflow, **V1–V4** Vacancy, **I1–I5** Integration. `TC-016.NN` (NN = 01…24 in that order) is the end-to-end case owned here (section 23.2). Owning-spec IDs are those present in the spec files at authoring time; the per-NAC TC numbering of each spec is authoritative in that spec (formulae noted where the spec states one). **Row coverage FULL = scenario is covered by every listed layer; the scenario passes only when all listed items pass.**

| # | BRD-039 mandatory negative scenario | Owning-spec NAC | Owning-spec TCs | SPEC-016 E2E |
|---|---|---|---|---|
| S1 | A user cannot access another organisation's data outside assigned scope `[BRD-026]` | SPEC-002.NAC05–06; SPEC-003.NAC06–08; SPEC-004.NAC10; SPEC-005.NAC14; SPEC-007.NAC02; SPEC-008.NAC01; SPEC-009.NAC08; SPEC-010.NAC08; SPEC-011.NAC04–05; SPEC-013.NAC03–05; SPEC-014.NAC01–02, NAC16; SPEC-015.NAC02 | TC-002.20; TC-003.45; TC-005.60; TC-007.50; TC-008.49; TC-010.37; TC-011.22; TC-014.31–.38; TC-015.65–.78 | TC-016.01 |
| S2 | An Employee cannot access another Employee's transfer request | SPEC-002.NAC07; SPEC-004.NAC11; SPEC-006.NAC01–02; SPEC-007.NAC11; SPEC-010.NAC03; SPEC-011.NAC06; SPEC-013.NAC07; SPEC-014.NAC04; SPEC-015.NAC14 | TC-002.24; TC-006.44, TC-006.59–.60; TC-007.50; TC-010.38; TC-013.67–.90 | TC-016.02 |
| S3 | IT cannot access Employee documents outside its authorised scope `[BRD-021]` | SPEC-011.NAC01–03; SPEC-009.NAC09, NAC11; SPEC-002.NAC08; SPEC-004.NAC13; SPEC-013.NAC06; SPEC-014.NAC05; SPEC-015.NAC15 | TC-011.21, TC-011.53; TC-009.43–.48; TC-015.65–.78 | TC-016.03 |
| S4 | A user cannot bypass the mandatory first-login password change `[BRD-025]` | SPEC-002.NAC01–02; SPEC-004.NAC20; SPEC-015.NAC19 | TC-002.20, TC-002.34; TC-004.81–.100 block | TC-016.04 |
| S5 | A locked user cannot log in | SPEC-002.NAC09–10, NAC16; SPEC-004.NAC21; SPEC-006.NAC19; SPEC-013.NAC24; SPEC-014.NAC09; SPEC-015.NAC18 | TC-002.12, TC-002.20, TC-002.27 | TC-016.05 |
| S6 | A deactivated user cannot log in | SPEC-002.NAC11–12; SPEC-004.NAC22; SPEC-013.NAC24; SPEC-014.NAC09; SPEC-015.NAC18 | TC-002.20, TC-002.29 | TC-016.06 |
| S7 | An old password cannot be used after a password reset | SPEC-002.NAC13–14; SPEC-004.NAC23 | TC-002.15, TC-002.28 | TC-016.07 |
| S8 | Direct API access cannot bypass role, scope, resource or action authorization `[BRD-026]` | SPEC-002.NAC03–04, NAC15; SPEC-003.NAC01, NAC03; SPEC-004.NAC01; SPEC-005.NAC18; SPEC-006.NAC04; SPEC-007.NAC05; SPEC-010.NAC29; SPEC-011.NAC07–09; SPEC-012.NAC02; SPEC-013.NAC03; SPEC-015.NAC16 | TC-002.20, TC-002.21, TC-002.41; TC-007.51; TC-011.20; TC-012.26; TC-015.65–.78 | TC-016.08 |
| W1 | A user cannot approve a request outside assigned role/scope | SPEC-007.NAC01, NAC19; SPEC-008.NAC01–02, NAC12; SPEC-009.NAC05, NAC08; SPEC-010.NAC27 | TC-007.13, TC-007.50–.51; TC-008.50; TC-009.43–.48; TC-010.34 | TC-016.09 |
| W2 | Invalid workflow transitions are rejected `[BRD-027]` | SPEC-007.NAC03–04; SPEC-006.NAC06–07; SPEC-008.NAC03–05, NAC09; SPEC-009.NAC03–04, NAC13, NAC15; SPEC-010.NAC02, NAC10, NAC13; SPEC-013.NAC15 | TC-007.10–.12 (golden matrix); TC-008.63; TC-009.55–.62; TC-010.01, TC-010.48 | TC-016.10 (+ TC-016.49 replay) |
| W3 | A Completed transfer cannot be modified through the normal workflow | SPEC-007.NAC06; SPEC-006.NAC06; SPEC-009.NAC17–19; SPEC-010.NAC18–19; SPEC-011.NAC12; SPEC-015.NAC29 | TC-007.12; TC-009.55–.62; TC-010.51; TC-011.50 | TC-016.11 |
| W4 | IT Final Approval cannot be given while a mandatory Payroll activity is incomplete | SPEC-009.NAC06–07; SPEC-015.NAC07; SPEC-007.NAC07 (partial) | TC-009.68–.69 (NACn = TC-009.(62+n)); TC-009.58 | TC-016.12 |
| W5 | A transfer cannot move to Completed without mandatory IT Final Approval | SPEC-007.NAC07; SPEC-009.NAC12, NAC14 | TC-007.02, TC-007.12; TC-009.74, TC-009.76 | TC-016.13 |
| W6 | Receiving Manager approval cannot be bypassed when enabled/configured as mandatory | SPEC-007.NAC08; SPEC-008.NAC10–11 | TC-007.04, TC-007.14; TC-008.61, TC-008.62 | TC-016.14 |
| W7 | HR changes to Department/BU, Designation, Location or Reporting Manager trigger BRD-024 re-approval | SPEC-008.NAC10–11, NAC21, NAC27; SPEC-007.NAC09 | TC-007.15; TC-008.05, TC-008.15, TC-008.58, TC-008.62 | TC-016.15 |
| V1 | A Full vacancy cannot receive a new allocation/reservation `[BRD-028]` | SPEC-005.NAC01–03; SPEC-006.NAC11; SPEC-008.NAC13; SPEC-015.NAC25 | TC-005.33, TC-005.46 (V1 mapping in SPEC-005 §23.7); TC-006.69 | TC-016.16 |
| V2 | Concurrent HR approvals do not cause capacity to be exceeded | SPEC-005.NAC05–06; SPEC-008.NAC14; SPEC-009.NAC21; SPEC-001.NAC10; SPEC-015.NAC26 | TC-005.46–.53; TC-008.55; TC-001.40; TC-015.95–.105 | TC-016.17 (design C-01) |
| V3 | Vacancy capacity never becomes negative | SPEC-005.NAC07–09; SPEC-008.NAC15; SPEC-009.NAC20; SPEC-014.NAC12 (display); SPEC-015.NAC27 | TC-005.08, TC-005.50, TC-005.55, TC-005.58; TC-015.20 (CHK-01) | TC-016.18 |
| V4 | Rejected and Withdrawn requests release reserved capacity | SPEC-005.NAC12; SPEC-008.NAC17; SPEC-010.NAC28; SPEC-007.NAC10; SPEC-015.NAC28 | TC-005.36, TC-005.71; TC-010.07, TC-010.08, TC-010.41 | TC-016.19 |
| I1 | An integration timeout does not create duplicate downstream transactions | SPEC-015.NAC08; SPEC-012.NAC05; SPEC-009.NAC29 | TC-015.35–.46; TC-012.38 | TC-016.20 |
| I2 | Failed integrations support controlled retry where applicable | SPEC-015.NAC09, NAC13; SPEC-012.NAC07, NAC09 | TC-015.35–.46; TC-012.23, TC-012.40 | TC-016.21 |
| I3 | A failed integration does not incorrectly mark the associated task Completed | SPEC-015.NAC10; SPEC-009.NAC02; SPEC-012.NAC08 | TC-015.47–.52; TC-012.39 | TC-016.22 |
| I4 | An external failure does not cause the transfer to be incorrectly marked Completed | SPEC-015.NAC11; SPEC-009.NAC02, NAC14; SPEC-012.NAC08 | TC-015.47–.52; TC-012.39 | TC-016.23 |
| I5 | Retry processing follows the NFR-006 duplicate-prevention/idempotency requirements | SPEC-015.NAC12; SPEC-012.NAC05–06; SPEC-009.NAC30 | TC-015.106–.110; TC-012.13–.15, TC-012.34; TC-009.49 | TC-016.24 |

**Reconciliation note `[PROPOSED]`:** SPEC-015 §3.5/§3.6 now use the standard `SPEC-015.ACnn`/`NACnn` labels (legacy labels resolved, gap G-04). This spec cites sections 21/22 only; the traceability tooling (`TASK-016.05`) fails on an unresolved ID.

---

## 4. Dependencies

| Dependency | Use |
|---|---|
| SPEC-001 | Test harness, real-PostgreSQL bootstrap (`sdd_v1_test`), factories, injectable clock, `check:boundaries`, error catalogue |
| SPEC-002 … SPEC-014 | Behaviour under test; each spec's section 21–23 IDs are the inputs of the matrices |
| SPEC-015 | Integration-validation harness and fake adapter (`tests/backend/integration-harness/`), `verify:integrity` (CHK-01..14), PRG-01..24, INF-01..16, BRD-038 input register §9.6, performance plan |
| SPEC-012 | Fake SMTP server with fault injection (refuse, delay beyond timeout, 4xx, 5xx, drop after DATA) |
| `spec-traceability-matrix.md` | BRD → SPEC → TASK matrix produced separately; consumed by the readiness checklist |
| Gate 1 decisions | `TDD-016.01` (integration approach), `TDD-016.04` (CI platform), `TDD-016.07` (UAT sign-off) |
| BRD-038 inputs | Performance execution cannot start before numeric values exist (section 9.7) |

## 5. Enables

| Consumer | What it receives |
|---|---|
| Release management (`int-release-management`, `status.md` readiness) | Release readiness checklist (9.10), BRD-039 report, UAT record |
| Production readiness gate (SPEC-015 PRG-02, PRG-03, PRG-05, PRG-12, PRG-13, PRG-24) | Evidence for those items |
| Gate 2 reviewers of every spec | Scenario execution evidence, RED→GREEN conventions, CI gates |
| Business / Project Manager | UAT scripts and sign-off form |

---

## 6. Roles & Scope

| Role | Scope in this SPEC |
|---|---|
| QA Engineer | Writes/executes TC-016 cases, runs the BRD-039 report, owns evidence |
| Technical Lead / Architect | Reviews CI gates, concurrency designs, security evidence; Gate 2 reviewer |
| Project Manager / Product Owner | Gate 1 review; UAT sign-off; waiver authority per `TDD-016.12` |
| UAT participants (business) | Execute scripts as Super Admin/Employee/Reporting Manager/Receiving Manager/HR/IT using synthetic accounts |
| Application roles | Personas only (9.3); this SPEC grants no application permission |

**In scope:** test strategy, scenario packs, harness consumption, UAT, performance prerequisites, gates, matrices, tooling that reads test results. **Out of scope:** product features, product APIs/tables, numeric performance/availability targets, infrastructure sizing, a production monitoring stack (SPEC-015/NFR-009).

---

## 7. Functional Requirements

Requirements are QA capabilities, not product behaviour. IDs `FR-016.nn`.

### 7.1 Strategy and conventions

| ID | Requirement | Tag / ref |
|---|---|---|
| FR-016.01 | A master test strategy defines the pyramid layers and ownership (9.1). Every spec's TC IDs (`TC-NNN.mm`) are registered in the traceability tooling; a NAC or AC without a TC is a failure | `[PROPOSED]`; `[BRD-039]` |
| FR-016.02 | TDD conventions of this repository apply to every task: tests are written first and observed failing for the right reason (RED), then implementation makes them pass (GREEN); tests live in `tests/backend/<module>/` and `tests/frontend/<module>/` | `[constitution Testing Discipline]` |
| FR-016.03 | Test titles begin with the TC ID; tests that contribute to a mandatory scenario carry the tag `[BRD-039:<S1..I5>]` so the report can select them | `[PROPOSED]` |
| FR-016.04 | Real PostgreSQL (migrations applied) is used for integration, concurrency, constraint and trigger tests; mocks are not used for locking/CHECK/trigger behaviour | `[PROPOSED]` (aligned with SPEC-001, SPEC-005) |
| FR-016.05 | Time-dependent rules (30-min idle, 30-min lock, 30-day date window, business time zone) are tested with an injectable clock; real waiting is used only where UAT requires observation (`UAT-01` step 9) | `[DERIVED]` BRD-025, BRD-031 |
| FR-016.06 | Test data is synthetic. No production data, no real employee emails and no committed passwords; fixture passwords come from environment variables at seed time | `[PROPOSED]`; `[BRD-005/006]` |
| FR-016.07 | Test-only code (fake adapters, seeders, harness routes) never ships: a CI guard fails if it appears in `backend/dist` or the production dependency graph | `[PROPOSED]` |

### 7.2 BRD-039 execution and exit

| ID | Requirement | Tag / ref |
|---|---|---|
| FR-016.10 | All 24 scenarios (3.6) are executed in CI (automated pack) and again in QA/UAT environments before production | `[BRD-039]` |
| FR-016.11 | `npm run qa:brd039` runs every test tagged `[BRD-039:*]` plus `TC-016.01–.24` and writes a JSON + Markdown report with one row per scenario: status, TC IDs executed, run id, environment, evidence link | `[PROPOSED]` |
| FR-016.12 | **Exit criterion:** any scenario row not `PASSED` (failed, skipped, missing mapping, not executed in pre-production) makes the command exit non-zero and blocks the production release (PRG-02) | `[BRD-039]` |
| FR-016.13 | A scenario cannot be waived. The only recorded exception is the Integration rows under an approved `TDD-016.01` Option B (9.5), which requires Project Manager sign-off and a pre-condition for any future integration | `[PROPOSED]`, `[TDD-REQUIRED]` |

### 7.3 Journeys, concurrency, UAT, performance, gates

| ID | Requirement | Tag / ref |
|---|---|---|
| FR-016.20 | End-to-end happy path (Receiving Manager enabled and disabled) and every exception path of 16.2 run against the real stack (HTTP, PostgreSQL, fake SMTP) | `[DERIVED]` BRD-018/027 |
| FR-016.21 | The full workflow transition matrix is owned by SPEC-007; this SPEC replays its allowed cells end-to-end and verifies fixture integrity (16.3). It does not copy the cells | `[DERIVED]` |
| FR-016.22 | Concurrency designs C-01…C-12 (section 17) run on real PostgreSQL with parallel connections, a start barrier and post-run invariants | `[BRD-028, BRD-030, BRD-038]` |
| FR-016.23 | The UAT pack `UAT-01..12` covers the twelve BRD UAT families with Given/When/Then and role actors (9.6) | `[BRD Acceptance Criteria]` |
| FR-016.24 | The performance plan is a prerequisite checklist plus parameterised scripts with no numeric value; execution is refused while any BRD-038 input is empty (9.7) | `[BRD-038]` |
| FR-016.25 | Correctness-under-load invariants (no over-allocation, no second active transfer, no partial transaction, no duplicate delivery, CHK-01..14 clean) are verified after every performance run, independent of response times | `[BRD-038 database transaction expectations]` |
| FR-016.26 | The pre-production validation gate (PPV) and release-readiness checklist (RR) are executed before production; both reference SPEC-015 PRG items rather than redefining them | `[PROPOSED]` |
| FR-016.27 | A defect and waiver log records every failed scenario, resolution and re-test evidence | `[PROPOSED]`; `[BRD-039 resolve before production]` |

---

## 8. Internal Implementation Plan / Tasks

Order is the recommended execution order. All tasks are QA-owned unless the layer says otherwise; RED→GREEN applies to the tooling that has logic (matrix/report scripts have unit tests first).

| Task | Title | Layer | Description | Inputs → Outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-016.01 | Test strategy and conventions | QA | Write `docs/qa/TEST-STRATEGY.md`: pyramid, tags, naming, RED→GREEN evidence, evidence format | SPEC-016 §9.1–9.2 → doc | — | BRD-039 |
| TASK-016.02 | Shared QA support library | BE | `tests/backend/_shared/qa/`: API actor client (login per persona, token store), barrier helper, clock control, DB snapshot/assert helpers (history/audit/outbox/reservation counts), persona loader | SPEC-001 harness → library | SPEC-001 harness | BRD-026 |
| TASK-016.03 | QA persona and scenario seed | DB | Seed script under `tests/backend/_shared/seeds/` for personas, locations, vacancies (9.3); `npm run qa:seed` refuses `NODE_ENV=production` and non-test DB names | factories → seed | .02 | BRD-005/006 |
| TASK-016.04 | Environment guard | QA | Runner aborts if DB host/name or API URL matches a production allow-list pattern; evidence of the guard test | config → guard | .02 | NFR-004 |
| TASK-016.05 | Traceability tooling | QA | `npm run trace:tests`: scan specs for AC/NAC/TC IDs and tests for TC prefixes; fail on NAC/AC without TC, TC without test, unknown ID; feeds `spec-traceability-matrix.md` (does not duplicate it) | specs, tests → report | .01 | BRD-039 |
| TASK-016.06 | BRD-039 report and release gate | QA | `npm run qa:brd039` (FR-016.11/12), unit tests for report logic first | tagged results → report, exit code | .05 | BRD-039 |
| TASK-016.07 | Security scenario pack S1–S8 | QA | `TC-016.01–.08` end-to-end (design 23.2) | personas → tests | .02, .03 | BRD-039 |
| TASK-016.08 | Workflow scenario pack W1–W7 | QA | `TC-016.09–.15` | .02, .03 | BRD-039, 024, 027 |
| TASK-016.09 | Vacancy scenario pack V1–V4 | QA | `TC-016.16–.19` | .02, .03 | BRD-028, 039 |
| TASK-016.10 | Integration scenario pack I1–I5 | QA | `TC-016.20–.24` using SPEC-015 harness, manual-Payroll path, fake SMTP (9.5) | harness → tests | SPEC-015 harness, SPEC-012 SMTP fake | BRD-039, NFR-006 |
| TASK-016.11 | Journey harness | QA | Role-scripted journey DSL over HTTP: `as(persona).submit(...)`, `expectStatus`, `expectNoSideEffects`; used by 12–14 | .02 | BRD-018 |
| TASK-016.12 | Happy-path journeys P01–P03 | QA | `TC-016.25–.27` | .11 | BRD-018, 027 |
| TASK-016.13 | Exception-path journeys P04–P25 | QA | `TC-016.28–.38` | .11 | BRD-027, 033, 034, 035 |
| TASK-016.14 | Matrix replay and fixture integrity | QA | `TC-016.49–.50`: replay SPEC-007 golden allowed cells over HTTP; verify fixture equals registry | SPEC-007 fixture → tests | SPEC-007 | BRD-027 |
| TASK-016.15 | Concurrency suite C-01…C-12 | QA | `TC-016.41–.48` and extras per section 17 | .02 | BRD-028, 030, 038 |
| TASK-016.16 | Notification outage and document journeys | QA | `TC-016.38–.40` (fake SMTP outage; documents E2E) | SPEC-012, SPEC-011 | BRD-036, 021 |
| TASK-016.17 | Audit completeness and integrity checks | QA | `TC-016.39, .51`: expected audit events per journey (18); run `verify:integrity` after journeys | SPEC-013, SPEC-015 | BRD-037 |
| TASK-016.18 | UI end-to-end and accessibility smoke | FE | `tests/frontend/qa-uat/`: role journeys in a browser, axe, keyboard, 768 px and 1280 px (tool per `TDD-016.02`) | frontend specs | .12 | BRD-002, NFR-008 |
| TASK-016.19 | UAT pack | QA | `docs/qa/uat/UAT-01…12.md` from section 9.6 with data sheets and result forms | 9.6 → docs | .03 | BRD UAT |
| TASK-016.20 | UAT environment and sign-off form | QA | Environment checklist, synthetic accounts, SMTP sandbox, sign-off template (`TDD-016.07`) | → docs | .19 | BRD UAT |
| TASK-016.21 | Performance prerequisites guard | QA | `qa:perf:preflight` refuses to run unless the SPEC-015 §9.6 register has numeric values with approver; unit-tested | register → guard | SPEC-015 | BRD-038 |
| TASK-016.22 | Performance workload scripts and invariants | QA | Parameterised scripts (no numbers) and post-run invariant checker (FR-016.25) | .21 | BRD-038 |
| TASK-016.23 | CI pipeline and gates | QA | Pipeline per 9.9 (`TDD-016.04`) | .05, .06 | BRD-039 |
| TASK-016.24 | CI guards | QA | No test code in production artefact; no numeric performance/escalation constants without register reference; secret scan on evidence | .23 | BRD-038, NFR-003 |
| TASK-016.25 | Acceptance and out-of-scope matrix automation | QA | `TC-016.52–.54`: AB→AC→TC check (3.5), out-of-scope verification (9.8) | .05 | BRD Acceptance, Out of Scope |
| TASK-016.26 | Pre-production validation gate | QA | PPV checklist 9.9 with evidence slots | → doc | .06, SPEC-015 | BRD-038 |
| TASK-016.27 | Release readiness checklist | QA | RR checklist 9.10, links PRG and `spec-traceability-matrix.md` | → doc | .26 | BRD-039 |
| TASK-016.28 | Defect and waiver log | QA | Template, severity per `TDD-016.06`, waiver rule | → doc | .01 | BRD-039 |
| TASK-016.29 | Evidence pack assembly | QA | Collect reports, scans, UAT record into the release evidence folder (`TDD-016.11`) | all | .27 | BRD-039 |
| TASK-016.30 | Gate 2 handoff and DoD verification | QA | Confirm section 24 and hand evidence to Gate 2 and release management | all | .29 | AGENTS.md |

---

## 9. Business Rules

### 9.1 Master test strategy and pyramid `[PROPOSED]`

| Layer | Purpose | Where | Real PostgreSQL | Primary owners |
|---|---|---|---|---|
| Unit | Pure logic: validators, policies, state tables, formulae | `tests/backend/<module>/unit` | No | Each feature spec |
| Integration (service + DB) | Transactions, constraints, triggers, indexes, rollback atomicity | `tests/backend/<module>/integration` | Yes | Each feature spec |
| API | HTTP contract: status codes, envelope, authz matrix (6 roles × endpoint) | `tests/backend/<module>/api` | Yes | Each feature spec |
| Frontend component | States (loading/empty/error/no-access), forms, dialogs, accessibility | `tests/frontend/<module>` | No | Each feature spec |
| Database | Index use, CHECK/trigger/privilege behaviour, migration up/down/up | `tests/backend/<module>/integration` | Yes | SPEC-001, 005, 006, 013 |
| Authorization/security | Role × scope × resource × action × stage; direct API; IDOR; token forgery; leak scans | `tests/backend/<module>/security` | Yes | SPEC-002 plus every spec |
| Workflow | Transition tables, registry, invalid-transition responses | `tests/backend/workflow` | Yes | SPEC-007 (matrix), others (their cells) |
| Transaction | Fault injection at each step of a multi-write operation; no partial state | `tests/backend/<module>/concurrency` | Yes | SPEC-001, 005, 007, 009 |
| Concurrency | Parallel connections, barrier, invariants | `tests/backend/<module>/concurrency`, `tests/backend/qa-uat/concurrency` | Yes | Feature specs; SPEC-016 cross-spec |
| Document security | Type/size/MIME/traversal/scope tests | `tests/backend/documents` | Yes | SPEC-011 |
| Notification failure | SMTP outage/timeout/drop; retry idempotency; no workflow effect | `tests/backend/notifications` | Yes + fake SMTP | SPEC-012 |
| Audit | Catalogue conformance, append-only, scoping, leak scan | `tests/backend/audit` | Yes | SPEC-013 |
| End-to-end (API-driven journeys) | Multi-spec journeys, BRD-039 end-to-end cases | `tests/backend/qa-uat` | Yes + fake SMTP | **SPEC-016** |
| End-to-end (UI) | Role journeys in a browser, accessibility, responsive | `tests/frontend/qa-uat` | Full stack | **SPEC-016** |
| Performance | Load/stress against confirmed targets; invariants | `tests/performance` | Pre-production | **SPEC-016** (blocked until inputs, 9.7) |
| UAT | Business acceptance by role | `docs/qa/uat` | UAT/pre-production | **SPEC-016** |

Tools `[PROPOSED]`: Jest + ts-jest + supertest (backend), Jest/Vitest + React Testing Library + jest-axe (frontend), fake SMTP (`smtp-server`/MailHog), browser E2E and load tools per `TDD-016.02`/`TDD-016.05`. Coverage: authorization and transition tables are table-driven and target full branch coverage (SPEC-010 hand-off); **no numeric coverage threshold is invented here** (`TDD-016.03`).

### 9.2 TDD RED → GREEN conventions of this repository `[DERIVED]` from constitution + `[PROPOSED]` mechanics

1. For each task, the RED commit contains tests only; the PR/commit note records the failing run and the reason (missing behaviour, not a typo).
2. GREEN makes the tests pass without weakening them; changing a test to pass requires a stated reason.
3. File naming `*.test.ts`; test title `TC-NNN.mm <description> [BRD-039:Sx]` where applicable.
4. Negative tests assert the HTTP response **and** the absence of side effects (no history, audit-except-security, outbox, reservation, status change) `[SPEC-015 §23.2]`.
5. Concurrency tests are never retried to green; a failure is a defect. Parallelism/repeat counts come from the owner spec as a floor (`TDD-016.09`).
6. `describe` blocks do not depend on execution order; each test builds its data via factories and cleans through transaction/DB reset.
7. Test cases for each spec are listed in `.ai-context/test_cases/<slug>.test_cases.md` at test-case drafting; `trace:tests` reconciles them with code.
8. No `console.log`; structured logger only; no AI-generated comments `[int-standards §1, §5]`.

### 9.3 Test environments and data `[PROPOSED]`

| Environment | Use | Data | Notes |
|---|---|---|---|
| LOCAL | Developer RED/GREEN | Factories; ephemeral `sdd_v1_test` | Guarded against production DB |
| CI | Unit/integration/API/negative/concurrency/boundary/a11y on every merge | Ephemeral PostgreSQL per run, migrations up/down/up | Fake SMTP container |
| QA | Full E2E journeys, UI E2E, BRD-039 pack, integrity | QA seed (`qa:seed`) | Fake SMTP; clock injectable |
| UAT | Business execution of `UAT-01..12` | Synthetic personas and vacancies | SMTP sandbox, never real employee mailboxes (`TDD-016.10`) |
| Pre-production | Performance, final BRD-039 run, PPV gate | Production-like volume per confirmed inputs | "Appropriate pre-production environment" definition: `TDD-015.21` |
| Production | No test execution; no QA seed | — | Environment guard (TASK-016.04) |

**Personas (fixtures; IDs follow BRD-004 formats, Receiving Manager/Super Admin prefix per `TDD-002.01`):**

| Persona | Role | Scope / state |
|---|---|---|
| SA-1 | SUPER_ADMIN | All |
| EMP-A1, EMP-A2 | EMPLOYEE | Location A, Active, complete data; same Reporting Manager |
| EMP-B1 | EMPLOYEE | Location B |
| EMP-X (incomplete) | EMPLOYEE | One mandatory field missing (BRD-029) |
| EMP-N (non-Active) | EMPLOYEE | Employment status not Active (value set `TDD-015.04`) |
| MGR-A | REPORTING_MANAGER | Assigned: EMP-A1, EMP-A2 |
| MGR-B | REPORTING_MANAGER | Assigned: EMP-B1 |
| RCV-1 | RECEIVING_MANAGER | Target department D2 (mapping default per `TDD-003`/`TDD-002.15`) |
| HR-A, HR-A2 | HR | Location A (two users for concurrency) |
| HR-B | HR | Location B |
| IT-A | IT | Location A |
| IT-B, IT-B2 | IT | Location B (two users for assignment/reassignment/concurrency) |
| USR-LOCKED, USR-DEACT, USR-RESET | any | Locked / deactivated / reset-target accounts |

**Vacancies:** `VAC-LAST` (capacity 5, filled 3, one active reservation → available 1, the BRD-028 example), `VAC-MANY` (capacity 10, Open), `VAC-FULL`, `VAC-HOLD`, `VAC-CLOSED`, `VAC-B` (Location B target). Employees reach targets through **master data only**, never free text.

### 9.4 BRD-039 mandatory-scenario rules `[BRD-039]`

| Rule | Statement |
|---|---|
| R-39.1 | All 24 scenarios are mandatory QA/UAT acceptance criteria and validated before production |
| R-39.2 | Any failed mandatory scenario must be resolved (fix + re-test + report row `PASSED`) before production deployment |
| R-39.3 | The BRD-039 report is part of PRG-02; a non-zero exit blocks the release |
| R-39.4 | A scenario passes only if its end-to-end case and **all** mapped owning-spec tests pass in the same release candidate build |
| R-39.5 | Scenario results are recorded per environment (CI, QA, UAT/pre-production); the pre-production run is the one used for go-live |

### 9.5 Integration scenarios I1–I5: current-phase validation approach `[TDD-REQUIRED]` (`TDD-016.01`, cross-ref `TDD-015.01`)

No external Payroll/HR integration exists (BRD Integration Requirements); Payroll is completed manually by an authorised HR user (BRD-027(c)); the only real external call is e-mail (BRD-OQ-03). **Recommended default `[PROPOSED]` (Option A, three prongs, all required):**

| Prong | What is exercised | Evidence source |
|---|---|---|
| A1 contract-level harness | Test-only fake adapter behind the type-only `PayrollPort`/`EmployeeMasterPort` with fault injection: timeout, timeout-then-late-success, 5xx, duplicate delivery, drop. Verifies NFR-006 rules the future contract must satisfy (idempotency key per business operation, visible failure, authorised retry, task/transfer never Completed on failure, controlled bounded retry) | SPEC-015 TC-015.35–.46, TC-015.106–.110 |
| A2 manual-Payroll path | Real application path: Payroll completion is a single authenticated HR action. Tests: double mark, concurrent mark, fault injection mid-transaction, no callback/webhook route, no outbound HTTP call, IT Final Approval refused while Payroll incomplete | SPEC-015 TC-015.47–.52; SPEC-009 NAC01–02, NAC06–07, NAC29–30 |
| A3 SMTP dependency | Real external dependency: fake SMTP with timeout, drop-after-DATA, 4xx/5xx; outbox retry idempotency; no duplicate workflow row/transition; bounded retry; task/transfer status never changed by delivery outcome | SPEC-012 NAC05–NAC09, TC-012.38–.40 |

Per-scenario pass criteria (`TC-016.20–.24`): **I1** timeout produces zero duplicate downstream effect across A1/A2/A3 (counts of history, assignments, payroll activity rows, deliveries unchanged on retry); **I2** failures are retried only through the bounded policy or an authorised manual retry, never unbounded; **I3** a failed attempt leaves the task state not Completed; **I4** a failed attempt leaves the transfer status unchanged (never Completed); **I5** repeated delivery/late success yields exactly one effect under the idempotency key.
**Alternatives for Gate 1:** Option B mark the five rows "Not applicable in the current phase" with Project Manager sign-off recorded in the report; A2 and A3 still run because they exercise real behaviour. Option C build a stub integration is **not recommended** (introduces an unapproved integration, out of scope). Whichever option is approved is recorded in the report header; **the recorded decision, not the default, governs release.**

### 9.6 UAT scenario pack `[BRD Acceptance Criteria: UAT]`

**Conventions.** Each script lists actors, preconditions (persona/vacancy data from 9.3), numbered steps and checks. "Notify" lines assume the UAT SMTP sandbox; where e-mail is observed, In-app is checked in the same step for workflow events (Email + In-app) and **Email only** for account creation/reset `[BRD-036]`. Every state-changing step is also checked against the audit log by the QA observer (SPEC-013 viewer, Super Admin). Exit for each script: all steps `Pass`; any `Fail` raises a defect (`TASK-016.28`). Sign-off: `TDD-016.07`.

**UAT-01 Account creation and login** — Actors: Super Admin, new user (Employee, then Reporting Manager, HR, IT).
1. Given SA-1 is logged in, When they create an Employee (role selected, profile entered, Department/Designation/Location chosen from master lists), Then a dialog shows `EMP` + 6 digits and a temporary password **once**, an Email-only credential message is queued, a creation audit row exists with no password. `[BRD-004/005/009/036]`
2. When SA-1 closes the dialog (explicit acknowledge) and reloads the user, Then credentials are not retrievable.
3. Given the new user, When they log in with the User ID and temporary password, Then they land on change-password and cannot reach any other page or API (direct URL attempt returns the no-access/redirect). `[BRD-006]`
4. When they enter a 7-character password, Then each unmet rule is shown; When they enter a compliant 8+ character password, Then access is granted and the temporary password no longer works.
5. Repeat 1–4 for Reporting Manager (`MGR`), HR (`HR`), IT (`IT`); duplicate Employee ID/e-mail is refused.
6. Given a throwaway account, When 5 consecutive wrong passwords are submitted, Then the account is locked and the correct password is refused; SA-1 unlocks; login succeeds.
7. Given a locked account left untouched, When 30 minutes pass (real time, once), Then login succeeds without admin action.
8. Given an active session, When 30 minutes pass without activity, Then the next action returns the user to login with a session-expired message.
9. Given a deactivated user, When they try to log in or reuse an open session, Then access is refused.

**UAT-02 Credential reset** — Actors: Super Admin, Employee (USR-RESET).
1. Given USR-RESET has an open session, When SA-1 confirms the reset dialog (names user and consequence), Then a new temporary password is shown once and sent by Email only.
2. Then the open session fails on the next call, the old password is refused, and the new temporary password forces the change-password flow.
3. Then the audit shows the reset and role/actor, and no password text.

**UAT-03 Approval** — Actors: EMP-A1, MGR-A, RCV-1, HR-A, QA observer. Receiving Manager enabled; `VAC-MANY`.
1. EMP-A1 starts a transfer from the vacancy list (Open vacancies only), selects target masters, a date within today..+30 (a weekend is accepted), submits; Then a unique reference is shown, status Pending Reporting Manager Approval, MGR-A notified, no reservation exists.
2. MGR-A reviews and approves; Then status Pending Receiving Manager Approval, RCV-1 notified, no reservation.
3. RCV-1 approves; Then status Pending HR Review, HR-A notified, no reservation.
4. HR-A revalidates, confirms eligibility and Validate & Approve; Then status HR Processing, capacity reserved, EMP-A1 notified, reservation visible to HR/Super Admin.
5. EMP-A1 tracks the timeline: stages, pending owner, decisions. Repeat with Receiving Manager disabled (Reporting Manager approval goes straight to HR).

**UAT-04 Rejection** — Actors: EMP-A1, MGR-A, HR-A.
1. MGR-A tries Reject with a blank reason; Then refused. With a reason; Then status Rejected, EMP-A1 notified with the reason, no reservation.
2. EMP-A1 attempts to edit/resubmit the rejected request; Then refused; EMP-A1 submits a new request; Then a new reference and a restarted workflow, no earlier approvals reused.
3. Given a request already reserved, When HR-A rejects (not eligible) with a reason, Then Rejected, reservation released, no Payroll/IT record.

**UAT-05 Clarification** — Actors: HR-A, EMP-A1 (and MGR-A).
1. HR-A requests clarification with a question; Then status Info Required, EMP-A1 notified, reservation (if any) retained.
2. EMP-A1 responds under the same reference; Then the request returns to Pending HR Review with the same HR owner and unchanged approvals.
3. Repeat a second cycle; Then both cycles appear with requested by, question, response, responded by, date/time in the history.
4. Repeat from MGR-A (Pending Reporting Manager Approval) and verify return to the same reviewer.

**UAT-06 Capacity constraints** — Actors: SA-1, EMP-A1, EMP-A2, HR-A, HR-A2.
1. Employees cannot list or select `VAC-FULL`, `VAC-HOLD`, `VAC-CLOSED`; a direct submission against them is refused with a validation message and no reservation.
2. Given `VAC-LAST` (available 1) and two requests at Pending HR Review, When HR-A and HR-A2 approve at the same moment, Then exactly one is approved and the other sees the capacity-unavailable message; counts show reserved + filled ≤ capacity.
3. SA-1 or in-scope HR releases an in-flight reservation with a mandatory reason; Then it is audited; Reporting Manager/Employee/IT cannot.
4. SA-1 sets the vacancy to Closed while a request is Blocked; Then the reservation is retained and Resume is refused until reopened or changed.

**UAT-07 Organisation-metadata change re-approval** — Actors: HR-A, RCV-1, EMP-A1.
1. At HR Processing (Receiving Manager enabled), HR-A changes the Department with a reason; Then status Pending Receiving Manager Re-Approval and RCV-1 sees previous and new values and the reason.
2. RCV-1 approves; Then HR Processing, existing reservation retained, HR must reconfirm activities; audit shows field, previous/new, changed by, reason, re-approval triggered, decision.
3. Repeat for Designation, Location, Reporting Manager; HR cannot skip re-approval.
4. With Receiving Manager disabled, the same change continues in HR Processing with no re-approval.
5. RCV-1 rejects with a reason in another run; Then Rejected and the reservation released.

**UAT-08 Reassignment** — Actors: SA-1, HR-A, IT-B, IT-B2, MGR-A.
1. SA-1 reassigns the pending IT task from IT-B to IT-B2 with a reason; Then status unchanged, IT-B2 notified, IT-B can still read history but cannot act; completed approvals remain.
2. HR-A attempts reassignment; Then refused (403) and audited. Repeat for Reporting Manager, Receiving Manager and a Draft/final request (refused).
3. SA-1 reassigns a Reporting Manager task; the new assignee must still decide; no approval is skipped.

**UAT-09 Document handling** — Actors: HR-A, HR-B, IT-B, EMP-A1, SA-1.
1. HR-A uploads a valid PDF and PNG to an in-scope transfer with category; Then metadata (category, uploader, time, employee/transfer reference) is shown and an audit row exists.
2. A file of 5 MB + 1 byte shows the 413 message; an `.exe` shows the unsupported-type message; a renamed file with mismatched type shows the invalid-file-type message; nothing is stored.
3. HR-B (another location) cannot list or download; EMP-A1 sees only documents flagged for them.
4. IT-B with an assigned task sees only the evidence-flagged document; after reassignment away, access is refused; document URLs cannot be opened without login.

**UAT-10 IT "No Action Required" completion** — Actors: HR-A, IT-B.
1. After Payroll is marked complete (UAT-12 step 3), IT-B opens the task and selects No IT Action Required with a reason; Then status Pending IT Final Approval; no IT task needed.
2. IT-B gives Final Approval; Then Completed (Section UAT-12 checks). Also verify the reason is mandatory.

**UAT-11 Integration failure** — Actors: SA-1, HR-A, QA observer, Technical Lead.
1. With the SMTP sandbox set to refuse connections, HR-A approves a request; Then the approval succeeds and is recorded; SA-1 sees a FAILED delivery with the error and attempt count.
2. When SMTP is restored and SA-1 retries once, Then exactly one delivery is sent and the workflow history is unchanged.
3. The QA observer demonstrates the harness outcomes for I1–I5 (timeout, retry, task not Completed, transfer not Completed, idempotent retry) and the manual-Payroll evidence; business observers confirm understanding of the approved option (`TDD-016.01`).
4. Any call to a payroll callback route returns not found and changes nothing.

**UAT-12 Final completion** — Actors: HR-A, IT-B, EMP-A1.
1. HR-A completes mandatory HR activities and **Complete HR Processing**; Then Payroll Processing, Payroll task notification.
2. IT attempts Final Approval at this stage; Then refused.
3. HR-A marks Payroll completed (reference, remarks); Then Pending IT Action, IT-B notified, task created.
4. IT-B completes tasks (or UAT-10 path) and gives Final Approval; Then Completed, vacancy reservation becomes final allocation, EMP-A1 and stakeholders notified (Email + In-app), the timeline shows completion date.
5. No role can modify the Completed request through the workflow; EMP-A1 can submit a new request immediately (no cool-down).
6. Variant: effective date expired before final approval; Then Final Approval refused until HR (HR-controlled stage) or SA-1 (IT stages) corrects it within the window.

### 9.7 Performance test plan prerequisites `[BRD-038]` — no invented numbers

| Prerequisite | Source | State |
|---|---|---|
| Expected concurrent users | BRD-038 "to be confirmed" (performance/capacity planning) | **Empty — blocks execution** |
| Expected transaction volume | BRD-038 TBC | **Empty — blocks execution** |
| API response-time target | BRD-038 TBC (performance testing) | **Empty — defines pass/fail** |
| Page response-time target | BRD-038 TBC | **Empty — defines pass/fail** |
| API timeout | BRD-038 TBC (technical/infrastructure planning) | **Empty — production config** |
| Integration timeout | Per integration before implementation; none this phase | n/a now |
| Maximum upload size | **5 MB per file** `[BRD-021/038]` (fixed) | Known; boundary tested (SPEC-011, SPEC-015) |
| Pre-production environment definition | `TDD-015.21` | Must exist |
| Input owners and approver | SPEC-015 §9.6 / `TDD-015.20` | Must be named |

Plan once inputs are confirmed: workload candidates (weights derived from confirmed volume, not guessed) are login, worklist/dashboard reads, transfer submit, HR approve with reservation, document upload up to 5 MB, audit list/filter, report generation. Test kinds `[PROPOSED]`: baseline, load at confirmed concurrency, stress above it, soak; shapes via `TDD-016.05`. **Correctness invariants hold after every run (no thresholds needed):** CHK-01..14 clean, no second active transfer, no negative or over-committed capacity, no partial transaction, no duplicate outbox delivery. `qa:perf:preflight` fails with a message naming each empty input; a CI grep guard fails if a numeric performance or timeout constant is committed without a register reference.

### 9.8 Out-of-scope validation matrix — how it is verified that no spec introduces each exclusion

| # | BRD exclusion (Out of Scope or other BRD "not in this phase") | Verification | Evidence |
|---|---|---|---|
| OS-01 | Redesign/replacement of HR, payroll or ITSM platforms | No adapter, port implementation or integration table exists in `backend/src`; outbound-call guard | SPEC-015 TC-015.35–.46, `check:boundaries` (SPEC-001.AC26) |
| OS-02 | Facilities/Admin role and task execution | Role enum is exactly six values; no facilities module/route/table; route inventory contains no facilities path | SPEC-002 TC-002.17; `TC-016.52` |
| OS-03 | New payroll calculation engine, identity provider, enterprise master-data platform | Schema/route scan: no salary/compensation columns, no OIDC/SAML dependency, no payroll-calculation route | `TC-016.52`; SPEC-001.AC26 |
| OS-04 | Automatic HR-system integration/sync (real-time, scheduled, callback) and updates to an external HR master | No scheduler/job for sync; HR change makes no outbound call; no webhook route | SPEC-015 AC06, AC07, NAC04–05; SPEC-008 NAC24 |
| OS-05 | External recruitment, cross-company transfer, immigration/relocation benefits | Transfer schema has only internal master references; route inventory has none of these capabilities | `TC-016.52`; SPEC-006 master-data validation |
| OS-06 | Historical data migration, bulk backfill, unapproved custom integrations | Migrations folder contains schema and test-guarded seeders only; no import route; `check:boundaries` | `TC-016.53` |
| OS-07 | Advanced workforce planning / predictive vacancy forecasting | Report catalogue (SPEC-014 `REPORT_POLICY`) lists only BRD-023 reports; no forecasting endpoint | SPEC-014 TC-014.09; `TC-016.53` |
| OS-08 | MFA/SSO `[BRD-025]` | No MFA/SSO dependency; login only by User ID + password | SPEC-001.AC26 |
| OS-09 | Malware scanning, retention, archive, deletion policy for documents `[BRD-021, OQ-08]` | No delete route (405), no scanner dependency, no retention job | SPEC-011 NAC19–20, AC20 |
| OS-10 | Other HR eligibility restrictions (tenure, probation, disciplinary, notice, performance) `[BRD-029]` | Rule list asserted exact; no such field/rule | SPEC-006 TC-006.07; SPEC-008 NAC23 |
| OS-11 | Cool-down after Completed `[BRD-030]` | New request accepted immediately after Completed | SPEC-006.AC17; `TC-016.35` |
| OS-12 | Payroll API/callback; payroll calculation `[BRD-027(c)]` | No payroll callback route (404); manual completion only | SPEC-009 NAC01, AC05 |
| OS-13 | Invented escalation timings `[BRD-023]` | Migration test: no numeric escalation default; unset means "not configured" | SPEC-014 TC-014.27, NAC11 |
| OS-14 | Numeric infrastructure targets (availability, backup, monitoring) `[NFR-009]` | Register shows no invented value; CI grep guard | SPEC-015 AC34; `TC-016.54` |

### 9.9 Pre-production validation gate (PPV) and CI gates `[PROPOSED]`

**CI gates (merge-blocking; platform per `TDD-016.04`):** (1) lint + INT standards checks (no `console.log`, no raw promise chains, no `eval`), (2) typecheck, (3) unit, (4) integration/API/security on real PostgreSQL, (5) migrations up/down/up, (6) `check:boundaries` and outbound-call guard, (7) negative pack (`qa:brd039` automated subset) and concurrency suite, (8) secret and credential-leak scan on logs, DB and artefacts, (9) dependency audit per `TDD-015.12`, (10) accessibility (axe) on UI changes, (11) `trace:tests`, (12) no test-only code in production build. Gates 7 and 11 are the BRD-039 and traceability enforcers.

**Pre-production validation gate (executed in the pre-production environment on the release-candidate build):**

| ID | Check | Evidence |
|---|---|---|
| PPV-01 | Release candidate deployed from tagged build; migrations applied clean (PRG-23) | Migration log |
| PPV-02 | `qa:brd039` run: 24/24 `PASSED` | Report |
| PPV-03 | Integration approach (`TDD-016.01`) executed and recorded | Report header |
| PPV-04 | `verify:integrity` returns no violations after journeys (PRG-12) | JSON report |
| PPV-05 | TLS/transport verified (PRG-08) | Scan output |
| PPV-06 | Full E2E journeys P01–P25 pass; concurrency suite passes | Test report |
| PPV-07 | UAT `UAT-01..12` executed, all `Pass`, sign-off (PRG-24) | UAT record |
| PPV-08 | Performance executed against confirmed inputs and targets, or gate marked **BLOCKED** if inputs are missing (PRG-04, PRG-05) | Report / blocker |
| PPV-09 | Infrastructure items INF-01..16 confirmed (backup/restore rehearsal, monitoring, alerts) (PRG-16..18) | SPEC-015 evidence |
| PPV-10 | No test accounts/QA seed/seeded default passwords left (PRG-19) | Checklist |
| PPV-11 | Credential/log leak scan on pre-production logs and audit table (PRG-13) | Scan |
| PPV-12 | No open defect against any mandatory scenario (FR-016.27) | Defect log |

### 9.10 Release readiness checklist (RR)

| ID | Item | Source |
|---|---|---|
| RR-01 | All 16 specs Gate 2 approved; no Rejected/Changes Requested open (PRG-01) | Review records |
| RR-02 | BRD-039 24/24 passed in pre-production (PRG-02, R-39.5) | Report |
| RR-03 | Acceptance matrix 3.5: every AB row has passing TCs (AC26) | `trace:tests` |
| RR-04 | `spec-traceability-matrix.md` complete: every BRD ID → SPEC → TASK → TC | Artefact |
| RR-05 | All `TDD-NNN.NN` decisions across SPEC-001…016 closed or accepted at Gate 1 (PRG-21) | Decision log |
| RR-06 | UAT sign-off recorded by the authority per `TDD-016.07` (PRG-24) | UAT record |
| RR-07 | Performance validated, or release blocked (PRG-04/05) | Report |
| RR-08 | Out-of-scope matrix 9.8 verified (AC27) | Report |
| RR-09 | `status.md`, dashboard, PR review records and `prompt_history.md` synchronised | AGENTS.md |
| RR-10 | Release notes, version tag, rollback plan prepared (PRG-22) | `int-release-management` |
| RR-11 | Defect log clean; waivers (if any) approved per `TDD-016.12` | Defect log |
| RR-12 | Evidence pack assembled and retained (`TDD-016.11`) | Evidence folder |

---

## 10. Data Model & Database

**Not applicable — no production tables, columns or migrations are created by this SPEC.** Test-support data only:

| Artefact | Location | Notes |
|---|---|---|
| QA seed (personas, vacancies) | `tests/backend/_shared/seeds/` | Test tree only; refuses production; passwords from env |
| Test results/evidence | `docs/qa/evidence/<release>/` (default, `TDD-016.11`) | Not stored in the application DB; no secrets |
| Scenario report | JSON + Markdown (FR-016.11) | One row per BRD-039 scenario |
| Integrity checks | `verify:integrity` (SPEC-015) reads application tables read-only | Used after journeys and performance runs |

## 11. Backend Implementation

Test-side only (`tests/backend/_shared/qa/`, `tests/backend/qa-uat/`, `scripts/qa/`).

| Component | Responsibility |
|---|---|
| `ApiActor` | Logs in a persona via `/api/v1/auth/login`, holds the token, issues requests; exposes raw response for negative assertions |
| `Barrier` | Releases N async callers simultaneously for concurrency tests (Node `Promise.all` after a latch) |
| `SideEffectSnapshot` | Counts `transfer_workflow_history`, `audit_logs`, `notification_outbox`, `vacancy_reservations`, `transfer_task_assignments` and status before/after an attempt to prove "no side effects" |
| `ClockControl` | Injectable clock for idle/lock/date rules |
| `Brd039Reporter` | Collects tagged results into the 24-row report; exits non-zero on any non-`PASSED` row |
| `TraceChecker` | Cross-checks spec IDs against test titles (FR-016.01, TASK-016.05) |
| `PerfPreflight` | Verifies BRD-038 inputs present (FR-016.24) |

Logging: structured logger only; secrets redacted; no `console.log` `[int-standards §2]`. Async/await with `try/catch` in all helpers.

## 12. API Requirements

**Not applicable — this SPEC adds no product API.** Constraints on testing the APIs of other specs:
- Tests use only the public `/api/v1` routes and, for seeding, direct DB access in the test tree.
- **No test-only HTTP endpoint** (reset, impersonate, time-travel) may exist in the application; a route-inventory test fails if one is found (`NAC05`).
- Clock control and fault injection are applied through the injectable clock, fake SMTP and the harness, never via a production-reachable route.

## 13. Frontend Implementation

UI test slice only (`tests/frontend/qa-uat/`): browser journeys per role (UAT-01…12 subset), accessibility (axe, keyboard-only), responsive at 768 px and 1280 px (BRD-002), loading/empty/error/no-access states on primary pages, and "UI hiding is not security" checks (the same action called directly must be denied by the backend). Tool and browser matrix: `TDD-016.02`, `TDD-016.13`.

## 14. Validation Rules

| Subject | Rule |
|---|---|
| Report integrity | 24 rows exactly, IDs S1–S8, W1–W7, V1–V4, I1–I5; each row has ≥ 1 owning-spec TC **and** its `TC-016` case |
| Tag syntax | `[BRD-039:<id>]` where id ∈ the 24 IDs; unknown tag fails |
| Traceability | Every `SPEC-NNN.NACmm`/`ACmm` has at least one TC; every `TC-NNN.mm` referenced exists in a test |
| Environment | `qa:seed`, E2E and performance runners refuse a production host/DB name |
| Perf preflight | All BRD-038 TBC inputs numeric with approver; otherwise exit non-zero |
| UAT record | Each step has Pass/Fail, tester, date/time, evidence reference |
| Test data | No real e-mail domain outside the sandbox; no committed passwords |

## 15. Authorization & Security Rules

- Test personas are the **only** accounts used; no shared admin credential is committed. Fixture passwords come from environment variables and satisfy BRD-025 complexity.
- Tests assert the BRD-026 chain `Authenticated User → Role → Organisation Scope → Resource → Action` using wrong-role, out-of-scope-ID, wrong-stage and forged-claim requests (S1, S2, S8, W1).
- Evidence and reports must not contain passwords, tokens, hashes or personal data beyond synthetic fixtures; a scan runs on every evidence pack (`NAC14`).
- Production credentials, hosts and data are never used by tests (`NAC11`, `NAC15`).
- 403 vs 404 policy for out-of-scope IDs follows `TDD-002.11`/`TDD-015.11`; the tests assert the decided policy and that the response body leaks nothing.

## 16. Workflow / State Transition Rules

### 16.1 Transition matrix ownership

The complete matrix (statuses × roles × actions, golden fixture) is **owned by SPEC-007** (`TC-007.10–.12`; at authoring 15 statuses × 6 roles × 19 actions = 1,710 cells with 78 allowed; the fixture is authoritative if reconciliation changes counts). SPEC-016 does not define cells. It adds `TC-016.49` (replay every allowed cell over HTTP against the real stack, comparing resulting status, history, audit, outbox, vacancy effect to the fixture) and `TC-016.50` (fixture integrity: registry and fixture agree, no extra path to `COMPLETED`).

### 16.2 End-to-end path catalogue (happy path and every exception path)

Status codes per contract §2. "RM" = Receiving Manager stage enabled. Each path is one `TC-016` case (section 23.3).

| Path | Route | Actors | Key assertions | TC |
|---|---|---|---|---|
| P01 Happy, RM enabled | DRAFT → PENDING_REPORTING_MANAGER_APPROVAL → PENDING_RECEIVING_MANAGER_APPROVAL → PENDING_HR_REVIEW → HR_PROCESSING → PAYROLL_PROCESSING → PENDING_IT_ACTION → PENDING_IT_FINAL_APPROVAL → COMPLETED | EMP-A1, MGR-A, RCV-1, HR-A, IT-B | Reservation only at HR approve; allocation at completion; notifications; audit per step | TC-016.25 |
| P02 Happy, RM disabled | … PRM → PENDING_HR_REVIEW … | + | Receiving Manager stage skipped | TC-016.26 |
| P03 IT No Action Required | … PENDING_IT_ACTION → (No IT Action Required, reason) → PENDING_IT_FINAL_APPROVAL → COMPLETED | + | Final Approval still mandatory | TC-016.27 |
| P04–P07 Rejections | Reject at RM-stage manager, Receiving Manager, HR (ineligible), Receiving Manager re-approval | managers, HR | Reason mandatory; Rejected final; reservation released; no Payroll/IT | TC-016.28 |
| P08–P11 Clarifications | Info Required from Reporting Manager, Receiving Manager, HR, Receiving Manager during re-approval `[DERIVED, contract §5(l)]` | + EMP-A1 | Return to same stage/reviewer; ≥ 2 cycles; approvals retained | TC-016.29 |
| P12–P13 Re-approval | HR changes four fields (RM enabled → loop to HR_PROCESSING; RM disabled → no loop) | HR-A, RCV-1 | Activities reset; reservation retained | TC-016.30 |
| P14 Withdraw | From PRM, PRcvM, INFO_REQUIRED, PENDING_HR_REVIEW; refused later | EMP-A1 | Reason mandatory; final; exceptional reservation released | TC-016.31 |
| P15–P16 Block/Resume | HR-stage and IT-stage blocks; cross-resume refused | SA-1, HR-A, IT-B | Previous status stored; reservation retained; revalidation | TC-016.32 |
| P17–P18 Cancel | HR cancel in its three stages and HR-blocked; IT-blocked refused; SA any | SA-1, HR-A | Reservation released; Payroll/IT tasks cancelled | TC-016.33 |
| P19 Reassign | Each of the four task kinds; non-SA refused | SA-1 | Status unchanged; old assignee read-only | TC-016.34 |
| P20–P21 Effective date | Out-of-range refused; expired date corrected by HR / SA; date-change re-approval toggle | EMP-A1, HR-A, SA-1 | Window, audit, completion block | TC-016.37 |
| P22 Vacancy change / eligibility | HR changes vacancy atomically; failure leaves original; missing-data and non-Active submission refused | HR-A, EMP-X, EMP-N | No reservation on refusal | TC-016.36 |
| P23 Reapply | New request after Completed, Rejected, Withdrawn, Cancelled | EMP-A1 | New reference; no approvals copied; no cool-down | TC-016.35 |
| P24 Notification outage | SMTP down across a full journey | all | Journey completes; failures logged; retry once | TC-016.38 |
| P25 Vacancy edge | Closed/On Hold/Full during Blocked; Resume rules | SA-1, HR-A | Reservation retained; Resume refused for Closed/On Hold | TC-016.32 |

## 17. Transaction & Concurrency Rules

### 17.1 Rules for every concurrency test `[PROPOSED]`

Real PostgreSQL, separate connections and sessions; start barrier; assert HTTP outcomes **and** DB state **and** no side effects for losers; never retried to green; no sleeps for ordering; deadlock/serialization errors (`40P01`/`40001`) must be absorbed by the product's documented retry, never surfaced as 500; invariants CHK-01..14 run after each test; repetition counts per `TDD-016.09` with the owner spec's counts as the floor.

### 17.2 Designs

| ID | Scenario | Setup | Action | Expected |
|---|---|---|---|---|
| C-01 | **Two HR approvals for the last slot** `[BRD-028, V2]` | `VAC-LAST` available 1; EMP-A1 and EMP-A2 each at PENDING_HR_REVIEW; HR-A and HR-A2 | Both Validate & Approve at the barrier | Exactly one 200 (HR_PROCESSING, reservation ACTIVE) and one 409 `VACANCY_CAPACITY_UNAVAILABLE` (still PENDING_HR_REVIEW, no history/outbox); reserved + filled = capacity; available ≥ 0; variant N = 20 callers; variant HR change-vacancy vs approval |
| C-02 | **Simultaneous submissions** `[BRD-030]` | EMP-A1 with one valid Draft | 20 parallel Submit of the same Draft; separately create-Draft vs Submit; raw SQL second active insert | One 200, nineteen 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`; one active row; partial unique index rejects SQL insert; different employees submitting to the same vacancy all succeed with unique references and no reservation |
| C-03 | **Double-submit (double click)** `[NFR-006, BRD-038]` | One request per action under test | Same action twice at the barrier for: Reporting Manager approve, HR approve, Withdraw, Mark Payroll Completed, IT Final Approval, Reject | One effect; second refused (`INVALID_WORKFLOW_TRANSITION` or conflict per owner spec); no duplicate history, audit, outbox, assignment |
| C-04 | **Parallel resume** `[BRD-OQ-15(a)]` | Request Blocked from an HR stage with a valid reservation | SA-1 and HR-A Resume simultaneously; Resume vs vacancy → Closed | One resume wins, returns to stored stage; loser refused; one revalidation outcome; for the vacancy race, the final state is consistent (resumed on a valid reservation, or Blocked with failure) |
| C-05 | Withdraw vs HR approve | Request at PENDING_HR_REVIEW | Both at the barrier | One wins; if Withdraw wins, no reservation exists; if HR approve wins, Withdraw is refused (`SPEC-010 NAC28`) |
| C-06 | Block/Cancel vs approve | Request in an HR stage | Block (or Cancel) and the stage's approval | Single winner; Cancelled releases reservation once |
| C-07 | Two Final Approvals / Final Approval vs date correction | PENDING_IT_FINAL_APPROVAL | Two IT users; or approval vs Super Admin date correction | Exactly one completion; allocation once; no double finalisation (`SPEC-009 NAC30`) |
| C-08 | Reassign vs action; two reassigns | Open task | Reassign and the old assignee's action; two Super Admin reassigns | Consistent single assignee; old assignee refused after commit |
| C-09 | Authentication races | Account at attempt 4; reset/deactivation in flight | 10 parallel wrong passwords; login vs reset; login vs deactivation | One lock event; no live session survives reset/deactivation (`TC-002.27–.29`) |
| C-10 | Notification worker vs manual retry | FAILED delivery | Two workers; admin retry vs worker claim | Delivered once; workflow rows unchanged (`TC-012.31–.33`) |
| C-11 | Parallel document uploads and finalisation | Request near completion | Uploads while transfer is finalised | No partial rows; late upload refused (`TC-011.32, .35`) |
| C-12 | Mixed random workload | Seeded population | Random approve/reject/withdraw/block/resume/cancel/reassign with fixed seed and logged order | Invariants CHK-01..14 clean; reproducible by seed |

## 18. Audit Requirements

This SPEC emits **no audit event**. It verifies the events emitted by others (catalogue owner SPEC-013) after each journey (`TC-016.39`):

| Journey / scenario | Audit events verified (codes per SPEC-013 catalogue) | BRD |
|---|---|---|
| Account creation, first login, reset, deactivate, lock/unlock | user lifecycle, password change, credential reset, login failure, lock/unlock; none contains credentials | BRD-008, 037 |
| Submit, approve, reject, clarify, respond, withdraw | Workflow transition with previous/next status, reason, actor, role | BRD-022, 037 |
| HR approve/reject, org change, date change, vacancy change, manual release | HR validation, org/date change with previous/new/changed by/reason/re-approval flag, vacancy release/reserve | BRD-020, 024, 031, 032 |
| Payroll complete, IT outcome, IT Final Approval | Completion events | BRD-026 |
| Block, resume, cancel, reassign | Previous/new status, reason, assignees | BRD-027, 035 |
| Document upload/view/download/denial | Document events | BRD-021 |
| Invalid transition, authorization denial | Security events with outcome `DENIED` | BRD-026, 027, 037 |
| Audit export | Request/complete events; non-SA refused | BRD-037 |
| Notification failure | Delivery-failure event; no credential/body | BRD-036 |

Assertions: one row per action, append-only (earlier rows byte-identical), no credential patterns, scoped visibility per role.

## 19. Notification Requirements

This SPEC triggers no notification. It verifies the twelve mandatory events and failure behaviour in journeys and UAT (catalogue owner SPEC-012):

| Event | Recipient | Channel | Verifying task / scenario | BRD |
|---|---|---|---|---|
| User account created | New User | Email only | UAT-01, TASK-016.16 | BRD-036 |
| Credential/password reset | User | Email only | UAT-02 | BRD-036 |
| Transfer submitted | Employee | Email + In-app | P01, UAT-03 | BRD-036 |
| Approval required | Assigned Approver | Email + In-app | P01–P03, UAT-03 | BRD-036 |
| Clarification requested | Employee / responsible user | Email + In-app | P08–P11, UAT-05 | BRD-036 |
| Approval completed | Employee | Email + In-app | P01, UAT-03 | BRD-036 |
| Transfer rejected (with reason) | Employee | Email + In-app | P04–P07, UAT-04 | BRD-036 |
| HR action required | Assigned HR | Email + In-app | P01 | BRD-036 |
| Payroll task assigned | Authorised HR | Email + In-app | UAT-12 | BRD-036 |
| IT task assigned | Assigned IT user | Email + In-app | UAT-12, UAT-08 | BRD-036 |
| Task blocked (with reason) | Employee and relevant assigned users | Email + In-app | P15 | BRD-036 |
| Transfer completed | Employee and relevant stakeholders | Email + In-app | UAT-12 | BRD-036 |

Failure behaviour (P24, UAT-11): the action stays committed, the failure is logged and visible, retry delivers once without repeating the transaction.

## 20. Error & Edge Cases

| Case | Handling |
|---|---|
| A scenario row has no mapped test | Report fails (`NAC02`); not "skipped" |
| A mapped owning-spec test was renumbered by reconciliation | `trace:tests` fails on the unknown ID; mapping tables in 3.6 are regenerated from IDs |
| Integration Option B approved | Rows reported "Not applicable (approved by …)"; A2/A3 still run |
| Flaky concurrency failure | Defect, not retried to green (9.2 rule 5) |
| BRD-038 inputs missing | Performance gate **BLOCKED**, release blocked (PRG-04/05); no defaults |
| UAT step needs real time (30-min lock/idle) | Observed once in UAT; automated clock-controlled tests cover the rest |
| SMTP sandbox unavailable in UAT | UAT-11 and notification steps blocked, not passed |
| Environment points at production | Runner aborts (`NAC11`) |
| Counts in other specs change (1,710 cells, 78 allowed, NAC totals) | Fixtures and spec text are authoritative; this spec quotes counts "at authoring" |
| BRD gap: no BRD-015 | Not a defect; tooling whitelists the gap |

---

## 21. Acceptance Criteria

| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-016.AC01 | Given SPEC-001…015, When `trace:tests` runs, Then every AC, NAC and TC ID resolves to a test and none is orphaned | BRD-039 `[PROPOSED]` |
| SPEC-016.AC02 | Given any task of any spec, When it is delivered, Then RED evidence (failing for the right reason) preceded GREEN and tests are under `tests/backend` or `tests/frontend` | constitution |
| SPEC-016.AC03 | Given a pull request, When CI runs, Then gates 1–12 (9.9) run and any failure blocks the merge | BRD-039 `[PROPOSED]` |
| SPEC-016.AC04 | Given the QA environment, When `qa:seed` runs, Then personas and vacancies of 9.3 exist, no password is committed, and the seed refuses production | BRD-005/006 |
| SPEC-016.AC05 | Given the BRD-039 report, When generated, Then it has exactly 24 rows (S1–S8, W1–W7, V1–V4, I1–I5), each with owning-spec TCs and `TC-016.01–.24` | BRD-039 |
| SPEC-016.AC06 | Given any row not `PASSED`, When `qa:brd039` completes, Then it exits non-zero and the release is blocked (PRG-02) | BRD-039 |
| SPEC-016.AC07 | Given the Security scenarios S1–S8, When `TC-016.01–.08` run on the real stack, Then each passes, with HTTP result and no side effects asserted | BRD-039, BRD-025/026 |
| SPEC-016.AC08 | Given the Workflow scenarios W1–W7, When `TC-016.09–.15` run, Then each passes, including re-approval and Receiving Manager non-bypass | BRD-039, 024, 027 |
| SPEC-016.AC09 | Given the Vacancy scenarios V1–V4, When `TC-016.16–.19` run (including C-01), Then capacity is never exceeded or negative and releases occur | BRD-039, 028 |
| SPEC-016.AC10 | Given the Integration scenarios I1–I5, When `TC-016.20–.24` run via the approved approach, Then each passes per 9.5 criteria | BRD-039, NFR-006 |
| SPEC-016.AC11 | Given `TDD-016.01` is decided at Gate 1, When the report is generated, Then its header records the approved option and approver | BRD-039 `[TDD-REQUIRED]` |
| SPEC-016.AC12 | Given the happy path P01 (RM enabled), When run end to end, Then it reaches COMPLETED with reservation at HR approval and allocation at completion | BRD-018, 027, 028 |
| SPEC-016.AC13 | Given P02 (RM disabled), When run, Then the Receiving Manager stage is skipped and the rest is identical | BRD-012, 027 |
| SPEC-016.AC14 | Given P03, When IT records No IT Action Required and gives Final Approval, Then the request reaches COMPLETED and not before | BRD-014 |
| SPEC-016.AC15 | Given exception paths P04–P25, When run, Then each meets its assertions in 16.2 | BRD-027, 033, 034, 035 |
| SPEC-016.AC16 | Given the SPEC-007 golden fixture, When `TC-016.49` replays the allowed cells over HTTP, Then every outcome matches the fixture | BRD-027 |
| SPEC-016.AC17 | Given C-01…C-12, When run, Then outcomes match section 17 and invariants hold | BRD-028, 030, 038 |
| SPEC-016.AC18 | Given an SMTP outage across a full journey, When it completes, Then all actions are recorded, failures logged, and one retry delivers once | BRD-036 |
| SPEC-016.AC19 | Given the document journey, When uploads are valid, oversize, wrong-type, mismatched and out-of-scope, Then results are 201, 413, 415, 415 and 403 with nothing stored for rejects | BRD-021 |
| SPEC-016.AC20 | Given `UAT-01..12`, When executed in UAT, Then every step is recorded Pass/Fail with tester and evidence | BRD UAT |
| SPEC-016.AC21 | Given completed UAT with no open failure, When the sign-off authority (`TDD-016.07`) signs, Then PRG-24 is satisfied | BRD UAT, PRG-24 |
| SPEC-016.AC22 | Given any BRD-038 input is empty, When `qa:perf:preflight` runs, Then it fails naming each empty input and no performance test starts | BRD-038 |
| SPEC-016.AC23 | Given a performance run, When it ends, Then CHK-01..14 are clean and no partial or duplicate transaction exists | BRD-038 |
| SPEC-016.AC24 | Given the PPV gate, When any item lacks evidence or is blocked, Then the gate result is not "passed" | BRD-038, 039 |
| SPEC-016.AC25 | Given the RR checklist, When completed, Then every item has evidence and an owner | PRG |
| SPEC-016.AC26 | Given matrix 3.5, When `TC-016.52` runs, Then every AB row's listed AC IDs exist and have passing TCs | BRD Acceptance Criteria |
| SPEC-016.AC27 | Given matrix 9.8, When `TC-016.52–.54` run, Then every exclusion is verified absent | BRD Out of Scope |
| SPEC-016.AC28 | Given each journey, When it ends, Then expected audit events exist with no credential and `verify:integrity` is clean | BRD-037 |
| SPEC-016.AC29 | Given a release candidate, When evidence is assembled, Then reports, scans and UAT record are retained and contain no secrets | NFR-003 |
| SPEC-016.AC30 | Given the production build, When inspected, Then no test-only code, route, seeder or fake adapter is present | NFR-004 |

## 22. Negative Acceptance Criteria

| ID | Given / When / Then | BRD-039 / BRD |
|---|---|---|
| SPEC-016.NAC01 | Given a seeded failing scenario test, When `qa:brd039` runs, Then exit code is non-zero and the row is `FAILED` | BRD-039 exit rule |
| SPEC-016.NAC02 | Given a scenario with no mapped TC, When the report is built, Then it fails (not skipped) | BRD-039 |
| SPEC-016.NAC03 | Given an empty BRD-038 input, When performance is requested, Then execution is refused and no number is defaulted | BRD-038 |
| SPEC-016.NAC04 | Given test-only harness/adapter code in the production artefact, When CI runs, Then it fails | BRD Integration Requirements |
| SPEC-016.NAC05 | Given a route named reset/impersonate/time-travel, When route inventory runs, Then it fails | NFR-002, BRD-026 |
| SPEC-016.NAC06 | Given a committed password or real e-mail address in test data, When the scan runs, Then it fails | BRD-005/006, NFR-003 |
| SPEC-016.NAC07 | Given a UAT step without recorded outcome, When sign-off is requested, Then sign-off is refused | BRD UAT |
| SPEC-016.NAC08 | Given a concurrency test configured to retry until green, When CI lints test config, Then it fails | BRD-038 |
| SPEC-016.NAC09 | Given a waiver of a mandatory scenario without recorded Project Manager approval under `TDD-016.12`, When the gate runs, Then it fails | BRD-039 |
| SPEC-016.NAC10 | Given Option B approved but the approval record is absent, When the report runs, Then Integration rows are `FAILED` | BRD-039 |
| SPEC-016.NAC11 | Given a runner pointed at a production host/DB, When started, Then it aborts before any write | NFR-004 |
| SPEC-016.NAC12 | Given an out-of-scope capability introduced (SSO dependency, HR sync job, payroll callback, facilities role), When `TC-016.52–.54` run, Then they fail | BRD Out of Scope |
| SPEC-016.NAC13 | Given a numeric performance/timeout/escalation constant committed without a register reference, When the guard runs, Then it fails | BRD-038, 023 |
| SPEC-016.NAC14 | Given evidence containing a token, password or hash pattern, When the scan runs, Then the evidence pack is rejected | NFR-003 |
| SPEC-016.NAC15 | Given UAT configured with production data or real mailboxes, When the environment checklist runs, Then UAT start is refused | NFR-007 |
| SPEC-016.NAC16 | Given an AB row whose AC has no passing TC, When `TC-016.52` runs, Then the release checklist item RR-03 fails | BRD Acceptance Criteria |

## 23. Testing Requirements

### 23.1 Summary by type

| Type | TC IDs | Content |
|---|---|---|
| Unit (tooling) | TC-016.55–.61 | Report builder, trace checker, tag parser, perf preflight, environment guard, evidence scanner |
| End-to-end negative | TC-016.01–.24 | One per BRD-039 scenario (23.2) |
| End-to-end journeys | TC-016.25–.40 | Happy/exception paths, notification outage, documents, audit completeness (23.3) |
| Concurrency | TC-016.41–.48 | C-01…C-12 (section 17) grouped |
| Matrix replay / matrix checks | TC-016.49–.54 | SPEC-007 replay, fixture integrity, integrity after journeys, acceptance and out-of-scope matrices |
| Frontend/UI E2E | TC-016.55 (a11y/responsive smoke), role journeys in TASK-016.18 | Browser |
| Security | TC-016.62 | Credential/log/evidence leak scan across all journeys |
| Performance (blocked) | TC-016.63–.68 | Preflight, workload execution, invariants — runnable only after inputs |
| Gates | TC-016.69–.72 | PPV and RR checklist verification |
| Negative | NAC01–NAC16 | TC-016.73–.88 (NACn = TC-016.(72+n)) |

### 23.2 End-to-end BRD-039 cases (RED first; real stack; assert response and no side effects)

| TC | Scenario | Design |
|---|---|---|
| TC-016.01 | S1 | HR-A (Location A) calls HR/transfer/vacancy/document/audit/report endpoints with Location B resource IDs and filters; list endpoints show only in-scope rows and counts; fail-closed when scope is empty |
| TC-016.02 | S2 | EMP-A1 requests/edits/withdraws/reads timeline, documents, notifications and audit of EMP-A2's request; uniform response per `TDD-002.11`; no existence leak |
| TC-016.03 | S3 | IT-B with no task, with a task but unflagged document, and after reassignment away requests documents; download denied, no bytes; IT payloads contain no HR/payroll/vacancy fields |
| TC-016.04 | S4 | Fresh and reset accounts: restricted token calls every route (UI path and direct API); pre-reset token reused; all refused with `PASSWORD_CHANGE_REQUIRED`/401; after change, access works |
| TC-016.05 | S5 | USR-LOCKED correct password refused, no token; old token refused; protected API refused; unlock then success; counter not extended during lock |
| TC-016.06 | S6 | USR-DEACT correct password refused; open token refused immediately; sessions invalidated at deactivation |
| TC-016.07 | S7 | USR-RESET: reset by SA; old password fails and increments counter; pre-reset token fails; new temporary password only yields restricted access |
| TC-016.08 | S8 | Route-inventory sweep: every non-public route × every role × {correct scope, out-of-scope ID, wrong stage, forged `role`/`scope` in body/headers/claims}; each denied per BRD-026 with no data and a security audit row |
| TC-016.09 | W1 | MGR-B approves EMP-A1's request; HR-B approves Location A request; Receiving Manager out of scope; previous assignee after reassignment; all `INVALID_WORKFLOW_TRANSITION`/403, status unchanged |
| TC-016.10 | W2 | Attempts across statuses (e.g. IT approve at PENDING_HR_REVIEW; HR Complete HR Processing at PAYROLL_PROCESSING; employee edit after submit); exact 403 body; no downstream effect; security audit; plus `TC-016.49` |
| TC-016.11 | W3 | On a COMPLETED request, every workflow action by every role, direct SQL update by app role, document upload, date correction: all refused/blocked, request unchanged |
| TC-016.12 | W4 | Request at PAYROLL_PROCESSING and PENDING_IT_ACTION: IT Final Approval refused; with seeded data anomaly (Payroll pending at PENDING_IT_FINAL_APPROVAL) refused `COMPLETION_GATE_NOT_SATISFIED`; after Payroll complete, allowed |
| TC-016.13 | W5 | No role/endpoint reaches COMPLETED except IT Final Approval; Super Admin, HR, Payroll, Complete IT Tasks, No IT Action all fail to complete; graph invariant |
| TC-016.14 | W6 | RM enabled: no action moves PRM → PENDING_HR_REVIEW; HR approve in PENDING_RECEIVING_MANAGER_APPROVAL refused; toggle disabled after submission follows decided in-flight rule |
| TC-016.15 | W7 | RM enabled: HR changes each of four fields → re-approval, cannot Complete HR Processing until approved; only vacancy or date changed → no re-approval (default); RM disabled → continues |
| TC-016.16 | V1 | HR approve against FULL/ON_HOLD/CLOSED vacancy → 409 `VACANCY_CAPACITY_UNAVAILABLE`, status unchanged, no reservation; Employee cannot select such vacancy |
| TC-016.17 | V2 | Design C-01 plus 20-way variant; completion contention (two transfers, one slot) |
| TC-016.18 | V3 | After approve/reject/change/withdraw/cancel/finalise races and direct SQL attempts, `available ≥ 0` and `reserved + filled ≤ capacity` (CHK-01); capacity reduction below committed refused |
| TC-016.19 | V4 | Reject (each origin), Withdraw (each allowed status incl. exceptional reservation), Cancel: reservation RELEASED once, capacity available to another eligible transfer, audited; replay does not double-decrement |
| TC-016.20 | I1 | A1 timeout and late success; A2 mid-transaction fault on Payroll mark; A3 SMTP drop-after-DATA: effect counts unchanged on retry |
| TC-016.21 | I2 | Failures retried only via bounded policy or authorised retry; terminal FAILED after bound; no unbounded loop |
| TC-016.22 | I3 | After induced failure, Payroll activity/IT task are not Completed |
| TC-016.23 | I4 | After induced failure, transfer status unchanged and never COMPLETED |
| TC-016.24 | I5 | Duplicate delivery and retries produce one effect under the idempotency key; counts of history, assignments, deliveries identical |

### 23.3 Journey and gate cases

| TC | Content |
|---|---|
| TC-016.25 – .27 | P01, P02, P03 happy paths |
| TC-016.28 | P04–P07 rejections |
| TC-016.29 | P08–P11 clarifications (multiple cycles) |
| TC-016.30 | P12–P13 re-approval loop / no loop |
| TC-016.31 | P14 withdrawal matrix |
| TC-016.32 | P15–P16, P25 block/resume and vacancy-edge resume |
| TC-016.33 | P17–P18 cancel matrix |
| TC-016.34 | P19 reassignment per task kind |
| TC-016.35 | P23 reapply after each closed status; no cool-down |
| TC-016.36 | P22 vacancy change atomicity, eligibility and missing-data refusals |
| TC-016.37 | P20–P21 effective date rules and expiry correction |
| TC-016.38 | P24 notification outage journey |
| TC-016.39 | Audit completeness per journey (section 18) |
| TC-016.40 | Document handling journey (valid, 413, 415×2, scope, IT) |
| TC-016.41 – .48 | C-01…C-12 grouped (section 17) |
| TC-016.49 | Allowed-cell replay of the SPEC-007 golden fixture over HTTP |
| TC-016.50 | Fixture/registry integrity check |
| TC-016.51 | `verify:integrity` clean after every journey |
| TC-016.52 | Acceptance matrix (3.5) and out-of-scope OS-01…05 checks |
| TC-016.53 | Out-of-scope OS-06, OS-07, OS-08…11 checks |
| TC-016.54 | Out-of-scope OS-12…14 checks |
| TC-016.55 | UI accessibility, keyboard and responsive smoke |
| TC-016.56 – .61 | Tooling unit tests |
| TC-016.62 | Cross-journey credential/token leak scan |
| TC-016.63 – .68 | Performance preflight, workload, invariants (blocked until inputs) |
| TC-016.69 – .72 | PPV/RR checklist verification, defect-log, evidence-pack checks |
| TC-016.73 – .88 | NAC01…NAC16 |

---

## 24. Definition of Done

- [ ] All TASK-016.01…30 complete; tooling unit tests written first (RED then GREEN).
- [ ] `qa:brd039` shows 24/24 `PASSED` in QA and, for go-live, in pre-production; the report header records the approved `TDD-016.01` option.
- [ ] `trace:tests` clean: no orphan AC/NAC/TC; matrix 3.5 and 9.8 verified.
- [ ] Journeys P01–P25, concurrency C-01…C-12 and the SPEC-007 allowed-cell replay pass on real PostgreSQL with no retried-to-green tests.
- [ ] `UAT-01…12` executed, all steps recorded, signed per `TDD-016.07`.
- [ ] Performance gate either executed against confirmed inputs or recorded **BLOCKED**; no performance number invented.
- [ ] PPV-01…12 and RR-01…12 completed with evidence; defect log has no open mandatory-scenario defect.
- [ ] No test-only code, endpoint, seeder, credential or personal data in production artefacts or evidence.
- [ ] INT standards respected in all test code (ES6+, async/await with try/catch, structured logger, env secrets, no `eval`, no AI-hint comments or commit messages).
- [ ] All `TDD-016.NN` decisions answered or defaults accepted at Gate 1; Gate 1 approval recorded, then Gate 2 code review passed; `status.md`, dashboard, PR review records and `prompt_history.md` synchronised by the owner process.

---

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-016.01 | How are the 5 BRD-039 Integration scenarios validated when no integration exists? (cross-ref `TDD-015.01`) | Option A: contract harness + manual-Payroll idempotency + SMTP fault tests, all three required; Option B: "Not applicable this phase" with Project Manager sign-off (A2/A3 still run); Option C (stub integration) not recommended | Pass criteria for I1–I5; PRG-03 **[DECIDED 2026-10-07 — Option A accepted]** The contract-level harness (mocks/stubs, no live external system) is sufficient for integration-related QA/UAT in the current phase. Harness scope: timeout; technical failure; business failure; retry; duplicate requests; duplicate responses/callbacks where applicable; idempotent retry; invalid/unexpected responses; no duplicate downstream transactions; a failed integration never marks the task Completed; an external failure never marks the transfer Completed. It must validate the integration contract, error handling, retry, idempotency, status handling, logging and audit without a live system. Real end-to-end integration testing is required in a future phase once an approved API contract exists. Source: decision text supplied by the spec author; formal Gate 1 record pending. FOLLOW-UP: SPEC-016 test cases must be checked for explicit 'business failure' and 'invalid/unexpected response' cases (not yet named in the spec). |
| TDD-016.02 | UI end-to-end tool and whether UI E2E is required beyond API-driven journeys | Playwright for role journeys and axe smoke; API-driven journeys remain the authoritative scenario evidence | TASK-016.18 |
| TDD-016.03 | Coverage thresholds and quality-gate numbers | No invented number: full branch coverage of authorisation/transition tables; overall threshold set by the Gate 2 reviewer, ratchet (no decrease) afterwards | Gate 2 criteria |
| TDD-016.04 | CI platform and pipeline definition (no CI configuration exists in the repository) | Organisation CI if available, otherwise a local `npm run verify:all` that runs gates 1–12 and is required as Gate 2 evidence | Merge enforcement |
| TDD-016.05 | Load-test tool and workload model owner | Tool chosen by the Technical Lead; workload weights from confirmed volume; execution blocked until BRD-038 inputs exist | Performance gate |
| TDD-016.06 | Defect severity classification and release exit rule beyond BRD-039 | BRD-039 failures always block; other severities per organisation scheme confirmed by the Project Manager | Release exit |
| TDD-016.07 | UAT participants, environment (UAT vs pre-production) and sign-off authority | Business/HR operations testers with synthetic accounts; Project Manager / Product Owner signs (PRG-24 owner) | UAT governance |
| TDD-016.08 | Test data policy | Synthetic only; no production copy; if ever needed, masked and approved | Privacy, NFR-007 |
| TDD-016.09 | Concurrency repetition and parallelism counts | Owner specs' counts as the floor (e.g. 20 parallel submits, 50 parallel ID creations); repeat count set by the Technical Lead | Flakiness detection |
| TDD-016.10 | E-mail sandbox for UAT/pre-production | Fake/sandbox SMTP; real company mail service only for a controlled final smoke with named testers | BRD-OQ-03 vs privacy |
| TDD-016.11 | Evidence retention location and format | `docs/qa/evidence/<release>/` plus links from `.ai-context/test_cases/` and the release record | Audit trail |
| TDD-016.12 | Waiver governance for mandatory scenarios | No waivers except Integration rows under approved `TDD-016.01` Option B, recorded by Project Manager | BRD-039 integrity [Note 2026-10-07: Option A of TDD-016.01 accepted, so no Integration waiver is needed.] |
| TDD-016.13 | Browser/device matrix for UI E2E/UAT | Latest Chromium-based browser plus one other organisation-standard browser; desktop and tablet widths per BRD-002 | UI coverage |

## Out of Scope (this SPEC)

Cites the BRD "Out of Scope" list; nothing in this SPEC introduces any of the following (each verified by matrix 9.8):
- Redesign or replacement of HR, payroll or IT service-management platforms; a payroll calculation engine, identity provider or enterprise master-data platform.
- The Facilities/Admin role and facilities task execution or integration.
- Automatic HR-system integration or synchronisation (real-time, scheduled, callback) and updates to an external HR master `[BRD-OQ-19]`; any Payroll API/callback `[BRD-027(c)]`.
- External recruitment, cross-company transfer, immigration or relocation benefit processing; historical data migration, bulk backfill, unapproved custom integrations; workforce planning or predictive vacancy forecasting.
- MFA/SSO `[BRD-025]`; malware scanning, retention/archive/deletion policy `[BRD-021]`; other HR eligibility restrictions, cool-down, invented escalation timings and numeric infrastructure targets.
- This SPEC also defines no numeric performance, availability, coverage or timeout value; those arrive only through the BRD-038/NFR-009 process or the decisions above.
