# Assumptions Register — Internal Transfer Digital Journey

Tracks assumptions made while building `.ai-context/BRD.md` from
`docs/Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.0.pdf`. Kept in
sync with the BRD; updated whenever the BRD changes.

**Last Updated:** 2026-09-28
**Status:** Pending Review (linked to BRD Status) — all 11 open questions
resolved by user answers; formal Gate 0 PR review sign-off still required.

| ID | Assumption | Rationale / Source | Impact if Wrong |
|---|---|---|---|
| A-01 | Authentication model resolved to local credentials (BRD-OQ-01); no SSO/hybrid integration in scope unless later added under change control. | User-provided answer, 2026-09-28. | Login/account-provisioning requirements (BRD-001, BRD-004–009, NFR-001) would need rework if SSO is later required. |
| A-02 | User ID convention resolved to role-prefixed IDs (`EMP/MGR/HR/IT######`); password/security policy per BRD-007. | User-provided answer, 2026-09-28. | User ID generation logic (BRD-004) would need rework if a different convention is later mandated. |
| A-03 | Receiving Manager review stage is optional/configurable via Super Admin, not always active. | SOW §3, §6.3, §9 step 3 ("if configured"); confirmed by user answer to BRD-OQ-04. | Workflow routing (BRD-018) must support both configurations; UAT scope affected. |
| A-04 | Facilities/Admin role and its task-execution responsibilities are excluded from scope, at explicit user request, despite the source SOW describing them throughout (§3, §6.6). | User instruction overriding the SOW; flagged per AGENTS.md conflict-flagging governance rather than silently applied. | If a later stakeholder review restores Facilities/Admin, the actor table, BRD-003/010/013/016/018/022, related Business Rules, Dependencies, Out of Scope, and Acceptance Criteria entries would need to be reinstated. |
| A-05 | Payroll calculation, compensation rules and statutory processing remain outside system scope; portal only tracks handoff/status. | SOW §11, §19 (Out of Scope). | Any expectation of in-portal payroll computation would be a scope change requiring change control. |
| A-06 | Document storage resolved to local server storage; PDF and image files only; no malware-scanning, retention, archive, or deletion policy required per current organisational decision. | User-provided answer to BRD-OQ-08, 2026-09-28. | Document management requirements (BRD-021) would need rework if a future security review mandates scanning/retention. |
| A-07 | Vacancy capacity is reserved only at HR validation/approval (not submission or manager approval); over-allocation is prevented via DB transaction/concurrency control. | User-provided answer to BRD-OQ-05/BRD-OQ-06, 2026-09-28. | Vacancy/capacity logic (BRD-017) would need rework if reservation timing is later changed. |
| A-08 | Dates, effort, team composition and commercials are intentionally excluded from the BRD; they belong to a separate project plan. | SOW §21 closing note. | None to BRD content; flagged so downstream planning doesn't expect these details here. |
| A-09 | Performance, availability, backup, retention and monitoring targets are deferred to infrastructure/deployment planning, not fixed in this BRD. | User-provided answer to BRD-OQ-09, 2026-09-28. | NFR-009 remains a placeholder until deployment planning; cannot be used as a hard SLA today. |
| A-10 | Transfer completion is gated solely on final IT approval (BRD-014, BRD-018, BRD-019), at explicit user request, overriding the source SOW's HR/Portal-verifies-all-mandatory-tasks completion rule (§9 step 6, §10). IT approval is mandatory for every transfer; transfers with no IT task use "No IT Action Required" (BRD-OQ-11 resolved). | User instruction overriding the SOW; flagged per AGENTS.md conflict-flagging governance rather than silently applied. | If HR/Portal-based verification is later restored, BRD-013, BRD-014, BRD-018, BRD-019, the Business Rules entry, and the Acceptance Criteria completion bullet would need to be reverted. |
| A-11 | Changing a previously approved Department/Business Unit, Designation, Location, or Reporting Manager during HR validation triggers Receiving Manager re-approval (BRD-024) only when Receiving Manager approval is enabled. | User-provided answer to BRD-OQ-07, 2026-09-28 — new requirement not present in the source SOW. | Spec/plan work for HR organisation-metadata editing must implement the re-approval branch and its audit trail. |

## Continuous Sync Note

Per `AGENTS.md` and the INT BRD ingestion skill, this file must be updated in
lockstep with any future revision of `.ai-context/BRD.md`, alongside
`brd-change-log.md`, `status.md`, `dashboard.html`, and `prompt_history.md`.
