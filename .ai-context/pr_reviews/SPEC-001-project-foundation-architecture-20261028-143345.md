# Gate 1 PR Review: SPEC-001 — Project Foundation, Architecture & Database Foundation

> Saved as `.ai-context/pr_reviews/SPEC-001-project-foundation-architecture-20261028-143345.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** project-foundation-architecture (SPEC-001)
- **Spec Name:** Project Foundation, Architecture & Database Foundation
- **Spec File:** `.ai-context/specs/project-foundation-architecture.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-28 14:33:45

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comment 3 (which tables, if any, permit deletion)
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Passed
4. **Technical Approach/Design:** Needs Improvement. Comments 1 and 2 (outbox schema, `enqueue` contract, `secret_id`)
5. **Business Rules:** Needs Improvement. Comment 3 (FR-001.31 vs FR-001.35)
6. **Validations:** Needs Improvement. Comment 1 (§14 outbox payload rule uses `dedupeKey`)
7. **Dependencies:** Needs Improvement. Comments 1 and 2 (SPEC-012 delivery model; SPEC-004 / SPEC-012 credential handoff)
8. **Assumptions:** Needs Improvement. TDD-001.04 decision needs a formal Gate 1 record
9. **Edge Cases:** Needs Improvement. Comment 1 (E-001.14 must match the chosen key)
10. **Acceptance Criteria:** Needs Improvement. Comment 1 (SPEC-001.AC07, TC-001.11); comment 3 (privilege tests)
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** The notification outbox is described two ways: as an
  event-level row with a unique `event_key`, and as recipient/channel-level
  deduplication. The schema still references the Option A `notification_secrets` store
  even though Option B is recorded as decided. The no-deletion policy contradicts the
  runtime role's `DELETE` grant on business tables. The author must align the schema,
  contracts, privileges and tests with the approved decisions and resubmit SPEC-001 for
  Gate 1.
- **Review Comments:**

| # | Priority | Finding | Spec Areas / Open Decision | Required Action | Author Response | Status |
|---|---|---|---|---|---|---|
| 1 | Critical | Notification idempotency mismatch: FR-001.53 defines uniqueness by deduplication key, channel and recipient, but the database schema defines `event_key` as the unique key on an event-level outbox row. AC07 also expects recipient/channel-level deduplication. | FR-001.51 (event-level row; fan-out in SPEC-012 `notification_deliveries`), FR-001.53 (unique `(dedupe_key, channel, recipient_user_id)`), §10 `notification_outbox` (`event_key` UNIQUE, `uq_notification_outbox_event_key`), §11 `NotificationPayload` (`recipients[]`, `dedupeKey`), §14 outbox payload rule (`dedupeKey`), E-001.14, TASK-001.18, SPEC-001.AC07, TC-001.11 | Align the schema, `NotificationService.enqueue` contract and acceptance tests with the event-level outbox and SPEC-012 delivery model. | — | Open |
| 2 | Critical | Credential-delivery schema conflict: TDD-001.04 records Option B as decided, with no plaintext credential persistence and no `notification_secrets` store. However, the outbox schema still references `secret_id` and `notification_secrets`. | §10 `notification_outbox.secret_id` ("added by SPEC-012 (`notification_secrets` ...)"), §3 BRD-OQ-03 row, SEC-001.09; TDD-001.04 (DECIDED 2026-10-07, Option B; "formal Gate 1 record is still to be captured"; the same row also still says "remains TDD-REQUIRED") = TDD-012.04 = TDD-004.07 | Remove or explicitly reconcile the obsolete Option A schema references and align SPEC-001, SPEC-004 and SPEC-012 with the recorded decision. Capture the formal Gate 1 decision record. | — | Open |
| 3 | High | Business-record deletion policy conflict: FR-001.31 says business records should not be deleted, but FR-001.35 grants the application role `DELETE` on business tables. | FR-001.31 (no deletion; hard `DELETE` only for technical tables such as outbox housekeeping), FR-001.35 (`sdd_app`: `SELECT/INSERT/UPDATE/DELETE` on business tables), `scripts/db/roles.sql`, SEC-001.08, TC-001.33; related TDD-015.17 (DB role separation) | Define and enforce which tables, if any, permit application-level deletion. Ensure the privileges match the approved policy. | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/project-foundation-architecture.spec.md` to resolve
every comment, fills in the Author Response column above, and resubmits SPEC-001 for
Gate 1 review.
