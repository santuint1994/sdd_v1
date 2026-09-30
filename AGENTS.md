# AGENTS.md — INT AI-First Engineering Policy

This file is the single source of truth for AI-assisted engineering governance in this
repository. It is vendor-agnostic: every AI tool (Claude, Gemini, Cursor, Windsurf,
Copilot, etc.) working in this repo MUST resolve rules, workflows, and skills through
this file and the `.agent/` control plane first.

## Authority Hierarchy

1. **Local Repository First**: `.agent/rules/`, `.agent/workflows/`, `.agent/skills/`,
   and this `AGENTS.md` file are authoritative for this project.
2. **Global Fallback Second**: Only if a workflow, skill, or rule is not found locally
   under `.agent/`, fall back to the global INT skill/workflow configuration.
3. Project-specific constraints recorded in `.ai-context/constitution.md` govern over
   generic INT standards whenever the two conflict; conflicts are flagged for human
   review rather than silently resolved.

## Control Plane Layout

- `.agent/rules/` — INT engineering standards (Node.js style, security, PR gate
  governance). Organization-wide and must remain unchanged.
- `.agent/workflows/` — Lifecycle workflows (BRD ingestion, SDD lifecycle, PR gate
  workflow, incident/hotfix/release management, project resume, etc.).
- `.agent/skills/` — Local copies of project skills (`SKILL.md` only).
- `.ai-context/` — Project-specific knowledge base: constitution, project context,
  architecture, BRD, specs, plans, tasks, test cases, PR reviews, decisions,
  incidents, hotfixes, releases, and change requests.

## SDD Lifecycle Summary

BRD Preparation / Ingestion → Gate 0 (BRD Review — Project Manager / Business
Analyst) → Spec Draft → Gate 1 (Spec Peer Review) → Plan → Tasks →
TDD (RED → GREEN) → Gate 2 (Code Review) → Release.

Gate 0 is the first review gate and is the only BRD review gate. Gate 1 reviews
feature specs, not the BRD itself. The project cannot proceed to Gate 1 until Gate 0
is approved.

Specs may not be drafted until `.ai-context/BRD.md` is Gate 0 approved. If the
Project Manager or Business Analyst requests changes, the BRD must be updated and
resubmitted for Gate 0. Rejected or "Changes Requested" specs block all downstream
planning, tasks, tests, and implementation until resubmitted and re-approved.

### Gate Responsibility Matrix

| Gate | Reviews | Reviewer Role | Record |
|---|---|---|---|
| Gate 0 | BRD | Project Manager and/or Business Analyst | `.ai-context/pr_reviews/BRD-<timestamp>.md` |
| Gate 1 | Feature spec | Project Manager / Product Owner (Gate 1 Reviewer) | `.ai-context/pr_reviews/GATE1-<slug>-*.md` |
| Gate 2 | Code | Technical Lead / Architect (Gate 2 Reviewer) | `.ai-context/pr_reviews/GATE2-<slug>-*.md` |

## Governance Rules

- Reviewer identity is validated by email only (`git config user.email` must match
  the reviewer roster in `.ai-context/project_context.md` / `constitution.md`). Name
  matching is not sufficient.
- Pulling code does not grant approval rights; role separation is strictly enforced.
- Gate 0, Gate 1, and Gate 2 reviewer roles are separate. A Gate 0 reviewer does not
  automatically receive Gate 1 or Gate 2 approval authority; each gate requires its
  own explicit roster assignment.
- Every Gate 0 decision must record the reviewer, review date, status, comments, and
  approval/rejection information in `.ai-context/pr_reviews/BRD-<timestamp>.md`, the
  dashboard, `status.md`, and `prompt_history.md`.
- The Gate Review Dashboard HTML, spec files, PR review records, `status.md`, and
  `prompt_history.md` must stay synchronized.
- Never fabricate reviewer names/emails, technologies, or architectural constraints
  not supplied by the user or the BRD.

## Related Workflows

See `.agent/workflows/` for the full set of lifecycle workflows (BRD ingestion, SDD
lifecycle, PR gate workflow, incident management, hotfix management, release
management, project resume/session continuation).
