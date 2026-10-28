# Gate 1 PR Review: SPEC-011 — Secure Document Management

> Saved as `.ai-context/pr_reviews/SPEC-011-secure-document-management-20261028-145216.md`.
> Part of the Gate 1 review of the 16-spec set drafted on 2026-10-07. The reviewer is
> sending feedback one spec at a time. Gate 1 authority does not include Gate 2.

## Review Metadata
- **Project Name:** sdd_v1 — Internal Transfer Digital Journey
- **Spec ID:** secure-document-management (SPEC-011)
- **Spec Name:** Secure Document Management
- **Spec File:** `.ai-context/specs/secure-document-management.spec.md`
- **Developer:** Santu Pradhan (santu.pradhan@intglobal.com), Spec Author
- **Assigned Reviewer:** Shamik Bhattacharya (Gate 1, Project Manager / Product Owner)
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Reviewer Email Verified Against Roster (`git config user.email`):** Yes
- **Review Mode:** Individual Item
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-10-28 14:52:16

## Review Criteria Evaluation
1. **Requirement Completeness:** Needs Improvement. Comments 1 and 2
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Needs Improvement. Comment 1 (§6.1 role matrix)
4. **Technical Approach/Design:** Needs Improvement. Comment 3 (§11, §12 `[PROPOSED]` routes and `DocumentService` contracts)
5. **Business Rules:** Needs Improvement. Comments 1 and 2 (permitted stages, role scope)
6. **Validations:** Needs Improvement. Comment 2 (formats, MIME rules, 5 MB interpretation, §14)
7. **Dependencies:** Needs Improvement. Comment 3 (SPEC-004, SPEC-006 to SPEC-009, SPEC-013); comment 1 (SPEC-003 Receiving Manager scope)
8. **Assumptions:** Needs Improvement. TDD-011.02 to .07, .11 and .12 must become frozen decisions
9. **Edge Cases:** Needs Improvement. Comment 4 (audit-write failure on view/download)
10. **Acceptance Criteria:** Needs Improvement. Comments 2 and 4 (API responses, error codes and tests must reflect the frozen decisions)
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** Four high-priority items are still open `[TDD-REQUIRED]` /
  `[PROPOSED]` decisions:
  - the role permission matrix and scope rules (IT evidence uploads and Receiving
    Manager scope in particular);
  - upload stages and validation rules;
  - the alignment of the routes and `DocumentService` contracts with dependent specs,
    including the IT evidence contract and `it_task_id`;
  - the audit and fail-closed policy.

  The author must turn each item into a frozen, explicit decision in the spec, remove
  the matching markers, align the API responses and tests, and resubmit SPEC-011 for
  Gate 1.
- **Review Comments:**

| # | Priority | Finding | Spec Areas / Open Decision | Required Action | Author Response | Status |
|---|---|---|---|---|---|---|
| 1 | High | Role and access permissions: Employee, Reporting Manager, Receiving Manager, Super Admin and IT permissions still contain TDD-required decisions. | §6.1 permission matrix, §6.2 scope sources, §15; TDD-011.04 (Super Admin upload; proposed: no), TDD-011.05 (Employee access), TDD-011.06 (Reporting / Receiving Manager visibility; Receiving Manager scope depends on SPEC-003), TDD-011.07 (IT scope and evidence upload; flag `DOCUMENT_IT_EVIDENCE_UPLOAD_ENABLED` default `false`) | Finalise the permission matrix and scope rules, especially IT evidence uploads and Receiving Manager scope mapping, before implementation. | — | Open |
| 2 | High | Upload stages and validation: confirm the permitted transfer statuses, supported image formats, MIME-validation rules and exact 5 MB interpretation. | FR-011.10–.17 (allow-list proposed as pdf/jpg/jpeg/png), FR-011.15 and §14.2 decision table, FR-011.20 (5 MiB = 5,242,880 bytes), FR-011.29 validation precedence, §12.11 error messages; TDD-011.02 (formats, `image/jpg` / `application/octet-stream`, 415 precedence), TDD-011.03 (HR upload stages), TDD-011.11 (5 MB vs 5 MiB) | Freeze the permitted statuses, formats, MIME rules and size boundary. These decisions directly affect API behaviour, error responses and acceptance tests. | — | Open |
| 3 | High | API and dependent-spec alignment: confirm that the proposed routes and `DocumentService` contracts align with SPEC-004, SPEC-006 to SPEC-009 and SPEC-013. | §11 `DocumentService` (upload, view/download, `attachEvidence`, `countByCategoryForTransfer`), §12.1–12.10 `[PROPOSED]` routes, FR-011.54, §10.2 `documents.it_task_id` (nullable, no FK until SPEC-009 `it_tasks`), TASK-011.17; TDD-011.07; SPEC-009 TDD-009.10 (completion evidence) | Confirm the alignment. In particular, finalise the IT evidence-upload contract and `it_task_id` handling before dependent modules consume it. | — | Open |
| 4 | High | Audit and failure handling: confirm the final policy for rejected-upload and metadata-read auditing, and the fail-closed behaviour when audit writes fail during view/download. | §18 (`DOCUMENT_UPLOAD_REJECTED` and the other events), §11.1 step 6, TASK-011.15, §20; TDD-011.12 (proposed: audit rejected uploads yes, metadata reads no, fail closed for content access); SPEC-013 audit rules | Confirm the final policy. Ensure the API responses and tests consistently reflect the approved decision. | — | Open |

## Rejection Handling (Gate 1)
The author updates `.ai-context/specs/secure-document-management.spec.md` to resolve every
comment, fills in the Author Response column above, and resubmits SPEC-011 for Gate 1
review.
