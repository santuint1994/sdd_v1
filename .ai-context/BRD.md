# Business Requirements Document (BRD)
## Internal Transfer Digital Journey

**Status:** Pending Review — Revision 3
**Source:** `docs/Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.0.pdf` (internally titled SOW v1.4, 27 Sep 2026, "Draft for stakeholder review") — supersedes `docs/Internal_Transfer_Digital_Journey_SOW.pdf` (v1.1, 24 Sep 2026).
**Last Updated:** 2026-09-28

> Revision 2 was rebuilt from the source SOW after the previous working copy of
> this file was found emptied on disk (see `.ai-context/brd-change-log.md` entry
> "BRD.md Recovery"). Revision 3 removes the Facilities/Admin role and its
> task-execution requirement (BRD-026) at explicit user request — this is a
> user-directed scope reduction, not a change reflected in the source SOW (the
> SOW still describes Facilities/Admin throughout); flagged here for visibility
> per `AGENTS.md` conflict-flagging governance rather than silently applied.

---

## Objective / Business Objectives

Employees currently coordinate with managers, HR, payroll and IT across
multiple touchpoints to complete an internal transfer. The proposed solution
centralises request capture, approval routing, organisation assignment, vacancy
validation, downstream task orchestration and status visibility within the
One-Point Employee Portal.

- Enable employees to submit internal transfer requests against configured
  departments, locations, designations and vacancies.
- Give each user an individual login and a role-aware view of assigned employees,
  requests and tasks.
- Provide traceable Reporting Manager, optional Receiving Manager and HR review
  stages.
- Provide controlled downstream HR, payroll and IT activities after
  approval.
- Provide a modern Super Admin Panel for organisation setup, user management,
  vacancies and transfer administration.
- Reduce manual follow-up through notifications, clear ownership, exception
  handling, dashboards and audit logs.

---

## Scope

- Modern responsive Admin Panel and role-based dashboards.
- User account creation with automatically generated unique User ID and temporary
  password.
- Location, department/business unit and designation master management.
- Employee, Reporting Manager, HR and IT user management and assignment.
- Vacancy creation and capacity/headcount management.
- Employee transfer request initiation, approval, validation, execution and
  closure.
- HR organisation metadata update and payroll task assignment.
- Transfer/organisation document upload and controlled access.
- IT task assignment and completion tracking.
- Notifications, operational reporting, audit logs and exception handling.

Proposed technical architecture: Next.js frontend, Node.js backend (RBAC, business
validation, orchestration, APIs), PostgreSQL (transactional/workflow/audit data),
and controlled handoffs to existing enterprise identity, HR, payroll,
and IT/service-management systems.

---

## Actors & Stakeholder Roles

| Role | Primary Responsibility | Visibility / Scope |
|---|---|---|
| Super Admin | Organisation setup, user administration, vacancy/capacity management and transfer administration. | All configured organisational data and transfer workflows. |
| Employee | Initiate and track own internal transfer requests. | Own profile, permitted vacancies and own transfer history. |
| Reporting Manager | Review transfer requests for assigned employees. | Assigned employees and related requests. |
| Receiving Manager (optional) | Review proposed incoming transfers. | Requests routed to the target team/organisation scope. |
| HR | Eligibility validation, target organisation confirmation, documents and downstream coordination. | Assigned location/organisation employees and requests. |
| IT | Execute transfer-related access/provisioning tasks. | Assigned IT tasks and minimum required employee information. |

Every user has an individual authenticated account. Access is role-based and
scope-based; users see only the employees, requests, tasks and organisational
information assigned or permitted to them. Super Admin has cross-organisation
administrative visibility, subject to company policy.

Organisation hierarchy for workflow routing: `Super Admin -> Location -> HR ->
Reporting Manager -> Employee`, with location-based IT teams configured
alongside it.

---

## Functional Requirements

### Modern Admin Panel
- **BRD-001** — *(Modified)* Every user (Employee, Reporting Manager, Receiving
  Manager, HR, IT, Super Admin) has an individual authenticated
  account with a role-aware, permission-scoped view. Authentication model (local
  credentials / enterprise SSO / hybrid) is open — see BRD-OQ-12.
- **BRD-015** — The Admin Panel provides a modern, professional, responsive
  interface with role-aware navigation showing only permitted modules; dashboard
  cards for operational indicators (total employees, active transfers, pending
  approvals, HR reviews, blocked tasks, open vacancies); searchable/sortable/
  filterable data tables with pagination and status badges; consistent create/view/
  edit forms with inline validation; confirmation dialogs for sensitive actions
  (deactivation, reassignment, credential reset); responsive desktop/tablet
  layouts with accessibility support; and clear loading/empty/no-access/error
  states.
- **BRD-016** — Admin modules: Dashboard, Users, Locations, Departments,
  Designations, Vacancies, Transfers (view/filter/administrative
  reassignment/intervention), Documents (view authorised metadata/access), and
  Audit Logs (search/filter auditable actions).

### User Provisioning & Account Lifecycle
- **BRD-017** — When Super Admin creates an Employee, Reporting Manager, HR, IT
  or other enabled user, the system provisions an individual login account:
  generates a unique User ID per an agreed company naming/numbering convention
  (see BRD-OQ-13), generates a strong temporary password automatically, validates
  duplicate user/employee rules before creation, creates the user and
  organisational profile in a controlled transaction, and shows the generated
  credentials only to an authorised administrator subject to company security
  policy.
- **BRD-018** — The system supports an approved secure mechanism for delivering
  initial credentials (email/SMS/identity service dependent), requires password
  change on first login, and stores passwords only as secure hashes — plaintext
  passwords must never be retained in PostgreSQL, logs, reports or audit records.
- **BRD-019** — Account statuses: Pending Activation, Active, Locked,
  Inactive/Deactivated. Administrator-initiated credential reset generates a new
  temporary password and requires password change on next login. The system
  supports failed-login protection, session timeout and a password policy per
  the organisation's security standard.
- **BRD-020** — The system audits account creation, activation/deactivation,
  credential reset, lock/unlock and first-login password change events, without
  storing plaintext password values. The account creation flow follows: select
  role → enter profile → validate → create → generate credentials → deliver →
  first login → audit.

### Organisation Master Data & Hierarchy
- **BRD-002** — *(Modified)* Super Admin can create, edit, activate and
  deactivate Locations; create and manage Departments/Business Units; create and
  manage Designations/Job Positions.
- **BRD-021** — Super Admin can create Vacancies with department, designation,
  location, capacity/headcount and status (Open / Full / On Hold / Closed);
  vacancy fields include vacancy reference, allocated/filled count, and derived
  available capacity. The system prevents over-allocation per agreed concurrency/
  reservation rules. Capacity reservation timing (submission, approval, or HR
  validation) is open — see BRD-OQ-14.
- **BRD-022** — Super Admin can create HR, IT and Reporting
  Manager users and assign them location-wise and/or by organisational scope; can
  create Employees with employee ID, department, designation, location, Reporting
  Manager and assigned HR; and manages user-role mappings and organisational
  relationships (Employee ↔ Department/Designation/Location/Reporting
  Manager/HR; Reporting Manager ↔ assigned employees; HR/IT ↔ location
  or organisational scope).

### Transfer Request Workflow
- **BRD-003** — Employee can log in with individual credentials, view current
  profile (department, designation, location, Reporting Manager), and browse
  eligible internal vacancies subject to company visibility rules.
- **BRD-004** — *(Modified)* Employee can submit a transfer request with proposed
  department/business unit, location, designation/role, vacancy, effective date
  and optional reason, and receives a unique transfer reference number and
  submission confirmation. Employee can track overall status, stage timeline,
  pending stakeholder actions, decision reasons and completion dates, and respond
  to clarification requests where permitted.
- **BRD-023** — Reporting Manager can view assigned employees and requests
  requiring action, review requested details, and approve, reject (mandatory
  reason), or request clarification, with comments/remarks and visibility of
  previous decisions. Receiving Manager approval can be enabled as a
  configurable company policy (BRD-OQ-9).
- **BRD-005** — End-to-end workflow: (1) Employee initiates; (2) Reporting
  Manager review (approve/reject/clarify); (3) Receiving Manager review, if
  configured; (4) HR validation (eligibility, target organisation,
  vacancy/capacity, effective date); (5) Execute — HR/Payroll/IT
  update organisation metadata and complete downstream tasks; (6) Verify — all
  mandatory tasks/evidence complete; (7) Close — mark Completed and notify
  employee.
- **BRD-006** — *(Modified)* Super Admin can reassign or administratively
  intervene in transfer workflows where company policy permits (covers the
  administrative-intervention capability; see ASM-013 regarding v1.1's
  manager-level reassignment/escalation action, flagged, not confirmed removed).

### HR Validation, Metadata & Payroll
- **BRD-007** — *(Modified)* HR can view assigned employees/requests by
  location/organisational scope; validate employee eligibility and proposed
  department, location, designation, vacancy and effective date; validate
  vacancy/capacity per agreed business rules; and approve HR validation, reject
  with reason, or return the request for additional information.
- **BRD-024** — HR can assign or update organisation metadata required for the
  transferred employee (fields and authoritative source system open — see
  BRD-OQ-15) and assign the applicable new payroll/payroll configuration task.
  The portal coordinates payroll handoff/status; payroll calculations,
  compensation rules and statutory processing remain with the organisation's
  authoritative payroll system. Payroll task status and completion reference are
  tracked as part of the transfer workflow.

### IT Task Execution
- **BRD-025** — IT can view assigned tasks via location/workflow routing
  (minimum required employee/transfer information only), record access
  provisioning/removal/modification, email/group changes and device/asset
  activities, add comments/completion evidence, and mark tasks In Progress,
  Completed or Blocked with reason.
- **BRD-026** — ***(Removed — Revision 3, at explicit user request)*** Facilities/
  Admin role and its task-execution capability (workspace/seating/
  building-access-card/asset-movement tasks) are removed from scope. This
  removes an SOW-supported role/requirement, not an SOW-driven change — flagged
  here for visibility rather than silently dropped. See
  `.ai-context/brd-change-log.md` for the full delta record.

### Document Management
- **BRD-027** — HR can upload authorised transfer documents and organisation
  documents, linked to the relevant employee and/or transfer request. Document
  access follows role and organisational scope. Document metadata includes
  category/type, uploader, upload timestamp and employee/request reference.
  Allowed file types, maximum size, storage, malware scanning, retention,
  download/view rules and deletion policy are open — see BRD-OQ-16. Document
  upload and authorised document actions are auditable.

### Audit & Traceability
- **BRD-008** — *(Modified — scope expanded)* All material actions performed by
  every role are auditable, capturing actor/user, role, action, affected
  entity/request, timestamp, relevant previous/new values, status/state and
  remarks. Auditable events include: user creation/activation/deactivation/
  assignment/credential reset; location/department/designation/vacancy
  configuration changes; employee hierarchy changes (Reporting Manager/HR
  assignment); transfer submission/withdrawal/clarification; manager/receiving-
  manager approvals/rejections; HR validation, vacancy allocation and
  organisation metadata updates; payroll/IT task assignment,
  reassignment and completion; document upload and authorised document actions;
  and administrative interventions and final transfer completion. Plaintext
  passwords must never be written to the audit log.

### Notifications & Reporting
- **BRD-009** — *(wording only)* Notifications cover account
  creation/activation (where approved), transfer submission, action required,
  clarification, approval/rejection, downstream task assignment,
  delays/blockage and final completion.
- **BRD-010** — *(Unchanged)* Role-specific dashboards and worklists for
  assigned employees, requests and tasks.
- **BRD-011** — *(Unchanged)* Operational reporting for request volume, current
  stage, pending owner, overdue tasks, vacancy utilisation and completion time.
- **BRD-013** — *(Modified — scope expanded)* Super Admin reporting spans the
  authorised organisation scope, including vacancy utilisation; other roles
  receive restricted reporting according to policy.

### Status & Exception Model
- **BRD-014** — *(Modified — added status)* Request statuses: Draft (optional,
  if draft saving enabled), Submitted/Pending approval, Information required,
  **Manager approved** (required manager approval completed; next configured
  stage pending), HR review, Approved/In progress, Blocked, Completed,
  Rejected/Withdrawn (withdrawal rules open — BRD-OQ-5). A request must not be
  shown as Completed merely because it has been approved — completion requires
  all configured mandatory downstream activities to satisfy the completion rule.
- **BRD-028** — Super Admin retains cross-workflow oversight: view all
  employees, vacancies, transfer requests, workflow tasks and audit history, and
  reassign or administratively intervene in transfer workflows where company
  policy permits.

---

## Non-Functional Requirements (NFRs)

- **Authentication**: Individual user accounts using the approved identity model
  (local credentials, enterprise SSO/identity provider, or hybrid — open, see
  BRD-OQ-12); temporary password change required on first login where local
  credentials are used.
- **Authorisation**: Role-based and scope-based access with least privilege
  enforced in both UI and APIs.
- **Credential security**: Strong password hashing; no plaintext password
  persistence anywhere (DB, logs, reports, audit); secure reset and
  failed-login protection.
- **Transport & data protection**: Encrypted transport and protection of
  personal/employee information.
- **Auditability**: Protected audit records for material decisions,
  configuration changes and security events.
- **Reliability**: Recoverable integration failures, clear error ownership, and
  safeguards against duplicate downstream execution.
- **Privacy**: Employee and document access restricted to authorised roles and
  organisational scope.
- **Accessibility/usability**: Align with the organisation's portal design and
  accessibility standards.
- **Performance, availability, backup, retention, monitoring targets**: `[Open]`
  — no numeric targets are supplied by the source SOW; to be confirmed during
  discovery (see BRD-OQ-7). No defaults are assumed (per ASM-006).

---

## Business Rules

1. Access is strictly role-based and scope-based; a user sees only employees,
   requests, tasks and organisational data assigned/permitted to them.
2. A transfer request cannot be marked Completed solely because it has been
   approved — all configured mandatory downstream activities must satisfy the
   completion rule first.
3. The system must validate vacancy/capacity and prevent over-allocation
   according to agreed concurrency and reservation rules before final transfer
   confirmation.
4. Rejections by a Reporting Manager or HR require a mandatory reason.
5. Plaintext passwords must never be stored or logged anywhere in the system
   (database, application logs, reports, audit records).
6. New user accounts must have a unique, duplicate-checked User ID and a
   system-generated strong temporary password; password must be changed on
   first login.
7. Receiving Manager review is a configurable, policy-driven step — not
   mandatory by default.
8. Document access follows role and organisational scope; users do not
   automatically receive access to all employee documents.
9. Payroll calculations, compensation rules and statutory processing remain the
   responsibility of the organisation's authoritative payroll system; the
   portal only coordinates the handoff/status of the payroll task.
10. Every material configuration, security, and workflow action must generate
    an audit record capturing actor, role, action, affected entity, timestamp,
    before/after values, and status.

---

## Dependencies

- Existing One-Point Employee Portal identity/access model (integration
  target — no new identity provider is being built; see Out of Scope).
- Downstream HR, payroll and IT (service-management) enterprise
  systems must expose an integrable API or an agreed task-handoff mechanism.
- Enterprise identity, HR, payroll, IT/service-management and
  email/SMS notification interfaces or controlled handoffs must be agreed
  during discovery/integration workstreams.
- System owners must confirm APIs, credentials, sandbox/test environments,
  interface specifications and data ownership.
- Notification channels, hosting, logging and deployment environments are
  assumed to already exist or be provided separately, unless brought in via
  change control.
- Technical stack dependency: Next.js frontend, Node.js backend, PostgreSQL
  datastore, per the proposed architecture — satisfied in this repository by
  the scaffolded Next.js frontend and Express (TypeScript) + Sequelize/
  PostgreSQL backend (see ASM-004).

---

## Assumptions

See `.ai-context/assumptions.md` (ASM-001 through ASM-013) for the full,
BRD-traced assumptions register, generated and maintained alongside this
document. Summary of key assumption areas: identity/SSO integration approach,
Receiving Manager review being conditional, downstream system integrability,
technology-stack mapping to this repository's scaffold, Draft state being
optional, absence of invented performance/availability targets, withdrawal
rules being unconfirmed, authentication model being fully open, User ID/
password policy being organisation-supplied, vacancy capacity-reservation
timing being unconfirmed, document policy being unconfirmed, organisation
metadata ownership being unconfirmed, and the disposition of v1.1's
manager-level reassignment/escalation action (ASM-013).

---

## Out of Scope

- Redesign or replacement of underlying HR, payroll or IT service-management
  platforms.
- Facilities/Admin role, and any workplace/facilities task management
  (workspace, seating, building/access-card, asset movement), per explicit
  user instruction to remove Facilities/Admin from scope (Revision 3).
- Building a new payroll calculation engine, identity provider, or enterprise
  master-data platform.
- External recruitment, cross-company transfer, immigration or relocation
  benefit processing, unless separately agreed.
- Historical data migration, bulk backfill, and custom integrations not
  identified and approved during discovery.
- Advanced workforce planning or predictive vacancy forecasting, unless
  separately agreed.

---

## Open Questions

| ID | Question | Status |
|---|---|---|
| BRD-OQ-1 | Is Receiving Manager review confirmed/always-required, or company-policy-toggleable? | Open (carried from v1.1) |
| BRD-OQ-2 | What are the HR eligibility/approval/hierarchy/vacancy/effective-date/completion rules? | Open (carried from v1.1) |
| BRD-OQ-3 | What are the confirmed source systems and integration method per team (HR/payroll/IT/identity)? | Open (carried from v1.1) |
| BRD-OQ-4 | Which downstream tasks are mandatory vs. optional per department/transfer type? | Open (carried from v1.1) |
| BRD-OQ-5 | Is employee withdrawal supported, and under what rules? | Open (carried from v1.1) |
| BRD-OQ-6 | How is effective date handled/validated? | Open (carried from v1.1) |
| BRD-OQ-7 | What are the target performance/availability/backup/retention/monitoring requirements? | Open (carried from v1.1) |
| BRD-OQ-8 | Is Draft (unsubmitted) request state approved? | Open (carried from v1.1) |
| BRD-OQ-9 | **[New in v1.4]** What is the exact reviewer sequence, and is manager worklist reassignment/escalation supported — and if so, by whom (Reporting Manager directly, or only via Super Admin's administrative-intervention authority, BRD-028)? | Open (see ASM-013) |
| BRD-OQ-10 | **[New in v1.4]** What is the authoritative source system for organisation hierarchy (Location/HR/Manager/Employee)? | Open |
| BRD-OQ-11 | **[New in v1.4]** What is the approved User ID naming/numbering convention? | Open |
| BRD-OQ-12 | **[New in v1.4]** Will authentication use local credentials, enterprise SSO/identity provider, or a hybrid model? | Open |
| BRD-OQ-13 | **[New in v1.4]** What is the organisation's password policy and initial credential delivery mechanism? | Open |
| BRD-OQ-14 | **[New in v1.4]** What are the vacancy capacity-reservation timing and concurrency rules? | Open |
| BRD-OQ-15 | **[New in v1.4]** What organisation metadata fields does HR update, and what is their authoritative source? | Open |
| BRD-OQ-16 | **[New in v1.4]** What are the document categories, file types, size, retention, access/deletion rules? | Open |
| BRD-OQ-17 | **[New in v1.4]** What is the exact payroll handoff/task definition and completion-reference format? | Open |

> Per `.agent/skills/int-brd-ingestion` (Mandatory Reviewer Open Questions
> Resolution Protocol), the assigned Gate 0 reviewer must provide explicit
> answers/resolutions for all 17 open questions above, recorded in the Gate 0
> PR review file, before this BRD can be marked Approved.

---

## Acceptance Criteria

- **BRD.AC1** — *(Modified)* Super Admin can access a modern role-aware Admin
  Panel and manage the agreed master data and user modules (Locations,
  Departments, Designations, Vacancies, Users).
- **BRD.AC2** — Super Admin can create Employee, Reporting Manager, HR, IT and
  other enabled user accounts within authorised scope; account creation
  generates a unique User ID and strong temporary password per the agreed
  policy.
- **BRD.AC3** — The user must change the temporary password on first login, and
  plaintext passwords are never stored in PostgreSQL, application logs,
  reports, or audit logs.
- **BRD.AC4** — Super Admin can reset credentials and activate/deactivate
  accounts according to permissions.
- **BRD.AC5** — An eligible employee can view permitted vacancies, submit a
  valid transfer request, and receive a unique reference number.
- **BRD.AC6** — *(Modified)* Reporting Manager and configured Receiving
  Manager can take permitted actions (approve/reject/clarify) with decisions
  and reasons recorded.
- **BRD.AC7** — **[New]** HR can validate eligibility, target organisation,
  vacancy/capacity and effective date; upload authorised documents; update/
  assign organisation metadata; and initiate applicable downstream tasks.
- **BRD.AC8** — **[New]** *(Modified — Revision 3)* IT users can view and
  complete only assigned tasks within authorised scope.
- **BRD.AC9** — **[New]** Each user can see assigned employees, requests and
  tasks according to role and organisation mapping.
- **BRD.AC10** — **[New]** Every material configuration, security and workflow
  action creates the agreed audit record.
- **BRD.AC11** — **[New]** Approved requests generate only applicable
  downstream actions; failures are visible and recoverable, and the request
  reaches Completed only after all mandatory tasks satisfy the agreed
  completion rule.
- **BRD.AC12** — **[New]** UAT scenarios cover account creation/login,
  credential reset, approval, rejection, clarification, capacity constraints,
  reassignment, document handling, integration failure and final completion.

---

## Traceability Note

Revision 2 of this BRD baseline (v1.4 source) was rebuilt in full from the
source SOW after the previous `.ai-context/BRD.md` working copy was found
emptied on disk with no corresponding intentional-deletion record. Revision 3
removes the Facilities/Admin role and BRD-026 at explicit user request — a
scope reduction relative to the source SOW, not an SOW-driven delta. Requirement
IDs, open-question IDs and acceptance-criteria IDs are otherwise unchanged and
match those already recorded in `.ai-context/brd-change-log.md`,
`.ai-context/assumptions.md`, and `.ai-context/status.md` — no renumbering was
performed; BRD-026 is marked Removed rather than deleted from the document.
