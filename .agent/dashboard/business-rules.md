# Business Rules, Permissions & Error Handling

## 1. Governance the dashboard must represent

From `AGENTS.md` and `.agent/rules/int-standards.md` §6. The dashboard displays these;
it does not enforce or bypass them.

- Lifecycle: BRD → **Gate 0** (BRD review, PM/BA) → Spec → **Gate 1** (spec peer review,
  PM/PO) → Plan → Tasks → TDD (RED → GREEN) → **Gate 2** (code review, Tech Lead /
  Architect) → Release.
- Gate 0 is the only BRD gate. No specs may be drafted until Gate 0 is **Approved**.
  Therefore while Gate 0 ≠ approved: Specification and Gate 1 stages are **Blocked**;
  later stages are Pending; spec-related flags read "Spec blocked", not "Missing spec".
- A Gate 1 Rejected / Changes Requested spec blocks planning, tasks, test cases and
  code for that spec. (Display when `specs[].gate1` carries that status.)
- Gate roles are separate. Gate 0, 1, 2 reviewers come only from the roster; one gate's
  approval never implies another's.
- Change Request workflow is triggered only by the literal words "Change Request" or
  "CR" in a prompt. The dashboard has no CR feature; do not add one.

## 2. Permissions

- The dashboard is **read-only with respect to governance**. It never approves,
  rejects, edits a record, or writes files.
- There is no role or viewer switcher; the profile menu only displays the current user.
- The UI states that approval authority is verified by `git config user.email` in the
  PR-gate workflow. The page cannot read git identity and must not imply it does.
- Do not add approve/reject buttons, role switches that unlock actions, or any control
  that changes gate state.

## 3. Validation

Inputs that exist are all client-side filters; none submit data.

- Search/filter text is matched case-insensitively against plain strings; it is never
  evaluated as HTML or regex. Highlight escapes regex metacharacters and HTML.
- **All interpolated data goes through `esc()`.** Raw HTML is allowed only from
  internal helpers (`badge`, `ic`, `bar`, `tip`, `chips`). Never pass `DATA` strings to
  `innerHTML` unescaped.
- Numeric IDs (e.g. review-comment numbers) are coerced with `Number()`; unknown IDs
  produce a toast ("Nothing to show for that item."), not an exception.
- Percentages use `pct()`, which guards divide-by-zero.

## 4. Error handling

- Every panel renders through `renderPanel()` inside `try/catch`. On failure it logs
  `console.error('[dashboard] panel "<id>" failed:', err)` and shows an error state
  (`role="alert"`, panel-specific message from `PANELS[id].err`, **Retry** button).
  One failing panel never blocks others.
- **Retry** (`data-action="retry"`) re-renders that panel only.
- `localStorage` access is always wrapped (`store.get/set`); the dashboard must work
  with storage blocked, falling back to defaults (theme: system; sidebar: expanded).
- Missing `<template id="tpl-records">` makes the records panel show its error state
  (this is intentional — it signals a broken authoritative record).
- Unknown route hash falls back to Dashboard.

## 5. Honesty rules (empty-state copy)

| Situation | Required message intent |
|---|---|
| No specs | Drafting is blocked until Gate 0 approved (or "draft the first spec" once approved) |
| No tests | Tests are drafted after Gate 1, written first in TDD red phase; coverage shows "—" |
| No open questions | "No open questions found." plus resolved/deferred counts and a *Show all* action |
| Search miss for `SPEC-`/`TC-` | Say that object type does not exist yet and why |
