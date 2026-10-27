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
- **Review Date/Time:** 2026-10-27 16:44:07

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
- **Review Comments:**

| # | Priority | Finding | Spec Areas / Open Decision | Required Action | Author Response | Status |
|---|---|---|---|---|---|---|
| 1 | Critical | Super Admin date-correction scope is inconsistent. FR-009.61 limits this spec to IT-controlled stages, but API 12.19 describes a single route for any non-final stage. | FR-009.61 (Super Admin only in `PENDING_IT_ACTION`, `PENDING_IT_FINAL_APPROVAL`, and `BLOCKED` from those) vs §12.19 ("single Super Admin date route for the whole workflow ... any other non-final stage"); §6 Super Admin row; §13 UI; §15 authorization; AC25–AC27; SPEC-008 `PATCH /hr/transfers/:id/effective-date` | Align the API, authorization matrix, UI and tests. Explicitly define how HR-controlled stages are handled through SPEC-008 and whether the Super Admin endpoint is restricted to IT stages. | — | Open |
| 2 | Critical | Date-change re-approval behaviour is not fully defined. FR-009.64 says the configured re-approval stage may be applied, but does not define how IT tasks, assignments and outcomes behave when the transfer returns to an earlier stage. | FR-009.64 (states the IT-task behaviour "is not defined"); §12.19 `reapprovalTriggered`; TDD-009.13 (proposed: open IT tasks retained); SPEC-007 date-change re-approval evaluator and `workflow_configuration` | Define the complete return path, including whether existing IT tasks are retained, cancelled or reopened; how pending ownership changes; and how a new approval returns the transfer to the correct stage. | — | Open |
| 3 | Critical | Final approval and task execution may be performed by the same person. TDD-009.11 proposes that maker-checker separation is not required, but this is not confirmed as a business decision. | FR-009.46, §12.18 `final-approve`, §15, §22; TDD-009.11 | Obtain explicit approval of the segregation-of-duties rule. If separation is required, enforce it in the backend and add negative tests. | — | Open |
| 4 | Critical | Task-level blocking and transfer-level blocking are separate. An IT task can be `BLOCKED` while the transfer remains in `PENDING_IT_ACTION`. | FR-009.36–.38, §12.11–12.12, §19 `TASK_BLOCKED`, §20, SPEC-009.AC13, NAC24; TDD-009.09 (proposed: no automatic transfer Block; manual Block in SPEC-010) | Confirm this is the intended business behaviour. Specify how a blocked task affects the IT queue, overdue reporting, notifications and the decision to block the whole transfer. | — | Open |
| 5 | Not given | Payroll reference validation and mandatory status are unresolved. The reference format is proposed, while the data model includes `is_mandatory` even though the recommended gate rule says Payroll is always mandatory. | FR-009.08, FR-009.54, §10.1 `payroll_activities.is_mandatory` / `payroll_reference`, §12.2, §14 `payrollReference`; TDD-009.02 (proposed: optional, `^[A-Za-z0-9][A-Za-z0-9._/\-]{0,49}$`, no uniqueness), TDD-009.12 (proposed: always mandatory) | Not given by the reviewer. | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/payroll-it-completion.spec.md` to resolve every
comment, fills in the Author Response column above, and resubmits SPEC-009 for Gate 1
review.
