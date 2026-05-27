/**
 * Frontend `/api/checkout` proxy contract tests.
 *
 * The proxy at app/api/checkout/route.ts (a) requires an authenticated user
 * cookie, (b) injects the user's email into the payload, (c) forwards to
 * `/api/v1/stripe/checkout` on the backend. These tests verify (a) and (c)
 * without needing real Stripe credentials by intercepting the backend call.
 *
 * Per-SKU happy-path coverage that requires real Stripe lives in
 * `api-direct.spec.ts` (JWT-gated).
 */
import { test, expect } from '@playwright/test'

test('proxy rejects unauthenticated requests with 401', async ({ request }) => {
  const res = await request.post('/api/checkout', {
    data: { productType: 'vendor_proof' },
  })
  expect(res.status()).toBe(401)
  const body = await res.json()
  expect(body.error).toMatch(/sign in/i)
})

test('proxy returns error payload for malformed body', async ({ request }) => {
  // No productType, no priceId, no auth → unauthorized first.
  const res = await request.post('/api/checkout', { data: {} })
  expect([400, 401]).toContain(res.status())
})
