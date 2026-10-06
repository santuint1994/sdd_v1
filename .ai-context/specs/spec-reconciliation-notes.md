# Spec Set Reconciliation Notes (SPEC-001 .. SPEC-016)

Cross-spec reconciliation of the 16 Draft specs against the Gate 0 approved BRD (BRD wins any dispute). Edits were minimal and in place; no TASK/AC/TC/TDD IDs were renumbered or deleted. Changes carry a `[RECONCILED]` note in the spec text.

## Item status

| # | Item | Status | Specs edited (this pass; earlier run edits verified) |
|---|---|---|---|
| 1 | Reporting manager source | Resolved: `reporting_manager_assignments` (SPEC-003) is the single source; no column on `employee_profiles` (004), 006 keeps only a per-transfer snapshot | 015 (field-ownership row 8). Verified 002, 003, 004, 006, 014 |
| 2 | users PK/FK type | Resolved: `users.id` uuid is the only FK target; `users.user_id` is the business display key | 011 (`uploaded_by_user_id`), 012 (convention text). Verified 004, 007, 008, 009, 010, 013, 014 |
| 3 | 15 status codes / active set | Found consistent: ten active statuses, one constants module owned by SPEC-001 | 007 (`ACTIVE_TRANSFER_STATUSES` renamed to `ACTIVE_STATUSES`) |
| 4 | `transfer_requests` / `transfer_task_assignments` columns | Resolved: `stage_entered_at` (006 owns column, 007 engine writes), `blocked_from_status` (010), `transfer_task_assignments` uses `transfer_id, stage_status, assignee_user_id, state` | 010 (task cancel wording `OPEN` to `PENDING/SUSPENDED -> CANCELLED`) |
| 5 | Lock order | Resolved: transfer -> config -> assignments -> payroll/IT tasks -> vacancies (ascending id) -> reservations | 001 (FR-001.41 was reversed), 015 (reserve order). Verified 005, 007, 008, 009, 010 |
| 6 | VacancyService and ports | Resolved: signatures per SPEC-005 (`reserve` idempotent per transfer, `validateForResume` with `expectsReservation`, `changeVacancy`, `manualRelease`, `finalizeAllocation`), `VacancyQueryService.listCapacitySnapshot`, `TransferReadPort` (006), `registerOnEnter` / `registerOnTerminate` (007) | 009 (`finalizeAllocation` signature) |
| 7 | 009 needs from 008 / 010 hooks | Found resolved: 008 date correction accepts `PAYROLL_PROCESSING`; HR-staged payroll reference copied on entry; 010 calls `cancelOpenActivity`, `cancelOpenTasks`, `applyReassignment` | none |
| 8 | Optional date-change re-approval | Found resolved: merged decision TDD-007.04 = TDD-008.05, still TDD-REQUIRED; toggle off by default | none |
| 9 | Action codes | Found consistent: 17 contract codes + `ADD_COMMENT` + `CHANGE_EFFECTIVE_DATE` (FR-007.31) | none |
| 10 | audit_logs / notification_outbox columns | Resolved: names identical in 001/013 and 001/012; 013 VARCHAR lengths defer to the 001 kernel | 013 (note) |
| 11 | Endpoint collisions | Found resolved by R-11 ownership: employee vacancy list `/my/transfer-vacancies` (006) is a facade over `/vacancy-discovery` (005); `/worklists/*` (014) vs `/my/transfer-requests` (006) distinct; date-correction routes 008 (HR) and 009 (Super Admin) distinct. Health route duplicated in 015 | 015 (health route points to 001 FR-001.23) |
| 12 | Temp-password handoff | Found resolved: one master decision TDD-012.04 = TDD-001.04 = TDD-004.07; recommended default Option B (in-memory post-commit send, recover by admin credential reset); Option A (encrypted short-lived `notification_secrets`) is the alternative | none **Decided 2026-10-07: Option B.** |
| 13 | TDD-015.03 / TDD-004.11 | Found resolved: one merged decision, cross-linked both ways | none **Decided 2026-10-07: automatic profile update at Completed.** **TDD-002.03 decided 2026-10-07: JWT + sid + tv, no refresh token.** |
| 14 | Role enum strings | Found consistent (`SUPER_ADMIN, EMPLOYEE, REPORTING_MANAGER, RECEIVING_MANAGER, HR, IT`); no variants found | none |
| 15 | SPEC-011 vs BRD-021/022/039, assumptions A-06, A-12, A-16..A-18 | Found consistent: 5 MB, PDF/image only, 413/415 codes, no public URLs, no delete/retention/malware scan, audit of document actions, BRD-039 IT document row. Visibility flags were mis-tagged as `[BRD-021]` | 011 (retagged `[PROPOSED]`). 015 consistent with A-18 (portal is operational source) |
| - | Scan: invented eligibility rules, performance numbers, escalation timings, Out-of-Scope contradictions | None found. Remaining numbers are test-harness counts or `[PROPOSED]` technical defaults | none |

## Consolidated cross-spec Gate 1 decisions (each remains TDD-REQUIRED)

| Decision | Master ID | Linked IDs | Recommended default `[PROPOSED]` |
|---|---|---|---|
| Temporary password handoff vs BRD-006 "never persisted in PostgreSQL" | TDD-012.04 | TDD-001.04, TDD-004.07 | Option B: in-memory, post-commit send; admin credential reset as recovery. Option A (encrypted short-lived store) only if Gate 1 accepts ciphertext persistence |
| Profile organisation update on transfer completion; who edits profile data | TDD-004.11 | TDD-015.03 | Transfer values stay on the Transfer Request; no automatic profile update unless business decides; then SPEC-009 completion calls `EmployeeProfileService.applyTransferOutcome` |
| Optional date-change re-approval stage and approver | TDD-007.04 | TDD-008.05, TDD-009.13 | Configured stage from {Reporting Manager approval, Receiving Manager approval (if enabled), Receiving Manager re-approval}; off by default |
| Single employee-facing vacancy discovery route (`/my/transfer-vacancies` vs `/vacancy-discovery`) | TDD-006.04 | SPEC-005 FR-005 discovery | Keep 006 route as the facade over the 005 service; drop 005 public route if redundant |
| Reporting Manager source of truth | TDD-003.08 | R-1 | `reporting_manager_assignments`; profile reads/joins it |
| Receiving Manager ID prefix, creation, scope mapping; Super Admin bootstrap | contract section 5 (a)-(c) | 002, 003, 004 | Unchanged, awaiting Gate 1 |
| Audit export format, overdue thresholds and escalation recipients, IT task catalogue and evidence storage, Employee/manager document visibility | contract section 5 (m), (n), (g), (h); TDD-011.05/06/07 | 011, 013, 014 | No invented timings or values; defaults stay `[PROPOSED]` |
