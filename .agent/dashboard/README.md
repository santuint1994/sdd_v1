# Dashboard Reference — `.ai-context/dashboard.html`

This folder is the behavioral contract for the SDD Control Center dashboard. Read it
before changing `dashboard.html`; update it in the same change when behavior changes.
It applies to every AI tool and developer working in this repository (see `AGENTS.md`).

## Documents

| File | Covers |
|---|---|
| [behavior-spec.md](behavior-spec.md) | Shell, navigation, every panel, filters, search, drawer, states, accessibility, persistence |
| [data-model.md](data-model.md) | The `DATA` object schema, derived metrics and formulas, status vocabulary, sync points |
| [business-rules.md](business-rules.md) | Governance rules the dashboard represents, permissions, validation and error handling |

## What the dashboard is

A single self-contained file: HTML + CSS + vanilla JavaScript, no libraries, no network
requests, opened directly from disk. It has two kinds of content:

1. **Authoritative review records** — the Gate 0 / Gate 1 / Gate 2 / Active Specs tables
   inside `<template id="tpl-records">`. These are hand-edited, machine-read by the
   PR-gate workflows, and are the single source of truth for review records.
2. **Derived views** — everything else is computed in JavaScript from the `const DATA`
   object (a snapshot of `.ai-context` state). No metric is typed in by hand.

## Non-negotiable rules for any change

1. **Never remove or restructure `<template id="tpl-records">`.** Workflows read it.
   Edit rows in place. Keep class names `card`, `badge ok|warn|bad`, `empty`.
2. **Never fabricate data.** No invented reviewers, emails, counts, specs, APIs, tests,
   dates or percentages (`AGENTS.md` governance). If a source does not exist
   yet, show an empty state that says so and why.
3. **Derive, don't hard-code.** A number shown in the UI must come from `DATA` via
   `derive()`. If you add a metric, add its formula to `data-model.md`.
4. **Status is never color alone.** Every status renders icon + text via `badge()`.
5. **Keep the dashboard in sync** with `status.md`, `pr_reviews/BRD-*.md`, and
   `prompt_history.md` whenever gate state changes (`AGENTS.md`).
6. **No dependencies, no network, no storage beyond the keys listed in
   behavior-spec.md §12.** No AI-generated markers in code comments
   (`rules/int-standards.md` §5).
7. **Do not grant approval rights.** The dashboard displays gate state; approval is
   validated only by `git config user.email` in the PR-gate workflow.

## Change checklist

Before finishing a change to `dashboard.html`:

- [ ] `<template id="tpl-records">` content is unchanged, or changed only as a
      deliberate record update (and `status.md` / `pr_reviews/` updated to match).
- [ ] New/changed behavior is documented in the matching file here.
- [ ] Every data-driven panel still handles loading, empty and error states.
- [ ] New interactive elements are keyboard reachable with a visible focus state and
      an accessible name.
- [ ] Works in light and dark themes; no text below WCAG AA contrast.
- [ ] Script has no syntax errors (extract the `<script>` and run `node --check`).
- [ ] All routes render with zero `.state.error` elements (see behavior-spec.md §13).
- [ ] An entry is appended to `.ai-context/prompt_history.md` (`rules/auto-log.md`).

## Scope limits

This folder documents the dashboard only. It does not change the SDD lifecycle,
gate roles, or workflows; those remain defined in `AGENTS.md`, `.agent/rules/` and
`.agent/workflows/`.
