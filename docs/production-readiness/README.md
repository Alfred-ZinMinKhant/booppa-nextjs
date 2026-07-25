# Booppa Frontend — Production Readiness Review

**Scope:** `booppa-nextjs` (Next.js 14 App Router). This is a **frontend-only** repo that
proxies to a separate FastAPI backend (`api.booppa.io`, repo `booppa_backend`) and a CMS
(`cms.booppa.io`). This audit covers **only what this repo controls**. The backend, database,
Redis, and Celery/queue live in `booppa_backend` and are **out of scope / Insufficient evidence to
conclude** here — several go-live risks actually live there and are flagged as such.

**Verdict:** ⚠️ **Frontend not production-ready as an isolated go-live; the backend is largely
production-ready.** The frontend has (1) a **dead/duplicate Stripe webhook** — now confirmed the
backend owns the authoritative one — (2) a **deploy env-var mismatch** in `amplify.yml`, and (3)
**no health check, no rate limiting, no error monitoring** at the frontend layer. The **backend
(`booppa_backend`) resolves most of the "out of scope" risks** I originally flagged: it has real
health/readiness probes, idempotent Stripe fulfillment, rate limiting, Sentry, RDS backups+PITR,
and a CI deploy with automated ECS circuit-breaker rollback. See the **Backend Assessment** section
appended below.

---

## Phase 1 — Application Assessment (deployment dependency map)

### Runtime & build
- **Framework:** Next.js `^14.2.33` App Router, React 18, TypeScript. `package.json`.
- **Node:** 20 (CI `.github/workflows/test.yml:6`; Amplify uses its default Node — **not pinned**).
- **Build:** `next build` → SSR output. Deployed on **AWS Amplify** (`amplify.yml`), artifact
  `baseDirectory: .next`. No Dockerfile, no compose, no K8s — **not containerized**.
- **Install quirk:** `npm ci --legacy-peer-deps` required (peer-dep conflict) — `amplify.yml:8`,
  `CLAUDE.md`.

### What this app actually is
A **thin SSR shell + proxy layer** in front of FastAPI. Two mechanisms:
1. **`next.config.js` rewrites** — `/api/v1/:path*` → `${BACKEND_BASE_URL}` and `/api/public/:path*`
   → CMS. Client code calls `/api/v1/...` and transparently hits FastAPI.
2. **~110 route handlers** under `app/api/*/route.ts` — server-side proxies that attach auth cookies
   as Bearer tokens via `fetchWithAuth` (`lib/auth.ts`) and re-emit the response.

### Auth (3 independent zones — `middleware.ts`)
| Cookie | Zone | Set by |
|---|---|---|
| `token` + `refreshToken` (httpOnly) | vendor/user + `/csp/*` | `app/api/auth/login/route.ts` |
| `admin_token` (httpOnly, 24h) | `/admin/*` | `app/api/admin/login/route.ts` |
| `gov_buyer_token` **or** signed `vendor_plan` | `/buyer/*` | login |

`vendor_plan` is **HMAC-SHA256 signed** (`lib/cookie-signing.ts`) and always read through
`verifyAndParseCookieValue`. Secret `COOKIE_SIGNING_SECRET` is **required in production** (throws if
absent) — good.

### External dependencies (data-flow)
```mermaid
flowchart LR
  U[Browser] -->|HTTPS| A[Next.js SSR on AWS Amplify]
  A -->|rewrite /api/v1/*| B[FastAPI api.booppa.io]
  A -->|rewrite /api/public/*| C[CMS cms.booppa.io]
  A -->|Stripe SDK| S[Stripe API]
  S -->|webhook POST| A
  A -->|@aws-sdk/client-ses| SES[AWS SES email]
  B --> DB[(Postgres — out of scope)]
  B --> R[(Redis — out of scope)]
  B --> Q[Celery scans — out of scope]
  U -->|socket.io-client| B
```

- **Stripe** (`stripe ^14`) — checkout sessions + webhook. Server-side secret key.
- **AWS SES** (`@aws-sdk/client-ses`) — transactional email.
- **socket.io-client** — realtime to backend (`wsUrl` from `lib/config.ts`).
- **PDF/QR** — `pdf-lib`, `qrcode` (server-generated documents/badges).
- **Scheduled jobs / queues:** none in this repo. Scans are triggered via the backend
  (`triggerScanPipeline` in the webhook). **Out of scope.**

### Environment configuration
`.env.example` is the authoritative list. `.env.local` on disk holds a **test** Stripe secret key;
it is **not** git-tracked (only `.env.example` is — verified via `git ls-files`). Amplify injects
prod env vars at build time by grepping and appending to `.env.production` (`amplify.yml:11`).

---

## Phase 2 — Production Readiness Audit

### 🔴 Reliability

1. **Stripe webhook is a stub — silent state loss.** `app/api/webhooks/stripe/route.ts`.
   Signature verification is correct, but the handlers for `customer.subscription.created/updated/
   deleted`, `invoice.payment_succeeded`, and `invoice.payment_failed` **only `console.log`** — they
   do **not** update any subscription state, and there is no DB here. So when a customer subscribes,
   cancels, or a renewal fails, **nothing propagates**. `vendor_plan` is only refreshed at login
   (`app/api/auth/login/route.ts`), so a user's entitlement can be stale for up to 7 days (cookie
   `maxAge`) after a plan change. **Verified.** *(If the backend has its own Stripe webhook that is
   the real source of truth, this frontend webhook is dead code and should be deleted to avoid
   confusion — Insufficient evidence to conclude which is authoritative; confirm against
   `booppa_backend`.)*

2. **Webhook depends on env vars that don't exist.** `triggerScanPipeline` calls
   `${process.env.API_URL}/api/scans/create` with header `X-Internal-Secret:
   process.env.INTERNAL_API_SECRET`. Neither `API_URL` nor `INTERNAL_API_SECRET` appears in
   `.env.example` **or** the Amplify forwarding grep (`amplify.yml:11`). So in production `API_URL`
   is `undefined` → fetch to `undefined/api/scans/create` throws, is caught, logged, and **the paid
   scan is silently never triggered.** **Verified.**

3. **No health / readiness endpoint.** No `app/api/health` route; nothing for a load balancer or
   Amplify to probe beyond the root page. **Verified** (searched — only `app/sitemap.ts` exists).

4. **No rate limiting despite the dependency.** `rate-limiter-flexible ^2.3.10` is in
   `package.json` but **imported nowhere** in `app/` or `lib/` (verified grep). Login, register,
   forgot-password, and contact proxies are unthrottled at this layer — abuse protection depends
   entirely on the backend. **Out of scope if backend throttles; flag to confirm.**

5. **Graceful shutdown / connection pooling:** N/A — Amplify manages the SSR runtime lifecycle and
   each request opens a short-lived `fetch` to the backend. No persistent pool to drain. Acceptable.

6. **Retry logic:** `fetchWithAuth` does one 401→refresh→retry (`lib/auth.ts`). No retry/timeout on
   backend `fetch` calls — a slow backend blocks the SSR request with no client-side timeout.
   Under a backend slowdown, SSR requests pile up. **Verified.**

### 🔴 Security

1. **Test Stripe secret key sits in `.env.local` on disk.** Not committed (good), but a *secret*
   key (`sk_test_...`) plus a `NEXT_PUBLIC_STRIPE_SECRET_KEY` naming in `.env.local` is dangerous —
   any var prefixed `NEXT_PUBLIC_` is **inlined into the client bundle**. Confirm production never
   sets a secret key under a `NEXT_PUBLIC_` name. **Verified var name; production value unknown.**
2. **CSP allows `'unsafe-inline'` and `'unsafe-eval'` on `script-src`** (`next.config.js`). This
   substantially weakens XSS protection. Common with Next.js inline hydration, but `unsafe-eval`
   should be removed if not required. **Verified.**
3. **Plaintext HTTP origins in CSP & image allowlist** — `http://13.229.135.184` (staging IP) is in
   `connect-src`/`img-src`, and `http://13.229.135.184:8001` + `http://localhost:8001` are in
   `next.config.js` `images.remotePatterns`. These should not ship to production. **Verified.**
4. **Verbose auth logging.** `app/api/auth/login/route.ts` logs backend status **and the full
   response body** (which may include tokens/role) via `console.log`. In Amplify/CloudWatch these
   persist. Remove. **Verified.**
5. **Cookies are `sameSite: 'lax'`, `secure` only in production** — correct, and `token`/
   `refreshToken`/`admin_token` are `httpOnly`. Good. `vendor_plan` is httpOnly + HMAC-signed —
   good.
6. **Dependency scanning:** no `npm audit`, Dependabot, or SAST in CI (`test.yml` runs lint + tsc +
   Playwright only). **Verified.**

### 🟡 Scalability
- SSR runtime is **stateless** (all state in cookies + backend) → horizontally scalable; Amplify
  autoscales the SSR compute. **Good.**
- **All load pushes to the backend.** Every dynamic route proxies to FastAPI, and most handlers use
  `cache: 'no-store'` (`lib/auth.ts`, `adminFetch.ts`). There is **no caching layer in front of the
  backend** here. Under **10×/100× traffic** the frontend scales but the backend + Postgres become
  the bottleneck (**out of scope — assess in `booppa_backend`**).
- **Regional outage:** Amplify is single-region; no multi-region config evident. **Verified gap.**
- **Backend slowdown:** no timeouts (see Reliability #6) → SSR latency tracks backend latency 1:1.

### 🟡 Performance
- Static marketing pages benefit from Next.js SSG/ISR, but most routes are `force-dynamic` +
  `no-store`, so **CDN caching is largely bypassed** for dynamic content. Public marketing pages
  (`/pricing`, `/faq`, etc.) are good CDN candidates and appear cacheable.
- `recharts ^3`, `pdf-lib`, `socket.io-client` are heavy client deps — verify code-splitting/lazy
  loading on the routes that use them. **Not verified.**
- No `resource limits` concept (Amplify-managed). Acceptable.

---

## Phase 3 — Infrastructure Design (recommended, minimal)

The current stack (**AWS Amplify SSR → FastAPI → Postgres/Redis**) is appropriate for the traffic
implied and should be **kept** — do not add complexity. Minimal production topology:

```
Route53 / CloudFront (Amplify-managed CDN + TLS)
        │
   AWS Amplify (Next.js SSR, autoscaled, single region)
        │  rewrites + proxy routes
        ├── api.booppa.io  (FastAPI — separate infra)
        ├── cms.booppa.io  (CMS)
        ├── Stripe (checkout + webhook)
        └── AWS SES (email)
```
Add-ons justified for *this* app: (1) **AWS Secrets Manager / Amplify secret env** for Stripe +
`COOKIE_SIGNING_SECRET` + SES creds; (2) **CloudWatch alarms** on Amplify 5xx + build failures;
(3) an **error monitor** (Sentry) — none exists today.

---

## Phase 4 — CI/CD

Existing (`.github/workflows/test.yml`): checkout → lint → `tsc --noEmit` → boot real Postgres +
Redis + backend (uvicorn) + migrations → build Next → Playwright e2e. **This is a strong,
realistic pipeline** — good coverage for an app of this size. Gaps to add:

| Stage | Status | Recommendation |
|---|---|---|
| Lint / typecheck | ✅ | keep |
| Unit tests | ❌ none | `TESTING.md` confirms e2e-only; acceptable given proxy-thin app |
| Dependency scan | ❌ | add `npm audit --audit-level=high` + Dependabot |
| SAST / secret scan | ❌ | add `gitleaks` (a secret key already lives in `.env.local`) |
| e2e | ✅ | keep (JWT specs auto-skip without secret) |
| Deploy | Amplify auto-deploy on `main` | add a **smoke test** post-deploy hitting `/` + a health route |
| Rollback | Amplify console redeploy of prior build | document it (see Phase 8) |

### 🔴 CI/CD config bug — Amplify env mismatch
`amplify.yml:11` forwards `NEXT_PUBLIC_API_BACKEND`, but **no code reads that name** — code reads
`NEXT_PUBLIC_API_BASE` (`lib/config.ts`, `app/sitemap.ts`). So `apiUrl`/`wsUrl` fall back to the
hardcoded `https://api.booppa.io` default. It *works by luck* because the default equals prod, but
any staging/preview build silently talks to prod. Also missing from the grep: `NEXT_PUBLIC_CMS_BASE`,
`API_URL`, `INTERNAL_API_SECRET`, `AWS_ACCESS_KEY_ID/SECRET`. **Fix the forwarding list.**

---

## Phase 5 — Containerization
**Not containerized, and it doesn't need to be.** Amplify builds and runs the SSR bundle directly.
Introducing Docker/K8s here would be **overengineering** — no evidence of multi-service
orchestration needs in this repo. **Recommendation: stay on Amplify.** If containerization is later
required (e.g. move to ECS/Fargate for cost or portability), a standard Next.js multi-stage
`node:20-alpine` + `output: 'standalone'` build would apply — but there is no current justification.

## Phase 6 — Kubernetes
**Not justified.** Single stateless SSR frontend + managed backend. Amplify (or ECS/Fargate at most)
covers HA and autoscaling. **Do not adopt Kubernetes.**

## Phase 7 — Monitoring & Observability
Current state: **effectively none** — only `console.log/error` to CloudWatch, no structured logs,
no metrics, no tracing, no alerting. Minimal recommended set for this app:
- **Errors:** Sentry (`@sentry/nextjs`) on both SSR + client — captures the currently-swallowed
  webhook/scan failures.
- **Logs:** switch `console.*` to structured JSON; **remove the login body log** (Security #4);
  add a correlation id header forwarded to the backend.
- **Metrics/Alerts (CloudWatch):** Amplify 5xx rate, p95 latency, build/deploy failure, and — once
  it exists — a **Stripe webhook failure** alert. Add **cert expiry** (Amplify-managed but alert
  anyway) and **backend reachability** synthetic.
- **Tracing:** OpenTelemetry is nice-to-have; propagate a trace header to FastAPI so a request can
  be followed across the proxy boundary.

## Phase 8 — Deployment Strategy
- **Current:** Amplify auto-deploys `main` (git-push). Simple, fits the team size.
- **Recommended:** keep **rolling** via Amplify, but gate `main` behind the CI (already runs on PR),
  and enable an **Amplify preview branch** for staging (fix the env-var forwarding first so preview
  hits staging, not prod).
- **Rollback:** Amplify → App → pick the previous successful build → "Redeploy this version".
  Document this in the runbook; it is the only rollback path today and it is **not written down**.

## Phase 9 — Disaster Recovery
Frontend is **stateless** → RPO/RTO for *this repo* ≈ time to rebuild from git (minutes). **No data
to back up here.** The real DR surface (Postgres backups, PITR, Redis, RPO/RTO) lives in
`booppa_backend` — **Insufficient evidence to conclude; must be assessed there before go-live.**
Frontend DR gap: single-region Amplify, no documented rollback runbook.

---

## Phase 10 — Production Deployment Checklist

### 🔴 Critical (must fix before production)
1. **Delete the frontend Stripe webhook** (`app/api/webhooks/stripe/route.ts`). ✅ **Resolved:** the
   backend `app/api/stripe_webhook.py` is authoritative — it has idempotency
   (`ProcessedWebhookEvent` atomic upsert), rollback of the idempotency row on handler failure,
   synchronous subscription activation + plan upgrade + referral loop, and row-locking against
   concurrent checkouts. The Next.js webhook is dead/duplicate code that updates nothing; **remove
   it** so Stripe is only pointed at the backend endpoint and there is no confusion about the source
   of truth.
2. **Fix `triggerScanPipeline` env vars** — `API_URL` / `INTERNAL_API_SECRET` are undefined in prod;
   paid scans silently fail. Add them to `.env.example` + `amplify.yml`, or route through the
   existing `/api/v1` proxy.
3. **Fix `amplify.yml` env forwarding** — forward `NEXT_PUBLIC_API_BASE` (not `_API_BACKEND`),
   `NEXT_PUBLIC_CMS_BASE`, and the AWS SES creds; verify no secret key is exposed under a
   `NEXT_PUBLIC_` name.
4. **Remove staging/plaintext-HTTP origins** from CSP + `images.remotePatterns` (`13.229.135.184`,
   `localhost:8001`) for the prod build.
5. **Remove auth response-body logging** in `app/api/auth/login/route.ts`.
6. **Confirm backend DR (backups/RPO/RTO) and rate limiting** — the real data-loss risks are there.

### 🟠 High priority
7. Add **error monitoring** (Sentry) — the app currently swallows failures into `console.error`.
8. Add a **`/api/health`** route + Amplify post-deploy smoke test.
9. Add **timeouts** to backend `fetch` calls (`lib/auth.ts`, proxy handlers) so a slow backend
   can't hang SSR.
10. Add **dependency + secret scanning** (`npm audit`, Dependabot, gitleaks) to CI.
11. Tighten CSP: drop `'unsafe-eval'` if unused.
12. Wire up **actual rate limiting** with the already-installed `rate-limiter-flexible`, or remove
    the unused dependency.

### 🟢 Nice to have
13. Pin Node 20 in Amplify (matches CI).
14. CDN-cache public marketing pages (currently mostly `no-store`).
15. Lazy-load heavy client deps (`recharts`, `pdf-lib`, `socket.io-client`).
16. Document the Amplify rollback runbook.
17. Multi-region / preview (staging) branch once env forwarding is fixed.

---

## Backend Assessment (`booppa_backend`) — added after review

FastAPI + Celery (fast/heavy queues) + Postgres + Redis, deployed to **AWS ECS Fargate** via an
imperative GitHub Actions pipeline (`.github/workflows/ci.yml`), fronted by a **Cloudflare Tunnel
(no ALB)**. Terraform under `infra/terraform/` is explicitly **drifted and documentation-only** —
CI is the source of truth (`infra/terraform/ecs.tf:1`).

### ✅ Strengths (verified) — this is a mature service
- **Health model done right.** `/health` = cheap liveness; `/ready` = real readiness (DB `SELECT 1`
  + Redis `PING`, returns 503 on failure) — `app/main.py`. Docker `HEALTHCHECK` + ECS gate on it.
- **Graceful shutdown** cancels the WS relay task and disposes the SQLAlchemy engine so pooled
  connections drain on task replacement — `app/main.py` `shutdown_event`.
- **Idempotent, self-healing Stripe fulfillment** — `app/api/stripe_webhook.py` (see Critical #1).
- **Rate limiting** via `slowapi`, keyed on the real client IP through the Cloudflare Tunnel
  (`X-Forwarded-For` left-most, trusted via `--proxy-headers --forwarded-allow-ips "*"`), default
  `200/minute` — `app/core/limiter.py`, `entrypoint.sh`. This **closes frontend audit item #12/#4**.
- **Observability present:** Sentry (inert without DSN), Prometheus `/metrics` **gated by a bearer
  token** (404 when unset — closed by default), OpenTelemetry deps, JSON logging + request-ID
  middleware — `app/main.py`, `requirements.txt`.
- **Container hardening:** non-root user (uid 1001), slim base, Chromium/Playwright deliberately
  kept out of the public image to shrink CVE surface (isolated to the worker image) — `Dockerfile`.
- **Supply-chain gates in CI:** `pip-audit` + `bandit` + **Trivy** image scan (fail on fixable
  HIGH/CRITICAL) before build/push; pinned CVE remediations with rationale in `requirements.txt`.
- **Deploy safety:** OIDC to AWS (no static keys), secrets synced to **Secrets Manager**, migrations
  as a **separate one-off ECS task** (not raced on every replica boot — `entrypoint.sh` gates on
  `RUN_MIGRATIONS_ON_BOOT`), and **automated rollback**: ECS `deploymentCircuitBreaker
  {enable=true,rollback=true}` + `aws ecs wait services-stable` fails the job and reverts on a bad
  deploy (`ci.yml:984,992`). This **closes frontend audit items #8 (smoke/rollback) and #10**.
- **DR is actually configured:** RDS `backup_retention_period` + PITR, `deletion_protection`,
  `skip_final_snapshot=false`, encrypted S3 reports bucket — `infra/terraform/main.tf`.

### 🟠 Backend gaps / risks
1. **Availability SPOFs (documented cost tradeoffs, but real).** RDS `multi_az=false`, ElastiCache
   `num_cache_nodes=1`, and a **single Cloudflare Tunnel with no ALB**. A DB AZ failure, a Redis
   node loss, or a tunnel outage each takes the API down. Fine for "Lean Mode <$80/mo" launch;
   **revisit before the "millions of req/day, HA" target** the brief assumes. RDS Multi-AZ is the
   highest-value first upgrade (data-plane availability, no app change).
2. **`desired_count` likely 1** (`infra/terraform/variables.tf`) — confirm ≥2 app tasks across AZs
   in the live CI task-def, else the app tier is also a SPOF and rolling deploys drop traffic.
3. **Redis has no auth/TLS in compose and is the Celery broker** — verify the ElastiCache SG is
   locked to the task SG (it is `publicly_accessible`-free by subnet, but confirm no `AUTH`/in-transit
   encryption gap for a broker holding task payloads).
4. **Repo hygiene / tech-debt (not a blocker, but a maintainability + supply-chain smell):** **36
   one-off `fix_*.py` / `patch_*.py` / `update_*.py` / `test_*.py` scratch scripts are committed to
   the repo root** (`git ls-files`), plus `celery.log` and `celerybeat-schedule*` binaries on disk.
   These should be deleted or moved to `scripts/` — committed migration/patch scripts that mutate
   code are an audit and safety hazard.
5. **`.trivyignore` carries accepted-risk CVEs** (e.g. `setuptools` `pkg_resources`, a `cryptography`
   GHSA needing a major bump) — reasonable and documented, but track them; they are deferred debt.

### Backend checklist delta
- 🔴 **Confirm app `desired_count ≥ 2`** across AZs before go-live (gap #2).
- 🟠 **Enable RDS Multi-AZ** as the first HA upgrade past Lean Mode (gap #1).
- 🟠 **Verify Redis AUTH + in-transit encryption + SG lockdown** (gap #3).
- 🟢 **Clean the repo root** of the 36 scratch scripts + committed logs/schedule binaries (gap #4).
- 🟢 Add a **single-tunnel failover** plan (second tunnel / ALB) when moving off Lean Mode.

---
*Evidence-based audit of both repos. Remaining unknowns (live ECS `desired_count`, Redis AUTH
config, whether Stripe is still pointed at the dead frontend webhook) are flagged for confirmation
rather than assumed. This document audits and designs only — no infrastructure was changed.*
