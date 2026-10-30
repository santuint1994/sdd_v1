# SPEC-011 — Secure Document Management

## Feature ID
secure-document-management

## Status
Changes Requested at Gate 1 (2026-10-28) — reviewer Shamik Bhattacharya; see `.ai-context/pr_reviews/SPEC-011-secure-document-management-20261028-145216.md`. Spec must be updated and re-submitted for Gate 1; plan, tasks, tests and code remain blocked

## Gate Approvals & History
| Gate | Reviewer | Date | Status | Record file |
|---|---|---|---|---|
| Gate 1 (Spec Peer Review) | Shamik Bhattacharya (shamik.bhattacharya@intglobal.com) | 2026-10-28 | Changes Requested | `.ai-context/pr_reviews/SPEC-011-secure-document-management-20261028-145216.md` |
| Gate 2 (Code Review) | — | — | Not started | — |

## Intent & Business Goals
HR can upload authorised transfer and organisation documents and link them to an employee and/or a transfer request `[BRD-021]`. The upload and retrieval of those documents must be secured at the API/server level and must never depend on frontend restrictions `[BRD-021]`. Concretely this SPEC delivers:

- A hardened upload pipeline: PDF and image only, 5 MB per file enforced while streaming and before anything is stored, MIME-type and extension validation, MIME/extension mismatch rejection, file-name sanitisation, generated storage names, configured local server storage outside the web root.
- A single authenticated, authorised retrieval path. Every view, download, list and metadata request re-verifies role, organisation scope, resource and stage. There is no public URL.
- The exact BRD error contract: HTTP 413 `FILE_SIZE_EXCEEDED`, HTTP 415 `UNSUPPORTED_FILE_TYPE`, HTTP 415 `INVALID_FILE_TYPE`; an invalid file is never stored.
- Audit of upload, view and download (uploaded-by, date/time, category, employee, transfer reference) and of denials.
- The Documents module of the Admin Panel and reusable frontend upload/list/download components that other screens (HR processing, employee profile, IT task) embed.

Business outcome: privacy of employee documents (NFR-007), a tested negative-scenario answer to BRD-039 "IT cannot access Employee documents outside its authorised scope", and the BRD-038 5 MB limit enforced where it cannot be bypassed.

## User Roles & Actors
| Role | Role in this SPEC |
|---|---|
| HR | Uploads documents (own scope); views/downloads documents of in-scope employees/transfers; sets role-visibility flags on documents it can access `[PROPOSED]` (flags are a proposed mechanism for BRD-021 role/scope access; see TDD-011.05/06/07) `[BRD-013]`. |
| Super Admin | Views/downloads all documents (Documents module); upload by Super Admin is `[TDD-REQUIRED]` (TDD-011.04). |
| IT | Minimum-information, task-scoped access only; IT completion evidence mechanism `[TDD-REQUIRED]` (TDD-011.07) `[BRD-014]`, `[BRD-039]`. |
| Employee | Own-document access policy `[TDD-REQUIRED]` (TDD-011.05). |
| Reporting Manager / Receiving Manager | Visibility `[TDD-REQUIRED]` (TDD-011.06). |
| System | Storage, validation, audit emission, orphan/temp-file housekeeping. |

---

## 1. Specification Information
| Item | Value |
|---|---|
| SPEC ID | SPEC-011 |
| Title | Secure Document Management |
| Purpose | Secure upload, storage, metadata, scoped retrieval and audit of transfer and organisation documents, with the BRD-021 validation/error contract. |
| Business objective | Documents are attached to employees/transfers by HR only through a validated pipeline, and read only by users permitted by role + organisation scope + resource on every request. |
| Version | 0.1 (Draft) |
| Author role | Senior Software Engineer / Spec Author |
| Gate 1 reviewer per roster | Project Manager / Product Owner |
| Task prefix | `TASK-011.MM` |
| Backend module | `backend/src/modules/documents/` |
| Frontend module | `frontend/src/app/(admin)/documents/`, `frontend/src/components/documents/` |

## 2. Why This SPEC Exists
1. BRD-021 is a self-contained, security-critical requirement with a precise validation and error contract that no other SPEC owns.
2. BRD-003 lists a **Documents** Admin module; SPEC-003 provides the admin shell and SPEC-011 provides the module content.
3. BRD-039 contains a mandatory negative scenario (IT vs Employee documents) that is only testable once document access control exists.
4. NFR-007 (privacy) and BRD-038 (5 MB) have document-specific slices that must be enforced server-side.
5. BRD-OQ-08 deliberately removed malware scanning, retention, archive and deletion. This SPEC must therefore be explicit about what is *not* built, so that the design neither silently invents a deletion/retention feature nor leaves a gap.

## 3. BRD Traceability

### 3.1 BRD requirement IDs
| BRD ID | Coverage | What this SPEC delivers |
|---|---|---|
| BRD-021 | **FULL** | Everything in sections 7-22. |
| BRD-003 | PARTIAL (slice: Documents module) | Documents admin module list/filter/preview/download (FR-011.60-65). SPEC-003 owns the other modules and the shell. |
| BRD-022 | PARTIAL (slice: document actions) | Audit events for upload, view, download, rejected upload, denial, visibility change (section 18). SPEC-013 owns visibility/export/catalogue. |
| BRD-038 | PARTIAL (slice: maximum document upload size) | 5 MB per file hard limit, streaming enforcement (FR-011.20-24). SPEC-015 owns the other BRD-038 rows. |
| BRD-039 | PARTIAL (slice: document rows) | Negative scenarios NAC rows in 3.5; QA execution in SPEC-016. |
| BRD-026 | PARTIAL (slice: Resource=document, Action=Upload/Download) | Authorisation chain applied to documents (FR-011.30-39). SPEC-002 owns the engine. |
| BRD-013 | PARTIAL (slice: "upload transfer/organisation documents") | HR upload capability. |
| BRD-014 | PARTIAL (slice: IT "completion evidence", "minimum required employee information") | Hook + minimum-info projection; mechanism `[TDD-REQUIRED]`. |
| BRD-027 | PARTIAL (slice: HR Processing "uploading required transfer/organisation documents where applicable") | Upload is permitted in HR-controlled stages; uploading never causes a workflow transition `[DERIVED]` (no matrix row). |
| BRD-010 | PARTIAL (slice: Super Admin view of all data) | Super Admin read access. |

### 3.2 NFR IDs
| NFR | Coverage | Slice |
|---|---|---|
| NFR-007 (Privacy) | **FULL for documents** (SPEC-002, SPEC-015 cover non-document access) | Employee and document access restricted to authorised roles and organisation scope. |
| NFR-002 (Authorisation) | PARTIAL | Backend authoritative layer applied to the document resource. |
| NFR-004 (Transport & data protection) | PARTIAL | Documents stored outside web root, no public URL, `Cache-Control: no-store`; TLS arrangement is SPEC-015 / TDD (o). |
| NFR-005 (Auditability) | PARTIAL | Document events are audited. |
| NFR-009 | Not covered | Backup of the storage directory is infrastructure planning (SPEC-015). |

### 3.3 BRD-OQ
| OQ | Status | How implemented |
|---|---|---|
| BRD-OQ-08 | Resolved | PDF/image only; local server storage; 5 MB per file; server-side MIME/extension validation; file-name sanitisation; authenticated access only; **no** malware scanning, retention, archive or deletion policy (hence no delete endpoint and no scanner). |
| BRD-OQ-09 | Resolved (deferred) | Not implemented here; storage backup deferred to NFR-009. |

### 3.4 Business rules and acceptance criteria (BRD wording mapped)
| BRD rule / acceptance bullet | Coverage | FR / AC |
|---|---|---|
| "HR can upload authorised transfer and organisation documents, linked to the relevant employee and/or transfer request" `[BRD-021]` | FULL | FR-011.01-06, SPEC-011.AC01-02 |
| "document metadata includes category/type, uploader, upload timestamp and employee/request reference" `[BRD-021]` | FULL | FR-011.07-09, AC03 |
| "PDF and image formats only" | FULL | FR-011.10-19, AC04-06 |
| "5 MB per file" | FULL | FR-011.20-24, AC07 |
| "server validates MIME type ... and file extension ... file names are sanitised" | FULL | FR-011.12-19, AC05-06, AC08 |
| "configured local server storage" | FULL | FR-011.40-45, AC09 |
| "accessed only through an authenticated and authorised API/server endpoint ... never exposed through unrestricted public URLs" | FULL | FR-011.30-36, FR-011.46, AC10-12 |
| "Every view/download request verifies that the requester may access the associated employee/transfer" | FULL | FR-011.31-35, AC11-14 |
| "upload, view, download, uploaded-by, upload date/time, category/type, associated employee, associated transfer reference ... audit log" | FULL | section 18, AC15-16 |
| "rejected at the API/server level and the invalid file is not stored"; 413 / 415 / 415 + clear message | FULL | FR-011.21-24, FR-011.25-29, AC07-08, AC17-18 |
| "malware scanning, retention, archive and deletion policy are not required" `[BRD-OQ-08]` | FULL (explicit non-features) | FR-011.70-72, NAC |
| "IT users see only the minimum employee/transfer information required" (Business Rules) | FULL for documents | FR-011.37, AC13 |
| "Document access is scoped by role and organisation; users do not automatically gain access to all employee documents" (Business Rules) | FULL | FR-011.30-39 |
| UAT: "document handling" | Input to SPEC-016 | section 23 |
| Acceptance: "HR can ... upload authorised documents" | FULL | AC01 |

### 3.5 Negative scenarios (BRD-039)
| BRD-039 row | Coverage | NAC |
|---|---|---|
| Security: IT cannot access Employee documents outside its authorised scope (BRD-021) | **FULL** | NAC01-03 |
| Security: a user cannot access another organisation's data outside their assigned scope (BRD-026) | PARTIAL (document slice) | NAC04-05 |
| Security: an Employee cannot access another Employee's transfer request | PARTIAL (document slice: documents of another employee/transfer) | NAC06 |
| Security: direct API access cannot bypass backend role/org/resource/action authorisation | PARTIAL (document slice) | NAC07-08 |
| Workflow: a Completed transfer cannot be modified through the normal workflow | PARTIAL (no new uploads on final transfers; default `[TDD-REQUIRED]`, TDD-011.03) | NAC12 |

---

## 4. Dependencies
| Dependency | Needed for | Owner |
|---|---|---|
| Config loader, logger (redaction), error classes, request-id, response envelope, validation middleware, `withTransaction`, `AuditService.record`, migration conventions, base UI kit | Everything | SPEC-001 |
| Authentication middleware (401), `AuthorizationService.authorize`, `ScopeResolver` interface, JWT/session handling in the FE client | Authz | SPEC-002 |
| Admin shell, navigation entry for Documents, shared list/filter table patterns, org scope mappings (HR location scope, IT location scope, Receiving Manager scope `[TDD-REQUIRED]`) | Documents module, scope checks | SPEC-003 |
| `employee_profiles`, `users` (uploader FK), assigned HR / reporting manager / assigned IT | Linking, scope | SPEC-004 |
| `transfer_requests` (id, reference, employee_id, status) | Linking, stage checks | SPEC-006 |
| Status codes, `transfer_task_assignments`, Receiving Manager routing | Stage and assignee checks | SPEC-007 |
| HR processing screen (host of the upload component) | Embedding | SPEC-008 |
| `it_tasks` (host of the IT evidence hook) | IT evidence | SPEC-009 |

## 5. Enables
| Consumer | Uses |
|---|---|
| SPEC-008 | `DocumentUploader` + `DocumentList` on the HR transfer detail screen; `DocumentService.listForTransfer`. |
| SPEC-009 | `DocumentService.attachEvidence` / `countByCategoryForTransfer` for IT completion evidence `[TDD-REQUIRED]`. |
| SPEC-004 | `DocumentList` on the employee profile (organisation documents). |
| SPEC-013 | Document audit events appear in the audit catalogue/visibility. |
| SPEC-015 | NFR-004/007/009 hardening reviews (storage path, TLS, backup). |
| SPEC-016 | BRD-039 document scenarios and UAT "document handling". |

## 6. Roles & Scope
Roles `[BRD-001]`: `SUPER_ADMIN, EMPLOYEE, REPORTING_MANAGER, RECEIVING_MANAGER, HR, IT`.

### 6.1 Permission matrix (default `[PROPOSED]` unless tagged)
Every cell additionally requires the organisation-scope and resource checks of section 15. "Scope" below refers to the `ScopeResolver` results from SPEC-003/004.

| Action | SUPER_ADMIN | HR | IT | EMPLOYEE | REPORTING_MANAGER | RECEIVING_MANAGER |
|---|---|---|---|---|---|---|
| Upload | `[TDD-REQUIRED]` TDD-011.04 (default: no) | **Yes** `[BRD-021]` for in-scope employee/transfer at permitted stage | `[TDD-REQUIRED]` TDD-011.07 (default: evidence only for an assigned task; disabled by config flag until decided) | No `[DERIVED]` (BRD-021: HR uploads; BRD-011 lists no Employee upload) | No | No |
| List / view metadata | All | In scope | Only documents flagged `visible_to_it` for transfers with an active IT task assigned to the user, in an IT-controlled stage, in IT location scope; minimal projection | `[TDD-REQUIRED]` TDD-011.05 (default: own documents flagged `visible_to_employee`) | `[TDD-REQUIRED]` TDD-011.06 (default: assigned employees' documents flagged `visible_to_managers`) | `[TDD-REQUIRED]` TDD-011.06 (default: documents of routed requests flagged `visible_to_managers`) |
| View inline / Download | All | In scope | As List | As List | As List | As List |
| Change visibility flags | Yes | In scope | No | No | No | No |
| Delete / replace | **Nobody**; endpoint does not exist `[BRD-OQ-08]` | — | — | — | — | — |

### 6.2 Scope sources
HR: assigned location/organisation scope and assigned-employee mapping (BRD-016, BRD-013). IT: location scope plus assigned task (BRD-016, BRD-014). Reporting Manager: assigned employees (BRD-012). Receiving Manager: requests routed to its target team/organisation scope (BRD-012, mapping `[TDD-REQUIRED]` per contract gap (c)). Employee: own `employee_id`.

---

## 7. Functional Requirements

### 7.1 Upload and linking
| ID | Requirement | Tag |
|---|---|---|
| FR-011.01 | HR can upload a document linked to an employee (organisation document) via `POST /api/v1/employees/:employeeId/documents`. | `[BRD-021]` |
| FR-011.02 | HR can upload a document linked to a transfer request via `POST /api/v1/transfers/:transferId/documents`. | `[BRD-021]` |
| FR-011.03 | A document must link to at least one of employee or transfer request. When linked to a transfer, `employee_id` is set to the transfer's employee (always populated, simplifying scope checks). The two-route design carries the link in the URL path so authorisation is decided **before any file byte is read**. | `[BRD-021]` "and/or"; routes `[PROPOSED]` |
| FR-011.04 | The link target must exist, otherwise `404 EMPLOYEE_NOT_FOUND` / `404 TRANSFER_REQUEST_NOT_FOUND` (checked after the authorisation decision so out-of-scope callers get 403, not an existence oracle). | `[PROPOSED]` |
| FR-011.05 | One file per request (multipart field `file`). A second file part returns `400 TOO_MANY_FILES`; no file part returns `400 FILE_REQUIRED`. | `[PROPOSED]` |
| FR-011.06 | Upload permitted at transfer stages: `PENDING_HR_REVIEW`, `HR_PROCESSING`, `PAYROLL_PROCESSING` for HR; Super Admin (if TDD-011.04 allows) any non-final stage; employee-only (no transfer) organisation documents at any time for in-scope HR. Not permitted on `DRAFT`, final statuses, `BLOCKED`, or manager/IT stages for HR. Failure: `403 DOCUMENT_ACTION_NOT_PERMITTED_AT_STAGE`. Uploading never triggers a workflow transition. | `[BRD-026]` stage check, `[BRD-027]` HR Processing; exact stage set `[TDD-REQUIRED]` TDD-011.03 |

### 7.2 Metadata
| ID | Requirement | Tag |
|---|---|---|
| FR-011.07 | Persisted metadata: category/type, uploader (user id + role at upload), upload timestamp (server clock, UTC `timestamptz`), employee reference, transfer request reference (when linked). | `[BRD-021]` |
| FR-011.08 | Category is mandatory and selected from the `document_categories` catalogue (never free text). Initial catalogue is `[PROPOSED]`: `TRANSFER_SUPPORTING`, `ORGANISATION_DOCUMENT`, `HR_CONFIRMATION`, `PAYROLL_SUPPORTING`, `IT_COMPLETION_EVIDENCE`, `OTHER`. Catalogue values are `[TDD-REQUIRED]` TDD-011.01. | BRD-021 requires "category/type" only |
| FR-011.09 | Optional `description` (max 500 chars, plain text, control characters stripped). Visibility flags `visible_to_employee`, `visible_to_managers`, `visible_to_it` default `false`, set by HR at upload or later. | `[PROPOSED]` supports TDD-011.05/06/07 |

### 7.3 File-type validation (server, never frontend-reliant)
| ID | Requirement | Tag |
|---|---|---|
| FR-011.10 | Allowed formats: PDF and image only. Initial allow-list: `.pdf` (`application/pdf`), `.jpg`/`.jpeg` (`image/jpeg`), `.png` (`image/png`). Additional image formats (e.g. `.webp`, `.gif`, `.tif/.tiff`, `.bmp`, `.heic`) are `[TDD-REQUIRED]` TDD-011.02; SVG is **excluded** by default because it is an active-content format. | `[BRD-021]` PDF + image; exact list `[TDD-REQUIRED]` |
| FR-011.11 | The allow-list is a single constant table (`FileTypePolicy`) mapping extension → canonical MIME → magic-byte signature; adding a format is a one-row change plus tests. | `[PROPOSED]` |
| FR-011.12 | **Extension validation:** extension is taken from the final extension of the sanitised file name, case-insensitive. Missing extension or extension not in the allow-list returns `415 UNSUPPORTED_FILE_TYPE`. Double extensions (`a.pdf.exe`) are judged on the final extension. | `[BRD-021]` |
| FR-011.13 | **MIME validation:** the part's declared `Content-Type` is checked against the allow-list MIME set and against the MIME mapped to the extension. | `[BRD-021]` |
| FR-011.14 | **Content sniffing (magic bytes):** the first bytes of the streamed temp file are matched against the signature for the extension (PDF `%PDF-` at offset 0; JPEG `FF D8 FF`; PNG `89 50 4E 47 0D 0A 1A 0A`). The client-declared MIME is never trusted alone. | `[DERIVED]` from BRD-021 "server validates the MIME type"; mechanism `[PROPOSED]` |
| FR-011.15 | **Decision table (see 14.2):** extension not allowed -> `UNSUPPORTED_FILE_TYPE`; extension allowed but declared MIME or sniffed content does not match the extension -> `INVALID_FILE_TYPE`. | `[BRD-021]` codes; precedence `[PROPOSED]` TDD-011.02 |
| FR-011.16 | A zero-byte file returns `400 EMPTY_FILE`. | `[PROPOSED]` |
| FR-011.17 | The validated canonical MIME (from the allow-list, not from the client) is what is persisted in `documents.mime_type` and returned on retrieval. | `[PROPOSED]` |
| FR-011.18 | No malware/AV scanning and no content-disarming is performed. PDFs/images are accepted on type validity only. | `[BRD-OQ-08]` |
| FR-011.19 | Validation errors carry a clear `code` and `message` for frontend display (messages in 12.11). | `[BRD-021]` |

### 7.4 Size limit
| ID | Requirement | Tag |
|---|---|---|
| FR-011.20 | Maximum size is 5 MB per file: constant `DOCUMENT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 = 5,242,880`. A file of exactly 5,242,880 bytes is accepted; 5,242,881 is rejected. MB-as-MiB is an interpretation `[TDD-REQUIRED]` TDD-011.11. The value is a code constant, **not** an environment variable, so configuration cannot raise it. | `[BRD-021]`, `[BRD-038]` |
| FR-011.21 | Enforcement is server-side **while streaming**: the multipart parser's per-file byte limit is `MAX` and aborts the stream as soon as `MAX + 1` bytes are seen; the request is not buffered in memory. | `[BRD-021]` "server/API level"; mechanism `[PROPOSED]` |
| FR-011.22 | A `Content-Length` pre-check rejects early requests whose declared body exceeds `MAX + multipart overhead allowance` (default 64 KB) with `413 FILE_SIZE_EXCEEDED`. This is an optimisation, never the only control (chunked requests have no length). | `[PROPOSED]` |
| FR-011.23 | On over-limit the partial temp file is deleted, the connection is closed after the 413 response, nothing is written to final storage and no `documents` row is created. | `[BRD-021]` "invalid file is not stored" |
| FR-011.24 | Response: HTTP 413, `code: FILE_SIZE_EXCEEDED`. The multipart parser also limits fields (count, size) and parts to prevent abuse. | `[BRD-021]` |

### 7.5 Error contract
| ID | Requirement | Tag |
|---|---|---|
| FR-011.25 | `413 FILE_SIZE_EXCEEDED` for over-5 MB. | `[BRD-021]` |
| FR-011.26 | `415 UNSUPPORTED_FILE_TYPE` for unsupported type/format. | `[BRD-021]` |
| FR-011.27 | `415 INVALID_FILE_TYPE` for MIME/extension mismatch. | `[BRD-021]` |
| FR-011.28 | All three use the standard error envelope with a clear message (12.11). | `[BRD-021]`, envelope `[PROPOSED]` |
| FR-011.29 | Validation precedence (first failing check wins): authentication (401) -> authorisation (403) -> link target (404) -> stage (403) -> field validation (400) -> size (413) -> extension (415 UNSUPPORTED) -> MIME/sniff (415 INVALID). Size is checked while streaming, so a large wrong-type file reports 413. | `[PROPOSED]` TDD-011.02 |

### 7.6 Authorised retrieval
| ID | Requirement | Tag |
|---|---|---|
| FR-011.30 | Documents are retrievable **only** through the authenticated API endpoints of section 12. No route serves the storage directory (`express.static` is never mounted for it) and no storage path, signed URL or public URL is ever returned in any response. | `[BRD-021]` |
| FR-011.31 | Every view, download, list and metadata request evaluates, in order: authenticated user (401) -> role -> organisation scope -> resource (the associated employee/transfer) -> action (view/download/list) -> stage where applicable (BRD-026). Nothing is cached across requests; the check is re-run on every request, including repeat downloads of the same document. | `[BRD-021]`, `[BRD-026]` |
| FR-011.32 | The access decision is made on the **document's associated employee/transfer**, loaded from the database by document id, never from caller-supplied employee/transfer ids. | `[BRD-021]` "verifies that the requester may access the associated employee/transfer" |
| FR-011.33 | Out-of-scope or role-forbidden access returns `403 FORBIDDEN` with a generic message that exposes no employee, organisation or document details. | `[BRD-026]` |
| FR-011.34 | Unknown document id returns `404 DOCUMENT_NOT_FOUND`. Document ids are random UUIDv4 to resist enumeration. | `[PROPOSED]` |
| FR-011.35 | List endpoints apply the scope filter **in SQL** (not by post-filtering in memory) so counts and pagination do not leak out-of-scope existence. | `[PROPOSED]` |
| FR-011.36 | Super Admin may access all documents (Actors table: all configured data, subject to company policy). | `[BRD]` Actors table |
| FR-011.37 | **IT** receives only documents satisfying all of: document `visible_to_it = true` (or uploaded by that IT user as evidence); the document's transfer has an active IT task assigned to that IT user (or within its IT location scope and IT-controlled stage); status in `PENDING_IT_ACTION`/`PENDING_IT_FINAL_APPROVAL`/`BLOCKED-from-IT-stage`. IT metadata projection is minimal (id, category, file name, mime, size, uploaded_at; no description, no uploader identity, no employee profile fields). Rule is the default `[PROPOSED]`; the BRD fixes only "IT cannot access Employee documents outside its authorised scope". | `[BRD-021]`, `[BRD-014]`, `[BRD-039]`; rule `[TDD-REQUIRED]` TDD-011.07 |
| FR-011.38 | **Employee** access to documents about themselves: policy `[TDD-REQUIRED]` TDD-011.05; default: only documents flagged `visible_to_employee`, read-only, own `employee_id` only. | `[TDD-REQUIRED]` |
| FR-011.39 | **Reporting / Receiving Manager** visibility: `[TDD-REQUIRED]` TDD-011.06; default: documents flagged `visible_to_managers` of assigned employees (Reporting Manager) or requests routed to the manager's scope (Receiving Manager). | `[TDD-REQUIRED]` |

### 7.7 Storage
| ID | Requirement | Tag |
|---|---|---|
| FR-011.40 | Storage is a configured local server directory read from `DOCUMENT_STORAGE_ROOT` (absolute path). No default path is hard-coded. | `[BRD-021]` "configured local server storage"; env var `[PROPOSED]` |
| FR-011.41 | The root must be **outside the web root and the application tree** (not under `frontend/`, `backend/src`, `backend/dist`, `public/`, nor any directory served statically). A startup check resolves real paths and fails fast with a logged fatal error if the root is missing, not writable, a symlink into a forbidden tree, or equals/contains a served path. | `[BRD-021]` "never exposed through public URLs"; check `[PROPOSED]` |
| FR-011.42 | Stored object name is a generated `uuid v4` plus the canonical extension; the user-supplied name is never part of any filesystem path. Layout `<root>/<yyyy>/<mm>/<uuid>.<ext>`; `documents.storage_key` stores only the relative key. | `[PROPOSED]` |
| FR-011.43 | Temp uploads stream into `DOCUMENT_TEMP_DIR` (default `<root>/_tmp`, same volume so the final move is an atomic rename). Temp files are named by uuid, never by user input. | `[PROPOSED]` |
| FR-011.44 | File mode `0600` and directory mode `0700` on POSIX hosts; Windows hosts rely on directory ACL restricted to the service account (`[TDD-REQUIRED]` TDD-011.10). | `[PROPOSED]` |
| FR-011.45 | Storage failures (disk full, permission) return `503 DOCUMENT_STORAGE_UNAVAILABLE`, log the cause with the request id, and leave no partial file or row. | `[PROPOSED]` |
| FR-011.46 | Retrieval streams from disk via `fs.createReadStream` through the controller (not `res.sendFile` on a user-influenced path). Response headers: `Content-Type` from DB `mime_type`; `Content-Disposition` (`attachment` for download, `inline` for view; RFC 5987 `filename*` from the sanitised name); `X-Content-Type-Options: nosniff`; `Cache-Control: private, no-store`; `Content-Security-Policy: default-src 'none'; sandbox`; `Accept-Ranges: none`. | `[PROPOSED]` |

### 7.8 Immutability, no deletion
| ID | Requirement | Tag |
|---|---|---|
| FR-011.70 | No API deletes, overwrites or replaces a document. `DELETE`/`PUT` on document routes return `405 METHOD_NOT_ALLOWED`. | `[BRD-OQ-08]` (no deletion policy), `[DERIVED]` |
| FR-011.71 | DB trigger rejects `DELETE` on `documents` and `UPDATE` of immutable columns (everything except the three visibility flags and `updated_at`). | `[PROPOSED]` |
| FR-011.72 | Whether a superseding/replacement upload is permitted is `[TDD-REQUIRED]` TDD-011.08. Default: not in this phase; a corrected file is uploaded as a new document and the earlier one remains. Retention/archive jobs are **not** built. | `[TDD-REQUIRED]` |

### 7.9 Audit, orphans, hooks
| ID | Requirement | Tag |
|---|---|---|
| FR-011.50 | Audit events per section 18 are written for upload, view, download, rejected upload, access denial and visibility change. | `[BRD-021]`, `[BRD-022]`, `[BRD-026]` |
| FR-011.51 | A successful upload writes the DB row and the `DOCUMENT_UPLOADED` audit record in one transaction. | `[PROPOSED]` consistent with kernel rules |
| FR-011.52 | **Orphan handling:** the file is moved to its final key first; if the DB transaction then fails (or the requester disconnects before commit), a compensating `unlink` of the final file runs; if that also fails, the key is logged at ERROR and listed by the reconciler (TASK-011.10). No file is ever reachable without a row. | `[PROPOSED]` |
| FR-011.53 | A scheduled/CLI reconciler removes **temp** files older than `DOCUMENT_TEMP_MAX_AGE_MINUTES` and **reports** (and quarantines to `<root>/_orphans/`, never deletes) files in storage with no row and rows whose file is missing. Row-without-file download returns `500 DOCUMENT_FILE_MISSING` and logs critical. | `[PROPOSED]`; quarantine vs delete `[TDD-REQUIRED]` TDD-011.09 |
| FR-011.54 | Document-linked completion evidence for IT: documents may carry `it_task_id` (nullable, no FK until SPEC-009 ships `it_tasks`) and category `IT_COMPLETION_EVIDENCE`; `DocumentService.attachEvidence()` and `countByCategoryForTransfer()` are exposed to SPEC-009. Whether evidence is mandatory before IT completion is `[TDD-REQUIRED]` TDD-011.07 (BRD-014 says IT "can add ... completion evidence", i.e. optional). | `[BRD-014]`, mechanism `[TDD-REQUIRED]` |

### 7.10 Frontend and Documents module
| ID | Requirement | Tag |
|---|---|---|
| FR-011.60 | Admin "Documents" module lists documents the viewer may see with filters (category, employee, transfer reference, uploader, date range) and pagination, search by file name. | `[BRD-003]`, UI patterns `[PROPOSED]` |
| FR-011.61 | `DocumentUploader` component: select file, choose category, optional description, visibility toggles (HR/SA only), progress, success/failure state. | `[BRD-021]` |
| FR-011.62 | **Client-side pre-checks (UX only):** extension in allow-list, size <= 5 MB, non-empty; they never replace server checks and are not relied on for security. | `[BRD-021]` "does not rely on frontend restrictions" |
| FR-011.63 | Server errors are mapped by `code` (and by HTTP status when a proxy returns a non-JSON 413/415) to the clear messages of 13.4. | `[BRD-021]` |
| FR-011.64 | View and download use authenticated fetch -> Blob URL; no `<a href>` to a bare backend URL without credentials; Blob URLs are revoked after use. | `[PROPOSED]` |
| FR-011.65 | Components hide controls the role may not use (UX only); the backend remains authoritative. Empty, loading, no-access and error states are shown. | `[BRD-002]` states, `[BRD-026]` |

---

## 8. Internal Implementation Plan / Tasks
Order is dependency order. Layers: BE, FE, DB, QA.

| Task | Title | Layer | Description | Inputs / Outputs | Depends on | BRD refs |
|---|---|---|---|---|---|---|
| TASK-011.01 | `document_categories` migration + seed | DB | Create `document_categories(code PK, label, is_active, sort_order)`; seed `[PROPOSED]` catalogue (TDD-011.01). | In: SPEC-001 migration conventions. Out: migration `backend/src/migrations/<ts>-create-document-categories.ts`, seeder. | SPEC-001 | BRD-021 |
| TASK-011.02 | `documents` migration | DB | Create `documents` with constraints, indexes, immutability/no-delete trigger (section 10). | Out: migration `<ts>-create-documents.ts`. | TASK-011.01, SPEC-004/006 tables | BRD-021, BRD-OQ-08 |
| TASK-011.03 | Config + storage bootstrap | BE | Env vars, constants, startup path validation (outside web root, writable, real-path check), temp dir creation, permissions. | Out: `modules/documents/documents.config.ts`, `storage/storageBootstrap.ts`. | SPEC-001 config loader | BRD-021 |
| TASK-011.04 | Sequelize model + repository | BE | `Document` model, `DocumentRepository` (create within trx, getById, scoped list with SQL scope filter, counts). | Out: `models/document.model.ts`, `documents.repository.ts`. | TASK-011.02 | BRD-021 |
| TASK-011.05 | `FileTypePolicy` | BE | Allow-list table, extension/MIME/magic-byte checks, decision table, error code mapping (14.2). | Out: `validators/fileTypePolicy.ts`. | none | BRD-021 |
| TASK-011.06 | `FileNameSanitiser` + storage key generator | BE | Sanitisation algorithm (14.3), uuid key, path-traversal guard (`path.resolve` + prefix check). | Out: `validators/fileNameSanitiser.ts`, `storage/storageKey.ts`. | TASK-011.03 | BRD-021 |
| TASK-011.07 | Upload stream middleware | BE | Streaming multipart parser (`multer` disk storage on temp dir with `limits.fileSize`, `files:1`, `fields`, `parts`; or `busboy` directly), Content-Length pre-check, SHA-256 while streaming, abort/cleanup handlers, field-order rule. | Out: `middleware/uploadStream.ts`. | TASK-011.03, 011.05, 011.06 | BRD-021, BRD-038 |
| TASK-011.08 | Document error classes + multer/parser error mapper | BE | `FileSizeExceededError` (413), `UnsupportedFileTypeError`, `InvalidFileTypeError` (415), `EmptyFileError`, `DocumentStorageUnavailableError`, mapper for `LIMIT_*` errors. | Out: `documents.errors.ts`. | SPEC-001 errors | BRD-021 |
| TASK-011.09 | `DocumentAccessPolicy` | BE | Evaluate role -> scope -> resource -> action -> stage -> visibility flags; role projections (IT minimal). Uses `AuthorizationService` + `ScopeResolver`. | Out: `documents.accessPolicy.ts`. | SPEC-002, SPEC-003/004/006/007 | BRD-021, BRD-026, BRD-039 |
| TASK-011.10 | `DocumentService.upload` + compensation + reconciler | BE | Orchestrate: authorise -> stream/validate -> atomic rename -> trx(`FOR SHARE` transfer re-check, insert row, audit) -> compensating unlink; temp cleaner; reconciler CLI. | Out: `documents.service.ts`, `storage/reconciler.ts`. | TASK-011.04-09 | BRD-021 |
| TASK-011.11 | Upload controllers/routes | BE | Two upload routes, request validators (category, description, flags), response DTO. | Out: `documents.controller.ts`, `documents.routes.ts`, `documents.validators.ts`. | TASK-011.10 | BRD-021 |
| TASK-011.12 | List/metadata endpoints | BE | `GET` list by employee/transfer/global, metadata by id, categories endpoint, role projections, pagination/sort. | Out: controller/service methods. | TASK-011.04, 011.09 | BRD-021, BRD-003 |
| TASK-011.13 | View/download streaming endpoints | BE | Authorise, audit-first, stream with secure headers, file-missing handling. | Out: `GET /documents/:id/view`, `/download`. | TASK-011.09 | BRD-021 |
| TASK-011.14 | Visibility PATCH | BE | HR(in scope)/SA edit of the three flags, audited with previous/new. | Out: `PATCH /documents/:id/visibility`. | TASK-011.09 | BRD-021 `[PROPOSED]` |
| TASK-011.15 | Audit integration | BE | Emit the seven events of section 18 via `AuditService.record`; denial and rejected-upload events outside business trx; audit-failure policy for view/download (fail closed, TDD-011.12). | Out: `documents.audit.ts`. | SPEC-001 AuditService | BRD-022, BRD-026 |
| TASK-011.16 | No-delete / 405 guard | BE | Explicit `405` for `DELETE`/`PUT`/`PATCH` (other than visibility) on document routes; test that no delete code path exists. | Out: routes. | TASK-011.11 | BRD-OQ-08 |
| TASK-011.17 | IT evidence hook | BE | `attachEvidence`, `countByCategoryForTransfer`, `it_task_id` column handling, config flag `DOCUMENT_IT_EVIDENCE_UPLOAD_ENABLED` (default `false`). Coordinate with SPEC-009. | Out: service methods + contract note. | TASK-011.10 | BRD-014 `[TDD-REQUIRED]` |
| TASK-011.18 | FE API client, types, error map | FE | `documentsApi.ts`, `documentTypes.ts`, `documentErrors.ts` mapping codes/status to messages, upload via XHR/axios for progress. | Out: `frontend/src/lib/documents/`. | TASK-011.11 | BRD-021 |
| TASK-011.19 | `DocumentUploader` component | FE | Client pre-checks, category select, description, flags, progress, error states. | Out: `frontend/src/components/documents/DocumentUploader.tsx`. | TASK-011.18, SPEC-001 UI kit | BRD-021 |
| TASK-011.20 | `DocumentList` + preview/download | FE | List, per-row view/download via Blob, loading/empty/no-access/error states. | Out: `DocumentList.tsx`, `DocumentPreviewDialog.tsx`. | TASK-011.18 | BRD-021, BRD-022 |
| TASK-011.21 | Documents admin module | FE | Route `frontend/src/app/(admin)/documents/page.tsx` + `[documentId]/page.tsx`, filters, nav entry. | Out: pages. | TASK-011.20, SPEC-003 shell | BRD-003 |
| TASK-011.22 | Embedding adapters | FE | Thin wrappers consumed by SPEC-008 (transfer detail), SPEC-004 (employee profile), SPEC-009 (IT task). | Out: `components/documents/index.ts`. | TASK-011.19-20 | BRD-013, BRD-014 |
| TASK-011.23 | Backend unit tests | QA | FileTypePolicy, sanitiser, storage key, access policy, size boundary. | `tests/backend/documents/unit/` | TASK-011.05-09 | BRD-021 |
| TASK-011.24 | Backend API/integration/security tests | QA | Upload/retrieve/list/audit/orphan/atomicity, role x scope matrix, IT negative, 401/403/404. | `tests/backend/documents/api/`, `.../security/` | TASK-011.10-17 | BRD-021, BRD-039 |
| TASK-011.25 | Concurrency & failure-injection tests | QA | Stage change during upload, DB failure after rename, client abort, disk-full. | `tests/backend/documents/concurrency/` | TASK-011.10 | BRD-021 |
| TASK-011.26 | Frontend tests | QA | Pre-checks, error mapping 413/415, role-hidden controls, Blob download. | `tests/frontend/documents/` | TASK-011.19-22 | BRD-021 |
| TASK-011.27 | Negative/BRD-039 suite + traceability handoff | QA | NAC01-NAC20 automated; export TC list to SPEC-016. | `tests/backend/documents/negative/` | TASK-011.24 | BRD-039 |

---

## 9. Business Rules
| ID | Rule | Tag |
|---|---|---|
| BR-011.01 | Only HR uploads in the BRD; no other role is assumed to upload except where a TDD explicitly decides. | `[BRD-021]`, `[DERIVED]` |
| BR-011.02 | Allowed formats PDF and image; max 5 MB per file; extension and MIME validated; names sanitised. | `[BRD-021]` |
| BR-011.03 | Storage is local server storage; no malware scanning; no retention, archive or deletion policy. | `[BRD-OQ-08]` |
| BR-011.04 | Access follows role and organisation scope; no user automatically gains access to all employee documents (Super Admin excepted by the Actors table). | `[BRD]` Business Rules |
| BR-011.05 | Each view/download re-verifies access to the associated employee/transfer. | `[BRD-021]` |
| BR-011.06 | IT sees only minimum information required for its task. | `[BRD]` Business Rules, `[BRD-014]` |
| BR-011.07 | Invalid uploads are never stored. | `[BRD-021]` |
| BR-011.08 | Uploading, viewing or downloading a document never changes a transfer's workflow status, vacancy or tasks. | `[DERIVED]` (no BRD-027 matrix row involves documents) |
| BR-011.09 | Documents are never exposed via public URLs. | `[BRD-021]` |
| BR-011.10 | Document actions are audited, with denials treated as security events. | `[BRD-021]`, `[BRD-026]` |
| BR-011.11 | Visibility flags only **narrow** access for Employee/Managers/IT; they never widen it beyond the scope checks. | `[PROPOSED]` |

## 10. Data Model & Database

### 10.1 `document_categories` `[PROPOSED]`
| Column | Type | Constraint |
|---|---|---|
| code | VARCHAR(40) | PK, UPPER_SNAKE |
| label | VARCHAR(100) | NOT NULL |
| is_active | BOOLEAN | NOT NULL DEFAULT true |
| sort_order | INT | NOT NULL DEFAULT 0 |

### 10.2 `documents` `[PROPOSED]`
| Column | Type | Constraint / note |
|---|---|---|
| id | UUID | PK, `gen_random_uuid()` |
| employee_id | (type of `employee_profiles` PK) | NOT NULL, FK -> `employee_profiles` (always set; derived from transfer when linked) |
| transfer_request_id | (type of `transfer_requests` PK) | NULL, FK -> `transfer_requests` |
| category_code | VARCHAR(40) | NOT NULL, FK -> `document_categories.code` |
| original_file_name | VARCHAR(255) | NOT NULL, **sanitised** name (display only) |
| file_extension | VARCHAR(10) | NOT NULL, lowercase, CHECK in allow-list |
| mime_type | VARCHAR(100) | NOT NULL, canonical validated MIME |
| size_bytes | BIGINT | NOT NULL, CHECK `size_bytes > 0 AND size_bytes <= 5242880` (DB-level backstop for BRD-038) |
| sha256 | CHAR(64) | NOT NULL |
| storage_key | VARCHAR(255) | NOT NULL UNIQUE, relative key; never an absolute path |
| description | VARCHAR(500) | NULL |
| uploaded_by_user_id | uuid | NOT NULL, FK -> `users(id)` [RECONCILED] uuid PK per SPEC-002 |
| uploaded_by_role | VARCHAR(30) | NOT NULL (role at upload time) |
| uploaded_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| transfer_status_at_upload | VARCHAR(50) | NULL (status code snapshot) |
| it_task_id | UUID | NULL, no FK until SPEC-009 adds it `[TDD-REQUIRED]` |
| visible_to_employee | BOOLEAN | NOT NULL DEFAULT false |
| visible_to_managers | BOOLEAN | NOT NULL DEFAULT false |
| visible_to_it | BOOLEAN | NOT NULL DEFAULT false |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

Constraints: `CHECK (employee_id IS NOT NULL OR transfer_request_id IS NOT NULL)` (redundant with NOT NULL on employee_id but documents the BRD "and/or" intent). Indexes: `(employee_id, uploaded_at DESC)`, `(transfer_request_id, uploaded_at DESC)`, `(category_code)`, `(uploaded_by_user_id, uploaded_at)`, `(uploaded_at DESC)`. Trigger `documents_immutable` (BEFORE UPDATE/DELETE): `DELETE` always raises; `UPDATE` may only change `visible_to_*` and `updated_at`.

No data deletion, no soft-delete column, no retention fields (BRD-OQ-08). Superseding columns are intentionally absent (TDD-011.08); adding them later is an additive migration.

### 10.3 Migration & storage notes
Migrations are reversible except the trigger (down drops the trigger then the table); the storage directory is not touched by migrations. Seeds are idempotent upserts keyed by `code`.

## 11. Backend Implementation
```
backend/src/modules/documents/
  documents.routes.ts       documents.controller.ts   documents.service.ts
  documents.repository.ts   documents.accessPolicy.ts documents.audit.ts
  documents.errors.ts       documents.config.ts       documents.dto.ts
  middleware/uploadStream.ts
  storage/storageBootstrap.ts  storage/storageKey.ts  storage/reconciler.ts
  validators/fileTypePolicy.ts validators/fileNameSanitiser.ts validators/documents.validators.ts
```
Layering follows SPEC-001: controller (HTTP only) -> service (orchestration) -> repository (Sequelize). Controllers contain no file-system or SQL code.

### 11.1 Upload sequence (`DocumentService.upload`)
1. Auth middleware (SPEC-002) -> 401.
2. Route param validation (UUID) -> 400.
3. `DocumentAccessPolicy.assertCanUpload(ctx, target)` -> role/scope/resource/stage (403) before the body is read.
4. `Content-Length` pre-check (413 early).
5. `uploadStream` streams the single `file` part to `DOCUMENT_TEMP_DIR/<uuid>.part` computing SHA-256 and byte count; text fields (`category`, `description`, flags) must arrive **before** the file part, otherwise `400 VALIDATION_ERROR` (field-order rule, so category validation precedes any file write). Over `MAX` -> abort, unlink, 413.
6. `FileTypePolicy.validate(sanitisedName, declaredMime, tempFilePath)` -> 415/400; on failure unlink temp, write `DOCUMENT_UPLOAD_REJECTED` audit, return error.
7. Generate storage key; `fs.rename` temp -> final (same volume; `copy + fsync + unlink` fallback if cross-volume).
8. `withTransaction`: re-run stage check with `SELECT ... FOR SHARE` on the `transfer_requests` row, re-check scope, insert `documents`, `AuditService.record(DOCUMENT_UPLOADED, {trx})`.
9. On commit return `201` DTO. On any failure in 8: `unlink` final file (compensation), log, map error.
10. `finally`: ensure temp file removed; handle `req.on('aborted'/'close')` by cleaning the temp and any final file.

### 11.2 Retrieval sequence (`view`/`download`)
Auth -> load document by id (404) -> `DocumentAccessPolicy.assertCanRead(ctx, doc, action)` (403 + `DOCUMENT_ACCESS_DENIED` audit) -> `AuditService.record(DOCUMENT_VIEWED|DOCUMENT_DOWNLOADED)` (before streaming) -> open read stream (error -> 500 `DOCUMENT_FILE_MISSING`) -> set headers (7.7) -> pipe; stream errors are logged and the response is destroyed.

### 11.3 Libraries `[PROPOSED]`
`multer` (v2, Express 5 compatible; verify in TASK-011.07) or `busboy`; own signature table for the initial three types, `file-type` only if TDD-011.02 broadens the list (ESM-only; verify against the TS module setting). `crypto` for SHA-256/uuid. No `eval`, no shelling out to `file`/`mime` binaries.

### 11.4 Logging
Winston/Pino structured logger from SPEC-001. Log: request id, user id, role, document id, outcome, error code, byte count. Never log file content, absolute storage paths in client-visible output, tokens, or the raw (unsanitised) file name (log only the sanitised name).

## 12. API Requirements
Base `/api/v1`. All endpoints require authentication (401 otherwise). Success envelope `{ "success": true, "data": ..., "meta": ... }`; error envelope per contract. `requestId` echoed.

### 12.1 `POST /api/v1/transfers/:transferId/documents` `[PROPOSED]`
[RECONCILED R-11] Path was `/transfer-requests/:transferRequestId/documents`; aligned to the `/transfers/:transferId/...` convention used by SPEC-007/008/009/010/005. Upload surfaces elsewhere are facades over this service: SPEC-008 HR activity `UPLOAD_DOCUMENTS` and SPEC-009 `POST /it/tasks/:taskId/evidence` call `DocumentService.upload` (no second upload implementation).
| Item | Value |
|---|---|
| Purpose | Upload a document linked to a transfer request (and its employee). |
| Auth | JWT. |
| Authz | Role `HR` (or `SUPER_ADMIN` per TDD-011.04, or `IT` per TDD-011.07 with category `IT_COMPLETION_EVIDENCE`); HR: transfer's employee in HR scope; stage in the upload stage set (FR-011.06). |
| Request | `multipart/form-data`; fields in this order: `category` (required, catalogue code), `description` (optional), `visibleToEmployee`/`visibleToManagers`/`visibleToIt` (optional booleans, default false); then `file` (exactly one). |
| Response `201` | `{ "success": true, "data": { "id": "uuid", "employeeId": "...", "transferRequestId": "...", "transferReference": "...", "category": "TRANSFER_SUPPORTING", "fileName": "offer-letter.pdf", "mimeType": "application/pdf", "sizeBytes": 183201, "uploadedBy": { "userId": "HR000012", "role": "HR" }, "uploadedAt": "2026-10-06T09:30:00Z", "visibility": { "employee": false, "managers": false, "it": false } } }` |
| Validation | 14.1. |
| Errors | 400 `VALIDATION_ERROR`/`FILE_REQUIRED`/`TOO_MANY_FILES`/`EMPTY_FILE`; 401; 403 `FORBIDDEN` / `DOCUMENT_ACTION_NOT_PERMITTED_AT_STAGE`; 404 `TRANSFER_REQUEST_NOT_FOUND`; 413 `FILE_SIZE_EXCEEDED`; 415 `UNSUPPORTED_FILE_TYPE`; 415 `INVALID_FILE_TYPE`; 503 `DOCUMENT_STORAGE_UNAVAILABLE`; 500. |

### 12.2 `POST /api/v1/employees/:employeeId/documents` `[PROPOSED]`
Same as 12.1 with `transferRequestId` null. Authz: HR with the employee in scope; at any time (organisation documents) except the employee being outside scope. Errors: 404 `EMPLOYEE_NOT_FOUND`; stage errors do not apply.

### 12.3 `GET /api/v1/transfers/:transferId/documents`
Purpose: list metadata of documents the caller may see for a transfer. Authz: per 6.1 (SQL scope filter). Query: `page, pageSize (default 20, max 100), sort (uploadedAt|category|fileName), order, category`. Response: array of DTO (role projection) + `meta{page,pageSize,total}`. Errors: 401, 403 (caller has no access to the transfer at all), 404.

### 12.4 `GET /api/v1/employees/:employeeId/documents`
As 12.3 for an employee. Employee caller may only pass their own id (403 otherwise).

### 12.5 `GET /api/v1/documents`
Documents module list. Authz: `SUPER_ADMIN` (all), `HR` (in scope); other roles `403` here `[PROPOSED]` (they use 12.3/12.4). Query: `page,pageSize,sort,order,q (file name), category, employeeId, transferReference, uploadedBy, uploadedFrom, uploadedTo`. Response: DTO list + meta.

### 12.6 `GET /api/v1/documents/:documentId`
Metadata by id; access via `assertCanRead(action=view)`; **does not** audit as view (metadata only) `[TDD-REQUIRED]` TDD-011.12 whether metadata reads are audited (default: no; content access only). Errors 401/403/404.

### 12.7 `GET /api/v1/documents/:documentId/view`
Streams content with `Content-Disposition: inline`. Authz: full chain, audit `DOCUMENT_VIEWED`. Errors 401/403/404/500 `DOCUMENT_FILE_MISSING`. `HEAD` is treated as `GET` for authorisation and audit.

### 12.8 `GET /api/v1/documents/:documentId/download`
As 12.7 with `Content-Disposition: attachment`; audit `DOCUMENT_DOWNLOADED`.

### 12.9 `PATCH /api/v1/documents/:documentId/visibility`
Request `{ "visibleToEmployee": bool, "visibleToManagers": bool, "visibleToIt": bool }` (at least one). Authz: `SUPER_ADMIN`, `HR` in scope. Response: updated DTO. Audit `DOCUMENT_VISIBILITY_CHANGED` (previous/new). Errors 400/401/403/404.

### 12.10 `GET /api/v1/document-categories`
Authenticated; returns active categories (`code`, `label`). Used by the uploader and filters.

### 12.11 Error messages `[PROPOSED]`
| HTTP | Code | Message |
|---|---|---|
| 413 | `FILE_SIZE_EXCEEDED` | "The uploaded file exceeds the maximum allowed size of 5 MB." |
| 415 | `UNSUPPORTED_FILE_TYPE` | "Unsupported file type. Only PDF and image files (PDF, JPG, JPEG, PNG) are allowed." |
| 415 | `INVALID_FILE_TYPE` | "The file content or type does not match its file extension. Please upload a valid PDF or image file." |
| 400 | `EMPTY_FILE` | "The uploaded file is empty." |
| 403 | `FORBIDDEN` | "You do not have permission to perform this action." (no resource detail) |
| 403 | `DOCUMENT_ACTION_NOT_PERMITTED_AT_STAGE` | "Documents cannot be uploaded for the current transfer status." |
| 404 | `DOCUMENT_NOT_FOUND` | "The requested document was not found." |
| 503 | `DOCUMENT_STORAGE_UNAVAILABLE` | "Document storage is temporarily unavailable. Please try again." |
Error `details[]` may include `{ "field": "file", "maxBytes": 5242880, "allowedExtensions": ["pdf","jpg","jpeg","png"] }` (no filesystem paths).

## 13. Frontend Implementation

### 13.1 Routes and components `[PROPOSED]`
| Path / component | Purpose |
|---|---|
| `frontend/src/app/(admin)/documents/page.tsx` | Documents module list (SA, HR). |
| `frontend/src/app/(admin)/documents/[documentId]/page.tsx` | Metadata + preview/download. |
| `frontend/src/components/documents/DocumentUploader.tsx` | Upload form with pre-checks and progress. |
| `.../DocumentList.tsx`, `.../DocumentPreviewDialog.tsx`, `.../DocumentVisibilityToggles.tsx`, `.../DocumentCategorySelect.tsx` | Reusable parts. |
| `frontend/src/lib/documents/{documentsApi,documentTypes,documentErrors,validateFileClientSide}.ts` | Client logic. |

### 13.2 Behaviour
Uploader fields are appended to `FormData` **before** the file (server field-order rule). Progress via XHR/axios `onUploadProgress`; cancel via abort. Upload button disabled while in flight; one file at a time. After success the list refreshes.

### 13.3 Client pre-checks (UX only)
Extension in `pdf, jpg, jpeg, png` (same list as the server, served from `GET /document-categories` response meta or a shared constant), `file.size <= 5 * 1024 * 1024`, `file.size > 0`. Failure shows the same wording as the server messages and does not send the request. Passing pre-checks guarantees nothing.

### 13.4 Error mapping
| Signal | UI message |
|---|---|
| 413 or `FILE_SIZE_EXCEEDED` | "This file is larger than 5 MB. Please upload a smaller file." |
| 415 `UNSUPPORTED_FILE_TYPE` | "This file type is not supported. Please upload a PDF or an image (JPG, JPEG, PNG)." |
| 415 `INVALID_FILE_TYPE` | "The file does not match its extension. Please upload a genuine PDF or image file." |
| 401 | Session-expired flow of SPEC-002 (redirect to login). |
| 403 | No-access state without exposing details. |
| 404 | "Document not found." |
| 503 / network | Retry affordance. |
A 413/415 whose body is not JSON (reverse proxy) is mapped by status alone.

### 13.5 View / download
`fetch` with credentials -> `Blob` -> `URL.createObjectURL`; images in `<img>`, PDFs in `<iframe sandbox>` or a new tab; download via temporary `<a download>`. `URL.revokeObjectURL` on close/unmount. Document ids are never turned into guessable static links.

### 13.6 Accessibility & states
Labels, `aria-live` for upload result, keyboard-operable drag-and-drop alternative (file input), loading/empty/no-access/error states `[BRD-002]`, `[NFR-008]`.

## 14. Validation Rules

### 14.1 Request validation
| Field | Rule |
|---|---|
| `transferRequestId` / `employeeId` / `documentId` | UUID (or the PK type of the respective table); invalid -> 400. |
| `category` | Required; must exist and `is_active`. |
| `description` | Optional; <= 500 chars; control chars stripped. |
| `visibleTo*` | Optional booleans; non-boolean -> 400. |
| `file` | Exactly one part; non-empty; <= 5,242,880 bytes; see 14.2. |
| Unknown fields | Rejected with 400 (strict schema). |
| Multipart limits | `files=1`, `fields<=6`, `fieldSize<=2 KB`, `parts<=8`, file name length <= 255 before sanitisation. |

### 14.2 File-type decision table `[PROPOSED]` (initial allow-list)
| Condition (evaluated in order) | Result |
|---|---|
| Size > 5,242,880 (streaming) | 413 `FILE_SIZE_EXCEEDED` |
| Size = 0 | 400 `EMPTY_FILE` |
| Final extension missing or not in {pdf, jpg, jpeg, png} | 415 `UNSUPPORTED_FILE_TYPE` |
| Declared MIME is not the MIME mapped to the extension (e.g. `.pdf` with `image/png`, or `application/octet-stream`) | 415 `INVALID_FILE_TYPE` |
| Sniffed signature does not match the extension's signature (includes unrecognised content, e.g. an executable named `.pdf`) | 415 `INVALID_FILE_TYPE` |
| All match | Accept; persist canonical MIME |
Notes: `.jpg` and `.jpeg` both map to `image/jpeg`; declared `image/jpg` is treated as non-matching `[PROPOSED]` (strict) — TDD-011.02. Declared `application/octet-stream` is rejected (strict) for the same reason.

### 14.3 File-name sanitisation `[PROPOSED]`
1. Unicode NFC normalise. 2. Take the last path segment after splitting on `/` and `\` (strips traversal such as `..\..\x.pdf`). 3. Reject/strip NUL and control characters. 4. Replace `< > : " / \ | ? *` and characters outside letters, digits, space, `.`, `_`, `-`, `(`, `)` with `_`. 5. Collapse whitespace; trim leading/trailing dots and spaces. 6. Reject Windows reserved base names (`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9`) by prefixing `_`. 7. Cap total length at 100 characters, preserving the extension. 8. If the result has no base name use `document`. The sanitised name is display metadata only; the stored object name is generated (FR-011.42) and a path-containment check (`resolved.startsWith(root + sep)`) guards every disk operation.

## 15. Authorization & Security Rules
1. **Check chain per BRD-026** on every document endpoint: Authenticated user -> Role -> Organisation scope -> Resource (the document's associated employee/transfer) -> Action (upload/view/download/list/update visibility) -> stage (upload only).
2. The backend is authoritative; frontend hiding is UX only. Postman/direct calls behave identically.
3. Denials: `403 FORBIDDEN` with no restricted data; recorded as `DOCUMENT_ACCESS_DENIED` security audit event (BRD-026).
4. **No public URLs**: storage path never returned; no static mount; Blob delivery only through authenticated endpoints.
5. **Header hardening**: `nosniff`, `no-store`, restrictive CSP, `inline` only for validated MIME.
6. **Path traversal**: generated keys, containment check, no user-controlled path component.
7. **Zip-bomb/decompression and polyglot files**: out of scope beyond magic-byte checks (no AV, BRD-OQ-08); documented residual risk for SPEC-015.
8. **Enumeration**: UUID ids; 403 for out-of-scope before 404 for link targets on upload; for retrieval of an existing id the order is 404 (unknown) vs 403 (exists but forbidden), accepted trade-off because ids are unguessable `[PROPOSED]`.
9. **Rate/abuse**: global rate limiting is SPEC-002/015; this SPEC contributes multipart caps and temp-file cleanup.
10. **Secrets**: storage path comes from env, never logged to clients; no credentials in audit.
11. **IT least privilege**: minimal projection and task-scoped filter (FR-011.37).
12. **TLS**: transport encryption is NFR-004 / SPEC-015 (TDD (o)); this SPEC assumes it.

## 16. Workflow / State Transition Rules
Documents add **no** transitions, statuses or actions to the BRD-027 matrix `[DERIVED]`.
| Aspect | Rule |
|---|---|
| Upload stage gate | FR-011.06; check uses the status code from SPEC-007 and is re-checked inside the commit transaction. |
| Final statuses | No new uploads on `COMPLETED`, `REJECTED`, `WITHDRAWN`, `CANCELLED` (default `[TDD-REQUIRED]` TDD-011.03); existing documents remain viewable by permitted roles. |
| `BLOCKED` | No upload (normal processing stopped, BRD-027); view/download follow normal access. |
| IT stages | IT access window only while an IT task is assigned and the transfer is in an IT-controlled stage (default). |
| Reassignment | When SPEC-010 reassigns an IT task, the previous IT user loses access to the documents that depended on the task assignment (access is recomputed per request), mirroring "can no longer act" `[DERIVED]` from BRD-035. |
| Completion | Document presence never gates completion (BRD completion rule lists five conditions, none about documents); evidence-before-IT-complete is `[TDD-REQUIRED]` TDD-011.07 (default not required). |

## 17. Transaction & Concurrency Rules
| Scenario | Rule |
|---|---|
| Upload atomicity | Final-file move then single DB transaction (row + audit); failure -> compensating unlink (FR-011.52). A row never exists without its file; a file without a row is a transient state bounded by the compensation and reconciler. |
| Stage change race | Stage and scope are re-validated inside the transaction with `SELECT ... FOR SHARE` on the transfer row; a transfer that became final/blocked during upload yields 403 `DOCUMENT_ACTION_NOT_PERMITTED_AT_STAGE` and the file is removed. (Row lock mode `FOR SHARE` does not block readers and blocks the status-changing writer briefly; it is not held during file streaming.) |
| Client abort mid-upload | `close`/`aborted` handlers delete temp (and final) file; no row. |
| Parallel uploads of the same file | Both succeed as separate documents (no dedup); `sha256` stored `[TDD-REQUIRED]` TDD-011.13 whether to warn on duplicates. |
| Download during visibility change | Each request evaluates current flags; no caching; a flag removed mid-stream does not interrupt an already-authorised stream. |
| Temp-file cleaner vs active upload | Cleaner only touches files older than `DOCUMENT_TEMP_MAX_AGE_MINUTES` (default 60) and skips files open in the current process registry. |
| Audit write failure on view/download | Fail closed: content is not streamed if the `DOCUMENT_VIEWED/DOWNLOADED` audit write fails (503); `[TDD-REQUIRED]` TDD-011.12. |
Notification delivery is not involved (none required, section 19).

## 18. Audit Requirements
All events use `AuditService.record` (SPEC-001); fields always include actor user id, role, action, timestamp, request id, outcome, and never contain file content, absolute paths, tokens or credentials.
| Event code `[PROPOSED]` | Trigger | Fields captured | BRD |
|---|---|---|---|
| `DOCUMENT_UPLOADED` | Successful upload commit | uploaded by (user id, role), upload date/time, document id, category, sanitised file name, MIME, size, sha256, employee id, transfer request id + reference, transfer status at upload, visibility flags | BRD-021, BRD-022 |
| `DOCUMENT_UPLOAD_REJECTED` | Validation failure (413/415/400 file errors) after authorisation | actor, role, target employee/transfer, category, sanitised file name, declared MIME, size observed, error code, reason | BRD-021, BRD-022 (`[TDD-REQUIRED]` TDD-011.12 whether to audit; default yes) |
| `DOCUMENT_UPLOAD_FAILED` | Storage/DB failure after validation | actor, target, error class, request id | BRD-022 |
| `DOCUMENT_VIEWED` | `GET .../view` authorised, before streaming | viewer (user id, role), view date/time, document id, category, employee id, transfer reference, uploaded-by, upload date/time | BRD-021 |
| `DOCUMENT_DOWNLOADED` | `GET .../download` authorised | same as viewed | BRD-021 |
| `DOCUMENT_ACCESS_DENIED` | 403 on any document endpoint | user, role, attempted action, document id (or target ids), reason code (`ROLE`, `SCOPE`, `STAGE`, `VISIBILITY`), date/time | BRD-026 (security event) |
| `DOCUMENT_VISIBILITY_CHANGED` | Visibility PATCH | actor, document id, previous flags, new flags | BRD-022 |
Reconciler actions (quarantine, temp cleanup) are operational logs, not business audit events.

## 19. Notification Requirements
| Event | Recipient | Channel | Trigger task | BRD |
|---|---|---|---|---|
| (none) | — | — | — | None of the twelve mandatory BRD-036 events concerns documents; this SPEC introduces no notification. Notifying an Employee or IT of a new document is not in the BRD and is not assumed (`[TDD-REQUIRED]` TDD-011.14, default none). |

## 20. Error & Edge Cases
| Case | Behaviour |
|---|---|
| Exactly 5,242,880 bytes | Accepted. |
| 5,242,881 bytes | 413, temp deleted, no row. |
| No `Content-Length` (chunked) | Streaming counter still enforces 5 MB. |
| Reverse proxy cuts the body first | Non-JSON 413; frontend maps by status; deployment must align proxy limit with 5 MB + overhead (SPEC-015). |
| Renamed executable `x.exe -> x.pdf` | 415 `INVALID_FILE_TYPE`. |
| `x.pdf.exe` | 415 `UNSUPPORTED_FILE_TYPE`. |
| `x.PDF` uppercase | Accepted, extension stored lowercase. |
| Name `../../etc/passwd.pdf` / `a\b.pdf` | Sanitised to `passwd.pdf` / `b.pdf`; storage key unaffected. |
| Unicode / RTL-override characters in name | Control/format chars stripped; NFC normalised. |
| File part before metadata fields | 400 `VALIDATION_ERROR` (field-order rule). |
| Two file parts | 400 `TOO_MANY_FILES`; temp removed. |
| Disk full / storage unwritable | 503; temp removed; no row. |
| DB failure after rename | Compensating unlink; if unlink fails, ERROR log + reconciler. |
| Transfer finalised during upload | 403 stage error; file removed. |
| Row exists but file missing | 500 `DOCUMENT_FILE_MISSING`, critical log. |
| Employee deactivated | Document remains; access by in-scope roles continues; the deactivated user's own access ends (SPEC-002). |
| Employee/HR scope changes after upload | Access recomputed per request; no stale grants. |
| Client disconnect during download | Stream destroyed; audit already recorded (access granted). |
| Concurrent identical uploads | Two documents; see TDD-011.13. |
| Request with `Range` header | Ignored (`Accept-Ranges: none`). |
| 0-byte file | 400 `EMPTY_FILE`. |

## 21. Acceptance Criteria
| ID | Given / When / Then | BRD |
|---|---|---|
| SPEC-011.AC01 | **Given** an HR user in scope of a transfer in `HR_PROCESSING`, **when** they upload a valid 1 MB PDF with a category, **then** `201` is returned and the document is linked to the transfer and its employee. | BRD-021 |
| SPEC-011.AC02 | **Given** an in-scope HR user, **when** they upload a valid PNG to an employee (no transfer), **then** `201` and `transfer_request_id` is null. | BRD-021 |
| SPEC-011.AC03 | **Given** a stored document, **when** its metadata is read by an authorised user, **then** category, uploader, upload timestamp, employee reference and transfer reference are present. | BRD-021 |
| SPEC-011.AC04 | **Given** a valid `.pdf`, `.jpg`, `.jpeg`, `.png` file with matching MIME and signature, **when** uploaded, **then** each is accepted. | BRD-021 |
| SPEC-011.AC05 | **Given** the server, **when** a file is uploaded, **then** extension, declared MIME and magic bytes are all validated server-side regardless of any client check. | BRD-021 |
| SPEC-011.AC06 | **Given** a hostile file name (`../../x.pdf`), **when** uploaded, **then** the stored name is generated, the display name sanitised and no file is created outside the storage root. | BRD-021 |
| SPEC-011.AC07 | **Given** a 5,242,881-byte file, **when** uploaded, **then** HTTP 413 `FILE_SIZE_EXCEEDED` is returned, nothing is stored, no row exists and no temp file remains; a 5,242,880-byte file is accepted. | BRD-021, BRD-038 |
| SPEC-011.AC08 | **Given** a `.exe` file, **when** uploaded, **then** HTTP 415 `UNSUPPORTED_FILE_TYPE` with a clear message; **given** an executable renamed `.pdf`, **then** HTTP 415 `INVALID_FILE_TYPE`; neither is stored. | BRD-021 |
| SPEC-011.AC09 | **Given** `DOCUMENT_STORAGE_ROOT` outside the web root, **when** an upload succeeds, **then** the file exists under that root with a generated name and no route serves the directory. | BRD-021 |
| SPEC-011.AC10 | **Given** an unauthenticated request, **when** it calls any document endpoint, **then** 401. | BRD-026 |
| SPEC-011.AC11 | **Given** an in-scope HR user, **when** they download a document, **then** the bytes stream with `Content-Disposition: attachment`, correct MIME and `no-store`. | BRD-021 |
| SPEC-011.AC12 | **Given** a Super Admin, **when** they list `/documents`, **then** all documents are visible with filters and pagination. | BRD-003, BRD-021 |
| SPEC-011.AC13 | **Given** an IT user assigned an IT task for transfer T in `PENDING_IT_ACTION` and a document flagged `visible_to_it`, **when** they list/download it, **then** it is returned with the minimal projection. | BRD-014, BRD-021 |
| SPEC-011.AC14 | **Given** a document, **when** the same authorised user downloads it twice, **then** authorisation is evaluated both times (a scope change between the two calls is honoured). | BRD-021 |
| SPEC-011.AC15 | **Given** a successful upload, **when** audit logs are queried, **then** a `DOCUMENT_UPLOADED` record shows uploader, date/time, category, employee and transfer reference. | BRD-021, BRD-022 |
| SPEC-011.AC16 | **Given** a view and a download, **then** `DOCUMENT_VIEWED` and `DOCUMENT_DOWNLOADED` records exist with viewer, time, document, employee and transfer. | BRD-021 |
| SPEC-011.AC17 | **Given** a DB failure injected after the file move, **when** the upload runs, **then** the final file is removed, no row exists and the error is logged. | BRD-021 |
| SPEC-011.AC18 | **Given** the frontend, **when** the server returns 413/415/415, **then** the matching clear message is shown and no success state appears. | BRD-021 |
| SPEC-011.AC19 | **Given** a client-side check passes, **when** the server rejects the file, **then** the server decision wins. | BRD-021 |
| SPEC-011.AC20 | **Given** the API surface, **then** no endpoint deletes or replaces a document and `DELETE`/`PUT` return 405. | BRD-OQ-08 |
| SPEC-011.AC21 | **Given** an HR user toggles `visible_to_employee`, **then** the change is saved and audited with previous/new values. | BRD-022 |
| SPEC-011.AC22 | **Given** an Employee/Manager and the TDD-011.05/06 defaults, **then** they see only documents flagged for them, only within their own/assigned scope. | NFR-007 |

## 22. Negative Acceptance Criteria
| ID | Given / When / Then | BRD-039 / BRD |
|---|---|---|
| SPEC-011.NAC01 | **Given** an IT user with no task for transfer T, **when** they request a document of T by id, **then** 403 and `DOCUMENT_ACCESS_DENIED`. | BRD-039 Security row "IT cannot access Employee documents outside its authorised scope" |
| SPEC-011.NAC02 | **Given** an IT user with a task for T, **when** they request a document not flagged `visible_to_it`, **then** 403. | same |
| SPEC-011.NAC03 | **Given** an IT user whose task was reassigned away, **when** they request the document, **then** 403. | same, BRD-035 |
| SPEC-011.NAC04 | **Given** an HR user of Location A, **when** they request a document of an employee in Location B, **then** 403 with no restricted data. | BRD-039 Security row 1 |
| SPEC-011.NAC05 | **Given** the same out-of-scope HR user, **when** they list `/documents`, **then** only in-scope rows and counts are returned. | BRD-039 Security row 1 |
| SPEC-011.NAC06 | **Given** Employee E1, **when** they request a document of Employee E2 (any category), **then** 403. | BRD-039 Security row 2 (document slice) |
| SPEC-011.NAC07 | **Given** a direct API call (Postman) without a token, **then** 401. | BRD-039 Security row 8 |
| SPEC-011.NAC08 | **Given** a direct call with a valid token of the wrong role (Employee uploading), **then** 403 and no file stored. | BRD-039 Security row 8 |
| SPEC-011.NAC09 | **Given** a UI-hidden control, **when** the API is called directly, **then** the same denial applies. | BRD-026 |
| SPEC-011.NAC10 | **Given** a Reporting Manager of another employee, **then** 403 (TDD-011.06 default). | NFR-007 |
| SPEC-011.NAC11 | **Given** a request path `/uploads/<key>`, `/static/...` or the storage key, **then** 404 — no public route. | BRD-021 |
| SPEC-011.NAC12 | **Given** a transfer in `COMPLETED`, **when** HR uploads, **then** 403 `DOCUMENT_ACTION_NOT_PERMITTED_AT_STAGE`. | BRD-039 Workflow "Completed cannot be modified" (TDD-011.03) |
| SPEC-011.NAC13 | **Given** a transfer in `PENDING_REPORTING_MANAGER_APPROVAL`, **when** HR uploads, **then** 403 stage error. | BRD-026 action/stage |
| SPEC-011.NAC14 | **Given** a spoofed `Content-Type: application/pdf` on a non-PDF payload named `.pdf`, **then** 415 `INVALID_FILE_TYPE`. | BRD-021 |
| SPEC-011.NAC15 | **Given** extension `.pdf` with declared `image/png`, **then** 415 `INVALID_FILE_TYPE`. | BRD-021 |
| SPEC-011.NAC16 | **Given** `.svg`, `.html`, `.js`, `.zip`, `.docx` (default allow-list), **then** 415 `UNSUPPORTED_FILE_TYPE`. | BRD-021 |
| SPEC-011.NAC17 | **Given** a chunked 6 MB upload with no `Content-Length`, **then** 413 and no stored bytes. | BRD-021, BRD-038 |
| SPEC-011.NAC18 | **Given** a 0-byte file, **then** 400 `EMPTY_FILE`. | BRD-021 |
| SPEC-011.NAC19 | **Given** a `DELETE /documents/:id`, **then** 405 and the row/file remain. | BRD-OQ-08 |
| SPEC-011.NAC20 | **Given** a direct SQL `DELETE FROM documents`, **then** the trigger raises and the row remains. | BRD-OQ-08 `[PROPOSED]` |
| SPEC-011.NAC21 | **Given** the audit write fails on a download, **then** no bytes are streamed (503) (default, TDD-011.12). | BRD-026 |
| SPEC-011.NAC22 | **Given** a rejected upload, **then** no row, no final file, no temp file remain. | BRD-021 |

## 23. Testing Requirements

### 23.1 Unit (`tests/backend/documents/unit/`)
| TC | Case |
|---|---|
| TC-011.01 | `FileTypePolicy`: every row of the decision table (14.2). |
| TC-011.02 | Magic-byte detection for PDF/JPEG/PNG; truncated headers; PDF with leading junk rejected. |
| TC-011.03 | Size boundary 5,242,879 / 5,242,880 / 5,242,881. |
| TC-011.04 | `FileNameSanitiser`: traversal, backslash, NUL, RTL override, reserved names, long names, no extension. |
| TC-011.05 | Storage key generator: format, uniqueness, containment check rejects `..`. |
| TC-011.06 | `DocumentAccessPolicy` role x scope x stage x visibility matrix (table-driven). |
| TC-011.07 | IT projection hides description/uploader/profile fields. |
| TC-011.08 | Config bootstrap: rejects storage root under web root/app tree, non-writable, relative path. |

### 23.2 Integration / API (`tests/backend/documents/api/`)
| TC | Case |
|---|---|
| TC-011.10 | Upload PDF/JPG/JPEG/PNG to transfer and to employee; row + file + audit created. |
| TC-011.11 | 413, 415 UNSUPPORTED, 415 INVALID responses: status, code, message, envelope. |
| TC-011.12 | Rejected uploads leave no row, final file or temp file. |
| TC-011.13 | List/filter/pagination; SQL scope filter (count correctness). |
| TC-011.14 | View/download headers (`nosniff`, `no-store`, CSP, `Content-Disposition`, MIME from DB). |
| TC-011.15 | Audit events for upload, rejected upload, view, download, denial, visibility change. |
| TC-011.16 | Field-order rule, `TOO_MANY_FILES`, `FILE_REQUIRED`, unknown field. |
| TC-011.17 | `GET /document-categories`; inactive category rejected. |
| TC-011.18 | 405 on DELETE/PUT; no deletion route exists. |

### 23.3 Security (`tests/backend/documents/security/`)
| TC | Case |
|---|---|
| TC-011.20 | Role matrix across all six roles for upload/list/view/download/visibility (401/403/200). |
| TC-011.21 | IT negative scenarios (NAC01-03). |
| TC-011.22 | Cross-location HR and cross-employee Employee access (NAC04-06). |
| TC-011.23 | Path traversal in file name, route params and storage key; symlink in storage root. |
| TC-011.24 | No static exposure of the storage dir; no path in any response/audit/log. |
| TC-011.25 | Re-authorisation on every download (scope change between calls). |
| TC-011.26 | Content-sniff bypass attempts: polyglot, wrong extension, spoofed MIME, double extension. |

### 23.4 Concurrency / failure injection (`tests/backend/documents/concurrency/`)
| TC | Case |
|---|---|
| TC-011.30 | DB failure after rename -> compensation. |
| TC-011.31 | Client abort mid-upload -> temp removed. |
| TC-011.32 | Transfer finalised during upload -> 403 and file removed. |
| TC-011.33 | Disk full / unwritable root -> 503, no row. |
| TC-011.34 | Reconciler: stale temp removed, orphan quarantined, missing-file row reported. |
| TC-011.35 | Many parallel uploads: no partial rows, distinct keys. |

### 23.5 Frontend (`tests/frontend/documents/`)
| TC | Case |
|---|---|
| TC-011.40 | Pre-checks block >5 MB, wrong extension, empty file with the right message and no network call. |
| TC-011.41 | Server 413/415 (+ non-JSON proxy 413) mapped to messages. |
| TC-011.42 | FormData field order (fields before file). |
| TC-011.43 | Role-based control visibility; Documents module states (loading/empty/no-access/error). |
| TC-011.44 | Blob view/download and `revokeObjectURL`. |
| TC-011.45 | Accessibility checks for uploader (labels, live region). |

### 23.6 Workflow / Negative
| TC | Case |
|---|---|
| TC-011.50 | Stage matrix: upload allowed/denied for every status code (SPEC-007 set). |
| TC-011.51 | NAC01-NAC22 executed as a labelled suite for SPEC-016 traceability. |
| TC-011.52 | Documents never change transfer status (before/after status identical). |
| TC-011.53 | IT task reassignment removes document access (with SPEC-010). |

## 24. Definition of Done
- [ ] Migrations for `document_categories` and `documents` applied and reversible; trigger tested.
- [ ] Upload pipeline enforces the 5 MB limit while streaming and the extension/MIME/magic-byte checks; the three BRD error codes and messages verified.
- [ ] Invalid uploads leave no stored file, temp file or row; compensation on DB failure verified.
- [ ] Storage root is env-configured, outside the web root, validated at startup; no static route.
- [ ] Every view/download/list re-runs the BRD-026 chain; role x scope x stage x visibility matrix tests pass.
- [ ] IT negative scenarios (NAC01-03) pass.
- [ ] Audit events of section 18 emitted and visible via SPEC-013 queries.
- [ ] No delete/replace/retention/AV code exists; 405 verified.
- [ ] Frontend uploader, list, preview/download, Documents module delivered with 413/415 mapping and accessibility checks.
- [ ] All TDD items have a recorded decision or an accepted default at Gate 1.
- [ ] Unit, API, security, concurrency, frontend and negative suites pass; coverage reported to SPEC-016.
- [ ] INT standards verified: async/await only, try/catch, structured logger, env-var config, input validation, no AI-generated comments.
- [ ] Gate 1 approved before planning/tasks/tests/implementation begin; Gate 2 review after implementation.

## Technical Design Decisions Required — Not Defined by BRD
| ID | Question | Recommended default `[PROPOSED]` | Impact |
|---|---|---|---|
| TDD-011.01 | What is the document category/type catalogue? BRD says only "category/type". | `TRANSFER_SUPPORTING`, `ORGANISATION_DOCUMENT`, `HR_CONFIRMATION`, `PAYROLL_SUPPORTING`, `IT_COMPLETION_EVIDENCE`, `OTHER`, stored as master data. | Migration seed, UI filter, IT evidence. |
| TDD-011.02 | Exact allowed image formats and strict MIME rules (BRD: "PDF and image formats"). Is `image/jpg`/`application/octet-stream` tolerated? Decision-table precedence for 415 codes? | pdf, jpg, jpeg, png only; exclude SVG; strict declared-MIME match; precedence of 14.2. | Allow-list table, tests, error semantics. |
| TDD-011.03 | At which transfer statuses may HR upload; may documents be added after final status or while Blocked? | HR: `PENDING_HR_REVIEW`, `HR_PROCESSING`, `PAYROLL_PROCESSING`; none on Draft/final/Blocked; Super Admin any non-final; employee-linked organisation documents any time. | Stage matrix, NAC12/13. |
| TDD-011.04 | May Super Admin upload (BRD names HR only)? | No in this phase (view/download only). | Role matrix. |
| TDD-011.05 | Employee access to own documents (view/download), and which ones. | Read-only, only documents flagged `visible_to_employee`, own employee id. | Privacy, UI. |
| TDD-011.06 | Reporting Manager / Receiving Manager visibility of documents. | Read-only, `visible_to_managers` flag, assigned employees / routed requests only; Receiving Manager scope mapping depends on SPEC-003 `[TDD-REQUIRED]`. | Privacy, scope. |
| TDD-011.07 | IT scope for documents and the IT completion-evidence mechanism (BRD-014 "completion evidence"): who uploads, where stored, whether mandatory. | IT sees only `visible_to_it` documents of its assigned-task transfers in IT-controlled stages; IT may upload `IT_COMPLETION_EVIDENCE` to its own task (flag `DOCUMENT_IT_EVIDENCE_UPLOAD_ENABLED`, default `false`); evidence optional; `it_task_id` stored without FK until SPEC-009. | BRD-039 IT row, SPEC-009 coordination. |
| TDD-011.08 | Is replacement/superseding of a wrong document allowed (no delete per BRD-OQ-08)? | Not in this phase; upload a new document; wrong document can be hidden from non-HR roles via flags only. | Data model (`supersedes_document_id` absent). |
| TDD-011.09 | Orphan/temporary-file handling: delete or quarantine files with no row? | Temp files deleted after TTL; row-less files quarantined to `_orphans/` and reported, never auto-deleted. | Reconciler, operations. |
| TDD-011.10 | Local storage host OS and permission model (the project is developed on Windows; production is "local deployment"). | `0700/0600` on POSIX; restricted service-account ACL on Windows. | Bootstrap, deployment. |
| TDD-011.11 | Is "5 MB" 5,000,000 or 5,242,880 bytes? | 5 MiB = 5,242,880, boundary documented in error `details`. | Boundary tests. |
| TDD-011.12 | Audit scope details: audit rejected uploads and metadata-only reads? Fail closed when audit write fails on view/download? | Audit rejected uploads: yes; audit metadata reads: no; fail closed for content access. | Audit volume, availability. |
| TDD-011.13 | Duplicate-file handling (same sha256 on same target). | Allow duplicates; no warning in this phase. | UX, storage. |
| TDD-011.14 | Should anyone be notified of new documents? | No notification (BRD-036 has none). | SPEC-012 catalogue. |
| TDD-011.15 | Upload timeout and concurrent-upload ceiling (BRD-038 API timeout is "to be confirmed"). | No numeric target invented; request timeout from SPEC-001 config; concurrency target set in SPEC-015 perf planning. | Perf testing inputs. |

## Out of Scope (this SPEC)
Nothing here introduces any BRD "Out of Scope" item. Specifically not built:
- Malware/antivirus scanning, content disarming, document retention, archive and deletion policy, delete/purge endpoint (BRD-OQ-08).
- External document storage (cloud/S3), document management systems, e-signature, OCR, versioning/replacement (TDD-011.08), full-text search of document content.
- HR-system/Payroll/IT service-management integration (BRD Out of Scope; no integration in the current phase).
- Redesign of HR/payroll/IT platforms; Facilities/Admin role and its documents (removed from scope).
- Backup/restore and capacity of the storage volume (NFR-009, SPEC-015).
- TLS provisioning (NFR-004, SPEC-015); rate limiting and generic security middleware (SPEC-002/015).
- Audit log viewing/export UI and catalogue (SPEC-013); notification templates and delivery (SPEC-012).
