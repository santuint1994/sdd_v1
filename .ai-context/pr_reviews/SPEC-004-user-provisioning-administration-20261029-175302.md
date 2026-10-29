# Gate 1 PR Review: SPEC-004 — User Provisioning, Role Assignment & User Administration

> Saved as `.ai-context/pr_reviews/SPEC-004-user-provisioning-administration-20261029-175302.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** user-provisioning-administration (SPEC-004)
- **Spec Name:** User Provisioning, Role Assignment & User Administration
- **Spec File:** `.ai-context/specs/user-provisioning-administration.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-29 17:53:02

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comment 1 (decisions not formally recorded)
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Needs Improvement. Comment 1 (role provisioning, deactivation with pending work)
4. **Technical Approach/Design:** Needs Improvement. Comment 2 (FR-004.18 outbox-in-transaction vs Option B)
5. **Business Rules:** Needs Improvement. Comment 1 (employment status, activation/reset rules)
6. **Validations:** Needs Improvement. Comment 1 (required fields per role)
7. **Dependencies:** Needs Improvement. Comment 2 (SPEC-012 / shared notification contract; SPEC-001 outbox)
8. **Assumptions:** Needs Improvement. TDD-004.01–.16 must be formally decided or explicitly deferred
9. **Edge Cases:** Needs Improvement. Comment 2 (delivery failure and retry without a persisted password)
10. **Acceptance Criteria:** Needs Improvement. Comment 2 (NAC07, NAC30, outbox-related tests)
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** Gate 1 decisions affecting implementation are not formally
  recorded. The spec itself says the formal Gate 1 record is pending for key decisions.
  Credential delivery is still described as an outbox enqueue inside the creation
  transaction, which conflicts with the in-memory, post-commit approach (Option B) with
  no persisted plaintext. The author must record or explicitly defer each TDD, align
  credential delivery with SPEC-012 and the shared notification contract, and resubmit
  SPEC-004 for Gate 1.
- **Review Comments:**

| # | Priority | Finding | Required Action | Spec Areas / Open Decision | Author Response | Status |
|---|---|---|---|---|---|---|
| 1 | High | Gate 1 decisions are not formally recorded. Multiple TDDs affect implementation, including role provisioning, required fields, employment status, deactivation with pending work, and activation/reset rules. The spec itself says the Gate 1 record is pending for key decisions. | Record formal decisions and close or explicitly defer each TDD before approval. | TDD-004.01–.03 (role provisioning: Receiving Manager / Super Admin prefixes `MGR` / `ADM`, creation path, bootstrap), .04, .05 (employment status; = SPEC-006 TDD-006.03, SPEC-015 TDD-015.04), .08 (required fields per role, FR-004.09), .09, .10 (deactivation with pending work), .12, .14 (activation), .15 (temp password / reset); TDD-004.07 and TDD-004.11 marked "[DECIDED 2026-10-07]" but "formal Gate 1 record is still to be captured" | — | Open |
| 2 | High | Credential delivery and outbox behaviour need alignment. The spec says email is queued inside the transaction, but the approved proposed approach is in-memory post-commit delivery with no persisted plaintext. | Align SPEC-004 with SPEC-012 and the shared notification contract, including how delivery status and retries work without persisting the temporary password. | FR-004.18 (`NotificationService.enqueue('USER_ACCOUNT_CREATED', …, {trx})` inside the creation transaction), FR-004.19 (still `[TDD-REQUIRED]`, keeps Option A fallback with `CREDENTIAL_PAYLOAD_KEY`), `deliveryStatus` `QUEUED/SENT/FAILED`, TASK-004.12, TASK-004.13, §17 transaction rules, §18 `USER_CREDENTIALS_DELIVERY_QUEUED`, NAC07, NAC30; §12 create/reset responses return `temporaryPassword` ("shown once"); TDD-004.07 (= TDD-012.04 = TDD-001.04) | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/user-provisioning-administration.spec.md` to resolve
every comment, fills in the Author Response column above, and resubmits SPEC-004 for Gate 1
review.
