# Research: SplitSmart Shared Expense Management

**Source commit**: `b2a94af0105094dc14fce245ebf8e733c959a689`
**Requirements inputs**: unchanged from common-brief baseline `ba90a30667a1bc5683cf4cefc6836a2cf4a50019`.

Research resolves design choices where a defensible technical direction is needed. It does not resolve product-policy questions in the specification's open-question register. All selections below are proposals for human review, not approved requirements.

## Decision Records

### R-1. One service boundary for desktop and future clients

**Decision**: Use a versioned HTTPS/JSON API described with OpenAPI 3.1 and RFC 9457 problem details for errors. The Swing MVP and later web, Android, and iOS clients use the same application service and server-side authorization.

**Rationale**: This supports NFR-005's shared completed state, prevents clients from implementing separate financial rules, and allows the Swing client to remain a presentation layer. OpenAPI provides a client-neutral contract and can be reviewed independently of implementation.

**Alternatives considered**:
- Direct database access from clients: rejected because it exposes persistence credentials, bypasses server authorization, and makes cross-client consistency and transaction rules fragile.
- Separate business logic in each client: rejected because rounding, approval, and payment validation could diverge.
- GraphQL: not selected for this MVP; no evidence requires client-shaped query composition, and write-side financial invariants still need a single authoritative service.

**References**: [OpenAPI Specification](https://spec.openapis.org/oas/latest.html); [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html); [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html); [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html).

GraphQL and gRPC are viable alternatives when client-specific projections or typed RPC stubs are demonstrably more valuable than one interoperable HTTP contract; no such need is established in the current brief.

### R-2. Relational source of truth and atomic financial writes

**Decision**: Use PostgreSQL for shared account/group/expense/approval/payment records, immutable balance-affecting ledger postings, and a transactionally updated pairwise-balance projection. Keep the MVP as one deployable modular monolith.

**Rationale**: Expenses, approvals, group membership, and settlements are relational and require referential integrity and atomic state transitions. One database transaction can commit the final approval, ledger postings, balance projection, and notification-outbox event together. A relational database is a simpler fit than introducing eventual consistency across services.

**Alternatives considered**:
- Document database: rejected provisionally because relationships and cross-record invariants are central to these workflows. MongoDB supports multi-document transactions but notes their performance cost and recommends modeling to avoid unnecessary cross-document transactions.
- Event sourcing as the only persistence model: rejected for the first implementation because it adds projection/replay complexity; immutable ledger postings preserve the financial audit trail without making all domain state event-sourced.
- Client-local database as authority: rejected for shared accounts and permissions. A local cache may be added later but must never represent an unconfirmed write as complete.
- Local-first replication: not selected because the requirements do not ask for offline shared writes and replication introduces conflict and authorization rules; revisit only with an explicit offline product requirement.

**References**: [PostgreSQL transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html); [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html); [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/); [CouchDB replication and conflicts](https://docs.couchdb.org/en/stable/replication/intro.html).

### R-3. Desktop MVP persistence and future deployment

**Decision**: The Swing client is a thin remote client. Local development may run the API and PostgreSQL on the developer workstation; a production or pilot deployment uses a centrally reachable API and database. Do not put authoritative financial records or database credentials in the desktop install.

**Rationale**: Accounts, accepted invitations, group access, notifications, and shared balances require a common authority. This is true even if desktop is the only initial client. Future clients can then reuse the same data and access rules.

**Alternatives considered**:
- Embedded SQLite/H2 as the authoritative MVP store: rejected for a multi-account shared product because independent desktop copies cannot enforce shared authorization, approval ordering, or a single balance.
- Desktop-only local prototype: technically feasible, but would not exercise the account/invitation/notification contract and must be explicitly classified as a non-production prototype if chosen by the product owner.
- A local SQLite cache is technically viable for disposable UI state or approved drafts, but transactionality on one device does not solve cross-device conflict resolution or shared authorization.

**Consequence**: Local-first/offline writes are not included. The UI must report network failure and leave a write in an unknown/pending state until the server confirms it; retry uses the original idempotency key.

Swing HTTP and persistence work must run off the event-dispatch thread; UI state changes return to it. Java's `HttpClient` and `SwingWorker` are candidate JDK facilities, not extra product requirements.

**References**: [SQLite transactions](https://sqlite.org/transactional.html); [Java 21 `HttpClient`](https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpClient.html); [Java 21 `SwingWorker`](https://docs.oracle.com/en/java/javase/21/docs/api/java.desktop/javax/swing/SwingWorker.html).

### R-4. Identity and API authorization

**Decision**: Keep identity and authorization as distinct responsibilities. Use an OIDC-compatible identity provider boundary for email/password registration, email verification, sign-in, and recovery; the provider choice is not selected. The API validates the authenticated principal and authorizes every group/resource operation using current accepted membership and policy.

**Rationale**: Standards-based identity lets the desktop and future clients use an established authentication flow without making an untrusted client the authorization authority. Central API checks are required for NFR-001.

**Alternatives considered**:
- Implement and operate password storage/recovery in the business service: rejected provisionally due to credential-handling and lifecycle burden.
- Trust client-supplied user/group IDs: rejected; caller identity must come from the validated authentication context and every resource access must be checked.

**Open implementation detail**: Select an OIDC provider and client-flow configuration before implementation. This does not change the proposed resource API contract.

For Swing and other native clients, use an external browser with authorization code + PKCE and no embedded client secret. A web client may use an appropriate protected server session instead of exposing long-lived credentials to browser code.

**References**: [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html); [RFC 8252: OAuth 2.0 for Native Apps](https://www.rfc-editor.org/rfc/rfc8252.html); [RFC 9700: OAuth 2.0 Security Best Current Practice](https://www.rfc-editor.org/rfc/rfc9700.html); [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

### R-5. Transactional approval, ledger, and settlement

**Decision**: Treat a final approval as one idempotent database command. Under a transaction, verify pending status, policy stage, approver eligibility and version; persist the approval; when it completes the policy, create uniquely keyed ledger postings, update balance projection, and enqueue notifications. A payment is recorded only after an atomic current-balance check and ledger posting.

**Rationale**: Pending and rejected expenses must never enter balances, and concurrent duplicate approvals/payments must not post twice. A source ledger plus projection supports auditable history and fast balance queries. Use row locks or equivalent serializable conflict handling for a payment's relevant pairwise balance; retry only transaction conflicts, never business failures.

**Alternatives considered**:
- Recompute every balance from all historical records on every request: valid for a tiny prototype but grows more expensive and makes transaction races less explicit.
- Update a balance without recording a source posting: rejected because it loses traceability and can drift from expense/payment history.

Require a stable idempotency key for retriable mutations so a client timeout does not turn a safe retry into a duplicate financial action.

**References**: [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html); [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html); [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests).

### R-6. Money and deterministic allocation

**Decision**: Represent monetary values as `BigDecimal` at the declared currency scale. Normalize and validate on input; calculate exact fractional quotas; floor each quota to the currency unit; allocate the remaining units to greatest discarded fractional remainders, with persisted participant entry order as the tie-break. Persist calculated participant shares, split inputs, currency, and scale as the approved expense snapshot.

**Rationale**: This follows approved clarifications and NFR-003 while keeping calculations reproducible. Storing shares as well as inputs avoids a later currency-table change silently rewriting past expenses.

**Alternatives considered**:
- Binary floating point: prohibited by constitution.
- Implicit two-decimal rounding or independent HALF_UP rounding per participant: rejected because totals may not reconcile and currency precision is unresolved.
- Storing only integer minor units: useful for a known fixed currency set, but the open currency list makes explicit-scale `BigDecimal` the more direct policy-compatible proposal. Database columns must use exact `NUMERIC`, not floating-point.

**References**: [Java `BigDecimal`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html); [PostgreSQL numeric types](https://www.postgresql.org/docs/current/datatype-numeric.html).

### R-7. Notifications and receipt storage

**Decision**: Create notifications through a transactional outbox and deliver asynchronously through adapters. Keep an in-product notification record as the proposed minimum UX. Store receipt bytes outside the domain row behind a private storage adapter; expose only authorized, short-lived receipt retrieval.

**Rationale**: A database commit must not be reported as failed merely because an external notification provider is unavailable. The outbox records the intent atomically; delivery can retry and expose a failed state. Receipt access must be checked against group membership rather than relying on an unguessable URL.

**Alternatives considered**:
- Synchronous email/push send in an expense transaction: rejected because external failure would couple transport availability to expense submission.
- Public receipt URLs or inline receipt bytes on every expense response: rejected due to privacy and payload size.

**Product decision still open**: Channels, user preferences, retry/SLA, and whether notification disablement may suppress the notification required by FR-008 are unresolved. AC-008 says "with expense notifications enabled"; it is not silently reconciled here.

**References**: [AWS transactional outbox pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html); [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging); [Apple remote notification server setup](https://developer.apple.com/documentation/usernotifications/setting-up-a-remote-notification-server); [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

## Provisional Decisions and Unresolved Policy

| Question | Provisional technical treatment | Still needs |
|---|---|---|
| Swing MVP role | Functional desktop first-stage client, not full product; same shared API. | Product owner to choose prototype vs production release and acceptance scope. |
| Approver selection | Group policy stores authorized members and ordered stages; MVP has one stage; submitter self-approval disabled by default. | Product owner to confirm role/selection, self-approval, and eligible approver rules. |
| Currency | One currency per group per spec assumption; exact scale is explicit and historic expense scale is snapshotted. | Product owner/finance to select supported currencies and policy for scale changes. |
| Notification | Outbox + inbox/channel adapter boundary. | Product owner to resolve FR-008/AC-008 enablement discrepancy, channels, preferences, and delivery failure semantics. |
| Offline desktop | No offline financial write; show unconfirmed state on network loss and use idempotent retry. | Product owner may request offline behavior later; requires conflict and reconciliation rules. |

## Research Limits

Research covered architecture options and current standards/documentation relevant to the proposal. No provider, hosting vendor, deployment topology, or production workload was selected. No performance tests, implementation, or specification changes were performed.
