# Identity Boundary Contract Proposal

This is a provider-neutral design boundary, not a new SplitSmart password API. The identity provider is not selected. Registration, email verification, sign-in, and password recovery are customer-required behaviors (FR-001, FR-021; AC-001, AC-018); OIDC and native-client flow details are proposed implementation choices.

## Trust and ownership

- The identity provider owns credentials, email verification, login, recovery, and authentication sessions. SplitSmart never stores plaintext passwords or reset/verification tokens.
- The provider must support verified email/password accounts as requested by the spec. Provider registration and recovery UX are provider-hosted or integrated with its approved SDK/flow; provider-specific routes and payloads are intentionally not invented here.
- SplitSmart maps validated `(issuer, subject)` to one stable `accountId`. Email is not an authorization key for API resource access.
- The SplitSmart API checks token issuer/audience/signature/expiry and separately authorizes each account/group resource. Authentication alone does not grant group membership.
- A new account can access its own permitted account surface once authenticated, but group access starts only after an invitation is accepted. Unverified identities cannot be used to satisfy the email-verification requirement.

## Required identity interactions

| Interaction | Input / actor | Successful outcome | Failure behavior / boundary |
|---|---|---|---|
| Register | Person supplies email and password to provider registration flow. | Provider creates an unverified identity and sends a verification challenge. No group membership is created. | Provider rejects malformed/weak credentials according to its configured policy. Do not expose password or verification secret to SplitSmart. |
| Verify email | Person presents the provider's one-use verification challenge. | Provider marks the email verified; subsequent authentication can establish an account principal. | Expired/used challenge fails; user requests a new challenge from the provider. |
| Sign in | Person authenticates through provider authorization flow. Swing uses the system browser with authorization code + PKCE; no embedded client secret. | Client receives provider-issued authentication result/token; API maps subject to SplitSmart account and returns only authorized data. | Invalid credentials/unverified account fail at provider; API rejects invalid or expired tokens with 401. |
| Recover password | Person requests recovery for an email address at provider. | Provider supplies a time-limited, single-use recovery challenge and accepts a replacement password after successful challenge. | The provider-facing response should not disclose whether an email is registered; invalid/expired challenge does not change credentials. |
| API authorization | Client sends provider-issued bearer token to SplitSmart API. | API validates token and then checks active membership/role for the requested resource and operation. | Invalid identity returns 401; authenticated but unauthorized access returns 403 or privacy-preserving 404. Caller-supplied `accountId` never substitutes for the token subject. |

## Proposed native-client and web handling

- **Swing and future native apps**: use an external browser and OAuth authorization code + PKCE following RFC 8252. Treat desktop/mobile clients as public clients; embed no client secret. Protect refresh/session material with platform facilities and a short lifetime/rotation policy selected during implementation.
- **Web**: choose a provider-supported browser flow and protect session material from script access; a server-managed session with secure, HttpOnly, SameSite cookies is a candidate. The web session still maps to the same API authorization subject.
- **Provider configuration**: exact provider, redirect URIs, token claims/audience, account-linking policy, email-change behavior, credential policy, rate limiting, MFA posture, recovery TTL, and operational service level require security/product review.

## References and limits

- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [RFC 8252: OAuth 2.0 for Native Apps](https://www.rfc-editor.org/rfc/rfc8252.html)
- [RFC 9700: OAuth 2.0 Security Best Current Practice](https://www.rfc-editor.org/rfc/rfc9700.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

No identity provider is configured or tested by this proposal. Selecting one and reviewing its flows is a pre-implementation and pre-release gate.
