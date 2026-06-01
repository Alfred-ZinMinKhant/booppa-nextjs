import { test, expect } from '@playwright/test'
import { mockAuthAsLoggedIn } from '../fixtures/auth'

test.describe('Pricing page', () => {
  test('renders all three audience tabs', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.getByRole('button', { name: /For Vendors/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /For Buyers/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /For Enterprise/i })).toBeVisible()
  })

  test('vendor tab shows the Vendor Active CTA', async ({ page }) => {
    await mockAuthAsLoggedIn(page)
    await page.goto('/pricing')
    await page.getByRole('button', { name: /For Vendors/i }).click()
    // The Vendor Active monthly card should be on the vendors tab.
    await expect(page.locator('text=/Vendor Active/i').first()).toBeVisible()
  })

  test('enterprise tab shows Enterprise CTA', async ({ page }) => {
    await mockAuthAsLoggedIn(page)
    await page.goto('/pricing')
    await page.getByRole('button', { name: /For Enterprise/i }).click()
    await expect(page.locator('text=/Enterprise/i').first()).toBeVisible()
  })

  test('buyer tab shows new three-tier ladder', async ({ page }) => {
    await mockAuthAsLoggedIn(page)
    await page.goto('/pricing')
    await page.getByRole('button', { name: /For Buyers/i }).click()
    await expect(page.locator('text=/Buyer Starter/i')).toBeVisible()
    await expect(page.locator('text=/Buyer Pro/i')).toBeVisible()
    await expect(page.locator('text=/Buyer Enterprise/i')).toBeVisible()
    // The deprecated tier names should be gone.
    await expect(page.locator('text=/Evaluate Your Suppliers/i')).toHaveCount(0)
    await expect(page.locator('text=/Verify Supplier Evidence/i')).toHaveCount(0)
    await expect(page.locator('text=/Notana Document/i')).toHaveCount(0)
  })

  test('buyer tab no longer bundles notarisations into base tiers', async ({ page }) => {
    await mockAuthAsLoggedIn(page)
    await page.goto('/pricing')
    await page.getByRole('button', { name: /For Buyers/i }).click()
    // No "200 notarizations/month" or "5,000 notarizations/month" in the buyer tier cards.
    await expect(page.locator('text=/200 notarizations\\/month/i')).toHaveCount(0)
    await expect(page.locator('text=/5,?000 notarizations\\/month/i')).toHaveCount(0)
    // Buyer tier feature lists must surface scan-based progression.
    await expect(page.locator('text=/10 vendor compliance scans/i')).toBeVisible()
    await expect(page.locator('text=/50 vendor compliance scans/i')).toBeVisible()
    await expect(page.locator('text=/250 vendor compliance scans/i')).toBeVisible()
  })

  test('unauthenticated buy click bounces to /login', async ({ page }) => {
    // No mockAuth → loggedIn stays false.
    await page.route('**/api/auth/me', async (r) => r.fulfill({ status: 401, body: '{}' }))
    await page.route('**/api/vendor/dashboard-alerts*', async (r) =>
      r.fulfill({ status: 401, body: '{}' })
    )
    await page.goto('/pricing')
    // Find the PDPA Quick Scan button. Looser locator because button text varies.
    const candidate = page.locator('button', { hasText: /Scan|Buy|Get|Start/i }).first()
    await candidate.click()
    await page.waitForURL(/\/login(\?|$)/)
  })
})
