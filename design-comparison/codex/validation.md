# Validation plan and executed design review

This is a design-only run. No Java application, test suite, Maven build, UI, load environment or supported future clients were implemented or tested. Planned tests below are not passing evidence. Human review remains required by constitution V.

## Planned verification catalog

Use Java 21, Maven and JUnit 5 for unit/application/integration tests through the eventual project's Maven configuration. Planned execution after implementation: `mvn test` for unit tests and `mvn verify` for configured integration/contract tests. These commands were not run and no new build configuration is supplied. Database tests must exercise real chosen SQL constraints and transactions, not repository mocks for concurrency. Keep canonical request/result fixtures versioned for every client.

| ID | Planned level and coverage | Expected evidence / pass criterion |
|---|---|---|
| T01 | JUnit 5 IdentityService + SQL/mail-adapter integration; register/verify/login/recovery | Unverified login blocked, expiry and concurrent single-use token consumption, generic recovery response, new password works and old sessions invalidated; mail retry does not bypass verification |
| T02 | Service/HTTP authorization matrix | Different account/group, invitation-only and removed-member accesses denied on every read/write/list/receipt/report/page; principal spoof fails; no token/credential leakage |
| T03 | Group/invite/policy integration | Target-only acceptance once, expiration/revocation, last manager protection, role changes, policy readiness, removal/rejoin without lost history; current policy edits do not rewrite frozen policy |
| T04 | JUnit 5 input validation + endpoint integration | Required fields, positive amounts, independent payer outside participants, empty/duplicate/nonmember participants, foreign receipt/currency, precision overflow; rejected requests create no approvable expense |
| T05 | JUnit 5 parameterized/property-style generated allocator fixtures | Exact unit totals, largest remainder ties in original order, 0/100 and invalid percentages, no floating-point conversion, no self-debt; scales 0/2/3/6; SC-001 100% |
| T06 | State-machine/service integration | One-stage MVP; ordered multi-stage/quorum full product; no self-approval by default, forbidden/stale decisions, authorized rejection even when another reviewer removal blocks quorum, reject/withdraw, corrected new submission, impossible reviewer snapshot; pending/rejected excluded |
| T07 | Concurrent SQL + fault injection | Same/different-key approval retries, race approve/reject/removal, transaction failure before/after finalization/projection, lost response after commit; exactly one finalization, no partial postings, SC-002 100% |
| T08 | Outbox/inbox integration + controlled worker failure | All other captured members, no submitter; duplicate delivery deduped, retry/backoff/dead-letter, removed recipient redaction/suppression, unread/read behavior; expense persists despite delivery failure; D04 acceptance unresolved |
| T09 | Ledger/payment SQL integration and concurrency | Pair netting/reversal, no self edge, valid partial/full settlements in retained history; zero/negative/wrong direction/overpayment rejected; two competing payments serialize; same-key retry once; SC-003 100% |
| T10 | Snapshot report integration | Expense/payment/three balance values; inclusive endpoints, one-day/unbounded/reversed/no-match ranges; effective-date vs approval time; member/status/group filtering, carry-in separate, snapshot pagination, no pending/rejected financial totals |
| T11 | Manual + client-specific accessibility tooling | Keyboard-only register/expense/approve/balance/payment/recovery, logical tab order/focus, labels and error association, visible focus, text scaling/contrast, no color-only status; Swing accessibility bridge + screen reader; browser/native equivalents later |
| T12 | Representative load test with client timing | 100 simultaneously active authenticated users; >=95% results rendered <=2s for account/group/expense/balance/payment/report interactions; failures/timeouts counted as failures; report aggregate and per-category latency/error counts |
| T13 | Cross-client end-to-end contract fixtures | Swing + future web/Android/iOS reuse account/group/expense/approval/balance/payment/report flows; after saved completion/read watermark 100% status, shares, balances, history and report totals agree; offline/timeouts never claim completion |
| T14 | Observed first-use usability | Provisional cohort >=20 new participants, same task/instructions, no help; >=90% submit valid shared expense and find resulting balance; record numerator/denominator, failures and platform; owner approves procedure |

T12 provisional workload proposal (D10): 10-minute warmup, 30-minute measurement, 100 active sessions, 10,000 groups/100,000 expenses/50,000 payments, small and hot groups, 20% account/group, 30% expense/approval, 20% balance, 15% payment, 15% report interactions. Hardware/network, dataset representativeness, think time, authentication/mail timing, receipt payload mix and indexing must be recorded and approved. Start timer at user action, end at visible result; external verification waiting time measured separately and not hidden as successful instant account completion. No numbers here are measurements. Server spans help diagnose but cannot substitute for rendered-client latency. Index group/date/status, membership, pair and outbox queries; paginate, measure hot-group lock contention and receipt uploads. Report both global threshold and each category so slow reports cannot be hidden.

## Worked expectations (manual reasoning, not executed tests)

All examples use scale 2 unless stated; participants are listed in entry order.

| Case | Exact expected result |
|---|---|
| USD 10.00 EQUAL [A,B,C], payer A | units 1000 / 3 -> floors 333 each, one tied remainder unit to A. Shares A 3.34/B 3.33/C 3.33; B owes A 3.33, C owes A 3.33; no A->A debt. |
| USD 0.01 EQUAL [C,A,B], payer P outside list | shares C .01/A .00/B .00; only C owes P .01. Sorting IDs would be wrong. |
| USD 0.05 PERCENT [A 50,B 30,C 20], payer P | ideal units 2.5/1.5/1; floors 2/1/1; one unit to A by tied entry order. Shares .03/.01/.01, total .05. |
| USD 10.00 [33.33,33.33,33.34] | units 333.3/333.3/333.4; one remaining unit to third -> 3.33/3.33/3.34. Three 33.33 inputs total 99.99, rejected. |
| USD 1.00 [A 0,B 100], payer A | shares .00/1.00, B owes A 1.00; no exclusion/redistribution error for zero share. |
| USD .01 sole participant/payer A | share .01, zero pair postings but exactly one finalization after approval. |
| Invalid amount/percentage | 0, negative, .001 USD, -1%, 101%, 99.999% total rejected with field reason, no approvable expense. 100.0 compares exactly equal to 100. |
| Scale fixtures | JPY 1 / 3 -> [1,0,0]; KWD .001 / 3 -> [.001,.000,.000]. These are test currencies only until D03 approval. |
| Intermediate/final review | Expense owes B->A 3.33 only after final required stage; earlier approvals/rejection leave balance unchanged. Replayed final request returns same result, not 6.66. |
| Reciprocal obligations | A owes B 12.00 and B owes A 5.00 -> current A->B 7.00; A pays B 2.00 -> 5.00; payment remains in history. |
| Concurrent payments | Debt 10; two distinct payments of 6 race -> one succeeds, one OVERPAYMENT, debt 4 and one history record. Same-key two attempts -> one payment of 6, repeated result. |
| Report date boundaries | Approved expense dated Nov 1, approved Nov 5, payment dated Nov 3: Nov 1..3 report taken Nov 5 includes both by effective date. Report taken Nov 4 excludes then-pending expense. Nov 3..3 includes only payment activity; prior debt shown separately as opening. |
| Report member selection | P pays 9 for [A,B,C] equally; filter A -> approved gross 9, selected share 3, incident debt A->P 3; filter P -> gross 9, selected share 0, incident credits total 9. All labels distinct. |
| No matches/carry-in | No rows within selected period -> zero expense/payment activity; earlier outstanding pair debt may still produce nonzero labelled opening=closing. Reversed range rejected. |
| Removal and notification failure | Removing reviewer blocks unfinished snapshot; no automatic posting. Removing historical participant preserves all amounts. Failed inbox worker retries without rolling back expense or claiming delivered status. |

## Self-review findings and executed checks

Executed design work: read all four full source files and full Common brief; recorded shared HEAD, last-change commits, SHA-256 hashes and empty per-source diffs; inspected applicable ancestor/output AGENTS.md locations (none found). Read no generated Spec Kit proposal. Git status was used for change awareness only. Shell access initially failed because workspace was denied, then authorized elevated reads/writes were used. Only this output directory was created/modified by this run.

Manual self-review covered names (Payment is the persisted settlement), financial and invitation states, independent payer, allocation/entry order, approval uniqueness/rollback, membership and receipt authorization, notification eventual failure, report financial/detail boundaries, retries/offline and future clients. Review identified the following points explicitly:

1. Customer platforms remain gaps in Swing; D01/D08 block any claim of full-product acceptance.
2. FR-008/AC-008 enablement discrepancy remains unresolved; always-on inbox is only D04's provisional default.
3. FR-021 recovery is included even though the MVP table's account range omits its later-numbered ID.
4. Frozen policy with departed reviewers needs explicit blocked handling; withdraw/resubmit is proposed rather than implicit reassignment.
5. Zero-debt final approval still needs a unique finalization marker; data model/contracts/sequence include it.
6. Reporting distinguishes gross expense, member share, pair debt and opening carry-in; dates are inclusive effective dates, with current approval at snapshot. D09 requires approval.
7. Group response watermark and financial ledger sequence are distinct; every saved group change advances watermark even when pending expenses do not post.
8. Group creation has no eligible review by default; manager configures policy after another member accepts. A one-person group can exist but cannot submit until policy ready.

9. Concurrent same-key requests must recheck the operation result after acquiring the serialization lock, before version validation. Common contract and financial workflows now state this; a uniqueness-race loser rolls back and reloads rather than applying effects again.

10. A blocked quorum prevents approval progress but must not remove an active eligible reviewer's right to reject. Prose, contract and sequence now distinguish these cases.

Document-only automated checks and their actual results are recorded in `review-checks.txt` after generation: requirement-ID inventory coverage, local Markdown links, diagram presence and provenance/scope checks. These checks do not prove semantic correctness or application behavior. PlantUML rendering was not executed: java/mvn were not found on PATH during inspection, and no renderer was installed/downloaded. UML source syntax receives text review only. JUnit, Maven, accessibility, load, usability, database concurrency, notification delivery, browser/mobile and cross-client tests were **not executed**. The source checklist remains unchecked on ambiguity/testability. Human decisions D01-D10 remain open.


