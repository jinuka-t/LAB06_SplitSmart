# Proposed contracts: expenses, review and receipts

Apply [common envelope, authorization and retry rules](identity-groups.md). Currency/unit validation and persisted entry order follow [data model](../data-model.md#money-representation-and-allocation). These are proposals only.

## Receipt operations

- `POST /groups/{g}/receipts`: authenticated active member, multipart `image`; validate actual supported image and configured limits. Returns 201 `{receiptId,state:"STAGED",expiresAt}` only after durable bytes and staging metadata exist. Errors 413 RECEIPT_TOO_LARGE, 415 RECEIPT_TYPE_UNSUPPORTED, 422 IMAGE_INVALID, 503 STORAGE_UNAVAILABLE. Key digest includes content digest. Staging grants no access outside uploader/group.
- `GET /groups/{g}/expenses/{e}/receipt`: active member with expense access; returns authenticated image stream, safe MIME, no storage path, private/no-store caching policy. Missing receipt 404 NOT_FOUND; missing/corrupt stored bytes 503 RECEIPT_UNAVAILABLE. A former member cannot use an old link. STAGED receipt may be retrieved only by uploader before attachment/expiry via `/groups/{g}/receipts/{id}`; all paths verify ownership.

## Submit and query

`POST /groups/{g}/expenses` input:

| Field | Constraint |
|---|---|
| amount,currencyCode | positive decimal string, exactly smallest supported unit, group currency |
| expenseDate,description | valid LocalDate, nonblank description (provisional max 2000 chars) |
| payerId | exactly one active group member, independent of submitter and participants |
| splitMode | EQUAL or PERCENTAGE |
| participants | ordered nonempty array `{memberId,percentage?}`; unique active members; position is entryOrdinal |
| receiptId? | submitter-owned STAGED image, same group, unexpired |
| supersedesExpenseId? | same submitter/group; prior REJECTED or WITHDRAWN, no prior approved correction |

Submitter must be authenticated active member. No `actorId`, `status`, supplied shares or supplied balance deltas accepted. EQUAL forbids percentage fields; PERCENTAGE requires a percentage per participant. Validation errors 422 AMOUNT_NOT_POSITIVE, AMOUNT_PRECISION, CURRENCY_MISMATCH, PRECISION_UNSUPPORTED, PARTICIPANTS_EMPTY, PARTICIPANT_DUPLICATE, MEMBER_INACTIVE, PERCENT_OUT_OF_RANGE, PERCENT_TOTAL_NOT_100, POLICY_NOT_READY, RECEIPT_NOT_READY, INVALID_SUPERSESSION. Any validation failure leaves no approvable expense, no approval, no notification event and no ledger entry. Receipt may remain staged for retry.

201 response `{expenseId,status:"PENDING",version,reviewCondition:"READY",payerId,participants:[{memberId,entryOrdinal,percentage?,share}],policySnapshot,receiptId?,watermark}`. Transaction persists expense, ordered shares, frozen policy and submission outbox; does not change financial sequence/balances except group read watermark advances for saved state. Financial sequence and group response watermark are separate monotonic concepts; response watermark advances for all saved group changes, ledger sequence only for financial events.

`GET /groups/{g}/expenses/{e}` returns immutable expense details, current status/version, review condition READY/BLOCKED with reason, ordered allocations and decisions, supersession links, receipt reference and watermark. `GET /groups/{g}/expenses?status=&from=&to=&memberId=` returns paginated details authorized to active members; date boundaries inclusive, reject unknown status. Pending/rejected details are visible but never financial totals.

## Review commands

`POST /groups/{g}/expenses/{e}/decisions` input `{expectedVersion,stageOrdinal,decision:"APPROVE"|"REJECT",reason?}`. Requires active group member in frozen current-stage eligible IDs, default actor != submitter. REJECT requires nonblank reason. Errors: 403 NOT_APPROVER/SELF_APPROVAL_FORBIDDEN; 409 VERSION_CONFLICT, STATE_CONFLICT, STAGE_NOT_CURRENT, ALREADY_DECIDED; 422 POLICY_BLOCKED for APPROVE only. An active snapshot-authorized current-stage approver may REJECT even if other reviewer removals make the quorum impossible. Return 200 `{expenseId,status,version,currentStage?,reviewCondition,decisions,posted:boolean,watermark}`. Intermediate approval `posted=false`, no debt writes. Final approval `posted=true`, one finalization and all nonself positive-share postings in transaction; no debt for payer's own share. Approving a sole-payer participant expense still produces finalization with no pair postings.

Check order: authenticate and authorize visibility -> request-key replay -> lock group/expense -> recheck request-key replay under lock -> version/state/stage/eligibility validation -> decision -> advance stage or terminal status -> optional final postings/projection -> operation result -> commit. Reject terminal state never posts. Same-key retry returns original result; a different key from the same already-decided reviewer is ALREADY_DECIDED if version current, otherwise VERSION_CONFLICT. Concurrent approve/reject cannot both commit a terminal transition.

`POST /groups/{g}/expenses/{e}/withdraw` input `{expectedVersion}`: submitter only, PENDING -> WITHDRAWN, returns status/version/watermark; other terminal states STATE_CONFLICT. A blocked expense can be withdrawn, then resubmitted under current policy. Rejected corrections use a new submission and key; retain the rejected record and reason. No update/delete/force-approve endpoint for approved expenses.


