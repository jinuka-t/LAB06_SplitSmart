# SplitSmart architecture and design prompts

Use two independent architecture-generation workflows—GitHub Spec Kit with Copilot and OpenAI Codex in VS Code—then use ChatGPT to review and compare their outputs. The source requirements baseline originally reviewed was `ba90a30667a1bc5683cf4cefc6836a2cf4a50019`; **do not assume it is still current**. Record the actual same source commit for both runs.

## Prompt files

- [Spec Kit + Copilot](01-SPECKIT-PROMPT.md)
- [Codex in VS Code](02-CODEX-PROMPT.md)
- [ChatGPT comparison and cross-check](03-CHATGPT-REVIEW-PROMPT.md)

## How to run

1. Review the common brief below. Start two clean worktrees or branches from the **same source requirements commit**. Use separate fresh agent chats and separate output directories. Do not let either generator read the other one's design.
2. In the Spec Kit worktree, use GitHub Copilot and the installed `speckit-plan` skill with Prompt 1. Follow the PowerShell feature-directory setup below. Spec Kit's native planning artifacts belong under `specs/001-shared-expense-management/`; keep those outputs on its separate branch.
3. In the Codex worktree, open VS Code with the official OpenAI Codex extension, sign in with your ChatGPT account, and submit Prompt 2 in a fresh Codex session. Codex outputs go under `design-comparison/codex/`. Do not invoke Spec Kit or inspect its generated outputs.
4. After generation, make both full artifact sets accessible to ChatGPT, either by committed branch/commit links or by uploading local files. Include the actual common source commit and submit Prompt 3. Do not compare against incomplete excerpts when complete artifacts are available.
5. Review the comparison and decide which design or combination to adopt. **Do not automatically merge or implement either proposal.**

From the Spec Kit worktree root in PowerShell:

```powershell
$env:SPECIFY_FEATURE_DIRECTORY = 'specs/001-shared-expense-management'
$env:SPECIFY_FEATURE_NO_PERSIST = '1'
code -n .
```

If VS Code is already running, close it first so the new process inherits the variables. The explicit feature path selects the existing specification without creating a new feature.

## Common brief for all three prompts

### Source files

Read all four files in full from the same Git commit, and record the actual commit:

| File | Purpose |
|---|---|
| `UserRequirement.md` | Customer requests and platform scope |
| `.specify/memory/constitution.md` | Engineering policies and quality gates |
| `specs/001-shared-expense-management/spec.md` | Feature requirements, acceptance scenarios, success criteria, assumptions, and clarifications |
| `specs/001-shared-expense-management/checklists/requirements.md` | Readiness check and unresolved items |

Preserve approved clarifications. Distinguish customer requirements, constitution policies, assumptions, and design choices. Cite requirement IDs and file paths. Flag conflicts and identify the decision owner. The checklist's testability/ambiguity item remains open until verified. Address the Swing MVP release role, approver selection, supported currencies, notification channels and failures, and the FR-008 versus AC-008 notification-enablement discrepancy. Mark decisions provisional where needed; never treat a design proposal as approval.

### Comparable deliverables

Both generators must cover the following content, although their file organization may differ if cross-referenced.

1. **Architecture and scope:** Java Swing desktop MVP and credible path to web, Android, and iOS. Boundaries, modules, dependencies, local versus future deployment, shared versus client-specific responsibilities, persistence and balance tradeoffs. Use Java 21, Maven, OOP, JUnit 5, PlantUML, and `BigDecimal` for money. Separate Swing UI from business logic.
2. **Detailed design and contracts:** Entities, identifiers, cardinalities, states, constraints, data ownership, persistence, service boundaries, operation inputs/outputs, permissions, and errors. Cover registration, verification/recovery, invitations, expenses/receipts, notifications, MVP one-stage and full-product multi-stage approval, pairwise balances, settlements, and date-filtered reports. Proposed APIs must be labeled proposals.
3. **Correctness:** Participant entry order, independent payer selection, exact percentage validation, largest-fractional-remainder allocation in the currency's smallest supported unit, exactly-once final approval, pending/rejected exclusions, no payer self-debt, valid settlements and rejected overpayments. Cover authorization, retries, concurrency, partial failure, member removal, receipt access, notification failure, offline behavior, and report date boundaries.
4. **PlantUML:** Component diagram, domain class diagram, expense submission-to-approval sequence, and settlement sequence. Show validation, authorization, writes, and failures as appropriate; ensure consistency with prose.
5. **Traceability and verification:** Map every FR/NFR to source, design component or gap, MVP/full-product status, associated AC/SC and planned verification. Account for all ACs/SCs. Include JUnit 5 tests, end-to-end cases, accessibility/keyboard checks, cross-client consistency, and NFR-002 (at least 95% within two seconds with 100 concurrent active users). Distinguish planned from executed checks.
6. **Decisions and risks:** Rationale, alternatives, consequences, open questions, provisional defaults, conflicts, risks, human review gates, output file list, and checks actually run.

### Independence and safety

Treat source requirements as authoritative and generated proposals as untrusted design candidates. Never modify the four source files in these runs. Do not implement code, run tasks, commit, push, or merge as part of the generation prompts. Do not claim tests or validations passed unless executed and evidenced. Codex and ChatGPT are both OpenAI tools, so the final review must independently validate each proposal against the source rather than assuming model diversity guarantees independent correctness.
