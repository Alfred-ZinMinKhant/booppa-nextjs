'use client'

import { useState } from 'react'
import Link from 'next/link'
import { config } from '@/lib/config'

interface Finding {
  check_id: string
  title: string
  severity: string
  category: string
  description: string
  legislation: string
  action: string
}

interface LockedFinding {
  severity: string
  category: string
  title: string
}

interface ScanResult {
  website_url: string
  score: number
  risk_level: string
  total_findings: number
  free_finding: Finding | null
  locked_findings: LockedFinding[]
  unlock_cta: { product_type: string; price: string; description: string }
}

function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!url) return url
  url = url.replace(/^\/+/, '')
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url
  return url
}

const severityColor: Record<string, string> = {
  CRITICAL: 'bg-red-600',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-blue-400',
}

const severityBorder: Record<string, string> = {
  CRITICAL: 'border-red-200 bg-red-50',
  HIGH: 'border-orange-200 bg-orange-50',
  MEDIUM: 'border-yellow-200 bg-yellow-50',
  LOW: 'border-blue-200 bg-blue-50',
}

export default function PDPAFreeScan() {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ website: '', email: '', company: '' })
  const [unlocking, setUnlocking] = useState(false)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStep('loading')

    const url = normalizeUrl(formData.website)
    if (!url) {
      setError('Please enter a website URL')
      setStep('form')
      return
    }

    try {
      const res = await fetch(`${config.apiUrl}/api/v1/pdpa/free-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_url: url,
          email: formData.email || null,
          company_name: formData.company || null,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Scan failed')
      }

      const data: ScanResult = await res.json()
      setResult(data)
      setStep('results')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setStep('form')
    }
  }

  const handleUnlock = async () => {
    setUnlocking(true)
    try {
      const website = normalizeUrl(formData.website)
      const email = formData.email || ''
      const company = formData.company || 'Quick Scan'

      // Create report
      const reportRes = await fetch(`${config.apiUrl}/api/reports/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework: 'pdpa_quick_scan',
          company_name: company,
          website,
          assessment_data: { contact_email: email },
          contact_email: email,
        }),
      })
      if (!reportRes.ok) throw new Error('Failed to create report')
      const { report_id } = await reportRes.json()

      // Stripe checkout
      const checkoutRes = await fetch(`${config.apiUrl}/api/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'pdpa_quick_scan',
          reportId: report_id,
          customerEmail: email,
        }),
      })
      if (!checkoutRes.ok) throw new Error('Failed to start checkout')
      const { url } = await checkoutRes.json()
      window.location.href = url
    } catch {
      setUnlocking(false)
      setError('Could not start checkout. Please try again.')
    }
  }

  // Score gauge arc
  const renderGauge = (score: number, riskLevel: string) => {
    const color = score >= 60 ? '#dc2626' : score >= 30 ? '#f59e0b' : '#10b981'
    const angle = (score / 100) * 180
    const rad = (angle * Math.PI) / 180
    const x = 50 + 40 * Math.cos(Math.PI - rad)
    const y = 50 - 40 * Math.sin(Math.PI - rad)
    const largeArc = angle > 180 ? 1 : 0

    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 100 60" className="w-48 h-auto">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
          <path d={`M 10 50 A 40 40 0 ${largeArc} 1 ${x} ${y}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
          <text x="50" y="45" textAnchor="middle" className="text-2xl font-black" fill={color}>{score}</text>
        </svg>
        <span className="text-lg font-bold mt-1" style={{ color }}>{riskLevel}</span>
      </div>
    )
  }

  return (
    <main className="bg-white min-h-screen">
      <section className="py-24 px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-[#10b981] mb-3">Free Tool</p>
            <h1 className="text-4xl lg:text-5xl font-black mb-4 text-[#0f172a]">PDPA Quick Check</h1>
            <p className="text-lg text-[#64748b] max-w-xl mx-auto">
              Instant security header scan for PDPA compliance indicators. No payment required.
            </p>
          </div>

          {/* Form */}
          {step === 'form' && (
            <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-xl border border-[#e2e8f0]">
              <form onSubmit={handleScan} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#1e293b] mb-2" htmlFor="website">Website URL *</label>
                  <input
                    type="text"
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData((d) => ({ ...d, website: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none"
                    placeholder="yourcompany.sg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1e293b] mb-2" htmlFor="email">Email (optional)</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none"
                    placeholder="you@company.sg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1e293b] mb-2" htmlFor="company">Company Name (optional)</label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData((d) => ({ ...d, company: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none"
                    placeholder="Your Company Pte Ltd"
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" className="btn btn-primary w-full py-4 text-lg font-black shadow-lg">
                  Run Free Scan
                </button>
                <p className="text-center text-[#94a3b8] text-xs">
                  Checks HTTPS, security headers, cookie consent, and privacy policy presence
                </p>
              </form>
            </div>
          )}

          {/* Loading */}
          {step === 'loading' && (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mb-6" />
              <p className="text-lg text-[#64748b]">Scanning {formData.website}...</p>
              <p className="text-sm text-[#94a3b8] mt-2">Checking security headers and compliance indicators</p>
            </div>
          )}

          {/* Results */}
          {step === 'results' && result && (
            <div className="space-y-6">
              {/* Score card */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#e2e8f0] text-center">
                {renderGauge(result.score, result.risk_level)}
                <p className="text-sm text-[#64748b] mt-4">
                  {result.total_findings} issue{result.total_findings !== 1 ? 's' : ''} found on <strong>{result.website_url}</strong>
                </p>
                <div className="flex justify-center gap-3 mt-4">
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => {
                    const count = (result.free_finding?.severity === sev ? 1 : 0) +
                      result.locked_findings.filter((f) => f.severity === sev).length
                    if (!count) return null
                    return (
                      <span key={sev} className={`px-3 py-1 rounded-full text-white text-xs font-bold ${severityColor[sev]}`}>
                        {count} {sev}
                      </span>
                    )
                  })}
                </div>
              </div>

              {/* Free finding */}
              {result.free_finding && (
                <div className={`p-6 rounded-2xl border-2 ${severityBorder[result.free_finding.severity]}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-0.5 rounded text-white text-xs font-bold ${severityColor[result.free_finding.severity]}`}>
                      {result.free_finding.severity}
                    </span>
                    <span className="text-xs text-[#94a3b8]">{result.free_finding.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2">{result.free_finding.title}</h3>
                  <p className="text-sm text-[#475569] mb-4">{result.free_finding.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/60 p-3 rounded-lg">
                      <p className="font-semibold text-[#0f172a] text-xs mb-1">LEGISLATION</p>
                      <p className="text-[#64748b]">{result.free_finding.legislation}</p>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg">
                      <p className="font-semibold text-[#0f172a] text-xs mb-1">RECOMMENDED ACTION</p>
                      <p className="text-[#64748b]">{result.free_finding.action}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Locked findings */}
              {result.locked_findings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#94a3b8] uppercase tracking-wider">
                    {result.locked_findings.length} More Finding{result.locked_findings.length > 1 ? 's' : ''} — Unlock Full Report
                  </h3>
                  {result.locked_findings.map((f, i) => (
                    <div key={`${f.category}-${i}`} className="relative p-5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] overflow-hidden">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-white text-xs font-bold ${severityColor[f.severity]}`}>
                          {f.severity}
                        </span>
                        <span className="text-sm font-medium text-[#475569]">{f.title}</span>
                      </div>
                      <div className="mt-3 h-8 bg-gradient-to-b from-[#f8fafc]/0 to-[#f8fafc] relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-[#94a3b8] flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            Details locked
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Unlock CTA */}
              <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 rounded-3xl text-center">
                <h3 className="text-xl font-bold text-white mb-2">Unlock Full AI-Powered Report</h3>
                <p className="text-[#94a3b8] text-sm mb-6 max-w-md mx-auto">
                  Deep AI analysis across 8 PDPA obligations, blockchain-anchored evidence, PDF report, and remediation steps
                </p>
                <button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-black rounded-xl text-lg transition disabled:opacity-50"
                >
                  {unlocking ? 'Redirecting to checkout...' : `Unlock Full Report — ${result.unlock_cta.price}`}
                </button>
                <p className="text-[#64748b] text-xs mt-4">Secure payment via Stripe. Report delivered in ~15 minutes.</p>
              </div>

              {/* Scan again */}
              <div className="text-center">
                <button
                  onClick={() => { setStep('form'); setResult(null) }}
                  className="text-[#10b981] text-sm font-medium hover:underline"
                >
                  Scan a different website
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
