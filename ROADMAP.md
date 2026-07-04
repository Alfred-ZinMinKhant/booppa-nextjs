# Roadmap

Where the frontend is heading, grouped by the concern each item addresses. Items are drawn from the documented trade-offs and residual risks in [SECURITY.md](SECURITY.md) and [TRADEOFFS.md](TRADEOFFS.md), not aspirational features.

## Security hardening

- **Tighten the CSP.** Move `script-src` off `'unsafe-inline'` and `'unsafe-eval'` toward nonces or hashes, gated on the bundle no longer requiring eval. This is the single largest XSS-surface reduction available.
- **Consolidate the Stripe webhook surface.** Two receivers exist (this app and the backend). Make it explicit which is authoritative per event type, or route all fulfillment through one, to remove the ambiguity noted in SECURITY.md.
- **Shorten paywall revocation lag.** For entitlements where a downgrade must take effect promptly, confirm against the backend rather than the signed `vendor_plan` cookie, following the pattern already used for CSP org entitlement.

## Reliability and correctness

- **Guard the pricing sync contract in CI.** `lib/pricing.ts` must match `app/services/pricing.py`. A cross-repository check (or a shared generated artifact) would turn a review-discipline obligation into an enforced one, closing the divergence risk in TRADEOFFS.md.
- **Extend e2e coverage past the checkout funnel.** The current specs concentrate on pricing and checkout. The auth-zone redirects (admin, buyer, CSP) are high-consequence and currently rely on middleware being correct without a test asserting each zone's bounce.

## Developer experience

- **Prune or use `rate-limiter-flexible`.** It is an unused dependency; either remove it or make its intended frontend role real, so the manifest reflects the running system.
- **Document the Italian-comment convention in-repo.** The convention to preserve, not translate, the Italian comments in `lib/auth.ts` lives in CLAUDE.md; surfacing it in a contributing note would keep it from being lost in a cleanup pass.

## Deployment

- **Reduce the Amplify env-var promotion step.** The explicit `env | grep` promotion into `.env.production` is a small operational wart. A cleaner mapping of Amplify Console variables to the SSR runtime would make the runtime secret set easier to audit.
