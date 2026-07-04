# Architecture Decision Records

The real decisions behind the Booppa frontend, each with the context that forced it, the alternatives, and the consequences that followed. These describe what is in the code, not an idealized design.

---

## ADR-0001: Thin frontend that proxies a separate backend

**Context.** Booppa is a compliance product. Its rules, scores, prices, and audit trail carry legal weight and must have exactly one authoritative home. The frontend is a large surface (marketing, vendor, buyer, admin, CSP), and it would be easy to let logic leak into it.

**Problem.** Where does business logic live, and how do we keep the frontend from becoming a second, divergent source of truth?

**Alternatives.** (a) A full-stack Next.js app with business logic in route handlers and its own database. (b) A thin frontend that delegates every dynamic operation to the FastAPI backend.

**Decision.** (b). Route handlers under `app/api/*` are proxies that attach credentials and forward to the backend; `next.config.js` rewrites the versioned API and CMS paths directly.

**Consequences.** One authoritative backend, no logic drift, and features are usually a proxy plus UI. The cost is an extra network hop and the discipline of never sneaking logic into the shell. It also means the frontend cannot function without the backend, which is acceptable for a product where the backend is always present.

---

## ADR-0002: `middleware.ts` as the single page-level auth gate

**Context.** Four distinct audiences (vendor, admin, government buyer, CSP operator) share one deployment, each with its own login and its own cookie.

**Problem.** Per-page auth checks scattered across 140 routes would be inconsistent and would fail open the moment someone forgot one.

**Alternatives.** Per-layout or per-page guards; a single middleware gate.

**Decision.** One `middleware.ts` that classifies every non-API request into a zone and redirects to that zone's login on failure. Public routes are an explicit allowlist, so unclassified routes fail closed.

**Consequences.** Auth policy is readable in one file and fails closed by default. The subtlety is that prefix matching must be handled carefully: `/csp` is matched exactly so that `startsWith` logic cannot expose `/csp/dashboard`. API routes are excluded because they authenticate themselves.

---

## ADR-0003: HMAC-signed paywall cookie

**Context.** PRO features and the buyer-by-plan unlock are gated on a `vendor_plan` cookie read in middleware.

**Problem.** A plaintext plan cookie is a self-service upgrade button: edit it in devtools and the paywall lifts.

**Alternatives.** (a) Trust the cookie. (b) Look up the plan from the backend on every gated request. (c) Sign the cookie so tampering is detectable, and confirm entitlement on the backend for the sensitive operations.

**Decision.** (c). `lib/cookie-signing.ts` signs `vendor_plan` with HMAC-SHA256 (Web Crypto), and every read goes through `verifyAndParseCookieValue`. The signing secret is required in production. The heaviest entitlement (CSP org access) is still confirmed server-side by the backend 402.

**Consequences.** The paywall cannot be lifted by editing a cookie, without paying for a backend round trip on every page. The trade-off is that the cookie reflects entitlement at issue time, so time-sensitive revocation still depends on the backend (see [SECURITY.md](SECURITY.md)).

---

## ADR-0004: Hand-rolled Content-Security-Policy in `next.config.js`

**Context.** The app embeds third parties (Calendly, QR rendering, polygonscan links, Cloudflare Insights) and handles payment and compliance flows.

**Problem.** A permissive or absent CSP leaves a large XSS and data-exfiltration surface on a product that must be trustworthy about data protection.

**Alternatives.** No CSP; a library-generated CSP; a hand-written allowlist.

**Decision.** A hand-written CSP with an explicit origin allowlist per directive, shipped alongside HSTS, nosniff, frame options, and a restrictive permissions policy.

**Consequences.** Every permitted origin is visible and intentional, and a new third party fails loudly until added. The current relaxation, `'unsafe-inline'` and `'unsafe-eval'` in `script-src`, is a known weakness driven by the bundle and is tracked for tightening.

---

## ADR-0005: Pricing duplicated in the frontend, contract-bound to the backend

**Context.** Prices and product bullets must render instantly on marketing and pricing pages, and must exactly match what the backend charges.

**Problem.** Fetching pricing on every render is slow and couples static marketing pages to the backend; hardcoding it risks the frontend showing a price the backend does not honour.

**Alternatives.** (a) Single source on the backend, fetched everywhere. (b) Duplicate in the frontend with an explicit sync contract.

**Decision.** (b). `lib/pricing.ts` is the frontend source of truth, with a header stating that prices must match `app/services/pricing.py`, and a change is a two-repository update plus the `STRIPE_*` price ID env var.

**Consequences.** Fast, statically renderable pricing pages, at the cost of a documented manual sync obligation. The risk is real and named rather than hidden (see [TRADEOFFS.md](TRADEOFFS.md)).

---

## ADR-0006: Playwright end-to-end tests only, no unit framework

**Context.** The frontend's own logic is thin; its value is that the funnels behave correctly against the real backend, especially checkout and auth gating.

**Problem.** Where does test effort pay off for a shell whose logic mostly lives elsewhere?

**Alternatives.** A unit-test framework plus e2e; e2e only.

**Decision.** Playwright e2e in `e2e/flows/`, covering pricing render, unauth bounce, the checkout proxy, bundle payload, and per-SKU happy paths. JWT-gated specs auto-skip without `PLAYWRIGHT_TEST_JWT`.

**Consequences.** Tests exercise what actually matters (the funnel end to end) and stay green locally without secrets. The gap is that pure UI-unit logic is untested; acceptable while the shell stays thin, worth revisiting if real client logic grows.

---

## ADR-0007: Deploy on AWS Amplify with SSR

**Context.** The app uses Server Components, cookie-reading route handlers, and server-side auth, so it needs an SSR runtime, not a static export.

**Problem.** How to build and run an SSR Next.js app with the environment secrets it needs at both build and runtime.

**Decision.** AWS Amplify (`amplify.yml`): `npm ci --legacy-peer-deps`, an explicit step that promotes selected Amplify Console env vars into `.env.production` for the SSR runtime, then `npm run build`, caching `node_modules` and `.next/cache`.

**Consequences.** Managed SSR hosting with the sibling backend and CMS reachable by URL. The explicit env-var promotion step is a small operational wart, but it makes the exact set of runtime secrets auditable in one place.
