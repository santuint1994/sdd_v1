# Gate 1 Review — In Progress (resume tracker)

> Temporary tracker for the Gate 1 review of the 16-spec set. Reviewer: Shamik Bhattacharya
> (shamik.bhattacharya@intglobal.com, verified against the roster). Feedback is being
> submitted one spec at a time. **Do not sync** the spec files, `status.md`,
> `dashboard.html` or `prompt_history.md` until the reviewer gives the final verdict.
> Delete this tracker once the final verdict has been recorded.

- **Started:** 2026-10-07 (resumed 2026-10-13)
- **Overall verdict:** Pending. Waiting for the reviewer's final confirmation

| SPEC | Slug | Feedback Logged | Per-Spec Status | Review File |
|---|---|---|---|---|
| SPEC-001 | project-foundation-architecture | No | — | — |
| SPEC-002 | identity-access-security | No | — | — |
| SPEC-003 | admin-portal-master-data | Yes (7 comments) | Changes Requested | `SPEC-003-admin-portal-master-data-20261007-151037.md` |
| SPEC-004 | user-provisioning-administration | No | — | — |
| SPEC-005 | vacancy-capacity-reservation | No | — | — |
| SPEC-006 | transfer-initiation-eligibility | No | — | — |
| SPEC-007 | transfer-workflow-approval-lifecycle | No | — | — |
| SPEC-008 | hr-review-processing-reapproval | Yes (12 blockers + 9 observations) | Changes Requested (Not Ready for Approval) | `SPEC-008-hr-review-processing-reapproval-20261013-173451.md` |
| SPEC-009 | payroll-it-completion | No | — | — |
| SPEC-010 | transfer-exception-controls | No | — | — |
| SPEC-011 | secure-document-management | No | — | — |
| SPEC-012 | notification-framework | No | — | — |
| SPEC-013 | audit-compliance-security-events | Yes (9 blockers) | Changes Requested | `SPEC-013-audit-compliance-security-events-20261007-151808.md` |
| SPEC-014 | dashboards-worklists-reporting | Yes (11 comments) | Changes Requested | `SPEC-014-dashboards-worklists-reporting-20261007-164840.md` |
| SPEC-015 | data-ownership-integration-nfr-hardening | No | — | — |
| SPEC-016 | qa-uat-traceability | No | — | — |

## Cross-Spec Overlaps Noted
- SPEC-014 #4 and #5 (HR / Receiving Manager scope) depend on SPEC-003 #1 and #3.
- SPEC-014 #6 (IT minimum fields) is the same question as SPEC-013 #2 (role-wise visibility).
- SPEC-014 #9 (report export) should follow SPEC-013 #8 (audit export rules).
- SPEC-013 #2 depends on the SPEC-003 scope mappings (#1, #3).
- SPEC-008 BLOCKER 06 (Receiving Manager selection) depends on SPEC-003 #1.
- SPEC-008 BLOCKER 09 (HR scope and assignment) is the same question as SPEC-003 #3 and SPEC-014 #4.
- SPEC-008 BLOCKER 02 (payroll-reference format, TDD-008.11) is shared with SPEC-009 (TDD-009.02).
- SPEC-008 BLOCKER 12 must follow the SPEC-011 upload rules; OBS-04 must align with SPEC-012.
