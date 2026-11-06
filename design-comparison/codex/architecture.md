# SplitSmart independent architecture proposal

Status: proposed design, requiring human review. Prepared 2026-11-05. No application is implemented by these artifacts.

## Baseline and independence

Shared source snapshot: Git commit `e62e6dbe9a1b58b6d5dc7cf327e8d9fcc49e57a4` in the current worktree. All four source files were read in full and `git diff HEAD -- <file>` produced no differences, including staged changes. Each file's most recent change is `cda03e5be1453a1ddb3937f9400b76b5cda34ba6`; this is provenance, not a replacement for the shared snapshot commit. The other generator's actual source commit was not inspected and must be compared by the human reviewer.

Only these design inputs were used:

| Source | Authority and SHA-256 of worktree bytes |
|---|---|
| [UserRequirement.md](../../UserRequirement.md) | Customer requests. `D36F785F17EDEC1A657DECCC549676EF450A02D35C591D32937AF1075E997B02` |
| [constitution.md](../../.specify/memory/constitution.md) | Engineering policy v1.0.0. `E122727928159542C25621C55172B515A71EC83F1D72CBE5A70B03A211F8E68E` |
| [spec.md](../../specs/001-shared-expense-management/spec.md) | Draft feature requirements, approved clarifications, assumptions and open questions. `FC5BABE60D970F5EABA8F192C1F5EFB7002A9FBEC883E0DE6697F3FE2AAD37F1` |
| [requirements.md](../../specs/001-shared-expense-management/checklists/requirements.md) | Readiness evidence; ambiguity/testability remains unchecked. `59B7BB3347F69CB9212AC97474BB82BD56986227A610F433E8A8FBB41F01BC86` |

Acceptance brief: [Common brief](../prompts/README.md#common-brief-for-all-three-prompts). No Spec Kit invocation, generated proposal content, templates, alternate branch or worktree was used. Git status exposed staged proposal filenames only. No external research informed the technology proposals.

## Scope and deployment

Customer scope includes accounts, groups, expenses, receipts, notifications, approval, pairwise balances, payments and reports, primarily on web with Android and iOS. Swing is an engineering-policy desktop MVP and does not satisfy FR-017/018/019. Product owner must approve its release role (D01). Password recovery FR-021 is included despite its omission from the MVP table's account range.

Propose a Java 21 modular monolith, built with Maven, with a thin Swing client calling an authoritative application service over HTTPS. A developer/demo installation may run client, service, SQL database and private receipt directory on one machine; a shared MVP runs the same service on a server. No independent writable desktop databases or offline synchronization. Multiple real users require shared service persistence and working email delivery; a local fake mail adapter is a test fixture only and cannot demonstrate verified production identity.

This adds modest deployment work but avoids distributing credentials, trusting a client identity, or migrating independently divergent desktop ledgers. An embedded local-only application is a simpler rejected alternative for a UI prototype; it cannot substantiate concurrent-user, email-delivery or cross-client acceptance. No service framework is mandated by the sources: Spring Boot, PostgreSQL and JDBC repositories are provisional choices (D06), requiring dependency/security review and Maven version pinning at implementation. No library versions or current compatibility claims are made here.

## Modules and responsibility boundaries

| Maven module proposed | Responsibility | Dependencies |
|---|---|---|
| domain | OOP entities, Money, SplitAllocator, ApprovalPolicy, pairwise rules | Java 21 only; no Swing, HTTP or SQL |
| application | Use-case services, authorization, transaction orchestration, ports, report queries | domain |
| infrastructure | JDBC repositories/migrations, email, outbox worker, private receipt storage, password/token adapters | application ports |
| server | HTTP request mapping, session authentication, composition/configuration | application + infrastructure |
| swing-client | Views, presenters, accessible controls, request adapter, background I/O | transport DTOs/contracts only |
| contract-fixtures | Canonical allocation and workflow fixtures for all clients | test data, no production business rules |

Domain services: SplitAllocator; entities enforce local invariants. Application services: IdentityService, GroupService, ExpenseService, ApprovalService, BalanceService, SettlementService, NotificationService, ReportService, ReceiptService. Repositories are ports with explicit transaction scopes, not calls from UI handlers. Authorization uses trusted session principal and current membership on every request. Receipts and account secrets have separate access paths from group financial queries.

Swing presenters perform remote I/O off the event dispatch thread and update controls on it. UI validation is advisory; the service repeats all authoritative checks. A saved/completed message requires a committed service response or a successful retry/query resolving an uncertain outcome. Money displayed by Swing comes from server allocations; clients never independently determine ledger postings.

## Financial and persistence choices

Immutable ledger entries are the financial source of truth. A transactionally maintained per-group pair projection supports quick balance reads and serialized overpayment checks. Avoid asynchronous projection lag at financial completion. Rebuild/reconcile projection against the ledger to detect corruption. This costs writes and pair lock contention but permits direct evidence for exactly-once approval and settlement invariants. Approval and payment transactions lock the group financial row first, then affected rows in canonical order; this simple MVP serialization is measurable and can later narrow to pair locks if performance demands it.

SQL stores accounts, memberships, invitations, expenses and shares, policy snapshots, decisions, financial events, pair projections, payment history, notifications, outbox entries, and idempotency results. Receipt bytes live in a private blob store with opaque identifiers; SQL holds ownership and lifecycle metadata. No client or report gets a filesystem path or unrestricted blob URL. Database backups and receipt backups must be coordinated and restoration reconciled before accepting writes.

## Future product path

Web, Android and iOS are full-product deliverables, not implemented or accepted here. Provisional clients: TypeScript web, Kotlin Android and Swift iOS, each consuming the same versioned HTTPS contracts. This interprets Java 21 as the production Java service baseline; if the constitution is interpreted to require Java for all client code, maintainers must approve an interpretation/amendment before these choices (D08). Browser accessibility and native accessibility require separate verification. Java business rules, persistence, approval, report and ledger logic stay on the service. Multi-stage policies use the same snapshot model; MVP exposes only one stage. Production adds managed SQL/blob storage, email delivery monitoring, TLS/session hardening, capacity measurements, migration/restore practices and operational ownership. No payment processor, bank transfer, FX, cross-group debt netting, offline financial writes or automatic debt simplification is proposed.

## Artifact map

- [Detailed design](design.md), [data model](data-model.md), [decisions](decisions.md).
- Proposed contracts: [common envelope and identity/groups](contracts/identity-groups.md), [expenses, approval and receipts](contracts/expenses.md), [balances, settlements, notifications and reports](contracts/finance-reports.md).
- [Validation and review record](validation.md), [complete requirement traceability](traceability.md).
- PlantUML: [component](diagrams/component.puml), [domain class](diagrams/class.puml), [expense approval](diagrams/expense-approval.puml), [settlement](diagrams/settlement.puml).
