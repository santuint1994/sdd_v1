# Project Context

## Project Name
sdd_v1

## Project Type
Full Stack

## Architecture Style
Modular Monolith (microservice-ready)

## Frontend Technology & Styling
Next.js (TypeScript, App Router) + Tailwind CSS

## Backend Technology & Framework
Node.js + Express (TypeScript)

## Database & ORM Layer
PostgreSQL + Sequelize (`sequelize-cli`, config at `backend/src/config/config.json`,
migrations at `backend/src/migrations/`, models at `backend/src/models/`)

## Authentication & Security Strategy
JWT (`jsonwebtoken`, `bcryptjs` for password hashing)

## Deployment Target
Local setup (no cloud/Docker deployment target selected yet)

## Governance Aspect & Reviewer Roster

> **ACTION REQUIRED**: The fields below are placeholders. Real names and emails must
> be provided before Gate 1 / Gate 2 reviews can be validated — reviewer identity is
> checked by email match against `git config user.email`.

- **Technical Lead / Architect (Gate 2 Reviewer):** Supratim Jetty — supratim.jetty@intglobal.com
- **Project Manager / Product Owner (Gate 1 Reviewer):** Supratim Jetty — supratim.jetty@intglobal.com
- **Senior Software Engineer / Spec Author:** Santu Pradhan — santu.pradhan@intglobal.com
- **Git Developer Email Alignment:** Local `git config user.email` =
  `santu.pradhan@intglobal.com` (Santu Pradhan) — confirm this matches one of the
  roster roles above.

## Notes
- No BRD has been ingested yet. Run `/int-brd-ingestion` after placing a BRD file in
  `docs/`.
- Directory structure below is scanned from disk after CLI scaffolding; see
  `.ai-context/architecture.md` for the authoritative tree.
