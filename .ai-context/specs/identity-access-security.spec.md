# SPEC-002 — Identity, Authentication, Account Security & Authorization

## Feature ID
identity-access-security

## Status
Changes Requested at Gate 1 (2026-10-27) — reviewer Shamik Bhattacharya; see `.ai-context/pr_reviews/SPEC-002-identity-access-security-20261027-162007.md`. Spec must be updated and re-submitted for Gate 1; plan, tasks, tests and code remain blocked

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 1 (Spec Peer Review) | Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) | 2026-10-27 | Changes Requested | `.ai-context/pr_reviews/SPEC-002-identity-access-security-20261027-162007.md` |
| Gate 2 (Code Review) | — | — | Not started | — |

## Intent & Business Goals

Give every user of the Internal Transfer Digital Journey an individual, locally authenticated account (unique User ID + password), protect those accounts with the approved password, lockout, idle-timeout and session-invalidation policy, and make the **backend/API the authoritative authorization layer** for every protected request using the five-step pipeline `Authenticated User → Role → Organisation Scope → Resource → Action (+ current workflow stage)` `[BRD-026]`.

Business outcomes:
- No public signup; accounts exist only because a Super Admin (or the one-time bootstrap seeder) created them `[BRD-004, DERIVED]`.
- A temporary password forces a first-login change that cannot be bypassed by calling the API directly `[BRD-006]`.
- Brute-force protection (5 consecutive failures → 30-minute lock), 30-minute idle timeout, immediate server-side invalidation on reset / deactivation / lock `[BRD-025]`.
- One reusable `AuthorizationService` + `ScopeResolver` contract so SPEC-003…SPEC-014 enforce role, scope, resource, action and stage identically, with no leakage of restricted data in 401/403/404 responses `[BRD-026]`.
- Security events (login failures, lock/unlock, reset, role/permission change, authorization denials) are audited and credentials/tokens are never logged `[BRD-008, BRD-037, NFR-003]`.

## User Roles & Actors

- **Super Admin** — bootstrap identity; unlocks accounts (API here, UI in SPEC-004); all-scope authorization subject to the matrix.
- **Employee, Reporting Manager, Receiving Manager, HR, IT** — log in with User ID + password; change the temporary password; are subject to role/scope/resource/action/stage authorization.
- **System (seeder / scheduled sweeper)** — non-human actor for bootstrap and housekeeping events (audit actor `SYSTEM`).
- Out-of-band actors: Postman / direct API clients are treated exactly like the frontend `[BRD-026]`.

---

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-002 |
| Title | Identity, Authentication, Account Security & Authorization |
| Purpose | Local-credential authentication, account lifecycle security, session management, RBAC and the API-level authorization pipeline |
| Business objective | Secure individual access with least privilege; enforce BRD-025 and BRD-026 on every protected request |
| Version | 0.1 (Draft) |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer (per roster) | Project Manager / Product Owner |
| Task prefix | TASK-002.MM |
| Classification legend | `[BRD]` stated by BRD · `[DERIVED]` follows necessarily from BRD text · `[PROPOSED]` reviewable technical design · `[TDD-REQUIRED]` Technical Design Decision Required — Not Defined by BRD |

## 2. Why This SPEC Exists

1. Every other spec depends on "who is calling and may they do this?". SPEC-001 provides the kernels (config, logger, error classes, `AuditService`, `withTransaction`); SPEC-002 is the first spec that makes a request *authenticated and authorized*.
2. BRD-025 defines concrete security values (5 failures, 30 minutes, 30 minutes idle, password rule, reset/deactivation invalidation) that must be enforced on **every protected request**, not only at login.
3. BRD-026 states the exact permission matrix is **defined at spec level and not assumed**; this spec drafts it (section 15.4) and marks every cell the BRD does not support as `[TDD-REQUIRED]`.
4. The BRD assumes a Super Admin exists but never says how the first one is created (bootstrap gap) — this spec closes it as a `[DERIVED]` seeder with `[TDD-REQUIRED]` parameters.
5. The scaffold in `frontend/src/` currently assumes e-mail login, `forgot-password` / `reset-password` self-service pages, and a token in `localStorage`; these conflict with BRD-001 (User ID login), BRD-007 (reset by authorised administrator only) and secure-storage practice, and are reconciled here (tasks TASK-002.28–002.33).

## 3. BRD Traceability

### 3.1 BRD requirement IDs

| BRD ID | Coverage | Slice owned by SPEC-002 |
|---|---|---|
| BRD-001 | FULL (with SPEC-003 for org-scope master data) | Individual authenticated accounts, local credentials (User ID + password), role-aware and scope-aware access model |
| BRD-006 | FULL | Temporary password valid until first login, forced first-login change incl. direct API calls, hashes only |
| BRD-007 | FULL for mechanics (admin UI/trigger in SPEC-004) | Statuses Pending Activation / Active / Locked / Inactive, complexity validation, failed-login protection, lock/unlock, session timeout, reset invalidation, forced change after reset |
| BRD-008 | PARTIAL — authentication/security events | Emits first-login change, lock/unlock, reset, activation/deactivation (mechanics), login-failure events; account-creation audit is SPEC-004; catalogue verification SPEC-013 |
| BRD-025 | FULL | Every row of the BRD-025 policy table (section 3.4) |
| BRD-026 | FULL (pipeline, matrix draft, enforcement framework); resource scope data supplied by SPEC-003/004/006+ | 5-step pipeline, 401/403, no leakage, direct-API protection, authorization-denial audit |
| BRD-004 | PARTIAL | Only the User ID *format validator* and role-prefix registry consumed by login; generation is SPEC-004 |
| BRD-005 | PARTIAL | Guarantee that temp/reset passwords are never logged/audited; credential delivery is SPEC-004/012 |
| BRD-009 | PARTIAL | "First login (forced password replace)" step |
| BRD-010 | PARTIAL | Role definitions and Super Admin authority for account actions (matrix rows); functional UI elsewhere |
| BRD-022 / BRD-037 | PARTIAL — security-event slice | Event emission; no password/token/credential ever in audit payloads; visibility/export is SPEC-013 |
| BRD-027 | PARTIAL | Step 5 "action permitted at current workflow stage" hook (`StagePolicy`); transition matrix and `INVALID_WORKFLOW_TRANSITION` are SPEC-007 |
| BRD-039 | PARTIAL — Security rows | Rows in 3.6 |
| NFR-001 | FULL | Authentication |
| NFR-002 | FULL | Authorization |
| NFR-003 | FULL (audit slice with SPEC-013) | Credential security |
| NFR-005 | PARTIAL | Security events captured |
| NFR-007 | PARTIAL | Role/scope gate that document and employee access (SPEC-011, SPEC-004) must call |

### 3.2 Open questions

| ID | Resolution implemented here |
|---|---|
| BRD-OQ-01 | Local credential authentication; MFA/SSO not built |
| BRD-OQ-02 | Role-prefixed User IDs (validated at login), password complexity, failed-login protection, lock/unlock, session timeout, admin reset, forced change after reset (values confirmed 2026-09-30) |

### 3.3 Business rules covered

Authentication & session policy (BRD-025 table); role + scope + resource + action authorization (BRD-026); security events audited and credentials never logged (BRD-037 Security paragraph); IT sees minimum required employee information (enforced here as a *scope capability*, field list `[TDD-REQUIRED]` TDD-002.16).

### 3.4 BRD-025 parameter map

| BRD-025 parameter | Implementing FR / task |
|---|---|
| 5 consecutive failed attempts → temporary lock | FR-002.20–.24 / TASK-002.10 |
| Lock 30 minutes; Super Admin may also unlock | FR-002.21, FR-002.26 / TASK-002.10, 002.25 |
| Session / idle timeout 30 min inactivity | FR-002.30–.33 / TASK-002.08, 002.13 |
| Complexity: ≥8, 1 upper, 1 lower, 1 number, 1 special | FR-002.10–.13 / TASK-002.05–.06 |
| Temporary password valid until first login, no time expiry; change before proceeding | FR-002.14–.19 / TASK-002.11, 002.14 |
| Reset invalidates **all** active sessions | FR-002.35 / TASK-002.09 |
| Deactivation: cannot log in or call protected APIs; sessions invalidated | FR-002.36 / TASK-002.09, 002.13 |
| Locked: cannot authenticate or call protected APIs | FR-002.25 / TASK-002.13 |
| Password storage hashes only | FR-002.08–.09 |
| Credential logging prohibition | FR-002.60–.62 / TASK-002.22 |
| MFA/SSO out of scope | Out of Scope section |
| Enforced on every protected request | FR-002.40–.43 / TASK-002.13 |

### 3.5 Acceptance criteria traceability (BRD "Acceptance Criteria" bullets)

| BRD acceptance bullet (summary) | Coverage | SPEC-002 AC |
|---|---|---|
| Unique User ID + strong temp password at creation | PARTIAL (generation in SPEC-004; policy-compliance contract here) | SPEC-002.AC04 |
| Must change temp password on first successful login; plaintext never stored | FULL | AC05–AC08 |
| Locked 30 min after 5 consecutive failures; cannot authenticate or call APIs until expiry/unlock | FULL | AC12–AC18 |
| Session expires after 30 min inactivity; reset/deactivation invalidates all sessions | FULL | AC19–AC24 |
| Password complexity; tokens/credentials never logged; MFA/SSO out of scope | FULL | AC09–AC11, AC30 |
| Every protected API validates the 5-step pipeline; 401 vs 403; direct API (Postman) rejected | FULL | AC25–AC29 |
| Super Admin can reset credentials and activate/deactivate | PARTIAL (mechanics here; UI/trigger SPEC-004) | AC21, AC22 |
| Each user sees only assigned employees/requests/tasks | PARTIAL (framework here; resolvers SPEC-003/004/006+) | AC26, AC27 |
| Material security action audited | PARTIAL | AC30–AC32 |

### 3.6 Negative scenarios (BRD-039 Security rows)

| BRD-039 Security scenario | Coverage | SPEC-002 NAC |
|---|---|---|
| User cannot access another organisation's data outside assigned scope | FULL (framework; datasets by feature specs, validated in SPEC-016) | NAC05, NAC06 |
| Employee cannot access another Employee's transfer request | FULL (framework) — end-to-end validated in SPEC-006/016 | NAC07 |
| IT cannot access Employee documents outside authorised scope | PARTIAL (matrix + scope gate; document endpoint SPEC-011) | NAC08 |
| User cannot bypass mandatory first-login password change | FULL | NAC01, NAC02 |
| Locked user cannot log in | FULL | NAC09, NAC10 |
| Deactivated user cannot log in | FULL | NAC11, NAC12 |
| Old password cannot be used after reset | FULL | NAC13, NAC14 |
| Direct API access cannot bypass role/scope/resource/action authorization | FULL | NAC03, NAC04, NAC15 |

## 4. Dependencies

| Depends on | Needed for |
|---|---|
| SPEC-001 | Config loader (env secrets), Winston/Pino logger with redaction, request-id, error classes + response envelope, validation middleware, `withTransaction`, `AuditService.record(event,{trx})` incl. non-human actor `SYSTEM`, Sequelize base/migration conventions, Next.js layout shell and UI kit |
| SPEC-003 | Location / Department-BU master data and org-scope mappings (HR location/organisation scope, IT location scope, Receiving Manager scope `[TDD-REQUIRED]`) consumed by `ScopeResolver` implementations |
| SPEC-004 | `employee_profiles` (reporting manager, assigned HR/IT, location) consumed by employee-scope resolvers; user creation, temp-password generation, credential e-mail trigger, admin UI for reset / unlock / activate / deactivate — SPEC-004 **calls** the services defined here |
| BRD-defined seed values | Seeder env variables (section 11.7) |

## 5. Enables

| Spec | What it gets from SPEC-002 |
|---|---|
| SPEC-003, 004 | `authenticate`, `requirePermission` middleware, `users` table, `AccountSecurityService` |
| SPEC-005…010 | `AuthorizationService.authorize`, `ScopeResolver` registry, `StagePolicy` hook, list-scope filters |
| SPEC-011 | `authorize(ctx,{resource:DOCUMENT,…})` before every download; no public URLs |
| SPEC-012 | Authenticated principal for in-app inbox ownership |
| SPEC-013 | Security event codes (section 18) and the "authorization denied" event shape |
| SPEC-014, 015, 016 | Permission registry for dashboards/reports; NFR hardening review; BRD-039 security tests |

## 6. Roles & Scope

Roles `[BRD-001]`: enum `SUPER_ADMIN, EMPLOYEE, REPORTING_MANAGER, RECEIVING_MANAGER, HR, IT`. User ID prefixes `EMP/MGR/HR/IT` + 6 digits `[BRD-004]`.

**Gaps (all `[TDD-REQUIRED]`, see closing section):** User ID prefix for Receiving Manager and Super Admin (TDD-002.01); creation path for Receiving Manager (SPEC-004); default Super Admin bootstrap parameters (TDD-002.02); more-than-one-role per user (TDD-002.04); Receiving Manager ↔ target team scope (TDD-002.15).

Scope vocabulary used by the pipeline (names `[PROPOSED]`, semantics from BRD-026 step 3):

| Scope code | Meaning (BRD-026 step 3) | Data supplier |
|---|---|---|
| `ALL` | Unrestricted organisational data | Super Admin; no resolver query needed |
| `OWN` | Resource's owner/subject is the caller | Built-in `OwnScopeResolver` (SPEC-002) |
| `ASSIGNED_EMPLOYEES` | Reporting hierarchy: employees with an ACTIVE `reporting_manager_assignments` row whose `reporting_manager_user_id` = caller | SPEC-003 `reporting_manager_assignments` (single source) [RECONCILED] was SPEC-004 profile column |
| `ASSIGNED_TASK` | Request/task whose current pending owner = caller (`transfer_task_assignments`) | SPEC-007/009 |
| `LOCATION_ORG` | Location / Department-BU mapped to the caller (HR location/org scope, IT location scope) | SPEC-003/004 |
| `TARGET_TEAM` | Receiving Manager's target department/team `[TDD-REQUIRED]` | SPEC-003/004 once TDD-002.15 decided |
| `NONE` | Role has no access | — |

## 7. Functional Requirements

### 7.1 Accounts, identity and bootstrap

| ID | Requirement | Tag |
|---|---|---|
| FR-002.01 | The system has **no public signup / self-registration endpoint**; user rows are created only by SPEC-004 (Super Admin flow) or the bootstrap seeder. | `[DERIVED]` BRD-004, BRD-010 |
| FR-002.02 | Authentication uses a unique User ID + password (local credentials). No MFA, SSO or external identity provider. | `[BRD]` BRD-001, BRD-OQ-01, BRD-025 |
| FR-002.03 | `users` holds exactly one role per row (enum above). Whether one person may hold several roles is open. | `[PROPOSED]` single role; `[TDD-REQUIRED]` TDD-002.04 |
| FR-002.04 | Account statuses `PENDING_ACTIVATION, ACTIVE, LOCKED, INACTIVE` (labels Pending Activation, Active, Locked, Inactive/Deactivated) with the transition table in section 16. | `[BRD]` BRD-007 (codes `[PROPOSED]`) |
| FR-002.05 | Default Super Admin bootstrap: an idempotent seeder creates the first `SUPER_ADMIN` user from environment variables when no Super Admin exists. The account starts `PENDING_ACTIVATION` with `must_change_password = true`; no password is hard-coded; the seeder never logs the password. | `[DERIVED]` BRD assumes a Super Admin exists (BRD-004/010); parameters `[TDD-REQUIRED]` TDD-002.02 |
| FR-002.06 | Protection of the last active Super Admin: deactivating, demoting or role-changing the last `ACTIVE` Super Admin is refused. | `[PROPOSED]` `[TDD-REQUIRED]` TDD-002.14 |
| FR-002.07 | User ID normalisation: trimmed, upper-cased, matched against `^[A-Z]{2,4}[0-9]{6}$` (covers EMP/MGR/HR/IT and any approved Receiving Manager / Super Admin prefix) before any database lookup. | `[PROPOSED]` |

### 7.2 Password storage and policy

| ID | Requirement | Tag |
|---|---|---|
| FR-002.08 | Passwords are stored only as `bcryptjs` hashes in `users.password_hash`; plaintext is never persisted in PostgreSQL, logs, reports, audit records, queue/outbox payloads or error responses. | `[BRD]` BRD-006, BRD-025, NFR-003 |
| FR-002.09 | bcrypt cost factor read from `BCRYPT_COST` (default 12, allowed 10–14); hashing/comparing uses the async API so the event loop is not blocked synchronously (INT performance rule). | `[PROPOSED]` |
| FR-002.10 | Password policy (`PasswordPolicy.validate`): length ≥ 8; ≥ 1 uppercase; ≥ 1 lowercase; ≥ 1 number; ≥ 1 special character. | `[BRD]` BRD-025 |
| FR-002.11 | "Special character" = any printable ASCII character that is not a letter, digit or whitespace; upper/lower = ASCII A–Z / a–z. | `[PROPOSED]` `[TDD-REQUIRED]` TDD-002.07 |
| FR-002.12 | Maximum length 72 bytes (UTF-8) because bcrypt ignores bytes beyond 72; longer values are rejected, never silently truncated. | `[DERIVED]` library limit; limit value `[PROPOSED]` |
| FR-002.13 | The same rule set is exposed as a shared validator for the frontend (UX only) and as `PasswordPolicy.assertCompliant(password)` for the backend (authoritative). SPEC-004's temporary-password generator MUST output only policy-compliant values (verified by test). | `[BRD]` BRD-004 "strong temporary password"; contract `[PROPOSED]` |

### 7.3 Temporary password and first-login change

| ID | Requirement | Tag |
|---|---|---|
| FR-002.14 | A temporary password remains valid until the user's first successful login; **it has no time-based expiry**. | `[BRD]` BRD-025 |
| FR-002.15 | A login with a user whose `must_change_password = true` succeeds only with a **restricted-scope session** (`scp = PASSWORD_CHANGE`); the response says `mustChangePassword: true`. | `[BRD]` BRD-006 mechanism `[PROPOSED]` |
| FR-002.16 | A restricted-scope session may call only `POST /api/v1/auth/change-password`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`. Every other protected route returns HTTP 403 `PASSWORD_CHANGE_REQUIRED`. | `[BRD]` BRD-006 "before accessing any other part… including direct API calls"; code `[PROPOSED]` |
| FR-002.17 | The guard is evaluated **from the database row** (`users.must_change_password`) on every protected request, not only from the token claim, so a token issued earlier cannot outlive a reset. | `[DERIVED]` BRD-006, BRD-025 "every protected request" |
| FR-002.18 | `change-password` requires the current password, a policy-compliant new password that differs from the current one, then: stores the new hash, sets `must_change_password = false`, `password_changed_at = now`, moves `PENDING_ACTIVATION → ACTIVE` where applicable, increments `token_version` (invalidating all earlier sessions), creates a **full-scope** session and returns its token. | `[DERIVED]` BRD-006/007; "differs" derived from "change"; full session issuance `[PROPOSED]` |
| FR-002.19 | The first-login change event is audited without any password (`AUTH_FIRST_LOGIN_PASSWORD_CHANGED`). Voluntary later changes (Active users) reuse the endpoint (`AUTH_PASSWORD_CHANGED`) — whether this self-service is allowed is open. | `[BRD]` BRD-008; voluntary change `[TDD-REQUIRED]` TDD-002.12 |

### 7.4 Failed-login protection and lock

| ID | Requirement | Tag |
|---|---|---|
| FR-002.20 | Each failed password verification for an existing, non-inactive user increments `failed_attempts`. The **5th consecutive** failure sets status `LOCKED`, `locked_until = now + 30 min`, records `status_before_lock`, and invalidates existing sessions. | `[BRD]` BRD-025; session invalidation on lock `[PROPOSED]` `[TDD-REQUIRED]` TDD-002.09 |
| FR-002.21 | Lock duration is 30 minutes. After `locked_until`, the account may attempt login again (lazy expiry at the next login attempt and in the "effective status" helper). | `[BRD]` BRD-025 |
| FR-002.22 | While locked, login attempts (right or wrong password) do **not** authenticate, do **not** increment the counter and do **not** extend `locked_until`. | `[DERIVED]` "cannot authenticate until the lock expires"; non-extension `[TDD-REQUIRED]` TDD-002.08 |
| FR-002.23 | Counter reset rules: (a) successful login resets to 0; (b) lock expiry resets to 0; (c) Super Admin unlock resets to 0; (d) administrator password reset resets to 0; (e) successful `change-password` resets to 0. After expiry the user gets a full allowance of 5. | `[BRD]` "consecutive" implies (a); (b)–(e) `[TDD-REQUIRED]` TDD-002.08 |
| FR-002.24 | A wrong *current* password submitted to `change-password` counts as a failed attempt on the same counter (otherwise a restricted token could be used to brute-force). | `[PROPOSED]` `[TDD-REQUIRED]` TDD-002.08 |
| FR-002.25 | A locked account cannot authenticate **or call protected APIs**; the authenticate middleware re-checks status/lock on every request. | `[BRD]` BRD-025 |
| FR-002.26 | Super Admin may unlock any `LOCKED` account via `POST /api/v1/auth/admin/users/{userId}/unlock` (UI in SPEC-004): status returns to `status_before_lock`, `locked_until = null`, `failed_attempts = 0`. | `[BRD]` BRD-025 "Super Admin may also unlock"; endpoint `[PROPOSED]` |
| FR-002.27 | Unknown User ID, wrong password and (to avoid enumeration) deactivated account return the **same** `401 INVALID_CREDENTIALS` response shape; for unknown users a dummy bcrypt comparison keeps timing comparable. Locked accounts return `403 ACCOUNT_LOCKED`. | `[PROPOSED]` `[TDD-REQUIRED]` TDD-002.10 |

### 7.5 Session management

| ID | Requirement | Tag |
|---|---|---|
| FR-002.30 | Chosen mechanism: **signed JWT bearer carrying `sid` and `tv`, validated on every request against server-side state** (`user_sessions` row + `users.token_version`); no refresh token. Rationale and alternatives in TDD-002.03. | `[PROPOSED]` `[TDD-REQUIRED]` TDD-002.03 **[DECIDED 2026-10-07]** |
| FR-002.31 | A session is valid only if: JWT signature/`exp` valid; session row exists, `revoked_at IS NULL`, `now − last_activity_at < 30 min`, `now < expires_at`; `jwt.tv = users.token_version`. | `[BRD]` 30-min idle; check design `[PROPOSED]` |
| FR-002.32 | Each authenticated request on an *active* route updates `last_activity_at = now` (sliding idle window). Routes registered `passive: true` (e.g. unread-count polling, health, session-status) do **not** extend the session so background polling cannot keep an idle session alive. | `[BRD]` inactivity semantics; `passive` flag `[PROPOSED]` `[TDD-REQUIRED]` TDD-002.05 |
| FR-002.33 | Absolute maximum session lifetime (`expires_at`, also JWT `exp`): the BRD gives none; default `AUTH_ABSOLUTE_SESSION_HOURS = 12`. | `[PROPOSED]` `[TDD-REQUIRED]` TDD-002.06 |
| FR-002.34 | Logout revokes only the current session. Expired idle sessions return `401 SESSION_EXPIRED`; revoked ones `401 SESSION_REVOKED`; the frontend redirects to login. | `[DERIVED]` BRD-025 "must log in again" |
| FR-002.35 | **Password reset by an administrator** (called by SPEC-004): atomically replaces `password_hash` with the hash of the new temporary password, sets `must_change_password = true`, `failed_attempts = 0`, increments `token_version` and revokes **all** the user's sessions; the old password is unusable immediately. | `[BRD]` BRD-025, BRD-039 |
| FR-002.36 | **Deactivation** (called by SPEC-004): status `INACTIVE`, `token_version + 1`, all sessions revoked; thereafter login and every protected request fail. Reactivation never restores old sessions. | `[BRD]` BRD-025 |
| FR-002.37 | Role change (called by SPEC-004) increments `token_version` and revokes sessions so the new role/permissions take effect immediately, and emits `AUTH_ROLE_CHANGED`. | `[DERIVED]` least privilege BRD-026; invalidation `[PROPOSED]` |
| FR-002.38 | `token_version` is incremented and all sessions revoked in the **same transaction** as the triggering account change. | `[DERIVED]` BRD-025 |

### 7.6 Enforcement on every protected request

| ID | Requirement | Tag |
|---|---|---|
| FR-002.40 | `authenticate` middleware runs on every protected route and re-evaluates, per request and without caching: token, session, idle timeout, token version, user status (`INACTIVE`/`LOCKED` rejected), lock expiry, `must_change_password` guard. | `[BRD]` BRD-025 last sentence |
| FR-002.41 | Authentication failures return `401` (missing, malformed, bad signature, expired, revoked, idle-expired, tv mismatch, user inactive/locked). Responses never reveal which sub-check failed beyond the stable code. | `[BRD]` BRD-026 step 1 |
| FR-002.42 | **Deny by default**: every route is registered through `defineRoute({ auth, permission })`; a route without an explicit declaration (`public`, `authenticated-only`, or a permission) fails application start-up / the route-coverage test. Public routes are limited to `GET /health`, `POST /api/v1/auth/login`. | `[PROPOSED]` supports BRD-026 |
| FR-002.43 | No in-process caching of user/session/permission state beyond the request; any later cache must keep revocation effective immediately (not allowed otherwise). | `[DERIVED]` BRD-025 |

### 7.7 Authorization (RBAC pipeline)

| ID | Requirement | Tag |
|---|---|---|
| FR-002.50 | `AuthorizationService.authorize(ctx, { resource, action, target })` evaluates in order **1 Authenticated user → 2 Role → 3 Organisation scope → 4 Resource → 5 Action (+ current workflow stage)** and stops at the first failing step. | `[BRD]` BRD-026 |
| FR-002.51 | Step 2 (Role): the permission registry (`permission.registry.ts`) lists, per role, the allowed `(resource, action)` pairs with the **scope code**; absence = deny. Registry is code (versioned, reviewable), not mutable at runtime. | `[PROPOSED]` |
| FR-002.52 | Step 3 (Scope): delegated to the `ScopeResolver` registered for the resource; `ALL` for Super Admin; `OWN` via built-in resolver; **no resolver registered ⇒ deny** (only `ALL`/`OWN` can pass). | `[BRD]` BRD-026 step 3; fail-closed `[DERIVED]` |
| FR-002.53 | Step 4 (Resource): the resolver also confirms the specific instance exists and is addressable by the caller (transfer request, employee record, vacancy, document, payroll task, IT task). | `[BRD]` BRD-026 step 4 |
| FR-002.54 | Step 5 (Action + stage): registry grants the action to the role; if `target.stage` is supplied and a `StagePolicy` is registered for the resource (by SPEC-007/009/010), it must also permit `(role, action, stage)`. A stage denial carries the policy-supplied `denyCode` (SPEC-007 supplies `INVALID_WORKFLOW_TRANSITION`). | `[BRD]` BRD-026 step 5, BRD-027 |
| FR-002.55 | Non-stage-aware actions (e.g. View) skip the stage check. Unknown `resource` or `action` codes throw a programming error (500, logged) rather than allow. | `[PROPOSED]` |
| FR-002.56 | List endpoints use `AuthorizationService.scopeFilter(ctx, resource)` returning a query predicate/IDs to apply in the repository, so out-of-scope rows are never fetched; the frontend is never relied upon to filter. | `[BRD]` BRD-026 "never relied on to filter" |
| FR-002.57 | Authorization returns `Decision { allowed, failedStep, reasonCode, denyCode?, scopeAttributes? }`. `failedStep`/`reasonCode` are internal (audit/log); the HTTP response is generic. | `[PROPOSED]` |
| FR-002.58 | Responses to denied requests contain no restricted employee/organisational data, no hint whether an ID exists, no list of permitted roles. For ID-addressed resources a non-Super-Admin receives the **same** `403 FORBIDDEN` for "exists but out of scope" and "does not exist" (Super Admin gets `404 NOT_FOUND` for non-existent). | `[BRD]` BRD-026 no-exposure; uniform 403 `[TDD-REQUIRED]` TDD-002.11 |
| FR-002.59 | Authorization denials on protected resources are audited as security events (`AUTHZ_DENIED`); invalid workflow transitions remain audited by SPEC-007 (`INVALID_WORKFLOW_TRANSITION_ATTEMPTED`). | `[BRD]` BRD-026, BRD-037 |

### 7.8 Credential and token hygiene

| ID | Requirement | Tag |
|---|---|---|
| FR-002.60 | Never write passwords, temporary/reset passwords, `Authorization` headers, access tokens (and any refresh tokens if later introduced), password hashes or session IDs to application logs or audit records. | `[BRD]` BRD-025, NFR-003 |
| FR-002.61 | Auth route request/response bodies are excluded from request logging; the logger redaction list (SPEC-001) is extended with keys `password, currentPassword, newPassword, temporaryPassword, token, accessToken, refreshToken, authorization, passwordHash, password_hash` (case-insensitive, nested). | `[PROPOSED]` |
| FR-002.62 | Login-failure audit stores the *attempted User ID only if it matches the User ID pattern*; otherwise `"[INVALID_FORMAT]"` is stored (prevents a password pasted into the User ID field from reaching audit/log). | `[PROPOSED]` |

### 7.9 Frontend

| ID | Requirement | Tag |
|---|---|---|
| FR-002.70 | Login page: User ID + password (not e-mail), generic failure messages, lock message, disabled submit while pending, no password echo in URL/logs. | `[BRD]` BRD-001 |
| FR-002.71 | Change-password page: shown automatically when `mustChangePassword = true` and not reachable-away-from until completed; live policy checklist (UX only); current password + new + confirm. | `[BRD]` BRD-006 |
| FR-002.72 | Session-expiry handling: idle timer mirrors the 30-minute server rule, warning before expiry (`[PROPOSED]` 2 minutes), any `401 SESSION_EXPIRED/SESSION_REVOKED` clears client state and routes to `/login?reason=session_expired`. | `[BRD]` BRD-025; warning `[PROPOSED]` |
| FR-002.73 | No-access / forbidden experience: `403 FORBIDDEN` shows a no-access state without restricted data; menus hide items by `permissions` from `/auth/me` (UX only). | `[BRD]` BRD-002, BRD-026 |
| FR-002.74 | Self-service "forgot password / reset password" is **not** provided (not in BRD; reset is by authorised administrator). The scaffolded pages are replaced by an informational "contact your administrator" notice. | `[DERIVED]` BRD-007; `[TDD-REQUIRED]` TDD-002.13 |
| FR-002.75 | Access token storage replaces `localStorage` (scaffold) with a tab-scoped store (`sessionStorage`) behind a single `tokenStore` module; never logged; cleared on logout/401. | `[PROPOSED]` `[TDD-REQUIRED]` TDD-002.17 |

## 8. Internal Implementation Plan / Tasks

Order is dependency-ordered; layer codes BE / FE / DB / QA. Tests are written first (TDD RED→GREEN) per task.

| ID | Title | Layer | Description | Inputs → Outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-002.01 | Migration `users` | DB | Create `users` table (10.1) with constraints and indexes | — → migration `…-create-users.ts` | SPEC-001 migration conventions | BRD-001, 006, 007, 025 |
| TASK-002.02 | Migration `user_sessions` | DB | Create `user_sessions` (10.2) | 002.01 → migration | 002.01 | BRD-025 |
| TASK-002.03 | Sequelize models | BE | `User`, `UserSession` models with enum types, `toSafeJSON` that omits `password_hash` | migrations → models | 002.01, 002.02 | BRD-006, NFR-003 |
| TASK-002.04 | Auth configuration | BE | Typed config: `JWT_SECRET`, `JWT_ISSUER`, `BCRYPT_COST`, `AUTH_MAX_FAILED_ATTEMPTS=5`, `AUTH_LOCK_MINUTES=30`, `AUTH_IDLE_MINUTES=30`, `AUTH_ABSOLUTE_SESSION_HOURS=12`; start-up validation (secret length ≥ 32, numeric ranges) | env → `auth.config.ts` | SPEC-001 config loader | BRD-025 |
| TASK-002.05 | PasswordService | BE | `hash`, `verify`, `needsRehash`, dummy-compare helper | plaintext → hash | 002.04 | BRD-006, NFR-003 |
| TASK-002.06 | PasswordPolicy | BE+FE | Rule engine, 72-byte limit, structured violation list; shared pure module also consumed by frontend | password → `{valid, violations[]}` | — | BRD-025 |
| TASK-002.07 | TokenService | BE | Sign/verify HS256 JWT (`sub, sid, tv, scp, iat, exp, iss`), reject `alg:none`/other algs, constant claim set | session → token | 002.04 | BRD-025, 026 |
| TASK-002.08 | SessionService | BE | `create`, `validateAndTouch(sid, tv, {passive})`, `revoke(sid)`, `revokeAllForUser(userId,{trx})`, idle/absolute checks | user → session row | 002.02, 002.03 | BRD-025 |
| TASK-002.09 | AccountSecurityService | BE | State machine: `recordFailedLogin`, `recordSuccessfulLogin`, `lock`, `unlock`, `normaliseLock`, `deactivate`, `activate`, `resetPasswordTo(tempPlain,…)`, `changeRole`, `setPasswordFromUserChange`, `getEffectiveStatus`; each in `withTransaction` incl. audit; last-Super-Admin guard | user id → updated row | 002.03, 002.05, 002.08, SPEC-001 audit | BRD-007, 008, 025 |
| TASK-002.10 | Login use case | BE | `POST /auth/login` flow (11.4): validate, normalise ID, dummy compare, verify outside lock, apply outcome under row lock, issue session/token | credentials → token | 002.05–002.09 | BRD-001, 006, 025 |
| TASK-002.11 | Change-password use case | BE | `POST /auth/change-password` (policy, differs, counter rules, token_version bump, full session) | restricted/full token → new token | 002.06, 002.09 | BRD-006, 007 |
| TASK-002.12 | Logout / me / keep-alive | BE | `POST /auth/logout`, `GET /auth/me` (profile + permission snapshot), `POST /auth/session/keepalive` | — → responses | 002.08, 002.18 | BRD-025, 026 |
| TASK-002.13 | `authenticate` middleware | BE | Full per-request check (FR-002.40), attaches `ctx` (`AuthContext`), active vs passive touch | request → `ctx` or 401/403 | 002.07–002.09 | BRD-025, NFR-001 |
| TASK-002.14 | Password-change guard | BE | Enforce restricted scope (route allow-list) from DB flag | ctx → pass / 403 `PASSWORD_CHANGE_REQUIRED` | 002.13 | BRD-006 |
| TASK-002.15 | AuthorizationService | BE | 5-step evaluator, `Decision`, `authorize`, `assertAuthorized`, `scopeFilter` | ctx + request → Decision | 002.18, 002.16, 002.17 | BRD-026, NFR-002 |
| TASK-002.16 | ScopeResolver framework | BE | Interface + registry + `OwnScopeResolver` + `AllScope`; default deny; test doubles for other specs' resolvers | resource → resolver | — | BRD-026 |
| TASK-002.17 | StagePolicy hook | BE | Interface + registry; policy supplies `allowed`, `denyCode`; none registered ⇒ no stage restriction for stage-less resources, deny for stage-aware actions (fail-closed list) | (role,action,stage) → decision | 002.15 | BRD-026, 027 |
| TASK-002.18 | Permission registry (matrix) | BE | Code-first registry from 15.4; unit tests assert every `?` TDD cell resolves to **deny** until decided; exports catalogue for `/auth/me` | — → `permission.registry.ts` | — | BRD-026 |
| TASK-002.19 | Enforcement middleware & `defineRoute` | BE | `requirePermission(resource, action, opts)` / `defineRoute`, targets loaded via `targetLoader`, route-coverage test (no undeclared route), `passive` flag | route def → middleware chain | 002.13, 002.15 | BRD-026 |
| TASK-002.20 | Error mapping | BE | Auth error classes → envelope with codes/status (section 12.9); generic 403 body | error → JSON | SPEC-001 error classes | BRD-026 |
| TASK-002.21 | Security audit emission | BE | Event builders for section 18 events incl. `AUTHZ_DENIED` (best-effort, never blocks 403) and masking rules | event → `AuditService.record` | SPEC-001 audit, 002.09, 002.15 | BRD-008, 037 |
| TASK-002.22 | Credential-hygiene hardening | BE | Extend logger redaction, disable body logging on `/auth/*`, test that no secret substring ever appears in logs/audit | log capture → pass/fail | SPEC-001 logger | BRD-025, NFR-003 |
| TASK-002.23 | Super Admin seeder | BE | Idempotent `sequelize-cli` seeder (11.7); system-actor audit | env → first Super Admin | 002.03, 002.05, 002.06 | BRD-004/010 (DERIVED) |
| TASK-002.24 | Recovery CLI | BE | `npm run auth:unlock-superadmin` / `auth:reset-superadmin` out-of-band tool (requires server shell + env secret), audited as `SYSTEM` | CLI → unlock/reset | 002.09 | BRD-025 (DERIVED) |
| TASK-002.25 | Unlock API | BE | `POST /auth/admin/users/{userId}/unlock` | Super Admin → unlocked user | 002.09, 002.19 | BRD-025 |
| TASK-002.26 | Service contracts for SPEC-004 | BE | Export typed `AccountSecurityService` facade used by user-provisioning (activate, deactivate, reset, changeRole, createCredentials) and document the "never log plaintext" calling contract | — → `account-security.contract.ts` | 002.09 | BRD-005, 007 |
| TASK-002.27 | Session housekeeping | BE | Scheduled job: delete sessions revoked/expired > `AUTH_SESSION_RETENTION_DAYS` (default 30), emit lock-expiry normalisation for effective status, no audit deletion | cron → cleaned rows | 002.08 | BRD-025 |
| TASK-002.28 | FE auth foundation | FE | `tokenStore`, rewrite `auth.service.ts` (`userId`), `authSlice`/`AuthContext` with `user, role, status, mustChangePassword, permissions`, axios interceptors (401/403 codes) | — → state & services | SPEC-001 FE shell | BRD-001, 025 |
| TASK-002.29 | FE login page | FE | `frontend/src/app/(auth)/login/page.tsx` rewrite | — → page | 002.28 | BRD-001 |
| TASK-002.30 | FE change-password page | FE | New `(auth)/change-password/page.tsx` + route guard | — → page | 002.28, 002.06 | BRD-006 |
| TASK-002.31 | FE session expiry | FE | `IdleSessionProvider`, warning modal, keepalive on user activity, `session_expired` banner | — → component | 002.28 | BRD-025 |
| TASK-002.32 | FE no-access & permission gating | FE | `(protected)/layout.tsx` guard, `no-access` view, `usePermission` rewrite, `Can` component; remove role-only `permissions.ts` string checks | `/auth/me` → UI gating | 002.28 | BRD-002, 026 |
| TASK-002.33 | FE remove self-service reset | FE | Replace `forgot-password`, `reset-password` pages with notice; delete `forgotPassword/resetPassword` service calls | — → pages | 002.28 | BRD-007 |
| TASK-002.34 | Unit tests (RED first) | QA | PasswordPolicy, PasswordService, TokenService, SessionService, AccountSecurityService state machine, AuthorizationService matrix | — → `tests/backend/identity-access/unit/*` | per task | all |
| TASK-002.35 | Integration & API tests | QA | Login/lock/unlock/change-password/logout/me, middleware chain, 401/403 matrix, error envelope | — → `tests/backend/identity-access/api/*` | 002.10–002.25 | all |
| TASK-002.36 | Security & BRD-039 tests | QA | First-login bypass attempts, direct API calls, token tampering, old-password-after-reset, locked/deactivated, scope bypass via test resolvers, log-secret scan | — → `…/security/*` | 002.35 | BRD-039 |
| TASK-002.37 | Concurrency tests | QA | Parallel failed logins at attempt 4/5, login vs reset, login vs deactivate, concurrent change-password, unlock vs login | — → `…/concurrency/*` | 002.35 | BRD-025 |
| TASK-002.38 | Frontend tests | QA | Login, change-password forced redirect, idle expiry, 401/403 handling, no-access, permission gating | — → `tests/frontend/identity-access/*` | 002.28–002.33 | BRD-001, 006, 025 |

## 9. Business Rules

| # | Rule | Tag |
|---|---|---|
| BR-002.01 | Authentication is local User ID + password; no MFA/SSO. | `[BRD]` BRD-025 |
| BR-002.02 | 5 consecutive failures lock the account for 30 minutes; Super Admin may unlock earlier. | `[BRD]` BRD-025 |
| BR-002.03 | Session expires after 30 minutes of inactivity. | `[BRD]` BRD-025 |
| BR-002.04 | Password ≥ 8 with upper, lower, number, special. | `[BRD]` BRD-025 |
| BR-002.05 | Temporary password valid until first login, no time expiry; first successful login must be followed by a password change before anything else. | `[BRD]` BRD-025, BRD-006 |
| BR-002.06 | Reset invalidates all sessions; user must log in with the new password. | `[BRD]` BRD-025 |
| BR-002.07 | Deactivated and locked accounts cannot authenticate or access protected APIs; enforced on every request. | `[BRD]` BRD-025 |
| BR-002.08 | Backend/API is the authoritative authorization layer; frontend hiding is UX only. | `[BRD]` BRD-026 |
| BR-002.09 | Pipeline order is fixed: Authenticated → Role → Scope → Resource → Action(+stage). | `[BRD]` BRD-026 |
| BR-002.10 | Missing/invalid/expired auth → 401; authenticated but not permitted → 403; denials never expose restricted data. | `[BRD]` BRD-026 |
| BR-002.11 | Authorization denials on protected resources are security events. | `[BRD]` BRD-026, BRD-037 |
| BR-002.12 | Pulling code or knowing a URL grants nothing; deny by default. | `[DERIVED]` BRD-026 |
| BR-002.13 | Passwords, temp/reset passwords and tokens never reach logs or audit. | `[BRD]` BRD-025, 037 |
| BR-002.14 | The permission matrix (15.4) is a draft; cells marked `?` are denied until the decision in the TDD section is recorded. | `[BRD]` BRD-026 "not assumed" |

## 10. Data Model & Database

Conventions from SPEC-001 (snake_case, UUID PK, `created_at/updated_at timestamptz`). All times UTC `timestamptz`.

### 10.1 `users` (identity columns; profile data is `employee_profiles` in SPEC-004)

| Column | Type | Constraints / notes |
|---|---|---|
| id | uuid | PK, `gen_random_uuid()` |
| user_id | varchar(20) | NOT NULL; unique case-insensitively (`UNIQUE INDEX ux_users_user_id_upper ON users (upper(user_id))`); CHECK `user_id ~ '^[A-Z]{2,4}[0-9]{6}$'` |
| role | varchar(24) | NOT NULL; CHECK in (`SUPER_ADMIN,EMPLOYEE,REPORTING_MANAGER,RECEIVING_MANAGER,HR,IT`) |
| status | varchar(24) | NOT NULL; CHECK in (`PENDING_ACTIVATION,ACTIVE,LOCKED,INACTIVE`) |
| password_hash | varchar(100) | NOT NULL (bcrypt output ≤ 60 chars) |
| must_change_password | boolean | NOT NULL default true |
| failed_attempts | integer | NOT NULL default 0, CHECK `>= 0` |
| locked_until | timestamptz | NULL; must be set iff `status = 'LOCKED'` (CHECK) |
| status_before_lock | varchar(24) | NULL; set iff `LOCKED`; CHECK in (`PENDING_ACTIVATION,ACTIVE`) |
| token_version | integer | NOT NULL default 1, CHECK `>= 1` |
| password_changed_at | timestamptz | NULL (null until first-login change completes) |
| last_login_at | timestamptz | NULL |
| deactivated_at | timestamptz | NULL |
| created_by | uuid | NULL, FK `users(id)` (null for seeder `SYSTEM`) |
| created_at / updated_at | timestamptz | NOT NULL |

Indexes: PK; `ux_users_user_id_upper`; `ix_users_role_status (role, status)`; `ix_users_locked (locked_until) WHERE status = 'LOCKED'`. No column for plaintext or reversible password. The seeder user's `created_by` is NULL.

Column-level rule: `password_hash`, `token_version`, `failed_attempts` are never selected by general repositories — `UserRepository.findPublicById` excludes them; only `AuthRepository` reads them.

### 10.2 `user_sessions`

| Column | Type | Constraints / notes |
|---|---|---|
| id | uuid | PK (this is `sid`; random, unguessable) |
| user_id | uuid | NOT NULL FK `users(id)` ON DELETE RESTRICT |
| token_version | integer | NOT NULL (value of `users.token_version` when issued) |
| scope | varchar(20) | NOT NULL CHECK in (`FULL,PASSWORD_CHANGE`) |
| created_at | timestamptz | NOT NULL |
| last_activity_at | timestamptz | NOT NULL |
| expires_at | timestamptz | NOT NULL (absolute lifetime) |
| revoked_at | timestamptz | NULL |
| revoked_reason | varchar(40) | NULL, CHECK in (`LOGOUT,IDLE_TIMEOUT,PASSWORD_CHANGED,PASSWORD_RESET,DEACTIVATED,LOCKED,ROLE_CHANGED,ADMIN_REVOKED,SUPERSEDED`) |
| client_ip / user_agent | inet / varchar(255) | NULL; not used for decisions (diagnostics only) `[PROPOSED]` |

Indexes: `ix_user_sessions_user_active (user_id) WHERE revoked_at IS NULL`; `ix_user_sessions_expires (expires_at)`. Concurrent sessions per user: allowed (BRD silent) `[TDD-REQUIRED]` TDD-002.19.

### 10.3 Migrations / seeds
`backend/src/migrations/<ts>-create-users.ts`, `<ts>-create-user-sessions.ts`; seeder `backend/src/seeders/<ts>-default-super-admin.ts`. No audit tables here (SPEC-001/013). Down-migrations drop tables; no data transformation.

## 11. Backend Implementation

### 11.1 Module layout (`backend/src/modules/identity-access/`)
`auth.controller.ts`, `auth.routes.ts`, `auth.service.ts` (login/change-password/logout), `account-security.service.ts`, `session.service.ts`, `token.service.ts`, `password.service.ts`, `password.policy.ts`, `authorization/authorization.service.ts`, `authorization/permission.registry.ts`, `authorization/scope-resolver.registry.ts`, `authorization/own.scope-resolver.ts`, `authorization/stage-policy.registry.ts`, `middleware/authenticate.ts`, `middleware/password-change-guard.ts`, `middleware/require-permission.ts`, `define-route.ts`, `validators/auth.validators.ts`, `dto/*.ts`, `repositories/user.repository.ts`, `repositories/session.repository.ts`, `events/security-audit.events.ts`.

### 11.2 Request pipeline
`requestId → bodyParser → authenticate → passwordChangeGuard → requirePermission(resource, action, targetLoader?) → validation → controller → service`. `authenticate` is skipped only for routes declared `public`.

### 11.3 `AuthContext`
`{ userId (uuid), loginId (User ID), role, status, sessionId, scope, mustChangePassword }`; never contains `password_hash`.

### 11.4 Login algorithm (`AuthService.login`)

1. Validate body (`userId`, `password` strings, length ≤ 128); normalise `userId`.
2. If `userId` fails pattern → dummy bcrypt compare, audit `AUTH_LOGIN_FAILED(reason=INVALID_FORMAT)`, return `401 INVALID_CREDENTIALS`.
3. Read user (no lock). Not found → dummy compare, audit `AUTH_LOGIN_FAILED(reason=UNKNOWN_USER, attemptedUserId)`, `401`.
4. `normaliseLock` (in txn, row lock): if `LOCKED AND locked_until <= now` → restore `status_before_lock`, `failed_attempts=0`, `locked_until=null`, audit `AUTH_ACCOUNT_LOCK_EXPIRED` (actor SYSTEM).
5. If still `LOCKED` → no verify, no counter change, audit `AUTH_LOGIN_FAILED(reason=ACCOUNT_LOCKED)`, return `403 ACCOUNT_LOCKED`.
6. If `INACTIVE` → dummy compare, audit `AUTH_LOGIN_FAILED(reason=ACCOUNT_INACTIVE)`, return `401 INVALID_CREDENTIALS` (no counter).
7. Verify password **outside** any row lock (hash time must not hold a lock).
8. Failure → txn: `SELECT … FOR UPDATE`; if `password_hash` changed since step 3 re-evaluate; `failed_attempts = failed_attempts + 1`; if `>= 5` → lock (FR-002.20, revoke sessions, `AUTH_ACCOUNT_LOCKED`) and return `403 ACCOUNT_LOCKED`; else audit `AUTH_LOGIN_FAILED(reason=BAD_PASSWORD, attempt n)` and return `401`. **Commit before responding** (the response is an error, the counter change must persist).
9. Success → txn: lock row; verify `password_hash` unchanged and status still usable; `failed_attempts=0`; `last_login_at=now`; create session (`scope = PASSWORD_CHANGE` if `must_change_password` else `FULL`); sign JWT; return `200`.
10. Rehash opportunistically when `BCRYPT_COST` increased (`needsRehash`).

### 11.5 `authenticate` algorithm
1. Read `Authorization: Bearer <jwt>`; absent/malformed → `401 AUTHENTICATION_REQUIRED`.
2. Verify signature (HS256 pinned, issuer, `exp`) → else `401 TOKEN_INVALID`.
3. Single query joining `user_sessions` and `users` by `sid`: not found / `revoked_at` → `401 SESSION_REVOKED`; `tv != users.token_version` → `401 SESSION_REVOKED`; idle (`now − last_activity_at ≥ 30 min`) or `now ≥ expires_at` → mark revoked (`IDLE_TIMEOUT`) then `401 SESSION_EXPIRED`.
4. `users.status = INACTIVE` → `401 ACCOUNT_INACTIVE`; `LOCKED` and `locked_until > now` → `401 ACCOUNT_LOCKED` (lock expired → normalised but session already revoked at lock time so still `401 SESSION_REVOKED`).
5. Non-passive route → `UPDATE user_sessions SET last_activity_at = now WHERE id = sid` (same query set).
6. Attach `ctx`.
7. Guard: if `users.must_change_password` (DB row) and route not in the restricted allow-list → `403 PASSWORD_CHANGE_REQUIRED`; a `PASSWORD_CHANGE` session may never access routes outside the allow-list even if the flag was just cleared (a new full session is issued by change-password).

### 11.6 Authorization contracts (TypeScript, `[PROPOSED]`)

```ts
type Role = 'SUPER_ADMIN'|'EMPLOYEE'|'REPORTING_MANAGER'|'RECEIVING_MANAGER'|'HR'|'IT';
type ResourceCode = 'USER_ACCOUNT'|'EMPLOYEE_PROFILE'|'MASTER_DATA'|'VACANCY'|'TRANSFER_REQUEST'
  |'APPROVAL_TASK'|'PAYROLL_TASK'|'IT_TASK'|'DOCUMENT'|'AUDIT_LOG'|'NOTIFICATION'
  |'WORKFLOW_CONFIGURATION'|'ESCALATION_SETTINGS'|'DASHBOARD'|'REPORT'|'SESSION';
type ActionCode = string; // from the catalogue in 15.3
interface AuthorizeInput { resource: ResourceCode; action: ActionCode;
  target?: { id?: string; ownerUserId?: string; stage?: string; attributes?: Record<string, unknown> } }
interface Decision { allowed: boolean; failedStep?: 1|2|3|4|5; reasonCode?: string;
  denyCode?: string; scopeCode?: ScopeCode }
interface ScopeResolver { resource: ResourceCode;
  resolve(ctx: AuthContext, target: AuthorizeInput['target'], scope: ScopeCode): Promise<{ inScope: boolean; exists: boolean }>;
  buildListFilter(ctx: AuthContext, scope: ScopeCode): Promise<ScopeFilter>; }
interface StagePolicy { resource: ResourceCode;
  isActionAllowed(role: Role, action: ActionCode, stage: string, ctx: AuthContext): { allowed: boolean; denyCode?: string } }
```
`AuthorizationService.authorize(ctx, input): Promise<Decision>` and `assertAuthorized(ctx, input)` (throws `ForbiddenError` + audit). Resolvers are registered at module start-up by SPEC-003/004/006+ via `ScopeResolverRegistry.register(resolver)`.

### 11.7 Seeder `default-super-admin`
Env: `SEED_SUPER_ADMIN_USER_ID` (matches ID pattern), `SEED_SUPER_ADMIN_TEMP_PASSWORD` (must pass `PasswordPolicy`), optional `SEED_SUPER_ADMIN_EMAIL` (stored by SPEC-004 profile seed, outside this spec). Behaviour: no-op if any `SUPER_ADMIN` row exists; otherwise creates the user `PENDING_ACTIVATION`, `must_change_password=true`; **fails** (non-zero exit) if env missing or weak; in `NODE_ENV=production` refuses a password equal to a documented sample value; writes audit `AUTH_SUPER_ADMIN_SEEDED` (actor `SYSTEM`); never prints the password; runbook note: operator deletes the env secret after first run. Default User ID value and delivery of the initial password `[TDD-REQUIRED]` TDD-002.02.

### 11.8 Logging
All auth modules use the shared logger with `module: 'identity-access'` and request id; log events `auth.login.failed` (reason code only), `auth.session.expired`, `authz.denied` (role, resource, action, failedStep — no payload). Errors never log request bodies.

## 12. API Requirements

Base `/api/v1`; envelope per SPEC-001. All endpoints `[PROPOSED]` (paths), semantics `[BRD]` where cited.

### 12.1 `POST /api/v1/auth/login`
| Item | Value |
|---|---|
| Purpose | Authenticate with User ID + password |
| Auth | Public |
| Authz | None (rate: per-account lock only; IP throttling `[TDD-REQUIRED]` TDD-002.18) |
| Request | `{ "userId": "EMP000123", "password": "…" }` |
| Validation | both required strings; `password` 1–128 chars at this endpoint (policy not applied to login so legacy/temp values are not leaked by error text); `userId` trimmed |
| Response 200 | `{ "success": true, "data": { "accessToken": "<jwt>", "expiresAt": "…", "idleTimeoutSeconds": 1800, "mustChangePassword": false, "user": { "userId": "EMP000123", "role": "EMPLOYEE", "status": "ACTIVE" } } }` (when `mustChangePassword` is true the token is restricted-scope) |
| Errors | `400 VALIDATION_ERROR`; `401 INVALID_CREDENTIALS` (unknown, wrong, inactive, malformed ID); `403 ACCOUNT_LOCKED` ("Your account is temporarily locked. Try again later or contact an administrator.") |
| Notes | Response never includes hash, counter or lock timestamps (TDD-002.10 on disclosing remaining lock time) |

### 12.2 `POST /api/v1/auth/change-password`
| Item | Value |
|---|---|
| Auth | Bearer, scope `FULL` or `PASSWORD_CHANGE` |
| Authz | `SESSION` / `CHANGE_PASSWORD` own |
| Request | `{ "currentPassword": "…", "newPassword": "…" }` |
| Validation | `newPassword` passes policy and ≠ `currentPassword`; ≤ 72 bytes |
| Response 200 | `{ "data": { "accessToken": "<new full-scope jwt>", "expiresAt": "…", "mustChangePassword": false, "user": {…, "status": "ACTIVE"} } }` |
| Errors | `400 VALIDATION_ERROR` (details list violated rules, no password echo); `400 CURRENT_PASSWORD_INCORRECT` (counts toward lock, FR-002.24); `400 NEW_PASSWORD_SAME_AS_CURRENT`; `401` auth codes; `403 ACCOUNT_LOCKED` when this attempt triggers lock |
| Effects | FR-002.18; all other sessions revoked; audit `AUTH_FIRST_LOGIN_PASSWORD_CHANGED` / `AUTH_PASSWORD_CHANGED` |

### 12.3 `POST /api/v1/auth/logout`
Auth: bearer (any scope). Revokes current session (`LOGOUT`). `204`. Idempotent for already-revoked tokens returns `401`.

### 12.4 `GET /api/v1/auth/me`
Auth: bearer (any scope; restricted scope returns only `{userId, role, status, mustChangePassword}`). Full scope response adds `permissions: [{ resource, action, scope }]` (UX gating only), `idleTimeoutSeconds`, `sessionExpiresAt`. Marked `passive` (does not extend session) `[PROPOSED]`.

### 12.5 `POST /api/v1/auth/session/keepalive`
Auth: bearer (full). Non-passive; extends `last_activity_at`; used by the frontend when the user is active but made no API call. `204`. Restricted scope: `403 PASSWORD_CHANGE_REQUIRED`.

### 12.6 `POST /api/v1/auth/admin/users/{userId}/unlock`
| Item | Value |
|---|---|
| Auth | Bearer, full scope |
| Authz | `USER_ACCOUNT` / `UNLOCK`, role `SUPER_ADMIN` only, scope `ALL` |
| Path | `userId` = public User ID (e.g. `EMP000123`) |
| Request | `{ "remarks": "optional text ≤ 500" }` |
| Response 200 | `{ "data": { "userId": "EMP000123", "status": "ACTIVE" } }` |
| Errors | `401`; `403 FORBIDDEN`; `404 NOT_FOUND`; `409 ACCOUNT_NOT_LOCKED` |
| Effects | FR-002.26; audit `AUTH_ACCOUNT_UNLOCKED` (actor, target, previous/new status, remarks) |

### 12.7 Endpoints owned by SPEC-004 that call this spec's services (listed for traceability; not defined here)
Reset password, deactivate, activate, change role, create user → call `AccountSecurityService` (`resetPasswordTo`, `deactivate`, `activate`, `changeRole`, `createCredentials`).

### 12.8 Authorization on endpoints of other specs
Every endpoint in SPEC-003…SPEC-014 declares `defineRoute({ permission: {resource, action, targetLoader?} })`; their specs state the registry row they use.

### 12.9 Error code catalogue (this spec) `[PROPOSED]` unless BRD-stated
| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Malformed body; password policy violations (details only) |
| 400 | `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT` | change-password |
| 401 | `AUTHENTICATION_REQUIRED` | No bearer token `[BRD]` 401 |
| 401 | `TOKEN_INVALID` | Bad signature/format/algorithm/issuer |
| 401 | `SESSION_EXPIRED` | Idle (30 min) or absolute expiry |
| 401 | `SESSION_REVOKED` | Logout, reset, deactivation, lock, role change, tv mismatch |
| 401 | `INVALID_CREDENTIALS` | Login failure (generic) |
| 401 | `ACCOUNT_INACTIVE`, `ACCOUNT_LOCKED` | Token still presented for deactivated/locked user (guard) |
| 403 | `ACCOUNT_LOCKED` | Login while locked / attempt triggering lock |
| 403 | `PASSWORD_CHANGE_REQUIRED` | Restricted-scope or must-change user calling any other route |
| 403 | `FORBIDDEN` | Failed authorization steps 2–5 (generic message "You do not have permission to perform this action.") `[BRD]` 403 |
| 403 | `INVALID_WORKFLOW_TRANSITION` | Supplied by SPEC-007 via `StagePolicy.denyCode` `[BRD]` |
| 404 | `NOT_FOUND` | Unknown route; unknown ID for Super Admin |
| 409 | `ACCOUNT_NOT_LOCKED` | Unlock of an unlocked account |

## 13. Frontend Implementation

Paths under `frontend/src/` (Next.js App Router). Replaces/extends scaffold files.

| Path | Purpose |
|---|---|
| `app/(auth)/login/page.tsx` | Login (User ID + password). Rewrites e-mail field; shows generic error; shows lock message for `ACCOUNT_LOCKED`; reads `?reason=session_expired` banner |
| `app/(auth)/change-password/page.tsx` | Forced first-login change (also post-reset); current, new, confirm; policy checklist; on success stores new token and routes to dashboard |
| `app/(auth)/forgot-password/page.tsx`, `reset-password/page.tsx` | Replaced by static "Password reset is performed by your administrator" notice (FR-002.74) or removed pending TDD-002.13 |
| `app/(protected)/layout.tsx` | Client guard: no token → `/login`; `mustChangePassword` → `/change-password`; wraps `IdleSessionProvider` |
| `app/(protected)/no-access/page.tsx` + `components/auth/NoAccess.tsx` | Neutral no-access state (BRD-002) — no resource details |
| `components/auth/IdleSessionProvider.tsx` | Tracks user input (click, key, scroll, pointer; throttled), calls `POST /auth/session/keepalive` at most once per 5 min while active `[PROPOSED]`, shows warning modal before expiry, logs out locally at expiry |
| `components/auth/Can.tsx`, `hooks/usePermission.ts` | `usePermission(resource, action)` reads `permissions` from `/auth/me`; UX only |
| `services/auth.service.ts` | `login({userId,password})`, `changePassword`, `logout`, `me`, `keepalive`; removes `forgotPassword`, `resetPassword` |
| `services/http-client.ts` | Token from `tokenStore`; interceptor: `401` → clear store, redirect `/login?reason=session_expired` (skip for `/auth/login`); `403 PASSWORD_CHANGE_REQUIRED` → `/change-password`; `403 FORBIDDEN` → surface error to caller (toast) |
| `utils/tokenStore.ts` | sessionStorage wrapper wrapped in try/catch, never logs |
| `redux/slices/authSlice.ts`, `userSlice.ts` | Hold `user, role, status, mustChangePassword, permissions` (not the token) |
| `utils/permissions.ts` | Superseded by `/auth/me` permissions (kept for role-only nav in `data/navigation.ts` until SPEC-003 shell) |

States to implement: loading, submitting, field errors, locked, generic failure, session-expired, forced-change, no-access, network error. Accessibility: labelled inputs, `aria-live` for errors, keyboard-operable modal (NFR-008). Tailwind per SPEC-001 UI kit.

## 14. Validation Rules

| Field | Rule | Layer |
|---|---|---|
| `userId` | string, trimmed, upper-cased, `^[A-Z]{2,4}[0-9]{6}$` | BE (login: mismatch ⇒ 401 generic) / FE (inline) |
| `password` (login) | non-empty string ≤ 128 | BE/FE |
| `newPassword` | ≥ 8; ≥ 1 `[A-Z]`; ≥ 1 `[a-z]`; ≥ 1 `[0-9]`; ≥ 1 `[^A-Za-z0-9\s]` printable; ≤ 72 UTF-8 bytes; ≠ currentPassword | BE authoritative, FE UX |
| `currentPassword` | non-empty string ≤ 128 | BE/FE |
| `remarks` (unlock) | optional string ≤ 500, trimmed | BE |
| Bearer token | `Bearer <jwt>`, ≤ 4096 chars | BE |
| Path `userId` | same pattern as `userId` | BE |

Validation errors return `400 VALIDATION_ERROR` with `details: [{ field, rule }]` and never echo the submitted password.

## 15. Authorization & Security Rules

### 15.1 Layers
Backend/API authoritative; frontend gating is UX only `[BRD-026]`. Every protected route passes `authenticate → passwordChangeGuard → requirePermission`.

### 15.2 Security controls summary

| Control | Rule |
|---|---|
| JWT | HS256 only (algorithm pinned, `none` rejected), secret from `JWT_SECRET` (≥ 32 chars), issuer check, claims `sub,sid,tv,scp,iat,exp,iss`; no PII in claims |
| Credentials | bcryptjs hash, cost ≥ 10, constant-time compare via library, dummy compare for unknown IDs |
| Brute force | Per-account lock (BRD); IP throttling open (TDD-002.18) |
| Enumeration | Generic `INVALID_CREDENTIALS`; generic `FORBIDDEN`; uniform 403 for non-Super-Admin |
| Transport | TLS arrangement is an open item owned by SPEC-015 (`[TDD-REQUIRED]` TLS for local deployment); tokens only in `Authorization` header, never in URLs |
| CORS / headers | `helmet` retained; CORS restricted to the configured frontend origin from env (scaffold currently open) `[PROPOSED]` |
| Secrets | `JWT_SECRET`, seeder password only via env; never committed |
| Logging | FR-002.60–.62 |
| Privilege escalation | A user cannot change own role or status; account/role actions are Super Admin only (matrix) |

### 15.3 Resource and action catalogue `[PROPOSED]`

Resources: `USER_ACCOUNT, EMPLOYEE_PROFILE, MASTER_DATA, VACANCY, TRANSFER_REQUEST, APPROVAL_TASK, PAYROLL_TASK, IT_TASK, DOCUMENT, AUDIT_LOG, NOTIFICATION, WORKFLOW_CONFIGURATION, ESCALATION_SETTINGS, DASHBOARD, REPORT, SESSION`.

Actions (BRD-026 step 5 list mapped to codes): `VIEW, LIST, CREATE, UPDATE` (View/Create/Update); `SUBMIT, APPROVE, REJECT, REQUEST_CLARIFICATION, RESPOND_CLARIFICATION, WITHDRAW` (workflow); `UPLOAD, DOWNLOAD` (documents); `REASSIGN`; `COMPLETE_TASK` (Payroll/IT task), `IT_FINAL_APPROVE`; and the BRD-027 administrative actions `BLOCK, RESUME, CANCEL, RELEASE_RESERVATION`; plus account actions `ACTIVATE, DEACTIVATE, RESET_CREDENTIAL, UNLOCK, ASSIGN_ROLE`; `EXPORT` (audit), `CONFIGURE` (workflow/escalation), `CHANGE_PASSWORD`. Workflow-engine action codes of the shared contract (`HR_VALIDATE_APPROVE, HR_CHANGE_ORG_DATA, COMPLETE_HR_PROCESSING, MARK_PAYROLL_COMPLETED, COMPLETE_IT_TASKS, NO_IT_ACTION_REQUIRED, IT_FINAL_APPROVE, BLOCK, RESUME, CANCEL, REASSIGN`) are registered by SPEC-007/008/009/010 as `TRANSFER_REQUEST` sub-actions and use the same registry mechanism; this spec's registry includes them as rows below.

### 15.4 Role × Resource × Action permission matrix (DRAFT — BRD-026: "defined at spec level, not assumed")

Legend: `A` = all scope · `O` = own · `H` = assigned employees/reporting hierarchy · `T` = assigned task/request (pending owner) · `L` = location/organisation scope (HR/IT mapping) · `Q` = target-team scope · `–` = denied · `?` = **`[TDD-REQUIRED]`, denied until decided** · `@stage` = additionally requires stage permission via `StagePolicy`. Basis column cites BRD text; `DERIVED` rows follow from the cited text.

| Resource | Action | SUPER_ADMIN | EMPLOYEE | REPORTING_MANAGER | RECEIVING_MANAGER | HR | IT | Basis |
|---|---|---|---|---|---|---|---|---|
| SESSION | CHANGE_PASSWORD / logout / me | O | O | O | O | O | O | BRD-006, DERIVED |
| USER_ACCOUNT | CREATE, UPDATE, ACTIVATE, DEACTIVATE, RESET_CREDENTIAL, UNLOCK, ASSIGN_ROLE | A | – | – | – | – | – | BRD-004, 007, 010, 025 |
| USER_ACCOUNT | VIEW / LIST (account status) | A | O (self via /me) | – | – | ? | – | BRD-010; HR visibility of account status for locations `?` |
| EMPLOYEE_PROFILE | VIEW | A | O | H | ? Q | L | ? T (minimum fields TDD-002.16) | BRD-011, 012, 013, 014 |
| EMPLOYEE_PROFILE | CREATE / UPDATE (master) | A | – | – | – | – | – | BRD-010, 029 field ownership |
| EMPLOYEE_PROFILE | UPDATE employment status | A | – | – | – | L (?) | – | BRD-029 "Super Admin / HR"; scope detail `?` |
| MASTER_DATA | CREATE / UPDATE / ACTIVATE / DEACTIVATE | A | – | – | – | – | – | BRD-010 |
| MASTER_DATA | LIST active (lookups for forms) | A | A | A | A | A | A | DERIVED BRD-029 "from portal master data" |
| VACANCY | CREATE / UPDATE / close / hold | A | – | – | – | – | – | BRD-010 |
| VACANCY | LIST / VIEW | A | ? (visibility rules TDD-j) | – | ? | L | – | BRD-011 "subject to visibility rules", BRD-013 |
| VACANCY | RELEASE_RESERVATION | A | – | – | – | L | – | BRD-028(c) (OQ-15) |
| TRANSFER_REQUEST | CREATE / UPDATE (Draft) / SUBMIT | – | O @Draft | – | – | – | – | BRD-011, 027, 032 |
| TRANSFER_REQUEST | WITHDRAW | – | O @PENDING_REPORTING_MANAGER_APPROVAL, PENDING_RECEIVING_MANAGER_APPROVAL, INFO_REQUIRED, PENDING_HR_REVIEW | – | – | – | – | BRD-027 withdraw rows |
| TRANSFER_REQUEST | VIEW / LIST | A | O | H | Q (routed) ? | L | T (minimum fields) | BRD-001 actors table; BRD-011–014 |
| TRANSFER_REQUEST | APPROVE / REJECT / REQUEST_CLARIFICATION | – | – | T @PENDING_REPORTING_MANAGER_APPROVAL | T @PENDING_RECEIVING_MANAGER_APPROVAL, PENDING_RECEIVING_MANAGER_REAPPROVAL (clarify at re-approval: DERIVED BRD-024) | L,T @PENDING_HR_REVIEW (HR_VALIDATE_APPROVE) | – | BRD-027 matrix, BRD-012, 013 |
| TRANSFER_REQUEST | RESPOND_CLARIFICATION | – | O @INFO_REQUIRED (responsible-user rule TDD-k) | – | – | – | – | BRD-027, 034 |
| TRANSFER_REQUEST | HR_CHANGE_ORG_DATA, change Effective Date | A (intervention) | O @Draft (date only) | – | – | L @HR stages | – | BRD-020, 024, 031, 032 |
| TRANSFER_REQUEST | COMPLETE_HR_PROCESSING | – | – | – | – | L @HR_PROCESSING | – | BRD-027 |
| PAYROLL_TASK | MARK_PAYROLL_COMPLETED | – | – | – | – | L (authorised HR) @PAYROLL_PROCESSING | – | BRD-027(c) |
| PAYROLL_TASK | VIEW | A | – | – | – | L | – | BRD-013 "monitor downstream" |
| IT_TASK | COMPLETE_TASK / NO_IT_ACTION_REQUIRED / IT_FINAL_APPROVE | – | – | – | – | – | T/L @PENDING_IT_ACTION, PENDING_IT_FINAL_APPROVAL | BRD-014, 027 |
| IT_TASK | VIEW | A | – | – | – | L (monitor) | T/L | BRD-013, 014 |
| TRANSFER_REQUEST | BLOCK / RESUME | A (any non-final) | – | – | – | L @PENDING_HR_REVIEW, HR_PROCESSING, PAYROLL_PROCESSING (resume only HR-origin blocks) | L @PENDING_IT_ACTION, PENDING_IT_FINAL_APPROVAL (resume only IT-origin blocks) | BRD-027, OQ-18 |
| TRANSFER_REQUEST | CANCEL | A (any active, any Blocked) | – | – | – | L @HR stages and HR-origin Blocked | – | BRD-027, OQ-18 |
| TRANSFER_REQUEST / APPROVAL_TASK / IT_TASK | REASSIGN | A | – | – | – | – | – | BRD-035 |
| DOCUMENT | UPLOAD | ? | ? (TDD) | – | – | L | ? (completion evidence TDD-h) | BRD-021 (HR); others `?` |
| DOCUMENT | VIEW / DOWNLOAD | A | ? (own transfer docs) | ? | ? | L | ? scoped | BRD-021 "role and org scope"; NFR-007 |
| AUDIT_LOG | VIEW / LIST | A | ? | ? | ? | ? (within role & scope) | ? | BRD-037 (non-SA roles "within scope"; per-role detail in SPEC-013) |
| AUDIT_LOG | EXPORT | A | – | – | – | – | – | BRD-037 |
| NOTIFICATION | LIST / mark read | O | O | O | O | O | O | DERIVED BRD-036 in-app |
| WORKFLOW_CONFIGURATION | VIEW / CONFIGURE | A | – | – | – | – | – | BRD-012, 031 |
| ESCALATION_SETTINGS | CONFIGURE | A (role `?` per BRD-023 "company policy") | – | – | – | – | – | BRD-023 |
| DASHBOARD / REPORT | VIEW | A (org-wide) | O | H | Q ? | L | T ? | BRD-023 "restricted per policy" — exact content `?` (SPEC-014) |

The registry encodes `?` as **deny**; every later decision flips a registry row and its test. Super Admin `A` does not bypass stage rules defined by the workflow matrix (e.g. Super Admin still cannot skip IT Final Approval): `A` means scope, the stage policy still applies `[BRD-027]`.

### 15.5 Information-leak rules

- 401 bodies: code + generic message only.
- 403 bodies: `FORBIDDEN` / `PASSWORD_CHANGE_REQUIRED` / `INVALID_WORKFLOW_TRANSITION` with fixed messages; no resource data, role lists, scope names or owner names.
- Non-Super-Admin lookups by ID: identical 403 whether the ID is absent or out of scope; identical response time class (no early return before the scope query) `[TDD-REQUIRED]` TDD-002.11.
- List endpoints return only in-scope rows; counts and pagination totals are computed on the filtered set.
- Validation errors never echo secrets.

## 16. Workflow / State Transition Rules

### 16.1 Account status transitions

| From | Event | To | Side effects |
|---|---|---|---|
| (none) | User created (SPEC-004 / seeder) | `PENDING_ACTIVATION` | `must_change_password=true`, `token_version=1`, audit by creator |
| `PENDING_ACTIVATION` | First-login password change completed | `ACTIVE` | `password_changed_at`, sessions superseded |
| `PENDING_ACTIVATION` / `ACTIVE` | 5th consecutive failure | `LOCKED` | `status_before_lock`, `locked_until=now+30m`, `token_version+1`, sessions revoked (`LOCKED`) |
| `LOCKED` | `locked_until` reached (next login/lazy) | `status_before_lock` | counter 0, audit `AUTH_ACCOUNT_LOCK_EXPIRED` |
| `LOCKED` | Super Admin unlock / recovery CLI | `status_before_lock` | counter 0, audit `AUTH_ACCOUNT_UNLOCKED` |
| any non-`INACTIVE` | Deactivate | `INACTIVE` | `token_version+1`, sessions revoked, lock fields cleared, `deactivated_at` |
| `INACTIVE` | Activate | `ACTIVE` if `password_changed_at IS NOT NULL` else `PENDING_ACTIVATION` | `deactivated_at=null`; reactivation-needs-reset rule `[TDD-REQUIRED]` TDD-002.14b |
| `ACTIVE` | Admin reset | `ACTIVE` (status unchanged) | `must_change_password=true`, `token_version+1`, sessions revoked; if `LOCKED` at reset time → also unlocked `[TDD-REQUIRED]` TDD-002.08 |
| `PENDING_ACTIVATION` | Admin reset | `PENDING_ACTIVATION` | as above |
| `INACTIVE` | Reset | refused `409 ACCOUNT_INACTIVE` | — |

`getEffectiveStatus(user, now)` returns `status_before_lock` for a `LOCKED` row whose `locked_until <= now`, so user lists (SPEC-004) show the correct state without waiting for a login.

### 16.2 Authorization-stage rule
Step 5 asks `StagePolicy` whether `(role, action, stage)` is allowed. SPEC-007 owns the transition registry and registers the policy for `TRANSFER_REQUEST`; if a transfer action is invoked while no policy is registered, the action is denied (fail-closed) `[PROPOSED]`.

## 17. Transaction & Concurrency Rules

| Scenario | Rule |
|---|---|
| Failed-login counter | `SELECT … FOR UPDATE` on the user row then `UPDATE failed_attempts = failed_attempts + 1`; lock decided inside the same transaction; two parallel wrong passwords at 4 failures produce exactly one lock and ≥ 5 counted failures, never skipping the lock |
| Password verification | Performed **outside** the row lock; outcome re-validated under the lock against `password_hash` and `token_version` read earlier (optimistic check) |
| Login vs reset/deactivate | Session creation happens under the user row lock and reads current `token_version`; reset/deactivate takes the same lock; any session issued before commit of the reset is revoked by `token_version+1` |
| Reset / deactivate / lock / role change | Update user row, bump `token_version`, revoke sessions and write audit in **one** `withTransaction`; failure of any rolls back all |
| change-password | One transaction: verify current, update hash, flags, status, revoke sessions, create new session |
| Idle touch | Single `UPDATE … WHERE id=? AND revoked_at IS NULL`; concurrent requests are safe (idempotent monotonic update) |
| Unlock vs login | Unlock takes the row lock; whichever commits first determines outcome; no lost update on `failed_attempts` |
| Audit of failures | Failed-login transaction **commits** (counter + audit) while the HTTP response is an error; error classes must not trigger an outer rollback of the counter update |
| `AUTHZ_DENIED` audit | Written best-effort outside the business transaction (none exists for the denied request); audit-write failure is logged, access still denied |
| Seeder | Wrapped in transaction with advisory lock so concurrent runs create exactly one Super Admin |

## 18. Audit Requirements

Emitted via `AuditService.record(event, { trx })` (SPEC-001). Common envelope: actor (user/`SYSTEM`/null), actor role, action code, entity (`USER` + User ID), timestamp, previous/new values or status, remarks, requestId. **Never** contain password, hash, token, session id, Authorization header.

| Event code `[PROPOSED]` | Trigger | Fields captured | BRD |
|---|---|---|---|
| `AUTH_LOGIN_FAILED` | Any failed login (unknown, bad password, locked, inactive, invalid format) | attempted User ID (only if pattern-valid, else `[INVALID_FORMAT]`), reason code, attempt number (if known), request IP | BRD-037 security events |
| `AUTH_ACCOUNT_LOCKED` | 5th consecutive failure | target user, failed count, `locked_until`, previous status | BRD-025, 037 |
| `AUTH_ACCOUNT_LOCK_EXPIRED` | Lazy lock expiry | target user, previous/new status | `[PROPOSED]` |
| `AUTH_ACCOUNT_UNLOCKED` | Super Admin unlock / CLI | actor, target, previous/new status, remarks | BRD-008, 037 |
| `AUTH_FIRST_LOGIN_PASSWORD_CHANGED` | First successful change after creation or reset | target user, sessions revoked count | BRD-008 |
| `AUTH_PASSWORD_CHANGED` | Voluntary change (if allowed) | target user | `[PROPOSED]` TDD-002.12 |
| `AUTH_PASSWORD_RESET` | Administrator reset (via service) | actor, target, sessions revoked count, remarks (no password) | BRD-008, 037 |
| `AUTH_ACCOUNT_DEACTIVATED` / `AUTH_ACCOUNT_ACTIVATED` | Service call from SPEC-004 | actor, target, previous/new status, reason | BRD-008 |
| `AUTH_SESSIONS_REVOKED` | Any bulk invalidation | target, reason code, count | `[PROPOSED]` |
| `AUTH_ROLE_CHANGED` | Role change via service | actor, target, previous/new role | BRD-037 role/permission change |
| `AUTH_SUPER_ADMIN_SEEDED` | Seeder | `SYSTEM`, User ID | `[DERIVED]` |
| `AUTHZ_DENIED` | Any authorization denial (steps 2–5) | actor, role, resource, action, target id (if provided), failed step, request path/method | BRD-026, 037 |
| `AUTH_SESSION_EXPIRED` | Idle/absolute expiry detected | user, session, reason | `[PROPOSED]` (low priority, can be log-only per TDD-002.20) |

Authentication failures with missing/invalid token (no identity) are logged (structured logger) but not written to `audit_logs` to avoid unauthenticated audit flooding `[PROPOSED]`. Successful logins are not audited as business events (only first-login change per BRD-008) `[TDD-REQUIRED]` TDD-002.20.

## 19. Notification Requirements

| Event | Recipient | Channel | Trigger task | BRD |
|---|---|---|---|---|
| (none emitted by SPEC-002) | — | — | — | — |

SPEC-002 emits **no** notifications. The BRD-036 events "user account created" and "credential / password reset" (Email only) are enqueued by SPEC-004 through `NotificationService.enqueue`; SPEC-004 must pass the plaintext temporary password **only** to the mail template transiently, never into the outbox payload log fields or audit. Lock/unlock e-mails are not required by the BRD and are not added.

## 20. Error & Edge Cases

| Case | Behaviour |
|---|---|
| Wrong password for deactivated user | `401 INVALID_CREDENTIALS`, no counter change |
| Correct password for locked user | `403 ACCOUNT_LOCKED`, no session |
| Lock expires while a stale token exists | Token already revoked at lock time (`SESSION_REVOKED`); user logs in again |
| Failed login at exact `locked_until` instant | Treated as expired (`<=`), counter restarts at 1 |
| Token with valid signature but user deleted/never existed | `401 SESSION_REVOKED` (no user row ⇒ no session) |
| Clock skew / `now()` | All time comparisons use the database clock (`now()`) in the authenticate query, not app-server time |
| Two logins, one browser | Both allowed (TDD-002.19); both revoked together by reset/deactivate |
| Reset while user is mid-request | In-flight request that already passed `authenticate` completes; the next request fails 401 |
| Password with Unicode / emoji | ASCII class rules; bytes ≤ 72; non-ASCII allowed only if rules still met; reject over-length |
| Whitespace-only/empty password | `400 VALIDATION_ERROR` |
| JWT `alg: none` or different alg | `401 TOKEN_INVALID` |
| Restricted token calls `/auth/me` | Allowed, limited fields |
| User changes password to temp password | `400 NEW_PASSWORD_SAME_AS_CURRENT` |
| Last Super Admin deactivation | `409 LAST_SUPER_ADMIN` `[PROPOSED]` |
| Only Super Admin gets locked | Lock auto-expires after 30 minutes; recovery CLI available (TASK-002.24) |
| Missing seeder env | Seeder aborts non-zero, no partial data |
| Missing resolver for a resource | Deny + `ERROR` log "no ScopeResolver registered" (programming defect surfaced by tests) |
| Audit service failure during lock | Whole lock transaction rolls back (fail closed) and returns `500`; counter not advanced |
| Frontend timer drift | Server is authoritative; any `401 SESSION_EXPIRED` wins |

## 21. Acceptance Criteria

| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-002.AC01 | Given no public signup, When any unauthenticated client calls a non-public route or a registration path, Then it receives 401/404 and no account is created | BRD-004 (DERIVED) |
| SPEC-002.AC02 | Given an empty database and seeder env set, When the seeder runs twice, Then exactly one `SUPER_ADMIN` in `PENDING_ACTIVATION` with `must_change_password=true` exists and no password appears in logs/audit | DERIVED BRD-004/010 |
| SPEC-002.AC03 | Given a valid User ID and password for an Active user, When `POST /auth/login`, Then 200 with a full-scope token, `mustChangePassword=false`, role and status | BRD-001 |
| SPEC-002.AC04 | Given a policy-compliant temporary password from SPEC-004's generator (property test over N samples), When validated, Then `PasswordPolicy` accepts all | BRD-004, 025 |
| SPEC-002.AC05 | Given a Pending Activation user with temp password, When they log in, Then 200 with restricted scope and `mustChangePassword=true` | BRD-006, 025 |
| SPEC-002.AC06 | Given a restricted-scope session, When calling any protected route other than change-password/logout/me (via UI or direct API), Then 403 `PASSWORD_CHANGE_REQUIRED` and no business data | BRD-006 |
| SPEC-002.AC07 | Given a temporary password issued long ago (e.g. clock advanced 90 days), When the user first logs in, Then login succeeds (no time expiry) | BRD-025 |
| SPEC-002.AC08 | Given a valid current temp password and a compliant new password, When `change-password`, Then hash replaced, status `ACTIVE`, flag cleared, all prior sessions revoked, a full-scope token returned, event `AUTH_FIRST_LOGIN_PASSWORD_CHANGED` audited with no password | BRD-006, 007, 008 |
| SPEC-002.AC09 | Given new passwords missing one rule each (length 7, no upper, no lower, no digit, no special), When submitted, Then each is rejected with the violated rule and no state change | BRD-025 |
| SPEC-002.AC10 | Given a password exactly 8 chars meeting all rules, When submitted, Then accepted | BRD-025 |
| SPEC-002.AC11 | Given any stored user, When inspecting `users` and logs, Then only a bcrypt hash exists; no plaintext anywhere | BRD-006, NFR-003 |
| SPEC-002.AC12 | Given a user with 4 consecutive failures, When a 5th wrong password is submitted, Then status `LOCKED`, `locked_until = now+30m`, response `403 ACCOUNT_LOCKED`, `AUTH_ACCOUNT_LOCKED` audited | BRD-025 |
| SPEC-002.AC13 | Given 4 failures then 1 success, When wrong passwords follow, Then the count restarts from 0 (consecutive rule) | BRD-025 DERIVED |
| SPEC-002.AC14 | Given a locked account, When the correct password is submitted within 30 minutes, Then `403 ACCOUNT_LOCKED`, no token, `locked_until` unchanged | BRD-025 |
| SPEC-002.AC15 | Given a locked account and clock ≥ `locked_until`, When the user logs in correctly, Then success and counter 0 | BRD-025 |
| SPEC-002.AC16 | Given a locked account, When Super Admin calls unlock, Then status returns to previous, counter 0, event audited; user can log in immediately | BRD-025 |
| SPEC-002.AC17 | Given a locked account whose session token was issued before lock, When it is used, Then 401 | BRD-025 |
| SPEC-002.AC18 | Given a non-Super-Admin caller, When calling unlock, Then 403 and `AUTHZ_DENIED` audited | BRD-026 |
| SPEC-002.AC19 | Given an active session idle for 29 min 59 s, When a request is made, Then it succeeds and the idle window restarts | BRD-025 |
| SPEC-002.AC20 | Given a session idle ≥ 30 min, When any protected request is made, Then `401 SESSION_EXPIRED` | BRD-025 |
| SPEC-002.AC21 | Given an administrator reset of user U, When the service completes, Then all U's sessions are revoked, the old password fails, the new temp password works only for restricted-scope login, event `AUTH_PASSWORD_RESET` audited | BRD-025, 039 |
| SPEC-002.AC22 | Given deactivation of user U with 2 live sessions, When either token is used or U logs in, Then 401; status `INACTIVE`; `AUTH_ACCOUNT_DEACTIVATED` audited | BRD-025 |
| SPEC-002.AC23 | Given a passive route (`/auth/me`) called repeatedly for 31 minutes, When the next active call occurs, Then the session has already expired (passive does not extend) | BRD-025 `[PROPOSED]` |
| SPEC-002.AC24 | Given role change of U, When U's old token is used, Then 401 and new login yields the new permissions | DERIVED BRD-026 |
| SPEC-002.AC25 | Given no/invalid/expired token, When any protected endpoint is called, Then 401 with generic body | BRD-026 |
| SPEC-002.AC26 | Given an authenticated EMPLOYEE, When calling a Super-Admin-only endpoint, Then 403 `FORBIDDEN`, generic body, `AUTHZ_DENIED` audited with failed step 2 | BRD-026 |
| SPEC-002.AC27 | Given a resolver reports the resource out of the caller's scope, When the endpoint is called directly (Postman-style), Then 403 and no data in body | BRD-026 |
| SPEC-002.AC28 | Given an action not permitted at the target's current stage (stub `StagePolicy`), When called, Then 403 with the policy's `denyCode` and no state change | BRD-026, 027 |
| SPEC-002.AC29 | Given the HR example chain (authenticated → HR role → transfer in HR's location → HR may access → action allowed at stage), When each link is removed one at a time, Then each variant is rejected at the corresponding step | BRD-026 |
| SPEC-002.AC30 | Given a full test run with log capture, When searching logs/audit for the test passwords, tokens and hashes, Then zero matches | BRD-025, 037, NFR-003 |
| SPEC-002.AC31 | Given login failures, lock, unlock, reset and denial, When querying audit, Then each event exists with actor, role, action, entity, previous/new status | BRD-037 |
| SPEC-002.AC32 | Given a route registered without a declaration, When the application starts or the coverage test runs, Then it fails | BRD-026 `[PROPOSED]` |
| SPEC-002.AC33 | Given the Frontend, When the user logs in with a temp password, Then they land on change-password and cannot navigate elsewhere until done | BRD-006 |
| SPEC-002.AC34 | Given the Frontend, When the server returns `SESSION_EXPIRED`, Then the user is redirected to login with a session-expired message and no cached protected data is shown | BRD-025 |
| SPEC-002.AC35 | Given the Frontend, When the server returns `FORBIDDEN`, Then a no-access state is shown with no restricted data | BRD-002, 026 |

## 22. Negative Acceptance Criteria

| ID | Given / When / Then | BRD-039 row |
|---|---|---|
| SPEC-002.NAC01 | Given a restricted-scope token, When `GET /api/v1/<any business route>` is called, Then 403 `PASSWORD_CHANGE_REQUIRED`, never 200 | Security: bypass first-login change |
| SPEC-002.NAC02 | Given a token issued before an admin reset flagged `must_change_password=true`, When used, Then 401 (token_version) — never reaches business data | Security: bypass first-login change |
| SPEC-002.NAC03 | Given a valid full-scope Employee token, When it calls an HR/Super-Admin route directly, Then 403 | Security: direct API access |
| SPEC-002.NAC04 | Given a forged JWT (`alg:none`, wrong secret, edited `role` claim, edited `scp`), When used, Then 401 `TOKEN_INVALID`; role is never read from the token | Security: direct API access |
| SPEC-002.NAC05 | Given HR with location A mapping and a resource in location B (stub resolver), When requested, Then 403 and the body contains no location B data | Security: cross-scope access |
| SPEC-002.NAC06 | Given a list endpoint, When called by a scoped role, Then only in-scope rows and totals are returned | Security: cross-scope access |
| SPEC-002.NAC07 | Given Employee E1 and a transfer owned by E2 (stub resolver), When E1 requests it, Then 403 identical to the response for a non-existent ID | Security: Employee cannot access another's request |
| SPEC-002.NAC08 | Given IT without a document scope for an employee, When `DOCUMENT/DOWNLOAD` is authorized, Then denied | Security: IT documents |
| SPEC-002.NAC09 | Given a locked user, When logging in with the correct password, Then 403 and no token | Security: locked cannot log in |
| SPEC-002.NAC10 | Given a locked user with an old token, When calling a protected API, Then 401 | Security: locked |
| SPEC-002.NAC11 | Given a deactivated user, When logging in with the correct password, Then 401 `INVALID_CREDENTIALS` | Security: deactivated cannot log in |
| SPEC-002.NAC12 | Given a deactivated user with an old token, When calling any API, Then 401 | Security: deactivated |
| SPEC-002.NAC13 | Given an admin reset, When logging in with the old password, Then 401 and counter increments | Security: old password after reset |
| SPEC-002.NAC14 | Given an admin reset, When any pre-reset token is used, Then 401 | Security: old password/session after reset |
| SPEC-002.NAC15 | Given any route and any role, When the pipeline step order is violated (e.g. resolver says in scope but registry denies role), Then denied — no step can be skipped | Security: direct API access |
| SPEC-002.NAC16 | Given wrong password submitted 6+ times on a locked account, When the lock timer is inspected, Then `locked_until` is unchanged | BRD-025 |
| SPEC-002.NAC17 | Given `change-password` where newPassword equals currentPassword, Then 400 and no state change | BRD-006 DERIVED |
| SPEC-002.NAC18 | Given unknown User ID vs known User ID with wrong password, When compared, Then identical status, body and comparable timing class | Enumeration (PROPOSED) |
| SPEC-002.NAC19 | Given a request with a `Bearer` token in the query string, Then it is ignored (401) | Hygiene |
| SPEC-002.NAC20 | Given a user attempts to change own role/status or call unlock on self, Then 403 | Privilege escalation |
| SPEC-002.NAC21 | Given the last active Super Admin, When deactivation/role change is requested, Then 409 `LAST_SUPER_ADMIN` (if TDD-002.14 approved) | Safety |
| SPEC-002.NAC22 | Given a matrix cell marked `?`, When authorized, Then denied | BRD-026 "not assumed" |
| SPEC-002.NAC23 | Given a transfer action while no `StagePolicy` is registered, Then denied (fail-closed) | BRD-027 |
| SPEC-002.NAC24 | Given a User ID field containing a password-like string, When login fails, Then audit stores `[INVALID_FORMAT]` and logs contain no such string | NFR-003 |
| SPEC-002.NAC25 | Given the seeder with a weak/missing password env, Then it aborts and creates nothing | DERIVED |

## 23. Testing Requirements

Test locations: `tests/backend/identity-access/{unit,api,security,concurrency}/`, `tests/frontend/identity-access/`. TDD: RED first.

### 23.1 Unit
| TC | Subject |
|---|---|
| TC-002.01 | `PasswordPolicy`: boundary matrix (7/8 chars; each class missing; 72/73 bytes; unicode) |
| TC-002.02 | `PasswordService`: hash ≠ plaintext, verify true/false, cost from config, `needsRehash`, dummy compare timing class |
| TC-002.03 | `TokenService`: claims, pinned alg, expired, wrong issuer/secret, tampered payload |
| TC-002.04 | `SessionService`: idle boundary (29:59 / 30:00), absolute expiry, revoke, revoke-all, passive vs active touch |
| TC-002.05 | `AccountSecurityService` state machine: every row of 16.1 incl. refusals; counter reset rules |
| TC-002.06 | `AuthorizationService`: each of the 5 steps fails independently; step order; unknown resource/action → error; `?` cells deny |
| TC-002.07 | `ScopeResolverRegistry`: missing resolver → deny; `OwnScopeResolver`; `ALL` |
| TC-002.08 | `StagePolicy` hook: allow/deny/denyCode propagation, fail-closed |
| TC-002.09 | Permission registry snapshot test against 15.4 (any change requires spec update) |
| TC-002.10 | Audit event builders mask/omit secrets; `[INVALID_FORMAT]` rule |

### 23.2 Integration / API
| TC | Subject |
|---|---|
| TC-002.11 | Login success/fail/locked/inactive/unknown responses and audit rows |
| TC-002.12 | 5-failure lock with real DB, lock expiry via DB clock stub, unlock API, counter resets |
| TC-002.13 | change-password: first login, voluntary, wrong current (counter), same-as-current, policy errors, new token, sessions revoked |
| TC-002.14 | logout, me (restricted vs full), keepalive, passive behaviour |
| TC-002.15 | Reset/deactivate/role-change services via test harness: sessions revoked, old password fails |
| TC-002.16 | Middleware chain 401 codes: missing, malformed, tampered, expired, revoked, tv mismatch |
| TC-002.17 | Route-coverage test: all routes declared; public list equals `{health, login}` |
| TC-002.18 | Error envelope shape and generic 403 body across endpoints |
| TC-002.19 | Seeder idempotency, abort on bad env, audit `AUTH_SUPER_ADMIN_SEEDED` |

### 23.3 Security
| TC | Subject |
|---|---|
| TC-002.20 | BRD-039 security matrix: bypass first-login (UI path + direct API), locked, deactivated, old password after reset, direct API scope/role/resource/action bypass |
| TC-002.21 | Token forgery set (`alg:none`, role/scp edits, other secret) |
| TC-002.22 | Enumeration parity (status/body/timing class) |
| TC-002.23 | Log/audit secret scan: run auth flows, grep captured logs and `audit_logs` for passwords, tokens, hashes, sid |
| TC-002.24 | Uniform 403 for absent vs out-of-scope IDs (non-Super-Admin) |
| TC-002.25 | Authorization denial audit coverage (every deny path emits `AUTHZ_DENIED`) |
| TC-002.26 | CORS origin restriction and header checks |

### 23.4 Concurrency
| TC | Subject |
|---|---|
| TC-002.27 | 10 parallel wrong passwords at attempt 4 ⇒ exactly one lock, one `AUTH_ACCOUNT_LOCKED` |
| TC-002.28 | Login racing admin reset ⇒ no live session survives reset |
| TC-002.29 | Login racing deactivation ⇒ no live session survives |
| TC-002.30 | Parallel change-password calls ⇒ exactly one succeeds |
| TC-002.31 | Unlock racing wrong-password login ⇒ consistent final state, counter ≥ 0 |
| TC-002.32 | Concurrent seeder runs ⇒ one Super Admin |

### 23.5 Frontend
| TC | Subject |
|---|---|
| TC-002.33 | Login form validation, generic/lock messages, no password in URL |
| TC-002.34 | Forced change-password redirect; cannot navigate away; success path |
| TC-002.35 | Idle warning + expiry, keepalive throttle, 401 redirect with banner |
| TC-002.36 | 403 handling and no-access page; permission-gated menu (UX only) |
| TC-002.37 | tokenStore failure tolerance (storage disabled) |
| TC-002.38 | Self-service reset pages removed/replaced |

### 23.6 Workflow / Negative
| TC | Subject |
|---|---|
| TC-002.39 | Account status transition table 16.1 (every allowed/refused cell) |
| TC-002.40 | All NAC01–NAC25 executed (one assertion each) |
| TC-002.41 | Matrix conformance: for each row of 15.4 × role, assert decision (deny for `?`) |

## 24. Definition of Done

- All TASK-002.01–002.38 complete; tests TC-002.01–.41 pass (RED→GREEN evidenced).
- Migrations apply and roll back cleanly; models never expose `password_hash`.
- Route-coverage test green: no route without explicit declaration.
- Seeder, unlock API, recovery CLI documented in a short runbook note (inside the module README comment-free; ops notes in SPEC-015 hand-off).
- No secret, token, hash or session id found by TC-002.23.
- Permission registry matches section 15.4; every `?` cell is denied and listed in the TDD section.
- Frontend scaffold conflicts (email login, self-service reset, localStorage token) resolved.
- Security events of section 18 visible via `AuditService`; hand-off list delivered to SPEC-013.
- Gate 1 approval recorded; Gate 2 review of code scheduled with the Technical Lead.
- INT standards: async/await, try/catch around async work, structured logger, env secrets, validated input, no AI-generated comments.

---

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-002.01 | User ID prefixes for Receiving Manager and Super Admin (BRD-004 lists only EMP/MGR/HR/IT); how a Receiving Manager is created | `RCM######` and `SA######`; ID regex already generic `[A-Z]{2,4}[0-9]{6}`; creation path decided in SPEC-004 | Login validation, SPEC-004 generator, seeder default |
| TDD-002.02 | Default Super Admin bootstrap: seeder vs CLI vs install wizard; default User ID; how the initial password is delivered | Seeder from env (`SEED_SUPER_ADMIN_USER_ID`, `…_TEMP_PASSWORD`), first user `SA000001`, operator hands password out-of-band, forced first-login change | Seeder, runbook, FR-002.05 |
| TDD-002.03 | **JWT access+refresh vs server-side session store** and how 30-min idle timeout and server-side invalidation are realised | *Recommended:* signed JWT bearer with `sid`+`tv`, validated each request against `user_sessions` (idle, revoke) and `users.token_version` (bulk invalidation); **no refresh token**. Alternatives: (A) short-lived access JWT + rotating refresh token (stateless access, refresh table; invalidation delayed up to access TTL unless still checked per request → complexity with no gain since DB check already needed to meet "enforced on every request"); (B) opaque cookie session id (simplest, CSRF handling needed, less aligned with constitution's JWT selection). Chosen C keeps constitution (JWT) while meeting BRD-025 immediately | Whole auth module, FE interceptors, DB hit per request **[DECIDED 2026-10-07 — recommended design confirmed]** JWT access token carrying user and `session_id` (`sid`) plus `token_version` (`tv`); NO refresh token. Every protected request validates the JWT, the `user_sessions` row (active, within 30-minute idle timeout), the user/account status (Active, not Locked, not Deactivated) and `tv` against the user's current `token_version`. Password reset and deactivation invalidate all of the user's sessions; logout invalidates its `session_id`; expired/invalid/revoked sessions require re-login. Source: decision text supplied by the spec author; formal Gate 1 record pending. |
| TDD-002.04 | May one user hold more than one role? | No — one `role` per user in this phase (User ID prefix implies one role) | `users` schema, matrix, SPEC-004 |
| TDD-002.05 | What counts as "inactivity"; do background polls extend a session? | Activity = user-initiated API calls and frontend keepalive on real user input; `passive` routes do not extend | Session logic, FE |
| TDD-002.06 | Absolute maximum session lifetime (BRD silent) | 12 hours (`AUTH_ABSOLUTE_SESSION_HOURS`), configurable, set to a high value if business wants none | Session, JWT `exp` |
| TDD-002.07 | Exact definition of "special character" and Unicode handling | Any printable ASCII non-alphanumeric, non-whitespace; ASCII classes for upper/lower | Policy, FE checklist |
| TDD-002.08 | Counter reset and lock edge rules BRD does not state: reset on success (derived), on lock expiry, unlock, admin reset, password change; wrong attempts during lock; wrong current password in `change-password`; does admin reset unlock a locked account? | Reset to 0 on each of those events; no counting and no lock extension while locked; wrong current password counts; admin reset also unlocks | FR-002.22–.24, tests |
| TDD-002.09 | Does lock revoke existing sessions, or only block them while locked? | Revoke on lock (`token_version+1`) plus per-request status check | Uniform 401 behaviour |
| TDD-002.10 | Account-state disclosure at login (locked vs generic; remaining lock time; message for deactivated) | Locked → `403 ACCOUNT_LOCKED` generic message, no remaining time; deactivated → generic 401 | Enumeration risk vs UX |
| TDD-002.11 | 403 vs 404 for ID-addressed resources outside scope | Uniform 403 for non-Super-Admin; Super Admin 404 for missing | All feature specs' error tests |
| TDD-002.12 | Voluntary password change after first login (BRD mandates only first-login and admin-reset flows) | Support via same endpoint with current password | Scope creep vs usability |
| TDD-002.13 | Self-service forgot/reset password | Not provided; scaffold pages replaced with notice | Frontend scaffold, support load |
| TDD-002.14 | Last-Super-Admin protection; `14b` does reactivating a deactivated user require a new temporary password? | Protect last active Super Admin; reactivation does not auto-reset (SPEC-004 may offer reset) | Account safety |
| TDD-002.15 | Receiving Manager ↔ target department/team scope and "incoming transfer" routing | Defer to SPEC-003/004; until decided `Q` scope resolver denies; matrix cells `?` | RCM views, approvals |
| TDD-002.16 | "Minimum employee information" for IT tasks: exact field list | Name, employee ID, new/old location, effective date, task details — to be confirmed by business | IT DTOs, SPEC-009 |
| TDD-002.17 | Client token storage (BRD silent): sessionStorage vs in-memory vs httpOnly cookie | sessionStorage behind `tokenStore`; XSS mitigated by CSP/header review in SPEC-015 | FE security posture |
| TDD-002.18 | IP-level throttling / CAPTCHA beyond per-account lock (distributed guessing, lock-out denial-of-service on known IDs) | Not added in this phase; evaluate in SPEC-015 hardening | Availability vs security |
| TDD-002.19 | Concurrent sessions per user (BRD silent) | Allowed, all revoked on reset/deactivate/lock/role change | Session model |
| TDD-002.20 | Whether successful logins and session expiries are audited (BRD requires failures only) | Failures audited; successes/expiry logged via logger only; BRD-008 first-login change is audited | Audit volume |
| TDD-002.21 | Authorisation-denial audit throttling to prevent audit flood | Audit every denial initially; add rate-limited aggregation if volume warrants (SPEC-013/015) | Audit growth |
| TDD-002.22 | Role definitions for `?` matrix cells (see 15.4): HR vacancy/account visibility, document view for Employee/RM/RCM/IT, audit view per role, dashboard content, Receiving Manager vacancy/profile access, escalation configuration role | Deny until each owning spec's Gate 1 decides; log decisions in this table | Feature-spec dependencies |

---

## Out of Scope (this SPEC)

Nothing in this spec introduces any BRD "Out of Scope" item. Explicitly excluded here:
- MFA, SSO, enterprise identity provider integration `[BRD-025, BRD-OQ-01]`.
- User creation, User ID generation, temporary-password generation, credential e-mail delivery and the Super Admin screens for reset / activate / deactivate / unlock (SPEC-004; unlock **API** is in this spec).
- Master data and organisation-scope mapping data (SPEC-003), employee profiles (SPEC-004), transfer workflow transition matrix and `INVALID_WORKFLOW_TRANSITION` handling (SPEC-007), document endpoints (SPEC-011), notification delivery (SPEC-012), audit visibility/export (SPEC-013), TLS/transport decisions, backup and monitoring (SPEC-015).
- Facilities/Admin role, external HR/Payroll integration, HR-system synchronisation, new identity provider `[BRD Out of Scope]`.
- Password history, password expiry, e-mail/SMS verification, CAPTCHA, device/IP allow-listing — none required by the BRD and none introduced.
