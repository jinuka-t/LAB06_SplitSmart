# Quickstart: Planned Validation Scenarios

This is a future validation guide, not a claim that a runnable application currently exists. At source commit `b2a94af0105094dc14fce245ebf8e733c959a689`, the repository has no Maven project, source tree, or test suite.

## Planned prerequisites

- JDK 21 and Maven, matching the project constitution.
- Once implementation exists: PostgreSQL test instance, configured OIDC test provider, private receipt test storage, and test-only notification adapter.
- JUnit 5 and API/E2E test dependencies declared by the eventual Maven modules.
- Do not use real credentials, production receipt data, or production notification targets in tests.

## Commands after implementation

The following are proposed commands for the target Maven layout and cannot run against the current repository:

```powershell
mvn -pl backend,desktop -am test
```

After implementation exposes integration profiles:

```powershell
mvn -pl backend -P integration verify
mvn -pl backend -P api-contract verify
mvn -pl backend -P load-test verify
```

The exact profile names and test harness commands must be aligned with the eventual POM; they are not current commands. PlantUML rendering can be added to CI after choosing a pinned PlantUML distribution; no renderer is currently configured.

## Acceptance validation scenarios

### 1. Registration, invitation, and authorization (AC-001, AC-002, AC-018, NFR-001)

1. Register two test accounts using the configured identity provider; verify email and sign in.
2. Create a group as account A and invite account B.
3. Before B accepts, attempt to read group and receipt resources as B; expect denied responses and no private data.
4. Accept as the invited identity; verify B can access group content permitted by membership.
5. Recover A's password, set a replacement, and sign in; verify one account cannot fetch another's private records.

**Expected**: Invitation acceptance is the membership boundary; identity-provider verification/recovery works; all cross-account/group authorization checks deny unauthorized reads and writes.

### 2. Split, approval, and pairwise ledger (AC-003–AC-007, AC-019–AC-021, SC-001, SC-002)

1. Create a group with test currency configured to a known scale and at least three members.
2. Submit equal and percentage expenses with participant order deliberately different from member ID order; set payer separately and include a case where payer is a participant.
3. Verify zero/negative amounts, empty participants, invalid percent bounds, and percentages not totaling exactly 100% are rejected without a pending expense.
4. Use totals whose exact quotas leave tied fractional units. Verify remainder units follow participant entry order and saved shares sum exactly to expense total.
5. Verify pending expense has no balance posting; reject another expense and verify no balance effect; final-approve a valid expense.
6. Retry or race the final approval; verify exactly one set of ledger postings and one balance effect.

**Expected**: Only final approved expense is included; other participants owe their shares to the selected payer; payer owes nothing to self; all totals reconcile at configured currency scale.

### 3. Settlement and retries (AC-009–AC-011, FR-020, SC-003)

1. Read a member pair's current directed balance and submit a positive payment not exceeding it.
2. Verify payment history contains one accepted record and the matching balance is reduced.
3. Submit an overpayment and a zero/negative payment; verify each is rejected with no accepted history record or balance change.
4. Race two payments whose combined amount exceeds the outstanding balance; retry a timed-out successful request with the same idempotency key.

**Expected**: At most the current amount owed can be recorded; retries do not duplicate; a competing overpayment fails without changing state.

### 4. Reports, dates, and notifications (AC-008, AC-012, AC-013)

1. Seed approved, pending, rejected expenses and payments on dates before, on, and after the inclusive range.
2. Request expense, balance, and payment summaries with group/member filters and date boundaries.
3. Submit an expense and verify other eligible members receive one in-app notification while submitter is excluded. Simulate downstream channel failure.

**Expected**: Reports include only matching eligible records; pending/rejected records are absent from settled totals; boundary dates are included; notification-provider failure does not roll back a committed expense and remains retryable. Final expectation for disabled notifications waits on OD-4.

### 5. Client accessibility and consistency (AC-014–AC-017, NFR-004, NFR-005, SC-004, SC-007)

1. For each implemented client, use keyboard only through account, expense, approval, balance, and payment flows; inspect focus order, visible focus, and control labels with the platform's accessibility tools.
2. Write and approve an expense and record a payment from one client; wait for its confirmed completion; read approval state, balances, payment history, and report totals from every other supported client.

**Expected**: Primary flows are keyboard-operable and controls identify their purpose; confirmed shared data is identical across supported clients. A Swing-only MVP cannot satisfy web, Android, or iOS criteria.

## Performance and diagram checks

- **NFR-002 / SC-006**: Once service and representative data exist, run the defined workload with 100 concurrent active users across account, group, expense, balance, payment, and report interactions. Record response-to-visible-result latency; pass only if at least 95% complete within two seconds. Define warm-up and request mix before running.
- Render the `.puml` files with the pinned PlantUML version and manually review diagram/prose consistency before accepting design changes.

## Current validation status

Only planning inputs and generated documentation were inspected. No application command, test, API scenario, performance workload, accessibility audit, or PlantUML render was run because the application/build tooling is not present.
