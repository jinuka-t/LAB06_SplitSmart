# Prompt 2 — OpenAI Codex in VS Code

```text
Act as a software architect for SplitSmart. Produce an independent architecture and detailed design using the complete Common brief in design-comparison/prompts/README.md as acceptance criteria. Read all four source files from the current worktree and record their shared Git commit. Use the same scope, constraints, deliverables, and evidence expectations as the Spec Kit run.

IMPORTANT INDEPENDENCE RULE: Work only from the four source inputs and Common brief. Do not invoke Spec Kit, read its generated plan, research, architecture, design, diagrams, or other proposal files, or reuse its templates as a design solution. Do not inspect the Spec Kit branch/worktree. Make and justify your own architecture choices.

Write all outputs under design-comparison/codex/:
- architecture.md: system architecture, boundaries, modules, technology choices, MVP versus future platforms, and links to other artifacts.
- design.md: services, workflows, permissions, state transitions, failure handling, and proposed interfaces.
- data-model.md: entities, relationships, invariants, money and persistence design.
- contracts/: proposed operation/API contracts with inputs, outputs, authorization, and error cases.
- validation.md: planned tests, worked edge-case expectations, accessibility, performance, and cross-client checks.
- decisions.md: rationale, alternatives, risks, provisional choices, and open human decisions.
- traceability.md: every FR, NFR, AC, and SC with source, status, design evidence, and verification.
- diagrams/: PlantUML component, class, expense-approval sequence, and settlement sequence diagrams.

Use Java 21, Maven, OOP, JUnit 5, PlantUML, and BigDecimal per the Common brief. Separate Swing UI from business logic. Make contracts sufficiently concrete to review permissions, state changes, and errors, but do not write implementation code.

Before finishing, self-review against the four source files and the Common brief. Check naming, states, authorization, exact monetary allocation, approval exactly-once semantics, settlement history, notification behavior, report boundaries, and consistency among prose, contracts, and diagrams. Clearly distinguish planned checks from executed ones and label unresolved choices as provisional. Do not silently resolve conflicting requirements.

Limit modifications to design-comparison/codex/. Do not edit the four inputs or any Spec Kit files. Do not implement application code, commit, push, or merge. Report source commit, artifact list, review findings, checks actually performed, and decisions still needed.
```
