# Backend Architecture (Target Design)

> Status: **Target / reference architecture** — describes the enterprise-grade backend
> the project is designed to grow into. It is domain-agnostic; no business-specific
> functionality is defined here. Business modules live under `backend/src/modules/`.
> This document does not itself authorize implementation — module code still follows
> the SDD lifecycle (Spec → Gate 1 → Plan → Tasks → TDD → Gate 2) defined in
> `AGENTS.md`. See `.ai-context/architecture.md` for the currently scanned/actual
> repository structure.

## 1. Technology Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL + Sequelize ORM
- Joi / Celebrate for validation
- JWT authentication, bcrypt for password hashing
- Winston for structured logging
- Helmet, CORS, Express Rate Limit
- Swagger / OpenAPI 3
- Jest, ESLint, Prettier, Husky
- Docker, PM2
- Environment-based configuration

Optional (added only when actually required, not pre-installed):
Redis, background jobs / queues, message queues, event-driven processing,
object/file storage, email/SMS integrations, external APIs, APM/monitoring.

## 2. Architecture Pattern

Modular Layered Architecture. Every business module follows a strict, one-way
dependency chain:

```text
Route → Middleware → Validation → Controller → Service → Repository → Model/ORM → PostgreSQL
```

Rules:
- Controllers never access Sequelize models directly.
- Routes never contain business logic.
- Repositories never contain business rules.
- Models never call services.

## 3. Root Project Structure (target)

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env/
│   │   ├── database/
│   │   ├── logger/
│   │   ├── security/
│   │   ├── swagger/
│   │   └── index.ts
│   ├── modules/
│   ├── routes/
│   ├── middlewares/
│   ├── common/
│   ├── utils/
│   ├── errors/
│   ├── integrations/
│   ├── jobs/
│   ├── events/
│   ├── cache/
│   ├── docs/
│   ├── templates/
│   └── types/
├── tests/
├── scripts/
├── tools/
├── logs/
├── coverage/
├── dist/
├── .github/workflows/
├── .husky/
├── .env.example
├── .env.development
├── .env.test
├── .env.production
├── .gitignore
├── .dockerignore
├── .editorconfig
├── .prettierrc
├── eslint.config.js
├── commitlint.config.js
├── tsconfig.json
├── jest.config.js
├── package.json
├── Dockerfile
├── docker-compose.yml
├── ecosystem.config.js
└── README.md
```

## 4. Module Architecture

Every module under `src/modules/<module-name>/` is self-contained:

```text
src/modules/<module-name>/
├── routes/
│   ├── index.ts
│   └── module.routes.ts
├── controllers/
│   ├── create.controller.ts
│   ├── get.controller.ts
│   ├── list.controller.ts
│   ├── update.controller.ts
│   └── delete.controller.ts
├── services/
│   ├── create.service.ts
│   ├── get.service.ts
│   ├── list.service.ts
│   ├── update.service.ts
│   └── delete.service.ts
├── repositories/
│   ├── create.repository.ts
│   ├── get.repository.ts
│   ├── list.repository.ts
│   ├── update.repository.ts
│   └── delete.repository.ts
├── models/
│   └── module.model.ts
├── validations/
│   ├── create.validation.ts
│   ├── update.validation.ts
│   ├── params.validation.ts
│   └── query.validation.ts
├── types/
│   └── module.types.ts
├── constants/
│   └── index.ts
└── index.ts
```

Files are created only when they have a clear responsibility — do not pad the
structure with empty files just to match the template.

## 5. Controller Layer

May: read params, read authenticated user context, call a service, return a
standardized response.
Must not: run Sequelize queries, contain business rules, perform complex
transformations, or call models directly.

## 6. Service Layer

Contains application/business logic: business rules, repository coordination,
transaction management, external integration calls, event triggers,
notification triggers, background job scheduling, and domain-context
authorization checks. Must not depend on Express `req`/`res`.

## 7. Repository Layer

Persistence only: Sequelize queries, pagination, filtering, sorting, attribute
selection, includes/relations, transactions, DB-specific operations. No HTTP
handling, no business rules.

## 8. Database Architecture

```text
src/config/database/
├── connection.ts
├── index.ts
├── migrations/
└── seeders/
```

- Connection pooling, environment-specific config, SSL support, transactions
- Migration-based schema management (no auto-sync in production)
- Seeders, proper indexes, foreign keys, unique constraints
- Soft deletion where appropriate, timestamps, UUID primary keys where appropriate

## 9. Authentication

JWT-based, reusable and extensible: login, JWT verification, access tokens,
password hashing, authentication middleware, current-user context, token
expiration, secure secret management. Architecture leaves room for refresh
tokens later. Secrets are never hardcoded.

## 10. Authorization

```text
Authentication → Role Check → Permission Check → Resource-Level Authorization
```

Reusable middleware: `authenticate()`, `authorizeRoles(...)`,
`authorizePermissions(...)`. Roles/permissions are configurable, not
hardcoded into global infrastructure.

## 11. Validation

All external input (body, query, params, headers where required) is validated
with Joi/Celebrate before controllers execute. Unknown/unexpected fields are
rejected where appropriate.

## 12. Global Error Handling

```text
errors/
├── app-error.ts
├── validation-error.ts
├── authentication-error.ts
├── authorization-error.ts
├── not-found-error.ts
├── conflict-error.ts
└── index.ts
```

Flow: `Request → Application → Error → Global Error Middleware → Structured
Error Response`. Production responses never expose stack traces, DB errors,
internal paths, credentials, or secrets.

## 13. Standard API Response

Success:
```json
{ "success": true, "message": "Operation completed successfully", "data": {} }
```

Paginated:
```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": [],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

Error:
```json
{
  "success": false,
  "error": { "code": "RESOURCE_NOT_FOUND", "message": "Resource not found" },
  "requestId": "uuid",
  "timestamp": "ISO-8601"
}
```

## 14. Security

Helmet, CORS allowlist, rate limiting, request size limits, input
validation/sanitization, secure headers, JWT verification, password hashing,
environment-based secrets, sensitive-field redaction, request correlation
IDs, secure error responses. Never log passwords, tokens, OTPs, API secrets,
Authorization headers, or sensitive personal data.

## 15. Logging

Structured Winston logging. Per-request fields: `requestId`, `timestamp`,
`method`, `path`, `statusCode`, `duration`, `service`, `environment`. Errors
carry additional safe debugging context. Levels: `error`, `warn`, `info`,
`debug`.

## 16. External Integrations

```text
src/integrations/
├── http/
├── email/
├── sms/
├── storage/
├── payment/
└── third-party/
```

Business services reach external systems only through integration adapters.
Reusable HTTP client: timeout, error normalization, request ID propagation,
auth headers, safe logging, retries only where safe.

## 17. Background Processing

```text
src/jobs/
├── queues/
├── workers/
├── schedulers/
└── cron/
```

Added only when required; ready for BullMQ/Redis or another queue
implementation later.

## 18. Event Architecture

```text
src/events/
├── publishers/
├── subscribers/
└── handlers/
```

```text
Service → Event → Event Handler → { Notification | Audit | Background Job }
```

Modules publish domain events without tightly coupling to unrelated modules.

## 19. Cache Architecture

```text
src/cache/
├── cache.interface.ts
├── cache.service.ts
└── redis.ts
```

Application code depends on the cache abstraction, not Redis directly. Redis
remains optional.

## 20. API Documentation

OpenAPI 3, structured as:

```text
src/docs/
├── openapi.yaml
├── paths/
├── schemas/
├── parameters/
├── responses/
└── security/
```

Every production API documents method, path, description, auth, permissions,
request, parameters, responses, and error responses.

## 21. Testing

```text
tests/
├── unit/
├── integration/
├── e2e/
├── fixtures/
├── mocks/
└── setup/
```

Jest. Priority coverage: services, authorization, validation, critical
repositories, authentication, error handling, critical API workflows.

## 22. Environment Configuration

`.env.development`, `.env.test`, `.env.production`, `.env.example`.
Environment variables are validated at startup; the app fails fast on
missing/invalid config. Production secrets are never committed.

## 23. Health APIs

```text
GET /api/v1/health
GET /api/v1/health/live
GET /api/v1/health/ready
```

Liveness is separate from dependency readiness; no sensitive infrastructure
details are exposed publicly.

## 24. API Versioning

All APIs are versioned (`/api/v1/...`), with room to add `/api/v2/...`
without rewriting existing v1 endpoints.

## 25. Graceful Shutdown

Handles `SIGTERM`/`SIGINT`:

```text
Stop accepting requests → Finish active requests → Stop workers →
Close queue connections → Close Redis → Close database → Exit process
```

## 26. Docker and Deployment

`Dockerfile` (multi-stage where appropriate), `.dockerignore`,
`docker-compose.yml`, PM2 ecosystem config. Application is stateless
wherever possible; no important data stored inside the app container.

## 27. CI/CD Readiness

```text
Install → Lint → Type Check → Unit Tests → Integration Tests → Build →
Security Checks → Docker Build → Deploy → Health Check
```

## 28. Code Quality

TypeScript strict mode, ESLint, Prettier, Husky, lint-staged, commitlint,
Conventional Commits. Avoid: `any` (unless unavoidable), circular
dependencies, duplicate logic, giant utility/controller/service files,
hardcoded configuration, business logic in routes, direct DB access outside
repositories.

## 29. Architecture Principles

Separation of concerns, Single Responsibility, dependency inversion where
valuable, DRY without premature abstraction, KISS, secure-by-default,
configuration over hardcoding, modular boundaries, testability,
observability, maintainability, horizontal scalability. No microservices,
Kafka, Kubernetes, CQRS, or event sourcing unless justified by actual
requirements.

## 30. Current State vs. Target

The currently scanned backend (see `.ai-context/architecture.md`) is a
minimal skeleton: `index.ts`, `config/config.json`, `models/`,
`controllers/`, `routes/`, `middlewares/`, `services/`, `migrations/`,
`seeders/`, exposing `GET /health`. It has not yet adopted: the
`modules/` structure, `app.ts`/`server.ts` split, repository layer, Joi
validation, centralized error architecture, Winston logging, Swagger docs,
`errors/`, `integrations/`, `jobs/`, `events/`, `cache/`, or versioned
(`/api/v1`) routing.

Moving the actual codebase toward this target architecture is an
implementation change and follows this repository's SDD lifecycle
(spec → Gate 1 peer review → plan → tasks → TDD → Gate 2 review) rather than
being applied directly from this document.
