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

## 2026-09-27 — BRD Revision 2 Ingested
- **User:** Ran `/int-brd-ingestion` again; a new document was found in `docs/`.
- **Source found:** `docs/Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.4.pdf`
  (v1.4, 27 Sep 2026, "Draft for stakeholder review", solution scope explicitly
  labelled "Full Updated SOW"). Determined this supersedes v1.1 (same title, later
  date, materially larger scope) — no ambiguity requiring user clarification.
- **AI Action:** Ran the BRD Change Management process (delta analysis → impact
  analysis → update BRD.md/assumptions.md → log in brd-change-log.md). Added 14 new
  functional requirements (BRD-015–BRD-028: Modern Admin Panel, user
  provisioning/RBAC/account lifecycle, organisation master data, vacancy/capacity
  management, organisation hierarchy, Receiving Manager workflow step, IT/Facilities
  roles, HR org-metadata & payroll task assignment, document management, Super
  Admin oversight). Modified 10 existing requirements in place without renumbering
  (BRD-001, 002, 004, 006, 007, 008, 009, 012, 013, 014). Added 9 new open questions
  (BRD-OQ-9–BRD-OQ-17, total now 17), 6 new assumptions (ASM-008–ASM-013, total now
  13, including ASM-013 flagging that v1.1's manager-level reassignment/escalation
  action isn't restated in v1.4 — treated as ambiguity requiring reviewer
  confirmation, not silently dropped), and 6 new acceptance criteria
  (BRD.AC7–BRD.AC12). Regenerated `.ai-context/dashboard.html` with the full
  17-item open-question tracker and the superseded-revision note. Updated
  `.ai-context/status.md` (BRD status → "Pending Review — Revision 2").
- **Constitution:** Left `.ai-context/constitution.md` unchanged — v1.4 still has no
  Constitution/Engineering Constitution section, and it names no individual
  stakeholders, so no Team Role & Identity Conflict Resolution was triggered.
- **Status:** `.ai-context/BRD.md` remains `Pending Review` (now "Revision 2").
  Spec generation remains BLOCKED pending Gate 0 re-approval and explicit reviewer
  resolution of all 17 open questions. HALTING here per
  `.agent/rules/int-standards.md`. No business modules were created.

## 2026-09-28 — BRD Ingestion Re-run (No New Content)
- **User:** Ran `/int-brd-ingestion` twice in succession with no new source document
  added to `docs/`.
- **First run:** Confirmed no new/changed file since the last ingestion; reported
  current state (BRD.md at `Pending Review — Revision 2`, 17 open questions
  outstanding) and made no changes.
- **Second run:** Found that the existing source PDF had been renamed on disk from
  `Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.4.pdf` to
  `Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.pdf` (same file size;
  content unchanged, still internally titled "v1.4"). Treated as a filename-only
  change, not a new revision — updated the `File:`/`Source:` references in
  `BRD.md`, `assumptions.md`, and `status.md` to the new filename. No delta
  analysis was performed and no requirement content changed.
- **Status:** Unchanged — `.ai-context/BRD.md` remains `Pending Review — Revision
  2`; spec generation remains BLOCKED pending Gate 0 approval.

### [2026-09-28 00:00]
**User Request:** Ran `/int-brd-ingestion` again; requested rebuilding `BRD.md` from the SOW after it was found empty on disk.
**Agent Action:** Discovered `.ai-context/BRD.md` was emptied (0 bytes, 178 lines deleted from HEAD) while `assumptions.md`, `brd-change-log.md`, `dashboard.html`, and `status.md` still reflected the in-progress Revision 2 (v1.4) baseline — flagged as an interrupted edit and asked the user how to proceed rather than silently treating it as intentional. Per the user's choice, rebuilt `.ai-context/BRD.md` in full from `docs/Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.0.pdf` (content identical to the previously ingested "v1.4" SOW), reproducing all mandatory sections (Objective, Scope, Actors, BRD-001–BRD-028 Functional Requirements, NFRs, Business Rules, Dependencies, Assumptions, Out of Scope, BRD-OQ-1–BRD-OQ-17, BRD.AC1–BRD.AC12) with no ID renumbering, and reconciled Open Questions wording to match `dashboard.html`. Updated the stale source-filename reference (`...v1.pdf` → `...v1.0.pdf`) in `dashboard.html` and `status.md`, and logged the recovery in `.ai-context/brd-change-log.md`. No requirement content changed versus the prior Revision 2 baseline; Gate 0 status remains `Pending Review — Revision 2`, and spec generation remains BLOCKED pending Gate 0 approval and resolution of all 17 open questions.

### [2026-09-28 00:15]
**User Request:** Remove the Facilities/Admin role from the BRD.
**Agent Action:** Applied this as Revision 3 of `.ai-context/BRD.md`, flagging it as a user-directed scope reduction rather than an SOW-driven change (the source SOW v1.4 still describes Facilities/Admin throughout) per `AGENTS.md` conflict-flagging governance. Removed all Facilities/Admin references from the Actors table, Objectives, Scope, Dependencies, Out of Scope, NFRs and the organisation-hierarchy note; marked BRD-026 (Facilities/Admin task execution) as `Removed` without renumbering; updated BRD-001, BRD-005, BRD-008, BRD-022 and BRD.AC8 in place. Also corrected a pre-existing mismatch in `assumptions.md` (ASM-012 was linked to BRD-026, which is now the removed Facilities item, but describes the org-metadata requirement — relinked to BRD-024). Synced the change into `.ai-context/brd-change-log.md`, `.ai-context/assumptions.md`, `.ai-context/dashboard.html`, and `.ai-context/status.md`. BRD status is now `Pending Review — Revision 3`; spec generation remains BLOCKED pending Gate 0 approval and resolution of all 17 open questions (unaffected by this scope change).
