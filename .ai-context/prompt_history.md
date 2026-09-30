# Prompt History

> Append-only chronological audit log of user prompts, change requests, and AI
> execution turns. New entries are always appended below existing entries.

### [2026-09-28 00:00]
**User Request:** Update the Gate 1 (Spec Peer Review) reviewer to Shamik Bhattacharya (shamik.bhattacharya@indusnet.co.in).
**Agent Action:** Updated `.ai-context/project_context.md` reviewer roster, changing the Gate 1 Reviewer (Project Manager / Product Owner) entry from Santu Pradhan to Shamik Bhattacharya — shamik.bhattacharya@indusnet.co.in.

### [2026-09-28 00:00]
**User Request:** Provided a reusable enterprise backend architecture generation prompt and asked to update the "Backend Architecture.md" file with it.
**Agent Action:** Confirmed with the user that no such file existed yet (only `.ai-context/architecture.md`, which documents the scanned/actual structure) and, per the user's choice, created a new `.ai-context/Backend-Architecture.md` documenting the target enterprise-grade, domain-agnostic Node.js/TypeScript/Express/Sequelize architecture (stack, layered module pattern, folder structure, auth/authz, validation, error handling, logging, security, integrations, jobs/events/cache, docs, testing, env config, health/versioning, shutdown, Docker/CI-CD, code quality, and principles), noting it is reference documentation only — implementing it against the actual codebase still requires going through the SDD lifecycle (spec, Gate 1, plan, tasks, TDD, Gate 2).

### [2026-09-28 00:05]
**User Request:** Map architecture.md to Backend-Architecture.md and remove backend structure detail from architecture.md.
**Agent Action:** Edited `.ai-context/architecture.md`: removed the expanded `backend/src/...` directory tree, the backend bullet detail under Module Boundaries, and the backend-specific Data Layer bullets (Sequelize config/migrations paths), replacing each with a pointer to `.ai-context/Backend-Architecture.md` as the single source of truth for backend internal structure, so backend detail is maintained in one place instead of two.

### [2026-09-28 00:10]
**User Request:** Do the same split for the frontend as was done for the backend (create a dedicated frontend architecture doc and trim frontend detail out of architecture.md).
**Agent Action:** Created `.ai-context/Frontend-Architecture.md` documenting the Next.js/Tailwind/Redux frontend structure, route groups, state management, and boundaries; edited `.ai-context/architecture.md` to remove the expanded `frontend/src/...` directory tree and the detailed frontend bullet under Module Boundaries, replacing them with pointers to `.ai-context/Frontend-Architecture.md`, mirroring the backend split.

### [2026-09-28 00:15]
**User Request:** Provided a global, domain-agnostic reusable Next.js frontend architecture (public/, providers/, types/, interfaces/, constants/, config/, validations/, styles/, etc., plus responsibility table and architectural flow) and asked to update Frontend-Architecture.md without creating any new files.
**Agent Action:** Restructured `.ai-context/Frontend-Architecture.md` into a "Target Structure (global, domain-agnostic)" section (the reusable structure, responsibility table, and architectural flow diagram as provided) and a "Current Structure (this project, `frontend/`)" section (the existing scanned tree), with a note on what the current structure hasn't yet adopted, mirroring the current-vs-target format used in Backend-Architecture.md. No new files were created.

## 2026-09-27 — Initial Project Setup
- **User:** Ran `/int-project-setup` on an empty workspace (`sdd_v1`).
- **Stack confirmed:** Full Stack — Next.js (TypeScript) frontend, Express
  (TypeScript) + Sequelize/PostgreSQL backend, Modular Monolith architecture, JWT
  auth, local deployment target.
- **AI Action:** Scaffolded `frontend/` via `create-next-app`, scaffolded `backend/`
  via manual Express + Sequelize CLI setup, copied INT Control Plane (`.agent/`) and
  templates (`.ai-context/templates/`) from the global skill resources, generated
  `AGENTS.md`, `.gitignore`, vendor bridge (`CLAUDE.md` + `.claude/` junctions), and
  base `.ai-context/` knowledge files.
- **Pending:** Reviewer roster (Gate 1 / Gate 2 / Spec Author names & emails) not yet
  supplied by the user — placeholders left in `project_context.md` and
  `constitution.md` pending follow-up.

## 2026-09-28 — Full BRD Reset
- **User:** Requested removing the BRD entirely and cleaning all related
  artifacts, plus trimming `status.md` and `prompt_history.md` down to only
  the `/int-project-setup` entry, ahead of ingesting a fresh BRD.
- **AI Action:** Reset `.ai-context/BRD.md` to the pre-ingestion placeholder
  template (mandatory section list only, no requirements). Reset
  `.ai-context/assumptions.md` and `.ai-context/brd-change-log.md` to their
  empty baseline. Reset `.ai-context/dashboard.html` to the empty Gate
  Review Dashboard template (no BRD/spec rows). Reset `.ai-context/status.md`
  to reflect no BRD ingested, keeping the confirmed reviewer-roster and
  execution-layer setup checkboxes as-is (still true per `project_context.md`
  and `architecture.md`, which were not touched). Trimmed this file down to
  only the original "Initial Project Setup" entry, removing all
  BRD-ingestion/revision/PR-gate history. Left `.agent/`, `AGENTS.md`,
  `project_context.md`, `constitution.md`, `architecture.md`, and the
  execution layer (`frontend/`, `backend/`) untouched, since they are
  project-setup artifacts, not BRD-derived. `docs/` still contains the prior
  SOW PDF; the user will supply a fresh BRD source next.
- **Status:** Ready for a fresh `/int-brd-ingestion` run.

### [2026-09-28 00:30]
**User Request:** Provided answers to all 11 BRD open questions (BRD-OQ-01…BRD-OQ-11) and asked to incorporate them into BRD.md.
**Agent Action:** Updated `.ai-context/BRD.md` throughout: BRD-001 (local-credential auth), BRD-004/005/007 (role-prefixed User IDs, email credential delivery, security controls), BRD-012 (Receiving Manager enable/disable workflow detail), BRD-014 (IT "No IT Action Required" path, IT approval mandatory), BRD-017 (vacancy reservation timing + concurrency control), BRD-018 (full end-to-end workflow including re-approval branch), BRD-020 (organisation metadata fields), added new **BRD-024** (organisation-metadata-change → Receiving Manager re-approval rule, a new requirement not present in the source SOW), BRD-021 (document policy: PDF/image only, local storage, no scanning/retention required), BRD-023 (escalation), NFR-001/NFR-009, Business Rules, Dependencies, and Assumptions. Rewrote the Open Questions table with Status/Resolution/Incorporated-In columns marking all 11 questions Resolved, and updated Acceptance Criteria to cover the new re-approval and IT-no-action scenarios. Synced `.ai-context/assumptions.md` (A-01, A-02, A-03, A-06, A-07, A-09, A-10, new A-11), `.ai-context/brd-change-log.md`, and `.ai-context/status.md`. Noted in the BRD's revision header and status.md that a formal Gate 0 PR review record (identity-verified PM/TL reviewer) is still required before Status can move to Approved.

### [2026-09-28 00:25]
**User Request:** Modify BRD.md so that transfer completion is defined by final IT approval — IT approval is the last step in the transfer process.
**Agent Action:** Updated `.ai-context/BRD.md`: BRD-014 (IT scope), BRD-018 (workflow, added an "IT final approval" step ahead of Close), BRD-019 (status/exception model), the Business Rules completion bullet, and the Acceptance Criteria completion bullet to state a request reaches Completed only once IT gives final approval. Added a revision note flagging this as a user-directed deviation from the source SOW (§9 step 6 "Verify", §10), which assigns the completion decision to HR/Portal across all mandatory downstream activities rather than to IT alone. Added BRD-OQ-11 (behaviour when a transfer has no applicable IT task). Synced `.ai-context/assumptions.md` (A-10) and `.ai-context/brd-change-log.md`.

### [2026-09-28 00:20]
**User Request:** Remove/don't include the Admin / Facilities-Admin role in BRD.md.
**Agent Action:** Removed the Facilities/Admin role and all its task-execution requirements from `.ai-context/BRD.md` (actor table, BRD-003/004/010/013/016/018/022, related Business Rules, Dependencies, Assumptions, and Acceptance Criteria bullets), added an Out of Scope entry recording the removal, and added a revision note at the top of the file flagging it as a user-directed deviation from the source SOW (which still describes Facilities/Admin throughout) per `AGENTS.md` conflict-flagging governance. Requirement IDs were not renumbered (BRD-015 gap intentionally left). Updated `.ai-context/assumptions.md` (A-04) and logged the change in `.ai-context/brd-change-log.md`.

### [2026-09-28 00:15]
**User Request:** Run `/int-brd-ingestion`.
**Agent Action:** Found `.ai-context/BRD.md`, `assumptions.md`, `architecture.md`, `dashboard.html`, and `brd-change-log.md` reverted/emptied on disk relative to the last commit (which held a fuller "Revision 3" BRD). Flagged this to the user before proceeding, per conflict-flagging governance; user chose to start fresh from the current emptied state rather than restore from git history. Rebuilt `.ai-context/BRD.md` (Status: Pending Review) from `docs/Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.0.pdf` with all mandatory sections (Objective, Scope, Actors, 23 Functional Requirements BRD-001…BRD-023, 9 NFRs, Business Rules, Dependencies, Assumptions, Out of Scope, 10 Open Questions BRD-OQ-01…BRD-OQ-10, Acceptance Criteria). Regenerated `.ai-context/assumptions.md` in lockstep. Updated `.ai-context/dashboard.html` with a Gate 0 pending-review row, `.ai-context/status.md`'s BRD section, and logged both the anomaly and the ingestion event in `.ai-context/brd-change-log.md`. Spec generation remains blocked pending Gate 0 approval.

### [2026-09-28 00:00]
**User Request:** Modify the frontend architecture to the INT-standard Next.js/TypeScript layout (App Router, components, context, data, hooks, redux, services, utils) and scaffold it in `frontend/`.
**Agent Action:** Updated `.ai-context/architecture.md`'s directory tree and module-boundary notes to document the new frontend structure. Installed `axios`, `@reduxjs/toolkit`, and `react-redux` in `frontend/`, and scaffolded `src/assets/{images,icons,fonts,styles}`, `src/components/{layout,ui}` (Header, Sidebar, DashboardLayout, Button, Loader, EmptyState), `src/context/AuthContext.tsx`, `src/data/navigation.ts`, `src/hooks/{useAuth,useDebounce,usePermission}.ts`, `src/redux/{store,hooks,StoreProvider}.ts(x)` + `slices/{auth,user,ui}Slice.ts`, `src/services/{http-client,auth,user,dashboard,common}.service.ts` (Axios-based, backend URL from `NEXT_PUBLIC_API_BASE_URL`, no API routes created), `src/utils/{format,permissions}.ts`, App Router route groups `(auth)/{login,forgot-password,reset-password}` and `(protected)/{layout,dashboard}`, plus `loading.tsx`, `error.tsx`, `not-found.tsx`, and added `.env.local`/`.env.production`. Wired `StoreProvider`/`AuthProvider` into the root `layout.tsx`. Verified with `npx tsc --noEmit` (no errors). This is scaffolding only — no feature logic, no `src/app/api`, and the backend remains untouched.

### [2026-09-29 00:00]
**User Request:** Introduce a Gate 0 BRD Review stage (PM/BA reviewer) and make governance, BRD, workflow, and role documentation consistent across Gate 0, Gate 1, and Gate 2.
**Agent Action:** Added a Gate 0 governance flow, responsibility/approval matrix, gate rules, and an unassigned Gate 0 reviewer role (no name or email invented) to `AGENTS.md`, `.ai-context/project_context.md`, `constitution.md`, `status.md`, `BRD.md` (new Governance & Gate 0 Approval Record section), `dashboard.html`, `Backend-Architecture.md`, and the dashboard design template. Created `.ai-context/templates/gate-0-review.template.md`. Corrected BRD-stage "Pending Gate 1" wording to Gate 0 in `.agent/workflows/int-brd-ingestion.md` and `int-project-from-brd.md`, and aligned the PM/BA reviewer wording in `int-pr-gate-workflow.md`, `skills/int-brd-ingestion/SKILL.md`, and `skills/int-incident-management/SKILL.md`. `.agent/rules/` left unchanged. Business requirements were not modified.

### [2026-09-29 12:00]
**User Request:** Assign Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) as the Gate 0 reviewer.
**Agent Action:** Recorded the Gate 0 reviewer in the roster and approval matrix of `.ai-context/project_context.md`, and updated the Gate 0 rows in `BRD.md`, `status.md` (including the checklist), `dashboard.html`, and `brd-change-log.md`. Gate 0 status remains Pending Review; Gate 1 and Gate 2 assignments were not changed.

### [2026-09-29 12:10]
**User Request:** Change the Gate 1 reviewer email to shamik.bhattacharya@intglobal.com.
**Agent Action:** Updated the Gate 1 (Project Manager / Product Owner) entry in the roster and approval matrix of `.ai-context/project_context.md` from shamik.bhattacharya@indusnet.co.in to shamik.bhattacharya@intglobal.com. Gate 0 and Gate 2 entries unchanged.
