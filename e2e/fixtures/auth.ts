/**
 * Helpers for Playwright tests to fake an authenticated session.
 *
 * The pricing page calls `/api/auth/me` and `/api/vendor/dashboard-alerts` on
 * mount, then gates the Buy buttons on `loggedIn`. We intercept those two
 * endpoints with canned responses so tests don't depend on the backend or on a
 * real Stripe-test user record.
 */
import type { Page } from '@playwright/test'

export interface FakeUser {
  email?: string
  company?: string
  website?: string
}

const DEFAULT_USER: Required<FakeUser> = {
  email: 'qa+playwright@booppa.io',
  company: 'Playwright QA',
  website: 'https://example.test',
}

export async function mockAuthAsLoggedIn(page: Page, user: FakeUser = {}): Promise<void> {
  const merged = { ...DEFAULT_USER, ...user }

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(merged),
    })
  })

  await page.route('**/api/vendor/dashboard-alerts*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ activeSubscriptions: [] }),
    })
  })

  await page.route('**/api/platform-stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ vendorsIndexed: 42, verifiedEntities: 7, openTenders: 11 }),
    })
  })
}
