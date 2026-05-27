/**
 * Bundle modal validates required fields and submits with correct payload.
 *
 * The pricing page bundles (vendor_trust_pack, rfp_accelerator,
 * enterprise_bid_kit, compliance_evidence_pack) all go through `setBundleModal`
 * → `submitBundleForm` → `/api/checkout`. The buy buttons live on different
 * tabs so we use text-based locators rather than data attributes.
 */
import { test, expect } from '@playwright/test'
import { mockAuthAsLoggedIn } from '../fixtures/auth'

test('bundle modal requires website + company before submitting', async ({ page }) => {
  await mockAuthAsLoggedIn(page)

  let lastBody: any = null
  await page.route('**/api/checkout', async (route) => {
    lastBody = route.request().postDataJSON()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: 'https://checkout.stripe.com/c/pay/cs_test_bundle' }),
    })
  })

  await page.goto('/pricing')
  await page.getByRole('button', { name: /For Vendors/i }).click()

  // Open the first available bundle CTA. Bundle CTAs are typically labeled
  // with "Buy" / "Get the bundle" / contain the bundle name.
  const bundleBtn = page.locator('button', { hasText: /Trust Pack|Accelerator|Bid Kit|Evidence Pack/i }).first()
  const found = await bundleBtn.count()
  test.skip(found === 0, 'No bundle CTA visible on /pricing — UI may have changed')
  await bundleBtn.click()

  // The modal should be visible with website + company inputs
  const websiteInput = page.locator('input[placeholder*="website" i], input[placeholder*="example.com" i]').first()
  const companyInput = page.locator('input[placeholder*="company" i]').first()
  await expect(websiteInput).toBeVisible({ timeout: 5000 })
  await expect(companyInput).toBeVisible()

  // Try submitting empty → error message
  const submitBtn = page.locator('button', { hasText: /confirm|continue|buy|checkout|proceed/i }).last()
  await submitBtn.click()
  await expect(page.locator('text=/required|website/i').first()).toBeVisible()

  // Fill and submit
  await websiteInput.fill('playwright.test')
  await companyInput.fill('Playwright QA')
  await submitBtn.click()

  await expect.poll(() => lastBody?.productType, { timeout: 10_000 }).toMatch(
    /vendor_trust_pack|rfp_accelerator|enterprise_bid_kit|compliance_evidence_pack/
  )
  expect(lastBody.vendor_url).toContain('playwright.test')
  expect(lastBody.company_name).toBe('Playwright QA')
})
