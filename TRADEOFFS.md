# Trade-offs

Every decision in this frontend bought something and gave something up. These are the compromises worth defending out loud, each with its cost stated plainly.

## Thin proxy shell instead of a full-stack app

**Chosen:** delegate all dynamic work to the FastAPI backend; keep this repository presentation and routing only.

**Bought:** one authoritative source of business logic, prices, and audit data, with no risk of two systems disagreeing. Features become a proxy plus UI.

**Gave up:** self-sufficiency and a network hop. This app cannot function without the backend, and every dynamic call pays an extra request.

**Why it is defensible:** for a compliance product, logic drift between two services is a correctness bug with legal consequences. A single owner of the rules is worth the hop, and the backend is always deployed alongside this app (see [ADR-0001](ADR.md#adr-0001-thin-frontend-that-proxies-a-separate-backend)).

## Signed cookie for the paywall instead of a per-request backend check

**Chosen:** gate PRO routes on an HMAC-signed `vendor_plan` cookie read in middleware, and confirm only the heaviest entitlement (CSP org access) on the backend.

**Bought:** instant paywall decisions with no backend round trip on every page, while making the cookie unforgeable.

**Gave up:** immediate revocation. The cookie reflects entitlement when it was issued, so a downgrade is only enforced once the cookie is re-issued.

**Why it is defensible:** signing removes the actual attack (editing the cookie to self-upgrade), and the truly sensitive path is still confirmed server-side. The revocation lag is bounded and acceptable for a plan flag, not for anything safety-critical (see [ADR-0003](ADR.md#adr-0003-hmac-signed-paywall-cookie)).

## Pricing duplicated in the frontend

**Chosen:** keep `lib/pricing.ts` as the frontend source of truth, contract-bound to `app/services/pricing.py`.

**Bought:** pricing and marketing pages render statically and instantly, with no backend dependency to show a price.

**Gave up:** a single source of truth. A price change is a two-repository edit plus the Stripe price ID env var, and forgetting one repo means the displayed price and the charged price diverge.

**Why it is defensible:** the divergence risk is named in the file header and enforced by review discipline, and the alternative (fetching prices on every marketing render) couples static pages to the backend for no product gain (see [ADR-0005](ADR.md#adr-0005-pricing-duplicated-in-the-frontend-contract-bound-to-the-backend)).

## CSP that permits `unsafe-inline` and `unsafe-eval`

**Chosen:** ship a strict, hand-rolled CSP with an explicit origin allowlist, but allow inline and eval in `script-src`.

**Bought:** a working strict-origin policy today, without a bundle refactor to remove inline scripts and eval.

**Gave up:** part of the XSS protection a nonce-based or hash-based CSP would give.

**Why it is defensible:** the origin allowlist still blocks the exfiltration destinations that make XSS profitable, and the relaxation is documented rather than hidden. Tightening it is on the roadmap and gated on the bundle no longer needing eval (see [SECURITY.md](SECURITY.md)).

## Four auth zones in one deployment

**Chosen:** serve vendor, admin, buyer, and CSP audiences from one app, gated by one middleware file.

**Bought:** one codebase, one deploy, shared components, and auth policy readable in a single place.

**Gave up:** hard isolation. A middleware mistake affects every audience at once, so the prefix-matching logic has to be exactly right (hence `/csp` matched exactly, not by prefix).

**Why it is defensible:** the audiences share most of the UI and all of the backend, so splitting them into separate apps would multiply deploys and duplicate components for isolation the backend already enforces at the data layer.

## Playwright-only testing

**Chosen:** end-to-end funnel tests, no unit-test framework.

**Bought:** confidence in the things that actually break revenue (checkout, auth gating) against the real backend, and a suite that stays green locally without credentials.

**Gave up:** fast, isolated tests of individual UI logic.

**Why it is defensible:** the shell holds little standalone logic to unit-test; the risk lives in the integrated funnel, which is exactly what the e2e specs cover. Revisit if real client-side logic grows (see [ADR-0006](ADR.md#adr-0006-playwright-end-to-end-tests-only-no-unit-framework)).
