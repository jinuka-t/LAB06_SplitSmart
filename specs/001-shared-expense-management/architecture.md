# SplitSmart Architecture Proposal

**Status**: Design proposal for human review; not an approved product decision
**Source commit**: `b2a94af0105094dc14fce245ebf8e733c959a689`

## Context and scope

`UserRequirement.md` requests account and group management, expenses and receipts, notifications, approval, member-to-member balances, payments, reports, and a web product plus Android and iOS apps. The specification separately proposes a Java Swing MVP and explicitly says it does not satisfy those platform requirements. This design keeps the distinction:

- **MVP proposal**: Swing desktop as an initial client of the shared service; one approval stage and in-product notification inbox. Whether this is a prototype or production first stage remains open.
- **Full product**: Web, Android, and iOS clients reuse the same server-side identity, group authorization, expense, approval, ledger, settlement, receipt, and report behavior.
- **Deferred**: Offline financial writes, multi-currency group balances, external payment movement, specific notification providers/channels, and production hosting vendor.

The customer did not request specific frameworks, databases, API styles, identity providers, or deployment vendors. All such choices below are proposals. Java 21, Maven, Swing for the proposed desktop client, JUnit 5, PlantUML, OOP, and `BigDecimal` are constitution policies, not customer requirements.

## System boundary

```text
Swing desktop (MVP) ──┐
Web client (future) ──┼── HTTPS JSON API ── SplitSmart modular service ── PostgreSQL
Android client (future)┤                            ├── identity provider (OIDC)
iOS client (future) ───┘                            ├── private receipt store
                                                    └── notification providers
```

The server is the sole authority for user identity, accepted membership, permissions, approval state, calculated shares, financial postings, balances, and report data. Clients render state and collect input; they never connect to the database or decide that an unapproved expense is financially effective.

### Proposed components

| Component | Responsibility |
|---|---|
| Swing UI | Views, navigation, input capture, validation feedback, accessible labels, and user-visible pending/offline/error states. Network work runs off the Swing event-dispatch thread; UI changes return to it. |
| Client adapter | Calls the versioned API, supplies the authenticated identity context, preserves idempotency keys on retries, parses API errors, and refreshes authoritative state. |
| Identity provider boundary | Email/password registration, verification, sign-in, and recovery; OIDC-compatible tokens for clients. Provider is not selected. Native clients use an external browser with authorization code + PKCE; no embedded client secret. |
| API/authentication | Validates tokens, maps authenticated subject to account, validates inputs, applies resource/group authorization, and translates domain outcomes to stable HTTP responses. |
| Group and invitation module | Group ownership/manager permissions, accepted membership, invitation lifecycle, and policy configuration. |
| Expense/split module | Expense draft and submission, participant-order persistence, payer validation, `BigDecimal` split calculation, receipt association, and immutable submitted data. |
| Approval module | Versioned policy snapshot, stage/approver eligibility, idempotent approve/reject transitions, and final-approval trigger. |
| Ledger/balance module | Immutable expense/payment postings and transactionally maintained pairwise balance projection. Excludes payer self-debt and non-final expenses. |
| Settlement module | Sender/recipient, amount/date validation, locked current balance check, idempotency, ledger posting, and payment history. It records a reported settlement; it does not move funds. |
| Report module | Authorized report queries using inclusive date ranges and supported filters; pending/rejected expenses are not included in settled totals. |
| Notification module | In-app inbox plus outbox worker and channel adapters. Delivery failure is isolated from successful expense submission and visible/retryable operationally. Policy is unresolved. |
| Receipt adapter | Private binary storage; validates type/size, associates a receipt with one group/expense, and returns bytes only after fresh authorization. |
| Persistence | PostgreSQL relational records, constraints, transactions, exact `NUMERIC` monetary columns, ledger and projections, and an outbox table. |

Keep the initial service a modular monolith so approval completion, ledger postings, balance projection, and outbox insertion can share one database transaction. Introduce separate services only if measured operational needs justify the loss of local transaction boundaries.

## MVP and evolution

| Concern | Swing MVP proposal | Full-product evolution |
|---|---|---|
| Client | Java 21 Swing; thin API client; no business calculations in event handlers. | Separate web, Android, and iOS UIs against the same API. Their UI/authentication adapters are client-specific. |
| Identity | Shared OIDC-compatible identity boundary; provider choice open. | Same account and provider; each client uses a suitable secure flow. |
| Data | Shared API and PostgreSQL are authoritative. Local development may run them on one workstation; the Swing install has no DB credentials. | Centrally deployed service/database and private receipt storage, with selected hosting/security controls to be approved. |
| Approval | One configured stage; group approver and self-approval policy remain subject to OD-2. | Ordered stages and policy versions; policy and eligibility behavior are still product decisions. |
| Notification | Proposed in-product inbox. No external channel selected. | Provider adapters for selected email/push channels; cross-client inbox remains shared. |
| Offline | Read-only stale view may be indicated; no financial mutation is reported complete offline. Retry uses same idempotency key. | Offline drafts/queued writes only after explicit reconciliation and conflict policy. |
| Currency | One currency per group (spec assumption); registry and scale explicit, supported set unresolved. | Multi-currency conversion/netting is not implied by multi-client support. |

The MVP does not meet AC-014–AC-016 or FR-017–FR-019. If the product owner selects a non-production prototype, account verification, notification delivery, and deployment expectations must be narrowed explicitly before implementation; this proposal does not silently waive FRs.

## Layering and core interactions

1. A view invokes a client/application use case with typed input and authenticated context.
2. The API authenticates the principal, validates syntax, loads current group membership/policy, and authorizes the operation.
3. Domain services validate invariants and calculate values using `BigDecimal` plus an explicit currency scale. They do not depend on Swing or HTTP.
4. Repository/storage ports persist the change in one transaction. External notifications happen after commit from an outbox; receipt bytes remain private.
5. The API returns authoritative status and version. The UI displays completion only after a confirmed response; a timeout is an unknown outcome, not a local success.

The API responsibilities and error shapes are specified in the proposed [OpenAPI contract](./contracts/openapi.yaml); entities and transitions are in [data-model.md](./data-model.md).

## Financial correctness and concurrency

### Split calculation

- Preserve the participant sequence exactly as entered and persist its ordinal. Never sort participants before rounding.
- Validate a positive amount and supported currency scale. In an equal split, divide by participant count; in a percentage split, validate each value in [0,100] and exact total 100%.
- Calculate exact quotas in `BigDecimal`. Truncate each quota down to the currency's smallest unit, rank discarded fractional remainders descending, then allocate one remaining unit in that order. Ties use participant ordinal. Persist the exact resulting shares and input snapshot.
- Assert that shares sum exactly to the expense total. Reject invalid input before creating a pending expense.
- Payer selection is separate from the participant list and need only be a current group member. For each participant except the payer, create a receivable from participant to payer for that participant's share. The payer's own share produces no self-debt.

### Approval and balance inclusion

Pending and rejected expenses have no effective ledger postings. An authorized approval records a stage decision with actor, timestamp, and policy version. Final approval atomically transitions the expense, inserts uniquely keyed expense postings, updates the balance projection, and emits an outbox event. A unique source key (`expenseId`, posting type, member pair) plus a conditional state transition prevents duplicate posting on retry or concurrent final approvals. Rejected expenses remain visible but have no balance impact; corrected data is resubmitted as a new submission/version rather than silently mutating the approved snapshot.

### Settlements

Only a current group member may record a payment as its sender; recipient must be another current or historically identifiable member of the group. In a transaction, lock or conditionally update the relevant pairwise balance, confirm a positive amount does not exceed the current amount owed in that direction, and atomically persist payment, ledger posting, balance projection, and outbox notification. A competing payment sees the reduced balance and is rejected if it would overpay. A rejected or failed payment creates neither a payment-history entry nor a balance change. A successful record describes an asserted settlement, not a verified bank transfer.

### Membership, receipts, and privacy

Removing a member revokes future access and eligibility but does not delete historical records or ledger identities. Historical reports and balances retain stable account IDs; access to group history follows current policy and is an open policy boundary for a removed member. Every receipt read checks current authorization against group/expense, rather than trusting a client-supplied receipt ID. Storage uses private objects and short-lived authorized reads; no public permanent URL is returned.

### Retries, partial failure, and offline behavior

- Create, approve, and payment mutations require idempotency keys. A repeated key with identical request returns the original result; reuse with a different payload is a conflict.
- Concurrent approvals use an expected expense version and atomic state transition. A stale/duplicate approval returns a conflict or current state, never a second posting.
- External identity, receipt, and notification failures are surfaced. Receipt upload failure prevents a receipt-linked submission; an uploaded receipt not attached before its expiry is cleaned up. A failed notification does not roll back an already committed expense and remains in the outbox for retry.
- Network timeout after a write is indeterminate. The UI keeps it unconfirmed and retries/query-resolves with the same idempotency key; it does not invent local success.
- Outbox delivery is at-least-once; notification consumers deduplicate by notification ID. Provider channels, retries, and user-visible delivery states remain open decisions.

## Reports and dates

Reports are authorized for the current group/member context. Date filters use inclusive `LocalDate` start and end values. Expense summaries use expense date; payment summaries use payment date; balance-as-of reporting needs a defined as-of semantics and is not inferred from a transaction date filter. Reversed ranges are rejected; empty valid ranges return zero records/totals. The product owner must define timezone only if timestamps are introduced as user-selectable report filters.

## Key tradeoffs

| Choice | Benefit | Cost / alternative |
|---|---|---|
| Shared REST API | One authorization and financial rule set across all clients. | Requires network service even for desktop sharing; direct local-only prototype is smaller but cannot validate shared authority. |
| Relational DB + modular monolith | Referential integrity and atomic final approval/settlement. | Central service must be deployed and backed up; no multi-region write architecture is proposed. |
| Immutable ledger plus balance projection | Auditable changes and fast pairwise reads. | Projection consistency must be transactionally tested; pure recomputation is simpler only at very small scale. |
| Server-authoritative online writes | Avoids conflicting local approvals and balances. | No offline financial completion; local queueing would need a later conflict policy. |
| OIDC provider boundary | Shared identity flow without provider lock-in in domain modules. | Provider and native/web client configuration remain implementation decisions. |

## Diagrams

- [Component diagram](./diagrams/component.puml)
- [Domain class diagram](./diagrams/domain.puml)
- [Expense submission and approval sequence](./diagrams/expense-approval.puml)
- [Settlement sequence](./diagrams/settlement.puml)

## Human review gates and risks

1. Product owner confirms Swing MVP role and recognizes that the full web/Android/iOS requirement remains outstanding.
2. Product owner resolves approver selection, self-approval, and policy version semantics (OD-2).
3. Product owner/finance chooses supported currency set and confirms one currency per group (OD-3).
4. Product owner resolves FR-008 vs AC-008, channels, preferences, and delivery failure semantics (OD-4).
5. Security/operations review selects the identity provider, deployment, receipt retention, and audit/backup controls before any production release.
6. Human review of generated design and PlantUML is mandatory under Constitution V; proposed controls are not evidence of implemented compliance.

Top implementation risks are concurrent duplicate approval/payment, stale membership authorization, privacy of uploaded receipts, inexact rounding, and service latency under NFR-002. Planned controls and verification are cross-referenced in [traceability.md](./traceability.md).
