# Prompt 1 — GitHub Spec Kit with Copilot

```text
Run this repository's installed speckit-plan skill for SplitSmart shared expense management. Read the Common brief in design-comparison/prompts/README.md, or use the copy provided with this prompt. Treat that brief as the shared acceptance criteria for this planning run.

Use the existing feature at specs/001-shared-expense-management. Follow .github/skills/speckit-plan/SKILL.md and the local plan template. Confirm that the plan setup script resolves the existing feature directory before writing design outputs. If PowerShell or feature resolution fails, report the exact blocker and the setup needed to proceed. Do not initialize a new feature or rewrite the specification.

Produce the normal Phase 0 and Phase 1 outputs in the feature directory: plan.md, research.md, data-model.md, contracts/, and quickstart.md. Use plan.md for architecture and constitution gates, research.md for tradeoffs and provisional decisions, data-model.md for the domain and persistence model, contracts/ for interfaces, and quickstart.md for validation scenarios. Add architecture.md or design.md only when useful for detail, diagrams/ for PlantUML, and traceability.md for the coverage matrix. Link these from plan.md. Where the skill calls for research to resolve technical uncertainty, research the options. Keep unresolved product-policy decisions in the open-decision register and explicitly flag any planning gate the available evidence cannot clear. Do not mark the checklist complete.

Generate the proposal independently in this worktree and do not inspect Claude Code's output. Limit changes to architecture and design documentation and its diagrams. Stop after Phase 1. Do not run tasks or implementation, edit any source input, or commit or push. Finish with the source commit, plan path, changed files, gate status, and unresolved decisions.
```
