# Project Constitution

> No BRD has been ingested yet. This constitution will be regenerated from the BRD's
> Constitution / Engineering Constitution section once a BRD is supplied via `docs/`
> and processed by `/int-brd-ingestion`. Until then, the sections below hold only the
> organization-wide INT defaults referenced by `.agent/rules/int-standards.md`; they
> are placeholders, not project-specific constraints, and must not be treated as
> approved requirements.

## Governance Flow
- BRD Preparation → Gate 0: BRD Review (Project Manager / Business Analyst) →
  Gate 1 (Spec Peer Review) → Gate 2 (Code Review) → Development / Implementation.
- Gate 0 is the first review gate and the only BRD review gate. The project cannot
  proceed to Gate 1 until Gate 0 is approved.
- Requested BRD changes require a BRD update and resubmission for Gate 0.
- Gate 0 decisions are recorded (reviewer, review date, status, comments,
  approval/rejection) in `.ai-context/pr_reviews/BRD-<timestamp>.md`.
- Gate 0, Gate 1, and Gate 2 reviewers are assigned separately in
  `.ai-context/project_context.md`. A Gate 0 reviewer holds no Gate 1 or Gate 2
  authority unless separately assigned.

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
