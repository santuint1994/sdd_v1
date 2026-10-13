# Gate 1 PR Review: SPEC-014 — Dashboards, Worklists, Reporting & Operational Visibility

> Saved as `.ai-context/pr_reviews/SPEC-014-dashboards-worklists-reporting-20261007-164840.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** dashboards-worklists-reporting (SPEC-014)
- **Spec Name:** Dashboards, Worklists, Reporting & Operational Visibility
- **Spec File:** `.ai-context/specs/dashboards-worklists-reporting.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-07 16:48:40

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comments 1, 2, 3 and 9
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Needs Improvement. Comments 1, 3, 7 and 9 (§7.2, §7.4, §7.5, §12.8)
4. **Technical Approach/Design:** Needs Improvement. Comments 2, 3 and 11 (§10.1–10.3 `[PROPOSED]`, §13)
5. **Business Rules:** Needs Improvement. Comments 1, 2, 8 and 10 (§9)
6. **Validations:** Needs Improvement. Comments 2 and 3 (escalation settings, §14)
7. **Dependencies:** Needs Improvement. Comments 4 and 5 (scope mappings from SPEC-003 / SPEC-004)
8. **Assumptions:** Needs Improvement. TDD-014.01 to TDD-014.14 must become frozen decisions
9. **Edge Cases:** Needs Improvement. Comments 2 and 10 (BLOCKED / INFO_REQUIRED handling, §20)
10. **Acceptance Criteria:** Needs Improvement. These must be updated to cover the frozen decisions (§21, §22)
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** The dashboard card calculations, overdue/escalation rules,
  role-based visibility scopes, report permissions, report export, completion-time
  calculation and accessibility target are still open `[TDD-REQUIRED]` / `[PROPOSED]`
  decisions. The author must turn each one into a frozen, explicit decision in the spec,
  remove the matching markers, and resubmit SPEC-014 for Gate 1.
- **Review Comments:**

| # | Topic | Reviewer Comment | Spec Areas / Open Decision | Author Response | Status |
|---|---|---|---|---|---|
| 1 | Dashboard card definitions | Freeze the exact calculation for Total Employees, Pending Approvals, HR Reviews and Blocked Tasks. | §7.2, §12.1, TDD-014.01–TDD-014.04 | — | Open |
| 2 | Overdue rules | Confirm which stages can become overdue, calendar vs business hours, clock reset behaviour, and how BLOCKED / INFO_REQUIRED are treated. | §7.4, §10.3 `overdue_flags`, TDD-014.05 (BRD-OQ-10: no thresholds proposed) | — | Open |
| 3 | Escalation rules | Confirm the recipients, notification channel, repeat reminders, and behaviour when a threshold is activated. | §7.4, §10.1–10.2, §12.7, §19, TDD-014.06 (SPEC-012 alignment) | — | Open |
| 4 | HR visibility scope | Confirm whether HR sees requests based on current location, target location, assigned HR, or another rule. | §6, §7.1, TDD-014.07 (SPEC-003 HR scope mapping) | — | Open |
| 5 | Receiving Manager scope | Finalise the target department/team mapping and the definition of "incoming transfer". | §6, §7.3, TDD-014.08 (SPEC-003 `receiving_manager_scopes`) | — | Open |
| 6 | IT data visibility | Freeze the exact minimum fields IT users can see. | §12.4, §15, TDD-014.09 (NFR-007; align with SPEC-013 §15.2) | — | Open |
| 7 | Report permissions | Approve the role × report matrix, including vacancy-report visibility. | §7.5, §12.5–12.6, TDD-014.10 (Matrix R-1) | — | Open |
| 8 | Employee clarification action | Confirm who counts as the responsible user when a clarification is raised at different workflow stages. | §7.3, §12.3, TDD-014.11 (BRD-034) | — | Open |
| 9 | Report export | Confirm whether export is required at all, and if so the formats, roles and limits. | §12.8 `[TDD-REQUIRED]`, TDD-014.12 (align with SPEC-013 export rules) | — | Open |
| 10 | Completion-time calculation | Confirm whether BLOCKED / INFO_REQUIRED periods are included. | §7.5, TDD-014.13 | — | Open |
| 11 | Accessibility standard | Approve the proposed WCAG 2.1 AA target and UI/chart approach. | §13.5, TDD-014.14 (NFR-008) | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/dashboards-worklists-reporting.spec.md` to resolve
every comment, fills in the Author Response column above, and resubmits SPEC-014 for
Gate 1 review.
