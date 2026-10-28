# Gate 1 Review — In Progress (resume tracker)

> Temporary tracker for the Gate 1 review of the 16-spec set. Reviewer: Shamik Bhattacharya
> (shamik.bhattacharya@intglobal.com, verified against the roster). Feedback is being
> submitted one spec at a time. **Do not sync** the spec files, `status.md`,
> `dashboard.html` or `prompt_history.md` until the reviewer gives the final verdict.
> Delete this tracker once the final verdict has been recorded.

- **Started:** 2026-10-07 (resumed 2026-10-13, 2026-10-27)
- **Overall verdict:** Pending. Waiting for the reviewer's final confirmation

| SPEC | Slug | Feedback Logged | Per-Spec Status | Review File |
|---|---|---|---|---|
| SPEC-001 | project-foundation-architecture | Yes (2 critical + 1 high) | Changes Requested | `SPEC-001-project-foundation-architecture-20261028-143345.md` |
| SPEC-002 | identity-access-security | Yes (6 comments) | Changes Requested | `SPEC-002-identity-access-security-20261027-162007.md` |
| SPEC-003 | admin-portal-master-data | Yes (7 comments) | Changes Requested | `SPEC-003-admin-portal-master-data-20261007-151037.md` |
| SPEC-004 | user-provisioning-administration | No | — | — |
| SPEC-005 | vacancy-capacity-reservation | No | — | — |
| SPEC-006 | transfer-initiation-eligibility | Yes (4 high) | Changes Requested | `SPEC-006-transfer-initiation-eligibility-20261028-174721.md` |
| SPEC-007 | transfer-workflow-approval-lifecycle | No | — | — |
| SPEC-008 | hr-review-processing-reapproval | Yes (12 blockers + 9 observations) | Changes Requested (Not Ready for Approval) | `SPEC-008-hr-review-processing-reapproval-20261013-173451.md` |
| SPEC-009 | payroll-it-completion | Yes (4 critical + 1 comment) | Changes Requested | `SPEC-009-payroll-it-completion-20261027-164407.md` |
| SPEC-010 | transfer-exception-controls | Yes (2 comments) | Changes Requested | `SPEC-010-transfer-exception-controls-20261028-153226.md` |
| SPEC-011 | secure-document-management | Yes (4 high) | Changes Requested | `SPEC-011-secure-document-management-20261028-145216.md` |
| SPEC-012 | notification-framework | Yes (2 comments) | Changes Requested | `SPEC-012-notification-framework-20261027-163348.md` |
| SPEC-013 | audit-compliance-security-events | Yes (9 blockers) | Changes Requested | `SPEC-013-audit-compliance-security-events-20261007-151808.md` |
| SPEC-014 | dashboards-worklists-reporting | Yes (11 comments) | Changes Requested | `SPEC-014-dashboards-worklists-reporting-20261007-164840.md` |
| SPEC-015 | data-ownership-integration-nfr-hardening | Yes (4 comments) | Changes Requested | `SPEC-015-data-ownership-integration-nfr-hardening-20261027-125458.md` |
| SPEC-016 | qa-uat-traceability | Yes (no comments) | Approved | `SPEC-016-qa-uat-traceability-20261028-144719.md` |

## Cross-Spec Overlaps Noted
- SPEC-014 #4 and #5 (HR / Receiving Manager scope) depend on SPEC-003 #1 and #3.
- SPEC-014 #6 (IT minimum fields) is the same question as SPEC-013 #2 (role-wise visibility).
- SPEC-014 #9 (report export) should follow SPEC-013 #8 (audit export rules).
- SPEC-013 #2 depends on the SPEC-003 scope mappings (#1, #3).
- SPEC-008 BLOCKER 06 (Receiving Manager selection) depends on SPEC-003 #1.
- SPEC-008 BLOCKER 09 (HR scope and assignment) is the same question as SPEC-003 #3 and SPEC-014 #4.
- SPEC-008 BLOCKER 02 (payroll-reference format, TDD-008.11) is shared with SPEC-009 (TDD-009.02).
- SPEC-008 BLOCKER 12 must follow the SPEC-011 upload rules; OBS-04 must align with SPEC-012.
- SPEC-015 #1 (TDD-015.03 profile update on completion) is the same decision as TDD-004.11 and is implemented by SPEC-009 FR-009.56a; HR/IT assignment re-derivation ties to SPEC-003 #3, SPEC-008 BLOCKER 09 and SPEC-014 #4.
- SPEC-015 #3 accessibility standard (TDD-015.08) is the same question as SPEC-014 #11 (WCAG 2.1 AA).
- SPEC-002 #1 matrix cells depend on SPEC-003 #1/#3 (Receiving Manager and HR scope), SPEC-014 #4–#7 (dashboard and report visibility, IT fields), SPEC-013 #2 (audit visibility) and SPEC-011 (document access).
- SPEC-002 #3 (IP throttling, TDD-002.18) is deferred to SPEC-015 rate limits (SPEC-015 #3, TDD-015.05). Decide these together.
- SPEC-002 #5 (401 vs 403) should follow the same error-response policy as SPEC-015 #3 (TDD-015.11) and SPEC-015 #4.
- SPEC-012 #1 (TDD-012.04, Option B) is the merged decision with TDD-001.04 and TDD-004.07. Also check SPEC-001 (outbox) and SPEC-004 (credential creation/reset flow) for leftover Option A artefacts.
- SPEC-009 #1 (Super Admin date-correction scope) must align with the SPEC-008 HR date route (`TransferDateService`); #2 depends on the SPEC-007 date-change re-approval evaluator.
- SPEC-009 #4 (task vs transfer Block) depends on the SPEC-010 transfer-level Block, SPEC-012 `TASK_BLOCKED` recipients and SPEC-014 #2 (overdue, BLOCKED handling).
- SPEC-009 #5 (Payroll reference format, TDD-009.02) is shared with SPEC-008 BLOCKER 02 (TDD-008.11).
- SPEC-001 #1 (outbox idempotency) must match the SPEC-012 event-level outbox and `notification_deliveries` fan-out.
- SPEC-001 #2 and SPEC-012 #1 are the same credential-handoff fix (TDD-001.04 = TDD-012.04 = TDD-004.07, Option B). SPEC-004 must be aligned as well.
- SPEC-001 #3 (DB privileges) should align with SPEC-015 TDD-015.17 (runtime vs migration roles).
- SPEC-006 #1 employment-status values (TDD-006.03) are the same decision as SPEC-015 #2 (TDD-015.04).
- SPEC-006 #2 (403 vs 404 enumeration) should follow one policy with SPEC-002 TDD-002.11 and SPEC-015 TDD-015.11.
- SPEC-006 #4 (submit contract) depends on SPEC-007 `WorkflowEngine.transition`, history, task assignment and `getAllowedActions`.
- SPEC-010 #1 (IT task selection on Reassign) depends on SPEC-009 TDD-009.04 / .05; SPEC-010 #2 depends on the SPEC-005 release/revalidation contracts, the SPEC-009 `cancelOpenTasks` hook and the SPEC-015 lock order. SPEC-009 #4 (task vs transfer Block) also touches SPEC-010.
- SPEC-011 #1 (document permissions) is the same matrix as the SPEC-002 #1 DOCUMENT rows; Receiving Manager scope depends on SPEC-003 #1.
- SPEC-011 #3 (IT evidence contract, `it_task_id`) must be decided together with SPEC-009 (TDD-009.10, `it_tasks`).
- SPEC-011 #4 (audit and fail-closed policy) should follow SPEC-013's audit rules.
- SPEC-012 #2 (deactivated recipients) depends on the SPEC-002 / SPEC-004 deactivation flow and should stay consistent with SPEC-008 OBS-04.
