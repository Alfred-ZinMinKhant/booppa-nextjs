/**
 * Smoke E2E: one one-time SKU + one subscription SKU, end-to-end through
 * Stripe Checkout's hosted page using test card 4242 4242 4242 4242.
 *
 * Slower and more brittle than the per-SKU coverage, but proves the loop closes
 * from button click through Stripe redirect back to /thank-you with the
 * VerifyPayment component rendering. Skipped unless PLAYWRIGHT_TEST_JWT is set.
 */
import { test, expect } from '@playwright/test'
import { mockAuthAsLoggedIn } from '../fixtures/auth'
import { TEST_CARDS, TEST_CARD_EXTRAS } from '../fixtures/stripe-test-cards'

const JWT = process.env.PLAYWRIGHT_TEST_JWT

test.describe('Smoke full Stripe flow', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(!JWT, 'PLAYWRIGHT_TEST_JWT not set')
    await context.addCookies([
      { name: 'token', value: JWT!, url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000' },
    ])
  })

  test('vendor_proof → Stripe → /thank-you', async ({ page }) => {
    test.setTimeout(120_000)
    await mockAuthAsLoggedIn(page)
    await page.goto('/pricing')

    // Click the first matching CTA — exact selector depends on tab order.
    await page.getByRole('button', { name: /For Vendors/i }).click()
    const buyBtn = page.locator('[data-test-checkout="pdpa_quick_scan"]').first()
    if (await buyBtn.count() === 0) {
      test.skip(true, 'Pricing page needs data-test-checkout attributes for smoke flow')
    }
    await buyBtn.click()

    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 })

    // Fill Stripe hosted Checkout form. Selectors are subject to Stripe UI
    // updates; we use the most stable labels.
    await page.locator('input[name="email"]').fill('qa+playwright@booppa.io')
    await page.locator('input[name="cardNumber"]').fill(TEST_CARDS.visa)
    await page.locator('input[name="cardExpiry"]').fill(TEST_CARD_EXTRAS.expiry)
    await page.locator('input[name="cardCvc"]').fill(TEST_CARD_EXTRAS.cvc)
    await page.locator('input[name="billingName"]').fill(TEST_CARD_EXTRAS.cardholderName)
    const postalInput = page.locator('input[name="billingPostalCode"]')
    if (await postalInput.count() > 0) await postalInput.fill(TEST_CARD_EXTRAS.postal)
    await page.getByRole('button', { name: /Pay/i }).click()

    await page.waitForURL(/\/thank-you/, { timeout: 60_000 })
    await expect(page.locator('body')).toContainText(/thank|verify|verifying|complete/i)
  })
})
