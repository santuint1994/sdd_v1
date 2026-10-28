# Gate 1 PR Review: SPEC-006 — Employee Transfer Initiation, Eligibility & Submission

> Saved as `.ai-context/pr_reviews/SPEC-006-transfer-initiation-eligibility-20261028-174721.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** transfer-initiation-eligibility (SPEC-006)
- **Spec Name:** Employee Transfer Initiation, Eligibility & Submission
- **Spec File:** `.ai-context/specs/transfer-initiation-eligibility.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-28 17:47:21

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comments 1 and 3
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Needs Improvement. Comment 1 (Draft rules, vacancy visibility, timeline visibility)
4. **Technical Approach/Design:** Needs Improvement. Comments 3 and 4 (§11 submit sequence, SPEC-007 contract)
5. **Business Rules:** Needs Improvement. Comment 1 (TDD-006.03, .04, .06–.08, .11, .12)
6. **Validations:** Needs Improvement. Comment 3 (eligibility vs field validation overlap, §12 error precedence)
7. **Dependencies:** Needs Improvement. Comment 4 (SPEC-007 `WorkflowEngine.transition`, history, task assignment, `getAllowedActions`)
8. **Assumptions:** Needs Improvement. The TDD-006 recommendations named in comment 1 must become approved decisions
9. **Edge Cases:** Needs Improvement. Comments 2 and 3 (§20)
10. **Acceptance Criteria:** Needs Improvement. Comments 2 and 3 (security/enumeration tests, TC-006.14 aggregation/precedence)
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** Four high-priority items remain:
  - Several TDD-006 decisions are still recommendations rather than approved decisions.
  - The 403 (another employee's request) vs 404 (unknown ID) distinction may reveal
    whether a record exists.
  - Deduplication and precedence of submission errors are unclear where the eligibility
    check and form validation overlap.
  - The submission interface and transaction contract with SPEC-007 is unconfirmed.

  The author must resolve each item, align the API and tests, and resubmit SPEC-006 for
  Gate 1.
- **Review Comments:**

| # | Priority | Area | Finding / Required Action | Spec Areas / Open Decision | Author Response | Status |
|---|---|---|---|---|---|---|
| 1 | High | Pending TDDs | Finalise the required decisions, particularly employment-status values, vacancy visibility, Draft rules, vacancy-to-organisation mapping, inactive Reporting Manager handling and employee-visible timeline details. Several are currently recommendations rather than approved decisions. | TDD-006.03 (employment-status enum; shared with SPEC-015 TDD-015.04), TDD-006.04 (vacancy visibility, capacity shown), TDD-006.06 / .07 / .13 (Draft rules), TDD-006.08 (`VACANCY_ORG_MISMATCH`), TDD-006.11 (inactive Reporting Manager), TDD-006.12 (employee-visible timeline) | — | Open |
| 2 | High | API authorisation and information leakage | The spec returns 403 for another employee's request but 404 for an unknown request ID. Confirm whether this distinction could reveal record existence; align the response policy and security tests to avoid resource enumeration. | §11 submit pseudo-code (`!draft or not owner -> 403/404`), §12 error table (403 not owner; 404 `TRANSFER_REQUEST_NOT_FOUND` unknown id), §15, §20, TC-006.29; cross-ref SPEC-002 TDD-002.11 and SPEC-015 TDD-015.11 (both propose uniform 403) | — | Open |
| 3 | High | Submission error handling | The submission flow checks eligibility and validates the form through separate steps. Clarify how duplicate vacancy/date/profile failures are deduplicated and how the documented error precedence is applied when multiple failures occur. | §7.7, §11 (`eligibility.evaluate` rules 1/5/6 + `validator.validateForSubmit` required/masters/vacancy match/date → 422 aggregated), §12 precedence (`EMPLOYEE_PROFILE_INCOMPLETE` > `EMPLOYEE_NOT_ELIGIBLE` > `VACANCY_NOT_AVAILABLE` > `INVALID_EFFECTIVE_DATE` > rest), TASK-006.10, TC-006.14 | — | Open |
| 4 | High | Workflow integration | Submission depends on SPEC-007 for the workflow transition, history, Reporting Manager task assignment and allowed actions. Confirm the interface and transaction contract before integrating; the end-to-end submission tasks are explicitly gated on SPEC-007 core. | §4 SPEC-007 dependency, FR-006.32, §11 `engine.transition(SUBMIT, draft, {trx, snapshot, reference})`, TASK-006.11, .12, .13, .30, §23.7, §24; TDD-006.16 | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/transfer-initiation-eligibility.spec.md` to resolve
every comment, fills in the Author Response column above, and resubmits SPEC-006 for Gate 1
review.
