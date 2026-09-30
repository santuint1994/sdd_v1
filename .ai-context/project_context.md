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

> Reviewer identity is checked by email match against `git config user.email`.
> Names and emails must not be invented.

### Governance Flow

BRD Preparation → **Gate 0: BRD Review (Project Manager / Business Analyst)** →
Gate 1 (Spec Peer Review) → Gate 2 (Code Review) → Development / Implementation /
Release.

Gate 0 is the first and only BRD review gate. Gate 1 reviews feature specs, not the
BRD.

### Reviewer Roster

- **Project Manager and/or Business Analyst (Gate 0 Reviewer — BRD Review):**
  Shamik Bhattacharya — shamik.bhattacharya@intglobal.com. Gate 0 does not
  inherit Gate 1 or Gate 2 authority.
- **Technical Lead / Architect (Gate 2 Reviewer):** Santu Pradhan — santu.pradhan@intglobal.com
- **Project Manager / Product Owner (Gate 1 Reviewer):** Shamik Bhattacharya — shamik.bhattacharya@intglobal.com
- **Senior Software Engineer / Spec Author:** Santu Pradhan — santu.pradhan@intglobal.com

### Approval Matrix

| Gate | Artifact | Reviewer Role | Approves | Assigned Person (email) |
|---|---|---|---|---|
| Gate 0 | `.ai-context/BRD.md` | Project Manager and/or Business Analyst | BRD progression to Gate 1 | Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) |
| Gate 1 | `.ai-context/specs/<slug>.spec.md` | Project Manager / Product Owner | Spec approval | Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) |
| Gate 2 | Code diff and tests | Technical Lead / Architect | Code review and release readiness | Santu Pradhan (santu.pradhan@intglobal.com) |

### Gate Rules

1. The project cannot proceed to Gate 1 until Gate 0 is approved.
2. If the Project Manager or Business Analyst requests changes, the BRD must be
   updated and resubmitted for Gate 0 review.
3. Gate 0 approval or rejection is recorded in the governance history
   (`.ai-context/pr_reviews/BRD-<timestamp>.md`, `.ai-context/dashboard.html`,
   `.ai-context/status.md`, `.ai-context/prompt_history.md`) with the reviewer,
   review date, status, comments, and approval/rejection information.
4. A Gate 0 reviewer does not automatically receive Gate 1 or Gate 2 approval
   authority unless separately assigned above. A person holding more than one role
   must be listed explicitly under each gate.
5. Gate 0, Gate 1, and Gate 2 responsibilities stay separate: Gate 0 checks the BRD,
   Gate 1 checks the spec, Gate 2 checks the code.

### Git Identity

- **Git Developer Email Alignment:** Local `git config user.email` =
  `santu.pradhan@intglobal.com` (Santu Pradhan) — confirm this matches one of the
  roster roles above.

## Notes
- The BRD has been ingested and is awaiting Gate 0 review. See
  `.ai-context/BRD.md` and `.ai-context/status.md`.
- Directory structure below is scanned from disk after CLI scaffolding; see
  `.ai-context/architecture.md` for the authoritative tree.
