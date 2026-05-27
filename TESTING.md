# Frontend Testing

Playwright end-to-end tests for the checkout funnel. The canonical setup doc
is in the sibling repo at `booppa_backend/TESTING.md` — read that first for
the full list of GitHub Actions secrets. This file is a short pointer.

## Run locally

```bash
npm install --legacy-peer-deps
npm run test:e2e:install      # one-time: download Chromium
npm run build && npm start &  # Playwright reuses an existing dev server
npm run test:e2e              # all specs
npm run test:e2e:ui           # interactive UI mode
```

## Spec layout

| File | What it covers | Needs JWT? |
|---|---|---|
| `e2e/flows/pricing-page.spec.ts` | Tabs render, unauth → /login bounce | no |
| `e2e/flows/checkout-proxy.spec.ts` | `/api/checkout` rejects unauth requests | no |
| `e2e/flows/bundle-modal.spec.ts` | Bundle modal validates + posts the right payload | no (mocks `/api/auth/me`) |
| `e2e/flows/rfp-intake.spec.ts` | Post-checkout intake page renders | no |
| `e2e/flows/api-direct.spec.ts` | Per-SKU happy path through `/api/checkout` → Stripe URL | **yes** |
| `e2e/flows/smoke-full-flow.spec.ts` | One SKU end-to-end: button → Stripe Checkout → `/thank-you` | **yes** |

JWT-gated specs auto-skip if `PLAYWRIGHT_TEST_JWT` is not set, so the suite
still passes locally without credentials.

## CI

`.github/workflows/test.yml` boots a sibling `booppa_backend` (needs
`GH_PAT_BACKEND_READ` secret) with Postgres + Redis + uvicorn, then runs
Playwright against `http://localhost:3000`. See
`booppa_backend/TESTING.md#github-actions-secrets` for the full secrets list.
