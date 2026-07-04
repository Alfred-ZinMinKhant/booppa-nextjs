# Lessons

What building and operating the Booppa frontend taught, beyond the feature list. These are the things that would change how I approach the next frontend.

## A frontend earns its keep by what it refuses to own

The temptation on a large product surface is to let logic creep into the client: a price here, a scoring tweak there, a quick validation rule. On a compliance product, every one of those is a place where the frontend can start disagreeing with the backend, and disagreement is a correctness bug with legal weight. The durable decision was to make this app a shell: proxy the dynamic work, rewrite the API paths, and keep the rules in one authoritative service. Discipline about what the frontend does not do turned out to matter more than any feature it does.

## Authentication policy belongs in one file that fails closed

Spreading auth checks across 140 pages guarantees that one of them is eventually forgotten, and a forgotten check on a page fails open. Centralizing the gate in `middleware.ts` with a public allowlist inverts the default: an unclassified route falls through to login rather than to the content. The lesson is the direction of the default. Auth should be deny-by-default in one readable place, not allow-by-default scattered across many.

## Prefix matching is a security decision, not a convenience

`/csp` is matched exactly while `/csp/` is gated separately, because a naive `startsWith('/csp')` in the public allowlist would have exposed `/csp/dashboard` to anyone. That is one character of logic standing between a marketing page and an unauthenticated operational dashboard. The lesson: when a route prefix decides access, the match has to be reasoned about as carefully as any authorization check, and the exact-versus-prefix distinction deserves a comment explaining why.

## Client-trusted state must be signed, or it is a self-service upgrade

The paywall reads a `vendor_plan` cookie. Left plaintext, that cookie is a button any user can press to grant themselves enterprise access. Signing it with HMAC and verifying on every read turns "trust the client" into "detect tampering," without paying for a backend call on every page. The broader lesson: any bit of trust you place in a value the client can edit has to be authenticated, and signing is cheap enough that there is no excuse to skip it for a real entitlement.

## Duplication is acceptable only with an explicit, written contract

Pricing lives in both repositories on purpose, for render speed. That is safe only because the file header names the exact backend file it must match and the change is treated as a two-repository operation. Undocumented duplication rots silently; documented duplication with a named counterpart survives. The lesson is not "never duplicate," it is "if you duplicate, write down the contract and where the other copy is."

## Verify the dependency list against the code, not the other way around

`rate-limiter-flexible` sits in `package.json` but is not used in application code; rate limiting is enforced on the backend. A dependency in the manifest is not evidence that a capability exists in the running system. This mirrors a lesson from the backend, where `asyncpg` was present but unused. Documenting the system honestly means reading what the code imports, not what the manifest lists, and calling out the gap rather than implying the capability is live.

## Test where the money and the access decisions are

With a thin shell there is little standalone logic to unit-test, so the test budget went entirely to end-to-end funnel specs: does the pricing page render, does an unauthenticated user get bounced, does the checkout proxy reject guests, does a SKU reach Stripe. Those are the paths where a regression costs revenue or leaks access. The lesson is to spend test effort proportional to consequence, not proportional to how easy something is to unit-test.
