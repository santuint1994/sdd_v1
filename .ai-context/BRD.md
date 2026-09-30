# Business Requirements Document (BRD)
## Internal Transfer Digital Journey

**Status:** Changes Requested (Gate 0 review 2026-09-30 — see `.ai-context/pr_reviews/BRD-20260930-144648.md`)
**Source:** `docs/Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.0.pdf` (internally titled SOW v1.4, 27 September 2026, "Draft for stakeholder review")
**Last Updated:** 2026-10-01 (document upload validation error responses confirmed in BRD-021 — HTTP 413 `FILE_SIZE_EXCEEDED`, HTTP 415 `UNSUPPORTED_FILE_TYPE` / `INVALID_FILE_TYPE`, invalid file not stored; Gate 0 comment 13 addressed — document upload and access secured at API/server level in BRD-021: PDF/image only, 5 MB per file, MIME and extension validation, file-name sanitisation, local server storage, role/organisation-scoped authenticated access, no public URLs, audit logging; Gate 0 comment 12 addressed — no external Payroll/HR integration in the current phase, Payroll manual by HR; any future integration needs an approved contract covering the eleven required elements, NFR-006 retry/idempotency/visibility rules confirmed; 2026-09-30: HR cancellation of Blocked requests answered — HR may cancel HR-blocked requests, not IT-blocked ones, Super Admin any Blocked request, BRD-027 updated; Gate 0 comment 8 addressed — Effective Transfer Date rule BRD-031: current date to 30 days ahead, no past dates for any role, weekends/holidays allowed, expired date must be updated before completion, no re-approval unless Super Admin configures it; BRD-OQ-20 resolved — Employee edits in Draft only, HR during approval, Super Admin for intervention, business time zone, inclusive fixed 30-day limit, optional re-approval to configured approver, expired date corrected by HR or Super Admin; BRD-OQ-18 resolved — HR-controlled and IT-controlled stages defined for Block/Resume, HR Cancel limited to Pending HR Review / HR Processing / Payroll Processing with other stages requiring Super Admin, Draft excluded from all four actions, cross-role Resume rules, BRD-027 updated; BRD-OQ-17 resolved — Draft not active, mandatory backend + database enforcement, HTTP 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`, no cool-down after Completed, BRD-030 updated; BRD-OQ-19 resolved — portal is the operational source of employee/organisation data with per-field ownership, no HR-system synchronisation this phase, comment 7 addressed; BRD-OQ-16 resolved — employee-data source of truth, missing-data handling and HR-ineligible outcome in BRD-029, comment 7 addressed with BRD-OQ-19; Gate 0 comments 1–6, 8 and 15 addressed — BRD-025 – BRD-031, plus the withdrawal rules in BRD-027 (BRD-OQ-12 resolved) and the Block/Resume/Cancel/Reassign rules in BRD-027 (BRD-OQ-13 resolved, comment 18 partly covered), the HR/Payroll routing answer (BRD-OQ-14 resolved, comments 3 and 10 partly covered) and the vacancy edge cases (BRD-OQ-15 resolved, comment 4); comments 14 and 16–22 outstanding, several partially covered by BRD-027, BRD-029 and BRD-030)

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
> review file by the assigned Gate 0 reviewer (Project Manager and/or Business
> Analyst; identity validated by `git config user.email` against the reviewer
> roster) before Status can move from Pending Review to Approved. Gate 0 is the
> first review gate; this BRD cannot proceed to Gate 1 until it is approved.

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
- **BRD-006** — The system generates a temporary password when an account is
  created. The user must change the temporary password on the **first
  successful login**, before accessing any other part of the application
  (first-login password change cannot be bypassed, including through direct
  API calls). Passwords are stored only as secure hashes; plaintext passwords
  must never be persisted in PostgreSQL, logs, reports or audit records.
- **BRD-007** — Account lifecycle statuses: Pending Activation, Active,
  Locked, Inactive/Deactivated. Administrator-initiated credential reset
  generates a new temporary password and requires password change on next
  login. The application supports (resolved, see BRD-OQ-02): password
  complexity validation, failed-login protection, account locking/unlocking,
  session timeout, password reset by an authorised administrator, and forced
  password change after credential reset. The approved security
  configuration values are defined in BRD-025.
- **BRD-008** — Account creation, activation/deactivation, credential reset,
  lock/unlock, and first-login password change events are audited without
  storing plaintext passwords.
- **BRD-009** — Account creation flow: Select role → Enter profile → Validate
  (duplicate/required mappings) → Create → Generate credentials → Deliver →
  First login (forced password replace) → Audit.
- **BRD-025** — Authentication & Session Security Policy (Gate 0 comment 1,
  author response 2026-09-30). The following approved values and rules apply:

  | Parameter | Approved value / rule |
  |---|---|
  | Maximum failed login attempts | Account is temporarily locked after **5 consecutive** failed login attempts |
  | Account lock duration | **30 minutes**; afterwards the user may attempt login again. Super Admin may also unlock the account where required |
  | Session / idle timeout | Session expires after **30 minutes of inactivity**; the user must log in again |
  | Password complexity | Minimum **8 characters**, with at least **1 uppercase**, **1 lowercase**, **1 number** and **1 special character** |
  | Temporary password | System-generated at account creation; remains valid until the user's first login (no time-based expiry); must be changed on that first successful login before proceeding further into the application |
  | Password reset | After a successful reset, **all** existing active sessions of that user are invalidated; the user must log in with the new password |
  | Account deactivation | Deactivated user cannot log in or access protected APIs; existing active sessions are invalidated |
  | Locked account | Cannot authenticate or access protected APIs until the lock expires or an authorised administrator unlocks it |
  | Password storage | Secure hashes only; never plain text |
  | Credential logging | Passwords, temporary passwords, access tokens, refresh tokens and other sensitive authentication credentials must not be written to application or audit logs |
  | MFA / SSO | **Out of scope for the current phase**; in scope only if separately approved |

  Deactivation, lock and session-invalidation rules are enforced at the
  backend/API level on every protected request, not only at login.
- **BRD-026** — Role & API-Level Authorization (Gate 0 comment 2, author
  response 2026-09-30). Authorization is enforced at **both** the frontend and
  the backend/API. Hiding a menu, button or page in the frontend is not
  sufficient security; frontend restrictions exist for user experience only,
  and the **backend/API is the authoritative authorization layer**. For every
  protected API request the backend validates, in order:

  `Authenticated User → Role → Organisation Scope → Resource → Action`

  | Check | Rule |
  |---|---|
  | 1. Authenticated user | Every protected API requires a valid authenticated user/session/token. Missing, invalid or expired authentication is rejected with **401 Unauthorized** |
  | 2. Role | The backend verifies the user's assigned role (Super Admin, Employee, Reporting Manager, Receiving Manager, HR, IT). Each role has explicitly defined permissions |
  | 3. Organisation scope | The backend verifies the requested data belongs to the user's assigned scope, which may include: assigned employees; Department / Business Unit; Location; reporting hierarchy; assigned transfer requests/tasks |
  | 4. Resource | The backend verifies the user may access the specific resource: transfer request, employee record, vacancy, document, payroll task or IT task |
  | 5. Action | The backend verifies the user's role and scope permit the requested action: View, Create, Update, Submit, Approve, Reject, Request Clarification, Upload/Download Document, Reassign, Complete Task, Provide IT Final Approval — and that the action is permitted at the request's **current workflow stage** |

  - **Access denial:** authenticated but not permitted for the resource/action →
    **403 Forbidden**. Out-of-scope direct API access is rejected. Rejections
    must not expose restricted employee or organisational information.
  - **Direct API calls:** a request made through Postman or any other API client
    is rejected if the role, organisational scope, resource access or action
    permission is missing — the frontend is never relied on to filter.
  - **Example (HR approving/updating a transfer):** user is authenticated → has
    the HR role → the transfer belongs to HR's assigned scope/location → HR has
    access to that transfer → HR is permitted to perform the requested action at
    the current workflow stage. Failing any step rejects the request.
  - **Audit:** security-sensitive and material actions — approvals, rejections,
    reassignment, HR metadata changes, document access, Payroll completion and
    IT Final Approval — are recorded in the audit log per BRD-022. Authorization
    denials on protected resources are treated as security events for audit
    purposes.
  - The exact role × action × scope permission matrix is defined at spec level
    from the role scopes in the Actors table and the role-based functional
    scope (BRD-010 – BRD-014); it is not assumed here.
- **BRD-027** — Workflow State Management (Gate 0 comment 3, author response
  2026-09-30). The transfer workflow uses a controlled state-transition model.
  A request cannot move directly to an arbitrary status. Every transition is
  validated by the backend as:

  `Current Status → User Role → Allowed Action → Next Status`

  Invalid or unauthorised transitions are rejected by the backend/API.

  **Workflow Transition Matrix**

  | Current Status | Action By | Action | Next Status | Reason Required? | Employee Editing | Notification | Vacancy / Downstream Impact |
  |---|---|---|---|---|---|---|---|
  | Draft | Employee | Submit | Pending Reporting Manager Approval | No | Yes | Reporting Manager notified | No vacancy reservation |
  | Pending Reporting Manager Approval | Reporting Manager | Approve | Pending Receiving Manager Approval* / Pending HR Review | No | No | Employee + next approver notified | No vacancy reservation |
  | Pending Reporting Manager Approval | Reporting Manager | Reject | Rejected | **Yes** | No | Employee notified | Any applicable reservation released |
  | Pending Reporting Manager Approval | Reporting Manager | Request Clarification | Info Required | **Yes** | Only clarification response | Employee notified | No change |
  | Pending Receiving Manager Approval | Receiving Manager | Approve | Pending HR Review | No | No | Employee + HR notified | No vacancy reservation |
  | Pending Receiving Manager Approval | Receiving Manager | Reject | Rejected | **Yes** | No | Employee notified | Any applicable reservation released |
  | Pending Receiving Manager Approval | Receiving Manager | Request Clarification | Info Required | **Yes** | Only clarification response | Employee notified | No change |
  | Info Required | Employee | Respond to Clarification | Previous Approval/Review Stage | No | Clarification response only | Requesting approver notified | Existing reservation/state retained |
  | Pending HR Review | HR | Validate & Approve | HR Processing | No | No | Employee/relevant team notified | Vacancy capacity validated and reserved |
  | Pending HR Review | HR | Reject | Rejected | **Yes** | No | Employee notified | Vacancy reservation released |
  | Pending HR Review | HR | Request Clarification | Info Required | **Yes** | Clarification response only | Employee notified | Reservation retained if already created |
  | HR Processing | HR | Change Department / BU / Designation / Location / Reporting Manager | Pending Receiving Manager Re-Approval* | **Change reason required** | No | Receiving Manager + Employee notified | Vacancy revalidated; old/new reservation adjusted where applicable |
  | Pending Receiving Manager Re-Approval | Receiving Manager | Approve | HR Processing | No | No | HR + Employee notified | Existing valid reservation retained; HR confirms the updated organisation information |
  | Pending Receiving Manager Re-Approval | Receiving Manager | Reject | Rejected | **Yes** | No | HR + Employee notified | Vacancy reservation released |
  | HR Processing | HR | Complete HR Processing (all mandatory HR activities done, incl. HR confirmation) | Payroll Processing | No | No | HR/Payroll users notified | HR activities must be complete before Payroll Processing begins |
  | Payroll Processing | Authorised HR user | Mark Payroll Activity Completed | Pending IT Action | No (remarks where applicable) | No | IT/relevant users notified | Enables IT processing; Payroll status, completed by, date/time, reference and remarks recorded |
  | Pending IT Action | IT | Complete IT Tasks | Pending IT Final Approval | No | No | Employee/relevant users notified | IT tasks marked complete |
  | Pending IT Action | IT | No IT Action Required | Pending IT Final Approval | Reason/remark recorded | No | Relevant users notified | No IT provisioning task required |
  | Pending IT Final Approval | IT | Final Approve | Completed | No | No | Employee + relevant stakeholders notified | Transfer finalised |
  | Completed | — | — | No further normal transition | — | No | Completion notification already sent | Vacancy allocation finalised |

  \* Receiving Manager is configurable by Super Admin (BRD-012). If Receiving
  Manager approval is disabled, the workflow skips that stage and proceeds to
  HR. Where a cell lists two next statuses, the routing is decided by this
  configuration.

  - **HR Processing, Payroll Processing and HR Confirmation (BRD-OQ-14
    resolved, 2026-09-30; Gate 0 comments 3, 10):**
    - **(a) HR Confirmation is not a workflow status.** It is an activity within
      HR Processing. The status path is Pending HR Review → HR Processing →
      Payroll Processing → Pending IT Action → Pending IT Final Approval →
      Completed. If BRD-024 re-approval is triggered: HR Processing → Pending
      Receiving Manager Re-Approval → HR Processing → Payroll Processing; after
      re-approval the request returns to **HR Processing** so HR can confirm the
      updated organisation information before proceeding.
    - **(b) HR Processing and Payroll Processing are sequential, not
      parallel:** HR Processing → Payroll Processing → Pending IT Action. HR
      must complete the mandatory organisation activities before Payroll
      Processing begins. HR Processing may include: confirming Department /
      Business Unit, Designation, Location, Reporting Manager and Effective
      Transfer Date; updating required organisation metadata; assigning
      applicable Payroll information/reference; uploading required
      transfer/organisation documents where applicable. Payroll Processing must
      be completed before the request can proceed to IT.
    - **(c) Payroll completion source (current phase):** recorded **manually by
      an authorised HR user** in the Employee Transfer Portal. The portal tracks
      the Payroll activity/status but does **not** perform payroll calculation
      or statutory payroll processing; the HR user updates the activity after
      completing/confirming it in the organisation's existing Payroll
      process/system. Flow: Payroll Processing → Authorised HR User Marks
      Payroll Activity Completed → Pending IT Action. The system records Payroll
      status, completed by, completion date/time, Payroll reference (where
      applicable) and remarks/comments (where applicable). A Payroll
      API/callback integration is **not required** for the current phase unless
      separately approved and an integration contract is provided.
      **Gate 0 comment 10 confirmation:** there is no Payroll system/API
      integration, callback or status update in the current phase; the
      transfer cannot proceed to IT Final Approval while any mandatory Payroll
      activity is incomplete, and once all mandatory Payroll activities are
      Completed the request proceeds to the next applicable IT stage. Payroll
      calculation, compensation, salary processing and statutory processing are
      outside the portal, which only manages and tracks the Payroll activity
      and its completion status. Payroll completion and every related status
      change are recorded in the audit log (BRD-022).
    - **(d) Invalid transition response:** see "Backend enforcement" below.
  - **HR metadata change / re-approval (BRD-024 remains mandatory):** if HR
    changes a previously approved Department/Business Unit, Designation,
    Location or Reporting Manager and Receiving Manager approval is enabled, the
    request moves HR Processing → Pending Receiving Manager Re-Approval → HR
    Processing → Payroll Processing → Pending IT Action → Pending IT Final
    Approval → Completed. The audit
    history records previous value, new value, changed by, changed date/time
    and change reason.
  - **Rejection:** reason mandatory; request moves to Rejected; employee
    notified; any active vacancy reservation released; pending downstream tasks
    do not continue; rejection and reason audited. Whether a rejected request
    may be resubmitted as a new transfer request is defined in BRD-030: a
    Rejected request is closed and any new request gets a new reference, restarts
    the workflow and reuses no earlier approvals. Other comment 16 points
    (notification and workflow-history detail) remain under that comment.
  - **Clarification:** Reporting Manager, Receiving Manager and HR may request
    clarification where applicable. The request moves to Info Required; the
    question/comment is recorded; the employee is notified and submits the
    requested information; the request returns to the stage from which
    clarification was requested; complete clarification history is retained;
    multiple cycles are supported. Clarification does not cancel the transfer
    or release the vacancy reservation.
  - **Withdrawal** (BRD-OQ-12 resolved, 2026-09-30): the employee may withdraw
    **until HR approves the transfer request**. Withdrawal is permitted only
    from: Pending Reporting Manager Approval; Pending Receiving Manager
    Approval (if applicable); Info Required / Clarification; Pending HR Review.
    Once HR approves and the request moves to HR/Payroll processing, the
    employee can no longer withdraw directly; any later termination must follow
    the separate authorised Cancellation process (BRD-OQ-13 resolved, below). Withdrawal rules:
    - A **withdrawal reason/remark is mandatory**.
    - The request moves to **Withdrawn**, which is a final/closed status and
      **cannot be reopened**. No further approval, Payroll or IT processing
      continues.
    - The audit log records Transfer Request ID, employee, previous status,
      withdrawal reason, withdrawn by, and withdrawal date/time.
    - No vacancy reservation normally exists before HR approval; if one exists
      through an exceptional workflow condition, it is released immediately.
    - Pending downstream tasks are cancelled where applicable.
    - To apply again, the employee creates a new Transfer Request under
      BRD-030: new Transfer Request ID, eligibility and vacancy availability
      revalidated, approval workflow restarted, no previous approvals reused;
      the withdrawn request stays in transfer history and audit logs.

    Withdraw rows added to the transition matrix:

    | Current Status | Action By | Action | Next Status | Reason Required? | Employee Editing | Notification | Vacancy / Downstream Impact |
    |---|---|---|---|---|---|---|---|
    | Pending Reporting Manager Approval | Employee | Withdraw | Withdrawn | **Yes** | No | Pending approver notified | Any exceptional reservation released; downstream tasks cancelled where applicable |
    | Pending Receiving Manager Approval* | Employee | Withdraw | Withdrawn | **Yes** | No | Pending approver notified | As above |
    | Info Required | Employee | Withdraw | Withdrawn | **Yes** | No | Requesting approver notified | As above |
    | Pending HR Review | Employee | Withdraw | Withdrawn | **Yes** | No | HR notified | As above |

    Notification recipients in these rows follow from the pending owner of each
    stage; the wider notification design remains under Gate 0 comment 16.
  - **Vacancy impact:** no capacity is reserved at submission; capacity is
    validated and reserved after HR validation/approval. `Available Capacity =
    Total Capacity − Active Reserved/Allocated Capacity`, with over-allocation
    prevented by database-level transactional/concurrency controls. Rejected /
    Withdrawn / Cancelled → reservation released. Blocked → reservation retained
    until the request is rejected, withdrawn or cancelled (full rules: BRD-028). Completed →
    reservation becomes final allocation/filled capacity. HR changes vacancy →
    old reservation released and new vacancy validated/reserved atomically.
    Full / On Hold / Closed vacancy → no new allocation permitted.
  - **Completion rule:** a transfer can move to Completed only when (1) all
    mandatory manager/HR approvals are complete, (2) required HR organisation
    metadata activities are complete, (3) mandatory Payroll activities are
    complete, (4) IT activities are complete or marked No IT Action Required,
    and (5) IT Final Approval is complete. The system must not allow IT Final
    Approval while a mandatory Payroll activity is incomplete. IT Final
    Approval remains the mandatory final gate.
    **Gate 0 comment 11 confirmation:** IT Final Approval is mandatory for
    every transfer and is the final step before Completed. With IT work:
    IT Task Completion → IT Final Approval → Completed; without IT work:
    No IT Action Required → IT Final Approval → Completed. Reporting Manager,
    Receiving Manager, HR approval and Payroll completion cannot, individually
    or collectively, complete the transfer; the system sets Completed only
    after all required prior activities are done and IT gives Final Approval.
    The IT Final Approval action is recorded in the audit log (BRD-022).
  - **Backend enforcement:** all transitions are enforced by the backend/API,
    which validates `Authenticated User → Role → Organisation Scope → Transfer
    Request → Current Status → Requested Action → Allowed Next Status`
    (extending BRD-026). Users cannot bypass the workflow by calling an API
    directly — e.g. IT cannot move a transfer from Pending HR Review to
    Completed, and no transfer reaches Completed without IT Final Approval.
    Successful material transitions and rejected unauthorised/invalid
    transition attempts are handled per the application's security and audit
    requirements (BRD-022, BRD-026).
    - **Invalid transition response (BRD-OQ-14(d) resolved, 2026-09-30):** if
      the user is authenticated but attempts an action or transition not
      permitted for their role, scope or the request's current workflow state,
      the API rejects it with **HTTP 403 Forbidden**, `code:
      INVALID_WORKFLOW_TRANSITION`, `message: The requested action is not
      permitted for the current transfer status.` The transfer status remains
      **unchanged**; no downstream task, approval, vacancy update or
      notification tied to the invalid transition is executed. The rejected
      attempt is recorded as a security/audit event with user, role, Transfer
      Request ID, current status, attempted action, date/time and rejection
      reason. (Missing/invalid authentication remains 401 per BRD-026.)
  - **Block / Resume / Cancel / Reassign** (BRD-OQ-13 resolved, 2026-09-30;
    Gate 0 comments 3, 4, 18). These administrative actions apply to an
    **active, non-final** request (final statuses: Completed, Rejected,
    Withdrawn, Cancelled). None of them can bypass a mandatory Reporting
    Manager, Receiving Manager, HR, Payroll or IT Final Approval requirement,
    and all four are recorded in the audit log (BRD-022).
    - **HR-controlled and IT-controlled stages (BRD-OQ-18(a) resolved,
      2026-09-30):** for Block and Resume permissions, **HR-controlled stages**
      are *Pending HR Review*, *HR Processing* and *Payroll Processing*;
      **IT-controlled stages** are *Pending IT Action* and *Pending IT Final
      Approval*. HR may Block/Resume only within the HR-controlled stages and
      IT only within the IT-controlled stages, each within its assigned scope.
    - **Draft (BRD-OQ-18(d) resolved):** Block, Resume, Cancel and Reassign do
      **not** apply to an unsubmitted Draft; the employee may edit or discard
      the Draft before submission. These actions apply only after the request
      has been submitted.
    - **Block** — temporarily stops the transfer when an issue prevents the
      workflow continuing.
      - *Who:* **Super Admin** at any non-final workflow stage; **HR** during
        the HR-controlled stages (Pending HR Review, HR Processing, Payroll
        Processing) within HR's authorised organisational scope; **IT** during
        the IT-controlled stages (Pending IT Action, Pending IT Final Approval)
        within IT's assigned scope.
        Reporting Manager, Receiving Manager and Employee **cannot** block.
      - *Reason:* **mandatory**.
      - *Result:* `Current Active Status → Blocked`. The system **stores the
        status from which the request was blocked** so it can resume to the
        correct stage.
      - *While Blocked:* no further normal approval/processing action is
        permitted; the transfer remains active; the vacancy reservation is
        retained (BRD-028); relevant stakeholders are notified; action and reason
        are audited.
    - **Resume** — continues a blocked transfer once the issue is resolved.
      - *Who:* **Super Admin** may resume any authorised Blocked request,
        including one blocked by HR or IT; **HR** only a request blocked during
        an HR-controlled stage, within HR's authorised scope; **IT** only a
        request blocked during an IT-controlled stage, within IT's assigned
        scope. **HR cannot resume an IT-blocked request and IT cannot resume an
        HR-blocked request** (BRD-OQ-18(e) resolved).
      - *Validation failure:* if revalidation fails on Resume the request
        remains **Blocked** until HR/Super Admin resolve the issue
        (BRD-OQ-15(a), BRD-OQ-18(c)).
      - *Result:* the request returns to the **workflow status from which it was
        blocked** (e.g. `Payroll Processing → Blocked → Resume → Payroll
        Processing`; `Pending IT Action → Blocked → Resume → Pending IT Action`).
      - Before resuming, the system **revalidates relevant business conditions**,
        including vacancy validity/capacity where applicable (BRD-028).
      - Resume action, user, date/time and remarks are audited.
    - **Cancel** — administrative, permanent stop of an active transfer after
      normal employee withdrawal is no longer permitted. Employee cancellation
      is **not** part of this action; it is the separate Withdrawal process.
      - *Who:* **Super Admin** (any active transfer, and the only role that may
        cancel from a stage outside the HR list below); **HR** within its
        authorised organisational scope, but only during **Pending HR Review,
        HR Processing or Payroll Processing** (BRD-OQ-18(b) resolved). For any
        other active workflow stage cancellation requires **Super Admin**
        action.
      - *Blocked requests (resolved, 2026-09-30):* **HR** may Cancel a request
        that is currently **Blocked** only if it was blocked during an
        HR-controlled stage (including when HR itself blocked it), within its
        scope. **HR cannot Cancel** a Blocked request that originated from an
        IT-controlled stage. **Super Admin** may Cancel a Blocked request at any
        stage as administrative intervention.
      - *Reason:* **mandatory**.
      - *Result:* `Active Transfer → Cancelled`. Cancelled is a **final/closed**
        status and the request **cannot be reopened**. The workflow stops; any
        active vacancy reservation is released; pending downstream Payroll/IT
        tasks are cancelled where applicable; the Employee and relevant
        stakeholders are notified; the cancellation is audited. The same result
        applies when a Blocked request is cancelled.
      - A Completed, Rejected, Withdrawn or already Cancelled request **cannot be
        cancelled**. To apply again the employee creates a **new Transfer
        Request** under BRD-030 and the workflow starts from the beginning.
    - **Reassign** — moves responsibility for an active approval/processing task
      from one authorised user to another (e.g. Reporting Manager → another
      Reporting Manager, Receiving Manager → another Receiving Manager, HR →
      another HR user, IT task → another IT user).
      - *Who:* **Super Admin** (any active workflow task, to another eligible
        user); **HR** for HR-controlled downstream tasks within HR's authorised
        scope, where permitted.
      - *Reason:* **mandatory**. The new assignee must hold the required
        **role and organisational scope**.
      - *Result:* the workflow status does **not** change (`Pending IT Action →
        Reassign IT User → Pending IT Action`); only ownership changes.
      - After reassignment the old assignee loses action permission on that task
        (unless independently retained through their role/scope), the new
        assignee is notified, and previously completed approvals stay in the
        workflow history. Reassignment cannot be used to bypass mandatory
        approvals. If it also changes Department/Business Unit, Designation,
        Location or Reporting Manager, the **BRD-024 re-approval rule** applies
        where required. The audit log records old assignee, new assignee,
        reason, changed by, date/time and current workflow status.

    Rows added to the transition matrix:

    | Current Status | Action By | Action | Next Status | Reason Required? | Employee Editing | Notification | Vacancy / Downstream Impact |
    |---|---|---|---|---|---|---|---|
    | Any active / non-final status | Super Admin | Block | Blocked (previous status stored) | **Yes** | No | Relevant stakeholders notified | Reservation retained; no normal processing while Blocked |
    | Pending HR Review / HR Processing / Payroll Processing (within HR scope) | HR | Block | Blocked (previous status stored) | **Yes** | No | Relevant stakeholders notified | As above |
    | Pending IT Action / Pending IT Final Approval (within IT scope) | IT | Block | Blocked (previous status stored) | **Yes** | No | Relevant stakeholders notified | As above |
    | Blocked | Super Admin | Resume | Status from which blocked | Remarks recorded | No | Relevant stakeholders notified | Vacancy validity/capacity revalidated; reservation continues |
    | Blocked (during an HR-controlled stage, within HR scope) | HR | Resume | Previous HR-controlled status | Remarks recorded | No | Relevant stakeholders notified | As above |
    | Blocked (during an IT-controlled stage, within IT scope) | IT | Resume | Previous IT-controlled status | Remarks recorded | No | Relevant stakeholders notified | As above |
    | Any active / non-final status | Super Admin | Cancel | Cancelled | **Yes** | No | Relevant stakeholders notified | Reservation released; pending Payroll/IT tasks cancelled where applicable |
    | Pending HR Review / HR Processing / Payroll Processing (within HR scope) | HR | Cancel | Cancelled | **Yes** | No | Relevant stakeholders notified | As above |
    | Blocked (blocked during an HR-controlled stage, within HR scope) | HR | Cancel | Cancelled | **Yes** | No | Employee and relevant stakeholders notified | Reservation released; pending Payroll/IT tasks cancelled where applicable |
    | Blocked (blocked during an IT-controlled stage) | HR | Cancel | **Refused** — HR cannot cancel an IT-blocked request | — | — | — | No change; attempt audited as a security event |
    | Blocked (any stage) | Super Admin | Cancel | Cancelled | **Yes** | No | Employee and relevant stakeholders notified | Reservation released; pending Payroll/IT tasks cancelled where applicable |
    | Active pending task | Super Admin | Reassign | Same status, new assignee | **Yes** | No | New assignee notified | No status or reservation change |
    | HR-controlled task (within HR scope) | HR | Reassign | Same status, new assignee | **Yes** | No | New assignee notified | As above |

    **BRD-OQ-18 resolved (2026-09-30):** (a) the HR-controlled and IT-controlled
    stages are defined above; (b) HR may Cancel only during Pending HR Review, HR
    Processing and Payroll Processing, within its scope, with a mandatory reason,
    and other active stages need Super Admin (Cancelled is final, not reopenable,
    and any vacancy reservation is released); (c) a failed Resume revalidation
    keeps the request Blocked until HR/Super Admin resolve it (BRD-OQ-15(a));
    (d) Block, Resume, Cancel and Reassign do not apply to an unsubmitted Draft;
    (e) Super Admin may Resume any authorised Blocked request, HR only
    HR-controlled blocks and IT only IT-controlled blocks, with no cross-resume
    between HR and IT. Block, Resume, Cancel and Reassign are all audited.
    **Follow-up answer (2026-09-30):** HR may Cancel a request that is currently
    Blocked if it was blocked during an HR-controlled stage (the stored
    pre-block stage decides); HR cannot Cancel a Blocked request originating
    from an IT-controlled stage; Super Admin may Cancel a Blocked request at any
    stage. A reason is mandatory, the request becomes Cancelled and the workflow
    ends, any reserved vacancy/capacity is released, the action is audited and
    the Employee and relevant stakeholders are notified.
    (Withdraw rows: defined above, BRD-OQ-12 resolved.)
- **BRD-028** — Vacancy Reservation & Capacity (Gate 0 comment 4, author
  response 2026-09-30). Vacancy capacity is controlled by the backend to
  prevent over-allocation.

  `Available Capacity = Total Vacancy Capacity − Active Reserved/Allocated Capacity`

  Example: Total Capacity 5, Already Filled 3, Active Reservation 1 →
  Available = 5 − (3 + 1) = **1**. When the reserved transfer is completed the
  reservation becomes a filled allocation.

  A vacancy is **not** reserved when the employee submits the request. It is
  validated and reserved only after **HR validates and approves** the transfer
  request. The reservation uses a database transaction/concurrency control so
  that multiple requests cannot reserve the same final available position.

  **Vacancy Reservation Rules**

  | Scenario | Vacancy Action |
  |---|---|
  | Employee submits transfer | No reservation |
  | Reporting Manager approves | No reservation |
  | Receiving Manager approves | No reservation |
  | HR validates and approves | Capacity validated and **reserved** |
  | Request Rejected | Reservation **released** |
  | Employee withdraws request | Reservation **released** |
  | Request Cancelled | Reservation **released** |
  | Request Blocked / On Hold | Reservation **retained** |
  | Blocked request resumes | Vacancy and reservation revalidated (BRD-OQ-15(a)); on success the request returns to the stage it was blocked from, on failure it stays Blocked |
  | Transfer Completed | Reservation becomes **final allocation / filled capacity** |
  | HR changes selected vacancy | Old reservation released; new vacancy validated/reserved |
  | Vacancy becomes Full / On Hold / Closed | No new reservation permitted; existing reservation retained, not auto-released (BRD-OQ-15(b)) |
  | Manual release of in-flight reservation | HR (in scope) or Super Admin; mandatory reason; audited (BRD-OQ-15(c)) |

  - **Rejection (after reservation):** reserved capacity is released
    immediately; available capacity is recalculated; the rejected request
    cannot continue using the reservation; the release is audited.
  - **Withdrawal (after reservation):** the reservation is released and the
    capacity becomes available for another eligible transfer; the withdrawal
    and the release are audited.
  - **Cancellation (by an authorised user):** any active reservation is
    released; pending downstream processing stops according to the workflow
    rules; the cancellation and the release are audited. Super Admin, and HR
    within its authorised scope during Pending HR Review, HR Processing and
    Payroll Processing only, may cancel (BRD-027, BRD-OQ-13 and BRD-OQ-18
    resolved).
  - **Blocked / On Hold:** the existing reservation is **retained** because the
    transfer has not been terminated, so the position cannot be allocated to
    another employee while the transfer is blocked. If the transfer is later
    rejected, withdrawn or cancelled, the reservation is then released.
  - **Completion:** when the transfer reaches Completed after IT Final
    Approval, the reservation stops being temporary and becomes a final
    allocation / filled position; vacancy capacity is updated accordingly.
  - **HR changes the selected vacancy:**
    1. The new vacancy is validated.
    2. It must be **Available** (Open) and have sufficient capacity.
    3. The reservation on the old vacancy is released.
    4. Capacity is reserved against the new vacancy.
    5. Steps 3–4 run in one database transaction to avoid inconsistent capacity.
    6. If the new vacancy cannot be reserved, the change fails and the existing
       reservation remains unchanged.
    7. Old vacancy, new vacancy, changed by, date/time and reason are recorded
       in the audit log.

    If the change also alters Department/Business Unit, Designation, Location
    or Reporting Manager, the BRD-024 Receiving Manager re-approval rule applies
    where Receiving Manager approval is enabled.
  - **Concurrency / over-allocation prevention:** validation and reservation
    are performed at the backend/database level.
    `Reserved + Filled/Allocated` must never exceed `Total Vacancy Capacity`,
    and capacity must never become negative. If one position remains and two HR
    users approve two different requests simultaneously, only one reserves it;
    the other receives a capacity-unavailable response.
  - **Vacancy status rules:** Full, On Hold and Closed vacancies accept no new
    reservation. Existing in-flight reservations are **not** removed merely
    because the vacancy status changes; releasing one requires an authorised
    business action and is recorded in the audit log.
  - **Vacancy edge cases (BRD-OQ-15 resolved, 2026-09-30; Gate 0 comment 4):**
    - **(a) Resume validation.** Before a Blocked request resumes, the system
      revalidates that: the vacancy still exists and has not been deleted; the
      reservation belongs to the same Transfer Request and is still active and
      valid; total reserved/allocated capacity does not exceed configured
      capacity; the employee and selected vacancy still match the approved
      transfer details; and no conflicting final allocation has occurred. On
      success the request returns to the workflow stage from which it was
      blocked. On failure it **remains Blocked** and HR/Super Admin must
      resolve the issue before it can continue.
    - **(b) Vacancy status change while a request is Blocked.** A change to
      Full, On Hold or Closed never automatically releases an existing valid
      reservation:
      - *Full* — the reservation continues; no new reservation is permitted;
        the blocked transfer may resume on its existing reservation.
      - *On Hold* — the reservation is retained; no new reservation is
        permitted; the transfer stays Blocked until the vacancy is reopened or
        an authorised user decides to cancel/release the reservation.
      - *Closed* — the reservation is retained initially (no silent capacity
        change); the transfer cannot resume against a Closed vacancy. HR/Super
        Admin must reopen the vacancy, change the employee to another valid
        vacancy (per the HR vacancy-change rules above), or cancel the transfer
        and release the reservation.
    - **(c) Releasing an in-flight reservation.** Explicit release is
      permitted to **HR** (requests within its authorised organisational/
      location scope) and **Super Admin** only; Reporting Manager, Receiving
      Manager, Employee and IT cannot release vacancy capacity. Reservations
      are released automatically on Rejected, Withdrawn and Cancelled. A manual
      release requires a **mandatory reason**; the audit log records vacancy,
      Transfer Request ID, employee, capacity released, released by, role,
      reason and date/time.
    - **(d) "Available" vs "Open".** The reviewer's "Available" corresponds to
      vacancy status **Open** with available capacity greater than zero.
      Statuses remain Open, Full, On Hold and Closed (Open = accepts a new
      reservation when capacity exists; Full = available capacity zero; On Hold
      = temporarily unavailable; Closed = unavailable). `Available Vacancy =
      Status is Open AND Available Capacity > 0`, where `Available Capacity =
      Total Capacity − Active Reserved/Allocated Capacity`. "Available" is a
      description, not a stored status.
- **BRD-029** — Employee Eligibility for Internal Transfer (Gate 0 comment 5,
  author response 2026-09-30). An employee may initiate an Internal Transfer
  Request only when **all** mandatory eligibility conditions below are met.

  | # | Rule | Requirement |
  |---|---|---|
  | 1 | Employment Status | The employee must be **Active**. Inactive, terminated, separated or resigned employees cannot initiate a new transfer request. |
  | 2 | Minimum Tenure | **No minimum-tenure restriction in the current phase.** Any future tenure policy will be configured from HR/business requirements. |
  | 3 | Existing Active Transfer Request | Only **one active transfer request at a time**. While a request is in progress the system prevents submission of another. A new request is allowed only after the existing one reaches a final status: **Completed, Rejected, Withdrawn or Cancelled** (full rule: BRD-030). |
  | 4 | Pending Transfer Restriction | An approved transfer that has not yet reached **Completed** blocks any further request. |
  | 5 | Vacancy Availability | The employee must select an **Available** vacancy. Vacancies that are **Full, On Hold or Closed** cannot be selected. Final capacity validation and reservation occur at HR validation/approval (BRD-028). |
  | 6 | Employee & Organisation Data | The employee record must hold the mandatory organisation data: Employee ID, Current Department/Business Unit, Current Designation, Current Location, Reporting Manager and Employment Status. In the current phase the **Internal Transfer Portal** is the operational source of this data, maintained by Super Admin / HR (see field ownership below); if any of it is missing, submission is blocked. |
  | 7 | HR Validation | HR performs the final eligibility validation before approving the transfer, and may verify employment status, organisational information, vacancy availability and any applicable company transfer restrictions. If HR finds the employee not eligible, HR **rejects** with a mandatory reason; if only correctable information is missing or incorrect, HR requests clarification (see below). |
  | 8 | Other HR Restrictions | Disciplinary, probation, notice-period, performance-related or other company-specific restrictions are **not assumed** by the development team. If required, HR/business must provide and approve them explicitly before implementation. |

  **System behaviour.** Before allowing submission, the system validates the
  eligibility rules that are available within the portal (rules 1, 3, 4, 5 and
  6). If the employee is not eligible: the transfer request is **not
  submitted**; the employee receives an appropriate validation message; and the
  system **does not reserve vacancy capacity**. Eligibility is revalidated by
  HR at the HR Review stage, before vacancy reservation and further processing
  (BRD-013, BRD-028).

  **Current-phase decision.**
  `Active Employee + No Other Active Transfer + Valid Organisation Data +
  Available Vacancy + HR Validation = Eligible for Internal Transfer`

  Any additional company-specific eligibility policy must be confirmed by
  HR/business and documented before it is introduced into the workflow.

  - **Effect of the one-active rule (follows from rules 3–4):** every status
    other than Completed, Rejected, Withdrawn and Cancelled is treated as
    "active" for this rule; Blocked / On Hold and Info Required are confirmed
    as active by BRD-030 (resolves BRD-OQ-16(a)).
  - The "Available" vacancy status maps to BRD-017 "Open" with available
    capacity greater than zero (BRD-OQ-15(d) resolved). The
    multiple-active-requests rule (Gate 0 comment 6) is defined in full in
    BRD-030.

  **Source of truth for employee and organisation data (BRD-OQ-16(b),
  BRD-OQ-19 — Gate 0 comment 7, author responses 2026-09-30).** For the
  **current phase** the Internal Transfer Portal is the operational source for
  employee and organisation data used by the transfer workflow; it is maintained
  in the portal by authorised Super Admin / HR users. Field ownership:

  | Field | Source of truth / owner (current phase) |
  |---|---|
  | Employee ID | Portal — created/maintained by Super Admin |
  | Employee Name | Portal — Super Admin |
  | Official Email | Portal — Super Admin |
  | Employment Status | Portal — Super Admin / HR |
  | Department / Business Unit | Portal organisation master — Super Admin; transfer-related update by HR |
  | Designation | Portal designation master — Super Admin; transfer-related update by HR |
  | Location | Portal location master — Super Admin; transfer-related update by HR |
  | Reporting Manager | Portal employee/manager mapping — Super Admin; transfer-related update by HR |
  | HR Assignment | Portal — Super Admin, from configured location/organisation mapping |
  | IT Assignment | Portal — Super Admin, from configured location mapping |
  | Effective Transfer Date | Transfer Request — confirmed/updated by HR |
  | Vacancy | Portal vacancy master — Super Admin; selected against the Transfer Request |
  | Payroll Reference / Assignment | Transfer Request / Payroll activity — authorised HR |
  | Transfer-specific organisation metadata | Transfer Request — authorised HR |

  Department, Designation, Location and Vacancy values must come from configured
  portal master data and cannot be entered as arbitrary free text during
  transfer processing.

  **No HR-system synchronisation in the current phase.** Automatic HR-system
  integration is out of scope: no real-time synchronisation, no scheduled
  synchronisation, no automatic HR-system callback, and no dependency on
  HR-system availability for normal portal operation. If HR-system integration
  is introduced later, its API contract, synchronisation frequency, ownership,
  failure handling and reconciliation rules must be separately defined and
  approved.

  **Portal data versus an external HR master.** The workflow uses the current
  approved portal data. For an in-flight transfer, the values stored against
  the Transfer Request are the values the workflow uses; if authorised HR
  changes transfer-related organisation information during processing, the
  updated values are used. Where the change affects Department/Business Unit,
  Designation, Location or Reporting Manager, the BRD-024 re-approval rule
  applies when Receiving Manager approval is enabled. Previous and new values
  are preserved in the audit history.

  **HR updates under BRD-020 / BRD-024** update the **portal / Transfer Request
  data only**; the portal does **not** automatically update any external HR
  master system. If the organisation needs the same change in another HR
  system, that follows its existing HR process outside this portal unless an
  integration is separately approved. BRD-024 continues to apply.

  **Missing mandatory data.** Before an employee submits a transfer request the
  system validates that all mandatory employee and organisation information is
  available. If any is missing or incorrect:
  - the employee **cannot submit** the request and **cannot directly modify**
    controlled organisation/master data;
  - **no vacancy capacity is reserved**;
  - the employee receives a clear validation message identifying the missing
    information;
  - the employee is directed to the **assigned HR team**, determined from the
    employee's configured Location / HR assignment in the portal;
  - HR corrects transfer-related information within its authorised scope, and
    coordinates with **Super Admin** where the change needs Super Admin
    authority (e.g. master data);
  - after correction, eligibility and required data are **revalidated** before
    the workflow continues, and the employee may submit subject to normal
    eligibility validation.

  Example message: *"Your employee profile is incomplete. Please contact HR to
  update the required organisation information before submitting an Internal
  Transfer Request."* The portal **must not automatically invent or substitute**
  missing organisation data.

  **HR finds the employee ineligible at HR Review (BRD-OQ-16(c)).**

  | HR finding | HR action | Resulting flow |
  |---|---|---|
  | Not eligible under business / HR policy | **Reject** — rejection reason **mandatory** | Pending HR Review → **Rejected** (final/closed) |
  | Information missing or incorrect but **correctable** | **Request Clarification / Info Required** (not Reject) | Pending HR Review → Info Required → employee provides information → Pending HR Review |

  After an HR rejection: the employee is notified; the HR rejection reason is
  visible to the employee as permitted by policy; any applicable vacancy
  reservation is released (BRD-028); **no Payroll or IT processing is
  initiated**; the rejection is recorded in the audit log; and the request
  becomes a closed/final request, after which a new request may be submitted
  under BRD-030 (same vacancy included, subject to current eligibility, no other
  active request, vacancy Open/Available and capacity available).
- **BRD-030** — One Active Transfer Request per Employee (Gate 0 comment 6,
  author response 2026-09-30). An employee may have **only one active Internal
  Transfer Request at a time**.

  `One Employee = Maximum One Active Transfer Request at a Time`

  **Active statuses.** A request is active while it is in any of: Pending
  Reporting Manager Approval; Pending Receiving Manager Approval; Pending HR
  Review; Info Required / Clarification; HR Processing; Pending Receiving
  Manager Re-Approval; Payroll Processing; Pending IT Action; Pending IT Final
  Approval; Blocked / On Hold.

  **Final (closed) statuses.** Completed, Rejected, Withdrawn, Cancelled. A new
  transfer request may be submitted only when the employee's existing request
  is in one of these statuses.

  | Rule | Requirement |
  |---|---|
  | Multiple active requests | An employee cannot create or submit another transfer request while an existing one is active. |
  | Same vacancy twice | An employee cannot apply to the same vacancy twice while the existing request for it is active. Because only one active request is permitted, duplicate active applications to the same or any other vacancy are prevented. |
  | After Rejected | Rejected is final/closed. The employee may create a new request, subject to current eligibility and vacancy availability. |
  | After Withdrawn | Withdrawn is final/closed. The employee may create a new request. Any reservation held for the withdrawn request is released under the BRD-028 rules. |
  | After Cancelled | Cancelled is final/closed. The employee may create a new request, subject to eligibility and vacancy availability. |
  | After Completed | Completed is closed. The employee may submit another request immediately (no cool-down in the current phase), subject to eligibility (BRD-029), no other active request, vacancy availability and applicable HR/business rules. |

  **Every new request after a closed one:**
  1. Receives a **new Transfer Request ID/reference**.
  2. Revalidates employee eligibility (BRD-029).
  3. Revalidates vacancy availability (BRD-028).
  4. Starts the approval workflow from the beginning (BRD-027).
  5. Does **not** reuse approvals from the previous request.
  6. Leaves the previous request as a separate record for history and audit.

  **Rejection message.** If an active request exists, the new submission is
  rejected with: *"You already have an active internal transfer request. Please
  wait until the existing request is completed or closed before submitting a new
  request."*

  **Draft (BRD-OQ-17(a)).** An unsubmitted **Draft does not count as an active
  request**. The one-active-request restriction starts only when the employee
  successfully **submits** the request. An employee may hold a Draft while no
  submitted active request exists, but only **one submitted active request**
  can exist at any time.

  `One Employee = Maximum One Submitted Active Transfer Request`

  **Enforcement (BRD-OQ-17(b)).** Enforcement is **mandatory at both the
  backend/API level and the database level**. The system must prevent
  simultaneous submissions from creating more than one active request for the
  same employee. Frontend validation may be provided for user experience but is
  not sufficient enforcement.

  **Duplicate-active rejection (BRD-OQ-17(c)).** The backend rejects the
  submission with **HTTP 409 Conflict**, error code
  `ACTIVE_TRANSFER_ALREADY_EXISTS`, and the rejection message above. The
  existing request remains unchanged.

  **No cool-down (BRD-OQ-17(d)).** No cool-down or waiting period applies in the
  current phase. After a request reaches Completed the employee may submit a new
  request immediately, subject to employee eligibility (BRD-029), no other
  active request, vacancy availability (BRD-028) and applicable HR/business
  rules.

- **BRD-031** — Effective Transfer Date Validation (Gate 0 comment 8, author
  response 2026-09-30). The system validates the Effective Transfer Date
  against one approved rule set, applied identically to every role involved in
  the transfer and approval process.

  `Current Date ≤ Effective Transfer Date ≤ Current Date + 30 Days`

  | Rule | Requirement |
  |---|---|
  | Past dates | **Not allowed.** A date earlier than the current date is rejected. |
  | Current date | **Allowed.** "Current date" is determined in the **application/server-configured business time zone**. |
  | Future dates | Allowed up to a **maximum of 30 calendar days** in the future, **inclusive** (current date to current date + 30 days); the 30-day limit is **fixed for the current phase** and not configurable by users; the date may be selected from the current date up to that limit. A future date is **not mandatory**, so no minimum notice period applies. |
  | Who the rule applies to | **All roles** involved in the transfer and approval process — the same restriction applies to the employee at submission and to any authorised role that sets or changes the date. |
  | Who can set or change the date | **Employee** — selects or modifies the date only while the request is in **Draft**; after submission the Employee **cannot modify** it. **HR** — may modify it during the approval process when a date adjustment is required. **Super Admin** — may modify it when administrative intervention is required. No other role may change it. |
  | Modification by an authorised role | An updated date must follow the same rule and **cannot be a past date**. |
  | Weekends and holidays | **Allowed** as Effective Transfer Dates. No weekend or holiday calendar check is performed. |
  | Approval completed after the date has passed | The transfer **cannot be completed with an expired date**. **HR** updates it to a valid current or future date while the request is in an HR-controlled stage; once the request has progressed beyond the HR-controlled stages, **Super Admin** performs the administrative intervention so the date can be corrected. The updated date must still satisfy the current date to +30 calendar days rule. |
  | Re-approval on change | Changing **only** the Effective Transfer Date **does not trigger re-approval by default**. If re-approval for a date change is enabled in the **Super Admin workflow configuration**, the request returns to the **configured approval stage/approver**. |

  **Enforcement.** The rule is validated by the backend/API for every create or
  change of the date; frontend date-picker limits are UX only (BRD-026). A date
  outside the permitted range is rejected with a validation message and the
  stored date is unchanged.

  **Change of the date.** Each change is audited (BRD-022) with the previous
  value, new value, changed by, role, date/time and reason/remarks. The
  re-approval setting is a **Super Admin configuration**; when it is not
  configured, a date change does not alter the workflow status and does not send
  the request back to any approver. BRD-024 is unaffected: it continues to
  govern Department/Business Unit, Designation, Location and Reporting Manager
  only.

  **Expired date at completion (BRD-OQ-20(d)).** If the selected date becomes a
  past date before the transfer is completed, the request cannot be completed
  with it (the IT Final Approval gate in BRD-014/BRD-027 is not satisfied until
  the date is corrected). HR-controlled stages are Pending HR Review, HR
  Processing and Payroll Processing (BRD-027): HR corrects the date there; in
  Pending IT Action and Pending IT Final Approval, Super Admin performs the
  administrative intervention. The corrected date is validated by the same rule.
  Every correction is audited.

  **Employee editing (BRD-OQ-20(a)).** The Employee's ability to set or change
  the date ends at submission; editing of other submitted fields remains subject
  to the open comment 14 rules.

  **Resolved (BRD-OQ-20, 2026-09-30):** modifying roles and stages, business
  time zone, inclusive and fixed 30-day limit, optional re-approval routing to
  the configured stage/approver, and the owner of an expired-date correction are
  all answered above. The approver(s) and stage for the optional re-approval are
  whatever Super Admin configures; none is assumed.

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
  validate employee eligibility (BRD-029) and proposed transfer details, validate
  vacancy/capacity per agreed business rules, approve/reject/return HR
  validation (reject with mandatory reason where the employee is not eligible;
  request clarification where information is correctable — BRD-029), assign or update organisation metadata, assign payroll
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
  required, IT selects **No IT Action Required**, records a reason/remark
  (BRD-027), and then provides Final Approval. IT's final approval is the gating action that
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
  existing in-flight requests and reservations continue per their workflow
  status. The full reservation, release, change-of-vacancy and concurrency rules
  are defined in BRD-028.
- **BRD-018** — End-to-end transfer workflow (resolved, see BRD-OQ-10):
  Initiate (Employee) → Reporting Manager review → Receiving Manager review
  (if configured) → HR validation → [BRD-024 re-approval loop, if
  triggered, returning to HR Processing] → HR Processing → Payroll Processing
  (sequential; BRD-OQ-14) → IT review/activities → IT Final
  Approval → Close (notify employee). IT Final Approval is the final step;
  HR/Payroll activities must be complete (or, per BRD-014, IT must select
  No IT Action Required) before IT gives that approval, but IT approval
  itself is what marks the transfer Completed. *(User-directed deviation
  from source SOW §9/§10, which assign the verify/completion decision to
  HR/Portal rather than to IT alone — see revision note at top of this
  document.)*
- **BRD-019** — Status/exception model. Workflow statuses are those of the
  BRD-027 transition matrix: Draft, Pending Reporting Manager Approval,
  Pending Receiving Manager Approval, Info Required, Pending HR Review, HR
  Processing, Pending Receiving Manager Re-Approval, Payroll Processing,
  Pending IT Action, Pending IT Final Approval, Completed, Rejected,
  Withdrawn; Blocked and Cancelled are retained from the earlier status model
  (their transitions are defined in BRD-027, BRD-OQ-13 resolved; Cancelled is
  final). Status changes are permitted only
  through BRD-027. A request must not be shown as
  Completed merely because it has been approved by Reporting/Receiving
  Manager or HR — completion is reached only once IT gives final approval.
  IT approval is the last gate in the transfer process.
- **BRD-020** — During HR validation, HR can update or assign
  transfer-related organisation metadata (resolved, see BRD-OQ-07):
  Department/Business Unit, Designation, Location, Reporting Manager,
  Effective Transfer Date, applicable payroll assignment/reference, and
  other approved organisational information. These updates change portal /
  Transfer Request data only, not an external HR system (BRD-OQ-19). HR also assigns the applicable
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
    Receiving Manager re-approval → HR Processing (HR confirmation) →
    Payroll Processing → IT → IT Final Approval → Completed. The Receiving Manager sees
    both previous and updated values and can approve, reject with mandatory
    reason, request clarification, or add comments. HR must provide a
    reason/remark when making the change.
  - **If not enabled/configured**, the transfer continues without returning
    to a Receiving Manager, following the workflow configured by the Super
    Admin and using the updated organisational information.
  - **No bypass:** HR cannot bypass the configured re-approval process when
    any of these four organisation details is changed; BRD-024 remains
    mandatory (Gate 0 comment 9).
  - The audit log records: changed field, previous value, new value,
    changed by, changed date/time, change reason/remarks, whether
    re-approval was triggered, Receiving Manager decision, decision
    date/time, and decision remarks.
- **BRD-021** — HR can upload authorised transfer and organisation documents,
  linked to the relevant employee and/or transfer request; document access
  follows role and organisational scope; document metadata includes
  category/type, uploader, upload timestamp and employee/request reference.
  Document policy (resolved, see BRD-OQ-08 and Gate 0 comment 13): allowed
  file types are **PDF and image formats** only; maximum file size is
  **5 MB per file**; storage is **configured local server storage** for the
  current phase; malware scanning, retention, archive and deletion policy are
  **not required**. Document security is enforced at the **API/server level**
  and does not rely on frontend restrictions:
  - The server validates the uploaded file **MIME type** against the allowed
    PDF/image types and the **file extension** against the allowed document
    types; file names are **sanitised** before storage.
  - Documents are accessed only through an **authenticated and authorised
    API/server endpoint**; they are **never exposed through unrestricted
    public URLs**.
  - Access follows the user's role and assigned organisation scope; users
    cannot access documents belonging to employees/transfers outside their
    authorised scope. Every view/download request verifies that the
    requester may access the associated employee/transfer.
  - Document upload and access actions (upload, view, download,
    uploaded-by, upload date/time, category/type, associated employee,
    associated transfer reference) are captured in the audit log where
    applicable.
  - **Validation failures:** uploads are rejected at the API/server level
    and the invalid file is not stored. A file over 5 MB returns **HTTP 413
    Payload Too Large** (`FILE_SIZE_EXCEEDED`); an unsupported file
    type/format returns **HTTP 415 Unsupported Media Type**
    (`UNSUPPORTED_FILE_TYPE`); a MIME type/file extension mismatch returns
    **HTTP 415** (`INVALID_FILE_TYPE`). Each response carries a clear error
    code and message for the frontend to display. These rules apply to all
    document uploads in the portal.
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
  enforced on first successful login; account locking, session idle timeout,
  password complexity and session invalidation per BRD-025. MFA/SSO are out
  of scope for the current phase.
- **NFR-002 (Authorisation):** Role-based and scope-based access with least
  privilege enforced in both UI and APIs. The backend/API is the authoritative
  layer and validates `Authenticated User → Role → Organisation Scope →
  Resource → Action` on every protected request (BRD-026); 401 for missing/
  invalid/expired authentication, 403 for insufficient permission.
- **NFR-003 (Credential Security):** Strong password hashing; no plaintext
  password persistence anywhere (DB, logs, reports, audit); secure reset and
  failed-login protection. Passwords, temporary passwords, access/refresh
  tokens and other authentication credentials are never written to
  application or audit logs (BRD-025).
- **NFR-004 (Transport & Data Protection):** Encrypted transport and
  protection of personal/employee information.
- **NFR-005 (Auditability):** Protected, tamper-resistant audit records for
  material decisions, configuration changes and security events.
- **NFR-006 (Reliability):** Recoverable integration failures, clear error
  ownership, and safeguards against duplicate downstream execution. Retrying
  an integration request must not create duplicate downstream transactions;
  a failed integration remains visible with its failure status/error details
  and supports an authorised retry where applicable (see Integration
  Requirements in Business Rules).
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
  vacancy is Full, On Hold, or Closed. Reserved plus filled positions never
  exceed total capacity; reservations are released on rejection, withdrawal or
  cancellation, retained while Blocked, and become final allocations on
  completion (BRD-028).
- An employee is eligible to initiate a transfer only when they are Active, have
  no other active transfer request (and no approved transfer short of Completed),
  hold the mandatory organisation data and select an Available vacancy, subject
  to HR validation. No minimum tenure applies in this phase, and developers must
  not assume any other HR eligibility restriction (disciplinary, probation,
  notice-period, performance) until HR/business supplies and approves it
  (BRD-029).
- In the current phase the portal is the operational source of employee and
  organisation data, maintained by Super Admin / HR with the field ownership in
  BRD-029; no automatic HR-system synchronisation exists, in-flight transfers
  use the values stored on the Transfer Request, HR changes update portal data
  only, and Department, Designation, Location and Vacancy come from portal
  master data, never free text (BRD-029, BRD-OQ-19). If mandatory data is
  missing the request cannot be submitted, no capacity is reserved and the
  employee is told to contact the assigned HR team (BRD-029, BRD-OQ-16). If HR finds the employee ineligible under business/HR policy, HR
  rejects with a mandatory reason (Rejected, final; reservation released; no
  Payroll/IT processing; audited); if only correctable information is missing
  or incorrect, HR requests clarification instead (BRD-029, BRD-013).
- One Employee = maximum one active transfer request at a time. Submission is
  refused while a request is in any active status; only Completed, Rejected,
  Withdrawn and Cancelled are closed. A new request after a closed one gets a
  new Transfer Request ID, revalidates eligibility and vacancy availability,
  restarts the approval workflow and reuses no earlier approvals; the earlier
  request is kept separately for history and audit. The check is enforced by the
  backend/API, with database-level controls against simultaneous submissions
  (BRD-030).
- Block, Resume, Cancel and Reassign (BRD-027): Block = temporarily stop
  (Super Admin at any non-final stage; HR in Pending HR Review, HR Processing and
  Payroll Processing and IT in Pending IT Action and Pending IT Final Approval,
  each within scope; Reporting Manager, Receiving Manager and Employee cannot
  block); Resume = continue from the stored pre-block status after
  revalidating business conditions incl. vacancy (Super Admin any; HR and IT
  only their own controlled stages; no cross-resume between HR and IT); Cancel
  = permanently close (Super Admin; HR in scope only during Pending HR Review,
  HR Processing and Payroll Processing, or when the request is Blocked and was
  blocked during one of those stages — never an IT-blocked request; Cancelled is final and
  not reopenable; Completed/Rejected/Withdrawn/Cancelled requests cannot be
  cancelled; employee-initiated stop is Withdrawal); Reassign = change task
  ownership only, without changing status or bypassing approvals. None of the
  four applies to an unsubmitted Draft. Block,
  Cancel and Reassign require a mandatory reason, and all four actions are
  audited. None may bypass mandatory Reporting Manager, Receiving Manager, HR,
  Payroll or IT Final Approval requirements.
- The Effective Transfer Date must be the current date (in the application/
  server-configured business time zone) or a date up to 30 calendar days in the
  future, inclusive; the 30-day limit is fixed in the current phase. Past dates
  are rejected for every role. The Employee may set or change the date only in
  Draft; HR may change it during approval and Super Admin for administrative
  intervention. Weekends and holidays are allowed. A transfer cannot be
  completed with an expired date: HR corrects it in an HR-controlled stage,
  Super Admin beyond those stages. Changing only the date does not trigger
  re-approval unless Super Admin enables it, in which case the request returns
  to the configured stage/approver; every change is audited (BRD-031).
- If HR changes a previously approved Department/Business Unit,
  Designation, Location, or Reporting Manager value, and Receiving Manager
  approval is enabled, the request must automatically return to the
  Receiving Manager for re-approval before HR/Payroll/IT activities
  continue (BRD-024).
- Reporting Manager, Receiving Manager, and HR rejection actions must
  include a mandatory reason; a reviewer can instead request additional
  information/clarification, and the request returns to the appropriate
  responsible user without losing prior workflow history.
- The employee can withdraw the transfer request only until HR approves it
  (from Pending Reporting Manager Approval, Pending Receiving Manager Approval,
  Info Required or Pending HR Review), with a mandatory reason. Withdrawn is
  final and cannot be reopened; a new application is a new Transfer Request.
  The withdrawal is recorded in the audit log, any exceptional vacancy
  reservation is released immediately and pending downstream tasks are
  cancelled where applicable (BRD-027, BRD-OQ-12).
- Workflow status changes follow the controlled transition model of BRD-027 and
  are validated by the backend; invalid or unauthorised transitions are
  rejected.
- IT users see only the minimum employee/transfer information required for
  their assigned task (least-privilege scoping).
- Receiving Manager review stage is enabled or disabled by configurable
  company policy, not hard-coded.
- Document access is scoped by role and organisation; users do not
  automatically gain access to all employee documents. Upload and access
  are secured at the API/server level (5 MB per file, PDF/image only, MIME
  and extension validation, sanitised file names, authenticated endpoint,
  no public URLs; BRD-021, Gate 0 comment 13).
- Payroll calculations, compensation rules and statutory processing remain
  the responsibility of the authoritative payroll system; the portal only
  coordinates the handoff/status.
- **Integration Requirements (Gate 0 comment 12, 2026-10-01).** For the
  current phase **no external Payroll or HR system integration/API is
  defined**; Payroll activity is completed manually by the authorised HR user
  in the portal (BRD-027(c)) and no unspecified external integration is
  assumed. If any external integration is introduced later, its integration
  contract must be defined and approved **before implementation** and must
  include: API/interface details, authentication method, request and response
  formats, required fields, success and failure responses, timeout and retry
  rules, duplicate request handling, idempotency mechanism, status mapping,
  error handling and source of truth. Per NFR-006, integration failures must
  be recoverable and auditable, and retrying a request must not create
  duplicate downstream transactions. A failed integration remains visible in
  the system with its failure status/error details and supports an authorised
  retry where applicable. Detailed API contracts are documented separately
  before any external integration is implemented.

---

## Dependencies

- Local-credential authentication mechanism (password hashing, session
  management) — model confirmed, see BRD-OQ-01.
- Employee, organisation, hierarchy and eligibility data are maintained in the
  portal by Super Admin / HR in the current phase (BRD-029, BRD-OQ-19). No
  external HR-system dependency exists; any future HR-system integration needs
  its own approved contract.
- No external Payroll/HR integration exists in the current phase; any future
  integration depends on a separately documented and approved contract
  (Business Rules — Integration Requirements, NFR-006).
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
- User ID convention is role-prefixed (`EMP/MGR/HR/IT######`) and the
  password/lockout/session policy follows BRD-007 and BRD-025 (BRD-OQ-02
  resolved; configuration values confirmed 2026-09-30).
- HR will provide vacancy/capacity policy edge cases beyond what is captured in
  BRD-013 and BRD-017/BRD-024. Effective-date rules are as defined in BRD-031
  (BRD-OQ-20 resolved). Eligibility rules are
  as defined in BRD-029; no further HR eligibility restrictions are assumed, and
  any additional ones must be supplied and approved by HR/business first.
  Employee and organisation data are maintained in the portal by Super Admin /
  HR; the assigned HR team corrects missing or incorrect information within its
  scope and coordinates with Super Admin where required (BRD-OQ-16, BRD-OQ-19
  resolved).
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
- Workflow transitions follow the BRD-027 matrix; withdrawal is allowed until
  HR approval with a mandatory reason and Withdrawn is final (BRD-OQ-12
  resolved); Block/Resume/Cancel/Reassign follow the BRD-027 rules (BRD-OQ-13
  resolved) and cannot bypass mandatory approvals; the HR-controlled stages
  (Pending HR Review, HR Processing, Payroll Processing), IT-controlled stages
  (Pending IT Action, Pending IT Final Approval), HR cancellation limits, Draft
  exclusion and cross-role Resume rules are business-confirmed (BRD-OQ-18
  resolved). HR Confirmation is an activity within HR Processing (not a
  status); HR Processing precedes Payroll Processing sequentially; Payroll
  completion is recorded manually by an authorised HR user with no Payroll
  API/callback this phase; invalid transitions return 403
  `INVALID_WORKFLOW_TRANSITION` (BRD-OQ-14 resolved).

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
- Automatic HR-system integration or synchronisation (real-time, scheduled or
  callback) and automatic updates to an external HR master — not in the current
  phase; to be separately defined and approved if introduced (BRD-OQ-19).
- External recruitment, cross-company transfer, immigration or relocation
  benefit processing, unless separately agreed.
- Historical data migration, bulk backfill and custom integrations not
  identified and approved during discovery.
- Advanced workforce planning or predictive vacancy forecasting, unless
  separately agreed.

---

## Open Questions

BRD-OQ-01 … BRD-OQ-11 below have been answered by the user and incorporated
into the requirement IDs shown. BRD-OQ-12, BRD-OQ-13, BRD-OQ-14 and BRD-OQ-15 (**now Resolved**, 2026-09-30) were raised while
addressing Gate 0 comment 3, BRD-OQ-15 while addressing comment 4, BRD-OQ-16 while addressing comment 5 (**now Resolved**, 2026-09-30: points (a) and (d) by the comment 6 response, points (b) and (c) by the author answer on the employee-data source and HR-ineligible outcome), BRD-OQ-17 while addressing comment 6 (**now Resolved**, 2026-09-30), BRD-OQ-18 while resolving BRD-OQ-13 (**now Resolved**, 2026-09-30), and BRD-OQ-19 while resolving BRD-OQ-16(b) (**now Resolved**, 2026-09-30), and BRD-OQ-20 while addressing comment 8 (**now Resolved**, 2026-09-30); all others are **Open**; the Gate 0 reviewer must answer
them before approval. Formal Gate 0 sign-off (recorded in
`.ai-context/pr_reviews/BRD-<timestamp>.md` by the assigned, email-verified
Project Manager / Business Analyst reviewer) is still required before Status
moves to Approved.

| ID | Open Question | Status | Resolution Summary | Incorporated In |
|---|---|---|---|---|
| BRD-OQ-01 | Will authentication use local credentials, enterprise SSO/identity provider, or a hybrid model? | Resolved | Local credential-based authentication. | BRD-001, NFR-001 |
| BRD-OQ-02 | What is the organisation's approved User ID naming/numbering convention, password policy, and account security standard (failed-login lockout, session timeout)? | Resolved | Role-prefixed auto-generated User IDs (`EMP/MGR/HR/IT######`); password complexity, failed-login protection, lock/unlock, session timeout, admin reset, forced change after reset. Values confirmed 2026-09-30 (Gate 0 comment 1): 5 failed attempts, 30-minute lock, 30-minute idle timeout, 8+ chars with upper/lower/number/special. | BRD-004, BRD-007, BRD-025 |
| BRD-OQ-03 | What is the approved secure mechanism for delivering initial credentials to new users (email, SMS, identity service)? | Resolved | Delivered via the user's official company email address. | BRD-005 |
| BRD-OQ-04 | Is Receiving Manager approval enabled by default, or configured per organisation/team? | Resolved | Configurable by Super Admin; workflow includes or skips the Receiving Manager stage accordingly. | BRD-012 |
| BRD-OQ-05 | At what point is vacancy capacity reserved — submission, approval, or HR validation? | Resolved | Reserved only at HR validation/approval against the selected vacancy. | BRD-017 |
| BRD-OQ-06 | What are the agreed concurrency/reservation rules to prevent vacancy over-allocation, and what is vacancy closure/hold behaviour for in-progress requests? | Resolved | `Available = Capacity − Allocated/Reserved`; DB transaction/concurrency control; no new allocation once Full/On Hold/Closed; existing in-flight requests unaffected. Detailed in Gate 0 comment 4 response (2026-09-30): in-flight reservations are released only by an authorised, audited business action. | BRD-017, BRD-028, Business Rules |
| BRD-OQ-07 | What are the organisation metadata fields HR must update/assign, and what is the authoritative source system for them? | Resolved | Department/Business Unit, Designation, Location, Reporting Manager, Effective Date, payroll reference; changing a previously approved value triggers the BRD-024 re-approval rule. | BRD-020, BRD-024 |
| BRD-OQ-08 | What are the allowed document file types, maximum size, storage location, malware-scanning requirement, retention period, and deletion policy? | Resolved | PDF and image files only; local server storage; no malware scanning, retention, archive, or deletion policy required; maximum size 5 MB per file (Gate 0 comment 13); server-side MIME/extension validation, file-name sanitisation, authenticated access only. | BRD-021 |
| BRD-OQ-09 | What are the specific performance, availability, backup, retention and monitoring targets? | Resolved (deferred) | Deferred to infrastructure/deployment planning; confirmed before production deployment. | NFR-009 |
| BRD-OQ-10 | What is the exact reviewer sequence, HR eligibility rules, organisation hierarchy source, withdrawal rules, and escalation rules to be confirmed before build approval? | Resolved | Reviewer sequence per BRD-018; rejection requires reason; clarification returns to responsible user without losing history; withdrawal permitted pre-completion per policy and audited; escalation configurable via dashboards/notifications. | BRD-018, BRD-023, Business Rules |
| BRD-OQ-11 | Since IT final approval now gates transfer completion, what happens for a transfer with no applicable IT task? | Resolved | IT final approval is mandatory for every transfer; if no IT work applies, IT selects "No IT Action Required," may add remarks, and still gives Final Approval. | BRD-014 |
| BRD-OQ-12 | What is the last workflow stage at which an employee may withdraw a transfer, is a withdrawal reason mandatory, and can a withdrawn request be reopened? | Resolved | Withdrawal allowed until HR approval (Pending Reporting Manager Approval, Pending Receiving Manager Approval if applicable, Info Required, Pending HR Review); after HR approval only the separate Cancellation process applies. Reason mandatory and audited. Withdrawn is final and cannot be reopened; reapplying creates a new Transfer Request. | BRD-027, BRD-030 (Gate 0 comments 3, 15) |
| BRD-OQ-13 | Which roles may Block, Resume, Cancel or Reassign a transfer, from which statuses, and what are the resulting statuses? The BRD-027 matrix contains no rows for these. | Resolved | **Block:** Super Admin (any non-final stage), HR (HR/Payroll processing, in scope), IT (IT processing, in scope); reason mandatory; → Blocked with previous status stored; reservation retained; Reporting Manager, Receiving Manager and Employee cannot block. **Resume:** Super Admin, HR (HR-blocked, in scope), IT (IT-blocked, in scope); returns to the status blocked from after revalidating business conditions incl. vacancy validity/capacity. **Cancel:** Super Admin; HR in scope where policy permits; reason mandatory; → Cancelled (final, not reopenable); reservation released, downstream tasks cancelled; not possible from Completed/Rejected/Withdrawn/Cancelled; new request via BRD-030. **Reassign:** Super Admin; HR for HR-controlled tasks in scope; reason mandatory; status unchanged, new assignee needs role and scope; no bypass of mandatory approvals; BRD-024 applies if org metadata also changes. All four audited. | BRD-027, BRD-019, BRD-028 (Gate 0 comments 3, 4, 18) |
| BRD-OQ-18 | Residual points in the BRD-OQ-13 answer: (a) which workflow statuses are "HR/Payroll-related processing" (e.g. HR Processing, Payroll Processing, Pending HR Review?) and "IT processing" (e.g. Pending IT Action, Pending IT Final Approval?) for HR/IT Block and Resume; (b) which company policy decides when HR may Cancel, and from which statuses; (c) what happens if revalidation on Resume fails — **answered by BRD-OQ-15(a): the request stays Blocked until HR/Super Admin resolve it**; (d) do Block, Cancel and Reassign apply to an unsubmitted Draft; (e) may a Super Admin Resume a request that HR or IT blocked, and may HR/IT resume one Super Admin blocked? | Resolved | **(a)** HR-controlled stages: Pending HR Review, HR Processing, Payroll Processing; IT-controlled stages: Pending IT Action, Pending IT Final Approval; HR/IT may Block/Resume only within their own stages and assigned scope. **(b)** HR may Cancel within scope during Pending HR Review, HR Processing and Payroll Processing, reason mandatory; other active stages require Super Admin; Cancelled is final, not reopenable, reservation released. **(c)** Already resolved by BRD-OQ-15(a): request stays Blocked until HR/Super Admin resolve it. **(d)** Block, Resume, Cancel and Reassign do not apply to an unsubmitted Draft (employee may edit or discard it). **(e)** Super Admin may Resume any authorised Blocked request; HR only HR-controlled blocks; IT only IT-controlled blocks; no cross-resume between HR and IT; all actions audited. **Follow-up (2026-09-30):** HR may Cancel a Blocked request blocked during an HR-controlled stage, HR cannot Cancel an IT-blocked request, Super Admin may Cancel a Blocked request at any stage (reason mandatory, reservation released, audited, Employee and stakeholders notified). | BRD-027, BRD-019 (Gate 0 comments 3, 4, 18) |
| BRD-OQ-14 | Clarify matrix routing: (a) is "HR Confirmation" a distinct status or part of HR Processing; (b) is HR Processing before, or parallel with, Payroll Processing; (c) which Payroll completion source applies (manual by authorised user, payroll API, or callback); (d) what response applies to a rejected invalid-transition attempt? | Resolved | **(a)** HR Confirmation is an activity within HR Processing, not a status; after BRD-024 re-approval the request returns to HR Processing. **(b)** Sequential: HR Processing → Payroll Processing → Pending IT Action. **(c)** Current phase: an authorised HR user manually marks the Payroll activity completed (status, completed by, date/time, reference, remarks recorded); no payroll calculation and no Payroll API/callback unless separately approved with an integration contract. **(d)** HTTP 403 `INVALID_WORKFLOW_TRANSITION` ("The requested action is not permitted for the current transfer status."); status unchanged, no downstream effects, rejected attempt audited as a security event. IT Final Approval remains the mandatory final gate. | BRD-027, BRD-019, BRD-018, BRD-024 (Gate 0 comments 3, 10) |
| BRD-OQ-15 | Vacancy edge cases left by BRD-028: (a) what validation applies when a Blocked request resumes "subject to validation"; (b) if the vacancy is On Hold/Closed/Full when a request resumes, does the existing reservation continue; (c) which authorised role may explicitly release an in-flight reservation after a vacancy status change; (d) does the reviewer's "Available" vacancy status correspond to "Open" in BRD-017? | Resolved | **(a)** Revalidate vacancy exists/not deleted, reservation belongs to the same request and is valid, capacity not exceeded, employee/vacancy match approved details, no conflicting final allocation; success returns to the blocked-from stage, failure keeps the request Blocked for HR/Super Admin to resolve. **(b)** Status change never auto-releases a reservation: Full — continues, may resume; On Hold — retained, stays Blocked until reopened or cancelled/released; Closed — retained, cannot resume, HR/Super Admin must reopen, move the employee to another vacancy, or cancel and release. **(c)** HR (in scope) and Super Admin may release manually with mandatory reason, audited; Reporting Manager, Receiving Manager, Employee and IT cannot; Rejected/Withdrawn/Cancelled release automatically. **(d)** Yes: Available = status Open AND Available Capacity > 0; Open/Full/On Hold/Closed remain the stored statuses. | BRD-028, BRD-017, BRD-027, BRD-029 (Gate 0 comment 4) |
| BRD-OQ-16 | Eligibility gaps left by BRD-029: (a) do Blocked / On Hold and Information Required requests count as "active" for the one-active-request rule — **answered by BRD-030: yes**; (b) what is the authoritative source for Employment Status and the mandatory organisation data (Employee ID, Department/BU, Designation, Location, Reporting Manager), and what happens when any of it is missing (Gate 0 comment 7); (c) what outcome applies when HR finds the employee ineligible at HR Review (reject or return for correction); (d) may the same vacancy be requested again after a Rejected/Withdrawn/Cancelled request — **answered by BRD-030: a new request is allowed subject to current eligibility and vacancy availability, with no extra same-vacancy restriction stated**? | Resolved | **(a)** Blocked / On Hold and Info Required / Clarification are **active**; only Completed, Rejected, Withdrawn and Cancelled are final (BRD-030). **(b)** Initially answered as "authoritative HR system / employee master data"; **refined by BRD-OQ-19 (2026-09-30): in the current phase the portal is the operational source, maintained by Super Admin / HR, with no HR-system synchronisation.** If any mandatory data is missing the employee cannot submit, no capacity is reserved, a clear validation message names the missing information and directs the employee to the assigned HR team, and the portal never invents or substitutes missing data; after HR corrects it the employee may submit subject to normal eligibility. **(c)** Not eligible under business/HR policy: HR **Rejects** with mandatory reason (Pending HR Review → Rejected; employee notified; reason visible as policy permits; reservation released; no Payroll/IT processing; audited; final). Correctable missing/incorrect information: **Request Clarification** (Pending HR Review → Info Required → Pending HR Review). **(d)** A new request for the same vacancy is allowed after Rejected/Withdrawn/Cancelled (new ID, eligibility and vacancy revalidated, workflow restarted, no approvals reused) subject to current eligibility, no other active request, vacancy Open/Available with capacity (BRD-030). | BRD-029, BRD-030, BRD-013, BRD-027, BRD-028 (Gate 0 comments 5, 6, 7) |
| BRD-OQ-17 | Gaps left by BRD-030: (a) does an unsubmitted Draft count as an active request, given the response bars *creating* another request but omits Draft from the active list; (b) is database-level enforcement (e.g. a uniqueness constraint or locking on the employee) mandatory, as the reviewer's "application/database level" requires, or only "where appropriate"; (c) which HTTP status code and error structure apply to the duplicate-active rejection; (d) does any cool-down or waiting period apply after Completed, beyond eligibility rules and HR/business policies? | Resolved | **(a)** No: an unsubmitted Draft is not active; the restriction starts on successful submission; one employee may have at most one submitted active request. **(b)** Yes: enforcement is mandatory at backend/API **and** database level and must prevent simultaneous submissions creating multiple active requests; frontend validation is UX only. **(c)** HTTP 409 Conflict, `code: ACTIVE_TRANSFER_ALREADY_EXISTS`, message "You already have an active internal transfer request. Please wait until the existing request is completed or closed before submitting a new request."; the existing request is unchanged. **(d)** No cool-down in the current phase; after Completed a new request may be submitted immediately subject to eligibility, no other active request, vacancy availability and HR/business rules; new ID, workflow restarts, eligibility and vacancy revalidated, no approvals reused. | BRD-030 (Gate 0 comments 6, 16) |
| BRD-OQ-19 | Residual points in the BRD-OQ-16(b) answer (Gate 0 comment 7 asks for a source of truth **per field**): (a) which source applies to Employee Name, Email, HR assignment and any other organisation metadata not named in the answer; (b) how and how often the portal synchronises from the HR system (real-time, scheduled, on demand) and what applies when the HR system is unavailable; (c) when portal data differs from the HR master, which value wins in an in-flight request; (d) BRD-020/BRD-024 let HR assign or update organisation metadata in the portal — does that update the HR master, or must it be corrected in the HR system first; (e) which HR team(s) are contacted for a missing-data correction. | Resolved | **(a)** Per-field ownership assigned (Employee ID, Name, Email, Employment Status, Department/BU, Designation, Location, Reporting Manager, HR/IT Assignment, Effective Transfer Date, Vacancy, Payroll reference, transfer-specific metadata) to the portal, maintained by Super Admin and/or HR; Department, Designation, Location and Vacancy only from portal master data, never free text. **(b)** No HR-system integration or synchronisation (real-time, scheduled, callback) in the current phase and no dependency on HR-system availability; any future integration needs its own approved contract, frequency, ownership, failure handling and reconciliation rules. **(c)** The workflow uses current approved portal data; an in-flight transfer uses the values stored on the Transfer Request, including HR changes made during processing; BRD-024 applies to Department/BU, Designation, Location, Reporting Manager changes when Receiving Manager approval is enabled; previous and new values audited. **(d)** HR updates under BRD-020/BRD-024 change portal / Transfer Request data only and do not update an external HR master; any external change follows the organisation's HR process outside the portal. **(e)** Employee cannot edit controlled data; assigned HR team (from Location / HR assignment) corrects within scope, coordinating with Super Admin where needed; eligibility and required data revalidated before the workflow continues. | BRD-029, BRD-020, BRD-024, Dependencies, Out of Scope (Gate 0 comment 7) |
| BRD-OQ-20 | Residual points in the Effective Transfer Date answer (Gate 0 comment 8, BRD-031): (a) which specific roles may modify the date and at which workflow stages; (b) which time zone defines the "current date" and whether the 30-day limit is inclusive and fixed or configurable; (c) when Super Admin configures re-approval on a date change, which approver(s) must re-approve and whether it is per organisation/team or global; (d) which role must update an expired date and from which status (for example HR Processing or Pending IT Final Approval) before completion. | Resolved | **(a)** Employee selects/modifies the date only in Draft and not after submission; HR may modify during approval; Super Admin for administrative intervention. **(b)** Application/server-configured business time zone; current date to +30 calendar days inclusive; limit fixed for the current phase, not user-configurable. **(c)** No re-approval by default; if enabled in Super Admin workflow configuration, returns to the configured approval stage/approver. **(d)** An expired date blocks completion; HR updates it in an HR-controlled stage, Super Admin beyond those stages; the new date must satisfy the same rule. | BRD-031 (Gate 0 comment 8) |

---

## Acceptance Criteria

- Super Admin can access a modern role-aware Admin Panel and manage the
  agreed master data and user modules.
- Super Admin can create Employee, Reporting Manager, HR and IT user
  accounts within authorised scope.
- Account creation generates a unique User ID and strong temporary password
  according to the agreed policy.
- The user must change the temporary password on first successful login;
  plaintext passwords are never stored in PostgreSQL, application logs,
  reports or audit logs.
- An account is locked for 30 minutes after 5 consecutive failed logins and
  cannot authenticate or call protected APIs until the lock expires or a
  Super Admin unlocks it.
- A session expires after 30 minutes of inactivity; a password reset or
  account deactivation invalidates all of that user's active sessions.
- Passwords meet the complexity rule (8+ characters, upper, lower, number,
  special character); tokens and credentials are never written to
  application or audit logs. MFA/SSO are out of scope for this phase.
- Every protected API validates Authenticated User → Role → Organisation
  Scope → Resource → Action (BRD-026). Unauthenticated requests receive 401;
  authenticated requests outside the user's role, scope, resource access or
  permitted action at the current workflow stage receive 403 without exposing
  restricted data, including when the API is called directly (e.g. Postman)
  rather than through the UI.
- Every status change follows the BRD-027 transition matrix. Invalid or
  unauthorised transitions are rejected by the backend, including when the API
  is called directly; a transfer cannot reach Completed without IT Final
  Approval, and IT Final Approval is refused while a mandatory Payroll activity
  is incomplete. An invalid transition by an authenticated user returns 403
  `INVALID_WORKFLOW_TRANSITION`, leaves the status unchanged, triggers no
  downstream effect and is audited as a security event. HR Processing always
  precedes Payroll Processing; only an authorised HR user can mark Payroll
  completed (recording status, completed by, date/time, reference, remarks); no
  separate HR Confirmation status exists (BRD-OQ-14).
- Rejection requires a reason, releases any vacancy reservation and notifies
  the employee; clarification returns the request to the requesting stage with
  history and reservation retained; withdrawal (until HR approval, reason
  mandatory, final and not reopenable) releases any exceptional reservation and
  cancels pending downstream tasks.
- Super Admin can reset credentials and activate/deactivate accounts
  according to permissions.
- Super Admin can configure locations, departments, designations and
  vacancies with capacity.
- An eligible employee can view permitted vacancies, submit a valid transfer
  request and receive a unique reference number.
- Eligibility (BRD-029): an Active employee with valid organisation data and no
  other active transfer can submit against an Available vacancy; no minimum
  tenure is applied. An inactive, terminated, separated or resigned employee, an
  employee with an active or approved-but-not-Completed transfer, an employee
  missing mandatory organisation data, or a request against a Full, On Hold or
  Closed vacancy is not submitted, receives a validation message and reserves no
  capacity. A new request is accepted once the earlier one is Completed,
  Rejected, Withdrawn or Cancelled. HR revalidates eligibility at HR Review
  before reservation.
- Employee data (BRD-029): the portal is the operational source in the current
  phase, with field ownership assigned to Super Admin / HR; Department,
  Designation, Location and Vacancy are selected from portal master data, not
  entered as free text. No HR-system synchronisation is performed and HR updates
  do not change an external HR system. In-flight transfers use the values stored
  on the Transfer Request; changes to Department/BU, Designation, Location or
  Reporting Manager keep previous and new values in the audit history and
  trigger BRD-024 when Receiving Manager approval is enabled. Where any
  mandatory data is missing, submission is blocked, no capacity is reserved, and
  the employee sees a clear message directing them to the assigned HR team
  (from Location / HR assignment); the employee cannot edit controlled data; HR
  (with Super Admin where needed) corrects it and eligibility is revalidated
  before the workflow continues. The portal never invents or substitutes
  missing data.
- HR-ineligible outcome (BRD-029): when HR determines the employee is not
  eligible, HR rejects the request with a mandatory reason (Pending HR Review →
  Rejected); the employee is notified and sees the reason as policy permits, any
  reservation is released, no Payroll or IT processing starts, the rejection is
  audited and the request is final. Correctable missing/incorrect information is
  sent back via Request Clarification (Pending HR Review → Info Required →
  Pending HR Review) rather than Reject.
- One-active-request rule (BRD-030): an employee with a request in any active
  status (Pending Reporting/Receiving Manager Approval, Pending HR Review, Info
  Required, HR Processing, Pending Receiving Manager Re-Approval, Payroll
  Processing, Pending IT Action, Pending IT Final Approval, Blocked / On Hold)
  cannot submit another request, including one for the same vacancy; the backend
  refuses it with "You already have an active internal transfer request. Please
  wait until the existing request is completed or closed before submitting a new
  request." (HTTP 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`; an unsubmitted Draft is
  not active; backend and database enforcement are both mandatory.)
  Simultaneous submissions cannot create two active requests. After
  Completed, Rejected, Withdrawn or Cancelled a new request is accepted, gets a
  new Transfer Request ID, revalidates eligibility and vacancy availability,
  starts the approval workflow from the beginning, reuses no earlier approvals
  and leaves the earlier request unchanged as history.
- Effective Transfer Date (BRD-031): the current date (business time zone) and
  any date up to 30 calendar days ahead, inclusive, are accepted; a past date
  and a date beyond the 30-day limit are rejected by the backend with a
  validation message and the stored date is unchanged. Only the Employee (in
  Draft), HR (during approval) and Super Admin (administrative intervention) can
  change the date; an Employee cannot change it after submission. Weekend and
  holiday dates are accepted. A request whose date has expired cannot be
  completed until HR (HR-controlled stage) or Super Admin (later stages)
  updates it to a valid date. A date change is audited and does not trigger
  re-approval unless Super Admin has enabled it, in which case the request
  returns to the configured stage/approver.
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
- Available capacity is calculated as Total Capacity − Active Reserved/Allocated
  Capacity; reserved plus filled positions never exceed total capacity and
  capacity never becomes negative. When one position remains and two HR users
  approve different requests at once, one succeeds and the other receives a
  capacity-unavailable response (BRD-028).
- Resuming a Blocked request revalidates the vacancy and reservation (failure keeps it Blocked); a Full/On Hold/Closed status change never auto-releases a reservation, a Closed vacancy blocks resume, only HR (in scope) and Super Admin may release a reservation manually with a mandatory reason, and Available means Open with capacity > 0 (BRD-OQ-15).
- Rejected, withdrawn and cancelled requests release their reservation
  (audited); a Blocked request retains it; a Completed transfer converts it to
  a final allocation. A Full, On Hold or Closed vacancy accepts no new
  reservation, and existing reservations are not removed by a status change
  alone.
- When HR changes the selected vacancy, the new vacancy is validated and the old
  reservation is released and the new one made in a single transaction; if the
  new reservation fails, the original is unchanged and the change is refused.
- Block/Resume/Cancel/Reassign (BRD-027): only Super Admin, HR (in scope, during
  Pending HR Review / HR Processing / Payroll Processing) and IT (in scope, during
  Pending IT Action / Pending IT Final Approval) may Block, and Reporting Manager,
  Receiving Manager and Employee are refused; HR cannot Resume an IT-blocked
  request nor IT an HR-blocked one, HR cannot Cancel outside its three stages (a Blocked request only if it was blocked in one of them, never an IT-blocked request; Super Admin may cancel a Blocked request at any stage),
  and none of the four actions applies to a Draft; a blocked request stores its previous status, allows no normal
  processing, keeps its reservation and resumes to the stored status only after
  revalidation. Cancel by Super Admin or in-scope HR (HR stages only) requires a reason, moves
  the request to a final Cancelled status, releases the reservation, cancels
  pending Payroll/IT tasks, and is refused for Completed, Rejected, Withdrawn or
  already Cancelled requests. Reassign requires a reason and a new assignee with
  the required role and scope, leaves the status unchanged, removes the old
  assignee's action permission and never bypasses a mandatory approval. Each
  action is audited with actor, reason/remarks, date/time and status.
- UAT scenarios cover account creation/login, credential reset, approval,
  rejection, clarification, capacity constraints, organisation-metadata
  change re-approval, reassignment, document handling, IT "No Action
  Required" completion, integration failure and final completion.

---

## Governance & Gate 0 Approval Record

Governance flow: BRD Preparation → **Gate 0: BRD Review (Project Manager /
Business Analyst)** → Gate 1 (Spec Peer Review) → Gate 2 (Code Review) →
Development / Implementation.

- The BRD cannot proceed to Gate 1 until Gate 0 is approved.
- If changes are requested, the BRD is updated and resubmitted for Gate 0.
- Gate 0 reviewers hold no Gate 1 or Gate 2 authority unless separately assigned in
  `.ai-context/project_context.md`.
- Full review detail is stored in `.ai-context/pr_reviews/BRD-<timestamp>.md`.

| Gate | Reviewer Role | Reviewer | Review Date | Status | Comments |
|---|---|---|---|---|---|
| Gate 0 — BRD Review | Project Manager / Business Analyst | Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) | 2026-09-30 14:46:48 | Changes Requested | 22 comments: authentication/session, API-level authorisation, workflow state model, vacancy reservation/release, eligibility, multiple active requests, source of truth, effective date, BRD-024 retained, payroll completion gating IT Final Approval, IT Final Approval retained, integration contracts, document security, editing, withdrawal, rejection/resubmission, clarification, reassignment, notifications, audit logging, minimum performance targets, mandatory negative UAT scenarios. Full detail: `.ai-context/pr_reviews/BRD-20260930-144648.md`. BRD and assumptions.md must be updated and re-submitted for Gate 0. Author progress 2026-09-30: comments 1–6 and 15 addressed (BRD-025 – BRD-030; withdrawal rules in BRD-027 / BRD-OQ-12); Block/Resume/Cancel/Reassign rules added to BRD-027 (BRD-OQ-13 resolved, comment 18 partly covered), the HR/Payroll routing answer (BRD-OQ-14 resolved, comments 3 and 10 partly covered) and the vacancy edge cases (BRD-OQ-15 resolved, comment 4) and the eligibility gaps (BRD-OQ-16 resolved — HR system as source of truth, missing-data block, HR reject vs clarification; comment 7 partly covered) and the employee-data source of truth (BRD-OQ-19 resolved — portal is the operational source, per-field ownership, no HR-system synchronisation, comment 7 addressed); and the Block/Resume/Cancel/Reassign residual points (BRD-OQ-18 resolved — HR/IT controlled stages, HR Cancel limited to three HR stages, Draft excluded, cross-role Resume rules; comment 18 partly covered); comments 14 and 16–22 outstanding (16–17 partially covered by BRD-027; 16 partially covered by BRD-030). |
