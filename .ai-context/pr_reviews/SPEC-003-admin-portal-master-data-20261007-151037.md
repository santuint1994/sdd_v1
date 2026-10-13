# Gate 1 PR Review: SPEC-003 — Administration Portal, Master Data & Organisation Structure

> Saved as `.ai-context/pr_reviews/SPEC-003-admin-portal-master-data-20261007-151037.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** admin-portal-master-data (SPEC-003)
- **Spec Name:** Administration Portal, Master Data & Organisation Structure
- **Spec File:** `.ai-context/specs/admin-portal-master-data.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-07 15:10:37

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comments 1, 3, 5 and 6
2. **Requirement Understanding:** Passed. The spec is technically detailed
3. **Functional Scope:** Needs Improvement. Comments 1, 3 and 5 (§7.6, §7.7)
4. **Technical Approach/Design:** Needs Improvement. Comments 2 and 7 (§10, §11.3)
5. **Business Rules:** Needs Improvement. Comments 1, 3, 4 and 5 (§9)
6. **Validations:** Needs Improvement. Comment 6 (§14)
7. **Dependencies:** Needs Improvement. Comment 7 (§4, §11.3)
8. **Assumptions:** Needs Improvement. The `[TDD-REQUIRED]` / `[PROPOSED]` items must become frozen decisions
9. **Edge Cases:** Needs Improvement. Comment 5 (§20)
10. **Acceptance Criteria:** Needs Improvement. These must be updated to cover the frozen decisions (§21)
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** The spec is technically detailed. However, development must not
  start until the decisions below are finalised and approved at Gate 1. The author must
  turn each open or `[TDD-REQUIRED]` item into a frozen, explicit decision in the spec and
  then resubmit SPEC-003 for Gate 1.
- **Review Comments:**

| # | Topic | Reviewer Comment | Spec Areas Affected | Author Response | Status |
|---|---|---|---|---|---|
| 1 | Receiving Manager mapping | Finalise how the Receiving Manager (RM) is mapped: Department/BU, Location, multiple RMs, and the assignment rules. | §7.7, §10.4 `receiving_manager_scopes` `[TDD-REQUIRED]`, §11.4, §12.3 | — | Open |
| 2 | Department vs Business Unit | Confirm whether Department/BU is a flat master or a hierarchical structure. | §7.5, §10.1, §12.1 | — | Open |
| 3 | HR/IT assignment | Define how HR and IT users are mapped to employees, locations and departments, and how the system selects the correct user. | §7.7, §10.2 `hr_scope_mappings`, §10.3 `it_location_scopes`, §11.4 | — | Open |
| 4 | User roles | Confirm whether a user can have multiple roles or only one role. | §6, §15 (and SPEC-002 / SPEC-004 alignment) | — | Open |
| 5 | Master deactivation | Define what happens when a Location, Department or Designation is deactivated while it is still in use. | §7.6, §10.5 dependency matrix, §20 | — | Open |
| 6 | Master data rules | Freeze the mandatory fields, code/name uniqueness, formats, length limits, and which fields are editable. | §7.5, §10.1, §14 | — | Open |
| 7 | Inter-SPEC dependencies | Freeze the interfaces and data contracts with SPEC-002, SPEC-004, SPEC-005 and the workflow-related specs (SPEC-007 to SPEC-010) before development. | §4, §5, §11.3 provider contracts `[PROPOSED]`, §7.8 ScopeResolver | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/admin-portal-master-data.spec.md` to resolve every
comment, fills in the Author Response column above, and resubmits SPEC-003 for Gate 1
review.
