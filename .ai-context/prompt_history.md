# Prompt History

> Append-only chronological audit log of user prompts, change requests, and AI
> execution turns. New entries are always appended below existing entries.

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

## 2026-09-27 — Reviewer Roster Confirmed
- **User:** Updated `.ai-context/project_context.md` directly with real reviewer
  names/emails: Technical Lead / Gate 2 & Project Manager / Gate 1 = Supratim Jetty
  (supratim.jetty@intglobal.com); Senior Software Engineer / Spec Author = Santu
  Pradhan (santu.pradhan@intglobal.com, matches local `git config user.email`).

## 2026-09-27 — BRD Ingestion
- **User:** Ran `/int-brd-ingestion`.
- **Source found:** `docs/Internal_Transfer_Digital_Journey_SOW.pdf` (single BRD
  document, v1.1, 24 Sep 2026, "Draft for stakeholder review").
- **AI Action:** Parsed the SOW and generated `.ai-context/BRD.md` (Objective,
  Scope, Actors, 14 functional requirements BRD-001–BRD-014, NFRs, Business Rules,
  Dependencies, Assumptions, Out of Scope, 8 Open Questions BRD-OQ-1–BRD-OQ-8,
  Acceptance Criteria BRD.AC1–BRD.AC6). Generated `.ai-context/assumptions.md`
  (ASM-001–ASM-007, traced to BRD items). Generated `.ai-context/dashboard.html`
  (Gate 0 status + open-question tracker). Logged the ingestion in
  `.ai-context/brd-change-log.md` and updated `.ai-context/status.md`.
- **Constitution:** Left `.ai-context/constitution.md` unchanged — the source SOW
  contains no Constitution/Engineering Constitution section, so no project-specific
  constitution content could be derived from it without inventing constraints.
- **Status:** `.ai-context/BRD.md` set to `Pending Review`. Spec generation is
  BLOCKED until Gate 0 BRD PR Review is completed and approved, including explicit
  reviewer resolution of all 8 open questions. HALTING here per
  `.agent/rules/int-standards.md` (Strict Spec Generation Block before BRD
  Approval). No business modules were created (module generation requires Gate 1
  architecture approval, which itself requires Gate 0 BRD approval first).
