# Prompt 2 — Claude Code

```text
Act as a software architect for SplitSmart. Produce an independent architecture and detailed design using the Common brief in design-comparison/prompts/README.md, or use the copy provided with this prompt. Read the four source files from this worktree and record their shared Git commit. Use the same scope, design deliverables, constraints, and evidence expectations in that brief.

Work directly from the requirements and constitution. Do not invoke Spec Kit, read its generated design, or reuse its plan or templates. Make and justify your own architecture choices. Use the repository's engineering constraints and label assumptions, unresolved product decisions, provisional designs, and future validation.

Write the proposal under design-comparison/claude/ with architecture.md, design.md, data-model.md, contracts/, validation.md, decisions.md, traceability.md, and diagrams/ containing the PlantUML sources. Use architecture.md as the index and link each artifact. Make contracts concrete enough to review permissions, inputs, outputs, state changes, and failures while leaving application code for later.

Before finishing, cross-check your proposal against all four source files. Reconcile naming, state transitions, permissions, money rules, and scope across the artifacts. Check that every FR, NFR, AC, and SC is covered, deferred with a reason, or identified as a gap. Limit changes to the design directory. Do not edit the source inputs, implement application code, commit, or push. Report the source commit, artifact list, review findings, and decisions still needed.
```
