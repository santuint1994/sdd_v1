# Gate 1 PR Review: SPEC-005 — Vacancy Management, Capacity & Reservation Engine

> Saved as `.ai-context/pr_reviews/SPEC-005-vacancy-capacity-reservation-20261029-175816.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** vacancy-capacity-reservation (SPEC-005)
- **Spec Name:** Vacancy Management, Capacity & Reservation Engine
- **Spec File:** `.ai-context/specs/vacancy-capacity-reservation.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-29 17:58:16

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comments 2 and 5 (manual-release recovery, conflicting final allocation)
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Needs Improvement. Comments 2 and 9
4. **Technical Approach/Design:** Needs Improvement. Comments 1, 3, 4 and 8 (§10, §11.3, §17)
5. **Business Rules:** Needs Improvement. Comments 5, 6 and 7
6. **Validations:** Needs Improvement. Comment 6 (status/capacity matrix vs CHECK constraints)
7. **Dependencies:** Needs Improvement. Comments 4, 7, 8 and 9 (SPEC-001/013 audit, SPEC-002/003 scope, SPEC-006, SPEC-007–010)
8. **Assumptions:** Needs Improvement. TDD-005.03, .05, .06, .08, .09, .14 and .15 must become frozen decisions
9. **Edge Cases:** Needs Improvement. Comments 1, 3 and 6 (§20.2)
10. **Acceptance Criteria:** Needs Improvement. Comments 3, 6, 7 and 9 (concurrency, matrix, out-of-scope and discovery tests)
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** Five high and four medium findings remain:
  - **High:** counter vs ledger drift; recovery after a manual release; reservation
    idempotency against the partial unique index; cross-spec lock order and transaction
    ownership; the unconfirmed "conflicting final allocation" rule.
  - **Medium:** the full status/capacity matrix; HR scope rules; separate-transaction
    failure audit; alignment of Employee discovery with SPEC-006.

  The author must resolve each finding, align constraints, contracts and tests, and
  resubmit SPEC-005 for Gate 1.
- **Review Comments:**

| # | Priority | Finding | Required Action | Spec Areas / Open Decision | Author Response | Status |
|---|---|---|---|---|---|---|
| 1 | High | Capacity counters can drift from the reservation ledger. Counters are stored separately from reservation rows, but the listed database constraints do not enforce equality between them. | Define how the system detects and prevents counter/ledger mismatches during normal operations, failures and concurrent updates. | §10.1 `vacancies` counters and CHECKs (`chk_vacancies_commitment`, `counts_nonneg`), §10.2 ledger, §10.3 invariants (verified only by TASK-005.22 and tests), §17.1 | — | Open |
| 2 | High | Manual release can leave a transfer in an inconsistent workflow state. Manual release intentionally leaves workflow status unchanged, but completion then fails because no active reservation exists. | Finalise the recovery process: who can re-reserve, under which workflow state, and how the transfer is prevented from proceeding incorrectly in the meantime. | §11.3 `manualRelease`, §12.9, `release_reason_code = 'MANUAL'`; TDD-005.08 (proposed: status unchanged, completion blocked); SPEC-009 completion gate, SPEC-010 FR-010.48 | — | Open |
| 3 | High | Reservation idempotency and database uniqueness need verification. The partial unique index covers both ACTIVE and ALLOCATED reservations, while the workflow also treats an allocated reservation as a distinct error for reserve replay. | Confirm that the SQL conflict handling and application checks consistently distinguish same-vacancy replay, different-vacancy conflict and already-allocated cases under concurrent requests. | FR-005.33, §10.2 `uq_vres_one_live_per_transfer (transfer_request_id) WHERE status IN ('ACTIVE','ALLOCATED')`, §11.3 reserve step 3 (`replayed`, `RESERVATION_ALREADY_EXISTS`, `RESERVATION_ALREADY_ALLOCATED`), §17.2, §17.5, §20.1, NAC10, §23.3 | — | Open |
| 4 | High | Locking and transaction ownership must align across specs. The canonical lock order includes transfer, configuration, assignment/task, vacancy, reservation and audit/outbox operations. | Verify that all consumers, especially SPEC-007, SPEC-008, SPEC-009 and SPEC-010, follow this order and use the same transaction. | §17.3 (an older 4-step list and the 7-step R-5 canonical list both appear), §17.7 savepoint, §11.3; SPEC-007 FR-007.29 / §17, SPEC-010 §11.2, SPEC-015 §11.6; TDD-005.10, TDD-005.16 | — | Open |
| 5 | High | Resume validation has an unresolved business rule. The definition of a "conflicting final allocation" is a proposed default, not a confirmed BRD decision. | Confirm the rule and its data query, particularly how allocations for the same employee across different transfers are identified and how historical records are treated. | §11.3 `validateForResume`, BRD-OQ-15(a); TDD-005.09 (proposed: no ALLOCATED row for this transfer, and none for the same employee created after …); SPEC-010 FR-010.20–.22 | — | Open |
| 6 | Medium | Vacancy status rules need complete validation. Automatic OPEN/FULL changes, opening-filled-count edits, capacity changes and manual status transitions interact. | Validate the complete status/capacity matrix against database constraints and acceptance tests, including cases where the opening filled count equals capacity. | §7.1–7.2, §12.4–12.5, §16.1 vacancy status machine, `chk_vacancies_open_full_consistency`, §20.2 E18, TC-005.11; TDD-005.04, .05, .06 | — | Open |
| 7 | Medium | HR scope rules need formal approval. HR visibility depends on location scope or association with an in-scope transfer, while manual release uses a separate transfer-scope rule. | Confirm that these rules are intentional, consistent with SPEC-002/SPEC-003, and tested for out-of-scope access. | §6, §15, §12.9 (HR out of scope → 403); TDD-005.03 (vacancy read scope), TDD-005.15 (manual-release scope); SPEC-002 #1, SPEC-003 #3 | — | Open |
| 8 | Medium | Failure audit behaviour requires cross-spec confirmation. Capacity and resume failures are intended to be audited in a separate transaction so the records survive rollback. | Confirm that the audit implementation supports this safely and does not mask the original workflow error or create duplicate failure events on retries. | FR-005.47, TASK-005.20, §11.3 (`VACANCY_RESUME_VALIDATION_FAILED`), §17.4 step 5 (`VACANCY_RESERVATION_FAILED`), §17.5 retries, §18; SPEC-001 / SPEC-013 `AuditService` | — | Open |
| 9 | Medium | Employee discovery and visibility decisions must remain aligned. The spec reconciles discovery to expose only an availability flag, while a TDD proposes showing the available count. | Close the combined decision with SPEC-006 so the endpoint, picker, DTO, privacy expectations and acceptance criteria all agree. | FR-005.29, §12.7 (`isAvailable` only, RECONCILED R-6/R-11) vs TDD-005.14 (proposed: show `availableCapacity`), TDD-005.02; SPEC-006 FR-006.07 / TDD-006.04 | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/vacancy-capacity-reservation.spec.md` to resolve every
comment, fills in the Author Response column above, and resubmits SPEC-005 for Gate 1
review.
