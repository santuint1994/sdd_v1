# Assumptions

Generated/updated during BRD ingestion. Current baseline reflects
`docs/Internal_Transfer_Digital_Journey_Full_Updated_SOW_v1.0.pdf` (supersedes the
v1.1-derived assumptions below where noted). These are inferred/default positions
taken because the source SOW leaves them open or unconfirmed; they must be
validated at Gate 0 and revisited if the organisation's answers (see `BRD.md` →
Open Questions) differ.

> **Revision 3 note:** The Facilities/Admin role and BRD-026 (its task-execution
> requirement) were removed from `BRD.md` at explicit user request — a scope
> reduction relative to the source SOW, not an SOW-driven change. References to
> "facilities" below are retained where they describe the source SOW's original
> text/rationale; the corresponding BRD linkage has been corrected where it
> pointed at the now-removed BRD-026.

| ID | Assumption | Rationale | Linked BRD Item | Status |
|---|---|---|---|---|
| ASM-001 | The existing One-Point Employee Portal's identity/access model can be integrated with as-is; no new identity provider is built. | Source SOW §5 (v1.1) / Out of Scope (v1.4): "building ... an identity provider" remains out of scope. | BRD-001, Out of Scope | Still valid, but see ASM-008 (authentication model is now explicitly open). |
| ASM-002 | Receiving-manager approval is treated as an optional/conditional review step (not always required) until confirmed. | v1.1 called it "proposed, not confirmed"; v1.4 refines it to "configurable per company policy" — still not confirmed which default applies. | BRD-006, BRD-023, BRD-OQ-1, BRD-OQ-9 | Superseded wording, same open status. |
| ASM-003 | Downstream HR/payroll/IT/facilities systems expose an integrable API or an agreed task-handoff mechanism; this project does not build new source-system functionality. | Source SOW §3.3 (v1.1) / §15, §19 (v1.4) and Out of Scope. | BRD-009, BRD-OQ-3 | Still valid. |
| ASM-004 | "Node.js backend" in the source SOW is satisfied by this repository's Express (TypeScript) backend, and "PostgreSQL" is satisfied via Sequelize ORM. | Source SOW §5 (v1.1) / §15 (v1.4) names Next.js + Node.js + PostgreSQL; this repository was scaffolded with Next.js (frontend) and Express + Sequelize/PostgreSQL (backend) during `/int-project-setup`. | Dependencies | Still valid. |
| ASM-005 | `Draft` (unsubmitted, saved) request state is treated as optional/not guaranteed until confirmed. | v1.1 and v1.4 both state: "Draft — ... optional if draft saving is enabled/approved." | BRD-014, BRD-OQ-8 | Still valid, unchanged in v1.4. |
| ASM-006 | No measurable performance/availability/retention targets are assumed by default; these are treated as `[Open]` rather than inferred numeric defaults. | v1.1 §7 and v1.4 §16 both explicitly defer these to discovery; INT standards prohibit inventing constraints not supported by the BRD. | BRD-OQ-7 | Still valid, unchanged in v1.4. |
| ASM-007 | Withdrawal of a submitted request by the employee is NOT assumed to be supported by default, pending confirmation. | v1.1 and v1.4 both state: "withdrawal rules to be confirmed." | BRD-OQ-5 | Still valid, unchanged in v1.4. |
| ASM-008 | **`[New]`** No default authentication model (local credentials vs. enterprise SSO vs. hybrid) is assumed; all three remain open until the organisation confirms. | v1.4 §18 explicitly asks the organisation to confirm this; no default is stated in the SOW. | BRD-001, BRD-OQ-12 | New in this revision. |
| ASM-009 | **`[New]`** No default User ID naming/numbering convention or password policy is assumed; these are treated as organisation-supplied configuration, not invented values. | v1.4 §18 defers both to organisation confirmation. | BRD-017, BRD-OQ-11, BRD-OQ-13 | New in this revision. |
| ASM-010 | **`[New]`** Vacancy capacity-reservation timing (at submission, at manager approval, or at HR validation) is NOT assumed by default; no reservation point is inferred. | v1.4 §8 explicitly states this "will be confirmed during discovery." | BRD-021, BRD-OQ-14 | New in this revision. |
| ASM-011 | **`[New]`** Document storage/retention/classification/allowed-file-type/access policy is NOT assumed; no default values (e.g., max file size, retention period) are invented. | v1.4 §12 explicitly defers all of these to discovery. | BRD-027, BRD-OQ-16 | New in this revision. |
| ASM-012 | **`[New]`** Organisation metadata fields HR updates post-approval, and their authoritative source system, are NOT assumed. | v1.4 §11 explicitly states these "will be confirmed during discovery." | BRD-024, BRD-OQ-15 | New in this revision. Linkage corrected in Revision 3 from BRD-026 (now Removed) to BRD-024, the org-metadata/payroll requirement. |
| ASM-013 | **`[New]`** Reassignment/escalation of a Reporting Manager's worklist item (present in v1.1's manager actions) is assumed to now be covered generically by Super Admin's administrative-intervention capability (BRD-028) rather than a manager-level self-service action, since v1.4's manager action list (§6.3) no longer lists reassignment/escalation explicitly. | v1.1 §3.2 listed "reassignment/escalation controls" under manager worklist actions; v1.4 §6.3 lists only approve/reject/clarify/comment for Reporting Manager, while §6.1 gives Super Admin explicit "reassign or administratively intervene" authority. | BRD-006, BRD-028, BRD-OQ-9 | New in this revision — flagged for reviewer confirmation, not a confident inference. |

## Open Items Requiring Reviewer Resolution
All items in `BRD.md` → Open Questions (BRD-OQ-1 through BRD-OQ-17) must be
explicitly answered by the Gate 0 reviewer per `.agent/rules` — see the
standardized Gate 0 BRD PR Review template requirement in `int-brd-ingestion`.
BRD-OQ-9 through BRD-OQ-17 are new in this revision (v1.4 ingestion).
