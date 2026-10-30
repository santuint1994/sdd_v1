# SPEC-001 — Project Foundation, Architecture & Database Foundation

## Feature ID
project-foundation-architecture

## Status
Changes Requested at Gate 1 (2026-10-28) — reviewer Shamik Bhattacharya; see `.ai-context/pr_reviews/SPEC-001-project-foundation-architecture-20261028-143345.md`. Spec must be updated and re-submitted for Gate 1; plan, tasks, tests and code remain blocked

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 1 (Spec Peer Review) | Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) | 2026-10-28 | Changes Requested | `.ai-context/pr_reviews/SPEC-001-project-foundation-architecture-20261028-143345.md` |
| Gate 2 (Code Review) | — | — | Not started | — |

## Intent & Business Goals

SPEC-001 builds the technical base every other spec stands on. It delivers **kernels that other specs consume**, not business features:

1. A runnable, secure, observable Express/TypeScript backend skeleton and a Next.js shell with a reusable UI kit (BRD-002 foundation slice, NFR-008 baseline).
2. A PostgreSQL/Sequelize foundation: migration conventions, naming, UUID keys, timestamps, soft-delete policy, enum handling, seed strategy.
3. A transaction helper plus an isolation/locking strategy so that vacancy reservation, capacity updates and workflow transitions can be atomic and non-duplicating (BRD-038 "Database transaction expectations", foundation level).
4. `AuditService.record` and an append-only `audit_logs` table that never holds credentials (BRD-037, NFR-003/NFR-005 kernel). Visibility, scoping, export and catalogue verification belong to SPEC-013.
5. `NotificationService.enqueue` and a transactional outbox table so a notification can never fail or roll back a core transaction (BRD-036 kernel). Templates, dispatch, retry and the inbox belong to SPEC-012.
6. Shared utilities: business-time-zone date utility (BRD-031), pagination, ID/sequence helpers, error classes and the response/error envelope.
7. Baseline transport/data-protection and local-deployment arrangements (NFR-004 baseline).

Nothing in this spec introduces a business rule, role, integration or numeric performance target that the BRD does not state.

## User Roles & Actors

| Actor | Interaction with this SPEC |
|---|---|
| Developers / Spec authors of SPEC-002…016 | Consume the kernels, conventions and UI kit |
| All six roles (`SUPER_ADMIN, EMPLOYEE, REPORTING_MANAGER, RECEIVING_MANAGER, HR, IT`) `[BRD-001]` | Experience the layout shell, error/loading/empty/no-access states; role-aware navigation is *rendered* here but role/permission *data* comes from SPEC-002 |
| Technical Lead / Architect (Gate 2) | Reviews conventions, DB immutability controls, TLS arrangement |
| Operations / deployer | Uses local setup and env-var documentation |

---

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-001 |
| Title | Project Foundation, Architecture & Database Foundation |
| Purpose | Establish repository structure, backend/frontend foundations, DB foundation, transaction helper, audit and notification kernels, shared utilities and local deployment baseline |
| Business objective | Make later specs buildable and consistent; guarantee traceable, tamper-resistant audit and non-blocking notifications (BRD-036/037), consistent transactional behaviour (BRD-038), a professional accessible UI base (BRD-002, NFR-008) and protected transport/data (NFR-004) |
| Version | 0.1 (Draft) — 2026-10-06 |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer per roster | Project Manager / Product Owner |
| Task prefix | `TASK-001.MM` |
| Test prefix | `TC-001.mm` |

## 2. Why This SPEC Exists

- The repository holds only a scaffold: `backend/src/index.ts` (single file, `GET /health`, `cors()` with no allow-list, `console.log`), `backend/src/config/config.json` (**hard-coded `postgres/postgres` credentials**, which violates `int-standards.md` §3), no logger, no error architecture, no validation, no `/api/v1` routing; `frontend/src/app/page.tsx` is still the create-next-app sample.
- `Backend-Architecture.md` §30 states these gaps explicitly and says moving to the target architecture must go through the SDD lifecycle. This spec is that lifecycle entry for the foundation.
- Cross-cutting concerns (audit, outbox, transactions, error envelope, logger redaction, request-id, config) must exist **once**, before SPEC-002…016 depend on them. Without a shared kernel each spec would invent its own, risking credential leakage into logs/audit (BRD-005/006/025/037), partial writes (BRD-038) and notification failures breaking transactions (BRD-036).
- It also fixes the architecture boundary for the current phase: modular monolith, no external HR/Payroll integration, no MFA/SSO.

**Ownership statement.** This spec delivers kernels; the following are explicitly *consumed*, not owned, here: auth/session/RBAC (SPEC-002), master data (SPEC-003), user profiles (SPEC-004), vacancies (SPEC-005), transfers (SPEC-006), workflow engine (SPEC-007), documents (SPEC-011), notification templates/dispatch (SPEC-012), audit visibility/export (SPEC-013), dashboards (SPEC-014), NFR hardening (SPEC-015), QA matrix (SPEC-016).

## 3. BRD Traceability

### 3.1 BRD requirement IDs

| BRD ID | Coverage | Slice delivered by SPEC-001 |
|---|---|---|
| BRD-002 | PARTIAL (foundation slice; primary owner SPEC-003, with SPEC-014 for dashboard cards) | Responsive layout shell, role-aware navigation *mechanism*, reusable status badges, searchable/sortable/filterable paginated data-table component, form field pattern with inline validation and required indicators, confirmation dialog, loading/empty/no-access/error states, accessibility baseline |
| BRD-005 | PARTIAL | Logger/audit/outbox credential-redaction guarantees so temp passwords are never logged/audited (delivery itself: SPEC-004/012) |
| BRD-006 | PARTIAL | "Plaintext passwords never persisted in logs/audit" enforced by redactor + outbox payload guard |
| BRD-022 | PARTIAL | `AuditService.record` kernel |
| BRD-025 | PARTIAL | Credential-logging rule (passwords, tokens never in application/audit logs) enforced by shared redaction |
| BRD-026 | PARTIAL | 401/403 error codes and envelope, validation of request shape; the authorization chain itself is SPEC-002 |
| BRD-027 | PARTIAL | Constants for status codes/sets; error `INVALID_WORKFLOW_TRANSITION` class and message; transaction helper used by `WorkflowEngine` |
| BRD-028 / BRD-017 | PARTIAL | Row-lock helpers, lock-order rule, `Reserved + Filled ≤ Total` enforcement pattern (CHECK constraints are SPEC-005) |
| BRD-030 | PARTIAL | Constraint-to-error mapper registry (partial unique index → `ACTIVE_TRANSFER_ALREADY_EXISTS`); index itself is SPEC-006 |
| BRD-031 | PARTIAL | Business-time-zone date utility and 30-day window helper (validation rule application: SPEC-006/008) |
| BRD-036 | PARTIAL | `NotificationService.enqueue` + transactional outbox; event→channel mapping constants |
| BRD-037 | PARTIAL | `audit_logs` append-only table (trigger + revoked privileges), no-credential guarantee, record shape; view/scope/export: SPEC-013 |
| BRD-038 | PARTIAL | Transaction helper, request-duration logging as performance-test input, DB timeout config knobs; numeric targets remain TBC |
| BRD-021 | PARTIAL | HTTP 413/415 error codes and messages registered in the code catalogue; upload handling: SPEC-011 |
| BRD-004 | PARTIAL | Role-prefixed sequence/ID formatting helper (`EMP/MGR/HR/IT` + 6 digits); user creation: SPEC-004 |
| BRD-019 | PARTIAL | Status code/label constants |
| BRD-001 | PARTIAL | Role enum constants |

(There is no BRD-015 in the BRD numbering; this is a BRD numbering gap, noted here only for overview completeness.)

### 3.2 NFR IDs

| NFR | Coverage | Slice |
|---|---|---|
| NFR-003 | PARTIAL | No credentials in logs/audit/outbox (shared redactor, outbox guard, tests); hashing is SPEC-002 |
| NFR-004 | PARTIAL (baseline) | TLS arrangement (TDD-REQUIRED), secure headers, CORS allow-list, DB TLS option, no PII in logs by default, secrets from env |
| NFR-005 | PARTIAL | Append-only audit table (trigger + privilege separation); further tamper-resistance in SPEC-013/015 |
| NFR-006 | PARTIAL | Outbox retry-without-repeating-transaction foundation; `event_key` idempotency (was `dedupe_key`) |
| NFR-008 | PARTIAL (baseline) | Accessibility baseline in UI kit (target standard `[TDD-REQUIRED]`) |
| NFR-009 | PARTIAL | Env/config knobs, health endpoints, graceful shutdown, structured logs; production targets stay with deployment planning |
| NFR-001/002/007 | None | Consumed from SPEC-002/011/015 |

### 3.3 BRD-OQ

| ID | Use in this SPEC |
|---|---|
| BRD-OQ-01 | Local credentials only; MFA/SSO excluded from architecture boundary |
| BRD-OQ-03 | Email is the credential delivery channel; outbox must not persist plaintext credentials (see TDD-001.04) |
| BRD-OQ-06 | DB transaction/concurrency controls for reservation (locking strategy here) |
| BRD-OQ-08 | Local server storage config knob reserved |
| BRD-OQ-09 | Deferred infra targets: only knobs and health/monitoring hooks here |
| BRD-OQ-19 | No HR-system sync: integration boundary recorded in §9 |
| BRD-OQ-20(b) | Business time zone utility |

### 3.4 Business rules implemented or enabled

| Rule | Source | How |
|---|---|---|
| Notification failure never fails/rolls back the core transaction; retry never repeats the workflow transaction or creates a duplicate action | BRD-036 | Outbox row written inside the business transaction; delivery outside it (SPEC-012); `event_key` uniqueness |
| Audit append-only, never edited/overwritten, never deleted via application, lifetime retention | BRD-037 | DB trigger + REVOKE; no purge code |
| No plaintext/temp/reset password, token or credential in audit/logs | BRD-025, BRD-037, NFR-003 | Redactor + payload guards + tests |
| Critical operations (reservation, capacity, workflow state change) consistent, never partial or duplicate | BRD-038 | `withTransaction`, locks, constraints, atomic id sequence |
| Date window: current date (business TZ) ≤ date ≤ current date + 30 days, inclusive, fixed | BRD-031 | `businessDate` util with constant `EFFECTIVE_DATE_MAX_DAYS_AHEAD = 30` |
| Backend/API is authoritative; frontend restrictions are UX only | BRD-026 | FE shell never relied upon for security; documented in §15 |
| Max upload size 5 MB per file | BRD-021/038 | Error codes registered; limit enforced by SPEC-011 |

### 3.5 BRD "Acceptance Criteria" bullets covered

| BRD acceptance bullet | Coverage |
|---|---|
| "plaintext passwords are never stored in PostgreSQL, application logs, reports or audit logs" | PARTIAL (logs/audit/outbox part) |
| "tokens and credentials are never written to application or audit logs" | PARTIAL (logging/audit part) |
| "Every material configuration, security and workflow action creates the agreed audit record" | PARTIAL (kernel only) |
| "Audit logging (BRD-037)": append-only, no screen or API edits/deletes records; no credentials in records | PARTIAL (storage/immutability/redaction; view/export: SPEC-013) |
| "Notifications (BRD-036)": delivery failure never rolls back the workflow action; retry without duplicate transition | PARTIAL (enqueue/outbox atomicity) |
| "Performance & availability (BRD-038)": failed/interrupted reservation, capacity update or workflow change leaves no partial/duplicate result | PARTIAL (transaction helper/locking foundation) |
| "Effective Transfer Date (BRD-031)": current date in business TZ accepted | PARTIAL (date utility) |
| "Super Admin can access a modern role-aware Admin Panel" | PARTIAL (shell/UI kit) |
| Unauthenticated → 401, forbidden → 403 without exposing restricted data | PARTIAL (error shape/code only) |

### 3.6 Negative scenarios (BRD-039) supported

| BRD-039 row | Relationship |
|---|---|
| "Concurrent HR approvals do not cause vacancy capacity to be exceeded" / "capacity never becomes negative" | PARTIAL — lock/transaction helper and concurrency test harness; scenario owner SPEC-005/016 |
| "Invalid workflow transitions are rejected" | PARTIAL — error class, code, exact message; engine SPEC-007 |
| "A failed integration does not incorrectly mark task Completed" / Integration rows | N/A in this SPEC (no integration; see SPEC-015/016); outbox idempotency is the only related kernel |
| "Direct API access cannot bypass …authorization" | PARTIAL — consistent 401/403 envelope; enforcement SPEC-002 |

## 4. Dependencies

| Depends on | Why |
|---|---|
| Approved BRD (Gate 0 approved 2026-10-05) | Source of requirements |
| `.ai-context/constitution.md`, `project_context.md`, `architecture.md`, `Backend-Architecture.md`, `Frontend-Architecture.md` | Stack and structure constraints |
| `.agent/rules/int-standards.md` | async/await only, try/catch, structured logger, env secrets, no `eval`, no AI-hint comments or commit messages |
| Local PostgreSQL instance (version `[TDD-REQUIRED]`, see TDD-001.06) | DB foundation |
| No other SPEC | SPEC-001 is the root of the dependency graph |

## 5. Enables

| Spec | Consumes from SPEC-001 |
|---|---|
| SPEC-002 | Config loader (JWT env), logger redaction, error classes (401/403), validation middleware, `withTransaction`, audit kernel for security events, FE API client + `AuthContext` contract |
| SPEC-003 | UI kit, DataTable, forms, layout shell, migration conventions, pagination |
| SPEC-004 | `SequenceService` + `formatBusinessId`, audit/outbox kernels, transaction helper (user + profile creation in one transaction) |
| SPEC-005 | Locking helpers, lock order, constraint mapper, `VACANCY_CAPACITY_UNAVAILABLE` code, audit kernel |
| SPEC-006 | `businessDate` util, pagination, constraint mapper for `ACTIVE_TRANSFER_ALREADY_EXISTS`, error classes |
| SPEC-007…010 | `withTransaction`, `AuditService.record`, `NotificationService.enqueue`, status constants, `InvalidWorkflowTransitionError` |
| SPEC-011 | Error codes 413/415, config knobs, error handler for multer-style errors |
| SPEC-012 | Outbox table and enqueue kernel (adds dispatcher, templates, in-app inbox, retry) |
| SPEC-013 | `audit_logs` table and `record` (adds query/scoping/export/catalogue) |
| SPEC-014 | StatCard, DataTable, state components |
| SPEC-015 | Health endpoints, config, logging, TLS arrangement for hardening |
| SPEC-016 | Test harness, DB bootstrap, factories |

## 6. Roles & Scope

**In scope**

- Repository/folder structure and module-boundary rules.
- Backend foundation: `app.ts`/`server.ts`, config/env loader, logger, request-id/context, response/error envelope, error classes + code catalogue, validation middleware, security middleware, health endpoints, graceful shutdown.
- Database foundation: Sequelize connection factory, sequelize-cli config (env-driven), migration/seeder conventions, `id_sequences`, `audit_logs`, `notification_outbox`, DB roles/privileges script.
- Transaction helper, lock helpers, isolation/locking strategy.
- `AuditService.record`/`recordStandalone`; `NotificationService.enqueue`.
- Utilities: business-time-zone dates, pagination, ID helpers, shared constants (roles, statuses, notification events, audit categories).
- Frontend foundation: folder layout, providers, Redux store skeleton, HTTP client/interceptors, UI kit, DataTable, feedback components, layout shell, route groups, accessibility baseline.
- Local setup and env-var documentation; TLS arrangement decision (TDD-REQUIRED).
- Test harness (Jest backend, Jest/Vitest + RTL frontend, axe).

**Role scope.** The foundation is role-agnostic. Role names appear only as a shared enum. Authorization is never decided in this SPEC.

**Out of scope**: see the final "Out of Scope" section.

---

## 7. Functional Requirements

Tags: `[BRD]` stated by BRD, `[DERIVED]` follows from BRD text, `[PROPOSED]` technical design, `[TDD-REQUIRED]` decision not defined by BRD.

### 7.1 Project structure and architecture boundary

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-001.01 | The system is a **modular monolith**: `frontend/` (Next.js, App Router, TypeScript, Tailwind) and `backend/` (Express, TypeScript, Sequelize, PostgreSQL) are separately runnable units in one repository. The frontend talks to the backend over HTTP only; no `frontend/src/app/api` is created. | `[DERIVED]` constitution.md / architecture.md; project_context.md |
| FR-001.02 | Backend source layout follows `backend/src/{app.ts,server.ts,config/,common/,middlewares/,errors/,utils/,modules/,models/,migrations/,seeders/,types/}`. Business code lives under `backend/src/modules/<module>/` with `routes`, `controller`, `service`, `repository`, `validators`, `dto` (single file per layer by default; split into per-action files only when a file exceeds a reviewable size). Empty placeholder files are not created. | `[PROPOSED]` Backend-Architecture.md §3–4 (contract-aligned) |
| FR-001.03 | Layering is one-way: `Route → Middleware → Validation → Controller → Service → Repository → Model → PostgreSQL`. Controllers never touch Sequelize models; repositories contain no business rules; services never import `req`/`res`; models never call services. Enforced by ESLint `no-restricted-imports` / import-boundary rules in CI. | `[PROPOSED]` Backend-Architecture.md §2 |
| FR-001.04 | Modules interact only through a module's `index.ts` public surface (services/interfaces). No cross-module access to another module's repository or model. Kernels (`AuditService`, `NotificationService`, `SequenceService`, `withTransaction`) live in `backend/src/common/`. | `[PROPOSED]` modular monolith, microservice-ready |
| FR-001.05 | Module registry (one folder per module, created by the owning spec): `health`, `identity` (SPEC-002), `master-data` (SPEC-003), `users` (SPEC-004), `vacancies` (SPEC-005), `transfers` (SPEC-006), `workflow` (SPEC-007/008/009/010), `documents` (SPEC-011), `notifications` (SPEC-012), `audit` (SPEC-013), `reporting` (SPEC-014). `audit` and `notifications` *kernels* sit in `common/` in SPEC-001; the modules add routes/UI on top without moving the kernels. | `[PROPOSED]` |
| FR-001.06 | Sequelize models are defined inside their owning module (`modules/<m>/models/*.model.ts`); `backend/src/models/index.ts` is the single aggregator that imports every module model and registers associations (satisfies `project_context.md` model path and `.sequelizerc` `models-path`). | `[PROPOSED]` (resolves tension between project_context.md "models at backend/src/models/" and module-owned layout) |
| FR-001.07 | **Current-phase architecture boundaries are recorded and test-guarded**: no `integrations/http` adapter, no HR/Payroll client, no scheduler for HR sync, no SSO/OIDC/MFA code is created. The only outbound adapter permitted is the email adapter added by SPEC-012. A repository check (`scripts/check-boundaries`) fails CI if forbidden dependencies (e.g. `passport-*`, `openid-client`, `speakeasy`/TOTP libs, `redis`, `bullmq`) appear in `package.json` without an approved change. | `[BRD]` Out of Scope (HR sync, BRD-OQ-19), BRD-025 (MFA/SSO out); check is `[PROPOSED]` |
| FR-001.08 | Redis, queues, microservice split, Kubernetes, CQRS, event sourcing are not introduced. Background work uses an in-process poller over the outbox (SPEC-012). | `[DERIVED]` Backend-Architecture.md §29 "unless justified"; `[PROPOSED]` |
| FR-001.09 | Business code that records status values, roles or notification events imports them from `backend/src/common/constants/` (single source) rather than redefining string literals. | `[PROPOSED]` |

### 7.2 Backend foundation

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-001.10 | `app.ts` builds and exports the Express app (no `listen`); `server.ts` loads config, connects DB, listens, and handles `SIGTERM`/`SIGINT` graceful shutdown (stop accepting → drain in-flight → close DB → exit, with a shutdown timeout). `src/index.ts` is removed or reduced to importing `server.ts`; `npm run dev/start` keep working. | `[PROPOSED]` Backend-Architecture.md §25 |
| FR-001.11 | **Config/env loader** (`common/config`): reads `process.env` (via `dotenv` in non-production), validates with a Joi schema at startup, **fails fast** with a list of invalid/missing keys (key names only, never values), exports one immutable typed `config` object. No module reads `process.env` directly. Secrets are never hard-coded; `.env.example` lists every key with placeholder values; real `.env*` files are git-ignored. | `[BRD]` NFR-003/004 spirit, `[DERIVED]` int-standards §3; loader `[PROPOSED]` |
| FR-001.12 | **Logger** (`common/logger`): Winston JSON logger, levels `error|warn|info|debug`, console transport in dev, file transport with rotation only when `LOG_FILE_PATH` is set. Each request log carries `requestId, timestamp, method, path (no query string values for sensitive keys), statusCode, durationMs, service, environment, userId (UUID only, when known)`. `console.*` is forbidden by lint outside `scripts/`. | `[DERIVED]` int-standards §2; `[PROPOSED]` Backend-Architecture.md §15 |
| FR-001.13 | **Credential redaction** is a shared utility (`common/security/redactor`) used by the logger, `AuditService` and `NotificationService`. It redacts (replace with `"[REDACTED]"`) values for case-insensitive/normalised keys matching the deny-list `password, passwd, currentPassword, oldPassword, newPassword, confirmPassword, temporaryPassword, tempPassword, resetPassword, passwordHash, password_hash, token, accessToken, refreshToken, idToken, authorization, cookie, set-cookie, secret, clientSecret, apiKey, jwt, otp`, recurses through nested objects/arrays, and also redacts string values that look like JWTs (`^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$` with `eyJ` prefix) or bcrypt hashes (`^\$2[aby]\$`). Request/response bodies and `Authorization`/`Cookie` headers are **never** logged by default. | `[BRD]` BRD-025, BRD-037, NFR-003 (rule); deny-list `[PROPOSED]` |
| FR-001.14 | **PII minimisation in logs**: logs identify users by internal UUID; employee names, emails, phone numbers and free-text remarks are not written to application logs by default; error logs may include entity IDs. | `[BRD]` NFR-004 ("protection of personal/employee information"); mechanism `[PROPOSED]` |
| FR-001.15 | **Request-ID / context**: middleware accepts inbound `X-Request-Id` only if it matches `^[A-Za-z0-9\-_.]{8,64}$`, otherwise generates a UUID v4; echoes it in the `X-Request-Id` response header; stores `{requestId, actor (set later by SPEC-002), ip}` in an `AsyncLocalStorage` request context readable by logger, `AuditService` and `NotificationService`. | `[PROPOSED]` Backend-Architecture.md §14 |
| FR-001.16 | **Response envelope**: success `{ "success": true, "data": {…}, "meta": {…} }`; paginated lists put `{page,pageSize,total,totalPages}` in `meta`; error `{ "success": false, "error": { "code", "message", "details": [], "requestId" } }`. Helpers `ok(res, data, meta?)`, `created(res, data)`, `noContent(res)`. | `[PROPOSED]` (contract-mandated shape) |
| FR-001.17 | **Error classes** (`errors/`): `AppError(code, message, httpStatus, details?, isOperational)`, `ValidationError`(400 `VALIDATION_ERROR`), `AuthenticationError`(401 `UNAUTHENTICATED`), `AuthorizationError`(403 `FORBIDDEN`), `NotFoundError`(404 `RESOURCE_NOT_FOUND`), `ConflictError`(409 `RESOURCE_CONFLICT`), `InvalidWorkflowTransitionError`(403 `INVALID_WORKFLOW_TRANSITION`), `PayloadTooLargeError`(413), `UnsupportedMediaTypeError`(415), `RateLimitError`(429 `RATE_LIMITED`), `ServiceUnavailableError`(503). | `[BRD]` codes/status for 401, 403, `INVALID_WORKFLOW_TRANSITION`, 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`, 413 `FILE_SIZE_EXCEEDED`, 415 `UNSUPPORTED_FILE_TYPE`/`INVALID_FILE_TYPE`; others `[PROPOSED]` |
| FR-001.18 | **Error-code catalogue** (`errors/error-codes.ts`) holds code → {httpStatus, default message}. BRD-defined entries are verbatim: `INVALID_WORKFLOW_TRANSITION` 403 "The requested action is not permitted for the current transfer status."; `ACTIVE_TRANSFER_ALREADY_EXISTS` 409 "You already have an active internal transfer request. Please wait until the existing request is completed or closed before submitting a new request."; `FILE_SIZE_EXCEEDED` 413; `UNSUPPORTED_FILE_TYPE` 415; `INVALID_FILE_TYPE` 415. `VACANCY_CAPACITY_UNAVAILABLE` 409 is registered as a BRD-required response with `[PROPOSED]` code. | `[BRD]` BRD-027/030/021; capacity code `[PROPOSED]` (BRD-028 requires "a capacity-unavailable response") |
| FR-001.19 | **Global error middleware**: maps `AppError` to its status; maps Joi errors to 400 `VALIDATION_ERROR` with `details:[{field,message,rule}]`; maps malformed JSON to 400 `MALFORMED_JSON`; body-too-large to 413 `REQUEST_ENTITY_TOO_LARGE`; Sequelize/PG errors through the **constraint mapper registry** (FR-001.20); anything else to 500 `INTERNAL_ERROR` with a generic message. Production responses never contain stack traces, SQL, internal paths, credentials or secrets. Unknown routes → 404 `RESOURCE_NOT_FOUND`. 5xx are logged at `error` with `requestId` and sanitised context; 4xx at `warn`/`info`. | `[DERIVED]` int-standards §2 ("standard HTTP status codes and structured JSON error responses"); `[PROPOSED]` |
| FR-001.20 | **Constraint mapper registry** `registerConstraintMapper(constraintName, (err) => AppError)`: when a PG unique/check/FK violation (SQLSTATE `23505/23514/23503`) names a registered constraint, the registered domain error is thrown instead of generic `RESOURCE_CONFLICT`/`VALIDATION_ERROR`. Owners register mappers (e.g. SPEC-006 registers the one-active-transfer partial unique index → `ACTIVE_TRANSFER_ALREADY_EXISTS`). Unmapped violations never leak constraint/table names in the response. | `[PROPOSED]` supports BRD-030 DB-level enforcement |
| FR-001.21 | **Validation middleware** `validate({ body?, query?, params?, headers? })` using Joi: `abortEarly:false`, unknown keys rejected (`allowUnknown:false`), strings trimmed, type conversion allowed for query/params. Validated values are attached to `req.validated.{body,query,params}` (Express 5 makes `req.query` a read-only getter, so it is **not** reassigned). All external input is validated before the controller runs. | `[DERIVED]` int-standards §3 ("validate and sanitize all incoming user payload data"); Joi `[PROPOSED]` per Backend-Architecture.md §11 |
| FR-001.22 | **Security middleware**: `helmet()` defaults, `x-powered-by` disabled; CORS with explicit allow-list from `CORS_ALLOWED_ORIGINS` (no wildcard when credentials are used; empty list in production = deny cross-origin); global rate limit (`express-rate-limit`) with a stricter limiter factory exported for login/credential endpoints (applied by SPEC-002); JSON body limit `JSON_BODY_LIMIT`; `trust proxy` set from `TRUST_PROXY`; HSTS only when `TLS_ENFORCED=true`. Health endpoints are exempt from rate limiting. Rate-limit numeric defaults are `[PROPOSED]` placeholders, **not BRD requirements** (BRD-025's lock-out of 5 attempts/30 minutes is account-level, owned by SPEC-002). | `[BRD]` NFR-004 baseline; rest `[PROPOSED]` |
| FR-001.23 | **Health endpoints** (see §12): `GET /api/v1/health`, `/live`, `/ready`. Liveness never touches the DB; readiness checks DB connectivity (`SELECT 1`, bounded by timeout) and migrations-applied flag. No infrastructure details, versions, hostnames or stack data are exposed. The scaffold `GET /health` stays as an alias to liveness until the frontend/ops no longer reference it. | `[PROPOSED]` Backend-Architecture.md §23; NFR-009 hook |
| FR-001.24 | **Shared constants** in `common/constants/`: `roles.ts` (`SUPER_ADMIN, EMPLOYEE, REPORTING_MANAGER, RECEIVING_MANAGER, HR, IT`), `transfer-status.ts` (15 status codes with BRD labels, `ACTIVE_STATUSES`, `FINAL_STATUSES`, `HR_CONTROLLED_STAGES`, `IT_CONTROLLED_STAGES`), `audit.ts` (categories `BUSINESS|WORKFLOW|ADMIN|SECURITY`, outcome codes), `notification-events.ts` (see FR-001.50). Semantics and transitions remain owned by SPEC-007; the constants exist once so DB CHECK constraints and code cannot diverge. | `[BRD]` BRD-001/019/027/030 (values); module placement `[PROPOSED]` |

### 7.3 Database foundation

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-001.25 | **Connection factory** (`common/database/connection.ts`): single Sequelize instance from `config.db` (`DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD`, pool min/max, `DB_SSL`, statement/lock timeouts), logging routed to the logger at `debug`, slow-query warning above `DB_SLOW_QUERY_MS` when set. `sequelize.sync()` is never called in any environment; schema changes are migrations only. | `[PROPOSED]` Backend-Architecture.md §8 |
| FR-001.26 | **sequelize-cli configuration** becomes environment-driven: `backend/src/config/config.json` (hard-coded credentials) is deleted and replaced by `backend/src/config/database/sequelize-cli.config.js` reading env vars; `.sequelizerc` is updated accordingly and keeps `migrations-path = src/migrations`, `seeders-path = src/seeders`, `models-path = src/models`. Migrations/seeders are TypeScript executed through `ts-node/register`. | `[DERIVED]` int-standards §3 (no hard-coded credentials); mechanism `[PROPOSED]` |
| FR-001.27 | **Migration conventions** (normative): file `YYYYMMDDHHMMSS-<verb>-<object>.ts`; one concern per file; every migration has a working `down`; DDL executed in a transaction; reversible data migrations only; migrations are append-only once merged (never edit a merged migration); CI runs `up → down → up` on an empty database. Helper module `common/database/migration-helpers.ts` supplies `addTimestamps`, `addEnumCheck`, `addUuidPk`, `createUpdatedAtTrigger` (optional). | `[PROPOSED]` |
| FR-001.28 | **Naming conventions**: tables snake_case plural (`transfer_requests`); columns snake_case; PK `id`; FK `<entity>_id`; booleans `is_/has_` prefix; timestamps `*_at`; indexes `idx_<table>_<cols>`; unique `uq_<table>_<cols>`; partial unique `uq_<table>_<cols>_<predicate>`; FK `fk_<table>_<col>`; check `ck_<table>_<rule>`. Sequelize models use `underscored: true`, `timestamps: true`, explicit `tableName`. TypeScript model/class names are singular PascalCase. | `[PROPOSED]` |
| FR-001.29 | **Primary key strategy**: every table uses `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` (PostgreSQL ≥ 13 core function; no extension needed). Human-facing business identifiers (User ID `EMP######`, transfer reference, vacancy reference, payroll reference) are **separate unique columns** generated by `SequenceService`, never primary keys. Surrogate bigint identities are used only for append-only ordering (`audit_logs.seq`). | `[PROPOSED]` (BRD-004 gives only the User ID format) |
| FR-001.30 | **Timestamps**: `created_at`/`updated_at` are `TIMESTAMPTZ NOT NULL DEFAULT now()` on every mutable table; instants stored in UTC; business calendar dates (e.g. Effective Transfer Date) are `DATE` with no time zone and exchanged as `YYYY-MM-DD`; instants exchanged as ISO-8601 UTC strings. `created_by`/`updated_by UUID NULL` are added by owners where actor tracking is useful (the audit log, not these columns, is the authoritative history). | `[PROPOSED]` |
| FR-001.31 | **Soft-delete policy**: the BRD requires no deletion of business records (audit lifetime retention; transfers kept as history; deactivation via status). Therefore **`paranoid`/`deleted_at` is not used by default**. Lifecycle is expressed by explicit status columns (e.g. user Inactive/Deactivated, vacancy Closed). Hard `DELETE` is allowed only for rows of purely technical tables (e.g. `notification_outbox` housekeeping if SPEC-012 chooses) and never for `audit_logs`. A spec that needs `deleted_at` must justify it and add a BRD reference. | `[DERIVED]` BRD-037 (no manual deletion), BRD-007/017 (status-based lifecycle); policy `[PROPOSED]` |
| FR-001.32 | **Enum handling**: enumerations are stored as `VARCHAR(n)` + named `CHECK` constraint (not native PostgreSQL ENUM types), with values sourced from `common/constants/*` and mirrored by a CI test that compares constants to the CHECK definitions. Rationale: adding a value is a simple migration (`DROP/ADD CONSTRAINT`) and avoids `ALTER TYPE` transaction limits. | `[PROPOSED]` |
| FR-001.33 | **Optimistic concurrency**: mutable aggregate tables may add `version INTEGER NOT NULL DEFAULT 1` with Sequelize `version: true`; pessimistic row locks (FR-001.40) remain the primary control for vacancy and transfer rows. | `[PROPOSED]` |
| FR-001.34 | **Seed strategy**: seeders live in `backend/src/seeders/` as `YYYYMMDDHHMMSS-seed-<name>.ts`; they are idempotent (upsert by natural key), have a `down` that removes only rows they created, and are classed `reference` (safe in any environment, e.g. lookup data) or `demo` (guarded: refuse to run when `NODE_ENV=production`). **No seeder commits a default password or secret.** Test data comes from factories in `tests/backend/factories/`, not seeders. The bootstrap of the first Super Admin account is `[DERIVED]` (BRD assumes one exists) but its mechanism is `[TDD-REQUIRED]`, owned by SPEC-002/004 (see TDD-001.07). | `[DERIVED]` BRD-005/025; mechanism `[TDD-REQUIRED]` |
| FR-001.35 | **DB roles / privilege separation**: two PostgreSQL roles — `sdd_migrator` (owns objects, runs migrations) and `sdd_app` (runtime; `SELECT/INSERT/UPDATE/DELETE` on business tables, `SELECT/INSERT` only on `audit_logs`, no DDL). `scripts/db/roles.sql` creates them idempotently with passwords supplied from env at execution time. For purely local single-user setups the roles may be the same login only if the append-only **trigger** (FR-001.38) remains active; this relaxation is recorded in TDD-001.05. | `[PROPOSED]` supports BRD-037 / NFR-005 |

### 7.4 Transaction helper, isolation and locking

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-001.36 | `withTransaction(fn, options?)` runs `fn(trx)` inside one Sequelize transaction, commits on resolve, rolls back on throw, and rethrows the original error. Options: `isolationLevel` (default `READ COMMITTED`), `retries` (default 0), `name` (for logs). Nested use is done by **passing the `trx` explicitly**; services accept `{trx}` and never open their own transaction when one is supplied (no implicit CLS). | `[PROPOSED]` supports BRD-038 |
| FR-001.37 | **Retry** is opt-in per call and applies only to SQLSTATE `40001` (serialization failure) and `40P01` (deadlock) with jittered backoff up to `TX_MAX_RETRIES` (default 3); the callback must be safe to re-run (no external side effects inside). After exhaustion the error maps to 409 `CONCURRENT_UPDATE`. | `[PROPOSED]` |
| FR-001.38 | **No external I/O inside a transaction**: email/SMTP, file writes and HTTP calls are forbidden inside `withTransaction`. Deferred side-effects register through `trx.afterCommit(...)` (e.g. "wake the outbox poller"). Failure of an after-commit hook never affects the committed result and is logged. | `[BRD]` BRD-036 (notification failure never rolls back); rule `[PROPOSED]` |
| FR-001.39 | **Isolation strategy**: default `READ COMMITTED` plus explicit row locks and DB constraints for invariants; `SERIALIZABLE` is available but not the default. Invariants are enforced in this order of preference: (1) DB constraint (CHECK / unique / partial unique / FK), (2) `SELECT … FOR UPDATE` on the contended row(s), (3) application check inside the same transaction. A check made outside a transaction is never sufficient. | `[DERIVED]` BRD-028/030/038 (mandatory DB-level enforcement); strategy `[PROPOSED]` |
| FR-001.40 | **Lock helpers**: `lockRowsForUpdate(model, where, {trx, nowait?, order})` wrapping `lock: trx.LOCK.UPDATE`; `SET LOCAL lock_timeout = <DB_LOCK_TIMEOUT_MS>` per transaction; lock-not-available (`55P03`) → 409 `RESOURCE_BUSY`. Advisory locks (`pg_advisory_xact_lock`) via `withAdvisoryXactLock(key, {trx})` for cross-row critical sections. | `[PROPOSED]` supports BRD-017/028 |
| FR-001.41 | **Global lock-ordering rule** (deadlock avoidance, binding on SPEC-005…010): lock in this order — (1) `employee`/user row (only where needed), (2) `transfer_requests` row, (3) `transfer_task_assignments` / `transfer_clarifications`, (4) `payroll_activities` / `it_tasks`, (5) `vacancies` rows in ascending `id`, (6) `vacancy_reservations`. [RECONCILED R-5] matches SPEC-005 §17.3 canonical order (transfer -> payroll/IT tasks -> vacancy), identical in 005/007/008/009/010. Within a level, ascending primary key. A transaction that needs two vacancies (HR changes vacancy) locks both in ascending `id` regardless of old/new role. | `[PROPOSED]` supports BRD-028 "old reservation released and new reserved atomically" |
| FR-001.42 | **Canonical state-changing transaction shape** (documented template, enforced by review/tests): `withTransaction(async trx => { lock rows → validate → mutate → history row → AuditService.record(…, {trx}) → NotificationService.enqueue(…, {trx}) → return })`. Audit or outbox failure inside the transaction aborts the transaction (a material action without its audit record is not allowed); delivery of the notification happens later. | `[DERIVED]` BRD-037 + BRD-036 + BRD-038; shape `[PROPOSED]` |

### 7.5 Audit kernel

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-001.43 | `audit_logs` is an **append-only** table (see §10). `AuditService.record(event, {trx})` inserts one row inside the caller's transaction; `trx` is mandatory (throws `AUDIT_TRX_REQUIRED` programming error if absent). | `[BRD]` BRD-037; API shape `[PROPOSED]` |
| FR-001.44 | `AuditService.recordStandalone(event)` writes in its own short transaction for events that must persist **even when no business transaction commits** — denied/invalid attempts, login failures, authorization denials, invalid workflow transition attempts (BRD-027/037 require these as security events). Its failure is logged at `error` and does not mask the original HTTP response. | `[BRD]` BRD-026/027/037; mechanism `[PROPOSED]` |
| FR-001.45 | Audit record fields: actor user, actor login ID, actor type (`USER|SYSTEM|ANONYMOUS`), actor role at time of action, action, event code, category, outcome, entity type/id, related employee, related transfer, scope hints (`location_id`, `department_id`), previous value, new value, previous status, new status, remarks/reason, metadata, occurred-at, request id, client IP. Actor, request id and IP default from the request context. | `[BRD]` BRD-037 field list; extra columns `[PROPOSED]` |
| FR-001.46 | **Immutability**: a `BEFORE UPDATE OR DELETE` row trigger and a `BEFORE TRUNCATE` statement trigger raise an exception; `sdd_app` has only `SELECT, INSERT` on the table; no repository method, route or service exposes update/delete; there is no purge/retention job. A change to underlying data creates a **new** audit row. | `[BRD]` BRD-037, NFR-005; mechanism `[PROPOSED]` |
| FR-001.47 | **No credentials in audit**: `record` runs `previous_value`, `new_value`, `metadata` and `remarks` through the shared redactor (FR-001.13); detected redaction increments a counter and logs a `warn` with the event code (never the value). Payloads over 16 KB (serialised) are rejected with `AUDIT_PAYLOAD_TOO_LARGE`. Events must contain deltas/ids, not full password-bearing entities. | `[BRD]` BRD-025/037; size cap `[PROPOSED]` |
| FR-001.48 | Event codes follow `DOMAIN_ACTION` upper-snake; each emitting spec registers its codes in `common/constants/audit-events.ts` (consolidated catalogue verification: SPEC-013). Unknown codes are rejected at runtime (`AUDIT_EVENT_UNREGISTERED`) so typos cannot create untraceable records. | `[PROPOSED]` |
| FR-001.49 | Tamper-evidence beyond trigger + privileges (e.g. hash chaining) is **not** implemented in this spec; the decision is recorded as TDD-001.08. | `[TDD-REQUIRED]` NFR-005 "tamper-resistant" |

### 7.6 Notification outbox kernel

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-001.50 | `notification-events.ts` registers the twelve BRD-036 events and their mandatory channels: `USER_ACCOUNT_CREATED` [EMAIL]; `CREDENTIAL_RESET` [EMAIL]; `TRANSFER_SUBMITTED`, `APPROVAL_REQUIRED`, `CLARIFICATION_REQUESTED`, `APPROVAL_COMPLETED`, `TRANSFER_REJECTED`, `HR_ACTION_REQUIRED`, `PAYROLL_TASK_ASSIGNED`, `IT_TASK_ASSIGNED`, `TASK_BLOCKED`, `TRANSFER_COMPLETED` each [EMAIL, IN_APP]. Further events (reassignment, withdrawal, cancellation, etc.) are added by the owning spec. | `[BRD]` BRD-036 channel rule; event codes `[PROPOSED]` |
| FR-001.51 | `NotificationService.enqueue(eventCode, payload, {trx})` writes one event-level `notification_outbox` row [RECONCILED R-10: recipient × channel fan-out rows are SPEC-012 `notification_deliveries`] **inside the caller's transaction** (trx mandatory) and returns row ids. It performs no network I/O, never throws for delivery reasons, and is a no-op for already-enqueued `event_key`s (idempotent insert). Recipient resolution ("relevant stakeholders") is supplied by the caller (`[TDD-REQUIRED]`, BRD gap (i)). | `[BRD]` BRD-036, NFR-006; API `[PROPOSED]` |
| FR-001.52 | Payload guard: the enqueue payload is validated against the deny-list of FR-001.13 and **rejected** (not silently redacted) if it contains plaintext credentials, tokens or password-like keys, because silently dropping required content would corrupt the message. The outbox never stores plaintext passwords (BRD-006). Delivery of initial/reset credentials is therefore a decision recorded as TDD-001.04. | `[BRD]` BRD-005/006; guard `[PROPOSED]` |
| FR-001.53 | `event_key` semantics [RECONCILED name, was `dedupe_key`]: caller supplies a deterministic key (recommended `<eventCode>:<entityId>:<transitionId or version>`), enforced by unique `(dedupe_key, channel, recipient_user_id)` so a retried API call or a re-run transaction cannot create duplicate notifications and a notification retry cannot duplicate a workflow transition. | `[BRD]` BRD-036 ("never creates duplicate transfer actions"), NFR-006; key format `[PROPOSED]` |
| FR-001.54 | The kernel creates rows with `status='PENDING'`, `attempts=0`, `next_attempt_at=now()`; dispatch, locking, retry/backoff, `SENT/FAILED` transitions, templates and in-app inbox are owned by SPEC-012. A failed or absent dispatcher never affects committed business data. | `[BRD]` BRD-036 |

### 7.7 Common utilities

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-001.55 | **Business-time-zone date utility** (`common/utils/business-date.ts`): `getBusinessToday(clock?)` → `YYYY-MM-DD` in `config.businessTimeZone` (IANA name validated at startup via `Intl.DateTimeFormat`); `addCalendarDays(date, n)`; `compareBusinessDates(a,b)`; `isWithinWindow(date, minOffsetDays, maxOffsetDays, clock?)`; constant `EFFECTIVE_DATE_MAX_DAYS_AHEAD = 30` (**fixed, not configurable**); `isValidEffectiveTransferDate(date, clock?)` = `today ≤ date ≤ today+30` inclusive, weekends/holidays accepted (no calendar check). Dates are strings (`YYYY-MM-DD`), never JS `Date` midnight objects, to avoid time-zone drift. An injectable `Clock` interface (`now(): Date`) makes tests deterministic. | `[BRD]` BRD-031; helper API `[PROPOSED]` |
| FR-001.56 | The **value** of the business time zone is not defined by the BRD; `BUSINESS_TIME_ZONE` is a required env var (startup fails if missing/invalid in non-test environments). | `[TDD-REQUIRED]` BRD-031 "application/server-configured business time zone" (TDD-001.02) |
| FR-001.57 | **Pagination helper** (`common/utils/pagination.ts`): parses `page` (≥1, default 1), `pageSize` (1…100, default 20), `sort` (allow-listed per endpoint), `order` (`asc|desc`, default `asc`), `q` (trimmed, max 100 chars); returns `{limit, offset, order[], q}` and builds `meta`. A deterministic secondary sort on `id` is always appended. `q` values used in `ILIKE` have `%`, `_` and `\` escaped. Out-of-range values → 400 `VALIDATION_ERROR`; `pageSize > 100` is rejected, not silently clamped. | `[PROPOSED]` (contract defaults) supports BRD-002 |
| FR-001.58 | **ID generation helpers**: `newId()` (`crypto.randomUUID()`); `SequenceService.next(sequenceKey, {trx})` implemented as a single atomic `INSERT … ON CONFLICT (sequence_key) DO UPDATE SET last_value = id_sequences.last_value + 1, updated_at = now() RETURNING last_value` (row lock held until the caller's transaction ends, so a rolled-back creation does not burn a number and concurrent creators are serialised); `formatBusinessId(prefix, n, width = 6)` → e.g. `EMP000001`; overflow beyond `10^width − 1` throws `SEQUENCE_EXHAUSTED`. Prefix and format *policy* are owned by the consuming spec (User ID `EMP/MGR/HR/IT` + 6 digits per BRD-004; Receiving Manager / Super Admin prefixes and transfer/payroll reference formats are `[TDD-REQUIRED]` in SPEC-004/006/009). | `[BRD]` BRD-004 (format); helper `[PROPOSED]` |
| FR-001.59 | **Uniqueness of generated identifiers is guaranteed by the database** (`UNIQUE` on the business-ID column in the owner's table) in addition to the sequence. | `[BRD]` BRD-004 ("unique…User ID"); `[PROPOSED]` |

### 7.8 Frontend foundation

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-001.60 | **Structure** under `frontend/src/`: `app/` (App Router), `components/{layout,ui,forms,common}/`, `context/`, `hooks/`, `redux/{store.ts,hooks.ts,StoreProvider.tsx,slices/}`, `services/{http-client.ts,interceptors.ts}`, `providers/`, `types/`, `constants/`, `config/`, `utils/`, `validations/`, `data/`. No domain folders are created in the shared layers. | `[DERIVED]` Frontend-Architecture.md |
| FR-001.61 | **Route groups & special pages**: `(auth)/` (unauthenticated: layout without shell) and `(protected)/` (wrapped by `DashboardLayout`), root `layout.tsx` with providers, `loading.tsx`, `error.tsx` (error boundary with retry and request id), `not-found.tsx`, and `(protected)/no-access/page.tsx`. The create-next-app sample `page.tsx` is replaced by a redirect to `/dashboard` (or `/login` when unauthenticated; session logic SPEC-002). Actual login/dashboard pages belong to SPEC-002/014; SPEC-001 ships placeholder content only for the shell to render. | `[PROPOSED]` BRD-002 |
| FR-001.62 | **Layout shell** (`DashboardLayout`, `Header`, `Sidebar`, `PageHeader`, `Breadcrumbs`): responsive for **desktop and tablet** (≥ 768 px; sidebar collapses to an overlay/drawer below 1024 px); skip-to-content link; landmarks (`header`, `nav`, `main`); user menu slot (name/role/logout wired by SPEC-002). | `[BRD]` BRD-002 ("responsive desktop/tablet layouts with accessibility support") |
| FR-001.63 | **Role-aware navigation mechanism**: navigation is a typed config (`data/navigation.ts`: `{label, href, icon, module, roles: Role[]}`) filtered by the authenticated role from `AuthContext`; only permitted modules render. Modules named by BRD-003: Dashboard, Users, Locations, Departments, Designations, Vacancies, Transfers, Documents, Audit Logs. The config declares the modules and *candidate* role visibility as `[PROPOSED]`; the authoritative permission matrix is SPEC-002 and the backend remains authoritative (BRD-026) — frontend hiding is UX only. | `[BRD]` BRD-002/003/026; role-to-module mapping `[PROPOSED]` |
| FR-001.64 | **UI kit components** (`components/ui`, `components/forms`): `Button` (variants primary/secondary/danger/ghost, loading state, `aria-busy`), `TextField`, `PasswordField` (show/hide toggle, no autofill of tokens), `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `DateField` (native `type=date` with `min`/`max` props; UX only per BRD-031), `FormField` (label, required indicator, help text, inline error with `aria-describedby`/`aria-invalid`), `Badge`/`StatusBadge` (tone + text, never colour-only), `Card`, `StatCard` (dashboard cards: label, value, optional link, loading/error state), `Tabs`, `Tooltip`, `Spinner`, `Skeleton`. | `[BRD]` BRD-002 (forms, required indicators, status badges, cards); set `[PROPOSED]` |
| FR-001.65 | **DataTable** (`components/ui/DataTable`): server-driven; props `columns`, `rows`, `loading`, `error`, `emptyState`, `sort`, `onSortChange`, `page/pageSize/total`, `onPageChange`, search box, filter slot; state mirrored to URL query (`page,pageSize,sort,order,q,…`) via `useTableQueryState`; semantic `<table>` with `scope`, `aria-sort`, keyboard-reachable controls; shows Skeleton while loading, `EmptyState` for zero rows, `ErrorState` on failure; horizontal scroll container on tablet. | `[BRD]` BRD-002 ("searchable/sortable/filterable data tables with pagination and status badges"); API `[PROPOSED]` |
| FR-001.66 | **State components**: `LoadingState`/`PageLoader`, `EmptyState` (title, description, optional action), `ErrorState` (message from `ApiError`, `requestId` shown for support, retry), `NoAccess` (403 presentation; reveals no restricted information), `InlineAlert`, `Toast` + `ToastProvider` (`aria-live="polite"`; errors `assertive`). | `[BRD]` BRD-002 ("clear loading, empty, no-access and error states") |
| FR-001.67 | **Confirmation dialog** (`ConfirmDialog` on a `Modal`): title, consequence text, confirm/cancel, destructive variant, optional mandatory **reason** textarea (`reasonRequired`, min length 1, max 1000) used for deactivation, reassignment, credential reset and later reason-required actions; focus trap, Esc closes, focus returns to trigger, confirm disabled while submitting. | `[BRD]` BRD-002 (confirmation dialogs for sensitive actions); reason-required pattern `[DERIVED]` BRD-027/035 |
| FR-001.68 | **API client** (`services/http-client.ts`, `interceptors.ts`): Axios instance with `baseURL = NEXT_PUBLIC_API_BASE_URL` (+`/api/v1`), `timeout = NEXT_PUBLIC_API_TIMEOUT_MS`, `withCredentials` from config; response interceptor unwraps the envelope, normalises failures to `ApiError {status, code, message, details, requestId}` (including `NETWORK_ERROR`/`TIMEOUT` with no server body); generates `X-Request-Id` per call; a pluggable `authTokenProvider` and `onUnauthenticated` callback let SPEC-002 attach credentials and redirect on 401 without this layer knowing token storage; **403 does not log the user out**; no request/response body or token is `console.log`ged. All backend calls from components go through `services/*.service.ts`. | `[BRD]` BRD-026 (401 vs 403 semantics); client `[PROPOSED]` |
| FR-001.69 | **Forms foundation**: `useApiFormErrors(error)` maps `ApiError.details[{field,message}]` to field errors; shared validators in `validations/` (required, max length) for UX only — the backend remains authoritative. Required fields show a visible required marker and `aria-required`. | `[BRD]` BRD-002 inline validation; `[DERIVED]` BRD-026 |
| FR-001.70 | **State management**: Redux Toolkit store with `uiSlice` (sidebar state, toast queue) and typed hooks; `authSlice`/`AuthContext` are *contract-only* stubs (`status: 'loading'|'authenticated'|'unauthenticated'`, `user`, `role`, `hasRole()`), populated by SPEC-002. | `[DERIVED]` Frontend-Architecture.md |
| FR-001.71 | **Accessibility baseline** applied to every kit component: semantic HTML first; visible `:focus-visible` ring; WCAG-AA colour contrast tokens defined as CSS variables in `globals.css` (light theme; dark theme not required); text alternatives; labelled controls; error text linked to inputs; status conveyed by text/icon plus colour; `prefers-reduced-motion` respected; modal focus trap; live regions for toasts; automated `jest-axe`/axe checks on every kit component and each shell page in CI. The **named accessibility standard** ("organisational portal design and accessibility standards", NFR-008) is not in the BRD; WCAG 2.1 AA is the proposed default. | `[BRD]` NFR-008, BRD-002; standard `[TDD-REQUIRED]` (TDD-001.03) |
| FR-001.72 | **Frontend env/config**: `config/env.ts` validates `NEXT_PUBLIC_API_BASE_URL` (required) and `NEXT_PUBLIC_API_TIMEOUT_MS`; `.env.local`, `.env.production` git-ignored; `.env.example` committed. Only `NEXT_PUBLIC_*` values reach the browser; no secrets in the frontend. | `[DERIVED]` int-standards §3 |

### 7.9 Deployment and configuration foundations

| ID | Requirement | Tag / Ref |
|---|---|---|
| FR-001.73 | **Local setup** is documented and scripted: prerequisites (Node.js LTS pinned in `.nvmrc`, PostgreSQL, npm), clone → `npm ci` in both apps → copy `.env.example` → `npm run db:create` → `db:migrate` → `db:seed:reference` → `npm run dev` (backend 4000, frontend 3000). Deployment target remains "Local setup"; **no Dockerfile/compose/PM2/Kubernetes is delivered** by this spec (none was selected in project_context.md). | `[DERIVED]` project_context.md; scripts `[PROPOSED]` |
| FR-001.74 | **Environment variable catalogue** (§11.9) is the single list; the loader schema, `.env.example` and README are generated/checked from it in CI (a test fails if a key exists in one but not the others). | `[PROPOSED]` |
| FR-001.75 | **Transport security arrangement (NFR-004)** is `[TDD-REQUIRED]`. Until decided, the code supports both: (a) TLS terminated by a reverse proxy in front of the backend and frontend (`TRUST_PROXY`, secure-cookie/HSTS flags honoured), and (b) a direct HTTPS option (`TLS_CERT_PATH`, `TLS_KEY_PATH`) in `server.ts`. Plain HTTP is allowed only when `NODE_ENV` is `development` or `test`; in `production` the loader refuses to start unless `TLS_ENFORCED=true` is explicitly set (declaring that transport protection is provided). | `[BRD]` NFR-004; arrangement `[TDD-REQUIRED]` |
| FR-001.76 | **Database transport/at-rest**: `DB_SSL=true` enables TLS to PostgreSQL (`rejectUnauthorized` configurable via `DB_SSL_REJECT_UNAUTHORIZED`); at-rest encryption of the database volume and document storage is an infrastructure item recorded in TDD-001.01 and routed to SPEC-015. | `[BRD]` NFR-004; decisions `[TDD-REQUIRED]` |
| FR-001.77 | **Observability hooks for NFR-009/BRD-038 inputs**: request-duration and status logged per request; `X-Request-Id` end-to-end; optional DB slow-query log; no APM product is selected. The numeric response-time targets, concurrency, volume and API timeout remain **to be confirmed** by performance/capacity planning (BRD-038); config exposes `HTTP_REQUEST_TIMEOUT_MS` and `DB_STATEMENT_TIMEOUT_MS` with placeholder values flagged `[PROPOSED]`. | `[BRD]` BRD-038 (TBC items), NFR-009; knobs `[PROPOSED]` |

---

## 8. Internal Implementation Plan / Tasks

Order is the recommended build order. Layers: BE, FE, DB, QA, OPS. All tasks follow TDD (RED tests under `tests/` first).

| Task | Title | Layer | Description | Inputs → Outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-001.01 | Tooling & repo baseline | BE/FE | Strict `tsconfig`, ESLint (no `console`, boundary rules, no-explicit-any warn), Prettier, Jest (ts-jest) config, npm scripts (`lint`, `typecheck`, `test`, `db:*`), `.nvmrc`, `.gitignore` for `.env*`, `.env.example` skeletons, boundary-check script | repo scaffold → green `lint`/`typecheck`/empty `test` | — | NFR-004 |
| TASK-001.02 | Backend structure & app/server split | BE | Create `app.ts`, `server.ts`, folder layout (FR-001.02–06), graceful shutdown, keep `/health` alias | scaffold `index.ts` → `app.ts`, `server.ts` | 01 | BRD-038, NFR-009 |
| TASK-001.03 | Config/env loader | BE | Joi schema from env catalogue (§11.9), fail-fast, typed immutable `config`, production TLS guard, business TZ validation | env → `config` | 02 | NFR-004, BRD-031 |
| TASK-001.04 | Logger + redactor | BE | Winston JSON logger, request logging middleware, shared `redactor`, lint ban on `console` | config → `logger`, `redact()` | 03 | BRD-025, BRD-037, NFR-003/004 |
| TASK-001.05 | Request-ID & AsyncLocalStorage context | BE | `X-Request-Id` validate/generate/echo; context accessors | req → context | 04 | BRD-037 |
| TASK-001.06 | Error classes, code catalogue, constraint mapper | BE | Classes (FR-001.17), catalogue with verbatim BRD messages, `registerConstraintMapper` | — → `errors/*` | 04 | BRD-021/026/027/030 |
| TASK-001.07 | Envelope helpers, error & 404 middleware | BE | `ok/created/noContent`, error handler incl. Joi/JSON/PG mapping, production-safe bodies | errors → responses | 05, 06 | BRD-026 |
| TASK-001.08 | Validation middleware | BE | `validate()` with `req.validated`, unknown-key rejection, Express-5 safe | Joi schemas → 400 `VALIDATION_ERROR` | 07 | int-standards §3 |
| TASK-001.09 | Security middleware | BE | helmet, CORS allow-list, global + factory rate limiters, body limit, trust proxy | config → middleware stack | 07 | NFR-004 |
| TASK-001.10 | Health endpoints | BE | `/api/v1/health`, `/live`, `/ready` with DB probe | DB conn → health JSON | 07, 11 | NFR-009 |
| TASK-001.11 | DB connection + CLI config + conventions | DB | Sequelize factory, env-driven `sequelize-cli.config.js`, remove `config.json`, `.sequelizerc`, migration helpers, naming/enum/seed conventions doc in `docs/` | env → working `db:migrate` | 03 | BRD-038 |
| TASK-001.12 | Migration: `id_sequences` | DB | Table + unique `sequence_key` | — → table | 11 | BRD-004 |
| TASK-001.13 | Migration: `audit_logs` + immutability | DB | Table, indexes, CHECKs, mutation-reject triggers, `REVOKE`/`GRANT` | — → append-only table | 11 | BRD-037, NFR-005 |
| TASK-001.14 | DB roles script | DB/OPS | `scripts/db/roles.sql`, runtime-vs-migrator guidance | env → roles | 13 | BRD-037 |
| TASK-001.15 | Transaction helper & lock helpers | BE | `withTransaction`, retry, `afterCommit`, `lockRowsForUpdate`, advisory lock, lock-order doc, `lock_timeout` | conn → helpers | 06, 11 | BRD-038, BRD-028 |
| TASK-001.16 | `SequenceService` & ID helpers | BE | atomic next value, `formatBusinessId`, `newId` | table 12 → service | 12, 15 | BRD-004 |
| TASK-001.17 | `AuditService` kernel | BE | `record`, `recordStandalone`, event registry, size cap, redaction, context defaults | table 13 → service | 05, 13, 15, 04 | BRD-022, 037 |
| TASK-001.18 | Migration: `notification_outbox` | DB | Event-level table, unique `event_key` index, CHECKs (dispatch index moves to SPEC-012 deliveries) [RECONCILED] | — → table | 11 | BRD-036 |
| TASK-001.19 | `NotificationService.enqueue` kernel | BE | Event registry (12 events/channels), payload guard, idempotent insert, no-I/O guarantee | table 18 → service | 15, 17(redactor), 18 | BRD-036, NFR-006 |
| TASK-001.20 | Business-date utility & Clock | BE | `businessDate` API, DST/edge tests | config TZ → util | 03 | BRD-031 |
| TASK-001.21 | Pagination helper & shared constants | BE | pagination parser/meta, roles/status/audit/notification constants + CHECK-sync test | — → utils | 02 | BRD-001/019/027 |
| TASK-001.22 | Frontend scaffold & providers | FE | Folder layout, remove sample page, `StoreProvider`, `ToastProvider`, `AuthContext` contract, env config, Tailwind tokens/theme in `globals.css` | scaffold → app shell root | 01 | BRD-002, NFR-008 |
| TASK-001.23 | API client & interceptors | FE | Axios instance, `ApiError`, envelope types, hooks for auth provider/401 | env → `http-client` | 22 | BRD-026 |
| TASK-001.24 | UI kit primitives & form pattern | FE | Components of FR-001.64, `FormField`, `useApiFormErrors` | tokens → kit | 22 | BRD-002, NFR-008 |
| TASK-001.25 | DataTable & query-state hook | FE | FR-001.65 | kit → table | 24, 23 | BRD-002 |
| TASK-001.26 | State components, Toast, Modal/ConfirmDialog | FE | FR-001.66–67 | kit → components | 24 | BRD-002 |
| TASK-001.27 | Layout shell, navigation, route groups, special pages | FE | FR-001.61–63 | kit → shell | 24, 26 | BRD-002/003 |
| TASK-001.28 | Accessibility & responsive verification | FE/QA | axe CI on all components/pages, keyboard/focus tests, breakpoint tests | shell → a11y gate | 25–27 | NFR-008, BRD-002 |
| TASK-001.29 | Local setup, env docs, TLS arrangement docs | OPS | README, `docs/local-setup.md`, env catalogue check, TLS options note pending TDD-001.01 | all → docs | 03, 11, 22 | NFR-004, NFR-009 |
| TASK-001.30 | Backend test harness | QA | Jest config, supertest, test DB bootstrap (`sdd_v1_test`), transaction-per-test or truncate strategy, factories, concurrency helper (`runConcurrently`) | — → harness | 11 | BRD-038, BRD-039 |
| TASK-001.31 | Kernel verification suites | QA | Audit immutability & credential redaction, outbox atomicity/idempotency, sequence concurrency, transaction rollback/retry, lock-order test, date-util matrix, boundary-check | harness → TC-001.* | 13–20, 30 | BRD-036/037/038, NFR-003/004/005 |

---

## 9. Business Rules

| # | Rule | Source |
|---|---|---|
| BR-001.01 | Audit records are append-only; changes create new entries; no application path deletes or edits them; retained for the system lifetime. | `[BRD]` BRD-037 |
| BR-001.02 | Plaintext/temporary/reset passwords, tokens and other credentials are never written to logs, audit records, outbox payloads or the database in clear text. | `[BRD]` BRD-005/006/025/037, NFR-003 |
| BR-001.03 | A notification failure never fails, rolls back or corrupts the core transaction; retries never repeat the workflow transaction or create duplicates. | `[BRD]` BRD-036 |
| BR-001.04 | Critical operations are transactional and neither partially nor duplicately applied. | `[BRD]` BRD-038 |
| BR-001.05 | The effective-date window is `today ≤ date ≤ today + 30 calendar days`, inclusive, in the business time zone; 30 is fixed; weekends/holidays permitted. | `[BRD]` BRD-031 |
| BR-001.06 | The backend is the authoritative validator; frontend checks are UX only. | `[BRD]` BRD-026 |
| BR-001.07 | Current phase has **no external HR/Payroll integration**, no HR-system synchronisation, no MFA/SSO; any future integration requires an approved contract before implementation. | `[BRD]` Integration Requirements, BRD-OQ-19, BRD-025, Out of Scope |
| BR-001.08 | Max upload size is 5 MB per file; document error codes are 413 `FILE_SIZE_EXCEEDED`, 415 `UNSUPPORTED_FILE_TYPE`, 415 `INVALID_FILE_TYPE`. | `[BRD]` BRD-021 |
| BR-001.09 | State-changing business operations use the canonical transaction shape (lock → validate → mutate → history → audit → outbox). | `[PROPOSED]` derived from BRD-036/037/038 |
| BR-001.10 | Enums are VARCHAR + CHECK; PKs are UUID; business IDs are unique separate columns; no `paranoid` tables unless justified. | `[PROPOSED]` |
| BR-001.11 | Backend modules interact only through public module interfaces. | `[PROPOSED]` |

## 10. Data Model & Database

SPEC-001 owns three tables. All other tables are created by the owning spec following the conventions of §7.3.

### 10.1 `id_sequences`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK default `gen_random_uuid()` |
| sequence_key | VARCHAR(64) | NOT NULL, `uq_id_sequences_sequence_key` (e.g. `USER_ID:EMP`, `TRANSFER_REF`) |
| last_value | BIGINT | NOT NULL default 0, `ck_id_sequences_non_negative` (`last_value >= 0`) |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL default `now()` |

### 10.2 `audit_logs` (append-only)

| Column | Type | Constraints / notes |
|---|---|---|
| id | UUID | PK default `gen_random_uuid()` |
| seq | BIGINT | `GENERATED ALWAYS AS IDENTITY`, `uq_audit_logs_seq` — monotonic ordering |
| occurred_at | TIMESTAMPTZ | NOT NULL default `now()` |
| event_code | VARCHAR(100) | NOT NULL |
| category | VARCHAR(20) | NOT NULL, `ck_audit_logs_category` IN (`BUSINESS`,`WORKFLOW`,`ADMIN`,`SECURITY`) |
| action | VARCHAR(100) | NOT NULL |
| outcome | VARCHAR(10) | NOT NULL default `SUCCESS`, CHECK IN (`SUCCESS`,`DENIED`,`FAILED`) |
| actor_type | VARCHAR(10) | NOT NULL, CHECK IN (`USER`,`SYSTEM`,`ANONYMOUS`) |
| actor_user_id | UUID | NULL — **no FK** (the log must survive account changes) |
| actor_login_id | VARCHAR(32) | NULL — business User ID, also for failed logins where no user row resolves |
| actor_role | VARCHAR(30) | NULL, CHECK in role enum |
| entity_type | VARCHAR(60) | NOT NULL |
| entity_id | VARCHAR(64) | NULL |
| related_employee_id | UUID | NULL (no FK) |
| related_transfer_id | UUID | NULL (no FK) |
| location_id / department_id | UUID | NULL — scope hints for SPEC-013 role/organisation scoping `[PROPOSED]` |
| previous_value / new_value | JSONB | NULL, redacted before insert |
| previous_status / new_status | VARCHAR(60) | NULL |
| remarks | TEXT | NULL |
| metadata | JSONB | NULL, redacted, ≤ 16 KB total payload |
| request_id | VARCHAR(64) | NULL |
| client_ip | INET | NULL |

No `updated_at`, no `deleted_at`, no FKs. Indexes: `idx_audit_logs_occurred_at (occurred_at DESC)`, `idx_audit_logs_entity (entity_type, entity_id, occurred_at DESC)`, `idx_audit_logs_actor (actor_user_id, occurred_at DESC)`, `idx_audit_logs_event_code (event_code, occurred_at DESC)`, partial `idx_audit_logs_transfer (related_transfer_id, occurred_at) WHERE related_transfer_id IS NOT NULL`, partial `idx_audit_logs_employee (related_employee_id, occurred_at) WHERE related_employee_id IS NOT NULL`.

**Immutability objects** `[PROPOSED]`:
```
CREATE FUNCTION audit_logs_reject_mutation() RETURNS trigger ... RAISE EXCEPTION 'audit_logs is append-only' USING ERRCODE = '23001';
CREATE TRIGGER trg_audit_logs_no_update_delete BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION audit_logs_reject_mutation();
CREATE TRIGGER trg_audit_logs_no_truncate BEFORE TRUNCATE ON audit_logs FOR EACH STATEMENT EXECUTE FUNCTION audit_logs_reject_mutation();
REVOKE ALL ON audit_logs FROM PUBLIC; GRANT SELECT, INSERT ON audit_logs TO sdd_app;
```
Residual: a database superuser/owner outside the application can still alter the trigger; this is outside "normal application functionality" (BRD-037) and addressed operationally (TDD-001.05, TDD-001.08).

### 10.3 `notification_outbox` (event-level kernel row)

[RECONCILED R-10] Column names now match SPEC-012 section 10.1 (SPEC-012 owns dispatch/delivery detail). The outbox row is one row per enqueued **event**; the per (recipient x channel) delivery state (`channel`, `recipient_user_id`, `status`, `attempts`, `next_attempt_at`, `locked_at`, `last_error`) lives in SPEC-012 `notification_deliveries`, created inside the same transaction by the SPEC-012 `enqueue` implementation. Until SPEC-012 ships, `enqueue` inserts the event row only (no dispatcher runs).

| Column | Type | Constraints / notes |
|---|---|---|
| id | UUID | PK (the `event_id`) |
| event_key | VARCHAR(200) | NOT NULL, UNIQUE - deterministic idempotency key (was `dedupe_key`) |
| event_code | VARCHAR(100) | NOT NULL, registered event (SPEC-012 narrows to catalogue CHECK) |
| source_type | VARCHAR(40) | NOT NULL (e.g. `workflow_history`, `user`) |
| source_id | UUID | NULL |
| transfer_request_id | UUID | NULL (FK added once SPEC-006 table exists) |
| actor_user_id | UUID | NULL (FK to `users(id)` added by SPEC-012) |
| payload | JSONB | NOT NULL default `{}` - validated credential-free (SPEC-012 `PayloadGuard`), <= 16 KB |
| secret_id | UUID | NULL - added by SPEC-012 (`notification_secrets`, TDD-012.04 / merged credential decision R-12) |
| resolution_status | VARCHAR(20) | NOT NULL default `RESOLVED`, CHECK IN (`RESOLVED`,`NO_RECIPIENTS`,`ERROR`) - added by SPEC-012 |
| error_code | VARCHAR(60) | NULL - added by SPEC-012 |
| request_id | VARCHAR(64) | NULL - correlation to originating request |
| created_at | TIMESTAMPTZ | NOT NULL default `now()` |

Unique `uq_notification_outbox_event_key (event_key)`; indexes `(transfer_request_id)`, `(event_code, created_at)`.

### 10.4 Conventions recap (see FR-001.27–34)

UUID PK; `created_at/updated_at` TIMESTAMPTZ; business dates `DATE`; enums VARCHAR+CHECK; no `deleted_at` by default; unique business IDs; snake_case; `version` optional. **Migration order** for this spec: `…-create-id-sequences`, `…-create-audit-logs`, `…-create-notification-outbox`.

---

## 11. Backend Implementation

### 11.1 Directory layout `[PROPOSED]`

```
backend/src/
  app.ts  server.ts
  config/database/sequelize-cli.config.js
  common/
    config/  (schema.ts, index.ts)
    logger/  (logger.ts, request-logger.middleware.ts)
    security/ (redactor.ts, security.middleware.ts, rate-limit.ts)
    context/ (request-context.ts, request-id.middleware.ts)
    database/ (connection.ts, transaction.ts, locks.ts, migration-helpers.ts)
    audit/ (audit.service.ts, audit.types.ts, audit.repository.ts)
    notifications/ (notification.service.ts, notification.types.ts, notification.repository.ts)
    sequence/ (sequence.service.ts, business-id.ts)
    constants/ (roles.ts, transfer-status.ts, audit.ts, audit-events.ts, notification-events.ts)
    utils/ (business-date.ts, clock.ts, pagination.ts, response.ts)
    validation/ (validate.middleware.ts)
  errors/ (app-error.ts, error-codes.ts, constraint-mapper.ts, error.middleware.ts, index.ts)
  modules/health/ (health.routes.ts, health.controller.ts, health.service.ts)
  models/index.ts   migrations/   seeders/   types/
```

### 11.2 Middleware order (fixed) `[PROPOSED]`

`requestId → requestContext → requestLogger → helmet → cors → rateLimit (global) → body parser (JSON, size-limited) → /api/v1 routers (each protected route chain: authenticate → authorize → validate → controller; the first two are SPEC-002) → 404 handler → error handler`.

### 11.3 Kernel contracts (TypeScript)

```ts
// withTransaction
withTransaction<T>(fn: (trx: Transaction) => Promise<T>, opts?: { isolationLevel?: IsolationLevel; retries?: number; name?: string }): Promise<T>;
lockRowsForUpdate<M>(model: ModelStatic<M>, where: WhereOptions, ctx: { trx: Transaction; nowait?: boolean; order?: Order }): Promise<M[]>;

// AuditService
interface AuditEvent {
  eventCode: string; category: 'BUSINESS'|'WORKFLOW'|'ADMIN'|'SECURITY'; action: string; outcome?: 'SUCCESS'|'DENIED'|'FAILED';
  actor?: { userId?: string; loginId?: string; role?: Role; type: 'USER'|'SYSTEM'|'ANONYMOUS' };  // default: request context
  entityType: string; entityId?: string; relatedEmployeeId?: string; relatedTransferId?: string;
  locationId?: string; departmentId?: string; previousValue?: unknown; newValue?: unknown;
  previousStatus?: string; newStatus?: string; remarks?: string; metadata?: Record<string, unknown>;
}
AuditService.record(event: AuditEvent, ctx: { trx: Transaction }): Promise<{ id: string; seq: string }>;
AuditService.recordStandalone(event: AuditEvent): Promise<void>;

// NotificationService
interface NotificationPayload { recipients: string[] /* user UUIDs */; dedupeKey: string; entity?: { type: string; id: string }; data: Record<string, unknown>; channels?: ('EMAIL'|'IN_APP')[] /* default per event registry */ }
NotificationService.enqueue(eventCode: string, payload: NotificationPayload, ctx: { trx: Transaction }): Promise<string[]>;

// SequenceService
SequenceService.next(sequenceKey: string, ctx: { trx: Transaction }): Promise<number>;
formatBusinessId(prefix: string, n: number, width = 6): string;
```

### 11.4 Behaviour notes

- **Express 5**: async handlers propagate rejected promises to the error middleware automatically; no `express-async-errors`. `req.query` is read-only, so validators write to `req.validated`.
- **Logger usage**: services log through `logger.child({ module })`; `catch` blocks never swallow errors (int-standards §2): log with `requestId`, then rethrow or convert to `AppError`.
- **Config object** exposes grouped, frozen sections: `app, http, cors, rateLimit, db, tx, log, tls, businessTimeZone, reserved{jwt, smtp, documents}` (reserved groups are shape-validated by SPEC-002/011/012 when they land).
- **Graceful shutdown**: `server.close()` → wait for in-flight requests (≤ `SHUTDOWN_TIMEOUT_MS`) → `sequelize.close()` → exit 0; a second signal forces exit; readiness returns 503 immediately after the first signal.
- **Constraint mapping** reads `err.parent.constraint` (Sequelize `UniqueConstraintError` / `DatabaseError`) and consults the registry.
- **Audit for denied requests**: SPEC-002/007 call `recordStandalone` from their failure branch; the transaction helper does not audit rollbacks automatically.

### 11.5 Dependencies to add (backend) `[PROPOSED]`

Runtime: `joi`, `winston`, `express-rate-limit`. Dev: `jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest`, `ts-node`, `eslint`, `typescript-eslint`, `prettier`. Existing `express@5`, `helmet`, `cors`, `dotenv`, `pg`, `sequelize@6`, `bcryptjs`, `jsonwebtoken` are unchanged. Not added: Redis/BullMQ/passport/OIDC/TOTP (FR-001.07).

### 11.6 Package scripts `[PROPOSED]`

`dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, `test:coverage`, `db:create`, `db:migrate`, `db:migrate:undo`, `db:migrate:undo:all`, `db:seed:reference`, `db:seed:demo`, `check:boundaries`, `check:env`.

### 11.7 Event / notification code registries

`audit-events.ts` and `notification-events.ts` export `as const` maps plus an `isRegisteredEvent()` guard. SPEC-001 registers only test-support codes (`TEST_AUDIT_EVENT`, `TEST_NOTIFICATION_EVENT`, loaded only when `NODE_ENV=test`) and the twelve BRD-036 notification events.

### 11.8 Status constants (single source) — codes `[PROPOSED]`, labels `[BRD-019/027]`

`DRAFT`(Draft), `PENDING_REPORTING_MANAGER_APPROVAL`, `PENDING_RECEIVING_MANAGER_APPROVAL`, `INFO_REQUIRED`(Info Required), `PENDING_HR_REVIEW`, `HR_PROCESSING`, `PENDING_RECEIVING_MANAGER_REAPPROVAL`, `PAYROLL_PROCESSING`, `PENDING_IT_ACTION`, `PENDING_IT_FINAL_APPROVAL`, `COMPLETED`, `REJECTED`, `WITHDRAWN`, `BLOCKED`, `CANCELLED`. `FINAL_STATUSES = {COMPLETED, REJECTED, WITHDRAWN, CANCELLED}`; `ACTIVE_STATUSES` = all except `DRAFT` and the finals (BLOCKED and INFO_REQUIRED are active, BRD-030); `HR_CONTROLLED_STAGES = {PENDING_HR_REVIEW, HR_PROCESSING, PAYROLL_PROCESSING}`; `IT_CONTROLLED_STAGES = {PENDING_IT_ACTION, PENDING_IT_FINAL_APPROVAL}` (BRD-027). SPEC-007 owns transitions and semantics.

### 11.9 Environment variable catalogue

| Variable | Req. | Default / example | Notes |
|---|---|---|---|
| NODE_ENV | Y | `development` | `development\|test\|production` |
| PORT | N | `4000` | scaffold value |
| LOG_LEVEL | N | `info` | |
| LOG_FILE_PATH | N | unset | file transport only if set |
| SERVICE_NAME | N | `transfer-portal-api` | log field |
| DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD | Y | `127.0.0.1` / `5432` / `sdd_v1_dev` / — / — | no defaults for user/password in production |
| DB_SSL / DB_SSL_REJECT_UNAUTHORIZED | N | `false` / `true` | TLS to PostgreSQL |
| DB_POOL_MIN / DB_POOL_MAX | N | `2` / `10` | `[PROPOSED]` placeholders |
| DB_STATEMENT_TIMEOUT_MS | N | `30000` | placeholder; BRD-038 timeout TBC |
| DB_LOCK_TIMEOUT_MS | N | `5000` | placeholder |
| DB_SLOW_QUERY_MS | N | unset | enables slow-query warning |
| DB_MIGRATOR_USER / DB_MIGRATOR_PASSWORD | N | — | CLI only (FR-001.35) |
| TX_MAX_RETRIES | N | `3` | opt-in retries |
| CORS_ALLOWED_ORIGINS | Y (prod) | `http://localhost:3000` | comma list |
| RATE_LIMIT_WINDOW_MS / RATE_LIMIT_MAX | N | placeholders | `[PROPOSED]`, TDD-001.10 |
| AUTH_RATE_LIMIT_MAX | N | placeholder | consumed by SPEC-002 |
| JSON_BODY_LIMIT | N | `100kb` | |
| TRUST_PROXY | N | `false` | |
| HTTP_REQUEST_TIMEOUT_MS | N | `30000` | placeholder; TDD-001.09 |
| SHUTDOWN_TIMEOUT_MS | N | `10000` | |
| BUSINESS_TIME_ZONE | Y | IANA name, e.g. `UTC` in dev only | TDD-001.02 |
| TLS_ENFORCED | Y (prod) | `false` | production start-up guard |
| TLS_CERT_PATH / TLS_KEY_PATH | N | — | direct-HTTPS option |
| JWT_* | reserved | — | defined by SPEC-002 |
| SMTP_* / MAIL_FROM | reserved | — | defined by SPEC-012 |
| DOCUMENT_STORAGE_PATH / UPLOAD_MAX_BYTES | reserved | `5242880` | SPEC-011; 5 MB per BRD-021 |
| NEXT_PUBLIC_API_BASE_URL | Y (FE) | `http://localhost:4000` | |
| NEXT_PUBLIC_API_TIMEOUT_MS | N (FE) | `30000` | placeholder |

## 12. API Requirements

Only infrastructure endpoints belong to SPEC-001. All are unauthenticated, read-only, exempt from rate limiting and contain no sensitive infrastructure detail.

### 12.1 `GET /api/v1/health` `[PROPOSED]`
- Purpose: basic status. Auth: none. Authz: none. Request: none.
- Response 200: `{ "success": true, "data": { "status": "ok" } }`.
- Errors: only the generic 500 envelope.

### 12.2 `GET /api/v1/health/live` `[PROPOSED]`
- Purpose: process liveness; never touches the DB. Auth/Authz: none.
- Response 200: `{ "success": true, "data": { "status": "alive" } }`.
- The scaffold `GET /health` returns the same body until retired.

### 12.3 `GET /api/v1/health/ready` `[PROPOSED]`
- Purpose: dependency readiness. Auth/Authz: none.
- Checks: `SELECT 1` within 2 s; process not shutting down.
- 200: `{ "success": true, "data": { "status": "ready", "checks": { "database": "up" } } }`.
- 503: `{ "success": false, "error": { "code": "SERVICE_UNAVAILABLE", "message": "Service is not ready.", "details": [], "requestId": "…" } }` (no DB error text).

### 12.4 Cross-cutting API behaviour (applies to every endpoint) `[PROPOSED]`

| Concern | Behaviour |
|---|---|
| Base path | `/api/v1`; unknown route → 404 `RESOURCE_NOT_FOUND` |
| Envelope | FR-001.16 |
| Validation failure | 400 `VALIDATION_ERROR`, `details:[{ "field":"effectiveDate","message":"…","rule":"date.max" }]` |
| Auth failure | 401 `UNAUTHENTICATED` (missing/invalid/expired) `[BRD]` BRD-026 |
| Authorisation failure | 403 `FORBIDDEN`, body reveals no restricted data `[BRD]` BRD-026 |
| Invalid transition | 403 `INVALID_WORKFLOW_TRANSITION`, exact BRD message `[BRD]` BRD-027 |
| Duplicate active transfer | 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`, exact BRD message `[BRD]` BRD-030 |
| Capacity unavailable | 409 `VACANCY_CAPACITY_UNAVAILABLE` (`[PROPOSED]` code; behaviour BRD-028) |
| Upload errors | 413 `FILE_SIZE_EXCEEDED`; 415 `UNSUPPORTED_FILE_TYPE`; 415 `INVALID_FILE_TYPE` `[BRD]` BRD-021 |
| Concurrency | 409 `CONCURRENT_UPDATE`, 409 `RESOURCE_BUSY` `[PROPOSED]` |
| Rate limit | 429 `RATE_LIMITED` with `Retry-After` header |
| Body issues | 400 `MALFORMED_JSON`; 413 `REQUEST_ENTITY_TOO_LARGE` |
| Server fault | 500 `INTERNAL_ERROR` generic; 503 `SERVICE_UNAVAILABLE` |
| Correlation | `X-Request-Id` request/response header; `error.requestId` |
| Lists | `?page&pageSize&sort&order&q`; default pageSize 20, max 100; `meta:{page,pageSize,total,totalPages}` |

## 13. Frontend Implementation

### 13.1 File map `[PROPOSED]`

```
frontend/src/
  app/ layout.tsx page.tsx loading.tsx error.tsx not-found.tsx globals.css
       (auth)/layout.tsx   (protected)/layout.tsx   (protected)/no-access/page.tsx
  components/layout/ DashboardLayout Header Sidebar PageHeader Breadcrumbs SkipLink
  components/ui/     Button Badge StatusBadge Card StatCard Tabs Tooltip Spinner Skeleton Modal ConfirmDialog Toast DataTable Pagination
  components/forms/  FormField TextField PasswordField Textarea Select Checkbox RadioGroup DateField
  components/common/ LoadingState EmptyState ErrorState NoAccess InlineAlert
  context/AuthContext.tsx (contract)   providers/ToastProvider.tsx
  redux/ store.ts hooks.ts StoreProvider.tsx slices/uiSlice.ts slices/authSlice.ts(stub)
  services/ http-client.ts interceptors.ts   hooks/ useTableQueryState useApiFormErrors useDebounce
  types/api.ts (ApiEnvelope, ApiError, PageMeta)  constants/ status.ts roles.ts  config/env.ts
  data/navigation.ts  data/status-tones.ts  utils/format.ts
```

### 13.2 Design tokens and responsiveness
Tailwind v4 theme tokens in `globals.css`: colour scale with AA-contrast text/background pairs, spacing/typography scale, focus ring, radius, shadows. Breakpoints: tablet ≥ 768 px, desktop ≥ 1024 px (BRD-002 desktop/tablet). Sidebar docked ≥ 1024 px, drawer 768–1023 px. A phone layout is not a BRD requirement; content must not break but is not a test target `[DERIVED]` BRD-002.

### 13.3 Status badge tone map `[PROPOSED]`
`neutral`: DRAFT, CANCELLED, WITHDRAWN; `info`: PENDING_* and INFO_REQUIRED; `progress`: HR_PROCESSING, PAYROLL_PROCESSING; `success`: COMPLETED; `danger`: REJECTED; `warning`: BLOCKED. Every badge renders the label text (BRD-019 labels) plus an icon; colour is never the sole signal.

### 13.4 Behaviour
- **Loading**: route-level `loading.tsx` and component skeletons; buttons show a spinner and are disabled while submitting; no layout shift.
- **Empty**: `EmptyState` for zero rows with explanatory text; an action appears only when the caller says the role may create.
- **Error**: `ErrorState` shows `error.message`, optional `requestId`, retry button; 5xx show a generic message.
- **No-access**: a 403 from the API renders `NoAccess` without restricted detail; a 401 triggers `onUnauthenticated` (SPEC-002 redirects to login).
- **Confirmation**: sensitive actions open `ConfirmDialog`; the reason-required variant blocks confirm until a reason is entered.
- **Forms**: submit → disable → map `ApiError.details` to fields → focus first invalid field; success toast.
- **Navigation**: only items whose `roles` include the current role render; active item has `aria-current="page"`.

## 14. Validation Rules

| Area | Rule |
|---|---|
| Env (BE) | Joi schema; missing/invalid → process exits non-zero listing keys (no values) |
| `X-Request-Id` | `^[A-Za-z0-9\-_.]{8,64}$` else regenerated |
| Pagination | `page` int ≥ 1; `pageSize` int 1–100; `order` ∈ {asc,desc}; `sort` ∈ endpoint allow-list; `q` ≤ 100 chars, wildcard-escaped |
| Request bodies | JSON only unless an endpoint declares multipart (SPEC-011); unknown keys rejected; strings trimmed; max body `JSON_BODY_LIMIT` |
| Effective date (util) | `YYYY-MM-DD`, valid calendar date, `today ≤ d ≤ today+30` in business TZ |
| Business ID formatting | prefix `^[A-Z]{2,4}$`, width 6, value ≤ 999999 |
| Audit event | registered `eventCode`; payload ≤ 16 KB; redacted |
| Outbox payload | no deny-listed keys; ≤ 16 KB; `recipients` non-empty UUIDs; `dedupeKey` ≤ 200 chars |
| FE forms | UX-only checks mirror BE rules; BE authoritative (BRD-026) |
| FE config | `NEXT_PUBLIC_API_BASE_URL` absolute http(s) URL |

## 15. Authorization & Security Rules

| # | Rule | Tag |
|---|---|---|
| SEC-001.01 | The backend is the authoritative authorization layer; SPEC-001 makes no authorization decisions, only provides the error shapes (401 `UNAUTHENTICATED`, 403 `FORBIDDEN`) and the request context that SPEC-002 populates with the actor. | `[BRD]` BRD-026 |
| SEC-001.02 | Frontend navigation filtering and read-only rendering are UX only and never a security control. | `[BRD]` BRD-026 |
| SEC-001.03 | Secrets only via env; none in repo; `config.json` credentials removed; `.env*` git-ignored; startup validation fails fast. | `[DERIVED]` int-standards §3 |
| SEC-001.04 | Authorization headers, cookies and request/response bodies are never logged; shared redaction applied to logs, audit and outbox. | `[BRD]` BRD-025/037 |
| SEC-001.05 | Error responses never expose stack traces, SQL, constraint/table names, paths or secrets. | `[DERIVED]` int-standards §2 |
| SEC-001.06 | helmet headers, CORS allow-list, request size limit, rate limiting, `x-powered-by` off. | `[BRD]` NFR-004 baseline; settings `[PROPOSED]` |
| SEC-001.07 | Transport: TLS arrangement per TDD-001.01; production refuses to start without `TLS_ENFORCED=true`; DB TLS switch. | `[BRD]` NFR-004; decision `[TDD-REQUIRED]` |
| SEC-001.08 | `sdd_app` DB role cannot UPDATE/DELETE/TRUNCATE `audit_logs`; triggers block other non-superuser sessions; no application route performs audit mutation. | `[BRD]` BRD-037 |
| SEC-001.09 | Outbox rejects credential-bearing payloads; credential delivery path per TDD-001.04. | `[BRD]` BRD-006 |
| SEC-001.10 | No `eval`, no dynamic code execution, no SQL string concatenation (parameterised queries / Sequelize replacements only). | `[DERIVED]` int-standards §3 |
| SEC-001.11 | Dependencies for MFA/SSO/HR-sync are blocked by the boundary check. | `[BRD]` BRD-025, BRD-OQ-19 |
| SEC-001.12 | Logs and audit rows identify users by internal UUID/login ID; no personal data in application logs by default. | `[BRD]` NFR-004 baseline |
| SEC-001.13 | The shell shows `NoAccess` for 403 and never distinguishes "does not exist" from "not permitted" where the API itself does not. | `[DERIVED]` BRD-026 (no restricted info exposure) |

## 16. Workflow / State Transition Rules

Not applicable as a feature — SPEC-001 implements no workflow transitions (owner: SPEC-007; HR/Payroll/IT stages: SPEC-008/009; Withdraw/Block/Resume/Cancel/Reassign: SPEC-010). The slice that applies:

| Item | Foundation behaviour |
|---|---|
| Status codes/sets | Declared once in `transfer-status.ts` (§11.8) so DB CHECK constraints and code share one source |
| Invalid transition | `InvalidWorkflowTransitionError` → 403 `INVALID_WORKFLOW_TRANSITION`, exact BRD message, status unchanged `[BRD]` BRD-027 |
| Transaction contract for engines | Every transition runs in one `withTransaction` with history + audit + outbox (FR-001.42) |
| Notification coupling | Only outbox rows are written in-transaction; delivery cannot alter status `[BRD]` BRD-036 |
| Stage constants | HR/IT cannot block/cancel in manager-approval, INFO_REQUIRED or re-approval stages (Super Admin only): `HR_CONTROLLED_STAGES`/`IT_CONTROLLED_STAGES` make this checkable `[DERIVED]` BRD-027 |

## 17. Transaction & Concurrency Rules

| # | Rule |
|---|---|
| TX-001.01 | One business operation = one `withTransaction`; services receive `{trx}` and never start nested/independent transactions when one is supplied. |
| TX-001.02 | Order inside the transaction: acquire locks (FR-001.41 order) → re-read/validate → mutate → history → `AuditService.record` → `NotificationService.enqueue` → commit. |
| TX-001.03 | Isolation default `READ COMMITTED` + row locks/constraints; `SERIALIZABLE` only where a spec justifies it and handles `40001` with retry. |
| TX-001.04 | Retries (`40001`, `40P01`) are opt-in and only for side-effect-free callbacks; exhausted retries → 409 `CONCURRENT_UPDATE`. |
| TX-001.05 | `lock_timeout` is set per transaction; `55P03` → 409 `RESOURCE_BUSY` (never a hang). |
| TX-001.06 | Business invariants are enforced by DB constraints first (CHECK for capacity, partial unique for one-active transfer); owners add them, SPEC-001 supplies the mapper and the pattern. |
| TX-001.07 | No network/file I/O inside a transaction; after-commit hooks only. |
| TX-001.08 | Audit/outbox write failure aborts the business transaction (no material action without an audit record; no committed action silently missing its notification row). Notification *delivery* failure never does. |
| TX-001.09 | `SequenceService.next` is called inside the creating transaction; rollback restores the counter; concurrent callers serialise on the sequence row. |
| TX-001.10 | `recordStandalone` uses its own connection/transaction and so survives rollback of the business transaction; used only for denied/failed/security events. |
| TX-001.11 | The outbox poller (SPEC-012) must claim rows with `FOR UPDATE SKIP LOCKED` so two workers never send the same row twice (design constraint recorded here, implemented in SPEC-012). |
| TX-001.12 | The lock-order rule is binding on all specs; a test helper asserts no spec acquires locks out of order in the concurrency suites. |

## 18. Audit Requirements

SPEC-001 provides the kernel and emits **no domain audit events** of its own (a foundation performs no business action). Event codes for each domain are registered by the owning spec; SPEC-013 owns the consolidated catalogue.

| Event code | Trigger | Fields captured | BRD |
|---|---|---|---|
| (kernel) `AuditService.record` | Any material action by a consuming spec | Actor user/login/type/role, action, event code, category, outcome, entity type/id, related employee/transfer, location/department hints, previous/new value, previous/new status, remarks, metadata, request id, IP, `occurred_at`, `seq` | BRD-022, BRD-037 |
| (kernel) `AuditService.recordStandalone` | Denied/failed/security attempts with no committed business transaction | Same as above with `outcome=DENIED/FAILED` | BRD-026, 027, 037 |
| `TEST_AUDIT_EVENT` | Test environment only | Test fixtures | — |

Guarantees: append-only (trigger + privileges), no credentials (redactor + size cap), actor/request defaults from context, ordering by `seq`, no purge.

## 19. Notification Requirements

SPEC-001 provides the enqueue kernel; it triggers **no business notifications** itself. Events/channels registered (BRD-036) and delivered by SPEC-012:

| Event | Recipient (BRD-036) | Channel | Trigger task (owning spec) | BRD |
|---|---|---|---|---|
| USER_ACCOUNT_CREATED | New user | Email | SPEC-004 | BRD-036 |
| CREDENTIAL_RESET | User | Email | SPEC-004 | BRD-036 |
| TRANSFER_SUBMITTED | Employee | Email + In-app | SPEC-006 | BRD-036 |
| APPROVAL_REQUIRED | Assigned approver | Email + In-app | SPEC-007 | BRD-036 |
| CLARIFICATION_REQUESTED | Employee / responsible user | Email + In-app | SPEC-007/008 | BRD-036, 034 |
| APPROVAL_COMPLETED | Employee | Email + In-app | SPEC-007/008 | BRD-036 |
| TRANSFER_REJECTED | Employee | Email + In-app | SPEC-007/008 | BRD-036, 033 |
| HR_ACTION_REQUIRED | Assigned HR | Email + In-app | SPEC-008 | BRD-036 |
| PAYROLL_TASK_ASSIGNED | Authorised HR | Email + In-app | SPEC-009 | BRD-036 |
| IT_TASK_ASSIGNED | Assigned IT user | Email + In-app | SPEC-009 | BRD-036 |
| TASK_BLOCKED | Employee + relevant assigned users | Email + In-app | SPEC-010 | BRD-036 |
| TRANSFER_COMPLETED | Employee + relevant stakeholders | Email + In-app | SPEC-009 | BRD-036 |

Recipient resolution for "relevant stakeholders" is `[TDD-REQUIRED]` (BRD gap (i)) and is performed by the caller. SPEC-001 guarantees transactional enqueue, idempotency, no I/O and credential-free payloads.

## 20. Error & Edge Cases

| # | Case | Expected |
|---|---|---|
| E-001.01 | Required env var missing/invalid | Process exits non-zero; log lists key names only |
| E-001.02 | `BUSINESS_TIME_ZONE` invalid IANA name | Startup failure |
| E-001.03 | `NODE_ENV=production` without `TLS_ENFORCED=true` | Startup failure |
| E-001.04 | Database down at startup | Fail fast per config; once running, `/ready` 503 while `/live` 200 |
| E-001.05 | DB down mid-request | 503 `SERVICE_UNAVAILABLE` / 500 envelope, no SQL text |
| E-001.06 | Malformed JSON / oversized body | 400 `MALFORMED_JSON` / 413 `REQUEST_ENTITY_TOO_LARGE` |
| E-001.07 | Unmapped unique/FK/check violation | Generic 409/400 envelope; no constraint or table name |
| E-001.08 | Registered constraint violation | Mapped domain error (e.g. `ACTIVE_TRANSFER_ALREADY_EXISTS`) |
| E-001.09 | Audit payload contains `password`/JWT/bcrypt string | Value replaced with `[REDACTED]`; warning logged without the value |
| E-001.10 | Audit payload > 16 KB | `AUDIT_PAYLOAD_TOO_LARGE`, transaction aborts |
| E-001.11 | `record` called without `trx` | Programming error thrown (tests fail) |
| E-001.12 | Direct `UPDATE/DELETE/TRUNCATE` on `audit_logs` | Permission denied for `sdd_app`; trigger exception for any other non-superuser role |
| E-001.13 | Outbox payload contains credential key | Enqueue rejected `NOTIFICATION_PAYLOAD_FORBIDDEN`; transaction aborts |
| E-001.14 | Same `event_key` enqueued twice | Second call inserts nothing, no error |
| E-001.15 | Business transaction rolls back after enqueue | No outbox row persists |
| E-001.16 | Mail/SMTP is down | Business transaction unaffected (SPEC-012 retries later) |
| E-001.17 | Two concurrent creators call `SequenceService.next` | Distinct, gap-free values; second waits for first commit |
| E-001.18 | Sequence beyond 999999 | `SEQUENCE_EXHAUSTED` |
| E-001.19 | Deadlock / serialization failure | Retry up to `TX_MAX_RETRIES` if opted in; else 409 `CONCURRENT_UPDATE` |
| E-001.20 | Lock wait exceeds `lock_timeout` | 409 `RESOURCE_BUSY` |
| E-001.21 | Date util around DST change / year-end / 29 Feb | Correct calendar arithmetic; 30-day inclusive bound exact |
| E-001.22 | Server clock vs business-TZ midnight boundary | `today` evaluated in business TZ (23:30 UTC may already be the next business day) |
| E-001.23 | `pageSize=500`, `page=0`, bad `order` | 400 `VALIDATION_ERROR` |
| E-001.24 | `X-Request-Id` malformed/injection attempt | Replaced by a generated UUID |
| E-001.25 | API 401 on FE | `onUnauthenticated` callback; no redirect loop on repeated 401 |
| E-001.26 | API 403 on FE | `NoAccess`/inline message; session retained |
| E-001.27 | Network error/timeout on FE | `ApiError` `NETWORK_ERROR`/`TIMEOUT` with retry affordance |
| E-001.28 | Rate limit hit | 429 with `Retry-After`; FE shows message, no retry storm |
| E-001.29 | Module imports another module's repository | Lint/boundary check fails CI |
| E-001.30 | Forbidden dependency (SSO/MFA/Redis) added | `check:boundaries` fails |

## 21. Acceptance Criteria

| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-001.AC01 | Given a valid environment, when `npm run dev` starts the backend, then config validates, the DB connects, and `GET /api/v1/health` returns 200 with the success envelope and an `X-Request-Id` header. | NFR-009 |
| SPEC-001.AC02 | Given a missing required env var, when the backend starts, then it exits non-zero and reports the key name without any value. | NFR-004 |
| SPEC-001.AC03 | Given any request/response body containing `password`, `token` or `authorization`, when it is logged or audited, then those values appear as `[REDACTED]`, and bodies are not logged by default. | BRD-025, 037, NFR-003 |
| SPEC-001.AC04 | Given an audit event recorded inside a transaction, when the transaction commits, then exactly one `audit_logs` row exists with actor, role, action, entity, previous/new value, previous/new status, remarks and request id; when it rolls back, no row exists. | BRD-037 |
| SPEC-001.AC05 | Given an existing audit row, when `UPDATE`, `DELETE` or `TRUNCATE` is attempted by the runtime role or through the trigger path, then it fails and the row is unchanged. | BRD-037, NFR-005 |
| SPEC-001.AC06 | Given a transaction that enqueues a notification and then fails, when it rolls back, then no outbox row exists; given it commits while the mail service is down, then the committed data is intact and the row is `PENDING`. | BRD-036 |
| SPEC-001.AC07 | Given the same `dedupeKey`, recipient and channel enqueued twice, when both run, then only one outbox row exists. | BRD-036, NFR-006 |
| SPEC-001.AC08 | Given an enqueue payload containing a credential-like key, when `enqueue` runs, then it is rejected and nothing is stored. | BRD-006 |
| SPEC-001.AC09 | Given the twelve BRD-036 events, when the registry is inspected, then account-creation and credential-reset are Email only and the other ten are Email + In-app. | BRD-036 |
| SPEC-001.AC10 | Given 50 concurrent calls to `SequenceService.next('USER_ID:EMP')`, when all commit, then values are unique and contiguous and `formatBusinessId('EMP', n)` yields `EMP` + 6 digits. | BRD-004 |
| SPEC-001.AC11 | Given a `withTransaction` callback that throws after a write, when the error propagates, then the write is rolled back and the original error is rethrown. | BRD-038 |
| SPEC-001.AC12 | Given two transactions locking the same rows through `lockRowsForUpdate`, when run concurrently, then the second waits or fails with `RESOURCE_BUSY`, and no partial write is visible. | BRD-038, BRD-028 |
| SPEC-001.AC13 | Given a business TZ and a fixed clock, when `isValidEffectiveTransferDate` evaluates today, today+30, today+31 and yesterday, then results are valid, valid, invalid, invalid; weekends/holidays are accepted. | BRD-031 |
| SPEC-001.AC14 | Given the error catalogue, when `INVALID_WORKFLOW_TRANSITION`, `ACTIVE_TRANSFER_ALREADY_EXISTS`, `FILE_SIZE_EXCEEDED`, `UNSUPPORTED_FILE_TYPE`, `INVALID_FILE_TYPE` are thrown, then HTTP status and message equal the BRD text exactly. | BRD-027, 030, 021 |
| SPEC-001.AC15 | Given a Joi validation failure, when the API responds, then it returns 400 `VALIDATION_ERROR` with field-level `details` and the controller is not invoked. | int-standards §3 |
| SPEC-001.AC16 | Given a registered constraint mapper, when the matching unique index is violated, then the mapped domain error is returned; an unmapped violation returns a generic error with no constraint name. | BRD-030 |
| SPEC-001.AC17 | Given pagination parameters, when `pageSize` is omitted / 101 / valid, then the default 20 / 400 / the value is applied, and `meta` carries page, pageSize, total, totalPages. | BRD-002 |
| SPEC-001.AC18 | Given a cross-origin request from a non-allow-listed origin, when received, then CORS headers are not granted; helmet headers are present on all responses. | NFR-004 |
| SPEC-001.AC19 | Given production mode without `TLS_ENFORCED=true`, when the backend starts, then it refuses to start. | NFR-004 |
| SPEC-001.AC20 | Given the frontend shell, when rendered at 1280 px and 800 px, then the sidebar is docked then a drawer, and the skip link, landmarks and role-filtered navigation work. | BRD-002, NFR-008 |
| SPEC-001.AC21 | Given a list screen, when data is loading / empty / failed / forbidden, then `Skeleton`, `EmptyState`, `ErrorState` (with request id and retry) and `NoAccess` are shown respectively. | BRD-002 |
| SPEC-001.AC22 | Given a sensitive action, when the user triggers it, then `ConfirmDialog` appears with focus trapped, Esc closes it, and a required reason blocks confirm when empty. | BRD-002 |
| SPEC-001.AC23 | Given a form with a server field error, when submitted, then the error is shown inline, linked by `aria-describedby`, and focus moves to the first invalid field. | BRD-002, NFR-008 |
| SPEC-001.AC24 | Given every kit component and shell page, when axe runs in CI, then there are zero serious/critical violations. | NFR-008 |
| SPEC-001.AC25 | Given a 401 and a 403 API response, when the client handles them, then 401 invokes `onUnauthenticated` and 403 keeps the session and shows the no-access state. | BRD-026 |
| SPEC-001.AC26 | Given `package.json` and sources, when `check:boundaries` runs, then it fails if SSO/MFA/Redis/queue/HR-integration dependencies or cross-module imports exist. | BRD-025, OQ-19 |
| SPEC-001.AC27 | Given an empty database, when migrations run up, down, up, then they succeed and the three SPEC-001 tables, triggers and grants exist after the second `up`. | BRD-037 |

## 22. Negative Acceptance Criteria

| ID | Given / When / Then | BRD-039 / BRD |
|---|---|---|
| SPEC-001.NAC01 | Given an audit write containing a plaintext, temporary or reset password, token or bcrypt hash, when recorded, then the stored row contains none of them. | BRD-037/025 |
| SPEC-001.NAC02 | Given the application API surface, when scanned/tested, then no route can edit or delete an audit row and no repository exposes update/delete for `audit_logs`. | BRD-037 |
| SPEC-001.NAC03 | Given a simulated notification delivery failure, when it occurs, then the originating transaction remains committed and no workflow transition is repeated. | BRD-036 |
| SPEC-001.NAC04 | Given an outbox retry, when enqueue re-runs with the same key, then no duplicate row or duplicate transition is created. | BRD-036 / NFR-006 |
| SPEC-001.NAC05 | Given a stack trace, SQL or table name in a thrown error, when the production response is built, then none appear in the body. | BRD-026 spirit |
| SPEC-001.NAC06 | Given a request with an unknown body field, when validated, then it is rejected, not silently stripped. | int-standards §3 |
| SPEC-001.NAC07 | Given an Express 5 request, when `validate` runs, then it does not mutate read-only `req.query`; validated data is read from `req.validated`. | — |
| SPEC-001.NAC08 | Given `pageSize=101` or `order=sideways`, when requested, then it is rejected with 400, not clamped. | BRD-002 |
| SPEC-001.NAC09 | Given a date 31 days ahead or yesterday, when checked, then `isValidEffectiveTransferDate` is false regardless of caller role. | BRD-031 |
| SPEC-001.NAC10 | Given two concurrent transactions each taking the last unit through the foundation lock helper and a CHECK constraint (test table), when both attempt to commit, then only one succeeds, and the counter never goes negative. | BRD-039 vacancy rows (infrastructure level) |
| SPEC-001.NAC11 | Given a failed callback inside `withTransaction`, when after-commit hooks were registered, then they do not run. | BRD-036/038 |
| SPEC-001.NAC12 | Given the frontend hides a menu for a role, when the API is called directly, then enforcement is by the backend (verified in SPEC-002); the shell contains no security-decision logic. | BRD-026, BRD-039 security rows |
| SPEC-001.NAC13 | Given any log line captured during tests, when scanned, then it contains no `Authorization` header, cookie or request body. | BRD-025 |
| SPEC-001.NAC14 | Given a `demo` seeder, when run with `NODE_ENV=production`, then it refuses; no seeder contains a default password. | BRD-005/006 |
| SPEC-001.NAC15 | Given any source using `sequelize.sync()`, when the CI guard test runs, then it fails. | FR-001.25 |

## 23. Testing Requirements

Tools: Jest + ts-jest + supertest + real PostgreSQL test DB (`sdd_v1_test`) for the backend; Jest or Vitest + React Testing Library + `jest-axe` for the frontend. Tests are written first (RED) per constitution.

| Type | TC IDs | Coverage |
|---|---|---|
| Unit (BE) | TC-001.01 config loader validation/fail-fast; TC-001.02 redactor matrix (keys, nested, arrays, JWT/bcrypt strings, case variants); TC-001.03 error classes/catalogue verbatim messages; TC-001.04 pagination parser; TC-001.05 `businessDate` matrix (DST, leap day, month/year end, TZ boundary, +30 inclusive, injectable clock); TC-001.06 `formatBusinessId`/overflow; TC-001.07 request-id sanitiser; TC-001.08 status/role constants vs CHECK sync | FR-001.11–24, 55–59 |
| Integration (BE+DB) | TC-001.09 migrations up/down/up; TC-001.10 `audit_logs` insert/ordering/index use; TC-001.11 outbox unique dedupe + dispatch index; TC-001.12 `id_sequences` atomic increment; TC-001.13 constraint mapper end-to-end; TC-001.14 health `/ready` with DB up/down | §10 |
| API (supertest) | TC-001.15 envelope shapes success/error/paginated; TC-001.16 404/400/413/429/500 mapping; TC-001.17 validation middleware (`req.validated`, unknown keys); TC-001.18 helmet/CORS/rate-limit headers; TC-001.19 `X-Request-Id` echo; TC-001.20 production error-body hygiene | §12 |
| Frontend | TC-001.21 `FormField`/inputs; TC-001.22 `DataTable` sort/page/search/URL state + loading/empty/error; TC-001.23 `ConfirmDialog` focus trap/Esc/reason; TC-001.24 `Toast` live regions; TC-001.25 layout shell responsive + role-filtered nav; TC-001.26 http-client envelope/`ApiError`/401/403/network handling; TC-001.27 error/loading/not-found/no-access pages | FR-001.60–72 |
| Accessibility | TC-001.28 axe on every component and page; TC-001.29 keyboard-only navigation of shell/table/dialog; TC-001.30 contrast token check; TC-001.31 reduced-motion | NFR-008 |
| Security | TC-001.32 log/audit/outbox credential scan (golden log capture); TC-001.33 audit `UPDATE/DELETE/TRUNCATE` denial (runtime role + trigger path); TC-001.34 outbox payload guard; TC-001.35 production TLS guard; TC-001.36 no stack/SQL leakage; TC-001.37 boundary check (forbidden deps, cross-module import); TC-001.38 no hard-coded credentials scan (`config.json` removed) | BRD-025/037, NFR-003/004/005 |
| Concurrency | TC-001.39 50× parallel `SequenceService.next`; TC-001.40 two-transaction last-unit race with CHECK (test table); TC-001.41 deadlock/lock-order test with retry; TC-001.42 lock timeout → `RESOURCE_BUSY` | BRD-038 |
| Workflow (kernel) | TC-001.43 canonical transaction shape: rollback leaves no audit/outbox rows; commit leaves both; after-commit hooks run only on commit; `InvalidWorkflowTransitionError` mapping | BRD-027/036/037 |
| Negative | TC-001.44 … TC-001.58 map one-to-one to SPEC-001.NAC01 … NAC15 | §22 |
| Acceptance | TC-001.59 … TC-001.85 map one-to-one to SPEC-001.AC01 … AC27 | §21 |

Mandatory evidence for Gate 2: green `lint`, `typecheck`, `test:coverage` (threshold set by the Gate 2 reviewer; none invented here), axe report, migration up/down/up log.

## 24. Definition of Done

- [ ] All TASK-001.01 – TASK-001.31 complete; every TC-001.* passing; RED → GREEN history visible.
- [ ] Gate 1 approved (no Changes Requested open) before implementation start; Gate 2 reviewer recorded.
- [ ] `config.json` with hard-coded credentials removed; no secret in repo; `.env.example` complete and checked against the loader schema.
- [ ] `audit_logs` immutable (trigger + privileges verified by tests); no credentials in logs/audit/outbox (golden-log scan green).
- [ ] Outbox enqueue is transactional and idempotent; no network I/O in transactions.
- [ ] `withTransaction`, lock helpers, lock-order document and canonical transaction shape merged and documented in `docs/`.
- [ ] Error catalogue contains the BRD-defined codes/messages verbatim.
- [ ] Business-date utility matches BRD-031 across the test matrix.
- [ ] UI kit, DataTable, state components, layout shell implemented; axe zero serious/critical; keyboard tests pass.
- [ ] Health endpoints, graceful shutdown, security middleware verified.
- [ ] Migration up/down/up on an empty DB passes in CI; no `sync()` anywhere.
- [ ] Local setup documented and reproducible on a clean machine.
- [ ] Open TDD items below recorded as decided, or carried forward with owner and gate.
- [ ] `status.md`, dashboard, spec, review record and `prompt_history.md` synchronised (by workflow, not by this spec).

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-001.01 | Transport/data-protection arrangement for local deployment (TLS termination, certificates, at-rest encryption of DB and document storage) — NFR-004 gives no mechanism. | TLS terminated by a reverse proxy with an internally issued certificate; HSTS enabled; `DB_SSL=true` when the DB is on another host; OS/volume-level disk encryption for DB and document folder; `TLS_ENFORCED=true` in production. | Production start-up guard, cookies/HSTS, SPEC-002/011/015 |
| TDD-001.02 | Value of the "application/server-configured business time zone" (BRD-031). | Required `BUSINESS_TIME_ZONE` env var set by the organisation (IANA name); `UTC` only in dev/test. | Effective-date validity near midnight, SPEC-006/008/009 |
| TDD-001.03 | Named accessibility standard and portal design standard (NFR-008 "organisational portal design and accessibility standards"). | WCAG 2.1 AA; organisation design tokens swapped into `globals.css` when supplied. | UI kit acceptance, axe rule set |
| TDD-001.04 | **Same decision as TDD-012.04 (master)** - see it for options and the recommended default. ONE merged Gate 1 decision, master ID **TDD-012.04** (= TDD-001.04 = TDD-004.07), remains TDD-REQUIRED. Options: (A) encrypted short-lived secret store (AES-256-GCM `notification_secrets`, consumed/overwritten on send); (B) in-memory hand-off: credential held only in process memory and sent synchronously after commit, never written to PostgreSQL/outbox/log/audit, failure recovered by administrator credential reset (BRD-007); (C) regenerate-on-send (rejected: the temp password is already hashed at creation). Recommended default `[PROPOSED]`: **B**, because BRD-006 says plaintext must never be persisted in PostgreSQL and a reversible ciphertext plus env key in the same database is a weaker reading of that sentence; A is the documented fallback if the business requires automatic retry of the first-contact email. Impact: SPEC-001 outbox, SPEC-004 creation/reset flow, SPEC-012 dispatcher (`notification_secrets`, FR-012.31-33 apply only if A is chosen), SPEC-002 first login. How initial/reset credentials reach the user by Email without persisting plaintext in PostgreSQL, logs or audit (BRD-005/006 vs outbox). | Credential emails are sent by a **direct, non-persisted send** after commit (credential held in memory only, never in outbox/log/audit); the outbox row stores only the event reference; on send failure the admin is told to run a credential reset. Alternative: encrypted short-lived payload. Gate 1 to confirm. | SPEC-004, SPEC-012, SPEC-002 **[DECIDED 2026-10-07 — Option B]** Approved: in-memory handoff, no plaintext persistence (PostgreSQL, logs, audit, files, any storage); only the hash is stored; plaintext held in memory only for delivery via the approved channel, unrecoverable afterwards; valid until first successful login, then forced change, after which the temporary hash no longer authenticates. Option A (`notification_secrets`) is not selected. Source: decision text supplied by the spec author; the formal Gate 1 record is still to be captured in `pr_reviews/GATE1-*`. |
| TDD-001.05 | Is local DB role separation (`sdd_migrator` vs `sdd_app`) mandatory for the local deployment? | Mandatory outside developer laptops; on laptops one login is allowed provided the trigger stays active. | Strength of append-only guarantee (BRD-037) |
| TDD-001.06 | Supported Node.js and PostgreSQL versions. | Node.js current LTS pinned in `.nvmrc`; PostgreSQL ≥ 13 (core `gen_random_uuid()`), 15/16 recommended. | Setup, CI image |
| TDD-001.07 | Super Admin bootstrap mechanism (BRD assumes one exists; no default credentials may be committed). | One-time CLI command (`npm run bootstrap:super-admin`) reading the initial secret from env/prompt, forcing first-login password change. Owned by SPEC-002/004. | First deployment |
| TDD-001.08 | Is tamper-*evidence* (hash chaining, external anchoring) required beyond append-only controls (NFR-005 "tamper-resistant")? | Not in v1; trigger + privilege separation + revoked UPDATE/DELETE; revisit in SPEC-013/015. | Audit assurance level |
| TDD-001.09 | API timeout, DB statement timeout, expected concurrency/volume and response-time targets (BRD-038 "to be confirmed"). | Placeholder 30 s API/DB timeout in config only; targets supplied by performance planning; request duration already logged. | SPEC-015/016 performance validation |
| TDD-001.10 | Numeric defaults for general API rate limiting (BRD-025 covers only account lockout). | Conservative per-IP window limit in config, stricter limiter for auth routes; values set at deployment planning. | Availability vs abuse protection |
| TDD-001.11 | Should an audit-write failure always abort the request (FR-001.42 proposes yes) including audited reads such as document access? | Abort for every mutating action, and for audited reads fail the request too since BRD-021 requires auditing access. | Availability vs BRD-037 compliance |
| TDD-001.12 | Prefixes/formats of business identifiers not defined by BRD (Receiving Manager and Super Admin User ID; transfer reference; payroll reference; vacancy reference). | Helper is generic; owners decide (SPEC-004/006/009/005); recommended one `id_sequences` row per prefix. | Uniqueness and display formats |

## Out of Scope (this SPEC)

Per BRD "Out of Scope" and SPEC boundaries, SPEC-001 does **not** include and introduces none of: replacement of HR/payroll/IT-service-management platforms; a payroll calculation engine, identity provider or enterprise master-data platform; automatic HR-system integration/synchronisation (real-time, scheduled, callback) or updates to an external HR master (BRD-OQ-19); the Facilities/Admin role and tasks; external recruitment, cross-company transfer or relocation processing; historical data migration/bulk backfill; workforce planning/forecasting; **MFA/SSO** (BRD-025). Also excluded here and owned elsewhere: authentication/session/RBAC (SPEC-002), master data (SPEC-003), user provisioning (SPEC-004), vacancy engine (SPEC-005), transfer entity/eligibility (SPEC-006), workflow engine (SPEC-007–010), documents (SPEC-011), notification templates/dispatch/in-app inbox (SPEC-012), audit viewing/export/scoping (SPEC-013), dashboards/reports/escalation (SPEC-014), NFR hardening and numeric performance/backup/monitoring targets (SPEC-015, NFR-009), QA/UAT/traceability (SPEC-016). Also excluded: Docker/Compose/PM2/Kubernetes packaging (no such target selected), Redis/queues, OpenAPI/Swagger publication (optional, not BRD-required), APM product selection.
