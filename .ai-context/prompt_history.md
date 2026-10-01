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

### [2026-09-30 14:46]
**User Request:** Ran `/int-pr-gate-workflow`, chose to review the pending Gate 0 BRD, asked for feedback on the BRD and acceptance criteria, then provided 22 Gate 0 review comments.
**Agent Action:** Verified `git config user.email` (shamik.bhattacharya@intglobal.com) against the Gate 0 reviewer roster: authorised. Gave advisory feedback, then recorded the reviewer's 22 comments as a Gate 0 **Changes Requested** review in `.ai-context/pr_reviews/BRD-20260930-144648.md` (scorecard: Not Ready for Gate 1). Synced `BRD.md` (Status line and Gate 0 approval record), `assumptions.md` (status), `status.md`, `dashboard.html`, and `brd-change-log.md`. Requirement content was not changed; the author must update `BRD.md` and `assumptions.md` and re-submit for Gate 0. Spec drafting and Gate 1 stay blocked.

### [2026-09-30 15:00]
**User Request:** Ran `/int-project-resume` to reconstruct the current project state.
**Agent Action:** Read-only state inspection (status.md, BRD Gate 0 record, roster, git status/log); found Gate 0 = Changes Requested (22 comments, reviewer Shamik Bhattacharya), BRD/assumptions unmodified since the review, working tree clean, specs and Gate 1/2 blocked. Presented next-action options and awaited developer confirmation; no project artifacts were modified.

### [2026-09-30 15:20]
**User Request:** Provided the author response to Gate 0 review comment 1 (Authentication & Session Management): lockout, lock duration, idle timeout, password complexity, temporary password, reset/deactivation session invalidation, credential logging, MFA/SSO out of scope.
**Agent Action:** Added BRD-025 (Authentication & Session Security Policy) to `BRD.md` and updated BRD-006, BRD-007, NFR-001, NFR-003, BRD-OQ-02, Assumptions and Acceptance Criteria. Added A-12 to `assumptions.md` (temporary-password expiry period left open, not assumed) and an Author Responses table to `pr_reviews/BRD-20260930-144648.md`. Synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested (1 of 22 addressed); spec drafting and Gate 1 remain blocked.

### [2026-09-30 15:30]
**User Request:** Clarified that the temporary password stays valid until the user's first login, where it must be changed before proceeding.
**Agent Action:** Closed the open temporary-password-expiry point on Gate 0 comment 1: updated the Temporary password row in BRD-025 (`BRD.md`), A-12 in `assumptions.md`, the clarification note in `pr_reviews/BRD-20260930-144648.md`, and the `brd-change-log.md` entry. Gate 0 remains Changes Requested (1 of 22 addressed); Gate 1 and spec drafting stay blocked.

### [2026-09-30 15:45]
**User Request:** Provided the author response to Gate 0 review comment 2 (Role & API-Level Authorization): backend/API-authoritative authorization chain, 401/403 rules, direct-API rejection, and audit of sensitive actions.
**Agent Action:** Added BRD-026 (Role & API-Level Authorization) to `BRD.md` and updated NFR-002 and Acceptance Criteria. Added A-13 to `assumptions.md` (detailed role/action/scope matrix not assumed) and comment 2 to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`. Synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested (2 of 22 addressed); spec drafting and Gate 1 remain blocked.

### [2026-09-30 16:10]
**User Request:** Provided the author response to Gate 0 review comment 3 (Workflow State Management): controlled transition matrix, rejection, clarification, withdrawal, vacancy impact, completion rule and backend enforcement.
**Agent Action:** Added BRD-027 (Workflow State Management, full transition matrix) to `BRD.md`; reconciled BRD-019, BRD-014, Business Rules, Assumptions and Acceptance Criteria; raised open questions BRD-OQ-12 to 14 for gaps (withdrawal cut-off, Block/Resume/Cancel/Reassign, HR/Payroll routing). Added A-14 to `assumptions.md` and comment 3 to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`. Synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested (3 of 22 addressed); spec drafting and Gate 1 remain blocked.

### [2026-09-30 16:40]
**User Request:** Provided the author response to Gate 0 review comment 4 (Vacancy Reservation & Capacity): reservation timing, release/retain rules, HR vacancy change, concurrency control and vacancy status rules.
**Agent Action:** Added BRD-028 (Vacancy Reservation & Capacity) to `BRD.md`; reconciled BRD-017, BRD-027, BRD-OQ-06, Business Rules and Acceptance Criteria; raised open question BRD-OQ-15 for undefined edge cases (resume validation, resumed request on a non-Open vacancy, releasing role, "Available" vs "Open"). Added A-15 to `assumptions.md` and comment 4 to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`. Synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested (4 of 22 addressed); spec drafting and Gate 1 remain blocked.

### [2026-09-30 17:10]
**User Request:** Provided the author response to Gate 0 review comment 5 (Employee Eligibility): Active status, no minimum tenure, one active request at a time, pending-transfer restriction, Available vacancy, mandatory organisation data, HR validation, and no assumed HR restrictions.
**Agent Action:** Added BRD-029 (Employee Eligibility for Internal Transfer) to `BRD.md` and updated BRD-013, Business Rules, Assumptions and Acceptance Criteria; raised open question BRD-OQ-16 for undefined points (Blocked/Information Required as active, source of truth and missing-data handling, HR-ineligible outcome, repeat vacancy request). Added A-16 to `assumptions.md` and comment 5 to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`. Synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested (5 of 22 addressed); spec drafting and Gate 1 remain blocked.

### [2026-09-30 17:40]
**User Request:** Provided the author response to Gate 0 review comment 6 (Multiple Active Transfer Requests): one active request per employee, active and final statuses, same-vacancy rule, new request after Rejected/Withdrawn/Cancelled/Completed, and backend/database enforcement.
**Agent Action:** Added BRD-030 (One Active Transfer Request per Employee) to `BRD.md` and updated BRD-029, BRD-027, Business Rules, Open Questions and Acceptance Criteria; answered BRD-OQ-16 points (a) and (d) and raised BRD-OQ-17 (Draft as active, mandatory database-level enforcement, HTTP status of the rejection, cool-down after Completed). Added A-17 to `assumptions.md` and comment 6 to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`. Synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested (6 of 22 addressed); spec drafting and Gate 1 remain blocked.

### [2026-09-30 18:10]
**User Request:** Provided the answer to open question BRD-OQ-12 (withdrawal rules: allowed until HR approval, mandatory reason, reservation release, downstream cancellation, Withdrawn is final and not reopenable).
**Agent Action:** Incorporated the answer into BRD-027 in `BRD.md` (withdrawal rules plus four Withdraw matrix rows) and reconciled Business Rules, Assumptions, Acceptance Criteria and the Open Questions table (BRD-OQ-12 now Resolved). Updated A-14 in `assumptions.md`, added comment 15 to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested (7 of 22 addressed); spec drafting and Gate 1 remain blocked.

### [2026-09-30 18:40]
**User Request:** Provided the answer to open question BRD-OQ-13 (rules for Block, Resume, Cancel and Reassign: allowed roles, mandatory reasons, resulting statuses, vacancy and audit handling).
**Agent Action:** Added the four action rules and ten transition-matrix rows to BRD-027 in `BRD.md` and reconciled BRD-019, BRD-028, Business Rules, Assumptions, Acceptance Criteria and the Open Questions table (BRD-OQ-13 now Resolved; new BRD-OQ-18 for residual gaps). Updated A-14 and A-15 in `assumptions.md`, added a comment 18 (part) row to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-09-30 19:10]
**User Request:** Provided the answer to open question BRD-OQ-14 (HR Confirmation as an activity not a status, sequential HR then Payroll Processing, manual Payroll completion by an authorised HR user, 403 response for invalid transitions).
**Agent Action:** Updated the BRD-027 transition matrix, routing rules and backend-enforcement rule in `BRD.md` and reconciled BRD-018, BRD-024, Business Rules, Assumptions, Acceptance Criteria and the Open Questions table (BRD-OQ-14 now Resolved). Updated A-14 in `assumptions.md`, added a comments 3/10 (part) row to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-09-30 19:40]
**User Request:** Provided the answer to open question BRD-OQ-15 (resume revalidation, Full/On Hold/Closed vacancy handling for Blocked requests, who may release an in-flight reservation, and Available = Open with capacity above zero).
**Agent Action:** Added the four vacancy edge-case rules to BRD-028 in `BRD.md` and reconciled the reservation-rules table, BRD-029, BRD-OQ-18(c), Acceptance Criteria and the Open Questions table (BRD-OQ-15 now Resolved). Updated A-15 in `assumptions.md`, added a comment 4 (part) row to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-09-30 20:10]
**User Request:** Provided the answer to open question BRD-OQ-16 (Blocked/Info Required as active, HR system as authoritative employee-data source with missing-data block, HR reject vs request clarification for ineligible employees, same-vacancy reapplication).
**Agent Action:** Added the source-of-truth, missing-data and HR-ineligible rules to BRD-029 in `BRD.md` and reconciled BRD-013, Business Rules, Dependencies, Assumptions, Acceptance Criteria and the Open Questions table (BRD-OQ-16 now Resolved; new BRD-OQ-19 for per-field source, synchronisation and conflict gaps). Updated A-16 and added A-18 in `assumptions.md`, added a comments 5/7 (part) row to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-09-30 20:40]
**User Request:** Provided the answer to open question BRD-OQ-19 (per-field source of truth with the portal as operational source, no HR-system synchronisation this phase, in-flight data handling, HR updates limited to the portal, missing-data correction by the assigned HR team).
**Agent Action:** Replaced the external-HR-system source-of-truth wording in BRD-029 with the per-field ownership table and the no-synchronisation, in-flight, HR-update and missing-data rules, and reconciled BRD-020, Business Rules, Dependencies, Out of Scope, Assumptions, Acceptance Criteria and the Open Questions table (BRD-OQ-19 now Resolved; BRD-OQ-16(b) marked as refined). Rewrote A-18 (and adjusted A-16) in `assumptions.md`, added a comment 7 row to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-09-30 21:10]
**User Request:** Provided the answer to open question BRD-OQ-17 (Draft not active, mandatory backend and database enforcement, HTTP 409 ACTIVE_TRANSFER_ALREADY_EXISTS, no cool-down after Completed).
**Agent Action:** Replaced the open-gap note in BRD-030 in `BRD.md` with the four confirmed rules and reconciled the After Completed row, Acceptance Criteria and Open Questions table (BRD-OQ-17 now Resolved). Updated A-17 in `assumptions.md`, the comment 6 row in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` and `dashboard.html`. Only BRD-OQ-18 remains open.

### [2026-09-30 19:45]
**User Request:** Provided the answer to open question BRD-OQ-18 (HR-controlled and IT-controlled stages for Block/Resume, HR Cancel limits, failed Resume revalidation, Draft exclusion, and who may Resume a Blocked request).
**Agent Action:** Added the stage definitions, Draft exclusion, cross-role Resume rules and HR Cancel limits to BRD-027 in `BRD.md` (rules and transition-matrix rows) and reconciled BRD-019, BRD-028, Business Rules, Acceptance Criteria and the Open Questions table (BRD-OQ-18 now Resolved). Updated A-14 in `assumptions.md`, added a comment 18 (part) row to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-09-30 22:30]
**User Request:** Provided the answer for peer review comment 8 (Effective Transfer Date: current date to 30 days ahead, no past dates for any role, weekends/holidays allowed, expired date updated before completion, no re-approval unless Super Admin configures it).
**Agent Action:** Added BRD-031 to `BRD.md` and reconciled Business Rules, Dependencies, Acceptance Criteria and the Open Questions table (new BRD-OQ-20 for residual gaps: modifying roles, time zone, re-approval approvers, expired-date owner). Added A-19 in `assumptions.md`, a comment 8 row in the Author Responses table of `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested (8 of 22 addressed); spec drafting and Gate 1 remain blocked.

### [2026-09-30 22:50]
**User Request:** Provided the answer to open question BRD-OQ-20 (who may change the effective date, business time zone and inclusive fixed 30-day limit, optional re-approval routing, and expired-date correction by HR or Super Admin).
**Agent Action:** Updated BRD-031 in `BRD.md` (editing roles, time zone, inclusive fixed limit, re-approval routing, expired-date ownership) and reconciled Business Rules, Dependencies, Acceptance Criteria and the Open Questions table (BRD-OQ-20 now Resolved). Rewrote A-19 in `assumptions.md`, updated the comment 8 row in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-09-30 23:10]
**User Request:** Confirmed that HR may cancel a Blocked request blocked in an HR-controlled stage (not an IT-blocked one) and that Super Admin may cancel a Blocked request at any stage, with mandatory reason, capacity release, audit and notification.
**Agent Action:** Added the Blocked-request cancellation rule, three transition-matrix rows and the follow-up note to BRD-027 in `BRD.md` (replacing the not-assumed residual) and reconciled Business Rules, Acceptance Criteria and the BRD-OQ-18 row. Updated A-14 in `assumptions.md`, the comment 18 (part) row in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-09-30 23:30]
**User Request:** Provided the answer to Gate 0 comment 9 (HR Organisation Metadata Changes: configured re-approval workflow, Receiving Manager re-approval when enabled, audit fields, BRD-024 remains mandatory with no HR bypass).
**Agent Action:** Added the not-configured and no-bypass wording to BRD-024 in `BRD.md` (the rest already matched), updated A-11 in `assumptions.md`, added a comment 9 row to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` (9 of 22 addressed) and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-10-01 09:30]
**User Request:** Provided the answer to Gate 0 comment 10 (Payroll Task Completion: manual HR completion, no Payroll API/callback, IT Final Approval blocked until complete, payroll processing out of scope, audited).
**Agent Action:** Added the comment 10 confirmation to BRD-027 rule (c) in `BRD.md`, added a comment 10 row to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` (10 of 22 addressed) and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-10-01 10:00]
**User Request:** Provided the answer to Gate 0 comment 11 (IT Final Approval is the mandatory final completion gate for every transfer, with or without IT work, and is audited).
**Agent Action:** Added the comment 11 confirmation to the BRD-027 completion rule in `BRD.md`, added a comment 11 row to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` (11 of 22 addressed) and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-10-01 10:30]
**User Request:** Provided the answer to Gate 0 comment 12 (Integration Requirements: no external Payroll/HR integration in the current phase, contract required before any future integration, NFR-006 retry and visibility rules).
**Agent Action:** Added an Integration Requirements rule to Business Rules in `BRD.md` and reconciled NFR-006 and Dependencies. Added a comment 12 row to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` (12 of 22 addressed) and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-10-01 11:00]
**User Request:** Provided the answer to Gate 0 comment 13 (Document Upload & Access: API/server-level security, PDF/image only, 5 MB per file, MIME and extension validation, file-name sanitisation, local server storage, role/organisation-scoped authenticated access, no public URLs, audit logging).
**Agent Action:** Expanded BRD-021 in `BRD.md` with the confirmed rules and reconciled Business Rules and the BRD-OQ-08 row (maximum size now 5 MB). Updated A-06 in `assumptions.md`, added a comment 13 row to the Author Responses table in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` (13 of 22 addressed) and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-10-01 11:20]
**User Request:** Answered the follow-up on Gate 0 comment 13: document upload validation failures return HTTP 413 (`FILE_SIZE_EXCEEDED`) and HTTP 415 (`UNSUPPORTED_FILE_TYPE`, `INVALID_FILE_TYPE`), with server-side rejection and no file stored.
**Agent Action:** Added the validation-failure rule to BRD-021 in `BRD.md`, updated A-06 in `assumptions.md` and the comment 13 row in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` and `dashboard.html`. Gate 0 stays Changes Requested (13 of 22 addressed); spec drafting and Gate 1 remain blocked.

### [2026-10-01 00:59]
**User Request:** Redesign `dashboard.html` into a modern, professional Spec-Driven Development control center (layout, KPIs, lifecycle, traceability, gates, search, themes, responsive, accessible) without losing existing functionality.
**Agent Action:** Rewrote `.ai-context/dashboard.html` as a single-file vanilla HTML/CSS/JS app driven by a `DATA` snapshot of BRD.md, the Gate 0 review record, project_context.md and git history. The original Gate 0/1/2 and Active Specs tables are preserved verbatim in `<template id="tpl-records">`. No gate status or review data changed, so `status.md` and `pr_reviews/` needed no sync.

### [2026-10-01 01:09]
**User Request:** Add a `.agent` folder that documents the functionality, behavior, rules and data flow of `dashboard.html` as a reference for developers and AI agents.
**Agent Action:** Created `.agent/dashboard/` with `README.md` (contract and change checklist), `behavior-spec.md`, `data-model.md` and `business-rules.md`. Existing `.agent/rules/` and `.agent/workflows/` untouched; no dashboard code changed.

### [2026-10-01 11:40]
**User Request:** Provided the answer to Gate 0 comment 14 (Transfer Request Editing: Employee edits in Draft only, post-submission changes by authorised HR/Super Admin, BRD-024 re-approval, no silent overwrite, full audit history).
**Agent Action:** Added BRD-032 and a Business Rules entry to `BRD.md` (BRD-031 cross-reference updated), added A-20 to `assumptions.md`, recorded a comment 14 row in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` (14 of 22 addressed) and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-10-01 12:30]
**User Request:** Remove the Needs Attention, My Actions, Requirement Traceability, Specification Health, Risks & Blockers, Change Impact Analysis, Architecture Overview, API Overview, Decision Log and Recent Activity sections and all related code, data, navigation and documentation.
**Agent Action:** Removed the ten panels and their dependent code, data, CSS, navigation items, drawers, search entries, notification bell and "View as" switcher from `dashboard.html`; reorganised the dashboard into hero, KPIs, lifecycle, gates + open questions, testing; fixed a stale-selector console error in `rerender`/`renderAllPanels`; updated `.agent/dashboard/` (README, behavior-spec, data-model, business-rules); verified all routes in headless Chrome with no errors.

### [2026-10-01 13:00]
**User Request:** Remove the Data Model and Reports sections and all related functionality from `dashboard.html`.
**Agent Action:** Removed the Data Model and Reports panels, views, navigation items (including the empty Reporting group), the `entities` mock data, the JSON export handler/button and the unused db/chart/download icons from `dashboard.html`; command-palette page search derives from the nav, so those entries are gone too.

### [2026-10-01 13:10]
**User Request:** Confirm whether the `.agent/dashboard/` documentation was updated for the Data Model and Reports removal.
**Agent Action:** Removed the Data Model and Reports references (navigation table, view descriptions, JSON export, `entities[]` schema row) from `.agent/dashboard/behavior-spec.md` and `.agent/dashboard/data-model.md`.

### [2026-10-01 13:30]
**User Request:** Remove the Settings section and all Settings-related functionality from `dashboard.html` and the `.agent` documentation.
**Agent Action:** Removed the Settings panel, view, "System" nav group, profile-menu Settings link, simulated-error and reset-preferences handlers (`forceError`, `toggle-error`, `reset-prefs`) and the unused cog/refresh icons from `dashboard.html`; kept the header theme menu, sidebar collapse and panel Retry. Updated `.agent/dashboard/behavior-spec.md` and `business-rules.md`; verified all routes load in headless Chrome with no errors (`#/settings` falls back to the dashboard).

### [2026-10-01 14:00]
**User Request:** Provided the answer to Gate 0 comment 16 (Rejection & Resubmission: mandatory reason, audited, Employee notified, Rejected final with capacity released, no same-reference resubmission, new application is a new request with a new ID and restarted workflow).
**Agent Action:** Added BRD-033 and a Business Rules entry and Acceptance Criteria bullet to `BRD.md` (BRD-027 rejection rule reconciled), added A-21 to `assumptions.md`, recorded a comment 16 row in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` (15 of 22 addressed) and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-10-01 14:30]
**User Request:** Provided the answer to Gate 0 comment 17 (Clarification: mandatory reason/question, Information Required temporary state, responsible user notified and responds, same transfer reference, audited requests/responses, return to the same stage/reviewer, multiple cycles, no workflow restart).
**Agent Action:** Added BRD-034 plus Business Rules and Acceptance Criteria entries to `BRD.md` (BRD-027 clarification rule reconciled), added A-22 to `assumptions.md`, recorded a comment 17 row in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` (16 of 22 addressed) and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-10-01 15:00]
**User Request:** Provided the answer to Gate 0 comment 18 (Administrative Reassignment: Super Admin only, mandatory reason, new assignee notified, previous assignee keeps history visibility but cannot act, no re-approval, same workflow stage, audited, no bypass of mandatory approvals or IT Final Approval).
**Agent Action:** Added BRD-035 to `BRD.md` and reconciled the BRD-027 Reassign rule and matrix rows (HR reassign allowance withdrawn), BRD-OQ-13, BRD-010, Business Rules and Acceptance Criteria; added A-23 to `assumptions.md`, a comment 18 row in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` (17 of 22 addressed) and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-10-01 15:30]
**User Request:** Provided the answer to Gate 0 comment 19 (Notifications: twelve mandatory events as Event → Recipient → Channel → Message → Mandatory/Optional; notification failure must not fail, roll back or corrupt the core transfer transaction, is logged, and may be retried without repeating the workflow transaction or creating duplicates).
**Agent Action:** Added BRD-036 plus Business Rules and Acceptance Criteria entries to `BRD.md` (BRD-023 cross-referenced), added A-24 to `assumptions.md`, recorded a comment 19 row in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` (18 of 22 addressed) and `dashboard.html`. Gate 0 stays Changes Requested; spec drafting and Gate 1 remain blocked.

### [2026-10-01 15:45]
**User Request:** Clarified Gate 0 comment 19 that notifications are delivered by both email and in-app.
**Agent Action:** Updated BRD-036 (added a channel rule: "Email / In-app" events use both channels; account creation and reset stay Email only), the Business Rules and Acceptance Criteria entries, A-24 (removed the open channel question), the comment 19 review row and the change-log entry.

### [2026-10-01 16:10]
**User Request:** Provided the answer to Gate 0 comment 20 (Audit Logging: record content, Super Admin system-wide view with scoped access for others, append-only records, Super Admin-only audited export, lifetime retention with no manual deletion, no credentials in audit logs, security events audited).
**Agent Action:** Added BRD-037 plus Business Rules and Acceptance Criteria entries to `BRD.md` (BRD-022 and NFR-005 cross-referenced), added A-25 to `assumptions.md`, recorded a comment 20 row in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` (19 of 22 addressed) and `dashboard.html`. Gate 0 stays Changes Requested; comments 21–22 outstanding; spec drafting and Gate 1 remain blocked.

### [2026-10-01 18:30]
**User Request:** Provided the answer to Gate 0 comment 21 (Performance & Availability: application-level requirements validated before production, targets to be confirmed in capacity planning/testing, 5 MB upload limit, controlled retry, transaction consistency).
**Agent Action:** Added BRD-038 plus NFR-009, BRD-OQ-09, Dependencies, Constraints, Business Rules and Acceptance Criteria updates to `BRD.md`, added A-26 to `assumptions.md`, recorded a comment 21 row in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` (20 of 22 addressed) and `dashboard.html`. Gate 0 stays Changes Requested; comment 22 outstanding; spec drafting and Gate 1 remain blocked.

### [2026-10-01 19:00]
**User Request:** Provided the answer to Gate 0 comment 22 (Mandatory Negative Acceptance Scenarios: security, workflow, vacancy and integration negative scenarios are mandatory QA/UAT acceptance criteria validated before production deployment, with failed mandatory scenarios resolved before deployment).
**Agent Action:** Added BRD-039 (24-scenario table across Security, Workflow, Vacancy and Integration) plus Business Rules and Acceptance Criteria entries to `BRD.md`, added A-27 to `assumptions.md`, recorded a comment 22 row in `pr_reviews/BRD-20260930-144648.md`, and synced `brd-change-log.md`, `status.md` (22 of 22 addressed) and `dashboard.html`. Gate 0 stays Changes Requested pending the reviewer's re-review; spec drafting and Gate 1 remain blocked.
