# Assumptions

Generated during BRD ingestion of `docs/Internal_Transfer_Digital_Journey_SOW.pdf`
(v1.1). These are inferred/default positions taken because the source SOW leaves
them open or unconfirmed; they must be validated at Gate 0 and revisited if the
organisation's answers (see `BRD.md` → Open Questions) differ.

| ID | Assumption | Rationale | Linked BRD Item |
|---|---|---|---|
| ASM-001 | The existing One-Point Employee Portal's identity/access model can be integrated with as-is; no new identity provider is built. | Source SOW §5 states "existing enterprise systems remain authoritative for ... access ... data" and out-of-scope explicitly excludes building a new identity provider. | BRD-001, Out of Scope |
| ASM-002 | Receiving-manager approval is treated as an optional/conditional review step (not always required) until confirmed. | Source SOW §2 explicitly states "The receiving-manager approval is included as a proposed business rule, not a confirmed policy." | BRD-006, BRD-OQ-1 |
| ASM-003 | Downstream HR/payroll/IT/facilities systems expose an integrable API or an agreed task-handoff mechanism; this project does not build new source-system functionality. | Source SOW §3.3 and Out of Scope. | BRD-009, BRD-OQ-3 |
| ASM-004 | "Node.js backend" in the source SOW is satisfied by this repository's Express (TypeScript) backend, and "PostgreSQL" is satisfied via Sequelize ORM. | Source SOW §5 names Next.js + Node.js + PostgreSQL; this repository was scaffolded with Next.js (frontend) and Express + Sequelize/PostgreSQL (backend) during `/int-project-setup`. | Dependencies |
| ASM-005 | `Draft` (unsubmitted, saved) request state is treated as optional/not guaranteed until confirmed. | Source SOW §4 status table: "Draft — ... optional if draft saving is approved." | BRD-014, BRD-OQ-8 |
| ASM-006 | No measurable performance/availability/retention targets are assumed by default; these are treated as `[Open]` rather than inferred numeric defaults. | Source SOW §7 explicitly defers these to discovery; INT standards prohibit inventing constraints not supported by the BRD. | BRD-OQ-7 |
| ASM-007 | Withdrawal of a submitted request by the employee is NOT assumed to be supported by default, pending confirmation. | Source SOW §4: "withdrawal rules to be confirmed." | BRD-OQ-5 |

## Open Items Requiring Reviewer Resolution
All items in `BRD.md` → Open Questions (BRD-OQ-1 through BRD-OQ-8) must be
explicitly answered by the Gate 0 reviewer per `.agent/rules` — see the standardized
Gate 0 BRD PR Review template requirement in `int-brd-ingestion`.
