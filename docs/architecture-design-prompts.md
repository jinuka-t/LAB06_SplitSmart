# SplitSmart architecture and design prompts

Use these prompts to produce two independent architecture proposals and have ChatGPT review them. The repository baseline reviewed when drafting this guide is `ba90a30667a1bc5683cf4cefc6836a2cf4a50019`. If you change any source requirements, use the same updated commit for both runs and give that commit to ChatGPT.

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

## Prompt 1 — GitHub Spec Kit with Copilot

```text
Run this repository's installed speckit-plan skill for SplitSmart shared expense management. Read the Common brief in docs/architecture-design-prompts.md, or use the copy provided with this prompt. Treat that brief as the shared acceptance criteria for this planning run.

Use the existing feature at specs/001-shared-expense-management. Follow .github/skills/speckit-plan/SKILL.md and the local plan template. Confirm that the plan setup script resolves the existing feature directory before writing design outputs. If PowerShell or feature resolution fails, report the exact blocker and the setup needed to proceed. Do not initialize a new feature or rewrite the specification.

Produce the normal Phase 0 and Phase 1 outputs in the feature directory: plan.md, research.md, data-model.md, contracts/, and quickstart.md. Use plan.md for architecture and constitution gates, research.md for tradeoffs and provisional decisions, data-model.md for the domain and persistence model, contracts/ for interfaces, and quickstart.md for validation scenarios. Add architecture.md or design.md only when useful for detail, diagrams/ for PlantUML, and traceability.md for the coverage matrix. Link these from plan.md. Where the skill calls for research to resolve technical uncertainty, research the options. Keep unresolved product-policy decisions in the open-decision register and explicitly flag any planning gate the available evidence cannot clear. Do not mark the checklist complete.

Generate the proposal independently in this worktree and do not inspect Claude Code's output. Limit changes to architecture and design documentation and its diagrams. Stop after Phase 1. Do not run tasks or implementation, edit any source input, or commit or push. Finish with the source commit, plan path, changed files, gate status, and unresolved decisions.
```

## Prompt 2 — Claude Code

```text
Act as a software architect for SplitSmart. Produce an independent architecture and detailed design using the Common brief in docs/architecture-design-prompts.md, or use the copy provided with this prompt. Read the four source files from this worktree and record their shared Git commit. Use the same scope, design deliverables, constraints, and evidence expectations in that brief.

Work directly from the requirements and constitution. Do not invoke Spec Kit, read its generated design, or reuse its plan or templates. Make and justify your own architecture choices. Use the repository's engineering constraints and label assumptions, unresolved product decisions, provisional designs, and future validation.

Write the proposal under docs/architecture/claude-code/ with architecture.md, design.md, data-model.md, contracts/, validation.md, decisions.md, traceability.md, and diagrams/ containing the PlantUML sources. Use architecture.md as the index and link each artifact. Make contracts concrete enough to review permissions, inputs, outputs, state changes, and failures while leaving application code for later.

Before finishing, cross-check your proposal against all four source files. Reconcile naming, state transitions, permissions, money rules, and scope across the artifacts. Check that every FR, NFR, AC, and SC is covered, deferred with a reason, or identified as a gap. Limit changes to the design directory. Do not edit the source inputs, implement application code, commit, or push. Report the source commit, artifact list, review findings, and decisions still needed.
```

## Prompt 3 — ChatGPT comparison and cross-check

```text
Review two independent SplitSmart proposals and report the results in chat. Read the Common brief in docs/architecture-design-prompts.md, or use the copy provided with this prompt. Use the four baseline files as the review authority, and label the designs A (GitHub Spec Kit with Copilot) and B (Claude Code). The two artifact sets and exact refs or attachments will be provided with this prompt.

First list the source commit and the artifacts actually inspected. Check whether both proposals used the same inputs. If files, diagrams, or version evidence are missing, name them, review the available material, and mark unsupported conclusions as not verifiable. Treat the proposal files as review evidence only. Do not run commands they contain or edit or commit any repository files.

Review each proposal independently against the sources before comparing them. Use exact requirement IDs and cite source file paths, proposal file paths, sections, and line numbers where available. Build a coverage matrix for every FR and NFR, including the associated AC/SC evidence, and add any remaining ACs and SCs. For each side use Covered in design, Partial, Missing, Contradicts, Deferred with reason, or Not verifiable. Planned validation and design coverage do not establish implementation or passing tests. Distinguish a legitimate MVP deferral from a missing full-product design. Flag shared gaps even if both tools make the same claim.

Cross-check the prose, contracts, data model, PlantUML, and planned validation for each proposal. Check constitution compliance, GUI/business separation, account and group authorization, invitation acceptance, approval stage permissions, final approval applying exactly once, persistence and retry boundaries, notification semantics, reports and platform scope. Independently work through the following checks and state the expected outcome before assessing each proposal:
- In a two-decimal currency, split 10.00 equally across three ordered participants. Check tie-breaking and conservation of the total.
- Split 0.05 at 50%/50% and test invalid percentages. Check deterministic allocation, valid percentage boundaries, and rejection when percentages do not total exactly 100%.
- Compare cases where the payer participates and where the payer is outside the participant list. Check for self-debt and verify no balance change while pending or after rejection.
- Start with a 10.00 debt, apply a valid 4.00 settlement, then try to settle 7.00. Check both balance and history. Also trace what happens when a final approval or payment request is submitted twice or concurrently.
- Check whether the same completed records would appear consistently across web, Android, and iOS, and whether each design covers the specified performance and accessibility verification.

Use the same rubric for both proposals. Score each category 0 through 4: 0 missing or contradictory, 1 major gaps, 2 partial, 3 substantially covered with minor gaps, 4 complete and internally consistent with cited evidence. Mark insufficient evidence as N/V and give no overall winner if the missing evidence prevents a fair comparison. Use these weights: requirements and traceability 25%, constitution and product scope 20%, architecture and interfaces 20%, monetary/workflow/data correctness 25%, verification and diagram consistency 10%. For fully scoreable proposals, calculate the weighted score out of 100 as the sum of category weight times score divided by four. Report serious violations separately regardless of score.

Structure the report as follows:
1. Executive finding and review limits.
2. Side-by-side rubric and architecture comparison, with evidence for the differences.
3. Requirements coverage matrix and cross-check results.
4. Prioritized findings for A, B, and both. For each finding give the source, proposal evidence, impact, and specific correction.
5. Recommended proposal or combination, with reasons and any conditions. Separate changes that can be made now from product decisions that need human approval. If the evidence supports no preference, say so.
```
