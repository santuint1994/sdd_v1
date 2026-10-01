# Data Model & Derivations

All dashboard data lives in `const DATA` (top of the `<script>`). All metrics come from
`derive()`. Re-derived on every route render (`D = derive()`).

## 1. `DATA` schema

| Key | Shape | Source of truth | Notes |
|---|---|---|---|
| `project` | `{name, code, env, displayName, lastUpdated, lastUpdatedSource, phase}` | BRD.md header, project_context.md | `lastUpdated` = BRD.md "Last Updated" |
| `roster[]` | `{id, name, email, roles[]}` | project_context.md roster | Never invent people |
| `gate0` | `{status, reviewer, date, record, comments[], criteria[]}` | `pr_reviews/BRD-<ts>.md` | `status`: `changes`\|`approved`\|`rejected`\|`inreview` |
| `gate0.comments[]` | `{n, title, status: 'addressed'\|'partial'\|'open', resp, inc[], summary, flag?}` | Review record + Author Responses table | `inc` = "Incorporated In" IDs. `flag` = data-consistency note |
| `gate0.criteria[]` | `{n, name, passed, comments[]}` | Review Criteria Evaluation | Criterion 13 (readiness verdict) is intentionally excluded |
| `gate1`, `gate2` | `{reviewer}` | Reviewer roster | Status derived, not stored |
| `requirements[]` | built from tuples `[id, title, area, commentNumbers, 'new'?]` → `{id, title, area, comments[], type, isNew, trace}` | BRD.md | `type` = NFR if id starts `NFR`. `isNew` = added during Gate 0. `trace = {spec[], impl[], test[]}` of artefact IDs |
| `openQuestions[]` | `{id, title, status: 'open'\|'deferred'\|'resolved'}` | BRD.md Open Questions | |
| `specs[]` | `{id, title, status, gate1, developer, reqs[], plan?}` | `.ai-context/specs/` | Empty until Gate 0 approved |
| `tests[]` | `{id, title, req, status: 'passed'\|'failed'\|'blocked'\|'notrun'}` | `.ai-context/test_cases/` | |
| `tasks[]` | any | `.ai-context/tasks/` | Only its length is used |

## 2. Status vocabulary (`STATUS` map → `badge(key, label?)`)

Each key = `{kind, icon, label}`. Kinds map to colors: `success`, `warning`, `danger`,
`info`, `primary`, `neutral`.

| Key | Label | Kind | Used for |
|---|---|---|---|
| approved / completed / resolved / addressed / passed | Approved / Completed / Resolved / Addressed / Passed | success | Finished, confirmed states |
| active / inreview | Active / In review | primary | In progress |
| changes | Changes requested | warning | Gate returned to author |
| partial / open | Partly addressed / Open | warning | Incomplete |
| blocked / failed / rejected | Blocked / Failed / Rejected | danger | Stopped or failed |
| pending / notstarted | Pending / Not started | neutral | Not yet / not applicable |
| deferred | Deferred | info | Informational |
| nospec | No spec | warning | Requirement without a specification (search results) |

Adding a status: add it to `STATUS` with an icon, never reuse a key with a different
meaning, and list it here.

## 3. Derived metrics (`derive()`)

Let `cm = gate0.comments`, `reqs = requirements`.

| Metric | Formula |
|---|---|
| `addressed`, `partial`, `openC` | count of `cm` by status |
| `outstanding` | `cm.length − addressed` (partial counts as outstanding) |
| `awaitingConfirm` | `addressed` (every addressed response awaits reviewer confirmation per the review record) |
| `g0ok` | `gate0.status === 'approved'` |
| `cov(k)` | count of reqs with `trace[k].length > 0`, for k in spec/impl/test |
| `noSpec`, `noTest` | reqs with empty `trace.spec` / `trace.test` |
| `specCoverage` | `pct(reqs with spec, reqs)` |
| `testCoverage` | `pct(reqs with test, reqs)` — shown as "—" when `tests` is empty |
| `implCoverage` | `pct(cov('impl'), reqs)` |
| `oq` | `{open, deferred, resolved}` counts |
| `health` | Gate 0 not approved → **Blocked**; else outstanding comments → **At risk**; else **On track** |
| `progress` | `round((doneStages + activeFraction) / 8 × 100)`; `activeFraction = addressed/total` only while Gate 0 is active, else 0 |

`pct(n, d) = d ? round(n/d×100) : 0`.

### Stage status derivation (`stageStatus`)

| Stage | completed | active | pending | blocked | failed |
|---|---|---|---|---|---|
| requirements | always | | | | |
| gate0 | approved | not approved & not rejected | | | rejected |
| spec | all specs approved/in review | specs exist | Gate 0 ok, no specs | Gate 0 not ok | |
| gate1 | all specs approved at Gate 1 | some specs | Gate 0 ok, no specs | Gate 0 not ok | |
| plan | | ≥1 spec approved at Gate 1 | otherwise | | |
| impl | every requirement has impl | some have impl | none | | |
| gate2, release | never auto-completed | | always | | |

`currentStage` = first `active` stage, else first not-completed stage.

## 4. Sync points

When project state changes, update in this order:

1. `<template id="tpl-records">` rows (authoritative record) — only when a gate record changes.
2. `DATA.gate0` (status, comment statuses, `resp` dates, `inc` IDs).
3. `DATA.requirements[].trace` when specs/implementation/tests are linked; add new requirements.
4. `DATA.specs`, `tests`, `tasks`.
5. `status.md`, `pr_reviews/`, `prompt_history.md` (outside this file).

**Consistency check:** `gate0.comments` status counts must equal the numbers stated in
`status.md` and the Gate 0 record row (e.g. "13 of 22"). If they disagree, do not
silently pick one: set `flag` on the affected comment (shown in its comment drawer)
and report the discrepancy. Known case: comment 7 (see its `flag`).
