# Security

The frontend's security responsibilities are narrow but real: it is the page-level authentication boundary, it holds a tamper-evident paywall, it sets the browser security headers, and it verifies the Stripe webhook. Business-logic authorization lives on the backend; this document covers what this repository enforces and what it deliberately leaves to the backend.

## Authentication model

`middleware.ts` is the only page-level gate. It classifies every non-API request into one of four zones and fails closed for anything not on the public allowlist.

| Zone | Cookie | Set by | On failure |
|---|---|---|---|
| Vendor / user | `token` (+ `refreshToken`) | `lib/auth.ts` after `/auth/login` | redirect `/login?from=...` |
| Admin | `admin_token` | admin login flow, forwarded by `lib/adminFetch.ts` | redirect `/admin/login` |
| Government buyer | `gov_buyer_token` or paid `vendor_plan` | buyer login or subscription | redirect `/government?from=...` |
| CSP app | `token` (plus a backend-enforced org entitlement) | vendor login | redirect `/login?from=...`; entitlement 402 handled server-side |

Session cookies are set with defensive attributes in `lib/auth.ts`: `httpOnly` (not readable by JavaScript), `sameSite: lax`, `path: /`, `secure` in production, with a 7-day access token and a 30-day refresh token. `fetchWithAuth` transparently refreshes an expired access token on a 401 and retries once, so a short access-token lifetime does not degrade the experience.

## Paywall integrity: signed cookies, not obscurity

The PRO paywall and the buyer-by-plan unlock both hinge on `vendor_plan`. If that cookie were plaintext, a user could grant themselves an enterprise plan by editing it in devtools. It is not plaintext.

`lib/cookie-signing.ts` signs the value with HMAC-SHA256 using Web Crypto (`crypto.subtle`) and a `COOKIE_SIGNING_SECRET`. The value is stored as `value.hexsignature`, and every read goes through `verifyAndParseCookieValue`, which recomputes and verifies the signature and returns `null` on any mismatch or malformed input. A forged or edited cookie verifies as `null` and is treated as the free plan.

The secret is mandatory in production: `getSecret()` throws if `COOKIE_SIGNING_SECRET` is unset when `NODE_ENV === 'production'`, and only falls back to a fixed development string otherwise. This prevents shipping a build that would accept unsigned cookies.

## Browser security headers

`next.config.js` applies a security header set to every route:

- **Content-Security-Policy**, hand-rolled, with an explicit origin allowlist per directive. New third-party origins must be added deliberately or they are blocked in the browser.
- **Strict-Transport-Security** with a two-year max-age, `includeSubDomains`, and `preload`.
- **X-Content-Type-Options: nosniff**, **X-Frame-Options: SAMEORIGIN**.
- **Permissions-Policy** disabling camera, microphone, geolocation, and `interest-cohort` (FLoC).
- **Referrer-Policy: origin-when-cross-origin**.

The CSP still permits `'unsafe-inline'` and `'unsafe-eval'` in `script-src`. That is a known relaxation (see residual risks) driven by the current bundle, not an oversight.

## Payment webhook

`app/api/webhooks/stripe/route.ts` verifies the `stripe-signature` header with `stripe.webhooks.constructEvent` before it reads the event, and returns 400 on a signature failure. No fulfillment side effect runs on an unverified payload. Fulfillment (for example the PDPA scan pipeline) is keyed off validated event metadata.

## Threat model (frontend scope)

| Threat | Mitigation |
|---|---|
| Direct access to a gated page without login | `middleware.ts` fails closed to the correct login per zone |
| Prefix-match bug exposing a gated sub-route | `/csp` matched exactly, not by prefix, to avoid exposing `/csp/dashboard` |
| Self-granting a paid plan via cookie edit | `vendor_plan` is HMAC-signed; unsigned or edited values verify as free |
| Stolen access token used from JavaScript | Cookies are `httpOnly`; not reachable by page scripts |
| Long-lived stolen access token | 7-day access token with refresh; backend can revoke |
| Forged Stripe webhook triggering fulfillment | Signature verified before any side effect |
| Injected third-party script / data exfiltration | Strict CSP with per-directive origin allowlist |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` and `frame-ancestors` behaviour via CSP |

## Known residual risks

Documented honestly so they are not discovered in an interview or an audit.

- **CSP allows `'unsafe-inline'` and `'unsafe-eval'` in scripts.** This weakens the XSS protection the CSP otherwise provides. Tightening it (nonces or hashes, removing `unsafe-eval`) is on the roadmap and depends on the bundle no longer needing them.
- **The frontend does not re-authorize business actions.** It gates pages and trusts the backend for record-level authorization. That is correct by design, but it means a missing backend check is not caught here. The two layers must both hold.
- **Two Stripe webhook surfaces exist.** Fulfillment logic lives primarily on the backend; this repository also has a signature-verified webhook route. Having two receivers is a maintenance surface, and which one is authoritative for a given event type should stay explicit.
- **`vendor_plan` reflects entitlement at cookie-issue time.** It is signed and therefore not forgeable, but a plan downgrade is only reflected when the cookie is re-issued. Time-sensitive revocation relies on the backend, and CSP entitlement is intentionally checked server-side rather than from the cookie for exactly this reason.
- **The dev cookie secret is a fixed string.** Safe because production throws without a real secret, but any non-production deployment that forgets to set it inherits a known key.
