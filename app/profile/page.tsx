'use client'

import { useState, useEffect, FormEvent } from 'react'
import { User, Mail, Building2, Hash, Save, Loader2, CheckCircle, AlertCircle, Factory, Globe } from 'lucide-react'
import { INDUSTRY_OPTIONS } from '@/lib/industries'

interface Profile {
  id: string
  email: string
  full_name: string | null
  company: string | null
  website: string | null
  industry: string | null
  role: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setProfile(data)
          setFullName(data.full_name || '')
          setEmail(data.email || '')
          setCompany(data.company || '')
          setWebsite(data.website || '')
          setIndustry(data.industry || '')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          full_name: fullName, 
          email, 
          company, 
          website, 
          industry: industry || undefined 
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Save failed')
      } else {
        setSuccess('Profile updated successfully.')
        setProfile(data)
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  const isProcurement = profile?.role === 'PROCUREMENT'

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="border-b border-neutral-800 pb-6">
          <h1 className="text-2xl font-bold text-white">
            {isProcurement ? 'Procurement Profile' : 'Vendor Profile'}
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Manage your account details and business information</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">

          {/* Read-only system fields */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                Account ID
              </label>
              <div className="flex items-center gap-2 bg-neutral-800/50 rounded-lg px-4 py-2.5 border border-neutral-800">
                <Hash className="h-3.5 w-3.5 text-neutral-500 flex-shrink-0" />
                <span className="text-neutral-500 text-xs font-mono truncate">{profile?.id}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <div className="flex items-center gap-2 bg-neutral-800/50 rounded-lg px-4 py-2.5 border border-neutral-800">
                <User className="h-3.5 w-3.5 text-neutral-500 flex-shrink-0" />
                <span className="text-neutral-500 text-xs font-medium uppercase tracking-wide">{profile?.role}</span>
              </div>
            </div>
          </div>

          {/* Editable form */}
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Acme Pte Ltd"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Company Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://acme.com"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {!isProcurement && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Industry
                </label>
                <div className="relative">
                  <Factory className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 appearance-none transition-all"
                  >
                    <option value="">Select your industry</option>
                    {INDUSTRY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-4 h-4 border-b-2 border-r-2 border-neutral-500 rotate-45 -translate-y-1" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                {success}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-8 rounded-lg transition-all text-sm w-full md:w-auto"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving Changes…' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
