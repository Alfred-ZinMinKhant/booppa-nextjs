# Architecture

How the Booppa frontend is put together, and why it is shaped the way it is.

## System context

This is one of three services. The frontend renders the product and controls access; the FastAPI backend owns all business logic, data, scoring, payments, and the blockchain-anchored audit trail; a separate CMS serves marketing and educational content.

```mermaid
flowchart LR
  User["Vendor / Buyer / Admin"]
  subgraph FE["booppa-nextjs"]
    direction TB
    MW["middleware.ts"]
    RSC["Server Components"]
    RH["Route handlers (proxies)"]
  end
  API["FastAPI backend<br/>api.booppa.io"]
  CMS["CMS<br/>cms.booppa.io"]
  Stripe["Stripe"]

  User --> MW
  MW --> RSC
  RSC --> RH
  RH -->|fetchWithAuth / adminFetch| API
  RSC -->|/api/v1 rewrite| API
  RSC -->|/api/public rewrite| CMS
  RH -->|webhook| Stripe
```

## Architectural style: a thin shell over a service

The dominant decision is that this repository holds almost no business logic. Three mechanisms carry delegation:

1. **Rewrites.** `next.config.js` maps `/api/v1/:path*` to `${BACKEND_BASE_URL}/api/v1/:path*` and `/api/public/:path*` to the CMS. Client code calls the versioned API directly and it transparently reaches FastAPI. There are also two explicit rewrites for `/api/admin/intelligence`.
2. **Proxy route handlers.** Handlers under `app/api/*/route.ts` (113 of them) attach the caller's credentials with `fetchWithAuth` and forward to the backend, re-emitting the response. `app/api/checkout/route.ts` is the reference implementation: it requires a signed-in user, enriches the payload with the user's email, then forwards to `/api/v1/stripe/checkout`.
3. **Centralized config.** `lib/config.ts` holds `apiUrl`, `wsUrl`, and an `endpoints` map. Paths are named there rather than hardcoded at call sites.

The consequence: adding a feature is usually a proxy route plus UI, because the backend already owns the endpoint. That keeps the two systems from disagreeing about business rules.

## The authentication boundary

`middleware.ts` is the single page-level gate. API routes gate themselves, so middleware returns early for anything under `/api`. Everything else is classified into one of four zones.

```mermaid
flowchart TD
  Req["Incoming page request"]
  Req --> IsApi{"/api/*?"}
  IsApi -->|yes| Pass1["next() (route self-gates)"]
  IsApi -->|no| IsAdmin{"/admin/*?"}
  IsAdmin -->|yes| Admin{"admin_token?"}
  Admin -->|no| ToAdminLogin["redirect /admin/login"]
  Admin -->|yes| Pass2["next()"]
  IsAdmin -->|no| IsCsp{"/csp/*?"}
  IsCsp -->|yes| Csp{"token?"}
  Csp -->|no| ToLogin1["redirect /login"]
  Csp -->|yes| Pass3["next() (entitlement checked server-side)"]
  IsCsp -->|no| IsPublic{"public allowlist?"}
  IsPublic -->|yes| Pass4["next()"]
  IsPublic -->|no| IsBuyer{"/buyer/*?"}
  IsBuyer -->|yes| Buyer{"gov_buyer_token OR paid vendor_plan?"}
  Buyer -->|no| ToGov["redirect /government"]
  Buyer -->|yes| Pass5["next()"]
  IsBuyer -->|no| HasToken{"token?"}
  HasToken -->|no| ToLogin2["redirect /login"]
  HasToken -->|yes| IsPro{"PRO route + free plan?"}
  IsPro -->|yes| ToPricing["redirect /pricing?upgrade=1"]
  IsPro -->|no| Pass6["next()"]
```

Notes that matter for correctness:

- **Public routes are an allowlist**, not a denylist. `publicRoutes` and `publicPrefixes` in `middleware.ts` enumerate what is open; anything else under a protected path falls through to `/login`. This fails closed.
- **`/csp` is deliberately not folded into the prefix-matched public routes.** A `startsWith('/csp')` match would wrongly expose `/csp/dashboard`. The marketing page is matched exactly; the operational app is gated separately. The CSP entitlement (an active paid org) is a different axis from `vendor_plan` and is enforced server-side by the backend returning 402, not in middleware.
- **The PRO paywall reads a signed cookie.** `vendor_plan` is verified through `verifyAndParseCookieValue` before it is trusted.

## Auth fetch helpers

Three helpers cover the server-side call paths:

- `fetchWithAuth(path, init)` (`lib/auth.ts`): for user-facing pages and their route handlers. Takes the backend path, attaches the `token` cookie as a bearer, and on a 401 refreshes via `/auth/refresh` and retries once.
- `adminFetch(path, init)` (`lib/adminFetch.ts`): same shape for `/admin/*`, forwarding `admin_token`.
- `getServerSideUser()`: resolves the current user from the `token` cookie (with a refresh fallback), used to gate guest access in route handlers such as checkout.

```mermaid
sequenceDiagram
  participant C as Component / Route handler
  participant A as fetchWithAuth
  participant B as FastAPI backend
  C->>A: fetchWithAuth('/api/v1/...')
  A->>B: GET with Bearer token
  alt token valid
    B-->>A: 200
  else 401
    A->>B: POST /auth/refresh (refreshToken)
    B-->>A: new token + refreshToken
    A->>B: retry with new token
    B-->>A: 200
  end
  A-->>C: Response
```

## Checkout and fulfillment

Payment is a multi-service flow. The frontend proxy enforces sign-in, the backend creates the Stripe session, and fulfillment is triggered by webhook.

```mermaid
sequenceDiagram
  participant UI
  participant P as /api/checkout (proxy)
  participant B as FastAPI /api/v1/stripe/checkout
  participant S as Stripe
  participant W as /api/webhooks/stripe

  UI->>P: POST sku + payload
  P->>P: getServerSideUser() (block guests)
  P->>B: forward enriched payload (prefill_email)
  B->>S: create Checkout Session
  S-->>B: session URL
  B-->>P: url
  P-->>UI: url
  UI->>S: redirect to Stripe Checkout
  S->>W: checkout.session.completed (signed)
  W->>W: constructEvent verifies signature
  W->>B: trigger scan / fulfillment
```

The webhook route verifies the `stripe-signature` header with `stripe.webhooks.constructEvent` and rejects on failure before any side effect. Fulfillment side effects (for example the PDPA scan pipeline) are keyed off event metadata.

## Pricing is duplicated by design

`lib/pricing.ts` is the frontend source of truth for product names, prices, and feature bullets (`ONE_TIME_PRODUCTS`, `BUNDLE_PRODUCTS`, `SUBSCRIPTION_PRODUCTS`, `ALL_PRODUCTS`). Its header states the contract explicitly: prices here must match `app/services/pricing.py` on the backend. A price, SKU id, or new product is a two-repository change plus the matching `STRIPE_*` price ID env var. This is a conscious trade-off, discussed in [TRADEOFFS.md](TRADEOFFS.md).

## Content security and headers

`next.config.js` ships a hand-rolled CSP alongside HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, a referrer policy, and a `Permissions-Policy` that disables camera, microphone, geolocation, and FLoC. The CSP allowlist names each permitted origin (`api.booppa.io`, `cms.booppa.io`, Calendly, polygonscan.com, Cloudflare Insights, and the staging IP). A new third-party origin requires editing the matching `*-src` directive, or the browser blocks it silently.

## Conventions worth preserving

- Server Components are the default; Client Components declare `'use client'`.
- Route handlers that touch cookies set `export const dynamic = 'force-dynamic'`.
- Some older files (notably `lib/auth.ts`) carry Italian comments. They are preserved on edit rather than translated as part of unrelated work.
- Shared components live in `components/`; feature components live under their `app/<route>/` folder.
