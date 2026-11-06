# Traceability: source requirements to proposed design

Baseline: [architecture provenance](architecture.md#baseline-and-independence). **Every status below means design coverage only; verification is planned, not passed.** No implementation coverage claimed. `M` = Swing MVP proposal plus full product; `F` = required full-product feature, excluded from Swing; `P` = provisional human decision blocks final acceptance; `Partial` means design has an explicit unresolved scope/behavior gap.

Source legend used in every row: **S** = [spec.md](../../specs/001-shared-expense-management/spec.md), exact bold requirement ID or scenario ID shown in row; FR/NFR sections, User Stories acceptance scenarios, or Success Criteria respectively. **U** = [UserRequirement.md](../../UserRequirement.md), customer feature named in row. **C** = [constitution](../../.specify/memory/constitution.md). **Q** = [readiness checklist](../../specs/001-shared-expense-management/checklists/requirements.md). Thus S:FR-001 identifies the source, not this proposal. Approved clarification sessions and assumptions are in S; they are not all independently customer-authored. Test IDs link to [validation](validation.md#planned-verification-catalog).

Evidence abbreviations: **A** [architecture](architecture.md); **D** [design](design.md); **Mdl** [data-model](data-model.md); **I** [identity/groups contract](contracts/identity-groups.md); **E** [expense contract](contracts/expenses.md); **F** [financial/report contract](contracts/finance-reports.md); **Dec** [decisions](decisions.md). Test mappings are additional proposed verification, not changes to source mappings.

## Functional requirements

| ID / source / customer origin | Status | Design evidence | AC/SC association | Planned verification |
|---|---|---|---|---|
| FR-001 / S:FR-001, U accounts | M/P D07 | D Accounts; I Identity | AC-001; SC-004 | T01 |
| FR-002 / S:FR-002, U own account | M/P D05 | D permission matrix; I own profile; F group visibility | AC-001; SC-004 | T02 |
| FR-003 / S:FR-003, U groups | M/P D02,D05 | D membership; I Group | AC-002; SC-004 | T03 |
| FR-004 / S:FR-004, U expense fields; S payer/positive clarification | M | E Submit; Mdl entities | AC-003,020; SC-001,004 | T04 |
| FR-005 / S:FR-005, U participants | M | E ordered participants; Mdl Share | AC-003; SC-001 | T04,T05 |
| FR-006 / S:FR-006, U equal split; S allocation clarification | M | Mdl exact allocator; E Submit | AC-004; SC-001 | T05 |
| FR-007 / S:FR-007, U percentage split; S exact percentages clarification | M/P D03 bounds | Mdl allocator; E validation | AC-005,021; SC-001 | T05 |
| FR-008 / S:FR-008, U notify others | Partial M/P D04 | D notification outbox; F inbox; Dec enablement conflict | AC-008; SC-004 extended | T08 |
| FR-009 / S:FR-009, U single/multiple review | M single; F multi; P D02 | D policy snapshot; I policy; E Review | AC-006; SC-002 | T06 |
| FR-010 / S:FR-010, U pre-balance review | M | D approval; Mdl no pending posting; F approved totals | AC-006; SC-002 | T06,T10 |
| FR-011 / S:FR-011, U review/reject | M | E Review; D terminal REJECTED | AC-007; SC-002 | T06 |
| FR-012 / S:FR-012, U approved adjustments | M | Mdl Finalization uniqueness; D approval transaction | AC-006; SC-002 | T06,T07 |
| FR-013 / S:FR-013, U pairwise debt; S payer-share clarification | M/P D05 netting | Mdl signed pair invariant; F balances | AC-004,005,009,010,019; SC-001,002,003 | T05,T07,T09 |
| FR-014 / S:FR-014, U payments/history | M/P D05 recorder | D settlement transaction; F payments | AC-010,011; SC-003 | T09 |
| FR-015 / S:FR-015, U reporting | M/P D09 | D Reports; F three-section report | AC-012; SC-004 | T10 |
| FR-016 / S:FR-016, U report criteria | M/P D09 | F inclusive dates/member/status and carry-in | AC-013; SC-004 | T10 |
| FR-017 / S:FR-017, U primary web | F gap in Swing | A Future path; Dec D01,D08 | AC-014; SC-004,007 | T13 |
| FR-018 / S:FR-018, U Android | F gap in Swing | A Future path; Dec D01,D08 | AC-015; SC-004,007 | T13 |
| FR-019 / S:FR-019, U iOS | F gap in Swing | A Future path; Dec D01,D08 | AC-016; SC-004,007 | T13 |
| FR-020 / S:FR-020, U accurate settlement, S overpayment behavior | M | F OVERPAYMENT; D locked pair validation | AC-011; SC-003 | T09 |
| FR-021 / S:FR-021, U account access, S recovery clarification | M/P D07 | I recovery/reset atomic consumption | AC-018; SC-004 | T01 |

## Nonfunctional requirements

| ID / source | Status | Design evidence | AC/SC association | Planned verification |
|---|---|---|---|---|
| NFR-001 / S:NFR-001; U private accounts | M/P D05,D07 | D permissions; I sessions; E receipt checks; F group checks | AC-001,002 + unauthorized edge cases | T02 |
| NFR-002 / S:NFR-002; proposed specification target | M/F unmeasured; P D10 | A shared deployment/indexed SQL; D async Swing I/O | SC-006 | T12: >=95% <=2s at 100 active users |
| NFR-003 / S:NFR-003; C IV | M/P D03 currency set | Mdl BigDecimal exact units/remainders/ledger | AC-004,005,019; SC-001,003 | T05,T09 |
| NFR-004 / S:NFR-004 | M/F unverified | A thin clients; D Swing EDT; validation accessibility plan | AC-017; SC-005 supporting | T11 |
| NFR-005 / S:NFR-005 | M service design; F client gap | D saved completion; I watermark; F report snapshots | AC-014,015,016; SC-007 | T13 |

## Acceptance scenarios, individually accounted

| ID / source | Status | Design evidence | Planned expected verification |
|---|---|---|---|
| AC-001 / S:AC-001 | M/P | I register/verify/session/me; D private identity | T01,T02: verified account sees own data only |
| AC-002 / S:AC-002 | M | I invitation accept; D membership | T03: pending invitation has no member access |
| AC-003 / S:AC-003 | M | E Submit; Mdl Expense/Share/Receipt | T04: all fields retained, independent payer |
| AC-004 / S:AC-004 | M | Mdl allocator + finalization | T05,T06: equal exact units, order tie-break, then posting |
| AC-005 / S:AC-005 | M | Mdl exact percentages | T05: exact sum 100 and deterministic shares |
| AC-006 / S:AC-006 | M single/F multi/P | D ordered stages; E Review | T06,T07: no effect until last required approval, once |
| AC-007 / S:AC-007 | M | E rejection; D terminal states | T06: submitter sees rejection; zero postings |
| AC-008 / S:AC-008 | Partial/P D04 | D always-on inbox proposal; F Notifications | T08: others receive one logical alert; enablement discrepancy open |
| AC-009 / S:AC-009 | M/P D05 | F pairwise balances; Mdl signed pairs | T09: correct each pair incl zero and reverse direction |
| AC-010 / S:AC-010 | M | F payment history; D atomic settlement | T09: valid amount reduces debt and survives zero balance |
| AC-011 / S:AC-011 | M | F OVERPAYMENT | T09: rejection leaves history and balance unchanged |
| AC-012 / S:AC-012 | M/P D09 | F three report sections | T10: expenses, balances, payments reconcile |
| AC-013 / S:AC-013 | M/P D09 | F inclusive effective-date/filter definitions | T10: only matching activity in period totals |
| AC-014 / S:AC-014 | F gap | A web path | T13: full customer flows on web |
| AC-015 / S:AC-015 | F gap | A Android path | T13: full customer flows on Android |
| AC-016 / S:AC-016 | F gap | A iOS path | T13: full customer flows on iOS |
| AC-017 / S:AC-017 | M/F unverified | A presentation boundary; validation T11 | T11: keyboard and assistive tools identify/control flows |
| AC-018 / S:AC-018 | M/P D07 | I password-reset | T01: replacement works, old password/session fails |
| AC-019 / S:AC-019 | M | Mdl skip payer self-entry | T05: payer share retained, no self-debt |
| AC-020 / S:AC-020 | M | E AMOUNT_NOT_POSITIVE | T04: zero/negative gives field error and no expense |
| AC-021 / S:AC-021 | M | E PERCENT_TOTAL_NOT_100/PERCENT_OUT_OF_RANGE | T05: invalid exact percentages produce no approvable expense |

## Success criteria, individually accounted

| ID / source | Status | Design evidence | Planned measurement |
|---|---|---|---|
| SC-001 / S:SC-001 | M/F unmeasured | Mdl exact allocator; E shares | T05: 100% approved fixtures reconcile at approved currency precision |
| SC-002 / S:SC-002 | M/F unmeasured | D finalization transaction; Mdl uniqueness | T06,T07: all balances exclude pending/rejected and include approved exactly once |
| SC-003 / S:SC-003 | M/F unmeasured | D atomic payment/history | T09: 100% valid payments in immutable history and balances |
| SC-004 / S:SC-004 | F gap in Swing | A platform path; shared contracts | T13: tester completes six listed flows on every customer platform |
| SC-005 / S:SC-005; proposed usability target | M/F unmeasured | thin UI with labelled status and balances | T14: >=90% first-time participants submit valid expense and find balance unaided |
| SC-006 / S:SC-006 | M/F unmeasured | A service deployment; D background I/O | T12: >=95% listed interactions within 2 seconds, 100 active users |
| SC-007 / S:SC-007 | F gap in Swing | I minWatermark; F snapshot reports; D completion | T13: 100% saved/completed test changes agree on all supported clients |

## Policy, assumptions and readiness coverage

C I: provenance and D01/D08 separate customer platform requirements from policy; C II: Java 21/Maven modules in A; C III: Swing presenters/application/domain boundaries in A; C IV: BigDecimal/unit algorithm in Mdl; C V and quality gates: planned JUnit 5 and human review in validation/Dec; PlantUML policy: four diagram sources. These are design evidence, not performed compliance tests.

S clarifications preserved: independent payer (E/Mdl), verified email/password and recovery (I), invitation acceptance (I), positive amounts/exact percentages/largest remainder + entry order (Mdl/E), nonself participant debt (Mdl). S assumptions on self-approval, currencies, membership history, notifications and reports are explicitly exposed as D02-D05/D09. Q testability/ambiguity remains open. Common brief edge cases map to T01-T14, including removal, offline retry, receipt failure, blocked reviewers and report dates; no unchecked requirement has been silently accepted.
