# SplitSmart — Requirements and Design Reconciliation Instructions

Use this file as the task brief for Codex in VS Code. Start with the Codex design proposal and selectively adopt the Spec Kit identity boundary and OpenAPI structure. The goal is one coherent, traceable design package ready for human sign-off.

## 1. Start the review

Open the SplitSmart repository in VS Code and give Codex this prompt:

> Read `design-comparison/RECONCILIATION-INSTRUCTIONS.md` and follow it. Begin with the baseline review and decision register. Produce a documentation-only reconciliation on a dedicated branch. Preserve existing local changes and both original proposals. Use recorded decisions that I explicitly approve, and flag remaining gates. Do not implement the application, commit, push, or merge.

1. Inspect `git status --short --branch` and record the current commit. Use a dedicated branch such as `design/reconcile-splitsmart` or an isolated worktree if the current worktree has unrelated changes. Preserve any local work and identify which revision is being reconciled.
2. Read the current `UserRequirement.md`, `.specify/memory/constitution.md`, `specs/001-shared-expense-management/spec.md`, and `specs/001-shared-expense-management/checklists/requirements.md` in full. Then read the [comparison report](ARCHITECTURE-DESIGN-COMPARISON.md), [Codex proposal](codex/), and [Spec Kit proposal](../specs/001-shared-expense-management/), including their contracts, diagrams, decision records, traceability and validation plans.
3. Record the reviewed source revision, compare the four authority files with the report’s pinned revisions, and explain any drift. The committed customer request and constitution govern the result. The feature spec records clarifications and acceptance targets. The comparison and proposals provide design evidence. Escalate conflicts in authority or scope for a human decision.
4. Work in two passes. First, prepare the decision register and draft every section that can be reconciled from the sources. Second, apply approved decisions, recheck all affected documents and report the remaining gates. Label the package **Draft — pending decisions** while any mandatory gate is open. Once the gates are closed and document checks pass, label it **Ready for human sign-off**. Record final approval only when explicitly given.

## 2. Resolve product and governance decisions

Use the following register as the minimum agenda. For each item record source IDs, options and consequences, the recommended provisional direction, decision owner, status, affected artifacts, and the approver/date or link when decided. Distinguish **Open**, **Proposed**, and **Approved**.

| Decision | Question to resolve | Owner |
|---|---|---|
| Release and production platforms | Is Swing a prototype or first-stage release? Which workflows belong to it, and how will the primary web product plus Android and iOS be delivered under FR-017–FR-019 and SC-004? Resolve Java 21/Maven applicability to future client stacks under Constitution II. | Product owner and maintainers |
| Approval policy | Who can approve, how do stage order and quorum work, and when is self-approval permitted? Define pending review behavior after a policy change or member removal. | Product owner |
| Money policy | Which currencies and scales are supported? Confirm one currency per group, amount and percentage input bounds, and how unsupported precision is handled. Preserve the exact rounding rule. | Product owner and finance reviewer |
| Notification policy | Reconcile unconditional FR-008 with the enabled-group wording in AC-008. Define recipient timing, permitted preferences, channels, delivery success, retry and failure visibility. Separate submission alerts from identity verification and recovery email. | Product owner and operations |
| Pairwise debt and settlements | Decide whether opposite obligations net, who may record a payment, and what departed members can view or settle. Decide how any correction or reversal is handled if in scope. | Product owner and domain reviewer |
| Reports and consistency | Decide date basis, inclusive boundaries, late approvals/backdating, member/status filters and which totals they affect. Define carry-in versus period totals and what counts as the same completed revision across clients. | Product owner and API/data reviewers |
| Verification conditions | Confirm representative load profile, supported-client accessibility evidence, and first-time usability cohort. Preserve committed thresholds unless an authorized requirements change is recorded. | Product owner and QA |

## 3. Produce the reconciled package

Use `design-comparison/reconciled/` as the proposed review folder. Create a `README.md` with status, baseline, reading order, and the canonical location for each deliverable. Keep the original A/B files as comparison evidence. Once decisions and promotion are approved, bring the canonical feature specification and readiness checklist in `specs/001-shared-expense-management/` into sync. Use links for shared material so two documents do not define competing requirements. Amend the constitution only through its governance process.

| Deliverable | Required content |
|---|---|
| `requirements.md` | Reconciled customer and release scope, actors, functional and nonfunctional requirements, business rules, assumptions, acceptance scenarios and measurable success criteria. Retain FR-001–FR-021, NFR-001–NFR-005, AC-001–AC-021 and SC-001–SC-007 or document approved changes and a migration map. Distinguish customer requirements, clarifications, engineering policies, and proposed design decisions. |
| `architecture.md` | System context, deployment and trust boundaries, module dependencies, shared service and client roles, integration points, architecture decisions and tradeoffs. Show where identity, authorization, transactions, receipts and asynchronous delivery live. |
| `design.md` | Use-case specifications with actors, preconditions, trigger, main flow, alternate/error flows, postconditions and requirement links. Describe service responsibilities, permission matrix, financial algorithms, workflow states, retries and failures. |
| `data-model.md` | Entities, keys, cardinalities, state transitions, ownership, currency scale and precision, unique constraints, indexes and report date basis. Include ledger versus projection ownership, transaction boundaries, reconciliation, retention and recovery. |
| `contracts/openapi.yaml` and supporting contract notes | One proposed API covering resource ownership, role checks, request/response schemas, versioning, stable errors, exact decimal fields, idempotency, pagination and snapshot rules. Define what the identity provider owns and what SplitSmart owns. |
| `diagrams/` | PlantUML sources from Section 5, with a diagram index that links each diagram to its use case, requirements and corresponding prose or contract. |
| `decisions.md`, `traceability.md`, `verification.md` | Decision register and change log, bidirectional requirement-to-design-to-test matrix, and planned checks with explicit fixtures, expected outcomes, and execution status. Record review evidence and open gates. |

For each NFR write the measure, test conditions, evidence and pass threshold. Retain authorization testing from another account or group (NFR-001), the 100-active-user and 95%-within-two-seconds target for visible results (NFR-002/SC-006), exact currency reconciliation (NFR-003), keyboard operation and labels for primary flows (NFR-004/AC-017), and agreement of completed records across supported clients (NFR-005/SC-007). Preserve the 90% unaided first-time usability target in SC-005 and the full-platform flows in SC-004.

## 4. Reconcile the design choices

1. **Preserve Codex’s financial core.** Use `BigDecimal` and exact smallest-unit quotient/remainder allocation with participant-entry-order ties. Validate percentages against exact 100%. Preserve independent payer selection, zero self-debt, and zero financial effect from pending and rejected expenses.
2. **Keep one transaction model.** Adopt frozen approval-stage snapshots, unique finalization including zero-posting approvals, and atomic ledger, projection and operation-result writes. Specify one lock order for approvals and settlements, including the first posting for a pair. Recheck the operation key under lock before version or balance checks. Define same-key replay, changed-payload conflict, concurrent commands, and failures before and after commit.
3. **Bring over Spec Kit’s identity and contract boundaries.** Use a provider-owned credential and recovery lifecycle, and map authenticated provider identities to SplitSmart accounts. Keep membership and resource authorization within SplitSmart. Adapt Spec Kit’s OpenAPI to the selected Codex workflow rather than copying contradictory routes, error codes, or credential endpoints.
4. **Fix reports and consistent reads.** Choose one composite read or a shared snapshot token for views that must agree. Document freshness and same-revision consistency separately. Define status/date/member criteria and distinguish matching totals from independently scoped values such as opening balance. Specify notification delivery and receipt staging failure behavior separately from money writes.
5. **Preserve provisional choices visibly.** Signed pair netting, provider selection, exact currency support, future client languages and delivery policies require the decisions recorded in Section 2. Connect each unresolved choice to the affected requirements, diagrams, contracts and verification cases.

## 5. Create and cross-check the UML

| Diagram type | Minimum coverage |
|---|---|
| **Use case** | Show the SplitSmart boundary, account holder, group manager, submitter, approver, payment recorder and external actors where applicable. Cover accounts and recovery, invitations, expenses and approvals, notifications, balances, settlements and reports. Link use-case IDs to written scenarios. |
| **Component** | Show Swing and future web/Android/iOS clients, HTTPS API, identity provider, application and domain modules, database, private receipts and outbox/delivery. Label dependencies and trust boundaries. |
| **Detailed class** | Show significant attributes and operations, types, relationships, multiplicities, composition where appropriate and constraints. Include group, member, invitation, expense, share, payer, approval stage/decision, finalization, ledger entry, pair balance, payment, receipt, and key service interfaces. Draw the receipt as optional and show mutually exclusive expense/payment posting sources. Split into readable views if needed. |
| **Sequence** | Cover invitation acceptance and access, expense submission through multi-stage approval and notification, settlement and retries, and a same-revision report/read. Show actors, authorization, lock order, transaction/commit, outbox processing and failure or replay branches. |
| **State** | Show expense review states, guarded transitions, rejection and any approved withdraw/resubmit rules. Treat a computed blocked condition consistently. Also document invitation and notification delivery lifecycles. |
| **Activity** | Show expense-to-approval and settlement workflows with validation, decision guards, alternate paths, and who is responsible for each step. Include overpayment rejection and unchanged balances on failure. |

Use consistent names and requirement/use-case IDs across diagrams and documents. Render every `.puml` file with the available PlantUML setup and inspect each output for syntax and semantic agreement. If rendering is blocked, record the exact blocker and which files still need rendering. Report textual review separately.

## 6. Verify and hand off

- Cross-check every FR/NFR, AC and SC against a design section, contract or diagram where relevant and a verification case. Record full-product versus Swing MVP coverage and any deferred work.
- Check example outcomes independently. Equal 10.00 across three ordered participants gives 3.34/3.33/3.33. A 50/50 split of 0.05 gives 0.03/0.02. A 4.00 settlement against 10.00 leaves 6.00 and one history entry. A later 7.00 attempt changes neither. Include same-key retry, concurrent final approval/settlement, failure before commit, changed-payload conflict, cross-account access, and interleaved cross-client reads.
- Validate OpenAPI syntax and local references, inspect links, check diagram inventory and source traceability, and review the Git diff for unrelated changes. Describe which commands ran, results and outstanding checks. Treat future JUnit 5, concurrency, accessibility, load, usability and client-parity tests as planned until executed.
- End with files changed, approved/open decisions, source revisions, design deltas from A and B, and the exact items remaining for sign-off. Leave the changes ready for the user to review.
