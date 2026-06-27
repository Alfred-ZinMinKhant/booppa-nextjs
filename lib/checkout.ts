/**
 * Shared Stripe-checkout launcher.
 *
 * UI → POST /api/checkout (proxy, requires sign-in) → backend
 * /api/v1/stripe/checkout → Stripe Checkout Session URL → redirect.
 *
 * Extracted from app/pricing/page.tsx so the /pricing page and the dedicated
 * /csp landing page share a single implementation.
 */
export async function startCheckout(
  productType: string,
  extraBody?: Record<string, string>,
): Promise<void> {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productType, ...extraBody }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else if (res.status === 409) {
      // Already an active subscription for this product.
      window.location.href = "/vendor/dashboard";
    } else if (res.status === 422 && /website/i.test(data.error || "")) {
      const website = prompt(
        "We need your website URL to run your first scan.\n\nEnter your website (e.g. https://example.com):",
      );
      if (website?.trim()) {
        await startCheckout(productType, { ...(extraBody || {}), website: website.trim() });
      }
    } else if (res.status === 422 && /company/i.test(data.error || "")) {
      const company = prompt(
        "We need your company name to generate your bundle reports.\n\nEnter your company name:",
      );
      if (company?.trim()) {
        await startCheckout(productType, { ...(extraBody || {}), company_name: company.trim() });
      }
    } else {
      alert(data.error || "Unable to start checkout. Please try again.");
    }
  } catch {
    alert("Unable to start checkout. Please try again.");
  }
}
