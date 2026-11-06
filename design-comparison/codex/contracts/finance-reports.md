# Proposed contracts: financial views, settlements, inbox and reports

Apply [common contract rules](identity-groups.md). All endpoints are proposals. Group queries require active membership, including at each page/download. Private notification listing requires only authenticated recipient. Group financial visibility is shared accepted-group information, not access to another account's private identity information.

## Pairwise balances and settlement

`GET /groups/{g}/balances?memberId=` -> `{currencyCode,asOfWatermark,ledgerSequence,pairs:[{memberA,memberB,debtorId?,creditorId?,amount}]}` with paginated pair rows and complete count. Amount nonnegative decimal string, no self-debt, historical member display identities retained. Filter optional but must name a retained group member. At zero debtorId/creditorId absent. Return current net pair positions, not a debt-minimized graph. No cross-group/currency sum.

`POST /groups/{g}/payments` input `{senderId,recipientId,amount,currencyCode,paymentDate}`; idempotency key mandatory. Sender must equal authenticated active member. Recipient different retained group member (may be removed); sender must owe recipient a positive current net balance. Date LocalDate, positive exact-unit amount in group currency. Transaction: lock group financial row -> recheck same-key result -> read pair current debt -> validate -> insert immutable Payment -> append unique signed settlement posting -> update pair -> persist response -> commit. No external transfer is performed.

201 -> `{paymentId,senderId,recipientId,amount,currencyCode,paymentDate,recordedAt,pairBalanceAfter,watermark,ledgerSequence}`. Domain errors 422 AMOUNT_NOT_POSITIVE, AMOUNT_PRECISION, CURRENCY_MISMATCH, SELF_PAYMENT, NO_DEBT, OVERPAYMENT, RECIPIENT_NOT_IN_GROUP; 403 SENDER_NOT_ACTOR; 409 IDEMPOTENCY_CONFLICT. Invalid/concurrent overpayment makes no history/posting/projection change. For opposite-direction debt return NO_DEBT, never invert sender automatically. A removed sender receives NOT_FOUND for group access; reacceptance needed under provisional D05.

`GET /groups/{g}/payments?from=&to=&memberId=` -> paginated immutable history with IDs, sender, recipient, amount, dates, watermark. Inclusive paymentDate filtering; no zero-balance cleanup. `GET /groups/{g}/payments/{p}` returns same record after ownership check. No delete/edit/reversal endpoint in this release.

## Notifications

`GET /notifications?unreadOnly=&cursor=` -> own `{notificationId,expenseId,groupId,createdAt,readAt?,linkAvailable}` rows; redact expense/group text if membership removed. `POST /notifications/{id}/read` -> readAt (first read preserved), recipient only; repeated safe. No API to disable mandatory in-product notifications until FR-008/AC-008 decision. Submission audience is active members excluding submitter, captured transactionally; worker deduplicates by event/recipient, retries transient failures, audits suppression after membership removal. Acceptance of an expense does not claim delivery succeeded. Outbox failure/dead letters visible to operators through an internal restricted diagnostic interface, never other users' inboxes. Channels and delivery SLO provisional D04.

## Date-filtered reports

`GET /groups/{g}/reports?from=&to=&memberId=&expenseStatus=&cursor=` -> 200:

- `criteria`, `currencyCode`, `generatedAt`, `watermark`, `snapshotToken`, `dateBasis:{expenses:"expenseDate",payments:"paymentDate",approval:"currentAtSnapshot"}`;
- `expenses:{rows,totalApprovedGrossAmount,totalApprovedSelectedShareAmount}` (gross amount counted once per matching expense; participant selection affects share total, not gross);
- `payments:{rows,totalPaid}` (each matching payment counted once);
- `balances:{pairs:[{opening,movement,closing,memberA,memberB}],basis:"signedPairDebt",carryInExcludedFromActivityTotals:true}`.

Rows are paginated but aggregates span the complete snapshot selection. `expenseStatus` values ALL/PENDING/REJECTED/APPROVED/WITHDRAWN affect expense detail only; displayed financial totals explicitly remain approved-only, and settlement history remains independent of expense filter. Default ALL detail with approved-only financial subtotals. `memberId` matches expense payer/participant, payment sender/recipient and incident balance edges; selected share total sums participant's own share (zero if payer only), while ledger movement sums that member's incident debt edges. These are different labelled metrics, not interchangeable totals. Pending/rejected shares may appear only as nonfinancial detail. No receipt bytes, account secrets, descriptions of inaccessible groups or mixed-currency aggregates.

`from` and `to` inclusive and independently optional. `from=to` valid. Reversed date range -> 422 INVALID_DATE_RANGE; malformed date or unsupported filter -> 400 INVALID_REQUEST. No matching activity -> zero period totals/empty rows, with retained opening/closing positions if carry-in exists. Opening is matching ledger entries before from; movement is matching entries within from/to; closing is their sum. Thus a date report's closing is a reconstructed effective-date position and may differ from today's current balances. Empty unbounded account/group yields all zeros. Approval created after expenseDate is included only once currently approved at snapshot, even for a past range; label this prominently. Do not claim a historical report is immutable: snapshot token is required for stable pagination, and a later report may incorporate later approval/backdating.

Expired snapshot token -> 409 SNAPSHOT_EXPIRED, restart whole report; never combine pages from different snapshots. Receipt fetches are separate authorized operations. Export/custom criteria beyond date/member/status/group remain future decisions, not implied supported filters.

