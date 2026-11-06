# Proposed contracts: conventions, identity and groups

These are proposed service/HTTP interfaces, not implemented APIs. Swing may use identical request/response DTOs through a service adapter. Prefix `/v1`. JSON fields use camelCase; IDs opaque UUID strings, amounts/percentages decimal strings, LocalDates `YYYY-MM-DD`, audit timestamps UTC ISO-8601. Unknown fields/filter names are rejected. Server derives actor from opaque authenticated session, never from a body actorId. HTTPS required; session conveyed by protected bearer token (Swing/native) or secure HttpOnly cookie with CSRF protection (future web). Session and CSRF details require security review.

## Common command semantics

Every mutation requires `Idempotency-Key` (random UUID generated once per user intent), except token redemption where token consumption itself is the single-use key. Durable unique scope `(actor or anonymous request scope, operation, key)` stores normalized payload digest and committed result in the same transaction. Reuse with identical payload returns original logical result; changed payload returns 409 IDEMPOTENCY_CONFLICT. Anonymous registration/recovery needs per-request key plus anti-abuse controls; the key is not identity authentication. After acquiring the command's serialization lock, recheck the key before version/state validation: two concurrent same-key calls may both miss the initial lookup. If a non-group command races a unique operation-key insert, roll back the losing transaction and reload the committed result; never return a false validation conflict or apply effects twice. Financial keys/results are retained with financial records. Other key retention is provisional at 30 days; token replay after successful consumption returns TOKEN_USED, never reapplies effects.

Success envelope: `{data: <operation result>, requestId, watermark}`; financial watermark is monotonically increasing per group, absent for identity. Mutations acknowledge only after commit. Reads accept optional `minWatermark` for read-after-write and return 503 NOT_CAUGHT_UP if they cannot observe it. Lists use opaque `cursor` and `limit` 1..100 (default 50), return `items,nextCursor`; report pagination binds a snapshot token. Clients must fetch all pages before presenting complete totals/history; service computes totals over full authorized selection, not current page.

Error envelope: `{error:{code,message,fields:[{path,code}],retryable},requestId}`. No secrets or inaccessible resource attributes. Common errors: 400 INVALID_REQUEST/INVALID_FIELD; 401 UNAUTHENTICATED; 403 FORBIDDEN; 404 NOT_FOUND for absent/inaccessible object; 409 VERSION_CONFLICT, STATE_CONFLICT, IDEMPOTENCY_CONFLICT; 422 domain validation codes; 429 RATE_LIMITED; 503 UNAVAILABLE/NOT_CAUGHT_UP. `expectedVersion` required for update/approval, checked after idempotency replay. Missing precondition -> 400 PRECONDITION_REQUIRED. DB timeout or lost transport response means outcome unknown; retry same key, or `GET /operations/{operation}/{key}` authenticated for own commands -> COMMITTED with result/reference, UNKNOWN if not found (does not prove an in-flight request will not commit). Never create a fresh key to fix uncertainty. Unexpected exceptions give 500 INTERNAL with no committed partial financial state, though a lost response may follow a successful commit.

## Identity operations

| Operation | Input | Success and transition | Authorization / errors in addition to common |
|---|---|---|---|
| POST /accounts | email, password | 202 generic registration response; new account UNVERIFIED and verification mail outbox atomically | public; invalid email/password 422; existing email gets generic response, no replacement password |
| POST /accounts/verify | verificationToken | 200 verified=true; one-time UNVERIFIED -> VERIFIED | possession of unexpired token; TOKEN_INVALID/EXPIRED/USED; replay cannot create session |
| POST /sessions | email,password | 200 sessionToken,expiresAt,ownAccountId | valid credentials + VERIFIED; 401 INVALID_CREDENTIALS; 403 EMAIL_UNVERIFIED only after credentials verified |
| DELETE /sessions/current | no body | 204; revoke current session | authenticated; repeated revocation safe |
| GET /accounts/me | none | 200 own id,email,verification status | authenticated; no arbitrary other-account endpoint |
| POST /password-recovery | email | 202 same response whether registered; outbox only if eligible | public, rate limited; delivery failures do not reveal existence |
| POST /password-reset | resetToken,newPassword | 200 reset=true; consume token, change hash, revoke all sessions atomically | token possession; invalid/expired/used token; invalid password |

Verification and recovery links carry random high-entropy secrets; only digests stored; single-use TTL provisional 24 hours verification and 30 minutes reset. Password policy provisional minimum 12 characters and maximum 128, never log plaintext; approve with D07. Mail submission failure keeps outbox pending with retry, not a falsely verified account.

## Group operations

| Operation | Input | Success and state | Authorization / domain errors |
|---|---|---|---|
| POST /groups | name,currencyCode | 201 groupId,version,currency, creator MANAGER; no configured eligible reviewer means NOT_READY | verified account; CURRENCY_UNSUPPORTED, INVALID_FIELD |
| GET /groups/{g} | none | group summary, own role, policy readiness, version | active member only |
| POST /groups/{g}/invitations | email | 201 invitationId,state=PENDING,expiresAt; mail outbox | active manager; ALREADY_MEMBER, INVITATION_EXISTS |
| GET /invitations/{id} | invitationToken | invitation id, group display name, expiry only | target verified email and token; no group records before acceptance |
| POST /invitations/{id}/accept | invitationToken | 200 membership ACTIVE, role MEMBER | target verified email + pending token; EXPIRED, REVOKED, INVITATION_CONFLICT |
| POST /invitations/{id}/decline | invitationToken | 200 DECLINED | target verified email |
| POST /groups/{g}/invitations/{id}/revoke | expectedVersion | 200 REVOKED | manager; STATE_CONFLICT if accepted |
| PUT /groups/{g}/members/{m}/role | role,expectedVersion | 200 member role and version | manager; LAST_MANAGER, MEMBER_INACTIVE |
| DELETE /groups/{g}/members/{m} | expectedVersion | 200 REMOVED, retainedFinancialHistory=true, blockedExpenseIds | manager or self leaving; LAST_MANAGER; no history deletion |
| PUT /groups/{g}/approval-policy | expectedVersion,stages:[{ordinal,eligibleMemberIds,requiredCount}],allowSubmitterApproval | 200 new immutable policyVersion,readiness | manager; POLICY_INVALID, MEMBER_INACTIVE; MVP rejects >1 stage/count with FEATURE_NOT_AVAILABLE |

Invitation mail delivery can fail/retry without granting membership. Invitation expires provisionally after seven days. Acceptance rechecks group and address, consumes invitation once, inserts/reactivates membership atomically. Reinvitation does not reset historical balances or approvals. Group listing exposes only accepted memberships. Last-manager and policy-readiness checks serialize with membership changes. No group deletion or ownership-transfer shortcut is included.

