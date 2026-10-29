# Gate 1 PR Review: SPEC-007 — Transfer Workflow Engine & Approval Lifecycle

> Saved as `.ai-context/pr_reviews/SPEC-007-transfer-workflow-approval-lifecycle-20261029-164221.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** transfer-workflow-approval-lifecycle (SPEC-007)
- **Spec Name:** Transfer Workflow Engine & Approval Lifecycle
- **Spec File:** `.ai-context/specs/transfer-workflow-approval-lifecycle.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-29 16:42:21

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comments 1 and 2
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Needs Improvement. Comment 1 (derived clarification, comment and effective-date-change rows)
4. **Technical Approach/Design:** Needs Improvement. Comment 3 (§11 skeleton vs FR-007.29 / §17 lock order)
5. **Business Rules:** Needs Improvement. Comments 1 and 4 (§7.9, §7.10, §16)
6. **Validations:** Passed
7. **Dependencies:** Needs Improvement. Comments 3 and 4 (SPEC-005, SPEC-008, SPEC-009, SPEC-010)
8. **Assumptions:** Needs Improvement. Comment 2 (TDD-007.01–.18)
9. **Edge Cases:** Needs Improvement. Comment 4 (clarify / reject / block / cancel interactions, §20)
10. **Acceptance Criteria:** Needs Improvement. Comment 1 (AC03, TC-007.10, golden fixture must use the approved set)
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** Four high-priority items remain:
  - The transition matrix includes derived and `[TDD-REQUIRED]` rows that are not yet
    approved against BRD-027.
  - Several TDD-007 decisions block implementation readiness.
  - The engine skeleton's configuration read does not follow the stated lock order.
  - The atomicity of clarification, rejection and assignment changes across stages
    and dependent specs is unconfirmed.

  The author must resolve each item, keep the registry, golden fixture and acceptance
  criteria on the same approved set, and resubmit SPEC-007 for Gate 1.
- **Reviewer's line references:** The reviewer cited lines 528–587, 658–718, 799–818,
  143–162, 382–406 and 593–606. These do not match the current file (1,051 lines; e.g.
  line 799 falls in §18/§19). The sections the comments refer to are mapped in the
  Spec Areas column below.
- **Review Comments:**

| # | Priority | Topic | Finding / Required Action | Spec Areas / Open Decision | Author Response | Status |
|---|---|---|---|---|---|---|
| 1 | High | Transition matrix and status/action consistency | The spec defines 15 statuses, 19 actions and 78 allowed transition cells, but several rows are derived or still marked TDD-required. Confirm the final transition matrix against BRD-027, including the derived clarification, comment and effective-date-change actions. Ensure the golden test fixture, registry and acceptance criteria all use the same approved set. | FR-007.01, §7.2, §12.1, §16.2 BRD-027 matrix (TR-xxx rows), §16.3 derived / TDD-REQUIRED rows, §16.4 tally (62 BRD + 16 derived = 78: REAPP clarify 1, ADD_COMMENT 3, CHANGE_EFFECTIVE_DATE 12), TASK-007.26, SPEC-007.AC03, TC-007.10, §24; TDD-007.06 (78 vs 77), TDD-007.14 | — | Open |
| 2 | High | Outstanding TDDs block implementation readiness | Several decisions remain open, including Receiving Manager resolution, clarification responsibility, date-change re-approval routing, history visibility, self-approval prevention and handling of missing configuration. Resolve or formally approve the recommended defaults before implementation. | Closing TDD section: TDD-007.01 (missing configuration, fail closed), .02 (Receiving Manager resolution), .04 (date-change re-approval routing), .05 (clarification responder), .09 (history visibility), .17 (self-approval); also open: .03, .07, .08, .10–.13, .15, .16, .18. Note: TDD-007.11 proposes Reassign **denied** in `INFO_REQUIRED` / `BLOCKED`, while SPEC-010 TDD-010.03 proposes it **allowed** | — | Open |
| 3 | High | Transaction and lock-order consistency | The engine requires a single transaction and specifies a lock order, but the implementation skeleton reads the configuration after authorization, while the stated lock order places configuration before assignments and downstream task/vacancy locks. Confirm the exact lock sequence across all handlers and dependent specs to reduce deadlock risk and ensure consistent rollback. | FR-007.29 and §17 (transfer → config FOR SHARE → assignments → payroll/IT task rows → vacancy → history inserts), §11 `WorkflowEngine.transition` skeleton (`lockById` → `authorizeAndResolve` → `validatePayload` → `config.readForRouting`), §17 deadlock retry; §7.5 handler contract; SPEC-010 §11.2 step 4, SPEC-015 §11.6 lock order; TDD-007.13 | — | Open |
| 4 | High | Clarification, rejection and assignment lifecycle | Clarification suspends the reviewer assignment and later restores it; rejection closes open assignments, closes clarifications and releases vacancy capacity. Confirm these actions remain atomic across all supported stages, particularly when a request is blocked, cancelled or clarified. Align the behaviour with SPEC-005, SPEC-008, SPEC-009 and SPEC-010. | §7.6 task assignments, §7.9 FR-007.60–.64 (rejection), §7.10 FR-007.65–.73 (clarification, `return_status`, reviewer assignment), §10.3 `transfer_task_assignments`, §10.5 `transfer_clarifications`, §20; TDD-007.05, TDD-007.11; SPEC-005 `VacancyService.release`, SPEC-010 `TerminalTransitionEffects` | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/transfer-workflow-approval-lifecycle.spec.md` to
resolve every comment, fills in the Author Response column above, and resubmits SPEC-007
for Gate 1 review.
