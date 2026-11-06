# Data model proposal

See [design](design.md) for transitions/permissions and [contracts](contracts/identity-groups.md) for serialization. Identifiers are opaque UUID strings, server generated, never access credentials. Dates are ISO LocalDate; audit instants are UTC. SQL foreign keys include group ownership where applicable; entities cannot reference another group's member, policy, receipt or expense.

## Entities and cardinalities

| Entity / key | Main fields and constraints |
|---|---|
| Account / accountId | normalizedEmail unique, passwordHash, UNVERIFIED or VERIFIED, verifiedAt; private profile |
| SecurityToken / tokenId | accountId FK, kind VERIFY/RESET, digest unique, expiresAt, consumedAt; many per account, atomic one-time use |
| Session / sessionId | account FK, opaque token digest, expiry/revokedAt; never sent in financial DTO |
| Group / groupId | name, immutable currencyCode/unitScale, policyVersion, readWatermark, financialSequence, version |
| Membership / groupId+accountId | role MEMBER/MANAGER, ACTIVE/REMOVED, acceptedAt/removedAt, version; one retained identity per group/account |
| Invitation / invitationId | group, targetEmail, tokenDigest, state, expiry, inviter, version; pending invite not membership; at most one pending group/email invite |
| ApprovalPolicy / groupId+version | immutable version; 1..N ordered Stage records; explicit allowSubmitterApproval flag |
| Stage / policyVersion+ordinal | requiredCount >=1; 1..N eligible member references for configured policies, requiredCount <= eligible count; initial NOT_READY policy may have zero eligible members |
| Expense / expenseId | group, submitter, independent payer, Money, expenseDate, description, splitMode, state, version, policy snapshot, supersedesExpenseId nullable |
| Share / expenseId+participantId | participant FK, entryOrdinal unique per expense and >=0, percentage nullable for EQUAL, amount >=0; 1..N per expense |
| ReviewStageSnapshot / expenseId+ordinal | copied eligibility and requiredCount, not a live policy reference |
| ApprovalDecision / expenseId+stage+actor | APPROVE/REJECT, decidedAt; one immutable decision per reviewer/stage; rejection reason required |
| Finalization / expenseId | unique posting marker and ledger sequence even when expense produces no nonself debt |
| LedgerEntry / entryId | group, ordered pair IDs, signed Money delta, eventType EXPENSE/PAYMENT, effectiveDate, recordedAt, sequence, sourceId, participantId where expense |
| PairBalance / groupId+lowId+highId | signed debt, currency, lastSequence; lowId < highId; low owes high when positive |
| Payment / paymentId | group, sender != recipient, amount >0, paymentDate, recordedAt, ledgerSequence, actor; immutable history |
| Receipt / receiptId | group, uploader, private storageKey, digest, MIME, bytes, STAGED/ATTACHED/EXPIRED, expiry, optional expense FK unique |
| OutboxEvent / eventId | type, group, sourceId, captured recipients, attempt state/times/error, unique event source/type |
| Notification / notificationId | eventId+recipient unique, expense/group link, createdAt/readAt; private inbox |
| OperationResult / actorId+operation+key | canonical request digest, result/reference, committedAt, watermark; same key/different payload rejected |

Group has many memberships, expenses, policies and payments. Account has many memberships; member identity remains after removal. Expense has exactly one payer and submitter, ordered shares, frozen review stages, zero/one receipt, many decisions and zero/one finalization. One approved expense produces zero..N nonself positive-share postings. One payment produces exactly one posting. Reports are computed DTOs, not mutable financial entities.

## Money representation and allocation

All monetary inputs, intermediate calculations, stored domain values and outputs use BigDecimal (decimal strings on wire, SQL NUMERIC). Never use float/double. Money is currency plus value. Provisional storage limit NUMERIC(24,6); supported unit scales must be <=6 and group total <=18 integer digits. Reject unsupported scale/currency and overflow before persistence. This storage envelope is a capacity decision to review, not a list of customer currencies. Provisional MVP currency USD with scale 2; currency registry also has test-only JPY scale 0 and KWD scale 3 to validate the general allocator. Product must approve real supported currencies (D03); changing a group's currency after financial records exist is forbidden. No FX.

Require positive amount exactly representable at the configured scale; normalize with setScale(scale, UNNECESSARY). Reject 1.001 in a scale-2 currency; do not silently round input. Percentages are BigDecimal, inclusive [0,100], exact sum compared with 100 using compareTo, not equals and not a tolerance. Provisional max 6 fractional percentage digits and 24 significant digits; excess gets PRECISION_UNSUPPORTED before submission, subject to product approval. Accepting 33.33+33.33+33.34 is valid; 33.33 three times is invalid.

Exact largest-remainder algorithm, avoiding finite-precision division ranking:

1. Convert amount to integral smallest-unit count U using BigDecimal movePointRight(scale), requiring no fractional unit.
2. Equal split uses numerator U for every participant, common denominator participant count. Percentage split uses numerator U * percentage and common denominator 100. These products are exact BigDecimal operations with no MathContext rounding.
3. Each floor-unit share is divideToIntegralValue(denominator) for nonnegative numerators. Remainder is numerator - floor * denominator. Compare remainder numerators directly because denominator is common.
4. R = U - sum(floor units) is integral and less than participant count. Assign one unit to the first R participants ordered by descending remainder then original entryOrdinal ascending.
5. Convert units back to currency scale; persist all shares including zero and payer share. Sum shares must equal entered amount exactly. Generate debt only for nonpayer positive shares. Do not redistribute the payer's share among other participants.

BigDecimal suffices even when 1/3 is repeating: no approximate division is used for remainder ordering. No independent rounding of each participant's amount, no floating conversion, no UUID sort tie-break.

Group readWatermark advances transactionally on every saved group change (including pending expense and review changes); financialSequence advances only on financial events. They are distinct fields. Completion uses readWatermark; ledger reconciliation uses financialSequence.

## Ledger invariants and concurrency

For canonical pair (low, high), expense debtor->creditor adds +share if debtor=low, else -share. Payment sender->recipient subtracts amount if sender=low, else adds amount. Projection is sum of signed entries. Each pair has only one signed value, so reciprocal debts net. Display negative values as positive with debtor/creditor swapped. No self entries. Group sums of signed member positions equal zero. A payer outside participants is credited the whole expense; a participating payer is credited only nonself shares.

Unique finalization(expenseId), unique expense posting(expenseId,participantId) and unique payment posting(paymentId) enforce one financial effect. Pending/rejected/withdrawn expenses have no finalization or ledger entries. Only finalization transaction creates APPROVED. Payment history insert, posting, projection and operation result are indivisible. Constraint failures roll back, not partially continue. Group financial lock also protects approval, payment, member removal, and policy readiness checks; all transaction paths acquire it before entity/pair rows to avoid lock inversion. Registration uses email uniqueness; invite acceptance uses invitation/member uniqueness. Retry transient transaction conflicts with bounded attempts using same command key.

Store immutable financial records indefinitely pending an approved retention/privacy policy. Removal is not deletion. Credential/session erasure and financial retention must be designed together before any account deletion feature. At-rest encryption, encrypted backups, service-only database credentials, masked logs and audit access controls are operational requirements proposed for security review. A full ledger rebuild is a controlled maintenance process under write exclusion; mismatch blocks financial writes until investigated. Migration and restore acceptance must verify receipt availability, foreign keys, projection reconciliation and idempotency preservation.


