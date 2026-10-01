# Behavior Specification

Expected behavior of `.ai-context/dashboard.html`. Function and ID names refer to the
file's `<script>`. Keep this document in step with the code.

## 1. Architecture of the file

| Part | Purpose |
|---|---|
| `<style>` tokens | Design tokens on `:root` (`--background`, `--surface`, `--surface-secondary`, `--border`, `--text-primary`, `--text-secondary`, `--primary`, `--success`, `--warning`, `--danger`, `--info`, `--radius-sm/md/lg`, `--shadow-sm/md`). Dark tokens under `:root[data-theme="dark"]`. No hard-coded colors outside tokens |
| Early `<script>` in `<head>` | Applies saved theme before first paint (no flash) |
| SVG sprite | Icons referenced as `<use href="#i-name">` via `ic(name)` |
| App shell | `#sidebar`, `.topbar`, `#main > #view`, plus `#overlay-root` (drawer, palette), `#tooltip`, `#toast-root` |
| `<template id="tpl-records">` | Preserved authoritative gate records |
| Main `<script>` (one IIFE) | `DATA` → helpers → `derive()` → `PANELS` → views/router → drawer → palette → menus → events → `boot()` |

**Render pipeline:** `route()` → `renderRoute(id)` → `D = derive()` → `VIEWS[id].layout()`
returns panel shells (`P(id)`) → `renderAllPanels()` → per-panel `renderPanel()` fills
`[data-slot]` from `PANELS[id].render({full})`. Panels are independent.

**Events:** one delegated `click`, `change`, `input`, `keydown`, `mouseover/out`,
`focusin` listener on `document`. Elements declare behavior with `data-action`. Do not
attach per-element listeners (avoids duplicates and leaks).

## 2. Layout & shell

- Desktop (>900px): fixed sidebar (248px) + content. Sidebar collapse button toggles
  `.collapsed` (64px, icons only, counts become corner dots); state persisted.
- ≤900px: sidebar is an off-canvas drawer opened by the hamburger; scrim closes it;
  selecting a link, pressing Esc, or clicking outside closes it. Collapse state is
  ignored on mobile.
- Topbar: project selector (single project), environment tag, search button, help, theme
  menu, profile menu. Search text/help hide on small screens.
- Skip link jumps to `#main`. After navigation, focus moves to the page `<h1>`
  (`#page-h1`) on non-dashboard routes.
- Breakpoints: all grids → 1 column at ≤1100 (`.grid.two-one`, `.two`, `.one-two`);
  page padding shrinks at ≤760; lifecycle stepper goes vertical at ≤980.
- Tables sit in `.table-wrap` (horizontal scroll, `tabindex=0`, labelled region).

## 3. Navigation & routing

Hash router: `#/<id>`; default/unknown → `dashboard`. `hashchange` triggers `route()`.
Document title: `<View> · SDD Control Center — <project code>`.

Sidebar groups and views (`NAV` / `VIEWS`):

| Group | View id | Contents |
|---|---|---|
| Overview | `dashboard` | Full overview (§4) |
| Specification | `specifications` | Spec registry |
| | `questions` | Open Questions (full) |
| Engineering | `implementation` | Implementation progress |
| | `testing` | Testing (full) |
| Governance | `reviews` | Gate cards + Gate 0 comments table + **preserved records** |

The active link has `aria-current="page"`. Count badges (from `NAV[].count()`):
Specifications = spec count (hidden at 0); Open Questions = open count (hidden at 0,
warn tone); Reviews & Gates = outstanding comments (warn).

Dashboard panel order encodes hierarchy (L1 → L3). Do not reorder casually:
L1 hero, KPIs, lifecycle → L2 gates + open questions → L3 testing.

## 4. Panel behavior

Each panel has: title, optional info tooltip (`tip`), subtitle (`sub()`), optional
"view all" link (`more`, shown only when not `full`), and a `render({full})` function.
"Compact" = dashboard version (lists, limited rows); "full" = dedicated-view version.

### Hero (project overview)
Project name; stage badge (current stage, "— Changes requested" while Gate 0 open);
health badge (Blocked while Gate 0 is not approved); overall progress % + bar; readiness verdict banner; meta grid: Spec
Author, Current gate + reviewer, Current phase, Last updated (+source), Next review
("date not scheduled").
Verdict: *Ready for Gate 1* only when Gate 0 approved; otherwise *Not ready* with
counts. Must be answerable in 5–10 seconds: health, phase, what's blocked.

### KPI cards (5)
Specification Coverage, Requirements, Open Questions, Pending Reviews (unresolved
comments), Test Coverage. Each: label (+tooltip), value, description, optional
progress bar, status badge, optional trend text. Cards with a route are clickable via a
stretched `.kpi-hit` button (card itself is a `div`: **never nest a button inside a
button** — the tooltip button would break the DOM). Specification Coverage links to
Specifications, Open Questions to Open Questions, Pending Reviews to Reviews & Gates,
Test Coverage to Testing; Requirements is informational. Test Coverage shows "—" with
no tests.

### Lifecycle stepper
8 stages (`STAGES`): Requirements, Gate 0, Specification, Gate 1, Architecture & Plan,
Implementation, Gate 2 · Validation, Release. Status icons: completed ✓, active ●,
pending ○, blocked 🔒 (dashed red), failed ✕. Active stage has `aria-current="step"`.
Click → drawer with summary, exit criteria checklist (`STAGES[].exit()`), owner and, if
blocked, why. Horizontal on desktop; vertical list ≤980px.

### Gate & Review Status
Three cards (Gate 0/1/2): status badge, resolved bar when applicable, reviewer, review
date. Gate 1 is **Blocked** until Gate 0 approved. Click → gate drawer (Gate 0 drawer has
comment filter chips and a clickable comment list).

### Testing Overview
Coverage %, Passed / Failed / Blocked / Not executed, requirements without tests.
Empty state when no tests; full view adds a test table.

### Implementation / Specifications
Implementation: % implemented, task count, plus an honest "not
started" empty state. Specifications: registry table, or the blocked-until-Gate-0 empty state with a
button to the Gate 0 drawer.

### Open Questions
Chips: Open / Deferred / Resolved / All (counts). **Default filter = Open**, so with
zero open the empty state shows with a *Show all questions* button. Full view adds a text
filter. Compact shows 6 then "View all open questions".

### Gate 0 Review Comments (Reviews view)
Chips (All / Open / Partly addressed / Addressed) + table (number, title, status,
responded date, incorporated-in). Row → comment drawer.

### Gate Review Records (Reviews view)
Clones `<template id="tpl-records">` into the panel. Unchanged markup; styled by
`.records` CSS. Must always be present.

## 5. Detail drawer

`openDrawer(type, id)`; types: `req`, `comment`, `gate`, `stage`, `oq`, `help`. Right-side `role="dialog" aria-modal`, stack-based
(back button when stack > 1). Focus moves to Close; Tab is trapped; Esc or scrim closes;
focus returns to the opener. Unknown id → toast. Requirement drawer shows type, area,
origin, linked specification and the Gate 0 comments that changed it. Add a type by adding `DRAWERS[type]`, then route it in
`openTarget`.

## 6. Global search (command palette)

Open: header button, `Ctrl/⌘+K`, or `/` (when not typing). Close: Esc or scrim.
- Index (`buildIndex`): requirements, specs, tests, open questions, review comments,
  gates, pages.
- Scope chips: All, Requirements, Specs, Tests, Open Questions, Reviews.
- Matching: all whitespace-separated terms must appear (case-insensitive) in the item's
  search text. Ranking: exact id, id prefix, other, pages last. Max 40 results, grouped
  by type, matches highlighted (escaped).
- Empty query: *Go to* pages plus quick actions (toggle theme, collapse sidebar).
- Result shows id/label, title, type, and status badge. Enter or click opens the drawer
  (or navigates for pages). ↑/↓ moves selection (`aria-activedescendant`), count announced
  via `aria-live`.
- No results: message; for prefixes `SPEC-` and `TC-`/`TEST-` explains that object type
  does not exist yet.

## 7. Filters & sorting (state in `ui.panel[id]`)

| Panel | State |
|---|---|
| questions | `{f:'open', q}` |
| comments | `{f}` |
| drawer-gate0 | `{f}` |

Filter state is in memory only (not persisted, reset on reload). After any re-render the
previously focused control is refocused via its `data-fk` key (text carets preserved);
every filter control must carry `data-fk`.

## 8. Profile & theme menus

Theme: Light / Dark / System (follows `prefers-color-scheme`, reacts to OS changes),
saved as `sdd.theme`. Profile: shows the current user (Spec Author), email, roles; a
note that approval is by git email. There is no role switcher.

## 9. Tooltips

`.info-tip` buttons with `data-tip` keys from `TIPS`. Show on hover, focus and click;
hide on leave, blur, Esc, scroll or outside click. Sets `aria-describedby` while
visible. Must exist for: gate, specification coverage, progress, lifecycle, test
coverage, reviewer confirmation. New domain concepts get a `TIPS` entry.

## 10. Loading / empty / error states

- **Loading:** on first route render only, panels show a skeleton for ~180 ms
  (`skeleton()`), then render. Navigation afterwards renders immediately.
- **Empty:** `stateEmpty(title, text, icon, extraHtml)`; copy rules in business-rules.md §5.
- **Error:** see business-rules.md §4.

## 11. Accessibility

Landmarks (`banner`, `nav`, `main`); skip link; visible `:focus-visible` ring; status
= icon + text; progress bars use `role="progressbar"` with `aria-valuenow`; dialogs are
modal with focus trap and focus return; tables have `th scope="col"`; scrollable regions are focusable and labelled; tooltips reachable by
keyboard; `prefers-reduced-motion` disables animation; contrast tokens meet WCAG AA in
both themes.

## 12. Persistence

Only `localStorage`, always via `store.get/set` (try/catch). Keys:
`sdd.theme` (light|dark|system), `sdd.sidebar` (collapsed|expanded). *Reset
preferences* removes both.
No cookies, no network, no other storage.

## 13. Verification (run after any change)

1. Extract the main `<script>` and run `node --check` — must pass.
2. Open in a browser (or headless Chrome) and visit every `#/<view>`: no
   `.state.error` elements, no console errors.
3. Exercise: Open Questions filter, `Ctrl+K` search (`BRD-021`, an unknown `SPEC-023`)
   and its requirement drawer, gate and lifecycle-stage drawers, theme switch persists
   after reload, sidebar collapse.
4. Confirm `<template id="tpl-records">` still holds the four tables and the Gate 0 row.
5. Test populated paths by temporarily adding sample `specs`, `tests` and
   `trace` links in a scratch copy (never in the committed file).
