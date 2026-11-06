# Requirements Traceability and Verification Plan

**Status**: Proposed coverage; future tests are planned, not run
**Sources**: `UserRequirement.md`, `specs/001-shared-expense-management/spec.md`, and `.specify/memory/constitution.md` at source commit `b2a94af0105094dc14fce245ebf8e733c959a689`.

The MVP/full-product labels below describe this proposal. "Full product" means required clients or behavior beyond the proposed Swing MVP; it is not a claim that the requirement is implemented.

## Functional requirements

| Requirement | Source | Design / status | Acceptance / planned verification |
|---|---|---|---|
| FR-001 account, verified email, sign-in | UserRequirement.md; spec | OIDC identity boundary; MVP and full product, provider unresolved | AC-001; register/verify/login E2E; test private account access. |
| FR-002 own records and privacy | UserRequirement.md; spec | API authorization on every read/write; MVP and full product | AC-001, NFR-001; cross-account negative API tests for account, group, receipt, and report IDs. |
| FR-003 groups, invitation, acceptance | UserRequirement.md; spec | Group/Invitation/Membership; acceptance creates access, pending invite does not; MVP and full product | AC-002; verify invite states and unauthorized access before acceptance. |
| FR-004 expense fields, separate payer, optional receipt, positive amount | UserRequirement.md; spec | Expense + private receipt reference; payer independent; MVP and full product | AC-003, AC-020; valid submit and zero/negative/non-member/required-field rejects. |
| FR-005 choose participants | UserRequirement.md; spec | Ordered, distinct member share rows; MVP and full product | AC-003; verify submitted participant set and entry order persist. |
| FR-006 equal split + largest remainder | UserRequirement.md; spec | BigDecimal split service and currency-scale registry; MVP and full product | AC-004, NFR-003, SC-001; exact ties, remainder order, and sum assertions. |
| FR-007 percentage range/total and rounding | UserRequirement.md; spec | Exact decimal validation and same allocator; MVP and full product | AC-005, AC-021, NFR-003, SC-001; boundary 0/100, non-100 sum and precision tests. |
| FR-008 notify members other than submitter | UserRequirement.md; spec | Outbox/inbox and channel adapters; MVP inbox proposed; product semantics open | AC-008; test submitter exclusion, recipients, duplicate delivery, retry/failure. Resolve AC-008 enablement discrepancy before sign-off. |
| FR-009 group approval policy, one or more stages | UserRequirement.md; spec | Versioned policy; one stage MVP, multi-stage full product; approver policy open | AC-006; stage sequencing, policy snapshot, unauthorized approver tests. |
| FR-010 exclude pending until all approvals | UserRequirement.md; spec | No ledger posting until final stage; MVP and full product | AC-006; assert pending has zero postings/balance change. |
| FR-011 authorized rejection, no balance effect | UserRequirement.md; spec | Guarded reject transition; MVP and full product | AC-007; reject authorization and unchanged ledger/balance assertions. |
| FR-012 balances include only fully approved expenses | UserRequirement.md; spec | Atomic final approval and once-only ledger posting; MVP and full product | AC-006, SC-002; duplicate/concurrent final-approval tests. |
| FR-013 pairwise balances, participant owes payer, no self-debt | UserRequirement.md; spec | Immutable ledger and pairwise projection; MVP and full product | AC-004, AC-005, AC-009, AC-019, NFR-003; independently selected payer and payer participant tests. |
| FR-014 record payment and update history/balance | UserRequirement.md; spec | Settlement record with atomic balance check and posting; MVP and full product | AC-010; payment history and balance change transaction test. |
| FR-015 summaries for expenses, balances, payments | UserRequirement.md; spec | Authorized report service; MVP and full product | AC-012; compare summary values with source records. |
| FR-016 date range and other criteria | UserRequirement.md; spec | Inclusive date filters, record-specific date; MVP and full product | AC-013; inclusive endpoints, empty range/results, reversed range, criteria isolation. |
| FR-017 web client | UserRequirement.md; spec | Deferred full-product web client sharing API; not MVP | AC-014, AC-017, SC-004, SC-007; client parity and accessible-flow E2E. |
| FR-018 Android app | UserRequirement.md; spec | Deferred full-product Android client sharing API; not MVP | AC-015, AC-017, SC-004, SC-007; client parity and accessible-flow E2E. |
| FR-019 iOS app | UserRequirement.md; spec | Deferred full-product iOS client sharing API; not MVP | AC-016, AC-017, SC-004, SC-007; client parity and accessible-flow E2E. |
| FR-020 reject payment above amount owed, no change | UserRequirement.md; spec | Atomic pair-balance check and failed command with no posting; MVP and full product | AC-011; concurrent competing payments, overpay rejection, unchanged history/balance. |
| FR-021 password recovery | UserRequirement.md; spec | Identity-provider recovery; MVP and full product if production scope includes accounts | AC-018; recovery then sign-in with replacement credential; test unauthorized account leakage. |

## Non-functional requirements

| Requirement | Source | Design / status | Planned verification and measurable outcome |
|---|---|---|---|
| NFR-001 account/group privacy | spec | Server-authenticated identity and resource-level checks; MVP and full product | Attempt account B access to account A's private records, groups, receipt, reports, and mutations; all denied without data leakage. |
| NFR-002 ≥95% within 2 seconds, 100 concurrent active users | spec | API, indexed relational queries, bounded report queries; full-product service target | Representative 100-concurrent-user test covering account/group/expense/balance/payment/report interactions; at least 95% show a result within 2 seconds. Define workload, warm-up, and measurement in test plan before performance sign-off. |
| NFR-003 currency-unit reconciliation | spec | BigDecimal, explicit scale and deterministic largest-remainder allocator; MVP and full product | For every selected currency, expense shares and settlements reconcile exactly at its smallest supported unit; ties use participant order. Currency coverage awaits OD-3. |
| NFR-004 keyboard/accessibility | spec | Client-specific accessible controls; Swing labels/focus order and future platform-native checks | Keyboard-only complete account, expense, approval, balance, payment flows; accessibility tooling reports labeled controls and operable primary actions on each shipped client. |
| NFR-005 cross-client consistency | spec | One authoritative service; web/mobile deferred | Write expense/approval/payment on one client, wait for confirmed completion, read from every supported client; 100% matching status, balances, history, report totals. |

## Acceptance scenario coverage

| Acceptance criteria | Planned verification |
|---|---|
| AC-001 | Verified email registration/sign-in and authorized own account records; negative other-account access. |
| AC-002 | Invitation cannot access group before acceptance; correct invitee accepts; membership access begins afterward. |
| AC-003 | Submit amount/date/description/separate payer/ordered participants/split/optional receipt; persisted pending details match input. |
| AC-004 | Equal split largest remainders, stable entry-order ties, exact total and approved balance effect. |
| AC-005 | Valid percentages produce exact shares at currency precision; exact reconciliation. |
| AC-006 | Intermediate approval leaves balances unchanged; final required approval adds postings exactly once. |
| AC-007 | Authorized rejection leaves balance and ledger unchanged; rejected state is visible. |
| AC-008 | Other group members receive an expense notification when notifications are enabled; resolve mismatch with FR-008 first. |
| AC-009 | Read directed pairwise obligations across approved group expenses. |
| AC-010 | Valid payment appears in history and reduces correct directed balance. |
| AC-011 | Overpayment is rejected with explanation; no balance or accepted history change. |
| AC-012 | Expense/balance/payment report totals reconcile to source records. |
| AC-013 | Only records inside inclusive selected dates and supported criteria affect totals. |
| AC-014 | Web flow completes account, expense, approval, balance, payment, and filtered report. Full product only. |
| AC-015 | Android flow completes same required flow and sees shared state. Full product only. |
| AC-016 | iOS flow completes same required flow and sees shared state. Full product only. |
| AC-017 | Keyboard and accessibility audit of required controls on each supported client. |
| AC-018 | Password recovery and replacement-password sign-in through identity provider. |
| AC-019 | When payer is also a participant, no self-debt; each other participant's calculated share is owed to payer. |
| AC-020 | Zero/negative expense rejected before pending expense creation. |
| AC-021 | Out-of-range percentage or sum other than exactly 100% rejected before pending expense creation. |

## Success criteria coverage

| Success criterion | Planned test / expected result |
|---|---|
| SC-001 | Equal and percentage split acceptance suite: 100% of approved shares sum exactly to entered amount at supported precision. |
| SC-002 | Mixed pending/rejected/approved dataset: pending/rejected contribute zero; each approved expense posts once. |
| SC-003 | Valid settlement suite: 100% of accepted payments appear once in history and reduce the correct balance. |
| SC-004 | Platform E2E per required client; account, group expense submit/review, approval, balance, payment, date-filtered report all complete. |
| SC-005 | Usability session: at least 90% of first-time participants submit valid shared expense and find resulting balance unassisted. |
| SC-006 | Same 100-concurrent-user workload as NFR-002: at least 95% of listed interactions finish within 2 seconds. |
| SC-007 | Cross-client seeded workflow: 100% of confirmed saved state (approval, balance, payment history, report totals) matches on each supported platform. |

## Planned test types

- JUnit 5 unit tests for amount/percentage validation, currency scales, largest remainders/ties, payer-self exclusion, state transitions, and report boundaries.
- JUnit 5 repository/service integration tests for transaction rollback, final approval once-only behavior, invitation acceptance, authorized membership changes, and receipt access.
- API contract tests for request validation, authorization, idempotency key replay/conflict, and stable problem responses.
- Concurrency tests racing final approvals and payments against the same expense/balance; expect no duplicate posting and no overpayment.
- E2E flows for AC-001–AC-021, with platform-specific coverage for AC-014–AC-017.
- Accessibility checks (keyboard traversal, focus visibility/order, purpose labels) on each supported client.
- Load test for NFR-002 with explicit representative request mix and percentile accounting; performance must be measured, not inferred from architecture.

## Evidence boundary

At planning time, no `pom.xml`, application source, tests, or runnable product exists. No build, JUnit, API, accessibility, load, or PlantUML rendering check has been run. These are planned verification steps for implementation; AI-produced design is not implementation evidence and requires human review.
