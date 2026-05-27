/**
 * Per-SKU coverage via direct POST to /api/checkout — bypasses the UI button
 * selectors entirely. Works for every SKU regardless of which tab/modal the
 * pricing page renders the button on.
 *
 * Authenticated using the Next.js `token` cookie. The CI workflow seeds a test
 * user and exports a valid JWT into PLAYWRIGHT_TEST_JWT; locally without that,
 * these tests are skipped.
 */
import { test, expect } from '@playwright/test'
import { ALL_SKUS, BUNDLES } from '../fixtures/products'

const JWT = process.env.PLAYWRIGHT_TEST_JWT
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BACKEND ?? 'http://localhost:8000'

test.beforeEach(async ({ context }) => {
  test.skip(!JWT, 'PLAYWRIGHT_TEST_JWT not set; skipping live API-direct tests')
  await context.addCookies([
    {
      name: 'token',
      value: JWT!,
      url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    },
  ])
})

const BUNDLE_TYPES = new Set(BUNDLES.map((b) => b.productType))

for (const sku of ALL_SKUS) {
  test(`POST /api/checkout returns Stripe URL for ${sku.productType}`, async ({ request }) => {
    const body: Record<string, string> = {
      productType: sku.productType,
      website: 'https://playwright.test',
      company_name: 'Playwright QA',
    }
    if (sku.rfpDescription) body.rfp_description = sku.rfpDescription
    if (BUNDLE_TYPES.has(sku.productType)) {
      body.vendor_url = 'https://playwright.test'
    }

    const res = await request.post('/api/checkout', { data: body })
    expect(
      res.ok(),
      `${sku.productType} returned ${res.status()}: ${await res.text()}`
    ).toBeTruthy()
    const data = await res.json()
    expect(data.url).toMatch(/^https:\/\/checkout\.stripe\.com\//)
  })
}
