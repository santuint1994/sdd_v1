# Architecture

## Style
Modular Monolith, microservice-ready. Frontend and backend are separate deployable
units within a single repository.

## Generated Directory Structure (scanned from disk after CLI scaffolding)

```text
sdd_v1/
├── AGENTS.md
├── .gitignore
├── .agent/
│   ├── rules/
│   ├── workflows/
│   └── skills/
├── .ai-context/
│   ├── constitution.md
│   ├── project_context.md
│   ├── architecture.md
│   ├── BRD.md
│   ├── assumptions.md
│   ├── brd-change-log.md
│   ├── status.md
│   ├── prompt_history.md
│   ├── specs/
│   ├── plans/
│   ├── tasks/
│   ├── test_cases/
│   ├── pr_reviews/
│   ├── decisions/
│   ├── incidents/
│   ├── hotfixes/
│   ├── releases/
│   ├── change_requests/
│   └── templates/
├── docs/
├── tests/
│   ├── frontend/
│   └── backend/
├── frontend/                     # Next.js (TypeScript, App Router, Tailwind) — FRONTEND ONLY
│                                  # See .ai-context/Frontend-Architecture.md for the
│                                  # full frontend structure and boundaries.
└── backend/                      # Express (TypeScript) + Sequelize — SEPARATE APPLICATION
                                   # See .ai-context/Backend-Architecture.md for the
                                   # full backend structure, layering rules, and target
                                   # architecture (current vs. target state).
```

## Module Boundaries
- **frontend/**: Next.js app (App Router), owns UI, routing, and client-side state.
  Consumes the backend via HTTP only; no direct database or server-side backend
  logic. Full frontend internal structure and boundaries are maintained in
  `.ai-context/Frontend-Architecture.md`, not here.
- **backend/**: Express API, owns business logic, persistence (PostgreSQL via
  Sequelize), and authentication (JWT). Fully independent, separately deployable
  application — the frontend has no direct database or server-side backend logic.
  Full backend internal structure and layering rules are maintained in
  `.ai-context/Backend-Architecture.md`, not here.

## Entry Points
- Frontend dev server: `frontend/src/app/layout.tsx` (via `npm run dev` in `frontend/`)
- Backend server: `backend/src/index.ts` (via `npm run dev` in `backend/`), exposes
  `GET /health`.

## Data Layer
Backend data-layer details (Sequelize config, migrations, seeders) are documented
in `.ai-context/Backend-Architecture.md` (§8 Database Architecture).

## Notes
This file must be re-synced (directory tree re-scanned) whenever the execution layer
structure changes materially (new top-level modules, new services).
