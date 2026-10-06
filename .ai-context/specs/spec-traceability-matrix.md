# Spec Traceability Matrix — BRD → SPEC → TASK → AC / NAC / TC

## Document control

| Item | Value |
|---|---|
| Source of truth | `.ai-context/BRD.md` (Gate 0 APPROVED 2026-10-05, Shamik Bhattacharya) |
| Specs covered | SPEC-001 … SPEC-016 in `.ai-context/specs/*.spec.md` (all Draft, none yet at Gate 1) |
| Contract | `SPEC-SET-CONTRACT.md` (primary-owner map, section 4) |
| Generated | 2026-10-07 |
| Status | Draft — traceability artefact owned by SPEC-016 (`RR-04`, `TASK-016.05`); regenerate after every spec change |
| BRD numbering | **BRD-015 does not exist.** The BRD numbering skips from BRD-014 to BRD-016. There is no BRD-015 requirement text and no row below; this is a BRD numbering fact, not a coverage gap. |

## 0. How to read this document

1. **Section 1** is the requirement matrix: one row for every ID BRD-001 … BRD-014, BRD-016 … BRD-039 (38 IDs) and NFR-001 … NFR-009 (9 IDs) = 47 rows. **Section 2** maps BRD-OQ-01 … BRD-OQ-20. **Section 3** is the inventory coverage (objectives, scope, actors, every Business Rules bullet, every BRD-027 matrix row, every BRD "Acceptance Criteria" bullet, BRD-039 scenarios, source of truth, integration boundaries, dependencies, assumptions, out of scope). **Section 4** lists the gaps found. **Appendix A** is the full task index (every TASK id with its BRD/NFR references).
2. **Primary SPEC** is the owner from contract section 4 (co-owners listed together). **Secondary SPECs** are every other SPEC (excluding SPEC-016) that evidences the ID through its section 3 table, a task `BRD refs` cell, or an AC/NAC tag. SPEC-016 is shown in the last column and through its own AC/NAC and tasks.
3. **TASK ids** are taken from the `BRD refs` column of section 8 of each spec. Notation `TASK-007.03–07,12` means TASK-007.03 to .07 and TASK-007.12. QA tasks whose refs are "all" are listed once per spec in 1.2 and apply to every ID that spec covers.
4. **AC / NAC ids** are the acceptance (`SPEC-NNN.ACmm`) and negative (`SPEC-NNN.NACmm`) criteria whose line mentions the BRD/NFR/OQ id (tag or text) in section 21 or 22 of the spec. Notation `007: AC01–07,12; NAC03` means SPEC-007.AC01–AC07, AC12 and SPEC-007.NAC03.
5. **TC ids** are linked through section 23 of each spec where the spec itself ties a TC to an AC/NAC (explicit mapping row, `1:1` rule or formula: SPEC-001 AC n → TC-001.(58+n), NAC n → TC-001.(43+n); SPEC-009 NAC n → TC-009.(62+n); SPEC-010 NAC nn → TC-010.52.nn; SPEC-013 NAC n → TC-013.(66+n)). Where a TC row lists several ACs the link is the cross product. `[n AC/NAC with no TC link in spec]` means the spec provides no per-AC/NAC test mapping for n of the listed criteria (see gap G-06).
6. Every TASK, AC, NAC and TC id cited anywhere in the 16 specs was resolved against the definitions in the same files by script (see Appendix B). Dangling citations are listed in section 4.
7. Tags: `[BRD]`, `[DERIVED]`, `[PROPOSED]`, `[TDD-REQUIRED]` are as defined by the contract. Nothing in this document introduces a requirement.

## 0.1 Volumes parsed from the specs

| SPEC | Slug | Tasks | AC | NAC | TDD decisions |
|---|---|---|---|---|---|
| SPEC-001 | project-foundation-architecture | 31 | 27 | 15 | 12 |
| SPEC-002 | identity-access-security | 38 | 35 | 25 | 22 |
| SPEC-003 | admin-portal-master-data | 30 | 34 | 20 | 10 |
| SPEC-004 | user-provisioning-administration | 33 | 36 | 20 | 16 |
| SPEC-005 | vacancy-capacity-reservation | 35 | 30 | 25 | 16 |
| SPEC-006 | transfer-initiation-eligibility | 30 | 28 | 22 | 16 |
| SPEC-007 | transfer-workflow-approval-lifecycle | 32 | 34 | 22 | 18 |
| SPEC-008 | hr-review-processing-reapproval | 34 | 30 | 27 | 12 |
| SPEC-009 | payroll-it-completion | 34 | 30 | 30 | 15 |
| SPEC-010 | transfer-exception-controls | 31 | 29 | 32 | 15 |
| SPEC-011 | secure-document-management | 27 | 22 | 22 | 15 |
| SPEC-012 | notification-framework | 26 | 24 | 15 | 16 |
| SPEC-013 | audit-compliance-security-events | 31 | 28 | 24 | 20 |
| SPEC-014 | dashboards-worklists-reporting | 32 | 24 | 16 | 14 |
| SPEC-015 | data-ownership-integration-nfr-hardening | 34 | 38 | 32 | 22 |
| SPEC-016 | qa-uat-traceability | 30 | 30 | 16 | 13 |
| **Total** | | **508** | **479** | **363** | **252** |

## 1. Requirement matrix — BRD-001 … BRD-039 (no BRD-015) and NFR-001 … NFR-009

| BRD / NFR | Summary | Primary SPEC | Secondary SPECs | TASK ids (by SPEC) | AC / NAC ids (by SPEC) | TC ids (by SPEC) | SPEC-016 verification |
|---|---|---|---|---|---|---|---|
| **BRD-001** | Individual authenticated accounts for all six roles; local credentials; role- and scope-aware views | SPEC-002 | 001, 003, 004 | TASK-001.21<br>TASK-002.01,10,28–29,38<br>TASK-003.14 | 002: AC03<br>003: AC30 | 002: [1 AC/NAC with no TC link in spec]<br>003: TC10,29 | AB-24 |
| **BRD-002** | Modern responsive Admin Panel: role-aware nav, dashboard cards, tables, forms, confirm dialogs, loading/empty/no-access/error states, accessibility | SPEC-003 | 001, 002, 004, 005, 006, 009, 010, 012, 013, 014, 015 | TASK-001.22,24–28<br>TASK-002.32<br>TASK-003.02,15,17–22,24,28<br>TASK-004.14,21–22,26,28,32<br>TASK-005.23–24,34<br>TASK-006.24<br>TASK-009.22<br>TASK-010.19–21,31<br>TASK-012.18–19<br>TASK-013.18<br>TASK-014.03,07,19–21,27,31<br>TASK-015.22<br>TASK-016.18 | 001: AC17,20–23; NAC08<br>002: AC35<br>003: AC01–09,12,20–21; NAC13,16<br>004: AC25,34<br>005: AC06,30<br>010: AC27<br>013: AC24<br>014: AC01–02,15,21–23 | 001: TC51,75,78–81<br>002: [1 AC/NAC with no TC link in spec]<br>003: TC03,09,13,22,26,30,32–38,41–43,48,56 [1 AC/NAC with no TC link in spec]<br>004: [2 AC/NAC with no TC link in spec]<br>005: [2 AC/NAC with no TC link in spec]<br>010: [1 AC/NAC with no TC link in spec]<br>013: [1 AC/NAC with no TC link in spec]<br>014: [6 AC/NAC with no TC link in spec] | AB-01 |
| **BRD-003** | Admin modules Dashboard, Users, Locations, Departments, Designations, Vacancies, Transfers, Documents, Audit Logs | SPEC-003 | 001, 004, 005, 011, 013 | TASK-001.27<br>TASK-003.15,17<br>TASK-004.22<br>TASK-005.24<br>TASK-011.12,21<br>TASK-013.12,18 | 003: AC01<br>011: AC12<br>013: AC24 | 003: TC13,30,32<br>011: [1 AC/NAC with no TC link in spec]<br>013: [1 AC/NAC with no TC link in spec] | AB-01, AB-12 |
| **BRD-004** | Role-prefixed unique User ID (EMP/MGR/HR/IT######), strong temp password, duplicate validation, user+profile in one transaction | SPEC-004 | 001, 002 | TASK-001.12,16<br>TASK-002.23<br>TASK-004.01–02,04–06,12 | 001: AC10<br>002: AC01–02,04<br>004: AC01–07 | 001: TC68<br>002: [3 AC/NAC with no TC link in spec]<br>004: TC31,34,63–64 [4 AC/NAC with no TC link in spec] | AB-02, AB-03 |
| **BRD-005** | Credentials shown once to authorised admin; delivered by official email; temp password never in logs/audit | SPEC-004 | 001, 002, 012, 013 | TASK-002.26<br>TASK-004.06,12–13,24,32<br>TASK-012.07<br>TASK-016.03 | 001: NAC14<br>004: AC08–10<br>012: AC13; NAC14<br>013: AC07<br>016: AC04; NAC06 | 001: TC57<br>004: TC48,56 [1 AC/NAC with no TC link in spec]<br>012: TC01,06,19,27<br>013: [1 AC/NAC with no TC link in spec]<br>016: TC73–88 [1 AC/NAC with no TC link in spec] | AB-03, AB-04 |
| **BRD-006** | Temp password; forced change at first login (no bypass incl. direct API); hashes only | SPEC-002 | 001, 004, 013 | TASK-002.01,03,05,10–11,14,30,38<br>TASK-016.03 | 001: AC08; NAC14<br>002: AC05–06,08,11,33; NAC17<br>004: AC08<br>016: AC04; NAC06 | 001: TC57,66<br>002: TC40 [5 AC/NAC with no TC link in spec]<br>004: TC56<br>016: TC73–88 [1 AC/NAC with no TC link in spec] | AB-04<br>BRD-039 S4 |
| **BRD-007** | Account lifecycle (Pending Activation/Active/Locked/Inactive); admin reset; complexity, lockout, session timeout, forced change | SPEC-002 | 004, 012 | TASK-002.01,09,11,26,33<br>TASK-004.17,26 | 002: AC08<br>004: AC20–21,23–24,26<br>012: AC14 | 002: [1 AC/NAC with no TC link in spec]<br>004: TC40 [4 AC/NAC with no TC link in spec]<br>012: TC01 | AB-05, AB-06, AB-11<br>BRD-039 S5, S6, S7 |
| **BRD-008** | Account create/activate/deactivate/reset/lock/unlock/first-login change audited without plaintext passwords | SPEC-002, SPEC-004 | 013 | TASK-002.09,21<br>TASK-004.17,19,25 | 002: AC08<br>004: AC40<br>013: AC20 | 002: [1 AC/NAC with no TC link in spec]<br>004: [1 AC/NAC with no TC link in spec]<br>013: [1 AC/NAC with no TC link in spec] | AB-04, AB-11 |
| **BRD-009** | Account creation flow: role > profile > validate > create > credentials > deliver > first login > audit | SPEC-004 | 002 | TASK-004.07,09,12,23 | 004: AC01 | 004: TC31 | — |
| **BRD-010** | Super Admin scope: masters, vacancies, users and mappings, view all, reassign/intervene | SPEC-003 | 002, 004, 005, 010, 011, 013, 014 | TASK-002.23<br>TASK-003.01–04,06,22<br>TASK-004.16<br>TASK-005.08,10,25<br>TASK-010.21 | 002: AC02<br>003: AC10–14,30; NAC01<br>004: AC27<br>005: AC01,03; NAC18<br>010: AC27 | 002: [1 AC/NAC with no TC link in spec]<br>003: TC01–03,10,22–23,29,38,45,56<br>004: [1 AC/NAC with no TC link in spec]<br>005: [3 AC/NAC with no TC link in spec]<br>010: [1 AC/NAC with no TC link in spec] | AB-01, AB-02, AB-11, AB-12 |
| **BRD-011** | Employee scope: profile, browse vacancies, submit with reference, track timeline, respond to clarification, history | SPEC-006 | 004, 005, 007, 014 | TASK-004.14,27<br>TASK-005.12,28<br>TASK-006.01,04,06,09,12–13,16–18,21–23,28<br>TASK-007.23<br>TASK-014.07–08,22 | 004: AC33<br>005: AC07<br>006: AC01,03,10,24–25<br>014: AC03–04 | 004: [1 AC/NAC with no TC link in spec]<br>005: [1 AC/NAC with no TC link in spec]<br>006: [5 AC/NAC with no TC link in spec]<br>014: [2 AC/NAC with no TC link in spec] | AB-13 |
| **BRD-012** | Reporting/Receiving Manager scope; Receiving Manager stage Super-Admin configurable (on/off) | SPEC-007 | 003, 004, 008, 012, 013, 014, 015 | TASK-003.11<br>TASK-004.14,27<br>TASK-007.01,06,12–13,16,18,21–22,25,31<br>TASK-014.07,09,23 | 003: AC29<br>004: AC30<br>007: AC08–09,11–12,18; NAC15<br>012: AC03<br>013: AC11,13<br>014: AC05–06,24<br>016: AC13 | 003: TC08<br>004: [1 AC/NAC with no TC link in spec]<br>007: TC10,54 [5 AC/NAC with no TC link in spec]<br>012: TC08,37<br>013: [2 AC/NAC with no TC link in spec]<br>014: [3 AC/NAC with no TC link in spec]<br>016: [1 AC/NAC with no TC link in spec] | AB-21<br>BRD-039 W6 |
| **BRD-013** | HR scope: eligibility/vacancy validation, approve/reject/clarify, metadata, payroll/IT initiation, documents, monitoring | SPEC-008 | 004, 005, 009, 011, 014 | TASK-004.14,27<br>TASK-005.11<br>TASK-008.09,24–25<br>TASK-011.22<br>TASK-014.07,09,23 | 004: AC31<br>005: AC27<br>008: AC01<br>014: AC07 | 004: [1 AC/NAC with no TC link in spec]<br>005: [1 AC/NAC with no TC link in spec]<br>008: [1 AC/NAC with no TC link in spec]<br>014: [1 AC/NAC with no TC link in spec] | AB-14, AB-16, AB-22, AB-26 |
| **BRD-014** | IT scope: assigned tasks, minimum data, evidence, statuses; IT Final Approval mandatory (No IT Action Required path) | SPEC-009 | 004, 011, 013, 014, 015 | TASK-004.14,27<br>TASK-009.02–03,09–12,18,21,23–24,29<br>TASK-011.17,22<br>TASK-014.07,10,24<br>TASK-015.19 | 004: AC32<br>009: AC04,09,11–15,18,24; NAC11,22,24<br>011: AC13<br>013: AC12; NAC06<br>014: AC09; NAC05<br>015: AC22<br>016: AC14 | 004: [1 AC/NAC with no TC link in spec]<br>009: TC55,58,63,68–69,73,80,84,86,92 [8 AC/NAC with no TC link in spec]<br>011: [1 AC/NAC with no TC link in spec]<br>013: TC72 [1 AC/NAC with no TC link in spec]<br>014: TC31–38 [1 AC/NAC with no TC link in spec]<br>015: [1 AC/NAC with no TC link in spec]<br>016: [1 AC/NAC with no TC link in spec] | AB-09, AB-23, AB-27<br>BRD-039 W4, W5 |
| **BRD-016** | Organisational relationships for routing (employee, RM, HR, IT, vacancy) | SPEC-003 | 004, 005, 006, 007, 009, 014 | TASK-003.08–13,23<br>TASK-004.01,08–10<br>TASK-007.11<br>TASK-009.09 | 003: AC25–29; NAC03<br>004: AC04,35<br>009: AC09 | 003: TC06–09,11,16,23,27–28,40,45,51,53,56<br>004: [2 AC/NAC with no TC link in spec]<br>009: [1 AC/NAC with no TC link in spec] | AB-15, AB-24 |
| **BRD-017** | Vacancy fields and statuses; reservation only at HR approval; DB concurrency control | SPEC-005 | 001, 006, 015 | TASK-005.01,04,06,08,13,26 | 005: AC01,04,09,17 | 005: [4 AC/NAC with no TC link in spec] | AB-12, AB-13, AB-29<br>BRD-039 V2 |
| **BRD-018** | End-to-end workflow sequence ending in IT Final Approval > Completed | SPEC-007 | 006, 008, 009 | TASK-006.08<br>TASK-007.13,32<br>TASK-016.11–12 | 006: AC19<br>007: AC06,17<br>016: AC12 | 006: [1 AC/NAC with no TC link in spec]<br>007: [2 AC/NAC with no TC link in spec]<br>016: [1 AC/NAC with no TC link in spec] | AB-09, AB-26, AB-27 |
| **BRD-019** | Status model per BRD-027; Blocked/Cancelled retained; not Completed without IT Final Approval | SPEC-007 | 001, 006, 008, 009, 010 | TASK-001.21<br>TASK-006.02<br>TASK-007.05,07 | 007: AC02,06<br>009: NAC14 | 007: [2 AC/NAC with no TC link in spec]<br>009: TC76 | AB-09, AB-27<br>BRD-039 W3, W5 |
| **BRD-020** | HR org-metadata update/assign during validation; portal-data-only; payroll assignment | SPEC-008 | 009, 015 | TASK-008.14–15,26 | 008: AC11<br>009: AC02<br>015: AC06 | 008: [1 AC/NAC with no TC link in spec]<br>009: [1 AC/NAC with no TC link in spec]<br>015: [1 AC/NAC with no TC link in spec] | AB-15, AB-22 |
| **BRD-021** | HR documents; PDF/image, 5 MB, MIME+extension, sanitised names, local storage, scoped authenticated access, 413/415 codes | SPEC-011 | 001, 008, 009, 013, 015 | TASK-001.06<br>TASK-008.14<br>TASK-009.12<br>TASK-011.01–14,18–20,23–26<br>TASK-015.24<br>TASK-016.16 | 001: AC14<br>008: AC11<br>009: AC14; NAC27<br>011: AC01–09,11–19; NAC11,14–18,22<br>013: AC22<br>015: AC28; NAC21–22<br>016: AC19 | 001: TC72<br>008: [1 AC/NAC with no TC link in spec]<br>009: TC89 [1 AC/NAC with no TC link in spec]<br>011: TC51 [18 AC/NAC with no TC link in spec]<br>013: [1 AC/NAC with no TC link in spec]<br>015: [3 AC/NAC with no TC link in spec]<br>016: [1 AC/NAC with no TC link in spec] | AB-22<br>BRD-039 S3 |
| **BRD-022** | All material actions across every role are auditable (no plaintext passwords) | SPEC-013 | 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 014, 015 | TASK-001.17<br>TASK-003.03,16<br>TASK-006.15<br>TASK-007.20<br>TASK-009.19<br>TASK-010.02<br>TASK-011.15,20<br>TASK-013.04,06,17 | 003: AC10,33; NAC13<br>004: AC40<br>011: AC15,21<br>013: AC01,03,25; NAC14<br>014: AC20 | 003: TC01,09,14,20,22,37–38,56<br>004: [1 AC/NAC with no TC link in spec]<br>011: [2 AC/NAC with no TC link in spec]<br>013: TC80 [3 AC/NAC with no TC link in spec]<br>014: [1 AC/NAC with no TC link in spec] | AB-25 |
| **BRD-023** | Notifications, role dashboards/worklists, operational reporting, overdue visibility, configurable escalation | SPEC-012, SPEC-014 | 005 | TASK-005.11<br>TASK-014.01–04,11–17,25–26 | 014: AC11–12,18–19; NAC06–07,10–11<br>016: NAC13 | 014: TC31–38,56 [4 AC/NAC with no TC link in spec]<br>016: TC73–88 | — |
| **BRD-024** | HR change of Dept/BU, Designation, Location or Reporting Manager returns to Receiving Manager re-approval when enabled | SPEC-008 | 005, 007, 009, 012, 013, 015 | TASK-008.03–04,17–18,26–27<br>TASK-015.05<br>TASK-016.08 | 007: AC13; NAC09<br>008: AC14–17,19–20; NAC10,27<br>012: AC15<br>013: AC13,21<br>015: AC05<br>016: AC08 | 007: TC10,54 [1 AC/NAC with no TC link in spec]<br>008: TC64–70 [6 AC/NAC with no TC link in spec]<br>012: [1 AC/NAC with no TC link in spec]<br>013: [2 AC/NAC with no TC link in spec]<br>015: [1 AC/NAC with no TC link in spec]<br>016: [1 AC/NAC with no TC link in spec] | AB-28<br>BRD-039 W7 |
| **BRD-025** | Auth and session policy: 5 failures/30 min lock, 30 min idle, complexity, reset/deactivate invalidates sessions, MFA/SSO out | SPEC-002 | 001, 003, 004, 006, 012, 013, 014, 015 | TASK-001.04<br>TASK-002.01–02,04,06–10,12–13,22,24–25,27–28,31,37–38<br>TASK-004.06,17<br>TASK-015.17 | 001: AC03,26; NAC01,13<br>002: AC04–05,07,09–10,12–17,19–23,30,34; NAC16<br>003: NAC11<br>004: AC06–07,20,22<br>006: NAC19<br>012: AC13<br>013: AC19<br>014: NAC09<br>015: NAC32<br>016: AC07 | 001: TC44,56,61,84<br>002: TC40 [18 AC/NAC with no TC link in spec]<br>003: TC06,12,56<br>004: TC40 [3 AC/NAC with no TC link in spec]<br>006: TC77<br>012: TC01,06,27<br>013: [1 AC/NAC with no TC link in spec]<br>014: TC31–38<br>015: [1 AC/NAC with no TC link in spec]<br>016: [1 AC/NAC with no TC link in spec] | AB-05, AB-06, AB-07<br>BRD-039 S4, S5, S6, S7 |
| **BRD-026** | API-level authorisation chain User>Role>Scope>Resource>Action; 401/403; direct API never bypasses | SPEC-002 | 001, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015 | TASK-001.06–07,23<br>TASK-002.07,12,15–20,32<br>TASK-003.04,13,26<br>TASK-004.18<br>TASK-005.09–10,21,32<br>TASK-006.14,29<br>TASK-007.09,17,30<br>TASK-008.07,21,32<br>TASK-009.07,32<br>TASK-010.05,14,16,18,29<br>TASK-011.09,15<br>TASK-013.07,10<br>TASK-014.05,27,29<br>TASK-015.02,16,20<br>TASK-016.02 | 001: AC25; NAC05,12<br>002: AC18,24–29,32,35; NAC22<br>003: AC03,21,26,34; NAC01–03,06–09,19<br>005: AC27; NAC13–14,18–19,25<br>006: NAC03,05,19<br>007: AC07,16,34; NAC02,22<br>008: AC01; NAC25<br>009: NAC05,08,28<br>010: AC29; NAC08,26<br>011: AC10; NAC09,13,21<br>012: NAC02–04,13<br>013: AC18; NAC03,08–09<br>014: NAC08,16<br>015: AC23; NAC02,17<br>016: AC07; NAC05 | 001: TC48,55,83<br>002: TC40 [9 AC/NAC with no TC link in spec]<br>003: TC10–11,13,23–24,29,33,40,45,48,55–56<br>005: [6 AC/NAC with no TC link in spec]<br>006: TC61,63,77<br>007: TC10,54 [3 AC/NAC with no TC link in spec]<br>008: TC64–70 [1 AC/NAC with no TC link in spec]<br>009: TC67,70,90<br>010: TC52 TC-010.52.{08,26} [1 AC/NAC with no TC link in spec]<br>011: TC51 [1 AC/NAC with no TC link in spec]<br>012: TC07,26,29,44<br>013: TC69,74–75 [1 AC/NAC with no TC link in spec]<br>014: TC31–38<br>015: [3 AC/NAC with no TC link in spec]<br>016: TC73–88 [1 AC/NAC with no TC link in spec] | AB-08<br>BRD-039 S1, S2, S8, W1 |
| **BRD-027** | Controlled workflow state-transition matrix; HR/Payroll/IT sequencing; completion rule; Withdraw/Block/Resume/Cancel/Reassign; invalid transition 403 | SPEC-007 | 001, 002, 005, 006, 008, 009, 010, 011, 012, 013, 014, 015 | TASK-001.06,21<br>TASK-002.17<br>TASK-005.19,33<br>TASK-006.11,30<br>TASK-007.02,05–08,10,24,26–27<br>TASK-008.01–02,10,13,20<br>TASK-009.01,04,06–08,13,15–16,20,22,25,28,30<br>TASK-010.01–02,05–11,13–15,22–25<br>TASK-012.06,16,24<br>TASK-013.07<br>TASK-014.06<br>TASK-015.06,11<br>TASK-016.08,12–14 | 001: AC14<br>002: AC28; NAC23<br>005: AC14,29<br>006: AC12,26; NAC22<br>007: AC01–03,09–10,14–15,26,30,33; NAC03–04<br>008: AC03,10,12,18<br>009: AC01–03,05,07,16–18,23,29; NAC01,03,05,13,15,18–19,23<br>010: AC01–08,10,15,17–18; NAC01,04–05,09,12,16–18,22<br>012: AC01–03,07–08,10,12,15–16; NAC12<br>013: AC17,21; NAC15–16<br>014: AC15<br>015: AC12<br>016: AC08,12–13,15–16 | 001: TC72<br>002: TC40 [1 AC/NAC with no TC link in spec]<br>005: [2 AC/NAC with no TC link in spec]<br>006: TC80 [2 AC/NAC with no TC link in spec]<br>007: TC10,54 [10 AC/NAC with no TC link in spec]<br>008: [4 AC/NAC with no TC link in spec]<br>009: TC55,58,63,65,67–69,75,77,80–81,85,92 [8 AC/NAC with no TC link in spec]<br>010: TC52 TC-010.52.{01,04–05,09,12,16–18,22} [12 AC/NAC with no TC link in spec]<br>012: TC08,35–37 [5 AC/NAC with no TC link in spec]<br>013: TC81–82 [2 AC/NAC with no TC link in spec]<br>014: [1 AC/NAC with no TC link in spec]<br>015: [1 AC/NAC with no TC link in spec]<br>016: [5 AC/NAC with no TC link in spec] | AB-09, AB-10, AB-34<br>BRD-039 W1, W2, W3, W4, W5, W6 |
| **BRD-028** | Vacancy reservation and capacity rules, release/retain/finalise, HR vacancy change, concurrency, resume revalidation, manual release | SPEC-005 | 001, 003, 006, 007, 008, 009, 010, 012, 013, 014, 015 | TASK-001.15<br>TASK-003.27<br>TASK-005.01–03,05–07,13–16,19,26<br>TASK-006.06,18<br>TASK-008.10,16,31<br>TASK-009.16<br>TASK-010.07,10,25<br>TASK-014.13<br>TASK-015.06,26<br>TASK-016.09,15 | 001: AC12<br>005: AC02,05,09–10,12–19,29; NAC02,16,21<br>006: AC03; NAC10,12<br>007: AC10,22,32<br>008: AC03–05,07,17,21–22<br>009: AC20,22; NAC20<br>010: AC03,09,12<br>013: AC21<br>014: AC16–17<br>015: AC10–11<br>016: AC09,12,17 | 001: TC70<br>005: [16 AC/NAC with no TC link in spec]<br>006: TC68,70 [1 AC/NAC with no TC link in spec]<br>007: [3 AC/NAC with no TC link in spec]<br>008: [7 AC/NAC with no TC link in spec]<br>009: TC55,58,63,68–69,80,82,92 [1 AC/NAC with no TC link in spec]<br>010: [3 AC/NAC with no TC link in spec]<br>013: [1 AC/NAC with no TC link in spec]<br>014: [2 AC/NAC with no TC link in spec]<br>015: [2 AC/NAC with no TC link in spec]<br>016: [3 AC/NAC with no TC link in spec] | AB-10, AB-29, AB-30, AB-31, AB-32, AB-33<br>BRD-039 V1, V2, V3, V4 |
| **BRD-029** | Eligibility rules 1-8, system behaviour, employee-data source of truth and field ownership, missing data, HR-ineligible outcome | SPEC-006 | 003, 004, 005, 007, 008, 009, 012, 013, 015 | TASK-003.01,05–07,10,12,14,29<br>TASK-004.01,03,08–11,15,25<br>TASK-005.12<br>TASK-006.01,04–07,10,17,19<br>TASK-008.05,08,11,25,28<br>TASK-015.01–06,34 | 003: AC17–19,23,28,31–32<br>004: AC12–19<br>005: AC07–08; NAC03,23<br>006: AC02–09,27; NAC05,09–10,14–15,17,20<br>007: AC30<br>008: AC02,06–08,28; NAC16,22–23<br>012: AC06<br>015: AC01–06,08–09; NAC01,03,05–06 | 003: TC05,09,12,16,25,28–29,39–40,51<br>004: [8 AC/NAC with no TC link in spec]<br>005: [4 AC/NAC with no TC link in spec]<br>006: TC63,67–68,72–73,75,78 [9 AC/NAC with no TC link in spec]<br>007: [1 AC/NAC with no TC link in spec]<br>008: TC64–70 [5 AC/NAC with no TC link in spec]<br>012: [1 AC/NAC with no TC link in spec]<br>015: [12 AC/NAC with no TC link in spec] | AB-14, AB-15, AB-16 |
| **BRD-030** | One active transfer per employee; 409 ACTIVE_TRANSFER_ALREADY_EXISTS; Draft not active; DB enforcement; no cool-down | SPEC-006 | 001, 005, 007, 010, 012, 014, 015 | TASK-001.06<br>TASK-006.01–02,05,08–10,12,21,27,30<br>TASK-010.17,30<br>TASK-014.06<br>TASK-015.06,26<br>TASK-016.15 | 001: AC14,16<br>006: AC13–17,20; NAC08,16,22<br>007: AC24<br>010: AC09,23–24; NAC30–31<br>015: AC10; NAC30<br>016: AC17 | 001: TC72,74<br>006: TC66,74,80 [6 AC/NAC with no TC link in spec]<br>007: [1 AC/NAC with no TC link in spec]<br>010: TC52 TC-010.52.{30–31} [3 AC/NAC with no TC link in spec]<br>015: [2 AC/NAC with no TC link in spec]<br>016: [1 AC/NAC with no TC link in spec] | AB-17 |
| **BRD-031** | Effective Transfer Date: today to +30 days inclusive, who may change, expired-date correction, optional re-approval | SPEC-006 | 001, 007, 008, 009, 013 | TASK-001.03,20<br>TASK-006.03,07,10,20<br>TASK-007.01,12,25<br>TASK-008.19<br>TASK-009.17,26 | 001: AC13; NAC09<br>006: AC11,21–23; NAC13<br>007: AC19–20; NAC16<br>008: AC25–27; NAC06,18–19<br>009: AC25–28; NAC25–26<br>013: AC21 | 001: TC52,71<br>006: TC71 [4 AC/NAC with no TC link in spec]<br>007: TC10,54 [2 AC/NAC with no TC link in spec]<br>008: TC64–70 [3 AC/NAC with no TC link in spec]<br>009: TC87–88 [4 AC/NAC with no TC link in spec]<br>013: [1 AC/NAC with no TC link in spec] | AB-20 |
| **BRD-032** | Transfer request editing: Draft only for Employee; post-submission HR/Super Admin controlled, audited, BRD-024 applies | SPEC-006, SPEC-008 | 007, 013, 015 | TASK-006.07–08,20<br>TASK-007.19<br>TASK-008.03,15<br>TASK-015.05 | 006: AC18,26<br>008: AC14,23–24; NAC06–07,20–21 | 006: [2 AC/NAC with no TC link in spec]<br>008: TC64–70 [3 AC/NAC with no TC link in spec] | — |
| **BRD-033** | Rejection and resubmission: mandatory reason, Rejected final, new request = new reference | SPEC-007 | 005, 006, 008, 010, 012, 013 | TASK-007.14,19,22<br>TASK-008.11,18<br>TASK-010.01,04,13,17,22,30<br>TASK-016.13 | 005: AC12<br>006: AC20<br>007: AC15,21–24; NAC12,14<br>008: AC07,17; NAC07<br>010: AC04,23,26; NAC20–21,30<br>012: AC05–06<br>016: AC15 | 005: [1 AC/NAC with no TC link in spec]<br>006: [1 AC/NAC with no TC link in spec]<br>007: TC10,54 [5 AC/NAC with no TC link in spec]<br>008: TC64–70 [2 AC/NAC with no TC link in spec]<br>010: TC52 TC-010.52.{20–21,30} [3 AC/NAC with no TC link in spec]<br>012: [2 AC/NAC with no TC link in spec]<br>016: [1 AC/NAC with no TC link in spec] | AB-10, AB-16, AB-18<br>BRD-039 V4 |
| **BRD-034** | Clarification: mandatory question, Info Required, same reference, return to same stage, multiple cycles | SPEC-007 | 006, 008, 012, 013, 014 | TASK-006.13,23<br>TASK-007.03–04,15,22–23<br>TASK-008.12,28<br>TASK-014.08<br>TASK-016.13 | 006: AC25<br>007: AC25–29; NAC12–13<br>008: AC08–09,19; NAC07<br>012: AC04,07<br>014: AC04<br>016: AC15 | 006: [1 AC/NAC with no TC link in spec]<br>007: TC10,54 [5 AC/NAC with no TC link in spec]<br>008: TC64–70 [3 AC/NAC with no TC link in spec]<br>012: [2 AC/NAC with no TC link in spec]<br>014: [1 AC/NAC with no TC link in spec]<br>016: [1 AC/NAC with no TC link in spec] | AB-10, AB-19 |
| **BRD-035** | Administrative reassignment: Super Admin only, reason, role+scope of new assignee, no re-approval, audited | SPEC-010 | 003, 007, 008, 009, 011, 012, 013, 014 | TASK-007.03,11<br>TASK-008.07<br>TASK-009.10<br>TASK-010.03,06,12,14–15,27<br>TASK-013.02,22<br>TASK-014.09<br>TASK-016.13 | 003: AC31; NAC10–11<br>007: AC16; NAC19<br>008: AC29; NAC26<br>009: AC06,10,30; NAC16<br>010: AC19–22; NAC23–25<br>011: NAC03<br>012: AC11<br>013: AC14,21; NAC16,20<br>014: AC08; NAC14<br>016: AC15 | 003: TC06–07,12,27,29,56<br>007: TC10,54 [1 AC/NAC with no TC link in spec]<br>008: TC64–70 [1 AC/NAC with no TC link in spec]<br>009: TC78 [3 AC/NAC with no TC link in spec]<br>010: TC52 TC-010.52.{23–25} [4 AC/NAC with no TC link in spec]<br>011: TC21,51<br>012: [1 AC/NAC with no TC link in spec]<br>013: TC82,86 [2 AC/NAC with no TC link in spec]<br>014: [2 AC/NAC with no TC link in spec]<br>016: [1 AC/NAC with no TC link in spec] | AB-35 |
| **BRD-036** | Twelve mandatory notifications, channels, failure isolation, retry idempotency | SPEC-012 | 001, 004, 006, 007, 008, 009, 010, 013, 014, 015 | TASK-001.18–19,31<br>TASK-004.13<br>TASK-006.11<br>TASK-007.20<br>TASK-008.23<br>TASK-009.19<br>TASK-010.15<br>TASK-012.01–06,08–13,15–18,21,24<br>TASK-013.16<br>TASK-014.17<br>TASK-016.16 | 001: AC06–07,09; NAC03–04,11<br>004: AC11<br>006: AC12,28<br>007: AC31<br>008: AC30<br>009: AC01,04,13,21; NAC29<br>010: AC28; NAC32<br>012: AC01–02,04–05,08–10,13–14,17–18,20,22–23; NAC06,10–11<br>013: AC23; NAC23<br>014: AC13–14<br>015: AC37<br>016: AC18 | 001: TC46–47,54,64–65,67<br>004: [1 AC/NAC with no TC link in spec]<br>006: [2 AC/NAC with no TC link in spec]<br>007: [1 AC/NAC with no TC link in spec]<br>008: [1 AC/NAC with no TC link in spec]<br>009: TC91 [4 AC/NAC with no TC link in spec]<br>010: TC52 TC-010.52.{32} [1 AC/NAC with no TC link in spec]<br>012: TC01–03,06,08,10–13,17,20–21,23,27,30,35,37,41–42 [5 AC/NAC with no TC link in spec]<br>013: TC89 [1 AC/NAC with no TC link in spec]<br>014: [2 AC/NAC with no TC link in spec]<br>015: [1 AC/NAC with no TC link in spec]<br>016: [1 AC/NAC with no TC link in spec] | AB-36 |
| **BRD-037** | Audit logging: content, scoped access, append-only, Super Admin export, retention, no credentials, security events | SPEC-013 | 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 012, 014, 015 | TASK-001.04–05,13–14,17,31<br>TASK-002.21<br>TASK-003.16<br>TASK-004.16,19<br>TASK-005.20<br>TASK-006.15<br>TASK-007.02,16,24<br>TASK-008.23<br>TASK-010.16<br>TASK-012.15<br>TASK-013.01–03,05–08,10–13,15,19–21,26–27,29<br>TASK-015.06,17,21<br>TASK-016.17 | 001: AC03–05,27; NAC01–02<br>002: AC30–31<br>003: AC33; NAC20<br>004: AC27,41–42<br>005: AC03<br>007: AC05,29,34; NAC21<br>013: AC01–02,04–05,07–12,15–16,19; NAC01–02,11,13,17<br>014: AC20<br>015: AC26; NAC20<br>016: AC28 | 001: TC44–45,61–63,85<br>002: [2 AC/NAC with no TC link in spec]<br>003: TC14,20,56<br>004: [3 AC/NAC with no TC link in spec]<br>005: [1 AC/NAC with no TC link in spec]<br>007: TC10,54 [3 AC/NAC with no TC link in spec]<br>013: TC67–68,77,79,83 [13 AC/NAC with no TC link in spec]<br>014: [1 AC/NAC with no TC link in spec]<br>015: [2 AC/NAC with no TC link in spec]<br>016: [1 AC/NAC with no TC link in spec] | AB-25, AB-37 |
| **BRD-038** | Performance and availability: application-level requirements, 5 MB, TBC numeric inputs, retry, transaction consistency | SPEC-015 | 001, 005, 007, 009, 010, 011, 014 | TASK-001.02,11,15,30–31<br>TASK-005.07,22<br>TASK-007.28–29<br>TASK-009.31<br>TASK-010.28<br>TASK-011.07<br>TASK-014.30,32<br>TASK-015.23–27,31–32<br>TASK-016.15,21–22,24,26 | 001: AC11–12; NAC11<br>005: AC11,18,26,28; NAC20<br>007: AC32–33<br>009: AC22; NAC30<br>010: NAC28<br>011: AC07; NAC17<br>015: AC14,28–32,35; NAC13,31<br>016: AC17,22–24; NAC03,08,13 | 001: TC54,69–70<br>005: [5 AC/NAC with no TC link in spec]<br>007: [2 AC/NAC with no TC link in spec]<br>009: TC55,58,63,68–69,80,92<br>010: TC52 TC-010.52.{28}<br>011: TC51 [1 AC/NAC with no TC link in spec]<br>015: [9 AC/NAC with no TC link in spec]<br>016: TC73–88 [4 AC/NAC with no TC link in spec] | AB-38<br>BRD-039 I1, I2 |
| **BRD-039** | Mandatory negative acceptance scenarios (24): security, workflow, vacancy, integration | SPEC-016 | 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015 | TASK-001.30<br>TASK-002.36<br>TASK-003.26<br>TASK-004.20,31<br>TASK-005.31<br>TASK-006.29<br>TASK-007.26,30<br>TASK-008.31–32<br>TASK-009.04,20,32<br>TASK-010.04,13,29<br>TASK-011.09,24,27<br>TASK-012.21,26<br>TASK-014.29<br>TASK-015.10,20,32<br>TASK-016.01,05–10,23,27–29 | 001: NAC10,12<br>002: AC21<br>003: NAC01,06<br>004: NAC01,10–11,13,20–23<br>005: AC12–13<br>007: NAC01–03,05–11<br>008: AC05<br>009: NAC01–03,06–12,17,20–21<br>011: NAC01,04–08,12<br>012: NAC01–02,05–08<br>013: NAC03–07,15,24<br>014: NAC01–05,12<br>015: AC35,38<br>016: AC01,03,05–11,24; NAC01–02,09–10 | 001: TC53,55<br>002: [1 AC/NAC with no TC link in spec]<br>003: TC11,23,45,56<br>004: TC81–100<br>005: [2 AC/NAC with no TC link in spec]<br>007: TC10,54<br>008: [1 AC/NAC with no TC link in spec]<br>009: TC55,58,63–65,68–74,79–80,82–83,92<br>011: TC21–22,51<br>012: TC04,13,16,25–26,38–40,44<br>013: TC69–73,81,90<br>014: TC31–38,56<br>015: [2 AC/NAC with no TC link in spec]<br>016: TC73–88 [10 AC/NAC with no TC link in spec] | AB-39 |
| **NFR-001** | Authentication: local credentials, first-login change, lock, idle timeout, complexity, session invalidation | SPEC-002 | 001, 004, 015 | TASK-002.13<br>TASK-015.13,33 | 015: AC19,36 | 015: [2 AC/NAC with no TC link in spec] | AB-05, AB-06, AB-07 |
| **NFR-002** | Authorisation: role + scope, least privilege, backend authoritative, 401/403 | SPEC-002 | 001, 003, 004, 005, 006, 007, 008, 009, 010, 011, 013, 014, 015 | TASK-002.15<br>TASK-015.14–15,20 | 015: AC20,23<br>016: NAC05 | 015: [2 AC/NAC with no TC link in spec]<br>016: TC73–88 | AB-08<br>BRD-039 S8 |
| **NFR-003** | Credential security: strong hashing, no plaintext/tokens in DB, logs, reports, audit | SPEC-002 | 001, 004, 012, 013, 015 | TASK-001.04,31<br>TASK-002.03,05,22<br>TASK-004.31<br>TASK-012.03,07,23<br>TASK-013.05,29<br>TASK-015.17,30<br>TASK-016.24 | 001: AC03<br>002: AC11,30; NAC24<br>004: AC41<br>012: NAC10,14–15<br>013: AC07<br>015: AC24; NAC24<br>016: AC29; NAC06,14 | 001: TC61<br>002: TC40 [2 AC/NAC with no TC link in spec]<br>004: [1 AC/NAC with no TC link in spec]<br>012: TC02,05–06,09,11,19,28<br>013: [1 AC/NAC with no TC link in spec]<br>015: [2 AC/NAC with no TC link in spec]<br>016: TC73–88 [1 AC/NAC with no TC link in spec] | AB-04, AB-07 |
| **NFR-004** | Transport and personal-data protection (encrypted transport) | SPEC-015 | 001, 011 | TASK-001.01,03–04,09,29,31<br>TASK-015.12,18–19,30<br>TASK-016.04 | 001: AC02,18–19<br>015: AC17–18,21; NAC23<br>016: AC30; NAC11 | 001: TC60,76–77<br>015: [4 AC/NAC with no TC link in spec]<br>016: TC73–88 [1 AC/NAC with no TC link in spec] | — |
| **NFR-005** | Auditability: protected tamper-resistant append-only records, scoped view, SA export | SPEC-013 | 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 015 | TASK-001.13,31<br>TASK-013.02–03,09,14,25,31<br>TASK-015.21 | 001: AC05<br>007: NAC21<br>013: AC04,06; NAC10,21–22<br>015: AC25 | 001: TC63<br>007: TC10,54<br>013: TC76,87–88 [2 AC/NAC with no TC link in spec]<br>015: [1 AC/NAC with no TC link in spec] | AB-25, AB-37 |
| **NFR-006** | Reliability: recoverable integration failures, no duplicate downstream execution, visible failures, authorised retry | SPEC-012, SPEC-015 | 001, 005, 006, 007, 008, 009, 010, 013 | TASK-001.19<br>TASK-012.01,09,11–12,14,19,22<br>TASK-015.10,27<br>TASK-016.10 | 001: AC07; NAC04<br>005: AC11; NAC10–11<br>006: NAC18<br>009: NAC29<br>012: AC18–19,21,23; NAC04–05,09<br>013: AC28<br>015: AC13,15–16,32; NAC12<br>016: AC10 | 001: TC47,65<br>005: [3 AC/NAC with no TC link in spec]<br>006: TC76<br>009: TC91<br>012: TC03,13–17,22–23,26,32,34,38,43<br>013: [1 AC/NAC with no TC link in spec]<br>015: [5 AC/NAC with no TC link in spec]<br>016: [1 AC/NAC with no TC link in spec] | AB-26, AB-36<br>BRD-039 I1, I2, I3, I4, I5 |
| **NFR-007** | Privacy: employee and document access restricted to authorised role and scope | SPEC-011, SPEC-002, SPEC-015 | 001, 003, 004, 006, 008, 009, 012, 013, 014 | TASK-009.11<br>TASK-012.13,23<br>TASK-014.05,10<br>TASK-015.19 | 009: AC24<br>011: AC22; NAC10<br>012: AC20; NAC01<br>014: AC09<br>015: AC22<br>016: NAC15 | 009: [1 AC/NAC with no TC link in spec]<br>011: TC51 [1 AC/NAC with no TC link in spec]<br>012: TC20–21,25,41–42<br>014: [1 AC/NAC with no TC link in spec]<br>015: [1 AC/NAC with no TC link in spec]<br>016: TC73–88 | AB-23, AB-24<br>BRD-039 S1, S2, S3 |
| **NFR-008** | Accessibility and usability aligned to organisational portal standards | SPEC-003 | 001, 004, 005, 006, 007, 009, 010, 012, 013, 014, 015 | TASK-001.22,24,28<br>TASK-003.17–20,28<br>TASK-004.28<br>TASK-006.24<br>TASK-007.31<br>TASK-009.33<br>TASK-010.20,31<br>TASK-012.17,25<br>TASK-013.23<br>TASK-014.31<br>TASK-015.22<br>TASK-016.18 | 001: AC20,23–24<br>003: AC07,09<br>005: AC30<br>014: AC23<br>015: AC27 | 001: TC78,81–82<br>003: TC36,41–43<br>005: [1 AC/NAC with no TC link in spec]<br>014: [1 AC/NAC with no TC link in spec]<br>015: [1 AC/NAC with no TC link in spec] | — |
| **NFR-009** | Performance/availability/backup/retention/monitoring targets deferred to infrastructure/deployment planning | SPEC-015 | 001, 011, 012, 013, 014 | TASK-001.02,10,29<br>TASK-013.30<br>TASK-015.28–29 | 001: AC01<br>013: AC27<br>015: AC33–34 | 001: TC59<br>013: [1 AC/NAC with no TC link in spec]<br>015: [2 AC/NAC with no TC link in spec] | AB-38 |

### 1.1 Reading notes

- BRD-039 row: the 24 scenarios are individually mapped in section 3.7; its row above lists every NAC/AC/TASK that cites BRD-039 (including each spec that carries a BRD-039 slice).
- Rows for BRD-027, BRD-022, BRD-026, BRD-037 and NFR-002/003/005 list many secondary SPECs because those rules are enforced in every feature spec through the SPEC-001 kernels and SPEC-002 authorisation.
- A `[n AC/NAC with no TC link in spec]` marker is explained in gap G-06.

### 1.2 QA tasks that cover "all" IDs of their spec (refs = `all`)

| SPEC | TASK ids |
|---|---|
| SPEC-002 | TASK-002.34, TASK-002.35 |
| SPEC-003 | TASK-003.25 |
| SPEC-005 | TASK-005.29, TASK-005.30 |
| SPEC-006 | TASK-006.25, TASK-006.26 |
| SPEC-008 | TASK-008.29, TASK-008.30 |
| SPEC-009 | TASK-009.27 |
| SPEC-012 | TASK-012.20 |
| SPEC-014 | TASK-014.28 |

## 2. BRD-OQ-01 … BRD-OQ-20 → SPEC mapping

All twenty open questions are Resolved (OQ-09 resolved as deferred to infrastructure/deployment planning). "Primary SPEC(s)" is the spec that implements the resolution; "All evidencing SPECs" lists every spec whose section 3, tasks or AC/NAC cite the question.

| BRD-OQ | Topic | Primary SPEC(s) | All evidencing SPECs (section 3 / task / AC) | Tasks | AC / NAC |
|---|---|---|---|---|---|
| **BRD-OQ-01** | Local credentials vs SSO | SPEC-002 | 001, 002, 016 | — | — |
| **BRD-OQ-02** | User ID convention + password/lockout/session standards | SPEC-002, SPEC-004 | 002, 004 | — | — |
| **BRD-OQ-03** | Credential delivery mechanism | SPEC-004, SPEC-012 | 001, 004, 012, 015 | — | — |
| **BRD-OQ-04** | Receiving Manager enabled or configurable | SPEC-007, SPEC-003 | 003, 004, 007, 014 | — | — |
| **BRD-OQ-05** | Point of vacancy reservation | SPEC-005 | 005 | — | 005: AC10 |
| **BRD-OQ-06** | Concurrency/reservation rules, closure/hold behaviour | SPEC-005 | 001, 005 | — | — |
| **BRD-OQ-07** | HR organisation metadata fields and source | SPEC-008, SPEC-003 | 003, 008 | — | — |
| **BRD-OQ-08** | Document types, size, storage, scanning, retention | SPEC-011 | 001, 011 | TASK-011.02,16 | 011: AC20; NAC19–20 |
| **BRD-OQ-09** | Performance/availability/backup/monitoring targets (deferred) | SPEC-015 | 001, 011, 012, 014, 015 | — | — |
| **BRD-OQ-10** | Reviewer sequence, HR eligibility, hierarchy source, withdrawal, escalation | SPEC-007, SPEC-014, SPEC-003 | 003, 005, 007, 012, 014 | — | — |
| **BRD-OQ-11** | No-IT-task transfers (IT Final Approval) | SPEC-009 | 009 | TASK-009.14 | 009: AC17,19 |
| **BRD-OQ-12** | Withdrawal stage, reason, reopening | SPEC-010 | 006, 007, 010, 012, 014, 016 | TASK-010.08 | 010: AC01; NAC02 |
| **BRD-OQ-13** | Block/Resume/Cancel/Reassign roles and statuses | SPEC-010 | 005, 010, 012 | TASK-010.09 | — |
| **BRD-OQ-14** | HR Confirmation, HR vs Payroll order, payroll source, invalid-transition response | SPEC-007, SPEC-008, SPEC-009 | 007, 008, 009, 010, 012, 015 | TASK-007.09<br>TASK-008.01 | 007: AC04–05,14; NAC20<br>008: AC12–13,18; NAC08<br>009: AC05,08; NAC04 |
| **BRD-OQ-15** | Vacancy edge cases (resume validation, status change, release, Available=Open) | SPEC-005 | 005, 006, 008, 009, 010, 012 | TASK-005.17–18,27<br>TASK-010.10,26 | 005: AC06,20–23,25; NAC04,13–15,17,22<br>010: AC12–14; NAC14 |
| **BRD-OQ-16** | Eligibility gaps (active definition, data source, HR-ineligible outcome, same vacancy) | SPEC-006, SPEC-008 | 003, 004, 006, 008, 010, 015 | — | 010: AC24 |
| **BRD-OQ-17** | One-active gaps (Draft, DB enforcement, 409, cool-down) | SPEC-006 | 006, 010 | — | — |
| **BRD-OQ-18** | HR/IT controlled stages, HR cancel, Draft exclusion, cross-resume | SPEC-010 | 005, 009, 010, 012 | TASK-010.05,10–11,26 | 010: AC06–07,11,16,25; NAC06–07,10–11,15 |
| **BRD-OQ-19** | Per-field source of truth, no HR sync, in-flight values, HR master, missing-data contact | SPEC-015, SPEC-004, SPEC-003 | 001, 003, 004, 006, 008, 009, 015 | — | 008: AC28; NAC24 |
| **BRD-OQ-20** | Effective Transfer Date roles, time zone, re-approval, expired date | SPEC-006 | 001, 006, 007, 008, 009 | — | 008: AC26<br>009: AC26 |

## 3. Inventory coverage

Evidence columns in 3.1–3.4 and 3.8–3.11 list the top keyword-scored candidate AC / NAC / TASK ids in each SPEC (all ids exist); the authoritative mapping of those items is by BRD/NFR id through section 1. Sections 3.5, 3.6, 3.7 and 3.12 are mapped item by item.

### 3.1 Business objectives (6)

| ID | BRD item | Realised by (BRD / NFR) | SPEC(s) (primary first) | Key evidence (top-scoring AC / NAC / TASK per SPEC) |
|---|---|---|---|---|
| BO-1 | Employees submit internal transfer requests against configured departments, locations, designations and vacancies | BRD-011, BRD-016, BRD-017, BRD-003 | SPEC-006, SPEC-003, SPEC-005 | 006: AC08,10,20; NAC07,10–12; TASK-006.01,07,11,21<br>003: AC01–02,14,18,25,31–32; NAC01; TASK-003.01–02,04,07<br>005: AC01–02,04,06–07,16,20,27; NAC01–04; TASK-005.01–03,35 |
| BO-2 | Individual login and role-aware view of assigned employees, requests and tasks | BRD-001, BRD-026, BRD-012, BRD-013, BRD-014 | SPEC-002, SPEC-014, SPEC-004 | 002: AC03,08,21,24,31; NAC01,06,15; TASK-002.09–10,14,36<br>014: AC05,07; NAC01,16; TASK-014.05,07–08,29<br>004: AC04,11,14,20,31,33; NAC04,07,10,14; TASK-004.01,08,11,27 |
| BO-3 | Traceable Reporting Manager, optional Receiving Manager and HR review stages | BRD-012, BRD-013, BRD-018, BRD-019, BRD-027 | SPEC-007, SPEC-008 | 007: AC01,08–10,14; NAC08–09; TASK-007.01–02,04,08<br>008: AC03; TASK-008.08,10,20,25 |
| BO-4 | Controlled downstream HR, payroll and IT activities after approval | BRD-013, BRD-014, BRD-018, BRD-020, BRD-027 | SPEC-008, SPEC-009 | 008: AC10,12,18; TASK-008.02,18,20<br>009: AC08; NAC06; TASK-009.08,25 |
| BO-5 | Modern Super Admin Panel for organisation setup, user management, vacancies and transfer administration | BRD-002, BRD-003, BRD-010 | SPEC-003, SPEC-004, SPEC-005, SPEC-010 | 003: AC15–16; TASK-003.01–03,24<br>004: AC01–02,10–11,26,34; NAC01; TASK-004.01,12–13,23<br>005: AC01–05,23,25,30; NAC01–04; TASK-005.01–04<br>010: AC05,10,15,18–19,27; NAC04; TASK-010.21 |
| BO-6 | Reduce manual follow-up through notifications, clear ownership, exception handling, dashboards and audit logs | BRD-023, BRD-036, BRD-037, BRD-022, BRD-027, BRD-035 | SPEC-012, SPEC-014, SPEC-013, SPEC-010 | 012: AC21–22; NAC09,14; TASK-012.01,19,21–22<br>014: AC11–12,23; TASK-014.01,15,19–20<br>013: AC07,16; NAC01,18; TASK-013.01–02,13,27<br>010: AC15,17,25; NAC16; TASK-010.06,13,15,20 |

### 3.2 Scope items (10 bullets + proposed architecture)

| ID | BRD item | Realised by (BRD / NFR) | SPEC(s) (primary first) | Key evidence (top-scoring AC / NAC / TASK per SPEC) |
|---|---|---|---|---|
| SC-01 | Modern responsive Admin Panel and role-based dashboards | BRD-002, NFR-008 | SPEC-003, SPEC-001, SPEC-014 | 003: AC09; TASK-003.15,17,24<br>001: AC20,24; NAC12; TASK-001.28<br>014: AC01–04,11–12,23; NAC14; TASK-014.07,19,21–22 |
| SC-02 | User account creation with automatically generated unique User ID and temporary password | BRD-004, BRD-005, BRD-009 | SPEC-004, SPEC-002 | 004: AC03,06–08,41; NAC23,30; TASK-004.01–02,04,06<br>002: AC04,07 |
| SC-03 | Location, department/business unit and designation master management | BRD-010, BRD-003 | SPEC-003 | 003: AC14–16,18; NAC15; TASK-003.01–03,22 |
| SC-04 | Employee, Reporting Manager, HR and IT user management and assignment | BRD-010, BRD-016, BRD-004 | SPEC-004, SPEC-003 | 004: AC33; TASK-004.01,03,08–09<br>003: NAC03; TASK-003.11 |
| SC-05 | Vacancy creation and capacity/headcount management | BRD-010, BRD-017, BRD-028 | SPEC-005 | 005: AC01,04; TASK-005.01,06,08–09 |
| SC-06 | Transfer request initiation, approval, validation, execution and closure | BRD-011 BRD-012 BRD-013 BRD-014 BRD-018 BRD-027 | SPEC-006, SPEC-007, SPEC-008, SPEC-009 | 006: AC05–08,10,13,16,23; NAC02,06,12,22; TASK-006.01,07,11,14<br>007: AC01,06; NAC07; TASK-007.06–07,10,13<br>008: AC03,10–11,15,18; NAC03,09; TASK-008.10,20<br>009: AC01,03,05,07,15–16,18–19; NAC02,04,06,12; TASK-009.04,08,25 |
| SC-07 | HR organisation metadata update and payroll task assignment | BRD-020, BRD-024, BRD-013 | SPEC-008, SPEC-009 | 008: AC23–24; NAC07,20–21; TASK-008.03,09,15,26<br>009: AC01–03,05–08,27; NAC01,03,05–06; TASK-009.01,05–06,08 |
| SC-08 | Transfer/organisation document upload and controlled access | BRD-021, NFR-007 | SPEC-011 | 011: AC01–02,11,14; TASK-011.04,07,15,24 |
| SC-09 | IT task assignment and completion tracking | BRD-014 | SPEC-009 | 009: AC04,30; NAC24; TASK-009.09,21,25 |
| SC-10 | Notifications, operational reporting, audit logs and exception handling | BRD-023, BRD-036, BRD-037, BRD-027 | SPEC-012, SPEC-014, SPEC-013, SPEC-010 | 012: AC03,06,15,17,20–23; NAC01–02,09,14; TASK-012.19,21–22,25<br>014: AC02,05,11–16; NAC01–03,11; TASK-014.01–02,04,15<br>013: AC01–07,16; NAC01–03,18; TASK-013.01–02,13,27<br>010: AC25; TASK-010.06,13,15,20 |
| SC-11 | Proposed architecture: Next.js frontend, Node.js backend (RBAC, validation, orchestration, APIs), PostgreSQL, controlled handoffs to enterprise systems (handoffs: none built this phase, see IB-01) | NFR-004, BRD-038 | SPEC-001, SPEC-015 | 001: AC01,04,06,11–12,26–27; NAC03,10–11; TASK-001.04,07,11–12<br>015: AC06,08,10–12,26; NAC03,30; TASK-015.01,06–08 |

### 3.3 Actors, roles and organisation hierarchy

| ID | BRD item | Realised by (BRD / NFR) | SPEC(s) (primary first) | Key evidence (top-scoring AC / NAC / TASK per SPEC) |
|---|---|---|---|---|
| AR-01 | Super Admin: organisation setup, user administration, vacancy/capacity, transfer administration; all configured data and workflows | BRD-010 | SPEC-003, SPEC-004, SPEC-010 | 003: AC01,03,10–13,15–16; NAC14–15,17,20; TASK-003.01–04<br>004: AC01–02,04,10–11,13,16,20; NAC01,20,24; TASK-004.01,07,12–13<br>010: AC05,10,15,19,25; TASK-010.06,13,15,20 |
| AR-02 | Employee: initiate/track own requests; own profile, permitted vacancies, own transfer history | BRD-011 | SPEC-006 | 006: AC01,10,12,17,20,24–25,28; TASK-006.01,04,11,14 |
| AR-03 | Reporting Manager: review requests for assigned employees | BRD-012 | SPEC-007, SPEC-003 | 007: AC01,08–09,16,21; NAC01,08<br>003: AC08,28; NAC01,03,07,12; TASK-003.08 |
| AR-04 | Receiving Manager (optional): review incoming transfers routed to target team/organisation scope | BRD-012, BRD-024 | SPEC-007, SPEC-003 | 007: AC08–10,13–16,18; NAC08–09; TASK-007.11<br>003: AC16,25–27,29–30,34; NAC01,03,06–07; TASK-003.08,10–11,13 |
| AR-05 | HR: eligibility validation, target organisation confirmation, documents, downstream coordination within assigned location/organisation scope | BRD-013 | SPEC-008, SPEC-003 | 008: AC01; NAC01; TASK-008.07,09,24<br>003: AC04,25–26,31–32,34; NAC01,06,17; TASK-003.03,08,10,13 |
| AR-06 | IT: execute access/provisioning tasks; assigned IT tasks and minimum required employee information | BRD-014 | SPEC-009, SPEC-003 | 009: AC09–11,30; NAC09; TASK-009.09<br>003: AC27; TASK-003.10 |
| AR-07 | Individual authenticated account; role-based and scope-based access; Super Admin cross-organisation visibility | BRD-001, BRD-026, NFR-002 | SPEC-002, SPEC-003 | 002: AC03; NAC06,08,15; TASK-002.09,14–16<br>003: AC16,25–27,30,34; NAC03,06–08; TASK-003.08,10–11,13 |
| AR-08 | Organisation hierarchy Super Admin > Location > HR > Reporting Manager > Employee, with location-based IT teams | BRD-016 | SPEC-003, SPEC-004 | 003: AC08,28; NAC01,03,13; TASK-003.01–03,06<br>004: AC02,14,16,30,33; NAC05,12; TASK-004.09 |

### 3.4 Business Rules bullets (24)

| ID | BRD item | Realised by (BRD / NFR) | SPEC(s) (primary first) | Key evidence (top-scoring AC / NAC / TASK per SPEC) |
|---|---|---|---|---|
| BR-01 | No Completed after Reporting/Receiving Manager/HR approval alone; completed HR/Payroll + IT Final Approval; No IT Action Required still needs Final Approval | BRD-014, BRD-018, BRD-019, BRD-027 | SPEC-009, SPEC-007 | 009: AC18–19; TASK-009.04,08,25<br>007: AC02,06; NAC03,06–07 |
| BR-02 | Vacancy reserved only at HR validation; concurrency controlled; none against Full/On Hold/Closed; reserved+filled never exceed total; release on reject/withdraw/cancel; retain while Blocked; final allocation on completion | BRD-017, BRD-028 | SPEC-005, SPEC-008, SPEC-009 | 005: AC12,16; NAC05,09,11–12; TASK-005.05,09,13–14<br>008: AC03–04,07–08,17–18,21–22; NAC13–15,17; TASK-008.10–11,18,20<br>009: AC16–20,22,25–26; NAC06–07,12–13; TASK-009.04,08,16,20 |
| BR-03 | Eligibility: Active, no other active nor approved-not-Completed, mandatory org data, Available vacancy, HR validation; no tenure; no other restriction assumed | BRD-029 | SPEC-006, SPEC-008 | 006: AC04,09,16; TASK-006.01–02,05–06<br>008: AC02–03,06–07; NAC22–23; TASK-008.08,25 |
| BR-04 | Portal is operational source of employee/organisation data; no HR sync; in-flight values on Transfer Request; masters never free text; missing data blocks submission; HR ineligible reject vs clarify | BRD-029, BRD-OQ-16, BRD-OQ-19 | SPEC-015, SPEC-004, SPEC-006, SPEC-008 | 015: AC01,03,29,36; NAC16; TASK-015.01–02,05,29<br>004: AC12,15–16,19,32; NAC04,14; TASK-004.11,13,15,25<br>006: AC06; TASK-006.04,10,19,26<br>008: AC08; TASK-008.12,28 |
| BR-05 | One active transfer per employee (Completed/Rejected/Withdrawn/Cancelled closed); new request = new ID + revalidation + restart + no reused approvals; backend and DB enforced | BRD-030 | SPEC-006 | 006: AC13–15; NAC08; TASK-006.01–02,06,21 |
| BR-06 | Block/Resume/Cancel/Reassign rules (who/when, reasons, stored status, revalidation, Draft excluded, no bypass, audited) | BRD-027, BRD-OQ-13, BRD-OQ-18 | SPEC-010 | 010: AC25; TASK-010.06,13,15,20 |
| BR-07 | Effective Transfer Date: current date to +30 days inclusive (business TZ), fixed; no past dates; who/when may change; weekends/holidays allowed; expired date blocks completion; optional re-approval; audited | BRD-031, BRD-OQ-20 | SPEC-006, SPEC-008, SPEC-009, SPEC-007 | 006: AC21–22; TASK-006.03,06–08<br>008: AC03,15–17,25–27; NAC05–07,09; TASK-008.03,10,13,19<br>009: AC18,24–28; NAC17–18,25–26; TASK-009.05,15,17,26<br>007: AC19–20; NAC16 |
| BR-08 | Employee edits only in Draft; post-submission change by HR/Super Admin only; no silent overwrite; BRD-024 for four fields; every change audited incl. previous/new/reason/re-approval flag | BRD-032 | SPEC-006, SPEC-008 | 006: AC16,18,23,26; NAC06,22; TASK-006.01,07,11,20<br>008: AC14,16,24; TASK-008.03,11,15,26 |
| BR-09 | Rejection: mandatory reason, history + audit, Employee notified, Rejected final, reservation released, no reopen/resubmit, new application = new reference | BRD-033, BRD-030 | SPEC-007, SPEC-006 | 007: AC15,21,23–24; NAC04,10,12,14; TASK-007.05,09,14,22<br>006: AC20; NAC14,22; TASK-006.01,09,11,30 |
| BR-10 | HR change of Department/BU, Designation, Location or Reporting Manager returns to Receiving Manager re-approval when enabled; no bypass | BRD-024 | SPEC-008, SPEC-007 | 008: AC15; TASK-008.04,07,17,27<br>007: AC13–15,19–20; NAC09,16; TASK-007.32 |
| BR-11 | RM, Receiving Manager and HR rejection need a mandatory reason; reviewer may instead request clarification; history retained | BRD-033, BRD-034, BRD-012, BRD-013 | SPEC-007, SPEC-008 | 007: AC15,21,24; NAC12; TASK-007.04–05,14,22<br>008: AC06–09,17,19; NAC07,15,17; TASK-008.11–12,18,28 |
| BR-12 | Clarification: mandatory question, Info Required temporary, same reference, same stage/reviewer, request/response audited, multiple cycles, no workflow restart | BRD-034 | SPEC-007 | 007: AC25,27; TASK-007.04,10,15,23 |
| BR-13 | Administrative reassignment: Super Admin only; new assignee has role+scope; reason; notified; previous assignee read-only; no re-approval; audited; no bypass | BRD-035 | SPEC-010, SPEC-003 | 010: AC19,21–22; NAC24,27; TASK-010.03,05,12,27<br>003: AC31; NAC11; TASK-003.13 |
| BR-14 | Notifications: twelve mandatory events; Email only for account creation/reset, Email+In-app for workflow events; failure never rolls back; failures logged; retry idempotent | BRD-036 | SPEC-012 | 012: NAC07; TASK-012.14,21 |
| BR-15 | Audit logging: content; append-only; Super Admin views all, others scoped; Super Admin-only export, export audited; lifetime retention; no credentials; security events | BRD-037, NFR-005 | SPEC-013 | 013: AC07; TASK-013.03–04,06,29 |
| BR-16 | Performance & availability: TBC numeric inputs, integration timeout per integration, 5 MB, controlled retry, transaction consistency, pre-production validation | BRD-038, NFR-009 | SPEC-015, SPEC-016 | 015: AC14,28–30; NAC08,12–13,21; TASK-015.10–11,18,23<br>016: AC06,22–24; NAC03,13; TASK-016.21–22,24,26 |
| BR-17 | Mandatory negative acceptance scenarios (BRD-039) validated before production; failed scenarios resolved | BRD-039 | SPEC-016 | 016: AC06–10; NAC01–02,09; TASK-016.06–08,10 |
| BR-18 | Withdrawal only until HR approves (four statuses), reason mandatory, Withdrawn final, exceptional reservation released, downstream cancelled, audited | BRD-027 (Withdrawal), BRD-OQ-12 | SPEC-010 | 010: AC01,03–04,23; NAC01,18,28; TASK-010.01,07,15,20 |
| BR-19 | Workflow status changes follow the BRD-027 matrix and are backend-validated; invalid or unauthorised transitions rejected | BRD-027, BRD-019 | SPEC-007 | 007: AC01–04,06,16,23; NAC01,07; TASK-007.06–07,10,26 |
| BR-20 | IT users see only the minimum employee/transfer information required (least privilege) | BRD-014, NFR-007 | SPEC-009, SPEC-004, SPEC-014 | 009: AC11; NAC11; TASK-009.09,11,19<br>004: AC01–02,04,06–09,32; NAC01,03,05,13; TASK-004.01–03,27<br>014: AC09; TASK-014.09–10,28 |
| BR-21 | Receiving Manager review stage is enabled/disabled by configurable policy, not hard-coded | BRD-012, BRD-OQ-04 | SPEC-007 | 007: AC18; TASK-007.01,11–12,25 |
| BR-22 | Document access scoped by role and organisation; API/server-level security (5 MB, PDF/image only, MIME+extension, sanitised names, authenticated endpoint, no public URLs) | BRD-021, NFR-007 | SPEC-011 | 011: AC11; TASK-011.04–06,09 |
| BR-23 | Payroll calculations, compensation and statutory processing remain with the authoritative payroll system; portal only coordinates handoff/status | BRD-020, BRD-027(c) | SPEC-009, SPEC-015 | 009: AC05; TASK-009.01,05–07<br>015: AC12,33; NAC03,05,07,10; TASK-015.07,10–11,27 |
| BR-24 | Integration Requirements: no external Payroll/HR integration/API this phase; future integration needs approved contract with eleven elements; NFR-006 retry/duplicate/visibility rules | NFR-006, BRD-038 | SPEC-015 | 015: AC13–14; NAC09,12; TASK-015.08–10 |

### 3.5 BRD-027 Workflow Transition Matrix rows (37) and BRD-027 narrative rules

Every row of the BRD-027 matrices (the main matrix, the four Withdraw rows and the thirteen Block/Resume/Cancel/Reassign rows = 37 rows) is mapped to the SPEC-007 rule `TR-nnn` (SPEC-007 section 16.2, the golden-matrix source), the handler SPEC that registers the behaviour, and the acceptance evidence. Evidence below was selected by reading the AC/NAC text, not by keyword.

| # | Current status | Action by | Action | Next status / outcome | SPEC-007 rule | Handler SPEC | AC / NAC | Tasks | TC |
|---|---|---|---|---|---|---|---|---|---|
| M-01 | Draft | Employee | Submit | Pending Reporting Manager Approval; RM notified; no reservation | TR-001 | SPEC-006 | SPEC-006.AC10, AC12; SPEC-007.AC17 | TASK-006.10–12; TASK-007.08 | TC-007.14; SPEC-006 section 23.7 |
| M-02 | Pending Reporting Manager Approval | Reporting Manager | Approve | Pending Receiving Manager Approval* or Pending HR Review | TR-002 | SPEC-007 | SPEC-007.AC01, AC08, AC09; NAC01, NAC08 | TASK-007.12–13 | TC-007.14, TC-007.15 |
| M-03 | Pending Reporting Manager Approval | Reporting Manager | Reject (reason) | Rejected; employee notified; reservation released | TR-003 | SPEC-007 | SPEC-007.AC21–AC24; NAC12, NAC14 | TASK-007.14 | TC-007.17 |
| M-04 | Pending Reporting Manager Approval | Reporting Manager | Request Clarification (reason) | Info Required | TR-004 | SPEC-007 | SPEC-007.AC25, AC27–AC29; NAC12, NAC13 | TASK-007.04, .15 | TC-007.16 |
| M-05 | Pending Receiving Manager Approval | Receiving Manager | Approve | Pending HR Review; Employee + HR notified | TR-005 | SPEC-007 | SPEC-007.AC10, AC17; NAC08 | TASK-007.13 | TC-007.14 |
| M-06 | Pending Receiving Manager Approval | Receiving Manager | Reject (reason) | Rejected | TR-006 | SPEC-007 | SPEC-007.AC03 (golden matrix), AC21–AC23 (shared REJECT handler); NAC12 — **no AC names this exact row** (gap G-09) | TASK-007.14, .26 | TC-007.10–.12, TC-007.17 |
| M-07 | Pending Receiving Manager Approval | Receiving Manager | Request Clarification (reason) | Info Required | TR-007 | SPEC-007 | SPEC-007.AC03, AC25 (shared handler); NAC13 — **no AC names this exact row** (gap G-09) | TASK-007.15, .26 | TC-007.10–.12, TC-007.16 |
| M-08 | Info Required | Employee | Respond to Clarification | Previous approval/review stage; requesting approver notified | TR-008 | SPEC-007 | SPEC-007.AC26–AC30; NAC13 | TASK-007.15, .23 | TC-007.16 |
| M-09 | Pending HR Review | HR | Validate & Approve | HR Processing; capacity validated and reserved | TR-009 | SPEC-008 (+SPEC-005) | SPEC-008.AC03–AC05; SPEC-005.AC09, AC10, AC17, AC18 | TASK-008.10; SPEC-005 reserve tasks | TC-008.11, TC-008.12, TC-008.55; SPEC-005 TC-005.46–.53 |
| M-10 | Pending HR Review | HR | Reject (reason) | Rejected; reservation released | TR-010 | SPEC-007 (+SPEC-008) | SPEC-008.AC06, AC07; SPEC-007.AC21, AC22 | TASK-008.11; TASK-007.14 | TC-008.13, TC-007.17 |
| M-11 | Pending HR Review | HR | Request Clarification (reason) | Info Required; reservation retained if it exists | TR-011 | SPEC-007 (+SPEC-008) | SPEC-008.AC08, AC09; SPEC-007.AC30 | TASK-008.12; TASK-007.15 | TC-008.14, TC-007.16 |
| M-12 | HR Processing | HR | Change Dept/BU, Designation, Location or Reporting Manager (change reason) | Pending Receiving Manager Re-Approval* (or HR Processing when RM disabled); vacancy revalidated | TR-012 | SPEC-008 (routing in SPEC-007) | SPEC-008.AC14, AC15, AC21–AC24; SPEC-007.NAC09 | TASK-008.15–17; TASK-007.12 | TC-008.05, TC-008.15, TC-008.58, TC-008.62; TC-007.15 |
| M-13 | Pending Receiving Manager Re-Approval | Receiving Manager | Approve | HR Processing; reservation retained; HR reconfirms | TR-013 | SPEC-007 (+SPEC-008) | SPEC-007.AC14; SPEC-008.AC16, AC18, AC20 | TASK-008.18; TASK-007.13 | TC-007.15, TC-008.17, TC-008.62 |
| M-14 | Pending Receiving Manager Re-Approval | Receiving Manager | Reject (reason) | Rejected; reservation released | TR-014 | SPEC-007 (+SPEC-008) | SPEC-007.AC15; SPEC-008.AC17 | TASK-008.18; TASK-007.14 | TC-007.17, TC-008.17 |
| M-15 | HR Processing | HR | Complete HR Processing | Payroll Processing; Payroll task assigned | TR-016 | SPEC-008 / SPEC-009 | SPEC-008.AC10–AC13; SPEC-009.AC01, AC08 | TASK-008.13, .20; TASK-009.08 | TC-008.19, TC-008.61; TC-009.55 |
| M-16 | Payroll Processing | Authorised HR | Mark Payroll Activity Completed | Pending IT Action; status, completed by, time, reference, remarks recorded | TR-017 | SPEC-009 | SPEC-009.AC02–AC04, AC07, AC08; NAC01, NAC02 | TASK-009.06–08 | TC-009.55, TC-009.63–.64 |
| M-17 | Pending IT Action | IT | Complete IT Tasks | Pending IT Final Approval | TR-018 | SPEC-009 | SPEC-009.AC15, AC16 | TASK-009.10, .13 | TC-009.55 |
| M-18 | Pending IT Action | IT | No IT Action Required (reason/remark) | Pending IT Final Approval | TR-019 | SPEC-009 | SPEC-009.AC17, AC19 | TASK-009.14 | TC-009.55 |
| M-19 | Pending IT Final Approval | IT | Final Approve | Completed; reservation becomes final allocation; completion notification | TR-020 | SPEC-009 | SPEC-009.AC18–AC22, AC24, AC25; NAC06, NAC07, NAC12, NAC14 | TASK-009.15–16, .18 | TC-009.55, TC-009.58, TC-009.68–.69 |
| M-20 | Completed | — | — | No further normal transition | none (SPEC-007 16.5) | SPEC-007 / SPEC-009 / SPEC-010 | SPEC-007.AC06; NAC06, NAC07; SPEC-009.AC23; SPEC-010.NAC18, NAC19, NAC21 | TASK-009.20; TASK-010.04, .13 | TC-007.12; TC-010.51 |
| M-21 | Pending Reporting Manager Approval | Employee | Withdraw (reason) | Withdrawn; pending approver notified | TR-021 | SPEC-010 | SPEC-010.AC01, AC04; NAC01, NAC03, NAC04 | TASK-010.08 | TC-010.07 |
| M-22 | Pending Receiving Manager Approval* | Employee | Withdraw (reason) | Withdrawn | TR-022 | SPEC-010 | SPEC-010.AC02 | TASK-010.08 | TC-010.07 |
| M-23 | Info Required | Employee | Withdraw (reason) | Withdrawn; requesting approver notified | TR-023 | SPEC-010 | SPEC-010.AC02 | TASK-010.08 | TC-010.07 |
| M-24 | Pending HR Review | Employee | Withdraw (reason) | Withdrawn; HR notified; any exceptional reservation released | TR-024 | SPEC-010 | SPEC-010.AC02, AC03; NAC02, NAC28 | TASK-010.07, .08 | TC-010.07, TC-010.08, TC-010.41 |
| M-25 | Any active / non-final | Super Admin | Block (reason) | Blocked; previous status stored; reservation retained | TR-025 | SPEC-010 | SPEC-010.AC05, AC08, AC09; NAC05, NAC09, NAC10 | TASK-010.09, .13 | TC-010.09, TC-010.10, TC-010.43 |
| M-26 | Pending HR Review / HR Processing / Payroll Processing (HR scope) | HR | Block (reason) | Blocked | TR-026 | SPEC-010 | SPEC-010.AC06; NAC06, NAC08 | TASK-010.05, .09 | TC-010.09, TC-010.34 |
| M-27 | Pending IT Action / Pending IT Final Approval (IT scope) | IT | Block (reason) | Blocked | TR-027 | SPEC-010 | SPEC-010.AC07; NAC07, NAC08 | TASK-010.05, .09 | TC-010.09, TC-010.34 |
| M-28 | Blocked | Super Admin | Resume | Stored pre-block status after revalidation; failure keeps Blocked | TR-028 | SPEC-010 (+SPEC-005) | SPEC-010.AC10, AC12–AC14; NAC12–NAC14; SPEC-005.AC20–AC23 | TASK-010.10; SPEC-005 `validateForResume` task | TC-010.11–.13, TC-010.44 |
| M-29 | Blocked (HR-controlled stage, HR scope) | HR | Resume | Previous HR-controlled status | TR-029 | SPEC-010 | SPEC-010.AC11; NAC11 | TASK-010.10 | TC-010.11, TC-010.35 |
| M-30 | Blocked (IT-controlled stage, IT scope) | IT | Resume | Previous IT-controlled status | TR-030 | SPEC-010 | SPEC-010.AC11; NAC11 | TASK-010.10 | TC-010.11, TC-010.35 |
| M-31 | Any active / non-final | Super Admin | Cancel (reason) | Cancelled; reservation released; Payroll/IT tasks cancelled | TR-031 | SPEC-010 | SPEC-010.AC15, AC18; NAC17, NAC18, NAC22 | TASK-010.07, .11 | TC-010.14, TC-010.15, TC-010.42 |
| M-32 | Pending HR Review / HR Processing / Payroll Processing (HR scope) | HR | Cancel (reason) | Cancelled | TR-032 | SPEC-010 | SPEC-010.AC16; NAC15 | TASK-010.05, .11 | TC-010.14 |
| M-33 | Blocked (blocked in an HR-controlled stage, HR scope) | HR | Cancel (reason) | Cancelled | TR-033 | SPEC-010 | SPEC-010.AC17 | TASK-010.11 | TC-010.14, TC-010.35 |
| M-34 | Blocked (blocked in an IT-controlled stage) | HR | Cancel | **Refused**; audited as security event | TR-033 origin-stage guard | SPEC-010 | SPEC-010.NAC16 | TASK-010.05, .14 | TC-010.35 |
| M-35 | Blocked (any stage) | Super Admin | Cancel (reason) | Cancelled | TR-031 (includes Blocked) | SPEC-010 | SPEC-010.AC15 (any ACTIVE status including Blocked) | TASK-010.11 | TC-010.14 |
| M-36 | Active pending task (RM, Receiving Manager, HR or IT) | Super Admin | Reassign (reason) | Same status, new assignee; no re-approval | TR-034 | SPEC-010 | SPEC-010.AC19–AC22, AC25, AC29; NAC24, NAC25, NAC27 | TASK-010.12 | TC-010.16–.19, TC-010.45 |
| M-37 | Any active task | HR / IT / RM / Receiving Manager / Employee | Reassign | **Refused** (only Super Admin); audited as security event | absence of a cell + denial audit (SPEC-007 16.2 note) | SPEC-010 | SPEC-010.NAC23, NAC24 | TASK-010.05, .14 | TC-010.36 |

Rows `M-02`, `M-05`, `M-13`: `*` = routing decided by the Receiving Manager configuration (SPEC-007.AC08/AC09). BRD-027 pieces outside the three matrices:

| ID | BRD-027 narrative rule | SPEC(s) | Evidence |
|---|---|---|---|
| N-01 | (a) HR Confirmation is an activity inside HR Processing, not a status; re-approval returns to HR Processing | SPEC-008, SPEC-007 | SPEC-008.AC10, AC18; SPEC-007.AC14; TASK-008.13 |
| N-02 | (b) HR Processing and Payroll Processing sequential: HR Processing > Payroll Processing > Pending IT Action | SPEC-008, SPEC-009, SPEC-007 | SPEC-009.AC08; SPEC-008.AC12, AC13; SPEC-007.AC06; TASK-009.08 |
| N-03 | (c) Payroll completion manual by authorised HR; no payroll calculation, API, callback or webhook; reference/remarks recorded | SPEC-009, SPEC-015 | SPEC-009.AC02–AC05, AC07; NAC01; SPEC-015 TC-015.47–.52 |
| N-04 | (d) Invalid transition: HTTP 403 `INVALID_WORKFLOW_TRANSITION` with the exact message; status unchanged; no downstream effect; audited as security event | SPEC-007 (+SPEC-013, SPEC-001) | SPEC-007.AC04, AC05, NAC20, NAC22; SPEC-013.AC17, NAC15; SPEC-001 kernel (TC-001.43) |
| N-05 | Completion rule: five conditions; no IT Final Approval while Payroll incomplete; IT Final Approval mandatory for every transfer | SPEC-009 (+SPEC-007) | SPEC-009.AC18, AC19, AC24, NAC06, NAC07, NAC12, NAC14; SPEC-007.AC06, NAC07 |
| N-06 | Backend enforcement chain User > Role > Scope > Transfer > Status > Action > Next status; direct API cannot bypass | SPEC-007, SPEC-002 | SPEC-007.AC03, AC04, NAC03–NAC05; SPEC-002.AC28 |
| N-07 | Rejection rules (reason, history, audit, notify, final, release, no reopen) | SPEC-007 | SPEC-007.AC21–AC24, NAC12, NAC14 |
| N-08 | Clarification rules (reason, Info Required, same reference, return to same stage, multiple cycles) | SPEC-007 (+SPEC-008) | SPEC-007.AC25–AC30; SPEC-008.AC08, AC09, AC19 |
| N-09 | Withdrawal rules (until HR approves; reason; final; exceptional reservation released; downstream cancelled; new request on reapply) | SPEC-010 (+SPEC-006) | SPEC-010.AC01–AC04, AC23, NAC01, NAC02, NAC18; SPEC-006.AC20 |
| N-10 | Vacancy impact column (reserve at HR approval, release on Rejected/Withdrawn/Cancelled, retain on Blocked, final on Completed, atomic vacancy change, Full/On Hold/Closed) | SPEC-005 (+SPEC-007, SPEC-008, SPEC-009, SPEC-010) | SPEC-005.AC09–AC19; SPEC-007.AC22; SPEC-008.AC21, AC22; SPEC-009.AC20; SPEC-010.AC03, AC09 |
| N-11 | BRD-024 metadata change audit fields (changed field, previous, new, by, time, reason, re-approval triggered, RM decision) | SPEC-008 (+SPEC-013) | SPEC-008.AC14, AC17, AC18, AC24; SPEC-013 catalogue |
| N-12 | Block/Resume/Cancel/Reassign scope: none bypasses mandatory approvals; Draft excluded; all audited | SPEC-010 | SPEC-010.AC22, AC25, NAC10, NAC25 |

### 3.6 BRD "Acceptance Criteria" bullets (40)

The BRD Acceptance Criteria section has 40 bullets. SPEC-016 section 3.5 numbers them `AB-01 … AB-40` in BRD order and lists the owning acceptance ids. Each cited id was resolved against the spec files, and the last column checks that at least one cited criterion carries the BRD/NFR id the bullet is about.

| AB | BRD "Acceptance Criteria" bullet (abridged) | Owning SPEC(s) | Owning acceptance ids (SPEC-016 section 3.5, all resolve) | SPEC-016 verification | Check: expected BRD id tagged on a cited AC |
|---|---|---|---|---|---|
| AB-01 | Super Admin accesses modern role-aware Admin Panel; manages master data and user modules | SPEC-003, SPEC-001 | SPEC-003.AC01–AC09a, AC10–AC14, AC20–AC22; SPEC-001.AC20–AC24 | AC12, AC15 (UI E2E) | OK: BRD-002, BRD-003, BRD-010 |
| AB-02 | Super Admin creates Employee/RM/HR/IT accounts within scope | SPEC-004 | SPEC-004.AC01, AC02, AC04, AC35 | UAT-01 | OK: BRD-004 |
| AB-03 | Unique User ID and strong temporary password | SPEC-004, SPEC-002, SPEC-001 | SPEC-004.AC01–AC03, AC06; SPEC-002.AC04; SPEC-001.AC10 | UAT-01 | OK: BRD-004 |
| AB-04 | Change temp password at first login; plaintext never stored/logged | SPEC-002, SPEC-004, SPEC-013, SPEC-001 | SPEC-002.AC05, AC06, AC08, AC11, AC30; SPEC-004.AC08; SPEC-013.AC07; SPEC-001.AC03 | AC07 (S4), `TC-016.62` | OK: BRD-005, BRD-006, BRD-008, NFR-003 |
| AB-05 | Lock 30 min after 5 failures; no authentication/API until expiry or unlock | SPEC-002, SPEC-004 | SPEC-002.AC12–AC17; SPEC-004.AC22 | AC07 (S5), UAT-01 | OK: BRD-025 |
| AB-06 | 30 min idle expiry; reset/deactivation invalidate sessions | SPEC-002, SPEC-004 | SPEC-002.AC19–AC23, AC17, AC22; SPEC-004.AC20, AC23 | AC07 (S6, S7), UAT-02 | OK: BRD-007, BRD-025 |
| AB-07 | Password complexity; tokens/credentials never logged; MFA/SSO out of scope | SPEC-002, SPEC-001 | SPEC-002.AC09, AC10, AC30; SPEC-001.AC03, AC26 | `TC-016.62`, 9.8 | OK: BRD-025, NFR-003 |
| AB-08 | Every protected API validates the BRD-026 chain; 401 vs 403; direct API (Postman) | SPEC-002, SPEC-007, SPEC-001, SPEC-011, SPEC-015 | SPEC-002.AC25–AC29, AC32; SPEC-007.AC04, AC07; SPEC-001.AC25; SPEC-011.AC10; SPEC-015.AC23 | AC07 (S1, S2, S8) | OK: BRD-026, NFR-002 |
| AB-09 | Status changes follow BRD-027 matrix; invalid → 403 `INVALID_WORKFLOW_TRANSITION`; no Completed without IT Final Approval; HR before Payroll | SPEC-007, SPEC-009, SPEC-008, SPEC-002 | SPEC-007.AC01–AC07, AC17; SPEC-009.AC08, AC16–AC19, AC23; SPEC-008.AC10–AC13; SPEC-002.AC28 | AC08, AC16 | OK: BRD-027, BRD-018, BRD-019, BRD-014 |
| AB-10 | Rejection reason/release; clarification return; withdrawal rules | SPEC-007, SPEC-010, SPEC-005, SPEC-008 | SPEC-007.AC21–AC30; SPEC-010.AC01–AC04; SPEC-005.AC12–AC14; SPEC-008.AC07–AC09 | AC15 (P04–P14), UAT-04/05 | OK: BRD-027, BRD-028, BRD-033, BRD-034 |
| AB-11 | Super Admin resets credentials, activates/deactivates | SPEC-004 | SPEC-004.AC20–AC24, AC26, AC27 | UAT-02 | OK: BRD-007, BRD-010 |
| AB-12 | Super Admin configures locations/departments/designations/vacancies with capacity | SPEC-003, SPEC-005 | SPEC-003.AC10–AC17; SPEC-005.AC01–AC06 | AC12, UAT-06 | OK: BRD-010, BRD-017 |
| AB-13 | Eligible employee views permitted vacancies, submits, receives unique reference | SPEC-006, SPEC-005 | SPEC-006.AC03, AC10, AC12; SPEC-005.AC07, AC08 | AC12 | OK: BRD-011 |
| AB-14 | Eligibility (BRD-029) rules and HR revalidation | SPEC-006, SPEC-008 | SPEC-006.AC04–AC09, AC13; SPEC-008.AC02, AC06 | AC15 (P22) | OK: BRD-029 |
| AB-15 | Portal as source of truth; master data not free text; missing data blocks submission | SPEC-015, SPEC-004, SPEC-006, SPEC-003, SPEC-008 | SPEC-015.AC01–AC09; SPEC-004.AC12–AC19; SPEC-006.AC02, AC06, AC07, AC27; SPEC-003.AC18, AC23; SPEC-008.AC28 | AC15 (P22), AC27 | OK: BRD-029, BRD-020 |
| AB-16 | HR-ineligible outcome (reject vs clarification) | SPEC-008, SPEC-012, SPEC-007 | SPEC-008.AC06–AC09; SPEC-012.AC06; SPEC-007.AC30 | AC15 (P06, P10) | OK: BRD-029, BRD-033 |
| AB-17 | One active request; 409 `ACTIVE_TRANSFER_ALREADY_EXISTS`; DB enforcement; new request after closed | SPEC-006, SPEC-010 | SPEC-006.AC13–AC17, AC20; SPEC-010.AC09, AC23 | AC17 (C-02), AC15 (P23) | OK: BRD-030 |
| AB-18 | Rejection & resubmission (BRD-033) | SPEC-007, SPEC-006, SPEC-010 | SPEC-007.AC21–AC24; SPEC-006.AC20; SPEC-010.AC23, AC24, AC26 | AC15 (P04–P07, P23) | OK: BRD-033 |
| AB-19 | Clarification (BRD-034) incl. multiple cycles | SPEC-007, SPEC-008 | SPEC-007.AC25–AC30; SPEC-008.AC08, AC09, AC19 | AC15 (P08–P11), UAT-05 | OK: BRD-034 |
| AB-20 | Effective Transfer Date (BRD-031) | SPEC-006, SPEC-008, SPEC-009, SPEC-007, SPEC-001 | SPEC-006.AC11, AC21–AC23; SPEC-008.AC25–AC27; SPEC-009.AC25–AC28; SPEC-007.AC19, AC20; SPEC-001.AC13 | AC15 (P20, P21), UAT-12 | OK: BRD-031 |
| AB-21 | Reporting Manager / Receiving Manager permitted actions | SPEC-007, SPEC-014 | SPEC-007.AC01, AC08–AC16, AC18; SPEC-014.AC05, AC06 | AC12, AC13 | OK: BRD-012 |
| AB-22 | HR validation, metadata, documents, downstream initiation | SPEC-008, SPEC-011, SPEC-009 | SPEC-008.AC01–AC05, AC10–AC13, AC21; SPEC-011.AC01, AC02; SPEC-009.AC02, AC03 | AC12, UAT-03 | OK: BRD-013, BRD-020, BRD-021 |
| AB-23 | IT views/completes only assigned tasks in scope | SPEC-009, SPEC-011, SPEC-014, SPEC-004 | SPEC-009.AC11–AC17, AC30; SPEC-011.AC13; SPEC-014.AC09; SPEC-004.AC32 | AC07 (S3), UAT-10 | OK: BRD-014, NFR-007 |
| AB-24 | Each user sees assigned employees/requests/tasks per role/mapping | SPEC-014, SPEC-004, SPEC-003, SPEC-007 | SPEC-014.AC03–AC09; SPEC-004.AC30–AC33; SPEC-003.AC25–AC32; SPEC-007.AC34 | AC07 (S1, S2) | OK: BRD-001, BRD-016, NFR-007 |
| AB-25 | Every material configuration/security/workflow action creates the audit record | SPEC-013, SPEC-001, SPEC-003, SPEC-004 | SPEC-013.AC01–AC05, AC17–AC22, AC25, AC26; SPEC-001.AC04, AC05; SPEC-003.AC33; SPEC-004.AC40–AC42 | AC28 (audit completeness) | OK: BRD-022, BRD-037, NFR-005 |
| AB-26 | Only applicable downstream actions; failures visible and recoverable | SPEC-009, SPEC-012, SPEC-015, SPEC-013 | SPEC-009.AC01–AC04, AC21, AC22, AC29; SPEC-012.AC17, AC18, AC21; SPEC-015.AC16, AC37; SPEC-013.AC23 | AC10, AC18 | OK: NFR-006 |
| AB-27 | Completed only after IT Final Approval (with or without IT task) | SPEC-009, SPEC-007 | SPEC-009.AC16–AC19, AC23; SPEC-007.AC06 | AC12–AC14 | OK: BRD-014, BRD-018, BRD-019 |
| AB-28 | Receiving Manager re-approval on HR change of the four fields | SPEC-008, SPEC-007, SPEC-012 | SPEC-008.AC14–AC20; SPEC-007.AC13–AC15; SPEC-012.AC15 | AC08 (W7), UAT-07 | OK: BRD-024 |
| AB-29 | Reserve only at HR validation; no over-allocation under concurrency | SPEC-005, SPEC-008, SPEC-015 | SPEC-005.AC09, AC10, AC17, AC18; SPEC-008.AC03–AC05; SPEC-015.AC31 | AC09 (V2), AC17 | OK: BRD-017, BRD-028 |
| AB-30 | Capacity formula; one of two simultaneous HR approvals succeeds | SPEC-005, SPEC-008, SPEC-014 | SPEC-005.AC02, AC09, AC17; SPEC-008.AC05; SPEC-014.AC16 | AC09, UAT-06 | OK: BRD-028 |
| AB-31 | Resume revalidation; status change never auto-releases; Closed blocks resume; manual release rule; Available = Open and > 0 | SPEC-005, SPEC-010 | SPEC-005.AC20–AC23; SPEC-010.AC10–AC14 | AC15 (P25) | OK: BRD-028 |
| AB-32 | Release on Rejected/Withdrawn/Cancelled; Blocked retains; Completed finalises | SPEC-005, SPEC-007, SPEC-010, SPEC-009 | SPEC-005.AC12–AC15, AC19; SPEC-007.AC22; SPEC-010.AC03, AC15; SPEC-009.AC20 | AC09 (V4) | OK: BRD-028 |
| AB-33 | HR vacancy change atomic; failure leaves original | SPEC-005, SPEC-008 | SPEC-005.AC16, AC18, AC29; SPEC-008.AC21, AC22 | AC15 (P22) | OK: BRD-028 |
| AB-34 | Block/Resume/Cancel rules and roles | SPEC-010, SPEC-009 | SPEC-010.AC05–AC18, AC25–AC29; SPEC-009.AC29 | AC15 (P15–P18) | OK: BRD-027 |
| AB-35 | Administrative reassignment (BRD-035) | SPEC-010, SPEC-012, SPEC-009, SPEC-008 | SPEC-010.AC19–AC22, AC25, AC29; SPEC-012.AC11; SPEC-009.AC30; SPEC-008.AC29 | AC15 (P19), UAT-08 | OK: BRD-035 |
| AB-36 | Twelve mandatory notifications; failure never rolls back; retry idempotent | SPEC-012, SPEC-001, SPEC-004 | SPEC-012.AC01–AC24; SPEC-001.AC06, AC07, AC09; SPEC-004.AC10, AC11 | AC18, UAT-11 | OK: BRD-036, NFR-006 |
| AB-37 | Audit logging (BRD-037): content, scoping, append-only, export, no credentials | SPEC-013, SPEC-001 | SPEC-013.AC01–AC28; SPEC-001.AC04, AC05 | AC28 | OK: BRD-037, NFR-005 |
| AB-38 | Performance & availability validated in pre-production; 5 MB; retry; no partial/duplicate | SPEC-015, SPEC-011, SPEC-001 | SPEC-015.AC28–AC32, AC35; SPEC-011.AC07; SPEC-001.AC11, AC12 | AC22–AC24 (blocked until inputs) | OK: BRD-038 |
| AB-39 | All BRD-039 scenarios executed and passed; none unresolved at deployment | SPEC-016 | SPEC-016.AC05–AC11 | AC05, AC06 | OK: BRD-039 |
| AB-40 | UAT scenarios cover the twelve families | SPEC-016 | SPEC-016.AC20, AC21 | `UAT-01..12` | n/a (UAT scripts UAT-01..12) |

### 3.7 BRD-039 mandatory negative scenarios (24: Security 8, Workflow 7, Vacancy 4, Integration 5)

Taken from SPEC-016 section 3.6; every NAC and TC cited resolves to a defined id (script check). Integration rows I1–I5 are validated through the contract-level harness, the manual-Payroll path and the SMTP dependency because no external integration exists in this phase (decision `TDD-016.01` / `TDD-015.01`, Gate 1 to confirm).

| # | BRD-039 mandatory negative scenario | Owning-spec NAC | Owning-spec TC | SPEC-016 end-to-end case |
|---|---|---|---|---|
| S1 | A user cannot access another organisation's data outside assigned scope `[BRD-026]` | SPEC-002.NAC05–06; SPEC-003.NAC06–08; SPEC-004.NAC10; SPEC-005.NAC14; SPEC-007.NAC02; SPEC-008.NAC01; SPEC-009.NAC08; SPEC-010.NAC08; SPEC-011.NAC04–05; SPEC-013.NAC03–05; SPEC-014.NAC01–02, NAC16; SPEC-015.NAC02 | TC-002.20; TC-003.45; TC-005.60; TC-007.50; TC-008.49; TC-010.37; TC-011.22; TC-014.31–.38; TC-015.65–.78 | TC-016.01 |
| S2 | An Employee cannot access another Employee's transfer request | SPEC-002.NAC07; SPEC-004.NAC11; SPEC-006.NAC01–02; SPEC-007.NAC11; SPEC-010.NAC03; SPEC-011.NAC06; SPEC-013.NAC07; SPEC-014.NAC04; SPEC-015.NAC14 | TC-002.24; TC-006.44, TC-006.59–.60; TC-007.50; TC-010.38; TC-013.67–.90 | TC-016.02 |
| S3 | IT cannot access Employee documents outside its authorised scope `[BRD-021]` | SPEC-011.NAC01–03; SPEC-009.NAC09, NAC11; SPEC-002.NAC08; SPEC-004.NAC13; SPEC-013.NAC06; SPEC-014.NAC05; SPEC-015.NAC15 | TC-011.21, TC-011.53; TC-009.43–.48; TC-015.65–.78 | TC-016.03 |
| S4 | A user cannot bypass the mandatory first-login password change `[BRD-025]` | SPEC-002.NAC01–02; SPEC-004.NAC20; SPEC-015.NAC19 | TC-002.20, TC-002.34; TC-004.81–.100 block | TC-016.04 |
| S5 | A locked user cannot log in | SPEC-002.NAC09–10, NAC16; SPEC-004.NAC21; SPEC-006.NAC19; SPEC-013.NAC24; SPEC-014.NAC09; SPEC-015.NAC18 | TC-002.12, TC-002.20, TC-002.27 | TC-016.05 |
| S6 | A deactivated user cannot log in | SPEC-002.NAC11–12; SPEC-004.NAC22; SPEC-013.NAC24; SPEC-014.NAC09; SPEC-015.NAC18 | TC-002.20, TC-002.29 | TC-016.06 |
| S7 | An old password cannot be used after a password reset | SPEC-002.NAC13–14; SPEC-004.NAC23 | TC-002.15, TC-002.28 | TC-016.07 |
| S8 | Direct API access cannot bypass role, scope, resource or action authorization `[BRD-026]` | SPEC-002.NAC03–04, NAC15; SPEC-003.NAC01, NAC03; SPEC-004.NAC01; SPEC-005.NAC18; SPEC-006.NAC04; SPEC-007.NAC05; SPEC-010.NAC29; SPEC-011.NAC07–09; SPEC-012.NAC02; SPEC-013.NAC03; SPEC-015.NAC16 | TC-002.20, TC-002.21, TC-002.41; TC-007.51; TC-011.20; TC-012.26; TC-015.65–.78 | TC-016.08 |
| W1 | A user cannot approve a request outside assigned role/scope | SPEC-007.NAC01, NAC19; SPEC-008.NAC01–02, NAC12; SPEC-009.NAC05, NAC08; SPEC-010.NAC27 | TC-007.13, TC-007.50–.51; TC-008.50; TC-009.43–.48; TC-010.34 | TC-016.09 |
| W2 | Invalid workflow transitions are rejected `[BRD-027]` | SPEC-007.NAC03–04; SPEC-006.NAC06–07; SPEC-008.NAC03–05, NAC09; SPEC-009.NAC03–04, NAC13, NAC15; SPEC-010.NAC02, NAC10, NAC13; SPEC-013.NAC15 | TC-007.10–.12 (golden matrix); TC-008.63; TC-009.55–.62; TC-010.01, TC-010.48 | TC-016.10 (+ TC-016.49 replay) |
| W3 | A Completed transfer cannot be modified through the normal workflow | SPEC-007.NAC06; SPEC-006.NAC06; SPEC-009.NAC17–19; SPEC-010.NAC18–19; SPEC-011.NAC12; SPEC-015.NAC29 | TC-007.12; TC-009.55–.62; TC-010.51; TC-011.50 | TC-016.11 |
| W4 | IT Final Approval cannot be given while a mandatory Payroll activity is incomplete | SPEC-009.NAC06–07; SPEC-015.NAC07; SPEC-007.NAC07 (partial) | TC-009.68–.69 (NACn = TC-009.(62+n)); TC-009.58 | TC-016.12 |
| W5 | A transfer cannot move to Completed without mandatory IT Final Approval | SPEC-007.NAC07; SPEC-009.NAC12, NAC14 | TC-007.02, TC-007.12; TC-009.74, TC-009.76 | TC-016.13 |
| W6 | Receiving Manager approval cannot be bypassed when enabled/configured as mandatory | SPEC-007.NAC08; SPEC-008.NAC10–11 | TC-007.04, TC-007.14; TC-008.61, TC-008.62 | TC-016.14 |
| W7 | HR changes to Department/BU, Designation, Location or Reporting Manager trigger BRD-024 re-approval | SPEC-008.NAC10–11, NAC21, NAC27; SPEC-007.NAC09 | TC-007.15; TC-008.05, TC-008.15, TC-008.58, TC-008.62 | TC-016.15 |
| V1 | A Full vacancy cannot receive a new allocation/reservation `[BRD-028]` | SPEC-005.NAC01–03; SPEC-006.NAC11; SPEC-008.NAC13; SPEC-015.NAC25 | TC-005.33, TC-005.46 (V1 mapping in SPEC-005 §23.7); TC-006.69 | TC-016.16 |
| V2 | Concurrent HR approvals do not cause capacity to be exceeded | SPEC-005.NAC05–06; SPEC-008.NAC14; SPEC-009.NAC21; SPEC-001.NAC10; SPEC-015.NAC26 | TC-005.46–.53; TC-008.55; TC-001.40; TC-015.95–.105 | TC-016.17 (design C-01) |
| V3 | Vacancy capacity never becomes negative | SPEC-005.NAC07–09; SPEC-008.NAC15; SPEC-009.NAC20; SPEC-014.NAC12 (display); SPEC-015.NAC27 | TC-005.08, TC-005.50, TC-005.55, TC-005.58; TC-015.20 (CHK-01) | TC-016.18 |
| V4 | Rejected and Withdrawn requests release reserved capacity | SPEC-005.NAC12; SPEC-008.NAC17; SPEC-010.NAC28; SPEC-007.NAC10; SPEC-015.NAC28 | TC-005.36, TC-005.71; TC-010.07, TC-010.08, TC-010.41 | TC-016.19 |
| I1 | An integration timeout does not create duplicate downstream transactions | SPEC-015.NAC08; SPEC-012.NAC05; SPEC-009.NAC29 | TC-015.35–.46; TC-012.38 | TC-016.20 |
| I2 | Failed integrations support controlled retry where applicable | SPEC-015.NAC09, NAC13; SPEC-012.NAC07, NAC09 | TC-015.35–.46; TC-012.23, TC-012.40 | TC-016.21 |
| I3 | A failed integration does not incorrectly mark the associated task Completed | SPEC-015.NAC10; SPEC-009.NAC02; SPEC-012.NAC08 | TC-015.47–.52; TC-012.39 | TC-016.22 |
| I4 | An external failure does not cause the transfer to be incorrectly marked Completed | SPEC-015.NAC11; SPEC-009.NAC02, NAC14; SPEC-012.NAC08 | TC-015.47–.52; TC-012.39 | TC-016.23 |
| I5 | Retry processing follows the NFR-006 duplicate-prevention/idempotency requirements | SPEC-015.NAC12; SPEC-012.NAC05–06; SPEC-009.NAC30 | TC-015.106–.110; TC-012.13–.15, TC-012.34; TC-009.49 | TC-016.24 |

### 3.8 Source of truth for employee and organisation data (14 field-ownership rows, BRD-029)

Every row is enforced by the SPEC-015 field-ownership registry (`FieldGuard`, 14 rows, TC-015.01–.09) and realised by the owner specs below.

| ID | Field | BRD-029 owner (current phase) | Enforcing / realising SPEC(s) | Evidence |
|---|---|---|---|---|
| SOT-01 | Employee ID | Portal — created/maintained by Super Admin | SPEC-004, SPEC-015 | 004: AC05; TASK-004.01,08,31<br>015: AC01; TASK-015.01–03,34 |
| SOT-02 | Employee Name | Portal — Super Admin | SPEC-004, SPEC-015 | 004: AC01,13; TASK-004.01,03,08,12<br>015: AC01; TASK-015.01–03,34 |
| SOT-03 | Official Email | Portal — Super Admin | SPEC-004, SPEC-015 | 004: AC05,10,13,15; TASK-004.01,04<br>015: AC01,29,36; TASK-015.01–03,34 |
| SOT-04 | Employment Status | Portal — Super Admin / HR | SPEC-004, SPEC-006, SPEC-015 | 004: AC14; TASK-004.02,09–11<br>006: AC05; TASK-006.01–02,06,08<br>015: AC01,29,36; TASK-015.01–03,34 |
| SOT-05 | Department / Business Unit | Portal organisation master — Super Admin; transfer-related update by HR | SPEC-003, SPEC-008, SPEC-015 | 003: AC18; TASK-003.01–02,04,22<br>008: AC23–24; NAC07,20–21; TASK-008.03,09,15,26<br>015: AC01,29,36; TASK-015.01–03,34 |
| SOT-06 | Designation | Portal designation master — Super Admin; transfer-related update by HR | SPEC-003, SPEC-008, SPEC-015 | 003: AC01–03,14–18; NAC01,14–15,17; TASK-003.01–02,04,22<br>008: AC14,23–24; NAC07,10,20–21; TASK-008.03,09,15,26<br>015: AC01,29,36; TASK-015.01–03,34 |
| SOT-07 | Location | Portal location master — Super Admin; transfer-related update by HR | SPEC-003, SPEC-008, SPEC-015 | 003: AC01–03,10–13,18; NAC01,06,08,14; TASK-003.01–02,04,22<br>008: AC01,14,23–24; NAC07,10,20–21; TASK-008.03,07,09,15<br>015: AC01,29,36; TASK-015.01–03,34 |
| SOT-08 | Reporting Manager | Portal employee/manager mapping — Super Admin; transfer-related update by HR | SPEC-003, SPEC-004, SPEC-008 | 003: AC08,28; NAC01,03,07,12; TASK-003.12,23<br>004: AC02,14,30,33; NAC05,12; TASK-004.09<br>008: AC14,23–24; NAC07,10,20–21; TASK-008.03,09,15,26 |
| SOT-09 | HR Assignment | Portal — Super Admin, from configured location/organisation mapping | SPEC-003, SPEC-004 | 003: AC08,16,25,27,30,33–34; NAC03,09–10,13; TASK-003.08–09,11,23<br>004: AC16 |
| SOT-10 | IT Assignment | Portal — Super Admin, from configured location mapping | SPEC-003, SPEC-009 | 003: AC01–03,10–13,27; NAC01,06,08,16; TASK-003.01–02,04,07<br>009: AC09; TASK-009.09 |
| SOT-11 | Effective Transfer Date | Transfer Request — confirmed/updated by HR | SPEC-006, SPEC-008, SPEC-009 | 006: AC18,21,23; TASK-006.07–08,14,20<br>008: AC01,03,15–17,25–27; NAC01,05,09,19; TASK-008.01,10,13,19<br>009: AC18,24–28; NAC17–18,25–26; TASK-009.05,15,17,26 |
| SOT-12 | Vacancy | Portal vacancy master — Super Admin; selected against the Transfer Request | SPEC-005, SPEC-006 | 005: NAC23; TASK-005.01,04,08<br>006: AC04,08,12,18,20; NAC10–12,14; TASK-006.05–07,18 |
| SOT-13 | Payroll Reference / Assignment | Transfer Request / Payroll activity — authorised HR | SPEC-009, SPEC-008 | 009: AC01–03,05–08,24; NAC01,03–04,11; TASK-009.01,05–07<br>008: AC11 |
| SOT-14 | Transfer-specific organisation metadata | Transfer Request — authorised HR | SPEC-008, SPEC-006 | 008: AC24<br>006: AC27; TASK-006.10,26 |

### 3.9 Integration boundaries (BRD Integration Requirements, BRD-029 no-sync rule, NFR-006)

| ID | BRD item | Realised by (BRD / NFR) | SPEC(s) (primary first) | Key evidence (top-scoring AC / NAC / TASK per SPEC) |
|---|---|---|---|---|
| IB-01 | No external Payroll or HR-system integration/API is defined for the current phase; no unspecified integration assumed | BRD Integration Requirements (Gate 0 c.12), BRD-029, BRD-OQ-19 | SPEC-015, SPEC-009, SPEC-016 | 015: AC06; TASK-015.06–09<br>009: AC05; NAC01<br>016: AC10; NAC04,10; TASK-016.10 |
| IB-02 | Payroll activity completed manually by an authorised HR user in the portal; no payroll calculation, statutory processing, callback or status feed | BRD-027(c), BRD-OQ-14(c), Gate 0 c.10 | SPEC-009, SPEC-015 | 009: AC05<br>015: AC12,33; NAC03,05,07,10; TASK-015.07,10–11,22 |
| IB-03 | No HR-system synchronisation (real-time, scheduled, callback); no dependency on HR-system availability; HR updates change portal data only | BRD-029, BRD-OQ-19(b)(d) | SPEC-015, SPEC-008 | 015: AC06,08; TASK-015.09<br>008: AC28; NAC24 |
| IB-04 | Future integration requires an approved contract before implementation covering eleven elements (interface, authentication, request/response, required fields, success/failure, timeout/retry, duplicate handling, idempotency, status mapping, error handling, source of truth) | BRD Integration Requirements | SPEC-015 | 015: AC13; TASK-015.09–10 |
| IB-05 | NFR-006: integration failures recoverable and auditable; retry creates no duplicate downstream transaction; failure visible with status/error details; authorised retry | NFR-006, BRD-038, BRD-039 I1-I5 | SPEC-015, SPEC-012 | 015: AC16; NAC12; TASK-015.10–11,27<br>012: NAC05; TASK-012.21–22 |
| IB-06 | Integration timeout defined per external integration before implementation (none in current phase) | BRD-038 | SPEC-015 | 015: AC14; NAC13; TASK-015.01–03,07 |
| IB-07 | Detailed API contracts documented separately before any external integration is implemented | BRD Integration Requirements | SPEC-015 | 015: AC13; TASK-015.09–10 |
| IB-08 | Only external dependency actually exercised: enterprise/official company email (SMTP) for credentials and notifications | BRD-OQ-03, BRD-036 | SPEC-012, SPEC-016 | 012: AC13,17–18; NAC05; TASK-012.01,03,08,26<br>016: AC18; TASK-016.10,16,20 |
| IB-09 | IT service-management system/process: IT activities are tracked in the portal; no ITSM integration is defined | Dependencies, BRD-014 | SPEC-009, SPEC-015 | 009: AC04–05,14,16,29–30; NAC02,11–12,15; TASK-009.03,12,21,24<br>015: AC07,13–14,38; NAC04,08–10; TASK-015.06–09 |
| IB-10 | Authoritative payroll system performs payroll calculation/compensation/statutory processing outside the portal | BRD-020, Business Rules | SPEC-009, SPEC-015 | 009: AC01–03,05–08,24; NAC01,03–05; TASK-009.01,05–07<br>015: AC12,33; NAC03,05,07,10; TASK-015.07,10–11,27 |

### 3.10 Dependencies (8)

| ID | BRD item | Realised by (BRD / NFR) | SPEC(s) (primary first) | Key evidence (top-scoring AC / NAC / TASK per SPEC) |
|---|---|---|---|---|
| DP-01 | Local-credential authentication mechanism (password hashing, session management) | BRD-OQ-01, NFR-001 | SPEC-002, SPEC-001 | 002: AC08,11; TASK-002.02–04,11<br>001: AC01; TASK-001.01,03–04,09 |
| DP-02 | Employee, organisation, hierarchy and eligibility data maintained in the portal by Super Admin / HR (no external HR-system dependency) | BRD-029, BRD-OQ-19 | SPEC-004, SPEC-003, SPEC-015 | 004: AC01,05,17,19,32–33; NAC07,11,13,31; TASK-004.01,03,08,15<br>003: AC03,08,15–18,23,33; NAC03,09–10,13; TASK-003.01–04<br>015: AC01,29,36; TASK-015.01–03,34 |
| DP-03 | No external Payroll/HR integration; any future one depends on a documented approved contract | Integration Requirements, NFR-006 | SPEC-015 | 015: AC13–14; TASK-015.04,07,09–10 |
| DP-04 | Authoritative payroll system for calculation/compensation/statutory processing (portal coordinates handoff/status only) | BRD-020, BRD-027(c) | SPEC-009, SPEC-015 | 009: AC01–03,05–08,24; NAC01–04; TASK-009.01,05–07<br>015: AC12; NAC03; TASK-015.07,10 |
| DP-05 | IT service-management system/process for access provisioning and device/asset activities | BRD-014 | SPEC-009, SPEC-015 | 009: AC04,14,16,29–30; NAC11–12,15,17; TASK-009.03,12,21,24<br>015: TASK-015.24 |
| DP-06 | Enterprise/official company email service for credential delivery and notifications | BRD-OQ-03, BRD-036 | SPEC-012, SPEC-004 | 012: AC01–02,13–14,17–18; NAC05,07,13,15; TASK-012.03,08–09,26<br>004: AC05,10,13,15; TASK-004.01,04 |
| DP-07 | Local server document storage; no external malware-scanning or retention/archive service | BRD-OQ-08, BRD-021 | SPEC-011 | 011: AC06,09,20; NAC11,19–20; TASK-011.02–03,06–07 |
| DP-08 | Infrastructure/deployment planning to confirm performance, availability, backup and monitoring targets before production (BRD-OQ-09, BRD-038) | NFR-009, BRD-038 | SPEC-015, SPEC-016 | 015: AC34; TASK-015.29<br>016: AC22–23; NAC03,13; TASK-016.21–22,24,26 |

### 3.11 Assumptions (10)

| ID | BRD item | Realised by (BRD / NFR) | SPEC(s) (primary first) | Key evidence (top-scoring AC / NAC / TASK per SPEC) |
|---|---|---|---|---|
| AS-01 | Authentication is local-credential based; no enterprise SSO/IdP unless brought in under change control | BRD-OQ-01 | SPEC-002, SPEC-001 | 002: AC03,06–08,21,34; NAC01–02,14,24; TASK-002.03,09–11<br>001: AC26; TASK-001.05 |
| AS-02 | User ID convention role-prefixed (EMP/MGR/HR/IT######); password/lockout/session policy per BRD-007 and BRD-025 | BRD-OQ-02, BRD-025 | SPEC-004, SPEC-002 | 004: AC01,03,05–08,13–14; NAC05,10–12; TASK-004.01–02,04–05<br>002: AC07,12,14–17,19–20; NAC16; TASK-002.04,08–10 |
| AS-03 | HR will supply vacancy/capacity edge cases; effective-date rules per BRD-031; eligibility per BRD-029 with no further restrictions assumed; employee/organisation data maintained by Super Admin/HR; assigned HR corrects missing data | BRD-029, BRD-031, BRD-OQ-16, BRD-OQ-19 | SPEC-006, SPEC-005, SPEC-008 | 006: AC06; TASK-006.04,19<br>005: NAC03,17; TASK-005.11,17,20,22<br>008: AC02–03,06–07; NAC22; TASK-008.08 |
| AS-04 | System owners will confirm APIs, credentials, sandbox/test environments and interface specifications for enterprise integrations (payroll, IT service-management) | Integration Requirements | SPEC-015 | 015: AC13–14; TASK-015.04,07,09–10 |
| AS-05 | Document storage remains local-server based with no malware scanning, retention or archive requirement | BRD-OQ-08 | SPEC-011 | 011: AC20; NAC19–20; TASK-011.02,16 |
| AS-06 | Receiving Manager approval is Super Admin-configurable; withdrawal and escalation follow company policy per BRD-023/Business Rules | BRD-012, BRD-023, BRD-OQ-10 | SPEC-007, SPEC-010, SPEC-014 | 007: AC08–10,13–15,18; NAC08–09; TASK-007.11<br>010: AC01–04,23,25; NAC01–04; TASK-010.06–08,15<br>014: AC11,20; NAC07; TASK-014.01,04,16,19 |
| AS-07 | Notification channels, hosting, logging and deployment environments already exist or are provided separately | BRD-036, NFR-009 | SPEC-012, SPEC-015 | 012: AC17–18; NAC05; TASK-012.03,05,08,26<br>015: AC34–35; TASK-015.29 |
| AS-08 | Dates, effort, team composition and commercials are excluded from the BRD (separate project plan) | n/a (project-management assumption) | SPEC-016 | 016: none: project-plan assumption, no technical requirement or task derived (see gap G-14) |
| AS-09 | Production infrastructure targets (NFR-009) finalised during infrastructure/deployment planning; application-level requirements in BRD-038 | NFR-009, BRD-OQ-09, BRD-038 | SPEC-015 | 015: AC34; TASK-015.29 |
| AS-10 | Workflow transitions follow BRD-027; withdrawal until HR approval; Block/Resume/Cancel/Reassign cannot bypass approvals; HR/IT-controlled stages, HR cancel limits, Draft exclusion, cross-role Resume rules; HR Confirmation is an activity; HR Processing precedes Payroll; manual Payroll; invalid transitions 403 | BRD-027, BRD-OQ-12, BRD-OQ-13, BRD-OQ-14, BRD-OQ-18 | SPEC-007, SPEC-010, SPEC-009 | 007: AC01–02,04,06,16,23; NAC01,07; TASK-007.06–07,10,27<br>010: AC25; TASK-010.06–07,15,20<br>009: AC01–02,05–06,08,27; NAC02,05–06; TASK-009.08 |

### 3.12 Out-of-scope items (7 BRD bullets + 7 other "not in this phase" exclusions)

Every one of the 16 specs closes with an `Out of Scope (this SPEC)` section (verified: 16/16 present). SPEC-016 section 9.8 holds the verification matrix `OS-01 … OS-14` that proves no spec introduces an exclusion. Mapping of the seven BRD "Out of Scope" bullets plus the other "not in this phase" exclusions stated in the BRD:

| ID | BRD out-of-scope item | SPEC(s) that must not build it / enforce the boundary | Verification row and evidence |
|---|---|---|---|
| OOS-1 | Redesign or replacement of underlying HR, payroll or IT service-management platforms | SPEC-015 (ports only, no adapters), SPEC-001 (`check:boundaries`) | SPEC-016 OS-01; SPEC-015 TC-015.35–.46; SPEC-001.AC26 |
| OOS-2 | Facilities/Admin role, workplace/seating/access-card/asset-movement tasks, facilities integration | SPEC-002 (role enum exactly six values), SPEC-009 (IT tasks only) | SPEC-016 OS-02; SPEC-002 TC-002.17; TC-016.52 |
| OOS-3 | New payroll calculation engine, identity provider, enterprise master-data platform | SPEC-009 (no calculation route), SPEC-002 (no OIDC/SAML), SPEC-003/004 (portal masters are operational data only) | SPEC-016 OS-03; TC-016.52; SPEC-001.AC26 |
| OOS-4 | Automatic HR-system integration/synchronisation (real-time, scheduled, callback) and automatic updates to an external HR master | SPEC-015, SPEC-008 (HR updates change portal data only), SPEC-004 | SPEC-016 OS-04; SPEC-015.AC06, AC07, NAC04, NAC05; SPEC-008.NAC24, AC28 |
| OOS-5 | External recruitment, cross-company transfer, immigration or relocation benefit processing | SPEC-006 (transfer references master data only), SPEC-005 | SPEC-016 OS-05; TC-016.52 |
| OOS-6 | Historical data migration, bulk backfill, custom integrations not approved in discovery | SPEC-001 (migrations are schema/seed only), SPEC-004 (no bulk import) | SPEC-016 OS-06; TC-016.53 |
| OOS-7 | Advanced workforce planning or predictive vacancy forecasting | SPEC-014 (`REPORT_POLICY` lists only BRD-023 reports), SPEC-005 | SPEC-016 OS-07; SPEC-014 TC-014.09; TC-016.53 |
| OOS-8 | MFA / SSO (BRD-025) | SPEC-002, SPEC-001 | SPEC-016 OS-08; SPEC-001.AC26 |
| OOS-9 | Malware scanning, retention, archive, deletion policy for documents (BRD-021, BRD-OQ-08) | SPEC-011 | SPEC-016 OS-09; SPEC-011.NAC19, NAC20, AC20 |
| OOS-10 | Other HR eligibility restrictions: tenure, probation, disciplinary, notice, performance (BRD-029 rule 2 and 8) | SPEC-006, SPEC-008 | SPEC-016 OS-10; SPEC-006 TC-006.07; SPEC-008.NAC23; SPEC-006.AC09 |
| OOS-11 | Cool-down after Completed (BRD-030) | SPEC-006 | SPEC-016 OS-11; SPEC-006.AC17 |
| OOS-12 | Payroll API/callback and payroll calculation (BRD-027(c)) | SPEC-009, SPEC-015 | SPEC-016 OS-12; SPEC-009.NAC01, AC05 |
| OOS-13 | Invented escalation timings (BRD-023) | SPEC-014, SPEC-012 | SPEC-016 OS-13; SPEC-014 TC-014.27, NAC11 |
| OOS-14 | Numeric infrastructure targets: availability, backup, monitoring (NFR-009) | SPEC-015 | SPEC-016 OS-14; SPEC-015.AC34; TC-016.54 |

## 4. Gaps found

Result of the full pass: **no BRD requirement, NFR, open question, business rule, BRD-027 matrix row, acceptance bullet, source-of-truth field, integration boundary, dependency, assumption or out-of-scope item is left without an owning SPEC.** All 47 requirement rows have a primary SPEC with tasks and acceptance criteria (tag-thin cases noted in G-08), all 20 open questions are evidenced, all 37 BRD-027 rows and all 40 BRD acceptance bullets resolve to existing IDs, and the 24 BRD-039 scenarios resolve to existing NAC and TC ids. The gaps below are spec-internal defects (dangling or non-conforming ids, missing links) and one product decision left open. They are the only findings; none removes BRD coverage, but G-01 to G-04 would make the planned trace tooling (`TASK-016.05`, which fails on an unresolved id) fail and should be fixed before Gate 1.

**Total: 15 gaps (G-01 … G-15). 4 must-fix id defects (G-01 … G-04), 6 traceability-quality defects (G-05 … G-10), 5 informational (G-11 … G-15).**

| Gap | Severity | Finding (evidence) | Spec that should absorb the fix |
|---|---|---|---|
| G-01 | Resolved (was Must fix) | SPEC-004 section 23 says `NAC01–NAC32 mapped 1:1 → TC-004.81–TC-004.100`, but section 22 defines only 20 NACs: NAC08, NAC09, NAC15–NAC19 and NAC25–NAC29 do not exist (12 holes, 32 ≠ 20 TC slots). SPEC-004 acceptance ids also skip AC28, AC29 and AC36–AC39 (max AC42). The BRD-039 rows that SPEC-016 maps to SPEC-004 use NAC10, NAC11, NAC13, NAC20–NAC23 (all exist), so the BRD-039 coverage is intact, but the stated 1:1 mapping is false. | SPEC-004 (renumber contiguously or state the real set; map NAC to TC explicitly) |
| G-02 | Resolved (was Must fix) | SPEC-007 section 3 (business-rule row "Receiving Manager review stage enabled/disabled by configuration, not hard-coded", line 109) cites `AC08, AC09, AC40..AC42`. SPEC-007 defines AC01–AC34 only; AC40–AC42 do not exist. The behaviour is covered by SPEC-007.AC08, AC09, AC18 and NAC08, NAC15–NAC17. | SPEC-007 (correct the citation) |
| G-03 | Resolved (was Must fix) | SPEC-014 `TASK-014.28` cites `TC-014.01 – 014.20` and `TASK-014.29` cites `TC-014.21 – 014.50`, but section 23 defines TC-014.01–.10, .21–.40 and .51–.71 only. TC-014.11–.20 and TC-014.41–.50 are undefined (20 dangling ids when expanded). | SPEC-014 (renumber TCs or narrow the task ranges) |
| G-04 | Resolved (was Must fix) | SPEC-015 sections 3.5/3.6 use legacy labels that do not match sections 21/22: `AC-015.01..14`, `AC-015.40..52` (SPEC-015 has AC01–AC38 only, so AC39–AC52 do not exist), `NAC-015.20..24` (in section 22, NAC20–NAC24 are audit/upload/leak cases; the BRD-039 integration rows are NAC08–NAC12) and `NAC-015.30..33` (NAC33 does not exist; NAC30–NAC32 do). SPEC-016 section 3.6 notes this drift and cites only section 21/22 ids. | SPEC-015 (relabel to `SPEC-015.ACmm` / `SPEC-015.NACmm` and correct the ranges) |
| G-05 | Resolved (was Fix) | SPEC-013 sections 3.5 and 23 use `NAC-013.nn` and `AC-013.17` instead of `SPEC-013.NACnn`; the numbers resolve to the right criteria (`NAC-013.04` = SPEC-013.NAC04, etc.), only the label form is non-standard. SPEC-016 `AC-016.26` is a rule label in the same non-standard form. Non-standard suffix ids also exist (`SPEC-003.AC09a`; `FR-009.23a`, `FR-009.39a/b`, `FR-009.55a/b`, `FR-005.29a`, `FR-004.xx`). | Resolved: SPEC-013 and SPEC-016 labels normalised to `SPEC-013.NACnn`/`ACnn`; suffix ids (`AC09a`, `FR-009.23a`) remain and the tool must accept them. Open: SPEC-013 (labels); SPEC-016 `TASK-016.05` (tool must accept `ACnna` and legacy labels or the specs must be normalised) |
| G-06 | Fix | **AC/NAC → TC link missing or only block-level.** Counting criteria with no TC link in the spec's own section 23 (after applying the explicit mapping rows, `1:1` rules and formulas): SPEC-002 35, SPEC-003 1, SPEC-004 30, SPEC-005 55, SPEC-006 28, SPEC-007 34, SPEC-008 30, SPEC-009 27, SPEC-010 29, SPEC-011 22, SPEC-012 10, SPEC-013 28, SPEC-014 25, SPEC-015 70, SPEC-016 30 (SPEC-001 is fully linked). SPEC-005 and SPEC-015 give no AC↔TC mapping at all; SPEC-008 defers its NAC→TC table to `.ai-context/test_cases/` (27 NACs onto TC-008.64–.70); SPEC-013 allocates TCs "in blocks" and only NAC has a formula (`NAC n → TC-013.(66+n)`); SPEC-010 uses three-part ids `TC-010.52.01–.32`; SPEC-009 uses the formula `TC-009.(62+n)`. Section 1 therefore shows block-level TC evidence for these specs. | Each listed SPEC adds an AC/NAC → TC table in section 23 (SPEC-016 `TASK-016.05` consumes it) |
| G-07 | Fix | **Tasks without a BRD/NFR id in `BRD refs`:** `TASK-013.24` (blank), `TASK-013.28` (`FR-013.14` only), `TASK-014.18` (`TDD`), `TASK-001.08` (`int-standards §3`), `TASK-005.35` (`Backend-Architecture §20`), `TASK-015.07/.08/.09` (`BRD Integration Req`, a BRD rule heading rather than an id), `TASK-016.19/.20/.25/.30` (`BRD UAT`, `BRD Acceptance`, `AGENTS.md`), plus 20 QA/doc tasks whose refs are `all` or an em dash (listed in 1.2 and Appendix A). They are traced here by title; the reverse BRD → TASK index misses them. | The owning SPECs (013, 014, 001, 005, 015, 016): replace with ids (e.g. `NFR-005`, `BRD-037`; `BRD Integration Req` → `NFR-006`, `BRD-038`) |
| G-08 | Fix | **Tag-thin primary coverage.** SPEC-012 (co-primary for BRD-023) has no task, AC or NAC tagged `BRD-023` (the notification slice is covered only through `BRD-036` tags and FR/section 3 text; `TASK_OVERDUE` is in the catalogue). NFR-001 and NFR-002 are never tagged on a SPEC-002 AC/NAC/task (traced only through BRD-025/BRD-026 and the SPEC-015 control matrix). NFR-007 has no task tagged in SPEC-011 or SPEC-002. BRD-001 has one SPEC-002 AC tagged (AC03). | SPEC-012 (add BRD-023 to the overdue/notification ACs and tasks); SPEC-002 (tag NFR-001/002/007 on existing ACs); SPEC-011 |
| G-09 | Resolved (was Fix) | **BRD-027 rows without a dedicated acceptance criterion:** "Pending Receiving Manager Approval → Receiving Manager Reject" (M-06) and "→ Request Clarification" (M-07). Covered only by the golden-matrix AC03, the shared handler ACs (AC21, AC25) and TC-007.16/.17; SPEC-007 AC15 covers Reject only at Re-Approval. | SPEC-007 (add two ACs) |
| G-10 | Resolved (was Fix) | **Undefined ids cited:** `TDD-014.15` (SPEC-014 section 13; decisions end at TDD-014.14), `FR-015.28` (SPEC-015 section 6; FR-015.25–.29 are not defined), `FR-004.59` (SPEC-004 section 3 range FR-004.50–.66), and ranges that span undefined FR numbers: `FR-009.27–.29` and `FR-009.47–.49` (SPEC-009 section 3). | SPEC-014, SPEC-015, SPEC-004, SPEC-009 |
| G-11 | Info | **Product decision left open:** BRD-023 "account creation/activation notifications (where approved)" — activation notification is deliberately not implemented in SPEC-012 (listed in its section 19 "Not implemented" note so Gate 1 can request it). Same for account lock/unlock notices (no BRD requirement). | SPEC-012 (Gate 1 decision) |
| G-12 | Info | **BRD ambiguities that specs correctly flag as `[TDD-REQUIRED]`, not coverage gaps:** 252 `TDD-NNN.NN` decisions across the 16 specs (001:12, 002:22, 003:10, 004:16, 005:16, 006:16, 007:18, 008:12, 009:15, 010:15, 011:15, 012:16, 013:20, 014:14, 015:22, 016:13). They include Super Admin / Receiving Manager ID prefix and creation, default Super Admin bootstrap, Receiving Manager ↔ team mapping, session mechanism, reference formats, IT assignee selection and task catalogue, IT evidence storage, notification stakeholders, vacancy visibility, who answers an HR clarification, audit export format, escalation thresholds, TLS arrangement, employment-status values, integration-scenario validation approach. They must be closed or accepted at Gate 1 (`RR-05`). | Gate 1 reviewer per spec |
| G-13 | Info | Mandatory BRD-038 numeric inputs (concurrent users, volume, API and page response-time targets, API timeout) and NFR-009 infrastructure targets are "to be confirmed" in the BRD; SPEC-015 and SPEC-016 register them as empty, blocking inputs and invent no number. Performance validation (`PPV-08`) stays BLOCKED until they are supplied. | SPEC-015 / SPEC-016 (no change; business must supply) |
| G-14 | Info | BRD Assumption "dates, effort, team composition and commercials are excluded" is a project-plan assumption with no technical requirement; no spec derives a task from it (correct by design). | none |
| G-15 | Info | BRD numbering has **no BRD-015** (014 → 016). SPEC-001 and SPEC-016 state this; no row exists for it. | none |

### 4.1 Evidence behind the "no omission" conclusion

| Check | Method | Result |
|---|---|---|
| Every BRD-001…014, 016…039 and NFR-001…009 id has a primary SPEC with a section 3 entry, at least one task and at least one AC/NAC | script over the 16 specs (section 3 tables, task `BRD refs`, AC/NAC lines) | 47/47 have a primary entry; exceptions only in tag coverage (G-08) |
| BRD-OQ-01…20 each evidenced by ≥1 SPEC | section 3 tables, task refs, AC/NAC text | 20/20 (section 2) |
| BRD "Acceptance Criteria" bullets (40) | SPEC-016 section 3.5 `AB-01…AB-40`, cross-checked: cited ACs resolve and carry the expected BRD tags | 40/40; each non-UAT bullet has ≥1 cited AC whose tags include the expected BRD id |
| BRD-039 scenarios (24) | SPEC-016 section 3.6 `S1…I5` | 24/24; every cited NAC and TC resolves |
| BRD-027 matrix rows (37) | SPEC-007 `TR-001…TR-037` plus handler specs | 37/37 mapped (M-06 and M-07 only generically, G-09) |
| Key-fact probes (130 phrases such as 5 failed logins / 30 min lock, 30 min idle, 5 MB, 413/415 codes, `ACTIVE_TRANSFER_ALREADY_EXISTS`, 403 `INVALID_WORKFLOW_TRANSITION` message, 12 notification events, eleven integration-contract elements, 14 field-ownership rows) | regex proofs against the owning spec text | all present (the one reported miss was the wording "request & response" in SPEC-015 section 9.3; the element is present) |

## Appendix A — Task index (every TASK id with its title, layer and BRD/NFR references)

| TASK | Title | Layer | BRD / NFR refs in section 8 |
|---|---|---|---|
| TASK-001.01 | Tooling & repo baseline | BE/FE | NFR-004 |
| TASK-001.02 | Backend structure & app/server split | BE | BRD-038, NFR-009 |
| TASK-001.03 | Config/env loader | BE | NFR-004, BRD-031 |
| TASK-001.04 | Logger + redactor | BE | BRD-025, BRD-037, NFR-003/004 |
| TASK-001.05 | Request-ID & AsyncLocalStorage context | BE | BRD-037 |
| TASK-001.06 | Error classes, code catalogue, constraint mapper | BE | BRD-021/026/027/030 |
| TASK-001.07 | Envelope helpers, error & 404 middleware | BE | BRD-026 |
| TASK-001.08 | Validation middleware | BE | int-standards §3 |
| TASK-001.09 | Security middleware | BE | NFR-004 |
| TASK-001.10 | Health endpoints | BE | NFR-009 |
| TASK-001.11 | DB connection + CLI config + conventions | DB | BRD-038 |
| TASK-001.12 | Migration: `id_sequences` | DB | BRD-004 |
| TASK-001.13 | Migration: `audit_logs` + immutability | DB | BRD-037, NFR-005 |
| TASK-001.14 | DB roles script | DB/OPS | BRD-037 |
| TASK-001.15 | Transaction helper & lock helpers | BE | BRD-038, BRD-028 |
| TASK-001.16 | `SequenceService` & ID helpers | BE | BRD-004 |
| TASK-001.17 | `AuditService` kernel | BE | BRD-022, 037 |
| TASK-001.18 | Migration: `notification_outbox` | DB | BRD-036 |
| TASK-001.19 | `NotificationService.enqueue` kernel | BE | BRD-036, NFR-006 |
| TASK-001.20 | Business-date utility & Clock | BE | BRD-031 |
| TASK-001.21 | Pagination helper & shared constants | BE | BRD-001/019/027 |
| TASK-001.22 | Frontend scaffold & providers | FE | BRD-002, NFR-008 |
| TASK-001.23 | API client & interceptors | FE | BRD-026 |
| TASK-001.24 | UI kit primitives & form pattern | FE | BRD-002, NFR-008 |
| TASK-001.25 | DataTable & query-state hook | FE | BRD-002 |
| TASK-001.26 | State components, Toast, Modal/ConfirmDialog | FE | BRD-002 |
| TASK-001.27 | Layout shell, navigation, route groups, special pages | FE | BRD-002/003 |
| TASK-001.28 | Accessibility & responsive verification | FE/QA | NFR-008, BRD-002 |
| TASK-001.29 | Local setup, env docs, TLS arrangement docs | OPS | NFR-004, NFR-009 |
| TASK-001.30 | Backend test harness | QA | BRD-038, BRD-039 |
| TASK-001.31 | Kernel verification suites | QA | BRD-036/037/038, NFR-003/004/005 |
| TASK-002.01 | Migration `users` | DB | BRD-001, 006, 007, 025 |
| TASK-002.02 | Migration `user_sessions` | DB | BRD-025 |
| TASK-002.03 | Sequelize models | BE | BRD-006, NFR-003 |
| TASK-002.04 | Auth configuration | BE | BRD-025 |
| TASK-002.05 | PasswordService | BE | BRD-006, NFR-003 |
| TASK-002.06 | PasswordPolicy | BE+FE | BRD-025 |
| TASK-002.07 | TokenService | BE | BRD-025, 026 |
| TASK-002.08 | SessionService | BE | BRD-025 |
| TASK-002.09 | AccountSecurityService | BE | BRD-007, 008, 025 |
| TASK-002.10 | Login use case | BE | BRD-001, 006, 025 |
| TASK-002.11 | Change-password use case | BE | BRD-006, 007 |
| TASK-002.12 | Logout / me / keep-alive | BE | BRD-025, 026 |
| TASK-002.13 | `authenticate` middleware | BE | BRD-025, NFR-001 |
| TASK-002.14 | Password-change guard | BE | BRD-006 |
| TASK-002.15 | AuthorizationService | BE | BRD-026, NFR-002 |
| TASK-002.16 | ScopeResolver framework | BE | BRD-026 |
| TASK-002.17 | StagePolicy hook | BE | BRD-026, 027 |
| TASK-002.18 | Permission registry (matrix) | BE | BRD-026 |
| TASK-002.19 | Enforcement middleware & `defineRoute` | BE | BRD-026 |
| TASK-002.20 | Error mapping | BE | BRD-026 |
| TASK-002.21 | Security audit emission | BE | BRD-008, 037 |
| TASK-002.22 | Credential-hygiene hardening | BE | BRD-025, NFR-003 |
| TASK-002.23 | Super Admin seeder | BE | BRD-004/010 (DERIVED) |
| TASK-002.24 | Recovery CLI | BE | BRD-025 (DERIVED) |
| TASK-002.25 | Unlock API | BE | BRD-025 |
| TASK-002.26 | Service contracts for SPEC-004 | BE | BRD-005, 007 |
| TASK-002.27 | Session housekeeping | BE | BRD-025 |
| TASK-002.28 | FE auth foundation | FE | BRD-001, 025 |
| TASK-002.29 | FE login page | FE | BRD-001 |
| TASK-002.30 | FE change-password page | FE | BRD-006 |
| TASK-002.31 | FE session expiry | FE | BRD-025 |
| TASK-002.32 | FE no-access & permission gating | FE | BRD-002, 026 |
| TASK-002.33 | FE remove self-service reset | FE | BRD-007 |
| TASK-002.34 | Unit tests (RED first) | QA | all |
| TASK-002.35 | Integration & API tests | QA | all |
| TASK-002.36 | Security & BRD-039 tests | QA | BRD-039 |
| TASK-002.37 | Concurrency tests | QA | BRD-025 |
| TASK-002.38 | Frontend tests | QA | BRD-001, 006, 025 |
| TASK-003.01 | Master tables migration | DB | BRD-010, BRD-029 |
| TASK-003.02 | Master models & repositories | BE | BRD-010, BRD-002 |
| TASK-003.03 | Master services, DTOs, validators | BE | BRD-010, BRD-022 |
| TASK-003.04 | Master controllers & routes | BE | BRD-010, BRD-026 |
| TASK-003.05 | Dependency registry & reference guard | BE | BRD-029 |
| TASK-003.06 | Deactivation protection | BE | BRD-010, BRD-029 |
| TASK-003.07 | Lookups API | BE | BRD-029 |
| TASK-003.08 | Org scope tables migration | DB | BRD-016 |
| TASK-003.09 | Org models/repositories | BE | BRD-016 |
| TASK-003.10 | HR & IT scope services/APIs (TDD) | BE | BRD-016, BRD-029 |
| TASK-003.11 | Receiving Manager scope mapping (TDD-REQUIRED) | BE | BRD-012, BRD-016 |
| TASK-003.12 | Reporting relationship service/API | BE | BRD-016, BRD-029 |
| TASK-003.13 | OrgScopeProvider | BE | BRD-016, BRD-026 |
| TASK-003.14 | Own scope, scope inspector, my-hr-team APIs | BE | BRD-001, BRD-029 |
| TASK-003.15 | Navigation registry & API | BE | BRD-002, BRD-003 |
| TASK-003.16 | Audit events wiring | BE | BRD-022, BRD-037 |
| TASK-003.17 | Frontend shell & navigation | FE | BRD-002, BRD-003, NFR-008 |
| TASK-003.18 | Shared state components | FE | BRD-002, NFR-008 |
| TASK-003.19 | DataTable & query hook | FE | BRD-002, NFR-008 |
| TASK-003.20 | Form kit & ConfirmDialog | FE | BRD-002, NFR-008 |
| TASK-003.21 | Dashboard shell | FE | BRD-002 |
| TASK-003.22 | Master pages | FE | BRD-010, BRD-002 |
| TASK-003.23 | Organisation mapping pages | FE | BRD-016 |
| TASK-003.24 | Frontend services & types | FE | BRD-002 |
| TASK-003.25 | Backend unit tests | QA | all |
| TASK-003.26 | Backend integration/API/security tests | QA | BRD-026, BRD-039 slice |
| TASK-003.27 | Concurrency tests | QA | BRD-028 spirit n/a; NFR integrity |
| TASK-003.28 | Frontend & accessibility tests | QA | NFR-008, BRD-002 |
| TASK-003.29 | Dependency-matrix conformance test | QA | BRD-029 |
| TASK-003.30 | OpenAPI docs & dev fixtures | BE | — |
| TASK-004.01 | Migration: `employee_profiles` | DB | BRD-004, BRD-029, BRD-016 |
| TASK-004.02 | Migration: `user_id_sequences` + seed | DB | BRD-004 |
| TASK-004.03 | Migration: profile concurrency + assignment flags | DB | BRD-029 |
| TASK-004.04 | Module scaffolding & registry | BE | BRD-004 |
| TASK-004.05 | `UserIdGenerator` | BE | BRD-004 |
| TASK-004.06 | `TemporaryPasswordGenerator` + `Secret` wrapper | BE | BRD-004, BRD-005, BRD-025 |
| TASK-004.07 | Request DTO validators & sanitisers | BE | BRD-009, INT standards |
| TASK-004.08 | `EmployeeProfileRepository` | BE | BRD-029, BRD-016 |
| TASK-004.09 | `OrganisationMappingValidator` | BE | BRD-009, BRD-016, BRD-029 |
| TASK-004.10 | `AssignmentDerivationService` | BE | BRD-016, BRD-029 |
| TASK-004.11 | `FieldOwnershipPolicy` | BE | BRD-029 |
| TASK-004.12 | `UserProvisioningService.createUser` | BE | BRD-004, BRD-005, BRD-009 |
| TASK-004.13 | Credential e-mail integration | BE | BRD-005, BRD-036, OQ-03 |
| TASK-004.14 | `UserQueryService` (list/detail/me/minimal) | BE | BRD-002, BRD-012, BRD-013, BRD-014, BRD-011 |
| TASK-004.15 | `EmployeeProfileService.update` + completeness | BE | BRD-029 |
| TASK-004.16 | `RoleChangeService` | BE | BRD-010, BRD-037 |
| TASK-004.17 | `AccountAdminService` | BE | BRD-007, BRD-008, BRD-025 |
| TASK-004.18 | Controllers, routes, authorisation registration | BE | BRD-026 |
| TASK-004.19 | Audit event emission & sanitiser allow-lists | BE | BRD-008, BRD-037 |
| TASK-004.20 | Seed/test fixtures | BE/QA | BRD-039 |
| TASK-004.21 | FE service layer & types | FE | BRD-002 |
| TASK-004.22 | FE Users list page | FE | BRD-002, BRD-003 |
| TASK-004.23 | FE Create-user wizard | FE | BRD-009 |
| TASK-004.24 | FE credentials dialog | FE | BRD-005 |
| TASK-004.25 | FE User detail (Profile/Assignments/Account/Activity) | FE | BRD-029, BRD-008 |
| TASK-004.26 | FE admin action dialogs | FE | BRD-002, BRD-007 |
| TASK-004.27 | FE role-scoped employee lists + own profile | FE | BRD-011–014 |
| TASK-004.28 | FE states, accessibility, responsive pass | FE | BRD-002, NFR-008 |
| TASK-004.29 | Unit tests (BE) | QA | — |
| TASK-004.30 | Integration & API tests | QA | — |
| TASK-004.31 | Concurrency & security tests | QA | BRD-039, NFR-003 |
| TASK-004.32 | Frontend tests | QA | BRD-002, BRD-005 |
| TASK-004.33 | API documentation & handoff notes | BE | — |
| TASK-005.01 | Migration: `vacancies` | DB | BRD-017, BRD-028 |
| TASK-005.02 | Migration: `vacancy_reservations` | DB | BRD-028 |
| TASK-005.03 | Migration: FK to `transfer_requests` | DB | BRD-028 |
| TASK-005.04 | Sequelize models | BE | BRD-017 |
| TASK-005.05 | Constants, DTOs, error codes | BE | BRD-028 |
| TASK-005.06 | Capacity & status domain functions | BE | BRD-017, BRD-028 |
| TASK-005.07 | Repository with locking primitives | BE | BRD-028, BRD-038 |
| TASK-005.08 | `VacancyAdminService` | BE | BRD-010, BRD-017 |
| TASK-005.09 | Validators | BE | BRD-026, INT std |
| TASK-005.10 | Admin controllers & routes | BE | BRD-010, BRD-026 |
| TASK-005.11 | `VacancyQueryService` & HR scope filter | BE | BRD-013, BRD-023 |
| TASK-005.12 | Discovery endpoint & `checkSelectable` | BE | BRD-011, BRD-029 |
| TASK-005.13 | `VacancyService.reserve` | BE | BRD-017, BRD-028 |
| TASK-005.14 | `VacancyService.release` | BE | BRD-028 |
| TASK-005.15 | `VacancyService.changeVacancy` | BE | BRD-028 |
| TASK-005.16 | `VacancyService.finalizeAllocation` | BE | BRD-028 |
| TASK-005.17 | `VacancyService.validateForResume` | BE | BRD-OQ-15 |
| TASK-005.18 | `manualRelease` + REST endpoints | BE | BRD-OQ-15(c) |
| TASK-005.19 | Effect registry registration | BE | BRD-027, BRD-028 |
| TASK-005.20 | Audit & failure-audit wiring | BE | BRD-037 |
| TASK-005.21 | Authorisation policy registration | BE | BRD-026 |
| TASK-005.22 | Counter reconciliation script | BE | BRD-038 |
| TASK-005.23 | Frontend API client & types | FE | BRD-002 |
| TASK-005.24 | Admin list page | FE | BRD-002, BRD-003 |
| TASK-005.25 | Create/Edit form | FE | BRD-010 |
| TASK-005.26 | Detail, ledger, status dialog | FE | BRD-017, BRD-028 |
| TASK-005.27 | HR read-only views & reservation panel | FE | BRD-OQ-15(c) |
| TASK-005.28 | Employee discovery & `VacancyPicker` | FE | BRD-011 |
| TASK-005.29 | Unit tests | QA | all |
| TASK-005.30 | Integration & API tests | QA | all |
| TASK-005.31 | Concurrency tests on real PostgreSQL | QA | BRD-039 V2/V3 |
| TASK-005.32 | Security/authorisation tests | QA | BRD-026 |
| TASK-005.33 | Workflow-contract tests with engine stub | QA | BRD-027 |
| TASK-005.34 | Frontend tests | QA | BRD-002 |
| TASK-005.35 | OpenAPI documentation | BE | Backend-Architecture §20 |
| TASK-006.01 | Migration: `transfer_requests`, reference sequence, constraints, indexes | DB | BRD-030, BRD-029, BRD-011 |
| TASK-006.02 | Status constants and Sequelize model/repository | BE | BRD-030, BRD-019 |
| TASK-006.03 | `EffectiveDateService` + business-time-zone config | BE | BRD-031, OQ-20 |
| TASK-006.04 | Employee profile view service + endpoint | BE | BRD-011, BRD-029 |
| TASK-006.05 | `EligibilityService` (rules 1,3,4,5,6) + HR-contact resolver | BE | BRD-029, BRD-030 |
| TASK-006.06 | Form-options and vacancy-browse facades + endpoints | BE | BRD-011, BRD-028, BRD-029 |
| TASK-006.07 | Draft field validator | BE | BRD-029, BRD-031, BRD-032 |
| TASK-006.08 | Draft service + endpoints (create / update / discard / read) | BE | BRD-032, BRD-030, BRD-018(d) |
| TASK-006.09 | Transfer reference generator | BE | BRD-011, BRD-030 |
| TASK-006.10 | Submission service: lock, pre-checks, snapshot, 23505 mapping | BE | BRD-030, BRD-029, BRD-031 |
| TASK-006.11 | Register SUBMIT handler with `WorkflowEngine` (GATED on SPEC-007 core) | BE | BRD-027, BRD-036 |
| TASK-006.12 | `POST /my/transfer-requests/{id}/submit` endpoint (GATED on SPEC-007 core) | BE | BRD-011, BRD-030 |
| TASK-006.13 | Tracking query service + list/detail endpoints | BE | BRD-011, BRD-034 |
| TASK-006.14 | Authorisation policies | BE | BRD-026 |
| TASK-006.15 | Audit & error-code wiring | BE | BRD-037, BRD-022 |
| TASK-006.16 | FE service layer, types, Redux slice | FE | BRD-011 |
| TASK-006.17 | FE: My Profile page | FE | BRD-011, BRD-029 |
| TASK-006.18 | FE: Vacancy browse page | FE | BRD-011, BRD-028 |
| TASK-006.19 | FE: Eligibility panel component | FE | BRD-029 |
| TASK-006.20 | FE: Transfer form (create/edit Draft) | FE | BRD-032, BRD-031 |
| TASK-006.21 | FE: Submit flow and error handling | FE | BRD-011, BRD-030 |
| TASK-006.22 | FE: My Transfers list | FE | BRD-011 |
| TASK-006.23 | FE: Transfer detail / tracking page | FE | BRD-011, BRD-034 |
| TASK-006.24 | FE: Accessibility, responsive, shared states | FE | NFR-008, BRD-002 |
| TASK-006.25 | QA: Unit tests | QA | all |
| TASK-006.26 | QA: Integration and API tests | QA | all |
| TASK-006.27 | QA: Concurrency tests | QA | BRD-030 |
| TASK-006.28 | QA: Frontend tests | QA | BRD-011 |
| TASK-006.29 | QA: Security and negative tests | QA | BRD-026, BRD-039 |
| TASK-006.30 | QA: Workflow integration check with SPEC-007 (GATED on SPEC-007 core) | QA | BRD-027, BRD-030 |
| TASK-007.01 | Migration: `workflow_configuration` + history | DB | BRD-012, BRD-031 |
| TASK-007.02 | Migration: `transfer_workflow_history` | DB | BRD-027, BRD-037 |
| TASK-007.03 | Migration: `transfer_task_assignments` + `transfer_workflow_state` | DB | BRD-035, BRD-034 |
| TASK-007.04 | Migration: `transfer_clarifications` | DB | BRD-034 |
| TASK-007.05 | Workflow constants & types | BE | BRD-019, BRD-027 |
| TASK-007.06 | Transition registry data | BE | BRD-027, BRD-012 |
| TASK-007.07 | Registry integrity validator | BE | BRD-027, BRD-019 |
| TASK-007.08 | WorkflowEngine core | BE | BRD-027 |
| TASK-007.09 | Guard chain & invalid-transition handling | BE | BRD-OQ-14(d), BRD-026 |
| TASK-007.10 | Handler registry & boot assertion | BE | BRD-027 |
| TASK-007.11 | Assignee resolvers & TaskAssignmentService | BE | BRD-016, BRD-035 |
| TASK-007.12 | WorkflowConfigurationService + routing functions | BE | BRD-012, BRD-031 |
| TASK-007.13 | Generic APPROVE handler | BE | BRD-012, BRD-018 |
| TASK-007.14 | REJECT handler + rejection side effects | BE | BRD-033 |
| TASK-007.15 | Clarification service + handlers | BE | BRD-034 |
| TASK-007.16 | ADD_COMMENT + history read service | BE | BRD-012, BRD-037 |
| TASK-007.17 | Workflow API controllers/routes/validators | BE | BRD-026 |
| TASK-007.18 | Review DTO + my-tasks endpoint | BE | BRD-012 |
| TASK-007.19 | `WorkflowGuard` helper for other SPECs | BE | BRD-032, BRD-033 |
| TASK-007.20 | Audit & notification event wiring | BE | BRD-022, BRD-036 |
| TASK-007.21 | Approvals list page + review screen | FE | BRD-012 |
| TASK-007.22 | Decision action bar + reason dialogs | FE | BRD-012, BRD-033, BRD-034 |
| TASK-007.23 | Clarification thread + employee response form | FE | BRD-034, BRD-011 |
| TASK-007.24 | Workflow history timeline component | FE | BRD-027, BRD-037 |
| TASK-007.25 | Admin workflow configuration page | FE | BRD-012, BRD-031 |
| TASK-007.26 | Golden matrix fixture + exhaustive matrix test | QA | BRD-027, BRD-039 |
| TASK-007.27 | Registry integrity + graph tests | QA | BRD-027 |
| TASK-007.28 | Engine integration tests (atomicity/rollback) | QA | BRD-038 |
| TASK-007.29 | Concurrency tests | QA | BRD-038 |
| TASK-007.30 | API + authorization negative tests | QA | BRD-026, BRD-039 |
| TASK-007.31 | Frontend tests | QA | BRD-012, NFR-008 |
| TASK-007.32 | End-to-end approved-path test with handler stubs | QA | BRD-018 |
| TASK-008.01 | Migration: `hr_activity_definitions` + seed | DB | BRD-027(b), BRD-OQ-14 |
| TASK-008.02 | Migration: `transfer_hr_activities` | DB | BRD-027(b) |
| TASK-008.03 | Migration: `transfer_org_changes` | DB | BRD-024, BRD-032 |
| TASK-008.04 | Migration: `transfer_reapproval_cycles`, `transfer_reapproval_comments` | DB | BRD-024 |
| TASK-008.05 | Migration: `transfer_hr_validation_checks` | DB | BRD-029 r7 |
| TASK-008.06 | Models + repositories | BE | — |
| TASK-008.07 | HR/RM authorisation policies | BE | BRD-026, BRD-035 |
| TASK-008.08 | `EligibilityRevalidationService` | BE | BRD-029 |
| TASK-008.09 | HR worklist and detail queries | BE | BRD-013 |
| TASK-008.10 | `HR_VALIDATE_APPROVE` handler | BE | BRD-027, BRD-028 |
| TASK-008.11 | HR reject handler | BE | BRD-029, BRD-033 |
| TASK-008.12 | HR clarification handler + return routing | BE | BRD-034 |
| TASK-008.13 | `HrActivityService` | BE | BRD-027(b) |
| TASK-008.14 | Payroll-reference & document linking | BE | BRD-020, BRD-021 |
| TASK-008.15 | `OrgChangeService` | BE | BRD-020, BRD-032 |
| TASK-008.16 | Vacancy change integration | BE | BRD-028 |
| TASK-008.17 | `ReapprovalService` (trigger + routing) | BE | BRD-024 |
| TASK-008.18 | RM re-approval decision handlers | BE | BRD-024, BRD-033 |
| TASK-008.19 | `TransferDateService` (HR slice) | BE | BRD-031 |
| TASK-008.20 | `COMPLETE_HR_PROCESSING` handler | BE | BRD-027 |
| TASK-008.21 | Joi validators, DTOs, error mapping | BE | BRD-026 |
| TASK-008.22 | Routes, controllers, OpenAPI | BE | — |
| TASK-008.23 | Audit & notification event wiring | BE | BRD-037, BRD-036 |
| TASK-008.24 | FE: HR worklist page | FE | BRD-013 |
| TASK-008.25 | FE: HR review workspace | FE | BRD-013, BRD-029 |
| TASK-008.26 | FE: activity checklist & org-change form | FE | BRD-020, BRD-024 |
| TASK-008.27 | FE: RM re-approval screens | FE | BRD-024 |
| TASK-008.28 | FE: employee-facing reason/clarification display hooks | FE | BRD-029, BRD-034 |
| TASK-008.29 | Unit tests | QA | all |
| TASK-008.30 | Integration/API tests | QA | all |
| TASK-008.31 | Concurrency & atomicity tests | QA | BRD-028, BRD-039 |
| TASK-008.32 | Security/negative tests | QA | BRD-026, BRD-039 |
| TASK-008.33 | Frontend tests | QA | — |
| TASK-008.34 | Docs & DoD verification | QA | — |
| TASK-009.01 | Migration `payroll_activities` | DB | BRD-027(c) |
| TASK-009.02 | Migration `it_task_types` + seed | DB | BRD-014 |
| TASK-009.03 | Migration `it_tasks`, `it_task_comments`, `it_task_evidence` | DB | BRD-014 |
| TASK-009.04 | Migration `it_stage_outcomes`, `it_final_approvals` + immutability triggers | DB | BRD-027, BRD-039 |
| TASK-009.05 | Sequelize models + repositories | BE | — |
| TASK-009.06 | `PayrollService` | BE | BRD-027(c) |
| TASK-009.07 | Payroll controllers/routes/validators/DTO | BE | BRD-026, BRD-027 |
| TASK-009.08 | Register engine handlers + entry hooks | BE | BRD-027 |
| TASK-009.09 | `ItAssignmentService` | BE | BRD-014, BRD-016 |
| TASK-009.10 | `ItTaskService` | BE | BRD-014, BRD-035 |
| TASK-009.11 | IT projection + queue/detail APIs | BE | BRD-014, NFR-007 |
| TASK-009.12 | Comments + evidence | BE | BRD-014, BRD-021 |
| TASK-009.13 | `COMPLETE_IT_TASKS` handler | BE | BRD-027 |
| TASK-009.14 | `NO_IT_ACTION_REQUIRED` handler | BE | BRD-OQ-11 |
| TASK-009.15 | `CompletionGateService` | BE | BRD-027 |
| TASK-009.16 | `IT_FINAL_APPROVE` handler (completion transaction) | BE | BRD-027, BRD-028 |
| TASK-009.17 | Super Admin effective-date correction | BE | BRD-031 |
| TASK-009.18 | Completion-readiness endpoint | BE | BRD-014 |
| TASK-009.19 | Audit + notification wiring | BE | BRD-022, BRD-036 |
| TASK-009.20 | Immutability guard | BE/DB | BRD-027, BRD-039 |
| TASK-009.21 | IT task-type catalogue admin API | BE | BRD-014 |
| TASK-009.22 | FE: HR Payroll worklist + detail | FE | BRD-027(c), BRD-002 |
| TASK-009.23 | FE: IT work queue + task detail | FE | BRD-014 |
| TASK-009.24 | FE: task controls, comments, evidence | FE | BRD-014 |
| TASK-009.25 | FE: outcome + final approval panel | FE | BRD-027 |
| TASK-009.26 | FE: Super Admin date correction + task-type admin page | FE | BRD-031 |
| TASK-009.27 | QA: unit tests | QA | all |
| TASK-009.28 | QA: API/integration tests (payroll) | QA | BRD-027(c) |
| TASK-009.29 | QA: API/integration tests (IT) | QA | BRD-014 |
| TASK-009.30 | QA: completion + rollback tests | QA | BRD-027 |
| TASK-009.31 | QA: concurrency tests | QA | BRD-038 |
| TASK-009.32 | QA: security/authorization matrix tests | QA | BRD-026, BRD-039 |
| TASK-009.33 | QA: frontend tests | QA | NFR-008 |
| TASK-009.34 | OpenAPI + developer docs | BE | — |
| TASK-010.01 | Migration: exception columns on `transfer_requests` | DB | BRD-027, BRD-033 |
| TASK-010.02 | Migration: `transfer_exception_actions` | DB | BRD-022, BRD-027 |
| TASK-010.03 | Migration: `transfer_task_reassignments` | DB | BRD-035 |
| TASK-010.04 | Migration: final-state immutability trigger | DB | BRD-033, BRD-039 |
| TASK-010.05 | `ExceptionActionPolicy` | BE | BRD-026, BRD-027, BRD-OQ-18 |
| TASK-010.06 | DTOs, constants, validators | BE | BRD-027, BRD-035 |
| TASK-010.07 | `TerminalTransitionEffects` | BE | BRD-027, BRD-028 |
| TASK-010.08 | Withdraw handler + endpoint | BE | BRD-027, BRD-OQ-12 |
| TASK-010.09 | Block handler + endpoint | BE | BRD-027, BRD-OQ-13 |
| TASK-010.10 | Resume handler, revalidation orchestrator + endpoint | BE | BRD-027, BRD-028, BRD-OQ-15, BRD-OQ-18 |
| TASK-010.11 | Cancel handler + endpoint | BE | BRD-027, BRD-OQ-18 |
| TASK-010.12 | Reassign service, candidates and tasks endpoints | BE | BRD-035 |
| TASK-010.13 | Blocked / final-state guards in engine | BE | BRD-027, BRD-033, BRD-039 |
| TASK-010.14 | Denial security auditing | BE | BRD-026, BRD-027, BRD-035 |
| TASK-010.15 | Notification event wiring | BE | BRD-036, BRD-027, BRD-035 |
| TASK-010.16 | Allowed-actions and history endpoints | BE | BRD-026, BRD-037 |
| TASK-010.17 | `ReapplicationPolicy` | BE | BRD-030, BRD-033 |
| TASK-010.18 | OpenAPI docs and error catalogue | BE | BRD-026 |
| TASK-010.19 | FE API client, types, hooks | FE | BRD-002 |
| TASK-010.20 | FE dialog components | FE | BRD-002, NFR-008 |
| TASK-010.21 | FE Super Admin Transfers module actions | FE | BRD-010, BRD-002 |
| TASK-010.22 | FE Employee Withdraw and Apply again | FE | BRD-027, BRD-033 |
| TASK-010.23 | FE HR / IT worklist actions | FE | BRD-027 |
| TASK-010.24 | QA: policy matrix unit tests | QA | BRD-027 |
| TASK-010.25 | QA: Withdraw/Cancel effects integration | QA | BRD-027, BRD-028 |
| TASK-010.26 | QA: Block/Resume integration | QA | BRD-OQ-15, BRD-OQ-18 |
| TASK-010.27 | QA: Reassign integration | QA | BRD-035 |
| TASK-010.28 | QA: concurrency tests | QA | BRD-038 |
| TASK-010.29 | QA: security / cross-role API tests | QA | BRD-026, BRD-039 |
| TASK-010.30 | QA: final-state and reapplication tests | QA | BRD-033, BRD-030 |
| TASK-010.31 | QA: frontend tests | QA | BRD-002, NFR-008 |
| TASK-011.01 | `document_categories` migration + seed | DB | BRD-021 |
| TASK-011.02 | `documents` migration | DB | BRD-021, BRD-OQ-08 |
| TASK-011.03 | Config + storage bootstrap | BE | BRD-021 |
| TASK-011.04 | Sequelize model + repository | BE | BRD-021 |
| TASK-011.05 | `FileTypePolicy` | BE | BRD-021 |
| TASK-011.06 | `FileNameSanitiser` + storage key generator | BE | BRD-021 |
| TASK-011.07 | Upload stream middleware | BE | BRD-021, BRD-038 |
| TASK-011.08 | Document error classes + multer/parser error mapper | BE | BRD-021 |
| TASK-011.09 | `DocumentAccessPolicy` | BE | BRD-021, BRD-026, BRD-039 |
| TASK-011.10 | `DocumentService.upload` + compensation + reconciler | BE | BRD-021 |
| TASK-011.11 | Upload controllers/routes | BE | BRD-021 |
| TASK-011.12 | List/metadata endpoints | BE | BRD-021, BRD-003 |
| TASK-011.13 | View/download streaming endpoints | BE | BRD-021 |
| TASK-011.14 | Visibility PATCH | BE | BRD-021 `[PROPOSED]` |
| TASK-011.15 | Audit integration | BE | BRD-022, BRD-026 |
| TASK-011.16 | No-delete / 405 guard | BE | BRD-OQ-08 |
| TASK-011.17 | IT evidence hook | BE | BRD-014 `[TDD-REQUIRED]` |
| TASK-011.18 | FE API client, types, error map | FE | BRD-021 |
| TASK-011.19 | `DocumentUploader` component | FE | BRD-021 |
| TASK-011.20 | `DocumentList` + preview/download | FE | BRD-021, BRD-022 |
| TASK-011.21 | Documents admin module | FE | BRD-003 |
| TASK-011.22 | Embedding adapters | FE | BRD-013, BRD-014 |
| TASK-011.23 | Backend unit tests | QA | BRD-021 |
| TASK-011.24 | Backend API/integration/security tests | QA | BRD-021, BRD-039 |
| TASK-011.25 | Concurrency & failure-injection tests | QA | BRD-021 |
| TASK-011.26 | Frontend tests | QA | BRD-021 |
| TASK-011.27 | Negative/BRD-039 suite + traceability handoff | QA | BRD-039 |
| TASK-012.01 | Migrations: outbox extension, deliveries, attempts, in-app, secrets | DB | BRD-036, NFR-006 |
| TASK-012.02 | Models and repositories | BE | BRD-036 |
| TASK-012.03 | Config and `.env.example` | BE | BRD-036, NFR-003 |
| TASK-012.04 | Event catalogue registry and PayloadGuard | BE | BRD-036 |
| TASK-012.05 | Template engine and templates | BE | BRD-036 |
| TASK-012.06 | RecipientResolver | BE | BRD-036, BRD-027 |
| TASK-012.07 | `SecretHandoffService` | BE | BRD-005, NFR-003 |
| TASK-012.08 | `NotificationService.enqueue` (full implementation) | BE | BRD-036 |
| TASK-012.09 | `EmailTransport` adapter | BE | BRD-036, NFR-006 |
| TASK-012.10 | In-app channel handler | BE | BRD-036 |
| TASK-012.11 | `DeliveryProcessor` and worker loop | BE | BRD-036, NFR-006 |
| TASK-012.12 | Retry service | BE | BRD-036, NFR-006 |
| TASK-012.13 | Inbox API | BE | BRD-036, NFR-007 |
| TASK-012.14 | Admin API | BE | NFR-006 |
| TASK-012.15 | Logging, sanitiser and audit integration | BE | BRD-036, BRD-037 |
| TASK-012.16 | Producer integration contract and helpers | BE | BRD-036, BRD-027 |
| TASK-012.17 | Frontend: bell, unread badge, dropdown | FE | BRD-036, NFR-008 |
| TASK-012.18 | Frontend: inbox page | FE | BRD-036, BRD-002 |
| TASK-012.19 | Frontend: admin failed notifications | FE | NFR-006, BRD-002 |
| TASK-012.20 | Unit tests | QA | all |
| TASK-012.21 | Integration tests (atomicity, isolation, idempotency) | QA | BRD-036, BRD-039 |
| TASK-012.22 | Concurrency tests | QA | NFR-006 |
| TASK-012.23 | Security tests | QA | NFR-003, NFR-007 |
| TASK-012.24 | Matrix coverage test | QA | BRD-027, BRD-036 |
| TASK-012.25 | Frontend tests | QA | NFR-008 |
| TASK-012.26 | UAT/API scripts for SPEC-016 | QA | BRD-039 |
| TASK-013.01 | Extend `audit_logs` (additive migration) | DB | BRD-037 |
| TASK-013.02 | `audit_log_participants`, `audit_seals`, `audit_spool_imports` tables | DB | BRD-035, BRD-037, NFR-005 |
| TASK-013.03 | DB hardening: roles, REVOKE, triggers | DB | BRD-037, NFR-005 |
| TASK-013.04 | Event catalogue registry & payload schemas | BE | BRD-022 |
| TASK-013.05 | `AuditRedactor` | BE | BRD-037, NFR-003 |
| TASK-013.06 | Harden `AuditService.record` | BE | BRD-022, BRD-037 |
| TASK-013.07 | `recordIndependent`, denial writers, spool & reconciler | BE | BRD-026, BRD-027, BRD-037 |
| TASK-013.08 | Actor/request context binding | BE | BRD-037 |
| TASK-013.09 | Seal worker + verifier | BE | NFR-005 |
| TASK-013.10 | `AuditVisibilityPolicy` | BE | BRD-037, BRD-026 |
| TASK-013.11 | `AuditQueryService` + repository | BE | BRD-037 |
| TASK-013.12 | List/detail/event-codes/timeline endpoints | BE | BRD-037, BRD-003 |
| TASK-013.13 | Audit export service + endpoint | BE | BRD-037 |
| TASK-013.14 | Integrity endpoints + alert | BE | NFR-005 |
| TASK-013.15 | App-layer immutability guards | BE | BRD-037 |
| TASK-013.16 | Notification-failure audit adapter | BE | BRD-036 |
| TASK-013.17 | Catalogue conformance harness | QA/BE | BRD-022 |
| TASK-013.18 | FE Audit Logs list page | FE | BRD-003, BRD-002 |
| TASK-013.19 | FE filter panel + URL state | FE | BRD-037 |
| TASK-013.20 | FE detail drawer + diff | FE | BRD-037 |
| TASK-013.21 | FE export dialog (Super Admin) | FE | BRD-037 |
| TASK-013.22 | FE `TransferAuditTimeline` component | FE | BRD-035 |
| TASK-013.23 | FE nav gating + a11y | FE | NFR-008 |
| TASK-013.24 | Unit tests: catalogue, redactor, policy | QA |  |
| TASK-013.25 | DB immutability & privilege tests | QA | NFR-005 |
| TASK-013.26 | Visibility matrix tests | QA | BRD-037 |
| TASK-013.27 | Export tests | QA | BRD-037 |
| TASK-013.28 | Fail-closed / fault-injection tests | QA | FR-013.14 |
| TASK-013.29 | Credential leak scan | QA | BRD-037, NFR-003 |
| TASK-013.30 | Index/volume test | QA | NFR-009 |
| TASK-013.31 | Tamper detection tests | QA | NFR-005 |
| TASK-014.01 | Migration: `escalation_settings`, `escalation_recipients` + seed stage rows (all NULL/inactive) | DB | BRD-023, OQ-10 |
| TASK-014.02 | Migration: `overdue_flags` | DB | BRD-023 |
| TASK-014.03 | Migration: read-model indexes (`CREATE INDEX IF NOT EXISTS`) | DB | BRD-002, BRD-023 |
| TASK-014.04 | Sequelize models + associations | BE | BRD-023 |
| TASK-014.05 | `ScopeFilter` type and `ReportScopeBuilder` | BE | BRD-026, NFR-007 |
| TASK-014.06 | Status/stage constants and predicates module | BE | BRD-027, BRD-030 |
| TASK-014.07 | Dashboard repository + service + `GET /dashboard/summary` | BE | BRD-002, BRD-011–014 |
| TASK-014.08 | Employee my-requests + pending actions | BE | BRD-011, BRD-034 |
| TASK-014.09 | Transfer worklists (RM/RcvM/HR/SA) | BE | BRD-012, BRD-013, BRD-035 |
| TASK-014.10 | IT worklist with minimum-information DTO | BE | BRD-014, NFR-007 |
| TASK-014.11 | Report registry, `REPORT_POLICY`, validators, `GET /reports` | BE | BRD-023 |
| TASK-014.12 | Reports: request-volume, current-stage, pending-owner, pending-approvals, hr-reviews, blocked-tasks | BE | BRD-023 |
| TASK-014.13 | Reports: vacancy-utilisation, open-vacancies | BE | BRD-023, BRD-028 |
| TASK-014.14 | Report: completion-time | BE | BRD-023 |
| TASK-014.15 | Overdue calculation service + `overdue-tasks` report | BE | BRD-023, OQ-10 |
| TASK-014.16 | Escalation settings service + API + audit | BE | BRD-023 |
| TASK-014.17 | Overdue evaluator job + notification enqueue | BE | BRD-023, BRD-036 |
| TASK-014.18 | Export (feature-flagged, blocked on TDD-014.12) | BE | TDD |
| TASK-014.19 | FE services, types, hooks | FE | BRD-002 |
| TASK-014.20 | FE shared components and states | FE | BRD-002 |
| TASK-014.21 | FE Super Admin dashboard | FE | BRD-002 |
| TASK-014.22 | FE Employee dashboard | FE | BRD-011 |
| TASK-014.23 | FE manager/HR worklist pages | FE | BRD-012, BRD-013 |
| TASK-014.24 | FE IT worklist page | FE | BRD-014 |
| TASK-014.25 | FE reports pages | FE | BRD-023 |
| TASK-014.26 | FE escalation settings page | FE | BRD-023 |
| TASK-014.27 | FE navigation/guards/no-access | FE | BRD-002, BRD-026 |
| TASK-014.28 | Backend unit tests | QA | all |
| TASK-014.29 | Backend integration/API/scope tests | QA | BRD-026, BRD-039 |
| TASK-014.30 | Consistency/concurrency tests | QA | BRD-038 |
| TASK-014.31 | Frontend tests incl. accessibility | QA | BRD-002, NFR-008 |
| TASK-014.32 | Seed dataset generator for performance | QA | BRD-038 |
| TASK-015.01 | Field-ownership registry | BE | BRD-029, OQ-19 |
| TASK-015.02 | Controlled-field write guard & allow-list DTOs | BE | BRD-029, 026 |
| TASK-015.03 | Registry-coverage test (static) | QA | BRD-029 |
| TASK-015.04 | Master-data-only enforcement review | BE/DB | BRD-029 |
| TASK-015.05 | In-flight snapshot behaviour tests | QA | BRD-029, 024, 032 |
| TASK-015.06 | Data-consistency verification suite | BE/DB | BRD-028, 029, 030, 027, 037 |
| TASK-015.07 | Integration port interfaces and registry guard | BE | BRD Integration Req, 038 |
| TASK-015.08 | Outbound-call guard | BE/QA | BRD Integration Req, 029 |
| TASK-015.09 | Future-integration contract template | DOC | BRD Integration Req |
| TASK-015.10 | Contract-level integration harness | QA | NFR-006, BRD-039 |
| TASK-015.11 | Manual-Payroll and SMTP-dependency scenario tests | QA | BRD-027(c), 036, 039 |
| TASK-015.12 | Security headers & CORS config | BE | NFR-004 |
| TASK-015.13 | Rate limiting | BE | NFR-001 |
| TASK-015.14 | Validation baseline | BE | NFR-002 |
| TASK-015.15 | SQL-safety checks | QA | NFR-002 |
| TASK-015.16 | Error-leakage verification | QA | BRD-026 |
| TASK-015.17 | Secret/credential leakage scan | QA | NFR-003, BRD-025, 037 |
| TASK-015.18 | Transport security (TLS) arrangement | BE/DOC | NFR-004 |
| TASK-015.19 | Personal-data protection verification | BE/QA | NFR-004, 007, BRD-014 |
| TASK-015.20 | Authorisation hardening checklist & route matrix | QA | NFR-002, BRD-026, 039 |
| TASK-015.21 | Tamper-resistant audit review | DB/QA | NFR-005, BRD-037 |
| TASK-015.22 | Accessibility verification | FE/QA | NFR-008, BRD-002 |
| TASK-015.23 | Performance input register & test plan | DOC/QA | BRD-038 |
| TASK-015.24 | 5 MB upload end-to-end verification | QA | BRD-021, 038 |
| TASK-015.25 | Timeout & request-lifetime configuration | BE | BRD-038 |
| TASK-015.26 | Transaction-safety & partial-operation review | QA/DB | BRD-038, 028, 030 |
| TASK-015.27 | Idempotency / duplicate-request review | BE/QA | NFR-006, BRD-038 |
| TASK-015.28 | Health/readiness & operability hooks | BE | NFR-009 |
| TASK-015.29 | Infrastructure planning checklist | DOC | NFR-009, OQ-09 |
| TASK-015.30 | Dependency, secret & config audit | QA | NFR-003/004 |
| TASK-015.31 | Pre-production validation runbook | DOC/QA | BRD-038 |
| TASK-015.32 | Production readiness gate assembly | QA | BRD-038, 039 |
| TASK-015.33 | NFR control-verification matrix | QA/DOC | NFR-001..009 |
| TASK-015.34 | Optional field-ownership read API & Super Admin view | BE/FE | BRD-029 |
| TASK-016.01 | Test strategy and conventions | QA | BRD-039 |
| TASK-016.02 | Shared QA support library | BE | BRD-026 |
| TASK-016.03 | QA persona and scenario seed | DB | BRD-005/006 |
| TASK-016.04 | Environment guard | QA | NFR-004 |
| TASK-016.05 | Traceability tooling | QA | BRD-039 |
| TASK-016.06 | BRD-039 report and release gate | QA | BRD-039 |
| TASK-016.07 | Security scenario pack S1–S8 | QA | BRD-039 |
| TASK-016.08 | Workflow scenario pack W1–W7 | QA | BRD-039, 024, 027 |
| TASK-016.09 | Vacancy scenario pack V1–V4 | QA | BRD-028, 039 |
| TASK-016.10 | Integration scenario pack I1–I5 | QA | BRD-039, NFR-006 |
| TASK-016.11 | Journey harness | QA | BRD-018 |
| TASK-016.12 | Happy-path journeys P01–P03 | QA | BRD-018, 027 |
| TASK-016.13 | Exception-path journeys P04–P25 | QA | BRD-027, 033, 034, 035 |
| TASK-016.14 | Matrix replay and fixture integrity | QA | BRD-027 |
| TASK-016.15 | Concurrency suite C-01…C-12 | QA | BRD-028, 030, 038 |
| TASK-016.16 | Notification outage and document journeys | QA | BRD-036, 021 |
| TASK-016.17 | Audit completeness and integrity checks | QA | BRD-037 |
| TASK-016.18 | UI end-to-end and accessibility smoke | FE | BRD-002, NFR-008 |
| TASK-016.19 | UAT pack | QA | BRD UAT |
| TASK-016.20 | UAT environment and sign-off form | QA | BRD UAT |
| TASK-016.21 | Performance prerequisites guard | QA | BRD-038 |
| TASK-016.22 | Performance workload scripts and invariants | QA | BRD-038 |
| TASK-016.23 | CI pipeline and gates | QA | BRD-039 |
| TASK-016.24 | CI guards | QA | BRD-038, NFR-003 |
| TASK-016.25 | Acceptance and out-of-scope matrix automation | QA | BRD Acceptance, Out of Scope |
| TASK-016.26 | Pre-production validation gate | QA | BRD-038 |
| TASK-016.27 | Release readiness checklist | QA | BRD-039 |
| TASK-016.28 | Defect and waiver log | QA | BRD-039 |
| TASK-016.29 | Evidence pack assembly | QA | BRD-039 |
| TASK-016.30 | Gate 2 handoff and DoD verification | QA | AGENTS.md |

## Appendix B — Id resolution check

| Class | Defined ids parsed | Citations checked | Dangling |
|---|---|---|---|
| TASK | 508 | every `TASK-NNN.MM` and range in the 16 specs and in `Depends on` columns | 0 |
| AC | 479 | every `SPEC-NNN.ACmm`, shorthand `ACmm` and range | 3 (G-02 `SPEC-007.AC40–42`) |
| NAC | 363 | every `SPEC-NNN.NACmm`, shorthand `NACmm` and range | 12 (G-01 SPEC-004) |
| TC | 1145 (expanded from ranges) | every `TC-NNN.mm` and range | 20 (G-03 SPEC-014) |
| Other | 252 TDD, 850 FR defined | `TDD-NNN.NN`, `FR-NNN.nn` | TDD-014.15; FR-015.28; FR-004.59; ranges FR-009.27–.29 and .47–.49 (G-10) |

Labels in a non-standard form (`AC-015.nn`, `NAC-015.nn`, `NAC-013.nn`, `AC-013.17`) are listed in G-04 and G-05.
