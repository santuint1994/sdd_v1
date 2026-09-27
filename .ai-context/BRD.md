# Business Requirements Document (BRD)

## Status
Pending Review

## Source Document
- **File:** `docs/Internal_Transfer_Digital_Journey_SOW.pdf`
- **Title:** Internal Transfer Digital Journey — One-Point Employee Portal | Next.js + Node.js + PostgreSQL
- **Version / Date:** v1.1 | 24 September 2026
- **Document Status (per source):** Draft for stakeholder review
- **Business Owner:** To be confirmed by the organisation

> This is a single-document baseline (one BRD source file found in `docs/`); no
> version-conflict resolution was required. The source document is itself a "Draft
> for stakeholder review" SOW — several items below are marked `[Open]` because the
> SOW explicitly defers them to discovery/change control (see Open Questions).

## Objective / Business Objectives
- Centralise request capture, approval routing, task orchestration, and status
  visibility for employee-initiated internal transfers within the existing One-Point
  Employee Portal.
- Enable employees to submit a complete transfer request (proposed
  department/business unit, location, role, effective date, optional reason).
- Give employees a single view of overall request status and pending stakeholder
  actions.
- Provide traceable approvals, HR validation, controlled downstream updates, and
  final confirmation.
- Reduce manual follow-up via notifications, ownership, exception handling, and an
  audit trail.

## Scope
In scope (per source SOW §3, §6):
- Employee-facing request submission, request history/detail view, and status
  timeline within the existing One-Point Employee Portal.
- Role-based stakeholder worklists (current manager, receiving manager where
  required, HR) with approve / reject-with-reason / request-clarification /
  reassignment-escalation actions.
- HR eligibility validation and confirmation of target organisational details and
  effective date.
- Configurable orchestration/routing of approved requests into HR, payroll, IT, and
  facilities tasks, via agreed APIs or task handoff mechanisms, with task-level
  status, retries/manual resolution for failed handoffs, and duplicate-execution
  safeguards.
- Completion rule: overall status becomes `Completed` only when all designated
  mandatory tasks finish.
- Notifications (submission, action required, approval/rejection, delays, final
  completion) via existing approved portal channels.
- Operational queue and basic reporting (request volume, current stage, pending
  owner, overdue tasks, completion time), access-restricted by role.
- Audit history for submissions, comments, decisions, task ownership, and status
  changes.

## Actors & Stakeholder Roles
- **Employee** — initiates a transfer request, tracks status, responds to
  information requests.
- **Current Manager** — reviews/approves/rejects/requests clarification on a
  submitted request.
- **Receiving Manager** — reviews/approves where required by the (proposed, not yet
  confirmed) business rule.
- **HR** — validates eligibility and transfer details, confirms effective date and
  required downstream actions, performs downstream execution ownership for HR
  system updates.
- **Payroll / IT / Facilities** — execute applicable downstream tasks assigned to
  them by the orchestration layer.
- **Portal / Accountable Business Owner** — verifies mandatory task completion,
  closes the request, triggers employee notification.
- **Organisation / Product Owner** — approves scope and policies; provides timely
  decisions, access, environments, UAT sign-off.
- **System Owners** — provide interface specifications, test data, access, and
  integration support for HR/payroll/IT/facilities systems.

## Functional Requirements

| ID | Requirement |
|---|---|
| BRD-001 | Employee can authenticate via the existing One-Point Employee Portal's approved identity and access model. |
| BRD-002 | Employee can submit a transfer request specifying: proposed department/business unit, location, role/job position, effective date, and an optional reason, after reviewing their current employment information. |
| BRD-003 | The system validates request fields, confirms submission, and issues a unique reference number. |
| BRD-004 | Employee can view request history/detail, overall status, a stage-by-stage timeline, pending stakeholder actions, decision reasons, and relevant completion dates. |
| BRD-005 | Employee can respond to a request for additional information, where permitted by policy. |
| BRD-006 | Current manager (and receiving manager, where required — see BRD-OQ-1) has a role-based worklist to approve, reject with reason, request clarification, or (subject to discovery) reassign/escalate a request. |
| BRD-007 | HR has a role-based worklist with an eligibility checklist to validate a request and confirm target organisational details and effective date. |
| BRD-008 | The system records audit history for submissions, comments, decisions, task ownership, and status changes, including actor, action, timestamp, and relevant request state. |
| BRD-009 | Upon HR validation, the system configurably routes the approved request into applicable HR, payroll, IT, and facilities tasks via agreed APIs or an agreed task handoff mechanism. |
| BRD-010 | The system tracks task-level statuses and completion evidence/reference for each downstream task, supports retries or manual resolution for failed handoffs, and guards against duplicate downstream execution. |
| BRD-011 | Overall request status transitions to `Completed` only when all designated mandatory downstream tasks have completed; a request must not display as completed merely because it was approved. |
| BRD-012 | The system sends notifications for submission, action required, approval/rejection, delays, and final completion, via existing approved portal channels. |
| BRD-013 | The system provides an operational queue and basic reporting (request volume, current stage, pending owner, overdue tasks, completion time), with access restricted by stakeholder role and organisation policy. |
| BRD-014 | The system supports the request status model: `Draft` (optional, if approved), `Submitted / Pending approval`, `Information required`, `HR review`, `Approved / In progress`, `Blocked`, `Completed`, `Rejected / Withdrawn`. |

## Non-Functional Requirements (NFRs)
- **Security:** Portal authentication, role-based authorisation, least-privilege
  access, encrypted transport, and protection of personal information.
- **Auditability:** Record actor, action, timestamp, and relevant request state for
  every material decision or update (supports BRD-008).
- **Reliability:** Recoverable integration failures, clear error ownership, and
  prevention of duplicate downstream processing (supports BRD-010).
- **Accessibility & Usability:** Align with the existing portal design system and
  the organisation's accessibility standard.
- **Performance, availability, retention, and monitoring thresholds:** `[Open]` —
  the source SOW states these will be "established during discovery based on
  existing platform standards"; no measurable targets are defined yet (see Open
  Questions).

## Business Rules
- A request reaches `Completed` only after all designated mandatory tasks satisfy
  the agreed completion rule (BRD-011).
- Receiving-manager approval is a **proposed** business rule only, not a confirmed
  policy (source SOW §2) — see Open Questions.
- Compensation changes, payroll calculations, and policy decisions remain owned by
  the organisation's systems of record, not by this portal/journey.
- Existing enterprise systems (HR, payroll, identity, facilities) remain
  authoritative for employee, payroll, access, and facilities data; this journey
  orchestrates but does not own that data.

## Dependencies
- Existing One-Point Employee Portal, its approved identity/access model, HR master
  data, and role/location catalogues, provided by the organisation.
- System owners must confirm API availability, credentials, sandbox access,
  integration specifications, and data ownership for HR, payroll, IT, and
  facilities systems.
- HR must supply eligibility criteria, approval policy, effective-date rules,
  withdrawal rules, and mandatory completion criteria.
- Notification channels, hosting, logging, and deployment environments are assumed
  to already exist or be provided separately.
- Next.js frontend + Node.js backend + PostgreSQL stack (per source SOW §5),
  aligned with this repository's scaffolded `frontend/` (Next.js) and `backend/`
  (Express/Node.js + Sequelize/PostgreSQL).

## Assumptions
See `.ai-context/assumptions.md` for the full list; summarized here for traceability:
- The existing portal's identity/access model can be integrated with as-is (no new
  IdP build).
- Downstream HR/payroll/IT/facilities systems expose an integrable API or an
  agreed handoff mechanism (no assumption of building new source-system
  functionality).
- "Backend" in this repository (Express/Node.js) satisfies the SOW's "Node.js
  backend" layer; "database" (PostgreSQL/Sequelize) satisfies the SOW's PostgreSQL
  layer.

## Out of Scope
- Redesign of the underlying HR, payroll, IT service-management, or facilities
  platforms.
- Building a new payroll engine, identity provider, or enterprise master-data
  service.
- External recruitment, cross-company transfer, immigration, or relocation benefit
  processing, unless separately agreed.
- Historical data migration, bulk backfill, and custom integrations not identified
  and approved during discovery.
- Dates, effort, team composition, commercials, and any support period (explicitly
  deferred to a separately approved project plan).

## Open Questions
| ID | Question |
|---|---|
| BRD-OQ-1 | Is receiving-manager approval a confirmed policy, or only the current manager's approval, for the Review step? |
| BRD-OQ-2 | What are HR's eligibility criteria, approval policy, effective-date rules, and mandatory completion criteria? |
| BRD-OQ-3 | What are the confirmed source systems and integration method (API vs. task handoff) for each of HR, payroll, IT, and facilities? |
| BRD-OQ-4 | What tasks are mandatory (vs. optional) for the completion rule per department/transfer type? |
| BRD-OQ-5 | Is employee withdrawal of a submitted request supported, and if so, under what rules? |
| BRD-OQ-6 | How is the effective date handled/validated (e.g., minimum lead time, conflicts with existing assignments)? |
| BRD-OQ-7 | What are the target service-level (performance/availability) and data-retention requirements? |
| BRD-OQ-8 | Is `Draft` (unsubmitted, saved) request state approved for this journey, or is direct submission required? |

## Acceptance Criteria
- **BRD.AC1** — An eligible employee can submit a valid request and receives a
  unique reference number.
- **BRD.AC2** — Required reviewers can take permitted actions (approve / reject
  with reason / request clarification), with decisions and reasons visible to
  authorised users.
- **BRD.AC3** — The employee can see the overall status and the owner/status of
  pending activities without contacting each team directly.
- **BRD.AC4** — Approved requests generate only the applicable downstream actions;
  failures are visible and recoverable.
- **BRD.AC5** — The request reaches `Completed` only after all mandatory tasks
  satisfy the agreed completion rule.
- **BRD.AC6** — UAT scenarios for approval, rejection, clarification, withdrawal
  (if enabled), integration failure, and final completion all pass.
