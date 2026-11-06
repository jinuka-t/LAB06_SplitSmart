# SplitSmart architecture and design prompts

Use these prompts to produce two independent architecture proposals and have ChatGPT review them. The repository baseline reviewed when drafting this guide is `ba90a30667a1bc5683cf4cefc6836a2cf4a50019`. If you change any source requirements, use the same updated commit for both runs and give that commit to ChatGPT.

## Prompt files

- [Spec Kit + Copilot](01-SPECKIT-PROMPT.md)
- [Claude Code](02-CLAUDE-CODE-PROMPT.md)
- [ChatGPT review](03-CHATGPT-REVIEW-PROMPT.md)

## How to run the comparison

1. Review and edit this file. Start the two generation runs from separate local branches or worktrees at the same requirements commit, with clean working trees and fresh chats. Keep the generated outputs separate and give neither generator the other proposal. Make this guide available to both sessions, or paste the common brief with each prompt.
2. For Spec Kit, open its worktree in VS Code. This repository is configured for GitHub Copilot skills and PowerShell. Launch VS Code from a fresh PowerShell session with the environment below so the Copilot agent and the plan setup script inherit it. Select the installed `speckit-plan` skill in Copilot Chat and submit Prompt 1 as its instructions. The local workflow is defined in `.github/skills/speckit-plan/SKILL.md`.
3. For Claude Code, open the other worktree and start a fresh Claude Code session there. Paste Prompt 2 as a normal prompt.
4. For ChatGPT, supply both complete artifact sets labeled A (Spec Kit) and B (Claude Code), plus their shared source commit or copies of the four input files. If you use GitHub links, provide exact branch or commit links that ChatGPT can open. If the designs are still local and uncommitted, attach the artifacts instead. Paste Prompt 3. Review the resulting report before deciding what to adopt.

From the root of the Spec Kit worktree, with PowerShell and the VS Code CLI available:

```powershell
$env:SPECIFY_FEATURE_DIRECTORY = 'specs/001-shared-expense-management'
$env:SPECIFY_FEATURE_NO_PERSIST = '1'
code -n .
```

If VS Code is already running, close it first so a new process inherits these settings. The explicit feature path selects the existing spec without relying on the branch name or creating persistent feature metadata.

## Common brief for all three prompts

### Source files

Read these files in full from the same Git commit and record that commit in your output.

| File | Use |
|---|---|
| `UserRequirement.md` | Customer requests and platform scope |
| `.specify/memory/constitution.md` | Engineering policies and quality gates |
| `specs/001-shared-expense-management/spec.md` | Feature requirements, acceptance scenarios, success criteria, assumptions, and recorded clarifications |
| `specs/001-shared-expense-management/checklists/requirements.md` | Readiness check and unresolved items |

Preserve the approved clarifications. Keep customer requirements, constitution policies, specification assumptions, and proposed design choices distinct. Cite existing IDs and paths. Flag conflicts with evidence and record who needs to decide. The checklist's testability and ambiguity item is still open. Address the Swing MVP release role, approver selection, supported currencies, and notification channels and failures. Where a decision is needed for a design, label it provisional and explain its impact. If a decision blocks sound design, identify the affected artifacts and what can still be completed. Do not treat a proposal as a clarification or an approval. Also flag any other concrete discrepancy, such as FR-008 and AC-008 treating notification enablement differently.

### Comparable design deliverables

Both generators must address the same content. They may organize their files differently if they provide a cross-reference.

1. **Architecture and scope.** Describe the proposed Java Swing desktop MVP and a credible path to the full web, Android, and iOS product. Identify what is shared, what is client-specific, and what is deferred. Show system boundaries, dependencies, packaging or modules, and local versus future deployment. Explain tradeoffs for consequential decisions, including persistence and balance representation. Use Java 21, Maven, object-oriented design, JUnit 5, PlantUML, and `BigDecimal` for monetary values and calculations. Keep Swing presentation and event handlers separate from business rules. Distinguish all proposed product and technology decisions from requirements.
2. **Detailed design and contracts.** Define the domain entities, identifiers, relationships, cardinalities, states, constraints, data ownership, and persistence boundaries. Explain the responsibilities and interactions of presentation, business services, and persistence, and document relevant operation inputs, outputs, permission checks, and errors. Include account registration, verification and recovery, invitation acceptance, expense and receipt submission, notification, one-stage MVP and multi-stage product approval, pairwise balances, recorded settlements, and date-filtered reports. Describe how full-product clients would share authorization, data, and completed state. Clearly label any proposed API as a design proposal.
3. **Correctness and edge cases.** Explain how the design preserves participant entry order and handles an independently selected payer, exact percentage validation, and largest fractional remainder at the currency's smallest supported unit. Explain how final approval affects balances exactly once, why pending and rejected expenses stay out of settled totals, how payer self-debt is excluded, and how valid settlements and rejected overpayments affect history and balances. Address authorization, duplicate requests, concurrent approvals or payments, partial failure, group-member removal, receipt access, notification failure, offline client behavior, and report date boundaries. Identify which choices are provisional and which follow the spec.
4. **PlantUML source.** Provide a component diagram, a domain class diagram, and sequence diagrams for expense submission through approval and for recording a settlement. Show where validation, authorization, writes, and failures occur where relevant. Keep names and responsibilities consistent across diagrams and prose.
5. **Traceability and validation.** Map every FR and NFR to its source, a design component or explicit gap, its MVP/full-product status, and applicable AC/SC IDs and planned verification. Account for every AC and SC, including any without a direct mapping. Identify proposed JUnit 5 tests, end-to-end scenarios, keyboard/accessibility checks, cross-client consistency, and the NFR-002 target of at least 95% within two seconds with 100 concurrent active users. Include concrete expected outcomes. Mark future verification as planned and distinguish commands that can run today from commands proposed for after implementation.
6. **Decisions and risks.** Record the decision, rationale, alternatives, and consequences for major choices. List open questions, proposed defaults, unresolved conflicts, implementation risks, and human review gates. Report the output files and any checks actually performed.
