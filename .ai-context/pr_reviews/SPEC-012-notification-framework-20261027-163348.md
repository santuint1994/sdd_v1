# Gate 1 PR Review: SPEC-012 — Notification & Communication Framework

> Saved as `.ai-context/pr_reviews/SPEC-012-notification-framework-20261027-163348.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** notification-framework (SPEC-012)
- **Spec Name:** Notification & Communication Framework
- **Spec File:** `.ai-context/specs/notification-framework.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-27 16:33:48

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comment 1 (post-commit handoff and crash recovery not defined precisely)
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Needs Improvement. Comment 1 (Option A scope still present in §7.5, §8, §10, §11)
4. **Technical Approach/Design:** Needs Improvement. Comment 1 (§7.5, §10.1 `secret_id`, §10.5, §11.3, §11.4)
5. **Business Rules:** Needs Improvement. Comment 2 (FR-012.09, §20 deactivated-recipient row)
6. **Validations:** Passed
7. **Dependencies:** Needs Improvement. Comment 1 (SPEC-001 outbox, SPEC-004 creation/reset flow, merged TDD-001.04 / TDD-004.07)
8. **Assumptions:** Needs Improvement. TDD-012.04 must be recorded as frozen (Option B); TDD-012.05 dropped or rescoped; TDD-012.07 frozen
9. **Edge Cases:** Needs Improvement. Comments 1 and 2 (§20 secret-expiry and deactivated-recipient rows; process crash)
10. **Acceptance Criteria:** Needs Improvement. Comment 1 (SPEC-012.NAC14, TC-012.06, TC-012.19 are Option A only); comment 2 needs criteria for email and in-app
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** The credential-handoff design contradicts the selected decision.
  TDD-012.04 selects Option B (in-memory handoff), but the requirements, data model,
  migrations, environment variables, tasks and tests still build the Option A encrypted
  `notification_secrets` store. The post-commit handoff and crash recovery for Option B
  are not defined precisely. Handling of inactive recipients also differs by stage:
  new notifications are skipped, but already-enqueued notifications may still be
  delivered. The author must resolve both items, remove the matching markers, and
  resubmit SPEC-012 for Gate 1.
- **Review Comments:**

| # | Topic | Reviewer Comment | Spec Areas / Open Decision | Required Action | Author Response | Status |
|---|---|---|---|---|---|---|
| 1 | Credential handoff vs selected decision | Credential handoff conflicts with the selected decision. TDD-012.04 selects Option B (in-memory handoff), but requirements and tasks still include the `notification_secrets` table, AES encryption, secret expiry and purge logic. | FR-012.31–.36; §10.1 `secret_id` FK; §10.5 `notification_secrets`; §11.1 `SecretHandoffService` / `secretRepository`; §11.3 `NOTIFICATION_SECRET_*` env vars; §11.4 step 3; §18 `NOTIFICATION_SECRET_EXPIRED`; §20 secret-expiry row; TASK-012.01, .02, .07, .12, .20; SPEC-012.NAC14; TC-012.06, TC-012.19; TDD-012.04 (= TDD-001.04 = TDD-004.07, still marked TDD-REQUIRED), TDD-012.05 | Remove the Option A requirements, database fields, migrations and tasks, or scope them so they apply only if Option A is chosen. Define precisely how the in-memory credential is handed to the email sender after commit, and how a process crash is recovered without persisting the plaintext. Record Option B as the frozen decision in TDD-012.04. | — | Open |
| 2 | Inactive-recipient handling across the lifecycle | Inactive-recipient handling is inconsistent across the lifecycle. New notifications to inactive users are skipped, but already-enqueued notifications may still be delivered. | FR-012.09 (skip at enqueue, except `USER_ACCOUNT_CREATED` / `CREDENTIAL_RESET`), §11.2 step 4, §11.4 dispatcher, §20 "Recipient deactivated between enqueue and send" (email still sent; in-app row created but unreachable); TDD-012.07, TDD-012.15 | Confirm the business rule for users deactivated between enqueue and dispatch, and apply it consistently to email and in-app delivery. | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/notification-framework.spec.md` to resolve every
comment, fills in the Author Response column above, and resubmits SPEC-012 for Gate 1
review.
