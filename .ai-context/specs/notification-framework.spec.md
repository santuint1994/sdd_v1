# SPEC-012 — Notification & Communication Framework

## Feature ID
notification-framework

## Status
Changes Requested at Gate 1 (2026-10-27) — reviewer Shamik Bhattacharya; see `.ai-context/pr_reviews/SPEC-012-notification-framework-20261027-163348.md`. Spec must be updated and re-submitted for Gate 1; plan, tasks, tests and code remain blocked

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 1 (Spec Peer Review) | Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) | 2026-10-27 | Changes Requested | `.ai-context/pr_reviews/SPEC-012-notification-framework-20261027-163348.md` |
| Gate 2 (Code Review) | — | — | Not started | — |

## Intent & Business Goals

Complete the notification system of the Internal Transfer Digital Journey on top of the SPEC-001 transactional-outbox kernel (`NotificationService.enqueue(eventCode, payload, {trx})`). Deliver the twelve mandatory BRD-036 notifications (plus the other notifications the BRD already requires) by Email and/or In-app, with asynchronous dispatch, per-channel delivery tracking, retry with backoff, idempotent processing, an in-app inbox (bell, unread count, mark read) scoped to the recipient only, and an administrator view of failed notifications with authorised retry.

Non-negotiable invariants `[BRD-036]`:
1. A notification failure never fails, rolls back or corrupts the core transfer transaction. No exception.
2. The workflow action stays recorded even when delivery fails.
3. Every failure is logged for audit and troubleshooting, never with credentials.
4. A failed notification can be retried without repeating the workflow transaction.
5. Notification processing never creates duplicate transfer actions or workflow transitions (idempotent retries, NFR-006).

## User Roles & Actors

| Actor | Role in this SPEC |
|---|---|
| Any authenticated user (SUPER_ADMIN, EMPLOYEE, REPORTING_MANAGER, RECEIVING_MANAGER, HR, IT) | Recipient: reads own in-app inbox, marks own notifications read; receives Email at the official company address. |
| SUPER_ADMIN | Views failed/pending notification deliveries, triggers authorised retry `[PROPOSED]` (see TDD-012.10). |
| System (notification worker) | Dispatches outbox rows asynchronously; no user identity; never calls `WorkflowEngine`. |
| Producing modules (SPEC-004, 007, 008, 009, 010, 014) | Call `NotificationService.enqueue` inside their business transaction. |

---

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-012 |
| Title | Notification & Communication Framework |
| Purpose | Reliable, idempotent, auditable Email + In-app notification delivery decoupled from the core transfer transaction. |
| Business objective | Reduce manual follow-up through notifications and clear ownership (BRD Objective; BRD-023, BRD-036). |
| Version | 0.1 (Draft) |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer per roster | Project Manager / Product Owner |
| Task prefix | TASK-012.MM |
| Module path | `backend/src/modules/notifications/`, `backend/src/workers/notification-worker.ts`, `frontend/src/app/notifications/`, `frontend/src/app/admin/notifications/` |

## 2. Why This SPEC Exists

- BRD-036 makes twelve notifications mandatory and defines failure semantics that are architecture-shaping: delivery must be asynchronous, retryable and idempotent, and must be physically unable to roll back or duplicate a workflow transition.
- BRD-005 requires initial credentials to reach the user by official company email while the temporary password is never stored in logs or audit records (BRD-005, BRD-006, BRD-025, NFR-003). This creates a hard design problem solved here (secret handoff, FR-012.30 to FR-012.36).
- NFR-006 (reliability) requires failed deliveries to stay visible with status and error details and support authorised retry without duplicate downstream effects.
- Earlier specs (SPEC-004, 007–010) only need to call `enqueue`; this SPEC owns everything after the enqueue call: catalogue, recipients, templates, dispatch, tracking, retry, inbox and admin visibility.
- Kernel boundary: SPEC-001 owns `NotificationService.enqueue` signature and the base outbox table. SPEC-012 owns catalogue, templates, Email + In-app dispatch, retry, idempotency, delivery tracking and the in-app inbox `[contract §3]`.

## 3. BRD Traceability

### 3.1 BRD IDs

| BRD ID | Coverage | Slice owned by SPEC-012 |
|---|---|---|
| BRD-036 | FULL | Twelve-event matrix, channel rule, failure rules, retry, idempotency, "other notifications remain in force". |
| BRD-023 (notifications part) | FULL for notifications; dashboards/worklists/reporting/escalation config are SPEC-014 | Notification coverage for account creation/activation (where approved), submission, action required, clarification, approval/rejection, downstream task assignment, delays/blockage, completion. Overdue notification delivery capability (trigger and thresholds owned by SPEC-014; no timings invented here). |
| BRD-005 | PARTIAL (delivery slice) | Email delivery of the initial credentials to the official company email; temp password never in logs/audit. Generation and creation flow are SPEC-004. |
| BRD-007 | PARTIAL | Credential reset notification (Email only). Reset action itself is SPEC-004/002. |
| BRD-027 | PARTIAL | "Notification" column of the transition matrix mapped to events (section 19.3). Transitions are SPEC-007/008/009/010. |
| BRD-033 | PARTIAL | Rejection notification carries the rejection reason; Employee notified. |
| BRD-034 | PARTIAL | Clarification-requested and clarification-responded notifications. |
| BRD-035 | PARTIAL | New assignee notified on reassignment. |
| BRD-022 / BRD-037 | PARTIAL | Notification failures logged/audited (never credentials). Audit infrastructure is SPEC-001/013. |
| BRD-039 | PARTIAL | Idempotency/retry semantics used by Integration negative scenarios (section 22). |
| BRD-002, BRD-012, BRD-024, BRD-028, BRD-030 | Reference only | Confirmation dialogs (BRD-002) for admin retry; Receiving Manager configurability (BRD-012) and re-approval (BRD-024) shape recipient resolution. |

### 3.2 NFR IDs

| NFR | Coverage | Slice |
|---|---|---|
| NFR-006 | PARTIAL (notification side; integration-contract side is SPEC-015) | Recoverable failures, clear error ownership, no duplicate downstream execution, failed delivery visible with status/error details, authorised retry. |
| NFR-003 | PARTIAL | No credential in logs/outbox payload/audit; temporary password only in the email body. |
| NFR-007 | PARTIAL | In-app notifications visible to recipient only. |
| NFR-008 | PARTIAL | Bell/inbox/admin screens accessible (keyboard, aria-live, contrast). |
| NFR-005 | PARTIAL | Notification failure audit entries are append-only through `AuditService`. |
| NFR-009 | Reference only | Monitoring/backup targets deferred (SPEC-015); this SPEC exposes counts and logs. |

### 3.3 BRD-OQ

| ID | Use |
|---|---|
| BRD-OQ-03 | Official company email is the credential-delivery channel (implemented here as Email-only events). |
| BRD-OQ-10 | Escalation/overdue notification timing and recipients are configurable per company policy: delivery capability here; configuration in SPEC-014. |
| BRD-OQ-12, BRD-OQ-13, BRD-OQ-14, BRD-OQ-15, BRD-OQ-18 | Withdraw/Block/Resume/Cancel/Reassign and matrix notification rows determine the event catalogue. |
| BRD-OQ-09 | Production SMTP capacity/monitoring deferred to deployment planning. |

### 3.4 Business Rules (from BRD "Business Rules")

| Rule | Where applied |
|---|---|
| "Notifications (BRD-036): twelve mandatory events ... Email only for account creation and reset; both Email and In-app for workflow events" | FR-012.01 to FR-012.05 |
| "A notification failure never fails, rolls back or corrupts the core transfer transaction ... may be retried without repeating the workflow transaction or creating a duplicate transfer action or workflow transition" | FR-012.10 to FR-012.28 |
| "Temporary password must never be stored in application logs or audit records" (BRD-005) | FR-012.30 to FR-012.36 |
| Retry safeguards against duplicate downstream execution; failed integration remains visible with failure status/error details and supports authorised retry (NFR-006, Integration Requirements) | FR-012.20 to FR-012.28, FR-012.50 to FR-012.54 |

### 3.5 Acceptance Criteria coverage (BRD "Acceptance Criteria" bullets)

| BRD bullet | Covered by |
|---|---|
| Notifications (BRD-036): each of the twelve mandatory events produces a notification to the defined recipient on the defined channel(s); delivery failure does not affect the action; failure logged; retry delivers without repeating workflow or duplicating | SPEC-012.AC01 to AC22 |
| Rejection notifies the Employee (BRD-033 bullet) | AC05, AC06 |
| Clarification notifies Employee/responsible user (BRD-034 bullet) | AC07 |
| Reassignment notifies new assignee (BRD-035 bullet) | AC11 |
| Approved requests generate only applicable downstream actions; failures are visible and recoverable | AC17, AC18, AC19 |
| UAT scenarios: account creation/login, credential reset, approval, rejection, clarification, reassignment, integration failure, final completion | TC-012 UAT subset, section 23 |
| Account creation: user must change temporary password; plaintext never in logs | AC13, AC14 |

### 3.6 Negative scenarios (BRD-039 rows touched)

| BRD-039 row | Coverage | Mapping |
|---|---|---|
| Integration: An integration timeout does not create duplicate downstream transactions | PARTIAL (SMTP is the only external dependency in this phase) | NAC05, NAC06 |
| Integration: Failed integrations support controlled retry where applicable | PARTIAL | NAC07 |
| Integration: A failed integration does not incorrectly mark the associated task as Completed | PARTIAL | NAC08 |
| Integration: An external system/integration failure does not cause the transfer to be incorrectly marked Completed | PARTIAL | NAC08 |
| Integration: Retry processing follows duplicate-prevention/idempotency requirements of NFR-006 | PARTIAL | NAC05, NAC09 |
| Security: A user cannot access another organisation's data outside scope; Employee cannot access another Employee's data | PARTIAL (in-app inbox slice) | NAC01 to NAC03 |
| Security: Direct API access cannot bypass backend authorization | PARTIAL (inbox/admin endpoints) | NAC02, NAC04 |

Validation approach for "Integration" scenarios in the current phase (no external Payroll/HR integration exists, BRD Integration Requirements) `[PROPOSED, flagged contract §5(q)]`: exercised against the SMTP dependency using a fault-injecting fake SMTP server (SPEC-016 harness).

---

## 4. Dependencies

| Dependency | Needed for |
|---|---|
| SPEC-001 | `withTransaction` helper, `NotificationService.enqueue` signature + base `notification_outbox` table (this SPEC extends via migration, TASK-012.01), logger with secrets redaction, config loader, error classes, response envelope, validation middleware, migration conventions, `AuditService.record`, base UI shell. |
| SPEC-002 | Authenticated request context, `AuthorizationService.authorize`, token/session handling, RBAC for inbox and admin endpoints. |
| SPEC-003 | Admin shell and shared list/form/dialog UI patterns for the admin notifications page. |
| SPEC-004 | `employee_profiles` (official email, assigned HR/IT), user creation and credential reset triggers (the callers of `USER_ACCOUNT_CREATED` / `CREDENTIAL_RESET`), temp-password generation (hands the secret to `SecretHandoffService`). |
| SPEC-006 | `transfer_requests` (reference, employee, entity links, deep link). |
| SPEC-007 | `WorkflowEngine.transition` as caller of `enqueue` for submit/approve/reject/clarify; `transfer_task_assignments` (pending owner) for recipient resolution; `workflow_configuration` (Receiving Manager enabled). |
| SPEC-008, 009, 010 | Callers for re-approval, HR/Payroll/IT task assignment, completion, withdraw/block/resume/cancel/reassign. |
| SPEC-013 | Audit visibility (notification audit codes are consolidated in its catalogue). |
| SPEC-014 | Overdue/escalation trigger (calls `enqueue(TASK_OVERDUE ...)`); worklist badges may reuse unread count API. |

## 5. Enables

- SPEC-004: credential emails (Email only) without ever persisting the temp password in clear.
- SPEC-007 to SPEC-010: single, uniform, transaction-safe `enqueue` contract for all workflow notifications.
- SPEC-013: notification failure audit entries.
- SPEC-014: unread-count/notification widgets, overdue notification delivery.
- SPEC-015: NFR-006 evidence (retry/idempotency/visibility) and no-integration boundary validation.
- SPEC-016: BRD-039 Integration scenarios via fake SMTP harness; UAT notification scenarios.

## 6. Roles & Scope

| Role | Inbox (own) | Admin delivery view | Retry | Receives |
|---|---|---|---|---|
| SUPER_ADMIN | Yes | All deliveries | Yes `[PROPOSED]` | Per catalogue |
| EMPLOYEE | Yes | No (403) | No (403) | Per catalogue |
| REPORTING_MANAGER | Yes | No (403) | No (403) | Per catalogue |
| RECEIVING_MANAGER | Yes | No (403) | No (403) | Per catalogue |
| HR | Yes | No `[PROPOSED]` (TDD-012.10) | No `[PROPOSED]` | Per catalogue |
| IT | Yes | No (403) | No (403) | Per catalogue |

Scope rule `[BRD-026, NFR-007]`: an inbox query is always constrained to `recipient_user_id = authenticated user`. No role, including SUPER_ADMIN, can read another user's inbox through the inbox endpoints. The admin delivery view exposes delivery metadata (event, recipient user id, channel, status, error), not the rendered in-app body of other users `[PROPOSED]`.

---

## 7. Functional Requirements

Tags: `[BRD]` stated by BRD, `[DERIVED]` follows from BRD text, `[PROPOSED]` technical design, `[TDD-REQUIRED]` decision not defined by BRD.

### 7.1 Event catalogue and channels

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-012.01 | The system shall support the twelve mandatory events of BRD-036 with the Event, Recipient, Channel, Message and Mandatory values reproduced verbatim in section 19.1. All twelve are Mandatory; there is no user opt-out and no preference UI. | `[BRD-036]` |
| FR-012.02 | Where the channel is "Email / In-app", the notification shall be delivered by BOTH Email and In-app: two `notification_deliveries` rows (one per channel) per recipient. | `[BRD-036 channel rule]` |
| FR-012.03 | `USER_ACCOUNT_CREATED` and `CREDENTIAL_RESET` shall be Email only: no In-app row is created, because the recipient has not authenticated (account creation) or has just had sessions invalidated (reset, BRD-025). | `[BRD-036]` |
| FR-012.04 | The system shall also deliver the other notifications the BRD already requires (withdrawal, reassignment, re-approval/Receiving Manager rows of the BRD-027 matrix, cancellation, resume, clarification response, IT task completion/No IT Action Required, overdue) with the same failure rules. Channel for these is Email and In-app `[PROPOSED]`, because BRD-036 states they "follow the same failure rules" and workflow events use both channels `[DERIVED]`. | `[BRD-036 Summary, BRD-023, BRD-027, BRD-033, BRD-034, BRD-035]` |
| FR-012.05 | The full event catalogue (section 19.2) shall be implemented as a code registry `catalogue.ts` (event code, channels, mandatory flag, recipient resolver id, template key, payload schema). An event code not in the registry shall be rejected by `enqueue` (programming error, logged, isolated by savepoint, FR-012.11). | `[PROPOSED]` |
| FR-012.06 | Recipient sets described in the BRD as "relevant stakeholders" or "relevant users/team" are `[TDD-REQUIRED]` (TDD-012.01); recommended defaults are given in section 19.2 and shall be implemented behind one replaceable resolver function per event so a Gate 1 decision changes one function only. | `[TDD-REQUIRED, contract §5(i)]` |
| FR-012.07 | A user who qualifies through more than one recipient rule for the same event shall receive exactly one notification per channel (guaranteed by the idempotency key, FR-012.20). | `[DERIVED]` |
| FR-012.08 | Messages shall include the transfer reference, the event-specific text, and where BRD-mandated the reason: rejection reason (BRD-033/BRD-036), block reason (BRD-036), clarification question (BRD-034), cancellation reason, withdrawal reason (BRD-027). Reason text is business data and is permitted in the payload; credentials are not (FR-012.30). | `[BRD-036, BRD-033, BRD-034]` |
| FR-012.09 | Recipients whose account is Inactive/Deactivated shall not receive new notifications except `USER_ACCOUNT_CREATED` and `CREDENTIAL_RESET`; the skip shall be logged (`NOTIFICATION_RECIPIENT_SKIPPED`, user id only). Behaviour is `[TDD-REQUIRED]` TDD-012.07. | `[PROPOSED]` |

### 7.2 Transactional outbox and enqueue

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-012.10 | `NotificationService.enqueue` shall write the outbox event row and all per-recipient/per-channel delivery rows using the caller's transaction (`{trx}`), so they commit or roll back atomically with the business change and its audit/history rows. A rolled-back transition leaves no notification. | `[DERIVED BRD-036, contract §3]` |
| FR-012.11 | `enqueue` shall execute inside a database SAVEPOINT (Sequelize nested transaction). Any error inside `enqueue` (unknown event, payload guard violation, resolver error, insert error) shall roll back only the savepoint, be logged at ERROR with `eventCode`, `entityId`, `requestId`, error class (no payload secrets), and shall NOT propagate to the caller. The business transaction continues and commits. This implements "no exception". | `[BRD-036, PROPOSED mechanism]` |
| FR-012.12 | When the savepoint path fails, a best-effort `afterCommit` hook shall insert a `notification_outbox` row with `resolution_status = 'ERROR'` and `error_code` on a separate connection so the failure is visible to the admin view (FR-012.50). If that also fails it is logged only. | `[PROPOSED]` |
| FR-012.13 | If recipient resolution yields no recipient, the outbox row is stored with `resolution_status = 'NO_RECIPIENTS'` and a WARN log; no exception. | `[PROPOSED]` |
| FR-012.14 | The outbox payload shall contain identifiers and non-sensitive business fields only, validated against a per-event allow-list schema (`PayloadGuard`). Keys matching `/pass(word)?|secret|token|credential|otp/i` and values longer than the schema limit shall be rejected. | `[PROPOSED, NFR-003]` |
| FR-012.15 | `enqueue` shall be called exactly once per business event by the producing module, immediately after the history + audit rows are written and before commit. Producers shall NOT call SMTP, write `in_app_notifications` or hold the transaction open for delivery. | `[DERIVED BRD-036]` |
| FR-012.16 | After the producing transaction commits, an `afterCommit` hook shall nudge (`worker.wake()`) the dispatcher for low latency. Polling remains the source of truth, so a lost nudge or process restart loses nothing. | `[PROPOSED]` |
| FR-012.17 | The notification module shall have no import dependency on `WorkflowEngine`, transfer repositories (write side), vacancy services or task repositories. The dispatcher can read only notification tables, `users`/`employee_profiles` (read) and `transfer_requests` (read, for link/reference). Enforced by a lint/dependency rule and test. | `[DERIVED: "never creates duplicate transfer actions or workflow transitions"]` |
| FR-012.18 | Event identity: `notification_outbox.event_key` (unique) = `<EVENT_CODE>:<source_type>:<source_id>`, e.g. `TRANSFER_REJECTED:workflow_history:<id>`. Re-invoking `enqueue` with the same key (e.g. an idempotent re-run of a request) is a no-op returning the existing event. | `[PROPOSED]` |
| FR-012.19 | Recipient email addresses are taken from `employee_profiles.official_email` (BRD-005) and snapshotted into `notification_deliveries.recipient_email` at enqueue. A missing/invalid email creates the EMAIL delivery directly in `FAILED` with `last_error_code = NO_EMAIL_ADDRESS` (visible, retryable after the profile is corrected; manual retry re-reads the address). | `[PROPOSED]` |

### 7.3 Idempotency

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-012.20 | Idempotency key = (`event_id`, `recipient_user_id`, `channel`), enforced by a DB UNIQUE constraint on `notification_deliveries`. Inserts use `ON CONFLICT DO NOTHING`. | `[BRD-036/NFR-006, PROPOSED mechanism]` |
| FR-012.21 | Retrying a delivery (automatic or manual) reuses the same delivery row and `event_id`; it never creates a new delivery, a new outbox event, a history row, a task assignment, an audit transition record or a call into the workflow. | `[BRD-036]` |
| FR-012.22 | In-app creation is exactly-once: `in_app_notifications.delivery_id` is UNIQUE and the row creation + `SENT` update occur in one transaction. | `[PROPOSED]` |
| FR-012.23 | Email is at-least-once: if the process dies after the SMTP server accepted the message but before `SENT` is persisted, a re-attempt may send a second identical email. Mitigation: deterministic `Message-ID` header `<delivery_id@NOTIFICATION_MESSAGE_ID_DOMAIN>`, attempt logging, and the SENT update performed immediately after provider acknowledgement. Residual risk is recorded in TDD-012.06. | `[PROPOSED]` |

### 7.4 Dispatcher / worker, retry, backoff

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-012.24 | A worker process (same codebase, modular monolith; entry `backend/src/workers/notification-worker.ts`, also startable in-process for local deployment) polls `notification_deliveries` every `NOTIFICATION_POLL_INTERVAL_MS`. | `[PROPOSED]` |
| FR-012.25 | Claim query (short transaction): `SELECT ... WHERE status='PENDING' AND next_attempt_at <= now() ORDER BY next_attempt_at LIMIT :batch FOR UPDATE SKIP LOCKED`, then set `locked_at = now()`, `locked_by = :workerId`, commit. Sending happens outside any DB transaction. Result update is guarded by `WHERE id = :id AND locked_by = :workerId AND status = 'PENDING'`. Multiple workers never process the same row concurrently. | `[PROPOSED]` |
| FR-012.26 | Stale lock reclaim: a PENDING row with `locked_at < now() - NOTIFICATION_LOCK_TIMEOUT_SECONDS` is claimable again (worker crash recovery). | `[PROPOSED]` |
| FR-012.27 | Each attempt increments `attempts`, writes a `notification_delivery_attempts` row (outcome, sanitised error, duration) and, on success, sets `status='SENT'`, `sent_at`, `provider_message_id`. On a transient failure with `attempts < max_attempts`, the row stays `PENDING` with `next_attempt_at = now() + backoff(attempts)`, `last_error_code`, `last_error`. When attempts are exhausted or the error is permanent, `status='FAILED'`, `failed_at` set. | `[BRD-036, NFR-006]` |
| FR-012.28 | Backoff, max attempts and the permanent-vs-transient classification are `[TDD-REQUIRED]` (TDD-012.03). Recommended defaults `[PROPOSED]`: `delay = min(base * 2^(attempts-1), cap) * jitter(0.8..1.2)`, base 60 s, cap 3600 s, `max_attempts = 5`; SMTP 5xx recipient/permanent codes and `NO_EMAIL_ADDRESS` are permanent (no automatic retry); network errors, timeouts, 421/450/451/452 are transient. All values come from environment/config, not constants. | `[TDD-REQUIRED]` |
| FR-012.29 | Delivery status values are exactly `PENDING`, `SENT`, `FAILED` `[BRD-036 delivery tracking requirement from the task brief]`. "In flight" is represented by `locked_by/locked_at` on a `PENDING` row, not by a fourth status. Per-channel tracking fields: `attempts`, `last_error_code`, `last_error`, `created_at`, `last_attempt_at`, `sent_at`, `failed_at`, `next_attempt_at`. | `[PROPOSED]` |

### 7.5 Credential-bearing emails (temporary password handoff)

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-012.30 | The temporary password shall appear only in the body of the `USER_ACCOUNT_CREATED` email (and the reset password / reset instructions in `CREDENTIAL_RESET`, content per SPEC-004). It shall never appear in: application logs, audit records, `notification_outbox.payload`, `notification_deliveries.last_error`, attempt records, error messages, queue/metrics labels, or API responses of this module. | `[BRD-005, BRD-006, BRD-025, BRD-037, NFR-003]` |
| FR-012.31 | [RECONCILED R-12] Applies only if Gate 1 selects Option A of TDD-012.04 (recommended default is now Option B: in-memory send after commit, no `notification_secrets` row, no `secret_id`). Design (Option A): the producer (SPEC-004) calls `SecretHandoffService.stash(plaintext, {trx, ttl})`, which encrypts the value with AES-256-GCM (random 96-bit IV per item; key `NOTIFICATION_SECRET_KEY`, 32 bytes base64 from environment; `key_version` stored) into `notification_secrets` inside the same business transaction, returning a `secret_id`. `enqueue` stores only `secret_id` on the outbox row (never in `payload`). | `[TDD-REQUIRED, recommended PROPOSED]` TDD-012.04 **[NOT SELECTED — TDD-012.04 decided Option B; this design is not to be built unless the decision is reopened.]** |
| FR-012.32 | At send time the worker loads the secret, decrypts in memory, renders the template, sends, then immediately marks the secret consumed and overwrites ciphertext (`ciphertext = '\x'`, `consumed_at = now()`) in the same transaction that sets `SENT`. Plaintext is held only in local variables, is never logged, and the render result of credential templates is never persisted. | `[PROPOSED]` |
| FR-012.33 | Secrets expire at `expires_at = created_at + NOTIFICATION_SECRET_TTL_MINUTES` (recommended 1440 = 24 h; value `[TDD-REQUIRED]` TDD-012.05). A purge job overwrites expired/consumed ciphertext every `NOTIFICATION_SECRET_PURGE_INTERVAL_MINUTES`. | `[TDD-REQUIRED]` |
| FR-012.34 | A delivery whose secret is missing/expired fails permanently with `last_error_code = SECRET_UNAVAILABLE` (no automatic retry). Admin retry is refused with 409 `NOTIFICATION_SECRET_EXPIRED` and guidance to issue a new administrator credential reset (SPEC-004), which creates a new temporary password and a new `CREDENTIAL_RESET` event. The original password is not recoverable by design. | `[PROPOSED]` |
| FR-012.35 | Admin and API views of credential-bearing deliveries show metadata only (event, status, attempts, sanitised error); the secret/ciphertext columns are excluded by repository projection and by response DTO allow-list. | `[PROPOSED]` |
| FR-012.36 | Alternative if Gate 1 rejects persisting even short-lived ciphertext (BRD-006: "plaintext ... must never be persisted"; ciphertext is not plaintext, but the reviewer decides): in-memory handoff, no table. Delivery then is best-effort after commit; loss on crash is recovered by administrator credential reset. Both options are specified in TDD-012.04; implementation tasks target the recommended option and isolate it behind `SecretHandoffService`. | `[TDD-REQUIRED]` |

### 7.6 Templates

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-012.37 | A template system renders subject, HTML body, plain-text body (Email) and title + body + link (In-app) from `templateKey` + context. Templates live in `backend/src/modules/notifications/templates/<EVENT_CODE>.<channel>.hbs` (Handlebars with HTML auto-escaping; no `eval`, no dynamic helper registration from data). Engine choice `[TDD-REQUIRED]` TDD-012.08; recommended Handlebars. | `[PROPOSED]` |
| FR-012.38 | Every template has `templateKey` and integer `templateVersion`; both are stored on the delivery row for troubleshooting. A render failure (missing variable) is a permanent failure `TEMPLATE_RENDER_ERROR` for that delivery, logged, and never affects the business transaction. | `[PROPOSED]` |
| FR-012.39 | Plain-text and HTML alternatives are both sent for Email. Emails contain no links containing secrets or tokens; deep links are `APP_BASE_URL + /transfers/<id>` and require normal authentication and authorization at the target. | `[PROPOSED, BRD-026]` |
| FR-012.40 | Baseline wording (section 19.1 "Message / Purpose") is used verbatim as the intent; final copy is a Gate 1 review item and may be refined without changing the catalogue. | `[PROPOSED]` |

### 7.7 Email delivery via SMTP

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-012.41 | Email is sent over SMTP via a transport adapter `EmailTransport` (default implementation `nodemailer`, `[PROPOSED]`), configured only from environment variables (section 11.3). The SMTP provider/service (enterprise mail relay vs other) is `[TDD-REQUIRED]` TDD-012.02; BRD-OQ-03/Dependencies state only "enterprise/official company email service". | `[BRD Dependencies, TDD-REQUIRED]` |
| FR-012.42 | SMTP credentials are read from `process.env` only, never hardcoded, never logged, never present in error messages (adapter strips them from caught errors). | `[int-standards §3]` |
| FR-012.43 | Connection, greeting and socket timeouts are configurable (`SMTP_CONNECTION_TIMEOUT_MS`, `SMTP_SOCKET_TIMEOUT_MS`); a timeout is a transient failure. Numeric values are not defined by BRD (BRD-038 API/integration timeouts are TBC) `[TDD-REQUIRED]` TDD-012.03. | `[BRD-038]` |
| FR-012.44 | From address and display name are configuration (`SMTP_FROM_ADDRESS`, `SMTP_FROM_NAME`). Emails go to the recipient's official company email only; no CC/BCC to third parties. | `[BRD-005, PROPOSED]` |
| FR-012.45 | TLS to the SMTP server is configurable (`SMTP_SECURE`, `SMTP_REQUIRE_TLS`); the local-deployment transport arrangement is `[TDD-REQUIRED]` per contract §5(o) (owned by SPEC-015 for application transport). | `[NFR-004]` |
| FR-012.46 | When `NOTIFICATION_EMAIL_ENABLED=false` (non-production only) the adapter records deliveries as FAILED with `EMAIL_DISABLED`; it never silently marks SENT. Production start-up validation fails fast if SMTP variables are missing. | `[PROPOSED]` |

### 7.8 In-app notifications and inbox

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-012.47 | The IN_APP channel handler writes one `in_app_notifications` row per delivery (title, body, optional `link_path`, `event_code`, `transfer_request_id`) and marks the delivery `SENT` atomically. | `[PROPOSED]` |
| FR-012.48 | Inbox API: list own notifications (paginated, newest first, filter unread), unread count, mark one read, mark all read. All queries are constrained by `recipient_user_id = ctx.userId`; ids belonging to another user return 404 `NOTIFICATION_NOT_FOUND` (indistinguishable from nonexistent) `[PROPOSED]`. Mark-read is idempotent (re-marking leaves the original `read_at`). | `[BRD-036, NFR-007]` |
| FR-012.49 | Frontend shows a bell with unread count in the application header, a dropdown of the latest notifications, and a full inbox page. Unread count refreshes by polling `NOTIFICATION_UI_POLL_SECONDS` (recommended 60) and on route change; server-push is out of scope `[PROPOSED]`. | `[PROPOSED]` |

### 7.9 Administration: failed notifications and retry

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-012.50 | SUPER_ADMIN can list deliveries with filters (status, channel, event code, transfer reference, recipient user id, date range) and view detail including the attempt history, error code and sanitised error text. Failed deliveries are surfaced first by default (`status=FAILED`). | `[NFR-006, PROPOSED role]` |
| FR-012.51 | Authorised retry: a `FAILED` delivery can be retried manually (single and bulk-by-filter, max 100 per call). Retry sets `status='PENDING'`, `next_attempt_at=now()`, `attempts` unchanged for audit, `attempt_budget` reset by `max_attempts = attempts + NOTIFICATION_MANUAL_RETRY_ATTEMPTS` `[PROPOSED]`, `manual_retry_count++`, records retrier and time; it never creates a new delivery or event. A `SENT` or `PENDING` delivery returns 409 `NOTIFICATION_NOT_RETRYABLE`. | `[BRD-036, NFR-006]` |
| FR-012.52 | Automatic retry (FR-012.27) and manual retry share one code path (`DeliveryProcessor.process(deliveryId)`) so behaviour is identical and neither can touch workflow state. | `[PROPOSED]` |
| FR-012.53 | Who may retry (SUPER_ADMIN only vs HR within scope) is `[TDD-REQUIRED]` TDD-012.10; recommended SUPER_ADMIN only because BRD-036/NFR-006 say "authorised" without naming roles. | `[TDD-REQUIRED]` |
| FR-012.54 | Admin summary endpoint returns counts by status/channel, number of FAILED, oldest PENDING age, and events with `resolution_status <> 'RESOLVED'`. | `[PROPOSED, NFR-009 supporting]` |

### 7.10 Logging and audit

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-012.55 | Every failed attempt is logged with the structured logger (Winston/Pino per SPEC-001) at WARN (transient) or ERROR (terminal) with `deliveryId`, `eventId`, `eventCode`, `channel`, `recipientUserId`, `attemptNo`, `errorCode`, sanitised `errorMessage`, `requestId` (from the originating request where stored). Never recipient email in clear (masked `s***@domain`), never body, never credentials. | `[BRD-036, BRD-037, NFR-003]` |
| FR-012.56 | Terminal failure, manual retry request, enqueue failure, and secret expiry are recorded through `AuditService.record` (own transaction, outside the business transaction). Audit events: section 18. Audit rows never contain credentials. Successful sends are not audited individually (delivery table is the record) `[TDD-REQUIRED]` TDD-012.12. | `[BRD-036, BRD-037]` |
| FR-012.57 | Error text stored in `last_error` is produced by `ErrorSanitizer`: strips credential-like substrings, SMTP AUTH lines, and truncates to 1000 chars. | `[PROPOSED]` |

---

## 8. Internal Implementation Plan / Tasks

Order is dependency order. Layer: BE, FE, DB, QA.

| Task | Title | Layer | Description | Inputs / Outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-012.01 | Migrations: outbox extension, deliveries, attempts, in-app, secrets | DB | Create/alter `notification_outbox` (adds event_key, resolution_status, secret_id, etc.), create `notification_deliveries`, `notification_delivery_attempts`, `in_app_notifications`, `notification_secrets`; constraints and indexes of section 10. Migration conventions of SPEC-001; create-or-alter if SPEC-001 already created the base table. | In: SPEC-001 outbox table. Out: migration files `backend/src/migrations/<ts>-notification-framework.ts`, rollback script. | SPEC-001 migrations | BRD-036, NFR-006 |
| TASK-012.02 | Models and repositories | BE | Sequelize models + repositories with DTO projections that exclude secret columns; `claimBatch` raw query with `FOR UPDATE SKIP LOCKED`. | In: TASK-012.01. Out: `models/*.ts`, `repositories/*.ts`. | 012.01 | BRD-036 |
| TASK-012.03 | Config and `.env.example` | BE | Typed config for all `SMTP_*`, `NOTIFICATION_*` variables (section 11.3) with validation (fail fast in production). `.env.example` entries without real values. | In: SPEC-001 config loader. Out: `config/notifications.ts`. | SPEC-001 | BRD-036, NFR-003 |
| TASK-012.04 | Event catalogue registry and PayloadGuard | BE | `catalogue.ts` (section 19.2) + per-event payload JSON schemas (allow-list) + forbidden-key guard. | Out: registry, `PayloadGuard`. | 012.03 | BRD-036 |
| TASK-012.05 | Template engine and templates | BE | Handlebars renderer, templates per event and channel, `templateKey/version`, text+HTML, escape tests. | Out: `templates/*`, `TemplateService`. | 012.04 | BRD-036 |
| TASK-012.06 | RecipientResolver | BE | One resolver per catalogue entry (employee, reporting manager, pending owner from `transfer_task_assignments`, assigned HR, authorised HR, assigned IT, requesting approver, stakeholder sets). Read-only, runs inside caller trx. | In: SPEC-004/006/007 read models. Out: `RecipientResolver`. | 012.04 | BRD-036, BRD-027 |
| TASK-012.07 | `SecretHandoffService` | BE | AES-256-GCM stash/consume/purge; key versioning; no plaintext logging. | Out: service + purge job. | 012.02, 012.03 | BRD-005, NFR-003 |
| TASK-012.08 | `NotificationService.enqueue` (full implementation) | BE | Savepoint isolation, event_key idempotency, PayloadGuard, resolve recipients, fan-out deliveries per channel, email snapshot, afterCommit wake + error row. Keeps SPEC-001 signature. | Out: enqueue + `notify.*` helpers per event. | 012.02, 012.04, 012.06, 012.07 | BRD-036 |
| TASK-012.09 | `EmailTransport` adapter | BE | nodemailer pool/transport from env, timeouts, TLS, error classification (transient/permanent), credential stripping, deterministic Message-ID. | Out: adapter + fake for tests. | 012.03 | BRD-036, NFR-006 |
| TASK-012.10 | In-app channel handler | BE | Create `in_app_notifications` + mark SENT atomically; idempotent on unique delivery id. | Out: `InAppChannel`. | 012.02, 012.05 | BRD-036 |
| TASK-012.11 | `DeliveryProcessor` and worker loop | BE | Poll, claim, process, backoff, stale-lock reclaim, graceful shutdown, `wake()`, attempts table, logging. | Out: `DeliveryProcessor`, `notification-worker.ts`. | 012.08, 012.09, 012.10 | BRD-036, NFR-006 |
| TASK-012.12 | Retry service | BE | Manual single/bulk retry, refusal rules, secret-expiry pre-check, audit call. | Out: `RetryService`. | 012.11 | BRD-036, NFR-006 |
| TASK-012.13 | Inbox API | BE | List, unread-count, mark-read, mark-all-read with recipient scoping. | Out: routes/controller/validators. | 012.02, SPEC-002 | BRD-036, NFR-007 |
| TASK-012.14 | Admin API | BE | Delivery list/detail, retry, bulk retry, summary; SUPER_ADMIN authorisation. | Out: routes/controller. | 012.12 | NFR-006 |
| TASK-012.15 | Logging, sanitiser and audit integration | BE | `ErrorSanitizer`, masked-email logger fields, `AuditService.record` calls for section 18 events. | Out: sanitiser, audit adapter. | 012.11, SPEC-001 | BRD-036, BRD-037 |
| TASK-012.16 | Producer integration contract and helpers | BE | Typed `notify.<event>(args,{trx})` helpers used by SPEC-004/007/008/009/010/014; integration guide as code comments-free README is NOT created (typed signatures are the contract). Dependency-rule lint (FR-012.17). | Out: helpers + eslint boundary rule. | 012.08 | BRD-036, BRD-027 |
| TASK-012.17 | Frontend: bell, unread badge, dropdown | FE | Header component, polling hook, aria-live badge, keyboard support. | Out: `NotificationBell`. | 012.13, SPEC-001 shell | BRD-036, NFR-008 |
| TASK-012.18 | Frontend: inbox page | FE | `/notifications` list, unread filter, mark read/all, deep link, empty/loading/error states. | Out: page + components. | 012.17 | BRD-036, BRD-002 |
| TASK-012.19 | Frontend: admin failed notifications | FE | `/admin/notifications` table, filters, detail drawer with attempts, Retry with confirmation dialog, bulk retry, summary cards. | Out: pages/components. | 012.14, SPEC-003 | NFR-006, BRD-002 |
| TASK-012.20 | Unit tests | QA | Catalogue, PayloadGuard, templates, backoff math, sanitiser, classification, secret crypto, resolver rules. | Out: `tests/backend/notifications/unit/*`. | 012.04–012.12 | all |
| TASK-012.21 | Integration tests (atomicity, isolation, idempotency) | QA | Rollback leaves no notification; enqueue error does not fail transaction; SMTP down does not affect transition; retry no duplicates; fake SMTP server with fault injection. | Out: `tests/backend/notifications/integration/*`. | 012.11, SPEC-007 harness | BRD-036, BRD-039 |
| TASK-012.22 | Concurrency tests | QA | Two workers/SKIP LOCKED, double manual retry, retry vs worker race, duplicate enqueue same key. | Out: `tests/backend/notifications/concurrency/*`. | 012.11, 012.12 | NFR-006 |
| TASK-012.23 | Security tests | QA | Inbox scoping, admin RBAC, direct API calls, credential leak scan (logs, DB, audit, outbox, errors), template injection. | Out: `tests/backend/notifications/security/*`. | 012.13–012.15 | NFR-003, NFR-007 |
| TASK-012.24 | Matrix coverage test | QA | Table-driven test over the BRD-027 matrix (section 19.3): every row that lists a notification yields the expected events/recipients/channels. | Out: `tests/backend/notifications/workflow/*`. | 012.16, SPEC-007..010 | BRD-027, BRD-036 |
| TASK-012.25 | Frontend tests | QA | Component tests for bell/inbox/admin page, a11y checks, polling, retry dialog. | Out: `tests/frontend/notifications/*`. | 012.17–012.19 | NFR-008 |
| TASK-012.26 | UAT/API scripts for SPEC-016 | QA | Supply scenario data/scripts for UAT: account creation email, reset, approval, rejection, clarification, reassignment, SMTP failure + retry, completion. | Out: scripts handed to SPEC-016. | all | BRD-039 |

---

## 9. Business Rules

| # | Rule | Source |
|---|---|---|
| BR-012.01 | Twelve events are mandatory; all channels per section 19.1; no opt-out. | BRD-036 |
| BR-012.02 | Email-only for account creation and credential/password reset; Email AND In-app for workflow events. | BRD-036 |
| BR-012.03 | Notification failure never fails, rolls back or corrupts the core transaction; no exception. | BRD-036 |
| BR-012.04 | The workflow action remains recorded when delivery fails. | BRD-036 |
| BR-012.05 | Failures are logged for audit/troubleshooting. | BRD-036, BRD-022 |
| BR-012.06 | Failed notification may be retried without repeating the workflow transaction. | BRD-036 |
| BR-012.07 | Notification processing never creates duplicate transfer actions or transitions; retries are idempotent. | BRD-036, NFR-006 |
| BR-012.08 | Temp/reset passwords and tokens are never in logs or audit records; account-creation email is the only carrier of the initial password. | BRD-005, BRD-025, BRD-037 |
| BR-012.09 | Mandatory rejection/block reason is included in the message. | BRD-033, BRD-036 |
| BR-012.10 | A failed delivery remains visible with failure status/error details and supports authorised retry. | NFR-006 |
| BR-012.11 | A user sees only own in-app notifications. | NFR-007, BRD-026 |
| BR-012.12 | Notifications inform; they never grant authority: a link opens the transfer only after normal authorization. | BRD-026 |
| BR-012.13 | When Receiving Manager approval is disabled, no Receiving Manager notification is produced and "next approver" resolves to HR (BRD-012 / BRD-027 asterisk). | BRD-012, BRD-027 |
| BR-012.14 | A notification failure is never treated as, or converted into, a task Completed/Blocked/Failed state of Payroll/IT/HR work. | BRD-039 Integration rows |

## 10. Data Model & Database

PK/FK type convention `[PROPOSED]`: `uuid` primary keys; `users.id` (uuid) is SPEC-002's users PK and the FK target for every user reference; `users.user_id` is the business display key only [RECONCILED]. Timestamps `timestamptz`.

### 10.1 `notification_outbox` (kernel table from SPEC-001, extended here)

| Column | Type | Constraints / Notes |
|---|---|---|
| id | uuid | PK; this is `event_id` |
| event_key | varchar(200) | NOT NULL, UNIQUE (FR-012.18) |
| event_code | varchar(60) | NOT NULL, CHECK in catalogue codes |
| source_type | varchar(40) | NOT NULL (e.g. `workflow_history`, `user`, `task_assignment`) |
| source_id | uuid | NULL |
| transfer_request_id | uuid | NULL, FK `transfer_requests(id)` ON DELETE RESTRICT |
| actor_user_id | uuid | NULL, FK `users(id)` |
| payload | jsonb | NOT NULL; allow-listed non-sensitive fields only |
| secret_id | uuid | NULL, FK `notification_secrets(id)` ON DELETE SET NULL |
| resolution_status | varchar(20) | NOT NULL DEFAULT 'RESOLVED', CHECK IN ('RESOLVED','NO_RECIPIENTS','ERROR') |
| error_code | varchar(60) | NULL (for ERROR) |
| request_id | varchar(64) | NULL (correlation, never a token) |
| created_at | timestamptz | NOT NULL DEFAULT now() |

Indexes: UNIQUE(`event_key`), (`transfer_request_id`), (`event_code`,`created_at`), partial (`resolution_status`) WHERE `resolution_status <> 'RESOLVED'`.

### 10.2 `notification_deliveries`

| Column | Type | Constraints / Notes |
|---|---|---|
| id | uuid | PK |
| event_id | uuid | NOT NULL FK `notification_outbox(id)` ON DELETE RESTRICT |
| recipient_user_id | uuid | NOT NULL FK `users(id)` |
| recipient_email | varchar(254) | NULL (EMAIL channel snapshot; NULL for IN_APP) |
| channel | varchar(10) | NOT NULL CHECK IN ('EMAIL','IN_APP') |
| status | varchar(10) | NOT NULL DEFAULT 'PENDING' CHECK IN ('PENDING','SENT','FAILED') |
| attempts | int | NOT NULL DEFAULT 0 CHECK >= 0 |
| max_attempts | int | NOT NULL CHECK >= 1 |
| next_attempt_at | timestamptz | NOT NULL DEFAULT now() |
| last_attempt_at | timestamptz | NULL |
| sent_at | timestamptz | NULL |
| failed_at | timestamptz | NULL |
| last_error_code | varchar(60) | NULL |
| last_error | varchar(1000) | NULL (sanitised) |
| locked_at | timestamptz | NULL |
| locked_by | varchar(100) | NULL |
| manual_retry_count | int | NOT NULL DEFAULT 0 |
| last_manual_retry_by | uuid | NULL FK `users(id)` |
| last_manual_retry_at | timestamptz | NULL |
| template_key | varchar(80) | NULL |
| template_version | int | NULL |
| provider_message_id | varchar(255) | NULL |
| created_at / updated_at | timestamptz | NOT NULL |

Constraints: **UNIQUE (`event_id`,`recipient_user_id`,`channel`)** (idempotency key); CHECK (`status`='SENT' ⇒ `sent_at` NOT NULL); CHECK (`status`='FAILED' ⇒ `failed_at` NOT NULL); CHECK (`channel`='EMAIL' OR `recipient_email` IS NULL).
Indexes: partial (`next_attempt_at`) WHERE `status`='PENDING' (worker claim); (`status`,`failed_at` DESC) (admin); (`recipient_user_id`,`created_at` DESC); (`event_id`).

### 10.3 `notification_delivery_attempts`

| Column | Type | Notes |
|---|---|---|
| id | bigserial | PK |
| delivery_id | uuid | NOT NULL FK `notification_deliveries(id)` ON DELETE RESTRICT |
| attempt_no | int | NOT NULL; UNIQUE(`delivery_id`,`attempt_no`) |
| trigger | varchar(10) | 'AUTO' / 'MANUAL' |
| started_at, finished_at | timestamptz | |
| outcome | varchar(12) | 'SENT','TRANSIENT','PERMANENT' |
| error_code | varchar(60) | NULL |
| error_message | varchar(1000) | NULL sanitised |
| duration_ms | int | |
| initiated_by | uuid | NULL (user for MANUAL) |

Append-only by application convention (no UPDATE/DELETE in repository).

### 10.4 `in_app_notifications`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| delivery_id | uuid | NOT NULL UNIQUE FK `notification_deliveries(id)` |
| recipient_user_id | uuid | NOT NULL FK `users(id)` |
| event_code | varchar(60) | NOT NULL |
| transfer_request_id | uuid | NULL FK `transfer_requests(id)` |
| title | varchar(200) | NOT NULL |
| body | varchar(1000) | NOT NULL |
| link_path | varchar(300) | NULL, relative path only (CHECK starts with `/`) |
| created_at | timestamptz | NOT NULL |
| read_at | timestamptz | NULL |

Indexes: (`recipient_user_id`,`created_at` DESC); partial (`recipient_user_id`) WHERE `read_at` IS NULL (unread count). No hard delete in the application.

### 10.5 `notification_secrets`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| ciphertext | bytea | NOT NULL (overwritten with empty bytea when consumed/purged) |
| iv | bytea | NOT NULL (12 bytes) |
| auth_tag | bytea | NOT NULL (16 bytes) |
| key_version | smallint | NOT NULL |
| expires_at | timestamptz | NOT NULL |
| consumed_at | timestamptz | NULL |
| created_at | timestamptz | NOT NULL |

Never selected by any API/repository projection other than `SecretHandoffService`.

### 10.6 Retention

BRD defines no notification retention/deletion policy; no deletion is implemented `[TDD-REQUIRED]` TDD-012.13 (recommended: retain, review volume at deployment planning, NFR-009).

## 11. Backend Implementation

### 11.1 Module layout `[PROPOSED]`

```
backend/src/modules/notifications/
  catalogue.ts            controller/ routes/ validators/ dto/
  services/ NotificationService.ts  RecipientResolver.ts  TemplateService.ts
            DeliveryProcessor.ts  RetryService.ts  SecretHandoffService.ts  ErrorSanitizer.ts
  channels/ EmailChannel.ts  InAppChannel.ts  EmailTransport.ts
  repositories/ outboxRepository.ts deliveryRepository.ts attemptRepository.ts inAppRepository.ts secretRepository.ts
  templates/ <EVENT_CODE>.email.subject.hbs .email.html.hbs .email.text.hbs .inapp.hbs
backend/src/workers/notification-worker.ts
```

### 11.2 `enqueue` flow

1. Look up event in catalogue; validate payload (`PayloadGuard`).
2. Open savepoint on `{trx}`.
3. Insert outbox row `ON CONFLICT (event_key) DO NOTHING RETURNING`; if conflict, return existing id (no new deliveries).
4. Resolve recipients (`RecipientResolver`, same trx, read-only); de-duplicate by user id; drop inactive users per FR-012.09.
5. For each recipient × channel in the catalogue entry: insert delivery `ON CONFLICT DO NOTHING` with snapshot email, `max_attempts`, `next_attempt_at = now()`.
6. Release savepoint; register `trx.afterCommit(() => worker.wake())`.
7. On any exception in 3 to 5: rollback to savepoint, log, register error-row `afterCommit` hook (FR-012.12), return without throwing.

### 11.3 Environment variables (names `[PROPOSED]`; no values committed)

| Variable | Purpose |
|---|---|
| SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_REQUIRE_TLS | SMTP endpoint and TLS |
| SMTP_USER, SMTP_PASSWORD | Credentials (never logged) |
| SMTP_FROM_ADDRESS, SMTP_FROM_NAME | Sender identity |
| SMTP_CONNECTION_TIMEOUT_MS, SMTP_SOCKET_TIMEOUT_MS | Timeouts (TDD-012.03) |
| NOTIFICATION_EMAIL_ENABLED | Test/dev switch (FR-012.46) |
| NOTIFICATION_MESSAGE_ID_DOMAIN | Domain part of deterministic Message-ID |
| NOTIFICATION_WORKER_ENABLED, NOTIFICATION_WORKER_ID | Run worker in this process; worker identity |
| NOTIFICATION_POLL_INTERVAL_MS, NOTIFICATION_BATCH_SIZE | Polling (TDD-012.03) |
| NOTIFICATION_MAX_ATTEMPTS, NOTIFICATION_BACKOFF_BASE_SECONDS, NOTIFICATION_BACKOFF_CAP_SECONDS, NOTIFICATION_MANUAL_RETRY_ATTEMPTS | Retry policy (TDD-012.03) |
| NOTIFICATION_LOCK_TIMEOUT_SECONDS | Stale lock reclaim |
| NOTIFICATION_SECRET_KEY, NOTIFICATION_SECRET_KEY_VERSION, NOTIFICATION_SECRET_TTL_MINUTES, NOTIFICATION_SECRET_PURGE_INTERVAL_MINUTES | Secret handoff (TDD-012.04/05) |
| APP_BASE_URL | Deep-link base |
| NOTIFICATION_UI_POLL_SECONDS | Frontend polling hint (exposed via config endpoint or `NEXT_PUBLIC_`) |

### 11.4 Worker `DeliveryProcessor.process`

1. Load delivery + outbox event (+ transfer reference via read-only repository).
2. Render template (render failure: PERMANENT `TEMPLATE_RENDER_ERROR`).
3. EMAIL: if event has `secret_id`, load/decrypt; call `EmailTransport.send`; on success transaction { delivery SENT, attempt row, secret consumed }. IN_APP: transaction { insert in_app row, delivery SENT, attempt row }.
4. On failure classify, write attempt row, update delivery (guarded by `locked_by`), clear lock, log, and on terminal failure call audit (own transaction).
5. Any unexpected exception in the loop is caught per delivery so one bad row never stops the worker (try/catch around every async operation, `int-standards §2`).

### 11.5 Logging redaction

The SPEC-001 logger redaction list is extended with: `password`, `temporaryPassword`, `secret`, `ciphertext`, `SMTP_PASSWORD`, `SMTP_USER`, `authorization`, `cookie`, `html`, `text` (rendered bodies of credential templates). A unit test asserts redaction.

## 12. API Requirements

Base path `/api/v1`; envelopes per contract section 2; auth JWT per SPEC-002. All endpoints `[PROPOSED]`.

### 12.1 Inbox (any authenticated user, own data only)

| # | Method + path | Purpose | Request | Response | Errors |
|---|---|---|---|---|---|
| 1 | `GET /api/v1/notifications` | List own in-app notifications | Query: `page`, `pageSize` (default 20, max 100), `unread` (bool), `sort=createdAt`, `order=desc` | `{success, data:[{id, eventCode, title, body, linkPath, transferRequestId, createdAt, readAt}], meta:{page,pageSize,total,unreadCount}}` | 401; 400 `VALIDATION_ERROR` |
| 2 | `GET /api/v1/notifications/unread-count` | Bell count | none | `{success, data:{unreadCount}}` | 401 |
| 3 | `POST /api/v1/notifications/:id/read` | Mark one read (idempotent) | Path `id` uuid | `{success, data:{id, readAt}}` | 401; 400 invalid uuid; 404 `NOTIFICATION_NOT_FOUND` (also for another user's id) |
| 4 | `POST /api/v1/notifications/read-all` | Mark all own read | none | `{success, data:{updated:n}}` | 401 |

Authz: authenticated user; row filter `recipient_user_id = ctx.userId` in repository (not only controller). Status codes: 200, 400, 401, 404. Roles: all six `[BRD-026]`.

### 12.2 Admin (SUPER_ADMIN)

| # | Method + path | Purpose | Request | Response | Errors |
|---|---|---|---|---|---|
| 5 | `GET /api/v1/admin/notification-deliveries` | List deliveries | Query: `status` (PENDING/SENT/FAILED), `channel`, `eventCode`, `transferReference`, `recipientUserId`, `from`, `to` (ISO), `page`, `pageSize`, `sort`, `order` | `{data:[{id, eventId, eventCode, channel, status, recipientUserId, recipientEmailMasked, transferReference, attempts, maxAttempts, lastErrorCode, lastError, createdAt, lastAttemptAt, sentAt, failedAt, manualRetryCount}], meta}` | 401; 403; 400 |
| 6 | `GET /api/v1/admin/notification-deliveries/:id` | Detail + attempts | Path id | delivery fields + `attempts:[{attemptNo, trigger, startedAt, finishedAt, outcome, errorCode, errorMessage, durationMs}]`; no payload secrets, no rendered credential body | 401; 403; 404 |
| 7 | `POST /api/v1/admin/notification-deliveries/:id/retry` | Manual retry | Body `{reason?: string(<=500)}` | `{data:{id, status:'PENDING', manualRetryCount}}` | 401; 403; 404; 409 `NOTIFICATION_NOT_RETRYABLE`; 409 `NOTIFICATION_SECRET_EXPIRED` |
| 8 | `POST /api/v1/admin/notification-deliveries/retry-failed` | Bulk retry by filter | Body `{eventCode?, channel?, from?, to?, limit<=100}` | `{data:{retried:n, skipped:[{id,reason}]}}` | 401; 403; 400 |
| 9 | `GET /api/v1/admin/notifications/summary` | Health counts | none | `{data:{byStatus:{...}, byChannel:{...}, failedCount, oldestPendingAgeSeconds, unresolvedEvents}}` | 401; 403 |

Authz for 5 to 9: authenticated, role SUPER_ADMIN (`AuthorizationService.authorize` resource `notification_delivery`, actions `view`/`retry`); no organisation-scope narrowing for Super Admin `[BRD-010]`. Authenticated non-SUPER_ADMIN gets 403 without revealing counts (`[BRD-026]`). Validation: uuid path ids; enums; `limit` 1..100; date range `from <= to`, range max 366 days `[PROPOSED]`. Every retry is audited (section 18). Retry reason is audit remarks (optional `[PROPOSED]`; mandatory-reason rule applies in BRD only to workflow actions).

## 13. Frontend Implementation

Next.js App Router + Tailwind; shared UI kit from SPEC-001/003.

| Path / component | Description |
|---|---|
| `frontend/src/components/notifications/NotificationBell.tsx` | Header bell; badge shows unread count (`99+` cap); `aria-label="Notifications, N unread"`, `aria-live="polite"` on count; opens dropdown of latest 10; "Mark all read"; "View all". Polls `/notifications/unread-count`. |
| `frontend/src/components/notifications/NotificationList.tsx` | Shared list item (title, body snippet, relative time, unread dot, link). |
| `frontend/src/app/notifications/page.tsx` | Inbox page: unread/all filter, pagination, mark read on click, mark-all-read, loading/empty/error/no-access states `[BRD-002]`. Clicking an item marks it read then navigates to `linkPath`; navigation relies on target authorization. |
| `frontend/src/app/admin/notifications/page.tsx` | SUPER_ADMIN only (menu hidden for others, UX only; backend authoritative `[BRD-026]`). Summary cards (Failed, Pending, Oldest pending), filter bar, sortable table with status badges, row click opens detail drawer. |
| `frontend/src/components/notifications/DeliveryDetailDrawer.tsx` | Attempt history, error code/text, Retry button (enabled only for FAILED) with confirmation dialog `[BRD-002]`; message for `NOTIFICATION_SECRET_EXPIRED` linking to user credential reset. |

UX rules: never display secrets or rendered credential email bodies; masked emails in admin table; keyboard-operable bell and dropdown (Esc closes, focus return); contrast per organisational standards (NFR-008); desktop/tablet responsive. Failed email is never shown to the end user as an error in the workflow UI (failure is invisible to the acting user, visible to admin).

## 14. Validation Rules

| Rule | Where |
|---|---|
| Event code must exist in catalogue | enqueue |
| Payload must match event allow-list schema; forbidden key pattern rejected; max payload size 8 KB `[PROPOSED]` | `PayloadGuard` |
| `event_key` required, max 200 chars | enqueue |
| Recipient email must be syntactically valid and <= 254 chars (else `NO_EMAIL_ADDRESS`/`INVALID_EMAIL_ADDRESS` FAILED) | enqueue |
| Path `id` is uuid; query enums; `pageSize` 1..100; `from`/`to` ISO-8601 | API validators (SPEC-001 middleware; sanitise all input) |
| Bulk retry `limit` 1..100; at least one filter or explicit `limit` | API |
| Retry only when status = FAILED | RetryService |
| Template variables required per template; missing -> TEMPLATE_RENDER_ERROR | TemplateService |
| `link_path` must be relative path starting with `/`, no scheme/host | InAppChannel |
| Reasons embedded in messages are HTML-escaped; newlines normalised; length cap 1000 for in-app body | TemplateService |

## 15. Authorization & Security Rules

| Rule | Detail |
|---|---|
| Inbox scoping | `recipient_user_id = ctx.userId` in every query; id lookup by `(id, recipient_user_id)` pair. Another user's id -> 404. |
| Admin endpoints | SUPER_ADMIN only; 401 unauthenticated; 403 otherwise. |
| No transfer authority from notifications | A notification or link never carries a token; authorization re-checked at the destination `[BRD-026]`. |
| Credential secrecy | FR-012.30 to FR-012.36; log redaction; DTO allow-lists; secret columns excluded from projections. |
| Template injection | Handlebars auto-escape; no triple-stash for user content; no partial/helper loading from data; reasons treated as text. |
| Header injection | Subject/recipient/from values are stripped of CR/LF before reaching the SMTP library. |
| Least information in email | Email body carries reference, event text and reason; no document content, no excessive employee data. Reason text may be personal data; email goes only to authorised recipients. |
| Dependency isolation | FR-012.17: module cannot import workflow write paths. |
| Secrets in env | SMTP and secret key from `process.env` only, never committed `[int-standards §3]`. |
| Audit of retries | Manual retry audited with actor and role. |

## 16. Workflow / State Transition Rules

This SPEC introduces no transfer workflow transitions and never invokes `WorkflowEngine`. It defines the delivery state machine only.

| From | Event | To | Notes |
|---|---|---|---|
| (created) | enqueue | PENDING | `next_attempt_at = now()` |
| (created) | missing/invalid email at enqueue | FAILED | `NO_EMAIL_ADDRESS` |
| PENDING | attempt success | SENT | terminal |
| PENDING | transient failure, attempts < max | PENDING | `next_attempt_at` backoff |
| PENDING | transient failure, attempts = max | FAILED | terminal for auto; manual retry allowed |
| PENDING | permanent failure | FAILED | e.g. 5xx recipient rejected, `SECRET_UNAVAILABLE`, `TEMPLATE_RENDER_ERROR` |
| FAILED | manual retry (authorised) | PENDING | additional attempt budget |
| SENT | any | (no transition) | cannot be retried or reset |

Section 19.3 maps BRD-027 matrix rows to notification events (producers call `enqueue`; SPEC-007 to SPEC-010 own the transitions).

## 17. Transaction & Concurrency Rules

1. Outbox + deliveries are written in the producer's transaction through a savepoint (FR-012.10, FR-012.11). Commit ordering: business rows, history, audit, outbox, deliveries, one commit.
2. Rollback of the business transaction removes the notification (no phantom notifications).
3. Dispatcher never holds a DB transaction during SMTP I/O (FR-012.25).
4. `FOR UPDATE SKIP LOCKED` claim; result update guarded by `locked_by` and `status='PENDING'`; zero rows updated means another actor owned it and the worker discards its result (logged).
5. Manual retry uses `UPDATE ... SET status='PENDING' WHERE id=:id AND status='FAILED'`; zero rows -> 409. Double-click/two admins: only one succeeds.
6. Event idempotency: UNIQUE(`event_key`) and UNIQUE(`event_id`,`recipient_user_id`,`channel`).
7. Notification worker restart/crash: stale-lock reclaim; at-least-once email with residual duplicate risk (FR-012.23, TDD-012.06); no duplicate workflow effects because the worker has no write path to workflow tables.
8. Unread-count query uses the partial index; mark-read is a single UPDATE `WHERE read_at IS NULL`.
9. Isolation level: default READ COMMITTED sufficient `[PROPOSED]`.

## 18. Audit Requirements

Written through `AuditService.record` (SPEC-001 kernel; consolidated by SPEC-013). Never contain credentials, message bodies, or recipient email in clear.

| Event code `[PROPOSED]` | Trigger | Fields captured | BRD |
|---|---|---|---|
| NOTIFICATION_DELIVERY_FAILED | Delivery reaches terminal FAILED (attempts exhausted or permanent error) | deliveryId, eventId, eventCode, channel, recipientUserId, transferRequestId, attempts, errorCode, sanitised error, timestamp | BRD-036, BRD-022, NFR-006 |
| NOTIFICATION_RETRY_REQUESTED | Authorised manual retry (single or each of bulk) | deliveryId, retriedBy, role, previous status, previous attempts, reason (optional), timestamp | BRD-036, NFR-006 |
| NOTIFICATION_ENQUEUE_FAILED | Savepoint failure in `enqueue` or event stored with `ERROR` | eventCode, entity reference, errorCode, requestId | BRD-036 |
| NOTIFICATION_NO_RECIPIENTS | Event resolved to no recipient | eventCode, entity reference | BRD-036 |
| NOTIFICATION_SECRET_EXPIRED | Credential delivery failed because secret expired/purged | deliveryId, eventCode (`USER_ACCOUNT_CREATED`/`CREDENTIAL_RESET`), recipientUserId | BRD-005, BRD-025 |

Not audited as rows: transient attempts (logged + attempts table), successful sends (delivery table), inbox reads (no BRD requirement). Applications logs (structured) cover all attempts.

## 19. Notification Requirements

### 19.1 BRD-036 mandatory baseline (reproduced verbatim from BRD-036; trigger column added)

| Event | Recipient | Channel | Message / Purpose | Requirement | Trigger (producer / capability) |
|---|---|---|---|---|---|
| User account created | New User | Email | Account creation and temporary login credentials | Mandatory | SPEC-004 user creation, after credentials generated (secret handoff, FR-012.31) |
| Credential / password reset | User | Email | Password reset information / instructions | Mandatory | SPEC-004/002 administrator credential reset |
| Transfer submitted | Employee | Email / In-app | Transfer request submitted successfully | Mandatory | SPEC-006/007 Submit |
| Approval required | Assigned Approver | Email / In-app | Transfer request requires review / approval | Mandatory | SPEC-007 (Reporting/Receiving Manager stage entry, return from clarification, reassignment excluded), SPEC-009 (IT Final Approval stage entry) |
| Clarification requested | Employee / Responsible User | Email / In-app | Additional information / clarification required | Mandatory | SPEC-007/008 Request Clarification |
| Approval completed | Employee | Email / In-app | Transfer request approved at the applicable stage | Mandatory | SPEC-007 (Reporting/Receiving Manager approve), SPEC-008 (HR validate and approve; Receiving Manager re-approval) |
| Transfer rejected | Employee | Email / In-app | Transfer rejected, with the rejection reason | Mandatory | SPEC-007/008 Reject |
| HR action required | Assigned HR | Email / In-app | Transfer requires HR action | Mandatory | SPEC-007 (entry to Pending HR Review), SPEC-008 (return to HR Processing after re-approval) |
| Payroll task assigned | Authorized HR | Email / In-app | Payroll-related activity requires completion | Mandatory | SPEC-008/009 Complete HR Processing -> Payroll Processing |
| IT task assigned | Assigned IT User | Email / In-app | IT activity requires action | Mandatory | SPEC-009 Mark Payroll Completed -> Pending IT Action |
| Task blocked | Employee and relevant assigned user(s) | Email / In-app | Transfer / task has been blocked, including the reason | Mandatory | SPEC-010 Block (and IT/HR task block per SPEC-009) |
| Transfer completed | Employee and relevant stakeholders | Email / In-app | Employee transfer successfully completed | Mandatory | SPEC-009 IT Final Approve |

### 19.2 Full event catalogue `[PROPOSED]` codes; recipients per rules; `[TDD-REQUIRED]` marks stakeholder sets

Channel legend: E = Email, I = In-app. "Mandatory" = BRD-036 mandatory event (M) or other BRD-required notification (R, same failure rules).

| # | Event code | Class | Recipient resolution rule | Channels | Trigger spec/task | BRD |
|---|---|---|---|---|---|---|
| 1 | USER_ACCOUNT_CREATED | M | The newly created user at official email; Email only | E | SPEC-004 user creation task | BRD-036, BRD-005 |
| 2 | CREDENTIAL_RESET | M | The user whose credential was reset; Email only | E | SPEC-004/002 reset task | BRD-036, BRD-007 |
| 3 | TRANSFER_SUBMITTED | M | Employee (requester) | E+I | SPEC-007 Submit handler (SPEC-006 calls engine) | BRD-036, BRD-027 |
| 4 | APPROVAL_REQUIRED | M | Assigned approver = current pending owner from `transfer_task_assignments`: Reporting Manager, Receiving Manager (if enabled), IT final approver | E+I | SPEC-007 stage entry; SPEC-009 IT Final Approval stage entry | BRD-036, BRD-027 |
| 5 | CLARIFICATION_REQUESTED | M | Employee; or appropriate responsible user for HR/Receiving-Manager clarification during re-approval `[TDD-REQUIRED]` TDD-012.01(k) | E+I | SPEC-007 (Reporting/Receiving), SPEC-008 (HR) | BRD-036, BRD-034 |
| 6 | APPROVAL_COMPLETED | M | Employee; plus HR (assigned) when raised by Receiving Manager re-approval | E+I | SPEC-007 approve, SPEC-008 HR validate/approve and re-approval approve | BRD-036, BRD-027 |
| 7 | TRANSFER_REJECTED | M | Employee (reason included); plus assigned HR on Receiving Manager re-approval rejection | E+I | SPEC-007/008 reject | BRD-036, BRD-033, BRD-027 |
| 8 | HR_ACTION_REQUIRED | M | Assigned HR (location/organisation HR assignment of the employee) | E+I | SPEC-007 (to Pending HR Review), SPEC-008 (re-approval return to HR Processing; HR processing start) | BRD-036, BRD-027 |
| 9 | PAYROLL_TASK_ASSIGNED | M | Authorized HR = HR user(s) permitted to mark Payroll complete in scope; exact set `[TDD-REQUIRED]` TDD-012.01 | E+I | SPEC-008/009 Complete HR Processing | BRD-036, BRD-027(c) |
| 10 | IT_TASK_ASSIGNED | M | Assigned IT user (IT assignee among location IT users is contract gap §5(g)) | E+I | SPEC-009 Payroll completed | BRD-036, BRD-027 |
| 11 | TASK_BLOCKED | M | Employee and relevant assigned user(s): current task owner(s); other stakeholders `[TDD-REQUIRED]` TDD-012.01 | E+I | SPEC-010 Block; SPEC-009 task Blocked with reason (BRD-014) | BRD-036, BRD-027, BRD-014 |
| 12 | TRANSFER_COMPLETED | M | Employee and relevant stakeholders: Reporting Manager, Receiving Manager (if applicable), assigned HR, assigned IT user `[TDD-REQUIRED]` TDD-012.01 | E+I | SPEC-009 IT Final Approve | BRD-036, BRD-027 |
| 13 | CLARIFICATION_RESPONDED | R | Requesting approver (user who requested clarification) | E+I | SPEC-007/008 Respond to Clarification | BRD-027, BRD-034 |
| 14 | TRANSFER_WITHDRAWN | R | Stage-pending owner: pending approver (Reporting/Receiving Manager), requesting approver when Info Required, HR when Pending HR Review | E+I | SPEC-010 Withdraw | BRD-027 (Withdraw rows), BRD-OQ-12 |
| 15 | REAPPROVAL_REQUIRED | R | Receiving Manager (re-approval approver) and Employee; shows previous and new values summary (field names + values) | E+I | SPEC-008 HR organisation-metadata change when Receiving Manager enabled | BRD-024, BRD-027 |
| 16 | TASK_REASSIGNED | R | New assignee (required); previous assignee not notified `[TDD-REQUIRED]` TDD-012.01 | E+I | SPEC-010 Reassign | BRD-035 |
| 17 | TRANSFER_CANCELLED | R | Employee and relevant stakeholders `[TDD-REQUIRED]` TDD-012.01 | E+I | SPEC-010 Cancel (incl. Blocked-cancel) | BRD-027 |
| 18 | TRANSFER_RESUMED | R | Relevant stakeholders `[TDD-REQUIRED]` TDD-012.01 (recommended: Employee + owner of the restored stage) | E+I | SPEC-010 Resume (successful revalidation only) | BRD-027 |
| 19 | IT_TASKS_COMPLETED | R | Employee and relevant users; payload flag `noItActionRequired` with remark for the No IT Action Required variant `[TDD-REQUIRED]` TDD-012.01 | E+I | SPEC-009 Complete IT Tasks / No IT Action Required | BRD-027 matrix |
| 20 | TASK_OVERDUE | R | Recipients per escalation configuration (SPEC-014); no timings or recipients assumed here `[TDD-REQUIRED]` contract §5(n) | E+I | SPEC-014 overdue detection calling `enqueue` | BRD-023, BRD-OQ-10 |

Not implemented (not approved/required): account activation notification ("where approved", BRD-023) and account lock/unlock notices (no BRD requirement); listed so Gate 1 can request them.

Recommended defaults for stakeholder sets `[PROPOSED]` (TDD-012.01): "relevant stakeholders" = Employee + Reporting Manager of the employee + assigned HR + assigned IT user (if an IT task exists) + Receiving Manager (if enabled and the request reached that stage); the acting user is excluded from their own notification. "Relevant assigned user(s)" = current pending owner(s) of the stage. Each set is one resolver function.

### 19.3 BRD-027 matrix to notification events (rows of the "Notification" column)

| Matrix row (Current -> Action) | Matrix notification text | Events emitted |
|---|---|---|
| Draft -> Submit | Reporting Manager notified | TRANSFER_SUBMITTED (Employee), APPROVAL_REQUIRED (Reporting Manager) |
| Pending RM Approval -> Approve | Employee + next approver notified | APPROVAL_COMPLETED (Employee); then APPROVAL_REQUIRED (Receiving Manager) if enabled, else HR_ACTION_REQUIRED (assigned HR) |
| Pending RM Approval -> Reject | Employee notified | TRANSFER_REJECTED |
| Pending RM Approval -> Request Clarification | Employee notified | CLARIFICATION_REQUESTED |
| Pending Receiving Manager Approval -> Approve | Employee + HR notified | APPROVAL_COMPLETED (Employee), HR_ACTION_REQUIRED (HR) |
| Pending Receiving Manager Approval -> Reject | Employee notified | TRANSFER_REJECTED |
| Pending Receiving Manager Approval -> Request Clarification | Employee notified | CLARIFICATION_REQUESTED |
| Info Required -> Respond | Requesting approver notified | CLARIFICATION_RESPONDED |
| Pending HR Review -> Validate & Approve | Employee/relevant team notified | APPROVAL_COMPLETED (Employee); HR_ACTION_REQUIRED (assigned HR, HR Processing) `[TDD-REQUIRED]` team set |
| Pending HR Review -> Reject | Employee notified | TRANSFER_REJECTED |
| Pending HR Review -> Request Clarification | Employee notified | CLARIFICATION_REQUESTED |
| HR Processing -> change org data | Receiving Manager + Employee notified | REAPPROVAL_REQUIRED |
| Pending RM Re-Approval -> Approve | HR + Employee notified | APPROVAL_COMPLETED (Employee + HR) |
| Pending RM Re-Approval -> Reject | HR + Employee notified | TRANSFER_REJECTED (Employee + HR) |
| Pending RM Re-Approval -> Request Clarification (BRD-024 allows; no matrix row; `[DERIVED]` row, contract §5(l)) | not specified | CLARIFICATION_REQUESTED to responsible user `[TDD-REQUIRED]` TDD-012.01(k) |
| HR Processing -> Complete HR Processing | HR/Payroll users notified | PAYROLL_TASK_ASSIGNED |
| Payroll Processing -> Payroll Completed | IT/relevant users notified | IT_TASK_ASSIGNED |
| Pending IT Action -> Complete IT Tasks | Employee/relevant users notified | IT_TASKS_COMPLETED; APPROVAL_REQUIRED (IT final approver) |
| Pending IT Action -> No IT Action Required | Relevant users notified | IT_TASKS_COMPLETED (variant); APPROVAL_REQUIRED (IT final approver) |
| Pending IT Final Approval -> Final Approve | Employee + relevant stakeholders notified | TRANSFER_COMPLETED |
| Withdraw (4 rows) | Pending/requesting approver, HR | TRANSFER_WITHDRAWN |
| Block (3 rows) | Relevant stakeholders | TASK_BLOCKED |
| Resume (3 rows) | Relevant stakeholders | TRANSFER_RESUMED |
| Cancel (4 rows, refused row excluded) | Relevant stakeholders / Employee and stakeholders | TRANSFER_CANCELLED |
| Reassign (Super Admin) | New assignee notified | TASK_REASSIGNED |
| Refused rows (HR cancel IT-blocked; non-Super-Admin reassign; invalid transition) | none | None: no transition occurred, no notification `[BRD-027: no notification tied to an invalid transition]` |

### 19.4 Message baseline

Subject pattern `[PROPOSED]`: `[Internal Transfer] <Title> - <TransferReference>`. In-app title = event title; body = one-sentence message from the "Message / Purpose" column plus the reason where applicable (rejection, block, cancellation, withdrawal, clarification question). No account credentials in any in-app body (account events have no In-app channel).

## 20. Error & Edge Cases

| Case | Behaviour |
|---|---|
| SMTP server down/timeouts | Delivery stays PENDING with backoff, then FAILED; business transaction unaffected; admin sees failure; retry works. |
| SMTP permanent rejection (invalid mailbox) | FAILED immediately (`SMTP_PERMANENT`); no auto retry; visible to admin. |
| Recipient has no/invalid official email | EMAIL delivery FAILED (`NO_EMAIL_ADDRESS`); IN_APP still created; manual retry re-reads the email. |
| Process crash mid-send | Stale-lock reclaim; email may duplicate (TDD-012.06); in-app exactly once. |
| Crash between SMTP accept and SENT update | Same as above. |
| Duplicate enqueue for same event | No-op via `event_key`; no duplicate deliveries. |
| Enqueue throws (resolver/DB/schema error) | Savepoint rolled back; business transaction commits; ERROR log + error row. |
| Business transaction rolls back | No outbox/deliveries; worker never sees them. |
| Event with no recipients | `NO_RECIPIENTS` row, WARN log. |
| Temp password secret expired before send | `SECRET_UNAVAILABLE` FAILED; admin must reset credentials; retry refused with 409. |
| Template variable missing | `TEMPLATE_RENDER_ERROR` FAILED, logged. |
| Recipient deactivated between enqueue and send | EMAIL still sent if already enqueued `[TDD-REQUIRED]` TDD-012.07; In-app row created but unreachable. |
| Worker disabled/not running | Deliveries accumulate PENDING; summary endpoint shows oldest pending age; no business impact. |
| Clock skew between app and DB | `next_attempt_at` computed by DB `now()` only. |
| Very long reason text | Truncated to payload limit with validation done upstream (reason max length owned by producing spec); notification truncates display to 1000 chars. |
| Rejected/invalid workflow transition | No enqueue (no event). |
| Admin retries a SENT delivery | 409 `NOTIFICATION_NOT_RETRYABLE`. |
| Mark-read of another user's notification | 404, no state change. |
| Very large backlog | Batch size and poll interval bound throughput; no unbounded memory; ordering not guaranteed `[PROPOSED]`. |
| Receiving Manager disabled mid-flight | Recipient rule resolves at enqueue time using the stored routing decision, not a later config read `[PROPOSED]`. |

## 21. Acceptance Criteria

| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-012.AC01 | Given an Employee submits a Draft, When the submission commits, Then the Employee receives TRANSFER_SUBMITTED by Email and In-app and the Reporting Manager receives APPROVAL_REQUIRED by Email and In-app. | BRD-036, BRD-027 |
| SPEC-012.AC02 | Given the Reporting Manager approves and Receiving Manager is enabled, When committed, Then the Employee gets APPROVAL_COMPLETED and the Receiving Manager gets APPROVAL_REQUIRED, both Email + In-app. | BRD-036, BRD-027 |
| SPEC-012.AC03 | Given Receiving Manager approval is disabled, When the Reporting Manager approves, Then the Employee gets APPROVAL_COMPLETED and the assigned HR gets HR_ACTION_REQUIRED; no Receiving Manager notification exists. | BRD-012, BRD-027 |
| SPEC-012.AC04 | Given an approver requests clarification with a question, When committed, Then the Employee/responsible user receives CLARIFICATION_REQUESTED containing the question on both channels. | BRD-036, BRD-034 |
| SPEC-012.AC05 | Given an approver rejects with a reason, When committed, Then the Employee receives TRANSFER_REJECTED containing the reason on both channels. | BRD-036, BRD-033 |
| SPEC-012.AC06 | Given HR rejects an ineligible employee, When committed, Then the Employee is notified with the reason and no Payroll/IT notification is produced. | BRD-029, BRD-033 |
| SPEC-012.AC07 | Given the Employee responds to a clarification, When committed, Then the requesting approver receives CLARIFICATION_RESPONDED. | BRD-027, BRD-034 |
| SPEC-012.AC08 | Given HR completes HR Processing, When committed, Then authorised HR receives PAYROLL_TASK_ASSIGNED; given Payroll is marked complete, Then the assigned IT user receives IT_TASK_ASSIGNED. | BRD-036, BRD-027 |
| SPEC-012.AC09 | Given IT gives Final Approval, When committed, Then the Employee and relevant stakeholders receive TRANSFER_COMPLETED on both channels. | BRD-036 |
| SPEC-012.AC10 | Given a request is Blocked with a reason, When committed, Then the Employee and the relevant assigned user(s) receive TASK_BLOCKED including the reason. | BRD-036, BRD-027 |
| SPEC-012.AC11 | Given the Super Admin reassigns a task, When committed, Then the new assignee receives TASK_REASSIGNED and the previous assignee does not. | BRD-035 |
| SPEC-012.AC12 | Given the Employee withdraws from each permitted stage, When committed, Then the pending approver/requesting approver/HR receives TRANSFER_WITHDRAWN. | BRD-027 |
| SPEC-012.AC13 | Given the Super Admin creates a user, When committed, Then the new user receives USER_ACCOUNT_CREATED by Email only (no In-app row), the email body contains User ID and temporary password, and no log line, audit row, outbox payload, delivery error or attempt row contains the password. | BRD-005, BRD-036, BRD-025 |
| SPEC-012.AC14 | Given a credential reset, When committed, Then the user receives CREDENTIAL_RESET by Email only and no credential is persisted in logs/audit/payload. | BRD-007, BRD-036 |
| SPEC-012.AC15 | Given HR changes Department/BU, Designation, Location or Reporting Manager with Receiving Manager enabled, When committed, Then the Receiving Manager and Employee receive REAPPROVAL_REQUIRED, and on the decision the HR + Employee receive the outcome notification. | BRD-024, BRD-027 |
| SPEC-012.AC16 | Given a Cancel or Resume succeeds, When committed, Then stakeholders receive TRANSFER_CANCELLED or TRANSFER_RESUMED respectively; a failed Resume revalidation emits no TRANSFER_RESUMED. | BRD-027 |
| SPEC-012.AC17 | Given the SMTP server is unavailable, When any workflow action commits, Then the action succeeds and is recorded, the status change persists, the In-app notification is delivered, the Email delivery shows PENDING/FAILED with error details, and the failure is logged. | BRD-036 |
| SPEC-012.AC18 | Given a FAILED Email delivery, When an authorised admin retries it and SMTP is available, Then it is sent exactly once, status SENT, with no new workflow history row, no new task assignment, no status change and no new outbox event. | BRD-036, NFR-006 |
| SPEC-012.AC19 | Given the same event is enqueued twice (same event_key) or the worker processes it twice, Then exactly one delivery per (event, recipient, channel) exists and exactly one In-app row is created. | NFR-006 |
| SPEC-012.AC20 | Given a user with unread notifications, When they open the inbox, Then they see only their own notifications, the bell shows the correct unread count, and marking read decrements it; mark-all-read zeroes it. | BRD-036, NFR-007 |
| SPEC-012.AC21 | Given SUPER_ADMIN opens the admin notifications page, Then FAILED deliveries are listed with event, channel, recipient, attempts, last error and timestamps, filterable by status/channel/event/date, with a Retry action requiring confirmation. | NFR-006 |
| SPEC-012.AC22 | Given the producing transaction rolls back, Then no outbox event, delivery or notification exists for it. | BRD-036 |
| SPEC-012.AC23 | Given automatic retries, Then attempts follow the configured backoff, each attempt is recorded, and after max attempts the status becomes FAILED and a NOTIFICATION_DELIVERY_FAILED audit entry exists. | BRD-036, NFR-006 |
| SPEC-012.AC24 | Given a recipient qualifies under two rules for one event, Then they receive one notification per channel. | FR-012.07 |

## 22. Negative Acceptance Criteria

| ID | Given / When / Then | BRD-039 / BRD |
|---|---|---|
| SPEC-012.NAC01 | Given User A, When A calls `GET /notifications` or `POST /notifications/:id/read` with a notification id owned by User B, Then no B data is returned; response 404; B's `read_at` unchanged. | BRD-039 Security (Employee cannot access another Employee's data), NFR-007 |
| SPEC-012.NAC02 | Given a non-SUPER_ADMIN (Employee, RM, Receiving Manager, HR, IT) calls any `/admin/notification-deliveries*` or `/admin/notifications/summary` endpoint directly (e.g. Postman), Then 403 and no data/counts are leaked. | BRD-039 Security (direct API access), BRD-026 |
| SPEC-012.NAC03 | Given an unauthenticated or expired-token request to any notification endpoint, Then 401. | BRD-026 |
| SPEC-012.NAC04 | Given a user attempts retry on a delivery as non-SUPER_ADMIN, Then 403 and the delivery status is unchanged. | BRD-026, NFR-006 |
| SPEC-012.NAC05 | Given an SMTP timeout after the server may have accepted the message, When the delivery is re-attempted, Then no second delivery row, no duplicate In-app row, no new workflow history/transition/task assignment is created (an email duplicate is the only possible effect and is recorded as a known risk, TDD-012.06). | BRD-039 Integration (timeout does not create duplicate downstream transactions; NFR-006 idempotency) |
| SPEC-012.NAC06 | Given repeated automatic and manual retries of one delivery, Then `count(transfer_workflow_history)`, `count(transfer_task_assignments)` and `transfer_requests.status` are identical before and after. | BRD-039 Integration, BRD-036 |
| SPEC-012.NAC07 | Given an SMTP failure, Then the failure is retried under controlled policy (bounded attempts, backoff) and not retried infinitely. | BRD-039 Integration (controlled retry) |
| SPEC-012.NAC08 | Given all notification channels fail, Then no HR/Payroll/IT task is marked Completed or Failed and the transfer is never moved to or from Completed because of notification outcome. | BRD-039 Integration (does not incorrectly mark task/transfer Completed) |
| SPEC-012.NAC09 | Given a retry is requested for a SENT delivery, Then 409 `NOTIFICATION_NOT_RETRYABLE`, no resend. | NFR-006 |
| SPEC-012.NAC10 | Given a payload containing a key such as `password` or `token`, Then `enqueue` rejects it inside the savepoint, the business transaction commits, an ERROR log (without the value) exists. | NFR-003, BRD-036 |
| SPEC-012.NAC11 | Given the notification module is searched for imports of `WorkflowEngine` or workflow/vacancy/task write repositories, Then none exist; the dispatcher process cannot invoke any transition. | BRD-036 |
| SPEC-012.NAC12 | Given an invalid workflow transition (403 `INVALID_WORKFLOW_TRANSITION`), Then no notification event is enqueued. | BRD-027 |
| SPEC-012.NAC13 | Given a template variable containing `<script>` or CR/LF header injection (e.g. a rejection reason), Then the email/in-app output is escaped and headers are not injectable. | BRD-026 spirit, int-standards §3 |
| SPEC-012.NAC14 | Given a credential delivery whose secret has expired, Then it is FAILED `SECRET_UNAVAILABLE`, admin retry returns 409 `NOTIFICATION_SECRET_EXPIRED`, and no password is reconstructible from any table or log. | BRD-005, NFR-003 |
| SPEC-012.NAC15 | Given the SMTP password is configured, When any error occurs, Then the password string never appears in logs, `last_error`, attempts, audit or API responses. | NFR-003 |

## 23. Testing Requirements

Locations: `tests/backend/notifications/{unit,integration,api,security,concurrency,workflow,negative}`, `tests/frontend/notifications`. SMTP tests use a fake SMTP server (e.g. `smtp-server`/MailHog) with fault injection (refuse, delay beyond timeout, 4xx, 5xx, drop after DATA).

| TC ID | Type | Description | Maps to |
|---|---|---|---|
| TC-012.01 | Unit | Catalogue contains exactly the twelve mandatory events with channels per 19.1; account events are Email only | AC13, AC14 |
| TC-012.02 | Unit | PayloadGuard rejects forbidden keys, oversize, unknown keys | NAC10 |
| TC-012.03 | Unit | Backoff function: monotonic, capped, jitter bounds, config-driven | AC23 |
| TC-012.04 | Unit | SMTP error classification (421/450 transient, 550 permanent, timeout transient) | NAC07 |
| TC-012.05 | Unit | ErrorSanitizer strips credential-like content, truncates | NAC15 |
| TC-012.06 | Unit | SecretHandoff encrypt/decrypt, tamper detection (GCM tag), key version, no plaintext in repo layer | AC13, NAC14 |
| TC-012.07 | Unit | Template rendering per event/channel, escaping, missing variable error | NAC13 |
| TC-012.08 | Unit | RecipientResolver rules per event incl. Receiving Manager disabled, dedupe, acting-user exclusion | AC02, AC03, AC24 |
| TC-012.09 | Unit | Logger redaction list covers new keys | NAC15 |
| TC-012.10 | Integration | enqueue writes outbox + deliveries inside caller trx; rollback leaves none | AC22 |
| TC-012.11 | Integration | enqueue failure (forced resolver error) does not fail/rollback caller trx; error row created | AC17, NAC10 |
| TC-012.12 | Integration | SMTP unavailable: transition commits, status persisted, in-app delivered, email PENDING->FAILED | AC17 |
| TC-012.13 | Integration | Manual retry after SMTP recovers: SENT once; history/assignment/status counts unchanged | AC18, NAC06 |
| TC-012.14 | Integration | Duplicate enqueue same event_key: one delivery set | AC19 |
| TC-012.15 | Integration | In-app exactly-once under repeated processing | AC19 |
| TC-012.16 | Integration | Worker crash simulation: stale lock reclaim; no workflow side effects | NAC05 |
| TC-012.17 | Integration | Attempt rows and audit entry on terminal failure | AC23 |
| TC-012.18 | Integration | Missing email -> FAILED NO_EMAIL_ADDRESS; in-app still created; retry after fix | FR-012.19 |
| TC-012.19 | Integration | Secret purge/expiry flow; retry 409 | NAC14 |
| TC-012.20 | API | Inbox list/pagination/unread filter/unreadCount | AC20 |
| TC-012.21 | API | Mark read idempotent; mark-all-read | AC20 |
| TC-012.22 | API | Admin list filters, detail with attempts, summary | AC21 |
| TC-012.23 | API | Retry success, 409 not retryable, 404, validation errors | AC18, NAC09 |
| TC-012.24 | API | Bulk retry limit 100, skipped reasons | FR-012.51 |
| TC-012.25 | Security | Cross-user inbox access (ids guessed) -> 404, no mutation | NAC01 |
| TC-012.26 | Security | Role matrix on admin endpoints (all non-Super-Admin roles 403; no auth 401) | NAC02, NAC03, NAC04 |
| TC-012.27 | Security | Credential leakage scan: run account-creation flow, grep logs, DB tables (`notification_outbox`, deliveries, attempts, audit_logs) for the generated password | AC13, NFR-003 |
| TC-012.28 | Security | SMTP password never in any output under induced auth failure | NAC15 |
| TC-012.29 | Security | Template/header injection | NAC13 |
| TC-012.30 | Security | Dependency-boundary lint: no workflow write imports | NAC11 |
| TC-012.31 | Concurrency | Two workers, N deliveries: each claimed once (SKIP LOCKED) | NFR-006 |
| TC-012.32 | Concurrency | Two admins retry same FAILED delivery: one success, one 409 | NAC09 |
| TC-012.33 | Concurrency | Manual retry racing with worker claim | NFR-006 |
| TC-012.34 | Concurrency | Concurrent enqueue of same event_key from two transactions | AC19 |
| TC-012.35 | Workflow | Table-driven test over every BRD-027 notification row (19.3) | AC01 to AC16 |
| TC-012.36 | Workflow | Invalid transition emits no event | NAC12 |
| TC-012.37 | Workflow | Receiving Manager enabled vs disabled routing recipients | AC02, AC03, BR-012.13 |
| TC-012.38 | Negative | SMTP drop-after-DATA timeout: no duplicate rows/transitions | NAC05 |
| TC-012.39 | Negative | Notification failure never changes task/transfer status | NAC08 |
| TC-012.40 | Negative | Bounded retries; terminal FAILED | NAC07 |
| TC-012.41 | Frontend | Bell count, polling, dropdown, keyboard, aria-live | AC20 |
| TC-012.42 | Frontend | Inbox page: filters, mark read, empty/error/no-access states | AC20 |
| TC-012.43 | Frontend | Admin page: filters, drawer, retry confirmation, disabled retry for non-FAILED | AC21 |
| TC-012.44 | Frontend | Non-Super-Admin cannot see admin menu; direct URL shows no-access (backend 403) | NAC02 |
| TC-012.45 | UAT | Account creation email received, first login forced change; credential reset; approval/rejection/clarification/reassignment/completion notifications; SMTP outage + retry (SPEC-016) | BRD-039 UAT subset |

## 24. Definition of Done

- All TASK-012.01 to TASK-012.26 complete; migrations apply and roll back cleanly on a clean PostgreSQL.
- All twelve mandatory events produce the correct recipients/channels in integration tests (TC-012.35 table-driven coverage of the BRD-027 matrix, 100% of rows listing a notification).
- Failure isolation proven: forced SMTP failure and forced `enqueue` failure never fail, roll back or alter a workflow transaction (TC-012.11, 012.12).
- Idempotency proven: duplicate enqueue, double processing, repeated retries create no duplicate delivery, in-app row, history row, task assignment or transition (TC-012.13 to 012.15, 012.31 to 012.34).
- Credential leak scan passes: no temporary/reset password or SMTP credential in logs, audit rows, outbox payload, delivery/attempt errors or API responses (TC-012.27, 012.28).
- Inbox scoping and admin RBAC verified including direct API calls (TC-012.25, 012.26).
- Admin failed-notification view and authorised retry usable; accessibility checks pass.
- Structured logger only (no `console.log`); async/await with try/catch; env-var config; no AI-generated comments (int-standards).
- TDD-012.xx decisions either resolved at Gate 1 or the `[PROPOSED]` default recorded as accepted.
- Gate 1 approved before planning/tasks execution; Gate 2 code review passed; `status.md`, dashboard, PR review records and `prompt_history.md` synchronised per AGENTS.md.

---

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-012.01 | Recipient sets for "relevant stakeholders", "relevant users/team", "relevant assigned user(s)", "Authorized HR" (Payroll task), responsible user for HR/Receiving Manager clarification (contract §5(i), (k), (l)) | Employee + Reporting Manager + assigned HR + assigned IT user (if IT task exists) + Receiving Manager (if applicable); acting user excluded; Authorized HR = HR users in the employee's location scope permitted by SPEC-002 to mark Payroll complete; clarification at HR/re-approval stage goes to the Employee | Recipient resolver functions; message volume; UAT expectations |
| TDD-012.02 | SMTP provider/service and relay arrangement (BRD only says enterprise/official company email service) | Standard SMTP via enterprise relay using `nodemailer`; fake SMTP server for tests | `EmailTransport` config, deployment prerequisites, firewall/relay allow-listing |
| TDD-012.03 | Retry policy numbers: poll interval, batch size, max attempts, backoff base/cap/jitter, SMTP timeouts, permanent vs transient classes (BRD-038 timeouts TBC) | poll 5 s; batch 20; max 5 attempts; base 60 s; cap 3600 s; jitter 0.8 to 1.2; connect 10 s; socket 30 s; manual retry grants 3 more attempts | Delivery latency, load, admin workload |
| TDD-012.04 | **MASTER of the merged credential hand-off decision** (see TDD-001.04, TDD-004.07). How the temp password reaches the email without being persisted in clear: (A) encrypted short-lived secret table, (B) in-memory handoff only, (C) regenerate-on-send (rejected) | [RECONCILED R-12] ONE merged Gate 1 decision, master ID **TDD-012.04** (= TDD-001.04 = TDD-004.07), remains TDD-REQUIRED. Options: (A) encrypted short-lived secret store (AES-256-GCM `notification_secrets`, consumed/overwritten on send); (B) in-memory hand-off: credential held only in process memory and sent synchronously after commit, never written to PostgreSQL/outbox/log/audit, failure recovered by administrator credential reset (BRD-007); (C) regenerate-on-send (rejected: the temp password is already hashed at creation). Recommended default `[PROPOSED]`: **B**, because BRD-006 says plaintext must never be persisted in PostgreSQL and a reversible ciphertext plus env key in the same database is a weaker reading of that sentence; A is the documented fallback if the business requires automatic retry of the first-contact email. Impact: SPEC-001 outbox, SPEC-004 creation/reset flow, SPEC-012 dispatcher (`notification_secrets`, FR-012.31-33 apply only if A is chosen), SPEC-002 first login. Previous 012 default was A. | Security review; BRD-006 interpretation (ciphertext vs plaintext persistence); resilience of first-contact email **[DECIDED 2026-10-07 — Option B]** Approved: in-memory handoff, no plaintext persistence (PostgreSQL, logs, audit, files, any storage); only the hash is stored; plaintext held in memory only for delivery via the approved channel, unrecoverable afterwards; valid until first successful login, then forced change, after which the temporary hash no longer authenticates. Option A (`notification_secrets`) is not selected. Source: decision text supplied by the spec author; the formal Gate 1 record is still to be captured in `pr_reviews/GATE1-*`. |
| TDD-012.05 | Secret TTL and purge schedule | 24 h TTL, purge every 15 min; expiry requires admin reset | Credential delivery window vs exposure window |
| TDD-012.06 | Residual duplicate-email risk when SMTP acknowledges but `SENT` is not persisted | Accept (at-least-once) with deterministic Message-ID and logging; in-app and workflow are exactly-once | Wording of "no duplicates" in UAT: applies to notifications rows and workflow actions, not to a guaranteed single physical email under crash |
| TDD-012.07 | Treatment of Inactive/Deactivated recipients (skip, deliver, or hold) | Skip (log `NOTIFICATION_RECIPIENT_SKIPPED`) except account/credential events; already-enqueued items still delivered | Recipient resolver; completeness of stakeholder notices |
| TDD-012.08 | Template engine and ownership (code-versioned vs admin-editable) | Handlebars, code-versioned in repository, no admin editing in this phase | Change process for message copy; i18n out of scope |
| TDD-012.09 | Worker deployment: in-process vs separate Node process; scaling | Separate entry point, run as second process in local deployment; same codebase | Operations, monitoring (SPEC-015) |
| TDD-012.10 | Who may view failed notifications and retry (BRD says "authorised") | SUPER_ADMIN only | RBAC rows, admin menu; HR scoped retry would need ScopeResolver rules |
| TDD-012.11 | Whether the previous assignee (reassignment), the actor, or the employee on withdraw receive confirmations | No (only BRD-required recipients) | Message volume |
| TDD-012.12 | Audit granularity for notifications: failures only vs every send | Terminal failures, manual retries, enqueue failures, secret expiry only | Audit volume vs traceability; SPEC-013 catalogue |
| TDD-012.13 | Retention/archival of notification and in-app data (BRD silent) | Retain indefinitely; no deletion in application; revisit at deployment planning | Storage growth; privacy review |
| TDD-012.14 | Unread-count transport: polling vs server push (SSE/WebSocket) | Polling every 60 s | Freshness vs complexity |
| TDD-012.15 | Behaviour of notification links for deactivated/out-of-scope users (404 vs no-access) and use of 404 for another user's notification id vs 403 | 404 on notification id; target page enforces normal 403 | Consistency with BRD-026 wording; test expectations |
| TDD-012.16 | Optional/non-mandatory notification preferences (BRD defines all twelve as Mandatory) | No preferences in this phase | None unless Gate 1 requests |

## Out of Scope (this SPEC)

Nothing in this SPEC introduces any item from the BRD "Out of Scope" list. Specifically: no SMS/push/chat channels or enterprise identity/SSO delivery (MFA/SSO out of scope, BRD-025); no external HR/Payroll/IT integration, callback or API (BRD Integration Requirements, BRD-OQ-19); no notification user preferences or opt-out (all twelve events Mandatory); no escalation timelines, overdue thresholds or escalation-recipient configuration (SPEC-014, BRD-023/BRD-OQ-10); no workflow transitions, vacancy logic, audit log UI or export (SPEC-007 to SPEC-010, SPEC-013); no Facilities/Admin role notifications (removed from scope); no password-reset/credential-generation logic (SPEC-002/004); no production SMTP capacity, availability or monitoring targets (NFR-009, deferred to deployment planning).
