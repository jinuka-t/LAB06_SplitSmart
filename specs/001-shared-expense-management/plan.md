# Implementation Plan: SplitSmart Shared Expense Management

**Branch**: `main` (setup resolved feature directory `001-shared-expense-management`)
**Date**: 2026-11-05
**Source commit**: `b2a94af0105094dc14fce245ebf8e733c959a689`
**Requirements baseline**: `ba90a30667a1bc5683cf4cefc6836a2cf4a50019` (the four common-brief source files match this baseline)
**Spec**: [spec.md](./spec.md)

**Input**: Customer requirements in `UserRequirement.md`; feature requirements, clarifications, assumptions, and acceptance criteria in `spec.md`; engineering policies in `.specify/memory/constitution.md`.

## Summary

Propose a Java 21/Maven modular monolith with a Swing desktop client for the first delivery, a shared REST service, PostgreSQL persistence, and clear ports for identity, receipt storage, and notification delivery. Keep presentation thin and put validation, exact `BigDecimal` split calculation, approval, ledger, settlement, and reporting rules in independently testable business modules. The service boundary is intended to be reused by future web, Android, and iOS clients.

The Swing MVP is a proposed first-stage desktop client, not a replacement for the web and mobile product required by FR-017–FR-019. Product management must confirm whether it is a prototype or production first release before release scope is accepted. The architecture can accommodate either choice, but neither a Swing application nor this plan clears the full-platform product gate.

## Technical Context

**Language/Version**: Java 21 for backend and Swing client
**Primary Dependencies**: Maven; OpenAPI 3.1 for the proposed HTTP contract; PostgreSQL; an OIDC-compatible identity provider (provider not selected); JUnit 5; PlantUML. Backend framework selection is deferred and must preserve the proposed Java 21 modular boundaries.
**Storage**: PostgreSQL for shared authoritative records; private receipt-storage adapter (local filesystem in development, private object storage in deployment); no client-side financial source of truth
**Testing**: JUnit 5 unit, repository/integration, API contract, authorization, concurrency, and performance tests; client-level end-to-end and accessibility checks are planned
**Target Platform**: Swing desktop first; web, Android, and iOS remain required full-product clients and are deferred from the Swing MVP
**Project Type**: Multi-module desktop client and HTTP service
**Performance Goals**: NFR-002 / SC-006: at least 95% of account, group, expense, balance, payment, and report interactions complete within two seconds with 100 concurrent active users
**Constraints**: `BigDecimal` for all money; explicit supported-currency scale; exact percentage sum; deterministic largest-remainder rounding with participant-entry-order ties; approval-gated balance inclusion; authorization on every group/account operation; preserve history after membership changes
**Scale/Scope**: Initial model is one currency per group (spec assumption; currency set unresolved); one-stage approval in the Swing MVP, configurable multi-stage approval for the full product; no source code or build manifest exists at this source commit

## Constitution Check

| Gate | Design evidence | Status |
|---|---|---|
| I. Customer requests distinct from implementation decisions | Customer FRs and ACs are preserved; Swing-first, modular monolith, REST, and storage choices are labeled proposals. The desktop MVP is not claimed to satisfy FR-017–FR-019. | Pass with release-scope decision open |
| II. Java 21 and Maven | Both backend and desktop target Java 21 and a Maven multi-module build. | Pass (proposed) |
| III. OOP and presentation/business separation | Swing views and event handlers call application services; domain modules do not import Swing. | Pass (proposed) |
| IV. `BigDecimal` money and explicit scale | Domain/contract amounts are decimal strings/`BigDecimal`; a currency registry supplies permitted scale; split rounding is specified. The supported currency list remains open. | Pass in design; currency gate open |
| V. JUnit 5 and human review | Verification scenarios are mapped in [quickstart.md](./quickstart.md) and [traceability.md](./traceability.md). Generated design and diagrams require human review; no implementation tests can run yet. | Pass in plan; execution pending |
| PlantUML | Component, domain, expense/approval, and settlement PlantUML sources are included under `diagrams/`. | Pass in design |
| Traceability and review gates | Every FR/NFR, AC, and SC is mapped to proposed design and planned verification. | Pass in design; requirements checklist remains open |

**Pre-design gate**: No constitution prohibition is identified. Planning may continue because each uncertainty is bounded and explicitly recorded rather than silently decided.

**Post-design gate**: The proposed boundaries can support the customer-required clients and policies, but the release role, approver-selection policy, supported currencies, and notification delivery/enablement semantics remain unresolved. The Swing-only scope does not meet the full product platform requirement. These are product-owner gates, not implementation assumptions to treat as approved. Do not mark the specification checklist complete.

## Scope and Architecture

- **MVP proposal**: Java Swing desktop client, shared Java service, durable database, account/group/expense/approval/balance/payment/report flows, single approval stage, and an in-product notification inbox. The deployment/release role of this stage is unresolved.
- **Full product**: Web, Android, and iOS clients call the same versioned service and identity boundary. Client-specific UI, navigation, secure credential storage, and accessibility implementations are separate; permissions, validation, approval state, money calculations, receipts, and financial records are shared server-side.
- **Deferred**: Multi-currency group balances, offline financial writes, client-side balance authority, settlement netting across currencies, and a particular external notification channel/provider. These require explicit product decisions.
- **Financial state**: Approved expense shares and accepted settlements are immutable source events. An atomic ledger posting and derived pairwise-balance projection provide once-only inclusion; pending and rejected expenses never post.

See [architecture.md](./architecture.md), [research.md](./research.md), [data-model.md](./data-model.md), [identity boundary](./contracts/identity.md), [HTTP API contract](./contracts/openapi.yaml), [quickstart.md](./quickstart.md), [traceability.md](./traceability.md), and [diagrams/](./diagrams/).

## Project Structure

There is no application source tree or Maven project at the source commit. The following is the proposed target layout, not a description of existing code:

```text
pom.xml
backend/
  pom.xml
  src/main/java/.../{api,identity,groups,expenses,approvals,ledger,payments,reports,notifications,receipts}/
  src/test/java/.../
desktop/
  pom.xml
  src/main/java/.../{ui,application,api}/
  src/test/java/.../
contracts/openapi.yaml
web/                 # future client
android/             # future client
ios/                 # future client
```

**Structure Decision**: Separate the Swing presentation from the Java service and domain. Keep server modules in one deployable modular monolith initially to make transaction boundaries and operational ownership explicit without introducing distributed financial writes. Later clients reuse the service contract rather than duplicating business rules.

## Open-Decision Register

| ID | Open decision / evidence | Provisional design boundary | Decision owner / impact |
|---|---|---|---|
| OD-1 | Is Swing a prototype, first-stage production release, or expected final product? The latter conflicts with FR-017–FR-019. | Treat it as a first-stage desktop client; keep web/Android/iOS explicitly on the full-product roadmap. | Product owner; blocks release-scope approval and the full-platform gate. |
| OD-2 | Who can approve, and how are approvers selected? Spec assumption: group-configured approvers; submitter cannot self-approve by default. | Versioned group approval policy with explicit approver identities and one stage for MVP; model permits multiple ordered stages. | Product owner; affects group settings, eligibility, and rejection policy. |
| OD-3 | Which currencies and precision are supported? Spec assumes one currency per group. | Currency code plus explicit minor-unit scale; reject unsupported currency; no implicit two-decimal assumption. | Product owner/finance; affects amount validation, persistence constraints, and tests. |
| OD-4 | Which notification channels, preferences, and failure guarantees apply? FR-008 says notify other members on submission; AC-008 conditions notification on notifications being enabled. | Durable notification outbox/inbox and channel adapters; do not resolve whether disablement suppresses required notification. | Product owner; blocks final user-preference and delivery behavior. |

The discrepancy between FR-008 and AC-008 is not a resolved clarification. The proposed in-product inbox is an architectural option, not approval of a notification policy.

## Complexity Tracking

No constitution deviation is proposed. A modular service and shared API are justified by the required cross-client identity, authorization, consistency (NFR-005), and atomic money/approval processing. A distributed microservice design is intentionally rejected at this stage because it would make single-transaction approval/ledger guarantees harder without evidence of a need.
