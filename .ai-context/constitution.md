# Project Constitution

> No BRD has been ingested yet. This constitution will be regenerated from the BRD's
> Constitution / Engineering Constitution section once a BRD is supplied via `docs/`
> and processed by `/int-brd-ingestion`. Until then, the sections below hold only the
> organization-wide INT defaults referenced by `.agent/rules/int-standards.md`; they
> are placeholders, not project-specific constraints, and must not be treated as
> approved requirements.

## Testing Discipline
- Test-first (TDD) discipline: tests are written before implementation (RED → GREEN).
- Automated tests live under `tests/frontend/` and `tests/backend/`.
- No feature proceeds to Gate 2 review without passing test coverage for its
  acceptance criteria.

## Security Posture
- No hardcoded secrets, API keys, or credentials; all secrets read from environment
  variables (`.env`, never committed).
- JWT-based authentication (per project setup selection), payload validation and
  sanitization required on all inputs.

## Architectural Constraints
- Modular Monolith, microservice-ready.
- Frontend: Next.js (TypeScript). Backend: Express (TypeScript) with Sequelize ORM
  over PostgreSQL.

## Non-Functional Baselines
- Not yet defined by a BRD. To be populated during BRD ingestion.

## Versioning Rules
- Releases follow semantic versioning (`vX.Y.Z`) as tracked in
  `.ai-context/releases/`.
