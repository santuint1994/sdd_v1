# Gate 1 PR Review: SPEC-008 — HR Review, Organisation Processing & Receiving Manager Re-Approval

> Saved as `.ai-context/pr_reviews/SPEC-008-hr-review-processing-reapproval-20261013-173451.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** hr-review-processing-reapproval (SPEC-008)
- **Spec Name:** HR Review, Organisation Processing & Receiving Manager Re-Approval
- **Spec File:** `.ai-context/specs/hr-review-processing-reapproval.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested. **NOT READY FOR APPROVAL**
- **Review Date/Time:** 2026-10-13 17:34:51

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Blockers 01, 04, 05, 07 and 10
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Needs Improvement. Blockers 03, 05, 06 and 07
4. **Technical Approach/Design:** Needs Improvement. Blocker 08 (data model supports only one trigger type per cycle); OBS-06
5. **Business Rules:** Needs Improvement. Blockers 01, 03, 09 and 11; OBS-01 and OBS-05
6. **Validations:** Needs Improvement. Blocker 02 (100 vs 50 chars); Blocker 12; OBS-02 and OBS-08
7. **Dependencies:** Needs Improvement. Blockers 10 and 12; OBS-03 and OBS-09 (SPEC-005, 009, 010, 011, 012, 015)
8. **Assumptions:** Needs Improvement. TDD-008.01 to TDD-008.11 must become frozen decisions
9. **Edge Cases:** Needs Improvement. Blocker 08 (edge case 20); OBS-03 and OBS-06
10. **Acceptance Criteria:** Needs Improvement. Add tests for the frozen rules (OBS-02 positive/negative vacancy matching; TC-008.55–008.60 retries)
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** **NOT READY FOR APPROVAL.** Twelve blockers are mandatory before
  approval. Nine additional observations must also be addressed in the spec; some of these
  can be closed by confirming the proposed default, while others need workflow or
  implementation changes. The author must resolve every item, remove the matching
  `[PROPOSED]` / `[TDD-REQUIRED]` markers, and resubmit SPEC-008 for Gate 1.

### 1. Mandatory Feedback Before Approval (Blockers)

| # | Topic | Feedback to Developer | Required Action | Reference | Author Response | Status |
|---|---|---|---|---|---|---|
| BLOCKER 01 | Finalise the mandatory HR Processing checklist | The spec proposes five organisation-confirmation activities and HR Confirmation as mandatory, while payroll-reference assignment, document upload and organisation-metadata updates are optional. These defaults still need a formal decision. Confirm which HR activities are mandatory and which can be marked Not Applicable. | Obtain business approval for the activity list. Use the same rules in the database, UI, completion validation and the downstream Payroll handoff. | FR-008.41–008.49; TDD-008.01 | — | Open |
| BLOCKER 02 | Resolve the payroll-reference requirement | Payroll-reference assignment is treated as optional, but Payroll Processing depends on the reference. The maximum length is inconsistent: 100 characters in FR-008.44, 50 characters in the API (§12.8) and validation rules (§14). | Confirm whether the reference is mandatory, when it must be available, and its format and maximum length. The HR checklist and the Payroll module must use the same validation rules. | FR-008.42–008.44; §12.8, §14; TDD-008.11 (= TDD-009.02, shared with SPEC-009) | — | Open |
| BLOCKER 03 | Clarify which stages allow HR to change organisation data | Department, designation, location and vacancy changes are limited to HR Processing by default, but the underlying requirement also refers to changes during HR validation. This is still a technical design decision. | Confirm whether these changes are allowed only in `HR_PROCESSING` or also in `PENDING_HR_REVIEW`. Apply the rule consistently to APIs, workflow transitions and UI actions. | FR-008.50–008.53; TDD-008.03 | — | Open |
| BLOCKER 04 | Define how missing employee data is corrected | HR approval is blocked if mandatory employee organisation data is missing, but HR changes only the Transfer Request data and does not update the external HR master. It is unclear how missing current employee data is actually corrected. | Define who corrects the missing data, which system or screen is used, and how HR revalidates the request afterwards. The workflow must not stay stuck in clarification without a defined way out. | FR-008.10–008.13, FR-008.40; TDD-008.09 | — | Open |
| BLOCKER 05 | Complete the clarification workflow | The spec proposes that employees respond to HR clarifications and HR responds to Receiving Manager clarifications, but the responder rules are unconfirmed and employees cannot directly edit submitted request data. | Confirm who responds to each clarification, what information or documents they can submit, how corrected data reaches the authorised user, and how the request returns to the correct stage. Repeated clarification cycles must keep the full history. | FR-008.34–008.36, FR-008.66; TDD-008.02 | — | Open |
| BLOCKER 06 | Resolve Receiving Manager selection and re-approval ownership | When HR changes the department, location or other approved organisation fields, the request must go back to the applicable Receiving Manager, but the rule for identifying that manager after an organisation change is unconfirmed. | Define how the Receiving Manager is identified when the target organisation changes, what happens if no eligible manager is mapped, and whether an open re-approval cycle stays valid when the configuration changes. | FR-008.60–008.69; TDD-008.06 (depends on SPEC-003 comment 1) | — | Open |
| BLOCKER 07 | Define date-change re-approval completely | Re-approval on an effective-date change is configurable, but the approval stage, the approver and the return stage still need a final decision. | Confirm which approval stages can be configured, who approves the changed date, and where the request returns afterwards. Cover date changes during HR Processing and Payroll Processing, including a date change in the same batch as an organisation change. | FR-008.80–008.85; TDD-008.05 | — | Open |
| BLOCKER 08 | Fix the combined organisation-change and date-change behaviour | One change batch can contain both an organisation change and an effective-date change. The spec says this creates one approval cycle, but the data model allows only one trigger type per cycle (`ORG_CHANGE` or `DATE_CHANGE`). | Define which approval rule takes precedence, how both sets of changes are shown to the approver, and how the cycle is recorded without losing either trigger. The data model and workflow logic must support the approved behaviour. | FR-008.60, FR-008.82; §10.4; edge case 20 | — | Open |
| BLOCKER 09 | Define HR scope and task assignment rules | The spec uses both location/organisation-based HR access and assigned-HR access. The rule for which HR users can view a request and which one can act is still a design decision. | Confirm whether requests are visible to all HR users in the assigned scope, how named task assignment restricts actions, and what happens when an HR user is reassigned or deactivated. | §6, §15; TDD-008.08 (aligns with SPEC-003 comment 3, SPEC-014 comment 4) | — | Open |
| BLOCKER 10 | Confirm the source of truth and transfer completion updates | This spec updates Transfer Request data only and not the external HR master. How the employee's current department, designation, location and Reporting Manager are updated at completion is not fully defined. | Confirm who owns these fields and the exact completion-stage update mechanism in the dependent specs. The portal must not show the new organisation as the employee's current organisation before the approved effective transition. | FR-008.40, FR-008.56; TDD-008.09; SPEC-009, SPEC-015 | — | Open |
| BLOCKER 11 | Confirm HR rejection-reason visibility | The employee sees the HR rejection reason "where policy permits", but the policy is not final. The proposed default shows the full reason. | Obtain business approval for what the employee sees in the portal and in email notifications. Internal HR remarks and decision reasons must not be exposed automatically without an approved visibility rule. | FR-008.30–008.33; TDD-008.07 | — | Open |
| BLOCKER 12 | Confirm document-upload constraints with SPEC-011 | The spec proposes a 5 MB limit and PDF/image validation, but document storage and validation are owned by SPEC-011. | Confirm that file size, allowed formats, file-content validation, access restrictions and error codes match SPEC-011. Do not implement a separate set of upload rules in this module. | FR-008.45; §12.8, §20; SPEC-011 | — | Open |

### 2. Additional Observations and Improvements

These items must also be addressed in the spec. Some can be closed by confirming the
proposed default; others need workflow or implementation changes.

| # | Topic | Developer Feedback | Reference | Author Response | Status |
|---|---|---|---|---|---|
| OBS-01 | Make the correctable-data rule enforceable | The business rules say correctable data goes through clarification, not rejection, but FR-008.13 still allows both. Define when HR must request clarification and when rejection is allowed, and enforce it in backend validation, not only UI guidance. | FR-008.12–008.13; BR-3 | — | Open |
| OBS-02 | Confirm vacancy consistency rules | Confirm that the selected vacancy must match the target department, designation and location, and that HR must update the vacancy and organisation fields together when needed. Add positive and negative tests for matching and mismatching combinations. | FR-008.52–008.55; TDD-008.04 | — | Open |
| OBS-03 | Keep reservation handling consistent across all workflow exits | Verify that rejection, cancellation, blocking, resumption and every other permitted workflow exit cannot leave a vacancy reserved incorrectly. All modules must use the same VacancyService rules. | FR-008.21–008.24, FR-008.70–008.71; §16–17; SPEC-005, SPEC-010 | — | Open |
| OBS-04 | Finalise notification recipients and event names | Some recipients are vague ("relevant team", "authorised HR users"), and clarification recipients depend on unresolved decisions. `APPROVAL_COMPLETED` is used for HR approval and could be confused with overall transfer completion. Confirm the recipient of each notification, distinguish HR-stage approval from final completion, and make the notification text describe the current stage and next action. | §19; TDD-008.02, TDD-008.08; SPEC-012 | — | Open |
| OBS-05 | Complete the post-change activity reset rules | HR must reconfirm changed organisation data after Receiving Manager approval. Define which checklist activities reset for each type of approved change (including effective-date changes), whether completed evidence is kept in history, and how HR is prevented from proceeding on stale confirmations. | FR-008.47; §10.1, §16 | — | Open |
| OBS-06 | Align concurrency and retry behaviour across all actions | Idempotency keys and optimistic version checks are currently optional. Confirm the behaviour when a client retries after a timeout or two users change the same request at once. Duplicate submissions must not create duplicate audit events, approval cycles or reservations, and must return a consistent response. | §12, §17; TC-008.55–008.60 | — | Open |
| OBS-07 | Strengthen the eligibility audit trail | Approval also relies on HR confirming company restrictions that are not checked automatically. The recorded evaluation must include the transfer/request version and the HR attestation, actor, timestamp and remarks, so it is clear what was checked when approval happened. | FR-008.10–008.14; §18 | — | Open |
| OBS-08 | Clarify date-only and combined change handling | Both the separate effective-date endpoint and the combined organisation-change batch must use the same date validation, audit and re-approval logic. A combined change must not bypass approval that would apply if the date were changed separately. | FR-008.50, FR-008.80–008.85; §12.10 | — | Open |
| OBS-09 | Validate all dependencies before development starts | Verify that the referenced interfaces, methods, database fields, error codes and workflow states exist and match their owning specs (workflow, authorisation, vacancy reservation, documents, notifications, data ownership). Document any unresolved cross-spec dependency before implementation. | §3–5, §11–12, §24 | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/hr-review-processing-reapproval.spec.md` to resolve
every blocker and observation, fills in the Author Response columns above, and resubmits
SPEC-008 for Gate 1 review.
