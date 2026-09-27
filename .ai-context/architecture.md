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
├── frontend/                     # Next.js (TypeScript, App Router, Tailwind)
│   └── src/
│       └── app/
│           ├── layout.tsx        # Root layout, entry point
│           ├── page.tsx          # Root page
│           └── globals.css
└── backend/                      # Express (TypeScript) + Sequelize
    └── src/
        ├── index.ts              # Server entry point
        ├── config/
        │   └── config.json       # Sequelize DB config (dev/test/prod)
        ├── models/                # Sequelize models
        ├── controllers/           # Route handlers
        ├── routes/                # Express routers
        ├── middlewares/           # Auth/validation/error middlewares
        ├── services/              # Business logic
        ├── migrations/            # Sequelize migrations
        └── seeders/               # Sequelize seeders
```

## Module Boundaries
- **frontend/**: Next.js app, owns UI, routing (App Router), and client-side state.
  Consumes the backend via HTTP (base URL configured via environment variable).
- **backend/**: Express API, owns business logic, persistence (PostgreSQL via
  Sequelize), and authentication (JWT).

## Entry Points
- Frontend dev server: `frontend/src/app/layout.tsx` (via `npm run dev` in `frontend/`)
- Backend server: `backend/src/index.ts` (via `npm run dev` in `backend/`), exposes
  `GET /health`.

## Data Layer
- Sequelize CLI configured via `backend/.sequelizerc`.
- Config: `backend/src/config/config.json` (development/test/production PostgreSQL
  connections — placeholder credentials, must be overridden via environment/local
  config before use).
- Migrations: `backend/src/migrations/` (empty — no models defined yet).

## Notes
This file must be re-synced (directory tree re-scanned) whenever the execution layer
structure changes materially (new top-level modules, new services).
