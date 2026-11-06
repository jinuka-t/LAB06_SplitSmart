# SplitSmart — Independent Architecture & Design Comparison

| Review detail | Record |
|---|---|
| Review date | November 5, 2026 |
| Repository | [jinuka-t/LAB06_SplitSmart](https://github.com/jinuka-t/LAB06_SplitSmart) |
| Branch and reviewed revision | `main` at [`ed54f53808ac8acbd938c26cb8378089032b785d`](https://github.com/jinuka-t/LAB06_SplitSmart/tree/ed54f53808ac8acbd938c26cb8378089032b785d), “architecture and design” |
| Proposal A | GitHub Spec Kit with Copilot, 12 design files |
| Proposal B | OpenAI Codex in VS Code, 14 files including its design-check record |
| Review type | Documentary comparison against the committed requirements. Application, concurrency, accessibility, load, client-parity, and PlantUML rendering results were unavailable. |

## 1. Executive summary

**Decision — Hold final design approval.** Use **Codex as the working design baseline** for allocation, approval, settlement, and verification. Incorporate **Spec Kit’s provider-owned identity boundary and OpenAPI contract structure** after reconciling both with the selected domain behavior. Codex scores **75.00/100** and Spec Kit scores **68.75/100** under the repository’s rubric.

The most consequential difference is how each design turns a rule into a reproducible transaction. Spec Kit describes exact rounding and atomic writes. Codex specifies the arithmetic for repeating shares, the lock order shared by approvals and settlements, and the result returned on a retry. Spec Kit is more concrete about the machine-readable HTTP contract and the ownership of credentials and account recovery. [A architecture][a-arch] · [A identity][a-id] · [A API][a-api] · [B data model][b-model] · [B expense contract][b-exp]

| Priority | Finding | Effect on acceptance |
|---|---|---|
| **Release gate** | FR-017–FR-019 require web, Android, and iOS. Both designs treat Swing as a proposed desktop MVP. Codex’s candidate TypeScript/Kotlin/Swift client stacks also need a Principle II decision. | Confirm the Swing release role and the full-product platform plan before approving scope. [Specification][spec] · [Constitution][constitution] · [B D01 and D08][b-dec] |
| **High** | FR-008 requires submission notifications for other group members. AC-008 only describes groups where they are enabled. | Approve the enablement rule and delivery outcome before accepting notification behavior. [Specification][spec] · [A plan][a-plan] · [B D04][b-dec] |
| **High** | A leaves exact quota arithmetic and approval/payment serialization underspecified. Its approval diagram also differs from its retry and outbox prose. | Turn these rules into a single financial transaction contract and align the diagrams. [A architecture][a-arch] · [A approval sequence][a-approval] |
| **High** | B’s per-read minimum watermark does not pin related views to one revision. Both packages also need a clearer FR-016 report contract. | Agree on same-snapshot reads and explicit filter scope before client integration. [A API][a-api] · [B identity/groups contract][b-id] · [B report contract][b-fin] |

## 2. Reviewed artifacts and versions

### Authority and provenance

The [Common brief][brief] names the four files below as the review authority. Their Git blob IDs were compared at the two declared source revisions and at the reviewed `main` revision. Each file matched across all three. The generators therefore used an equivalent **requirements snapshot** according to their recorded revisions. The commit IDs and surrounding repository contents differ.

| Authority file | Git blob ID |
|---|---|
| [`UserRequirement.md`][customer] | `b230151f991c9d1e66d944fa010841aa46cce107` |
| [`.specify/memory/constitution.md`][constitution] | `7ff51e27678134c3f551c8c2d1f546de92f66931` |
| [`specs/001-shared-expense-management/spec.md`][spec] | `5bef452995e8f0df3fabef348f57c76c20ed1ee7` |
| [`specs/001-shared-expense-management/checklists/requirements.md`][checklist] | `e576a73a89e94ba7adb9aa7549b57f3467251f2a` |

| Package | Declared generation source | Committed output |
|---|---|---|
| **A — Spec Kit + Copilot** | [`b2a94af0105094dc14fce245ebf8e733c959a689`](https://github.com/jinuka-t/LAB06_SplitSmart/tree/b2a94af0105094dc14fce245ebf8e733c959a689). A also identifies `ba90a30667a1bc5683cf4cefc6836a2cf4a50019` as the earlier content baseline. [A plan][a-plan] | [`3d6a9d5762c680884a6615e3ce611b7d552121d7`](https://github.com/jinuka-t/LAB06_SplitSmart/commit/3d6a9d5762c680884a6615e3ce611b7d552121d7) |
| **B — Codex in VS Code** | [`e62e6dbe9a1b58b6d5dc7cf327e8d9fcc49e57a4`](https://github.com/jinuka-t/LAB06_SplitSmart/tree/e62e6dbe9a1b58b6d5dc7cf327e8d9fcc49e57a4). B records SHA-256 hashes and states that it did not inspect A. [B check record][b-check] | [`ed54f53808ac8acbd938c26cb8378089032b785d`](https://github.com/jinuka-t/LAB06_SplitSmart/commit/ed54f53808ac8acbd938c26cb8378089032b785d) |

The Spec Kit output commit is an ancestor of the Codex output commit, and its package is unchanged at the reviewed revision. B reports that Spec Kit files were already staged during its run and that it did not open their contents. Separate generation is documented, while isolation of the original sessions remains **not verifiable** from Git alone. Codex and ChatGPT share a provider, so this review bases findings on the source requirements and worked checks. [B architecture][b-arch] · [B check record][b-check]

### Artifact inventory

| Package | Files within its root |
|---|---|
| [A — `specs/001-shared-expense-management/`][a-root] | `architecture.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `traceability.md`, `contracts/identity.md`, `contracts/openapi.yaml`, `diagrams/component.puml`, `diagrams/domain.puml`, `diagrams/expense-approval.puml`, `diagrams/settlement.puml` |
| [B — `design-comparison/codex/`][b-root] | `architecture.md`, `design.md`, `data-model.md`, `decisions.md`, `validation.md`, `traceability.md`, `review-checks.txt`, `contracts/identity-groups.md`, `contracts/expenses.md`, `contracts/finance-reports.md`, `diagrams/component.puml`, `diagrams/class.puml`, `diagrams/expense-approval.puml`, `diagrams/settlement.puml` |

Both packages contain the comparable deliverable types in the Common brief. A provides a feature plan and quickstart, while B puts detailed workflows and verification in dedicated files. The reviewed revision contains design documents and PlantUML source, with no Maven application or executable acceptance suite. Diagram checks in this report compare source text with the contracts and prose. [Common brief][brief] · [A quickstart][a-quick] · [B validation][b-val]

## 3. Authoritative baseline

| Source level | What it establishes |
|---|---|
| **Customer request** | Individual accounts, groups, expense details and optional receipts, participant selection, equal and percentage splits, submission notifications, approval, pairwise balances, settlements, and reports with possible filters. The product is primarily web-based and also requires Android and iOS. [Customer requirements][customer] |
| **Recorded clarifications, October 29** | The submitter selects one payer separately from participants. Accounts use email and password with verification and recovery. Group access follows an accepted manager invitation. Expense amounts are positive. Percentages are within 0–100 and total exactly 100%. Smallest-unit remainders go by largest fraction with ties resolved by participant entry order. A payer’s own share creates no self-debt. [Specification, Clarifications][spec-clar] |
| **Engineering policy** | Constitution v1.0.0 requires Java 21, Maven, OOP, Swing/business separation, `BigDecimal` money, JUnit 5, PlantUML, traceability, and human review. Principle I requires explicit decisions for conflicts between implementation and customer scope. [Constitution][constitution] |
| **Assumptions and open decisions** | The Swing MVP’s release role, approval eligibility and self-approval policy, supported currencies, and notification channels and failures remain open. One currency per group, no self-approval by default, and inclusive report dates are spec assumptions. The checklist leaves testability and ambiguity open. [Specification, Open Questions][spec-open] · [Readiness checklist][checklist] |

The current SplitSmart baseline permits a payer who is outside the participant list, and notification channel selection remains open. These rules are evaluated using this repository’s clarification record. [Specification, Clarifications][spec-clar] · [Specification, Open Questions][spec-open]

## 4. Evaluation rubric and scorecard

The [review prompt][review-prompt] sets the same scale for both packages. **0** means missing or contradictory, **1** major gaps, **2** partial, **3** substantial coverage with gaps, and **4** complete and internally consistent with evidence. **N/V** means evidence is insufficient to score. A weighted contribution is the category weight multiplied by the score divided by four. Scores assess the written designs.

| Category | Weight | A / 4 | B / 4 | Evidence behind the assessment |
|---|---:|---:|---:|---|
| Requirements and traceability | 25% | 3 | 3 | Both packages map all 21 FRs, 5 NFRs, 21 ACs, and 7 SCs. Notification enablement and the scope of filtered totals remain open. [A traceability][a-trace] · [B traceability][b-trace] |
| Constitution and product scope | 20% | 3 | 3 | Both separate Swing from the business layer and retain web and mobile scope. A leaves future technology choices open. B identifies a Java 21 governance gate for its proposed client languages. [A plan][a-plan] · [B D08][b-dec] |
| Architecture and interfaces | 20% | 3 | 3 | A supplies OpenAPI and a provider boundary. B gives more detailed permissions, errors and retry behavior, with a gap in cross-view read guarantees. [A API][a-api] · [B identity/groups][b-id] |
| Monetary, workflow, and data correctness | 25% | 2 | 3 | A specifies the intended outcome but leaves repeating decimal arithmetic, pair direction and shared serialization open. B specifies each and still needs approval for netting and removed-member policy. [A architecture][a-arch] · [B model][b-model] · [B D05][b-dec] |
| Verification and diagram consistency | 10% | 3 | 3 | Both supply four diagram sources and planned checks. B has stronger fixtures and workload detail. A’s approval sequence needs correction, and B’s diagram claims about matching reads need precise contract semantics. [A quickstart][a-quick] · [A sequence][a-approval] · [B validation][b-val] · [B settlement sequence][b-settle] |
| **Weighted total** | **100%** | **68.75** | **75.00** | A = 18.75 + 15 + 15 + 12.50 + 7.50. B = 18.75 + 15 + 15 + 18.75 + 7.50. |

## 5. Side-by-side architecture comparison

### Proposal A assessed against the baseline

Spec Kit gives the Swing client and future platforms one Java service, a central authorization boundary, and shared PostgreSQL persistence. Its OIDC provider boundary covers registration, verification and recovery. The API exposes group, expense, approval, balance, settlement, report and notification operations. The domain model keeps approval-gated ledger facts and a transactionally maintained projection. This is a viable architectural structure for FR-001–FR-021, subject to release and policy decisions. A’s documents need further precision around repeating-decimal allocation, locks that coordinate multiple types of financial updates, and report semantics. Its sequence should match its intended replay and delivery behavior. [A plan][a-plan] · [A API][a-api] · [A data model][a-model] · [A approval sequence][a-approval]

### Proposal B assessed against the baseline

Codex also uses thin clients and a Java service backed by PostgreSQL. It defines immutable allocations, frozen approver sets, finalization even when no debt posting is needed, an auditable settlement ledger, and retries tied to durable operation results. Its design specifies behavior when reviewer removal blocks progress. It assumes signed pair netting, a first-party credential boundary, an always-on inbox, and proposed report semantics. Those choices require human review. Its cross-view read guarantee and report filter definitions need revisions for NFR-005 and FR-016. [B architecture][b-arch] · [B detailed design][b-design] · [B model][b-model] · [B decisions][b-dec]

| Design area | A — Spec Kit | B — Codex | Recommended disposition |
|---|---|---|---|
| Delivery and layering | Thin Swing client, versioned REST, Java 21 modular monolith and later shared clients. | Thin Swing presentation, Java 21 service adapters, application and domain modules, future web/mobile stacks named. | Keep the common Java service boundary. Approve the Swing role and production client strategy separately. [A architecture][a-arch] · [B architecture][b-arch] |
| Identity and authorization | Provider owns credential lifecycle. Application maps issuer/subject and enforces resource access. | Application manages credentials, tokens and sessions. Contracts give a detailed authorization and error model. | Adopt A’s provider boundary with B’s actor/resource authorization cases. Resolve endpoint ownership before publishing the API. [A identity][a-id] · [B identity/groups][b-id] |
| Invitations and membership | Invitation acceptance gates group access. Historical records survive removal. | Actor-bound invitation redemption and retained membership, with explicit re-invitation for a departed debtor. | Preserve access checks and historical facts. Decide what a departed member may read or settle. [A model][a-model] · [B D05][b-dec] |
| Storage and financial state | PostgreSQL, immutable ledger postings, pairwise projection and outbox. | Same general topology, plus a canonical signed pair, explicit finalization and durable operation result. | Adopt B’s transactional detail. Confirm netting, backdating, retention and lock contention expectations. [A model][a-model] · [B model][b-model] |
| Approval workflow | Versioned policy, staged decisions, atomic final posting. | Frozen reviewer sets, quorum, stale-version handling, blocked condition and withdraw/resubmit. | Use B’s state and transaction rules after approval policy sign-off. [A architecture][a-arch] · [B expense contract][b-exp] |
| Notifications and receipts | In-product inbox/outbox, channel adapter and private receipt storage. | Durable recipient inbox, retry/dead-letter behavior and private staged receipt tokens with cleanup. | Keep separate receipt and notification failure handling. Specify the accepted recipient set and definition of delivery. [A architecture][a-arch] · [B detailed design][b-design] |
| Reports and client consistency | Inclusive dates and report schema, but an unresolved balance-as-of rule. | Opening/movement/closing definitions and snapshot-bound report pagination. Separate reads can use different revisions. | Require one report meaning and pin related reads or return them as one composite snapshot. [A API][a-api] · [B finance/report contract][b-fin] |
| Verification | JUnit 5, authorization, concurrency, accessibility, load and client parity in the quickstart. | Named T01–T14 scenarios, monetary fixtures, failure cases and a proposed load profile. | Use B’s fixtures with A’s API contract checks and add regression cases for the findings below. [A quickstart][a-quick] · [B validation][b-val] |

## 6. Requirement traceability cross-check

**Covered** means the documents describe a design that addresses the requirement. **Partial** means important behavior remains open or inconsistent. **Deferred** identifies full-product work outside the Swing MVP. **Missing**, **Contradicts**, and **Not verifiable** distinguish an absent design, an explicit conflict, and unavailable evidence. Tests in the last column are acceptance checks to perform. The [specification traceability][spec-trace] governs the AC/SC mapping, supplemented by directly related criteria where appropriate. The proposal traceability files provide navigation to the supporting designs. [A traceability][a-trace] · [B traceability][b-trace]

| ID and requirement | Related criteria | A | B | Evidence and independent acceptance check |
|---|---|---|---|---|
| **FR-001** Account, email verification and sign-in | AC-001 | Covered | Covered | Register, deny use before verification, consume a verification challenge and sign in with the verified account. [A identity][a-id] · [B identity/groups, T01][b-id] |
| **FR-002** Own expenses and balances | AC-001 | Covered | Covered | Account A can view its own authorized records. Changing an account or resource ID must never expose B’s private data. [A API][a-api] · [B permissions][b-design] |
| **FR-003** Create and manage groups, invitation acceptance | AC-002 | Covered | Covered | Pending, expired, revoked and wrong-user invitations confer no membership. A successful acceptance grants one membership, and replay creates no duplicate. [A API][a-api] · [B identity/groups][b-id] |
| **FR-004** Expense details, positive amount, separate payer and optional receipt | AC-003, AC-020 | Partial | Covered | A’s class diagram shows a mandatory receipt. [A class diagram][a-class] Submit with and without a receipt and with a payer outside the participant list. Reject 0.00, negative amounts and out-of-group payers. [A model][a-model] · [B expense contract][b-exp] |
| **FR-005** Select participants | AC-003–AC-005 | Covered | Covered | Persist the ordered list. Reject empty or duplicate selections and out-of-group participants. [A model][a-model] · [B expense contract][b-exp] |
| **FR-006** Equal shares, largest remainder, entry-order ties | AC-004, SC-001 | Partial | Covered | For 10.00 across three ordered members expect 3.34, 3.33, 3.33. A leaves the exact quotient method open. B specifies remainder arithmetic without evaluating a rounded decimal third. [A architecture][a-arch] · [B model][b-model] |
| **FR-007** Percentage bounds, exact total and rounding | AC-005, AC-021, SC-001 | Covered | Covered | For 0.05 split 50/50 expect 0.03 and 0.02. Reject 99.99% totals and values outside 0–100. B’s provisional precision cap needs approval and a boundary test. [A model][a-model] · [B model][b-model] |
| **FR-008** Submission notification to other group members | AC-008 | Partial | Partial | Confirm enabled/disabled policy, recipient eligibility and the delivery outcome. Retry one failed delivery and prove one logical inbox alert per recipient. [A plan, OD-4][a-plan] · [B decisions, D04][b-dec] |
| **FR-009** Configurable approval stages and authorized approvers | AC-006 | Partial | Covered | Exercise one-stage and multistage paths, reject out-of-order or unauthorized decisions, and remove a reviewer mid-stage. A needs a recovery path. B specifies blocked review and resubmission. Approver selection remains open for both. [A plan][a-plan] · [B expense contract][b-exp] |
| **FR-010** Pending expenses excluded from balances and settled activity | AC-006, SC-002 | Covered | Covered | After submission and after intermediate approval, assert zero ledger effects and exclusion from settled totals. [A architecture][a-arch] · [B detailed design][b-design] |
| **FR-011** Authorized rejection with no balance impact | AC-007, SC-002 | Covered | Covered | Reject as an authorized reviewer, then verify visible rejected status and no postings. An unauthorized reject changes no state. [A model][a-model] · [B expense contract][b-exp] |
| **FR-012** All required approvals precede financial posting | AC-006, AC-007, SC-002 | Covered | Covered | Race final approval with a retry and with a competing terminal decision. Exactly one final state commits. A’s diagram needs the replay path in its prose. [A approval sequence][a-approval] · [B approval sequence][b-approval] |
| **FR-013** Pairwise balances, payer self-share excluded | AC-004, AC-005, AC-009, AC-010, AC-019 | Partial | Partial | Test payer included/excluded, then reciprocal debts. A needs a single direction rule. B gives signed netting, which still requires policy approval. [A model][a-model] · [B model][b-model] · [B D05][b-dec] |
| **FR-014** Record settlement and update history and balance | AC-010, AC-011, SC-003 | Covered | Covered | Record 4.00 against 10.00. Verify a single history row and 6.00 outstanding, including after same-key retry. [A settlement sequence][a-settle] · [B finance contract][b-fin] |
| **FR-015** Expense, balance and settlement reports | AC-012 | Covered | Covered | Reconcile all three sections with a fixture of approved expense, pair movements and a recorded payment. [A API][a-api] · [B finance/report contract][b-fin] |
| **FR-016** Report filters and matching totals | AC-013 | Partial | Partial | Test inclusive endpoints, member/status criteria and empty results. A lacks balance-as-of semantics. B’s expense status filters detail only, so the response needs explicit distinction between matching and independently scoped totals. [A architecture][a-arch] · [B finance/report contract][b-fin] |
| **FR-017** Web product | AC-014, SC-004 | Deferred | Deferred | The required web client is outside the desktop MVP. Exercise the SC-004 flows using the actual browser client. [A plan][a-plan] · [B architecture][b-arch] |
| **FR-018** Android app | AC-015, SC-004 | Deferred | Deferred | The Android app is outside the desktop MVP. Exercise the same flows on Android after resolving D08. [A plan][a-plan] · [B decisions][b-dec] |
| **FR-019** iOS app | AC-016, SC-004 | Deferred | Deferred | The iOS app is outside the desktop MVP. Exercise the same flows on iOS after resolving D08. [A plan][a-plan] · [B decisions][b-dec] |
| **FR-020** Reject overpayment and retain balance | AC-011, SC-003 | Covered | Covered | With 6.00 owed, reject 7.00 and retain 6.00 and the original history. Race two competing settlements in SQL. [A settlement sequence][a-settle] · [B settlement sequence][b-settle] |
| **FR-021** Password recovery | AC-018 | Covered | Covered | Reset with an unexpired single-use challenge. Verify the replacement password, reject reuse, and validate session policy. [A identity][a-id] · [B identity/groups][b-id] |
| **NFR-001** Cross-account/group authorization | AC-001 and authorization edge cases | Covered | Covered | Exercise cross-account, pending-invitation, former-member and unrelated-group reads and writes, including receipt and pagination requests. [A quickstart][a-quick] · [B validation T02][b-val] |
| **NFR-002** Visible result within two seconds for at least 95% at 100 active users | SC-006 | Covered | Covered | Measure action to visible result across specified interaction types. B proposes a workload mix and hot-group contention checks. Execution evidence is pending. [A quickstart][a-quick] · [B validation T12][b-val] |
| **NFR-003** Conservation at currency scale | AC-004, AC-005, SC-001 | Partial | Covered | Exercise supported scales, exact shares, equal remainder ties and settlement reconciliation. A’s calculation needs the exact repeating-quota method. [A model][a-model] · [B model][b-model] |
| **NFR-004** Keyboard operation and accessible labels | AC-017 | Covered | Covered | For each supported client, exercise the listed account, expense, approval, balance and payment flows by keyboard and inspect labels and focus. [A quickstart][a-quick] · [B validation T11][b-val] |
| **NFR-005** Completed records agree across clients | AC-014–AC-016, SC-007 | Partial | Partial | Read approvals, balances, history and reports from all clients after confirmed completion, including a concurrent second write. A specifies one authority. B’s minimum watermark gives a lower bound on freshness. [A architecture][a-arch] · [B identity/groups][b-id] |
| **SC-005** First-time usability, standalone criterion | 90% unaided | Covered | Covered | Observe first-time participants submitting an expense and finding the resulting balance without assistance. Record cohort and completion rate. [A traceability][a-trace] · [B validation T14][b-val] |

The matrix includes all AC-001–AC-021 and SC-001–SC-007. The customer platform criteria remain full-product acceptance gates.

## 7. Independent correctness and failure checks

The expected results below are calculated or traced from the specification. They are suitable as fixtures for the implementation review. [Specification requirements][spec] · [A quickstart][a-quick] · [B worked expectations][b-worked]

| Scenario | Expected result | Package assessment |
|---|---|---|
| **Equal split** — FR-006, NFR-003, AC-004, SC-001 | 10.00 is 1,000 cents. Dividing by 3 gives 333 cents each and one cent left over. All remainders tie, so the first entry gets the extra cent. Result **3.34 + 3.33 + 3.33 = 10.00**. | A states the correct allocation order. B’s exact quotient and remainder rule is directly implementable. Add a case with the same participants entered in a different order. |
| **Percentage split** — FR-007, AC-005, AC-021 | Each 50% quota of 5 cents is 2.5 cents. Give each person two cents, then assign the remaining cent to the first entry. Result **0.03 + 0.02 = 0.05**. Reject **33.33 + 33.33 + 33.33 = 99.99%** and a pair of **−1% and 101%** even though its sum is 100%. | Both specify exact sum, individual bounds and entry-order ties. B documents the exact arithmetic and provisional precision. |
| **Payer included or excluded** — FR-010–FR-013, AC-006, AC-007, AC-019 | If the payer is the first of the three participants above, the other two owe 3.33 each and the payer’s self-debt is 0.00. Total other-member debt is **6.66**. If the payer is outside the participant list, all three shares are owed to the payer, totaling **10.00**. Pending and rejected cases add **0.00**. | Both preserve this behavior. Also test a sole payer/participant whose approved expense creates no pair postings. B explicitly records one finalization in this case. |
| **Settlement and overpayment** — FR-014, FR-020, AC-010, AC-011, SC-003 | **10.00 − 4.00 = 6.00**. One completed payment appears in history. Reject a subsequent **7.00** payment, leaving 6.00 and one completed history entry. | Both give the expected result and describe atomic history and ledger writes. |
| **Concurrent approvals and retries** — FR-012, SC-002 | A same-key replay after commit returns the saved result. A separate stale command cannot post again. A competing authorized rejection and final approval can yield only one terminal transition. Failure before commit rolls back decision, posting, projection and saved result. | B specifies lock order and replay under lock. A describes atomicity and source uniqueness, but its approval sequence should separate successful replay from stale/conflicting writes. |
| **Concurrent settlements and approval** — FR-012–FR-014, FR-020 | Two distinct 6.00 payments racing against 10.00 leave **4.00** and one completed payment. If an approval adds debt concurrently, the outcome must match a valid serial order. A lost response after a committed payment is resolved by replay with the original key. | B uses a shared group lock and rechecks debt under lock. A’s settlement flow locks the directed balance, while approval does not explicitly acquire the same lock. Test pair creation and direction reversal as well. |
| **Report totals and client parity** — FR-016, NFR-005, AC-013, SC-007 | After a saved approval and payment, all clients should agree for the same revision. If one view reads revision 11 and another reads revision 12, both meet a lower bound of 11 but can disagree. A pending-only report should expose any group-wide approved subtotal separately from totals for the filtered selection. | A’s shared database and B’s lower-bound watermark help freshness. Pin a snapshot or return a composite response, and specify filters separately for each metric. |
| **Accessibility and responsiveness** — NFR-002, NFR-004, AC-017, SC-006 | Each supported client completes the primary flows with keyboard and labeled controls. Under 100 concurrent active users, at least 95% of the specified actions show a result within two seconds. | Both plan manual/client checks and load verification. B gives a concrete workload proposal. Actual test evidence is pending. |

## 8. Contract, model and PlantUML cross-check

| Artifact | A — Spec Kit | B — Codex |
|---|---|---|
| **Component diagram** | Thin clients use the HTTPS API. PostgreSQL and private receipt storage remain behind the service. The identity provider has its own boundary, as described in the identity contract. [A components][a-component] · [A identity][a-id] | Swing delegates to an HTTP adapter, and the application services own calls to the domain and persistence ports. If A’s identity boundary is adopted, update the diagram to move credential and recovery ownership to the provider. [B components][b-component] · [B architecture][b-arch] |
| **Domain/class diagram** | The receipt end of `Expense "0..1" --> "1" Receipt` makes a receipt mandatory for each expense as drawn. FR-004 and A’s data model make it optional. The posting associations also need to show that each posting has exactly one type of source. [A class diagram][a-class] · [A model][a-model] | Separate payer and submitter, ordered shares and optional finalization match the prose. The posting associations require a `Payment` at one end and a `Finalization` at another, although the ledger model treats their sources as alternatives. Show optional source links with an exclusive-source constraint. [B class diagram][b-class] · [B model][b-model] |
| **Expense and approval sequence** | A user-to-client “notify group” step is drawn after submission. The prose places delivery in the outbox worker after commit. The sequence also groups stale and duplicate decisions without showing a successful same-key replay. [A sequence][a-approval] · [A architecture][a-arch] | The submission transaction, blocked-approval condition, rejection, finalization and rollback align with the expense contract. Show an explicit exit when the under-lock key recheck discovers a newly committed result. [B sequence][b-approval] · [B expense contract][b-exp] |
| **Settlement sequence** | The flow shows locked validation and rollback on overpayment. Expand the common approval/settlement lock order and distinguish replay from a new payment attempt. [A settlement sequence][a-settle] · [A architecture][a-arch] | The flow shows a saved result, rollback and lost-response recovery. Define whether its final balance/history read is one composite operation. That guarantee must be explicit in the contract before clients depend on matching views. [B settlement sequence][b-settle] · [B finance contract][b-fin] |

## 9. Prioritized findings and required changes

| Severity and owner | Finding and impact | Required correction and evidence to close |
|---|---|---|
| **Release gate — Both, product owner and maintainers** | A Swing release can exercise shared expense workflows but cannot close FR-017–FR-019. Codex’s proposed non-Java production client code also needs review under Constitution II. | Record the desktop release role and web/Android/iOS scope. Approve a compliant client strategy or a constitution amendment if required. Keep SC-004 and SC-007 open until tested on the actual platforms. [Specification][spec-open] · [Constitution][constitution] · [B D01/D08][b-dec] |
| **High — Both, product owner and operations** | FR-008 and AC-008 differ on enablement. An implementation could accept a disabled group and suppress a notification that FR-008 requires. Removal between submission and delivery can also change the audience. | Align FR-008 and AC-008 after deciding enablement, intended recipients, channels and delivery criteria. Test disabled preferences, worker failure, duplicate delivery and recipient removal. [Specification][spec] · [A OD-4][a-plan] · [B D04][b-dec] |
| **High — A, finance and persistence reviewers** | Repeating equal quotas lack an exact calculation procedure. Approval and settlement do not specify one common serialization protocol for the same pair. Races can otherwise leave a projection or overpayment check based on stale state. | Use exact smallest-unit quotient/remainder arithmetic and an explicit shared lock or equivalent serializable protocol. Prove the protocol for new pairs, debt direction reversal, simultaneous approval/settlement and a fault before commit. [A financial design][a-arch] · [B data model][b-model] |
| **High — B, API and data reviewers** | B’s design says the watermark prevents mixed revisions. The contract only requires a minimum, so separately read views can still disagree under concurrent updates. | Define a same-revision snapshot token or composite read for related views. Specify snapshot lifetime, authorization and recovery on expiry. Test interleaved revisions across the supported clients. [B design, lines 51–57][b-watermark] · [B identity/groups contract][b-id] |
| **High — Both, reporting owner** | A leaves date-filtered balance semantics open. B’s status filter affects expense detail while approved subtotals can still include expenses outside that selection. Both cases can make a user misinterpret report totals under FR-016 and AC-013. | Define each total’s scope, including date basis, selected status, carry-in, period movement and closing balance. Give independently scoped metrics explicit names. Test inclusive boundaries, pending-only selection, backdated approval and empty results. [A reporting design][a-arch] · [B finance/report contract][b-fin] |
| **Medium — Both, product and domain reviewers** | FR-013 and FR-020 depend on whether reciprocal debts are netted and who may settle. If A owes B 8.00 and B owes A 3.00, gross directed debts and a net 5.00 debt yield different overpayment decisions. A removed debtor can retain debt while losing settlement access. | Approve gross or signed-net pair semantics, eligible payment recorders and historical access. Add a reciprocal-debt example and a departed-member settlement case to the specification and tests. [Specification][spec] · [A model][a-model] · [B D05][b-dec] |
| **Medium — A and B, UML and contract reviewers** | A has a mandatory-receipt diagram multiplicity and an inconsistent replay/notification sequence. Both class diagrams need exclusive financial source relationships. B’s under-lock replay path is terse in its diagrams. | Fix multiplicities and source constraints, draw replay and outbox paths explicitly, and review rendered PlantUML against contracts and prose. [A class diagram][a-class] · [A sequence][a-approval] · [B class diagram][b-class] · [B sequence][b-approval] |
| **Medium — Both, product owner and QA** | The checklist’s testability item remains open. Each design makes provisional choices about approval eligibility and supported currencies, and the performance and usability plans still need representative test conditions. | Record approved policies and acceptance fixtures. Confirm test scales, performance workload, accessibility checks and the first-time usability cohort. Revisit the checklist after those criteria can be tested. [Readiness checklist][checklist] · [A plan][a-plan] · [B decisions][b-dec] |

## 10. Recommended design and sign-off sequence

1. **Adopt the working baseline.** Use B’s exact allocator, frozen approval snapshot, atomic finalization, settlement transaction and validation fixtures. Carry forward A’s provider-owned identity boundary and OpenAPI structure. [B model][b-model] · [B verification][b-val] · [A identity][a-id] · [A API][a-api]
2. **Resolve product decisions.** Record Swing’s role and the platform plan, approver eligibility, supported currencies, notification enablement and failures, reciprocal-debt and former-member policy, and report filter semantics. Obtain maintainer approval for the production client language strategy. [Specification, Open Questions][spec-open] · [A plan][a-plan] · [B decisions][b-dec]
3. **Publish one reconciled contract.** Define identity ownership, actor authorization, version checks, replay and error behavior, common locking, same-revision reads, and report metrics. Align the data model and PlantUML with that contract. [A API][a-api] · [B expense contract][b-exp] · [B finance contract][b-fin]
4. **Collect implementation evidence before acceptance.** Run JUnit 5 unit and integration tests, database race and rollback tests, unauthorized resource tests, rendered UML review, keyboard and label checks, usability observation, representative load tests and cross-client end-to-end checks. Close requirements with results tied to the FR, NFR, AC and SC identifiers. [Constitution][constitution] · [A quickstart][a-quick] · [B validation][b-val]

[customer]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/UserRequirement.md
[constitution]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/.specify/memory/constitution.md
[spec]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/specs/001-shared-expense-management/spec.md
[spec-clar]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/specs/001-shared-expense-management/spec.md#clarifications
[spec-open]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/specs/001-shared-expense-management/spec.md#open-questions
[spec-trace]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/specs/001-shared-expense-management/spec.md#requirement-to-acceptance-traceability
[checklist]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/specs/001-shared-expense-management/checklists/requirements.md
[brief]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/prompts/README.md
[review-prompt]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/prompts/03-CHATGPT-REVIEW-PROMPT.md
[a-root]: https://github.com/jinuka-t/LAB06_SplitSmart/tree/3d6a9d5762c680884a6615e3ce611b7d552121d7/specs/001-shared-expense-management
[b-root]: https://github.com/jinuka-t/LAB06_SplitSmart/tree/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex
[a-arch]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/3d6a9d5762c680884a6615e3ce611b7d552121d7/specs/001-shared-expense-management/architecture.md
[a-plan]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/3d6a9d5762c680884a6615e3ce611b7d552121d7/specs/001-shared-expense-management/plan.md
[a-quick]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/3d6a9d5762c680884a6615e3ce611b7d552121d7/specs/001-shared-expense-management/quickstart.md
[a-model]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/3d6a9d5762c680884a6615e3ce611b7d552121d7/specs/001-shared-expense-management/data-model.md
[a-trace]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/3d6a9d5762c680884a6615e3ce611b7d552121d7/specs/001-shared-expense-management/traceability.md
[a-api]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/3d6a9d5762c680884a6615e3ce611b7d552121d7/specs/001-shared-expense-management/contracts/openapi.yaml
[a-id]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/3d6a9d5762c680884a6615e3ce611b7d552121d7/specs/001-shared-expense-management/contracts/identity.md
[a-component]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/3d6a9d5762c680884a6615e3ce611b7d552121d7/specs/001-shared-expense-management/diagrams/component.puml
[a-class]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/3d6a9d5762c680884a6615e3ce611b7d552121d7/specs/001-shared-expense-management/diagrams/domain.puml
[a-approval]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/3d6a9d5762c680884a6615e3ce611b7d552121d7/specs/001-shared-expense-management/diagrams/expense-approval.puml
[a-settle]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/3d6a9d5762c680884a6615e3ce611b7d552121d7/specs/001-shared-expense-management/diagrams/settlement.puml
[b-arch]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/architecture.md
[b-design]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/design.md
[b-watermark]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/design.md#L51-L57
[b-model]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/data-model.md
[b-dec]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/decisions.md
[b-val]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/validation.md
[b-worked]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/validation.md#worked-expectations-manual-reasoning-not-executed-tests
[b-trace]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/traceability.md
[b-check]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/review-checks.txt
[b-id]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/contracts/identity-groups.md
[b-exp]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/contracts/expenses.md
[b-fin]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/contracts/finance-reports.md
[b-component]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/diagrams/component.puml
[b-class]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/diagrams/class.puml
[b-approval]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/diagrams/expense-approval.puml
[b-settle]: https://github.com/jinuka-t/LAB06_SplitSmart/blob/ed54f53808ac8acbd938c26cb8378089032b785d/design-comparison/codex/diagrams/settlement.puml
