"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { config } from "@/lib/config"
import HardenedClickwrap from "@/components/legal/HardenedClickwrap"
import Link from "next/link"

function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!url) return url
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url
  }
  return url
}

function VendorProofContent() {
  const searchParams = useSearchParams()
  const [website, setWebsite] = useState(searchParams.get("website") || "")
  const [company, setCompany] = useState(searchParams.get("company") || "")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [consentValid, setConsentValid] = useState(false)
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    fetch(`${config.apiUrl}/api/v1/auth/me`, { credentials: "include" })
      .then(r => setAuthed(r.ok))
      .catch(() => setAuthed(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const normalizedUrl = normalizeUrl(website)
    if (!normalizedUrl) {
      setError("Website URL is required.")
      return
    }
    if (!company.trim()) {
      setError("Company name is required.")
      return
    }

    try {
      setLoading(true)

      // Step 1: Create Report record pre-payment
      const reportRes = await fetch(`${config.apiUrl}/api/reports/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          framework: "vendor_proof",
          company_name: company.trim(),
          website: normalizedUrl,
          assessment_data: { contact_email: email },
          contact_email: email,
        }),
      })

      if (!reportRes.ok) {
        const text = await reportRes.text()
        throw new Error(`Failed to create report: ${text}`)
      }

      const { report_id } = await reportRes.json()

      // Step 2: Start Stripe checkout
      const checkoutRes = await fetch(`${config.apiUrl}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: "vendor_proof",
          reportId: report_id,
          prefill_email: email,
        }),
      })

      if (!checkoutRes.ok) {
        const text = await checkoutRes.text()
        throw new Error(`Failed to start checkout: ${text}`)
      }

      const { url } = await checkoutRes.json()
      window.location.href = url
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Auth gate — show login prompt before payment form
  if (authed === false) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Sign in to get Vendor Proof</h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Your Vendor Proof certificate is tied to your company account. Sign in or create a free account first, then complete your purchase.
            </p>
            <div className="space-y-3">
              <Link
                href={`/login?from=/vendor-proof`}
                className="block w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition text-sm"
              >
                Sign In
              </Link>
              <Link
                href={`/auth/register?product=vendor_proof`}
                className="block w-full py-3 border border-gray-700 text-white hover:bg-white/5 font-semibold rounded-xl transition text-sm"
              >
                Create Free Account
              </Link>
            </div>
            <p className="text-gray-600 text-xs mt-6">Free account · No credit card needed to register</p>
          </div>
        </div>
      </main>
    )
  }

  if (authed === null) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-gray-500 text-sm">Loading…</div>
      </main>
    )
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Vendor Proof</h1>
          <p className="text-gray-400">
            AI-powered trust verification with blockchain-notarized certificate. Get a shareable
            PDF proof of your security posture for enterprise procurement — SGD 149.
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Pte Ltd"
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-booppa-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Company Website <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="acme.com.sg"
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-booppa-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email (for delivery)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-booppa-blue"
              />
            </div>

            <div className="pt-2 pb-1 border-t border-gray-700">
              <HardenedClickwrap onValidityChange={setConsentValid} variant="dark" />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !consentValid}
              className="w-full bg-booppa-blue text-white font-semibold py-3 rounded-lg hover:bg-booppa-blue/80 transition disabled:opacity-50"
            >
              {loading ? "Setting up..." : "Get Vendor Proof — S$149"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <div className="font-medium text-gray-300 mb-1">What you get</div>
              <ul className="space-y-1">
                <li>AI security scan</li>
                <li>Trust score report</li>
                <li>Blockchain-notarized PDF</li>
                <li>QR verification badge</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-gray-300 mb-1">Delivered to</div>
              <ul className="space-y-1">
                <li>Your email inbox</li>
                <li>Vendor dashboard</li>
                <li>Public verify page</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function VendorProofPage() {
  return (
    <Suspense fallback={
      <main className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-gray-400">Loading...</div>
      </main>
    }>
      <VendorProofContent />
    </Suspense>
  )
}
