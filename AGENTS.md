# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm install --legacy-peer-deps    # peer-dep conflict requires the flag
npm run dev                       # next dev (localhost:3000)
npm run build && npm start        # production build; Playwright reuses this
npm run lint                      # next lint (eslint-config-next)
npm run test:e2e:install          # one-time: download Playwright Chromium
npm run test:e2e                  # all specs in e2e/
npm run test:e2e:ui               # interactive runner
npx playwright test e2e/flows/pricing-page.spec.ts   # single spec
```

There is no unit-test framework — only Playwright e2e in `e2e/flows/`. JWT-gated specs auto-skip when `PLAYWRIGHT_TEST_JWT` is unset; see `TESTING.md`. The full CI setup (Postgres + Redis + uvicorn for the sibling backend) lives in `booppa_backend/TESTING.md`.

Path alias: `@/*` → repo root (e.g. `@/lib/auth`, `@/components/...`).

## Architecture

### Frontend-only repo + sibling FastAPI backend

This Next.js 14 App Router app is a thin shell over a **separate FastAPI backend** (`api.booppa.io`, repo `booppa_backend`). Almost every dynamic page or API route delegates to that backend:

- `next.config.js` rewrites `/api/v1/:path*` → `${BACKEND_BASE_URL}/api/v1/:path*` and `/api/public/:path*` → CMS. Client code can call `/api/v1/...` directly and it transparently hits FastAPI.
- Route handlers under `app/api/*/route.ts` are **proxies**, not real backends. They forward the request via `fetchWithAuth` (`lib/auth.ts`) and re-emit the response. See `app/api/checkout/route.ts` as the canonical pattern.
- `lib/config.ts` centralizes `apiUrl`, `wsUrl`, and the `endpoints` map. Use those constants — don't hardcode paths.

When adding a feature, check whether the backend already has the endpoint; if so, the work here is usually just a proxy route + UI.

### Three independent auth zones (middleware.ts)

`middleware.ts` is the only auth gate for pages (API routes handle their own). It recognizes three cookies:

| Cookie | Zone | Notes |
|---|---|---|
| `token` (+ `refreshToken`) | vendor/user (`/vendor/*`, etc.) | Set by `lib/auth.ts` after `/auth/login`; `fetchWithAuth` auto-refreshes on 401. |
| `admin_token` | `/admin/*` | Forwarded by `lib/adminFetch.ts`. |
| `gov_buyer_token` *or* paid `vendor_plan` | `/buyer/*` | Buyer dashboard is unlocked either by a buyer login or by an enterprise/buyer subscription. |

Public routes are an allowlist in `middleware.ts` (`publicRoutes` + `publicPrefixes`); anything else under a vendor path falls through to `/login`. PRO-gated routes (`/vendor/evidence`, `/vendor/rfp`) additionally read the `vendor_plan` cookie and bounce to `/pricing?upgrade=1` for free plans.

`vendor_plan` is **HMAC-signed** via `lib/cookie-signing.ts` (`COOKIE_SIGNING_SECRET`). Always read it through `verifyAndParseCookieValue` — a raw value is untrusted. The secret is required in production; dev falls back to a fixed string.

### Auth fetch helpers — which to use

- Server components / route handlers under user-facing pages → `fetchWithAuth(path, init)` from `lib/auth.ts`. Pass the **backend path** (e.g. `/api/v1/stripe/checkout`), not a full URL. Handles 401 → refresh → retry transparently.
- Server components under `/admin/*` → `adminFetch(path, init)` from `lib/adminFetch.ts`. Same shape; forwards `admin_token`.
- `getServerSideUser()` resolves the current user (used by route handlers like `app/api/checkout` to gate guest access).

### Pricing is duplicated by design

`lib/pricing.ts` (`ONE_TIME_PRODUCTS`, `BUNDLE_PRODUCTS`, `SUBSCRIPTION_PRODUCTS`, `ALL_PRODUCTS`) is the **frontend source of truth** for product names, prices, and feature bullets. The file header is explicit: **prices here must match `app/services/pricing.py` on the backend.** If you change a price, SKU id, or add a product, update both repos and the matching `STRIPE_*` price ID env var (see `.env.example`).

Stripe checkout flow: UI → `POST /api/checkout` (proxy in `app/api/checkout/route.ts`, requires sign-in) → backend `/api/v1/stripe/checkout` → Stripe Checkout Session URL → `/thank-you`. The webhook lives at `app/api/webhooks/stripe`.

### CSP is strict

`next.config.js` ships a hand-rolled CSP. Adding a new third-party origin (script, image, fetch target, iframe) requires editing the matching `*-src` directive there or the request will be blocked silently in the browser. Current allowed origins include `api.booppa.io`, `cms.booppa.io`, `calendly.com`, `polygonscan.com`, and the staging IPs.

### Maintenance mode

`NEXT_PUBLIC_MAINTENANCE_MODE=true` enables a takeover page (see `app/maintenance/`). It is **currently true in `.env.local`** — disable it locally before testing flows that need real pages.

### Environment

`.env.example` is the authoritative list. The major buckets:
- Stripe: publishable + secret keys, webhook secret, one `STRIPE_*` price ID per SKU. Legacy SKUs are commented out — leave blank for new deployments.
- AWS SES (transactional email)
- `NEXT_PUBLIC_API_BASE` / `BACKEND_BASE_URL` (the FastAPI sibling)
- `NEXT_PUBLIC_CMS_BASE` / `CMS_BASE` (the CMS sibling)
- `COOKIE_SIGNING_SECRET` (required in prod; gates the `vendor_plan` paywall)

## Conventions

- **Italian comments** appear in `lib/auth.ts` and other older files — preserve them when editing; don't translate as part of an unrelated change.
- Route handlers default to `export const dynamic = 'force-dynamic'` when they touch cookies. Match the existing handler in the same directory.
- Components are split between `components/` (shared) and feature folders under `app/<route>/`. Server components are the default; mark client components with `'use client'` at the top.
