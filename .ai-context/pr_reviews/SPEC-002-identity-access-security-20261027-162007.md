# Gate 1 PR Review: SPEC-002 — Identity, Authentication, Account Security & Authorization

> Saved as `.ai-context/pr_reviews/SPEC-002-identity-access-security-20261027-162007.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** identity-access-security (SPEC-002)
- **Spec Name:** Identity, Authentication, Account Security & Authorization
- **Spec File:** `.ai-context/specs/identity-access-security.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-27 16:20:07

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comments 1, 2 and 3
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Needs Improvement. Comments 1 and 2 (§7.1, §15.4)
4. **Technical Approach/Design:** Needs Improvement. Comments 3, 5 and 6 (§11.4, §11.5, §12.1, §12.3)
5. **Business Rules:** Needs Improvement. Comments 1 and 4 (§15.4 `?` cells, FR-002.10–.12)
6. **Validations:** Needs Improvement. Comment 4 (§14 `newPassword`, frontend/backend parity)
7. **Dependencies:** Needs Improvement. Comment 1 (Receiving Manager and HR scope from SPEC-003 / SPEC-004; per-role content from SPEC-011, SPEC-013, SPEC-014)
8. **Assumptions:** Needs Improvement. TDD-002.01, .02, .07, .10, .15, .16, .18 and .22 must become frozen decisions
9. **Edge Cases:** Needs Improvement. Comments 3, 4 and 6 (§20 lock, Unicode and logout rows)
10. **Acceptance Criteria:** Needs Improvement. Comments 5 and 6 (§21/§22 and the §12.9 error catalogue must match the frozen rules)
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** The permission matrix still has `?` cells, and several things
  are still open `[TDD-REQUIRED]` / `[PROPOSED]` decisions: the Receiving Manager and
  Super Admin User ID prefixes, the Super Admin bootstrap, IP-level brute-force
  protection and the password-policy edge cases. The spec also contradicts itself on
  the status code for a locked account (403 at login, 401 at the authentication
  middleware) and on logout of an already-revoked token. The author must turn each item
  into a frozen, explicit decision in the spec, remove the matching markers, align the
  error catalogue and acceptance tests, and resubmit SPEC-002 for Gate 1.
- **Review Comments:**

| # | Topic | Reviewer Comment | Spec Areas / Open Decision | Required Action | Author Response | Status |
|---|---|---|---|---|---|---|
| 1 | Permission matrix | Finalise the permission matrix. Resolve all `?` entries in Section 15.4, especially Receiving Manager access, HR visibility, IT employee fields, document access, audit-log access and dashboards. | §15.4 (USER_ACCOUNT, EMPLOYEE_PROFILE, VACANCY, TRANSFER_REQUEST, DOCUMENT, AUDIT_LOG, DASHBOARD/REPORT rows), §6 `TARGET_TEAM` scope; TDD-002.15 (Receiving Manager scope), TDD-002.16 (IT minimum fields), TDD-002.22 (`?` cells) | Replace every `?` with a frozen permission and scope. | — | Open |
| 2 | User ID formats and Super Admin bootstrap | Confirm User ID formats and Super Admin bootstrap. Approve the Receiving Manager and Super Admin prefixes, initial account creation, first-password delivery and recovery procedure. | §6, FR-002.05, FR-002.07, §11.7 seeder `default-super-admin`; TDD-002.01 (proposed `RCM######` / `SA######`), TDD-002.02 (seeder, `SA000001`, out-of-band password); recovery procedure not defined | Freeze the prefixes, how the first account is created, how its password is delivered, and how Super Admin access is recovered. | — | Open |
| 3 | Brute-force protection | Finalise brute-force protection. The five-failure account lock is defined, but IP-level throttling is unresolved. Confirm whether additional protection is required for distributed guessing and denial-of-service through account lockouts. | FR-002.20–.24, §12.1 Authz row, §15.2 "Brute force" row; TDD-002.18 (proposed: none this phase, defer to SPEC-015 TDD-015.05) | Decide whether to add IP throttling, CAPTCHA or another control, and add tests for each control chosen. | — | Open |
| 4 | Password policy edge cases | Confirm password policy edge cases. Approve the definition of special characters, Unicode handling and 72-byte maximum imposed by bcrypt. Confirm that the frontend and backend enforce the same rules. | FR-002.10–.12, §14 `newPassword`, §20 Unicode/emoji row, TASK-002.06 (shared policy module), TC-002.01; TDD-002.07 | Freeze the rules and test them on both the frontend and the backend. | — | Open |
| 5 | Locked-account error responses | Login error responses are inconsistent. The authentication middleware lists locked accounts as 401, while the login endpoint returns 403 `ACCOUNT_LOCKED`. | §11.4 step 5/8 and §12.1 (`403 ACCOUNT_LOCKED`) vs §11.5 step 4 (`401 ACCOUNT_LOCKED`); §12.9 lists both; FR-002.27; SPEC-002.AC12, AC14; TDD-002.09, .10 | Define separate, consistent rules for login attempts and for requests that use an existing token. Update the error catalogue and acceptance tests accordingly. | — | Open |
| 6 | Logout behaviour | Logout behaviour needs clarification. The API says logging out an already-revoked token returns 401, while logout is expected to terminate the current session. | §12.3 ("Idempotent for already-revoked tokens returns `401`"), FR-002.34, FR-002.75, TC-002.14 | Confirm whether logout is idempotent and whether logging out an expired or revoked session counts as an already-completed logout. | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/identity-access-security.spec.md` to resolve every
comment, fills in the Author Response column above, and resubmits SPEC-002 for Gate 1
review.
