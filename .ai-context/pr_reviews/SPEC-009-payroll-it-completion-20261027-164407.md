# Gate 1 PR Review: SPEC-009 — Payroll, IT Processing & Final Transfer Completion

> Saved as `.ai-context/pr_reviews/SPEC-009-payroll-it-completion-20261027-164407.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** payroll-it-completion (SPEC-009)
- **Spec Name:** Payroll, IT Processing & Final Transfer Completion
- **Spec File:** `.ai-context/specs/payroll-it-completion.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-27 16:44:07 (round 1, comments 1–5); 2026-10-29 18:02:47 (round 2, comments 6–13)

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comments 2 and 4 (return path and blocked-task effects not defined)
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Needs Improvement. Comment 1 (FR-009.61 vs API 12.19 scope)
4. **Technical Approach/Design:** Needs Improvement. Comments 1 and 2 (§12.19, FR-009.64, SPEC-007 re-approval evaluator)
5. **Business Rules:** Needs Improvement. Comments 3, 4 and 5 (TDD-009.11, .09, .02, .12)
6. **Validations:** Needs Improvement. Comment 5 (Payroll reference format, §14)
7. **Dependencies:** Needs Improvement. Comments 1 and 2 (SPEC-007 re-approval, SPEC-008 HR date route); comment 4 (SPEC-010 transfer-level Block, SPEC-012, SPEC-014)
8. **Assumptions:** Needs Improvement. TDD-009.02, .09, .11, .12 and .13 must become frozen decisions
9. **Edge Cases:** Needs Improvement. Comments 2 and 4 (§20)
10. **Acceptance Criteria:** Needs Improvement. Comments 1 and 3 (tests aligned to the date-correction scope; segregation-of-duties negative tests if required)
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** Four critical findings block approval. The Super Admin
  date-correction scope differs between FR-009.61 and API 12.19. The date-change
  re-approval return path is not defined. The maker-checker rule for IT Final Approval
  is proposed but not confirmed by the business. The relationship between task-level
  and transfer-level blocking has not been confirmed or fully specified. Payroll
  reference validation and the mandatory status of Payroll are also unresolved. The
  author must resolve each finding, remove the matching `[TDD-REQUIRED]` markers, align
  the API, authorization matrix, UI and tests, and resubmit SPEC-009 for Gate 1.
- **Round 2 (2026-10-29):** The reviewer added eight findings (6 High, 2 Medium):
  - all TDD-009 decisions remain unresolved;
  - segregation of duties for IT Final Approval;
  - the full IT task lifecycle and whether evidence or a completion note is mandatory;
  - what happens to completed tasks, assignments, approvals and notifications when a
    date-change re-approval reroutes the transfer;
  - cross-spec transaction and lock contracts;
  - the IT field allowlist and data-leak tests;
  - Payroll assignee rules after reassignment;
  - monitoring and escalation of unassigned IT tasks.

  Comment 7 repeats comment 3, and comment 9 extends comment 2. Both pairs must be
  resolved together.
- **Review Comments:**

| # | Priority | Finding | Spec Areas / Open Decision | Required Action | Author Response | Status |
|---|---|---|---|---|---|---|
| 1 | Critical | Super Admin date-correction scope is inconsistent. FR-009.61 limits this spec to IT-controlled stages, but API 12.19 describes a single route for any non-final stage. | FR-009.61 (Super Admin only in `PENDING_IT_ACTION`, `PENDING_IT_FINAL_APPROVAL`, and `BLOCKED` from those) vs §12.19 ("single Super Admin date route for the whole workflow ... any other non-final stage"); §6 Super Admin row; §13 UI; §15 authorization; AC25–AC27; SPEC-008 `PATCH /hr/transfers/:id/effective-date` | Align the API, authorization matrix, UI and tests. Explicitly define how HR-controlled stages are handled through SPEC-008 and whether the Super Admin endpoint is restricted to IT stages. | — | Open |
| 2 | Critical | Date-change re-approval behaviour is not fully defined. FR-009.64 says the configured re-approval stage may be applied, but does not define how IT tasks, assignments and outcomes behave when the transfer returns to an earlier stage. | FR-009.64 (states the IT-task behaviour "is not defined"); §12.19 `reapprovalTriggered`; TDD-009.13 (proposed: open IT tasks retained); SPEC-007 date-change re-approval evaluator and `workflow_configuration` | Define the complete return path, including whether existing IT tasks are retained, cancelled or reopened; how pending ownership changes; and how a new approval returns the transfer to the correct stage. | — | Open |
| 3 | Critical | Final approval and task execution may be performed by the same person. TDD-009.11 proposes that maker-checker separation is not required, but this is not confirmed as a business decision. | FR-009.46, §12.18 `final-approve`, §15, §22; TDD-009.11 | Obtain explicit approval of the segregation-of-duties rule. If separation is required, enforce it in the backend and add negative tests. | — | Open |
| 4 | Critical | Task-level blocking and transfer-level blocking are separate. An IT task can be `BLOCKED` while the transfer remains in `PENDING_IT_ACTION`. | FR-009.36–.38, §12.11–12.12, §19 `TASK_BLOCKED`, §20, SPEC-009.AC13, NAC24; TDD-009.09 (proposed: no automatic transfer Block; manual Block in SPEC-010) | Confirm this is the intended business behaviour. Specify how a blocked task affects the IT queue, overdue reporting, notifications and the decision to block the whole transfer. | — | Open |
| 5 | Not given | Payroll reference validation and mandatory status are unresolved. The reference format is proposed, while the data model includes `is_mandatory` even though the recommended gate rule says Payroll is always mandatory. | FR-009.08, FR-009.54, §10.1 `payroll_activities.is_mandatory` / `payroll_reference`, §12.2, §14 `payrollReference`; TDD-009.02 (proposed: optional, `^[A-Za-z0-9][A-Za-z0-9._/\-]{0,49}$`, no uniqueness), TDD-009.12 (proposed: always mandatory) | Not given by the reviewer. | — | Open |
| 6 | High | TDDs remain unresolved. TDD-009.01–009.15 include decisions affecting authorisation, task assignment, evidence, maker-checker controls and notifications. | Closing TDD section TDD-009.01–.15 (incl. .01 Payroll authorised user, .04/.05/.06 task granularity and assignment, .07 IT allowlist, .10 evidence, .11 maker-checker, .14 notification recipients, .15 Super Admin intervention) | Record explicit decisions before implementation. | — | Open |
| 7 | High | Final approval and segregation of duties. The same IT user can execute tasks and provide final approval by default. (Same issue as comment 3.) | FR-009.46, §12.18 `final-approve`, §15, §22; TDD-009.11 | Confirm whether independent approval is required, considering the security and governance implications. | — | Open |
| 8 | High | IT task completion rules. The initial task is created without a task type, and tasks must be started before completion. | FR-009.20 (anchor task, type unset), FR-009.34, FR-009.36–.37 (`NOT_STARTED→COMPLETED` refused), FR-009.39a (evidence optional), FR-009.39b (completion requires task type; note optional), §12.9–12.15, §10.3–10.5; TDD-009.04, TDD-009.10; SPEC-011 #3 | Confirm the full task lifecycle and whether evidence or a completion note is mandatory. | — | Open |
| 9 | High | Date correction and re-approval. If date-change re-approval is enabled, an IT-stage transfer may return to an earlier stage. (Extends comment 2.) | FR-009.64, §12.19 `reapprovalTriggered`, §19; TDD-009.13 (proposed: open IT tasks retained); SPEC-007 TDD-007.04 | Define what happens to completed tasks, pending assignments, prior approvals and notifications during this rerouting. | — | Open |
| 10 | High | Cross-spec transaction and locking contract. Completion depends on SPEC-005, SPEC-007, SPEC-008 and SPEC-010 sharing transaction boundaries and lock order. | FR-009.56 / .56a completion order, §17 items 1–10 (lock order omits the `workflow_configuration` FOR SHARE step of the R-5 canonical order), §11; SPEC-005 #4, SPEC-007 #3, SPEC-010 #2, SPEC-015 §11.6 | Confirm these contracts are implemented consistently, not just documented as proposed. | — | Open |
| 11 | High | IT visibility and data protection. The IT field allowlist is still marked as requiring a TDD. | FR-009.31 (default allowlist), FR-009.66 (IT gets booleans only on completion-readiness), §12.6–12.7, §15; TDD-009.07; SPEC-002 TDD-002.16, SPEC-004 TDD-004.13, SPEC-014 #6 | Finalise the exact fields and test every API response to prevent payroll, HR remarks, approval comments or unrelated employee data from leaking. | — | Open |
| 12 | Medium | Payroll assignee rules. The current HR assignee is the proposed authorised user, but this is still a TDD. | FR-009.06, FR-009.07, §12.2–12.3, §17 item 10; TDD-009.01; SPEC-010 BR-010.16 / TDD-010.13 | Confirm the rule and ensure reassignment immediately removes the former assignee's ability to update or complete payroll. | — | Open |
| 13 | Medium | No eligible IT assignee. The workflow continues with an unassigned task if no eligible IT user exists. | FR-009.23a (`assigned_to_user_id = NULL`, audit `IT_TASK_ASSIGNMENT_UNRESOLVED`, Super Admin dashboard), §20; TDD-009.06; SPEC-014 #2/#3 (overdue, escalation) | Confirm how this exception is monitored and escalated so transfers cannot remain indefinitely unattended. | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/payroll-it-completion.spec.md` to resolve every
comment, fills in the Author Response column above, and resubmits SPEC-009 for Gate 1
review.
