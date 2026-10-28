# Gate 1 PR Review: SPEC-010 — Transfer Exception & Administrative Control Workflows

> Saved as `.ai-context/pr_reviews/SPEC-010-transfer-exception-controls-20261028-153226.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** transfer-exception-controls (SPEC-010)
- **Spec Name:** Transfer Exception & Administrative Control Workflows
- **Spec File:** `.ai-context/specs/transfer-exception-controls.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-28 15:32:26

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comment 1 (eligible task, pool-assigned and IT task selection)
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Needs Improvement. Comment 1 (Reassign in `INFO_REQUIRED` / `BLOCKED`)
4. **Technical Approach/Design:** Needs Improvement. Comment 2 (§11.2–11.5 lock order, effects and hooks)
5. **Business Rules:** Needs Improvement. Comment 1 (FR-010.31, BR-010.16)
6. **Validations:** Passed
7. **Dependencies:** Needs Improvement. Comment 2 (SPEC-005, SPEC-007, SPEC-008, SPEC-009 contracts)
8. **Assumptions:** Needs Improvement. TDD-010.03 and TDD-010.12 must become frozen decisions
9. **Edge Cases:** Needs Improvement. Comments 1 and 2 (§20)
10. **Acceptance Criteria:** Needs Improvement. Must cover the frozen reassignment rules and the atomicity of the cross-spec effects
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** The Reassign rules are incomplete. It is not decided whether
  Reassign applies in `INFO_REQUIRED` and `BLOCKED`, which open task is eligible, or how
  pool-assigned and multiple IT tasks are handled. The transaction design depends on
  contracts owned by SPEC-005, SPEC-007, SPEC-008 and SPEC-009: the lock order,
  reservation release and resume revalidation, and the Payroll/IT task-cancellation
  hooks. These have not been validated against those specs. The author must resolve
  both items and resubmit SPEC-010 for Gate 1.
- **Review Comments:**

| # | Topic | Finding / Reviewer Comment | Spec Areas / Open Decision | Required Action | Author Response | Status |
|---|---|---|---|---|---|---|
| 1 | Reassignment rules | Confirm whether reassignment is allowed for `INFO_REQUIRED` and `BLOCKED` requests and define exactly which open task is eligible. Clarify pool-assigned tasks and IT task selection. | FR-010.31–.36; §11.5 task-kind mapping (no `INFO_REQUIRED` / `BLOCKED` rows; service loads a single OPEN task; SPEC-009 hook `ItTaskService.applyReassignment(trx, transferId, newUserId)` is per transfer, not per task, while `PENDING_IT_ACTION` can hold several IT tasks); §10.3 `previous_assignee_user_id` NULL for pool tasks; §12.5–12.6; TDD-010.03, TDD-010.12, TDD-010.13; SPEC-009 TDD-009.04 / .05 | Confirm these rules before implementing the service. | — | Open |
| 2 | Transaction and dependency alignment | Validate the lock order, reservation release/revalidation, and Payroll/IT task-cancellation hooks against SPEC-005, SPEC-007, SPEC-008 and SPEC-009. | §11.2 step 4 canonical lock order (task assignments → clarification → SPEC-009 `cancelOpenTasks` → `VacancyService.release`, vacancy rows locked last), §11.4 `VacancyService.validateForResume`, FR-010.05–.06, FR-010.20–.22, FR-010.27, TASK-010.07 `TerminalTransitionEffects`, TASK-010.10, §17; SPEC-015 §11.6 lock order (`transfer_requests` → `vacancies` → `vacancy_reservations`) | Validate against the owning specs. These operations must remain consistent and atomic. | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/transfer-exception-controls.spec.md` to resolve every
comment, fills in the Author Response column above, and resubmits SPEC-010 for Gate 1
review.
