# Gate 1 PR Review: SPEC-013 — Audit, Compliance & Security Event Management

> Saved as `.ai-context/pr_reviews/SPEC-013-audit-compliance-security-events-20261007-151808.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** audit-compliance-security-events (SPEC-013)
- **Spec Name:** Audit, Compliance & Security Event Management
- **Spec File:** `.ai-context/specs/audit-compliance-security-events.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-07 15:18:08

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comments 2, 3, 4 and 7
2. **Requirement Understanding:** Passed. The spec is well detailed and largely aligned with the final BRD
3. **Functional Scope:** Needs Improvement. Comments 2, 3, 4 and 8 (§7.5, §12.4, §12.5)
4. **Technical Approach/Design:** Needs Improvement. Comments 5 and 6 (§7.3, §10.3, §10.6, §11)
5. **Business Rules:** Needs Improvement. Comments 1, 4 and 7 (§9, §17)
6. **Validations:** Needs Improvement. Comment 8 (export limits, §14)
7. **Dependencies:** Needs Improvement. Comment 6 (PostgreSQL version, pgcrypto, DB roles: SPEC-001 / SPEC-015)
8. **Assumptions:** Needs Improvement. The `[TDD-REQUIRED]` / `[PROPOSED]` decisions can change the backend, DB, security and API implementation and must be frozen
9. **Edge Cases:** Needs Improvement. Comments 1 and 9 (§17, §20)
10. **Acceptance Criteria:** Needs Improvement. These must be updated to cover the frozen decisions (§21, §22)
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** The spec is well detailed and largely aligned with the final
  BRD. However, it still contains several `[TDD-REQUIRED]` / `[PROPOSED]` decisions that can
  change the backend, DB, security and API implementation, and the spec is still marked
  Draft / not submitted for Gate 1. All nine blockers below must be closed before
  development. The author must turn each one into a frozen, explicit decision in the spec,
  remove the matching `[PROPOSED]` / `[TDD-REQUIRED]` markers, update the Status section,
  and resubmit SPEC-013 for Gate 1.
- **Review Comments (blockers to close before development):**

| # | Topic | Reviewer Comment | Spec Areas / Open Decision | Author Response | Status |
|---|---|---|---|---|---|
| 1 | Audit failure behaviour | Confirm whether a business transaction must roll back when the audit write fails. | TR-013.01–.03, TDD-013.02 (proposed: fail-closed for material actions, independent write + spool for denials) | — | Open |
| 2 | Role-wise audit visibility | Finalise exactly what HR, IT, Reporting Manager and Receiving Manager can see. | §15.2 `[PROPOSED]`, TDD-013.03; depends on SPEC-003 scope mappings | — | Open |
| 3 | Employee audit access | Confirm whether employees can see their own audit timeline and exactly which events are visible. | §15.2 EMPLOYEE row `[TDD-REQUIRED]`, §12.4, TDD-013.04 | — | Open |
| 4 | Previous assignee visibility | Confirm whether the previous assignee can see the complete transfer history or only the history before reassignment. | FR-013.22, BR-013.08, TDD-013.05 | — | Open |
| 5 | Tamper-proof mechanism | Approve the proposed hash/sealing approach or provide the final approach. | FR-013.09, §10.3 `audit_seals`, TDD-013.01, TDD-013.11 (external anchoring) | — | Open |
| 6 | Database/infra dependency | Confirm the PostgreSQL version, pgcrypto, the DB roles, and whether the proposed audit partitioning approach is supported. | §10.6 `[PROPOSED]`, TASK-013.03, TDD-013.09, TDD-013.10, TDD-013.12 | — | Open |
| 7 | Draft audit behaviour | Confirm whether Draft creation and Draft changes need to be audited. | TDD-013.13, §18.6 | — | Open |
| 8 | Export rules | Freeze the export format and the maximum export size/behaviour. | FR-013.23 `[TDD-REQUIRED]`, §12.5, TDD-013.06, TDD-013.07 (`AUDIT_EXPORT_MAX_ROWS`, sync vs async, re-auth) | — | Open |
| 9 | Final API/security rules | Freeze the proposed 403/404 behaviour and the audit timestamp/time-zone rules. | FR-013.03 `[PROPOSED]`, §12.1–12.2, TDD-013.14, TDD-013.15 | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/audit-compliance-security-events.spec.md` to resolve
every blocker, fills in the Author Response column above, and resubmits SPEC-013 for
Gate 1 review.
