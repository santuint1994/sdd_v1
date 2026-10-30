# SPEC-003 — Administration Portal, Master Data & Organisation Structure

## Feature ID
admin-portal-master-data

## Status
Changes Requested at Gate 1 (2026-10-07) — reviewer Shamik Bhattacharya; see `.ai-context/pr_reviews/SPEC-003-admin-portal-master-data-20261007-151037.md`. Spec must be updated and re-submitted for Gate 1; plan, tasks, tests and code remain blocked

## Gate Approvals & History

| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 1 (Spec Peer Review) | Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) | 2026-10-07 | Changes Requested | `.ai-context/pr_reviews/SPEC-003-admin-portal-master-data-20261007-151037.md` |
| Gate 2 (Code Review) | — | — | Not started | — |

## Intent & Business Goals

Give Super Admin a modern, accessible, role-aware Admin Panel and the authoritative master data and organisation structure on which every later transfer rule depends. This SPEC delivers:

1. The Admin Panel foundation: authenticated shell, role-aware navigation showing only permitted modules (Dashboard, Users, Locations, Departments, Designations, Vacancies, Transfers, Documents, Audit Logs), dashboard foundation shell, and the shared list/table/form/dialog/state patterns reused by every other module `[BRD-002, BRD-003]`.
2. The Location, Department/Business Unit and Designation masters (create / view / edit / activate / deactivate) managed only by Super Admin `[BRD-010]`, which are the only permitted source of Department, Designation and Location values anywhere in the portal `[BRD-029]`.
3. Referential protection when a master that is in use is deactivated.
4. The organisation relationships used for automatic workflow routing `[BRD-016]`: HR location/organisation scope, IT location scope, Reporting Manager mapping structure, Receiving Manager scope mapping `[TDD-REQUIRED]`, and Super Admin cross-organisation visibility, exposed to SPEC-002 as the `ScopeResolver` data provider.

Business outcome: HR, IT and managers see only their own scope (BRD-026), routing finds the right assigned HR/IT/manager without free-text data, and administrators can configure the organisation without developer involvement.

## User Roles & Actors

- **Super Admin** `[BRD-010]`: only role that creates/edits/activates/deactivates masters and configures organisation scope mappings; sees all organisations.
- **HR / IT / Reporting Manager / Receiving Manager** `[BRD-016]`: do not manage masters or mappings; their data scope is derived from the mappings in this SPEC. They may read active master values for selection (read-only lookups) `[DERIVED from BRD-029, BRD-020]`.
- **Employee**: sees own scope only; reads active master values for transfer forms; is shown the assigned HR team (derived from location/HR mapping) when profile data is incomplete `[BRD-029]`.
- **SPEC-002 AuthorizationService** (system actor): consumes the scope data provider.

## 1. Specification Information

| Item | Value |
|---|---|
| SPEC ID | SPEC-003 |
| Title | Administration Portal, Master Data & Organisation Structure |
| Purpose | Admin Panel foundation, master data, organisation relationships and scope data provider |
| Business objective | Authoritative master data + routing structure; consistent accessible admin UX; no free-text org values |
| Version | 0.1 (Draft) |
| Date | 2026-10-06 |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer per roster | Project Manager / Product Owner |
| Task prefix | TASK-003.MM |

## 2. Why This SPEC Exists

- BRD-029 requires Department, Designation, Location and Vacancy to come from portal master data and never free text; masters therefore must exist before user provisioning (SPEC-004), vacancies (SPEC-005) or transfers (SPEC-006) can reference them.
- BRD-016 requires organisational relationships (HR location scope, IT location scope, Reporting Manager mapping, Receiving Manager scope) for automatic routing; SPEC-002 needs a data provider to evaluate the "Organisation Scope" check of BRD-026.
- BRD-002/003 and NFR-008 require one consistent Admin Panel experience; building shared patterns once avoids divergent UIs across 004, 005, 011, 013, 014.
- The existing frontend scaffold (`frontend/src/data/navigation.ts`, `usePermission`) uses non-canonical role strings (`Super Admin`, `Manager`) and a single Dashboard entry; it is replaced by the canonical role enum and a server-driven navigation model.

## 3. BRD Traceability

### 3.1 BRD requirement coverage

| BRD ID | Coverage | Slice delivered here |
|---|---|---|
| BRD-002 | FULL (dashboard card data is supplied by SPEC-014; layout/shell here) | Responsive, role-aware navigation; dashboard cards shell; searchable/sortable/filterable tables with pagination and status badges; create/view/edit forms with inline validation and required indicators; confirmation dialogs; loading/empty/no-access/error states; accessibility |
| BRD-003 | FULL (module entry points) | Nine admin modules registered; Locations/Departments/Designations implemented here; others register their pages with the shared shell |
| BRD-010 | PARTIAL (masters slice) | Create/edit/activate/deactivate Locations; create/manage Departments and Designations; Super Admin only. Vacancies (005), users (004), reassign/intervene (010) excluded; audit view (013) |
| BRD-016 | FULL for structure; consumers in 004/007/008/009 | HR location/organisation scope, IT location scope, Reporting Manager assignments (+ HR mapping derivation), Receiving Manager scope `[TDD-REQUIRED]`, Vacancy dimensions come from masters |
| BRD-029 | PARTIAL | Field-ownership rows Department/BU, Designation, Location (Super Admin owns masters); HR Assignment / IT Assignment mapping source; Reporting Manager mapping structure; "values from masters, never free text" guard |
| BRD-001 | PARTIAL | Role enum used for navigation and mapping role validation (identity itself in SPEC-002) |
| BRD-022 / BRD-037 | PARTIAL | Master-data configuration and mapping changes emit audit events (kernel in SPEC-001, viewing in SPEC-013) |
| BRD-012 | PARTIAL | Receiving Manager scope mapping data only; enable/disable toggle belongs to SPEC-007 |
| BRD-035 | PARTIAL | Provides the "required role and organisation/location scope" check used when reassigning (`OrgScopeProvider.isEligibleAssignee`); reassignment action itself in SPEC-010 |

### 3.2 NFR, BRD-OQ

| ID | Coverage |
|---|---|
| NFR-008 | FULL (accessibility/usability of Admin Panel; standard level is `[TDD-REQUIRED]`, TDD-003.07) |
| NFR-002 | PARTIAL (scope data provider) |
| NFR-005 | PARTIAL (audit events for configuration changes) |
| NFR-007 | PARTIAL (scope-restricted data derivation) |
| BRD-OQ-04 | Receiving Manager configurable — only the scope mapping data is implemented here |
| BRD-OQ-07 | Department/BU, Designation, Location as master-sourced metadata |
| BRD-OQ-10 | Organisation hierarchy source = portal mappings (Super Admin → Location → HR → Reporting Manager → Employee, IT per location) |
| BRD-OQ-16(b), BRD-OQ-19(a)(e) | Portal is the operational source; Super Admin owns masters and mappings; employee directed to assigned HR team (from Location/HR assignment) |

### 3.3 Business rules covered

- Department, Designation, Location and Vacancy values come from portal master data and cannot be free text (BRD-029).
- Organisation hierarchy: Super Admin → Location → HR → Reporting Manager → Employee; IT location-based (Actors section, BRD-016).
- Super Admin has cross-organisation administrative visibility (Actors, BRD-001).
- Role-based and scope-based access, backend authoritative (BRD-026) — scope data supplied here.
- No HR-system synchronisation; masters are maintained only in the portal (BRD-029, Out of Scope).

### 3.4 BRD "Acceptance Criteria" bullets covered

| BRD acceptance bullet | Coverage | SPEC ACs |
|---|---|---|
| "Super Admin can access a modern role-aware Admin Panel and manage the agreed master data and user modules." | PARTIAL (admin panel + master data; users in SPEC-004) | AC01–AC09, AC20–AC24 |
| "Super Admin can configure locations, departments, designations and vacancies with capacity." | PARTIAL (locations, departments, designations) | AC10–AC19 |
| "Each user can see assigned employees, requests and tasks according to role and organisation mapping." | PARTIAL (mapping + scope provider) | AC25–AC32 |
| "Every material configuration, security and workflow action creates the agreed audit record." | PARTIAL (configuration actions of this SPEC) | AC33 |

### 3.5 Negative scenarios (BRD-039)

| BRD-039 row | Coverage | NAC |
|---|---|---|
| Security: user cannot access another organisation's data outside their assigned scope | PARTIAL (scope provider correctness; enforcement SPEC-002/016) | NAC06–NAC09 |
| Security: direct API access cannot bypass role/scope/resource/action authorization | PARTIAL (master and mapping endpoints) | NAC01–NAC03 |

## 4. Dependencies

| Depends on | What is needed |
|---|---|
| SPEC-001 | Project scaffold, config loader, logger, `withTransaction`, error classes, response envelope, validation middleware, migration conventions, `AuditService.record`, base UI kit/layout (this SPEC extends the UI kit; it does not duplicate tokens/theme) |
| SPEC-002 | `users` table (`id`, `user_id`, `role`, `status`), authenticated request context (`ctx.user`), `AuthorizationService`, `ScopeResolver` interface (implemented by the provider in this SPEC), frontend auth context/`/auth/me` |
| SPEC-004 (soft, for runtime data) | Employee org profile reader port `EmployeeOrgReader` (employee location/department/designation) and role-user lookups; this SPEC defines the port, 004 implements it. Mapping admin APIs are usable without 004 by Super Admin with seeded users |
| SPEC-014 | Dashboard summary data feeding the dashboard card shell (cards render "Not available" until then) |

## 5. Enables

| Spec | Uses |
|---|---|
| SPEC-002 | `OrgScopeProvider` for BRD-026 step 3 (organisation scope) |
| SPEC-004 | Lookups, `MasterReferenceGuard`, `OrgRelationshipService` (Reporting Manager/HR/IT assignment validation), shared list/form patterns |
| SPEC-005 | Master FK validation for vacancy Department/Designation/Location; dependency checker registration |
| SPEC-006, 008 | Master selection (proposed and HR-changed org values), `my-hr-team`, Receiving Manager scope resolution for routing |
| SPEC-007, 009, 010 | Assignee eligibility (`isEligibleAssignee`), HR/IT/manager candidate lookup for task assignment and reassignment |
| SPEC-011, 013, 014 | Navigation registration, shared table/filter/state patterns, scope descriptors for scoped lists and reports |
| SPEC-015, 016 | Source-of-truth enforcement checks, traceability |

## 6. Roles & Scope

### 6.1 Permission matrix (this SPEC's resources)

| Resource / action | SUPER_ADMIN | HR | IT | REPORTING_MANAGER | RECEIVING_MANAGER | EMPLOYEE |
|---|---|---|---|---|---|---|
| Masters: list/view/create/edit/activate/deactivate (admin APIs) `[BRD-010]` | Yes | No | No | No | No | No |
| Lookups (active id/code/name only) `[DERIVED BRD-029/020]` | Yes | Yes | Yes | Yes | Yes | Yes |
| Lookups with `status=ALL` | Yes | No | No | No | No | No |
| Scope mappings: create/revoke (HR, IT, Receiving) `[BRD-016, BRD-029]` | Yes | No | No | No | No | No |
| Reporting relationship assign/change `[BRD-029]` | Yes | No (transfer-time change via SPEC-008) | No | No | No | No |
| Read any user's resolved scope | Yes | No | No | No | No | No |
| Read own resolved scope (`/org/my-scope`) | Yes | Yes | Yes | Yes | Yes | Yes |
| Read assigned HR team (`/org/my-hr-team`) | n/a | n/a | n/a | n/a | n/a | Yes |
| Navigation (`/admin/navigation`) | Yes | Yes | Yes | Yes | Yes | Yes |

Scope: master and mapping administration is organisation-wide and Super Admin only; no per-organisation delegation exists in the BRD `[BRD-010]`.

### 6.2 Navigation module visibility (server-computed, per BRD-002 "only permitted modules")

| Module (BRD-003) | SUPER_ADMIN | HR | IT | RM | RCV | EMP | Tag |
|---|---|---|---|---|---|---|---|
| Dashboard | Y | Y | Y | Y | Y | Y | `[BRD-002]` role-based dashboards (card content SPEC-014) |
| Users | Y | scoped read `[TDD-REQUIRED]` | N | N | N | N | Super Admin `[BRD-010]`; HR "assigned employees" `[BRD-013]`; scope read decision TDD-003.06 |
| Locations / Departments / Designations | Y | N | N | N | N | N | `[BRD-010]`; others use lookups only |
| Vacancies | Y | Y (scope) | N | N | N | Y (browse; visibility rules TDD in SPEC-005) | `[BRD-010, 013, 011]` |
| Transfers | Y | Y | Y (assigned tasks) | Y | Y | Y (own) | `[BRD-010–014]` |
| Documents | Y | Y | Y (scoped) | N | N | N | `[BRD-021]`; employee/manager document access decided in SPEC-011 |
| Audit Logs | Y | Y (scoped) | Y (scoped) | Y (scoped) | Y (scoped) | Y (scoped) `[TDD-REQUIRED]` | `[BRD-037]` "other users view only within role and scope"; per-role exposure decided in SPEC-013 |

The registry carries the module list; each owning spec registers its permission requirement. A module appears only if the caller holds the registered `{resource, action: VIEW}` permission per SPEC-002 `[PROPOSED]`.

## 7. Functional Requirements

### 7.1 Admin Panel shell and navigation

| ID | Requirement | Tag |
|---|---|---|
| FR-003.01 | Authenticated pages render inside a single `AppShell` (header, sidebar, main landmark, breadcrumbs, user menu with logout) via `app/(protected)/layout.tsx`. Unauthenticated users are redirected to login by the auth layer (SPEC-002). | `[BRD-002]` |
| FR-003.02 | Sidebar lists only modules the caller may access. The module list is returned by `GET /api/v1/admin/navigation` computed from the server-side permission registry; the frontend never decides permission by itself (UX only). | `[BRD-002, BRD-026]` |
| FR-003.03 | Navigation covers exactly the nine modules: Dashboard, Users, Locations, Departments, Designations, Vacancies, Transfers, Documents, Audit Logs, in that order. No other top-level module is added by this SPEC. | `[BRD-003]` |
| FR-003.04 | Direct navigation to a URL for a module the caller cannot access renders the NoAccess state (HTTP 403 from API) and exposes no restricted data or record existence. | `[BRD-002, BRD-026]` |
| FR-003.05 | The existing static `sidebarNavigation` and string role comparison in `frontend/src/data/navigation.ts`, `utils/permissions.ts`, `hooks/usePermission.ts` are replaced by the canonical enum `SUPER_ADMIN, EMPLOYEE, REPORTING_MANAGER, RECEIVING_MANAGER, HR, IT` and server-driven navigation. | `[DERIVED]` BRD-001 roles |
| FR-003.06 | Responsive layout: desktop (>=1024px) fixed sidebar; tablet (768–1023px) collapsible sidebar drawer; table horizontal scroll inside a bounded container rather than page scroll. Mobile phone layout is not mandated. | `[BRD-002]` desktop/tablet; breakpoints `[PROPOSED]` |

### 7.2 Dashboard foundation shell

| ID | Requirement | Tag |
|---|---|---|
| FR-003.07 | Dashboard page renders a card grid using a `DashboardCard` component and a card registry with ids `total_employees`, `active_transfers`, `pending_approvals`, `hr_reviews`, `blocked_tasks`, `open_vacancies`. | `[BRD-002]` |
| FR-003.08 | Card values, role visibility and scoping are supplied by SPEC-014 (`GET /api/v1/dashboard/summary`, `[PROPOSED]` owner SPEC-014). Until it exists the shell renders each card in the "Not available" state; it never fabricates numbers. | `[DERIVED]` BRD-002/023 |
| FR-003.09 | Each card supports loading (skeleton), value, error (retry button) and no-access (card hidden) states; a card failure does not break the page. | `[BRD-002]` |
| FR-003.10 | Card click-through target is registered per card (e.g. `open_vacancies` → `/vacancies?status=OPEN`) and honours the destination module's permissions. | `[PROPOSED]` |

### 7.3 Shared list/table pattern (reused by every module)

| ID | Requirement | Tag |
|---|---|---|
| FR-003.11 | `DataTable` provides server-side pagination (`page`, `pageSize` default 20, max 100), sorting by whitelisted columns (`sort`, `order`), free-text search (`q`) and column filters; state is mirrored in the URL query string so views are linkable and survive refresh. | `[BRD-002]`, defaults `[PROPOSED]` |
| FR-003.12 | Search input is debounced (existing `useDebounce`) and cancels in-flight requests so stale responses never overwrite newer ones. | `[PROPOSED]` |
| FR-003.13 | Status values are shown with `StatusBadge` (text + icon + colour, never colour alone). Defined variants: `ACTIVE`, `INACTIVE` (this SPEC); other specs add their statuses to the badge map. | `[BRD-002, NFR-008]` |
| FR-003.14 | The table shows loading skeleton, empty ("no records yet" with call-to-action for authorised users), filtered-empty ("no results match", with clear-filters), error (message + retry + request id) and no-access states. | `[BRD-002]` |
| FR-003.15 | Result count and sort/filter changes are announced via an `aria-live="polite"` region. | `[NFR-008]` |

### 7.4 Shared form and dialog pattern

| ID | Requirement | Tag |
|---|---|---|
| FR-003.16 | Create/view/edit pages use one `FormLayout`: view mode is read-only with an Edit button (authorised only); create and edit use identical fields. | `[BRD-002]` |
| FR-003.17 | Required fields show a visible required indicator (asterisk plus text "required" for assistive tech, `aria-required="true"`); optional fields are unmarked. | `[BRD-002, NFR-008]` |
| FR-003.18 | Inline validation: field-level messages on blur and on submit using the same rules as the backend (shared schema); server `VALIDATION_ERROR.details[]` are mapped back to fields; an error summary with links to fields is shown on submit failure. Frontend validation is UX only; the backend validates all input. | `[BRD-002, BRD-026]` |
| FR-003.19 | `ConfirmDialog` is mandatory for sensitive actions: deactivation, reassignment, credential reset (consumed by 004/010), and scope mapping revoke/replace and Reporting Manager change (this SPEC). It states the object, the consequence and, where relevant, impact counts; supports an optional or mandatory reason field; focus is trapped, Esc cancels, focus returns to the trigger. | `[BRD-002]` |
| FR-003.20 | Submit buttons are disabled while a request is in flight (double-submit prevention); optimistic-lock conflicts show a "record changed — reload" message. | `[PROPOSED]` |

### 7.5 Master data (Location, Department/Business Unit, Designation)

| ID | Requirement | Tag |
|---|---|---|
| FR-003.21 | Super Admin can create, view, edit, activate and deactivate Locations. | `[BRD-010]` |
| FR-003.22 | Super Admin can create and manage Departments (Department/Business Unit) and Designations, including activate/deactivate. | `[BRD-010]`; activate/deactivate for these two is `[DERIVED]` from BRD-029 master data and BRD-002 deactivation |
| FR-003.23 | Each master has: `code` (unique, case-insensitive, immutable after creation), `name` (unique, case-insensitive), optional `description`, `status` (ACTIVE/INACTIVE). Department adds `unit_type` (`DEPARTMENT`/`BUSINESS_UNIT`). Field sets are not defined by the BRD. | `[PROPOSED]`, TDD-003.02, TDD-003.05 |
| FR-003.24 | There is no hard delete of masters through the API or UI. | `[DERIVED]` BRD-010 lists create/edit/activate/deactivate only |
| FR-003.25 | Master lists are searchable (code, name), filterable by status, sortable by code/name/created date/status, paginated. | `[BRD-002]` |
| FR-003.26 | Only ACTIVE masters may be selected for new records (users/profiles, vacancies, transfer requests, HR org changes). Inactive masters remain displayed on existing records. | `[DERIVED]` BRD-029 + deactivation semantics; behaviour for existing data TDD-003.03 |
| FR-003.27 | Master values are consumed through lookups only; no endpoint in the system accepts a free-text department, designation or location name in place of a master id. Enforced via `MasterReferenceGuard` (FR-003.31). | `[BRD-029]` |
| FR-003.28 | Every create/edit/activate/deactivate is audited with previous and new values (§18). | `[BRD-022, BRD-037]` |

### 7.6 Master-data dependency and referential protection

| ID | Requirement | Tag |
|---|---|---|
| FR-003.29 | A master referenced by other data cannot be deleted (no delete exists) and its deactivation is subject to dependency checks defined by the Master-Data Dependency Matrix (§10.5). | `[PROPOSED]` per TDD-003.03 (BRD silent on deactivating a master in use) |
| FR-003.30 | Default behaviour (recommended, TDD-003.03): deactivation is refused with `409 MASTER_IN_USE` when blocking dependents exist (active user profiles, non-closed vacancies, active transfer requests per BRD-030 active status list); response lists dependent entity counts (never record content). Dependents that are "warn" class (scope mappings) appear in the confirmation dialog and are not blocking. | `[PROPOSED]` / `[TDD-REQUIRED]` |
| FR-003.31 | `MasterReferenceGuard.assertActive({locationId?, departmentId?, designationId?}, {trx})` is the single backend check used by 004/005/006/008 on every write that references a master; it takes a shared row lock on the master (`FOR SHARE`) so a concurrent deactivation cannot race past a dependent insert. Missing id → `422 MASTER_NOT_FOUND`; inactive → `422 MASTER_INACTIVE`. | `[PROPOSED]` implements `[BRD-029]` |
| FR-003.32 | `MasterDependencyRegistry` lets each owning spec register a `DependencyChecker` (entity name, master type, blocking flag, `count(masterId, {trx})`). SPEC-003 ships built-in checkers for its own mapping tables; checkers for `employee_profiles`, `vacancies`, `transfer_requests`, `transfer_org_changes` are registered by SPEC-004/005/006/008. Missing registrations are detected at start-up and the matrix test fails (AC/test TC-003.52). | `[PROPOSED]` |
| FR-003.33 | Reactivation of an INACTIVE master is allowed at any time by Super Admin and requires confirmation. | `[BRD-010]` activate; confirmation `[BRD-002]` |
| FR-003.34 | Edit of `name`/`description`/`unit_type` on a master in use is allowed (code is immutable); stored dependents reference the id, so display follows the new name; audit keeps the old name. | `[PROPOSED]` |

### 7.7 Organisation relationships and scope mapping `[BRD-016]`

| ID | Requirement | Tag |
|---|---|---|
| FR-003.35 | **HR scope mapping.** Super Admin maps an HR user to one or more Locations, optionally narrowed to a Department/BU (null department = all departments at that location). The target user must have role HR and status Pending Activation or Active. | `[BRD-016]`; granularity `[PROPOSED]` TDD-003.04 |
| FR-003.36 | **IT scope mapping.** Super Admin maps an IT user to one or more Locations (location scope only). Target user must have role IT. | `[BRD-016, BRD-029]` |
| FR-003.37 | **Reporting Manager mapping structure.** Table `reporting_manager_assignments` holds exactly one ACTIVE Reporting Manager per employee; the manager must have role REPORTING_MANAGER; self-reporting and reporting cycles are refused. A change ends the previous row and creates a new one in one transaction, reason mandatory; history retained. A Reporting Manager's HR mapping is derived from the manager's own location/department via HR scope mapping (no separate store). | `[BRD-016, BRD-029]`; cycle rule `[PROPOSED]`; reason mandatory on change `[DERIVED]` BRD-002 sensitive action confirmation + BRD-022 audit |
| FR-003.38 | **Receiving Manager scope mapping `[TDD-REQUIRED]` (TDD-REQUIRED task, tests first).** Super Admin maps a Receiving Manager to the target Department/BU (required) and optional Location they are responsible for; provider resolves "Receiving Manager responsible for a transfer's target team" for routing. BRD defines the role and "target team/organisation scope" but not the mapping granularity, multiplicity or tie-break; see TDD-003.01. | `[BRD-012, BRD-016]` / `[TDD-REQUIRED]` |
| FR-003.39 | **Super Admin cross-organisation visibility.** The provider returns `ALL` scope for SUPER_ADMIN; no mapping rows are needed or consulted. | `[BRD-001]` Actors, `[BRD-010]` |
| FR-003.40 | **Assigned HR / IT candidates.** `OrgScopeProvider.findHrCandidates({locationId, departmentId})` and `findItCandidates({locationId})` return active mapped users so 004 can store/validate the assigned HR and IT on an employee profile (BRD-029 "from configured location/organisation mapping"). Selection rule when several candidates exist is `[TDD-REQUIRED]` (TDD-003.04); the SPEC provides the candidate list and a validation method, not an auto-pick. | `[BRD-029, BRD-016]` / `[TDD-REQUIRED]` |
| FR-003.41 | **Assignee eligibility.** `isEligibleAssignee({userId, role, locationId, departmentId})` returns true only when the user holds the role, is active (not Inactive/Locked as given by SPEC-002 status) and has a mapping that covers the location/department; used by SPEC-010 reassignment. | `[BRD-035]` (role + organisation/location scope) |
| FR-003.42 | **Employee-facing HR contact.** `GET /org/my-hr-team` returns the HR users mapped to the employee's location/department (name, official email only) for the BRD-029 message directing the employee to the assigned HR team. If no HR is mapped it returns an empty list and the message states HR is not yet assigned; the portal never invents contact data. | `[BRD-029]`; fields returned `[PROPOSED]` |
| FR-003.43 | Mapping rows are soft-ended (`status=ENDED`), never deleted, so audit and in-flight task history stay traceable; revoke requires confirmation and reason. | `[PROPOSED]` supports `[BRD-037]` append-only intent |
| FR-003.44 | Mapping changes do not rewrite in-flight transfer assignments; reassignment of in-flight tasks is exclusively a Super Admin action in SPEC-010. The revoke dialog shows a count of in-flight tasks (provided by 007's `transfer_task_assignments` checker once registered) as information. | `[BRD-035]` |

### 7.8 ScopeResolver data provider (for SPEC-002)

| ID | Requirement | Tag |
|---|---|---|
| FR-003.45 | `OrgScopeProvider.resolveScope(ctx)` returns a `ScopeDescriptor` for the authenticated user (see §11.3). Reads are served from PostgreSQL on every request; no long-lived cache is introduced so scope revocation is effective immediately on the next request (BRD-026 "enforced on every protected request"). A per-request memo is permitted. | `[BRD-026]`; design `[PROPOSED]` |
| FR-003.46 | `OrgScopeProvider.isInScope(ctx, {kind: 'EMPLOYEE'\|'LOCATION'\|'DEPARTMENT'\|'TRANSFER_TARGET', ...})` provides yes/no checks used by SPEC-002 `AuthorizationService.authorize`. | `[BRD-026]` |
| FR-003.47 | Scope kinds per role: SUPER_ADMIN=ALL; HR=locations(+optional departments) from mappings; IT=locations from mappings; REPORTING_MANAGER=employees from active assignments; RECEIVING_MANAGER=target department(+location) from mappings; EMPLOYEE=self. Task-level scope for HR/IT (assigned task) is layered on top by 007/009. | `[BRD-016, BRD-026]` |
| FR-003.48 | A user with an INACTIVE or LOCKED account resolves to an empty scope (defence in depth; SPEC-002 already rejects such users). | `[DERIVED]` BRD-025 |
| FR-003.49 | A user without any mapping resolves to an empty scope, which yields 403 for scoped resources — never "all". Absence of data fails closed. | `[DERIVED]` BRD-026 |

### 7.9 Accessibility and usability `[NFR-008]`

| ID | Requirement | Tag |
|---|---|---|
| FR-003.50 | All Admin Panel pages meet the accessibility standard decided in TDD-003.07 (recommended default WCAG 2.1 AA): landmarks, skip-to-content link, logical heading order, full keyboard operability, visible focus, labelled controls, accessible names for icon buttons, `aria-sort` on sortable headers, focus management in dialogs, error text linked by `aria-describedby`, colour contrast >= 4.5:1 for text, status not by colour alone, respects `prefers-reduced-motion`. | `[NFR-008]` / `[TDD-REQUIRED]` level |
| FR-003.51 | Automated accessibility checks (jest-axe / axe in component tests) run on every shared component and on each master page in CI; manual keyboard pass is part of Definition of Done. | `[PROPOSED]` |
| FR-003.52 | The BRD says "organisational portal design and accessibility standards"; no organisational design system was supplied. Tokens/theme from SPEC-001 are used; the organisation's standard, if one exists, replaces the recommended default via TDD-003.07 without changing component contracts. | `[NFR-008]` / `[TDD-REQUIRED]` |

## 8. Internal Implementation Plan / Tasks

Tasks are ordered; RED tests precede GREEN implementation (TDD) per task group. Layer: BE, FE, DB, QA.

| Task | Title | Layer | Description | Inputs → Outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-003.01 | Master tables migration | DB | Create `locations`, `departments`, `designations` with constraints and indexes (§10.1), citext/functional unique indexes, status check, version column. | SPEC-001 migration conventions → migration files, rollback | SPEC-001, users table (SPEC-002) | BRD-010, BRD-029 |
| TASK-003.02 | Master models & repositories | BE | Sequelize models + repositories (`LocationRepository`, `DepartmentRepository`, `DesignationRepository`) with list (search/filter/sort/paginate), get, create, update, set-status, optimistic version check. | Migration → models, repositories | 003.01 | BRD-010, BRD-002 |
| TASK-003.03 | Master services, DTOs, validators | BE | `MasterService` (generic by master type) with create/edit/activate/deactivate; DTO + Joi/celebrate schemas (§14); audit emission through `AuditService.record` in the same transaction. RED tests first. | Repositories → services, validators | 003.02, SPEC-001 audit kernel | BRD-010, BRD-022 |
| TASK-003.04 | Master controllers & routes | BE | Routes `/api/v1/locations`, `/departments`, `/designations` (+ activate/deactivate), authz middleware `SUPER_ADMIN` only via SPEC-002; response envelope; Swagger docs. | Services → HTTP API | 003.03, SPEC-002 authz | BRD-010, BRD-026 |
| TASK-003.05 | Dependency registry & reference guard | BE | `MasterDependencyRegistry`, `MasterReferenceGuard.assertActive` (FOR SHARE), boot-time completeness check for registered checkers, built-in checkers for 003 tables. | — → library module exported to 004/005/006/008 | 003.02 | BRD-029 |
| TASK-003.06 | Deactivation protection | BE | Implement `deactivate` flow: lock master row `FOR UPDATE`, run blocking + warn checkers, refuse with `MASTER_IN_USE` + counts, else set INACTIVE, audit; `GET /:id/dependencies` preview endpoint. Behaviour finalised by TDD-003.03 (default coded behind a policy constant). | Registry → protection logic | 003.05 | BRD-010, BRD-029 |
| TASK-003.07 | Lookups API | BE | `GET /api/v1/lookups/{locations,departments,designations}` for all authenticated roles; `status=ALL` Super Admin only; minimal projection. | Repositories → lookup endpoints | 003.02 | BRD-029 |
| TASK-003.08 | Org scope tables migration | DB | `hr_scope_mappings`, `it_location_scopes`, `receiving_manager_scopes`, `reporting_manager_assignments` with partial unique indexes and checks (§10.2–10.4). | 003.01 → migrations | 003.01 | BRD-016 |
| TASK-003.09 | Org models/repositories | BE | Models and repositories for the four mapping tables including "active rows by user/location/department" queries. | 003.08 → repos | 003.08 | BRD-016 |
| TASK-003.10 | HR & IT scope services/APIs (TDD) | BE | `HrScopeService`, `ItScopeService`: create/revoke with role/status/master validation, duplicate prevention, audit. Routes `/org/hr-scopes`, `/org/it-scopes`. RED tests first. | repos → services/routes | 003.09, 003.05 | BRD-016, BRD-029 |
| TASK-003.11 | Receiving Manager scope mapping (TDD-REQUIRED) | BE | Write test suite first against the recommended default model (dept required, location optional, many-to-many, most-specific-wins resolution); implement `ReceivingScopeService` and routes `/org/receiving-manager-scopes`; keep granularity behind `ReceivingScopeResolver` strategy so TDD-003.01 outcome is a swap not a rewrite. | repos → service/routes/resolver | 003.09 | BRD-012, BRD-016 |
| TASK-003.12 | Reporting relationship service/API | BE | `ReportingRelationshipService`: assign/change (transactional end+insert), role/status validation, self/cycle checks, history; routes `/org/reporting-relationships`; exposes `OrgRelationshipService` used in-process by 004 with `{trx}`. | repos → service/routes | 003.09 | BRD-016, BRD-029 |
| TASK-003.13 | OrgScopeProvider | BE | Implement `OrgScopeProvider` (`resolveScope`, `isInScope`, `findHrCandidates`, `findItCandidates`, `isEligibleAssignee`, `resolveReceivingManagers`) and the `EmployeeOrgReader` port with an in-memory test double; wire to SPEC-002 `ScopeResolver` interface. | services + port → provider | 003.10–003.12 | BRD-016, BRD-026 |
| TASK-003.14 | Own scope, scope inspector, my-hr-team APIs | BE | `GET /org/my-scope`, `GET /org/scope/:userId` (SA), `GET /org/my-hr-team` (EMPLOYEE). | provider → endpoints | 003.13 | BRD-001, BRD-029 |
| TASK-003.15 | Navigation registry & API | BE | `NavigationRegistry` (module id, label, route, required `{resource, VIEW}`), `GET /api/v1/admin/navigation` computed with SPEC-002 permissions; modules from other specs register at start-up. | SPEC-002 authz → API | SPEC-002 | BRD-002, BRD-003 |
| TASK-003.16 | Audit events wiring | BE | Define event codes of §18 as typed constants; ensure each service emits in the same transaction; secrets-free payload builders. | AuditService → events | 003.03, 003.10–003.12 | BRD-022, BRD-037 |
| TASK-003.17 | Frontend shell & navigation | FE | `AppShell`, `Sidebar` (server-driven items), `Header`, `Breadcrumbs`, skip link, responsive drawer, replace legacy role strings with canonical enum, `useNavigation`, `usePermission` update. | `/admin/navigation` → shell | 003.15, SPEC-001 FE kit | BRD-002, BRD-003, NFR-008 |
| TASK-003.18 | Shared state components | FE | `LoadingState`, `EmptyState`, `ErrorState`, `NoAccessState`, `Skeleton`, route-level `error.tsx`/`loading.tsx`/`forbidden`. | — → components | 003.17 | BRD-002, NFR-008 |
| TASK-003.19 | DataTable & query hook | FE | `DataTable`, `TableToolbar`, `FilterBar`, `SearchInput`, `Pagination`, `SortHeader`, `StatusBadge`, `useTableQuery` (URL-synced, abort stale). | — → components/hook | 003.18 | BRD-002, NFR-008 |
| TASK-003.20 | Form kit & ConfirmDialog | FE | `FormLayout`, `FormField` with required indicator, `FormErrorSummary`, `MasterSelect` (async lookup combobox, active only), `ConfirmDialog` (focus trap, reason field), toast region; shared validation schemas in `validations/`. | — → components | 003.18 | BRD-002, NFR-008 |
| TASK-003.21 | Dashboard shell | FE | Dashboard page, `DashboardCard`, card registry, state handling, click-through; "Not available" until SPEC-014. | 003.18 → page | 003.17 | BRD-002 |
| TASK-003.22 | Master pages | FE | Locations/Departments/Designations list, create, view, edit pages sharing one generic `MasterListPage`/`MasterForm`; activate/deactivate with dependency preview in `ConfirmDialog`. | services + kit → pages | 003.19, 003.20, 003.04, 003.06 | BRD-010, BRD-002 |
| TASK-003.23 | Organisation mapping pages | FE | `/organisation/hr-scopes`, `/it-scopes`, `/receiving-scopes`, `/reporting-relationships` list + assign + revoke/change flows with confirmations; read-only scope inspector. | services → pages | 003.19, 003.20, 003.10–003.12, 003.14 | BRD-016 |
| TASK-003.24 | Frontend services & types | FE | `master.service.ts`, `org.service.ts`, `navigation.service.ts`, TS types mirroring DTOs, 401/403 handling via `http-client`. | — → services | 003.17 | BRD-002 |
| TASK-003.25 | Backend unit tests | QA | Unit tests for services, guard, registry, provider (§23.1). | — → suites | RED before each 003.03–003.14 | all |
| TASK-003.26 | Backend integration/API/security tests | QA | DB-backed tests for constraints, partial unique indexes, authz matrix, error contracts, scope behaviour (§23.2–23.3, 23.5). | — → suites | 003.04, 003.14 | BRD-026, BRD-039 slice |
| TASK-003.27 | Concurrency tests | QA | Parallel deactivate vs dependent insert, parallel duplicate create, parallel mapping create, version conflict (§23.6). | — → suites | 003.06, 003.10 | BRD-028 spirit n/a; NFR integrity |
| TASK-003.28 | Frontend & accessibility tests | QA | Component tests, page tests with mocked API, axe checks, keyboard-flow tests (§23.4). | — → suites | 003.17–003.23 | NFR-008, BRD-002 |
| TASK-003.29 | Dependency-matrix conformance test | QA | Test that every entity in §10.5 has a registered checker (`TC-003.52`) once SPEC-004/005/006/008 are present; until then it asserts registry API and placeholder warnings. | — → suite | 003.05 | BRD-029 |
| TASK-003.30 | OpenAPI docs & dev fixtures | BE | Swagger definitions for §12; non-business dev fixtures only for tests (no production seed of business master values — the BRD supplies none). | — → docs | 003.04–003.14 | — |

## 9. Business Rules

| # | Rule | Tag |
|---|---|---|
| BR-003.01 | Only Super Admin may create, edit, activate or deactivate Locations, Departments/Business Units and Designations and configure scope mappings. | `[BRD-010]` |
| BR-003.02 | Department, Designation and Location values used anywhere (profiles, vacancies, transfer proposals, HR changes) must reference an ACTIVE master id; free text is rejected. | `[BRD-029]` |
| BR-003.03 | Master `code` is unique (case-insensitive) and immutable; `name` is unique (case-insensitive) within its master type. | `[PROPOSED]` TDD-003.05 |
| BR-003.04 | No hard delete of masters or mapping rows; lifecycle is ACTIVE/INACTIVE (masters) and ACTIVE/ENDED (mappings). | `[DERIVED]` BRD-010, BRD-037 |
| BR-003.05 | Deactivating a master with blocking dependents is refused (default); warn-class dependents require explicit confirmation. | `[PROPOSED]` / `[TDD-REQUIRED]` TDD-003.03 |
| BR-003.06 | Existing records keep their reference to a master that is later deactivated; display shows an "Inactive" badge. | `[PROPOSED]` |
| BR-003.07 | HR mapping requires an HR-role user; IT mapping an IT-role user; Reporting Manager assignment a REPORTING_MANAGER-role user; Receiving Manager mapping a RECEIVING_MANAGER-role user. | `[DERIVED]` BRD-001 roles, BRD-035 role requirement |
| BR-003.08 | An employee has at most one ACTIVE Reporting Manager; an employee cannot report to themself; reporting cycles are refused. | `[BRD-016]` (assigned Reporting Manager) / cycle `[PROPOSED]` |
| BR-003.09 | A user may have several HR/IT/Receiving mappings (many locations/departments); the same mapping may not be duplicated while ACTIVE. | `[PROPOSED]` |
| BR-003.10 | Super Admin scope is all organisations and requires no mapping. | `[BRD-001]` |
| BR-003.11 | Absence of mapping means no scope (fail closed). | `[DERIVED]` BRD-026 |
| BR-003.12 | Scope is evaluated live from the database; revoking a mapping takes effect on the next request. | `[DERIVED]` BRD-026/BRD-025 per-request enforcement; implementation `[PROPOSED]` |
| BR-003.13 | Mapping changes never alter completed approvals or in-flight workflow state; reassignment is Super Admin-only in SPEC-010. | `[BRD-035]` |
| BR-003.14 | Master and mapping changes use the shared confirmation dialog; deactivation, revoke and manager change require explicit confirmation. | `[BRD-002]` |
| BR-003.15 | No eligibility, tenure or other HR policy is encoded by masters or mappings. | `[BRD-029]` rule 8 |
| BR-003.16 | Master data is maintained only in the portal; no import from, or sync to, an HR system. | `[BRD-029]`, Out of Scope |

## 10. Data Model & Database

All tables follow SPEC-001 conventions (`uuid` PK `gen_random_uuid()`, `created_at`/`updated_at` `timestamptz`, snake_case). All names/types `[PROPOSED]`. `users` is the SPEC-002 table.

### 10.1 Master tables

`locations`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| code | varchar(30) | NOT NULL |
| name | varchar(150) | NOT NULL |
| description | varchar(500) | NULL |
| status | varchar(10) | NOT NULL DEFAULT 'ACTIVE', CHECK IN ('ACTIVE','INACTIVE') |
| version | integer | NOT NULL DEFAULT 1 (optimistic lock) |
| created_by | uuid | NOT NULL FK users(id) |
| updated_by | uuid | FK users(id) |
| deactivated_at / deactivated_by / deactivation_reason | timestamptz / uuid / varchar(500) | NULL (set on deactivate; reason optional — BRD silent) |
| created_at / updated_at | timestamptz | NOT NULL |

Indexes: `UNIQUE (lower(code))`, `UNIQUE (lower(name))`, `INDEX (status)`.

`departments`: same columns as `locations` plus `unit_type varchar(20) NOT NULL DEFAULT 'DEPARTMENT' CHECK IN ('DEPARTMENT','BUSINESS_UNIT')`. Same indexes. `[PROPOSED]` TDD-003.02.

`designations`: same columns as `locations`. Same indexes.

No `parent_id`, no department↔designation linkage, no location hierarchy (not in BRD; TDD-003.05).

### 10.2 `hr_scope_mappings`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| hr_user_id | uuid | NOT NULL FK users(id) |
| location_id | uuid | NOT NULL FK locations(id) ON DELETE RESTRICT |
| department_id | uuid | NULL FK departments(id) ON DELETE RESTRICT (NULL = all departments at the location) |
| status | varchar(10) | NOT NULL DEFAULT 'ACTIVE' CHECK IN ('ACTIVE','ENDED') |
| assigned_by | uuid | NOT NULL FK users(id) |
| assigned_at | timestamptz | NOT NULL |
| ended_by / ended_at / end_reason | uuid / timestamptz / varchar(500) | NULL; CHECK ((status='ENDED') = (ended_at IS NOT NULL)) |

Indexes: partial `UNIQUE (hr_user_id, location_id, COALESCE(department_id,'00000000-0000-0000-0000-000000000000')) WHERE status='ACTIVE'`; `INDEX (location_id, department_id) WHERE status='ACTIVE'`; `INDEX (hr_user_id) WHERE status='ACTIVE'`.

### 10.3 `it_location_scopes`

`id uuid PK`, `it_user_id uuid NOT NULL FK users`, `location_id uuid NOT NULL FK locations RESTRICT`, `status`, `assigned_by`, `assigned_at`, `ended_by`, `ended_at`, `end_reason` (same pattern/check as 10.2). Indexes: partial `UNIQUE (it_user_id, location_id) WHERE status='ACTIVE'`; `INDEX (location_id) WHERE status='ACTIVE'`.

### 10.4 `receiving_manager_scopes` `[TDD-REQUIRED]` and `reporting_manager_assignments`

`receiving_manager_scopes`: `id`, `receiving_manager_user_id FK users`, `department_id NOT NULL FK departments RESTRICT`, `location_id NULL FK locations RESTRICT`, `status`, `assigned_by/at`, `ended_by/at/end_reason`. Indexes: partial unique `(receiving_manager_user_id, department_id, COALESCE(location_id, zero-uuid)) WHERE status='ACTIVE'`; `(department_id, location_id) WHERE status='ACTIVE'`. Shape is the recommended default; may change per TDD-003.01.

`reporting_manager_assignments`:

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| employee_user_id | uuid | NOT NULL FK users(id) |
| reporting_manager_user_id | uuid | NOT NULL FK users(id) |
| status | varchar(10) | NOT NULL DEFAULT 'ACTIVE' CHECK IN ('ACTIVE','ENDED') |
| effective_from | timestamptz | NOT NULL |
| effective_to | timestamptz | NULL |
| change_reason | varchar(500) | NULL (mandatory when replacing an ACTIVE row — enforced in service) |
| assigned_by | uuid | NOT NULL FK users(id) |
| created_at / updated_at | timestamptz | NOT NULL |

Constraints: `CHECK (employee_user_id <> reporting_manager_user_id)`; partial `UNIQUE (employee_user_id) WHERE status='ACTIVE'`; `INDEX (reporting_manager_user_id) WHERE status='ACTIVE'`.

Ownership note: this table is the single source for the employee→Reporting Manager relationship. SPEC-004's `employee_profiles` reads it (view/join or a synchronised reference written only through `OrgRelationshipService`) and must not hold an independently editable copy `[PROPOSED]`; see Technical Design Decision TDD-003.08. HR assignment and IT assignment on a profile are stored by SPEC-004 but must validate against the mappings here.

### 10.5 Master-Data Dependency Matrix

Legend: **B** = blocks deactivation (default, TDD-003.03); **W** = warn only, listed in confirmation; **—** = no reference. FK rule is `ON DELETE RESTRICT` for every master FK (masters are never deleted). Owner = spec that creates the table. "Value rule" = value must come from an ACTIVE master via `MasterReferenceGuard` at write time `[BRD-029]`.

| Entity (table) | Owner | Department/BU | Designation | Location | Notes / blocking condition |
|---|---|---|---|---|---|
| `employee_profiles` (current org data) | SPEC-004 | FK `department_id` — B when profile employment status Active | FK `designation_id` — B (Active profiles) | FK `location_id` — B (Active profiles) | Mandatory org data for eligibility (BRD-029 rule 6); also HR/IT assigned users must be mapped to the profile's location |
| `reporting_manager_assignments` | SPEC-003 | — | — | — | Users, not masters; shown for completeness |
| `vacancies` | SPEC-005 | FK — B when vacancy status OPEN/FULL/ON_HOLD | FK — B | FK — B | BRD-017; CLOSED vacancies do not block |
| `transfer_requests` (current and proposed org values, selected vacancy) | SPEC-006 | FK current + proposed — B for non-final, non-DRAFT requests; W for DRAFT | FK current + proposed — same | FK current + proposed — same | Active status list per BRD-030; Draft not active |
| `transfer_org_changes` (HR changes) | SPEC-008 | FK old/new — B via parent request; historic rows never block | FK old/new | FK old/new | Historic rows retained for BRD-024 audit |
| `hr_scope_mappings` | SPEC-003 | FK (nullable) — W | — | FK — W | Super Admin must end/replace mapping or accept warning |
| `it_location_scopes` | SPEC-003 | — | — | FK — W | Location only |
| `receiving_manager_scopes` | SPEC-003 | FK — W | — | FK (nullable) — W | `[TDD-REQUIRED]` TDD-003.01 |
| `documents` (SPEC-011) | SPEC-011 | — | — | — | Linked to employee/transfer, no direct master FK |
| `audit_logs` (SPEC-001) | SPEC-001 | — | — | — | Stores master code + name at time of event (immutable snapshot), not an enforced FK, so audit survives renames |
| `notifications` / `notification_outbox` | SPEC-001/012 | — | — | — | No master references |
| Dashboard / reports | SPEC-014 | group-by only | group-by only | group-by only | Read-only joins; no blocking |

Transitive rule: a user (employee) deactivated/INACTIVE does not block master deactivation; their profile is not "in use" for blocking purposes `[PROPOSED]`.

## 11. Backend Implementation

### 11.1 Module layout `[PROPOSED]`

```
backend/src/modules/masters/        controller, service, repository, validators, routes, dto, dependency/
backend/src/modules/organisation/   controller, service, repository, validators, routes, dto, scope-provider/
backend/src/modules/navigation/     registry, controller, routes
backend/src/migrations/             <timestamp>-create-master-tables, <timestamp>-create-org-scope-tables
backend/src/models/                 location, department, designation, hr-scope-mapping, it-location-scope, receiving-manager-scope, reporting-manager-assignment
tests/backend/masters/  tests/backend/organisation/  tests/backend/navigation/
```

Layering: Route → Middleware (authn, authz, validation) → Controller → Service → Repository → Model, per Backend-Architecture. `async/await` with `try/catch`, structured logger, no `console.log`, no secrets (INT standards).

### 11.2 Services

- `MasterService<T extends 'location'|'department'|'designation'>`: `list(query)`, `get(id)`, `create(dto, actor)`, `update(id, dto, expectedVersion, actor)`, `activate(id, actor)`, `deactivate(id, {reason?}, actor)`, `getDependencies(id)`. All writes inside `withTransaction`.
- `MasterReferenceGuard`, `MasterDependencyRegistry` (§FR-003.31–32).
- `HrScopeService`, `ItScopeService`, `ReceivingScopeService`, `ReportingRelationshipService` (aggregated as `OrgRelationshipService`).
- `OrgScopeProvider` (§11.3). `NavigationRegistry`.

### 11.3 Provider contracts (consumed by SPEC-002 and others) `[PROPOSED]`

```ts
type ScopeKind = 'ALL' | 'SCOPED' | 'NONE';
interface ScopeDescriptor {
  kind: ScopeKind;                       // SUPER_ADMIN => 'ALL'; no mapping => 'NONE'
  role: Role;
  locationIds: string[];                 // HR, IT (and RM/RCV when location-narrowed)
  departmentRules: { locationId: string; departmentId: string | null }[]; // HR; null = all
  employeeUserIds: string[];             // REPORTING_MANAGER (active assignments)
  receivingTargets: { departmentId: string; locationId: string | null }[]; // RECEIVING_MANAGER
  selfUserId: string;                    // EMPLOYEE
}
interface OrgScopeProvider {
  resolveScope(ctx: AuthContext, opts?: { trx?: Transaction }): Promise<ScopeDescriptor>;
  isInScope(ctx: AuthContext, target: ScopeTarget, opts?): Promise<boolean>;
  findHrCandidates(a: { locationId: string; departmentId?: string }, opts?): Promise<UserRef[]>;
  findItCandidates(a: { locationId: string }, opts?): Promise<UserRef[]>;
  resolveReceivingManagers(a: { departmentId: string; locationId?: string }, opts?): Promise<UserRef[]>; // TDD-003.01
  isEligibleAssignee(a: { userId: string; role: Role; locationId: string; departmentId?: string }, opts?): Promise<boolean>;
}
interface EmployeeOrgReader {            // implemented by SPEC-004
  getOrg(employeeUserId: string, opts?): Promise<{ locationId: string; departmentId: string; designationId: string } | null>;
  listByReportingManager?(...) // not required here
}
```

`ScopeTarget` = `{ kind:'EMPLOYEE', employeeUserId } | { kind:'LOCATION', locationId } | { kind:'DEPARTMENT', departmentId, locationId? } | { kind:'TRANSFER_TARGET', departmentId, locationId }`. Missing `EmployeeOrgReader` data → `false` (fail closed).

### 11.4 Key algorithms

- **Deactivate master:** `BEGIN` → `SELECT … FOR UPDATE` master → if already INACTIVE return 409 `MASTER_ALREADY_INACTIVE` (idempotent-safe) → run registry checkers (blocking, warn) → if blocking count>0 abort `MASTER_IN_USE` (audit `MASTER_DEACTIVATION_BLOCKED`) → set status, `version+1`, audit → `COMMIT`.
- **Create dependent (other specs):** `BEGIN` → `MasterReferenceGuard.assertActive` (`FOR SHARE`) → insert. Lock ordering master-row-first prevents deadlock with deactivate (which locks only the master row first).
- **Reporting Manager change:** `BEGIN` → lock employee's ACTIVE row `FOR UPDATE` → validate manager (role, status, ≠ employee, no cycle by walking up active assignments with a visited set and depth bound by row count) → end old row, insert new → audit → `COMMIT`.
- **Resolve HR in-scope for an employee:** `EmployeeOrgReader.getOrg(employee)` then match any ACTIVE `hr_scope_mappings` row with `location_id = org.location AND (department_id IS NULL OR department_id = org.department)`.

## 12. API Requirements

Conventions: base `/api/v1`; envelope per SPEC-001; auth = valid access token (401 otherwise, per SPEC-002); permission denial 403 with no restricted data; validation errors `400 VALIDATION_ERROR` with `details[{field, code, message}]` `[PROPOSED]`.

### 12.1 Master administration (Locations; Departments/Designations identical unless noted)

Endpoints (`{m}` = `locations` | `departments` | `designations`) `[PROPOSED]`:

| Method + path | Purpose |
|---|---|
| `GET /api/v1/{m}` | List with `q`, `status` (ACTIVE/INACTIVE; default all), `unitType` (departments only), `page`, `pageSize`, `sort` (`code,name,status,createdAt`), `order` |
| `POST /api/v1/{m}` | Create |
| `GET /api/v1/{m}/:id` | View |
| `PATCH /api/v1/{m}/:id` | Edit `name`, `description`, `unitType` (departments); header `If-Match: <version>` or body `version` |
| `POST /api/v1/{m}/:id/activate` | Activate |
| `POST /api/v1/{m}/:id/deactivate` | Deactivate; body `{ "reason"?: string }` |
| `GET /api/v1/{m}/:id/dependencies` | Dependency preview: `{ blocking:[{entity,count}], warnings:[{entity,count}], canDeactivate }` |

Auth/authz (all): authenticated; role SUPER_ADMIN only; scope = all. Non-Super-Admin → 403 `FORBIDDEN`.

**POST request / response**
```json
// request
{ "code": "BLR", "name": "Bengaluru", "description": "…", "unitType": "DEPARTMENT" }
// 201
{ "success": true, "data": { "id": "uuid", "code": "BLR", "name": "Bengaluru", "description": "…", "status": "ACTIVE", "version": 1, "createdAt": "…", "updatedAt": "…" } }
```
`unitType` only for departments (default DEPARTMENT); rejected for others.

Validation: §14. Errors/status:

| Condition | HTTP | code |
|---|---|---|
| Missing/invalid token | 401 | `UNAUTHENTICATED` (SPEC-002) |
| Not Super Admin | 403 | `FORBIDDEN` |
| Invalid payload | 400 | `VALIDATION_ERROR` |
| Not found | 404 | `RESOURCE_NOT_FOUND` |
| Duplicate code | 409 | `DUPLICATE_MASTER_CODE` |
| Duplicate name | 409 | `DUPLICATE_MASTER_NAME` |
| Stale version | 409 | `VERSION_CONFLICT` |
| Deactivate while blocking dependents | 409 | `MASTER_IN_USE` (details: `[{entity,count}]`) |
| Activate already ACTIVE / deactivate already INACTIVE | 409 | `INVALID_MASTER_STATE` |
| Attempt to change `code` | 400 | `VALIDATION_ERROR` (field `code` immutable) |

`PATCH` returns 200 with updated resource; activate/deactivate return 200 with updated resource.

### 12.2 Lookups

`GET /api/v1/lookups/{locations|departments|designations}?q=&page=&pageSize=&status=` — purpose: selection lists for forms (BRD-029). Auth: any authenticated role. Response: `data: [{ id, code, name, status }]` (ACTIVE only; `status=ALL` honoured only for SUPER_ADMIN else 403). Pagination max 100. Errors: 401, 403 (non-SA `status=ALL`), 400.

### 12.3 Organisation scope mappings

| Method + path | Purpose | Authz |
|---|---|---|
| `GET /api/v1/org/hr-scopes` (`hrUserId`, `locationId`, `departmentId`, `status`, paging) | List | SUPER_ADMIN |
| `POST /api/v1/org/hr-scopes` `{ hrUserId, locationId, departmentId? }` | Create (201) | SUPER_ADMIN |
| `POST /api/v1/org/hr-scopes/:id/revoke` `{ reason }` | End mapping | SUPER_ADMIN |
| `GET/POST /api/v1/org/it-scopes`, `POST /api/v1/org/it-scopes/:id/revoke` | Same for IT `{ itUserId, locationId }` | SUPER_ADMIN |
| `GET/POST /api/v1/org/receiving-manager-scopes`, `POST …/:id/revoke` | `{ receivingManagerUserId, departmentId, locationId? }` `[TDD-REQUIRED]` | SUPER_ADMIN |
| `GET /api/v1/org/reporting-relationships` (`employeeUserId`, `managerUserId`, `status`) | List | SUPER_ADMIN |
| `PUT /api/v1/org/reporting-relationships/:employeeUserId` `{ reportingManagerUserId, reason? }` | Create first assignment or change (`reason` required when replacing) | SUPER_ADMIN |
| `GET /api/v1/org/scope/:userId` | Resolved `ScopeDescriptor` for any user (cross-organisation visibility) | SUPER_ADMIN |
| `GET /api/v1/org/my-scope` | Caller's own resolved scope | any authenticated |
| `GET /api/v1/org/my-hr-team` | HR users mapped to caller's location/department: `[{ name, officialEmail }]` | EMPLOYEE |
| `GET /api/v1/org/assignees?role=&locationId=&departmentId=` | Eligible-assignee candidate list for assignment/reassignment UIs | SUPER_ADMIN |

Example response (hr-scope create, 201): `{ "success": true, "data": { "id":"…", "hrUserId":"…", "location": {"id":"…","name":"…"}, "department": null, "status":"ACTIVE", "assignedAt":"…" } }`.

Validation: all ids UUID; referenced masters must exist and be ACTIVE (`422 MASTER_INACTIVE`); referenced user must exist, hold the required role, and have status Pending Activation/Active.

Errors specific to this section:

| Condition | HTTP | code |
|---|---|---|
| User role does not match mapping type | 422 | `SCOPE_ROLE_MISMATCH` |
| User inactive / not found | 422 / 404 | `USER_NOT_ELIGIBLE` / `RESOURCE_NOT_FOUND` |
| Duplicate ACTIVE mapping | 409 | `DUPLICATE_SCOPE_MAPPING` |
| Revoke already ended | 409 | `INVALID_MAPPING_STATE` |
| Self-reporting | 422 | `SELF_REPORTING_NOT_ALLOWED` |
| Reporting cycle | 422 | `REPORTING_CYCLE_DETECTED` |
| Reason missing on manager change/revoke | 400 | `VALIDATION_ERROR` |
| Master inactive/not found | 422 | `MASTER_INACTIVE` / `MASTER_NOT_FOUND` |

### 12.4 Navigation

`GET /api/v1/admin/navigation` — purpose: modules the caller may see. Auth: any authenticated. Response `data: [{ id: "locations", label: "Locations", route: "/locations", order: 3 }]` in the BRD-003 order. Errors 401. No restricted-module metadata is returned.

## 13. Frontend Implementation

### 13.1 Routes (`frontend/src/app/(protected)/…`) `[PROPOSED]`

`dashboard/page.tsx`; `locations/{page,new/page,[id]/page,[id]/edit/page}.tsx` and the same for `departments`, `designations`; `organisation/hr-scopes/page.tsx`, `organisation/it-scopes/page.tsx`, `organisation/receiving-scopes/page.tsx`, `organisation/reporting-relationships/page.tsx`, `organisation/scope-inspector/page.tsx`; `no-access/page.tsx`. Placeholders for `users`, `vacancies`, `transfers`, `documents`, `audit-logs` are owned by their SPECs and registered in navigation.

### 13.2 Components (`frontend/src/components/…`)

| Group | Components |
|---|---|
| layout | `AppShell`, `Sidebar`, `Header`, `Breadcrumbs`, `PageHeader`, `SkipLink` |
| ui | `StatusBadge`, `ConfirmDialog`, `Modal`, `Toast/ToastRegion`, `Skeleton`, `Button` (existing) |
| data-table (new, under `common/`) | `DataTable`, `TableToolbar`, `FilterBar`, `SearchInput`, `Pagination`, `SortHeader` |
| forms | `FormLayout`, `FormField`, `RequiredMark`, `FormErrorSummary`, `MasterSelect`, `UserSelect` (role-filtered) |
| common | `LoadingState`, `EmptyState` (extend existing), `ErrorState`, `NoAccessState`, `DashboardCard` |

Hooks: `useTableQuery`, `useNavigation`, `usePermission` (canonical enum), `useConfirm`, `useDebounce` (existing). Services: `master.service.ts`, `org.service.ts`, `navigation.service.ts` via existing Axios `http-client`. State: React Query-like caching is not mandated; Redux `uiSlice` holds sidebar state; server data is fetched per page (no global caching of permission data beyond the navigation response). Validation schemas under `validations/master.schema.ts` shared with form code.

### 13.3 Page behaviour

| Page | Behaviour |
|---|---|
| List (masters) | `DataTable` columns: Code, Name, (Type for departments), Status badge, Updated, Actions (View, Edit, Activate/Deactivate). Search `q`; filter status; sort; URL-synced. "Create" button only when the navigation/permission response allows (UX only). |
| Create/Edit | Fields per §14; required indicators; inline validation; code read-only on edit; on 409 duplicate show field-level message; on `VERSION_CONFLICT` offer reload. |
| View | Read-only details, status badge, created/updated meta, dependency summary (counts) for Super Admin. |
| Deactivate | `ConfirmDialog` loads `GET …/dependencies`; if blocking → shows counts and disables Confirm; if warnings → lists them; optional reason; success toast and list refresh. |
| Activate | `ConfirmDialog` simple confirmation. |
| Scope mapping pages | List with user, scope, status; "Assign" opens form with `UserSelect` (role-filtered) and `MasterSelect`; revoke and Reporting Manager change use `ConfirmDialog` with mandatory reason. Receiving Manager page carries a visible "pending design decision" help note referencing TDD-003.01 only in non-production builds. |
| Scope inspector | Search a user, show resolved scope (read-only). |
| Dashboard | Card grid per FR-003.07–10. |

### 13.4 State matrix (every data view)

| State | Behaviour |
|---|---|
| Loading | Skeleton rows/cards; `aria-busy` |
| Empty | Explanatory text + create action (if authorised) |
| Filtered empty | "No results" + clear filters |
| Error | Message from server `error.message`, request id, retry |
| No access | `NoAccessState`; no restricted data rendered |
| 401 | Delegated to SPEC-002 interceptor (redirect to login) |

### 13.5 Responsive & accessibility

Tailwind breakpoints `md` (768) and `lg` (1024); sidebar collapses to an accessible drawer (`aria-expanded`, focus management) below `lg`; tables scroll inside `overflow-x-auto` regions with focusable container and visible caption; touch target >= 44px on tablet `[PROPOSED]`.

## 14. Validation Rules

All validation is enforced by the backend (celebrate/Joi per Backend-Architecture); frontend schema mirrors it for UX. Limits are `[PROPOSED]` (BRD defines none). Inputs are trimmed, Unicode-normalised (NFC), control characters stripped.

| Field | Rule |
|---|---|
| `code` | required on create; 2–30 chars; `^[A-Za-z0-9][A-Za-z0-9_-]*$`; stored upper-case; unique ci; immutable |
| `name` | required; 2–150 chars; no leading/trailing spaces; unique ci within master type |
| `description` | optional; <= 500 chars |
| `unitType` | optional on department create (default DEPARTMENT); enum; rejected on other masters |
| `version` | required on PATCH; integer >= 1 |
| `reason` (deactivate) | optional, <= 500 chars |
| `status`, `sort`, `order`, `page`, `pageSize` | enum / whitelist; `page>=1`; `1<=pageSize<=100`; unknown params rejected |
| `q` | <= 100 chars; parameterised search (no raw SQL concatenation) |
| ids | UUID v4 |
| mapping `reason` | required for revoke and for Reporting Manager change when replacing an ACTIVE row; 3–500 chars |
| user references | must exist, role matches mapping type, status in (Pending Activation, Active) |
| master references | must exist and be ACTIVE |
| Reporting Manager | not equal to employee; employee must have role EMPLOYEE (or other role per TDD-003.10) and manager role REPORTING_MANAGER; no cycles |

HTML in any text field is stored as plain text and output-encoded; no markup is interpreted. Any attempt to send `locationName`/`departmentName`/`designationName` free text in a payload of any spec is rejected by the shared guard (unknown field) `[BRD-029]`.

## 15. Authorization & Security Rules

| Rule | Detail |
|---|---|
| Order of checks | Authenticated user → Role → Organisation scope → Resource → Action (BRD-026), implemented by SPEC-002; this SPEC registers resources `master:location|department|designation`, `org:scope`, `org:reporting`, `nav` with actions VIEW/CREATE/UPDATE/ACTIVATE/DEACTIVATE/REVOKE |
| Master/mapping write | SUPER_ADMIN only; every other role 403 on direct API call (BRD-039 slice) |
| Lookups | Authenticated; minimal projection (no audit fields) |
| Information leakage | 403/404 responses carry no names, counts or existence hints for unauthorised callers; `MASTER_IN_USE` counts only to Super Admin |
| Mass assignment | DTO whitelist; `status`, `version`, `createdBy` cannot be set via create/patch |
| Injection | Parameterised ORM queries; whitelisted sort columns |
| Rate/abuse | Standard API rate limit from SPEC-001; no new numeric limits invented here |
| Audit | Authorization denials are security events audited by SPEC-002/013 |
| Logging | Structured logger; no tokens or secrets in logs; request id propagated |
| Fail closed | Missing mapping, missing `EmployeeOrgReader` data, inactive user ⇒ no scope |
| Frontend | Hiding menu/buttons is UX only; backend authoritative (BRD-026) |
| Transport/data protection | Per SPEC-001/015 (NFR-004); nothing sensitive stored here beyond official email in `my-hr-team` response |

## 16. Workflow / State Transition Rules

This SPEC owns no transfer workflow. It owns two small lifecycles.

| Entity | From | Action (actor) | To | Rule |
|---|---|---|---|---|
| Master | (new) | create (SA) | ACTIVE | unique code/name |
| Master | ACTIVE | deactivate (SA) | INACTIVE | dependency check; confirmation |
| Master | INACTIVE | activate (SA) | ACTIVE | confirmation |
| Mapping (HR/IT/RCV/Reporting) | (new) | create/assign (SA) | ACTIVE | validations §14 |
| Mapping | ACTIVE | revoke / replace (SA) | ENDED | reason mandatory; confirmation |

Any other transition (e.g. activate an ACTIVE master, revoke an ENDED mapping) is refused (`INVALID_MASTER_STATE` / `INVALID_MAPPING_STATE`, 409). Transfer-status interactions: this SPEC reads transfer active statuses only through the registered dependency checker (BRD-030 list).

## 17. Transaction & Concurrency Rules

| Rule | Detail |
|---|---|
| Single transaction per write | Master write/status change + audit insert in one `withTransaction` (`READ COMMITTED` with explicit row locks) |
| Duplicate creation | Unique functional indexes are the source of truth; unique violation mapped to `DUPLICATE_*`; no pre-check-only logic |
| Deactivate vs concurrent dependent insert | Deactivate takes `FOR UPDATE` on the master; dependent writes take `FOR SHARE` via `MasterReferenceGuard`; whichever commits second sees the other's result (inactive ⇒ `MASTER_INACTIVE`; dependent present ⇒ `MASTER_IN_USE`) |
| Optimistic lock | `PATCH` with `version`; mismatch ⇒ 409 `VERSION_CONFLICT`; `UPDATE … WHERE version = :v` |
| Mapping create | Partial unique indexes prevent duplicate ACTIVE mappings under concurrency |
| Reporting Manager change | `FOR UPDATE` on the active row; end+insert atomically; the partial unique index guarantees one ACTIVE row even under races; cycle check performed inside the transaction |
| Scope reads | Single-statement queries, no caching; revoke visible on next request |
| Audit atomicity | Audit insert failure rolls back the configuration change (SPEC-001 kernel contract) |
| Notifications | None emitted here; no outbox rows |

## 18. Audit Requirements

All events use `AuditService.record(event, {trx})` (kernel SPEC-001); payload fields: actor user id, actor role, action, entity type/id, previous/new values, previous/new status, remarks/reason, timestamp, request id `[BRD-037]`. Master events also capture `code` and `name` (snapshot). No credentials ever appear.

| Event code `[PROPOSED]` | Trigger | Fields captured | BRD |
|---|---|---|---|
| `LOCATION_CREATED` / `DEPARTMENT_CREATED` / `DESIGNATION_CREATED` | Master created | new values (code, name, description, unitType), status ACTIVE | BRD-022 |
| `LOCATION_UPDATED` / `DEPARTMENT_UPDATED` / `DESIGNATION_UPDATED` | Edit | changed fields previous → new | BRD-022 |
| `LOCATION_ACTIVATED` / `DEPARTMENT_ACTIVATED` / `DESIGNATION_ACTIVATED` | Activate | previous/new status | BRD-022 |
| `LOCATION_DEACTIVATED` / `DEPARTMENT_DEACTIVATED` / `DESIGNATION_DEACTIVATED` | Deactivate success | previous/new status, reason, warning dependents acknowledged (entity counts) | BRD-022 |
| `MASTER_DEACTIVATION_BLOCKED` | Refused with `MASTER_IN_USE` | master, blocking counts by entity | BRD-022, BRD-037 (administrative) |
| `HR_SCOPE_ASSIGNED` / `HR_SCOPE_REVOKED` | HR mapping created/ended | hr user, location, department, reason | BRD-016, BRD-022, BRD-037 (role/permission-related) |
| `IT_SCOPE_ASSIGNED` / `IT_SCOPE_REVOKED` | IT mapping | it user, location, reason | same |
| `RECEIVING_SCOPE_ASSIGNED` / `RECEIVING_SCOPE_REVOKED` | Receiving mapping | user, department, location, reason | same |
| `REPORTING_MANAGER_ASSIGNED` / `REPORTING_MANAGER_CHANGED` | New or replaced assignment | employee, previous manager, new manager, reason, changed by | BRD-016, BRD-029, BRD-022 |
| `SCOPE_MAPPING_REJECTED` (optional) | Validation failure on sensitive mapping (role mismatch) | actor, attempted values (ids only) | BRD-037 administrative interventions `[PROPOSED]` |

Authorization-denied events for these endpoints are emitted by SPEC-002/013. SPEC-013 owns the consolidated catalogue.

## 19. Notification Requirements

| Event | Recipient | Channel | Trigger task | BRD |
|---|---|---|---|---|
| None | — | — | — | The twelve mandatory events of BRD-036 do not include master or scope changes; nothing is invented. Account notifications belong to SPEC-004/012; "new assignee notified" on reassignment belongs to SPEC-010/012. |

This SPEC enqueues no outbox rows. Open question if the business wants an in-app notice to an HR/IT user when a mapping changes: not in BRD; not implemented (see Out of Scope).

## 20. Error & Edge Cases

| # | Case | Expected |
|---|---|---|
| E1 | Two Super Admins create the same code at once | One 201, one 409 `DUPLICATE_MASTER_CODE` |
| E2 | Code differing only by case/spaces (`blr`, ` BLR `) | Rejected as duplicate after normalisation |
| E3 | Edit with stale version | 409 `VERSION_CONFLICT`; UI offers reload |
| E4 | Deactivate a master with active dependents | 409 `MASTER_IN_USE`, counts shown |
| E5 | Deactivate while another request creates a dependent | Exactly one outcome per §17 |
| E6 | Reactivate a master | Allowed; becomes selectable again |
| E7 | Existing profile/vacancy references an INACTIVE master | Record intact; shows Inactive badge; new selections cannot use it; editing the record forces choosing an active value only if the field is changed `[PROPOSED]` |
| E8 | HR mapped to a location later deactivated | Mapping retained (W warning); resolver returns it only while the location is ACTIVE `[PROPOSED]`; in-flight tasks continue via task-level assignment |
| E9 | Employee with no Reporting Manager | Provider returns no manager; submission blocked by SPEC-006 mandatory-data check; message points to assigned HR team (BRD-029) |
| E10 | No HR mapped to employee's location | `my-hr-team` returns `[]`; UI states no HR team assigned; no invented contact |
| E11 | Reporting cycle (A→B, B→A) | 422 `REPORTING_CYCLE_DETECTED` |
| E12 | Assign mapping to a user with wrong role | 422 `SCOPE_ROLE_MISMATCH` |
| E13 | Super Admin account has no mapping rows | Still ALL scope |
| E14 | Navigation request after role change | Reflects new role on next call; stale UI hits 403 and renders NoAccess |
| E15 | Network failure on list load | ErrorState with retry; no partial table |
| E16 | Browser back/forward with table state | URL query restores page/sort/filter |
| E17 | Very long names | Truncated with tooltip and accessible full text; stored within limits |
| E18 | Dependency checker for a not-yet-built spec table | Registry returns a non-blocking "not yet registered" warning in dev; boot check fails in staging/prod when SPEC-004/005/006 modules are loaded without registering |
| E19 | Page size > 100 or invalid sort | 400 `VALIDATION_ERROR` |
| E20 | Double-click on Confirm | Single request; button disabled while pending |

## 21. Acceptance Criteria

Admin panel, navigation, dashboard shell, shared patterns

- **SPEC-003.AC01** — Given an authenticated Super Admin, When they open the portal, Then the AppShell shows sidebar modules Dashboard, Users, Locations, Departments, Designations, Vacancies, Transfers, Documents, Audit Logs in that order. `[BRD-002, BRD-003]`
- **SPEC-003.AC02** — Given an authenticated Employee, When the navigation loads, Then it contains only modules the Employee is permitted (no Locations, Departments, Designations, Users, Audit-admin entries beyond the permitted set) and the response omits restricted modules. `[BRD-002]`
- **SPEC-003.AC03** — Given an Employee who types `/locations` in the browser, When the page loads, Then the API returns 403 and the NoAccess state shows with no master data. `[BRD-002, BRD-026]`
- **SPEC-003.AC04** — Given any role, When the dashboard loads, Then cards for total employees, active transfers, pending approvals, HR reviews, blocked tasks and open vacancies render in loading, then value/"Not available"/error states without breaking other cards. `[BRD-002]`
- **SPEC-003.AC05** — Given a list page with more than 20 records, When the user searches, filters, sorts and pages, Then results come from the server, the URL reflects the state, and a refresh restores it. `[BRD-002]`
- **SPEC-003.AC06** — Given a list, When there are no records / no matches / an API error / no permission, Then the respective empty / filtered-empty / error (with retry) / no-access state is shown. `[BRD-002]`
- **SPEC-003.AC07** — Given a create or edit form, When a required field is blank, Then a visible required indicator is present, an inline error appears on blur/submit, an error summary links to the field, and the server is not called for client-detectable errors. `[BRD-002, NFR-008]`
- **SPEC-003.AC08** — Given a sensitive action (deactivation, reassignment, credential reset, mapping revoke, Reporting Manager change), When the user triggers it, Then a confirmation dialog must be confirmed before any request is sent, with Esc/Cancel doing nothing. `[BRD-002]`
- **SPEC-003.AC09** — Given a tablet viewport (768px) and a desktop viewport (>=1024px), When pages render, Then no horizontal page scroll occurs and navigation remains operable by keyboard and touch. `[BRD-002, NFR-008]`
- **SPEC-003.AC09a** — Given all shared components and master pages, When axe-based checks and the keyboard walkthrough run, Then no violations of the selected standard are reported, status is never conveyed by colour alone, dialogs trap and restore focus, and table headers expose `aria-sort`. `[NFR-008]`

Masters

- **SPEC-003.AC10** — Given Super Admin, When they create a Location with a unique code/name, Then it is stored ACTIVE with version 1, returned 201, and an audit event `LOCATION_CREATED` is written. `[BRD-010, BRD-022]`
- **SPEC-003.AC11** — Given an existing Location, When Super Admin edits name/description, Then it is updated, version increments, previous/new values are audited and the code is unchanged. `[BRD-010]`
- **SPEC-003.AC12** — Given an ACTIVE Location with no blocking dependents, When Super Admin deactivates it after confirmation, Then status becomes INACTIVE, audited, and it no longer appears in lookups. `[BRD-010, BRD-002]`
- **SPEC-003.AC13** — Given an INACTIVE Location, When Super Admin activates it after confirmation, Then it is ACTIVE and appears in lookups again. `[BRD-010]`
- **SPEC-003.AC14** — Given Super Admin, When they create, edit, activate and deactivate a Department/BU and a Designation, Then behaviour matches Locations (including audit). `[BRD-010]`
- **SPEC-003.AC15** — Given a master with ACTIVE blocking dependents, When Super Admin attempts to deactivate it, Then the API returns 409 `MASTER_IN_USE` with dependent counts, the master stays ACTIVE and `MASTER_DEACTIVATION_BLOCKED` is audited (default policy; subject to TDD-003.03). `[PROPOSED]`
- **SPEC-003.AC16** — Given a master with only warn-class dependents (scope mappings), When Super Admin deactivates it, Then the confirmation dialog lists them and deactivation proceeds after confirmation. `[PROPOSED]`
- **SPEC-003.AC17** — Given an INACTIVE master referenced by an existing record, When the record is viewed, Then it remains intact and shows an Inactive badge; and When a new record tries to use it, Then the API returns 422 `MASTER_INACTIVE`. `[BRD-029]`
- **SPEC-003.AC18** — Given any write endpoint of SPEC-004/005/006/008 that accepts Department, Designation or Location, When called with a name string instead of a master id or with an unknown id, Then it is rejected (400/422) and no record is created. `[BRD-029]`
- **SPEC-003.AC19** — Given any authenticated role, When it calls the lookups endpoints, Then only ACTIVE `{id, code, name, status}` values are returned; `status=ALL` is allowed only for Super Admin. `[BRD-029]`

Dashboard/shared UI deliverables for other modules

- **SPEC-003.AC20** — Given another module page (e.g. Vacancies) built with the shared kit, When it renders, Then it inherits search/sort/filter/pagination/status badges/states without custom code for those concerns. `[BRD-002]`
- **SPEC-003.AC21** — Given the server-driven navigation, When a new module registers a required permission, Then it appears only for roles holding that permission. `[BRD-002, BRD-026]`
- **SPEC-003.AC22** — Given legacy role strings, When the frontend is built, Then no component compares against `'Super Admin'` / `'Manager'` strings; only the canonical enum or server permissions are used. `[DERIVED]`
- **SPEC-003.AC23** — Given the form kit, When `MasterSelect` loads options, Then only ACTIVE masters are listed and a free-text value cannot be submitted. `[BRD-029]`
- **SPEC-003.AC24** — Given an optimistic-lock conflict on edit, When the user submits, Then the UI shows a reload prompt and no data is overwritten. `[PROPOSED]`

Organisation relationships

- **SPEC-003.AC25** — Given Super Admin, When they map an HR user to Location L (department omitted), Then an ACTIVE `hr_scope_mappings` row exists, the provider returns scope for all departments at L for that HR, and `HR_SCOPE_ASSIGNED` is audited. `[BRD-016]`
- **SPEC-003.AC26** — Given an HR mapped to L/Dept D only, When the provider evaluates an employee at L in Dept E, Then the employee is out of scope. `[BRD-016, BRD-026]`
- **SPEC-003.AC27** — Given Super Admin maps an IT user to Location L, When the provider resolves IT scope, Then L is included; an IT user without mapping has empty scope. `[BRD-016]`
- **SPEC-003.AC28** — Given Super Admin assigns a Reporting Manager to an employee, When the assignment is stored, Then exactly one ACTIVE row exists; changing the manager with a reason ends the old row, inserts the new one atomically, and audits previous/new manager. `[BRD-016, BRD-029]`
- **SPEC-003.AC29** — Given a Receiving Manager mapped to Dept D (location optional) per the recommended default, When the provider resolves the Receiving Manager for a transfer target in D, Then that user is returned; unmapped target returns none. `[TDD-REQUIRED]` `[BRD-012, BRD-016]`
- **SPEC-003.AC30** — Given Super Admin, When the provider resolves scope, Then `kind=ALL` regardless of mappings. `[BRD-001, BRD-010]`
- **SPEC-003.AC31** — Given an employee profile with Location L, When 004 requests HR candidates, Then the HR users mapped to L (and matching department rules) are returned; an HR not mapped there fails `isEligibleAssignee`. `[BRD-029, BRD-035]`
- **SPEC-003.AC32** — Given an Employee with missing mandatory data, When the portal needs the HR contact, Then `my-hr-team` returns the HR users mapped to the employee's location/department (or an empty list) and never fabricates contacts. `[BRD-029]`
- **SPEC-003.AC33** — Given any master or mapping change, When it commits, Then an audit record with actor, role, action, entity, previous/new values and reason exists; if audit insert fails the change is rolled back. `[BRD-022, BRD-037]`
- **SPEC-003.AC34** — Given an HR mapping is revoked, When the HR makes the next scoped request for that location, Then it is refused (403) without waiting for cache expiry. `[BRD-026]`

## 22. Negative Acceptance Criteria

- **SPEC-003.NAC01** — Given a user with role HR/IT/Reporting Manager/Receiving Manager/Employee, When they call `POST /locations`, `PATCH /departments/:id`, `POST /designations/:id/deactivate` directly (e.g. Postman), Then 403 and nothing changes. (BRD-039 Security: direct API access) `[BRD-010, BRD-026]`
- **SPEC-003.NAC02** — Given no or an expired token, When any endpoint here is called, Then 401. `[BRD-026]`
- **SPEC-003.NAC03** — Given a non-Super-Admin user, When they POST scope mappings or Reporting Manager assignments, Then 403, no row created, denial audited as security event by SPEC-002. `[BRD-016, BRD-026]`
- **SPEC-003.NAC04** — Given a duplicate code or name (any case/spacing), When created, Then 409 and no second row. `[PROPOSED]`
- **SPEC-003.NAC05** — Given a PATCH body containing `code`, `status` or `version`-less content, When submitted, Then 400 `VALIDATION_ERROR` and no change. `[PROPOSED]`
- **SPEC-003.NAC06** — Given an HR mapped to Location L1, When they access an employee/record at L2 via direct API, Then the provider reports out of scope and the request is 403. (BRD-039 Security: another organisation's data) `[BRD-026]`
- **SPEC-003.NAC07** — Given a Reporting Manager, When accessing an employee not in their ACTIVE assignments, Then out of scope. `[BRD-026]`
- **SPEC-003.NAC08** — Given an IT user mapped to L1, When a task/location L2 is evaluated, Then out of scope. `[BRD-026]`
- **SPEC-003.NAC09** — Given any user with no mapping, When scope is resolved, Then kind NONE (never ALL). `[BRD-026]`
- **SPEC-003.NAC10** — Given a mapping request where the user's role does not match the mapping type, When submitted, Then 422 `SCOPE_ROLE_MISMATCH`. `[BRD-035]` (role requirement)
- **SPEC-003.NAC11** — Given an INACTIVE user, When mapped or proposed as assignee, Then refused. `[BRD-025, BRD-035]`
- **SPEC-003.NAC12** — Given self-reporting or a reporting cycle, When submitted, Then 422 and the existing assignment is unchanged. `[PROPOSED]`
- **SPEC-003.NAC13** — Given a Reporting Manager change or mapping revoke without a reason, When submitted, Then 400. `[BRD-002/022]`
- **SPEC-003.NAC14** — Given a deactivation attempt on a master that has blocking dependents, When confirmed, Then 409 and the master stays ACTIVE. `[PROPOSED]`
- **SPEC-003.NAC15** — Given a concurrent deactivation and a dependent creation, When both run, Then no ACTIVE dependent can end up referencing an INACTIVE master created after deactivation commit. `[PROPOSED]`
- **SPEC-003.NAC16** — Given a Employee opening the Locations admin page via URL, When accessed, Then 403 and the NoAccess state; no data in the DOM or network response. `[BRD-002]`
- **SPEC-003.NAC17** — Given an attempt to delete a master through any HTTP verb, When sent, Then 404/405 (no route). `[DERIVED]`
- **SPEC-003.NAC18** — Given unknown query parameters, invalid sort columns or `pageSize` > 100, When sent, Then 400. `[PROPOSED]`
- **SPEC-003.NAC19** — Given an unauthorised role requesting `status=ALL` lookups or another user's `scope/:userId`, When sent, Then 403. `[BRD-026]`
- **SPEC-003.NAC20** — Given a failing audit write during a master change, When the transaction runs, Then neither change nor partial audit persists. `[BRD-037]`

## 23. Testing Requirements

Tests live under `tests/backend/{masters,organisation,navigation}/` and `tests/frontend/{admin-shell,masters,organisation}/`. TDD: RED tests are written before each GREEN task.

### 23.1 Unit (backend)

| TC | Description | Covers |
|---|---|---|
| TC-003.01 | `MasterService` create normalises code/name, rejects invalid | AC10, NAC04 |
| TC-003.02 | Update with version mismatch → conflict; code immutable | AC11, NAC05 |
| TC-003.03 | State machine: activate/deactivate valid and invalid transitions | AC12, AC13 |
| TC-003.04 | `MasterDependencyRegistry` aggregates blocking/warn counts, boot check detects missing registration | AC15, AC16 |
| TC-003.05 | `MasterReferenceGuard` active / inactive / missing | AC17, AC18 |
| TC-003.06 | HR scope service: role/status validation, duplicate detection | AC25, NAC10, NAC11 |
| TC-003.07 | IT scope service: same | AC27, NAC10 |
| TC-003.08 | Receiving scope resolver (default strategy) incl. most-specific-wins | AC29 |
| TC-003.09 | Reporting relationship: self, cycle, replace, reason required | AC28, NAC12, NAC13 |
| TC-003.10 | `OrgScopeProvider.resolveScope` for each role incl. NONE and ALL | AC30, NAC09 |
| TC-003.11 | `isInScope` for employee/location/department/transfer target; fail-closed when reader returns null | AC26, NAC06–NAC08 |
| TC-003.12 | `isEligibleAssignee` role + scope + status | AC31, NAC11 |
| TC-003.13 | Navigation registry filters by permission and preserves order | AC01, AC02, AC21 |
| TC-003.14 | Audit payload builders contain no secrets and correct fields | AC33 |

### 23.2 Integration (DB)

| TC | Description | Covers |
|---|---|---|
| TC-003.15 | Unique functional indexes on lower(code)/lower(name) enforce duplicates | NAC04 |
| TC-003.16 | Partial unique indexes on mappings and Reporting Manager | AC28 |
| TC-003.17 | CHECK constraints (`employee<>manager`, status/ended pairing) | NAC12 |
| TC-003.18 | FK `RESTRICT` prevents physical delete of in-use master | NAC17 |
| TC-003.19 | Deactivation with real dependent rows from fixtures of 004/005/006 tables (stubs) | AC15 |
| TC-003.20 | Audit + change atomicity (forced audit failure rolls back) | AC33, NAC20 |
| TC-003.21 | Migration up/down is reversible | — |

### 23.3 API

| TC | Description | Covers |
|---|---|---|
| TC-003.22 | Master CRUD contract: shapes, status codes, error codes for all three masters | AC10–AC14 |
| TC-003.23 | Authz matrix: each role × each endpoint (403/200) | NAC01, NAC03, NAC19 |
| TC-003.24 | 401 for missing/expired/malformed token | NAC02 |
| TC-003.25 | Lookups: ACTIVE only, projection, `status=ALL` restriction | AC19 |
| TC-003.26 | Pagination/sort/filter/search boundaries, unknown params | AC05, NAC18 |
| TC-003.27 | Org mapping endpoints: create/revoke/duplicate/role mismatch | AC25, AC27, NAC10 |
| TC-003.28 | Reporting relationship PUT create/replace/cycle | AC28, NAC12 |
| TC-003.29 | `my-scope`, `scope/:userId`, `my-hr-team`, `assignees` | AC30–AC32, NAC19 |
| TC-003.30 | Navigation endpoint per role | AC01, AC02 |
| TC-003.31 | No delete routes exist | NAC17 |

### 23.4 Frontend and accessibility

| TC | Description | Covers |
|---|---|---|
| TC-003.32 | AppShell/Sidebar renders server navigation; legacy strings absent | AC01, AC22 |
| TC-003.33 | NoAccess on 403; no data rendered | AC03, NAC16 |
| TC-003.34 | Dashboard cards: loading/value/not-available/error independent | AC04 |
| TC-003.35 | DataTable: URL sync, debounce, stale-response guard, states | AC05, AC06 |
| TC-003.36 | Forms: required indicator, inline validation, summary, server error mapping | AC07 |
| TC-003.37 | ConfirmDialog: confirm required, Esc cancels, focus trap/restore, reason mandatory variant | AC08, NAC13 |
| TC-003.38 | Master pages flows: create/edit/deactivate with dependency preview/activate | AC10–AC16 |
| TC-003.39 | `MasterSelect` active-only, no free text | AC23 |
| TC-003.40 | Mapping pages flows incl. revoke/change confirmations | AC25–AC28 |
| TC-003.41 | Responsive layout at 768px and 1280px (no page-level horizontal scroll) | AC09 |
| TC-003.42 | axe checks on all shared components and pages | AC09a |
| TC-003.43 | Keyboard-only walkthrough (scripted): skip link, sidebar, table, dialog | AC09a |
| TC-003.44 | Optimistic-lock conflict UI | AC24 |

### 23.5 Security

| TC | Description | Covers |
|---|---|---|
| TC-003.45 | Direct HTTP bypass attempts per role for every write endpoint | NAC01, NAC03 |
| TC-003.46 | Mass-assignment (`status`, `createdBy`, `version`) ignored/rejected | NAC05 |
| TC-003.47 | SQL-injection payloads in `q`/sort | NAC18 |
| TC-003.48 | Responses and logs contain no restricted data/tokens | AC03, NAC16 |

### 23.6 Concurrency

| TC | Description | Covers |
|---|---|---|
| TC-003.49 | N parallel creates of same code → exactly one success | NAC04 |
| TC-003.50 | Parallel deactivate vs dependent insert (both orderings, repeated) | NAC15 |
| TC-003.51 | Parallel Reporting Manager changes for one employee → single ACTIVE row | AC28 |
| TC-003.52 | Dependency conformance: all entities of the Dependency Matrix have a registered checker | AC15 |
| TC-003.53 | Parallel duplicate mapping creation | AC25 |

### 23.7 Workflow / Negative

| TC | Description | Covers |
|---|---|---|
| TC-003.54 | Invalid master/mapping state transitions refused | §16 |
| TC-003.55 | HR/IT/RM scope revoked mid-session reflects on next request | AC34 |
| TC-003.56 | Negative scenario pack NAC01–NAC20 executed as a suite | NAC01–NAC20 |
| TC-003.57 | Provider contract test reused by SPEC-002/016 harness (stable interface) | §11.3 |

## 24. Definition of Done

- All TASK-003.01–030 complete; RED→GREEN history evident; Gate 1 approved before development; Gate 2 review passed.
- All ACs/NACs covered by passing automated tests TC-003.01–057; coverage report attached; no failing mandatory BRD-039 slice.
- Migrations reversible and applied on a clean database; indexes/constraints in §10 verified.
- OpenAPI for §12 published; error codes documented.
- axe checks clean at the selected standard; manual keyboard and tablet/desktop pass recorded.
- Legacy role strings and static navigation removed from the frontend.
- Provider interface (§11.3) frozen and consumed by SPEC-002 without modification; registry integration verified with SPEC-004/005/006 stubs.
- Dependency Matrix checker conformance test (TC-003.52) passes when 004/005/006/008 are integrated.
- Audit events of §18 verified; no secrets in logs/audit.
- INT standards honoured: ES6+, async/await, try/catch, structured logger, env-var config, input validation, no AI-generated comments.
- TDD decisions TDD-003.01–10 are either answered by Gate 1 or the recommended default is explicitly accepted and recorded.
- `status.md`, dashboard, PR review record and `prompt_history.md` synchronised per governance.

## Technical Design Decisions Required — Not Defined by BRD

| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-003.01 | **Receiving Manager scope mapping:** what does "responsible for the target department/team" map to — Department/BU only, Department+Location, or a team entity? May one Receiving Manager cover several departments? Can several Receiving Managers cover one target (tie-break)? How is a Receiving Manager created/identified (also open in SPEC-004)? | Mapping to Department/BU (required) + optional Location; many-to-many; most-specific mapping (dept+location over dept-only) wins; if several remain, all are notified/eligible and first to act wins is NOT assumed — routing assigns all active candidates and SPEC-007 decides single-assignee rule | Routing for BRD-012/024; resolver strategy swappable; schema `receiving_manager_scopes` |
| TDD-003.02 | Is "Department/Business Unit" one master or a hierarchy (Business Unit → Department)? | One flat master with `unit_type` (DEPARTMENT/BUSINESS_UNIT) | Schema, UI labels, vacancy/transfer FKs |
| TDD-003.03 | Deactivating a master that is in use: block, warn, or allow with existing data retained? | Block when blocking dependents (active profiles, non-closed vacancies, active non-Draft transfers) exist; warn for scope mappings and Draft transfers; existing references retained after deactivation | Business policy; BRD-029/010 |
| TDD-003.04 | HR scope granularity and selection: location only, or location+department; when several HR (or IT) users map to one location, how is the employee's "assigned HR/IT" selected (also gap (g))? | HR: location required, department optional; IT: location only; mapping returns candidates, Super Admin selects assigned HR/IT on the profile (SPEC-004) | BRD-016/029; SPEC-004/009 |
| TDD-003.05 | Master field sets, code format, uniqueness, immutability, max lengths, whether Location has address/city fields | `code` + `name` + `description`; ci-unique code and name; code immutable; limits per §14 | UI forms, imports, reports |
| TDD-003.06 | Which non-Super-Admin roles see the Users module and with what scope (HR "assigned employees", managers "assigned employees") | HR and Reporting Manager: scoped read-only employee list (rules in SPEC-004); others none | Navigation, SPEC-004 |
| TDD-003.07 | NFR-008 "organisational portal design and accessibility standards": which design system/standard and conformance level? | WCAG 2.1 AA; SPEC-001 theme tokens until an organisational design system is supplied | All UI, tests, DoD |
| TDD-003.08 | Single ownership of the employee→Reporting Manager relationship: `reporting_manager_assignments` (this SPEC) vs a column on SPEC-004 `employee_profiles` | Table here is the source; profile reads/joins it; writes only via `OrgRelationshipService` with `{trx}` | Avoids duplicated source of truth (BRD-029) |
| TDD-003.09 | Behaviour of scope mappings when the mapped Location/Department becomes INACTIVE | Mapping retained; excluded from new-task candidate lists; in-flight tasks unaffected | Routing, reassignment |
| TDD-003.10 | May a user hold more than one role (contract gap (d))? Which roles may be an "employee" with a Reporting Manager (does a Reporting Manager/HR/IT user also report to someone)? | One role per user; any user role may have an ACTIVE Reporting Manager row; only role-matching users may be mapped as HR/IT/RM/RCV | Mapping validation, provider |

## Out of Scope (this SPEC)

- Everything listed in BRD Out of Scope: HR/payroll/IT platform redesign, Facilities/Admin role, building an enterprise master-data platform or identity provider, automatic HR-system integration/synchronisation (masters are portal-maintained only, BRD-029), historical data migration/bulk import of masters, cross-company transfer. Nothing in this SPEC introduces any of these.
- Authentication, sessions, RBAC engine (SPEC-002); user creation, ID generation, credential delivery, user lists, employee profile storage (SPEC-004); vacancy entity and capacity (SPEC-005); transfer requests, workflow, HR changes, reassignment actions (SPEC-006–010); documents (SPEC-011); notification delivery (SPEC-012); audit viewing/export (SPEC-013); dashboard card data, worklists, reports, escalation (SPEC-014).
- Bulk import/export of master data; hierarchical org charts; delegated master administration to non-Super-Admin roles; notifications on master/mapping change; business rules not in the BRD (tenure, probation, etc.).
- Receiving Manager enable/disable toggle and date-change re-approval configuration (SPEC-007).
- Numeric performance, availability or capacity targets (BRD-038 "to be confirmed"; owned by SPEC-015).
