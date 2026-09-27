# Frontend Architecture

> See `.ai-context/architecture.md` for the high-level system view and
> `.ai-context/Backend-Architecture.md` for the backend counterpart.

## Stack

- Next.js (TypeScript, App Router)
- Tailwind CSS
- Redux Toolkit (global state)
- React Context (scoped state, e.g. auth)
- Axios (HTTP client)

## Target Structure (global, domain-agnostic)

Reusable across projects — no domain-specific folders (`users`, `employees`,
`dashboard`, `HR`, `products`, `orders`, ...). Those are introduced later
according to the application being built. There is no `app/api` layer,
since the backend is assumed to be a separate application.

```text
nextjs-frontend/
│
├── public/
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── assets/
│
├── src/
│   │
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   │
│   ├── assets/                      # Imported application assets
│   │   ├── images/
│   │   ├── icons/
│   │   ├── fonts/
│   │   └── styles/
│   │
│   ├── components/                  # Global reusable components
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── forms/
│   │   └── common/
│   │
│   ├── context/                     # React Context
│   │
│   ├── data/                        # Static/configuration data
│   │
│   ├── hooks/                       # Global custom hooks
│   │
│   ├── redux/                       # Global state management
│   │   ├── store.ts
│   │   ├── hooks.ts
│   │   └── slices/
│   │
│   ├── services/                    # External backend communication
│   │   ├── http-client.ts
│   │   └── interceptors.ts
│   │
│   ├── providers/                   # Application providers
│   │
│   ├── types/                       # Global TypeScript definitions
│   │
│   ├── interfaces/                  # Shared interfaces
│   │
│   ├── constants/                   # Application-wide constant values
│   │
│   ├── config/                      # Application configuration
│   │
│   ├── utils/                       # Utility/helper functions
│   │
│   ├── validations/                 # Shared validation schemas
│   │
│   └── styles/                      # Shared/global styles
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── mocks/
│   └── fixtures/
│
├── .github/
│   └── workflows/
│
├── .husky/
│
├── .env.example
├── .env.local
├── .env.development
├── .env.staging
├── .env.production
│
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── next.config.ts
├── tsconfig.json
├── package.json
├── package-lock.json
└── README.md
```

### Global responsibility

| Directory | Global responsibility |
|---|---|
| `app` | Routing, pages, layouts, loading/error boundaries |
| `assets` | Imported images, icons, fonts and styles |
| `components` | Reusable application components |
| `context` | React Context-based shared state |
| `data` | Static/local application data |
| `hooks` | Reusable React hooks |
| `redux` | Global Redux state |
| `services` | Communication with external services/backend |
| `providers` | Global React providers |
| `types` | Shared TypeScript types |
| `interfaces` | Shared object/interface contracts |
| `constants` | Application-wide constant values |
| `config` | Runtime/application configuration |
| `utils` | Generic reusable helper functions |
| `validations` | Shared form/data validation schemas |
| `styles` | Global/shared styling |
| `tests` | Unit, integration and E2E testing |

### Architectural flow

```text
                         Next.js Application
                                 │
                                 ▼
                              app/
                                 │
                  ┌──────────────┼──────────────┐
                  ▼              ▼              ▼
             components        hooks        providers
                  │              │              │
                  └──────────────┼──────────────┘
                                 ▼
                         Context / Redux
                                 │
                                 ▼
                             Services
                                 │
                                 ▼
                          HTTP / HTTPS
                                 │
                                 ▼
                     External Backend/API
```

## Current Structure (this project, `frontend/`)

```text
frontend/                     # Next.js (TypeScript, App Router, Tailwind) — FRONTEND ONLY
├── .env.local
├── .env.production
└── src/
    ├── app/                       # Pages, layouts, route groups, loading/error/not-found
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   ├── forgot-password/page.tsx
    │   │   └── reset-password/page.tsx
    │   ├── (protected)/
    │   │   ├── layout.tsx         # Wraps DashboardLayout
    │   │   └── dashboard/page.tsx
    │   ├── layout.tsx             # Root layout (StoreProvider, AuthProvider)
    │   ├── page.tsx
    │   ├── loading.tsx
    │   ├── error.tsx
    │   ├── not-found.tsx
    │   └── globals.css
    ├── assets/                    # images/, icons/, fonts/, styles/
    ├── components/
    │   ├── layout/                # Header, Sidebar, DashboardLayout
    │   └── ui/                    # Button, Loader, EmptyState, ...
    ├── context/                    # AuthContext (React Context, non-Redux state)
    ├── data/                       # Static frontend data (nav config, lookups)
    ├── hooks/                      # useAuth, useDebounce, usePermission, ...
    ├── redux/
    │   ├── store.ts
    │   ├── hooks.ts                # typed useAppDispatch / useAppSelector
    │   ├── StoreProvider.tsx
    │   └── slices/                 # authSlice, userSlice, uiSlice
    ├── services/                   # http-client.ts (Axios) + *.service.ts (backend calls)
    └── utils/                      # format.ts, permissions.ts, ...
```

The current structure has not yet adopted: `public/`, `providers/`,
`types/`, `interfaces/`, `constants/`, `config/`, `validations/`, `styles/`,
`interceptors.ts`, or the `.github/workflows/`, `.husky/`, `.env.staging`
scaffolding from the target structure. Moving toward the target is an
implementation change and follows this repository's SDD lifecycle rather
than being applied directly from this document.

## Boundaries

- Owns UI, routing, and client-side state only.
- Contains **no** API routes, backend controllers, services, or database
  logic — `src/app/api` must never be created.
- All backend communication is isolated to `src/services/` (Axios), reading
  the backend base URL from `NEXT_PUBLIC_API_BASE_URL`.
- Consumes the backend via HTTP only; no direct database or server-side
  backend logic.
- No domain-specific folders in the shared/global layers — business/domain
  UI is introduced per-application, not baked into this architecture.

## Route Groups

- `(auth)/` — unauthenticated routes: login, forgot-password, reset-password.
- `(protected)/` — authenticated routes, wrapped by `DashboardLayout` via
  `(protected)/layout.tsx`.

## State Management

- **Redux Toolkit** (`src/redux/`): global app state — `authSlice`,
  `userSlice`, `uiSlice` — accessed via typed `useAppDispatch`/`useAppSelector`
  hooks, provided through `StoreProvider`.
- **React Context** (`src/context/`): scoped concerns not suited to global
  Redux state, e.g. `AuthContext`.

## Entry Point

- Dev server: `frontend/src/app/layout.tsx` (via `npm run dev` in `frontend/`)
- Root layout wraps the app with `StoreProvider` and `AuthProvider`.
