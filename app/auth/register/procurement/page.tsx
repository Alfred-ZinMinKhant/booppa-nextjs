'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Mail, Lock, Building2, AlertCircle, Loader2, Factory } from 'lucide-react'
import HardenedClickwrap from '@/components/legal/HardenedClickwrap'
import { INDUSTRY_OPTIONS } from '@/lib/industries'
import { config } from '@/lib/config'

const FREE_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'yahoo.co.uk', 'hotmail.com', 'outlook.com',
  'live.com', 'aol.com', 'icloud.com', 'me.com', 'mail.com',
  'protonmail.com', 'proton.me', 'zoho.com', 'yandex.com',
  'gmx.com', 'gmx.net', 'tutanota.com', 'fastmail.com',
])

export default function ProcurementRegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('')
  const [uen, setUen] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [consentValid, setConsentValid] = useState(false)

  function validateEmail(value: string): string | null {
    const domain = value.split('@')[1]?.toLowerCase()
    if (!domain) return 'Please enter a valid email address'
    if (FREE_DOMAINS.has(domain)) {
      return 'Please use your company email. Free email providers (Gmail, Yahoo, etc.) are not accepted for procurement accounts.'
    }
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const emailErr = validateEmail(email)
    if (emailErr) {
      setError(emailErr)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password.length > 20) {
      setError('Password must be 20 characters or fewer')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register/procurement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          company,
          uen: uen || undefined,
          industry: industry || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        const detail: string = typeof data.detail === 'string' ? data.detail : 'Registration failed'
        if (detail.toLowerCase().includes('72 bytes') || detail.toLowerCase().includes('truncate')) {
          setError('Registration failed — please try a different password')
        } else {
          setError(detail)
        }
        return
      }

      // Log hardened consent record (fire-and-forget)
      fetch(`${config.apiUrl}/api/v1/legal/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: email, legal_version: 'v17_Hardened' }),
      }).catch(() => {})

      router.push('/procurement/dashboard')
      router.refresh()
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">BOOPPA</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-white mb-1">Create your procurement account</h1>
          <p className="text-neutral-400 text-sm mb-6">
            Verify vendors, reduce risk, and evaluate faster
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Organisation name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Ministry of Health"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                UEN (optional)
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  value={uen}
                  onChange={e => setUen(e.target.value)}
                  placeholder="e.g. 200312345A"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Industry
              </label>
              <div className="relative">
                <Factory className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 appearance-none"
                >
                  <option value="">Select your industry</option>
                  {INDUSTRY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Company email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.gov.sg"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Free email providers (Gmail, Yahoo, etc.) are not accepted
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="8-20 characters"
                  maxLength={20}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-1 pb-1 border-t border-neutral-800">
              <HardenedClickwrap onValidityChange={setConsentValid} variant="dark" />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !consentValid}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Creating account...' : 'Create procurement account'}
            </button>
          </form>

          <p className="text-center text-neutral-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-center text-neutral-500 text-xs mt-2">
            Are you a vendor?{' '}
            <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300">
              Register as a vendor instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
