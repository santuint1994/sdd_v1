# Business Requirements Document (BRD)
## Internal Transfer Digital Journey

**Status:** Pending Review
**Source:** `docs/Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.0.pdf` (internally titled SOW v1.4, 27 September 2026, "Draft for stakeholder review")
**Last Updated:** 2026-09-28

> This baseline was rebuilt from scratch from the source SOW. A prior working
> copy of this file (and of `assumptions.md`, `architecture.md`, `dashboard.html`,
> `brd-change-log.md`, `status.md`, and `prompt_history.md`) was found emptied on
> disk before this ingestion ran; per explicit user instruction, ingestion
> proceeded from the current (emptied) state rather than restoring the prior
> committed revision. See `.ai-context/brd-change-log.md` for this recovery note.
>
> This revision removes the Facilities/Admin role and its task-execution
> requirements at explicit user request. This is a user-directed scope
> reduction, not a change reflected in the source SOW (the SOW describes
> Facilities/Admin throughout, e.g. §3, §6.6) — flagged here for visibility per
> `AGENTS.md` conflict-flagging governance rather than silently applied.
>
> This revision also redefines transfer completion as gated solely on final
> IT approval, at explicit user request. This conflicts with the source SOW
> (§9 step 6 "Verify" and §10, which require HR/Portal to confirm **all**
> configured mandatory downstream activities — HR, payroll, and IT — before a
> request is Completed) and with this BRD's own Business Rules/BRD-019 prior
> to this revision. Flagged here per `AGENTS.md` conflict-flagging governance
> rather than silently applied.
>
> All 11 open questions (BRD-OQ-01 … BRD-OQ-11) have been answered by the
> user and incorporated into this revision (see the Open Questions table for
> resolution status). Per the Gate 0 BRD PR Review protocol, these answers
> must still be recorded in a formal `.ai-context/pr_reviews/BRD-<timestamp>.md`
> review file by the assigned PM/TL reviewer (identity validated by
> `git config user.email` against the reviewer roster) before Status can move
> from Pending Review to Approved.

---

## Objective / Business Objectives

Employees currently coordinate with managers, HR, payroll and IT across
multiple touchpoints to complete an internal transfer. The proposed
solution centralises request capture, approval routing, organisation
assignment, vacancy validation, downstream task orchestration and status
visibility within the One-Point Employee Portal.

- Enable employees to submit internal transfer requests against configured
  departments, locations, designations and vacancies.
- Give each user an individual login and a role-aware view of assigned
  employees, requests and tasks.
- Provide traceable Reporting Manager, optional Receiving Manager and HR
  review stages.
- Provide controlled downstream HR, payroll and IT activities after
  approval.
- Provide a modern Super Admin Panel for organisation setup, user management,
  vacancies and transfer administration.
- Reduce manual follow-up through notifications, clear ownership, exception
  handling, dashboards and audit logs.

---

## Scope

- Modern responsive Admin Panel and role-based dashboards.
- User account creation with automatically generated unique User ID and
  temporary password.
- Location, department/business unit and designation master management.
- Employee, Reporting Manager, HR and IT user management and assignment.
- Vacancy creation and capacity/headcount management.
- Employee transfer request initiation, approval, validation, execution and
  closure.
- HR organisation metadata update and payroll task assignment.
- Transfer/organisation document upload and controlled access.
- IT task assignment and completion tracking.
- Notifications, operational reporting, audit logs and exception handling.

Proposed technical architecture: Next.js frontend, Node.js backend (RBAC,
business validation, orchestration, APIs), PostgreSQL (transactional/workflow/
audit data), and controlled handoffs to existing enterprise identity, HR,
payroll, and IT/service-management systems.

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
- **BRD-001** — Every user (Employee, Reporting Manager, Receiving Manager,
  HR, IT, Super Admin) has an individual authenticated account with a
  role-aware, permission-scoped view. Authentication uses **local
  credentials** (unique User ID + password); the system supports role-based
  and scope-based access according to the user's assigned role (resolved,
  see BRD-OQ-01).
- **BRD-002** — The Admin Panel provides a modern, professional, responsive
  interface with role-aware navigation showing only permitted modules;
  dashboard cards for operational indicators (total employees, active
  transfers, pending approvals, HR reviews, blocked tasks, open vacancies);
  searchable/sortable/filterable data tables with pagination and status
  badges; consistent create/view/edit forms with inline validation and
  required-field indicators; confirmation dialogs for sensitive actions
  (deactivation, reassignment, credential reset); responsive desktop/tablet
  layouts with accessibility support; clear loading, empty, no-access and
  error states.
- **BRD-003** — Admin modules: Dashboard, Users, Locations, Departments,
  Designations, Vacancies, Transfers, Documents, Audit Logs — as described in
  SOW section 4.2.

### User Provisioning & Login
- **BRD-004** — When Super Admin creates an Employee, Reporting Manager, HR,
  or IT user, the application provisions an individual login account as
  part of the creation flow: unique, automatically generated User ID
  following a role-prefixed convention (resolved, see BRD-OQ-02) —
  `EMP######` (Employee), `MGR######` (Reporting Manager), `HR######` (HR),
  `IT######` (IT) — plus an automatically generated strong temporary
  password, duplicate user/employee validation, and creation of the user
  account plus organisational profile in a controlled transaction.
- **BRD-005** — The generated User ID and temporary password are shown only
  to an authorised administrator as part of the successful creation result,
  subject to company security policy. Initial credentials are delivered to
  the new user via their **official company email address** (resolved, see
  BRD-OQ-03), following: Create User → Generate User ID → Generate Temporary
  Password → Send Credentials to Official Email → First Login → Mandatory
  Password Change. The temporary password must never be stored in
  application logs or audit records.
- **BRD-006** — The user must change the temporary password on first login.
  Passwords are stored only as secure hashes; plaintext passwords must never
  be persisted in PostgreSQL, logs, reports or audit records.
- **BRD-007** — Account lifecycle statuses: Pending Activation, Active,
  Locked, Inactive/Deactivated. Administrator-initiated credential reset
  generates a new temporary password and requires password change on next
  login. The application supports (resolved, see BRD-OQ-02): password
  complexity validation, failed-login protection, account locking/unlocking,
  session timeout, password reset by an authorised administrator, and forced
  password change after credential reset.
- **BRD-008** — Account creation, activation/deactivation, credential reset,
  lock/unlock, and first-login password change events are audited without
  storing plaintext passwords.
- **BRD-009** — Account creation flow: Select role → Enter profile → Validate
  (duplicate/required mappings) → Create → Generate credentials → Deliver →
  First login (forced password replace) → Audit.

### Role-Based Functional Scope
- **BRD-010** — Super Admin can create/edit/activate/deactivate Locations;
  create/manage Departments and Designations; create Vacancies with
  department, designation, location, capacity/headcount and status; create
  HR, IT, Reporting Manager and Employee users with appropriate mappings;
  generate login credentials during account creation;
  manage user-role mappings; view all employees, vacancies, transfer
  requests, workflow tasks and audit history; reassign or administratively
  intervene in transfer workflows where policy permits.
- **BRD-011** — Employee can log in, change temporary password on first
  login, view own profile (department, designation, location, Reporting
  Manager), browse eligible internal vacancies (subject to visibility rules),
  submit a transfer request (proposed department, location, designation,
  vacancy, effective date, optional reason), receive a unique transfer
  reference number, track status/stage timeline/pending actions/decision
  reasons/completion dates, respond to clarification requests, and view
  current and historical own transfer requests.
- **BRD-012** — Reporting Manager / Receiving Manager can view assigned
  employees within authorised scope, view transfer requests requiring
  action, review requested details, approve/reject (with mandatory reason)
  or request clarification, add comments, and view previous decisions.
  Receiving Manager approval is **configurable by Super Admin** (resolved,
  see BRD-OQ-04):
  - **When enabled:** workflow is Employee → Reporting Manager → Receiving
    Manager → HR. The Receiving Manager is the manager responsible for the
    target department/team and can view incoming transfer requests, review
    details, approve, reject with mandatory reason, request clarification,
    and add comments.
  - **When disabled:** workflow skips Receiving Manager review — Employee →
    Reporting Manager → HR.
- **BRD-013** — HR can view assigned employees/requests by location/scope,
  validate employee eligibility and proposed transfer details, validate
  vacancy/capacity per agreed business rules, approve/reject/return HR
  validation, assign or update organisation metadata, assign payroll
  configuration tasks, upload transfer/organisation documents, initiate/
  assign payroll/IT tasks, and monitor downstream completion before
  closure.
- **BRD-014** — IT can view assigned tasks (location/workflow routed), view
  only the employee/transfer information required for the task, record
  access provisioning/removal/modification and device/asset activities, add
  comments and completion evidence, and mark tasks In Progress / Completed /
  Blocked with reason. **IT final approval is mandatory for every transfer**
  (resolved, see BRD-OQ-11): when IT work is required, IT completes the
  applicable activities and then provides Final Approval; when no IT work is
  required, IT selects **No IT Action Required**, may add remarks, and then
  provides Final Approval. IT's final approval is the gating action that
  marks the overall transfer request Completed (see BRD-018, BRD-019) — a
  transfer cannot reach Completed without it.

### Organisation, Vacancy & Workflow
- **BRD-016** — The system maintains organisational relationships for
  automatic workflow routing: Employee (department, designation, location,
  Reporting Manager, assigned HR), Reporting Manager (assigned employees,
  scope, HR mapping), HR (location/organisational scope), IT (location
  scope, assigned tasks), Vacancy (department, designation, location,
  capacity, allocated/filled count, status).
- **BRD-017** — Vacancy fields: reference, Department/Business Unit,
  Designation, Location, Capacity, Allocated/Filled, Available (`Available =
  Capacity − Allocated/Reserved`), Status (Open/Full/On Hold/Closed).
  Vacancy capacity is **reserved only once HR validates and approves the
  transfer against the selected vacancy** (resolved, see BRD-OQ-05) —
  submission or Reporting/Receiving Manager approval alone does not consume
  capacity; the system re-checks availability immediately before HR
  confirms the allocation. Reservation uses a database
  transaction/concurrency-control mechanism to prevent two HR users from
  allocating the same final position simultaneously (resolved, see
  BRD-OQ-06). When `Available = 0` the vacancy becomes Full; new allocations
  are not permitted against a Full, On Hold, or Closed vacancy, though
  existing in-flight requests continue per their workflow status.
- **BRD-018** — End-to-end transfer workflow (resolved, see BRD-OQ-10):
  Initiate (Employee) → Reporting Manager review → Receiving Manager review
  (if configured) → HR validation → [BRD-024 re-approval loop, if
  triggered] → HR/Payroll activities → IT review/activities → IT Final
  Approval → Close (notify employee). IT Final Approval is the final step;
  HR/Payroll activities must be complete (or, per BRD-014, IT must select
  No IT Action Required) before IT gives that approval, but IT approval
  itself is what marks the transfer Completed. *(User-directed deviation
  from source SOW §9/§10, which assign the verify/completion decision to
  HR/Portal rather than to IT alone — see revision note at top of this
  document.)*
- **BRD-019** — Status/exception model: Draft, Submitted/Pending approval,
  Information required, Manager approved, HR review, Approved/In progress,
  Blocked, Completed, Rejected/Withdrawn. A request must not be shown as
  Completed merely because it has been approved by Reporting/Receiving
  Manager or HR — completion is reached only once IT gives final approval.
  IT approval is the last gate in the transfer process.
- **BRD-020** — During HR validation, HR can update or assign
  transfer-related organisation metadata (resolved, see BRD-OQ-07):
  Department/Business Unit, Designation, Location, Reporting Manager,
  Effective Transfer Date, applicable payroll assignment/reference, and
  other approved organisational information. HR also assigns the applicable
  payroll configuration activity; the portal coordinates payroll
  handoff/status while payroll calculations and statutory processing remain
  with the authoritative payroll system.
- **BRD-024** — **Organisation-metadata change re-approval rule** (resolved,
  see BRD-OQ-07): if HR changes any of Department/Business Unit,
  Designation, Location, or Reporting Manager after that value was
  previously approved, the system checks whether Receiving Manager approval
  is enabled (BRD-012):
  - **If enabled**, the request automatically returns to the applicable
    Receiving Manager for re-approval: HR changes organisation details →
    Receiving Manager re-approval → HR validation/confirmation → HR/Payroll
    activities → IT Final Approval → Completed. The Receiving Manager sees
    both previous and updated values and can approve, reject with mandatory
    reason, request clarification, or add comments. HR must provide a
    reason/remark when making the change.
  - **If disabled**, the transfer continues without returning to a
    Receiving Manager, using the updated organisational information.
  - The audit log records: changed field, previous value, new value,
    changed by, changed date/time, change reason/remarks, whether
    re-approval was triggered, Receiving Manager decision, decision
    date/time, and decision remarks.
- **BRD-021** — HR can upload authorised transfer and organisation documents,
  linked to the relevant employee and/or transfer request; document access
  follows role and organisational scope; document metadata includes
  category/type, uploader, upload timestamp and employee/request reference.
  Document policy (resolved, see BRD-OQ-08): allowed file types are **PDF
  and image formats** only; maximum file size to be confirmed/configured;
  storage is **local server storage**; malware scanning, retention, archive
  and deletion policy are **not required**. Document upload and access
  actions (upload, view, uploaded-by, upload date/time, category/type,
  associated employee, associated transfer reference) are auditable.
- **BRD-022** — All material actions across every role are auditable,
  capturing actor/user, role, action, affected entity/request, timestamp,
  previous/new values, status/state and remarks. Covers user
  lifecycle/assignment/credential events, master data configuration
  changes, employee hierarchy changes, transfer submission/withdrawal/
  clarification, approvals/rejections, HR validation/allocation/metadata
  updates, payroll/IT task events, document actions, and administrative
  interventions. Plaintext passwords must never be written
  to the audit log.
- **BRD-023** — Notifications cover account creation/activation (where
  approved), transfer submission, action required, clarification,
  approval/rejection, downstream task assignment, delays/blockage and final
  completion. Role-specific dashboards/worklists and operational reporting
  (request volume, current stage, pending owner, overdue tasks, vacancy
  utilisation, completion time) are provided; Super Admin has
  organisation-wide reporting, other roles receive restricted reporting per
  policy. Overdue approvals/tasks are identifiable through dashboards and
  notifications; any automatic escalation timeline or recipient rules are
  configurable per company policy (resolved, see BRD-OQ-10).

---

## Non-Functional Requirements (NFRs)

- **NFR-001 (Authentication):** Individual user accounts using **local
  credentials** (resolved, see BRD-OQ-01); temporary password change
  enforced on first login.
- **NFR-002 (Authorisation):** Role-based and scope-based access with least
  privilege enforced in both UI and APIs.
- **NFR-003 (Credential Security):** Strong password hashing; no plaintext
  password persistence anywhere (DB, logs, reports, audit); secure reset and
  failed-login protection.
- **NFR-004 (Transport & Data Protection):** Encrypted transport and
  protection of personal/employee information.
- **NFR-005 (Auditability):** Protected, tamper-resistant audit records for
  material decisions, configuration changes and security events.
- **NFR-006 (Reliability):** Recoverable integration failures, clear error
  ownership, and safeguards against duplicate downstream execution.
- **NFR-007 (Privacy):** Employee and document access restricted to
  authorised roles and organisational scope.
- **NFR-008 (Accessibility/Usability):** Aligns with organisational portal
  design and accessibility standards.
- **NFR-009 (Performance/Availability/Backup/Retention/Monitoring):**
  Exact production infrastructure targets (API response-time targets,
  availability requirements, database backup schedule, restore/recovery
  procedure, application/infrastructure monitoring, error/security logging,
  system alerts, audit logging) will be finalised during
  infrastructure/deployment planning and confirmed before production
  deployment (resolved as a deferred-to-deployment-planning item, see
  BRD-OQ-09).

---

## Business Rules

- A transfer request must **not** become Completed after Reporting Manager,
  Receiving Manager, or HR approval alone. The final completion rule is:
  **all applicable HR/Payroll activities completed + IT Final Approval =
  Transfer Completed.** If there is no applicable IT activity, IT selects
  **No IT Action Required** and still provides Final Approval — IT remains
  the final gate of the employee transfer process in every case.
- Vacancy capacity is reserved only at HR validation/approval against the
  selected vacancy, not at submission or manager approval; reservation is
  concurrency-controlled so two HR users cannot allocate the same final
  position simultaneously, and no new allocation is permitted once a
  vacancy is Full, On Hold, or Closed.
- If HR changes a previously approved Department/Business Unit,
  Designation, Location, or Reporting Manager value, and Receiving Manager
  approval is enabled, the request must automatically return to the
  Receiving Manager for re-approval before HR/Payroll/IT activities
  continue (BRD-024).
- Reporting Manager, Receiving Manager, and HR rejection actions must
  include a mandatory reason; a reviewer can instead request additional
  information/clarification, and the request returns to the appropriate
  responsible user without losing prior workflow history.
- The employee can withdraw the transfer request before final completion
  where company policy permits; the withdrawal event is recorded in the
  audit log.
- IT users see only the minimum employee/transfer information required for
  their assigned task (least-privilege scoping).
- Receiving Manager review stage is enabled or disabled by configurable
  company policy, not hard-coded.
- Document access is scoped by role and organisation; users do not
  automatically gain access to all employee documents.
- Payroll calculations, compensation rules and statutory processing remain
  the responsibility of the authoritative payroll system; the portal only
  coordinates the handoff/status.

---

## Dependencies

- Local-credential authentication mechanism (password hashing, session
  management) — model confirmed, see BRD-OQ-01.
- Authoritative HR system for employee master data, hierarchy and eligibility
  rules.
- Authoritative payroll system for payroll calculation, compensation and
  statutory processing (portal only coordinates task handoff/status).
- IT service-management system/process for access provisioning and
  device/asset activities.
- Enterprise/official company email service for credential delivery and
  notifications (resolved, see BRD-OQ-03).
- Local server document storage (resolved, see BRD-OQ-08); no external
  malware-scanning or retention/archive service required per current
  policy.
- Infrastructure/deployment planning process to confirm performance,
  availability, backup and monitoring targets before production (BRD-OQ-09).

---

## Assumptions

- Authentication is local-credential based (BRD-OQ-01 resolved); no
  enterprise SSO/identity provider integration is in scope unless brought
  in under change control.
- User ID convention is role-prefixed (`EMP/MGR/HR/IT######`) and password
  policy follows BRD-007 (BRD-OQ-02 resolved).
- HR will provide detailed eligibility criteria, vacancy/capacity policy
  edge cases, and effective-date rules beyond what is captured in BRD-013
  and BRD-017/BRD-024.
- System owners will confirm APIs, credentials, sandbox/test environments,
  interface specifications and data ownership for enterprise integrations
  (payroll, IT service-management).
- Document storage remains local-server based with no malware scanning,
  retention, or archive requirement unless organisational policy changes
  (BRD-OQ-08 resolved).
- Receiving Manager approval is Super Admin-configurable per BRD-012;
  withdrawal and escalation rules follow company policy per BRD-023/Business
  Rules.
- Notification channels, hosting, logging and deployment environments already
  exist or will be provided separately unless brought in under change
  control.
- Dates, effort, team composition and commercials are intentionally excluded
  from this BRD and will be defined in a separately approved project plan
  following discovery.
- Production infrastructure targets (NFR-009) will be finalised during
  infrastructure/deployment planning, not as part of this BRD (BRD-OQ-09).

---

## Out of Scope

- Redesign or replacement of underlying HR, payroll or IT service-management
  platforms.
- Facilities/Admin role, workplace/seating/access-card/asset-movement task
  execution, and any facilities system integration — removed from scope at
  explicit user request; not reflected in the source SOW (see revision note
  at top of this document).
- Building a new payroll calculation engine, identity provider, or
  enterprise master-data platform.
- External recruitment, cross-company transfer, immigration or relocation
  benefit processing, unless separately agreed.
- Historical data migration, bulk backfill and custom integrations not
  identified and approved during discovery.
- Advanced workforce planning or predictive vacancy forecasting, unless
  separately agreed.

---

## Open Questions

All 11 open questions below have been answered by the user and incorporated
into the requirement IDs shown. Formal Gate 0 sign-off (recorded in
`.ai-context/pr_reviews/BRD-<timestamp>.md` by the assigned, email-verified
PM/TL reviewer) is still required before Status moves to Approved.

| ID | Open Question | Status | Resolution Summary | Incorporated In |
|---|---|---|---|---|
| BRD-OQ-01 | Will authentication use local credentials, enterprise SSO/identity provider, or a hybrid model? | Resolved | Local credential-based authentication. | BRD-001, NFR-001 |
| BRD-OQ-02 | What is the organisation's approved User ID naming/numbering convention, password policy, and account security standard (failed-login lockout, session timeout)? | Resolved | Role-prefixed auto-generated User IDs (`EMP/MGR/HR/IT######`); password complexity, failed-login protection, lock/unlock, session timeout, admin reset, forced change after reset. | BRD-004, BRD-007 |
| BRD-OQ-03 | What is the approved secure mechanism for delivering initial credentials to new users (email, SMS, identity service)? | Resolved | Delivered via the user's official company email address. | BRD-005 |
| BRD-OQ-04 | Is Receiving Manager approval enabled by default, or configured per organisation/team? | Resolved | Configurable by Super Admin; workflow includes or skips the Receiving Manager stage accordingly. | BRD-012 |
| BRD-OQ-05 | At what point is vacancy capacity reserved — submission, approval, or HR validation? | Resolved | Reserved only at HR validation/approval against the selected vacancy. | BRD-017 |
| BRD-OQ-06 | What are the agreed concurrency/reservation rules to prevent vacancy over-allocation, and what is vacancy closure/hold behaviour for in-progress requests? | Resolved | `Available = Capacity − Allocated/Reserved`; DB transaction/concurrency control; no new allocation once Full/On Hold/Closed; existing in-flight requests unaffected. | BRD-017, Business Rules |
| BRD-OQ-07 | What are the organisation metadata fields HR must update/assign, and what is the authoritative source system for them? | Resolved | Department/Business Unit, Designation, Location, Reporting Manager, Effective Date, payroll reference; changing a previously approved value triggers the BRD-024 re-approval rule. | BRD-020, BRD-024 |
| BRD-OQ-08 | What are the allowed document file types, maximum size, storage location, malware-scanning requirement, retention period, and deletion policy? | Resolved | PDF and image files only; local server storage; no malware scanning, retention, archive, or deletion policy required; max size to be confirmed/configured. | BRD-021 |
| BRD-OQ-09 | What are the specific performance, availability, backup, retention and monitoring targets? | Resolved (deferred) | Deferred to infrastructure/deployment planning; confirmed before production deployment. | NFR-009 |
| BRD-OQ-10 | What is the exact reviewer sequence, HR eligibility rules, organisation hierarchy source, withdrawal rules, and escalation rules to be confirmed before build approval? | Resolved | Reviewer sequence per BRD-018; rejection requires reason; clarification returns to responsible user without losing history; withdrawal permitted pre-completion per policy and audited; escalation configurable via dashboards/notifications. | BRD-018, BRD-023, Business Rules |
| BRD-OQ-11 | Since IT final approval now gates transfer completion, what happens for a transfer with no applicable IT task? | Resolved | IT final approval is mandatory for every transfer; if no IT work applies, IT selects "No IT Action Required," may add remarks, and still gives Final Approval. | BRD-014 |

---

## Acceptance Criteria

- Super Admin can access a modern role-aware Admin Panel and manage the
  agreed master data and user modules.
- Super Admin can create Employee, Reporting Manager, HR and IT user
  accounts within authorised scope.
- Account creation generates a unique User ID and strong temporary password
  according to the agreed policy.
- The user must change the temporary password on first login; plaintext
  passwords are never stored in PostgreSQL, application logs, reports or
  audit logs.
- Super Admin can reset credentials and activate/deactivate accounts
  according to permissions.
- Super Admin can configure locations, departments, designations and
  vacancies with capacity.
- An eligible employee can view permitted vacancies, submit a valid transfer
  request and receive a unique reference number.
- Reporting Manager and configured Receiving Manager can take permitted
  actions with decisions and reasons recorded.
- HR can validate eligibility, target organisation, vacancy/capacity and
  effective date; upload authorised documents; update/assign organisation
  metadata; and initiate applicable downstream tasks.
- IT users can view and complete only assigned tasks within authorised
  scope.
- Each user can see assigned employees, requests and tasks according to role
  and organisation mapping.
- Every material configuration, security and workflow action creates the
  agreed audit record.
- Approved requests generate only applicable downstream actions; failures
  are visible and recoverable.
- A request reaches Completed only once IT gives Final Approval (with or
  without an applicable IT task, via "No IT Action Required"), which is the
  last step in the transfer process.
- When Receiving Manager approval is enabled and HR changes a previously
  approved Department/Business Unit, Designation, Location, or Reporting
  Manager value, the request automatically returns to the Receiving Manager
  for re-approval before proceeding.
- Vacancy capacity is only reserved at HR validation/approval, and the
  system prevents allocation beyond configured capacity under concurrent
  HR actions.
- UAT scenarios cover account creation/login, credential reset, approval,
  rejection, clarification, capacity constraints, organisation-metadata
  change re-approval, reassignment, document handling, IT "No Action
  Required" completion, integration failure and final completion.
