# Gate 1 PR Review: SPEC-015 — Source of Truth, Integration Boundary, NFR & Security Hardening

> Saved as `.ai-context/pr_reviews/SPEC-015-data-ownership-integration-nfr-hardening-20261027-125458.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** data-ownership-integration-nfr-hardening (SPEC-015)
- **Spec Name:** Source of Truth, Integration Boundary, NFR & Security Hardening
- **Spec File:** `.ai-context/specs/data-ownership-integration-nfr-hardening.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-27 12:54:58

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comments 1, 2 and 3
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Needs Improvement. Comment 1 (§7.1, profile update on completion)
4. **Technical Approach/Design:** Needs Improvement. Comment 3 (§11.5, FR-015.50–.53, .58, .65, .68, .73)
5. **Business Rules:** Needs Improvement. Comments 1 and 2 (§9.1 rows 4–10, §9.2)
6. **Validations:** Needs Improvement. Comments 2 and 4 (employment-status values, 400 vs 403, §12, §14)
7. **Dependencies:** Needs Improvement. Comment 1 (SPEC-003 / SPEC-004 / SPEC-009 assignment re-derivation and scope caches)
8. **Assumptions:** Needs Improvement. TDD-015.02–.08 and .10–.12 must become frozen decisions; TDD-015.03 needs formal Gate 1 record
9. **Edge Cases:** Needs Improvement. Comment 4 (§20 unknown vs controlled field rows)
10. **Acceptance Criteria:** Needs Improvement. Comment 4 (SPEC-015.NAC01 combines 403/400); §21/§22 must cover the frozen decisions
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** The profile-update flow on transfer completion is recorded as
  decided but lacks a formal Gate 1 record, and its follow-on effects (HR/IT assignment
  recalculation, scope-cache refresh) are still open. Employment-status values and
  profile-correction write permissions are unresolved, the security and deployment
  configuration decisions are still `[TDD-REQUIRED]`, and the negative tests mix the
  400 and 403 outcomes. The author must turn each item into a frozen, explicit decision
  in the spec, remove the matching markers, separate the affected test cases, and
  resubmit SPEC-015 for Gate 1.
- **Review Comments:**

| # | Topic | Reviewer Comment | Spec Areas / Open Decision | Why It Matters | Author Response | Status |
|---|---|---|---|---|---|---|
| 1 | Source of truth and profile-update flow | Confirm the source-of-truth and profile-update flow. TDD-015.03 records a decision to update the employee's current organisation profile when the transfer is completed, but formal Gate 1 approval is still pending. Confirm how HR/IT assignments are recalculated after a location change and how scope caches are refreshed. | §7.1, §9.1 rows 5–10, §9.2, TASK-015.05, TDD-015.03 (= TDD-004.11; SPEC-009 FR-009.56a / TASK-009.16; open sub-points SPEC-003/004) | Prevents inconsistent employee profiles and incorrect access permissions. | — | Open |
| 2 | Employment status and profile-correction rules | Resolve the employment-status and profile-correction rules. TDD-015.04 proposes a status list, while TDD-015.03 leaves open who can correct missing profile data. Confirm permitted status values, eligible statuses for submission, and which role can edit each field. | §9.1 (row 4 and the per-field write roles), TDD-015.04, TDD-015.03 (missing-data correction: HR directly vs request to Super Admin) | Avoids conflicting write permissions and eligibility behaviour. | — | Open |
| 3 | Security and deployment configuration | Finalise security and deployment configuration. Confirm TLS termination, CORS origins, rate limits, encryption at rest, accessibility standard, API timeout behaviour, error-response policy and dependency-audit thresholds. | FR-015.50, .52, .53, .58, .65, .68, .73; §11.5, §9.6; TDD-015.02 (TLS), .06 (CORS), .05 (rate limits), .07 (at rest), .08 (accessibility), .10 (API timeout), .11 (error response, 403 vs 404), .12 (dependency audit) | These decisions affect both implementation and production security. | — | Open |
| 4 | HTTP 400 vs 403 test coverage | HTTP 400 versus 403 behaviour needs clearer test coverage. Unknown fields should return 400, while known controlled-field write attempts by unauthorised users should return 403. Some negative criteria currently combine both outcomes. Separate the test cases and specify the expected response for each condition. | FR-015.05, FR-015.18, TASK-015.02, §12 error table, §14, §20, SPEC-015.NAC01 (`403/400`), TC-015.65–.78 | Each condition must have a single, testable expected response. | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/data-ownership-integration-nfr-hardening.spec.md` to
resolve every comment, fills in the Author Response column above, and resubmits SPEC-015
for Gate 1 review.
