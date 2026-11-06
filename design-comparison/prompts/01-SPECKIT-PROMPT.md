# Prompt 1 — GitHub Spec Kit with Copilot

```text
Run this repository's installed speckit-plan skill for SplitSmart shared expense management. Read the full Common brief in design-comparison/prompts/README.md and use it as the shared acceptance criteria.

Read all four source files in the brief and record their actual shared Git commit. Use the existing feature at specs/001-shared-expense-management. Follow .github/skills/speckit-plan/SKILL.md and the local plan template. Confirm the setup script resolves the existing feature directory before writing. If PowerShell or feature resolution fails, report the exact blocker. Do not initialize a new feature or rewrite the specification.

Produce the normal Phase 0/1 artifacts in the feature directory: plan.md, research.md, data-model.md, contracts/, and quickstart.md. Use plan.md for architecture and constitution gates; research.md for tradeoffs and provisional decisions; data-model.md for entities and persistence; contracts/ for interfaces; and quickstart.md for validation scenarios. Also produce architecture.md as an explicit readable architecture overview, design.md for detailed interactions, diagrams/ with PlantUML sources, and traceability.md mapping every FR, NFR, AC, and SC. Link them from plan.md.

Meet every comparable deliverable in the Common brief, including correctness edge cases and planned verification. Clearly identify unresolved product-policy decisions, their impacts, and any gates that cannot yet be cleared. Do not mark the requirements checklist complete without evidence.

Work independently. Do not read or reuse Codex outputs under design-comparison/codex/ or any other generated competing design. Limit changes to the Spec Kit architecture/design documentation and diagrams. Stop after Phase 1. Do not run tasks or implementation, edit source inputs, commit, or push.

Finish with the source commit, plan path, complete changed-file list, actual checks performed, gate status, and unresolved decisions.
```
